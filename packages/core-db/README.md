# core-db

Portable SQL migrations for the CORE infrastructure (audit, teams, demo anti-abuse).
Apply these to any new Supabase project to bootstrap the system.

## Prerequisites

- Supabase project with `service_role` key
- `public.is_admin()` function must exist (used in audit_log RLS)
- `public.profiles` table must exist with at least `(id UUID PRIMARY KEY)` — migration 030 adds all required columns
- `public.objects`, `public.object_expenses`, `public.object_extras`, `public.object_payments` tables must exist before migration 002

## Migrations

Apply **in order**: `001-003` → `010-011` → `030` → `040-041`.

### Audit module (001-003)

| #   | File                                         | Description                                                        |
| --- | -------------------------------------------- | ------------------------------------------------------------------ |
| 001 | `001_create_audit_log.sql`                   | `audit_log` table, indexes, RLS (service_role + admin read)        |
| 002 | `002_add_audit_to_soft_delete.sql`           | `audit_log_insert()` helper, audit in `soft_delete_object/restore` |
| 003 | `003_create_cleanup_audit_log_retention.sql` | `cleanup_audit_log_retention()` function (24-month retention)      |

### Teams module (010-011)

| #   | File                                         | Description                                                          |
| --- | -------------------------------------------- | -------------------------------------------------------------------- |
| 010 | `010_create_team_tables.sql`                 | `teams`, `team_members`, `team_invitations` tables, RLS, triggers, view |
| 011 | `011_create_team_helper_functions.sql`       | `get_user_team_id()`, `is_team_owner()` — used in RLS policies       |

**Dependencies for Teams:**
- `auth.users` — referenced by foreign keys and triggers
- `public.profiles` — referenced by `user_team_view`, `update_team_max_members` trigger (fires on `profiles.subscription_plan` change)
- 010 includes an initial data migration that backfills teams for existing `profiles` rows
- 011 helper functions are used in RLS policies on `objects` and `teams` tables (applied via remote_schema)

### Profiles module (030)

| #   | File                                         | Description                                                        |
| --- | -------------------------------------------- | ------------------------------------------------------------------ |
| 030 | `030_profiles_core_fields.sql`               | All `profiles` columns required by subscription engine, demo, VIP, referral, email tracking |

**What it does:**
- `ADD COLUMN IF NOT EXISTS` for every column referenced by `handle_new_user()`, `getUserTier()`, webhook, cron, and API routes
- Grouped by purpose: identity, account numbering, invoice/business, subscription engine, Stripe integration, VIP, demo, referral, email tracking (demo + subscription + free-month), phone verification, preferred language, timestamps
- Creates indexes: `referral_code`, `referred_by`, `demo_expiring` (partial)
- Safe to re-run (idempotent)

**Columns (40):** identity (5) · account/role (2) · invoice/business (7) · subscription engine (7 incl. legacy `subscription_tier`) · Stripe (2: `stripe_customer_id`, `stripe_subscription_id`) · VIP (3) · demo (3) · referral (4) · email tracking (6 incl. `free_month_*`) · phone (1) · language (1: `preferred_language`) · timestamps (2)

**Prerequisite:** `public.profiles` table must already exist with at least `(id UUID PRIMARY KEY, email TEXT)`.

### Demo anti-abuse module (040-041)

| #   | File                                         | Description                                                                 |
| --- | -------------------------------------------- | --------------------------------------------------------------------------- |
| 040 | `040_used_emails.sql`                        | `used_emails` table, `handle_new_user()` trigger, `mark_email_as_purchased()` trigger |
| 041 | `041_demo_once_rule.sql`                     | Strict once-per-email rule: `email_normalized` column, updated `handle_new_user()` |

**Rule:** Demo 48 hours is given **only once per email** (case-insensitive, normalized via `LOWER(TRIM(email))`). Re-registration with the same email sets `subscription_status = 'read-only'` immediately, regardless of purchase history.

**Enforcement:**
- DB trigger `on_auth_user_created` fires `handle_new_user()` on every new `auth.users` row
- `used_emails` table with `UNIQUE INDEX` on `email_normalized` prevents duplicates
- Lookup: `SELECT * FROM used_emails WHERE email_normalized = LOWER(TRIM(NEW.email))`
- If row exists → `demo_expires := NOW() - INTERVAL '1 second'` → status becomes `read-only`
- If no row → `demo_expires := NOW() + INTERVAL '48 hours'` → status becomes `demo`

**Dependencies:**
- `auth.users` — trigger source
- `public.profiles` — INSERT target; **must have all columns from 030** (`demo_expires_at`, `demo_started_at`, `subscription_status`, `contact_consent`, `account_number`, `referral_code`, `referred_by`, etc.)
- 040 includes a data backfill from existing `profiles` rows into `used_emails`
- 041 supersedes the `handle_new_user()` from 040 (apply both in order)

**RLS:** `used_emails` has no explicit RLS policies — access is through `SECURITY DEFINER` trigger functions only. The table is not directly accessible to authenticated users.

## How to apply

### Option A: Supabase SQL Editor

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run each migration file in order (001-003, then 010-011, then 030, then 040-041)

### Option B: psql

```bash
# From the repo root, with SUPABASE_DB_URL set:
psql "$SUPABASE_DB_URL" -f packages/core-db/migrations/001_create_audit_log.sql
psql "$SUPABASE_DB_URL" -f packages/core-db/migrations/002_add_audit_to_soft_delete.sql
psql "$SUPABASE_DB_URL" -f packages/core-db/migrations/003_create_cleanup_audit_log_retention.sql
psql "$SUPABASE_DB_URL" -f packages/core-db/migrations/010_create_team_tables.sql
psql "$SUPABASE_DB_URL" -f packages/core-db/migrations/011_create_team_helper_functions.sql
psql "$SUPABASE_DB_URL" -f packages/core-db/migrations/030_profiles_core_fields.sql
psql "$SUPABASE_DB_URL" -f packages/core-db/migrations/040_used_emails.sql
psql "$SUPABASE_DB_URL" -f packages/core-db/migrations/041_demo_once_rule.sql
```

### Option C: supabase db push (if using local migrations)

Copy the files into `supabase/migrations/` with timestamped prefixes and run:

```bash
supabase db push
```

## Security notes

- `audit_log` has strict RLS: only `service_role` can read/write; admins get read-only via `is_admin()`
- `audit_log_insert()` uses `SECURITY DEFINER` + `SET row_security TO 'off'` to bypass RLS from SQL functions
- `cleanup_audit_log_retention()` is restricted to `service_role` via `REVOKE/GRANT`
- `get_user_team_id()` and `is_team_owner()` are `SECURITY DEFINER` + `STABLE` — safe for use in RLS policies
- `create_team_for_new_user()` and `update_team_max_members()` are `SECURITY DEFINER` triggers on `auth.users` and `profiles`
- `handle_new_user()` is `SECURITY DEFINER` trigger on `auth.users` — creates profile + records email
- `used_emails` has no user-facing RLS — all access via trigger functions only

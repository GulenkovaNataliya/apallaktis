create extension if not exists "pg_cron" with schema "pg_catalog";

drop extension if exists "pg_net";

create sequence "public"."account_number_seq";


  create table "public"."admin_actions_log" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "admin_id" uuid,
    "action" text not null,
    "target_user_id" uuid,
    "metadata" jsonb default '{}'::jsonb,
    "ip_address" text,
    "user_agent" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."admin_actions_log" enable row level security;


  create table "public"."expense_categories" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" character varying(255) not null,
    "created_at" timestamp with time zone default now(),
    "deleted_at" timestamp with time zone
      );


alter table "public"."expense_categories" enable row level security;


  create table "public"."global_expenses" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "category_id" uuid,
    "payment_method_id" uuid,
    "name" character varying(255) not null,
    "amount" numeric(10,2) not null,
    "date" date not null,
    "description" text,
    "receipt_photo_url" text,
    "created_at" timestamp with time zone default now(),
    "input_method" character varying(20) default 'manual'::character varying,
    "deleted_at" timestamp with time zone,
    "version" integer not null default 1
      );


alter table "public"."global_expenses" enable row level security;


  create table "public"."object_expenses" (
    "id" uuid not null default gen_random_uuid(),
    "object_id" uuid not null,
    "category_id" uuid,
    "payment_method_id" uuid,
    "name" character varying(255) not null,
    "amount" numeric(10,2) not null,
    "date" date not null,
    "description" text,
    "receipt_photo_url" text,
    "created_at" timestamp with time zone default now(),
    "input_method" character varying(20) default 'manual'::character varying,
    "deleted_at" timestamp with time zone,
    "version" integer not null default 1
      );


alter table "public"."object_expenses" enable row level security;


  create table "public"."object_extras" (
    "id" uuid not null default gen_random_uuid(),
    "object_id" uuid not null,
    "amount" numeric(10,2) not null,
    "description" text,
    "date" date not null,
    "created_at" timestamp with time zone default now(),
    "deleted_at" timestamp with time zone,
    "version" integer not null default 1
      );


alter table "public"."object_extras" enable row level security;


  create table "public"."object_payments" (
    "id" uuid not null default gen_random_uuid(),
    "object_id" uuid not null,
    "payment_method_id" uuid,
    "amount" numeric(10,2) not null,
    "description" text,
    "date" date not null,
    "created_at" timestamp with time zone default now(),
    "deleted_at" timestamp with time zone,
    "version" integer not null default 1
      );


alter table "public"."object_payments" enable row level security;


  create table "public"."objects" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" character varying(255) not null,
    "address" text,
    "client_name" character varying(255),
    "client_contact" character varying(255),
    "contract_price" numeric(10,2) default 0,
    "status" character varying(20) default 'open'::character varying,
    "color" character varying(20),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "team_id" uuid,
    "deleted_at" timestamp with time zone,
    "version" integer not null default 1
      );


alter table "public"."objects" enable row level security;


  create table "public"."payment_methods" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "type" character varying(20) not null,
    "name" character varying(255) not null,
    "last_four_digits" character varying(4),
    "iban" character varying(34),
    "created_at" timestamp with time zone default now(),
    "team_id" uuid,
    "deleted_at" timestamp with time zone
      );


alter table "public"."payment_methods" enable row level security;


  create table "public"."phone_verification_codes" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "phone" text not null,
    "code" text not null,
    "created_at" timestamp with time zone default now(),
    "expires_at" timestamp with time zone not null,
    "verified" boolean default false
      );


alter table "public"."phone_verification_codes" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "name" text,
    "phone" text,
    "country_code" text,
    "invoice_type" text,
    "company_name" text,
    "afm" text,
    "account_number" integer not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "subscription_status" text default 'demo'::text,
    "demo_expires_at" timestamp with time zone,
    "account_purchased" boolean default false,
    "account_purchased_at" timestamp with time zone,
    "first_month_free_expires_at" timestamp with time zone,
    "subscription_plan" text,
    "subscription_expires_at" timestamp with time zone,
    "vip_expires_at" timestamp with time zone,
    "vip_granted_by" text,
    "vip_reason" text,
    "referral_code" text not null,
    "referred_by" text,
    "bonus_months" integer default 0,
    "demo_expiring_email_sent" boolean default false,
    "demo_expired_email_sent" boolean default false,
    "subscription_expiring_email_sent" boolean default false,
    "subscription_expired_email_sent" boolean default false,
    "referrals_count" integer default 0,
    "role" text default 'user'::text,
    "phone_verified" boolean default false,
    "email" text,
    "doy" text,
    "address" text,
    "activity" text,
    "is_business" boolean default false,
    "contact_consent" boolean not null default false,
    "demo_started_at" timestamp with time zone,
    "demo_notified_at" timestamp with time zone
      );


alter table "public"."profiles" enable row level security;


  create table "public"."registration_verification_codes" (
    "id" uuid not null default gen_random_uuid(),
    "phone" text not null,
    "code" text not null,
    "created_at" timestamp with time zone default now(),
    "expires_at" timestamp with time zone not null,
    "verified" boolean default false
      );


alter table "public"."registration_verification_codes" enable row level security;


  create table "public"."team_members" (
    "id" uuid not null default gen_random_uuid(),
    "team_id" uuid not null,
    "user_id" uuid not null,
    "role" character varying(20) not null default 'member'::character varying,
    "invited_at" timestamp with time zone default now(),
    "joined_at" timestamp with time zone default now(),
    "invited_by" uuid
      );


alter table "public"."team_members" enable row level security;


  create table "public"."teams" (
    "id" uuid not null default gen_random_uuid(),
    "name" character varying(255) not null,
    "owner_id" uuid not null,
    "subscription_plan" character varying(20) default 'basic'::character varying,
    "max_members" integer default 1,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."teams" enable row level security;


  create table "public"."used_emails" (
    "id" uuid not null default gen_random_uuid(),
    "email" text not null,
    "first_used_at" timestamp with time zone default now(),
    "has_purchased" boolean default false,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."used_emails" enable row level security;

CREATE UNIQUE INDEX admin_actions_log_pkey ON public.admin_actions_log USING btree (id);

CREATE UNIQUE INDEX expense_categories_pkey ON public.expense_categories USING btree (id);

CREATE UNIQUE INDEX global_expenses_pkey ON public.global_expenses USING btree (id);

CREATE INDEX idx_admin_actions_action ON public.admin_actions_log USING btree (action);

CREATE INDEX idx_admin_actions_admin_id ON public.admin_actions_log USING btree (admin_id);

CREATE INDEX idx_admin_actions_created_at ON public.admin_actions_log USING btree (created_at DESC);

CREATE INDEX idx_admin_actions_target_user ON public.admin_actions_log USING btree (target_user_id);

CREATE INDEX idx_expense_categories_user_id ON public.expense_categories USING btree (user_id);

CREATE INDEX idx_global_expenses_date ON public.global_expenses USING btree (date);

CREATE INDEX idx_global_expenses_deleted_at ON public.global_expenses USING btree (deleted_at) WHERE (deleted_at IS NULL);

CREATE INDEX idx_global_expenses_user_id ON public.global_expenses USING btree (user_id);

CREATE INDEX idx_object_expenses_deleted_at ON public.object_expenses USING btree (deleted_at) WHERE (deleted_at IS NULL);

CREATE INDEX idx_object_expenses_object_id ON public.object_expenses USING btree (object_id);

CREATE INDEX idx_object_extras_object_id ON public.object_extras USING btree (object_id);

CREATE INDEX idx_object_payments_object_id ON public.object_payments USING btree (object_id);

CREATE INDEX idx_objects_deleted_at ON public.objects USING btree (deleted_at) WHERE (deleted_at IS NULL);

CREATE INDEX idx_objects_status ON public.objects USING btree (status);

CREATE INDEX idx_objects_team_id ON public.objects USING btree (team_id);

CREATE INDEX idx_objects_user_id ON public.objects USING btree (user_id);

CREATE INDEX idx_payment_methods_team_id ON public.payment_methods USING btree (team_id);

CREATE INDEX idx_payment_methods_user_id ON public.payment_methods USING btree (user_id);

CREATE INDEX idx_phone_verification_code ON public.phone_verification_codes USING btree (code);

CREATE INDEX idx_phone_verification_phone ON public.phone_verification_codes USING btree (phone);

CREATE INDEX idx_phone_verification_user_id ON public.phone_verification_codes USING btree (user_id);

CREATE INDEX idx_profiles_demo_expiring ON public.profiles USING btree (subscription_status, demo_expires_at) WHERE ((subscription_status = 'demo'::text) AND (demo_expiring_email_sent = false));

CREATE INDEX idx_profiles_referral_code ON public.profiles USING btree (referral_code);

CREATE INDEX idx_profiles_referred_by ON public.profiles USING btree (referred_by);

CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);

CREATE INDEX idx_profiles_subscription_expiring ON public.profiles USING btree (subscription_status, subscription_expires_at) WHERE ((subscription_status = ANY (ARRAY['active'::text, 'vip'::text])) AND (subscription_expiring_email_sent = false));

CREATE INDEX idx_reg_verification_phone ON public.registration_verification_codes USING btree (phone);

CREATE INDEX idx_team_members_team ON public.team_members USING btree (team_id);

CREATE INDEX idx_team_members_user ON public.team_members USING btree (user_id);

CREATE INDEX idx_teams_owner ON public.teams USING btree (owner_id);

CREATE INDEX idx_used_emails_email ON public.used_emails USING btree (email);

CREATE UNIQUE INDEX object_expenses_pkey ON public.object_expenses USING btree (id);

CREATE UNIQUE INDEX object_extras_pkey ON public.object_extras USING btree (id);

CREATE UNIQUE INDEX object_payments_pkey ON public.object_payments USING btree (id);

CREATE UNIQUE INDEX objects_pkey ON public.objects USING btree (id);

CREATE UNIQUE INDEX payment_methods_pkey ON public.payment_methods USING btree (id);

CREATE UNIQUE INDEX phone_verification_codes_pkey ON public.phone_verification_codes USING btree (id);

CREATE UNIQUE INDEX profiles_account_number_key ON public.profiles USING btree (account_number);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_referral_code_key ON public.profiles USING btree (referral_code);

CREATE UNIQUE INDEX registration_verification_codes_pkey ON public.registration_verification_codes USING btree (id);

CREATE UNIQUE INDEX team_members_pkey ON public.team_members USING btree (id);

CREATE UNIQUE INDEX team_members_team_id_user_id_key ON public.team_members USING btree (team_id, user_id);

CREATE UNIQUE INDEX teams_owner_id_key ON public.teams USING btree (owner_id);

CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (id);

CREATE UNIQUE INDEX used_emails_email_key ON public.used_emails USING btree (email);

CREATE UNIQUE INDEX used_emails_pkey ON public.used_emails USING btree (id);

alter table "public"."admin_actions_log" add constraint "admin_actions_log_pkey" PRIMARY KEY using index "admin_actions_log_pkey";

alter table "public"."expense_categories" add constraint "expense_categories_pkey" PRIMARY KEY using index "expense_categories_pkey";

alter table "public"."global_expenses" add constraint "global_expenses_pkey" PRIMARY KEY using index "global_expenses_pkey";

alter table "public"."object_expenses" add constraint "object_expenses_pkey" PRIMARY KEY using index "object_expenses_pkey";

alter table "public"."object_extras" add constraint "object_extras_pkey" PRIMARY KEY using index "object_extras_pkey";

alter table "public"."object_payments" add constraint "object_payments_pkey" PRIMARY KEY using index "object_payments_pkey";

alter table "public"."objects" add constraint "objects_pkey" PRIMARY KEY using index "objects_pkey";

alter table "public"."payment_methods" add constraint "payment_methods_pkey" PRIMARY KEY using index "payment_methods_pkey";

alter table "public"."phone_verification_codes" add constraint "phone_verification_codes_pkey" PRIMARY KEY using index "phone_verification_codes_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."registration_verification_codes" add constraint "registration_verification_codes_pkey" PRIMARY KEY using index "registration_verification_codes_pkey";

alter table "public"."team_members" add constraint "team_members_pkey" PRIMARY KEY using index "team_members_pkey";

alter table "public"."teams" add constraint "teams_pkey" PRIMARY KEY using index "teams_pkey";

alter table "public"."used_emails" add constraint "used_emails_pkey" PRIMARY KEY using index "used_emails_pkey";

alter table "public"."admin_actions_log" add constraint "admin_actions_log_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."admin_actions_log" validate constraint "admin_actions_log_admin_id_fkey";

alter table "public"."admin_actions_log" add constraint "admin_actions_log_target_user_id_fkey" FOREIGN KEY (target_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."admin_actions_log" validate constraint "admin_actions_log_target_user_id_fkey";

alter table "public"."expense_categories" add constraint "expense_categories_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."expense_categories" validate constraint "expense_categories_user_id_fkey";

alter table "public"."global_expenses" add constraint "global_expenses_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.expense_categories(id) ON DELETE SET NULL not valid;

alter table "public"."global_expenses" validate constraint "global_expenses_category_id_fkey";

alter table "public"."global_expenses" add constraint "global_expenses_payment_method_id_fkey" FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON DELETE SET NULL not valid;

alter table "public"."global_expenses" validate constraint "global_expenses_payment_method_id_fkey";

alter table "public"."global_expenses" add constraint "global_expenses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."global_expenses" validate constraint "global_expenses_user_id_fkey";

alter table "public"."object_expenses" add constraint "object_expenses_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.expense_categories(id) ON DELETE SET NULL not valid;

alter table "public"."object_expenses" validate constraint "object_expenses_category_id_fkey";

alter table "public"."object_expenses" add constraint "object_expenses_object_id_fkey" FOREIGN KEY (object_id) REFERENCES public.objects(id) ON DELETE CASCADE not valid;

alter table "public"."object_expenses" validate constraint "object_expenses_object_id_fkey";

alter table "public"."object_expenses" add constraint "object_expenses_payment_method_id_fkey" FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON DELETE SET NULL not valid;

alter table "public"."object_expenses" validate constraint "object_expenses_payment_method_id_fkey";

alter table "public"."object_extras" add constraint "object_extras_object_id_fkey" FOREIGN KEY (object_id) REFERENCES public.objects(id) ON DELETE CASCADE not valid;

alter table "public"."object_extras" validate constraint "object_extras_object_id_fkey";

alter table "public"."object_payments" add constraint "object_payments_object_id_fkey" FOREIGN KEY (object_id) REFERENCES public.objects(id) ON DELETE CASCADE not valid;

alter table "public"."object_payments" validate constraint "object_payments_object_id_fkey";

alter table "public"."object_payments" add constraint "object_payments_payment_method_id_fkey" FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON DELETE SET NULL not valid;

alter table "public"."object_payments" validate constraint "object_payments_payment_method_id_fkey";

alter table "public"."objects" add constraint "objects_status_check" CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'closed'::character varying])::text[]))) not valid;

alter table "public"."objects" validate constraint "objects_status_check";

alter table "public"."objects" add constraint "objects_team_id_fkey" FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE not valid;

alter table "public"."objects" validate constraint "objects_team_id_fkey";

alter table "public"."objects" add constraint "objects_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."objects" validate constraint "objects_user_id_fkey";

alter table "public"."payment_methods" add constraint "payment_methods_team_id_fkey" FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE not valid;

alter table "public"."payment_methods" validate constraint "payment_methods_team_id_fkey";

alter table "public"."payment_methods" add constraint "payment_methods_type_check" CHECK (((type)::text = ANY ((ARRAY['cash'::character varying, 'credit_card'::character varying, 'debit_card'::character varying, 'bank_account'::character varying])::text[]))) not valid;

alter table "public"."payment_methods" validate constraint "payment_methods_type_check";

alter table "public"."payment_methods" add constraint "payment_methods_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."payment_methods" validate constraint "payment_methods_user_id_fkey";

alter table "public"."phone_verification_codes" add constraint "phone_verification_codes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."phone_verification_codes" validate constraint "phone_verification_codes_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_account_number_key" UNIQUE using index "profiles_account_number_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_invoice_type_check" CHECK ((invoice_type = ANY (ARRAY['receipt'::text, 'invoice'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_invoice_type_check";

alter table "public"."profiles" add constraint "profiles_referral_code_key" UNIQUE using index "profiles_referral_code_key";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['user'::text, 'admin'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

alter table "public"."profiles" add constraint "profiles_subscription_plan_check" CHECK ((subscription_plan = ANY (ARRAY['basic'::text, 'standard'::text, 'premium'::text, 'vip'::text, NULL::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_subscription_plan_check";

alter table "public"."profiles" add constraint "profiles_subscription_status_check" CHECK ((subscription_status = ANY (ARRAY['demo'::text, 'active'::text, 'expired'::text, 'vip'::text, 'read-only'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_subscription_status_check";

alter table "public"."team_members" add constraint "team_members_invited_by_fkey" FOREIGN KEY (invited_by) REFERENCES auth.users(id) not valid;

alter table "public"."team_members" validate constraint "team_members_invited_by_fkey";

alter table "public"."team_members" add constraint "team_members_team_id_fkey" FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE not valid;

alter table "public"."team_members" validate constraint "team_members_team_id_fkey";

alter table "public"."team_members" add constraint "team_members_team_id_user_id_key" UNIQUE using index "team_members_team_id_user_id_key";

alter table "public"."team_members" add constraint "team_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."team_members" validate constraint "team_members_user_id_fkey";

alter table "public"."teams" add constraint "teams_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."teams" validate constraint "teams_owner_id_fkey";

alter table "public"."teams" add constraint "teams_owner_id_key" UNIQUE using index "teams_owner_id_key";

alter table "public"."used_emails" add constraint "used_emails_email_key" UNIQUE using index "used_emails_email_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_team_for_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  new_team_id uuid;
  team_name text;
begin
  -- имя команды
  team_name := coalesce(
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  -- создаём команду
  insert into public.teams (name, owner_id, subscription_plan, max_members)
  values (team_name, new.id, 'basic', 1)
  returning id into new_team_id;

  -- добавляем владельца как участника команды
  insert into public.team_members (team_id, user_id, role, invited_by, joined_at)
  values (new_team_id, new.id, 'owner', new.id, now());

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_owned_team_id(user_uuid uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id FROM teams WHERE owner_id = user_uuid LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_team_id(user_uuid uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT team_id FROM team_members WHERE user_id = user_uuid LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  next_account_number INTEGER;
  user_name TEXT;
  user_referral_code TEXT;
  user_referred_by TEXT;
  email_record RECORD;
  demo_expires TIMESTAMPTZ;
  v_contact_consent BOOLEAN;
BEGIN
  -- consent from signup checkbox
  v_contact_consent :=
    COALESCE((NEW.raw_user_meta_data ->> 'contact_consent')::boolean, FALSE);

  SELECT * INTO email_record
  FROM public.used_emails
  WHERE email = NEW.email;

  IF email_record IS NOT NULL AND email_record.has_purchased = FALSE THEN
    demo_expires := NOW() - INTERVAL '1 second';
  ELSE
    demo_expires := NOW() + INTERVAL '48 hours';
  END IF;

  SELECT COALESCE(MAX(account_number), 1000) + 1
  INTO next_account_number
  FROM public.profiles;

  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  user_referral_code := UPPER(SUBSTRING(user_name FROM 1 FOR 3)) || next_account_number::text;
  user_referred_by := NEW.raw_user_meta_data->>'referred_by';

  INSERT INTO public.profiles (
    id,
    email,
    name,
    phone,
    country_code,
    account_number,
    referral_code,
    referred_by,
    invoice_type,
    company_name,
    afm,
    doy,
    address,
    activity,
    is_business,
    subscription_status,
    demo_expires_at,
    demo_started_at,
    contact_consent,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    user_name,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country_code',
    next_account_number,
    user_referral_code,
    user_referred_by,
    COALESCE(NEW.raw_user_meta_data->>'invoice_type', 'receipt'),
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'afm',
    NEW.raw_user_meta_data->>'doy',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'activity',
    COALESCE((NEW.raw_user_meta_data->>'is_business')::boolean, FALSE),
    CASE WHEN demo_expires > NOW() THEN 'demo' ELSE 'read-only' END,
    demo_expires,
    CASE WHEN demo_expires > NOW() THEN NOW() ELSE NULL END,
    v_contact_consent,
    NOW(),
    NOW()
  );

  INSERT INTO public.used_emails (email, first_used_at, has_purchased, created_at)
  VALUES (NEW.email, NOW(), FALSE, NOW())
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
 SET row_security TO 'off'
AS $function$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_team_owner(user_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM teams WHERE owner_id = user_uuid
  );
$function$
;

CREATE OR REPLACE FUNCTION public.mark_email_as_purchased(user_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE public.used_emails 
    SET has_purchased = TRUE 
    WHERE email = user_email;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.restore_item(p_table_name text, p_item_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  restored_count INTEGER;
BEGIN
  EXECUTE format(
    'UPDATE public.%I SET deleted_at = NULL WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL',
    p_table_name
  ) USING p_item_id, p_user_id;

  GET DIAGNOSTICS restored_count = ROW_COUNT;
  RETURN restored_count > 0;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.restore_object(p_object_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  restored_count INTEGER;
BEGIN
  -- Restore the object
  UPDATE public.objects
  SET deleted_at = NULL, updated_at = NOW()
  WHERE id = p_object_id
    AND user_id = p_user_id
    AND deleted_at IS NOT NULL;

  GET DIAGNOSTICS restored_count = ROW_COUNT;

  IF restored_count > 0 THEN
    -- Restore related items
    UPDATE public.object_expenses SET deleted_at = NULL
    WHERE object_id = p_object_id AND deleted_at IS NOT NULL;

    UPDATE public.object_extras SET deleted_at = NULL
    WHERE object_id = p_object_id AND deleted_at IS NOT NULL;

    UPDATE public.object_payments SET deleted_at = NULL
    WHERE object_id = p_object_id AND deleted_at IS NOT NULL;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.soft_delete_item(p_table_name text, p_item_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  EXECUTE format(
    'UPDATE public.%I SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    p_table_name
  ) USING p_item_id, p_user_id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.soft_delete_object(p_object_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Soft delete the object
  UPDATE public.objects
  SET deleted_at = NOW(), updated_at = NOW()
  WHERE id = p_object_id
    AND user_id = p_user_id
    AND deleted_at IS NULL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  IF deleted_count > 0 THEN
    -- Soft delete related items
    UPDATE public.object_expenses SET deleted_at = NOW()
    WHERE object_id = p_object_id AND deleted_at IS NULL;

    UPDATE public.object_extras SET deleted_at = NOW()
    WHERE object_id = p_object_id AND deleted_at IS NULL;

    UPDATE public.object_payments SET deleted_at = NOW()
    WHERE object_id = p_object_id AND deleted_at IS NULL;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_team_max_members()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  DECLARE
    new_max INTEGER;
  BEGIN
    CASE NEW.subscription_plan
      WHEN 'basic' THEN new_max := 1;
      WHEN 'standard' THEN new_max := 2;
      WHEN 'premium' THEN new_max := 999;
      WHEN 'vip' THEN new_max := 999;
      ELSE new_max := 1;
    END CASE;

    UPDATE teams
    SET max_members = new_max,
        subscription_plan = NEW.subscription_plan,
        updated_at = NOW()
    WHERE owner_id = NEW.id;

    RETURN NEW;
  END;
  $function$
;

grant delete on table "public"."admin_actions_log" to "anon";

grant insert on table "public"."admin_actions_log" to "anon";

grant references on table "public"."admin_actions_log" to "anon";

grant select on table "public"."admin_actions_log" to "anon";

grant trigger on table "public"."admin_actions_log" to "anon";

grant truncate on table "public"."admin_actions_log" to "anon";

grant update on table "public"."admin_actions_log" to "anon";

grant delete on table "public"."admin_actions_log" to "authenticated";

grant insert on table "public"."admin_actions_log" to "authenticated";

grant references on table "public"."admin_actions_log" to "authenticated";

grant select on table "public"."admin_actions_log" to "authenticated";

grant trigger on table "public"."admin_actions_log" to "authenticated";

grant truncate on table "public"."admin_actions_log" to "authenticated";

grant update on table "public"."admin_actions_log" to "authenticated";

grant delete on table "public"."admin_actions_log" to "service_role";

grant insert on table "public"."admin_actions_log" to "service_role";

grant references on table "public"."admin_actions_log" to "service_role";

grant select on table "public"."admin_actions_log" to "service_role";

grant trigger on table "public"."admin_actions_log" to "service_role";

grant truncate on table "public"."admin_actions_log" to "service_role";

grant update on table "public"."admin_actions_log" to "service_role";

grant delete on table "public"."expense_categories" to "anon";

grant insert on table "public"."expense_categories" to "anon";

grant references on table "public"."expense_categories" to "anon";

grant select on table "public"."expense_categories" to "anon";

grant trigger on table "public"."expense_categories" to "anon";

grant truncate on table "public"."expense_categories" to "anon";

grant update on table "public"."expense_categories" to "anon";

grant delete on table "public"."expense_categories" to "authenticated";

grant insert on table "public"."expense_categories" to "authenticated";

grant references on table "public"."expense_categories" to "authenticated";

grant select on table "public"."expense_categories" to "authenticated";

grant trigger on table "public"."expense_categories" to "authenticated";

grant truncate on table "public"."expense_categories" to "authenticated";

grant update on table "public"."expense_categories" to "authenticated";

grant delete on table "public"."expense_categories" to "service_role";

grant insert on table "public"."expense_categories" to "service_role";

grant references on table "public"."expense_categories" to "service_role";

grant select on table "public"."expense_categories" to "service_role";

grant trigger on table "public"."expense_categories" to "service_role";

grant truncate on table "public"."expense_categories" to "service_role";

grant update on table "public"."expense_categories" to "service_role";

grant delete on table "public"."global_expenses" to "anon";

grant insert on table "public"."global_expenses" to "anon";

grant references on table "public"."global_expenses" to "anon";

grant select on table "public"."global_expenses" to "anon";

grant trigger on table "public"."global_expenses" to "anon";

grant truncate on table "public"."global_expenses" to "anon";

grant update on table "public"."global_expenses" to "anon";

grant delete on table "public"."global_expenses" to "authenticated";

grant insert on table "public"."global_expenses" to "authenticated";

grant references on table "public"."global_expenses" to "authenticated";

grant select on table "public"."global_expenses" to "authenticated";

grant trigger on table "public"."global_expenses" to "authenticated";

grant truncate on table "public"."global_expenses" to "authenticated";

grant update on table "public"."global_expenses" to "authenticated";

grant delete on table "public"."global_expenses" to "service_role";

grant insert on table "public"."global_expenses" to "service_role";

grant references on table "public"."global_expenses" to "service_role";

grant select on table "public"."global_expenses" to "service_role";

grant trigger on table "public"."global_expenses" to "service_role";

grant truncate on table "public"."global_expenses" to "service_role";

grant update on table "public"."global_expenses" to "service_role";

grant delete on table "public"."object_expenses" to "anon";

grant insert on table "public"."object_expenses" to "anon";

grant references on table "public"."object_expenses" to "anon";

grant select on table "public"."object_expenses" to "anon";

grant trigger on table "public"."object_expenses" to "anon";

grant truncate on table "public"."object_expenses" to "anon";

grant update on table "public"."object_expenses" to "anon";

grant delete on table "public"."object_expenses" to "authenticated";

grant insert on table "public"."object_expenses" to "authenticated";

grant references on table "public"."object_expenses" to "authenticated";

grant select on table "public"."object_expenses" to "authenticated";

grant trigger on table "public"."object_expenses" to "authenticated";

grant truncate on table "public"."object_expenses" to "authenticated";

grant update on table "public"."object_expenses" to "authenticated";

grant delete on table "public"."object_expenses" to "service_role";

grant insert on table "public"."object_expenses" to "service_role";

grant references on table "public"."object_expenses" to "service_role";

grant select on table "public"."object_expenses" to "service_role";

grant trigger on table "public"."object_expenses" to "service_role";

grant truncate on table "public"."object_expenses" to "service_role";

grant update on table "public"."object_expenses" to "service_role";

grant delete on table "public"."object_extras" to "anon";

grant insert on table "public"."object_extras" to "anon";

grant references on table "public"."object_extras" to "anon";

grant select on table "public"."object_extras" to "anon";

grant trigger on table "public"."object_extras" to "anon";

grant truncate on table "public"."object_extras" to "anon";

grant update on table "public"."object_extras" to "anon";

grant delete on table "public"."object_extras" to "authenticated";

grant insert on table "public"."object_extras" to "authenticated";

grant references on table "public"."object_extras" to "authenticated";

grant select on table "public"."object_extras" to "authenticated";

grant trigger on table "public"."object_extras" to "authenticated";

grant truncate on table "public"."object_extras" to "authenticated";

grant update on table "public"."object_extras" to "authenticated";

grant delete on table "public"."object_extras" to "service_role";

grant insert on table "public"."object_extras" to "service_role";

grant references on table "public"."object_extras" to "service_role";

grant select on table "public"."object_extras" to "service_role";

grant trigger on table "public"."object_extras" to "service_role";

grant truncate on table "public"."object_extras" to "service_role";

grant update on table "public"."object_extras" to "service_role";

grant delete on table "public"."object_payments" to "anon";

grant insert on table "public"."object_payments" to "anon";

grant references on table "public"."object_payments" to "anon";

grant select on table "public"."object_payments" to "anon";

grant trigger on table "public"."object_payments" to "anon";

grant truncate on table "public"."object_payments" to "anon";

grant update on table "public"."object_payments" to "anon";

grant delete on table "public"."object_payments" to "authenticated";

grant insert on table "public"."object_payments" to "authenticated";

grant references on table "public"."object_payments" to "authenticated";

grant select on table "public"."object_payments" to "authenticated";

grant trigger on table "public"."object_payments" to "authenticated";

grant truncate on table "public"."object_payments" to "authenticated";

grant update on table "public"."object_payments" to "authenticated";

grant delete on table "public"."object_payments" to "service_role";

grant insert on table "public"."object_payments" to "service_role";

grant references on table "public"."object_payments" to "service_role";

grant select on table "public"."object_payments" to "service_role";

grant trigger on table "public"."object_payments" to "service_role";

grant truncate on table "public"."object_payments" to "service_role";

grant update on table "public"."object_payments" to "service_role";

grant delete on table "public"."objects" to "anon";

grant insert on table "public"."objects" to "anon";

grant references on table "public"."objects" to "anon";

grant select on table "public"."objects" to "anon";

grant trigger on table "public"."objects" to "anon";

grant truncate on table "public"."objects" to "anon";

grant update on table "public"."objects" to "anon";

grant delete on table "public"."objects" to "authenticated";

grant insert on table "public"."objects" to "authenticated";

grant references on table "public"."objects" to "authenticated";

grant select on table "public"."objects" to "authenticated";

grant trigger on table "public"."objects" to "authenticated";

grant truncate on table "public"."objects" to "authenticated";

grant update on table "public"."objects" to "authenticated";

grant delete on table "public"."objects" to "service_role";

grant insert on table "public"."objects" to "service_role";

grant references on table "public"."objects" to "service_role";

grant select on table "public"."objects" to "service_role";

grant trigger on table "public"."objects" to "service_role";

grant truncate on table "public"."objects" to "service_role";

grant update on table "public"."objects" to "service_role";

grant delete on table "public"."payment_methods" to "anon";

grant insert on table "public"."payment_methods" to "anon";

grant references on table "public"."payment_methods" to "anon";

grant select on table "public"."payment_methods" to "anon";

grant trigger on table "public"."payment_methods" to "anon";

grant truncate on table "public"."payment_methods" to "anon";

grant update on table "public"."payment_methods" to "anon";

grant delete on table "public"."payment_methods" to "authenticated";

grant insert on table "public"."payment_methods" to "authenticated";

grant references on table "public"."payment_methods" to "authenticated";

grant select on table "public"."payment_methods" to "authenticated";

grant trigger on table "public"."payment_methods" to "authenticated";

grant truncate on table "public"."payment_methods" to "authenticated";

grant update on table "public"."payment_methods" to "authenticated";

grant delete on table "public"."payment_methods" to "service_role";

grant insert on table "public"."payment_methods" to "service_role";

grant references on table "public"."payment_methods" to "service_role";

grant select on table "public"."payment_methods" to "service_role";

grant trigger on table "public"."payment_methods" to "service_role";

grant truncate on table "public"."payment_methods" to "service_role";

grant update on table "public"."payment_methods" to "service_role";

grant delete on table "public"."phone_verification_codes" to "anon";

grant insert on table "public"."phone_verification_codes" to "anon";

grant references on table "public"."phone_verification_codes" to "anon";

grant select on table "public"."phone_verification_codes" to "anon";

grant trigger on table "public"."phone_verification_codes" to "anon";

grant truncate on table "public"."phone_verification_codes" to "anon";

grant update on table "public"."phone_verification_codes" to "anon";

grant delete on table "public"."phone_verification_codes" to "authenticated";

grant insert on table "public"."phone_verification_codes" to "authenticated";

grant references on table "public"."phone_verification_codes" to "authenticated";

grant select on table "public"."phone_verification_codes" to "authenticated";

grant trigger on table "public"."phone_verification_codes" to "authenticated";

grant truncate on table "public"."phone_verification_codes" to "authenticated";

grant update on table "public"."phone_verification_codes" to "authenticated";

grant delete on table "public"."phone_verification_codes" to "service_role";

grant insert on table "public"."phone_verification_codes" to "service_role";

grant references on table "public"."phone_verification_codes" to "service_role";

grant select on table "public"."phone_verification_codes" to "service_role";

grant trigger on table "public"."phone_verification_codes" to "service_role";

grant truncate on table "public"."phone_verification_codes" to "service_role";

grant update on table "public"."phone_verification_codes" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."registration_verification_codes" to "anon";

grant insert on table "public"."registration_verification_codes" to "anon";

grant references on table "public"."registration_verification_codes" to "anon";

grant select on table "public"."registration_verification_codes" to "anon";

grant trigger on table "public"."registration_verification_codes" to "anon";

grant truncate on table "public"."registration_verification_codes" to "anon";

grant update on table "public"."registration_verification_codes" to "anon";

grant delete on table "public"."registration_verification_codes" to "authenticated";

grant insert on table "public"."registration_verification_codes" to "authenticated";

grant references on table "public"."registration_verification_codes" to "authenticated";

grant select on table "public"."registration_verification_codes" to "authenticated";

grant trigger on table "public"."registration_verification_codes" to "authenticated";

grant truncate on table "public"."registration_verification_codes" to "authenticated";

grant update on table "public"."registration_verification_codes" to "authenticated";

grant delete on table "public"."registration_verification_codes" to "service_role";

grant insert on table "public"."registration_verification_codes" to "service_role";

grant references on table "public"."registration_verification_codes" to "service_role";

grant select on table "public"."registration_verification_codes" to "service_role";

grant trigger on table "public"."registration_verification_codes" to "service_role";

grant truncate on table "public"."registration_verification_codes" to "service_role";

grant update on table "public"."registration_verification_codes" to "service_role";

grant delete on table "public"."team_members" to "anon";

grant insert on table "public"."team_members" to "anon";

grant references on table "public"."team_members" to "anon";

grant select on table "public"."team_members" to "anon";

grant trigger on table "public"."team_members" to "anon";

grant truncate on table "public"."team_members" to "anon";

grant update on table "public"."team_members" to "anon";

grant delete on table "public"."team_members" to "authenticated";

grant insert on table "public"."team_members" to "authenticated";

grant references on table "public"."team_members" to "authenticated";

grant select on table "public"."team_members" to "authenticated";

grant trigger on table "public"."team_members" to "authenticated";

grant truncate on table "public"."team_members" to "authenticated";

grant update on table "public"."team_members" to "authenticated";

grant delete on table "public"."team_members" to "service_role";

grant insert on table "public"."team_members" to "service_role";

grant references on table "public"."team_members" to "service_role";

grant select on table "public"."team_members" to "service_role";

grant trigger on table "public"."team_members" to "service_role";

grant truncate on table "public"."team_members" to "service_role";

grant update on table "public"."team_members" to "service_role";

grant delete on table "public"."teams" to "anon";

grant insert on table "public"."teams" to "anon";

grant references on table "public"."teams" to "anon";

grant select on table "public"."teams" to "anon";

grant trigger on table "public"."teams" to "anon";

grant truncate on table "public"."teams" to "anon";

grant update on table "public"."teams" to "anon";

grant delete on table "public"."teams" to "authenticated";

grant insert on table "public"."teams" to "authenticated";

grant references on table "public"."teams" to "authenticated";

grant select on table "public"."teams" to "authenticated";

grant trigger on table "public"."teams" to "authenticated";

grant truncate on table "public"."teams" to "authenticated";

grant update on table "public"."teams" to "authenticated";

grant delete on table "public"."teams" to "service_role";

grant insert on table "public"."teams" to "service_role";

grant references on table "public"."teams" to "service_role";

grant select on table "public"."teams" to "service_role";

grant trigger on table "public"."teams" to "service_role";

grant truncate on table "public"."teams" to "service_role";

grant update on table "public"."teams" to "service_role";

grant delete on table "public"."used_emails" to "anon";

grant insert on table "public"."used_emails" to "anon";

grant references on table "public"."used_emails" to "anon";

grant select on table "public"."used_emails" to "anon";

grant trigger on table "public"."used_emails" to "anon";

grant truncate on table "public"."used_emails" to "anon";

grant update on table "public"."used_emails" to "anon";

grant delete on table "public"."used_emails" to "authenticated";

grant insert on table "public"."used_emails" to "authenticated";

grant references on table "public"."used_emails" to "authenticated";

grant select on table "public"."used_emails" to "authenticated";

grant trigger on table "public"."used_emails" to "authenticated";

grant truncate on table "public"."used_emails" to "authenticated";

grant update on table "public"."used_emails" to "authenticated";

grant delete on table "public"."used_emails" to "service_role";

grant insert on table "public"."used_emails" to "service_role";

grant references on table "public"."used_emails" to "service_role";

grant select on table "public"."used_emails" to "service_role";

grant trigger on table "public"."used_emails" to "service_role";

grant truncate on table "public"."used_emails" to "service_role";

grant update on table "public"."used_emails" to "service_role";


  create policy "admin_actions_log_delete_policy"
  on "public"."admin_actions_log"
  as permissive
  for delete
  to public
using (false);



  create policy "admin_actions_log_insert_policy"
  on "public"."admin_actions_log"
  as permissive
  for insert
  to public
with check (false);



  create policy "admin_actions_log_select_policy"
  on "public"."admin_actions_log"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "admin_actions_log_update_policy"
  on "public"."admin_actions_log"
  as permissive
  for update
  to public
using (false);



  create policy "Users can delete expense_categories"
  on "public"."expense_categories"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "Users can insert expense_categories"
  on "public"."expense_categories"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "Users can update expense_categories"
  on "public"."expense_categories"
  as permissive
  for update
  to public
using ((user_id = auth.uid()));



  create policy "Users can view expense_categories"
  on "public"."expense_categories"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "Users can delete global_expenses"
  on "public"."global_expenses"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "Users can insert global_expenses"
  on "public"."global_expenses"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "Users can update global_expenses"
  on "public"."global_expenses"
  as permissive
  for update
  to public
using ((user_id = auth.uid()));



  create policy "Users can view global_expenses"
  on "public"."global_expenses"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "Users can delete own object expenses"
  on "public"."object_expenses"
  as permissive
  for delete
  to public
using ((object_id IN ( SELECT objects.id
   FROM public.objects
  WHERE (objects.user_id = auth.uid()))));



  create policy "Users can delete own object_expenses"
  on "public"."object_expenses"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.objects
  WHERE ((objects.id = object_expenses.object_id) AND (objects.user_id = auth.uid())))));



  create policy "Users can insert own object expenses"
  on "public"."object_expenses"
  as permissive
  for insert
  to public
with check ((object_id IN ( SELECT objects.id
   FROM public.objects
  WHERE (objects.user_id = auth.uid()))));



  create policy "Users can insert own object_expenses"
  on "public"."object_expenses"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.objects
  WHERE ((objects.id = object_expenses.object_id) AND (objects.user_id = auth.uid())))));



  create policy "Users can update own object expenses"
  on "public"."object_expenses"
  as permissive
  for update
  to public
using ((object_id IN ( SELECT objects.id
   FROM public.objects
  WHERE (objects.user_id = auth.uid()))));



  create policy "Users can update own object_expenses"
  on "public"."object_expenses"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.objects
  WHERE ((objects.id = object_expenses.object_id) AND (objects.user_id = auth.uid())))));



  create policy "Users can view own object expenses"
  on "public"."object_expenses"
  as permissive
  for select
  to public
using ((object_id IN ( SELECT objects.id
   FROM public.objects
  WHERE (objects.user_id = auth.uid()))));



  create policy "Users can view own object_expenses"
  on "public"."object_expenses"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.objects
  WHERE ((objects.id = object_expenses.object_id) AND (objects.user_id = auth.uid())))));



  create policy "Users can delete own object_extras"
  on "public"."object_extras"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.objects
  WHERE ((objects.id = object_extras.object_id) AND (objects.user_id = auth.uid())))));



  create policy "Users can insert own object_extras"
  on "public"."object_extras"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.objects
  WHERE ((objects.id = object_extras.object_id) AND (objects.user_id = auth.uid())))));



  create policy "Users can update own object_extras"
  on "public"."object_extras"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.objects
  WHERE ((objects.id = object_extras.object_id) AND (objects.user_id = auth.uid())))));



  create policy "Users can view own object_extras"
  on "public"."object_extras"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.objects
  WHERE ((objects.id = object_extras.object_id) AND (objects.user_id = auth.uid())))));



  create policy "Users can delete own object_payments"
  on "public"."object_payments"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.objects
  WHERE ((objects.id = object_payments.object_id) AND (objects.user_id = auth.uid())))));



  create policy "Users can insert own object_payments"
  on "public"."object_payments"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.objects
  WHERE ((objects.id = object_payments.object_id) AND (objects.user_id = auth.uid())))));



  create policy "Users can update own object_payments"
  on "public"."object_payments"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.objects
  WHERE ((objects.id = object_payments.object_id) AND (objects.user_id = auth.uid())))));



  create policy "Users can view own object_payments"
  on "public"."object_payments"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.objects
  WHERE ((objects.id = object_payments.object_id) AND (objects.user_id = auth.uid())))));



  create policy "Team members can delete objects"
  on "public"."objects"
  as permissive
  for delete
  to public
using (((team_id IN ( SELECT teams.id
   FROM public.teams
  WHERE (teams.owner_id = auth.uid()))) OR (user_id = auth.uid())));



  create policy "Team members can insert objects"
  on "public"."objects"
  as permissive
  for insert
  to public
with check (((team_id IN ( SELECT teams.id
   FROM public.teams
  WHERE (teams.owner_id = auth.uid()))) OR (user_id = auth.uid())));



  create policy "Team members can update objects"
  on "public"."objects"
  as permissive
  for update
  to public
using (((team_id IN ( SELECT teams.id
   FROM public.teams
  WHERE (teams.owner_id = auth.uid()))) OR (user_id = auth.uid())));



  create policy "Team members can view objects"
  on "public"."objects"
  as permissive
  for select
  to public
using (((team_id IN ( SELECT teams.id
   FROM public.teams
  WHERE (teams.owner_id = auth.uid()))) OR (user_id = auth.uid())));



  create policy "Team members can delete payment_methods"
  on "public"."payment_methods"
  as permissive
  for delete
  to public
using (((team_id IN ( SELECT teams.id
   FROM public.teams
  WHERE (teams.owner_id = auth.uid()))) OR (user_id = auth.uid())));



  create policy "Team members can insert payment_methods"
  on "public"."payment_methods"
  as permissive
  for insert
  to public
with check (((team_id IN ( SELECT teams.id
   FROM public.teams
  WHERE (teams.owner_id = auth.uid()))) OR (user_id = auth.uid())));



  create policy "Team members can update payment_methods"
  on "public"."payment_methods"
  as permissive
  for update
  to public
using (((team_id IN ( SELECT teams.id
   FROM public.teams
  WHERE (teams.owner_id = auth.uid()))) OR (user_id = auth.uid())));



  create policy "Team members can view payment_methods"
  on "public"."payment_methods"
  as permissive
  for select
  to public
using (((team_id IN ( SELECT teams.id
   FROM public.teams
  WHERE (teams.owner_id = auth.uid()))) OR (user_id = auth.uid())));



  create policy "Admins can read all profiles"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles profiles_1
  WHERE ((profiles_1.id = auth.uid()) AND (profiles_1.role = 'admin'::text)))));



  create policy "Users can insert own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((id = auth.uid()));



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((id = auth.uid()));



  create policy "Users can view own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((id = auth.uid()));



  create policy "Member can leave team"
  on "public"."team_members"
  as permissive
  for delete
  to public
using (((user_id = auth.uid()) AND ((role)::text <> 'owner'::text)));



  create policy "Members can view team members"
  on "public"."team_members"
  as permissive
  for select
  to public
using (((user_id = auth.uid()) OR (team_id = public.get_user_team_id(auth.uid()))));



  create policy "Owner can add members"
  on "public"."team_members"
  as permissive
  for insert
  to public
with check ((team_id = public.get_owned_team_id(auth.uid())));



  create policy "Owner can remove members"
  on "public"."team_members"
  as permissive
  for delete
  to public
using (((team_id = public.get_owned_team_id(auth.uid())) AND (user_id <> auth.uid())));



  create policy "Members can view team"
  on "public"."teams"
  as permissive
  for select
  to public
using (((owner_id = auth.uid()) OR (id = public.get_user_team_id(auth.uid()))));



  create policy "Owner can update team"
  on "public"."teams"
  as permissive
  for update
  to public
using ((owner_id = auth.uid()))
with check ((owner_id = auth.uid()));



  create policy "Service role only"
  on "public"."used_emails"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));


CREATE TRIGGER on_subscription_change AFTER UPDATE OF subscription_plan ON public.profiles FOR EACH ROW WHEN ((old.subscription_plan IS DISTINCT FROM new.subscription_plan)) EXECUTE FUNCTION public.update_team_max_members();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_team AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_team_for_new_user();



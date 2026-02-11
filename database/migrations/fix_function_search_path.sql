-- Migration: Fix Function Search Path Mutable (Security Advisor)
-- =============================================================
-- Adds SET search_path = public to all functions to prevent
-- search_path manipulation attacks
-- Date: 2026-02-11

-- ============================================
-- SCHEMA.SQL FUNCTIONS
-- ============================================

ALTER FUNCTION update_updated_at_column()
SET search_path = public;

ALTER FUNCTION generate_referral_code()
SET search_path = public;

ALTER FUNCTION set_referral_code()
SET search_path = public;

ALTER FUNCTION set_demo_expiration()
SET search_path = public;

-- ============================================
-- TEAM FUNCTIONS (create_team_tables.sql)
-- ============================================

ALTER FUNCTION create_team_for_new_user()
SET search_path = public;

ALTER FUNCTION update_team_max_members()
SET search_path = public;

ALTER FUNCTION generate_invitation_token()
SET search_path = public;

-- ============================================
-- USER HANDLING FUNCTIONS (add_used_emails_protection.sql)
-- ============================================

ALTER FUNCTION public.handle_new_user()
SET search_path = public;

ALTER FUNCTION public.mark_email_as_purchased()
SET search_path = public;

-- ============================================
-- SOFT DELETE & VERSIONING FUNCTIONS
-- ============================================

ALTER FUNCTION soft_delete_object(UUID, UUID)
SET search_path = public;

ALTER FUNCTION restore_object(UUID, UUID)
SET search_path = public;

ALTER FUNCTION soft_delete_item(TEXT, UUID, UUID)
SET search_path = public;

ALTER FUNCTION restore_item(TEXT, UUID, UUID)
SET search_path = public;

ALTER FUNCTION permanently_delete_old_items(INTEGER)
SET search_path = public;

ALTER FUNCTION update_with_version_check(TEXT, UUID, INTEGER, JSONB)
SET search_path = public;

ALTER FUNCTION increment_version()
SET search_path = public;

-- ============================================
-- CLIENTS FUNCTIONS (010_create_clients_tables.sql)
-- ============================================

ALTER FUNCTION update_clients_updated_at()
SET search_path = public;

-- ============================================
-- VERIFICATION
-- ============================================

-- Comment for documentation
COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger function to update updated_at timestamp. search_path fixed.';
COMMENT ON FUNCTION soft_delete_object(UUID, UUID) IS 'Soft deletes an object and all related items. search_path fixed.';
COMMENT ON FUNCTION restore_object(UUID, UUID) IS 'Restores a soft-deleted object and all related items. search_path fixed.';

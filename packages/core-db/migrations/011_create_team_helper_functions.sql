-- Team helper functions
-- Used in RLS policies for objects and teams.
-- Source: supabase/migrations/remote_schema (extracted)

-- Get the team_id for a given user
CREATE OR REPLACE FUNCTION public.get_user_team_id(user_uuid UUID)
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT team_id FROM team_members WHERE user_id = user_uuid LIMIT 1;
$$;

-- Check if a user is a team owner
CREATE OR REPLACE FUNCTION public.is_team_owner(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM teams WHERE owner_id = user_uuid
  );
$$;

COMMENT ON FUNCTION public.get_user_team_id(UUID) IS
'Returns the team_id for a user. Used in RLS policies.';

COMMENT ON FUNCTION public.is_team_owner(UUID) IS
'Returns true if the user owns a team. Used in RLS policies.';

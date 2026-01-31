/**
 * Team ID Helper
 * Get the current user's team_id from team_members table
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class NoAuthenticatedUserError extends Error {
  constructor() {
    super('No authenticated user found');
    this.name = 'NoAuthenticatedUserError';
  }
}

export class NoTeamMembershipError extends Error {
  constructor(userId: string) {
    super(`User ${userId} has no team membership`);
    this.name = 'NoTeamMembershipError';
  }
}

/**
 * Get the current authenticated user's team_id
 */
export async function getCurrentUserTeamId(supabase: SupabaseClient): Promise<string> {
  // 1) Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new NoAuthenticatedUserError();
  }

  // 2) Get team membership
  const { data: membership, error: membershipError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .single();

  if (membershipError) {
    // PGRST116 = "No rows" for .single()
    if ((membershipError as any).code === 'PGRST116') {
      throw new NoTeamMembershipError(user.id);
    }
    throw membershipError; // real DB/RLS/network error
  }

  if (!membership?.team_id) {
    throw new NoTeamMembershipError(user.id);
  }

  return membership.team_id;
}

/**
 * Non-throwing version
 */
export async function getCurrentUserTeamIdOrNull(
  supabase: SupabaseClient
): Promise<string | null> {
  try {
    return await getCurrentUserTeamId(supabase);
  } catch {
    return null;
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/team
 * Get current user's team with members and pending invitations
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's team (as owner or member)
    const { data: teamMember, error: memberError } = await supabase
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', user.id)
      .single();

    if (memberError || !teamMember) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Get team details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamMember.team_id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Get all team members with profile info
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select(`
        id,
        user_id,
        role,
        joined_at,
        profiles:user_id (
          id,
          name,
          email,
          account_number
        )
      `)
      .eq('team_id', team.id)
      .order('role', { ascending: false }); // owner first

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }

    // Get pending invitations (only if user is owner)
    let invitations = [];
    if (team.owner_id === user.id) {
      const { data: invitationsData } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('team_id', team.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      invitations = invitationsData || [];
    }

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        subscription_plan: team.subscription_plan,
        max_members: team.max_members,
        owner_id: team.owner_id,
        created_at: team.created_at,
      },
      members: members?.map((m: any) => ({
        id: m.id,
        user_id: m.user_id,
        role: m.role,
        joined_at: m.joined_at,
        name: m.profiles?.name || 'Unknown',
        email: m.profiles?.email || '',
        account_number: m.profiles?.account_number || 0,
      })) || [],
      invitations,
      isOwner: team.owner_id === user.id,
      currentUserRole: teamMember.role,
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

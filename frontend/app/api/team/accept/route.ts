import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/team/accept
 * Accept a team invitation using token
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Get user's email
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (!userProfile?.email) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 400 });
    }

    // Find invitation by token
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 400 });
    }

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Update status to expired
      await supabase
        .from('team_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);

      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Check if email matches (case insensitive)
    if (invitation.email.toLowerCase() !== userProfile.email.toLowerCase()) {
      return NextResponse.json({
        error: 'This invitation was sent to a different email address',
        invitedEmail: invitation.email,
      }, { status: 400 });
    }

    // Check if user is already a member of another team
    const { data: existingMembership } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .single();

    if (existingMembership) {
      // Remove from current team if not owner
      const { data: currentTeam } = await supabase
        .from('teams')
        .select('owner_id')
        .eq('id', existingMembership.team_id)
        .single();

      if (currentTeam?.owner_id === user.id) {
        return NextResponse.json({
          error: 'You are an owner of another team. Please transfer ownership first.',
        }, { status: 400 });
      }

      // Remove from current team
      await supabase
        .from('team_members')
        .delete()
        .eq('team_id', existingMembership.team_id)
        .eq('user_id', user.id);
    }

    // Add user to team
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: invitation.team_id,
        user_id: user.id,
        role: 'member',
        invited_by: invitation.invited_by,
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      console.error('Error adding member:', memberError);
      return NextResponse.json({ error: 'Failed to join team' }, { status: 500 });
    }

    // Update invitation status
    await supabase
      .from('team_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    // Get team info
    const { data: team } = await supabase
      .from('teams')
      .select('name')
      .eq('id', invitation.team_id)
      .single();

    return NextResponse.json({
      success: true,
      team: {
        id: invitation.team_id,
        name: team?.name || 'Team',
      },
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/team/accept
 * Get invitation details by token (for preview before accepting)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Find invitation by token
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .select(`
        id,
        email,
        status,
        expires_at,
        created_at,
        teams:team_id (
          name,
          subscription_plan
        ),
        profiles:invited_by (
          name,
          email
        )
      `)
      .eq('token', token)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Check if expired
    const isExpired = new Date(invitation.expires_at) < new Date();

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: isExpired ? 'expired' : invitation.status,
        expires_at: invitation.expires_at,
        created_at: invitation.created_at,
        team_name: (invitation.teams as any)?.name || 'Team',
        team_plan: (invitation.teams as any)?.subscription_plan || 'basic',
        inviter_name: (invitation.profiles as any)?.name || 'Team Owner',
        inviter_email: (invitation.profiles as any)?.email || '',
      },
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canAddTeamMember } from '@/lib/subscription';
import { sendTeamInvitationEmail } from '@/lib/email/notifications';

/**
 * POST /api/team/invite
 * Send team invitation to an email address
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
    const { email, locale = 'el' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get user's team (must be owner)
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Only team owner can invite members' }, { status: 403 });
    }

    // Get owner's profile for subscription info
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier, name')
      .eq('id', user.id)
      .single();

    // Get current member count
    const { count: memberCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', team.id);

    // Check subscription limits
    const tier = (ownerProfile?.subscription_tier || ownerProfile?.subscription_status || 'demo').toLowerCase();
    const canAdd = canAddTeamMember(tier as any, memberCount || 0);

    if (!canAdd.allowed) {
      return NextResponse.json({
        error: canAdd.message,
        upgradeToTier: canAdd.upgradeToTier,
      }, { status: 403 });
    }

    // Check if email is already a member
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', team.id)
        .eq('user_id', existingUser.id)
        .single();

      if (existingMember) {
        return NextResponse.json({ error: 'User is already a team member' }, { status: 400 });
      }
    }

    // Check for existing pending invitation
    const { data: existingInvitation } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('team_id', team.id)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 400 });
    }

    // Generate invitation token
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .insert({
        team_id: team.id,
        email: email.toLowerCase(),
        invited_by: user.id,
        token,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }

    // Send invitation email
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://apallaktis.com'}/${locale}/team-invite?token=${token}`;

    await sendTeamInvitationEmail(
      email,
      ownerProfile?.name || 'Team Owner',
      team.name,
      inviteLink,
      expiresAt,
      locale
    );

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        expires_at: invitation.expires_at,
        created_at: invitation.created_at,
      },
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/team/invite
 * Cancel a pending invitation
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get('id');

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }

    // Get user's team (must be owner)
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Only team owner can cancel invitations' }, { status: 403 });
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('team_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId)
      .eq('team_id', team.id)
      .eq('status', 'pending');

    if (updateError) {
      console.error('Error cancelling invitation:', updateError);
      return NextResponse.json({ error: 'Failed to cancel invitation' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

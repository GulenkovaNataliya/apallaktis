import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * DELETE /api/team/members?id=xxx
 * Remove a member from team (owner only) or leave team (member only)
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
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Get the membership record
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('*, teams:team_id(owner_id)')
      .eq('id', memberId)
      .single();

    if (memberError || !membership) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const teamOwnerId = (membership.teams as any)?.owner_id;
    const isOwner = teamOwnerId === user.id;
    const isSelf = membership.user_id === user.id;

    // Can't remove owner
    if (membership.role === 'owner') {
      return NextResponse.json({ error: 'Cannot remove team owner' }, { status: 400 });
    }

    // Must be owner or removing self
    if (!isOwner && !isSelf) {
      return NextResponse.json({ error: 'Only team owner can remove members' }, { status: 403 });
    }

    // Delete the membership
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (deleteError) {
      console.error('Error removing member:', deleteError);
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
    }

    // If user left a team, create their own team
    if (isSelf && !isOwner) {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, subscription_tier, subscription_status')
        .eq('id', user.id)
        .single();

      // Create new team for the user
      const { data: newTeam } = await supabase
        .from('teams')
        .insert({
          name: profile?.name || 'My Team',
          owner_id: user.id,
          subscription_plan: 'demo',
          max_members: 1,
        })
        .select()
        .single();

      if (newTeam) {
        // Add user as owner of their new team
        await supabase
          .from('team_members')
          .insert({
            team_id: newTeam.id,
            user_id: user.id,
            role: 'owner',
          });
      }
    }

    return NextResponse.json({
      success: true,
      leftTeam: isSelf && !isOwner,
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

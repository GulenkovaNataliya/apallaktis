import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/change-email
 * Changes user's email address
 * Supabase will send a confirmation email to the new address
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get new email from request body
    const body = await request.json();
    const { newEmail } = body;

    if (!newEmail || typeof newEmail !== 'string') {
      return NextResponse.json(
        { error: 'New email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email is same as current
    if (newEmail.toLowerCase() === user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: 'New email must be different from current email' },
        { status: 400 }
      );
    }

    // Check if email is already taken (in profiles table)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', newEmail.toLowerCase())
      .neq('id', user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Email is already in use' },
        { status: 409 }
      );
    }

    // Update email in Supabase Auth
    // This will send a confirmation email to the new address
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (updateError) {
      console.error('Error updating email:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Email change initiated for user ${user.id}: ${user.email} -> ${newEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent to new address. Please check your inbox.',
    });

  } catch (error: any) {
    console.error('Error in change-email:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

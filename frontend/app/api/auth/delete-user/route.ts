import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/delete-user
 * Deletes user from auth.users using admin client
 * This ensures complete cleanup when user deletes their account
 */
export async function POST(request: NextRequest) {
  try {
    // First verify the user is authenticated with regular client
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const userEmail = user.email;

    // Create admin client with service_role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Delete user from auth.users
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete user from auth' },
        { status: 500 }
      );
    }

    console.log(`✅ Deleted auth.users record for: ${userEmail} (${userId})`);

    return NextResponse.json({
      success: true,
      message: 'User deleted from auth.users',
    });

  } catch (error: any) {
    console.error('Error in delete-user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

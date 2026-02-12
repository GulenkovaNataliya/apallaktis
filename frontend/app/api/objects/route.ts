import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTierFromProfile, requireCanCreateObject, guardErrorBody } from '@/lib/access-guard';

/**
 * POST /api/objects
 * Server-side object creation with subscription limit enforcement.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, client_name, client_contact, contract_price, status, color } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Get profile for tier detection
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, vip_expires_at, account_purchased, demo_expires_at, first_month_free_expires_at, subscription_plan, subscription_expires_at')
      .eq('id', user.id)
      .single();

    const tier = getTierFromProfile(profile);

    // Count active (non-deleted) objects
    const { count } = await supabase
      .from('objects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('deleted_at', null);

    const guard = await requireCanCreateObject({ tier, currentCount: count || 0, userId: user.id });
    if (!guard.allowed) {
      return NextResponse.json(guardErrorBody(guard), { status: guard.status });
    }

    // Insert object
    const { data, error } = await supabase
      .from('objects')
      .insert({
        user_id: user.id,
        name,
        address: address || null,
        client_name: client_name || null,
        client_contact: client_contact || null,
        contract_price: contract_price || 0,
        status: status || 'open',
        color: color || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating object:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: unknown) {
    console.error('Error in POST /api/objects:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

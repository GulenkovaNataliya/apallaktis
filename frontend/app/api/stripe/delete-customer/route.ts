import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

/**
 * DELETE /api/stripe/delete-customer
 * Deletes a Stripe customer when user deletes their account
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

    // Get user's profile to find stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Cancel active subscription first (if exists)
    if (profile.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(profile.stripe_subscription_id, {
          invoice_now: false,
          prorate: false,
        });
        console.log(`✅ Cancelled subscription: ${profile.stripe_subscription_id}`);
      } catch (subError: any) {
        // Subscription might already be cancelled
        if (subError.code !== 'resource_missing') {
          console.error('Error cancelling subscription:', subError);
        }
      }
    }

    // Delete Stripe customer (if exists)
    if (profile.stripe_customer_id) {
      try {
        await stripe.customers.del(profile.stripe_customer_id);
        console.log(`✅ Deleted Stripe customer: ${profile.stripe_customer_id}`);
      } catch (stripeError: any) {
        // Customer might already be deleted
        if (stripeError.code !== 'resource_missing') {
          console.error('Error deleting Stripe customer:', stripeError);
          return NextResponse.json(
            { error: 'Failed to delete Stripe customer' },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Stripe customer deleted',
    });

  } catch (error: any) {
    console.error('Error in delete-customer:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

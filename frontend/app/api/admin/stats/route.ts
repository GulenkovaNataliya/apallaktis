import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add proper auth check for admin role

    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get status breakdown
    const { data: profiles } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_plan');

    const statusBreakdown = {
      demo: profiles?.filter((p) => p.subscription_status === 'demo').length || 0,
      active: profiles?.filter((p) => p.subscription_status === 'active').length || 0,
      expired: profiles?.filter((p) => p.subscription_status === 'expired').length || 0,
      vip: profiles?.filter((p) => p.subscription_status === 'vip').length || 0,
      readOnly: profiles?.filter((p) => p.subscription_status === 'read-only').length || 0,
    };

    // Get subscription breakdown
    const subscriptionBreakdown = {
      basic: profiles?.filter((p) => p.subscription_plan === 'basic').length || 0,
      standard: profiles?.filter((p) => p.subscription_plan === 'standard').length || 0,
      premium: profiles?.filter((p) => p.subscription_plan === 'premium').length || 0,
      vip: profiles?.filter((p) => p.subscription_plan === 'vip').length || 0,
    };

    // Calculate monthly revenue (mock data for now)
    // TODO: Implement real revenue calculation from payments table
    const monthlyRevenue =
      subscriptionBreakdown.basic * 20 +
      subscriptionBreakdown.standard * 40 +
      subscriptionBreakdown.premium * 75;

    // Get registrations for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentProfiles } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group by day
    const registrationsChart = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];

      const count = recentProfiles?.filter((p) => {
        const pDate = new Date(p.created_at).toISOString().split('T')[0];
        return pDate === dateStr;
      }).length || 0;

      return {
        date: dateStr,
        count,
      };
    });

    // Get top referrers
    const { data: referrals } = await supabase
      .from('profiles')
      .select('referred_by')
      .not('referred_by', 'is', null);

    const referrerCounts = referrals?.reduce((acc: any, r: any) => {
      if (r.referred_by) {
        acc[r.referred_by] = (acc[r.referred_by] || 0) + 1;
      }
      return acc;
    }, {}) || {};

    const topReferrersIds = Object.entries(referrerCounts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([id]) => id);

    const { data: topReferrersData } = await supabase
      .from('profiles')
      .select('id, email, account_number, name')
      .in('id', topReferrersIds);

    const topReferrers = topReferrersData?.map((r) => ({
      ...r,
      referralCount: referrerCounts[r.id] || 0,
    })) || [];

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      statusBreakdown,
      monthlyRevenue,
      subscriptionBreakdown,
      registrationsChart,
      topReferrers,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale } from "@/lib/messages";
import RewardsSection from "@/components/RewardsSection";
import BackgroundPage from "@/components/BackgroundPage";
import { type User } from "@/types/user";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and fetch user data
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();

        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push(`/${locale}/login`);
          return;
        }

        // Fetch user profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error || !profile) {
          console.error('Error fetching profile:', error);
          router.push(`/${locale}/login`);
          return;
        }

        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          countryCode: profile.country_code,
          accountNumber: profile.account_number,
          createdAt: profile.created_at,
          subscriptionStatus: profile.subscription_status,
          subscriptionExpiresAt: profile.subscription_expires_at,
          demoExpiresAt: profile.demo_expires_at,
          isBusiness: profile.is_business,
          companyName: profile.company_name,
          afm: profile.afm,
          doy: profile.doy,
          address: profile.address,
          accountPurchased: profile.account_purchased || false,
          accountPurchasedAt: profile.account_purchased_at,
          firstMonthFreeExpiresAt: profile.first_month_free_expires_at,
          subscriptionPlan: profile.subscription_plan,
          vipExpiresAt: profile.vip_expires_at,
          vipGrantedBy: profile.vip_granted_by,
          vipReason: profile.vip_reason,
          referralCode: profile.referral_code || '',
          referredBy: profile.referred_by,
          bonusMonths: profile.bonus_months || 0,
        });
      } catch (error) {
        console.error('Auth error:', error);
        router.push(`/${locale}/login`);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [locale, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  // Calculate demo time remaining
  const getDemoTimeRemaining = () => {
    if (!user.demoExpiresAt) return null;
    const now = new Date();
    const expiresAt = new Date(user.demoExpiresAt);
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs <= 0) return "EXPIRED";
    return `${diffHours}h ${diffMins}m`;
  };

  const demoTime = getDemoTimeRemaining();

  return (
    <BackgroundPage pageIndex={1}>
      <div className="flex min-h-screen flex-col items-center gap-12 pb-20" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px' }}>
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <h1
            className="text-slogan font-bold text-center"
            style={{ color: '#ff8f0a' }}
          >
            Dashboard
          </h1>

          {/* User Info Card */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              {user.name}
            </h2>

            <div className="space-y-2 text-body" style={{ color: 'var(--deep-teal)' }}>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              {user.phone && (
                <p>
                  <strong>Phone:</strong> {user.countryCode}{user.phone}
                </p>
              )}
              <p>
                <strong>Account:</strong> #{user.accountNumber}
              </p>
              {user.createdAt && (
                <p>
                  <strong>Registered:</strong> {new Date(user.createdAt).toLocaleDateString()}
                </p>
              )}
              <p>
                <strong>Status:</strong> {user.subscriptionStatus.toUpperCase()}
              </p>
              {user.subscriptionStatus === 'demo' && demoTime && (
                <p style={{ color: demoTime === 'EXPIRED' ? '#ff6a1a' : 'inherit' }}>
                  <strong>DEMO expires:</strong> {demoTime === 'EXPIRED' ? 'EXPIRED' : `in ${demoTime}`}
                </p>
              )}
              {user.isBusiness && (
                <>
                  <p>
                    <strong>Company:</strong> {user.companyName}
                  </p>
                  <p>
                    <strong>ΑΦΜ:</strong> {user.afm}
                  </p>
                  {user.doy && (
                    <p>
                      <strong>ΔΟΥ:</strong> {user.doy}
                    </p>
                  )}
                  {user.address && (
                    <p>
                      <strong>Address:</strong> {user.address}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Payment History Card */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              💳 Payment Information
            </h2>

            <div className="space-y-3 text-body" style={{ color: 'var(--deep-teal)' }}>
              {/* Account Purchase Status */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(1, 49, 45, 0.05)' }}>
                <p className="font-semibold mb-2">Account Purchase (97€ + ΦΠΑ)</p>
                {user.accountPurchased ? (
                  <>
                    <p style={{ color: '#25D366' }}>
                      ✅ <strong>Paid</strong>
                    </p>
                    {user.accountPurchasedAt && (
                      <p className="text-small mt-1">
                        Date: {new Date(user.accountPurchasedAt).toLocaleDateString()}
                      </p>
                    )}
                    {user.firstMonthFreeExpiresAt && (
                      <p className="text-small">
                        First free month expires: {new Date(user.firstMonthFreeExpiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </>
                ) : (
                  <p style={{ color: '#ff6a1a' }}>
                    ❌ <strong>Not paid</strong>
                  </p>
                )}
              </div>

              {/* Subscription Status */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(1, 49, 45, 0.05)' }}>
                <p className="font-semibold mb-2">Monthly Subscription</p>
                {user.subscriptionPlan && user.subscriptionPlan !== 'demo' ? (
                  <>
                    <p>
                      <strong>Plan:</strong> {user.subscriptionPlan.toUpperCase()}
                    </p>
                    {user.subscriptionExpiresAt && (
                      <p className="text-small">
                        Next payment: {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </>
                ) : (
                  <p style={{ color: '#ff6a1a' }}>No active subscription</p>
                )}
              </div>

              {/* Bonus Months */}
              {(user.bonusMonths ?? 0) > 0 && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 143, 10, 0.1)' }}>
                  <p className="font-semibold" style={{ color: '#ff8f0a' }}>
                    🎁 Bonus Months: {user.bonusMonths ?? 0}
                  </p>
                  <p className="text-small mt-1">
                    Will be used automatically before next payment
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Rewards Section */}
          <RewardsSection user={user} locale={locale} />

          {/* Navigation Buttons */}
          <div className="flex flex-col gap-4 w-full">
            <button
              onClick={() => router.push(`/${locale}/page-pay`)}
              className="btn-primary text-button w-full text-center"
              style={{
                backgroundColor: 'var(--zanah)',
                color: 'var(--deep-teal)',
                boxShadow: '0 4px 8px var(--deep-teal)',
                paddingLeft: '30px',
                paddingRight: '30px',
              }}
            >
              📊 Go to Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="btn-primary text-button w-full text-center"
              style={{
                backgroundColor: '#ff6a1a',
                color: '#ffffff',
                boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)',
                paddingLeft: '30px',
                paddingRight: '30px',
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}

"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { type Locale } from "@/lib/messages";
import RewardsSection from "@/components/RewardsSection";
import BackgroundPage from "@/components/BackgroundPage";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, isLoading, locale, router]);

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
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
              👋 {user.name}
            </h2>

            <div className="space-y-2 text-body" style={{ color: 'var(--deep-teal)' }}>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              {user.phone && (
                <p>
                  <strong>Phone:</strong> {user.countryCode} {user.phone}
                </p>
              )}
              <p>
                <strong>Account:</strong> #{user.accountNumber}
              </p>
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
                </>
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
                boxShadow: '0 4px 8px #ff6a1a',
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

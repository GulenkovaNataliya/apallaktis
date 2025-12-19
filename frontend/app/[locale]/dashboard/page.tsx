"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { type Locale } from "@/lib/messages";

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
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 safe-area-top safe-area-bottom py-8">
        <div className="w-full max-w-sm">
          <h1
            className="text-center text-slogan font-semibold mb-8"
            style={{ color: "#ff8f0a" }}
          >
            Dashboard
          </h1>

          {/* User Info */}
          <div
            className="rounded-xl p-6 mb-6"
            style={{ backgroundColor: "var(--polar)" }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: "var(--deep-teal)" }}>
              Welcome, {user.name}!
            </h2>

            <div className="space-y-2 text-body">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              {user.phone && (
                <p>
                  <strong>Phone:</strong> {user.countryCode} {user.phone}
                </p>
              )}
              <p>
                <strong>Status:</strong> {user.subscriptionStatus.toUpperCase()}
              </p>
              {user.subscriptionStatus === 'demo' && demoTime && (
                <p style={{ color: demoTime === "EXPIRED" ? "#ff6a1a" : "inherit" }}>
                  <strong>DEMO expires:</strong> {demoTime === "EXPIRED" ? "EXPIRED" : `in ${demoTime}`}
                </p>
              )}
              {user.referralCode && (
                <p>
                  <strong>Referral Code:</strong> <code>{user.referralCode}</code>
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

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="btn-primary text-button w-full text-center"
            style={{
              backgroundColor: "#ff6a1a",
              color: "#ffffff",
              boxShadow: "0 4px 8px #ff6a1a",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

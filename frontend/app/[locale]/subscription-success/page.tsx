"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";

export default function SubscriptionSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.subscriptionSuccess || messages.el.subscriptionSuccess;

  const [isVerifying, setIsVerifying] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Simulate verification delay
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isVerifying) {
    return (
      <BackgroundPage pageIndex={2}>
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-sm text-center">
            <div className="mb-6 text-6xl">⏳</div>
            <p className="text-heading" style={{ color: "var(--polar)" }}>
              {t?.verifying || "Verifying payment..."}
            </p>
          </div>
        </div>
      </BackgroundPage>
    );
  }

  return (
    <BackgroundPage pageIndex={2}>
      <div className="flex min-h-screen flex-col items-center gap-12 pb-20" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px' }}>
        <div className="w-full max-w-sm space-y-6">
          {/* Success Icon */}
          <div className="text-center text-8xl mb-8">✅</div>

          {/* Success Message */}
          <h1
            className="text-center text-slogan font-bold"
            style={{ color: "#ff8f0a" }}
          >
            {t?.title || "Subscription Activated!"}
          </h1>

          {/* Description */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: "var(--polar)" }}
          >
            <p className="text-body text-center" style={{ color: "var(--deep-teal)" }}>
              {t?.description || "Your subscription has been successfully activated. You can now enjoy all the features of your plan!"}
            </p>
          </div>

          {/* Session ID */}
          {sessionId && (
            <div className="text-center">
              <p className="text-small" style={{ color: "var(--polar)", opacity: 0.6 }}>
                Session ID: {sessionId}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-4 w-full mt-8 items-center">
            <div className="btn-single-wrapper">
              <button
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="btn-primary text-button btn-single text-center"
                style={{
                  backgroundColor: "var(--zanah)",
                  color: "var(--deep-teal)",
                  boxShadow: "0 4px 8px var(--deep-teal)",
                }}
              >
                {t?.goToDashboard || "Go to Dashboard"}
              </button>
            </div>

            <div className="btn-single-wrapper">
              <button
                onClick={() => router.push(`/${locale}/page-pay`)}
                className="btn-primary text-button btn-single text-center"
                style={{
                  backgroundColor: "var(--polar)",
                  color: "var(--deep-teal)",
                  boxShadow: "0 4px 8px var(--deep-teal)",
                }}
              >
                {t?.goToMenu || "Go to Main Menu"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}

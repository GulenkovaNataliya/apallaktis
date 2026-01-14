"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.resetPassword || messages.el.resetPassword;

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    // Simple email validation
    if (!email.includes("@")) {
      setMessage(t.invalidEmail);
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${locale}/update-password`,
      });

      if (error) {
        setMessage(t.error);
      } else {
        setIsSuccess(true);
        setMessage(t.success);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setMessage(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/video/poster.jpg"
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/video/page-01.webm" type="video/webm" />
      </video>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 safe-area-top safe-area-bottom">
        <div className="w-full max-w-sm">
          <h1
            className="text-center text-slogan font-semibold mb-8"
            style={{ color: "var(--polar)" }}
          >
            {t.title}
          </h1>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder={t.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl text-body border border-gray-300 focus:outline-none focus:border-blue-500"
                  style={{ minHeight: "52px", paddingLeft: '40px', paddingRight: '40px', color: 'white' }}
                />
              </div>

              {message && (
                <p
                  className="text-center text-sm"
                  style={{
                    color: isSuccess ? "var(--zanah)" : "#ff6a1a",
                  }}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl text-button font-semibold"
                style={{
                  backgroundColor: "var(--polar)",
                  color: "var(--deep-teal)",
                  boxShadow: "0 4px 8px var(--deep-teal)",
                  minHeight: "52px",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "..." : t.sendLink}
              </button>
            </form>
          ) : (
            <div
              className="rounded-2xl p-6 text-center"
              style={{ backgroundColor: "var(--polar)" }}
            >
              <p className="text-body" style={{ color: "var(--deep-teal)" }}>
                {message}
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href={`/${locale}/login`}
              className="text-button"
              style={{ color: "var(--polar)" }}
            >
              {t.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

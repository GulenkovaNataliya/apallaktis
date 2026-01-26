"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
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
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/pages/page-03.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          height: '100%',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center px-4 safe-area-top safe-area-bottom" style={{ paddingTop: '180px', paddingLeft: '40px', paddingRight: '40px' }}>
        <div className="w-full max-w-sm flex flex-col gap-12">
          {/* Back */}
          <p
            onClick={() => router.push(`/${locale}/login`)}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {t.backToLogin}
          </p>

          <h1
            className="text-center text-slogan font-semibold"
            style={{ color: "#ff8f0a" }}
          >
            {t.title}
          </h1>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-12">
              <input
                type="email"
                placeholder={t.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-body w-full rounded-2xl border border-gray-300 focus:outline-none focus:border-blue-500"
                style={{ minHeight: '52px', padding: '12px', color: 'white' }}
              />

              {message && (
                <p
                  className="text-center text-sm px-2"
                  style={{ color: "#ff6a1a" }}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary text-button w-full text-center"
                style={{
                  minHeight: '52px',
                  backgroundColor: "var(--polar)",
                  color: "var(--deep-teal)",
                  boxShadow: "0 4px 8px var(--deep-teal)",
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
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
        </div>
      </div>
    </div>
  );
}

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
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/pages/page-01.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          height: '100%',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 safe-area-top safe-area-bottom py-8">
        <div className="w-full max-w-sm">
          <h1
            className="text-center text-slogan font-semibold"
            style={{ color: "#ff8f0a", marginBottom: "80px" }}
          >
            {t.title}
          </h1>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <input
                type="email"
                placeholder={t.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-body w-full rounded-2xl border border-gray-300 focus:outline-none focus:border-blue-500"
                style={{ minHeight: '52px', paddingLeft: '40px', paddingRight: '40px', color: 'white' }}
              />

              {message && (
                <p
                  className="text-center text-sm px-2"
                  style={{ color: "#ff6a1a" }}
                >
                  {message}
                </p>
              )}

              <div className="btn-single-wrapper mt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary text-button btn-single text-center"
                  style={{
                    backgroundColor: "var(--polar)",
                    color: "var(--deep-teal)",
                    boxShadow: "0 4px 8px var(--deep-teal)",
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {isLoading ? "..." : t.sendLink}
                </button>
              </div>

              <Link
                href={`/${locale}/login`}
                className="text-center text-sm mt-4"
                style={{ color: "#daf3f6" }}
              >
                {t.backToLogin}
              </Link>
            </form>
          ) : (
            <div
              className="rounded-2xl p-6 text-center"
              style={{ backgroundColor: "var(--polar)" }}
            >
              <p className="text-body" style={{ color: "var(--deep-teal)" }}>
                {message}
              </p>
              <Link
                href={`/${locale}/login`}
                className="text-center text-sm mt-4 block"
                style={{ color: "var(--deep-teal)", opacity: 0.8 }}
              >
                {t.backToLogin}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

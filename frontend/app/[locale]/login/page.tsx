"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.login || messages.el.login;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        // Check if error is due to unconfirmed email
        if (signInError.message.includes('Email not confirmed') ||
            signInError.message.includes('email_not_confirmed') ||
            signInError.message.includes('not confirmed')) {
          setError(t.emailNotConfirmed);
        } else {
          setError(t.invalidCredentials);
        }
        setIsLoading(false);
        return;
      }

      // Check if email is confirmed (backup check)
      if (data.user && !data.user.email_confirmed_at) {
        setError(t.emailNotConfirmed);
        setIsLoading(false);
        return;
      }

      // Success! Redirect to page-pay (main dashboard entry point)
      router.push(`/${locale}/page-pay`);
    } catch (err) {
      console.error('Login error:', err);
      setError(t.error);
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
      <div className="relative z-10 flex min-h-screen flex-col items-center px-4 safe-area-top safe-area-bottom" style={{ paddingTop: '180px', paddingLeft: '40px', paddingRight: '40px' }}>
        <div className="w-full max-w-sm flex flex-col gap-12">
          {/* Back */}
          <p
            onClick={() => router.push(`/${locale}`)}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {t.backToHome}
          </p>

          <h1
            className="text-center text-slogan font-semibold"
            style={{ color: "#ff8f0a" }}
          >
            {t.title}
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-12">
            {/* Email */}
            <input
              type="email"
              placeholder={t.email}
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setError("");
              }}
              required
              className="text-body w-full rounded-2xl border border-gray-300 focus:outline-none focus:border-blue-500"
              style={{ minHeight: '52px', padding: '12px', color: 'white' }}
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t.password}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setError("");
                }}
                required
                className="text-body w-full rounded-2xl border border-gray-300 focus:outline-none focus:border-blue-500"
                style={{ minHeight: '52px', padding: '12px 50px 12px 12px', color: 'white' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--polar)', fontSize: '20px' }}
              >
                {showPassword ? '\u{1F441}' : '\u{1F441}\u200D\u{1F5E8}'}
              </button>
            </div>

            {/* Forgot Password Link */}
            <Link
              href={`/${locale}/reset-password`}
              className="text-sm text-right block"
              style={{ color: "var(--polar)", opacity: 0.8 }}
            >
              {t.forgotPassword}
            </Link>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-center px-2" style={{ color: "#ff6a1a" }}>
                {error}
              </p>
            )}

            {/* Submit Button */}
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
              {isLoading ? "..." : t.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.login || messages.el.login;
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_LOGIN_URL || 'http://localhost:5678/webhook/login';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Use auth context to save token and user
        login(data.token, data.user);

        // Redirect to dashboard
        router.push(`/${locale}/dashboard`);
      } else {
        setError(data.error || t.invalidCredentials);
      }
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
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 safe-area-top safe-area-bottom py-8">
        <div className="w-full max-w-sm">
          <h1
            className="text-center text-slogan font-semibold mb-12"
            style={{ color: "#ff8f0a" }}
          >
            {t.title}
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
              className="text-body rounded-xl px-6 py-4 border border-gray-300 focus:outline-none focus:border-blue-500"
            />

            {/* Password */}
            <input
              type="password"
              placeholder={t.password}
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setError("");
              }}
              required
              className="text-body rounded-xl px-6 py-4 border border-gray-300 focus:outline-none focus:border-blue-500"
            />

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
              className="btn-primary text-button w-full text-center mt-4"
              style={{
                backgroundColor: "var(--polar)",
                color: "var(--deep-teal)",
                boxShadow: "0 4px 8px var(--deep-teal)",
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "..." : t.submit}
            </button>

            {/* Back to Home Link */}
            <Link
              href={`/${locale}`}
              className="text-center text-sm mt-4"
              style={{ color: "var(--deep-teal)" }}
            >
              {t.backToHome}
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

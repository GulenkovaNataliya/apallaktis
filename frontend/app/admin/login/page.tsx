"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

const ADMIN_EMAIL = "gulenkovanatalia@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Check if email is admin
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setError("Доступ запрещён");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    // Sign in with Supabase
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    if (!data.user) {
      setError("Ошибка авторизации");
      setIsLoading(false);
      return;
    }

    // Check admin role via RPC (bypasses RLS)
    const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");

    if (rpcError) {
      console.error("RPC is_admin error:", rpcError);
      setError("Ошибка проверки прав: " + rpcError.message);
      await supabase.auth.signOut();
      setIsLoading(false);
      return;
    }

    if (isAdmin !== true) {
      setError("Доступ запрещён");
      await supabase.auth.signOut();
      setIsLoading(false);
      return;
    }

    // Set admin session flag
    sessionStorage.setItem("adminLoggedIn", "true");

    // Redirect to admin panel
    router.push("/admin");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        fontFamily: "'Manrope', sans-serif",
        padding: "20px",
      }}
    >
      {/* Logo */}
      <Image
        src="/Apallaktis.photos/apallaktis-logo-orange@2x.png"
        alt="APALLAKTIS"
        width={200}
        height={50}
        style={{ marginBottom: "40px" }}
      />

      {/* Title */}
      <h1
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "#1a1a2e",
          marginBottom: "30px",
          textAlign: "center",
        }}
      >
        Вход для администратора
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Email */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 600,
              fontSize: "14px",
              color: "#1a1a2e",
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              border: "2px solid #e9ecef",
              borderRadius: "12px",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#FF6B35")}
            onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
          />
        </div>

        {/* Password */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 600,
              fontSize: "14px",
              color: "#1a1a2e",
            }}
          >
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              border: "2px solid #e9ecef",
              borderRadius: "12px",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#FF6B35")}
            onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#f8d7da",
              color: "#721c24",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "16px",
            background: isLoading
              ? "#ccc"
              : "linear-gradient(135deg, #FF6B35, #f5af19)",
            border: "none",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "18px",
            fontWeight: 700,
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "opacity 0.2s",
          }}
        >
          {isLoading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}

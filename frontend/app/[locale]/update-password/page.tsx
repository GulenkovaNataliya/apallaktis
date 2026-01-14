"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";

  const t = {
    el: {
      title: "Νέος Κωδικός",
      newPassword: "Νέος Κωδικός",
      confirmPassword: "Επιβεβαίωση Κωδικού",
      updateButton: "Ενημέρωση Κωδικού",
      success: "Ο κωδικός σας ενημερώθηκε!",
      error: "Σφάλμα. Παρακαλώ δοκιμάστε ξανά.",
      passwordMismatch: "Οι κωδικοί δεν ταιριάζουν",
      passwordTooShort: "Ο κωδικός πρέπει να είναι τουλάχιστον 6 χαρακτήρες",
      redirecting: "Ανακατεύθυνση...",
    },
    ru: {
      title: "Новый Пароль",
      newPassword: "Новый Пароль",
      confirmPassword: "Подтвердите Пароль",
      updateButton: "Обновить Пароль",
      success: "Ваш пароль обновлён!",
      error: "Ошибка. Попробуйте ещё раз.",
      passwordMismatch: "Пароли не совпадают",
      passwordTooShort: "Пароль должен быть не менее 6 символов",
      redirecting: "Перенаправление...",
    },
    en: {
      title: "New Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      updateButton: "Update Password",
      success: "Your password has been updated!",
      error: "Error. Please try again.",
      passwordMismatch: "Passwords do not match",
      passwordTooShort: "Password must be at least 6 characters",
      redirecting: "Redirecting...",
    },
    uk: {
      title: "Новий Пароль",
      newPassword: "Новий Пароль",
      confirmPassword: "Підтвердьте Пароль",
      updateButton: "Оновити Пароль",
      success: "Ваш пароль оновлено!",
      error: "Помилка. Спробуйте ще раз.",
      passwordMismatch: "Паролі не співпадають",
      passwordTooShort: "Пароль має бути не менше 6 символів",
      redirecting: "Перенаправлення...",
    },
    sq: {
      title: "Fjalëkalim i Ri",
      newPassword: "Fjalëkalim i Ri",
      confirmPassword: "Konfirmo Fjalëkalimin",
      updateButton: "Përditëso Fjalëkalimin",
      success: "Fjalëkalimi juaj u përditësua!",
      error: "Gabim. Ju lutemi provoni përsëri.",
      passwordMismatch: "Fjalëkalimet nuk përputhen",
      passwordTooShort: "Fjalëkalimi duhet të jetë të paktën 6 karaktere",
      redirecting: "Duke ridrejtuar...",
    },
    bg: {
      title: "Нова Парола",
      newPassword: "Нова Парола",
      confirmPassword: "Потвърдете Паролата",
      updateButton: "Обновяване на Паролата",
      success: "Вашата парола е обновена!",
      error: "Грешка. Моля опитайте отново.",
      passwordMismatch: "Паролите не съвпадат",
      passwordTooShort: "Паролата трябва да бъде поне 6 символа",
      redirecting: "Пренасочване...",
    },
    ro: {
      title: "Parolă Nouă",
      newPassword: "Parolă Nouă",
      confirmPassword: "Confirmă Parola",
      updateButton: "Actualizează Parola",
      success: "Parola dvs. a fost actualizată!",
      error: "Eroare. Vă rugăm încercați din nou.",
      passwordMismatch: "Parolele nu se potrivesc",
      passwordTooShort: "Parola trebuie să aibă cel puțin 6 caractere",
      redirecting: "Redirecționare...",
    },
    ar: {
      title: "كلمة مرور جديدة",
      newPassword: "كلمة مرور جديدة",
      confirmPassword: "تأكيد كلمة المرور",
      updateButton: "تحديث كلمة المرور",
      success: "!تم تحديث كلمة المرور الخاصة بك",
      error: ".خطأ. يرجى المحاولة مرة أخرى",
      passwordMismatch: "كلمات المرور غير متطابقة",
      passwordTooShort: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      redirecting: "...جارٍ إعادة التوجيه",
    },
  };

  const translations = t[locale as keyof typeof t] || t.el;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    // Validation
    if (password.length < 6) {
      setMessage(translations.passwordTooShort);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage(translations.passwordMismatch);
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setMessage(translations.error);
        console.error("Update password error:", error);
      } else {
        setIsSuccess(true);
        setMessage(translations.success);

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 2000);
      }
    } catch (err) {
      console.error("Update password error:", err);
      setMessage(translations.error);
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
          backgroundImage: "url('/video/poster.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 safe-area-top safe-area-bottom">
        <div className="w-full max-w-sm">
          <h1
            className="text-center text-slogan font-semibold mb-8"
            style={{ color: "var(--slogan-color)" }}
          >
            {translations.title}
          </h1>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder={translations.newPassword}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl px-6 text-body border border-gray-300 focus:outline-none focus:border-blue-500"
                  style={{ minHeight: "52px" }}
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder={translations.confirmPassword}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl px-6 text-body border border-gray-300 focus:outline-none focus:border-blue-500"
                  style={{ minHeight: "52px" }}
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
                {isLoading ? "..." : translations.updateButton}
              </button>
            </form>
          ) : (
            <div
              className="rounded-2xl p-6 text-center"
              style={{ backgroundColor: "var(--polar)" }}
            >
              <p className="text-body mb-2" style={{ color: "var(--deep-teal)" }}>
                {message}
              </p>
              <p className="text-sm" style={{ color: "var(--deep-teal)", opacity: 0.7 }}>
                {translations.redirecting}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

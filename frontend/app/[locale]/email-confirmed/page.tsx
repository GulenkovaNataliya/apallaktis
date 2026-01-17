"use client";

import { useParams, useRouter } from "next/navigation";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";

// Translations
const translations = {
  el: {
    title: "Email Επιβεβαιώθηκε!",
    subtitle: "Το email σας επιβεβαιώθηκε με επιτυχία",
    message: "Τώρα μπορείτε να συνδεθείτε στον λογαριασμό σας και να αρχίσετε να χρησιμοποιείτε την εφαρμογή.",
    login: "Σύνδεση",
  },
  ru: {
    title: "Email Подтверждён!",
    subtitle: "Ваш email успешно подтверждён",
    message: "Теперь вы можете войти в свой аккаунт и начать использовать приложение.",
    login: "Войти",
  },
  en: {
    title: "Email Confirmed!",
    subtitle: "Your email has been successfully verified",
    message: "You can now log in to your account and start using the application.",
    login: "Log In",
  },
  uk: {
    title: "Email Підтверджено!",
    subtitle: "Ваш email успішно підтверджено",
    message: "Тепер ви можете увійти до свого акаунту та почати користуватися додатком.",
    login: "Увійти",
  },
  sq: {
    title: "Email-i u Konfirmua!",
    subtitle: "Email-i juaj u verifikua me sukses",
    message: "Tani mund të hyni në llogarinë tuaj dhe të filloni të përdorni aplikacionin.",
    login: "Hyrje",
  },
  bg: {
    title: "Имейлът е Потвърден!",
    subtitle: "Вашият имейл беше успешно потвърден",
    message: "Сега можете да влезете в акаунта си и да започнете да използвате приложението.",
    login: "Вход",
  },
  ro: {
    title: "Email Confirmat!",
    subtitle: "Email-ul dvs. a fost verificat cu succes",
    message: "Acum vă puteți conecta la contul dvs. și să începeți să utilizați aplicația.",
    login: "Conectare",
  },
  ar: {
    title: "تم تأكيد البريد الإلكتروني!",
    subtitle: "تم التحقق من بريدك الإلكتروني بنجاح",
    message: "يمكنك الآن تسجيل الدخول إلى حسابك والبدء في استخدام التطبيق.",
    login: "تسجيل الدخول",
  },
};

export default function EmailConfirmedPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const isRTL = locale === "ar";

  const t = translations[locale] || translations.el;

  return (
    <BackgroundPage pageIndex={1}>
      <div
        className="flex min-h-screen flex-col items-center gap-8 px-4"
        style={{ direction: isRTL ? "rtl" : "ltr", paddingTop: "160px" }}
      >
        <div className="w-full max-w-sm space-y-6 text-center">
          {/* Success Icon */}
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: "#25D366" }}
          >
            <svg
              className="h-12 w-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h1
            className="text-slogan font-bold"
            style={{ color: "var(--orange)" }}
          >
            {t.title}
          </h1>

          {/* Message */}
          <p
            className="text-body"
            style={{ color: "var(--zanah)", marginTop: "40px" }}
          >
            {t.message}
          </p>

          {/* Login Button */}
          <div className="btn-single-wrapper" style={{ marginTop: "40px" }}>
            <button
              onClick={() => router.push(`/${locale}/login`)}
              className="btn-primary text-button btn-single"
              style={{
                minHeight: "52px",
                backgroundColor: "var(--zanah)",
                color: "var(--deep-teal)",
                boxShadow: "0 4px 8px var(--deep-teal)",
              }}
            >
              {t.login}
            </button>
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}

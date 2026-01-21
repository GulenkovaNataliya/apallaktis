"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";

// Translations
const translations = {
  el: {
    title: "Επιβεβαιώστε το Email σας",
    subtitle: "Το email σας δεν έχει επιβεβαιωθεί ακόμα",
    message: "Ελέγξτε τα εισερχόμενά σας για το email επιβεβαίωσης. Αν δεν το βρείτε, ελέγξτε τον φάκελο spam.",
    resend: "Αποστολή Νέου Email",
    resending: "Αποστολή...",
    sent: "Email Απεστάλη!",
    sentMessage: "Ελέγξτε τα εισερχόμενά σας",
    error: "Σφάλμα κατά την αποστολή",
    logout: "Αποσύνδεση",
    checkSpam: "Ελέγξτε επίσης τον φάκελο spam/junk",
  },
  ru: {
    title: "Подтвердите ваш Email",
    subtitle: "Ваш email ещё не подтверждён",
    message: "Проверьте входящие сообщения для письма с подтверждением. Если не найдёте, проверьте папку спам.",
    resend: "Отправить Повторно",
    resending: "Отправка...",
    sent: "Email Отправлен!",
    sentMessage: "Проверьте входящие",
    error: "Ошибка отправки",
    logout: "Выйти",
    checkSpam: "Также проверьте папку спам/нежелательные",
  },
  en: {
    title: "Confirm Your Email",
    subtitle: "Your email has not been verified yet",
    message: "Check your inbox for the confirmation email. If you can't find it, check your spam folder.",
    resend: "Resend Email",
    resending: "Sending...",
    sent: "Email Sent!",
    sentMessage: "Check your inbox",
    error: "Error sending email",
    logout: "Log Out",
    checkSpam: "Also check your spam/junk folder",
  },
  uk: {
    title: "Підтвердіть ваш Email",
    subtitle: "Ваш email ще не підтверджено",
    message: "Перевірте вхідні повідомлення на наявність листа з підтвердженням. Якщо не знайдете, перевірте папку спам.",
    resend: "Надіслати Повторно",
    resending: "Надсилання...",
    sent: "Email Надіслано!",
    sentMessage: "Перевірте вхідні",
    error: "Помилка надсилання",
    logout: "Вийти",
    checkSpam: "Також перевірте папку спам/небажані",
  },
  sq: {
    title: "Konfirmoni Email-in Tuaj",
    subtitle: "Email-i juaj nuk është verifikuar ende",
    message: "Kontrolloni kutinë tuaj për email-in e konfirmimit. Nëse nuk e gjeni, kontrolloni dosjen spam.",
    resend: "Ridërgo Email",
    resending: "Duke dërguar...",
    sent: "Email u Dërgua!",
    sentMessage: "Kontrolloni kutinë",
    error: "Gabim gjatë dërgimit",
    logout: "Dilni",
    checkSpam: "Kontrolloni gjithashtu dosjen spam/junk",
  },
  bg: {
    title: "Потвърдете Имейла Си",
    subtitle: "Вашият имейл все още не е потвърден",
    message: "Проверете входящата си поща за имейл с потвърждение. Ако не го намерите, проверете папката спам.",
    resend: "Изпрати Отново",
    resending: "Изпращане...",
    sent: "Имейлът е Изпратен!",
    sentMessage: "Проверете входящата поща",
    error: "Грешка при изпращане",
    logout: "Изход",
    checkSpam: "Също проверете папката спам/нежелани",
  },
  ro: {
    title: "Confirmați Email-ul",
    subtitle: "Email-ul dvs. nu a fost verificat încă",
    message: "Verificați inbox-ul pentru email-ul de confirmare. Dacă nu îl găsiți, verificați folderul spam.",
    resend: "Retrimite Email",
    resending: "Se trimite...",
    sent: "Email Trimis!",
    sentMessage: "Verificați inbox-ul",
    error: "Eroare la trimitere",
    logout: "Deconectare",
    checkSpam: "Verificați și folderul spam/junk",
  },
  ar: {
    title: "أكد بريدك الإلكتروني",
    subtitle: "لم يتم التحقق من بريدك الإلكتروني بعد",
    message: "تحقق من صندوق الوارد للحصول على رسالة التأكيد. إذا لم تجدها، تحقق من مجلد البريد العشوائي.",
    resend: "إعادة إرسال البريد",
    resending: "جاري الإرسال...",
    sent: "تم إرسال البريد!",
    sentMessage: "تحقق من صندوق الوارد",
    error: "خطأ في الإرسال",
    logout: "تسجيل الخروج",
    checkSpam: "تحقق أيضاً من مجلد البريد العشوائي",
  },
};

export default function EmailNotConfirmedPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const isRTL = locale === "ar";

  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sent" | "error">("idle");

  const t = translations[locale] || translations.el;

  const handleResend = async () => {
    setIsResending(true);
    setResendStatus("idle");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.email) {
        setResendStatus("error");
        return;
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
      });

      if (error) {
        console.error("Error resending confirmation:", error);
        setResendStatus("error");
      } else {
        setResendStatus("sent");
      }
    } catch (error) {
      console.error("Error:", error);
      setResendStatus("error");
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  return (
    <BackgroundPage pageIndex={1}>
      <div
        className="flex min-h-screen flex-col items-center gap-8"
        style={{ direction: isRTL ? "rtl" : "ltr", paddingTop: "160px", paddingLeft: "40px", paddingRight: "40px" }}
      >
        <div className="w-full max-w-sm space-y-6 text-center">
          {/* Warning Icon */}
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--orange)" }}
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
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

          {/* Subtitle */}
          <p
            className="text-heading"
            style={{ color: "var(--zanah)", marginTop: "40px" }}
          >
            {t.subtitle}
          </p>

          {/* Message */}
          <p
            className="text-body"
            style={{ color: "var(--zanah)" }}
          >
            {t.message}
          </p>

          {/* Check Spam Note */}
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: "var(--orange)" }}
          >
            <p className="text-body" style={{ color: "var(--deep-teal)" }}>
              {t.checkSpam}
            </p>
          </div>

          {/* Resend Status */}
          {resendStatus === "sent" && (
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: "#25D366", color: "white" }}
            >
              <p className="font-semibold">{t.sent}</p>
              <p className="text-small">{t.sentMessage}</p>
            </div>
          )}

          {resendStatus === "error" && (
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: "#ff6a1a", color: "white" }}
            >
              <p className="font-semibold">{t.error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-12 items-center" style={{ marginTop: "40px" }}>
            <div className="btn-single-wrapper">
              <button
                onClick={handleResend}
                disabled={isResending}
                className="btn-primary text-button btn-single"
                style={{
                  minHeight: "52px",
                  backgroundColor: "var(--zanah)",
                  color: "var(--deep-teal)",
                  boxShadow: "0 4px 8px var(--deep-teal)",
                  opacity: isResending ? 0.7 : 1,
                }}
              >
                {isResending ? t.resending : t.resend}
              </button>
            </div>

            <div className="btn-single-wrapper">
              <button
                onClick={handleLogout}
                className="btn-primary text-button btn-single"
                style={{
                  minHeight: "52px",
                  backgroundColor: "rgba(1, 49, 45, 0.1)",
                  color: "var(--zanah)",
                }}
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}

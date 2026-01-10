// Phone Verification Component
// ============================
// Компонент для верификации номера телефона через SMS

"use client";

import { useState } from "react";

interface PhoneVerificationProps {
  userId: string;
  initialPhone?: string;
  onVerified: (phone: string) => void;
  locale?: string;
}

export default function PhoneVerification({
  userId,
  initialPhone = "",
  onVerified,
  locale = "el",
}: PhoneVerificationProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  // Тексты на разных языках
  const texts: Record<string, any> = {
    el: {
      phoneLabel: "Αριθμός τηλεφώνου",
      phonePlaceholder: "+30 123 456 7890",
      sendCode: "Αποστολή κωδικού",
      codeLabel: "Κωδικός επαλήθευσης",
      codePlaceholder: "123456",
      verify: "Επαλήθευση",
      resend: "Αποστολή ξανά",
      phoneRequired: "Παρακαλώ εισάγετε αριθμό τηλεφώνου",
      codeRequired: "Παρακαλώ εισάγετε κωδικό",
      smsSent: "Κωδικός στάλθηκε!",
      verified: "Το τηλέφωνο επαληθεύτηκε!",
      codeExpires: "Ο κωδικός λήγει σε 10 λεπτά",
    },
    ru: {
      phoneLabel: "Номер телефона",
      phonePlaceholder: "+7 123 456 7890",
      sendCode: "Отправить код",
      codeLabel: "Код верификации",
      codePlaceholder: "123456",
      verify: "Проверить",
      resend: "Отправить снова",
      phoneRequired: "Введите номер телефона",
      codeRequired: "Введите код",
      smsSent: "Код отправлен!",
      verified: "Телефон подтвержден!",
      codeExpires: "Код действителен 10 минут",
    },
    uk: {
      phoneLabel: "Номер телефону",
      phonePlaceholder: "+380 123 456 7890",
      sendCode: "Надіслати код",
      codeLabel: "Код верифікації",
      codePlaceholder: "123456",
      verify: "Перевірити",
      resend: "Надіслати знову",
      phoneRequired: "Введіть номер телефону",
      codeRequired: "Введіть код",
      smsSent: "Код надіслано!",
      verified: "Телефон підтверджено!",
      codeExpires: "Код дійсний 10 хвилин",
    },
    sq: {
      phoneLabel: "Numri i telefonit",
      phonePlaceholder: "+355 123 456 7890",
      sendCode: "Dërgo kodin",
      codeLabel: "Kodi i verifikimit",
      codePlaceholder: "123456",
      verify: "Verifiko",
      resend: "Ridërgo",
      phoneRequired: "Ju lutemi vendosni numrin e telefonit",
      codeRequired: "Ju lutemi vendosni kodin",
      smsSent: "Kodi u dërgua!",
      verified: "Telefoni u verifikua!",
      codeExpires: "Kodi skadon në 10 minuta",
    },
    bg: {
      phoneLabel: "Телефонен номер",
      phonePlaceholder: "+359 123 456 7890",
      sendCode: "Изпрати код",
      codeLabel: "Код за потвърждение",
      codePlaceholder: "123456",
      verify: "Потвърди",
      resend: "Изпрати отново",
      phoneRequired: "Моля, въведете телефонен номер",
      codeRequired: "Моля, въведете код",
      smsSent: "Кодът е изпратен!",
      verified: "Телефонът е потвърден!",
      codeExpires: "Кодът е валиден 10 минути",
    },
    ro: {
      phoneLabel: "Număr de telefon",
      phonePlaceholder: "+40 123 456 7890",
      sendCode: "Trimite cod",
      codeLabel: "Cod de verificare",
      codePlaceholder: "123456",
      verify: "Verifică",
      resend: "Retrimite",
      phoneRequired: "Vă rugăm introduceți numărul de telefon",
      codeRequired: "Vă rugăm introduceți codul",
      smsSent: "Codul a fost trimis!",
      verified: "Telefonul a fost verificat!",
      codeExpires: "Codul expiră în 10 minute",
    },
    en: {
      phoneLabel: "Phone number",
      phonePlaceholder: "+1 123 456 7890",
      sendCode: "Send code",
      codeLabel: "Verification code",
      codePlaceholder: "123456",
      verify: "Verify",
      resend: "Resend",
      phoneRequired: "Please enter phone number",
      codeRequired: "Please enter code",
      smsSent: "Code sent!",
      verified: "Phone verified!",
      codeExpires: "Code expires in 10 minutes",
    },
    ar: {
      phoneLabel: "رقم الهاتف",
      phonePlaceholder: "+20 123 456 7890",
      sendCode: "إرسال الرمز",
      codeLabel: "رمز التحقق",
      codePlaceholder: "123456",
      verify: "تحقق",
      resend: "إعادة الإرسال",
      phoneRequired: "الرجاء إدخال رقم الهاتف",
      codeRequired: "الرجاء إدخال الرمز",
      smsSent: "تم إرسال الرمز!",
      verified: "تم التحقق من الهاتف!",
      codeExpires: "الرمز صالح لمدة 10 دقائق",
    },
  };

  const t = texts[locale] || texts.en;

  async function handleSendCode() {
    setError("");

    if (!phone.trim()) {
      setError(t.phoneRequired);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/sms/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send code");
        setIsLoading(false);
        return;
      }

      setExpiresAt(data.expiresAt);
      setStep("code");
      alert(t.smsSent);
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyCode() {
    setError("");

    if (!code.trim()) {
      setError(t.codeRequired);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/sms/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, userId, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid code");
        setIsLoading(false);
        return;
      }

      alert(t.verified);
      onVerified(phone);
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {step === "phone" ? (
        <>
          {/* Phone Input */}
          <div>
            <label
              className="text-sm font-semibold mb-2 block"
              style={{ color: "var(--deep-teal)" }}
            >
              {t.phoneLabel}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.phonePlaceholder}
              className="w-full px-4 py-2 rounded-xl border-2"
              style={{
                borderColor: "var(--zanah)",
                color: "var(--deep-teal)",
              }}
              disabled={isLoading}
            />
          </div>

          {/* Send Code Button */}
          <button
            onClick={handleSendCode}
            disabled={isLoading}
            className="btn-primary text-button w-full"
            style={{
              backgroundColor: "var(--zanah)",
              color: "var(--deep-teal)",
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            {isLoading ? "..." : t.sendCode}
          </button>
        </>
      ) : (
        <>
          {/* Code Input */}
          <div>
            <label
              className="text-sm font-semibold mb-2 block"
              style={{ color: "var(--deep-teal)" }}
            >
              {t.codeLabel}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder={t.codePlaceholder}
              maxLength={6}
              className="w-full px-4 py-2 rounded-xl border-2 text-center text-2xl tracking-widest"
              style={{
                borderColor: "var(--zanah)",
                color: "var(--deep-teal)",
              }}
              disabled={isLoading}
            />
            <p className="text-xs mt-2" style={{ color: "var(--deep-teal)" }}>
              {t.codeExpires}
            </p>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyCode}
            disabled={isLoading || code.length !== 6}
            className="btn-primary text-button w-full"
            style={{
              backgroundColor: "#10b981",
              color: "#ffffff",
              opacity: isLoading || code.length !== 6 ? 0.5 : 1,
            }}
          >
            {isLoading ? "..." : t.verify}
          </button>

          {/* Resend Button */}
          <button
            onClick={() => {
              setCode("");
              setStep("phone");
            }}
            className="text-button w-full"
            style={{
              color: "var(--deep-teal)",
              textDecoration: "underline",
            }}
          >
            {t.resend}
          </button>
        </>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-center" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}

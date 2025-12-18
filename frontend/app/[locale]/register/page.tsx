"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";

// Common country codes for the region
const countryCodes = [
  { code: "+30", country: "GR" },
  { code: "+7", country: "RU" },
  { code: "+380", country: "UA" },
  { code: "+355", country: "AL" },
  { code: "+359", country: "BG" },
  { code: "+40", country: "RO" },
  { code: "+1", country: "US/CA" },
  { code: "+966", country: "SA" },
];

// Email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation function (basic - checks if it has digits)
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\d{6,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
};

// AFM validation function (must be exactly 9 digits)
const isValidAfm = (afm: string): boolean => {
  const afmRegex = /^\d{9}$/;
  return afmRegex.test(afm);
};

export default function RegisterPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.register || messages.el.register;
  const tLanding = messages[locale]?.landing || messages.el.landing;

  const [invoiceType, setInvoiceType] = useState<"invoice" | "receipt">("receipt");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+30",
    companyName: "",
    afm: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    afm: "",
  });

  const validateForm = (): boolean => {
    const newErrors = { email: "", phone: "", afm: "" };
    let isValid = true;

    // Validate email
    if (!isValidEmail(formData.email)) {
      newErrors.email = t.invalidEmail;
      isValid = false;
    }

    // Validate phone
    if (!isValidPhone(formData.phone)) {
      newErrors.phone = t.invalidPhone;
      isValid = false;
    }

    // Validate AFM (only if invoice type is selected)
    if (invoiceType === "invoice" && !isValidAfm(formData.afm)) {
      newErrors.afm = t.invalidAfm;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      alert(t.mustAgreeTerms);
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      // Отправка данных напрямую в n8n webhook
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/register';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceType,
          name: formData.name,
          email: formData.email,
          phone: formData.countryCode + formData.phone,
          companyName: formData.companyName || null,
          afm: formData.afm || null,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message || 'Η εγγραφή σας ολοκληρώθηκε επιτυχώς!');
        // Очистка формы после успешной регистрации
        setFormData({
          name: "",
          email: "",
          phone: "",
          countryCode: "+30",
          companyName: "",
          afm: "",
        });
        setAgreeTerms(false);
      } else {
        alert(data.error || 'Σφάλμα κατά την εγγραφή. Παρακαλώ δοκιμάστε ξανά.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Σφάλμα σύνδεσης. Παρακαλώ ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-4 safe-area-top safe-area-bottom py-8">
        {/* Main form */}
        <div className="w-full max-w-sm flex flex-col flex-1">
          <h1
            className="text-center text-slogan font-semibold"
            style={{ color: "#ff8f0a", marginBottom: "50px" }}
          >
            {t.title}
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-6">
            {/* Invoice Type Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setInvoiceType("invoice")}
                className="text-button rounded-xl font-medium transition-all"
                style={{
                  backgroundColor: invoiceType === "invoice" ? "var(--polar)" : "#f0f0f0",
                  color: "var(--deep-teal)",
                  boxShadow: invoiceType === "invoice" ? "0 4px 8px var(--deep-teal)" : "none",
                  minHeight: "52px",
                  padding: "0 24px",
                }}
              >
                {t.withInvoice}
              </button>
              <button
                type="button"
                onClick={() => setInvoiceType("receipt")}
                className="text-button rounded-xl font-medium transition-all"
                style={{
                  backgroundColor: invoiceType === "receipt" ? "var(--polar)" : "#f0f0f0",
                  color: "var(--deep-teal)",
                  boxShadow: invoiceType === "receipt" ? "0 4px 8px var(--deep-teal)" : "none",
                  minHeight: "52px",
                  padding: "0 24px",
                }}
              >
                {t.withReceipt}
              </button>
            </div>

            {/* Common Fields */}
            <input
              type="text"
              placeholder={t.name}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="text-body rounded-xl px-6 py-4 border border-gray-300 focus:outline-none focus:border-blue-500"
            />

            <div>
              <input
                type="email"
                placeholder={t.email}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors({ ...errors, email: "" });
                }}
                required
                className={`text-body rounded-xl px-6 py-4 border w-full focus:outline-none ${
                  errors.email ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {errors.email && (
                <p className="text-sm mt-1 px-2" style={{ color: "#ff6a1a" }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex gap-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="text-body rounded-xl px-3 py-4 border border-gray-300 focus:outline-none focus:border-blue-500"
                  style={{ minWidth: "110px" }}
                >
                  {countryCodes.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code} {item.country}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder={t.phone}
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setErrors({ ...errors, phone: "" });
                  }}
                  required
                  className={`text-body rounded-xl px-6 py-4 border flex-1 focus:outline-none ${
                    errors.phone ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-sm mt-1 px-2" style={{ color: "#ff6a1a" }}>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Invoice-only Fields */}
            {invoiceType === "invoice" && (
              <>
                <input
                  type="text"
                  placeholder={t.companyName}
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                  className="text-body rounded-xl px-6 py-4 border border-gray-300 focus:outline-none focus:border-blue-500"
                />

                <div>
                  <input
                    type="text"
                    placeholder={t.afm}
                    value={formData.afm}
                    onChange={(e) => {
                      setFormData({ ...formData, afm: e.target.value });
                      setErrors({ ...errors, afm: "" });
                    }}
                    required
                    className={`text-body rounded-xl px-6 py-4 border w-full focus:outline-none ${
                      errors.afm ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                    }`}
                  />
                  {errors.afm && (
                    <p className="text-sm mt-1 px-2" style={{ color: "#ff6a1a" }}>
                      {errors.afm}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Spacer to push bottom elements to bottom of screen */}
            <div style={{ flexGrow: 1, minHeight: "40px" }} />

            {/* Consent Checkbox - MOVED ABOVE SUBMIT BUTTON */}
            <label className="flex items-start gap-3 cursor-pointer" style={{ marginBottom: "40px" }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-body" style={{ color: "var(--deep-teal)" }}>
                {t.agreeTerms}
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary text-button w-full text-center"
              style={{
                backgroundColor: "var(--polar)",
                color: "var(--deep-teal)",
                boxShadow: "0 4px 8px var(--deep-teal)",
              }}
            >
              {t.submit}
            </button>
          </form>
        </div>

        {/* Legal Section at Bottom */}
        <div className="w-full max-w-sm" style={{ marginTop: "40px", marginBottom: "80px" }}>
          {/* Legal Buttons */}
          <div className="grid w-full grid-cols-2 gap-3">
            <Link
              href={`/${locale}/privacy`}
              className="btn-primary text-button text-center"
              style={{
                backgroundColor: "var(--polar)",
                color: "var(--deep-teal)",
                boxShadow: "0 4px 8px var(--deep-teal)",
              }}
            >
              {tLanding.privacy}
            </Link>
            <Link
              href={`/${locale}/terms`}
              className="btn-primary text-button text-center"
              style={{
                backgroundColor: "var(--polar)",
                color: "var(--deep-teal)",
                boxShadow: "0 4px 8px var(--deep-teal)",
              }}
            >
              {tLanding.terms}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";
import { createClient } from "@/lib/supabase/client";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.register || messages.el.register;
  const tLanding = messages[locale]?.landing || messages.el.landing;

  // Get referral code from URL (?ref=ABC123)
  const referralCode = searchParams.get('ref');

  const [invoiceType, setInvoiceType] = useState<"invoice" | "receipt">("receipt");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+30",
    password: "",
    confirmPassword: "",
    companyName: "",
    afm: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    afm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAfmLoading, setIsAfmLoading] = useState(false);
  const [afmResult, setAfmResult] = useState<{
    companyName?: string;
    address?: string;
    activity?: string;
    doy?: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // AFM lookup function (TaxisNet/VIES)
  const handleAfmLookup = async () => {
    if (!isValidAfm(formData.afm)) {
      setErrors({ ...errors, afm: t.invalidAfm });
      return;
    }

    setIsAfmLoading(true);
    setAfmResult(null);

    try {
      // Use public API (no auth required)
      const response = await fetch('/api/afm/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ afm: formData.afm }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setAfmResult({
          companyName: data.data.legalName || '',
          address: data.data.address || '',
          activity: data.data.activity || '',
          doy: data.data.doy || '',
        });
        // Auto-fill company name
        if (data.data.legalName) {
          setFormData({ ...formData, companyName: data.data.legalName });
        }
      } else {
        // No data found or error
        setErrors({ ...errors, afm: data.error || 'ΑΦΜ δεν βρέθηκε' });
      }
    } catch (error) {
      console.error('AFM lookup error:', error);
      setErrors({ ...errors, afm: 'Σφάλμα σύνδεσης' });
    } finally {
      setIsAfmLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors = { email: "", phone: "", password: "", confirmPassword: "", afm: "" };
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

    // Validate password
    if (formData.password.length < 6) {
      newErrors.password = t.invalidPassword || "Password must be at least 6 characters";
      isValid = false;
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwordMismatch || "Passwords do not match";
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

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/${locale}/login`,
        },
      });

      if (authError) {
        console.error('Registration error:', authError);
        if (authError.message.includes('already registered')) {
          alert('Αυτό το email είναι ήδη εγγεγραμμένο. Παρακαλώ συνδεθείτε.');
        } else {
          alert(authError.message);
        }
        setIsSubmitting(false);
        return;
      }

      // Success - redirect to email confirmation page
      router.push(`/${locale}/email-not-confirmed`);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Σφάλμα κατά την εγγραφή. Παρακαλώ δοκιμάστε ξανά.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-4 safe-area-top safe-area-bottom py-8">
        {/* Main content */}
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
                className="text-button rounded-2xl font-medium transition-all"
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
                className="text-button rounded-2xl font-medium transition-all"
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
              className="text-body w-full rounded-2xl border border-gray-300 focus:outline-none focus:border-blue-500"
              style={{ minHeight: '52px', paddingLeft: '40px', paddingRight: '40px' }}
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
                className={`text-body w-full rounded-2xl border focus:outline-none ${
                  errors.email ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                }`}
                style={{ minHeight: '52px', paddingLeft: '40px', paddingRight: '40px' }}
              />
              {errors.email && (
                <p className="text-sm mt-1 px-2" style={{ color: "#ff6a1a" }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.password}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setErrors({ ...errors, password: "" });
                  }}
                  required
                  className={`text-body w-full rounded-2xl border focus:outline-none ${
                    errors.password ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                  }`}
                  style={{ minHeight: '52px', paddingLeft: '40px', paddingRight: '50px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--deep-teal)', fontSize: '20px' }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm mt-1 px-2" style={{ color: "#ff6a1a" }}>
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t.confirmPassword}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    setErrors({ ...errors, confirmPassword: "" });
                  }}
                  required
                  className={`text-body w-full rounded-2xl border focus:outline-none ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                  }`}
                  style={{ minHeight: '52px', paddingLeft: '40px', paddingRight: '50px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--deep-teal)', fontSize: '20px' }}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm mt-1 px-2" style={{ color: "#ff6a1a" }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <div className="flex gap-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="text-body rounded-2xl px-3 border border-gray-300 focus:outline-none focus:border-blue-500"
                  style={{ minWidth: "110px", minHeight: '52px' }}
                >
                  {countryCodes.map((item) => (
                    <option key={item.code} value={item.code} style={{ color: 'var(--deep-teal)', backgroundColor: 'white' }}>
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
                  className={`text-body rounded-2xl border flex-1 focus:outline-none ${
                    errors.phone ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                  }`}
                  style={{ minHeight: '52px', paddingLeft: '40px', paddingRight: '40px' }}
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
                {/* ΑΦΜ input (60%) + TaxisNet button (40%) */}
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ΑΦΜ"
                      value={formData.afm}
                      onChange={(e) => {
                        setFormData({ ...formData, afm: e.target.value.replace(/\D/g, '').slice(0, 9) });
                        setErrors({ ...errors, afm: "" });
                        setAfmResult(null);
                      }}
                      required
                      className={`text-body rounded-2xl border focus:outline-none ${
                        errors.afm ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                      }`}
                      style={{ minHeight: '52px', paddingLeft: '20px', paddingRight: '20px', width: '60%' }}
                    />
                    <button
                      type="button"
                      onClick={handleAfmLookup}
                      disabled={isAfmLoading || formData.afm.length !== 9}
                      className="btn-primary text-button text-center"
                      style={{
                        backgroundColor: "var(--polar)",
                        color: "var(--deep-teal)",
                        boxShadow: "0 4px 8px var(--deep-teal)",
                        opacity: isAfmLoading || formData.afm.length !== 9 ? 0.6 : 1,
                        cursor: isAfmLoading || formData.afm.length !== 9 ? "not-allowed" : "pointer",
                        width: '40%',
                      }}
                    >
                      {isAfmLoading ? "..." : "TaxisNet"}
                    </button>
                  </div>
                  {errors.afm && (
                    <p className="text-sm mt-1 px-2" style={{ color: "#ff6a1a" }}>
                      {errors.afm}
                    </p>
                  )}
                </div>

                {/* Auto-filled fields from TaxisNet */}
                {afmResult && (
                  <div className="flex flex-col gap-3">
                    {/* Επωνυμία (Company Name) - read-only from VIES */}
                    <input
                      type="text"
                      value={afmResult.companyName || ''}
                      readOnly
                      placeholder="Επωνυμία"
                      className="text-body w-full rounded-2xl border border-gray-300 bg-gray-100"
                      style={{ minHeight: '52px', paddingLeft: '20px', paddingRight: '20px', color: 'var(--deep-teal)' }}
                    />
                    {/* Διεύθυνση (Address) - read-only from VIES */}
                    <input
                      type="text"
                      value={afmResult.address || ''}
                      readOnly
                      placeholder="Διεύθυνση"
                      className="text-body w-full rounded-2xl border border-gray-300 bg-gray-100"
                      style={{ minHeight: '52px', paddingLeft: '20px', paddingRight: '20px', color: 'var(--deep-teal)' }}
                    />
                    {/* Δραστηριότητα (Activity) - EDITABLE by user */}
                    <input
                      type="text"
                      value={afmResult.activity || ''}
                      onChange={(e) => setAfmResult({ ...afmResult, activity: e.target.value })}
                      placeholder="Δραστηριότητα (συμπληρώστε)"
                      className="text-body w-full rounded-2xl border border-gray-300 focus:outline-none focus:border-blue-500"
                      style={{ minHeight: '52px', paddingLeft: '20px', paddingRight: '20px', color: 'var(--deep-teal)' }}
                    />
                    {/* ΔΟΥ - EDITABLE by user */}
                    <input
                      type="text"
                      value={afmResult.doy || ''}
                      onChange={(e) => setAfmResult({ ...afmResult, doy: e.target.value })}
                      placeholder="ΔΟΥ (συμπληρώστε)"
                      className="text-body w-full rounded-2xl border border-gray-300 focus:outline-none focus:border-blue-500"
                      style={{ minHeight: '52px', paddingLeft: '20px', paddingRight: '20px', color: 'var(--deep-teal)' }}
                    />
                  </div>
                )}
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
            <div className="btn-single-wrapper">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary text-button btn-single text-center"
                style={{
                  backgroundColor: "var(--polar)",
                  color: "var(--deep-teal)",
                  boxShadow: "0 4px 8px var(--deep-teal)",
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                {isSubmitting ? "..." : t.submit}
              </button>
            </div>
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";
import { createClient } from "@/lib/supabase/client";
import BackgroundPage from "@/components/BackgroundPage";

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

// Phone validation function (exactly 10 digits without country code)
const isValidPhone = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length === 10;
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
  const referralCodeFromUrl = searchParams.get('ref');

  // Referral validation state
  const [validatedReferralCode, setValidatedReferralCode] = useState<string | null>(null);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);

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
  } | null>(null);
  // Отдельные состояния для редактируемых полей
  const [activityField, setActivityField] = useState('');
  const [doyField, setDoyField] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate referral code when email changes or on initial load
  const validateReferralCode = async (email: string) => {
    if (!referralCodeFromUrl) return;

    setIsValidatingReferral(true);
    setReferralError(null);

    try {
      const response = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralCode: referralCodeFromUrl,
          userEmail: email,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setValidatedReferralCode(data.referralCode);
        setReferralError(null);
      } else {
        setValidatedReferralCode(null);
        // Set error message based on error type
        if (data.error === 'SELF_REFERRAL') {
          setReferralError(t.selfReferralError || 'You cannot use your own referral code');
        } else if (data.error === 'INVALID_CODE') {
          setReferralError(t.invalidReferralError || 'Invalid referral code');
        } else if (data.error === 'REFERRER_NOT_ACTIVE') {
          setReferralError(t.referrerNotActiveError || 'Referrer account is not active');
        }
      }
    } catch (error) {
      console.error('Referral validation error:', error);
      setValidatedReferralCode(null);
    } finally {
      setIsValidatingReferral(false);
    }
  };

  // Validate referral code when email is entered and valid
  useEffect(() => {
    if (referralCodeFromUrl && isValidEmail(formData.email)) {
      const timeoutId = setTimeout(() => {
        validateReferralCode(formData.email);
      }, 500); // Debounce
      return () => clearTimeout(timeoutId);
    }
  }, [formData.email, referralCodeFromUrl]);

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
        });
        // Заполняем редактируемые поля данными из TaxisNet
        if (data.data.activity) setActivityField(data.data.activity);
        if (data.data.doy) setDoyField(data.data.doy);
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
          emailRedirectTo: `${window.location.origin}/${locale}/email-confirmed`,
          data: {
            name: formData.name,
            phone: `${formData.countryCode}${formData.phone}`,
            invoice_type: invoiceType,
            company_name: invoiceType === 'invoice' ? formData.companyName : null,
            afm: invoiceType === 'invoice' ? formData.afm : null,
            doy: invoiceType === 'invoice' ? doyField : null,
            address: invoiceType === 'invoice' && afmResult ? afmResult.address : null,
            activity: invoiceType === 'invoice' ? activityField : null,
            preferred_language: locale,
            // Referral code - only if validated
            referred_by: validatedReferralCode || null,
          },
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
    <BackgroundPage pageIndex={2}>
      <div
        className="flex flex-col items-center"
        style={{
          paddingTop: '180px',
          paddingBottom: '120px',
          paddingLeft: '40px',
          paddingRight: '40px',
        }}
      >
        {/* Main content */}
        <div className="w-full max-w-sm flex flex-col flex-1 gap-12">
          {/* Back */}
          <p
            onClick={() => router.push(`/${locale}`)}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {t.backToHome || '← Πίσω'}
          </p>

          <h1
            className="text-center text-slogan font-semibold"
            style={{ color: "#ff8f0a" }}
          >
            {t.title}
          </h1>

          {/* Referral Code Status */}
          {referralCodeFromUrl && (
            <div
              className="rounded-2xl p-4 text-center"
              style={{
                backgroundColor: referralError
                  ? 'rgba(255, 106, 26, 0.1)'
                  : validatedReferralCode
                  ? 'rgba(37, 211, 102, 0.1)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${
                  referralError
                    ? '#ff6a1a'
                    : validatedReferralCode
                    ? '#25D366'
                    : '#ccc'
                }`,
              }}
            >
              {isValidatingReferral ? (
                <p className="text-body" style={{ color: 'var(--polar)' }}>
                  {t.validatingReferral || 'Validating referral code...'}
                </p>
              ) : referralError ? (
                <p className="text-body" style={{ color: '#ff6a1a' }}>
                  {referralError}
                </p>
              ) : validatedReferralCode ? (
                <p className="text-body" style={{ color: '#25D366' }}>
                  {t.referralApplied || `Referral code ${validatedReferralCode} applied!`}
                </p>
              ) : (
                <p className="text-body" style={{ color: 'var(--polar)' }}>
                  {t.enterEmailForReferral || 'Enter your email to validate referral code'}
                </p>
              )}
            </div>
          )}

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
              className="input-dark-bg text-body w-full rounded-2xl border border-gray-300 focus:outline-none focus:border-blue-500"
              style={{ minHeight: '52px', padding: '12px', backgroundColor: 'white' }}
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
                className={`input-dark-bg text-body w-full rounded-2xl border focus:outline-none ${
                  errors.email ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                }`}
                style={{ minHeight: '52px', padding: '12px', backgroundColor: 'white' }}
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
                  className={`input-dark-bg text-body w-full rounded-2xl border focus:outline-none ${
                    errors.password ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                  }`}
                  style={{ minHeight: '52px', padding: '12px 50px 12px 12px', backgroundColor: 'white' }}
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
                  className={`input-dark-bg text-body w-full rounded-2xl border focus:outline-none ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                  }`}
                  style={{ minHeight: '52px', padding: '12px 50px 12px 12px', backgroundColor: 'white' }}
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
                  className="select-dark-bg text-body rounded-2xl px-3 border border-gray-300 focus:outline-none focus:border-blue-500"
                  style={{ width: '30%', minHeight: '52px', backgroundColor: 'white' }}
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
                  maxLength={10}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData({ ...formData, phone: digitsOnly });
                    setErrors({ ...errors, phone: "" });
                  }}
                  required
                  className={`input-dark-bg text-body rounded-2xl border focus:outline-none ${
                    errors.phone ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                  }`}
                  style={{ width: 'calc(70% - 8px)', minHeight: '52px', padding: '12px', backgroundColor: 'white' }}
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
                      className={`input-dark-bg text-body rounded-2xl border focus:outline-none ${
                        errors.afm ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                      }`}
                      style={{ minHeight: '52px', padding: '12px', width: '60%', backgroundColor: 'white' }}
                    />
                    <button
                      type="button"
                      onClick={handleAfmLookup}
                      disabled={isAfmLoading || formData.afm.length !== 9}
                      className="btn-primary text-button text-center rounded-2xl"
                      style={{
                        backgroundColor: "white",
                        color: "var(--deep-teal)",
                        border: "1px solid #d1d5db",
                        opacity: isAfmLoading || formData.afm.length !== 9 ? 0.6 : 1,
                        cursor: isAfmLoading || formData.afm.length !== 9 ? "not-allowed" : "pointer",
                        width: '40%',
                        minHeight: '52px',
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

                {/* 4 поля - показываются ВСЕГДА */}
                <div className="flex flex-col gap-3">
                  {/* Επωνυμία (Company Name) - read-only from TaxisNet */}
                  <input
                    type="text"
                    value={afmResult?.companyName || ''}
                    readOnly
                    placeholder="Επωνυμία"
                    className="input-dark-bg text-body w-full rounded-2xl border border-gray-300"
                    style={{ minHeight: '52px', padding: '12px', color: 'var(--deep-teal)', backgroundColor: '#f3f4f6' }}
                  />
                  {/* Διεύθυνση (Address) - read-only from TaxisNet */}
                  <input
                    type="text"
                    value={afmResult?.address || ''}
                    readOnly
                    placeholder="Διεύθυνση"
                    className="input-dark-bg text-body w-full rounded-2xl border border-gray-300"
                    style={{ minHeight: '52px', padding: '12px', color: 'var(--deep-teal)', backgroundColor: '#f3f4f6' }}
                  />
                  {/* Δραστηριότητα (Activity) - EDITABLE by user */}
                  <input
                    type="text"
                    value={activityField}
                    onChange={(e) => setActivityField(e.target.value)}
                    placeholder={locale === 'el' ? 'Δραστηριότητα' : `Δραστηριότητα (${t.fillInGreek})`}
                    className="input-dark-bg text-body w-full rounded-2xl border border-gray-300 focus:outline-none focus:border-blue-500"
                    style={{ minHeight: '52px', padding: '12px', color: 'var(--deep-teal)', backgroundColor: 'white' }}
                  />
                  {/* ΔΟΥ - EDITABLE by user */}
                  <input
                    type="text"
                    value={doyField}
                    onChange={(e) => setDoyField(e.target.value)}
                    placeholder={locale === 'el' ? 'ΔΟΥ' : `ΔΟΥ (${t.fillInGreek})`}
                    className="input-dark-bg text-body w-full rounded-2xl border border-gray-300 focus:outline-none focus:border-blue-500"
                    style={{ minHeight: '52px', padding: '12px', color: 'var(--deep-teal)', backgroundColor: 'white' }}
                  />
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
              <span className="text-body" style={{ color: "var(--polar)" }}>
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
        <div className="w-full max-w-sm" style={{ marginTop: "40px" }}>
          {/* Legal Buttons - full width, stacked */}
          <div className="flex flex-col w-full gap-12">
            <Link
              href={`/${locale}/privacy`}
              className="btn-primary text-button text-center w-full rounded-2xl"
              style={{
                backgroundColor: "var(--polar)",
                color: "var(--deep-teal)",
                boxShadow: "0 4px 8px var(--deep-teal)",
                minHeight: "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {tLanding.privacy}
            </Link>
            <Link
              href={`/${locale}/terms`}
              className="btn-primary text-button text-center w-full rounded-2xl"
              style={{
                backgroundColor: "var(--polar)",
                color: "var(--deep-teal)",
                boxShadow: "0 4px 8px var(--deep-teal)",
                minHeight: "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {tLanding.terms}
            </Link>
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}

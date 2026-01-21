"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";

interface ProfileData {
  name: string;
  phone: string;
  countryCode: string;
  isBusiness: boolean;
  companyName: string;
  afm: string;
  doy: string;
  address: string;
}

const translations = {
  el: {
    title: "Προσωπικά Στοιχεία",
    name: "Όνομα",
    phone: "Τηλέφωνο",
    email: "Email",
    accountNumber: "Αριθμός Λογαριασμού",
    registeredAt: "Ημερομηνία Εγγραφής",
    documentType: "Τύπος Παραστατικού",
    receipt: "Απόδειξη",
    invoice: "Τιμολόγιο",
    companyName: "Επωνυμία Εταιρείας",
    afm: "ΑΦΜ",
    doy: "ΔΟΥ",
    address: "Διεύθυνση",
    save: "Αποθήκευση",
    cancel: "Ακύρωση",
    saving: "Αποθήκευση...",
    saved: "Αποθηκεύτηκε!",
    error: "Σφάλμα αποθήκευσης",
    back: "← Πίσω",
    readOnly: "Μόνο ανάγνωση",
    required: "Υποχρεωτικό",
    invalidAfm: "Το ΑΦΜ πρέπει να είναι 9 ψηφία",
  },
  ru: {
    title: "Личные Данные",
    name: "Имя",
    phone: "Телефон",
    email: "Email",
    accountNumber: "Номер Аккаунта",
    registeredAt: "Дата Регистрации",
    documentType: "Тип Документа",
    receipt: "Чек",
    invoice: "Счёт-фактура",
    companyName: "Название Компании",
    afm: "ΑΦΜ (ИНН)",
    doy: "ΔΟΥ (Налоговая)",
    address: "Адрес",
    save: "Сохранить",
    cancel: "Отмена",
    saving: "Сохранение...",
    saved: "Сохранено!",
    error: "Ошибка сохранения",
    back: "← Назад",
    readOnly: "Только чтение",
    required: "Обязательно",
    invalidAfm: "ΑΦΜ должен содержать 9 цифр",
  },
  en: {
    title: "Personal Data",
    name: "Name",
    phone: "Phone",
    email: "Email",
    accountNumber: "Account Number",
    registeredAt: "Registered At",
    documentType: "Document Type",
    receipt: "Receipt",
    invoice: "Invoice",
    companyName: "Company Name",
    afm: "Tax ID (ΑΦΜ)",
    doy: "Tax Office (ΔΟΥ)",
    address: "Address",
    save: "Save",
    cancel: "Cancel",
    saving: "Saving...",
    saved: "Saved!",
    error: "Error saving",
    back: "← Back",
    readOnly: "Read only",
    required: "Required",
    invalidAfm: "Tax ID must be 9 digits",
  },
  uk: {
    title: "Особисті Дані",
    name: "Ім'я",
    phone: "Телефон",
    email: "Email",
    accountNumber: "Номер Акаунту",
    registeredAt: "Дата Реєстрації",
    documentType: "Тип Документа",
    receipt: "Чек",
    invoice: "Рахунок-фактура",
    companyName: "Назва Компанії",
    afm: "ΑΦΜ (ІПН)",
    doy: "ΔΟΥ (Податкова)",
    address: "Адреса",
    save: "Зберегти",
    cancel: "Скасувати",
    saving: "Збереження...",
    saved: "Збережено!",
    error: "Помилка збереження",
    back: "← Назад",
    readOnly: "Тільки читання",
    required: "Обов'язково",
    invalidAfm: "ΑΦΜ має містити 9 цифр",
  },
  sq: {
    title: "Të Dhënat Personale",
    name: "Emri",
    phone: "Telefoni",
    email: "Email",
    accountNumber: "Numri i Llogarisë",
    registeredAt: "Data e Regjistrimit",
    documentType: "Lloji i Dokumentit",
    receipt: "Faturë",
    invoice: "Faturë Tatimore",
    companyName: "Emri i Kompanisë",
    afm: "NIPT (ΑΦΜ)",
    doy: "Zyra Tatimore (ΔΟΥ)",
    address: "Adresa",
    save: "Ruaj",
    cancel: "Anulo",
    saving: "Duke ruajtur...",
    saved: "U ruajt!",
    error: "Gabim gjatë ruajtjes",
    back: "← Kthehu",
    readOnly: "Vetëm lexim",
    required: "E detyrueshme",
    invalidAfm: "NIPT duhet të jetë 9 shifra",
  },
  bg: {
    title: "Лични Данни",
    name: "Име",
    phone: "Телефон",
    email: "Email",
    accountNumber: "Номер на Акаунт",
    registeredAt: "Дата на Регистрация",
    documentType: "Тип Документ",
    receipt: "Касова бележка",
    invoice: "Фактура",
    companyName: "Име на Фирма",
    afm: "ΑΦΜ (ЕИК)",
    doy: "ΔΟΥ (Данъчна служба)",
    address: "Адрес",
    save: "Запази",
    cancel: "Отказ",
    saving: "Запазване...",
    saved: "Запазено!",
    error: "Грешка при запазване",
    back: "← Назад",
    readOnly: "Само за четене",
    required: "Задължително",
    invalidAfm: "ΑΦΜ трябва да съдържа 9 цифри",
  },
  ro: {
    title: "Date Personale",
    name: "Nume",
    phone: "Telefon",
    email: "Email",
    accountNumber: "Număr Cont",
    registeredAt: "Data Înregistrării",
    documentType: "Tip Document",
    receipt: "Chitanță",
    invoice: "Factură",
    companyName: "Nume Companie",
    afm: "CIF (ΑΦΜ)",
    doy: "Oficiu Fiscal (ΔΟΥ)",
    address: "Adresă",
    save: "Salvează",
    cancel: "Anulează",
    saving: "Se salvează...",
    saved: "Salvat!",
    error: "Eroare la salvare",
    back: "← Înapoi",
    readOnly: "Doar citire",
    required: "Obligatoriu",
    invalidAfm: "CIF trebuie să aibă 9 cifre",
  },
  ar: {
    title: "البيانات الشخصية",
    name: "الاسم",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    accountNumber: "رقم الحساب",
    registeredAt: "تاريخ التسجيل",
    documentType: "نوع المستند",
    receipt: "إيصال",
    invoice: "فاتورة",
    companyName: "اسم الشركة",
    afm: "الرقم الضريبي",
    doy: "مكتب الضرائب",
    address: "العنوان",
    save: "حفظ",
    cancel: "إلغاء",
    saving: "جاري الحفظ...",
    saved: "تم الحفظ!",
    error: "خطأ في الحفظ",
    back: "← رجوع",
    readOnly: "للقراءة فقط",
    required: "مطلوب",
    invalidAfm: "الرقم الضريبي يجب أن يكون 9 أرقام",
  },
};

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const t = translations[locale as keyof typeof translations] || translations.el;
  const isRTL = locale === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [accountNumber, setAccountNumber] = useState(0);
  const [registeredAt, setRegisteredAt] = useState("");
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    phone: "",
    countryCode: "+30",
    isBusiness: false,
    companyName: "",
    afm: "",
    doy: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      let { data: { session } } = await supabase.auth.getSession();
      let userId = session?.user?.id;

      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/${locale}/login`);
          return;
        }
        userId = user.id;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        router.push(`/${locale}/login`);
        return;
      }

      setUserId(profile.id);
      setEmail(profile.email || "");
      setAccountNumber(profile.account_number || 0);
      setRegisteredAt(profile.created_at || "");
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        countryCode: profile.country_code || "+30",
        isBusiness: profile.is_business || false,
        companyName: profile.company_name || "",
        afm: profile.afm || "",
        doy: profile.doy || "",
        address: profile.address || "",
      });
      setIsLoading(false);
    }

    loadProfile();
  }, [locale, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t.required;
    }

    if (formData.isBusiness) {
      if (!formData.companyName.trim()) {
        newErrors.companyName = t.required;
      }
      if (!formData.afm.trim()) {
        newErrors.afm = t.required;
      } else if (!/^\d{9}$/.test(formData.afm.replace(/\s/g, ''))) {
        newErrors.afm = t.invalidAfm;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          country_code: formData.countryCode,
          is_business: formData.isBusiness,
          company_name: formData.isBusiness ? formData.companyName.trim() : null,
          afm: formData.isBusiness ? formData.afm.replace(/\s/g, '') : null,
          doy: formData.isBusiness ? formData.doy.trim() : null,
          address: formData.isBusiness ? formData.address.trim() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error saving profile:', error);
        setSaveStatus('error');
      } else {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BackgroundPage pageIndex={1}>
      <div
        className="flex min-h-screen flex-col items-center gap-8 pb-20"
        style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px' }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <h1
            className="text-slogan font-bold text-center"
            style={{ color: '#ff8f0a' }}
          >
            {t.title}
          </h1>

          {/* Read-only Info */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <div className="space-y-3 text-body" style={{ color: 'var(--deep-teal)' }}>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t.email}</span>
                <span className="opacity-70">{email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t.accountNumber}</span>
                <span className="opacity-70">#{accountNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t.registeredAt}</span>
                <span className="opacity-70">
                  {registeredAt ? new Date(registeredAt).toLocaleDateString(locale) : '-'}
                </span>
              </div>
              <p className="text-sm opacity-50 text-center mt-2">({t.readOnly})</p>
            </div>
          </div>

          {/* Editable Form */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-body font-semibold mb-2" style={{ color: 'var(--deep-teal)' }}>
                  {t.name} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-body"
                  style={{
                    backgroundColor: 'white',
                    border: errors.name ? '2px solid #ff6a1a' : '1px solid rgba(1, 49, 45, 0.2)',
                    color: 'var(--deep-teal)',
                    minHeight: '52px',
                  }}
                />
                {errors.name && (
                  <p className="text-sm mt-1" style={{ color: '#ff6a1a' }}>{errors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-body font-semibold mb-2" style={{ color: 'var(--deep-teal)' }}>
                  {t.phone}
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    className="px-3 py-3 rounded-xl text-body"
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid rgba(1, 49, 45, 0.2)',
                      color: 'var(--deep-teal)',
                      minHeight: '52px',
                      width: '100px',
                    }}
                  >
                    <option value="+30">+30</option>
                    <option value="+7">+7</option>
                    <option value="+380">+380</option>
                    <option value="+355">+355</option>
                    <option value="+359">+359</option>
                    <option value="+40">+40</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                  </select>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^\d]/g, '') })}
                    className="flex-1 px-4 py-3 rounded-xl text-body"
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid rgba(1, 49, 45, 0.2)',
                      color: 'var(--deep-teal)',
                      minHeight: '52px',
                    }}
                    placeholder="6912345678"
                  />
                </div>
              </div>

              {/* Document Type Toggle */}
              <div>
                <label className="block text-body font-semibold mb-2" style={{ color: 'var(--deep-teal)' }}>
                  {t.documentType}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isBusiness: false })}
                    className="flex-1 px-4 py-3 rounded-xl text-button font-semibold transition-all"
                    style={{
                      backgroundColor: !formData.isBusiness ? '#ff8f0a' : 'white',
                      color: !formData.isBusiness ? 'white' : 'var(--deep-teal)',
                      border: '1px solid rgba(1, 49, 45, 0.2)',
                      minHeight: '52px',
                    }}
                  >
                    {t.receipt}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isBusiness: true })}
                    className="flex-1 px-4 py-3 rounded-xl text-button font-semibold transition-all"
                    style={{
                      backgroundColor: formData.isBusiness ? '#ff8f0a' : 'white',
                      color: formData.isBusiness ? 'white' : 'var(--deep-teal)',
                      border: '1px solid rgba(1, 49, 45, 0.2)',
                      minHeight: '52px',
                    }}
                  >
                    {t.invoice}
                  </button>
                </div>
              </div>

              {/* Business Fields */}
              {formData.isBusiness && (
                <div className="space-y-4 pt-2">
                  {/* Company Name */}
                  <div>
                    <label className="block text-body font-semibold mb-2" style={{ color: 'var(--deep-teal)' }}>
                      {t.companyName} *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-body"
                      style={{
                        backgroundColor: 'white',
                        border: errors.companyName ? '2px solid #ff6a1a' : '1px solid rgba(1, 49, 45, 0.2)',
                        color: 'var(--deep-teal)',
                        minHeight: '52px',
                      }}
                    />
                    {errors.companyName && (
                      <p className="text-sm mt-1" style={{ color: '#ff6a1a' }}>{errors.companyName}</p>
                    )}
                  </div>

                  {/* AFM */}
                  <div>
                    <label className="block text-body font-semibold mb-2" style={{ color: 'var(--deep-teal)' }}>
                      {t.afm} *
                    </label>
                    <input
                      type="text"
                      value={formData.afm}
                      onChange={(e) => setFormData({ ...formData, afm: e.target.value.replace(/[^\d]/g, '').slice(0, 9) })}
                      className="w-full px-4 py-3 rounded-xl text-body"
                      style={{
                        backgroundColor: 'white',
                        border: errors.afm ? '2px solid #ff6a1a' : '1px solid rgba(1, 49, 45, 0.2)',
                        color: 'var(--deep-teal)',
                        minHeight: '52px',
                      }}
                      placeholder="123456789"
                      maxLength={9}
                    />
                    {errors.afm && (
                      <p className="text-sm mt-1" style={{ color: '#ff6a1a' }}>{errors.afm}</p>
                    )}
                  </div>

                  {/* DOY */}
                  <div>
                    <label className="block text-body font-semibold mb-2" style={{ color: 'var(--deep-teal)' }}>
                      {t.doy}
                    </label>
                    <input
                      type="text"
                      value={formData.doy}
                      onChange={(e) => setFormData({ ...formData, doy: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-body"
                      style={{
                        backgroundColor: 'white',
                        border: '1px solid rgba(1, 49, 45, 0.2)',
                        color: 'var(--deep-teal)',
                        minHeight: '52px',
                      }}
                      placeholder="ΔΟΥ Αθηνών"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-body font-semibold mb-2" style={{ color: 'var(--deep-teal)' }}>
                      {t.address}
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-body"
                      style={{
                        backgroundColor: 'white',
                        border: '1px solid rgba(1, 49, 45, 0.2)',
                        color: 'var(--deep-teal)',
                        minHeight: '80px',
                        resize: 'vertical',
                      }}
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Status */}
          {saveStatus !== 'idle' && (
            <div
              className="text-center p-3 rounded-xl text-button font-semibold"
              style={{
                backgroundColor: saveStatus === 'saved' ? '#25D366' : '#ff6a1a',
                color: 'white',
              }}
            >
              {saveStatus === 'saved' ? t.saved : t.error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full px-6 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{
                backgroundColor: '#ff8f0a',
                color: 'white',
                minHeight: '52px',
                boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)',
              }}
            >
              {isSaving ? t.saving : t.save}
            </button>

            <button
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="w-full px-6 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80"
              style={{
                backgroundColor: 'var(--deep-teal)',
                color: 'white',
                minHeight: '52px',
                boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)',
              }}
            >
              {t.back}
            </button>
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}

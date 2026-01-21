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
    receipt: "ΑΠΟΔΕΙΞΗ",
    invoice: "ΤΙΜΟΛΟΓΙΟ",
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
    changePassword: "Αλλαγή Κωδικού",
    oldPassword: "Τρέχων Κωδικός",
    newPassword: "Νέος Κωδικός",
    confirmNewPassword: "Επιβεβαίωση Νέου Κωδικού",
    passwordChanged: "Ο κωδικός άλλαξε!",
    passwordError: "Σφάλμα αλλαγής κωδικού",
    passwordMismatch: "Οι κωδικοί δεν ταιριάζουν",
    passwordTooShort: "Τουλάχιστον 6 χαρακτήρες",
  },
  ru: {
    title: "Личные Данные",
    name: "Имя",
    phone: "Телефон",
    email: "Email",
    accountNumber: "Номер Аккаунта",
    registeredAt: "Дата Регистрации",
    documentType: "Тип Документа",
    receipt: "ΑΠΟΔΕΙΞΗ",
    invoice: "ΤΙΜΟΛΟΓΙΟ",
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
    changePassword: "Смена Пароля",
    oldPassword: "Старый Пароль",
    newPassword: "Новый Пароль",
    confirmNewPassword: "Повторить Новый Пароль",
    passwordChanged: "Пароль изменён!",
    passwordError: "Ошибка смены пароля",
    passwordMismatch: "Пароли не совпадают",
    passwordTooShort: "Минимум 6 символов",
  },
  en: {
    title: "Personal Data",
    name: "Name",
    phone: "Phone",
    email: "Email",
    accountNumber: "Account Number",
    registeredAt: "Registered At",
    documentType: "Document Type",
    receipt: "ΑΠΟΔΕΙΞΗ",
    invoice: "ΤΙΜΟΛΟΓΙΟ",
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
    changePassword: "Change Password",
    oldPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    passwordChanged: "Password changed!",
    passwordError: "Error changing password",
    passwordMismatch: "Passwords do not match",
    passwordTooShort: "At least 6 characters",
  },
  uk: {
    title: "Особисті Дані",
    name: "Ім'я",
    phone: "Телефон",
    email: "Email",
    accountNumber: "Номер Акаунту",
    registeredAt: "Дата Реєстрації",
    documentType: "Тип Документа",
    receipt: "ΑΠΟΔΕΙΞΗ",
    invoice: "ΤΙΜΟΛΟΓΙΟ",
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
    changePassword: "Зміна Паролю",
    oldPassword: "Старий Пароль",
    newPassword: "Новий Пароль",
    confirmNewPassword: "Повторіть Новий Пароль",
    passwordChanged: "Пароль змінено!",
    passwordError: "Помилка зміни паролю",
    passwordMismatch: "Паролі не співпадають",
    passwordTooShort: "Мінімум 6 символів",
  },
  sq: {
    title: "Të Dhënat Personale",
    name: "Emri",
    phone: "Telefoni",
    email: "Email",
    accountNumber: "Numri i Llogarisë",
    registeredAt: "Data e Regjistrimit",
    documentType: "Lloji i Dokumentit",
    receipt: "ΑΠΟΔΕΙΞΗ",
    invoice: "ΤΙΜΟΛΟΓΙΟ",
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
    changePassword: "Ndryshimi i Fjalëkalimit",
    oldPassword: "Fjalëkalimi Aktual",
    newPassword: "Fjalëkalimi i Ri",
    confirmNewPassword: "Konfirmo Fjalëkalimin e Ri",
    passwordChanged: "Fjalëkalimi u ndryshua!",
    passwordError: "Gabim në ndryshimin e fjalëkalimit",
    passwordMismatch: "Fjalëkalimet nuk përputhen",
    passwordTooShort: "Minimum 6 karaktere",
  },
  bg: {
    title: "Лични Данни",
    name: "Име",
    phone: "Телефон",
    email: "Email",
    accountNumber: "Номер на Акаунт",
    registeredAt: "Дата на Регистрация",
    documentType: "Тип Документ",
    receipt: "ΑΠΟΔΕΙΞΗ",
    invoice: "ΤΙΜΟΛΟΓΙΟ",
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
    changePassword: "Смяна на Парола",
    oldPassword: "Текуща Парола",
    newPassword: "Нова Парола",
    confirmNewPassword: "Потвърдете Новата Парола",
    passwordChanged: "Паролата е сменена!",
    passwordError: "Грешка при смяна на парола",
    passwordMismatch: "Паролите не съвпадат",
    passwordTooShort: "Минимум 6 символа",
  },
  ro: {
    title: "Date Personale",
    name: "Nume",
    phone: "Telefon",
    email: "Email",
    accountNumber: "Număr Cont",
    registeredAt: "Data Înregistrării",
    documentType: "Tip Document",
    receipt: "ΑΠΟΔΕΙΞΗ",
    invoice: "ΤΙΜΟΛΟΓΙΟ",
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
    changePassword: "Schimbă Parola",
    oldPassword: "Parola Curentă",
    newPassword: "Parola Nouă",
    confirmNewPassword: "Confirmă Parola Nouă",
    passwordChanged: "Parola a fost schimbată!",
    passwordError: "Eroare la schimbarea parolei",
    passwordMismatch: "Parolele nu se potrivesc",
    passwordTooShort: "Minim 6 caractere",
  },
  ar: {
    title: "البيانات الشخصية",
    name: "الاسم",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    accountNumber: "رقم الحساب",
    registeredAt: "تاريخ التسجيل",
    documentType: "نوع المستند",
    receipt: "ΑΠΟΔΕΙΞΗ",
    invoice: "ΤΙΜΟΛΟΓΙΟ",
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
    changePassword: "تغيير كلمة المرور",
    oldPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",
    passwordChanged: "تم تغيير كلمة المرور!",
    passwordError: "خطأ في تغيير كلمة المرور",
    passwordMismatch: "كلمات المرور غير متطابقة",
    passwordTooShort: "6 أحرف على الأقل",
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

  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleChangePassword = async () => {
    // Validate
    if (passwordData.newPassword.length < 6) {
      setPasswordError(t.passwordTooShort);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError(t.passwordMismatch);
      return;
    }

    setIsChangingPassword(true);
    setPasswordStatus('idle');
    setPasswordError("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        console.error('Error changing password:', error);
        setPasswordStatus('error');
        setPasswordError(t.passwordError);
      } else {
        setPasswordStatus('success');
        setPasswordData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
        setTimeout(() => setPasswordStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setPasswordStatus('error');
      setPasswordError(t.passwordError);
    } finally {
      setIsChangingPassword(false);
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
        className="flex min-h-screen flex-col items-center pb-20"
        style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px', paddingBottom: '120px' }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="w-full max-w-sm flex flex-col gap-12">
          {/* Back - phrase, not a button */}
          <p
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {t.back}
          </p>

          {/* Header */}
          <h1
            className="text-slogan font-bold text-center"
            style={{ color: '#ff8f0a' }}
          >
            {t.title}
          </h1>

          {/* Read-only Info - with labels */}
          <input
            type="text"
            value={`${t.email}: ${email}`}
            readOnly
            className="w-full rounded-2xl text-body border border-gray-300"
            style={{ minHeight: '52px', padding: '12px', backgroundColor: '#f3f4f6', color: 'var(--deep-teal)' }}
          />

          <input
            type="text"
            value={`${t.accountNumber}: #${accountNumber}`}
            readOnly
            className="w-full rounded-2xl text-body border border-gray-300"
            style={{ minHeight: '52px', padding: '12px', backgroundColor: '#f3f4f6', color: 'var(--deep-teal)' }}
          />

          <input
            type="text"
            value={`${t.registeredAt}: ${registeredAt ? new Date(registeredAt).toLocaleDateString(locale) : '-'}`}
            readOnly
            className="w-full rounded-2xl text-body border border-gray-300"
            style={{ minHeight: '52px', padding: '12px', backgroundColor: '#f3f4f6', color: 'var(--deep-teal)' }}
          />

          {/* Editable Form */}
          <div className="flex flex-col gap-12">
            {/* Name */}
            <div>
              <input
                type="text"
                placeholder={t.name}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full rounded-2xl text-body border focus:outline-none ${errors.name ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                style={{ minHeight: '52px', padding: '12px', backgroundColor: 'white' }}
              />
              {errors.name && (
                <p className="text-sm mt-1 px-2" style={{ color: '#ff6a1a' }}>{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="flex gap-2">
              <select
                value={formData.countryCode}
                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                className="rounded-2xl text-body border border-gray-300 focus:outline-none focus:border-blue-500"
                style={{ minWidth: '110px', minHeight: '52px', padding: '12px', backgroundColor: 'white' }}
              >
                <option value="+30">+30 GR</option>
                <option value="+7">+7 RU</option>
                <option value="+380">+380 UA</option>
                <option value="+355">+355 AL</option>
                <option value="+359">+359 BG</option>
                <option value="+40">+40 RO</option>
                <option value="+1">+1 US</option>
                <option value="+966">+966 SA</option>
              </select>
              <input
                type="tel"
                placeholder={t.phone}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^\d]/g, '') })}
                className="flex-1 rounded-2xl text-body border border-gray-300 focus:outline-none focus:border-blue-500"
                style={{ minHeight: '52px', padding: '12px', backgroundColor: 'white' }}
              />
            </div>

            {/* Document Type Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isBusiness: false })}
                className="text-button rounded-2xl font-medium transition-all"
                style={{
                  backgroundColor: !formData.isBusiness ? 'var(--polar)' : '#f0f0f0',
                  color: 'var(--deep-teal)',
                  boxShadow: !formData.isBusiness ? '0 4px 8px var(--deep-teal)' : 'none',
                  minHeight: '52px',
                }}
              >
                {t.receipt}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isBusiness: true })}
                className="text-button rounded-2xl font-medium transition-all"
                style={{
                  backgroundColor: formData.isBusiness ? 'var(--polar)' : '#f0f0f0',
                  color: 'var(--deep-teal)',
                  boxShadow: formData.isBusiness ? '0 4px 8px var(--deep-teal)' : 'none',
                  minHeight: '52px',
                }}
              >
                {t.invoice}
              </button>
            </div>

            {/* Business Fields */}
            {formData.isBusiness && (
              <div className="flex flex-col gap-12">
                {/* Company Name */}
                <div>
                  <input
                    type="text"
                    placeholder={t.companyName}
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className={`w-full rounded-2xl text-body border focus:outline-none ${errors.companyName ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    style={{ minHeight: '52px', padding: '12px', backgroundColor: 'white' }}
                  />
                  {errors.companyName && (
                    <p className="text-sm mt-1 px-2" style={{ color: '#ff6a1a' }}>{errors.companyName}</p>
                  )}
                </div>

                {/* AFM */}
                <div>
                  <input
                    type="text"
                    placeholder="ΑΦΜ"
                    value={formData.afm}
                    onChange={(e) => setFormData({ ...formData, afm: e.target.value.replace(/[^\d]/g, '').slice(0, 9) })}
                    className={`w-full rounded-2xl text-body border focus:outline-none ${errors.afm ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    style={{ minHeight: '52px', padding: '12px', backgroundColor: 'white' }}
                    maxLength={9}
                  />
                  {errors.afm && (
                    <p className="text-sm mt-1 px-2" style={{ color: '#ff6a1a' }}>{errors.afm}</p>
                  )}
                </div>

                {/* DOY */}
                <input
                  type="text"
                  placeholder="ΔΟΥ"
                  value={formData.doy}
                  onChange={(e) => setFormData({ ...formData, doy: e.target.value })}
                  className="w-full rounded-2xl text-body border border-gray-300 focus:outline-none focus:border-blue-500"
                  style={{ minHeight: '52px', padding: '12px', backgroundColor: 'white' }}
                />

                {/* Address */}
                <textarea
                  placeholder={t.address}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-2xl text-body border border-gray-300 focus:outline-none focus:border-blue-500"
                  style={{ minHeight: '80px', padding: '12px', backgroundColor: 'white', resize: 'vertical' }}
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Save Status */}
          {saveStatus !== 'idle' && (
            <div
              className="text-center p-3 rounded-2xl text-button font-semibold"
              style={{
                backgroundColor: saveStatus === 'saved' ? '#25D366' : '#ff6a1a',
                color: 'white',
              }}
            >
              {saveStatus === 'saved' ? t.saved : t.error}
            </div>
          )}

          {/* Save Button - moved before Change Password */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full rounded-2xl text-button font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--zanah)',
              color: 'var(--deep-teal)',
              boxShadow: '0 4px 8px var(--deep-teal)',
              minHeight: '52px',
            }}
          >
            {isSaving ? t.saving : t.save}
          </button>

          {/* Change Password Section */}
          <div className="flex flex-col gap-12">
            <h2
              className="text-button font-bold text-center"
              style={{ color: 'var(--polar)' }}
            >
              {t.changePassword}
            </h2>

            {/* Old Password */}
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                placeholder={t.oldPassword}
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="w-full rounded-2xl text-body border border-gray-300 focus:outline-none focus:border-blue-500"
                style={{ minHeight: '52px', padding: '12px 50px 12px 12px', backgroundColor: 'white' }}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--deep-teal)', fontSize: '20px' }}
              >
                {showOldPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* New Password */}
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder={t.newPassword}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full rounded-2xl text-body border border-gray-300 focus:outline-none focus:border-blue-500"
                style={{ minHeight: '52px', padding: '12px 50px 12px 12px', backgroundColor: 'white' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--deep-teal)', fontSize: '20px' }}
              >
                {showNewPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Confirm New Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t.confirmNewPassword}
                value={passwordData.confirmNewPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                className="w-full rounded-2xl text-body border border-gray-300 focus:outline-none focus:border-blue-500"
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

            {/* Password Error */}
            {passwordError && (
              <p className="text-sm text-center" style={{ color: '#ff6a1a' }}>{passwordError}</p>
            )}

            {/* Password Status */}
            {passwordStatus === 'success' && (
              <div
                className="text-center p-3 rounded-xl text-button font-semibold"
                style={{ backgroundColor: '#25D366', color: 'white' }}
              >
                {t.passwordChanged}
              </div>
            )}

            {/* Change Password Button */}
            <button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !passwordData.newPassword || !passwordData.confirmNewPassword}
              className="w-full rounded-2xl text-button font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--polar)',
                color: 'var(--deep-teal)',
                boxShadow: '0 4px 8px var(--deep-teal)',
                minHeight: '52px',
              }}
            >
              {isChangingPassword ? '...' : t.changePassword}
            </button>
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}

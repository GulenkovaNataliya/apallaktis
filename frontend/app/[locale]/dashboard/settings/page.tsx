"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";

interface NotificationSettings {
  email: {
    demo_expiring: boolean;
    subscription_expiring: boolean;
    payment_received: boolean;
    news: boolean;
    referrals: boolean;
  };
}

const defaultSettings: NotificationSettings = {
  email: {
    demo_expiring: true,
    subscription_expiring: true,
    payment_received: true,
    news: false,
    referrals: true,
  },
};

const translations = {
  el: {
    title: "Ρυθμίσεις",
    emailNotifications: "Ειδοποιήσεις Email",
    demoExpiring: "DEMO λήγει (2 ημέρες πριν)",
    subscriptionExpiring: "Η συνδρομή λήγει (2 ημέρες πριν)",
    paymentReceived: "Πληρωμή ελήφθη",
    news: "Νέα και ενημερώσεις",
    referrals: "Νέες παραπομπές",
    language: "Γλώσσα διεπαφής",
    save: "Αποθήκευση",
    saving: "Αποθήκευση...",
    saved: "Αποθηκεύτηκε!",
    error: "Σφάλμα αποθήκευσης",
    back: "← Πίσω",
    alwaysOn: "Πάντα ενεργοποιημένο",
  },
  ru: {
    title: "Настройки",
    emailNotifications: "Email уведомления",
    demoExpiring: "DEMO истекает (за 2 дня)",
    subscriptionExpiring: "Подписка истекает (за 2 дня)",
    paymentReceived: "Платёж получен",
    news: "Новости и обновления",
    referrals: "Новые рефералы",
    language: "Язык интерфейса",
    save: "Сохранить",
    saving: "Сохранение...",
    saved: "Сохранено!",
    error: "Ошибка сохранения",
    back: "← Назад",
    alwaysOn: "Всегда включено",
  },
  en: {
    title: "Settings",
    emailNotifications: "Email Notifications",
    demoExpiring: "DEMO expiring (2 days before)",
    subscriptionExpiring: "Subscription expiring (2 days before)",
    paymentReceived: "Payment received",
    news: "News and updates",
    referrals: "New referrals",
    language: "Interface language",
    save: "Save",
    saving: "Saving...",
    saved: "Saved!",
    error: "Error saving",
    back: "← Back",
    alwaysOn: "Always on",
  },
  uk: {
    title: "Налаштування",
    emailNotifications: "Email сповіщення",
    demoExpiring: "DEMO закінчується (за 2 дні)",
    subscriptionExpiring: "Підписка закінчується (за 2 дні)",
    paymentReceived: "Платіж отримано",
    news: "Новини та оновлення",
    referrals: "Нові реферали",
    language: "Мова інтерфейсу",
    save: "Зберегти",
    saving: "Збереження...",
    saved: "Збережено!",
    error: "Помилка збереження",
    back: "← Назад",
    alwaysOn: "Завжди увімкнено",
  },
  sq: {
    title: "Cilësimet",
    emailNotifications: "Njoftimet me Email",
    demoExpiring: "DEMO skadon (2 ditë para)",
    subscriptionExpiring: "Abonimi skadon (2 ditë para)",
    paymentReceived: "Pagesa u mor",
    news: "Lajme dhe përditësime",
    referrals: "Referime të reja",
    language: "Gjuha e ndërfaqes",
    save: "Ruaj",
    saving: "Duke ruajtur...",
    saved: "U ruajt!",
    error: "Gabim gjatë ruajtjes",
    back: "← Kthehu",
    alwaysOn: "Gjithmonë aktiv",
  },
  bg: {
    title: "Настройки",
    emailNotifications: "Email известия",
    demoExpiring: "DEMO изтича (2 дни преди)",
    subscriptionExpiring: "Абонаментът изтича (2 дни преди)",
    paymentReceived: "Плащането е получено",
    news: "Новини и актуализации",
    referrals: "Нови препоръки",
    language: "Език на интерфейса",
    save: "Запази",
    saving: "Запазване...",
    saved: "Запазено!",
    error: "Грешка при запазване",
    back: "← Назад",
    alwaysOn: "Винаги включено",
  },
  ro: {
    title: "Setări",
    emailNotifications: "Notificări Email",
    demoExpiring: "DEMO expiră (cu 2 zile înainte)",
    subscriptionExpiring: "Abonamentul expiră (cu 2 zile înainte)",
    paymentReceived: "Plată primită",
    news: "Știri și actualizări",
    referrals: "Noi recomandări",
    language: "Limba interfeței",
    save: "Salvează",
    saving: "Se salvează...",
    saved: "Salvat!",
    error: "Eroare la salvare",
    back: "← Înapoi",
    alwaysOn: "Mereu activat",
  },
  ar: {
    title: "الإعدادات",
    emailNotifications: "إشعارات البريد الإلكتروني",
    demoExpiring: "انتهاء DEMO (قبل يومين)",
    subscriptionExpiring: "انتهاء الاشتراك (قبل يومين)",
    paymentReceived: "تم استلام الدفع",
    news: "أخبار وتحديثات",
    referrals: "إحالات جديدة",
    language: "لغة الواجهة",
    save: "حفظ",
    saving: "جاري الحفظ...",
    saved: "تم الحفظ!",
    error: "خطأ في الحفظ",
    back: "← رجوع",
    alwaysOn: "دائماً مفعّل",
  },
};

const languages = [
  { code: 'el', name: 'Ελληνικά' },
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
  { code: 'uk', name: 'Українська' },
  { code: 'sq', name: 'Shqip' },
  { code: 'bg', name: 'Български' },
  { code: 'ro', name: 'Română' },
  { code: 'ar', name: 'العربية' },
];

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const t = translations[locale as keyof typeof translations] || translations.el;
  const isRTL = locale === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [userId, setUserId] = useState<string>("");
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [selectedLanguage, setSelectedLanguage] = useState(locale);

  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient();

      // First try getSession
      let { data: { session } } = await supabase.auth.getSession();

      // If no session, wait a moment and try getUser (more reliable)
      if (!session) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/${locale}/login`);
          return;
        }
        // Use user.id if session is not available
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, notification_settings, preferred_language')
          .eq('id', user.id)
          .single();

        if (error || !profile) {
          console.error('Profile error:', error);
          setIsLoading(false);
          return;
        }

        setUserId(profile.id);
        if (profile.notification_settings) {
          setSettings({ ...defaultSettings, ...profile.notification_settings });
        }
        if (profile.preferred_language) {
          setSelectedLanguage(profile.preferred_language);
        }
        setIsLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, notification_settings, preferred_language')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) {
        console.error('Profile error:', error);
        setIsLoading(false);
        return;
      }

      setUserId(profile.id);
      if (profile.notification_settings) {
        setSettings({ ...defaultSettings, ...profile.notification_settings });
      }
      if (profile.preferred_language) {
        setSelectedLanguage(profile.preferred_language);
      }
      setIsLoading(false);
    }

    loadSettings();
  }, [locale, router]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_settings: settings,
          preferred_language: selectedLanguage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error saving settings:', error);
        setSaveStatus('error');
      } else {
        setSaveStatus('saved');
        // Redirect to new language if changed
        if (selectedLanguage !== locale) {
          setTimeout(() => {
            router.push(`/${selectedLanguage}/dashboard/settings`);
          }, 1000);
        } else {
          setTimeout(() => setSaveStatus('idle'), 3000);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const Toggle = ({
    checked,
    onChange,
    disabled = false,
  }: {
    checked: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className="relative w-14 h-8 rounded-full transition-colors"
      style={{
        backgroundColor: checked ? '#ff8f0a' : 'rgba(1, 49, 45, 0.2)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span
        className="absolute top-1 w-6 h-6 rounded-full bg-white transition-transform"
        style={{
          transform: checked ? 'translateX(28px)' : 'translateX(4px)',
        }}
      />
    </button>
  );

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

          {/* Email Notifications */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              📧 {t.emailNotifications}
            </h2>

            <div className="space-y-4">
              {/* Always on - Payment received */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body font-medium" style={{ color: 'var(--deep-teal)' }}>
                    {t.paymentReceived}
                  </p>
                  <p className="text-sm opacity-50" style={{ color: 'var(--deep-teal)' }}>
                    {t.alwaysOn}
                  </p>
                </div>
                <Toggle checked={true} onChange={() => {}} disabled />
              </div>

              {/* Demo expiring */}
              <div className="flex items-center justify-between">
                <p className="text-body font-medium" style={{ color: 'var(--deep-teal)' }}>
                  {t.demoExpiring}
                </p>
                <Toggle
                  checked={settings.email.demo_expiring}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, demo_expiring: value },
                    })
                  }
                />
              </div>

              {/* Subscription expiring */}
              <div className="flex items-center justify-between">
                <p className="text-body font-medium" style={{ color: 'var(--deep-teal)' }}>
                  {t.subscriptionExpiring}
                </p>
                <Toggle
                  checked={settings.email.subscription_expiring}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, subscription_expiring: value },
                    })
                  }
                />
              </div>

              {/* News */}
              <div className="flex items-center justify-between">
                <p className="text-body font-medium" style={{ color: 'var(--deep-teal)' }}>
                  {t.news}
                </p>
                <Toggle
                  checked={settings.email.news}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, news: value },
                    })
                  }
                />
              </div>

              {/* Referrals */}
              <div className="flex items-center justify-between">
                <p className="text-body font-medium" style={{ color: 'var(--deep-teal)' }}>
                  {t.referrals}
                </p>
                <Toggle
                  checked={settings.email.referrals}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, referrals: value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              🌍 {t.language}
            </h2>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as Locale)}
              className="w-full px-4 py-3 rounded-xl text-body"
              style={{
                backgroundColor: 'white',
                border: '1px solid rgba(1, 49, 45, 0.2)',
                color: 'var(--deep-teal)',
                minHeight: '52px',
              }}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
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

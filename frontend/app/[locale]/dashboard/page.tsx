"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale } from "@/lib/messages";
import RewardsSection from "@/components/RewardsSection";
import BackgroundPage from "@/components/BackgroundPage";
import { type User } from "@/types/user";

// Translations for quick actions
const translations = {
  el: {
    quickActions: "Γρήγορες Ενέργειες",
    profile: "Προφίλ",
    profileDesc: "Επεξεργασία προσωπικών στοιχείων",
    subscription: "Συνδρομή",
    subscriptionDesc: "Διαχείριση πλάνου",
    settings: "Ρυθμίσεις",
    settingsDesc: "Ειδοποιήσεις & γλώσσα",
    security: "Ασφάλεια",
    securityDesc: "Κωδικός & συνεδρίες",
    referral: "Παραπομπές",
    referralDesc: "Κερδίστε δωρεάν μήνες",
    export: "Εξαγωγή",
    exportDesc: "Λήψη δεδομένων",
    goToDashboard: "Μετάβαση στον Πίνακα",
    logout: "Αποσύνδεση",
  },
  ru: {
    quickActions: "Быстрые Действия",
    profile: "Профиль",
    profileDesc: "Редактировать личные данные",
    subscription: "Подписка",
    subscriptionDesc: "Управление планом",
    settings: "Настройки",
    settingsDesc: "Уведомления и язык",
    security: "Безопасность",
    securityDesc: "Пароль и сессии",
    referral: "Рефералы",
    referralDesc: "Заработайте бесплатные месяцы",
    export: "Экспорт",
    exportDesc: "Скачать данные",
    goToDashboard: "Перейти к Панели",
    logout: "Выход",
  },
  en: {
    quickActions: "Quick Actions",
    profile: "Profile",
    profileDesc: "Edit personal information",
    subscription: "Subscription",
    subscriptionDesc: "Manage your plan",
    settings: "Settings",
    settingsDesc: "Notifications & language",
    security: "Security",
    securityDesc: "Password & sessions",
    referral: "Referrals",
    referralDesc: "Earn free months",
    export: "Export",
    exportDesc: "Download your data",
    goToDashboard: "Go to Dashboard",
    logout: "Logout",
  },
  uk: {
    quickActions: "Швидкі Дії",
    profile: "Профіль",
    profileDesc: "Редагувати особисті дані",
    subscription: "Підписка",
    subscriptionDesc: "Керування планом",
    settings: "Налаштування",
    settingsDesc: "Сповіщення та мова",
    security: "Безпека",
    securityDesc: "Пароль та сесії",
    referral: "Реферали",
    referralDesc: "Заробіть безкоштовні місяці",
    export: "Експорт",
    exportDesc: "Завантажити дані",
    goToDashboard: "Перейти до Панелі",
    logout: "Вихід",
  },
  sq: {
    quickActions: "Veprime të Shpejta",
    profile: "Profili",
    profileDesc: "Modifiko të dhënat personale",
    subscription: "Abonamenti",
    subscriptionDesc: "Menaxho planin",
    settings: "Cilësimet",
    settingsDesc: "Njoftimet dhe gjuha",
    security: "Siguria",
    securityDesc: "Fjalëkalimi dhe sesionet",
    referral: "Referime",
    referralDesc: "Fitoni muaj falas",
    export: "Eksporto",
    exportDesc: "Shkarko të dhënat",
    goToDashboard: "Shko te Paneli",
    logout: "Dilni",
  },
  bg: {
    quickActions: "Бързи Действия",
    profile: "Профил",
    profileDesc: "Редактиране на лични данни",
    subscription: "Абонамент",
    subscriptionDesc: "Управление на план",
    settings: "Настройки",
    settingsDesc: "Известия и език",
    security: "Сигурност",
    securityDesc: "Парола и сесии",
    referral: "Препоръки",
    referralDesc: "Спечелете безплатни месеци",
    export: "Експорт",
    exportDesc: "Изтегляне на данни",
    goToDashboard: "Към Таблото",
    logout: "Изход",
  },
  ro: {
    quickActions: "Acțiuni Rapide",
    profile: "Profil",
    profileDesc: "Editează informațiile personale",
    subscription: "Abonament",
    subscriptionDesc: "Gestionează planul",
    settings: "Setări",
    settingsDesc: "Notificări și limbă",
    security: "Securitate",
    securityDesc: "Parolă și sesiuni",
    referral: "Recomandări",
    referralDesc: "Câștigă luni gratuite",
    export: "Export",
    exportDesc: "Descarcă datele",
    goToDashboard: "Mergi la Panou",
    logout: "Deconectare",
  },
  ar: {
    quickActions: "إجراءات سريعة",
    profile: "الملف الشخصي",
    profileDesc: "تعديل البيانات الشخصية",
    subscription: "الاشتراك",
    subscriptionDesc: "إدارة الخطة",
    settings: "الإعدادات",
    settingsDesc: "الإشعارات واللغة",
    security: "الأمان",
    securityDesc: "كلمة المرور والجلسات",
    referral: "الإحالات",
    referralDesc: "اكسب أشهراً مجانية",
    export: "تصدير",
    exportDesc: "تحميل البيانات",
    goToDashboard: "الذهاب إلى لوحة التحكم",
    logout: "تسجيل الخروج",
  },
};

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and fetch user data
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();

        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push(`/${locale}/login`);
          return;
        }

        // Fetch user profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error || !profile) {
          console.error('Error fetching profile:', error);
          router.push(`/${locale}/login`);
          return;
        }

        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          countryCode: profile.country_code,
          accountNumber: profile.account_number,
          createdAt: profile.created_at,
          subscriptionStatus: profile.subscription_status,
          subscriptionExpiresAt: profile.subscription_expires_at,
          demoExpiresAt: profile.demo_expires_at,
          isBusiness: profile.is_business,
          companyName: profile.company_name,
          afm: profile.afm,
          doy: profile.doy,
          address: profile.address,
          accountPurchased: profile.account_purchased || false,
          accountPurchasedAt: profile.account_purchased_at,
          firstMonthFreeExpiresAt: profile.first_month_free_expires_at,
          subscriptionPlan: profile.subscription_plan,
          vipExpiresAt: profile.vip_expires_at,
          vipGrantedBy: profile.vip_granted_by,
          vipReason: profile.vip_reason,
          referralCode: profile.referral_code || '',
          referredBy: profile.referred_by,
          bonusMonths: profile.bonus_months || 0,
        });
      } catch (error) {
        console.error('Auth error:', error);
        router.push(`/${locale}/login`);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [locale, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  // Calculate demo time remaining
  const getDemoTimeRemaining = () => {
    if (!user.demoExpiresAt) return null;
    const now = new Date();
    const expiresAt = new Date(user.demoExpiresAt);
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs <= 0) return "EXPIRED";
    return `${diffHours}h ${diffMins}m`;
  };

  const demoTime = getDemoTimeRemaining();

  return (
    <BackgroundPage pageIndex={1}>
      <div className="flex min-h-screen flex-col items-center gap-12 pb-20" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px' }}>
        <div className="w-full max-w-sm space-y-6">
          {/* Header */}
          <h1
            className="text-slogan font-bold text-center"
            style={{ color: '#ff8f0a' }}
          >
            Dashboard
          </h1>

          {/* User Info Card */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              {user.name}
            </h2>

            <div className="space-y-2 text-body" style={{ color: 'var(--deep-teal)' }}>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              {user.phone && (
                <p>
                  <strong>Phone:</strong> {user.phone}
                </p>
              )}
              <p>
                <strong>Account:</strong> #{user.accountNumber}
              </p>
              {user.createdAt && (
                <p>
                  <strong>Registered:</strong> {new Date(user.createdAt).toLocaleDateString()}
                </p>
              )}
              <p>
                <strong>Status:</strong> {user.subscriptionStatus.toUpperCase()}
              </p>
              {user.subscriptionStatus === 'demo' && demoTime && (
                <p style={{ color: demoTime === 'EXPIRED' ? '#ff6a1a' : 'inherit' }}>
                  <strong>DEMO expires:</strong> {demoTime === 'EXPIRED' ? 'EXPIRED' : `in ${demoTime}`}
                </p>
              )}
              {user.isBusiness && (
                <>
                  <p>
                    <strong>Company:</strong> {user.companyName}
                  </p>
                  <p>
                    <strong>ΑΦΜ:</strong> {user.afm}
                  </p>
                  {user.doy && (
                    <p>
                      <strong>ΔΟΥ:</strong> {user.doy}
                    </p>
                  )}
                  {user.address && (
                    <p>
                      <strong>Address:</strong> {user.address}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Payment History Card */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              💳 Payment Information
            </h2>

            <div className="space-y-3 text-body" style={{ color: 'var(--deep-teal)' }}>
              {/* Account Purchase Status */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(1, 49, 45, 0.05)' }}>
                <p className="font-semibold mb-2">Account Purchase (97€ + ΦΠΑ)</p>
                {user.accountPurchased ? (
                  <>
                    <p style={{ color: '#25D366' }}>
                      ✅ <strong>Paid</strong>
                    </p>
                    {user.accountPurchasedAt && (
                      <p className="text-small mt-1">
                        Date: {new Date(user.accountPurchasedAt).toLocaleDateString()}
                      </p>
                    )}
                    {user.firstMonthFreeExpiresAt && (
                      <p className="text-small">
                        First free month expires: {new Date(user.firstMonthFreeExpiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </>
                ) : (
                  <p style={{ color: '#ff6a1a' }}>
                    ❌ <strong>Not paid</strong>
                  </p>
                )}
              </div>

              {/* Subscription Status */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(1, 49, 45, 0.05)' }}>
                <p className="font-semibold mb-2">Monthly Subscription</p>
                {user.subscriptionPlan && user.subscriptionPlan !== 'demo' ? (
                  <>
                    <p>
                      <strong>Plan:</strong> {user.subscriptionPlan.toUpperCase()}
                    </p>
                    {user.subscriptionExpiresAt && (
                      <p className="text-small">
                        Next payment: {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </>
                ) : (
                  <p style={{ color: '#ff6a1a' }}>No active subscription</p>
                )}
              </div>

              {/* Bonus Months */}
              {(user.bonusMonths ?? 0) > 0 && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 143, 10, 0.1)' }}>
                  <p className="font-semibold" style={{ color: '#ff8f0a' }}>
                    🎁 Bonus Months: {user.bonusMonths ?? 0}
                  </p>
                  <p className="text-small mt-1">
                    Will be used automatically before next payment
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Rewards Section */}
          <RewardsSection user={user} locale={locale} />

          {/* Quick Actions Section */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              {(translations[locale] || translations.el).quickActions}
            </h2>

            <div
              className="grid grid-cols-2 gap-3"
              style={{ direction: locale === 'ar' ? 'rtl' : 'ltr' }}
            >
              {/* Profile */}
              <button
                onClick={() => router.push(`/${locale}/dashboard/profile`)}
                className="p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(1, 49, 45, 0.05)',
                  textAlign: locale === 'ar' ? 'right' : 'left',
                }}
              >
                <span className="text-2xl block mb-1">👤</span>
                <span className="font-semibold block" style={{ color: 'var(--deep-teal)' }}>
                  {(translations[locale] || translations.el).profile}
                </span>
                <span className="text-small block" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                  {(translations[locale] || translations.el).profileDesc}
                </span>
              </button>

              {/* Subscription */}
              <button
                onClick={() => router.push(`/${locale}/dashboard/subscription`)}
                className="p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(1, 49, 45, 0.05)',
                  textAlign: locale === 'ar' ? 'right' : 'left',
                }}
              >
                <span className="text-2xl block mb-1">💳</span>
                <span className="font-semibold block" style={{ color: 'var(--deep-teal)' }}>
                  {(translations[locale] || translations.el).subscription}
                </span>
                <span className="text-small block" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                  {(translations[locale] || translations.el).subscriptionDesc}
                </span>
              </button>

              {/* Settings */}
              <button
                onClick={() => router.push(`/${locale}/dashboard/settings`)}
                className="p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(1, 49, 45, 0.05)',
                  textAlign: locale === 'ar' ? 'right' : 'left',
                }}
              >
                <span className="text-2xl block mb-1">⚙️</span>
                <span className="font-semibold block" style={{ color: 'var(--deep-teal)' }}>
                  {(translations[locale] || translations.el).settings}
                </span>
                <span className="text-small block" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                  {(translations[locale] || translations.el).settingsDesc}
                </span>
              </button>

              {/* Security */}
              <button
                onClick={() => router.push(`/${locale}/dashboard/security`)}
                className="p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(1, 49, 45, 0.05)',
                  textAlign: locale === 'ar' ? 'right' : 'left',
                }}
              >
                <span className="text-2xl block mb-1">🔒</span>
                <span className="font-semibold block" style={{ color: 'var(--deep-teal)' }}>
                  {(translations[locale] || translations.el).security}
                </span>
                <span className="text-small block" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                  {(translations[locale] || translations.el).securityDesc}
                </span>
              </button>

              {/* Referral */}
              <button
                onClick={() => router.push(`/${locale}/dashboard/referral`)}
                className="p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(255, 143, 10, 0.1)',
                  textAlign: locale === 'ar' ? 'right' : 'left',
                }}
              >
                <span className="text-2xl block mb-1">🎁</span>
                <span className="font-semibold block" style={{ color: '#ff8f0a' }}>
                  {(translations[locale] || translations.el).referral}
                </span>
                <span className="text-small block" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                  {(translations[locale] || translations.el).referralDesc}
                </span>
              </button>

              {/* Export */}
              <button
                onClick={() => router.push(`/${locale}/dashboard/export`)}
                className="p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(1, 49, 45, 0.05)',
                  textAlign: locale === 'ar' ? 'right' : 'left',
                }}
              >
                <span className="text-2xl block mb-1">📥</span>
                <span className="font-semibold block" style={{ color: 'var(--deep-teal)' }}>
                  {(translations[locale] || translations.el).export}
                </span>
                <span className="text-small block" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                  {(translations[locale] || translations.el).exportDesc}
                </span>
              </button>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col gap-12 w-full">
            <button
              onClick={() => router.push(`/${locale}/page-pay`)}
              className="btn-primary text-button w-full text-center"
              style={{
                minHeight: '52px',
                backgroundColor: 'var(--zanah)',
                color: 'var(--deep-teal)',
                boxShadow: '0 4px 8px var(--deep-teal)',
              }}
            >
              📊 {(translations[locale] || translations.el).goToDashboard}
            </button>

            <button
              onClick={handleLogout}
              className="btn-primary text-button w-full text-center"
              style={{
                minHeight: '52px',
                backgroundColor: '#ff6a1a',
                color: '#ffffff',
                boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)',
              }}
            >
              🚪 {(translations[locale] || translations.el).logout}
            </button>
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale } from "@/lib/messages";
// RewardsSection removed - VIP button deleted per step 2
import BackgroundPage from "@/components/BackgroundPage";
import { type User } from "@/types/user";

// Translations for dashboard
const translations = {
  el: {
    personalAccount: "Προσωπικός Λογαριασμός",
    back: "← Πίσω",
    profile: "Προφίλ",
    mySubscription: "Η Συνδρομή Μου",
    security: "Ασφάλεια",
    referral: "Referral Program",
    team: "Η Ομάδα Μου",
    goToHome: "Μετάβαση στην Αρχική",
    logout: "Αποσύνδεση",
    deleteAccount: "Διαγραφή Λογαριασμού",
    deleteConfirmTitle: "Διαγραφή Λογαριασμού",
    deleteConfirmMessage: "Είστε σίγουροι ότι θέλετε να διαγράψετε τον λογαριασμό σας;",
    deleteConfirmMessage2: "Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.",
    deleteConfirmYes: "Ναι, διαγραφή",
    deleteConfirmNo: "Άκυρο",
    needHelp: "Χρειάζεστε βοήθεια;",
    responseTime: "Χρόνος απόκρισης έως 48 ώρες",
  },
  ru: {
    personalAccount: "Личный Кабинет",
    back: "← Назад",
    profile: "Профиль",
    mySubscription: "Моя Подписка",
    security: "Безопасность",
    referral: "Referral Program",
    team: "Моя Команда",
    goToHome: "Перейти на Главную",
    logout: "Выход из Аккаунта",
    deleteAccount: "Удалить Аккаунт",
    deleteConfirmTitle: "Удаление Аккаунта",
    deleteConfirmMessage: "Вы уверены, что хотите удалить свой аккаунт?",
    deleteConfirmMessage2: "Это действие нельзя отменить.",
    deleteConfirmYes: "Да, удалить",
    deleteConfirmNo: "Отмена",
    needHelp: "Нужна помощь?",
    responseTime: "Время ответа до 48 часов",
  },
  en: {
    personalAccount: "Personal Account",
    back: "← Back",
    profile: "Profile",
    mySubscription: "My Subscription",
    security: "Security",
    referral: "Referral Program",
    team: "My Team",
    goToHome: "Go to Home",
    logout: "Log Out",
    deleteAccount: "Delete Account",
    deleteConfirmTitle: "Delete Account",
    deleteConfirmMessage: "Are you sure you want to delete your account?",
    deleteConfirmMessage2: "This action cannot be undone.",
    deleteConfirmYes: "Yes, delete",
    deleteConfirmNo: "Cancel",
    needHelp: "Need help?",
    responseTime: "Response time up to 48 hours",
  },
  uk: {
    personalAccount: "Особистий Кабінет",
    back: "← Назад",
    profile: "Профіль",
    mySubscription: "Моя Підписка",
    security: "Безпека",
    referral: "Referral Program",
    team: "Моя Команда",
    goToHome: "Перейти на Головну",
    logout: "Вийти з Акаунту",
    deleteAccount: "Видалити Акаунт",
    deleteConfirmTitle: "Видалення Акаунту",
    deleteConfirmMessage: "Ви впевнені, що хочете видалити свій акаунт?",
    deleteConfirmMessage2: "Цю дію неможливо скасувати.",
    deleteConfirmYes: "Так, видалити",
    deleteConfirmNo: "Скасувати",
    needHelp: "Потрібна допомога?",
    responseTime: "Час відповіді до 48 годин",
  },
  sq: {
    personalAccount: "Llogaria Personale",
    back: "← Kthehu",
    profile: "Profili",
    mySubscription: "Abonamenti Im",
    security: "Siguria",
    referral: "Referral Program",
    team: "Ekipi Im",
    goToHome: "Shko në Kryefaqe",
    logout: "Dilni nga Llogaria",
    deleteAccount: "Fshi Llogarinë",
    deleteConfirmTitle: "Fshi Llogarinë",
    deleteConfirmMessage: "Jeni i sigurt që dëshironi të fshini llogarinë tuaj?",
    deleteConfirmMessage2: "Ky veprim nuk mund të zhbëhet.",
    deleteConfirmYes: "Po, fshi",
    deleteConfirmNo: "Anulo",
    needHelp: "Keni nevojë për ndihmë?",
    responseTime: "Koha e përgjigjes deri në 48 orë",
  },
  bg: {
    personalAccount: "Личен Кабинет",
    back: "← Назад",
    profile: "Профил",
    mySubscription: "Моят Абонамент",
    security: "Сигурност",
    referral: "Referral Program",
    team: "Моят Екип",
    goToHome: "Към Началната Страница",
    logout: "Изход от Акаунта",
    deleteAccount: "Изтрий Акаунт",
    deleteConfirmTitle: "Изтриване на Акаунт",
    deleteConfirmMessage: "Сигурни ли сте, че искате да изтриете акаунта си?",
    deleteConfirmMessage2: "Това действие не може да бъде отменено.",
    deleteConfirmYes: "Да, изтрий",
    deleteConfirmNo: "Отказ",
    needHelp: "Нуждаете се от помощ?",
    responseTime: "Време за отговор до 48 часа",
  },
  ro: {
    personalAccount: "Cont Personal",
    back: "← Înapoi",
    profile: "Profil",
    mySubscription: "Abonamentul Meu",
    security: "Securitate",
    referral: "Referral Program",
    team: "Echipa Mea",
    goToHome: "Mergi la Pagina Principală",
    logout: "Deconectare",
    deleteAccount: "Șterge Contul",
    deleteConfirmTitle: "Ștergere Cont",
    deleteConfirmMessage: "Sunteți sigur că doriți să ștergeți contul?",
    deleteConfirmMessage2: "Această acțiune nu poate fi anulată.",
    deleteConfirmYes: "Da, șterge",
    deleteConfirmNo: "Anulează",
    needHelp: "Ai nevoie de ajutor?",
    responseTime: "Timp de răspuns până la 48 ore",
  },
  ar: {
    personalAccount: "الحساب الشخصي",
    back: "← رجوع",
    profile: "الملف الشخصي",
    mySubscription: "اشتراكي",
    security: "الأمان",
    referral: "Referral Program",
    team: "فريقي",
    goToHome: "الذهاب إلى الرئيسية",
    logout: "تسجيل الخروج",
    deleteAccount: "حذف الحساب",
    deleteConfirmTitle: "حذف الحساب",
    deleteConfirmMessage: "هل أنت متأكد أنك تريد حذف حسابك؟",
    deleteConfirmMessage2: "لا يمكن التراجع عن هذا الإجراء.",
    deleteConfirmYes: "نعم، احذف",
    deleteConfirmNo: "إلغاء",
    needHelp: "هل تحتاج إلى مساعدة؟",
    responseTime: "وقت الاستجابة حتى 48 ساعة",
  },
};

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Check authentication and fetch user data
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();

        // Check if user is logged in - try getSession first, then getUser as fallback
        let { data: { session } } = await supabase.auth.getSession();
        let userId = session?.user?.id;

        if (!userId) {
          // Fallback to getUser (more reliable)
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            router.push(`/${locale}/login`);
            return;
          }
          userId = user.id;
        }

        // Fetch user profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
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

  const handleDeleteAccount = async () => {
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        // Delete user profile first
        await supabase.from('profiles').delete().eq('id', authUser.id);
        // Sign out
        await supabase.auth.signOut();
      }

      router.push(`/${locale}`);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
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
        <div className="w-full max-w-sm flex flex-col gap-12">
          {/* Back - phrase, not a button */}
          <p
            onClick={() => router.push(`/${locale}/page-pay`)}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {(translations[locale] || translations.el).back}
          </p>

          {/* Header */}
          <h1
            className="text-slogan font-bold text-center"
            style={{ color: '#ff8f0a' }}
          >
            {(translations[locale] || translations.el).personalAccount}
          </h1>

          {/* Profile Button - 1/5 lightest */}
          <button
            onClick={() => router.push(`/${locale}/dashboard/profile`)}
            className="btn-universal w-full text-button flex items-center justify-center text-center"
            style={{ minHeight: '52px', backgroundColor: '#e7f4f1', color: '#01312d' }}
          >
            {(translations[locale] || translations.el).profile}
          </button>

          {/* My Subscription Button - 2/5 */}
          <button
            onClick={() => router.push(`/${locale}/dashboard/subscription`)}
            className="btn-universal w-full text-button flex items-center justify-center text-center"
            style={{ minHeight: '52px', backgroundColor: '#b0d9cf', color: '#01312d' }}
          >
            {(translations[locale] || translations.el).mySubscription}
          </button>

          {/* Referrals Button - 3/5 */}
          <button
            onClick={() => router.push(`/${locale}/dashboard/referral`)}
            className="btn-universal w-full text-button flex items-center justify-center text-center"
            style={{ minHeight: '52px', backgroundColor: '#6bbfae', color: '#01312d' }}
          >
            {(translations[locale] || translations.el).referral}
          </button>

          {/* Team Button - 4/5 */}
          <button
            onClick={() => router.push(`/${locale}/dashboard/team`)}
            className="btn-universal w-full text-button flex items-center justify-center text-center"
            style={{ minHeight: '52px', backgroundColor: '#3da896', color: '#01312d' }}
          >
            {(translations[locale] || translations.el).team}
          </button>

          {/* Go to Home Button - 5/5 darkest */}
          <button
            onClick={() => router.push(`/${locale}/page-pay`)}
            className="btn-universal w-full text-button flex items-center justify-center text-center"
            style={{ minHeight: '52px', backgroundColor: '#01756a', color: '#ffffff' }}
          >
            {(translations[locale] || translations.el).goToHome}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="btn-universal w-full text-button flex items-center justify-center text-center"
            style={{ minHeight: '52px', backgroundColor: 'var(--deep-teal)', color: 'var(--polar)' }}
          >
            {(translations[locale] || translations.el).logout}
          </button>

          {/* Delete Account Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn-universal w-full text-button flex items-center justify-center text-center"
            style={{ minHeight: '52px', backgroundColor: 'var(--orange)', color: '#ffffff' }}
          >
            {(translations[locale] || translations.el).deleteAccount}
          </button>

        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-sm mx-4 p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-heading font-bold text-center mb-4"
              style={{ color: 'var(--orange)' }}
            >
              {(translations[locale] || translations.el).deleteConfirmTitle}
            </h2>
            <p
              className="text-body text-center"
              style={{ color: 'var(--deep-teal)' }}
            >
              {(translations[locale] || translations.el).deleteConfirmMessage}
            </p>
            <p
              className="text-button text-center mb-6 font-semibold"
              style={{ color: 'var(--orange)' }}
            >
              {(translations[locale] || translations.el).deleteConfirmMessage2}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 btn-primary text-button text-center"
                style={{
                  minHeight: '52px',
                  backgroundColor: '#25D366',
                  color: 'white',
                }}
              >
                {(translations[locale] || translations.el).deleteConfirmNo}
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 btn-primary text-button text-center"
                style={{
                  minHeight: '52px',
                  backgroundColor: 'var(--orange)',
                  color: '#ffffff',
                }}
              >
                {(translations[locale] || translations.el).deleteConfirmYes}
              </button>
            </div>
          </div>
        </div>
      )}
    </BackgroundPage>
  );
}

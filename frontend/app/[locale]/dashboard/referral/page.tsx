"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";
import { createClient } from "@/lib/supabase/client";
import { getUserTier, canUseFeature, type SubscriptionTier } from "@/lib/subscription";

interface ReferralStats {
  referral_code: string;
  bonus_months: number;
  referrals_count: number;
  referrals: Array<{
    id: string;
    name: string;
    email: string;
    created_at: string;
    account_purchased: boolean;
  }>;
}

export default function ReferralPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const { user, isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [userTier, setUserTier] = useState<SubscriptionTier>('demo');

  // Check user subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const supabase = createClient();
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();

        if (supabaseUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_status, account_purchased, demo_expires_at, vip_expires_at, first_month_free_expires_at')
            .eq('id', supabaseUser.id)
            .single();

          if (profile) {
            const tier = getUserTier(profile);
            setUserTier(tier);
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, []);

  // Check if user can use referral program
  const referralCheck = canUseFeature(userTier, 'referralProgram');

  const texts = {
    el: {
      title: "Referral Program",
      yourLink: "Ο Σύνδεσμός σας",
      copyLink: "Αντιγραφή Συνδέσμου",
      copied: "Αντιγράφηκε!",
      shareWhatsApp: "WhatsApp",
      shareEmail: "Email",
      howItWorks: "Πώς λειτουργεί;",
      step1: "Στείλτε τον σύνδεσμο σε φίλο",
      step2: "Ο φίλος εγγράφεται μέσω του συνδέσμου σας",
      step3: "Ο φίλος αγοράζει λογαριασμό",
      step4: "Λαμβάνετε +1 μήνα ΔΩΡΕΑΝ!",
      yourStats: "Η Στατιστική σας",
      totalReferrals: "Συνολικές Προσκλήσεις",
      purchased: "Αγόρασαν Λογαριασμό",
      bonusTotal: "Σύνολο Bonus Μήνες",
      bonusAvailable: "Διαθέσιμοι Bonus Μήνες",
      back: "Πίσω",
      demoRestriction: "Διαθέσιμο μετά την αγορά λογαριασμού",
      buyAccount: "Αγορά Λογαριασμού",
    },
    ru: {
      title: "Referral Program",
      yourLink: "Ваша Ссылка",
      copyLink: "Копировать Ссылку",
      copied: "Скопировано!",
      shareWhatsApp: "WhatsApp",
      shareEmail: "Email",
      howItWorks: "Как это работает?",
      step1: "Отправьте ссылку другу",
      step2: "Друг регистрируется по вашей ссылке",
      step3: "Друг покупает аккаунт",
      step4: "Вы получаете +1 месяц БЕСПЛАТНО!",
      yourStats: "Ваша Статистика",
      totalReferrals: "Всего Приглашений",
      purchased: "Купили Аккаунт",
      bonusTotal: "Всего Bonus Месяцев",
      bonusAvailable: "Доступно Bonus Месяцев",
      back: "Назад",
      demoRestriction: "Доступно после покупки аккаунта",
      buyAccount: "Купить аккаунт",
    },
    en: {
      title: "Referral Program",
      yourLink: "Your Link",
      copyLink: "Copy Link",
      copied: "Copied!",
      shareWhatsApp: "WhatsApp",
      shareEmail: "Email",
      howItWorks: "How it works?",
      step1: "Send the link to a friend",
      step2: "Friend signs up via your link",
      step3: "Friend purchases an account",
      step4: "You get +1 month FREE!",
      yourStats: "Your Statistics",
      totalReferrals: "Total Referrals",
      purchased: "Purchased Account",
      bonusTotal: "Total Bonus Months",
      bonusAvailable: "Available Bonus Months",
      back: "Back",
      demoRestriction: "Available after purchasing an account",
      buyAccount: "Buy Account",
    },
    uk: {
      title: "Referral Program",
      yourLink: "Ваше Посилання",
      copyLink: "Копіювати Посилання",
      copied: "Скопійовано!",
      shareWhatsApp: "WhatsApp",
      shareEmail: "Email",
      howItWorks: "Як це працює?",
      step1: "Надішліть посилання другу",
      step2: "Друг реєструється за вашим посиланням",
      step3: "Друг купує акаунт",
      step4: "Ви отримуєте +1 місяць БЕЗКОШТОВНО!",
      yourStats: "Ваша Статистика",
      totalReferrals: "Всього Запрошень",
      purchased: "Купили Акаунт",
      bonusTotal: "Всього Bonus Місяців",
      bonusAvailable: "Доступно Bonus Місяців",
      back: "Назад",
      demoRestriction: "Доступно після покупки акаунта",
      buyAccount: "Купити акаунт",
    },
    sq: {
      title: "Referral Program",
      yourLink: "Linku Juaj",
      copyLink: "Kopjo Linkun",
      copied: "U kopjua!",
      shareWhatsApp: "WhatsApp",
      shareEmail: "Email",
      howItWorks: "Si funksionon?",
      step1: "Dërgoni linkun një miku",
      step2: "Miku regjistrohet përmes linkut tuaj",
      step3: "Miku blen një llogari",
      step4: "Merrni +1 muaj FALAS!",
      yourStats: "Statistikat Tuaja",
      totalReferrals: "Totali i Ftesave",
      purchased: "Blenë Llogari",
      bonusTotal: "Total Muaj Bonus",
      bonusAvailable: "Muaj Bonus të Disponueshëm",
      back: "Prapa",
      demoRestriction: "E disponueshme pas blerjes së llogarisë",
      buyAccount: "Bli Llogari",
    },
    bg: {
      title: "Referral Program",
      yourLink: "Вашият Линк",
      copyLink: "Копирай Линка",
      copied: "Копирано!",
      shareWhatsApp: "WhatsApp",
      shareEmail: "Email",
      howItWorks: "Как работи?",
      step1: "Изпратете линка на приятел",
      step2: "Приятелят се регистрира чрез вашия линк",
      step3: "Приятелят купува акаунт",
      step4: "Получавате +1 месец БЕЗПЛАТНО!",
      yourStats: "Вашата Статистика",
      totalReferrals: "Общо Покани",
      purchased: "Купиха Акаунт",
      bonusTotal: "Общо Bonus Месеци",
      bonusAvailable: "Налични Bonus Месеци",
      back: "Назад",
      demoRestriction: "Достъпно след закупуване на акаунт",
      buyAccount: "Купи акаунт",
    },
    ro: {
      title: "Referral Program",
      yourLink: "Linkul Dvs.",
      copyLink: "Copiază Linkul",
      copied: "Copiat!",
      shareWhatsApp: "WhatsApp",
      shareEmail: "Email",
      howItWorks: "Cum funcționează?",
      step1: "Trimiteți linkul unui prieten",
      step2: "Prietenul se înregistrează prin linkul dvs.",
      step3: "Prietenul cumpără un cont",
      step4: "Primiți +1 lună GRATUIT!",
      yourStats: "Statisticile Dvs.",
      totalReferrals: "Total Invitații",
      purchased: "Au Cumpărat Cont",
      bonusTotal: "Total Luni Bonus",
      bonusAvailable: "Luni Bonus Disponibile",
      back: "Înapoi",
      demoRestriction: "Disponibil după achiziționarea contului",
      buyAccount: "Cumpără Cont",
    },
    ar: {
      title: "Referral Program",
      yourLink: "رابطك",
      copyLink: "نسخ الرابط",
      copied: "تم النسخ!",
      shareWhatsApp: "WhatsApp",
      shareEmail: "Email",
      howItWorks: "كيف يعمل؟",
      step1: "أرسل الرابط لصديق",
      step2: "يسجل الصديق عبر رابطك",
      step3: "يشتري الصديق حسابًا",
      step4: "تحصل على +1 شهر مجانًا!",
      yourStats: "إحصائياتك",
      totalReferrals: "إجمالي الدعوات",
      purchased: "اشتروا حسابًا",
      bonusTotal: "إجمالي أشهر البونص",
      bonusAvailable: "أشهر البونص المتاحة",
      back: "رجوع",
      demoRestriction: "متاح بعد شراء الحساب",
      buyAccount: "شراء حساب",
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.el;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, isLoading, locale, router]);

  // Fetch referral stats
  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return;

      try {
        const supabase = createClient();

        // Get user's referral code and stats
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('referral_code, bonus_months, referrals_count')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        // Get referrals (users who used this referral code)
        const { data: referrals, error: referralsError } = await supabase
          .from('profiles')
          .select('id, name, email, created_at, account_purchased')
          .eq('referred_by', profile.referral_code)
          .order('created_at', { ascending: false });

        if (referralsError) {
          console.error('Error fetching referrals:', referralsError);
        }

        setStats({
          referral_code: profile.referral_code || '',
          bonus_months: profile.bonus_months || 0,
          referrals_count: profile.referrals_count || 0,
          referrals: referrals || [],
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchStats();
    }
  }, [user?.id]);

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // DEMO restriction - show message for DEMO users
  if (!referralCheck.allowed) {
    return (
      <BackgroundPage pageIndex={1}>
        <div className="flex min-h-screen flex-col items-center justify-center" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
          <div className="w-full max-w-sm flex flex-col gap-12 items-center">
            {/* Header - always English */}
            <h1
              className="text-slogan font-bold text-center"
              style={{ color: '#ff8f0a' }}
            >
              Referral Program
            </h1>

            {/* Restriction message */}
            <p className="text-button text-center" style={{ color: 'var(--polar)' }}>
              {t.demoRestriction}
            </p>

            {/* Buy account button */}
            <button
              onClick={() => router.push(`/${locale}/pricing`)}
              className="btn-universal w-full text-button"
              style={{
                minHeight: '52px',
                backgroundColor: 'var(--orange)',
                color: 'var(--deep-teal)',
              }}
            >
              {t.buyAccount}
            </button>

            {/* Back - phrase, not a button */}
            <p
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="text-button cursor-pointer text-center"
              style={{ color: 'var(--polar)' }}
            >
              ← {t.back}
            </p>
          </div>
        </div>
      </BackgroundPage>
    );
  }

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/register?ref=${stats?.referral_code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViber = () => {
    const message = encodeURIComponent(`Δοκίμασε το ΑΠΑΛΛΑΚΤΗΣ! Εγγραφή εδώ: ${referralLink}`);
    window.open(`viber://forward?text=${message}`, '_blank');
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(`Δοκίμασε το ΑΠΑΛΛΑΚΤΗΣ! Εγγραφή εδώ: ${referralLink}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareEmail = () => {
    const subject = encodeURIComponent('ΑΠΑΛΛΑΚΤΗΣ - Πρόσκληση');
    const body = encodeURIComponent(`Δοκίμασε το ΑΠΑΛΛΑΚΤΗΣ!\n\nΕγγραφή εδώ: ${referralLink}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const purchasedCount = stats?.referrals.filter(r => r.account_purchased).length || 0;

  return (
    <BackgroundPage pageIndex={1}>
      <div className="flex min-h-screen flex-col items-center" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px', paddingBottom: '120px' }}>
        <div className="w-full max-w-sm flex flex-col gap-12">
          {/* Back - phrase, not a button */}
          <p
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            ← {t.back}
          </p>

          {/* Header - always English */}
          <h1
            className="text-slogan font-bold text-center"
            style={{ color: '#ff8f0a' }}
          >
            Referral Program
          </h1>

          {/* Your Link - phrase, centered */}
          <p className="text-heading font-semibold text-center" style={{ color: 'var(--zanah)' }}>
            {t.yourLink}
          </p>

          {/* Link Display with Copy button */}
          <div className="flex items-center gap-3">
            <div className="flex-1 p-4 rounded-xl" style={{ backgroundColor: 'var(--polar)' }}>
              <p className="text-body break-all" style={{ color: 'var(--deep-teal)' }}>
                {referralLink}
              </p>
            </div>
            <button
              onClick={copyToClipboard}
              className="px-4 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80 whitespace-nowrap"
              style={{ backgroundColor: '#ff8f0a', color: 'white', minHeight: '52px' }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Share Buttons - equal width */}
          <div className="flex gap-3">
            <button
              onClick={shareViber}
              className="flex-1 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#7360f2', color: 'white', minHeight: '52px' }}
            >
              Viber
            </button>
            <button
              onClick={shareWhatsApp}
              className="flex-1 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#25D366', color: 'white', minHeight: '52px' }}
            >
              WhatsApp
            </button>
            <button
              onClick={shareEmail}
              className="flex-1 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#3b82f6', color: 'white', minHeight: '52px' }}
            >
              Email
            </button>
          </div>

          {/* How It Works - phrase, centered */}
          <p className="text-heading font-semibold text-center" style={{ color: 'var(--zanah)' }}>
            {t.howItWorks}
          </p>

          {/* Steps - text on background, larger font */}
          <div className="flex flex-col gap-4">
            <p className="text-button text-center" style={{ color: 'var(--zanah)' }}>1. {t.step1}</p>
            <p className="text-button text-center" style={{ color: 'var(--zanah)' }}>2. {t.step2}</p>
            <p className="text-button text-center" style={{ color: 'var(--zanah)' }}>3. {t.step3}</p>
            <p className="text-button text-center font-bold" style={{ color: 'var(--orange)' }}>4. {t.step4}</p>
          </div>

          {/* Statistics - phrase, centered */}
          <p className="text-heading font-semibold text-center" style={{ color: 'var(--zanah)' }}>
            {t.yourStats}
          </p>

          {/* Statistics cards 2x2 */}
          <div className="grid grid-cols-2 gap-12">
            {/* Row 1 */}
            <div
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: 'var(--zanah)', minHeight: '100px' }}
            >
              <p className="text-3xl font-bold" style={{ color: 'var(--orange)' }}>{stats?.referrals_count || 0}</p>
              <p className="text-button mt-2" style={{ color: 'var(--deep-teal)' }}>{t.totalReferrals}</p>
            </div>
            <div
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: 'var(--zanah)', minHeight: '100px' }}
            >
              <p className="text-3xl font-bold" style={{ color: 'var(--orange)' }}>{purchasedCount}</p>
              <p className="text-button mt-2" style={{ color: 'var(--deep-teal)' }}>{t.purchased}</p>
            </div>
            {/* Row 2 */}
            <div
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: 'var(--zanah)', minHeight: '100px' }}
            >
              <p className="text-3xl font-bold" style={{ color: 'var(--orange)' }}>{purchasedCount}</p>
              <p className="text-button mt-2" style={{ color: 'var(--deep-teal)' }}>{t.bonusTotal}</p>
            </div>
            <div
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: 'var(--zanah)', minHeight: '100px' }}
            >
              <p className="text-3xl font-bold" style={{ color: 'var(--orange)' }}>{stats?.bonus_months || 0}</p>
              <p className="text-button mt-2" style={{ color: 'var(--deep-teal)' }}>{t.bonusAvailable}</p>
            </div>
          </div>


        </div>
      </div>
    </BackgroundPage>
  );
}

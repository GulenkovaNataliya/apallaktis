"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";
import { createClient } from "@/lib/supabase/client";

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

  const texts = {
    el: {
      title: "Πρόγραμμα Παραπομπών",
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
      totalReferrals: "Συνολικές Παραπομπές",
      purchased: "Αγόρασαν Λογαριασμό",
      bonusTotal: "Σύνολο Bonus Μήνες",
      bonusAvailable: "Διαθέσιμοι Bonus Μήνες",
      referralsList: "Οι Παραπομπές σας",
      name: "Όνομα",
      email: "Email",
      dateRegistered: "Ημερομηνία Εγγραφής",
      status: "Κατάσταση",
      registered: "Εγγράφηκε",
      accountPurchased: "Αγόρασε Λογαριασμό",
      noReferrals: "Δεν έχετε παραπομπές ακόμα",
      noReferrals2: "Μοιραστείτε τον σύνδεσμό σας και κερδίστε Bonus!",
      back: "Πίσω",
    },
    ru: {
      title: "Реферальная Программа",
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
      totalReferrals: "Всего Рефералов",
      purchased: "Купили Аккаунт",
      bonusTotal: "Всего Bonus Месяцев",
      bonusAvailable: "Доступно Bonus Месяцев",
      referralsList: "Ваши Рефералы",
      name: "Имя",
      email: "Email",
      dateRegistered: "Дата Регистрации",
      status: "Статус",
      registered: "Зарегистрировался",
      accountPurchased: "Купил Аккаунт",
      noReferrals: "У вас пока нет рефералов",
      noReferrals2: "Поделитесь своей ссылкой и получите Bonus!",
      back: "Назад",
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
      referralsList: "Your Referrals",
      name: "Name",
      email: "Email",
      dateRegistered: "Date Registered",
      status: "Status",
      registered: "Registered",
      accountPurchased: "Purchased Account",
      noReferrals: "You don't have any referrals yet",
      noReferrals2: "Share your link and get Bonus!",
      back: "Back",
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

          {/* Referrals List - phrase, centered */}
          <p className="text-heading font-semibold text-center" style={{ color: 'var(--zanah)' }}>
            {t.referralsList}
          </p>

          {stats?.referrals && stats.referrals.length > 0 ? (
            <div className="flex flex-col gap-12 items-center">
              {stats.referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="w-full rounded-2xl p-4 text-center"
                  style={{ backgroundColor: 'var(--zanah)' }}
                >
                  <p className="text-button" style={{ color: 'var(--deep-teal)' }}>
                    {t.name}: <span style={{ color: 'var(--orange)' }}>{referral.name}</span>
                  </p>
                  <p className="text-button mt-2" style={{ color: 'var(--deep-teal)' }}>
                    Email: <span style={{ color: 'var(--orange)' }}>{referral.email}</span>
                  </p>
                  <p className="text-button mt-2" style={{ color: 'var(--deep-teal)' }}>
                    {t.dateRegistered}: <span style={{ color: 'var(--orange)' }}>{new Date(referral.created_at).toLocaleDateString(locale)}</span>
                  </p>
                  <p className="text-button mt-2" style={{ color: 'var(--deep-teal)' }}>
                    {t.status}: <span style={{ color: referral.account_purchased ? '#25D366' : 'var(--orange)' }}>{referral.account_purchased ? t.accountPurchased : t.registered}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-button text-center" style={{ color: 'var(--orange)' }}>
                {t.noReferrals}
              </p>
              <p className="text-button text-center" style={{ color: 'var(--orange)' }}>
                {t.noReferrals2}
              </p>
            </div>
          )}

        </div>
      </div>
    </BackgroundPage>
  );
}

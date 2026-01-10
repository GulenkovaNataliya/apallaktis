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
      bonusEarned: "Bonus Μήνες που κερδίσατε",
      bonusAvailable: "Διαθέσιμοι Bonus Μήνες",
      referralsList: "Οι Παραπομπές σας",
      name: "Όνομα",
      email: "Email",
      dateRegistered: "Ημερομηνία Εγγραφής",
      status: "Κατάσταση",
      registered: "Εγγράφηκε",
      accountPurchased: "Αγόρασε Λογαριασμό",
      noReferrals: "Δεν έχετε παραπομπές ακόμα. Μοιραστείτε τον σύνδεσμό σας!",
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
      bonusEarned: "Bonus Месяцев заработано",
      bonusAvailable: "Доступно Bonus Месяцев",
      referralsList: "Ваши Рефералы",
      name: "Имя",
      email: "Email",
      dateRegistered: "Дата Регистрации",
      status: "Статус",
      registered: "Зарегистрировался",
      accountPurchased: "Купил Аккаунт",
      noReferrals: "У вас пока нет рефералов. Поделитесь своей ссылкой!",
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
      bonusEarned: "Bonus Months Earned",
      bonusAvailable: "Available Bonus Months",
      referralsList: "Your Referrals",
      name: "Name",
      email: "Email",
      dateRegistered: "Date Registered",
      status: "Status",
      registered: "Registered",
      accountPurchased: "Purchased Account",
      noReferrals: "You don't have any referrals yet. Share your link!",
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
      <div className="flex min-h-screen flex-col items-center gap-8 pb-20" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px' }}>
        <div className="w-full max-w-4xl space-y-8">
          {/* Header */}
          <h1
            className="text-slogan font-bold text-center"
            style={{ color: '#ff8f0a' }}
          >
            {t.title}
          </h1>

          {/* Referral Link Card */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              {t.yourLink}
            </h2>

            <div className="flex flex-col gap-4">
              {/* Link Display */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(1, 49, 45, 0.1)' }}>
                <p className="text-body break-all" style={{ color: 'var(--deep-teal)' }}>
                  {referralLink}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80"
                  style={{ backgroundColor: '#ff8f0a', color: 'white', minHeight: '52px', boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)' }}
                >
                  {copied ? t.copied : t.copyLink}
                </button>
                <button
                  onClick={shareWhatsApp}
                  className="px-6 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80"
                  style={{ backgroundColor: '#25D366', color: 'white', minHeight: '52px', boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)' }}
                >
                  {t.shareWhatsApp}
                </button>
                <button
                  onClick={shareEmail}
                  className="px-6 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80"
                  style={{ backgroundColor: 'var(--deep-teal)', color: 'white', minHeight: '52px', boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)' }}
                >
                  {t.shareEmail}
                </button>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              {t.howItWorks}
            </h2>
            <ol className="space-y-2 text-body" style={{ color: 'var(--deep-teal)' }}>
              <li>1. {t.step1}</li>
              <li>2. {t.step2}</li>
              <li>3. {t.step3}</li>
              <li>4. <strong>{t.step4}</strong></li>
            </ol>
          </div>

          {/* Statistics */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              {t.yourStats}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: '#ff8f0a' }}>{stats?.referrals_count || 0}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--deep-teal)' }}>{t.totalReferrals}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: '#ff8f0a' }}>{purchasedCount}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--deep-teal)' }}>{t.purchased}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: '#ff8f0a' }}>{purchasedCount}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--deep-teal)' }}>{t.bonusEarned}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: '#ff8f0a' }}>{stats?.bonus_months || 0}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--deep-teal)' }}>{t.bonusAvailable}</p>
              </div>
            </div>
          </div>

          {/* Referrals List */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              {t.referralsList}
            </h2>

            {stats?.referrals && stats.referrals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-body">
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(1, 49, 45, 0.2)' }}>
                      <th className="text-left py-2 px-2" style={{ color: 'var(--deep-teal)' }}>{t.name}</th>
                      <th className="text-left py-2 px-2" style={{ color: 'var(--deep-teal)' }}>{t.email}</th>
                      <th className="text-left py-2 px-2" style={{ color: 'var(--deep-teal)' }}>{t.dateRegistered}</th>
                      <th className="text-left py-2 px-2" style={{ color: 'var(--deep-teal)' }}>{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.referrals.map((referral) => (
                      <tr key={referral.id} style={{ borderBottom: '1px solid rgba(1, 49, 45, 0.1)' }}>
                        <td className="py-3 px-2" style={{ color: 'var(--deep-teal)' }}>{referral.name}</td>
                        <td className="py-3 px-2" style={{ color: 'var(--deep-teal)' }}>{referral.email}</td>
                        <td className="py-3 px-2" style={{ color: 'var(--deep-teal)' }}>
                          {new Date(referral.created_at).toLocaleDateString(locale)}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className="px-3 py-1 rounded-full text-sm font-semibold"
                            style={{
                              backgroundColor: referral.account_purchased ? '#25D366' : '#ff8f0a',
                              color: 'white'
                            }}
                          >
                            {referral.account_purchased ? t.accountPurchased : t.registered}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-body" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
                {t.noReferrals}
              </p>
            )}
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="px-8 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'var(--deep-teal)', color: 'white', minHeight: '52px', boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)' }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}

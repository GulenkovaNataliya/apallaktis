"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";

interface ReferralStats {
  totalReferrals: number;
  totalConversions: number;
  conversionRate: number;
  totalBonusMonths: number;
}

interface TopReferrer {
  userId: string;
  email: string;
  accountNumber: number;
  name: string;
  referralCode: string;
  registrations: number;
  conversions: number;
  bonusMonths: number;
  conversionRate: number;
}

interface DailyRegistration {
  date: string;
  count: number;
}

interface UserProfile {
  id: string;
  email: string | null;
  name: string;
  account_number: number;
  referral_code: string | null;
  referred_by: string | null;
  subscription_status: string;
  bonus_months: number | null;
  created_at: string;
}

export default function AdminReferrals() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [dailyRegistrations, setDailyRegistrations] = useState<DailyRegistration[]>([]);

  async function checkAuth() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push(`/${locale}/login`);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      router.push(`/${locale}`);
      return;
    }

    setIsLoading(false);
  }

  async function loadReferralStats() {
    const supabase = createClient();

    try {
      // Get all users
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const users = data as UserProfile[] | null;
      if (!users) return;

      // Calculate overall stats
      const referredUsers = users.filter(u => u.referred_by);
      const convertedUsers = referredUsers.filter(u => u.subscription_status !== 'demo');
      const totalBonusMonths = users.reduce((sum, u) => sum + (u.bonus_months || 0), 0);
      const conversionRate = referredUsers.length > 0
        ? (convertedUsers.length / referredUsers.length) * 100
        : 0;

      setStats({
        totalReferrals: referredUsers.length,
        totalConversions: convertedUsers.length,
        conversionRate: Math.round(conversionRate),
        totalBonusMonths,
      });

      // Calculate top referrers
      const referrerMap = new Map<string, {
        user: UserProfile;
        registrations: number;
        conversions: number;
      }>();

      referredUsers.forEach(referred => {
        const referrerCode = referred.referred_by;
        if (!referrerCode) return;

        const referrer = users.find(u => u.referral_code === referrerCode);
        if (!referrer) return;

        if (!referrerMap.has(referrer.id)) {
          referrerMap.set(referrer.id, {
            user: referrer,
            registrations: 0,
            conversions: 0,
          });
        }

        const entry = referrerMap.get(referrer.id)!;
        entry.registrations++;
        if (referred.subscription_status !== 'demo') {
          entry.conversions++;
        }
      });

      const topReferrersList: TopReferrer[] = Array.from(referrerMap.entries())
        .map(([userId, data]) => ({
          userId,
          email: data.user.email || 'N/A',
          accountNumber: data.user.account_number,
          name: data.user.name,
          referralCode: data.user.referral_code || '',
          registrations: data.registrations,
          conversions: data.conversions,
          bonusMonths: data.user.bonus_months || 0,
          conversionRate: data.registrations > 0
            ? Math.round((data.conversions / data.registrations) * 100)
            : 0,
        }))
        .sort((a, b) => b.registrations - a.registrations)
        .slice(0, 10);

      setTopReferrers(topReferrersList);

      // Calculate daily registrations for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyMap = new Map<string, number>();
      referredUsers
        .filter(u => new Date(u.created_at) >= thirtyDaysAgo)
        .forEach(u => {
          const date = new Date(u.created_at).toLocaleDateString('en-CA'); // YYYY-MM-DD
          dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
        });

      const dailyList: DailyRegistration[] = Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setDailyRegistrations(dailyList);
    } catch (error) {
      console.error('Error loading referral stats:', error);
    }
  }

  useEffect(() => {
    checkAuth();
    loadReferralStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function exportToExcel() {
    // Simple CSV export
    const csvContent = [
      ['Rank', 'Account #', 'Name', 'Email', 'Referral Code', 'Registrations', 'Conversions', 'Bonus Months', 'Conversion Rate'],
      ...topReferrers.map((r, idx) => [
        idx + 1,
        r.accountNumber,
        r.name,
        r.email,
        r.referralCode,
        r.registrations,
        r.conversions,
        r.bonusMonths,
        `${r.conversionRate}%`,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `referral_stats_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BackgroundPage pageIndex={1}>
      <div className="flex min-h-screen flex-col gap-8 pb-20" style={{ paddingLeft: '30px', paddingRight: '30px', paddingTop: '180px' }}>
        <div className="w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1
              className="text-slogan font-bold"
              style={{ color: '#ff8f0a' }}
            >
              Реферальная статистика
            </h1>
            <div className="flex gap-4">
              <button
                onClick={exportToExcel}
                className="btn-primary text-button px-6 py-3 hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  minHeight: '52px',
                  boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)',
                }}
              >
                📊 Экспорт в Excel
              </button>
              <button
                onClick={() => router.push(`/${locale}/admin`)}
                className="btn-primary text-button px-6 py-3 hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: '#6b7280',
                  color: '#ffffff',
                  minHeight: '52px',
                  boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)',
                }}
              >
                ← Назад в админку
              </button>
            </div>
          </div>

          {/* Overall Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div
                className="p-6 rounded-2xl text-center"
                style={{ backgroundColor: 'var(--polar)' }}
              >
                <p className="text-3xl font-bold" style={{ color: '#3b82f6' }}>
                  {stats.totalReferrals}
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--deep-teal)' }}>
                  Всего рефералов
                </p>
              </div>

              <div
                className="p-6 rounded-2xl text-center"
                style={{ backgroundColor: 'var(--polar)' }}
              >
                <p className="text-3xl font-bold" style={{ color: '#10b981' }}>
                  {stats.totalConversions}
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--deep-teal)' }}>
                  Купили аккаунт
                </p>
              </div>

              <div
                className="p-6 rounded-2xl text-center"
                style={{ backgroundColor: 'var(--polar)' }}
              >
                <p className="text-3xl font-bold" style={{ color: '#ff8f0a' }}>
                  {stats.conversionRate}%
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--deep-teal)' }}>
                  Conversion Rate
                </p>
              </div>

              <div
                className="p-6 rounded-2xl text-center"
                style={{ backgroundColor: 'var(--polar)' }}
              >
                <p className="text-3xl font-bold" style={{ color: '#FFD700' }}>
                  {stats.totalBonusMonths}
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--deep-teal)' }}>
                  Бонусных месяцев выдано
                </p>
              </div>
            </div>
          )}

          {/* Top Referrers Table */}
          <div
            className="w-full p-8 rounded-2xl overflow-x-auto"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              Топ-10 рефереров
            </h2>

            <table className="w-full text-base table-auto" style={{ minWidth: '1200px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(1, 49, 45, 0.2)' }}>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '80px' }}>Rank</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '120px' }}>Аккаунт №</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '180px' }}>Имя</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '200px' }}>Email</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '140px' }}>Код</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '140px' }}>Регистраций</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '140px' }}>Конверсий</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '140px' }}>Бонусов</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '120px' }}>CR %</th>
                </tr>
              </thead>
              <tbody>
                {topReferrers.map((referrer, idx) => (
                  <tr key={referrer.userId} style={{ borderBottom: '1px solid rgba(1, 49, 45, 0.1)' }}>
                    <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                      <span className="text-2xl font-bold" style={{ color: '#ff8f0a' }}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                      #{referrer.accountNumber}
                    </td>
                    <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                      {referrer.name}
                    </td>
                    <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                      {referrer.email}
                    </td>
                    <td className="py-4 px-6 font-bold" style={{ color: '#3b82f6' }}>
                      {referrer.referralCode}
                    </td>
                    <td className="py-4 px-6 font-bold" style={{ color: '#3b82f6' }}>
                      {referrer.registrations}
                    </td>
                    <td className="py-4 px-6 font-bold" style={{ color: '#10b981' }}>
                      {referrer.conversions}
                    </td>
                    <td className="py-4 px-6 font-bold" style={{ color: '#FFD700' }}>
                      {referrer.bonusMonths}
                    </td>
                    <td className="py-4 px-6 font-bold" style={{ color: '#ff8f0a' }}>
                      {referrer.conversionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {topReferrers.length === 0 && (
              <div className="text-center py-8" style={{ color: 'var(--deep-teal)' }}>
                Нет данных по рефералам
              </div>
            )}
          </div>

          {/* Daily Registrations Chart */}
          <div
            className="w-full p-8 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              Регистрации по реферальным ссылкам (последние 30 дней)
            </h2>

            {dailyRegistrations.length > 0 ? (
              <div className="space-y-3">
                {dailyRegistrations.map((day) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-32 text-sm" style={{ color: 'var(--deep-teal)' }}>
                      {new Date(day.date).toLocaleDateString()}
                    </div>
                    <div className="flex-1">
                      <div
                        className="rounded-full"
                        style={{
                          backgroundColor: '#3b82f6',
                          height: '32px',
                          width: `${(day.count / Math.max(...dailyRegistrations.map(d => d.count))) * 100}%`,
                          minWidth: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      >
                        {day.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8" style={{ color: 'var(--deep-teal)' }}>
                Нет регистраций за последние 30 дней
              </div>
            )}
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}

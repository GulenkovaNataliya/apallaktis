"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";
import AdminNavigation from "@/components/admin/AdminNavigation";

interface AdminStats {
  totalUsers: number;
  statusBreakdown: {
    demo: number;
    active: number;
    expired: number;
    vip: number;
    readOnly: number;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    name: string;
    account_number: number;
    subscription_status: string;
    created_at: string;
  }>;
}

export default function AdminDashboard() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function checkAdminAndLoadStats(userId: string) {
      // Проверяем что пользователь - админ
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!profile || profile.role !== 'admin') {
        router.push(`/${locale}`);
        return;
      }

      // Загружаем статистику - код ниже
      loadStatsData();
    }

    async function loadStatsData() {

      // Загружаем статистику
      try {
        // Всего пользователей
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Разбивка по статусам
        const { count: demo } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('subscription_status', 'demo');

        const { count: active } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('subscription_status', 'active');

        const { count: expired } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('subscription_status', 'expired');

        const { count: vip } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('subscription_status', 'vip');

        const { count: readOnly } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('subscription_status', 'read-only');

        // Последние 10 пользователей
        const { data: recentUsers } = await supabase
          .from('profiles')
          .select('id, email, name, account_number, subscription_status, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        setStats({
          totalUsers: totalUsers || 0,
          statusBreakdown: {
            demo: demo || 0,
            active: active || 0,
            expired: expired || 0,
            vip: vip || 0,
            readOnly: readOnly || 0,
          },
          recentUsers: recentUsers || [],
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    // Слушаем изменения auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        checkAdminAndLoadStats(session.user.id);
      } else if (event === 'SIGNED_OUT' || !session) {
        router.push(`/${locale}/login`);
      }
    });

    // Проверяем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAdminAndLoadStats(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [locale, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <BackgroundPage pageIndex={1}>
      <AdminNavigation />
      <div className="flex min-h-screen flex-col items-center gap-8 pb-20" style={{ paddingLeft: '30px', paddingRight: '30px', paddingTop: '120px' }}>
        <div className="w-full max-w-6xl space-y-6">
          {/* Header */}
          <h1
            className="text-slogan font-bold text-center"
            style={{ color: '#ff8f0a' }}
          >
            Панель администратора
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Total Users */}
            <div
              className="p-6 rounded-2xl text-center"
              style={{ backgroundColor: 'var(--polar)' }}
            >
              <p className="text-3xl font-bold" style={{ color: '#ff8f0a' }}>
                {stats.totalUsers}
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--deep-teal)' }}>
                Всего пользователей
              </p>
            </div>

            {/* DEMO */}
            <div
              className="p-6 rounded-2xl text-center"
              style={{ backgroundColor: 'var(--polar)' }}
            >
              <p className="text-3xl font-bold" style={{ color: '#3b82f6' }}>
                {stats.statusBreakdown.demo}
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--deep-teal)' }}>
                DEMO
              </p>
            </div>

            {/* Active */}
            <div
              className="p-6 rounded-2xl text-center"
              style={{ backgroundColor: 'var(--polar)' }}
            >
              <p className="text-3xl font-bold" style={{ color: '#10b981' }}>
                {stats.statusBreakdown.active}
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--deep-teal)' }}>
                Активные
              </p>
            </div>

            {/* VIP */}
            <div
              className="p-6 rounded-2xl text-center"
              style={{ backgroundColor: 'var(--polar)' }}
            >
              <p className="text-3xl font-bold" style={{ color: '#FFD700' }}>
                {stats.statusBreakdown.vip}
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--deep-teal)' }}>
                VIP
              </p>
            </div>

            {/* Expired */}
            <div
              className="p-6 rounded-2xl text-center"
              style={{ backgroundColor: 'var(--polar)' }}
            >
              <p className="text-3xl font-bold" style={{ color: '#ef4444' }}>
                {stats.statusBreakdown.expired}
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--deep-teal)' }}>
                Истекшие
              </p>
            </div>

            {/* Read-Only */}
            <div
              className="p-6 rounded-2xl text-center"
              style={{ backgroundColor: 'var(--polar)' }}
            >
              <p className="text-3xl font-bold" style={{ color: '#9ca3af' }}>
                {stats.statusBreakdown.readOnly}
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--deep-teal)' }}>
                Только чтение
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <button
              onClick={() => router.push(`/${locale}/admin/users`)}
              className="btn-primary text-button text-center py-4 px-6 text-lg font-semibold hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: 'var(--zanah)',
                color: 'var(--deep-teal)',
                boxShadow: '0 4px 12px rgba(1, 49, 45, 0.2)',
              }}
            >
              👥 Пользователи
            </button>

            <button
              onClick={() => router.push(`/${locale}/admin/vip`)}
              className="btn-primary text-button text-center py-4 px-6 text-lg font-semibold hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: '#FFD700',
                color: '#000000',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
              }}
            >
              ⭐ VIP
            </button>

            <button
              onClick={() => router.push(`/${locale}/admin/payments`)}
              className="btn-primary text-button text-center py-4 px-6 text-lg font-semibold hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)',
              }}
            >
              💰 Платежи
            </button>

            <button
              onClick={() => router.push(`/${locale}/admin/referrals`)}
              className="btn-primary text-button text-center py-4 px-6 text-lg font-semibold hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)',
              }}
            >
              🎁 Рефералы
            </button>

            <button
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="btn-primary text-button text-center py-4 px-6 text-lg font-semibold hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: '#6b7280',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)',
              }}
            >
              🏠 Главная
            </button>
          </div>

          {/* Recent Users */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              Последние регистрации (10 шт.)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-base table-auto" style={{ minWidth: '900px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(1, 49, 45, 0.2)' }}>
                    <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '120px' }}>Аккаунт №</th>
                    <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '200px' }}>Имя</th>
                    <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '220px' }}>Email</th>
                    <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '140px' }}>Статус</th>
                    <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '140px' }}>Зарегистрирован</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid rgba(1, 49, 45, 0.1)' }}>
                      <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                        #{user.account_number}
                      </td>
                      <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                        <div className="font-medium">{user.name}</div>
                      </td>
                      <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                        {user.email}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className="px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap"
                          style={{
                            backgroundColor:
                              user.subscription_status === 'active'
                                ? '#10b981'
                                : user.subscription_status === 'vip'
                                ? '#FFD700'
                                : user.subscription_status === 'demo'
                                ? '#3b82f6'
                                : user.subscription_status === 'expired'
                                ? '#ef4444'
                                : '#9ca3af',
                            color: user.subscription_status === 'vip' ? '#000' : '#fff',
                          }}
                        >
                          {user.subscription_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}

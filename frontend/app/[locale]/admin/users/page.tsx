"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";
import AdminNavigation from "@/components/admin/AdminNavigation";

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  account_number: number;
  subscription_status: string;
  subscription_plan?: string;
  subscription_expires_at?: string;
  created_at: string;
  company_name?: string;
  afm?: string;
  bonus_months?: number;
}

export default function AdminUsers() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const supabase = createClient();

    async function checkAdminAndLoad(userId: string) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!profile || profile.role !== 'admin') {
        router.push(`/${locale}`);
        return;
      }

      setIsAdmin(true);
      loadUsersData();
    }

    async function loadUsersData() {
      try {
        let query = supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
          query = query.eq('subscription_status', statusFilter);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error loading users:', error);
        } else {
          setUsers(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        checkAdminAndLoad(session.user.id);
      } else if (event === 'SIGNED_OUT' || !session) {
        router.push(`/${locale}/login`);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAdminAndLoad(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [locale, router, statusFilter]);

  async function loadUsers() {
    const supabase = createClient();
    setIsLoading(true);

    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('subscription_status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading users:', error);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function extendSubscription(userId: string, accountNumber: number) {
    if (!confirm(`Продлить подписку для аккаунта #${accountNumber} на +1 месяц?`)) {
      return;
    }

    const supabase = createClient();

    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      // Вычисляем новую дату окончания (+30 дней от текущей даты или от expires_at)
      const currentExpires = user.subscription_expires_at
        ? new Date(user.subscription_expires_at)
        : new Date();

      const newExpires = new Date(currentExpires);
      newExpires.setDate(newExpires.getDate() + 30);

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_expires_at: newExpires.toISOString(),
          subscription_status: 'active',
        })
        .eq('id', userId);

      if (error) {
        alert('Ошибка продления подписки: ' + error.message);
      } else {
        alert('✅ Подписка успешно продлена!');
        loadUsers();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка продления подписки');
    }
  }

  async function blockUser(userId: string, accountNumber: number) {
    if (!confirm(`Заблокировать аккаунт #${accountNumber}? Пользователь получит доступ только для чтения.`)) {
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: 'read-only' })
        .eq('id', userId);

      if (error) {
        alert('Ошибка блокировки пользователя: ' + error.message);
      } else {
        alert('✅ Пользователь успешно заблокирован!');
        loadUsers();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка блокировки пользователя');
    }
  }

  async function unblockUser(userId: string, accountNumber: number) {
    if (!confirm(`Разблокировать аккаунт #${accountNumber}?`)) {
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: 'active' })
        .eq('id', userId);

      if (error) {
        alert('Ошибка разблокировки пользователя: ' + error.message);
      } else {
        alert('✅ Пользователь успешно разблокирован!');
        loadUsers();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка разблокировки пользователя');
    }
  }

  async function revokeVIP(userId: string, userName: string, userEmail: string, accountNumber: number) {
    if (!confirm(`Отозвать VIP у пользователя ${userName} (#${accountNumber})?\n\nПользователь получит уведомление по email.`)) {
      return;
    }

    const supabase = createClient();

    try {
      // Get user's preferred language
      const { data: user } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', userId)
        .single();

      // Update profile - remove VIP
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: null,
          vip_expires_at: null,
          vip_granted_by: null,
          vip_reason: null,
        })
        .eq('id', userId);

      if (error) {
        alert('Ошибка отзыва VIP: ' + error.message);
        return;
      }

      // Send email notification
      try {
        await fetch('/api/email/vip-cancelled', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail,
            userName,
            locale: user?.preferred_language || 'el',
          }),
        });
      } catch (emailError) {
        console.error('Failed to send VIP cancellation email:', emailError);
      }

      alert('✅ VIP успешно отозван. Пользователь уведомлён по email.');
      loadUsers();
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка отзыва VIP');
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.account_number.toString().includes(searchQuery);

    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BackgroundPage pageIndex={1}>
      <AdminNavigation />
      <div className="flex min-h-screen flex-col gap-8 pb-20" style={{ paddingLeft: '30px', paddingRight: '30px', paddingTop: '120px' }}>
        <div className="w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1
              className="text-slogan font-bold"
              style={{ color: '#ff8f0a' }}
            >
              Управление пользователями
            </h1>
            <button
              onClick={() => router.push(`/${locale}/admin`)}
              className="btn-primary text-button px-6 py-3 hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: '#6b7280',
                color: '#ffffff',
              }}
            >
              ← Назад в админку
            </button>
          </div>

          {/* Filters */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--deep-teal)' }}>
                  Поиск (email, имя, номер аккаунта)
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск..."
                  className="w-full px-4 py-2 rounded-xl border-2"
                  style={{
                    borderColor: 'var(--zanah)',
                    color: 'var(--deep-teal)',
                  }}
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--deep-teal)' }}>
                  Фильтр по статусу
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setIsLoading(true);
                    setTimeout(() => loadUsers(), 100);
                  }}
                  className="w-full px-4 py-2 rounded-xl border-2"
                  style={{
                    borderColor: 'var(--zanah)',
                    color: 'var(--deep-teal)',
                  }}
                >
                  <option value="all">Все</option>
                  <option value="demo">DEMO</option>
                  <option value="active">Активные</option>
                  <option value="expired">Истекшие</option>
                  <option value="vip">VIP</option>
                  <option value="read-only">Только чтение</option>
                </select>
              </div>
            </div>

            <p className="text-sm mt-4" style={{ color: 'var(--deep-teal)' }}>
              Всего: {filteredUsers.length} пользователей
            </p>
          </div>

          {/* Users Table */}
          <div
            className="w-full p-8 rounded-2xl overflow-x-auto"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <table className="w-full text-lg table-auto" style={{ minWidth: '1400px', borderSpacing: '0 8px', borderCollapse: 'separate' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(1, 49, 45, 0.2)' }}>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '100px' }}>Аккаунт №</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '180px' }}>Имя</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '200px' }}>Email</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '120px' }}>Статус</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '100px' }}>План</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '120px' }}>Истекает</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '80px' }}>Бонус</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '500px' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(1, 49, 45, 0.1)' }}>
                    <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                      #{user.account_number}
                    </td>
                    <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                      <div className="font-medium">{user.name}</div>
                      {user.company_name && (
                        <div className="text-sm opacity-70 mt-1">{user.company_name}</div>
                      )}
                    </td>
                    <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                      {user.email || 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-semibold"
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
                      {user.subscription_plan || '-'}
                    </td>
                    <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                      {user.subscription_expires_at
                        ? new Date(user.subscription_expires_at).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="py-4 px-6 font-bold" style={{ color: '#ff8f0a' }}>
                      {user.bonus_months || 0}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-nowrap" style={{ gap: '20px' }}>
                        <button
                          onClick={() => extendSubscription(user.id, user.account_number)}
                          className="text-xl px-6 py-4 rounded-xl font-bold hover:opacity-80 transition-opacity whitespace-nowrap flex-1"
                          style={{
                            backgroundColor: '#10b981',
                            color: '#fff',
                            minWidth: '150px',
                          }}
                          title="Продлить подписку +1 месяц"
                        >
                          +1 месяц
                        </button>
                        {user.subscription_status !== 'read-only' ? (
                          <button
                            onClick={() => blockUser(user.id, user.account_number)}
                            className="text-xl px-6 py-4 rounded-xl font-bold hover:opacity-80 transition-opacity whitespace-nowrap flex-1"
                            style={{
                              backgroundColor: '#ef4444',
                              color: '#fff',
                              minWidth: '120px',
                            }}
                            title="Заблокировать пользователя"
                          >
                            Блок
                          </button>
                        ) : (
                          <button
                            onClick={() => unblockUser(user.id, user.account_number)}
                            className="text-xl px-6 py-4 rounded-xl font-bold hover:opacity-80 transition-opacity whitespace-nowrap flex-1"
                            style={{
                              backgroundColor: '#10b981',
                              color: '#fff',
                              minWidth: '120px',
                            }}
                            title="Разблокировать пользователя"
                          >
                            Разблок
                          </button>
                        )}
                        {user.subscription_status === 'vip' ? (
                          <button
                            onClick={() => revokeVIP(user.id, user.name, user.email || '', user.account_number)}
                            className="text-xl px-6 py-4 rounded-xl font-bold hover:opacity-80 transition-opacity whitespace-nowrap flex-1"
                            style={{
                              backgroundColor: '#ef4444',
                              color: '#fff',
                              minWidth: '150px',
                            }}
                            title="Отозвать VIP"
                          >
                            Отозвать VIP
                          </button>
                        ) : (
                          <button
                            onClick={() => router.push(`/${locale}/admin/vip?email=${user.email || ''}`)}
                            className="text-xl px-6 py-4 rounded-xl font-bold hover:opacity-80 transition-opacity whitespace-nowrap flex-1"
                            style={{
                              backgroundColor: '#FFD700',
                              color: '#000',
                              minWidth: '120px',
                            }}
                            title="Активировать VIP"
                          >
                            ⭐ VIP
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8" style={{ color: 'var(--deep-teal)' }}>
                Пользователи не найдены
              </div>
            )}
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}

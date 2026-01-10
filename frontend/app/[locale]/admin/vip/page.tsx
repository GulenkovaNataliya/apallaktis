"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";

interface VIPUser {
  id: string;
  email: string;
  name: string;
  account_number: number;
  subscription_status: string;
  subscription_expires_at?: string;
  created_at: string;
}

export default function AdminVIP() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params.locale as Locale) || "el";
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState(searchParams.get('email') || "");
  const [duration, setDuration] = useState<string>("1month");
  const [customDate, setCustomDate] = useState("");
  const [reason, setReason] = useState("");
  const [vipUsers, setVIPUsers] = useState<VIPUser[]>([]);

  useEffect(() => {
    checkAuth();
    loadVIPUsers();
  }, []);

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

  async function loadVIPUsers() {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('subscription_status', 'vip')
      .order('created_at', { ascending: false });

    setVIPUsers(data || []);
  }

  async function activateVIP() {
    if (!email.trim()) {
      alert('Введите email пользователя');
      return;
    }

    const supabase = createClient();

    try {
      // Проверяем текущего пользователя (себя)
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        alert('Вы не авторизованы');
        return;
      }

      // Получаем профиль текущего пользователя
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (userError || !user) {
        alert(`Ваш профиль не найден`);
        return;
      }

      // Вычисляем дату окончания VIP
      let expiresAt: string | null = null;

      if (duration === 'forever') {
        // VIP навсегда - ставим дату через 100 лет
        const foreverDate = new Date();
        foreverDate.setFullYear(foreverDate.getFullYear() + 100);
        expiresAt = foreverDate.toISOString();
      } else if (duration === 'custom') {
        if (!customDate) {
          alert('Выберите дату окончания VIP');
          return;
        }
        expiresAt = new Date(customDate).toISOString();
      } else {
        const now = new Date();
        switch (duration) {
          case '1month':
            now.setMonth(now.getMonth() + 1);
            break;
          case '3months':
            now.setMonth(now.getMonth() + 3);
            break;
          case '6months':
            now.setMonth(now.getMonth() + 6);
            break;
          case '1year':
            now.setFullYear(now.getFullYear() + 1);
            break;
        }
        expiresAt = now.toISOString();
      }

      // Обновляем пользователя
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'vip',
          subscription_expires_at: expiresAt,
          subscription_plan: 'VIP',
        })
        .eq('id', user.id);

      if (updateError) {
        alert('Ошибка активации VIP: ' + updateError.message);
        return;
      }

      // Отправляем email уведомление
      try {
        await fetch('/api/email/vip-activated', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            expiresAt,
            reason: reason || undefined,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send VIP email:', emailError);
      }

      alert(`✅ VIP активирован для ${user.name} (${user.email})`);
      setEmail("");
      setReason("");
      loadVIPUsers();
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка активации VIP');
    }
  }

  async function revokeVIP(userId: string, userName: string) {
    if (!confirm(`Отозвать VIP у пользователя ${userName}?`)) {
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: null,
        })
        .eq('id', userId);

      if (error) {
        alert('Ошибка отзыва VIP: ' + error.message);
      } else {
        alert('✅ VIP успешно отозван');
        loadVIPUsers();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка отзыва VIP');
    }
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
        <div className="w-full space-y-6" style={{ maxWidth: '1400px' }}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1
              className="text-slogan font-bold"
              style={{ color: '#ff8f0a' }}
            >
              Активация VIP
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

          {/* VIP Activation Form */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              Активировать VIP для пользователя
            </h2>

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--deep-teal)' }}>
                  Email пользователя
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 rounded-xl border-2"
                  style={{
                    borderColor: 'var(--zanah)',
                    color: 'var(--deep-teal)',
                  }}
                />
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--deep-teal)' }}>
                  Длительность VIP
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2"
                  style={{
                    borderColor: 'var(--zanah)',
                    color: 'var(--deep-teal)',
                  }}
                >
                  <option value="1month">1 месяц</option>
                  <option value="3months">3 месяца</option>
                  <option value="6months">6 месяцев</option>
                  <option value="1year">1 год</option>
                  <option value="forever">Навсегда</option>
                  <option value="custom">Своя дата</option>
                </select>
              </div>

              {/* Custom Date (if selected) */}
              {duration === 'custom' && (
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--deep-teal)' }}>
                    Дата окончания VIP
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border-2"
                    style={{
                      borderColor: 'var(--zanah)',
                      color: 'var(--deep-teal)',
                    }}
                  />
                </div>
              )}

              {/* Reason (optional) */}
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--deep-teal)' }}>
                  Причина (опционально)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Например: За помощь в развитии проекта"
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border-2"
                  style={{
                    borderColor: 'var(--zanah)',
                    color: 'var(--deep-teal)',
                  }}
                />
              </div>

              {/* Activate Button */}
              <button
                onClick={activateVIP}
                className="btn-primary text-button w-full py-4 text-lg font-bold hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: '#FFD700',
                  color: '#000000',
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
                }}
              >
                ⭐ Активировать VIP
              </button>
            </div>
          </div>

          {/* Current VIP Users */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              Текущие VIP пользователи ({vipUsers.length})
            </h2>

            {vipUsers.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--deep-teal)' }}>
                Нет VIP пользователей
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-base table-auto" style={{ minWidth: '900px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(1, 49, 45, 0.2)' }}>
                      <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '120px' }}>Аккаунт №</th>
                      <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '200px' }}>Имя</th>
                      <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '220px' }}>Email</th>
                      <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '140px' }}>VIP истекает</th>
                      <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '200px' }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vipUsers.map((user) => (
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
                        <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                          {user.subscription_expires_at
                            ? new Date(user.subscription_expires_at).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => revokeVIP(user.id, user.name)}
                            className="text-base px-6 py-3 rounded-lg font-semibold hover:opacity-80 transition-opacity whitespace-nowrap"
                            style={{
                              backgroundColor: '#ef4444',
                              color: '#fff',
                              minWidth: '180px',
                            }}
                          >
                            Отозвать VIP
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}

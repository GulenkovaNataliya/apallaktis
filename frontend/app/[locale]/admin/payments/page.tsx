"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";

interface Payment {
  id: string;
  user_id: string;
  account_number: number;
  user_email: string;
  user_name: string;
  amount: number;
  currency: string;
  payment_method: 'stripe' | 'cash' | 'iris';
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  type: 'account_purchase' | 'subscription';
  stripe_session_id?: string;
  created_at: string;
}

export default function AdminPayments() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

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

  async function loadPayments() {
    const supabase = createClient();

    // Note: This is a mock implementation
    // In real app, you'd query a payments table
    // For now, we'll show subscription payments from Stripe webhook logs

    try {
      // Get all users with their payment info
      const query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: users } = await query;

      if (users) {
        // Convert user subscriptions to payment format
        const mockPayments: Payment[] = users
          .filter(u => u.subscription_status !== 'demo')
          .map(user => ({
            id: `pay_${user.id.slice(0, 8)}`,
            user_id: user.id,
            account_number: user.account_number,
            user_email: user.email || 'N/A',
            user_name: user.name,
            amount: user.subscription_plan === 'Basic' ? 20 : user.subscription_plan === 'Standard' ? 30 : user.subscription_plan === 'Premium' ? 45 : 0,
            currency: 'EUR',
            payment_method: 'stripe' as const,
            status: user.subscription_status === 'active' || user.subscription_status === 'vip' ? 'succeeded' as const : 'pending' as const,
            type: 'subscription' as const,
            stripe_session_id: undefined,
            created_at: user.created_at,
          }));

        setPayments(mockPayments);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  }

  useEffect(() => {
    checkAuth();
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMethod, filterStatus, filterType]);

  const filteredPayments = payments.filter(payment => {
    if (filterMethod !== 'all' && payment.payment_method !== filterMethod) return false;
    if (filterStatus !== 'all' && payment.status !== filterStatus) return false;
    if (filterType !== 'all' && payment.type !== filterType) return false;
    return true;
  });

  const totalAmount = filteredPayments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);

  const successCount = filteredPayments.filter(p => p.status === 'succeeded').length;
  const failedCount = filteredPayments.filter(p => p.status === 'failed').length;
  const avgAmount = successCount > 0 ? (totalAmount / successCount).toFixed(2) : '0.00';

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
              История платежей
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

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
              className="p-6 rounded-2xl text-center"
              style={{ backgroundColor: 'var(--polar)' }}
            >
              <p className="text-3xl font-bold" style={{ color: '#10b981' }}>
                €{totalAmount.toFixed(2)}
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--deep-teal)' }}>
                Общая сумма
              </p>
            </div>

            <div
              className="p-6 rounded-2xl text-center"
              style={{ backgroundColor: 'var(--polar)' }}
            >
              <p className="text-3xl font-bold" style={{ color: '#10b981' }}>
                {successCount}
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--deep-teal)' }}>
                Успешных
              </p>
            </div>

            <div
              className="p-6 rounded-2xl text-center"
              style={{ backgroundColor: 'var(--polar)' }}
            >
              <p className="text-3xl font-bold" style={{ color: '#ef4444' }}>
                {failedCount}
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--deep-teal)' }}>
                Отклонённых
              </p>
            </div>

            <div
              className="p-6 rounded-2xl text-center"
              style={{ backgroundColor: 'var(--polar)' }}
            >
              <p className="text-3xl font-bold" style={{ color: 'var(--zanah)' }}>
                €{avgAmount}
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--deep-teal)' }}>
                Средний чек
              </p>
            </div>
          </div>

          {/* Filters */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Method Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--deep-teal)' }}>
                  Метод оплаты
                </label>
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2"
                  style={{
                    borderColor: 'var(--zanah)',
                    color: 'var(--deep-teal)',
                  }}
                >
                  <option value="all">Все</option>
                  <option value="stripe">Stripe</option>
                  <option value="cash">Наличные</option>
                  <option value="iris">IRIS</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--deep-teal)' }}>
                  Статус
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2"
                  style={{
                    borderColor: 'var(--zanah)',
                    color: 'var(--deep-teal)',
                  }}
                >
                  <option value="all">Все</option>
                  <option value="succeeded">Успешно</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Отклонено</option>
                  <option value="refunded">Возврат</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--deep-teal)' }}>
                  Тип
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2"
                  style={{
                    borderColor: 'var(--zanah)',
                    color: 'var(--deep-teal)',
                  }}
                >
                  <option value="all">Все</option>
                  <option value="account_purchase">Покупка аккаунта</option>
                  <option value="subscription">Подписка</option>
                </select>
              </div>
            </div>

            <p className="text-sm mt-4" style={{ color: 'var(--deep-teal)' }}>
              Показано: {filteredPayments.length} платежей
            </p>
          </div>

          {/* Payments Table */}
          <div
            className="w-full p-8 rounded-2xl overflow-x-auto"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <table className="w-full text-base table-auto" style={{ minWidth: '1200px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(1, 49, 45, 0.2)' }}>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '140px' }}>Дата</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '100px' }}>Аккаунт №</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '200px' }}>Email</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '100px' }}>Сумма</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '120px' }}>Метод</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '120px' }}>Статус</th>
                  <th className="text-left py-4 px-6 font-bold whitespace-nowrap" style={{ color: 'var(--deep-teal)', minWidth: '140px' }}>Тип</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid rgba(1, 49, 45, 0.1)' }}>
                    <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                      {new Date(payment.created_at).toLocaleDateString()} {new Date(payment.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                      #{payment.account_number}
                    </td>
                    <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                      {payment.user_email}
                    </td>
                    <td className="py-4 px-6 font-bold" style={{ color: '#10b981' }}>
                      €{payment.amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                      {payment.payment_method.toUpperCase()}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className="px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap"
                        style={{
                          backgroundColor:
                            payment.status === 'succeeded'
                              ? '#10b981'
                              : payment.status === 'pending'
                              ? '#3b82f6'
                              : payment.status === 'refunded'
                              ? '#9ca3af'
                              : '#ef4444',
                          color: '#fff',
                        }}
                      >
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6" style={{ color: 'var(--deep-teal)' }}>
                      {payment.type === 'account_purchase' ? 'Покупка аккаунта' : 'Подписка'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPayments.length === 0 && (
              <div className="text-center py-8" style={{ color: 'var(--deep-teal)' }}>
                Платежи не найдены
              </div>
            )}
          </div>
        </div>
      </div>
    </BackgroundPage>
  );
}

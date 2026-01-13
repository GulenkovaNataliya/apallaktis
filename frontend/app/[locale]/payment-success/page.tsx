"use client";

import { useEffect, useState } from 'react';
import BackgroundPage from '@/components/BackgroundPage';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { messages, type Locale } from '@/lib/messages';
import { createClient } from '@/lib/supabase/client';

export default function PaymentSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.paymentSuccess || messages.el.paymentSuccess;

  const [accountNumber, setAccountNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Получить session_id из URL
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('account_number, account_purchased')
            .eq('id', user.id)
            .single();

          if (profile) {
            setAccountNumber(profile.account_number);

            // Если аккаунт еще не активирован, webhook должен это сделать
            // Но на всякий случай проверяем
            if (!profile.account_purchased && sessionId) {
              console.log('Ожидание активации аккаунта через webhook...');
              // Webhook обработает это автоматически
            }
          }
        }
      } catch (error) {
        console.error('Error fetching account info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountInfo();
  }, [sessionId]);

  return (
    <BackgroundPage pageIndex={1}>
      <div className="min-h-screen flex flex-col items-center justify-center px-10 py-20">

        {/* Success Icon */}
        <div
          className="mb-6 rounded-full flex items-center justify-center"
          style={{
            width: '100px',
            height: '100px',
            backgroundColor: '#25D366',
          }}
        >
          <span style={{ fontSize: '50px' }}>✓</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--polar)' }}>
          {t.title}
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-center mb-8 max-w-sm" style={{ color: 'var(--polar)', opacity: 0.9 }}>
          {t.subtitle}
        </p>

        {/* Success Messages */}
        <div className="w-full max-w-sm mb-8 space-y-4">
          <div
            className="p-4 rounded-lg text-center"
            style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)', border: '2px solid #25D366' }}
          >
            <p className="font-semibold" style={{ color: 'var(--polar)' }}>
              {t.accountActivated}
            </p>
          </div>

          <div
            className="p-4 rounded-lg text-center"
            style={{ backgroundColor: 'rgba(255, 143, 10, 0.1)', border: '2px solid #ff8f0a' }}
          >
            <p className="font-semibold" style={{ color: '#ff8f0a' }}>
              {t.freeMonthStarted}
            </p>
          </div>

          <div
            className="p-4 rounded-lg text-center"
            style={{ backgroundColor: 'rgba(1, 49, 45, 0.1)', border: '2px solid var(--deep-teal)' }}
          >
            <p className="text-sm" style={{ color: 'var(--deep-teal)' }}>
              {t.receiptSent}
            </p>
          </div>
        </div>

        {/* Account Number */}
        {accountNumber && (
          <p className="text-md text-center mb-8" style={{ color: 'var(--polar)', opacity: 0.7 }}>
            {t.accountNumber}: <span className="font-bold">#{accountNumber}</span>
          </p>
        )}

        {/* Go to Dashboard Button */}
        <button
          onClick={() => router.push(`/${locale}/page-pay`)}
          className="w-full max-w-sm rounded-lg flex items-center justify-center text-button"
          style={{
            minHeight: '52px',
            backgroundColor: 'var(--zanah)',
            color: 'var(--deep-teal)',
          }}
        >
          {t.goToDashboard}
        </button>

        {/* Session ID (for debugging) */}
        {sessionId && (
          <p className="text-xs text-center mt-8" style={{ color: 'var(--polar)', opacity: 0.4 }}>
            Session: {sessionId.substring(0, 20)}...
          </p>
        )}
      </div>
    </BackgroundPage>
  );
}

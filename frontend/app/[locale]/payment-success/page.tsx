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
    <BackgroundPage pageIndex={2}>
      <div
        className="flex flex-col items-center gap-12"
        style={{
          paddingTop: '180px',
          paddingBottom: '120px',
          paddingLeft: '40px',
          paddingRight: '40px',
        }}
      >
        {/* Success Icon */}
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: '100px',
            height: '100px',
            backgroundColor: '#25D366',
          }}
        >
          <span style={{ fontSize: '50px' }}>✓</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center" style={{ color: 'var(--polar)' }}>
          {t.title}
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-center" style={{ color: 'var(--polar)', opacity: 0.9 }}>
          {t.subtitle}
        </p>

        {/* Account Number */}
        {accountNumber && (
          <p className="text-button text-center" style={{ color: 'var(--orange)' }}>
            {t.accountNumber}: <span className="font-bold">#{accountNumber}</span>
          </p>
        )}

        {/* 30 days free */}
        <p className="text-button text-center" style={{ color: 'var(--orange)' }}>
          {t.freeMonthStarted}
        </p>

        {/* Receipt sent */}
        <p className="text-button text-center" style={{ color: 'var(--zanah)' }}>
          {t.receiptSent}
        </p>

        {/* Go to Dashboard - link with arrow */}
        <p
          onClick={() => router.push(`/${locale}/page-pay`)}
          className="text-button cursor-pointer text-center"
          style={{ color: 'var(--polar)' }}
        >
          {t.goToDashboard} →
        </p>

        {/* Session ID (for debugging) */}
        {sessionId && (
          <p className="text-xs text-center" style={{ color: 'var(--polar)', opacity: 0.4 }}>
            Session: {sessionId.substring(0, 20)}...
          </p>
        )}
      </div>
    </BackgroundPage>
  );
}

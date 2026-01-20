"use client";

import { useState, useEffect } from 'react';
import BackgroundPage from '@/components/BackgroundPage';
import { useParams, useRouter } from 'next/navigation';
import { messages, type Locale } from '@/lib/messages';
import { createClient } from '@/lib/supabase/client';

export default function PurchaseAccountPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.purchaseAccount || messages.el.purchaseAccount;

  const [accountNumber, setAccountNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccountNumber = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('account_number')
            .eq('id', user.id)
            .single();

          if (profile) {
            setAccountNumber(profile.account_number);
          }
        }
      } catch (error) {
        console.error('Error fetching account number:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountNumber();
  }, []);

  const handleStripePayment = async () => {
    try {
      setIsLoading(true);

      // Создаем checkout session через API
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка создания сессии оплаты');
      }

      // Перенаправление на Stripe Checkout URL
      // API должен возвращать URL для редиректа
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Не получен URL для оплаты');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'Ошибка при создании платежа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundPage pageIndex={1}>
      <div className="flex flex-col items-center pb-20 gap-12" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px' }}>

        {/* Back - law: <p> element */}
        <p
          onClick={() => router.back()}
          className="text-button cursor-pointer w-full"
          style={{ color: 'var(--polar)' }}
        >
          {t.backToDashboard}
        </p>

        {/* Title + Price Block - grouped with small gap */}
        <div className="flex flex-col items-center text-center gap-2">
          {/* Title */}
          <h1 className="text-3xl font-bold text-center" style={{ color: 'var(--polar)' }}>
            {t.title}
          </h1>

          {/* Line 1: Special Price */}
          <p className="text-lg" style={{ color: 'var(--orange)', fontWeight: 600 }}>
            {t.specialPrice}
          </p>
          {/* Line 2: 62€ με ΦΠΑ - always Greek */}
          <p className="text-3xl font-bold" style={{ color: 'var(--orange)' }}>
            62€ με ΦΠΑ
          </p>
          {/* Line 3: BONUS - English only */}
          <p className="text-lg font-bold mt-2" style={{ color: 'var(--zanah)' }}>
            BONUS
          </p>
          {/* Line 4: 30 days free */}
          <p style={{ color: 'var(--orange)', fontSize: '18px', fontWeight: 600 }}>
            {t.firstMonthFree}
          </p>
        </div>

        {/* Payment Methods */}

        {/* 1. Stripe Online Payment */}
        <div className="w-full max-w-sm">
          <button
            onClick={handleStripePayment}
            className="w-full rounded-2xl flex items-center justify-center text-button"
            style={{
              minHeight: '52px',
              background: 'linear-gradient(135deg, #e7f4f1 0%, #c3e2dc 100%)',
              color: 'var(--deep-teal)',
              cursor: 'pointer',
              padding: '16px',
            }}
          >
            <span className="text-lg font-semibold">{t.onlinePayment}</span>
          </button>
        </div>

        {/* 2. Bank Transfer - ΤΡΑΠΕΖΑ ΠΕΙΡΑΙΩΣ */}
        <div className="w-full max-w-sm">
          <button
            className="w-full rounded-2xl flex flex-col items-center justify-center text-button"
            style={{
              minHeight: '100px',
              background: 'linear-gradient(135deg, #e7f4f1 0%, #c3e2dc 100%)',
              color: 'var(--deep-teal)',
              padding: '16px',
            }}
            onClick={() => {
              navigator.clipboard.writeText('GR9001721020005102086382968');
              alert('IBAN copied!');
            }}
          >
            <span className="text-sm font-semibold">{t.bankTransfer}</span>
            <span className="text-lg font-bold mt-1">ΤΡΑΠΕΖΑ ΠΕΙΡΑΙΩΣ</span>
            <span className="text-xs mt-1" style={{ fontFamily: 'monospace' }}>IBAN GR9001721020005102086382968</span>
            <span className="text-xs mt-1" style={{ opacity: 0.8 }}>NATALIYA GULENKOVA</span>
          </button>
        </div>

        {/* 3. Bank Transfer - EUROBANK */}
        <div className="w-full max-w-sm">
          <button
            className="w-full rounded-2xl flex flex-col items-center justify-center text-button"
            style={{
              minHeight: '100px',
              background: 'linear-gradient(135deg, #e7f4f1 0%, #c3e2dc 100%)',
              color: 'var(--deep-teal)',
              padding: '16px',
            }}
            onClick={() => {
              navigator.clipboard.writeText('GR1602601070000280201824734');
              alert('IBAN copied!');
            }}
          >
            <span className="text-sm font-semibold">{t.bankTransfer}</span>
            <span className="text-lg font-bold mt-1">EUROBANK</span>
            <span className="text-xs mt-1" style={{ fontFamily: 'monospace' }}>IBAN GR1602601070000280201824734</span>
            <span className="text-xs mt-1" style={{ opacity: 0.8 }}>NATALIYA GULENKOVA</span>
          </button>
        </div>

        {/* Account Number */}
        {accountNumber && (
          <p className="text-sm text-center mt-8" style={{ color: 'var(--polar)', opacity: 0.6 }}>
            {messages[locale]?.demoExpired?.accountNumber || 'Номер аккаунта'}: #{accountNumber}
          </p>
        )}
      </div>
    </BackgroundPage>
  );
}

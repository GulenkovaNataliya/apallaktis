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
      <div className="min-h-screen flex flex-col items-center justify-center py-20" style={{ paddingLeft: '40px', paddingRight: '40px' }}>

        {/* Back Button */}
        <div className="w-full max-w-sm mb-6">
          <button
            onClick={() => router.back()}
            style={{ color: 'var(--polar)', fontSize: '18px', fontWeight: 600 }}
          >
            {t.backToDashboard}
          </button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--polar)' }}>
          {t.title}
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-center mb-8 max-w-sm" style={{ color: 'var(--polar)', opacity: 0.9 }}>
          {t.subtitle}
        </p>

        {/* Free Month Notice */}
        <p className="text-md text-center mb-12 max-w-sm font-semibold" style={{ color: '#ff8f0a' }}>
          {t.firstMonthFree}
        </p>

        {/* Payment Methods */}

        {/* 1. Stripe Online Payment */}
        <div className="w-full max-w-sm mb-6">
          <button
            onClick={handleStripePayment}
            className="w-full rounded-2xl flex flex-col items-center justify-center text-button relative"
            style={{
              minHeight: '64px',
              backgroundColor: 'var(--zanah)',
              color: 'var(--deep-teal)',
              cursor: 'pointer',
              padding: '16px',
            }}
          >
            {/* Special Price Tag */}
            <span
              className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: '#ff6a1a', color: 'white' }}
            >
              {t.specialPrice}
            </span>

            <span className="text-lg font-semibold">{t.onlinePayment}</span>
            <span className="text-sm mt-1 font-bold">{t.price}</span>
          </button>
        </div>

        {/* 2. Bank Transfer - ΤΡΑΠΕΖΑ ΠΕΙΡΑΙΩΣ */}
        <div className="w-full max-w-sm mb-6">
          <button
            className="w-full rounded-2xl flex flex-col items-center justify-center text-button"
            style={{
              minHeight: '100px',
              backgroundColor: 'var(--polar)',
              color: 'var(--deep-teal)',
              padding: '16px',
            }}
            onClick={() => {
              navigator.clipboard.writeText('GR9001721020005102086382968');
              alert('IBAN copied!');
            }}
          >
            <span className="text-sm font-semibold">Τραπεζική μεταφορά</span>
            <span className="text-lg font-bold mt-1">ΤΡΑΠΕΖΑ ΠΕΙΡΑΙΩΣ</span>
            <span className="text-xs mt-1" style={{ fontFamily: 'monospace' }}>IBAN GR9001721020005102086382968</span>
            <span className="text-xs mt-1" style={{ opacity: 0.8 }}>NATALIYA GULENKOVA</span>
          </button>
        </div>

        {/* 3. Bank Transfer - EUROBANK */}
        <div className="w-full max-w-sm mb-6">
          <button
            className="w-full rounded-2xl flex flex-col items-center justify-center text-button"
            style={{
              minHeight: '100px',
              backgroundColor: 'var(--polar)',
              color: 'var(--deep-teal)',
              padding: '16px',
            }}
            onClick={() => {
              navigator.clipboard.writeText('GR1602601070000280201824734');
              alert('IBAN copied!');
            }}
          >
            <span className="text-sm font-semibold">Τραπεζική μεταφορά</span>
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

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

  // Check if purchase is available (after 7.1.2026)
  const purchaseAvailableDate = new Date('2026-01-07');
  const isPurchaseAvailable = new Date() >= purchaseAvailableDate;

  // WhatsApp message for cash payment
  const cashWhatsappMessage = encodeURIComponent(
    `${t.cashMessage} ${accountNumber ? `#${accountNumber}` : ''}`
  );
  const cashWhatsappUrl = `https://wa.me/306983208844?text=${cashWhatsappMessage}`;

  // Viber message for cash payment
  const cashViberMessage = encodeURIComponent(
    `${t.cashMessage} ${accountNumber ? `#${accountNumber}` : ''}`
  );
  const cashViberUrl = `viber://chat?number=306983208844&text=${cashViberMessage}`;

  // WhatsApp message for IRIS transfer
  const irisWhatsappMessage = encodeURIComponent(
    `${t.irisMessage} ${accountNumber ? `#${accountNumber}` : ''}`
  );
  const irisWhatsappUrl = `https://wa.me/306983208844?text=${irisWhatsappMessage}`;

  // Viber message for IRIS transfer
  const irisViberMessage = encodeURIComponent(
    `${t.irisMessage} ${accountNumber ? `#${accountNumber}` : ''}`
  );
  const irisViberUrl = `viber://chat?number=306983208844&text=${irisViberMessage}`;

  const handleStripePayment = async () => {
    if (!isPurchaseAvailable) {
      return;
    }

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
      <div className="min-h-screen flex flex-col items-center justify-center px-10 py-20">

        {/* Back Button */}
        <div className="w-full max-w-md mb-6">
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
        <p className="text-lg text-center mb-8 max-w-md" style={{ color: 'var(--polar)', opacity: 0.9 }}>
          {t.subtitle}
        </p>

        {/* Free Month Notice */}
        <p className="text-md text-center mb-12 max-w-md font-semibold" style={{ color: '#ff8f0a' }}>
          {t.firstMonthFree}
        </p>

        {/* Payment Methods */}

        {/* 1. Stripe Online Payment */}
        <div className="w-full max-w-md mb-6">
          <button
            disabled={!isPurchaseAvailable}
            onClick={handleStripePayment}
            className="w-full rounded-2xl flex flex-col items-center justify-center text-button relative"
            style={{
              minHeight: '64px',
              backgroundColor: isPurchaseAvailable ? 'var(--zanah)' : '#cccccc',
              color: isPurchaseAvailable ? 'var(--deep-teal)' : '#666666',
              cursor: isPurchaseAvailable ? 'pointer' : 'not-allowed',
              opacity: isPurchaseAvailable ? 1 : 0.6,
              padding: '16px',
            }}
          >
            {/* Special Price Tag */}
            {isPurchaseAvailable && (
              <span
                className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: '#ff6a1a', color: 'white' }}
              >
                {t.specialPrice}
              </span>
            )}

            <span className="text-lg font-semibold">{t.onlinePayment}</span>
            <span className="text-sm mt-1 font-bold">{t.price}</span>

            {!isPurchaseAvailable && (
              <span className="text-xs mt-2" style={{ opacity: 0.8 }}>
                {t.availableAfter}
              </span>
            )}
          </button>
        </div>

        {/* OR Divider */}
        <div className="flex items-center w-full max-w-md mb-6">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--polar)', opacity: 0.3 }} />
          <span className="px-4 text-sm" style={{ color: 'var(--polar)', opacity: 0.7 }}>
            {messages[locale]?.demoExpired?.or || 'Ή'}
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--polar)', opacity: 0.3 }} />
        </div>

        {/* 2. Cash Payment */}
        <div className="w-full max-w-md mb-6">
          <p className="text-sm text-center mb-3" style={{ color: 'var(--polar)', opacity: 0.9 }}>
            {t.contactForCash}
          </p>
          <div className="flex gap-3">
            {/* WhatsApp */}
            <a
              href={cashWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-2xl flex flex-col items-center justify-center text-button"
              style={{
                minHeight: '52px',
                backgroundColor: '#25D366',
                color: 'white',
                textDecoration: 'none',
              }}
            >
              <span className="text-xl mb-1">📱</span>
              <span className="text-sm">WhatsApp</span>
              <span className="text-xs mt-1">{t.price}</span>
            </a>

            {/* Viber */}
            <a
              href={cashViberUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-2xl flex flex-col items-center justify-center text-button"
              style={{
                minHeight: '52px',
                backgroundColor: '#7360F2',
                color: 'white',
                textDecoration: 'none',
              }}
            >
              <span className="text-xl mb-1">📞</span>
              <span className="text-sm">Viber</span>
              <span className="text-xs mt-1">{t.price}</span>
            </a>
          </div>
        </div>

        {/* OR Divider */}
        <div className="flex items-center w-full max-w-md mb-6">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--polar)', opacity: 0.3 }} />
          <span className="px-4 text-sm" style={{ color: 'var(--polar)', opacity: 0.7 }}>
            {messages[locale]?.demoExpired?.or || 'Ή'}
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--polar)', opacity: 0.3 }} />
        </div>

        {/* 3. IRIS Transfer */}
        <div className="w-full max-w-md mb-6">
          <p className="text-sm text-center mb-3" style={{ color: 'var(--polar)', opacity: 0.9 }}>
            {t.contactForIris}
            {!isPurchaseAvailable && (
              <span className="block text-xs mt-1" style={{ color: '#ff8f0a' }}>
                ({t.availableAfter})
              </span>
            )}
          </p>
          <div className="flex gap-3">
            {/* WhatsApp */}
            <a
              href={irisWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-2xl flex flex-col items-center justify-center text-button"
              style={{
                minHeight: '52px',
                backgroundColor: isPurchaseAvailable ? '#25D366' : '#cccccc',
                color: isPurchaseAvailable ? 'white' : '#666666',
                textDecoration: 'none',
                opacity: isPurchaseAvailable ? 1 : 0.6,
                pointerEvents: isPurchaseAvailable ? 'auto' : 'none',
              }}
            >
              <span className="text-xl mb-1">📱</span>
              <span className="text-sm">WhatsApp</span>
              <span className="text-xs mt-1">{t.price}</span>
            </a>

            {/* Viber */}
            <a
              href={irisViberUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-2xl flex flex-col items-center justify-center text-button"
              style={{
                minHeight: '52px',
                backgroundColor: isPurchaseAvailable ? '#7360F2' : '#cccccc',
                color: isPurchaseAvailable ? 'white' : '#666666',
                textDecoration: 'none',
                opacity: isPurchaseAvailable ? 1 : 0.6,
                pointerEvents: isPurchaseAvailable ? 'auto' : 'none',
              }}
            >
              <span className="text-xl mb-1">📞</span>
              <span className="text-sm">Viber</span>
              <span className="text-xs mt-1">{t.price}</span>
            </a>
          </div>
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

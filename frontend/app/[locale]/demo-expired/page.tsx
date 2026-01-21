"use client";

import { useState, useEffect } from 'react';
import BackgroundPage from '@/components/BackgroundPage';
import { useParams, useRouter } from 'next/navigation';
import { messages, type Locale } from '@/lib/messages';

export default function DemoExpiredPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.demoExpired || messages.el.demoExpired;

  const [accountNumber, setAccountNumber] = useState<number | null>(null);

  useEffect(() => {
    // Load user account number from localStorage (temporary)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setAccountNumber(user.accountNumber || 1010);
    }
  }, []);

  return (
    <BackgroundPage pageIndex={1}>
      <div className="min-h-screen flex flex-col items-center justify-center py-20" style={{ paddingLeft: '40px', paddingRight: '40px' }}>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-4" style={{ color: '#ff6a1a' }}>
          {t.title}
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-center mb-8 max-w-sm" style={{ color: 'var(--polar)' }}>
          {t.subtitle}
        </p>

        {/* Free Month Notice */}
        <p className="text-md text-center mb-12 max-w-sm font-semibold" style={{ color: '#ff8f0a' }}>
          {t.freeMonth}
        </p>

        {/* Buy Online Button */}
        <button
          onClick={() => {
            router.push(`/${locale}/purchase-account`);
          }}
          className="w-full max-w-sm mb-6 rounded-lg flex items-center justify-center text-button"
          style={{
            minHeight: '52px',
            backgroundColor: 'var(--zanah)',
            color: 'var(--deep-teal)',
            cursor: 'pointer',
          }}
        >
          {t.buyOnline}
        </button>

        {/* Account Number */}
        {accountNumber && (
          <p className="text-sm text-center mt-8" style={{ color: 'var(--orange)' }}>
            {t.accountNumber}: #{accountNumber}
          </p>
        )}
      </div>
    </BackgroundPage>
  );
}

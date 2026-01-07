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

  // WhatsApp message
  const whatsappMessage = encodeURIComponent(
    `${t.contactMessage} ${accountNumber ? `#${accountNumber}` : ''}`
  );
  const whatsappUrl = `https://wa.me/306983208844?text=${whatsappMessage}`;

  // Viber message
  const viberMessage = encodeURIComponent(
    `${t.contactMessage} ${accountNumber ? `#${accountNumber}` : ''}`
  );
  const viberUrl = `viber://chat?number=306983208844&text=${viberMessage}`;

  // Check if purchase is available (after 7.1.2026)
  const purchaseAvailableDate = new Date('2026-01-07');
  const isPurchaseAvailable = new Date() >= purchaseAvailableDate;

  return (
    <BackgroundPage pageIndex={1}>
      <div className="min-h-screen flex flex-col items-center justify-center px-10 py-20">

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-4" style={{ color: '#ff6a1a' }}>
          {t.title}
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-center mb-8 max-w-md" style={{ color: 'var(--polar)' }}>
          {t.subtitle}
        </p>

        {/* Free Month Notice */}
        <p className="text-md text-center mb-12 max-w-md font-semibold" style={{ color: '#ff8f0a' }}>
          {t.freeMonth}
        </p>

        {/* Buy Online Button */}
        <button
          onClick={() => {
            router.push(`/${locale}/purchase-account`);
          }}
          className="w-full max-w-md mb-6 rounded-lg flex items-center justify-center text-button"
          style={{
            minHeight: '52px',
            backgroundColor: 'var(--zanah)',
            color: 'var(--deep-teal)',
            cursor: 'pointer',
          }}
        >
          {t.buyOnline}
        </button>

        {/* OR Divider */}
        <div className="flex items-center w-full max-w-md mb-6">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--polar)', opacity: 0.3 }} />
          <span className="px-4 text-sm" style={{ color: 'var(--polar)', opacity: 0.7 }}>
            {t.or}
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--polar)', opacity: 0.3 }} />
        </div>

        {/* Contact Admin Text */}
        <p className="text-sm text-center mb-4 max-w-md" style={{ color: 'var(--polar)', opacity: 0.9 }}>
          {t.contactAdmin}
        </p>

        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-md mb-4 rounded-lg flex items-center justify-center text-button"
          style={{
            minHeight: '52px',
            backgroundColor: '#25D366',
            color: 'white',
            textDecoration: 'none',
          }}
        >
          <span className="mr-2 text-xl">📱</span>
          {t.whatsapp}
        </a>

        {/* Viber Button */}
        <a
          href={viberUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-md rounded-lg flex items-center justify-center text-button"
          style={{
            minHeight: '52px',
            backgroundColor: '#7360F2',
            color: 'white',
            textDecoration: 'none',
          }}
        >
          <span className="mr-2 text-xl">📞</span>
          {t.viber}
        </a>

        {/* Account Number */}
        {accountNumber && (
          <p className="text-sm text-center mt-8" style={{ color: 'var(--polar)', opacity: 0.6 }}>
            {t.accountNumber}: #{accountNumber}
          </p>
        )}
      </div>
    </BackgroundPage>
  );
}

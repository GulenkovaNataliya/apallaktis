"use client";

import { useState, useEffect } from 'react';
import BackgroundPage from '@/components/BackgroundPage';
import { useParams, useRouter } from 'next/navigation';
import { messages, type Locale } from '@/lib/messages';
import { createClient } from '@/lib/supabase/client';

export default function DemoExpiredPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.demoExpired || messages.el.demoExpired;

  const [accountNumber, setAccountNumber] = useState<number | null>(null);

  useEffect(() => {
    const loadAccountNumber = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_number')
          .eq('id', user.id)
          .single();

        if (profile?.account_number) {
          setAccountNumber(profile.account_number);
        }
      }
    };

    loadAccountNumber();
  }, []);

  return (
    <BackgroundPage pageIndex={3}>
      <div
        className="min-h-screen flex flex-col items-center"
        style={{ paddingTop: '180px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}
      >
        <div className="w-full max-w-sm flex flex-col gap-12">
          {/* Warning Icon */}
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--orange)' }}
          >
            <span className="text-4xl">⏰</span>
          </div>

          {/* Title */}
          <h1 className="text-slogan font-bold text-center" style={{ color: 'var(--orange)' }}>
            {t.title}
          </h1>

          {/* Subtitle */}
          <p className="text-heading text-center" style={{ color: 'var(--polar)' }}>
            {t.subtitle}
          </p>

          {/* Free Month Notice */}
          <p className="text-body text-center font-semibold" style={{ color: 'var(--orange)' }}>
            {t.freeMonth}
          </p>

          {/* Buy Online Button */}
          <button
            onClick={() => router.push(`/${locale}/purchase-account`)}
            className="w-full rounded-2xl flex items-center justify-center text-button font-semibold"
            style={{
              minHeight: '52px',
              backgroundColor: 'var(--zanah)',
              color: 'var(--deep-teal)',
              boxShadow: '0 4px 8px var(--deep-teal)',
            }}
          >
            {t.buyOnline}
          </button>

          {/* Account Number */}
          {accountNumber && (
            <p className="text-body text-center" style={{ color: 'var(--orange)' }}>
              {t.accountNumber}: #{accountNumber}
            </p>
          )}
        </div>
      </div>
    </BackgroundPage>
  );
}

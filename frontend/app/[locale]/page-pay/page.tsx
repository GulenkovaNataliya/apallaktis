"use client";

import { useEffect, useState } from 'react';
import BackgroundPage from '@/components/BackgroundPage';
import { useParams, useRouter } from 'next/navigation';
import { messages, type Locale } from '@/lib/messages';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function PagePay() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.pagePay || messages.el.pagePay;
  const [isChecking, setIsChecking] = useState(true);

  // Check subscription status on mount
  useEffect(() => {
    async function checkSubscription() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push(`/${locale}/login`);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, demo_expires_at, account_purchased, created_at')
          .eq('id', user.id)
          .single();

        if (profile) {
          const isReadOnly = profile.subscription_status === 'read-only';
          const isDemoExpired = profile.subscription_status === 'demo' &&
            profile.demo_expires_at &&
            new Date(profile.demo_expires_at) < new Date();

          if (isReadOnly || isDemoExpired) {
            // Check if this is a returning user (previously deleted account)
            const accountCreatedAt = new Date(profile.created_at);
            const demoExpiresAt = new Date(profile.demo_expires_at);
            const hoursSinceCreation = (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60);
            const isReturningUser = hoursSinceCreation < 1 && demoExpiresAt < accountCreatedAt;

            if (isReturningUser) {
              router.push(`/${locale}/account-reactivation`);
            } else {
              router.push(`/${locale}/demo-expired`);
            }
            return;
          }
        }
      } catch (error) {
        console.error('Subscription check error:', error);
      } finally {
        setIsChecking(false);
      }
    }

    checkSubscription();
  }, [locale, router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--deep-teal)' }}>
        <div className="animate-pulse text-xl" style={{ color: 'var(--polar)' }}>...</div>
      </div>
    );
  }

  return (
    <BackgroundPage specialPage="pay">
      <div className="flex min-h-screen flex-col items-center gap-12 pb-20" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px' }}>

        {/* Payment Methods Button */}
        <Link
          href={`/${locale}/payment-methods`}
          className="btn-payment w-full text-button flex items-center justify-center text-center"
          style={{ minHeight: '52px' }}
        >
          {t.paymentMethods}
        </Link>

        {/* Global Expenses Button */}
        <Link
          href={`/${locale}/global-expenses`}
          className="btn-expenses w-full text-button flex items-center justify-center text-center"
          style={{ minHeight: '52px' }}
        >
          {t.globalExpenses}
        </Link>

        {/* Objects Button */}
        <Link
          href={`/${locale}/objects`}
          className="btn-universal w-full text-button flex items-center justify-center text-center"
          style={{ minHeight: '52px', backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)', textTransform: 'uppercase' }}
        >
          {messages[locale]?.objects?.title || 'ΕΡΓΑ'}
        </Link>

        {/* Analysis Button */}
        <Link
          href={`/${locale}/analysis`}
          className="btn-universal w-full text-button flex items-center justify-center text-center gap-2"
          style={{ minHeight: '52px', backgroundColor: 'var(--deep-teal)', color: 'var(--zanah)', boxShadow: '0 4px 8px var(--zanah)' }}
        >
          📊 {t.analysis || 'FINANCIAL ANALYSIS'}
        </Link>

        {/* User Profile / Dashboard Button */}
        <Link
          href={`/${locale}/dashboard`}
          className="btn-universal w-full text-button flex items-center justify-center text-center gap-2"
          style={{ minHeight: '52px', backgroundColor: '#01312d', color: 'var(--orange)' }}
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          {t.userProfile}
        </Link>

      </div>
    </BackgroundPage>
  );
}

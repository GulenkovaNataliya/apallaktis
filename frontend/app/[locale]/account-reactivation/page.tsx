"use client";

import BackgroundPage from '@/components/BackgroundPage';
import { useParams, useRouter } from 'next/navigation';
import { messages, type Locale } from '@/lib/messages';

export default function AccountReactivationPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.accountReactivation || messages.el.accountReactivation;

  return (
    <BackgroundPage pageIndex={3}>
      <div
        className="min-h-screen flex flex-col items-center"
        style={{ paddingTop: '180px', paddingBottom: '120px', paddingLeft: '40px', paddingRight: '40px' }}
      >
        <div className="w-full max-w-sm flex flex-col gap-12">
          {/* Welcome Back Icon */}
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--zanah)' }}
          >
            <span className="text-4xl">👋</span>
          </div>

          {/* Title */}
          <h1 className="text-slogan font-bold text-center" style={{ color: 'var(--polar)' }}>
            {t.title}
          </h1>

          {/* Subtitle */}
          <p className="text-heading text-center" style={{ color: 'var(--zanah)' }}>
            {t.subtitle}
          </p>

          {/* Warning Box */}
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: 'rgba(255, 143, 10, 0.15)', border: '2px solid var(--orange)' }}
          >
            <p className="text-body font-semibold mb-3" style={{ color: 'var(--orange)' }}>
              {t.important}
            </p>
            <ul className="text-body space-y-2" style={{ color: 'var(--polar)' }}>
              <li>• {t.point1}</li>
              <li>• {t.point2}</li>
              <li>• {t.point3}</li>
            </ul>
          </div>

          {/* Explanation */}
          <p className="text-body text-center" style={{ color: 'var(--zanah)', opacity: 0.9 }}>
            {t.explanation}
          </p>

          {/* Free Month Notice */}
          <p className="text-body text-center font-semibold" style={{ color: '#25D366' }}>
            {t.freeMonth}
          </p>

          {/* Buy Account Button */}
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
            {t.buyAccount}
          </button>

          {/* Back to Home */}
          <button
            onClick={() => router.push(`/${locale}`)}
            className="w-full rounded-2xl flex items-center justify-center text-button"
            style={{
              minHeight: '52px',
              backgroundColor: 'transparent',
              color: 'var(--polar)',
              border: '2px solid var(--polar)',
            }}
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    </BackgroundPage>
  );
}

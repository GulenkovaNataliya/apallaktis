"use client";

import BackgroundPage from '@/components/BackgroundPage';
import { useParams } from 'next/navigation';
import { messages, type Locale } from '@/lib/messages';
import Link from 'next/link';

export default function PagePay() {
  const params = useParams();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.pagePay || messages.el.pagePay;

  return (
    <BackgroundPage pageIndex={2}>
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
          style={{ minHeight: '52px', backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)' }}
        >
          {messages[locale]?.objects?.title || 'ΕΡΓΑ'}
        </Link>

      </div>
    </BackgroundPage>
  );
}

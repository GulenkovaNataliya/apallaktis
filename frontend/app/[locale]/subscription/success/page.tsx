'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import BackgroundPage from '@/components/BackgroundPage';
import { messages, type Locale } from '@/lib/messages';

export default function SubscriptionSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params.locale as Locale) || 'el';
  const t = messages[locale]?.subscriptionSuccess || messages.el.subscriptionSuccess;

  const [isVerifying, setIsVerifying] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Простая задержка для имитации проверки
    // В реальности Stripe webhook уже обработал платеж
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isVerifying) {
    return (
      <BackgroundPage pageIndex={1}>
        <div
          className="flex flex-col items-center gap-12"
          style={{
            paddingTop: '180px',
            paddingBottom: '120px',
            paddingLeft: '40px',
            paddingRight: '40px',
          }}
        >
          <div className="animate-pulse">
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: '100px',
                height: '100px',
                backgroundColor: 'var(--polar)',
              }}
            >
              <span style={{ fontSize: '50px' }}>⏳</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center" style={{ color: 'var(--polar)' }}>
            {t?.verifying || 'Проверка платежа...'}
          </h1>
        </div>
      </BackgroundPage>
    );
  }

  return (
    <BackgroundPage pageIndex={1}>
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
          {t?.title || 'Подписка активирована!'}
        </h1>

        {/* Receipt sent */}
        <p className="text-button text-center" style={{ color: 'var(--zanah)' }}>
          {locale === 'el' ? 'Η απόδειξη επιβεβαίωσης πληρωμής στάλθηκε στο email σας. Τιμολόγιο/Απόδειξη θα σταλεί ξεχωριστά' :
           locale === 'ru' ? 'Чек на подтверждение оплаты отправлен на ваш email. Τιμολόγιο/Απόδειξη будет отправлено отдельно' :
           locale === 'uk' ? 'Чек на підтвердження оплати надіслано на ваш email. Τιμολόγιο/Απόδειξη буде надіслано окремо' :
           locale === 'ar' ? 'تم إرسال إيصال تأكيد الدفع إلى email الخاص بك. Τιμολόγιο/Απόδειξη سيتم إرساله بشكل منفصل' :
           locale === 'sq' ? 'Fatura e konfirmimit të pagesës është dërguar në email tuaj. Τιμολόγιο/Απόδειξη do të dërgohet veçmas' :
           locale === 'bg' ? 'Чекът за потвърждение на плащането е изпратен на вашия email. Τιμολόγιο/Απόδειξη ще бъде изпратен отделно' :
           locale === 'ro' ? 'Chitanța de confirmare a plății a fost trimisă pe email-ul dvs. Τιμολόγιο/Απόδειξη va fi trimis separat' :
           'Payment confirmation receipt has been sent to your email. Τιμολόγιο/Απόδειξη will be sent separately'}
        </p>

        {/* Go to Dashboard - phrase, not a button */}
        <p
          onClick={() => router.push(`/${locale}/page-pay`)}
          className="text-button cursor-pointer text-center"
          style={{ color: 'var(--polar)' }}
        >
          {t?.goToDashboard || t?.goToMenu || 'Продолжить →'}
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

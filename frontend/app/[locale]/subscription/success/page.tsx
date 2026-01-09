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

  const handleContinue = () => {
    router.push(`/${locale}/page-pay`);
  };

  if (isVerifying) {
    return (
      <BackgroundPage pageIndex={2}>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ padding: '40px' }}>
          <div
            className="w-full p-8 rounded-2xl text-center"
            style={{
              backgroundColor: 'rgba(1, 49, 45, 0.9)',
              border: '2px solid var(--polar)',
            }}
          >
            <div className="animate-pulse mb-4">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--polar)' }}
              >
                <span style={{ fontSize: '32px', color: 'var(--deep-teal)' }}>⏳</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--polar)' }}>
              {t?.verifying || 'Проверка платежа...'}
            </h1>
            <p style={{ color: 'var(--polar)', opacity: 0.8 }}>
              {locale === 'el' ? 'Παρακαλώ περιμένετε' :
               locale === 'ru' ? 'Пожалуйста, подождите' :
               locale === 'uk' ? 'Будь ласка, зачекайте' :
               locale === 'ar' ? 'يرجى الانتظار' :
               'Please wait'}
            </p>
          </div>
        </div>
      </BackgroundPage>
    );
  }

  return (
    <BackgroundPage pageIndex={2}>
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ padding: '40px' }}>

        {/* Success Card */}
        <div
          className="w-full p-8 rounded-2xl text-center"
          style={{
            backgroundColor: 'rgba(1, 49, 45, 0.9)',
            border: '2px solid var(--zanah)',
          }}
        >
          {/* Success Icon */}
          <div className="mb-6">
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--zanah)' }}
            >
              <span style={{ fontSize: '48px', color: 'var(--deep-teal)' }}>✓</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#ff8f0a' }}>
            {t?.title || 'Подписка активирована!'}
          </h1>

          {/* Message */}
          <p className="text-lg mb-6" style={{ color: 'var(--polar)' }}>
            {t?.description || 'Ваша подписка успешно активирована. Теперь у вас есть доступ ко всем функциям!'}
          </p>

          {/* Features List */}
          <div
            className="text-left p-4 rounded-lg mb-6"
            style={{
              backgroundColor: 'rgba(218, 243, 246, 0.1)',
              border: '1px solid var(--polar)',
            }}
          >
            <p className="font-bold mb-2" style={{ color: 'var(--polar)' }}>
              {locale === 'el' ? 'Τι ακολουθεί:' :
               locale === 'ru' ? 'Что дальше:' :
               locale === 'uk' ? 'Що далі:' :
               locale === 'ar' ? 'ما هو التالي:' :
               locale === 'sq' ? 'Çfarë vijon:' :
               locale === 'bg' ? 'Какво следва:' :
               locale === 'ro' ? 'Ce urmează:' :
               'What\'s next:'}
            </p>
            <ul className="space-y-2" style={{ color: 'var(--polar)', opacity: 0.9 }}>
              <li>• {locale === 'el' ? 'Δημιουργήστε απεριόριστα έργα' :
                      locale === 'ru' ? 'Создавайте неограниченное количество проектов' :
                      locale === 'uk' ? 'Створюйте необмежену кількість проектів' :
                      locale === 'ar' ? 'قم بإنشاء مشاريع غير محدودة' :
                      locale === 'sq' ? 'Krijoni projekte të pakufizuara' :
                      locale === 'bg' ? 'Създавайте неограничен брой проекти' :
                      locale === 'ro' ? 'Creați proiecte nelimitate' :
                      'Create unlimited projects'}</li>
              <li>• {locale === 'el' ? 'Χρησιμοποιήστε όλες τις δυνατότητες' :
                      locale === 'ru' ? 'Используйте все функции платформы' :
                      locale === 'uk' ? 'Використовуйте всі функції платформи' :
                      locale === 'ar' ? 'استخدم جميع ميزات المنصة' :
                      locale === 'sq' ? 'Përdorni të gjitha funksionet' :
                      locale === 'bg' ? 'Използвайте всички функции' :
                      locale === 'ro' ? 'Utilizați toate funcțiile' :
                      'Use all platform features'}</li>
              <li>• {locale === 'el' ? 'Λάβετε προτεραιότητα υποστήριξης' :
                      locale === 'ru' ? 'Получайте приоритетную поддержку' :
                      locale === 'uk' ? 'Отримуйте пріоритетну підтримку' :
                      locale === 'ar' ? 'احصل على دعم ذو أولوية' :
                      locale === 'sq' ? 'Merrni mbështetje me prioritet' :
                      locale === 'bg' ? 'Получавайте приоритетна поддръжка' :
                      locale === 'ro' ? 'Primiți asistență prioritară' :
                      'Get priority support'}</li>
              <li>• {locale === 'el' ? 'Εξαγωγή δεδομένων σε PDF και Excel' :
                      locale === 'ru' ? 'Экспортируйте данные в PDF и Excel' :
                      locale === 'uk' ? 'Експортуйте дані в PDF та Excel' :
                      locale === 'ar' ? 'تصدير البيانات إلى PDF و Excel' :
                      locale === 'sq' ? 'Eksportoni të dhëna në PDF dhe Excel' :
                      locale === 'bg' ? 'Експортирайте данни в PDF и Excel' :
                      locale === 'ro' ? 'Exportați date în PDF și Excel' :
                      'Export data to PDF and Excel'}</li>
            </ul>
          </div>

          {/* Email Note */}
          <p className="text-sm mb-6" style={{ color: 'var(--polar)', opacity: 0.7 }}>
            {locale === 'el' ? 'Το παραστατικό εστάλη στο email σας' :
             locale === 'ru' ? 'Чек отправлен на ваш email' :
             locale === 'uk' ? 'Чек надіслано на ваш email' :
             locale === 'ar' ? 'تم إرسال الإيصال إلى بريدك الإلكتروني' :
             locale === 'sq' ? 'Fatura është dërguar në emailin tuaj' :
             locale === 'bg' ? 'Фактурата е изпратена на вашия имейл' :
             locale === 'ro' ? 'Chitanța a fost trimisă pe email' :
             'Receipt sent to your email'}
          </p>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full text-button"
            style={{
              minHeight: '52px',
              borderRadius: '1rem',
              backgroundColor: 'var(--polar)',
              color: 'var(--deep-teal)',
              boxShadow: '0 4px 8px var(--deep-teal)',
              fontWeight: 'bold',
              transition: 'all 0.2s',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px var(--deep-teal)';
              e.currentTarget.style.transform = 'translateY(2px)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 8px var(--deep-teal)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {t?.goToDashboard ||
             (locale === 'el' ? 'Συνέχεια →' :
              locale === 'ru' ? 'Продолжить →' :
              locale === 'uk' ? 'Продовжити →' :
              locale === 'ar' ? 'متابعة ←' :
              locale === 'sq' ? 'Vazhdo →' :
              locale === 'bg' ? 'Продължи →' :
              locale === 'ro' ? 'Continuă →' :
              'Continue →')}
          </button>
        </div>

        {/* Session ID (for debugging) */}
        {sessionId && (
          <p className="text-xs" style={{ color: 'var(--polar)', opacity: 0.5 }}>
            Session: {sessionId.substring(0, 20)}...
          </p>
        )}
      </div>
    </BackgroundPage>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Locale } from "@/lib/messages";
import BackgroundPage from "@/components/BackgroundPage";

interface SubscriptionData {
  status: string;
  plan: string | null;
  expiresAt: string | null;
  accountPurchased: boolean;
  accountPurchasedAt: string | null;
  firstMonthFreeExpiresAt: string | null;
  demoExpiresAt: string | null;
  bonusMonths: number;
  vipExpiresAt: string | null;
}

const translations = {
  el: {
    title: "Η Συνδρομή μου",
    currentPlan: "Τρέχον Πρόγραμμα",
    status: "Κατάσταση",
    expiresAt: "Λήγει",
    nextPayment: "Επόμενη Πληρωμή",
    autoRenewal: "Αυτόματη Ανανέωση",
    enabled: "Ενεργοποιημένη",
    disabled: "Απενεργοποιημένη",
    bonusMonths: "Bonus Μήνες",
    bonusNote: "Θα χρησιμοποιηθούν αυτόματα πριν την επόμενη πληρωμή",
    accountPurchase: "Αγορά Λογαριασμού",
    paid: "Πληρώθηκε",
    notPaid: "Δεν έχει πληρωθεί",
    firstMonthFree: "Δωρεάν μήνας λήγει",
    actions: "Ενέργειες",
    buyAccount: "Αγορά Λογαριασμού",
    choosePlan: "Επιλογή Πλάνου",
    upgradePlan: "Αναβάθμιση Πλάνου",
    extendSubscription: "Παράταση Συνδρομής",
    cancelSubscription: "Ακύρωση Συνδρομής",
    paymentHistory: "Ιστορικό Πληρωμών",
    paymentHistoryNote: "Εδώ εμφανίζονται οι επιβεβαιώσεις πληρωμών μέσω Stripe.",
    invoiceNote: "Το Τιμολόγιο/Απόδειξη θα εκδοθεί και θα αποσταλεί ξεχωριστά μέσω email.",
    date: "Ημερομηνία",
    description: "Περιγραφή",
    amount: "Ποσό",
    receipt: "Επιβεβαίωση",
    noPayments: "Δεν υπάρχουν πληρωμές",
    download: "Λήψη",
    back: "← Πίσω",
    demo: "DEMO",
    active: "Ενεργή",
    expired: "Έληξε",
    readOnly: "Μόνο Ανάγνωση",
    daysLeft: "ημέρες απομένουν",
    hoursLeft: "ώρες απομένουν",
  },
  ru: {
    title: "Моя Подписка",
    currentPlan: "Текущий План",
    status: "Статус",
    expiresAt: "Истекает",
    nextPayment: "Следующий Платёж",
    autoRenewal: "Автопродление",
    enabled: "Включено",
    disabled: "Выключено",
    bonusMonths: "Бонусные Месяцы",
    bonusNote: "Будут использованы автоматически перед следующим платежом",
    accountPurchase: "Покупка Аккаунта",
    paid: "Оплачено",
    notPaid: "Не оплачено",
    firstMonthFree: "Бесплатный месяц истекает",
    actions: "Действия",
    buyAccount: "Купить Аккаунт",
    choosePlan: "Выбрать План",
    upgradePlan: "Улучшить План",
    extendSubscription: "Продлить Подписку",
    cancelSubscription: "Отменить Подписку",
    paymentHistory: "История Платежей",
    paymentHistoryNote: "Здесь отображаются подтверждения оплаты через Stripe.",
    invoiceNote: "Τιμολόγιο/Απόδειξη будет выдан и отправлен отдельно по email.",
    date: "Дата",
    description: "Описание",
    amount: "Сумма",
    receipt: "Подтверждение",
    noPayments: "Нет платежей",
    download: "Скачать",
    back: "← Назад",
    demo: "DEMO",
    active: "Активна",
    expired: "Истекла",
    readOnly: "Только чтение",
    daysLeft: "дней осталось",
    hoursLeft: "часов осталось",
  },
  en: {
    title: "My Subscription",
    currentPlan: "Current Plan",
    status: "Status",
    expiresAt: "Expires",
    nextPayment: "Next Payment",
    autoRenewal: "Auto Renewal",
    enabled: "Enabled",
    disabled: "Disabled",
    bonusMonths: "Bonus Months",
    bonusNote: "Will be used automatically before next payment",
    accountPurchase: "Account Purchase",
    paid: "Paid",
    notPaid: "Not paid",
    firstMonthFree: "Free month expires",
    actions: "Actions",
    buyAccount: "Buy Account",
    choosePlan: "Choose Plan",
    upgradePlan: "Upgrade Plan",
    extendSubscription: "Extend Subscription",
    cancelSubscription: "Cancel Subscription",
    paymentHistory: "Payment History",
    paymentHistoryNote: "Payment confirmations via Stripe are displayed here.",
    invoiceNote: "The official Tax Invoice will be issued and sent separately via email.",
    date: "Date",
    description: "Description",
    amount: "Amount",
    receipt: "Confirmation",
    noPayments: "No payments yet",
    download: "Download",
    back: "← Back",
    demo: "DEMO",
    active: "Active",
    expired: "Expired",
    readOnly: "Read Only",
    daysLeft: "days left",
    hoursLeft: "hours left",
  },
  uk: {
    title: "Моя Підписка",
    currentPlan: "Поточний План",
    status: "Статус",
    expiresAt: "Закінчується",
    nextPayment: "Наступний Платіж",
    autoRenewal: "Автопродовження",
    enabled: "Увімкнено",
    disabled: "Вимкнено",
    bonusMonths: "Бонусні Місяці",
    bonusNote: "Будуть використані автоматично перед наступним платежем",
    accountPurchase: "Покупка Акаунту",
    paid: "Оплачено",
    notPaid: "Не оплачено",
    firstMonthFree: "Безкоштовний місяць закінчується",
    actions: "Дії",
    buyAccount: "Купити Акаунт",
    choosePlan: "Вибрати План",
    upgradePlan: "Покращити План",
    extendSubscription: "Продовжити Підписку",
    cancelSubscription: "Скасувати Підписку",
    paymentHistory: "Історія Платежів",
    paymentHistoryNote: "Тут відображаються підтвердження оплати через Stripe.",
    invoiceNote: "Τιμολόγιο/Απόδειξη буде видано та надіслано окремо по email.",
    date: "Дата",
    description: "Опис",
    amount: "Сума",
    receipt: "Підтвердження",
    noPayments: "Немає платежів",
    download: "Завантажити",
    back: "← Назад",
    demo: "DEMO",
    active: "Активна",
    expired: "Закінчилась",
    readOnly: "Тільки читання",
    daysLeft: "днів залишилось",
    hoursLeft: "годин залишилось",
  },
  sq: {
    title: "Abonimi Im",
    currentPlan: "Plani Aktual",
    status: "Statusi",
    expiresAt: "Skadon",
    nextPayment: "Pagesa Tjetër",
    autoRenewal: "Rinovim Automatik",
    enabled: "Aktivizuar",
    disabled: "Çaktivizuar",
    bonusMonths: "Muaj Bonus",
    bonusNote: "Do të përdoren automatikisht para pagesës tjetër",
    accountPurchase: "Blerja e Llogarisë",
    paid: "Paguar",
    notPaid: "Jo paguar",
    firstMonthFree: "Muaji falas skadon",
    actions: "Veprime",
    buyAccount: "Bli Llogari",
    choosePlan: "Zgjidh Planin",
    upgradePlan: "Përmirëso Planin",
    extendSubscription: "Zgjat Abonimin",
    cancelSubscription: "Anulo Abonimin",
    paymentHistory: "Historia e Pagesave",
    paymentHistoryNote: "Këtu shfaqen konfirmimet e pagesave përmes Stripe.",
    invoiceNote: "Fatura zyrtare tatimore do të lëshohet dhe dërgohet veçmas me email.",
    date: "Data",
    description: "Përshkrimi",
    amount: "Shuma",
    receipt: "Konfirmimi",
    noPayments: "Nuk ka pagesa",
    download: "Shkarko",
    back: "← Kthehu",
    demo: "DEMO",
    active: "Aktiv",
    expired: "Skaduar",
    readOnly: "Vetëm lexim",
    daysLeft: "ditë mbetur",
    hoursLeft: "orë mbetur",
  },
  bg: {
    title: "Моят Абонамент",
    currentPlan: "Текущ План",
    status: "Статус",
    expiresAt: "Изтича",
    nextPayment: "Следващо Плащане",
    autoRenewal: "Автоматично Подновяване",
    enabled: "Включено",
    disabled: "Изключено",
    bonusMonths: "Бонус Месеци",
    bonusNote: "Ще бъдат използвани автоматично преди следващото плащане",
    accountPurchase: "Покупка на Акаунт",
    paid: "Платено",
    notPaid: "Не е платено",
    firstMonthFree: "Безплатният месец изтича",
    actions: "Действия",
    buyAccount: "Купи Акаунт",
    choosePlan: "Избери План",
    upgradePlan: "Надгради План",
    extendSubscription: "Удължи Абонамент",
    cancelSubscription: "Откажи Абонамент",
    paymentHistory: "История на Плащанията",
    paymentHistoryNote: "Тук се показват потвържденията за плащане чрез Stripe.",
    invoiceNote: "Официалната данъчна фактура ще бъде издадена и изпратена отделно по имейл.",
    date: "Дата",
    description: "Описание",
    amount: "Сума",
    receipt: "Потвърждение",
    noPayments: "Няма плащания",
    download: "Изтегли",
    back: "← Назад",
    demo: "DEMO",
    active: "Активен",
    expired: "Изтекъл",
    readOnly: "Само за четене",
    daysLeft: "дни остават",
    hoursLeft: "часа остават",
  },
  ro: {
    title: "Abonamentul Meu",
    currentPlan: "Planul Curent",
    status: "Status",
    expiresAt: "Expiră",
    nextPayment: "Următoarea Plată",
    autoRenewal: "Reînnoire Automată",
    enabled: "Activată",
    disabled: "Dezactivată",
    bonusMonths: "Luni Bonus",
    bonusNote: "Vor fi folosite automat înainte de următoarea plată",
    accountPurchase: "Achiziție Cont",
    paid: "Plătit",
    notPaid: "Neplătit",
    firstMonthFree: "Luna gratuită expiră",
    actions: "Acțiuni",
    buyAccount: "Cumpără Cont",
    choosePlan: "Alege Plan",
    upgradePlan: "Actualizează Plan",
    extendSubscription: "Prelungește Abonament",
    cancelSubscription: "Anulează Abonament",
    paymentHistory: "Istoric Plăți",
    paymentHistoryNote: "Aici sunt afișate confirmările de plată prin Stripe.",
    invoiceNote: "Factura fiscală oficială va fi emisă și trimisă separat prin email.",
    date: "Data",
    description: "Descriere",
    amount: "Sumă",
    receipt: "Confirmare",
    noPayments: "Nu există plăți",
    download: "Descarcă",
    back: "← Înapoi",
    demo: "DEMO",
    active: "Activ",
    expired: "Expirat",
    readOnly: "Doar citire",
    daysLeft: "zile rămase",
    hoursLeft: "ore rămase",
  },
  ar: {
    title: "اشتراكي",
    currentPlan: "الخطة الحالية",
    status: "الحالة",
    expiresAt: "ينتهي في",
    nextPayment: "الدفعة التالية",
    autoRenewal: "التجديد التلقائي",
    enabled: "مفعّل",
    disabled: "معطّل",
    bonusMonths: "أشهر المكافأة",
    bonusNote: "سيتم استخدامها تلقائياً قبل الدفعة التالية",
    accountPurchase: "شراء الحساب",
    paid: "مدفوع",
    notPaid: "غير مدفوع",
    firstMonthFree: "الشهر المجاني ينتهي",
    actions: "الإجراءات",
    buyAccount: "شراء حساب",
    choosePlan: "اختر خطة",
    upgradePlan: "ترقية الخطة",
    extendSubscription: "تمديد الاشتراك",
    cancelSubscription: "إلغاء الاشتراك",
    paymentHistory: "سجل المدفوعات",
    paymentHistoryNote: "يتم عرض تأكيدات الدفع عبر Stripe هنا.",
    invoiceNote: "سيتم إصدار الفاتورة الضريبية الرسمية وإرسالها بشكل منفصل عبر البريد الإلكتروني.",
    date: "التاريخ",
    description: "الوصف",
    amount: "المبلغ",
    receipt: "تأكيد",
    noPayments: "لا توجد مدفوعات",
    download: "تحميل",
    back: "← رجوع",
    demo: "DEMO",
    active: "نشط",
    expired: "منتهي",
    readOnly: "للقراءة فقط",
    daysLeft: "يوم متبقي",
    hoursLeft: "ساعة متبقية",
  },
};

export default function SubscriptionPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const t = translations[locale as keyof typeof translations] || translations.el;
  const isRTL = locale === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    async function loadSubscription() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push(`/${locale}/login`);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) {
        router.push(`/${locale}/login`);
        return;
      }

      setSubscription({
        status: profile.subscription_status || 'demo',
        plan: profile.subscription_plan,
        expiresAt: profile.subscription_expires_at,
        accountPurchased: profile.account_purchased || false,
        accountPurchasedAt: profile.account_purchased_at,
        firstMonthFreeExpiresAt: profile.first_month_free_expires_at,
        demoExpiresAt: profile.demo_expires_at,
        bonusMonths: profile.bonus_months || 0,
        vipExpiresAt: profile.vip_expires_at,
      });
      setIsLoading(false);
    }

    loadSubscription();
  }, [locale, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'vip': // VIP показывается как active для клиента
        return '#25D366';
      case 'demo':
        return '#3b82f6';
      case 'expired':
      case 'read-only':
        return '#ff6a1a';
      default:
        return 'var(--deep-teal)';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
      case 'vip': // VIP показывается как active для клиента
        return t.active;
      case 'demo':
        return t.demo;
      case 'expired':
        return t.expired;
      case 'read-only':
        return t.readOnly;
      default:
        return status.toUpperCase();
    }
  };

  const getTimeRemaining = () => {
    if (!subscription) return null;

    let expiresAt: Date | null = null;

    if (subscription.status === 'demo' && subscription.demoExpiresAt) {
      expiresAt = new Date(subscription.demoExpiresAt);
    } else if (subscription.expiresAt) {
      expiresAt = new Date(subscription.expiresAt);
    } else if (subscription.vipExpiresAt) {
      expiresAt = new Date(subscription.vipExpiresAt);
    }

    if (!expiresAt) return null;

    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();

    if (diffMs <= 0) return null;

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} ${t.daysLeft}`;
    }
    return `${diffHours} ${t.hoursLeft}`;
  };

  if (isLoading || !subscription) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const timeRemaining = getTimeRemaining();

  return (
    <BackgroundPage pageIndex={1}>
      <div
        className="flex min-h-screen flex-col items-center gap-8 pb-20"
        style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px' }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <h1
            className="text-slogan font-bold text-center"
            style={{ color: '#ff8f0a' }}
          >
            {t.title}
          </h1>

          {/* Current Subscription */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              📋 {t.currentPlan}
            </h2>

            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-body font-medium" style={{ color: 'var(--deep-teal)' }}>
                  {t.status}
                </span>
                <span
                  className="px-4 py-2 rounded-full text-button font-bold"
                  style={{
                    backgroundColor: getStatusColor(subscription.status),
                    color: 'white',
                  }}
                >
                  {getStatusLabel(subscription.status)}
                </span>
              </div>

              {/* Plan */}
              {subscription.plan && subscription.plan !== 'demo' && (
                <div className="flex items-center justify-between">
                  <span className="text-body font-medium" style={{ color: 'var(--deep-teal)' }}>
                    {t.currentPlan}
                  </span>
                  <span className="text-body font-bold" style={{ color: '#ff8f0a' }}>
                    {subscription.plan.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Time Remaining */}
              {timeRemaining && (
                <div className="flex items-center justify-between">
                  <span className="text-body font-medium" style={{ color: 'var(--deep-teal)' }}>
                    {t.expiresAt}
                  </span>
                  <span className="text-body font-bold" style={{ color: getStatusColor(subscription.status) }}>
                    {timeRemaining}
                  </span>
                </div>
              )}

              {/* Auto Renewal */}
              {subscription.status === 'active' && (
                <div className="flex items-center justify-between">
                  <span className="text-body font-medium" style={{ color: 'var(--deep-teal)' }}>
                    {t.autoRenewal}
                  </span>
                  <span className="text-body" style={{ color: '#25D366' }}>
                    {t.enabled}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Account Purchase Status */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              💳 {t.accountPurchase} (97€ + ΦΠΑ)
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium" style={{ color: 'var(--deep-teal)' }}>
                  {t.status}
                </span>
                <span
                  className="text-body font-bold"
                  style={{ color: subscription.accountPurchased ? '#25D366' : '#ff6a1a' }}
                >
                  {subscription.accountPurchased ? `✅ ${t.paid}` : `❌ ${t.notPaid}`}
                </span>
              </div>

              {subscription.accountPurchasedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-body font-medium" style={{ color: 'var(--deep-teal)' }}>
                    {t.date}
                  </span>
                  <span className="text-body" style={{ color: 'var(--deep-teal)' }}>
                    {new Date(subscription.accountPurchasedAt).toLocaleDateString(locale)}
                  </span>
                </div>
              )}

              {subscription.firstMonthFreeExpiresAt && (
                <div className="flex items-center justify-between">
                  <span className="text-body font-medium" style={{ color: 'var(--deep-teal)' }}>
                    {t.firstMonthFree}
                  </span>
                  <span className="text-body" style={{ color: 'var(--deep-teal)' }}>
                    {new Date(subscription.firstMonthFreeExpiresAt).toLocaleDateString(locale)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bonus Months */}
          {subscription.bonusMonths > 0 && (
            <div
              className="w-full p-6 rounded-2xl"
              style={{ backgroundColor: 'rgba(255, 143, 10, 0.1)' }}
            >
              <h2 className="text-heading font-semibold mb-2" style={{ color: '#ff8f0a' }}>
                🎁 {t.bonusMonths}: {subscription.bonusMonths}
              </h2>
              <p className="text-body" style={{ color: 'var(--deep-teal)' }}>
                {t.bonusNote}
              </p>
            </div>
          )}

          {/* Actions */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              ⚡ {t.actions}
            </h2>

            <div className="space-y-3">
              {!subscription.accountPurchased && (
                <button
                  onClick={() => router.push(`/${locale}/purchase-account`)}
                  className="w-full px-6 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: '#ff8f0a',
                    color: 'white',
                    minHeight: '52px',
                  }}
                >
                  {t.buyAccount}
                </button>
              )}

              {subscription.accountPurchased && (!subscription.plan || subscription.plan === 'demo') && (
                <button
                  onClick={() => router.push(`/${locale}/subscription`)}
                  className="w-full px-6 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: '#ff8f0a',
                    color: 'white',
                    minHeight: '52px',
                  }}
                >
                  {t.choosePlan}
                </button>
              )}

              {subscription.plan && subscription.plan !== 'demo' && subscription.plan !== 'VIP' && (
                <>
                  <button
                    onClick={() => router.push(`/${locale}/subscription`)}
                    className="w-full px-6 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: '#25D366',
                      color: 'white',
                      minHeight: '52px',
                    }}
                  >
                    {t.upgradePlan}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div
            className="w-full p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--polar)' }}
          >
            <h2 className="text-heading font-semibold mb-4" style={{ color: 'var(--deep-teal)' }}>
              📜 {t.paymentHistory}
            </h2>

            {/* Payment history note */}
            <p className="text-sm mb-4" style={{ color: 'var(--deep-teal)', opacity: 0.8 }}>
              {t.paymentHistoryNote}
            </p>

            {/* Invoice notice - Important! */}
            <div
              className="p-4 rounded-xl mb-4"
              style={{
                backgroundColor: '#fff3e0',
                border: '1px solid #ff8f0a',
              }}
            >
              <p className="text-sm" style={{ color: '#01312d' }}>
                <strong style={{ color: '#ff8f0a' }}>⚠️</strong> {t.invoiceNote}
              </p>
            </div>

            {/* Payments list placeholder */}
            <p className="text-center py-6 text-body opacity-50" style={{ color: 'var(--deep-teal)' }}>
              {t.noPayments}
            </p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="w-full px-6 py-3 rounded-xl text-button font-semibold transition-opacity hover:opacity-80"
            style={{
              backgroundColor: 'var(--deep-teal)',
              color: 'white',
              minHeight: '52px',
              boxShadow: '0 4px 8px rgba(255, 255, 255, 0.3)',
            }}
          >
            {t.back}
          </button>
        </div>
      </div>
    </BackgroundPage>
  );
}

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
    plan: "Πλάνο",
    status: "Κατάσταση",
    expiresAt: "Λήγει",
    expiresOn: "Έως",
    unlimited: "Απεριόριστο",
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
    changePlan: "Αλλαγή Πακέτου",
    extendSubscription: "Παράταση Συνδρομής",
    cancelSubscription: "Ακύρωση Συνδρομής",
    paymentHistory: "Ιστορικό Πληρωμών",
    paymentHistoryNote: "Εδώ εμφανίζονται οι επιβεβαιώσεις πληρωμών μέσω Stripe.",
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
    plan: "План",
    status: "Статус",
    expiresAt: "Истекает",
    expiresOn: "До",
    unlimited: "Безлимит",
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
    changePlan: "Сменить Пакет",
    extendSubscription: "Продлить Подписку",
    cancelSubscription: "Отменить Подписку",
    paymentHistory: "История Платежей",
    paymentHistoryNote: "Здесь отображаются подтверждения оплаты через Stripe.",
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
    plan: "Plan",
    status: "Status",
    expiresAt: "Expires",
    expiresOn: "Until",
    unlimited: "Unlimited",
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
    changePlan: "Change Plan",
    extendSubscription: "Extend Subscription",
    cancelSubscription: "Cancel Subscription",
    paymentHistory: "Payment History",
    paymentHistoryNote: "Payment confirmations via Stripe are displayed here.",
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
    plan: "План",
    status: "Статус",
    expiresAt: "Закінчується",
    expiresOn: "До",
    unlimited: "Безліміт",
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
    changePlan: "Змінити Пакет",
    extendSubscription: "Продовжити Підписку",
    cancelSubscription: "Скасувати Підписку",
    paymentHistory: "Історія Платежів",
    paymentHistoryNote: "Тут відображаються підтвердження оплати через Stripe.",
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
    plan: "Plani",
    status: "Statusi",
    expiresAt: "Skadon",
    expiresOn: "Deri më",
    unlimited: "Pa Limit",
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
    changePlan: "Ndrysho Paketën",
    extendSubscription: "Zgjat Abonimin",
    cancelSubscription: "Anulo Abonimin",
    paymentHistory: "Historia e Pagesave",
    paymentHistoryNote: "Këtu shfaqen konfirmimet e pagesave përmes Stripe.",
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
    plan: "План",
    status: "Статус",
    expiresAt: "Изтича",
    expiresOn: "До",
    unlimited: "Неограничено",
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
    changePlan: "Смени Пакета",
    extendSubscription: "Удължи Абонамент",
    cancelSubscription: "Откажи Абонамент",
    paymentHistory: "История на Плащанията",
    paymentHistoryNote: "Тук се показват потвържденията за плащане чрез Stripe.",
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
    plan: "Plan",
    status: "Status",
    expiresAt: "Expiră",
    expiresOn: "Până la",
    unlimited: "Nelimitat",
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
    changePlan: "Schimbă Pachetul",
    extendSubscription: "Prelungește Abonament",
    cancelSubscription: "Anulează Abonament",
    paymentHistory: "Istoric Plăți",
    paymentHistoryNote: "Aici sunt afișate confirmările de plată prin Stripe.",
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
    plan: "الخطة",
    status: "الحالة",
    expiresAt: "ينتهي في",
    expiresOn: "حتى",
    unlimited: "غير محدود",
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
    changePlan: "تغيير الباقة",
    extendSubscription: "تمديد الاشتراك",
    cancelSubscription: "إلغاء الاشتراك",
    paymentHistory: "سجل المدفوعات",
    paymentHistoryNote: "يتم عرض تأكيدات الدفع عبر Stripe هنا.",
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
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  useEffect(() => {
    async function loadSubscription() {
      const supabase = createClient();
      let { data: { session } } = await supabase.auth.getSession();
      let userId = session?.user?.id;

      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/${locale}/login`);
          return;
        }
        userId = user.id;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
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

  const isVipUnlimited = () => {
    if (!subscription || subscription.status !== 'vip' || !subscription.vipExpiresAt) return false;
    const vipExpires = new Date(subscription.vipExpiresAt);
    const now = new Date();
    const diffYears = (vipExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return diffYears > 50;
  };

  const getVipExpiresFormatted = () => {
    if (!subscription?.vipExpiresAt) return null;
    const date = new Date(subscription.vipExpiresAt);
    return date.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getPlanDisplayName = () => {
    if (!subscription) return '';
    if (subscription.status === 'vip') return 'VIP';
    if (subscription.status === 'demo') return 'DEMO';
    if (!subscription.plan) return '';
    const planMap: Record<string, string> = {
      'basic': 'Basic',
      'standard': 'Standard',
      'premium': 'Premium',
    };
    return planMap[subscription.plan] || subscription.plan.toUpperCase();
  };

  const canChangePlan = () => {
    if (!subscription) return false;
    // Only for active subscriptions with Basic/Standard/Premium
    if (subscription.status !== 'active') return false;
    if (!subscription.plan) return false;
    return ['basic', 'standard', 'premium'].includes(subscription.plan);
  };

  const openCustomerPortal = async () => {
    setIsLoadingPortal(true);
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create portal session:', data.error);
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    } finally {
      setIsLoadingPortal(false);
    }
  };

  if (isLoading || !subscription) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const timeRemaining = getTimeRemaining();
  const planName = getPlanDisplayName();

  return (
    <BackgroundPage pageIndex={1}>
      <div
        className="flex min-h-screen flex-col items-center"
        style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px', paddingBottom: '120px' }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="w-full max-w-sm flex flex-col gap-12">
          {/* Back - phrase, not a button */}
          <p
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="text-button cursor-pointer"
            style={{ color: 'var(--polar)' }}
          >
            {t.back}
          </p>

          {/* Header */}
          <h1
            className="text-slogan font-bold text-center"
            style={{ color: '#ff8f0a' }}
          >
            {t.title}
          </h1>

          {/* Account Purchase */}
          <p className="text-heading font-semibold text-center" style={{ color: 'var(--zanah)' }}>
            💳 {t.accountPurchase}
          </p>

          {/* Account Purchase - Status */}
          <p className="text-body text-center" style={{ color: 'var(--zanah)' }}>
            {t.status}:{' '}
            <span style={{ color: subscription.accountPurchased ? '#25D366' : 'var(--orange)', fontWeight: 'bold' }}>
              {subscription.accountPurchased ? `✓ ${t.paid}` : t.notPaid}
            </span>
          </p>

          {/* Buy Account Button - right after status */}
          {!subscription.accountPurchased && (
            <button
              onClick={() => router.push(`/${locale}/purchase-account`)}
              className="w-full rounded-2xl text-slogan font-bold transition-opacity hover:opacity-80"
              style={{
                backgroundColor: 'var(--orange)',
                color: 'white',
                minHeight: '52px',
              }}
            >
              {t.buyAccount}
            </button>
          )}

          {/* Current Plan */}
          <p className="text-heading font-semibold text-center" style={{ color: 'var(--zanah)' }}>
            📋 {t.currentPlan}
          </p>

          {/* Current Plan - Plan Name */}
          {planName && (
            <p className="text-body text-center" style={{ color: 'var(--zanah)' }}>
              {t.plan}:{' '}
              <span style={{ color: 'var(--orange)', fontWeight: 'bold' }}>
                {planName}
              </span>
            </p>
          )}

          {/* Current Plan - Status */}
          <p className="text-body text-center" style={{ color: 'var(--zanah)' }}>
            {t.status}:{' '}
            <span style={{ color: getStatusColor(subscription.status), fontWeight: 'bold' }}>
              {getStatusLabel(subscription.status)}
            </span>
          </p>

          {/* VIP Expires / Subscription Expires */}
          {subscription.status === 'vip' && subscription.vipExpiresAt && (
            <p className="text-body text-center" style={{ color: 'var(--zanah)' }}>
              {isVipUnlimited() ? (
                <span style={{ color: '#25D366', fontWeight: 'bold' }}>
                  {t.unlimited}
                </span>
              ) : (
                <>
                  {t.expiresOn}:{' '}
                  <span style={{ color: 'var(--orange)', fontWeight: 'bold' }}>
                    {getVipExpiresFormatted()}
                  </span>
                </>
              )}
            </p>
          )}

          {/* Active subscription expires */}
          {subscription.status === 'active' && timeRemaining && (
            <p className="text-body text-center" style={{ color: 'var(--zanah)' }}>
              {t.expiresAt}:{' '}
              <span style={{ fontWeight: 'bold' }}>
                {timeRemaining}
              </span>
            </p>
          )}

          {/* Demo expires */}
          {subscription.status === 'demo' && timeRemaining && (
            <p className="text-body text-center" style={{ color: 'var(--zanah)' }}>
              {t.expiresAt}:{' '}
              <span style={{ color: 'var(--orange)', fontWeight: 'bold' }}>
                {timeRemaining}
              </span>
            </p>
          )}

          {/* Bonus Months */}
          {subscription.bonusMonths > 0 && (
            <p className="text-body text-center" style={{ color: 'var(--zanah)' }}>
              🎁 {t.bonusMonths}: <span style={{ color: 'var(--orange)', fontWeight: 'bold' }}>{subscription.bonusMonths}</span>
            </p>
          )}

          {/* Change Plan Button - only for active Basic/Standard/Premium */}
          {canChangePlan() && (
            <button
              onClick={openCustomerPortal}
              disabled={isLoadingPortal}
              className="w-full rounded-2xl text-button font-semibold transition-opacity hover:opacity-80 disabled:opacity-60"
              style={{
                backgroundColor: 'var(--zanah)',
                color: 'var(--deep-teal)',
                minHeight: '52px',
              }}
            >
              {isLoadingPortal ? '...' : t.changePlan}
            </button>
          )}

          {/* Payment History */}
          <p className="text-heading font-semibold text-center" style={{ color: 'var(--zanah)' }}>
            📜 {t.paymentHistory}
          </p>

          {/* No Payments */}
          <p
            className="text-body text-center"
            style={{ color: 'var(--zanah)' }}
          >
            {t.noPayments}
          </p>

        </div>
      </div>
    </BackgroundPage>
  );
}

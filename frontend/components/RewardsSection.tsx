'use client';

import { User } from '@/types/user';
import { Locale } from '@/lib/messages';

interface RewardsSectionProps {
  user: User;
  locale: Locale;
}

const translations = {
  el: {
    title: '💎 Βραβεία και Μπόνους',
    vipStatus: {
      title: '👑 VIP ΚΑΤΑΣΤΑΣΗ ΕΝΕΡΓΟΠΟΙΗΜΕΝΗ',
      unlimitedProjects: 'Απεριόριστα έργα',
      unlimitedTeam: 'Απεριόριστη ομάδα',
      allFeatures: 'Όλες οι δυνατότητες',
      activeUntil: 'Ενεργό μέχρι:',
      forever: 'Για πάντα',
    },
    referral: {
      title: '🎁 ΠΡΟΓΡΑΜΜΑ ΠΑΡΑΠΟΜΠΗΣ',
      description: 'Προσκαλέστε φίλους και κερδίστε μπόνους!',
      yourLink: 'Ο σύνδεσμός σας:',
      copy: 'Αντιγραφή',
      share: 'Κοινοποίηση',
      stats: '📊 Στατιστικά:',
      friendsInvited: 'Προσκλήσεις φίλων:',
      activeSubscriptions: 'Ενεργές συνδρομές:',
      bonusMonths: 'Μήνες δωρεάν:',
      howItWorks: '💰 Πώς λειτουργεί:',
      step1: 'Φίλος εγγραφείτε μέσω του συνδέσμου σας',
      step2: 'Φίλος αγοράζει συνδρομή',
      step3: 'ΕΣΕΙΣ παίρνετε +1 μήνα δωρεάν',
      step4: 'ΦΙΛΟΣ παίρνει έκπτωση 10% στον 1ο μήνα',
    },
    bonuses: {
      title: '🌟 ΜΗΝΕΣ ΔΩΡΕΑΝ:',
      description: 'Έχετε {count} δωρεάν μήνες!',
      autoUse: 'Χρησιμοποιούνται αυτόματα πριν από τη χρέωση όταν ανανεώνετε τη συνδρομή σας',
      history: 'Ιστορικό μπόνους:',
      referralFrom: 'Παραπομπή: {name}',
    },
    support: {
      title: '📞 ΧΡΕΙΑΖΕΣΤΕ ΒΟΗΘΕΙΑ;',
      responseTime: 'Χρόνος απόκρισης:',
      basic: 'Basic: μέχρι 48 ώρες',
      standard: 'Standard: μέχρι 24 ώρες',
      premium: 'Premium: μέχρι 12 ώρες',
      vip: 'VIP: μέχρι 4 ώρες',
    },
  },
  ru: {
    title: '💎 Награды и Бонусы',
    vipStatus: {
      title: '👑 VIP СТАТУС АКТИВИРОВАН',
      unlimitedProjects: 'Безлимитные проекты',
      unlimitedTeam: 'Безлимитная команда',
      allFeatures: 'Все функции',
      activeUntil: 'Активен до:',
      forever: 'Навсегда',
    },
    referral: {
      title: '🎁 РЕФЕРАЛЬНАЯ ПРОГРАММА',
      description: 'Пригласите друга и получите бонусы!',
      yourLink: 'Ваша реферальная ссылка:',
      copy: 'Копировать',
      share: 'Поделиться',
      stats: '📊 Ваша статистика:',
      friendsInvited: 'Приглашено друзей:',
      activeSubscriptions: 'Активных подписок:',
      bonusMonths: 'Бонусных месяцев:',
      howItWorks: '💰 Как это работает:',
      step1: 'Друг регистрируется по вашей ссылке',
      step2: 'Друг покупает подписку',
      step3: 'ВЫ получаете +1 бонусный месяц',
      step4: 'ДРУГ получает скидку 10% на 1-й месяц',
    },
    bonuses: {
      title: '🌟 БОНУСНЫЕ МЕСЯЦЫ:',
      description: 'У вас есть {count} бесплатных месяцев!',
      autoUse: 'Они автоматически используются перед списанием средств при продлении подписки',
      history: 'История бонусов:',
      referralFrom: 'Реферал: {name}',
    },
    support: {
      title: '📞 НУЖНА ПОМОЩЬ?',
      responseTime: 'Время ответа:',
      basic: 'Basic: до 48 часов',
      standard: 'Standard: до 24 часов',
      premium: 'Premium: до 12 часов',
      vip: 'VIP: до 4 часов',
    },
  },
  uk: {
    title: '💎 Нагороди та Бонуси',
    vipStatus: {
      title: '👑 VIP СТАТУС АКТИВОВАНО',
      unlimitedProjects: 'Безлімітні проекти',
      unlimitedTeam: 'Безлімітна команда',
      allFeatures: 'Всі функції',
      activeUntil: 'Активний до:',
      forever: 'Назавжди',
    },
    referral: {
      title: '🎁 РЕФЕРАЛЬНА ПРОГРАМА',
      description: 'Запросіть друга і отримайте бонуси!',
      yourLink: 'Ваше реферальне посилання:',
      copy: 'Копіювати',
      share: 'Поділитися',
      stats: '📊 Ваша статистика:',
      friendsInvited: 'Запрошено друзів:',
      activeSubscriptions: 'Активних підписок:',
      bonusMonths: 'Бонусних місяців:',
      howItWorks: '💰 Як це працює:',
      step1: 'Друг реєструється за вашим посиланням',
      step2: 'Друг купує підписку',
      step3: 'ВИ отримуєте +1 бонусний місяць',
      step4: 'ДРУГ отримує знижку 10% на 1-й місяць',
    },
    bonuses: {
      title: '🌟 БОНУСНІ МІСЯЦІ:',
      description: 'У вас є {count} безкоштовних місяців!',
      autoUse: 'Вони автоматично використовуються перед списанням коштів при продовженні підписки',
      history: 'Історія бонусів:',
      referralFrom: 'Реферал: {name}',
    },
    support: {
      title: '📞 ПОТРІБНА ДОПОМОГА?',
      responseTime: 'Час відповіді:',
      basic: 'Basic: до 48 годин',
      standard: 'Standard: до 24 годин',
      premium: 'Premium: до 12 годин',
      vip: 'VIP: до 4 годин',
    },
  },
  sq: {
    title: '💎 Shpërblimet dhe Bonuset',
    vipStatus: {
      title: '👑 STATUSI VIP AKTIVIZUAR',
      unlimitedProjects: 'Projekte të pakufizuara',
      unlimitedTeam: 'Ekip i pakufizuar',
      allFeatures: 'Të gjitha funksionet',
      activeUntil: 'Aktiv deri më:',
      forever: 'Përgjithmonë',
    },
    referral: {
      title: '🎁 PROGRAMI I REFERIMIT',
      description: 'Ftoni një mik dhe fitoni bonuse!',
      yourLink: 'Lidhja juaj e referimit:',
      copy: 'Kopjo',
      share: 'Shpërnda',
      stats: '📊 Statistikat tuaja:',
      friendsInvited: 'Miqtë e ftuar:',
      activeSubscriptions: 'Abonimet aktive:',
      bonusMonths: 'Muajt bonus:',
      howItWorks: '💰 Si funksionon:',
      step1: 'Miku regjistrohet përmes lidhjes suaj',
      step2: 'Miku blen abonimin',
      step3: 'JU merrni +1 muaj bonus',
      step4: 'MIKU merr zbritje 10% në muajin e 1-rë',
    },
    bonuses: {
      title: '🌟 MUAJT BONUS:',
      description: 'Keni {count} muaj falas!',
      autoUse: 'Ato përdoren automatikisht para tarifimit kur rinovoni abonimin tuaj',
      history: 'Historia e bonuseve:',
      referralFrom: 'Referim: {name}',
    },
    support: {
      title: '📞 KENI NEVOJË PËR NDIHMË?',
      responseTime: 'Koha e përgjigjes:',
      basic: 'Basic: deri në 48 orë',
      standard: 'Standard: deri në 24 orë',
      premium: 'Premium: deri në 12 orë',
      vip: 'VIP: deri në 4 orë',
    },
  },
  bg: {
    title: '💎 Награди и Бонуси',
    vipStatus: {
      title: '👑 VIP СТАТУС АКТИВИРАН',
      unlimitedProjects: 'Неограничени проекти',
      unlimitedTeam: 'Неограничен екип',
      allFeatures: 'Всички функции',
      activeUntil: 'Активен до:',
      forever: 'Завинаги',
    },
    referral: {
      title: '🎁 РЕФЕРАЛНА ПРОГРАМА',
      description: 'Поканете приятел и спечелете бонуси!',
      yourLink: 'Вашата реферална връзка:',
      copy: 'Копирай',
      share: 'Сподели',
      stats: '📊 Вашата статистика:',
      friendsInvited: 'Поканени приятели:',
      activeSubscriptions: 'Активни абонаменти:',
      bonusMonths: 'Бонус месеци:',
      howItWorks: '💰 Как работи:',
      step1: 'Приятел се регистрира чрез вашата връзка',
      step2: 'Приятел купува абонамент',
      step3: 'ВИЕ получавате +1 бонус месец',
      step4: 'ПРИЯТЕЛ получава 10% отстъпка за 1-ви месец',
    },
    bonuses: {
      title: '🌟 БОНУС МЕСЕЦИ:',
      description: 'Имате {count} безплатни месеца!',
      autoUse: 'Те се използват автоматично преди таксуване при подновяване на абонамента ви',
      history: 'История на бонусите:',
      referralFrom: 'Реферал: {name}',
    },
    support: {
      title: '📞 НУЖДАЕТЕ СЕ ОТ ПОМОЩ?',
      responseTime: 'Време за отговор:',
      basic: 'Basic: до 48 часа',
      standard: 'Standard: до 24 часа',
      premium: 'Premium: до 12 часа',
      vip: 'VIP: до 4 часа',
    },
  },
  ro: {
    title: '💎 Recompense și Bonusuri',
    vipStatus: {
      title: '👑 STATUT VIP ACTIVAT',
      unlimitedProjects: 'Proiecte nelimitate',
      unlimitedTeam: 'Echipă nelimitată',
      allFeatures: 'Toate funcțiile',
      activeUntil: 'Activ până la:',
      forever: 'Pentru totdeauna',
    },
    referral: {
      title: '🎁 PROGRAM DE RECOMANDARE',
      description: 'Invită un prieten și câștigă bonusuri!',
      yourLink: 'Linkul tău de recomandare:',
      copy: 'Copiază',
      share: 'Distribuie',
      stats: '📊 Statisticile tale:',
      friendsInvited: 'Prieteni invitați:',
      activeSubscriptions: 'Abonamente active:',
      bonusMonths: 'Luni bonus:',
      howItWorks: '💰 Cum funcționează:',
      step1: 'Prietenul se înregistrează prin linkul tău',
      step2: 'Prietenul cumpără abonament',
      step3: 'TU primești +1 lună bonus',
      step4: 'PRIETENUL primește reducere 10% pentru luna 1',
    },
    bonuses: {
      title: '🌟 LUNI BONUS:',
      description: 'Ai {count} luni gratuite!',
      autoUse: 'Sunt folosite automat înainte de taxare la reînnoirea abonamentului',
      history: 'Istoric bonusuri:',
      referralFrom: 'Recomandare: {name}',
    },
    support: {
      title: '📞 AI NEVOIE DE AJUTOR?',
      responseTime: 'Timp de răspuns:',
      basic: 'Basic: până la 48 ore',
      standard: 'Standard: până la 24 ore',
      premium: 'Premium: până la 12 ore',
      vip: 'VIP: până la 4 ore',
    },
  },
  en: {
    title: '💎 Rewards and Bonuses',
    vipStatus: {
      title: '👑 VIP STATUS ACTIVATED',
      unlimitedProjects: 'Unlimited projects',
      unlimitedTeam: 'Unlimited team',
      allFeatures: 'All features',
      activeUntil: 'Active until:',
      forever: 'Forever',
    },
    referral: {
      title: '🎁 REFERRAL PROGRAM',
      description: 'Invite a friend and earn bonuses!',
      yourLink: 'Your referral link:',
      copy: 'Copy',
      share: 'Share',
      stats: '📊 Your stats:',
      friendsInvited: 'Friends invited:',
      activeSubscriptions: 'Active subscriptions:',
      bonusMonths: 'Bonus months:',
      howItWorks: '💰 How it works:',
      step1: 'Friend registers via your link',
      step2: 'Friend purchases subscription',
      step3: 'YOU get +1 bonus month',
      step4: 'FRIEND gets 10% discount on 1st month',
    },
    bonuses: {
      title: '🌟 BONUS MONTHS:',
      description: 'You have {count} free months!',
      autoUse: 'They are automatically used before charging when renewing your subscription',
      history: 'Bonus history:',
      referralFrom: 'Referral: {name}',
    },
    support: {
      title: '📞 NEED HELP?',
      responseTime: 'Response time:',
      basic: 'Basic: up to 48 hours',
      standard: 'Standard: up to 24 hours',
      premium: 'Premium: up to 12 hours',
      vip: 'VIP: up to 4 hours',
    },
  },
  ar: {
    title: '💎 المكافآت والمكافآت',
    vipStatus: {
      title: '👑 تم تفعيل حالة VIP',
      unlimitedProjects: 'مشاريع غير محدودة',
      unlimitedTeam: 'فريق غير محدود',
      allFeatures: 'جميع الميزات',
      activeUntil: 'نشط حتى:',
      forever: 'إلى الأبد',
    },
    referral: {
      title: '🎁 برنامج الإحالة',
      description: 'ادع صديقًا واحصل على مكافآت!',
      yourLink: 'رابط الإحالة الخاص بك:',
      copy: 'نسخ',
      share: 'مشاركة',
      stats: '📊 إحصائياتك:',
      friendsInvited: 'الأصدقاء المدعوون:',
      activeSubscriptions: 'الاشتراكات النشطة:',
      bonusMonths: 'أشهر المكافأة:',
      howItWorks: '💰 كيف يعمل:',
      step1: 'يسجل الصديق عبر الرابط الخاص بك',
      step2: 'يشتري الصديق اشتراكًا',
      step3: 'أنت تحصل على +1 شهر مكافأة',
      step4: 'الصديق يحصل على خصم 10٪ على الشهر الأول',
    },
    bonuses: {
      title: '🌟 أشهر المكافأة:',
      description: 'لديك {count} أشهر مجانية!',
      autoUse: 'يتم استخدامها تلقائيًا قبل الشحن عند تجديد اشتراكك',
      history: 'تاريخ المكافآت:',
      referralFrom: 'إحالة: {name}',
    },
    support: {
      title: '📞 هل تحتاج إلى مساعدة؟',
      responseTime: 'وقت الاستجابة:',
      basic: 'Basic: حتى 48 ساعة',
      standard: 'Standard: حتى 24 ساعة',
      premium: 'Premium: حتى 12 ساعة',
      vip: 'VIP: حتى 4 ساعات',
    },
  },
};

export default function RewardsSection({ user, locale }: RewardsSectionProps) {
  const t = translations[locale] || translations.el;

  // Check if user has VIP status
  const hasVIP = user.subscriptionStatus === 'vip' || user.vipExpiresAt !== null;

  // Format referral link
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/${locale}/register?ref=${user.referralCode}`
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert(t.referral.copy);
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'APALLAKTIS',
        text: t.referral.description,
        url: referralLink,
      });
    } else {
      copyToClipboard();
    }
  };

  // Get response time based on plan
  const getResponseTime = () => {
    if (hasVIP) return t.support.vip;
    if (user.subscriptionPlan === 'premium') return t.support.premium;
    if (user.subscriptionPlan === 'standard') return t.support.standard;
    return t.support.basic;
  };

  return (
    <div className="w-full space-y-6">
      {/* Section Title */}
      <h2
        className="text-heading font-bold text-center"
        style={{ color: 'var(--deep-teal)' }}
      >
        {t.title}
      </h2>

      {/* VIP Status (only if active) */}
      {hasVIP && (
        <div
          className="w-full p-6 rounded-2xl"
          style={{
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            border: '3px solid #FFD700',
          }}
        >
          <h3 className="text-subheading font-bold mb-4" style={{ color: '#FFD700' }}>
            {t.vipStatus.title}
          </h3>
          <ul className="space-y-2 text-body mb-4" style={{ color: 'var(--deep-teal)' }}>
            <li>• {t.vipStatus.unlimitedProjects}</li>
            <li>• {t.vipStatus.unlimitedTeam}</li>
            <li>• {t.vipStatus.allFeatures}</li>
          </ul>
          <p className="text-sm font-bold" style={{ color: 'var(--deep-teal)' }}>
            {t.vipStatus.activeUntil} {user.vipExpiresAt ? new Date(user.vipExpiresAt).toLocaleDateString() : t.vipStatus.forever}
          </p>
        </div>
      )}

      {/* Referral Program */}
      <div
        className="w-full p-6 rounded-2xl"
        style={{
          backgroundColor: 'rgba(176, 255, 209, 0.2)',
          border: '3px solid var(--zanah)',
        }}
      >
        <h3 className="text-subheading font-bold mb-3" style={{ color: 'var(--deep-teal)' }}>
          {t.referral.title}
        </h3>
        <p className="text-small mb-4" style={{ color: 'var(--deep-teal)' }}>
          {t.referral.description}
        </p>

        {/* Referral Link */}
        <div className="mb-4">
          <p className="text-small font-bold mb-2" style={{ color: 'var(--deep-teal)' }}>
            {t.referral.yourLink}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 text-small rounded-2xl px-4 py-2 border-2"
              style={{ borderColor: 'var(--zanah)', color: 'var(--deep-teal)' }}
            />
            <button
              onClick={copyToClipboard}
              className="btn-base text-small"
              style={{
                backgroundColor: 'var(--zanah)',
                color: 'var(--deep-teal)',
                minHeight: '40px',
                paddingLeft: '1rem',
                paddingRight: '1rem',
              }}
            >
              {t.referral.copy}
            </button>
            <button
              onClick={shareLink}
              className="btn-base text-small"
              style={{
                backgroundColor: 'var(--deep-teal)',
                color: 'var(--polar)',
                minHeight: '40px',
                paddingLeft: '1rem',
                paddingRight: '1rem',
              }}
            >
              {t.referral.share}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4">
          <p className="text-small font-bold mb-2" style={{ color: 'var(--deep-teal)' }}>
            {t.referral.stats}
          </p>
          <div className="space-y-1 text-small" style={{ color: 'var(--deep-teal)' }}>
            <p>• {t.referral.friendsInvited} 0</p>
            <p>• {t.referral.activeSubscriptions} 0</p>
            <p>• {t.referral.bonusMonths} {user.bonusMonths}</p>
          </div>
        </div>

        {/* How it works */}
        <div>
          <p className="text-small font-bold mb-2" style={{ color: 'var(--deep-teal)' }}>
            {t.referral.howItWorks}
          </p>
          <div className="space-y-1 text-small" style={{ color: 'var(--deep-teal)' }}>
            <p>• {t.referral.step1}</p>
            <p>• {t.referral.step2}</p>
            <p>• {t.referral.step3}</p>
            <p>• {t.referral.step4}</p>
          </div>
        </div>
      </div>

      {/* Bonus Months (only if user has bonuses) */}
      {user.bonusMonths > 0 && (
        <div
          className="w-full p-6 rounded-2xl"
          style={{
            backgroundColor: 'rgba(255, 143, 10, 0.1)',
            border: '3px solid #ff8f0a',
          }}
        >
          <h3 className="text-subheading font-bold mb-3" style={{ color: '#ff8f0a' }}>
            {t.bonuses.title} {user.bonusMonths}
          </h3>
          <p className="text-small mb-3" style={{ color: 'var(--deep-teal)' }}>
            {t.bonuses.description.replace('{count}', user.bonusMonths.toString())}
          </p>
          <p className="text-small" style={{ color: 'var(--deep-teal)', opacity: 0.8 }}>
            {t.bonuses.autoUse}
          </p>
        </div>
      )}

      {/* Support Section */}
      <div
        className="w-full p-6 rounded-2xl"
        style={{
          backgroundColor: 'rgba(1, 49, 45, 0.05)',
          border: '2px solid var(--deep-teal)',
        }}
      >
        <h3 className="text-subheading font-bold mb-4" style={{ color: 'var(--deep-teal)' }}>
          {t.support.title}
        </h3>
        <div className="flex gap-3 mb-4">
          <a
            href="viber://chat?number=%2B306912345678"
            className="flex-1 btn-base text-button flex items-center justify-center"
            style={{
              backgroundColor: '#7360f2',
              color: 'white',
            }}
          >
            💬 Viber
          </a>
          <a
            href="https://wa.me/306912345678"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn-base text-button flex items-center justify-center"
            style={{
              backgroundColor: '#25D366',
              color: 'white',
            }}
          >
            📱 WhatsApp
          </a>
        </div>
        <p className="text-small text-center" style={{ color: 'var(--deep-teal)', opacity: 0.8 }}>
          {t.support.responseTime} <strong>{getResponseTime()}</strong>
        </p>
      </div>
    </div>
  );
}

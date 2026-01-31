// Email Notifications System
// ==========================
// Все типы уведомлений для пользователей

import { sendEmail } from './send';

/**
 * 1. Уведомление: DEMO истекает через 2 дня
 */
export async function sendDemoExpiringEmail(
  userEmail: string,
  accountNumber: number,
  expiresAt: Date,
  locale: string = 'el'
): Promise<boolean> {
  const subjects = {
    el: '⏰ Το DEMO σας λήγει σε 2 ημέρες - ΑΠΑΛΛΑΚΤΗΣ',
    ru: '⏰ Ваше DEMO истекает через 2 дня - ΑΠΑΛΛΑΚΤΗΣ',
    en: '⏰ Your DEMO expires in 2 days - ΑΠΑΛΛΑΚΤΗΣ',
    uk: '⏰ Ваше DEMO закінчується через 2 дні - ΑΠΑΛΛΑΚΤΗΣ',
    sq: '⏰ DEMO juaj skadon në 2 ditë - ΑΠΑΛΛΑΚΤΗΣ',
    bg: '⏰ Вашето DEMO изтича след 2 дни - ΑΠΑΛΛΑΚΤΗΣ',
    ro: '⏰ DEMO-ul dvs. expiră în 2 zile - ΑΠΑΛΛΑΚΤΗΣ',
    ar: '⏰ تنتهي صلاحية DEMO الخاص بك خلال يومين - ΑΠΑΛΛΑΚΤΗΣ',
  };

  const html = generateDemoExpiringHTML(accountNumber, expiresAt, locale);

  return sendEmail({
    to: userEmail,
    subject: subjects[locale as keyof typeof subjects] || subjects.el,
    html,
  });
}

/**
 * 2. Уведомление: DEMO истекло
 */
export async function sendDemoExpiredEmail(
  userEmail: string,
  accountNumber: number,
  locale: string = 'el'
): Promise<boolean> {
  const subjects = {
    el: '❌ Το DEMO σας έληξε - Αγοράστε λογαριασμό τώρα!',
    ru: '❌ Ваше DEMO истекло - Купите аккаунт сейчас!',
    en: '❌ Your DEMO has expired - Purchase account now!',
    uk: '❌ Ваше DEMO закінчилося - Купіть акаунт зараз!',
    sq: '❌ DEMO juaj ka skaduar - Blini llogarinë tani!',
    bg: '❌ Вашето DEMO изтече - Купете акаунт сега!',
    ro: '❌ DEMO-ul dvs. a expirat - Cumpărați cont acum!',
    ar: '❌ انتهت صلاحية DEMO الخاص بك - اشتر حساباً الآن!',
  };

  const html = generateDemoExpiredHTML(accountNumber, locale);

  return sendEmail({
    to: userEmail,
    subject: subjects[locale as keyof typeof subjects] || subjects.el,
    html,
  });
}

/**
 * 3. Уведомление: Подписка истекает через 2 дня
 */
export async function sendSubscriptionExpiringEmail(
  userEmail: string,
  accountNumber: number,
  subscriptionPlan: string,
  expiresAt: Date,
  locale: string = 'el'
): Promise<boolean> {
  const subjects = {
    el: '⏰ Η συνδρομή σας λήγει σε 2 ημέρες',
    ru: '⏰ Ваша подписка истекает через 2 дня',
    en: '⏰ Your subscription expires in 2 days',
    uk: '⏰ Ваша підписка закінчується через 2 дні',
    sq: '⏰ Abonimi juaj skadon në 2 ditë',
    bg: '⏰ Вашият абонамент изтича след 2 дни',
    ro: '⏰ Abonamentul dvs. expiră în 2 zile',
    ar: '⏰ تنتهي صلاحية اشتراكك خلال يومين',
  };

  const html = generateSubscriptionExpiringHTML(accountNumber, subscriptionPlan, expiresAt, locale);

  return sendEmail({
    to: userEmail,
    subject: subjects[locale as keyof typeof subjects] || subjects.el,
    html,
  });
}

/**
 * 4. Уведомление: Подписка истекла
 */
export async function sendSubscriptionExpiredEmail(
  userEmail: string,
  accountNumber: number,
  locale: string = 'el'
): Promise<boolean> {
  const subjects = {
    el: '❌ Η συνδρομή σας έληξε - Ανανεώστε τώρα!',
    ru: '❌ Ваша подписка истекла - Продлите сейчас!',
    en: '❌ Your subscription has expired - Renew now!',
    uk: '❌ Ваша підписка закінчилася - Поновіть зараз!',
    sq: '❌ Abonimi juaj ka skaduar - Rinovoni tani!',
    bg: '❌ Вашият абонамент изтече - Подновете сега!',
    ro: '❌ Abonamentul dvs. a expirat - Reînnoiți acum!',
    ar: '❌ انتهت صلاحية اشتراكك - جدد الآن!',
  };

  const html = generateSubscriptionExpiredHTML(accountNumber, locale);

  return sendEmail({
    to: userEmail,
    subject: subjects[locale as keyof typeof subjects] || subjects.el,
    html,
  });
}

/**
 * 5. Уведомление: Платёж отклонён
 */
export async function sendPaymentFailedEmail(
  userEmail: string,
  accountNumber: number,
  amount: number,
  locale: string = 'el'
): Promise<boolean> {
  const subjects = {
    el: '❌ Η πληρωμή σας απορρίφθηκε - Ενημερώστε τη μέθοδο πληρωμής',
    ru: '❌ Ваш платёж отклонён - Обновите способ оплаты',
    en: '❌ Your payment was declined - Update payment method',
    uk: '❌ Ваш платіж відхилено - Оновіть спосіб оплати',
    sq: '❌ Pagesa juaj u refuzua - Përditësoni metodën e pagesës',
    bg: '❌ Вашето плащане беше отказано - Актуализирайте метода на плащане',
    ro: '❌ Plata dvs. a fost refuzată - Actualizați metoda de plată',
    ar: '❌ تم رفض دفعتك - قم بتحديث طريقة الدفع',
  };

  const html = generatePaymentFailedHTML(accountNumber, amount, locale);

  return sendEmail({
    to: userEmail,
    subject: subjects[locale as keyof typeof subjects] || subjects.el,
    html,
  });
}

/**
 * 6. Уведомление: VIP активирована
 */
export async function sendVIPActivatedEmail(
  userEmail: string,
  accountNumber: number,
  vipExpiresAt: Date | null,
  reason?: string,
  locale: string = 'el'
): Promise<boolean> {
  const subjects = {
    el: '⭐ Συγχαρητήρια! Έχετε VIP συνδρομή!',
    ru: '⭐ Поздравляем! У вас VIP подписка!',
    en: '⭐ Congratulations! You have VIP subscription!',
    uk: '⭐ Вітаємо! У вас VIP підписка!',
    sq: '⭐ Urime! Keni abonim VIP!',
    bg: '⭐ Поздравления! Имате VIP абонамент!',
    ro: '⭐ Felicitări! Aveți abonament VIP!',
    ar: '⭐ تهانينا! لديك اشتراك VIP!',
  };

  const html = generateVIPActivatedHTML(accountNumber, vipExpiresAt, reason, locale);

  return sendEmail({
    to: userEmail,
    subject: subjects[locale as keyof typeof subjects] || subjects.el,
    html,
  });
}

/**
 * 6.5. Уведомление: VIP отозван
 */
export async function sendVIPCancelledEmail(
  userEmail: string,
  userName: string,
  locale: string = 'el'
): Promise<boolean> {
  const subjects = {
    el: 'Η VIP συνδρομή σας ακυρώθηκε - ΑΠΑΛΛΑΚΤΗΣ',
    ru: 'Ваша VIP подписка отменена - ΑΠΑΛΛΑΚΤΗΣ',
    en: 'Your VIP subscription has been cancelled - ΑΠΑΛΛΑΚΤΗΣ',
    uk: 'Вашу VIP підписку скасовано - ΑΠΑΛΛΑΚΤΗΣ',
    sq: 'Abonimi juaj VIP është anuluar - ΑΠΑΛΛΑΚΤΗΣ',
    bg: 'Вашият VIP абонамент беше отменен - ΑΠΑΛΛΑΚΤΗΣ',
    ro: 'Abonamentul dvs. VIP a fost anulat - ΑΠΑΛΛΑΚΤΗΣ',
    ar: 'تم إلغاء اشتراكك VIP - ΑΠΑΛΛΑΚΤΗΣ',
  };

  const html = generateVIPCancelledHTML(userName, locale);

  return sendEmail({
    to: userEmail,
    subject: subjects[locale as keyof typeof subjects] || subjects.el,
    html,
  });
}

/**
 * 7. Уведомление: Новый реферал зарегистрировался
 */
export async function sendNewReferralEmail(
  userEmail: string,
  referralName: string,
  referralEmail: string,
  locale: string = 'el'
): Promise<boolean> {
  const subjects = {
    el: '🎉 New referral signed up via your link!',
    ru: '🎉 New referral signed up via your link!',
    en: '🎉 New referral signed up via your link!',
    uk: '🎉 New referral signed up via your link!',
    sq: '🎉 New referral signed up via your link!',
    bg: '🎉 New referral signed up via your link!',
    ro: '🎉 New referral signed up via your link!',
    ar: '🎉 New referral signed up via your link!',
  };

  const html = generateNewReferralHTML(referralName, referralEmail, locale);

  return sendEmail({
    to: userEmail,
    subject: subjects[locale as keyof typeof subjects] || subjects.el,
    html,
  });
}

/**
 * 8. Уведомление: Реферал купил аккаунт (+1 bonus month)
 */
export async function sendReferralPurchaseEmail(
  userEmail: string,
  referralName: string,
  bonusMonthsTotal: number,
  locale: string = 'el'
): Promise<boolean> {
  const subjects = {
    el: '🎁 You earned +1 month FREE! Your referral purchased an account!',
    ru: '🎁 You earned +1 month FREE! Your referral purchased an account!',
    en: '🎁 You earned +1 month FREE! Your referral purchased an account!',
    uk: '🎁 You earned +1 month FREE! Your referral purchased an account!',
    sq: '🎁 You earned +1 month FREE! Your referral purchased an account!',
    bg: '🎁 You earned +1 month FREE! Your referral purchased an account!',
    ro: '🎁 You earned +1 month FREE! Your referral purchased an account!',
    ar: '🎁 You earned +1 month FREE! Your referral purchased an account!',
  };

  const html = generateReferralPurchaseHTML(referralName, bonusMonthsTotal, locale);

  return sendEmail({
    to: userEmail,
    subject: subjects[locale as keyof typeof subjects] || subjects.el,
    html,
  });
}

/**
 * 9. Уведомление: Подписка на Basic/Standard/Premium активирована
 */
export async function sendSubscriptionActivatedEmail(
  userEmail: string,
  accountNumber: number,
  subscriptionPlan: string,
  expiresAt: Date,
  locale: string = 'el'
): Promise<boolean> {
  const subjects = {
    el: `✅ Η συνδρομή ${subscriptionPlan} σας ενεργοποιήθηκε!`,
    ru: `✅ Ваша подписка ${subscriptionPlan} активирована!`,
    en: `✅ Your ${subscriptionPlan} subscription is activated!`,
    uk: `✅ Ваша підписка ${subscriptionPlan} активована!`,
    sq: `✅ Abonimi juaj ${subscriptionPlan} është aktivizuar!`,
    bg: `✅ Вашият абонамент ${subscriptionPlan} е активиран!`,
    ro: `✅ Abonamentul dvs. ${subscriptionPlan} este activat!`,
    ar: `✅ تم تفعيل اشتراكك ${subscriptionPlan}!`,
  };

  const html = generateSubscriptionActivatedHTML(accountNumber, subscriptionPlan, expiresAt, locale);

  return sendEmail({
    to: userEmail,
    subject: subjects[locale as keyof typeof subjects] || subjects.el,
    html,
  });
}

// ============================================
// HTML Generators
// ============================================

function generateDemoExpiringHTML(accountNumber: number, expiresAt: Date, locale: string): string {
  const texts = {
    el: {
      title: 'Το DEMO σας λήγει σύντομα',
      message: `Το DEMO περίοδο για το λογαριασμό <strong>#${accountNumber}</strong> λήγει στις <strong>${expiresAt.toLocaleDateString('el-GR')}</strong>.`,
      info: 'Αγοράστε τώρα λογαριασμό για να συνεχίσετε να χρησιμοποιείτε όλες τις λειτουργίες!',
      button: 'Αγορά Λογαριασμού (62€ με ΦΠΑ)',
    },
    ru: {
      title: 'Ваше DEMO скоро истекает',
      message: `DEMO период для аккаунта <strong>#${accountNumber}</strong> истекает <strong>${expiresAt.toLocaleDateString('ru-RU')}</strong>.`,
      info: 'Купите аккаунт сейчас, чтобы продолжить использовать все функции!',
      button: 'Купить аккаунт (62€ με ΦΠΑ)',
    },
    en: {
      title: 'Your DEMO is expiring soon',
      message: `DEMO period for account <strong>#${accountNumber}</strong> expires on <strong>${expiresAt.toLocaleDateString('en-US')}</strong>.`,
      info: 'Purchase an account now to continue using all features!',
      button: 'Purchase Account (62€ με ΦΠΑ)',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.el;

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background: linear-gradient(135deg, #ff8f0a 0%, #ff6b00 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">⏰ ${t.title}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <p style="font-size: 18px; color: #333; margin-bottom: 20px;">${t.message}</p>
        <div style="background-color: #fff3e0; border-left: 4px solid #ff8f0a; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #ff8f0a; font-size: 16px;">${t.info}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://apallaktis.com/${locale}/page-pay" style="display: inline-block; background-color: #ff8f0a; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            ${t.button}
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 12px; color: #999; margin: 0;">© 2026 ΑΠΑΛΛΑΚΤΗΣ</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateDemoExpiredHTML(accountNumber: number, locale: string): string {
  const texts = {
    el: {
      title: 'Το DEMO σας έληξε',
      message: `Η δοκιμαστική περίοδος για το λογαριασμό <strong>#${accountNumber}</strong> έχει λήξει.`,
      info: 'Ο λογαριασμός σας είναι τώρα σε λειτουργία μόνο για ανάγνωση. Αγοράστε λογαριασμό για να συνεχίσετε!',
      button: 'Αγορά Λογαριασμού',
    },
    ru: {
      title: 'Ваше DEMO истекло',
      message: `Пробный период для аккаунта <strong>#${accountNumber}</strong> истёк.`,
      info: 'Ваш аккаунт теперь в режиме только для чтения. Купите аккаунт, чтобы продолжить!',
      button: 'Купить аккаунт',
    },
    en: {
      title: 'Your DEMO has expired',
      message: `Trial period for account <strong>#${accountNumber}</strong> has expired.`,
      info: 'Your account is now in read-only mode. Purchase an account to continue!',
      button: 'Purchase Account',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.el;

  return `
<!DOCTYPE html>
<html lang="${locale}">
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">❌ ${t.title}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <p style="font-size: 18px; color: #333; margin-bottom: 20px;">${t.message}</p>
        <div style="background-color: #fee; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #dc2626; font-size: 16px;">${t.info}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://apallaktis.com/${locale}/page-pay" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            ${t.button}
          </a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateSubscriptionExpiringHTML(accountNumber: number, plan: string, expiresAt: Date, locale: string): string {
  const texts: Record<string, {
    title: string;
    message: string;
    daysLeft: string;
    benefits: string[];
    buttonText: string;
    footer: string;
  }> = {
    en: {
      title: 'Subscription Expiring Soon',
      message: 'Your subscription will expire soon. Renew now to keep access to all features.',
      daysLeft: 'Expiring soon',
      benefits: [
        'Unlimited access to all features',
        'Priority support',
        'Cloud sync across devices',
        'No ads'
      ],
      buttonText: 'Renew Subscription',
      footer: 'If you have any questions, contact our support team.'
    },
    ru: {
      title: 'Подписка скоро истекает',
      message: 'Ваша подписка скоро истечёт. Продлите сейчас, чтобы сохранить доступ ко всем функциям.',
      daysLeft: 'Скоро истекает',
      benefits: [
        'Неограниченный доступ ко всем функциям',
        'Приоритетная поддержка',
        'Синхронизация между устройствами',
        'Без рекламы'
      ],
      buttonText: 'Продлить подписку',
      footer: 'Если у вас есть вопросы, свяжитесь с нашей службой поддержки.'
    },
    el: {
      title: 'Η συνδρομή λήγει σύντομα',
      message: 'Η συνδρομή σας θα λήξει σύντομα. Ανανεώστε τώρα για να διατηρήσετε πρόσβαση.',
      daysLeft: 'Λήγει σύντομα',
      benefits: [
        'Απεριόριστη πρόσβαση σε όλες τις λειτουργίες',
        'Προτεραιότητα υποστήριξης',
        'Συγχρονισμός μεταξύ συσκευών',
        'Χωρίς διαφημίσεις'
      ],
      buttonText: 'Ανανέωση συνδρομής',
      footer: 'Για ερωτήσεις, επικοινωνήστε με την υποστήριξη.'
    },
    uk: {
      title: 'Підписка скоро закінчується',
      message: 'Ваша підписка скоро закінчиться. Поновіть зараз, щоб зберегти доступ.',
      daysLeft: 'Скоро закінчується',
      benefits: [
        'Необмежений доступ до всіх функцій',
        'Пріоритетна підтримка',
        'Синхронізація між пристроями',
        'Без реклами'
      ],
      buttonText: 'Поновити підписку',
      footer: 'Якщо у вас є питання, зверніться до служби підтримки.'
    },
    sq: {
      title: 'Abonimi skadon së shpejti',
      message: 'Abonimi juaj do të skadojë së shpejti. Rinovoni tani për të ruajtur aksesin.',
      daysLeft: 'Skadon së shpejti',
      benefits: [
        'Akses i pakufizuar në të gjitha veçoritë',
        'Mbështetje me prioritet',
        'Sinkronizim mes pajisjeve',
        'Pa reklama'
      ],
      buttonText: 'Rinovoni abonimin',
      footer: 'Për pyetje, kontaktoni ekipin tonë të mbështetjes.'
    },
    bg: {
      title: 'Абонаментът изтича скоро',
      message: 'Вашият абонамент ще изтече скоро. Подновете сега, за да запазите достъпа.',
      daysLeft: 'Изтича скоро',
      benefits: [
        'Неограничен достъп до всички функции',
        'Приоритетна поддръжка',
        'Синхронизация между устройства',
        'Без реклами'
      ],
      buttonText: 'Подновете абонамента',
      footer: 'Ако имате въпроси, свържете се с екипа за поддръжка.'
    },
    ro: {
      title: 'Abonamentul expiră curând',
      message: 'Abonamentul dvs. va expira curând. Reînnoiți acum pentru a păstra accesul.',
      daysLeft: 'Expiră curând',
      benefits: [
        'Acces nelimitat la toate funcțiile',
        'Suport prioritar',
        'Sincronizare între dispozitive',
        'Fără reclame'
      ],
      buttonText: 'Reînnoiți abonamentul',
      footer: 'Dacă aveți întrebări, contactați echipa de suport.'
    },
    ar: {
      title: 'الاشتراك ينتهي قريباً',
      message: 'اشتراكك سينتهي قريباً. جدد الآن للحفاظ على الوصول.',
      daysLeft: 'ينتهي قريباً',
      benefits: [
        'وصول غير محدود لجميع الميزات',
        'دعم ذو أولوية',
        'مزامنة عبر الأجهزة',
        'بدون إعلانات'
      ],
      buttonText: 'تجديد الاشتراك',
      footer: 'إذا كان لديك أي أسئلة، اتصل بفريق الدعم.'
    }
  };

  const t = texts[locale] || texts['el'];
  const benefitsList = t.benefits.map(b => `<li style="margin-bottom: 8px; color: #374151;">✓ ${b}</li>`).join('');
  const formattedDate = expiresAt.toLocaleDateString(locale === 'el' ? 'el-GR' : locale === 'ru' ? 'ru-RU' : 'en-US');

  return `
<!DOCTYPE html>
<html lang="${locale}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">${t.title}</h1>
              <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 20px; border-radius: 20px; margin-top: 16px;">
                <span style="color: #ffffff; font-weight: 600;">${plan.toUpperCase()} - ${formattedDate}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${t.message}
              </p>
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 32px; border-radius: 0 8px 8px 0;">
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; list-style: none;">
                  ${benefitsList}
                </ul>
              </div>
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="https://apallaktis.com/${locale}/dashboard/subscription"
                   style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  ${t.buttonText}
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">${t.footer}</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ΑΠΑΛΛΑΚΤΗΣ</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateSubscriptionExpiredHTML(accountNumber: number, locale: string): string {
  const texts: Record<string, {
    title: string;
    message: string;
    whatHappens: string[];
    buttonText: string;
    footer: string;
  }> = {
    en: {
      title: 'Subscription Expired',
      message: 'Your subscription has expired. Renew now to restore access to all premium features.',
      whatHappens: [
        'Limited access to basic features only',
        'Cloud sync disabled',
        'Your data is safe and waiting for you'
      ],
      buttonText: 'Renew Now',
      footer: 'We miss you! Renew anytime to restore full access.'
    },
    ru: {
      title: 'Подписка истекла',
      message: 'Ваша подписка истекла. Продлите сейчас, чтобы восстановить доступ ко всем функциям.',
      whatHappens: [
        'Ограниченный доступ только к базовым функциям',
        'Синхронизация отключена',
        'Ваши данные в безопасности и ждут вас'
      ],
      buttonText: 'Продлить сейчас',
      footer: 'Мы скучаем! Продлите в любое время для восстановления доступа.'
    },
    el: {
      title: 'Η συνδρομή έληξε',
      message: 'Η συνδρομή σας έληξε. Ανανεώστε τώρα για να επαναφέρετε την πρόσβαση.',
      whatHappens: [
        'Περιορισμένη πρόσβαση μόνο σε βασικές λειτουργίες',
        'Ο συγχρονισμός απενεργοποιήθηκε',
        'Τα δεδομένα σας είναι ασφαλή'
      ],
      buttonText: 'Ανανέωση τώρα',
      footer: 'Μας λείπετε! Ανανεώστε οποτεδήποτε.'
    },
    uk: {
      title: 'Підписка закінчилася',
      message: 'Ваша підписка закінчилася. Поновіть зараз, щоб відновити доступ.',
      whatHappens: [
        'Обмежений доступ лише до базових функцій',
        'Синхронізацію вимкнено',
        'Ваші дані в безпеці та чекають на вас'
      ],
      buttonText: 'Поновити зараз',
      footer: 'Ми сумуємо! Поновіть у будь-який час.'
    },
    sq: {
      title: 'Abonimi skadoi',
      message: 'Abonimi juaj ka skaduar. Rinovoni tani për të rikthyer aksesin.',
      whatHappens: [
        'Akses i kufizuar vetëm në veçori bazë',
        'Sinkronizimi i çaktivizuar',
        'Të dhënat tuaja janë të sigurta'
      ],
      buttonText: 'Rinovoni tani',
      footer: 'Na mungoni! Rinovoni në çdo kohë.'
    },
    bg: {
      title: 'Абонаментът изтече',
      message: 'Вашият абонамент изтече. Подновете сега, за да възстановите достъпа.',
      whatHappens: [
        'Ограничен достъп само до основни функции',
        'Синхронизацията е деактивирана',
        'Вашите данни са в безопасност'
      ],
      buttonText: 'Подновете сега',
      footer: 'Липсвате ни! Подновете по всяко време.'
    },
    ro: {
      title: 'Abonamentul a expirat',
      message: 'Abonamentul dvs. a expirat. Reînnoiți acum pentru a restabili accesul.',
      whatHappens: [
        'Acces limitat doar la funcțiile de bază',
        'Sincronizarea dezactivată',
        'Datele dvs. sunt în siguranță'
      ],
      buttonText: 'Reînnoiți acum',
      footer: 'Ne este dor de tine! Reînnoiți oricând.'
    },
    ar: {
      title: 'انتهى الاشتراك',
      message: 'انتهى اشتراكك. جدد الآن لاستعادة الوصول.',
      whatHappens: [
        'وصول محدود للميزات الأساسية فقط',
        'المزامنة معطلة',
        'بياناتك آمنة وتنتظرك'
      ],
      buttonText: 'جدد الآن',
      footer: 'نفتقدك! جدد في أي وقت.'
    }
  };

  const t = texts[locale] || texts['el'];
  const whatHappensList = t.whatHappens.map(w => `<li style="margin-bottom: 8px; color: #7f1d1d;">${w}</li>`).join('');

  return `
<!DOCTYPE html>
<html lang="${locale}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">😢</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">${t.title}</h1>
              <p style="color: rgba(255,255,255,0.8); margin-top: 10px;">Account #${accountNumber}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${t.message}
              </p>
              <div style="background-color: #f3f4f6; border-left: 4px solid #6b7280; padding: 20px; margin-bottom: 32px; border-radius: 0 8px 8px 0;">
                <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                  ${whatHappensList}
                </ul>
              </div>
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="https://apallaktis.com/${locale}/dashboard/subscription"
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  ${t.buttonText}
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">${t.footer}</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ΑΠΑΛΛΑΚΤΗΣ</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generatePaymentFailedHTML(accountNumber: number, amount: number, locale: string): string {
  const texts = {
    el: {
      title: 'Η πληρωμή σας απορρίφθηκε',
      greeting: 'Αγαπητέ πελάτη,',
      message: `Η πληρωμή για το λογαριασμό σας <strong>#${accountNumber}</strong> απορρίφθηκε.`,
      amount: `Ποσό: <strong>${amount.toFixed(2)}€</strong>`,
      reason: 'Αυτό μπορεί να οφείλεται σε:',
      reason1: 'Ανεπαρκές υπόλοιπο',
      reason2: 'Ληγμένη κάρτα',
      reason3: 'Απόρριψη από την τράπεζα',
      action: 'Για να διατηρήσετε την πρόσβασή σας, ενημερώστε τη μέθοδο πληρωμής σας.',
      retry: 'Θα προσπαθήσουμε ξανά αυτόματα σε 3-5 ημέρες.',
      button: 'Ενημέρωση Μεθόδου Πληρωμής',
    },
    ru: {
      title: 'Ваш платёж отклонён',
      greeting: 'Уважаемый клиент,',
      message: `Платёж для аккаунта <strong>#${accountNumber}</strong> был отклонён.`,
      amount: `Сумма: <strong>${amount.toFixed(2)}€</strong>`,
      reason: 'Возможные причины:',
      reason1: 'Недостаточно средств',
      reason2: 'Срок действия карты истёк',
      reason3: 'Отказ банка',
      action: 'Чтобы сохранить доступ, обновите способ оплаты.',
      retry: 'Мы автоматически повторим попытку через 3-5 дней.',
      button: 'Обновить способ оплаты',
    },
    en: {
      title: 'Your payment was declined',
      greeting: 'Dear customer,',
      message: `The payment for account <strong>#${accountNumber}</strong> was declined.`,
      amount: `Amount: <strong>€${amount.toFixed(2)}</strong>`,
      reason: 'This may be due to:',
      reason1: 'Insufficient funds',
      reason2: 'Expired card',
      reason3: 'Bank rejection',
      action: 'To maintain your access, please update your payment method.',
      retry: 'We will automatically retry in 3-5 days.',
      button: 'Update Payment Method',
    },
    uk: {
      title: 'Ваш платіж відхилено',
      greeting: 'Шановний клієнте,',
      message: `Платіж для акаунту <strong>#${accountNumber}</strong> було відхилено.`,
      amount: `Сума: <strong>${amount.toFixed(2)}€</strong>`,
      reason: 'Можливі причини:',
      reason1: 'Недостатньо коштів',
      reason2: 'Термін дії картки закінчився',
      reason3: 'Відмова банку',
      action: 'Щоб зберегти доступ, оновіть спосіб оплати.',
      retry: 'Ми автоматично повторимо спробу через 3-5 днів.',
      button: 'Оновити спосіб оплати',
    },
    sq: {
      title: 'Pagesa juaj u refuzua',
      greeting: 'I dashur klient,',
      message: `Pagesa për llogarinë <strong>#${accountNumber}</strong> u refuzua.`,
      amount: `Shuma: <strong>${amount.toFixed(2)}€</strong>`,
      reason: 'Kjo mund të jetë për shkak të:',
      reason1: 'Fondet e pamjaftueshme',
      reason2: 'Karta e skaduar',
      reason3: 'Refuzimi nga banka',
      action: 'Për të ruajtur aksesin tuaj, përditësoni metodën e pagesës.',
      retry: 'Ne do të provojmë automatikisht përsëri në 3-5 ditë.',
      button: 'Përditëso Metodën e Pagesës',
    },
    bg: {
      title: 'Вашето плащане беше отказано',
      greeting: 'Уважаеми клиенте,',
      message: `Плащането за акаунт <strong>#${accountNumber}</strong> беше отказано.`,
      amount: `Сума: <strong>${amount.toFixed(2)}€</strong>`,
      reason: 'Това може да се дължи на:',
      reason1: 'Недостатъчни средства',
      reason2: 'Изтекла карта',
      reason3: 'Отказ от банката',
      action: 'За да запазите достъпа си, актуализирайте метода на плащане.',
      retry: 'Ще опитаме отново автоматично след 3-5 дни.',
      button: 'Актуализирай Метода на Плащане',
    },
    ro: {
      title: 'Plata dvs. a fost refuzată',
      greeting: 'Stimate client,',
      message: `Plata pentru contul <strong>#${accountNumber}</strong> a fost refuzată.`,
      amount: `Sumă: <strong>${amount.toFixed(2)}€</strong>`,
      reason: 'Aceasta poate fi din cauza:',
      reason1: 'Fonduri insuficiente',
      reason2: 'Card expirat',
      reason3: 'Refuz de la bancă',
      action: 'Pentru a vă menține accesul, actualizați metoda de plată.',
      retry: 'Vom reîncerca automat în 3-5 zile.',
      button: 'Actualizează Metoda de Plată',
    },
    ar: {
      title: 'تم رفض دفعتك',
      greeting: 'عزيزي العميل،',
      message: `تم رفض الدفع للحساب <strong>#${accountNumber}</strong>.`,
      amount: `المبلغ: <strong>${amount.toFixed(2)}€</strong>`,
      reason: 'قد يكون هذا بسبب:',
      reason1: 'رصيد غير كافٍ',
      reason2: 'بطاقة منتهية الصلاحية',
      reason3: 'رفض من البنك',
      action: 'للحفاظ على وصولك، يرجى تحديث طريقة الدفع.',
      retry: 'سنعاود المحاولة تلقائياً خلال 3-5 أيام.',
      button: 'تحديث طريقة الدفع',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.el;

  return `
<!DOCTYPE html>
<html lang="${locale}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">❌ ${t.title}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <p style="font-size: 18px; color: #333; margin-bottom: 10px;">${t.greeting}</p>
        <p style="font-size: 16px; color: #333; margin-bottom: 15px;">${t.message}</p>
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">${t.amount}</p>

        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #991b1b; font-weight: bold;">${t.reason}</p>
          <ul style="margin: 0; padding-left: 20px; color: #333;">
            <li>${t.reason1}</li>
            <li>${t.reason2}</li>
            <li>${t.reason3}</li>
          </ul>
        </div>

        <p style="font-size: 16px; color: #333; margin: 20px 0;">${t.action}</p>
        <p style="font-size: 14px; color: #666; margin: 10px 0;">${t.retry}</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://apallaktis.com/${locale}/dashboard/subscription" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            ${t.button}
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 12px; color: #999; margin: 0;">© 2026 ΑΠΑΛΛΑΚΤΗΣ</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateVIPActivatedHTML(accountNumber: number, expiresAt: Date | null, reason: string | undefined, locale: string): string {
  const texts = {
    el: {
      title: 'Συγχαρητήρια! Λάβατε VIP!',
      message: 'Ο διαχειριστής σας χορήγησε VIP πρόσβαση!',
      account: 'Λογαριασμός',
      expires: 'Ισχύει έως',
      lifetime: 'Αόριστη διάρκεια',
      reason: 'Λόγος',
      benefits: 'Τα VIP προνόμιά σας:',
      benefit1: 'Πλήρης πρόσβαση σε όλες τις λειτουργίες',
      benefit2: 'Προτεραιότητα υποστήριξης',
      benefit3: 'Χωρίς διαφημίσεις',
    },
    ru: {
      title: 'Поздравляем! Вам выдан VIP!',
      message: 'Администратор предоставил вам VIP-доступ!',
      account: 'Аккаунт',
      expires: 'Действует до',
      lifetime: 'Бессрочно',
      reason: 'Причина',
      benefits: 'Ваши VIP-привилегии:',
      benefit1: 'Полный доступ ко всем функциям',
      benefit2: 'Приоритетная поддержка',
      benefit3: 'Без рекламы',
    },
    en: {
      title: 'Congratulations! You received VIP!',
      message: 'The administrator has granted you VIP access!',
      account: 'Account',
      expires: 'Valid until',
      lifetime: 'Lifetime',
      reason: 'Reason',
      benefits: 'Your VIP benefits:',
      benefit1: 'Full access to all features',
      benefit2: 'Priority support',
      benefit3: 'No advertisements',
    },
    uk: {
      title: 'Вітаємо! Вам надано VIP!',
      message: 'Адміністратор надав вам VIP-доступ!',
      account: 'Акаунт',
      expires: 'Дійсний до',
      lifetime: 'Безстроково',
      reason: 'Причина',
      benefits: 'Ваші VIP-привілеї:',
      benefit1: 'Повний доступ до всіх функцій',
      benefit2: 'Пріоритетна підтримка',
      benefit3: 'Без реклами',
    },
    sq: {
      title: 'Urime! Keni marrë VIP!',
      message: 'Administratori ju ka dhënë akses VIP!',
      account: 'Llogaria',
      expires: 'E vlefshme deri',
      lifetime: 'Pa afat',
      reason: 'Arsyeja',
      benefits: 'Përfitimet tuaja VIP:',
      benefit1: 'Akses i plotë në të gjitha veçoritë',
      benefit2: 'Mbështetje me prioritet',
      benefit3: 'Pa reklama',
    },
    bg: {
      title: 'Поздравления! Получихте VIP!',
      message: 'Администраторът ви предостави VIP достъп!',
      account: 'Акаунт',
      expires: 'Валиден до',
      lifetime: 'Безсрочно',
      reason: 'Причина',
      benefits: 'Вашите VIP привилегии:',
      benefit1: 'Пълен достъп до всички функции',
      benefit2: 'Приоритетна поддръжка',
      benefit3: 'Без реклами',
    },
    ro: {
      title: 'Felicitări! Ați primit VIP!',
      message: 'Administratorul v-a acordat acces VIP!',
      account: 'Cont',
      expires: 'Valabil până la',
      lifetime: 'Pe viață',
      reason: 'Motiv',
      benefits: 'Beneficiile dvs. VIP:',
      benefit1: 'Acces complet la toate funcțiile',
      benefit2: 'Suport prioritar',
      benefit3: 'Fără reclame',
    },
    ar: {
      title: 'تهانينا! لقد حصلت على VIP!',
      message: 'منحك المسؤول صلاحية VIP!',
      account: 'الحساب',
      expires: 'صالح حتى',
      lifetime: 'مدى الحياة',
      reason: 'السبب',
      benefits: 'مزايا VIP الخاصة بك:',
      benefit1: 'وصول كامل لجميع الميزات',
      benefit2: 'دعم ذو أولوية',
      benefit3: 'بدون إعلانات',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.el;
  const expiryText = expiresAt
    ? `${t.expires}: ${expiresAt.toLocaleDateString(locale === 'el' ? 'el-GR' : locale === 'ru' ? 'ru-RU' : 'en-US')}`
    : t.lifetime;

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #000000; margin: 0; font-size: 28px;">⭐ ${t.title}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <p style="font-size: 18px; color: #333; margin-bottom: 20px;">${t.message}</p>

        <div style="background-color: #fffbeb; border: 2px solid #ffd700; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 5px 0; color: #333;"><strong>${t.account}:</strong> #${accountNumber}</p>
          <p style="margin: 5px 0; color: #333;"><strong>${expiryText}</strong></p>
          ${reason ? `<p style="margin: 5px 0; color: #333;"><strong>${t.reason}:</strong> ${reason}</p>` : ''}
        </div>

        <h3 style="color: #01312d; margin-top: 30px;">${t.benefits}</h3>
        <ul style="color: #333; font-size: 16px; line-height: 1.8;">
          <li>${t.benefit1}</li>
          <li>${t.benefit2}</li>
          <li>${t.benefit3}</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://apallaktis.com/${locale}/dashboard" style="display: inline-block; background-color: #ffd700; color: #000000; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Dashboard
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 12px; color: #999; margin: 0;">© 2026 ΑΠΑΛΛΑΚΤΗΣ</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateVIPCancelledHTML(userName: string, locale: string): string {
  const texts = {
    el: {
      title: 'Η VIP συνδρομή σας ακυρώθηκε',
      greeting: 'Αγαπητέ/ή',
      message: 'Σας ενημερώνουμε ότι η VIP συνδρομή σας στο ΑΠΑΛΛΑΚΤΗΣ ακυρώθηκε από τον διαχειριστή.',
      info: 'Ο λογαριασμός σας είναι πλέον σε κανονική κατάσταση.',
      action: 'Αν έχετε ερωτήσεις, επικοινωνήστε μαζί μας.',
      button: 'Επικοινωνία',
    },
    ru: {
      title: 'Ваша VIP подписка отменена',
      greeting: 'Уважаемый(ая)',
      message: 'Уведомляем вас, что ваша VIP подписка в ΑΠΑΛΛΑΚΤΗΣ была отменена администратором.',
      info: 'Ваш аккаунт теперь в обычном статусе.',
      action: 'Если у вас есть вопросы, свяжитесь с нами.',
      button: 'Связаться',
    },
    en: {
      title: 'Your VIP subscription has been cancelled',
      greeting: 'Dear',
      message: 'We inform you that your VIP subscription at ΑΠΑΛΛΑΚΤΗΣ has been cancelled by the administrator.',
      info: 'Your account is now in regular status.',
      action: 'If you have any questions, please contact us.',
      button: 'Contact Us',
    },
    uk: {
      title: 'Вашу VIP підписку скасовано',
      greeting: 'Шановний(а)',
      message: 'Повідомляємо вас, що вашу VIP підписку в ΑΠΑΛΛΑΚΤΗΣ було скасовано адміністратором.',
      info: 'Ваш акаунт тепер у звичайному статусі.',
      action: 'Якщо у вас є питання, зверніться до нас.',
      button: 'Зв\'язатися',
    },
    sq: {
      title: 'Abonimi juaj VIP është anuluar',
      greeting: 'I/E dashur',
      message: 'Ju njoftojmë që abonimi juaj VIP në ΑΠΑΛΛΑΚΤΗΣ është anuluar nga administratori.',
      info: 'Llogaria juaj tani është në statusin normal.',
      action: 'Nëse keni pyetje, na kontaktoni.',
      button: 'Na Kontaktoni',
    },
    bg: {
      title: 'Вашият VIP абонамент беше отменен',
      greeting: 'Уважаеми(а)',
      message: 'Уведомяваме ви, че вашият VIP абонамент в ΑΠΑΛΛΑΚΤΗΣ беше отменен от администратора.',
      info: 'Вашият акаунт вече е в нормален статус.',
      action: 'Ако имате въпроси, свържете се с нас.',
      button: 'Свържете се',
    },
    ro: {
      title: 'Abonamentul dvs. VIP a fost anulat',
      greeting: 'Stimate(ă)',
      message: 'Vă informăm că abonamentul dvs. VIP la ΑΠΑΛΛΑΚΤΗΣ a fost anulat de administrator.',
      info: 'Contul dvs. este acum în stare normală.',
      action: 'Dacă aveți întrebări, contactați-ne.',
      button: 'Contactați-ne',
    },
    ar: {
      title: 'تم إلغاء اشتراكك VIP',
      greeting: 'عزيزي',
      message: 'نعلمك أن اشتراكك VIP في ΑΠΑΛΛΑΚΤΗΣ قد تم إلغاؤه من قبل المسؤول.',
      info: 'حسابك الآن في الحالة العادية.',
      action: 'إذا كان لديك أي أسئلة، يرجى الاتصال بنا.',
      button: 'اتصل بنا',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.el;

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${t.title}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <p style="font-size: 18px; color: #333; margin-bottom: 20px;">${t.greeting} ${userName},</p>
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">${t.message}</p>

        <div style="background-color: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #4b5563; font-size: 15px;">${t.info}</p>
        </div>

        <p style="font-size: 16px; color: #333; margin-top: 20px;">${t.action}</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:support@apallaktis.com" style="display: inline-block; background-color: #6b7280; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            ${t.button}
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 12px; color: #999; margin: 0;">© 2026 ΑΠΑΛΛΑΚΤΗΣ</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateNewReferralHTML(name: string, email: string, locale: string): string {
  return `<html><body><h1>🎉 New Referral</h1><p>${name} (${email}) signed up via your link!</p></body></html>`;
}

function generateReferralPurchaseHTML(name: string, totalBonusMonths: number, locale: string): string {
  return `<html><body><h1>🎁 +1 Bonus Month!</h1><p>${name} purchased an account! You now have ${totalBonusMonths} bonus months.</p></body></html>`;
}

function generateSubscriptionActivatedHTML(accountNumber: number, plan: string, expiresAt: Date, locale: string): string {
  return `<html><body><h1>✅ Subscription Activated</h1><p>Account #${accountNumber}</p><p>Plan: ${plan}</p><p>Expires: ${expiresAt.toLocaleDateString()}</p></body></html>`;
}

// ============================================
// 10. Team Invitation Email
// ============================================

/**
 * 10. Уведомление: Приглашение в команду
 */
export async function sendTeamInvitationEmail(
  email: string,
  inviterName: string,
  teamName: string,
  inviteLink: string,
  expiresAt: Date,
  locale: string = 'el'
): Promise<boolean> {
  const subjects = {
    el: `🤝 Πρόσκληση στην ομάδα "${teamName}" - ΑΠΑΛΛΑΚΤΗΣ`,
    ru: `🤝 Приглашение в команду "${teamName}" - ΑΠΑΛΛΑΚΤΗΣ`,
    en: `🤝 Invitation to join team "${teamName}" - ΑΠΑΛΛΑΚΤΗΣ`,
    uk: `🤝 Запрошення до команди "${teamName}" - ΑΠΑΛΛΑΚΤΗΣ`,
    sq: `🤝 Ftesë për t'u bashkuar në ekipin "${teamName}" - ΑΠΑΛΛΑΚΤΗΣ`,
    bg: `🤝 Покана за присъединяване към екип "${teamName}" - ΑΠΑΛΛΑΚΤΗΣ`,
    ro: `🤝 Invitație pentru echipa "${teamName}" - ΑΠΑΛΛΑΚΤΗΣ`,
    ar: `🤝 دعوة للانضمام إلى الفريق "${teamName}" - ΑΠΑΛΛΑΚΤΗΣ`,
  };

  const html = generateTeamInvitationHTML(inviterName, teamName, inviteLink, expiresAt, locale);

  return sendEmail({
    to: email,
    subject: subjects[locale as keyof typeof subjects] || subjects.el,
    html,
  });
}

function generateTeamInvitationHTML(
  inviterName: string,
  teamName: string,
  inviteLink: string,
  expiresAt: Date,
  locale: string
): string {
  const texts = {
    el: {
      title: 'Πρόσκληση στην Ομάδα',
      greeting: 'Γεια σας!',
      message: `Ο/Η <strong>${inviterName}</strong> σας προσκαλεί να συμμετάσχετε στην ομάδα <strong>"${teamName}"</strong> στο ΑΠΑΛΛΑΚΤΗΣ.`,
      info: 'Αφού συμμετάσχετε στην ομάδα, θα έχετε πρόσβαση σε όλα τα έργα και τα οικονομικά στοιχεία της ομάδας.',
      expires: `Η πρόσκληση λήγει: ${expiresAt.toLocaleDateString('el-GR')}`,
      button: 'Αποδοχή Πρόσκλησης',
      note: 'Αν δεν αναγνωρίζετε αυτή την πρόσκληση, αγνοήστε αυτό το email.',
    },
    ru: {
      title: 'Приглашение в команду',
      greeting: 'Здравствуйте!',
      message: `<strong>${inviterName}</strong> приглашает вас присоединиться к команде <strong>"${teamName}"</strong> в ΑΠΑΛΛΑΚΤΗΣ.`,
      info: 'После присоединения к команде вы получите доступ ко всем проектам и финансовым данным команды.',
      expires: `Приглашение действует до: ${expiresAt.toLocaleDateString('ru-RU')}`,
      button: 'Принять приглашение',
      note: 'Если вы не узнаёте это приглашение, проигнорируйте это письмо.',
    },
    en: {
      title: 'Team Invitation',
      greeting: 'Hello!',
      message: `<strong>${inviterName}</strong> has invited you to join the team <strong>"${teamName}"</strong> on ΑΠΑΛΛΑΚΤΗΣ.`,
      info: 'After joining the team, you will have access to all team projects and financial data.',
      expires: `Invitation expires: ${expiresAt.toLocaleDateString('en-US')}`,
      button: 'Accept Invitation',
      note: 'If you don\'t recognize this invitation, please ignore this email.',
    },
    uk: {
      title: 'Запрошення до команди',
      greeting: 'Привіт!',
      message: `<strong>${inviterName}</strong> запрошує вас приєднатися до команди <strong>"${teamName}"</strong> в ΑΠΑΛΛΑΚΤΗΣ.`,
      info: 'Після приєднання до команди ви отримаєте доступ до всіх проектів та фінансових даних команди.',
      expires: `Запрошення дійсне до: ${expiresAt.toLocaleDateString('uk-UA')}`,
      button: 'Прийняти запрошення',
      note: 'Якщо ви не впізнаєте це запрошення, проігноруйте цей лист.',
    },
    sq: {
      title: 'Ftesë për Ekipin',
      greeting: 'Përshëndetje!',
      message: `<strong>${inviterName}</strong> ju fton të bashkoheni me ekipin <strong>"${teamName}"</strong> në ΑΠΑΛΛΑΚΤΗΣ.`,
      info: 'Pasi të bashkoheni me ekipin, do të keni qasje në të gjitha projektet dhe të dhënat financiare të ekipit.',
      expires: `Ftesa skadon: ${expiresAt.toLocaleDateString('sq-AL')}`,
      button: 'Prano Ftesën',
      note: 'Nëse nuk e njihni këtë ftesë, injoroni këtë email.',
    },
    bg: {
      title: 'Покана за екип',
      greeting: 'Здравейте!',
      message: `<strong>${inviterName}</strong> ви кани да се присъедините към екип <strong>"${teamName}"</strong> в ΑΠΑΛΛΑΚΤΗΣ.`,
      info: 'След като се присъедините към екипа, ще имате достъп до всички проекти и финансови данни на екипа.',
      expires: `Поканата изтича: ${expiresAt.toLocaleDateString('bg-BG')}`,
      button: 'Приемане на поканата',
      note: 'Ако не разпознавате тази покана, игнорирайте този имейл.',
    },
    ro: {
      title: 'Invitație pentru Echipă',
      greeting: 'Bună!',
      message: `<strong>${inviterName}</strong> te invită să te alături echipei <strong>"${teamName}"</strong> pe ΑΠΑΛΛΑΚΤΗΣ.`,
      info: 'După ce te alături echipei, vei avea acces la toate proiectele și datele financiare ale echipei.',
      expires: `Invitația expiră: ${expiresAt.toLocaleDateString('ro-RO')}`,
      button: 'Acceptă Invitația',
      note: 'Dacă nu recunoști această invitație, ignoră acest email.',
    },
    ar: {
      title: 'دعوة للانضمام إلى الفريق',
      greeting: 'مرحباً!',
      message: `<strong>${inviterName}</strong> يدعوك للانضمام إلى الفريق <strong>"${teamName}"</strong> على ΑΠΑΛΛΑΚΤΗΣ.`,
      info: 'بعد الانضمام إلى الفريق، ستحصل على إمكانية الوصول إلى جميع مشاريع الفريق والبيانات المالية.',
      expires: `تنتهي الدعوة: ${expiresAt.toLocaleDateString('ar-SA')}`,
      button: 'قبول الدعوة',
      note: 'إذا كنت لا تتعرف على هذه الدعوة، يرجى تجاهل هذا البريد الإلكتروني.',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.el;

  return `
<!DOCTYPE html>
<html lang="${locale}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background: linear-gradient(135deg, #01312d 0%, #065f46 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🤝 ${t.title}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <p style="font-size: 18px; color: #333; margin-bottom: 10px;">${t.greeting}</p>
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">${t.message}</p>

        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #065f46; font-size: 15px;">${t.info}</p>
        </div>

        <p style="font-size: 14px; color: #666; margin: 15px 0;">${t.expires}</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="display: inline-block; background-color: #01312d; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            ${t.button}
          </a>
        </div>

        <p style="font-size: 13px; color: #999; margin-top: 30px; text-align: center;">${t.note}</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 12px; color: #999; margin: 0;">© 2026 ΑΠΑΛΛΑΚΤΗΣ</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ============================================
// 11. Admin Notification: New Payment Received
// ============================================

export interface AdminPaymentNotificationData {
  legalName: string;
  afm: string;
  address: string;
  clientEmail: string;
  amount: number;
  tax: number;
  total: number;
  paymentType: 'purchase' | 'subscription';
  plan?: string;
  accountNumber: number;
  stripePaymentId?: string;
}

/**
 * 10. Уведомление администратору: Новая оплата (для выдачи ΤΙΜΟΛΟΓΙΟ)
 */
export async function sendAdminPaymentNotificationEmail(
  adminEmail: string,
  data: AdminPaymentNotificationData
): Promise<boolean> {
  const formattedDate = new Date().toLocaleDateString('el-GR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const paymentTypeText = data.paymentType === 'purchase'
    ? 'Αγορά Λογαριασμού'
    : `Συνδρομή ${data.plan || ''}`;

  const subject = `💰 Νέα πληρωμή: ${data.legalName || 'Ιδιώτης'} — ${data.total.toFixed(2)}€`;

  const html = `
<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <tr>
      <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">💰 Νέα Πληρωμή - Έκδοση Τιμολογίου</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #059669; margin: 0 0 10px 0;">✅ Επιτυχής πληρωμή μέσω Stripe</h3>
          <p style="margin: 0; color: #333; font-size: 14px;">Ημερομηνία: <strong>${formattedDate}</strong></p>
        </div>

        <h3 style="color: #01312d; border-bottom: 2px solid #01312d; padding-bottom: 10px;">Στοιχεία Πελάτη</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 140px;">Επωνυμία:</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${data.legalName || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">ΑΦΜ:</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${data.afm || 'N/A (Ιδιώτης)'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Διεύθυνση:</td>
            <td style="padding: 8px 0; color: #333;">${data.address || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Email:</td>
            <td style="padding: 8px 0; color: #333;"><a href="mailto:${data.clientEmail}">${data.clientEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Λογαριασμός:</td>
            <td style="padding: 8px 0; color: #333;">#${data.accountNumber}</td>
          </tr>
        </table>

        <h3 style="color: #01312d; border-bottom: 2px solid #01312d; padding-bottom: 10px;">Στοιχεία Πληρωμής</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 140px;">Τύπος:</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${paymentTypeText}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Καθαρό ποσό:</td>
            <td style="padding: 8px 0; color: #333;">${data.amount.toFixed(2)} €</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">ΦΠΑ 24%:</td>
            <td style="padding: 8px 0; color: #333;">${data.tax.toFixed(2)} €</td>
          </tr>
          <tr style="background-color: #f0fdf4;">
            <td style="padding: 12px 8px; color: #059669; font-weight: bold;">ΣΥΝΟΛΟ:</td>
            <td style="padding: 12px 8px; color: #059669; font-weight: bold; font-size: 18px;">${data.total.toFixed(2)} €</td>
          </tr>
        </table>

        ${data.stripePaymentId ? `<p style="font-size: 12px; color: #666;">Stripe Payment ID: ${data.stripePaymentId}</p>` : ''}

        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-top: 20px;">
          <h4 style="color: #d97706; margin: 0 0 10px 0;">⚠️ Απαιτείται έκδοση Τιμολογίου</h4>
          <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;">
            Το Stripe έχει στείλει αυτόματα επιβεβαίωση πληρωμής στον πελάτη.<br>
            <strong>Πρέπει να εκδώσετε ΤΙΜΟΛΟΓΙΟ/ΑΠΟΔΕΙΞΗ μέσω timologio.aade.gr</strong>
          </p>
          <a href="https://timologio.aade.gr" target="_blank" style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
            Άνοιγμα timologio.aade.gr →
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9f9f9; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 11px; color: #999; margin: 0;">ΑΠΑΛΛΑΚΤΗΣ Admin Notification</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendEmail({
    to: adminEmail,
    subject,
    html,
  });
}

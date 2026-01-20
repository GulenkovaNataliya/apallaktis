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
    el: '🎉 Νέος παραπεμπόμενος εγγράφηκε μέσω του συνδέσμου σας!',
    ru: '🎉 Новый реферал зарегистрировался по вашей ссылке!',
    en: '🎉 New referral signed up via your link!',
    uk: '🎉 Новий реферал зареєструвався за вашим посиланням!',
    sq: '🎉 Referal i ri u regjistrua përmes lidhjes suaj!',
    bg: '🎉 Нов реферал се регистрира чрез вашата връзка!',
    ro: '🎉 Referință nouă s-a înregistrat prin linkul dvs.!',
    ar: '🎉 تم تسجيل إحالة جديدة عبر رابطك!',
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
    el: '🎁 Κερδίσατε +1 μήνα ΔΩΡΕΑΝ! Ο παραπεμπόμενός σας αγόρασε λογαριασμό!',
    ru: '🎁 Вы получили +1 месяц БЕСПЛАТНО! Ваш реферал купил аккаунт!',
    en: '🎁 You earned +1 month FREE! Your referral purchased an account!',
    uk: '🎁 Ви отримали +1 місяць БЕЗКОШТОВНО! Ваш реферал купив акаунт!',
    sq: '🎁 Fituat +1 muaj FALAS! Referali juaj bleu një llogari!',
    bg: '🎁 Спечелихте +1 месец БЕЗПЛАТНО! Вашият реферал купи акаунт!',
    ro: '🎁 Ați câștigat +1 lună GRATUIT! Referința dvs. a cumpărat un cont!',
    ar: '🎁 لقد ربحت +1 شهر مجاناً! اشترى المُحال الخاص بك حساباً!',
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
          <a href="https://apallaktis.gr/${locale}/page-pay" style="display: inline-block; background-color: #ff8f0a; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
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
          <a href="https://apallaktis.gr/${locale}/page-pay" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
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
  return `<html><body><h1>Subscription Expiring</h1><p>Account #${accountNumber}, Plan: ${plan}, Expires: ${expiresAt.toLocaleDateString()}</p></body></html>`;
}

function generateSubscriptionExpiredHTML(accountNumber: number, locale: string): string {
  return `<html><body><h1>Subscription Expired</h1><p>Account #${accountNumber}</p></body></html>`;
}

function generatePaymentFailedHTML(accountNumber: number, amount: number, locale: string): string {
  return `<html><body><h1>Payment Failed</h1><p>Account #${accountNumber}, Amount: €${amount}</p></body></html>`;
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
          <a href="https://apallaktis.gr/${locale}/dashboard" style="display: inline-block; background-color: #ffd700; color: #000000; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
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
          <a href="mailto:support@apallaktis.gr" style="display: inline-block; background-color: #6b7280; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
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
// 10. Admin Notification: New Payment Received
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
 * 10. Уведомление администратору: Новая оплата (для выдачи Τιμολόγιο)
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
            <strong>Πρέπει να εκδώσετε Τιμολόγιο/Απόδειξη μέσω timologio.aade.gr</strong>
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

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
      button: 'Αγορά Λογαριασμού (97€)',
    },
    ru: {
      title: 'Ваше DEMO скоро истекает',
      message: `DEMO период для аккаунта <strong>#${accountNumber}</strong> истекает <strong>${expiresAt.toLocaleDateString('ru-RU')}</strong>.`,
      info: 'Купите аккаунт сейчас, чтобы продолжить использовать все функции!',
      button: 'Купить аккаунт (97€)',
    },
    en: {
      title: 'Your DEMO is expiring soon',
      message: `DEMO period for account <strong>#${accountNumber}</strong> expires on <strong>${expiresAt.toLocaleDateString('en-US')}</strong>.`,
      info: 'Purchase an account now to continue using all features!',
      button: 'Purchase Account (€97)',
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
  const expiryText = expiresAt ? `Expires: ${expiresAt.toLocaleDateString()}` : 'Lifetime VIP';
  return `<html><body><h1>⭐ VIP Activated</h1><p>Account #${accountNumber}</p><p>${expiryText}</p>${reason ? `<p>Reason: ${reason}</p>` : ''}</body></html>`;
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

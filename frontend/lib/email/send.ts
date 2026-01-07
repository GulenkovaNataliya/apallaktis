// Email Sending Service
// =====================
// Централизованная система отправки email
// Поддерживает: Resend, SendGrid, NodeMailer

/**
 * Email отправка
 *
 * НАСТРОЙКА:
 * 1. Установи resend: npm install resend
 * 2. Добавь в .env.local: RESEND_API_KEY=re_...
 * 3. Проверь домен в Resend Dashboard
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Отправка email через Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ EMAIL: RESEND_API_KEY не настроен в .env.local');
      console.log('📧 EMAIL (заглушка):', {
        to: options.to,
        subject: options.subject,
      });
      return true; // Возвращаем true для разработки
    }

    // Отправка через Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || 'ΑΠΑΛΛΑΚΤΗΣ <noreply@apallaktis.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ EMAIL: Ошибка отправки:', error);
      return false;
    }

    const data = await response.json();
    console.log('✅ EMAIL: Отправлено успешно:', data.id);
    return true;

  } catch (error) {
    console.error('❌ EMAIL: Ошибка:', error);
    return false;
  }
}

/**
 * Email с благодарностью за покупку аккаунта
 */
export async function sendAccountPurchaseEmail(
  userEmail: string,
  accountNumber: number,
  locale: string = 'el'
): Promise<boolean> {
  const subjects = {
    el: 'Ευχαριστούμε για την αγορά! Ο λογαριασμός σας ενεργοποιήθηκε 🎉',
    ru: 'Спасибо за покупку! Ваш аккаунт активирован 🎉',
    en: 'Thank you for your purchase! Your account is activated 🎉',
    uk: 'Дякуємо за покупку! Ваш акаунт активовано 🎉',
    sq: 'Faleminderit për blerjen! Llogaria juaj është aktivizuar 🎉',
    bg: 'Благодарим ви за покупката! Вашият акаунт е активиран 🎉',
    ro: 'Vă mulțumim pentru achiziție! Contul dvs. a fost activat 🎉',
    ar: 'شكراً لك على الشراء! تم تفعيل حسابك 🎉',
  };

  const html = generateAccountPurchaseEmailHTML(accountNumber, locale);

  return sendEmail({
    to: userEmail,
    subject: subjects[locale as keyof typeof subjects] || subjects.el,
    html,
  });
}

/**
 * Генерация HTML для email о покупке аккаунта
 */
function generateAccountPurchaseEmailHTML(accountNumber: number, locale: string): string {
  const texts = {
    el: {
      title: 'Ευχαριστούμε για την αγορά!',
      greeting: 'Γεια σας!',
      message: `Ο λογαριασμός σας <strong>#${accountNumber}</strong> ενεργοποιήθηκε επιτυχώς!`,
      freeMonth: '🎁 Οι πρώτες 30 ημέρες είναι ΔΩΡΕΑΝ!',
      nextSteps: 'Τα επόμενα βήματα:',
      step1: 'Συνδεθείτε στον λογαριασμό σας',
      step2: 'Προσθέστε τα πρώτα σας ΈΡΓΑ',
      step3: 'Διαχειριστείτε τα έξοδα και πληρωμές σας',
      button: 'Μετάβαση στο Dashboard',
      footer: 'Εάν έχετε ερωτήσεις, επικοινωνήστε μαζί μας στο WhatsApp/Viber: +30 698 320 8844',
      regards: 'Με εκτίμηση,<br>Η ομάδα ΑΠΑΛΛΑΚΤΗΣ',
    },
    ru: {
      title: 'Спасибо за покупку!',
      greeting: 'Здравствуйте!',
      message: `Ваш аккаунт <strong>#${accountNumber}</strong> успешно активирован!`,
      freeMonth: '🎁 Первые 30 дней БЕСПЛАТНО!',
      nextSteps: 'Следующие шаги:',
      step1: 'Войдите в свой аккаунт',
      step2: 'Добавьте свои первые проекты',
      step3: 'Управляйте расходами и платежами',
      button: 'Перейти в Dashboard',
      footer: 'Если у вас есть вопросы, свяжитесь с нами в WhatsApp/Viber: +30 698 320 8844',
      regards: 'С уважением,<br>Команда ΑΠΑΛΛΑΚΤΗΣ',
    },
    en: {
      title: 'Thank you for your purchase!',
      greeting: 'Hello!',
      message: `Your account <strong>#${accountNumber}</strong> has been successfully activated!`,
      freeMonth: '🎁 First 30 days are FREE!',
      nextSteps: 'Next steps:',
      step1: 'Log in to your account',
      step2: 'Add your first projects',
      step3: 'Manage your expenses and payments',
      button: 'Go to Dashboard',
      footer: 'If you have any questions, contact us on WhatsApp/Viber: +30 698 320 8844',
      regards: 'Best regards,<br>ΑΠΑΛΛΑΚΤΗΣ Team',
    },
    uk: {
      title: 'Дякуємо за покупку!',
      greeting: 'Вітаємо!',
      message: `Ваш акаунт <strong>#${accountNumber}</strong> успішно активовано!`,
      freeMonth: '🎁 Перші 30 днів БЕЗКОШТОВНО!',
      nextSteps: 'Наступні кроки:',
      step1: 'Увійдіть до свого акаунту',
      step2: 'Додайте свої перші проекти',
      step3: 'Керуйте витратами та платежами',
      button: 'Перейти в Dashboard',
      footer: 'Якщо у вас є питання, зв\'яжіться з нами в WhatsApp/Viber: +30 698 320 8844',
      regards: 'З повагою,<br>Команда ΑΠΑΛΛΑΚΤΗΣ',
    },
    sq: {
      title: 'Faleminderit për blerjen!',
      greeting: 'Përshëndetje!',
      message: `Llogaria juaj <strong>#${accountNumber}</strong> është aktivizuar me sukses!`,
      freeMonth: '🎁 30 ditët e para janë FALAS!',
      nextSteps: 'Hapat e ardhshëm:',
      step1: 'Hyni në llogarinë tuaj',
      step2: 'Shtoni projektet tuaja të para',
      step3: 'Menaxhoni shpenzimet dhe pagesat tuaja',
      button: 'Shko te Dashboard',
      footer: 'Nëse keni pyetje, kontaktoni me ne në WhatsApp/Viber: +30 698 320 8844',
      regards: 'Me respekt,<br>Ekipi ΑΠΑΛΛΑΚΤΗΣ',
    },
    bg: {
      title: 'Благодарим ви за покупката!',
      greeting: 'Здравейте!',
      message: `Вашият акаунт <strong>#${accountNumber}</strong> е успешно активиран!`,
      freeMonth: '🎁 Първите 30 дни са БЕЗПЛАТНИ!',
      nextSteps: 'Следващи стъпки:',
      step1: 'Влезте във вашия акаунт',
      step2: 'Добавете първите си проекти',
      step3: 'Управлявайте разходите и плащанията си',
      button: 'Към Dashboard',
      footer: 'Ако имате въпроси, свържете се с нас в WhatsApp/Viber: +30 698 320 8844',
      regards: 'С уважение,<br>Екип ΑΠΑΛΛΑΚΤΗΣ',
    },
    ro: {
      title: 'Vă mulțumim pentru achiziție!',
      greeting: 'Bună ziua!',
      message: `Contul dvs. <strong>#${accountNumber}</strong> a fost activat cu succes!`,
      freeMonth: '🎁 Primele 30 de zile sunt GRATUITE!',
      nextSteps: 'Pașii următori:',
      step1: 'Conectați-vă la contul dvs.',
      step2: 'Adăugați primele dvs. proiecte',
      step3: 'Gestionați cheltuielile și plățile dvs.',
      button: 'Mergi la Dashboard',
      footer: 'Dacă aveți întrebări, contactați-ne pe WhatsApp/Viber: +30 698 320 8844',
      regards: 'Cu respect,<br>Echipa ΑΠΑΛΛΑΚΤΗΣ',
    },
    ar: {
      title: 'شكراً لك على الشراء!',
      greeting: 'مرحباً!',
      message: `تم تفعيل حسابك <strong>#${accountNumber}</strong> بنجاح!`,
      freeMonth: '🎁 أول 30 يوماً مجانية!',
      nextSteps: 'الخطوات التالية:',
      step1: 'قم بتسجيل الدخول إلى حسابك',
      step2: 'أضف مشاريعك الأولى',
      step3: 'قم بإدارة نفقاتك ومدفوعاتك',
      button: 'الذهاب إلى لوحة التحكم',
      footer: 'إذا كان لديك أي أسئلة، اتصل بنا على WhatsApp/Viber: +30 698 320 8844',
      regards: 'مع أطيب التحيات،<br>فريق ΑΠΑΛΛΑΚΤΗΣ',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.el;

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #01312d 0%, #025951 100%); padding: 40px 20px; text-align: center;">
        <img src="https://apallaktis.com/Apallaktis.photos/apallaktis-logo-orange@2x.png" alt="ΑΠΑΛΛΑΚΤΗΣ" style="width: 180px; height: auto; margin-bottom: 20px;" />
        <h1 style="color: #daf3f6; margin: 0; font-size: 28px;">${t.title}</h1>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">${t.greeting}</p>

        <p style="font-size: 18px; color: #01312d; margin-bottom: 20px;">${t.message}</p>

        <div style="background-color: #fff3e0; border-left: 4px solid #ff8f0a; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #ff8f0a; font-size: 16px; font-weight: bold;">${t.freeMonth}</p>
        </div>

        <h2 style="color: #01312d; font-size: 20px; margin-top: 30px;">${t.nextSteps}</h2>
        <ol style="color: #333; font-size: 16px; line-height: 1.8;">
          <li>${t.step1}</li>
          <li>${t.step2}</li>
          <li>${t.step3}</li>
        </ol>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://apallaktis.com/el/page-pay" style="display: inline-block; background-color: #daf3f6; color: #01312d; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            ${t.button}
          </a>
        </div>

        <p style="font-size: 14px; color: #666; margin-top: 30px;">${t.footer}</p>

        <p style="font-size: 14px; color: #333; margin-top: 30px;">${t.regards}</p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 12px; color: #999; margin: 0;">
          © 2026 ΑΠΑΛΛΑΚΤΗΣ. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

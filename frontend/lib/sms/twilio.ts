// Twilio SMS Library
// ==================
// Функции для отправки SMS уведомлений через Twilio

import twilio from 'twilio';

// Инициализация Twilio клиента
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: ReturnType<typeof twilio> | null = null;

if (accountSid && authToken && fromPhone) {
  twilioClient = twilio(accountSid, authToken);
}

// Проверка конфигурации Twilio
export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && fromPhone);
}

// Генерация 6-значного кода верификации
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Форматирование номера телефона в международный формат
export function formatPhoneNumber(phone: string): string {
  // Убираем все нецифровые символы
  let cleaned = phone.replace(/\D/g, '');

  // Если номер начинается с 8 (Россия), меняем на +7
  if (cleaned.startsWith('8')) {
    cleaned = '7' + cleaned.substring(1);
  }

  // Если номер не начинается с +, добавляем +
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
}

// Отправка SMS верификационного кода
export async function sendVerificationCode(phone: string, code: string): Promise<boolean> {
  if (!twilioClient || !fromPhone) {
    console.error('Twilio is not configured');
    return false;
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);

    await twilioClient.messages.create({
      body: `Ваш код подтверждения для Apallaktis: ${code}\n\nКод действителен 10 минут.`,
      from: fromPhone,
      to: formattedPhone,
    });

    console.log(`✅ SMS verification code sent to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS verification code:', error);
    return false;
  }
}

// Отправка уведомления об окончании DEMO (за 24 часа)
export async function sendDemoExpiringNotification(phone: string, name: string): Promise<boolean> {
  if (!twilioClient || !fromPhone) {
    console.error('Twilio is not configured');
    return false;
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);

    await twilioClient.messages.create({
      body: `${name}, ваш DEMO период в Apallaktis истекает через 24 часа.\n\nОформите подписку, чтобы продолжить работу: https://apallaktis.com`,
      from: fromPhone,
      to: formattedPhone,
    });

    console.log(`✅ DEMO expiring SMS sent to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error('Error sending DEMO expiring SMS:', error);
    return false;
  }
}

// Отправка уведомления об окончании DEMO
export async function sendDemoExpiredNotification(phone: string, name: string): Promise<boolean> {
  if (!twilioClient || !fromPhone) {
    console.error('Twilio is not configured');
    return false;
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);

    await twilioClient.messages.create({
      body: `${name}, ваш DEMO период в Apallaktis истёк.\n\nОформите подписку, чтобы восстановить доступ: https://apallaktis.com`,
      from: fromPhone,
      to: formattedPhone,
    });

    console.log(`✅ DEMO expired SMS sent to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error('Error sending DEMO expired SMS:', error);
    return false;
  }
}

// Отправка уведомления об истечении подписки (за 2 дня)
export async function sendSubscriptionExpiringNotification(phone: string, name: string, expiresAt: string): Promise<boolean> {
  if (!twilioClient || !fromPhone) {
    console.error('Twilio is not configured');
    return false;
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);
    const date = new Date(expiresAt).toLocaleDateString('ru-RU');

    await twilioClient.messages.create({
      body: `${name}, ваша подписка Apallaktis истекает ${date}.\n\nПродлите подписку: https://apallaktis.com`,
      from: fromPhone,
      to: formattedPhone,
    });

    console.log(`✅ Subscription expiring SMS sent to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error('Error sending subscription expiring SMS:', error);
    return false;
  }
}

// Отправка уведомления об истечении подписки
export async function sendSubscriptionExpiredNotification(phone: string, name: string): Promise<boolean> {
  if (!twilioClient || !fromPhone) {
    console.error('Twilio is not configured');
    return false;
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);

    await twilioClient.messages.create({
      body: `${name}, ваша подписка Apallaktis истекла.\n\nПродлите подписку, чтобы восстановить доступ: https://apallaktis.com`,
      from: fromPhone,
      to: formattedPhone,
    });

    console.log(`✅ Subscription expired SMS sent to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error('Error sending subscription expired SMS:', error);
    return false;
  }
}

// Отправка уведомления об активации VIP
export async function sendVIPActivatedNotification(phone: string, name: string): Promise<boolean> {
  if (!twilioClient || !fromPhone) {
    console.error('Twilio is not configured');
    return false;
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);

    await twilioClient.messages.create({
      body: `${name}, поздравляем! Вам активирован VIP статус в Apallaktis 🌟\n\nТеперь у вас есть доступ ко всем функциям без ограничений!`,
      from: fromPhone,
      to: formattedPhone,
    });

    console.log(`✅ VIP activated SMS sent to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error('Error sending VIP activated SMS:', error);
    return false;
  }
}

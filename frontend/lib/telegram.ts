/**
 * Telegram Bot notifications
 *
 * Sends messages to admin chat for important events:
 * - New account purchases
 * - Subscription payments
 * - New demo signups
 */

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

/**
 * Send a message to the configured Telegram chat
 *
 * @param text - Message text (plain text, no HTML)
 * @returns Promise that resolves when message is sent (or silently fails)
 */
export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Silently skip if not configured (don't break the app)
  if (!token || !chatId) {
    console.log('[Telegram] Skipped: env variables not configured');
    return;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Telegram] API error:', error);
    }
  } catch (error) {
    // Log error but don't throw - notifications shouldn't break main flow
    console.error('[Telegram] Send failed:', error instanceof Error ? error.message : error);
  }
}

/**
 * Format a Stripe payment notification message (Russian)
 */
export function formatPaymentMessage(data: {
  type: 'account_purchase' | 'subscription';
  email?: string;
  userId: string;
  amount: number;
  currency?: string;
  paidAt?: string;
  plan?: string;
}): string {
  const typeLabel = data.type === 'account_purchase' ? 'Покупка аккаунта' : `Подписка${data.plan ? ` (${data.plan})` : ''}`;
  return [
    '✅ Оплата получена',
    `Тип: ${typeLabel}`,
    `Сумма: ${data.amount.toFixed(2)} ${(data.currency || 'EUR').toUpperCase()}`,
    `Клиент: ${data.email || data.userId}`,
    `Дата: ${data.paidAt || new Date().toISOString()}`,
  ].join('\n');
}


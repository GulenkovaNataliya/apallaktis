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
 * Format a Stripe payment notification message
 */
export function formatPaymentMessage(data: {
  type: 'account_purchase' | 'subscription';
  userId: string;
  email?: string;
  amount: number;
  plan?: string;
  eventId: string;
}): string {
  const lines = [
    '✅ Stripe payment',
    `type: ${data.type}`,
    `user_id: ${data.userId}`,
    `email: ${data.email || '-'}`,
    `amount: ${data.amount.toFixed(2)} EUR`,
  ];

  if (data.plan) {
    lines.push(`plan: ${data.plan}`);
  }

  lines.push(`time: ${new Date().toISOString()}`);
  lines.push(`event: ${data.eventId}`);

  return lines.join('\n');
}

/**
 * Format a new demo signup notification message
 */
export function formatDemoSignupMessage(data: {
  userId: string;
  email: string;
  phone?: string;
  consent: boolean;
}): string {
  return [
    '🆕 New demo signup',
    `email: ${data.email}`,
    `phone: ${data.phone || '-'}`,
    `consent: ${data.consent}`,
    `user_id: ${data.userId}`,
    `time: ${new Date().toISOString()}`,
  ].join('\n');
}

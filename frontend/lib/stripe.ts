// Stripe Client Configuration (Frontend)
// ========================================
// ВАЖНО: Этот файл используется на клиенте (в браузере)
// Используй только PUBLISHABLE ключ (pk_test_... или pk_live_...)

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Получить Stripe instance для клиента
 *
 * НАСТРОЙКА:
 * 1. Установи пакет: npm install @stripe/stripe-js
 * 2. Добавь в .env.local:
 *    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
 * 3. Для production замени на live ключ (pk_live_...)
 */
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.warn(
        '⚠️ STRIPE: Publishable key не найден!\n' +
        'Добавь NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY в .env.local\n' +
        'Смотри STRIPE_SETUP.md для инструкций'
      );
      return null;
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

/**
 * Проверить, настроен ли Stripe
 */
export const isStripeConfigured = (): boolean => {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
};

/**
 * Форматировать сумму для Stripe
 * Stripe работает с копейками (центами), поэтому 95€ = 9500
 */
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Форматировать сумму из Stripe в евро
 */
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};

/**
 * Получить Price IDs для месячных подписок
 *
 * НАСТРОЙКА:
 * 1. Создай 3 recurring products в Stripe Dashboard
 * 2. Добавь Price IDs в .env.local:
 *    STRIPE_PRICE_BASIC_MONTHLY=price_...
 *    STRIPE_PRICE_STANDARD_MONTHLY=price_...
 *    STRIPE_PRICE_PREMIUM_MONTHLY=price_...
 */
export const getSubscriptionPriceIds = () => {
  return {
    basic: process.env.STRIPE_PRICE_BASIC_MONTHLY || '',
    standard: process.env.STRIPE_PRICE_STANDARD_MONTHLY || '',
    premium: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || '',
  };
};

/**
 * Проверить, настроены ли все Price IDs для подписок
 */
export const areSubscriptionPricesConfigured = (): boolean => {
  const prices = getSubscriptionPriceIds();
  return !!(prices.basic && prices.standard && prices.premium);
};

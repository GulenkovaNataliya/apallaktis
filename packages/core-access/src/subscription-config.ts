/**
 * Subscription Configuration (data only)
 *
 * Тарифы и их ограничения:
 * - DEMO (48 часов): безлимит объектов, всё доступно, referral недоступен
 * - Basic (24,80€/мес): 10 объектов, 1 пользователь, без voice/photo
 * - Standard (49,60€/мес): 50 объектов, 2 пользователя, всё доступно
 * - Premium (93,00€/мес): Unlimited, всё доступно
 * - VIP: Unlimited, всё доступно, БЕЗ demo-периода
 *
 * VIP-специфика:
 * - VIP НЕ имеет demo 48 часов (сразу активная подписка)
 * - VIP может использовать реферальную программу
 * - Реферальные бонусы для VIP:
 *   • VIP навсегда (vip_expires_at = null) → бонус НЕ начисляется (некуда)
 *   • VIP до даты (vip_expires_at !== null) → +1 месяц к vip_expires_at
 *
 * Одинаково для ВСЕХ тарифов:
 * ✅ Экспорт PDF/Excel
 * ✅ Отправка на email
 * ✅ Финансовый анализ
 * ✅ Категории расходов
 * ✅ Способы оплаты
 * ✅ Общие расходы
 */

export type SubscriptionTier = 'demo' | 'basic' | 'standard' | 'premium' | 'vip' | 'expired' | 'read-only';

export interface SubscriptionLimits {
  maxObjects: number; // -1 = unlimited
  maxUsers: number;   // Максимум пользователей в команде
  voiceInput: boolean;
  photoReceipt: boolean;
  financialAnalysis: boolean;
  exportExcelPdf: boolean;
  emailReports: boolean;
  referralProgram: boolean;
}

// Определяем ограничения для каждого тарифа
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  demo: {
    maxObjects: -1,           // Безлимит
    maxUsers: 1,              // Только владелец
    voiceInput: true,         // ✅ Доступен
    photoReceipt: true,       // ✅ Доступен
    financialAnalysis: true,  // ✅ Доступен
    exportExcelPdf: true,     // ✅ Доступен
    emailReports: true,       // ✅ Доступен
    referralProgram: false,   // ❌ Только после покупки
  },
  basic: {
    maxObjects: 10,           // Максимум 10
    maxUsers: 1,              // Только владелец
    voiceInput: false,        // ❌ Недоступен (только Standard+)
    photoReceipt: false,      // ❌ Недоступен (только Standard+)
    financialAnalysis: true,  // ✅ Доступен
    exportExcelPdf: true,     // ✅ Доступен
    emailReports: true,       // ✅ Доступен
    referralProgram: true,    // ✅ Доступен
  },
  standard: {
    maxObjects: 50,           // Максимум 50
    maxUsers: 2,              // Владелец + 1 член
    voiceInput: true,         // ✅ Доступен
    photoReceipt: true,       // ✅ Доступен
    financialAnalysis: true,  // ✅ Доступен
    exportExcelPdf: true,     // ✅ Доступен
    emailReports: true,       // ✅ Доступен
    referralProgram: true,    // ✅ Доступен
  },
  premium: {
    maxObjects: -1,           // Безлимит
    maxUsers: -1,             // Безлимит
    voiceInput: true,         // ✅ Доступен
    photoReceipt: true,       // ✅ Доступен
    financialAnalysis: true,  // ✅ Доступен
    exportExcelPdf: true,     // ✅ Доступен
    emailReports: true,       // ✅ Доступен
    referralProgram: true,    // ✅ Доступен
  },
  vip: {
    maxObjects: -1,           // Безлимит
    maxUsers: -1,             // Безлимит
    voiceInput: true,         // ✅ Доступен
    photoReceipt: true,       // ✅ Доступен
    financialAnalysis: true,  // ✅ Доступен
    exportExcelPdf: true,     // ✅ Доступен
    emailReports: true,       // ✅ Доступен
    referralProgram: true,    // ✅ Доступен
  },
  expired: {
    maxObjects: 0,            // Нельзя создавать
    maxUsers: 0,              // Нельзя приглашать
    voiceInput: false,        // ❌ Недоступен
    photoReceipt: false,      // ❌ Недоступен
    financialAnalysis: false, // ❌ Недоступен
    exportExcelPdf: false,    // ❌ Недоступен
    emailReports: false,      // ❌ Недоступен
    referralProgram: false,   // ❌ Недоступен
  },
  'read-only': {
    maxObjects: 0,            // Нельзя создавать
    maxUsers: 0,              // Нельзя приглашать
    voiceInput: false,        // ❌ Недоступен
    photoReceipt: false,      // ❌ Недоступен
    financialAnalysis: true,  // ✅ Только просмотр
    exportExcelPdf: false,    // ❌ Недоступен
    emailReports: false,      // ❌ Недоступен
    referralProgram: false,   // ❌ Недоступен
  },
};

/**
 * Цены тарифов (με ΦΠΑ)
 */
export const SUBSCRIPTION_PRICES = {
  basic: '24,80€',
  standard: '49,60€',
  premium: '93,00€',
};

/**
 * Названия тарифов
 */
export const SUBSCRIPTION_NAMES = {
  demo: 'DEMO',
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium',
  vip: 'VIP',
};

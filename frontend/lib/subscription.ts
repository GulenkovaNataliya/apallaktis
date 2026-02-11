/**
 * Subscription Limits and Feature Access
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
 * Получить ограничения для тарифа
 */
export function getSubscriptionLimits(tier: SubscriptionTier): SubscriptionLimits {
  return SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.expired;
}

/**
 * Проверить, можно ли создать новый объект
 */
export function canCreateObject(tier: SubscriptionTier, currentObjectCount: number): {
  allowed: boolean;
  message?: string;
  upgradeToTier?: SubscriptionTier;
} {
  const limits = getSubscriptionLimits(tier);

  // Безлимит
  if (limits.maxObjects === -1) {
    return { allowed: true };
  }

  // Проверяем лимит
  if (currentObjectCount >= limits.maxObjects) {
    if (tier === 'basic') {
      return {
        allowed: false,
        message: 'objectLimitBasic', // "Вы достигли лимита 10 объектов"
        upgradeToTier: 'standard',
      };
    }
    if (tier === 'standard') {
      return {
        allowed: false,
        message: 'objectLimitStandard', // "Вы достигли лимита 50 объектов"
        upgradeToTier: 'premium',
      };
    }
    return {
      allowed: false,
      message: 'objectLimitGeneric',
    };
  }

  return { allowed: true };
}

/**
 * Проверить доступ к функции
 */
export function canUseFeature(
  tier: SubscriptionTier,
  feature: keyof SubscriptionLimits
): {
  allowed: boolean;
  message?: string;
  upgradeToTier?: SubscriptionTier;
} {
  const limits = getSubscriptionLimits(tier);

  // Проверяем числовые лимиты отдельно
  if (feature === 'maxObjects') {
    return { allowed: true }; // Используй canCreateObject для этого
  }

  const allowed = limits[feature] as boolean;

  if (!allowed) {
    // Определяем к какому тарифу нужно улучшить
    let upgradeToTier: SubscriptionTier = 'standard';
    let message = 'featureNotAvailable';

    if (tier === 'demo' && feature === 'referralProgram') {
      message = 'referralAfterPurchase';
      upgradeToTier = 'basic'; // Нужно купить аккаунт
    } else if (tier === 'basic') {
      message = 'upgradeToStandard';
      upgradeToTier = 'standard';
    }

    return { allowed: false, message, upgradeToTier };
  }

  return { allowed: true };
}

/**
 * Определить тариф пользователя по данным из БД
 */
export function getUserTier(profile: {
  subscription_status?: string;
  subscription_tier?: string;
  account_purchased?: boolean;
  demo_expires_at?: string;
  subscription_expires_at?: string;
  vip_expires_at?: string;
  first_month_free_expires_at?: string;
}): SubscriptionTier {
  // VIP имеет приоритет
  if (profile.subscription_status === 'vip' || profile.vip_expires_at) {
    const vipExpires = profile.vip_expires_at ? new Date(profile.vip_expires_at) : null;
    if (!vipExpires || vipExpires > new Date()) {
      return 'vip';
    }
  }

  // Проверяем статус подписки с выбранным планом
  if (profile.subscription_status === 'active' && profile.subscription_tier) {
    const tier = profile.subscription_tier.toLowerCase() as SubscriptionTier;
    if (['basic', 'standard', 'premium'].includes(tier)) {
      // Проверяем не истекла ли подписка
      if (profile.subscription_expires_at) {
        const expires = new Date(profile.subscription_expires_at);
        if (expires < new Date()) {
          return 'expired';
        }
      }
      return tier;
    }
  }

  // Бесплатный месяц после покупки аккаунта (plan ещё не выбран)
  if (profile.account_purchased && profile.first_month_free_expires_at) {
    const freeMonthExpires = new Date(profile.first_month_free_expires_at);
    if (freeMonthExpires > new Date()) {
      // Бесплатный месяц активен - даём полный доступ как Premium
      return 'premium';
    } else {
      // Бесплатный месяц истёк - нужно выбрать подписку
      return 'expired';
    }
  }

  // DEMO режим - определяется ТОЛЬКО по subscription_status и demo_expires_at
  if (profile.subscription_status === 'demo') {
    if (profile.demo_expires_at) {
      const demoExpires = new Date(profile.demo_expires_at);
      if (demoExpires < new Date()) {
        return 'read-only';
      }
    }
    return 'demo';
  }

  // Read-only или expired
  if (profile.subscription_status === 'read-only') {
    return 'read-only';
  }

  if (profile.subscription_status === 'expired') {
    return 'expired';
  }

  return 'demo';
}

/**
 * Проверить, можно ли добавить члена команды
 */
export function canAddTeamMember(tier: SubscriptionTier, currentMemberCount: number): {
  allowed: boolean;
  message?: string;
  upgradeToTier?: SubscriptionTier;
} {
  const limits = getSubscriptionLimits(tier);

  // Безлимит
  if (limits.maxUsers === -1) {
    return { allowed: true };
  }

  // Проверяем лимит
  if (currentMemberCount >= limits.maxUsers) {
    if (tier === 'basic' || tier === 'demo') {
      return {
        allowed: false,
        message: 'teamLimitBasic', // "План Basic поддерживает только 1 пользователя"
        upgradeToTier: 'standard',
      };
    }
    if (tier === 'standard') {
      return {
        allowed: false,
        message: 'teamLimitStandard', // "План Standard поддерживает до 2 пользователей"
        upgradeToTier: 'premium',
      };
    }
    return {
      allowed: false,
      message: 'teamLimitGeneric',
    };
  }

  return { allowed: true };
}

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

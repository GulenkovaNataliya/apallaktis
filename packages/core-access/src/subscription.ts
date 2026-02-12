/**
 * Subscription Engine
 *
 * Logic functions that operate on the config from subscription-config.ts.
 * All types and config constants are re-exported for convenience.
 */

export {
  type SubscriptionTier,
  type SubscriptionLimits,
  SUBSCRIPTION_LIMITS,
  SUBSCRIPTION_PRICES,
  SUBSCRIPTION_NAMES,
} from './subscription-config';

import {
  type SubscriptionTier,
  type SubscriptionLimits,
  SUBSCRIPTION_LIMITS,
} from './subscription-config';

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

import { SubscriptionPlan } from './user';

/**
 * Детальное описание тарифного плана
 */
export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: string; // "20€ + ΦΠΑ"
  priceMonthly: number; // 20 (для сравнения)
  description: string;
  features: string[];
  maxProjects: number | null; // null = unlimited
  maxTeamMembers: number; // 1 = только владелец, 3 = владелец + 2 member
  stripePriceId?: string; // Price ID для Stripe
  recommended?: boolean;
}

/**
 * Статистика активности пользователя
 * Используется для умной рекомендации
 */
export interface UserActivity {
  projectCount: number; // Количество проектов
  entryCount: number; // Количество записей (расходов)
  loginCount: number; // Количество входов за 30 дней
  ocrUsageCount: number; // Использование OCR
  voiceUsageCount: number; // Голосовой ввод
  lastActivityDate: string; // Дата последней активности
  accountAge: number; // Дней с момента регистрации
}

/**
 * Результат умной рекомендации
 */
export interface SmartRecommendation {
  recommendedPlan: SubscriptionPlan;
  reason: 'light' | 'medium' | 'heavy'; // Причина рекомендации
  activity: UserActivity;
  confidence: number; // 0-100, уверенность в рекомендации
}

/**
 * Полная информация о подписке пользователя
 */
export interface SubscriptionInfo {
  currentPlan: SubscriptionPlan;
  status: 'demo' | 'active' | 'expired' | 'vip' | 'read-only';
  expiresAt: string | null;
  bonusMonths: number; // Бонусные месяцы от реферальной программы
  nextPaymentDate: string | null;
  hasFreeMonth: boolean; // Первый месяц после покупки бесплатный
  freeMonthExpiresAt: string | null;
  daysRemaining: number; // Дней до окончания текущего периода
}

/**
 * Категория использования для рекомендации
 */
export type UsageCategory = 'light' | 'medium' | 'heavy';

/**
 * Критерии для определения категории использования
 */
export interface UsageCriteria {
  projectThreshold: {
    light: number; // До 5 проектов
    medium: number; // До 15 проектов
    heavy: number; // 15+ проектов
  };
  entryThreshold: {
    light: number; // До 100 записей
    medium: number; // До 500 записей
    heavy: number; // 500+ записей
  };
  loginThreshold: {
    light: number; // До 10 входов
    medium: number; // До 30 входов
    heavy: number; // 30+ входов
  };
}

/**
 * Константы критериев (можно настроить)
 */
export const DEFAULT_USAGE_CRITERIA: UsageCriteria = {
  projectThreshold: { light: 5, medium: 15, heavy: 15 },
  entryThreshold: { light: 100, medium: 500, heavy: 500 },
  loginThreshold: { light: 10, medium: 30, heavy: 30 },
};

/**
 * Тип плана без null (для использования в Record)
 */
type SubscriptionPlanKey = Exclude<SubscriptionPlan, null>;

/**
 * Детали всех тарифных планов
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanKey, PlanDetails> = {
  demo: {
    id: 'demo',
    name: 'DEMO',
    price: '0€',
    priceMonthly: 0,
    description: '48 часов бесплатного тестирования',
    features: [
      'До 3 проектов',
      'OCR сканирование',
      'Голосовой ввод',
      '48 часов',
    ],
    maxProjects: 3,
    maxTeamMembers: 1,
  },

  basic: {
    id: 'basic',
    name: 'Базовая',
    price: '20€ + ΦΠΑ',
    priceMonthly: 20,
    description: 'Для начинающих',
    features: [
      'До 10 проектов',
      'OCR сканирование чеков',
      'Голосовой ввод расходов',
      'Базовая аналитика',
      'Мобильное приложение',
    ],
    maxProjects: 10,
    maxTeamMembers: 1,
  },

  standard: {
    id: 'standard',
    name: 'Стандартная',
    price: '45€ + ΦΠΑ',
    priceMonthly: 45,
    description: 'Для профессионалов',
    features: [
      'До 50 проектов',
      'Приоритетная поддержка',
      'Расширенная аналитика',
      'OCR + голосовой ввод',
      'Экспорт данных (Excel, PDF)',
      'История изменений',
    ],
    maxProjects: 50,
    maxTeamMembers: 1,
    recommended: true,
  },

  premium: {
    id: 'premium',
    name: 'Премиум',
    price: '90€ + ΦΠΑ',
    priceMonthly: 90,
    description: 'Для команд',
    features: [
      'Неограниченные проекты',
      'Команда до 3 человек',
      'Приоритетная поддержка 24/7',
      'Расширенная аналитика',
      'Все возможности',
      'Персональный менеджер',
    ],
    maxProjects: null,
    maxTeamMembers: 3,
  },

  vip: {
    id: 'vip',
    name: 'VIP',
    price: 'Бесплатно',
    priceMonthly: 0,
    description: 'Специальный доступ',
    features: [
      'Все возможности Premium',
      'Персональный менеджер',
      'Индивидуальные настройки',
      'Приоритет в разработке',
    ],
    maxProjects: null,
    maxTeamMembers: -1, // unlimited
  },
};

/**
 * Вычисление рекомендованного тарифа на основе активности
 */
export function calculateSmartRecommendation(activity: UserActivity): SmartRecommendation {
  let recommendedPlan: SubscriptionPlan = 'basic';
  let reason: 'light' | 'medium' | 'heavy' = 'light';
  let confidence = 50;

  const criteria = DEFAULT_USAGE_CRITERIA;

  // Анализ количества проектов
  if (activity.projectCount <= criteria.projectThreshold.light) {
    recommendedPlan = 'basic';
    reason = 'light';
    confidence = 70;
  } else if (activity.projectCount <= criteria.projectThreshold.medium) {
    recommendedPlan = 'standard';
    reason = 'medium';
    confidence = 75;
  } else {
    recommendedPlan = 'premium';
    reason = 'heavy';
    confidence = 85;
  }

  // Анализ активности (входы)
  if (activity.loginCount > criteria.loginThreshold.heavy) {
    confidence += 10;
    if (recommendedPlan === 'basic') {
      recommendedPlan = 'standard';
      reason = 'medium';
    }
  }

  // Анализ использования расширенных функций
  if (activity.ocrUsageCount > 20 || activity.voiceUsageCount > 20) {
    confidence += 5;
    if (recommendedPlan === 'basic') {
      recommendedPlan = 'standard';
    }
  }

  // Анализ количества записей
  if (activity.entryCount > criteria.entryThreshold.heavy) {
    if (recommendedPlan !== 'premium') {
      recommendedPlan = 'premium';
      reason = 'heavy';
    }
    confidence += 10;
  }

  return {
    recommendedPlan,
    reason,
    activity,
    confidence: Math.min(confidence, 100),
  };
}

/**
 * Проверка, превышены ли лимиты текущего плана
 */
export function isLimitExceeded(
  plan: SubscriptionPlan,
  currentProjectCount: number
): boolean {
  if (!plan || plan === null) {
    return false; // нет плана = нет лимитов
  }

  const planDetails = SUBSCRIPTION_PLANS[plan as SubscriptionPlanKey];

  if (!planDetails || planDetails.maxProjects === null) {
    return false; // unlimited
  }

  return currentProjectCount >= planDetails.maxProjects;
}

/**
 * Проверка, нужно ли показать модальное окно выбора подписки
 */
export function shouldShowSubscriptionModal(subscriptionInfo: SubscriptionInfo): boolean {
  return subscriptionInfo.daysRemaining <= 1 && subscriptionInfo.daysRemaining >= 0;
}

/**
 * Проверка режима "только чтение"
 */
export function isReadOnlyMode(subscriptionInfo: SubscriptionInfo): boolean {
  return subscriptionInfo.status === 'read-only' || subscriptionInfo.daysRemaining < 0;
}

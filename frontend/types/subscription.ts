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

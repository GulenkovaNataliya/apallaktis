import {
  UserActivity,
  SmartRecommendation,
  UsageCategory,
  DEFAULT_USAGE_CRITERIA,
} from '@/types/subscription';
import { SubscriptionPlan } from '@/types/user';

/**
 * Анализирует активность пользователя и возвращает умную рекомендацию
 */
export function calculateSmartRecommendation(activity: UserActivity): SmartRecommendation {
  const category = determineUsageCategory(activity);
  const plan = categoryToPlan(category);
  const confidence = calculateConfidence(activity, category);

  return {
    recommendedPlan: plan,
    reason: category,
    activity,
    confidence,
  };
}

/**
 * Определяет категорию использования на основе статистики
 */
function determineUsageCategory(activity: UserActivity): UsageCategory {
  const criteria = DEFAULT_USAGE_CRITERIA;

  // Weighted scoring system
  let score = 0;

  // Projects (40% weight)
  if (activity.projectCount <= criteria.projectThreshold.light) {
    score += 0;
  } else if (activity.projectCount <= criteria.projectThreshold.medium) {
    score += 40;
  } else {
    score += 80;
  }

  // Entries (30% weight)
  if (activity.entryCount <= criteria.entryThreshold.light) {
    score += 0;
  } else if (activity.entryCount <= criteria.entryThreshold.medium) {
    score += 30;
  } else {
    score += 60;
  }

  // Logins (15% weight)
  if (activity.loginCount <= criteria.loginThreshold.light) {
    score += 0;
  } else if (activity.loginCount <= criteria.loginThreshold.medium) {
    score += 15;
  } else {
    score += 30;
  }

  // OCR and Voice usage (15% weight combined)
  const advancedFeatureScore = (activity.ocrUsageCount + activity.voiceUsageCount) / 10;
  score += Math.min(advancedFeatureScore, 15);

  // Categorize based on total score
  if (score < 40) {
    return 'light';
  } else if (score < 80) {
    return 'medium';
  } else {
    return 'heavy';
  }
}

/**
 * Конвертирует категорию использования в рекомендуемый план
 */
function categoryToPlan(category: UsageCategory): SubscriptionPlan {
  switch (category) {
    case 'light':
      return 'basic';
    case 'medium':
      return 'standard';
    case 'heavy':
      return 'premium';
  }
}

/**
 * Вычисляет уверенность в рекомендации (0-100)
 */
function calculateConfidence(activity: UserActivity, category: UsageCategory): number {
  const criteria = DEFAULT_USAGE_CRITERIA;

  // Check how clearly the user falls into a category
  const projectScore = getScoreForMetric(
    activity.projectCount,
    criteria.projectThreshold,
    category
  );
  const entryScore = getScoreForMetric(
    activity.entryCount,
    criteria.entryThreshold,
    category
  );
  const loginScore = getScoreForMetric(
    activity.loginCount,
    criteria.loginThreshold,
    category
  );

  // Average confidence
  const avgConfidence = (projectScore + entryScore + loginScore) / 3;

  // Account age bonus - more confidence for older accounts
  const ageBonus = Math.min(activity.accountAge / 30, 1) * 10; // Max +10 for 30+ days

  return Math.min(Math.round(avgConfidence + ageBonus), 100);
}

/**
 * Определяет уверенность для конкретной метрики
 */
function getScoreForMetric(
  value: number,
  thresholds: { light: number; medium: number; heavy: number },
  expectedCategory: UsageCategory
): number {
  if (expectedCategory === 'light') {
    if (value <= thresholds.light) {
      // Well within light category
      return 90;
    } else if (value <= thresholds.medium) {
      // Border case
      return 50;
    } else {
      // Contradicts recommendation
      return 30;
    }
  }

  if (expectedCategory === 'medium') {
    if (value > thresholds.light && value <= thresholds.medium) {
      // Well within medium category
      return 90;
    } else {
      // Border case
      return 50;
    }
  }

  if (expectedCategory === 'heavy') {
    if (value > thresholds.medium) {
      // Well within heavy category
      return 90;
    } else if (value > thresholds.light) {
      // Border case
      return 50;
    } else {
      // Contradicts recommendation
      return 30;
    }
  }

  return 50; // Default
}

/**
 * Получает статистику активности пользователя из БД
 * TODO: Implement actual database queries
 */
export async function getUserActivity(userId: string): Promise<UserActivity> {
  // TODO: Query Supabase for actual statistics
  // For now, return mock data
  return {
    projectCount: 3,
    entryCount: 45,
    loginCount: 8,
    ocrUsageCount: 0,
    voiceUsageCount: 0,
    lastActivityDate: new Date().toISOString(),
    accountAge: 15, // days
  };
}

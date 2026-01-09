/**
 * Модальное окно выбора подписки
 * Показывается за 2 дня до окончания бесплатного периода
 * НЕЛЬЗЯ ЗАКРЫТЬ БЕЗ ВЫБОРА!
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SUBSCRIPTION_PLANS, calculateSmartRecommendation } from '@/types/subscription';
import type { UserActivity, SmartRecommendation } from '@/types/subscription';
import type { SubscriptionPlan } from '@/types/user';
import type { Locale } from '@/lib/messages';

interface SubscriptionModalProps {
  isOpen: boolean;
  locale: Locale;
  translations: {
    title: string;
    yourStats: string;
    projects: string;
    entries: string;
    photos: string;
    voice: string;
    logins: string;
    recommended: string;
    whyRecommended: string;
    selectPlan: string;
    viewAllPlans: string;
    // Причины рекомендаций
    lightUsage: string;
    mediumUsage: string;
    heavyUsage: string;
  };
}

export default function SubscriptionModal({
  isOpen,
  locale,
  translations: t,
}: SubscriptionModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<SmartRecommendation | null>(null);
  const [showAllPlans, setShowAllPlans] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUserActivityAndRecommend();
    }
  }, [isOpen]);

  const fetchUserActivityAndRecommend = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // TODO: Получить реальную статистику пользователя из БД
      // Пока используем заглушку
      const activity: UserActivity = {
        projectCount: 5,
        entryCount: 120,
        loginCount: 15,
        ocrUsageCount: 8,
        voiceUsageCount: 3,
        lastActivityDate: new Date().toISOString(),
        accountAge: 28,
      };

      const smartRecommendation = calculateSmartRecommendation(activity);
      setRecommendation(smartRecommendation);
    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = async (planId: SubscriptionPlan) => {
    if (planId === 'demo' || planId === 'vip' || planId === null) {
      return;
    }

    // Redirect to subscription page to complete payment
    router.push(`/${locale}/subscription?plan=${planId}`);
  };

  const handleViewAllPlans = () => {
    setShowAllPlans(true);
  };

  if (!isOpen) return null;

  // Overlay - нельзя закрыть кликом вне модального окна
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(1, 49, 45, 0.95)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--polar)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          className="p-6 text-center"
          style={{
            backgroundColor: 'var(--deep-teal)',
            borderBottom: '3px solid #ff8f0a',
          }}
        >
          <h2 className="text-2xl font-bold" style={{ color: '#ff8f0a' }}>
            {t.title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-300"></div>
                <p style={{ color: 'var(--deep-teal)' }}>Анализируем вашу активность...</p>
              </div>
            </div>
          ) : recommendation ? (
            <>
              {/* User Statistics */}
              <div
                className="mb-6 p-4 rounded-lg"
                style={{
                  backgroundColor: 'rgba(1, 49, 45, 0.05)',
                  border: '1px solid rgba(1, 49, 45, 0.1)',
                }}
              >
                <p className="font-bold mb-3" style={{ color: 'var(--deep-teal)' }}>
                  {t.yourStats}
                </p>
                <div className="space-y-2 text-sm" style={{ color: 'var(--deep-teal)' }}>
                  <div className="flex justify-between">
                    <span>{t.projects}:</span>
                    <span className="font-bold">{recommendation.activity.projectCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.entries}:</span>
                    <span className="font-bold">{recommendation.activity.entryCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.logins}:</span>
                    <span className="font-bold">{recommendation.activity.loginCount}</span>
                  </div>
                  {recommendation.activity.ocrUsageCount > 0 && (
                    <div className="flex justify-between">
                      <span>{t.photos}:</span>
                      <span className="font-bold">{recommendation.activity.ocrUsageCount}</span>
                    </div>
                  )}
                  {recommendation.activity.voiceUsageCount > 0 && (
                    <div className="flex justify-between">
                      <span>{t.voice}:</span>
                      <span className="font-bold">{recommendation.activity.voiceUsageCount}</span>
                    </div>
                  )}
                </div>
              </div>

              {!showAllPlans ? (
                <>
                  {/* Recommended Plan */}
                  <div
                    className="mb-6 p-6 rounded-lg text-center"
                    style={{
                      backgroundColor: 'rgba(255, 143, 10, 0.1)',
                      border: '2px solid #ff8f0a',
                    }}
                  >
                    <div className="mb-3">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-sm font-bold"
                        style={{
                          backgroundColor: '#ff8f0a',
                          color: 'white',
                        }}
                      >
                        {t.recommended}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--deep-teal)' }}>
                      {recommendation.recommendedPlan && SUBSCRIPTION_PLANS[recommendation.recommendedPlan as keyof typeof SUBSCRIPTION_PLANS]?.name}
                    </h3>

                    <p className="text-3xl font-bold mb-4" style={{ color: '#ff8f0a' }}>
                      {recommendation.recommendedPlan && SUBSCRIPTION_PLANS[recommendation.recommendedPlan as keyof typeof SUBSCRIPTION_PLANS]?.price}
                    </p>

                    <p className="text-sm mb-4" style={{ color: 'var(--deep-teal)', opacity: 0.8 }}>
                      {recommendation.recommendedPlan && SUBSCRIPTION_PLANS[recommendation.recommendedPlan as keyof typeof SUBSCRIPTION_PLANS]?.description}
                    </p>

                    {/* Features */}
                    <ul className="text-left text-sm mb-4 space-y-2" style={{ color: 'var(--deep-teal)' }}>
                      {recommendation.recommendedPlan && SUBSCRIPTION_PLANS[recommendation.recommendedPlan as keyof typeof SUBSCRIPTION_PLANS]?.features.map((feature, index) => (
                        <li key={index}>✓ {feature}</li>
                      ))}
                    </ul>

                    {/* Why recommended */}
                    <div
                      className="p-3 rounded-lg mb-4 text-sm"
                      style={{
                        backgroundColor: 'rgba(1, 49, 45, 0.05)',
                      }}
                    >
                      <p className="font-bold mb-1" style={{ color: 'var(--deep-teal)' }}>
                        {t.whyRecommended}
                      </p>
                      <p style={{ color: 'var(--deep-teal)', opacity: 0.8 }}>
                        {recommendation.reason === 'light' && t.lightUsage}
                        {recommendation.reason === 'medium' && t.mediumUsage}
                        {recommendation.reason === 'heavy' && t.heavyUsage}
                      </p>
                    </div>

                    {/* Select Button */}
                    <button
                      onClick={() => handleSelectPlan(recommendation.recommendedPlan)}
                      className="w-full mb-3"
                      style={{
                        minHeight: '52px',
                        borderRadius: '1rem',
                        backgroundColor: 'var(--deep-teal)',
                        color: 'var(--polar)',
                        boxShadow: '0 4px 8px var(--deep-teal)',
                        fontWeight: 'bold',
                        fontSize: '16px',
                      }}
                    >
                      {t.selectPlan}
                    </button>

                    {/* View All Plans */}
                    <button
                      onClick={handleViewAllPlans}
                      className="w-full text-sm"
                      style={{
                        minHeight: '44px',
                        borderRadius: '1rem',
                        backgroundColor: 'transparent',
                        color: 'var(--deep-teal)',
                        border: '2px solid var(--deep-teal)',
                        fontWeight: 'bold',
                      }}
                    >
                      {t.viewAllPlans}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* All Plans */}
                  <div className="space-y-4 mb-4">
                    {Object.values(SUBSCRIPTION_PLANS)
                      .filter(plan => plan.id !== 'demo' && plan.id !== 'vip')
                      .map(plan => (
                        <div
                          key={plan.id}
                          className="p-4 rounded-lg cursor-pointer transition-all"
                          style={{
                            border: plan.id === recommendation.recommendedPlan
                              ? '2px solid #ff8f0a'
                              : '1px solid rgba(1, 49, 45, 0.2)',
                            backgroundColor: plan.id === recommendation.recommendedPlan
                              ? 'rgba(255, 143, 10, 0.05)'
                              : 'transparent',
                          }}
                          onClick={() => handleSelectPlan(plan.id)}
                        >
                          {plan.id === recommendation.recommendedPlan && (
                            <span
                              className="inline-block px-2 py-1 rounded text-xs font-bold mb-2"
                              style={{ backgroundColor: '#ff8f0a', color: 'white' }}
                            >
                              {t.recommended}
                            </span>
                          )}
                          <h4 className="font-bold text-lg mb-1" style={{ color: 'var(--deep-teal)' }}>
                            {plan.name}
                          </h4>
                          <p className="text-xl font-bold mb-2" style={{ color: '#ff8f0a' }}>
                            {plan.price}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.8 }}>
                            {plan.description}
                          </p>
                        </div>
                      ))}
                  </div>

                  {/* Back Button */}
                  <button
                    onClick={() => setShowAllPlans(false)}
                    className="w-full text-sm"
                    style={{
                      minHeight: '44px',
                      borderRadius: '1rem',
                      backgroundColor: 'transparent',
                      color: 'var(--deep-teal)',
                      border: '2px solid var(--deep-teal)',
                    }}
                  >
                    ← Назад к рекомендации
                  </button>
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

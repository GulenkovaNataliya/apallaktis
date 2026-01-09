/**
 * Hook для автоматического показа модального окна выбора подписки
 * Показывается за 2 дня до окончания бесплатного периода
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { shouldShowSubscriptionModal } from '@/types/subscription';
import type { SubscriptionInfo } from '@/types/subscription';

export function useSubscriptionModal() {
  const [shouldShow, setShouldShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      // Получаем профиль пользователя
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        console.error('Error fetching profile:', error);
        setIsLoading(false);
        return;
      }

      // Рассчитываем дни до окончания бесплатного периода
      let daysRemaining = 0;
      let expiresAt: string | null = null;

      if (profile.first_month_free_expires_at) {
        const expires = new Date(profile.first_month_free_expires_at);
        const now = new Date();
        daysRemaining = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        expiresAt = profile.first_month_free_expires_at;
      } else if (profile.subscription_expires_at) {
        const expires = new Date(profile.subscription_expires_at);
        const now = new Date();
        daysRemaining = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        expiresAt = profile.subscription_expires_at;
      }

      const info: SubscriptionInfo = {
        currentPlan: profile.subscription_plan,
        status: profile.subscription_status || 'demo',
        expiresAt,
        bonusMonths: profile.bonus_months || 0,
        nextPaymentDate: profile.subscription_expires_at,
        hasFreeMonth: profile.account_purchased && !profile.subscription_plan,
        freeMonthExpiresAt: profile.first_month_free_expires_at,
        daysRemaining,
      };

      setSubscriptionInfo(info);

      // Показываем модальное окно если:
      // 1. Осталось 2 дня или меньше (но не отрицательное)
      // 2. Подписка ещё не выбрана
      // 3. Аккаунт куплен (не DEMO)
      const shouldShowModal =
        profile.account_purchased &&
        !profile.subscription_plan &&
        daysRemaining >= 0 &&
        daysRemaining <= 2;

      setShouldShow(shouldShowModal);

    } catch (error) {
      console.error('Error in checkSubscriptionStatus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    shouldShow,
    isLoading,
    subscriptionInfo,
    refresh: checkSubscriptionStatus,
  };
}

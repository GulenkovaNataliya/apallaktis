'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BackgroundPage from '@/components/BackgroundPage';
import SubscriptionPlanCard from '@/components/SubscriptionPlanCard';
import { messages, type Locale } from '@/lib/messages';
import { createClient } from '@/lib/supabase/client';
import { PlanDetails } from '@/types/subscription';
import { SubscriptionPlan } from '@/types/user';

export default function SubscriptionPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || 'el';
  const t = (messages[locale] as any)?.subscription || (messages.el as any)?.subscription || {};

  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(null);
  const [bonusMonths, setBonusMonths] = useState(0);
  const [recommendedPlan, setRecommendedPlan] = useState<SubscriptionPlan>('basic');
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 3 тарифных плана (VIP removed)
  const plans: PlanDetails[] = [
    {
      id: 'basic',
      name: t.basic.name,
      price: t.basic.price,
      priceMonthly: 24.80,
      features: t.basic.features,
      maxProjects: 10,
      maxTeamMembers: 1,
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
    },
    {
      id: 'standard',
      name: t.standard.name,
      price: t.standard.price,
      priceMonthly: 49.60,
      features: t.standard.features,
      maxProjects: 50,
      maxTeamMembers: 2,
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID,
    },
    {
      id: 'premium',
      name: t.premium.name,
      price: t.premium.price,
      priceMonthly: 93.00,
      features: t.premium.features,
      maxProjects: null,
      maxTeamMembers: -1, // unlimited
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push(`/${locale}/login`);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_plan, bonus_months, first_month_free_expires_at')
          .eq('id', user.id)
          .single();

        if (profile) {
          setCurrentPlan(profile.subscription_plan);
          setBonusMonths(profile.bonus_months || 0);

          // Calculate days remaining in free month
          if (profile.first_month_free_expires_at) {
            const expiresAt = new Date(profile.first_month_free_expires_at);
            const now = new Date();
            const diff = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            setDaysRemaining(diff > 0 ? diff : 0);
          }

          // TODO: Fetch user activity stats and calculate smart recommendation
          // For now, use basic as default
          setRecommendedPlan('basic');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [locale, router]);

  const handleSelectPlan = async (planId: SubscriptionPlan) => {
    // Находим выбранный план
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan || !selectedPlan.stripePriceId) {
      alert('Price ID not configured for this plan');
      return;
    }

    try {
      setIsLoading(true);

      // Call API to create Stripe Subscription Checkout Session
      const response = await fetch('/api/stripe/subscription-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPlan.stripePriceId,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Error selecting plan:', error);
      alert(error.message || 'Failed to start checkout process');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <BackgroundPage pageIndex={8}>
        <div className="min-h-screen flex items-center justify-center">
          <p style={{ color: 'var(--polar)' }}>Loading...</p>
        </div>
      </BackgroundPage>
    );
  }

  return (
    <BackgroundPage pageIndex={8}>
      <div className="flex flex-col items-center gap-12" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px', paddingBottom: '120px' }}>

          {/* Back - law: <p> element at top */}
          <p
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="text-button cursor-pointer w-full"
            style={{ color: 'var(--polar)' }}
          >
{messages[locale]?.purchaseAccount?.backToDashboard || '← Back'}
          </p>

          {/* Header - Beautiful non-clickable button style */}
          <div
            className="w-full text-button flex items-center justify-center text-center"
            style={{
              minHeight: '52px',
              borderRadius: '1rem',
              backgroundColor: 'var(--deep-teal)',
              color: '#ff8f0a',
              boxShadow: '0 4px 8px #ff8f0a',
            }}
          >
            {t.title}
          </div>

          {/* Free Month Remaining */}
          {daysRemaining !== null && daysRemaining > 0 && (
            <div
              className="w-full p-4 rounded-lg text-center"
              style={{
                backgroundColor: 'rgba(255, 143, 10, 0.15)',
                border: '2px solid #ff8f0a',
              }}
            >
              <p className="font-bold" style={{ color: '#ff8f0a' }}>
                {t.freeMonthRemaining.replace('{days}', daysRemaining.toString())}
              </p>
            </div>
          )}

          {/* Bonus Months */}
          {bonusMonths > 0 && (
            <div
              className="w-full p-4 rounded-lg text-center"
              style={{
                backgroundColor: 'rgba(176, 255, 209, 0.2)',
                border: '2px solid var(--zanah)',
              }}
            >
              <p className="font-bold text-lg" style={{ color: 'var(--deep-teal)' }}>
                {bonusMonths === 1
                  ? t.bonusMonths.title.replace('{count}', bonusMonths.toString())
                  : t.bonusMonths.titlePlural.replace('{count}', bonusMonths.toString())}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--deep-teal)', opacity: 0.8 }}>
                {t.bonusMonths.description}
              </p>
            </div>
          )}


          {/* Plan Cards - Vertical Layout (Full Width) */}
          {plans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              isRecommended={plan.id === recommendedPlan}
              isCurrent={plan.id === currentPlan}
              onSelect={() => handleSelectPlan(plan.id)}
              locale={locale}
              translations={{
                selectPlan: t.selectPlan,
                currentPlan: t.currentPlan,
                recommended: t.recommended,
                monthly: t.monthly,
              }}
            />
          ))}

      </div>
    </BackgroundPage>
  );
}

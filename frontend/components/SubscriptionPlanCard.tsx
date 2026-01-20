'use client';

import { PlanDetails } from '@/types/subscription';

interface SubscriptionPlanCardProps {
  plan: PlanDetails;
  isRecommended?: boolean;
  isCurrent?: boolean;
  onSelect: () => void;
  locale: string;
  translations: {
    selectPlan: string;
    currentPlan: string;
    recommended: string;
    monthly: string;
  };
}

export default function SubscriptionPlanCard({
  plan,
  isRecommended = false,
  isCurrent = false,
  onSelect,
  locale,
  translations,
}: SubscriptionPlanCardProps) {
  return (
    <div
      className="relative transition-all duration-300 flex flex-col"
      style={{
        backgroundColor: 'var(--polar)',
        border: isRecommended
          ? '3px solid #ff8f0a'
          : isCurrent
          ? '3px solid var(--zanah)'
          : '2px solid rgba(1, 49, 45, 0.1)',
        boxShadow: isRecommended
          ? '0 8px 24px rgba(255, 143, 10, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.2)',
        borderRadius: '1rem',
        minHeight: '192px',
        width: '100%',
        padding: '1rem',
      }}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold"
          style={{
            backgroundColor: '#ff8f0a',
            color: 'white',
            boxShadow: '0 4px 8px rgba(255, 143, 10, 0.4)',
          }}
        >
          {translations.recommended}
        </div>
      )}

      {/* Plan Name and Price - Horizontal */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-lg font-bold"
          style={{ color: 'var(--orange)' }}
        >
          {plan.name}
        </h3>
        <div className="text-right">
          <span
            className="text-xl font-bold"
            style={{ color: 'var(--orange)' }}
          >
            {plan.price}
          </span>
          <span
            className="text-xs ml-1"
            style={{ color: 'var(--deep-teal)', opacity: 0.7 }}
          >
            {translations.monthly}
          </span>
        </div>
      </div>

      {/* Description */}
      <p
        className="text-button mb-3"
        style={{ color: 'var(--deep-teal)' }}
      >
        {plan.description}
      </p>

      {/* Features */}
      <ul className="space-y-2 mb-3 flex-1">
        {plan.features.map((feature, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm"
            style={{ color: 'var(--deep-teal)' }}
          >
            {/* Checkmark Icon */}
            <span
              className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: 'var(--zanah)',
                color: 'var(--deep-teal)',
              }}
            >
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* 3D Button - Compact */}
      <button
        onClick={onSelect}
        disabled={isCurrent}
        className="w-full font-bold text-sm transition-all duration-200"
        style={{
          borderRadius: '1rem',
          minHeight: '48px',
          padding: '0.75rem 1rem',
          backgroundColor: isCurrent
            ? '#cccccc'
            : isRecommended
            ? '#ff8f0a'
            : 'var(--zanah)',
          color: isCurrent
            ? '#666666'
            : isRecommended
            ? 'white'
            : 'var(--deep-teal)',
          boxShadow: isCurrent
            ? 'none'
            : isRecommended
            ? '0 4px 0 #cc7208, 0 6px 12px rgba(255, 143, 10, 0.3)'
            : '0 4px 0 rgba(1, 49, 45, 0.3), 0 6px 12px rgba(1, 49, 45, 0.2)',
          transform: 'translateY(0)',
          cursor: isCurrent ? 'not-allowed' : 'pointer',
        }}
        onMouseDown={(e) => {
          if (!isCurrent) {
            e.currentTarget.style.transform = 'translateY(3px)';
            e.currentTarget.style.boxShadow = isRecommended
              ? '0 1px 0 #cc7208, 0 3px 6px rgba(255, 143, 10, 0.2)'
              : '0 1px 0 rgba(1, 49, 45, 0.3), 0 3px 6px rgba(1, 49, 45, 0.1)';
          }
        }}
        onMouseUp={(e) => {
          if (!isCurrent) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = isRecommended
              ? '0 4px 0 #cc7208, 0 6px 12px rgba(255, 143, 10, 0.3)'
              : '0 4px 0 rgba(1, 49, 45, 0.3), 0 6px 12px rgba(1, 49, 45, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isCurrent) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = isRecommended
              ? '0 4px 0 #cc7208, 0 6px 12px rgba(255, 143, 10, 0.3)'
              : '0 4px 0 rgba(1, 49, 45, 0.3), 0 6px 12px rgba(1, 49, 45, 0.2)';
          }
        }}
        onMouseEnter={(e) => {
          if (!isCurrent) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = isRecommended
              ? '0 6px 0 #cc7208, 0 8px 16px rgba(255, 143, 10, 0.4)'
              : '0 6px 0 rgba(1, 49, 45, 0.3), 0 8px 16px rgba(1, 49, 45, 0.3)';
          }
        }}
      >
        {isCurrent ? translations.currentPlan : translations.selectPlan}
      </button>
    </div>
  );
}

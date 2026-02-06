'use client';

import { PLAN_DETAILS, PlanType } from '@/lib/stripe/config';

interface PricingCardProps {
  planType: PlanType;
  currentPlan?: PlanType;
  onUpgrade?: (planType: PlanType, priceId: string) => void;
  loading?: boolean;
}

export default function PricingCard({
  planType,
  currentPlan = 'free',
  onUpgrade,
  loading = false,
}: PricingCardProps) {
  const plan = PLAN_DETAILS[planType];
  const isCurrentPlan = currentPlan === planType;
  const isDowngrade = 
    (currentPlan === 'pro' && planType !== 'pro') ||
    (currentPlan === 'basic' && planType === 'free');

  const handleClick = () => {
    if (plan.priceId && onUpgrade && !isCurrentPlan && !isDowngrade) {
      onUpgrade(planType, plan.priceId);
    }
  };

  return (
    <div
      className={`rounded-lg border-2 p-6 transition-all ${
        isCurrentPlan
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
      }`}
    >
      {/* Plan Name */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
        {isCurrentPlan && (
          <span className="mt-2 inline-block rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
            Current Plan
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-gray-900">
            ${plan.price}
          </span>
          {plan.price > 0 && (
            <span className="ml-2 text-gray-500">/month</span>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="mb-6 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="mr-2 h-5 w-5 flex-shrink-0 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {planType !== 'free' && (
        <button
          onClick={handleClick}
          disabled={loading || isCurrentPlan || isDowngrade}
          className={`w-full rounded-lg px-4 py-3 font-semibold transition-colors ${
            isCurrentPlan
              ? 'cursor-default bg-gray-300 text-gray-600'
              : isDowngrade
              ? 'cursor-not-allowed bg-gray-200 text-gray-500'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${loading ? 'cursor-wait opacity-50' : ''}`}
        >
          {loading
            ? 'Processing...'
            : isCurrentPlan
            ? 'Current Plan'
            : isDowngrade
            ? 'Contact Support'
            : `Upgrade to ${plan.name}`}
        </button>
      )}

      {planType === 'free' && !isCurrentPlan && (
        <p className="text-center text-sm text-gray-500">
          Contact support to downgrade
        </p>
      )}
    </div>
  );
}

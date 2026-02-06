#!/bin/bash

# This script creates all the remaining Stripe integration files
# Run from the python-tutor directory: bash create-stripe-files.sh

echo "Creating Stripe integration files..."

# Create PricingCard component
cat > components/pricing/PricingCard.tsx << 'PRICING_CARD_EOF'
'use client';

import { useState } from 'react';
import { PLAN_DETAILS, PlanType } from '@/lib/stripe/stripe';

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
PRICING_CARD_EOF

echo "✓ Created PricingCard.tsx"

# Create pricing page
cat > app/pricing/page.tsx << 'PRICING_PAGE_EOF'
import PricingSection from '@/components/pricing/PricingSection';

export const metadata = {
  title: 'Pricing - Python Ninja',
  description: 'Choose the perfect plan for your Python learning journey',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PricingSection />
    </div>
  );
}
PRICING_PAGE_EOF

echo "✓ Created pricing page.tsx"

# Create check config utility
cat > lib/stripe/check-config.ts << 'CHECK_CONFIG_EOF'
// Utility to check if Stripe is properly configured

export function checkStripeConfig(): {
  isConfigured: boolean;
  missingVars: string[];
  warnings: string[];
} {
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_PRICE_ID_BASIC',
    'STRIPE_PRICE_ID_PRO',
  ];

  const optionalVars = [
    'STRIPE_WEBHOOK_SECRET', // Only required in production
  ];

  const missingVars: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Check optional variables
  optionalVars.forEach((varName) => {
    if (!process.env[varName]) {
      warnings.push(\`\${varName} is not set (optional for local dev with Stripe CLI)\`);
    }
  });

  // Validate key formats
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    warnings.push('STRIPE_SECRET_KEY should start with sk_test_ or sk_live_');
  }

  if (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')
  ) {
    warnings.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should start with pk_test_ or pk_live_');
  }

  if (
    process.env.STRIPE_WEBHOOK_SECRET &&
    !process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')
  ) {
    warnings.push('STRIPE_WEBHOOK_SECRET should start with whsec_');
  }

  // Check if in test or live mode
  if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
    warnings.push('Using TEST mode - real payments will not be processed');
  } else if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
    warnings.push('Using LIVE mode - real payments WILL be processed');
  }

  return {
    isConfigured: missingVars.length === 0,
    missingVars,
    warnings,
  };
}

// Log configuration status (useful for debugging)
export function logStripeConfig() {
  const { isConfigured, missingVars, warnings } = checkStripeConfig();

  console.log('🔧 Stripe Configuration Check:');

  if (isConfigured) {
    console.log('✅ Stripe is properly configured');
  } else {
    console.log('❌ Stripe configuration incomplete');
    console.log('Missing variables:', missingVars.join(', '));
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach((warning) => console.log(\`   - \${warning}\`));
  }

  return isConfigured;
}
CHECK_CONFIG_EOF

echo "✓ Created check-config.ts"

echo ""
echo "✅ All component files created!"
echo ""
echo "Due to file size, you still need to create:"
echo "  - components/pricing/PricingSection.tsx"
echo "  - components/pricing/SubscriptionManager.tsx"
echo "  - All documentation files (STRIPE_*.md)"
echo ""
echo "I'll provide these in the next message."

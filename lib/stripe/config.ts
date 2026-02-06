// Stripe configuration - Safe for client-side imports
// This file contains only types and constants, no server-side code

// Price IDs from environment variables
export const STRIPE_PRICES = {
  BASIC_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC || process.env.STRIPE_PRICE_ID_BASIC || '',
  PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || process.env.STRIPE_PRICE_ID_PRO || '',
} as const;

// Plan details for display
export const PLAN_DETAILS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '5 AI tutoring sessions',
      'Basic Python lessons',
      'Code execution in browser',
      'Progress tracking',
    ],
    limits: {
      aiRequests: 5,
      projectSize: '1MB',
    },
  },
  basic: {
    name: 'Basic',
    price: 9.99,
    priceId: STRIPE_PRICES.BASIC_MONTHLY,
    features: [
      '100 AI tutoring sessions/month',
      'All Python lessons',
      'Code execution in browser',
      'Progress tracking',
      'Priority support',
      'Downloadable code templates',
    ],
    limits: {
      aiRequests: 100,
      projectSize: '10MB',
    },
  },
  pro: {
    name: 'Pro',
    price: 19.99,
    priceId: STRIPE_PRICES.PRO_MONTHLY,
    features: [
      'Unlimited AI tutoring',
      'All Python lessons',
      'Advanced projects',
      'Code execution in browser',
      'Progress tracking',
      'Priority support',
      'Downloadable code templates',
      '1-on-1 video sessions',
      'Career guidance',
    ],
    limits: {
      aiRequests: -1, // unlimited
      projectSize: '100MB',
    },
  },
} as const;

export type PlanType = keyof typeof PLAN_DETAILS;

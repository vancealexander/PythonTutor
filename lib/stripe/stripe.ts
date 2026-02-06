// Real Stripe Integration - SERVER SIDE ONLY
// Do not import this file in client components!
// Use @/lib/stripe/config instead for types and constants

import Stripe from 'stripe';

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

// Re-export types and constants from config for convenience
export { STRIPE_PRICES, PLAN_DETAILS, type PlanType } from './config';

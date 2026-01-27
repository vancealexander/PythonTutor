// Real Stripe Integration - SERVER SIDE ONLY
// Do not import this file in client components!
// Use @/lib/stripe/config instead for types and constants

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Re-export types and constants from config for convenience
export { STRIPE_PRICES, PLAN_DETAILS, type PlanType } from './config';

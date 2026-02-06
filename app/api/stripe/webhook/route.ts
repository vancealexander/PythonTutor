// Stripe webhook handler to process subscription events
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/stripe';
import { createClient } from '@supabase/supabase-js';
import { mockDb } from '@/lib/db/mock-db';

// Check if using mock mode
const USE_MOCK_DB = !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabase = !USE_MOCK_DB ? createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
) : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    // Verify webhook signature (skip in development without webhook secret)
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          webhookSecret
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Webhook signature verification failed:', message);
        return NextResponse.json(
          { error: `Webhook Error: ${message}` },
          { status: 400 }
        );
      }
    } else {
      // For local testing without webhook secret
      console.warn('⚠️ Webhook secret not configured - skipping signature verification');
      event = JSON.parse(body) as Stripe.Event;
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType;

  if (!userId || !planType) {
    console.error('Missing userId or planType in session metadata');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  if (USE_MOCK_DB) {
    // Mock database mode
    mockDb.createOrUpdateSubscription({
      userId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      status: subscription.status,
      planType: planType as 'basic' | 'pro',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } else {
    // Real Supabase mode
    await supabase!
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0].price.id,
        status: subscription.status,
        plan_type: planType,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      });
  }

  console.log(`✅ Subscription created for user ${userId}: ${planType}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Determine plan type from price ID
  const priceId = subscription.items.data[0].price.id;
  let planType: 'free' | 'basic' | 'pro' = 'free';
  if (priceId === process.env.STRIPE_PRICE_ID_BASIC || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC) {
    planType = 'basic';
  } else if (priceId === process.env.STRIPE_PRICE_ID_PRO || priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO) {
    planType = 'pro';
  }

  if (USE_MOCK_DB) {
    // Mock database mode
    const existingSub = mockDb.getSubscriptionByStripeId(subscription.id);
    if (!existingSub) {
      console.error(`Subscription not found: ${subscription.id}`);
      return;
    }

    mockDb.createOrUpdateSubscription({
      userId: existingSub.userId,
      stripeCustomerId: existingSub.stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      status: subscription.status,
      planType: planType === 'free' ? 'basic' : planType,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } else {
    // Real Supabase mode
    const { data: subData } = await supabase!
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (!subData) {
      console.error(`Subscription not found: ${subscription.id}`);
      return;
    }

    await supabase!
      .from('user_subscriptions')
      .update({
        status: subscription.status,
        plan_type: planType,
        stripe_price_id: priceId,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('stripe_subscription_id', subscription.id);
  }

  console.log(`✅ Subscription updated: ${subscription.id} -> ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  if (USE_MOCK_DB) {
    // Mock database mode
    const existingSub = mockDb.getSubscriptionByStripeId(subscription.id);
    if (existingSub) {
      mockDb.deleteSubscription(existingSub.userId);
    }
  } else {
    // Real Supabase mode - downgrade user to free plan
    await supabase!
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        plan_type: 'free',
        cancel_at_period_end: false,
      })
      .eq('stripe_subscription_id', subscription.id);
  }

  console.log(`✅ Subscription canceled: ${subscription.id}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  if (USE_MOCK_DB) {
    // Mock database mode
    const subscription = mockDb.getSubscriptionByStripeId(invoice.subscription as string);
    if (subscription) {
      mockDb.createOrUpdateSubscription({
        ...subscription,
        status: 'active',
      });
    }
  } else {
    // Real Supabase mode - mark subscription as active
    await supabase!
      .from('user_subscriptions')
      .update({
        status: 'active',
      })
      .eq('stripe_subscription_id', invoice.subscription as string);
  }

  console.log(`✅ Payment succeeded for subscription: ${invoice.subscription}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  if (USE_MOCK_DB) {
    // Mock database mode
    const subscription = mockDb.getSubscriptionByStripeId(invoice.subscription as string);
    if (subscription) {
      mockDb.createOrUpdateSubscription({
        ...subscription,
        status: 'past_due',
      });
    }
  } else {
    // Real Supabase mode - mark subscription as past_due
    await supabase!
      .from('user_subscriptions')
      .update({
        status: 'past_due',
      })
      .eq('stripe_subscription_id', invoice.subscription as string);
  }

  console.log(`⚠️ Payment failed for subscription: ${invoice.subscription}`);
}

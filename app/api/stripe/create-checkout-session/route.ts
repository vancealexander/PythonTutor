// API endpoint to create a Stripe checkout session
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { stripe } from '@/lib/stripe/stripe';
import { createClient } from '@supabase/supabase-js';
import { mockDb } from '@/lib/db/mock-db';
import { authOptions } from '@/lib/auth/auth-options';

// Check if using mock mode
const USE_MOCK_DB = !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabase = !USE_MOCK_DB ? createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
) : null;

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const { priceId, planType } = await req.json();

    if (!priceId || !planType) {
      return NextResponse.json(
        { error: 'Missing priceId or planType' },
        { status: 400 }
      );
    }

    let userId: string;
    let customerId: string | undefined;

    if (USE_MOCK_DB) {
      // Mock database mode
      const user = mockDb.getUserByEmail(session.user.email);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      userId = user.id;

      // Get existing customer ID from mock subscription
      const subscription = mockDb.getSubscription(userId);
      customerId = subscription?.stripeCustomerId;
    } else {
      // Real Supabase mode
      const { data: userData } = await supabase!
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (!userData) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      userId = userData.id;

      // Check if user already has a Stripe customer ID
      const { data: subscription } = await supabase!
        .from('user_subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userData.id)
        .single();

      customerId = subscription?.stripe_customer_id;
    }

    // Create Stripe customer if they don't have one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      if (USE_MOCK_DB) {
        mockDb.updateSubscription(userId, {
          userId: userId,
          stripeCustomerId: customerId,
          status: 'free',
          planType: 'free',
        });
      } else {
        await supabase!
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            status: 'free',
            plan_type: 'free',
          });
      }
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${req.nextUrl.origin}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        planType,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

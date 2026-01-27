// API endpoint to manage user subscriptions (cancel, retrieve)
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

// GET - Retrieve current subscription
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (USE_MOCK_DB) {
      // Mock database mode
      const user = mockDb.getUserByEmail(session.user.email);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const subscription = mockDb.getSubscription(user.id);
      if (!subscription) {
        return NextResponse.json({
          status: 'free',
          plan_type: 'free',
        });
      }

      return NextResponse.json({
        status: subscription.status,
        plan_type: subscription.planType,
        stripe_customer_id: subscription.stripeCustomerId,
        stripe_subscription_id: subscription.stripeSubscriptionId,
      });
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

      const { data: subscription } = await supabase!
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (!subscription) {
        return NextResponse.json({
          status: 'free',
          plan_type: 'free',
        });
      }

      return NextResponse.json(subscription);
    }
  } catch (error: any) {
    console.error('Error retrieving subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Cancel subscription
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await req.json();

    if (action !== 'cancel') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    if (USE_MOCK_DB) {
      // Mock database mode
      const user = mockDb.getUserByEmail(session.user.email);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const subscription = mockDb.getSubscription(user.id);
      if (!subscription?.stripeSubscriptionId) {
        return NextResponse.json(
          { error: 'No active subscription found' },
          { status: 404 }
        );
      }

      // Cancel subscription at period end
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      return NextResponse.json({
        message: 'Subscription will be canceled at the end of the billing period',
        success: true,
      });
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

      const { data: subscription } = await supabase!
        .from('user_subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', userData.id)
        .single();

      if (!subscription?.stripe_subscription_id) {
        return NextResponse.json(
          { error: 'No active subscription found' },
          { status: 404 }
        );
      }

      // Cancel subscription at period end
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      // Update database
      await supabase!
        .from('user_subscriptions')
        .update({
          cancel_at_period_end: true,
        })
        .eq('user_id', userData.id);

      return NextResponse.json({
        message: 'Subscription will be canceled at the end of the billing period',
        success: true,
      });
    }
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Immediately cancel subscription
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (USE_MOCK_DB) {
      // Mock database mode
      const user = mockDb.getUserByEmail(session.user.email);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const subscription = mockDb.getSubscription(user.id);
      if (!subscription?.stripeSubscriptionId) {
        return NextResponse.json(
          { error: 'No active subscription found' },
          { status: 404 }
        );
      }

      // Immediately cancel subscription
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

      return NextResponse.json({
        message: 'Subscription canceled immediately',
        success: true,
      });
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

      const { data: subscription } = await supabase!
        .from('user_subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', userData.id)
        .single();

      if (!subscription?.stripe_subscription_id) {
        return NextResponse.json(
          { error: 'No active subscription found' },
          { status: 404 }
        );
      }

      // Immediately cancel subscription
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id);

      return NextResponse.json({
        message: 'Subscription canceled immediately',
        success: true,
      });
    }
  } catch (error: any) {
    console.error('Error immediately canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock Stripe service for local testing without real Stripe integration

import { mockDb } from '../db/mock-db';

interface MockCheckoutSession {
  id: string;
  customerId: string;
  priceId: string;
  status: 'open' | 'complete' | 'expired';
  url: string;
}

interface MockSubscription {
  id: string;
  customerId: string;
  priceId: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

class MockStripeService {
  private checkoutSessions: Map<string, MockCheckoutSession> = new Map();
  private subscriptions: Map<string, MockSubscription> = new Map();

  // Simulate creating a checkout session
  async createCheckoutSession(params: {
    userId: string;
    email: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<MockCheckoutSession> {
    const sessionId = `cs_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customerId = `cus_mock_${Date.now()}`;

    const session: MockCheckoutSession = {
      id: sessionId,
      customerId,
      priceId: params.priceId,
      status: 'open',
      url: `/test/mock-checkout?session_id=${sessionId}`,
    };

    this.checkoutSessions.set(sessionId, session);

    console.log(`✅ Mock checkout session created: ${sessionId}`);
    console.log(`   Price: ${params.priceId}`);
    console.log(`   Redirect to: ${session.url}`);

    return session;
  }

  // Simulate completing a checkout (user "paid")
  async completeCheckout(sessionId: string): Promise<boolean> {
    const session = this.checkoutSessions.get(sessionId);
    if (!session) {
      console.error(`❌ Session not found: ${sessionId}`);
      return false;
    }

    session.status = 'complete';

    // Determine plan type from price ID
    const planType = this.getPlanTypeFromPriceId(session.priceId);

    // Create mock subscription
    const subscriptionId = `sub_mock_${Date.now()}`;
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const subscription: MockSubscription = {
      id: subscriptionId,
      customerId: session.customerId,
      priceId: session.priceId,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
    };

    this.subscriptions.set(subscriptionId, subscription);

    console.log(`✅ Mock payment completed!`);
    console.log(`   Subscription: ${subscriptionId}`);
    console.log(`   Plan: ${planType}`);
    console.log(`   Status: active`);

    // This would normally be done via webhook, but we'll simulate it here
    return true;
  }

  // Simulate canceling a subscription
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      console.error(`❌ Subscription not found: ${subscriptionId}`);
      return false;
    }

    subscription.status = 'canceled';
    console.log(`✅ Mock subscription canceled: ${subscriptionId}`);

    return true;
  }

  // Get checkout session
  getCheckoutSession(sessionId: string): MockCheckoutSession | null {
    return this.checkoutSessions.get(sessionId) || null;
  }

  // Get subscription
  getSubscription(subscriptionId: string): MockSubscription | null {
    return this.subscriptions.get(subscriptionId) || null;
  }

  // Helper to determine plan type from price ID
  private getPlanTypeFromPriceId(priceId: string): 'basic' | 'pro' {
    // In real implementation, this would map to actual Stripe price IDs
    if (priceId.includes('basic') || priceId === 'price_mock_basic') {
      return 'basic';
    }
    return 'pro';
  }

  // Mock webhook event processor
  async processWebhookEvent(event: {
    type: string;
    data: any;
  }): Promise<void> {
    console.log(`🔔 Processing mock webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data);
        break;

      default:
        console.log(`   Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(data: any): Promise<void> {
    const { sessionId, userId, customerId, priceId } = data;

    console.log(`   Checkout completed for user: ${userId}`);

    // Create subscription
    const planType = this.getPlanTypeFromPriceId(priceId);
    const subscriptionId = `sub_mock_${Date.now()}`;

    // Update user subscription in mock DB
    mockDb.updateSubscription(userId, {
      userId,
      status: 'active',
      planType,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    });

    console.log(`   ✅ User upgraded to ${planType} plan`);
  }

  private async handleSubscriptionUpdated(data: any): Promise<void> {
    const { userId, status, planType } = data;

    mockDb.updateSubscription(userId, {
      userId,
      status,
      planType,
    });

    console.log(`   ✅ Subscription updated: ${status}`);
  }

  private async handleSubscriptionDeleted(data: any): Promise<void> {
    const { userId } = data;

    mockDb.updateSubscription(userId, {
      userId,
      status: 'canceled',
      planType: 'free',
    });

    console.log(`   ✅ Subscription canceled, reverted to free`);
  }
}

// Singleton instance
export const mockStripe = new MockStripeService();

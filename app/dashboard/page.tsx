'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { mockStripe } from '@/lib/stripe/mock-stripe';
import { mockDb } from '@/lib/db/mock-db';

export default function Dashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard');
    }
  }, [status, router]);

  const handleUpgrade = async (planType: 'basic' | 'pro') => {
    if (!session?.user?.id) return;

    setIsUpgrading(true);

    try {
      // Simulate checkout
      const priceId = planType === 'basic' ? 'price_mock_basic' : 'price_mock_pro';
      const checkoutSession = await mockStripe.createCheckoutSession({
        userId: session.user.id,
        email: session.user.email,
        priceId,
        successUrl: '/dashboard?payment=success',
        cancelUrl: '/dashboard?payment=canceled',
      });

      console.log('Checkout session created:', checkoutSession);

      // Simulate immediate payment success (in real app, user would go to Stripe)
      const paymentSuccess = await mockStripe.completeCheckout(checkoutSession.id);

      if (paymentSuccess) {
        // Simulate webhook event
        await mockStripe.processWebhookEvent({
          type: 'checkout.session.completed',
          data: {
            sessionId: checkoutSession.id,
            userId: session.user.id,
            customerId: checkoutSession.customerId,
            priceId,
          },
        });

        // Update session
        await update();

        alert(`✅ Successfully upgraded to ${planType.toUpperCase()} plan!`);
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!session?.user?.stripeCustomerId) return;

    const confirmed = confirm('Are you sure you want to cancel your subscription?');
    if (!confirmed) return;

    try {
      // Get subscription from mock DB
      const subscription = mockDb.getSubscription(session.user.id);
      if (subscription?.stripeSubscriptionId) {
        await mockStripe.cancelSubscription(subscription.stripeSubscriptionId);

        // Update in mock DB
        mockDb.updateSubscription(session.user.id, {
          userId: session.user.id,
          status: 'canceled',
          planType: 'free',
        });

        // Update session
        await update();

        alert('✅ Subscription canceled successfully');
      }
    } catch (error) {
      console.error('Cancel failed:', error);
      alert('Failed to cancel subscription');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🥷</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isPro = session.user.planType === 'pro';
  const isBasic = session.user.planType === 'basic';
  const isFree = session.user.planType === 'free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🥷</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {session.user.name || session.user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="text-lg font-semibold text-gray-900">{session.user.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">User ID</p>
              <p className="text-sm font-mono text-gray-700">{session.user.id}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Subscription Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                session.user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                session.user.subscriptionStatus === 'trialing' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {session.user.subscriptionStatus}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Plan Type</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                isPro ? 'bg-purple-100 text-purple-800' :
                isBasic ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {session.user.planType.toUpperCase()}
              </span>
            </div>
          </div>

          {session.user.stripeCustomerId && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Stripe Customer ID</p>
              <p className="text-sm font-mono text-gray-700">{session.user.stripeCustomerId}</p>
            </div>
          )}
        </div>

        {/* Subscription Management */}
        {isFree && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-8 border border-purple-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upgrade Your Account</h2>
            <p className="text-gray-700 mb-6">
              Unlock unlimited AI tutoring and advanced features with a premium plan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Plan */}
              <div className="bg-white rounded-lg p-6 border-2 border-blue-300">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Plan</h3>
                <p className="text-3xl font-bold text-blue-600 mb-4">
                  $9<span className="text-lg text-gray-600">/month</span>
                </p>
                <ul className="space-y-2 mb-6 text-sm text-gray-700">
                  <li>✓ 100 AI requests/month</li>
                  <li>✓ OR unlimited with your API key</li>
                  <li>✓ Progress tracking</li>
                  <li>✓ Email support</li>
                </ul>
                <button
                  onClick={() => handleUpgrade('basic')}
                  disabled={isUpgrading}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                >
                  {isUpgrading ? 'Processing...' : 'Upgrade to Basic'}
                </button>
              </div>

              {/* Pro Plan */}
              <div className="bg-white rounded-lg p-6 border-2 border-purple-400 relative">
                <div className="absolute -top-3 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  POPULAR
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Plan</h3>
                <p className="text-3xl font-bold text-purple-600 mb-4">
                  $19<span className="text-lg text-gray-600">/month</span>
                </p>
                <ul className="space-y-2 mb-6 text-sm text-gray-700">
                  <li>✓ Unlimited AI requests</li>
                  <li>✓ No API key needed</li>
                  <li>✓ Priority support</li>
                  <li>✓ Advanced features</li>
                  <li>✓ Custom learning paths</li>
                </ul>
                <button
                  onClick={() => handleUpgrade('pro')}
                  disabled={isUpgrading}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-400 font-semibold"
                >
                  {isUpgrading ? 'Processing...' : 'Upgrade to Pro'}
                </button>
              </div>
            </div>
          </div>
        )}

        {(isBasic || isPro) && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage Subscription</h2>
            <p className="text-gray-700 mb-6">
              You are currently on the <strong>{session.user.planType.toUpperCase()}</strong> plan.
            </p>

            <button
              onClick={handleCancelSubscription}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Cancel Subscription
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Note: This is a mock cancellation. In production, this would cancel via Stripe.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/"
            className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-3">🥷</div>
            <h3 className="font-semibold text-gray-900 mb-2">Python Ninja</h3>
            <p className="text-sm text-gray-600">Start mastering Python</p>
          </a>

          <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Progress</h3>
            <p className="text-sm text-gray-600">Coming soon</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="font-semibold text-gray-900 mb-2">Settings</h3>
            <p className="text-sm text-gray-600">Coming soon</p>
          </div>
        </div>

        {/* Testing Info */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>🧪 Testing Mode:</strong> This is using mock authentication and mock Stripe. No real payment processing.
          </p>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { STRIPE_PRICES } from '@/lib/stripe/config';

function DashboardContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard');
    }
  }, [status, router]);

  // Handle return from Stripe checkout
  useEffect(() => {
    if (searchParams?.get('success') === 'true') {
      setSuccessMessage('Payment successful! Your plan is being activated.');
      // Refresh the session to pick up the updated subscription
      update();
      // Clean up URL params
      router.replace('/dashboard');
    }
  }, [searchParams, update, router]);

  const handleUpgrade = async (planType: 'basic' | 'pro') => {
    if (!session?.user?.email) return;

    setIsUpgrading(true);
    setError('');

    try {
      const priceId = planType === 'basic'
        ? STRIPE_PRICES.BASIC_MONTHLY
        : STRIPE_PRICES.PRO_MONTHLY;

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (!data.url) {
        throw new Error('No checkout URL returned');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Upgrade failed:', err);
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
      setIsUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    const confirmed = confirm('Are you sure you want to cancel your subscription? It will remain active until the end of your billing period.');
    if (!confirmed) return;

    setIsCanceling(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/manage-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      await update();
      setSuccessMessage('Subscription will be canceled at the end of your billing period.');
    } catch (err) {
      console.error('Cancel failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to cancel subscription. Please try again.';
      setError(message);
    } finally {
      setIsCanceling(false);
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
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

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
              disabled={isCanceling}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
            >
              {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/"
            className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-3">🥷</div>
            <h3 className="font-semibold text-gray-900 mb-2">Python Ninja</h3>
            <p className="text-sm text-gray-600">Start mastering Python</p>
          </Link>

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
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-6xl animate-bounce">🥷</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PricingCard from './PricingCard';
import { PlanType } from '@/lib/stripe/config';

export default function PricingSection() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free');
  const [error, setError] = useState<string | null>(null);

  // Fetch current subscription
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSubscription();
    }
  }, [status]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/manage-subscription');
      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.plan_type || 'free');
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  };

  const handleUpgrade = async (planType: PlanType, priceId: string) => {
    console.log('🔍 Upgrade clicked:', { planType, priceId, status, session: !!session });

    if (status !== 'authenticated') {
      console.log('⚠️ User not authenticated, redirecting to signin');
      router.push('/auth/signin?callbackUrl=/pricing');
      return;
    }

    if (!session?.user?.email) {
      console.log('⚠️ No user email in session');
      setError('Session error. Please try logging in again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📤 Creating checkout session...');
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          planType,
        }),
      });

      const data = await response.json();
      console.log('📥 Checkout response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (!data.url) {
        throw new Error('No checkout URL returned');
      }

      // Redirect to Stripe Checkout
      console.log('🚀 Redirecting to Stripe:', data.url);
      window.location.href = data.url;
    } catch (err) {
      console.error('❌ Error creating checkout session:', err);
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Choose Your Learning Path
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Start for free, upgrade anytime to unlock more features
        </p>
        {/* Debug: Show login status */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 inline-block rounded-lg bg-blue-50 px-4 py-2 text-sm">
            Status: <strong>{status}</strong>
            {session?.user?.email && ` | Logged in as: ${session.user.email}`}
            {status === 'unauthenticated' && (
              <a href="/auth/signin" className="ml-2 text-blue-600 underline">
                Login to upgrade
              </a>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-center">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-3">
        <PricingCard
          planType="free"
          currentPlan={currentPlan}
          onUpgrade={handleUpgrade}
          loading={loading}
        />
        <PricingCard
          planType="basic"
          currentPlan={currentPlan}
          onUpgrade={handleUpgrade}
          loading={loading}
        />
        <PricingCard
          planType="pro"
          currentPlan={currentPlan}
          onUpgrade={handleUpgrade}
          loading={loading}
        />
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          All plans include a 7-day money-back guarantee. Cancel anytime.
        </p>
      </div>
    </div>
  );
}

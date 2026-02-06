'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PLAN_DETAILS } from '@/lib/stripe/stripe';

export default function SubscriptionManager() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<{
    status?: string;
    plan_type?: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (session) {
      fetchSubscription();
    }
  }, [session]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/manage-subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setCanceling(true);
    try {
      const response = await fetch('/api/stripe/manage-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cancel' }),
      });

      if (response.ok) {
        alert('Subscription will be canceled at the end of the billing period.');
        fetchSubscription();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Error canceling subscription:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <p className="text-gray-500">Loading subscription...</p>
      </div>
    );
  }

  if (!subscription || subscription.plan_type === 'free') {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">
          Subscription
        </h3>
        <p className="mb-4 text-gray-600">
          You are currently on the <strong>Free</strong> plan.
        </p>
        <a
          href="/pricing"
          className="inline-block rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          View Plans
        </a>
      </div>
    );
  }

  const plan = PLAN_DETAILS[subscription.plan_type as keyof typeof PLAN_DETAILS];
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString()
    : 'N/A';

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-xl font-semibold text-gray-900">
        Subscription
      </h3>

      {/* Current Plan */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">{plan.name} Plan</p>
            <p className="text-sm text-gray-600">${plan.price}/month</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              subscription.status === 'active'
                ? 'bg-green-100 text-green-800'
                : subscription.status === 'past_due'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {subscription.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Billing Info */}
      <div className="mb-4 rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          {subscription.cancel_at_period_end ? (
            <>
              <strong>Cancels on:</strong> {periodEnd}
            </>
          ) : (
            <>
              <strong>Next billing date:</strong> {periodEnd}
            </>
          )}
        </p>
      </div>

      {/* Features */}
      <div className="mb-4">
        <p className="mb-2 text-sm font-semibold text-gray-700">Included:</p>
        <ul className="space-y-1">
          {plan.features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-600">
              <svg
                className="mr-2 h-4 w-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {!subscription.cancel_at_period_end && (
          <button
            onClick={handleCancel}
            disabled={canceling}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canceling ? 'Canceling...' : 'Cancel Subscription'}
          </button>
        )}
        <a
          href="/pricing"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Change Plan
        </a>
      </div>

      {subscription.cancel_at_period_end && (
        <p className="mt-4 text-sm text-yellow-600">
          Your subscription will cancel on {periodEnd}. You will retain access until then.
        </p>
      )}
    </div>
  );
}

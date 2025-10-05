'use client';

import { useApp } from '@/contexts/AppContext';
import { llmService } from '@/lib/llm/llmService';
import { useState, useEffect } from 'react';

export default function FreeTrialBanner() {
  const { apiConfig } = useApp();
  const [remaining, setRemaining] = useState(5);
  const [resetTime, setResetTime] = useState(0);

  // Update remaining count periodically
  useEffect(() => {
    if (apiConfig.llmProvider !== 'free-trial') return;

    const interval = setInterval(() => {
      const rem = llmService.getFreeTrialRemaining();
      const reset = llmService.getFreeTrialResetTime();
      setRemaining(rem);
      setResetTime(reset);
    }, 500);

    return () => clearInterval(interval);
  }, [apiConfig.llmProvider]);

  if (apiConfig.llmProvider !== 'free-trial') {
    return null;
  }

  const getTimeUntilReset = () => {
    if (!resetTime) return '';
    const now = Date.now();
    const diff = resetTime - now;

    if (diff <= 0) return 'Soon';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className={`rounded-lg p-4 border ${remaining > 0 ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{remaining > 0 ? '🎁' : '⚠️'}</div>
          <div>
            <p className="font-semibold text-gray-900">
              {remaining > 0 ? `Free Trial: ${remaining}/5 requests remaining` : 'Free trial limit reached'}
            </p>
            <p className="text-sm text-gray-600">
              {remaining > 0
                ? resetTime ? `Resets in ${getTimeUntilReset()}` : 'Limited to 5 requests per day'
                : resetTime ? `Resets in ${getTimeUntilReset()} or upgrade now` : 'Add your own API key to continue'
              }
            </p>
          </div>
        </div>
        {remaining === 0 && (
          <div className="flex gap-3">
            <a
              href="/auth/signin"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-semibold text-sm"
            >
              Sign Up & Upgrade
            </a>
            <a
              href="/auth/signin"
              className="px-4 py-2 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-semibold text-sm"
            >
              Use Own API Key
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

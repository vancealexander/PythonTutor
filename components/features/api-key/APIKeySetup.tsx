'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function APIKeySetup() {
  const { apiConfig, setAPIKey, removeAPIKey, setFreeTrial } = useApp();
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleSaveKey = () => {
    if (apiKeyInput.trim().startsWith('sk-ant-')) {
      setAPIKey(apiKeyInput.trim());
      setApiKeyInput('');
      setShowKeyInput(false);
    } else {
      alert('Please enter a valid Anthropic API key (starts with sk-ant-)');
    }
  };

  if (apiConfig.isConfigured) {
    const isFreeTrialMode = apiConfig.llmProvider === 'free-trial';

    // Don't show anything for free trial mode - they see the banner instead
    if (isFreeTrialMode) {
      return null;
    }

    // Only show for users with their own API key
    return (
      <div className="bg-green-50 border-green-200 border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium text-green-800">
              API Key Configured - Claude Haiku Active
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={removeAPIKey}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Remove Key
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-4">🐍</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Get Started with Python Tutor
        </h2>
        <p className="text-lg text-gray-700 mb-6">
          Enter your Anthropic API key to unlock AI-powered Python tutoring
        </p>

        {!showKeyInput ? (
          <div className="space-y-4">
            <div className="flex gap-4 justify-center">
              <button
                onClick={setFreeTrial}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 shadow-xl transform hover:scale-105 transition"
              >
                Try Free Trial (5 requests)
              </button>
              <button
                onClick={() => setShowKeyInput(true)}
                className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg hover:bg-blue-700 shadow-xl transform hover:scale-105 transition"
              >
                Use My API Key
              </button>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Don&apos;t have an API key?</strong>
              </p>
              <ol className="text-sm text-gray-600 text-left max-w-md mx-auto space-y-1">
                <li>1. Go to <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a></li>
                <li>2. Create an account and add credits</li>
                <li>3. Generate an API key</li>
                <li>4. Paste it here</li>
              </ol>
              <p className="text-xs text-gray-500 mt-3">
                💡 Uses Claude Haiku - very cheap (~$0.25 per 1M tokens)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 max-w-xl mx-auto">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-ant-..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
              />
              <button
                onClick={handleSaveKey}
                disabled={!apiKeyInput.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-bold"
              >
                Save Key
              </button>
            </div>
            <button
              onClick={() => setShowKeyInput(false)}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Cancel
            </button>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-500">
          🔒 Your API key is stored locally in your browser only
        </p>
      </div>
    </div>
  );
}

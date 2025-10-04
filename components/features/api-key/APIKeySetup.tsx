'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function APIKeySetup() {
  const { apiConfig, setAPIKey, removeAPIKey, setDuckDuckGoConfig } = useApp();
  const [provider, setProvider] = useState<'anthropic' | 'duckduckgo'>('anthropic');
  const [inputKey, setInputKey] = useState('');
  const [workerUrl, setWorkerUrl] = useState('');
  const [ddgApiKey, setDdgApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (provider === 'anthropic') {
      if (inputKey.trim().startsWith('sk-ant-')) {
        setAPIKey(inputKey.trim());
        setInputKey('');
      } else {
        alert('Please enter a valid Anthropic API key (starts with sk-ant-)');
      }
    } else if (provider === 'duckduckgo') {
      if (workerUrl.trim() && ddgApiKey.trim()) {
        setDuckDuckGoConfig(workerUrl.trim(), ddgApiKey.trim());
        setWorkerUrl('');
        setDdgApiKey('');
      } else {
        alert('Please enter both Worker URL and API Key');
      }
    }
  };

  const handleRemove = () => {
    if (confirm('Are you sure you want to remove your API key? This will be stored only in your browser.')) {
      removeAPIKey();
    }
  };

  if (apiConfig.isConfigured) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 font-medium">
              {apiConfig.llmProvider === 'anthropic' ? 'Anthropic API' : 'DuckDuckGo AI'} Configured
            </span>
          </div>
          <button
            onClick={handleRemove}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Remove
          </button>
        </div>
        <p className="text-sm text-green-700 mt-2">
          Your {apiConfig.llmProvider === 'anthropic' ? 'API key' : 'configuration'} is securely stored in your browser. Ready to learn!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Configure Your AI Provider
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Choose your AI provider. Your credentials are stored locally in your browser only.
      </p>

      <div className="space-y-4">
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Provider
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setProvider('anthropic')}
              className={`flex-1 px-4 py-3 border-2 rounded-lg ${
                provider === 'anthropic'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <div className="font-medium">Anthropic API</div>
              <div className="text-xs text-gray-600">Claude Haiku (cheap)</div>
            </button>
            <button
              onClick={() => setProvider('duckduckgo')}
              className={`flex-1 px-4 py-3 border-2 rounded-lg ${
                provider === 'duckduckgo'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <div className="font-medium">DuckDuckGo AI</div>
              <div className="text-xs text-gray-600">Free (via Worker)</div>
            </button>
          </div>
        </div>

        {/* Anthropic Configuration */}
        {provider === 'anthropic' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anthropic API Key
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showKey ? '🙈' : '👁️'}
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={!inputKey.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Save
              </button>
            </div>
            <div className="bg-white border border-gray-200 rounded p-4 text-sm mt-3">
              <p className="font-medium text-gray-900 mb-2">How to get your API key:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Go to <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a></li>
                <li>Create an account and add credits</li>
                <li>Navigate to API Keys section</li>
                <li>Create a new key and paste it above</li>
              </ol>
            </div>
          </div>
        )}

        {/* DuckDuckGo Configuration */}
        {provider === 'duckduckgo' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cloudflare Worker URL
              </label>
              <input
                type="text"
                value={workerUrl}
                onChange={(e) => setWorkerUrl(e.target.value)}
                placeholder="https://your-worker.workers.dev"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Worker API Key
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={ddgApiKey}
                    onChange={(e) => setDdgApiKey(e.target.value)}
                    placeholder="Your worker API key"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showKey ? '🙈' : '👁️'}
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  disabled={!workerUrl.trim() || !ddgApiKey.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Save
                </button>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded p-4 text-sm">
              <p className="font-medium text-gray-900 mb-2">Setup Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Clone <a href="https://github.com/HuggingBear/DuckDuckGo-AI" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">DuckDuckGo-AI repo</a></li>
                <li>Deploy to Cloudflare Workers</li>
                <li>Set your own API key for protection</li>
                <li>Enter Worker URL and API key above</li>
              </ol>
            </div>
          </div>
        )}

        <p className="text-gray-500 text-xs mt-3">
          💡 All credentials stay in your browser. We never see them or store them on any server.
        </p>
      </div>
    </div>
  );
}

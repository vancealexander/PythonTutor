'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { useSession } from 'next-auth/react';
import APIKeySetup from '@/components/features/api-key/APIKeySetup';
import CodeEditor from '@/components/features/code-editor/CodeEditor';
import AITutor from '@/components/features/lesson/AITutor';
import PyodideStatus from '@/components/ui/PyodideStatus';
import FreeTrialBanner from '@/components/ui/FreeTrialBanner';

export default function Home() {
  const { apiConfig, isPyodideReady, userProgress, isMounted } = useApp();
  const { data: session } = useSession();
  const [editorCode, setEditorCode] = React.useState('');
  const [codeEditorKey, setCodeEditorKey] = React.useState(0);

  const isPaidUser = session?.user?.planType && session.user.planType !== 'free';

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🥷</div>
          <p className="text-gray-600">Loading Python Ninja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🥷</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Python Ninja</h1>
                <p className="text-sm text-gray-600">Master Python with AI-Powered Training</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isPyodideReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                <span className="text-xs text-gray-600">
                  {isPyodideReady ? 'Python Ready' : 'Loading Python...'}
                </span>
              </div>
              {userProgress && (
                <div className="text-sm text-gray-600">
                  Phase {userProgress.currentPhase} • {userProgress.completedLessons.length} lessons completed
                </div>
              )}
              {/* Show plan badge or upgrade button */}
              {isPaidUser ? (
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                    session.user.planType === 'pro'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {session.user.planType === 'pro' ? '⭐ Pro Member' : '💎 Premium Member'}
                  </span>
                  <a
                    href="/dashboard"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-sm transition-all"
                  >
                    Dashboard
                  </a>
                </div>
              ) : (
                <a
                  href="/pricing"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-semibold text-sm transition-all shadow-sm hover:shadow-md"
                >
                  Upgrade to Pro
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Free Trial Banner - Show for free trial users only if not paid */}
        {!isPaidUser && apiConfig.llmProvider === 'free-trial' && (
          <div className="mb-6">
            <FreeTrialBanner />
          </div>
        )}

        {/* Paid User Welcome Banner */}
        {isPaidUser && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Welcome back, {session.user.name || 'Ninja'}! 🥷
                </h3>
                <p className="text-sm text-gray-600">
                  You're on the <strong>{session.user.planType.toUpperCase()}</strong> plan with {
                    session.user.planType === 'pro' ? 'unlimited AI requests' : '100 AI requests/month or unlimited with your own API key'
                  }
                </p>
              </div>
              <a
                href="/dashboard"
                className="px-4 py-2 bg-white text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 font-semibold text-sm transition-all"
              >
                Manage Plan
              </a>
            </div>
          </div>
        )}

        {/* Main Content - Always show (auto-started in free trial) */}
        {apiConfig.isConfigured && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Code Editor */}
              <div className="lg:col-span-2">
                <div className="h-[600px]">
                  <CodeEditor
                    key={codeEditorKey}
                    height="600px"
                    onCodeChange={setEditorCode}
                  />
                </div>
              </div>

              {/* Right: AI Tutor */}
              <div>
                <div className="h-[600px]">
                  <AITutor
                    systemPrompt="You are an expert Python sensei helping students master programming. Provide clear, encouraging explanations with examples. Break down complex concepts into simple steps. When providing code examples, always wrap them in ```python code blocks."
                    context={editorCode ? `Current student code:\n${editorCode}` : undefined}
                    onCodeSuggestion={(code) => {
                      // Update localStorage and force editor remount to reload code
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('pythonTutor_savedCode', code);
                        setCodeEditorKey(prev => prev + 1);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Execution</h3>
            <p className="text-sm text-gray-600">
              Run Python code directly in your browser. No installation required.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Tutor</h3>
            <p className="text-sm text-gray-600">
              Get personalized help, explanations, and exercises generated by Claude AI.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-sm text-gray-600">
              Your learning progress is saved locally. Pick up where you left off anytime.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Built with Next.js, Pyodide, and Anthropic Claude API</p>
            <p className="mt-1 text-xs text-gray-500">
              Your API key and progress are stored locally in your browser
            </p>
          </div>
        </div>
      </footer>

      {/* Debug Status */}
      {process.env.NODE_ENV === 'development' && <PyodideStatus />}
    </div>
  );
}

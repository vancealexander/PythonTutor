'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import APIKeySetup from '@/components/features/api-key/APIKeySetup';
import CodeEditor from '@/components/features/code-editor/CodeEditor';
import AITutor from '@/components/features/lesson/AITutor';
import PyodideStatus from '@/components/ui/PyodideStatus';

export default function Home() {
  const { apiConfig, isPyodideReady, userProgress, isMounted } = useApp();
  const [editorCode, setEditorCode] = React.useState('');
  const [codeEditorKey, setCodeEditorKey] = React.useState(0);

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐍</div>
          <p className="text-gray-600">Loading Python Tutor...</p>
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
              <span className="text-4xl">🐍</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Python Tutor</h1>
                <p className="text-sm text-gray-600">AI-Powered Interactive Learning</p>
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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Key Setup */}
        <div className="mb-6">
          <APIKeySetup />
        </div>

        {/* Main Content */}
        {apiConfig.isConfigured ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Code Editor */}
            <div className="h-[600px]">
              <CodeEditor
                key={codeEditorKey}
                height="600px"
                onCodeChange={setEditorCode}
              />
            </div>

            {/* Right: AI Tutor */}
            <div className="h-[600px]">
              <AITutor
                systemPrompt="You are an expert Python tutor helping students learn programming. Provide clear, encouraging explanations with examples. Break down complex concepts into simple steps. When providing code examples, always wrap them in ```python code blocks."
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
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Python Tutor!
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Configure your API key above to start learning Python with AI-powered lessons and instant feedback.
            </p>
          </div>
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

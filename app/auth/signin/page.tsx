'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function SignInForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up: Create account via API route
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Signup failed');
          setIsLoading(false);
          return;
        }

        // After successful signup, sign in
        await signIn('credentials', {
          email,
          password,
          callbackUrl,
          redirect: true,
        });
      } else {
        // Sign in
        const result = await signIn('credentials', {
          email,
          password,
          callbackUrl,
          redirect: true,
        });

        if (result?.error) {
          setError('Invalid email or password');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setIsLoading(true);

    try {
      await signIn('credentials', {
        email: testEmail,
        password: testPassword,
        callbackUrl,
        redirect: true,
      });
    } catch (err) {
      setError('Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🥷</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Join Python Ninja' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account to start learning' : 'Sign in to continue your training'}
          </p>
        </div>

        {/* Test Accounts Info - Only in Development */}
        {isDevelopment && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">🧪 Test Accounts:</p>
            <div className="space-y-2 text-sm">
              <button
                onClick={() => handleTestLogin('test@example.com', 'test123')}
                className="w-full text-left px-3 py-2 bg-white rounded border border-blue-300 hover:bg-blue-50 transition"
                disabled={isLoading}
              >
                <span className="font-mono text-xs text-blue-700">test@example.com</span>
                <span className="text-xs text-gray-500 ml-2">(Free Tier)</span>
              </button>
              <button
                onClick={() => handleTestLogin('pro@example.com', 'test123')}
                className="w-full text-left px-3 py-2 bg-white rounded border border-purple-300 hover:bg-purple-50 transition"
                disabled={isLoading}
              >
                <span className="font-mono text-xs text-purple-700">pro@example.com</span>
                <span className="text-xs text-gray-500 ml-2">(Pro Tier)</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Click to auto-login</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Login/Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Your name"
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder={isSignUp ? "Create a password" : "Your password"}
              required
              disabled={isLoading}
              minLength={6}
            />
            {isSignUp && (
              <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
          >
            {isLoading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            {isSignUp ? '← Already have an account? Sign in' : "Don't have an account? Sign up →"}
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Back to Home */}
        <a
          href="/"
          className="block text-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-6xl animate-bounce">🥷</div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}

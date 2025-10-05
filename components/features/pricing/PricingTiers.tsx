'use client';

export default function PricingTiers() {
  return (
    <div className="py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Learning Plan
          </h2>
          <p className="text-xl text-gray-600">
            Start free, upgrade anytime. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
              <p className="text-gray-600">Forever free with ads</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Unlimited AI tutoring</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Claude AI (Haiku)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Python code execution</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Save & load code</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">⚠</span>
                <span className="text-gray-500">Includes ads</span>
              </li>
            </ul>

            <button className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300">
              Current Plan
            </button>
          </div>

          {/* Premium Tier */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl border-2 border-blue-400 p-8 transform scale-105 relative">
            <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-bold">
              POPULAR
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <div className="text-4xl font-bold text-white mb-2">
                $5<span className="text-xl">/mo</span>
              </div>
              <p className="text-blue-100">Ad-free learning</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-300 mr-2">✓</span>
                <span className="text-white font-medium">Everything in Free</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-300 mr-2">✓</span>
                <span className="text-white font-medium">No ads</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-300 mr-2">✓</span>
                <span className="text-white font-medium">Priority support</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-300 mr-2">✓</span>
                <span className="text-white font-medium">Support development</span>
              </li>
            </ul>

            <button className="w-full py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 shadow-lg">
              Upgrade to Premium
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $100<span className="text-xl text-gray-600">/once</span>
              </div>
              <p className="text-gray-600">Lifetime access</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700 font-medium">Everything in Premium</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700 font-medium">Use your own API key</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700 font-medium">Advanced features</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700 font-medium">Lifetime updates</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">★</span>
                <span className="text-gray-700 font-medium">Best value</span>
              </li>
            </ul>

            <button className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700">
              Get Pro Access
            </button>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-600">
          <p>💡 All plans include Python code execution, AI tutoring, and progress tracking</p>
          <p className="mt-2">🔒 Secure payments via Stripe • Cancel anytime • 30-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
}

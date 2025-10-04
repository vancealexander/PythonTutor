'use client';

import { useEffect, useState } from 'react';
import { pyodideService } from '@/lib/python/pyodide';

export default function TestDuckAI() {
  const [status, setStatus] = useState('Initializing...');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isPyodideReady, setIsPyodideReady] = useState(false);

  useEffect(() => {
    const initPyodide = async () => {
      try {
        setStatus('Loading Pyodide...');
        await pyodideService.initialize();
        setIsPyodideReady(true);
        setStatus('Pyodide ready! Click "Test DuckDuckAI" to start.');
      } catch (err: any) {
        setError(`Pyodide failed: ${err.message}`);
        setStatus('Error loading Pyodide');
      }
    };

    initPyodide();
  }, []);

  const testDuckAI = async () => {
    if (!isPyodideReady) {
      setError('Pyodide not ready yet');
      return;
    }

    try {
      setStatus('Installing duckai package...');
      setResult('');
      setError('');

      const testResult = await pyodideService.runCode(`
# Test 1: Install duckai
import micropip
await micropip.install('duckai')
print("✅ duckai installed successfully")

# Test 2: Import duckai
from duckai import ask
print("✅ duckai imported successfully")

# Test 3: Make a simple query
print("\\n🔄 Testing DuckDuckAI query...")
try:
    response = ask("Say hello in 5 words", stream=False, model="claude-3-haiku-20240307")
    print(f"\\n✅ Success! Response: {response}")
except Exception as e:
    print(f"\\n❌ Error: {str(e)}")
    raise
      `);

      setResult(testResult.output || '');
      if (testResult.error) {
        setError(testResult.error);
        setStatus('Test completed with errors');
      } else {
        setStatus('Test completed successfully!');
      }

    } catch (err: any) {
      setError(`Test failed: ${err.message}`);
      setStatus('Test failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">DuckDuckAI Pyodide Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Status</h2>
          <p className="text-gray-700">{status}</p>

          <button
            onClick={testDuckAI}
            disabled={!isPyodideReady}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Test DuckDuckAI
          </button>
        </div>

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2 text-green-800">Output</h2>
            <pre className="whitespace-pre-wrap text-sm font-mono text-green-900">
              {result}
            </pre>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2 text-red-800">Error</h2>
            <pre className="whitespace-pre-wrap text-sm font-mono text-red-900">
              {error}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">What This Tests</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Can Pyodide install the duckai package?</li>
            <li>Can it import and use the duckai library?</li>
            <li>Does it work from the browser (no CORS issues)?</li>
            <li>Does it return valid AI responses?</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">Expected Results</h3>
          <p className="text-sm text-gray-600">
            <strong>Success:</strong> Should see installation message, import confirmation, and an AI-generated hello message.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Failure (CORS):</strong> Will see network/fetch errors about cross-origin requests.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Failure (Package):</strong> Will see import errors if package isn't compatible with Pyodide.
          </p>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Branch:</strong> feature/duckduckgo-free-tier</p>
          <p><strong>Test Page URL:</strong> http://localhost:3004/test-duckai</p>
        </div>
      </div>
    </div>
  );
}

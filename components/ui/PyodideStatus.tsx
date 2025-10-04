'use client';

import { useEffect, useState } from 'react';

export default function PyodideStatus() {
  const [status, setStatus] = useState<string>('Checking...');

  useEffect(() => {
    const checkPyodide = setInterval(() => {
      if (typeof window !== 'undefined') {
        if (window.loadPyodide) {
          setStatus('✅ Pyodide script loaded');
          clearInterval(checkPyodide);
        } else {
          setStatus('⏳ Waiting for Pyodide script...');
        }
      }
    }, 500);

    return () => clearInterval(checkPyodide);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-mono shadow-lg">
      {status}
    </div>
  );
}

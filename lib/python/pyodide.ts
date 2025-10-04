import { CodeExecutionResult } from '@/types';

// Declare global pyodide
declare global {
  interface Window {
    loadPyodide: any;
  }
}

let pyodideInstance: any = null;
let isLoading = false;

export const pyodideService = {
  async initialize(): Promise<void> {
    if (pyodideInstance) return;
    if (isLoading) {
      // Wait for existing load to complete
      while (isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    try {
      isLoading = true;

      // Wait for Pyodide script to load
      if (typeof window === 'undefined' || !window.loadPyodide) {
        throw new Error('Pyodide not available. Make sure the script is loaded.');
      }

      pyodideInstance = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
      });
      console.log('Pyodide loaded successfully');
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
      throw error;
    } finally {
      isLoading = false;
    }
  },

  async runCode(code: string): Promise<CodeExecutionResult> {
    if (!pyodideInstance) {
      throw new Error('Pyodide not initialized. Call initialize() first.');
    }

    const startTime = performance.now();
    let output = '';
    let error: string | undefined;

    try {
      // Wrap user code to capture stdout
      const wrappedCode = `
import sys
from io import StringIO

# Capture stdout
_stdout = StringIO()
_stderr = StringIO()
_old_stdout = sys.stdout
_old_stderr = sys.stderr
sys.stdout = _stdout
sys.stderr = _stderr

try:
${code.split('\n').map(line => '    ' + line).join('\n')}
finally:
    sys.stdout = _old_stdout
    sys.stderr = _old_stderr

_stdout.getvalue(), _stderr.getvalue()
`;

      // Run the wrapped code
      const result = await pyodideInstance.runPythonAsync(wrappedCode);

      // Result is a tuple (stdout, stderr)
      if (result && typeof result === 'object') {
        // Convert PyProxy to JavaScript array
        const outputs = result.toJs ? result.toJs() : result;

        if (Array.isArray(outputs)) {
          output = outputs[0] || '';
          error = outputs[1] || undefined;
        } else {
          output = String(result);
        }
      } else {
        output = result ? String(result) : '';
      }

    } catch (err: any) {
      error = err.message || String(err);
    }

    const executionTime = performance.now() - startTime;

    return {
      output,
      error,
      executionTime,
    };
  },

  async loadPackage(packageName: string): Promise<void> {
    if (!pyodideInstance) {
      throw new Error('Pyodide not initialized');
    }
    await pyodideInstance.loadPackage(packageName);
  },

  async loadPackages(packages: string[]): Promise<void> {
    if (!pyodideInstance) {
      throw new Error('Pyodide not initialized');
    }
    await pyodideInstance.loadPackagesFromImports(packages.join('\n'));
  },

  isReady(): boolean {
    return !!pyodideInstance && !isLoading;
  },

  async installPackage(packageName: string): Promise<void> {
    if (!pyodideInstance) {
      throw new Error('Pyodide not initialized');
    }

    try {
      await pyodideInstance.loadPackage('micropip');
      const micropip = pyodideInstance.pyimport('micropip');
      await micropip.install(packageName);
    } catch (err) {
      console.error(`Failed to install ${packageName}:`, err);
      throw err;
    }
  },
};

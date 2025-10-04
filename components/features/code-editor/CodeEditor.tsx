'use client';

import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { pyodideService } from '@/lib/python/pyodide';
import { CodeExecutionResult } from '@/types';

interface CodeEditorProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onExecute?: (result: CodeExecutionResult) => void;
  height?: string;
  readOnly?: boolean;
}

const CODE_EXAMPLES = {
  helloWorld: '# Hello World Example\nprint("Hello, World!")',
  variables: '# Variables and Types\nname = "Alice"\nage = 25\nheight = 5.6\n\nprint(f"Name: {name}")\nprint(f"Age: {age}")\nprint(f"Height: {height} feet")',
  loops: '# For Loop Example\nfor i in range(5):\n    print(f"Count: {i}")\n\n# While Loop Example\ncount = 0\nwhile count < 3:\n    print(f"While count: {count}")\n    count += 1',
  functions: '# Function Example\ndef greet(name):\n    return f"Hello, {name}!"\n\ndef add_numbers(a, b):\n    return a + b\n\nprint(greet("Alice"))\nprint(f"Sum: {add_numbers(5, 3)}")',
  lists: '# Lists Example\nfruits = ["apple", "banana", "orange"]\nprint("Fruits:", fruits)\n\n# Add item\nfruits.append("grape")\nprint("After append:", fruits)\n\n# Loop through list\nfor fruit in fruits:\n    print(f"- {fruit}")',
};

export default function CodeEditor({
  initialCode = '# Write your Python code here\nprint("Hello, World!")',
  onCodeChange,
  onExecute,
  height = '400px',
  readOnly = false,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<CodeExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const editorRef = useRef<any>(null);

  // Load saved code from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCode = localStorage.getItem('pythonTutor_savedCode');
      if (savedCode) {
        setCode(savedCode);
      }
    }
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    onCodeChange?.(newCode);
    // Auto-save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('pythonTutor_savedCode', newCode);
    }
  };

  const handleSaveCode = () => {
    if (typeof window !== 'undefined') {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'python_code.py';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleLoadCode = () => {
    if (typeof window !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.py,.txt';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target?.result as string;
            setCode(content);
            localStorage.setItem('pythonTutor_savedCode', content);
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }
  };

  const handleRunCode = async () => {
    // Prevent concurrent executions
    if (isRunning) {
      return;
    }

    if (!pyodideService.isReady()) {
      setOutput({
        output: '',
        error: 'Python environment is still loading. Please wait a moment...',
        executionTime: 0,
      });
      return;
    }

    setIsRunning(true);
    setOutput(null);

    try {
      const result = await pyodideService.runCode(code);
      setOutput(result);
      onExecute?.(result);
    } catch (error: any) {
      setOutput({
        output: '',
        error: error.message || 'An unexpected error occurred',
        executionTime: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setOutput(null);
  };

  const handleLoadExample = (exampleKey: keyof typeof CODE_EXAMPLES) => {
    setCode(CODE_EXAMPLES[exampleKey]);
    setShowExamples(false);
    setOutput(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to run code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveCode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, isRunning]); // Dependencies for handleRunCode

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">Python Editor</span>
          <span className="text-xs text-gray-400">
            (Ctrl+Enter to run, Ctrl+S to save)
          </span>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 rounded"
              disabled={isRunning}
              title="Load example code"
            >
              📚 Examples
            </button>
            {showExamples && (
              <div className="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[200px]">
                <button
                  onClick={() => handleLoadExample('helloWorld')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Hello World
                </button>
                <button
                  onClick={() => handleLoadExample('variables')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Variables & Types
                </button>
                <button
                  onClick={() => handleLoadExample('loops')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Loops
                </button>
                <button
                  onClick={() => handleLoadExample('functions')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Functions
                </button>
                <button
                  onClick={() => handleLoadExample('lists')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Lists
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleLoadCode}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded"
            disabled={isRunning}
            title="Load code from file"
          >
            📂 Load
          </button>
          <button
            onClick={handleSaveCode}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded"
            disabled={isRunning || !code.trim()}
            title="Save code to file"
          >
            💾 Save
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
            disabled={isRunning}
          >
            Clear
          </button>
          <button
            onClick={handleRunCode}
            disabled={isRunning || !code.trim()}
            className="px-4 py-1 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded font-medium flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <span className="animate-spin">⚙️</span>
                Running...
              </>
            ) : (
              <>
                ▶️ Run Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            readOnly,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
          }}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
        />
      </div>

      {/* Output Panel */}
      <div className="border-t border-gray-300 bg-gray-900 text-gray-100 p-4 min-h-[120px] max-h-[200px] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-gray-400">Output</span>
          {output && (
            <span className="text-xs text-gray-500">
              Executed in {output.executionTime.toFixed(2)}ms
            </span>
          )}
        </div>
        <div className="font-mono text-sm whitespace-pre-wrap">
          {!output ? (
            <div className="text-gray-500 italic">Click "Run Code" to see output...</div>
          ) : output.error ? (
            // Parse and highlight Python error messages
            <div className="text-red-400">
              {output.error.split('\n').map((line, index) => {
                // Highlight traceback headers
                if (line.includes('Traceback')) {
                  return <div key={index} className="text-red-300 font-bold">{line}</div>;
                }
                // Highlight file references
                if (line.trim().startsWith('File ')) {
                  return <div key={index} className="text-yellow-400">{line}</div>;
                }
                // Highlight error type (e.g., "SyntaxError:", "TypeError:")
                if (line.match(/^\w+Error:/)) {
                  return <div key={index} className="text-red-500 font-bold">{line}</div>;
                }
                // Regular error line
                return <div key={index}>{line}</div>;
              })}
            </div>
          ) : output.output ? (
            <div className="text-green-400">{output.output}</div>
          ) : (
            <div className="text-gray-500 italic">No output (code executed successfully)</div>
          )}
        </div>
      </div>
    </div>
  );
}

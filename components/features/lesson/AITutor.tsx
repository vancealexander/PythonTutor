'use client';

import { useState, useRef, useEffect } from 'react';
import { llmService } from '@/lib/llm/llmService';
import { LLMMessage } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface AITutorProps {
  context?: string;
  systemPrompt?: string;
  onCodeSuggestion?: (code: string) => void;
}

export default function AITutor({ context, systemPrompt, onCodeSuggestion }: AITutorProps) {
  const { isLLMReady } = useApp();
  const [messages, setMessages] = useState<LLMMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick prompts for common requests
  const quickPrompts = [
    "Explain Python basics",
    "Give me an exercise",
    "Explain loops",
    "How do functions work?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !isLLMReady) return;

    const userMessage: LLMMessage = {
      role: 'user',
      content: input,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Build system message with current context
      let systemContent = systemPrompt || 'You are an expert Python tutor. Help students learn Python programming with clear explanations, examples, and encouragement.';

      if (context) {
        systemContent += `\n\n${context}`;
      }

      const systemMessage: LLMMessage = {
        role: 'system',
        content: systemContent,
      };

      const response = await llmService.chat([systemMessage, ...newMessages]);

      const assistantMessage: LLMMessage = {
        role: 'assistant',
        content: response,
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error: any) {
      const errorMessage: LLMMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please check your API key configuration.`,
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm('Clear conversation history?')) {
      setMessages([]);
    }
  };

  const extractCodeFromMessage = (content: string): string | null => {
    // Extract Python code blocks from markdown
    const codeBlockMatch = content.match(/```python\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1];
    }
    return null;
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  if (!isLLMReady) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <p className="text-gray-600 mb-2">AI Tutor not available</p>
          <p className="text-sm text-gray-500">Please configure your API key to enable the AI tutor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="font-semibold text-gray-900">AI Python Tutor</h3>
            <p className="text-xs text-gray-600">
              Powered by Claude {context && <span className="text-green-600">• 👁️ Watching your code</span>}
            </p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
          disabled={messages.length === 0}
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">👋 Hi! I'm your AI Python tutor.</p>
            <p className="text-sm mb-4">Ask me anything about Python, request exercises, or get help with your code!</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const codeSnippet = message.role === 'assistant' ? extractCodeFromMessage(message.content) : null;
            return (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-xs opacity-70 mb-1">
                    {message.role === 'user' ? 'You' : 'AI Tutor'}
                  </div>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  {codeSnippet && onCodeSuggestion && (
                    <button
                      onClick={() => onCodeSuggestion(codeSnippet)}
                      className="mt-2 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      📋 Copy to Editor
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="animate-pulse">🤔</span>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask a question or request help..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

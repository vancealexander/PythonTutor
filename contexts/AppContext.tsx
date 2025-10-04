'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProgress, APIKeyConfig } from '@/types';
import { storageService } from '@/lib/storage/localStorage';
import { llmService } from '@/lib/llm/llmService';
import { pyodideService } from '@/lib/python/pyodide';

interface AppContextType {
  apiConfig: APIKeyConfig;
  setAPIKey: (key: string) => void;
  setDuckDuckGoConfig: (workerUrl: string, apiKey: string) => void;
  removeAPIKey: () => void;
  userProgress: UserProgress | null;
  updateProgress: (progress: Partial<UserProgress>) => void;
  isPyodideReady: boolean;
  isLLMReady: boolean;
  isMounted: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [apiConfig, setApiConfig] = useState<APIKeyConfig>({
    anthropicKey: '',
    llmProvider: 'anthropic',
    isConfigured: false,
  });
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [isLLMReady, setIsLLMReady] = useState(false);

  // Initialize on mount
  useEffect(() => {
    setIsMounted(true);

    // Load API config
    const config = storageService.getAPIConfig();
    setApiConfig(config);

    if (config.isConfigured) {
      try {
        llmService.initialize(config);
        setIsLLMReady(true);
      } catch (error) {
        console.error('Failed to initialize LLM service:', error);
        setIsLLMReady(false);
      }
    }

    // Load or initialize progress
    const progress = storageService.getProgress();
    if (progress) {
      setUserProgress(progress);
    } else {
      const newProgress = storageService.initializeProgress();
      setUserProgress(newProgress);
    }

    // Initialize Pyodide with retry logic
    const initPyodide = async () => {
      let retries = 0;
      const maxRetries = 30; // Wait up to 15 seconds

      while (retries < maxRetries) {
        try {
          if (typeof window !== 'undefined' && window.loadPyodide) {
            await pyodideService.initialize();
            setIsPyodideReady(true);
            return;
          }
        } catch (err) {
          // Silent fail, will retry
        }

        // Wait 500ms before retry
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }

      console.error('Failed to initialize Pyodide');
    };

    initPyodide();
  }, []);

  const setAPIKey = (key: string) => {
    const config: APIKeyConfig = {
      anthropicKey: key,
      llmProvider: 'anthropic',
      isConfigured: true,
    };
    storageService.saveAPIConfig(config);
    llmService.initialize(config);
    setApiConfig(config);
    setIsLLMReady(true);
  };

  const setDuckDuckGoConfig = (workerUrl: string, apiKey: string) => {
    const config: APIKeyConfig = {
      anthropicKey: '',
      duckduckgoWorkerUrl: workerUrl,
      duckduckgoApiKey: apiKey,
      llmProvider: 'duckduckgo',
      isConfigured: true,
    };
    storageService.saveAPIConfig(config);
    try {
      llmService.initialize(config);
      setApiConfig(config);
      setIsLLMReady(true);
    } catch (error) {
      console.error('Failed to initialize DuckDuckGo service:', error);
      setIsLLMReady(false);
    }
  };

  const removeAPIKey = () => {
    const config: APIKeyConfig = {
      anthropicKey: '',
      llmProvider: 'anthropic',
      isConfigured: false,
    };
    storageService.saveAPIConfig(config);
    setApiConfig(config);
    setIsLLMReady(false);
  };

  const updateProgress = (updates: Partial<UserProgress>) => {
    if (!userProgress) return;

    const newProgress = {
      ...userProgress,
      ...updates,
      lastActivity: new Date().toISOString(),
    };

    setUserProgress(newProgress);
    storageService.saveProgress(newProgress);
  };

  return (
    <AppContext.Provider
      value={{
        apiConfig,
        setAPIKey,
        setDuckDuckGoConfig,
        removeAPIKey,
        userProgress,
        updateProgress,
        isPyodideReady,
        isLLMReady,
        isMounted,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

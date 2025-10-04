'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProgress, APIKeyConfig } from '@/types';
import { storageService } from '@/lib/storage/localStorage';
import { anthropicService } from '@/lib/llm/anthropic';
import { pyodideService } from '@/lib/python/pyodide';

interface AppContextType {
  apiConfig: APIKeyConfig;
  setAPIKey: (key: string) => void;
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
    isConfigured: false,
  });
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [isLLMReady, setIsLLMReady] = useState(false);

  // Initialize on mount
  useEffect(() => {
    setIsMounted(true);

    // Load API key
    const config = storageService.getAPIConfig();
    setApiConfig(config);

    if (config.isConfigured) {
      anthropicService.initialize(config.anthropicKey);
      setIsLLMReady(true);
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
    storageService.saveAPIKey(key);
    anthropicService.initialize(key);
    setApiConfig({
      anthropicKey: key,
      isConfigured: true,
    });
    setIsLLMReady(true);
  };

  const removeAPIKey = () => {
    storageService.removeAPIKey();
    setApiConfig({
      anthropicKey: '',
      isConfigured: false,
    });
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

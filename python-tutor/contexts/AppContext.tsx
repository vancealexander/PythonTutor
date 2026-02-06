'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

// Types
export interface APIConfig {
  llmProvider: 'anthropic' | 'openai' | 'free-trial';
  apiKey: string;
  isConfigured: boolean;
}

export interface UserProgress {
  currentPhase: number;
  completedLessons: string[];
  lastAccessedAt: string;
}

interface AppContextType {
  // Pyodide state
  isPyodideReady: boolean;

  // API Configuration
  apiConfig: APIConfig;
  setApiConfig: (config: APIConfig) => void;

  // User Progress
  userProgress: UserProgress | null;
  updateProgress: (progress: Partial<UserProgress>) => void;

  // Hydration fix
  isMounted: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [apiConfig, setApiConfigState] = useState<APIConfig>({
    llmProvider: 'free-trial',
    apiKey: '',
    isConfigured: true, // Free trial is auto-configured
  });
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load API configuration from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedConfig = localStorage.getItem('pythonTutor_apiConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setApiConfigState(config);
      } else {
        // Default to free trial
        const defaultConfig = {
          llmProvider: 'free-trial' as const,
          apiKey: '',
          isConfigured: true,
        };
        setApiConfigState(defaultConfig);
        localStorage.setItem('pythonTutor_apiConfig', JSON.stringify(defaultConfig));
      }
    } catch (error) {
      console.error('Failed to load API config:', error);
    }
  }, []);

  // Load user progress from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedProgress = localStorage.getItem('pythonTutor_progress');
      if (savedProgress) {
        setUserProgress(JSON.parse(savedProgress));
      } else {
        // Initialize default progress
        const defaultProgress: UserProgress = {
          currentPhase: 1,
          completedLessons: [],
          lastAccessedAt: new Date().toISOString(),
        };
        setUserProgress(defaultProgress);
        localStorage.setItem('pythonTutor_progress', JSON.stringify(defaultProgress));
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  }, []);

  // Initialize Pyodide
  useEffect(() => {
    const initPyodide = async () => {
      try {
        // Check if Pyodide is available
        if (typeof window !== 'undefined' && (window as any).loadPyodide) {
          // Pyodide is loaded, mark as ready
          setIsPyodideReady(true);
        } else {
          // Wait for Pyodide to load
          const checkPyodide = setInterval(() => {
            if ((window as any).loadPyodide) {
              setIsPyodideReady(true);
              clearInterval(checkPyodide);
            }
          }, 100);

          // Timeout after 30 seconds
          setTimeout(() => {
            clearInterval(checkPyodide);
            console.error('Pyodide failed to load');
          }, 30000);
        }
      } catch (error) {
        console.error('Error initializing Pyodide:', error);
      }
    };

    initPyodide();
  }, []);

  // Update API config and save to localStorage
  const setApiConfig = (config: APIConfig) => {
    setApiConfigState(config);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pythonTutor_apiConfig', JSON.stringify(config));
    }
  };

  // Update user progress and save to localStorage
  const updateProgress = (progressUpdate: Partial<UserProgress>) => {
    setUserProgress((prev) => {
      const updated = {
        ...prev!,
        ...progressUpdate,
        lastAccessedAt: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('pythonTutor_progress', JSON.stringify(updated));
      }

      return updated;
    });
  };

  // Auto-configure for paid users
  useEffect(() => {
    if (session?.user?.planType && session.user.planType !== 'free') {
      // For paid users, they get unlimited access
      if (apiConfig.llmProvider === 'free-trial') {
        setApiConfig({
          llmProvider: 'free-trial',
          apiKey: '',
          isConfigured: true,
        });
      }
    }
  }, [session]);

  const value: AppContextType = {
    isPyodideReady,
    apiConfig,
    setApiConfig,
    userProgress,
    updateProgress,
    isMounted,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

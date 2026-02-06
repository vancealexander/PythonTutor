import { UserProgress, APIKeyConfig } from '@/types';

const STORAGE_KEYS = {
  API_KEY: 'pythontutor_api_key',
  API_CONFIG: 'pythontutor_api_config',
  PROGRESS: 'pythontutor_progress',
  CONVERSATION_HISTORY: 'pythontutor_conversations',
} as const;

export const storageService = {
  // API Key Management
  saveAPIKey: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  },

  getAPIKey: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
  },

  removeAPIKey: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  },

  saveAPIConfig: (config: APIKeyConfig): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(config));
  },

  getAPIConfig: (): APIKeyConfig => {
    if (typeof window === 'undefined') {
      return {
        anthropicKey: '',
        llmProvider: 'anthropic',
        isConfigured: false,
      };
    }

    try {
      const configData = localStorage.getItem(STORAGE_KEYS.API_CONFIG);
      if (configData) {
        const parsed = JSON.parse(configData);
        // Ensure llmProvider is set
        if (!parsed.llmProvider) {
          parsed.llmProvider = 'anthropic';
        }
        return parsed;
      }
    } catch (error) {
      console.error('Error parsing API config:', error);
    }

    // Fallback to old API key format
    const key = storageService.getAPIKey();
    return {
      anthropicKey: key || '',
      llmProvider: 'anthropic',
      isConfigured: !!key,
    };
  },

  // Progress Tracking
  saveProgress: (progress: UserProgress): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  },

  getProgress: (): UserProgress | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return data ? JSON.parse(data) : null;
  },

  initializeProgress: (): UserProgress => {
    const defaultProgress: UserProgress = {
      currentPhase: 1,
      currentLesson: 0,
      completedLessons: [],
      completedProjects: [],
      strengths: [],
      weaknesses: [],
      lastActivity: new Date().toISOString(),
    };
    storageService.saveProgress(defaultProgress);
    return defaultProgress;
  },

  // Conversation History
  saveConversation: (lessonId: string, messages: { role: string; content: string }[]): void => {
    if (typeof window === 'undefined') return;
    const conversations = storageService.getAllConversations();
    conversations[lessonId] = messages;
    localStorage.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, JSON.stringify(conversations));
  },

  getConversation: (lessonId: string): { role: string; content: string }[] => {
    if (typeof window === 'undefined') return [];
    const conversations = storageService.getAllConversations();
    return conversations[lessonId] || [];
  },

  getAllConversations: (): Record<string, { role: string; content: string }[]> => {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(STORAGE_KEYS.CONVERSATION_HISTORY);
    return data ? JSON.parse(data) : {};
  },

  clearAllData: (): void => {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

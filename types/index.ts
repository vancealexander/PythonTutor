// Core Types
export interface UserProgress {
  currentPhase: number;
  currentLesson: number;
  completedLessons: string[];
  completedProjects: string[];
  strengths: string[];
  weaknesses: string[];
  lastActivity: string;
}

export interface LessonContent {
  id: string;
  title: string;
  phase: number;
  description: string;
  concepts: string[];
  code: string;
  exercises: Exercise[];
  hints: string[];
}

export interface Exercise {
  id: string;
  prompt: string;
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
}

export interface CodeExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
}

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface APIKeyConfig {
  anthropicKey: string;
  duckduckgoWorkerUrl?: string;
  duckduckgoApiKey?: string;
  llmProvider: 'anthropic' | 'duckduckgo';
  isConfigured: boolean;
}

export interface CurriculumTrack {
  id: string;
  name: string;
  description: string;
  phases: Phase[];
}

export interface Phase {
  id: number;
  name: string;
  description: string;
  topics: string[];
  estimatedHours: number;
}

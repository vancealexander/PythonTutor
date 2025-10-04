import { LLMMessage } from '@/types';

export class DuckDuckGoService {
  // Default to shared worker (free for all users)
  private workerUrl: string = 'https://python-tutor-ai.pythontutor.workers.dev';
  private apiKey: string | null = null;

  initialize(workerUrl?: string, apiKey?: string): void {
    if (workerUrl) {
      this.workerUrl = workerUrl;
    }
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }

  isInitialized(): boolean {
    return !!this.workerUrl;
  }

  async chat(messages: LLMMessage[], model: string = 'claude-3-haiku'): Promise<string> {
    if (!this.workerUrl) {
      throw new Error('DuckDuckGo service not initialized');
    }

    // Convert messages to OpenAI format
    const openAIMessages = messages.map(m => ({
      role: m.role === 'system' ? 'system' : m.role,
      content: m.content,
    }));

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Only add auth if API key is set (for custom workers)
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.workerUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: openAIMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DuckDuckGo API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
}

export const duckduckgoService = new DuckDuckGoService();

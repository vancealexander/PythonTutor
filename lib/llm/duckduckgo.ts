import { LLMMessage } from '@/types';

export class DuckDuckGoService {
  private workerUrl: string | null = null;
  private apiKey: string | null = null;

  initialize(workerUrl: string, apiKey: string): void {
    this.workerUrl = workerUrl;
    this.apiKey = apiKey;
  }

  isInitialized(): boolean {
    return !!this.workerUrl && !!this.apiKey;
  }

  async chat(messages: LLMMessage[], model: string = 'claude-3-haiku'): Promise<string> {
    if (!this.workerUrl || !this.apiKey) {
      throw new Error('DuckDuckGo service not initialized');
    }

    // Convert messages to OpenAI format
    const openAIMessages = messages.map(m => ({
      role: m.role === 'system' ? 'system' : m.role,
      content: m.content,
    }));

    const response = await fetch(`${this.workerUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
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

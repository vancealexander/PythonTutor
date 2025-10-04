import { LLMMessage, APIKeyConfig } from '@/types';
import { anthropicService } from './anthropic';
import { duckduckgoService } from './duckduckgo';

class LLMService {
  private currentProvider: 'anthropic' | 'duckduckgo' | null = null;

  initialize(config: APIKeyConfig): void {
    this.currentProvider = config.llmProvider;

    if (config.llmProvider === 'anthropic' && config.anthropicKey) {
      anthropicService.initialize(config.anthropicKey);
    } else if (config.llmProvider === 'duckduckgo' && config.duckduckgoWorkerUrl && config.duckduckgoApiKey) {
      duckduckgoService.initialize(config.duckduckgoWorkerUrl, config.duckduckgoApiKey);
    }
  }

  isReady(): boolean {
    if (this.currentProvider === 'anthropic') {
      return anthropicService.isInitialized();
    } else if (this.currentProvider === 'duckduckgo') {
      return duckduckgoService.isInitialized();
    }
    return false;
  }

  async chat(messages: LLMMessage[]): Promise<string> {
    if (this.currentProvider === 'anthropic') {
      return anthropicService.chat(messages);
    } else if (this.currentProvider === 'duckduckgo') {
      return duckduckgoService.chat(messages);
    }
    throw new Error('No LLM provider configured');
  }
}

export const llmService = new LLMService();

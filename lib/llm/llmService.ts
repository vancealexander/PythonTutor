import { LLMMessage, APIKeyConfig } from '@/types';
import { anthropicService } from './anthropic';
import { duckduckgoService } from './duckduckgo';

class LLMService {
  private currentProvider: 'anthropic' | 'duckduckgo' | null = null;

  initialize(config: APIKeyConfig): void {
    console.log('🔧 LLMService.initialize called with config:', config);
    this.currentProvider = config.llmProvider;

    if (config.llmProvider === 'anthropic' && config.anthropicKey) {
      console.log('🔧 Initializing Anthropic service...');
      anthropicService.initialize(config.anthropicKey);
      console.log('✅ Anthropic service initialized');
    } else if (config.llmProvider === 'duckduckgo') {
      console.log('🔧 Initializing DuckDuckGo service...');
      // Initialize with default worker URL (empty strings will use defaults)
      duckduckgoService.initialize(config.duckduckgoWorkerUrl, config.duckduckgoApiKey);
      console.log('✅ DuckDuckGo service initialized');
    } else {
      console.warn('⚠️ No valid provider configuration found');
    }
  }

  isReady(): boolean {
    console.log('🔧 LLMService.isReady check, currentProvider:', this.currentProvider);
    if (this.currentProvider === 'anthropic') {
      const ready = anthropicService.isInitialized();
      console.log('🔧 Anthropic ready:', ready);
      return ready;
    } else if (this.currentProvider === 'duckduckgo') {
      const ready = duckduckgoService.isInitialized();
      console.log('🔧 DuckDuckGo ready:', ready);
      return ready;
    }
    console.warn('⚠️ No provider configured, returning false');
    return false;
  }

  async chat(messages: LLMMessage[]): Promise<string> {
    console.log('💬 LLMService.chat called, currentProvider:', this.currentProvider);
    if (this.currentProvider === 'anthropic') {
      console.log('💬 Routing to Anthropic...');
      return anthropicService.chat(messages);
    } else if (this.currentProvider === 'duckduckgo') {
      console.log('💬 Routing to DuckDuckGo...');
      return duckduckgoService.chat(messages);
    }
    console.error('❌ No LLM provider configured!');
    throw new Error('No LLM provider configured');
  }
}

export const llmService = new LLMService();

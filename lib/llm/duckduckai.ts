import { LLMMessage } from '@/types';

/**
 * DuckDuckAI Service - Free AI Chat using DuckDuckGo's duck.ai
 * This runs Python code in Pyodide to call the duckai library
 */
export class DuckDuckAIService {
  private pyodide: any = null;
  private isInitialized = false;

  async initialize(pyodideInstance: any): Promise<void> {
    console.log('🦆 Initializing DuckDuckAI service...');
    this.pyodide = pyodideInstance;

    try {
      // Install duckai package via micropip
      await this.pyodide.loadPackage('micropip');

      console.log('🦆 Installing duckai package...');
      await this.pyodide.runPythonAsync(`
        import micropip
        await micropip.install('duckai')
      `);

      console.log('🦆 Testing duckai import...');
      await this.pyodide.runPythonAsync(`
        from duckai import ask
        print("DuckDuckAI successfully imported!")
      `);

      this.isInitialized = true;
      console.log('✅ DuckDuckAI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize DuckDuckAI:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.isInitialized && !!this.pyodide;
  }

  async chat(
    messages: LLMMessage[],
    model: string = 'claude-3-haiku-20240307'
  ): Promise<string> {
    if (!this.isReady()) {
      throw new Error('DuckDuckAI not initialized');
    }

    console.log('🦆 DuckDuckAI chat called with model:', model);

    // Extract the last user message (simple implementation)
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop();

    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    const query = lastUserMessage.content;

    try {
      // Set the query and model in Python scope
      this.pyodide.globals.set('query', query);
      this.pyodide.globals.set('model', model);

      console.log('🦆 Sending query to DuckDuckAI...');

      // Call duckai and get response
      const response = await this.pyodide.runPythonAsync(`
from duckai import ask

# Get non-streaming response
response = ask(query, stream=False, model=model)
response
      `);

      console.log('🦆 Got response from DuckDuckAI:', response);
      return response || 'No response from AI';

    } catch (error: any) {
      console.error('🦆 DuckDuckAI error:', error);

      // Check if it's a CORS or network error
      if (error.message?.includes('CORS') || error.message?.includes('fetch')) {
        throw new Error('DuckDuckAI network error: Browser CORS restriction. A Cloudflare Worker proxy is needed.');
      }

      throw new Error(`DuckDuckAI error: ${error.message || String(error)}`);
    }
  }

  async chatStreaming(
    messages: LLMMessage[],
    model: string = 'claude-3-haiku-20240307',
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.isReady()) {
      throw new Error('DuckDuckAI not initialized');
    }

    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop();

    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    const query = lastUserMessage.content;

    try {
      this.pyodide.globals.set('query', query);
      this.pyodide.globals.set('model', model);

      // This is tricky - we need to stream from Python to JS
      // For now, fall back to non-streaming
      const response = await this.chat(messages, model);
      onChunk(response);

    } catch (error: any) {
      throw new Error(`DuckDuckAI streaming error: ${error.message || String(error)}`);
    }
  }
}

export const duckDuckAIService = new DuckDuckAIService();

import { LLMMessage } from '@/types';

class FreeTrialService {
  private remaining: number = 5;
  private resetTime: number = 0;

  async chat(messages: LLMMessage[]): Promise<string> {
    try {
      // Call our secure backend API route
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      // Update rate limit info from headers
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      const rateLimitReset = response.headers.get('X-RateLimit-Reset');

      if (rateLimitRemaining) {
        this.remaining = parseInt(rateLimitRemaining, 10);
      }

      if (rateLimitReset) {
        this.resetTime = parseInt(rateLimitReset, 10);
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limit error
        if (response.status === 429) {
          throw new Error(data.message || 'Free trial limit reached. Please upgrade or use your own API key.');
        }
        // Use the detailed message from the API if available
        throw new Error(data.message || data.error || 'AI request failed');
      }

      // Update from response body as well
      if (data.remaining !== undefined) {
        this.remaining = data.remaining;
      }

      if (data.resetTime) {
        this.resetTime = data.resetTime;
      }

      return data.message;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to communicate with AI service');
    }
  }

  getRemaining(): number {
    return this.remaining;
  }

  getResetTime(): number {
    return this.resetTime;
  }

  isInitialized(): boolean {
    return true; // Free trial is always available
  }
}

export const freeTrialService = new FreeTrialService();

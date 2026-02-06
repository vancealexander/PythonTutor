import Anthropic from '@anthropic-ai/sdk';
import { LLMMessage } from '@/types';

interface UserProgressInput {
  strengths: string[];
  weaknesses: string[];
  completedLessons: string[];
}

export class AnthropicService {
  private client: Anthropic | null = null;
  private apiKey: string | null = null;

  initialize(apiKey: string): void {
    this.apiKey = apiKey;
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true, // Client-side usage
    });
  }

  isInitialized(): boolean {
    return !!this.client;
  }

  async generateLesson(
    phase: number,
    topic: string,
    userProgress: UserProgressInput
  ): Promise<string> {
    if (!this.client) throw new Error('Anthropic client not initialized');

    const prompt = this.buildLessonPrompt(phase, topic, userProgress);

    const response = await this.client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  async generateExercise(
    concept: string,
    difficulty: 'easy' | 'medium' | 'hard',
    userWeaknesses: string[]
  ): Promise<string> {
    if (!this.client) throw new Error('Anthropic client not initialized');

    const prompt = this.buildExercisePrompt(concept, difficulty, userWeaknesses);

    const response = await this.client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  async reviewCode(
    code: string,
    exercise: string,
    error?: string
  ): Promise<string> {
    if (!this.client) throw new Error('Anthropic client not initialized');

    const prompt = this.buildCodeReviewPrompt(code, exercise, error);

    const response = await this.client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  async getHint(
    exercise: string,
    currentCode: string,
    attemptNumber: number
  ): Promise<string> {
    if (!this.client) throw new Error('Anthropic client not initialized');

    const prompt = this.buildHintPrompt(exercise, currentCode, attemptNumber);

    const response = await this.client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  async chat(messages: LLMMessage[]): Promise<string> {
    if (!this.client) throw new Error('Anthropic client not initialized');

    const anthropicMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const systemMessage = messages.find(m => m.role === 'system')?.content;

    const response = await this.client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      system: systemMessage,
      messages: anthropicMessages,
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  private buildLessonPrompt(phase: number, topic: string, userProgress: UserProgressInput): string {
    return `You are an expert Python sensei. Generate a comprehensive lesson for Phase ${phase} on the topic: "${topic}".

User Progress:
- Strengths: ${userProgress.strengths.join(', ') || 'None yet'}
- Weaknesses: ${userProgress.weaknesses.join(', ') || 'None yet'}
- Completed Lessons: ${userProgress.completedLessons.length}

Create a lesson that includes:
1. Clear explanation of the concept
2. Real-world examples
3. 2-3 code examples with increasing complexity
4. Common pitfalls to avoid

Format as JSON:
{
  "title": "Lesson title",
  "description": "Brief description",
  "concepts": ["concept1", "concept2"],
  "explanation": "Detailed explanation with examples",
  "codeExamples": [
    {
      "title": "Example 1",
      "code": "Python code here",
      "explanation": "What this does"
    }
  ],
  "commonMistakes": ["mistake1", "mistake2"]
}`;
  }

  private buildExercisePrompt(
    concept: string,
    difficulty: string,
    weaknesses: string[]
  ): string {
    return `Generate a ${difficulty} Python coding exercise focused on: ${concept}

${weaknesses.length > 0 ? `User struggles with: ${weaknesses.join(', ')}` : ''}

Create an exercise as JSON:
{
  "prompt": "Clear problem statement",
  "starterCode": "# Starting code template",
  "solution": "Complete solution",
  "testCases": [
    {"input": "test input", "expectedOutput": "expected result", "description": "what it tests"}
  ],
  "hints": ["hint1", "hint2", "hint3"]
}`;
  }

  private buildCodeReviewPrompt(code: string, exercise: string, error?: string): string {
    return `Review this Python code for the exercise: "${exercise}"

Code:
\`\`\`python
${code}
\`\`\`

${error ? `Error encountered:\n${error}\n` : ''}

Provide:
1. What's working well
2. What needs improvement (if any errors, explain them clearly)
3. Specific suggestions for fixes
4. Best practices tips

Be encouraging and educational. Keep response concise.`;
  }

  private buildHintPrompt(exercise: string, currentCode: string, attemptNumber: number): string {
    const hintLevel = attemptNumber <= 1 ? 'gentle' : attemptNumber <= 3 ? 'moderate' : 'direct';

    return `Provide a ${hintLevel} hint for this exercise: "${exercise}"

Current code:
\`\`\`python
${currentCode}
\`\`\`

Attempt number: ${attemptNumber}

Give a hint that guides without giving the solution. ${
      hintLevel === 'direct' ? 'Be more specific since they\'ve tried multiple times.' : ''
    }`;
  }
}

export const anthropicService = new AnthropicService();

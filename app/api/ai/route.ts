import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter for MVP (IP-based)
// For production, use @upstash/ratelimit with Redis
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 5; // Free trial limit
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function getClientIP(request: NextRequest): string {
  // Try to get real IP from headers (Vercel provides this)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  // Fallback (shouldn't happen on Vercel)
  return 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = requestCounts.get(ip);

  // No record or window expired - reset
  if (!record || now > record.resetTime) {
    const resetTime = now + WINDOW_MS;
    requestCounts.set(ip, { count: 1, resetTime });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetTime };
  }

  // Within window - check limit
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count, resetTime: record.resetTime };
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIP);

    if (!rateLimitResult.allowed) {
      const timeUntilReset = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000 / 60); // minutes
      return NextResponse.json(
        {
          error: 'Free trial limit reached',
          message: `You've used all 5 free requests. Trial resets in ${timeUntilReset} minutes, or upgrade for unlimited access.`,
          remaining: 0,
          resetTime: rateLimitResult.resetTime
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { messages } = body;

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    // Get API key from environment (never exposed to client)
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'sk-ant-your-api-key-here') {
      console.error('ANTHROPIC_API_KEY not configured in environment variables');
      return NextResponse.json(
        {
          error: 'API key required',
          message: 'Free trial requires server configuration. Please add your Anthropic API key to continue, or sign up for a paid plan for instant access.',
          needsUpgrade: true
        },
        { status: 503 }
      );
    }

    // Separate system message from conversation messages
    const systemMessage = messages.find((m: { role: string; content: string }) => m.role === 'system');
    const conversationMessages = messages.filter((m: { role: string; content: string }) => m.role !== 'system');

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2048,
        system: systemMessage?.content || 'You are an expert Python sensei.',
        messages: conversationMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return NextResponse.json(
        { error: 'AI service error' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract response text
    const assistantMessage = data.content?.[0]?.text || '';

    // Return response with rate limit headers
    return NextResponse.json(
      {
        message: assistantMessage,
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime
      },
      {
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        }
      }
    );

  } catch (error) {
    console.error('AI API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

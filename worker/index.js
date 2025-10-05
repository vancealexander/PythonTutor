/**
 * DuckDuckGo AI Proxy Worker for Python Tutor
 *
 * This worker proxies requests to DuckDuckGo's AI chat service
 * and provides an OpenAI-compatible API endpoint.
 */

const DUCKDUCKGO_API = 'https://duckduckgo.com/duckchat/v1/chat';
const DUCKDUCKGO_STATUS = 'https://duckduckgo.com/duckchat/v1/status';

// Available models
const MODELS = {
  'gpt-4o-mini': 'gpt-4o-mini',
  'claude-3-haiku': 'claude-3-haiku-20240307',
  'llama-3.3-70b': 'meta-llama/Meta-Llama-3.3-70B-Instruct-Turbo',
  'mistral-small': 'mistralai/Mistral-Small-24B-Instruct-2501',
};

async function handleRequest(request, env) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const { model = 'claude-3-haiku', messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get VQD token
    const statusResponse = await fetch(DUCKDUCKGO_STATUS, {
      method: 'GET',
      headers: {
        'x-vqd-accept': '1',
      },
    });

    // DuckDuckGo now uses x-vqd-hash-1 instead of x-vqd-4
    const vqd = statusResponse.headers.get('x-vqd-hash-1') || statusResponse.headers.get('x-vqd-4');
    if (!vqd) {
      throw new Error('Failed to get VQD token');
    }

    // Convert messages to DuckDuckGo format
    const ddgMessages = messages.map(msg => ({
      role: msg.role === 'system' ? 'user' : msg.role,
      content: msg.content,
    }));

    // Make request to DuckDuckGo
    const chatResponse = await fetch(DUCKDUCKGO_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vqd-hash-1': vqd,  // Updated header name
      },
      body: JSON.stringify({
        model: MODELS[model] || MODELS['claude-3-haiku'],
        messages: ddgMessages,
      }),
    });

    if (!chatResponse.ok) {
      throw new Error(`DuckDuckGo API error: ${chatResponse.status}`);
    }

    // Stream the response
    const reader = chatResponse.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.message) {
              fullText += parsed.message;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    // Return OpenAI-compatible response
    const response = {
      id: 'chatcmpl-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: fullText,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};

# Python Tutor AI Worker

This Cloudflare Worker provides a free AI chat API for Python Tutor by proxying requests to DuckDuckGo's AI service.

## Features

- ✅ Free tier: 100,000 requests/day
- ✅ OpenAI-compatible API
- ✅ Multiple models: Claude Haiku, GPT-4o-mini, Llama 3.3, Mistral
- ✅ No API key required for users
- ✅ CORS enabled for browser access

## Deployment

### Prerequisites

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

### Deploy

From the `worker` directory:

```bash
wrangler deploy
```

Your worker will be available at:
```
https://python-tutor-ai.YOUR-SUBDOMAIN.workers.dev
```

## Usage

### API Endpoint

```
POST https://python-tutor-ai.YOUR-SUBDOMAIN.workers.dev/v1/chat/completions
```

### Request Format

```json
{
  "model": "claude-3-haiku",
  "messages": [
    {
      "role": "user",
      "content": "Explain Python lists"
    }
  ]
}
```

### Available Models

- `claude-3-haiku` (default)
- `gpt-4o-mini`
- `llama-3.3-70b`
- `mistral-small`

### Response Format

OpenAI-compatible:

```json
{
  "id": "chatcmpl-1234567890",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "claude-3-haiku",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Python lists are ordered collections..."
      },
      "finish_reason": "stop"
    }
  ]
}
```

## Costs

- **Free tier**: 100,000 requests/day (more than enough for most apps)
- **Paid tier**: $5/month for 10 million requests (if you exceed free tier)

## Notes

- This worker proxies DuckDuckGo's AI service
- No authentication required (rate limiting handled by Cloudflare)
- DuckDuckGo may rate limit or change their API
- For production apps with high traffic, consider Anthropic API as backup

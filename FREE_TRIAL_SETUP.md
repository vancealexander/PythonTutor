# Free Trial Setup Guide

This document explains how to configure the free trial feature that allows users to try Python Tutor without their own API key.

## Overview

The free trial system allows users to:
- Try the app with **5 free requests per day** (IP-based)
- No account or signup required
- After 5 requests, users must either:
  - Wait 24 hours for reset
  - Add their own Anthropic API key
  - (Future) Subscribe for unlimited access

## How It Works

1. **Backend API Route**: `/app/api/ai/route.ts` acts as a secure proxy
2. **Your API Key**: Stored in Vercel environment variables (never exposed to client)
3. **Rate Limiting**: Simple in-memory IP-based tracking (5 requests/24h)
4. **User Flow**: Click "Try Free Trial" → Instant access

## Setup Instructions

### Local Development

1. **Copy the environment template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Add your Anthropic API key**:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   ```

3. **Get an API key** (if you don't have one):
   - Go to [https://console.anthropic.com](https://console.anthropic.com)
   - Create an account and add credits ($5 minimum)
   - Generate an API key
   - Uses Claude 3.5 Haiku (~$0.25 per 1M tokens = very cheap)

4. **Start the dev server**:
   ```bash
   npm run dev
   ```

5. **Test the free trial**:
   - Open http://localhost:3000
   - Click "Try Free Trial"
   - Ask the AI tutor a question
   - Watch the counter decrease (shown in yellow banner)

### Production Deployment (Vercel)

1. **Set environment variable in Vercel**:
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add: `ANTHROPIC_API_KEY` = `sk-ant-your-key-here`
   - Save

2. **Redeploy**:
   - Push to main branch, or
   - Trigger manual deployment from Vercel dashboard

3. **Monitor usage**:
   - Check Anthropic console for API usage
   - Estimated cost: ~$0.50/month for 1000 free trial requests

## Cost Estimation

**Claude 3.5 Haiku Pricing** (as of Oct 2025):
- Input: $0.25 / 1M tokens
- Output: $1.25 / 1M tokens

**Typical request**:
- Input: ~500 tokens (system prompt + user question + code context)
- Output: ~300 tokens (AI response)

**Cost per request**: ~$0.0005 (half a cent)

**Monthly estimates**:
- 100 users × 5 requests = 500 requests = **$0.25/month**
- 1,000 users × 5 requests = 5,000 requests = **$2.50/month**
- 10,000 users × 5 requests = 50,000 requests = **$25/month**

## Security Features

✅ **API Key Protection**:
- Stored in environment variables (encrypted at rest)
- Never sent to client-side
- Not visible in browser DevTools or network requests

✅ **Rate Limiting**:
- IP-based tracking prevents abuse
- 5 requests per 24-hour window
- Automatic reset after window expires

✅ **Request Validation**:
- Sanitizes user input
- Validates message format
- Error handling for edge cases

## Upgrade Path (Future)

When ready to monetize, you can add:

### Option 1: Subscription (SaaS)
- Integrate Stripe
- Add auth (NextAuth.js + Supabase)
- Create subscription tiers:
  - Free: 5 requests/day
  - Basic ($9/mo): 100 requests/month OR bring-your-own-key
  - Pro ($19/mo): Unlimited requests (your key)

### Option 2: One-Time Purchase
- $29 one-time: Unlock bring-your-own-API-key mode forever
- $49 one-time: Lifetime unlimited (your key, no limits)

### Option 3: Credit System
- Buy credits: $5 for 50 requests, $15 for 200 requests
- Credits never expire
- OR unlock BYOK mode for $49

## Limitations & Next Steps

**Current Implementation**:
- ⚠️ In-memory rate limiting (resets on server restart)
- ⚠️ Not suitable for multi-server deployments

**Production-Ready Improvements** (when scaling):
1. Replace in-memory tracking with Redis (Upstash)
2. Add proper analytics/logging
3. Implement user authentication (NextAuth.js)
4. Add payment processing (Stripe)
5. Create admin dashboard for monitoring

**To upgrade rate limiting to Redis**:
```bash
npm install @upstash/ratelimit @upstash/redis
```

Then update `/app/api/ai/route.ts` to use Upstash Redis instead of in-memory Map.

## Testing

**Test Rate Limiting**:
1. Open browser
2. Click "Try Free Trial"
3. Send 5 requests
4. 6th request should show error: "Free trial limit reached"
5. Banner should show 0/5 remaining

**Test Reset Time**:
- Wait 24 hours OR
- Clear browser cache + restart dev server OR
- Use incognito/different IP

## Support

For issues or questions:
- Check Vercel deployment logs
- Verify environment variable is set
- Test API key directly at console.anthropic.com

## Security Notes

**NEVER** commit `.env.local` to git!
The `.gitignore` file already excludes it, but double-check:
```bash
git status
# Should NOT show .env.local
```

**In production**:
- Vercel environment variables are encrypted at rest
- Only accessible to your deployment
- Can be rotated anytime via dashboard

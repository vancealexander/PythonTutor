# Quick Start - Local Testing (5 Minutes)

Test the complete authentication and payment flow locally without any external services!

## 1. Setup Environment (2 minutes)

Create `.env.local`:

```bash
# Generate secret: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=paste-generated-secret-here

# Your Anthropic API key (for AI tutor)
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**That's it!** No Supabase, no Stripe, no OAuth setup needed.

## 2. Start Server (30 seconds)

```bash
npm install
npm run dev
```

## 3. Test Features (2 minutes)

### Free Trial
1. Open http://localhost:3000
2. Click "Try Free Trial (5 requests)"
3. Make 5 AI requests → see counter

### User Authentication
1. Go to http://localhost:3000/auth/signin
2. Click blue "test@example.com" button (auto-login)
3. You're in!

### Subscription Upgrade
1. Go to http://localhost:3000/dashboard
2. Click "Upgrade to Basic" or "Upgrade to Pro"
3. Watch console logs - mock payment completes
4. Plan updates instantly!

### Test Accounts
- `test@example.com` / `test123` - Free tier
- `pro@example.com` / `test123` - Pro tier (pre-upgraded)

## What Works

✅ Authentication (email/password)
✅ Session management (JWT)
✅ Free trial rate limiting (5/day)
✅ Mock payment processing
✅ Subscription upgrades
✅ User dashboard
✅ All without external services!

## Next Steps

- **Keep testing locally**: Everything works offline
- **Add real services**: See `FULL_SETUP.md` for Supabase + Stripe
- **Deploy**: See `DEPLOYMENT.md` for Vercel

## Troubleshooting

**Can't sign in?**
- Use test credentials: `test@example.com` / `test123`

**NEXTAUTH_SECRET error?**
```bash
openssl rand -base64 32
```

## Full Documentation

- `LOCAL_TESTING.md` - Complete testing guide
- `FULL_SETUP.md` - Production setup (Supabase + Stripe)
- `SUPABASE_SETUP.md` - Database configuration
- `FREE_TRIAL_SETUP.md` - Free trial details

---

**🎉 You're ready to test!** Start the dev server and open http://localhost:3000

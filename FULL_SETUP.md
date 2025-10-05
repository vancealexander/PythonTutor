# Complete Setup Guide - Python Tutor with Auth & Payments

This guide walks through the **complete setup** for Python Tutor with authentication, database, and payment processing. It integrates all the components needed for a production SaaS application.

## Overview

**What we're building**:
- ✅ Free trial (5 requests/day, no login required)
- ✅ User authentication (Email, Google, GitHub)
- ✅ Database storage (Supabase - user data, progress, subscriptions)
- ✅ Payment processing (Stripe - subscriptions)
- ✅ Three tiers: Free Trial, Basic ($9/mo), Pro ($19/mo)

**Tech Stack**:
- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS
- **Auth**: NextAuth.js with Supabase adapter
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Hosting**: Vercel
- **AI**: Anthropic Claude 3.5 Haiku

---

## Part 1: Prerequisites

### Required Accounts

1. **Anthropic** - [https://console.anthropic.com](https://console.anthropic.com)
   - Free: $5 minimum credit purchase
   - Used for AI tutoring (very cheap: ~$0.25/1M tokens)

2. **Supabase** - [https://supabase.com](https://supabase.com)
   - Free tier: 500MB database, 50k MAU
   - Used for auth + database

3. **Stripe** - [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Free (2.9% + $0.30 per transaction)
   - Used for payment processing

4. **Vercel** - [https://vercel.com](https://vercel.com)
   - Free tier: perfect for this project
   - Used for hosting

### Optional OAuth Accounts

5. **Google Cloud** - For Google OAuth
6. **GitHub** - For GitHub OAuth

---

## Part 2: Supabase Setup

Follow the detailed guide: **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

**Quick steps**:
1. Create Supabase project
2. Run `supabase/schema.sql` in SQL Editor
3. Get API credentials (URL + anon key + service role key)
4. (Optional) Configure OAuth providers

**You'll need**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Part 3: Stripe Setup

### 3.1 Create Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Complete signup
3. Start in **Test Mode** (toggle in top-right)

### 3.2 Create Products & Prices

1. **Go to Products** → Click "+ Add Product"

2. **Create Basic Plan**:
   - Name: `Python Tutor - Basic`
   - Description: `100 AI requests/month OR unlimited with your own API key`
   - Pricing:
     - Model: Recurring
     - Price: $9
     - Billing period: Monthly
   - Click "Save product"
   - **Copy the Price ID** (starts with `price_`)

3. **Create Pro Plan**:
   - Name: `Python Tutor - Pro`
   - Description: `Unlimited AI requests (no API key needed) + priority support`
   - Pricing:
     - Model: Recurring
     - Price: $19
     - Billing period: Monthly
   - Click "Save product"
   - **Copy the Price ID**

### 3.3 Get API Keys

1. **Go to Developers** → API Keys
2. **Copy**:
   - Publishable key (`pk_test_...`)
   - Secret key (`sk_test_...`)

### 3.4 Set up Webhook (Later - after deployment)

We'll configure this after deploying to Vercel.

---

## Part 4: OAuth Setup (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search "Google+ API" → Enable
4. **Create OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - User Type: External
   - Fill in app name, email, etc.
5. **Create Credentials**:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (dev)
     - `https://your-app.vercel.app/api/auth/callback/google` (prod - add later)
   - Click "Create"
   - **Copy Client ID and Client Secret**

6. **Add to Supabase** (if using Supabase Auth):
   - Go to Supabase → Authentication → Providers
   - Enable Google
   - Paste Client ID and Secret

### GitHub OAuth

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in:
   - Application name: Python Tutor
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. **Copy Client ID**
6. Click "Generate a new client secret" → **Copy it**
7. **Add production callback later**: `https://your-app.vercel.app/api/auth/callback/github`

---

## Part 5: Local Development Setup

### 5.1 Install Dependencies

Already done if you ran:
```bash
npm install
```

### 5.2 Configure Environment Variables

1. **Copy template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in all values** in `.env.local`:

```bash
# Anthropic (Required)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...

# NextAuth (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=run: openssl rand -base64 32

# OAuth (Optional - leave blank if not using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-secret

# Email (Optional - for magic links)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your@email.com
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=noreply@pythontutor.app

# Stripe (Required for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (leave blank for now)

# Stripe Price IDs (from Part 3.2)
STRIPE_PRICE_ID_BASIC=price_xxxxx
STRIPE_PRICE_ID_PRO=price_xxxxx
```

### 5.3 Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in `.env.local`.

### 5.4 Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Part 6: Testing Locally

### Test Free Trial (No Auth)

1. Open http://localhost:3000
2. Click "Try Free Trial"
3. Ask AI a question
4. Check banner shows "4/5 remaining"
5. Make 5 requests total
6. 6th request should show error

### Test Authentication

1. Click "Sign In" (we'll create this UI next)
2. Try Email/Google/GitHub login
3. Verify user created in Supabase:
   - Go to Supabase Dashboard → Table Editor → users
   - Should see your user

### Test Subscription Flow (Once Stripe is integrated)

1. Sign in
2. Go to Pricing page
3. Click "Subscribe to Basic"
4. Enter Stripe test card: `4242 4242 4242 4242`
5. Verify subscription in Stripe Dashboard
6. Check Supabase → user_subscriptions table

---

## Part 7: Vercel Deployment

### 7.1 Push to GitHub

```bash
git add -A
git commit -m "feat: Add auth, database, and payment processing"
git push origin main
```

### 7.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. **Add Environment Variables** (copy from `.env.local`):
   - Click "Environment Variables"
   - Paste all variables from `.env.local`
   - **Change `NEXTAUTH_URL` to your production URL** (e.g., `https://pythontutor.vercel.app`)
5. Click "Deploy"

### 7.3 Configure Stripe Webhook

1. **Get your deployed URL** (e.g., `https://pythontutor.vercel.app`)
2. **Go to Stripe Dashboard** → Developers → Webhooks
3. **Click "+ Add endpoint"**
4. **Endpoint URL**: `https://your-app.vercel.app/api/webhooks/stripe`
5. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. **Click "Add endpoint"**
7. **Copy "Signing secret"** (starts with `whsec_`)
8. **Add to Vercel**:
   - Go to Vercel Project → Settings → Environment Variables
   - Add `STRIPE_WEBHOOK_SECRET` = `whsec_...`
   - Redeploy project

### 7.4 Update OAuth Redirect URLs

Add production URLs to:
- **Google Cloud Console**: Add `https://your-app.vercel.app/api/auth/callback/google`
- **GitHub OAuth App**: Add `https://your-app.vercel.app/api/auth/callback/github`

---

## Part 8: Monitoring & Maintenance

### Supabase

- **Database Usage**: Dashboard → Database → Storage
- **Active Users**: Dashboard → Authentication → Users
- **Logs**: Dashboard → Logs

### Stripe

- **Customers**: Dashboard → Customers
- **Subscriptions**: Dashboard → Subscriptions
- **Revenue**: Dashboard → Home
- **Failed Payments**: Dashboard → Payments

### Vercel

- **Deployment Logs**: Project → Deployments → [Latest] → View Function Logs
- **Analytics**: Project → Analytics
- **Errors**: Project → Logs

---

## Part 9: Cost Estimation

### Free Tier (No costs)

**Until you hit limits**:
- Vercel: Free (100GB bandwidth)
- Supabase: Free (500MB DB, 50k MAU)
- Anthropic: Only pay for what you use

### Operating Costs (Example)

**1,000 monthly active users**:
- **Supabase**: $0 (under free tier limit)
- **Vercel**: $0 (under free tier limit)
- **Anthropic**: ~$2.50 (1,000 users × 5 free requests = 5,000 requests @ $0.0005 each)
- **Stripe**: $0 (no fees until you have paid subscriptions)
- **Total**: ~$2.50/month

**With 100 paying subscribers** ($9/mo average):
- **Revenue**: $900/month
- **Stripe fees** (2.9% + $0.30): ~$56
- **Operating costs**: ~$10 (upgraded tiers as needed)
- **Net profit**: ~$834/month

---

## Part 10: Next Steps

Now that the infrastructure is set up, you need to build the UI components:

1. ✅ Authentication pages (signin, signup)
2. ✅ Pricing page with Stripe checkout
3. ✅ User dashboard (subscription management)
4. ✅ Protected API routes (check subscription status)
5. ✅ Admin panel (view users, subscriptions)

See the continuation in the next phase of development!

---

## Troubleshooting

**"Module not found" errors**:
```bash
npm install
```

**Auth not working**:
- Check all NextAuth env vars are set
- Verify `NEXTAUTH_SECRET` is generated
- Check `NEXTAUTH_URL` matches your domain

**Supabase connection failed**:
- Verify project is active (not paused)
- Check URL and keys are correct
- Ensure RLS policies are configured

**Stripe webhook not working**:
- Verify webhook secret is correct
- Check Vercel deployment logs
- Test with Stripe CLI locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## Support & Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Anthropic Docs](https://docs.anthropic.com)

For issues with this setup, check the individual guide files:
- `SUPABASE_SETUP.md` - Database setup
- `FREE_TRIAL_SETUP.md` - Free trial configuration
- `STRIPE_SETUP.md` - Payment processing (to be created)

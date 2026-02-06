# Stripe Production Setup - Quick Checklist

## ✅ What's Already Done

1. **Stripe Live Keys Configured** - Your `.env.production` already has:
   - Live publishable key: `pk_live_51StQzeJ7a...`
   - Live secret key: `sk_live_51StQzeJ7a...`
   - Live price IDs for Basic and Pro plans

2. **Production URL Set** - Updated `NEXTAUTH_URL=https://pythonninja.app`

3. **Code Ready for Production**:
   - Webhook handler supports both mock and production databases
   - Client/server code properly separated
   - Mock database updated with all necessary methods
   - Test payments verified working with Stripe test cards

4. **Database Schema** - Complete schema exists at [`supabase/schema.sql`](supabase/schema.sql)

---

## 🚨 Critical Blocker: Supabase Database Paused

Your Supabase project `qxzlrraxyvnbruoaizcc` has been paused for 90+ days.

### Option 1: Restore Existing Project (Fastest)

1. **Contact Supabase Support**:
   - Go to: https://supabase.com/dashboard/support
   - Request restoration of project ref: `qxzlrraxyvnbruoaizcc`
   - Mention it's been paused 90+ days

2. **Once restored**, uncomment in `.env.production`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://qxzlrraxyvnbruoaizcc.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

3. **Verify database schema** by running the schema file in Supabase SQL Editor

### Option 2: Create New Supabase Project

1. **Create new project**: https://supabase.com/dashboard

2. **Run database schema**:
   ```bash
   cd python-tutor
   # Copy contents of supabase/schema.sql
   # Paste into Supabase SQL Editor and execute
   ```

3. **Update `.env.production`** with new project credentials:
   - Get URL from: Settings → API → Project URL
   - Get key from: Settings → API → service_role key

---

## 📋 Remaining Production Steps

### 1. Configure Stripe Webhook

Once your production app is deployed:

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://pythonninja.app/api/stripe/webhook`
4. Select events:
   - ✓ `checkout.session.completed`
   - ✓ `customer.subscription.created`
   - ✓ `customer.subscription.updated`
   - ✓ `customer.subscription.deleted`
   - ✓ `invoice.payment_succeeded`
   - ✓ `invoice.payment_failed`

5. Copy the webhook signing secret (starts with `whsec_`)
6. Add to `.env.production`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 2. Verify Stripe Products

Check that these products exist in your Live dashboard:
- https://dashboard.stripe.com/products

You should see:
- **Basic Plan** (`price_1Stvz7J7aGqP6Lqtsy3pz9gz`) - $9.99/month
- **Pro Plan** (`price_1StvzoJ7aGqP6LqtXZhENpUs`) - $19.99/month

If missing, create them and update the price IDs in `.env.production`.

### 3. Test Locally with Production Credentials

Before deploying, test with production Stripe:

```bash
cd python-tutor

# Load production environment
export $(cat ../.env.production | grep -v '^#' | xargs)

# Start dev server
npm run dev
```

**Test flow**:
1. Sign up / login
2. Go to pricing page
3. Click upgrade
4. Complete checkout (use real card or test card)
5. Verify subscription in Stripe dashboard
6. Check user subscription updated

### 4. Deploy to Production

Deploy your app with these environment variables set on your hosting platform (Vercel, etc.):

```bash
# From .env.production
NEXTAUTH_URL=https://pythonninja.app
NEXTAUTH_SECRET=Bjcl74egJHiQgW/Ihr6iFFB3wqUGUjiC7H13J9RPVd0=
ANTHROPIC_API_KEY=sk-ant-api03-...

# Supabase (once restored)
NEXT_PUBLIC_SUPABASE_URL=https://qxzlrraxyvnbruoaizcc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe Production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51StQzeJ7aGqP6Lqt...
STRIPE_SECRET_KEY=sk_live_51StQzeJ7aGqP6Lqt...
STRIPE_PRICE_ID_BASIC=price_1Stvz7J7aGqP6Lqtsy3pz9gz
STRIPE_PRICE_ID_PRO=price_1StvzoJ7aGqP6LqtXZhENpUs
NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=price_1Stvz7J7aGqP6Lqtsy3pz9gz
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_1StvzoJ7aGqP6LqtXZhENpUs
STRIPE_WEBHOOK_SECRET=whsec_... # Add after webhook is configured
```

### 5. Post-Deployment Verification

After deployment:

1. **Test full payment flow** with real card
2. **Verify webhook delivery** in Stripe dashboard
3. **Check database** for subscription record
4. **Test subscription cancellation**
5. **Monitor Stripe logs** for any errors

---

## 🔧 Tools Installed

- ✅ **Supabase CLI** - For database management and restoration
- ✅ **Stripe CLI** (if you want to test webhooks locally):
  ```bash
  stripe login
  stripe listen --forward-to localhost:3002/api/stripe/webhook
  ```

---

## 📚 Reference Documentation

- [**Full Production Setup Guide**](PRODUCTION_SETUP.md) - Detailed instructions
- [**Database Schema**](supabase/schema.sql) - SQL schema for Supabase
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## ⚠️ Current State

**Local Development**: ✅ Working
- Using mock database
- Test Stripe payments working
- All code ready for production

**Production Deployment**: ⚠️ Blocked
- Waiting for Supabase database restoration
- Once database is restored, ready to deploy

---

## Next Action

**Contact Supabase support** to restore your database project, then proceed with deployment steps above.

If database cannot be restored, follow Option 2 to create a new Supabase project.

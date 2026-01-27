# Production Setup Guide

## Current Status

✅ **Stripe Live Keys** - Already configured in `.env.production`
❌ **Supabase Database** - Paused (90+ days, requires restoration)
❌ **Production URL** - NEXTAUTH_URL needs to be updated

---

## Step 1: Restore Supabase Database

Your Supabase project `qxzlrraxyvnbruoaizcc` has been paused for over 90 days. You have two options:

### Option A: Restore Existing Project (Recommended if possible)

1. **Contact Supabase Support** to restore your project backup:
   - Go to: https://supabase.com/dashboard/support
   - Provide project ref: `qxzlrraxyvnbruoaizcc`
   - Request backup restoration (usually available for 30-90 days after pause)

2. **Once restored**, the existing credentials in `.env.production` should work:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://qxzlrraxyvnbruoaizcc.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Option B: Create New Supabase Project

If the backup cannot be restored, create a new project:

1. **Create new project** at https://supabase.com/dashboard
   - Note the new project URL and service_role key

2. **Run the database schema migration**:
   ```bash
   cd python-tutor
   supabase db push --db-url "postgresql://postgres:[password]@[new-project-ref].supabase.co:5432/postgres"
   ```

3. **Update `.env.production`** with new credentials

4. **Migrate user data** (if you have a backup):
   - Export from old project backup
   - Import into new project

---

## Step 2: Configure Production Environment

Update `/Users/VanceAlexander/Code/PythonTutor/.env.production`:

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://pythonninja.app  # ← Update this to your production domain
NEXTAUTH_SECRET=<your-nextauth-secret>

# Anthropic API Key
ANTHROPIC_API_KEY=<your-anthropic-api-key>

# Supabase (uncomment once restored)
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Stripe Production Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_PRICE_ID_BASIC=<your-basic-price-id>
STRIPE_PRICE_ID_PRO=<your-pro-price-id>
NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=<your-basic-price-id>
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=<your-pro-price-id>

# See your actual .env.production file for the real values
```

---

## Step 3: Configure Stripe Webhook for Production

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/webhooks

2. **Add endpoint**: `https://pythonninja.app/api/stripe/webhook`

3. **Select events to listen for**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. **Get the webhook signing secret** (starts with `whsec_`)

5. **Add to your production environment**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## Step 4: Verify Stripe Products in Live Mode

Your live price IDs are already configured, but verify they exist in Stripe Dashboard:

1. Go to: https://dashboard.stripe.com/products
2. Ensure these products exist:
   - **Basic Plan**: `price_1Stvz7J7aGqP6Lqtsy3pz9gz` ($9.99/month)
   - **Pro Plan**: `price_1StvzoJ7aGqP6LqtXZhENpUs` ($19.99/month)

3. If they don't exist, create them:
   - Navigate to Products → Add Product
   - Set up recurring billing
   - Copy the price IDs to `.env.production`

---

## Step 5: Test in Production Mode Locally

Before deploying, test with production Stripe keys locally:

```bash
cd python-tutor

# Use production environment
export $(cat ../.env.production | xargs)

# Start development server
npm run dev
```

**Test checklist**:
- [ ] Can create account
- [ ] Can login
- [ ] Can view pricing page
- [ ] Can click upgrade button
- [ ] Redirected to Stripe Checkout (live mode)
- [ ] Can complete payment with real card
- [ ] Redirected back to dashboard with success message
- [ ] Subscription appears in Stripe dashboard
- [ ] User subscription updated in database

---

## Step 6: Deploy to Production

Once all tests pass:

1. **Deploy your Next.js app** to your hosting platform (Vercel, etc.)

2. **Set environment variables** on your hosting platform:
   - Copy all variables from `.env.production`
   - Ensure `NEXTAUTH_URL` matches your production domain

3. **Verify deployment**:
   - Visit https://pythonninja.app
   - Test the full payment flow with a real card
   - Check Stripe dashboard for successful payment
   - Verify user subscription in database

---

## Troubleshooting

### Database Connection Issues
```bash
# Test Supabase connection
supabase db ping --db-url "postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres"
```

### Stripe Webhook Testing
```bash
# Test webhook locally (requires Stripe CLI)
stripe listen --forward-to localhost:3002/api/stripe/webhook
```

### Check Logs
- Supabase: https://supabase.com/dashboard/project/[ref]/logs
- Stripe: https://dashboard.stripe.com/logs
- Your app: Check your hosting platform's logs

---

## Security Checklist

- [ ] All API keys are in environment variables (not in code)
- [ ] `.env.production` is in `.gitignore`
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Stripe webhook signature verification is enabled
- [ ] Database has proper RLS (Row Level Security) policies
- [ ] Rate limiting is enabled on API routes
- [ ] HTTPS is enforced on production domain

---

## Next Steps After Setup

1. **Monitor Stripe Dashboard** for incoming payments
2. **Set up billing email notifications** in Stripe
3. **Test subscription cancellation flow**
4. **Set up monitoring/alerting** for failed payments
5. **Create customer support process** for billing issues

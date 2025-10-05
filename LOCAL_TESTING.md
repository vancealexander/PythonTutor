# Local Testing Guide - Mock Mode

This guide explains how to test Python Tutor locally **without any external services** (no Supabase, no Stripe, no OAuth). Perfect for quick development and testing!

## 🚀 Quick Start (5 minutes)

### 1. Set Up Environment

Create `.env.local` with minimal configuration:

```bash
# Required - Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Required - Your Anthropic API key
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional - Leave blank to use mock mode (recommended for testing)
# NEXT_PUBLIC_SUPABASE_URL=
# SUPABASE_SERVICE_ROLE_KEY=
# STRIPE_SECRET_KEY=
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Open Browser

Go to [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing the Complete Flow

### Test 1: Free Trial (No Auth)

1. Open http://localhost:3000
2. Click "Try Free Trial (5 requests)"
3. Ask the AI tutor a question
4. Verify the counter shows "4/5 remaining"
5. Make 5 total requests
6. 6th request should show "Free trial limit reached"

**Expected**: IP-based rate limiting works without authentication

---

### Test 2: User Authentication

**Test Account 1: Free Tier User**
- Email: `test@example.com`
- Password: `test123`

**Test Account 2: Pro Tier User**
- Email: `pro@example.com`
- Password: `test123`

#### Steps:

1. **Go to Sign In**:
   - Click "Sign In" in the header OR
   - Go to http://localhost:3000/auth/signin

2. **Auto-Login with Test Account**:
   - Click the blue "test@example.com" button
   - OR manually enter email/password and click "Sign In"

3. **Verify Redirect**:
   - Should redirect to `/dashboard`
   - Shows user info, subscription status, plan type

4. **Check Session**:
   - Open browser DevTools → Application → Cookies
   - Should see `next-auth.session-token`

5. **Test Sign Out**:
   - Click "Sign Out" button
   - Should redirect to homepage
   - Session cookie removed

**Expected**: Authentication works without Supabase

---

### Test 3: Subscription Upgrade (Mock Stripe)

1. **Sign in as Free Tier User** (`test@example.com`)

2. **Go to Dashboard**: http://localhost:3000/dashboard

3. **Upgrade to Basic**:
   - Click "Upgrade to Basic" button
   - Watch console logs for mock Stripe workflow
   - Should see success alert: "Successfully upgraded to BASIC plan!"

4. **Verify Upgrade**:
   - Dashboard should now show "BASIC" plan
   - Status should be "active"
   - Stripe Customer ID should appear

5. **Test Upgrade to Pro**:
   - Sign out and sign in as `test@example.com` again
   - Try upgrading to Pro plan
   - Same flow should work

**Expected**: Mock payment processing works end-to-end

---

### Test 4: Subscription Cancellation

1. **While signed in as upgraded user**:
   - Scroll to "Manage Subscription" section
   - Click "Cancel Subscription"
   - Confirm the cancellation

2. **Verify Cancellation**:
   - Plan type reverts to "FREE"
   - Status changes to "canceled"
   - "Upgrade Your Account" section reappears

**Expected**: Subscription management works without Stripe

---

### Test 5: Session Persistence

1. **Sign in** as any test user
2. **Refresh the page** (F5)
3. **Verify**: Still logged in, session persists
4. **Open new tab** to http://localhost:3000/dashboard
5. **Verify**: Dashboard loads immediately (no redirect to login)
6. **Close browser completely**
7. **Reopen** and go to http://localhost:3000/dashboard
8. **Verify**: Still logged in (session lasts 30 days)

**Expected**: JWT sessions work correctly

---

## 📊 What's Running in Mock Mode

### Mock Database (`lib/db/mock-db.ts`)
- **In-memory storage** (resets on server restart)
- Pre-populated with 2 test users
- Stores: users, subscriptions, progress, sessions

### Mock Stripe (`lib/stripe/mock-stripe.ts`)
- Simulates checkout sessions
- Simulates payment completion
- Simulates webhook events
- No real payments processed

### Mock Auth (`lib/auth/auth-options-local.ts`)
- Credentials provider (email/password)
- No OAuth providers
- JWT sessions (no database)
- Works offline

---

## 🔍 Debugging & Monitoring

### Check Console Logs

The app logs everything in development:

**Startup:**
```
🧪 Using local mock authentication (no Supabase)
   Test credentials:
   - test@example.com / test123 (free tier)
   - pro@example.com / test123 (pro tier)
✅ Mock database initialized with test users
```

**Sign In:**
```
✅ User signed in: test@example.com (new: false)
```

**Upgrade:**
```
✅ Mock checkout session created: cs_mock_...
   Price: price_mock_basic
   Redirect to: /test/mock-checkout?session_id=...
✅ Mock payment completed!
   Subscription: sub_mock_...
   Plan: basic
   Status: active
🔔 Processing mock webhook: checkout.session.completed
   Checkout completed for user: test-user-1
   ✅ User upgraded to basic plan
```

### Inspect Mock Database

Add this to any component to debug:

```typescript
import { mockDb } from '@/lib/db/mock-db';

// View all users
console.log('Users:', mockDb.getAllUsers());

// View all subscriptions
console.log('Subscriptions:', mockDb.getAllSubscriptions());
```

### Reset Everything

Restart the dev server:
```bash
# Stop: Ctrl+C
# Start:
npm run dev
```

Everything resets to initial state (2 test users, free tier).

---

## 🎯 Testing Scenarios

### Scenario 1: New User Journey
1. Free trial → make 5 requests
2. Sign up → create account
3. Upgrade to Basic → payment
4. Use AI tutor → unlimited requests
5. Cancel → revert to free

### Scenario 2: Returning User
1. Sign in with existing account
2. Dashboard shows progress
3. Continue learning
4. Sign out

### Scenario 3: Subscription Management
1. Start on free tier
2. Upgrade to Basic
3. Upgrade again to Pro
4. Cancel subscription
5. Re-subscribe

---

## ⚠️ Limitations of Mock Mode

**What Works**:
- ✅ Authentication (email/password)
- ✅ Session management
- ✅ Subscription upgrades
- ✅ Subscription cancellation
- ✅ User dashboard
- ✅ Progress tracking
- ✅ Free trial rate limiting

**What Doesn't Work**:
- ❌ OAuth (Google, GitHub) - needs real providers
- ❌ Email magic links - needs email server
- ❌ Real payment processing - Stripe mock only
- ❌ Data persistence - resets on restart
- ❌ Multiple devices - sessions don't sync

**When to Upgrade to Real Services**:
- Need persistent database → Set up Supabase
- Need real payments → Configure Stripe
- Need OAuth → Add provider credentials
- Need production deployment → Use full setup

---

## 🔧 Troubleshooting

### "Error: NEXTAUTH_SECRET environment variable is not set"
**Fix**: Generate a secret and add to `.env.local`:
```bash
openssl rand -base64 32
```

### "Module not found: Can't resolve 'next-auth/react'"
**Fix**: Install dependencies:
```bash
npm install
```

### "Invalid email or password"
**Fix**: Use test credentials:
- `test@example.com` / `test123`
- `pro@example.com` / `test123`

### Session lost after refresh
**Fix**: Check browser cookies are enabled. Check `.env.local` has `NEXTAUTH_URL=http://localhost:3000`

### "TypeError: Cannot read property 'id' of undefined"
**Fix**: Sign in first. Protected routes redirect to `/auth/signin`

---

## 📝 Next Steps

Once local testing passes:

1. **Set up Supabase** (see `SUPABASE_SETUP.md`)
   - Create project
   - Run schema
   - Add credentials to `.env.local`

2. **Set up Stripe** (see `FULL_SETUP.md`)
   - Create products
   - Get API keys
   - Configure webhook

3. **Deploy to Vercel** (see `DEPLOYMENT.md`)
   - Push to GitHub
   - Import to Vercel
   - Add environment variables
   - Deploy

---

## 🎓 Understanding the Architecture

```
┌─────────────────────────────────────────────┐
│           Browser (Client)                  │
│  ┌─────────────────────────────────────┐   │
│  │  UI Components                      │   │
│  │  - Login Form                       │   │
│  │  - Dashboard                        │   │
│  │  - Subscription Manager             │   │
│  └─────────────────────────────────────┘   │
│                    │                        │
│                    ▼                        │
│  ┌─────────────────────────────────────┐   │
│  │  NextAuth Session (JWT)             │   │
│  │  - Stores in cookies                │   │
│  │  - No database needed               │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│         Next.js Server (API Routes)         │
│  ┌─────────────────────────────────────┐   │
│  │  /api/auth/[...nextauth]            │   │
│  │  - Handles login/logout             │   │
│  │  - Uses Credentials provider        │   │
│  └─────────────────────────────────────┘   │
│                    │                        │
│                    ▼                        │
│  ┌─────────────────────────────────────┐   │
│  │  Mock Database (In-Memory)          │   │
│  │  - Users                            │   │
│  │  - Subscriptions                    │   │
│  │  - Sessions                         │   │
│  │  - Progress                         │   │
│  └─────────────────────────────────────┘   │
│                    │                        │
│                    ▼                        │
│  ┌─────────────────────────────────────┐   │
│  │  Mock Stripe                        │   │
│  │  - Simulates checkout               │   │
│  │  - Simulates webhooks               │   │
│  │  - Updates subscriptions            │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 💡 Pro Tips

1. **Use Test Accounts**: The pre-populated accounts cover all scenarios
2. **Watch Console**: All actions are logged for debugging
3. **Test Edge Cases**: Try signing in twice, upgrading while free trial active, etc.
4. **Check DevTools**: Network tab shows API calls, Application tab shows cookies
5. **Restart Often**: Mock data resets on restart - good for clean testing

---

## ✅ Testing Checklist

Before moving to production:

- [ ] Free trial works (5 requests, then blocked)
- [ ] Sign in works (test credentials)
- [ ] Sign out works (session cleared)
- [ ] Session persists across refreshes
- [ ] Dashboard shows correct user info
- [ ] Upgrade to Basic works (mock payment)
- [ ] Upgrade to Pro works
- [ ] Subscription cancellation works
- [ ] Protected routes redirect to login
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in development
- [ ] Mobile responsive (test on narrow window)

---

## 🎉 Success!

If all tests pass, you're ready to either:
- **Continue developing** with mock services (fast iteration)
- **Upgrade to real services** for production (Supabase + Stripe)
- **Deploy to Vercel** and test in production environment

For help, see:
- `FULL_SETUP.md` - Complete production setup
- `SUPABASE_SETUP.md` - Database configuration
- `FREE_TRIAL_SETUP.md` - Free trial details

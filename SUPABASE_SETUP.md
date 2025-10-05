# Supabase Setup Guide

This guide walks you through setting up Supabase for authentication and database storage.

## Step 1: Create Supabase Project

1. **Go to [Supabase](https://supabase.com)** and sign up/login
2. **Click "New Project"**
3. **Fill in details**:
   - Organization: Create new or select existing
   - Name: `python-tutor` (or your preferred name)
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to your users
   - Plan: Free tier (500MB database, 50k MAU)

4. **Wait for setup** (~2 minutes)

## Step 2: Run Database Schema

1. **Open SQL Editor** in Supabase dashboard (left sidebar)
2. **Click "New Query"**
3. **Copy the entire contents** of `supabase/schema.sql`
4. **Paste and click "Run"**
5. **Verify tables created**:
   - Go to "Table Editor" (left sidebar)
   - Should see: users, accounts, sessions, user_subscriptions, api_requests, user_progress

## Step 3: Get API Credentials

1. **Go to Project Settings** (gear icon)
2. **Click "API"** in left menu
3. **Copy these values**:
   - `URL`: Your project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon public` key: Public/anonymous key (safe for client-side)
   - `service_role` key: Secret key (server-side only, NEVER expose!)

## Step 4: Configure Environment Variables

Add to your `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Generate NEXTAUTH_SECRET with:
# openssl rand -base64 32
```

## Step 5: Configure Authentication Providers

### Enable Email/Password Auth

1. **Go to Authentication** → **Providers**
2. **Email** should be enabled by default
3. **Configure Email Templates** (optional):
   - Go to Authentication → Email Templates
   - Customize confirmation, password reset emails

### Enable Google OAuth (Optional)

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
2. **Create OAuth 2.0 Credentials**:
   - Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
3. **Copy Client ID and Secret**
4. **In Supabase**:
   - Go to Authentication → Providers
   - Enable Google
   - Paste Client ID and Secret

### Enable GitHub OAuth (Optional)

1. **Go to GitHub** → Settings → Developer Settings → OAuth Apps
2. **New OAuth App**:
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `https://your-project.supabase.co/auth/v1/callback`
3. **Copy Client ID and generate Client Secret**
4. **In Supabase**:
   - Go to Authentication → Providers
   - Enable GitHub
   - Paste Client ID and Secret

## Step 6: Configure Row Level Security (RLS)

The schema already includes RLS policies, but verify:

1. **Go to Table Editor**
2. **Click on `users` table**
3. **View Policies** (shield icon)
4. **Should see**:
   - "Users can view own data"
   - "Service role has full access"

Repeat for other tables to ensure RLS is working.

## Step 7: Test Database Connection

Create a test file to verify connection:

```typescript
// test-supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testConnection() {
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .single();

  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('✅ Supabase connected successfully!');
  }
}

testConnection();
```

Run: `npx tsx test-supabase.ts`

## Step 8: Vercel Deployment

When deploying to Vercel:

1. **Add Environment Variables** in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXTAUTH_URL (set to your production URL)
   NEXTAUTH_SECRET
   ```

2. **Update OAuth Redirect URLs**:
   - Add production callback: `https://your-app.vercel.app/api/auth/callback/google`
   - Update in Google/GitHub OAuth settings

## Database Schema Overview

### Tables

**users**: User accounts (managed by NextAuth)
- id, email, name, image, timestamps

**accounts**: OAuth provider connections
- Links users to Google/GitHub accounts

**sessions**: Active user sessions
- For NextAuth session management

**user_subscriptions**: Stripe subscription data
- stripe_customer_id, stripe_subscription_id
- status (free, trialing, active, canceled)
- plan_type (free, basic, pro)

**api_requests**: Request tracking for rate limiting
- user_id or ip_address
- request_count, reset_at

**user_progress**: User learning progress
- current_phase, completed_lessons
- Migrated from localStorage

### Indexes

All critical queries are indexed for performance:
- User lookups
- Session validation
- Subscription checks
- Rate limit queries

## Monitoring & Maintenance

### Check Database Usage

1. **Go to Database** → **Storage** in Supabase
2. **Monitor**:
   - Database size (500MB free tier limit)
   - Table sizes
   - Query performance

### View Logs

1. **Go to Logs** in Supabase
2. **Select log type**:
   - API logs
   - Auth logs
   - Database logs

### Backup Database

Supabase automatically backs up your database daily (free tier: 7-day retention).

**Manual backup**:
1. Go to Database → Backups
2. Click "Create backup"

## Security Best Practices

✅ **Never commit** `.env.local` to git
✅ **Use service role key** only in server-side code (API routes)
✅ **Enable RLS** on all tables
✅ **Rotate keys** if compromised
✅ **Monitor logs** for suspicious activity

## Troubleshooting

**Error: "relation does not exist"**
- Run the schema.sql again
- Verify tables in Table Editor

**Error: "JWT expired"**
- Check NEXTAUTH_SECRET is set
- Verify Supabase project is active

**Error: "RLS policy violation"**
- Check user is authenticated
- Verify RLS policies are correct
- Use service role key for admin operations

## Free Tier Limits

- **Database**: 500MB storage
- **Authentication**: 50,000 monthly active users
- **API Requests**: Unlimited
- **Bandwidth**: 5GB egress/month
- **Backups**: 7-day retention

**Upgrade when needed**: $25/month Pro plan (8GB storage, unlimited bandwidth)

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [NextAuth Documentation](https://next-auth.js.org/adapters/supabase)

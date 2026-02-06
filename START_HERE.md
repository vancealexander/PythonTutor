# 🚀 Stripe Payment Integration - START HERE

## What Just Happened?

Your Python Ninja app now has **complete Stripe payment integration**! 

You can accept real payments for Basic ($9.99/month) and Pro ($19.99/month) subscriptions.

## 📋 Quick Start (3 Steps)

### Step 1: Get Your Stripe Account Ready

1. **Sign up for Stripe** (if you haven't already)
   - Go to: https://dashboard.stripe.com/register
   - Complete the signup process

2. **Get your API keys**
   - In Stripe Dashboard, go to: Developers → API keys
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)

3. **Create your products**
   - In Stripe Dashboard, go to: Products
   - Click "Add product"
   
   **For Basic Plan:**
   - Name: Python Ninja - Basic
   - Price: $9.99 USD, recurring monthly
   - Save and copy the **Price ID** (starts with `price_`)
   
   **For Pro Plan:**
   - Name: Python Ninja - Pro
   - Price: $19.99 USD, recurring monthly
   - Save and copy the **Price ID** (starts with `price_`)

### Step 2: Configure Your App

1. **Create your environment file:**
   ```bash
   cd /Users/VanceAlexander/Code/PythonTutor/python-tutor
   cp .env.example .env.local
   ```

2. **Edit `.env.local` and add your Stripe keys:**
   ```bash
   # Replace these with your actual keys from Step 1
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_PRICE_ID_BASIC=price_your_basic_id_here
   STRIPE_PRICE_ID_PRO=price_your_pro_id_here
   ```

3. **Verify everything is set up correctly:**
   ```bash
   npm run check-stripe
   ```
   
   You should see all ✅ checkmarks!

### Step 3: Test It Locally

1. **Install Stripe CLI** (for webhook testing)
   - Mac: `brew install stripe/stripe-cli/stripe`
   - Other: https://stripe.com/docs/stripe-cli#install

2. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```

3. **Start your app in two terminals:**

   **Terminal 1 - Your App:**
   ```bash
   cd /Users/VanceAlexander/Code/PythonTutor/python-tutor
   npm run dev
   ```

   **Terminal 2 - Stripe Webhooks:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   
   Copy the webhook secret from Terminal 2 and add it to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```
   
   Then restart Terminal 1 (your app).

4. **Test the payment flow:**
   - Open: http://localhost:3000/pricing
   - Click "Upgrade to Basic" or "Upgrade to Pro"
   - Use test card: **4242 4242 4242 4242**
   - Use any future expiry date and any 3-digit CVC
   - Complete the checkout
   - You should be redirected back with a success message!

## 💳 Test Cards

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

**Declined Payment:**
- Card: `4000 0000 0000 0002`

**3D Secure (needs authentication):**
- Card: `4000 0025 0000 3155`

## 🚀 Deploy to Production

Once you've tested locally:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Stripe payment components and documentation"
   git push
   ```

2. **Add environment variables in Vercel:**
   - Go to your Vercel project settings
   - Add all the Stripe environment variables
   - Redeploy

3. **Set up production webhook:**
   - In Stripe Dashboard: Developers → Webhooks
   - Add endpoint: `https://pythonninja.app/api/stripe/webhook`
   - Select all subscription events
   - Copy webhook secret to Vercel

## ✅ Your Next Actions

1. [ ] Complete Step 1: Set up Stripe account and get keys
2. [ ] Complete Step 2: Configure .env.local with your keys
3. [ ] Complete Step 3: Test locally with test cards
4. [ ] Read STRIPE_SETUP.md for production deployment
5. [ ] Deploy to production when ready!

---

**You're all set! Happy coding! 🎉**

For detailed instructions, see STRIPE_SETUP.md in this directory.

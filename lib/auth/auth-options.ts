import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { authOptionsLocal } from './auth-options-local';

// Note: OAuth providers (Google, GitHub, Email) are excluded from production config
// to avoid build dependencies. For local testing, use the Credentials provider in auth-options-local.ts
// To enable OAuth in production, install required packages and add providers here.

// Check if running in local mock mode (no Supabase configured)
const USE_MOCK_DB = !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL;

if (USE_MOCK_DB) {
  console.log('🧪 Using local mock authentication (no Supabase)');
  console.log('   Test credentials:');
  console.log('   - test@example.com / test123 (free tier)');
  console.log('   - pro@example.com / test123 (pro tier)');
}

// Production Supabase configuration
const supabase = !USE_MOCK_DB ? createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null;

const authOptionsProduction: NextAuthOptions = {
  adapter: !USE_MOCK_DB ? SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }) : undefined,

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !supabase) {
          return null;
        }

        // Get user from Supabase
        const { data: user } = await supabase
          .from('users')
          .select('id, email, name')
          .eq('email', credentials.email)
          .single();

        if (!user) {
          return null;
        }

        // Get account with hashed password
        const { data: account } = await supabase
          .from('accounts')
          .select('access_token')
          .eq('user_id', user.id)
          .eq('provider', 'credentials')
          .single();

        if (!account?.access_token) {
          return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, account.access_token);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user && supabase) {
        token.id = user.id;

        // Check/create subscription record
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!subscription) {
          // Create free tier subscription for new users
          await supabase.from('user_subscriptions').insert({
            user_id: user.id,
            status: 'free',
            plan_type: 'free',
          });
        }

        // Check/create progress record
        const { data: progress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!progress) {
          // Initialize progress for new users
          await supabase.from('user_progress').insert({
            user_id: user.id,
            current_phase: 1,
            current_lesson: 1,
          });
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && supabase) {
        session.user.id = token.id as string;

        // Fetch latest subscription status
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('status, plan_type, stripe_customer_id')
          .eq('user_id', token.id as string)
          .single();

        if (subscription) {
          session.user.subscriptionStatus = subscription.status;
          session.user.planType = subscription.plan_type;
          session.user.stripeCustomerId = subscription.stripe_customer_id;
        } else {
          session.user.subscriptionStatus = 'free';
          session.user.planType = 'free';
        }
      }

      return session;
    },
  },

  events: {
    async signIn({ user, isNewUser }) {
      console.log(`User signed in: ${user.email} (new: ${isNewUser})`);
    },

    async signOut({ session }) {
      console.log(`User signed out: ${session?.user?.email}`);
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

// Export the correct configuration based on environment
export const authOptions: NextAuthOptions = USE_MOCK_DB ? authOptionsLocal : authOptionsProduction;

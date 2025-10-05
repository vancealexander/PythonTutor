import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { mockDb } from '@/lib/db/mock-db';

// Local-only auth configuration for testing without external services
// Use this when SUPABASE_SERVICE_ROLE_KEY is not set

export const authOptionsLocal: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'test@example.com' },
        password: { label: 'Password', type: 'password', placeholder: 'test123' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        // Check mock database
        const user = mockDb.verifyPassword(credentials.email, credentials.password);

        if (!user) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || null,
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
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;

        // Ensure subscription exists
        const subscription = mockDb.getSubscription(user.id);
        if (!subscription) {
          mockDb.updateSubscription(user.id, {
            userId: user.id,
            status: 'free',
            planType: 'free',
          });
        }

        // Ensure progress exists
        const progress = mockDb.getProgress(user.id);
        if (!progress) {
          mockDb.updateProgress(user.id, {
            userId: user.id,
            currentPhase: 1,
            currentLesson: 1,
            completedLessons: [],
            completedProjects: [],
          });
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;

        // Fetch subscription status from mock DB
        const subscription = mockDb.getSubscription(token.id as string);

        if (subscription) {
          session.user.subscriptionStatus = subscription.status;
          session.user.planType = subscription.planType;
          session.user.stripeCustomerId = subscription.stripeCustomerId || null;
        } else {
          session.user.subscriptionStatus = 'free';
          session.user.planType = 'free';
          session.user.stripeCustomerId = null;
        }
      }

      return session;
    },
  },

  events: {
    async signIn({ user, isNewUser }) {
      console.log(`✅ User signed in: ${user.email} (new: ${isNewUser})`);
    },

    async signOut() {
      console.log('👋 User signed out');
    },
  },

  debug: true, // Enable debug mode for local testing
};

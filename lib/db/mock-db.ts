// Mock Database for Local Testing
// This simulates Supabase without needing a real database connection

interface MockUser {
  id: string;
  email: string;
  name?: string;
  password?: string; // Only for credentials auth in dev
  createdAt: Date;
}

interface MockSubscription {
  userId: string;
  status: 'free' | 'trialing' | 'active' | 'canceled' | 'past_due';
  planType: 'free' | 'basic' | 'pro';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

interface MockProgress {
  userId: string;
  currentPhase: number;
  currentLesson: number;
  completedLessons: string[];
  completedProjects: string[];
}

interface MockSession {
  sessionToken: string;
  userId: string;
  expires: Date;
}

class MockDatabase {
  private users: Map<string, MockUser> = new Map();
  private subscriptions: Map<string, MockSubscription> = new Map();
  private progress: Map<string, MockProgress> = new Map();
  private sessions: Map<string, MockSession> = new Map();

  constructor() {
    // Pre-populate with test users for easy testing
    this.seedTestData();
  }

  private seedTestData() {
    // Test user 1: Free tier
    const user1Id = 'test-user-1';
    this.users.set(user1Id, {
      id: user1Id,
      email: 'test@example.com',
      name: 'Test User',
      password: 'test123', // In real app, this would be hashed
      createdAt: new Date(),
    });

    this.subscriptions.set(user1Id, {
      userId: user1Id,
      status: 'free',
      planType: 'free',
    });

    this.progress.set(user1Id, {
      userId: user1Id,
      currentPhase: 1,
      currentLesson: 1,
      completedLessons: [],
      completedProjects: [],
    });

    // Test user 2: Pro tier
    const user2Id = 'test-user-2';
    this.users.set(user2Id, {
      id: user2Id,
      email: 'pro@example.com',
      name: 'Pro User',
      password: 'test123',
      createdAt: new Date(),
    });

    this.subscriptions.set(user2Id, {
      userId: user2Id,
      status: 'active',
      planType: 'pro',
      stripeCustomerId: 'cus_mock_123',
      stripeSubscriptionId: 'sub_mock_123',
    });

    this.progress.set(user2Id, {
      userId: user2Id,
      currentPhase: 2,
      currentLesson: 5,
      completedLessons: ['lesson-1', 'lesson-2', 'lesson-3'],
      completedProjects: ['project-1'],
    });

    console.log('✅ Mock database initialized with test users');
    console.log('   - test@example.com / test123 (free tier)');
    console.log('   - pro@example.com / test123 (pro tier)');
  }

  // User operations
  createUser(email: string, password: string, name?: string): MockUser {
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const user: MockUser = {
      id,
      email,
      name,
      password,
      createdAt: new Date(),
    };

    this.users.set(id, user);

    // Initialize free subscription
    this.subscriptions.set(id, {
      userId: id,
      status: 'free',
      planType: 'free',
    });

    // Initialize progress
    this.progress.set(id, {
      userId: id,
      currentPhase: 1,
      currentLesson: 1,
      completedLessons: [],
      completedProjects: [],
    });

    console.log(`✅ Created new user: ${email}`);
    return user;
  }

  getUserByEmail(email: string): MockUser | null {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  getUserById(id: string): MockUser | null {
    return this.users.get(id) || null;
  }

  verifyPassword(email: string, password: string): MockUser | null {
    const user = this.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  // Subscription operations
  getSubscription(userId: string): MockSubscription | null {
    return this.subscriptions.get(userId) || null;
  }

  updateSubscription(
    userId: string,
    updates: Partial<MockSubscription>
  ): MockSubscription | null {
    const current = this.subscriptions.get(userId);
    if (!current) return null;

    const updated = { ...current, ...updates };
    this.subscriptions.set(userId, updated);
    console.log(`✅ Updated subscription for ${userId}:`, updated);
    return updated;
  }

  // Session operations
  createSession(userId: string): MockSession {
    const sessionToken = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 days

    const session: MockSession = {
      sessionToken,
      userId,
      expires,
    };

    this.sessions.set(sessionToken, session);
    return session;
  }

  getSessionByToken(token: string): MockSession | null {
    const session = this.sessions.get(token);
    if (!session) return null;

    // Check if expired
    if (session.expires < new Date()) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

  deleteSession(token: string): void {
    this.sessions.delete(token);
  }

  // Progress operations
  getProgress(userId: string): MockProgress | null {
    return this.progress.get(userId) || null;
  }

  updateProgress(userId: string, updates: Partial<MockProgress>): MockProgress | null {
    const current = this.progress.get(userId);
    if (!current) return null;

    const updated = { ...current, ...updates };
    this.progress.set(userId, updated);
    return updated;
  }

  // Debug methods
  getAllUsers(): MockUser[] {
    return Array.from(this.users.values());
  }

  getAllSubscriptions(): MockSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  reset(): void {
    this.users.clear();
    this.subscriptions.clear();
    this.progress.clear();
    this.sessions.clear();
    this.seedTestData();
    console.log('🔄 Mock database reset');
  }
}

// Singleton instance
export const mockDb = new MockDatabase();

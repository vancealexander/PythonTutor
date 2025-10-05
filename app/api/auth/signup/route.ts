import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const USE_MOCK_DB = !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // If using mock mode, just return success
    if (USE_MOCK_DB) {
      return NextResponse.json({ success: true, message: 'Account created in mock mode' });
    }

    // Real Supabase signup
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        name: name || null,
        email_verified: null, // Can be set up later with email verification
      })
      .select()
      .single();

    if (userError || !user) {
      console.error('User creation error:', userError);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Create account record with hashed password
    const { error: accountError } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        type: 'credentials',
        provider: 'credentials',
        provider_account_id: user.id,
        access_token: hashedPassword, // Store hashed password here for credentials auth
      });

    if (accountError) {
      console.error('Account creation error:', accountError);
      // Clean up user if account creation fails
      await supabase.from('users').delete().eq('id', user.id);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Create free tier subscription
    await supabase.from('user_subscriptions').insert({
      user_id: user.id,
      status: 'free',
      plan_type: 'free',
    });

    // Create progress record
    await supabase.from('user_progress').insert({
      user_id: user.id,
      current_phase: 1,
      current_lesson: 1,
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: { id: user.id, email: user.email, name: user.name },
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

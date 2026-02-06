// Utility to check if Stripe is properly configured

export function checkStripeConfig(): {
  isConfigured: boolean;
  missingVars: string[];
  warnings: string[];
} {
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_PRICE_ID_BASIC',
    'STRIPE_PRICE_ID_PRO',
  ];

  const optionalVars = [
    'STRIPE_WEBHOOK_SECRET', // Only required in production
  ];

  const missingVars: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Check optional variables
  optionalVars.forEach((varName) => {
    if (!process.env[varName]) {
      warnings.push(`${varName} is not set (optional for local dev with Stripe CLI)`);
    }
  });

  // Validate key formats
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    warnings.push('STRIPE_SECRET_KEY should start with sk_test_ or sk_live_');
  }

  if (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')
  ) {
    warnings.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should start with pk_test_ or pk_live_');
  }

  if (
    process.env.STRIPE_WEBHOOK_SECRET &&
    !process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')
  ) {
    warnings.push('STRIPE_WEBHOOK_SECRET should start with whsec_');
  }

  // Check if in test or live mode
  if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
    warnings.push('Using TEST mode - real payments will not be processed');
  } else if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
    warnings.push('Using LIVE mode - real payments WILL be processed');
  }

  return {
    isConfigured: missingVars.length === 0,
    missingVars,
    warnings,
  };
}

// Log configuration status (useful for debugging)
export function logStripeConfig() {
  const { isConfigured, missingVars, warnings } = checkStripeConfig();

  console.log('🔧 Stripe Configuration Check:');

  if (isConfigured) {
    console.log('✅ Stripe is properly configured');
  } else {
    console.log('❌ Stripe configuration incomplete');
    console.log('Missing variables:', missingVars.join(', '));
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach((warning) => console.log(`   - ${warning}`));
  }

  return isConfigured;
}

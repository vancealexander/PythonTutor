#!/usr/bin/env node

/**
 * Stripe Configuration Checker
 * Verifies that all required Stripe environment variables are properly configured
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

// Required environment variables
const requiredVars = [
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    description: 'Stripe Publishable Key',
    pattern: /^pk_(test|live)_/,
    example: 'pk_test_51...',
  },
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe Secret Key',
    pattern: /^sk_(test|live)_/,
    example: 'sk_test_51...',
  },
  {
    name: 'STRIPE_PRICE_ID_BASIC',
    description: 'Basic Plan Price ID',
    pattern: /^price_/,
    example: 'price_1...',
  },
  {
    name: 'STRIPE_PRICE_ID_PRO',
    description: 'Pro Plan Price ID',
    pattern: /^price_/,
    example: 'price_1...',
  },
];

const optionalVars = [
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    description: 'Webhook Secret (required for local testing)',
    pattern: /^whsec_/,
    example: 'whsec_...',
  },
];

console.log(`\n${colors.bold}${colors.cyan}🔍 Checking Stripe Configuration...${colors.reset}\n`);

let allValid = true;
let hasOptional = true;

// Check required variables
console.log(`${colors.bold}Required Configuration:${colors.reset}`);
requiredVars.forEach(varConfig => {
  const value = envVars[varConfig.name];
  const isValid = value && varConfig.pattern.test(value);

  if (isValid) {
    console.log(`  ${colors.green}✅${colors.reset} ${varConfig.description}: ${colors.green}Set${colors.reset}`);
  } else if (value) {
    console.log(`  ${colors.red}❌${colors.reset} ${varConfig.description}: ${colors.red}Invalid format${colors.reset}`);
    console.log(`     ${colors.yellow}Expected format: ${varConfig.example}${colors.reset}`);
    allValid = false;
  } else {
    console.log(`  ${colors.red}❌${colors.reset} ${varConfig.description}: ${colors.red}Not set${colors.reset}`);
    allValid = false;
  }
});

// Check optional variables
console.log(`\n${colors.bold}Optional Configuration:${colors.reset}`);
optionalVars.forEach(varConfig => {
  const value = envVars[varConfig.name];
  const isValid = value && varConfig.pattern.test(value);

  if (isValid) {
    console.log(`  ${colors.green}✅${colors.reset} ${varConfig.description}: ${colors.green}Set${colors.reset}`);
  } else if (value) {
    console.log(`  ${colors.yellow}⚠️${colors.reset}  ${varConfig.description}: ${colors.yellow}Invalid format${colors.reset}`);
    console.log(`     ${colors.yellow}Expected format: ${varConfig.example}${colors.reset}`);
    hasOptional = false;
  } else {
    console.log(`  ${colors.yellow}⚠️${colors.reset}  ${varConfig.description}: ${colors.yellow}Not set${colors.reset}`);
    hasOptional = false;
  }
});

// Check if .env.local exists
console.log(`\n${colors.bold}Configuration File:${colors.reset}`);
if (fs.existsSync(envPath)) {
  console.log(`  ${colors.green}✅${colors.reset} .env.local exists`);
} else {
  console.log(`  ${colors.red}❌${colors.reset} .env.local not found`);
  console.log(`     ${colors.yellow}Run: cp .env.example .env.local${colors.reset}`);
  allValid = false;
}

// Final summary
console.log('\n' + '='.repeat(60) + '\n');

if (allValid) {
  console.log(`${colors.bold}${colors.green}✅ All required Stripe configuration is valid!${colors.reset}\n`);

  if (!hasOptional) {
    console.log(`${colors.yellow}⚠️  Note: Webhook secret is not configured.${colors.reset}`);
    console.log(`${colors.yellow}   For local testing, run: stripe listen --forward-to localhost:3000/api/stripe/webhook${colors.reset}`);
    console.log(`${colors.yellow}   Then add STRIPE_WEBHOOK_SECRET to .env.local and restart your app.${colors.reset}\n`);
  }

  console.log(`${colors.cyan}Next steps:${colors.reset}`);
  console.log(`  1. Start your app: ${colors.bold}npm run dev${colors.reset}`);
  console.log(`  2. Visit: ${colors.bold}http://localhost:3000/pricing${colors.reset}`);
  console.log(`  3. Test with card: ${colors.bold}4242 4242 4242 4242${colors.reset}\n`);

  process.exit(0);
} else {
  console.log(`${colors.bold}${colors.red}❌ Configuration incomplete or invalid${colors.reset}\n`);
  console.log(`${colors.cyan}To fix:${colors.reset}`);
  console.log(`  1. Make sure .env.local exists (copy from .env.example)`);
  console.log(`  2. Add your Stripe keys from: ${colors.bold}https://dashboard.stripe.com/apikeys${colors.reset}`);
  console.log(`  3. Create products and get price IDs from: ${colors.bold}https://dashboard.stripe.com/products${colors.reset}`);
  console.log(`  4. Run ${colors.bold}npm run check-stripe${colors.reset} again\n`);
  console.log(`${colors.cyan}See START_HERE.md for detailed setup instructions.${colors.reset}\n`);

  process.exit(1);
}

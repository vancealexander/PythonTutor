#!/bin/bash

# Script to commit all Stripe integration files
# Run from: /Users/VanceAlexander/Code/PythonTutor/python-tutor

echo "🔍 Checking for new Stripe files..."
echo ""

# Show what we're about to commit
git status

echo ""
echo "📦 Adding Stripe integration files..."

# Add all the new files
git add app/api/stripe/
git add app/pricing/
git add components/pricing/
git add lib/stripe/stripe.ts
git add lib/stripe/check-config.ts
git add START_HERE.md

echo ""
echo "✅ Files staged for commit!"
echo ""
echo "📝 Review what will be committed:"
git status

echo ""
echo "💾 Ready to commit? Run:"
echo "   git commit -m 'Add Stripe payment integration - components and API routes'"
echo "   git push"

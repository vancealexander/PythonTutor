# DuckDuckGo Free Tier Testing

**Branch:** `feature/duckduckgo-free-tier`
**Created:** October 4, 2025
**Purpose:** Experiment with free AI tier using DuckDuckGo chat

## Current Status

### Cloudflare Worker
- **URL:** `https://python-tutor-ai.pythontutor.workers.dev`
- **Status:** Deployed but returning 418 error
- **Issue:** VQD token format changed (DuckDuckGo API updates)

### Main Branch
- ✅ Python execution works (Pyodide)
- ✅ AI Tutor works with Anthropic API
- ✅ MVP is functional for users with API keys
- ⚠️ DuckDuckGo code exists but inactive (not breaking anything)

## Testing Plan

### Test 1: Python DuckDuckAI Library in Pyodide ⏳
**Goal:** Use duckai Python package directly in browser

**Steps:**
1. [ ] Install `duckai` via micropip in browser console
2. [ ] Test basic query
3. [ ] Check for CORS errors
4. [ ] Test response quality
5. [ ] Integrate into app if successful

**Expected Issues:**
- Potential CORS restrictions from browser
- Network library compatibility with Pyodide
- Performance overhead

**Success Criteria:**
- Can install package without errors
- Can make API calls from browser
- Returns valid AI responses
- No CORS errors

---

### Test 2: Fix Cloudflare Worker VQD Tokens
**Goal:** Update worker to handle new VQD token format

**Steps:**
1. [ ] Research latest VQD token header names (Jan 2025)
2. [ ] Update `worker/index.js` with new logic
3. [ ] Add better error handling and logging
4. [ ] Redeploy: `wrangler deploy`
5. [ ] Test with curl
6. [ ] Test in Python Tutor app

**Known Issues:**
- DuckDuckGo changed from `x-vqd-4` to `x-vqd-hash-1`
- May have changed again in 2025
- Tokens expire frequently
- Wrong tokens trigger IP blocks

**Success Criteria:**
- Worker returns valid AI responses
- No 418 errors
- Consistent performance
- CORS works from browser

---

### Test 3: Alternative Free AI Options
**Goal:** Explore other free AI APIs if DuckDuckGo fails

**Options to Research:**
- Groq (free tier, fast)
- Together.ai (free tier)
- Hugging Face Inference API
- Cohere (free tier)

---

## Test Results

### Test 1: Python DuckDuckAI in Pyodide
**Date:** October 4, 2025
**Result:** [X] FAIL - Not Compatible with Pyodide
**Error:** `ValueError: Can't find a pure Python 3 wheel for 'duckai'`

**Notes:**
- duckai package cannot be installed in Pyodide/WebAssembly
- Package has non-pure-Python dependencies
- Browser Python approach is not viable
- **Conclusion:** Must use Cloudflare Worker instead

**Test URL:** http://localhost:3004/test-duckai

---

### Test 2: Worker VQD Fix
**Date:** [To be filled]
**Result:** [ ] Success / [ ] Fail
**Notes:**

---

## Decision

After testing:
- [ ] **Merge to main** - Free tier works, add to production
- [ ] **Keep experimenting** - Partial success, needs more work
- [ ] **Discard branch** - Doesn't work, keep main as-is
- [ ] **Simplify main** - Remove DuckDuckGo code entirely

## Notes

- Main branch remains stable throughout testing
- Can deploy main to production at any time
- Feature branch is for experimentation only
- No pressure to make this work - nice to have, not must have

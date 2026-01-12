# Security Quality Gate

# Using Mock Snyk Scanner as a Gate

**Context:**
- .github/tools/snyk-mock/scan.js
- backend/src/server.ts
- frontend/src/
---

## Step 1: Run the Security Scan

In terminal:
```bash
node .github/tools/snyk-mock/scan.js scan .
```

This scans for:
- Hardcoded API keys/secrets
- Dangerous `eval()` usage
- Missing CORS configuration
- SQL injection patterns

---

## Step 2: Review Findings

If vulnerabilities are found, the output shows:
- Severity (Critical, High, Medium)
- File and line number
- Code snippet
- Recommended fix

---

## Step 3: Fix Vulnerabilities with Agent

If issues are found, use this prompt:
```
Run the security scan at .github/tools/snyk-mock/scan.js and fix any vulnerabilities found.

For each issue:
1. Navigate to the file
2. Apply the recommended fix
3. Re-run the scan to verify

The scan must pass (exit 0) before we can proceed.
```

---

## Step 4: Verify Gate Passes

Re-run the scan:
```bash
node .github/tools/snyk-mock/scan.js scan .
```

Expected output:
```
Testing ...

✓ No vulnerabilities found

Scanned in XXms
```

---

## Step 5: Run Tests

After security gate passes, run tests:
```bash
# Backend tests
cd backend && npm run test

# Frontend Playwright tests  
cd frontend && npx playwright test --reporter=line
```

---

## Step 6: Handoff to Code Review

Once security and tests pass, handoff to code review:

Prompt:
```
Review the changes made during this session:

1. Show me a summary of all files modified
2. Review the code for:
   - Code quality and best practices
   - Potential bugs or edge cases
   - Performance considerations
   - Documentation completeness
3. Suggest any improvements before we create a PR

Focus on the TypeScript migration and any security fixes applied.
```

Alternatively, use VS Code's built-in review:
- Open **Source Control** view
- Click **"Code Review - Uncommitted Changes"** icon (`< >`)

---

## Step 7: Create Pull Request

After review approval:
```
Create a pull request for the changes in the feature/ts-migration branch.

Title: feat: migrate frontend to TypeScript
Description: Include summary of changes, type definitions added, and test results.
```

---

## Optional: JSON Output for CI

For CI pipelines, use JSON output:
```bash
node .github/tools/snyk-mock/scan.js scan . --json
```

---

**Key Talking Points:**
- Security gates should block merges if they fail
- Agents can auto-remediate known vulnerability patterns
- Verification loop: scan → fix → re-scan
- Handoff pattern: Security → Tests → Review → PR
- This is a mock tool - real projects use Snyk, CodeQL, Semgrep

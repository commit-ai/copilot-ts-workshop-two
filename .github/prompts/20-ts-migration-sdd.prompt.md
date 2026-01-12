# Specification-Driven Development (SDD) for TypeScript Migration

# Background Agent with Worktree

**Context:**
- frontend/src/App.js
- frontend/src/index.js
- .github/skills/ts-migration/SKILL.md
---

## Step 1: Switch to Migration Agent

In the chat, switch to the **Migration** agent (`@Migration`).

---

## Step 2: Create Spec + Run Migration as Background Agent

Copy this prompt:
```
Migrate the frontend from JavaScript to TypeScript.

## Phase 1: Setup
1. Create a git worktree at ../superhero-ts-migration on branch feature/ts-migration
2. Work in that worktree for all changes

## Phase 2: Specification
Create a specification document that includes:
- Current state analysis of frontend/src files
- Type definitions needed (Superhero, Powerstats interfaces based on the API data)
- Migration order (types.ts → reportWebVitals → App → index)
- Success criteria

## Phase 3: Implementation
Execute the migration following the spec:
- Create types.ts with interfaces
- Migrate each file in order
- Run `npx tsc --noEmit` after each file to verify
- Use the ts-migration skill at .github/skills/ts-migration/SKILL.md for patterns

## Phase 4: Verification
- Ensure all files compile with strict mode
- Run the frontend to verify it still works
- Report completion summary
```

---

## Step 3: Delegate to Background Agent

1. Click the **"Continue chat in..."** arrow (↗) at the bottom of the chat
2. Select **"Background (CLI)"**
3. The agent will run in the background / on GitHub's infrastructure

---

## Step 4: Monitor in AgentHQ

While the background agent works:
- Open the **AgentHQ** dashboard
- Show: Task Queue, Agent Status, Resource Monitor
- Explain: "The agent is working in an isolated worktree - our main workspace is unaffected"

> 💡 **Backup**: If AgentHQ unavailable, show the ASCII diagram in `.github/assets/README.md`

---

## Step 5: Verify Worktree Created

In terminal (while agent runs):
```bash
git worktree list
```

Should show the new worktree at `../superhero-ts-migration`.

---

**Key Talking Points:**
- SDD: Spec first, then implement
- Background agents work without blocking your IDE
- Worktrees isolate experimental changes
- Agent follows the skill patterns for consistency
- Monitor progress in AgentHQ

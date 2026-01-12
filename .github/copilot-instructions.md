# Copilot instructions (copilot-ts-workshop-two)

## Project Architecture

**Three-tier workshop application**: Express API backend (TypeScript) → React frontend (JavaScript) → Static superhero data

- **Backend** (../backend/): Express TypeScript server serving superhero data from JSON file
  - Runs on port 3000 (or TEST_PORT for tests)
  - 3 API endpoints: `/api/superheroes`, `/api/superheroes/:id`, `/api/superheroes/:id/powerstats`
  - Data source: [backend/data/superheroes.json](../backend/data/superheroes.json)
  - Must export `app` for testing (avoid starting server in test env)

- **Frontend** (../frontend/): React app with superhero comparison UI
  - Runs on port 3001, proxies API to `:3000`
  - Two views: table view (hero selection) → comparison view (head-to-head stats)
  - Selection logic: max 2 heroes, replaces first if selecting third
  - Winner calculation: count stat-by-stat victories across 6 powerstats

- **MCP** (../mcp/): Model Context Protocol server stub (workshop placeholder)

## Critical Developer Workflows

**Starting services** (run in separate terminals):
```bash
cd backend && npm install && npm run dev    # Backend on :3000
cd frontend && npm install && npm start     # Frontend on :3001
```

**Running tests**:
```bash
cd backend && npm run test                           # Jest unit tests
cd frontend && npx playwright test --reporter=line   # Playwright E2E tests
```

**Test environment quirks**:
- Backend uses `TEST_PORT=3002` to avoid conflicts during Jest runs
- Frontend Playwright tests expect backend running on `:3000` and frontend on `:3001`
- Never start Express server when `process.env.NODE_ENV === 'test'`

## TypeScript & Module Conventions

**ESM-only setup across all packages**:
- Backend: `"type": "module"` with `NodeNext` module resolution, uses `tsx` for dev execution
- MCP: `Node16` module resolution, builds to CommonJS-compatible output
- Frontend: Standard React (JavaScript, not TypeScript)

**Import requirements**:
- Always use `.js` extensions in TypeScript imports (ESM requirement)
- Use `fileURLToPath(import.meta.url)` for `__dirname` equivalent in ESM

## Testing Patterns

**Backend (Jest with ESM)**:
- Config: [backend/jest.config.cjs](../backend/jest.config.cjs) uses `ts-jest/presets/default-esm`
- Use `supertest` to test Express app without starting server
- Mock route handlers by manipulating `app._router.stack` (see error test example)

**Frontend (Playwright)**:
- Config: [frontend/playwright.config.ts](../frontend/playwright.config.ts) 
- Test structure: `beforeEach` navigates to app and selects heroes for comparison tests
- Use `page.waitForResponse()` to verify API integration
- Test naming convention: descriptive English sentences (e.g., "should display both heroes in comparison")
- Accessibility tests included (check test-results for coverage)

## Key File References

- API server implementation: [backend/src/server.ts](../backend/src/server.ts)
- Main React component: [frontend/src/App.js](../frontend/src/App.js)
- Backend test examples: [backend/tests/server.test.ts](../backend/tests/server.test.ts)
- Frontend test examples: [frontend/tests/hero-comparison.spec.ts](../frontend/tests/hero-comparison.spec.ts)
- Workshop setup guide: [.github/prompts/00-setup.md](prompts/00-setup.md)

## Workshop Context

This is a **GitHub Copilot training workshop** demonstrating AI-assisted development. The [.github/prompts/](prompts/) directory contains sequential workshop exercises covering:
- Instruction generation (this file)
- MCP server creation
- GitHub integration workflows
- Playwright test automation
- Code review and refactoring

## Protected Directories

> ⚠️ **DO NOT MODIFY** the following directories unless explicitly requested:

- **`.demo/`**: Demo reset infrastructure (snapshot.sh, reset.sh)
  - These scripts manage demo state and should not be modified by agents
  - Used for "turn on/off" demo workflows

- **`.github/tools/snyk-mock/`**: Mock security scanner
  - Used as a quality gate tool, should remain stable

## Custom Agents & Skills

**Agents** (`.github/agents/`):
- `Migration.agent.md` - TypeScript migration specialist
- `Designer.agent.md` - Vision-based UI implementation
- `Debug.agent.md` - Debugging workflow
- `terraform.agent.md` - Infrastructure as code

**Skills** (`.github/skills/`):
- `ts-migration/SKILL.md` - TypeScript patterns for React migration
- `agent-loops/SKILL.md` - ReAct loop patterns, memory management

**Demo Flows**:
- `DEMOFLOW1.md` - Basic workshop flow
- `DEMOFLOW2.md` - Extended with coding agent
- `DEMOFLOW3.md` - Advanced agentic workflow (SDD, worktrees, vision, security gates)

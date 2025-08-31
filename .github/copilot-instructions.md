# Copilot Instructions for AI Coding Agents

This file gives targeted, actionable guidance for AI coding agents working in this repo. Keep it short — focus on the project's structure, run/test commands, and code patterns the agent should follow.

## Project File Structure

**Root**
- `.github/` — Copilot/agent instructions, prompts, chatmodes, workflow configs
- `DEMOFLOW.md` — Demo walkthrough and session plan
- `.vscode/` — VS Code workspace settings (MCP server config)

**backend/** (Express + TypeScript API)
- `src/server.ts` — Main Express server, all API endpoints
- `data/superheroes.json` — Superhero data (read by API)
- `tests/server.test.ts` — Jest tests for all endpoints and error handling
- `package.json` — Scripts: `start`, `dev`, `test` (Jest, tsx, nodemon)
- `jest.config.cjs` — Jest config for ESM/TypeScript
- `tsconfig.json` — TypeScript config

**frontend/** (React app)
- `src/App.js` — Main UI, fetches `/api/superheroes`, handles selection/comparison
- `src/index.js` — Entrypoint, renders `App`
- `src/App.css` — App styles (table, comparison, responsive)
- `public/index.html` — HTML template
- `package.json` — Scripts: `start` (CRA, port 3001), `build`, Playwright devDeps
- `playwright.config.ts` — Playwright config (baseURL, testMatch)
- `tests/sanity.spec.ts` — Playwright sanity test for homepage

**mcp/** (Model Context Protocol server)
- `src/index.ts` — MCP server (TypeScript, ESM)
- `build/index.js` — Built MCP server (run by config)
- `data/superheroes.json` — Superhero data (same schema as backend)
- `tests/test-mcp.js` — Node script to test MCP server and data loader
- `mcp.json` — MCP server config (command, args)
- `package.json` — Scripts: `build` (tsc), MCP SDK deps
- `tsconfig.json` — TypeScript config for MCP

Refer to these files for navigation, search, and when adding new features or tests.

## Code Review Guidelines

Follow these rules for all PRs and code changes:

- **Tests must pass**: Run `npm test` in `backend/` and `npx playwright test` in `frontend/` after any change. Never break existing tests.
- **Preserve API contracts**: Do not change endpoint paths, response shapes, or error messages unless updating all dependent code/tests and documenting the change.
- **Error messages**: Use exact strings expected by tests (e.g., `Superhero not found`, `Failed to load superheroes data:`).
- **Minimal, focused changes**: Only touch files needed for the feature/fix. Avoid unrelated refactors in the same PR.
- **Consistent style**: Follow the file's existing formatting and ESM import style. Use TypeScript types and interfaces as in `server.ts` and `mcp/src/index.ts`.
- **Data access**: Always read superhero data from the correct `data/superheroes.json` file for the component (backend or MCP). Do not duplicate data.
- **Frontend-backend integration**: If changing API endpoints, update both backend and frontend fetch logic, and Playwright tests if needed.
- **Prompt adherence**: When editing MCP, follow `.github/prompts/create-superheroes-mcp.prompt.md` exactly for required messages, error handling, and output format.
- **Documentation**: Update this file and relevant prompts if you add new endpoints, features, or conventions.

For major changes, add a checklist to your PR description:
- [ ] All tests pass (backend, frontend, MCP)
- [ ] API contracts unchanged or updated everywhere
- [ ] Error messages and logs match test expectations
- [ ] Documentation and instructions updated

## Key points
- Repository layout: `backend/` (Express + TypeScript API), `frontend/` (Create React App), `mcp/` (Model Context Protocol helper).
- Primary data: `*/data/superheroes.json` — read-only JSON used by backend, frontend (via proxy) and MCP.

## Quick workflows
- Run backend (dev): from `backend/` use `npm run dev` (nodemon + tsx). Production/dev start: `npm start`.
- Run backend tests: from `backend/` use `npm test` (Jest configured for ESM/ts-jest).
- Run frontend dev: from `frontend/` use `npm start` (CRA, port set via `cross-env PORT=3001`). The frontend proxies API requests to `http://localhost:3000` (see `frontend/package.json` "proxy").
- Run frontend Playwright tests: `npx playwright test` from `frontend/` (config uses baseURL http://localhost:3002 in CI/test runs).
- Build MCP: from `mcp/` run `npm run build` (tsc -> `mcp/build/index.js`) and test with `mcp/tests/test-mcp.js`.

## Important conventions & patterns
- ESM + TypeScript: many packages use `type: "module"` and ESM imports. Use `fileURLToPath(import.meta.url)` to compute `__dirname` when needed (see `backend/src/server.ts` and `mcp/src/index.ts`).
- Single-source JSON data: prefer reading `../data/superheroes.json` with `fs.promises.readFile` and explicit error messages like `Failed to load superheroes data: ${err instanceof Error ? err.message : String(err)}` (the MCP prompt and test expect this exact phrasing).
- Tests start servers via importing `app` (backend exports Express `app` and guards startup with `NODE_ENV !== 'test'`). When writing new endpoints, ensure they remain test-friendly (no automatic listen in test env).
- Frontend behavior: the React app fetches `/api/superheroes` (CRA proxy forwards to backend). If adjusting ports, update `frontend/package.json` proxy and Playwright `baseURL` as appropriate.

## Integration points to watch
- Proxy: `frontend/package.json` uses `proxy: "http://localhost:3000"` — keep backend running on port 3000 (or change both proxy and backend start environment).
- MCP: `mcp/mcp.json` and `.vscode/mcp.json` reference the built `mcp/build/index.js`. The `.github/prompts/create-superheroes-mcp.prompt.md` lists exact behavior and messages tests expect — follow it when editing `mcp/src/index.ts`.
- Playwright: `frontend/playwright.config.ts` has `baseURL: 'http://localhost:3002'` and ignores `src/` tests. Tests assume a running frontend on 3001/3002 in CI — confirm before running locally.

## Editing rules for AI agents
- Minimal, targeted changes. Preserve existing public APIs and test expectations (especially exact response text and error messages used in tests).
- Always run the relevant tests after edits: backend unit tests (`backend/npm test`) and frontend Playwright tests (`npx playwright test`) where applicable.
- When adding server logs or errors, use the exact strings referenced by tests and prompts (e.g., `Save the World!`, `Superhero not found`, `Failed to load superheroes data:`).

## Files to inspect first
- `backend/src/server.ts` — primary API implementation and server-start guard.
- `backend/tests/server.test.ts` — tests that encode exact response strings and error handling.
- `frontend/src/App.js` — app fetches `/api/superheroes` and contains selection/comparison logic.
- `mcp/` folder — `mcp/src/index.ts`, `mcp/build/index.js`, `mcp/tests/test-mcp.js`, and `.github/prompts/create-superheroes-mcp.prompt.md` (detailed spec for MCP behavior).

## When in doubt
- Prefer small edits that keep tests green. Run unit tests (`backend`) and Playwright tests (`frontend`) after changes. Ask for clarification only if you need to change public behavior or ports.
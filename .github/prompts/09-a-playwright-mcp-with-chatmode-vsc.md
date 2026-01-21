# Playwright MCP + Chatmode to test the app

Pre-requisites:
- Go to GitHub MCP Registry and find the Playwright MCP and install it:
https://github.com/mcp
- Go to awesome-copilot to find the prompt: https://github.com/github/awesome-copilot/blob/main/agents/playwright-tester.agent.md

Review the custom Playwright agent MD - [agents/Playwright-Tester.agent.md](../agents/Playwright-Tester.agent.md):
- Note the **tooling**
- Note the **model**
- Note the **instructions**


1. Open chat in **NEW WINDOW** (parallel session)
2. Then use Playwright-Tester agent:
```
Using Playwright MCP - explore the web app already running on localhost port 3001, and the existing tests under /frontend/tests/ - suggest edge case tests to improve the existing test coverage, and write your suggested improvement PLAN (not code).

Then implement just ONE improvement or in the form of a new test under a new file at /frontend/tests/edge-cases.spec.ts, run all tests, fix until all pass reliably.

To run tests - navigate into the /frontend folder, and run using this command: "npx playwright test --reporter=line"

Assume frontend server is already running on port localhost 3001!
```

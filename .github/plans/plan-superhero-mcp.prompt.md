## Plan: Superheroes MCP server (stdio)

Implement the MCP server in `mcp/src/index.ts` exactly per the spec: load `data/superheroes.json`, expose a `get_superhero` tool (name/id search), and return a single markdown-formatted text result. Use Node ESM-safe `__dirname` computation, ensure optional tool inputs are truly optional in the Zod schema, and send all logs to stderr to avoid corrupting the stdio transport.

Check MCP SDK API docs README, its intalled locally, under mcp/node_modules/@modelcontextprotocol/sdk/README.md

### Steps  (5 steps, 5–20 words each)
1. Confirm `mcp/build/index.js` is generated from `mcp/src/index.ts` (remove stale build if needed).
2. Implement `Powerstats`, `Superhero`, and `loadSuperheroes()` in [`mcp/src/index.ts`](mcp/src/index.ts).
3. Implement `formatSuperheroMarkdown(hero)` with exact header, bullets, `<img>` tag, indentation.
4. Create `McpServer` with name/version and empty `{ resources: {}, tools: {} }` capabilities options.
5. Register `get_superhero` tool (optional `name`/`id`), connect stdio, stderr log + fatal handler; run the smoke script in [`mcp/tests/test-mcp.js`](mcp/tests/test-mcp.js) after `npm run build`.

### Further Considerations  (1–3, 5–25 words each)
1. Zod import: spec says `import z from "zod"`; Node ESM usually needs `import { z } from "zod"`—which should we prioritize?
2. Capabilities placement: ensure `{ resources: {}, tools: {} }` is passed as server *options*, not inside serverInfo.

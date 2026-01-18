# Refactor: Step 1 - Add BE Compare API Endpoint

# New Chat: GPT-5

Original "lazier" spec prompt
```
Add a new comparison API in the backend under src/server.ts, under path "/api/superheroes/compare?id1=x&id2=y".
It should get two superhero IDs as request arguments (id1, id2) and return who's stronger in each of the 6 categories (ordered "intelligence", "strength", "speed", "durability", "power", "combat") and a final decision on which super hero wins the overall comparison, in JSON format.
Allow for a tie if each wins 3 categories out of 6.
Unit tests should be generated for the new API under "/tests/server.test.ts", and pass along with all existing tests.
```

More robust spec prompt (optimized for GPT-5):
```
# Role and Objective
Implement a new comparison API endpoint in the backend that compares two superheroes based on specific attributes across standardized categories.

Begin with a concise checklist (3-7 bullets) of what you will do; keep items conceptual, not implementation-level.

# Instructions
- Create a new GET endpoint at `superheroes/compare?id1=<number>&id2=<number>` in `src/server.ts`.
- The endpoint must accept two request query parameters: `id1` and `id2`, corresponding to superhero IDs.
- For each of the following categories, compare the corresponding attributes between the two superheroes: "intelligence", "strength", "speed", "durability", "power", "combat".
  - For each category, record which superhero has the higher value, or "tie" if they are equal.
- Compose and return a JSON response structured with:
  - The IDs compared (`id1`, `id2`).
  - A `categories` array (ordered: "intelligence", "strength", "speed", "durability", "power", "combat"), each containing:
    - `name`: category name
    - `winner`: 1, 2, or "tie" (depending on which superhero is superior in the category)
    - `id1_value`: Value for id1.
    - `id2_value`: Value for id2.
  - An `overall_winner`: 1, 2, or "tie" (whichever wins more categories, or "tie" if each has 3 wins).
- If either superhero ID is missing or invalid, respond with a JSON error matching the provided format and include `status: "invalid_request"`.

# Context
- API location: `src/server.ts`
- Related test file: `/tests/server.test.ts`

# Reasoning and Validation
- Set reasoning_effort=medium for balanced coverage and efficiency.
- After each major step (input validation, data fetch, comparison, response), briefly validate completion or correctness before proceeding to the next step. If validation fails, self-correct.

# Output Format
Successful response:
```json
{
  "id1": <number>,
  "id2": <number>,
  "categories": [
    {
      "name": "strength",
      "winner": 1 | 2 | "tie",
      "id1_value": <number>,
      "id2_value": <number>
    },
    // ... one object for each category in the specified order
  ],
  "overall_winner": 1 | 2 | "tie"
}
```
Error response (e.g., missing or invalid IDs):
```json
{
  "error": <string>,
  "status": "invalid_request"
}
```

# Testing
- Add or update tests in `/tests/server.test.ts` for all success and error cases for the new comparison endpoint. Ensure all existing tests continue to pass.
- If editing code: (1) state assumptions, (2) create/run minimal tests where possible, (3) produce ready-to-review diffs, (4) follow repo style.

# Stop Conditions
- Endpoint fully implemented, tested, documented, and covered by unit tests.

```

---
Let's run a quick check ourselves in our Simple Browser:
Cmd + Shift + P: Simple Browser
```
http://localhost:3000/api/superheroes/compare?id1=1&id2=2
```
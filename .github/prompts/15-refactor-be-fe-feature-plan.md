# Plan: Refactor Superhero Comparison to Backend API
Move the winner calculation logic from App.js to a new /api/superheroes/compare endpoint in server.ts, keeping the existing UI unchanged while all tests continue passing.

## Phase 1: Backend — Add Compare Endpoint
Add GET /api/superheroes/compare endpoint in server.ts, Extract id1 and id2 from query params, validate both are provided and numeric (return 400 if invalid), fetch both heroes (return 404 if not found), calculate per-category winners and overall winner, return JSON response per spec.

Add backend tests in server.test.ts: Test success case (valid comparison), 400 for missing/invalid params, 404 for non-existent heroes, and tie scenario.

Validate backend tests pass: Run npm test in backend to ensure all existing and new tests pass.

## Phase 2: Frontend — Consume New API
Add new state variables in App.js:10: Add comparisonResult, isComparing, and comparisonError state hooks.

Refactor compareHeroes function at App.js:36-40: Replace local logic with fetch('/api/superheroes/compare?id1=X&id2=Y'), handle loading/error states.

Update ComparisonView component at App.js:69-133: Map comparisonResult.categories to render stat comparisons, use comparisonResult.overall_winner for winner display, add loading spinner and error message UI.

Remove calculateWinner function at App.js:46-66: Delete this function once API integration is complete.

The frontend needs to be updated to handle numeric hero IDs from the API response.
See lines 76-86 in App.js:76-86. The getScoreFromCategories function is checking for category.winner as a string value like 'hero1' or 'hero2', but the API will be returning numeric IDs (1, 2, 3, etc.) for the winner field.

Validate frontend tests pass: Run npx playwright test in frontend to ensure hero-comparison.spec.ts and winner-calculation.spec.ts still pass.

## Phase 3: E2E Tests — API Integration
Create frontend/tests/comparison-api.spec.ts: Add E2E tests that verify the compare API is called when comparing heroes, mock API responses to test error handling, and validate the full flow from selection to comparison result.
Add tests that check the correct score calculation. A-Bomb vs Bane should yield Bane as the overall winner Score: 2-4. Ant-Man vs A-Bomb should yield a tie Score: 3-3.

Run full E2E suite: Execute all Playwright tests to confirm no regressions across hero-table.spec.ts, hero-selection.spec.ts, and API integration tests.

## Questions / Considerations

Loading State: Display a spinner/skeleton while awaiting API response, or disable the compare button? Recommend spinner overlay on comparison view.

API Base URL Configuration: Hardcode /api/superheroes/compare or use an environment variable for flexibility? Recommend env var REACT_APP_API_URL for production deployability.
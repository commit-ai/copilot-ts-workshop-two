---
name: responsive-hero-table
description: 'Make data tables responsive without clipping, horizontal page overflow, or brittle breakpoints. Use when adapting a table for phones, fixing a table that breaks at an intermediate viewport, choosing responsive breakpoints, or adding Playwright coverage for table layouts.'
argument-hint: 'Table to make responsive or viewport issue to fix'
---

# Responsive Data Tables

Create responsive table presentations that remain readable and usable at every supported viewport, especially between the obvious phone and desktop sizes.

## Use When

- A data table is cut off, causes horizontal page scrolling, or clips controls at a particular viewport width.
- A table needs a compact mobile or narrow-window presentation.
- A CSS breakpoint was guessed and needs to be chosen from rendered behavior.
- Adding regression coverage for responsive table layout with Playwright.

## Outcome

Keep the wide-screen table where it fits. At smaller widths, switch to an equivalent compact presentation, commonly stacked records with cell labels. The page must not horizontally overflow, controls must remain visible, and row selection or other existing interactions must continue to work.

## Procedure

1. Identify the table markup, its controlling CSS, and existing browser tests.
2. Reproduce the reported viewport exactly. Inspect the rendered document width and capture a screenshot when useful.
3. State a local hypothesis before editing. Typical hypothesis: the desktop table has a larger intrinsic width than the viewport, while the compact layout begins too late or does not exist.
4. Choose the smallest presentation change consistent with the existing UI:
   - Retain the semantic `table`, `thead`, `tbody`, `tr`, and `td` markup when it supports the needed interactions and tests.
   - For compact records, retain cell values and add semantic metadata such as `data-label` to each `td`.
   - At the compact breakpoint, hide the column header row and display each `tbody tr` as a bordered record. Display each `td` as a labeled value pair using `td::before { content: attr(data-label); }`.
   - Preserve keyboard focus, click targets, selected-row styling, images, and controls.
5. Run a focused test immediately after the first implementation edit. Do not widen the change before learning whether the proposed layout fixes the reported viewport.
6. Measure the breakpoint rather than guessing it:
   - Test the reported width plus representative phone and intermediate widths.
   - At each width, assert `document.documentElement.scrollWidth <= viewportWidth`.
   - Test the width immediately above the compact breakpoint too. The wide table may still overflow there because its intrinsic width changes with layout conditions such as parent padding, margins, borders, and column sizing.
   - If the wide layout overflows, raise the compact-layout breakpoint, add a small buffer above the measured minimum, and retest both sides of the new boundary.
7. Run the full focused frontend test suite and a production build. For visual changes, inspect a browser screenshot at the reported failing width before declaring success.

## Playwright Test Pattern

Use a table-driven viewport test. Assert presentation only for widths that should use the compact layout; assert no document overflow for every width under test.

```ts
const compactBreakpoint = 820;

for (const width of [375, reportedWidth, compactBreakpoint, compactBreakpoint + 1]) {
  await page.setViewportSize({ width, height: 812 });
  await page.goto('/');

  const table = page.locator('table');
  await expect(table).toBeVisible();

  if (width <= compactBreakpoint) {
    await expect(page.locator('thead')).toBeHidden();
    await expect(table.locator('tbody tr').first().locator('td').first())
      .toHaveAttribute('data-label', 'ID');
  }

  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(documentWidth).toBeLessThanOrEqual(width);
}
```

Use the actual app's labels, selectors, accessibility expectations, and viewport heights. `820` is illustrative only; it is not a default breakpoint.

## Decision Rules

- **Wide table fits and remains legible:** keep the table layout.
- **Wide table overflows or clips at a target width:** use the compact presentation at that width.
- **The table is very dense but horizontal scrolling is acceptable by product requirement:** place it in an explicit horizontal scroll container, make that affordance clear, and test the container. Do not let the entire document overflow.
- **Rows are interactive:** ensure the compact layout does not shrink or fragment the row's usable click and keyboard target.
- **Images or long content expand the table:** constrain their dimensions and confirm they do not create overflow independently.

## Failure Modes to Avoid

- Do not assume a narrow-screen cutoff such as 600px solves intermediate widths. A 619px viewport can still render the desktop table and clip it.
- Do not choose a breakpoint solely because the compact view looks good at one phone width. Check the transition boundary from both sides.
- Do not treat a hidden header as proof that the layout is correct. It only verifies the chosen presentation; it does not detect document overflow.
- Do not require compact-only assertions above the compact breakpoint. At those widths, test the wide table's fit instead.
- Do not infer the needed breakpoint from a single failed width. The wide table's actual rendered minimum may be larger than expected, including immediately above a media-query boundary.
- Do not validate only the original viewport. Include a small phone width, the reported failing width, the compact breakpoint, and one pixel above it.
- Do not substitute a full-page horizontal scroll for a responsive strategy unless that behavior is explicitly required.

## Completion Criteria

- The reported bad viewport has no horizontal document overflow or clipped content.
- Compact records show unambiguous labels and values where headers are hidden.
- Existing table data, selection, keyboard behavior, and controls still work.
- Regression tests cover the reported width and both sides of the chosen breakpoint.
- Focused browser tests and the production build pass.
- A screenshot or browser inspection confirms the final layout is visually coherent at the originally failing viewport.

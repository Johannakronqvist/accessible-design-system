# Conformance & CI setup

How the system proves - and keeps proving - that it meets EN 301 549 / WCAG 2.2 AA.
Three layers: an automated gate that blocks regressions, a conformance map that is the
single source of truth, and a short manual checklist for the things automation can't see.

## 1. The automated gate

Nothing merges below bar. Three checks run in CI on every pull request.

### a. Contrast (already in the system)

Colour pairings are derived to a target ratio rather than hand-picked, and
`deriveAccent()` re-derives accessible shades for any brand colour. Add a small
node script that fails the build if any token pairing drops below 4.5:1 (the same
maths used in the guide), and run it in CI.

### b. Component tests (Vitest + jest-axe + Testing Library)

Two suites, both run by `npm test`:

- **`test/a11y.test.jsx`** - every component, in every state it ships, asserted to
  have zero axe violations. This is the mechanical half: missing labels, broken
  ARIA references, bad roles, orphaned attributes.
- **`test/interaction.test.jsx`** - the half axe cannot see. Each block guards a
  specific claim in `CONFORMANCE`, with the criterion named in the test title, so
  a failure points straight at the row that has become untrue.

```jsx
// test/a11y.test.jsx (extract)
const clean = async (ui) => expect(await axe(render(ui).container)).toHaveNoViolations();

test("every variant and state", async () => {
  await clean(
    <>
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost" iconOnly ariaLabel="Settings" />
      <Button disabled>Disabled</Button>
      <Button loading>Saving</Button>
    </>
  );
});
```

```jsx
// test/interaction.test.jsx (extract) - guards the 2.4.3 claim
test("at a bound the button reports aria-disabled but keeps its place in the tab order", async () => {
  render(<NumberStepper label="Seats" min={1} max={5} defaultValue={5} />);
  const inc = screen.getByRole("button", { name: "Increase Seats" });
  expect(inc).toHaveAttribute("aria-disabled", "true");
  expect(inc).not.toBeDisabled(); // the whole point: focus is never dropped
});
```

**What jsdom cannot reach.** Two components deliberately delegate behaviour to the
browser, which is exactly why they are accessible - and exactly why the suite
cannot prove it:

- **`Slider`** is a native `range`. Arrow / Home / End and track-click are the
  browser's, so the suite asserts the element genuinely *is* a native range and
  leaves the keys to §3.
- **`Modal` / `Drawer`** are a native `<dialog>` opened with `showModal()`. The
  focus trap, the inert background and top-layer rendering are all the browser's.
  jsdom implements none of them - `showModal()` is undefined - so `test/setup.js`
  stubs it just far enough for React's logic to run and axe to inspect an open
  dialog. **Do not write a test that appears to verify the trap**: it would be
  asserting the stub. The suite covers what is ours - labelling, initial focus,
  scroll lock, backdrop dismissal, and keeping React state in step with the
  browser's own close.

### c. Lint with eslint-plugin-jsx-a11y

Catches missing labels, alt text, and bad roles as you type.

```json
// .eslintrc.json (extract)
{
  "extends": ["plugin:jsx-a11y/recommended"],
  "plugins": ["jsx-a11y"],
  "rules": {
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/no-autofocus": "warn"
  }
}
```

### Wiring it up

```json
// package.json (scripts) - the first two exist today
{
  "scripts": {
    "test": "vitest run",
    "check": "node scripts/render-check.mjs",
    "lint:a11y": "eslint \"**/*.{js,jsx}\"",
    "check:contrast": "node scripts/check-contrast.mjs"
  }
}
```

`npm test` runs both suites; `npm run check` renders the whole style guide through
Vite's SSR pipeline and fails on any React warning, which catches broken markup
before it ever reaches a test. Run both as required CI steps, and add `lint:a11y`
and `check:contrast` when you write them. A failing check blocks the merge.

## 2. The conformance map

The `CONFORMANCE` array in `Conformance.jsx` is the single source of truth. Each row
is a WCAG 2.2 criterion with a status:

- **Built in (`ok`)** - the component or token guarantees it.
- **Partial (`partial`)** - the component provides the mechanism; you supply the content
  (for example, an error region exists, but you write the error text).
- **Your part (`app`)** - the system can't cover it; it depends on your content or context
  (alt text, heading order, page language, media captions, AT testing).

Keep the map honest. It is rendered in the living style guide for engineers and feeds the
published accessibility statement, so the claim auditors and buyers see always matches what
actually ships. Over-claiming is worse than a gap you've named.

## 3. What automation can't catch

Roughly half of WCAG can't be verified by tools. Before a release, walk this list:

- **Keyboard only** - every action reachable and operable, visible focus, logical order,
  no traps.
- **Dialogs** - with a `Modal` or `Drawer` open: Tab and Shift+Tab cycle *within* it and
  never reach the page behind (2.1.2); a screen reader cannot read the background;
  Escape closes it and focus returns to the control that opened it (2.4.3); and the
  dialog is not clipped when its trigger sits inside a scrolling or transformed
  ancestor (2.4.11). All four are browser-supplied and none are covered by CI.
- **Sliders** - arrows, Home / End and Page Up / Down move the value, and clicking the
  track jumps to it, with no dragging required (2.5.7).
- **Screen reader** - test one desktop (NVDA or VoiceOver) and one mobile (VoiceOver or
  TalkBack); names, roles, and error announcements make sense.
- **Zoom & reflow** - 400% zoom and a 320px width with no loss of content or 2D scrolling
  (1.4.10); 200% text (1.4.4).
- **Text spacing** - apply the WCAG text-spacing bookmarklet; nothing clips (1.4.12).
- **Motion** - enable "reduce motion" and confirm animations stop (2.3.3).
- **Forms** - trigger real errors and confirm they're identified, described, and suggested
  clearly (3.3.1 / 3.3.3).

## 4. Adding a component later

1. Build it on the tokens (contrast, target size, focus ring, border come for free).
2. Add its rows to `CONFORMANCE` with honest statuses.
3. Add its states to `test/a11y.test.jsx`.
4. Add a block to `test/interaction.test.jsx` for every row you claimed that axe
   cannot verify - name the criterion in the test title, so the row and the test
   stay findable from each other.
5. Add an assertion to `scripts/render-check.mjs` pinning the markup it owns.
6. Run `npm test` and `npm run check`.
7. Update the accessibility statement's "last reviewed" date.

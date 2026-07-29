# Conformance & CI setup

How the system proves — and keeps proving — that it meets EN 301 549 / WCAG 2.2 AA.
Three layers: an automated gate that blocks regressions, a conformance map that is the
single source of truth, and a short manual checklist for the things automation can't see.

## 1. The automated gate

Nothing merges below bar. Three checks run in CI on every pull request.

### a. Contrast (already in the system)

Colour pairings are derived to a target ratio rather than hand-picked, and
`deriveAccent()` re-derives accessible shades for any brand colour. Add a small
node script that fails the build if any token pairing drops below 4.5:1 (the same
maths used in the guide), and run it in CI.

### b. Component tests with jest-axe

Export the primitives (`Button`, `Field`, layout components) and assert zero axe
violations for each state.

```jsx
// a11y.test.jsx
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button, Field } from "./design-system";

expect.extend(toHaveNoViolations);

test("Button variants have no axe violations", async () => {
  const { container } = render(
    <>
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost" iconOnly ariaLabel="Settings" />
      <Button disabled>Disabled</Button>
      <Button loading>Saving</Button>
    </>
  );
  expect(await axe(container)).toHaveNoViolations();
});

test("Field states have no axe violations", async () => {
  const { container } = render(
    <>
      <Field label="Email" type="email" required />
      <Field label="URL" error="That name is already taken." />
      <Field label="ID" disabled />
    </>
  );
  expect(await axe(container)).toHaveNoViolations();
});
```

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
// package.json (scripts)
{
  "scripts": {
    "test:a11y": "jest a11y.test.jsx",
    "lint:a11y": "eslint \"src/**/*.{js,jsx,ts,tsx}\"",
    "check:contrast": "node scripts/check-contrast.mjs"
  }
}
```

Run `test:a11y`, `lint:a11y`, and `check:contrast` as required CI steps. A failing
check blocks the merge.

## 2. The conformance map

The `CONFORMANCE` array in `design-system.jsx` is the single source of truth. Each row
is a WCAG 2.2 criterion with a status:

- **Built in (`ok`)** — the component or token guarantees it.
- **Partial (`partial`)** — the component provides the mechanism; you supply the content
  (for example, an error region exists, but you write the error text).
- **Your part (`app`)** — the system can't cover it; it depends on your content or context
  (alt text, heading order, page language, media captions, AT testing).

Keep the map honest. It is rendered in the living style guide for engineers and feeds the
published accessibility statement, so the claim auditors and buyers see always matches what
actually ships. Over-claiming is worse than a gap you've named.

## 3. What automation can't catch

Roughly half of WCAG can't be verified by tools. Before a release, walk this list:

- **Keyboard only** — every action reachable and operable, visible focus, logical order,
  no traps.
- **Screen reader** — test one desktop (NVDA or VoiceOver) and one mobile (VoiceOver or
  TalkBack); names, roles, and error announcements make sense.
- **Zoom & reflow** — 400% zoom and a 320px width with no loss of content or 2D scrolling
  (1.4.10); 200% text (1.4.4).
- **Text spacing** — apply the WCAG text-spacing bookmarklet; nothing clips (1.4.12).
- **Motion** — enable "reduce motion" and confirm animations stop (2.3.3).
- **Forms** — trigger real errors and confirm they're identified, described, and suggested
  clearly (3.3.1 / 3.3.3).

## 4. Adding a component later

1. Build it on the tokens (contrast, target size, focus ring, border come for free).
2. Add its rows to `CONFORMANCE` with honest statuses.
3. Add a jest-axe test covering its states.
4. Run lint and the contrast check.
5. Update the accessibility statement's "last reviewed" date.

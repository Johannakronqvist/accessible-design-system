# accessible-design-system

A themeable React design system where accessibility is a property of the
construction, not the result of an audit.

40 components, 165 tests, and a conformance map that drives the style guide, the
published accessibility statement and the test gate from one source - so the
claim made to auditors is exactly what ships.

---

## The idea

Most design systems are made accessible once, by hand, and then slowly stop
being accessible as they are re-themed. Someone picks a new brand colour, it
looks fine, and three contrast pairings quietly drop below AA. Nothing fails
loudly. The audit was a year ago.

This system is built so that cannot happen, on three principles.

### 1. Derive colours to a ratio, never pick them

`deriveAccent(hex, mode)` does not store your brand colour. It searches the
lightness axis for the nearest shade that clears **4.5:1** against the surface
it will sit on, and returns a set of accent tokens built from that.

```js
buildTheme({ accent: "#FFE81A" })  // pale yellow
// --accent-fill is NOT #FFE81A - it is darkened until white text passes on it
```

Because the derivation targets a *contrast ratio* rather than a fixed shade,
re-theming cannot silently drop below AA. There is a test asserting exactly
this for an unusable input colour, in both light and dark.

### 2. Use the platform

Where the browser already implements a hard accessibility problem correctly,
the component uses the browser rather than reimplementing it:

| Component | Native element | What the browser gives us |
|---|---|---|
| `Slider` | `input[type=range]` | Arrow/Home/End/PageUp keys, track-click - so **no drag is ever required** (2.5.7) |
| `NumberStepper` | `input[type=number]` | Spinbutton role, min/max/step announcements |
| `Modal`, `Drawer` | `dialog` + `showModal()` | Focus trap, inert background, Escape, focus return, **top-layer rendering** |
| `Checkbox`, `Switch`, `Field` | native inputs | Label association, states, platform behaviour |

Top-layer rendering is the quiet one. A hand-rolled `div` modal sits in the
normal stacking context, so any ancestor with `overflow: hidden`, a `transform`
or a competing `z-index` can clip it - a common and hard-to-spot **2.4.11**
failure. A native dialog cannot be clipped by anything.

### 3. Every visual decision is one token

Components read **only** CSS custom properties - no hardcoded colours, sizes or
radii anywhere. Colour, type scale, spacing rhythm and corner shape are each a
single value, so the whole system re-tunes together and light/dark is a value
change rather than a second implementation.

---

## Quick start

```bash
npm install
npm run dev      # the living style guide at http://localhost:5173
```

Wrap your app once. That is the entire setup:

```jsx
import { ThemeProvider, Button, Field } from "./design-system";

<ThemeProvider mode="system" accent="#2E6F5E" loadFonts>
  <Field label="Email" type="email" required />
  <Button>Save changes</Button>
</ThemeProvider>
```

`ThemeProvider` puts every variable the components read onto the element it
renders. `mode` takes `"light"`, `"dark"` or `"system"` - system follows
`prefers-color-scheme` and keeps following it.

> **`loadFonts` is off by default.** Injecting a Google Fonts `<link>` makes a
> third-party request on the host application's behalf, which is a privacy and
> CSP decision belonging to the app, not to a component it imported. Opt in, or
> self-host and override `--font-display` / `--font-body`.

### Theming without React

`buildTheme()` is the same assembly as a pure function - no React, no DOM - for
`:root`, a global stylesheet, or a server-rendered style attribute:

```js
const { vars, tokens, mode } = buildTheme({ mode: "dark", accent: "#2E6F5E" });
Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
```

`useTheme()` hands the resolved tokens to any descendant that needs a value in
JS rather than CSS - a canvas fill, a chart series, a contrast readout.

### The four knobs

| Prop | Default | Drives |
|---|---|---|
| `accent` | Sweet Rosewood | The whole accent ramp, snapped to accessible shades |
| `radius` | `10px` | Corner shape everywhere - `4px` sharp through `999px` pill |
| `baseSize` / `ratio` | `16` / `1.2` | The generated type scale, `--fs-sm` … `--fs-3xl` |
| `spacingUnit` | `8` | The generated spacing rhythm, `--space-1` … `--space-8` |

Small controls clamp the shape token (`min(var(--radius), 7px)`) so a checkbox
never becomes a circle and collide with a radio at the pill setting. Containers
step it up (`min(calc(var(--radius) + 4px), 18px)`) so a card always reads
slightly rounder than what sits inside it.

---

## Components

**Forms** - `Field` · `Textarea` · `SearchField` · `PasswordField` · `Select` ·
`Checkbox` · `RadioGroup` · `Switch` · `Slider` · `FileUpload` ·
`NumberStepper` · `FormGroup`

**Navigation** - `Navbar` · `NavItem` · `SideNav` · `Menu` · `Tabs` ·
`Breadcrumbs` · `Pagination` · `Accordion` · `Link` · `SkipLink` · `ToggleGroup`

**Overlay** - `Modal` · `Drawer`

**Feedback** - `Alert` · `Badge` · `Spinner`

**Content** - `Card` · `Avatar` · `Heading` · `Text` · `Divider` · `VisuallyHidden`

**Layout** - `Container` · `Stack` · `Cluster` · `Grid`

**Foundation** - `ThemeProvider` · `buildTheme` · `useTheme` · `deriveAccent` ·
`useDismissable`

Each lives in one file exporting the component **and** its CSS block
(`Button` + `BUTTON_CSS`), so a component can be copied into another codebase
without adopting the build.

---

## Accessibility

Built and verified against **WCAG 2.2 AA** / **EN 301 549**, the harmonised
standard behind the European Accessibility Act. 141 conformance rows across 30
components, covering 28 distinct success criteria.

Beyond the usual AA baseline, the system claims several criteria that are
specific to **WCAG 2.2** and commonly missed:

- **2.5.7 Dragging Movements** - `Slider` and `FileUpload` both have a full
  keyboard and single-pointer path; dragging is never the only route in.
- **3.3.8 Accessible Authentication** - `PasswordField` never intercepts paste,
  sets `autoComplete` so managers can fill and save, and offers a reveal toggle.
- **3.3.7 Redundant Entry** - `FormGroup`'s `sameAs` slot offers previously
  entered information back instead of asking for it again.
- **2.5.3 Label in Name**, **3.2.2 On Input**, **2.4.11 Focus Not Obscured**.

### The map is the source of truth

`CONFORMANCE` in `Conformance.jsx` drives the style guide, the published
accessibility statement and the test gate. Each row is `ok`, `partial` (the
component provides the mechanism, you supply the content) or `app` (depends on
your content - alt text, heading order, page language).

**Keep it honest. Over-claiming is worse than a gap you have named.**

### The gate

```bash
npm test      # 165 tests - jest-axe over every state, plus behaviour tests
npm run check # renders the whole guide via SSR, fails on any React warning
```

- **`test/a11y.test.jsx`** - every component, in every state it ships, asserted
  to have zero axe violations. The mechanical half: missing labels, broken ARIA
  references, bad roles.
- **`test/interaction.test.jsx`** - the half axe cannot see. Each block guards a
  specific `CONFORMANCE` row, with the criterion in the test title, so a failure
  points at the claim that has become untrue.
- **`scripts/render-check.mjs`** - 47 assertions on the composed guide. Compiling
  is not running; this catches what neither the tests nor a reading would.

### What is verified by hand

Some behaviour is the browser's, which is precisely why it is correct - and
precisely why jsdom cannot prove it. These live on the manual checklist in
`conformance-setup.md` §3, and are deliberately **not** faked in the suite:

- `Modal`'s focus trap, inert background, and resistance to clipping
- `Slider`'s arrow keys and track-click
- Screen reader passes, 400% zoom, text-spacing

> `test/setup.js` stubs `showModal()` only far enough for React's logic to run.
> A test asserting "Tab stays inside the dialog" would be asserting the stub.

---

## Known limitations

Written down rather than discovered:

- **Popups inside scroll containers are clipped.** `Select`'s listbox and
  `Menu`'s list, opened inside a dialog body or an accordion panel, are clipped
  by that container. Both record 2.4.11 as `partial` for this reason. The fix is
  the Popover API plus viewport-aware placement.
- **No `Tooltip` or `Popover`**, so **1.4.13 Content on Hover or Focus** is not
  claimed.
- **CI runs in jsdom only.** Adding Vitest browser mode with Playwright would
  retire most of the manual checklist.

---

## Adding a component

The full process is in `conformance-setup.md` §4. In short:

1. Build it on the tokens - contrast, target size, focus ring and border come free.
2. Add its rows to `CONFORMANCE` with honest statuses.
3. Add its states to `test/a11y.test.jsx`.
4. Add a block to `test/interaction.test.jsx` for every claim axe cannot verify,
   naming the criterion in the test title.
5. Add an assertion to `scripts/render-check.mjs` pinning the markup it owns.
6. Run `npm test` and `npm run check`.
7. Update the accessibility statement's "last reviewed" date.

**House rules:** no hardcoded colours - read a token; state is never conveyed by
colour alone - pair it with an icon, text, weight or position; every control
clears the 24px target floor; and prefer the platform's implementation to your
own.

---

## Stack

React 19 · Vite 8 · Vitest 4 · Testing Library · jest-axe · lucide-react

`npm run dev` · `npm test` · `npm run check` · `npm run build`

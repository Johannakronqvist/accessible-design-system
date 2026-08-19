/*
  Render smoke test - `npm run check`.

  Compiling is not the same as running. This loads the real style guide through
  Vite's SSR pipeline and renders the whole component tree with react-dom/server,
  so every component actually executes: state initialisers, prop handling, list
  rendering, the lot. Then it asserts that the markup each component is supposed
  to emit is present, and fails on any React warning or error.

  The guide mounts one page at a time behind its sidebar, so a single render only
  ever contains one page's components. This renders every page and checks against
  the concatenation - the assertions below stay a statement about the guide as a
  whole rather than about whichever page happens to load first. A page that stops
  rendering entirely still fails, since its components vanish from the combined
  markup along with it.

  It does not run effects or simulate interaction - renderToString stops short of
  both. Keyboard behaviour (the Select combobox, the password toggle) still needs
  a real browser or a jsdom test suite.
*/

import { createServer } from "vite";
import { renderToString } from "react-dom/server";
import React from "react";

const problems = [];
const origErr = console.error, origWarn = console.warn;
console.error = (...a) => { problems.push("error: " + a.join(" ")); };
console.warn = (...a) => { problems.push("warn: " + a.join(" ")); };

const vite = await createServer({
  server: { middlewareMode: true }, appType: "custom", logLevel: "warn",
});

let html = "";
const perPage = [];
try {
  const mod = await vite.ssrLoadModule("/index.js");
  for (const pg of mod.PAGES) {
    const one = renderToString(
      React.createElement(mod.default, { initialPage: pg.id }),
    );
    perPage.push([pg.label, one.length]);
    html += one;
  }
} catch (e) {
  console.error = origErr; console.warn = origWarn;
  console.error("\nRENDER THREW:\n", e);
  await vite.close();
  process.exit(1);
}
await vite.close();
console.error = origErr; console.warn = origWarn;

// Each entry pins a piece of markup a component is responsible for emitting.
const checks = [
  ["Button variants",        /class="ds-btn primary/],
  ["Field error region",     /role="alert"/],
  ["Textarea",               /<textarea/],
  ["Textarea counter",       /ds-ta-count/],
  ["Search landmark",        /role="search"/],
  ["Search input",           /type="search"/],
  ["Password input",         /type="password"/],
  ["Password reveal toggle", /aria-label="Show password"/],
  // Case-insensitive: React 19 keeps the camelCase in the SSR string
  // (`autoComplete=`). HTML attribute names are case-insensitive, so the browser
  // parses it as `autocomplete` and password managers still see it.
  ["Password autocomplete",  /autocomplete="new-password"/i],
  ["Slider",                 /type="range"/],
  ["Slider aria-valuetext",  /aria-valuetext="Cozy"/],
  ["File input",             /type="file"/],
  ["File label in name",     /aria-labelledby="[^"]*-label [^"]*-btn"/],
  ["Number spinbutton",      /type="number"/],
  ["Stepper bound state",    /aria-disabled="true"/],
  ["FormGroup fieldset",     /<legend/],
  ["FormGroup sameAs",       /ds-fg-summary/],
  ["Select combobox",        /role="combobox"/],
  ["Link underlined",        /class="ds-link"/],
  ["Link external rel",      /rel="noopener noreferrer"/],
  ["Skip link",              /class="ds-skip"/],
  ["Main landmark target",   /<main id="ds-main"/],
  ["Breadcrumb landmark",    /aria-label="Breadcrumb"/],
  ["Breadcrumb current",     /aria-current="page"/],
  ["Pagination named pages", /aria-label="Page 2"/],
  ["Tabs tablist",           /role="tablist"/],
  ["Tabs panel wiring",      /role="tabpanel"/],
  ["Tabs roving tabindex",   /role="tab"[^>]*tabindex="-1"|tabindex="-1"[^>]*role="tab"/],
  ["Accordion heading",      /<h3 class="ds-acc-heading"/],
  ["Accordion expanded",     /aria-expanded="true"/],
  ["Navbar banner",          /<header class="ds-navbar"/],
  ["Navbar labelled nav",    /<nav[^>]*aria-label="Main"/],
  ["NavItem current",        /class="ds-navitem current"/],
  ["Menu trigger",           /aria-haspopup="menu"/],
  ["SideNav grouped lists",  /class="ds-sidenav-list" aria-labelledby=/],
  ["ToggleGroup radiogroup", /role="radiogroup"/],
  ["ToggleGroup checked",    /role="radio"[^>]*aria-checked="true"/],
  ["No hand-rolled ds-seg",  /^(?!.*class="ds-seg")/s],
  ["Modal native dialog",    /<dialog[^>]*class="ds-dialog modal/],
  ["Modal labelled by title",/<dialog[^>]*aria-labelledby=/],
  // PINNED FOR MVP - the Drawer demo is commented out of StyleGuide.jsx, so this
  // assertion has nothing to match. The component is still covered by the test
  // suite ("drawer on both edges" / "is the same dialog, anchored to an edge");
  // restore this line when the demo comes back.
  // ["Drawer edge-anchored",   /class="ds-dialog drawer [a-z]+ (left|right)"/],
  ["Checkbox",               /ds-check-box/],
  ["Switch",                 /role="switch"/],
  ["Badge tones",            /ds-badge2/],
  ["Alert tones",            /ds-alert/],
  ["Conformance 3.3.8",      /Accessible Authentication/],
  ["Conformance 2.5.7",      /Dragging Movements/],
  ["Conformance 3.3.7",      /Redundant Entry/],
];

console.log(
  "\nrendered " + perPage.length + " pages, " +
  html.length.toLocaleString() + " chars of HTML total",
);
for (const [label, len] of perPage) {
  console.log("  " + label.padEnd(16) + len.toLocaleString().padStart(9));
}
console.log();
let bad = 0;
for (const [name, re] of checks) {
  const ok = re.test(html);
  if (!ok) bad++;
  console.log((ok ? "  ok       " : "  MISSING  ") + name);
}

if (problems.length) {
  console.log("\n" + problems.length + " React console message(s):");
  problems.forEach((p) => console.log("  " + p.slice(0, 400)));
} else {
  console.log("\nno React warnings or errors");
}
process.exit(bad || problems.length ? 1 : 0);

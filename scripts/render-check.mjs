/*
  Render smoke test — `npm run check`.

  Compiling is not the same as running. This loads the real style guide through
  Vite's SSR pipeline and renders the whole component tree with react-dom/server,
  so every component actually executes: state initialisers, prop handling, list
  rendering, the lot. Then it asserts that the markup each component is supposed
  to emit is present, and fails on any React warning or error.

  It does not run effects or simulate interaction — renderToString stops short of
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
try {
  const mod = await vite.ssrLoadModule("/index.js");
  html = renderToString(React.createElement(mod.default));
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
  ["Checkbox",               /ds-check-box/],
  ["Switch",                 /role="switch"/],
  ["Badge tones",            /ds-badge2/],
  ["Alert tones",            /ds-alert/],
  ["Conformance 3.3.8",      /Accessible Authentication/],
  ["Conformance 2.5.7",      /Dragging Movements/],
  ["Conformance 3.3.7",      /Redundant Entry/],
];

console.log("\nrendered " + html.length.toLocaleString() + " chars of HTML\n");
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

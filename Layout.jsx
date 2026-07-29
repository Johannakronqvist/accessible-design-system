/*
  Layout primitives — fluid, reflow-safe, responsive by default with no
  breakpoints required. Grid collapses to a single column instead of
  overflowing, so content reflows cleanly to 320px and at 400% zoom (1.4.10).
  RESPONSIVE_CSS also grows controls to touch targets on coarse pointers.
*/

// Re-exported for convenience so consumers can reference the shared query points.
export { BREAKPOINTS } from "./tokens";

export function Container({ children, size = 960 }) {
  return <div style={{ maxWidth: size, marginInline: "auto", paddingInline: "clamp(16px, 5vw, 32px)" }}>{children}</div>;
}

export function Stack({ children, gap = "var(--space-4)" }) {
  return <div style={{ display: "flex", flexDirection: "column", gap }}>{children}</div>;
}

export function Cluster({ children, gap = "var(--space-3)" }) {
  return <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap }}>{children}</div>;
}

export function Grid({ children, min = 240, gap = "var(--space-4)" }) {
  return <div style={{ display: "grid", gap, gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))` }}>{children}</div>;
}

export const RESPONSIVE_CSS = `
/* Controls grow to comfortable touch targets on touch/coarse pointers (2.5.5). */
@media (pointer: coarse){
  .ds-btn{min-height:44px}
  .ds-btn.sm{min-height:40px}
  .ds-input{min-height:48px}
}
/* Guide chrome adapts on small screens; content reflows to 320px without 2D scroll (1.4.10). */
@media (max-width:520px){
  .ds-wrap{padding:28px 18px 56px}
  .ds-title{font-size:28px}
  .ds-ctrl > label{min-width:100%}
}
`;

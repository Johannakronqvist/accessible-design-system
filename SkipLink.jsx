/*
  SkipLink - the cheapest win in the whole system (2.4.1 Bypass Blocks). It is
  the first thing in the tab order and invisible until it takes focus, at which
  point it slides into the top-left corner as a solid, high-contrast target.

  It is hidden with transform rather than display:none or visibility:hidden,
  because both of those would remove it from the tab order and defeat the point.

  Render it as the very first child of <body> (or of your app root), and give
  the target its id:
    <SkipLink href="#main" />
    …
    <main id="main" tabIndex={-1}>…</main>

  tabIndex={-1} on the target matters: without it, some browsers move the
  viewport but leave focus behind, so the next Tab returns to the top of the page.
*/

export function SkipLink({ href = "#main", children = "Skip to main content" }) {
  return <a className="ds-skip" href={href}>{children}</a>;
}

export const SKIPLINK_CSS = `
.ds-skip{position:fixed;top:8px;left:8px;z-index:100;transform:translateY(calc(-100% - 16px));
  display:inline-flex;align-items:center;min-height:var(--target-touch);
  padding:10px 18px;border-radius:var(--radius);
  background:var(--accent-fill);color:var(--accent-on-fill);
  font-family:var(--font-body);font-size:var(--fs-sm);font-weight:500;
  text-decoration:none;transition:transform .12s}
.ds-skip:focus{transform:translateY(0);outline:none;
  box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--ring)}
@media (prefers-reduced-motion:reduce){.ds-skip{transition:none}}
`;

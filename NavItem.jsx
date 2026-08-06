/*
  NavItem — the primitive Navbar and SideNav share, so "which page am I on"
  is answered the same way in both.

  current does two separate jobs. It sets aria-current="page", which is what a
  screen reader announces, and it applies an accent colour paired with a step
  up in weight — so sighted users who cannot distinguish the accent still see
  which item is active (1.4.1). Colour alone would fail that, and it is the
  usual way nav bars do fail it.

  Navbar and SideNav each add an indicator bar on top of this, since which edge
  it belongs on depends on the orientation the parent knows about.

  It renders an anchor, not a button: navigation goes somewhere, so it should
  be a link that middle-clicks, opens in a new tab and shows a target on hover.
*/

export function NavItem({ href, current = false, icon: Icon, children, ...rest }) {
  return (
    <a
      href={href}
      className={`ds-navitem${current ? " current" : ""}`}
      aria-current={current ? "page" : undefined}
      {...rest}
    >
      {Icon && <Icon size={16} className="ds-navitem-ic" aria-hidden="true" />}
      <span>{children}</span>
    </a>
  );
}

export const NAVITEM_CSS = `
.ds-navitem{position:relative;display:inline-flex;align-items:center;gap:8px;
  padding:8px 12px;min-height:var(--target-min);box-sizing:border-box;
  font-family:var(--font-body);font-size:var(--fs-sm);font-weight:400;
  color:var(--text-2);text-decoration:none;border-radius:min(var(--radius),8px);
  transition:background .12s,color .12s}
.ds-navitem:hover{background:var(--accent-tint);color:var(--accent-on-tint)}
.ds-navitem:focus-visible{outline:none;box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--ring)}
/* Current: accent + weight + a bar, so it never rests on colour alone. */
.ds-navitem.current{color:var(--accent-text);font-weight:600}
.ds-navitem-ic{flex-shrink:0}
@media (prefers-reduced-motion:reduce){.ds-navitem{transition:none}}
`;

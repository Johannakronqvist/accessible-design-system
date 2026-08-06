/*
  Navbar — a <header> banner containing a brand slot, a labelled <nav> and an
  actions slot. The nav is labelled because a page usually has more than one:
  without aria-label, a screen reader's landmark list reads "navigation,
  navigation, navigation" and the user has to enter each one to find out which
  is which.

  There is exactly one nav element and one list of links. The obvious way to
  build a responsive navbar — an inline list plus a separate collapsed panel —
  duplicates every link in the accessibility tree and produces two landmarks
  with the same name, which is a real 1.3.1 failure even though it looks fine.
  Instead the single nav is repositioned with flex order: it sits in the bar
  above the md breakpoint, and becomes a full-width row below it, hidden until
  the toggle opens it.

  That collapsed row is a *non-modal* disclosure, not a dialog: focus is not
  trapped and the page behind stays reachable, which is correct for a panel
  that pushes content down rather than covering it. Escape closes it and
  returns focus to the toggle, and a press outside closes it — all from
  useDismissable, the same behaviour Menu and Select use.

  A full-screen drawer that covers the page *would* need a focus trap and an
  inert background. That is Modal's job, and this deliberately does not
  pretend to do it.

  onNavigate(href, event) fires when a link is chosen. Without it the items are
  plain anchors and the browser navigates, which is the right default; with it
  a router can preventDefault and push instead. It also closes the collapsed
  row, since leaving it open would cover the page just asked for.
*/

import { useState, useRef } from "react";
import { Menu as MenuIcon, X } from "lucide-react";
import { nextId } from "./id";
import { useDismissable } from "./useDismissable";
import { NavItem } from "./NavItem";

export function Navbar({
  brand, items = [], currentHref, actions, onNavigate,
  label = "Main", menuLabel = "Menu", closeMenuLabel = "Close menu",
}) {
  const [id] = useState(() => nextId("ds-navbar"));
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const navRef = useRef(null);

  useDismissable({ open, onDismiss: () => setOpen(false), triggerRef: toggleRef, contentRef: navRef });

  return (
    <header className="ds-navbar">
      <div className="ds-navbar-bar">
        {brand && <div className="ds-navbar-brand">{brand}</div>}

        {actions && <div className="ds-navbar-actions">{actions}</div>}

        <button
          ref={toggleRef} type="button" className="ds-navbar-toggle"
          aria-expanded={open} aria-controls={`${id}-nav`}
          aria-label={open ? closeMenuLabel : menuLabel}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} aria-hidden="true" /> : <MenuIcon size={20} aria-hidden="true" />}
        </button>

        <nav
          ref={navRef} id={`${id}-nav`} aria-label={label}
          className={`ds-navbar-nav${open ? " open" : ""}`}
        >
          <ul className="ds-navbar-list">
            {items.map((item) => (
              <li key={item.href}>
                <NavItem
                  href={item.href} icon={item.icon} current={item.href === currentHref}
                  onClick={onNavigate && ((e) => {
                    // Selecting a destination closes the collapsed row; leaving it
                    // open would cover the page someone just asked to see.
                    setOpen(false);
                    onNavigate(item.href, e);
                  })}
                >
                  {item.label}
                </NavItem>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export const NAVBAR_CSS = `
.ds-navbar{background:var(--surface);border-bottom:.5px solid var(--border)}
.ds-navbar-bar{display:flex;align-items:center;flex-wrap:wrap;gap:var(--space-2);
  padding:10px clamp(12px,3vw,20px);min-height:56px}
.ds-navbar-brand{order:1;font-family:var(--font-display);font-weight:500;font-size:var(--fs-lg);
  color:var(--text-1);white-space:nowrap;display:flex;align-items:center;gap:8px}
.ds-navbar-nav{order:2;flex:1;min-width:0}
.ds-navbar-actions{order:3;display:flex;align-items:center;gap:8px;margin-left:auto;flex-shrink:0}
.ds-navbar-toggle{order:4;display:none;align-items:center;justify-content:center;
  width:var(--target-touch);height:var(--target-touch);flex-shrink:0;padding:0;
  background:transparent;border:none;border-radius:min(var(--radius),10px);
  color:var(--text-1);cursor:pointer}
.ds-navbar-toggle:hover{background:var(--accent-tint);color:var(--accent-on-tint)}
.ds-navbar-toggle:focus-visible{outline:none;box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--ring)}
.ds-navbar-list{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;
  align-items:center;gap:2px}
/* Underline indicator: a third cue on top of the accent colour and weight step. */
.ds-navbar-list .ds-navitem.current::after{content:"";position:absolute;
  left:10px;right:10px;bottom:-2px;height:2px;border-radius:2px;background:var(--accent-fill)}

/* Below BREAKPOINTS.md (./tokens) the same nav becomes a full-width row under
   the bar. Media queries cannot read CSS custom properties, so the value is
   duplicated here rather than tokenised. */
@media (max-width:767px){
  .ds-navbar-actions{order:2;margin-left:auto}
  .ds-navbar-toggle{order:3;display:inline-flex}
  .ds-navbar-nav{order:4;flex:0 0 100%;display:none}
  .ds-navbar-nav.open{display:block}
  .ds-navbar-list{flex-direction:column;align-items:stretch;gap:1px;padding-top:4px}
  .ds-navbar-list .ds-navitem{width:100%;min-height:var(--target-touch)}
  .ds-navbar-list .ds-navitem.current{background:var(--accent-tint)}
  .ds-navbar-list .ds-navitem.current::after{left:0;right:auto;top:7px;bottom:7px;
    width:2px;height:auto;border-radius:0 2px 2px 0}
}
`;

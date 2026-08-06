/*
  SideNav — vertical navigation, optionally grouped.

  One landmark, not one per group. A nav landmark for every section would clog
  the landmark list, so this renders a single labelled <nav> containing one
  list per group, each list pointed at its own heading with aria-labelledby.
  That gives the grouping real structure (1.3.1) without inventing landmarks.

  Group headings are plain divs rather than h-tags on purpose: a sidebar's
  "Workspace" / "Account" labels are usually not part of the document outline,
  and injecting them at a guessed level tends to break heading order on the
  page they sit beside. Pass headingLevel to opt into real headings when the
  sidebar genuinely is the page structure.
*/

import { useState } from "react";
import { nextId } from "./id";
import { NavItem } from "./NavItem";

export function SideNav({ groups = [], currentHref, onNavigate, label = "Sections", headingLevel }) {
  const [id] = useState(() => nextId("ds-sidenav"));
  const Heading = headingLevel ? `h${headingLevel}` : "div";

  return (
    <nav aria-label={label} className="ds-sidenav">
      {groups.map((group, gi) => {
        const headingId = `${id}-group-${gi}`;
        return (
          <div key={group.label || gi} className="ds-sidenav-group">
            {group.label && (
              <Heading id={headingId} className="ds-sidenav-grouplabel">{group.label}</Heading>
            )}
            <ul
              className="ds-sidenav-list"
              aria-labelledby={group.label ? headingId : undefined}
            >
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavItem
                    href={item.href} icon={item.icon} current={item.href === currentHref}
                    onClick={onNavigate && ((e) => onNavigate(item.href, e))}
                  >
                    {item.label}
                  </NavItem>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export const SIDENAV_CSS = `
.ds-sidenav{display:flex;flex-direction:column;gap:var(--space-3);min-width:0}
.ds-sidenav-group{display:flex;flex-direction:column;gap:4px}
.ds-sidenav-grouplabel{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  text-transform:uppercase;letter-spacing:.09em;font-size:10.5px;font-weight:400;
  color:var(--text-2);margin:0 0 4px;padding:0 12px}
.ds-sidenav-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:1px}
.ds-sidenav-list .ds-navitem{width:100%;min-height:var(--target-touch)}
/* Leading-edge indicator, the vertical counterpart of the navbar's underline. */
.ds-sidenav-list .ds-navitem.current{background:var(--accent-tint)}
.ds-sidenav-list .ds-navitem.current::after{content:"";position:absolute;
  left:0;top:7px;bottom:7px;width:2px;border-radius:0 2px 2px 0;background:var(--accent-fill)}
`;

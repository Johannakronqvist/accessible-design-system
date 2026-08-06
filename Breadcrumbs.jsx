/*
  Breadcrumbs - an ordered list inside a labelled nav landmark, because the
  order is the information (2.4.8 Location). The current page is the last item
  and is not a link: it carries aria-current="page" and is rendered as plain
  text, so nobody tabs to a link that goes where they already are.

  Separators are decorative and hidden from assistive tech - a screen reader
  announcing "slash" between every crumb is noise, since the list structure
  already conveys the sequence.

  On narrow screens the trail wraps rather than scrolling sideways (1.4.10).
*/

import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items = [], label = "Breadcrumb" }) {
  return (
    <nav aria-label={label}>
      <ol className="ds-crumbs">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.href || item.label} className="ds-crumb">
              {last ? (
                <span className="ds-crumb-current" aria-current="page">{item.label}</span>
              ) : (
                <>
                  <a className="ds-crumb-link" href={item.href}>{item.label}</a>
                  <ChevronRight className="ds-crumb-sep" size={14} aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export const BREADCRUMBS_CSS = `
.ds-crumbs{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;align-items:center;
  gap:2px;font-family:var(--font-body);font-size:var(--fs-sm)}
.ds-crumb{display:inline-flex;align-items:center;gap:2px;min-height:var(--target-min)}
.ds-crumb-link{color:var(--text-2);text-decoration:none;padding:2px 6px;
  border-radius:min(var(--radius),6px);display:inline-flex;align-items:center}
.ds-crumb-link:hover{color:var(--accent-text);text-decoration:underline;text-underline-offset:2px}
.ds-crumb-link:focus-visible{outline:none;box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--ring)}
.ds-crumb-sep{color:var(--text-2);opacity:.6;flex-shrink:0}
.ds-crumb-current{color:var(--text-1);font-weight:500;padding:2px 6px}
`;

/*
  Pagination - a labelled nav landmark around a list of page buttons, styled to
  sit quietly under a table rather than compete with it: 32px targets, no
  borders, numbers in the secondary text colour. The current page carries
  aria-current="page" and is marked visually by a soft tint plus a step up in
  weight - the weight being the non-colour cue that keeps this clear of 1.4.1
  now that there is no solid fill.

  32px clears the 24px minimum target (2.5.8) with room to spare; the bump to
  44px on coarse pointers lives with the other touch rules in RESPONSIVE_CSS
  (./Layout), alongside Button and the inputs.

  Every control has a real name: the numbered buttons are labelled "Page 3",
  not "3", so a screen reader user hearing a list of bare digits knows what
  they are. Previous / Next disable at the ends via aria-disabled rather than
  the disabled attribute - the same reasoning as NumberStepper, so paging to
  the last page never drops your focus onto the body (2.4.3).

  Uncontrolled by default like the rest of the system: pass defaultPage and
  listen with onChange, or drive it from the URL by keying the component.
*/

import { useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

// Builds the visible page list, collapsing runs with an ellipsis marker.
export function pageList(page, count, siblingCount = 1) {
  if (count <= siblingCount * 2 + 5) {
    return Array.from({ length: count }, (_, i) => i + 1);
  }
  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, count);
  const out = [1];
  if (left > 2) out.push("start-gap");
  for (let i = Math.max(left, 2); i <= Math.min(right, count - 1); i++) out.push(i);
  if (right < count - 1) out.push("end-gap");
  out.push(count);
  return out;
}

export function Pagination({
  count, defaultPage = 1, siblingCount = 1, onChange,
  label = "Pagination", previousLabel = "Previous page", nextLabel = "Next page",
}) {
  const [page, setPage] = useState(defaultPage);
  const go = (p) => {
    if (p < 1 || p > count || p === page) return;
    setPage(p);
    onChange?.(p);
  };
  const atStart = page <= 1;
  const atEnd = page >= count;

  return (
    <nav aria-label={label}>
      <ul className="ds-pager">
        <li>
          <button type="button" className="ds-pager-btn edge" onClick={() => go(page - 1)}
            aria-disabled={atStart || undefined} aria-label={previousLabel}>
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
        </li>
        {pageList(page, count, siblingCount).map((p) =>
          typeof p === "string" ? (
            <li key={p} className="ds-pager-gap" aria-hidden="true">
              <MoreHorizontal size={15} />
            </li>
          ) : (
            <li key={p}>
              <button type="button" className={`ds-pager-btn${p === page ? " current" : ""}`}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`} onClick={() => go(p)}>
                {p}
              </button>
            </li>
          )
        )}
        <li>
          <button type="button" className="ds-pager-btn edge" onClick={() => go(page + 1)}
            aria-disabled={atEnd || undefined} aria-label={nextLabel}>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}

export const PAGINATION_CSS = `
.ds-pager{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;align-items:center;gap:2px}
/* 32px square: comfortably above the 24px minimum target (2.5.8), quiet enough
   to sit under a table, and small enough that the shape token is legible -
   --radius reads as a soft square at Sharp and a full circle at Pill. */
.ds-pager-btn{font-family:var(--font-body);font-size:var(--fs-sm);font-weight:400;
  min-width:32px;min-height:32px;padding:0 8px;
  display:inline-flex;align-items:center;justify-content:center;
  background:transparent;color:var(--text-2);border:none;
  border-radius:var(--radius);cursor:pointer;transition:background .12s,color .12s;
  font-variant-numeric:tabular-nums}
.ds-pager-btn:hover:not([aria-disabled="true"]):not(.current){background:var(--accent-tint);color:var(--accent-on-tint)}
.ds-pager-btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--ring)}
/* Current page: a quiet tint plus a weight step. The weight is the non-colour
   cue that keeps this off 1.4.1 now that the solid fill is gone. */
.ds-pager-btn.current{background:var(--accent-tint);color:var(--accent-on-tint);
  font-weight:600;cursor:default}
.ds-pager-btn[aria-disabled="true"]{color:var(--disabled-text);cursor:not-allowed}
.ds-pager-gap{display:inline-flex;align-items:center;justify-content:center;
  min-width:var(--target-min);color:var(--text-2);opacity:.7}
@media (prefers-reduced-motion:reduce){.ds-pager-btn{transition:none}}
`;

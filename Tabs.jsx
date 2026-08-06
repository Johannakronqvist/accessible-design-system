/*
  Tabs - the WAI-ARIA tabs pattern. Arrows move between tabs, Home / End jump
  to the ends, and a roving tabindex keeps the whole tablist to a single stop
  in the tab order, so Tab moves from the tabs into the panel rather than
  through every tab in turn.

  activation is the interesting prop. "automatic" selects as you arrow, which
  is fast for cheap panels. "manual" moves focus only and waits for Enter or
  Space - the right choice when selecting a tab loads data or changes context,
  because arrowing past four tabs should not fire four loads (3.2.2 On Input).

  The selected tab is marked by aria-selected, a filled indicator bar and a
  weight change, never by colour alone (1.4.1). The panel takes tabindex={0}
  so it can be reached and scrolled by keyboard even when it holds no
  focusable content.
*/

import { useState, useRef } from "react";
import { nextId } from "./id";

export function Tabs({
  label, items = [], defaultValue, activation = "automatic",
  orientation = "horizontal", onChange,
}) {
  const [id] = useState(() => nextId("ds-tabs"));
  const [value, setValue] = useState(defaultValue ?? items[0]?.value);
  const refs = useRef([]);

  const select = (v) => { setValue(v); onChange?.(v); };
  const move = (to) => {
    const i = (to + items.length) % items.length;
    refs.current[i]?.focus();
    if (activation === "automatic") select(items[i].value);
  };

  const onKeyDown = (e, i) => {
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
    const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    switch (e.key) {
      case nextKey: e.preventDefault(); move(i + 1); break;
      case prevKey: e.preventDefault(); move(i - 1); break;
      case "Home": e.preventDefault(); move(0); break;
      case "End": e.preventDefault(); move(items.length - 1); break;
      case "Enter": case " ":
        if (activation === "manual") { e.preventDefault(); select(items[i].value); }
        break;
      default:
    }
  };

  const active = items.find((t) => t.value === value) || items[0];

  return (
    <div className={`ds-tabs ${orientation}`}>
      <div className="ds-tablist" role="tablist" aria-label={label} aria-orientation={orientation}>
        {items.map((t, i) => {
          const selected = t.value === value;
          return (
            <button
              key={t.value} type="button" role="tab" id={`${id}-tab-${i}`}
              ref={(el) => (refs.current[i] = el)}
              className={`ds-tab${selected ? " selected" : ""}`}
              aria-selected={selected} aria-controls={`${id}-panel-${i}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(t.value)} onKeyDown={(e) => onKeyDown(e, i)}
            >
              {t.icon && <t.icon size={15} aria-hidden="true" />}
              {t.label}
            </button>
          );
        })}
      </div>
      {active && (
        <div
          role="tabpanel" tabIndex={0}
          id={`${id}-panel-${items.indexOf(active)}`}
          aria-labelledby={`${id}-tab-${items.indexOf(active)}`}
          className="ds-tabpanel"
        >
          {active.content}
        </div>
      )}
    </div>
  );
}

export const TABS_CSS = `
.ds-tabs{display:flex;flex-direction:column;min-width:0}
.ds-tabs.vertical{flex-direction:row;gap:var(--space-2)}
.ds-tablist{display:flex;flex-wrap:wrap;gap:2px;border-bottom:.5px solid var(--border)}
.ds-tabs.vertical .ds-tablist{flex-direction:column;flex-wrap:nowrap;border-bottom:none;
  border-inline-end:.5px solid var(--border);flex-shrink:0}
.ds-tab{position:relative;font-family:var(--font-body);font-size:var(--fs-sm);font-weight:500;
  display:inline-flex;align-items:center;gap:7px;padding:10px 14px;min-height:var(--target-touch);
  background:transparent;border:none;color:var(--text-2);cursor:pointer;
  border-radius:min(var(--radius),8px) min(var(--radius),8px) 0 0;
  transition:background .12s,color .12s}
.ds-tabs.vertical .ds-tab{border-radius:min(var(--radius),8px) 0 0 min(var(--radius),8px);
  justify-content:flex-start;text-align:left}
.ds-tab:hover:not(.selected){background:var(--accent-tint);color:var(--accent-on-tint)}
.ds-tab:focus-visible{outline:none;box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--ring)}
.ds-tab.selected{color:var(--accent-text);font-weight:600}
/* Indicator bar: a second, non-colour cue for the selected tab. */
.ds-tab.selected::after{content:"";position:absolute;left:8px;right:8px;bottom:-.5px;height:2px;
  border-radius:2px 2px 0 0;background:var(--accent-fill)}
.ds-tabs.vertical .ds-tab.selected::after{left:auto;right:-.5px;top:8px;bottom:8px;
  width:2px;height:auto;border-radius:2px 0 0 2px}
.ds-tabpanel{padding:var(--space-2) 2px 0;outline:none;min-width:0;flex:1}
.ds-tabpanel:focus-visible{box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--ring);
  border-radius:min(var(--radius),8px)}
@media (prefers-reduced-motion:reduce){.ds-tab{transition:none}}
`;

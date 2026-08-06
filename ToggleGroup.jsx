/*
  ToggleGroup - a segmented control for switching between mutually exclusive
  options: a view, a density, a time range.

  It uses radiogroup semantics rather than a row of aria-pressed buttons,
  because that is what the control actually is - one choice out of several,
  not several independent toggles. The practical difference for a keyboard
  user is large: a radiogroup is a single stop in the tab order with the
  arrows moving between options, so a five-option switcher costs one Tab
  instead of five.

  The selected segment pairs its fill with a weight step, so the choice is not
  carried by colour alone (1.4.1), and each segment holds the 24px minimum
  target with the shape token clamped so the group reads as one control rather
  than a row of separate pills.

  This replaces the .ds-seg markup the style guide used to hand-roll for its
  own mode / ratio / spacing / shape switchers.
*/

import { useState, useRef } from "react";
import { nextId } from "./id";

export function ToggleGroup({
  label, options = [], defaultValue, onChange, size = "md", hideLabel = true,
}) {
  const [id] = useState(() => nextId("ds-toggle"));
  const [value, setValue] = useState(defaultValue ?? options[0]?.value);
  const refs = useRef([]);

  const select = (v) => { setValue(v); onChange?.(v); };
  const move = (to) => {
    const i = (to + options.length) % options.length;
    refs.current[i]?.focus();
    select(options[i].value);
  };

  const onKeyDown = (e, i) => {
    switch (e.key) {
      case "ArrowRight": case "ArrowDown": e.preventDefault(); move(i + 1); break;
      case "ArrowLeft": case "ArrowUp": e.preventDefault(); move(i - 1); break;
      case "Home": e.preventDefault(); move(0); break;
      case "End": e.preventDefault(); move(options.length - 1); break;
      default:
    }
  };

  return (
    <div
      role="radiogroup" aria-label={hideLabel ? label : undefined}
      aria-labelledby={hideLabel ? undefined : `${id}-label`}
      className={`ds-toggle ${size}`}
    >
      {!hideLabel && <span id={`${id}-label`} className="ds-sr">{label}</span>}
      {options.map((o, i) => {
        const checked = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value} type="button" role="radio" aria-checked={checked}
            ref={(el) => (refs.current[i] = el)}
            tabIndex={checked ? 0 : -1}
            className={`ds-toggle-seg${checked ? " checked" : ""}`}
            aria-label={o.ariaLabel}
            onClick={() => select(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {Icon && <Icon size={15} aria-hidden="true" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export const TOGGLEGROUP_CSS = `
.ds-toggle{display:inline-flex;align-items:stretch;background:var(--surface);
  border:.5px solid var(--border);border-radius:min(calc(var(--radius) + 2px),12px);
  padding:2px;gap:2px}
.ds-toggle-seg{display:inline-flex;align-items:center;justify-content:center;gap:6px;
  font-family:var(--font-body);font-size:var(--fs-sm);font-weight:400;
  min-height:var(--target-min);padding:5px 12px;background:transparent;border:none;
  color:var(--text-2);cursor:pointer;border-radius:min(var(--radius),9px);
  transition:background .12s,color .12s;white-space:nowrap}
.ds-toggle.sm .ds-toggle-seg{padding:3px 9px;font-size:12px}
.ds-toggle.lg .ds-toggle-seg{padding:8px 16px;min-height:var(--target-touch)}
.ds-toggle-seg:hover:not(.checked){background:var(--accent-tint);color:var(--accent-on-tint)}
.ds-toggle-seg:focus-visible{outline:none;box-shadow:0 0 0 2px var(--surface),0 0 0 4px var(--ring)}
/* Selected: fill plus a weight step, so the choice is not colour alone. */
.ds-toggle-seg.checked{background:var(--accent-fill);color:var(--accent-on-fill);font-weight:600}
@media (prefers-reduced-motion:reduce){.ds-toggle-seg{transition:none}}
`;

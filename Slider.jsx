/*
  Slider — a native input[type=range], which is the whole accessibility
  argument: it is operable with the arrow keys, Home / End and Page Up / Down,
  and a click anywhere on the track moves it, so nothing here requires a drag
  (2.5.7) or a path-based gesture (2.5.1). The thumb is a 24px target (2.5.8)
  and the filled portion meets 3:1 against the empty track (1.4.11).

  formatValue turns the raw number into something a person can hear — "€40",
  "Medium", "2.5×" — and feeds aria-valuetext, so the announcement matches the
  visible label rather than a bare integer. Marks are decorative and hidden
  from assistive tech because the value is already announced.

  Reuses .ds-field / .ds-field-label / .ds-field-hint from FIELD_CSS.
*/

import { useState } from "react";
import { nextId } from "./id";

export function Slider({
  label, min = 0, max = 100, step = 1, defaultValue, disabled = false, hint,
  formatValue, marks, showValue = true, onChange,
}) {
  const [id] = useState(() => nextId("ds-slider"));
  const [value, setValue] = useState(defaultValue ?? min);
  const hintId = hint ? `${id}-hint` : undefined;

  const display = formatValue ? formatValue(value) : String(value);
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div className="ds-field">
      <div className="ds-slider-head">
        <label htmlFor={id} className="ds-field-label">{label}</label>
        {/* Hidden from AT: the range already announces its value (via aria-valuetext),
            and <output> carries an implicit live region that would double it up. */}
        {showValue && <output htmlFor={id} className="ds-slider-out" aria-hidden="true">{display}</output>}
      </div>
      {hint && <div id={hintId} className="ds-field-hint">{hint}</div>}
      <input
        id={id} type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        onChange={(e) => { const v = Number(e.target.value); setValue(v); onChange?.(v); }}
        aria-describedby={hintId}
        // Only override the spoken value when the display differs from the number.
        aria-valuetext={display === String(value) ? undefined : display}
        className="ds-slider-input" style={{ "--pct": `${pct}%` }}
      />
      {marks?.length > 0 && (
        <div className="ds-slider-marks" aria-hidden="true">
          {marks.map((m) => {
            const v = typeof m === "object" ? m.value : m;
            const t = typeof m === "object" ? m.label : (formatValue ? formatValue(m) : m);
            return (
              <span key={v} className="ds-slider-mark"
                style={{ left: `${max === min ? 0 : ((v - min) / (max - min)) * 100}%` }}>
                <span className="ds-slider-tick" />
                <span className="ds-slider-marklabel">{t}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const SLIDER_CSS = `
.ds-slider-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.ds-slider-out{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:var(--fs-sm);
  color:var(--accent-on-tint);background:var(--accent-tint);padding:2px 9px;
  border-radius:min(var(--radius),8px);white-space:nowrap}
.ds-slider-input{-webkit-appearance:none;appearance:none;width:100%;height:var(--target-min);
  margin:0;padding:0;background:transparent;cursor:pointer;outline:none}
.ds-slider-input:disabled{cursor:not-allowed}
.ds-slider-input::-webkit-slider-runnable-track{height:6px;border-radius:999px;
  border:.5px solid var(--border);box-sizing:border-box;
  background:linear-gradient(to right,var(--accent-fill) 0 var(--pct),var(--disabled-bg) var(--pct) 100%)}
.ds-slider-input::-moz-range-track{height:6px;border-radius:999px;
  border:.5px solid var(--border);box-sizing:border-box;
  background:linear-gradient(to right,var(--accent-fill) 0 var(--pct),var(--disabled-bg) var(--pct) 100%)}
.ds-slider-input::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:24px;height:24px;
  border-radius:50%;background:var(--accent-fill);border:3px solid var(--surface);box-sizing:border-box;
  margin-top:-9px;transition:transform .08s}
.ds-slider-input::-moz-range-thumb{width:24px;height:24px;border-radius:50%;background:var(--accent-fill);
  border:3px solid var(--surface);box-sizing:border-box;transition:transform .08s}
.ds-slider-input:active::-webkit-slider-thumb{transform:scale(1.08)}
.ds-slider-input:active::-moz-range-thumb{transform:scale(1.08)}
.ds-slider-input:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--ring)}
.ds-slider-input:focus-visible::-moz-range-thumb{box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--ring)}
.ds-slider-input:disabled::-webkit-slider-thumb{background:var(--disabled-text)}
.ds-slider-input:disabled::-moz-range-thumb{background:var(--disabled-text)}
/* Inset by half a thumb so ticks line up with where the thumb centre can reach. */
.ds-slider-marks{position:relative;height:26px;margin:-2px 12px 0}
.ds-slider-mark{position:absolute;transform:translateX(-50%);display:flex;flex-direction:column;
  align-items:center;gap:3px}
.ds-slider-tick{width:1.5px;height:5px;border-radius:1px;background:var(--border-interactive)}
.ds-slider-marklabel{font-size:var(--fs-sm);color:var(--text-2);white-space:nowrap}
@media (prefers-reduced-motion:reduce){
  .ds-slider-input::-webkit-slider-thumb{transition:none}
  .ds-slider-input::-moz-range-thumb{transition:none}
}
`;

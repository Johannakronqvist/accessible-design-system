/*
  NumberStepper — a native input[type=number], so assistive tech gets the
  spinbutton role, min / max / step and value announcements for free, and the
  arrow keys work without any custom key handling (2.1.1). The − and + buttons
  are an addition for pointer and touch, each a 24px target with a label that
  names what it changes ("Decrease quantity"), not just a symbol.

  Typing is left alone while the field has focus and clamped on blur, so
  someone typing "12" into a field with a minimum of 5 is not fighting a
  clamp mid-keystroke. At the bounds the buttons report aria-disabled rather
  than the disabled attribute: the state is still announced, but the button
  keeps its place in the tab order, so pressing + up to the maximum never
  drops the keyboard focus onto the body.

  Reuses .ds-field / .ds-field-label / .ds-field-hint / .ds-field-err /
  .ds-sr / .ds-req from FIELD_CSS.
*/

import { useState } from "react";
import { Minus, Plus, AlertCircle } from "lucide-react";
import { nextId } from "./id";

const clamp = (n, min, max) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));

export function NumberStepper({
  label, min, max, step = 1, defaultValue = 0, disabled = false, hint, error,
  required = false, unit, decrementLabel, incrementLabel, onChange,
}) {
  const [id] = useState(() => nextId("ds-num"));
  const [value, setValue] = useState(defaultValue);

  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const unitId = unit ? `${id}-unit` : undefined;
  const describedBy = [hintId, unitId, errId].filter(Boolean).join(" ") || undefined;

  // An empty field is "no value", not zero — otherwise a min of 1 would read as at-minimum.
  const num = value === "" ? NaN : Number(value);
  const atMin = min != null && Number.isFinite(num) && num <= min;
  const atMax = max != null && Number.isFinite(num) && num >= max;

  const bump = (dir) => {
    if ((dir < 0 && atMin) || (dir > 0 && atMax)) return;
    const next = clamp((Number.isFinite(num) ? num : min ?? 0) + dir * step, min, max);
    // Keep the step grid clean after floating-point arithmetic (0.1 + 0.2).
    const rounded = Number(next.toFixed(10));
    setValue(rounded);
    onChange?.(rounded);
  };

  return (
    <div className="ds-field">
      <label htmlFor={id} className="ds-field-label">
        {label}
        {required && <span className="ds-req" aria-hidden="true"> *</span>}
        {required && <span className="ds-sr"> (required)</span>}
      </label>
      {hint && <div id={hintId} className="ds-field-hint">{hint}</div>}
      <div className={`ds-num-wrap${error ? " error" : ""}${disabled ? " disabled" : ""}`}>
        <button type="button" className="ds-num-btn" onClick={() => bump(-1)}
          disabled={disabled} aria-disabled={atMin || undefined}
          aria-label={decrementLabel || `Decrease ${label}`}>
          <Minus size={15} aria-hidden="true" />
        </button>
        <input
          id={id} type="number" className="ds-num-in" inputMode="decimal"
          min={min} max={max} step={step} value={value} disabled={disabled}
          aria-describedby={describedBy} aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          onChange={(e) => { setValue(e.target.value); onChange?.(e.target.value); }}
          onBlur={(e) => {
            const n = Number(e.target.value);
            const next = e.target.value === "" || !Number.isFinite(n) ? (min ?? 0) : clamp(n, min, max);
            setValue(next);
            onChange?.(next);
          }}
        />
        <button type="button" className="ds-num-btn" onClick={() => bump(1)}
          disabled={disabled} aria-disabled={atMax || undefined}
          aria-label={incrementLabel || `Increase ${label}`}>
          <Plus size={15} aria-hidden="true" />
        </button>
      </div>
      {unit && <div id={unitId} className="ds-field-hint">{unit}</div>}
      {error && (
        <div id={errId} className="ds-field-err" role="alert">
          <AlertCircle size={14} aria-hidden="true" />{error}
        </div>
      )}
    </div>
  );
}

export const NUMBER_CSS = `
.ds-num-wrap{display:inline-flex;align-items:stretch;background:var(--surface);
  border:1.5px solid var(--border-interactive);border-radius:var(--radius);
  min-height:var(--target-touch);box-sizing:border-box;overflow:hidden;max-width:180px;
  transition:border-color .12s,box-shadow .12s}
.ds-num-wrap:hover:not(.disabled){border-color:var(--text-2)}
.ds-num-wrap:focus-within{border-color:var(--accent-text);box-shadow:0 0 0 3px var(--accent-tint)}
.ds-num-wrap.error{border-color:var(--danger)}
.ds-num-wrap.disabled{background:var(--disabled-bg);border-color:var(--disabled-border)}
.ds-num-btn{display:inline-flex;align-items:center;justify-content:center;min-width:var(--target-touch);
  padding:0 10px;border:none;background:transparent;color:var(--text-1);cursor:pointer;flex-shrink:0}
.ds-num-btn:hover:not(:disabled):not([aria-disabled="true"]){background:var(--accent-tint);color:var(--accent-on-tint)}
.ds-num-btn:disabled,.ds-num-btn[aria-disabled="true"]{color:var(--disabled-text);cursor:not-allowed}
.ds-num-btn:focus-visible{outline:none;box-shadow:inset 0 0 0 2px var(--ring)}
.ds-num-in{font-family:var(--font-body);font-size:var(--fs-base);color:var(--text-1);
  background:transparent;border:none;outline:none;text-align:center;width:100%;min-width:44px;
  padding:0;-moz-appearance:textfield;appearance:textfield}
.ds-num-in::-webkit-outer-spin-button,.ds-num-in::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.ds-num-in:disabled{color:var(--disabled-text);cursor:not-allowed}
@media (prefers-reduced-motion:reduce){.ds-num-wrap{transition:none}}
`;

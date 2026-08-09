/*
  Field - text input with label, optional hint and error. Label/for and
  aria-describedby wire the hint and error; aria-invalid + a role=alert region
  identify errors; the error carries an icon, never color alone (1.4.1).
  Required is announced to assistive tech; the field is a 44px touch target.
*/

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { nextId } from "./id";

export function Field({ label, hint, error, required = false, disabled = false, type = "text", placeholder, defaultValue }) {
  const [id] = useState(() => nextId("ds-f"));
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="ds-field">
      <label htmlFor={id} className="ds-field-label">
        {label}
        {required && <span className="ds-req" aria-hidden="true"> *</span>}
        {required && <span className="ds-sr"> (required)</span>}
      </label>
      {hint && <div id={hintId} className="ds-field-hint">{hint}</div>}
      <input
        id={id} type={type} placeholder={placeholder} disabled={disabled}
        defaultValue={defaultValue} aria-describedby={describedBy}
        aria-invalid={error ? true : undefined} aria-required={required || undefined}
        className={`ds-input${error ? " error" : ""}`}
      />
      {error && (
        <div id={errId} className="ds-field-err" role="alert">
          <AlertCircle size={14} aria-hidden="true" />{error}
        </div>
      )}
    </div>
  );
}

export const FIELD_CSS = `
.ds-field{display:flex;flex-direction:column;gap:6px}
.ds-field-label{font-family:var(--font-body);font-size:var(--fs-sm);font-weight:500;color:var(--text-1)}
.ds-req{color:var(--danger)}
.ds-field-hint{font-size:var(--fs-sm);color:var(--text-2);line-height:1.45}
.ds-input{font-family:var(--font-body);font-size:var(--fs-base);color:var(--text-1);
  background:var(--surface);border:1.5px solid var(--border-interactive);border-radius:var(--radius);
  padding:9px 14px;min-height:var(--target-touch);box-sizing:border-box;width:100%;outline:none;
  transition:border-color .12s,box-shadow .12s}
.ds-input::placeholder{color:var(--text-2);opacity:1}
.ds-input:hover:not(:disabled){border-color:var(--text-2)}
.ds-input:focus-visible{border-color:var(--accent-text);box-shadow:0 0 0 3px var(--accent-tint)}
.ds-input.error{border-color:var(--danger)}
.ds-input:disabled{background:var(--disabled-bg);color:var(--disabled-text);
  border-color:var(--disabled-border);cursor:not-allowed}
.ds-field-err{display:flex;align-items:center;gap:6px;font-size:var(--fs-sm);color:var(--danger)}
/* .ds-sr lives in VISUALLYHIDDEN_CSS - it was defined here and in LINK_CSS with
   nothing keeping the copies in step. Include that block alongside this one. */
/*
  Color input. A native input[type=color] paints its swatch through a wrapper
  that carries browser-default padding, and the swatch has its own border and
  corner shape - so the fill sits inset from the border you draw, with a gap
  and a mismatched curve. Those internals have to be reset explicitly; the
  vendor pseudo-elements cannot be combined into one rule, because an
  unrecognised selector in a list drops the whole rule.

  The inner radius is the outer minus the border width, so the two curves stay
  concentric at every shape setting instead of drifting apart at the corners.
*/
.ds-color-in{-webkit-appearance:none;appearance:none;
  width:44px;height:44px;padding:0;box-sizing:border-box;overflow:hidden;
  border:1.5px solid var(--border-interactive);border-radius:var(--radius);
  background:none;cursor:pointer;transition:border-color .12s,box-shadow .12s}
.ds-color-in::-webkit-color-swatch-wrapper{padding:0;border-radius:inherit}
.ds-color-in::-webkit-color-swatch{border:none;border-radius:max(0px,calc(var(--radius) - 1.5px))}
.ds-color-in::-moz-color-swatch{border:none;border-radius:max(0px,calc(var(--radius) - 1.5px))}
.ds-color-in:hover{border-color:var(--text-2)}
/* It had no focus style at all before - a real 2.4.7 gap on a real control. */
.ds-color-in:focus-visible{outline:none;border-color:var(--accent-text);
  box-shadow:0 0 0 3px var(--accent-tint)}
@media (prefers-reduced-motion:reduce){.ds-color-in{transition:none}}
`;

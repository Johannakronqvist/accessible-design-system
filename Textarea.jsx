/*
  Textarea — the Field shell (label / hint / error wiring, focus ring, shape
  token) applied to a multi-line input, plus an optional character counter.
  The counter is described to the field, so focusing it announces the budget;
  a separate polite status region only speaks near the limit, so typing is
  never narrated character by character (4.1.3). With enforceMax={false} the
  limit is advisory: going over sets aria-invalid and shows the error rather
  than silently truncating pasted text.

  Reuses .ds-field / .ds-field-label / .ds-field-hint / .ds-field-err /
  .ds-input / .ds-sr / .ds-req from FIELD_CSS.
*/

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { nextId } from "./id";

// Stay quiet until the limit is close, then announce each keystroke's budget.
const ANNOUNCE_AT = 20;

export function Textarea({
  label, hint, error, required = false, disabled = false, placeholder,
  defaultValue = "", rows = 4, maxLength, showCount = false,
  enforceMax = true, resize = "vertical",
}) {
  const [id] = useState(() => nextId("ds-ta"));
  const [value, setValue] = useState(defaultValue);

  const remaining = maxLength != null ? maxLength - value.length : null;
  const over = remaining != null && remaining < 0;
  // An overflowing soft limit is itself an error, unless the caller set one.
  const shownError = error || (over ? `${-remaining} characters over the limit.` : undefined);

  const hintId = hint ? `${id}-hint` : undefined;
  const errId = shownError ? `${id}-err` : undefined;
  const countId = showCount ? `${id}-count` : undefined;
  const describedBy = [hintId, countId, errId].filter(Boolean).join(" ") || undefined;

  // Only near the limit — an empty string keeps the live region silent.
  const announce = remaining != null && remaining <= ANNOUNCE_AT
    ? (over ? `${-remaining} characters over the limit` : `${remaining} characters remaining`)
    : "";

  return (
    <div className="ds-field">
      <label htmlFor={id} className="ds-field-label">
        {label}
        {required && <span className="ds-req" aria-hidden="true"> *</span>}
        {required && <span className="ds-sr"> (required)</span>}
      </label>
      {hint && <div id={hintId} className="ds-field-hint">{hint}</div>}
      <textarea
        id={id} rows={rows} placeholder={placeholder} disabled={disabled}
        value={value} onChange={(e) => setValue(e.target.value)}
        maxLength={enforceMax ? maxLength : undefined}
        aria-describedby={describedBy}
        aria-invalid={shownError ? true : undefined}
        aria-required={required || undefined}
        className={`ds-input ds-textarea${shownError ? " error" : ""}`}
        style={{ resize }}
      />
      {(countId || shownError) && (
        <div className="ds-ta-foot">
          {shownError ? (
            <div id={errId} className="ds-field-err" role="alert">
              <AlertCircle size={14} aria-hidden="true" />{shownError}
            </div>
          ) : <span />}
          {countId && (
            <span id={countId} className={`ds-ta-count${over ? " over" : ""}`}>
              {maxLength != null ? `${value.length} / ${maxLength}` : `${value.length} characters`}
            </span>
          )}
        </div>
      )}
      <span className="ds-sr" role="status">{announce}</span>
    </div>
  );
}

export const TEXTAREA_CSS = `
.ds-textarea{min-height:96px;line-height:1.5;padding:10px 14px;display:block;resize:vertical}
.ds-ta-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.ds-ta-count{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:var(--fs-sm);
  color:var(--text-2);margin-left:auto;white-space:nowrap}
.ds-ta-count.over{color:var(--danger);font-weight:500}
`;

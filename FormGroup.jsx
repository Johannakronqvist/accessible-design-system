/*
  FormGroup - a fieldset with a legend, so related controls are announced as
  one named group instead of a loose run of inputs (1.3.1). The group hint and
  error are wired to the fieldset with aria-describedby, which means they are
  read once for the group rather than repeated on every field inside it.

  The sameAs slot is the 3.3.7 Redundant Entry answer: when information has
  already been given elsewhere in the flow, offer it back instead of asking
  for it again. Checking the box unmounts the fields - removing them from the
  tab order, not just hiding them - and shows the previously entered values as
  a summary, which a polite status region announces (4.1.3).

  Reuses .ds-check from SEL_CSS and .ds-field-hint / .ds-field-err / .ds-req
  from FIELD_CSS.
*/

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Checkbox } from "./SelectionControls";
import { nextId } from "./id";

export function FormGroup({
  legend, hint, error, required = false, disabled = false,
  variant = "plain", gap = "var(--space-2)", sameAs, children,
}) {
  const [id] = useState(() => nextId("ds-fg"));
  const [same, setSame] = useState(sameAs?.defaultChecked ?? false);

  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  const collapsed = Boolean(sameAs && same);

  return (
    <fieldset
      className={`ds-formgroup ${variant}`}
      disabled={disabled || undefined}
      aria-describedby={describedBy}
    >
      <legend className="ds-fg-legend">
        {legend}
        {required && <span className="ds-req" aria-hidden="true"> *</span>}
        {required && <span className="ds-sr"> (required)</span>}
      </legend>
      {hint && <div id={hintId} className="ds-field-hint ds-fg-hint">{hint}</div>}

      {sameAs && (
        <div className="ds-fg-same">
          <Checkbox
            label={sameAs.label} defaultChecked={sameAs.defaultChecked}
            onChange={(checked) => { setSame(checked); sameAs.onChange?.(checked); }}
          />
        </div>
      )}

      {collapsed ? (
        <div className="ds-fg-summary">{sameAs.summary}</div>
      ) : (
        <div className="ds-fg-body" style={{ gap }}>{children}</div>
      )}

      {error && (
        <div id={errId} className="ds-field-err ds-fg-err" role="alert">
          <AlertCircle size={14} aria-hidden="true" />{error}
        </div>
      )}
      <span className="ds-sr" role="status">
        {collapsed ? `${sameAs.label}. The fields for ${legend} are no longer required.` : ""}
      </span>
    </fieldset>
  );
}

export const FORMGROUP_CSS = `
.ds-formgroup{border:none;margin:0;padding:0;min-width:0}
.ds-formgroup.card{background:var(--surface);border:.5px solid var(--border);
  border-radius:min(calc(var(--radius) + 4px),18px);padding:20px}
.ds-fg-legend{padding:0;margin:0 0 4px;font-family:var(--font-body);font-size:var(--fs-base);
  font-weight:600;color:var(--text-1);line-height:1.35}
.ds-fg-hint{margin-bottom:2px;max-width:60ch}
.ds-fg-same{margin:10px 0 2px}
.ds-fg-body{display:flex;flex-direction:column;margin-top:12px}
.ds-fg-summary{margin-top:12px;padding:11px 13px;background:var(--accent-tint);
  color:var(--accent-on-tint);border-radius:min(var(--radius),10px);
  font-size:var(--fs-sm);line-height:1.5}
.ds-fg-err{margin-top:10px}
`;

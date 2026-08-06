/*
  PasswordField - a password input built for 3.3.8 Accessible Authentication.
  Three things make it pass where most password fields fail: paste is never
  intercepted (there is deliberately no onPaste handler, so password managers
  and clipboards work), autoComplete is set so browsers and managers can fill
  and save the right credential, and a reveal toggle lets people verify what
  they typed instead of relying on memory.

  The toggle is a real button with aria-pressed and a label that names the
  action. Optional requirements render as a checklist where each rule carries
  an icon and text, never color alone (1.4.1); a polite summary announces
  progress without narrating the list on every keystroke (4.1.3).

  Reuses .ds-field / .ds-field-label / .ds-field-hint / .ds-field-err /
  .ds-input / .ds-sr / .ds-req from FIELD_CSS.
*/

import { useState } from "react";
import { Eye, EyeOff, Check, Circle, AlertCircle } from "lucide-react";
import { nextId } from "./id";

export function PasswordField({
  label = "Password", hint, error, required = false, disabled = false, placeholder,
  autoComplete = "current-password", defaultValue = "", revealToggle = true,
  showLabel = "Show password", hideLabel = "Hide password", requirements,
}) {
  const [id] = useState(() => nextId("ds-pw"));
  const [value, setValue] = useState(defaultValue);
  const [revealed, setRevealed] = useState(false);

  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const reqId = requirements?.length ? `${id}-req` : undefined;
  const describedBy = [hintId, reqId, errId].filter(Boolean).join(" ") || undefined;

  const met = requirements?.map((r) => r.test(value)) || [];
  const metCount = met.filter(Boolean).length;

  return (
    <div className="ds-field">
      <label htmlFor={id} className="ds-field-label">
        {label}
        {required && <span className="ds-req" aria-hidden="true"> *</span>}
        {required && <span className="ds-sr"> (required)</span>}
      </label>
      {hint && <div id={hintId} className="ds-field-hint">{hint}</div>}
      <div className="ds-pw-wrap">
        <input
          id={id} type={revealed ? "text" : "password"} placeholder={placeholder}
          disabled={disabled} value={value} onChange={(e) => setValue(e.target.value)}
          autoComplete={autoComplete} aria-describedby={describedBy}
          aria-invalid={error ? true : undefined} aria-required={required || undefined}
          className={`ds-input ds-pw-in${error ? " error" : ""}${revealToggle ? "" : " no-toggle"}`}
        />
        {revealToggle && (
          <button
            type="button" className="ds-pw-toggle" disabled={disabled}
            aria-pressed={revealed} aria-label={revealed ? hideLabel : showLabel}
            onClick={() => setRevealed((r) => !r)}
          >
            {revealed ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        )}
      </div>
      {requirements?.length > 0 && (
        <>
          <ul id={reqId} className="ds-pw-reqs">
            {requirements.map((r, i) => (
              <li key={r.label} className={`ds-pw-req${met[i] ? " met" : ""}`}>
                {met[i]
                  ? <Check size={14} aria-hidden="true" />
                  : <Circle size={14} aria-hidden="true" />}
                <span>{r.label}</span>
                <span className="ds-sr">{met[i] ? " - met" : " - not met yet"}</span>
              </li>
            ))}
          </ul>
          <span className="ds-sr" role="status">
            {value ? `${metCount} of ${requirements.length} password requirements met` : ""}
          </span>
        </>
      )}
      {error && (
        <div id={errId} className="ds-field-err" role="alert">
          <AlertCircle size={14} aria-hidden="true" />{error}
        </div>
      )}
    </div>
  );
}

export const PASSWORD_CSS = `
.ds-pw-wrap{position:relative;display:flex;align-items:center}
.ds-pw-in{padding-right:46px;font-family:var(--font-body)}
.ds-pw-in.no-toggle{padding-right:14px}
.ds-pw-toggle{position:absolute;right:9px;display:inline-flex;align-items:center;justify-content:center;
  width:var(--target-min);height:var(--target-min);padding:0;border:none;border-radius:50%;
  background:transparent;color:var(--text-2);cursor:pointer}
.ds-pw-toggle:hover:not(:disabled){background:var(--accent-tint);color:var(--accent-on-tint)}
.ds-pw-toggle[aria-pressed="true"]{color:var(--accent-text)}
.ds-pw-toggle:disabled{color:var(--disabled-text);cursor:not-allowed}
.ds-pw-toggle:focus-visible{outline:none;box-shadow:0 0 0 2px var(--surface),0 0 0 4px var(--ring)}
.ds-pw-reqs{list-style:none;margin:2px 0 0;padding:0;display:flex;flex-direction:column;gap:5px}
.ds-pw-req{display:flex;align-items:center;gap:7px;font-size:var(--fs-sm);color:var(--text-2);line-height:1.45}
.ds-pw-req.met{color:var(--success)}
.ds-pw-req svg{flex-shrink:0}
`;

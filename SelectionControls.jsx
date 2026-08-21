/*
  Selection controls - Checkbox, RadioGroup and Switch. Native inputs with
  label association and a shared focus ring; a 24px+ hit target wraps each
  small visual (2.5.8). Radios are grouped in a fieldset with a legend, and
  the switch state is shown by thumb position, not color alone (1.4.1). The
  checkbox radius follows the shape token but clamps to a rounded square.
*/

import { useState, useEffect, useRef } from "react";
import { nextId } from "./id";

export function Checkbox({ label, defaultChecked = false, indeterminate = false, disabled = false, onChange }) {
  const [on, setOn] = useState(defaultChecked);
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate && !on; }, [indeterminate, on]);
  return (
    <label className={`ds-check${disabled ? " disabled" : ""}`}>
      <input ref={ref} type="checkbox" className="ds-sel-input" checked={on} disabled={disabled}
        onChange={(e) => { setOn(e.target.checked); onChange?.(e.target.checked); }} />
      <span className="ds-check-box" aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}

export function RadioGroup({ label, name, options = [], defaultValue, disabled = false }) {
  const [gid] = useState(() => nextId("ds-rg"));
  const [val, setVal] = useState(defaultValue);
  return (
    <fieldset className="ds-radiogroup" disabled={disabled || undefined}>
      <legend>{label}</legend>
      {options.map((o) => (
        <label key={o.value} className={`ds-radio${disabled ? " disabled" : ""}`}>
          <input type="radio" className="ds-sel-input" name={name || gid} value={o.value}
            checked={val === o.value} onChange={() => setVal(o.value)} />
          <span className="ds-radio-box" aria-hidden="true"><span className="ds-radio-dot" /></span>
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function Switch({ label, defaultChecked = false, disabled = false }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <label className={`ds-switch-row${disabled ? " disabled" : ""}`}>
      <input type="checkbox" role="switch" className="ds-sel-input" checked={on} disabled={disabled}
        onChange={(e) => setOn(e.target.checked)} />
      <span className="ds-switch-track" aria-hidden="true"><span className="ds-switch-thumb" /></span>
      <span>{label}</span>
    </label>
  );
}

export const SEL_CSS = `
.ds-check,.ds-radio,.ds-switch-row{display:inline-flex;align-items:center;gap:10px;min-height:var(--target-min);
  cursor:pointer;font-family:var(--font-body);font-size:var(--fs-base);color:var(--text-1);line-height:1.4}
.ds-check.disabled,.ds-radio.disabled,.ds-switch-row.disabled{cursor:not-allowed;color:var(--text-2)}
.ds-sel-input{position:absolute;width:1px;height:1px;opacity:0;margin:0;clip:rect(0 0 0 0);overflow:hidden}
.ds-check-box{width:20px;height:20px;box-sizing:border-box;flex-shrink:0;background:var(--surface);
  border:1.5px solid var(--border-interactive);border-radius:min(var(--radius),7px);
  display:inline-flex;align-items:center;justify-content:center;transition:background .1s,border-color .1s}
.ds-check-box::after{content:"";width:5px;height:9px;border:solid var(--accent-on-marker);border-width:0 2px 2px 0;
  transform:rotate(45deg) scale(0);margin-top:-1px;transition:transform .1s}
.ds-sel-input:checked + .ds-check-box{background:var(--accent-marker);border-color:var(--accent-marker)}
.ds-sel-input:checked + .ds-check-box::after{transform:rotate(45deg) scale(1)}
.ds-sel-input:indeterminate + .ds-check-box{background:var(--accent-marker);border-color:var(--accent-marker)}
.ds-sel-input:indeterminate + .ds-check-box::after{width:10px;height:2px;border:none;background:var(--accent-on-marker);
  border-radius:1px;transform:none;margin:0}
.ds-radio-box{width:20px;height:20px;box-sizing:border-box;flex-shrink:0;background:var(--surface);
  border:1.5px solid var(--border-interactive);border-radius:50%;
  display:inline-flex;align-items:center;justify-content:center;transition:border-color .1s}
.ds-radio-dot{width:9px;height:9px;border-radius:50%;background:var(--accent-marker);transform:scale(0);transition:transform .1s}
.ds-sel-input:checked + .ds-radio-box{border-color:var(--accent-marker)}
.ds-sel-input:checked + .ds-radio-box .ds-radio-dot{transform:scale(1)}
.ds-switch-track{width:38px;height:22px;box-sizing:border-box;flex-shrink:0;position:relative;
  background:var(--disabled-bg);border:1.5px solid var(--border-interactive);
  border-radius:min(var(--radius),11px);transition:background .15s,border-color .15s}
.ds-switch-thumb{width:14px;height:14px;border-radius:50%;background:var(--text-2);position:absolute;
  top:2px;left:2px;transition:left .15s,background .15s}
.ds-sel-input:checked + .ds-switch-track{background:var(--accent-marker);border-color:var(--accent-marker)}
.ds-sel-input:checked + .ds-switch-track .ds-switch-thumb{left:19px;background:var(--accent-on-marker)}
.ds-sel-input:focus-visible + .ds-check-box,
.ds-sel-input:focus-visible + .ds-radio-box,
.ds-sel-input:focus-visible + .ds-switch-track{box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--ring)}
.ds-check.disabled .ds-check-box,.ds-radio.disabled .ds-radio-box,
.ds-switch-row.disabled .ds-switch-track{background:var(--disabled-bg);border-color:var(--disabled-border)}
.ds-switch-row.disabled .ds-switch-thumb{background:var(--disabled-text)}
.ds-radiogroup{border:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.ds-radiogroup legend{padding:0;margin:0 0 4px;font-size:var(--fs-sm);font-weight:500;color:var(--text-1)}
`;

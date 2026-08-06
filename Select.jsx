/*
  Select - a select-only ARIA combobox (role=combobox + listbox/option).
  Open with Enter / Space / ↑ / ↓; move with the arrows, Home / End and
  type-ahead; choose with Enter; dismiss with Escape - focus returns to the
  trigger. Selected is marked with a check, never color alone (1.4.1). Reuses
  the Field label / hint / error wiring, the focus ring and the shape token.
*/

import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, AlertCircle } from "lucide-react";
import { nextId } from "./id";
import { useDismissable } from "./useDismissable";

export function Select({ label, options = [], defaultValue, placeholder = "Select…", disabled = false, error, hint }) {
  const [id] = useState(() => nextId("ds-select"));
  const listId = `${id}-list`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue ?? null);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const optRefs = useRef([]);
  const ta = useRef({ s: "", t: 0 });
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (open && optRefs.current[active]) optRefs.current[active].scrollIntoView({ block: "nearest" });
  }, [open, active]);

  // Outside-press only: focus never leaves the trigger here (the list is driven
  // by aria-activedescendant), so Escape already arrives in onKeyDown below.
  // Taking the document listener too would give two handlers one keypress.
  useDismissable({
    open, onDismiss: () => setOpen(false),
    triggerRef: btnRef, contentRef: rootRef, escape: false,
  });

  const openList = () => { if (!disabled) { setActive(Math.max(0, options.findIndex((o) => o.value === value))); setOpen(true); } };
  const close = (focus = true) => { setOpen(false); if (focus) btnRef.current?.focus(); };
  const choose = (i) => { const o = options[i]; if (o) { setValue(o.value); setActive(i); } close(); };

  const onKeyDown = (e) => {
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); openList(); }
      return;
    }
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setActive((a) => Math.min(last, a + 1)); break;
      case "ArrowUp": e.preventDefault(); setActive((a) => Math.max(0, a - 1)); break;
      case "Home": e.preventDefault(); setActive(0); break;
      case "End": e.preventDefault(); setActive(last); break;
      case "Enter": case " ": e.preventDefault(); choose(active); break;
      case "Escape": e.preventDefault(); close(); break;
      case "Tab": close(false); break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const now = Date.now();
          ta.current.s = (now - ta.current.t < 500 ? ta.current.s : "") + e.key.toLowerCase();
          ta.current.t = now;
          const idx = options.findIndex((o) => o.label.toLowerCase().startsWith(ta.current.s));
          if (idx >= 0) setActive(idx);
        }
    }
  };

  return (
    <div className="ds-field" ref={rootRef}>
      {label && <label id={`${id}-label`} htmlFor={id} className="ds-field-label">{label}</label>}
      {hint && <div id={hintId} className="ds-field-hint">{hint}</div>}
      <div style={{ position: "relative" }}>
        <button ref={btnRef} type="button" id={id} className={`ds-select-trigger${error ? " error" : ""}`}
          role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId}
          aria-labelledby={label ? `${id}-label ${id}` : undefined}
          aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
          aria-describedby={describedBy} aria-invalid={error ? true : undefined}
          disabled={disabled} onClick={() => (open ? close() : openList())} onKeyDown={onKeyDown}>
          <span className={`ds-select-val${selected ? "" : " ds-select-ph"}`}>{selected ? selected.label : placeholder}</span>
          <ChevronDown size={18} className="ds-select-chev" aria-hidden="true" />
        </button>
        {open && (
          <ul id={listId} role="listbox" className="ds-listbox" aria-labelledby={label ? `${id}-label` : undefined}>
            {options.map((o, i) => (
              <li key={o.value} id={`${id}-opt-${i}`} role="option" aria-selected={value === o.value}
                ref={(el) => (optRefs.current[i] = el)}
                className={`ds-option${i === active ? " active" : ""}`}
                onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(i)}>
                <span>{o.label}</span>
                {value === o.value && <Check size={16} className="ds-opt-check" aria-hidden="true" />}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <div id={errId} className="ds-field-err" role="alert"><AlertCircle size={14} aria-hidden="true" />{error}</div>}
    </div>
  );
}

export const SELECT_CSS = `
.ds-select-trigger{font-family:var(--font-body);font-size:var(--fs-base);color:var(--text-1);
  background:var(--surface);border:1.5px solid var(--border-interactive);border-radius:var(--radius);
  padding:9px 12px 9px 14px;min-height:var(--target-touch);box-sizing:border-box;width:100%;
  display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;text-align:left;
  outline:none;transition:border-color .12s,box-shadow .12s}
.ds-select-trigger:hover:not(:disabled){border-color:var(--text-2)}
.ds-select-trigger:focus-visible{border-color:var(--accent-text);box-shadow:0 0 0 3px var(--accent-tint)}
.ds-select-trigger[aria-expanded="true"]{border-color:var(--accent-text)}
.ds-select-trigger.error{border-color:var(--danger)}
.ds-select-trigger:disabled{background:var(--disabled-bg);color:var(--disabled-text);
  border-color:var(--disabled-border);cursor:not-allowed}
.ds-select-val{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ds-select-ph{color:var(--text-2)}
.ds-select-chev{color:var(--text-2);flex-shrink:0;transition:transform .12s}
.ds-select-trigger[aria-expanded="true"] .ds-select-chev{transform:rotate(180deg)}
.ds-listbox{list-style:none;margin:0;padding:5px;position:absolute;z-index:30;top:calc(100% + 6px);left:0;right:0;
  background:var(--surface);border:.5px solid var(--border);border-radius:min(calc(var(--radius) + 2px),14px);
  box-shadow:0 10px 26px rgba(0,0,0,0.14);max-height:240px;overflow-y:auto}
.ds-option{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;
  border-radius:min(var(--radius),8px);font-size:var(--fs-base);color:var(--text-1);cursor:pointer}
.ds-option.active{background:var(--accent-tint)}
.ds-opt-check{color:var(--accent-text);flex-shrink:0}
`;

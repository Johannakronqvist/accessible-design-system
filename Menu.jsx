/*
  Menu — the ARIA menu button pattern, for firing actions. This is not Select:
  a listbox picks a value and keeps focus on its trigger, driving the list with
  aria-activedescendant. A menu moves real DOM focus onto each item, because
  menu items are commands and a screen reader should read them as such.

  Open with click, Enter, Space or ArrowDown (focusing the first item) or
  ArrowUp (focusing the last). Move with the arrows and Home / End, jump with
  type-ahead, fire with Enter or Space, dismiss with Escape or Tab — focus
  returns to the trigger either way. Escape and outside-press come from
  useDismissable, which Select and Navbar share.

  Disabled items keep their place in the roving focus and report aria-disabled
  rather than vanishing, so the menu does not change shape under you.
*/

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { nextId } from "./id";
import { useDismissable } from "./useDismissable";

export function Menu({
  label, items = [], align = "start", variant = "secondary", size = "md",
  icon: TriggerIcon, showChevron = true,
}) {
  const [id] = useState(() => nextId("ds-menu"));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);
  const itemRefs = useRef([]);
  const ta = useRef({ s: "", t: 0 });

  // Separators are not focusable, so keyboard positions count only real items.
  const focusable = items.filter((i) => !i.separator);
  const last = focusable.length - 1;

  useDismissable({ open, onDismiss: () => setOpen(false), triggerRef, contentRef });

  useEffect(() => {
    if (open) itemRefs.current[active]?.focus();
  }, [open, active]);

  const openAt = (i) => { setActive(i); setOpen(true); };
  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };
  const choose = (i) => {
    const item = focusable[i];
    if (!item || item.disabled) return;
    close();
    item.onSelect?.(item.value);
  };

  const onTriggerKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault(); openAt(0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault(); openAt(last);
    }
  };

  const onMenuKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setActive((a) => (a >= last ? 0 : a + 1)); break;
      case "ArrowUp": e.preventDefault(); setActive((a) => (a <= 0 ? last : a - 1)); break;
      case "Home": e.preventDefault(); setActive(0); break;
      case "End": e.preventDefault(); setActive(last); break;
      case "Enter": case " ": e.preventDefault(); choose(active); break;
      // Tab closes and lets focus continue on its way, rather than trapping.
      case "Tab": close(false); break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const now = Date.now();
          ta.current.s = (now - ta.current.t < 500 ? ta.current.s : "") + e.key.toLowerCase();
          ta.current.t = now;
          const hit = focusable.findIndex((o) => o.label.toLowerCase().startsWith(ta.current.s));
          if (hit >= 0) setActive(hit);
        }
    }
  };

  let pos = -1;
  return (
    <div className="ds-menu-root">
      <button
        ref={triggerRef} type="button" id={id}
        className={`ds-btn ${variant} ${size} ds-menu-trigger`}
        aria-haspopup="menu" aria-expanded={open} aria-controls={`${id}-menu`}
        onClick={() => (open ? close(false) : openAt(0))}
        onKeyDown={onTriggerKeyDown}
      >
        {TriggerIcon && <TriggerIcon size={16} aria-hidden="true" />}
        {label}
        {showChevron && <ChevronDown size={15} className="ds-menu-chev" aria-hidden="true" />}
      </button>

      {open && (
        <ul
          ref={contentRef} id={`${id}-menu`} role="menu" aria-labelledby={id}
          className={`ds-menu ${align}`} onKeyDown={onMenuKeyDown}
        >
          {items.map((item, i) => {
            if (item.separator) {
              return <li key={`sep-${i}`} role="separator" className="ds-menu-sep" />;
            }
            pos += 1;
            const p = pos;
            const Icon = item.icon;
            return (
              <li key={item.value} role="none">
                <button
                  ref={(el) => (itemRefs.current[p] = el)}
                  type="button" role="menuitem" tabIndex={-1}
                  className={`ds-menu-item${item.destructive ? " destructive" : ""}`}
                  aria-disabled={item.disabled || undefined}
                  onClick={() => choose(p)}
                  onMouseEnter={() => setActive(p)}
                >
                  {Icon && <Icon size={15} className="ds-menu-ic" aria-hidden="true" />}
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export const MENU_CSS = `
.ds-menu-root{position:relative;display:inline-flex}
.ds-menu-chev{transition:transform .12s}
.ds-menu-trigger[aria-expanded="true"] .ds-menu-chev{transform:rotate(180deg)}
.ds-menu{list-style:none;margin:0;padding:5px;position:absolute;z-index:40;top:calc(100% + 6px);
  min-width:190px;background:var(--surface);border:.5px solid var(--border);
  border-radius:min(calc(var(--radius) + 2px),14px);
  box-shadow:0 10px 26px rgba(0,0,0,0.14);max-height:280px;overflow-y:auto}
.ds-menu.start{left:0}
.ds-menu.end{right:0}
.ds-menu-item{width:100%;display:flex;align-items:center;gap:9px;padding:9px 10px;
  min-height:var(--target-min);background:transparent;border:none;text-align:left;
  border-radius:min(var(--radius),8px);font-family:var(--font-body);font-size:var(--fs-sm);
  color:var(--text-1);cursor:pointer}
.ds-menu-item:hover:not([aria-disabled="true"]){background:var(--accent-tint);color:var(--accent-on-tint)}
.ds-menu-item:focus-visible{outline:none;box-shadow:0 0 0 2px var(--surface),0 0 0 4px var(--ring)}
.ds-menu-item[aria-disabled="true"]{color:var(--disabled-text);cursor:not-allowed}
.ds-menu-item.destructive{color:var(--danger)}
.ds-menu-item.destructive:hover:not([aria-disabled="true"]){background:var(--danger);color:#fff}
.ds-menu-ic{flex-shrink:0;opacity:.85}
.ds-menu-sep{height:.5px;margin:5px 4px;background:var(--border)}
@media (prefers-reduced-motion:reduce){.ds-menu-chev{transition:none}}
`;

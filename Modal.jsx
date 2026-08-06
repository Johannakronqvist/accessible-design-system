/*
  Modal and Drawer — both native <dialog> opened with showModal(), which is the
  entire point. The browser then supplies, correctly and for free:

    · a real focus trap, without us hand-rolling one
    · an inert background — content behind is unreachable by keyboard and
      hidden from assistive tech, with no aria-hidden bookkeeping
    · Escape to dismiss, and focus returning to whatever opened it
    · top-layer rendering, so no ancestor's overflow:hidden, transform or
      z-index can clip it (2.4.11 Focus Not Obscured)

  That last one is why a hand-rolled div modal is usually subtly broken: it
  lives in the normal stacking context and any clipping ancestor can cut it in
  half. A dialog in the top layer cannot be clipped by anything.

  This is the same reasoning as Slider using a native range for 2.5.7 — and it
  carries the same testing consequence. jsdom implements neither showModal()
  nor the top layer, so the trap and the inert background are verified by hand
  (conformance-setup.md §3), not in CI. What the suite does cover is everything
  that is ours: labelling, initial focus, scroll lock, backdrop dismissal, and
  keeping React state in step with the browser's own close.

  Controlled on purpose. Almost everything else in this system is uncontrolled,
  but whether a modal is showing is always the parent's business — it follows
  from a route, a pending action, an unsaved-changes check.

    const [open, setOpen] = useState(false);
    <Modal open={open} onClose={() => setOpen(false)} title="Delete project">…</Modal>
*/

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { nextId } from "./id";

function Dialog({
  open, onClose, title, description, children, footer,
  kind = "modal", size = "md", placement = "right",
  dismissLabel = "Close", showDismiss = true,
  dismissOnBackdrop = true, initialFocus, headingLevel = 2,
}) {
  const [id] = useState(() => nextId("ds-dialog"));
  const ref = useRef(null);
  // Lets the close listener tell "React closed it" from "the user closed it",
  // so dismissing does not bounce onClose twice.
  const openRef = useRef(open);
  openRef.current = open;

  const titleId = title ? `${id}-title` : undefined;
  const descId = description ? `${id}-desc` : undefined;
  const Heading = `h${headingLevel}`;

  // Drive the native element from the open prop.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      // The browser focuses the first focusable child; override when asked.
      if (initialFocus?.current) initialFocus.current.focus();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open, initialFocus]);

  // Escape and any browser-initiated close both surface as a close event.
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const onCloseEvent = () => { if (openRef.current) onClose?.(); };
    el.addEventListener("close", onCloseEvent);
    return () => el.removeEventListener("close", onCloseEvent);
  }, [onClose]);

  // The top layer does not stop the page behind from scrolling.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`ds-dialog ${kind} ${size}${kind === "drawer" ? ` ${placement}` : ""}`}
      aria-labelledby={titleId} aria-describedby={descId}
      // A press landing on the dialog element itself is the backdrop; anything
      // inside hits .ds-dialog-inner and stops here.
      onClick={(e) => { if (dismissOnBackdrop && e.target === ref.current) onClose?.(); }}
    >
      <div className="ds-dialog-inner">
        {(title || showDismiss) && (
          <div className="ds-dialog-head">
            {title && <Heading id={titleId} className="ds-dialog-title">{title}</Heading>}
            {showDismiss && (
              <button type="button" className="ds-dialog-x" onClick={() => onClose?.()} aria-label={dismissLabel}>
                <X size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        {description && <p id={descId} className="ds-dialog-desc">{description}</p>}
        {children && <div className="ds-dialog-body">{children}</div>}
        {footer && <div className="ds-dialog-foot">{footer}</div>}
      </div>
    </dialog>
  );
}

export function Modal(props) {
  return <Dialog {...props} kind="modal" />;
}

export function Drawer(props) {
  return <Dialog {...props} kind="drawer" />;
}

export const MODAL_CSS = `
.ds-dialog{padding:0;border:none;color:var(--text-1);background:var(--surface);
  font-family:var(--font-body);box-shadow:0 24px 60px rgba(0,0,0,0.22);overflow:hidden}
.ds-dialog::backdrop{background:rgba(18,12,14,0.5)}
.ds-dialog.sm{--dlg-w:400px}
.ds-dialog.md{--dlg-w:540px}
.ds-dialog.lg{--dlg-w:760px}
.ds-dialog.modal{width:min(92vw,var(--dlg-w));max-width:92vw;max-height:85vh;
  border-radius:min(calc(var(--radius) + 6px),20px)}
/* Drawer: full height against one edge. Native dialogs centre with margin:auto,
   so pinning is a matter of which margin keeps the auto. */
.ds-dialog.drawer{width:min(92vw,var(--dlg-w));max-width:92vw;
  height:100dvh;max-height:100dvh;border-radius:0}
.ds-dialog.drawer.right{margin:0 0 0 auto}
.ds-dialog.drawer.left{margin:0 auto 0 0}
.ds-dialog-inner{display:flex;flex-direction:column;max-height:inherit;height:100%;min-height:0}
.ds-dialog-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;
  padding:20px 20px 0}
.ds-dialog-title{font-family:var(--font-display);font-weight:500;font-size:var(--fs-xl);
  line-height:1.25;margin:0;color:var(--text-1)}
.ds-dialog-x{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;
  width:var(--target-min);height:var(--target-min);margin:-2px -4px 0 0;padding:0;border:none;
  border-radius:50%;background:transparent;color:var(--text-2);cursor:pointer}
.ds-dialog-x:hover{background:var(--accent-tint);color:var(--accent-on-tint)}
.ds-dialog-x:focus-visible{outline:none;box-shadow:0 0 0 2px var(--surface),0 0 0 4px var(--ring)}
.ds-dialog-desc{margin:8px 20px 0;font-size:var(--fs-sm);color:var(--text-2);line-height:1.6;max-width:62ch}
.ds-dialog-body{padding:16px 20px 0;overflow-y:auto;flex:1;min-height:0}
.ds-dialog-foot{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;
  padding:20px;margin-top:auto}
@media (max-width:520px){
  .ds-dialog.modal{width:100%;max-width:100%;margin:auto 0 0;border-radius:min(var(--radius),16px) min(var(--radius),16px) 0 0}
}
`;

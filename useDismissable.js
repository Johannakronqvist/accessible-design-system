/*
  useDismissable — the shared "this thing can be closed" behaviour: Escape to
  dismiss, a pointer press outside to dismiss, and focus returning to whatever
  opened it.

  It exists because three components need the same three rules and were about
  to hand-roll them a third and fourth time — Select already had its own copy,
  Menu needs it, and Navbar's collapsed nav panel needs it again. Getting focus
  return wrong is a 2.4.3 failure that is easy to ship and hard to notice.

  The escape / outside flags are not decoration. A component that keeps DOM
  focus on its trigger (Select, which drives its list with aria-activedescendant)
  already sees the Escape keypress in its own handler and only needs the outside
  press. A component that moves focus into its content (Menu) cannot, so it
  takes the document-level listener instead. Turning the wrong one on gives you
  two handlers racing for the same key.

  Focus return is deliberately asymmetric: Escape returns focus to the trigger,
  because the user is still driving from the keyboard and would otherwise be
  dropped on the body. An outside press does not, because the user has just
  chosen where to put focus and stealing it back would fight them.

    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null), contentRef = useRef(null);
    useDismissable({ open, onDismiss: () => setOpen(false), triggerRef, contentRef });
*/

import { useEffect } from "react";

export function useDismissable({
  open, onDismiss, triggerRef, contentRef, escape = true, outside = true,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (!escape || e.key !== "Escape") return;
      e.stopPropagation();
      onDismiss("escape");
      triggerRef?.current?.focus();
    };

    const onPointerDown = (e) => {
      if (!outside) return;
      const inContent = contentRef?.current?.contains(e.target);
      // The trigger is excluded so its own click can toggle: without this the
      // press closes and the click immediately reopens, and it looks stuck.
      const inTrigger = triggerRef?.current?.contains(e.target);
      if (!inContent && !inTrigger) onDismiss("outside");
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onDismiss, triggerRef, contentRef, escape, outside]);
}

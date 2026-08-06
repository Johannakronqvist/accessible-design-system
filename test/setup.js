import "@testing-library/jest-dom/vitest";
import { toHaveNoViolations } from "jest-axe";
import { expect, vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

expect.extend(toHaveNoViolations);

// jsdom implements no layout, so scrollIntoView is absent. Select calls it when
// the active option changes; stub it rather than branch in the component.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

/*
  jsdom 29 gives us the <dialog> element and its open property but none of its
  methods — showModal() is genuinely undefined. This is a stub, not a polyfill:
  it makes the open/closed state and the close event work so React's logic runs
  and axe can inspect an open dialog.

  It emulates none of the three things that made native dialog the right choice
  in the first place: the focus trap, the inert background, and top-layer
  rendering. Those are the browser's, and they are checked by hand — see the
  Modal entries in conformance-setup.md §3. Do not write a test here that
  appears to verify them; it would be testing this stub.
*/
if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.show = HTMLDialogElement.prototype.showModal;
  HTMLDialogElement.prototype.close = function close(returnValue) {
    this.open = false;
    this.removeAttribute("open");
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.dispatchEvent(new Event("close"));
  };
}

afterEach(cleanup);

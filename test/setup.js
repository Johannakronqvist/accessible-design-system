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

afterEach(cleanup);

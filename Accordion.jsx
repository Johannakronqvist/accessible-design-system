/*
  Accordion - a stack of disclosures. Each trigger is a real button wrapped in
  a heading, which is the part most implementations get wrong: without the
  heading, a screen reader user cannot jump between sections with the heading
  shortcut, and the page's outline has a hole in it. headingLevel is a prop
  rather than a fixed h3 precisely because the right level depends on where
  the accordion sits in your page (1.3.1).

  aria-expanded on the button and aria-labelledby on the region tie the two
  together, and the chevron rotates so open/closed is conveyed by orientation
  as well as by position (1.4.1).

  allowMultiple={false} is the true accordion - opening one closes the rest.
  Set it true and each panel becomes an independent disclosure.
*/

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { nextId } from "./id";

export function Accordion({
  items = [], allowMultiple = false, defaultOpen = [], headingLevel = 3, onChange,
}) {
  const [id] = useState(() => nextId("ds-acc"));
  const [open, setOpen] = useState(defaultOpen);
  const Heading = `h${headingLevel}`;

  const toggle = (v) => {
    setOpen((cur) => {
      const next = cur.includes(v)
        ? cur.filter((x) => x !== v)
        : allowMultiple ? [...cur, v] : [v];
      onChange?.(next);
      return next;
    });
  };

  return (
    <div className="ds-acc">
      {items.map((item, i) => {
        const isOpen = open.includes(item.value);
        return (
          <div key={item.value} className={`ds-acc-item${isOpen ? " open" : ""}`}>
            <Heading className="ds-acc-heading">
              <button
                type="button" id={`${id}-trigger-${i}`} className="ds-acc-trigger"
                aria-expanded={isOpen} aria-controls={`${id}-panel-${i}`}
                onClick={() => toggle(item.value)}
              >
                <span className="ds-acc-label">{item.label}</span>
                <ChevronDown className="ds-acc-chev" size={17} aria-hidden="true" />
              </button>
            </Heading>
            <div
              id={`${id}-panel-${i}`} role="region"
              aria-labelledby={`${id}-trigger-${i}`}
              className="ds-acc-panel" hidden={!isOpen}
            >
              <div className="ds-acc-body">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const ACCORDION_CSS = `
.ds-acc{display:flex;flex-direction:column;border:.5px solid var(--border);
  border-radius:min(calc(var(--radius) + 2px),14px);overflow:hidden;background:var(--surface)}
.ds-acc-item + .ds-acc-item{border-top:.5px solid var(--border)}
.ds-acc-heading{margin:0;font:inherit;font-weight:inherit}
.ds-acc-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:14px 16px;min-height:var(--target-touch);background:transparent;border:none;
  font-family:var(--font-body);font-size:var(--fs-base);font-weight:500;color:var(--text-1);
  text-align:left;cursor:pointer;transition:background .12s}
.ds-acc-trigger:hover{background:var(--accent-tint);color:var(--accent-on-tint)}
.ds-acc-trigger:focus-visible{outline:none;box-shadow:inset 0 0 0 2px var(--ring)}
.ds-acc-label{min-width:0}
.ds-acc-chev{flex-shrink:0;color:var(--text-2);transition:transform .15s}
.ds-acc-item.open .ds-acc-chev{transform:rotate(180deg);color:var(--accent-text)}
.ds-acc-body{padding:2px 16px 16px;font-family:var(--font-body);font-size:var(--fs-sm);
  color:var(--text-2);line-height:1.6}
@media (prefers-reduced-motion:reduce){
  .ds-acc-trigger,.ds-acc-chev{transition:none}
}
`;

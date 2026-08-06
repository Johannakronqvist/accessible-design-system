/*
  Conformance — the single source of truth for what the system satisfies (ok),
  partly supports (partial), or leaves to the app (app). It drives both the
  published accessibility statement and the automated test gate, so the claim
  made to auditors matches exactly what ships. Also houses the EAA-required
  feedback mechanism (AccessibilityFeedback).
*/

import { useState } from "react";
import { Send } from "lucide-react";
import { nextId } from "./id";

// Single source of truth: what the system satisfies (ok), partly supports
// (partial), or leaves to the app (app). Drives the statement + test gate.
export const CONFORMANCE = [
  {
    area: "Foundation — tokens, applies to every component",
    rows: [
      ["1.4.3", "Contrast (Minimum)", "AA", "ok", "Derived to ≥4.5:1 and re-checked whenever the brand color changes"],
      ["1.4.11", "Non-text Contrast", "AA", "ok", "--border-interactive and focus ring verified ≥3:1"],
      ["1.4.1", "Use of Color", "A", "ok", "States pair color with icon or text, never color alone"],
      ["1.4.12", "Text Spacing", "AA", "ok", "min-height layout, no fixed-height text containers"],
      ["1.4.10", "Reflow", "AA", "ok", "Fluid Grid collapses to one column; no 2D scroll to 320px"],
      ["1.4.4", "Resize Text", "AA", "ok", "Scales with browser zoom to 200% without clipping"],
      ["2.5.8", "Target Size (Minimum)", "AA", "ok", "24px floor on all controls; 44px on large and on touch"],
      ["2.3.3", "Animation from Interactions", "AAA", "ok", "prefers-reduced-motion disables transitions"],
    ],
  },
  {
    area: "Button",
    rows: [
      ["2.1.1", "Keyboard", "A", "ok", "Native button element, fully operable"],
      ["2.4.7", "Focus Visible", "AA", "ok", "Two-color focus ring via :focus-visible"],
      ["4.1.2", "Name, Role, Value", "A", "ok", "Native semantics; icon-only requires an accessible label"],
      ["4.1.3", "Status Messages", "AA", "ok", "Loading state sets aria-busy"],
    ],
  },
  {
    area: "Text input (Field)",
    rows: [
      ["1.3.1", "Info and Relationships", "A", "ok", "label/for and aria-describedby wire hint and error"],
      ["3.3.2", "Labels or Instructions", "A", "ok", "Required label plus optional hint slot"],
      ["3.3.1", "Error Identification", "A", "ok", "aria-invalid and a role=alert error region"],
      ["4.1.2", "Name, Role, Value", "A", "ok", "Native input semantics plus aria-required"],
      ["3.3.3", "Error Suggestion", "AA", "partial", "Component surfaces the message; the wording is yours"],
    ],
  },
  {
    area: "Textarea",
    rows: [
      ["1.3.1", "Info and Relationships", "A", "ok", "label/for plus aria-describedby wires the hint, counter and error"],
      ["4.1.3", "Status Messages", "AA", "ok", "The counter is a polite status region that only speaks near the limit"],
      ["3.3.1", "Error Identification", "A", "ok", "Overflowing a soft limit sets aria-invalid and shows an icon + message"],
      ["1.4.12", "Text Spacing", "AA", "ok", "min-height and vertical resize; never a fixed-height text container"],
    ],
  },
  {
    area: "Search field",
    rows: [
      ["1.3.1", "Info and Relationships", "A", "ok", "Wrapped in a role=search landmark around a labelled input"],
      ["2.1.1", "Keyboard", "A", "ok", "Enter searches, Escape clears; the browser's unreachable clear button is replaced"],
      ["4.1.2", "Name, Role, Value", "A", "ok", "The clear control is a button with an aria-label; focus returns to the input"],
      ["4.1.3", "Status Messages", "AA", "ok", "Result counts announced politely without moving focus"],
    ],
  },
  {
    area: "Password field",
    rows: [
      ["3.3.8", "Accessible Authentication (Minimum)", "AA", "ok", "Paste is never blocked, autocomplete is set, and a reveal toggle allows verification"],
      ["4.1.2", "Name, Role, Value", "A", "ok", "The reveal toggle is a button with aria-pressed and an action label"],
      ["3.3.2", "Labels or Instructions", "A", "ok", "Requirements are stated up front and described to the input"],
      ["1.4.1", "Use of Color", "A", "ok", "Each requirement pairs an icon and text with its met state"],
      ["4.1.3", "Status Messages", "AA", "ok", "A polite summary reports how many rules are met"],
    ],
  },
  {
    area: "Slider (range)",
    rows: [
      ["2.5.7", "Dragging Movements", "AA", "ok", "Native range: arrows, Home/End, Page Up/Down and track clicks — no drag required"],
      ["2.5.1", "Pointer Gestures", "A", "ok", "Single-pointer operation; no path-based gesture"],
      ["4.1.2", "Name, Role, Value", "A", "ok", "Native slider role with min, max, step and aria-valuetext"],
      ["2.5.8", "Target Size (Minimum)", "AA", "ok", "24px thumb"],
      ["1.4.11", "Non-text Contrast", "AA", "ok", "Filled track, empty track and thumb border verified ≥3:1"],
    ],
  },
  {
    area: "File upload",
    rows: [
      ["2.5.7", "Dragging Movements", "AA", "ok", "Drag and drop is an enhancement; the file input and its label do the same job"],
      ["2.1.1", "Keyboard", "A", "ok", "The input stays in the tab order and is activated from its label"],
      ["2.4.7", "Focus Visible", "AA", "ok", "The visually hidden input draws its focus ring on the label"],
      ["2.5.3", "Label in Name", "A", "ok", "The input is named after the field and the visible button text"],
      ["3.3.1", "Error Identification", "A", "ok", "Type and size rejections surface as a role=alert message"],
      ["4.1.3", "Status Messages", "AA", "ok", "Added, rejected and removed files are announced politely"],
    ],
  },
  {
    area: "Number stepper",
    rows: [
      ["4.1.2", "Name, Role, Value", "A", "ok", "Native spinbutton semantics with min, max and step"],
      ["2.1.1", "Keyboard", "A", "ok", "Arrow keys and typing; the value clamps on blur, not mid-keystroke"],
      ["2.4.3", "Focus Order", "A", "ok", "At the bounds buttons use aria-disabled, so focus is never dropped mid-interaction"],
      ["3.3.2", "Labels or Instructions", "A", "ok", "The − and + buttons name what they change, not just a symbol"],
      ["2.5.8", "Target Size (Minimum)", "AA", "ok", "44px decrement and increment targets"],
    ],
  },
  {
    area: "Form group (fieldset)",
    rows: [
      ["1.3.1", "Info and Relationships", "A", "ok", "fieldset + legend group the controls; hint and error describe the group once"],
      ["3.3.7", "Redundant Entry", "A", "ok", "The sameAs slot offers previously entered information instead of asking for it again"],
      ["3.3.2", "Labels or Instructions", "A", "ok", "Group-level legend plus an optional hint slot"],
      ["4.1.3", "Status Messages", "AA", "ok", "Collapsing the group to a summary is announced politely"],
    ],
  },
  {
    area: "Selection controls (checkbox, radio, switch)",
    rows: [
      ["1.3.1", "Info and Relationships", "A", "ok", "Native inputs; radios grouped in a fieldset with a legend"],
      ["2.1.1", "Keyboard", "A", "ok", "Native controls, operated with Space and arrow keys"],
      ["2.4.7", "Focus Visible", "AA", "ok", "Shared focus ring on the visible control"],
      ["1.4.1", "Use of Color", "A", "ok", "Switch state shown by thumb position, not color alone"],
      ["2.5.8", "Target Size (Minimum)", "AA", "ok", "A 24px+ hit target wraps each small visual"],
      ["4.1.2", "Name, Role, Value", "A", "ok", "Native roles; the switch uses role=switch"],
    ],
  },
  {
    area: "Select (combobox / listbox)",
    rows: [
      ["4.1.2", "Name, Role, Value", "A", "ok", "role=combobox + listbox/option, aria-expanded / selected / activedescendant"],
      ["2.1.1", "Keyboard", "A", "ok", "Arrows, Home/End, type-ahead, Enter, Escape; focus returns to trigger"],
      ["2.4.7", "Focus Visible", "AA", "ok", "Focus ring on the trigger; active option highlighted"],
      ["1.4.1", "Use of Color", "A", "ok", "Selected option marked with a check, not color alone"],
      ["1.3.1", "Info and Relationships", "A", "ok", "Trigger labelled by the field label plus the current value"],
      ["2.4.11", "Focus Not Obscured", "AA", "partial", "Menu opens adjacent; keep your layout from covering it"],
    ],
  },
  {
    area: "Link",
    rows: [
      ["1.4.1", "Use of Color", "A", "ok", "Underlined by default, so a link in prose is never colour alone"],
      ["2.4.4", "Link Purpose (In Context)", "A", "partial", "Component renders the text; writing it meaningfully is yours"],
      ["3.2.5", "Change on Request", "AAA", "ok", "external announces the new tab in text and shows an icon"],
      ["2.4.7", "Focus Visible", "AA", "ok", "Two-colour focus ring via :focus-visible"],
    ],
  },
  {
    area: "Skip link",
    rows: [
      ["2.4.1", "Bypass Blocks", "A", "ok", "First stop in the tab order, jumping past repeated navigation"],
      ["2.4.7", "Focus Visible", "AA", "ok", "Hidden with transform, so it stays focusable and appears on focus"],
      ["2.4.11", "Focus Not Obscured (Minimum)", "AA", "ok", "Fixed at z-index 100, above sticky page chrome"],
    ],
  },
  {
    area: "Breadcrumbs",
    rows: [
      ["1.3.1", "Info and Relationships", "A", "ok", "An ordered list inside a labelled nav landmark"],
      ["2.4.8", "Location", "AAA", "ok", "The trail states where the page sits; the last item is aria-current=page"],
      ["4.1.2", "Name, Role, Value", "A", "ok", "Current page is text with aria-current, not a link to itself"],
      ["1.4.10", "Reflow", "AA", "ok", "The trail wraps instead of scrolling sideways"],
    ],
  },
  {
    area: "Pagination",
    rows: [
      ["4.1.2", "Name, Role, Value", "A", "ok", "Numbered buttons are labelled “Page 3”, not a bare digit"],
      ["1.4.1", "Use of Color", "A", "ok", "Current page pairs its tint with a weight step, plus aria-current"],
      ["2.4.3", "Focus Order", "A", "ok", "Ends use aria-disabled, so paging never drops focus onto the body"],
      ["2.5.8", "Target Size (Minimum)", "AA", "ok", "32px page targets, raised to 44px on coarse pointers"],
    ],
  },
  {
    area: "Tabs",
    rows: [
      ["4.1.2", "Name, Role, Value", "A", "ok", "tablist / tab / tabpanel with aria-selected and aria-controls"],
      ["2.1.1", "Keyboard", "A", "ok", "Arrows, Home / End; a roving tabindex keeps the list to one tab stop"],
      ["3.2.2", "On Input", "A", "ok", "activation=manual moves focus without selecting, for panels that load"],
      ["1.4.1", "Use of Color", "A", "ok", "Selected shows an indicator bar and weight change, not just colour"],
      ["2.4.7", "Focus Visible", "AA", "ok", "Ring on the tab, and on the panel when it takes focus"],
    ],
  },
  {
    area: "Accordion",
    rows: [
      ["1.3.1", "Info and Relationships", "A", "ok", "Each trigger sits in a heading at a caller-chosen level"],
      ["4.1.2", "Name, Role, Value", "A", "ok", "aria-expanded on the button; the panel is a region it labels"],
      ["2.1.1", "Keyboard", "A", "ok", "Native buttons, operated with Enter and Space"],
      ["1.4.1", "Use of Color", "A", "ok", "Open state shown by chevron rotation as well as colour"],
    ],
  },
  {
    area: "Menu (menu button)",
    rows: [
      ["4.1.2", "Name, Role, Value", "A", "ok", "aria-haspopup=menu with role menu / menuitem and aria-expanded"],
      ["2.1.1", "Keyboard", "A", "ok", "Arrows, Home / End, type-ahead, Enter / Space; Tab closes without trapping"],
      ["2.4.3", "Focus Order", "A", "ok", "Focus moves into the menu and returns to the trigger on Escape or select"],
      ["2.1.2", "No Keyboard Trap", "A", "ok", "Tab leaves the menu rather than cycling inside it"],
      ["2.4.11", "Focus Not Obscured", "AA", "partial", "Menu opens adjacent; keep your layout from covering it"],
    ],
  },
  {
    area: "Navbar / NavItem",
    rows: [
      ["1.3.1", "Info and Relationships", "A", "ok", "A banner header wrapping a labelled nav landmark and a list"],
      ["4.1.2", "Name, Role, Value", "A", "ok", "The active item carries aria-current=page"],
      ["1.4.1", "Use of Color", "A", "ok", "Active pairs accent with a weight step and an indicator bar"],
      ["2.4.3", "Focus Order", "A", "ok", "The collapsed panel returns focus to its toggle on Escape"],
      ["2.1.2", "No Keyboard Trap", "A", "ok", "The collapsed panel is a non-modal disclosure; Tab moves past it"],
    ],
  },
  {
    area: "SideNav",
    rows: [
      ["1.3.1", "Info and Relationships", "A", "ok", "One labelled nav; each group's list points at its own heading"],
      ["4.1.2", "Name, Role, Value", "A", "ok", "The active item carries aria-current=page"],
      ["1.4.1", "Use of Color", "A", "ok", "Active pairs accent with a weight step and a leading-edge bar"],
      ["2.4.1", "Bypass Blocks", "A", "app", "Pair with SkipLink so the nav can be skipped on every page"],
    ],
  },
  {
    area: "ToggleGroup (segmented control)",
    rows: [
      ["4.1.2", "Name, Role, Value", "A", "ok", "radiogroup / radio with aria-checked, not a row of pressed buttons"],
      ["2.1.1", "Keyboard", "A", "ok", "Arrows, Home / End; a roving tabindex keeps the group to one tab stop"],
      ["1.4.1", "Use of Color", "A", "ok", "The selected segment pairs its fill with a weight step"],
      ["2.5.8", "Target Size (Minimum)", "AA", "ok", "24px floor per segment, 44px at size=lg"],
    ],
  },
  {
    area: "Modal / Drawer",
    rows: [
      ["2.1.2", "No Keyboard Trap", "A", "ok", "Native dialog.showModal(); the browser owns the trap and releases it on close"],
      ["2.4.3", "Focus Order", "A", "ok", "Focus enters the dialog and returns to the opener when it closes"],
      ["2.4.11", "Focus Not Obscured (Minimum)", "AA", "ok", "Top-layer rendering; no ancestor's overflow, transform or z-index can clip it"],
      ["4.1.2", "Name, Role, Value", "A", "ok", "Native dialog semantics; the title labels it via aria-labelledby"],
      ["1.3.1", "Info and Relationships", "A", "ok", "Title is a real heading; the description is wired with aria-describedby"],
      ["2.5.8", "Target Size (Minimum)", "AA", "ok", "24px dismiss control with a visible focus ring"],
      ["1.4.10", "Reflow", "AA", "ok", "Capped at 92vw / 85vh and becomes a bottom sheet under 520px"],
    ],
  },
  {
    area: "Badge / Tag",
    rows: [
      ["1.4.3", "Contrast (Minimum)", "AA", "ok", "Soft and solid tones verified ≥4.5:1 in light and dark"],
      ["1.4.1", "Use of Color", "A", "ok", "The label text states the meaning; color only reinforces"],
      ["4.1.2", "Name, Role, Value", "A", "ok", "The removable tag's × is a button with an aria-label"],
      ["2.4.7", "Focus Visible", "AA", "ok", "The remove button shows a focus ring"],
    ],
  },
  {
    area: "Alert / Callout",
    rows: [
      ["1.4.1", "Use of Color", "A", "ok", "Icon + text convey severity; the enlarged icon is the non-color cue"],
      ["1.4.3", "Contrast (Minimum)", "AA", "ok", "Heading, body and icon verified ≥4.5:1 in light and dark"],
      ["4.1.3", "Status Messages", "AA", "ok", "live=assertive / polite maps to role alert / status for dynamic alerts"],
      ["4.1.2", "Name, Role, Value", "A", "ok", "The dismiss control is a button with an aria-label"],
      ["2.4.7", "Focus Visible", "AA", "ok", "The dismiss button shows a focus ring"],
    ],
  },
  {
    area: "Your responsibility — content and context",
    rows: [
      ["1.1.1", "Non-text Content", "A", "app", "Provide alt text for meaningful images and icons"],
      ["1.3.1", "Info and Relationships", "A", "app", "Correct heading order and reading sequence per page"],
      ["3.1.1", "Language of Page", "A", "app", "Set the lang attribute on the document"],
      ["1.2.2", "Captions / audio description", "AA", "app", "Provide for any media you ship"],
      ["4.1.2", "Name, Role, Value", "A", "app", "Test full flows with real assistive technology"],
    ],
  },
];

export function StatusBadge({ s }) {
  const map = {
    ok: { t: "Built in", bg: "#15803D", c: "#fff" },
    partial: { t: "Partial", bg: "#8F4708", c: "#fff" },
    app: { t: "Your part", bg: "transparent", c: "var(--text-2)", b: true },
  };
  const m = map[s] || map.app;
  return <span className="ds-badge" style={{ background: m.bg, color: m.c, border: m.b ? ".5px solid var(--border)" : "none" }}>{m.t}</span>;
}

export function AccessibilityFeedback({ email = "accessibility@your-company.example" }) {
  const [id] = useState(() => nextId("ds-fb"));
  const [msg, setMsg] = useState("");
  const href = `mailto:${email}?subject=${encodeURIComponent("Accessibility feedback")}&body=${encodeURIComponent(msg)}`;
  const empty = !msg.trim();
  return (
    <div className="ds-card" style={{ maxWidth: 520 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--fs-lg)", color: "var(--text-1)", marginBottom: 6 }}>
        Report an accessibility problem
      </div>
      <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-2)", lineHeight: 1.55, margin: "0 0 14px" }}>
        The EAA requires a way for people to report barriers. Tell us what went wrong and we will respond.
      </p>
      <div className="ds-field" style={{ marginBottom: 14 }}>
        <label htmlFor={id} className="ds-field-label">What happened?</label>
        <textarea id={id} className="ds-input ds-textarea" value={msg} onChange={(e) => setMsg(e.target.value)}
          placeholder="Describe the issue and where you found it" />
      </div>
      <a className="ds-btn primary md" href={href} aria-disabled={empty || undefined}
        style={{ textDecoration: "none", ...(empty ? { pointerEvents: "none", opacity: 0.55 } : {}) }}>
        <Send size={16} aria-hidden="true" /> Send feedback
      </a>
    </div>
  );
}

export const CONF_CSS = `
.ds-table{width:100%;border-collapse:collapse;font-size:var(--fs-sm)}
.ds-table caption{text-align:left;font-family:var(--font-body);font-weight:500;color:var(--text-1);
  font-size:var(--fs-base);margin-bottom:10px}
.ds-table th,.ds-table td{text-align:left;padding:9px 10px;border-bottom:.5px solid var(--border);vertical-align:top}
.ds-table th{color:var(--text-2);font-weight:500}
.ds-crit{font-family:ui-monospace,monospace;white-space:nowrap;color:var(--text-1)}
.ds-badge{display:inline-block;font-size:11px;font-weight:500;padding:1px 8px;border-radius:6px;white-space:nowrap}
`;

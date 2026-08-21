/*
  Behaviour tests - the half axe cannot see.

  Each block guards a specific claim made in CONFORMANCE (./Conformance.jsx).
  If a test here fails, a row in the published accessibility statement has
  become untrue, which is the point: the map and the code are meant to move
  together. Criterion numbers are named in the test titles so the link is
  traceable in both directions.
*/

import { useRef } from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, afterEach } from "vitest";

import { Textarea } from "../Textarea";
import { SearchField } from "../SearchField";
import { PasswordField } from "../PasswordField";
import { Slider, SLIDER_CSS } from "../Slider";
import { FileUpload } from "../FileUpload";
import { NumberStepper } from "../NumberStepper";
import { FormGroup } from "../FormGroup";
import { Field } from "../Field";
import { Select } from "../Select";
import { Link } from "../Link";
import { Breadcrumbs } from "../Breadcrumbs";
import { Pagination, pageList } from "../Pagination";
import { Tabs, TABS_CSS } from "../Tabs";
import { Accordion } from "../Accordion";
import { Menu } from "../Menu";
import { Navbar } from "../Navbar";
import { SideNav } from "../SideNav";
import { ToggleGroup } from "../ToggleGroup";
import { Modal, Drawer } from "../Modal";
import { Button } from "../Button";
import { ThemeProvider, buildTheme, useTheme } from "../ThemeProvider";
import { Card } from "../Card";
import { Avatar } from "../Avatar";
import { Spinner } from "../Spinner";
import { Divider } from "../Divider";
import { Heading, Text } from "../Typography";
import { VisuallyHidden } from "../VisuallyHidden";
import { contrast, hexToRgb, suggestTextColors, deriveTextPair } from "../color";
import StyleGuide from "../StyleGuide";
import { SEL_CSS } from "../SelectionControls";

/* ------------------------------------------------------------ Select */

describe("Select - 2.1.1 Keyboard, 4.1.2 Name Role Value", () => {
  const options = [
    { value: "free", label: "Free" },
    { value: "team", label: "Team" },
    { value: "pro", label: "Pro" },
  ];
  const setup = (props = {}) => {
    render(<Select label="Plan" options={options} {...props} />);
    return screen.getByRole("combobox");
  };

  test("opens with Enter and closes with Escape, returning focus to the trigger", async () => {
    const user = userEvent.setup();
    const trigger = setup();
    trigger.focus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test("opens with ArrowDown and moves the active option with the arrows", async () => {
    const user = userEvent.setup();
    const trigger = setup();
    trigger.focus();

    await user.keyboard("{ArrowDown}");
    expect(trigger).toHaveAttribute("aria-activedescendant", expect.stringContaining("-opt-0"));

    await user.keyboard("{ArrowDown}");
    expect(trigger).toHaveAttribute("aria-activedescendant", expect.stringContaining("-opt-1"));

    await user.keyboard("{ArrowUp}");
    expect(trigger).toHaveAttribute("aria-activedescendant", expect.stringContaining("-opt-0"));
  });

  test("Home and End jump to the first and last option", async () => {
    const user = userEvent.setup();
    const trigger = setup();
    trigger.focus();
    await user.keyboard("{ArrowDown}{End}");
    expect(trigger).toHaveAttribute("aria-activedescendant", expect.stringContaining("-opt-2"));
    await user.keyboard("{Home}");
    expect(trigger).toHaveAttribute("aria-activedescendant", expect.stringContaining("-opt-0"));
  });

  test("type-ahead jumps to a matching option", async () => {
    const user = userEvent.setup();
    const trigger = setup();
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await user.keyboard("p");
    expect(trigger).toHaveAttribute("aria-activedescendant", expect.stringContaining("-opt-2"));
  });

  test("Enter selects, and the choice is marked with aria-selected not colour", async () => {
    const user = userEvent.setup();
    const trigger = setup();
    trigger.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(trigger).toHaveTextContent("Team");

    await user.keyboard("{Enter}");
    const chosen = within(screen.getByRole("listbox")).getByRole("option", { name: /Team/ });
    expect(chosen).toHaveAttribute("aria-selected", "true");
  });

  test("a disabled select cannot be opened", async () => {
    const user = userEvent.setup();
    const trigger = setup({ disabled: true });
    await user.click(trigger);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------ PasswordField */

describe("PasswordField - 3.3.8 Accessible Authentication", () => {
  test("the reveal toggle flips the input type, aria-pressed and its label", async () => {
    const user = userEvent.setup();
    render(<PasswordField label="Password" />);
    const input = document.querySelector("input[type=password]");
    const toggle = screen.getByRole("button", { name: "Show password" });

    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);

    expect(input).toHaveAttribute("type", "text");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();
  });

  test("pasting is never intercepted", async () => {
    const user = userEvent.setup();
    render(<PasswordField label="Password" />);
    const input = document.querySelector("input[type=password]");
    await user.click(input);
    await user.paste("correct horse battery staple");
    expect(input).toHaveValue("correct horse battery staple");
  });

  test("autoComplete is set so password managers can fill and save", () => {
    render(<PasswordField label="New password" autoComplete="new-password" />);
    expect(document.querySelector("input[type=password]")).toHaveAttribute("autocomplete", "new-password");
  });

  test("requirements track typing and state met-ness in text, not colour alone", async () => {
    const user = userEvent.setup();
    render(
      <PasswordField label="New password" requirements={[
        { label: "At least 8 characters", test: (v) => v.length >= 8 },
        { label: "A number", test: (v) => /\d/.test(v) },
      ]} />
    );
    const input = document.querySelector("input[type=password]");
    expect(screen.getByText("At least 8 characters").closest("li")).toHaveTextContent("not met yet");

    await user.type(input, "hunter2xy");
    expect(screen.getByText("At least 8 characters").closest("li")).toHaveTextContent("met");
    expect(screen.getByText("A number").closest("li")).toHaveTextContent("met");
  });
});

/* ------------------------------------------------------------ Textarea */

describe("Textarea - 4.1.3 Status Messages, 3.3.1 Error Identification", () => {
  test("the counter tracks typing and is described to the field", async () => {
    const user = userEvent.setup();
    render(<Textarea label="Bio" maxLength={20} showCount />);
    const box = screen.getByLabelText("Bio");
    await user.type(box, "hello");
    expect(screen.getByText("5 / 20")).toBeInTheDocument();
    expect(box.getAttribute("aria-describedby")).toContain("count");
  });

  test("a hard limit truncates; a soft limit flags instead", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Textarea label="Hard" maxLength={5} showCount />);
    await user.type(screen.getByLabelText("Hard"), "abcdefghij");
    expect(screen.getByLabelText("Hard")).toHaveValue("abcde");
    expect(screen.getByLabelText("Hard")).not.toHaveAttribute("aria-invalid");
    unmount();

    render(<Textarea label="Soft" maxLength={5} showCount enforceMax={false} />);
    const soft = screen.getByLabelText("Soft");
    await user.type(soft, "abcdefgh");
    expect(soft).toHaveValue("abcdefgh");
    expect(soft).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("3 characters over the limit.");
  });
});

/* ------------------------------------------------------------ SearchField */

describe("SearchField - 2.1.1 Keyboard, 4.1.2 Name Role Value", () => {
  test("the clear button appears only when there is something to clear", async () => {
    const user = userEvent.setup();
    render(<SearchField label="Search" />);
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
    await user.type(screen.getByRole("searchbox"), "jane");
    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
  });

  test("clearing empties the field and returns focus to it", async () => {
    const user = userEvent.setup();
    render(<SearchField label="Search" defaultValue="jane" />);
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
  });

  test("Escape clears in place and Enter submits the term", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchField label="Search" defaultValue="jane" onSearch={onSearch} />);
    const input = screen.getByRole("searchbox");

    await user.click(input);
    await user.keyboard("{Enter}");
    expect(onSearch).toHaveBeenCalledWith("jane");

    await user.keyboard("{Escape}");
    expect(input).toHaveValue("");
  });

  test("the landmark is named, so several searches stay distinguishable", () => {
    render(<SearchField label="Search team" />);
    expect(screen.getByRole("search", { name: "Search team" })).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------ Slider */

describe("Slider - 2.5.7 Dragging Movements, 4.1.2 Name Role Value", () => {
  /*
    Note on what is testable here. Arrow / Home / End / Page Up / Down on a range
    input are implemented by the *browser*, not by this component - that is
    precisely the argument for using a native range to satisfy 2.5.7. jsdom has no
    such implementation, so simulating those keys proves nothing. What these tests
    can prove is that the element really is a native range (so a browser will
    supply that behaviour) and that value changes flow through the component
    correctly. Actual key operation stays on the manual list in
    conformance-setup.md §3.
  */
  test("is a native range input, so the browser supplies drag-free operation", () => {
    render(<Slider label="Volume" min={0} max={10} step={2} defaultValue={5} />);
    const slider = screen.getByRole("slider", { name: "Volume" });

    expect(slider.tagName).toBe("INPUT");
    expect(slider).toHaveAttribute("type", "range");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "10");
    expect(slider).toHaveAttribute("step", "2");
    expect(slider).not.toBeDisabled();
  });

  test("a value change flows through to the readout, the fill and onChange", () => {
    const onChange = vi.fn();
    render(
      <Slider label="Budget" min={0} max={100} defaultValue={20}
        formatValue={(v) => `$${v}`} onChange={onChange} />
    );
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "70" } });

    expect(slider).toHaveValue("70");
    expect(onChange).toHaveBeenCalledWith(70);
    expect(screen.getByText("$70")).toBeInTheDocument();
    expect(slider.style.getPropertyValue("--pct")).toBe("70%");
  });

  test("formatValue drives aria-valuetext so the announcement matches the label", () => {
    render(
      <Slider label="Density" min={1} max={3} defaultValue={2}
        formatValue={(v) => ["Compact", "Cozy", "Roomy"][v - 1]} />
    );
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "Cozy");
  });

  test("a plain numeric slider leaves aria-valuetext off", () => {
    render(<Slider label="Volume" min={0} max={10} defaultValue={5} />);
    expect(screen.getByRole("slider")).not.toHaveAttribute("aria-valuetext");
  });
});

/* ------------------------------------------------------------ FileUpload */

describe("FileUpload - 2.5.7 Dragging Movements, 3.3.1 Error Identification", () => {
  const pdf = (name = "brief.pdf") => new File(["x"], name, { type: "application/pdf" });

  test("the file input stays in the tab order - dragging is never the only route", () => {
    render(<FileUpload label="Attachments" />);
    const input = document.querySelector("input[type=file]");
    expect(input).not.toHaveAttribute("hidden");
    expect(input).not.toBeDisabled();
    // A <label for> pointing at it means click and keyboard both reach the picker.
    expect(document.querySelector(`label[for="${input.id}"]`)).toBeInTheDocument();
  });

  test("the input is named after the field and the visible button text (2.5.3)", () => {
    render(<FileUpload label="Attachments" buttonLabel="Choose file" />);
    expect(screen.getByLabelText(/Attachments Choose file/)).toBeInTheDocument();
  });

  test("choosing a file lists it with a labelled remove button, which removes it", async () => {
    const user = userEvent.setup();
    render(<FileUpload label="Attachments" accept=".pdf" />);
    await user.upload(document.querySelector("input[type=file]"), pdf());

    expect(screen.getByText("brief.pdf")).toBeInTheDocument();
    const remove = screen.getByRole("button", { name: "Remove brief.pdf" });
    await user.click(remove);
    expect(screen.queryByText("brief.pdf")).not.toBeInTheDocument();
  });

  test("a rejected file type surfaces as a role=alert message", () => {
    render(<FileUpload label="Attachments" accept=".pdf" />);
    const input = document.querySelector("input[type=file]");
    // fireEvent rather than user.upload, which itself enforces `accept`.
    fireEvent.change(input, { target: { files: [new File(["x"], "notes.exe", { type: "application/x-msdownload" })] } });
    expect(screen.getByRole("alert")).toHaveTextContent("not an accepted file type");
  });

  test("dropping files adds them, so drag and drop stays an equal path", () => {
    render(<FileUpload label="Attachments" accept=".pdf" multiple />);
    const zone = document.querySelector(".ds-file-zone");
    fireEvent.drop(zone, { dataTransfer: { files: [pdf("a.pdf"), pdf("b.pdf")] } });
    expect(screen.getByText("a.pdf")).toBeInTheDocument();
    expect(screen.getByText("b.pdf")).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------ NumberStepper */

describe("NumberStepper - 2.4.3 Focus Order, 4.1.2 Name Role Value", () => {
  test("the buttons step the value and are named after what they change", async () => {
    const user = userEvent.setup();
    render(<NumberStepper label="Seats" min={1} max={10} defaultValue={5} />);
    const input = screen.getByLabelText("Seats");

    await user.click(screen.getByRole("button", { name: "Increase Seats" }));
    expect(input).toHaveValue(6);
    await user.click(screen.getByRole("button", { name: "Decrease Seats" }));
    expect(input).toHaveValue(5);
  });

  test("at a bound the button reports aria-disabled but keeps its place in the tab order", async () => {
    const user = userEvent.setup();
    render(<NumberStepper label="Seats" min={1} max={5} defaultValue={5} />);
    const inc = screen.getByRole("button", { name: "Increase Seats" });

    expect(inc).toHaveAttribute("aria-disabled", "true");
    expect(inc).not.toBeDisabled(); // the whole point: focus is never dropped
    inc.focus();
    expect(inc).toHaveFocus();

    await user.click(inc);
    expect(screen.getByLabelText("Seats")).toHaveValue(5); // and it no-ops
  });

  test("typing is left alone until blur, then clamped", async () => {
    const user = userEvent.setup();
    render(<NumberStepper label="Seats" min={5} max={50} defaultValue={10} />);
    const input = screen.getByLabelText("Seats");

    await user.clear(input);
    await user.type(input, "12");
    expect(input).toHaveValue(12); // not clamped up to the minimum mid-keystroke

    await user.tab();
    expect(input).toHaveValue(12);

    await user.clear(input);
    await user.type(input, "2");
    await user.tab();
    expect(input).toHaveValue(5); // clamped on blur
  });

  test("a decimal step does not accumulate floating-point drift", async () => {
    const user = userEvent.setup();
    render(<NumberStepper label="Hours" min={0} max={5} step={0.1} defaultValue={0.1} />);
    await user.click(screen.getByRole("button", { name: "Increase Hours" }));
    expect(screen.getByLabelText("Hours")).toHaveValue(0.2); // not 0.30000000000000004
  });
});

/* ------------------------------------------------------------ FormGroup */

describe("FormGroup - 3.3.7 Redundant Entry, 1.3.1 Info and Relationships", () => {
  const group = (defaultChecked) => (
    <FormGroup legend="Billing address" variant="card"
      sameAs={{ label: "Same as shipping address", defaultChecked, summary: "12 Rosewood Lane" }}>
      <Field label="Street" />
      <Field label="City" />
    </FormGroup>
  );

  test("checking sameAs unmounts the fields, so they leave the tab order entirely", async () => {
    const user = userEvent.setup();
    render(group(false));
    expect(screen.getByLabelText("Street")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Same as shipping address"));
    expect(screen.queryByLabelText("Street")).not.toBeInTheDocument();
    expect(screen.getByText("12 Rosewood Lane")).toBeInTheDocument();
  });

  test("unchecking restores them", async () => {
    const user = userEvent.setup();
    render(group(true));
    expect(screen.queryByLabelText("Street")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Same as shipping address"));
    expect(screen.getByLabelText("Street")).toBeInTheDocument();
  });

  test("the group is a named fieldset whose hint describes it once", () => {
    render(
      <FormGroup legend="Shipping address" hint="Where the order should go.">
        <Field label="Street" />
      </FormGroup>
    );
    const fieldset = screen.getByRole("group", { name: /Shipping address/ });
    expect(fieldset.tagName).toBe("FIELDSET");
    expect(fieldset).toHaveAccessibleDescription("Where the order should go.");
  });
});

/* ------------------------------------------------------------ Link */

describe("Link - 1.4.1 Use of Color, 3.2.5 Change on Request", () => {
  test("is underlined by default, so prose links are not colour alone", () => {
    render(<Link href="#a">Read more</Link>);
    expect(screen.getByRole("link")).not.toHaveClass("hover-only");
  });

  test("underline='hover' opts out, for places position already distinguishes", () => {
    render(<Link href="#a" underline="hover">Read more</Link>);
    expect(screen.getByRole("link")).toHaveClass("hover-only");
  });

  test("external announces the new tab in text and hardens rel", () => {
    render(<Link href="https://example.com" external>Docs</Link>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    // The warning is real text, not a title attribute, so it is announced.
    expect(link).toHaveAccessibleName("Docs (opens in a new tab)");
  });

  test("a plain link carries no target and no warning", () => {
    render(<Link href="#a">Docs</Link>);
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
    expect(link).toHaveAccessibleName("Docs");
  });
});

/* ------------------------------------------------------------ Breadcrumbs */

describe("Breadcrumbs - 1.3.1 Info and Relationships, 2.4.8 Location", () => {
  const trail = [
    { label: "Home", href: "#home" },
    { label: "Components", href: "#components" },
    { label: "Breadcrumbs" },
  ];

  test("is an ordered list inside a named nav landmark", () => {
    render(<Breadcrumbs items={trail} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getByRole("list").tagName).toBe("OL");
    expect(within(nav).getAllByRole("listitem")).toHaveLength(3);
  });

  test("the current page is text with aria-current, not a link to itself", () => {
    render(<Breadcrumbs items={trail} />);
    expect(screen.getAllByRole("link")).toHaveLength(2); // not 3
    const current = screen.getByText("Breadcrumbs");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current.tagName).not.toBe("A");
  });
});

/* ------------------------------------------------------------ Pagination */

describe("Pagination - 4.1.2 Name Role Value, 2.4.3 Focus Order", () => {
  test("numbered buttons are named 'Page n', not a bare digit", () => {
    render(<Pagination count={5} defaultPage={2} />);
    expect(screen.getByRole("button", { name: "Page 3" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeInTheDocument();
  });

  test("the current page carries aria-current and moves as you page", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination count={5} defaultPage={2} onChange={onChange} />);
    const start = screen.getByRole("button", { name: "Page 2" });
    expect(start).toHaveAttribute("aria-current", "page");
    // .current carries the weight step that keeps the marker off colour alone;
    // the rendered weight itself is a manual check, since jsdom applies no CSS.
    expect(start).toHaveClass("current");

    await user.click(screen.getByRole("button", { name: "Page 4" }));
    expect(screen.getByRole("button", { name: "Page 4" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Page 2" })).not.toHaveAttribute("aria-current");
    expect(onChange).toHaveBeenCalledWith(4);
  });

  test("Previous and Next step one page at a time", async () => {
    const user = userEvent.setup();
    render(<Pagination count={5} defaultPage={3} />);
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByRole("button", { name: "Page 4" })).toHaveAttribute("aria-current", "page");
    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute("aria-current", "page");
  });

  test("at an end the edge button reports aria-disabled but stays focusable", async () => {
    const user = userEvent.setup();
    render(<Pagination count={5} defaultPage={5} />);
    const next = screen.getByRole("button", { name: "Next page" });

    expect(next).toHaveAttribute("aria-disabled", "true");
    expect(next).not.toBeDisabled(); // focus is never dropped
    next.focus();
    expect(next).toHaveFocus();

    await user.click(next);
    expect(screen.getByRole("button", { name: "Page 5" })).toHaveAttribute("aria-current", "page");
  });

  test("pageList collapses long runs but always keeps the ends", () => {
    expect(pageList(1, 5, 1)).toEqual([1, 2, 3, 4, 5]);
    const long = pageList(12, 24, 1);
    expect(long[0]).toBe(1);
    expect(long[long.length - 1]).toBe(24);
    expect(long).toContain("start-gap");
    expect(long).toContain("end-gap");
    expect(long).toContain(12);
    // No duplicates, and numbers stay ascending.
    const nums = long.filter((p) => typeof p === "number");
    expect(new Set(nums).size).toBe(nums.length);
    expect([...nums].sort((a, b) => a - b)).toEqual(nums);
  });
});

/* ------------------------------------------------------------ Tabs */

describe("Tabs - 2.1.1 Keyboard, 3.2.2 On Input, 4.1.2 Name Role Value", () => {
  const items = [
    { value: "a", label: "Profile", content: "Profile panel" },
    { value: "b", label: "Billing", content: "Billing panel" },
    { value: "c", label: "Team", content: "Team panel" },
  ];

  test("wires tablist, tabs and the panel together", () => {
    render(<Tabs label="Settings" items={items} />);
    const list = screen.getByRole("tablist", { name: "Settings" });
    expect(within(list).getAllByRole("tab")).toHaveLength(3);

    const selected = screen.getByRole("tab", { selected: true });
    const panel = screen.getByRole("tabpanel");
    expect(selected).toHaveAccessibleName("Profile");
    expect(panel).toHaveAttribute("aria-labelledby", selected.id);
    expect(selected).toHaveAttribute("aria-controls", panel.id);
  });

  test("a roving tabindex keeps the tablist to one stop in the tab order", () => {
    render(<Tabs label="Settings" items={items} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("tabindex", "0");
    expect(tabs[1]).toHaveAttribute("tabindex", "-1");
    expect(tabs[2]).toHaveAttribute("tabindex", "-1");
  });

  test("automatic activation selects as the arrows move", async () => {
    const user = userEvent.setup();
    render(<Tabs label="Settings" items={items} />);
    screen.getAllByRole("tab")[0].focus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { selected: true })).toHaveAccessibleName("Billing");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Billing panel");
  });

  test("manual activation moves focus without selecting until Enter", async () => {
    const user = userEvent.setup();
    render(<Tabs label="Reports" items={items} activation="manual" />);
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();

    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveFocus();
    expect(screen.getByRole("tab", { selected: true })).toHaveAccessibleName("Profile"); // not yet switched

    await user.keyboard("{Enter}");
    expect(screen.getByRole("tab", { selected: true })).toHaveAccessibleName("Billing");
  });

  test("arrows wrap, and Home / End jump to the ends", async () => {
    const user = userEvent.setup();
    render(<Tabs label="Settings" items={items} />);
    screen.getAllByRole("tab")[0].focus();

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { selected: true })).toHaveAccessibleName("Team"); // wrapped

    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { selected: true })).toHaveAccessibleName("Profile");
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { selected: true })).toHaveAccessibleName("Team");
  });

  test("vertical orientation swaps the arrow axis", async () => {
    const user = userEvent.setup();
    render(<Tabs label="Settings" items={items} orientation="vertical" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    screen.getAllByRole("tab")[0].focus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("tab", { selected: true })).toHaveAccessibleName("Billing");
  });

  test("the panel is reachable by keyboard even with nothing focusable inside", () => {
    render(<Tabs label="Settings" items={items} />);
    expect(screen.getByRole("tabpanel")).toHaveAttribute("tabindex", "0");
  });
});

/* ------------------------------------------------------------ Accordion */

describe("Accordion - 1.3.1 Info and Relationships, 4.1.2 Name Role Value", () => {
  const items = [
    { value: "one", label: "First question", content: "First answer" },
    { value: "two", label: "Second question", content: "Second answer" },
  ];

  test("each trigger sits in a heading at the level the caller asked for", () => {
    render(<Accordion items={items} headingLevel={2} />);
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings).toHaveLength(2);
    expect(within(headings[0]).getByRole("button")).toHaveAccessibleName("First question");
  });

  test("toggling flips aria-expanded and reveals the labelled region", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    const trigger = screen.getByRole("button", { name: "First question" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("First answer")).not.toBeVisible();

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const region = screen.getByRole("region", { name: "First question" });
    expect(region).toBeVisible();
  });

  test("by default opening one closes the other", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} defaultOpen={["one"]} />);
    await user.click(screen.getByRole("button", { name: "Second question" }));

    expect(screen.getByRole("button", { name: "First question" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Second question" })).toHaveAttribute("aria-expanded", "true");
  });

  test("allowMultiple turns them into independent disclosures", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} allowMultiple defaultOpen={["one"]} />);
    await user.click(screen.getByRole("button", { name: "Second question" }));

    expect(screen.getByRole("button", { name: "First question" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Second question" })).toHaveAttribute("aria-expanded", "true");
  });
});

/* ------------------------------------------------------------ Menu */

describe("Menu - 2.1.1 Keyboard, 2.4.3 Focus Order, 4.1.2 Name Role Value", () => {
  const items = [
    { value: "rename", label: "Rename", onSelect: () => {} },
    { value: "duplicate", label: "Duplicate" },
    { value: "archive", label: "Archive", disabled: true },
    { separator: true },
    { value: "delete", label: "Delete", destructive: true },
  ];
  const open = async (user) => {
    const trigger = screen.getByRole("button", { name: /Actions/ });
    await user.click(trigger);
    return trigger;
  };

  test("the trigger declares the menu it controls", () => {
    render(<Menu label="Actions" items={items} />);
    const trigger = screen.getByRole("button", { name: /Actions/ });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("opening moves real focus onto the first item, unlike a listbox", async () => {
    const user = userEvent.setup();
    render(<Menu label="Actions" items={items} />);
    await open(user);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems).toHaveLength(4); // the separator is not a menuitem
    expect(menuItems[0]).toHaveFocus();
  });

  test("ArrowUp on the trigger opens onto the last item", async () => {
    const user = userEvent.setup();
    render(<Menu label="Actions" items={items} />);
    screen.getByRole("button", { name: /Actions/ }).focus();
    await user.keyboard("{ArrowUp}");

    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems[menuItems.length - 1]).toHaveFocus();
  });

  test("arrows wrap and Home / End jump to the ends", async () => {
    const user = userEvent.setup();
    render(<Menu label="Actions" items={items} />);
    await open(user);
    const menuItems = screen.getAllByRole("menuitem");

    await user.keyboard("{ArrowUp}");
    expect(menuItems[3]).toHaveFocus(); // wrapped to the end
    await user.keyboard("{Home}");
    expect(menuItems[0]).toHaveFocus();
    await user.keyboard("{End}");
    expect(menuItems[3]).toHaveFocus();
  });

  test("type-ahead jumps to a matching item", async () => {
    const user = userEvent.setup();
    render(<Menu label="Actions" items={items} />);
    await open(user);
    await user.keyboard("d");
    expect(screen.getAllByRole("menuitem")[1]).toHaveFocus(); // Duplicate
  });

  test("Escape closes and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Menu label="Actions" items={items} />);
    const trigger = await open(user);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test("choosing an item fires onSelect, closes, and returns focus", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Menu label="Actions" items={[{ value: "rename", label: "Rename", onSelect }]} />);
    const trigger = await open(user);

    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("rename");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test("a disabled item keeps its place but cannot be activated", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Menu label="Actions" items={[
      { value: "a", label: "Alpha" },
      { value: "b", label: "Blocked", disabled: true, onSelect },
    ]} />);
    await open(user);

    const blocked = screen.getByRole("menuitem", { name: "Blocked" });
    expect(blocked).toHaveAttribute("aria-disabled", "true");
    await user.click(blocked);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeInTheDocument(); // stays open
  });

  test("Tab closes without trapping focus (2.1.2)", async () => {
    const user = userEvent.setup();
    render(<Menu label="Actions" items={items} />);
    await open(user);
    await user.tab();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  test("a press outside dismisses without stealing focus back", async () => {
    const user = userEvent.setup();
    render(<><Menu label="Actions" items={items} /><button type="button">Elsewhere</button></>);
    const trigger = await open(user);

    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).not.toHaveFocus(); // outside press does not restore focus
  });
});

/* ------------------------------------------------------------ Select + useDismissable */

describe("Select - outside dismissal now comes from useDismissable", () => {
  test("a press outside closes the listbox", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Select label="Plan" options={[{ value: "a", label: "Alpha" }]} />
        <button type="button">Elsewhere</button>
      </>
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  test("Escape still closes and restores focus, handled on the trigger", async () => {
    const user = userEvent.setup();
    render(<Select label="Plan" options={[{ value: "a", label: "Alpha" }]} />);
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

/* ------------------------------------------------------------ Navbar / NavItem */

describe("Navbar - 1.3.1 Info and Relationships, 2.4.3 Focus Order", () => {
  const items = [
    { href: "#projects", label: "Projects" },
    { href: "#team", label: "Team" },
  ];

  test("is a banner wrapping a labelled nav landmark", () => {
    render(<Navbar brand="Acme" items={items} currentHref="#projects" />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
  });

  test("the active item carries aria-current and the current treatment", () => {
    render(<Navbar items={items} currentHref="#projects" />);
    const active = screen.getByRole("link", { name: "Projects" });
    expect(active).toHaveAttribute("aria-current", "page");
    expect(active).toHaveClass("current");
    expect(screen.getByRole("link", { name: "Team" })).not.toHaveAttribute("aria-current");
  });

  test("the collapsed panel toggles, and Escape returns focus to the toggle", async () => {
    const user = userEvent.setup();
    render(<Navbar items={items} currentHref="#team" />);
    const toggle = screen.getByRole("button", { name: "Menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  test("a press outside closes the collapsed panel", async () => {
    const user = userEvent.setup();
    render(<><Navbar items={items} /><button type="button">Elsewhere</button></>);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
  });
});

/* ------------------------------------------------------------ SideNav */

describe("SideNav - 1.3.1 Info and Relationships", () => {
  const groups = [
    { label: "Workspace", items: [{ href: "#o", label: "Overview" }, { href: "#m", label: "Members" }] },
    { label: "Account", items: [{ href: "#p", label: "Profile" }] },
  ];

  test("uses one landmark, with each group's list named by its own heading", () => {
    render(<SideNav groups={groups} currentHref="#m" />);
    expect(screen.getAllByRole("navigation")).toHaveLength(1);

    const lists = screen.getAllByRole("list");
    expect(lists).toHaveLength(2);
    expect(lists[0]).toHaveAccessibleName("Workspace");
    expect(lists[1]).toHaveAccessibleName("Account");
  });

  test("marks the active item with aria-current", () => {
    render(<SideNav groups={groups} currentHref="#m" />);
    expect(screen.getByRole("link", { name: "Members" })).toHaveAttribute("aria-current", "page");
  });

  test("headingLevel opts into real headings for the group labels", () => {
    render(<SideNav groups={groups} headingLevel={2} />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
  });
});

/* ------------------------------------------------------------ ToggleGroup */

describe("ToggleGroup - 2.1.1 Keyboard, 4.1.2 Name Role Value", () => {
  const options = [
    { value: "board", label: "Board" },
    { value: "list", label: "List" },
    { value: "calendar", label: "Calendar" },
  ];

  test("is a radiogroup, not a row of pressed buttons", () => {
    render(<ToggleGroup label="View" options={options} />);
    const group = screen.getByRole("radiogroup", { name: "View" });
    expect(within(group).getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "Board" })).toHaveAttribute("aria-checked", "true");
  });

  test("a roving tabindex keeps the whole group to one stop in the tab order", () => {
    render(<ToggleGroup label="View" options={options} defaultValue="list" />);
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("tabindex", "-1");
    expect(radios[1]).toHaveAttribute("tabindex", "0"); // the checked one
    expect(radios[2]).toHaveAttribute("tabindex", "-1");
  });

  test("arrows select and wrap, Home / End jump to the ends", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToggleGroup label="View" options={options} onChange={onChange} />);
    screen.getAllByRole("radio")[0].focus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "List" })).toHaveAttribute("aria-checked", "true");
    expect(onChange).toHaveBeenLastCalledWith("list");

    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "Calendar" })).toHaveAttribute("aria-checked", "true");

    await user.keyboard("{Home}");
    expect(screen.getByRole("radio", { name: "Board" })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{End}");
    expect(screen.getByRole("radio", { name: "Calendar" })).toHaveAttribute("aria-checked", "true");
  });

  test("clicking selects", async () => {
    const user = userEvent.setup();
    render(<ToggleGroup label="View" options={options} />);
    await user.click(screen.getByRole("radio", { name: "Calendar" }));
    expect(screen.getByRole("radio", { name: "Calendar" })).toHaveAttribute("aria-checked", "true");
  });

  test("icon-only segments still carry a name", () => {
    render(<ToggleGroup label="Mode" options={[
      { value: "light", label: "", ariaLabel: "Light mode" },
      { value: "dark", label: "", ariaLabel: "Dark mode" },
    ]} />);
    expect(screen.getByRole("radio", { name: "Light mode" })).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------ Modal / Drawer */

/*
  What is deliberately NOT tested here.

  The focus trap, the inert background and top-layer rendering are the browser's,
  and jsdom implements none of them - test/setup.js stubs showModal()/close() only
  far enough for React's logic to run. A test asserting "Tab stays inside" would be
  asserting the stub, not the component, and would pass whether or not the real
  thing worked. Those three live on the manual list in conformance-setup.md §3.

  What follows covers the parts that are genuinely ours.
*/
describe("Modal - 4.1.2 Name Role Value, 1.3.1 Info and Relationships", () => {
  test("the title labels the dialog and the description describes it", () => {
    render(
      <Modal open onClose={() => {}} title="Delete this project?"
        description="This cannot be undone." />
    );
    const dialog = screen.getByRole("dialog", { hidden: true });
    expect(dialog).toHaveAccessibleName("Delete this project?");
    expect(dialog).toHaveAccessibleDescription("This cannot be undone.");
  });

  test("the title is a real heading, at the level the caller asked for", () => {
    render(<Modal open onClose={() => {}} title="Settings" headingLevel={3} />);
    expect(screen.getByRole("heading", { level: 3, hidden: true })).toHaveTextContent("Settings");
  });

  test("opens and closes the native dialog from the open prop", () => {
    const { rerender } = render(<Modal open={false} onClose={() => {}} title="T" />);
    const dialog = document.querySelector("dialog");
    expect(dialog.open).toBe(false);

    rerender(<Modal open onClose={() => {}} title="T" />);
    expect(dialog.open).toBe(true);

    rerender(<Modal open={false} onClose={() => {}} title="T" />);
    expect(dialog.open).toBe(false);
  });

  test("a browser-initiated close reaches onClose, so React state stays in step", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="T" />);
    // Escape is handled by the browser, which surfaces it as a close event.
    document.querySelector("dialog").close();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("closing from React does not bounce onClose back again", () => {
    const onClose = vi.fn();
    const { rerender } = render(<Modal open onClose={onClose} title="T" />);
    rerender(<Modal open={false} onClose={onClose} title="T" />);
    expect(onClose).not.toHaveBeenCalled();
  });

  test("the dismiss control is a labelled button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="T" dismissLabel="Close dialog" />);
    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onClose).toHaveBeenCalled();
  });

  test("showDismiss={false} omits it, for flows that must be answered", () => {
    render(<Modal open onClose={() => {}} title="T" showDismiss={false} />);
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  test("a press on the backdrop dismisses, but a press inside does not", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="T"><p>Body</p></Modal>);

    await user.click(screen.getByText("Body"));
    expect(onClose).not.toHaveBeenCalled();

    // The backdrop is the dialog element itself; content sits in .ds-dialog-inner.
    await user.click(document.querySelector("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("dismissOnBackdrop={false} keeps it open", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="T" dismissOnBackdrop={false} />);
    await user.click(document.querySelector("dialog"));
    expect(onClose).not.toHaveBeenCalled();
  });

  test("initialFocus overrides where focus lands", () => {
    function Harness() {
      const ref = useRef(null);
      return (
        <Modal open onClose={() => {}} title="T" initialFocus={ref}>
          <button type="button">First</button>
          <button type="button" ref={ref}>Preferred</button>
        </Modal>
      );
    }
    render(<Harness />);
    expect(screen.getByRole("button", { name: "Preferred" })).toHaveFocus();
  });

  test("locks page scroll while open and restores it after", () => {
    const { rerender } = render(<Modal open={false} onClose={() => {}} title="T" />);
    const before = document.body.style.overflow;

    rerender(<Modal open onClose={() => {}} title="T" />);
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<Modal open={false} onClose={() => {}} title="T" />);
    expect(document.body.style.overflow).toBe(before);
  });
});

describe("Drawer", () => {
  test("is the same dialog, anchored to an edge", () => {
    render(<Drawer open onClose={() => {}} title="Filters" placement="left" />);
    const dialog = document.querySelector("dialog");
    expect(dialog).toHaveClass("drawer", "left");
    expect(dialog).toHaveAccessibleName("Filters");
  });
});

/* ------------------------------------------------------------ Button */

describe("Button - props reach the underlying element", () => {
  // Regression: Button had no onClick and no spread, so handlers were silently
  // dropped. Found when the Modal demo's triggers did nothing.
  test("onClick fires", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press</Button>);
    await user.click(screen.getByRole("button", { name: "Press" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("defaults to type=button, so it cannot accidentally submit a form", () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(<form onSubmit={onSubmit}><Button>Press</Button></form>);
    expect(screen.getByRole("button", { name: "Press" })).toHaveAttribute("type", "button");
  });

  test("type can still be set explicitly for real submit buttons", () => {
    render(<form><Button type="submit">Save</Button></form>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "submit");
  });

  test("disabled and loading both block activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<><Button disabled onClick={onClick}>A</Button><Button loading onClick={onClick}>B</Button></>);
    await user.click(screen.getByRole("button", { name: "A" }));
    await user.click(screen.getByRole("button", { name: "B" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------ onNavigate */

describe("Navbar / SideNav - onNavigate", () => {
  const items = [
    { href: "#projects", label: "Projects" },
    { href: "#team", label: "Team" },
  ];

  test("fires with the href and the event, so a router can take over", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Navbar items={items} currentHref="#projects" onNavigate={onNavigate} />);

    await user.click(screen.getByRole("link", { name: "Team" }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate.mock.calls[0][0]).toBe("#team");
    expect(onNavigate.mock.calls[0][1]).toHaveProperty("preventDefault");
  });

  test("without it the items stay plain anchors and the browser navigates", () => {
    render(<Navbar items={items} currentHref="#projects" />);
    expect(screen.getByRole("link", { name: "Team" })).toHaveAttribute("href", "#team");
  });

  test("choosing a destination closes the collapsed row", async () => {
    const user = userEvent.setup();
    render(<Navbar items={items} currentHref="#projects" onNavigate={() => {}} />);

    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Team" }));
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
  });

  test("SideNav takes the same prop", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <SideNav onNavigate={onNavigate} currentHref="#o"
        groups={[{ label: "Workspace", items: [{ href: "#o", label: "Overview" }, { href: "#m", label: "Members" }] }]} />
    );
    await user.click(screen.getByRole("link", { name: "Members" }));
    expect(onNavigate.mock.calls[0][0]).toBe("#m");
  });
});

/* ------------------------------------------------------------ ThemeProvider */

describe("Theme controls - text colour and manual overrides in the guide", () => {
  const foundations = () =>
    render(<StyleGuide initialPage="foundations" />);

  // The guide opts into loadFonts, which appends a <link> to the shared jsdom
  // document. Left behind it fails the ThemeProvider test further down that
  // asserts no font request happens unless asked.
  afterEach(() => {
    document.querySelectorAll("link[data-ds-fonts]").forEach((l) => l.remove());
  });

  // The override editor also has a row labelled "Body text", so the pickers are
  // reached through their groups and their ids rather than by label text alone.
  const overrideInput = (token) =>
    document.getElementById(`ds-ovr-${token.replace(/-/g, "")}`);

  test("offers suggested text colours as real controls, labelled with their ratio", async () => {
    foundations();
    const group = screen.getByRole("group", { name: /suggested body text colors/i });
    const chips = within(group).getAllByRole("button");
    expect(chips.length).toBeGreaterThan(2);
    // Each chip names itself and states its measured ratio, so the swatch is
    // never the only thing telling them apart (1.4.1).
    for (const chip of chips) {
      expect(chip.textContent).toMatch(/\d+\.\d+:1/);
      expect(chip).toHaveAttribute("aria-pressed");
    }
  });

  test("picking a suggestion changes the body text token", async () => {
    const user = userEvent.setup();
    foundations();
    const group = screen.getByRole("group", { name: /suggested body text colors/i });
    const forest = within(group).getByRole("button", { name: /forest/i });

    const before = document.querySelector(".ds-theme").style.getPropertyValue("--text-1");
    await user.click(forest);
    const after = document.querySelector(".ds-theme").style.getPropertyValue("--text-1");

    expect(after).not.toBe(before);
    expect(forest).toHaveAttribute("aria-pressed", "true");
  });

  test("a manual override is applied raw and flagged when it fails", async () => {
    foundations();
    const input = overrideInput("--text-1");

    // Nothing forced yet.
    expect(screen.getByText(/nothing overridden/i)).toBeInTheDocument();

    // A pale grey on the near-white page: nowhere near 4.5:1.
    fireEvent.input(input, { target: { value: "#eeeeee" } });

    const theme = document.querySelector(".ds-theme");
    expect(theme.style.getPropertyValue("--text-1")).toBe("#EEEEEE");
    // The point of the editor: it lets you do it, and then says so.
    expect(await screen.findByText(/below the bar/i)).toBeInTheDocument();
    expect(screen.getByText(/1 token forced/i)).toBeInTheDocument();
  });

  test("resetting an override puts the derived value back", async () => {
    const user = userEvent.setup();
    foundations();
    const input = overrideInput("--text-1");
    const theme = document.querySelector(".ds-theme");
    const derived = theme.style.getPropertyValue("--text-1");

    fireEvent.input(input, { target: { value: "#eeeeee" } });
    expect(theme.style.getPropertyValue("--text-1")).toBe("#EEEEEE");

    await user.click(screen.getByRole("button", { name: /reset all overrides/i }));
    expect(theme.style.getPropertyValue("--text-1")).toBe(derived);
    expect(screen.getByText(/nothing overridden/i)).toBeInTheDocument();
  });

  test("offers label colours for the brand surface, strongest first", () => {
    foundations();
    const group = screen.getByRole("group", { name: /suggested text on brand colors/i });
    const chips = within(group).getAllByRole("button");
    expect(chips.length).toBeGreaterThan(2);
    // White is the best contrast on the default rosewood, so it leads.
    expect(chips[0].textContent).toMatch(/white/i);
    for (const chip of chips) {
      expect(chip.textContent).toMatch(/\d+\.\d+:1/);
    }
  });

  test("picking a label colour changes the button ink, not the body text", async () => {
    const user = userEvent.setup();
    foundations();
    const theme = document.querySelector(".ds-theme");
    const bodyBefore = theme.style.getPropertyValue("--text-1");

    const group = screen.getByRole("group", { name: /suggested text on brand colors/i });
    await user.click(within(group).getByRole("button", { name: /slate/i }));

    expect(theme.style.getPropertyValue("--accent-on-fill")).not.toBe("#FFFFFF");
    expect(theme.style.getPropertyValue("--text-1")).toBe(bodyBefore);
  });

  test("a label colour that cannot work on the brand surface is snapped", () => {
    foundations();
    const theme = document.querySelector(".ds-theme");
    const fill = theme.style.getPropertyValue("--accent-fill");
    // Mid grey on the rosewood fill is nowhere near 4.5:1.
    fireEvent.input(document.getElementById("ds-oncolor"), { target: { value: "#8a8a8a" } });

    const ink = theme.style.getPropertyValue("--accent-on-fill");
    expect(ink.toUpperCase()).not.toBe("#8A8A8A");
    expect(contrast(hexToRgb(ink), hexToRgb(fill))).toBeGreaterThanOrEqual(4.5);
  });

  test("the border row is judged at 3:1, not 4.5:1", () => {
    foundations();
    // --border is a non-text boundary (1.4.11). Holding it to 4.5 would flag a
    // compliant border as a failure.
    const row = screen.getByText("--border-interactive").closest(".ds-ovr-row");
    expect(within(row).getByText(/non-text boundary/i)).toBeInTheDocument();
    expect(within(row).getByText("PASS")).toBeInTheDocument();
  });
});

describe("Text colour - suggestions and the derived pair", () => {
  const LIGHT = "#FCF8F5", DARK = "#1B1618";

  test("every suggestion clears AAA on a background that can support it", () => {
    for (const bg of [LIGHT, DARK, "#FFFFFF", "#000000"]) {
      const out = suggestTextColors(bg);
      expect(out.length).toBeGreaterThan(0);
      for (const { hex, ratio, meets } of out) {
        const measured = contrast(hexToRgb(hex), hexToRgb(bg));
        // The reported ratio has to be the real one, not a number next to a
        // swatch - the guide prints it as a fact about the colour.
        expect(measured, `${hex} on ${bg} reported`).toBeCloseTo(ratio, 5);
        expect(measured, `${hex} on ${bg}`).toBeGreaterThanOrEqual(7);
        expect(meets, `${hex} on ${bg} meets`).toBe(true);
      }
    }
  });

  test("a background that cannot reach AAA is reported, not papered over", () => {
    // Mid grey caps out around 5.2:1 against black - AAA is unreachable here
    // for any text colour, so every suggestion has to say so.
    const out = suggestTextColors("#7A7A7A");
    expect(out.length).toBeGreaterThan(0);
    for (const { hex, ratio, meets } of out) {
      expect(contrast(hexToRgb(hex), hexToRgb("#7A7A7A")), `${hex} reported`)
        .toBeCloseTo(ratio, 5);
      expect(meets, `${hex} meets`).toBe(false);
    }
  });

  test("suggestions are rich, not parked on the 7:1 floor", () => {
    // Starting the search mid-range returned washed-out mid-tones that passed
    // by a hair. Every suggestion should clear the bar with real room.
    const out = suggestTextColors(LIGHT, { accentHex: "#9E4A4E" });
    for (const { hex, ratio } of out) {
      expect(ratio, `${hex} headroom`).toBeGreaterThan(7.1);
    }
  });

  test("no duplicate swatches", () => {
    for (const bg of [LIGHT, DARK, "#FFFFFF", "#808080"]) {
      const hexes = suggestTextColors(bg).map((x) => x.hex);
      expect(new Set(hexes).size, `${bg} duplicates`).toBe(hexes.length);
    }
  });

  test("the brand suggestion follows the accent hue", () => {
    const green = suggestTextColors(LIGHT, { accentHex: "#2E6F5E" })
      .find((x) => x.label === "Brand");
    const [r, g, b] = hexToRgb(green.hex);
    expect(g).toBeGreaterThan(r);
    expect(g).toBeGreaterThan(b);
  });

  test("a text colour that already passes is left where it is", () => {
    const pair = deriveTextPair("#2A2320", LIGHT);
    expect(pair["--text-1"]).toBe("#2A2320");
  });

  test("a text colour that fails is moved the shortest distance that passes", () => {
    // Pale grey on a near-white page: unreadable taken literally.
    const pair = deriveTextPair("#DDDDDD", LIGHT);
    expect(pair["--text-1"]).not.toBe("#DDDDDD");
    expect(contrast(hexToRgb(pair["--text-1"]), hexToRgb(LIGHT))).toBeGreaterThanOrEqual(4.5);
  });

  test("the muted partner still clears AA", () => {
    for (const bg of [LIGHT, DARK]) {
      for (const pick of ["#2A2320", "#2E6F5E", "#DDDDDD", "#000000", "#FFFFFF"]) {
        const pair = deriveTextPair(pick, bg);
        expect(contrast(hexToRgb(pair["--text-2"]), hexToRgb(bg)),
          `${pick} on ${bg} secondary`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test("the muted partner is recessive, not a second primary", () => {
    // It should sit closer to the background than --text-1 does.
    const pair = deriveTextPair("#2A2320", LIGHT);
    const bg = hexToRgb(LIGHT);
    expect(contrast(hexToRgb(pair["--text-2"]), bg))
      .toBeLessThan(contrast(hexToRgb(pair["--text-1"]), bg));
  });

  test("every hue survives as a text colour, in both modes", () => {
    for (const bg of [LIGHT, DARK]) {
      for (const pick of ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"]) {
        const pair = deriveTextPair(pick, bg);
        expect(contrast(hexToRgb(pair["--text-1"]), hexToRgb(bg)),
          `${pick} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

describe("Brand-coloured shapes never carry a hardcoded ink", () => {
  /*
    The regression this guards: the checkmark, the indeterminate dash and the
    switch knob were literal #fff sitting on --accent-fill. That was safe only
    while the fill was forced above 4.5:1 against white. Once the fill became
    the brand colour as picked, a pale brand made all three invisible at 1.25:1.
    A source-level assertion because the bug lives in the stylesheet, not the DOM.
  */
  test("no literal white is painted on a brand-coloured surface", () => {
    for (const [name, css] of [
      ["SelectionControls", SEL_CSS],
      ["Slider", SLIDER_CSS],
      ["Tabs", TABS_CSS],
    ]) {
      expect(css, `${name} hardcodes white`).not.toMatch(/#fff\b/i);
      expect(css, `${name} hardcodes white`).not.toMatch(/#ffffff/i);
    }
  });

  test("the selection glyphs read from the marker ink token", () => {
    expect(SEL_CSS).toContain("var(--accent-on-marker)");
    // The shapes themselves are markers, not fills - a fill here would be the
    // bug coming back the other way round.
    expect(SEL_CSS).toContain("var(--accent-marker)");
    expect(SEL_CSS).not.toContain("var(--accent-fill)");
  });
});

describe("buildTheme - the marker, for brand colour used as a bare shape", () => {
  // --surface is the lighter page colour in both modes, so it is the harder
  // partner; a marker that clears it clears --bg for free.
  const surfaceOf = (mode) => (mode === "dark" ? "#251F21" : "#FFFFFF");

  const HUES = Array.from({ length: 24 }, (_, i) => {
    const h = i * 15;
    const c = 0.7, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = 0.5 - c / 2;
    const t = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h / 60) % 6];
    return "#" + t.map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("");
  });

  test("the marker clears 3:1 on the surface, for every hue and every grey", () => {
    const greys = Array.from({ length: 256 }, (_, i) =>
      "#" + [i, i, i].map((x) => x.toString(16).padStart(2, "0")).join(""));
    for (const mode of ["light", "dark"]) {
      const surface = hexToRgb(surfaceOf(mode));
      for (const accent of [...HUES, ...greys]) {
        const { vars } = buildTheme({ accent, mode });
        expect(contrast(hexToRgb(vars["--accent-marker"]), surface),
          `${accent} ${mode} marker`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  test("a glyph on the marker clears it, so the checkmark is never invisible", () => {
    for (const mode of ["light", "dark"]) {
      for (const accent of [...HUES, "#FFE81A", "#FFFFFF", "#000000", "#B9E4F0"]) {
        const { vars } = buildTheme({ accent, mode });
        expect(contrast(hexToRgb(vars["--accent-marker"]), hexToRgb(vars["--accent-on-marker"])),
          `${accent} ${mode} glyph`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test("a colour that already reads as a shape is not lifted at all", () => {
    // The common case, and the point of splitting the token rather than
    // adjusting everything: most brand colours come back untouched.
    for (const accent of ["#8D2A2F", "#9E4A4E", "#2E6F5E", "#1D4ED8", "#000000"]) {
      const { vars } = buildTheme({ accent });
      expect(vars["--accent-marker"], `${accent}`).toBe(accent.toUpperCase());
      expect(vars["--accent-marker"]).toBe(vars["--accent-fill"]);
    }
  });

  test("a colour too pale to read as a shape is lifted, and only the shape moves", () => {
    // Pale yellow: fine as a button (dark ink on it), invisible as a 2px rule.
    const { vars } = buildTheme({ accent: "#FFE81A" });
    expect(vars["--accent-fill"]).toBe("#FFE81A");        // the button is untouched
    expect(vars["--accent-marker"]).not.toBe("#FFE81A");  // the tab underline is not
    expect(contrast(hexToRgb(vars["--accent-marker"]), hexToRgb("#FFFFFF")))
      .toBeGreaterThanOrEqual(3);
  });

  test("the lift is minimal - it stops at 3:1 rather than going dark", () => {
    for (const accent of ["#FFE81A", "#B9E4F0", "#F5C0C0", "#FFFFFF"]) {
      const r = contrast(hexToRgb(buildTheme({ accent }).vars["--accent-marker"]), hexToRgb("#FFFFFF"));
      expect(r, `${accent} headroom`).toBeGreaterThanOrEqual(3);
      expect(r, `${accent} overshoot`).toBeLessThan(3.6);
    }
  });

  test("the accent badge follows a custom brand colour", () => {
    const { vars } = buildTheme({ accent: "#2E6F5E" });
    expect(vars["--bd-accent-lb"]).toBe(vars["--accent-fill"]);
    expect(vars["--bd-accent-lf"]).toBe(vars["--accent-on-fill"]);
    expect(contrast(hexToRgb(vars["--bd-accent-lb"]), hexToRgb(vars["--bd-accent-lf"])))
      .toBeGreaterThanOrEqual(4.5);
    // ...and the semantic tones do not move with it.
    expect(vars["--bd-success-lb"]).toBe(buildTheme().vars["--bd-success-lb"]);
  });

  test("without a custom brand colour the preset badge table is untouched", () => {
    expect(buildTheme().vars["--bd-accent-lb"]).toBe("#9E4A4E");
  });
});

describe("buildTheme - textColor and manual overrides", () => {
  test("textColor drives the text pair and holds AA", () => {
    const { vars } = buildTheme({ textColor: "#2E6F5E" });
    expect(vars["--text-1"]).not.toBe("#2A2320"); // not the preset any more
    expect(contrast(hexToRgb(vars["--text-1"]), hexToRgb(vars["--bg"]))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(hexToRgb(vars["--text-2"]), hexToRgb(vars["--bg"]))).toBeGreaterThanOrEqual(4.5);
  });

  test("an unusable text colour is snapped rather than accepted", () => {
    const { vars } = buildTheme({ textColor: "#F2F2F2" });
    expect(contrast(hexToRgb(vars["--text-1"]), hexToRgb(vars["--bg"]))).toBeGreaterThanOrEqual(4.5);
  });

  test("textColor and accent compose without fighting", () => {
    const { vars } = buildTheme({ accent: "#2E6F5E", textColor: "#3B2A55" });
    const bg = hexToRgb(vars["--bg"]);
    expect(contrast(hexToRgb(vars["--accent-fill"]), [255, 255, 255])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(hexToRgb(vars["--text-1"]), bg)).toBeGreaterThanOrEqual(4.5);
  });

  test("overrides are applied raw - that is the point of them", () => {
    const { vars } = buildTheme({ overrides: { "--accent-fill": "#FF0000" } });
    expect(vars["--accent-fill"]).toBe("#FF0000");
  });

  test("an override beats a derivation it collides with", () => {
    const { vars } = buildTheme({
      accent: "#2E6F5E",
      textColor: "#333333",
      overrides: { "--accent-fill": "#123456", "--text-1": "#654321" },
    });
    expect(vars["--accent-fill"]).toBe("#123456");
    expect(vars["--text-1"]).toBe("#654321");
  });

  test("an override beats an explicitly-set non-palette var", () => {
    // --radius has its own entry in vars, written after the token spread.
    const { vars } = buildTheme({ radius: "10px", overrides: { "--radius": "0px" } });
    expect(vars["--radius"]).toBe("0px");
  });

  test("overrides show up in tokens too, so readouts do not lie", () => {
    const { tokens } = buildTheme({ overrides: { "--text-1": "#FF0000" } });
    expect(tokens["--text-1"]).toBe("#FF0000");
  });

  test("no overrides leaves the theme exactly as it was", () => {
    const plain = buildTheme({ accent: "#2E6F5E" });
    const empty = buildTheme({ accent: "#2E6F5E", overrides: {} });
    expect(empty.vars).toEqual(plain.vars);
  });
});

describe("buildTheme - the pure token assembly", () => {
  test("emits the full variable set the components read", () => {
    const { vars } = buildTheme();
    // Palette, scale, shape, targets, fonts.
    expect(vars["--bg"]).toBeDefined();
    expect(vars["--accent-fill"]).toBeDefined();
    expect(vars["--fs-base"]).toBe("16px");
    expect(vars["--space-4"]).toBe("32px");
    expect(vars["--radius"]).toBe("10px");
    expect(vars["--target-min"]).toBe("24px");
    expect(vars["--target-touch"]).toBe("44px");
    expect(vars["--font-body"]).toContain("Open Sans");
    // The tone families Badge and Alert depend on.
    expect(vars["--bd-success-sb"]).toBeDefined();
    expect(vars["--al-danger-head"]).toBeDefined();
  });

  test("derives the type scale from one base and ratio", () => {
    const { vars, fontScale } = buildTheme({ baseSize: 20, ratio: 1.25 });
    expect(fontScale.base).toBe(20);
    expect(fontScale.sm).toBe(16); // 20 / 1.25
    expect(fontScale.lg).toBe(25); // 20 * 1.25
    expect(vars["--fs-3xl"]).toBe(`${Math.round(20 * 1.25 ** 4)}px`);
  });

  test("derives the spacing scale from one unit", () => {
    const { vars } = buildTheme({ spacingUnit: 4 });
    expect(vars["--space-1"]).toBe("4px");
    expect(vars["--space-8"]).toBe("32px");
  });

  test("dark mode swaps the palette and its tone tables", () => {
    const light = buildTheme({ mode: "light" });
    const dark = buildTheme({ mode: "dark" });
    expect(dark.mode).toBe("dark");
    expect(dark.vars["--bg"]).not.toBe(light.vars["--bg"]);
    expect(dark.vars["--al-info-bg"]).not.toBe(light.vars["--al-info-bg"]);
  });

  test("the brand colour is used exactly as picked, and the label adapts to it", () => {
    // Pale yellow. White text on it is 1.25:1, so the old derivation darkened
    // the fill to an olive; now the fill stands and the ink goes dark instead.
    const { vars } = buildTheme({ accent: "#FFE81A" });
    expect(vars["--accent-fill"]).toBe("#FFE81A");

    const fill = hexToRgb(vars["--accent-fill"]);
    const ink = hexToRgb(vars["--accent-on-fill"]);
    expect(vars["--accent-on-fill"]).not.toBe("#FFFFFF");
    expect(contrast(fill, ink)).toBeGreaterThanOrEqual(4.5);

    // --accent-text sits on the page, not on the fill, so it is still derived.
    const text = hexToRgb(vars["--accent-text"]);
    const bg = hexToRgb(vars["--bg"]);
    expect(contrast(text, bg)).toBeGreaterThanOrEqual(4.5);
  });

  test("a colour that already passes is never derived into a worse one", () => {
    // The regression this rule exists for: #8D2A2F went in at 8.4:1 against
    // white and came back at 4.6:1, a downgrade dressed up as a safety check.
    for (const accent of ["#8D2A2F", "#2E6F5E", "#1D4ED8", "#6E3236", "#000000"]) {
      const { vars } = buildTheme({ accent });
      expect(vars["--accent-fill"], `${accent} fill`).toBe(accent.toUpperCase());

      const picked = hexToRgb(accent);
      const bg = hexToRgb(vars["--bg"]);
      // Same for the on-page text token: if the pick clears the bar there, it
      // is kept rather than walked to something weaker.
      if (contrast(picked, bg) >= 4.5) {
        expect(vars["--accent-text"], `${accent} text`).toBe(accent.toUpperCase());
      }
    }
  });

  test("the same guarantee holds in dark mode", () => {
    const { vars } = buildTheme({ accent: "#FFE81A", mode: "dark" });
    expect(contrast(hexToRgb(vars["--accent-fill"]), hexToRgb(vars["--accent-on-fill"])))
      .toBeGreaterThanOrEqual(4.5);
    expect(contrast(hexToRgb(vars["--accent-text"]), hexToRgb(vars["--bg"]))).toBeGreaterThanOrEqual(4.5);
  });

  // The headline claim, tested across the whole input space rather than one
  // lucky sample: no colour anyone can type drops the system below AA.
  test("every hue, and neutrals, clear 4.5:1 in both modes", () => {
    const hues = Array.from({ length: 24 }, (_, i) => i * 15);
    const inputs = ["#000000", "#FFFFFF", "#808080", "#3A3A3A", "#F5F5F5"];
    for (const h of hues) {
      // hsl(h, 70%, 50%) as hex, to sample right around the colour wheel.
      const c = 0.7 * (1 - Math.abs(2 * 0.5 - 1)) || 0.7;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = 0.5 - c / 2;
      const t = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h / 60) % 6];
      inputs.push("#" + t.map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join(""));
    }

    for (const mode of ["light", "dark"]) {
      for (const accent of inputs) {
        const { vars } = buildTheme({ accent, mode });
        const bg = hexToRgb(vars["--bg"]);
        const ink = hexToRgb(vars["--accent-on-fill"]);

        // The fill is whatever was picked; the label is what has to clear it.
        expect(vars["--accent-fill"], `${accent} ${mode} kept`).toBe(accent.toUpperCase());
        expect(contrast(hexToRgb(vars["--accent-fill"]), ink),
          `${accent} ${mode} fill/ink`).toBeGreaterThanOrEqual(4.5);
        // Hover and active move the fill, so they have to clear it too.
        expect(contrast(hexToRgb(vars["--accent-fill-hover"]), ink),
          `${accent} ${mode} hover/ink`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(hexToRgb(vars["--accent-fill-active"]), ink),
          `${accent} ${mode} active/ink`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(hexToRgb(vars["--accent-text"]), bg),
          `${accent} ${mode} text`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(hexToRgb(vars["--accent-on-tint"]), hexToRgb(vars["--accent-tint"])),
          `${accent} ${mode} on-tint`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  // Regression: rgbToHsl reports h=0 for any grey, so flooring saturation the
  // way a chromatic input needs turned black, white and grey into red.
  test("a neutral brand colour derives greys, not red", () => {
    const grey = (hex) => {
      const [r, g, b] = hexToRgb(hex);
      return Math.max(r, g, b) - Math.min(r, g, b) <= 3;
    };
    for (const accent of ["#000000", "#FFFFFF", "#808080", "#3A3A3A"]) {
      const { vars } = buildTheme({ accent });
      expect(grey(vars["--accent-fill"]), `${accent} fill`).toBe(true);
      expect(grey(vars["--accent-tint"]), `${accent} tint`).toBe(true);
      expect(grey(vars["--accent-text"]), `${accent} text`).toBe(true);
    }
  });

  test("an extreme neutral is kept, with the ink flipping to suit it", () => {
    // Black used to be lifted to a mid grey so white text would fit. Picking
    // black now gets you black, with white on it - which is what was asked for.
    const black = buildTheme({ accent: "#000000" });
    expect(black.vars["--accent-fill"]).toBe("#000000");
    expect(black.vars["--accent-on-fill"]).toBe("#FFFFFF");

    const white = buildTheme({ accent: "#FFFFFF" });
    expect(white.vars["--accent-fill"]).toBe("#FFFFFF");
    expect(contrast(hexToRgb("#FFFFFF"), hexToRgb(white.vars["--accent-on-fill"])))
      .toBeGreaterThanOrEqual(4.5);
  });

  test("no colour exists that both inks fail on", () => {
    // The claim the "fill never moves" rule rests on: white fails only above
    // 0.1833 relative luminance, black only below 0.175, so one always works.
    for (let i = 0; i <= 255; i += 1) {
      const hex = "#" + [i, i, i].map((x) => x.toString(16).padStart(2, "0")).join("");
      const { vars } = buildTheme({ accent: hex });
      expect(contrast(hexToRgb(vars["--accent-fill"]), hexToRgb(vars["--accent-on-fill"])),
        `${hex} ink`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("a near-neutral with real warmth keeps its hue", () => {
    // 13% saturation is above the neutral threshold, so this stays warm.
    const { vars } = buildTheme({ accent: "#2A2320" });
    const [r, , b] = hexToRgb(vars["--accent-fill"]);
    expect(r).toBeGreaterThan(b);
  });
});

describe("ThemeProvider", () => {
  test("puts the variables and colour-scheme on the element it renders", () => {
    const { container } = render(<ThemeProvider mode="dark"><span>Hi</span></ThemeProvider>);
    const root = container.firstChild;
    expect(root).toHaveClass("ds-theme");
    expect(root.style.getPropertyValue("--bg")).toBe("#1B1618");
    expect(root.style.colorScheme).toBe("dark");
  });

  test("keeps a caller's className and renders the tag it is asked for", () => {
    const { container } = render(<ThemeProvider as="section" className="app">x</ThemeProvider>);
    expect(container.firstChild.tagName).toBe("SECTION");
    expect(container.firstChild).toHaveClass("ds-theme", "app");
  });

  test("does not request fonts unless asked", () => {
    render(<ThemeProvider>x</ThemeProvider>);
    expect(document.querySelector("link[data-ds-fonts]")).toBeNull();
  });

  // Regression: the guard used to match on the href inside an attribute selector,
  // which does not reliably match a long URL - so every mount appended another link.
  test("loadFonts opts in, and does not inject the link twice", () => {
    render(<ThemeProvider loadFonts>a</ThemeProvider>);
    render(<ThemeProvider loadFonts>b</ThemeProvider>);
    render(<ThemeProvider loadFonts>c</ThemeProvider>);
    expect(document.querySelectorAll("link[data-ds-fonts]")).toHaveLength(1);
    document.querySelectorAll("link[data-ds-fonts]").forEach((l) => l.remove());
  });

  test("a different fontHref gets its own link", () => {
    render(<ThemeProvider loadFonts>a</ThemeProvider>);
    render(<ThemeProvider loadFonts fontHref="https://example.com/other.css">b</ThemeProvider>);
    expect(document.querySelectorAll("link[data-ds-fonts]")).toHaveLength(2);
    document.querySelectorAll("link[data-ds-fonts]").forEach((l) => l.remove());
  });

  test("useTheme hands the resolved theme to descendants", () => {
    function Probe() {
      const { mode, tokens } = useTheme();
      return <span data-mode={mode} data-fill={tokens["--accent-fill"]} />;
    }
    const { container } = render(<ThemeProvider mode="dark"><Probe /></ThemeProvider>);
    expect(container.querySelector("span").dataset.mode).toBe("dark");
    expect(container.querySelector("span").dataset.fill).toBe("#A85055");
  });

  test("useTheme outside a provider fails loudly rather than silently", () => {
    function Orphan() { useTheme(); return null; }
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow(/must be used inside a <ThemeProvider>/);
    spy.mockRestore();
  });
});

/* ------------------------------------------------------------ Presentational batch */

describe("Card - 1.3.1 Info and Relationships", () => {
  test("the title is a real heading at the level asked for", () => {
    render(<Card title="Members" headingLevel={4}>Body</Card>);
    expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent("Members");
  });

  test("no title means no heading - a card is not automatically a section", () => {
    render(<Card>Body</Card>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  test("renders the tag asked for and keeps a caller's className", () => {
    const { container } = render(<Card as="section" className="mine">x</Card>);
    expect(container.firstChild.tagName).toBe("SECTION");
    expect(container.firstChild).toHaveClass("ds-card", "pad-md", "mine");
  });
});

describe("Avatar - 1.1.1 Non-text Content", () => {
  test("an image beside a name is decorative by default", () => {
    const { container } = render(<Avatar name="Jane Cooper" src="/j.png" />);
    // alt="" keeps it out of the tree, so the name is not announced twice.
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  test("an explicit alt makes it meaningful, for when it stands alone", () => {
    render(<Avatar name="Jane Cooper" src="/j.png" alt="Jane Cooper" />);
    expect(screen.getByRole("img", { name: "Jane Cooper" })).toBeInTheDocument();
  });

  test("initials fall back from the name and are hidden from assistive tech", () => {
    const { container } = render(<Avatar name="Jane Cooper" />);
    expect(container.textContent).toBe("JC");
    expect(container.querySelector("[aria-hidden='true']")).toHaveTextContent("JC");
  });

  test("initials take the first two words only", () => {
    const { container } = render(<Avatar name="Ada Byron King Lovelace" />);
    expect(container.textContent).toBe("AB");
  });
});

describe("Spinner - 4.1.3 Status Messages", () => {
  test("is a status region carrying its label", () => {
    render(<Spinner label="Syncing changes" />);
    expect(screen.getByRole("status")).toHaveTextContent("Syncing changes");
  });

  test("the mark itself is hidden, so the label is announced once", () => {
    const { container } = render(<Spinner label="Loading" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("Divider - 1.3.1 Info and Relationships", () => {
  test("unlabelled is an hr, which is already a separator", () => {
    const { container } = render(<Divider />);
    expect(container.firstChild.tagName).toBe("HR");
  });

  test("labelled is a named separator", () => {
    render(<Divider label="or" />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAccessibleName("or");
    expect(sep).toHaveAttribute("aria-orientation", "horizontal");
  });

  test("vertical reports its orientation", () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  test("emphasis switches which border token it reads", () => {
    const { container, rerender } = render(<Divider />);
    expect(container.firstChild).toHaveClass("em-subtle");
    rerender(<Divider emphasis="strong" />);
    expect(container.firstChild).toHaveClass("em-strong");
  });
});

describe("Heading / Text - level and size are independent", () => {
  // The point of the component: wanting smaller text must never change the outline.
  test("size does not change the level", () => {
    render(<Heading level={2} size="sm">Small but still h2</Heading>);
    const h = screen.getByRole("heading", { level: 2 });
    expect(h.tagName).toBe("H2");
    expect(h).toHaveClass("fs-sm");
  });

  test("level does not dictate the size beyond a sensible default", () => {
    const { rerender } = render(<Heading level={3}>Default</Heading>);
    expect(screen.getByRole("heading", { level: 3 })).toHaveClass("fs-xl");
    rerender(<Heading level={3} size="3xl">Big</Heading>);
    expect(screen.getByRole("heading", { level: 3 })).toHaveClass("fs-3xl");
  });

  test("Heading and Text share one scale, so base means base in both", () => {
    render(<><Heading level={4} size="base">H</Heading><Text size="base">T</Text></>);
    expect(screen.getByRole("heading", { level: 4 })).toHaveClass("fs-base");
    expect(screen.getByText("T")).toHaveClass("fs-base");
  });

  test("Text renders the element asked for", () => {
    render(<Text as="span" tone="muted" weight="medium">Inline</Text>);
    const el = screen.getByText("Inline");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveClass("tone-muted", "w-medium");
  });
});

describe("VisuallyHidden", () => {
  test("stays in the accessibility tree - it is clipped, not removed", () => {
    render(<button type="button"><span aria-hidden="true">x</span><VisuallyHidden>Delete invoice</VisuallyHidden></button>);
    // display:none or visibility:hidden here would drop the name entirely.
    expect(screen.getByRole("button")).toHaveAccessibleName("Delete invoice");
  });
});

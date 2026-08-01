/*
  Behaviour tests — the half axe cannot see.

  Each block guards a specific claim made in CONFORMANCE (./Conformance.jsx).
  If a test here fails, a row in the published accessibility statement has
  become untrue, which is the point: the map and the code are meant to move
  together. Criterion numbers are named in the test titles so the link is
  traceable in both directions.
*/

import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

import { Textarea } from "../Textarea";
import { SearchField } from "../SearchField";
import { PasswordField } from "../PasswordField";
import { Slider } from "../Slider";
import { FileUpload } from "../FileUpload";
import { NumberStepper } from "../NumberStepper";
import { FormGroup } from "../FormGroup";
import { Field } from "../Field";
import { Select } from "../Select";

/* ------------------------------------------------------------ Select */

describe("Select — 2.1.1 Keyboard, 4.1.2 Name Role Value", () => {
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

describe("PasswordField — 3.3.8 Accessible Authentication", () => {
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

describe("Textarea — 4.1.3 Status Messages, 3.3.1 Error Identification", () => {
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

describe("SearchField — 2.1.1 Keyboard, 4.1.2 Name Role Value", () => {
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

describe("Slider — 2.5.7 Dragging Movements, 4.1.2 Name Role Value", () => {
  /*
    Note on what is testable here. Arrow / Home / End / Page Up / Down on a range
    input are implemented by the *browser*, not by this component — that is
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

describe("FileUpload — 2.5.7 Dragging Movements, 3.3.1 Error Identification", () => {
  const pdf = (name = "brief.pdf") => new File(["x"], name, { type: "application/pdf" });

  test("the file input stays in the tab order — dragging is never the only route", () => {
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

describe("NumberStepper — 2.4.3 Focus Order, 4.1.2 Name Role Value", () => {
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

describe("FormGroup — 3.3.7 Redundant Entry, 1.3.1 Info and Relationships", () => {
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

/*
  Automated accessibility gate — step 3 of "Adding a component later" in
  conformance-setup.md. Every component, in every state it ships, asserted to
  have zero axe violations.

  This catches the mechanical half of WCAG: missing labels, broken ARIA
  references, bad roles, orphaned attributes. It cannot see whether a keyboard
  flow makes sense or whether an announcement is useful — interaction.test.jsx
  covers the behaviour, and conformance-setup.md §3 lists what stays manual.
*/

import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, test, expect } from "vitest";

import { Button } from "../Button";
import { Field } from "../Field";
import { Textarea } from "../Textarea";
import { SearchField } from "../SearchField";
import { PasswordField } from "../PasswordField";
import { Slider } from "../Slider";
import { FileUpload } from "../FileUpload";
import { NumberStepper } from "../NumberStepper";
import { FormGroup } from "../FormGroup";
import { Select } from "../Select";
import { Checkbox, RadioGroup, Switch } from "../SelectionControls";
import { Badge } from "../Badge";
import { Alert } from "../Alert";
import { Link } from "../Link";
import { SkipLink } from "../SkipLink";
import { Breadcrumbs } from "../Breadcrumbs";
import { Pagination } from "../Pagination";
import { Tabs } from "../Tabs";
import { Accordion } from "../Accordion";

const clean = async (ui) => expect(await axe(render(ui).container)).toHaveNoViolations();

describe("Button", () => {
  test("every variant and state", async () => {
    await clean(
      <>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Delete</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Saving</Button>
      </>
    );
  });

  test("icon-only carries an accessible name", async () => {
    await clean(<Button iconOnly ariaLabel="Settings" />);
  });
});

describe("Field", () => {
  test("label, hint, error, required and disabled states", async () => {
    await clean(
      <>
        <Field label="Full name" hint="As it appears on your ID." />
        <Field label="Email" type="email" required />
        <Field label="Workspace" error="That name is already taken." />
        <Field label="Account ID" disabled />
      </>
    );
  });
});

describe("Textarea", () => {
  test("plain, counted, and over a soft limit", async () => {
    await clean(
      <>
        <Textarea label="Release notes" hint="Markdown supported." />
        <Textarea label="Bio" maxLength={120} showCount />
        <Textarea label="Over" maxLength={5} showCount enforceMax={false}
          defaultValue="far too long to fit" />
        <Textarea label="Required" required />
      </>
    );
  });
});

describe("SearchField", () => {
  test("with and without a visible label, and with results", async () => {
    await clean(<SearchField label="Search docs" hint="Enter searches." />);
    await clean(<SearchField label="Search team" hideLabel defaultValue="jane" resultCount={3} />);
  });
});

describe("PasswordField", () => {
  test("plain, with requirements, and in error", async () => {
    await clean(
      <>
        <PasswordField label="Password" />
        <PasswordField label="New password" autoComplete="new-password" required
          requirements={[
            { label: "At least 12 characters", test: (v) => v.length >= 12 },
            { label: "A number", test: (v) => /\d/.test(v) },
          ]} />
        <PasswordField label="Broken" error="That password was found in a breach." />
        <PasswordField label="No toggle" revealToggle={false} />
      </>
    );
  });
});

describe("Slider", () => {
  test("plain, formatted, with marks, and disabled", async () => {
    await clean(
      <>
        <Slider label="Volume" />
        <Slider label="Budget" min={0} max={200} step={10} defaultValue={80}
          formatValue={(v) => `$${v}`} marks={[0, 100, 200]} />
        <Slider label="Density" min={1} max={3} defaultValue={2}
          formatValue={(v) => ["Compact", "Cozy", "Roomy"][v - 1]} />
        <Slider label="Locked" disabled />
      </>
    );
  });
});

describe("FileUpload", () => {
  test("empty, required, and in error", async () => {
    await clean(<FileUpload label="Attachments" hint="PDF up to 5 MB." accept=".pdf" multiple />);
    await clean(<FileUpload label="Avatar" required />);
    await clean(<FileUpload label="Broken" error="That file was rejected." />);
    await clean(<FileUpload label="Locked" disabled />);
  });
});

describe("NumberStepper", () => {
  test("bounded, stepped, in error and disabled", async () => {
    await clean(
      <>
        <NumberStepper label="Seats" min={1} max={50} defaultValue={5} hint="Between 1 and 50." />
        <NumberStepper label="Hours" min={0} max={24} step={0.5} defaultValue={8} unit="Hours per day" />
        <NumberStepper label="Broken" defaultValue={0} error="Pick at least one." />
        <NumberStepper label="Locked" defaultValue={1} disabled />
      </>
    );
  });
});

describe("FormGroup", () => {
  test("plain, card, and with the sameAs slot both ways", async () => {
    await clean(
      <FormGroup legend="Shipping address" hint="Where the order goes.">
        <Field label="Street" />
      </FormGroup>
    );
    await clean(
      <FormGroup legend="Billing address" variant="card"
        sameAs={{ label: "Same as shipping", defaultChecked: true, summary: "12 Rosewood Lane" }}>
        <Field label="Street" />
      </FormGroup>
    );
    await clean(
      <FormGroup legend="Billing address" variant="card" error="Add a billing address."
        sameAs={{ label: "Same as shipping", defaultChecked: false, summary: "12 Rosewood Lane" }}>
        <Field label="Street" />
      </FormGroup>
    );
  });
});

describe("Select", () => {
  const options = [
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro" },
  ];
  test("closed, with a value, hint, error and disabled", async () => {
    await clean(<Select label="Plan" options={options} hint="Change anytime." />);
    await clean(<Select label="Plan" options={options} defaultValue="pro" />);
    await clean(<Select label="Plan" options={options} error="Not available." />);
    await clean(<Select label="Plan" options={options} disabled />);
  });
});

describe("Selection controls", () => {
  test("checkbox, radio group and switch in every state", async () => {
    await clean(
      <>
        <Checkbox label="Email notifications" defaultChecked />
        <Checkbox label="Select all" indeterminate />
        <Checkbox label="Locked" disabled />
        <RadioGroup label="Plan" name="plan" defaultValue="pro"
          options={[{ value: "free", label: "Free" }, { value: "pro", label: "Pro" }]} />
        <Switch label="Dark mode" defaultChecked />
        <Switch label="Unavailable" disabled />
      </>
    );
  });
});

describe("Badge", () => {
  test("every tone in both variants, plus removable", async () => {
    const tones = ["neutral", "accent", "success", "warning", "danger", "info"];
    await clean(
      <>
        {tones.map((t) => <Badge key={t} tone={t}>{t}</Badge>)}
        {tones.map((t) => <Badge key={t + "s"} tone={t} variant="soft">{t}</Badge>)}
        <Badge tone="accent" variant="soft" removeLabel="Remove Design" onRemove={() => {}}>Design</Badge>
      </>
    );
  });
});

describe("Link", () => {
  test("both underline modes and an external link", async () => {
    await clean(
      <p>
        Read the <Link href="#a">quick reference</Link>, the{" "}
        <Link href="#b" underline="hover">quiet variant</Link>, or{" "}
        <Link href="https://example.com" external>an external page</Link>.
      </p>
    );
  });
});

describe("SkipLink", () => {
  test("default and custom target", async () => {
    await clean(<><SkipLink /><main id="main" tabIndex={-1}>Content</main></>);
    await clean(<><SkipLink href="#content">Skip to content</SkipLink><div id="content" /></>);
  });
});

describe("Breadcrumbs", () => {
  test("a full trail and a single crumb", async () => {
    await clean(
      <Breadcrumbs items={[
        { label: "Home", href: "#home" },
        { label: "Components", href: "#components" },
        { label: "Breadcrumbs" },
      ]} />
    );
    await clean(<Breadcrumbs items={[{ label: "Home" }]} />);
  });
});

describe("Pagination", () => {
  test("short, long with ellipses, and at both ends", async () => {
    await clean(<Pagination count={5} defaultPage={2} />);
    await clean(<Pagination count={24} defaultPage={12} />);
    await clean(<Pagination count={24} defaultPage={1} />);
    await clean(<Pagination count={24} defaultPage={24} />);
  });
});

describe("Tabs", () => {
  const items = [
    { value: "a", label: "Profile", content: "Profile panel" },
    { value: "b", label: "Billing", content: "Billing panel" },
  ];
  test("automatic, manual and vertical", async () => {
    await clean(<Tabs label="Settings" items={items} />);
    await clean(<Tabs label="Settings" items={items} activation="manual" />);
    await clean(<Tabs label="Settings" items={items} orientation="vertical" />);
  });
});

describe("Accordion", () => {
  const items = [
    { value: "one", label: "First question", content: "First answer" },
    { value: "two", label: "Second question", content: "Second answer" },
  ];
  test("closed, open, multiple, and at another heading level", async () => {
    await clean(<Accordion items={items} />);
    await clean(<Accordion items={items} defaultOpen={["one"]} />);
    await clean(<Accordion items={items} allowMultiple defaultOpen={["one", "two"]} />);
    await clean(<Accordion items={items} headingLevel={2} />);
  });
});

describe("Alert", () => {
  test("every tone, dismissible, and both live settings", async () => {
    await clean(
      <>
        <Alert tone="info" title="Trial ending">Three days left.</Alert>
        <Alert tone="success" title="Saved">Settings updated.</Alert>
        <Alert tone="warning" title="Near your limit">90% used.</Alert>
        <Alert tone="danger" title="Payment failed" onDismiss={() => {}}
          dismissLabel="Dismiss: Payment failed">Update your card.</Alert>
        <Alert tone="info" live="polite" title="Polite">Announced politely.</Alert>
        <Alert tone="danger" live="assertive" title="Assertive">Announced assertively.</Alert>
      </>
    );
  });
});

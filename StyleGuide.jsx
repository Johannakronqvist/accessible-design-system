/*
  A themeable, accessible design system - living style guide.

  HOW TO LIFT THIS INTO YOUR APP
  ------------------------------
  1. Wrap it in <ThemeProvider>. That is the whole setup - it puts every CSS
     custom property the components read onto the element it renders:

       <ThemeProvider mode="system" accent="#2E6F5E" loadFonts>
         <App />
       </ThemeProvider>

     accent is snapped to accessible shades rather than used raw, so branding
     cannot silently drop below AA. mode takes "light", "dark" or "system".
     Need the variables somewhere React cannot reach - :root, a global
     stylesheet, a server-rendered style attribute? buildTheme() is the same
     assembly as a pure function.
  2. Component: every component reads only CSS variables
     (var(--accent-fill), var(--radius), etc.), so they re-theme for free.
     Copy the component + its CSS block straight into your codebase.
  3. Accessibility: every color pairing is verified to WCAG 2.2 AA (AAA in
     many cases), in light and dark. The foundation also ships a 24px/44px
     target-size floor (--target-min / --target-touch), a >=3:1 interactive
     border token (--border-interactive, 1.4.11), and min-height layout that
     survives text-spacing and 400% reflow. Because the color derivation
     targets a contrast ratio rather than a fixed shade, re-theming can't
     silently drop below AA.

  This file is the demo/composition layer only. It imports each component and
  its CSS, concatenates the CSS into one <style> block, and renders the guide.
*/

import { useState, useEffect } from "react";
import { Plus, ArrowRight, Settings, Sun, Moon, Check, RotateCcw } from "lucide-react";

import { PRESETS, BREAKPOINTS } from "./tokens";
import { contrast, hexToRgb, ratioTag } from "./color";
import { ThemeProvider, buildTheme, THEME_CSS } from "./ThemeProvider";
import { Button, BUTTON_CSS } from "./Button";
import { Field, FIELD_CSS } from "./Field";
import { Textarea, TEXTAREA_CSS } from "./Textarea";
import { SearchField, SEARCH_CSS } from "./SearchField";
import { PasswordField, PASSWORD_CSS } from "./PasswordField";
import { Slider, SLIDER_CSS } from "./Slider";
import { FileUpload, FILEUPLOAD_CSS } from "./FileUpload";
import { NumberStepper, NUMBER_CSS } from "./NumberStepper";
import { FormGroup, FORMGROUP_CSS } from "./FormGroup";
import { Link, LINK_CSS } from "./Link";
import { SkipLink, SKIPLINK_CSS } from "./SkipLink";
import { Breadcrumbs, BREADCRUMBS_CSS } from "./Breadcrumbs";
import { Pagination, PAGINATION_CSS } from "./Pagination";
import { Tabs, TABS_CSS } from "./Tabs";
import { Accordion, ACCORDION_CSS } from "./Accordion";
import { Menu, MENU_CSS } from "./Menu";
import { NavItem, NAVITEM_CSS } from "./NavItem";
import { Navbar, NAVBAR_CSS } from "./Navbar";
import { SideNav, SIDENAV_CSS } from "./SideNav";
import { ToggleGroup, TOGGLEGROUP_CSS } from "./ToggleGroup";
import { Modal, Drawer, MODAL_CSS } from "./Modal";
import { Card, CARD_CSS } from "./Card";
import { Avatar, AVATAR_CSS } from "./Avatar";
import { Spinner, SPINNER_CSS } from "./Spinner";
import { Divider, DIVIDER_CSS } from "./Divider";
import { Heading, Text, TYPOGRAPHY_CSS } from "./Typography";
import { VISUALLYHIDDEN_CSS } from "./VisuallyHidden";
import { Select, SELECT_CSS } from "./Select";
import { Checkbox, RadioGroup, Switch, SEL_CSS } from "./SelectionControls";
import { Badge, TagDemo, BADGE_CSS } from "./Badge";
import { AlertDemo, ALERT_CSS } from "./Alert";
import { Stack, Cluster, Grid, RESPONSIVE_CSS } from "./Layout";
import { CONFORMANCE, StatusBadge, AccessibilityFeedback, CONF_CSS } from "./Conformance";

/* --------------------------------------------------------------- GUIDE CSS */

const GUIDE_CSS = `
/* Background, colour, font and the mode transition come from .ds-theme
   (THEME_CSS), which ThemeProvider always applies. This adds only the bit that
   is specific to the guide page. */
.ds{min-height:100%}
.ds-wrap{max-width:940px;margin:0 auto;padding:40px 28px 72px}
.ds-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.ds-label{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;
  letter-spacing:.11em;font-size:11px;color:var(--text-2)}
.ds-title{font-family:var(--font-display);font-weight:500;font-size:34px;
  color:var(--text-1);line-height:1.08;margin:6px 0 0}
.ds-sub{font-size:15px;color:var(--text-2);margin:8px 0 0;max-width:520px;line-height:1.6}
.ds-section{margin-top:48px}
.ds-sectitle{font-family:var(--font-display);font-weight:500;font-size:20px;color:var(--text-1);margin:10px 0 18px}
/* .ds-card lives in CARD_CSS now - the guide's 33 usages are unchanged, the
   class simply has an owner and a component that renders it. */
/* .ds-seg / .ds-grp retired - the guide's switchers are ToggleGroup now, which
   gives them radiogroup semantics and arrow-key navigation for free. */
.ds-swgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:14px}
.ds-sw{display:flex;flex-direction:column;gap:7px}
.ds-swbox{height:54px;border-radius:8px;border:.5px solid var(--border)}
.ds-swname{font-size:12.5px;color:var(--text-1);font-weight:500}
.ds-swhex{font-family:ui-monospace,monospace;font-size:11px;color:var(--text-2);text-transform:uppercase}
.ds-row{display:flex;flex-wrap:wrap;align-items:center;gap:14px}
.ds-rl{font-size:12px;color:var(--text-2);min-width:80px}
.ds-hint{font-size:12px;color:var(--text-2);margin:14px 0 0}
.ds-pill{font-family:var(--font-body);font-weight:500;font-size:12px;color:var(--accent-on-tint);
  background:var(--accent-tint);padding:4px 12px;border-radius:999px}
.ds-note{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--text-2);
  border:.5px solid var(--border);border-radius:999px;padding:5px 12px}
.ds-ctrl{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.ds-ctrl > label{font-size:12px;color:var(--text-2);min-width:64px}
.ds input[type=range]{accent-color:var(--accent-fill);flex:1;min-width:130px;max-width:220px;height:4px}
.ds-read{font-family:ui-monospace,monospace;font-size:12px;color:var(--text-1)}
.ds .pass{font-family:var(--font-body);font-size:11px;font-weight:500;color:#fff;
  padding:1px 7px;border-radius:6px;vertical-align:middle}
.ds-scale-row{display:flex;align-items:baseline;gap:16px;padding:11px 0;border-bottom:.5px solid var(--border)}
.ds-scale-row:last-of-type{border-bottom:none}
.ds-scale-meta{font-family:ui-monospace,monospace;font-size:11px;color:var(--text-2);
  min-width:82px;text-transform:uppercase;flex-shrink:0}
.ds-sprow{display:flex;align-items:center;gap:14px;margin:9px 0}
.ds-bar{height:22px;border-radius:5px;background:var(--accent-tint);border:.5px solid var(--border)}
.ds-box{background:var(--accent-tint);border:.5px solid var(--border);border-radius:6px}
.ds-main{outline:none}
.ds-main:focus-visible{box-shadow:0 0 0 3px var(--ring);border-radius:min(var(--radius),8px)}
.ds-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;
  line-height:1.6;color:var(--text-1);background:var(--bg);border:.5px solid var(--border);
  border-radius:min(var(--radius),10px);padding:14px 16px;margin:0;overflow-x:auto;
  white-space:pre;-webkit-overflow-scrolling:touch}
.ds-kbd{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;
  background:var(--surface);border:.5px solid var(--border-interactive);
  border-radius:4px;padding:1px 5px;color:var(--text-1)}
`;

/* ------------------------------------------------------------- SHOWCASE */

const SWATCHES = [
  { group: "Neutral", keys: ["--bg", "--surface", "--text-1", "--text-2", "--border"] },
  { group: "Accent", keys: ["--accent-fill", "--accent-text", "--accent-tint", "--accent-on-tint"] },
  { group: "Semantic", keys: ["--success", "--warning", "--danger", "--info"] },
];

function Swatch({ name, value }) {
  return (
    <div className="ds-sw">
      <div className="ds-swbox" style={{ backgroundColor: value }} />
      <div>
        <div className="ds-swname">{name.replace(/^--/, "")}</div>
        <div className="ds-swhex">{value}</div>
      </div>
    </div>
  );
}

export default function StyleGuide() {
  const [mode, setMode] = useState("light");
  const [color, setColor] = useState(null); // null = curated Sweet Rosewood default
  const [shape, setShape] = useState("10px");
  const [base, setBase] = useState(16);
  const [ratio, setRatio] = useState(1.2);
  const [unit, setUnit] = useState(8);
  const [modal, setModal] = useState(null); // "confirm" | "drawer" | null
  const [navAt, setNavAt] = useState("#projects");
  const [sideAt, setSideAt] = useState("#members");

  // The whole token layer now comes from buildTheme - the same call ThemeProvider
  // makes below. The guide needs the resolved values in JS as well as in CSS, for
  // the swatch grid, the type scale and the live contrast readouts.
  const p = PRESETS.sweet;
  const themeArgs = {
    mode, accent: color, radius: shape,
    baseSize: base, ratio, spacingUnit: unit,
  };
  const { tokens, fontScale: fs } = buildTheme(themeArgs);

  // Live WCAG check for the active accent (curated or custom).
  const rFill = contrast([255, 255, 255], hexToRgb(tokens["--accent-fill"]));
  const rText = contrast(hexToRgb(tokens["--accent-text"]), hexToRgb(tokens["--bg"]));

  return (
    // The guide is now just another ThemeProvider consumer - it holds the state
    // its controls need and hands it straight over. loadFonts is opted into here
    // because this page is the demo; a consuming app makes its own call.
    <ThemeProvider {...themeArgs} loadFonts className="ds">
      <style>{THEME_CSS + GUIDE_CSS + BUTTON_CSS + FIELD_CSS + RESPONSIVE_CSS + CONF_CSS + SEL_CSS + SELECT_CSS + BADGE_CSS + ALERT_CSS
        + TEXTAREA_CSS + SEARCH_CSS + PASSWORD_CSS + SLIDER_CSS + FILEUPLOAD_CSS + NUMBER_CSS + FORMGROUP_CSS
        + LINK_CSS + SKIPLINK_CSS + BREADCRUMBS_CSS + PAGINATION_CSS + TABS_CSS + ACCORDION_CSS
        + MENU_CSS + NAVITEM_CSS + NAVBAR_CSS + SIDENAV_CSS + TOGGLEGROUP_CSS + MODAL_CSS
        + VISUALLYHIDDEN_CSS + CARD_CSS + AVATAR_CSS + SPINNER_CSS + DIVIDER_CSS + TYPOGRAPHY_CSS}</style>
      {/* First stop in the tab order - press Tab on load to reveal it (2.4.1). */}
      <SkipLink href="#ds-main" />
      <div className="ds-wrap">

        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <span className="ds-label">Design system</span>
            <h1 className="ds-title">A themeable, accessible foundation</h1>
            <p className="ds-sub">
              Color, type, shape, density and more are each a single token. Change one and the
              whole system re-tunes - and it can never ship below WCAG AA.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <ToggleGroup label="Mode" defaultValue="light" onChange={setMode} options={[
              { value: "light", icon: Sun, ariaLabel: "Light mode" },
              { value: "dark", icon: Moon, ariaLabel: "Dark mode" },
            ]} />
          </div>
        </div>

        {/* Everything below the header is the skip link's destination.
            tabIndex={-1} so focus actually lands here, not just the viewport. */}
        <main id="ds-main" tabIndex={-1} className="ds-main">

        {/* Getting started */}
        <div className="ds-section">
          <span className="ds-label">Foundations</span>
          <div className="ds-sectitle">Getting started</div>
          <div className="ds-card">
            <p style={{ fontSize: "var(--fs-base)", color: "var(--text-1)", lineHeight: 1.65, margin: "0 0 16px", maxWidth: "62ch" }}>
              Wrap your app in <span className="ds-mono">ThemeProvider</span>. That is the setup - it puts
              every CSS custom property the components read onto the element it renders, and everything
              below inherits them.
            </p>
            <pre className="ds-code">{`import { ThemeProvider, Button } from "./design-system";

<ThemeProvider mode="system" accent="#2E6F5E" loadFonts>
  <Button>Save changes</Button>
</ThemeProvider>`}</pre>
            <p className="ds-hint">
              <span className="ds-mono">mode</span> takes "light", "dark" or "system" - system follows
              prefers-color-scheme and keeps following it. <span className="ds-mono">accent</span> is snapped
              to accessible shades rather than used raw, so branding cannot silently drop below AA; the
              controls below are those same props. <span className="ds-mono">radius</span>,{" "}
              <span className="ds-mono">baseSize</span>, <span className="ds-mono">ratio</span> and{" "}
              <span className="ds-mono">spacingUnit</span> drive shape, type and density.
            </p>
            <p className="ds-hint">
              <span className="ds-mono">loadFonts</span> is off by default. Injecting a Google Fonts link
              makes a third-party request on the host application's behalf, which is a privacy and CSP
              decision belonging to the app, not to a component it imported - so it is opt-in. Self-host
              instead and override <span className="ds-mono">--font-display</span> and{" "}
              <span className="ds-mono">--font-body</span>.
            </p>
            <p className="ds-hint">
              Need the variables somewhere React cannot reach - <span className="ds-mono">:root</span>, a
              global stylesheet, a server-rendered style attribute?{" "}
              <span className="ds-mono">buildTheme()</span> is the same assembly as a pure function, with no
              React and no DOM. <span className="ds-mono">useTheme()</span> hands the resolved tokens to any
              descendant that needs a value in JS rather than CSS.
            </p>
          </div>
        </div>

        {/* Theme controls */}
        <div className="ds-section">
          <span className="ds-label">Foundations</span>
          <div className="ds-sectitle">Theme controls</div>
          <div className="ds-card">
            <div className="ds-ctrl" style={{ marginBottom: 18, alignItems: "flex-start" }}>
              <label htmlFor="ds-color" style={{ marginTop: 12 }}>Brand color</label>
              <input id="ds-color" type="color" className="ds-color-in"
                value={color || tokens["--accent-fill"]}
                onChange={(e) => setColor(e.target.value)} aria-label="Brand color" />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span className="ds-read">
                    White on fill {rFill.toFixed(1)}{" "}
                    <span className="pass" style={{ background: rFill >= 4.5 ? "#15803D" : "#B4322F" }}>{ratioTag(rFill)}</span>
                  </span>
                  <span className="ds-read">
                    Text on bg {rText.toFixed(1)}{" "}
                    <span className="pass" style={{ background: rText >= 4.5 ? "#15803D" : "#B4322F" }}>{ratioTag(rText)}</span>
                  </span>
                </div>
                <span style={{ fontSize: "var(--fs-sm)", color: "var(--text-2)" }}>
                  {color ? "Your color, snapped to accessible shades." : "Default: Sweet Rosewood."}
                </span>
              </div>
              {color && (
                <button type="button" className="ds-btn secondary sm" onClick={() => setColor(null)}>
                  <RotateCcw size={13} aria-hidden="true" /> Reset
                </button>
              )}
            </div>
            <div className="ds-ctrl" style={{ marginBottom: 18 }}>
              <label htmlFor="ds-base">Type</label>
              <input id="ds-base" type="range" min="14" max="20" step="1" value={base}
                onChange={(e) => setBase(+e.target.value)} aria-label="Base font size" />
              <ToggleGroup label="Type ratio" size="sm" defaultValue={1.2} onChange={setRatio}
                options={[1.125, 1.2, 1.25].map((x) => ({ value: x, label: String(x) }))} />
              <span className="ds-read">{base}px base · scale {fs.sm}-{fs.x3}</span>
            </div>
            <div className="ds-ctrl" style={{ marginBottom: 18 }}>
              <label>Spacing</label>
              <ToggleGroup label="Spacing base unit" size="sm" defaultValue={8} onChange={setUnit}
                options={[4, 6, 8].map((x) => ({ value: x, label: `${x}px` }))} />
              <span className="ds-read">{unit}px base · {unit}-{unit * 8}px</span>
            </div>
            <div className="ds-ctrl">
              <label>Shape</label>
              <ToggleGroup label="Corner shape" size="sm" defaultValue="10px" onChange={setShape}
                options={[["Sharp", "4px"], ["Rounded", "10px"], ["Pill", "999px"]]
                  .map(([lab, v]) => ({ value: v, label: lab }))} />
              <span className="ds-read">radius {shape === "999px" ? "pill" : shape}</span>
            </div>
          </div>
        </div>

        {/* Identity card */}
        <div className="ds-section">
          <span className="ds-label">Identity</span>
          <div className="ds-sectitle" style={{ marginBottom: 16 }}>{color ? "Custom palette" : p.name}</div>
          <div className="ds-card" style={{ maxWidth: 470 }}>
            <div style={{ marginBottom: 12 }}>
              <span className="ds-label">Appearance</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--fs-2xl)", color: "var(--text-1)", lineHeight: 1.15, marginBottom: 9 }}>
              Make it yours
            </div>
            <p style={{ fontSize: "var(--fs-base)", color: "var(--text-2)", lineHeight: 1.6, margin: "0 0 20px" }}>
              Change the brand color or toggle light and dark above - the tokens flow through every
              element below without touching a line of component code.
            </p>
            <div className="ds-row" style={{ marginBottom: 20 }}>
              <Button>Save changes</Button>
              <Button variant="secondary">Cancel</Button>
              <Button variant="ghost" iconOnly leftIcon={Settings} ariaLabel="More settings" />
              <span className="ds-pill">Pro</span>
            </div>
            <div className="ds-mono" style={{ fontSize: 11, color: "var(--text-2)", borderTop: ".5px solid var(--border)", paddingTop: 13 }}>
              WCAG AA · verified in light and dark
            </div>
          </div>
        </div>

        {/* Color */}
        <div className="ds-section">
          <span className="ds-label">Color tokens</span>
          <div className="ds-sectitle">Palette · {mode}</div>
          {SWATCHES.map((s) => (
            <div key={s.group} style={{ marginBottom: 22 }}>
              <div className="ds-label" style={{ marginBottom: 12 }}>{s.group}</div>
              <div className="ds-swgrid">
                {s.keys.map((k) => <Swatch key={k} name={k} value={tokens[k]} />)}
              </div>
            </div>
          ))}
        </div>

        {/* Type scale */}
        <div className="ds-section">
          <span className="ds-label">Type scale</span>
          <div className="ds-sectitle">Generated from {base} × {ratio}</div>
          <div className="ds-card">
            {[
              { n: "3xl", v: "var(--fs-3xl)", px: fs.x3, disp: true },
              { n: "2xl", v: "var(--fs-2xl)", px: fs.x2, disp: true },
              { n: "xl", v: "var(--fs-xl)", px: fs.xl, disp: true },
              { n: "lg", v: "var(--fs-lg)", px: fs.lg, disp: false },
              { n: "base", v: "var(--fs-base)", px: fs.base, disp: false },
              { n: "sm", v: "var(--fs-sm)", px: fs.sm, disp: false },
            ].map((s) => (
              <div className="ds-scale-row" key={s.n}>
                <span className="ds-scale-meta">{s.n} · {s.px}px</span>
                <span style={{
                  fontFamily: s.disp ? "var(--font-display)" : "var(--font-body)",
                  fontWeight: s.disp ? 500 : 400, fontSize: s.v, color: "var(--text-1)", lineHeight: 1.1,
                }}>
                  Handcrafted, not defaulted
                </span>
              </div>
            ))}
            <p className="ds-hint">
              Display uses {p.fonts.display.split(",")[0].replace(/'/g, "")}, body uses {p.fonts.body.split(",")[0].replace(/'/g, "")}.
              Both sizes come from one base and ratio, so the whole hierarchy re-tunes together - drag Type above to feel it.
            </p>
          </div>
        </div>

        {/* Spacing scale */}
        <div className="ds-section">
          <span className="ds-label">Spacing scale</span>
          <div className="ds-sectitle">Multiples of a {unit}px base</div>
          <div className="ds-card">
            {[
              ["1", "--space-1", unit], ["2", "--space-2", unit * 2], ["3", "--space-3", unit * 3],
              ["4", "--space-4", unit * 4], ["6", "--space-6", unit * 6], ["8", "--space-8", unit * 8],
            ].map(([n, v, px]) => (
              <div className="ds-sprow" key={n}>
                <span className="ds-scale-meta">space-{n} · {px}px</span>
                <div className="ds-bar" style={{ width: `var(${v})` }} />
              </div>
            ))}
            <div className="ds-label" style={{ margin: "22px 0 12px" }}>Applied - gap and padding</div>
            {/* Clamped for the same reason as the Grid demo below: a container is
                not a control, so it softens with the shape token without ever
                becoming a lozenge. */}
            <div style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-4)", background: "var(--bg)", border: ".5px solid var(--border)", borderRadius: "min(var(--radius), 10px)" }}>
              <div className="ds-box" style={{ width: 56, height: 40 }} />
              <div className="ds-box" style={{ width: 56, height: 40 }} />
              <div className="ds-box" style={{ width: 56, height: 40 }} />
            </div>
            <p className="ds-hint">Here the gap uses space-3 and the padding uses space-4 - change the base unit to watch the rhythm expand or tighten.</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Button</div>
          <div className="ds-card">
            <div className="ds-label" style={{ marginBottom: 14 }}>Variants × sizes - hover or Tab to try</div>
            {[
              { l: "Primary", v: "primary" }, { l: "Secondary", v: "secondary" },
              { l: "Ghost", v: "ghost" }, { l: "Danger", v: "danger" },
            ].map((r) => (
              <div className="ds-row" key={r.v} style={{ margin: "10px 0" }}>
                <span className="ds-rl">{r.l}</span>
                <Button variant={r.v} size="sm">Small</Button>
                <Button variant={r.v} size="md">Medium</Button>
                <Button variant={r.v} size="lg">Large</Button>
              </div>
            ))}

            <div className="ds-label" style={{ margin: "26px 0 14px" }}>States</div>
            <div className="ds-row">
              <Button>Rest</Button>
              <Button disabled>Disabled</Button>
              <Button loading>Saving</Button>
            </div>
            <p className="ds-hint">Focus and active respond live above; disabled is exempt from contrast and blocks interaction; loading sets aria-busy and respects reduced motion.</p>

            <div className="ds-label" style={{ margin: "26px 0 14px" }}>Icons</div>
            <div className="ds-row">
              <Button leftIcon={Plus}>New project</Button>
              <Button variant="secondary" rightIcon={ArrowRight}>Continue</Button>
              <Button variant="ghost" iconOnly leftIcon={Settings} ariaLabel="Settings" />
            </div>
          </div>
        </div>

        {/* Text input */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Text input</div>
          <div className="ds-card">
            <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
              <Field label="Full name" placeholder="Jane Cooper" hint="As it appears on your ID." />
              <Field label="Email" type="email" placeholder="you@example.com" required />
              <Field label="Workspace URL" placeholder="acme" defaultValue="acme" error="That name is already taken." />
              <Field label="Account ID" placeholder="Auto-generated" disabled />
            </div>
            <p className="ds-hint">
              Label, hint and error are wired through aria-describedby and aria-invalid; the error
              carries an icon and message, never color alone (1.4.1); required is announced to
              assistive tech; the border meets 3:1 and the field is a 44px touch target. Tab through to try.
            </p>
          </div>
        </div>

        {/* Textarea */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Textarea</div>
          <div className="ds-card">
            <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              <Textarea label="Release notes" placeholder="What changed in this version?"
                hint="Keep it short - this appears in the changelog." />
              <Textarea label="Short bio" maxLength={120} showCount enforceMax={false}
                hint="Type past the limit to see it flagged rather than truncated."
                defaultValue="Design engineer working on accessible interfaces." />
            </div>
            <p className="ds-hint">
              The Field shell applied to a multi-line input. The counter is described to the field, so focusing
              it announces the budget, and a separate polite region only speaks in the last 20 characters -
              typing is never narrated keystroke by keystroke. With enforceMax=false the limit is advisory:
              going over sets aria-invalid and shows the error instead of silently truncating pasted text.
            </p>
          </div>
        </div>

        {/* Search field */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Search field</div>
          <div className="ds-card">
            <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              <SearchField label="Search components" placeholder="Try “button”"
                hint="Enter searches, Escape clears." />
              <SearchField label="Search team" defaultValue="jane" resultCount={3} />
            </div>
            <p className="ds-hint">
              A labelled input inside a role=search landmark. The clear button only exists when there is
              something to clear, carries a label, and returns focus to the input - the browser's own WebKit
              clear affordance is hidden because it can't be reached by keyboard. Pass resultCount for a polite
              status region that announces how many results came back without moving focus.
            </p>
          </div>
        </div>

        {/* Password field */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Password field</div>
          <div className="ds-card">
            <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              <PasswordField label="Password" placeholder="Enter your password"
                hint="Paste works. Nothing here blocks your password manager." />
              <PasswordField label="New password" autoComplete="new-password" required
                requirements={[
                  { label: "At least 12 characters", test: (v) => v.length >= 12 },
                  { label: "A number", test: (v) => /\d/.test(v) },
                  { label: "A symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
                ]} />
            </div>
            <p className="ds-hint">
              Built for 3.3.8 Accessible Authentication, which most password fields fail: paste is never
              intercepted, autoComplete is set so managers can fill and save, and the reveal toggle lets people
              verify what they typed rather than rely on memory. The toggle is a button with aria-pressed; each
              requirement pairs an icon with text so the met state never rests on color, and a polite summary
              reports progress instead of re-reading the whole list on every keystroke.
            </p>
          </div>
        </div>

        {/* Slider */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Slider</div>
          <div className="ds-card">
            <div style={{ display: "grid", gap: 30, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              <Slider label="Monthly budget" min={0} max={200} step={10} defaultValue={80}
                formatValue={(v) => `$${v}`} marks={[0, 100, 200]} />
              <Slider label="Density" min={1} max={4} step={1} defaultValue={2}
                formatValue={(v) => ["Compact", "Cozy", "Comfortable", "Spacious"][v - 1]}
                marks={[{ value: 1, label: "Compact" }, { value: 4, label: "Spacious" }]} />
            </div>
            <p className="ds-hint">
              A native input[type=range], which is the whole accessibility argument: arrows, Home / End and
              Page Up / Down move it, and a click anywhere on the track jumps to that value - so nothing here
              requires a drag (2.5.7) or a path-based gesture (2.5.1). formatValue feeds aria-valuetext, so
              Density announces “Comfortable” rather than “3”. The thumb is a 24px target and the filled track
              meets 3:1 against the empty one.
            </p>
          </div>
        </div>

        {/* File upload */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">File upload</div>
          <div className="ds-card">
            <FileUpload label="Attachments" multiple accept=".pdf,.png,.jpg" maxSizeMB={5}
              hint="PDF, PNG or JPG up to 5 MB." />
            <p className="ds-hint">
              Drag and drop is an enhancement here, never the only way in. The primary control is a real file
              input paired with a label, so the same action works by keyboard, click and touch with no dragging
              at all (2.5.7) - the input stays in the tab order and draws its focus ring on the label. Chosen
              files are text with a labelled remove button each, and a polite region reports what was added,
              rejected or removed, so the outcome of a drop is never carried by the visual list alone.
            </p>
          </div>
        </div>

        {/* Number stepper */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Number stepper</div>
          <div className="ds-card">
            <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
              <NumberStepper label="Seats" min={1} max={50} defaultValue={5} hint="Between 1 and 50." />
              <NumberStepper label="Hours per day" min={0} max={24} step={0.5} defaultValue={8} />
              <NumberStepper label="Locked" defaultValue={1} disabled />
            </div>
            <p className="ds-hint">
              A native input[type=number], so assistive tech gets the spinbutton role, min / max / step and
              value announcements for free. The − and + buttons are the pointer and touch addition - 44px each,
              labelled with what they change rather than a bare symbol. At the bounds they report aria-disabled
              instead of taking the disabled attribute, so pressing + up to the maximum announces the state
              without dropping your focus onto the body. Typing is left alone while the field has focus and
              clamped on blur, so entering “12” in a field with a minimum of 5 isn't a fight with the clamp.
            </p>
          </div>
        </div>

        {/* Form group */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Form group</div>
          <div className="ds-card">
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              <FormGroup legend="Shipping address" variant="card" hint="Where the order should go.">
                <Field label="Street" defaultValue="12 Rosewood Lane" />
                <Field label="City" defaultValue="Helsinki" />
              </FormGroup>
              <FormGroup legend="Billing address" variant="card"
                sameAs={{
                  label: "Same as shipping address", defaultChecked: true,
                  summary: <>12 Rosewood Lane<br />Helsinki</>,
                }}>
                <Field label="Street" />
                <Field label="City" />
              </FormGroup>
            </div>
            <p className="ds-hint">
              A fieldset with a legend, so related controls are announced as one named group and the hint is
              read once for the group instead of repeated on every field. The sameAs slot is the 3.3.7
              Redundant Entry answer: when the information was already given, offer it back rather than ask
              again - unchecking it restores the fields, checking it unmounts them so they leave the tab order
              entirely, and the change is announced politely.
            </p>
          </div>
        </div>

        {/* Selection controls */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Selection controls</div>
          <div className="ds-card">
            <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
              <div>
                <div className="ds-label" style={{ marginBottom: 12 }}>Checkbox</div>
                <Stack gap="12px">
                  <Checkbox label="Email notifications" defaultChecked />
                  <Checkbox label="SMS notifications" />
                  <Checkbox label="Select all" indeterminate />
                  <Checkbox label="Locked setting" defaultChecked disabled />
                </Stack>
              </div>
              <div>
                <div className="ds-label" style={{ marginBottom: 12 }}>Radio</div>
                <RadioGroup label="Plan" name="plan" defaultValue="pro"
                  options={[{ value: "free", label: "Free" }, { value: "pro", label: "Pro" }, { value: "team", label: "Team" }]} />
              </div>
              <div>
                <div className="ds-label" style={{ marginBottom: 12 }}>Switch</div>
                <Stack gap="12px">
                  <Switch label="Dark mode" defaultChecked />
                  <Switch label="Beta features" />
                  <Switch label="Unavailable" disabled />
                </Stack>
              </div>
            </div>
            <p className="ds-hint">
              Native checkbox / radio / switch semantics with label association and the shared focus ring; a
              24px+ hit target wraps each control. The checkbox radius follows the Shape token but clamps to a
              rounded-square, so it never collides with radios at the pill setting - flip Shape above to try it.
            </p>
          </div>
        </div>

        {/* Select */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Select</div>
          <div className="ds-card">
            <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
              <Select label="Plan" defaultValue="pro" hint="You can change this anytime."
                options={[{ value: "free", label: "Free" }, { value: "team", label: "Team" }, { value: "pro", label: "Pro" }, { value: "enterprise", label: "Enterprise" }]} />
              <Select label="Region" placeholder="Choose a region"
                options={[{ value: "eu", label: "European Union" }, { value: "us", label: "United States" }, { value: "apac", label: "Asia Pacific" }]} />
              <Select label="Currency" defaultValue="usd" error="Not available in your country."
                options={[{ value: "usd", label: "USD" }, { value: "eur", label: "EUR" }]} />
              <Select label="Tier" placeholder="Unavailable" disabled
                options={[{ value: "a", label: "A" }]} />
            </div>
            <p className="ds-hint">
              A select-only ARIA combobox: open with Enter / Space / ↑ / ↓, move with the arrows, Home / End
              and type-ahead, choose with Enter, dismiss with Escape - and focus returns to the trigger.
              Selected is marked with a check, never color alone. It reuses the Field label / hint / error
              wiring, the focus ring, and the shape token.
            </p>
          </div>
        </div>

        {/* Badge */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Badge</div>
          <div className="ds-card">
            {[["Solid · default", "solid"], ["Soft", "soft"]].map(([lab, v]) => (
              <div key={v} style={{ marginBottom: 20 }}>
                <div className="ds-label" style={{ marginBottom: 10 }}>{lab}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["neutral", "accent", "success", "warning", "danger", "info"].map((t) => (
                    <Badge key={t} tone={t} variant={v}>{t[0].toUpperCase() + t.slice(1)}</Badge>
                  ))}
                </div>
              </div>
            ))}
            <div className="ds-label" style={{ margin: "4px 0 10px" }}>Removable tags</div>
            <TagDemo />
            <p className="ds-hint">
              Solid is the default and soft is the quieter variant, each across six tones (neutral, accent,
              success, warning, danger, info) and verified in light and dark. The label always states the
              meaning, so nothing depends on color alone, and the tag's × is a real button with an aria-label.
              Radius follows the shape token.
            </p>
          </div>
        </div>

        {/* Alert */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Alert</div>
          <div className="ds-card">
            <AlertDemo />
            <p className="ds-hint">
              Soft tint across four tones, each with an icon and text so severity never rests on color alone -
              the icon is sized up as the primary non-color cue. The dismiss is a real 24px button with an
              aria-label and focus ring. Pass live="assertive" (role=alert) or live="polite" (role=status) for
              alerts inserted dynamically; static callouts stay silent to assistive tech. Verified AA in light and dark.
            </p>
          </div>
        </div>

        {/* Link */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Link</div>
          <div className="ds-card">
            <p style={{ fontSize: "var(--fs-base)", color: "var(--text-1)", lineHeight: 1.7, margin: "0 0 16px", maxWidth: "62ch" }}>
              A link inside running text is the classic 1.4.1 failure, so{" "}
              <Link href="#link">underline is the default</Link> rather than an option. Where a link is
              already distinguishable by position - a row of nav items, a footer column - the quieter{" "}
              <Link href="#link" underline="hover">hover underline</Link> is available. External links get an
              icon plus text saying they open a new tab, like{" "}
              <Link href="https://www.w3.org/WAI/WCAG22/quickref/" external>the WCAG quick reference</Link>.
            </p>
            <p className="ds-hint">
              Colour alone never distinguishes a link from its surrounding text. external also sets
              rel="noopener noreferrer", and adds the new-tab warning as real text rather than a title
              attribute, so it is announced rather than sprung on you (3.2.5).
            </p>
          </div>
        </div>

        {/* Skip link */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Skip link</div>
          <div className="ds-card">
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-2)", lineHeight: 1.6, margin: "0 0 14px", maxWidth: "62ch" }}>
              There is a live skip link on this page - it is the first thing in the tab order. Click here,
              then press <kbd className="ds-kbd">Shift</kbd> + <kbd className="ds-kbd">Tab</kbd> until it
              slides into the top-left corner.
            </p>
            <p className="ds-hint">
              The cheapest win in the system (2.4.1 Bypass Blocks). It is hidden with transform rather than
              display:none, because the latter would take it out of the tab order and defeat the point. Give
              the target tabIndex={-1} too, or some browsers scroll without moving focus and the next Tab
              sends you back to the top of the page.
            </p>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Breadcrumbs</div>
          <div className="ds-card">
            <Breadcrumbs items={[
              { label: "Home", href: "#home" },
              { label: "Components", href: "#components" },
              { label: "Navigation", href: "#navigation" },
              { label: "Breadcrumbs" },
            ]} />
            <p className="ds-hint">
              An ordered list inside a labelled nav landmark, because the order is the information. The
              current page is the last item and is not a link - it carries aria-current="page" and renders as
              text, so nobody tabs to a link that goes where they already are. Separators are hidden from
              assistive tech; the list structure already conveys the sequence.
            </p>
          </div>
        </div>

        {/* Pagination */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Pagination</div>
          <div className="ds-card">
            <Stack gap="22px">
              <div>
                <div className="ds-label" style={{ marginBottom: 10 }}>Few pages - no collapsing</div>
                <Pagination count={5} defaultPage={2} />
              </div>
              <div>
                <div className="ds-label" style={{ marginBottom: 10 }}>Many pages - runs collapse to an ellipsis</div>
                <Pagination count={24} defaultPage={12} />
              </div>
            </Stack>
            <p className="ds-hint">
              Every control has a real name: the numbered buttons are labelled “Page 3”, not “3”, so a list
              of bare digits still makes sense out of context. The current page is marked with aria-current,
              a soft tint and a step up in weight, so position never rests on colour - and the 32px targets
              follow the Shape token closely enough to read as circles at the Pill setting. Previous and Next report
              aria-disabled at the ends rather than taking the disabled attribute, so paging to the last page
              never drops your focus onto the body.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Tabs</div>
          <div className="ds-card">
            <div className="ds-label" style={{ marginBottom: 12 }}>Automatic activation - arrows select as you move</div>
            <Tabs label="Account settings" items={[
              { value: "profile", label: "Profile", content: "Your name, photo and public handle. Selecting a tab here is instant, so arrowing across them is cheap." },
              { value: "billing", label: "Billing", content: "Plan, payment method and invoices." },
              { value: "team", label: "Team", content: "Invite people and manage their roles." },
            ]} />
            <div className="ds-label" style={{ margin: "28px 0 12px" }}>Manual activation - arrows move focus, Enter selects</div>
            <Tabs label="Reports" activation="manual" items={[
              { value: "daily", label: "Daily", content: "Use manual activation when selecting a tab loads data - arrowing past four tabs should not fire four requests." },
              { value: "weekly", label: "Weekly", content: "The weekly rollup." },
              { value: "monthly", label: "Monthly", content: "The monthly rollup." },
            ]} />
            <p className="ds-hint">
              A roving tabindex keeps the whole tablist to a single stop in the tab order, so Tab moves from
              the tabs into the panel rather than through every tab in turn. The selected tab shows an
              indicator bar and a weight change as well as colour. The panel takes tabindex={0} so it can be
              reached and scrolled by keyboard even when it holds nothing focusable.
            </p>
          </div>
        </div>

        {/* Accordion */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Accordion</div>
          <div className="ds-card">
            <Accordion defaultOpen={["what"]} headingLevel={3} items={[
              { value: "what", label: "What does this system guarantee?",
                content: "Every colour pairing is derived to a contrast ratio rather than hand-picked, so re-theming cannot silently drop below AA. Target sizes, focus rings and interactive borders come from tokens, so they hold across every component." },
              { value: "theme", label: "How do I re-theme it?",
                content: "Pass any brand colour to deriveAccent(hex, mode). It snaps the colour to accessible accent tokens that merge over the defaults - no component edits." },
              { value: "claims", label: "Where do the accessibility claims live?",
                content: "In the CONFORMANCE array in Conformance.jsx. It drives this page, the published accessibility statement and the test gate, so the claim made to auditors matches exactly what ships." },
            ]} />
            <p className="ds-hint">
              Each trigger is a real button wrapped in a heading - the part most implementations miss.
              Without it, the heading shortcut can't jump between sections and the page outline has a hole.
              headingLevel is a prop because the right level depends on where the accordion sits. Set
              allowMultiple to turn the accordion into independent disclosures.
            </p>
          </div>
        </div>

        {/* Navbar */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Navbar</div>
          {/* No overflow:hidden here. It would clip the account menu - the exact
              2.4.11 failure that popups in the normal stacking context suffer, and
              the reason Modal is a native dialog in the top layer instead. */}
          <div className="ds-card" style={{ padding: 0 }}>
            <Navbar
              brand={<><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-fill)" }} /> Acme</>}
              currentHref={navAt}
              onNavigate={(href, e) => { e.preventDefault(); setNavAt(href); }}
              items={[
                { href: "#projects", label: "Projects" },
                { href: "#reports", label: "Reports" },
                { href: "#team", label: "Team" },
              ]}
              actions={
                <Menu label="Jane" size="sm" align="end" items={[
                  { value: "profile", label: "Your profile", icon: Settings },
                  { value: "settings", label: "Workspace settings" },
                  { separator: true },
                  { value: "signout", label: "Sign out", destructive: true },
                ]} />
              }
            />
          </div>
          <p className="ds-hint">
            A banner header wrapping a labelled nav landmark - labelled because a page usually has more than
            one, and an unlabelled landmark list that reads “navigation, navigation, navigation” is useless.
            The active item carries aria-current="page" plus a weight step and an underline, so it never
            rests on colour - click between Projects, Reports and Team to watch it move. Narrow the window
            below 768px and the links collapse behind a toggle.
          </p>
          <p className="ds-hint">
            onNavigate(href, event) is what makes that work: without it the items are plain anchors and the
            browser navigates, which is the right default; with it a router can preventDefault and push
            instead. It also closes the collapsed row, since leaving it open would cover the page you just
            asked for. SideNav takes the same prop.
          </p>
          <p className="ds-hint">
            That collapsed panel is a <em>non-modal</em> disclosure, not a dialog: focus is not trapped and
            the page behind stays reachable, which is right for a panel that pushes content down rather than
            covering it. Escape closes it and returns focus to the toggle. A full-screen drawer that covers
            the page would need a focus trap and an inert background - that is Modal's job, and this
            component deliberately doesn't pretend to do it.
          </p>
        </div>

        {/* Menu */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Menu</div>
          <div className="ds-card">
            <div className="ds-row">
              <Menu label="Actions" items={[
                { value: "rename", label: "Rename" },
                { value: "duplicate", label: "Duplicate" },
                { value: "archive", label: "Archive", disabled: true },
                { separator: true },
                { value: "delete", label: "Delete project", destructive: true },
              ]} />
              <Menu label="Sort" variant="ghost" items={[
                { value: "name", label: "Name" },
                { value: "created", label: "Date created" },
                { value: "updated", label: "Last updated" },
              ]} />
            </div>
            <p className="ds-hint">
              This is not Select. A listbox picks a value and keeps focus on its trigger, driving the list
              with aria-activedescendant; a menu fires actions, so real DOM focus moves onto each item and a
              screen reader reads them as commands. Open with click, Enter, Space or ↓ - or ↑ to land on the
              last item. Arrows, Home / End and type-ahead move; Escape or Tab dismiss, and focus returns to
              the trigger. Disabled items keep their place and report aria-disabled rather than vanishing, so
              the menu doesn't change shape under you.
            </p>
          </div>
        </div>

        {/* SideNav */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Side navigation</div>
          <div className="ds-card">
            <div style={{ maxWidth: 260 }}>
              <SideNav currentHref={sideAt}
                onNavigate={(href, e) => { e.preventDefault(); setSideAt(href); }}
                groups={[
                { label: "Workspace", items: [
                  { href: "#overview", label: "Overview" },
                  { href: "#members", label: "Members" },
                  { href: "#billing", label: "Billing" },
                ] },
                { label: "Account", items: [
                  { href: "#profile", label: "Profile" },
                  { href: "#security", label: "Security" },
                ] },
              ]} />
            </div>
            <p className="ds-hint">
              One nav landmark, not one per group. A landmark for every section would clog the landmark list,
              so this renders a single labelled nav containing one list per group, each pointed at its own
              heading with aria-labelledby - real structure without inventing landmarks. Group labels are
              plain text rather than headings by default, since a sidebar's “Workspace” and “Account” usually
              aren't part of the document outline; pass headingLevel when the sidebar genuinely is the page
              structure.
            </p>
          </div>
        </div>

        {/* ToggleGroup */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Toggle group</div>
          <div className="ds-card">
            <Stack gap="18px">
              <ToggleGroup label="View" defaultValue="board" options={[
                { value: "board", label: "Board" },
                { value: "list", label: "List" },
                { value: "calendar", label: "Calendar" },
              ]} />
              <ToggleGroup label="Range" size="sm" defaultValue="30" options={[
                { value: "7", label: "7 days" },
                { value: "30", label: "30 days" },
                { value: "90", label: "90 days" },
              ]} />
              <ToggleGroup label="Density" size="lg" defaultValue="cozy" options={[
                { value: "compact", label: "Compact" },
                { value: "cozy", label: "Cozy" },
              ]} />
            </Stack>
            <p className="ds-hint">
              Radiogroup semantics rather than a row of aria-pressed buttons, because that is what the
              control is - one choice out of several, not several independent toggles. The keyboard
              difference is the real payoff: a roving tabindex makes the group a single stop in the tab
              order with the arrows moving between options, so a five-option switcher costs one Tab instead
              of five. The four switchers at the top of this page are this component - arrow through them.
            </p>
          </div>
        </div>

        {/* Modal */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Modal</div>
          <div className="ds-card">
            <div className="ds-row">
              <Button onClick={() => setModal("confirm")}>Delete project…</Button>
              {/* PINNED FOR MVP - trigger for the hidden Drawer demo below.
              <Button variant="secondary" onClick={() => setModal("drawer")}>Open drawer…</Button>
              */}
            </div>

            <Modal
              open={modal === "confirm"} onClose={() => setModal(null)}
              title="Delete this project?" size="sm"
              description="This removes the project and its 42 tasks for everyone on the team. It cannot be undone."
              footer={
                <>
                  <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
                  <Button variant="danger" onClick={() => setModal(null)}>Delete project</Button>
                </>
              }
            />

            {/*
              PINNED FOR MVP - the Drawer demo is hidden, not the component.
              Drawer is still exported from index.js, covered by the test suite and
              listed in CONFORMANCE; only this demo and its caveat are out of the
              guide. Restore by deleting this comment wrapper and the one below.

              Why it is pinned: a popup opened *inside* a scrollable dialog body
              (Select's listbox, Menu's list) is clipped by that scroll container.
              The dialog is in the top layer; a popup inside it is not. The fix is
              the Popover API plus viewport-aware placement - see the 2.4.11
              partial rows on Select and Menu.

            <Drawer
              open={modal === "drawer"} onClose={() => setModal(null)}
              title="Filters" placement="right" size="sm"
              description="A drawer is the same dialog, anchored to an edge instead of centred."
              footer={<Button onClick={() => setModal(null)}>Apply filters</Button>}
            >
              <Stack gap="18px">
                <Checkbox label="Only my projects" defaultChecked />
                <Checkbox label="Archived" />
                <ToggleGroup label="Status" size="sm" defaultValue="active" options={[
                  { value: "active", label: "Active" },
                  { value: "paused", label: "Paused" },
                ]} />
              </Stack>
            </Drawer>
            */}

            <p className="ds-hint">
              A native <span className="ds-mono">&lt;dialog&gt;</span> opened with{" "}
              <span className="ds-mono">showModal()</span>, which is the whole point: the browser supplies a
              real focus trap, an inert background - content behind is unreachable by keyboard and hidden
              from assistive tech, with no aria-hidden bookkeeping - Escape to dismiss, and focus returning
              to whatever opened it. Tab around inside one and you will not get out.
            </p>
            <p className="ds-hint">
              The quieter win is top-layer rendering. A hand-rolled div modal sits in the normal stacking
              context, so any ancestor with overflow:hidden, a transform or a competing z-index can clip it -
              a common and hard-to-spot 2.4.11 failure. A dialog in the top layer cannot be clipped by
              anything, which is why Modal claims 2.4.11 outright where Select only claims it in part.
            </p>
            <p className="ds-hint">
              The same trade as Slider comes with it: jsdom implements neither showModal() nor the top layer,
              so the trap and the inert background are verified by hand rather than in CI. The suite covers
              what is ours - labelling, initial focus, scroll lock, backdrop dismissal, and keeping React
              state in step with the browser's own close.
            </p>
            {/* PINNED FOR MVP - the known-limitation note that went with the Drawer
                demo. Restore alongside the Drawer above. */}
          </div>
        </div>

        {/* Presentational */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Card, Avatar, Spinner, Divider</div>
          <div className="ds-card">
            <Grid min={230}>
              <Card padding="md" title="Members" headingLevel={4}
                footer={<Button size="sm" variant="secondary">Manage</Button>}>
                <Cluster gap="10px">
                  <Avatar name="Jane Cooper" />
                  <Avatar name="Ravi Patel" />
                  <Avatar name="Sofia Lind" tone="neutral" />
                </Cluster>
                <Text size="sm" tone="muted" style={{ marginTop: 12 }}>
                  Three people have access to this workspace.
                </Text>
              </Card>
              <Card padding="md" title="Sync status" headingLevel={4}>
                <Spinner label="Syncing changes" labelVisible />
                <Divider spacing="md" />
                <Text size="sm" tone="muted">Last synced 4 minutes ago.</Text>
              </Card>
              <Card padding="md" title="Avatar sizes" headingLevel={4}>
                <Cluster gap="10px">
                  {["sm", "md", "lg", "xl"].map((s) => <Avatar key={s} name="Jane Cooper" size={s} />)}
                </Cluster>
                <Divider label="or" spacing="md" />
                <Text size="sm" tone="muted">Flip Shape above - avatars read the token raw, so Pill makes them circles.</Text>
                <Divider emphasis="strong" spacing="md" />
                <Text size="sm" tone="muted">Above: emphasis="strong", for rules that separate regions.</Text>
              </Card>
            </Grid>
            <p className="ds-hint">
              Card owns the <span className="ds-mono">.ds-card</span> class this guide uses 33 times, which
              until now lived only in the guide's own CSS. Its padding is a token rather than a number, so
              density follows the spacing unit with everything else. Avatar reads{" "}
              <span className="ds-mono">--radius</span> raw and unclamped - a rounded square at Sharp, a
              circle at Pill - which makes it the clearest demonstration of the shape token in the system.
            </p>
            <p className="ds-hint">
              Spinner uses role="status", so its label is announced politely when it appears; a bare spinning
              icon with no accessible name is silence to a screen reader. Under prefers-reduced-motion the
              animation stops <em>and</em> the label becomes visible, so the meaning survives the motion
              being removed rather than going with it. Divider is an <span className="ds-mono">&lt;hr&gt;</span>{" "}
              when it is unlabelled and a named separator when it is not.
            </p>
          </div>
        </div>

        {/* Typography */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Heading and Text</div>
          <div className="ds-card">
            <Stack gap="16px">
              <Heading level={2} size="2xl">A heading at level 2</Heading>
              <Heading level={3}>A heading at level 3</Heading>
              <Heading level={3} size="base">Level 3 again, at base size</Heading>
              <Text measure>
                Text carries the body face, a line height tuned for reading, and an optional measure that
                caps the line near 65 characters - the width at which running text stays comfortable.
              </Text>
              <Text size="sm" tone="muted">Small and muted, for secondary copy.</Text>
            </Stack>
            <p className="ds-hint">
              The prop that looks redundant is the important one. Heading takes{" "}
              <span className="ds-mono">level</span> and <span className="ds-mono">size</span> separately,
              because they answer different questions: level is where this sits in the document outline,
              size is how big it looks. Conflating them is the most common heading-order bug there is -
              someone wants smaller text, picks an h4 under an h2, and quietly breaks the outline screen
              reader users navigate by. Keep the level correct and shrink the size instead, as the third
              line above does.
            </p>
          </div>
        </div>

        {/* Responsive */}
        <div className="ds-section">
          <span className="ds-label">Responsive</span>
          <div className="ds-sectitle">Fluid by default</div>
          <div className="ds-card">
            <div className="ds-label" style={{ marginBottom: 12 }}>Breakpoints</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
              {Object.entries(BREAKPOINTS).map(([k, v]) => (
                <span key={k} className="ds-read" style={{ border: ".5px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>{k} · {v}px</span>
              ))}
            </div>
            <div className="ds-label" style={{ marginBottom: 12 }}>Grid - resize to watch it reflow</div>
            {/* Card radius is clamped: a card full of text should soften with the
                shape token, not turn into a lozenge at the Pill setting. Pill lands
                on the same 10px as Rounded - the guard the checkbox and the listbox
                options already use. */}
            <Grid min={190}>
              {["Overview", "Members", "Billing", "Security"].map((t) => (
                <div key={t} style={{ background: "var(--surface)", border: ".5px solid var(--border)", borderRadius: "min(var(--radius), 10px)", padding: "var(--space-4)" }}>
                  <div style={{ fontWeight: 500, color: "var(--text-1)", fontSize: "var(--fs-base)", marginBottom: 4 }}>{t}</div>
                  <div style={{ color: "var(--text-2)", fontSize: "var(--fs-sm)", lineHeight: 1.5 }}>Collapses to one column when space runs out.</div>
                </div>
              ))}
            </Grid>
            <p className="ds-hint">
              The layout primitives - Container, Stack, Cluster and Grid - are fluid with no breakpoints
              required: the Grid collapses to a single column instead of overflowing, so content reflows
              cleanly down to 320px and at 400% zoom (1.4.10). Controls also grow to 44-48px touch targets
              on touch devices, and the shared breakpoints above are there for the few layouts that need
              explicit query points.
            </p>
          </div>
        </div>

        {/* Accessibility */}
        <div className="ds-section">
          <span className="ds-label">Accessibility</span>
          <div className="ds-sectitle">WCAG 2.2 AA - built into the foundation</div>
          <div className="ds-card">
            {[
              "Contrast verified AA on every pairing, and re-checked live whenever the brand color changes (1.4.3)",
              "Interactive borders, icons and the focus ring meet 3:1 non-text contrast (1.4.11)",
              "Every control clears a 24px target-size floor; large reaches 44px for touch (2.5.8)",
              "Layout reflows to a single column at 320px and controls grow to touch size on touch devices (2.5.5)",
              "Fluid min-height layout survives user text-spacing and 400% zoom without clipping (1.4.12 / 1.4.10)",
              "Visible keyboard focus ring, and prefers-reduced-motion is respected (2.4.7 / 2.3.3)",
            ].map((t) => (
              <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 0" }}>
                <Check size={16} style={{ color: "var(--accent-text)", flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: "var(--fs-base)", color: "var(--text-1)", lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}

            <div className="ds-label" style={{ margin: "20px 0 8px" }}>Interactive border · ≥3:1 non-text contrast</div>
            <div style={{ display: "inline-flex", alignItems: "center", minHeight: "var(--target-min)", padding: "9px 14px", border: "1.5px solid var(--border-interactive)", borderRadius: "var(--radius)", background: "var(--surface)", color: "var(--text-2)", fontSize: "var(--fs-base)" }}>
              Placeholder text
            </div>

            <p className="ds-hint">
              Still your responsibility at the app level: alt text, captions, heading and reading order,
              page language, the wording of error messages, and testing with real assistive technology.
            </p>
          </div>
        </div>

        {/* Conformance */}
        <div className="ds-section">
          <span className="ds-label">Proof</span>
          <div className="ds-sectitle">Conformance map · EN 301 549 / WCAG 2.2</div>
          <div className="ds-card">
            <p style={{ fontSize: "var(--fs-base)", color: "var(--text-2)", lineHeight: 1.6, margin: "0 0 22px", maxWidth: 620 }}>
              One source of truth for what the system satisfies and what stays your responsibility.
              It drives the automated test gate and the published accessibility statement, so the claim
              you make to auditors and buyers matches exactly what ships.
            </p>
            {CONFORMANCE.map((area) => (
              <div key={area.area} style={{ overflowX: "auto", marginBottom: 24 }}>
                <table className="ds-table">
                  <caption>{area.area}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Criterion</th>
                      <th scope="col">Level</th>
                      <th scope="col">Status</th>
                      <th scope="col">How</th>
                    </tr>
                  </thead>
                  <tbody>
                    {area.rows.map(([cid, name, level, status, how]) => (
                      <tr key={cid + name}>
                        <td><span className="ds-crit">{cid}</span> {name}</td>
                        <td>{level}</td>
                        <td><StatusBadge s={status} /></td>
                        <td style={{ color: "var(--text-2)" }}>{how}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <p className="ds-hint">
              Ships with two repo files: an accessibility-statement template you publish, and a setup
              guide that wires axe / jest-axe and eslint-plugin-jsx-a11y into CI so nothing merges below bar.
            </p>
          </div>
        </div>

        {/* Feedback */}
        <div className="ds-section">
          <span className="ds-label">Proof</span>
          <div className="ds-sectitle">Feedback mechanism</div>
          <AccessibilityFeedback />
        </div>

        {/* Footer note */}
        <div className="ds-section">
          <span className="ds-note"><Check size={13} /> Light and dark, any brand color, verified to WCAG 2.2 AA</span>
        </div>

        </main>
      </div>
    </ThemeProvider>
  );
}

/*
  A themeable, accessible design system — living style guide.

  HOW TO LIFT THIS INTO YOUR APP
  ------------------------------
  1. Tokens: PRESETS.sweet[mode] (./tokens) is the default (Sweet Rosewood) set
     of CSS custom properties. Apply them to a root element (e.g. :root or a
     <ThemeProvider> div) and every component inherits them. To brand it, pass
     any color to deriveAccent(hex, mode) (./color) — it snaps the color to
     accessible accent tokens (AA-targeted) that merge over the defaults.
     Light/dark or any single token is just a value change, no component edits.
  2. Component: <Button> and <Field> read only from CSS variables
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

import { PRESETS, BADGE_TONES, ALERT_TONES, BREAKPOINTS } from "./tokens";
import { contrast, hexToRgb, ratioTag, deriveAccent } from "./color";
import { Button, BUTTON_CSS } from "./Button";
import { Field, FIELD_CSS } from "./Field";
import { Textarea, TEXTAREA_CSS } from "./Textarea";
import { SearchField, SEARCH_CSS } from "./SearchField";
import { PasswordField, PASSWORD_CSS } from "./PasswordField";
import { Slider, SLIDER_CSS } from "./Slider";
import { FileUpload, FILEUPLOAD_CSS } from "./FileUpload";
import { NumberStepper, NUMBER_CSS } from "./NumberStepper";
import { FormGroup, FORMGROUP_CSS } from "./FormGroup";
import { Select, SELECT_CSS } from "./Select";
import { Checkbox, RadioGroup, Switch, SEL_CSS } from "./SelectionControls";
import { Badge, TagDemo, BADGE_CSS } from "./Badge";
import { AlertDemo, ALERT_CSS } from "./Alert";
import { Stack, Grid, RESPONSIVE_CSS } from "./Layout";
import { CONFORMANCE, StatusBadge, AccessibilityFeedback, CONF_CSS } from "./Conformance";

/* --------------------------------------------------------------- GUIDE CSS */

const GUIDE_CSS = `
.ds{background:var(--bg);color:var(--text-1);font-family:var(--font-body);
  min-height:100%;transition:background .25s,color .25s}
.ds-wrap{max-width:940px;margin:0 auto;padding:40px 28px 72px}
.ds-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.ds-label{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;
  letter-spacing:.11em;font-size:11px;color:var(--text-2)}
.ds-title{font-family:var(--font-display);font-weight:500;font-size:34px;
  color:var(--text-1);line-height:1.08;margin:6px 0 0}
.ds-sub{font-size:15px;color:var(--text-2);margin:8px 0 0;max-width:520px;line-height:1.6}
.ds-section{margin-top:48px}
.ds-sectitle{font-family:var(--font-display);font-weight:500;font-size:20px;color:var(--text-1);margin:10px 0 18px}
.ds-card{background:var(--surface);border:.5px solid var(--border);
  border-radius:min(calc(var(--radius) + 4px), 18px);padding:24px}
.ds-seg{font-family:var(--font-body);font-size:13px;padding:6px 12px;border:.5px solid var(--border);
  background:var(--surface);color:var(--text-2);cursor:pointer}
.ds-seg:first-child{border-radius:8px 0 0 8px}
.ds-seg:last-child{border-radius:0 8px 8px 0}
.ds-seg:not(:first-child){border-left:none}
.ds-seg[aria-pressed=true]{background:var(--text-1);color:var(--bg);border-color:var(--text-1)}
.ds-grp{display:inline-flex}
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

  useEffect(() => {
    const href =
      "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500" +
      "&family=Fraunces:opsz,wght@9..144,400;9..144,500&display=swap";
    if (!document.querySelector(`link[href="${href}"]`)) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      document.head.appendChild(l);
    }
  }, []);

  const p = PRESETS.sweet;
  const base_tokens = p[mode];
  // When a custom brand color is set, snap it to accessible accent tokens; otherwise use the curated default.
  const tokens = color ? { ...base_tokens, ...deriveAccent(color, mode) } : base_tokens;

  // Type scale generated from one base size and ratio.
  const fs = {
    sm: Math.round(base / ratio), base,
    lg: Math.round(base * ratio),
    xl: Math.round(base * ratio ** 2),
    x2: Math.round(base * ratio ** 3),
    x3: Math.round(base * ratio ** 4),
  };
  // Spacing scale generated as multiples of one base unit.
  const scaleVars = {
    "--fs-sm": fs.sm + "px", "--fs-base": fs.base + "px", "--fs-lg": fs.lg + "px",
    "--fs-xl": fs.xl + "px", "--fs-2xl": fs.x2 + "px", "--fs-3xl": fs.x3 + "px",
    "--space-1": unit + "px", "--space-2": unit * 2 + "px", "--space-3": unit * 3 + "px",
    "--space-4": unit * 4 + "px", "--space-6": unit * 6 + "px", "--space-8": unit * 8 + "px",
  };
  const bt = BADGE_TONES[mode];
  const at = ALERT_TONES[mode];
  const dynVars = {};
  for (const [tone, c] of Object.entries(bt)) {
    dynVars[`--bd-${tone}-sb`] = c.sb; dynVars[`--bd-${tone}-sf`] = c.sf;
    dynVars[`--bd-${tone}-lb`] = c.lb; dynVars[`--bd-${tone}-lf`] = c.lf;
  }
  for (const [tone, c] of Object.entries(at)) {
    dynVars[`--al-${tone}-bg`] = c.bg; dynVars[`--al-${tone}-border`] = c.border;
    dynVars[`--al-${tone}-head`] = c.head; dynVars[`--al-${tone}-body`] = c.body;
  }
  const vars = {
    ...tokens, ...scaleVars, ...dynVars,
    "--radius": shape,
    "--target-min": "24px", "--target-touch": "44px",
    "--font-display": p.fonts.display, "--font-body": p.fonts.body,
  };

  // Live WCAG check for the active accent (curated or custom).
  const rFill = contrast([255, 255, 255], hexToRgb(tokens["--accent-fill"]));
  const rText = contrast(hexToRgb(tokens["--accent-text"]), hexToRgb(tokens["--bg"]));

  return (
    <div className="ds" style={vars}>
      <style>{GUIDE_CSS + BUTTON_CSS + FIELD_CSS + RESPONSIVE_CSS + CONF_CSS + SEL_CSS + SELECT_CSS + BADGE_CSS + ALERT_CSS
        + TEXTAREA_CSS + SEARCH_CSS + PASSWORD_CSS + SLIDER_CSS + FILEUPLOAD_CSS + NUMBER_CSS + FORMGROUP_CSS}</style>
      <div className="ds-wrap">

        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <span className="ds-label">Design system</span>
            <h1 className="ds-title">A themeable, accessible foundation</h1>
            <p className="ds-sub">
              Color, type, shape, density and more are each a single token. Change one and the
              whole system re-tunes — and it can never ship below WCAG AA.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div className="ds-grp" role="group" aria-label="Mode">
              <button className="ds-seg" aria-pressed={mode === "light"} onClick={() => setMode("light")} aria-label="Light mode"><Sun size={15} /></button>
              <button className="ds-seg" aria-pressed={mode === "dark"} onClick={() => setMode("dark")} aria-label="Dark mode"><Moon size={15} /></button>
            </div>
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
                <button className="ds-seg" style={{ borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 6 }}
                  onClick={() => setColor(null)}><RotateCcw size={13} /> Reset</button>
              )}
            </div>
            <div className="ds-ctrl" style={{ marginBottom: 18 }}>
              <label htmlFor="ds-base">Type</label>
              <input id="ds-base" type="range" min="14" max="20" step="1" value={base}
                onChange={(e) => setBase(+e.target.value)} aria-label="Base font size" />
              <div className="ds-grp" role="group" aria-label="Type ratio">
                {[1.125, 1.2, 1.25].map((x) => (
                  <button key={x} className="ds-seg" aria-pressed={ratio === x} onClick={() => setRatio(x)}>{x}</button>
                ))}
              </div>
              <span className="ds-read">{base}px base · scale {fs.sm}–{fs.x3}</span>
            </div>
            <div className="ds-ctrl" style={{ marginBottom: 18 }}>
              <label>Spacing</label>
              <div className="ds-grp" role="group" aria-label="Spacing base unit">
                {[4, 6, 8].map((x) => (
                  <button key={x} className="ds-seg" aria-pressed={unit === x} onClick={() => setUnit(x)}>{x}px</button>
                ))}
              </div>
              <span className="ds-read">{unit}px base · {unit}–{unit * 8}px</span>
            </div>
            <div className="ds-ctrl">
              <label>Shape</label>
              <div className="ds-grp" role="group" aria-label="Corner shape">
                {[["Sharp", "4px"], ["Rounded", "10px"], ["Pill", "999px"]].map(([lab, v]) => (
                  <button key={v} className="ds-seg" aria-pressed={shape === v} onClick={() => setShape(v)}>{lab}</button>
                ))}
              </div>
              <span className="ds-read">radius {shape === "999px" ? "pill" : shape}</span>
            </div>
          </div>
        </div>

        {/* Identity card */}
        <div className="ds-section">
          <span className="ds-label">Identity</span>
          <div className="ds-sectitle" style={{ marginBottom: 16 }}>{color ? "Custom palette" : p.name}</div>
          <div className="ds-card" style={{ maxWidth: 470 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-fill)" }} />
              <span className="ds-label">Appearance</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--fs-2xl)", color: "var(--text-1)", lineHeight: 1.15, marginBottom: 9 }}>
              Make it yours
            </div>
            <p style={{ fontSize: "var(--fs-base)", color: "var(--text-2)", lineHeight: 1.6, margin: "0 0 20px" }}>
              Change the brand color or toggle light and dark above — the tokens flow through every
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
              Both sizes come from one base and ratio, so the whole hierarchy re-tunes together — drag Type above to feel it.
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
            <div className="ds-label" style={{ margin: "22px 0 12px" }}>Applied — gap and padding</div>
            <div style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-4)", background: "var(--bg)", border: ".5px solid var(--border)", borderRadius: "var(--radius)" }}>
              <div className="ds-box" style={{ width: 56, height: 40 }} />
              <div className="ds-box" style={{ width: 56, height: 40 }} />
              <div className="ds-box" style={{ width: 56, height: 40 }} />
            </div>
            <p className="ds-hint">Here the gap uses space-3 and the padding uses space-4 — change the base unit to watch the rhythm expand or tighten.</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="ds-section">
          <span className="ds-label">Component</span>
          <div className="ds-sectitle">Button</div>
          <div className="ds-card">
            <div className="ds-label" style={{ marginBottom: 14 }}>Variants × sizes — hover or Tab to try</div>
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
                hint="Keep it short — this appears in the changelog." />
              <Textarea label="Short bio" maxLength={120} showCount enforceMax={false}
                hint="Type past the limit to see it flagged rather than truncated."
                defaultValue="Design engineer working on accessible interfaces." />
            </div>
            <p className="ds-hint">
              The Field shell applied to a multi-line input. The counter is described to the field, so focusing
              it announces the budget, and a separate polite region only speaks in the last 20 characters —
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
              something to clear, carries a label, and returns focus to the input — the browser's own WebKit
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
              Page Up / Down move it, and a click anywhere on the track jumps to that value — so nothing here
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
              at all (2.5.7) — the input stays in the tab order and draws its focus ring on the label. Chosen
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
              value announcements for free. The − and + buttons are the pointer and touch addition — 44px each,
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
              again — unchecking it restores the fields, checking it unmounts them so they leave the tab order
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
              rounded-square, so it never collides with radios at the pill setting — flip Shape above to try it.
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
              and type-ahead, choose with Enter, dismiss with Escape — and focus returns to the trigger.
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
              Soft tint across four tones, each with an icon and text so severity never rests on color alone —
              the icon is sized up as the primary non-color cue. The dismiss is a real 24px button with an
              aria-label and focus ring. Pass live="assertive" (role=alert) or live="polite" (role=status) for
              alerts inserted dynamically; static callouts stay silent to assistive tech. Verified AA in light and dark.
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
            <div className="ds-label" style={{ marginBottom: 12 }}>Grid — resize to watch it reflow</div>
            <Grid min={190}>
              {["Overview", "Members", "Billing", "Security"].map((t) => (
                <div key={t} style={{ background: "var(--surface)", border: ".5px solid var(--border)", borderRadius: "var(--radius)", padding: "var(--space-4)" }}>
                  <div style={{ fontWeight: 500, color: "var(--text-1)", fontSize: "var(--fs-base)", marginBottom: 4 }}>{t}</div>
                  <div style={{ color: "var(--text-2)", fontSize: "var(--fs-sm)", lineHeight: 1.5 }}>Collapses to one column when space runs out.</div>
                </div>
              ))}
            </Grid>
            <p className="ds-hint">
              The layout primitives — Container, Stack, Cluster and Grid — are fluid with no breakpoints
              required: the Grid collapses to a single column instead of overflowing, so content reflows
              cleanly down to 320px and at 400% zoom (1.4.10). Controls also grow to 44–48px touch targets
              on touch devices, and the shared breakpoints above are there for the few layouts that need
              explicit query points.
            </p>
          </div>
        </div>

        {/* Accessibility */}
        <div className="ds-section">
          <span className="ds-label">Accessibility</span>
          <div className="ds-sectitle">WCAG 2.2 AA — built into the foundation</div>
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

      </div>
    </div>
  );
}

/*
  ThemeProvider - the supported way into the system.

  Every component here reads only CSS custom properties, which means something
  has to put those properties on an ancestor. Until now the only implementation
  of that lived inside StyleGuide, so anyone consuming the library had to
  reverse-engineer the assembly: which vars exist, how the type scale is
  derived, that badge and alert tones expand into --bd-* and --al-* families.
  This is that logic, extracted and supported.

  buildTheme() is the pure half - no React, no DOM. Call it directly when you
  want to write the variables somewhere this component cannot reach, such as
  :root in a global stylesheet or a server-rendered style attribute:

    const { vars } = buildTheme({ mode: "dark", accent: "#2E6F5E" });
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

  mode="system" follows prefers-color-scheme and keeps following it, so a theme
  toggle that offers Light / Dark / System needs no extra wiring.

  Three ways to colour it, in increasing order of rope:

    accent        a brand colour, used as the fill; its label adapts (AA held)
    textColor     a text colour, snapped to a --text-1 / --text-2 pair (AA held)
    onAccentColor the label on brand-coloured surfaces, snapped to clear them
    overrides     raw { "--token": value } pairs, applied last and unchecked

  The first two cannot drop the system below AA no matter what you pass them.
  overrides can, by design - it exists for the case where a designer has made a
  deliberate choice the derivation would otherwise overrule.

  loadFonts defaults to false on purpose. Injecting a Google Fonts <link> makes
  a third-party request on behalf of the host application, which is a privacy
  and CSP decision that belongs to the app, not to a component it imported.
  Opt in with loadFonts, or self-host and override --font-display / --font-body.
*/

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PRESETS, BADGE_TONES, ALERT_TONES } from "./tokens";
import { deriveAccent, deriveTextPair, snapToContrast } from "./color";

const ThemeContext = createContext(null);

/* Pure token assembly. Same output shape the style guide has always used. */
export function buildTheme({
  preset = "sweet", mode = "light", accent = null, textColor = null,
  onAccentColor = null, overrides = null,
  radius = "10px", baseSize = 16, ratio = 1.2, spacingUnit = 8,
  targetMin = "24px", targetTouch = "44px",
} = {}) {
  const p = PRESETS[preset] || PRESETS.sweet;
  const resolved = mode === "dark" ? "dark" : "light";
  const base = p[resolved];

  // A custom brand colour becomes the fill as-is; deriveAccent adapts the label
  // and the on-page tokens around it, so re-theming cannot drop below AA.
  const accented = accent ? { ...base, ...deriveAccent(accent, resolved) } : base;

  /*
    A custom text colour gets the same treatment: snapped to a --text-1 /
    --text-2 pair that clears AA against whatever background is in play. Note it
    reads the background from `accented` rather than from the preset, so a
    background someone has overridden below is still what the text is measured
    against on the next render.
  */
  const texted = textColor
    ? { ...accented, ...deriveTextPair(textColor, accented["--bg"]) }
    : accented;

  /*
    The label on brand-coloured surfaces. Left alone it is derived - white or a
    dark ink, whichever clears the fill. Set it and that choice is honoured, but
    still snapped: a label is the one thing on a button that has to be readable,
    so a colour that does not clear its own surface is moved until it does.

    Applied to both inks, each measured against its own surface. --accent-fill
    and --accent-marker are the same colour for most brands but not all, and a
    single hex forced onto both without checking is how a legible button ends up
    next to an invisible checkmark.
  */
  const inked = onAccentColor
    ? {
        ...texted,
        "--accent-on-fill": snapToContrast(onAccentColor, texted["--accent-fill"], 4.5),
        "--accent-on-marker": snapToContrast(onAccentColor, texted["--accent-marker"], 4.5),
      }
    : texted;

  /*
    Manual overrides are the deliberate escape hatch, and the one place the AA
    guarantee does not hold: they are applied raw, exactly as given. Everything
    above snaps a colour until it passes; this hands the value straight through,
    because a system that silently corrects a designer's explicit choice is not
    an override at all. Callers that need the guarantee should use `accent` and
    `textColor` and leave this alone - and anything offering it as a UI owes the
    user a live contrast readout, which is what the style guide does.
  */
  const manual = overrides || {};
  const tokens = { ...inked, ...manual };

  const fs = {
    sm: Math.round(baseSize / ratio),
    base: baseSize,
    lg: Math.round(baseSize * ratio),
    xl: Math.round(baseSize * ratio ** 2),
    x2: Math.round(baseSize * ratio ** 3),
    x3: Math.round(baseSize * ratio ** 4),
  };

  const scaleVars = {
    "--fs-sm": `${fs.sm}px`, "--fs-base": `${fs.base}px`, "--fs-lg": `${fs.lg}px`,
    "--fs-xl": `${fs.xl}px`, "--fs-2xl": `${fs.x2}px`, "--fs-3xl": `${fs.x3}px`,
    "--space-1": `${spacingUnit}px`, "--space-2": `${spacingUnit * 2}px`,
    "--space-3": `${spacingUnit * 3}px`, "--space-4": `${spacingUnit * 4}px`,
    "--space-6": `${spacingUnit * 6}px`, "--space-8": `${spacingUnit * 8}px`,
  };

  // Badge and alert tone tables expand into per-tone variable families, which
  // is how those two components stay pure CSS-variable readers.
  const toneVars = {};
  for (const [tone, c] of Object.entries(BADGE_TONES[resolved])) {
    toneVars[`--bd-${tone}-sb`] = c.sb; toneVars[`--bd-${tone}-sf`] = c.sf;
    toneVars[`--bd-${tone}-lb`] = c.lb; toneVars[`--bd-${tone}-lf`] = c.lf;
  }
  /*
    The accent badge is the one tone that is not semantic - it means "brand",
    so it has to follow the brand. The table is a curated set of preset values,
    which left a green-themed app rendering a rosewood "accent" badge with a
    hardcoded white label. Point it at the accent tokens already derived above,
    and only when a custom accent was actually passed, so the preset's own
    look is untouched by default.
  */
  if (accent) {
    toneVars["--bd-accent-sb"] = tokens["--accent-tint"];
    toneVars["--bd-accent-sf"] = tokens["--accent-on-tint"];
    toneVars["--bd-accent-lb"] = tokens["--accent-fill"];
    toneVars["--bd-accent-lf"] = tokens["--accent-on-fill"];
  }
  for (const [tone, c] of Object.entries(ALERT_TONES[resolved])) {
    toneVars[`--al-${tone}-bg`] = c.bg; toneVars[`--al-${tone}-border`] = c.border;
    toneVars[`--al-${tone}-head`] = c.head; toneVars[`--al-${tone}-body`] = c.body;
  }

  return {
    mode: resolved,
    tokens,
    fonts: p.fonts,
    fontScale: fs,
    vars: {
      ...tokens, ...scaleVars, ...toneVars,
      "--radius": radius,
      "--target-min": targetMin, "--target-touch": targetTouch,
      "--font-display": p.fonts.display, "--font-body": p.fonts.body,
      // Last again, so an override of something with an explicit entry above
      // (--radius, a font) wins rather than being quietly discarded.
      ...manual,
    },
  };
}

/* Resolves mode="system" against prefers-color-scheme, and keeps following it. */
function useResolvedMode(mode) {
  const [systemMode, setSystemMode] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (mode !== "system" || typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setSystemMode(e.matches ? "dark" : "light");
    setSystemMode(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  return mode === "system" ? systemMode : mode;
}

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400..700" +
  "&family=Playfair+Display:wght@400..700&display=swap";

export function ThemeProvider({
  preset = "sweet", mode = "light", accent = null, textColor = null,
  onAccentColor = null, overrides = null,
  radius = "10px", baseSize = 16, ratio = 1.2, spacingUnit = 8,
  loadFonts = false, fontHref = FONT_HREF,
  as: Tag = "div", className, style, children, ...rest
}) {
  const resolvedMode = useResolvedMode(mode);

  /*
    overrides is an object, so it would be a new reference on every render of a
    caller that writes it inline - the common case. Keying the memo on its
    contents instead of its identity keeps that caller from re-deriving the
    whole token set on every keystroke, without making them memoise it first.
  */
  const overrideKey = overrides ? JSON.stringify(overrides) : "";

  const theme = useMemo(
    () => buildTheme({
      preset, mode: resolvedMode, accent, textColor, onAccentColor, overrides,
      radius, baseSize, ratio, spacingUnit,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- overrideKey stands in for overrides
    [preset, resolvedMode, accent, textColor, onAccentColor, overrideKey, radius, baseSize, ratio, spacingUnit]
  );

  useEffect(() => {
    if (!loadFonts || typeof document === "undefined") return;
    // Dedupe via a marker attribute and a JS comparison, never by putting the
    // URL inside the selector. A long href full of ?, &, + and : is fragile to
    // match that way - it silently fails to match in some implementations, and
    // every mount then appends another <link>.
    const already = Array.from(document.querySelectorAll("link[data-ds-fonts]"))
      .some((l) => l.getAttribute("href") === fontHref);
    if (already) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontHref;
    link.setAttribute("data-ds-fonts", "");
    document.head.appendChild(link);
  }, [loadFonts, fontHref]);

  return (
    <ThemeContext.Provider value={theme}>
      <Tag
        className={["ds-theme", className].filter(Boolean).join(" ")}
        // Tells the browser which built-in control palette to use, so native
        // scrollbars and form chrome match the theme rather than fighting it.
        style={{ ...theme.vars, colorScheme: theme.mode, ...style }}
        {...rest}
      >
        {children}
      </Tag>
    </ThemeContext.Provider>
  );
}

/* Reads the resolved theme. Useful for the rare thing that needs a value in JS
   rather than CSS - a canvas fill, a chart series, a contrast readout. */
export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("useTheme must be used inside a <ThemeProvider>");
  return theme;
}

export const THEME_CSS = `
.ds-theme{background:var(--bg);color:var(--text-1);font-family:var(--font-body);
  transition:background .25s,color .25s}
@media (prefers-reduced-motion:reduce){.ds-theme{transition:none}}
`;

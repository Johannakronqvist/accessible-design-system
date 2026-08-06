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

  loadFonts defaults to false on purpose. Injecting a Google Fonts <link> makes
  a third-party request on behalf of the host application, which is a privacy
  and CSP decision that belongs to the app, not to a component it imported.
  Opt in with loadFonts, or self-host and override --font-display / --font-body.
*/

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PRESETS, BADGE_TONES, ALERT_TONES } from "./tokens";
import { deriveAccent } from "./color";

const ThemeContext = createContext(null);

/* Pure token assembly. Same output shape the style guide has always used. */
export function buildTheme({
  preset = "sweet", mode = "light", accent = null,
  radius = "10px", baseSize = 16, ratio = 1.2, spacingUnit = 8,
  targetMin = "24px", targetTouch = "44px",
} = {}) {
  const p = PRESETS[preset] || PRESETS.sweet;
  const resolved = mode === "dark" ? "dark" : "light";
  const base = p[resolved];

  // A custom brand colour is snapped to accessible accent tokens rather than
  // used raw, so re-theming cannot silently drop below AA.
  const tokens = accent ? { ...base, ...deriveAccent(accent, resolved) } : base;

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
  preset = "sweet", mode = "light", accent = null,
  radius = "10px", baseSize = 16, ratio = 1.2, spacingUnit = 8,
  loadFonts = false, fontHref = FONT_HREF,
  as: Tag = "div", className, style, children, ...rest
}) {
  const resolvedMode = useResolvedMode(mode);

  const theme = useMemo(
    () => buildTheme({ preset, mode: resolvedMode, accent, radius, baseSize, ratio, spacingUnit }),
    [preset, resolvedMode, accent, radius, baseSize, ratio, spacingUnit]
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

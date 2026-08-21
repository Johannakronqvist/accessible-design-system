/*
  Design tokens - the single source of truth for color, and the tone tables
  and breakpoints the components and style guide theme from.

  PRESETS.sweet[mode] is the default (Sweet Rosewood) set of CSS custom
  properties. Apply them to a root element (e.g. :root or a <ThemeProvider>
  div) and every component inherits them. To brand it, pass any color to
  deriveAccent(hex, mode) (see ./color) - it snaps the color to accessible
  accent tokens that merge over these defaults.
*/

export const PRESETS = {
  sweet: {
    name: "Sweet Rosewood",
    // Both faces are variable across 400..700, so every weight the components
    // author - the 500 on labels and buttons, the 600 on alert headings and
    // legends - resolves exactly rather than rounding to a neighbouring cut.
    fonts: { display: "'Playfair Display', serif", body: "'Open Sans', sans-serif" },
    light: {
      "--bg": "#FCF8F5", "--surface": "#FFFFFF", "--text-1": "#2A2320",
      "--text-2": "#6C625D", "--border": "#EFE6DF", "--border-interactive": "#8E8880", "--radius": "10px",
      "--accent-fill": "#9E4A4E", "--accent-fill-hover": "#843C40",
      "--accent-fill-active": "#6E3236", "--accent-on-fill": "#FFFFFF",
      // The same colour doing the bare-shape job (1.4.11): Sweet Rosewood
      // already clears 3:1 on --surface, so these match the fill pair exactly.
      "--accent-marker": "#9E4A4E", "--accent-on-marker": "#FFFFFF",
      "--accent-text": "#883C42", "--accent-tint": "#FAEBE6", "--accent-on-tint": "#7A3236",
      "--secondary-bg": "#FAEBE6", "--secondary-bg-hover": "#F4DCD4",
      "--secondary-text": "#7A3236", "--secondary-border": "transparent",
      "--danger-fill": "#B4322F", "--success": "#15803D", "--warning": "#B45309",
      "--danger": "#B4322F", "--info": "#1D4ED8", "--ring": "#883C42",
      "--disabled-bg": "#F3EFEA", "--disabled-text": "#B4ADA2", "--disabled-border": "#EDE6DF",
    },
    dark: {
      "--bg": "#1B1618", "--surface": "#251F21", "--text-1": "#F4EEEC",
      "--text-2": "#B6ABA6", "--border": "#3A3234", "--border-interactive": "#7D726B", "--radius": "10px",
      "--accent-fill": "#A85055", "--accent-fill-hover": "#B85E63",
      "--accent-fill-active": "#C56D72", "--accent-on-fill": "#FFFFFF",
      "--accent-marker": "#A85055", "--accent-on-marker": "#FFFFFF",
      "--accent-text": "#E7A1A6", "--accent-tint": "#3A2528", "--accent-on-tint": "#F1C7C9",
      "--secondary-bg": "#3A2528", "--secondary-bg-hover": "#462E31",
      "--secondary-text": "#F1C7C9", "--secondary-border": "transparent",
      "--danger-fill": "#B4322F", "--success": "#79C98F", "--warning": "#E9B15E",
      "--danger": "#F08A85", "--info": "#A9C2FF", "--ring": "#E7A1A6",
      "--disabled-bg": "#2A2426", "--disabled-text": "#6E655F", "--disabled-border": "#34302E",
    },
  },
};

// Badge tone tables → emitted as --bd-<tone>-* CSS vars by the theme layer.
// sb/sf = soft background/foreground, lb/lf = solid background/foreground.
export const BADGE_TONES = {
  light: {
    neutral: { sb: "#EFEAE4", sf: "#565249", lb: "#565249", lf: "#FFFFFF" },
    accent:  { sb: "#FAEBE6", sf: "#7A3236", lb: "#9E4A4E", lf: "#FFFFFF" },
    success: { sb: "#E3F0E8", sf: "#0F6E36", lb: "#15803D", lf: "#FFFFFF" },
    warning: { sb: "#F7ECD9", sf: "#8F4708", lb: "#8F4708", lf: "#FFFFFF" },
    danger:  { sb: "#F8E7E4", sf: "#9A2C29", lb: "#B4322F", lf: "#FFFFFF" },
    info:    { sb: "#E5EAFB", sf: "#1A45C0", lb: "#1D4ED8", lf: "#FFFFFF" },
  },
  dark: {
    neutral: { sb: "#34302E", sf: "#D8D2CC", lb: "#4A443F", lf: "#F4EEEC" },
    accent:  { sb: "#3A2528", sf: "#F1C7C9", lb: "#A85055", lf: "#FFFFFF" },
    success: { sb: "#163524", sf: "#79C98F", lb: "#1E7A45", lf: "#FFFFFF" },
    warning: { sb: "#362810", sf: "#E9B15E", lb: "#7A5214", lf: "#FFFFFF" },
    danger:  { sb: "#3C221F", sf: "#F08A85", lb: "#B4322F", lf: "#FFFFFF" },
    info:    { sb: "#1E2747", sf: "#A9C2FF", lb: "#2E5BD6", lf: "#FFFFFF" },
  },
};

// Alert tone tables → emitted as --al-<tone>-* CSS vars by the theme layer.
export const ALERT_TONES = {
  light: {
    info:    { bg: "#E5EAFB", border: "#C9D6F7", head: "#1A45C0", body: "#26324F" },
    success: { bg: "#E3F0E8", border: "#C6E1CE", head: "#0F6E36", body: "#24352A" },
    warning: { bg: "#F7ECD9", border: "#EBD8B6", head: "#8F4708", body: "#3E2F14" },
    danger:  { bg: "#F8E7E4", border: "#F0CDC7", head: "#9A2C29", body: "#4A2724" },
  },
  dark: {
    info:    { bg: "#1E2747", border: "#2E3B63", head: "#A9C2FF", body: "#C7D3F0" },
    success: { bg: "#163524", border: "#24492F", head: "#79C98F", body: "#BFE0C9" },
    warning: { bg: "#362810", border: "#4A3A18", head: "#E9B15E", body: "#E3CDA1" },
    danger:  { bg: "#3C221F", border: "#522E29", head: "#F08A85", body: "#F0C4C0" },
  },
};

// Shared breakpoints (px). Media/container queries can't read CSS vars, so these
// are the canonical values consumers reference in their own @media queries.
export const BREAKPOINTS = { sm: 480, md: 768, lg: 1024, xl: 1280 };

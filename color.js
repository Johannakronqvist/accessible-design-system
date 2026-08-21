/*
  Color / accessibility math.

  Pure functions with no React or DOM dependencies. deriveAccent() snaps any
  brand color to a set of accessible accent tokens (AA-targeted) for the given
  mode; the rest are the WCAG contrast primitives it and the guide rely on.
*/

export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0, l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
}

export function hslToRgb(h, s, l) {
  h /= 360;
  const hue = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue(p, q, h + 1 / 3) * 255, hue(p, q, h) * 255, hue(p, q, h - 1 / 3) * 255];
}

export function luminance([r, g, b]) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a, b) {
  const la = luminance(a), lb = luminance(b), hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/*
  Below this saturation the input has no meaningful hue. rgbToHsl reports h=0
  for any grey, because the hue branch only runs when the channels differ - so
  flooring saturation the way a chromatic input needs would turn black, white
  and any grey into red. Treated as neutral instead, they derive greys.
*/
const NEUTRAL_S = 0.08;

/*
  Round to whole channels before measuring. hslToRgb returns floats but rgbToHex
  rounds on the way out, so testing the float and shipping the rounded value let
  a shade that passed at 4.5001 land at 4.49. Measuring what actually ships is
  the only way the >=4.5 guarantee holds.
*/
const snapRgb = (c) => [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])];

/*
  Derive the accent tokens for a brand color.

  Two rules, and they are the whole design:

  1. A color that already passes is kept exactly as it is. The search only ever
     moves a value that fails. Earlier this function started every search from a
     fixed mid lightness and took the first shade that cleared 4.5:1, which
     quietly *downgraded* good input - #8D2A2F went in at 8.4:1 against white
     and came back as #C94A51 at 4.6:1. Deriving a worse color than the one you
     were handed is not a safety feature.

  2. The label adapts to the fill, not the other way round. --accent-on-fill
     used to be hardcoded white, which meant any brand color too light for white
     text had to be darkened until it fit - a pale yellow came back olive. Now
     the ink is chosen to suit the fill, so the fill never has to move.

     That second rule is total, not just usually true. For white ink to fail on
     a color its relative luminance must be above 0.1833, and for black ink to
     fail it must be below 0.175; no color can be both. At least one of them
     always clears 4.5:1, so every brand color is usable exactly as picked.

  What still gets derived is everything that has to sit on a *different*
  surface: --accent-text on the page background, --accent-on-tint on the tint.
  Those are separate contrast problems the brand color cannot always solve, and
  they still move when they must - starting from their own lightness, so the
  result stays as close to the picked color as the ratio allows.
*/
export function deriveAccent(hex, mode) {
  const input = snapRgb(hexToRgb(hex));
  const { h, s } = rgbToHsl(...input);
  const dark = mode === "dark";
  const neutral = s < NEUTRAL_S;
  // Saturation floors apply only to shades this function has to invent. The
  // picked color itself is never re-saturated - it is the thing being honoured.
  const sat = neutral ? 0 : Math.min(0.82, Math.max(0.4, s));
  const tintSat = neutral ? 0 : dark ? 0.34 : 0.5;
  const bg = dark ? [27, 22, 24] : [252, 248, 245];
  // The lighter of the two page colors in both modes, so it is the harder
  // partner to clear - a shape that reads against surface reads against bg too.
  const surface = dark ? [37, 31, 33] : [255, 255, 255];
  const white = [255, 255, 255];
  const T = 4.5;
  const NON_TEXT = 3; // 1.4.11, for shapes rather than text

  // The fill is the color that was picked. Full stop.
  const fill = input;

  /*
    Ink to sit on a brand-colored surface: white when white works, otherwise a
    very dark shade of the same hue, with pure black as the guaranteed backstop.
    Used twice - once for the fill, once for the marker below.
  */
  const darkInk = snapRgb(hslToRgb(h, neutral ? 0 : Math.min(sat, 0.45), 0.13));
  const inkFor = (on) =>
    contrast(white, on) >= T
      ? white
      : contrast(darkInk, on) >= T
        ? darkInk
        : [0, 0, 0];
  const ink = inkFor(fill);

  /*
    Hover and active move the fill and must not break the label sitting on it.
    The conventional direction is darker in light mode and lighter in dark mode,
    but on a pale fill carrying dark ink that direction destroys the contrast -
    so try it, and take the opposite when it does not hold.
  */
  const fh = rgbToHsl(...fill);
  const shift = (amount) => {
    for (const dir of dark ? [1, -1] : [-1, 1]) {
      const l = Math.min(0.97, Math.max(0.03, fh.l + dir * amount));
      const c = snapRgb(hslToRgb(fh.h, fh.s, l));
      if (contrast(c, ink) >= T) return c;
    }
    return fill;
  };
  const hov = shift(0.08);
  const act = shift(0.15);

  /*
    For the tokens that sit on another surface: keep the picked color when it
    already clears the bar there, and otherwise walk from its own lightness
    rather than from a fixed starting point - the shortest move that works.
  */
  const keepOrWalk = (satFor, ok) => {
    if (ok(input)) return input;
    const from = Math.round(rgbToHsl(...input).l * 100);
    const step = dark ? 1 : -1;
    for (let l = from; l >= 0 && l <= 100; l += step) {
      const c = snapRgb(hslToRgb(h, satFor, l / 100));
      if (ok(c)) return c;
    }
    return dark ? [255, 255, 255] : [0, 0, 0];
  };

  /*
    The marker is the same brand color doing a different job: a bare shape on
    the page - a tab underline, a radio dot, a checkbox - rather than a surface
    with a label on it. Nothing sits on top to carry the identity, so the shape
    itself has to be discernible against what is behind it (1.4.11, 3:1).

    Its own saturation is kept rather than the floored `sat`, because this is
    meant to be the picked color moved as little as possible - and for most
    colors it is not moved at all. Anything already clearing 3:1 against the
    surface comes back untouched, which is a little over half of the RGB cube.
  */
  const marker = keepOrWalk(s, (c) => contrast(c, surface) >= NON_TEXT);
  const onMarker = inkFor(marker);

  const text = keepOrWalk(dark ? sat * 0.7 : sat, (c) => contrast(c, bg) >= T);
  const tint = snapRgb(hslToRgb(h, tintSat, dark ? 0.17 : 0.94));
  const onTint = keepOrWalk(dark ? sat * 0.5 : sat, (c) => contrast(c, tint) >= T);
  const tintHov = snapRgb(hslToRgb(h, tintSat, dark ? 0.22 : 0.9));

  const H = rgbToHex;
  return {
    "--accent-fill": H(fill), "--accent-fill-hover": H(hov), "--accent-fill-active": H(act),
    "--accent-on-fill": H(ink), "--accent-marker": H(marker), "--accent-on-marker": H(onMarker),
    "--accent-text": H(text), "--accent-tint": H(tint), "--accent-on-tint": H(onTint),
    "--secondary-bg": H(tint), "--secondary-bg-hover": H(tintHov), "--secondary-text": H(onTint),
    "--secondary-border": "transparent", "--ring": H(text),
  };
}

export function ratioTag(r) { return r >= 7 ? "AAA" : r >= 4.5 ? "AA" : "FAIL"; }

/*
  Text colors.

  deriveAccent answers "what accent survives this brand color". These answer the
  question the theme controls could not previously ask at all: what can the text
  be? The accent search and this one share a rule - walk lightness until the
  first shade that clears the target, so the result stays as close to the hue
  you asked for as the ratio allows.

  Direction is read from the background rather than passed in as a mode, so
  these keep working against a background someone has overridden by hand.
*/

// Whether dark ink or light ink has more contrast room on this background.
function prefersDarkInk(bgRgb) {
  return contrast(bgRgb, [0, 0, 0]) >= contrast(bgRgb, [255, 255, 255]);
}

/*
  Walk lightness toward whichever end of the range gains contrast, and return
  the first shade that clears the target. fromL (0-100) is where to start: pass
  the caller's own lightness to honour a colour that already works, or leave it
  out to start from the middle and let the search pick the strongest hue-true
  shade. Returns black or white if the hue cannot reach the target at all.
*/
function walkToContrast(h, s, bgRgb, target, fromL) {
  const dark = prefersDarkInk(bgRgb);
  const start = fromL == null ? (dark ? 62 : 38) : Math.round(fromL);
  const step = dark ? -1 : 1;
  for (let l = start; l >= 0 && l <= 100; l += step) {
    const c = snapRgb(hslToRgb(h, s, l / 100));
    if (contrast(c, bgRgb) >= target) return c;
  }
  return dark ? [0, 0, 0] : [255, 255, 255];
}

/*
  A short palette of text colours that all clear `target` on this background.

  The target is AAA rather than AA on purpose: this picks the *primary* text
  colour, where 4.5:1 is a floor for incidental text and a poor default for
  paragraphs.

  The search also starts from a deliberately strong lightness instead of the
  middle of the range. Starting mid and stopping at the first pass returns the
  palest shade that technically clears the bar - a set of washed-out mid-tones
  nobody would choose for body text. Starting strong returns rich shades that
  clear it with room to spare, and the guide shows every measured ratio rather
  than asking anyone to take that on trust.
*/
export function suggestTextColors(bgHex, { accentHex = null, target = 7 } = {}) {
  const bgRgb = hexToRgb(bgHex);
  // Rich rather than borderline - see the note above.
  const strongL = prefersDarkInk(bgRgb) ? 30 : 78;
  const bgHue = rgbToHsl(...bgRgb).h;
  const accentHue = accentHex ? rgbToHsl(...hexToRgb(accentHex)).h : bgHue;

  const candidates = [
    // Carries the background's own hue at low saturation, so it reads as a warm
    // or cool near-black rather than as a second colour on the page.
    { label: "Ink", h: bgHue, s: 0.14 },
    { label: "Neutral", h: 0, s: 0 },
    { label: "Brand", h: accentHue, s: 0.42 },
    { label: "Slate", h: 215, s: 0.24 },
    { label: "Forest", h: 158, s: 0.34 },
    { label: "Plum", h: 292, s: 0.3 },
  ];

  const seen = new Set();
  const out = [];
  for (const c of candidates) {
    const rgb = walkToContrast(c.h, c.s, bgRgb, target, strongL);
    const hex = rgbToHex(rgb);
    // Greys collapse onto each other on a neutral background - one swatch per
    // distinct result, so the row never offers the same colour twice.
    if (seen.has(hex)) continue;
    seen.add(hex);
    const ratio = contrast(rgb, bgRgb);
    /*
      `meets` rather than an assumption. A mid grey background caps out around
      5.2:1 against black, so on one of those no text colour reaches AAA and
      walkToContrast returns the strongest shade it can instead. Saying so lets
      the caller badge the row honestly rather than promising a bar the
      background makes unreachable.
    */
    out.push({ label: c.label, hex, ratio, meets: ratio >= target });
  }
  return out;
}

/*
  Snap a chosen text colour to the --text-1 / --text-2 pair.

  --text-1 keeps the choice untouched when it already clears the target, and is
  moved the shortest distance that makes it pass when it does not - the same
  promise deriveAccent makes about a brand colour.

  --text-2 is the muted partner: the *last* shade still clearing the target on
  the way back toward the background, so secondary text is as recessive as it
  can be without dropping below the bar. Deriving it rather than taking it from
  the preset is what keeps the pair coherent - a preset --text-2 alongside a
  custom --text-1 reads as two unrelated greys.
*/
/*
  Keep a colour exactly as given when it already clears `target` against
  `againstHex`, and otherwise move it the shortest distance that does.

  The one rule every colour control in this system shares, so it lives in one
  place: a picked colour is never quietly edited when it already works, and
  never moved further than it has to when it does not.

  Note it tests the input itself before touching it. Going through HSL and back
  is lossy - #2A2320 round-trips to #2B2421 - so deriving even a colour that
  already passes would hand back a value one shade off the one that was picked,
  and a colour picker that silently edits your choice is a bug.
*/
export function snapToContrast(hex, againstHex, target = 4.5) {
  const against = hexToRgb(againstHex);
  const input = hexToRgb(hex);
  if (contrast(input, against) >= target) return rgbToHex(input);
  const { h, s, l } = rgbToHsl(...input);
  return rgbToHex(walkToContrast(h, s, against, target, l * 100));
}

/*
  Ink for a brand-coloured surface - a button label, a checkmark.

  Deliberately not suggestTextColors. That one picks text for a *page* and aims
  for the richest shade that clears the bar, because dark-on-light body copy
  wants depth. A label on a coloured button wants the opposite: as far from the
  fill as it can get, so it stays legible against a surface it does not control.
  Running the page rule here returned six near-identical pastels all sitting at
  4.51-4.62:1, and never offered plain white - which on most brand colours is
  both the best contrast and the obvious answer.

  So each candidate starts at the extreme end of the range and is only pulled
  back if it somehow fails, which for an extreme it will not. The hues give
  tinted whites and near-blacks that read as deliberate rather than as six
  shades of the same grey.
*/
export function suggestInkColors(onHex, { accentHex = null, target = 4.5 } = {}) {
  const on = hexToRgb(onHex);
  const goDark = prefersDarkInk(on);
  const onHue = rgbToHsl(...on).h;
  const accentHue = accentHex ? rgbToHsl(...hexToRgb(accentHex)).h : onHue;

  // Light inks sit near the top of the range, dark inks near the bottom.
  const L = goDark ? 0.12 : 0.94;
  const candidates = [
    { label: goDark ? "Black" : "White", h: 0, s: 0, l: goDark ? 0 : 1 },
    { label: "Tinted", h: accentHue, s: 0.3, l: L },
    { label: "Neutral", h: 0, s: 0, l: goDark ? 0.16 : 0.9 },
    { label: "Slate", h: 215, s: 0.26, l: L },
    { label: "Cream", h: 35, s: 0.34, l: L },
    { label: "Forest", h: 158, s: 0.26, l: L },
  ];

  const seen = new Set();
  const out = [];
  for (const c of candidates) {
    let rgb = snapRgb(hslToRgb(c.h, c.s, c.l));
    // Pull toward the extreme only if the starting shade does not clear it.
    if (contrast(rgb, on) < target) {
      rgb = walkToContrast(c.h, c.s, on, target, c.l * 100);
    }
    const hex = rgbToHex(rgb);
    if (seen.has(hex)) continue;
    seen.add(hex);
    const ratio = contrast(rgb, on);
    out.push({ label: c.label, hex, ratio, meets: ratio >= target });
  }
  // Strongest first - on a button the most legible option is the best default,
  // and it puts plain white or black where the eye lands first.
  return out.sort((a, b) => b.ratio - a.ratio);
}

export function deriveTextPair(textHex, bgHex, target = 4.5) {
  const bgRgb = hexToRgb(bgHex);
  const { h, s } = rgbToHsl(...hexToRgb(textHex));
  const primary = hexToRgb(snapToContrast(textHex, bgHex, target));

  const step = prefersDarkInk(bgRgb) ? 1 : -1;
  let secondary = primary;
  for (let x = rgbToHsl(...primary).l * 100 + step; x >= 0 && x <= 100; x += step) {
    const c = snapRgb(hslToRgb(h, s, x / 100));
    if (contrast(c, bgRgb) < target) break;
    secondary = c;
  }
  return { "--text-1": rgbToHex(primary), "--text-2": rgbToHex(secondary) };
}

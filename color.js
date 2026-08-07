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

// Snap any brand color to accessible accent tokens for the given mode (target AA 4.5).
export function deriveAccent(hex, mode) {
  const { h, s } = rgbToHsl(...hexToRgb(hex));
  const dark = mode === "dark";
  const neutral = s < NEUTRAL_S;
  // A chromatic input gets saturation floored so the accent reads as a brand
  // color; a neutral one gets zero, so the result stays on the grey axis.
  const sat = neutral ? 0 : Math.min(0.82, Math.max(0.4, s));
  // The tint saturations are fixed rather than derived, so they need the same
  // branch - otherwise a grey brand color still gets a pink tint.
  const tintSat = neutral ? 0 : (dark ? 0.34 : 0.5);
  const bg = dark ? [27, 22, 24] : [252, 248, 245];
  const white = [255, 255, 255], T = 4.5;
  /*
    Round each candidate to whole channels before measuring it. hslToRgb returns
    floats, but rgbToHex rounds on the way out - so testing the float and
    shipping the rounded value let a shade that passed at 4.5001 land at 4.49.
    Measuring what actually ships is the only way the >=4.5 guarantee holds.
  */
  const snap = (c) => [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])];
  const down = (sm, from, ok) => { for (let l = from; l >= 6; l--) { const c = snap(hslToRgb(h, sat * sm, l / 100)); if (ok(c)) return c; } return snap(hslToRgb(h, sat, from / 100)); };
  const up = (sm, from, ok) => { for (let l = from; l <= 94; l++) { const c = snap(hslToRgb(h, sat * sm, l / 100)); if (ok(c)) return c; } return snap(hslToRgb(h, sat, from / 100)); };
  const fill = down(1, dark ? 66 : 58, (c) => contrast(white, c) >= T);
  const text = dark ? up(0.7, 58, (c) => contrast(c, bg) >= T) : down(1, 52, (c) => contrast(c, bg) >= T);
  const tint = dark ? hslToRgb(h, tintSat, 0.17) : hslToRgb(h, tintSat, 0.94);
  const onTint = dark ? up(0.5, 70, (c) => contrast(c, tint) >= T) : down(1, 48, (c) => contrast(c, tint) >= T);
  const fh = rgbToHsl(...fill);
  const hov = dark ? hslToRgb(fh.h, fh.s, Math.min(0.74, fh.l + 0.08)) : hslToRgb(fh.h, fh.s, Math.max(0.05, fh.l - 0.07));
  const act = dark ? hslToRgb(fh.h, fh.s, Math.min(0.82, fh.l + 0.15)) : hslToRgb(fh.h, fh.s, Math.max(0.03, fh.l - 0.13));
  const tintHov = dark ? hslToRgb(h, tintSat, 0.22) : hslToRgb(h, tintSat, 0.9);
  const H = rgbToHex;
  return {
    "--accent-fill": H(fill), "--accent-fill-hover": H(hov), "--accent-fill-active": H(act),
    "--accent-on-fill": "#FFFFFF", "--accent-text": H(text), "--accent-tint": H(tint), "--accent-on-tint": H(onTint),
    "--secondary-bg": H(tint), "--secondary-bg-hover": H(tintHov), "--secondary-text": H(onTint),
    "--secondary-border": "transparent", "--ring": H(text),
  };
}

export function ratioTag(r) { return r >= 7 ? "AAA" : r >= 4.5 ? "AA" : "FAIL"; }

/**
 * @huekit/hex — convert hex colors to oklch()
 *
 * Part of huekit, the OKLCH toolkit for designers.
 * Zero dependencies. Pure math. ~1kb.
 */

export interface OklchColor {
  /** Lightness, 0–1 */
  l: number;
  /** Chroma, 0+ (typically 0–0.37 in sRGB gamut) */
  c: number;
  /** Hue angle in degrees, 0–360. Returns 0 for achromatic colors. */
  h: number;
}

export interface HexToOklchOptions {
  /** Return raw { l, c, h } instead of a CSS oklch() string. */
  raw?: boolean;
}

/** Below this chroma, a color is treated as achromatic and h is set to 0. */
export const ACHROMATIC_THRESHOLD = 1e-4;

/**
 * Convert a CSS hex color to an oklch() CSS string.
 *
 * @example
 * hexToOklch('#3b82f6')              // → 'oklch(0.6231 0.188 259.8145)'
 * hexToOklch('#3b82f6', 2)           // → 'oklch(0.62 0.19 259.81)'
 * hexToOklch('#fff')                 // → 'oklch(1 0 0)'
 * hexToOklch('#3b82f6', 4, { raw: true }) // → { l: 0.6231, c: 0.188, h: 259.8145 }
 */
export function hexToOklch(hex: string, precision: number | undefined, options: { raw: true }): OklchColor;
export function hexToOklch(hex: string, precision?: number, options?: { raw?: false }): string;
export function hexToOklch(hex: string, precision?: number, options?: HexToOklchOptions): string | OklchColor;
export function hexToOklch(
  hex: string,
  precision = 4,
  options: HexToOklchOptions = {}
): string | OklchColor {
  const [r, g, b] = parseHex(hex);

  // sRGB → linear RGB (inverse gamma)
  const lr = linearize(r / 255);
  const lg = linearize(g / 255);
  const lb = linearize(b / 255);

  // linear RGB → LMS (Ottosson's Oklab matrix)
  const lms_l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const lms_m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const lms_s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  // cube-root compression
  const l_ = Math.cbrt(lms_l);
  const m_ = Math.cbrt(lms_m);
  const s_ = Math.cbrt(lms_s);

  // LMS → OKLab
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bv = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // OKLab → OKLCH (cartesian → polar)
  const C = Math.sqrt(a * a + bv * bv);
  let H = 0;
  if (C >= ACHROMATIC_THRESHOLD) {
    H = (Math.atan2(bv, a) * 180) / Math.PI;
    if (H < 0) H += 360;
  }

  const p = precision;
  if (options.raw) {
    return { l: round(L, p), c: round(C, p), h: round(H, p) };
  }
  return `oklch(${round(L, p)} ${round(C, p)} ${round(H, p)})`;
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.trim().replace(/^#/, "");
  if (clean.length !== 3 && clean.length !== 6) {
    throw new Error(`Invalid hex color: "${hex}". Expected 3 or 6 digits.`);
  }
  if (!/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error(`Invalid hex color: "${hex}". Contains non-hex characters.`);
  }
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function linearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function round(n: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(n * factor) / factor;
}

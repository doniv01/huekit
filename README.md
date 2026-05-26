<img src="https://raw.githubusercontent.com/doniv01/huekit/main/banner.svg" alt="@huekit/hex — convert hex colors to oklch()" width="100%"/>

# @huekit/hex

> Convert hex colors to `oklch()` CSS strings. Zero dependencies. ~1kb.
> The first piece of [**huekit**](https://github.com/doniv01/huekit), the OKLCH toolkit for designers.

```js
import { hexToOklch } from '@huekit/hex'

hexToOklch('#3b82f6')         // → 'oklch(0.6231 0.188 259.8145)'
hexToOklch('#3b82f6', 2)      // → 'oklch(0.62 0.19 259.81)'
hexToOklch('#fff')            // → 'oklch(1 0 0)'
hexToOklch('#e11d48', 4, { raw: true }) // → { l: 0.5858, c: 0.222, h: 17.58 }
```

## What is OKLCH and why does it matter?

Hex codes like `#3b82f6` are how computers store colors — not how humans think about them. You can't look at `#ca0000` and know it's a dark red, or know how to make it lighter without trial and error.

**OKLCH** is a CSS color format that maps directly to how we *see* color:

| Part | What it controls | Example |
|------|-----------------|---------|
| `L` lightness | How light or dark (0 = black → 1 = white) | `0.60` = medium |
| `C` chroma | How vivid or muted (0 = gray → ~0.37 = max) | `0.20` = saturated |
| `H` hue | The color angle in degrees (0–360) | `264` = blue |

So `oklch(0.60 0.20 264)` reads: *medium light, saturated, blue*. You understand it without rendering it.

### Why this matters for design systems

**Predictable lightness.** In HSL, yellow at `50%` lightness looks much brighter than blue at `50%` lightness. OKLCH fixes this — equal L values look equally light to the human eye. Generating accessible color palettes becomes trivial.

**Better gradients.** sRGB gradients go through a muddy grey "dead zone" in the middle. OKLCH gradients arc through the hues cleanly. That's why Tailwind v4, shadcn/ui, and most modern design systems have switched.

**P3 wide-gamut support.** Modern displays can show ~50% more colors than old sRGB monitors. Only OKLCH can reach them. Hex can't.

**It's native CSS today.** Ships in all modern browsers — no polyfills needed.

### The migration problem this solves

Every existing design tool — Figma, Sketch, your old CSS — outputs hex. You need a bridge. `@huekit/hex` is that bridge: hand it a hex value, get back a ready-to-paste `oklch()` string.

## Install

```sh
npm install @huekit/hex
```

Works with Node.js ≥18, Bun, Deno, and every modern bundler. TypeScript types are included.

## API

### `hexToOklch(hex, precision?, options?)`

| Parameter   | Type     | Default | Description                                    |
|-------------|----------|---------|------------------------------------------------|
| `hex`       | `string` | —       | 3 or 6-digit hex, with or without `#`          |
| `precision` | `number` | `4`     | Decimal places in the output                   |
| `options`   | `object` | `{}`    | Pass `{ raw: true }` to get `{ l, c, h }` back |

Returns a CSS `oklch(L C H)` string by default, or `{ l, c, h }` when `raw: true`. Throws on invalid input.

```js
// Default: CSS string
hexToOklch('#e11d48')
// → 'oklch(0.5858 0.222 17.58')

// Control precision for cleaner output
hexToOklch('#e11d48', 2)
// → 'oklch(0.59 0.22 17.58)'

// Raw values for math / further processing
hexToOklch('#e11d48', 4, { raw: true })
// → { l: 0.5858, c: 0.222, h: 17.58 }

// Achromatic colors return hue 0 (not undefined floating-point noise)
hexToOklch('#ffffff')
// → 'oklch(1 0 0)'

// Works with 3-digit shorthand and without the # prefix
hexToOklch('fff')
// → 'oklch(1 0 0)'
```

### Constants

```ts
export const ACHROMATIC_THRESHOLD: number
// Chroma below this value triggers h=0. Default 1e-4.
```

## How it works

Pure math, no dependencies. The conversion pipeline follows Björn Ottosson's [Oklab specification](https://bottosson.github.io/posts/oklab/):

```
hex → sRGB → linearize (remove gamma) → LMS via Oklab matrix → OKLab → OKLCH
```

About 50 lines of math. That's the whole package.

## Use cases

**Migrating a design system to OKLCH**

```js
import { hexToOklch } from '@huekit/hex'

const tokens = { primary: '#6366f1', danger: '#ef4444', success: '#22c55e' }
const oklch = Object.fromEntries(
  Object.entries(tokens).map(([k, v]) => [k, hexToOklch(v, 3)])
)
// { primary: 'oklch(0.541 0.244 277)', ... }
```

**Generating a lightness scale from a brand color**

```js
const { c, h } = hexToOklch('#6366f1', 4, { raw: true })
const scale = [0.97, 0.93, 0.87, 0.74, 0.60, 0.51, 0.44, 0.37, 0.29, 0.22]
  .map(l => `oklch(${l} ${c} ${h})`)
// Perceptually even 50–950 scale, all same hue and chroma.
```

**Checking if a color is warm or cool**

```js
const { h } = hexToOklch('#ff6b6b', 1, { raw: true })
const temperature = (h < 90 || h > 270) ? 'warm' : 'cool'
```

## The huekit suite

`@huekit/hex` is the entry point. The full toolkit (in progress):

| Package | What it does |
|---------|--------------|
| **`@huekit/hex`** ← you are here | hex → oklch() conversion |
| `@huekit/scale` | generate a full 50–950 lightness scale from one hue+chroma |
| `@huekit/mix` | blend two OKLCH colors, skip the muddy midpoint |
| `@huekit/contrast` | WCAG contrast ratios for OKLCH, `getReadableOn()` helper |
| `@huekit/tailwind` | brand hex → Tailwind v4 `@theme` block |
| `@huekit/tokens` | design tokens object → CSS custom properties in OKLCH |

## License

MIT

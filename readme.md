# a11y-color-contrast-checker

[![GitHub](https://img.shields.io/github/license/EswaramoorthyKarthikeyan/a11y-color-contrast-checker)](./license.md)
[![GitHub stars](https://img.shields.io/github/stars/EswaramoorthyKarthikeyan/a11y-color-contrast-checker)](https://github.com/EswaramoorthyKarthikeyan/a11y-color-contrast-checker)

A TypeScript color contrast checker that scans your page during development and highlights elements failing [WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) contrast requirements with a hand‑drawn marker effect — no browser extension required.

---

## Table of Contents

- [WCAG 2.1 — SC 1.4.3](#wcag-21--sc-143-contrast-minimum-level-aa)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Exports](#exports)
- [Customizing the Highlight](#customizing-the-highlight)
- [How It Works](#how-it-works)
- [Browser Compatibility](#browser-compatibility)
- [Contributing](#contributing)
- [License](#license)

---

## WCAG 2.1 — SC 1.4.3: Contrast (Minimum) (Level AA)

The visual presentation of text and images of text must have a contrast ratio of at least **4.5:1**, except for the following:

- **Large Text** — Large‑scale text (≥ 24 px, or ≥ 18.5 px **bold**) must have a contrast ratio of at least **3:1**.
- **Incidental** — Text that is part of an inactive UI component, pure decoration, invisible, or part of a picture with significant other visual content has no contrast requirement.
- **Logotypes** — Text that is part of a logo or brand name has no contrast requirement.

See the [official WCAG 2.1 guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) for full details.

---

## Features

- ✅ Checks color contrast against **WCAG 2.1 Level AA** thresholds (4.5:1 normal, 3:1 large text).
- 🖍️ Highlights failing elements with a **hand‑drawn marker effect** via an injected `::after` pseudo‑element.
- 🎨 Marker color and angle are **customizable** with CSS custom properties.
- ⚡ Reacts to CSS property changes (`background-color`, `color`, `font-size`, `font-weight`) in real time using [`style-observer`](https://github.com/LeaVerou/style-observer).
- 🔄 Detects DOM structure changes (added / removed elements) via `MutationObserver`.
- 🎛️ Configurable WCAG criteria (contrast ratios, text‑size thresholds, bold weight).
- 🎨 Supports **all CSS Color Level 4 formats**: hex, `rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()`, `color()` (srgb, display-p3, a98-rgb, prophoto-rgb, rec2020, xyz, etc.), and named colors.
- 🧪 **157 tests** (vitest + happy‑dom).
- 📦 Ships with TypeScript `.d.ts` declarations.
- 📤 Supports **ESM**, **CJS**, and **IIFE** output formats.

---

## Installation

### From GitHub

```bash
npm install github:EswaramoorthyKarthikeyan/a11y-color-contrast-checker
```

```bash
pnpm add github:EswaramoorthyKarthikeyan/a11y-color-contrast-checker
```

### From source

```bash
git clone https://github.com/EswaramoorthyKarthikeyan/a11y-color-contrast-checker.git
cd a11y-color-contrast-checker
pnpm install
pnpm build
```

### CDN (IIFE)

```html
<script src="https://cdn.jsdelivr.net/gh/EswaramoorthyKarthikeyan/a11y-color-contrast-checker@main/dist/iife/index.js"></script>
```

---

## Quick Start

### ES Modules (React example)

```tsx
import { useEffect } from "react";
import { ColorContrastChecker } from "a11y-color-contrast-checker";

function App() {
  useEffect(() => {
    const container = document.querySelector("#root");
    const checker = new ColorContrastChecker(container);
    checker.init();

    return () => checker.destroy();
  }, []);

  return (
    <div id="root">
      <p style={{ background: "#fff", color: "#767676" }}>
        This text will be flagged (ratio ≈ 4.48, below 4.5)
      </p>
      <p style={{ background: "#fff", color: "#000" }}>
        This text is fine (ratio = 21)
      </p>
    </div>
  );
}

export default App;
```

### IIFE (script tag)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Contrast Checker Demo</title>
  </head>
  <body>
    <div id="container">
      <p style="background: #fff; color: #767676;">Low contrast text</p>
    </div>

    <script src="https://cdn.jsdelivr.net/gh/EswaramoorthyKarthikeyan/a11y-color-contrast-checker@main/dist/iife/index.js"></script>
    <script>
      const checker = new colorContrast.ColorContrastChecker(
        document.querySelector("#container"),
      );
      checker.init();
    </script>
  </body>
</html>
```

---

## API Reference

### `new ColorContrastChecker(container?, criteriaInfo?)`

Creates a new checker instance.

| Parameter      | Type                        | Default         | Description                                 |
| -------------- | --------------------------- | --------------- | ------------------------------------------- |
| `container`    | `HTMLElement \| null`       | `document.body` | The DOM subtree to scan for contrast issues. |
| `criteriaInfo` | `CriteriaInfo \| undefined` | See below       | Optional WCAG criteria overrides.            |

#### `CriteriaInfo`

Pass a full `CriteriaInfo` object to override the defaults. The entire parameter is optional — when omitted, all defaults apply.

```typescript
interface CriteriaInfo {
  /** Min font size (px) that counts as "large text" regardless of weight. */
  largeTextMinSize: number; // default: 24

  /** Min font size (px) that counts as "large text" when bold. */
  largeTextBoldMinSize: number; // default: 18.5

  /** Min font weight considered bold. */
  boldMinWeight: number; // default: 700

  /** Required contrast ratio for normal text. */
  normalContrastRatio: number; // default: 4.5

  /** Required contrast ratio for large text. */
  largeContrastRatio: number; // default: 3
}
```

**Example — enforce WCAG AAA thresholds:**

```typescript
const checker = new ColorContrastChecker(document.body, {
  largeTextMinSize: 24,
  largeTextBoldMinSize: 18.5,
  boldMinWeight: 700,
  normalContrastRatio: 7, // AAA
  largeContrastRatio: 4.5, // AAA
});
```

---

### `init()`

Starts scanning the container and begins observing for style and DOM changes. Failing elements are highlighted immediately.

### `destroy()`

Stops all observers, removes every highlight and `data-color-contrast` attribute from the DOM, and removes the injected stylesheet. Call this when the checker is no longer needed (e.g. in a React cleanup function).

### `calculateContrastRatio(bgColor, textColor)`

A public utility that returns the WCAG contrast ratio between two CSS color strings.

```typescript
const checker = new ColorContrastChecker();
checker.calculateContrastRatio("rgb(255, 255, 255)", "rgb(118, 118, 118)");
// → 4.48
```

---

## Exports

The package exposes both runtime exports and type exports:

```typescript
// Runtime
import { ColorContrastChecker, ColorUtil } from "a11y-color-contrast-checker";

// Types
import type {
  RGBAColor,
  ColorFormat,
  CriteriaInfo,
  StyleObject,
  ElementStyle,
  ColorType,
} from "a11y-color-contrast-checker";
```

| Export                   | Kind  | Description                                    |
| ------------------------ | ----- | ---------------------------------------------- |
| `ColorContrastChecker`   | class | Main checker — scan, observe, highlight.       |
| `ColorUtil`              | class | Color parsing, luminance, alpha compositing.   |
| `RGBAColor`              | type  | `{ r, g, b, a }` color object.                 |
| `ColorFormat`            | type  | `"hex" \| "rgb" \| "rgba" \| "hsl" \| "hsla" \| "hwb" \| "oklch" \| "oklab" \| "lab" \| "lch" \| "color"` |
| `CriteriaInfo`           | type  | WCAG criteria configuration.                   |
| `StyleObject`            | type  | `Record<string, string>` for inline styles.    |
| `ElementStyle`           | type  | `{ bgColor, color, fontSize, fontWeight }`     |
| `ColorType`              | type  | `"bgColor" \| "color"`                         |

---

## Supported Color Formats

`ColorUtil` can parse and convert **every CSS Color Level 4 format** to sRGB for contrast computation:

| Format | Examples |
| --- | --- |
| **Hex** | `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa` |
| **RGB** (legacy & modern) | `rgb(255, 0, 0)`, `rgb(255 0 0)`, `rgb(100% 0% 0% / 50%)` |
| **HSL** (legacy & modern) | `hsl(120, 100%, 50%)`, `hsl(120deg 100% 50% / 0.5)` |
| **HWB** | `hwb(0 0% 0%)`, `hwb(120deg 20% 10% / 0.8)` |
| **Lab** | `lab(50 -20 30)`, `lab(50% -20 30 / 0.5)` |
| **LCH** | `lch(50 30 270)`, `lch(50 30 270deg / 0.5)` |
| **OKLab** | `oklab(0.7 -0.1 0.1)`, `oklab(70% -0.1 0.1 / 50%)` |
| **OKLCH** | `oklch(0.7 0.15 180)`, `oklch(70% 0.15 180 / 0.5)` |
| **`color()`** | `color(srgb 1 0 0)`, `color(display-p3 1 0 0 / 0.5)` |
| **Named colors** | `red`, `rebeccapurple`, `transparent`, etc. |

The `color()` function supports all predefined color spaces: `srgb`, `srgb-linear`, `display-p3`, `a98-rgb`, `prophoto-rgb`, `rec2020`, `xyz`, `xyz-d50`, `xyz-d65`.

All formats support the `none` keyword (treated as `0`) and the `/` alpha syntax. Hue values accept angle units (`deg`, `rad`, `grad`, `turn`).

---

## Customizing the Highlight

The marker effect is driven by two CSS custom properties. Override them on `:root` or any ancestor of the highlighted elements:

| Property             | Default       | Description                             |
| -------------------- | ------------- | --------------------------------------- |
| `--a11y-mark-color`  | `255 100 185` | RGB channels for the marker (pink).     |
| `--a11y-mark-angle`  | `150deg`      | Angle of the linear‑gradient fill.      |

```css
/* Red marker */
[data-color-contrast]::after {
  --a11y-mark-color: 255 50 50;
  --a11y-mark-angle: 170deg;
}

/* Yellow marker */
[data-color-contrast]::after {
  --a11y-mark-color: 255 232 62;
  --a11y-mark-angle: 50deg;
}

/* Green marker */
[data-color-contrast]::after {
  --a11y-mark-color: 91 233 92;
  --a11y-mark-angle: 30deg;
}
```

> **Tip:** Every failing element receives a `data-color-contrast` attribute whose value is the computed contrast ratio (e.g. `data-color-contrast="2.14"`). You can use this in CSS selectors or in DevTools to inspect specific failures.

---

## How It Works

```
┌──────────────────────────────────────────────────┐
│                  init()                          │
│                                                  │
│  1. Inject marker highlight <style>              │
│  2. Initial full scan (recursive DOM walk)       │
│  3. Start StyleObserver on:                      │
│     background-color, color, font-size,          │
│     font-weight                                  │
│  4. Start MutationObserver on: childList         │
│                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  │
│  │   StyleObserver    │  │  MutationObserver   │  │
│  │                    │  │                     │  │
│  │ CSS prop changed?  │  │ Element added?      │  │
│  │ → re-check element │  │ → observe + check   │  │
│  │ → re-check children│  │                     │  │
│  │   (if bg/color)    │  │ Element removed?    │  │
│  │                    │  │ → unobserve         │  │
│  └────────────────────┘  └─────────────────────┘  │
│                                                  │
│  For each text-bearing element:                  │
│  ┌──────────────────────────────────────────┐    │
│  │ 1. Skip hidden / disabled / aria-hidden  │    │
│  │ 2. Walk up DOM → alpha-composite bg      │    │
│  │ 3. Compute WCAG contrast ratio           │    │
│  │ 4. Determine threshold (normal vs large) │    │
│  │ 5. ratio < threshold → add marker        │    │
│  │    ratio ≥ threshold → remove marker     │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│                 destroy()                        │
│  Disconnect observers, remove markers + styles   │
└──────────────────────────────────────────────────┘
```

- **[`style-observer`](https://github.com/LeaVerou/style-observer)** by Lea Verou — uses CSS `transition` events to detect computed style changes from any source (class toggles, media queries, `:hover`, JavaScript, etc.).
- **`MutationObserver`** — watches for structural DOM changes so newly added elements are automatically scanned.
- **Alpha compositing** — semi‑transparent backgrounds are blended layer‑by‑layer up the ancestor chain using the standard "source over" formula to compute the actual visual background color.

---

## Browser Compatibility

This library depends on [`style-observer`](https://github.com/LeaVerou/style-observer), which requires CSS transition support for detecting property changes:

| Browser | Minimum Version |
| ------- | --------------- |
| Chrome  | 97+             |
| Safari  | 15.4+           |
| Firefox | 104+            |

---

## Contributing

1. Fork the [repository](https://github.com/EswaramoorthyKarthikeyan/a11y-color-contrast-checker).
2. Clone your fork: `git clone https://github.com/<your-username>/a11y-color-contrast-checker.git`
3. Install dependencies: `pnpm install`
4. Build: `pnpm build`
5. Run tests: `pnpm test`
6. Type‑check: `pnpm typecheck`
7. Submit a pull request.

---

## License

[MIT](./license.md) © Eswaramoorthy Karthikeyan
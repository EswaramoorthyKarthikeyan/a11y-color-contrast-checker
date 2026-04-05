import { RGBAColor, ColorFormat, StyleObject, ElementStyle, ColorType } from "./types";

class ColorUtil {
	// ── Static regex constants ──────────────────────────────────────────
	private static readonly HEX_REGEX = /^#([A-Fa-f0-9]{3,4}){1,2}$/;
	private static readonly RGBA_COMMA_REGEX =
		/^rgba?\(\s*([\d.]+%?|none)\s*,\s*([\d.]+%?|none)\s*,\s*([\d.]+%?|none)\s*(?:,\s*([\d.]+%?|none))?\s*\)$/;
	private static readonly RGBA_SPACE_REGEX =
		/^rgba?\(\s*([\d.]+%?|none)\s+([\d.]+%?|none)\s+([\d.]+%?|none)\s*(?:\/\s*([\d.]+%?|none))?\s*\)$/;
	private static readonly HSLA_COMMA_REGEX =
		/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([01]?\.?\d*))?\s*\)$/;
	private static readonly HSLA_SPACE_REGEX =
		/^hsla?\(\s*([\d.]+(?:deg|rad|grad|turn)?|none)\s+([\d.]+%?|none)\s+([\d.]+%?|none)\s*(?:\/\s*([\d.]+%?|none))?\s*\)$/;
	private static readonly HWB_REGEX =
		/^hwb\(\s*([\d.]+(?:deg|rad|grad|turn)?|none)\s+([\d.]+%?|none)\s+([\d.]+%?|none)\s*(?:\/\s*([\d.]+%?|none))?\s*\)$/;
	private static readonly OKLCH_REGEX =
		/^oklch\(\s*([\d.]+%?|none)\s+([\d.]+%?|none)\s+([\d.]+(?:deg|rad|grad|turn)?|none)\s*(?:\/\s*([\d.]+%?|none))?\s*\)$/;
	private static readonly OKLAB_REGEX =
		/^oklab\(\s*([\d.]+%?|none)\s+([-\d.]+%?|none)\s+([-\d.]+%?|none)\s*(?:\/\s*([\d.]+%?|none))?\s*\)$/;
	private static readonly LAB_REGEX =
		/^lab\(\s*([\d.]+%?|none)\s+([-\d.]+%?|none)\s+([-\d.]+%?|none)\s*(?:\/\s*([\d.]+%?|none))?\s*\)$/;
	private static readonly LCH_REGEX =
		/^lch\(\s*([\d.]+%?|none)\s+([\d.]+%?|none)\s+([\d.]+(?:deg|rad|grad|turn)?|none)\s*(?:\/\s*([\d.]+%?|none))?\s*\)$/;
	private static readonly COLOR_FUNC_REGEX =
		/^color\(\s*(srgb|srgb-linear|display-p3|a98-rgb|prophoto-rgb|rec2020|xyz|xyz-d50|xyz-d65)\s+([-\d.]+%?|none)\s+([-\d.]+%?|none)\s+([-\d.]+%?|none)\s*(?:\/\s*([\d.]+%?|none))?\s*\)$/;
	private static readonly RGBA_PARSE_REGEX = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;

	getColorFormat(colorString: string): ColorFormat {
		if (ColorUtil.HEX_REGEX.test(colorString)) {
			return "hex";
		} else if (/^rgba?\(/.test(colorString)) {
			return colorString.startsWith("rgba") ? "rgba" : "rgb";
		} else if (/^hsla?\(/.test(colorString)) {
			return colorString.startsWith("hsla") ? "hsla" : "hsl";
		} else if (/^hwb\(/.test(colorString)) {
			return "hwb";
		} else if (/^color\(/.test(colorString)) {
			return "color";
		} else if (/^oklch\(/.test(colorString)) {
			return "oklch";
		} else if (/^oklab\(/.test(colorString)) {
			return "oklab";
		} else if (/^lab\(/.test(colorString)) {
			return "lab";
		} else if (/^lch\(/.test(colorString)) {
			return "lch";
		} else if (colorString !== "") {
			const resolved: string = this.resolveNamedColor(colorString);
			if (resolved.startsWith("rgba")) {
				return "rgba";
			}
			return "rgb";
		} else {
			throw new Error(`Invalid color format: ${colorString}`);
		}
	}

	hexToRgba(hex: string, alpha: number = 1): string {
		hex = hex.replace(/^#/, "");

		// Expand shorthand: 3-digit (#RGB) → 6, or 4-digit (#RGBA) → 8
		if (hex.length === 3 || hex.length === 4) {
			hex = hex
				.split("")
				.map((h: string) => h + h)
				.join("");
		}

		const r: number = parseInt(hex.substring(0, 2), 16);
		const g: number = parseInt(hex.substring(2, 4), 16);
		const b: number = parseInt(hex.substring(4, 6), 16);

		// Extract alpha from 8-digit hex if present
		if (hex.length === 8) {
			alpha = parseInt(hex.substring(6, 8), 16) / 255;
			alpha = Math.round(alpha * 100) / 100; // round to 2 decimal places
		}

		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	hslToRgba(h: number, s: number, l: number, alpha: number = 1): string {
		h = ((h % 360) + 360) % 360;
		s /= 100;
		l /= 100;

		const c: number = (1 - Math.abs(2 * l - 1)) * s;
		const x: number = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m: number = l - c / 2;

		let r: number = 0;
		let g: number = 0;
		let b: number = 0;

		if (h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (h < 300) {
			r = x;
			g = 0;
			b = c;
		} else {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	/**
	 * Convert HWB color to rgba string.
	 * @param h Hue (degrees, 0–360)
	 * @param w Whiteness (0–100)
	 * @param b Blackness (0–100)
	 * @param alpha Alpha (0–1)
	 */
	hwbToRgba(h: number, w: number, b: number, alpha: number = 1): string {
		// Normalize w and b: if w + b > 100, scale both so w + b = 100
		if (w + b > 100) {
			const ratio = 100 / (w + b);
			w *= ratio;
			b *= ratio;
		}

		// Get the pure hue RGB (same as HSL with s=100, l=50)
		const baseRgba = this.hslToRgba(h, 100, 50, 1);
		const match = baseRgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
		if (!match) throw new Error("Internal error in hwbToRgba");

		let rVal = parseInt(match[1], 10);
		let gVal = parseInt(match[2], 10);
		let bVal = parseInt(match[3], 10);

		// Apply whiteness and blackness
		// channel = channel * (1 - w/100 - b/100) + (w/100) * 255
		const wFrac = w / 100;
		const bFrac = b / 100;
		const scale = 1 - wFrac - bFrac;

		rVal = Math.round(Math.max(0, Math.min(255, rVal * scale + wFrac * 255)));
		gVal = Math.round(Math.max(0, Math.min(255, gVal * scale + wFrac * 255)));
		bVal = Math.round(Math.max(0, Math.min(255, bVal * scale + wFrac * 255)));

		return `rgba(${rVal}, ${gVal}, ${bVal}, ${alpha})`;
	}

	/**
	 * Convert OKLCH color to rgba string.
	 * @param l Lightness (0–1)
	 * @param c Chroma (0–~0.4)
	 * @param h Hue (degrees, 0–360)
	 * @param alpha Alpha (0–1)
	 */
	oklchToRgba(l: number, c: number, h: number, alpha: number = 1): string {
		// OKLCH → OKLab
		const hRad = (h * Math.PI) / 180;
		const a = c * Math.cos(hRad);
		const b = c * Math.sin(hRad);
		return this.oklabToRgba(l, a, b, alpha);
	}

	/**
	 * Convert OKLab color to rgba string.
	 * @param l Lightness (0–1)
	 * @param a Green-red axis
	 * @param b Blue-yellow axis
	 * @param alpha Alpha (0–1)
	 */
	oklabToRgba(l: number, a: number, b: number, alpha: number = 1): string {
		// OKLab → LMS (cube-root space)
		const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
		const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
		const s_ = l - 0.0894841775 * a - 1.291485548 * b;

		// Undo cube root
		const lCubed = l_ * l_ * l_;
		const mCubed = m_ * m_ * m_;
		const sCubed = s_ * s_ * s_;

		// LMS → Linear sRGB
		const rLinear = +4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed;
		const gLinear = -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed;
		const bLinear = -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed;

		return `rgba(${this.linearSrgbToInt(rLinear)}, ${this.linearSrgbToInt(gLinear)}, ${this.linearSrgbToInt(bLinear)}, ${alpha})`;
	}

	/**
	 * Convert CIE Lab color to rgba string.
	 * @param l Lightness (0–100)
	 * @param a Green-red axis (typically -125 to 125)
	 * @param b Blue-yellow axis (typically -125 to 125)
	 * @param alpha Alpha (0–1)
	 */
	labToRgba(l: number, a: number, b: number, alpha: number = 1): string {
		// Lab → XYZ (D50)
		const ε = 216 / 24389;
		const κ = 24389 / 27;

		const fy = (l + 16) / 116;
		const fx = a / 500 + fy;
		const fz = fy - b / 200;

		const x = fx ** 3 > ε ? fx ** 3 : (116 * fx - 16) / κ;
		const y = l > κ * ε ? ((l + 16) / 116) ** 3 : l / κ;
		const z = fz ** 3 > ε ? fz ** 3 : (116 * fz - 16) / κ;

		// D50 white point
		const X = x * 0.96422;
		const Y = y * 1.0;
		const Z = z * 0.82521;

		// XYZ (D50) → XYZ (D65) via Bradford chromatic adaptation
		const X65 = X * 0.9554734527042182 + Y * -0.023098536874261423 + Z * 0.0632593086610217;
		const Y65 = X * -0.028369706963208136 + Y * 1.0099954580106629 + Z * 0.021041398966943008;
		const Z65 = X * 0.012314001688319899 + Y * -0.020507696433477912 + Z * 1.3303659366080753;

		// XYZ (D65) → Linear sRGB
		const rLinear = X65 * 3.2404541621141054 + Y65 * -1.5371385940306089 + Z65 * -0.49853140955601579;
		const gLinear = X65 * -0.96926603050518312 + Y65 * 1.8760108454466942 + Z65 * 0.041556017530349834;
		const bLinear = X65 * 0.055643430959114726 + Y65 * -0.20397695987307145 + Z65 * 1.0572251882231791;

		return `rgba(${this.linearSrgbToInt(rLinear)}, ${this.linearSrgbToInt(gLinear)}, ${this.linearSrgbToInt(bLinear)}, ${alpha})`;
	}

	/**
	 * Convert CIE LCH color to rgba string.
	 * @param l Lightness (0–100)
	 * @param c Chroma (0–~150)
	 * @param h Hue (degrees, 0–360)
	 * @param alpha Alpha (0–1)
	 */
	lchToRgba(l: number, c: number, h: number, alpha: number = 1): string {
		const hRad = (h * Math.PI) / 180;
		const a = c * Math.cos(hRad);
		const b = c * Math.sin(hRad);
		return this.labToRgba(l, a, b, alpha);
	}

	/**
	 * Convert a CSS color() function value to rgba string.
	 * Supports: srgb, srgb-linear, display-p3, a98-rgb, prophoto-rgb, rec2020, xyz, xyz-d50, xyz-d65
	 * @param colorSpace The color space identifier
	 * @param r Red/X component (0–1 range)
	 * @param g Green/Y component (0–1 range)
	 * @param b Blue/Z component (0–1 range)
	 * @param alpha Alpha (0–1)
	 */
	colorFunctionToRgba(colorSpace: string, r: number, g: number, b: number, alpha: number = 1): string {
		// Helper: sRGB gamma encoding (linear → sRGB)
		const srgbGamma = (c: number): number => {
			return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
		};

		// Helper: sRGB inverse gamma (sRGB → linear)
		const srgbLinearize = (c: number): number => {
			return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
		};

		// Helper: XYZ D65 → Linear sRGB
		const xyzToLinearSrgb = (X: number, Y: number, Z: number): [number, number, number] => {
			return [
				3.2404541621141054 * X - 1.5371385940306089 * Y - 0.4985314095560158 * Z,
				-0.9692660305051868 * X + 1.8760108454466942 * Y + 0.0415560175303498 * Z,
				0.0556434309591147 * X - 0.2039769598730715 * Y + 1.0572251882231791 * Z,
			];
		};

		// Helper: D50 → D65 Bradford chromatic adaptation
		const d50ToD65 = (X: number, Y: number, Z: number): [number, number, number] => {
			return [
				0.9554734527042182 * X - 0.023098536874261423 * Y + 0.0632593086610217 * Z,
				-0.028369706963208136 * X + 1.0099954580106629 * Y + 0.021041398966943008 * Z,
				0.012314001688319899 * X - 0.020507696433477912 * Y + 1.3303659366080753 * Z,
			];
		};

		// Suppress unused-variable warnings — srgbGamma is kept as a local utility
		void srgbGamma;

		let rOut: number, gOut: number, bOut: number;

		switch (colorSpace) {
			case "srgb": {
				// sRGB values are already gamma-encoded, just scale to 0-255
				rOut = Math.round(Math.max(0, Math.min(255, r * 255)));
				gOut = Math.round(Math.max(0, Math.min(255, g * 255)));
				bOut = Math.round(Math.max(0, Math.min(255, b * 255)));
				break;
			}
			case "srgb-linear": {
				// Apply sRGB gamma encoding, then scale to 0-255
				rOut = this.linearSrgbToInt(r);
				gOut = this.linearSrgbToInt(g);
				bOut = this.linearSrgbToInt(b);
				break;
			}
			case "display-p3": {
				// Linearize P3 (same gamma as sRGB)
				const rLin = srgbLinearize(r);
				const gLin = srgbLinearize(g);
				const bLin = srgbLinearize(b);
				// Linear P3 → XYZ D65
				const X = 0.4865709486482162 * rLin + 0.26566769316909306 * gLin + 0.1982172852343625 * bLin;
				const Y = 0.2289745640697488 * rLin + 0.6917385218365064 * gLin + 0.079286914093745 * bLin;
				const Z = 0.0 * rLin + 0.04511338185890264 * gLin + 1.043944368900976 * bLin;
				// XYZ D65 → Linear sRGB → sRGB
				const [rS, gS, bS] = xyzToLinearSrgb(X, Y, Z);
				rOut = this.linearSrgbToInt(rS);
				gOut = this.linearSrgbToInt(gS);
				bOut = this.linearSrgbToInt(bS);
				break;
			}
			case "a98-rgb": {
				// A98 gamma linearize: gamma = 563/256
				const a98Lin = (c: number): number => Math.sign(c) * Math.pow(Math.abs(c), 563 / 256);
				const rLin = a98Lin(r);
				const gLin = a98Lin(g);
				const bLin = a98Lin(b);
				// Linear A98 → XYZ D65
				const X = 0.5766690429101305 * rLin + 0.1855582379065463 * gLin + 0.1882286462349947 * bLin;
				const Y = 0.29734497525053605 * rLin + 0.6273635662554661 * gLin + 0.07529145849399788 * bLin;
				const Z = 0.02703136138641234 * rLin + 0.07068885253582723 * gLin + 0.9913375368376388 * bLin;
				// XYZ D65 → Linear sRGB → sRGB
				const [rS, gS, bS] = xyzToLinearSrgb(X, Y, Z);
				rOut = this.linearSrgbToInt(rS);
				gOut = this.linearSrgbToInt(gS);
				bOut = this.linearSrgbToInt(bS);
				break;
			}
			case "prophoto-rgb": {
				// ProPhoto gamma linearize
				const ppLin = (c: number): number => (c < 16 / 512 ? c / 16 : Math.pow(c, 1.8));
				const rLin = ppLin(r);
				const gLin = ppLin(g);
				const bLin = ppLin(b);
				// Linear ProPhoto → XYZ D50
				const X50 = 0.7977604896723027 * rLin + 0.13518583717574031 * gLin + 0.0313493495815248 * bLin;
				const Y50 = 0.2880711282292934 * rLin + 0.7118432178101014 * gLin + 0.00008565396060525902 * bLin;
				const Z50 = 0.0 * rLin + 0.0 * gLin + 0.8251046025104602 * bLin;
				// D50 → D65
				const [X65, Y65, Z65] = d50ToD65(X50, Y50, Z50);
				// XYZ D65 → Linear sRGB → sRGB
				const [rS, gS, bS] = xyzToLinearSrgb(X65, Y65, Z65);
				rOut = this.linearSrgbToInt(rS);
				gOut = this.linearSrgbToInt(gS);
				bOut = this.linearSrgbToInt(bS);
				break;
			}
			case "rec2020": {
				// Rec2020 gamma linearize
				const recLin = (c: number): number =>
					c < 0.081243 ? c / 4.5 : Math.pow((c + 0.099297) / 1.099297, 1 / 0.45);
				const rLin = recLin(r);
				const gLin = recLin(g);
				const bLin = recLin(b);
				// Linear Rec2020 → XYZ D65
				const X = 0.6369580483012914 * rLin + 0.14461690358620832 * gLin + 0.1688809751641721 * bLin;
				const Y = 0.2627002120112671 * rLin + 0.6779980715188708 * gLin + 0.05930171646986196 * bLin;
				const Z = 0.0 * rLin + 0.028072693049087428 * gLin + 1.0609850577107909 * bLin;
				// XYZ D65 → Linear sRGB → sRGB
				const [rS, gS, bS] = xyzToLinearSrgb(X, Y, Z);
				rOut = this.linearSrgbToInt(rS);
				gOut = this.linearSrgbToInt(gS);
				bOut = this.linearSrgbToInt(bS);
				break;
			}
			case "xyz":
			case "xyz-d65": {
				// Already XYZ D65 → Linear sRGB → sRGB
				const [rS, gS, bS] = xyzToLinearSrgb(r, g, b);
				rOut = this.linearSrgbToInt(rS);
				gOut = this.linearSrgbToInt(gS);
				bOut = this.linearSrgbToInt(bS);
				break;
			}
			case "xyz-d50": {
				// D50 → D65 → Linear sRGB → sRGB
				const [X65, Y65, Z65] = d50ToD65(r, g, b);
				const [rS, gS, bS] = xyzToLinearSrgb(X65, Y65, Z65);
				rOut = this.linearSrgbToInt(rS);
				gOut = this.linearSrgbToInt(gS);
				bOut = this.linearSrgbToInt(bS);
				break;
			}
			default:
				throw new Error(`Unsupported color space: ${colorSpace}`);
		}

		return `rgba(${rOut}, ${gOut}, ${bOut}, ${alpha})`;
	}

	toRgba(colorString: string): string {
		if (/^#/.test(colorString)) {
			return this.hexToRgba(colorString);
		} else if (/^rgba?\(/.test(colorString)) {
			// Try legacy comma-separated first
			const commaMatch = colorString.match(ColorUtil.RGBA_COMMA_REGEX);
			if (commaMatch) {
				const parseRgbComp = (val: string): number => {
					if (val === "none") return 0;
					if (val.endsWith("%")) return Math.round((parseFloat(val) / 100) * 255);
					return Math.round(parseFloat(val));
				};
				const r = Math.max(0, Math.min(255, parseRgbComp(commaMatch[1])));
				const g = Math.max(0, Math.min(255, parseRgbComp(commaMatch[2])));
				const bVal = Math.max(0, Math.min(255, parseRgbComp(commaMatch[3])));
				const alpha = commaMatch[4] ? this.parseAlpha(commaMatch[4]) : 1;
				return `rgba(${r}, ${g}, ${bVal}, ${alpha})`;
			}
			// Try modern space-separated: rgb(R G B) or rgb(R G B / A)
			const spaceMatch = colorString.match(ColorUtil.RGBA_SPACE_REGEX);
			if (spaceMatch) {
				const parseRgbComp = (val: string): number => {
					if (val === "none") return 0;
					if (val.endsWith("%")) return Math.round((parseFloat(val) / 100) * 255);
					return Math.round(parseFloat(val));
				};
				const r = Math.max(0, Math.min(255, parseRgbComp(spaceMatch[1])));
				const g = Math.max(0, Math.min(255, parseRgbComp(spaceMatch[2])));
				const bVal = Math.max(0, Math.min(255, parseRgbComp(spaceMatch[3])));
				const alpha = spaceMatch[4] ? this.parseAlpha(spaceMatch[4]) : 1;
				return `rgba(${r}, ${g}, ${bVal}, ${alpha})`;
			}
			throw new Error(`Invalid RGB color format: ${colorString}`);
		} else if (/^hsla?\(/.test(colorString)) {
			// Try legacy comma-separated first
			const commaMatch = colorString.match(ColorUtil.HSLA_COMMA_REGEX);
			if (commaMatch) {
				const h: number = parseFloat(commaMatch[1]);
				const s: number = parseInt(commaMatch[2], 10);
				const l: number = parseInt(commaMatch[3], 10);
				const alpha: number = commaMatch[4] ? parseFloat(commaMatch[4]) : 1;
				return this.hslToRgba(h, s, l, alpha);
			}
			// Try modern space-separated: hsl(H S% L%) or hsl(H S% L% / A)
			const spaceMatch = colorString.match(ColorUtil.HSLA_SPACE_REGEX);
			if (spaceMatch) {
				const h = this.parseOklchComponent(spaceMatch[1], "hue");
				const s = spaceMatch[2] === "none" ? 0 : parseFloat(spaceMatch[2]);
				const l = spaceMatch[3] === "none" ? 0 : parseFloat(spaceMatch[3]);
				const alpha = spaceMatch[4] ? this.parseAlpha(spaceMatch[4]) : 1;
				return this.hslToRgba(h, s, l, alpha);
			}
			throw new Error(`Invalid HSL color format: ${colorString}`);
		} else if (/^hwb\(/.test(colorString)) {
			const match = colorString.match(ColorUtil.HWB_REGEX);
			if (match) {
				const h = this.parseOklchComponent(match[1], "hue");
				const w = match[2] === "none" ? 0 : parseFloat(match[2]);
				const bVal = match[3] === "none" ? 0 : parseFloat(match[3]);
				const alpha = match[4] ? this.parseAlpha(match[4]) : 1;
				return this.hwbToRgba(h, w, bVal, alpha);
			}
			throw new Error(`Invalid HWB color format: ${colorString}`);
		} else if (/^oklch\(/.test(colorString)) {
			const oklchMatch = colorString.match(ColorUtil.OKLCH_REGEX);
			if (oklchMatch) {
				const l = this.parseOklchComponent(oklchMatch[1], "lightness");
				const c = this.parseOklchComponent(oklchMatch[2], "chroma");
				const h = this.parseOklchComponent(oklchMatch[3], "hue");
				const alpha = oklchMatch[4] ? this.parseOklchComponent(oklchMatch[4], "alpha") : 1;
				return this.oklchToRgba(l, c, h, alpha);
			}
			throw new Error(`Invalid OKLCH color format: ${colorString}`);
		} else if (/^oklab\(/.test(colorString)) {
			const oklabMatch = colorString.match(ColorUtil.OKLAB_REGEX);
			if (oklabMatch) {
				const l = this.parseOklchComponent(oklabMatch[1], "lightness");
				const a = oklabMatch[2] === "none" ? 0 : parseFloat(oklabMatch[2]);
				const b = oklabMatch[3] === "none" ? 0 : parseFloat(oklabMatch[3]);
				const alpha = oklabMatch[4] ? this.parseOklchComponent(oklabMatch[4], "alpha") : 1;
				return this.oklabToRgba(l, a, b, alpha);
			}
			throw new Error(`Invalid OKLab color format: ${colorString}`);
		} else if (/^lab\(/.test(colorString)) {
			const labMatch = colorString.match(ColorUtil.LAB_REGEX);
			if (labMatch) {
				const l = this.parseLabComponent(labMatch[1], "lightness");
				const a = this.parseLabComponent(labMatch[2], "a");
				const b = this.parseLabComponent(labMatch[3], "b");
				const alpha = labMatch[4] ? this.parseLabComponent(labMatch[4], "alpha") : 1;
				return this.labToRgba(l, a, b, alpha);
			}
			throw new Error(`Invalid Lab color format: ${colorString}`);
		} else if (/^lch\(/.test(colorString)) {
			const lchMatch = colorString.match(ColorUtil.LCH_REGEX);
			if (lchMatch) {
				const l = this.parseLabComponent(lchMatch[1], "lightness");
				const c = this.parseLabComponent(lchMatch[2], "chroma");
				const h = this.parseLabComponent(lchMatch[3], "hue");
				const alpha = lchMatch[4] ? this.parseLabComponent(lchMatch[4], "alpha") : 1;
				return this.lchToRgba(l, c, h, alpha);
			}
			throw new Error(`Invalid LCH color format: ${colorString}`);
		} else if (/^color\(/.test(colorString)) {
			const match = colorString.match(ColorUtil.COLOR_FUNC_REGEX);
			if (match) {
				const colorSpace = match[1];
				const parseComp = (val: string): number => {
					if (val === "none") return 0;
					if (val.endsWith("%")) return parseFloat(val) / 100;
					return parseFloat(val);
				};
				const r = parseComp(match[2]);
				const g = parseComp(match[3]);
				const bVal = parseComp(match[4]);
				const alpha = match[5] ? this.parseAlpha(match[5]) : 1;
				return this.colorFunctionToRgba(colorSpace, r, g, bVal, alpha);
			}
			throw new Error(`Invalid color() format: ${colorString}`);
		} else {
			throw new Error("Unsupported color format");
		}
	}

	/**
	 * Parse an OKLCH/OKLab component value, handling percentages, units, and the `none` keyword.
	 */
	private parseOklchComponent(value: string, type: "lightness" | "chroma" | "hue" | "alpha"): number {
		if (value === "none") return 0;

		if (value.endsWith("%")) {
			const num = parseFloat(value);
			if (type === "lightness" || type === "alpha") return num / 100;
			if (type === "chroma") return (num / 100) * 0.4; // 100% chroma ≈ 0.4
			return (num / 100) * 360; // hue percentage (rare but valid)
		}

		if (value.endsWith("rad")) return parseFloat(value) * (180 / Math.PI);
		if (value.endsWith("grad")) return parseFloat(value) * 0.9;
		if (value.endsWith("turn")) return parseFloat(value) * 360;
		if (value.endsWith("deg")) return parseFloat(value);

		return parseFloat(value);
	}

	private parseLabComponent(value: string, type: "lightness" | "a" | "b" | "chroma" | "hue" | "alpha"): number {
		if (value === "none") return 0;

		if (value.endsWith("%")) {
			const num = parseFloat(value);
			switch (type) {
				case "lightness":
					return num; // 0%–100% → 0–100
				case "a":
				case "b":
					return (num / 100) * 125; // ±100% → ±125
				case "chroma":
					return (num / 100) * 150; // 100% → 150
				case "alpha":
					return num / 100;
				case "hue":
					return (num / 100) * 360;
			}
		}

		if (value.endsWith("rad")) return parseFloat(value) * (180 / Math.PI);
		if (value.endsWith("grad")) return parseFloat(value) * 0.9;
		if (value.endsWith("turn")) return parseFloat(value) * 360;
		if (value.endsWith("deg")) return parseFloat(value);

		return parseFloat(value);
	}

	/**
	 * Parse an alpha value, handling percentages and the `none` keyword.
	 */
	private parseAlpha(value: string): number {
		if (value === "none") return 0;
		if (value.endsWith("%")) return parseFloat(value) / 100;
		return parseFloat(value);
	}

	/**
	 * Linear sRGB component to sRGB-encoded integer [0, 255].
	 * Applies gamma encoding and clamps the result.
	 */
	private linearSrgbToInt(c: number): number {
		const clamped = Math.max(0, Math.min(1, c));
		const encoded = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
		return Math.round(Math.max(0, Math.min(255, encoded * 255)));
	}

	private normalizeToRgba(color: string): string {
		// Hex — convert directly (not handled by toRgba)
		if (/^#/.test(color)) {
			return this.hexToRgba(color);
		}
		// All function-based color formats — route through toRgba
		try {
			return this.toRgba(color);
		} catch {
			// Named color, currentcolor, color-mix(), etc. — resolve via DOM
			return this.resolveNamedColor(color);
		}
	}

	private resolveNamedColor(color: string): string {
		const tempEle: HTMLDivElement = document.createElement("div");
		tempEle.style.display = "none";
		document.body.appendChild(tempEle);
		tempEle.style.backgroundColor = color;
		const resolved: string = window.getComputedStyle(tempEle).backgroundColor;
		document.body.removeChild(tempEle);
		return resolved;
	}

	parseColor(color: string): RGBAColor {
		if (color === "" || color === "transparent") {
			return { r: 0, g: 0, b: 0, a: 0 };
		}

		const rgbaString: string = this.normalizeToRgba(color);
		const match: RegExpMatchArray | null = rgbaString.match(ColorUtil.RGBA_PARSE_REGEX);
		if (match) {
			return {
				r: parseInt(match[1], 10),
				g: parseInt(match[2], 10),
				b: parseInt(match[3], 10),
				a: match[4] ? parseFloat(match[4]) : 1,
			};
		}
		throw new Error(`Invalid color format: ${color}`);
	}

	isTransparent(color: string): boolean {
		if (!color || color === "") {
			return true;
		}

		const parsed: RGBAColor = this.parseColor(color);
		return parsed.a === 0;
	}

	getRelativeLuminance({ r, g, b }: RGBAColor): number {
		const [rSRGB, gSRGB, bSRGB]: number[] = [r, g, b].map((c: number) => {
			c /= 255;
			return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * rSRGB + 0.7152 * gSRGB + 0.0722 * bSRGB;
	}

	/**
	 * Alpha-composite a foreground color over a background color.
	 * Uses the standard "source over" formula.
	 */
	blendColors(fg: RGBAColor, bg: RGBAColor): RGBAColor {
		if (fg.a === 1) return { ...fg };
		if (fg.a === 0) return { ...bg };

		const a = fg.a + bg.a * (1 - fg.a);
		if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };

		return {
			r: Math.round((fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a),
			g: Math.round((fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a),
			b: Math.round((fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a),
			a: Math.round(a * 1000) / 1000,
		};
	}

	getElementStyle(element: HTMLElement): ElementStyle {
		const style: CSSStyleDeclaration = window.getComputedStyle(element);
		return {
			bgColor: style.backgroundColor,
			color: style.color,
			fontSize: style.fontSize,
			fontWeight: style.fontWeight,
		};
	}

	getEffectiveColor(element: HTMLElement, colorType: ColorType, precomputedBgColor?: string): string {
		// For text color, walk up the tree to find first non-transparent value
		// (CSS color is inherited, getComputedStyle already handles this,
		//  but we handle the edge case of explicitly transparent text)
		if (colorType === "color") {
			let currentElement: HTMLElement | null = element;
			while (currentElement) {
				const color = this.getColor(currentElement);
				if (!this.isTransparent(color)) {
					return color;
				}
				if (currentElement === document.body) break;
				currentElement = currentElement.parentElement;
			}
			// Fallback: check <html>, then default to black
			const htmlColor = this.getColor(document.documentElement);
			return this.isTransparent(htmlColor) ? "rgba(0,0,0,1)" : htmlColor;
		}

		// For background color, alpha-composite all layers from element up to the first opaque ancestor
		const layers: RGBAColor[] = [];
		let currentElement: HTMLElement | null = element;

		while (currentElement) {
			// Use precomputed bgColor for the starting element to avoid a redundant getComputedStyle call
			const bgColor =
				precomputedBgColor && currentElement === element ? precomputedBgColor : this.getBgColor(currentElement);
			const parsed = this.parseColor(bgColor);
			layers.push(parsed);

			// If we found an opaque layer, no need to look further
			if (parsed.a === 1) {
				break;
			}

			if (currentElement === document.body) {
				// Also check <html> element
				const htmlBg = this.parseColor(this.getBgColor(document.documentElement));
				layers.push(htmlBg);
				if (htmlBg.a < 1) {
					// Ultimate fallback: opaque white
					layers.push({ r: 255, g: 255, b: 255, a: 1 });
				}
				break;
			}

			currentElement = currentElement.parentElement;
		}

		// If no layers collected (shouldn't happen), default to white
		if (layers.length === 0) {
			return "rgba(255,255,255,1)";
		}

		// Composite from bottom (last element = deepest ancestor) to top (first element = target)
		let composited: RGBAColor = layers[layers.length - 1];
		for (let i = layers.length - 2; i >= 0; i--) {
			composited = this.blendColors(layers[i], composited);
		}

		return `rgba(${composited.r}, ${composited.g}, ${composited.b}, ${composited.a})`;
	}

	getBgColor(element: HTMLElement): string {
		return this.getElementStyle(element).bgColor;
	}

	getColor(element: HTMLElement): string {
		return this.getElementStyle(element).color;
	}

	setStyle(element: HTMLElement, styleObj: StyleObject): void {
		for (const property in styleObj) {
			element.style.setProperty(property, styleObj[property]);
		}
	}
}

export { ColorUtil };

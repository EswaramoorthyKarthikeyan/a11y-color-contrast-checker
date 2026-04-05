import { describe, it, expect } from "vitest";
import { ColorUtil } from "../src/colorUtil";

const colorUtil = new ColorUtil();

describe("ColorUtil", () => {
	describe("parseColor", () => {
		it("should return transparent black for empty string", () => {
			const result = colorUtil.parseColor("");
			expect(result).toEqual({ r: 0, g: 0, b: 0, a: 0 });
		});

		it('should return transparent black for "transparent"', () => {
			const result = colorUtil.parseColor("transparent");
			expect(result).toEqual({ r: 0, g: 0, b: 0, a: 0 });
		});

		it("should parse rgb() format correctly", () => {
			const result = colorUtil.parseColor("rgb(255, 0, 0)");
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		});

		it("should parse rgba() format correctly", () => {
			const result = colorUtil.parseColor("rgba(255, 0, 0, 0.5)");
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
		});

		it("should parse 6-digit hex format correctly", () => {
			const result = colorUtil.parseColor("#ff0000");
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		});

		it("should parse 3-digit hex shorthand correctly", () => {
			const result = colorUtil.parseColor("#f00");
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		});

		it("should parse 8-digit hex with alpha correctly", () => {
			const result = colorUtil.parseColor("#ff000080");
			expect(result.r).toBe(255);
			expect(result.g).toBe(0);
			expect(result.b).toBe(0);
			expect(result.a).toBeCloseTo(0.5, 1);
		});

		it("should throw for an invalid color", () => {
			expect(() => colorUtil.parseColor("notacolor")).toThrow();
		});
	});

	describe("hexToRgba", () => {
		it("should convert 6-digit hex to rgba string", () => {
			expect(colorUtil.hexToRgba("#ff0000")).toBe("rgba(255, 0, 0, 1)");
		});

		it("should convert 3-digit hex shorthand to rgba string", () => {
			expect(colorUtil.hexToRgba("#f00")).toBe("rgba(255, 0, 0, 1)");
		});

		it("should extract alpha from 8-digit hex", () => {
			const result = colorUtil.hexToRgba("#00ff0080");
			const match = result.match(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/);
			expect(match).not.toBeNull();
			expect(parseInt(match![1], 10)).toBe(0);
			expect(parseInt(match![2], 10)).toBe(255);
			expect(parseInt(match![3], 10)).toBe(0);
			expect(parseFloat(match![4])).toBeCloseTo(0.5, 1);
		});

		it("should expand 4-digit hex shorthand with alpha to 8-digit", () => {
			// #f008 → #ff000088
			const result = colorUtil.hexToRgba("#f008");
			const match = result.match(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/);
			expect(match).not.toBeNull();
			expect(parseInt(match![1], 10)).toBe(255);
			expect(parseInt(match![2], 10)).toBe(0);
			expect(parseInt(match![3], 10)).toBe(0);
			// 0x88 = 136, 136/255 ≈ 0.53
			expect(parseFloat(match![4])).toBeCloseTo(136 / 255, 1);
		});
	});

	describe("hslToRgba", () => {
		it("should convert pure red (0, 100, 50)", () => {
			expect(colorUtil.hslToRgba(0, 100, 50)).toBe("rgba(255, 0, 0, 1)");
		});

		it("should convert pure green (120, 100, 50)", () => {
			expect(colorUtil.hslToRgba(120, 100, 50)).toBe("rgba(0, 255, 0, 1)");
		});

		it("should convert pure blue (240, 100, 50)", () => {
			expect(colorUtil.hslToRgba(240, 100, 50)).toBe("rgba(0, 0, 255, 1)");
		});

		it("should convert black (0, 0, 0)", () => {
			expect(colorUtil.hslToRgba(0, 0, 0)).toBe("rgba(0, 0, 0, 1)");
		});

		it("should convert white (0, 0, 100)", () => {
			expect(colorUtil.hslToRgba(0, 0, 100)).toBe("rgba(255, 255, 255, 1)");
		});

		it("should normalize hue 360 to be the same as hue 0", () => {
			expect(colorUtil.hslToRgba(360, 100, 50)).toBe(colorUtil.hslToRgba(0, 100, 50));
		});

		it("should handle negative hue (-120 should equal 240)", () => {
			expect(colorUtil.hslToRgba(-120, 100, 50)).toBe(colorUtil.hslToRgba(240, 100, 50));
		});
	});

	describe("getRelativeLuminance", () => {
		it("should return 0 for black", () => {
			const luminance = colorUtil.getRelativeLuminance({
				r: 0,
				g: 0,
				b: 0,
				a: 1,
			});
			expect(luminance).toBe(0);
		});

		it("should return 1 for white", () => {
			const luminance = colorUtil.getRelativeLuminance({
				r: 255,
				g: 255,
				b: 255,
				a: 1,
			});
			expect(luminance).toBeCloseTo(1, 5);
		});

		it("should return approximately 0.2126 for pure red", () => {
			const luminance = colorUtil.getRelativeLuminance({
				r: 255,
				g: 0,
				b: 0,
				a: 1,
			});
			expect(luminance).toBeCloseTo(0.2126, 4);
		});
	});

	describe("isTransparent", () => {
		it("should return true for empty string", () => {
			expect(colorUtil.isTransparent("")).toBe(true);
		});

		it('should return true for "transparent"', () => {
			expect(colorUtil.isTransparent("transparent")).toBe(true);
		});

		it("should return true for rgba with zero alpha", () => {
			expect(colorUtil.isTransparent("rgba(0, 0, 0, 0)")).toBe(true);
		});

		it("should return false for rgba with non-zero alpha", () => {
			expect(colorUtil.isTransparent("rgba(255, 0, 0, 0.5)")).toBe(false);
		});

		it("should return false for opaque rgb color", () => {
			expect(colorUtil.isTransparent("rgb(255, 0, 0)")).toBe(false);
		});
	});

	describe("blendColors", () => {
		it("should return foreground when fg is fully opaque", () => {
			const fg = { r: 255, g: 0, b: 0, a: 1 };
			const bg = { r: 0, g: 0, b: 255, a: 1 };
			const result = colorUtil.blendColors(fg, bg);
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		});

		it("should return background when fg is fully transparent", () => {
			const fg = { r: 255, g: 0, b: 0, a: 0 };
			const bg = { r: 0, g: 0, b: 255, a: 1 };
			const result = colorUtil.blendColors(fg, bg);
			expect(result).toEqual({ r: 0, g: 0, b: 255, a: 1 });
		});

		it("should blend semi-transparent red over opaque blue to a purple-ish color", () => {
			const fg = { r: 255, g: 0, b: 0, a: 0.5 };
			const bg = { r: 0, g: 0, b: 255, a: 1 };
			const result = colorUtil.blendColors(fg, bg);
			expect(result.r).toBeCloseTo(128, 0);
			expect(result.g).toBe(0);
			expect(result.b).toBeCloseTo(128, 0);
			expect(result.a).toBeCloseTo(1, 2);
		});

		it("should return fully transparent black when both colors are transparent", () => {
			const fg = { r: 0, g: 0, b: 0, a: 0 };
			const bg = { r: 0, g: 0, b: 0, a: 0 };
			const result = colorUtil.blendColors(fg, bg);
			expect(result).toEqual({ r: 0, g: 0, b: 0, a: 0 });
		});
	});

	describe("getColorFormat", () => {
		it('should return "hex" for 3-digit hex', () => {
			expect(colorUtil.getColorFormat("#fff")).toBe("hex");
		});

		it('should return "hex" for 6-digit hex', () => {
			expect(colorUtil.getColorFormat("#ffffff")).toBe("hex");
		});

		it('should return "rgb" for rgb() format', () => {
			expect(colorUtil.getColorFormat("rgb(0,0,0)")).toBe("rgb");
		});

		it('should return "rgba" for rgba() format', () => {
			expect(colorUtil.getColorFormat("rgba(0,0,0,0.5)")).toBe("rgba");
		});

		it('should return "hsl" for hsl() format', () => {
			expect(colorUtil.getColorFormat("hsl(0, 100%, 50%)")).toBe("hsl");
		});

		it("should throw for empty string", () => {
			expect(() => colorUtil.getColorFormat("")).toThrow();
		});
	});

	// --- Helper for parsing rgba strings in oklch/oklab tests ---
	function parseRgbaString(rgba: string): { r: number; g: number; b: number; a: number } {
		const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
		if (!match) throw new Error(`Failed to parse: ${rgba}`);
		return {
			r: parseInt(match[1], 10),
			g: parseInt(match[2], 10),
			b: parseInt(match[3], 10),
			a: match[4] ? parseFloat(match[4]) : 1,
		};
	}

	describe("oklchToRgba", () => {
		it("should convert black (L=0, C=0, H=0)", () => {
			expect(colorUtil.oklchToRgba(0, 0, 0)).toBe("rgba(0, 0, 0, 1)");
		});

		it("should convert white (L=1, C=0, H=0)", () => {
			expect(colorUtil.oklchToRgba(1, 0, 0)).toBe("rgba(255, 255, 255, 1)");
		});

		it("should convert approximately red (L=0.6279, C=0.2577, H=29.23)", () => {
			const result = colorUtil.oklchToRgba(0.6279, 0.2577, 29.23);
			const parsed = parseRgbaString(result);
			expect(parsed.r).toBeGreaterThanOrEqual(253);
			expect(parsed.g).toBeLessThanOrEqual(3);
			expect(parsed.b).toBeLessThanOrEqual(3);
		});

		it("should pass through alpha value (0.5)", () => {
			const result = colorUtil.oklchToRgba(0.5, 0.15, 180, 0.5);
			const parsed = parseRgbaString(result);
			expect(parsed.a).toBe(0.5);
		});

		it("should convert approximately green (L=0.8664, C=0.2948, H=142.5)", () => {
			const result = colorUtil.oklchToRgba(0.8664, 0.2948, 142.5);
			const parsed = parseRgbaString(result);
			expect(parsed.g).toBeGreaterThanOrEqual(253);
			expect(parsed.r).toBeLessThanOrEqual(3);
			expect(parsed.b).toBeLessThanOrEqual(3);
		});
	});

	describe("oklabToRgba", () => {
		it("should convert black (L=0, a=0, b=0)", () => {
			expect(colorUtil.oklabToRgba(0, 0, 0)).toBe("rgba(0, 0, 0, 1)");
		});

		it("should convert white (L=1, a=0, b=0)", () => {
			expect(colorUtil.oklabToRgba(1, 0, 0)).toBe("rgba(255, 255, 255, 1)");
		});

		it("should pass through alpha value (0.8)", () => {
			const result = colorUtil.oklabToRgba(0.5, 0.1, -0.1, 0.8);
			const parsed = parseRgbaString(result);
			expect(parsed.a).toBe(0.8);
		});
	});

	describe("getColorFormat — oklch/oklab", () => {
		it('should return "oklch" for oklch() format', () => {
			expect(colorUtil.getColorFormat("oklch(0.7 0.15 180)")).toBe("oklch");
		});

		it('should return "oklch" for oklch() with alpha', () => {
			expect(colorUtil.getColorFormat("oklch(70% 0.15 180 / 0.5)")).toBe("oklch");
		});

		it('should return "oklab" for oklab() format', () => {
			expect(colorUtil.getColorFormat("oklab(0.7 -0.1 0.1)")).toBe("oklab");
		});

		it('should return "oklab" for oklab() with alpha', () => {
			expect(colorUtil.getColorFormat("oklab(0.7 -0.1 0.1 / 50%)")).toBe("oklab");
		});
	});

	describe("parseColor — oklch/oklab", () => {
		it("should parse oklch black", () => {
			const result = colorUtil.parseColor("oklch(0 0 0)");
			expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 });
		});

		it("should parse oklch white", () => {
			const result = colorUtil.parseColor("oklch(1 0 0)");
			expect(result).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		});

		it("should parse oklch red approximately", () => {
			const result = colorUtil.parseColor("oklch(0.6279 0.2577 29.23)");
			expect(result.r).toBeGreaterThanOrEqual(253);
			expect(result.g).toBeLessThanOrEqual(3);
			expect(result.b).toBeLessThanOrEqual(3);
		});

		it("should parse oklab black", () => {
			const result = colorUtil.parseColor("oklab(0 0 0)");
			expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 });
		});

		it("should parse oklab white", () => {
			const result = colorUtil.parseColor("oklab(1 0 0)");
			expect(result).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		});

		it("should parse oklch with alpha", () => {
			const result = colorUtil.parseColor("oklch(0.7 0.15 180 / 0.5)");
			expect(result.a).toBe(0.5);
		});
	});

	describe("labToRgba", () => {
		it("should convert black (L=0, a=0, b=0)", () => {
			expect(colorUtil.labToRgba(0, 0, 0)).toBe("rgba(0, 0, 0, 1)");
		});

		it("should convert white (L=100, a=0, b=0)", () => {
			expect(colorUtil.labToRgba(100, 0, 0)).toBe("rgba(255, 255, 255, 1)");
		});

		it("should convert approximately red (L=53.233, a=80.109, b=67.22)", () => {
			const result = colorUtil.labToRgba(53.233, 80.109, 67.22);
			const parsed = parseRgbaString(result);
			expect(parsed.r).toBeGreaterThanOrEqual(250);
			expect(parsed.g).toBeLessThanOrEqual(10);
			expect(parsed.b).toBeLessThanOrEqual(10);
		});

		it("should pass through alpha value (0.5)", () => {
			const result = colorUtil.labToRgba(50, 0, 0, 0.5);
			const parsed = parseRgbaString(result);
			expect(parsed.a).toBe(0.5);
		});

		it("should not throw for user-reported value (L=96.0729, a=-5.4261, b=7.67585)", () => {
			const result = colorUtil.labToRgba(96.0729, -5.4261, 7.67585);
			expect(result).toMatch(/^rgba\(\d+, \d+, \d+, [\d.]+\)$/);
		});
	});

	describe("lchToRgba", () => {
		it("should convert black (L=0, C=0, H=0)", () => {
			expect(colorUtil.lchToRgba(0, 0, 0)).toBe("rgba(0, 0, 0, 1)");
		});

		it("should convert white (L=100, C=0, H=0)", () => {
			expect(colorUtil.lchToRgba(100, 0, 0)).toBe("rgba(255, 255, 255, 1)");
		});

		it("should pass through alpha value (0.7)", () => {
			const result = colorUtil.lchToRgba(50, 50, 30, 0.7);
			const parsed = parseRgbaString(result);
			expect(parsed.a).toBe(0.7);
		});
	});

	describe("getColorFormat — lab/lch", () => {
		it('should return "lab" for lab() format', () => {
			expect(colorUtil.getColorFormat("lab(96.0729 -5.4261 7.67585)")).toBe("lab");
		});

		it('should return "lab" for lab() with alpha', () => {
			expect(colorUtil.getColorFormat("lab(50% -20 30 / 0.5)")).toBe("lab");
		});

		it('should return "lch" for lch() format', () => {
			expect(colorUtil.getColorFormat("lch(50 30 270)")).toBe("lch");
		});

		it('should return "lch" for lch() with alpha', () => {
			expect(colorUtil.getColorFormat("lch(50 30 270 / 50%)")).toBe("lch");
		});
	});

	describe("parseColor — lab/lch", () => {
		it("should parse lab black", () => {
			const result = colorUtil.parseColor("lab(0 0 0)");
			expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 });
		});

		it("should parse lab white", () => {
			const result = colorUtil.parseColor("lab(100 0 0)");
			expect(result).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		});

		it("should parse user-reported lab value without throwing", () => {
			const result = colorUtil.parseColor("lab(96.0729 -5.4261 7.67585)");
			expect(result.r).toBeGreaterThanOrEqual(0);
			expect(result.r).toBeLessThanOrEqual(255);
			expect(result.g).toBeGreaterThanOrEqual(0);
			expect(result.g).toBeLessThanOrEqual(255);
			expect(result.b).toBeGreaterThanOrEqual(0);
			expect(result.b).toBeLessThanOrEqual(255);
			expect(result.a).toBe(1);
		});

		it("should parse lch black", () => {
			const result = colorUtil.parseColor("lch(0 0 0)");
			expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 });
		});

		it("should parse lch white", () => {
			const result = colorUtil.parseColor("lch(100 0 0)");
			expect(result).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		});

		it("should parse lab with alpha", () => {
			const result = colorUtil.parseColor("lab(50 -20 30 / 0.5)");
			expect(result.a).toBe(0.5);
		});
	});

	describe("parseColor — legacy comma-separated rgb with decimals and percentages", () => {
		it("should parse rgb with decimal values rgb(127.5, 0, 0)", () => {
			const result = colorUtil.parseColor("rgb(127.5, 0, 0)");
			expect(result).toEqual({ r: 128, g: 0, b: 0, a: 1 });
		});

		it("should parse rgba with decimal values rgba(127.5, 64.2, 0, 0.5)", () => {
			const result = colorUtil.parseColor("rgba(127.5, 64.2, 0, 0.5)");
			expect(result).toEqual({ r: 128, g: 64, b: 0, a: 0.5 });
		});

		it("should parse rgb with percentage values rgb(100%, 0%, 0%)", () => {
			const result = colorUtil.parseColor("rgb(100%, 0%, 0%)");
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		});

		it("should parse rgb with 50% values rgb(50%, 50%, 50%)", () => {
			const result = colorUtil.parseColor("rgb(50%, 50%, 50%)");
			expect(result).toEqual({ r: 128, g: 128, b: 128, a: 1 });
		});

		it("should parse rgba with percentage values and alpha rgba(100%, 0%, 0%, 0.5)", () => {
			const result = colorUtil.parseColor("rgba(100%, 0%, 0%, 0.5)");
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
		});

		it("should clamp values above 255 in comma-separated rgb", () => {
			const result = colorUtil.parseColor("rgb(300, 0, 0)");
			expect(result.r).toBe(255);
		});
	});

	describe("parseColor — legacy comma-separated hsl with decimal hue", () => {
		it("should parse hsl with decimal hue hsl(120.5, 100%, 50%)", () => {
			const result = colorUtil.parseColor("hsl(120.5, 100%, 50%)");
			// Should be very close to pure green but slightly shifted
			expect(result.g).toBeGreaterThan(250);
			expect(result.a).toBe(1);
		});

		it("should parse hsl with decimal hue hsl(0.5, 100%, 50%)", () => {
			const result = colorUtil.parseColor("hsl(0.5, 100%, 50%)");
			// Very close to pure red
			expect(result.r).toBe(255);
			expect(result.a).toBe(1);
		});
	});

	describe("parseColor — modern space-separated rgb/rgba", () => {
		it("should parse rgb(255 0 0)", () => {
			const result = colorUtil.parseColor("rgb(255 0 0)");
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		});

		it("should parse rgb(255 0 0 / 0.5)", () => {
			const result = colorUtil.parseColor("rgb(255 0 0 / 0.5)");
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
		});

		it("should parse rgb(100% 0% 0%)", () => {
			const result = colorUtil.parseColor("rgb(100% 0% 0%)");
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		});

		it("should parse rgb(100% 0% 0% / 50%)", () => {
			const result = colorUtil.parseColor("rgb(100% 0% 0% / 50%)");
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
		});

		it("should parse rgb(none 0 0) treating none as 0", () => {
			const result = colorUtil.parseColor("rgb(none 0 0)");
			expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 });
		});

		it("should parse rgba(255 0 0 / 0.5)", () => {
			const result = colorUtil.parseColor("rgba(255 0 0 / 0.5)");
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
		});
	});

	describe("parseColor — modern space-separated hsl/hsla", () => {
		it("should parse hsl(0 100% 50%) as red", () => {
			const result = colorUtil.parseColor("hsl(0 100% 50%)");
			expect(result.r).toBe(255);
			expect(result.g).toBe(0);
			expect(result.b).toBe(0);
			expect(result.a).toBe(1);
		});

		it("should parse hsl(120 100% 50%) as green", () => {
			const result = colorUtil.parseColor("hsl(120 100% 50%)");
			expect(result.r).toBe(0);
			expect(result.g).toBe(255);
			expect(result.b).toBe(0);
			expect(result.a).toBe(1);
		});

		it("should parse hsl(240 100% 50%) as blue", () => {
			const result = colorUtil.parseColor("hsl(240 100% 50%)");
			expect(result.r).toBe(0);
			expect(result.g).toBe(0);
			expect(result.b).toBe(255);
			expect(result.a).toBe(1);
		});

		it("should parse hsl(120deg 100% 50%) as green", () => {
			const result = colorUtil.parseColor("hsl(120deg 100% 50%)");
			expect(result.r).toBe(0);
			expect(result.g).toBe(255);
			expect(result.b).toBe(0);
			expect(result.a).toBe(1);
		});

		it("should parse hsl(120 100% 50% / 0.5) as green with alpha 0.5", () => {
			const result = colorUtil.parseColor("hsl(120 100% 50% / 0.5)");
			expect(result.r).toBe(0);
			expect(result.g).toBe(255);
			expect(result.b).toBe(0);
			expect(result.a).toBe(0.5);
		});

		it("should parse hsl(0.5turn 100% 50%) as cyan", () => {
			const result = colorUtil.parseColor("hsl(0.5turn 100% 50%)");
			expect(result.r).toBe(0);
			expect(result.g).toBe(255);
			expect(result.b).toBe(255);
			expect(result.a).toBe(1);
		});

		it("should parse hsla(0 100% 50% / 0.5) as red with alpha 0.5", () => {
			const result = colorUtil.parseColor("hsla(0 100% 50% / 0.5)");
			expect(result.r).toBe(255);
			expect(result.g).toBe(0);
			expect(result.b).toBe(0);
			expect(result.a).toBe(0.5);
		});

		it("should parse hsl(none 100% 50%) as red (hue=0)", () => {
			const result = colorUtil.parseColor("hsl(none 100% 50%)");
			expect(result.r).toBe(255);
			expect(result.g).toBe(0);
			expect(result.b).toBe(0);
			expect(result.a).toBe(1);
		});
	});

	describe("hwbToRgba", () => {
		it("should convert pure red (0, 0, 0)", () => {
			expect(colorUtil.hwbToRgba(0, 0, 0)).toBe("rgba(255, 0, 0, 1)");
		});

		it("should convert pure green (120, 0, 0)", () => {
			expect(colorUtil.hwbToRgba(120, 0, 0)).toBe("rgba(0, 255, 0, 1)");
		});

		it("should convert full whiteness (0, 100, 0) to white", () => {
			expect(colorUtil.hwbToRgba(0, 100, 0)).toBe("rgba(255, 255, 255, 1)");
		});

		it("should convert full blackness (0, 0, 100) to black", () => {
			expect(colorUtil.hwbToRgba(0, 0, 100)).toBe("rgba(0, 0, 0, 1)");
		});

		it("should convert (0, 50, 50) to approximately gray", () => {
			const result = colorUtil.hwbToRgba(0, 50, 50);
			const parsed = parseRgbaString(result);
			expect(parsed.r).toBeCloseTo(128, 0);
			expect(parsed.g).toBeCloseTo(128, 0);
			expect(parsed.b).toBeCloseTo(128, 0);
		});

		it("should handle alpha value (0, 0, 0, 0.5)", () => {
			const result = colorUtil.hwbToRgba(0, 0, 0, 0.5);
			const parsed = parseRgbaString(result);
			expect(parsed.r).toBe(255);
			expect(parsed.g).toBe(0);
			expect(parsed.b).toBe(0);
			expect(parsed.a).toBe(0.5);
		});
	});

	describe("parseColor — hwb", () => {
		it("should parse hwb(0 0% 0%) as red", () => {
			const result = colorUtil.parseColor("hwb(0 0% 0%)");
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		});

		it("should parse hwb(120 0% 0%) as green", () => {
			const result = colorUtil.parseColor("hwb(120 0% 0%)");
			expect(result).toEqual({ r: 0, g: 255, b: 0, a: 1 });
		});

		it("should parse hwb(0 100% 0%) as white", () => {
			const result = colorUtil.parseColor("hwb(0 100% 0%)");
			expect(result).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		});

		it("should parse hwb(0 0% 100%) as black", () => {
			const result = colorUtil.parseColor("hwb(0 0% 100%)");
			expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 });
		});

		it("should parse hwb(0 0% 0% / 0.5) as red with alpha 0.5", () => {
			const result = colorUtil.parseColor("hwb(0 0% 0% / 0.5)");
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
		});

		it("should parse hwb(120deg 0% 0%) as green (with deg unit)", () => {
			const result = colorUtil.parseColor("hwb(120deg 0% 0%)");
			expect(result).toEqual({ r: 0, g: 255, b: 0, a: 1 });
		});
	});

	describe("colorFunctionToRgba", () => {
		it("should convert srgb red (1, 0, 0)", () => {
			expect(colorUtil.colorFunctionToRgba("srgb", 1, 0, 0)).toBe("rgba(255, 0, 0, 1)");
		});

		it("should convert srgb green (0, 1, 0)", () => {
			expect(colorUtil.colorFunctionToRgba("srgb", 0, 1, 0)).toBe("rgba(0, 255, 0, 1)");
		});

		it("should convert srgb black (0, 0, 0)", () => {
			expect(colorUtil.colorFunctionToRgba("srgb", 0, 0, 0)).toBe("rgba(0, 0, 0, 1)");
		});

		it("should convert srgb white (1, 1, 1)", () => {
			expect(colorUtil.colorFunctionToRgba("srgb", 1, 1, 1)).toBe("rgba(255, 255, 255, 1)");
		});

		it("should convert srgb red with alpha 0.5", () => {
			expect(colorUtil.colorFunctionToRgba("srgb", 1, 0, 0, 0.5)).toBe("rgba(255, 0, 0, 0.5)");
		});

		it("should convert srgb-linear black (0, 0, 0)", () => {
			expect(colorUtil.colorFunctionToRgba("srgb-linear", 0, 0, 0)).toBe("rgba(0, 0, 0, 1)");
		});

		it("should convert srgb-linear white (1, 1, 1)", () => {
			expect(colorUtil.colorFunctionToRgba("srgb-linear", 1, 1, 1)).toBe("rgba(255, 255, 255, 1)");
		});

		it("should convert display-p3 red (1, 0, 0) to a reddish color", () => {
			const result = colorUtil.colorFunctionToRgba("display-p3", 1, 0, 0);
			const parsed = parseRgbaString(result);
			expect(parsed.r).toBeGreaterThanOrEqual(250);
			expect(parsed.g).toBeLessThanOrEqual(10);
			expect(parsed.b).toBeLessThanOrEqual(10);
		});

		it("should convert display-p3 black (0, 0, 0)", () => {
			expect(colorUtil.colorFunctionToRgba("display-p3", 0, 0, 0)).toBe("rgba(0, 0, 0, 1)");
		});

		it("should convert display-p3 white (1, 1, 1)", () => {
			expect(colorUtil.colorFunctionToRgba("display-p3", 1, 1, 1)).toBe("rgba(255, 255, 255, 1)");
		});

		it("should convert a98-rgb black (0, 0, 0)", () => {
			expect(colorUtil.colorFunctionToRgba("a98-rgb", 0, 0, 0)).toBe("rgba(0, 0, 0, 1)");
		});

		it("should convert a98-rgb white (1, 1, 1)", () => {
			expect(colorUtil.colorFunctionToRgba("a98-rgb", 1, 1, 1)).toBe("rgba(255, 255, 255, 1)");
		});

		it("should convert rec2020 black (0, 0, 0)", () => {
			expect(colorUtil.colorFunctionToRgba("rec2020", 0, 0, 0)).toBe("rgba(0, 0, 0, 1)");
		});

		it("should convert rec2020 white (1, 1, 1)", () => {
			expect(colorUtil.colorFunctionToRgba("rec2020", 1, 1, 1)).toBe("rgba(255, 255, 255, 1)");
		});

		it("should convert prophoto-rgb black (0, 0, 0)", () => {
			expect(colorUtil.colorFunctionToRgba("prophoto-rgb", 0, 0, 0)).toBe("rgba(0, 0, 0, 1)");
		});

		it("should convert prophoto-rgb white (1, 1, 1)", () => {
			expect(colorUtil.colorFunctionToRgba("prophoto-rgb", 1, 1, 1)).toBe("rgba(255, 255, 255, 1)");
		});

		it("should convert xyz-d65 black (0, 0, 0)", () => {
			expect(colorUtil.colorFunctionToRgba("xyz-d65", 0, 0, 0)).toBe("rgba(0, 0, 0, 1)");
		});

		it("should convert xyz-d50 black (0, 0, 0)", () => {
			expect(colorUtil.colorFunctionToRgba("xyz-d50", 0, 0, 0)).toBe("rgba(0, 0, 0, 1)");
		});

		it("should throw for unknown color space", () => {
			expect(() => colorUtil.colorFunctionToRgba("unknown", 0, 0, 0)).toThrow();
		});
	});

	describe("parseColor — color()", () => {
		it("should parse color(srgb 1 0 0) as red", () => {
			const result = colorUtil.parseColor("color(srgb 1 0 0)");
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		});

		it("should parse color(srgb 1 0 0 / 0.5) as red with alpha 0.5", () => {
			const result = colorUtil.parseColor("color(srgb 1 0 0 / 0.5)");
			expect(result).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
		});

		it("should parse color(srgb-linear 0 0 0) as black", () => {
			const result = colorUtil.parseColor("color(srgb-linear 0 0 0)");
			expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 });
		});

		it("should parse color(display-p3 0 0 0) as black", () => {
			const result = colorUtil.parseColor("color(display-p3 0 0 0)");
			expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 });
		});

		it("should parse color(srgb 50% 0% 0%) as dark red", () => {
			const result = colorUtil.parseColor("color(srgb 50% 0% 0%)");
			expect(result.r).toBeCloseTo(128, 0);
			expect(result.g).toBe(0);
			expect(result.b).toBe(0);
			expect(result.a).toBe(1);
		});

		it("should parse color(srgb none 0 0) treating none as 0", () => {
			const result = colorUtil.parseColor("color(srgb none 0 0)");
			expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 });
		});
	});

	describe("getColorFormat — hwb and color()", () => {
		it('should return "hwb" for hwb(120 0% 0%)', () => {
			expect(colorUtil.getColorFormat("hwb(120 0% 0%)")).toBe("hwb");
		});

		it('should return "hwb" for hwb(120 0% 0% / 0.5)', () => {
			expect(colorUtil.getColorFormat("hwb(120 0% 0% / 0.5)")).toBe("hwb");
		});

		it('should return "color" for color(srgb 1 0 0)', () => {
			expect(colorUtil.getColorFormat("color(srgb 1 0 0)")).toBe("color");
		});

		it('should return "color" for color(display-p3 1 0 0)', () => {
			expect(colorUtil.getColorFormat("color(display-p3 1 0 0)")).toBe("color");
		});

		it('should return "rgb" for modern space-separated rgb(255 0 0)', () => {
			expect(colorUtil.getColorFormat("rgb(255 0 0)")).toBe("rgb");
		});

		it('should return "hsl" for modern space-separated hsl(120 100% 50%)', () => {
			expect(colorUtil.getColorFormat("hsl(120 100% 50%)")).toBe("hsl");
		});
	});
});

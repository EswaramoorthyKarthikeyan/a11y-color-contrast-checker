export interface RGBAColor {
	r: number;
	g: number;
	b: number;
	a: number;
}

export type ColorFormat = "hex" | "rgb" | "rgba" | "hsl" | "hsla" | "oklch" | "oklab" | "lab" | "lch" | "hwb" | "color";

export interface CriteriaInfo {
	/** Minimum font size (in px) to be considered large text regardless of weight. WCAG default: 24 */
	largeTextMinSize: number;
	/** Minimum font size (in px) to be considered large text when bold. WCAG default: 18.5 */
	largeTextBoldMinSize: number;
	/** Minimum font weight to be considered bold. WCAG default: 700 */
	boldMinWeight: number;
	/** Contrast ratio threshold for normal text. WCAG AA default: 4.5 */
	normalContrastRatio: number;
	/** Contrast ratio threshold for large text. WCAG AA default: 3 */
	largeContrastRatio: number;
}

export interface StyleObject {
	[property: string]: string;
}

export interface ElementStyle {
	bgColor: string;
	color: string;
	fontSize: string;
	fontWeight: string;
}

export type ColorType = "bgColor" | "color";

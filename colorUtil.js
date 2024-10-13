class ColorUtil {
	getColorFormat(colorString) {
		const hexRegex = /^#([A-Fa-f0-9]{3,4}){1,2}$/; // 3/4 or 6/8 digit hex
		const rgbaRegex = /^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([01]?\.?\d*))?\s*\)$/;
		const hslaRegex = /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*([01]?\.?\d*))?\s*\)$/;

		if (hexRegex.test(colorString)) {
			return "hex";
		} else if (rgbaRegex.test(colorString)) {
			return colorString.startsWith("rgba") ? "rgba" : "rgb";
		} else if (hslaRegex.test(colorString)) {
			return colorString.startsWith("hsla") ? "hsla" : "hsl";
		} else {
			return "unknown";
		}
	}

	hexToRgba(hex, alpha = 1) {
		hex = hex.replace(/^#/, "");
		if (hex.length === 3) {
			hex = hex
				.split("")
				.map((h) => h + h)
				.join("");
		}
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	hslToRgba(h, s, l, alpha = 1) {
		s /= 100;
		l /= 100;

		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = l - c / 2;

		let r, g, b;

		h %= 360;
		h /= 60;
		const i = Math.floor(h);
		const f = h - i;
		const p = c * (1 - f);
		const q = c * (1 - f * f);
		const t = c * (1 - f * f * f);

		switch (i % 6) {
			case 0:
				r = c;
				g = t;
				b = 0;
				break;
			case 1:
				r = q;
				g = c;
				b = 0;
				break;
			case 2:
				r = 0;
				g = c;
				b = t;
				break;
			case 3:
				r = 0;
				g = q;
				b = c;
				break;
			case 4:
				r = t;
				g = 0;
				b = c;
				break;
			case 5:
				r = c;
				g = 0;
				b = q;
				break;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	toRgba(colorString) {
		if (/^#/.test(colorString)) {
			return hexToRgba(colorString);
		} else if (/^hsl/.test(colorString)) {
			return hslToRgba(colorString);
		} else {
			throw new Error("Unsupported color format");
		}
	}

	parseColor(color) {
		if (this.getColorFormat(color) !== "rgb" && this.getColorFormat(color) !== "rgba") {
			color = this.toRgba(this.getColorFormat(color));
		}
		const rgbaRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;
		const match = color.match(rgbaRegex);
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

	isTransparent(color) {
		const parsed = this.parseColor(color);
		return parsed.a === 0 || color === "rgba(0, 0, 0, 0)" || color === "transparent";
	}

	getRelativeLuminance({ r, g, b }) {
		const [rSRGB, gSRGB, bSRGB] = [r, g, b].map((c) => {
			c /= 255;
			return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * rSRGB + 0.7152 * gSRGB + 0.0722 * bSRGB;
	}

	getElementStyle(element) {
		const style = window.getComputedStyle(element);
		return {
			bgColor: style.backgroundColor,
			color: style.color,
			fontSize: style.fontSize,
			fontWeight: style.fontWeight,
		};
	}

	getEffectiveColor(element, colorType) {
		let currentElement = element;
		let color;

		while (currentElement && currentElement !== document.body) {
			color = colorType === "bgColor" ? this.getBgColor(currentElement) : this.getColor(currentElement);

			if (!this.isTransparent(color)) {
				return color;
			}
			currentElement = currentElement.parentElement;
		}

		const bodyBg = !this.isTransparent(this.getBgColor(document.body))
			? this.getBgColor(document.body)
			: this.getBgColor(document.documentElement);

		const bodyColor = !this.isTransparent(this.getColor(document.body))
			? this.getColor(document.body)
			: this.getColor(document.documentElement);

		return colorType === "bgColor" ? bodyBg : bodyColor;
	}

	getBgColor(element) {
		return this.getElementStyle(element).bgColor;
	}

	getColor(element) {
		return this.getElementStyle(element).color;
	}
}

export { ColorUtil };

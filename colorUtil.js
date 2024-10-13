class ColorUtil {
	constructor() {}

	parseColor(color) {
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

	getEffectiveBackgroundColor(element) {
		let currentElement = element;
		let bgColor;

		while (currentElement && currentElement !== document.body) {
			bgColor = this.getElementStyle(currentElement).bgColor;
			if (!this.isTransparent(bgColor)) {
				return bgColor;
			}
			currentElement = currentElement.parentElement;
		}

		return this.getElementStyle(document.body).bgColor;
	}
}

export { ColorUtil };

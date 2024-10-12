class ColorContrastChecker {
	constructor(containerElement, criteriaInfo = { fontSize: "23.994px", fontWeight: 700, contrastThreshold: 4.5 }) {
		this.containerElement = containerElement;
		this.contrastThreshold = criteriaInfo.contrastThreshold;
		this.criteriaInfo = criteriaInfo;
		if (!this.containerElement) {
			throw new Error(`Container element with selector "${containerSelector}" not found.`);
		}
	}

	init() {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", () => this.checkContrastForChildren());
		} else {
			this.checkContrastForChildren();
		}
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

	checkContrastForChildren(element = this.containerElement) {
		const children = element.children;
		for (const child of children) {
			const childStyle = this.getElementStyle(child);
			const contrast = this.calculateContrastRatio(this.getEffectiveBackgroundColor(child), childStyle.color);

			let isValid = false;

			// check whether the element matches the criteria or not
			const isLargeFont = childStyle.fontSize <= this.criteriaInfo.fontSize;
			const isBold = childStyle.fontWeight <= this.criteriaInfo.fontWeight;
			this.contrastThreshold = isLargeFont && isBold ? 4.5 : 3.1;

			if (contrast < this.contrastThreshold) {
				child.style.border = "10px solid red";
				// child.style["::after"].content = `${child.className} contrast ratio is ${contrast}`;
			}
			if (contrast > this.contrastThreshold) {
				isValid = true;
				child.style.border = "10px solid green";
			}

			const childStyleVal = {
				class: `${child.tagName.toLowerCase()}.${child.classList.value}`,
				bgColor: this.getEffectiveBackgroundColor(child),
				color: childStyle.color,
				fontSize: childStyle.fontSize,
				fontWeight: childStyle.fontWeight,
				contrastRatio: contrast,
				isValid: isValid,
			};

			console.table(childStyleVal);

			if (child.children.length > 0) {
				this.checkContrastForChildren(child);
			}
		}
	}

	isTransparent(color) {
		const parsed = this.parseColor(color);
		return parsed.a === 0 || color === "rgba(0, 0, 0, 0)" || color === "transparent";
	}

	calculateContrastRatio(bgColor, textColor) {
		const bgLuminance = this.getRelativeLuminance(this.parseColor(bgColor));
		const textLuminance = this.getRelativeLuminance(this.parseColor(textColor));

		const lighter = Math.max(bgLuminance, textLuminance);
		const darker = Math.min(bgLuminance, textLuminance);

		return (lighter + 0.05) / (darker + 0.05);
	}

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

	getRelativeLuminance({ r, g, b }) {
		const [rSRGB, gSRGB, bSRGB] = [r, g, b].map((c) => {
			c /= 255;
			return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * rSRGB + 0.7152 * gSRGB + 0.0722 * bSRGB;
	}
}

export { ColorContrastChecker };

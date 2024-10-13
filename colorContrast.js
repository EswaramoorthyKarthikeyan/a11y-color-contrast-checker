import { ColorUtil } from "./colorUtil.js";
class ColorContrastChecker {
	constructor(containerElement, criteriaInfo = { fontSize: "23.994px", fontWeight: 700, contrastThreshold: 4.5 }) {
		this.colorUtil = new ColorUtil();
		console.log(containerElement);
		if (!containerElement) {
			console.log(`since you didn't pass the container Element, we will use the document body`);
		}
		this.containerElement = containerElement ? containerElement : document.body;
		this.contrastThreshold = criteriaInfo.contrastThreshold;
		this.criteriaInfo = criteriaInfo;
	}

	init() {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", () => this.startObserving());
		} else {
			this.startObserving();
		}
	}

	startObserving() {
		this.checkContrastForChildren();
		this.observer = new MutationObserver((mutations) => {
			for (var mutation of mutations) {
				const isContrastRelatedChange =
					mutation.attributeName &&
					(mutation.attributeName.startsWith("data-color-") ||
						mutation.attributeName.startsWith("data-border-"));

				if (mutation.type === "childList") {
					console.log("A child node has been added or removed.");
				} else if (!isContrastRelatedChange && mutation.type === "attributes") {
					console.log("The " + mutation.attributeName + " attribute was modified.");
				}

				if (!isContrastRelatedChange) {
					this.checkContrastForChildren(mutation.target);
				}
			}
		});
		this.observer.observe(this.containerElement, {
			childList: true,
			subtree: true,
			attributes: true,
		});
	}

	checkContrastForChildren(element = this.containerElement) {
		const children = element.children;
		for (const child of children) {
			const isValidElement = !child.hasAttribute("disabled") && !child.hasAttribute("hidden");

			if (isValidElement && !child.hasAttribute("data-color-contrast")) {
				const hasDirectText = Array.from(child.childNodes).some(
					(node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "",
				);

				const hasText = "value" in child ? child.value !== "" : hasDirectText;
				if (hasText) {
					const childStyle = this.colorUtil.getElementStyle(child);
					const contrast = this.calculateContrastRatio(
						this.colorUtil.getEffectiveBackgroundColor(child),
						childStyle.color,
					);
					// check whether the element matches the criteria or not
					const isLargeFont = childStyle.fontSize <= this.criteriaInfo.fontSize;
					const isBold = childStyle.fontWeight <= this.criteriaInfo.fontWeight;
					this.contrastThreshold = isLargeFont && isBold ? 4.5 : 3.1;

					if (contrast < this.contrastThreshold) {
						const currEleStyle = window.getComputedStyle(child);

						child.setAttribute("data-color-contrast", contrast);
						child.setAttribute("data-border-width", currEleStyle.borderWidth);
						child.setAttribute("data-border-style", currEleStyle.borderStyle);
						child.setAttribute("data-border-color", currEleStyle.borderColor);

						child.style.border = "2px solid red";
						const childStyleVal = {
							class: `${child.tagName.toLowerCase()}.${child.classList.value}`,
							bgColor: this.colorUtil.getEffectiveBackgroundColor(child),
							color: childStyle.color,
							fontSize: childStyle.fontSize,
							fontWeight: childStyle.fontWeight,
							contrastRatio: contrast,
							content: child.textContent,
						};
						console.table(childStyleVal);
					} else {
						if (child.hasAttribute("data-border-width")) {
							const borderWidth = child.attributes["data-border-width"];
							const borderStyle = child.attributes["data-border-style"];
							const borderColor = child.attributes["data-border-color"];
							child.style.border = `${borderWidth} ${borderStyle} ${borderColor}`;
						}
					}
				}
				if (child.children.length > 0) {
					this.checkContrastForChildren(child);
				}
			}
		}
	}

	calculateContrastRatio(bgColor, textColor) {
		const bgLuminance = this.colorUtil.getRelativeLuminance(this.colorUtil.parseColor(bgColor));
		const textLuminance = this.colorUtil.getRelativeLuminance(this.colorUtil.parseColor(textColor));

		const lighter = Math.max(bgLuminance, textLuminance);
		const darker = Math.min(bgLuminance, textLuminance);

		return (lighter + 0.05) / (darker + 0.05);
	}

	destroy() {
		if (this.observer) {
			this.observer.disconnect();
		}
	}
}

export { ColorContrastChecker };

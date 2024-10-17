import { ColorUtil } from "./colorUtil.js";
class ColorContrastChecker {
	constructor(containerElement, criteriaInfo, styleObj) {
		this.criteriaInfo = criteriaInfo
			? criteriaInfo
			: { fontSize: "23.994px", fontWeight: 700, contrastThreshold: 4.5 };
		this.styleObj = styleObj
			? styleObj
			: {
					"border-width": "2px",
					"border-style": "dashed",
					"border-color": "red",
				};
		this.colorUtil = new ColorUtil();
		if (!containerElement) {
			console.info(`since you didn't pass the container Element, we will use the document body`);
		}
		this.containerElement = containerElement ? containerElement : document.body;
		this.startCheck;
	}

	init() {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", () => this.startObserving());
		} else {
			this.startObserving();
		}
	}

	startObserving() {
		this.startCheck = setTimeout(() => {
			this.checkContrastForChildren();
			this.observer = new MutationObserver((mutations) => {
				for (var mutation of mutations) {
					if (mutation.type === "childList") {
						this.checkContrastForChildren(mutation.target);
					} else if (mutation.type === "attributes") {
						if (mutation.attributeName === "style" || mutation.attributeName === "class") {
							setTimeout(() => this.checkContrastForChildren(mutation.target), 5000);
						}
					}
				}
			});
			this.observer.observe(this.containerElement, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: ["class", "style"],
			});
		}, 1);
	}

	checkContrastForChildren(element = this.containerElement) {
		const children = element.children;
		for (const child of children) {
			const isNotDisabled = !child.hasAttribute("disabled");
			const isNotHidden = !child.hasAttribute("hidden");
			const isValidElement = isNotDisabled && isNotHidden;

			if (isValidElement) {
				const hasValidText = Array.from(child.childNodes).some(
					(node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "",
				);
				const hasText =
					"value" in child
						? child.value !== "" && child.tagName.toLowerCase() === "li" && child.value !== 0
						: hasValidText && child.textContent !== "";

				if (hasText) {
					const childStyle = this.colorUtil.getElementStyle(child);
					const contrast = this.calculateContrastRatio(
						this.colorUtil.getEffectiveColor(child, "bgColor"),
						childStyle.color,
					);

					// check whether the element matches the criteria or not
					const isLargeFont = childStyle.fontSize <= this.criteriaInfo.fontSize;
					const isBold = childStyle.fontWeight <= this.criteriaInfo.fontWeight;
					this.criteriaInfo.contrastThreshold = isLargeFont && isBold ? 4.5 : 3.1;

					if (contrast < this.criteriaInfo.contrastThreshold) {
						const currEleStyle = window.getComputedStyle(child);
						child.setAttribute("data-color-contrast", contrast);
						this.colorUtil.setStyle(child, this.styleObj);

						const childStyleVal = {
							class: `${child.tagName.toLowerCase()}.${child.classList.value}`,
							bgColor: this.colorUtil.getEffectiveColor(child, "bgColor"),
							color: this.colorUtil.getEffectiveColor(child, "color"),
							fontSize: childStyle.fontSize,
							fontWeight: childStyle.fontWeight,
							contrastRatio: contrast,
							content: child.textContent,
						};
						// console.table(childStyleVal);
					} else {
						if (child.hasAttribute("data-color-contrast")) {
							child.style.border = "unset";
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
		this.startCheck;
	}
}

export { ColorContrastChecker };

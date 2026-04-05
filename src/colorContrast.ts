import { ColorUtil } from "./colorUtil";
import StyleObserver from "style-observer";
import type { CriteriaInfo } from "./types";

class ColorContrastChecker {
	private criteriaInfo: CriteriaInfo;
	private colorUtil: ColorUtil;
	private containerElement: HTMLElement;
	private startCheck: ReturnType<typeof setTimeout> | null = null;
	private mutationObserver: MutationObserver | null = null;
	private styleObserver: StyleObserver | null = null;
	private boundStartObserving: (() => void) | null = null;
	private observedElements: Set<Element> = new Set();
	private styleElement: HTMLStyleElement | null = null;

	private readonly observedProperties: string[] = ["background-color", "color", "font-size", "font-weight"];

	private readonly mutationObserverConfig: MutationObserverInit = {
		childList: true,
		subtree: true,
	};

	private static readonly STYLE_ID = "a11y-color-contrast-checker-styles";

	private static readonly HIGHLIGHT_CSS = `
[data-color-contrast] {
  position: relative !important;
}

[data-color-contrast]::after {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 2147483647 !important;
  border-radius: 3px 5px 3px 5px !important;
  pointer-events: none !important;
  rotate: 0.5deg !important;
  transform: skew(5deg) !important;
  scale: 1.05 1.15 !important;
  --a11y-mark-color: 255 100 185;
  --a11y-mark-angle: 150deg;
  background:
    conic-gradient(at 0 100%, rgb(var(--a11y-mark-color) / 100%) 1%, #fff0 3%) no-repeat 0 0 / auto 120%,
    conic-gradient(from 180deg at 100% 0, #fff0, rgb(var(--a11y-mark-color) / 100%) 1%, #fff0 4%) no-repeat 100% 100% / auto 120%,
    linear-gradient(var(--a11y-mark-angle), rgb(var(--a11y-mark-color) / 60%), rgb(var(--a11y-mark-color) / 20%) 75%, rgb(var(--a11y-mark-color) / 55%)) no-repeat center / auto !important;
}
`;

	constructor(containerElement?: HTMLElement | null, criteriaInfo?: CriteriaInfo) {
		this.criteriaInfo = criteriaInfo
			? criteriaInfo
			: {
					largeTextMinSize: 24,
					largeTextBoldMinSize: 18.5,
					boldMinWeight: 700,
					normalContrastRatio: 4.5,
					largeContrastRatio: 3,
				};
		this.colorUtil = new ColorUtil();
		if (!containerElement) {
			console.info("since you didn't pass the container Element, we will use the document body");
		}
		this.containerElement = containerElement ? containerElement : document.body;
	}

	init(): void {
		if (document.readyState === "loading") {
			this.boundStartObserving = () => this.startObserving();
			document.addEventListener("DOMContentLoaded", this.boundStartObserving);
		} else {
			this.startObserving();
		}
	}

	private startObserving(): void {
		this.startCheck = setTimeout(() => {
			// Inject the marker highlight stylesheet
			this.injectHighlightStyles();

			// Initial contrast scan
			this.checkContrastForChildren();

			// StyleObserver for CSS property changes (background-color, color, font-size, font-weight)
			this.styleObserver = new StyleObserver((records) => {
				const processedElements = new Set<HTMLElement>();

				for (const record of records) {
					if (!(record.target instanceof HTMLElement)) {
						continue;
					}

					const target = record.target;

					// Avoid redundant processing if multiple properties changed on the same element
					if (processedElements.has(target)) {
						continue;
					}
					processedElements.add(target);

					// Re-check the element itself
					this.checkElementContrast(target);

					// If background-color or color changed, descendants may be affected
					// (children inherit visual background via parent traversal, and color via CSS inheritance)
					if (record.property === "background-color" || record.property === "color") {
						this.checkContrastForChildren(target);
					}
				}
			});

			// Observe all current elements in the container
			this.observeElements(this.containerElement);

			// MutationObserver for DOM structure changes only (childList)
			this.mutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
				for (const mutation of mutations) {
					if (mutation.type !== "childList") {
						continue;
					}

					// Handle newly added elements
					for (const node of Array.from(mutation.addedNodes)) {
						if (node instanceof HTMLElement) {
							this.observeElements(node);
							this.checkElementContrast(node);
							this.checkContrastForChildren(node);
						}
					}

					// Handle removed elements
					for (const node of Array.from(mutation.removedNodes)) {
						if (node instanceof HTMLElement) {
							this.unobserveElements(node);
						}
					}
				}
			});

			this.mutationObserver.observe(this.containerElement, this.mutationObserverConfig);
		}, 1);
	}

	/**
	 * Inject the marker highlight stylesheet into the document head.
	 */
	private injectHighlightStyles(): void {
		// Avoid duplicates if multiple instances are created
		if (document.getElementById(ColorContrastChecker.STYLE_ID)) {
			return;
		}

		this.styleElement = document.createElement("style");
		this.styleElement.id = ColorContrastChecker.STYLE_ID;
		this.styleElement.textContent = ColorContrastChecker.HIGHLIGHT_CSS;
		document.head.appendChild(this.styleElement);
	}

	/**
	 * Remove the injected marker highlight stylesheet from the document.
	 */
	private removeHighlightStyles(): void {
		if (this.styleElement && this.styleElement.parentNode) {
			this.styleElement.parentNode.removeChild(this.styleElement);
			this.styleElement = null;
		}
	}

	/**
	 * Start observing a root element and all its descendants with StyleObserver.
	 */
	private observeElements(root: HTMLElement): void {
		const elements: HTMLElement[] = [root, ...Array.from(root.querySelectorAll("*"))].filter(
			(el): el is HTMLElement => el instanceof HTMLElement,
		);

		for (const el of elements) {
			this.observedElements.add(el);
		}

		this.styleObserver?.observe(elements, this.observedProperties);
	}

	/**
	 * Stop observing a root element and all its descendants with StyleObserver.
	 */
	private unobserveElements(root: HTMLElement): void {
		const elements: HTMLElement[] = [root, ...Array.from(root.querySelectorAll("*"))].filter(
			(el): el is HTMLElement => el instanceof HTMLElement,
		);

		for (const el of elements) {
			this.observedElements.delete(el);
		}

		this.styleObserver?.unobserve(elements, this.observedProperties);
	}

	/**
	 * Check contrast for a single element (if it has text content).
	 * Applies or removes the marker highlight based on WCAG criteria.
	 * Returns false if the element and its descendants should be skipped entirely
	 * (e.g., display: none removes the entire subtree from rendering).
	 */
	private checkElementContrast(child: HTMLElement): boolean {
		// Quick attribute checks (no DOM API call needed)
		if (child.hasAttribute("hidden") || child.getAttribute("aria-hidden") === "true") {
			return false;
		}

		// CSS visibility checks (requires getComputedStyle — reuse for style reading below)
		const computedStyle = window.getComputedStyle(child);

		// display: none removes element and all descendants from rendering
		if (computedStyle.display === "none") {
			return false;
		}

		// opacity: 0 makes element and descendants invisible (children can't override)
		if (computedStyle.opacity === "0") {
			return false;
		}

		// Disabled elements are exempt per WCAG "incidental" exception
		if (child.hasAttribute("disabled")) {
			return true; // skip this element but still check children
		}

		// visibility: hidden hides text but children can override with visibility: visible
		if (computedStyle.visibility === "hidden") {
			return true; // skip this element but still check children
		}

		// Text detection — check for text nodes
		const hasValidText = Array.from(child.childNodes).some(
			(node: ChildNode) =>
				node.nodeType === Node.TEXT_NODE && node.textContent !== null && node.textContent.trim() !== "",
		);

		// Form elements have visible text via their value/placeholder
		const isFormElement =
			child instanceof HTMLInputElement ||
			child instanceof HTMLTextAreaElement ||
			child instanceof HTMLSelectElement;
		const formHasText = isFormElement && (child.value !== "" || child.hasAttribute("placeholder"));

		const hasText = formHasText || (hasValidText && child.textContent !== "");

		if (hasText) {
			// Reuse the already-fetched computedStyle instead of calling getElementStyle again
			const childStyle = {
				bgColor: computedStyle.backgroundColor,
				color: computedStyle.color,
				fontSize: computedStyle.fontSize,
				fontWeight: computedStyle.fontWeight,
			};

			const contrast = this.calculateContrastRatio(
				this.colorUtil.getEffectiveColor(child, "bgColor", childStyle.bgColor),
				childStyle.color,
			);

			// WCAG 2.1 SC 1.4.3: large text is >= 24px, or >= 18.5px and bold (>= 700)
			const fontSize = parseFloat(childStyle.fontSize);
			const fontWeight = parseInt(childStyle.fontWeight, 10);
			const isLargeText =
				fontSize >= this.criteriaInfo.largeTextMinSize ||
				(fontSize >= this.criteriaInfo.largeTextBoldMinSize && fontWeight >= this.criteriaInfo.boldMinWeight);
			const contrastThreshold = isLargeText
				? this.criteriaInfo.largeContrastRatio
				: this.criteriaInfo.normalContrastRatio;

			if (contrast < contrastThreshold) {
				// Mark the element as failing — the injected CSS handles the visual highlight
				child.setAttribute("data-color-contrast", String(Math.round(contrast * 100) / 100));
			} else {
				if (child.hasAttribute("data-color-contrast")) {
					// Element now passes — remove the marker
					child.removeAttribute("data-color-contrast");
				}
			}
		}

		return true;
	}

	/**
	 * Recursively check contrast for all children of the given element.
	 */
	private checkContrastForChildren(element: HTMLElement = this.containerElement): void {
		for (const child of Array.from(element.children)) {
			if (!(child instanceof HTMLElement)) {
				continue;
			}

			const shouldCheckChildren = this.checkElementContrast(child);

			if (shouldCheckChildren && child.children.length > 0) {
				this.checkContrastForChildren(child);
			}
		}
	}

	calculateContrastRatio(bgColor: string, textColor: string): number {
		const bgLuminance = this.colorUtil.getRelativeLuminance(this.colorUtil.parseColor(bgColor));
		const textLuminance = this.colorUtil.getRelativeLuminance(this.colorUtil.parseColor(textColor));

		const lighter = Math.max(bgLuminance, textLuminance);
		const darker = Math.min(bgLuminance, textLuminance);

		return (lighter + 0.05) / (darker + 0.05);
	}

	destroy(): void {
		if (this.mutationObserver) {
			this.mutationObserver.disconnect();
			this.mutationObserver = null;
		}

		if (this.styleObserver && this.observedElements.size > 0) {
			this.styleObserver.unobserve(Array.from(this.observedElements), this.observedProperties);
			this.observedElements.clear();
		}
		this.styleObserver = null;

		clearTimeout(this.startCheck ?? undefined);
		this.startCheck = null;

		if (this.boundStartObserving) {
			document.removeEventListener("DOMContentLoaded", this.boundStartObserving);
			this.boundStartObserving = null;
		}

		// Clean up all flagged elements
		const flaggedElements = this.containerElement.querySelectorAll("[data-color-contrast]");
		for (const el of Array.from(flaggedElements)) {
			el.removeAttribute("data-color-contrast");
		}

		// Remove injected stylesheet
		this.removeHighlightStyles();
	}
}

export { ColorContrastChecker };

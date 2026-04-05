import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ColorContrastChecker } from "../src/colorContrast";
import type { CriteriaInfo } from "../src/types";

const wait = (ms: number = 50) => new Promise((resolve) => setTimeout(resolve, ms));

describe("ColorContrastChecker", () => {
	// ─── 1. calculateContrastRatio (pure math, no DOM needed) ────────────────────

	describe("calculateContrastRatio", () => {
		let checker: ColorContrastChecker;

		beforeEach(() => {
			checker = new ColorContrastChecker(document.body);
		});

		afterEach(() => {
			checker.destroy();
		});

		it("should return 21 for black text on white background", () => {
			const ratio = checker.calculateContrastRatio("rgb(255, 255, 255)", "rgb(0, 0, 0)");
			expect(ratio).toBeCloseTo(21, 0);
		});

		it("should return 1 for white text on white background", () => {
			const ratio = checker.calculateContrastRatio("rgb(255, 255, 255)", "rgb(255, 255, 255)");
			expect(ratio).toBeCloseTo(1, 0);
		});

		it("should return 1 for black text on black background", () => {
			const ratio = checker.calculateContrastRatio("rgb(0, 0, 0)", "rgb(0, 0, 0)");
			expect(ratio).toBeCloseTo(1, 0);
		});

		it("should return approximately 4.0 for red text on white background", () => {
			const ratio = checker.calculateContrastRatio("rgb(255, 255, 255)", "rgb(255, 0, 0)");
			expect(ratio).toBeCloseTo(4.0, 0);
		});
	});

	// ─── 2. Constructor defaults ─────────────────────────────────────────────────

	describe("constructor defaults", () => {
		it("should not throw when created with no arguments", () => {
			expect(() => new ColorContrastChecker()).not.toThrow();
		});

		it("should not throw when created with null container", () => {
			expect(() => new ColorContrastChecker(null)).not.toThrow();
		});

		it("should accept a custom container element", () => {
			const container = document.createElement("div");
			document.body.appendChild(container);
			expect(() => new ColorContrastChecker(container)).not.toThrow();
			container.remove();
		});

		it("should accept custom criteria info", () => {
			const criteria: CriteriaInfo = {
				largeTextMinSize: 30,
				largeTextBoldMinSize: 20,
				boldMinWeight: 600,
				normalContrastRatio: 7,
				largeContrastRatio: 4.5,
			};
			const checker = new ColorContrastChecker(document.body, criteria);
			expect(checker).toBeDefined();
			checker.destroy();
		});
	});

	// ─── 3. init() and destroy() lifecycle ───────────────────────────────────────

	describe("init() and destroy() lifecycle", () => {
		let checker: ColorContrastChecker;

		afterEach(() => {
			checker?.destroy();
			// Clean up any leftover style elements
			const style = document.getElementById("a11y-color-contrast-checker-styles");
			style?.remove();
		});

		it("should inject the highlight stylesheet into <head> on init", async () => {
			checker = new ColorContrastChecker(document.body);
			checker.init();
			await wait();

			const styleEl = document.getElementById("a11y-color-contrast-checker-styles");
			expect(styleEl).not.toBeNull();
			expect(styleEl?.tagName.toLowerCase()).toBe("style");
		});

		it("should remove the stylesheet on destroy", async () => {
			checker = new ColorContrastChecker(document.body);
			checker.init();
			await wait();

			// Verify it was injected first
			expect(document.getElementById("a11y-color-contrast-checker-styles")).not.toBeNull();

			checker.destroy();

			expect(document.getElementById("a11y-color-contrast-checker-styles")).toBeNull();
		});

		it("should clean up data-color-contrast attributes from flagged elements on destroy", async () => {
			const container = document.createElement("div");
			container.id = "lifecycle-container";
			document.body.appendChild(container);

			const el = document.createElement("p");
			el.textContent = "Low contrast text";
			el.style.backgroundColor = "rgb(255, 255, 255)";
			el.style.color = "rgb(255, 255, 255)";
			el.style.fontSize = "16px";
			el.style.fontWeight = "400";
			container.appendChild(el);

			checker = new ColorContrastChecker(container);
			checker.init();
			await wait();

			// Manually set the attribute to simulate flagging (in case happy-dom doesn't fully support getComputedStyle)
			if (!el.hasAttribute("data-color-contrast")) {
				el.setAttribute("data-color-contrast", "1");
			}

			expect(el.hasAttribute("data-color-contrast")).toBe(true);

			checker.destroy();

			expect(el.hasAttribute("data-color-contrast")).toBe(false);

			container.remove();
		});
	});

	// ─── 4. Contrast checking with DOM elements ─────────────────────────────────

	describe("contrast checking with DOM elements", () => {
		let container: HTMLDivElement;
		let checker: ColorContrastChecker;

		beforeEach(() => {
			container = document.createElement("div");
			container.id = "test-container";
			document.body.appendChild(container);
		});

		afterEach(() => {
			checker?.destroy();
			const el = document.getElementById("test-container");
			el?.remove();
		});

		it("should flag an element with white text on white background (contrast ~1:1)", async () => {
			const el = document.createElement("p");
			el.textContent = "Invisible text";
			el.style.backgroundColor = "rgb(255, 255, 255)";
			el.style.color = "rgb(255, 255, 255)";
			el.style.fontSize = "16px";
			el.style.fontWeight = "400";
			container.appendChild(el);

			checker = new ColorContrastChecker(container);
			checker.init();
			await wait();

			expect(el.hasAttribute("data-color-contrast")).toBe(true);
		});

		it("should NOT flag an element with black text on white background (contrast 21:1)", async () => {
			const el = document.createElement("p");
			el.textContent = "High contrast text";
			el.style.backgroundColor = "rgb(255, 255, 255)";
			el.style.color = "rgb(0, 0, 0)";
			el.style.fontSize = "16px";
			el.style.fontWeight = "400";
			container.appendChild(el);

			checker = new ColorContrastChecker(container);
			checker.init();
			await wait();

			expect(el.hasAttribute("data-color-contrast")).toBe(false);
		});

		it("should NOT check a hidden element (no data-color-contrast)", async () => {
			const el = document.createElement("p");
			el.textContent = "Hidden text";
			el.setAttribute("hidden", "");
			el.style.backgroundColor = "rgb(255, 255, 255)";
			el.style.color = "rgb(255, 255, 255)";
			el.style.fontSize = "16px";
			el.style.fontWeight = "400";
			container.appendChild(el);

			checker = new ColorContrastChecker(container);
			checker.init();
			await wait();

			expect(el.hasAttribute("data-color-contrast")).toBe(false);
		});

		it("should NOT check a disabled element (WCAG incidental exception)", async () => {
			const el = document.createElement("input");
			el.type = "text";
			el.value = "Disabled input";
			el.setAttribute("disabled", "");
			el.style.backgroundColor = "rgb(255, 255, 255)";
			el.style.color = "rgb(255, 255, 255)";
			el.style.fontSize = "16px";
			el.style.fontWeight = "400";
			container.appendChild(el);

			checker = new ColorContrastChecker(container);
			checker.init();
			await wait();

			expect(el.hasAttribute("data-color-contrast")).toBe(false);
		});
	});

	// ─── 5. WCAG thresholds ─────────────────────────────────────────────────────

	describe("WCAG thresholds", () => {
		let container: HTMLDivElement;
		let checker: ColorContrastChecker;

		beforeEach(() => {
			container = document.createElement("div");
			container.id = "threshold-container";
			container.style.backgroundColor = "rgb(255, 255, 255)";
			document.body.appendChild(container);
		});

		afterEach(() => {
			checker?.destroy();
			const el = document.getElementById("threshold-container");
			el?.remove();
		});

		describe("normal text (16px, weight 400) — threshold 4.5", () => {
			it("should flag text with contrast ratio below 4.5", async () => {
				// rgb(255, 0, 0) on white ≈ 4.0 contrast — should fail
				const el = document.createElement("p");
				el.textContent = "Red on white";
				el.style.backgroundColor = "rgb(255, 255, 255)";
				el.style.color = "rgb(255, 0, 0)";
				el.style.fontSize = "16px";
				el.style.fontWeight = "400";
				container.appendChild(el);

				checker = new ColorContrastChecker(container);
				checker.init();
				await wait();

				expect(el.hasAttribute("data-color-contrast")).toBe(true);
			});

			it("should NOT flag text with contrast ratio above 4.5", async () => {
				// rgb(0, 0, 0) on white = 21 contrast — should pass
				const el = document.createElement("p");
				el.textContent = "Black on white";
				el.style.backgroundColor = "rgb(255, 255, 255)";
				el.style.color = "rgb(0, 0, 0)";
				el.style.fontSize = "16px";
				el.style.fontWeight = "400";
				container.appendChild(el);

				checker = new ColorContrastChecker(container);
				checker.init();
				await wait();

				expect(el.hasAttribute("data-color-contrast")).toBe(false);
			});
		});

		describe("large text (24px, weight 400) — threshold 3", () => {
			it("should NOT flag large text with contrast ratio above 3 but below 4.5", async () => {
				// rgb(255, 0, 0) on white ≈ 4.0 contrast — should pass for large text
				const el = document.createElement("p");
				el.textContent = "Large red on white";
				el.style.backgroundColor = "rgb(255, 255, 255)";
				el.style.color = "rgb(255, 0, 0)";
				el.style.fontSize = "24px";
				el.style.fontWeight = "400";
				container.appendChild(el);

				checker = new ColorContrastChecker(container);
				checker.init();
				await wait();

				expect(el.hasAttribute("data-color-contrast")).toBe(false);
			});
		});

		describe("bold text (20px, weight 700) — threshold 3", () => {
			it("should NOT flag bold large text with contrast ratio above 3 but below 4.5", async () => {
				// 20px >= 18.5px and weight 700 >= 700 → large text threshold of 3
				// rgb(255, 0, 0) on white ≈ 4.0 contrast — should pass
				const el = document.createElement("p");
				el.textContent = "Bold red on white";
				el.style.backgroundColor = "rgb(255, 255, 255)";
				el.style.color = "rgb(255, 0, 0)";
				el.style.fontSize = "20px";
				el.style.fontWeight = "700";
				container.appendChild(el);

				checker = new ColorContrastChecker(container);
				checker.init();
				await wait();

				expect(el.hasAttribute("data-color-contrast")).toBe(false);
			});
		});
	});
});

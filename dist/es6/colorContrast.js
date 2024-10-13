class g {
  constructor() {
  }
  parseColor(r) {
    const e = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/, t = r.match(e);
    if (t)
      return {
        r: parseInt(t[1], 10),
        g: parseInt(t[2], 10),
        b: parseInt(t[3], 10),
        a: t[4] ? parseFloat(t[4]) : 1
      };
    throw new Error(`Invalid color format: ${r}`);
  }
  isTransparent(r) {
    return this.parseColor(r).a === 0 || r === "rgba(0, 0, 0, 0)" || r === "transparent";
  }
  getRelativeLuminance({ r, g: e, b: t }) {
    const [s, i, a] = [r, e, t].map((o) => (o /= 255, o <= 0.03928 ? o / 12.92 : Math.pow((o + 0.055) / 1.055, 2.4)));
    return 0.2126 * s + 0.7152 * i + 0.0722 * a;
  }
  getElementStyle(r) {
    const e = window.getComputedStyle(r);
    return {
      bgColor: e.backgroundColor,
      color: e.color,
      fontSize: e.fontSize,
      fontWeight: e.fontWeight
    };
  }
  getEffectiveBackgroundColor(r) {
    let e = r, t;
    for (; e && e !== document.body; ) {
      if (t = this.getElementStyle(e).bgColor, !this.isTransparent(t))
        return t;
      e = e.parentElement;
    }
    return this.getElementStyle(document.body).bgColor;
  }
}
class f {
  constructor(r, e = { fontSize: "23.994px", fontWeight: 700, contrastThreshold: 4.5 }) {
    if (this.containerElement = r, this.contrastThreshold = e.contrastThreshold, this.criteriaInfo = e, !this.containerElement)
      throw new Error(`Container element with selector "${containerSelector}" not found.`);
    this.colorUtil = new g();
  }
  init() {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => this.startObserving()) : this.startObserving();
  }
  startObserving() {
    this.checkContrastForChildren(), this.observer = new MutationObserver((r) => {
      for (var e of r) {
        const t = e.attributeName && (e.attributeName.startsWith("data-color-") || e.attributeName.startsWith("data-border-"));
        e.type === "childList" ? console.log("A child node has been added or removed.") : !t && e.type === "attributes" && console.log("The " + e.attributeName + " attribute was modified."), t || this.checkContrastForChildren(e.target);
      }
    }), this.observer.observe(this.containerElement, {
      childList: !0,
      subtree: !0,
      attributes: !0
    });
  }
  checkContrastForChildren(r = this.containerElement) {
    const e = r.children;
    for (const t of e)
      if (!t.hasAttribute("disabled") && !t.hasAttribute("hidden") && !t.hasAttribute("data-color-contrast")) {
        const i = Array.from(t.childNodes).some(
          (o) => o.nodeType === Node.TEXT_NODE && o.textContent.trim() !== ""
        );
        if ("value" in t ? t.value !== "" : i) {
          const o = this.colorUtil.getElementStyle(t), l = this.calculateContrastRatio(
            this.colorUtil.getEffectiveBackgroundColor(t),
            o.color
          ), h = o.fontSize <= this.criteriaInfo.fontSize, b = o.fontWeight <= this.criteriaInfo.fontWeight;
          if (this.contrastThreshold = h && b ? 4.5 : 3.1, l < this.contrastThreshold) {
            const n = window.getComputedStyle(t);
            t.setAttribute("data-color-contrast", l), t.setAttribute("data-border-width", n.borderWidth), t.setAttribute("data-border-style", n.borderStyle), t.setAttribute("data-border-color", n.borderColor), t.style.border = "2px solid red";
            const c = {
              class: `${t.tagName.toLowerCase()}.${t.classList.value}`,
              bgColor: this.colorUtil.getEffectiveBackgroundColor(t),
              color: o.color,
              fontSize: o.fontSize,
              fontWeight: o.fontWeight,
              contrastRatio: l,
              content: t.textContent
            };
            console.table(c);
          } else if (t.hasAttribute("data-border-width")) {
            const n = t.attributes["data-border-width"], c = t.attributes["data-border-style"], u = t.attributes["data-border-color"];
            t.style.border = `${n} ${c} ${u}`;
          }
        }
        t.children.length > 0 && this.checkContrastForChildren(t);
      }
  }
  calculateContrastRatio(r, e) {
    const t = this.colorUtil.getRelativeLuminance(this.colorUtil.parseColor(r)), s = this.colorUtil.getRelativeLuminance(this.colorUtil.parseColor(e)), i = Math.max(t, s), a = Math.min(t, s);
    return (i + 0.05) / (a + 0.05);
  }
  destroy() {
    this.observer && this.observer.disconnect();
  }
}
export {
  f as ColorContrastChecker
};
//# sourceMappingURL=colorContrast.js.map

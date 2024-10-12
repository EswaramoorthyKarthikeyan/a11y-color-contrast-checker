class h {
  constructor(r, e = { fontSize: "23.994px", fontWeight: 700, contrastThreshold: 4.5 }) {
    if (this.containerElement = r, this.contrastThreshold = e.contrastThreshold, this.criteriaInfo = e, !this.containerElement)
      throw new Error(`Container element with selector "${containerSelector}" not found.`);
  }
  init() {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => this.startObserving()) : this.startObserving();
  }
  startObserving() {
    this.checkContrastForChildren(), this.observer = new MutationObserver((r, e) => {
      for (var t of r)
        t.type === "childList" ? console.log("A child node has been added or removed.") : t.type === "attributes" && console.log("The " + t.attributeName + " attribute was modified."), console.log(t.target), this.checkContrastForChildren(t.target);
    }), this.observer.observe(this.containerElement, {
      childList: !0,
      subtree: !0,
      attributes: !0
    });
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
  checkContrastForChildren(r = this.containerElement) {
    const e = r.children;
    for (const t of e)
      if (!t.hasAttribute("disabled")) {
        if (!t.hasAttribute("data-color-contrast") && ("value" in t ? t.value !== "" : t.textContent !== "")) {
          const o = this.getElementStyle(t), n = this.calculateContrastRatio(
            this.getEffectiveBackgroundColor(t),
            o.color
          ), s = o.fontSize <= this.criteriaInfo.fontSize, a = o.fontWeight <= this.criteriaInfo.fontWeight;
          if (this.contrastThreshold = s && a ? 4.5 : 3.1, n < this.contrastThreshold) {
            t.setAttribute("data-color-contrast", n), t.style.border = "2px solid red";
            const l = {
              class: `${t.tagName.toLowerCase()}.${t.classList.value}`,
              bgColor: this.getEffectiveBackgroundColor(t),
              color: o.color,
              fontSize: o.fontSize,
              fontWeight: o.fontWeight,
              contrastRatio: n
            };
            console.table(l);
          }
        }
        t.children.length > 0 && this.checkContrastForChildren(t);
      }
  }
  isTransparent(r) {
    return this.parseColor(r).a === 0 || r === "rgba(0, 0, 0, 0)" || r === "transparent";
  }
  calculateContrastRatio(r, e) {
    const t = this.getRelativeLuminance(this.parseColor(r)), i = this.getRelativeLuminance(this.parseColor(e)), o = Math.max(t, i), n = Math.min(t, i);
    return (o + 0.05) / (n + 0.05);
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
  getRelativeLuminance({ r, g: e, b: t }) {
    const [i, o, n] = [r, e, t].map((s) => (s /= 255, s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)));
    return 0.2126 * i + 0.7152 * o + 0.0722 * n;
  }
  destroy() {
    this.observer && this.observer.disconnect();
  }
}
export {
  h as ColorContrastChecker
};
//# sourceMappingURL=colorContrast.js.map

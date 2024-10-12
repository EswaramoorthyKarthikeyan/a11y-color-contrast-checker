class h {
  constructor(o, e = { fontSize: "23.994px", fontWeight: 700, contrastThreshold: 4.5 }) {
    if (this.containerElement = o, this.contrastThreshold = e.contrastThreshold, this.criteriaInfo = e, !this.containerElement)
      throw new Error(`Container element with selector "${containerSelector}" not found.`);
  }
  init() {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => this.checkContrastForChildren()) : this.checkContrastForChildren();
  }
  getElementStyle(o) {
    const e = window.getComputedStyle(o);
    return {
      bgColor: e.backgroundColor,
      color: e.color,
      fontSize: e.fontSize,
      fontWeight: e.fontWeight
    };
  }
  getEffectiveBackgroundColor(o) {
    let e = o, t;
    for (; e && e !== document.body; ) {
      if (t = this.getElementStyle(e).bgColor, !this.isTransparent(t))
        return t;
      e = e.parentElement;
    }
    return this.getElementStyle(document.body).bgColor;
  }
  checkContrastForChildren(o = this.containerElement) {
    const e = o.children;
    for (const t of e) {
      const r = this.getElementStyle(t), n = this.calculateContrastRatio(this.getEffectiveBackgroundColor(t), r.color);
      let s = !1;
      const i = r.fontSize <= this.criteriaInfo.fontSize, a = r.fontWeight <= this.criteriaInfo.fontWeight;
      this.contrastThreshold = i && a ? 4.5 : 3.1, n < this.contrastThreshold && (t.style.border = "2px solid red"), n > this.contrastThreshold && (s = !0, t.style.border = "2px solid green");
      const l = {
        class: `${t.tagName.toLowerCase()}.${t.classList.value}`,
        bgColor: this.getEffectiveBackgroundColor(t),
        color: r.color,
        fontSize: r.fontSize,
        fontWeight: r.fontWeight,
        contrastRatio: n,
        isValid: s
      };
      console.table(l), t.children.length > 0 && this.checkContrastForChildren(t);
    }
  }
  isTransparent(o) {
    return this.parseColor(o).a === 0 || o === "rgba(0, 0, 0, 0)" || o === "transparent";
  }
  calculateContrastRatio(o, e) {
    const t = this.getRelativeLuminance(this.parseColor(o)), r = this.getRelativeLuminance(this.parseColor(e)), n = Math.max(t, r), s = Math.min(t, r);
    return (n + 0.05) / (s + 0.05);
  }
  parseColor(o) {
    const e = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/, t = o.match(e);
    if (t)
      return {
        r: parseInt(t[1], 10),
        g: parseInt(t[2], 10),
        b: parseInt(t[3], 10),
        a: t[4] ? parseFloat(t[4]) : 1
      };
    throw new Error(`Invalid color format: ${o}`);
  }
  getRelativeLuminance({ r: o, g: e, b: t }) {
    const [r, n, s] = [o, e, t].map((i) => (i /= 255, i <= 0.03928 ? i / 12.92 : Math.pow((i + 0.055) / 1.055, 2.4)));
    return 0.2126 * r + 0.7152 * n + 0.0722 * s;
  }
}
export {
  h as ColorContrastChecker
};
//# sourceMappingURL=colorContrast.js.map

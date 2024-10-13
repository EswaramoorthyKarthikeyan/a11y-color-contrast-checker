class g {
  getColorFormat(t) {
    const r = /^#([A-Fa-f0-9]{3,4}){1,2}$/, e = /^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([01]?\.?\d*))?\s*\)$/, n = /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*([01]?\.?\d*))?\s*\)$/;
    return r.test(t) ? "hex" : e.test(t) ? t.startsWith("rgba") ? "rgba" : "rgb" : n.test(t) ? t.startsWith("hsla") ? "hsla" : "hsl" : "unknown";
  }
  hexToRgba(t, r = 1) {
    t = t.replace(/^#/, ""), t.length === 3 && (t = t.split("").map((i) => i + i).join(""));
    const e = parseInt(t.substring(0, 2), 16), n = parseInt(t.substring(2, 4), 16), o = parseInt(t.substring(4, 6), 16);
    return `rgba(${e}, ${n}, ${o}, ${r})`;
  }
  hslToRgba(t, r, e, n = 1) {
    r /= 100, e /= 100;
    const o = (1 - Math.abs(2 * e - 1)) * r, i = e - o / 2;
    let s, a, l;
    t %= 360, t /= 60;
    const b = Math.floor(t), c = t - b, d = o * (1 - c * c), h = o * (1 - c * c * c);
    switch (b % 6) {
      case 0:
        s = o, a = h, l = 0;
        break;
      case 1:
        s = d, a = o, l = 0;
        break;
      case 2:
        s = 0, a = o, l = h;
        break;
      case 3:
        s = 0, a = d, l = o;
        break;
      case 4:
        s = h, a = 0, l = o;
        break;
      case 5:
        s = o, a = 0, l = d;
        break;
    }
    return s = Math.round((s + i) * 255), a = Math.round((a + i) * 255), l = Math.round((l + i) * 255), `rgba(${s}, ${a}, ${l}, ${n})`;
  }
  toRgba(t) {
    if (/^#/.test(t))
      return hexToRgba(t);
    if (/^hsl/.test(t))
      return hslToRgba(t);
    throw new Error("Unsupported color format");
  }
  parseColor(t) {
    this.getColorFormat(t) !== "rgb" && this.getColorFormat(t) !== "rgba" && (t = this.toRgba(this.getColorFormat(t)));
    const r = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/, e = t.match(r);
    if (e)
      return {
        r: parseInt(e[1], 10),
        g: parseInt(e[2], 10),
        b: parseInt(e[3], 10),
        a: e[4] ? parseFloat(e[4]) : 1
      };
    throw new Error(`Invalid color format: ${t}`);
  }
  isTransparent(t) {
    return this.parseColor(t).a === 0 || t === "rgba(0, 0, 0, 0)" || t === "transparent";
  }
  getRelativeLuminance({ r: t, g: r, b: e }) {
    const [n, o, i] = [t, r, e].map((s) => (s /= 255, s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)));
    return 0.2126 * n + 0.7152 * o + 0.0722 * i;
  }
  getElementStyle(t) {
    const r = window.getComputedStyle(t);
    return {
      bgColor: r.backgroundColor,
      color: r.color,
      fontSize: r.fontSize,
      fontWeight: r.fontWeight
    };
  }
  getEffectiveBackgroundColor(t) {
    let r = t, e;
    for (; r && r !== document.body; ) {
      if (e = this.getElementStyle(r).bgColor, !this.isTransparent(e))
        return e;
      r = r.parentElement;
    }
    return this.getElementStyle(document.body).bgColor;
  }
}
class f {
  constructor(t, r = { fontSize: "23.994px", fontWeight: 700, contrastThreshold: 4.5 }) {
    this.colorUtil = new g(), t || console.info("since you didn't pass the container Element, we will use the document body"), this.containerElement = t || document.body, this.contrastThreshold = r.contrastThreshold, this.criteriaInfo = r;
  }
  init() {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => this.startObserving()) : this.startObserving();
  }
  startObserving() {
    this.checkContrastForChildren(), this.observer = new MutationObserver((t) => {
      for (var r of t)
        r.attributeName && (r.attributeName.startsWith("data-color-") || r.attributeName.startsWith("data-border-")) || this.checkContrastForChildren(r.target);
    }), this.observer.observe(this.containerElement, {
      childList: !0,
      subtree: !0,
      attributes: !0
    });
  }
  checkContrastForChildren(t = this.containerElement) {
    const r = t.children;
    for (const e of r)
      if (!e.hasAttribute("disabled") && !e.hasAttribute("hidden") && !e.hasAttribute("data-color-contrast")) {
        const o = Array.from(e.childNodes).some(
          (s) => s.nodeType === Node.TEXT_NODE && s.textContent.trim() !== ""
        );
        if ("value" in e ? e.value !== "" : o) {
          const s = this.colorUtil.getElementStyle(e), a = this.calculateContrastRatio(
            this.colorUtil.getEffectiveBackgroundColor(e),
            s.color
          ), l = s.fontSize <= this.criteriaInfo.fontSize, b = s.fontWeight <= this.criteriaInfo.fontWeight;
          if (this.contrastThreshold = l && b ? 4.5 : 3.1, a < this.contrastThreshold) {
            const c = window.getComputedStyle(e);
            e.setAttribute("data-color-contrast", a), e.setAttribute("data-border-width", c.borderWidth), e.setAttribute("data-border-style", c.borderStyle), e.setAttribute("data-border-color", c.borderColor), e.style.border = "2px solid red";
            const d = {
              class: `${e.tagName.toLowerCase()}.${e.classList.value}`,
              bgColor: this.colorUtil.getEffectiveBackgroundColor(e),
              color: s.color,
              fontSize: s.fontSize,
              fontWeight: s.fontWeight,
              contrastRatio: a,
              content: e.textContent
            };
            console.table(d);
          } else if (e.hasAttribute("data-border-width")) {
            const c = e.attributes["data-border-width"], d = e.attributes["data-border-style"], h = e.attributes["data-border-color"];
            e.style.border = `${c} ${d} ${h}`;
          }
        }
        e.children.length > 0 && this.checkContrastForChildren(e);
      }
  }
  calculateContrastRatio(t, r) {
    const e = this.colorUtil.getRelativeLuminance(this.colorUtil.parseColor(t)), n = this.colorUtil.getRelativeLuminance(this.colorUtil.parseColor(r)), o = Math.max(e, n), i = Math.min(e, n);
    return (o + 0.05) / (i + 0.05);
  }
  destroy() {
    this.observer && this.observer.disconnect();
  }
}
export {
  f as ColorContrastChecker
};
//# sourceMappingURL=colorContrast.js.map

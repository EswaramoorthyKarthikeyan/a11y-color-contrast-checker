"use strict";

function _typeof(o) {
	"@babel/helpers - typeof";
	return (
		(_typeof =
			"function" == typeof Symbol && "symbol" == typeof Symbol.iterator
				? function (o) {
						return typeof o;
					}
				: function (o) {
						return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype
							? "symbol"
							: typeof o;
					}),
		_typeof(o)
	);
}
function _slicedToArray(r, e) {
	return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _nonIterableRest() {
	throw new TypeError(
		"Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
	);
}
function _iterableToArrayLimit(r, l) {
	var t = null == r ? null : ("undefined" != typeof Symbol && r[Symbol.iterator]) || r["@@iterator"];
	if (null != t) {
		var e,
			n,
			i,
			u,
			a = [],
			f = !0,
			o = !1;
		try {
			if (((i = (t = t.call(r)).next), 0 === l)) {
				if (Object(t) !== t) return;
				f = !1;
			} else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
		} catch (r) {
			(o = !0), (n = r);
		} finally {
			try {
				if (!f && null != t["return"] && ((u = t["return"]()), Object(u) !== u)) return;
			} finally {
				if (o) throw n;
			}
		}
		return a;
	}
}
function _arrayWithHoles(r) {
	if (Array.isArray(r)) return r;
}
function _createForOfIteratorHelper(r, e) {
	var t = ("undefined" != typeof Symbol && r[Symbol.iterator]) || r["@@iterator"];
	if (!t) {
		if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || (e && r && "number" == typeof r.length)) {
			t && (r = t);
			var _n = 0,
				F = function F() {};
			return {
				s: F,
				n: function n() {
					return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] };
				},
				e: function e(r) {
					throw r;
				},
				f: F,
			};
		}
		throw new TypeError(
			"Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
		);
	}
	var o,
		a = !0,
		u = !1;
	return {
		s: function s() {
			t = t.call(r);
		},
		n: function n() {
			var r = t.next();
			return (a = r.done), r;
		},
		e: function e(r) {
			(u = !0), (o = r);
		},
		f: function f() {
			try {
				a || null == t["return"] || t["return"]();
			} finally {
				if (u) throw o;
			}
		},
	};
}
function _unsupportedIterableToArray(r, a) {
	if (r) {
		if ("string" == typeof r) return _arrayLikeToArray(r, a);
		var t = {}.toString.call(r).slice(8, -1);
		return (
			"Object" === t && r.constructor && (t = r.constructor.name),
			"Map" === t || "Set" === t
				? Array.from(r)
				: "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
					? _arrayLikeToArray(r, a)
					: void 0
		);
	}
}
function _arrayLikeToArray(r, a) {
	(null == a || a > r.length) && (a = r.length);
	for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
	return n;
}
function _classCallCheck(a, n) {
	if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
	for (var t = 0; t < r.length; t++) {
		var o = r[t];
		(o.enumerable = o.enumerable || !1),
			(o.configurable = !0),
			"value" in o && (o.writable = !0),
			Object.defineProperty(e, _toPropertyKey(o.key), o);
	}
}
function _createClass(e, r, t) {
	return (
		r && _defineProperties(e.prototype, r),
		t && _defineProperties(e, t),
		Object.defineProperty(e, "prototype", { writable: !1 }),
		e
	);
}
function _toPropertyKey(t) {
	var i = _toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}
function _toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}
var ColorContrastChecker = /*#__PURE__*/ (function () {
	function ColorContrastChecker(containerElement) {
		var criteriaInfo =
			arguments.length > 1 && arguments[1] !== undefined
				? arguments[1]
				: {
						fontSize: "23.994px",
						fontWeight: 700,
						contrastThreshold: 4.5,
					};
		_classCallCheck(this, ColorContrastChecker);
		this.containerElement = containerElement;
		this.contrastThreshold = criteriaInfo.contrastThreshold;
		this.criteriaInfo = criteriaInfo;
		if (!this.containerElement) {
			throw new Error('Container element with selector "'.concat(containerSelector, '" not found.'));
		}
	}
	return _createClass(ColorContrastChecker, [
		{
			key: "init",
			value: function init() {
				var _this = this;
				if (document.readyState === "loading") {
					document.addEventListener("DOMContentLoaded", function () {
						return _this.checkContrastForChildren();
					});
				} else {
					this.checkContrastForChildren();
				}
			},
		},
		{
			key: "getElementStyle",
			value: function getElementStyle(element) {
				var style = window.getComputedStyle(element);
				return {
					bgColor: style.backgroundColor,
					color: style.color,
					fontSize: style.fontSize,
					fontWeight: style.fontWeight,
				};
			},
		},
		{
			key: "getEffectiveBackgroundColor",
			value: function getEffectiveBackgroundColor(element) {
				var currentElement = element;
				var bgColor;
				while (currentElement && currentElement !== document.body) {
					bgColor = this.getElementStyle(currentElement).bgColor;
					if (!this.isTransparent(bgColor)) {
						return bgColor;
					}
					currentElement = currentElement.parentElement;
				}
				return this.getElementStyle(document.body).bgColor;
			},
		},
		{
			key: "checkContrastForChildren",
			value: function checkContrastForChildren() {
				var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.containerElement;
				var children = element.children;
				var _iterator = _createForOfIteratorHelper(children),
					_step;
				try {
					for (_iterator.s(); !(_step = _iterator.n()).done; ) {
						var child = _step.value;
						var childStyle = this.getElementStyle(child);
						var contrast = this.calculateContrastRatio(
							this.getEffectiveBackgroundColor(child),
							childStyle.color,
						);
						var isValid = false;

						// check whether the element matches the criteria or not
						var isLargeFont = childStyle.fontSize <= this.criteriaInfo.fontSize;
						var isBold = childStyle.fontWeight <= this.criteriaInfo.fontWeight;
						this.contrastThreshold = isLargeFont && isBold ? 4.5 : 3.1;
						if (contrast < this.contrastThreshold) {
							child.style.border = "10px solid red";
							// child.style["::after"].content = `${child.className} contrast ratio is ${contrast}`;
						}
						if (contrast > this.contrastThreshold) {
							isValid = true;
							child.style.border = "10px solid green";
						}
						var childStyleVal = {
							class: child.classList.value,
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
				} catch (err) {
					_iterator.e(err);
				} finally {
					_iterator.f();
				}
			},
		},
		{
			key: "isTransparent",
			value: function isTransparent(color) {
				var parsed = this.parseColor(color);
				return parsed.a === 0 || color === "rgba(0, 0, 0, 0)" || color === "transparent";
			},
		},
		{
			key: "calculateContrastRatio",
			value: function calculateContrastRatio(bgColor, textColor) {
				var bgLuminance = this.getRelativeLuminance(this.parseColor(bgColor));
				var textLuminance = this.getRelativeLuminance(this.parseColor(textColor));
				var lighter = Math.max(bgLuminance, textLuminance);
				var darker = Math.min(bgLuminance, textLuminance);
				return (lighter + 0.05) / (darker + 0.05);
			},
		},
		{
			key: "parseColor",
			value: function parseColor(color) {
				var rgbaRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;
				var match = color.match(rgbaRegex);
				if (match) {
					return {
						r: parseInt(match[1], 10),
						g: parseInt(match[2], 10),
						b: parseInt(match[3], 10),
						a: match[4] ? parseFloat(match[4]) : 1,
					};
				}
				throw new Error("Invalid color format: ".concat(color));
			},
		},
		{
			key: "getRelativeLuminance",
			value: function getRelativeLuminance(_ref) {
				var r = _ref.r,
					g = _ref.g,
					b = _ref.b;
				var _map = [r, g, b].map(function (c) {
						c /= 255;
						return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
					}),
					_map2 = _slicedToArray(_map, 3),
					rSRGB = _map2[0],
					gSRGB = _map2[1],
					bSRGB = _map2[2];
				return 0.2126 * rSRGB + 0.7152 * gSRGB + 0.0722 * bSRGB;
			},
		},
	]);
})(); // Usage
try {
	var contrastChecker = new ColorContrastChecker($0, {
		fontSize: "23.994px",
		fontWeight: 700,
		contrastThreshold: 4.5,
	});
	contrastChecker.init();
} catch (error) {
	console.error("Error initializing ColorContrastChecker:", error.message);
}

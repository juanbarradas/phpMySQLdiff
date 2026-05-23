import {
  FilterMatchMode
} from "./chunk-6DNCP5JY.js";
import {
  O,
  R,
  Y,
  a,
  c,
  f,
  g,
  h,
  m,
  s,
  s2,
  te,
  w
} from "./chunk-6IO2XYWG.js";
import {
  isPlatformServer
} from "./chunk-2XXATW7O.js";
import {
  ChangeDetectorRef,
  DOCUMENT,
  Directive,
  ElementRef,
  Injectable,
  InjectionToken,
  Injector,
  Input,
  PLATFORM_ID,
  Renderer2,
  Subject,
  computed,
  effect,
  inject,
  input,
  setClassMetadata,
  signal,
  untracked,
  ɵɵNgOnChangesFeature,
  ɵɵProvidersFeature,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵgetInheritedFactory
} from "./chunk-35OFGI4Z.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-46DXP6YY.js";

// node_modules/@primeuix/styled/node_modules/@primeuix/utils/dist/object/index.mjs
function l(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function c2(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function s3(e) {
  return !l(e);
}
function i(e, t = true) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function m2(e, ...t) {
  return c2(e) ? e(...t) : e;
}
function a2(e, t = true) {
  return typeof e == "string" && (t || e !== "");
}
function z(e) {
  return s3(e) && !isNaN(e);
}
function G(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return false;
}
function Y2(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function re(e) {
  return a2(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}

// node_modules/@primeuix/styled/node_modules/@primeuix/utils/dist/eventbus/index.mjs
function s4() {
  let r = /* @__PURE__ */ new Map();
  return { on(e, t) {
    let n = r.get(e);
    return n ? n.push(t) : n = [t], r.set(e, n), this;
  }, off(e, t) {
    let n = r.get(e);
    return n && n.splice(n.indexOf(t) >>> 0, 1), this;
  }, emit(e, t) {
    let n = r.get(e);
    n && n.forEach((i2) => {
      i2(t);
    });
  }, clear() {
    r.clear();
  } };
}

// node_modules/@primeuix/styled/node_modules/@primeuix/utils/dist/zindex/index.mjs
function g2() {
  let r = [], i2 = (e, n, t = 999) => {
    let s5 = u(e, n, t), o = s5.value + (s5.key === e ? 0 : t) + 1;
    return r.push({ key: e, value: o }), o;
  }, d = (e) => {
    r = r.filter((n) => n.value !== e);
  }, a3 = (e, n) => u(e, n).value, u = (e, n, t = 0) => [...r].reverse().find((s5) => n ? true : s5.key === e) || { key: e, value: t }, l2 = (e) => e && parseInt(e.style.zIndex, 10) || 0;
  return { get: l2, set: (e, n, t) => {
    n && (n.style.zIndex = String(i2(e, true, t)));
  }, clear: (e) => {
    e && (d(l2(e)), e.style.zIndex = "");
  }, getCurrent: (e) => a3(e, true) };
}
var x = g2();

// node_modules/@primeuix/styled/dist/index.mjs
var rt = Object.defineProperty;
var st = Object.defineProperties;
var nt = Object.getOwnPropertyDescriptors;
var F2 = Object.getOwnPropertySymbols;
var xe = Object.prototype.hasOwnProperty;
var be = Object.prototype.propertyIsEnumerable;
var _e = (e, t, r) => t in e ? rt(e, t, { enumerable: true, configurable: true, writable: true, value: r }) : e[t] = r;
var h2 = (e, t) => {
  for (var r in t || (t = {})) xe.call(t, r) && _e(e, r, t[r]);
  if (F2) for (var r of F2(t)) be.call(t, r) && _e(e, r, t[r]);
  return e;
};
var $ = (e, t) => st(e, nt(t));
var v = (e, t) => {
  var r = {};
  for (var s5 in e) xe.call(e, s5) && t.indexOf(s5) < 0 && (r[s5] = e[s5]);
  if (e != null && F2) for (var s5 of F2(e)) t.indexOf(s5) < 0 && be.call(e, s5) && (r[s5] = e[s5]);
  return r;
};
var at = s4();
var N = at;
var k = /{([^}]*)}/g;
var ne = /(\d+\s+[\+\-\*\/]\s+\d+)/g;
var ie = /var\([^)]+\)/g;
function oe(e) {
  return a2(e) ? e.replace(/[A-Z]/g, (t, r) => r === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function ve(e) {
  return i(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function dt(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Q(e = "", t = "") {
  return dt(`${a2(e, false) && a2(t, false) ? `${e}-` : e}${t}`);
}
function ae(e = "", t = "") {
  return `--${Q(e, t)}`;
}
function ht(e = "") {
  let t = (e.match(/{/g) || []).length, r = (e.match(/}/g) || []).length;
  return (t + r) % 2 !== 0;
}
function Y3(e, t = "", r = "", s5 = [], i2) {
  if (a2(e)) {
    let a3 = e.trim();
    if (ht(a3)) return;
    if (G(a3, k)) {
      let n = a3.replaceAll(k, (l2) => {
        let c3 = l2.replace(/{|}/g, "").split(".").filter((m3) => !s5.some((d) => G(m3, d)));
        return `var(${ae(r, re(c3.join("-")))}${s3(i2) ? `, ${i2}` : ""})`;
      });
      return G(n.replace(ie, "0"), ne) ? `calc(${n})` : n;
    }
    return a3;
  } else if (z(e)) return e;
}
function Re(e, t, r) {
  a2(t, false) && e.push(`${t}:${r};`);
}
function C2(e, t) {
  return e ? `${e}{${t}}` : "";
}
function le(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function r(n, l2) {
    let o = [], c3 = 0, m3 = "", d = null, u = 0;
    for (; c3 <= n.length; ) {
      let g3 = n[c3];
      if ((g3 === '"' || g3 === "'" || g3 === "`") && n[c3 - 1] !== "\\" && (d = d === g3 ? null : g3), !d && (g3 === "(" && u++, g3 === ")" && u--, (g3 === "," || c3 === n.length) && u === 0)) {
        let f2 = m3.trim();
        f2.startsWith("dt(") ? o.push(le(f2, l2)) : o.push(s5(f2)), m3 = "", c3++;
        continue;
      }
      g3 !== void 0 && (m3 += g3), c3++;
    }
    return o;
  }
  function s5(n) {
    let l2 = n[0];
    if ((l2 === '"' || l2 === "'" || l2 === "`") && n[n.length - 1] === l2) return n.slice(1, -1);
    let o = Number(n);
    return isNaN(o) ? n : o;
  }
  let i2 = [], a3 = [];
  for (let n = 0; n < e.length; n++) if (e[n] === "d" && e.slice(n, n + 3) === "dt(") a3.push(n), n += 2;
  else if (e[n] === ")" && a3.length > 0) {
    let l2 = a3.pop();
    a3.length === 0 && i2.push([l2, n]);
  }
  if (!i2.length) return e;
  for (let n = i2.length - 1; n >= 0; n--) {
    let [l2, o] = i2[n], c3 = e.slice(l2 + 3, o), m3 = r(c3, t), d = t(...m3);
    e = e.slice(0, l2) + d + e.slice(o + 1);
  }
  return e;
}
var rr = (e) => {
  var a3;
  let t = S.getTheme(), r = ue(t, e, void 0, "variable"), s5 = (a3 = r == null ? void 0 : r.match(/--[\w-]+/g)) == null ? void 0 : a3[0], i2 = ue(t, e, void 0, "value");
  return { name: s5, variable: r, value: i2 };
};
var E = (...e) => ue(S.getTheme(), ...e);
var ue = (e = {}, t, r, s5) => {
  if (t) {
    let { variable: i2, options: a3 } = S.defaults || {}, { prefix: n, transform: l2 } = (e == null ? void 0 : e.options) || a3 || {}, o = G(t, k) ? t : `{${t}}`;
    return s5 === "value" || l(s5) && l2 === "strict" ? S.getTokenValue(t) : Y3(o, void 0, n, [i2.excludedKeyRegex], r);
  }
  return "";
};
function ar(e, ...t) {
  if (e instanceof Array) {
    let r = e.reduce((s5, i2, a3) => {
      var n;
      return s5 + i2 + ((n = m2(t[a3], { dt: E })) != null ? n : "");
    }, "");
    return le(r, E);
  }
  return m2(e, { dt: E });
}
function de(e, t = {}) {
  let r = S.defaults.variable, { prefix: s5 = r.prefix, selector: i2 = r.selector, excludedKeyRegex: a3 = r.excludedKeyRegex } = t, n = [], l2 = [], o = [{ node: e, path: s5 }];
  for (; o.length; ) {
    let { node: m3, path: d } = o.pop();
    for (let u in m3) {
      let g3 = m3[u], f2 = ve(g3), p = G(u, a3) ? Q(d) : Q(d, re(u));
      if (i(f2)) o.push({ node: f2, path: p });
      else {
        let y = ae(p), R2 = Y3(f2, p, s5, [a3]);
        Re(l2, y, R2);
        let T = p;
        s5 && T.startsWith(s5 + "-") && (T = T.slice(s5.length + 1)), n.push(T.replace(/-/g, "."));
      }
    }
  }
  let c3 = l2.join("");
  return { value: l2, tokens: n, declarations: c3, css: C2(i2, c3) };
}
var b = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
  return { type: "class", selector: e, matched: this.pattern.test(e.trim()) };
} }, attr: { pattern: /^\[(.*)\]$/, resolve(e) {
  return { type: "attr", selector: `:root${e},:host${e}`, matched: this.pattern.test(e.trim()) };
} }, media: { pattern: /^@media (.*)$/, resolve(e) {
  return { type: "media", selector: e, matched: this.pattern.test(e.trim()) };
} }, system: { pattern: /^system$/, resolve(e) {
  return { type: "system", selector: "@media (prefers-color-scheme: dark)", matched: this.pattern.test(e.trim()) };
} }, custom: { resolve(e) {
  return { type: "custom", selector: e, matched: true };
} } }, resolve(e) {
  let t = Object.keys(this.rules).filter((r) => r !== "custom").map((r) => this.rules[r]);
  return [e].flat().map((r) => {
    var s5;
    return (s5 = t.map((i2) => i2.resolve(r)).find((i2) => i2.matched)) != null ? s5 : this.rules.custom.resolve(r);
  });
} }, _toVariables(e, t) {
  return de(e, { prefix: t == null ? void 0 : t.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: r, set: s5, defaults: i2 }) {
  var R2, T, j, O2, M, z2, V;
  let { preset: a3, options: n } = t, l2, o, c3, m3, d, u, g3;
  if (s3(a3) && n.transform !== "strict") {
    let { primitive: L, semantic: te2, extend: re2 } = a3, f2 = te2 || {}, { colorScheme: K } = f2, A = v(f2, ["colorScheme"]), x2 = re2 || {}, { colorScheme: X } = x2, G2 = v(x2, ["colorScheme"]), p = K || {}, { dark: U } = p, B = v(p, ["dark"]), y = X || {}, { dark: I } = y, H2 = v(y, ["dark"]), W = s3(L) ? this._toVariables({ primitive: L }, n) : {}, q2 = s3(A) ? this._toVariables({ semantic: A }, n) : {}, Z = s3(B) ? this._toVariables({ light: B }, n) : {}, pe = s3(U) ? this._toVariables({ dark: U }, n) : {}, fe = s3(G2) ? this._toVariables({ semantic: G2 }, n) : {}, ye = s3(H2) ? this._toVariables({ light: H2 }, n) : {}, Se = s3(I) ? this._toVariables({ dark: I }, n) : {}, [Me, ze] = [(R2 = W.declarations) != null ? R2 : "", W.tokens], [Ke, Xe] = [(T = q2.declarations) != null ? T : "", q2.tokens || []], [Ge, Ue] = [(j = Z.declarations) != null ? j : "", Z.tokens || []], [Be, Ie] = [(O2 = pe.declarations) != null ? O2 : "", pe.tokens || []], [He, We] = [(M = fe.declarations) != null ? M : "", fe.tokens || []], [qe, Ze] = [(z2 = ye.declarations) != null ? z2 : "", ye.tokens || []], [Fe, Je] = [(V = Se.declarations) != null ? V : "", Se.tokens || []];
    l2 = this.transformCSS(e, Me, "light", "variable", n, s5, i2), o = ze;
    let Qe = this.transformCSS(e, `${Ke}${Ge}`, "light", "variable", n, s5, i2), Ye = this.transformCSS(e, `${Be}`, "dark", "variable", n, s5, i2);
    c3 = `${Qe}${Ye}`, m3 = [.../* @__PURE__ */ new Set([...Xe, ...Ue, ...Ie])];
    let et = this.transformCSS(e, `${He}${qe}color-scheme:light`, "light", "variable", n, s5, i2), tt = this.transformCSS(e, `${Fe}color-scheme:dark`, "dark", "variable", n, s5, i2);
    d = `${et}${tt}`, u = [.../* @__PURE__ */ new Set([...We, ...Ze, ...Je])], g3 = m2(a3.css, { dt: E });
  }
  return { primitive: { css: l2, tokens: o }, semantic: { css: c3, tokens: m3 }, global: { css: d, tokens: u }, style: g3 };
}, getPreset({ name: e = "", preset: t = {}, options: r, params: s5, set: i2, defaults: a3, selector: n }) {
  var f2, x2, p;
  let l2, o, c3;
  if (s3(t) && r.transform !== "strict") {
    let y = e.replace("-directive", ""), m3 = t, { colorScheme: R2, extend: T, css: j } = m3, O2 = v(m3, ["colorScheme", "extend", "css"]), d = T || {}, { colorScheme: M } = d, z2 = v(d, ["colorScheme"]), u = R2 || {}, { dark: V } = u, L = v(u, ["dark"]), g3 = M || {}, { dark: te2 } = g3, re2 = v(g3, ["dark"]), K = s3(O2) ? this._toVariables({ [y]: h2(h2({}, O2), z2) }, r) : {}, A = s3(L) ? this._toVariables({ [y]: h2(h2({}, L), re2) }, r) : {}, X = s3(V) ? this._toVariables({ [y]: h2(h2({}, V), te2) }, r) : {}, [G2, U] = [(f2 = K.declarations) != null ? f2 : "", K.tokens || []], [B, I] = [(x2 = A.declarations) != null ? x2 : "", A.tokens || []], [H2, W] = [(p = X.declarations) != null ? p : "", X.tokens || []], q2 = this.transformCSS(y, `${G2}${B}`, "light", "variable", r, i2, a3, n), Z = this.transformCSS(y, H2, "dark", "variable", r, i2, a3, n);
    l2 = `${q2}${Z}`, o = [.../* @__PURE__ */ new Set([...U, ...I, ...W])], c3 = m2(j, { dt: E });
  }
  return { css: l2, tokens: o, style: c3 };
}, getPresetC({ name: e = "", theme: t = {}, params: r, set: s5, defaults: i2 }) {
  var o;
  let { preset: a3, options: n } = t, l2 = (o = a3 == null ? void 0 : a3.components) == null ? void 0 : o[e];
  return this.getPreset({ name: e, preset: l2, options: n, params: r, set: s5, defaults: i2 });
}, getPresetD({ name: e = "", theme: t = {}, params: r, set: s5, defaults: i2 }) {
  var c3, m3;
  let a3 = e.replace("-directive", ""), { preset: n, options: l2 } = t, o = ((c3 = n == null ? void 0 : n.components) == null ? void 0 : c3[a3]) || ((m3 = n == null ? void 0 : n.directives) == null ? void 0 : m3[a3]);
  return this.getPreset({ name: a3, preset: o, options: l2, params: r, set: s5, defaults: i2 });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === false);
}, getColorSchemeOption(e, t) {
  var r;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === true ? t.options.darkModeSelector : (r = e.darkModeSelector) != null ? r : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, r, s5) {
  let { cssLayer: i2 } = t;
  return i2 ? `@layer ${m2(i2.order || i2.name || "primeui", r)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: r, props: s5 = {}, set: i2, defaults: a3 }) {
  let n = this.getCommon({ name: e, theme: t, params: r, set: i2, defaults: a3 }), l2 = Object.entries(s5).reduce((o, [c3, m3]) => o.push(`${c3}="${m3}"`) && o, []).join(" ");
  return Object.entries(n || {}).reduce((o, [c3, m3]) => {
    if (i(m3) && Object.hasOwn(m3, "css")) {
      let d = Y2(m3.css), u = `${c3}-variables`;
      o.push(`<style type="text/css" data-primevue-style-id="${u}" ${l2}>${d}</style>`);
    }
    return o;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: r, props: s5 = {}, set: i2, defaults: a3 }) {
  var c3;
  let n = { name: e, theme: t, params: r, set: i2, defaults: a3 }, l2 = (c3 = e.includes("-directive") ? this.getPresetD(n) : this.getPresetC(n)) == null ? void 0 : c3.css, o = Object.entries(s5).reduce((m3, [d, u]) => m3.push(`${d}="${u}"`) && m3, []).join(" ");
  return l2 ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${o}>${Y2(l2)}</style>` : "";
}, createTokens(e = {}, t, r = "", s5 = "", i2 = {}) {
  let a3 = function(l2, o = {}, c3 = []) {
    if (c3.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l2, path: this.path, paths: o, value: void 0 };
    c3.push(this.path), o.name = this.path, o.binding || (o.binding = {});
    let m3 = this.value;
    if (typeof this.value == "string" && k.test(this.value)) {
      let u = this.value.trim().replace(k, (g3) => {
        var y;
        let f2 = g3.slice(1, -1), x2 = this.tokens[f2];
        if (!x2) return console.warn(`Token not found for path: ${f2}`), "__UNRESOLVED__";
        let p = x2.computed(l2, o, c3);
        return Array.isArray(p) && p.length === 2 ? `light-dark(${p[0].value},${p[1].value})` : (y = p == null ? void 0 : p.value) != null ? y : "__UNRESOLVED__";
      });
      m3 = ne.test(u.replace(ie, "0")) ? `calc(${u})` : u;
    }
    return l(o.binding) && delete o.binding, c3.pop(), { colorScheme: l2, path: this.path, paths: o, value: m3.includes("__UNRESOLVED__") ? void 0 : m3 };
  }, n = (l2, o, c3) => {
    Object.entries(l2).forEach(([m3, d]) => {
      let u = G(m3, t.variable.excludedKeyRegex) ? o : o ? `${o}.${oe(m3)}` : oe(m3), g3 = c3 ? `${c3}.${m3}` : m3;
      i(d) ? n(d, u, g3) : (i2[u] || (i2[u] = { paths: [], computed: (f2, x2 = {}, p = []) => {
        if (i2[u].paths.length === 1) return i2[u].paths[0].computed(i2[u].paths[0].scheme, x2.binding, p);
        if (f2 && f2 !== "none") for (let y = 0; y < i2[u].paths.length; y++) {
          let R2 = i2[u].paths[y];
          if (R2.scheme === f2) return R2.computed(f2, x2.binding, p);
        }
        return i2[u].paths.map((y) => y.computed(y.scheme, x2[y.scheme], p));
      } }), i2[u].paths.push({ path: g3, value: d, scheme: g3.includes("colorScheme.light") ? "light" : g3.includes("colorScheme.dark") ? "dark" : "none", computed: a3, tokens: i2 }));
    });
  };
  return n(e, r, s5), i2;
}, getTokenValue(e, t, r) {
  var l2;
  let i2 = ((o) => o.split(".").filter((m3) => !G(m3.toLowerCase(), r.variable.excludedKeyRegex)).join("."))(t), a3 = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, n = [(l2 = e[i2]) == null ? void 0 : l2.computed(a3)].flat().filter((o) => o);
  return n.length === 1 ? n[0].value : n.reduce((o = {}, c3) => {
    let u = c3, { colorScheme: m3 } = u, d = v(u, ["colorScheme"]);
    return o[m3] = d, o;
  }, void 0);
}, getSelectorRule(e, t, r, s5) {
  return r === "class" || r === "attr" ? C2(s3(t) ? `${e}${t},${e} ${t}` : e, s5) : C2(e, C2(t != null ? t : ":root,:host", s5));
}, transformCSS(e, t, r, s5, i2 = {}, a3, n, l2) {
  if (s3(t)) {
    let { cssLayer: o } = i2;
    if (s5 !== "style") {
      let c3 = this.getColorSchemeOption(i2, n);
      t = r === "dark" ? c3.reduce((m3, { type: d, selector: u }) => (s3(u) && (m3 += u.includes("[CSS]") ? u.replace("[CSS]", t) : this.getSelectorRule(u, l2, d, t)), m3), "") : C2(l2 != null ? l2 : ":root,:host", t);
    }
    if (o) {
      let c3 = { name: "primeui", order: "primeui" };
      i(o) && (c3.name = m2(o.name, { name: e, type: s5 })), s3(c3.name) && (t = C2(`@layer ${c3.name}`, t), a3 == null || a3.layerNames(c3.name));
    }
    return t;
  }
  return "";
} };
var S = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: false } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = $(h2({}, t), { options: h2(h2({}, this.defaults.options), t.options) }), this._tokens = b.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
}, get theme() {
  return this._theme;
}, get preset() {
  var e;
  return ((e = this.theme) == null ? void 0 : e.preset) || {};
}, get options() {
  var e;
  return ((e = this.theme) == null ? void 0 : e.options) || {};
}, get tokens() {
  return this._tokens;
}, getTheme() {
  return this.theme;
}, setTheme(e) {
  this.update({ theme: e }), N.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = $(h2({}, this.theme), { preset: e }), this._tokens = b.createTokens(e, this.defaults), this.clearLoadedStyleNames(), N.emit("preset:change", e), N.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = $(h2({}, this.theme), { options: e }), this.clearLoadedStyleNames(), N.emit("options:change", e), N.emit("theme:change", this.theme);
}, getLayerNames() {
  return [...this._layerNames];
}, setLayerNames(e) {
  this._layerNames.add(e);
}, getLoadedStyleNames() {
  return this._loadedStyleNames;
}, isStyleNameLoaded(e) {
  return this._loadedStyleNames.has(e);
}, setLoadedStyleName(e) {
  this._loadedStyleNames.add(e);
}, deleteLoadedStyleName(e) {
  this._loadedStyleNames.delete(e);
}, clearLoadedStyleNames() {
  this._loadedStyleNames.clear();
}, getTokenValue(e) {
  return b.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return b.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return b.getPresetC(r);
}, getDirective(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return b.getPresetD(r);
}, getCustomPreset(e = "", t, r, s5) {
  let i2 = { name: e, preset: t, options: this.options, selector: r, params: s5, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return b.getPreset(i2);
}, getLayerOrderCSS(e = "") {
  return b.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, r = "style", s5) {
  return b.transformCSS(e, t, s5, r, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, r = {}) {
  return b.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, r = {}) {
  return b.getStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), N.emit(`theme:${t}:load`, e), !this._loadingStyles.size && N.emit("theme:load"));
} };

// node_modules/@primeuix/styles/dist/base/index.mjs
var style = "\n    *,\n    ::before,\n    ::after {\n        box-sizing: border-box;\n    }\n\n    .p-collapsible-enter-active {\n        animation: p-animate-collapsible-expand 0.2s ease-out;\n        overflow: hidden;\n    }\n\n    .p-collapsible-leave-active {\n        animation: p-animate-collapsible-collapse 0.2s ease-out;\n        overflow: hidden;\n    }\n\n    @keyframes p-animate-collapsible-expand {\n        from {\n            grid-template-rows: 0fr;\n        }\n        to {\n            grid-template-rows: 1fr;\n        }\n    }\n\n    @keyframes p-animate-collapsible-collapse {\n        from {\n            grid-template-rows: 1fr;\n        }\n        to {\n            grid-template-rows: 0fr;\n        }\n    }\n\n    .p-disabled,\n    .p-disabled * {\n        cursor: default;\n        pointer-events: none;\n        user-select: none;\n    }\n\n    .p-disabled,\n    .p-component:disabled {\n        opacity: dt('disabled.opacity');\n    }\n\n    .pi {\n        font-size: dt('icon.size');\n    }\n\n    .p-icon {\n        width: dt('icon.size');\n        height: dt('icon.size');\n    }\n\n    .p-overlay-mask {\n        background: var(--px-mask-background, dt('mask.background'));\n        color: dt('mask.color');\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n    }\n\n    .p-overlay-mask-enter-active {\n        animation: p-animate-overlay-mask-enter dt('mask.transition.duration') forwards;\n    }\n\n    .p-overlay-mask-leave-active {\n        animation: p-animate-overlay-mask-leave dt('mask.transition.duration') forwards;\n    }\n\n    @keyframes p-animate-overlay-mask-enter {\n        from {\n            background: transparent;\n        }\n        to {\n            background: var(--px-mask-background, dt('mask.background'));\n        }\n    }\n    @keyframes p-animate-overlay-mask-leave {\n        from {\n            background: var(--px-mask-background, dt('mask.background'));\n        }\n        to {\n            background: transparent;\n        }\n    }\n\n    .p-anchored-overlay-enter-active {\n        animation: p-animate-anchored-overlay-enter 300ms cubic-bezier(.19,1,.22,1);\n    }\n\n    .p-anchored-overlay-leave-active {\n        animation: p-animate-anchored-overlay-leave 300ms cubic-bezier(.19,1,.22,1);\n    }\n\n    @keyframes p-animate-anchored-overlay-enter {\n        from {\n            opacity: 0;\n            transform: scale(0.93);\n        }\n    }\n\n    @keyframes p-animate-anchored-overlay-leave {\n        to {\n            opacity: 0;\n            transform: scale(0.93);\n        }\n    }\n";

// node_modules/primeng/fesm2022/primeng-usestyle.mjs
var _id = 0;
var UseStyle = class _UseStyle {
  document = inject(DOCUMENT);
  use(css2, options = {}) {
    let isLoaded = false;
    let cssRef = css2;
    let styleRef = null;
    const {
      immediate = true,
      manual = false,
      name = `style_${++_id}`,
      id = void 0,
      media = void 0,
      nonce = void 0,
      first = false,
      props = {}
    } = options;
    if (!this.document) return;
    styleRef = this.document.querySelector(`style[data-primeng-style-id="${name}"]`) || id && this.document.getElementById(id) || this.document.createElement("style");
    if (styleRef) {
      if (!styleRef.isConnected) {
        cssRef = css2;
        const HEAD = this.document.head;
        te(styleRef, "nonce", nonce);
        first && HEAD.firstChild ? HEAD.insertBefore(styleRef, HEAD.firstChild) : HEAD.appendChild(styleRef);
        O(styleRef, {
          type: "text/css",
          media,
          nonce,
          "data-primeng-style-id": name
        });
      }
      if (styleRef.textContent !== cssRef) {
        styleRef.textContent = cssRef;
      }
    }
    return {
      id,
      name,
      el: styleRef,
      css: cssRef
    };
  }
  static ɵfac = function UseStyle_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _UseStyle)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _UseStyle,
    factory: _UseStyle.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(UseStyle, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// node_modules/primeng/fesm2022/primeng-base.mjs
var base = {
  _loadedStyleNames: /* @__PURE__ */ new Set(),
  getLoadedStyleNames() {
    return this._loadedStyleNames;
  },
  isStyleNameLoaded(name) {
    return this._loadedStyleNames.has(name);
  },
  setLoadedStyleName(name) {
    this._loadedStyleNames.add(name);
  },
  deleteLoadedStyleName(name) {
    this._loadedStyleNames.delete(name);
  },
  clearLoadedStyleNames() {
    this._loadedStyleNames.clear();
  }
};
var css = (
  /*css*/
  `
.p-hidden-accessible {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
}

.p-hidden-accessible input,
.p-hidden-accessible select {
    transform: scale(0);
}

.p-overflow-hidden {
    overflow: hidden;
    padding-right: dt('scrollbar.width');
}
`
);
var BaseStyle = class _BaseStyle {
  name = "base";
  useStyle = inject(UseStyle);
  css = void 0;
  style = void 0;
  classes = {};
  inlineStyles = {};
  load = (style2, options = {}, transform = (cs) => cs) => {
    const computedStyle = transform(ar`${m(style2, {
      dt: E
    })}`);
    return computedStyle ? this.useStyle.use(Y(computedStyle), __spreadValues({
      name: this.name
    }, options)) : {};
  };
  loadCSS = (options = {}) => {
    return this.load(this.css, options);
  };
  loadStyle = (options = {}, style2 = "") => {
    return this.load(this.style, options, (computedStyle = "") => S.transformCSS(options.name || this.name, `${computedStyle}${ar`${style2}`}`));
  };
  loadBaseCSS = (options = {}) => {
    return this.load(css, options);
  };
  loadBaseStyle = (options = {}, style$1 = "") => {
    return this.load(style, options, (computedStyle = "") => S.transformCSS(options.name || this.name, `${computedStyle}${ar`${style$1}`}`));
  };
  getCommonTheme = (params) => {
    return S.getCommon(this.name, params);
  };
  getComponentTheme = (params) => {
    return S.getComponent(this.name, params);
  };
  getPresetTheme = (preset, selector, params) => {
    return S.getCustomPreset(this.name, preset, selector, params);
  };
  getLayerOrderThemeCSS = () => {
    return S.getLayerOrderCSS(this.name);
  };
  getStyleSheet = (extendedCSS = "", props = {}) => {
    if (this.css) {
      const _css = m(this.css, {
        dt: E
      });
      const _style = Y(ar`${_css}${extendedCSS}`);
      const _props = Object.entries(props).reduce((acc, [k2, v2]) => acc.push(`${k2}="${v2}"`) && acc, []).join(" ");
      return `<style type="text/css" data-primeng-style-id="${this.name}" ${_props}>${_style}</style>`;
    }
    return "";
  };
  getCommonThemeStyleSheet = (params, props = {}) => {
    return S.getCommonStyleSheet(this.name, params, props);
  };
  getThemeStyleSheet = (params, props = {}) => {
    let css2 = [S.getStyleSheet(this.name, params, props)];
    if (this.style) {
      const name = this.name === "base" ? "global-style" : `${this.name}-style`;
      const _css = ar`${m(this.style, {
        dt: E
      })}`;
      const _style = Y(S.transformCSS(name, _css));
      const _props = Object.entries(props).reduce((acc, [k2, v2]) => acc.push(`${k2}="${v2}"`) && acc, []).join(" ");
      css2.push(`<style type="text/css" data-primeng-style-id="${name}" ${_props}>${_style}</style>`);
    }
    return css2.join("");
  };
  static ɵfac = function BaseStyle_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BaseStyle)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _BaseStyle,
    factory: _BaseStyle.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BaseStyle, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// node_modules/primeng/fesm2022/primeng-config.mjs
var ThemeProvider = class _ThemeProvider {
  // @todo define type for theme
  theme = signal(void 0, ...ngDevMode ? [{
    debugName: "theme"
  }] : (
    /* istanbul ignore next */
    []
  ));
  csp = signal({
    nonce: void 0
  }, ...ngDevMode ? [{
    debugName: "csp"
  }] : (
    /* istanbul ignore next */
    []
  ));
  isThemeChanged = false;
  document = inject(DOCUMENT);
  baseStyle = inject(BaseStyle);
  constructor() {
    effect(() => {
      N.on("theme:change", (newTheme) => {
        untracked(() => {
          this.isThemeChanged = true;
          this.theme.set(newTheme);
        });
      });
    });
    effect(() => {
      const themeValue = this.theme();
      if (this.document && themeValue) {
        if (!this.isThemeChanged) {
          this.onThemeChange(themeValue);
        }
        this.isThemeChanged = false;
      }
    });
  }
  ngOnDestroy() {
    S.clearLoadedStyleNames();
    N.clear();
  }
  onThemeChange(value) {
    S.setTheme(value);
    if (this.document) {
      this.loadCommonTheme();
    }
  }
  loadCommonTheme() {
    if (this.theme() === "none") return;
    if (!S.isStyleNameLoaded("common")) {
      const {
        primitive,
        semantic,
        global,
        style: style2
      } = this.baseStyle.getCommonTheme?.() || {};
      const styleOptions = {
        nonce: this.csp?.()?.nonce
      };
      this.baseStyle.load(primitive?.css, __spreadValues({
        name: "primitive-variables"
      }, styleOptions));
      this.baseStyle.load(semantic?.css, __spreadValues({
        name: "semantic-variables"
      }, styleOptions));
      this.baseStyle.load(global?.css, __spreadValues({
        name: "global-variables"
      }, styleOptions));
      this.baseStyle.loadBaseStyle(__spreadValues({
        name: "global-style"
      }, styleOptions), style2);
      S.setLoadedStyleName("common");
    }
  }
  setThemeConfig(config) {
    const {
      theme,
      csp
    } = config || {};
    if (theme) this.theme.set(theme);
    if (csp) this.csp.set(csp);
  }
  static ɵfac = function ThemeProvider_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ThemeProvider)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _ThemeProvider,
    factory: _ThemeProvider.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ThemeProvider, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();
var PrimeNG = class _PrimeNG extends ThemeProvider {
  ripple = signal(false, ...ngDevMode ? [{
    debugName: "ripple"
  }] : (
    /* istanbul ignore next */
    []
  ));
  platformId = inject(PLATFORM_ID);
  /**
   * @deprecated Since v20. Use `inputVariant` instead.
   */
  inputStyle = signal(null, ...ngDevMode ? [{
    debugName: "inputStyle"
  }] : (
    /* istanbul ignore next */
    []
  ));
  inputVariant = signal(null, ...ngDevMode ? [{
    debugName: "inputVariant"
  }] : (
    /* istanbul ignore next */
    []
  ));
  overlayAppendTo = signal("self", ...ngDevMode ? [{
    debugName: "overlayAppendTo"
  }] : (
    /* istanbul ignore next */
    []
  ));
  overlayOptions = {};
  csp = signal({
    nonce: void 0
  }, ...ngDevMode ? [{
    debugName: "csp"
  }] : (
    /* istanbul ignore next */
    []
  ));
  unstyled = signal(void 0, ...ngDevMode ? [{
    debugName: "unstyled"
  }] : (
    /* istanbul ignore next */
    []
  ));
  pt = signal(void 0, ...ngDevMode ? [{
    debugName: "pt"
  }] : (
    /* istanbul ignore next */
    []
  ));
  ptOptions = signal(void 0, ...ngDevMode ? [{
    debugName: "ptOptions"
  }] : (
    /* istanbul ignore next */
    []
  ));
  filterMatchModeOptions = {
    text: [FilterMatchMode.STARTS_WITH, FilterMatchMode.CONTAINS, FilterMatchMode.NOT_CONTAINS, FilterMatchMode.ENDS_WITH, FilterMatchMode.EQUALS, FilterMatchMode.NOT_EQUALS],
    numeric: [FilterMatchMode.EQUALS, FilterMatchMode.NOT_EQUALS, FilterMatchMode.LESS_THAN, FilterMatchMode.LESS_THAN_OR_EQUAL_TO, FilterMatchMode.GREATER_THAN, FilterMatchMode.GREATER_THAN_OR_EQUAL_TO],
    date: [FilterMatchMode.DATE_IS, FilterMatchMode.DATE_IS_NOT, FilterMatchMode.DATE_BEFORE, FilterMatchMode.DATE_AFTER]
  };
  translation = {
    startsWith: "Starts with",
    contains: "Contains",
    notContains: "Not contains",
    endsWith: "Ends with",
    equals: "Equals",
    notEquals: "Not equals",
    noFilter: "No Filter",
    lt: "Less than",
    lte: "Less than or equal to",
    gt: "Greater than",
    gte: "Greater than or equal to",
    is: "Is",
    isNot: "Is not",
    before: "Before",
    after: "After",
    dateIs: "Date is",
    dateIsNot: "Date is not",
    dateBefore: "Date is before",
    dateAfter: "Date is after",
    clear: "Clear",
    apply: "Apply",
    matchAll: "Match All",
    matchAny: "Match Any",
    addRule: "Add Rule",
    removeRule: "Remove Rule",
    accept: "Yes",
    reject: "No",
    choose: "Choose",
    completed: "Completed",
    upload: "Upload",
    cancel: "Cancel",
    pending: "Pending",
    fileSizeTypes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    chooseYear: "Choose Year",
    chooseMonth: "Choose Month",
    chooseDate: "Choose Date",
    prevDecade: "Previous Decade",
    nextDecade: "Next Decade",
    prevYear: "Previous Year",
    nextYear: "Next Year",
    prevMonth: "Previous Month",
    nextMonth: "Next Month",
    prevHour: "Previous Hour",
    nextHour: "Next Hour",
    prevMinute: "Previous Minute",
    nextMinute: "Next Minute",
    prevSecond: "Previous Second",
    nextSecond: "Next Second",
    am: "am",
    pm: "pm",
    dateFormat: "mm/dd/yy",
    firstDayOfWeek: 0,
    today: "Today",
    weekHeader: "Wk",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
    passwordPrompt: "Enter a password",
    emptyMessage: "No results found",
    searchMessage: "Search results are available",
    selectionMessage: "{0} items selected",
    emptySelectionMessage: "No selected item",
    emptySearchMessage: "No results found",
    emptyFilterMessage: "No results found",
    fileChosenMessage: "Files",
    noFileChosenMessage: "No file chosen",
    aria: {
      trueLabel: "True",
      falseLabel: "False",
      nullLabel: "Not Selected",
      star: "1 star",
      stars: "{star} stars",
      selectAll: "All items selected",
      unselectAll: "All items unselected",
      close: "Close",
      previous: "Previous",
      next: "Next",
      navigation: "Navigation",
      scrollTop: "Scroll Top",
      moveTop: "Move Top",
      moveUp: "Move Up",
      moveDown: "Move Down",
      moveBottom: "Move Bottom",
      moveToTarget: "Move to Target",
      moveToSource: "Move to Source",
      moveAllToTarget: "Move All to Target",
      moveAllToSource: "Move All to Source",
      pageLabel: "{page}",
      firstPageLabel: "First Page",
      lastPageLabel: "Last Page",
      nextPageLabel: "Next Page",
      prevPageLabel: "Previous Page",
      rowsPerPageLabel: "Rows per page",
      previousPageLabel: "Previous Page",
      jumpToPageDropdownLabel: "Jump to Page Dropdown",
      jumpToPageInputLabel: "Jump to Page Input",
      selectRow: "Row Selected",
      unselectRow: "Row Unselected",
      expandRow: "Row Expanded",
      collapseRow: "Row Collapsed",
      showFilterMenu: "Show Filter Menu",
      hideFilterMenu: "Hide Filter Menu",
      filterOperator: "Filter Operator",
      filterConstraint: "Filter Constraint",
      editRow: "Row Edit",
      saveEdit: "Save Edit",
      cancelEdit: "Cancel Edit",
      listView: "List View",
      gridView: "Grid View",
      slide: "Slide",
      slideNumber: "{slideNumber}",
      zoomImage: "Zoom Image",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      rotateRight: "Rotate Right",
      rotateLeft: "Rotate Left",
      listLabel: "Option List",
      selectColor: "Select a color",
      removeLabel: "Remove",
      browseFiles: "Browse Files",
      maximizeLabel: "Maximize",
      minimizeLabel: "Minimize"
    }
  };
  zIndex = {
    modal: 1100,
    overlay: 1e3,
    menu: 1e3,
    tooltip: 1100
  };
  translationSource = new Subject();
  translationObserver = this.translationSource.asObservable();
  getTranslation(key) {
    return this.translation[key];
  }
  setTranslation(value) {
    this.translation = __spreadValues(__spreadValues({}, this.translation), value);
    this.translationSource.next(this.translation);
  }
  setConfig(config) {
    const {
      csp,
      ripple,
      inputStyle,
      inputVariant,
      theme,
      overlayOptions,
      translation,
      filterMatchModeOptions,
      overlayAppendTo,
      zIndex,
      ptOptions,
      pt,
      unstyled
    } = config || {};
    if (csp) this.csp.set(csp);
    if (overlayAppendTo) this.overlayAppendTo.set(overlayAppendTo);
    if (ripple) this.ripple.set(ripple);
    if (inputStyle) this.inputStyle.set(inputStyle);
    if (inputVariant) this.inputVariant.set(inputVariant);
    if (overlayOptions) this.overlayOptions = overlayOptions;
    if (translation) this.setTranslation(translation);
    if (filterMatchModeOptions) this.filterMatchModeOptions = filterMatchModeOptions;
    if (zIndex) this.zIndex = zIndex;
    if (pt) this.pt.set(pt);
    if (ptOptions) this.ptOptions.set(ptOptions);
    if (unstyled) this.unstyled.set(unstyled);
    if (theme) this.setThemeConfig({
      theme,
      csp
    });
  }
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵPrimeNG_BaseFactory;
    return function PrimeNG_Factory(__ngFactoryType__) {
      return (ɵPrimeNG_BaseFactory || (ɵPrimeNG_BaseFactory = ɵɵgetInheritedFactory(_PrimeNG)))(__ngFactoryType__ || _PrimeNG);
    };
  })();
  static ɵprov = ɵɵdefineInjectable({
    token: _PrimeNG,
    factory: _PrimeNG.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PrimeNG, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
var PRIME_NG_CONFIG = new InjectionToken("PRIME_NG_CONFIG");

// node_modules/primeng/fesm2022/primeng-basecomponent.mjs
var BaseComponentStyle = class _BaseComponentStyle extends BaseStyle {
  name = "common";
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵBaseComponentStyle_BaseFactory;
    return function BaseComponentStyle_Factory(__ngFactoryType__) {
      return (ɵBaseComponentStyle_BaseFactory || (ɵBaseComponentStyle_BaseFactory = ɵɵgetInheritedFactory(_BaseComponentStyle)))(__ngFactoryType__ || _BaseComponentStyle);
    };
  })();
  static ɵprov = ɵɵdefineInjectable({
    token: _BaseComponentStyle,
    factory: _BaseComponentStyle.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BaseComponentStyle, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
var PARENT_INSTANCE = new InjectionToken("PARENT_INSTANCE");
var BaseComponent = class _BaseComponent {
  document = inject(DOCUMENT);
  platformId = inject(PLATFORM_ID);
  el = inject(ElementRef);
  injector = inject(Injector);
  cd = inject(ChangeDetectorRef);
  renderer = inject(Renderer2);
  config = inject(PrimeNG);
  $parentInstance = inject(PARENT_INSTANCE, {
    optional: true,
    skipSelf: true
  }) ?? void 0;
  baseComponentStyle = inject(BaseComponentStyle);
  baseStyle = inject(BaseStyle);
  scopedStyleEl;
  parent = this.$params.parent;
  cn = f;
  _themeScopedListener;
  themeChangeListenerMap = /* @__PURE__ */ new Map();
  /******************** Inputs ********************/
  /**
   * Defines scoped design tokens of the component.
   * @defaultValue undefined
   * @group Props
   */
  dt = input(...ngDevMode ? [void 0, {
    debugName: "dt"
  }] : (
    /* istanbul ignore next */
    []
  ));
  /**
   * Indicates whether the component should be rendered without styles.
   * @defaultValue undefined
   * @group Props
   */
  unstyled = input(...ngDevMode ? [void 0, {
    debugName: "unstyled"
  }] : (
    /* istanbul ignore next */
    []
  ));
  /**
   * Used to pass attributes to DOM elements inside the component.
   * @defaultValue undefined
   * @group Props
   */
  pt = input(...ngDevMode ? [void 0, {
    debugName: "pt"
  }] : (
    /* istanbul ignore next */
    []
  ));
  /**
   * Used to configure passthrough(pt) options of the component.
   * @group Props
   * @defaultValue undefined
   */
  ptOptions = input(...ngDevMode ? [void 0, {
    debugName: "ptOptions"
  }] : (
    /* istanbul ignore next */
    []
  ));
  /******************** Computed ********************/
  $attrSelector = s2("pc");
  get $name() {
    return this["componentName"] || "UnknownComponent";
  }
  get $hostName() {
    return this["hostName"];
  }
  get $el() {
    return this.el?.nativeElement;
  }
  directivePT = signal(void 0, ...ngDevMode ? [{
    debugName: "directivePT"
  }] : (
    /* istanbul ignore next */
    []
  ));
  directiveUnstyled = signal(void 0, ...ngDevMode ? [{
    debugName: "directiveUnstyled"
  }] : (
    /* istanbul ignore next */
    []
  ));
  $unstyled = computed(() => {
    return this.unstyled() ?? this.directiveUnstyled() ?? this.config?.unstyled() ?? false;
  }, ...ngDevMode ? [{
    debugName: "$unstyled"
  }] : (
    /* istanbul ignore next */
    []
  ));
  $pt = computed(() => {
    return m(this.pt() || this.directivePT(), this.$params);
  }, ...ngDevMode ? [{
    debugName: "$pt"
  }] : (
    /* istanbul ignore next */
    []
  ));
  get $globalPT() {
    return this._getPT(this.config?.pt(), void 0, (value) => m(value, this.$params));
  }
  get $defaultPT() {
    return this._getPT(this.config?.pt(), void 0, (value) => this._getOptionValue(value, this.$hostName || this.$name, this.$params) || m(value, this.$params));
  }
  get $style() {
    return __spreadValues(__spreadValues({
      theme: void 0,
      css: void 0,
      classes: void 0,
      inlineStyles: void 0
    }, (this._getHostInstance(this) || {}).$style), this["_componentStyle"]);
  }
  get $styleOptions() {
    return {
      nonce: this.config?.csp().nonce
    };
  }
  get $params() {
    const parentInstance = this._getHostInstance(this) || this.$parentInstance;
    return {
      instance: this,
      parent: {
        instance: parentInstance
      }
    };
  }
  /******************** Lifecycle Hooks ********************/
  onInit() {
  }
  onChanges(changes) {
  }
  onDoCheck() {
  }
  onAfterContentInit() {
  }
  onAfterContentChecked() {
  }
  onAfterViewInit() {
  }
  onAfterViewChecked() {
  }
  onDestroy() {
  }
  /******************** Angular Lifecycle Hooks ********************/
  constructor() {
    effect((onCleanup) => {
      if (this.document && !isPlatformServer(this.platformId)) {
        if (this.dt()) {
          this._loadScopedThemeStyles(this.dt());
          this._themeScopedListener = () => this._loadScopedThemeStyles(this.dt());
          this._themeChangeListener("_themeScopedListener", this._themeScopedListener);
        } else {
          this._unloadScopedThemeStyles();
        }
      }
      onCleanup(() => {
        this._offThemeChangeListener("_themeScopedListener");
      });
    });
    effect((onCleanup) => {
      if (this.document && !isPlatformServer(this.platformId)) {
        if (!this.$unstyled()) {
          this._loadCoreStyles();
          this._themeChangeListener("_loadCoreStyles", this._loadCoreStyles);
        }
      }
      onCleanup(() => {
        this._offThemeChangeListener("_loadCoreStyles");
      });
    });
    this._hook("onBeforeInit");
  }
  /**
   * ⚠ Do not override ngOnInit!
   *
   * Use 'onInit()' in subclasses instead.
   */
  ngOnInit() {
    this._loadCoreStyles();
    this._loadStyles();
    this.onInit();
    this._hook("onInit");
  }
  /**
   * ⚠ Do not override ngOnChanges!
   *
   * Use 'onChanges(changes: SimpleChanges)' in subclasses instead.
   */
  ngOnChanges(changes) {
    this.onChanges(changes);
    this._hook("onChanges", changes);
  }
  /**
   * ⚠ Do not override ngDoCheck!
   *
   * Use 'onDoCheck()' in subclasses instead.
   */
  ngDoCheck() {
    this.onDoCheck();
    this._hook("onDoCheck");
  }
  /**
   * ⚠ Do not override ngAfterContentInit!
   *
   * Use 'onAfterContentInit()' in subclasses instead.
   */
  ngAfterContentInit() {
    this.onAfterContentInit();
    this._hook("onAfterContentInit");
  }
  /**
   * ⚠ Do not override ngAfterContentChecked!
   *
   * Use 'onAfterContentChecked()' in subclasses instead.
   */
  ngAfterContentChecked() {
    this.onAfterContentChecked();
    this._hook("onAfterContentChecked");
  }
  /**
   * ⚠ Do not override ngAfterViewInit!
   *
   * Use 'onAfterViewInit()' in subclasses instead.
   */
  ngAfterViewInit() {
    this.$el?.setAttribute(this.$attrSelector, "");
    this.onAfterViewInit();
    this._hook("onAfterViewInit");
  }
  /**
   * ⚠ Do not override ngAfterViewChecked!
   *
   * Use 'onAfterViewChecked()' in subclasses instead.
   */
  ngAfterViewChecked() {
    this.onAfterViewChecked();
    this._hook("onAfterViewChecked");
  }
  /**
   * ⚠ Do not override ngOnDestroy!
   *
   * Use 'onDestroy()' in subclasses instead.
   */
  ngOnDestroy() {
    this._removeThemeListeners();
    this._unloadScopedThemeStyles();
    this.onDestroy();
    this._hook("onDestroy");
  }
  /******************** Methods ********************/
  _mergeProps(fn, ...args) {
    return c(fn) ? fn(...args) : w(...args);
  }
  _getHostInstance(instance) {
    return instance ? this.$hostName ? this.$name === this.$hostName ? instance : this._getHostInstance(instance.$parentInstance) : instance.$parentInstance : void 0;
  }
  _getPropValue(name) {
    return this[name] || this._getHostInstance(this)?.[name];
  }
  _getOptionValue(options, key = "", params = {}) {
    return R(options, key, params);
  }
  _hook(hookName, ...args) {
    if (!this.$hostName) {
      const selfHook = this._usePT(this._getPT(this.$pt(), this.$name), this._getOptionValue, `hooks.${hookName}`);
      const defaultHook = this._useDefaultPT(this._getOptionValue, `hooks.${hookName}`);
      selfHook?.(...args);
      defaultHook?.(...args);
    }
  }
  /********** Load Styles **********/
  _load() {
    if (!base.isStyleNameLoaded("base")) {
      this.baseStyle.loadBaseCSS(this.$styleOptions);
      this._loadGlobalStyles();
      base.setLoadedStyleName("base");
    }
    this._loadThemeStyles();
  }
  _loadStyles() {
    this._load();
    this._themeChangeListener("_load", () => this._load());
  }
  _loadGlobalStyles() {
    const globalCSS = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
    s(globalCSS) && this.baseStyle.load(globalCSS, __spreadValues({
      name: "global"
    }, this.$styleOptions));
  }
  _loadCoreStyles() {
    if (!base.isStyleNameLoaded(this.$style?.name) && this.$style?.name) {
      this.baseComponentStyle.loadCSS(this.$styleOptions);
      this.$style.loadCSS(this.$styleOptions);
      base.setLoadedStyleName(this.$style.name);
    }
  }
  _loadThemeStyles() {
    if (this.$unstyled() || this.config?.theme() === "none") return;
    if (!S.isStyleNameLoaded("common")) {
      const {
        primitive,
        semantic,
        global,
        style: style2
      } = this.$style?.getCommonTheme?.() || {};
      this.baseStyle.load(primitive?.css, __spreadValues({
        name: "primitive-variables"
      }, this.$styleOptions));
      this.baseStyle.load(semantic?.css, __spreadValues({
        name: "semantic-variables"
      }, this.$styleOptions));
      this.baseStyle.load(global?.css, __spreadValues({
        name: "global-variables"
      }, this.$styleOptions));
      this.baseStyle.loadBaseStyle(__spreadValues({
        name: "global-style"
      }, this.$styleOptions), style2);
      S.setLoadedStyleName("common");
    }
    if (!S.isStyleNameLoaded(this.$style?.name) && this.$style?.name) {
      const {
        css: css2,
        style: style2
      } = this.$style?.getComponentTheme?.() || {};
      this.$style?.load(css2, __spreadValues({
        name: `${this.$style?.name}-variables`
      }, this.$styleOptions));
      this.$style?.loadStyle(__spreadValues({
        name: `${this.$style?.name}-style`
      }, this.$styleOptions), style2);
      S.setLoadedStyleName(this.$style?.name);
    }
    if (!S.isStyleNameLoaded("layer-order")) {
      const layerOrder = this.$style?.getLayerOrderThemeCSS?.();
      this.baseStyle.load(layerOrder, __spreadValues({
        name: "layer-order",
        first: true
      }, this.$styleOptions));
      S.setLoadedStyleName("layer-order");
    }
  }
  _loadScopedThemeStyles(preset) {
    const {
      css: css2
    } = this.$style?.getPresetTheme?.(preset, `[${this.$attrSelector}]`) || {};
    const scopedStyle = this.$style?.load(css2, __spreadValues({
      name: `${this.$attrSelector}-${this.$style?.name}`
    }, this.$styleOptions));
    this.scopedStyleEl = scopedStyle?.el;
  }
  _unloadScopedThemeStyles() {
    this.scopedStyleEl?.remove();
  }
  _themeChangeListener(id, callback = () => {
  }) {
    this._offThemeChangeListener(id);
    base.clearLoadedStyleNames();
    const hold = callback.bind(this);
    this.themeChangeListenerMap.set(id, hold);
    N.on("theme:change", hold);
  }
  _removeThemeListeners() {
    this._offThemeChangeListener("_themeScopedListener");
    this._offThemeChangeListener("_loadCoreStyles");
    this._offThemeChangeListener("_load");
  }
  _offThemeChangeListener(id) {
    if (this.themeChangeListenerMap.has(id)) {
      N.off("theme:change", this.themeChangeListenerMap.get(id));
      this.themeChangeListenerMap.delete(id);
    }
  }
  /********** Passthrough **********/
  _getPTValue(obj = {}, key = "", params = {}, searchInDefaultPT = true) {
    const searchOut = /./g.test(key) && !!params[key.split(".")[0]];
    const {
      mergeSections = true,
      mergeProps: useMergeProps = false
    } = this._getPropValue("ptOptions")?.() || this.config?.["ptOptions"]?.() || {};
    const global = searchInDefaultPT ? searchOut ? this._useGlobalPT(this._getPTClassValue, key, params) : this._useDefaultPT(this._getPTClassValue, key, params) : void 0;
    const self = searchOut ? void 0 : this._usePT(this._getPT(obj, this.$hostName || this.$name), this._getPTClassValue, key, __spreadProps(__spreadValues({}, params), {
      global: global || {}
    }));
    const datasets = this._getPTDatasets(key);
    return mergeSections || !mergeSections && self ? useMergeProps ? this._mergeProps(useMergeProps, global, self, datasets) : __spreadValues(__spreadValues(__spreadValues({}, global), self), datasets) : __spreadValues(__spreadValues({}, self), datasets);
  }
  _getPTDatasets(key = "") {
    const datasetPrefix = "data-pc-";
    const isExtended = key === "root" && s(this.$pt()?.["data-pc-section"]);
    return key !== "transition" && __spreadProps(__spreadValues({}, key === "root" && __spreadProps(__spreadValues({
      [`${datasetPrefix}name`]: g(isExtended ? this.$pt()?.["data-pc-section"] : this.$name)
    }, isExtended && {
      [`${datasetPrefix}extend`]: g(this.$name)
    }), {
      [`${this.$attrSelector}`]: ""
      // @todo - use `data-pc-id: this.$attrSelector` instead.
    })), {
      [`${datasetPrefix}section`]: g(key.includes(".") ? key.split(".").at(-1) ?? "" : key)
    });
  }
  _getPTClassValue(options, key, params) {
    const value = this._getOptionValue(options, key, params);
    return a(value) || h(value) ? {
      class: value
    } : value;
  }
  _getPT(pt, key = "", callback) {
    const getValue = (value, checkSameKey = false) => {
      const computedValue = callback ? callback(value) : value;
      const _key = g(key);
      const _cKey = g(this.$hostName || this.$name);
      return (checkSameKey ? _key !== _cKey ? computedValue?.[_key] : void 0 : computedValue?.[_key]) ?? computedValue;
    };
    return pt?.hasOwnProperty("_usept") ? {
      _usept: pt["_usept"],
      originalValue: getValue(pt.originalValue),
      value: getValue(pt.value)
    } : getValue(pt, true);
  }
  _usePT(pt, callback, key, params) {
    const fn = (value) => callback?.call(this, value, key, params);
    if (pt?.hasOwnProperty("_usept")) {
      const {
        mergeSections = true,
        mergeProps: useMergeProps = false
      } = pt["_usept"] || this.config?.["ptOptions"]() || {};
      const originalValue = fn(pt.originalValue);
      const value = fn(pt.value);
      if (originalValue === void 0 && value === void 0) return void 0;
      else if (a(value)) return value;
      else if (a(originalValue)) return originalValue;
      return mergeSections || !mergeSections && value ? useMergeProps ? this._mergeProps(useMergeProps, originalValue, value) : __spreadValues(__spreadValues({}, originalValue), value) : value;
    }
    return fn(pt);
  }
  _useGlobalPT(callback, key, params) {
    return this._usePT(this.$globalPT, callback, key, params);
  }
  _useDefaultPT(callback, key, params) {
    return this._usePT(this.$defaultPT, callback, key, params);
  }
  /******************** Exposed API ********************/
  ptm(key = "", params = {}) {
    return this._getPTValue(this.$pt(), key, __spreadValues(__spreadValues({}, this.$params), params));
  }
  ptms(keys, params = {}) {
    return keys.reduce((acc, arg) => {
      acc = w(acc, this.ptm(arg, params)) || {};
      return acc;
    }, {});
  }
  ptmo(obj = {}, key = "", params = {}) {
    return this._getPTValue(obj, key, __spreadValues({
      instance: this
    }, params), false);
  }
  cx(key, params = {}) {
    return !this.$unstyled() ? f(this._getOptionValue(this.$style.classes, key, __spreadValues(__spreadValues({}, this.$params), params))) : void 0;
  }
  sx(key = "", when = true, params = {}) {
    if (when) {
      const self = this._getOptionValue(this.$style.inlineStyles, key, __spreadValues(__spreadValues({}, this.$params), params));
      const base2 = this._getOptionValue(this.baseComponentStyle.inlineStyles, key, __spreadValues(__spreadValues({}, this.$params), params));
      return __spreadValues(__spreadValues({}, base2), self);
    }
    return void 0;
  }
  static ɵfac = function BaseComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BaseComponent)();
  };
  static ɵdir = ɵɵdefineDirective({
    type: _BaseComponent,
    inputs: {
      dt: [1, "dt"],
      unstyled: [1, "unstyled"],
      pt: [1, "pt"],
      ptOptions: [1, "ptOptions"]
    },
    features: [ɵɵProvidersFeature([BaseComponentStyle, BaseStyle]), ɵɵNgOnChangesFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BaseComponent, [{
    type: Directive,
    args: [{
      standalone: true,
      providers: [BaseComponentStyle, BaseStyle]
    }]
  }], () => [], {
    dt: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "dt",
        required: false
      }]
    }],
    unstyled: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "unstyled",
        required: false
      }]
    }],
    pt: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "pt",
        required: false
      }]
    }],
    ptOptions: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "ptOptions",
        required: false
      }]
    }]
  });
})();

export {
  rr,
  BaseStyle,
  PARENT_INSTANCE,
  BaseComponent
};
//# sourceMappingURL=chunk-B4PUAGAB.js.map

var Gd = Object.defineProperty;
var Yd = (e, t, n) => t in e ? Gd(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Ue = (e, t, n) => Yd(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function ms(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const De = {}, Bn = [], Dt = () => {
}, Xd = () => !1, Ai = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), ys = (e) => e.startsWith("onUpdate:"), tt = Object.assign, bs = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, qd = Object.prototype.hasOwnProperty, Te = (e, t) => qd.call(e, t), ve = Array.isArray, Fn = (e) => Vo(e) === "[object Map]", to = (e) => Vo(e) === "[object Set]", Js = (e) => Vo(e) === "[object Date]", be = (e) => typeof e == "function", Fe = (e) => typeof e == "string", kt = (e) => typeof e == "symbol", Ae = (e) => e !== null && typeof e == "object", Ya = (e) => (Ae(e) || be(e)) && be(e.then) && be(e.catch), Xa = Object.prototype.toString, Vo = (e) => Xa.call(e), Wd = (e) => Vo(e).slice(8, -1), qa = (e) => Vo(e) === "[object Object]", _s = (e) => Fe(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, go = /* @__PURE__ */ ms(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Ri = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, Kd = /-(\w)/g, bt = Ri(
  (e) => e.replace(Kd, (t, n) => n ? n.toUpperCase() : "")
), Zd = /\B([A-Z])/g, An = Ri(
  (e) => e.replace(Zd, "-$1").toLowerCase()
), Li = Ri((e) => e.charAt(0).toUpperCase() + e.slice(1)), ar = Ri(
  (e) => e ? `on${Li(e)}` : ""
), Xt = (e, t) => !Object.is(e, t), si = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, Wa = (e, t, n, o = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: o,
    value: n
  });
}, gi = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Qs;
const Vi = () => Qs || (Qs = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function ft(e) {
  if (ve(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const o = e[n], i = Fe(o) ? tf(o) : ft(o);
      if (i)
        for (const r in i)
          t[r] = i[r];
    }
    return t;
  } else if (Fe(e) || Ae(e))
    return e;
}
const Jd = /;(?![^(]*\))/g, Qd = /:([^]+)/, ef = /\/\*[^]*?\*\//g;
function tf(e) {
  const t = {};
  return e.replace(ef, "").split(Jd).forEach((n) => {
    if (n) {
      const o = n.split(Qd);
      o.length > 1 && (t[o[0].trim()] = o[1].trim());
    }
  }), t;
}
function xe(e) {
  let t = "";
  if (Fe(e))
    t = e;
  else if (ve(e))
    for (let n = 0; n < e.length; n++) {
      const o = xe(e[n]);
      o && (t += o + " ");
    }
  else if (Ae(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
function ur(e) {
  if (!e) return null;
  let { class: t, style: n } = e;
  return t && !Fe(t) && (e.class = xe(t)), n && (e.style = ft(n)), e;
}
const nf = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", of = /* @__PURE__ */ ms(nf);
function Ka(e) {
  return !!e || e === "";
}
function rf(e, t) {
  if (e.length !== t.length) return !1;
  let n = !0;
  for (let o = 0; n && o < e.length; o++)
    n = zo(e[o], t[o]);
  return n;
}
function zo(e, t) {
  if (e === t) return !0;
  let n = Js(e), o = Js(t);
  if (n || o)
    return n && o ? e.getTime() === t.getTime() : !1;
  if (n = kt(e), o = kt(t), n || o)
    return e === t;
  if (n = ve(e), o = ve(t), n || o)
    return n && o ? rf(e, t) : !1;
  if (n = Ae(e), o = Ae(t), n || o) {
    if (!n || !o)
      return !1;
    const i = Object.keys(e).length, r = Object.keys(t).length;
    if (i !== r)
      return !1;
    for (const s in e) {
      const l = e.hasOwnProperty(s), a = t.hasOwnProperty(s);
      if (l && !a || !l && a || !zo(e[s], t[s]))
        return !1;
    }
  }
  return String(e) === String(t);
}
function ws(e, t) {
  return e.findIndex((n) => zo(n, t));
}
const Za = (e) => !!(e && e.__v_isRef === !0), Q = (e) => Fe(e) ? e : e == null ? "" : ve(e) || Ae(e) && (e.toString === Xa || !be(e.toString)) ? Za(e) ? Q(e.value) : JSON.stringify(e, Ja, 2) : String(e), Ja = (e, t) => Za(t) ? Ja(e, t.value) : Fn(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [o, i], r) => (n[cr(o, r) + " =>"] = i, n),
    {}
  )
} : to(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => cr(n))
} : kt(t) ? cr(t) : Ae(t) && !ve(t) && !qa(t) ? String(t) : t, cr = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    kt(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let st;
class Qa {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = st, !t && st && (this.index = (st.scopes || (st.scopes = [])).push(
      this
    ) - 1);
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, n;
      if (this.scopes)
        for (t = 0, n = this.scopes.length; t < n; t++)
          this.scopes[t].pause();
      for (t = 0, n = this.effects.length; t < n; t++)
        this.effects[t].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, n;
      if (this.scopes)
        for (t = 0, n = this.scopes.length; t < n; t++)
          this.scopes[t].resume();
      for (t = 0, n = this.effects.length; t < n; t++)
        this.effects[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const n = st;
      try {
        return st = this, t();
      } finally {
        st = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    st = this;
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    st = this.parent;
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let n, o;
      for (n = 0, o = this.effects.length; n < o; n++)
        this.effects[n].stop();
      for (this.effects.length = 0, n = 0, o = this.cleanups.length; n < o; n++)
        this.cleanups[n]();
      if (this.cleanups.length = 0, this.scopes) {
        for (n = 0, o = this.scopes.length; n < o; n++)
          this.scopes[n].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !t) {
        const i = this.parent.scopes.pop();
        i && i !== this && (this.parent.scopes[this.index] = i, i.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function eu(e) {
  return new Qa(e);
}
function Es() {
  return st;
}
function li(e, t = !1) {
  st && st.cleanups.push(e);
}
let Re;
const dr = /* @__PURE__ */ new WeakSet();
class tu {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, st && st.active && st.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, dr.has(this) && (dr.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || ou(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, el(this), iu(this);
    const t = Re, n = xt;
    Re = this, xt = !0;
    try {
      return this.fn();
    } finally {
      ru(this), Re = t, xt = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Ss(t);
      this.deps = this.depsTail = void 0, el(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? dr.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Vr(this) && this.run();
  }
  get dirty() {
    return Vr(this);
  }
}
let nu = 0, mo, yo;
function ou(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = yo, yo = e;
    return;
  }
  e.next = mo, mo = e;
}
function xs() {
  nu++;
}
function ks() {
  if (--nu > 0)
    return;
  if (yo) {
    let t = yo;
    for (yo = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; mo; ) {
    let t = mo;
    for (mo = void 0; t; ) {
      const n = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (o) {
          e || (e = o);
        }
      t = n;
    }
  }
  if (e) throw e;
}
function iu(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function ru(e) {
  let t, n = e.depsTail, o = n;
  for (; o; ) {
    const i = o.prevDep;
    o.version === -1 ? (o === n && (n = i), Ss(o), sf(o)) : t = o, o.dep.activeLink = o.prevActiveLink, o.prevActiveLink = void 0, o = i;
  }
  e.deps = t, e.depsTail = n;
}
function Vr(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (su(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function su(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === ko))
    return;
  e.globalVersion = ko;
  const t = e.dep;
  if (e.flags |= 2, t.version > 0 && !e.isSSR && e.deps && !Vr(e)) {
    e.flags &= -3;
    return;
  }
  const n = Re, o = xt;
  Re = e, xt = !0;
  try {
    iu(e);
    const i = e.fn(e._value);
    (t.version === 0 || Xt(i, e._value)) && (e._value = i, t.version++);
  } catch (i) {
    throw t.version++, i;
  } finally {
    Re = n, xt = o, ru(e), e.flags &= -3;
  }
}
function Ss(e, t = !1) {
  const { dep: n, prevSub: o, nextSub: i } = e;
  if (o && (o.nextSub = i, e.prevSub = void 0), i && (i.prevSub = o, e.nextSub = void 0), n.subs === e && (n.subs = o, !o && n.computed)) {
    n.computed.flags &= -5;
    for (let r = n.computed.deps; r; r = r.nextDep)
      Ss(r, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function sf(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let xt = !0;
const lu = [];
function pn() {
  lu.push(xt), xt = !1;
}
function vn() {
  const e = lu.pop();
  xt = e === void 0 ? !0 : e;
}
function el(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = Re;
    Re = void 0;
    try {
      t();
    } finally {
      Re = n;
    }
  }
}
let ko = 0;
class lf {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class zi {
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0;
  }
  track(t) {
    if (!Re || !xt || Re === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== Re)
      n = this.activeLink = new lf(Re, this), Re.deps ? (n.prevDep = Re.depsTail, Re.depsTail.nextDep = n, Re.depsTail = n) : Re.deps = Re.depsTail = n, au(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const o = n.nextDep;
      o.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = o), n.prevDep = Re.depsTail, n.nextDep = void 0, Re.depsTail.nextDep = n, Re.depsTail = n, Re.deps === n && (Re.deps = o);
    }
    return n;
  }
  trigger(t) {
    this.version++, ko++, this.notify(t);
  }
  notify(t) {
    xs();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      ks();
    }
  }
}
function au(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let o = t.deps; o; o = o.nextDep)
        au(o);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const mi = /* @__PURE__ */ new WeakMap(), kn = Symbol(
  ""
), zr = Symbol(
  ""
), So = Symbol(
  ""
);
function Qe(e, t, n) {
  if (xt && Re) {
    let o = mi.get(e);
    o || mi.set(e, o = /* @__PURE__ */ new Map());
    let i = o.get(n);
    i || (o.set(n, i = new zi()), i.map = o, i.key = n), i.track();
  }
}
function Ht(e, t, n, o, i, r) {
  const s = mi.get(e);
  if (!s) {
    ko++;
    return;
  }
  const l = (a) => {
    a && a.trigger();
  };
  if (xs(), t === "clear")
    s.forEach(l);
  else {
    const a = ve(e), u = a && _s(n);
    if (a && n === "length") {
      const c = Number(o);
      s.forEach((f, p) => {
        (p === "length" || p === So || !kt(p) && p >= c) && l(f);
      });
    } else
      switch ((n !== void 0 || s.has(void 0)) && l(s.get(n)), u && l(s.get(So)), t) {
        case "add":
          a ? u && l(s.get("length")) : (l(s.get(kn)), Fn(e) && l(s.get(zr)));
          break;
        case "delete":
          a || (l(s.get(kn)), Fn(e) && l(s.get(zr)));
          break;
        case "set":
          Fn(e) && l(s.get(kn));
          break;
      }
  }
  ks();
}
function af(e, t) {
  const n = mi.get(e);
  return n && n.get(t);
}
function Ln(e) {
  const t = Me(e);
  return t === e ? t : (Qe(t, "iterate", So), yt(e) ? t : t.map(et));
}
function Bi(e) {
  return Qe(e = Me(e), "iterate", So), e;
}
const uf = {
  __proto__: null,
  [Symbol.iterator]() {
    return fr(this, Symbol.iterator, et);
  },
  concat(...e) {
    return Ln(this).concat(
      ...e.map((t) => ve(t) ? Ln(t) : t)
    );
  },
  entries() {
    return fr(this, "entries", (e) => (e[1] = et(e[1]), e));
  },
  every(e, t) {
    return zt(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return zt(this, "filter", e, t, (n) => n.map(et), arguments);
  },
  find(e, t) {
    return zt(this, "find", e, t, et, arguments);
  },
  findIndex(e, t) {
    return zt(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return zt(this, "findLast", e, t, et, arguments);
  },
  findLastIndex(e, t) {
    return zt(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return zt(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return hr(this, "includes", e);
  },
  indexOf(...e) {
    return hr(this, "indexOf", e);
  },
  join(e) {
    return Ln(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return hr(this, "lastIndexOf", e);
  },
  map(e, t) {
    return zt(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return io(this, "pop");
  },
  push(...e) {
    return io(this, "push", e);
  },
  reduce(e, ...t) {
    return tl(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return tl(this, "reduceRight", e, t);
  },
  shift() {
    return io(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return zt(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return io(this, "splice", e);
  },
  toReversed() {
    return Ln(this).toReversed();
  },
  toSorted(e) {
    return Ln(this).toSorted(e);
  },
  toSpliced(...e) {
    return Ln(this).toSpliced(...e);
  },
  unshift(...e) {
    return io(this, "unshift", e);
  },
  values() {
    return fr(this, "values", et);
  }
};
function fr(e, t, n) {
  const o = Bi(e), i = o[t]();
  return o !== e && !yt(e) && (i._next = i.next, i.next = () => {
    const r = i._next();
    return r.value && (r.value = n(r.value)), r;
  }), i;
}
const cf = Array.prototype;
function zt(e, t, n, o, i, r) {
  const s = Bi(e), l = s !== e && !yt(e), a = s[t];
  if (a !== cf[t]) {
    const f = a.apply(e, r);
    return l ? et(f) : f;
  }
  let u = n;
  s !== e && (l ? u = function(f, p) {
    return n.call(this, et(f), p, e);
  } : n.length > 2 && (u = function(f, p) {
    return n.call(this, f, p, e);
  }));
  const c = a.call(s, u, o);
  return l && i ? i(c) : c;
}
function tl(e, t, n, o) {
  const i = Bi(e);
  let r = n;
  return i !== e && (yt(e) ? n.length > 3 && (r = function(s, l, a) {
    return n.call(this, s, l, a, e);
  }) : r = function(s, l, a) {
    return n.call(this, s, et(l), a, e);
  }), i[t](r, ...o);
}
function hr(e, t, n) {
  const o = Me(e);
  Qe(o, "iterate", So);
  const i = o[t](...n);
  return (i === -1 || i === !1) && Ms(n[0]) ? (n[0] = Me(n[0]), o[t](...n)) : i;
}
function io(e, t, n = []) {
  pn(), xs();
  const o = Me(e)[t].apply(e, n);
  return ks(), vn(), o;
}
const df = /* @__PURE__ */ ms("__proto__,__v_isRef,__isVue"), uu = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(kt)
);
function ff(e) {
  kt(e) || (e = String(e));
  const t = Me(this);
  return Qe(t, "has", e), t.hasOwnProperty(e);
}
class cu {
  constructor(t = !1, n = !1) {
    this._isReadonly = t, this._isShallow = n;
  }
  get(t, n, o) {
    if (n === "__v_skip") return t.__v_skip;
    const i = this._isReadonly, r = this._isShallow;
    if (n === "__v_isReactive")
      return !i;
    if (n === "__v_isReadonly")
      return i;
    if (n === "__v_isShallow")
      return r;
    if (n === "__v_raw")
      return o === (i ? r ? Ef : pu : r ? hu : fu).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(o) ? t : void 0;
    const s = ve(t);
    if (!i) {
      let a;
      if (s && (a = uf[n]))
        return a;
      if (n === "hasOwnProperty")
        return ff;
    }
    const l = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      He(t) ? t : o
    );
    return (kt(n) ? uu.has(n) : df(n)) || (i || Qe(t, "get", n), r) ? l : He(l) ? s && _s(n) ? l : l.value : Ae(l) ? i ? Ns(l) : Sn(l) : l;
  }
}
class du extends cu {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, o, i) {
    let r = t[n];
    if (!this._isShallow) {
      const a = Mn(r);
      if (!yt(o) && !Mn(o) && (r = Me(r), o = Me(o)), !ve(t) && He(r) && !He(o))
        return a ? !1 : (r.value = o, !0);
    }
    const s = ve(t) && _s(n) ? Number(n) < t.length : Te(t, n), l = Reflect.set(
      t,
      n,
      o,
      He(t) ? t : i
    );
    return t === Me(i) && (s ? Xt(o, r) && Ht(t, "set", n, o) : Ht(t, "add", n, o)), l;
  }
  deleteProperty(t, n) {
    const o = Te(t, n);
    t[n];
    const i = Reflect.deleteProperty(t, n);
    return i && o && Ht(t, "delete", n, void 0), i;
  }
  has(t, n) {
    const o = Reflect.has(t, n);
    return (!kt(n) || !uu.has(n)) && Qe(t, "has", n), o;
  }
  ownKeys(t) {
    return Qe(
      t,
      "iterate",
      ve(t) ? "length" : kn
    ), Reflect.ownKeys(t);
  }
}
class hf extends cu {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, n) {
    return !0;
  }
  deleteProperty(t, n) {
    return !0;
  }
}
const pf = /* @__PURE__ */ new du(), vf = /* @__PURE__ */ new hf(), gf = /* @__PURE__ */ new du(!0);
const Br = (e) => e, Yo = (e) => Reflect.getPrototypeOf(e);
function mf(e, t, n) {
  return function(...o) {
    const i = this.__v_raw, r = Me(i), s = Fn(r), l = e === "entries" || e === Symbol.iterator && s, a = e === "keys" && s, u = i[e](...o), c = n ? Br : t ? Fr : et;
    return !t && Qe(
      r,
      "iterate",
      a ? zr : kn
    ), {
      // iterator protocol
      next() {
        const { value: f, done: p } = u.next();
        return p ? { value: f, done: p } : {
          value: l ? [c(f[0]), c(f[1])] : c(f),
          done: p
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function Xo(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function yf(e, t) {
  const n = {
    get(i) {
      const r = this.__v_raw, s = Me(r), l = Me(i);
      e || (Xt(i, l) && Qe(s, "get", i), Qe(s, "get", l));
      const { has: a } = Yo(s), u = t ? Br : e ? Fr : et;
      if (a.call(s, i))
        return u(r.get(i));
      if (a.call(s, l))
        return u(r.get(l));
      r !== s && r.get(i);
    },
    get size() {
      const i = this.__v_raw;
      return !e && Qe(Me(i), "iterate", kn), Reflect.get(i, "size", i);
    },
    has(i) {
      const r = this.__v_raw, s = Me(r), l = Me(i);
      return e || (Xt(i, l) && Qe(s, "has", i), Qe(s, "has", l)), i === l ? r.has(i) : r.has(i) || r.has(l);
    },
    forEach(i, r) {
      const s = this, l = s.__v_raw, a = Me(l), u = t ? Br : e ? Fr : et;
      return !e && Qe(a, "iterate", kn), l.forEach((c, f) => i.call(r, u(c), u(f), s));
    }
  };
  return tt(
    n,
    e ? {
      add: Xo("add"),
      set: Xo("set"),
      delete: Xo("delete"),
      clear: Xo("clear")
    } : {
      add(i) {
        !t && !yt(i) && !Mn(i) && (i = Me(i));
        const r = Me(this);
        return Yo(r).has.call(r, i) || (r.add(i), Ht(r, "add", i, i)), this;
      },
      set(i, r) {
        !t && !yt(r) && !Mn(r) && (r = Me(r));
        const s = Me(this), { has: l, get: a } = Yo(s);
        let u = l.call(s, i);
        u || (i = Me(i), u = l.call(s, i));
        const c = a.call(s, i);
        return s.set(i, r), u ? Xt(r, c) && Ht(s, "set", i, r) : Ht(s, "add", i, r), this;
      },
      delete(i) {
        const r = Me(this), { has: s, get: l } = Yo(r);
        let a = s.call(r, i);
        a || (i = Me(i), a = s.call(r, i)), l && l.call(r, i);
        const u = r.delete(i);
        return a && Ht(r, "delete", i, void 0), u;
      },
      clear() {
        const i = Me(this), r = i.size !== 0, s = i.clear();
        return r && Ht(
          i,
          "clear",
          void 0,
          void 0
        ), s;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((i) => {
    n[i] = mf(i, e, t);
  }), n;
}
function Cs(e, t) {
  const n = yf(e, t);
  return (o, i, r) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_raw" ? o : Reflect.get(
    Te(n, i) && i in o ? n : o,
    i,
    r
  );
}
const bf = {
  get: /* @__PURE__ */ Cs(!1, !1)
}, _f = {
  get: /* @__PURE__ */ Cs(!1, !0)
}, wf = {
  get: /* @__PURE__ */ Cs(!0, !1)
};
const fu = /* @__PURE__ */ new WeakMap(), hu = /* @__PURE__ */ new WeakMap(), pu = /* @__PURE__ */ new WeakMap(), Ef = /* @__PURE__ */ new WeakMap();
function xf(e) {
  switch (e) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function kf(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : xf(Wd(e));
}
function Sn(e) {
  return Mn(e) ? e : $s(
    e,
    !1,
    pf,
    bf,
    fu
  );
}
function Sf(e) {
  return $s(
    e,
    !1,
    gf,
    _f,
    hu
  );
}
function Ns(e) {
  return $s(
    e,
    !0,
    vf,
    wf,
    pu
  );
}
function $s(e, t, n, o, i) {
  if (!Ae(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const r = i.get(e);
  if (r)
    return r;
  const s = kf(e);
  if (s === 0)
    return e;
  const l = new Proxy(
    e,
    s === 2 ? o : n
  );
  return i.set(e, l), l;
}
function Hn(e) {
  return Mn(e) ? Hn(e.__v_raw) : !!(e && e.__v_isReactive);
}
function Mn(e) {
  return !!(e && e.__v_isReadonly);
}
function yt(e) {
  return !!(e && e.__v_isShallow);
}
function Ms(e) {
  return e ? !!e.__v_raw : !1;
}
function Me(e) {
  const t = e && e.__v_raw;
  return t ? Me(t) : e;
}
function Cn(e) {
  return !Te(e, "__v_skip") && Object.isExtensible(e) && Wa(e, "__v_skip", !0), e;
}
const et = (e) => Ae(e) ? Sn(e) : e, Fr = (e) => Ae(e) ? Ns(e) : e;
function He(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function ie(e) {
  return Cf(e, !1);
}
function Cf(e, t) {
  return He(e) ? e : new Nf(e, t);
}
class Nf {
  constructor(t, n) {
    this.dep = new zi(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : Me(t), this._value = n ? t : et(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, o = this.__v_isShallow || yt(t) || Mn(t);
    t = o ? t : Me(t), Xt(t, n) && (this._rawValue = t, this._value = o ? t : et(t), this.dep.trigger());
  }
}
function F(e) {
  return He(e) ? e.value : e;
}
function Ce(e) {
  return be(e) ? e() : F(e);
}
const $f = {
  get: (e, t, n) => t === "__v_raw" ? e : F(Reflect.get(e, t, n)),
  set: (e, t, n, o) => {
    const i = e[t];
    return He(i) && !He(n) ? (i.value = n, !0) : Reflect.set(e, t, n, o);
  }
};
function vu(e) {
  return Hn(e) ? e : new Proxy(e, $f);
}
class Mf {
  constructor(t) {
    this.__v_isRef = !0, this._value = void 0;
    const n = this.dep = new zi(), { get: o, set: i } = t(n.track.bind(n), n.trigger.bind(n));
    this._get = o, this._set = i;
  }
  get value() {
    return this._value = this._get();
  }
  set value(t) {
    this._set(t);
  }
}
function If(e) {
  return new Mf(e);
}
function Of(e) {
  const t = ve(e) ? new Array(e.length) : {};
  for (const n in e)
    t[n] = gu(e, n);
  return t;
}
class Tf {
  constructor(t, n, o) {
    this._object = t, this._key = n, this._defaultValue = o, this.__v_isRef = !0, this._value = void 0;
  }
  get value() {
    const t = this._object[this._key];
    return this._value = t === void 0 ? this._defaultValue : t;
  }
  set value(t) {
    this._object[this._key] = t;
  }
  get dep() {
    return af(Me(this._object), this._key);
  }
}
class Pf {
  constructor(t) {
    this._getter = t, this.__v_isRef = !0, this.__v_isReadonly = !0, this._value = void 0;
  }
  get value() {
    return this._value = this._getter();
  }
}
function ze(e, t, n) {
  return He(e) ? e : be(e) ? new Pf(e) : Ae(e) && arguments.length > 1 ? gu(e, t, n) : ie(e);
}
function gu(e, t, n) {
  const o = e[t];
  return He(o) ? o : new Tf(e, t, n);
}
class Df {
  constructor(t, n, o) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new zi(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = ko - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = o;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    Re !== this)
      return ou(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return su(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Af(e, t, n = !1) {
  let o, i;
  return be(e) ? o = e : (o = e.get, i = e.set), new Df(o, i, n);
}
const qo = {}, yi = /* @__PURE__ */ new WeakMap();
let _n;
function Rf(e, t = !1, n = _n) {
  if (n) {
    let o = yi.get(n);
    o || yi.set(n, o = []), o.push(e);
  }
}
function Lf(e, t, n = De) {
  const { immediate: o, deep: i, once: r, scheduler: s, augmentJob: l, call: a } = n, u = (w) => i ? w : yt(w) || i === !1 || i === 0 ? Ut(w, 1) : Ut(w);
  let c, f, p, g, _ = !1, C = !1;
  if (He(e) ? (f = () => e.value, _ = yt(e)) : Hn(e) ? (f = () => u(e), _ = !0) : ve(e) ? (C = !0, _ = e.some((w) => Hn(w) || yt(w)), f = () => e.map((w) => {
    if (He(w))
      return w.value;
    if (Hn(w))
      return u(w);
    if (be(w))
      return a ? a(w, 2) : w();
  })) : be(e) ? t ? f = a ? () => a(e, 2) : e : f = () => {
    if (p) {
      pn();
      try {
        p();
      } finally {
        vn();
      }
    }
    const w = _n;
    _n = c;
    try {
      return a ? a(e, 3, [g]) : e(g);
    } finally {
      _n = w;
    }
  } : f = Dt, t && i) {
    const w = f, H = i === !0 ? 1 / 0 : i;
    f = () => Ut(w(), H);
  }
  const $ = Es(), M = () => {
    c.stop(), $ && $.active && bs($.effects, c);
  };
  if (r && t) {
    const w = t;
    t = (...H) => {
      w(...H), M();
    };
  }
  let D = C ? new Array(e.length).fill(qo) : qo;
  const x = (w) => {
    if (!(!(c.flags & 1) || !c.dirty && !w))
      if (t) {
        const H = c.run();
        if (i || _ || (C ? H.some((L, z) => Xt(L, D[z])) : Xt(H, D))) {
          p && p();
          const L = _n;
          _n = c;
          try {
            const z = [
              H,
              // pass undefined as the old value when it's changed for the first time
              D === qo ? void 0 : C && D[0] === qo ? [] : D,
              g
            ];
            a ? a(t, 3, z) : (
              // @ts-expect-error
              t(...z)
            ), D = H;
          } finally {
            _n = L;
          }
        }
      } else
        c.run();
  };
  return l && l(x), c = new tu(f), c.scheduler = s ? () => s(x, !1) : x, g = (w) => Rf(w, !1, c), p = c.onStop = () => {
    const w = yi.get(c);
    if (w) {
      if (a)
        a(w, 4);
      else
        for (const H of w) H();
      yi.delete(c);
    }
  }, t ? o ? x(!0) : D = c.run() : s ? s(x.bind(null, !0), !0) : c.run(), M.pause = c.pause.bind(c), M.resume = c.resume.bind(c), M.stop = M, M;
}
function Ut(e, t = 1 / 0, n) {
  if (t <= 0 || !Ae(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, He(e))
    Ut(e.value, t, n);
  else if (ve(e))
    for (let o = 0; o < e.length; o++)
      Ut(e[o], t, n);
  else if (to(e) || Fn(e))
    e.forEach((o) => {
      Ut(o, t, n);
    });
  else if (qa(e)) {
    for (const o in e)
      Ut(e[o], t, n);
    for (const o of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, o) && Ut(e[o], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Bo(e, t, n, o) {
  try {
    return o ? e(...o) : e();
  } catch (i) {
    Fi(i, t, n);
  }
}
function Lt(e, t, n, o) {
  if (be(e)) {
    const i = Bo(e, t, n, o);
    return i && Ya(i) && i.catch((r) => {
      Fi(r, t, n);
    }), i;
  }
  if (ve(e)) {
    const i = [];
    for (let r = 0; r < e.length; r++)
      i.push(Lt(e[r], t, n, o));
    return i;
  }
}
function Fi(e, t, n, o = !0) {
  const i = t ? t.vnode : null, { errorHandler: r, throwUnhandledErrorInProduction: s } = t && t.appContext.config || De;
  if (t) {
    let l = t.parent;
    const a = t.proxy, u = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; l; ) {
      const c = l.ec;
      if (c) {
        for (let f = 0; f < c.length; f++)
          if (c[f](e, a, u) === !1)
            return;
      }
      l = l.parent;
    }
    if (r) {
      pn(), Bo(r, null, 10, [
        e,
        a,
        u
      ]), vn();
      return;
    }
  }
  Vf(e, n, i, o, s);
}
function Vf(e, t, n, o = !0, i = !1) {
  if (i)
    throw e;
  console.error(e);
}
const lt = [];
let Ot = -1;
const Un = [];
let en = null, zn = 0;
const mu = /* @__PURE__ */ Promise.resolve();
let bi = null;
function Ze(e) {
  const t = bi || mu;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function zf(e) {
  let t = Ot + 1, n = lt.length;
  for (; t < n; ) {
    const o = t + n >>> 1, i = lt[o], r = Co(i);
    r < e || r === e && i.flags & 2 ? t = o + 1 : n = o;
  }
  return t;
}
function Is(e) {
  if (!(e.flags & 1)) {
    const t = Co(e), n = lt[lt.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Co(n) ? lt.push(e) : lt.splice(zf(t), 0, e), e.flags |= 1, yu();
  }
}
function yu() {
  bi || (bi = mu.then(_u));
}
function Bf(e) {
  ve(e) ? Un.push(...e) : en && e.id === -1 ? en.splice(zn + 1, 0, e) : e.flags & 1 || (Un.push(e), e.flags |= 1), yu();
}
function nl(e, t, n = Ot + 1) {
  for (; n < lt.length; n++) {
    const o = lt[n];
    if (o && o.flags & 2) {
      if (e && o.id !== e.uid)
        continue;
      lt.splice(n, 1), n--, o.flags & 4 && (o.flags &= -2), o(), o.flags & 4 || (o.flags &= -2);
    }
  }
}
function bu(e) {
  if (Un.length) {
    const t = [...new Set(Un)].sort(
      (n, o) => Co(n) - Co(o)
    );
    if (Un.length = 0, en) {
      en.push(...t);
      return;
    }
    for (en = t, zn = 0; zn < en.length; zn++) {
      const n = en[zn];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    en = null, zn = 0;
  }
}
const Co = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function _u(e) {
  try {
    for (Ot = 0; Ot < lt.length; Ot++) {
      const t = lt[Ot];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Bo(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Ot < lt.length; Ot++) {
      const t = lt[Ot];
      t && (t.flags &= -2);
    }
    Ot = -1, lt.length = 0, bu(), bi = null, (lt.length || Un.length) && _u();
  }
}
let Ke = null, wu = null;
function _i(e) {
  const t = Ke;
  return Ke = e, wu = e && e.type.__scopeId || null, t;
}
function cn(e, t = Ke, n) {
  if (!t || e._n)
    return e;
  const o = (...i) => {
    o._d && fl(-1);
    const r = _i(t);
    let s;
    try {
      s = e(...i);
    } finally {
      _i(r), o._d && fl(1);
    }
    return s;
  };
  return o._n = !0, o._c = !0, o._d = !0, o;
}
function je(e, t) {
  if (Ke === null)
    return e;
  const n = Yi(Ke), o = e.dirs || (e.dirs = []);
  for (let i = 0; i < t.length; i++) {
    let [r, s, l, a = De] = t[i];
    r && (be(r) && (r = {
      mounted: r,
      updated: r
    }), r.deep && Ut(s), o.push({
      dir: r,
      instance: n,
      value: s,
      oldValue: void 0,
      arg: l,
      modifiers: a
    }));
  }
  return e;
}
function mn(e, t, n, o) {
  const i = e.dirs, r = t && t.dirs;
  for (let s = 0; s < i.length; s++) {
    const l = i[s];
    r && (l.oldValue = r[s].value);
    let a = l.dir[o];
    a && (pn(), Lt(a, n, 8, [
      e.el,
      l,
      e,
      t
    ]), vn());
  }
}
const Ff = Symbol("_vte"), Hf = (e) => e.__isTeleport;
function Os(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Os(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Oe(e, t) {
  return be(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    tt({ name: e.name }, t, { setup: e })
  ) : e;
}
function Eu(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function wi(e, t, n, o, i = !1) {
  if (ve(e)) {
    e.forEach(
      (_, C) => wi(
        _,
        t && (ve(t) ? t[C] : t),
        n,
        o,
        i
      )
    );
    return;
  }
  if (jn(o) && !i) {
    o.shapeFlag & 512 && o.type.__asyncResolved && o.component.subTree.component && wi(e, t, n, o.component.subTree);
    return;
  }
  const r = o.shapeFlag & 4 ? Yi(o.component) : o.el, s = i ? null : r, { i: l, r: a } = e, u = t && t.r, c = l.refs === De ? l.refs = {} : l.refs, f = l.setupState, p = Me(f), g = f === De ? () => !1 : (_) => Te(p, _);
  if (u != null && u !== a && (Fe(u) ? (c[u] = null, g(u) && (f[u] = null)) : He(u) && (u.value = null)), be(a))
    Bo(a, l, 12, [s, c]);
  else {
    const _ = Fe(a), C = He(a);
    if (_ || C) {
      const $ = () => {
        if (e.f) {
          const M = _ ? g(a) ? f[a] : c[a] : a.value;
          i ? ve(M) && bs(M, r) : ve(M) ? M.includes(r) || M.push(r) : _ ? (c[a] = [r], g(a) && (f[a] = c[a])) : (a.value = [r], e.k && (c[e.k] = a.value));
        } else _ ? (c[a] = s, g(a) && (f[a] = s)) : C && (a.value = s, e.k && (c[e.k] = s));
      };
      s ? ($.id = -1, vt($, n)) : $();
    }
  }
}
Vi().requestIdleCallback;
Vi().cancelIdleCallback;
const jn = (e) => !!e.type.__asyncLoader, xu = (e) => e.type.__isKeepAlive;
function Uf(e, t) {
  ku(e, "a", t);
}
function jf(e, t) {
  ku(e, "da", t);
}
function ku(e, t, n = Je) {
  const o = e.__wdc || (e.__wdc = () => {
    let i = n;
    for (; i; ) {
      if (i.isDeactivated)
        return;
      i = i.parent;
    }
    return e();
  });
  if (Hi(t, o, n), n) {
    let i = n.parent;
    for (; i && i.parent; )
      xu(i.parent.vnode) && Gf(o, t, n, i), i = i.parent;
  }
}
function Gf(e, t, n, o) {
  const i = Hi(
    t,
    e,
    o,
    !0
    /* prepend */
  );
  Ui(() => {
    bs(o[t], i);
  }, n);
}
function Hi(e, t, n = Je, o = !1) {
  if (n) {
    const i = n[e] || (n[e] = []), r = t.__weh || (t.__weh = (...s) => {
      pn();
      const l = Fo(n), a = Lt(t, n, e, s);
      return l(), vn(), a;
    });
    return o ? i.unshift(r) : i.push(r), r;
  }
}
const Zt = (e) => (t, n = Je) => {
  (!$o || e === "sp") && Hi(e, (...o) => t(...o), n);
}, Su = Zt("bm"), ht = Zt("m"), Yf = Zt(
  "bu"
), Xf = Zt("u"), gn = Zt(
  "bum"
), Ui = Zt("um"), qf = Zt(
  "sp"
), Wf = Zt("rtg"), Kf = Zt("rtc");
function Zf(e, t = Je) {
  Hi("ec", e, t);
}
const Cu = "components";
function Nu(e, t) {
  return Iu(Cu, e, !0, t) || e;
}
const $u = Symbol.for("v-ndc");
function Mu(e) {
  return Fe(e) ? Iu(Cu, e, !1) || e : e || $u;
}
function Iu(e, t, n = !0, o = !1) {
  const i = Ke || Je;
  if (i) {
    const r = i.type;
    {
      const l = Lh(
        r,
        !1
      );
      if (l && (l === t || l === bt(t) || l === Li(bt(t))))
        return r;
    }
    const s = (
      // local registration
      // check instance[type] first which is resolved for options API
      ol(i[e] || r[e], t) || // global registration
      ol(i.appContext[e], t)
    );
    return !s && o ? r : s;
  }
}
function ol(e, t) {
  return e && (e[t] || e[bt(t)] || e[Li(bt(t))]);
}
function Le(e, t, n, o) {
  let i;
  const r = n && n[o], s = ve(e);
  if (s || Fe(e)) {
    const l = s && Hn(e);
    let a = !1;
    l && (a = !yt(e), e = Bi(e)), i = new Array(e.length);
    for (let u = 0, c = e.length; u < c; u++)
      i[u] = t(
        a ? et(e[u]) : e[u],
        u,
        void 0,
        r && r[u]
      );
  } else if (typeof e == "number") {
    i = new Array(e);
    for (let l = 0; l < e; l++)
      i[l] = t(l + 1, l, void 0, r && r[l]);
  } else if (Ae(e))
    if (e[Symbol.iterator])
      i = Array.from(
        e,
        (l, a) => t(l, a, void 0, r && r[a])
      );
    else {
      const l = Object.keys(e);
      i = new Array(l.length);
      for (let a = 0, u = l.length; a < u; a++) {
        const c = l[a];
        i[a] = t(e[c], c, a, r && r[a]);
      }
    }
  else
    i = [];
  return n && (n[o] = i), i;
}
function In(e, t, n = {}, o, i) {
  if (Ke.ce || Ke.parent && jn(Ke.parent) && Ke.parent.ce)
    return t !== "default" && (n.name = t), G(), gt(
      ye,
      null,
      [re("slot", n, o && o())],
      64
    );
  let r = e[t];
  r && r._c && (r._d = !1), G();
  const s = r && Ou(r(n)), l = n.key || // slot content array of a dynamic conditional slot may have a branch
  // key attached in the `createSlots` helper, respect that
  s && s.key, a = gt(
    ye,
    {
      key: (l && !kt(l) ? l : `_${t}`) + // #7256 force differentiate fallback content from actual content
      (!s && o ? "_fb" : "")
    },
    s || (o ? o() : []),
    s && e._ === 1 ? 64 : -2
  );
  return a.scopeId && (a.slotScopeIds = [a.scopeId + "-s"]), r && r._c && (r._d = !0), a;
}
function Ou(e) {
  return e.some((t) => No(t) ? !(t.type === fn || t.type === ye && !Ou(t.children)) : !0) ? e : null;
}
const Hr = (e) => e ? ec(e) ? Yi(e) : Hr(e.parent) : null, bo = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ tt(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => Hr(e.parent),
    $root: (e) => Hr(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => Au(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Is(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = Ze.bind(e.proxy)),
    $watch: (e) => _h.bind(e)
  })
), pr = (e, t) => e !== De && !e.__isScriptSetup && Te(e, t), Jf = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: o, data: i, props: r, accessCache: s, type: l, appContext: a } = e;
    let u;
    if (t[0] !== "$") {
      const g = s[t];
      if (g !== void 0)
        switch (g) {
          case 1:
            return o[t];
          case 2:
            return i[t];
          case 4:
            return n[t];
          case 3:
            return r[t];
        }
      else {
        if (pr(o, t))
          return s[t] = 1, o[t];
        if (i !== De && Te(i, t))
          return s[t] = 2, i[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (u = e.propsOptions[0]) && Te(u, t)
        )
          return s[t] = 3, r[t];
        if (n !== De && Te(n, t))
          return s[t] = 4, n[t];
        Ur && (s[t] = 0);
      }
    }
    const c = bo[t];
    let f, p;
    if (c)
      return t === "$attrs" && Qe(e.attrs, "get", ""), c(e);
    if (
      // css module (injected by vue-loader)
      (f = l.__cssModules) && (f = f[t])
    )
      return f;
    if (n !== De && Te(n, t))
      return s[t] = 4, n[t];
    if (
      // global properties
      p = a.config.globalProperties, Te(p, t)
    )
      return p[t];
  },
  set({ _: e }, t, n) {
    const { data: o, setupState: i, ctx: r } = e;
    return pr(i, t) ? (i[t] = n, !0) : o !== De && Te(o, t) ? (o[t] = n, !0) : Te(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (r[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: o, appContext: i, propsOptions: r }
  }, s) {
    let l;
    return !!n[s] || e !== De && Te(e, s) || pr(t, s) || (l = r[0]) && Te(l, s) || Te(o, s) || Te(bo, s) || Te(i.config.globalProperties, s);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : Te(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Qf() {
  return Tu().slots;
}
function eh() {
  return Tu().attrs;
}
function Tu() {
  const e = no();
  return e.setupContext || (e.setupContext = nc(e));
}
function il(e) {
  return ve(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
function Pu(e, t) {
  const n = {};
  for (const o in e)
    t.includes(o) || Object.defineProperty(n, o, {
      enumerable: !0,
      get: () => e[o]
    });
  return n;
}
let Ur = !0;
function th(e) {
  const t = Au(e), n = e.proxy, o = e.ctx;
  Ur = !1, t.beforeCreate && rl(t.beforeCreate, e, "bc");
  const {
    // state
    data: i,
    computed: r,
    methods: s,
    watch: l,
    provide: a,
    inject: u,
    // lifecycle
    created: c,
    beforeMount: f,
    mounted: p,
    beforeUpdate: g,
    updated: _,
    activated: C,
    deactivated: $,
    beforeDestroy: M,
    beforeUnmount: D,
    destroyed: x,
    unmounted: w,
    render: H,
    renderTracked: L,
    renderTriggered: z,
    errorCaptured: T,
    serverPrefetch: N,
    // public API
    expose: V,
    inheritAttrs: Z,
    // assets
    components: O,
    directives: R,
    filters: E
  } = t;
  if (u && nh(u, o, null), s)
    for (const j in s) {
      const q = s[j];
      be(q) && (o[j] = q.bind(n));
    }
  if (i) {
    const j = i.call(n, n);
    Ae(j) && (e.data = Sn(j));
  }
  if (Ur = !0, r)
    for (const j in r) {
      const q = r[j], ee = be(q) ? q.bind(n, n) : be(q.get) ? q.get.bind(n, n) : Dt, oe = !be(q) && be(q.set) ? q.set.bind(n) : Dt, ce = de({
        get: ee,
        set: oe
      });
      Object.defineProperty(o, j, {
        enumerable: !0,
        configurable: !0,
        get: () => ce.value,
        set: (te) => ce.value = te
      });
    }
  if (l)
    for (const j in l)
      Du(l[j], o, n, j);
  if (a) {
    const j = be(a) ? a.call(n) : a;
    Reflect.ownKeys(j).forEach((q) => {
      On(q, j[q]);
    });
  }
  c && rl(c, e, "c");
  function P(j, q) {
    ve(q) ? q.forEach((ee) => j(ee.bind(n))) : q && j(q.bind(n));
  }
  if (P(Su, f), P(ht, p), P(Yf, g), P(Xf, _), P(Uf, C), P(jf, $), P(Zf, T), P(Kf, L), P(Wf, z), P(gn, D), P(Ui, w), P(qf, N), ve(V))
    if (V.length) {
      const j = e.exposed || (e.exposed = {});
      V.forEach((q) => {
        Object.defineProperty(j, q, {
          get: () => n[q],
          set: (ee) => n[q] = ee
        });
      });
    } else e.exposed || (e.exposed = {});
  H && e.render === Dt && (e.render = H), Z != null && (e.inheritAttrs = Z), O && (e.components = O), R && (e.directives = R), N && Eu(e);
}
function nh(e, t, n = Dt) {
  ve(e) && (e = jr(e));
  for (const o in e) {
    const i = e[o];
    let r;
    Ae(i) ? "default" in i ? r = At(
      i.from || o,
      i.default,
      !0
    ) : r = At(i.from || o) : r = At(i), He(r) ? Object.defineProperty(t, o, {
      enumerable: !0,
      configurable: !0,
      get: () => r.value,
      set: (s) => r.value = s
    }) : t[o] = r;
  }
}
function rl(e, t, n) {
  Lt(
    ve(e) ? e.map((o) => o.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function Du(e, t, n, o) {
  let i = o.includes(".") ? Wu(n, o) : () => n[o];
  if (Fe(e)) {
    const r = t[e];
    be(r) && Se(i, r);
  } else if (be(e))
    Se(i, e.bind(n));
  else if (Ae(e))
    if (ve(e))
      e.forEach((r) => Du(r, t, n, o));
    else {
      const r = be(e.handler) ? e.handler.bind(n) : t[e.handler];
      be(r) && Se(i, r, e);
    }
}
function Au(e) {
  const t = e.type, { mixins: n, extends: o } = t, {
    mixins: i,
    optionsCache: r,
    config: { optionMergeStrategies: s }
  } = e.appContext, l = r.get(t);
  let a;
  return l ? a = l : !i.length && !n && !o ? a = t : (a = {}, i.length && i.forEach(
    (u) => Ei(a, u, s, !0)
  ), Ei(a, t, s)), Ae(t) && r.set(t, a), a;
}
function Ei(e, t, n, o = !1) {
  const { mixins: i, extends: r } = t;
  r && Ei(e, r, n, !0), i && i.forEach(
    (s) => Ei(e, s, n, !0)
  );
  for (const s in t)
    if (!(o && s === "expose")) {
      const l = oh[s] || n && n[s];
      e[s] = l ? l(e[s], t[s]) : t[s];
    }
  return e;
}
const oh = {
  data: sl,
  props: ll,
  emits: ll,
  // objects
  methods: uo,
  computed: uo,
  // lifecycle
  beforeCreate: ot,
  created: ot,
  beforeMount: ot,
  mounted: ot,
  beforeUpdate: ot,
  updated: ot,
  beforeDestroy: ot,
  beforeUnmount: ot,
  destroyed: ot,
  unmounted: ot,
  activated: ot,
  deactivated: ot,
  errorCaptured: ot,
  serverPrefetch: ot,
  // assets
  components: uo,
  directives: uo,
  // watch
  watch: rh,
  // provide / inject
  provide: sl,
  inject: ih
};
function sl(e, t) {
  return t ? e ? function() {
    return tt(
      be(e) ? e.call(this, this) : e,
      be(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function ih(e, t) {
  return uo(jr(e), jr(t));
}
function jr(e) {
  if (ve(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function ot(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function uo(e, t) {
  return e ? tt(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function ll(e, t) {
  return e ? ve(e) && ve(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : tt(
    /* @__PURE__ */ Object.create(null),
    il(e),
    il(t ?? {})
  ) : t;
}
function rh(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = tt(/* @__PURE__ */ Object.create(null), e);
  for (const o in t)
    n[o] = ot(e[o], t[o]);
  return n;
}
function Ru() {
  return {
    app: null,
    config: {
      isNativeTag: Xd,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let sh = 0;
function lh(e, t) {
  return function(o, i = null) {
    be(o) || (o = tt({}, o)), i != null && !Ae(i) && (i = null);
    const r = Ru(), s = /* @__PURE__ */ new WeakSet(), l = [];
    let a = !1;
    const u = r.app = {
      _uid: sh++,
      _component: o,
      _props: i,
      _container: null,
      _context: r,
      _instance: null,
      version: Bh,
      get config() {
        return r.config;
      },
      set config(c) {
      },
      use(c, ...f) {
        return s.has(c) || (c && be(c.install) ? (s.add(c), c.install(u, ...f)) : be(c) && (s.add(c), c(u, ...f))), u;
      },
      mixin(c) {
        return r.mixins.includes(c) || r.mixins.push(c), u;
      },
      component(c, f) {
        return f ? (r.components[c] = f, u) : r.components[c];
      },
      directive(c, f) {
        return f ? (r.directives[c] = f, u) : r.directives[c];
      },
      mount(c, f, p) {
        if (!a) {
          const g = u._ceVNode || re(o, i);
          return g.appContext = r, p === !0 ? p = "svg" : p === !1 && (p = void 0), e(g, c, p), a = !0, u._container = c, c.__vue_app__ = u, Yi(g.component);
        }
      },
      onUnmount(c) {
        l.push(c);
      },
      unmount() {
        a && (Lt(
          l,
          u._instance,
          16
        ), e(null, u._container), delete u._container.__vue_app__);
      },
      provide(c, f) {
        return r.provides[c] = f, u;
      },
      runWithContext(c) {
        const f = Gn;
        Gn = u;
        try {
          return c();
        } finally {
          Gn = f;
        }
      }
    };
    return u;
  };
}
let Gn = null;
function On(e, t) {
  if (Je) {
    let n = Je.provides;
    const o = Je.parent && Je.parent.provides;
    o === n && (n = Je.provides = Object.create(o)), n[e] = t;
  }
}
function At(e, t, n = !1) {
  const o = Je || Ke;
  if (o || Gn) {
    const i = Gn ? Gn._context.provides : o ? o.parent == null ? o.vnode.appContext && o.vnode.appContext.provides : o.parent.provides : void 0;
    if (i && e in i)
      return i[e];
    if (arguments.length > 1)
      return n && be(t) ? t.call(o && o.proxy) : t;
  }
}
const Lu = {}, Vu = () => Object.create(Lu), zu = (e) => Object.getPrototypeOf(e) === Lu;
function ah(e, t, n, o = !1) {
  const i = {}, r = Vu();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), Bu(e, t, i, r);
  for (const s in e.propsOptions[0])
    s in i || (i[s] = void 0);
  n ? e.props = o ? i : Sf(i) : e.type.props ? e.props = i : e.props = r, e.attrs = r;
}
function uh(e, t, n, o) {
  const {
    props: i,
    attrs: r,
    vnode: { patchFlag: s }
  } = e, l = Me(i), [a] = e.propsOptions;
  let u = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (o || s > 0) && !(s & 16)
  ) {
    if (s & 8) {
      const c = e.vnode.dynamicProps;
      for (let f = 0; f < c.length; f++) {
        let p = c[f];
        if (ji(e.emitsOptions, p))
          continue;
        const g = t[p];
        if (a)
          if (Te(r, p))
            g !== r[p] && (r[p] = g, u = !0);
          else {
            const _ = bt(p);
            i[_] = Gr(
              a,
              l,
              _,
              g,
              e,
              !1
            );
          }
        else
          g !== r[p] && (r[p] = g, u = !0);
      }
    }
  } else {
    Bu(e, t, i, r) && (u = !0);
    let c;
    for (const f in l)
      (!t || // for camelCase
      !Te(t, f) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = An(f)) === f || !Te(t, c))) && (a ? n && // for camelCase
      (n[f] !== void 0 || // for kebab-case
      n[c] !== void 0) && (i[f] = Gr(
        a,
        l,
        f,
        void 0,
        e,
        !0
      )) : delete i[f]);
    if (r !== l)
      for (const f in r)
        (!t || !Te(t, f)) && (delete r[f], u = !0);
  }
  u && Ht(e.attrs, "set", "");
}
function Bu(e, t, n, o) {
  const [i, r] = e.propsOptions;
  let s = !1, l;
  if (t)
    for (let a in t) {
      if (go(a))
        continue;
      const u = t[a];
      let c;
      i && Te(i, c = bt(a)) ? !r || !r.includes(c) ? n[c] = u : (l || (l = {}))[c] = u : ji(e.emitsOptions, a) || (!(a in o) || u !== o[a]) && (o[a] = u, s = !0);
    }
  if (r) {
    const a = Me(n), u = l || De;
    for (let c = 0; c < r.length; c++) {
      const f = r[c];
      n[f] = Gr(
        i,
        a,
        f,
        u[f],
        e,
        !Te(u, f)
      );
    }
  }
  return s;
}
function Gr(e, t, n, o, i, r) {
  const s = e[n];
  if (s != null) {
    const l = Te(s, "default");
    if (l && o === void 0) {
      const a = s.default;
      if (s.type !== Function && !s.skipFactory && be(a)) {
        const { propsDefaults: u } = i;
        if (n in u)
          o = u[n];
        else {
          const c = Fo(i);
          o = u[n] = a.call(
            null,
            t
          ), c();
        }
      } else
        o = a;
      i.ce && i.ce._setProp(n, o);
    }
    s[
      0
      /* shouldCast */
    ] && (r && !l ? o = !1 : s[
      1
      /* shouldCastTrue */
    ] && (o === "" || o === An(n)) && (o = !0));
  }
  return o;
}
const ch = /* @__PURE__ */ new WeakMap();
function Fu(e, t, n = !1) {
  const o = n ? ch : t.propsCache, i = o.get(e);
  if (i)
    return i;
  const r = e.props, s = {}, l = [];
  let a = !1;
  if (!be(e)) {
    const c = (f) => {
      a = !0;
      const [p, g] = Fu(f, t, !0);
      tt(s, p), g && l.push(...g);
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  if (!r && !a)
    return Ae(e) && o.set(e, Bn), Bn;
  if (ve(r))
    for (let c = 0; c < r.length; c++) {
      const f = bt(r[c]);
      al(f) && (s[f] = De);
    }
  else if (r)
    for (const c in r) {
      const f = bt(c);
      if (al(f)) {
        const p = r[c], g = s[f] = ve(p) || be(p) ? { type: p } : tt({}, p), _ = g.type;
        let C = !1, $ = !0;
        if (ve(_))
          for (let M = 0; M < _.length; ++M) {
            const D = _[M], x = be(D) && D.name;
            if (x === "Boolean") {
              C = !0;
              break;
            } else x === "String" && ($ = !1);
          }
        else
          C = be(_) && _.name === "Boolean";
        g[
          0
          /* shouldCast */
        ] = C, g[
          1
          /* shouldCastTrue */
        ] = $, (C || Te(g, "default")) && l.push(f);
      }
    }
  const u = [s, l];
  return Ae(e) && o.set(e, u), u;
}
function al(e) {
  return e[0] !== "$" && !go(e);
}
const Hu = (e) => e[0] === "_" || e === "$stable", Ts = (e) => ve(e) ? e.map(Pt) : [Pt(e)], dh = (e, t, n) => {
  if (t._n)
    return t;
  const o = cn((...i) => Ts(t(...i)), n);
  return o._c = !1, o;
}, Uu = (e, t, n) => {
  const o = e._ctx;
  for (const i in e) {
    if (Hu(i)) continue;
    const r = e[i];
    if (be(r))
      t[i] = dh(i, r, o);
    else if (r != null) {
      const s = Ts(r);
      t[i] = () => s;
    }
  }
}, ju = (e, t) => {
  const n = Ts(t);
  e.slots.default = () => n;
}, Gu = (e, t, n) => {
  for (const o in t)
    (n || o !== "_") && (e[o] = t[o]);
}, fh = (e, t, n) => {
  const o = e.slots = Vu();
  if (e.vnode.shapeFlag & 32) {
    const i = t._;
    i ? (Gu(o, t, n), n && Wa(o, "_", i, !0)) : Uu(t, o);
  } else t && ju(e, t);
}, hh = (e, t, n) => {
  const { vnode: o, slots: i } = e;
  let r = !0, s = De;
  if (o.shapeFlag & 32) {
    const l = t._;
    l ? n && l === 1 ? r = !1 : Gu(i, t, n) : (r = !t.$stable, Uu(t, i)), s = t;
  } else t && (ju(e, t), s = { default: 1 });
  if (r)
    for (const l in i)
      !Hu(l) && s[l] == null && delete i[l];
}, vt = Nh;
function ph(e) {
  return vh(e);
}
function vh(e, t) {
  const n = Vi();
  n.__VUE__ = !0;
  const {
    insert: o,
    remove: i,
    patchProp: r,
    createElement: s,
    createText: l,
    createComment: a,
    setText: u,
    setElementText: c,
    parentNode: f,
    nextSibling: p,
    setScopeId: g = Dt,
    insertStaticContent: _
  } = e, C = (d, k, v, m = null, y = null, b = null, I = void 0, B = null, U = !!k.dynamicChildren) => {
    if (d === k)
      return;
    d && !ro(d, k) && (m = he(d), te(d, y, b, !0), d = null), k.patchFlag === -2 && (U = !1, k.dynamicChildren = null);
    const { type: S, ref: J, shapeFlag: K } = k;
    switch (S) {
      case Gi:
        $(d, k, v, m);
        break;
      case fn:
        M(d, k, v, m);
        break;
      case ai:
        d == null && D(k, v, m, I);
        break;
      case ye:
        O(
          d,
          k,
          v,
          m,
          y,
          b,
          I,
          B,
          U
        );
        break;
      default:
        K & 1 ? H(
          d,
          k,
          v,
          m,
          y,
          b,
          I,
          B,
          U
        ) : K & 6 ? R(
          d,
          k,
          v,
          m,
          y,
          b,
          I,
          B,
          U
        ) : (K & 64 || K & 128) && S.process(
          d,
          k,
          v,
          m,
          y,
          b,
          I,
          B,
          U,
          ge
        );
    }
    J != null && y && wi(J, d && d.ref, b, k || d, !k);
  }, $ = (d, k, v, m) => {
    if (d == null)
      o(
        k.el = l(k.children),
        v,
        m
      );
    else {
      const y = k.el = d.el;
      k.children !== d.children && u(y, k.children);
    }
  }, M = (d, k, v, m) => {
    d == null ? o(
      k.el = a(k.children || ""),
      v,
      m
    ) : k.el = d.el;
  }, D = (d, k, v, m) => {
    [d.el, d.anchor] = _(
      d.children,
      k,
      v,
      m,
      d.el,
      d.anchor
    );
  }, x = ({ el: d, anchor: k }, v, m) => {
    let y;
    for (; d && d !== k; )
      y = p(d), o(d, v, m), d = y;
    o(k, v, m);
  }, w = ({ el: d, anchor: k }) => {
    let v;
    for (; d && d !== k; )
      v = p(d), i(d), d = v;
    i(k);
  }, H = (d, k, v, m, y, b, I, B, U) => {
    k.type === "svg" ? I = "svg" : k.type === "math" && (I = "mathml"), d == null ? L(
      k,
      v,
      m,
      y,
      b,
      I,
      B,
      U
    ) : N(
      d,
      k,
      y,
      b,
      I,
      B,
      U
    );
  }, L = (d, k, v, m, y, b, I, B) => {
    let U, S;
    const { props: J, shapeFlag: K, transition: ne, dirs: le } = d;
    if (U = d.el = s(
      d.type,
      b,
      J && J.is,
      J
    ), K & 8 ? c(U, d.children) : K & 16 && T(
      d.children,
      U,
      null,
      m,
      y,
      vr(d, b),
      I,
      B
    ), le && mn(d, null, m, "created"), z(U, d, d.scopeId, I, m), J) {
      for (const Ee in J)
        Ee !== "value" && !go(Ee) && r(U, Ee, null, J[Ee], b, m);
      "value" in J && r(U, "value", null, J.value, b), (S = J.onVnodeBeforeMount) && It(S, m, d);
    }
    le && mn(d, null, m, "beforeMount");
    const me = gh(y, ne);
    me && ne.beforeEnter(U), o(U, k, v), ((S = J && J.onVnodeMounted) || me || le) && vt(() => {
      S && It(S, m, d), me && ne.enter(U), le && mn(d, null, m, "mounted");
    }, y);
  }, z = (d, k, v, m, y) => {
    if (v && g(d, v), m)
      for (let b = 0; b < m.length; b++)
        g(d, m[b]);
    if (y) {
      let b = y.subTree;
      if (k === b || Zu(b.type) && (b.ssContent === k || b.ssFallback === k)) {
        const I = y.vnode;
        z(
          d,
          I,
          I.scopeId,
          I.slotScopeIds,
          y.parent
        );
      }
    }
  }, T = (d, k, v, m, y, b, I, B, U = 0) => {
    for (let S = U; S < d.length; S++) {
      const J = d[S] = B ? tn(d[S]) : Pt(d[S]);
      C(
        null,
        J,
        k,
        v,
        m,
        y,
        b,
        I,
        B
      );
    }
  }, N = (d, k, v, m, y, b, I) => {
    const B = k.el = d.el;
    let { patchFlag: U, dynamicChildren: S, dirs: J } = k;
    U |= d.patchFlag & 16;
    const K = d.props || De, ne = k.props || De;
    let le;
    if (v && yn(v, !1), (le = ne.onVnodeBeforeUpdate) && It(le, v, k, d), J && mn(k, d, v, "beforeUpdate"), v && yn(v, !0), (K.innerHTML && ne.innerHTML == null || K.textContent && ne.textContent == null) && c(B, ""), S ? V(
      d.dynamicChildren,
      S,
      B,
      v,
      m,
      vr(k, y),
      b
    ) : I || q(
      d,
      k,
      B,
      null,
      v,
      m,
      vr(k, y),
      b,
      !1
    ), U > 0) {
      if (U & 16)
        Z(B, K, ne, v, y);
      else if (U & 2 && K.class !== ne.class && r(B, "class", null, ne.class, y), U & 4 && r(B, "style", K.style, ne.style, y), U & 8) {
        const me = k.dynamicProps;
        for (let Ee = 0; Ee < me.length; Ee++) {
          const $e = me[Ee], nt = K[$e], ct = ne[$e];
          (ct !== nt || $e === "value") && r(B, $e, nt, ct, y, v);
        }
      }
      U & 1 && d.children !== k.children && c(B, k.children);
    } else !I && S == null && Z(B, K, ne, v, y);
    ((le = ne.onVnodeUpdated) || J) && vt(() => {
      le && It(le, v, k, d), J && mn(k, d, v, "updated");
    }, m);
  }, V = (d, k, v, m, y, b, I) => {
    for (let B = 0; B < k.length; B++) {
      const U = d[B], S = k[B], J = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        U.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (U.type === ye || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !ro(U, S) || // - In the case of a component, it could contain anything.
        U.shapeFlag & 70) ? f(U.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          v
        )
      );
      C(
        U,
        S,
        J,
        null,
        m,
        y,
        b,
        I,
        !0
      );
    }
  }, Z = (d, k, v, m, y) => {
    if (k !== v) {
      if (k !== De)
        for (const b in k)
          !go(b) && !(b in v) && r(
            d,
            b,
            k[b],
            null,
            y,
            m
          );
      for (const b in v) {
        if (go(b)) continue;
        const I = v[b], B = k[b];
        I !== B && b !== "value" && r(d, b, B, I, y, m);
      }
      "value" in v && r(d, "value", k.value, v.value, y);
    }
  }, O = (d, k, v, m, y, b, I, B, U) => {
    const S = k.el = d ? d.el : l(""), J = k.anchor = d ? d.anchor : l("");
    let { patchFlag: K, dynamicChildren: ne, slotScopeIds: le } = k;
    le && (B = B ? B.concat(le) : le), d == null ? (o(S, v, m), o(J, v, m), T(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      k.children || [],
      v,
      J,
      y,
      b,
      I,
      B,
      U
    )) : K > 0 && K & 64 && ne && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    d.dynamicChildren ? (V(
      d.dynamicChildren,
      ne,
      v,
      y,
      b,
      I,
      B
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (k.key != null || y && k === y.subTree) && Yu(
      d,
      k,
      !0
      /* shallow */
    )) : q(
      d,
      k,
      v,
      J,
      y,
      b,
      I,
      B,
      U
    );
  }, R = (d, k, v, m, y, b, I, B, U) => {
    k.slotScopeIds = B, d == null ? k.shapeFlag & 512 ? y.ctx.activate(
      k,
      v,
      m,
      I,
      U
    ) : E(
      k,
      v,
      m,
      y,
      b,
      I,
      U
    ) : A(d, k, U);
  }, E = (d, k, v, m, y, b, I) => {
    const B = d.component = Ph(
      d,
      m,
      y
    );
    if (xu(d) && (B.ctx.renderer = ge), Dh(B, !1, I), B.asyncDep) {
      if (y && y.registerDep(B, P, I), !d.el) {
        const U = B.subTree = re(fn);
        M(null, U, k, v);
      }
    } else
      P(
        B,
        d,
        k,
        v,
        y,
        b,
        I
      );
  }, A = (d, k, v) => {
    const m = k.component = d.component;
    if (Sh(d, k, v))
      if (m.asyncDep && !m.asyncResolved) {
        j(m, k, v);
        return;
      } else
        m.next = k, m.update();
    else
      k.el = d.el, m.vnode = k;
  }, P = (d, k, v, m, y, b, I) => {
    const B = () => {
      if (d.isMounted) {
        let { next: K, bu: ne, u: le, parent: me, vnode: Ee } = d;
        {
          const $t = Xu(d);
          if ($t) {
            K && (K.el = Ee.el, j(d, K, I)), $t.asyncDep.then(() => {
              d.isUnmounted || B();
            });
            return;
          }
        }
        let $e = K, nt;
        yn(d, !1), K ? (K.el = Ee.el, j(d, K, I)) : K = Ee, ne && si(ne), (nt = K.props && K.props.onVnodeBeforeUpdate) && It(nt, me, K, Ee), yn(d, !0);
        const ct = cl(d), Nt = d.subTree;
        d.subTree = ct, C(
          Nt,
          ct,
          // parent may have changed if it's in a teleport
          f(Nt.el),
          // anchor may have changed if it's in a fragment
          he(Nt),
          d,
          y,
          b
        ), K.el = ct.el, $e === null && Ch(d, ct.el), le && vt(le, y), (nt = K.props && K.props.onVnodeUpdated) && vt(
          () => It(nt, me, K, Ee),
          y
        );
      } else {
        let K;
        const { el: ne, props: le } = k, { bm: me, m: Ee, parent: $e, root: nt, type: ct } = d, Nt = jn(k);
        yn(d, !1), me && si(me), !Nt && (K = le && le.onVnodeBeforeMount) && It(K, $e, k), yn(d, !0);
        {
          nt.ce && nt.ce._injectChildStyle(ct);
          const $t = d.subTree = cl(d);
          C(
            null,
            $t,
            v,
            m,
            d,
            y,
            b
          ), k.el = $t.el;
        }
        if (Ee && vt(Ee, y), !Nt && (K = le && le.onVnodeMounted)) {
          const $t = k;
          vt(
            () => It(K, $e, $t),
            y
          );
        }
        (k.shapeFlag & 256 || $e && jn($e.vnode) && $e.vnode.shapeFlag & 256) && d.a && vt(d.a, y), d.isMounted = !0, k = v = m = null;
      }
    };
    d.scope.on();
    const U = d.effect = new tu(B);
    d.scope.off();
    const S = d.update = U.run.bind(U), J = d.job = U.runIfDirty.bind(U);
    J.i = d, J.id = d.uid, U.scheduler = () => Is(J), yn(d, !0), S();
  }, j = (d, k, v) => {
    k.component = d;
    const m = d.vnode.props;
    d.vnode = k, d.next = null, uh(d, k.props, m, v), hh(d, k.children, v), pn(), nl(d), vn();
  }, q = (d, k, v, m, y, b, I, B, U = !1) => {
    const S = d && d.children, J = d ? d.shapeFlag : 0, K = k.children, { patchFlag: ne, shapeFlag: le } = k;
    if (ne > 0) {
      if (ne & 128) {
        oe(
          S,
          K,
          v,
          m,
          y,
          b,
          I,
          B,
          U
        );
        return;
      } else if (ne & 256) {
        ee(
          S,
          K,
          v,
          m,
          y,
          b,
          I,
          B,
          U
        );
        return;
      }
    }
    le & 8 ? (J & 16 && W(S, y, b), K !== S && c(v, K)) : J & 16 ? le & 16 ? oe(
      S,
      K,
      v,
      m,
      y,
      b,
      I,
      B,
      U
    ) : W(S, y, b, !0) : (J & 8 && c(v, ""), le & 16 && T(
      K,
      v,
      m,
      y,
      b,
      I,
      B,
      U
    ));
  }, ee = (d, k, v, m, y, b, I, B, U) => {
    d = d || Bn, k = k || Bn;
    const S = d.length, J = k.length, K = Math.min(S, J);
    let ne;
    for (ne = 0; ne < K; ne++) {
      const le = k[ne] = U ? tn(k[ne]) : Pt(k[ne]);
      C(
        d[ne],
        le,
        v,
        null,
        y,
        b,
        I,
        B,
        U
      );
    }
    S > J ? W(
      d,
      y,
      b,
      !0,
      !1,
      K
    ) : T(
      k,
      v,
      m,
      y,
      b,
      I,
      B,
      U,
      K
    );
  }, oe = (d, k, v, m, y, b, I, B, U) => {
    let S = 0;
    const J = k.length;
    let K = d.length - 1, ne = J - 1;
    for (; S <= K && S <= ne; ) {
      const le = d[S], me = k[S] = U ? tn(k[S]) : Pt(k[S]);
      if (ro(le, me))
        C(
          le,
          me,
          v,
          null,
          y,
          b,
          I,
          B,
          U
        );
      else
        break;
      S++;
    }
    for (; S <= K && S <= ne; ) {
      const le = d[K], me = k[ne] = U ? tn(k[ne]) : Pt(k[ne]);
      if (ro(le, me))
        C(
          le,
          me,
          v,
          null,
          y,
          b,
          I,
          B,
          U
        );
      else
        break;
      K--, ne--;
    }
    if (S > K) {
      if (S <= ne) {
        const le = ne + 1, me = le < J ? k[le].el : m;
        for (; S <= ne; )
          C(
            null,
            k[S] = U ? tn(k[S]) : Pt(k[S]),
            v,
            me,
            y,
            b,
            I,
            B,
            U
          ), S++;
      }
    } else if (S > ne)
      for (; S <= K; )
        te(d[S], y, b, !0), S++;
    else {
      const le = S, me = S, Ee = /* @__PURE__ */ new Map();
      for (S = me; S <= ne; S++) {
        const pt = k[S] = U ? tn(k[S]) : Pt(k[S]);
        pt.key != null && Ee.set(pt.key, S);
      }
      let $e, nt = 0;
      const ct = ne - me + 1;
      let Nt = !1, $t = 0;
      const oo = new Array(ct);
      for (S = 0; S < ct; S++) oo[S] = 0;
      for (S = le; S <= K; S++) {
        const pt = d[S];
        if (nt >= ct) {
          te(pt, y, b, !0);
          continue;
        }
        let Mt;
        if (pt.key != null)
          Mt = Ee.get(pt.key);
        else
          for ($e = me; $e <= ne; $e++)
            if (oo[$e - me] === 0 && ro(pt, k[$e])) {
              Mt = $e;
              break;
            }
        Mt === void 0 ? te(pt, y, b, !0) : (oo[Mt - me] = S + 1, Mt >= $t ? $t = Mt : Nt = !0, C(
          pt,
          k[Mt],
          v,
          null,
          y,
          b,
          I,
          B,
          U
        ), nt++);
      }
      const Ks = Nt ? mh(oo) : Bn;
      for ($e = Ks.length - 1, S = ct - 1; S >= 0; S--) {
        const pt = me + S, Mt = k[pt], Zs = pt + 1 < J ? k[pt + 1].el : m;
        oo[S] === 0 ? C(
          null,
          Mt,
          v,
          Zs,
          y,
          b,
          I,
          B,
          U
        ) : Nt && ($e < 0 || S !== Ks[$e] ? ce(Mt, v, Zs, 2) : $e--);
      }
    }
  }, ce = (d, k, v, m, y = null) => {
    const { el: b, type: I, transition: B, children: U, shapeFlag: S } = d;
    if (S & 6) {
      ce(d.component.subTree, k, v, m);
      return;
    }
    if (S & 128) {
      d.suspense.move(k, v, m);
      return;
    }
    if (S & 64) {
      I.move(d, k, v, ge);
      return;
    }
    if (I === ye) {
      o(b, k, v);
      for (let K = 0; K < U.length; K++)
        ce(U[K], k, v, m);
      o(d.anchor, k, v);
      return;
    }
    if (I === ai) {
      x(d, k, v);
      return;
    }
    if (m !== 2 && S & 1 && B)
      if (m === 0)
        B.beforeEnter(b), o(b, k, v), vt(() => B.enter(b), y);
      else {
        const { leave: K, delayLeave: ne, afterLeave: le } = B, me = () => o(b, k, v), Ee = () => {
          K(b, () => {
            me(), le && le();
          });
        };
        ne ? ne(b, me, Ee) : Ee();
      }
    else
      o(b, k, v);
  }, te = (d, k, v, m = !1, y = !1) => {
    const {
      type: b,
      props: I,
      ref: B,
      children: U,
      dynamicChildren: S,
      shapeFlag: J,
      patchFlag: K,
      dirs: ne,
      cacheIndex: le
    } = d;
    if (K === -2 && (y = !1), B != null && wi(B, null, v, d, !0), le != null && (k.renderCache[le] = void 0), J & 256) {
      k.ctx.deactivate(d);
      return;
    }
    const me = J & 1 && ne, Ee = !jn(d);
    let $e;
    if (Ee && ($e = I && I.onVnodeBeforeUnmount) && It($e, k, d), J & 6)
      _e(d.component, v, m);
    else {
      if (J & 128) {
        d.suspense.unmount(v, m);
        return;
      }
      me && mn(d, null, k, "beforeUnmount"), J & 64 ? d.type.remove(
        d,
        k,
        v,
        ge,
        m
      ) : S && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !S.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (b !== ye || K > 0 && K & 64) ? W(
        S,
        k,
        v,
        !1,
        !0
      ) : (b === ye && K & 384 || !y && J & 16) && W(U, k, v), m && ae(d);
    }
    (Ee && ($e = I && I.onVnodeUnmounted) || me) && vt(() => {
      $e && It($e, k, d), me && mn(d, null, k, "unmounted");
    }, v);
  }, ae = (d) => {
    const { type: k, el: v, anchor: m, transition: y } = d;
    if (k === ye) {
      se(v, m);
      return;
    }
    if (k === ai) {
      w(d);
      return;
    }
    const b = () => {
      i(v), y && !y.persisted && y.afterLeave && y.afterLeave();
    };
    if (d.shapeFlag & 1 && y && !y.persisted) {
      const { leave: I, delayLeave: B } = y, U = () => I(v, b);
      B ? B(d.el, b, U) : U();
    } else
      b();
  }, se = (d, k) => {
    let v;
    for (; d !== k; )
      v = p(d), i(d), d = v;
    i(k);
  }, _e = (d, k, v) => {
    const { bum: m, scope: y, job: b, subTree: I, um: B, m: U, a: S } = d;
    ul(U), ul(S), m && si(m), y.stop(), b && (b.flags |= 8, te(I, d, k, v)), B && vt(B, k), vt(() => {
      d.isUnmounted = !0;
    }, k), k && k.pendingBranch && !k.isUnmounted && d.asyncDep && !d.asyncResolved && d.suspenseId === k.pendingId && (k.deps--, k.deps === 0 && k.resolve());
  }, W = (d, k, v, m = !1, y = !1, b = 0) => {
    for (let I = b; I < d.length; I++)
      te(d[I], k, v, m, y);
  }, he = (d) => {
    if (d.shapeFlag & 6)
      return he(d.component.subTree);
    if (d.shapeFlag & 128)
      return d.suspense.next();
    const k = p(d.anchor || d.el), v = k && k[Ff];
    return v ? p(v) : k;
  };
  let we = !1;
  const pe = (d, k, v) => {
    d == null ? k._vnode && te(k._vnode, null, null, !0) : C(
      k._vnode || null,
      d,
      k,
      null,
      null,
      null,
      v
    ), k._vnode = d, we || (we = !0, nl(), bu(), we = !1);
  }, ge = {
    p: C,
    um: te,
    m: ce,
    r: ae,
    mt: E,
    mc: T,
    pc: q,
    pbc: V,
    n: he,
    o: e
  };
  return {
    render: pe,
    hydrate: void 0,
    createApp: lh(pe)
  };
}
function vr({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function yn({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function gh(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Yu(e, t, n = !1) {
  const o = e.children, i = t.children;
  if (ve(o) && ve(i))
    for (let r = 0; r < o.length; r++) {
      const s = o[r];
      let l = i[r];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = i[r] = tn(i[r]), l.el = s.el), !n && l.patchFlag !== -2 && Yu(s, l)), l.type === Gi && (l.el = s.el);
    }
}
function mh(e) {
  const t = e.slice(), n = [0];
  let o, i, r, s, l;
  const a = e.length;
  for (o = 0; o < a; o++) {
    const u = e[o];
    if (u !== 0) {
      if (i = n[n.length - 1], e[i] < u) {
        t[o] = i, n.push(o);
        continue;
      }
      for (r = 0, s = n.length - 1; r < s; )
        l = r + s >> 1, e[n[l]] < u ? r = l + 1 : s = l;
      u < e[n[r]] && (r > 0 && (t[o] = n[r - 1]), n[r] = o);
    }
  }
  for (r = n.length, s = n[r - 1]; r-- > 0; )
    n[r] = s, s = t[s];
  return n;
}
function Xu(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Xu(t);
}
function ul(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const yh = Symbol.for("v-scx"), bh = () => At(yh);
function Se(e, t, n) {
  return qu(e, t, n);
}
function qu(e, t, n = De) {
  const { immediate: o, deep: i, flush: r, once: s } = n, l = tt({}, n), a = t && o || !t && r !== "post";
  let u;
  if ($o) {
    if (r === "sync") {
      const g = bh();
      u = g.__watcherHandles || (g.__watcherHandles = []);
    } else if (!a) {
      const g = () => {
      };
      return g.stop = Dt, g.resume = Dt, g.pause = Dt, g;
    }
  }
  const c = Je;
  l.call = (g, _, C) => Lt(g, c, _, C);
  let f = !1;
  r === "post" ? l.scheduler = (g) => {
    vt(g, c && c.suspense);
  } : r !== "sync" && (f = !0, l.scheduler = (g, _) => {
    _ ? g() : Is(g);
  }), l.augmentJob = (g) => {
    t && (g.flags |= 4), f && (g.flags |= 2, c && (g.id = c.uid, g.i = c));
  };
  const p = Lf(e, t, l);
  return $o && (u ? u.push(p) : a && p()), p;
}
function _h(e, t, n) {
  const o = this.proxy, i = Fe(e) ? e.includes(".") ? Wu(o, e) : () => o[e] : e.bind(o, o);
  let r;
  be(t) ? r = t : (r = t.handler, n = t);
  const s = Fo(this), l = qu(i, r.bind(o), n);
  return s(), l;
}
function Wu(e, t) {
  const n = t.split(".");
  return () => {
    let o = e;
    for (let i = 0; i < n.length && o; i++)
      o = o[n[i]];
    return o;
  };
}
const wh = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${bt(t)}Modifiers`] || e[`${An(t)}Modifiers`];
function Eh(e, t, ...n) {
  if (e.isUnmounted) return;
  const o = e.vnode.props || De;
  let i = n;
  const r = t.startsWith("update:"), s = r && wh(o, t.slice(7));
  s && (s.trim && (i = n.map((c) => Fe(c) ? c.trim() : c)), s.number && (i = n.map(gi)));
  let l, a = o[l = ar(t)] || // also try camelCase event handler (#2249)
  o[l = ar(bt(t))];
  !a && r && (a = o[l = ar(An(t))]), a && Lt(
    a,
    e,
    6,
    i
  );
  const u = o[l + "Once"];
  if (u) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[l])
      return;
    e.emitted[l] = !0, Lt(
      u,
      e,
      6,
      i
    );
  }
}
function Ku(e, t, n = !1) {
  const o = t.emitsCache, i = o.get(e);
  if (i !== void 0)
    return i;
  const r = e.emits;
  let s = {}, l = !1;
  if (!be(e)) {
    const a = (u) => {
      const c = Ku(u, t, !0);
      c && (l = !0, tt(s, c));
    };
    !n && t.mixins.length && t.mixins.forEach(a), e.extends && a(e.extends), e.mixins && e.mixins.forEach(a);
  }
  return !r && !l ? (Ae(e) && o.set(e, null), null) : (ve(r) ? r.forEach((a) => s[a] = null) : tt(s, r), Ae(e) && o.set(e, s), s);
}
function ji(e, t) {
  return !e || !Ai(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), Te(e, t[0].toLowerCase() + t.slice(1)) || Te(e, An(t)) || Te(e, t));
}
function cl(e) {
  const {
    type: t,
    vnode: n,
    proxy: o,
    withProxy: i,
    propsOptions: [r],
    slots: s,
    attrs: l,
    emit: a,
    render: u,
    renderCache: c,
    props: f,
    data: p,
    setupState: g,
    ctx: _,
    inheritAttrs: C
  } = e, $ = _i(e);
  let M, D;
  try {
    if (n.shapeFlag & 4) {
      const w = i || o, H = w;
      M = Pt(
        u.call(
          H,
          w,
          c,
          f,
          g,
          p,
          _
        )
      ), D = l;
    } else {
      const w = t;
      M = Pt(
        w.length > 1 ? w(
          f,
          { attrs: l, slots: s, emit: a }
        ) : w(
          f,
          null
        )
      ), D = t.props ? l : xh(l);
    }
  } catch (w) {
    _o.length = 0, Fi(w, e, 1), M = re(fn);
  }
  let x = M;
  if (D && C !== !1) {
    const w = Object.keys(D), { shapeFlag: H } = x;
    w.length && H & 7 && (r && w.some(ys) && (D = kh(
      D,
      r
    )), x = Kn(x, D, !1, !0));
  }
  return n.dirs && (x = Kn(x, null, !1, !0), x.dirs = x.dirs ? x.dirs.concat(n.dirs) : n.dirs), n.transition && Os(x, n.transition), M = x, _i($), M;
}
const xh = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Ai(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, kh = (e, t) => {
  const n = {};
  for (const o in e)
    (!ys(o) || !(o.slice(9) in t)) && (n[o] = e[o]);
  return n;
};
function Sh(e, t, n) {
  const { props: o, children: i, component: r } = e, { props: s, children: l, patchFlag: a } = t, u = r.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && a >= 0) {
    if (a & 1024)
      return !0;
    if (a & 16)
      return o ? dl(o, s, u) : !!s;
    if (a & 8) {
      const c = t.dynamicProps;
      for (let f = 0; f < c.length; f++) {
        const p = c[f];
        if (s[p] !== o[p] && !ji(u, p))
          return !0;
      }
    }
  } else
    return (i || l) && (!l || !l.$stable) ? !0 : o === s ? !1 : o ? s ? dl(o, s, u) : !0 : !!s;
  return !1;
}
function dl(e, t, n) {
  const o = Object.keys(t);
  if (o.length !== Object.keys(e).length)
    return !0;
  for (let i = 0; i < o.length; i++) {
    const r = o[i];
    if (t[r] !== e[r] && !ji(n, r))
      return !0;
  }
  return !1;
}
function Ch({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const o = t.subTree;
    if (o.suspense && o.suspense.activeBranch === e && (o.el = e.el), o === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const Zu = (e) => e.__isSuspense;
function Nh(e, t) {
  t && t.pendingBranch ? ve(e) ? t.effects.push(...e) : t.effects.push(e) : Bf(e);
}
const ye = Symbol.for("v-fgt"), Gi = Symbol.for("v-txt"), fn = Symbol.for("v-cmt"), ai = Symbol.for("v-stc"), _o = [];
let at = null;
function G(e = !1) {
  _o.push(at = e ? null : []);
}
function $h() {
  _o.pop(), at = _o[_o.length - 1] || null;
}
let Wn = 1;
function fl(e, t = !1) {
  Wn += e, e < 0 && at && t && (at.hasOnce = !0);
}
function Ju(e) {
  return e.dynamicChildren = Wn > 0 ? at || Bn : null, $h(), Wn > 0 && at && at.push(e), e;
}
function X(e, t, n, o, i, r) {
  return Ju(
    h(
      e,
      t,
      n,
      o,
      i,
      r,
      !0
    )
  );
}
function gt(e, t, n, o, i) {
  return Ju(
    re(
      e,
      t,
      n,
      o,
      i,
      !0
    )
  );
}
function No(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function ro(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Qu = ({ key: e }) => e ?? null, ui = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? Fe(e) || He(e) || be(e) ? { i: Ke, r: e, k: t, f: !!n } : e : null);
function h(e, t = null, n = null, o = 0, i = null, r = e === ye ? 0 : 1, s = !1, l = !1) {
  const a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Qu(t),
    ref: t && ui(t),
    scopeId: wu,
    slotScopeIds: null,
    children: n,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: r,
    patchFlag: o,
    dynamicProps: i,
    dynamicChildren: null,
    appContext: null,
    ctx: Ke
  };
  return l ? (Ps(a, n), r & 128 && e.normalize(a)) : n && (a.shapeFlag |= Fe(n) ? 8 : 16), Wn > 0 && // avoid a block node from tracking itself
  !s && // has current parent block
  at && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (a.patchFlag > 0 || r & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  a.patchFlag !== 32 && at.push(a), a;
}
const re = Mh;
function Mh(e, t = null, n = null, o = 0, i = null, r = !1) {
  if ((!e || e === $u) && (e = fn), No(e)) {
    const l = Kn(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Ps(l, n), Wn > 0 && !r && at && (l.shapeFlag & 6 ? at[at.indexOf(e)] = l : at.push(l)), l.patchFlag = -2, l;
  }
  if (Vh(e) && (e = e.__vccOpts), t) {
    t = ci(t);
    let { class: l, style: a } = t;
    l && !Fe(l) && (t.class = xe(l)), Ae(a) && (Ms(a) && !ve(a) && (a = tt({}, a)), t.style = ft(a));
  }
  const s = Fe(e) ? 1 : Zu(e) ? 128 : Hf(e) ? 64 : Ae(e) ? 4 : be(e) ? 2 : 0;
  return h(
    e,
    t,
    n,
    o,
    i,
    s,
    r,
    !0
  );
}
function ci(e) {
  return e ? Ms(e) || zu(e) ? tt({}, e) : e : null;
}
function Kn(e, t, n = !1, o = !1) {
  const { props: i, ref: r, patchFlag: s, children: l, transition: a } = e, u = t ? Ds(i || {}, t) : i, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: u,
    key: u && Qu(u),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && r ? ve(r) ? r.concat(ui(t)) : [r, ui(t)] : ui(t)
    ) : r,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: l,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== ye ? s === -1 ? 16 : s | 16 : s,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: a,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && Kn(e.ssContent),
    ssFallback: e.ssFallback && Kn(e.ssFallback),
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return a && o && Os(
    c,
    a.clone(c)
  ), c;
}
function Pe(e = " ", t = 0) {
  return re(Gi, null, e, t);
}
function Ih(e, t) {
  const n = re(ai, null, e);
  return n.staticCount = t, n;
}
function ke(e = "", t = !1) {
  return t ? (G(), gt(fn, null, e)) : re(fn, null, e);
}
function Pt(e) {
  return e == null || typeof e == "boolean" ? re(fn) : ve(e) ? re(
    ye,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : No(e) ? tn(e) : re(Gi, null, String(e));
}
function tn(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : Kn(e);
}
function Ps(e, t) {
  let n = 0;
  const { shapeFlag: o } = e;
  if (t == null)
    t = null;
  else if (ve(t))
    n = 16;
  else if (typeof t == "object")
    if (o & 65) {
      const i = t.default;
      i && (i._c && (i._d = !1), Ps(e, i()), i._c && (i._d = !0));
      return;
    } else {
      n = 32;
      const i = t._;
      !i && !zu(t) ? t._ctx = Ke : i === 3 && Ke && (Ke.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else be(t) ? (t = { default: t, _ctx: Ke }, n = 32) : (t = String(t), o & 64 ? (n = 16, t = [Pe(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Ds(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const o = e[n];
    for (const i in o)
      if (i === "class")
        t.class !== o.class && (t.class = xe([t.class, o.class]));
      else if (i === "style")
        t.style = ft([t.style, o.style]);
      else if (Ai(i)) {
        const r = t[i], s = o[i];
        s && r !== s && !(ve(r) && r.includes(s)) && (t[i] = r ? [].concat(r, s) : s);
      } else i !== "" && (t[i] = o[i]);
  }
  return t;
}
function It(e, t, n, o = null) {
  Lt(e, t, 7, [
    n,
    o
  ]);
}
const Oh = Ru();
let Th = 0;
function Ph(e, t, n) {
  const o = e.type, i = (t ? t.appContext : e.appContext) || Oh, r = {
    uid: Th++,
    vnode: e,
    type: o,
    parent: t,
    appContext: i,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new Qa(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(i.provides),
    ids: t ? t.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: Fu(o, i),
    emitsOptions: Ku(o, i),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: De,
    // inheritAttrs
    inheritAttrs: o.inheritAttrs,
    // state
    ctx: De,
    data: De,
    props: De,
    attrs: De,
    slots: De,
    refs: De,
    setupState: De,
    setupContext: null,
    // suspense related
    suspense: n,
    suspenseId: n ? n.pendingId : 0,
    asyncDep: null,
    asyncResolved: !1,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: !1,
    isUnmounted: !1,
    isDeactivated: !1,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  return r.ctx = { _: r }, r.root = t ? t.root : r, r.emit = Eh.bind(null, r), e.ce && e.ce(r), r;
}
let Je = null;
const no = () => Je || Ke;
let xi, Yr;
{
  const e = Vi(), t = (n, o) => {
    let i;
    return (i = e[n]) || (i = e[n] = []), i.push(o), (r) => {
      i.length > 1 ? i.forEach((s) => s(r)) : i[0](r);
    };
  };
  xi = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => Je = n
  ), Yr = t(
    "__VUE_SSR_SETTERS__",
    (n) => $o = n
  );
}
const Fo = (e) => {
  const t = Je;
  return xi(e), e.scope.on(), () => {
    e.scope.off(), xi(t);
  };
}, hl = () => {
  Je && Je.scope.off(), xi(null);
};
function ec(e) {
  return e.vnode.shapeFlag & 4;
}
let $o = !1;
function Dh(e, t = !1, n = !1) {
  t && Yr(t);
  const { props: o, children: i } = e.vnode, r = ec(e);
  ah(e, o, r, t), fh(e, i, n);
  const s = r ? Ah(e, t) : void 0;
  return t && Yr(!1), s;
}
function Ah(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Jf);
  const { setup: o } = n;
  if (o) {
    pn();
    const i = e.setupContext = o.length > 1 ? nc(e) : null, r = Fo(e), s = Bo(
      o,
      e,
      0,
      [
        e.props,
        i
      ]
    ), l = Ya(s);
    if (vn(), r(), (l || e.sp) && !jn(e) && Eu(e), l) {
      if (s.then(hl, hl), t)
        return s.then((a) => {
          pl(e, a);
        }).catch((a) => {
          Fi(a, e, 0);
        });
      e.asyncDep = s;
    } else
      pl(e, s);
  } else
    tc(e);
}
function pl(e, t, n) {
  be(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : Ae(t) && (e.setupState = vu(t)), tc(e);
}
function tc(e, t, n) {
  const o = e.type;
  e.render || (e.render = o.render || Dt);
  {
    const i = Fo(e);
    pn();
    try {
      th(e);
    } finally {
      vn(), i();
    }
  }
}
const Rh = {
  get(e, t) {
    return Qe(e, "get", ""), e[t];
  }
};
function nc(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, Rh),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function Yi(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(vu(Cn(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in bo)
        return bo[n](e);
    },
    has(t, n) {
      return n in t || n in bo;
    }
  })) : e.proxy;
}
function Lh(e, t = !0) {
  return be(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Vh(e) {
  return be(e) && "__vccOpts" in e;
}
const de = (e, t) => Af(e, t, $o);
function Ie(e, t, n) {
  const o = arguments.length;
  return o === 2 ? Ae(t) && !ve(t) ? No(t) ? re(e, null, [t]) : re(e, t) : re(e, null, t) : (o > 3 ? n = Array.prototype.slice.call(arguments, 2) : o === 3 && No(n) && (n = [n]), re(e, t, n));
}
function zh(e, t) {
  const n = e.memo;
  if (n.length != t.length)
    return !1;
  for (let o = 0; o < n.length; o++)
    if (Xt(n[o], t[o]))
      return !1;
  return Wn > 0 && at && at.push(e), !0;
}
const Bh = "3.5.13";
/**
* @vue/runtime-dom v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Xr;
const vl = typeof window < "u" && window.trustedTypes;
if (vl)
  try {
    Xr = /* @__PURE__ */ vl.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const oc = Xr ? (e) => Xr.createHTML(e) : (e) => e, Fh = "http://www.w3.org/2000/svg", Hh = "http://www.w3.org/1998/Math/MathML", Ft = typeof document < "u" ? document : null, gl = Ft && /* @__PURE__ */ Ft.createElement("template"), Uh = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, o) => {
    const i = t === "svg" ? Ft.createElementNS(Fh, e) : t === "mathml" ? Ft.createElementNS(Hh, e) : n ? Ft.createElement(e, { is: n }) : Ft.createElement(e);
    return e === "select" && o && o.multiple != null && i.setAttribute("multiple", o.multiple), i;
  },
  createText: (e) => Ft.createTextNode(e),
  createComment: (e) => Ft.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Ft.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, n, o, i, r) {
    const s = n ? n.previousSibling : t.lastChild;
    if (i && (i === r || i.nextSibling))
      for (; t.insertBefore(i.cloneNode(!0), n), !(i === r || !(i = i.nextSibling)); )
        ;
    else {
      gl.innerHTML = oc(
        o === "svg" ? `<svg>${e}</svg>` : o === "mathml" ? `<math>${e}</math>` : e
      );
      const l = gl.content;
      if (o === "svg" || o === "mathml") {
        const a = l.firstChild;
        for (; a.firstChild; )
          l.appendChild(a.firstChild);
        l.removeChild(a);
      }
      t.insertBefore(l, n);
    }
    return [
      // first
      s ? s.nextSibling : t.firstChild,
      // last
      n ? n.previousSibling : t.lastChild
    ];
  }
}, jh = Symbol("_vtc");
function Gh(e, t, n) {
  const o = e[jh];
  o && (t = (t ? [t, ...o] : [...o]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const ml = Symbol("_vod"), Yh = Symbol("_vsh"), Xh = Symbol(""), qh = /(^|;)\s*display\s*:/;
function Wh(e, t, n) {
  const o = e.style, i = Fe(n);
  let r = !1;
  if (n && !i) {
    if (t)
      if (Fe(t))
        for (const s of t.split(";")) {
          const l = s.slice(0, s.indexOf(":")).trim();
          n[l] == null && di(o, l, "");
        }
      else
        for (const s in t)
          n[s] == null && di(o, s, "");
    for (const s in n)
      s === "display" && (r = !0), di(o, s, n[s]);
  } else if (i) {
    if (t !== n) {
      const s = o[Xh];
      s && (n += ";" + s), o.cssText = n, r = qh.test(n);
    }
  } else t && e.removeAttribute("style");
  ml in e && (e[ml] = r ? o.display : "", e[Yh] && (o.display = "none"));
}
const yl = /\s*!important$/;
function di(e, t, n) {
  if (ve(n))
    n.forEach((o) => di(e, t, o));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const o = Kh(e, t);
    yl.test(n) ? e.setProperty(
      An(o),
      n.replace(yl, ""),
      "important"
    ) : e[o] = n;
  }
}
const bl = ["Webkit", "Moz", "ms"], gr = {};
function Kh(e, t) {
  const n = gr[t];
  if (n)
    return n;
  let o = bt(t);
  if (o !== "filter" && o in e)
    return gr[t] = o;
  o = Li(o);
  for (let i = 0; i < bl.length; i++) {
    const r = bl[i] + o;
    if (r in e)
      return gr[t] = r;
  }
  return t;
}
const _l = "http://www.w3.org/1999/xlink";
function wl(e, t, n, o, i, r = of(t)) {
  o && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(_l, t.slice(6, t.length)) : e.setAttributeNS(_l, t, n) : n == null || r && !Ka(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    r ? "" : kt(n) ? String(n) : n
  );
}
function El(e, t, n, o, i) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? oc(n) : n);
    return;
  }
  const r = e.tagName;
  if (t === "value" && r !== "PROGRESS" && // custom elements may use _value internally
  !r.includes("-")) {
    const l = r === "OPTION" ? e.getAttribute("value") || "" : e.value, a = n == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(n);
    (l !== a || !("_value" in e)) && (e.value = a), n == null && e.removeAttribute(t), e._value = n;
    return;
  }
  let s = !1;
  if (n === "" || n == null) {
    const l = typeof e[t];
    l === "boolean" ? n = Ka(n) : n == null && l === "string" ? (n = "", s = !0) : l === "number" && (n = 0, s = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  s && e.removeAttribute(i || t);
}
function rn(e, t, n, o) {
  e.addEventListener(t, n, o);
}
function Zh(e, t, n, o) {
  e.removeEventListener(t, n, o);
}
const xl = Symbol("_vei");
function Jh(e, t, n, o, i = null) {
  const r = e[xl] || (e[xl] = {}), s = r[t];
  if (o && s)
    s.value = o;
  else {
    const [l, a] = Qh(t);
    if (o) {
      const u = r[t] = np(
        o,
        i
      );
      rn(e, l, u, a);
    } else s && (Zh(e, l, s, a), r[t] = void 0);
  }
}
const kl = /(?:Once|Passive|Capture)$/;
function Qh(e) {
  let t;
  if (kl.test(e)) {
    t = {};
    let o;
    for (; o = e.match(kl); )
      e = e.slice(0, e.length - o[0].length), t[o[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : An(e.slice(2)), t];
}
let mr = 0;
const ep = /* @__PURE__ */ Promise.resolve(), tp = () => mr || (ep.then(() => mr = 0), mr = Date.now());
function np(e, t) {
  const n = (o) => {
    if (!o._vts)
      o._vts = Date.now();
    else if (o._vts <= n.attached)
      return;
    Lt(
      op(o, n.value),
      t,
      5,
      [o]
    );
  };
  return n.value = e, n.attached = tp(), n;
}
function op(e, t) {
  if (ve(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (o) => (i) => !i._stopped && o && o(i)
    );
  } else
    return t;
}
const Sl = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, ip = (e, t, n, o, i, r) => {
  const s = i === "svg";
  t === "class" ? Gh(e, o, s) : t === "style" ? Wh(e, n, o) : Ai(t) ? ys(t) || Jh(e, t, n, o, r) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : rp(e, t, o, s)) ? (El(e, t, o), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && wl(e, t, o, s, r, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !Fe(o)) ? El(e, bt(t), o, r, t) : (t === "true-value" ? e._trueValue = o : t === "false-value" && (e._falseValue = o), wl(e, t, o, s));
};
function rp(e, t, n, o) {
  if (o)
    return !!(t === "innerHTML" || t === "textContent" || t in e && Sl(t) && be(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const i = e.tagName;
    if (i === "IMG" || i === "VIDEO" || i === "CANVAS" || i === "SOURCE")
      return !1;
  }
  return Sl(t) && Fe(n) ? !1 : t in e;
}
const Zn = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return ve(t) ? (n) => si(t, n) : t;
};
function sp(e) {
  e.target.composing = !0;
}
function Cl(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const qt = Symbol("_assign"), it = {
  created(e, { modifiers: { lazy: t, trim: n, number: o } }, i) {
    e[qt] = Zn(i);
    const r = o || i.props && i.props.type === "number";
    rn(e, t ? "change" : "input", (s) => {
      if (s.target.composing) return;
      let l = e.value;
      n && (l = l.trim()), r && (l = gi(l)), e[qt](l);
    }), n && rn(e, "change", () => {
      e.value = e.value.trim();
    }), t || (rn(e, "compositionstart", sp), rn(e, "compositionend", Cl), rn(e, "change", Cl));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: o, trim: i, number: r } }, s) {
    if (e[qt] = Zn(s), e.composing) return;
    const l = (r || e.type === "number") && !/^0\d/.test(e.value) ? gi(e.value) : e.value, a = t ?? "";
    l !== a && (document.activeElement === e && e.type !== "range" && (o && t === n || i && e.value.trim() === a) || (e.value = a));
  }
}, lp = {
  // #4096 array checkboxes need to be deep traversed
  deep: !0,
  created(e, t, n) {
    e[qt] = Zn(n), rn(e, "change", () => {
      const o = e._modelValue, i = Mo(e), r = e.checked, s = e[qt];
      if (ve(o)) {
        const l = ws(o, i), a = l !== -1;
        if (r && !a)
          s(o.concat(i));
        else if (!r && a) {
          const u = [...o];
          u.splice(l, 1), s(u);
        }
      } else if (to(o)) {
        const l = new Set(o);
        r ? l.add(i) : l.delete(i), s(l);
      } else
        s(ic(e, r));
    });
  },
  // set initial checked on mount to wait for true-value/false-value
  mounted: Nl,
  beforeUpdate(e, t, n) {
    e[qt] = Zn(n), Nl(e, t, n);
  }
};
function Nl(e, { value: t, oldValue: n }, o) {
  e._modelValue = t;
  let i;
  if (ve(t))
    i = ws(t, o.props.value) > -1;
  else if (to(t))
    i = t.has(o.props.value);
  else {
    if (t === n) return;
    i = zo(t, ic(e, !0));
  }
  e.checked !== i && (e.checked = i);
}
const ki = {
  // <select multiple> value need to be deep traversed
  deep: !0,
  created(e, { value: t, modifiers: { number: n } }, o) {
    const i = to(t);
    rn(e, "change", () => {
      const r = Array.prototype.filter.call(e.options, (s) => s.selected).map(
        (s) => n ? gi(Mo(s)) : Mo(s)
      );
      e[qt](
        e.multiple ? i ? new Set(r) : r : r[0]
      ), e._assigning = !0, Ze(() => {
        e._assigning = !1;
      });
    }), e[qt] = Zn(o);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(e, { value: t }) {
    $l(e, t);
  },
  beforeUpdate(e, t, n) {
    e[qt] = Zn(n);
  },
  updated(e, { value: t }) {
    e._assigning || $l(e, t);
  }
};
function $l(e, t) {
  const n = e.multiple, o = ve(t);
  if (!(n && !o && !to(t))) {
    for (let i = 0, r = e.options.length; i < r; i++) {
      const s = e.options[i], l = Mo(s);
      if (n)
        if (o) {
          const a = typeof l;
          a === "string" || a === "number" ? s.selected = t.some((u) => String(u) === String(l)) : s.selected = ws(t, l) > -1;
        } else
          s.selected = t.has(l);
      else if (zo(Mo(s), t)) {
        e.selectedIndex !== i && (e.selectedIndex = i);
        return;
      }
    }
    !n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
  }
}
function Mo(e) {
  return "_value" in e ? e._value : e.value;
}
function ic(e, t) {
  const n = t ? "_trueValue" : "_falseValue";
  return n in e ? e[n] : t;
}
const ap = ["ctrl", "shift", "alt", "meta"], up = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, t) => ap.some((n) => e[`${n}Key`] && !t.includes(n))
}, Io = (e, t) => {
  const n = e._withMods || (e._withMods = {}), o = t.join(".");
  return n[o] || (n[o] = (i, ...r) => {
    for (let s = 0; s < t.length; s++) {
      const l = up[t[s]];
      if (l && l(i, t)) return;
    }
    return e(i, ...r);
  });
}, cp = /* @__PURE__ */ tt({ patchProp: ip }, Uh);
let Ml;
function dp() {
  return Ml || (Ml = ph(cp));
}
const Xi = (...e) => {
  const t = dp().createApp(...e), { mount: n } = t;
  return t.mount = (o) => {
    const i = hp(o);
    if (!i) return;
    const r = t._component;
    !be(r) && !r.render && !r.template && (r.template = i.innerHTML), i.nodeType === 1 && (i.textContent = "");
    const s = n(i, !1, fp(i));
    return i instanceof Element && (i.removeAttribute("v-cloak"), i.setAttribute("data-v-app", "")), s;
  }, t;
};
function fp(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function hp(e) {
  return Fe(e) ? document.querySelector(e) : e;
}
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pp = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var Wo = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const vp = ({ size: e, strokeWidth: t = 2, absoluteStrokeWidth: n, color: o, iconNode: i, name: r, class: s, ...l }, { slots: a }) => Ie(
  "svg",
  {
    ...Wo,
    width: e || Wo.width,
    height: e || Wo.height,
    stroke: o || Wo.stroke,
    "stroke-width": n ? Number(t) * 24 / Number(e) : t,
    class: ["lucide", `lucide-${pp(r ?? "icon")}`],
    ...l
  },
  [...i.map((u) => Ie(...u)), ...a.default ? [a.default()] : []]
);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ne = (e, t) => (n, { slots: o }) => Ie(
  vp,
  {
    ...n,
    iconNode: t,
    name: e
  },
  o
);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gp = Ne("BotIcon", [
  ["path", { d: "M12 8V4H8", key: "hb8ula" }],
  ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" }],
  ["path", { d: "M2 14h2", key: "vft8re" }],
  ["path", { d: "M20 14h2", key: "4cs60a" }],
  ["path", { d: "M15 13v2", key: "1xurst" }],
  ["path", { d: "M9 13v2", key: "rq6x2g" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const mp = Ne("BrainIcon", [
  [
    "path",
    {
      d: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",
      key: "l5xja"
    }
  ],
  [
    "path",
    {
      d: "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",
      key: "ep3f8r"
    }
  ],
  ["path", { d: "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4", key: "1p4c4q" }],
  ["path", { d: "M17.599 6.5a3 3 0 0 0 .399-1.375", key: "tmeiqw" }],
  ["path", { d: "M6.003 5.125A3 3 0 0 0 6.401 6.5", key: "105sqy" }],
  ["path", { d: "M3.477 10.896a4 4 0 0 1 .585-.396", key: "ql3yin" }],
  ["path", { d: "M19.938 10.5a4 4 0 0 1 .585.396", key: "1qfode" }],
  ["path", { d: "M6 18a4 4 0 0 1-1.967-.516", key: "2e4loj" }],
  ["path", { d: "M19.967 17.484A4 4 0 0 1 18 18", key: "159ez6" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const yp = Ne("ChartColumnIcon", [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const bp = Ne("CheckIcon", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const _p = Ne("ChevronDownIcon", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wp = Ne("DatabaseIcon", [
  ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
  ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
  ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const rc = Ne("DownloadIcon", [
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["polyline", { points: "7 10 12 15 17 10", key: "2ggqvy" }],
  ["line", { x1: "12", x2: "12", y1: "15", y2: "3", key: "1vk2je" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Il = Ne("ExternalLinkIcon", [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ol = Ne("EyeIcon", [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const sc = Ne("FolderOpenIcon", [
  [
    "path",
    {
      d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
      key: "usdka0"
    }
  ]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ep = Ne("LayersIcon", [
  [
    "path",
    {
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }
  ],
  [
    "path",
    {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }
  ],
  [
    "path",
    {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }
  ]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const xp = Ne("Maximize2Icon", [
  ["polyline", { points: "15 3 21 3 21 9", key: "mznyad" }],
  ["polyline", { points: "9 21 3 21 3 15", key: "1avn1i" }],
  ["line", { x1: "21", x2: "14", y1: "3", y2: "10", key: "ota7mn" }],
  ["line", { x1: "3", x2: "10", y1: "21", y2: "14", key: "1atl0r" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const kp = Ne("MicVocalIcon", [
  [
    "path",
    {
      d: "m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12",
      key: "80a601"
    }
  ],
  [
    "path",
    {
      d: "M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5",
      key: "j0ngtp"
    }
  ],
  ["circle", { cx: "16", cy: "7", r: "5", key: "d08jfb" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Sp = Ne("MinusIcon", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Cp = Ne("PenLineIcon", [
  ["path", { d: "M12 20h9", key: "t2du7b" }],
  [
    "path",
    {
      d: "M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",
      key: "1ykcvy"
    }
  ]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const lc = Ne("PlayIcon", [
  ["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Np = Ne("PlugIcon", [
  ["path", { d: "M12 22v-5", key: "1ega77" }],
  ["path", { d: "M9 8V2", key: "14iosj" }],
  ["path", { d: "M15 8V2", key: "18g5xt" }],
  ["path", { d: "M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z", key: "osxo6l" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const co = Ne("PlusIcon", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const $p = Ne("PuzzleIcon", [
  [
    "path",
    {
      d: "M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z",
      key: "w46dr5"
    }
  ]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const qr = Ne("RefreshCwIcon", [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ac = Ne("RotateCcwIcon", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Wr = Ne("SaveIcon", [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mp = Ne("ScanFaceIcon", [
  ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
  ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
  ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
  ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }],
  ["path", { d: "M8 14s1.5 2 4 2 4-2 4-2", key: "1y1vjs" }],
  ["path", { d: "M9 9h.01", key: "1q5me6" }],
  ["path", { d: "M15 9h.01", key: "x1ddxp" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ip = Ne("ScanSearchIcon", [
  ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
  ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
  ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
  ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
  ["path", { d: "m16 16-1.9-1.9", key: "1dq9hf" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Kr = Ne("SearchIcon", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Op = Ne("ShieldCheckIcon", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wo = Ne("Trash2Icon", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Tp = Ne("Undo2Icon", [
  ["path", { d: "M9 14 4 9l5-5", key: "102s5s" }],
  ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11", key: "f3b9sd" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Zr = Ne("UploadIcon", [
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["polyline", { points: "17 8 12 3 7 8", key: "t8dd8p" }],
  ["line", { x1: "12", x2: "12", y1: "3", y2: "15", key: "widbto" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Jr = Ne("UserRoundIcon", [
  ["circle", { cx: "12", cy: "8", r: "5", key: "1hypcn" }],
  ["path", { d: "M20 21a8 8 0 0 0-16 0", key: "rfgkzh" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pp = Ne("WrenchIcon", [
  [
    "path",
    {
      d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
      key: "cbrjhi"
    }
  ]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Tl = Ne("XIcon", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function qe(e) {
  return JSON.parse(JSON.stringify(e));
}
async function ut(e, t) {
  const n = await fetch(e, t), o = await n.json().catch(() => null);
  if (!n.ok) throw new Error((o == null ? void 0 : o.detail) || `请求失败 (${n.status})`);
  return o;
}
function yr() {
  return ut("/api/personas", { cache: "no-store" });
}
function uc(e) {
  return ut(`/api/personas/${encodeURIComponent(e)}/documents`, { cache: "no-store" });
}
async function cc() {
  return (await ut("/api/live2d/models", { cache: "no-store" })).models;
}
async function Dp() {
  await ut("/api/live2d/model-directory", {
    method: "POST",
    headers: { "X-YUMENO-Request": "web" }
  });
}
async function Pl(e) {
  const [t, n, o, i, r, s] = await Promise.all([
    ut(`/api/personas/${encodeURIComponent(e.id)}/capabilities`, { cache: "no-store" }),
    ut(`/api/personas/${encodeURIComponent(e.id)}/mcp-grants`, { cache: "no-store" }),
    uc(e.id),
    ut("/api/mcp/servers", { cache: "no-store" }).catch(() => []),
    cc().then((a) => ({ models: a })).catch(() => ({ models: [] })),
    ut("/api/voice-assets", { cache: "no-store" }).catch(() => ({ items: [] }))
  ]), l = new Map(i.map((a) => [a.name, a.status]));
  return {
    persona: qe(e),
    documents: o,
    capabilities: t,
    grants: { servers: n.servers.map((a) => ({ ...a, status: l.get(a.name) || { status: a.enabled ? "unknown" : "disabled" } })) },
    resources: { live2dModels: r.models, voiceAssets: s.items.filter((a) => a.status === "ready") }
  };
}
async function Ap(e) {
  await ut(`/api/personas/${encodeURIComponent(e.id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: e.name, profile: e.profile || {} })
  });
}
async function Rp(e, t) {
  await ut(`/api/personas/${encodeURIComponent(e)}/capabilities`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ overrides: t })
  });
}
async function Lp(e, t) {
  const n = t.filter((o) => o.authorized && !o.global).map((o) => o.name);
  await ut(`/api/personas/${encodeURIComponent(e)}/mcp-grants`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ server_names: n })
  });
}
async function Vp(e) {
  await ut(`/api/personas/${encodeURIComponent(e)}`, { method: "DELETE" });
}
async function zp(e, t, n) {
  if (!e.knowledge_space_id) throw new Error("角色知识空间不可用");
  const o = new FormData();
  t.forEach((r) => o.append("files", r)), n.trim() && o.append("files", new File([n.trim()], `text-${Date.now()}.txt`, { type: "text/plain;charset=utf-8" }));
  const i = await ut(`/api/knowledge-spaces/${encodeURIComponent(e.knowledge_space_id)}/documents/upload`, { method: "POST", body: o });
  await Promise.all(i.map((r) => ut(`/api/documents/${encodeURIComponent(r.id)}/confirm`, { method: "POST" })));
}
async function Bp(e) {
  var n;
  const t = await fetch(`/api/documents/${encodeURIComponent(e)}`, { method: "DELETE" });
  if (!t.ok) throw new Error(((n = await t.json().catch(() => null)) == null ? void 0 : n.detail) || `删除失败 (${t.status})`);
}
async function Fp(e) {
  await ut(`/api/documents/${encodeURIComponent(e)}/retry-index`, { method: "POST" });
}
async function Hp(e, t) {
  var i;
  const n = {
    zh: "你好，这是我的声音。很高兴认识你。",
    ja: "こんにちは、これは私の声です。お会いできてうれしいです。",
    en: "Hello, this is my voice. Nice to meet you.",
    auto: "こんにちは、这是我的声音。Hello!"
  }, o = await fetch(`/api/voice-assets/${encodeURIComponent(e)}/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
    body: JSON.stringify({ text: n[t] || n.auto, text_lang: t })
  });
  if (!o.ok) throw new Error(((i = await o.json().catch(() => null)) == null ? void 0 : i.detail) || "试听失败");
  return o.blob();
}
const Up = [
  { id: "profile", label: "设定", summary: () => "编辑角色设定" },
  { id: "memory", label: "记忆", summary: () => "会话与长期记忆" },
  { id: "rag", label: "知识库", summary: (e) => `${e.documents.length} 份资料` },
  { id: "voice", label: "声音", summary: (e) => {
    var t, n;
    return (n = (t = e.persona.profile) == null ? void 0 : t.tts) != null && n.voice_asset_id ? "已绑定角色音色" : "未绑定角色音色";
  } },
  { id: "live2d", label: "Live2D", summary: (e) => {
    var t, n;
    return (n = (t = e.persona.profile) == null ? void 0 : t.live2d) != null && n.model ? "已绑定模型" : "未绑定模型";
  } },
  { id: "extensions", label: "扩展能力", summary: (e) => `${e.capabilities.packages.length} 项 Skill 与 Tool` }
];
function jp(e) {
  return ["available", "partial", "unassigned", "blocked", "pending", "error"].includes(e) ? e : "blocked";
}
function so(e, t, n) {
  return { id: e, type: t, position: { x: 0, y: 0 }, data: n };
}
function Gp(e) {
  var r, s;
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = `persona:${e.persona.id}`, i = "module:extensions";
  t.set(o, so(o, "persona", { kind: "persona", label: e.persona.name, summary: String(((r = e.persona.profile) == null ? void 0 : r.description) || "尚未填写人设"), status: "available", level: 0 }));
  for (const l of Up) {
    const a = `module:${l.id}`;
    t.set(a, so(a, "module", { kind: l.id, label: l.label, summary: l.summary(e), status: "available", level: 0 }));
    const u = l.id === "extensions";
    n.set(`${o}->${a}`, { id: `${o}->${a}`, source: o, target: a, sourceHandle: u ? "right-source" : "left-source", targetHandle: u ? "left-target" : "right-target" });
  }
  for (const l of e.capabilities.packages) {
    const a = l.kind === "skill" ? "skill" : "tool", u = e.capabilities.overrides[l.id], c = u === void 0 ? l.assigned : u, f = u === !1 ? "blocked" : u === !0 && l.status === "unassigned" ? "available" : l.status;
    t.set(l.id, so(l.id, "capability", {
      kind: a,
      label: l.name,
      summary: l.description || l.reason || "能力包",
      status: jp(f),
      level: l.level,
      assigned: c,
      configurable: !0,
      sourceId: l.id
    })), n.set(`${i}->${l.id}`, { id: `${i}->${l.id}`, source: i, target: l.id, sourceHandle: "right-source", targetHandle: "left-target" });
    for (const p of l.dependencies || []) {
      if (!p.id) continue;
      const g = e.capabilities.overrides[p.id], _ = g === void 0 ? p.effective : g;
      if (t.set(p.id, so(p.id, "capability", {
        kind: "tool",
        label: p.name,
        summary: p.server ? `MCP · ${p.server}` : p.source,
        status: _ ? "available" : "blocked",
        level: p.level,
        assigned: _,
        configurable: !1,
        sourceId: p.id
      })), n.set(`${l.id}->${p.id}`, { id: `${l.id}->${p.id}`, source: l.id, target: p.id, sourceHandle: "right-source", targetHandle: "left-target" }), p.server) {
        const C = `mcp:${p.server}`, $ = e.grants.servers.find((D) => D.name === p.server), M = ((s = $ == null ? void 0 : $.status) == null ? void 0 : s.status) === "connected";
        t.set(C, so(C, "capability", {
          kind: "mcp",
          label: p.server,
          summary: ($ == null ? void 0 : $.description) || "MCP 服务",
          status: $ != null && $.authorized && M ? "available" : "blocked",
          level: p.level,
          assigned: !!($ != null && $.authorized),
          configurable: !!($ && !$.global),
          sourceId: p.server
        })), n.set(`${p.id}->${C}`, { id: `${p.id}->${C}`, source: p.id, target: C, sourceHandle: "right-source", targetHandle: "left-target" });
      }
    }
  }
  return { nodes: [...t.values()], edges: [...n.values()] };
}
function Yp(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Xp = "\0", bn = "\0", Dl = "";
let qp = class {
  constructor(t) {
    Ue(this, "_isDirected", !0);
    Ue(this, "_isMultigraph", !1);
    Ue(this, "_isCompound", !1);
    // Label for the graph itself
    Ue(this, "_label");
    // Defaults to be set when creating a new node
    Ue(this, "_defaultNodeLabelFn", () => {
    });
    // Defaults to be set when creating a new edge
    Ue(this, "_defaultEdgeLabelFn", () => {
    });
    // v -> label
    Ue(this, "_nodes", {});
    // v -> edgeObj
    Ue(this, "_in", {});
    // u -> v -> Number
    Ue(this, "_preds", {});
    // v -> edgeObj
    Ue(this, "_out", {});
    // v -> w -> Number
    Ue(this, "_sucs", {});
    // e -> edgeObj
    Ue(this, "_edgeObjs", {});
    // e -> label
    Ue(this, "_edgeLabels", {});
    /* Number of nodes in the graph. Should only be changed by the implementation. */
    Ue(this, "_nodeCount", 0);
    /* Number of edges in the graph. Should only be changed by the implementation. */
    Ue(this, "_edgeCount", 0);
    Ue(this, "_parent");
    Ue(this, "_children");
    t && (this._isDirected = Object.hasOwn(t, "directed") ? t.directed : !0, this._isMultigraph = Object.hasOwn(t, "multigraph") ? t.multigraph : !1, this._isCompound = Object.hasOwn(t, "compound") ? t.compound : !1), this._isCompound && (this._parent = {}, this._children = {}, this._children[bn] = {});
  }
  /* === Graph functions ========= */
  /**
   * Whether graph was created with 'directed' flag set to true or not.
   */
  isDirected() {
    return this._isDirected;
  }
  /**
   * Whether graph was created with 'multigraph' flag set to true or not.
   */
  isMultigraph() {
    return this._isMultigraph;
  }
  /**
   * Whether graph was created with 'compound' flag set to true or not.
   */
  isCompound() {
    return this._isCompound;
  }
  /**
   * Sets the label of the graph.
   */
  setGraph(t) {
    return this._label = t, this;
  }
  /**
   * Gets the graph label.
   */
  graph() {
    return this._label;
  }
  /* === Node functions ========== */
  /**
   * Sets the default node label. If newDefault is a function, it will be
   * invoked ach time when setting a label for a node. Otherwise, this label
   * will be assigned as default label in case if no label was specified while
   * setting a node.
   * Complexity: O(1).
   */
  setDefaultNodeLabel(t) {
    return this._defaultNodeLabelFn = t, typeof t != "function" && (this._defaultNodeLabelFn = () => t), this;
  }
  /**
   * Gets the number of nodes in the graph.
   * Complexity: O(1).
   */
  nodeCount() {
    return this._nodeCount;
  }
  /**
   * Gets all nodes of the graph. Note, the in case of compound graph subnodes are
   * not included in list.
   * Complexity: O(1).
   */
  nodes() {
    return Object.keys(this._nodes);
  }
  /**
   * Gets list of nodes without in-edges.
   * Complexity: O(|V|).
   */
  sources() {
    var t = this;
    return this.nodes().filter((n) => Object.keys(t._in[n]).length === 0);
  }
  /**
   * Gets list of nodes without out-edges.
   * Complexity: O(|V|).
   */
  sinks() {
    var t = this;
    return this.nodes().filter((n) => Object.keys(t._out[n]).length === 0);
  }
  /**
   * Invokes setNode method for each node in names list.
   * Complexity: O(|names|).
   */
  setNodes(t, n) {
    var o = arguments, i = this;
    return t.forEach(function(r) {
      o.length > 1 ? i.setNode(r, n) : i.setNode(r);
    }), this;
  }
  /**
   * Creates or updates the value for the node v in the graph. If label is supplied
   * it is set as the value for the node. If label is not supplied and the node was
   * created by this call then the default node label will be assigned.
   * Complexity: O(1).
   */
  setNode(t, n) {
    return Object.hasOwn(this._nodes, t) ? (arguments.length > 1 && (this._nodes[t] = n), this) : (this._nodes[t] = arguments.length > 1 ? n : this._defaultNodeLabelFn(t), this._isCompound && (this._parent[t] = bn, this._children[t] = {}, this._children[bn][t] = !0), this._in[t] = {}, this._preds[t] = {}, this._out[t] = {}, this._sucs[t] = {}, ++this._nodeCount, this);
  }
  /**
   * Gets the label of node with specified name.
   * Complexity: O(|V|).
   */
  node(t) {
    return this._nodes[t];
  }
  /**
   * Detects whether graph has a node with specified name or not.
   */
  hasNode(t) {
    return Object.hasOwn(this._nodes, t);
  }
  /**
   * Remove the node with the name from the graph or do nothing if the node is not in
   * the graph. If the node was removed this function also removes any incident
   * edges.
   * Complexity: O(1).
   */
  removeNode(t) {
    var n = this;
    if (Object.hasOwn(this._nodes, t)) {
      var o = (i) => n.removeEdge(n._edgeObjs[i]);
      delete this._nodes[t], this._isCompound && (this._removeFromParentsChildList(t), delete this._parent[t], this.children(t).forEach(function(i) {
        n.setParent(i);
      }), delete this._children[t]), Object.keys(this._in[t]).forEach(o), delete this._in[t], delete this._preds[t], Object.keys(this._out[t]).forEach(o), delete this._out[t], delete this._sucs[t], --this._nodeCount;
    }
    return this;
  }
  /**
   * Sets node p as a parent for node v if it is defined, or removes the
   * parent for v if p is undefined. Method throws an exception in case of
   * invoking it in context of noncompound graph.
   * Average-case complexity: O(1).
   */
  setParent(t, n) {
    if (!this._isCompound)
      throw new Error("Cannot set parent in a non-compound graph");
    if (n === void 0)
      n = bn;
    else {
      n += "";
      for (var o = n; o !== void 0; o = this.parent(o))
        if (o === t)
          throw new Error("Setting " + n + " as parent of " + t + " would create a cycle");
      this.setNode(n);
    }
    return this.setNode(t), this._removeFromParentsChildList(t), this._parent[t] = n, this._children[n][t] = !0, this;
  }
  _removeFromParentsChildList(t) {
    delete this._children[this._parent[t]][t];
  }
  /**
   * Gets parent node for node v.
   * Complexity: O(1).
   */
  parent(t) {
    if (this._isCompound) {
      var n = this._parent[t];
      if (n !== bn)
        return n;
    }
  }
  /**
   * Gets list of direct children of node v.
   * Complexity: O(1).
   */
  children(t = bn) {
    if (this._isCompound) {
      var n = this._children[t];
      if (n)
        return Object.keys(n);
    } else {
      if (t === bn)
        return this.nodes();
      if (this.hasNode(t))
        return [];
    }
  }
  /**
   * Return all nodes that are predecessors of the specified node or undefined if node v is not in
   * the graph. Behavior is undefined for undirected graphs - use neighbors instead.
   * Complexity: O(|V|).
   */
  predecessors(t) {
    var n = this._preds[t];
    if (n)
      return Object.keys(n);
  }
  /**
   * Return all nodes that are successors of the specified node or undefined if node v is not in
   * the graph. Behavior is undefined for undirected graphs - use neighbors instead.
   * Complexity: O(|V|).
   */
  successors(t) {
    var n = this._sucs[t];
    if (n)
      return Object.keys(n);
  }
  /**
   * Return all nodes that are predecessors or successors of the specified node or undefined if
   * node v is not in the graph.
   * Complexity: O(|V|).
   */
  neighbors(t) {
    var n = this.predecessors(t);
    if (n) {
      const i = new Set(n);
      for (var o of this.successors(t))
        i.add(o);
      return Array.from(i.values());
    }
  }
  isLeaf(t) {
    var n;
    return this.isDirected() ? n = this.successors(t) : n = this.neighbors(t), n.length === 0;
  }
  /**
   * Creates new graph with nodes filtered via filter. Edges incident to rejected node
   * are also removed. In case of compound graph, if parent is rejected by filter,
   * than all its children are rejected too.
   * Average-case complexity: O(|E|+|V|).
   */
  filterNodes(t) {
    var n = new this.constructor({
      directed: this._isDirected,
      multigraph: this._isMultigraph,
      compound: this._isCompound
    });
    n.setGraph(this.graph());
    var o = this;
    Object.entries(this._nodes).forEach(function([s, l]) {
      t(s) && n.setNode(s, l);
    }), Object.values(this._edgeObjs).forEach(function(s) {
      n.hasNode(s.v) && n.hasNode(s.w) && n.setEdge(s, o.edge(s));
    });
    var i = {};
    function r(s) {
      var l = o.parent(s);
      return l === void 0 || n.hasNode(l) ? (i[s] = l, l) : l in i ? i[l] : r(l);
    }
    return this._isCompound && n.nodes().forEach((s) => n.setParent(s, r(s))), n;
  }
  /* === Edge functions ========== */
  /**
   * Sets the default edge label or factory function. This label will be
   * assigned as default label in case if no label was specified while setting
   * an edge or this function will be invoked each time when setting an edge
   * with no label specified and returned value * will be used as a label for edge.
   * Complexity: O(1).
   */
  setDefaultEdgeLabel(t) {
    return this._defaultEdgeLabelFn = t, typeof t != "function" && (this._defaultEdgeLabelFn = () => t), this;
  }
  /**
   * Gets the number of edges in the graph.
   * Complexity: O(1).
   */
  edgeCount() {
    return this._edgeCount;
  }
  /**
   * Gets edges of the graph. In case of compound graph subgraphs are not considered.
   * Complexity: O(|E|).
   */
  edges() {
    return Object.values(this._edgeObjs);
  }
  /**
   * Establish an edges path over the nodes in nodes list. If some edge is already
   * exists, it will update its label, otherwise it will create an edge between pair
   * of nodes with label provided or default label if no label provided.
   * Complexity: O(|nodes|).
   */
  setPath(t, n) {
    var o = this, i = arguments;
    return t.reduce(function(r, s) {
      return i.length > 1 ? o.setEdge(r, s, n) : o.setEdge(r, s), s;
    }), this;
  }
  /**
   * Creates or updates the label for the edge (v, w) with the optionally supplied
   * name. If label is supplied it is set as the value for the edge. If label is not
   * supplied and the edge was created by this call then the default edge label will
   * be assigned. The name parameter is only useful with multigraphs.
   */
  setEdge() {
    var t, n, o, i, r = !1, s = arguments[0];
    typeof s == "object" && s !== null && "v" in s ? (t = s.v, n = s.w, o = s.name, arguments.length === 2 && (i = arguments[1], r = !0)) : (t = s, n = arguments[1], o = arguments[3], arguments.length > 2 && (i = arguments[2], r = !0)), t = "" + t, n = "" + n, o !== void 0 && (o = "" + o);
    var l = fo(this._isDirected, t, n, o);
    if (Object.hasOwn(this._edgeLabels, l))
      return r && (this._edgeLabels[l] = i), this;
    if (o !== void 0 && !this._isMultigraph)
      throw new Error("Cannot set a named edge when isMultigraph = false");
    this.setNode(t), this.setNode(n), this._edgeLabels[l] = r ? i : this._defaultEdgeLabelFn(t, n, o);
    var a = Wp(this._isDirected, t, n, o);
    return t = a.v, n = a.w, Object.freeze(a), this._edgeObjs[l] = a, Al(this._preds[n], t), Al(this._sucs[t], n), this._in[n][l] = a, this._out[t][l] = a, this._edgeCount++, this;
  }
  /**
   * Gets the label for the specified edge.
   * Complexity: O(1).
   */
  edge(t, n, o) {
    var i = arguments.length === 1 ? br(this._isDirected, arguments[0]) : fo(this._isDirected, t, n, o);
    return this._edgeLabels[i];
  }
  /**
   * Gets the label for the specified edge and converts it to an object.
   * Complexity: O(1)
   */
  edgeAsObj() {
    const t = this.edge(...arguments);
    return typeof t != "object" ? { label: t } : t;
  }
  /**
   * Detects whether the graph contains specified edge or not. No subgraphs are considered.
   * Complexity: O(1).
   */
  hasEdge(t, n, o) {
    var i = arguments.length === 1 ? br(this._isDirected, arguments[0]) : fo(this._isDirected, t, n, o);
    return Object.hasOwn(this._edgeLabels, i);
  }
  /**
   * Removes the specified edge from the graph. No subgraphs are considered.
   * Complexity: O(1).
   */
  removeEdge(t, n, o) {
    var i = arguments.length === 1 ? br(this._isDirected, arguments[0]) : fo(this._isDirected, t, n, o), r = this._edgeObjs[i];
    return r && (t = r.v, n = r.w, delete this._edgeLabels[i], delete this._edgeObjs[i], Rl(this._preds[n], t), Rl(this._sucs[t], n), delete this._in[n][i], delete this._out[t][i], this._edgeCount--), this;
  }
  /**
   * Return all edges that point to the node v. Optionally filters those edges down to just those
   * coming from node u. Behavior is undefined for undirected graphs - use nodeEdges instead.
   * Complexity: O(|E|).
   */
  inEdges(t, n) {
    var o = this._in[t];
    if (o) {
      var i = Object.values(o);
      return n ? i.filter((r) => r.v === n) : i;
    }
  }
  /**
   * Return all edges that are pointed at by node v. Optionally filters those edges down to just
   * those point to w. Behavior is undefined for undirected graphs - use nodeEdges instead.
   * Complexity: O(|E|).
   */
  outEdges(t, n) {
    var o = this._out[t];
    if (o) {
      var i = Object.values(o);
      return n ? i.filter((r) => r.w === n) : i;
    }
  }
  /**
   * Returns all edges to or from node v regardless of direction. Optionally filters those edges
   * down to just those between nodes v and w regardless of direction.
   * Complexity: O(|E|).
   */
  nodeEdges(t, n) {
    var o = this.inEdges(t, n);
    if (o)
      return o.concat(this.outEdges(t, n));
  }
};
function Al(e, t) {
  e[t] ? e[t]++ : e[t] = 1;
}
function Rl(e, t) {
  --e[t] || delete e[t];
}
function fo(e, t, n, o) {
  var i = "" + t, r = "" + n;
  if (!e && i > r) {
    var s = i;
    i = r, r = s;
  }
  return i + Dl + r + Dl + (o === void 0 ? Xp : o);
}
function Wp(e, t, n, o) {
  var i = "" + t, r = "" + n;
  if (!e && i > r) {
    var s = i;
    i = r, r = s;
  }
  var l = { v: i, w: r };
  return o && (l.name = o), l;
}
function br(e, t) {
  return fo(e, t.v, t.w, t.name);
}
var As = qp, Kp = "2.2.4", Zp = {
  Graph: As,
  version: Kp
}, Jp = As, Qp = {
  write: ev,
  read: ov
};
function ev(e) {
  var t = {
    options: {
      directed: e.isDirected(),
      multigraph: e.isMultigraph(),
      compound: e.isCompound()
    },
    nodes: tv(e),
    edges: nv(e)
  };
  return e.graph() !== void 0 && (t.value = structuredClone(e.graph())), t;
}
function tv(e) {
  return e.nodes().map(function(t) {
    var n = e.node(t), o = e.parent(t), i = { v: t };
    return n !== void 0 && (i.value = n), o !== void 0 && (i.parent = o), i;
  });
}
function nv(e) {
  return e.edges().map(function(t) {
    var n = e.edge(t), o = { v: t.v, w: t.w };
    return t.name !== void 0 && (o.name = t.name), n !== void 0 && (o.value = n), o;
  });
}
function ov(e) {
  var t = new Jp(e.options).setGraph(e.value);
  return e.nodes.forEach(function(n) {
    t.setNode(n.v, n.value), n.parent && t.setParent(n.v, n.parent);
  }), e.edges.forEach(function(n) {
    t.setEdge({ v: n.v, w: n.w, name: n.name }, n.value);
  }), t;
}
var iv = rv;
function rv(e) {
  var t = {}, n = [], o;
  function i(r) {
    Object.hasOwn(t, r) || (t[r] = !0, o.push(r), e.successors(r).forEach(i), e.predecessors(r).forEach(i));
  }
  return e.nodes().forEach(function(r) {
    o = [], i(r), o.length && n.push(o);
  }), n;
}
let sv = class {
  constructor() {
    Ue(this, "_arr", []);
    Ue(this, "_keyIndices", {});
  }
  /**
   * Returns the number of elements in the queue. Takes `O(1)` time.
   */
  size() {
    return this._arr.length;
  }
  /**
   * Returns the keys that are in the queue. Takes `O(n)` time.
   */
  keys() {
    return this._arr.map(function(t) {
      return t.key;
    });
  }
  /**
   * Returns `true` if **key** is in the queue and `false` if not.
   */
  has(t) {
    return Object.hasOwn(this._keyIndices, t);
  }
  /**
   * Returns the priority for **key**. If **key** is not present in the queue
   * then this function returns `undefined`. Takes `O(1)` time.
   *
   * @param {Object} key
   */
  priority(t) {
    var n = this._keyIndices[t];
    if (n !== void 0)
      return this._arr[n].priority;
  }
  /**
   * Returns the key for the minimum element in this queue. If the queue is
   * empty this function throws an Error. Takes `O(1)` time.
   */
  min() {
    if (this.size() === 0)
      throw new Error("Queue underflow");
    return this._arr[0].key;
  }
  /**
   * Inserts a new key into the priority queue. If the key already exists in
   * the queue this function returns `false`; otherwise it will return `true`.
   * Takes `O(n)` time.
   *
   * @param {Object} key the key to add
   * @param {Number} priority the initial priority for the key
   */
  add(t, n) {
    var o = this._keyIndices;
    if (t = String(t), !Object.hasOwn(o, t)) {
      var i = this._arr, r = i.length;
      return o[t] = r, i.push({ key: t, priority: n }), this._decrease(r), !0;
    }
    return !1;
  }
  /**
   * Removes and returns the smallest key in the queue. Takes `O(log n)` time.
   */
  removeMin() {
    this._swap(0, this._arr.length - 1);
    var t = this._arr.pop();
    return delete this._keyIndices[t.key], this._heapify(0), t.key;
  }
  /**
   * Decreases the priority for **key** to **priority**. If the new priority is
   * greater than the previous priority, this function will throw an Error.
   *
   * @param {Object} key the key for which to raise priority
   * @param {Number} priority the new priority for the key
   */
  decrease(t, n) {
    var o = this._keyIndices[t];
    if (n > this._arr[o].priority)
      throw new Error("New priority is greater than current priority. Key: " + t + " Old: " + this._arr[o].priority + " New: " + n);
    this._arr[o].priority = n, this._decrease(o);
  }
  _heapify(t) {
    var n = this._arr, o = 2 * t, i = o + 1, r = t;
    o < n.length && (r = n[o].priority < n[r].priority ? o : r, i < n.length && (r = n[i].priority < n[r].priority ? i : r), r !== t && (this._swap(t, r), this._heapify(r)));
  }
  _decrease(t) {
    for (var n = this._arr, o = n[t].priority, i; t !== 0 && (i = t >> 1, !(n[i].priority < o)); )
      this._swap(t, i), t = i;
  }
  _swap(t, n) {
    var o = this._arr, i = this._keyIndices, r = o[t], s = o[n];
    o[t] = s, o[n] = r, i[s.key] = t, i[r.key] = n;
  }
};
var dc = sv, lv = dc, fc = uv, av = () => 1;
function uv(e, t, n, o) {
  return cv(
    e,
    String(t),
    n || av,
    o || function(i) {
      return e.outEdges(i);
    }
  );
}
function cv(e, t, n, o) {
  var i = {}, r = new lv(), s, l, a = function(u) {
    var c = u.v !== s ? u.v : u.w, f = i[c], p = n(u), g = l.distance + p;
    if (p < 0)
      throw new Error("dijkstra does not allow negative edge weights. Bad edge: " + u + " Weight: " + p);
    g < f.distance && (f.distance = g, f.predecessor = s, r.decrease(c, g));
  };
  for (e.nodes().forEach(function(u) {
    var c = u === t ? 0 : Number.POSITIVE_INFINITY;
    i[u] = { distance: c }, r.add(u, c);
  }); r.size() > 0 && (s = r.removeMin(), l = i[s], l.distance !== Number.POSITIVE_INFINITY); )
    o(s).forEach(a);
  return i;
}
var dv = fc, fv = hv;
function hv(e, t, n) {
  return e.nodes().reduce(function(o, i) {
    return o[i] = dv(e, i, t, n), o;
  }, {});
}
var hc = pv;
function pv(e) {
  var t = 0, n = [], o = {}, i = [];
  function r(s) {
    var l = o[s] = {
      onStack: !0,
      lowlink: t,
      index: t++
    };
    if (n.push(s), e.successors(s).forEach(function(c) {
      Object.hasOwn(o, c) ? o[c].onStack && (l.lowlink = Math.min(l.lowlink, o[c].index)) : (r(c), l.lowlink = Math.min(l.lowlink, o[c].lowlink));
    }), l.lowlink === l.index) {
      var a = [], u;
      do
        u = n.pop(), o[u].onStack = !1, a.push(u);
      while (s !== u);
      i.push(a);
    }
  }
  return e.nodes().forEach(function(s) {
    Object.hasOwn(o, s) || r(s);
  }), i;
}
var vv = hc, gv = mv;
function mv(e) {
  return vv(e).filter(function(t) {
    return t.length > 1 || t.length === 1 && e.hasEdge(t[0], t[0]);
  });
}
var yv = _v, bv = () => 1;
function _v(e, t, n) {
  return wv(
    e,
    t || bv,
    n || function(o) {
      return e.outEdges(o);
    }
  );
}
function wv(e, t, n) {
  var o = {}, i = e.nodes();
  return i.forEach(function(r) {
    o[r] = {}, o[r][r] = { distance: 0 }, i.forEach(function(s) {
      r !== s && (o[r][s] = { distance: Number.POSITIVE_INFINITY });
    }), n(r).forEach(function(s) {
      var l = s.v === r ? s.w : s.v, a = t(s);
      o[r][l] = { distance: a, predecessor: r };
    });
  }), i.forEach(function(r) {
    var s = o[r];
    i.forEach(function(l) {
      var a = o[l];
      i.forEach(function(u) {
        var c = a[r], f = s[u], p = a[u], g = c.distance + f.distance;
        g < p.distance && (p.distance = g, p.predecessor = f.predecessor);
      });
    });
  }), o;
}
function pc(e) {
  var t = {}, n = {}, o = [];
  function i(r) {
    if (Object.hasOwn(n, r))
      throw new Qr();
    Object.hasOwn(t, r) || (n[r] = !0, t[r] = !0, e.predecessors(r).forEach(i), delete n[r], o.push(r));
  }
  if (e.sinks().forEach(i), Object.keys(t).length !== e.nodeCount())
    throw new Qr();
  return o;
}
class Qr extends Error {
  constructor() {
    super(...arguments);
  }
}
var vc = pc;
pc.CycleException = Qr;
var Ll = vc, Ev = xv;
function xv(e) {
  try {
    Ll(e);
  } catch (t) {
    if (t instanceof Ll.CycleException)
      return !1;
    throw t;
  }
  return !0;
}
var gc = kv;
function kv(e, t, n) {
  Array.isArray(t) || (t = [t]);
  var o = e.isDirected() ? (l) => e.successors(l) : (l) => e.neighbors(l), i = n === "post" ? Sv : Cv, r = [], s = {};
  return t.forEach((l) => {
    if (!e.hasNode(l))
      throw new Error("Graph does not have node: " + l);
    i(l, o, s, r);
  }), r;
}
function Sv(e, t, n, o) {
  for (var i = [[e, !1]]; i.length > 0; ) {
    var r = i.pop();
    r[1] ? o.push(r[0]) : Object.hasOwn(n, r[0]) || (n[r[0]] = !0, i.push([r[0], !0]), mc(t(r[0]), (s) => i.push([s, !1])));
  }
}
function Cv(e, t, n, o) {
  for (var i = [e]; i.length > 0; ) {
    var r = i.pop();
    Object.hasOwn(n, r) || (n[r] = !0, o.push(r), mc(t(r), (s) => i.push(s)));
  }
}
function mc(e, t) {
  for (var n = e.length; n--; )
    t(e[n], n, e);
  return e;
}
var Nv = gc, $v = Mv;
function Mv(e, t) {
  return Nv(e, t, "post");
}
var Iv = gc, Ov = Tv;
function Tv(e, t) {
  return Iv(e, t, "pre");
}
var Pv = As, Dv = dc, Av = Rv;
function Rv(e, t) {
  var n = new Pv(), o = {}, i = new Dv(), r;
  function s(a) {
    var u = a.v === r ? a.w : a.v, c = i.priority(u);
    if (c !== void 0) {
      var f = t(a);
      f < c && (o[u] = r, i.decrease(u, f));
    }
  }
  if (e.nodeCount() === 0)
    return n;
  e.nodes().forEach(function(a) {
    i.add(a, Number.POSITIVE_INFINITY), n.setNode(a);
  }), i.decrease(e.nodes()[0], 0);
  for (var l = !1; i.size() > 0; ) {
    if (r = i.removeMin(), Object.hasOwn(o, r))
      n.setEdge(r, o[r]);
    else {
      if (l)
        throw new Error("Input graph is not connected: " + e);
      l = !0;
    }
    e.nodeEdges(r).forEach(s);
  }
  return n;
}
var Lv = {
  components: iv,
  dijkstra: fc,
  dijkstraAll: fv,
  findCycles: gv,
  floydWarshall: yv,
  isAcyclic: Ev,
  postorder: $v,
  preorder: Ov,
  prim: Av,
  tarjan: hc,
  topsort: vc
}, Vl = Zp, St = {
  Graph: Vl.Graph,
  json: Qp,
  alg: Lv,
  version: Vl.version
};
let Vv = class {
  constructor() {
    let t = {};
    t._next = t._prev = t, this._sentinel = t;
  }
  dequeue() {
    let t = this._sentinel, n = t._prev;
    if (n !== t)
      return zl(n), n;
  }
  enqueue(t) {
    let n = this._sentinel;
    t._prev && t._next && zl(t), t._next = n._next, n._next._prev = t, n._next = t, t._prev = n;
  }
  toString() {
    let t = [], n = this._sentinel, o = n._prev;
    for (; o !== n; )
      t.push(JSON.stringify(o, zv)), o = o._prev;
    return "[" + t.join(", ") + "]";
  }
};
function zl(e) {
  e._prev._next = e._next, e._next._prev = e._prev, delete e._next, delete e._prev;
}
function zv(e, t) {
  if (e !== "_next" && e !== "_prev")
    return t;
}
var Bv = Vv;
let Fv = St.Graph, Hv = Bv;
var Uv = Gv;
let jv = () => 1;
function Gv(e, t) {
  if (e.nodeCount() <= 1)
    return [];
  let n = Xv(e, t || jv);
  return Yv(n.graph, n.buckets, n.zeroIdx).flatMap((i) => e.outEdges(i.v, i.w));
}
function Yv(e, t, n) {
  let o = [], i = t[t.length - 1], r = t[0], s;
  for (; e.nodeCount(); ) {
    for (; s = r.dequeue(); )
      _r(e, t, n, s);
    for (; s = i.dequeue(); )
      _r(e, t, n, s);
    if (e.nodeCount()) {
      for (let l = t.length - 2; l > 0; --l)
        if (s = t[l].dequeue(), s) {
          o = o.concat(_r(e, t, n, s, !0));
          break;
        }
    }
  }
  return o;
}
function _r(e, t, n, o, i) {
  let r = i ? [] : void 0;
  return e.inEdges(o.v).forEach((s) => {
    let l = e.edge(s), a = e.node(s.v);
    i && r.push({ v: s.v, w: s.w }), a.out -= l, es(t, n, a);
  }), e.outEdges(o.v).forEach((s) => {
    let l = e.edge(s), a = s.w, u = e.node(a);
    u.in -= l, es(t, n, u);
  }), e.removeNode(o.v), r;
}
function Xv(e, t) {
  let n = new Fv(), o = 0, i = 0;
  e.nodes().forEach((l) => {
    n.setNode(l, { v: l, in: 0, out: 0 });
  }), e.edges().forEach((l) => {
    let a = n.edge(l.v, l.w) || 0, u = t(l), c = a + u;
    n.setEdge(l.v, l.w, c), i = Math.max(i, n.node(l.v).out += u), o = Math.max(o, n.node(l.w).in += u);
  });
  let r = qv(i + o + 3).map(() => new Hv()), s = o + 1;
  return n.nodes().forEach((l) => {
    es(r, s, n.node(l));
  }), { graph: n, buckets: r, zeroIdx: s };
}
function es(e, t, n) {
  n.out ? n.in ? e[n.out - n.in + t].enqueue(n) : e[e.length - 1].enqueue(n) : e[0].enqueue(n);
}
function qv(e) {
  const t = [];
  for (let n = 0; n < e; n++)
    t.push(n);
  return t;
}
let yc = St.Graph;
var Xe = {
  addBorderNode: og,
  addDummyNode: bc,
  applyWithChunking: qi,
  asNonCompoundGraph: Kv,
  buildLayerMatrix: eg,
  intersectRect: Qv,
  mapValues: cg,
  maxRank: wc,
  normalizeRanks: tg,
  notime: lg,
  partition: rg,
  pick: ug,
  predecessorWeights: Jv,
  range: xc,
  removeEmptyRanks: ng,
  simplify: Wv,
  successorWeights: Zv,
  time: sg,
  uniqueId: Ec,
  zipObject: Rs
};
function bc(e, t, n, o) {
  for (var i = o; e.hasNode(i); )
    i = Ec(o);
  return n.dummy = t, e.setNode(i, n), i;
}
function Wv(e) {
  let t = new yc().setGraph(e.graph());
  return e.nodes().forEach((n) => t.setNode(n, e.node(n))), e.edges().forEach((n) => {
    let o = t.edge(n.v, n.w) || { weight: 0, minlen: 1 }, i = e.edge(n);
    t.setEdge(n.v, n.w, {
      weight: o.weight + i.weight,
      minlen: Math.max(o.minlen, i.minlen)
    });
  }), t;
}
function Kv(e) {
  let t = new yc({ multigraph: e.isMultigraph() }).setGraph(e.graph());
  return e.nodes().forEach((n) => {
    e.children(n).length || t.setNode(n, e.node(n));
  }), e.edges().forEach((n) => {
    t.setEdge(n, e.edge(n));
  }), t;
}
function Zv(e) {
  let t = e.nodes().map((n) => {
    let o = {};
    return e.outEdges(n).forEach((i) => {
      o[i.w] = (o[i.w] || 0) + e.edge(i).weight;
    }), o;
  });
  return Rs(e.nodes(), t);
}
function Jv(e) {
  let t = e.nodes().map((n) => {
    let o = {};
    return e.inEdges(n).forEach((i) => {
      o[i.v] = (o[i.v] || 0) + e.edge(i).weight;
    }), o;
  });
  return Rs(e.nodes(), t);
}
function Qv(e, t) {
  let n = e.x, o = e.y, i = t.x - n, r = t.y - o, s = e.width / 2, l = e.height / 2;
  if (!i && !r)
    throw new Error("Not possible to find intersection inside of the rectangle");
  let a, u;
  return Math.abs(r) * s > Math.abs(i) * l ? (r < 0 && (l = -l), a = l * i / r, u = l) : (i < 0 && (s = -s), a = s, u = s * r / i), { x: n + a, y: o + u };
}
function eg(e) {
  let t = xc(wc(e) + 1).map(() => []);
  return e.nodes().forEach((n) => {
    let o = e.node(n), i = o.rank;
    i !== void 0 && (t[i][o.order] = n);
  }), t;
}
function tg(e) {
  let t = e.nodes().map((o) => {
    let i = e.node(o).rank;
    return i === void 0 ? Number.MAX_VALUE : i;
  }), n = qi(Math.min, t);
  e.nodes().forEach((o) => {
    let i = e.node(o);
    Object.hasOwn(i, "rank") && (i.rank -= n);
  });
}
function ng(e) {
  let t = e.nodes().map((s) => e.node(s).rank), n = qi(Math.min, t), o = [];
  e.nodes().forEach((s) => {
    let l = e.node(s).rank - n;
    o[l] || (o[l] = []), o[l].push(s);
  });
  let i = 0, r = e.graph().nodeRankFactor;
  Array.from(o).forEach((s, l) => {
    s === void 0 && l % r !== 0 ? --i : s !== void 0 && i && s.forEach((a) => e.node(a).rank += i);
  });
}
function og(e, t, n, o) {
  let i = {
    width: 0,
    height: 0
  };
  return arguments.length >= 4 && (i.rank = n, i.order = o), bc(e, "border", i, t);
}
function ig(e, t = _c) {
  const n = [];
  for (let o = 0; o < e.length; o += t) {
    const i = e.slice(o, o + t);
    n.push(i);
  }
  return n;
}
const _c = 65535;
function qi(e, t) {
  if (t.length > _c) {
    const n = ig(t);
    return e.apply(null, n.map((o) => e.apply(null, o)));
  } else
    return e.apply(null, t);
}
function wc(e) {
  const n = e.nodes().map((o) => {
    let i = e.node(o).rank;
    return i === void 0 ? Number.MIN_VALUE : i;
  });
  return qi(Math.max, n);
}
function rg(e, t) {
  let n = { lhs: [], rhs: [] };
  return e.forEach((o) => {
    t(o) ? n.lhs.push(o) : n.rhs.push(o);
  }), n;
}
function sg(e, t) {
  let n = Date.now();
  try {
    return t();
  } finally {
    console.log(e + " time: " + (Date.now() - n) + "ms");
  }
}
function lg(e, t) {
  return t();
}
let ag = 0;
function Ec(e) {
  var t = ++ag;
  return e + ("" + t);
}
function xc(e, t, n = 1) {
  t == null && (t = e, e = 0);
  let o = (r) => r < t;
  n < 0 && (o = (r) => t < r);
  const i = [];
  for (let r = e; o(r); r += n)
    i.push(r);
  return i;
}
function ug(e, t) {
  const n = {};
  for (const o of t)
    e[o] !== void 0 && (n[o] = e[o]);
  return n;
}
function cg(e, t) {
  let n = t;
  return typeof t == "string" && (n = (o) => o[t]), Object.entries(e).reduce((o, [i, r]) => (o[i] = n(r, i), o), {});
}
function Rs(e, t) {
  return e.reduce((n, o, i) => (n[o] = t[i], n), {});
}
let dg = Uv, fg = Xe.uniqueId;
var hg = {
  run: pg,
  undo: gg
};
function pg(e) {
  (e.graph().acyclicer === "greedy" ? dg(e, n(e)) : vg(e)).forEach((o) => {
    let i = e.edge(o);
    e.removeEdge(o), i.forwardName = o.name, i.reversed = !0, e.setEdge(o.w, o.v, i, fg("rev"));
  });
  function n(o) {
    return (i) => o.edge(i).weight;
  }
}
function vg(e) {
  let t = [], n = {}, o = {};
  function i(r) {
    Object.hasOwn(o, r) || (o[r] = !0, n[r] = !0, e.outEdges(r).forEach((s) => {
      Object.hasOwn(n, s.w) ? t.push(s) : i(s.w);
    }), delete n[r]);
  }
  return e.nodes().forEach(i), t;
}
function gg(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t);
    if (n.reversed) {
      e.removeEdge(t);
      let o = n.forwardName;
      delete n.reversed, delete n.forwardName, e.setEdge(t.w, t.v, n, o);
    }
  });
}
let mg = Xe;
var yg = {
  run: bg,
  undo: wg
};
function bg(e) {
  e.graph().dummyChains = [], e.edges().forEach((t) => _g(e, t));
}
function _g(e, t) {
  let n = t.v, o = e.node(n).rank, i = t.w, r = e.node(i).rank, s = t.name, l = e.edge(t), a = l.labelRank;
  if (r === o + 1) return;
  e.removeEdge(t);
  let u, c, f;
  for (f = 0, ++o; o < r; ++f, ++o)
    l.points = [], c = {
      width: 0,
      height: 0,
      edgeLabel: l,
      edgeObj: t,
      rank: o
    }, u = mg.addDummyNode(e, "edge", c, "_d"), o === a && (c.width = l.width, c.height = l.height, c.dummy = "edge-label", c.labelpos = l.labelpos), e.setEdge(n, u, { weight: l.weight }, s), f === 0 && e.graph().dummyChains.push(u), n = u;
  e.setEdge(n, i, { weight: l.weight }, s);
}
function wg(e) {
  e.graph().dummyChains.forEach((t) => {
    let n = e.node(t), o = n.edgeLabel, i;
    for (e.setEdge(n.edgeObj, o); n.dummy; )
      i = e.successors(t)[0], e.removeNode(t), o.points.push({ x: n.x, y: n.y }), n.dummy === "edge-label" && (o.x = n.x, o.y = n.y, o.width = n.width, o.height = n.height), t = i, n = e.node(t);
  });
}
const { applyWithChunking: Eg } = Xe;
var Wi = {
  longestPath: xg,
  slack: kg
};
function xg(e) {
  var t = {};
  function n(o) {
    var i = e.node(o);
    if (Object.hasOwn(t, o))
      return i.rank;
    t[o] = !0;
    let r = e.outEdges(o).map((l) => l == null ? Number.POSITIVE_INFINITY : n(l.w) - e.edge(l).minlen);
    var s = Eg(Math.min, r);
    return s === Number.POSITIVE_INFINITY && (s = 0), i.rank = s;
  }
  e.sources().forEach(n);
}
function kg(e, t) {
  return e.node(t.w).rank - e.node(t.v).rank - e.edge(t).minlen;
}
var Sg = St.Graph, Si = Wi.slack, kc = Cg;
function Cg(e) {
  var t = new Sg({ directed: !1 }), n = e.nodes()[0], o = e.nodeCount();
  t.setNode(n, {});
  for (var i, r; Ng(t, e) < o; )
    i = $g(t, e), r = t.hasNode(i.v) ? Si(e, i) : -Si(e, i), Mg(t, e, r);
  return t;
}
function Ng(e, t) {
  function n(o) {
    t.nodeEdges(o).forEach((i) => {
      var r = i.v, s = o === r ? i.w : r;
      !e.hasNode(s) && !Si(t, i) && (e.setNode(s, {}), e.setEdge(o, s, {}), n(s));
    });
  }
  return e.nodes().forEach(n), e.nodeCount();
}
function $g(e, t) {
  return t.edges().reduce((o, i) => {
    let r = Number.POSITIVE_INFINITY;
    return e.hasNode(i.v) !== e.hasNode(i.w) && (r = Si(t, i)), r < o[0] ? [r, i] : o;
  }, [Number.POSITIVE_INFINITY, null])[1];
}
function Mg(e, t, n) {
  e.nodes().forEach((o) => t.node(o).rank += n);
}
var Ig = kc, Bl = Wi.slack, Og = Wi.longestPath, Tg = St.alg.preorder, Pg = St.alg.postorder, Dg = Xe.simplify, Ag = Rn;
Rn.initLowLimValues = Vs;
Rn.initCutValues = Ls;
Rn.calcCutValue = Sc;
Rn.leaveEdge = Nc;
Rn.enterEdge = $c;
Rn.exchangeEdges = Mc;
function Rn(e) {
  e = Dg(e), Og(e);
  var t = Ig(e);
  Vs(t), Ls(t, e);
  for (var n, o; n = Nc(t); )
    o = $c(t, e, n), Mc(t, e, n, o);
}
function Ls(e, t) {
  var n = Pg(e, e.nodes());
  n = n.slice(0, n.length - 1), n.forEach((o) => Rg(e, t, o));
}
function Rg(e, t, n) {
  var o = e.node(n), i = o.parent;
  e.edge(n, i).cutvalue = Sc(e, t, n);
}
function Sc(e, t, n) {
  var o = e.node(n), i = o.parent, r = !0, s = t.edge(n, i), l = 0;
  return s || (r = !1, s = t.edge(i, n)), l = s.weight, t.nodeEdges(n).forEach((a) => {
    var u = a.v === n, c = u ? a.w : a.v;
    if (c !== i) {
      var f = u === r, p = t.edge(a).weight;
      if (l += f ? p : -p, Vg(e, n, c)) {
        var g = e.edge(n, c).cutvalue;
        l += f ? -g : g;
      }
    }
  }), l;
}
function Vs(e, t) {
  arguments.length < 2 && (t = e.nodes()[0]), Cc(e, {}, 1, t);
}
function Cc(e, t, n, o, i) {
  var r = n, s = e.node(o);
  return t[o] = !0, e.neighbors(o).forEach((l) => {
    Object.hasOwn(t, l) || (n = Cc(e, t, n, l, o));
  }), s.low = r, s.lim = n++, i ? s.parent = i : delete s.parent, n;
}
function Nc(e) {
  return e.edges().find((t) => e.edge(t).cutvalue < 0);
}
function $c(e, t, n) {
  var o = n.v, i = n.w;
  t.hasEdge(o, i) || (o = n.w, i = n.v);
  var r = e.node(o), s = e.node(i), l = r, a = !1;
  r.lim > s.lim && (l = s, a = !0);
  var u = t.edges().filter((c) => a === Fl(e, e.node(c.v), l) && a !== Fl(e, e.node(c.w), l));
  return u.reduce((c, f) => Bl(t, f) < Bl(t, c) ? f : c);
}
function Mc(e, t, n, o) {
  var i = n.v, r = n.w;
  e.removeEdge(i, r), e.setEdge(o.v, o.w, {}), Vs(e), Ls(e, t), Lg(e, t);
}
function Lg(e, t) {
  var n = e.nodes().find((i) => !t.node(i).parent), o = Tg(e, n);
  o = o.slice(1), o.forEach((i) => {
    var r = e.node(i).parent, s = t.edge(i, r), l = !1;
    s || (s = t.edge(r, i), l = !0), t.node(i).rank = t.node(r).rank + (l ? s.minlen : -s.minlen);
  });
}
function Vg(e, t, n) {
  return e.hasEdge(t, n);
}
function Fl(e, t, n) {
  return n.low <= t.lim && t.lim <= n.lim;
}
var zg = Wi, Ic = zg.longestPath, Bg = kc, Fg = Ag, Hg = Ug;
function Ug(e) {
  var t = e.graph().ranker;
  if (t instanceof Function)
    return t(e);
  switch (e.graph().ranker) {
    case "network-simplex":
      Hl(e);
      break;
    case "tight-tree":
      Gg(e);
      break;
    case "longest-path":
      jg(e);
      break;
    case "none":
      break;
    default:
      Hl(e);
  }
}
var jg = Ic;
function Gg(e) {
  Ic(e), Bg(e);
}
function Hl(e) {
  Fg(e);
}
var Yg = Xg;
function Xg(e) {
  let t = Wg(e);
  e.graph().dummyChains.forEach((n) => {
    let o = e.node(n), i = o.edgeObj, r = qg(e, t, i.v, i.w), s = r.path, l = r.lca, a = 0, u = s[a], c = !0;
    for (; n !== i.w; ) {
      if (o = e.node(n), c) {
        for (; (u = s[a]) !== l && e.node(u).maxRank < o.rank; )
          a++;
        u === l && (c = !1);
      }
      if (!c) {
        for (; a < s.length - 1 && e.node(u = s[a + 1]).minRank <= o.rank; )
          a++;
        u = s[a];
      }
      e.setParent(n, u), n = e.successors(n)[0];
    }
  });
}
function qg(e, t, n, o) {
  let i = [], r = [], s = Math.min(t[n].low, t[o].low), l = Math.max(t[n].lim, t[o].lim), a, u;
  a = n;
  do
    a = e.parent(a), i.push(a);
  while (a && (t[a].low > s || l > t[a].lim));
  for (u = a, a = o; (a = e.parent(a)) !== u; )
    r.push(a);
  return { path: i.concat(r.reverse()), lca: u };
}
function Wg(e) {
  let t = {}, n = 0;
  function o(i) {
    let r = n;
    e.children(i).forEach(o), t[i] = { low: r, lim: n++ };
  }
  return e.children().forEach(o), t;
}
let Ci = Xe;
var Kg = {
  run: Zg,
  cleanup: em
};
function Zg(e) {
  let t = Ci.addDummyNode(e, "root", {}, "_root"), n = Jg(e), o = Object.values(n), i = Ci.applyWithChunking(Math.max, o) - 1, r = 2 * i + 1;
  e.graph().nestingRoot = t, e.edges().forEach((l) => e.edge(l).minlen *= r);
  let s = Qg(e) + 1;
  e.children().forEach((l) => Oc(e, t, r, s, i, n, l)), e.graph().nodeRankFactor = r;
}
function Oc(e, t, n, o, i, r, s) {
  let l = e.children(s);
  if (!l.length) {
    s !== t && e.setEdge(t, s, { weight: 0, minlen: n });
    return;
  }
  let a = Ci.addBorderNode(e, "_bt"), u = Ci.addBorderNode(e, "_bb"), c = e.node(s);
  e.setParent(a, s), c.borderTop = a, e.setParent(u, s), c.borderBottom = u, l.forEach((f) => {
    Oc(e, t, n, o, i, r, f);
    let p = e.node(f), g = p.borderTop ? p.borderTop : f, _ = p.borderBottom ? p.borderBottom : f, C = p.borderTop ? o : 2 * o, $ = g !== _ ? 1 : i - r[s] + 1;
    e.setEdge(a, g, {
      weight: C,
      minlen: $,
      nestingEdge: !0
    }), e.setEdge(_, u, {
      weight: C,
      minlen: $,
      nestingEdge: !0
    });
  }), e.parent(s) || e.setEdge(t, a, { weight: 0, minlen: i + r[s] });
}
function Jg(e) {
  var t = {};
  function n(o, i) {
    var r = e.children(o);
    r && r.length && r.forEach((s) => n(s, i + 1)), t[o] = i;
  }
  return e.children().forEach((o) => n(o, 1)), t;
}
function Qg(e) {
  return e.edges().reduce((t, n) => t + e.edge(n).weight, 0);
}
function em(e) {
  var t = e.graph();
  e.removeNode(t.nestingRoot), delete t.nestingRoot, e.edges().forEach((n) => {
    var o = e.edge(n);
    o.nestingEdge && e.removeEdge(n);
  });
}
let tm = Xe;
var nm = om;
function om(e) {
  function t(n) {
    let o = e.children(n), i = e.node(n);
    if (o.length && o.forEach(t), Object.hasOwn(i, "minRank")) {
      i.borderLeft = [], i.borderRight = [];
      for (let r = i.minRank, s = i.maxRank + 1; r < s; ++r)
        Ul(e, "borderLeft", "_bl", n, i, r), Ul(e, "borderRight", "_br", n, i, r);
    }
  }
  e.children().forEach(t);
}
function Ul(e, t, n, o, i, r) {
  let s = { width: 0, height: 0, rank: r, borderType: t }, l = i[t][r - 1], a = tm.addDummyNode(e, "border", s, n);
  i[t][r] = a, e.setParent(a, o), l && e.setEdge(l, a, { weight: 1 });
}
var im = {
  adjust: rm,
  undo: sm
};
function rm(e) {
  let t = e.graph().rankdir.toLowerCase();
  (t === "lr" || t === "rl") && Tc(e);
}
function sm(e) {
  let t = e.graph().rankdir.toLowerCase();
  (t === "bt" || t === "rl") && lm(e), (t === "lr" || t === "rl") && (am(e), Tc(e));
}
function Tc(e) {
  e.nodes().forEach((t) => jl(e.node(t))), e.edges().forEach((t) => jl(e.edge(t)));
}
function jl(e) {
  let t = e.width;
  e.width = e.height, e.height = t;
}
function lm(e) {
  e.nodes().forEach((t) => wr(e.node(t))), e.edges().forEach((t) => {
    let n = e.edge(t);
    n.points.forEach(wr), Object.hasOwn(n, "y") && wr(n);
  });
}
function wr(e) {
  e.y = -e.y;
}
function am(e) {
  e.nodes().forEach((t) => Er(e.node(t))), e.edges().forEach((t) => {
    let n = e.edge(t);
    n.points.forEach(Er), Object.hasOwn(n, "x") && Er(n);
  });
}
function Er(e) {
  let t = e.x;
  e.x = e.y, e.y = t;
}
let Gl = Xe;
var um = cm;
function cm(e) {
  let t = {}, n = e.nodes().filter((a) => !e.children(a).length), o = n.map((a) => e.node(a).rank), i = Gl.applyWithChunking(Math.max, o), r = Gl.range(i + 1).map(() => []);
  function s(a) {
    if (t[a]) return;
    t[a] = !0;
    let u = e.node(a);
    r[u.rank].push(a), e.successors(a).forEach(s);
  }
  return n.sort((a, u) => e.node(a).rank - e.node(u).rank).forEach(s), r;
}
let dm = Xe.zipObject;
var fm = hm;
function hm(e, t) {
  let n = 0;
  for (let o = 1; o < t.length; ++o)
    n += pm(e, t[o - 1], t[o]);
  return n;
}
function pm(e, t, n) {
  let o = dm(n, n.map((u, c) => c)), i = t.flatMap((u) => e.outEdges(u).map((c) => ({ pos: o[c.w], weight: e.edge(c).weight })).sort((c, f) => c.pos - f.pos)), r = 1;
  for (; r < n.length; ) r <<= 1;
  let s = 2 * r - 1;
  r -= 1;
  let l = new Array(s).fill(0), a = 0;
  return i.forEach((u) => {
    let c = u.pos + r;
    l[c] += u.weight;
    let f = 0;
    for (; c > 0; )
      c % 2 && (f += l[c + 1]), c = c - 1 >> 1, l[c] += u.weight;
    a += u.weight * f;
  }), a;
}
var vm = gm;
function gm(e, t = []) {
  return t.map((n) => {
    let o = e.inEdges(n);
    if (o.length) {
      let i = o.reduce((r, s) => {
        let l = e.edge(s), a = e.node(s.v);
        return {
          sum: r.sum + l.weight * a.order,
          weight: r.weight + l.weight
        };
      }, { sum: 0, weight: 0 });
      return {
        v: n,
        barycenter: i.sum / i.weight,
        weight: i.weight
      };
    } else
      return { v: n };
  });
}
let mm = Xe;
var ym = bm;
function bm(e, t) {
  let n = {};
  e.forEach((i, r) => {
    let s = n[i.v] = {
      indegree: 0,
      in: [],
      out: [],
      vs: [i.v],
      i: r
    };
    i.barycenter !== void 0 && (s.barycenter = i.barycenter, s.weight = i.weight);
  }), t.edges().forEach((i) => {
    let r = n[i.v], s = n[i.w];
    r !== void 0 && s !== void 0 && (s.indegree++, r.out.push(n[i.w]));
  });
  let o = Object.values(n).filter((i) => !i.indegree);
  return _m(o);
}
function _m(e) {
  let t = [];
  function n(i) {
    return (r) => {
      r.merged || (r.barycenter === void 0 || i.barycenter === void 0 || r.barycenter >= i.barycenter) && wm(i, r);
    };
  }
  function o(i) {
    return (r) => {
      r.in.push(i), --r.indegree === 0 && e.push(r);
    };
  }
  for (; e.length; ) {
    let i = e.pop();
    t.push(i), i.in.reverse().forEach(n(i)), i.out.forEach(o(i));
  }
  return t.filter((i) => !i.merged).map((i) => mm.pick(i, ["vs", "i", "barycenter", "weight"]));
}
function wm(e, t) {
  let n = 0, o = 0;
  e.weight && (n += e.barycenter * e.weight, o += e.weight), t.weight && (n += t.barycenter * t.weight, o += t.weight), e.vs = t.vs.concat(e.vs), e.barycenter = n / o, e.weight = o, e.i = Math.min(t.i, e.i), t.merged = !0;
}
let Em = Xe;
var xm = km;
function km(e, t) {
  let n = Em.partition(e, (c) => Object.hasOwn(c, "barycenter")), o = n.lhs, i = n.rhs.sort((c, f) => f.i - c.i), r = [], s = 0, l = 0, a = 0;
  o.sort(Sm(!!t)), a = Yl(r, i, a), o.forEach((c) => {
    a += c.vs.length, r.push(c.vs), s += c.barycenter * c.weight, l += c.weight, a = Yl(r, i, a);
  });
  let u = { vs: r.flat(!0) };
  return l && (u.barycenter = s / l, u.weight = l), u;
}
function Yl(e, t, n) {
  let o;
  for (; t.length && (o = t[t.length - 1]).i <= n; )
    t.pop(), e.push(o.vs), n++;
  return n;
}
function Sm(e) {
  return (t, n) => t.barycenter < n.barycenter ? -1 : t.barycenter > n.barycenter ? 1 : e ? n.i - t.i : t.i - n.i;
}
let Cm = vm, Nm = ym, $m = xm;
var Mm = Pc;
function Pc(e, t, n, o) {
  let i = e.children(t), r = e.node(t), s = r ? r.borderLeft : void 0, l = r ? r.borderRight : void 0, a = {};
  s && (i = i.filter((p) => p !== s && p !== l));
  let u = Cm(e, i);
  u.forEach((p) => {
    if (e.children(p.v).length) {
      let g = Pc(e, p.v, n, o);
      a[p.v] = g, Object.hasOwn(g, "barycenter") && Om(p, g);
    }
  });
  let c = Nm(u, n);
  Im(c, a);
  let f = $m(c, o);
  if (s && (f.vs = [s, f.vs, l].flat(!0), e.predecessors(s).length)) {
    let p = e.node(e.predecessors(s)[0]), g = e.node(e.predecessors(l)[0]);
    Object.hasOwn(f, "barycenter") || (f.barycenter = 0, f.weight = 0), f.barycenter = (f.barycenter * f.weight + p.order + g.order) / (f.weight + 2), f.weight += 2;
  }
  return f;
}
function Im(e, t) {
  e.forEach((n) => {
    n.vs = n.vs.flatMap((o) => t[o] ? t[o].vs : o);
  });
}
function Om(e, t) {
  e.barycenter !== void 0 ? (e.barycenter = (e.barycenter * e.weight + t.barycenter * t.weight) / (e.weight + t.weight), e.weight += t.weight) : (e.barycenter = t.barycenter, e.weight = t.weight);
}
let Tm = St.Graph, Pm = Xe;
var Dm = Am;
function Am(e, t, n) {
  let o = Rm(e), i = new Tm({ compound: !0 }).setGraph({ root: o }).setDefaultNodeLabel((r) => e.node(r));
  return e.nodes().forEach((r) => {
    let s = e.node(r), l = e.parent(r);
    (s.rank === t || s.minRank <= t && t <= s.maxRank) && (i.setNode(r), i.setParent(r, l || o), e[n](r).forEach((a) => {
      let u = a.v === r ? a.w : a.v, c = i.edge(u, r), f = c !== void 0 ? c.weight : 0;
      i.setEdge(u, r, { weight: e.edge(a).weight + f });
    }), Object.hasOwn(s, "minRank") && i.setNode(r, {
      borderLeft: s.borderLeft[t],
      borderRight: s.borderRight[t]
    }));
  }), i;
}
function Rm(e) {
  for (var t; e.hasNode(t = Pm.uniqueId("_root")); ) ;
  return t;
}
var Lm = Vm;
function Vm(e, t, n) {
  let o = {}, i;
  n.forEach((r) => {
    let s = e.parent(r), l, a;
    for (; s; ) {
      if (l = e.parent(s), l ? (a = o[l], o[l] = s) : (a = i, i = s), a && a !== s) {
        t.setEdge(a, s);
        return;
      }
      s = l;
    }
  });
}
let zm = um, Bm = fm, Fm = Mm, Hm = Dm, Um = Lm, jm = St.Graph, Ko = Xe;
var Gm = Dc;
function Dc(e, t) {
  if (t && typeof t.customOrder == "function") {
    t.customOrder(e, Dc);
    return;
  }
  let n = Ko.maxRank(e), o = Xl(e, Ko.range(1, n + 1), "inEdges"), i = Xl(e, Ko.range(n - 1, -1, -1), "outEdges"), r = zm(e);
  if (ql(e, r), t && t.disableOptimalOrderHeuristic)
    return;
  let s = Number.POSITIVE_INFINITY, l;
  for (let a = 0, u = 0; u < 4; ++a, ++u) {
    Ym(a % 2 ? o : i, a % 4 >= 2), r = Ko.buildLayerMatrix(e);
    let c = Bm(e, r);
    c < s && (u = 0, l = Object.assign({}, r), s = c);
  }
  ql(e, l);
}
function Xl(e, t, n) {
  return t.map(function(o) {
    return Hm(e, o, n);
  });
}
function Ym(e, t) {
  let n = new jm();
  e.forEach(function(o) {
    let i = o.graph().root, r = Fm(o, i, n, t);
    r.vs.forEach((s, l) => o.node(s).order = l), Um(o, n, r.vs);
  });
}
function ql(e, t) {
  Object.values(t).forEach((n) => n.forEach((o, i) => e.node(o).order = i));
}
let Xm = St.Graph, jt = Xe;
var qm = {
  positionX: ry
};
function Wm(e, t) {
  let n = {};
  function o(i, r) {
    let s = 0, l = 0, a = i.length, u = r[r.length - 1];
    return r.forEach((c, f) => {
      let p = Zm(e, c), g = p ? e.node(p).order : a;
      (p || c === u) && (r.slice(l, f + 1).forEach((_) => {
        e.predecessors(_).forEach((C) => {
          let $ = e.node(C), M = $.order;
          (M < s || g < M) && !($.dummy && e.node(_).dummy) && Ac(n, C, _);
        });
      }), l = f + 1, s = g);
    }), r;
  }
  return t.length && t.reduce(o), n;
}
function Km(e, t) {
  let n = {};
  function o(r, s, l, a, u) {
    let c;
    jt.range(s, l).forEach((f) => {
      c = r[f], e.node(c).dummy && e.predecessors(c).forEach((p) => {
        let g = e.node(p);
        g.dummy && (g.order < a || g.order > u) && Ac(n, p, c);
      });
    });
  }
  function i(r, s) {
    let l = -1, a, u = 0;
    return s.forEach((c, f) => {
      if (e.node(c).dummy === "border") {
        let p = e.predecessors(c);
        p.length && (a = e.node(p[0]).order, o(s, u, f, l, a), u = f, l = a);
      }
      o(s, u, s.length, a, r.length);
    }), s;
  }
  return t.length && t.reduce(i), n;
}
function Zm(e, t) {
  if (e.node(t).dummy)
    return e.predecessors(t).find((n) => e.node(n).dummy);
}
function Ac(e, t, n) {
  if (t > n) {
    let i = t;
    t = n, n = i;
  }
  let o = e[t];
  o || (e[t] = o = {}), o[n] = !0;
}
function Jm(e, t, n) {
  if (t > n) {
    let o = t;
    t = n, n = o;
  }
  return !!e[t] && Object.hasOwn(e[t], n);
}
function Qm(e, t, n, o) {
  let i = {}, r = {}, s = {};
  return t.forEach((l) => {
    l.forEach((a, u) => {
      i[a] = a, r[a] = a, s[a] = u;
    });
  }), t.forEach((l) => {
    let a = -1;
    l.forEach((u) => {
      let c = o(u);
      if (c.length) {
        c = c.sort((p, g) => s[p] - s[g]);
        let f = (c.length - 1) / 2;
        for (let p = Math.floor(f), g = Math.ceil(f); p <= g; ++p) {
          let _ = c[p];
          r[u] === u && a < s[_] && !Jm(n, u, _) && (r[_] = u, r[u] = i[u] = i[_], a = s[_]);
        }
      }
    });
  }), { root: i, align: r };
}
function ey(e, t, n, o, i) {
  let r = {}, s = ty(e, t, n, i), l = i ? "borderLeft" : "borderRight";
  function a(f, p) {
    let g = s.nodes(), _ = g.pop(), C = {};
    for (; _; )
      C[_] ? f(_) : (C[_] = !0, g.push(_), g = g.concat(p(_))), _ = g.pop();
  }
  function u(f) {
    r[f] = s.inEdges(f).reduce((p, g) => Math.max(p, r[g.v] + s.edge(g)), 0);
  }
  function c(f) {
    let p = s.outEdges(f).reduce((_, C) => Math.min(_, r[C.w] - s.edge(C)), Number.POSITIVE_INFINITY), g = e.node(f);
    p !== Number.POSITIVE_INFINITY && g.borderType !== l && (r[f] = Math.max(r[f], p));
  }
  return a(u, s.predecessors.bind(s)), a(c, s.successors.bind(s)), Object.keys(o).forEach((f) => r[f] = r[n[f]]), r;
}
function ty(e, t, n, o) {
  let i = new Xm(), r = e.graph(), s = sy(r.nodesep, r.edgesep, o);
  return t.forEach((l) => {
    let a;
    l.forEach((u) => {
      let c = n[u];
      if (i.setNode(c), a) {
        var f = n[a], p = i.edge(f, c);
        i.setEdge(f, c, Math.max(s(e, u, a), p || 0));
      }
      a = u;
    });
  }), i;
}
function ny(e, t) {
  return Object.values(t).reduce((n, o) => {
    let i = Number.NEGATIVE_INFINITY, r = Number.POSITIVE_INFINITY;
    Object.entries(o).forEach(([l, a]) => {
      let u = ly(e, l) / 2;
      i = Math.max(a + u, i), r = Math.min(a - u, r);
    });
    const s = i - r;
    return s < n[0] && (n = [s, o]), n;
  }, [Number.POSITIVE_INFINITY, null])[1];
}
function oy(e, t) {
  let n = Object.values(t), o = jt.applyWithChunking(Math.min, n), i = jt.applyWithChunking(Math.max, n);
  ["u", "d"].forEach((r) => {
    ["l", "r"].forEach((s) => {
      let l = r + s, a = e[l];
      if (a === t) return;
      let u = Object.values(a), c = o - jt.applyWithChunking(Math.min, u);
      s !== "l" && (c = i - jt.applyWithChunking(Math.max, u)), c && (e[l] = jt.mapValues(a, (f) => f + c));
    });
  });
}
function iy(e, t) {
  return jt.mapValues(e.ul, (n, o) => {
    if (t)
      return e[t.toLowerCase()][o];
    {
      let i = Object.values(e).map((r) => r[o]).sort((r, s) => r - s);
      return (i[1] + i[2]) / 2;
    }
  });
}
function ry(e) {
  let t = jt.buildLayerMatrix(e), n = Object.assign(
    Wm(e, t),
    Km(e, t)
  ), o = {}, i;
  ["u", "d"].forEach((s) => {
    i = s === "u" ? t : Object.values(t).reverse(), ["l", "r"].forEach((l) => {
      l === "r" && (i = i.map((f) => Object.values(f).reverse()));
      let a = (s === "u" ? e.predecessors : e.successors).bind(e), u = Qm(e, i, n, a), c = ey(
        e,
        i,
        u.root,
        u.align,
        l === "r"
      );
      l === "r" && (c = jt.mapValues(c, (f) => -f)), o[s + l] = c;
    });
  });
  let r = ny(e, o);
  return oy(o, r), iy(o, e.graph().align);
}
function sy(e, t, n) {
  return (o, i, r) => {
    let s = o.node(i), l = o.node(r), a = 0, u;
    if (a += s.width / 2, Object.hasOwn(s, "labelpos"))
      switch (s.labelpos.toLowerCase()) {
        case "l":
          u = -s.width / 2;
          break;
        case "r":
          u = s.width / 2;
          break;
      }
    if (u && (a += n ? u : -u), u = 0, a += (s.dummy ? t : e) / 2, a += (l.dummy ? t : e) / 2, a += l.width / 2, Object.hasOwn(l, "labelpos"))
      switch (l.labelpos.toLowerCase()) {
        case "l":
          u = l.width / 2;
          break;
        case "r":
          u = -l.width / 2;
          break;
      }
    return u && (a += n ? u : -u), u = 0, a;
  };
}
function ly(e, t) {
  return e.node(t).width;
}
let Rc = Xe, ay = qm.positionX;
var uy = cy;
function cy(e) {
  e = Rc.asNonCompoundGraph(e), dy(e), Object.entries(ay(e)).forEach(([t, n]) => e.node(t).x = n);
}
function dy(e) {
  let t = Rc.buildLayerMatrix(e), n = e.graph().ranksep, o = 0;
  t.forEach((i) => {
    const r = i.reduce((s, l) => {
      const a = e.node(l).height;
      return s > a ? s : a;
    }, 0);
    i.forEach((s) => e.node(s).y = o + r / 2), o += r + n;
  });
}
let Wl = hg, Kl = yg, fy = Hg, hy = Xe.normalizeRanks, py = Yg, vy = Xe.removeEmptyRanks, Zl = Kg, gy = nm, Jl = im, my = Gm, yy = uy, _t = Xe, by = St.Graph;
var _y = wy;
function wy(e, t) {
  let n = t && t.debugTiming ? _t.time : _t.notime;
  n("layout", () => {
    let o = n("  buildLayoutGraph", () => Oy(e));
    n("  runLayout", () => Ey(o, n, t)), n("  updateInputGraph", () => xy(e, o));
  });
}
function Ey(e, t, n) {
  t("    makeSpaceForEdgeLabels", () => Ty(e)), t("    removeSelfEdges", () => Fy(e)), t("    acyclic", () => Wl.run(e)), t("    nestingGraph.run", () => Zl.run(e)), t("    rank", () => fy(_t.asNonCompoundGraph(e))), t("    injectEdgeLabelProxies", () => Py(e)), t("    removeEmptyRanks", () => vy(e)), t("    nestingGraph.cleanup", () => Zl.cleanup(e)), t("    normalizeRanks", () => hy(e)), t("    assignRankMinMax", () => Dy(e)), t("    removeEdgeLabelProxies", () => Ay(e)), t("    normalize.run", () => Kl.run(e)), t("    parentDummyChains", () => py(e)), t("    addBorderSegments", () => gy(e)), t("    order", () => my(e, n)), t("    insertSelfEdges", () => Hy(e)), t("    adjustCoordinateSystem", () => Jl.adjust(e)), t("    position", () => yy(e)), t("    positionSelfEdges", () => Uy(e)), t("    removeBorderNodes", () => By(e)), t("    normalize.undo", () => Kl.undo(e)), t("    fixupEdgeLabelCoords", () => Vy(e)), t("    undoCoordinateSystem", () => Jl.undo(e)), t("    translateGraph", () => Ry(e)), t("    assignNodeIntersects", () => Ly(e)), t("    reversePoints", () => zy(e)), t("    acyclic.undo", () => Wl.undo(e));
}
function xy(e, t) {
  e.nodes().forEach((n) => {
    let o = e.node(n), i = t.node(n);
    o && (o.x = i.x, o.y = i.y, o.rank = i.rank, t.children(n).length && (o.width = i.width, o.height = i.height));
  }), e.edges().forEach((n) => {
    let o = e.edge(n), i = t.edge(n);
    o.points = i.points, Object.hasOwn(i, "x") && (o.x = i.x, o.y = i.y);
  }), e.graph().width = t.graph().width, e.graph().height = t.graph().height;
}
let ky = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"], Sy = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: "tb" }, Cy = ["acyclicer", "ranker", "rankdir", "align"], Ny = ["width", "height", "rank"], Ql = { width: 0, height: 0 }, $y = ["minlen", "weight", "width", "height", "labeloffset"], My = {
  minlen: 1,
  weight: 1,
  width: 0,
  height: 0,
  labeloffset: 10,
  labelpos: "r"
}, Iy = ["labelpos"];
function Oy(e) {
  let t = new by({ multigraph: !0, compound: !0 }), n = kr(e.graph());
  return t.setGraph(Object.assign(
    {},
    Sy,
    xr(n, ky),
    _t.pick(n, Cy)
  )), e.nodes().forEach((o) => {
    let i = kr(e.node(o));
    const r = xr(i, Ny);
    Object.keys(Ql).forEach((s) => {
      r[s] === void 0 && (r[s] = Ql[s]);
    }), t.setNode(o, r), t.setParent(o, e.parent(o));
  }), e.edges().forEach((o) => {
    let i = kr(e.edge(o));
    t.setEdge(o, Object.assign(
      {},
      My,
      xr(i, $y),
      _t.pick(i, Iy)
    ));
  }), t;
}
function Ty(e) {
  let t = e.graph();
  t.ranksep /= 2, e.edges().forEach((n) => {
    let o = e.edge(n);
    o.minlen *= 2, o.labelpos.toLowerCase() !== "c" && (t.rankdir === "TB" || t.rankdir === "BT" ? o.width += o.labeloffset : o.height += o.labeloffset);
  });
}
function Py(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t);
    if (n.width && n.height) {
      let o = e.node(t.v), r = { rank: (e.node(t.w).rank - o.rank) / 2 + o.rank, e: t };
      _t.addDummyNode(e, "edge-proxy", r, "_ep");
    }
  });
}
function Dy(e) {
  let t = 0;
  e.nodes().forEach((n) => {
    let o = e.node(n);
    o.borderTop && (o.minRank = e.node(o.borderTop).rank, o.maxRank = e.node(o.borderBottom).rank, t = Math.max(t, o.maxRank));
  }), e.graph().maxRank = t;
}
function Ay(e) {
  e.nodes().forEach((t) => {
    let n = e.node(t);
    n.dummy === "edge-proxy" && (e.edge(n.e).labelRank = n.rank, e.removeNode(t));
  });
}
function Ry(e) {
  let t = Number.POSITIVE_INFINITY, n = 0, o = Number.POSITIVE_INFINITY, i = 0, r = e.graph(), s = r.marginx || 0, l = r.marginy || 0;
  function a(u) {
    let c = u.x, f = u.y, p = u.width, g = u.height;
    t = Math.min(t, c - p / 2), n = Math.max(n, c + p / 2), o = Math.min(o, f - g / 2), i = Math.max(i, f + g / 2);
  }
  e.nodes().forEach((u) => a(e.node(u))), e.edges().forEach((u) => {
    let c = e.edge(u);
    Object.hasOwn(c, "x") && a(c);
  }), t -= s, o -= l, e.nodes().forEach((u) => {
    let c = e.node(u);
    c.x -= t, c.y -= o;
  }), e.edges().forEach((u) => {
    let c = e.edge(u);
    c.points.forEach((f) => {
      f.x -= t, f.y -= o;
    }), Object.hasOwn(c, "x") && (c.x -= t), Object.hasOwn(c, "y") && (c.y -= o);
  }), r.width = n - t + s, r.height = i - o + l;
}
function Ly(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t), o = e.node(t.v), i = e.node(t.w), r, s;
    n.points ? (r = n.points[0], s = n.points[n.points.length - 1]) : (n.points = [], r = i, s = o), n.points.unshift(_t.intersectRect(o, r)), n.points.push(_t.intersectRect(i, s));
  });
}
function Vy(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t);
    if (Object.hasOwn(n, "x"))
      switch ((n.labelpos === "l" || n.labelpos === "r") && (n.width -= n.labeloffset), n.labelpos) {
        case "l":
          n.x -= n.width / 2 + n.labeloffset;
          break;
        case "r":
          n.x += n.width / 2 + n.labeloffset;
          break;
      }
  });
}
function zy(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t);
    n.reversed && n.points.reverse();
  });
}
function By(e) {
  e.nodes().forEach((t) => {
    if (e.children(t).length) {
      let n = e.node(t), o = e.node(n.borderTop), i = e.node(n.borderBottom), r = e.node(n.borderLeft[n.borderLeft.length - 1]), s = e.node(n.borderRight[n.borderRight.length - 1]);
      n.width = Math.abs(s.x - r.x), n.height = Math.abs(i.y - o.y), n.x = r.x + n.width / 2, n.y = o.y + n.height / 2;
    }
  }), e.nodes().forEach((t) => {
    e.node(t).dummy === "border" && e.removeNode(t);
  });
}
function Fy(e) {
  e.edges().forEach((t) => {
    if (t.v === t.w) {
      var n = e.node(t.v);
      n.selfEdges || (n.selfEdges = []), n.selfEdges.push({ e: t, label: e.edge(t) }), e.removeEdge(t);
    }
  });
}
function Hy(e) {
  var t = _t.buildLayerMatrix(e);
  t.forEach((n) => {
    var o = 0;
    n.forEach((i, r) => {
      var s = e.node(i);
      s.order = r + o, (s.selfEdges || []).forEach((l) => {
        _t.addDummyNode(e, "selfedge", {
          width: l.label.width,
          height: l.label.height,
          rank: s.rank,
          order: r + ++o,
          e: l.e,
          label: l.label
        }, "_se");
      }), delete s.selfEdges;
    });
  });
}
function Uy(e) {
  e.nodes().forEach((t) => {
    var n = e.node(t);
    if (n.dummy === "selfedge") {
      var o = e.node(n.e.v), i = o.x + o.width / 2, r = o.y, s = n.x - i, l = o.height / 2;
      e.setEdge(n.e, n.label), e.removeNode(t), n.label.points = [
        { x: i + 2 * s / 3, y: r - l },
        { x: i + 5 * s / 6, y: r - l },
        { x: i + s, y: r },
        { x: i + 5 * s / 6, y: r + l },
        { x: i + 2 * s / 3, y: r + l }
      ], n.label.x = n.x, n.label.y = n.y;
    }
  });
}
function xr(e, t) {
  return _t.mapValues(_t.pick(e, t), Number);
}
function kr(e) {
  var t = {};
  return e && Object.entries(e).forEach(([n, o]) => {
    typeof n == "string" && (n = n.toLowerCase()), t[n] = o;
  }), t;
}
let jy = Xe, Gy = St.Graph;
var Yy = {
  debugOrdering: Xy
};
function Xy(e) {
  let t = jy.buildLayerMatrix(e), n = new Gy({ compound: !0, multigraph: !0 }).setGraph({});
  return e.nodes().forEach((o) => {
    n.setNode(o, { label: o }), n.setParent(o, "layer" + e.node(o).rank);
  }), e.edges().forEach((o) => n.setEdge(o.v, o.w, {}, o.name)), t.forEach((o, i) => {
    let r = "layer" + i;
    n.setNode(r, { rank: "same" }), o.reduce((s, l) => (n.setEdge(s, l, { style: "invis" }), l));
  }), n;
}
var qy = "1.1.5", Wy = {
  graphlib: St,
  layout: _y,
  debug: Yy,
  util: {
    time: Xe.time,
    notime: Xe.notime
  },
  version: qy
};
const ea = /* @__PURE__ */ Yp(Wy), ta = 190, na = 78, oa = ["profile", "memory", "rag", "extensions", "voice", "live2d"];
function Ky(e) {
  const t = e.nodes.find((a) => a.data.kind === "persona"), n = e.nodes.find((a) => a.data.kind === "extensions");
  if (!t || !n) return;
  const o = /* @__PURE__ */ new Map(), i = e.nodes.filter((a) => a.type === "module" && a.data.kind !== "extensions").sort((a, u) => oa.indexOf(a.data.kind) - oa.indexOf(u.data.kind));
  i.forEach((a, u) => o.set(a.id, { x: 34, y: 24 + u * 112 }));
  const r = 24 + (i.length - 1) * 112 / 2;
  o.set(t.id, { x: 340, y: r }), o.set(n.id, { x: 650, y: r });
  const s = new Set(e.edges.filter((a) => a.source === n.id).map((a) => a.target)), l = e.nodes.filter((a) => s.has(a.id)).sort((a, u) => a.data.level - u.data.level || a.data.label.localeCompare(u.data.label));
  if (l.length > 1) {
    const a = Math.min(3, l.length);
    l.forEach((u, c) => o.set(u.id, {
      x: 960 + c % a * 230,
      y: 24 + Math.floor(c / a) * 108
    }));
  } else if (l.length === 1) {
    const a = l[0];
    o.set(a.id, { x: 960, y: o.get(n.id).y });
    const u = /* @__PURE__ */ new Map([[a.id, 0]]), c = [a.id];
    for (; c.length; ) {
      const p = c.shift(), g = u.get(p);
      e.edges.filter((_) => _.source === p).forEach((_) => {
        u.has(_.target) || (u.set(_.target, g + 1), c.push(_.target));
      });
    }
    const f = Math.max(0, ...u.values());
    for (let p = 1; p <= f; p += 1) {
      const g = e.nodes.filter((C) => u.get(C.id) === p).sort((C, $) => C.data.label.localeCompare($.data.label)), _ = o.get(n.id).y;
      g.forEach((C, $) => o.set(C.id, {
        x: 960 + p * 260,
        y: _ + ($ - (g.length - 1) / 2) * 104
      }));
    }
  }
  return {
    nodes: e.nodes.map((a) => ({ ...a, position: o.get(a.id) || a.position })),
    edges: e.edges.map((a) => ({ ...a }))
  };
}
function Zy(e) {
  const t = Ky(e);
  if (t) return t;
  const n = new ea.graphlib.Graph();
  return n.setDefaultEdgeLabel(() => ({})), n.setGraph({ rankdir: "LR", nodesep: 34, ranksep: 96, marginx: 28, marginy: 28 }), [...e.nodes].sort((o, i) => o.id.localeCompare(i.id)).forEach((o) => n.setNode(o.id, { width: ta, height: na })), [...e.edges].sort((o, i) => o.id.localeCompare(i.id)).forEach((o) => n.setEdge(o.source, o.target)), ea.layout(n), {
    nodes: e.nodes.map((o) => {
      const i = n.node(o.id);
      return { ...o, position: { x: i.x - ta / 2, y: i.y - na / 2 } };
    }),
    edges: e.edges.map((o) => ({ ...o }))
  };
}
function Jy(e, t) {
  const n = /* @__PURE__ */ new Set([t]), o = [t];
  for (; o.length; ) {
    const i = o.shift();
    for (const r of e.edges)
      r.source !== i || n.has(r.target) || (n.add(r.target), o.push(r.target));
  }
  return n;
}
function Qy(e, t, n) {
  if (n.has(t)) return t;
  const o = /* @__PURE__ */ new Set(), i = [t];
  for (; i.length; ) {
    const r = i.shift();
    if (!o.has(r)) {
      o.add(r);
      for (const s of e.edges)
        if (s.target === r) {
          if (n.has(s.source)) return s.source;
          i.push(s.source);
        }
    }
  }
}
function e0(e, t) {
  var a;
  const n = e.nodes.find((u) => u.data.kind === "persona");
  if (!n) return e;
  const o = (a = e.nodes.find((u) => u.data.kind === "extensions")) == null ? void 0 : a.id, i = new Set(
    e.edges.filter((u) => u.source === (o || n.id)).map((u) => u.target).filter((u) => e.nodes.some((c) => c.id === u && ["skill", "tool"].includes(c.data.kind)))
  ), r = Qy(e, t, i), s = t === o, l = /* @__PURE__ */ new Set([
    n.id,
    ...e.nodes.filter((u) => u.type === "module").map((u) => u.id),
    ...r ? [r] : s ? i : []
  ]);
  return r && Jy(e, r).forEach((u) => l.add(u)), {
    nodes: e.nodes.filter((u) => l.has(u.id)),
    edges: e.edges.filter((u) => l.has(u.source) && l.has(u.target))
  };
}
const t0 = ["aria-busy"], n0 = {
  key: 0,
  class: "inspect-fields"
}, o0 = ["value"], i0 = ["value"], r0 = ["value"], s0 = { class: "inspect-fieldset" }, l0 = ["value"], a0 = ["value"], u0 = ["value"], c0 = ["value"], d0 = ["value"], f0 = { class: "inline-check" }, h0 = ["checked"], p0 = {
  key: 1,
  class: "inspect-stack rag-inspector"
}, v0 = ["disabled"], g0 = {
  key: 0,
  class: "pending-files"
}, m0 = ["onClick"], y0 = ["onClick"], b0 = ["disabled"], _0 = { class: "document-items" }, w0 = { class: "document-actions" }, E0 = ["onClick"], x0 = ["onClick"], k0 = ["onClick"], S0 = {
  key: 2,
  class: "inspect-stack"
}, C0 = {
  key: 3,
  class: "inspect-stack"
}, N0 = {
  key: 4,
  class: "inspect-fields"
}, $0 = { class: "inline-check" }, M0 = ["checked"], I0 = { class: "inline-check" }, O0 = ["checked"], T0 = ["value"], P0 = ["value"], D0 = ["value"], A0 = { class: "inspect-button-row" }, R0 = ["disabled"], L0 = {
  key: 5,
  class: "live2d-model-library"
}, V0 = { class: "live2d-binding-summary" }, z0 = ["disabled"], B0 = { class: "live2d-library-actions" }, F0 = ["disabled"], H0 = ["disabled"], U0 = { class: "live2d-model-heading" }, j0 = {
  key: 0,
  class: "live2d-model-items"
}, G0 = { class: "live2d-model-copy" }, Y0 = { class: "live2d-model-state" }, X0 = {
  key: 0,
  type: "button",
  disabled: "",
  class: "is-bound"
}, q0 = ["disabled", "title", "onClick"], W0 = {
  key: 1,
  class: "live2d-model-empty"
}, K0 = {
  key: 6,
  class: "inspect-fields"
}, Z0 = { key: 0 }, J0 = ["value"], Q0 = { key: 1 }, e1 = {
  key: 2,
  class: "dependency-list"
}, t1 = {
  key: 7,
  class: "inspect-fields"
}, n1 = { class: "inline-check" }, o1 = ["checked", "disabled"], i1 = /* @__PURE__ */ Oe({
  __name: "NodeInspector",
  props: {
    node: {},
    draft: {},
    disabled: { type: Boolean },
    uploadCompleteToken: {}
  },
  emits: ["profile", "capability", "server", "upload", "deleteDocument", "retryDocument", "deletePersona", "previewVoice", "openVoiceStudio", "openRagEval", "previewDocument", "previewLocalFile", "refreshLive2d", "openLive2dDirectory"],
  setup(e, { emit: t }) {
    const n = e, o = t, i = ie([]), r = ie(""), s = ie(0), l = de(() => {
      var T;
      return ((T = n.node) == null ? void 0 : T.data.kind) || "persona";
    }), a = de(() => n.draft.capabilities.packages.find((T) => {
      var N;
      return T.id === ((N = n.node) == null ? void 0 : N.id);
    })), u = de(() => l.value === "mcp" ? n.draft.grants.servers.find((T) => {
      var N;
      return `mcp:${T.name}` === ((N = n.node) == null ? void 0 : N.id);
    }) : void 0), c = de(() => {
      const T = n.node ? n.draft.capabilities.overrides[n.node.id] : void 0;
      return T === !0 ? "allow" : T === !1 ? "deny" : "inherit";
    }), f = de(() => {
      var T, N;
      return String(((N = (T = n.draft.persona.profile) == null ? void 0 : T.live2d) == null ? void 0 : N.model) || "");
    }), p = de(() => {
      var T;
      return ((T = n.draft.resources) == null ? void 0 : T.live2dModels) || [];
    }), g = de(() => {
      var T;
      return { available: "可用", partial: "部分可用", unassigned: "未分配", blocked: "不可用", pending: "等待中", error: "异常" }[((T = n.node) == null ? void 0 : T.data.status) || "blocked"];
    });
    function _(T) {
      return T.kind === "cubism2" ? "Cubism 2" : T.moc_version ? `MOC3 v${T.moc_version}` : "Cubism / MOC3";
    }
    function C(T, N) {
      const V = qe(n.draft.persona), Z = { ...V.profile || {} };
      T === "name" ? V.name = String(N) : Z[T] = N, V.profile = Z, o("profile", V);
    }
    function $(T, N) {
      const V = qe(n.draft.persona), Z = { ...V.profile || {} };
      Z.tts = { ...Z.tts || {}, [T]: N }, V.profile = Z, o("profile", V);
    }
    function M(T) {
      const N = qe(n.draft.persona), V = { ...N.profile || {} };
      V.live2d = { ...V.live2d || {}, model: T }, N.profile = V, o("profile", N);
    }
    const D = de(() => {
      var T;
      return ((T = n.draft.persona.profile) == null ? void 0 : T.rag) || {};
    });
    function x(T, N) {
      const V = qe(n.draft.persona), Z = { ...V.profile || {} };
      Z.rag = { ...Z.rag || {}, [T]: N }, V.profile = Z, o("profile", V);
    }
    function w(T) {
      i.value = Array.from(T.target.files || []);
    }
    function H(T) {
      var N;
      i.value = Array.from(((N = T.dataTransfer) == null ? void 0 : N.files) || []);
    }
    function L(T) {
      i.value = i.value.filter((N, V) => V !== T);
    }
    function z() {
      n.disabled || !i.value.length && !r.value.trim() || o("upload", i.value, r.value);
    }
    return Se(() => n.uploadCompleteToken, () => {
      i.value = [], r.value = "", s.value += 1;
    }), (T, N) => {
      var V, Z, O, R, E, A, P, j, q, ee, oe, ce, te, ae, se, _e;
      return G(), X("aside", {
        class: xe(["node-inspector", { "is-disabled": T.disabled }]),
        "aria-busy": T.disabled
      }, [
        h("header", null, [
          h("div", null, [
            h("strong", null, Q(((V = T.node) == null ? void 0 : V.data.label) || "角色配置"), 1),
            h("small", null, Q((Z = T.node) == null ? void 0 : Z.data.summary), 1)
          ]),
          T.node ? (G(), X("span", {
            key: 0,
            class: xe(`inspect-status status-${T.node.data.status}`)
          }, Q(g.value), 3)) : ke("", !0)
        ]),
        l.value === "profile" ? (G(), X("div", n0, [
          h("label", null, [
            N[24] || (N[24] = h("span", null, "角色名称", -1)),
            h("input", {
              value: T.draft.persona.name,
              onInput: N[0] || (N[0] = (W) => C("name", W.target.value))
            }, null, 40, o0)
          ]),
          h("label", null, [
            N[25] || (N[25] = h("span", null, "角色人设", -1)),
            h("textarea", {
              rows: "7",
              value: String(((O = T.draft.persona.profile) == null ? void 0 : O.description) || ""),
              onInput: N[1] || (N[1] = (W) => C("description", W.target.value))
            }, null, 40, i0)
          ]),
          h("label", null, [
            N[27] || (N[27] = h("span", null, "回复语言", -1)),
            h("select", {
              value: String(((R = T.draft.persona.profile) == null ? void 0 : R.reply_language) || ""),
              onChange: N[2] || (N[2] = (W) => C("reply_language", W.target.value))
            }, N[26] || (N[26] = [
              h("option", { value: "" }, "跟随对话", -1),
              h("option", { value: "zh" }, "中文", -1),
              h("option", { value: "ja" }, "日语", -1),
              h("option", { value: "en" }, "英语", -1)
            ]), 40, r0)
          ]),
          h("fieldset", s0, [
            N[35] || (N[35] = h("legend", null, "知识检索", -1)),
            h("label", null, [
              N[29] || (N[29] = h("span", null, "检索预设", -1)),
              h("select", {
                value: String(D.value.profile || "deep"),
                onChange: N[3] || (N[3] = (W) => x("profile", W.target.value))
              }, N[28] || (N[28] = [
                h("option", { value: "precise" }, "精准检索", -1),
                h("option", { value: "deep" }, "深度检索", -1),
                h("option", { value: "custom" }, "自定义", -1)
              ]), 40, l0)
            ]),
            D.value.profile === "custom" ? (G(), X(ye, { key: 0 }, [
              h("label", null, [
                N[30] || (N[30] = h("span", null, "初始召回 K", -1)),
                h("input", {
                  type: "number",
                  min: "1",
                  max: "100",
                  value: D.value.retrieval_k || 20,
                  onChange: N[4] || (N[4] = (W) => x("retrieval_k", Number(W.target.value)))
                }, null, 40, a0)
              ]),
              h("label", null, [
                N[31] || (N[31] = h("span", null, "重排保留 K", -1)),
                h("input", {
                  type: "number",
                  min: "1",
                  max: "100",
                  value: D.value.rerank_k || 8,
                  onChange: N[5] || (N[5] = (W) => x("rerank_k", Number(W.target.value)))
                }, null, 40, u0)
              ]),
              h("label", null, [
                N[32] || (N[32] = h("span", null, "最终上下文 K", -1)),
                h("input", {
                  type: "number",
                  min: "1",
                  max: "30",
                  value: D.value.final_context_k || 8,
                  onChange: N[6] || (N[6] = (W) => x("final_context_k", Number(W.target.value)))
                }, null, 40, c0)
              ]),
              h("label", null, [
                N[33] || (N[33] = h("span", null, "证据 Token 预算", -1)),
                h("input", {
                  type: "number",
                  min: "256",
                  max: "20000",
                  step: "256",
                  value: D.value.evidence_token_budget || 4500,
                  onChange: N[7] || (N[7] = (W) => x("evidence_token_budget", Number(W.target.value)))
                }, null, 40, d0)
              ]),
              h("label", f0, [
                h("input", {
                  type: "checkbox",
                  checked: D.value.allow_neighbors !== !1,
                  onChange: N[8] || (N[8] = (W) => x("allow_neighbors", W.target.checked))
                }, null, 40, h0),
                N[34] || (N[34] = h("span", null, "允许补充相邻片段", -1))
              ])
            ], 64)) : ke("", !0),
            N[36] || (N[36] = h("small", null, "查询时直接使用这里保存的参数，不额外调用模型判断检索模式。", -1))
          ]),
          h("button", {
            type: "button",
            class: "inspect-danger",
            onClick: N[9] || (N[9] = (W) => o("deletePersona"))
          }, [
            re(F(wo), { size: 15 }),
            N[37] || (N[37] = Pe("删除当前角色"))
          ])
        ])) : l.value === "rag" ? (G(), X("div", p0, [
          h("p", null, Q(T.draft.documents.length) + " 份资料已关联到角色知识空间。", 1),
          h("label", {
            class: "document-picker",
            onDragover: N[10] || (N[10] = Io(() => {
            }, ["prevent"])),
            onDrop: Io(H, ["prevent"])
          }, [
            re(F(Zr), { size: 15 }),
            h("span", null, Q(i.value.length ? `已选择 ${i.value.length} 个文件` : "选择或拖入资料文件"), 1),
            (G(), X("input", {
              key: s.value,
              type: "file",
              multiple: "",
              disabled: T.disabled,
              onChange: w
            }, null, 40, v0))
          ], 32),
          i.value.length ? (G(), X("ul", g0, [
            (G(!0), X(ye, null, Le(i.value, (W, he) => (G(), X("li", {
              key: `${W.name}-${W.size}-${he}`
            }, [
              h("span", null, Q(W.name), 1),
              h("span", null, [
                h("button", {
                  type: "button",
                  title: "上传前预览",
                  onClick: (we) => o("previewLocalFile", W)
                }, [
                  re(F(Ol), { size: 14 })
                ], 8, m0),
                h("button", {
                  type: "button",
                  title: "移除",
                  onClick: (we) => L(he)
                }, [
                  re(F(wo), { size: 14 })
                ], 8, y0)
              ])
            ]))), 128))
          ])) : ke("", !0),
          h("label", null, [
            N[38] || (N[38] = h("span", null, "补充文本", -1)),
            je(h("textarea", {
              "onUpdate:modelValue": N[11] || (N[11] = (W) => r.value = W),
              rows: "3",
              placeholder: "直接写入角色知识库"
            }, null, 512), [
              [it, r.value]
            ])
          ]),
          h("button", {
            type: "button",
            class: "inspect-action",
            disabled: T.disabled || !i.value.length && !r.value.trim(),
            onClick: z
          }, [
            re(F(Zr), { size: 15 }),
            Pe(Q(T.disabled ? "处理中" : "写入知识库"), 1)
          ], 8, b0),
          h("ul", _0, [
            (G(!0), X(ye, null, Le(T.draft.documents, (W) => (G(), X("li", {
              key: String(W.id)
            }, [
              h("div", null, [
                h("b", null, Q(W.original_filename || W.original_name || W.id), 1),
                h("span", null, Q(W.status), 1)
              ]),
              h("span", w0, [
                h("button", {
                  type: "button",
                  title: "预览 Markdown",
                  onClick: (he) => o("previewDocument", W)
                }, [
                  re(F(Ol), { size: 14 })
                ], 8, E0),
                W.status === "index_failed" ? (G(), X("button", {
                  key: 0,
                  type: "button",
                  title: "重新索引",
                  onClick: (he) => o("retryDocument", String(W.id))
                }, [
                  re(F(ac), { size: 14 })
                ], 8, x0)) : ke("", !0),
                h("button", {
                  type: "button",
                  title: "删除资料",
                  onClick: (he) => o("deleteDocument", String(W.id))
                }, [
                  re(F(wo), { size: 14 })
                ], 8, k0)
              ])
            ]))), 128))
          ]),
          h("button", {
            type: "button",
            class: "inspect-action",
            onClick: N[12] || (N[12] = (W) => o("openRagEval"))
          }, [
            re(F(Il), { size: 15 }),
            N[39] || (N[39] = Pe("前往 RAG 评测"))
          ])
        ])) : l.value === "memory" ? (G(), X("div", S0, N[40] || (N[40] = [
          h("p", null, "会话记忆按对话窗口隔离，长期记忆与角色绑定。", -1),
          h("small", null, "清理操作继续在对应对话或接入窗口执行，避免误清其他会话。", -1)
        ]))) : l.value === "extensions" ? (G(), X("div", C0, [
          h("p", null, "当前角色可配置 " + Q(T.draft.capabilities.packages.length) + " 项扩展能力。", 1),
          N[41] || (N[41] = h("small", null, "选择画布中的 Skill 或 Tool 查看依赖并设置角色策略；依赖只在选中时展开。", -1))
        ])) : l.value === "voice" ? (G(), X("div", N0, [
          h("label", $0, [
            h("input", {
              type: "checkbox",
              checked: !!((A = (E = T.draft.persona.profile) == null ? void 0 : E.tts) != null && A.enabled),
              onChange: N[13] || (N[13] = (W) => $("enabled", W.target.checked))
            }, null, 40, M0),
            N[42] || (N[42] = h("span", null, "生成语音", -1))
          ]),
          h("label", I0, [
            h("input", {
              type: "checkbox",
              checked: !!((j = (P = T.draft.persona.profile) == null ? void 0 : P.tts) != null && j.auto_play),
              onChange: N[14] || (N[14] = (W) => $("auto_play", W.target.checked))
            }, null, 40, O0),
            N[43] || (N[43] = h("span", null, "自动播放", -1))
          ]),
          h("label", null, [
            N[45] || (N[45] = h("span", null, "角色音色", -1)),
            h("select", {
              value: String(((ee = (q = T.draft.persona.profile) == null ? void 0 : q.tts) == null ? void 0 : ee.voice_asset_id) || ""),
              onChange: N[15] || (N[15] = (W) => $("voice_asset_id", W.target.value))
            }, [
              N[44] || (N[44] = h("option", { value: "" }, "不绑定音色", -1)),
              (G(!0), X(ye, null, Le((oe = T.draft.resources) == null ? void 0 : oe.voiceAssets, (W) => (G(), X("option", {
                key: W.id,
                value: W.id
              }, Q(W.name), 9, P0))), 128))
            ], 40, T0)
          ]),
          h("label", null, [
            N[47] || (N[47] = h("span", null, "输出语言", -1)),
            h("select", {
              value: String(((te = (ce = T.draft.persona.profile) == null ? void 0 : ce.tts) == null ? void 0 : te.output_language) || "auto"),
              onChange: N[16] || (N[16] = (W) => $("output_language", W.target.value))
            }, N[46] || (N[46] = [
              h("option", { value: "auto" }, "自动", -1),
              h("option", { value: "zh" }, "中文", -1),
              h("option", { value: "ja" }, "日语", -1),
              h("option", { value: "en" }, "英语", -1)
            ]), 40, D0)
          ]),
          h("div", A0, [
            h("button", {
              type: "button",
              class: "inspect-action",
              disabled: !((se = (ae = T.draft.persona.profile) == null ? void 0 : ae.tts) != null && se.voice_asset_id),
              onClick: N[17] || (N[17] = (W) => o("previewVoice"))
            }, [
              re(F(lc), { size: 15 }),
              N[48] || (N[48] = Pe("试听"))
            ], 8, R0),
            h("button", {
              type: "button",
              class: "inspect-action",
              onClick: N[18] || (N[18] = (W) => o("openVoiceStudio"))
            }, [
              re(F(Il), { size: 15 }),
              N[49] || (N[49] = Pe("声音工坊"))
            ])
          ])
        ])) : l.value === "live2d" ? (G(), X("div", L0, [
          h("section", V0, [
            N[50] || (N[50] = h("span", null, "当前角色绑定", -1)),
            h("strong", null, Q(f.value || "未绑定模型"), 1),
            f.value ? (G(), X("button", {
              key: 0,
              type: "button",
              disabled: T.disabled,
              onClick: N[19] || (N[19] = (W) => M(""))
            }, "解除绑定", 8, z0)) : ke("", !0)
          ]),
          h("div", B0, [
            h("button", {
              type: "button",
              disabled: T.disabled,
              title: "重新扫描模型",
              onClick: N[20] || (N[20] = (W) => o("refreshLive2d"))
            }, [
              re(F(qr), { size: 15 }),
              N[51] || (N[51] = Pe("刷新"))
            ], 8, F0),
            h("button", {
              type: "button",
              disabled: T.disabled,
              title: "打开 Live2D 模型文件夹",
              onClick: N[21] || (N[21] = (W) => o("openLive2dDirectory"))
            }, [
              re(F(sc), { size: 15 }),
              N[52] || (N[52] = Pe("打开文件夹"))
            ], 8, H0)
          ]),
          h("div", U0, [
            N[53] || (N[53] = h("strong", null, "已安装模型", -1)),
            h("span", null, Q(p.value.length) + " 个", 1)
          ]),
          p.value.length ? (G(), X("ul", j0, [
            (G(!0), X(ye, null, Le(p.value, (W) => (G(), X("li", {
              key: W.id,
              class: xe({ bound: f.value === W.id, incompatible: W.compatible === !1 })
            }, [
              h("div", G0, [
                h("strong", null, Q(W.name), 1),
                h("span", null, Q(_(W)), 1)
              ]),
              h("div", Y0, [
                h("span", {
                  class: xe(W.compatible === !1 ? "is-error" : "is-compatible")
                }, Q(W.compatible === !1 ? "不兼容" : "兼容"), 3),
                f.value === W.id ? (G(), X("button", X0, [
                  re(F(bp), { size: 14 }),
                  N[54] || (N[54] = Pe("已绑定"))
                ])) : (G(), X("button", {
                  key: 1,
                  type: "button",
                  disabled: T.disabled || W.compatible === !1,
                  title: W.compatible === !1 ? "当前 Live2D 运行时不支持此 MOC3 版本" : `绑定 ${W.name}`,
                  onClick: (he) => M(W.id)
                }, "绑定", 8, q0))
              ])
            ], 2))), 128))
          ])) : (G(), X("div", W0, N[55] || (N[55] = [
            h("strong", null, "尚未发现模型", -1),
            h("p", null, "将模型文件夹放入 data/live2d 后刷新。", -1)
          ]))),
          N[56] || (N[56] = h("p", { class: "live2d-save-hint" }, "绑定修改会随页面顶部“保存配置”一起生效。", -1))
        ])) : l.value === "skill" || l.value === "tool" ? (G(), X("div", K0, [
          a.value ? (G(), X("label", Z0, [
            N[58] || (N[58] = h("span", null, "角色策略", -1)),
            h("select", {
              value: c.value,
              onChange: N[22] || (N[22] = (W) => o("capability", T.node.id, W.target.value))
            }, N[57] || (N[57] = [
              h("option", { value: "inherit" }, "继承默认", -1),
              h("option", { value: "allow" }, "允许", -1),
              h("option", { value: "deny" }, "禁用", -1)
            ]), 40, J0)
          ])) : (G(), X("p", Q0, "此 Tool 由上级能力包管理，不单独保存开关。")),
          a.value ? (G(), X("div", e1, [
            N[59] || (N[59] = h("b", null, "依赖", -1)),
            (G(!0), X(ye, null, Le(a.value.dependencies, (W) => (G(), X("p", {
              key: W.id || W.name
            }, [
              h("span", null, Q(W.name), 1),
              h("em", null, Q(W.server || W.source), 1)
            ]))), 128))
          ])) : ke("", !0)
        ])) : l.value === "mcp" && u.value ? (G(), X("div", t1, [
          h("label", n1, [
            h("input", {
              type: "checkbox",
              checked: u.value.authorized,
              disabled: u.value.global,
              onChange: N[23] || (N[23] = (W) => o("server", u.value.name, W.target.checked))
            }, null, 40, o1),
            h("span", null, Q(u.value.global ? "全局授权" : "允许当前角色使用"), 1)
          ]),
          h("p", null, Q(u.value.description || "MCP 服务"), 1),
          h("small", null, "连接状态：" + Q(((_e = u.value.status) == null ? void 0 : _e.status) || "unknown"), 1)
        ])) : ke("", !0)
      ], 10, t0);
    };
  }
});
function Ki(e) {
  return Es() ? (li(e), !0) : !1;
}
function Gt(e) {
  return typeof e == "function" ? e() : F(e);
}
const r1 = typeof window < "u" && typeof document < "u", s1 = (e) => typeof e < "u", l1 = Object.prototype.toString, a1 = (e) => l1.call(e) === "[object Object]", u1 = () => {
};
function c1(e, t) {
  function n(...o) {
    return new Promise((i, r) => {
      Promise.resolve(e(() => t.apply(this, o), { fn: t, thisArg: this, args: o })).then(i).catch(r);
    });
  }
  return n;
}
const Lc = (e) => e();
function d1(e = Lc) {
  const t = ie(!0);
  function n() {
    t.value = !1;
  }
  function o() {
    t.value = !0;
  }
  const i = (...r) => {
    t.value && e(...r);
  };
  return { isActive: Ns(t), pause: n, resume: o, eventFilter: i };
}
function ia(e, t = !1, n = "Timeout") {
  return new Promise((o, i) => {
    setTimeout(t ? () => i(n) : o, e);
  });
}
function f1(e, t, n = {}) {
  const {
    eventFilter: o = Lc,
    ...i
  } = n;
  return Se(
    e,
    c1(
      o,
      t
    ),
    i
  );
}
function Vn(e, t, n = {}) {
  const {
    eventFilter: o,
    ...i
  } = n, { eventFilter: r, pause: s, resume: l, isActive: a } = d1(o);
  return { stop: f1(
    e,
    t,
    {
      ...i,
      eventFilter: r
    }
  ), pause: s, resume: l, isActive: a };
}
function h1(e, t = {}) {
  if (!He(e))
    return Of(e);
  const n = Array.isArray(e.value) ? Array.from({ length: e.value.length }) : {};
  for (const o in e.value)
    n[o] = If(() => ({
      get() {
        return e.value[o];
      },
      set(i) {
        var r;
        if ((r = Gt(t.replaceRef)) != null ? r : !0)
          if (Array.isArray(e.value)) {
            const l = [...e.value];
            l[o] = i, e.value = l;
          } else {
            const l = { ...e.value, [o]: i };
            Object.setPrototypeOf(l, Object.getPrototypeOf(e.value)), e.value = l;
          }
        else
          e.value[o] = i;
      }
    }));
  return n;
}
function ts(e, t = !1) {
  function n(f, { flush: p = "sync", deep: g = !1, timeout: _, throwOnTimeout: C } = {}) {
    let $ = null;
    const D = [new Promise((x) => {
      $ = Se(
        e,
        (w) => {
          f(w) !== t && ($ == null || $(), x(w));
        },
        {
          flush: p,
          deep: g,
          immediate: !0
        }
      );
    })];
    return _ != null && D.push(
      ia(_, C).then(() => Gt(e)).finally(() => $ == null ? void 0 : $())
    ), Promise.race(D);
  }
  function o(f, p) {
    if (!He(f))
      return n((w) => w === f, p);
    const { flush: g = "sync", deep: _ = !1, timeout: C, throwOnTimeout: $ } = p ?? {};
    let M = null;
    const x = [new Promise((w) => {
      M = Se(
        [e, f],
        ([H, L]) => {
          t !== (H === L) && (M == null || M(), w(H));
        },
        {
          flush: g,
          deep: _,
          immediate: !0
        }
      );
    })];
    return C != null && x.push(
      ia(C, $).then(() => Gt(e)).finally(() => (M == null || M(), Gt(e)))
    ), Promise.race(x);
  }
  function i(f) {
    return n((p) => !!p, f);
  }
  function r(f) {
    return o(null, f);
  }
  function s(f) {
    return o(void 0, f);
  }
  function l(f) {
    return n(Number.isNaN, f);
  }
  function a(f, p) {
    return n((g) => {
      const _ = Array.from(g);
      return _.includes(f) || _.includes(Gt(f));
    }, p);
  }
  function u(f) {
    return c(1, f);
  }
  function c(f = 1, p) {
    let g = -1;
    return n(() => (g += 1, g >= f), p);
  }
  return Array.isArray(Gt(e)) ? {
    toMatch: n,
    toContains: a,
    changed: u,
    changedTimes: c,
    get not() {
      return ts(e, !t);
    }
  } : {
    toMatch: n,
    toBe: o,
    toBeTruthy: i,
    toBeNull: r,
    toBeNaN: l,
    toBeUndefined: s,
    changed: u,
    changedTimes: c,
    get not() {
      return ts(e, !t);
    }
  };
}
function ns(e) {
  return ts(e);
}
function p1(e) {
  var t;
  const n = Gt(e);
  return (t = n == null ? void 0 : n.$el) != null ? t : n;
}
const Vc = r1 ? window : void 0;
function zc(...e) {
  let t, n, o, i;
  if (typeof e[0] == "string" || Array.isArray(e[0]) ? ([n, o, i] = e, t = Vc) : [t, n, o, i] = e, !t)
    return u1;
  Array.isArray(n) || (n = [n]), Array.isArray(o) || (o = [o]);
  const r = [], s = () => {
    r.forEach((c) => c()), r.length = 0;
  }, l = (c, f, p, g) => (c.addEventListener(f, p, g), () => c.removeEventListener(f, p, g)), a = Se(
    () => [p1(t), Gt(i)],
    ([c, f]) => {
      if (s(), !c)
        return;
      const p = a1(f) ? { ...f } : f;
      r.push(
        ...n.flatMap((g) => o.map((_) => l(c, g, _, p)))
      );
    },
    { immediate: !0, flush: "post" }
  ), u = () => {
    a(), s();
  };
  return Ki(u), u;
}
function v1(e) {
  return typeof e == "function" ? e : typeof e == "string" ? (t) => t.key === e : Array.isArray(e) ? (t) => e.includes(t.key) : () => !0;
}
function ra(...e) {
  let t, n, o = {};
  e.length === 3 ? (t = e[0], n = e[1], o = e[2]) : e.length === 2 ? typeof e[1] == "object" ? (t = !0, n = e[0], o = e[1]) : (t = e[0], n = e[1]) : (t = !0, n = e[0]);
  const {
    target: i = Vc,
    eventName: r = "keydown",
    passive: s = !1,
    dedupe: l = !1
  } = o, a = v1(t);
  return zc(i, r, (c) => {
    c.repeat && Gt(l) || a(c) && n(c);
  }, s);
}
function g1(e) {
  return JSON.parse(JSON.stringify(e));
}
function Sr(e, t, n, o = {}) {
  var i, r, s;
  const {
    clone: l = !1,
    passive: a = !1,
    eventName: u,
    deep: c = !1,
    defaultValue: f,
    shouldEmit: p
  } = o, g = no(), _ = n || (g == null ? void 0 : g.emit) || ((i = g == null ? void 0 : g.$emit) == null ? void 0 : i.bind(g)) || ((s = (r = g == null ? void 0 : g.proxy) == null ? void 0 : r.$emit) == null ? void 0 : s.bind(g == null ? void 0 : g.proxy));
  let C = u;
  t || (t = "modelValue"), C = C || `update:${t.toString()}`;
  const $ = (x) => l ? typeof l == "function" ? l(x) : g1(x) : x, M = () => s1(e[t]) ? $(e[t]) : f, D = (x) => {
    p ? p(x) && _(C, x) : _(C, x);
  };
  if (a) {
    const x = M(), w = ie(x);
    let H = !1;
    return Se(
      () => e[t],
      (L) => {
        H || (H = !0, w.value = $(L), Ze(() => H = !1));
      }
    ), Se(
      w,
      (L) => {
        !H && (L !== e[t] || c) && D(L);
      },
      { deep: c }
    ), w;
  } else
    return de({
      get() {
        return M();
      },
      set(x) {
        D(x);
      }
    });
}
var m1 = { value: () => {
} };
function Zi() {
  for (var e = 0, t = arguments.length, n = {}, o; e < t; ++e) {
    if (!(o = arguments[e] + "") || o in n || /[\s.]/.test(o))
      throw new Error("illegal type: " + o);
    n[o] = [];
  }
  return new fi(n);
}
function fi(e) {
  this._ = e;
}
function y1(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var o = "", i = n.indexOf(".");
    if (i >= 0 && (o = n.slice(i + 1), n = n.slice(0, i)), n && !t.hasOwnProperty(n))
      throw new Error("unknown type: " + n);
    return { type: n, name: o };
  });
}
fi.prototype = Zi.prototype = {
  constructor: fi,
  on: function(e, t) {
    var n = this._, o = y1(e + "", n), i, r = -1, s = o.length;
    if (arguments.length < 2) {
      for (; ++r < s; )
        if ((i = (e = o[r]).type) && (i = b1(n[i], e.name)))
          return i;
      return;
    }
    if (t != null && typeof t != "function")
      throw new Error("invalid callback: " + t);
    for (; ++r < s; )
      if (i = (e = o[r]).type)
        n[i] = sa(n[i], e.name, t);
      else if (t == null)
        for (i in n)
          n[i] = sa(n[i], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t)
      e[n] = t[n].slice();
    return new fi(e);
  },
  call: function(e, t) {
    if ((i = arguments.length - 2) > 0)
      for (var n = new Array(i), o = 0, i, r; o < i; ++o)
        n[o] = arguments[o + 2];
    if (!this._.hasOwnProperty(e))
      throw new Error("unknown type: " + e);
    for (r = this._[e], o = 0, i = r.length; o < i; ++o)
      r[o].value.apply(t, n);
  },
  apply: function(e, t, n) {
    if (!this._.hasOwnProperty(e))
      throw new Error("unknown type: " + e);
    for (var o = this._[e], i = 0, r = o.length; i < r; ++i)
      o[i].value.apply(t, n);
  }
};
function b1(e, t) {
  for (var n = 0, o = e.length, i; n < o; ++n)
    if ((i = e[n]).name === t)
      return i.value;
}
function sa(e, t, n) {
  for (var o = 0, i = e.length; o < i; ++o)
    if (e[o].name === t) {
      e[o] = m1, e = e.slice(0, o).concat(e.slice(o + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var os = "http://www.w3.org/1999/xhtml";
const la = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: os,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function Ji(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), la.hasOwnProperty(t) ? { space: la[t], local: e } : e;
}
function _1(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === os && t.documentElement.namespaceURI === os ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function w1(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function Bc(e) {
  var t = Ji(e);
  return (t.local ? w1 : _1)(t);
}
function E1() {
}
function zs(e) {
  return e == null ? E1 : function() {
    return this.querySelector(e);
  };
}
function x1(e) {
  typeof e != "function" && (e = zs(e));
  for (var t = this._groups, n = t.length, o = new Array(n), i = 0; i < n; ++i)
    for (var r = t[i], s = r.length, l = o[i] = new Array(s), a, u, c = 0; c < s; ++c)
      (a = r[c]) && (u = e.call(a, a.__data__, c, r)) && ("__data__" in a && (u.__data__ = a.__data__), l[c] = u);
  return new mt(o, this._parents);
}
function k1(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function S1() {
  return [];
}
function Fc(e) {
  return e == null ? S1 : function() {
    return this.querySelectorAll(e);
  };
}
function C1(e) {
  return function() {
    return k1(e.apply(this, arguments));
  };
}
function N1(e) {
  typeof e == "function" ? e = C1(e) : e = Fc(e);
  for (var t = this._groups, n = t.length, o = [], i = [], r = 0; r < n; ++r)
    for (var s = t[r], l = s.length, a, u = 0; u < l; ++u)
      (a = s[u]) && (o.push(e.call(a, a.__data__, u, s)), i.push(a));
  return new mt(o, i);
}
function Hc(e) {
  return function() {
    return this.matches(e);
  };
}
function Uc(e) {
  return function(t) {
    return t.matches(e);
  };
}
var $1 = Array.prototype.find;
function M1(e) {
  return function() {
    return $1.call(this.children, e);
  };
}
function I1() {
  return this.firstElementChild;
}
function O1(e) {
  return this.select(e == null ? I1 : M1(typeof e == "function" ? e : Uc(e)));
}
var T1 = Array.prototype.filter;
function P1() {
  return Array.from(this.children);
}
function D1(e) {
  return function() {
    return T1.call(this.children, e);
  };
}
function A1(e) {
  return this.selectAll(e == null ? P1 : D1(typeof e == "function" ? e : Uc(e)));
}
function R1(e) {
  typeof e != "function" && (e = Hc(e));
  for (var t = this._groups, n = t.length, o = new Array(n), i = 0; i < n; ++i)
    for (var r = t[i], s = r.length, l = o[i] = [], a, u = 0; u < s; ++u)
      (a = r[u]) && e.call(a, a.__data__, u, r) && l.push(a);
  return new mt(o, this._parents);
}
function jc(e) {
  return new Array(e.length);
}
function L1() {
  return new mt(this._enter || this._groups.map(jc), this._parents);
}
function Ni(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
Ni.prototype = {
  constructor: Ni,
  appendChild: function(e) {
    return this._parent.insertBefore(e, this._next);
  },
  insertBefore: function(e, t) {
    return this._parent.insertBefore(e, t);
  },
  querySelector: function(e) {
    return this._parent.querySelector(e);
  },
  querySelectorAll: function(e) {
    return this._parent.querySelectorAll(e);
  }
};
function V1(e) {
  return function() {
    return e;
  };
}
function z1(e, t, n, o, i, r) {
  for (var s = 0, l, a = t.length, u = r.length; s < u; ++s)
    (l = t[s]) ? (l.__data__ = r[s], o[s] = l) : n[s] = new Ni(e, r[s]);
  for (; s < a; ++s)
    (l = t[s]) && (i[s] = l);
}
function B1(e, t, n, o, i, r, s) {
  var l, a, u = /* @__PURE__ */ new Map(), c = t.length, f = r.length, p = new Array(c), g;
  for (l = 0; l < c; ++l)
    (a = t[l]) && (p[l] = g = s.call(a, a.__data__, l, t) + "", u.has(g) ? i[l] = a : u.set(g, a));
  for (l = 0; l < f; ++l)
    g = s.call(e, r[l], l, r) + "", (a = u.get(g)) ? (o[l] = a, a.__data__ = r[l], u.delete(g)) : n[l] = new Ni(e, r[l]);
  for (l = 0; l < c; ++l)
    (a = t[l]) && u.get(p[l]) === a && (i[l] = a);
}
function F1(e) {
  return e.__data__;
}
function H1(e, t) {
  if (!arguments.length)
    return Array.from(this, F1);
  var n = t ? B1 : z1, o = this._parents, i = this._groups;
  typeof e != "function" && (e = V1(e));
  for (var r = i.length, s = new Array(r), l = new Array(r), a = new Array(r), u = 0; u < r; ++u) {
    var c = o[u], f = i[u], p = f.length, g = U1(e.call(c, c && c.__data__, u, o)), _ = g.length, C = l[u] = new Array(_), $ = s[u] = new Array(_), M = a[u] = new Array(p);
    n(c, f, C, $, M, g, t);
    for (var D = 0, x = 0, w, H; D < _; ++D)
      if (w = C[D]) {
        for (D >= x && (x = D + 1); !(H = $[x]) && ++x < _; )
          ;
        w._next = H || null;
      }
  }
  return s = new mt(s, o), s._enter = l, s._exit = a, s;
}
function U1(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function j1() {
  return new mt(this._exit || this._groups.map(jc), this._parents);
}
function G1(e, t, n) {
  var o = this.enter(), i = this, r = this.exit();
  return typeof e == "function" ? (o = e(o), o && (o = o.selection())) : o = o.append(e + ""), t != null && (i = t(i), i && (i = i.selection())), n == null ? r.remove() : n(r), o && i ? o.merge(i).order() : i;
}
function Y1(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, o = t._groups, i = n.length, r = o.length, s = Math.min(i, r), l = new Array(i), a = 0; a < s; ++a)
    for (var u = n[a], c = o[a], f = u.length, p = l[a] = new Array(f), g, _ = 0; _ < f; ++_)
      (g = u[_] || c[_]) && (p[_] = g);
  for (; a < i; ++a)
    l[a] = n[a];
  return new mt(l, this._parents);
}
function X1() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var o = e[t], i = o.length - 1, r = o[i], s; --i >= 0; )
      (s = o[i]) && (r && s.compareDocumentPosition(r) ^ 4 && r.parentNode.insertBefore(s, r), r = s);
  return this;
}
function q1(e) {
  e || (e = W1);
  function t(f, p) {
    return f && p ? e(f.__data__, p.__data__) : !f - !p;
  }
  for (var n = this._groups, o = n.length, i = new Array(o), r = 0; r < o; ++r) {
    for (var s = n[r], l = s.length, a = i[r] = new Array(l), u, c = 0; c < l; ++c)
      (u = s[c]) && (a[c] = u);
    a.sort(t);
  }
  return new mt(i, this._parents).order();
}
function W1(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function K1() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function Z1() {
  return Array.from(this);
}
function J1() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var o = e[t], i = 0, r = o.length; i < r; ++i) {
      var s = o[i];
      if (s)
        return s;
    }
  return null;
}
function Q1() {
  let e = 0;
  for (const t of this)
    ++e;
  return e;
}
function eb() {
  return !this.node();
}
function tb(e) {
  for (var t = this._groups, n = 0, o = t.length; n < o; ++n)
    for (var i = t[n], r = 0, s = i.length, l; r < s; ++r)
      (l = i[r]) && e.call(l, l.__data__, r, i);
  return this;
}
function nb(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function ob(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function ib(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function rb(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function sb(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function lb(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function ab(e, t) {
  var n = Ji(e);
  if (arguments.length < 2) {
    var o = this.node();
    return n.local ? o.getAttributeNS(n.space, n.local) : o.getAttribute(n);
  }
  return this.each((t == null ? n.local ? ob : nb : typeof t == "function" ? n.local ? lb : sb : n.local ? rb : ib)(n, t));
}
function Gc(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function ub(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function cb(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function db(e, t, n) {
  return function() {
    var o = t.apply(this, arguments);
    o == null ? this.style.removeProperty(e) : this.style.setProperty(e, o, n);
  };
}
function fb(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? ub : typeof t == "function" ? db : cb)(e, t, n ?? "")) : Jn(this.node(), e);
}
function Jn(e, t) {
  return e.style.getPropertyValue(t) || Gc(e).getComputedStyle(e, null).getPropertyValue(t);
}
function hb(e) {
  return function() {
    delete this[e];
  };
}
function pb(e, t) {
  return function() {
    this[e] = t;
  };
}
function vb(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function gb(e, t) {
  return arguments.length > 1 ? this.each((t == null ? hb : typeof t == "function" ? vb : pb)(e, t)) : this.node()[e];
}
function Yc(e) {
  return e.trim().split(/^|\s+/);
}
function Bs(e) {
  return e.classList || new Xc(e);
}
function Xc(e) {
  this._node = e, this._names = Yc(e.getAttribute("class") || "");
}
Xc.prototype = {
  add: function(e) {
    var t = this._names.indexOf(e);
    t < 0 && (this._names.push(e), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(e) {
    var t = this._names.indexOf(e);
    t >= 0 && (this._names.splice(t, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(e) {
    return this._names.indexOf(e) >= 0;
  }
};
function qc(e, t) {
  for (var n = Bs(e), o = -1, i = t.length; ++o < i; )
    n.add(t[o]);
}
function Wc(e, t) {
  for (var n = Bs(e), o = -1, i = t.length; ++o < i; )
    n.remove(t[o]);
}
function mb(e) {
  return function() {
    qc(this, e);
  };
}
function yb(e) {
  return function() {
    Wc(this, e);
  };
}
function bb(e, t) {
  return function() {
    (t.apply(this, arguments) ? qc : Wc)(this, e);
  };
}
function _b(e, t) {
  var n = Yc(e + "");
  if (arguments.length < 2) {
    for (var o = Bs(this.node()), i = -1, r = n.length; ++i < r; )
      if (!o.contains(n[i]))
        return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? bb : t ? mb : yb)(n, t));
}
function wb() {
  this.textContent = "";
}
function Eb(e) {
  return function() {
    this.textContent = e;
  };
}
function xb(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function kb(e) {
  return arguments.length ? this.each(e == null ? wb : (typeof e == "function" ? xb : Eb)(e)) : this.node().textContent;
}
function Sb() {
  this.innerHTML = "";
}
function Cb(e) {
  return function() {
    this.innerHTML = e;
  };
}
function Nb(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function $b(e) {
  return arguments.length ? this.each(e == null ? Sb : (typeof e == "function" ? Nb : Cb)(e)) : this.node().innerHTML;
}
function Mb() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function Ib() {
  return this.each(Mb);
}
function Ob() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Tb() {
  return this.each(Ob);
}
function Pb(e) {
  var t = typeof e == "function" ? e : Bc(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function Db() {
  return null;
}
function Ab(e, t) {
  var n = typeof e == "function" ? e : Bc(e), o = t == null ? Db : typeof t == "function" ? t : zs(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), o.apply(this, arguments) || null);
  });
}
function Rb() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function Lb() {
  return this.each(Rb);
}
function Vb() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function zb() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Bb(e) {
  return this.select(e ? zb : Vb);
}
function Fb(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function Hb(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function Ub(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", o = t.indexOf(".");
    return o >= 0 && (n = t.slice(o + 1), t = t.slice(0, o)), { type: t, name: n };
  });
}
function jb(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, o = -1, i = t.length, r; n < i; ++n)
        r = t[n], (!e.type || r.type === e.type) && r.name === e.name ? this.removeEventListener(r.type, r.listener, r.options) : t[++o] = r;
      ++o ? t.length = o : delete this.__on;
    }
  };
}
function Gb(e, t, n) {
  return function() {
    var o = this.__on, i, r = Hb(t);
    if (o) {
      for (var s = 0, l = o.length; s < l; ++s)
        if ((i = o[s]).type === e.type && i.name === e.name) {
          this.removeEventListener(i.type, i.listener, i.options), this.addEventListener(i.type, i.listener = r, i.options = n), i.value = t;
          return;
        }
    }
    this.addEventListener(e.type, r, n), i = { type: e.type, name: e.name, value: t, listener: r, options: n }, o ? o.push(i) : this.__on = [i];
  };
}
function Yb(e, t, n) {
  var o = Ub(e + ""), i, r = o.length, s;
  if (arguments.length < 2) {
    var l = this.node().__on;
    if (l) {
      for (var a = 0, u = l.length, c; a < u; ++a)
        for (i = 0, c = l[a]; i < r; ++i)
          if ((s = o[i]).type === c.type && s.name === c.name)
            return c.value;
    }
    return;
  }
  for (l = t ? Gb : jb, i = 0; i < r; ++i)
    this.each(l(o[i], t, n));
  return this;
}
function Kc(e, t, n) {
  var o = Gc(e), i = o.CustomEvent;
  typeof i == "function" ? i = new i(t, n) : (i = o.document.createEvent("Event"), n ? (i.initEvent(t, n.bubbles, n.cancelable), i.detail = n.detail) : i.initEvent(t, !1, !1)), e.dispatchEvent(i);
}
function Xb(e, t) {
  return function() {
    return Kc(this, e, t);
  };
}
function qb(e, t) {
  return function() {
    return Kc(this, e, t.apply(this, arguments));
  };
}
function Wb(e, t) {
  return this.each((typeof t == "function" ? qb : Xb)(e, t));
}
function* Kb() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var o = e[t], i = 0, r = o.length, s; i < r; ++i)
      (s = o[i]) && (yield s);
}
var Zc = [null];
function mt(e, t) {
  this._groups = e, this._parents = t;
}
function Ho() {
  return new mt([[document.documentElement]], Zc);
}
function Zb() {
  return this;
}
mt.prototype = Ho.prototype = {
  constructor: mt,
  select: x1,
  selectAll: N1,
  selectChild: O1,
  selectChildren: A1,
  filter: R1,
  data: H1,
  enter: L1,
  exit: j1,
  join: G1,
  merge: Y1,
  selection: Zb,
  order: X1,
  sort: q1,
  call: K1,
  nodes: Z1,
  node: J1,
  size: Q1,
  empty: eb,
  each: tb,
  attr: ab,
  style: fb,
  property: gb,
  classed: _b,
  text: kb,
  html: $b,
  raise: Ib,
  lower: Tb,
  append: Pb,
  insert: Ab,
  remove: Lb,
  clone: Bb,
  datum: Fb,
  on: Yb,
  dispatch: Wb,
  [Symbol.iterator]: Kb
};
function wt(e) {
  return typeof e == "string" ? new mt([[document.querySelector(e)]], [document.documentElement]) : new mt([[e]], Zc);
}
function Jb(e) {
  let t;
  for (; t = e.sourceEvent; )
    e = t;
  return e;
}
function Tt(e, t) {
  if (e = Jb(e), t === void 0 && (t = e.currentTarget), t) {
    var n = t.ownerSVGElement || t;
    if (n.createSVGPoint) {
      var o = n.createSVGPoint();
      return o.x = e.clientX, o.y = e.clientY, o = o.matrixTransform(t.getScreenCTM().inverse()), [o.x, o.y];
    }
    if (t.getBoundingClientRect) {
      var i = t.getBoundingClientRect();
      return [e.clientX - i.left - t.clientLeft, e.clientY - i.top - t.clientTop];
    }
  }
  return [e.pageX, e.pageY];
}
const Qb = { passive: !1 }, Oo = { capture: !0, passive: !1 };
function Cr(e) {
  e.stopImmediatePropagation();
}
function Yn(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function Jc(e) {
  var t = e.document.documentElement, n = wt(e).on("dragstart.drag", Yn, Oo);
  "onselectstart" in t ? n.on("selectstart.drag", Yn, Oo) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function Qc(e, t) {
  var n = e.document.documentElement, o = wt(e).on("dragstart.drag", null);
  t && (o.on("click.drag", Yn, Oo), setTimeout(function() {
    o.on("click.drag", null);
  }, 0)), "onselectstart" in n ? o.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
const Zo = (e) => () => e;
function is(e, {
  sourceEvent: t,
  subject: n,
  target: o,
  identifier: i,
  active: r,
  x: s,
  y: l,
  dx: a,
  dy: u,
  dispatch: c
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    subject: { value: n, enumerable: !0, configurable: !0 },
    target: { value: o, enumerable: !0, configurable: !0 },
    identifier: { value: i, enumerable: !0, configurable: !0 },
    active: { value: r, enumerable: !0, configurable: !0 },
    x: { value: s, enumerable: !0, configurable: !0 },
    y: { value: l, enumerable: !0, configurable: !0 },
    dx: { value: a, enumerable: !0, configurable: !0 },
    dy: { value: u, enumerable: !0, configurable: !0 },
    _: { value: c }
  });
}
is.prototype.on = function() {
  var e = this._.on.apply(this._, arguments);
  return e === this._ ? this : e;
};
function e_(e) {
  return !e.ctrlKey && !e.button;
}
function t_() {
  return this.parentNode;
}
function n_(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function o_() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function i_() {
  var e = e_, t = t_, n = n_, o = o_, i = {}, r = Zi("start", "drag", "end"), s = 0, l, a, u, c, f = 0;
  function p(w) {
    w.on("mousedown.drag", g).filter(o).on("touchstart.drag", $).on("touchmove.drag", M, Qb).on("touchend.drag touchcancel.drag", D).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function g(w, H) {
    if (!(c || !e.call(this, w, H))) {
      var L = x(this, t.call(this, w, H), w, H, "mouse");
      L && (wt(w.view).on("mousemove.drag", _, Oo).on("mouseup.drag", C, Oo), Jc(w.view), Cr(w), u = !1, l = w.clientX, a = w.clientY, L("start", w));
    }
  }
  function _(w) {
    if (Yn(w), !u) {
      var H = w.clientX - l, L = w.clientY - a;
      u = H * H + L * L > f;
    }
    i.mouse("drag", w);
  }
  function C(w) {
    wt(w.view).on("mousemove.drag mouseup.drag", null), Qc(w.view, u), Yn(w), i.mouse("end", w);
  }
  function $(w, H) {
    if (e.call(this, w, H)) {
      var L = w.changedTouches, z = t.call(this, w, H), T = L.length, N, V;
      for (N = 0; N < T; ++N)
        (V = x(this, z, w, H, L[N].identifier, L[N])) && (Cr(w), V("start", w, L[N]));
    }
  }
  function M(w) {
    var H = w.changedTouches, L = H.length, z, T;
    for (z = 0; z < L; ++z)
      (T = i[H[z].identifier]) && (Yn(w), T("drag", w, H[z]));
  }
  function D(w) {
    var H = w.changedTouches, L = H.length, z, T;
    for (c && clearTimeout(c), c = setTimeout(function() {
      c = null;
    }, 500), z = 0; z < L; ++z)
      (T = i[H[z].identifier]) && (Cr(w), T("end", w, H[z]));
  }
  function x(w, H, L, z, T, N) {
    var V = r.copy(), Z = Tt(N || L, H), O, R, E;
    if ((E = n.call(w, new is("beforestart", {
      sourceEvent: L,
      target: p,
      identifier: T,
      active: s,
      x: Z[0],
      y: Z[1],
      dx: 0,
      dy: 0,
      dispatch: V
    }), z)) != null)
      return O = E.x - Z[0] || 0, R = E.y - Z[1] || 0, function A(P, j, q) {
        var ee = Z, oe;
        switch (P) {
          case "start":
            i[T] = A, oe = s++;
            break;
          case "end":
            delete i[T], --s;
          case "drag":
            Z = Tt(q || j, H), oe = s;
            break;
        }
        V.call(
          P,
          w,
          new is(P, {
            sourceEvent: j,
            subject: E,
            target: p,
            identifier: T,
            active: oe,
            x: Z[0] + O,
            y: Z[1] + R,
            dx: Z[0] - ee[0],
            dy: Z[1] - ee[1],
            dispatch: V
          }),
          z
        );
      };
  }
  return p.filter = function(w) {
    return arguments.length ? (e = typeof w == "function" ? w : Zo(!!w), p) : e;
  }, p.container = function(w) {
    return arguments.length ? (t = typeof w == "function" ? w : Zo(w), p) : t;
  }, p.subject = function(w) {
    return arguments.length ? (n = typeof w == "function" ? w : Zo(w), p) : n;
  }, p.touchable = function(w) {
    return arguments.length ? (o = typeof w == "function" ? w : Zo(!!w), p) : o;
  }, p.on = function() {
    var w = r.on.apply(r, arguments);
    return w === r ? p : w;
  }, p.clickDistance = function(w) {
    return arguments.length ? (f = (w = +w) * w, p) : Math.sqrt(f);
  }, p;
}
function Fs(e, t, n) {
  e.prototype = t.prototype = n, n.constructor = e;
}
function ed(e, t) {
  var n = Object.create(e.prototype);
  for (var o in t)
    n[o] = t[o];
  return n;
}
function Uo() {
}
var To = 0.7, $i = 1 / To, Xn = "\\s*([+-]?\\d+)\\s*", Po = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", Rt = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", r_ = /^#([0-9a-f]{3,8})$/, s_ = new RegExp(`^rgb\\(${Xn},${Xn},${Xn}\\)$`), l_ = new RegExp(`^rgb\\(${Rt},${Rt},${Rt}\\)$`), a_ = new RegExp(`^rgba\\(${Xn},${Xn},${Xn},${Po}\\)$`), u_ = new RegExp(`^rgba\\(${Rt},${Rt},${Rt},${Po}\\)$`), c_ = new RegExp(`^hsl\\(${Po},${Rt},${Rt}\\)$`), d_ = new RegExp(`^hsla\\(${Po},${Rt},${Rt},${Po}\\)$`), aa = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
Fs(Uo, Do, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: ua,
  // Deprecated! Use color.formatHex.
  formatHex: ua,
  formatHex8: f_,
  formatHsl: h_,
  formatRgb: ca,
  toString: ca
});
function ua() {
  return this.rgb().formatHex();
}
function f_() {
  return this.rgb().formatHex8();
}
function h_() {
  return td(this).formatHsl();
}
function ca() {
  return this.rgb().formatRgb();
}
function Do(e) {
  var t, n;
  return e = (e + "").trim().toLowerCase(), (t = r_.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? da(t) : n === 3 ? new dt(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? Jo(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? Jo(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = s_.exec(e)) ? new dt(t[1], t[2], t[3], 1) : (t = l_.exec(e)) ? new dt(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = a_.exec(e)) ? Jo(t[1], t[2], t[3], t[4]) : (t = u_.exec(e)) ? Jo(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = c_.exec(e)) ? pa(t[1], t[2] / 100, t[3] / 100, 1) : (t = d_.exec(e)) ? pa(t[1], t[2] / 100, t[3] / 100, t[4]) : aa.hasOwnProperty(e) ? da(aa[e]) : e === "transparent" ? new dt(NaN, NaN, NaN, 0) : null;
}
function da(e) {
  return new dt(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function Jo(e, t, n, o) {
  return o <= 0 && (e = t = n = NaN), new dt(e, t, n, o);
}
function p_(e) {
  return e instanceof Uo || (e = Do(e)), e ? (e = e.rgb(), new dt(e.r, e.g, e.b, e.opacity)) : new dt();
}
function rs(e, t, n, o) {
  return arguments.length === 1 ? p_(e) : new dt(e, t, n, o ?? 1);
}
function dt(e, t, n, o) {
  this.r = +e, this.g = +t, this.b = +n, this.opacity = +o;
}
Fs(dt, rs, ed(Uo, {
  brighter(e) {
    return e = e == null ? $i : Math.pow($i, e), new dt(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? To : Math.pow(To, e), new dt(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new dt(Nn(this.r), Nn(this.g), Nn(this.b), Mi(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: fa,
  // Deprecated! Use color.formatHex.
  formatHex: fa,
  formatHex8: v_,
  formatRgb: ha,
  toString: ha
}));
function fa() {
  return `#${xn(this.r)}${xn(this.g)}${xn(this.b)}`;
}
function v_() {
  return `#${xn(this.r)}${xn(this.g)}${xn(this.b)}${xn((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function ha() {
  const e = Mi(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${Nn(this.r)}, ${Nn(this.g)}, ${Nn(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function Mi(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function Nn(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function xn(e) {
  return e = Nn(e), (e < 16 ? "0" : "") + e.toString(16);
}
function pa(e, t, n, o) {
  return o <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new Et(e, t, n, o);
}
function td(e) {
  if (e instanceof Et)
    return new Et(e.h, e.s, e.l, e.opacity);
  if (e instanceof Uo || (e = Do(e)), !e)
    return new Et();
  if (e instanceof Et)
    return e;
  e = e.rgb();
  var t = e.r / 255, n = e.g / 255, o = e.b / 255, i = Math.min(t, n, o), r = Math.max(t, n, o), s = NaN, l = r - i, a = (r + i) / 2;
  return l ? (t === r ? s = (n - o) / l + (n < o) * 6 : n === r ? s = (o - t) / l + 2 : s = (t - n) / l + 4, l /= a < 0.5 ? r + i : 2 - r - i, s *= 60) : l = a > 0 && a < 1 ? 0 : s, new Et(s, l, a, e.opacity);
}
function g_(e, t, n, o) {
  return arguments.length === 1 ? td(e) : new Et(e, t, n, o ?? 1);
}
function Et(e, t, n, o) {
  this.h = +e, this.s = +t, this.l = +n, this.opacity = +o;
}
Fs(Et, g_, ed(Uo, {
  brighter(e) {
    return e = e == null ? $i : Math.pow($i, e), new Et(this.h, this.s, this.l * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? To : Math.pow(To, e), new Et(this.h, this.s, this.l * e, this.opacity);
  },
  rgb() {
    var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, n = this.l, o = n + (n < 0.5 ? n : 1 - n) * t, i = 2 * n - o;
    return new dt(
      Nr(e >= 240 ? e - 240 : e + 120, i, o),
      Nr(e, i, o),
      Nr(e < 120 ? e + 240 : e - 120, i, o),
      this.opacity
    );
  },
  clamp() {
    return new Et(va(this.h), Qo(this.s), Qo(this.l), Mi(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = Mi(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${va(this.h)}, ${Qo(this.s) * 100}%, ${Qo(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function va(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function Qo(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function Nr(e, t, n) {
  return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
const nd = (e) => () => e;
function m_(e, t) {
  return function(n) {
    return e + n * t;
  };
}
function y_(e, t, n) {
  return e = Math.pow(e, n), t = Math.pow(t, n) - e, n = 1 / n, function(o) {
    return Math.pow(e + o * t, n);
  };
}
function b_(e) {
  return (e = +e) == 1 ? od : function(t, n) {
    return n - t ? y_(t, n, e) : nd(isNaN(t) ? n : t);
  };
}
function od(e, t) {
  var n = t - e;
  return n ? m_(e, n) : nd(isNaN(e) ? t : e);
}
const ga = function e(t) {
  var n = b_(t);
  function o(i, r) {
    var s = n((i = rs(i)).r, (r = rs(r)).r), l = n(i.g, r.g), a = n(i.b, r.b), u = od(i.opacity, r.opacity);
    return function(c) {
      return i.r = s(c), i.g = l(c), i.b = a(c), i.opacity = u(c), i + "";
    };
  }
  return o.gamma = e, o;
}(1);
function nn(e, t) {
  return e = +e, t = +t, function(n) {
    return e * (1 - n) + t * n;
  };
}
var ss = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, $r = new RegExp(ss.source, "g");
function __(e) {
  return function() {
    return e;
  };
}
function w_(e) {
  return function(t) {
    return e(t) + "";
  };
}
function E_(e, t) {
  var n = ss.lastIndex = $r.lastIndex = 0, o, i, r, s = -1, l = [], a = [];
  for (e = e + "", t = t + ""; (o = ss.exec(e)) && (i = $r.exec(t)); )
    (r = i.index) > n && (r = t.slice(n, r), l[s] ? l[s] += r : l[++s] = r), (o = o[0]) === (i = i[0]) ? l[s] ? l[s] += i : l[++s] = i : (l[++s] = null, a.push({ i: s, x: nn(o, i) })), n = $r.lastIndex;
  return n < t.length && (r = t.slice(n), l[s] ? l[s] += r : l[++s] = r), l.length < 2 ? a[0] ? w_(a[0].x) : __(t) : (t = a.length, function(u) {
    for (var c = 0, f; c < t; ++c)
      l[(f = a[c]).i] = f.x(u);
    return l.join("");
  });
}
var ma = 180 / Math.PI, ls = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function id(e, t, n, o, i, r) {
  var s, l, a;
  return (s = Math.sqrt(e * e + t * t)) && (e /= s, t /= s), (a = e * n + t * o) && (n -= e * a, o -= t * a), (l = Math.sqrt(n * n + o * o)) && (n /= l, o /= l, a /= l), e * o < t * n && (e = -e, t = -t, a = -a, s = -s), {
    translateX: i,
    translateY: r,
    rotate: Math.atan2(t, e) * ma,
    skewX: Math.atan(a) * ma,
    scaleX: s,
    scaleY: l
  };
}
var ei;
function x_(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? ls : id(t.a, t.b, t.c, t.d, t.e, t.f);
}
function k_(e) {
  return e == null || (ei || (ei = document.createElementNS("http://www.w3.org/2000/svg", "g")), ei.setAttribute("transform", e), !(e = ei.transform.baseVal.consolidate())) ? ls : (e = e.matrix, id(e.a, e.b, e.c, e.d, e.e, e.f));
}
function rd(e, t, n, o) {
  function i(u) {
    return u.length ? u.pop() + " " : "";
  }
  function r(u, c, f, p, g, _) {
    if (u !== f || c !== p) {
      var C = g.push("translate(", null, t, null, n);
      _.push({ i: C - 4, x: nn(u, f) }, { i: C - 2, x: nn(c, p) });
    } else (f || p) && g.push("translate(" + f + t + p + n);
  }
  function s(u, c, f, p) {
    u !== c ? (u - c > 180 ? c += 360 : c - u > 180 && (u += 360), p.push({ i: f.push(i(f) + "rotate(", null, o) - 2, x: nn(u, c) })) : c && f.push(i(f) + "rotate(" + c + o);
  }
  function l(u, c, f, p) {
    u !== c ? p.push({ i: f.push(i(f) + "skewX(", null, o) - 2, x: nn(u, c) }) : c && f.push(i(f) + "skewX(" + c + o);
  }
  function a(u, c, f, p, g, _) {
    if (u !== f || c !== p) {
      var C = g.push(i(g) + "scale(", null, ",", null, ")");
      _.push({ i: C - 4, x: nn(u, f) }, { i: C - 2, x: nn(c, p) });
    } else (f !== 1 || p !== 1) && g.push(i(g) + "scale(" + f + "," + p + ")");
  }
  return function(u, c) {
    var f = [], p = [];
    return u = e(u), c = e(c), r(u.translateX, u.translateY, c.translateX, c.translateY, f, p), s(u.rotate, c.rotate, f, p), l(u.skewX, c.skewX, f, p), a(u.scaleX, u.scaleY, c.scaleX, c.scaleY, f, p), u = c = null, function(g) {
      for (var _ = -1, C = p.length, $; ++_ < C; )
        f[($ = p[_]).i] = $.x(g);
      return f.join("");
    };
  };
}
var S_ = rd(x_, "px, ", "px)", "deg)"), C_ = rd(k_, ", ", ")", ")"), N_ = 1e-12;
function ya(e) {
  return ((e = Math.exp(e)) + 1 / e) / 2;
}
function $_(e) {
  return ((e = Math.exp(e)) - 1 / e) / 2;
}
function M_(e) {
  return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const I_ = function e(t, n, o) {
  function i(r, s) {
    var l = r[0], a = r[1], u = r[2], c = s[0], f = s[1], p = s[2], g = c - l, _ = f - a, C = g * g + _ * _, $, M;
    if (C < N_)
      M = Math.log(p / u) / t, $ = function(z) {
        return [
          l + z * g,
          a + z * _,
          u * Math.exp(t * z * M)
        ];
      };
    else {
      var D = Math.sqrt(C), x = (p * p - u * u + o * C) / (2 * u * n * D), w = (p * p - u * u - o * C) / (2 * p * n * D), H = Math.log(Math.sqrt(x * x + 1) - x), L = Math.log(Math.sqrt(w * w + 1) - w);
      M = (L - H) / t, $ = function(z) {
        var T = z * M, N = ya(H), V = u / (n * D) * (N * M_(t * T + H) - $_(H));
        return [
          l + V * g,
          a + V * _,
          u * N / ya(t * T + H)
        ];
      };
    }
    return $.duration = M * 1e3 * t / Math.SQRT2, $;
  }
  return i.rho = function(r) {
    var s = Math.max(1e-3, +r), l = s * s, a = l * l;
    return e(s, l, a);
  }, i;
}(Math.SQRT2, 2, 4);
var Qn = 0, ho = 0, lo = 0, sd = 1e3, Ii, po, Oi = 0, Tn = 0, Qi = 0, Ao = typeof performance == "object" && performance.now ? performance : Date, ld = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function Hs() {
  return Tn || (ld(O_), Tn = Ao.now() + Qi);
}
function O_() {
  Tn = 0;
}
function Ti() {
  this._call = this._time = this._next = null;
}
Ti.prototype = ad.prototype = {
  constructor: Ti,
  restart: function(e, t, n) {
    if (typeof e != "function")
      throw new TypeError("callback is not a function");
    n = (n == null ? Hs() : +n) + (t == null ? 0 : +t), !this._next && po !== this && (po ? po._next = this : Ii = this, po = this), this._call = e, this._time = n, as();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, as());
  }
};
function ad(e, t, n) {
  var o = new Ti();
  return o.restart(e, t, n), o;
}
function T_() {
  Hs(), ++Qn;
  for (var e = Ii, t; e; )
    (t = Tn - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --Qn;
}
function ba() {
  Tn = (Oi = Ao.now()) + Qi, Qn = ho = 0;
  try {
    T_();
  } finally {
    Qn = 0, D_(), Tn = 0;
  }
}
function P_() {
  var e = Ao.now(), t = e - Oi;
  t > sd && (Qi -= t, Oi = e);
}
function D_() {
  for (var e, t = Ii, n, o = 1 / 0; t; )
    t._call ? (o > t._time && (o = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : Ii = n);
  po = e, as(o);
}
function as(e) {
  if (!Qn) {
    ho && (ho = clearTimeout(ho));
    var t = e - Tn;
    t > 24 ? (e < 1 / 0 && (ho = setTimeout(ba, e - Ao.now() - Qi)), lo && (lo = clearInterval(lo))) : (lo || (Oi = Ao.now(), lo = setInterval(P_, sd)), Qn = 1, ld(ba));
  }
}
function _a(e, t, n) {
  var o = new Ti();
  return t = t == null ? 0 : +t, o.restart((i) => {
    o.stop(), e(i + t);
  }, t, n), o;
}
var A_ = Zi("start", "end", "cancel", "interrupt"), R_ = [], ud = 0, wa = 1, us = 2, hi = 3, Ea = 4, cs = 5, pi = 6;
function er(e, t, n, o, i, r) {
  var s = e.__transition;
  if (!s)
    e.__transition = {};
  else if (n in s)
    return;
  L_(e, n, {
    name: t,
    index: o,
    // For context during callback.
    group: i,
    // For context during callback.
    on: A_,
    tween: R_,
    time: r.time,
    delay: r.delay,
    duration: r.duration,
    ease: r.ease,
    timer: null,
    state: ud
  });
}
function Us(e, t) {
  var n = Ct(e, t);
  if (n.state > ud)
    throw new Error("too late; already scheduled");
  return n;
}
function Vt(e, t) {
  var n = Ct(e, t);
  if (n.state > hi)
    throw new Error("too late; already running");
  return n;
}
function Ct(e, t) {
  var n = e.__transition;
  if (!n || !(n = n[t]))
    throw new Error("transition not found");
  return n;
}
function L_(e, t, n) {
  var o = e.__transition, i;
  o[t] = n, n.timer = ad(r, 0, n.time);
  function r(u) {
    n.state = wa, n.timer.restart(s, n.delay, n.time), n.delay <= u && s(u - n.delay);
  }
  function s(u) {
    var c, f, p, g;
    if (n.state !== wa)
      return a();
    for (c in o)
      if (g = o[c], g.name === n.name) {
        if (g.state === hi)
          return _a(s);
        g.state === Ea ? (g.state = pi, g.timer.stop(), g.on.call("interrupt", e, e.__data__, g.index, g.group), delete o[c]) : +c < t && (g.state = pi, g.timer.stop(), g.on.call("cancel", e, e.__data__, g.index, g.group), delete o[c]);
      }
    if (_a(function() {
      n.state === hi && (n.state = Ea, n.timer.restart(l, n.delay, n.time), l(u));
    }), n.state = us, n.on.call("start", e, e.__data__, n.index, n.group), n.state === us) {
      for (n.state = hi, i = new Array(p = n.tween.length), c = 0, f = -1; c < p; ++c)
        (g = n.tween[c].value.call(e, e.__data__, n.index, n.group)) && (i[++f] = g);
      i.length = f + 1;
    }
  }
  function l(u) {
    for (var c = u < n.duration ? n.ease.call(null, u / n.duration) : (n.timer.restart(a), n.state = cs, 1), f = -1, p = i.length; ++f < p; )
      i[f].call(e, c);
    n.state === cs && (n.on.call("end", e, e.__data__, n.index, n.group), a());
  }
  function a() {
    n.state = pi, n.timer.stop(), delete o[t];
    for (var u in o)
      return;
    delete e.__transition;
  }
}
function vi(e, t) {
  var n = e.__transition, o, i, r = !0, s;
  if (n) {
    t = t == null ? null : t + "";
    for (s in n) {
      if ((o = n[s]).name !== t) {
        r = !1;
        continue;
      }
      i = o.state > us && o.state < cs, o.state = pi, o.timer.stop(), o.on.call(i ? "interrupt" : "cancel", e, e.__data__, o.index, o.group), delete n[s];
    }
    r && delete e.__transition;
  }
}
function V_(e) {
  return this.each(function() {
    vi(this, e);
  });
}
function z_(e, t) {
  var n, o;
  return function() {
    var i = Vt(this, e), r = i.tween;
    if (r !== n) {
      o = n = r;
      for (var s = 0, l = o.length; s < l; ++s)
        if (o[s].name === t) {
          o = o.slice(), o.splice(s, 1);
          break;
        }
    }
    i.tween = o;
  };
}
function B_(e, t, n) {
  var o, i;
  if (typeof n != "function")
    throw new Error();
  return function() {
    var r = Vt(this, e), s = r.tween;
    if (s !== o) {
      i = (o = s).slice();
      for (var l = { name: t, value: n }, a = 0, u = i.length; a < u; ++a)
        if (i[a].name === t) {
          i[a] = l;
          break;
        }
      a === u && i.push(l);
    }
    r.tween = i;
  };
}
function F_(e, t) {
  var n = this._id;
  if (e += "", arguments.length < 2) {
    for (var o = Ct(this.node(), n).tween, i = 0, r = o.length, s; i < r; ++i)
      if ((s = o[i]).name === e)
        return s.value;
    return null;
  }
  return this.each((t == null ? z_ : B_)(n, e, t));
}
function js(e, t, n) {
  var o = e._id;
  return e.each(function() {
    var i = Vt(this, o);
    (i.value || (i.value = {}))[t] = n.apply(this, arguments);
  }), function(i) {
    return Ct(i, o).value[t];
  };
}
function cd(e, t) {
  var n;
  return (typeof t == "number" ? nn : t instanceof Do ? ga : (n = Do(t)) ? (t = n, ga) : E_)(e, t);
}
function H_(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function U_(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function j_(e, t, n) {
  var o, i = n + "", r;
  return function() {
    var s = this.getAttribute(e);
    return s === i ? null : s === o ? r : r = t(o = s, n);
  };
}
function G_(e, t, n) {
  var o, i = n + "", r;
  return function() {
    var s = this.getAttributeNS(e.space, e.local);
    return s === i ? null : s === o ? r : r = t(o = s, n);
  };
}
function Y_(e, t, n) {
  var o, i, r;
  return function() {
    var s, l = n(this), a;
    return l == null ? void this.removeAttribute(e) : (s = this.getAttribute(e), a = l + "", s === a ? null : s === o && a === i ? r : (i = a, r = t(o = s, l)));
  };
}
function X_(e, t, n) {
  var o, i, r;
  return function() {
    var s, l = n(this), a;
    return l == null ? void this.removeAttributeNS(e.space, e.local) : (s = this.getAttributeNS(e.space, e.local), a = l + "", s === a ? null : s === o && a === i ? r : (i = a, r = t(o = s, l)));
  };
}
function q_(e, t) {
  var n = Ji(e), o = n === "transform" ? C_ : cd;
  return this.attrTween(e, typeof t == "function" ? (n.local ? X_ : Y_)(n, o, js(this, "attr." + e, t)) : t == null ? (n.local ? U_ : H_)(n) : (n.local ? G_ : j_)(n, o, t));
}
function W_(e, t) {
  return function(n) {
    this.setAttribute(e, t.call(this, n));
  };
}
function K_(e, t) {
  return function(n) {
    this.setAttributeNS(e.space, e.local, t.call(this, n));
  };
}
function Z_(e, t) {
  var n, o;
  function i() {
    var r = t.apply(this, arguments);
    return r !== o && (n = (o = r) && K_(e, r)), n;
  }
  return i._value = t, i;
}
function J_(e, t) {
  var n, o;
  function i() {
    var r = t.apply(this, arguments);
    return r !== o && (n = (o = r) && W_(e, r)), n;
  }
  return i._value = t, i;
}
function Q_(e, t) {
  var n = "attr." + e;
  if (arguments.length < 2)
    return (n = this.tween(n)) && n._value;
  if (t == null)
    return this.tween(n, null);
  if (typeof t != "function")
    throw new Error();
  var o = Ji(e);
  return this.tween(n, (o.local ? Z_ : J_)(o, t));
}
function ew(e, t) {
  return function() {
    Us(this, e).delay = +t.apply(this, arguments);
  };
}
function tw(e, t) {
  return t = +t, function() {
    Us(this, e).delay = t;
  };
}
function nw(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? ew : tw)(t, e)) : Ct(this.node(), t).delay;
}
function ow(e, t) {
  return function() {
    Vt(this, e).duration = +t.apply(this, arguments);
  };
}
function iw(e, t) {
  return t = +t, function() {
    Vt(this, e).duration = t;
  };
}
function rw(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? ow : iw)(t, e)) : Ct(this.node(), t).duration;
}
function sw(e, t) {
  if (typeof t != "function")
    throw new Error();
  return function() {
    Vt(this, e).ease = t;
  };
}
function lw(e) {
  var t = this._id;
  return arguments.length ? this.each(sw(t, e)) : Ct(this.node(), t).ease;
}
function aw(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    if (typeof n != "function")
      throw new Error();
    Vt(this, e).ease = n;
  };
}
function uw(e) {
  if (typeof e != "function")
    throw new Error();
  return this.each(aw(this._id, e));
}
function cw(e) {
  typeof e != "function" && (e = Hc(e));
  for (var t = this._groups, n = t.length, o = new Array(n), i = 0; i < n; ++i)
    for (var r = t[i], s = r.length, l = o[i] = [], a, u = 0; u < s; ++u)
      (a = r[u]) && e.call(a, a.__data__, u, r) && l.push(a);
  return new Kt(o, this._parents, this._name, this._id);
}
function dw(e) {
  if (e._id !== this._id)
    throw new Error();
  for (var t = this._groups, n = e._groups, o = t.length, i = n.length, r = Math.min(o, i), s = new Array(o), l = 0; l < r; ++l)
    for (var a = t[l], u = n[l], c = a.length, f = s[l] = new Array(c), p, g = 0; g < c; ++g)
      (p = a[g] || u[g]) && (f[g] = p);
  for (; l < o; ++l)
    s[l] = t[l];
  return new Kt(s, this._parents, this._name, this._id);
}
function fw(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var n = t.indexOf(".");
    return n >= 0 && (t = t.slice(0, n)), !t || t === "start";
  });
}
function hw(e, t, n) {
  var o, i, r = fw(t) ? Us : Vt;
  return function() {
    var s = r(this, e), l = s.on;
    l !== o && (i = (o = l).copy()).on(t, n), s.on = i;
  };
}
function pw(e, t) {
  var n = this._id;
  return arguments.length < 2 ? Ct(this.node(), n).on.on(e) : this.each(hw(n, e, t));
}
function vw(e) {
  return function() {
    var t = this.parentNode;
    for (var n in this.__transition)
      if (+n !== e)
        return;
    t && t.removeChild(this);
  };
}
function gw() {
  return this.on("end.remove", vw(this._id));
}
function mw(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = zs(e));
  for (var o = this._groups, i = o.length, r = new Array(i), s = 0; s < i; ++s)
    for (var l = o[s], a = l.length, u = r[s] = new Array(a), c, f, p = 0; p < a; ++p)
      (c = l[p]) && (f = e.call(c, c.__data__, p, l)) && ("__data__" in c && (f.__data__ = c.__data__), u[p] = f, er(u[p], t, n, p, u, Ct(c, n)));
  return new Kt(r, this._parents, t, n);
}
function yw(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = Fc(e));
  for (var o = this._groups, i = o.length, r = [], s = [], l = 0; l < i; ++l)
    for (var a = o[l], u = a.length, c, f = 0; f < u; ++f)
      if (c = a[f]) {
        for (var p = e.call(c, c.__data__, f, a), g, _ = Ct(c, n), C = 0, $ = p.length; C < $; ++C)
          (g = p[C]) && er(g, t, n, C, p, _);
        r.push(p), s.push(c);
      }
  return new Kt(r, s, t, n);
}
var bw = Ho.prototype.constructor;
function _w() {
  return new bw(this._groups, this._parents);
}
function ww(e, t) {
  var n, o, i;
  return function() {
    var r = Jn(this, e), s = (this.style.removeProperty(e), Jn(this, e));
    return r === s ? null : r === n && s === o ? i : i = t(n = r, o = s);
  };
}
function dd(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function Ew(e, t, n) {
  var o, i = n + "", r;
  return function() {
    var s = Jn(this, e);
    return s === i ? null : s === o ? r : r = t(o = s, n);
  };
}
function xw(e, t, n) {
  var o, i, r;
  return function() {
    var s = Jn(this, e), l = n(this), a = l + "";
    return l == null && (a = l = (this.style.removeProperty(e), Jn(this, e))), s === a ? null : s === o && a === i ? r : (i = a, r = t(o = s, l));
  };
}
function kw(e, t) {
  var n, o, i, r = "style." + t, s = "end." + r, l;
  return function() {
    var a = Vt(this, e), u = a.on, c = a.value[r] == null ? l || (l = dd(t)) : void 0;
    (u !== n || i !== c) && (o = (n = u).copy()).on(s, i = c), a.on = o;
  };
}
function Sw(e, t, n) {
  var o = (e += "") == "transform" ? S_ : cd;
  return t == null ? this.styleTween(e, ww(e, o)).on("end.style." + e, dd(e)) : typeof t == "function" ? this.styleTween(e, xw(e, o, js(this, "style." + e, t))).each(kw(this._id, e)) : this.styleTween(e, Ew(e, o, t), n).on("end.style." + e, null);
}
function Cw(e, t, n) {
  return function(o) {
    this.style.setProperty(e, t.call(this, o), n);
  };
}
function Nw(e, t, n) {
  var o, i;
  function r() {
    var s = t.apply(this, arguments);
    return s !== i && (o = (i = s) && Cw(e, s, n)), o;
  }
  return r._value = t, r;
}
function $w(e, t, n) {
  var o = "style." + (e += "");
  if (arguments.length < 2)
    return (o = this.tween(o)) && o._value;
  if (t == null)
    return this.tween(o, null);
  if (typeof t != "function")
    throw new Error();
  return this.tween(o, Nw(e, t, n ?? ""));
}
function Mw(e) {
  return function() {
    this.textContent = e;
  };
}
function Iw(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function Ow(e) {
  return this.tween("text", typeof e == "function" ? Iw(js(this, "text", e)) : Mw(e == null ? "" : e + ""));
}
function Tw(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function Pw(e) {
  var t, n;
  function o() {
    var i = e.apply(this, arguments);
    return i !== n && (t = (n = i) && Tw(i)), t;
  }
  return o._value = e, o;
}
function Dw(e) {
  var t = "text";
  if (arguments.length < 1)
    return (t = this.tween(t)) && t._value;
  if (e == null)
    return this.tween(t, null);
  if (typeof e != "function")
    throw new Error();
  return this.tween(t, Pw(e));
}
function Aw() {
  for (var e = this._name, t = this._id, n = fd(), o = this._groups, i = o.length, r = 0; r < i; ++r)
    for (var s = o[r], l = s.length, a, u = 0; u < l; ++u)
      if (a = s[u]) {
        var c = Ct(a, t);
        er(a, e, n, u, s, {
          time: c.time + c.delay + c.duration,
          delay: 0,
          duration: c.duration,
          ease: c.ease
        });
      }
  return new Kt(o, this._parents, e, n);
}
function Rw() {
  var e, t, n = this, o = n._id, i = n.size();
  return new Promise(function(r, s) {
    var l = { value: s }, a = { value: function() {
      --i === 0 && r();
    } };
    n.each(function() {
      var u = Vt(this, o), c = u.on;
      c !== e && (t = (e = c).copy(), t._.cancel.push(l), t._.interrupt.push(l), t._.end.push(a)), u.on = t;
    }), i === 0 && r();
  });
}
var Lw = 0;
function Kt(e, t, n, o) {
  this._groups = e, this._parents = t, this._name = n, this._id = o;
}
function fd() {
  return ++Lw;
}
var Bt = Ho.prototype;
Kt.prototype = {
  constructor: Kt,
  select: mw,
  selectAll: yw,
  selectChild: Bt.selectChild,
  selectChildren: Bt.selectChildren,
  filter: cw,
  merge: dw,
  selection: _w,
  transition: Aw,
  call: Bt.call,
  nodes: Bt.nodes,
  node: Bt.node,
  size: Bt.size,
  empty: Bt.empty,
  each: Bt.each,
  on: pw,
  attr: q_,
  attrTween: Q_,
  style: Sw,
  styleTween: $w,
  text: Ow,
  textTween: Dw,
  remove: gw,
  tween: F_,
  delay: nw,
  duration: rw,
  ease: lw,
  easeVarying: uw,
  end: Rw,
  [Symbol.iterator]: Bt[Symbol.iterator]
};
function Vw(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var zw = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: Vw
};
function Bw(e, t) {
  for (var n; !(n = e.__transition) || !(n = n[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return n;
}
function Fw(e) {
  var t, n;
  e instanceof Kt ? (t = e._id, e = e._name) : (t = fd(), (n = zw).time = Hs(), e = e == null ? null : e + "");
  for (var o = this._groups, i = o.length, r = 0; r < i; ++r)
    for (var s = o[r], l = s.length, a, u = 0; u < l; ++u)
      (a = s[u]) && er(a, e, t, u, s, n || Bw(a, t));
  return new Kt(o, this._parents, e, t);
}
Ho.prototype.interrupt = V_;
Ho.prototype.transition = Fw;
const ti = (e) => () => e;
function Hw(e, {
  sourceEvent: t,
  target: n,
  transform: o,
  dispatch: i
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    target: { value: n, enumerable: !0, configurable: !0 },
    transform: { value: o, enumerable: !0, configurable: !0 },
    _: { value: i }
  });
}
function Yt(e, t, n) {
  this.k = e, this.x = t, this.y = n;
}
Yt.prototype = {
  constructor: Yt,
  scale: function(e) {
    return e === 1 ? this : new Yt(this.k * e, this.x, this.y);
  },
  translate: function(e, t) {
    return e === 0 & t === 0 ? this : new Yt(this.k, this.x + this.k * e, this.y + this.k * t);
  },
  apply: function(e) {
    return [e[0] * this.k + this.x, e[1] * this.k + this.y];
  },
  applyX: function(e) {
    return e * this.k + this.x;
  },
  applyY: function(e) {
    return e * this.k + this.y;
  },
  invert: function(e) {
    return [(e[0] - this.x) / this.k, (e[1] - this.y) / this.k];
  },
  invertX: function(e) {
    return (e - this.x) / this.k;
  },
  invertY: function(e) {
    return (e - this.y) / this.k;
  },
  rescaleX: function(e) {
    return e.copy().domain(e.range().map(this.invertX, this).map(e.invert, e));
  },
  rescaleY: function(e) {
    return e.copy().domain(e.range().map(this.invertY, this).map(e.invert, e));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var eo = new Yt(1, 0, 0);
Yt.prototype;
function Mr(e) {
  e.stopImmediatePropagation();
}
function ao(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function Uw(e) {
  return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function jw() {
  var e = this;
  return e instanceof SVGElement ? (e = e.ownerSVGElement || e, e.hasAttribute("viewBox") ? (e = e.viewBox.baseVal, [[e.x, e.y], [e.x + e.width, e.y + e.height]]) : [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]) : [[0, 0], [e.clientWidth, e.clientHeight]];
}
function xa() {
  return this.__zoom || eo;
}
function Gw(e) {
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * (e.ctrlKey ? 10 : 1);
}
function Yw() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function Xw(e, t, n) {
  var o = e.invertX(t[0][0]) - n[0][0], i = e.invertX(t[1][0]) - n[1][0], r = e.invertY(t[0][1]) - n[0][1], s = e.invertY(t[1][1]) - n[1][1];
  return e.translate(
    i > o ? (o + i) / 2 : Math.min(0, o) || Math.max(0, i),
    s > r ? (r + s) / 2 : Math.min(0, r) || Math.max(0, s)
  );
}
function qw() {
  var e = Uw, t = jw, n = Xw, o = Gw, i = Yw, r = [0, 1 / 0], s = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], l = 250, a = I_, u = Zi("start", "zoom", "end"), c, f, p, g = 500, _ = 150, C = 0, $ = 10;
  function M(E) {
    E.property("__zoom", xa).on("wheel.zoom", T, { passive: !1 }).on("mousedown.zoom", N).on("dblclick.zoom", V).filter(i).on("touchstart.zoom", Z).on("touchmove.zoom", O).on("touchend.zoom touchcancel.zoom", R).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  M.transform = function(E, A, P, j) {
    var q = E.selection ? E.selection() : E;
    q.property("__zoom", xa), E !== q ? H(E, A, P, j) : q.interrupt().each(function() {
      L(this, arguments).event(j).start().zoom(null, typeof A == "function" ? A.apply(this, arguments) : A).end();
    });
  }, M.scaleBy = function(E, A, P, j) {
    M.scaleTo(E, function() {
      var q = this.__zoom.k, ee = typeof A == "function" ? A.apply(this, arguments) : A;
      return q * ee;
    }, P, j);
  }, M.scaleTo = function(E, A, P, j) {
    M.transform(E, function() {
      var q = t.apply(this, arguments), ee = this.__zoom, oe = P == null ? w(q) : typeof P == "function" ? P.apply(this, arguments) : P, ce = ee.invert(oe), te = typeof A == "function" ? A.apply(this, arguments) : A;
      return n(x(D(ee, te), oe, ce), q, s);
    }, P, j);
  }, M.translateBy = function(E, A, P, j) {
    M.transform(E, function() {
      return n(this.__zoom.translate(
        typeof A == "function" ? A.apply(this, arguments) : A,
        typeof P == "function" ? P.apply(this, arguments) : P
      ), t.apply(this, arguments), s);
    }, null, j);
  }, M.translateTo = function(E, A, P, j, q) {
    M.transform(E, function() {
      var ee = t.apply(this, arguments), oe = this.__zoom, ce = j == null ? w(ee) : typeof j == "function" ? j.apply(this, arguments) : j;
      return n(eo.translate(ce[0], ce[1]).scale(oe.k).translate(
        typeof A == "function" ? -A.apply(this, arguments) : -A,
        typeof P == "function" ? -P.apply(this, arguments) : -P
      ), ee, s);
    }, j, q);
  };
  function D(E, A) {
    return A = Math.max(r[0], Math.min(r[1], A)), A === E.k ? E : new Yt(A, E.x, E.y);
  }
  function x(E, A, P) {
    var j = A[0] - P[0] * E.k, q = A[1] - P[1] * E.k;
    return j === E.x && q === E.y ? E : new Yt(E.k, j, q);
  }
  function w(E) {
    return [(+E[0][0] + +E[1][0]) / 2, (+E[0][1] + +E[1][1]) / 2];
  }
  function H(E, A, P, j) {
    E.on("start.zoom", function() {
      L(this, arguments).event(j).start();
    }).on("interrupt.zoom end.zoom", function() {
      L(this, arguments).event(j).end();
    }).tween("zoom", function() {
      var q = this, ee = arguments, oe = L(q, ee).event(j), ce = t.apply(q, ee), te = P == null ? w(ce) : typeof P == "function" ? P.apply(q, ee) : P, ae = Math.max(ce[1][0] - ce[0][0], ce[1][1] - ce[0][1]), se = q.__zoom, _e = typeof A == "function" ? A.apply(q, ee) : A, W = a(se.invert(te).concat(ae / se.k), _e.invert(te).concat(ae / _e.k));
      return function(he) {
        if (he === 1)
          he = _e;
        else {
          var we = W(he), pe = ae / we[2];
          he = new Yt(pe, te[0] - we[0] * pe, te[1] - we[1] * pe);
        }
        oe.zoom(null, he);
      };
    });
  }
  function L(E, A, P) {
    return !P && E.__zooming || new z(E, A);
  }
  function z(E, A) {
    this.that = E, this.args = A, this.active = 0, this.sourceEvent = null, this.extent = t.apply(E, A), this.taps = 0;
  }
  z.prototype = {
    event: function(E) {
      return E && (this.sourceEvent = E), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(E, A) {
      return this.mouse && E !== "mouse" && (this.mouse[1] = A.invert(this.mouse[0])), this.touch0 && E !== "touch" && (this.touch0[1] = A.invert(this.touch0[0])), this.touch1 && E !== "touch" && (this.touch1[1] = A.invert(this.touch1[0])), this.that.__zoom = A, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(E) {
      var A = wt(this.that).datum();
      u.call(
        E,
        this.that,
        new Hw(E, {
          sourceEvent: this.sourceEvent,
          target: M,
          transform: this.that.__zoom,
          dispatch: u
        }),
        A
      );
    }
  };
  function T(E, ...A) {
    if (!e.apply(this, arguments))
      return;
    var P = L(this, A).event(E), j = this.__zoom, q = Math.max(r[0], Math.min(r[1], j.k * Math.pow(2, o.apply(this, arguments)))), ee = Tt(E);
    if (P.wheel)
      (P.mouse[0][0] !== ee[0] || P.mouse[0][1] !== ee[1]) && (P.mouse[1] = j.invert(P.mouse[0] = ee)), clearTimeout(P.wheel);
    else {
      if (j.k === q)
        return;
      P.mouse = [ee, j.invert(ee)], vi(this), P.start();
    }
    ao(E), P.wheel = setTimeout(oe, _), P.zoom("mouse", n(x(D(j, q), P.mouse[0], P.mouse[1]), P.extent, s));
    function oe() {
      P.wheel = null, P.end();
    }
  }
  function N(E, ...A) {
    if (p || !e.apply(this, arguments))
      return;
    var P = E.currentTarget, j = L(this, A, !0).event(E), q = wt(E.view).on("mousemove.zoom", te, !0).on("mouseup.zoom", ae, !0), ee = Tt(E, P), oe = E.clientX, ce = E.clientY;
    Jc(E.view), Mr(E), j.mouse = [ee, this.__zoom.invert(ee)], vi(this), j.start();
    function te(se) {
      if (ao(se), !j.moved) {
        var _e = se.clientX - oe, W = se.clientY - ce;
        j.moved = _e * _e + W * W > C;
      }
      j.event(se).zoom("mouse", n(x(j.that.__zoom, j.mouse[0] = Tt(se, P), j.mouse[1]), j.extent, s));
    }
    function ae(se) {
      q.on("mousemove.zoom mouseup.zoom", null), Qc(se.view, j.moved), ao(se), j.event(se).end();
    }
  }
  function V(E, ...A) {
    if (e.apply(this, arguments)) {
      var P = this.__zoom, j = Tt(E.changedTouches ? E.changedTouches[0] : E, this), q = P.invert(j), ee = P.k * (E.shiftKey ? 0.5 : 2), oe = n(x(D(P, ee), j, q), t.apply(this, A), s);
      ao(E), l > 0 ? wt(this).transition().duration(l).call(H, oe, j, E) : wt(this).call(M.transform, oe, j, E);
    }
  }
  function Z(E, ...A) {
    if (e.apply(this, arguments)) {
      var P = E.touches, j = P.length, q = L(this, A, E.changedTouches.length === j).event(E), ee, oe, ce, te;
      for (Mr(E), oe = 0; oe < j; ++oe)
        ce = P[oe], te = Tt(ce, this), te = [te, this.__zoom.invert(te), ce.identifier], q.touch0 ? !q.touch1 && q.touch0[2] !== te[2] && (q.touch1 = te, q.taps = 0) : (q.touch0 = te, ee = !0, q.taps = 1 + !!c);
      c && (c = clearTimeout(c)), ee && (q.taps < 2 && (f = te[0], c = setTimeout(function() {
        c = null;
      }, g)), vi(this), q.start());
    }
  }
  function O(E, ...A) {
    if (this.__zooming) {
      var P = L(this, A).event(E), j = E.changedTouches, q = j.length, ee, oe, ce, te;
      for (ao(E), ee = 0; ee < q; ++ee)
        oe = j[ee], ce = Tt(oe, this), P.touch0 && P.touch0[2] === oe.identifier ? P.touch0[0] = ce : P.touch1 && P.touch1[2] === oe.identifier && (P.touch1[0] = ce);
      if (oe = P.that.__zoom, P.touch1) {
        var ae = P.touch0[0], se = P.touch0[1], _e = P.touch1[0], W = P.touch1[1], he = (he = _e[0] - ae[0]) * he + (he = _e[1] - ae[1]) * he, we = (we = W[0] - se[0]) * we + (we = W[1] - se[1]) * we;
        oe = D(oe, Math.sqrt(he / we)), ce = [(ae[0] + _e[0]) / 2, (ae[1] + _e[1]) / 2], te = [(se[0] + W[0]) / 2, (se[1] + W[1]) / 2];
      } else if (P.touch0)
        ce = P.touch0[0], te = P.touch0[1];
      else
        return;
      P.zoom("touch", n(x(oe, ce, te), P.extent, s));
    }
  }
  function R(E, ...A) {
    if (this.__zooming) {
      var P = L(this, A).event(E), j = E.changedTouches, q = j.length, ee, oe;
      for (Mr(E), p && clearTimeout(p), p = setTimeout(function() {
        p = null;
      }, g), ee = 0; ee < q; ++ee)
        oe = j[ee], P.touch0 && P.touch0[2] === oe.identifier ? delete P.touch0 : P.touch1 && P.touch1[2] === oe.identifier && delete P.touch1;
      if (P.touch1 && !P.touch0 && (P.touch0 = P.touch1, delete P.touch1), P.touch0)
        P.touch0[1] = this.__zoom.invert(P.touch0[0]);
      else if (P.end(), P.taps === 2 && (oe = Tt(oe, this), Math.hypot(f[0] - oe[0], f[1] - oe[1]) < $)) {
        var ce = wt(this).on("dblclick.zoom");
        ce && ce.apply(this, arguments);
      }
    }
  }
  return M.wheelDelta = function(E) {
    return arguments.length ? (o = typeof E == "function" ? E : ti(+E), M) : o;
  }, M.filter = function(E) {
    return arguments.length ? (e = typeof E == "function" ? E : ti(!!E), M) : e;
  }, M.touchable = function(E) {
    return arguments.length ? (i = typeof E == "function" ? E : ti(!!E), M) : i;
  }, M.extent = function(E) {
    return arguments.length ? (t = typeof E == "function" ? E : ti([[+E[0][0], +E[0][1]], [+E[1][0], +E[1][1]]]), M) : t;
  }, M.scaleExtent = function(E) {
    return arguments.length ? (r[0] = +E[0], r[1] = +E[1], M) : [r[0], r[1]];
  }, M.translateExtent = function(E) {
    return arguments.length ? (s[0][0] = +E[0][0], s[1][0] = +E[1][0], s[0][1] = +E[0][1], s[1][1] = +E[1][1], M) : [[s[0][0], s[0][1]], [s[1][0], s[1][1]]];
  }, M.constrain = function(E) {
    return arguments.length ? (n = E, M) : n;
  }, M.duration = function(E) {
    return arguments.length ? (l = +E, M) : l;
  }, M.interpolate = function(E) {
    return arguments.length ? (a = E, M) : a;
  }, M.on = function() {
    var E = u.on.apply(u, arguments);
    return E === u ? M : E;
  }, M.clickDistance = function(E) {
    return arguments.length ? (C = (E = +E) * E, M) : Math.sqrt(C);
  }, M.tapDistance = function(E) {
    return arguments.length ? ($ = +E, M) : $;
  }, M;
}
var fe = /* @__PURE__ */ ((e) => (e.Left = "left", e.Top = "top", e.Right = "right", e.Bottom = "bottom", e))(fe || {}), Gs = /* @__PURE__ */ ((e) => (e.Partial = "partial", e.Full = "full", e))(Gs || {}), wn = /* @__PURE__ */ ((e) => (e.Bezier = "default", e.SimpleBezier = "simple-bezier", e.Straight = "straight", e.Step = "step", e.SmoothStep = "smoothstep", e))(wn || {}), Pn = /* @__PURE__ */ ((e) => (e.Strict = "strict", e.Loose = "loose", e))(Pn || {}), ds = /* @__PURE__ */ ((e) => (e.Arrow = "arrow", e.ArrowClosed = "arrowclosed", e))(ds || {}), Eo = /* @__PURE__ */ ((e) => (e.Free = "free", e.Vertical = "vertical", e.Horizontal = "horizontal", e))(Eo || {});
function fs(e) {
  var t, n;
  const o = ((n = (t = e.composedPath) == null ? void 0 : t.call(e)) == null ? void 0 : n[0]) || e.target, i = typeof (o == null ? void 0 : o.hasAttribute) == "function" ? o.hasAttribute("contenteditable") : !1, r = typeof (o == null ? void 0 : o.closest) == "function" ? o.closest(".nokey") : null;
  return ["INPUT", "SELECT", "TEXTAREA"].includes(o == null ? void 0 : o.nodeName) || i || !!r;
}
function Ww(e) {
  return e.ctrlKey || e.metaKey || e.shiftKey;
}
function ka(e, t, n, o) {
  const i = t.replace("+", `
`).replace(`

`, `
+`).split(`
`).map((s) => s.trim().toLowerCase());
  if (i.length === 1)
    return e.toLowerCase() === t.toLowerCase();
  o || n.add(e.toLowerCase());
  const r = i.every(
    (s, l) => n.has(s) && Array.from(n.values())[l] === i[l]
  );
  return o && n.delete(e.toLowerCase()), r;
}
function Kw(e, t) {
  return (n) => {
    if (!n.code && !n.key)
      return !1;
    const o = Zw(n.code, e);
    return Array.isArray(e) ? e.some((i) => ka(n[o], i, t, n.type === "keyup")) : ka(n[o], e, t, n.type === "keyup");
  };
}
function Zw(e, t) {
  return t.includes(e) ? "code" : "key";
}
function xo(e, t) {
  const n = ze(() => Ce(t == null ? void 0 : t.actInsideInputWithModifier) ?? !1), o = ze(() => Ce(t == null ? void 0 : t.target) ?? window), i = ie(Ce(e) === !0);
  let r = !1;
  const s = /* @__PURE__ */ new Set();
  let l = u(Ce(e));
  Se(
    () => Ce(e),
    (c, f) => {
      typeof f == "boolean" && typeof c != "boolean" && a(), l = u(c);
    },
    {
      immediate: !0
    }
  ), zc(["blur", "contextmenu"], a), ra(
    (...c) => l(...c),
    (c) => {
      r = Ww(c), !((!r || r && !n.value) && fs(c)) && (c.preventDefault(), i.value = !0);
    },
    { eventName: "keydown", target: o }
  ), ra(
    (...c) => l(...c),
    (c) => {
      if (i.value) {
        if ((!r || r && !n.value) && fs(c))
          return;
        r = !1, i.value = !1;
      }
    },
    { eventName: "keyup", target: o }
  );
  function a() {
    r = !1, s.clear(), i.value = Ce(e) === !0;
  }
  function u(c) {
    return c === null ? (a(), () => !1) : typeof c == "boolean" ? (a(), i.value = c, () => !1) : Array.isArray(c) || typeof c == "string" ? Kw(c, s) : c;
  }
  return i;
}
const hd = "vue-flow__node-desc", pd = "vue-flow__edge-desc", Jw = "vue-flow__aria-live", vd = ["Enter", " ", "Escape"], qn = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};
function hs(e) {
  return {
    ...e.computedPosition || { x: 0, y: 0 },
    width: e.dimensions.width || 0,
    height: e.dimensions.height || 0
  };
}
function ps(e, t) {
  const n = Math.max(0, Math.min(e.x + e.width, t.x + t.width) - Math.max(e.x, t.x)), o = Math.max(0, Math.min(e.y + e.height, t.y + t.height) - Math.max(e.y, t.y));
  return Math.ceil(n * o);
}
function tr(e) {
  return {
    width: e.offsetWidth,
    height: e.offsetHeight
  };
}
function Dn(e, t = 0, n = 1) {
  return Math.min(Math.max(e, t), n);
}
function gd(e, t) {
  return {
    x: Dn(e.x, t[0][0], t[1][0]),
    y: Dn(e.y, t[0][1], t[1][1])
  };
}
function Sa(e) {
  const t = e.getRootNode();
  return "elementFromPoint" in t ? t : window.document;
}
function hn(e) {
  return e && typeof e == "object" && "id" in e && "source" in e && "target" in e;
}
function $n(e) {
  return e && typeof e == "object" && "id" in e && "position" in e && !hn(e);
}
function vo(e) {
  return $n(e) && "computedPosition" in e;
}
function ni(e) {
  return !Number.isNaN(e) && Number.isFinite(e);
}
function Qw(e) {
  return ni(e.width) && ni(e.height) && ni(e.x) && ni(e.y);
}
function eE(e, t, n) {
  const o = {
    id: e.id.toString(),
    type: e.type ?? "default",
    dimensions: Cn({
      width: 0,
      height: 0
    }),
    computedPosition: Cn({
      z: 0,
      ...e.position
    }),
    // todo: shouldn't be defined initially, as we want to use handleBounds to check if a node was actually initialized or not
    handleBounds: {
      source: [],
      target: []
    },
    draggable: void 0,
    selectable: void 0,
    connectable: void 0,
    focusable: void 0,
    selected: !1,
    dragging: !1,
    resizing: !1,
    initialized: !1,
    isParent: !1,
    position: {
      x: 0,
      y: 0
    },
    data: Ge(e.data) ? e.data : {},
    events: Cn(Ge(e.events) ? e.events : {})
  };
  return Object.assign(t ?? o, e, { id: e.id.toString(), parentNode: n });
}
function md(e, t, n) {
  var o, i;
  const r = {
    id: e.id.toString(),
    type: e.type ?? (t == null ? void 0 : t.type) ?? "default",
    source: e.source.toString(),
    target: e.target.toString(),
    sourceHandle: (o = e.sourceHandle) == null ? void 0 : o.toString(),
    targetHandle: (i = e.targetHandle) == null ? void 0 : i.toString(),
    updatable: e.updatable ?? (n == null ? void 0 : n.updatable),
    selectable: e.selectable ?? (n == null ? void 0 : n.selectable),
    focusable: e.focusable ?? (n == null ? void 0 : n.focusable),
    data: Ge(e.data) ? e.data : {},
    events: Cn(Ge(e.events) ? e.events : {}),
    label: e.label ?? "",
    interactionWidth: e.interactionWidth ?? (n == null ? void 0 : n.interactionWidth),
    ...n ?? {}
  };
  return Object.assign(t ?? r, e, { id: e.id.toString() });
}
function yd(e, t, n, o) {
  const i = typeof e == "string" ? e : e.id, r = /* @__PURE__ */ new Set(), s = o === "source" ? "target" : "source";
  for (const l of n)
    l[s] === i && r.add(l[o]);
  return t.filter((l) => r.has(l.id));
}
function tE(...e) {
  if (e.length === 3) {
    const [r, s, l] = e;
    return yd(r, s, l, "target");
  }
  const [t, n] = e, o = typeof t == "string" ? t : t.id;
  return n.filter((r) => hn(r) && r.source === o).map((r) => n.find((s) => $n(s) && s.id === r.target));
}
function nE(...e) {
  if (e.length === 3) {
    const [r, s, l] = e;
    return yd(r, s, l, "source");
  }
  const [t, n] = e, o = typeof t == "string" ? t : t.id;
  return n.filter((r) => hn(r) && r.target === o).map((r) => n.find((s) => $n(s) && s.id === r.source));
}
function bd({ source: e, sourceHandle: t, target: n, targetHandle: o }) {
  return `vueflow__edge-${e}${t ?? ""}-${n}${o ?? ""}`;
}
function oE(e, t) {
  return t.some(
    (n) => hn(n) && n.source === e.source && n.target === e.target && (n.sourceHandle === e.sourceHandle || !n.sourceHandle && !e.sourceHandle) && (n.targetHandle === e.targetHandle || !n.targetHandle && !e.targetHandle)
  );
}
function _d({ x: e, y: t }, { x: n, y: o, zoom: i }) {
  return {
    x: e * i + n,
    y: t * i + o
  };
}
function Ro({ x: e, y: t }, { x: n, y: o, zoom: i }, r = !1, s = [1, 1]) {
  const l = {
    x: (e - n) / i,
    y: (t - o) / i
  };
  return r ? nr(l, s) : l;
}
function iE(e, t) {
  return {
    x: Math.min(e.x, t.x),
    y: Math.min(e.y, t.y),
    x2: Math.max(e.x2, t.x2),
    y2: Math.max(e.y2, t.y2)
  };
}
function wd({ x: e, y: t, width: n, height: o }) {
  return {
    x: e,
    y: t,
    x2: e + n,
    y2: t + o
  };
}
function rE({ x: e, y: t, x2: n, y2: o }) {
  return {
    x: e,
    y: t,
    width: n - e,
    height: o - t
  };
}
function Ed(e) {
  let t = {
    x: Number.POSITIVE_INFINITY,
    y: Number.POSITIVE_INFINITY,
    x2: Number.NEGATIVE_INFINITY,
    y2: Number.NEGATIVE_INFINITY
  };
  for (let n = 0; n < e.length; n++) {
    const o = e[n];
    t = iE(
      t,
      wd({
        ...o.computedPosition,
        ...o.dimensions
      })
    );
  }
  return rE(t);
}
function xd(e, t, n = { x: 0, y: 0, zoom: 1 }, o = !1, i = !1) {
  const r = {
    ...Ro(t, n),
    width: t.width / n.zoom,
    height: t.height / n.zoom
  }, s = [];
  for (const l of e) {
    const { dimensions: a, selectable: u = !0, hidden: c = !1 } = l, f = a.width ?? l.width ?? null, p = a.height ?? l.height ?? null;
    if (i && !u || c)
      continue;
    const g = ps(r, hs(l)), _ = f === null || p === null, C = o && g > 0, $ = (f ?? 0) * (p ?? 0);
    (_ || C || g >= $ || l.dragging) && s.push(l);
  }
  return s;
}
function kd(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (typeof e == "string")
    n.add(e);
  else if (e.length >= 1)
    for (const o of e)
      n.add(o.id);
  return t.filter((o) => n.has(o.source) || n.has(o.target));
}
function Ca(e, t, n, o, i, r = 0.1, s = { x: 0, y: 0 }) {
  const l = t / (e.width * (1 + r)), a = n / (e.height * (1 + r)), u = Math.min(l, a), c = Dn(u, o, i), f = e.x + e.width / 2, p = e.y + e.height / 2, g = t / 2 - f * c + (s.x ?? 0), _ = n / 2 - p * c + (s.y ?? 0);
  return { x: g, y: _, zoom: c };
}
function sE(e, t) {
  return {
    x: t.x + e.x,
    y: t.y + e.y,
    z: (e.z > t.z ? e.z : t.z) + 1
  };
}
function Sd(e, t) {
  if (!e.parentNode)
    return !1;
  const n = t(e.parentNode);
  return n ? n.selected ? !0 : Sd(n, t) : !1;
}
function Lo(e, t) {
  return typeof e > "u" ? "" : typeof e == "string" ? e : `${t ? `${t}__` : ""}${Object.keys(e).sort().map((o) => `${o}=${e[o]}`).join("&")}`;
}
function Na(e, t, n) {
  return e < t ? Dn(Math.abs(e - t), 1, t) / t : e > n ? -Dn(Math.abs(e - n), 1, t) / t : 0;
}
function Cd(e, t, n = 15, o = 40) {
  const i = Na(e.x, o, t.width - o) * n, r = Na(e.y, o, t.height - o) * n;
  return [i, r];
}
function Ir(e, t) {
  if (t) {
    const n = e.position.x + e.dimensions.width - t.dimensions.width, o = e.position.y + e.dimensions.height - t.dimensions.height;
    if (n > 0 || o > 0 || e.position.x < 0 || e.position.y < 0) {
      let i = {};
      if (typeof t.style == "function" ? i = { ...t.style(t) } : t.style && (i = { ...t.style }), i.width = i.width ?? `${t.dimensions.width}px`, i.height = i.height ?? `${t.dimensions.height}px`, n > 0)
        if (typeof i.width == "string") {
          const r = Number(i.width.replace("px", ""));
          i.width = `${r + n}px`;
        } else
          i.width += n;
      if (o > 0)
        if (typeof i.height == "string") {
          const r = Number(i.height.replace("px", ""));
          i.height = `${r + o}px`;
        } else
          i.height += o;
      if (e.position.x < 0) {
        const r = Math.abs(e.position.x);
        if (t.position.x = t.position.x - r, typeof i.width == "string") {
          const s = Number(i.width.replace("px", ""));
          i.width = `${s + r}px`;
        } else
          i.width += r;
        e.position.x = 0;
      }
      if (e.position.y < 0) {
        const r = Math.abs(e.position.y);
        if (t.position.y = t.position.y - r, typeof i.height == "string") {
          const s = Number(i.height.replace("px", ""));
          i.height = `${s + r}px`;
        } else
          i.height += r;
        e.position.y = 0;
      }
      t.dimensions.width = Number(i.width.toString().replace("px", "")), t.dimensions.height = Number(i.height.toString().replace("px", "")), typeof t.style == "function" ? t.style = (r) => {
        const s = t.style;
        return {
          ...s(r),
          ...i
        };
      } : t.style = {
        ...t.style,
        ...i
      };
    }
  }
}
function $a(e, t) {
  var n, o;
  const i = e.filter((s) => s.type === "add" || s.type === "remove");
  for (const s of i)
    if (s.type === "add")
      t.findIndex((a) => a.id === s.item.id) === -1 && t.push(s.item);
    else if (s.type === "remove") {
      const l = t.findIndex((a) => a.id === s.id);
      l !== -1 && t.splice(l, 1);
    }
  const r = t.map((s) => s.id);
  for (const s of t)
    for (const l of e)
      if (l.id === s.id)
        switch (l.type) {
          case "select":
            s.selected = l.selected;
            break;
          case "position":
            if (vo(s) && (typeof l.position < "u" && (s.position = l.position), typeof l.dragging < "u" && (s.dragging = l.dragging), s.expandParent && s.parentNode)) {
              const a = t[r.indexOf(s.parentNode)];
              a && vo(a) && Ir(s, a);
            }
            break;
          case "dimensions":
            if (vo(s) && (typeof l.dimensions < "u" && (s.dimensions = l.dimensions), typeof l.updateStyle < "u" && l.updateStyle && (s.style = {
              ...s.style || {},
              width: `${(n = l.dimensions) == null ? void 0 : n.width}px`,
              height: `${(o = l.dimensions) == null ? void 0 : o.height}px`
            }), typeof l.resizing < "u" && (s.resizing = l.resizing), s.expandParent && s.parentNode)) {
              const a = t[r.indexOf(s.parentNode)];
              a && vo(a) && (!!a.dimensions.width && !!a.dimensions.height ? Ir(s, a) : Ze(() => {
                Ir(s, a);
              }));
            }
            break;
        }
  return t;
}
function Qt(e, t) {
  return {
    id: e,
    type: "select",
    selected: t
  };
}
function Ma(e) {
  return {
    item: e,
    type: "add"
  };
}
function Ia(e) {
  return {
    id: e,
    type: "remove"
  };
}
function Oa(e, t, n, o, i) {
  return {
    id: e,
    source: t,
    target: n,
    sourceHandle: o || null,
    targetHandle: i || null,
    type: "remove"
  };
}
function on(e, t = /* @__PURE__ */ new Set(), n = !1) {
  const o = [];
  for (const [i, r] of e) {
    const s = t.has(i);
    !(r.selected === void 0 && !s) && r.selected !== s && (n && (r.selected = s), o.push(Qt(r.id, s)));
  }
  return o;
}
function ue(e) {
  const t = /* @__PURE__ */ new Set();
  let n = !1;
  const o = () => t.size > 0;
  e && (n = !0, t.add(e));
  const i = (l) => {
    t.delete(l);
  };
  return {
    on: (l) => {
      e && n && t.delete(e), t.add(l);
      const a = () => {
        i(l), e && n && t.add(e);
      };
      return Ki(a), {
        off: a
      };
    },
    off: i,
    trigger: (l) => Promise.all(Array.from(t).map((a) => a(l))),
    hasListeners: o,
    fns: t
  };
}
function Ta(e, t, n) {
  let o = e;
  do {
    if (o && o.matches(t))
      return !0;
    if (o === n)
      return !1;
    o = o.parentElement;
  } while (o);
  return !1;
}
function lE(e, t, n, o, i) {
  var r, s;
  const l = [];
  for (const a of e)
    (a.selected || a.id === i) && (!a.parentNode || !Sd(a, o)) && (a.draggable || t && typeof a.draggable > "u") && l.push(
      Cn({
        id: a.id,
        position: a.position || { x: 0, y: 0 },
        distance: {
          x: n.x - ((r = a.computedPosition) == null ? void 0 : r.x) || 0,
          y: n.y - ((s = a.computedPosition) == null ? void 0 : s.y) || 0
        },
        from: a.computedPosition,
        extent: a.extent,
        parentNode: a.parentNode,
        dimensions: a.dimensions,
        expandParent: a.expandParent
      })
    );
  return l;
}
function Or({
  id: e,
  dragItems: t,
  findNode: n
}) {
  const o = [];
  for (const i of t) {
    const r = n(i.id);
    r && o.push(r);
  }
  return [e ? o.find((i) => i.id === e) : o[0], o];
}
function Nd(e) {
  if (Array.isArray(e))
    switch (e.length) {
      case 1:
        return [e[0], e[0], e[0], e[0]];
      case 2:
        return [e[0], e[1], e[0], e[1]];
      case 3:
        return [e[0], e[1], e[2], e[1]];
      case 4:
        return e;
      default:
        return [0, 0, 0, 0];
    }
  return [e, e, e, e];
}
function aE(e, t, n) {
  const [o, i, r, s] = typeof e != "string" ? Nd(e.padding) : [0, 0, 0, 0];
  return n && typeof n.computedPosition.x < "u" && typeof n.computedPosition.y < "u" && typeof n.dimensions.width < "u" && typeof n.dimensions.height < "u" ? [
    [n.computedPosition.x + s, n.computedPosition.y + o],
    [
      n.computedPosition.x + n.dimensions.width - i,
      n.computedPosition.y + n.dimensions.height - r
    ]
  ] : !1;
}
function uE(e, t, n, o) {
  let i = e.extent || n;
  if ((i === "parent" || !Array.isArray(i) && (i == null ? void 0 : i.range) === "parent") && !e.expandParent)
    if (e.parentNode && o && e.dimensions.width && e.dimensions.height) {
      const r = aE(i, e, o);
      r && (i = r);
    } else
      t(new We(Ye.NODE_EXTENT_INVALID, e.id)), i = n;
  else if (Array.isArray(i)) {
    const r = (o == null ? void 0 : o.computedPosition.x) || 0, s = (o == null ? void 0 : o.computedPosition.y) || 0;
    i = [
      [i[0][0] + r, i[0][1] + s],
      [i[1][0] + r, i[1][1] + s]
    ];
  } else if (i !== "parent" && (i != null && i.range) && Array.isArray(i.range)) {
    const [r, s, l, a] = Nd(i.padding), u = (o == null ? void 0 : o.computedPosition.x) || 0, c = (o == null ? void 0 : o.computedPosition.y) || 0;
    i = [
      [i.range[0][0] + u + a, i.range[0][1] + c + r],
      [i.range[1][0] + u - s, i.range[1][1] + c - l]
    ];
  }
  return i === "parent" ? [
    [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
  ] : i;
}
function cE({ width: e, height: t }, n) {
  return [n[0], [n[1][0] - (e || 0), n[1][1] - (t || 0)]];
}
function Ys(e, t, n, o, i) {
  const r = cE(e.dimensions, uE(e, n, o, i)), s = gd(t, r);
  return {
    position: {
      x: s.x - ((i == null ? void 0 : i.computedPosition.x) || 0),
      y: s.y - ((i == null ? void 0 : i.computedPosition.y) || 0)
    },
    computedPosition: s
  };
}
function Pi(e, t, n = fe.Left) {
  const o = ((t == null ? void 0 : t.x) ?? 0) + e.computedPosition.x, i = ((t == null ? void 0 : t.y) ?? 0) + e.computedPosition.y, { width: r, height: s } = t ?? hE(e);
  switch ((t == null ? void 0 : t.position) ?? n) {
    case fe.Top:
      return {
        x: o + r / 2,
        y: i
      };
    case fe.Right:
      return {
        x: o + r,
        y: i + s / 2
      };
    case fe.Bottom:
      return {
        x: o + r / 2,
        y: i + s
      };
    case fe.Left:
      return {
        x: o,
        y: i + s / 2
      };
  }
}
function Pa(e = [], t) {
  return e.length && (t ? e.find((n) => n.id === t) : e[0]) || null;
}
function dE({
  sourcePos: e,
  targetPos: t,
  sourceWidth: n,
  sourceHeight: o,
  targetWidth: i,
  targetHeight: r,
  width: s,
  height: l,
  viewport: a
}) {
  const u = {
    x: Math.min(e.x, t.x),
    y: Math.min(e.y, t.y),
    x2: Math.max(e.x + n, t.x + i),
    y2: Math.max(e.y + o, t.y + r)
  };
  u.x === u.x2 && (u.x2 += 1), u.y === u.y2 && (u.y2 += 1);
  const c = wd({
    x: (0 - a.x) / a.zoom,
    y: (0 - a.y) / a.zoom,
    width: s / a.zoom,
    height: l / a.zoom
  }), f = Math.max(0, Math.min(c.x2, u.x2) - Math.max(c.x, u.x)), p = Math.max(0, Math.min(c.y2, u.y2) - Math.max(c.y, u.y));
  return Math.ceil(f * p) > 0;
}
function fE(e, t, n = !1) {
  const o = typeof e.zIndex == "number";
  let i = o ? e.zIndex : 0;
  const r = t(e.source), s = t(e.target);
  return !r || !s ? 0 : (n && (i = o ? e.zIndex : Math.max(r.computedPosition.z || 0, s.computedPosition.z || 0)), i);
}
var Ye = /* @__PURE__ */ ((e) => (e.MISSING_STYLES = "MISSING_STYLES", e.MISSING_VIEWPORT_DIMENSIONS = "MISSING_VIEWPORT_DIMENSIONS", e.NODE_INVALID = "NODE_INVALID", e.NODE_NOT_FOUND = "NODE_NOT_FOUND", e.NODE_MISSING_PARENT = "NODE_MISSING_PARENT", e.NODE_TYPE_MISSING = "NODE_TYPE_MISSING", e.NODE_EXTENT_INVALID = "NODE_EXTENT_INVALID", e.EDGE_INVALID = "EDGE_INVALID", e.EDGE_NOT_FOUND = "EDGE_NOT_FOUND", e.EDGE_SOURCE_MISSING = "EDGE_SOURCE_MISSING", e.EDGE_TARGET_MISSING = "EDGE_TARGET_MISSING", e.EDGE_TYPE_MISSING = "EDGE_TYPE_MISSING", e.EDGE_SOURCE_TARGET_SAME = "EDGE_SOURCE_TARGET_SAME", e.EDGE_SOURCE_TARGET_MISSING = "EDGE_SOURCE_TARGET_MISSING", e.EDGE_ORPHANED = "EDGE_ORPHANED", e.USEVUEFLOW_OPTIONS = "USEVUEFLOW_OPTIONS", e))(Ye || {});
const Da = {
  MISSING_STYLES: () => "It seems that you haven't loaded the necessary styles. Please import '@vue-flow/core/dist/style.css' to ensure that the graph is rendered correctly",
  MISSING_VIEWPORT_DIMENSIONS: () => "The Vue Flow parent container needs a width and a height to render the graph",
  NODE_INVALID: (e) => `Node is invalid
Node: ${e}`,
  NODE_NOT_FOUND: (e) => `Node not found
Node: ${e}`,
  NODE_MISSING_PARENT: (e, t) => `Node is missing a parent
Node: ${e}
Parent: ${t}`,
  NODE_TYPE_MISSING: (e) => `Node type is missing
Type: ${e}`,
  NODE_EXTENT_INVALID: (e) => `Only child nodes can use a parent extent
Node: ${e}`,
  EDGE_INVALID: (e) => `An edge needs a source and a target
Edge: ${e}`,
  EDGE_SOURCE_MISSING: (e, t) => `Edge source is missing
Edge: ${e} 
Source: ${t}`,
  EDGE_TARGET_MISSING: (e, t) => `Edge target is missing
Edge: ${e} 
Target: ${t}`,
  EDGE_TYPE_MISSING: (e) => `Edge type is missing
Type: ${e}`,
  EDGE_SOURCE_TARGET_SAME: (e, t, n) => `Edge source and target are the same
Edge: ${e} 
Source: ${t} 
Target: ${n}`,
  EDGE_SOURCE_TARGET_MISSING: (e, t, n) => `Edge source or target is missing
Edge: ${e} 
Source: ${t} 
Target: ${n}`,
  EDGE_ORPHANED: (e) => `Edge was orphaned (suddenly missing source or target) and has been removed
Edge: ${e}`,
  EDGE_NOT_FOUND: (e) => `Edge not found
Edge: ${e}`,
  // deprecation errors
  USEVUEFLOW_OPTIONS: () => "The options parameter is deprecated and will be removed in the next major version. Please use the id parameter instead"
};
class We extends Error {
  constructor(t, ...n) {
    var o;
    super((o = Da[t]) == null ? void 0 : o.call(Da, ...n)), this.name = "VueFlowError", this.code = t, this.args = n;
  }
}
function Xs(e) {
  return "clientX" in e;
}
function $d(e) {
  return "sourceEvent" in e;
}
function Wt(e, t) {
  var n, o;
  const i = Xs(e), r = i ? e.clientX : (n = e.touches) == null ? void 0 : n[0].clientX, s = i ? e.clientY : (o = e.touches) == null ? void 0 : o[0].clientY;
  return {
    x: r - ((t == null ? void 0 : t.left) ?? 0),
    y: s - ((t == null ? void 0 : t.top) ?? 0)
  };
}
const Di = () => {
  var e;
  return typeof navigator < "u" && ((e = navigator == null ? void 0 : navigator.userAgent) == null ? void 0 : e.indexOf("Mac")) >= 0;
};
function hE(e) {
  var t, n;
  return {
    width: ((t = e.dimensions) == null ? void 0 : t.width) ?? e.width ?? 0,
    height: ((n = e.dimensions) == null ? void 0 : n.height) ?? e.height ?? 0
  };
}
function nr(e, t = [1, 1]) {
  return {
    x: t[0] * Math.round(e.x / t[0]),
    y: t[1] * Math.round(e.y / t[1])
  };
}
function Md() {
  return {
    handleDomNode: null,
    isValid: !1,
    connection: { source: "", target: "", sourceHandle: null, targetHandle: null },
    endHandle: null
  };
}
function Tr(e) {
  e == null || e.classList.remove("valid", "connecting", "vue-flow__handle-valid", "vue-flow__handle-connecting");
}
function Aa(e, t, n, o) {
  const i = [];
  for (const r of t[n] || [])
    if (`${e.id}-${r.id}-${n}` !== o) {
      const { x: s, y: l } = Pi(e, r);
      i.push({
        id: r.id || null,
        type: n,
        nodeId: e.id,
        x: s,
        y: l
      });
    }
  return i;
}
function pE(e, t, n, o, i, r) {
  const { x: s, y: l } = Wt(e), u = t.elementsFromPoint(s, l).find((_) => _.classList.contains("vue-flow__handle"));
  if (u) {
    const _ = u.getAttribute("data-nodeid");
    if (_) {
      const C = qs(void 0, u), $ = u.getAttribute("data-handleid"), M = r({ nodeId: _, id: $, type: C });
      if (M) {
        const D = i.find((x) => x.nodeId === _ && x.type === C && x.id === $);
        return {
          handle: {
            id: $,
            type: C,
            nodeId: _,
            x: (D == null ? void 0 : D.x) || n.x,
            y: (D == null ? void 0 : D.y) || n.y
          },
          validHandleResult: M
        };
      }
    }
  }
  let c = [], f = Number.POSITIVE_INFINITY;
  for (const _ of i) {
    const C = Math.sqrt((_.x - n.x) ** 2 + (_.y - n.y) ** 2);
    if (C <= o) {
      const $ = r(_);
      C <= f && (C < f ? c = [{ handle: _, validHandleResult: $ }] : C === f && c.push({
        handle: _,
        validHandleResult: $
      }), f = C);
    }
  }
  if (!c.length)
    return { handle: null, validHandleResult: Md() };
  if (c.length === 1)
    return c[0];
  const p = c.some(({ validHandleResult: _ }) => _.isValid), g = c.some(({ handle: _ }) => _.type === "target");
  return c.find(
    ({ handle: _, validHandleResult: C }) => g ? _.type === "target" : p ? C.isValid : !0
  ) || c[0];
}
function Ra(e, t, n, o, i, r, s, l, a, u, c) {
  const f = r === "target", p = l.querySelector(`.vue-flow__handle[data-id="${t == null ? void 0 : t.nodeId}-${t == null ? void 0 : t.id}-${t == null ? void 0 : t.type}"]`), { x: g, y: _ } = Wt(e), C = l.elementFromPoint(g, _), $ = C != null && C.classList.contains("vue-flow__handle") ? C : p, M = Md();
  if ($) {
    M.handleDomNode = $;
    const D = qs(void 0, $), x = $.getAttribute("data-nodeid"), w = $.getAttribute("data-handleid"), H = $.classList.contains("connectable"), L = $.classList.contains("connectableend"), z = {
      source: f ? x : o,
      sourceHandle: f ? w : i,
      target: f ? o : x,
      targetHandle: f ? i : w
    };
    M.connection = z, H && L && (n === Pn.Strict ? f && D === "source" || !f && D === "target" : x !== o || w !== i) && (M.isValid = s(z, {
      edges: a,
      nodes: u,
      sourceNode: c(z.source),
      targetNode: c(z.target)
    }), M.endHandle = {
      nodeId: x,
      handleId: w,
      type: D,
      position: M.isValid ? $.getAttribute("data-handlepos") : null
    });
  }
  return M;
}
function vE({ nodes: e, nodeId: t, handleId: n, handleType: o }) {
  const i = [];
  for (let r = 0; r < e.length; r++) {
    const s = e[r], { handleBounds: l } = s;
    let a = [], u = [];
    l && (a = Aa(s, l, "source", `${t}-${n}-${o}`), u = Aa(s, l, "target", `${t}-${n}-${o}`)), i.push(...a, ...u);
  }
  return i;
}
function qs(e, t) {
  return e || (t != null && t.classList.contains("target") ? "target" : t != null && t.classList.contains("source") ? "source" : null);
}
function gE(e, t) {
  let n = null;
  return t ? n = "valid" : e && !t && (n = "invalid"), n;
}
const mE = ["production", "prod"];
function or(e, ...t) {
  Id() && console.warn(`[Vue Flow]: ${e}`, ...t);
}
function Id() {
  return !mE.includes("production");
}
function La(e, t, n, o) {
  const i = t.querySelectorAll(`.vue-flow__handle${e}`);
  return Array.from(i).map((s) => {
    const l = s.getBoundingClientRect();
    return {
      id: s.getAttribute("data-handleid"),
      position: s.getAttribute("data-handlepos"),
      x: (l.left - n.left) / o,
      y: (l.top - n.top) / o,
      ...tr(s)
    };
  });
}
function vs(e, t, n, o, i, r = !1, s) {
  i.value = !1, e.selected ? (r || e.selected && t) && (o([e]), Ze(() => {
    s.blur();
  })) : n([e]);
}
function Ge(e) {
  return typeof F(e) < "u";
}
function yE(e, t, n, o) {
  if (!e || !e.source || !e.target)
    return n(new We(Ye.EDGE_INVALID, (e == null ? void 0 : e.id) ?? "[ID UNKNOWN]")), !1;
  let i;
  return hn(e) ? i = e : i = {
    ...e,
    id: bd(e)
  }, i = md(i, void 0, o), oE(i, t) ? !1 : i;
}
function bE(e, t, n, o, i) {
  if (!t.source || !t.target)
    return i(new We(Ye.EDGE_INVALID, e.id)), !1;
  if (!n)
    return i(new We(Ye.EDGE_NOT_FOUND, e.id)), !1;
  const { id: r, ...s } = e;
  return {
    ...s,
    id: o ? bd(t) : r,
    source: t.source,
    target: t.target,
    sourceHandle: t.sourceHandle,
    targetHandle: t.targetHandle
  };
}
function Va(e, t, n) {
  const o = {}, i = [];
  for (let r = 0; r < e.length; ++r) {
    const s = e[r];
    if (!$n(s)) {
      n(
        new We(Ye.NODE_INVALID, s == null ? void 0 : s.id) || `[ID UNKNOWN|INDEX ${r}]`
      );
      continue;
    }
    const l = eE(s, t(s.id), s.parentNode);
    s.parentNode && (o[s.parentNode] = !0), i[r] = l;
  }
  for (const r of i) {
    const s = t(r.parentNode) || i.find((l) => l.id === r.parentNode);
    r.parentNode && !s && n(new We(Ye.NODE_MISSING_PARENT, r.id, r.parentNode)), (r.parentNode || o[r.id]) && (o[r.id] && (r.isParent = !0), s && (s.isParent = !0));
  }
  return i;
}
function Pr(e, t) {
  e.clear();
  for (const n of t) {
    const { id: o, source: i, target: r, sourceHandle: s = null, targetHandle: l = null } = n, a = `${i}-source-${s}`, u = `${r}-target-${l}`, c = e.get(a) || /* @__PURE__ */ new Map(), f = e.get(u) || /* @__PURE__ */ new Map(), p = Cn({ edgeId: o, source: i, target: r, sourceHandle: s, targetHandle: l });
    e.set(a, c.set(`${r}-${l}`, p)), e.set(u, f.set(`${i}-${s}`, p));
  }
}
function Dr(e, t, n, o, i, r, s, l) {
  const a = [];
  for (const u of e) {
    const c = hn(u) ? u : yE(u, l, i, r);
    if (!c)
      continue;
    const f = n(c.source), p = n(c.target);
    if (!f || !p) {
      i(new We(Ye.EDGE_SOURCE_TARGET_MISSING, c.id, c.source, c.target));
      continue;
    }
    if (!f) {
      i(new We(Ye.EDGE_SOURCE_MISSING, c.id, c.source));
      continue;
    }
    if (!p) {
      i(new We(Ye.EDGE_TARGET_MISSING, c.id, c.target));
      continue;
    }
    if (t && !t(c, {
      edges: l,
      nodes: s,
      sourceNode: f,
      targetNode: p
    })) {
      i(new We(Ye.EDGE_INVALID, c.id));
      continue;
    }
    const g = o(c.id);
    a.push({
      ...md(c, g, r),
      sourceNode: f,
      targetNode: p
    });
  }
  return a;
}
const za = Symbol("vueFlow"), Od = Symbol("nodeId"), Td = Symbol("nodeRef"), _E = Symbol("edgeId"), wE = Symbol("edgeRef"), ir = Symbol("slots");
function Pd(e) {
  const {
    vueFlowRef: t,
    snapToGrid: n,
    snapGrid: o,
    noDragClassName: i,
    nodes: r,
    nodeExtent: s,
    nodeDragThreshold: l,
    viewport: a,
    autoPanOnNodeDrag: u,
    autoPanSpeed: c,
    nodesDraggable: f,
    panBy: p,
    findNode: g,
    multiSelectionActive: _,
    nodesSelectionActive: C,
    selectNodesOnDrag: $,
    removeSelectedElements: M,
    addSelectedNodes: D,
    updateNodePositions: x,
    emits: w
  } = Be(), { onStart: H, onDrag: L, onStop: z, onClick: T, el: N, disabled: V, id: Z, selectable: O, dragHandle: R } = e, E = ie(!1);
  let A = [], P, j = null, q = { x: void 0, y: void 0 }, ee = { x: 0, y: 0 }, oe = null, ce = !1, te = 0, ae = !1;
  const se = kE(), _e = ({ x: Y, y: d }) => {
    q = { x: Y, y: d };
    let k = !1;
    if (A = A.map((v) => {
      const m = { x: Y - v.distance.x, y: d - v.distance.y }, { computedPosition: y } = Ys(
        v,
        n.value ? nr(m, o.value) : m,
        w.error,
        s.value,
        v.parentNode ? g(v.parentNode) : void 0
      );
      return k = k || v.position.x !== y.x || v.position.y !== y.y, v.position = y, v;
    }), !!k && (x(A, !0, !0), E.value = !0, oe)) {
      const [v, m] = Or({
        id: Z,
        dragItems: A,
        findNode: g
      });
      L({ event: oe, node: v, nodes: m });
    }
  }, W = () => {
    if (!j)
      return;
    const [Y, d] = Cd(ee, j, c.value);
    if (Y !== 0 || d !== 0) {
      const k = {
        x: (q.x ?? 0) - Y / a.value.zoom,
        y: (q.y ?? 0) - d / a.value.zoom
      };
      p({ x: Y, y: d }) && _e(k);
    }
    te = requestAnimationFrame(W);
  }, he = (Y, d) => {
    ce = !0;
    const k = g(Z);
    !$.value && !_.value && k && (k.selected || M()), k && Ce(O) && $.value && vs(
      k,
      _.value,
      D,
      M,
      C,
      !1,
      d
    );
    const v = se(Y.sourceEvent);
    if (q = v, A = lE(r.value, f.value, v, g, Z), A.length) {
      const [m, y] = Or({
        id: Z,
        dragItems: A,
        findNode: g
      });
      H({ event: Y.sourceEvent, node: m, nodes: y });
    }
  }, we = (Y, d) => {
    var k;
    Y.sourceEvent.type === "touchmove" && Y.sourceEvent.touches.length > 1 || (l.value === 0 && he(Y, d), q = se(Y.sourceEvent), j = ((k = t.value) == null ? void 0 : k.getBoundingClientRect()) || null, ee = Wt(Y.sourceEvent, j));
  }, pe = (Y, d) => {
    const k = se(Y.sourceEvent);
    if (!ae && ce && u.value && (ae = !0, W()), !ce) {
      const v = k.xSnapped - (q.x ?? 0), m = k.ySnapped - (q.y ?? 0);
      Math.sqrt(v * v + m * m) > l.value && he(Y, d);
    }
    (q.x !== k.xSnapped || q.y !== k.ySnapped) && A.length && ce && (oe = Y.sourceEvent, ee = Wt(Y.sourceEvent, j), _e(k));
  }, ge = (Y) => {
    if (!$d(Y) && !ce && !E.value && !_.value) {
      const d = Y, k = se(d), v = k.xSnapped - (q.x ?? 0), m = k.ySnapped - (q.y ?? 0), y = Math.sqrt(v * v + m * m);
      y !== 0 && y <= l.value && (T == null || T(d));
      return;
    }
    if (E.value = !1, ae = !1, ce = !1, q = { x: void 0, y: void 0 }, cancelAnimationFrame(te), A.length) {
      x(A, !1, !1);
      const [d, k] = Or({
        id: Z,
        dragItems: A,
        findNode: g
      });
      z({ event: Y.sourceEvent, node: d, nodes: k });
    }
  };
  return Se([() => Ce(V), N], ([Y, d], k, v) => {
    if (d) {
      const m = wt(d);
      Y || (P = i_().on("start", (y) => we(y, d)).on("drag", (y) => pe(y, d)).on("end", (y) => ge(y)).filter((y) => {
        const b = y.target, I = Ce(R);
        return !y.button && (!i.value || !Ta(b, `.${i.value}`, d) && (!I || Ta(b, I, d)));
      }), m.call(P)), v(() => {
        m.on(".drag", null), P && (P.on("start", null), P.on("drag", null), P.on("end", null));
      });
    }
  }), E;
}
function EE() {
  return {
    doubleClick: ue(),
    click: ue(),
    mouseEnter: ue(),
    mouseMove: ue(),
    mouseLeave: ue(),
    contextMenu: ue(),
    updateStart: ue(),
    update: ue(),
    updateEnd: ue()
  };
}
function xE(e, t) {
  const n = EE();
  return n.doubleClick.on((o) => {
    var i, r;
    t.edgeDoubleClick(o), (r = (i = e.events) == null ? void 0 : i.doubleClick) == null || r.call(i, o);
  }), n.click.on((o) => {
    var i, r;
    t.edgeClick(o), (r = (i = e.events) == null ? void 0 : i.click) == null || r.call(i, o);
  }), n.mouseEnter.on((o) => {
    var i, r;
    t.edgeMouseEnter(o), (r = (i = e.events) == null ? void 0 : i.mouseEnter) == null || r.call(i, o);
  }), n.mouseMove.on((o) => {
    var i, r;
    t.edgeMouseMove(o), (r = (i = e.events) == null ? void 0 : i.mouseMove) == null || r.call(i, o);
  }), n.mouseLeave.on((o) => {
    var i, r;
    t.edgeMouseLeave(o), (r = (i = e.events) == null ? void 0 : i.mouseLeave) == null || r.call(i, o);
  }), n.contextMenu.on((o) => {
    var i, r;
    t.edgeContextMenu(o), (r = (i = e.events) == null ? void 0 : i.contextMenu) == null || r.call(i, o);
  }), n.updateStart.on((o) => {
    var i, r;
    t.edgeUpdateStart(o), (r = (i = e.events) == null ? void 0 : i.updateStart) == null || r.call(i, o);
  }), n.update.on((o) => {
    var i, r;
    t.edgeUpdate(o), (r = (i = e.events) == null ? void 0 : i.update) == null || r.call(i, o);
  }), n.updateEnd.on((o) => {
    var i, r;
    t.edgeUpdateEnd(o), (r = (i = e.events) == null ? void 0 : i.updateEnd) == null || r.call(i, o);
  }), Object.entries(n).reduce(
    (o, [i, r]) => (o.emit[i] = r.trigger, o.on[i] = r.on, o),
    { emit: {}, on: {} }
  );
}
function kE() {
  const { viewport: e, snapGrid: t, snapToGrid: n } = Be();
  return (o) => {
    const i = $d(o) ? o.sourceEvent : o, { x: r, y: s } = Wt(i), l = Ro({ x: r, y: s }, e.value), { x: a, y: u } = n.value ? nr(l, t.value) : l;
    return {
      xSnapped: a,
      ySnapped: u,
      ...l
    };
  };
}
function oi() {
  return !0;
}
function Dd({
  handleId: e,
  nodeId: t,
  type: n,
  isValidConnection: o,
  edgeUpdaterType: i,
  onEdgeUpdate: r,
  onEdgeUpdateEnd: s
}) {
  const {
    vueFlowRef: l,
    connectionMode: a,
    connectionRadius: u,
    connectOnClick: c,
    connectionClickStartHandle: f,
    nodesConnectable: p,
    autoPanOnConnect: g,
    autoPanSpeed: _,
    findNode: C,
    panBy: $,
    startConnection: M,
    updateConnection: D,
    endConnection: x,
    emits: w,
    viewport: H,
    edges: L,
    nodes: z,
    isValidConnection: T
  } = Be();
  let N = null, V = !1, Z = null, O = null;
  function R(A) {
    var P;
    const j = Ce(n) === "target", q = Xs(A), ee = Sa(A.target);
    if (q && A.button === 0 || !q) {
      let oe = function(y) {
        d = Wt(y, ge);
        const { handle: b, validHandleResult: I } = pE(
          y,
          ee,
          Ro(d, H.value, !1, [1, 1]),
          u.value,
          v,
          (B) => Ra(
            y,
            B,
            a.value,
            Ce(t),
            Ce(e),
            j ? "target" : "source",
            ae,
            ee,
            L.value,
            z.value,
            C
          )
        );
        if (se = b, k || (m(), k = !0), N = I.connection, V = I.isValid, Z = I.handleDomNode, !(V && se && (O != null && O.endHandle) && I.endHandle && O.endHandle.type === I.endHandle.type && O.endHandle.nodeId === I.endHandle.nodeId && O.endHandle.handleId === I.endHandle.handleId)) {
          if (D(
            se && V ? _d(
              {
                x: se.x,
                y: se.y
              },
              H.value
            ) : d,
            I.endHandle,
            gE(!!se, V)
          ), O = I, !se && !V && !Z)
            return Tr(Y);
          N && N.source !== N.target && Z && (Tr(Y), Y = Z, Z.classList.add("connecting", "vue-flow__handle-connecting"), Z.classList.toggle("valid", V), Z.classList.toggle("vue-flow__handle-valid", V));
        }
      }, ce = function(y) {
        (se || Z) && N && V && (r ? r(y, N) : w.connect(N)), w.connectEnd(y), i && (s == null || s(y)), Tr(Y), cancelAnimationFrame(_e), x(y), k = !1, V = !1, N = null, Z = null, ee.removeEventListener("mousemove", oe), ee.removeEventListener("mouseup", ce), ee.removeEventListener("touchmove", oe), ee.removeEventListener("touchend", ce);
      };
      const te = C(Ce(t));
      let ae = Ce(o) || T.value || oi;
      !ae && te && (ae = (j ? te.isValidSourcePos : te.isValidTargetPos) || oi);
      let se, _e = 0;
      const { x: W, y: he } = Wt(A), we = ee == null ? void 0 : ee.elementFromPoint(W, he), pe = qs(Ce(i), we), ge = (P = l.value) == null ? void 0 : P.getBoundingClientRect();
      if (!ge || !pe)
        return;
      let Y, d = Wt(A, ge), k = !1;
      const v = vE({
        nodes: z.value,
        nodeId: Ce(t),
        handleId: Ce(e),
        handleType: pe
      }), m = () => {
        if (!g.value)
          return;
        const [y, b] = Cd(d, ge, _.value);
        $({ x: y, y: b }), _e = requestAnimationFrame(m);
      };
      M(
        {
          nodeId: Ce(t),
          handleId: Ce(e),
          type: pe,
          position: (we == null ? void 0 : we.getAttribute("data-handlepos")) || fe.Top
        },
        {
          x: W - ge.left,
          y: he - ge.top
        }
      ), w.connectStart({ event: A, nodeId: Ce(t), handleId: Ce(e), handleType: pe }), ee.addEventListener("mousemove", oe), ee.addEventListener("mouseup", ce), ee.addEventListener("touchmove", oe), ee.addEventListener("touchend", ce);
    }
  }
  function E(A) {
    if (!c.value)
      return;
    const P = Ce(n) === "target";
    if (!f.value)
      w.clickConnectStart({ event: A, nodeId: Ce(t), handleId: Ce(e) }), M({ nodeId: Ce(t), type: Ce(n), handleId: Ce(e) }, void 0, !0);
    else {
      let j = Ce(o) || T.value || oi;
      const q = C(Ce(t));
      if (!j && q && (j = (P ? q.isValidSourcePos : q.isValidTargetPos) || oi), q && (typeof q.connectable > "u" ? p.value : q.connectable) === !1)
        return;
      const ee = Sa(A.target), { connection: oe, isValid: ce } = Ra(
        A,
        {
          nodeId: Ce(t),
          id: Ce(e),
          type: Ce(n)
        },
        a.value,
        f.value.nodeId,
        f.value.handleId || null,
        f.value.type,
        j,
        ee,
        L.value,
        z.value,
        C
      ), te = oe.source === oe.target;
      ce && !te && w.connect(oe), w.clickConnectEnd(A), x(A, !0);
    }
  }
  return {
    handlePointerDown: R,
    handleClick: E
  };
}
function SE() {
  return At(Od, "");
}
function Ad(e) {
  const t = e ?? SE() ?? "", n = At(Td, ie(null)), { findNode: o, edges: i, emits: r } = Be(), s = o(t);
  return s || r.error(new We(Ye.NODE_NOT_FOUND, t)), {
    id: t,
    nodeEl: n,
    node: s,
    parentNode: de(() => o(s.parentNode)),
    connectedEdges: de(() => kd([s], i.value))
  };
}
function CE() {
  return {
    doubleClick: ue(),
    click: ue(),
    mouseEnter: ue(),
    mouseMove: ue(),
    mouseLeave: ue(),
    contextMenu: ue(),
    dragStart: ue(),
    drag: ue(),
    dragStop: ue()
  };
}
function NE(e, t) {
  const n = CE();
  return n.doubleClick.on((o) => {
    var i, r;
    t.nodeDoubleClick(o), (r = (i = e.events) == null ? void 0 : i.doubleClick) == null || r.call(i, o);
  }), n.click.on((o) => {
    var i, r;
    t.nodeClick(o), (r = (i = e.events) == null ? void 0 : i.click) == null || r.call(i, o);
  }), n.mouseEnter.on((o) => {
    var i, r;
    t.nodeMouseEnter(o), (r = (i = e.events) == null ? void 0 : i.mouseEnter) == null || r.call(i, o);
  }), n.mouseMove.on((o) => {
    var i, r;
    t.nodeMouseMove(o), (r = (i = e.events) == null ? void 0 : i.mouseMove) == null || r.call(i, o);
  }), n.mouseLeave.on((o) => {
    var i, r;
    t.nodeMouseLeave(o), (r = (i = e.events) == null ? void 0 : i.mouseLeave) == null || r.call(i, o);
  }), n.contextMenu.on((o) => {
    var i, r;
    t.nodeContextMenu(o), (r = (i = e.events) == null ? void 0 : i.contextMenu) == null || r.call(i, o);
  }), n.dragStart.on((o) => {
    var i, r;
    t.nodeDragStart(o), (r = (i = e.events) == null ? void 0 : i.dragStart) == null || r.call(i, o);
  }), n.drag.on((o) => {
    var i, r;
    t.nodeDrag(o), (r = (i = e.events) == null ? void 0 : i.drag) == null || r.call(i, o);
  }), n.dragStop.on((o) => {
    var i, r;
    t.nodeDragStop(o), (r = (i = e.events) == null ? void 0 : i.dragStop) == null || r.call(i, o);
  }), Object.entries(n).reduce(
    (o, [i, r]) => (o.emit[i] = r.trigger, o.on[i] = r.on, o),
    { emit: {}, on: {} }
  );
}
function Rd() {
  const { getSelectedNodes: e, nodeExtent: t, updateNodePositions: n, findNode: o, snapGrid: i, snapToGrid: r, nodesDraggable: s, emits: l } = Be();
  return (a, u = !1) => {
    const c = r.value ? i.value[0] : 5, f = r.value ? i.value[1] : 5, p = u ? 4 : 1, g = a.x * c * p, _ = a.y * f * p, C = [];
    for (const $ of e.value)
      if ($.draggable || s && typeof $.draggable > "u") {
        const M = { x: $.computedPosition.x + g, y: $.computedPosition.y + _ }, { computedPosition: D } = Ys(
          $,
          M,
          l.error,
          t.value,
          $.parentNode ? o($.parentNode) : void 0
        );
        C.push({
          id: $.id,
          position: D,
          from: $.position,
          distance: { x: a.x, y: a.y },
          dimensions: $.dimensions
        });
      }
    n(C, !0, !1);
  };
}
const Ar = 0.1;
function Jt() {
  return or("Viewport not initialized yet."), Promise.resolve(!1);
}
const $E = {
  zoomIn: Jt,
  zoomOut: Jt,
  zoomTo: Jt,
  fitView: Jt,
  setCenter: Jt,
  fitBounds: Jt,
  project: (e) => e,
  screenToFlowCoordinate: (e) => e,
  flowToScreenCoordinate: (e) => e,
  setViewport: Jt,
  setTransform: Jt,
  getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
  getTransform: () => ({ x: 0, y: 0, zoom: 1 }),
  viewportInitialized: !1
};
function ME(e) {
  function t(o, i) {
    return new Promise((r) => {
      e.d3Selection && e.d3Zoom ? e.d3Zoom.scaleBy(
        Rr(e.d3Selection, i, () => {
          r(!0);
        }),
        o
      ) : r(!1);
    });
  }
  function n(o, i, r, s) {
    return new Promise((l) => {
      const { x: a, y: u } = gd({ x: -o, y: -i }, e.translateExtent), c = eo.translate(-a, -u).scale(r);
      e.d3Selection && e.d3Zoom ? e.d3Zoom.transform(
        Rr(e.d3Selection, s, () => {
          l(!0);
        }),
        c
      ) : l(!1);
    });
  }
  return de(() => e.d3Zoom && e.d3Selection && e.dimensions.width && e.dimensions.height ? {
    viewportInitialized: !0,
    // todo: allow passing scale as option
    zoomIn: (i) => t(1.2, i == null ? void 0 : i.duration),
    zoomOut: (i) => t(1 / 1.2, i == null ? void 0 : i.duration),
    zoomTo: (i, r) => new Promise((s) => {
      e.d3Selection && e.d3Zoom ? e.d3Zoom.scaleTo(
        Rr(e.d3Selection, r == null ? void 0 : r.duration, () => {
          s(!0);
        }),
        i
      ) : s(!1);
    }),
    setViewport: (i, r) => n(i.x, i.y, i.zoom, r == null ? void 0 : r.duration),
    setTransform: (i, r) => n(i.x, i.y, i.zoom, r == null ? void 0 : r.duration),
    getViewport: () => ({
      x: e.viewport.x,
      y: e.viewport.y,
      zoom: e.viewport.zoom
    }),
    getTransform: () => ({
      x: e.viewport.x,
      y: e.viewport.y,
      zoom: e.viewport.zoom
    }),
    fitView: (i = {
      padding: Ar,
      includeHiddenNodes: !1,
      duration: 0
    }) => {
      var r, s;
      const l = [];
      for (const p of e.nodes)
        p.dimensions.width && p.dimensions.height && ((i == null ? void 0 : i.includeHiddenNodes) || !p.hidden) && (!((r = i.nodes) != null && r.length) || (s = i.nodes) != null && s.length && i.nodes.includes(p.id)) && l.push(p);
      if (!l.length)
        return Promise.resolve(!1);
      const a = Ed(l), { x: u, y: c, zoom: f } = Ca(
        a,
        e.dimensions.width,
        e.dimensions.height,
        i.minZoom ?? e.minZoom,
        i.maxZoom ?? e.maxZoom,
        i.padding ?? Ar,
        i.offset
      );
      return n(u, c, f, i == null ? void 0 : i.duration);
    },
    setCenter: (i, r, s) => {
      const l = typeof (s == null ? void 0 : s.zoom) < "u" ? s.zoom : e.maxZoom, a = e.dimensions.width / 2 - i * l, u = e.dimensions.height / 2 - r * l;
      return n(a, u, l, s == null ? void 0 : s.duration);
    },
    fitBounds: (i, r = { padding: Ar }) => {
      const { x: s, y: l, zoom: a } = Ca(
        i,
        e.dimensions.width,
        e.dimensions.height,
        e.minZoom,
        e.maxZoom,
        r.padding
      );
      return n(s, l, a, r == null ? void 0 : r.duration);
    },
    project: (i) => Ro(i, e.viewport, e.snapToGrid, e.snapGrid),
    screenToFlowCoordinate: (i) => {
      if (e.vueFlowRef) {
        const { x: r, y: s } = e.vueFlowRef.getBoundingClientRect(), l = {
          x: i.x - r,
          y: i.y - s
        };
        return Ro(l, e.viewport, e.snapToGrid, e.snapGrid);
      }
      return { x: 0, y: 0 };
    },
    flowToScreenCoordinate: (i) => {
      if (e.vueFlowRef) {
        const { x: r, y: s } = e.vueFlowRef.getBoundingClientRect(), l = {
          x: i.x + r,
          y: i.y + s
        };
        return _d(l, e.viewport);
      }
      return { x: 0, y: 0 };
    }
  } : $E);
}
function Rr(e, t = 0, n) {
  return e.transition().duration(t).on("end", n);
}
function IE(e, t, n) {
  const o = eu(!0);
  return o.run(() => {
    const i = () => {
      o.run(() => {
        let C, $, M = !!(n.nodes.value.length || n.edges.value.length);
        C = Vn([e.modelValue, () => {
          var D, x;
          return (x = (D = e.modelValue) == null ? void 0 : D.value) == null ? void 0 : x.length;
        }], ([D]) => {
          D && Array.isArray(D) && ($ == null || $.pause(), n.setElements(D), !$ && !M && D.length ? M = !0 : $ == null || $.resume());
        }), $ = Vn(
          [n.nodes, n.edges, () => n.edges.value.length, () => n.nodes.value.length],
          ([D, x]) => {
            var w;
            (w = e.modelValue) != null && w.value && Array.isArray(e.modelValue.value) && (C == null || C.pause(), e.modelValue.value = [...D, ...x], Ze(() => {
              C == null || C.resume();
            }));
          },
          { immediate: M }
        ), li(() => {
          C == null || C.stop(), $ == null || $.stop();
        });
      });
    }, r = () => {
      o.run(() => {
        let C, $, M = !!n.nodes.value.length;
        C = Vn([e.nodes, () => {
          var D, x;
          return (x = (D = e.nodes) == null ? void 0 : D.value) == null ? void 0 : x.length;
        }], ([D]) => {
          D && Array.isArray(D) && ($ == null || $.pause(), n.setNodes(D), !$ && !M && D.length ? M = !0 : $ == null || $.resume());
        }), $ = Vn(
          [n.nodes, () => n.nodes.value.length],
          ([D]) => {
            var x;
            (x = e.nodes) != null && x.value && Array.isArray(e.nodes.value) && (C == null || C.pause(), e.nodes.value = [...D], Ze(() => {
              C == null || C.resume();
            }));
          },
          { immediate: M }
        ), li(() => {
          C == null || C.stop(), $ == null || $.stop();
        });
      });
    }, s = () => {
      o.run(() => {
        let C, $, M = !!n.edges.value.length;
        C = Vn([e.edges, () => {
          var D, x;
          return (x = (D = e.edges) == null ? void 0 : D.value) == null ? void 0 : x.length;
        }], ([D]) => {
          D && Array.isArray(D) && ($ == null || $.pause(), n.setEdges(D), !$ && !M && D.length ? M = !0 : $ == null || $.resume());
        }), $ = Vn(
          [n.edges, () => n.edges.value.length],
          ([D]) => {
            var x;
            (x = e.edges) != null && x.value && Array.isArray(e.edges.value) && (C == null || C.pause(), e.edges.value = [...D], Ze(() => {
              C == null || C.resume();
            }));
          },
          { immediate: M }
        ), li(() => {
          C == null || C.stop(), $ == null || $.stop();
        });
      });
    }, l = () => {
      o.run(() => {
        Se(
          () => t.maxZoom,
          () => {
            t.maxZoom && Ge(t.maxZoom) && n.setMaxZoom(t.maxZoom);
          },
          {
            immediate: !0
          }
        );
      });
    }, a = () => {
      o.run(() => {
        Se(
          () => t.minZoom,
          () => {
            t.minZoom && Ge(t.minZoom) && n.setMinZoom(t.minZoom);
          },
          { immediate: !0 }
        );
      });
    }, u = () => {
      o.run(() => {
        Se(
          () => t.translateExtent,
          () => {
            t.translateExtent && Ge(t.translateExtent) && n.setTranslateExtent(t.translateExtent);
          },
          {
            immediate: !0
          }
        );
      });
    }, c = () => {
      o.run(() => {
        Se(
          () => t.nodeExtent,
          () => {
            t.nodeExtent && Ge(t.nodeExtent) && n.setNodeExtent(t.nodeExtent);
          },
          {
            immediate: !0
          }
        );
      });
    }, f = () => {
      o.run(() => {
        Se(
          () => t.applyDefault,
          () => {
            Ge(t.applyDefault) && (n.applyDefault.value = t.applyDefault);
          },
          {
            immediate: !0
          }
        );
      });
    }, p = () => {
      o.run(() => {
        const C = async ($) => {
          let M = $;
          typeof t.autoConnect == "function" && (M = await t.autoConnect($)), M !== !1 && n.addEdges([M]);
        };
        Se(
          () => t.autoConnect,
          () => {
            Ge(t.autoConnect) && (n.autoConnect.value = t.autoConnect);
          },
          { immediate: !0 }
        ), Se(
          n.autoConnect,
          ($, M, D) => {
            $ ? n.onConnect(C) : n.hooks.value.connect.off(C), D(() => {
              n.hooks.value.connect.off(C);
            });
          },
          { immediate: !0 }
        );
      });
    }, g = () => {
      const C = [
        "id",
        "modelValue",
        "translateExtent",
        "nodeExtent",
        "edges",
        "nodes",
        "maxZoom",
        "minZoom",
        "applyDefault",
        "autoConnect"
      ];
      for (const $ of Object.keys(t)) {
        const M = $;
        if (!C.includes(M)) {
          const D = ze(() => t[M]), x = n[M];
          He(x) && o.run(() => {
            Se(
              D,
              (w) => {
                Ge(w) && (x.value = w);
              },
              { immediate: !0 }
            );
          });
        }
      }
    };
    (() => {
      i(), r(), s(), a(), l(), u(), c(), f(), p(), g();
    })();
  }), () => o.stop();
}
function OE() {
  return {
    edgesChange: ue(),
    nodesChange: ue(),
    nodeDoubleClick: ue(),
    nodeClick: ue(),
    nodeMouseEnter: ue(),
    nodeMouseMove: ue(),
    nodeMouseLeave: ue(),
    nodeContextMenu: ue(),
    nodeDragStart: ue(),
    nodeDrag: ue(),
    nodeDragStop: ue(),
    nodesInitialized: ue(),
    miniMapNodeClick: ue(),
    miniMapNodeDoubleClick: ue(),
    miniMapNodeMouseEnter: ue(),
    miniMapNodeMouseMove: ue(),
    miniMapNodeMouseLeave: ue(),
    connect: ue(),
    connectStart: ue(),
    connectEnd: ue(),
    clickConnectStart: ue(),
    clickConnectEnd: ue(),
    paneReady: ue(),
    init: ue(),
    move: ue(),
    moveStart: ue(),
    moveEnd: ue(),
    selectionDragStart: ue(),
    selectionDrag: ue(),
    selectionDragStop: ue(),
    selectionContextMenu: ue(),
    selectionStart: ue(),
    selectionEnd: ue(),
    viewportChangeStart: ue(),
    viewportChange: ue(),
    viewportChangeEnd: ue(),
    paneScroll: ue(),
    paneClick: ue(),
    paneContextMenu: ue(),
    paneMouseEnter: ue(),
    paneMouseMove: ue(),
    paneMouseLeave: ue(),
    edgeContextMenu: ue(),
    edgeMouseEnter: ue(),
    edgeMouseMove: ue(),
    edgeMouseLeave: ue(),
    edgeDoubleClick: ue(),
    edgeClick: ue(),
    edgeUpdateStart: ue(),
    edgeUpdate: ue(),
    edgeUpdateEnd: ue(),
    updateNodeInternals: ue(),
    error: ue((e) => or(e.message))
  };
}
function TE(e, t) {
  Su(() => {
    for (const [n, o] of Object.entries(t.value)) {
      const i = (r) => {
        e(n, r);
      };
      o.fns.add(i), Ki(() => {
        o.off(i);
      });
    }
  });
}
function Ld() {
  return {
    vueFlowRef: null,
    viewportRef: null,
    nodes: [],
    edges: [],
    connectionLookup: /* @__PURE__ */ new Map(),
    nodeTypes: {},
    edgeTypes: {},
    initialized: !1,
    dimensions: {
      width: 0,
      height: 0
    },
    viewport: { x: 0, y: 0, zoom: 1 },
    d3Zoom: null,
    d3Selection: null,
    d3ZoomHandler: null,
    minZoom: 0.5,
    maxZoom: 2,
    translateExtent: [
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
    ],
    nodeExtent: [
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
    ],
    selectionMode: Gs.Full,
    paneDragging: !1,
    preventScrolling: !0,
    zoomOnScroll: !0,
    zoomOnPinch: !0,
    zoomOnDoubleClick: !0,
    panOnScroll: !1,
    panOnScrollSpeed: 0.5,
    panOnScrollMode: Eo.Free,
    paneClickDistance: 0,
    panOnDrag: !0,
    edgeUpdaterRadius: 10,
    onlyRenderVisibleElements: !1,
    defaultViewport: { x: 0, y: 0, zoom: 1 },
    nodesSelectionActive: !1,
    userSelectionActive: !1,
    userSelectionRect: null,
    defaultMarkerColor: "#b1b1b7",
    connectionLineStyle: {},
    connectionLineType: null,
    connectionLineOptions: {
      type: wn.Bezier,
      style: {}
    },
    connectionMode: Pn.Loose,
    connectionStartHandle: null,
    connectionEndHandle: null,
    connectionClickStartHandle: null,
    connectionPosition: { x: Number.NaN, y: Number.NaN },
    connectionRadius: 20,
    connectOnClick: !0,
    connectionStatus: null,
    isValidConnection: null,
    snapGrid: [15, 15],
    snapToGrid: !1,
    edgesUpdatable: !1,
    edgesFocusable: !0,
    nodesFocusable: !0,
    nodesConnectable: !0,
    nodesDraggable: !0,
    nodeDragThreshold: 1,
    elementsSelectable: !0,
    selectNodesOnDrag: !0,
    multiSelectionActive: !1,
    selectionKeyCode: "Shift",
    multiSelectionKeyCode: Di() ? "Meta" : "Control",
    zoomActivationKeyCode: Di() ? "Meta" : "Control",
    deleteKeyCode: "Backspace",
    panActivationKeyCode: "Space",
    hooks: OE(),
    applyDefault: !0,
    autoConnect: !1,
    fitViewOnInit: !1,
    fitViewOnInitDone: !1,
    noDragClassName: "nodrag",
    noWheelClassName: "nowheel",
    noPanClassName: "nopan",
    defaultEdgeOptions: void 0,
    elevateEdgesOnSelect: !1,
    elevateNodesOnSelect: !0,
    autoPanOnNodeDrag: !0,
    autoPanOnConnect: !0,
    autoPanSpeed: 15,
    disableKeyboardA11y: !1,
    ariaLiveMessage: ""
  };
}
const PE = [
  "id",
  "vueFlowRef",
  "viewportRef",
  "initialized",
  "modelValue",
  "nodes",
  "edges",
  "maxZoom",
  "minZoom",
  "translateExtent",
  "hooks",
  "defaultEdgeOptions"
];
function DE(e, t, n) {
  const o = ME(e), i = (v) => {
    const m = v ?? [];
    e.hooks.updateNodeInternals.trigger(m);
  }, r = (v) => nE(v, e.nodes, e.edges), s = (v) => tE(v, e.nodes, e.edges), l = (v) => kd(v, e.edges), a = ({ id: v, type: m, nodeId: y }) => {
    var b;
    return Array.from(((b = e.connectionLookup.get(`${y}-${m}-${v ?? null}`)) == null ? void 0 : b.values()) ?? []);
  }, u = (v) => {
    if (v)
      return t.value.get(v);
  }, c = (v) => {
    if (v)
      return n.value.get(v);
  }, f = (v, m, y) => {
    var b, I;
    const B = [];
    for (const U of v) {
      const S = {
        id: U.id,
        type: "position",
        dragging: y,
        from: U.from
      };
      if (m && (S.position = U.position, U.parentNode)) {
        const J = u(U.parentNode);
        S.position = {
          x: S.position.x - (((b = J == null ? void 0 : J.computedPosition) == null ? void 0 : b.x) ?? 0),
          y: S.position.y - (((I = J == null ? void 0 : J.computedPosition) == null ? void 0 : I.y) ?? 0)
        };
      }
      B.push(S);
    }
    B != null && B.length && e.hooks.nodesChange.trigger(B);
  }, p = (v) => {
    if (!e.vueFlowRef)
      return;
    const m = e.vueFlowRef.querySelector(".vue-flow__transformationpane");
    if (!m)
      return;
    const y = window.getComputedStyle(m), { m22: b } = new window.DOMMatrixReadOnly(y.transform), I = [];
    for (let B = 0; B < v.length; ++B) {
      const U = v[B], S = u(U.id);
      if (S) {
        const J = tr(U.nodeElement);
        if (!!(J.width && J.height && (S.dimensions.width !== J.width || S.dimensions.height !== J.height || U.forceUpdate))) {
          const ne = U.nodeElement.getBoundingClientRect();
          S.dimensions = J, S.handleBounds.source = La(".source", U.nodeElement, ne, b), S.handleBounds.target = La(".target", U.nodeElement, ne, b), I.push({
            id: S.id,
            type: "dimensions",
            dimensions: J
          });
        }
      }
    }
    !e.fitViewOnInitDone && e.fitViewOnInit && o.value.fitView().then(() => {
      e.fitViewOnInitDone = !0;
    }), I.length && e.hooks.nodesChange.trigger(I);
  }, g = (v, m) => {
    const y = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Set();
    for (const U of v)
      $n(U) ? y.add(U.id) : hn(U) && b.add(U.id);
    const I = on(t.value, y, !0), B = on(n.value, b);
    if (e.multiSelectionActive) {
      for (const U of y)
        I.push(Qt(U, m));
      for (const U of b)
        B.push(Qt(U, m));
    }
    I.length && e.hooks.nodesChange.trigger(I), B.length && e.hooks.edgesChange.trigger(B);
  }, _ = (v) => {
    if (e.multiSelectionActive) {
      const m = v.map((y) => Qt(y.id, !0));
      e.hooks.nodesChange.trigger(m);
      return;
    }
    e.hooks.nodesChange.trigger(on(t.value, new Set(v.map((m) => m.id)), !0)), e.hooks.edgesChange.trigger(on(n.value));
  }, C = (v) => {
    if (e.multiSelectionActive) {
      const m = v.map((y) => Qt(y.id, !0));
      e.hooks.edgesChange.trigger(m);
      return;
    }
    e.hooks.edgesChange.trigger(on(n.value, new Set(v.map((m) => m.id)))), e.hooks.nodesChange.trigger(on(t.value, /* @__PURE__ */ new Set(), !0));
  }, $ = (v) => {
    g(v, !0);
  }, M = (v) => {
    const y = (v || e.nodes).map((b) => (b.selected = !1, Qt(b.id, !1)));
    e.hooks.nodesChange.trigger(y);
  }, D = (v) => {
    const y = (v || e.edges).map((b) => (b.selected = !1, Qt(b.id, !1)));
    e.hooks.edgesChange.trigger(y);
  }, x = (v) => {
    if (!v || !v.length)
      return g([], !1);
    const m = v.reduce(
      (y, b) => {
        const I = Qt(b.id, !1);
        return $n(b) ? y.nodes.push(I) : y.edges.push(I), y;
      },
      { nodes: [], edges: [] }
    );
    m.nodes.length && e.hooks.nodesChange.trigger(m.nodes), m.edges.length && e.hooks.edgesChange.trigger(m.edges);
  }, w = (v) => {
    var m;
    (m = e.d3Zoom) == null || m.scaleExtent([v, e.maxZoom]), e.minZoom = v;
  }, H = (v) => {
    var m;
    (m = e.d3Zoom) == null || m.scaleExtent([e.minZoom, v]), e.maxZoom = v;
  }, L = (v) => {
    var m;
    (m = e.d3Zoom) == null || m.translateExtent(v), e.translateExtent = v;
  }, z = (v) => {
    e.nodeExtent = v, i();
  }, T = (v) => {
    var m;
    (m = e.d3Zoom) == null || m.clickDistance(v);
  }, N = (v) => {
    e.nodesDraggable = v, e.nodesConnectable = v, e.elementsSelectable = v;
  }, V = (v) => {
    const m = v instanceof Function ? v(e.nodes) : v;
    !e.initialized && !m.length || (e.nodes = Va(m, u, e.hooks.error.trigger));
  }, Z = (v) => {
    const m = v instanceof Function ? v(e.edges) : v;
    if (!e.initialized && !m.length)
      return;
    const y = Dr(
      m,
      e.isValidConnection,
      u,
      c,
      e.hooks.error.trigger,
      e.defaultEdgeOptions,
      e.nodes,
      e.edges
    );
    Pr(e.connectionLookup, y), e.edges = y;
  }, O = (v) => {
    const m = v instanceof Function ? v([...e.nodes, ...e.edges]) : v;
    !e.initialized && !m.length || (V(m.filter($n)), Z(m.filter(hn)));
  }, R = (v) => {
    let m = v instanceof Function ? v(e.nodes) : v;
    m = Array.isArray(m) ? m : [m];
    const y = Va(m, u, e.hooks.error.trigger), b = [];
    for (const I of y)
      b.push(Ma(I));
    b.length && e.hooks.nodesChange.trigger(b);
  }, E = (v) => {
    let m = v instanceof Function ? v(e.edges) : v;
    m = Array.isArray(m) ? m : [m];
    const y = Dr(
      m,
      e.isValidConnection,
      u,
      c,
      e.hooks.error.trigger,
      e.defaultEdgeOptions,
      e.nodes,
      e.edges
    ), b = [];
    for (const I of y)
      b.push(Ma(I));
    b.length && e.hooks.edgesChange.trigger(b);
  }, A = (v, m = !0, y = !1) => {
    const b = v instanceof Function ? v(e.nodes) : v, I = Array.isArray(b) ? b : [b], B = [], U = [];
    function S(K) {
      const ne = l(K);
      for (const le of ne)
        (!Ge(le.deletable) || le.deletable) && U.push(Oa(le.id, le.source, le.target, le.sourceHandle, le.targetHandle));
    }
    function J(K) {
      const ne = [];
      for (const le of e.nodes)
        le.parentNode === K && ne.push(le);
      if (ne.length) {
        for (const le of ne)
          B.push(Ia(le.id));
        m && S(ne);
        for (const le of ne)
          J(le.id);
      }
    }
    for (const K of I) {
      const ne = typeof K == "string" ? u(K) : K;
      ne && (Ge(ne.deletable) && !ne.deletable || (B.push(Ia(ne.id)), m && S([ne]), y && J(ne.id)));
    }
    U.length && e.hooks.edgesChange.trigger(U), B.length && e.hooks.nodesChange.trigger(B);
  }, P = (v) => {
    const m = v instanceof Function ? v(e.edges) : v, y = Array.isArray(m) ? m : [m], b = [];
    for (const I of y) {
      const B = typeof I == "string" ? c(I) : I;
      B && (Ge(B.deletable) && !B.deletable || b.push(
        Oa(
          typeof I == "string" ? I : I.id,
          B.source,
          B.target,
          B.sourceHandle,
          B.targetHandle
        )
      ));
    }
    e.hooks.edgesChange.trigger(b);
  }, j = (v, m, y = !0) => {
    const b = c(v.id), I = bE(v, m, b, y, e.hooks.error.trigger);
    if (I) {
      const [B] = Dr(
        [I],
        e.isValidConnection,
        u,
        c,
        e.hooks.error.trigger,
        e.defaultEdgeOptions,
        e.nodes,
        e.edges
      );
      return e.edges.splice(e.edges.indexOf(b), 1, B), Pr(e.connectionLookup, [B]), B;
    }
    return !1;
  }, q = (v, m, y = { replace: !1 }) => {
    const b = c(v);
    if (!b)
      return;
    const I = typeof m == "function" ? m(b) : m;
    b.data = y.replace ? I : { ...b.data, ...I };
  }, ee = (v) => $a(v, e.nodes), oe = (v) => {
    const m = $a(v, e.edges);
    return Pr(e.connectionLookup, m), m;
  }, ce = (v, m, y = { replace: !1 }) => {
    const b = u(v);
    if (!b)
      return;
    const I = typeof m == "function" ? m(b) : m;
    y.replace ? e.nodes.splice(e.nodes.indexOf(b), 1, I) : Object.assign(b, I);
  }, te = (v, m, y = { replace: !1 }) => {
    const b = u(v);
    if (!b)
      return;
    const I = typeof m == "function" ? m(b) : m;
    b.data = y.replace ? I : { ...b.data, ...I };
  }, ae = (v, m, y = !1) => {
    y ? e.connectionClickStartHandle = v : e.connectionStartHandle = v, e.connectionEndHandle = null, e.connectionStatus = null, m && (e.connectionPosition = m);
  }, se = (v, m = null, y = null) => {
    e.connectionStartHandle && (e.connectionPosition = v, e.connectionEndHandle = m, e.connectionStatus = y);
  }, _e = (v, m) => {
    e.connectionPosition = { x: Number.NaN, y: Number.NaN }, e.connectionEndHandle = null, e.connectionStatus = null, m ? e.connectionClickStartHandle = null : e.connectionStartHandle = null;
  }, W = (v) => {
    const m = Qw(v), y = m ? null : vo(v) ? v : u(v.id);
    return !m && !y ? [null, null, m] : [m ? v : hs(y), y, m];
  }, he = (v, m = !0, y = e.nodes) => {
    const [b, I, B] = W(v);
    if (!b)
      return [];
    const U = [];
    for (const S of y || e.nodes) {
      if (!B && (S.id === I.id || !S.computedPosition))
        continue;
      const J = hs(S), K = ps(J, b);
      (m && K > 0 || K >= Number(b.width) * Number(b.height)) && U.push(S);
    }
    return U;
  }, we = (v, m, y = !0) => {
    const [b] = W(v);
    if (!b)
      return !1;
    const I = ps(b, m);
    return y && I > 0 || I >= Number(b.width) * Number(b.height);
  }, pe = (v) => {
    const { viewport: m, dimensions: y, d3Zoom: b, d3Selection: I, translateExtent: B } = e;
    if (!b || !I || !v.x && !v.y)
      return !1;
    const U = eo.translate(m.x + v.x, m.y + v.y).scale(m.zoom), S = [
      [0, 0],
      [y.width, y.height]
    ], J = b.constrain()(U, S, B), K = e.viewport.x !== J.x || e.viewport.y !== J.y || e.viewport.zoom !== J.k;
    return b.transform(I, J), K;
  }, ge = (v) => {
    const m = v instanceof Function ? v(e) : v, y = [
      "d3Zoom",
      "d3Selection",
      "d3ZoomHandler",
      "viewportRef",
      "vueFlowRef",
      "dimensions",
      "hooks"
    ];
    Ge(m.defaultEdgeOptions) && (e.defaultEdgeOptions = m.defaultEdgeOptions);
    const b = m.modelValue || m.nodes || m.edges ? [] : void 0;
    b && (m.modelValue && b.push(...m.modelValue), m.nodes && b.push(...m.nodes), m.edges && b.push(...m.edges), O(b));
    const I = () => {
      Ge(m.maxZoom) && H(m.maxZoom), Ge(m.minZoom) && w(m.minZoom), Ge(m.translateExtent) && L(m.translateExtent);
    };
    for (const B of Object.keys(m)) {
      const U = B, S = m[U];
      ![...PE, ...y].includes(U) && Ge(S) && (e[U] = S);
    }
    ns(() => e.d3Zoom).not.toBeNull().then(I), e.initialized || (e.initialized = !0);
  };
  return {
    updateNodePositions: f,
    updateNodeDimensions: p,
    setElements: O,
    setNodes: V,
    setEdges: Z,
    addNodes: R,
    addEdges: E,
    removeNodes: A,
    removeEdges: P,
    findNode: u,
    findEdge: c,
    updateEdge: j,
    updateEdgeData: q,
    updateNode: ce,
    updateNodeData: te,
    applyEdgeChanges: oe,
    applyNodeChanges: ee,
    addSelectedElements: $,
    addSelectedNodes: _,
    addSelectedEdges: C,
    setMinZoom: w,
    setMaxZoom: H,
    setTranslateExtent: L,
    setNodeExtent: z,
    setPaneClickDistance: T,
    removeSelectedElements: x,
    removeSelectedNodes: M,
    removeSelectedEdges: D,
    startConnection: ae,
    updateConnection: se,
    endConnection: _e,
    setInteractive: N,
    setState: ge,
    getIntersectingNodes: he,
    getIncomers: r,
    getOutgoers: s,
    getConnectedEdges: l,
    getHandleConnections: a,
    isNodeIntersecting: we,
    panBy: pe,
    fitView: (v) => o.value.fitView(v),
    zoomIn: (v) => o.value.zoomIn(v),
    zoomOut: (v) => o.value.zoomOut(v),
    zoomTo: (v, m) => o.value.zoomTo(v, m),
    setViewport: (v, m) => o.value.setViewport(v, m),
    setTransform: (v, m) => o.value.setTransform(v, m),
    getViewport: () => o.value.getViewport(),
    getTransform: () => o.value.getTransform(),
    setCenter: (v, m, y) => o.value.setCenter(v, m, y),
    fitBounds: (v, m) => o.value.fitBounds(v, m),
    project: (v) => o.value.project(v),
    screenToFlowCoordinate: (v) => o.value.screenToFlowCoordinate(v),
    flowToScreenCoordinate: (v) => o.value.flowToScreenCoordinate(v),
    toObject: () => {
      const v = [], m = [];
      for (const y of e.nodes) {
        const {
          computedPosition: b,
          handleBounds: I,
          selected: B,
          dimensions: U,
          isParent: S,
          resizing: J,
          dragging: K,
          events: ne,
          ...le
        } = y;
        v.push(le);
      }
      for (const y of e.edges) {
        const { selected: b, sourceNode: I, targetNode: B, events: U, ...S } = y;
        m.push(S);
      }
      return JSON.parse(
        JSON.stringify({
          nodes: v,
          edges: m,
          position: [e.viewport.x, e.viewport.y],
          zoom: e.viewport.zoom,
          viewport: e.viewport
        })
      );
    },
    fromObject: (v) => new Promise((m) => {
      const { nodes: y, edges: b, position: I, zoom: B, viewport: U } = v;
      if (y && V(y), b && Z(b), U != null && U.x && (U != null && U.y) || I) {
        const S = (U == null ? void 0 : U.x) || I[0], J = (U == null ? void 0 : U.y) || I[1], K = (U == null ? void 0 : U.zoom) || B || e.viewport.zoom;
        return ns(() => o.value.viewportInitialized).toBe(!0).then(() => {
          o.value.setViewport({
            x: S,
            y: J,
            zoom: K
          }).then(() => {
            m(!0);
          });
        });
      } else
        m(!0);
    }),
    updateNodeInternals: i,
    viewportHelper: o,
    $reset: () => {
      const v = Ld();
      if (e.edges = [], e.nodes = [], e.d3Zoom && e.d3Selection) {
        const m = eo.translate(v.defaultViewport.x ?? 0, v.defaultViewport.y ?? 0).scale(Dn(v.defaultViewport.zoom ?? 1, v.minZoom, v.maxZoom)), y = e.viewportRef.getBoundingClientRect(), b = [
          [0, 0],
          [y.width, y.height]
        ], I = e.d3Zoom.constrain()(m, b, v.translateExtent);
        e.d3Zoom.transform(e.d3Selection, I);
      }
      ge(v);
    },
    $destroy: () => {
    }
  };
}
const AE = ["data-id", "data-handleid", "data-nodeid", "data-handlepos"], RE = {
  name: "Handle",
  compatConfig: { MODE: 3 }
}, dn = /* @__PURE__ */ Oe({
  ...RE,
  props: {
    id: { default: null },
    type: {},
    position: { default: () => fe.Top },
    isValidConnection: { type: Function },
    connectable: { type: [Boolean, Number, String, Function], default: void 0 },
    connectableStart: { type: Boolean, default: !0 },
    connectableEnd: { type: Boolean, default: !0 }
  },
  setup(e, { expose: t }) {
    const n = Pu(e, ["position", "connectable", "connectableStart", "connectableEnd", "id"]), o = ze(() => n.type ?? "source"), i = ze(() => n.isValidConnection ?? null), {
      connectionStartHandle: r,
      connectionClickStartHandle: s,
      connectionEndHandle: l,
      vueFlowRef: a,
      nodesConnectable: u,
      noDragClassName: c,
      noPanClassName: f
    } = Be(), { id: p, node: g, nodeEl: _, connectedEdges: C } = Ad(), $ = ie(), M = ze(() => typeof e.connectableStart < "u" ? e.connectableStart : !0), D = ze(() => typeof e.connectableEnd < "u" ? e.connectableEnd : !0), x = ze(
      () => {
        var V, Z, O, R, E, A;
        return ((V = r.value) == null ? void 0 : V.nodeId) === p && ((Z = r.value) == null ? void 0 : Z.handleId) === e.id && ((O = r.value) == null ? void 0 : O.type) === o.value || ((R = l.value) == null ? void 0 : R.nodeId) === p && ((E = l.value) == null ? void 0 : E.handleId) === e.id && ((A = l.value) == null ? void 0 : A.type) === o.value;
      }
    ), w = ze(
      () => {
        var V, Z, O;
        return ((V = s.value) == null ? void 0 : V.nodeId) === p && ((Z = s.value) == null ? void 0 : Z.handleId) === e.id && ((O = s.value) == null ? void 0 : O.type) === o.value;
      }
    ), { handlePointerDown: H, handleClick: L } = Dd({
      nodeId: p,
      handleId: e.id,
      isValidConnection: i,
      type: o
    }), z = de(() => typeof e.connectable == "string" && e.connectable === "single" ? !C.value.some((V) => {
      const Z = V[`${o.value}Handle`];
      return V[o.value] !== p ? !1 : Z ? Z === e.id : !0;
    }) : typeof e.connectable == "number" ? C.value.filter((V) => {
      const Z = V[`${o.value}Handle`];
      return V[o.value] !== p ? !1 : Z ? Z === e.id : !0;
    }).length < e.connectable : typeof e.connectable == "function" ? e.connectable(g, C.value) : Ge(e.connectable) ? e.connectable : u.value);
    ht(() => {
      var V;
      if (!g.dimensions.width || !g.dimensions.height)
        return;
      const Z = (V = g.handleBounds[o.value]) == null ? void 0 : V.find((q) => q.id === e.id);
      if (!a.value || Z)
        return;
      const O = a.value.querySelector(".vue-flow__transformationpane");
      if (!_.value || !$.value || !O || !e.id)
        return;
      const R = _.value.getBoundingClientRect(), E = $.value.getBoundingClientRect(), A = window.getComputedStyle(O), { m22: P } = new window.DOMMatrixReadOnly(A.transform), j = {
        id: e.id,
        position: e.position,
        x: (E.left - R.left) / P,
        y: (E.top - R.top) / P,
        ...tr($.value)
      };
      g.handleBounds[o.value] = [...g.handleBounds[o.value] ?? [], j];
    }), Ui(() => {
      const V = g.handleBounds[o.value];
      V && (g.handleBounds[o.value] = V.filter((Z) => Z.id !== e.id));
    });
    function T(V) {
      const Z = Xs(V);
      z.value && M.value && (Z && V.button === 0 || !Z) && H(V);
    }
    function N(V) {
      !p || !s.value && !M.value || z.value && L(V);
    }
    return t({
      handleClick: L,
      handlePointerDown: H,
      onClick: N,
      onPointerDown: T
    }), (V, Z) => (G(), X("div", {
      ref_key: "handle",
      ref: $,
      "data-id": `${F(p)}-${e.id}-${o.value}`,
      "data-handleid": e.id,
      "data-nodeid": F(p),
      "data-handlepos": V.position,
      class: xe(["vue-flow__handle", [
        `vue-flow__handle-${V.position}`,
        `vue-flow__handle-${e.id}`,
        F(c),
        F(f),
        o.value,
        {
          connectable: z.value,
          connecting: w.value,
          connectablestart: M.value,
          connectableend: D.value,
          connectionindicator: z.value && (M.value && !x.value || D.value && x.value)
        }
      ]]),
      onMousedown: T,
      onTouchstartPassive: T,
      onClick: N
    }, [
      In(V.$slots, "default", { id: V.id })
    ], 42, AE));
  }
}), rr = function({
  sourcePosition: e = fe.Bottom,
  targetPosition: t = fe.Top,
  label: n,
  connectable: o = !0,
  isValidTargetPos: i,
  isValidSourcePos: r,
  data: s
}) {
  const l = s.label || n;
  return [
    Ie(dn, { type: "target", position: t, connectable: o, isValidConnection: i }),
    typeof l != "string" && l ? Ie(l) : Ie(ye, [l]),
    Ie(dn, { type: "source", position: e, connectable: o, isValidConnection: r })
  ];
};
rr.props = ["sourcePosition", "targetPosition", "label", "isValidTargetPos", "isValidSourcePos", "connectable", "data"];
rr.inheritAttrs = !1;
rr.compatConfig = { MODE: 3 };
const LE = rr, sr = function({
  targetPosition: e = fe.Top,
  label: t,
  connectable: n = !0,
  isValidTargetPos: o,
  data: i
}) {
  const r = i.label || t;
  return [
    Ie(dn, { type: "target", position: e, connectable: n, isValidConnection: o }),
    typeof r != "string" && r ? Ie(r) : Ie(ye, [r])
  ];
};
sr.props = ["targetPosition", "label", "isValidTargetPos", "connectable", "data"];
sr.inheritAttrs = !1;
sr.compatConfig = { MODE: 3 };
const VE = sr, lr = function({
  sourcePosition: e = fe.Bottom,
  label: t,
  connectable: n = !0,
  isValidSourcePos: o,
  data: i
}) {
  const r = i.label || t;
  return [
    typeof r != "string" && r ? Ie(r) : Ie(ye, [r]),
    Ie(dn, { type: "source", position: e, connectable: n, isValidConnection: o })
  ];
};
lr.props = ["sourcePosition", "label", "isValidSourcePos", "connectable", "data"];
lr.inheritAttrs = !1;
lr.compatConfig = { MODE: 3 };
const zE = lr, BE = ["transform"], FE = ["width", "height", "x", "y", "rx", "ry"], HE = ["y"], UE = {
  name: "EdgeText",
  compatConfig: { MODE: 3 }
}, jE = /* @__PURE__ */ Oe({
  ...UE,
  props: {
    x: {},
    y: {},
    label: {},
    labelStyle: { default: () => ({}) },
    labelShowBg: { type: Boolean, default: !0 },
    labelBgStyle: { default: () => ({}) },
    labelBgPadding: { default: () => [2, 4] },
    labelBgBorderRadius: { default: 2 }
  },
  setup(e) {
    const t = ie({ x: 0, y: 0, width: 0, height: 0 }), n = ie(null), o = de(() => `translate(${e.x - t.value.width / 2} ${e.y - t.value.height / 2})`);
    ht(i), Se([() => e.x, () => e.y, n, () => e.label], i);
    function i() {
      if (!n.value)
        return;
      const r = n.value.getBBox();
      (r.width !== t.value.width || r.height !== t.value.height) && (t.value = r);
    }
    return (r, s) => (G(), X("g", {
      transform: o.value,
      class: "vue-flow__edge-textwrapper"
    }, [
      r.labelShowBg ? (G(), X("rect", {
        key: 0,
        class: "vue-flow__edge-textbg",
        width: `${t.value.width + 2 * r.labelBgPadding[0]}px`,
        height: `${t.value.height + 2 * r.labelBgPadding[1]}px`,
        x: -r.labelBgPadding[0],
        y: -r.labelBgPadding[1],
        style: ft(r.labelBgStyle),
        rx: r.labelBgBorderRadius,
        ry: r.labelBgBorderRadius
      }, null, 12, FE)) : ke("", !0),
      h("text", Ds(r.$attrs, {
        ref_key: "el",
        ref: n,
        class: "vue-flow__edge-text",
        y: t.value.height / 2,
        dy: "0.3em",
        style: r.labelStyle
      }), [
        In(r.$slots, "default", {}, () => [
          typeof r.label != "string" ? (G(), gt(Mu(r.label), { key: 0 })) : (G(), X(ye, { key: 1 }, [
            Pe(Q(r.label), 1)
          ], 64))
        ])
      ], 16, HE)
    ], 8, BE));
  }
}), GE = ["id", "d", "marker-end", "marker-start"], YE = ["d", "stroke-width"], XE = {
  name: "BaseEdge",
  inheritAttrs: !1,
  compatConfig: { MODE: 3 }
}, jo = /* @__PURE__ */ Oe({
  ...XE,
  props: {
    id: {},
    labelX: {},
    labelY: {},
    path: {},
    label: {},
    markerStart: {},
    markerEnd: {},
    interactionWidth: { default: 20 },
    style: {},
    labelStyle: {},
    labelShowBg: { type: Boolean, default: !0 },
    labelBgStyle: {},
    labelBgPadding: {},
    labelBgBorderRadius: {}
  },
  setup(e, { expose: t }) {
    const n = Pu(e, ["interactionWidth", "labelShowBg"]), o = ie(null), i = ie(null), r = ie(null), s = eh();
    return t({
      pathEl: o,
      interactionEl: i,
      labelEl: r
    }), (l, a) => (G(), X(ye, null, [
      h("path", {
        id: l.id,
        ref_key: "pathEl",
        ref: o,
        d: l.path,
        style: ft(n.style),
        class: xe(["vue-flow__edge-path", F(s).class]),
        "marker-end": l.markerEnd,
        "marker-start": l.markerStart
      }, null, 14, GE),
      l.interactionWidth ? (G(), X("path", {
        key: 0,
        ref_key: "interactionEl",
        ref: i,
        fill: "none",
        d: l.path,
        "stroke-width": l.interactionWidth,
        "stroke-opacity": 0,
        class: "vue-flow__edge-interaction"
      }, null, 8, YE)) : ke("", !0),
      l.label && l.labelX && l.labelY ? (G(), gt(jE, {
        key: 1,
        ref_key: "labelEl",
        ref: r,
        x: l.labelX,
        y: l.labelY,
        label: l.label,
        "label-show-bg": l.labelShowBg,
        "label-bg-style": l.labelBgStyle,
        "label-bg-padding": l.labelBgPadding,
        "label-bg-border-radius": l.labelBgBorderRadius,
        "label-style": l.labelStyle
      }, null, 8, ["x", "y", "label", "label-show-bg", "label-bg-style", "label-bg-padding", "label-bg-border-radius", "label-style"])) : ke("", !0)
    ], 64));
  }
});
function Vd({
  sourceX: e,
  sourceY: t,
  targetX: n,
  targetY: o
}) {
  const i = Math.abs(n - e) / 2, r = n < e ? n + i : n - i, s = Math.abs(o - t) / 2, l = o < t ? o + s : o - s;
  return [r, l, i, s];
}
function zd({
  sourceX: e,
  sourceY: t,
  targetX: n,
  targetY: o,
  sourceControlX: i,
  sourceControlY: r,
  targetControlX: s,
  targetControlY: l
}) {
  const a = e * 0.125 + i * 0.375 + s * 0.375 + n * 0.125, u = t * 0.125 + r * 0.375 + l * 0.375 + o * 0.125, c = Math.abs(a - e), f = Math.abs(u - t);
  return [a, u, c, f];
}
function ii(e, t) {
  return e >= 0 ? 0.5 * e : t * 25 * Math.sqrt(-e);
}
function Ba({ pos: e, x1: t, y1: n, x2: o, y2: i, c: r }) {
  let s, l;
  switch (e) {
    case fe.Left:
      s = t - ii(t - o, r), l = n;
      break;
    case fe.Right:
      s = t + ii(o - t, r), l = n;
      break;
    case fe.Top:
      s = t, l = n - ii(n - i, r);
      break;
    case fe.Bottom:
      s = t, l = n + ii(i - n, r);
      break;
  }
  return [s, l];
}
function Bd(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: o = fe.Bottom,
    targetX: i,
    targetY: r,
    targetPosition: s = fe.Top,
    curvature: l = 0.25
  } = e, [a, u] = Ba({
    pos: o,
    x1: t,
    y1: n,
    x2: i,
    y2: r,
    c: l
  }), [c, f] = Ba({
    pos: s,
    x1: i,
    y1: r,
    x2: t,
    y2: n,
    c: l
  }), [p, g, _, C] = zd({
    sourceX: t,
    sourceY: n,
    targetX: i,
    targetY: r,
    sourceControlX: a,
    sourceControlY: u,
    targetControlX: c,
    targetControlY: f
  });
  return [
    `M${t},${n} C${a},${u} ${c},${f} ${i},${r}`,
    p,
    g,
    _,
    C
  ];
}
function Fa({ pos: e, x1: t, y1: n, x2: o, y2: i }) {
  let r, s;
  switch (e) {
    case fe.Left:
    case fe.Right:
      r = 0.5 * (t + o), s = n;
      break;
    case fe.Top:
    case fe.Bottom:
      r = t, s = 0.5 * (n + i);
      break;
  }
  return [r, s];
}
function Fd(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: o = fe.Bottom,
    targetX: i,
    targetY: r,
    targetPosition: s = fe.Top
  } = e, [l, a] = Fa({
    pos: o,
    x1: t,
    y1: n,
    x2: i,
    y2: r
  }), [u, c] = Fa({
    pos: s,
    x1: i,
    y1: r,
    x2: t,
    y2: n
  }), [f, p, g, _] = zd({
    sourceX: t,
    sourceY: n,
    targetX: i,
    targetY: r,
    sourceControlX: l,
    sourceControlY: a,
    targetControlX: u,
    targetControlY: c
  });
  return [
    `M${t},${n} C${l},${a} ${u},${c} ${i},${r}`,
    f,
    p,
    g,
    _
  ];
}
const Ha = {
  [fe.Left]: { x: -1, y: 0 },
  [fe.Right]: { x: 1, y: 0 },
  [fe.Top]: { x: 0, y: -1 },
  [fe.Bottom]: { x: 0, y: 1 }
};
function qE({
  source: e,
  sourcePosition: t = fe.Bottom,
  target: n
}) {
  return t === fe.Left || t === fe.Right ? e.x < n.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : e.y < n.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
}
function Ua(e, t) {
  return Math.sqrt((t.x - e.x) ** 2 + (t.y - e.y) ** 2);
}
function WE({
  source: e,
  sourcePosition: t = fe.Bottom,
  target: n,
  targetPosition: o = fe.Top,
  center: i,
  offset: r
}) {
  const s = Ha[t], l = Ha[o], a = { x: e.x + s.x * r, y: e.y + s.y * r }, u = { x: n.x + l.x * r, y: n.y + l.y * r }, c = qE({
    source: a,
    sourcePosition: t,
    target: u
  }), f = c.x !== 0 ? "x" : "y", p = c[f];
  let g, _, C;
  const $ = { x: 0, y: 0 }, M = { x: 0, y: 0 }, [D, x, w, H] = Vd({
    sourceX: e.x,
    sourceY: e.y,
    targetX: n.x,
    targetY: n.y
  });
  if (s[f] * l[f] === -1) {
    _ = i.x ?? D, C = i.y ?? x;
    const z = [
      { x: _, y: a.y },
      { x: _, y: u.y }
    ], T = [
      { x: a.x, y: C },
      { x: u.x, y: C }
    ];
    s[f] === p ? g = f === "x" ? z : T : g = f === "x" ? T : z;
  } else {
    const z = [{ x: a.x, y: u.y }], T = [{ x: u.x, y: a.y }];
    if (f === "x" ? g = s.x === p ? T : z : g = s.y === p ? z : T, t === o) {
      const R = Math.abs(e[f] - n[f]);
      if (R <= r) {
        const E = Math.min(r - 1, r - R);
        s[f] === p ? $[f] = (a[f] > e[f] ? -1 : 1) * E : M[f] = (u[f] > n[f] ? -1 : 1) * E;
      }
    }
    if (t !== o) {
      const R = f === "x" ? "y" : "x", E = s[f] === l[R], A = a[R] > u[R], P = a[R] < u[R];
      (s[f] === 1 && (!E && A || E && P) || s[f] !== 1 && (!E && P || E && A)) && (g = f === "x" ? z : T);
    }
    const N = { x: a.x + $.x, y: a.y + $.y }, V = { x: u.x + M.x, y: u.y + M.y }, Z = Math.max(Math.abs(N.x - g[0].x), Math.abs(V.x - g[0].x)), O = Math.max(Math.abs(N.y - g[0].y), Math.abs(V.y - g[0].y));
    Z >= O ? (_ = (N.x + V.x) / 2, C = g[0].y) : (_ = g[0].x, C = (N.y + V.y) / 2);
  }
  return [[
    e,
    { x: a.x + $.x, y: a.y + $.y },
    ...g,
    { x: u.x + M.x, y: u.y + M.y },
    n
  ], _, C, w, H];
}
function KE(e, t, n, o) {
  const i = Math.min(Ua(e, t) / 2, Ua(t, n) / 2, o), { x: r, y: s } = t;
  if (e.x === r && r === n.x || e.y === s && s === n.y)
    return `L${r} ${s}`;
  if (e.y === s) {
    const u = e.x < n.x ? -1 : 1, c = e.y < n.y ? 1 : -1;
    return `L ${r + i * u},${s}Q ${r},${s} ${r},${s + i * c}`;
  }
  const l = e.x < n.x ? 1 : -1, a = e.y < n.y ? -1 : 1;
  return `L ${r},${s + i * a}Q ${r},${s} ${r + i * l},${s}`;
}
function gs(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: o = fe.Bottom,
    targetX: i,
    targetY: r,
    targetPosition: s = fe.Top,
    borderRadius: l = 5,
    centerX: a,
    centerY: u,
    offset: c = 20
  } = e, [f, p, g, _, C] = WE({
    source: { x: t, y: n },
    sourcePosition: o,
    target: { x: i, y: r },
    targetPosition: s,
    center: { x: a, y: u },
    offset: c
  });
  return [f.reduce((M, D, x) => {
    let w;
    return x > 0 && x < f.length - 1 ? w = KE(f[x - 1], D, f[x + 1], l) : w = `${x === 0 ? "M" : "L"}${D.x} ${D.y}`, M += w, M;
  }, ""), p, g, _, C];
}
function ZE(e) {
  const { sourceX: t, sourceY: n, targetX: o, targetY: i } = e, [r, s, l, a] = Vd({
    sourceX: t,
    sourceY: n,
    targetX: o,
    targetY: i
  });
  return [`M ${t},${n}L ${o},${i}`, r, s, l, a];
}
const JE = /* @__PURE__ */ Oe({
  name: "StraightEdge",
  props: [
    "label",
    "labelStyle",
    "labelShowBg",
    "labelBgStyle",
    "labelBgPadding",
    "labelBgBorderRadius",
    "sourceY",
    "sourceX",
    "targetX",
    "targetY",
    "markerEnd",
    "markerStart",
    "interactionWidth"
  ],
  compatConfig: { MODE: 3 },
  setup(e, { attrs: t }) {
    return () => {
      const [n, o, i] = ZE(e);
      return Ie(jo, {
        path: n,
        labelX: o,
        labelY: i,
        ...t,
        ...e
      });
    };
  }
}), QE = JE, ex = /* @__PURE__ */ Oe({
  name: "SmoothStepEdge",
  props: [
    "sourcePosition",
    "targetPosition",
    "label",
    "labelStyle",
    "labelShowBg",
    "labelBgStyle",
    "labelBgPadding",
    "labelBgBorderRadius",
    "sourceY",
    "sourceX",
    "targetX",
    "targetY",
    "borderRadius",
    "markerEnd",
    "markerStart",
    "interactionWidth",
    "offset"
  ],
  compatConfig: { MODE: 3 },
  setup(e, { attrs: t }) {
    return () => {
      const [n, o, i] = gs({
        ...e,
        sourcePosition: e.sourcePosition ?? fe.Bottom,
        targetPosition: e.targetPosition ?? fe.Top
      });
      return Ie(jo, {
        path: n,
        labelX: o,
        labelY: i,
        ...t,
        ...e
      });
    };
  }
}), Hd = ex, tx = /* @__PURE__ */ Oe({
  name: "StepEdge",
  props: [
    "sourcePosition",
    "targetPosition",
    "label",
    "labelStyle",
    "labelShowBg",
    "labelBgStyle",
    "labelBgPadding",
    "labelBgBorderRadius",
    "sourceY",
    "sourceX",
    "targetX",
    "targetY",
    "markerEnd",
    "markerStart",
    "interactionWidth"
  ],
  setup(e, { attrs: t }) {
    return () => Ie(Hd, { ...e, ...t, borderRadius: 0 });
  }
}), nx = tx, ox = /* @__PURE__ */ Oe({
  name: "BezierEdge",
  props: [
    "sourcePosition",
    "targetPosition",
    "label",
    "labelStyle",
    "labelShowBg",
    "labelBgStyle",
    "labelBgPadding",
    "labelBgBorderRadius",
    "sourceY",
    "sourceX",
    "targetX",
    "targetY",
    "curvature",
    "markerEnd",
    "markerStart",
    "interactionWidth"
  ],
  compatConfig: { MODE: 3 },
  setup(e, { attrs: t }) {
    return () => {
      const [n, o, i] = Bd({
        ...e,
        sourcePosition: e.sourcePosition ?? fe.Bottom,
        targetPosition: e.targetPosition ?? fe.Top
      });
      return Ie(jo, {
        path: n,
        labelX: o,
        labelY: i,
        ...t,
        ...e
      });
    };
  }
}), ix = ox, rx = /* @__PURE__ */ Oe({
  name: "SimpleBezierEdge",
  props: [
    "sourcePosition",
    "targetPosition",
    "label",
    "labelStyle",
    "labelShowBg",
    "labelBgStyle",
    "labelBgPadding",
    "labelBgBorderRadius",
    "sourceY",
    "sourceX",
    "targetX",
    "targetY",
    "markerEnd",
    "markerStart",
    "interactionWidth"
  ],
  compatConfig: { MODE: 3 },
  setup(e, { attrs: t }) {
    return () => {
      const [n, o, i] = Fd({
        ...e,
        sourcePosition: e.sourcePosition ?? fe.Bottom,
        targetPosition: e.targetPosition ?? fe.Top
      });
      return Ie(jo, {
        path: n,
        labelX: o,
        labelY: i,
        ...t,
        ...e
      });
    };
  }
}), sx = rx, lx = {
  input: zE,
  default: LE,
  output: VE
}, ax = {
  default: ix,
  straight: QE,
  step: nx,
  smoothstep: Hd,
  simplebezier: sx
};
function ux(e, t, n) {
  const o = de(() => (C) => t.value.get(C)), i = de(() => (C) => n.value.get(C)), r = de(() => {
    const C = {
      ...ax,
      ...e.edgeTypes
    }, $ = Object.keys(C);
    for (const M of e.edges)
      M.type && !$.includes(M.type) && (C[M.type] = M.type);
    return C;
  }), s = de(() => {
    const C = {
      ...lx,
      ...e.nodeTypes
    }, $ = Object.keys(C);
    for (const M of e.nodes)
      M.type && !$.includes(M.type) && (C[M.type] = M.type);
    return C;
  }), l = de(() => e.onlyRenderVisibleElements ? xd(
    e.nodes,
    {
      x: 0,
      y: 0,
      width: e.dimensions.width,
      height: e.dimensions.height
    },
    e.viewport,
    !0
  ) : e.nodes), a = de(() => {
    if (e.onlyRenderVisibleElements) {
      const C = [];
      for (const $ of e.edges) {
        const M = t.value.get($.source), D = t.value.get($.target);
        dE({
          sourcePos: M.computedPosition || { x: 0, y: 0 },
          targetPos: D.computedPosition || { x: 0, y: 0 },
          sourceWidth: M.dimensions.width,
          sourceHeight: M.dimensions.height,
          targetWidth: D.dimensions.width,
          targetHeight: D.dimensions.height,
          width: e.dimensions.width,
          height: e.dimensions.height,
          viewport: e.viewport
        }) && C.push($);
      }
      return C;
    }
    return e.edges;
  }), u = de(() => [...l.value, ...a.value]), c = de(() => {
    const C = [];
    for (const $ of e.nodes)
      $.selected && C.push($);
    return C;
  }), f = de(() => {
    const C = [];
    for (const $ of e.edges)
      $.selected && C.push($);
    return C;
  }), p = de(() => [
    ...c.value,
    ...f.value
  ]), g = de(() => {
    const C = [];
    for (const $ of e.nodes)
      $.dimensions.width && $.dimensions.height && $.handleBounds !== void 0 && C.push($);
    return C;
  }), _ = de(
    () => l.value.length > 0 && g.value.length === l.value.length
  );
  return {
    getNode: o,
    getEdge: i,
    getElements: u,
    getEdgeTypes: r,
    getNodeTypes: s,
    getEdges: a,
    getNodes: l,
    getSelectedElements: p,
    getSelectedNodes: c,
    getSelectedEdges: f,
    getNodesInitialized: g,
    areNodesInitialized: _
  };
}
class En {
  constructor() {
    this.currentId = 0, this.flows = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    var t;
    const n = (t = no()) == null ? void 0 : t.appContext.app, o = (n == null ? void 0 : n.config.globalProperties.$vueFlowStorage) ?? En.instance;
    return En.instance = o ?? new En(), n && (n.config.globalProperties.$vueFlowStorage = En.instance), En.instance;
  }
  set(t, n) {
    return this.flows.set(t, n);
  }
  get(t) {
    return this.flows.get(t);
  }
  remove(t) {
    return this.flows.delete(t);
  }
  create(t, n) {
    const o = Ld(), i = Sn(o), r = {};
    for (const [p, g] of Object.entries(i.hooks)) {
      const _ = `on${p.charAt(0).toUpperCase() + p.slice(1)}`;
      r[_] = g.on;
    }
    const s = {};
    for (const [p, g] of Object.entries(i.hooks))
      s[p] = g.trigger;
    const l = de(() => {
      const p = /* @__PURE__ */ new Map();
      for (const g of i.nodes)
        p.set(g.id, g);
      return p;
    }), a = de(() => {
      const p = /* @__PURE__ */ new Map();
      for (const g of i.edges)
        p.set(g.id, g);
      return p;
    }), u = ux(i, l, a), c = DE(i, l, a);
    c.setState({ ...i, ...n });
    const f = {
      ...r,
      ...u,
      ...c,
      ...h1(i),
      nodeLookup: l,
      edgeLookup: a,
      emits: s,
      id: t,
      vueFlowVersion: "1.41.6",
      $destroy: () => {
        this.remove(t);
      }
    };
    return this.set(t, f), f;
  }
  getId() {
    return `vue-flow-${this.currentId++}`;
  }
}
function Be(e) {
  const t = En.getInstance(), n = Es(), o = typeof e == "object", i = o ? e : { id: e }, r = i.id, s = r ?? (n == null ? void 0 : n.vueFlowId);
  let l;
  if (n) {
    const a = At(za, null);
    typeof a < "u" && a !== null && (!s || a.id === s) && (l = a);
  }
  if (l || s && (l = t.get(s)), !l || s && l.id !== s) {
    const a = r ?? t.getId(), u = t.create(a, i);
    l = u, (n ?? eu(!0)).run(() => {
      Se(
        u.applyDefault,
        (f, p, g) => {
          const _ = ($) => {
            u.applyNodeChanges($);
          }, C = ($) => {
            u.applyEdgeChanges($);
          };
          f ? (u.onNodesChange(_), u.onEdgesChange(C)) : (u.hooks.value.nodesChange.off(_), u.hooks.value.edgesChange.off(C)), g(() => {
            u.hooks.value.nodesChange.off(_), u.hooks.value.edgesChange.off(C);
          });
        },
        { immediate: !0 }
      ), Ki(() => {
        if (l) {
          const f = t.get(l.id);
          f ? f.$destroy() : or(`No store instance found for id ${l.id} in storage.`);
        }
      });
    });
  } else
    o && l.setState(i);
  if (n && (On(za, l), n.vueFlowId = l.id), o) {
    const a = no();
    (a == null ? void 0 : a.type.name) !== "VueFlow" && l.emits.error(new We(Ye.USEVUEFLOW_OPTIONS));
  }
  return l;
}
function cx(e) {
  const { emits: t, dimensions: n } = Be();
  let o;
  ht(() => {
    const i = e.value, r = () => {
      if (!i)
        return;
      const s = tr(i);
      (s.width === 0 || s.height === 0) && t.error(new We(Ye.MISSING_VIEWPORT_DIMENSIONS)), n.value = { width: s.width || 500, height: s.height || 500 };
    };
    r(), window.addEventListener("resize", r), i && (o = new ResizeObserver(() => r()), o.observe(i)), gn(() => {
      window.removeEventListener("resize", r), o && i && o.unobserve(i);
    });
  });
}
const dx = {
  name: "UserSelection",
  compatConfig: { MODE: 3 }
}, fx = /* @__PURE__ */ Oe({
  ...dx,
  props: {
    userSelectionRect: {}
  },
  setup(e) {
    return (t, n) => (G(), X("div", {
      class: "vue-flow__selection vue-flow__container",
      style: ft({
        width: `${t.userSelectionRect.width}px`,
        height: `${t.userSelectionRect.height}px`,
        transform: `translate(${t.userSelectionRect.x}px, ${t.userSelectionRect.y}px)`
      })
    }, null, 4));
  }
}), hx = ["tabIndex"], px = {
  name: "NodesSelection",
  compatConfig: { MODE: 3 }
}, vx = /* @__PURE__ */ Oe({
  ...px,
  setup(e) {
    const { emits: t, viewport: n, getSelectedNodes: o, noPanClassName: i, disableKeyboardA11y: r, userSelectionActive: s } = Be(), l = Rd(), a = ie(null), u = Pd({
      el: a,
      onStart(_) {
        t.selectionDragStart(_);
      },
      onDrag(_) {
        t.selectionDrag(_);
      },
      onStop(_) {
        t.selectionDragStop(_);
      }
    });
    ht(() => {
      var _;
      r.value || (_ = a.value) == null || _.focus({ preventScroll: !0 });
    });
    const c = de(() => Ed(o.value)), f = de(() => ({
      width: `${c.value.width}px`,
      height: `${c.value.height}px`,
      top: `${c.value.y}px`,
      left: `${c.value.x}px`
    }));
    function p(_) {
      t.selectionContextMenu({ event: _, nodes: o.value });
    }
    function g(_) {
      r || qn[_.key] && (_.preventDefault(), l(
        {
          x: qn[_.key].x,
          y: qn[_.key].y
        },
        _.shiftKey
      ));
    }
    return (_, C) => !F(s) && c.value.width && c.value.height ? (G(), X("div", {
      key: 0,
      class: xe(["vue-flow__nodesselection vue-flow__container", F(i)]),
      style: ft({ transform: `translate(${F(n).x}px,${F(n).y}px) scale(${F(n).zoom})` })
    }, [
      h("div", {
        ref_key: "el",
        ref: a,
        class: xe([{ dragging: F(u) }, "vue-flow__nodesselection-rect"]),
        style: ft(f.value),
        tabIndex: F(r) ? void 0 : -1,
        onContextmenu: p,
        onKeydown: g
      }, null, 46, hx)
    ], 6)) : ke("", !0);
  }
});
function gx(e, t) {
  return {
    x: e.clientX - t.left,
    y: e.clientY - t.top
  };
}
const mx = {
  name: "Pane",
  compatConfig: { MODE: 3 }
}, yx = /* @__PURE__ */ Oe({
  ...mx,
  props: {
    isSelecting: { type: Boolean },
    selectionKeyPressed: { type: Boolean }
  },
  setup(e) {
    const {
      vueFlowRef: t,
      nodes: n,
      viewport: o,
      emits: i,
      userSelectionActive: r,
      removeSelectedElements: s,
      userSelectionRect: l,
      elementsSelectable: a,
      nodesSelectionActive: u,
      getSelectedEdges: c,
      getSelectedNodes: f,
      removeNodes: p,
      removeEdges: g,
      selectionMode: _,
      deleteKeyCode: C,
      multiSelectionKeyCode: $,
      multiSelectionActive: M,
      edgeLookup: D,
      nodeLookup: x
    } = Be(), w = ie(null), H = ie(0), L = ie(0), z = ie(), T = ie(/* @__PURE__ */ new Map()), N = ze(() => a.value && (e.isSelecting || r.value));
    let V = !1, Z = !1;
    const O = xo(C, { actInsideInputWithModifier: !1 }), R = xo($);
    Se(O, (te) => {
      te && (p(f.value), g(c.value), u.value = !1);
    }), Se(R, (te) => {
      M.value = te;
    });
    function E(te, ae) {
      return (se) => {
        se.target === ae && (te == null || te(se));
      };
    }
    function A() {
      r.value = !1, l.value = null, H.value = 0, L.value = 0;
    }
    function P(te) {
      if (V) {
        V = !1;
        return;
      }
      i.paneClick(te), s(), u.value = !1;
    }
    function j(te) {
      te.preventDefault(), te.stopPropagation(), i.paneContextMenu(te);
    }
    function q(te) {
      i.paneScroll(te);
    }
    function ee(te) {
      var ae, se, _e, W, he;
      if (z.value = (ae = t.value) == null ? void 0 : ae.getBoundingClientRect(), !a.value || !e.isSelecting || te.button !== 0 || te.target !== w.value || !z.value)
        return;
      (_e = (se = te.target) == null ? void 0 : se.setPointerCapture) == null || _e.call(se, te.pointerId);
      const { x: we, y: pe } = gx(te, z.value);
      Z = !0, V = !1, T.value = /* @__PURE__ */ new Map();
      for (const [ge, Y] of D.value)
        T.value.set(Y.source, ((W = T.value.get(Y.source)) == null ? void 0 : W.add(ge)) || /* @__PURE__ */ new Set([ge])), T.value.set(Y.target, ((he = T.value.get(Y.target)) == null ? void 0 : he.add(ge)) || /* @__PURE__ */ new Set([ge]));
      s(), l.value = {
        width: 0,
        height: 0,
        startX: we,
        startY: pe,
        x: we,
        y: pe
      }, i.selectionStart(te);
    }
    function oe(te) {
      if (!z.value || !l.value)
        return;
      V = !0;
      const { x: ae, y: se } = Wt(te, z.value), { startX: _e = 0, startY: W = 0 } = l.value, he = {
        startX: _e,
        startY: W,
        x: ae < _e ? ae : _e,
        y: se < W ? se : W,
        width: Math.abs(ae - _e),
        height: Math.abs(se - W)
      }, we = xd(
        n.value,
        he,
        o.value,
        _.value === Gs.Partial,
        !0
      ), pe = /* @__PURE__ */ new Set(), ge = /* @__PURE__ */ new Set();
      for (const Y of we) {
        ge.add(Y.id);
        const d = T.value.get(Y.id);
        if (d)
          for (const k of d)
            pe.add(k);
      }
      if (H.value !== ge.size) {
        H.value = ge.size;
        const Y = on(x.value, ge, !0);
        i.nodesChange(Y);
      }
      if (L.value !== pe.size) {
        L.value = pe.size;
        const Y = on(D.value, pe);
        i.edgesChange(Y);
      }
      l.value = he, r.value = !0, u.value = !1;
    }
    function ce(te) {
      var ae;
      te.button !== 0 || !Z || ((ae = te.target) == null || ae.releasePointerCapture(te.pointerId), !r.value && l.value && te.target === w.value && P(te), H.value > 0 && (u.value = !0), A(), i.selectionEnd(te), e.selectionKeyPressed && (V = !1), Z = !1);
    }
    return (te, ae) => (G(), X("div", {
      ref_key: "container",
      ref: w,
      class: xe(["vue-flow__pane vue-flow__container", { selection: te.isSelecting }]),
      onClick: ae[0] || (ae[0] = (se) => N.value ? void 0 : E(P, w.value)(se)),
      onContextmenu: ae[1] || (ae[1] = (se) => E(j, w.value)(se)),
      onWheelPassive: ae[2] || (ae[2] = (se) => E(q, w.value)(se)),
      onPointerenter: ae[3] || (ae[3] = (se) => N.value ? void 0 : F(i).paneMouseEnter(se)),
      onPointerdown: ae[4] || (ae[4] = (se) => N.value ? ee(se) : F(i).paneMouseMove(se)),
      onPointermove: ae[5] || (ae[5] = (se) => N.value ? oe(se) : F(i).paneMouseMove(se)),
      onPointerup: ae[6] || (ae[6] = (se) => N.value ? ce(se) : void 0),
      onPointerleave: ae[7] || (ae[7] = (se) => F(i).paneMouseLeave(se))
    }, [
      In(te.$slots, "default"),
      F(r) && F(l) ? (G(), gt(fx, {
        key: 0,
        "user-selection-rect": F(l)
      }, null, 8, ["user-selection-rect"])) : ke("", !0),
      F(u) && F(f).length ? (G(), gt(vx, { key: 1 })) : ke("", !0)
    ], 34));
  }
}), bx = {
  name: "Transform",
  compatConfig: { MODE: 3 }
}, _x = /* @__PURE__ */ Oe({
  ...bx,
  setup(e) {
    const { viewport: t, fitViewOnInit: n, fitViewOnInitDone: o } = Be(), i = de(() => n.value ? !o.value : !1), r = de(() => `translate(${t.value.x}px,${t.value.y}px) scale(${t.value.zoom})`);
    return (s, l) => (G(), X("div", {
      class: "vue-flow__transformationpane vue-flow__container",
      style: ft({ transform: r.value, opacity: i.value ? 0 : void 0 })
    }, [
      In(s.$slots, "default")
    ], 4));
  }
}), wx = {
  name: "Viewport",
  compatConfig: { MODE: 3 }
}, Ex = /* @__PURE__ */ Oe({
  ...wx,
  setup(e) {
    const {
      minZoom: t,
      maxZoom: n,
      defaultViewport: o,
      translateExtent: i,
      zoomActivationKeyCode: r,
      selectionKeyCode: s,
      panActivationKeyCode: l,
      panOnScroll: a,
      panOnScrollMode: u,
      panOnScrollSpeed: c,
      panOnDrag: f,
      zoomOnDoubleClick: p,
      zoomOnPinch: g,
      zoomOnScroll: _,
      preventScrolling: C,
      noWheelClassName: $,
      noPanClassName: M,
      emits: D,
      connectionStartHandle: x,
      userSelectionActive: w,
      paneDragging: H,
      d3Zoom: L,
      d3Selection: z,
      d3ZoomHandler: T,
      viewport: N,
      viewportRef: V,
      paneClickDistance: Z
    } = Be();
    cx(V);
    const O = ie(!1), R = ie(!1);
    let E = null, A = !1, P = 0, j = {
      x: 0,
      y: 0,
      zoom: 0
    };
    const q = xo(l), ee = xo(s), oe = xo(r), ce = ze(
      () => (!ee.value || ee.value && s.value === !0) && (q.value || f.value)
    ), te = ze(() => q.value || a.value), ae = ze(() => ee.value || s.value === !0 && ce.value !== !0);
    ht(() => {
      if (!V.value) {
        or("Viewport element is missing");
        return;
      }
      const pe = V.value, ge = pe.getBoundingClientRect(), Y = qw().clickDistance(Z.value).scaleExtent([t.value, n.value]).translateExtent(i.value), d = wt(pe).call(Y), k = d.on("wheel.zoom"), v = eo.translate(o.value.x ?? 0, o.value.y ?? 0).scale(Dn(o.value.zoom ?? 1, t.value, n.value)), m = [
        [0, 0],
        [ge.width, ge.height]
      ], y = Y.constrain()(v, m, i.value);
      Y.transform(d, y), Y.wheelDelta(_e), L.value = Y, z.value = d, T.value = k, N.value = { x: y.x, y: y.y, zoom: y.k }, Y.on("start", (b) => {
        var I;
        if (!b.sourceEvent)
          return null;
        P = b.sourceEvent.button, O.value = !0;
        const B = he(b.transform);
        ((I = b.sourceEvent) == null ? void 0 : I.type) === "mousedown" && (H.value = !0), j = B, D.viewportChangeStart(B), D.moveStart({ event: b, flowTransform: B });
      }), Y.on("end", (b) => {
        if (!b.sourceEvent)
          return null;
        if (O.value = !1, H.value = !1, se(ce.value, P ?? 0) && !A && D.paneContextMenu(b.sourceEvent), A = !1, W(j, b.transform)) {
          const I = he(b.transform);
          j = I, D.viewportChangeEnd(I), D.moveEnd({ event: b, flowTransform: I });
        }
      }), Y.filter((b) => {
        var I;
        const B = oe.value || _.value, U = g.value && b.ctrlKey, S = b.button;
        if (S === 1 && b.type === "mousedown" && (we(b, "vue-flow__node") || we(b, "vue-flow__edge")))
          return !0;
        if (!ce.value && !B && !te.value && !p.value && !g.value || w.value || !p.value && b.type === "dblclick" || we(b, $.value) && b.type === "wheel" || we(b, M.value) && (b.type !== "wheel" || te.value && b.type === "wheel" && !oe.value) || !g.value && b.ctrlKey && b.type === "wheel" || !B && !te.value && !U && b.type === "wheel")
          return !1;
        if (!g && b.type === "touchstart" && ((I = b.touches) == null ? void 0 : I.length) > 1)
          return b.preventDefault(), !1;
        if (!ce.value && (b.type === "mousedown" || b.type === "touchstart") || s.value === !0 && Array.isArray(f.value) && f.value.includes(0) && S === 0 || Array.isArray(f.value) && !f.value.includes(S) && (b.type === "mousedown" || b.type === "touchstart"))
          return !1;
        const J = Array.isArray(f.value) && f.value.includes(S) || s.value === !0 && Array.isArray(f.value) && !f.value.includes(0) || !S || S <= 1;
        return (!b.ctrlKey || q.value || b.type === "wheel") && J;
      }), Se(
        [w, ce],
        () => {
          w.value && !O.value ? Y.on("zoom", null) : w.value || Y.on("zoom", (b) => {
            N.value = { x: b.transform.x, y: b.transform.y, zoom: b.transform.k };
            const I = he(b.transform);
            A = se(ce.value, P ?? 0), D.viewportChange(I), D.move({ event: b, flowTransform: I });
          });
        },
        { immediate: !0 }
      ), Se(
        [w, te, u, oe, g, C, $],
        () => {
          te.value && !oe.value && !w.value ? d.on(
            "wheel.zoom",
            (b) => {
              if (we(b, $.value))
                return !1;
              const I = oe.value || _.value, B = g.value && b.ctrlKey;
              if (!(!C.value || te.value || I || B))
                return !1;
              b.preventDefault(), b.stopImmediatePropagation();
              const S = d.property("__zoom").k || 1, J = Di();
              if (!q.value && b.ctrlKey && g.value && J) {
                const Ee = Tt(b), $e = _e(b), nt = S * 2 ** $e;
                Y.scaleTo(d, nt, Ee, b);
                return;
              }
              const K = b.deltaMode === 1 ? 20 : 1;
              let ne = u.value === Eo.Vertical ? 0 : b.deltaX * K, le = u.value === Eo.Horizontal ? 0 : b.deltaY * K;
              !J && b.shiftKey && u.value !== Eo.Vertical && !ne && le && (ne = le, le = 0), Y.translateBy(
                d,
                -(ne / S) * c.value,
                -(le / S) * c.value
              );
              const me = he(d.property("__zoom"));
              E && clearTimeout(E), R.value ? (D.move({ event: b, flowTransform: me }), D.viewportChange(me), E = setTimeout(() => {
                D.moveEnd({ event: b, flowTransform: me }), D.viewportChangeEnd(me), R.value = !1;
              }, 150)) : (R.value = !0, D.moveStart({ event: b, flowTransform: me }), D.viewportChangeStart(me));
            },
            { passive: !1 }
          ) : typeof k < "u" && d.on(
            "wheel.zoom",
            function(b, I) {
              const B = !C.value && b.type === "wheel" && !b.ctrlKey, U = oe.value || _.value, S = g.value && b.ctrlKey;
              if (!U && !a.value && !S && b.type === "wheel" || B || we(b, $.value))
                return null;
              b.preventDefault(), k.call(this, b, I);
            },
            { passive: !1 }
          );
        },
        { immediate: !0 }
      );
    });
    function se(pe, ge) {
      return ge === 2 && Array.isArray(pe) && pe.includes(2);
    }
    function _e(pe) {
      const ge = pe.ctrlKey && Di() ? 10 : 1;
      return -pe.deltaY * (pe.deltaMode === 1 ? 0.05 : pe.deltaMode ? 1 : 2e-3) * ge;
    }
    function W(pe, ge) {
      return pe.x !== ge.x && !Number.isNaN(ge.x) || pe.y !== ge.y && !Number.isNaN(ge.y) || pe.zoom !== ge.k && !Number.isNaN(ge.k);
    }
    function he(pe) {
      return {
        x: pe.x,
        y: pe.y,
        zoom: pe.k
      };
    }
    function we(pe, ge) {
      return pe.target.closest(`.${ge}`);
    }
    return (pe, ge) => (G(), X("div", {
      ref_key: "viewportRef",
      ref: V,
      class: "vue-flow__viewport vue-flow__container"
    }, [
      re(yx, {
        "is-selecting": ae.value,
        "selection-key-pressed": F(ee),
        class: xe({
          connecting: !!F(x),
          dragging: F(H),
          draggable: F(f) === !0 || Array.isArray(F(f)) && F(f).includes(0)
        })
      }, {
        default: cn(() => [
          re(_x, null, {
            default: cn(() => [
              In(pe.$slots, "default")
            ]),
            _: 3
          })
        ]),
        _: 3
      }, 8, ["is-selecting", "selection-key-pressed", "class"])
    ], 512));
  }
}), xx = ["id"], kx = ["id"], Sx = ["id"], Cx = {
  name: "A11yDescriptions",
  compatConfig: { MODE: 3 }
}, Nx = /* @__PURE__ */ Oe({
  ...Cx,
  setup(e) {
    const { id: t, disableKeyboardA11y: n, ariaLiveMessage: o } = Be();
    return (i, r) => (G(), X(ye, null, [
      h("div", {
        id: `${F(hd)}-${F(t)}`,
        style: { display: "none" }
      }, " Press enter or space to select a node. " + Q(F(n) ? "" : "You can then use the arrow keys to move the node around.") + " You can then use the arrow keys to move the node around, press delete to remove it and press escape to cancel. ", 9, xx),
      h("div", {
        id: `${F(pd)}-${F(t)}`,
        style: { display: "none" }
      }, " Press enter or space to select an edge. You can then press delete to remove it or press escape to cancel. ", 8, kx),
      F(n) ? ke("", !0) : (G(), X("div", {
        key: 0,
        id: `${F(Jw)}-${F(t)}`,
        "aria-live": "assertive",
        "aria-atomic": "true",
        style: { position: "absolute", width: "1px", height: "1px", margin: "-1px", border: "0", padding: "0", overflow: "hidden", clip: "rect(0px, 0px, 0px, 0px)", "clip-path": "inset(100%)" }
      }, Q(F(o)), 9, Sx))
    ], 64));
  }
});
function $x() {
  const e = Be();
  Se(
    () => e.viewportHelper.value.viewportInitialized,
    (t) => {
      t && setTimeout(() => {
        e.emits.init(e), e.emits.paneReady(e);
      }, 1);
    }
  );
}
function Mx(e, t, n) {
  return n === fe.Left ? e - t : n === fe.Right ? e + t : e;
}
function Ix(e, t, n) {
  return n === fe.Top ? e - t : n === fe.Bottom ? e + t : e;
}
const Ws = function({
  radius: e = 10,
  centerX: t = 0,
  centerY: n = 0,
  position: o = fe.Top,
  type: i
}) {
  return Ie("circle", {
    class: `vue-flow__edgeupdater vue-flow__edgeupdater-${i}`,
    cx: Mx(t, e, o),
    cy: Ix(n, e, o),
    r: e,
    stroke: "transparent",
    fill: "transparent"
  });
};
Ws.props = ["radius", "centerX", "centerY", "position", "type"];
Ws.compatConfig = { MODE: 3 };
const ja = Ws, Ox = /* @__PURE__ */ Oe({
  name: "Edge",
  compatConfig: { MODE: 3 },
  props: ["id"],
  setup(e) {
    const {
      id: t,
      addSelectedEdges: n,
      connectionMode: o,
      edgeUpdaterRadius: i,
      emits: r,
      nodesSelectionActive: s,
      noPanClassName: l,
      getEdgeTypes: a,
      removeSelectedEdges: u,
      findEdge: c,
      findNode: f,
      isValidConnection: p,
      multiSelectionActive: g,
      disableKeyboardA11y: _,
      elementsSelectable: C,
      edgesUpdatable: $,
      edgesFocusable: M,
      hooks: D
    } = Be(), x = de(() => c(e.id)), { emit: w, on: H } = xE(x.value, r), L = At(ir), z = no(), T = ie(!1), N = ie(!1), V = ie(""), Z = ie(null), O = ie("source"), R = ie(null), E = ze(
      () => typeof x.value.selectable > "u" ? C.value : x.value.selectable
    ), A = ze(() => typeof x.value.updatable > "u" ? $.value : x.value.updatable), P = ze(() => typeof x.value.focusable > "u" ? M.value : x.value.focusable);
    On(_E, e.id), On(wE, R);
    const j = de(() => x.value.class instanceof Function ? x.value.class(x.value) : x.value.class), q = de(() => x.value.style instanceof Function ? x.value.style(x.value) : x.value.style), ee = de(() => {
      const m = x.value.type || "default", y = L == null ? void 0 : L[`edge-${m}`];
      if (y)
        return y;
      let b = x.value.template ?? a.value[m];
      if (typeof b == "string" && z) {
        const I = Object.keys(z.appContext.components);
        I && I.includes(m) && (b = Nu(m, !1));
      }
      return b && typeof b != "string" ? b : (r.error(new We(Ye.EDGE_TYPE_MISSING, b)), !1);
    }), { handlePointerDown: oe } = Dd({
      nodeId: V,
      handleId: Z,
      type: O,
      isValidConnection: p,
      edgeUpdaterType: O,
      onEdgeUpdate: ae,
      onEdgeUpdateEnd: se
    });
    return () => {
      const m = f(x.value.source), y = f(x.value.target), b = "pathOptions" in x.value ? x.value.pathOptions : {};
      if (!m && !y)
        return r.error(new We(Ye.EDGE_SOURCE_TARGET_MISSING, x.value.id, x.value.source, x.value.target)), null;
      if (!m)
        return r.error(new We(Ye.EDGE_SOURCE_MISSING, x.value.id, x.value.source)), null;
      if (!y)
        return r.error(new We(Ye.EDGE_TARGET_MISSING, x.value.id, x.value.target)), null;
      if (!x.value || x.value.hidden || m.hidden || y.hidden)
        return null;
      let I;
      o.value === Pn.Strict ? I = m.handleBounds.source : I = [...m.handleBounds.source || [], ...m.handleBounds.target || []];
      const B = Pa(I, x.value.sourceHandle);
      let U;
      o.value === Pn.Strict ? U = y.handleBounds.target : U = [...y.handleBounds.target || [], ...y.handleBounds.source || []];
      const S = Pa(U, x.value.targetHandle), J = (B == null ? void 0 : B.position) || fe.Bottom, K = (S == null ? void 0 : S.position) || fe.Top, { x: ne, y: le } = Pi(m, B, J), { x: me, y: Ee } = Pi(y, S, K);
      return x.value.sourceX = ne, x.value.sourceY = le, x.value.targetX = me, x.value.targetY = Ee, Ie(
        "g",
        {
          ref: R,
          key: e.id,
          "data-id": e.id,
          class: [
            "vue-flow__edge",
            `vue-flow__edge-${ee.value === !1 ? "default" : x.value.type || "default"}`,
            l.value,
            j.value,
            {
              updating: T.value,
              selected: x.value.selected,
              animated: x.value.animated,
              inactive: !E.value && !D.value.edgeClick.hasListeners()
            }
          ],
          onClick: W,
          onContextmenu: he,
          onDblclick: we,
          onMouseenter: pe,
          onMousemove: ge,
          onMouseleave: Y,
          onKeyDown: P.value ? v : void 0,
          tabIndex: P.value ? 0 : void 0,
          "aria-label": x.value.ariaLabel === null ? void 0 : x.value.ariaLabel || `Edge from ${x.value.source} to ${x.value.target}`,
          "aria-describedby": P.value ? `${pd}-${t}` : void 0,
          role: P.value ? "button" : "img"
        },
        [
          N.value ? null : Ie(ee.value === !1 ? a.value.default : ee.value, {
            id: e.id,
            sourceNode: m,
            targetNode: y,
            source: x.value.source,
            target: x.value.target,
            type: x.value.type,
            updatable: A.value,
            selected: x.value.selected,
            animated: x.value.animated,
            label: x.value.label,
            labelStyle: x.value.labelStyle,
            labelShowBg: x.value.labelShowBg,
            labelBgStyle: x.value.labelBgStyle,
            labelBgPadding: x.value.labelBgPadding,
            labelBgBorderRadius: x.value.labelBgBorderRadius,
            data: x.value.data,
            events: { ...x.value.events, ...H },
            style: q.value,
            markerStart: `url('#${Lo(x.value.markerStart, t)}')`,
            markerEnd: `url('#${Lo(x.value.markerEnd, t)}')`,
            sourcePosition: J,
            targetPosition: K,
            sourceX: ne,
            sourceY: le,
            targetX: me,
            targetY: Ee,
            sourceHandleId: x.value.sourceHandle,
            targetHandleId: x.value.targetHandle,
            interactionWidth: x.value.interactionWidth,
            ...b
          }),
          [
            A.value === "source" || A.value === !0 ? [
              Ie(
                "g",
                {
                  onMousedown: d,
                  onMouseenter: ce,
                  onMouseout: te
                },
                Ie(ja, {
                  position: J,
                  centerX: ne,
                  centerY: le,
                  radius: i.value,
                  type: "source",
                  "data-type": "source"
                })
              )
            ] : null,
            A.value === "target" || A.value === !0 ? [
              Ie(
                "g",
                {
                  onMousedown: k,
                  onMouseenter: ce,
                  onMouseout: te
                },
                Ie(ja, {
                  position: K,
                  centerX: me,
                  centerY: Ee,
                  radius: i.value,
                  type: "target",
                  "data-type": "target"
                })
              )
            ] : null
          ]
        ]
      );
    };
    function ce() {
      T.value = !0;
    }
    function te() {
      T.value = !1;
    }
    function ae(m, y) {
      w.update({ event: m, edge: x.value, connection: y });
    }
    function se(m) {
      w.updateEnd({ event: m, edge: x.value }), N.value = !1;
    }
    function _e(m, y) {
      m.button === 0 && (N.value = !0, V.value = y ? x.value.target : x.value.source, Z.value = (y ? x.value.targetHandle : x.value.sourceHandle) ?? "", O.value = y ? "target" : "source", w.updateStart({ event: m, edge: x.value }), oe(m));
    }
    function W(m) {
      var y;
      const b = { event: m, edge: x.value };
      E.value && (s.value = !1, x.value.selected && g.value ? (u([x.value]), (y = R.value) == null || y.blur()) : n([x.value])), w.click(b);
    }
    function he(m) {
      w.contextMenu({ event: m, edge: x.value });
    }
    function we(m) {
      w.doubleClick({ event: m, edge: x.value });
    }
    function pe(m) {
      w.mouseEnter({ event: m, edge: x.value });
    }
    function ge(m) {
      w.mouseMove({ event: m, edge: x.value });
    }
    function Y(m) {
      w.mouseLeave({ event: m, edge: x.value });
    }
    function d(m) {
      _e(m, !0);
    }
    function k(m) {
      _e(m, !1);
    }
    function v(m) {
      var y;
      !_.value && vd.includes(m.key) && E.value && (m.key === "Escape" ? ((y = R.value) == null || y.blur(), u([c(e.id)])) : n([c(e.id)]));
    }
  }
}), Tx = Ox, Px = {
  [fe.Left]: fe.Right,
  [fe.Right]: fe.Left,
  [fe.Top]: fe.Bottom,
  [fe.Bottom]: fe.Top
}, Dx = /* @__PURE__ */ Oe({
  name: "ConnectionLine",
  compatConfig: { MODE: 3 },
  setup() {
    var e;
    const {
      id: t,
      connectionMode: n,
      connectionStartHandle: o,
      connectionEndHandle: i,
      connectionPosition: r,
      connectionLineType: s,
      connectionLineStyle: l,
      connectionLineOptions: a,
      connectionStatus: u,
      viewport: c,
      findNode: f
    } = Be(), p = (e = At(ir)) == null ? void 0 : e["connection-line"], g = de(() => {
      var D;
      return f((D = o.value) == null ? void 0 : D.nodeId);
    }), _ = de(() => {
      var D;
      return f((D = i.value) == null ? void 0 : D.nodeId) ?? null;
    }), C = de(() => ({
      x: (r.value.x - c.value.x) / c.value.zoom,
      y: (r.value.y - c.value.y) / c.value.zoom
    })), $ = de(
      () => a.value.markerStart ? `url(#${Lo(a.value.markerStart, t)})` : ""
    ), M = de(
      () => a.value.markerEnd ? `url(#${Lo(a.value.markerEnd, t)})` : ""
    );
    return () => {
      var D, x, w, H;
      if (!g.value || !o.value)
        return null;
      const L = o.value.handleId, z = o.value.type, T = g.value.handleBounds;
      let N = (T == null ? void 0 : T[z]) || [];
      if (n.value === Pn.Loose) {
        const ee = (T == null ? void 0 : T[z === "source" ? "target" : "source"]) || [];
        N = [...N, ...ee];
      }
      if (!N)
        return null;
      const V = (L ? N.find((ee) => ee.id === L) : N[0]) ?? null, Z = (V == null ? void 0 : V.position) || fe.Top, { x: O, y: R } = Pi(g.value, V, Z);
      let E = null;
      _.value && ((D = i.value) != null && D.handleId) && (n.value === Pn.Strict ? E = ((x = _.value.handleBounds[z === "source" ? "target" : "source"]) == null ? void 0 : x.find(
        (ee) => {
          var oe;
          return ee.id === ((oe = i.value) == null ? void 0 : oe.handleId);
        }
      )) || null : E = ((w = [..._.value.handleBounds.source || [], ..._.value.handleBounds.target || []]) == null ? void 0 : w.find(
        (ee) => {
          var oe;
          return ee.id === ((oe = i.value) == null ? void 0 : oe.handleId);
        }
      )) || null);
      const A = ((H = i.value) == null ? void 0 : H.position) ?? (Z ? Px[Z] : null);
      if (!Z || !A)
        return null;
      const P = s.value ?? a.value.type ?? wn.Bezier;
      let j = "";
      const q = {
        sourceX: O,
        sourceY: R,
        sourcePosition: Z,
        targetX: C.value.x,
        targetY: C.value.y,
        targetPosition: A
      };
      return P === wn.Bezier ? [j] = Bd(q) : P === wn.Step ? [j] = gs({
        ...q,
        borderRadius: 0
      }) : P === wn.SmoothStep ? [j] = gs(q) : P === wn.SimpleBezier ? [j] = Fd(q) : j = `M${O},${R} ${C.value.x},${C.value.y}`, Ie(
        "svg",
        { class: "vue-flow__edges vue-flow__connectionline vue-flow__container" },
        Ie(
          "g",
          { class: "vue-flow__connection" },
          p ? Ie(p, {
            sourceX: O,
            sourceY: R,
            sourcePosition: Z,
            targetX: C.value.x,
            targetY: C.value.y,
            targetPosition: A,
            sourceNode: g.value,
            sourceHandle: V,
            targetNode: _.value,
            targetHandle: E,
            markerEnd: M.value,
            markerStart: $.value,
            connectionStatus: u.value
          }) : Ie("path", {
            d: j,
            class: [a.value.class, u, "vue-flow__connection-path"],
            style: {
              ...l.value,
              ...a.value.style
            },
            "marker-end": M.value,
            "marker-start": $.value
          })
        )
      );
    };
  }
}), Ax = Dx, Rx = ["id", "markerWidth", "markerHeight", "markerUnits", "orient"], Lx = {
  name: "MarkerType",
  compatConfig: { MODE: 3 }
}, Vx = /* @__PURE__ */ Oe({
  ...Lx,
  props: {
    id: {},
    type: {},
    color: { default: "none" },
    width: { default: 12.5 },
    height: { default: 12.5 },
    markerUnits: { default: "strokeWidth" },
    orient: { default: "auto-start-reverse" },
    strokeWidth: { default: 1 }
  },
  setup(e) {
    return (t, n) => (G(), X("marker", {
      id: t.id,
      class: "vue-flow__arrowhead",
      viewBox: "-10 -10 20 20",
      refX: "0",
      refY: "0",
      markerWidth: `${t.width}`,
      markerHeight: `${t.height}`,
      markerUnits: t.markerUnits,
      orient: t.orient
    }, [
      t.type === F(ds).ArrowClosed ? (G(), X("polyline", {
        key: 0,
        style: ft({
          stroke: t.color,
          fill: t.color,
          strokeWidth: t.strokeWidth
        }),
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        points: "-5,-4 0,0 -5,4 -5,-4"
      }, null, 4)) : ke("", !0),
      t.type === F(ds).Arrow ? (G(), X("polyline", {
        key: 1,
        style: ft({
          stroke: t.color,
          strokeWidth: t.strokeWidth
        }),
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        fill: "none",
        points: "-5,-4 0,0 -5,4"
      }, null, 4)) : ke("", !0)
    ], 8, Rx));
  }
}), zx = { class: "vue-flow__marker vue-flow__container" }, Bx = {
  name: "MarkerDefinitions",
  compatConfig: { MODE: 3 }
}, Fx = /* @__PURE__ */ Oe({
  ...Bx,
  setup(e) {
    const { id: t, edges: n, connectionLineOptions: o, defaultMarkerColor: i } = Be(), r = de(() => {
      const s = /* @__PURE__ */ new Set(), l = [], a = (u) => {
        if (u) {
          const c = Lo(u, t);
          s.has(c) || (typeof u == "object" ? l.push({ ...u, id: c, color: u.color || i.value }) : l.push({ id: c, color: i.value, type: u }), s.add(c));
        }
      };
      for (const u of [o.value.markerEnd, o.value.markerStart])
        a(u);
      for (const u of n.value)
        for (const c of [u.markerStart, u.markerEnd])
          a(c);
      return l.sort((u, c) => u.id.localeCompare(c.id));
    });
    return (s, l) => (G(), X("svg", zx, [
      h("defs", null, [
        (G(!0), X(ye, null, Le(r.value, (a) => (G(), gt(Vx, {
          id: a.id,
          key: a.id,
          type: a.type,
          color: a.color,
          width: a.width,
          height: a.height,
          markerUnits: a.markerUnits,
          "stroke-width": a.strokeWidth,
          orient: a.orient
        }, null, 8, ["id", "type", "color", "width", "height", "markerUnits", "stroke-width", "orient"]))), 128))
      ])
    ]));
  }
}), Hx = {
  name: "Edges",
  compatConfig: { MODE: 3 }
}, Ux = /* @__PURE__ */ Oe({
  ...Hx,
  setup(e) {
    const { findNode: t, getEdges: n, elevateEdgesOnSelect: o } = Be();
    return (i, r) => (G(), X(ye, null, [
      re(Fx),
      (G(!0), X(ye, null, Le(F(n), (s) => (G(), X("svg", {
        key: s.id,
        class: "vue-flow__edges vue-flow__container",
        style: ft({ zIndex: F(fE)(s, F(t), F(o)) })
      }, [
        re(F(Tx), {
          id: s.id
        }, null, 8, ["id"])
      ], 4))), 128)),
      re(F(Ax))
    ], 64));
  }
}), jx = /* @__PURE__ */ Oe({
  name: "Node",
  compatConfig: { MODE: 3 },
  props: ["id", "resizeObserver"],
  setup(e) {
    const {
      id: t,
      noPanClassName: n,
      selectNodesOnDrag: o,
      nodesSelectionActive: i,
      multiSelectionActive: r,
      emits: s,
      removeSelectedNodes: l,
      addSelectedNodes: a,
      updateNodeDimensions: u,
      onUpdateNodeInternals: c,
      getNodeTypes: f,
      nodeExtent: p,
      elevateNodesOnSelect: g,
      disableKeyboardA11y: _,
      ariaLiveMessage: C,
      snapToGrid: $,
      snapGrid: M,
      nodeDragThreshold: D,
      nodesDraggable: x,
      elementsSelectable: w,
      nodesConnectable: H,
      nodesFocusable: L,
      hooks: z
    } = Be(), T = ie(null);
    On(Td, T), On(Od, e.id);
    const N = At(ir), V = no(), Z = Rd(), { node: O, parentNode: R } = Ad(e.id), { emit: E, on: A } = NE(O, s), P = ze(() => typeof O.draggable > "u" ? x.value : O.draggable), j = ze(() => typeof O.selectable > "u" ? w.value : O.selectable), q = ze(() => typeof O.connectable > "u" ? H.value : O.connectable), ee = ze(() => typeof O.focusable > "u" ? L.value : O.focusable), oe = ze(
      () => j.value || P.value || z.value.nodeClick.hasListeners() || z.value.nodeDoubleClick.hasListeners() || z.value.nodeMouseEnter.hasListeners() || z.value.nodeMouseMove.hasListeners() || z.value.nodeMouseLeave.hasListeners()
    ), ce = ze(() => !!O.dimensions.width && !!O.dimensions.height), te = de(() => {
      const y = O.type || "default", b = N == null ? void 0 : N[`node-${y}`];
      if (b)
        return b;
      let I = O.template || f.value[y];
      if (typeof I == "string" && V) {
        const B = Object.keys(V.appContext.components);
        B && B.includes(y) && (I = Nu(y, !1));
      }
      return I && typeof I != "string" ? I : (s.error(new We(Ye.NODE_TYPE_MISSING, I)), !1);
    }), ae = Pd({
      id: e.id,
      el: T,
      disabled: () => !P.value,
      selectable: j,
      dragHandle: () => O.dragHandle,
      onStart(y) {
        E.dragStart(y);
      },
      onDrag(y) {
        E.drag(y);
      },
      onStop(y) {
        E.dragStop(y);
      },
      onClick(y) {
        v(y);
      }
    }), se = de(() => O.class instanceof Function ? O.class(O) : O.class), _e = de(() => {
      const y = (O.style instanceof Function ? O.style(O) : O.style) || {}, b = O.width instanceof Function ? O.width(O) : O.width, I = O.height instanceof Function ? O.height(O) : O.height;
      return !y.width && b && (y.width = typeof b == "string" ? b : `${b}px`), !y.height && I && (y.height = typeof I == "string" ? I : `${I}px`), y;
    }), W = ze(() => Number(O.zIndex ?? _e.value.zIndex ?? 0));
    return c((y) => {
      (y.includes(e.id) || !y.length) && we();
    }), ht(() => {
      Se(
        () => O.hidden,
        (y = !1, b, I) => {
          !y && T.value && (e.resizeObserver.observe(T.value), I(() => {
            T.value && e.resizeObserver.unobserve(T.value);
          }));
        },
        { immediate: !0, flush: "post" }
      );
    }), Se([() => O.type, () => O.sourcePosition, () => O.targetPosition], () => {
      Ze(() => {
        u([{ id: e.id, nodeElement: T.value, forceUpdate: !0 }]);
      });
    }), Se(
      [
        () => O.position.x,
        () => O.position.y,
        () => {
          var y;
          return (y = R.value) == null ? void 0 : y.computedPosition.x;
        },
        () => {
          var y;
          return (y = R.value) == null ? void 0 : y.computedPosition.y;
        },
        () => {
          var y;
          return (y = R.value) == null ? void 0 : y.computedPosition.z;
        },
        W,
        () => O.selected,
        () => O.dimensions.height,
        () => O.dimensions.width,
        () => {
          var y;
          return (y = R.value) == null ? void 0 : y.dimensions.height;
        },
        () => {
          var y;
          return (y = R.value) == null ? void 0 : y.dimensions.width;
        }
      ],
      ([y, b, I, B, U, S]) => {
        const J = {
          x: y,
          y: b,
          z: S + (g.value && O.selected ? 1e3 : 0)
        };
        typeof I < "u" && typeof B < "u" ? O.computedPosition = sE({ x: I, y: B, z: U }, J) : O.computedPosition = J;
      },
      { flush: "post", immediate: !0 }
    ), Se([() => O.extent, p], ([y, b], [I, B]) => {
      (y !== I || b !== B) && he();
    }), O.extent === "parent" || typeof O.extent == "object" && "range" in O.extent && O.extent.range === "parent" ? ns(() => ce).toBe(!0).then(he) : he(), () => O.hidden ? null : Ie(
      "div",
      {
        ref: T,
        "data-id": O.id,
        class: [
          "vue-flow__node",
          `vue-flow__node-${te.value === !1 ? "default" : O.type || "default"}`,
          {
            [n.value]: P.value,
            dragging: ae == null ? void 0 : ae.value,
            draggable: P.value,
            selected: O.selected,
            selectable: j.value,
            parent: O.isParent
          },
          se.value
        ],
        style: {
          visibility: ce.value ? "visible" : "hidden",
          zIndex: O.computedPosition.z ?? W.value,
          transform: `translate(${O.computedPosition.x}px,${O.computedPosition.y}px)`,
          pointerEvents: oe.value ? "all" : "none",
          ..._e.value
        },
        tabIndex: ee.value ? 0 : void 0,
        role: ee.value ? "button" : void 0,
        "aria-describedby": _.value ? void 0 : `${hd}-${t}`,
        "aria-label": O.ariaLabel,
        onMouseenter: pe,
        onMousemove: ge,
        onMouseleave: Y,
        onContextmenu: d,
        onClick: v,
        onDblclick: k,
        onKeydown: m
      },
      [
        Ie(te.value === !1 ? f.value.default : te.value, {
          id: O.id,
          type: O.type,
          data: O.data,
          events: { ...O.events, ...A },
          selected: O.selected,
          resizing: O.resizing,
          dragging: ae.value,
          connectable: q.value,
          position: O.computedPosition,
          dimensions: O.dimensions,
          isValidTargetPos: O.isValidTargetPos,
          isValidSourcePos: O.isValidSourcePos,
          parent: O.parentNode,
          parentNodeId: O.parentNode,
          zIndex: O.computedPosition.z ?? W.value,
          targetPosition: O.targetPosition,
          sourcePosition: O.sourcePosition,
          label: O.label,
          dragHandle: O.dragHandle,
          onUpdateNodeInternals: we
        })
      ]
    );
    function he() {
      const y = O.computedPosition, { computedPosition: b, position: I } = Ys(
        O,
        $.value ? nr(y, M.value) : y,
        s.error,
        p.value,
        R.value
      );
      (O.computedPosition.x !== b.x || O.computedPosition.y !== b.y) && (O.computedPosition = { ...O.computedPosition, ...b }), (O.position.x !== I.x || O.position.y !== I.y) && (O.position = I);
    }
    function we() {
      T.value && u([{ id: e.id, nodeElement: T.value, forceUpdate: !0 }]);
    }
    function pe(y) {
      ae != null && ae.value || E.mouseEnter({ event: y, node: O });
    }
    function ge(y) {
      ae != null && ae.value || E.mouseMove({ event: y, node: O });
    }
    function Y(y) {
      ae != null && ae.value || E.mouseLeave({ event: y, node: O });
    }
    function d(y) {
      return E.contextMenu({ event: y, node: O });
    }
    function k(y) {
      return E.doubleClick({ event: y, node: O });
    }
    function v(y) {
      j.value && (!o.value || !P.value || D.value > 0) && vs(
        O,
        r.value,
        a,
        l,
        i,
        !1,
        T.value
      ), E.click({ event: y, node: O });
    }
    function m(y) {
      if (!(fs(y) || _.value))
        if (vd.includes(y.key) && j.value) {
          const b = y.key === "Escape";
          vs(
            O,
            r.value,
            a,
            l,
            i,
            b,
            T.value
          );
        } else P.value && O.selected && qn[y.key] && (y.preventDefault(), C.value = `Moved selected node ${y.key.replace("Arrow", "").toLowerCase()}. New position, x: ${~~O.position.x}, y: ${~~O.position.y}`, Z(
          {
            x: qn[y.key].x,
            y: qn[y.key].y
          },
          y.shiftKey
        ));
    }
  }
}), Gx = jx;
function Yx(e = { includeHiddenNodes: !1 }) {
  const { nodes: t } = Be();
  return de(() => {
    if (t.value.length === 0)
      return !1;
    for (const n of t.value)
      if ((e.includeHiddenNodes || !n.hidden) && ((n == null ? void 0 : n.handleBounds) === void 0 || n.dimensions.width === 0 || n.dimensions.height === 0))
        return !1;
    return !0;
  });
}
const Xx = { class: "vue-flow__nodes vue-flow__container" }, qx = {
  name: "Nodes",
  compatConfig: { MODE: 3 }
}, Wx = /* @__PURE__ */ Oe({
  ...qx,
  setup(e) {
    const { getNodes: t, updateNodeDimensions: n, emits: o } = Be(), i = Yx(), r = ie();
    return Se(
      i,
      (s) => {
        s && Ze(() => {
          o.nodesInitialized(t.value);
        });
      },
      { immediate: !0 }
    ), ht(() => {
      r.value = new ResizeObserver((s) => {
        const l = s.map((a) => ({
          id: a.target.getAttribute("data-id"),
          nodeElement: a.target,
          forceUpdate: !0
        }));
        Ze(() => n(l));
      });
    }), gn(() => {
      var s;
      return (s = r.value) == null ? void 0 : s.disconnect();
    }), (s, l) => (G(), X("div", Xx, [
      r.value ? (G(!0), X(ye, { key: 0 }, Le(F(t), (a, u, c, f) => {
        const p = [a.id];
        if (f && f.key === a.id && zh(f, p))
          return f;
        const g = (G(), gt(F(Gx), {
          id: a.id,
          key: a.id,
          "resize-observer": r.value
        }, null, 8, ["id", "resize-observer"]));
        return g.memo = p, g;
      }, l, 0), 128)) : ke("", !0)
    ]));
  }
});
function Kx() {
  const { emits: e } = Be();
  ht(() => {
    if (Id()) {
      const t = document.querySelector(".vue-flow__pane");
      t && window.getComputedStyle(t).zIndex !== "1" && e.error(new We(Ye.MISSING_STYLES));
    }
  });
}
const Zx = /* @__PURE__ */ h("div", { class: "vue-flow__edge-labels" }, null, -1), Jx = {
  name: "VueFlow",
  compatConfig: { MODE: 3 }
}, Qx = /* @__PURE__ */ Oe({
  ...Jx,
  props: {
    id: {},
    modelValue: {},
    nodes: {},
    edges: {},
    edgeTypes: {},
    nodeTypes: {},
    connectionMode: {},
    connectionLineType: {},
    connectionLineStyle: { default: void 0 },
    connectionLineOptions: { default: void 0 },
    connectionRadius: {},
    isValidConnection: { type: [Function, null], default: void 0 },
    deleteKeyCode: { default: void 0 },
    selectionKeyCode: { type: [Boolean, null], default: void 0 },
    multiSelectionKeyCode: { default: void 0 },
    zoomActivationKeyCode: { default: void 0 },
    panActivationKeyCode: { default: void 0 },
    snapToGrid: { type: Boolean, default: void 0 },
    snapGrid: {},
    onlyRenderVisibleElements: { type: Boolean, default: void 0 },
    edgesUpdatable: { type: [Boolean, String], default: void 0 },
    nodesDraggable: { type: Boolean, default: void 0 },
    nodesConnectable: { type: Boolean, default: void 0 },
    nodeDragThreshold: {},
    elementsSelectable: { type: Boolean, default: void 0 },
    selectNodesOnDrag: { type: Boolean, default: void 0 },
    panOnDrag: { type: [Boolean, Array], default: void 0 },
    minZoom: {},
    maxZoom: {},
    defaultViewport: {},
    translateExtent: {},
    nodeExtent: {},
    defaultMarkerColor: {},
    zoomOnScroll: { type: Boolean, default: void 0 },
    zoomOnPinch: { type: Boolean, default: void 0 },
    panOnScroll: { type: Boolean, default: void 0 },
    panOnScrollSpeed: {},
    panOnScrollMode: {},
    paneClickDistance: {},
    zoomOnDoubleClick: { type: Boolean, default: void 0 },
    preventScrolling: { type: Boolean, default: void 0 },
    selectionMode: {},
    edgeUpdaterRadius: {},
    fitViewOnInit: { type: Boolean, default: void 0 },
    connectOnClick: { type: Boolean, default: void 0 },
    applyDefault: { type: Boolean, default: void 0 },
    autoConnect: { type: [Boolean, Function], default: void 0 },
    noDragClassName: {},
    noWheelClassName: {},
    noPanClassName: {},
    defaultEdgeOptions: {},
    elevateEdgesOnSelect: { type: Boolean, default: void 0 },
    elevateNodesOnSelect: { type: Boolean, default: void 0 },
    disableKeyboardA11y: { type: Boolean, default: void 0 },
    edgesFocusable: { type: Boolean, default: void 0 },
    nodesFocusable: { type: Boolean, default: void 0 },
    autoPanOnConnect: { type: Boolean, default: void 0 },
    autoPanOnNodeDrag: { type: Boolean, default: void 0 },
    autoPanSpeed: {}
  },
  emits: ["nodesChange", "edgesChange", "nodesInitialized", "paneReady", "init", "updateNodeInternals", "error", "connect", "connectStart", "connectEnd", "clickConnectStart", "clickConnectEnd", "moveStart", "move", "moveEnd", "selectionDragStart", "selectionDrag", "selectionDragStop", "selectionContextMenu", "selectionStart", "selectionEnd", "viewportChangeStart", "viewportChange", "viewportChangeEnd", "paneScroll", "paneClick", "paneContextMenu", "paneMouseEnter", "paneMouseMove", "paneMouseLeave", "edgeUpdate", "edgeContextMenu", "edgeMouseEnter", "edgeMouseMove", "edgeMouseLeave", "edgeDoubleClick", "edgeClick", "edgeUpdateStart", "edgeUpdateEnd", "nodeContextMenu", "nodeMouseEnter", "nodeMouseMove", "nodeMouseLeave", "nodeDoubleClick", "nodeClick", "nodeDragStart", "nodeDrag", "nodeDragStop", "miniMapNodeClick", "miniMapNodeDoubleClick", "miniMapNodeMouseEnter", "miniMapNodeMouseMove", "miniMapNodeMouseLeave", "update:modelValue", "update:nodes", "update:edges"],
  setup(e, { expose: t, emit: n }) {
    const o = e, i = Qf(), r = Sr(o, "modelValue", n), s = Sr(o, "nodes", n), l = Sr(o, "edges", n), a = Be(o), u = IE({ modelValue: r, nodes: s, edges: l }, o, a);
    return TE(n, a.hooks), $x(), Kx(), On(ir, i), Ui(() => {
      u();
    }), t(a), (c, f) => (G(), X("div", {
      ref: F(a).vueFlowRef,
      class: "vue-flow"
    }, [
      re(Ex, null, {
        default: cn(() => [
          re(Ux),
          Zx,
          re(Wx),
          In(c.$slots, "zoom-pane")
        ]),
        _: 3
      }),
      In(c.$slots, "default"),
      re(Nx)
    ], 512));
  }
}), ek = { class: "graph-node-head" }, tk = {
  key: 0,
  class: "level-tag"
}, nk = ["aria-pressed", "aria-label"], Lr = /* @__PURE__ */ Oe({
  __name: "GraphNodeCard",
  props: {
    data: {},
    selected: { type: Boolean }
  },
  emits: ["toggle"],
  setup(e, { emit: t }) {
    const n = e, o = t, i = { persona: gp, profile: Jr, memory: mp, rag: wp, voice: kp, live2d: Mp, extensions: Ep, skill: $p, tool: Pp, mcp: Np }, r = !!n.data.configurable && n.data.level > 0;
    return (s, l) => (G(), X("article", {
      class: xe(["graph-node", [`kind-${s.data.kind}`, `status-${s.data.status}`, { selected: s.selected }]])
    }, [
      re(F(dn), {
        id: "left-target",
        type: "target",
        position: F(fe).Left,
        class: "graph-handle"
      }, null, 8, ["position"]),
      re(F(dn), {
        id: "left-source",
        type: "source",
        position: F(fe).Left,
        class: "graph-handle"
      }, null, 8, ["position"]),
      re(F(dn), {
        id: "right-target",
        type: "target",
        position: F(fe).Right,
        class: "graph-handle"
      }, null, 8, ["position"]),
      re(F(dn), {
        id: "right-source",
        type: "source",
        position: F(fe).Right,
        class: "graph-handle"
      }, null, 8, ["position"]),
      h("div", ek, [
        (G(), gt(Mu(i[s.data.kind]), { size: 16 })),
        h("b", null, Q(s.data.label), 1),
        s.data.kind === "skill" || s.data.kind === "tool" ? (G(), X("span", tk, "L" + Q(s.data.level), 1)) : ke("", !0)
      ]),
      h("p", null, Q(s.data.summary), 1),
      h("footer", null, [
        h("span", null, Q(s.data.status === "available" ? "可用" : s.data.status === "unassigned" ? "未分配" : s.data.status === "partial" ? "部分可用" : "不可用"), 1),
        F(r) ? (G(), X("button", {
          key: 0,
          type: "button",
          class: xe(["graph-switch", { on: s.data.assigned }]),
          "aria-pressed": !!s.data.assigned,
          "aria-label": `${s.data.label}能力开关`,
          onClick: l[0] || (l[0] = Io((a) => o("toggle"), ["stop"]))
        }, l[1] || (l[1] = [
          h("i", null, null, -1)
        ]), 10, nk)) : ke("", !0)
      ])
    ], 2));
  }
}), ok = /* @__PURE__ */ Oe({
  __name: "BraceEdge",
  props: {
    sourceX: {},
    sourceY: {},
    targetX: {},
    targetY: {},
    selected: { type: Boolean }
  },
  setup(e) {
    const t = e, n = de(() => {
      const o = t.targetX >= t.sourceX ? 1 : -1, i = Math.abs(t.targetX - t.sourceX), r = Math.min(86, i * 0.34), s = (t.sourceX + t.targetX) / 2, l = (t.sourceY + t.targetY) / 2;
      return `M ${t.sourceX} ${t.sourceY} C ${t.sourceX + o * r} ${t.sourceY}, ${s} ${t.sourceY}, ${s} ${l} C ${s} ${t.targetY}, ${t.targetX - o * r} ${t.targetY}, ${t.targetX} ${t.targetY}`;
    });
    return (o, i) => (G(), gt(F(jo), {
      path: n.value,
      class: xe({ selected: o.selected })
    }, null, 8, ["path", "class"]));
  }
}), ik = {
  class: "graph-stage",
  "aria-label": "角色能力架构画布"
}, rk = {
  class: "graph-tools",
  "aria-label": "画布工具"
}, sk = /* @__PURE__ */ Oe({
  __name: "RoleGraphCanvas",
  props: {
    graph: {},
    selectedNodeId: {}
  },
  emits: ["select", "toggle", "reset"],
  setup(e, { emit: t }) {
    const n = e, o = t, i = ie([]), r = ie([]), { fitView: s, zoomIn: l, zoomOut: a } = Be({ id: "role-architecture" }), u = ie(!1);
    function c() {
      return new Promise((x) => requestAnimationFrame(() => requestAnimationFrame(() => x())));
    }
    function f(x) {
      const w = /* @__PURE__ */ new Set([x]), H = [x];
      for (; H.length; ) {
        const L = H.shift();
        for (const z of r.value)
          z.source !== L || w.has(z.target) || (w.add(z.target), H.push(z.target));
      }
      return w;
    }
    function p(x) {
      var L;
      let w = x;
      const H = /* @__PURE__ */ new Set();
      for (; !H.has(w); ) {
        H.add(w);
        const z = (L = r.value.find((T) => T.target === w)) == null ? void 0 : L.source;
        if (!z) return;
        if (z === "module:extensions") return w;
        w = z;
      }
    }
    async function g(x, w) {
      !u.value || !x.length || (await Ze(), await c(), await s({ nodes: x, ...w }));
    }
    function _(x = 220) {
      const w = i.value.filter((H) => H.data.kind === "persona" || ["profile", "memory", "rag", "voice", "live2d", "extensions"].includes(H.data.kind));
      return g(w.map((H) => H.id), { padding: 0.18, minZoom: 0.68, maxZoom: 1.08, duration: x });
    }
    function C(x = 220) {
      if (n.selectedNodeId === "module:extensions") {
        const H = i.value.filter((L) => L.id === "module:extensions" || ["skill", "tool"].includes(L.data.kind));
        return g(H.map((L) => L.id), { padding: 0.16, minZoom: 0.38, maxZoom: 0.86, duration: x });
      }
      const w = p(n.selectedNodeId);
      if (w) {
        const H = f(w);
        return H.add("module:extensions"), g([...H], { padding: 0.24, minZoom: 0.58, maxZoom: 1, duration: x });
      }
      return _(x);
    }
    Se(() => n.graph, async (x) => {
      i.value = x.nodes.map((w) => ({ ...w, selected: w.id === n.selectedNodeId })), r.value = x.edges.map((w) => ({ ...w, type: "brace", animated: !1 })), await Ze(), await C();
    }, { immediate: !0, deep: !0 }), Se(() => n.selectedNodeId, (x) => i.value = i.value.map((w) => ({ ...w, selected: w.id === x })));
    function $(x) {
      o("select", x.node.id);
    }
    async function M() {
      o("reset"), await Ze(), _();
    }
    async function D() {
      u.value = !0, await C(0);
    }
    return (x, w) => (G(), X("section", ik, [
      h("div", rk, [
        h("button", {
          type: "button",
          title: "放大",
          onClick: w[0] || (w[0] = () => F(l)())
        }, [
          re(F(co), { size: 16 })
        ]),
        h("button", {
          type: "button",
          title: "缩小",
          onClick: w[1] || (w[1] = () => F(a)())
        }, [
          re(F(Sp), { size: 16 })
        ]),
        h("button", {
          type: "button",
          title: "适应视图",
          onClick: w[2] || (w[2] = (H) => F(s)({ padding: 0.15, duration: 220 }))
        }, [
          re(F(xp), { size: 16 })
        ]),
        h("button", {
          type: "button",
          title: "恢复自动布局",
          onClick: M
        }, [
          re(F(ac), { size: 16 })
        ])
      ]),
      re(F(Qx), {
        id: "role-architecture",
        nodes: i.value,
        "onUpdate:nodes": w[3] || (w[3] = (H) => i.value = H),
        edges: r.value,
        "onUpdate:edges": w[4] || (w[4] = (H) => r.value = H),
        "min-zoom": 0.32,
        "max-zoom": 1.8,
        "fit-view-on-init": !1,
        onInit: D,
        onNodeClick: $
      }, {
        "node-persona": cn((H) => [
          re(Lr, ur(ci(H)), null, 16)
        ]),
        "node-module": cn((H) => [
          re(Lr, ur(ci(H)), null, 16)
        ]),
        "node-capability": cn((H) => [
          re(Lr, Ds(H, {
            onToggle: (L) => o("toggle", H.id)
          }), null, 16, ["onToggle"])
        ]),
        "edge-brace": cn((H) => [
          re(ok, ur(ci(H)), null, 16)
        ]),
        _: 1
      }, 8, ["nodes", "edges"])
    ]));
  }
}), lk = ["disabled", "aria-expanded"], ak = {
  key: 0,
  id: "manage-role-menu",
  class: "role-picker-menu"
}, uk = { class: "role-search" }, ck = {
  class: "role-list",
  role: "listbox",
  "aria-label": "选择角色"
}, dk = ["aria-selected", "disabled", "onClick"], fk = {
  key: 0,
  class: "role-empty"
}, hk = /* @__PURE__ */ Oe({
  __name: "RoleNavigator",
  props: {
    personas: {},
    selectedId: {},
    disabled: { type: Boolean }
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const n = e, o = t, i = ie(null), r = ie(null), s = ie(!1), l = ie(""), a = de(() => n.personas.filter((_) => _.name.toLowerCase().includes(l.value.trim().toLowerCase()))), u = de(() => n.personas.find((_) => _.id === n.selectedId));
    async function c() {
      n.disabled || (s.value = !s.value, s.value && await Ze(() => {
        var _;
        return (_ = r.value) == null ? void 0 : _.focus();
      }));
    }
    function f(_) {
      o("select", _), s.value = !1, l.value = "";
    }
    function p(_) {
      var C;
      (C = i.value) != null && C.contains(_.target) || (s.value = !1);
    }
    function g(_) {
      _.key === "Escape" && (s.value = !1);
    }
    return Se(() => n.disabled, (_) => {
      _ && (s.value = !1);
    }), ht(() => {
      document.addEventListener("pointerdown", p), document.addEventListener("keydown", g);
    }), gn(() => {
      document.removeEventListener("pointerdown", p), document.removeEventListener("keydown", g);
    }), (_, C) => {
      var $;
      return G(), X("div", {
        ref_key: "root",
        ref: i,
        class: "role-picker"
      }, [
        h("button", {
          type: "button",
          class: "role-picker-trigger",
          disabled: _.disabled || !_.personas.length,
          "aria-haspopup": "listbox",
          "aria-expanded": s.value,
          "aria-controls": "manage-role-menu",
          onClick: c
        }, [
          re(F(Jr), { size: 17 }),
          h("strong", null, Q((($ = u.value) == null ? void 0 : $.name) || "角色管理"), 1),
          re(F(_p), { size: 15 })
        ], 8, lk),
        s.value ? (G(), X("div", ak, [
          h("label", uk, [
            re(F(Kr), { size: 15 }),
            je(h("input", {
              ref_key: "searchInput",
              ref: r,
              "onUpdate:modelValue": C[0] || (C[0] = (M) => l.value = M),
              placeholder: "查找角色",
              "aria-label": "查找角色"
            }, null, 512), [
              [it, l.value]
            ])
          ]),
          h("div", ck, [
            (G(!0), X(ye, null, Le(a.value, (M) => {
              var D;
              return G(), X("button", {
                key: M.id,
                type: "button",
                role: "option",
                "aria-selected": M.id === _.selectedId,
                disabled: _.disabled,
                class: xe({ active: M.id === _.selectedId }),
                onClick: (x) => f(M.id)
              }, [
                re(F(Jr), { size: 17 }),
                h("span", null, [
                  h("b", null, Q(M.name), 1),
                  h("small", null, Q(((D = M.profile) == null ? void 0 : D.description) || "尚未填写人设"), 1)
                ])
              ], 10, dk);
            }), 128)),
            a.value.length ? ke("", !0) : (G(), X("p", fk, "没有匹配的角色"))
          ])
        ])) : ke("", !0)
      ], 512);
    };
  }
});
function pk(e, t, n) {
  const o = {
    ...e,
    capabilities: {
      ...e.capabilities,
      overrides: { ...e.capabilities.overrides }
    },
    grants: { servers: e.grants.servers.map((s) => ({ ...s })) }
  }, i = e.capabilities.packages.find((s) => s.id === t);
  if (!i || (n === "inherit" ? delete o.capabilities.overrides[t] : o.capabilities.overrides[t] = n === "allow", n !== "allow")) return o;
  for (const s of i.dependencies)
    s.id && (o.capabilities.overrides[s.id] = !0);
  const r = new Set(i.required_servers);
  return o.grants.servers.forEach((s) => {
    !s.global && r.has(s.name) && (s.authorized = !0);
  }), o;
}
async function vk(e) {
  const t = Object.entries(e), n = await Promise.all(t.map(async ([o, i]) => {
    try {
      return await i(), { domain: o, ok: !0 };
    } catch (r) {
      return { domain: o, ok: !1, message: r instanceof Error ? r.message : String(r) };
    }
  }));
  return {
    ok: n.every((o) => o.ok),
    savedDomains: n.filter((o) => o.ok).map((o) => o.domain),
    failedDomains: n.filter((o) => !o.ok).map(({ domain: o, message: i }) => ({ domain: o, message: i }))
  };
}
function gk(e, t, n) {
  const o = qe(e);
  return n.has("profile") && (o.persona = qe(t.persona)), n.has("capabilities") && (o.capabilities.overrides = qe(t.capabilities.overrides)), n.has("grants") && (o.grants.servers = qe(t.grants.servers)), o;
}
function mk() {
  const e = ie([]), t = ie(""), n = ie(null), o = ie(null), i = ie(""), r = ie(/* @__PURE__ */ new Set()), s = ie(!1), l = ie(!1), a = ie(!1), u = ie(""), c = ie(""), f = de(() => r.value.size > 0);
  async function p() {
    if (!s.value) {
      s.value = !0, u.value = "";
      try {
        e.value = await yr();
        const R = t.value || sessionStorage.getItem("yumeno.manage.persona"), E = e.value.find((A) => A.id === R) || e.value[0];
        E && await _(E.id, !0);
      } catch (R) {
        u.value = R instanceof Error ? R.message : String(R);
      } finally {
        s.value = !1;
      }
    }
  }
  async function g() {
    f.value || s.value || l.value || a.value || await p();
  }
  async function _(R, E = !1) {
    if (!E && (l.value || a.value)) {
      c.value = "当前操作完成后才能切换角色";
      return;
    }
    if (!E && f.value && !window.confirm("当前角色有未保存修改，放弃后切换角色？")) return;
    const A = e.value.find((P) => P.id === R);
    if (A) {
      s.value = !0, u.value = "", c.value = "";
      try {
        const P = await Pl(A);
        n.value = P, o.value = qe(P), t.value = R, i.value = `persona:${R}`, r.value = /* @__PURE__ */ new Set(), sessionStorage.setItem("yumeno.manage.persona", R);
      } catch (P) {
        u.value = P instanceof Error ? P.message : String(P);
      } finally {
        s.value = !1;
      }
    }
  }
  function C(R) {
    i.value = R;
  }
  function $(R) {
    o.value && (o.value.persona = qe(R), r.value = new Set(r.value).add("profile"));
  }
  function M(R, E) {
    if (!o.value) return;
    o.value = pk(o.value, R, E);
    const A = new Set(r.value);
    A.add("capabilities"), A.add("grants"), r.value = A;
  }
  function D(R, E) {
    if (!o.value) return;
    const A = o.value.grants.servers.find((P) => P.name === R);
    A && !A.global && (A.authorized = E), r.value = new Set(r.value).add("grants");
  }
  function x() {
    n.value && (o.value = qe(n.value), r.value = /* @__PURE__ */ new Set(), c.value = "已撤销本轮修改");
  }
  async function w() {
    if (!o.value || !n.value) return;
    const R = await uc(o.value.persona.id);
    o.value.documents = R, n.value.documents = qe(R);
  }
  async function H() {
    if (!(!o.value || !n.value || a.value)) {
      a.value = !0, u.value = "", c.value = "正在扫描 Live2D 模型...";
      try {
        const R = await cc();
        o.value.resources = { ...o.value.resources || { voiceAssets: [], live2dModels: [] }, live2dModels: R }, n.value.resources = { ...n.value.resources || { voiceAssets: [], live2dModels: [] }, live2dModels: qe(R) }, c.value = `已发现 ${R.length} 个 Live2D 模型`;
      } catch (R) {
        u.value = R instanceof Error ? R.message : String(R);
      } finally {
        a.value = !1;
      }
    }
  }
  async function L() {
    if (!a.value) {
      a.value = !0, u.value = "";
      try {
        await Dp(), c.value = "已打开 Live2D 模型文件夹";
      } catch (R) {
        u.value = R instanceof Error ? R.message : String(R);
      } finally {
        a.value = !1;
      }
    }
  }
  function z(R, E = 10) {
    E <= 0 || window.setTimeout(async () => {
      var A;
      if (((A = o.value) == null ? void 0 : A.persona.id) === R)
        try {
          await w(), o.value.documents.some((j) => ["converting", "preview_ready", "indexing"].includes(String(j.status))) && z(R, E - 1);
        } catch {
        }
    }, 1400);
  }
  async function T(R, E) {
    if (!o.value || !R.length && !E.trim() || a.value) return !1;
    a.value = !0, u.value = "", c.value = "正在写入角色知识库...";
    try {
      const A = o.value.persona.id;
      return await zp(o.value.persona, R, E), await w(), z(A), c.value = "资料已提交，正在建立索引", !0;
    } catch (A) {
      return u.value = A instanceof Error ? A.message : String(A), !1;
    } finally {
      a.value = !1;
    }
  }
  async function N(R) {
    a.value = !0, u.value = "";
    try {
      await Bp(R), await w(), c.value = "资料已删除";
    } catch (E) {
      u.value = E instanceof Error ? E.message : String(E);
    } finally {
      a.value = !1;
    }
  }
  async function V(R) {
    var E;
    a.value = !0, u.value = "";
    try {
      const A = ((E = o.value) == null ? void 0 : E.persona.id) || "";
      await Fp(R), await w(), A && z(A), c.value = "已重新提交索引";
    } catch (A) {
      u.value = A instanceof Error ? A.message : String(A);
    } finally {
      a.value = !1;
    }
  }
  async function Z() {
    if (o.value) {
      a.value = !0, u.value = "";
      try {
        const R = o.value.persona.id;
        await Vp(R), e.value = (await yr()).filter((E) => E.id !== R), n.value = null, o.value = null, t.value = "", r.value = /* @__PURE__ */ new Set(), e.value[0] && await _(e.value[0].id, !0), c.value = "角色已删除";
      } catch (R) {
        u.value = R instanceof Error ? R.message : String(R);
      } finally {
        a.value = !1;
      }
    }
  }
  async function O() {
    if (!o.value || !f.value) return;
    l.value = !0, u.value = "", c.value = "";
    const R = qe(o.value), E = {};
    r.value.has("profile") && (E.profile = () => Ap(R.persona)), r.value.has("capabilities") && (E.capabilities = () => Rp(R.persona.id, R.capabilities.overrides)), r.value.has("grants") && (E.grants = () => Lp(R.persona.id, R.grants.servers));
    const A = await vk(E), P = new Set(A.failedDomains.map((j) => j.domain));
    if (r.value = P, A.savedDomains.length)
      try {
        e.value = await yr();
        const j = e.value.find((ee) => ee.id === R.persona.id) || R.persona, q = await Pl(j);
        n.value = q, o.value = gk(q, R, P);
      } catch (j) {
        const q = qe(n.value || R);
        A.savedDomains.includes("profile") && (q.persona = qe(R.persona)), A.savedDomains.includes("capabilities") && (q.capabilities.overrides = qe(R.capabilities.overrides)), A.savedDomains.includes("grants") && (q.grants.servers = qe(R.grants.servers)), n.value = q, o.value = R, u.value = `配置已保存，但刷新失败：${j instanceof Error ? j.message : String(j)}`;
      }
    A.ok ? c.value = "角色配置已保存" : u.value = A.failedDomains.map((j) => `${j.domain}: ${j.message}`).join("；"), l.value = !1;
  }
  return { personas: e, selectedPersonaId: t, snapshot: n, draft: o, selectedNodeId: i, dirtyDomains: r, loading: s, isSaving: l, operationPending: a, error: u, message: c, isDirty: f, initialize: p, refreshIfClean: g, selectPersona: _, selectNode: C, updateProfile: $, setCapability: M, setServer: D, discard: x, save: O, addDocuments: T, removeDocument: N, reindexDocument: V, refreshLive2dResources: H, openLive2dDirectory: L, removeCurrentPersona: Z };
}
const yk = { class: "workbench-toolbar" }, bk = { class: "toolbar-identity" }, _k = { class: "toolbar-actions" }, wk = {
  key: 0,
  class: "dirty-state"
}, Ek = ["disabled"], xk = ["disabled"], kk = {
  key: 0,
  class: "workbench-message error"
}, Sk = {
  key: 1,
  class: "workbench-message"
}, Ck = { class: "workbench-content" }, Nk = { class: "workbench-canvas-region" }, $k = {
  key: 0,
  class: "workbench-loading"
}, Mk = {
  key: 1,
  class: "workbench-empty"
}, Ik = /* @__PURE__ */ Oe({
  __name: "App",
  setup(e) {
    const t = mk(), n = ie(0), o = ie(0), i = de(() => t.isSaving.value || t.operationPending.value), r = de(() => t.draft.value ? Gp(t.draft.value) : { nodes: [], edges: [] }), s = de(() => (n.value, Zy(e0(r.value, t.selectedNodeId.value)))), l = de(() => r.value.nodes.find((L) => L.id === t.selectedNodeId.value));
    function a(L) {
      const z = s.value.nodes.find((T) => T.id === L);
      if (z != null && z.data.configurable) {
        if (z.data.kind === "mcp" && z.data.sourceId) {
          t.setServer(z.data.sourceId, !z.data.assigned);
          return;
        }
        t.setCapability(L, z.data.assigned ? "deny" : "allow");
      }
    }
    async function u() {
      var z, T, N;
      const L = (T = (z = t.draft.value) == null ? void 0 : z.persona.profile) == null ? void 0 : T.tts;
      if (L != null && L.voice_asset_id)
        try {
          const V = await Hp(L.voice_asset_id, L.output_language || "auto"), Z = new Audio(URL.createObjectURL(V)), O = (N = window.PL) == null ? void 0 : N.audio;
          O ? await O.play(Z) : await Z.play();
        } catch (V) {
          t.error.value = V instanceof Error ? V.message : String(V);
        }
    }
    function c() {
      var L;
      (L = document.querySelector('[data-view="voice"]')) == null || L.click();
    }
    function f() {
      var L;
      (L = document.querySelector('[data-view="test"]')) == null || L.click();
    }
    async function p() {
      var z;
      const L = (z = t.draft.value) == null ? void 0 : z.persona.name;
      !L || !window.confirm(`永久删除“${L}”及其资料、记忆、向量和对话？此操作无法恢复。`) || await t.removeCurrentPersona();
    }
    async function g(L) {
      window.confirm("从角色资料中删除该文件？知识库向量与本地文件将一并移除。") && await t.removeDocument(L);
    }
    async function _(L, z) {
      await t.addDocuments(L, z) && (o.value += 1);
    }
    function C(L, z) {
      var V, Z;
      const T = document.querySelector("#preview-title"), N = document.querySelector("#preview-content");
      !T || !N || (T.textContent = L, N.replaceChildren(typeof z == "string" ? document.createTextNode(z) : z), (V = document.querySelector("#preview-drawer")) == null || V.classList.add("is-open"), (Z = document.querySelector("#preview-backdrop")) == null || Z.classList.add("is-open"));
    }
    function $() {
      var L, z;
      (L = document.querySelector("#preview-drawer")) == null || L.classList.remove("is-open"), (z = document.querySelector("#preview-backdrop")) == null || z.classList.remove("is-open");
    }
    function M(L) {
      C(String(L.original_filename || L.original_name || "资料预览"), String(L.markdown_preview || L.error_message || "暂无预览内容"));
    }
    async function D(L) {
      if (L.type.startsWith("image/")) {
        const T = document.createElement("img"), N = URL.createObjectURL(L);
        T.src = N, T.alt = L.name, T.style.maxWidth = "100%", T.onload = () => URL.revokeObjectURL(N), C(L.name, T);
        return;
      }
      const z = L.type.startsWith("text/") || /\.(md|txt|json|csv|ya?ml)$/i.test(L.name);
      C(L.name, z ? await L.text() : "该文件将在上传转换后提供 Markdown 预览。");
    }
    function x(L) {
      t.isDirty.value && (L.preventDefault(), L.returnValue = "");
    }
    function w(L) {
      var T;
      const z = ((T = L == null ? void 0 : L.detail) == null ? void 0 : T.nodeId) || sessionStorage.getItem("yumeno.manage.node");
      z && (sessionStorage.removeItem("yumeno.manage.node"), t.selectNode(z));
    }
    async function H() {
      await t.refreshIfClean(), w();
    }
    return ht(async () => {
      var L, z, T;
      await t.initialize(), w(), window.addEventListener("beforeunload", x), (L = document.querySelector("#role-workbench-root")) == null || L.addEventListener("yumeno:manage-show", H), document.addEventListener("yumeno:manage-select-node", w), (z = document.querySelector("#close-preview")) == null || z.addEventListener("click", $), (T = document.querySelector("#preview-backdrop")) == null || T.addEventListener("click", $);
    }), gn(() => {
      var L, z, T;
      window.removeEventListener("beforeunload", x), (L = document.querySelector("#role-workbench-root")) == null || L.removeEventListener("yumeno:manage-show", H), document.removeEventListener("yumeno:manage-select-node", w), (z = document.querySelector("#close-preview")) == null || z.removeEventListener("click", $), (T = document.querySelector("#preview-backdrop")) == null || T.removeEventListener("click", $);
    }), (L, z) => (G(), X("div", {
      class: xe(["role-workbench", { "is-busy": i.value }])
    }, [
      h("header", yk, [
        h("div", bk, [
          re(hk, {
            personas: F(t).personas.value,
            "selected-id": F(t).selectedPersonaId.value,
            disabled: i.value,
            onSelect: F(t).selectPersona
          }, null, 8, ["personas", "selected-id", "disabled", "onSelect"]),
          z[3] || (z[3] = h("p", null, "角色运行架构与能力配置", -1))
        ]),
        h("div", _k, [
          F(t).isDirty.value ? (G(), X("span", wk, "存在未保存修改")) : ke("", !0),
          h("button", {
            type: "button",
            disabled: !F(t).isDirty.value || F(t).isSaving.value || F(t).operationPending.value,
            onClick: z[0] || (z[0] = //@ts-ignore
            (...T) => F(t).discard && F(t).discard(...T))
          }, [
            re(F(Tp), { size: 16 }),
            z[4] || (z[4] = Pe("撤销"))
          ], 8, Ek),
          h("button", {
            type: "button",
            class: "primary",
            disabled: !F(t).isDirty.value || F(t).isSaving.value || F(t).operationPending.value,
            onClick: z[1] || (z[1] = //@ts-ignore
            (...T) => F(t).save && F(t).save(...T))
          }, [
            re(F(Wr), { size: 16 }),
            Pe(Q(F(t).isSaving.value ? "保存中" : "保存配置"), 1)
          ], 8, xk)
        ])
      ]),
      F(t).error.value ? (G(), X("p", kk, Q(F(t).error.value), 1)) : F(t).message.value ? (G(), X("p", Sk, Q(F(t).message.value), 1)) : ke("", !0),
      h("div", Ck, [
        h("main", Nk, [
          F(t).loading.value ? (G(), X("div", $k, "正在读取角色架构...")) : F(t).personas.value.length ? (G(), gt(sk, {
            key: 2,
            graph: s.value,
            "selected-node-id": F(t).selectedNodeId.value,
            onSelect: F(t).selectNode,
            onToggle: a,
            onReset: z[2] || (z[2] = (T) => n.value++)
          }, null, 8, ["graph", "selected-node-id", "onSelect"])) : (G(), X("div", Mk, z[5] || (z[5] = [
            h("strong", null, "还没有角色", -1),
            h("p", null, "先在“创建角色”页面建立角色。", -1)
          ])))
        ]),
        F(t).draft.value ? (G(), gt(i1, {
          key: 0,
          node: l.value,
          draft: F(t).draft.value,
          disabled: i.value,
          "upload-complete-token": o.value,
          onProfile: F(t).updateProfile,
          onCapability: F(t).setCapability,
          onServer: F(t).setServer,
          onUpload: _,
          onDeleteDocument: g,
          onRetryDocument: F(t).reindexDocument,
          onDeletePersona: p,
          onPreviewVoice: u,
          onOpenVoiceStudio: c,
          onOpenRagEval: f,
          onPreviewDocument: M,
          onPreviewLocalFile: D,
          onRefreshLive2d: F(t).refreshLive2dResources,
          onOpenLive2dDirectory: F(t).openLive2dDirectory
        }, null, 8, ["node", "draft", "disabled", "upload-complete-token", "onProfile", "onCapability", "onServer", "onRetryDocument", "onRefreshLive2d", "onOpenLive2dDirectory"])) : ke("", !0)
      ])
    ], 2));
  }
});
let sn = null;
function D2(e = "#role-workbench-root") {
  if (sn) return sn;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("角色工作台挂载点不存在");
  return sn = Xi(Ik), sn.mount(t), sn;
}
function A2() {
  var e;
  (e = document.querySelector("#role-workbench-root")) == null || e.dispatchEvent(new CustomEvent("yumeno:manage-show"));
}
function R2() {
  sn && (sn.unmount(), sn = null);
}
async function Ve(e, t) {
  const n = await fetch(e, t), i = (n.headers.get("content-type") || "").includes("application/json") ? await n.json() : await n.text();
  if (!n.ok) {
    const r = typeof i == "object" && i && "detail" in i ? i.detail : i;
    throw new Error(typeof r == "string" ? r : `请求失败（${n.status}）`);
  }
  return i;
}
function rt(e) {
  return e instanceof Error ? e.message : String(e || "操作失败");
}
function Ok(e) {
  const t = e.skills || [], n = e.servers || [], o = e.tools || [], i = t.filter((a) => a.enabled).length, r = n.filter((a) => {
    var u;
    return a.enabled && ((u = a.status) == null ? void 0 : u.status) === "connected";
  }).length, s = n.filter((a) => {
    var u, c;
    return ((u = a.status) == null ? void 0 : u.status) === "error" || a.enabled && ((c = a.status) == null ? void 0 : c.status) !== "connected";
  }).length, l = t.filter((a) => !a.builtin && !a.trusted).length;
  return { enabledSkills: i, mcpOnline: r, mcpIssues: s, toolCount: o.length, attentionCount: s + l };
}
function Ga(e) {
  const t = {};
  for (const n of e.split(/\r?\n/)) {
    const o = n.trim();
    if (!o) continue;
    const i = o.indexOf("="), r = o.indexOf(":"), s = i > 0 && (r < 0 || i < r) ? i : r;
    s > 0 && (t[o.slice(0, s).trim()] = o.slice(s + 1).trim());
  }
  return t;
}
const Tk = { class: "yv-page extension-page" }, Pk = { class: "extension-hero" }, Dk = { class: "hero-actions" }, Ak = ["disabled"], Rk = {
  class: "signal-strip",
  "aria-label": "能力状态"
}, Lk = { class: "extension-tabs" }, Vk = ["onClick"], zk = {
  key: 1,
  class: "overview-layout"
}, Bk = { class: "overview-foot" }, Fk = {
  key: 0,
  class: "yv-empty"
}, Hk = { class: "quick-entry" }, Uk = {
  key: 2,
  class: "content-section"
}, jk = {
  key: 0,
  class: "yv-empty"
}, Gk = { class: "row-main" }, Yk = { class: "tag-line" }, Xk = { class: "row-actions" }, qk = ["title", "onClick"], Wk = ["onClick"], Kk = ["onClick"], Zk = ["onClick"], Jk = {
  key: 3,
  class: "content-section"
}, Qk = {
  key: 0,
  class: "yv-empty"
}, eS = { class: "row-main" }, tS = { class: "grant-field" }, nS = ["value", "onChange"], oS = { class: "row-actions" }, iS = ["onClick"], rS = ["onClick"], sS = ["onClick"], lS = {
  key: 4,
  class: "content-section"
}, aS = { class: "filter-input" }, uS = {
  key: 0,
  class: "yv-empty"
}, cS = { class: "row-main" }, dS = {
  key: 5,
  class: "content-section"
}, fS = { class: "catalog-tools" }, hS = { class: "filter-input" }, pS = { class: "catalog-grid" }, vS = { class: "tag-line" }, gS = ["disabled", "onClick"], mS = { class: "dialog-head" }, yS = { class: "yv-kicker" }, bS = { class: "yv-field" }, _S = ["readonly"], wS = { class: "yv-field" }, ES = { class: "yv-field" }, xS = { class: "yv-field" }, kS = { class: "tool-options" }, SS = ["value"], CS = {
  class: "yv-button primary",
  type: "submit"
}, NS = { class: "yv-field" }, $S = { class: "yv-field" }, MS = { class: "transport-tabs" }, IS = ["onClick"], OS = { class: "yv-field" }, TS = { class: "yv-field" }, PS = { class: "yv-field" }, DS = { class: "yv-field" }, AS = { class: "yv-field" }, RS = {
  class: "yv-button primary",
  type: "submit"
}, LS = { class: "dialog-head" }, VS = { class: "dialog-body" }, zS = { class: "catalog-detail" }, BS = /* @__PURE__ */ Oe({
  __name: "App",
  setup(e) {
    const t = [
      { id: "overview", label: "总览" },
      { id: "skills", label: "技能" },
      { id: "mcp", label: "MCP 服务" },
      { id: "tools", label: "工具目录" },
      { id: "catalog", label: "在线扩展" }
    ], n = Sn({ skills: [], servers: [], tools: [] }), o = ie("overview"), i = ie(!1), r = ie(""), s = ie(!1), l = ie(""), a = ie(null), u = ie("skill"), c = ie(null), f = ie(null), p = ie([]), g = ie(!1), _ = ie(""), C = ie("all"), $ = ie(null), M = ie([]), D = ie(null), x = Sn({ name: "", description: "", instructions: "", prompt_hint: "", tool_names: [] }), w = Sn({ name: "", description: "", transport: "stdio", command: "", args: "", env: "", url: "", headers: "" }), H = de(() => Ok(n)), L = de(() => {
      const Y = l.value.trim().toLowerCase();
      return n.tools.filter((d) => !Y || [d.name, d.server, d.description].some((k) => String(k || "").toLowerCase().includes(Y)));
    }), z = de(() => {
      const Y = _.value.trim().toLowerCase();
      return p.value.filter((d) => !Y || [d.id, d.name, d.description, ...d.categories || []].join(" ").toLowerCase().includes(Y));
    }), T = de(() => Object.entries(n.skills.reduce((Y, d) => {
      var v;
      const k = ((v = d.metadata) == null ? void 0 : v.category) || "其他";
      return (Y[k] || (Y[k] = [])).push(d), Y;
    }, {})).sort(([Y], [d]) => Y.localeCompare(d, "zh")));
    let N = 0;
    function V(Y, d = !1) {
      r.value = Y, s.value = d;
    }
    async function Z(Y = !1) {
      Y || (i.value = !0);
      try {
        const [d, k, v, m] = await Promise.all([
          Ve("/api/skills"),
          Ve("/api/mcp/servers"),
          Ve("/api/mcp/tools"),
          Ve("/api/skills/tools")
        ]);
        n.skills = d, n.servers = k, n.tools = v, M.value = m, Y || V("扩展状态已刷新");
      } catch (d) {
        V(rt(d), !0);
      } finally {
        i.value = !1;
      }
    }
    function O() {
      R(), N = window.setInterval(() => Z(!0), 3e4);
    }
    function R() {
      N && window.clearInterval(N), N = 0;
    }
    async function E() {
      await Z(!0), O();
    }
    function A() {
      D.value = null, Object.assign(x, { name: "", description: "", instructions: "", prompt_hint: "", tool_names: [] });
    }
    function P(Y) {
      A(), u.value = "skill", Y && (D.value = Y.name, Object.assign(x, { name: Y.name, description: Y.description || "", instructions: Y.instructions || "", prompt_hint: Y.prompt_hint || "", tool_names: [...Y.tool_names || []] })), Ze(() => {
        var d;
        return (d = a.value) == null ? void 0 : d.showModal();
      });
    }
    function j() {
      u.value = "mcp", Object.assign(w, { name: "", description: "", transport: "stdio", command: "", args: "", env: "", url: "", headers: "" }), Ze(() => {
        var Y;
        return (Y = a.value) == null ? void 0 : Y.showModal();
      });
    }
    async function q() {
      var Y;
      if (!x.name.trim() || !x.instructions.trim()) return V("名称与提示词不能为空", !0);
      i.value = !0;
      try {
        const d = { description: x.description.trim(), instructions: x.instructions.trim(), prompt_hint: x.prompt_hint.trim(), tool_names: x.tool_names };
        D.value ? await Ve(`/api/skills/${encodeURIComponent(D.value)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }) : await Ve("/api/skills", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: x.name.trim(), ...d }) }), (Y = a.value) == null || Y.close(), await Z(!0), V(D.value ? "技能修改已保存" : "技能已创建");
      } catch (d) {
        V(rt(d), !0);
      } finally {
        i.value = !1;
      }
    }
    async function ee(Y, d) {
      try {
        await Ve(`/api/skills/${encodeURIComponent(Y.name)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }), await Z(!0), V("技能状态已更新");
      } catch (k) {
        V(rt(k), !0);
      }
    }
    async function oe(Y) {
      if (confirm(`删除技能 ${Y.name}？`))
        try {
          await Ve(`/api/skills/${encodeURIComponent(Y.name)}`, { method: "DELETE" }), await Z(!0), V("技能已删除");
        } catch (d) {
          V(rt(d), !0);
        }
    }
    async function ce(Y) {
      var k;
      if (!Y) return;
      const d = new FormData();
      d.append("file", Y);
      try {
        const v = await Ve("/api/skills/upload", { method: "POST", body: d });
        await Z(!0), V((k = v.installed) != null && k.length ? `已安装：${v.installed.join("、")}` : "上传完成");
      } catch (v) {
        V(rt(v), !0);
      } finally {
        c.value && (c.value.value = "");
      }
    }
    async function te() {
      var Y;
      if (!w.name.trim()) return V("服务器名称不能为空", !0);
      try {
        await Ve("/api/mcp/servers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: w.name.trim(), description: w.description.trim(), transport: w.transport, command: w.command.trim(), args: w.args.split(/\r?\n/).map((d) => d.trim()).filter(Boolean), env: Ga(w.env), url: w.url.trim(), headers: Ga(w.headers), enabled: !0 }) }), (Y = a.value) == null || Y.close(), await Z(!0), V("MCP 服务已保存并连接");
      } catch (d) {
        V(rt(d), !0);
      }
    }
    async function ae(Y) {
      try {
        await Ve(`/api/mcp/servers/${encodeURIComponent(Y.name)}/${Y.enabled ? "disable" : "enable"}`, { method: "POST" }), await Z(!0);
      } catch (d) {
        V(rt(d), !0);
      }
    }
    async function se(Y) {
      V(`正在测试 ${Y.name}…`);
      try {
        const d = await Ve(`/api/mcp/servers/${encodeURIComponent(Y.name)}/test`, { method: "POST" });
        V(d.ok ? `${Y.name} 连接正常：${d.tool_count} 个工具，耗时 ${d.elapsed_ms}ms` : `${Y.name} 连接失败：${d.error}`, !d.ok), await Z(!0);
      } catch (d) {
        V(rt(d), !0);
      }
    }
    async function _e(Y, d) {
      const v = d.target.value.split(",").map((m) => m.trim()).filter(Boolean);
      try {
        await Ve(`/api/mcp/servers/${encodeURIComponent(Y.name)}/grants`, { method: "PATCH", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" }, body: JSON.stringify({ allowed_persona_ids: v }) }), V(`已更新 ${Y.name} 的授权`);
      } catch (m) {
        V(rt(m), !0);
      }
    }
    async function W(Y) {
      if (confirm(`删除 MCP 服务器 ${Y.name}？其工具将立即不可用。`))
        try {
          await Ve(`/api/mcp/servers/${encodeURIComponent(Y.name)}`, { method: "DELETE" }), await Z(!0), V("MCP 服务已删除");
        } catch (d) {
          V(rt(d), !0);
        }
    }
    async function he(Y = !1) {
      try {
        const d = await Ve(`/api/extensions/catalog?kind=${encodeURIComponent(C.value)}${Y ? "&refresh=true" : ""}`);
        p.value = d.items || [], g.value = !!d.stale;
      } catch {
        V("在线扩展目录暂时不可用，可稍后重试", !0), p.value = [];
      }
    }
    function we(Y) {
      return Y.kind === "skill" ? n.skills.some((d) => d.name === Y.id) : n.servers.some((d) => d.name === Y.id);
    }
    function pe(Y) {
      $.value = Y, Ze(() => {
        var d;
        return (d = f.value) == null ? void 0 : d.showModal();
      });
    }
    async function ge() {
      var d, k, v;
      const Y = $.value;
      if (Y)
        try {
          const m = await Ve(`/api/extensions/catalog/${encodeURIComponent(Y.id)}/install`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmed: !1 }) });
          if ((k = (d = m.preview) == null ? void 0 : d.conflicts) != null && k.length) throw new Error(m.preview.conflicts.join("；"));
          const y = await Ve(`/api/extensions/catalog/${encodeURIComponent(Y.id)}/install`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmed: !0 }) });
          if (y.status !== "installed") throw new Error(y.message || "安装未完成");
          await Z(!0), (v = f.value) == null || v.close(), V(Y.kind === "skill" ? "安装完成，请在技能页启用并信任" : "安装完成，请在 MCP 页启用并授权角色");
        } catch (m) {
          V(rt(m), !0);
        }
    }
    return ht(() => {
      const Y = document.querySelector("#extensions-app-root");
      Y == null || Y.addEventListener("yumeno:extensions-show", E), Y == null || Y.addEventListener("yumeno:extensions-hide", R), E();
    }), gn(() => R()), (Y, d) => {
      var k, v, m, y, b, I, B, U;
      return G(), X("main", Tk, [
        h("header", Pk, [
          d[26] || (d[26] = h("div", null, [
            h("span", { class: "yv-kicker" }, "Agent capability registry"),
            h("h1", null, "能力扩展"),
            h("p", null, "统一管理角色可调用的 Skill、Tool 与 MCP 服务。")
          ], -1)),
          h("div", Dk, [
            h("span", {
              class: xe(["yv-status", H.value.attentionCount ? "warn" : "ok"])
            }, Q(H.value.attentionCount ? `${H.value.attentionCount} 项待处理` : "运行正常"), 3),
            h("button", {
              class: "yv-button yv-icon-button",
              title: "刷新",
              disabled: i.value,
              onClick: d[0] || (d[0] = (S) => Z())
            }, [
              re(F(qr))
            ], 8, Ak)
          ])
        ]),
        h("section", Rk, [
          h("div", null, [
            d[27] || (d[27] = h("span", null, "已启用技能", -1)),
            h("strong", null, Q(H.value.enabledSkills), 1),
            h("small", null, "共 " + Q(n.skills.length) + " 个", 1)
          ]),
          h("div", null, [
            d[28] || (d[28] = h("span", null, "MCP 在线", -1)),
            h("strong", null, Q(H.value.mcpOnline), 1),
            h("small", null, Q(H.value.mcpIssues) + " 项异常", 1)
          ]),
          h("div", null, [
            d[29] || (d[29] = h("span", null, "已注册工具", -1)),
            h("strong", null, Q(H.value.toolCount), 1),
            d[30] || (d[30] = h("small", null, "统一工具注册表", -1))
          ]),
          h("div", null, [
            d[31] || (d[31] = h("span", null, "需要处理", -1)),
            h("strong", null, Q(H.value.attentionCount), 1),
            d[32] || (d[32] = h("small", null, "信任与连接状态", -1))
          ])
        ]),
        h("nav", Lk, [
          (G(), X(ye, null, Le(t, (S) => h("button", {
            key: S.id,
            class: xe({ active: o.value === S.id }),
            onClick: (J) => {
              o.value = S.id, S.id === "catalog" && he(!1);
            }
          }, Q(S.label), 11, Vk)), 64))
        ]),
        r.value ? (G(), X("p", {
          key: 0,
          class: xe(["extension-message", { error: s.value }]),
          role: "status"
        }, Q(r.value), 3)) : ke("", !0),
        o.value === "overview" ? (G(), X("section", zk, [
          d[37] || (d[37] = Ih('<div class="capability-line"><article><span>决策层</span><strong>Agent</strong><p>选择是否调用扩展能力</p></article><article class="skill"><span>指令层</span><strong>Skill</strong><p>按场景注入执行规则</p></article><article class="tool"><span>执行层</span><strong>Tool</strong><p>标准化系统动作</p></article><article class="mcp"><span>协议层</span><strong>MCP</strong><p>连接外部工具服务</p></article></div>', 1)),
          h("div", Bk, [
            h("div", null, [
              d[33] || (d[33] = h("h2", null, "当前连接", -1)),
              n.servers.length ? ke("", !0) : (G(), X("p", Fk, "尚未配置 MCP 服务")),
              (G(!0), X(ye, null, Le(n.servers, (S) => {
                var J, K, ne;
                return G(), X("div", {
                  key: S.name,
                  class: "health-row"
                }, [
                  h("strong", null, Q(S.name), 1),
                  h("span", null, Q(S.description || "外部工具服务"), 1),
                  h("em", {
                    class: xe(["yv-status", ((J = S.status) == null ? void 0 : J.status) === "connected" ? "ok" : "warn"])
                  }, Q(((K = S.status) == null ? void 0 : K.status) === "connected" ? `${S.status.tool_count} 个工具` : ((ne = S.status) == null ? void 0 : ne.status) === "error" ? "连接异常" : "未连接"), 3)
                ]);
              }), 128))
            ]),
            h("div", Hk, [
              d[36] || (d[36] = h("h2", null, "管理入口", -1)),
              h("button", {
                class: "yv-button primary",
                onClick: d[1] || (d[1] = (S) => P())
              }, [
                re(F(co)),
                d[34] || (d[34] = Pe("新增技能"))
              ]),
              h("button", {
                class: "yv-button",
                onClick: d[2] || (d[2] = (S) => j())
              }, [
                re(F(co)),
                d[35] || (d[35] = Pe("新增 MCP 服务"))
              ])
            ])
          ])
        ])) : o.value === "skills" ? (G(), X("section", Uk, [
          h("header", null, [
            d[40] || (d[40] = h("div", null, [
              h("span", { class: "yv-kicker" }, "Instruction packages"),
              h("h2", null, "技能"),
              h("p", null, "为 Agent 提供按需加载的规则与工具组合。")
            ], -1)),
            h("div", null, [
              h("input", {
                ref_key: "uploadInput",
                ref: c,
                hidden: "",
                type: "file",
                accept: ".zip",
                onChange: d[3] || (d[3] = (S) => {
                  var J;
                  return ce((J = S.target.files) == null ? void 0 : J[0]);
                })
              }, null, 544),
              h("button", {
                class: "yv-button",
                onClick: d[4] || (d[4] = (S) => {
                  var J;
                  return (J = c.value) == null ? void 0 : J.click();
                })
              }, [
                re(F(Zr)),
                d[38] || (d[38] = Pe("上传技能包"))
              ]),
              h("button", {
                class: "yv-button primary",
                onClick: d[5] || (d[5] = (S) => P())
              }, [
                re(F(co)),
                d[39] || (d[39] = Pe("新增技能"))
              ])
            ])
          ]),
          n.skills.length ? ke("", !0) : (G(), X("div", jk, "还没有技能")),
          (G(!0), X(ye, null, Le(T.value, ([S, J]) => (G(), X("section", {
            key: S,
            class: "skill-group"
          }, [
            h("h3", null, Q(S), 1),
            (G(!0), X(ye, null, Le(J, (K) => (G(), X("article", {
              key: K.name,
              class: "extension-row kind-skill"
            }, [
              h("div", Gk, [
                h("div", null, [
                  h("strong", null, Q(K.name), 1),
                  h("span", null, Q(K.builtin ? "内置" : "自定义") + " · " + Q(K.format === "skillmd" ? "标准包" : "JSON"), 1)
                ]),
                h("p", null, Q(K.description || "暂无说明"), 1),
                h("div", Yk, [
                  (G(!0), X(ye, null, Le(K.tool_names, (ne) => (G(), X("span", { key: ne }, Q(ne), 1))), 128))
                ])
              ]),
              h("div", Xk, [
                h("span", {
                  class: xe(["yv-status", K.enabled ? "ok" : "warn"])
                }, Q(K.enabled ? "已启用" : "已停用"), 3),
                h("button", {
                  class: "yv-button yv-icon-button",
                  title: K.enabled ? "停用" : "启用",
                  onClick: (ne) => ee(K, { enabled: !K.enabled })
                }, [
                  re(F(Op))
                ], 8, qk),
                !K.builtin && !K.trusted ? (G(), X("button", {
                  key: 0,
                  class: "yv-button",
                  onClick: (ne) => ee(K, { trusted: !0 })
                }, "信任", 8, Wk)) : ke("", !0),
                K.builtin ? ke("", !0) : (G(), X("button", {
                  key: 1,
                  class: "yv-button yv-icon-button",
                  title: "编辑",
                  onClick: (ne) => P(K)
                }, [
                  re(F(Cp))
                ], 8, Kk)),
                K.builtin ? ke("", !0) : (G(), X("button", {
                  key: 2,
                  class: "yv-button yv-icon-button danger",
                  title: "删除",
                  onClick: (ne) => oe(K)
                }, [
                  re(F(wo))
                ], 8, Zk))
              ])
            ]))), 128))
          ]))), 128))
        ])) : o.value === "mcp" ? (G(), X("section", Jk, [
          h("header", null, [
            d[42] || (d[42] = h("div", null, [
              h("span", { class: "yv-kicker" }, "External protocol services"),
              h("h2", null, "MCP 服务"),
              h("p", null, "连接、测试并限制外部服务可访问的角色。")
            ], -1)),
            h("button", {
              class: "yv-button primary",
              onClick: d[6] || (d[6] = (S) => j())
            }, [
              re(F(co)),
              d[41] || (d[41] = Pe("新增服务"))
            ])
          ]),
          n.servers.length ? ke("", !0) : (G(), X("div", Qk, "尚未配置 MCP 服务")),
          (G(!0), X(ye, null, Le(n.servers, (S) => {
            var J, K, ne, le, me;
            return G(), X("article", {
              key: S.name,
              class: "extension-row kind-mcp"
            }, [
              h("div", eS, [
                h("div", null, [
                  h("strong", null, Q(S.name), 1),
                  h("span", null, Q(S.transport) + " · " + Q(S.enabled ? "已启用" : "已停用"), 1)
                ]),
                h("p", null, Q(S.description || ((J = S.status) == null ? void 0 : J.error) || "暂无说明"), 1),
                h("label", tS, [
                  d[43] || (d[43] = h("span", null, "授权角色", -1)),
                  h("input", {
                    value: (S.allowed_persona_ids || []).join(","),
                    placeholder: "* 或角色 ID，逗号分隔",
                    onChange: (Ee) => _e(S, Ee)
                  }, null, 40, nS)
                ])
              ]),
              h("div", oS, [
                h("span", {
                  class: xe(["yv-status", ((K = S.status) == null ? void 0 : K.status) === "connected" ? "ok" : ((ne = S.status) == null ? void 0 : ne.status) === "error" ? "error" : "warn"])
                }, Q(((le = S.status) == null ? void 0 : le.status) === "connected" ? `${S.status.tool_count} 个工具` : ((me = S.status) == null ? void 0 : me.status) === "error" ? "连接失败" : "等待连接"), 3),
                h("button", {
                  class: "yv-button",
                  onClick: (Ee) => se(S)
                }, "测试", 8, iS),
                h("button", {
                  class: "yv-button",
                  onClick: (Ee) => ae(S)
                }, Q(S.enabled ? "停用" : "启用"), 9, rS),
                h("button", {
                  class: "yv-button yv-icon-button danger",
                  title: "删除",
                  onClick: (Ee) => W(S)
                }, [
                  re(F(wo))
                ], 8, sS)
              ])
            ]);
          }), 128))
        ])) : o.value === "tools" ? (G(), X("section", lS, [
          h("header", null, [
            d[44] || (d[44] = h("div", null, [
              h("span", { class: "yv-kicker" }, "Unified registry"),
              h("h2", null, "工具目录"),
              h("p", null, "查看内置工具与 MCP 工具的统一注册结果。")
            ], -1)),
            h("label", aS, [
              re(F(Kr)),
              je(h("input", {
                "onUpdate:modelValue": d[7] || (d[7] = (S) => l.value = S),
                placeholder: "搜索工具名、服务或描述"
              }, null, 512), [
                [it, l.value]
              ])
            ])
          ]),
          L.value.length ? ke("", !0) : (G(), X("div", uS, "没有匹配的工具")),
          (G(!0), X(ye, null, Le(L.value, (S) => (G(), X("article", {
            key: `${S.server}/${S.name}`,
            class: "extension-row kind-tool"
          }, [
            h("div", cS, [
              h("div", null, [
                h("strong", null, Q(S.name), 1),
                h("span", null, Q(S.server || "内置"), 1)
              ]),
              h("p", null, Q(S.description || "暂无说明"), 1)
            ]),
            h("span", {
              class: xe(["yv-status", S.requires_confirmation ? "warn" : "ok"])
            }, Q(S.requires_confirmation ? "调用需确认" : "可直接调用"), 3)
          ]))), 128))
        ])) : (G(), X("section", dS, [
          h("header", null, [
            d[46] || (d[46] = h("div", null, [
              h("span", { class: "yv-kicker" }, "Curated catalog"),
              h("h2", null, "在线扩展"),
              h("p", null, "先检查来源与权限，再将扩展加入本地能力系统。")
            ], -1)),
            h("button", {
              class: "yv-button",
              onClick: d[8] || (d[8] = (S) => he(!0))
            }, [
              re(F(qr)),
              d[45] || (d[45] = Pe("刷新目录"))
            ])
          ]),
          h("div", fS, [
            h("label", hS, [
              re(F(Kr)),
              je(h("input", {
                "onUpdate:modelValue": d[9] || (d[9] = (S) => _.value = S),
                placeholder: "搜索名称、说明或分类"
              }, null, 512), [
                [it, _.value]
              ])
            ]),
            je(h("select", {
              "onUpdate:modelValue": d[10] || (d[10] = (S) => C.value = S),
              onChange: d[11] || (d[11] = (S) => he(!1))
            }, d[47] || (d[47] = [
              h("option", { value: "all" }, "全部类型", -1),
              h("option", { value: "skill" }, "Skill", -1),
              h("option", { value: "mcp" }, "MCP", -1)
            ]), 544), [
              [ki, C.value]
            ]),
            h("span", {
              class: xe(["yv-status", g.value ? "warn" : "ok"])
            }, Q(g.value ? "缓存目录" : `${p.value.length} 个条目`), 3)
          ]),
          h("div", pS, [
            (G(!0), X(ye, null, Le(z.value, (S) => (G(), X("article", {
              key: S.id,
              class: xe(["catalog-item", `kind-${S.kind}`])
            }, [
              h("span", null, Q(S.kind.toUpperCase()), 1),
              h("h3", null, Q(S.name || S.id), 1),
              h("small", null, "v" + Q(S.version || "未知") + " · " + Q(S.id), 1),
              h("p", null, Q(S.description || "暂无说明"), 1),
              h("div", vS, [
                (G(!0), X(ye, null, Le(S.categories, (J) => (G(), X("span", { key: J }, Q(J), 1))), 128))
              ]),
              h("button", {
                class: "yv-button",
                disabled: we(S),
                onClick: (J) => pe(S)
              }, Q(we(S) ? "已安装" : "查看并安装"), 9, gS)
            ], 2))), 128))
          ])
        ])),
        h("dialog", {
          ref_key: "drawer",
          ref: a,
          class: "yv-dialog"
        }, [
          h("header", mS, [
            h("div", null, [
              h("span", yS, Q(u.value === "skill" ? "Instruction package" : "Protocol service"), 1),
              h("h2", null, Q(u.value === "skill" ? D.value ? `编辑 ${D.value}` : "新增技能" : "新增 MCP 服务"), 1)
            ]),
            h("button", {
              class: "yv-button yv-icon-button",
              title: "关闭",
              onClick: d[12] || (d[12] = (S) => {
                var J;
                return (J = a.value) == null ? void 0 : J.close();
              })
            }, [
              re(F(Tl))
            ])
          ]),
          u.value === "skill" ? (G(), X("form", {
            key: 0,
            class: "dialog-body",
            onSubmit: Io(q, ["prevent"])
          }, [
            h("label", bS, [
              d[48] || (d[48] = h("span", null, "名称", -1)),
              je(h("input", {
                "onUpdate:modelValue": d[13] || (d[13] = (S) => x.name = S),
                readonly: !!D.value
              }, null, 8, _S), [
                [it, x.name]
              ])
            ]),
            h("label", wS, [
              d[49] || (d[49] = h("span", null, "描述", -1)),
              je(h("input", {
                "onUpdate:modelValue": d[14] || (d[14] = (S) => x.description = S)
              }, null, 512), [
                [it, x.description]
              ])
            ]),
            h("label", ES, [
              d[50] || (d[50] = h("span", null, "提示词", -1)),
              je(h("textarea", {
                "onUpdate:modelValue": d[15] || (d[15] = (S) => x.instructions = S),
                rows: "6"
              }, null, 512), [
                [it, x.instructions]
              ])
            ]),
            h("label", xS, [
              d[51] || (d[51] = h("span", null, "触发提示", -1)),
              je(h("input", {
                "onUpdate:modelValue": d[16] || (d[16] = (S) => x.prompt_hint = S)
              }, null, 512), [
                [it, x.prompt_hint]
              ])
            ]),
            h("fieldset", kS, [
              d[52] || (d[52] = h("legend", null, "可附加工具", -1)),
              (G(!0), X(ye, null, Le(M.value, (S) => (G(), X("label", {
                key: S.name
              }, [
                je(h("input", {
                  "onUpdate:modelValue": d[17] || (d[17] = (J) => x.tool_names = J),
                  type: "checkbox",
                  value: S.name
                }, null, 8, SS), [
                  [lp, x.tool_names]
                ]),
                h("span", null, Q(S.name) + Q(S.requires_confirmation ? "（需确认）" : ""), 1)
              ]))), 128))
            ]),
            h("button", CS, [
              re(F(Wr)),
              d[53] || (d[53] = Pe("保存技能"))
            ])
          ], 32)) : (G(), X("form", {
            key: 1,
            class: "dialog-body",
            onSubmit: Io(te, ["prevent"])
          }, [
            h("label", NS, [
              d[54] || (d[54] = h("span", null, "名称", -1)),
              je(h("input", {
                "onUpdate:modelValue": d[18] || (d[18] = (S) => w.name = S)
              }, null, 512), [
                [it, w.name]
              ])
            ]),
            h("label", $S, [
              d[55] || (d[55] = h("span", null, "描述", -1)),
              je(h("input", {
                "onUpdate:modelValue": d[19] || (d[19] = (S) => w.description = S)
              }, null, 512), [
                [it, w.description]
              ])
            ]),
            h("div", MS, [
              (G(), X(ye, null, Le([{ id: "stdio", label: "本地进程" }, { id: "streamable_http", label: "远程 HTTP" }, { id: "sse", label: "远程 SSE" }], (S) => h("button", {
                key: S.id,
                type: "button",
                class: xe({ active: w.transport === S.id }),
                onClick: (J) => w.transport = S.id
              }, Q(S.label), 11, IS)), 64))
            ]),
            w.transport === "stdio" ? (G(), X(ye, { key: 0 }, [
              h("label", OS, [
                d[56] || (d[56] = h("span", null, "启动命令", -1)),
                je(h("input", {
                  "onUpdate:modelValue": d[20] || (d[20] = (S) => w.command = S)
                }, null, 512), [
                  [it, w.command]
                ])
              ]),
              h("label", TS, [
                d[57] || (d[57] = h("span", null, "参数（每行一个）", -1)),
                je(h("textarea", {
                  "onUpdate:modelValue": d[21] || (d[21] = (S) => w.args = S),
                  rows: "3"
                }, null, 512), [
                  [it, w.args]
                ])
              ]),
              h("label", PS, [
                d[58] || (d[58] = h("span", null, "环境变量（KEY=VALUE）", -1)),
                je(h("textarea", {
                  "onUpdate:modelValue": d[22] || (d[22] = (S) => w.env = S),
                  rows: "3"
                }, null, 512), [
                  [it, w.env]
                ])
              ])
            ], 64)) : (G(), X(ye, { key: 1 }, [
              h("label", DS, [
                d[59] || (d[59] = h("span", null, "服务器地址", -1)),
                je(h("input", {
                  "onUpdate:modelValue": d[23] || (d[23] = (S) => w.url = S)
                }, null, 512), [
                  [it, w.url]
                ])
              ]),
              h("label", AS, [
                d[60] || (d[60] = h("span", null, "请求头（KEY: VALUE）", -1)),
                je(h("textarea", {
                  "onUpdate:modelValue": d[24] || (d[24] = (S) => w.headers = S),
                  rows: "3"
                }, null, 512), [
                  [it, w.headers]
                ])
              ])
            ], 64)),
            h("button", RS, [
              re(F(Wr)),
              d[61] || (d[61] = Pe("保存服务"))
            ])
          ], 32))
        ], 512),
        h("dialog", {
          ref_key: "catalogDialog",
          ref: f,
          class: "yv-dialog"
        }, [
          h("header", LS, [
            h("div", null, [
              d[62] || (d[62] = h("span", { class: "yv-kicker" }, "安装预览", -1)),
              h("h2", null, Q(((k = $.value) == null ? void 0 : k.name) || ((v = $.value) == null ? void 0 : v.id)), 1)
            ]),
            h("button", {
              class: "yv-button yv-icon-button",
              title: "关闭",
              onClick: d[25] || (d[25] = (S) => {
                var J;
                return (J = f.value) == null ? void 0 : J.close();
              })
            }, [
              re(F(Tl))
            ])
          ]),
          h("div", VS, [
            h("p", null, Q(((m = $.value) == null ? void 0 : m.description) || "暂无说明"), 1),
            h("dl", zS, [
              d[63] || (d[63] = h("dt", null, "类型", -1)),
              h("dd", null, Q((b = (y = $.value) == null ? void 0 : y.kind) == null ? void 0 : b.toUpperCase()), 1),
              d[64] || (d[64] = h("dt", null, "版本", -1)),
              h("dd", null, Q(((I = $.value) == null ? void 0 : I.version) || "未知"), 1),
              d[65] || (d[65] = h("dt", null, "来源", -1)),
              h("dd", null, Q(((U = (B = $.value) == null ? void 0 : B.source) == null ? void 0 : U.type) || "未知"), 1)
            ]),
            h("button", {
              class: "yv-button primary",
              onClick: ge
            }, [
              re(F(rc)),
              d[66] || (d[66] = Pe("确认安装"))
            ])
          ])
        ], 512)
      ]);
    };
  }
});
let ln = null;
const Ud = () => document.querySelector("#extensions-app-root");
function L2(e = "#extensions-app-root") {
  if (ln) return ln;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("能力扩展挂载点不存在");
  return ln = Xi(BS), ln.mount(t), ln;
}
function V2() {
  var e;
  (e = Ud()) == null || e.dispatchEvent(new CustomEvent("yumeno:extensions-show"));
}
function z2() {
  var e;
  (e = Ud()) == null || e.dispatchEvent(new CustomEvent("yumeno:extensions-hide"));
}
function B2() {
  ln && (ln.unmount(), ln = null);
}
const FS = /* @__PURE__ */ new Set([
  "recall_at_3_answerable",
  "precision_at_3_answerable",
  "mrr_at_3_answerable",
  "hit_at_3_answerable",
  "grounded_rate",
  "useful_rate",
  "refusal_rate",
  "answer_rate",
  "accepted_rate",
  "rewrite_rate",
  "correction_rate",
  "complex_rewrite_rate",
  "complex_correction_rate",
  "probe_refusal_rate",
  "mean_confidence"
]);
function ri(e, t) {
  if (e === "scope_isolation_ok") return t ? "通过" : "未通过";
  const n = Number(t);
  return FS.has(e) && Number.isFinite(n) ? `${Math.round(n * 100)}%` : typeof t == "number" && Number.isFinite(n) ? Number.isInteger(n) ? String(n) : n.toFixed(3) : String(t ?? "—");
}
function HS(e, t) {
  return t ? Math.max(0, Math.min(100, Math.round(e / t * 100))) : 0;
}
const US = { class: "yv-page evaluation-page" }, jS = { class: "evaluation-hero" }, GS = { class: "evaluation-control" }, YS = { class: "control-fields" }, XS = { class: "yv-field" }, qS = ["value"], WS = { class: "yv-field" }, KS = { class: "control-actions" }, ZS = ["disabled"], JS = ["disabled"], QS = ["href"], e2 = { class: "run-status" }, t2 = {
  key: 0,
  class: "results-stage"
}, n2 = { class: "metric-lead" }, o2 = { class: "metric-groups" }, i2 = {
  key: 0,
  class: "analysis-block"
}, r2 = { class: "case-section" }, s2 = { class: "case-index" }, l2 = {
  key: 1,
  class: "evaluation-empty"
}, a2 = /* @__PURE__ */ Oe({
  __name: "App",
  setup(e) {
    const t = ie([]), n = ie(""), o = ie("fast"), i = ie({ state: "idle", progress: 0, total: 0 }), r = ie(null), s = ie(""), l = ie(""), a = ie(!1), u = ie(!1), c = ie(!1);
    let f = 0;
    const p = de(() => ({ idle: "未运行", running: i.value.phase === "generating" ? "生成问题" : "评测中", done: "已完成", error: "失败" })[i.value.state] || i.value.state || "未运行"), g = de(() => HS(Number(i.value.progress || 0), Number(i.value.total || 0))), _ = de(() => {
      var O;
      return ((O = r.value) == null ? void 0 : O.cases) || [];
    }), C = de(() => c.value ? _.value : _.value.slice(0, 3)), $ = de(() => {
      var R;
      const O = ((R = r.value) == null ? void 0 : R.metrics) || {};
      return [
        { label: "Top 3 召回率", value: ri("recall_at_3_answerable", O.recall_at_3_answerable), tone: x("recall_at_3_answerable", O.recall_at_3_answerable) },
        { label: "回答接地率", value: ri("grounded_rate", O.grounded_rate), tone: x("grounded_rate", O.grounded_rate) },
        { label: "质量通过率", value: ri("accepted_rate", O.accepted_rate), tone: x("accepted_rate", O.accepted_rate) },
        { label: "P95 总延迟", value: O.p95_total_latency_ms == null ? "—" : `${Math.round(Number(O.p95_total_latency_ms))} ms`, tone: "" }
      ];
    }), M = [
      { title: "检索质量", keys: ["recall_at_3_answerable", "precision_at_3_answerable", "mrr_at_3_answerable", "hit_at_3_answerable", "cases_answerable", "mean_latency_ms", "p95_latency_ms"] },
      { title: "回答质量", keys: ["grounded_rate", "useful_rate", "accepted_rate", "answer_rate", "refusal_rate", "cases_checked", "mean_confidence", "scope_isolation_ok"] },
      { title: "行为与性能", keys: ["rewrite_rate", "correction_rate", "mean_rewrite_count", "mean_correction_count", "complex_rewrite_rate", "complex_correction_rate", "probe_refusal_rate", "cases_total", "cases_complex", "mean_total_latency_ms", "p95_total_latency_ms"] }
    ], D = { recall_at_3_answerable: "可答问题召回率 Recall@3", precision_at_3_answerable: "可答问题精确率 Precision@3", mrr_at_3_answerable: "可答问题 MRR@3", hit_at_3_answerable: "可答问题命中 Hit@3", cases_answerable: "可答用例数", mean_latency_ms: "平均检索延迟 (ms)", p95_latency_ms: "P95 检索延迟 (ms)", grounded_rate: "事实接地率", useful_rate: "问题解决率", accepted_rate: "质量通过率", answer_rate: "正常作答率", refusal_rate: "拒答率", cases_checked: "生成已检用例", mean_confidence: "平均置信度", scope_isolation_ok: "跨角色隔离校验", rewrite_rate: "查询改写触发率", correction_rate: "生成纠错触发率", mean_rewrite_count: "平均改写次数", mean_correction_count: "平均纠错次数", complex_rewrite_rate: "复杂题改写率", complex_correction_rate: "复杂题纠错率", probe_refusal_rate: "无关问题拒答率", cases_total: "用例总数", cases_complex: "复杂题数", mean_total_latency_ms: "平均整链路延迟 (ms)", p95_total_latency_ms: "P95 整链路延迟 (ms)" };
    function x(O, R) {
      if (O === "scope_isolation_ok") return R ? "good" : "bad";
      const E = Number(R);
      return !["recall_at_3_answerable", "precision_at_3_answerable", "mrr_at_3_answerable", "hit_at_3_answerable", "grounded_rate", "useful_rate", "accepted_rate", "answer_rate", "mean_confidence"].includes(O) || !Number.isFinite(E) ? "" : E >= 0.8 ? "good" : E <= 0.2 ? "bad" : "";
    }
    function w() {
      return i.value.phase === "generating" ? i.value.status_text || "正在从角色资料生成问题" : i.value.total > 0 ? [`已完成 ${i.value.progress}/${i.value.total} 条`, i.value.current_question_text, i.value.current_step].filter(Boolean).join(" · ") : l.value || "等待开始";
    }
    async function H() {
      try {
        t.value = await Ve("/api/personas"), !n.value && t.value.length && (n.value = t.value[0].id);
      } catch (O) {
        l.value = rt(O);
      }
    }
    async function L() {
      r.value = await Ve("/api/eval/results");
    }
    function z() {
      f += 1, a.value = !1;
    }
    async function T() {
      const O = ++f;
      a.value = !0;
      for (let R = 0; R < 1200 && O === f; R += 1) {
        try {
          if (i.value = await Ve("/api/eval/status"), i.value.state === "done") {
            await L(), a.value = !1;
            return;
          }
          if (i.value.state === "error") {
            l.value = i.value.error || "评测失败", a.value = !1;
            return;
          }
        } catch (E) {
          l.value = rt(E), a.value = !1;
          return;
        }
        await new Promise((E) => setTimeout(E, 500));
      }
    }
    async function N() {
      if (!n.value) {
        l.value = "请先选择评测角色";
        return;
      }
      l.value = "", r.value = null, s.value = "", c.value = !1;
      try {
        await Ve("/api/eval/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ persona_id: n.value, tier: o.value }) }), await T();
      } catch (O) {
        l.value = rt(O), a.value = !1;
      }
    }
    async function V() {
      u.value = !0;
      try {
        const O = await Ve("/api/eval/analyze", { method: "POST" });
        s.value = O.analysis || "分析结果为空";
      } catch (O) {
        l.value = rt(O);
      } finally {
        u.value = !1;
      }
    }
    async function Z() {
      await H();
      try {
        i.value = await Ve("/api/eval/status"), i.value.state === "running" ? T() : i.value.state === "done" && await L();
      } catch {
      }
    }
    return ht(() => {
      const O = document.querySelector("#evaluation-app-root");
      O == null || O.addEventListener("yumeno:evaluation-show", Z), O == null || O.addEventListener("yumeno:evaluation-hide", z), Z();
    }), gn(z), (O, R) => (G(), X("main", US, [
      h("header", jS, [
        R[3] || (R[3] = h("div", null, [
          h("span", { class: "yv-kicker" }, "Retrieval quality lab"),
          h("h1", null, "RAG 评测"),
          h("p", null, "用可复现指标检查召回、回答接地与整链路延迟。")
        ], -1)),
        h("span", {
          class: xe(["yv-status", i.value.state === "done" ? "ok" : i.value.state === "error" ? "error" : a.value ? "warn" : ""])
        }, Q(p.value), 3)
      ]),
      h("section", GS, [
        h("div", YS, [
          h("label", XS, [
            R[5] || (R[5] = h("span", null, "评测角色", -1)),
            je(h("select", {
              "onUpdate:modelValue": R[0] || (R[0] = (E) => n.value = E)
            }, [
              R[4] || (R[4] = h("option", { value: "" }, "请选择角色", -1)),
              (G(!0), X(ye, null, Le(t.value, (E) => (G(), X("option", {
                key: E.id,
                value: E.id
              }, Q(E.name), 9, qS))), 128))
            ], 512), [
              [ki, n.value]
            ])
          ]),
          h("label", WS, [
            R[7] || (R[7] = h("span", null, "问题规模", -1)),
            je(h("select", {
              "onUpdate:modelValue": R[1] || (R[1] = (E) => o.value = E)
            }, R[6] || (R[6] = [
              h("option", { value: "fast" }, "轻量 · 5 个问题", -1),
              h("option", { value: "standard" }, "标准 · 10 个问题", -1),
              h("option", { value: "thorough" }, "全面 · 15 个问题", -1)
            ]), 512), [
              [ki, o.value]
            ])
          ])
        ]),
        h("div", KS, [
          h("button", {
            class: "yv-button primary",
            disabled: a.value,
            onClick: N
          }, [
            re(F(lc)),
            Pe(Q(a.value ? "评测进行中" : "生成并评测"), 1)
          ], 8, ZS),
          h("button", {
            class: "yv-button",
            disabled: !r.value || u.value,
            onClick: V
          }, [
            re(F(Ip)),
            Pe(Q(u.value ? "分析中" : "AI 分析"), 1)
          ], 8, JS),
          h("a", {
            class: xe(["yv-button", { disabled: !r.value }]),
            href: r.value ? "/api/eval/export" : void 0
          }, [
            re(F(rc)),
            R[8] || (R[8] = Pe("导出 JSON"))
          ], 10, QS)
        ])
      ]),
      h("section", e2, [
        h("div", null, [
          h("strong", null, Q(p.value), 1),
          h("p", {
            class: xe({ error: l.value })
          }, Q(l.value || w()), 3)
        ]),
        h("div", {
          class: xe(["progress-track", { indeterminate: a.value && i.value.phase === "generating" }])
        }, [
          h("span", {
            style: ft({ width: `${g.value}%` })
          }, null, 4)
        ], 2)
      ]),
      r.value ? (G(), X("section", t2, [
        h("div", n2, [
          (G(!0), X(ye, null, Le($.value, (E) => (G(), X("article", {
            key: E.label,
            class: xe(E.tone)
          }, [
            h("span", null, Q(E.label), 1),
            h("strong", null, Q(E.value), 1)
          ], 2))), 128))
        ]),
        h("div", o2, [
          (G(), X(ye, null, Le(M, (E) => h("section", {
            key: E.title
          }, [
            h("h2", null, Q(E.title), 1),
            h("div", null, [
              (G(!0), X(ye, null, Le(E.keys.filter((A) => {
                var P, j;
                return ((P = r.value.metrics) == null ? void 0 : P[A]) !== void 0 && ((j = r.value.metrics) == null ? void 0 : j[A]) !== null;
              }), (A) => (G(), X("article", { key: A }, [
                h("span", null, Q(D[A] || A), 1),
                h("strong", {
                  class: xe(x(A, r.value.metrics[A]))
                }, Q(F(ri)(A, r.value.metrics[A])), 3)
              ]))), 128))
            ])
          ])), 64))
        ]),
        s.value ? (G(), X("section", i2, [
          R[9] || (R[9] = h("span", { class: "yv-kicker" }, "AI review", -1)),
          R[10] || (R[10] = h("h2", null, "结果解读", -1)),
          h("p", null, Q(s.value), 1)
        ])) : ke("", !0),
        h("section", r2, [
          h("header", null, [
            R[11] || (R[11] = h("div", null, [
              h("span", { class: "yv-kicker" }, "Case evidence"),
              h("h2", null, "逐条详情")
            ], -1)),
            _.value.length > 3 ? (G(), X("button", {
              key: 0,
              class: "yv-button",
              onClick: R[2] || (R[2] = (E) => c.value = !c.value)
            }, Q(c.value ? "收起" : `展开全部 ${_.value.length} 条`), 1)) : ke("", !0)
          ]),
          (G(!0), X(ye, null, Le(C.value, (E, A) => (G(), X("article", {
            key: A,
            class: "case-row"
          }, [
            h("div", s2, Q(String(A + 1).padStart(2, "0")), 1),
            h("div", null, [
              h("strong", null, Q(E.question), 1),
              h("p", null, Q((E.answer || "").slice(0, 240)), 1),
              h("small", null, Q([E.grounded == null ? "grounded=—" : `grounded=${E.grounded}`, E.useful == null ? "useful=—" : `useful=${E.useful}`, `confidence=${E.confidence ?? "—"}`, E.rewrite_used ? "查询改写" : "", E.corrected ? "生成纠错" : "", E.is_probe ? "无关探针" : ""].filter(Boolean).join(" · ")), 1)
            ]),
            h("span", {
              class: xe(["yv-status", E.accepted || E.is_probe && E.refused ? "ok" : "error"])
            }, Q(E.accepted || E.is_probe && E.refused ? "符合预期" : "未通过"), 3)
          ]))), 128))
        ])
      ])) : (G(), X("section", l2, [
        re(F(yp)),
        R[12] || (R[12] = h("h2", null, "等待一轮可比较的结果", -1)),
        R[13] || (R[13] = h("p", null, "选择角色和问题规模后开始。评测会覆盖知识召回、复杂问题与无关问题拒答。", -1))
      ]))
    ]));
  }
});
let an = null;
const jd = () => document.querySelector("#evaluation-app-root");
function F2(e = "#evaluation-app-root") {
  if (an) return an;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("RAG 评测挂载点不存在");
  return an = Xi(a2), an.mount(t), an;
}
function H2() {
  var e;
  (e = jd()) == null || e.dispatchEvent(new CustomEvent("yumeno:evaluation-show"));
}
function U2() {
  var e;
  (e = jd()) == null || e.dispatchEvent(new CustomEvent("yumeno:evaluation-hide"));
}
function j2() {
  an && (an.unmount(), an = null);
}
async function Go(e, t) {
  const n = await fetch(e, t), o = await n.json().catch(() => null);
  if (!n.ok) throw new Error((o == null ? void 0 : o.detail) || `请求失败 (${n.status})`);
  return o;
}
function u2() {
  return Go("/api/reranker/status", { cache: "no-store" });
}
function c2(e) {
  return Go("/api/reranker/install", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
    body: JSON.stringify({ model_id: "Qwen/Qwen3-Reranker-0.6B", source: "modelscope", device: e })
  });
}
function d2() {
  return Go("/api/reranker/install/cancel", { method: "DELETE", headers: { "X-YUMENO-Request": "web" } });
}
function f2() {
  return Go("/api/reranker/model", { method: "DELETE", headers: { "X-YUMENO-Request": "web" } });
}
function h2() {
  return Go("/api/reranker/model-directory", { method: "POST", headers: { "X-YUMENO-Request": "web" } });
}
const p2 = { class: "settings-summary" }, v2 = { class: "section-toggle-label" }, g2 = { class: "asr-resource-bar" }, m2 = {
  key: 0,
  max: "100"
}, y2 = {
  key: 1,
  class: "inline-status"
}, b2 = { class: "asr-actions" }, _2 = ["disabled"], w2 = ["disabled"], E2 = ["disabled"], x2 = ["disabled"], k2 = { class: "settings-grid one-column reranker-settings-grid" }, S2 = { class: "field provider-field" }, C2 = ["disabled"], N2 = /* @__PURE__ */ Oe({
  __name: "RerankerSettingsApp",
  setup(e) {
    const t = ie(null), n = ie("auto"), o = ie(!1), i = ie(""), r = ie(!1);
    let s;
    const l = de(() => i.value ? "检查失败" : t.value ? t.value.installing ? "安装中" : t.value.ready ? "已就绪" : t.value.installed ? "已安装，等待加载" : "未安装" : "检查中"), a = de(() => i.value ? i.value : t.value ? t.value.ready ? "本地精排可用；检索候选将经过语义重排序。" : t.value.installed ? "模型文件完整，将在首次检索时加载。" : "未安装时系统自动使用 RRF 融合结果，不会阻断知识检索。" : "正在读取本地模型状态"), u = de(() => {
      var C;
      if (!((C = t.value) != null && C.installing)) return "";
      const g = t.value.phase || "准备资源";
      return `${t.value.current_file || g} · ${Math.round(t.value.elapsed_seconds || 0)} 秒`;
    });
    async function c() {
      try {
        t.value = await u2(), n.value = t.value.device || n.value, i.value = t.value.error || "";
      } catch (g) {
        i.value = g instanceof Error ? g.message : "无法读取 Reranker 状态";
      }
    }
    async function f(g) {
      if (!o.value) {
        o.value = !0, i.value = "";
        try {
          t.value = await g();
        } catch (_) {
          i.value = _ instanceof Error ? _.message : "操作失败";
        } finally {
          o.value = !1;
        }
      }
    }
    async function p() {
      if (!o.value) {
        o.value = !0, i.value = "";
        try {
          await h2();
        } catch (g) {
          i.value = g instanceof Error ? g.message : "无法打开模型目录";
        } finally {
          o.value = !1;
        }
      }
    }
    return ht(() => {
      c(), s = window.setInterval(() => {
        var g;
        (g = t.value) != null && g.installing && c();
      }, 1500);
    }), gn(() => {
      s && window.clearInterval(s);
    }), (g, _) => {
      var C, $, M, D, x, w, H;
      return G(), X("details", {
        class: "panel settings-section",
        "data-collapsible": "",
        onToggle: _[4] || (_[4] = (L) => r.value = L.currentTarget.open)
      }, [
        h("summary", p2, [
          _[5] || (_[5] = h("span", { class: "settings-summary-title" }, [
            h("strong", null, "Reranker 精排"),
            h("span", { class: "settings-summary-meta" }, "候选重排序 · 本地模型 · RRF 自动降级")
          ], -1)),
          h("span", v2, Q(r.value ? "收起" : "展开"), 1)
        ]),
        _[9] || (_[9] = h("p", { class: "settings-help" }, [
          Pe("使用本地模型 "),
          h("code", null, "Qwen3-Reranker-0.6B"),
          Pe(" 对召回候选精排；模型未安装或暂不可用时，系统自动保留 RRF 融合结果。")
        ], -1)),
        h("div", g2, [
          h("div", null, [
            h("strong", null, Q(l.value), 1),
            h("p", {
              class: xe(["inline-status", { "is-error": !!i.value }]),
              role: "status",
              "aria-live": "polite"
            }, Q(a.value), 3),
            (C = t.value) != null && C.installing ? (G(), X("progress", m2)) : ke("", !0),
            u.value ? (G(), X("p", y2, Q(u.value), 1)) : ke("", !0)
          ]),
          h("div", b2, [
            h("button", {
              class: "button button-secondary",
              type: "button",
              disabled: o.value,
              onClick: p
            }, [
              re(F(sc), { size: 16 }),
              _[6] || (_[6] = Pe("打开目录"))
            ], 8, _2),
            h("button", {
              class: "button button-danger",
              type: "button",
              disabled: o.value || !(($ = t.value) != null && $.installed) || ((M = t.value) == null ? void 0 : M.installing),
              onClick: _[0] || (_[0] = (L) => f(F(f2)))
            }, "删除", 8, w2),
            (D = t.value) != null && D.installing ? (G(), X("button", {
              key: 0,
              class: "button button-secondary",
              type: "button",
              disabled: o.value || t.value.cancelling,
              onClick: _[1] || (_[1] = (L) => f(F(d2)))
            }, "取消下载", 8, E2)) : (G(), X("button", {
              key: 1,
              class: "button button-primary",
              type: "button",
              disabled: o.value || ((x = t.value) == null ? void 0 : x.installed),
              onClick: _[2] || (_[2] = (L) => f(() => F(c2)(n.value)))
            }, "安装", 8, x2))
          ])
        ]),
        h("div", k2, [
          h("label", S2, [
            _[8] || (_[8] = h("span", null, "运行设备", -1)),
            je(h("select", {
              "onUpdate:modelValue": _[3] || (_[3] = (L) => n.value = L),
              disabled: o.value || ((w = t.value) == null ? void 0 : w.installing) || ((H = t.value) == null ? void 0 : H.installed)
            }, _[7] || (_[7] = [
              h("option", { value: "auto" }, "自动（GPU 优先）", -1),
              h("option", { value: "cuda" }, "仅 GPU", -1),
              h("option", { value: "cpu" }, "仅 CPU", -1)
            ]), 8, C2), [
              [ki, n.value]
            ])
          ])
        ]),
        _[10] || (_[10] = h("details", { class: "settings-help" }, [
          h("summary", null, "参数说明"),
          h("p", null, [
            Pe("模型固定为 "),
            h("code", null, "Qwen/Qwen3-Reranker-0.6B"),
            Pe("，从 ModelScope 下载。设备选择在安装时保存；需要更换设备时，删除后重新安装。")
          ])
        ], -1))
      ], 32);
    };
  }
}), $2 = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [o, i] of t)
    n[o] = i;
  return n;
}, M2 = /* @__PURE__ */ $2(N2, [["__scopeId", "data-v-bf7b6366"]]);
let un = null;
function G2(e = "#reranker-settings-root") {
  if (un) return un;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("Reranker 设置挂载点不存在");
  return un = Xi(M2), un.mount(t), un;
}
function Y2() {
  un && (un.unmount(), un = null);
}
export {
  j2 as destroyEvaluationApp,
  B2 as destroyExtensionsApp,
  R2 as destroyManageApp,
  Y2 as destroyRerankerSettingsApp,
  U2 as hideEvaluationApp,
  z2 as hideExtensionsApp,
  F2 as mountEvaluationApp,
  L2 as mountExtensionsApp,
  D2 as mountManageApp,
  G2 as mountRerankerSettingsApp,
  H2 as showEvaluationApp,
  V2 as showExtensionsApp,
  A2 as showManageApp
};

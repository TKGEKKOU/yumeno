var Hd = Object.defineProperty;
var jd = (e, t, n) => t in e ? Hd(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var je = (e, t, n) => jd(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function ps(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const Pe = {}, zn = [], Dt = () => {
}, Ud = () => !1, Ti = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), vs = (e) => e.startsWith("onUpdate:"), tt = Object.assign, gs = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, Gd = Object.prototype.hasOwnProperty, Oe = (e, t) => Gd.call(e, t), he = Array.isArray, Bn = (e) => Lo(e) === "[object Map]", eo = (e) => Lo(e) === "[object Set]", Ks = (e) => Lo(e) === "[object Date]", be = (e) => typeof e == "function", Fe = (e) => typeof e == "string", kt = (e) => typeof e == "symbol", De = (e) => e !== null && typeof e == "object", Ua = (e) => (De(e) || be(e)) && be(e.then) && be(e.catch), Ga = Object.prototype.toString, Lo = (e) => Ga.call(e), Yd = (e) => Lo(e).slice(8, -1), Ya = (e) => Lo(e) === "[object Object]", ms = (e) => Fe(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, vo = /* @__PURE__ */ ps(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Pi = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, Xd = /-(\w)/g, bt = Pi(
  (e) => e.replace(Xd, (t, n) => n ? n.toUpperCase() : "")
), Wd = /\B([A-Z])/g, Pn = Pi(
  (e) => e.replace(Wd, "-$1").toLowerCase()
), Di = Pi((e) => e.charAt(0).toUpperCase() + e.slice(1)), ir = Pi(
  (e) => e ? `on${Di(e)}` : ""
), Xt = (e, t) => !Object.is(e, t), ii = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, Xa = (e, t, n, o = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: o,
    value: n
  });
}, pi = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Zs;
const Ai = () => Zs || (Zs = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function ft(e) {
  if (he(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const o = e[n], i = Fe(o) ? Jd(o) : ft(o);
      if (i)
        for (const r in i)
          t[r] = i[r];
    }
    return t;
  } else if (Fe(e) || De(e))
    return e;
}
const qd = /;(?![^(]*\))/g, Kd = /:([^]+)/, Zd = /\/\*[^]*?\*\//g;
function Jd(e) {
  const t = {};
  return e.replace(Zd, "").split(qd).forEach((n) => {
    if (n) {
      const o = n.split(Kd);
      o.length > 1 && (t[o[0].trim()] = o[1].trim());
    }
  }), t;
}
function xe(e) {
  let t = "";
  if (Fe(e))
    t = e;
  else if (he(e))
    for (let n = 0; n < e.length; n++) {
      const o = xe(e[n]);
      o && (t += o + " ");
    }
  else if (De(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
function rr(e) {
  if (!e) return null;
  let { class: t, style: n } = e;
  return t && !Fe(t) && (e.class = xe(t)), n && (e.style = ft(n)), e;
}
const Qd = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", ef = /* @__PURE__ */ ps(Qd);
function Wa(e) {
  return !!e || e === "";
}
function tf(e, t) {
  if (e.length !== t.length) return !1;
  let n = !0;
  for (let o = 0; n && o < e.length; o++)
    n = Vo(e[o], t[o]);
  return n;
}
function Vo(e, t) {
  if (e === t) return !0;
  let n = Ks(e), o = Ks(t);
  if (n || o)
    return n && o ? e.getTime() === t.getTime() : !1;
  if (n = kt(e), o = kt(t), n || o)
    return e === t;
  if (n = he(e), o = he(t), n || o)
    return n && o ? tf(e, t) : !1;
  if (n = De(e), o = De(t), n || o) {
    if (!n || !o)
      return !1;
    const i = Object.keys(e).length, r = Object.keys(t).length;
    if (i !== r)
      return !1;
    for (const s in e) {
      const l = e.hasOwnProperty(s), a = t.hasOwnProperty(s);
      if (l && !a || !l && a || !Vo(e[s], t[s]))
        return !1;
    }
  }
  return String(e) === String(t);
}
function ys(e, t) {
  return e.findIndex((n) => Vo(n, t));
}
const qa = (e) => !!(e && e.__v_isRef === !0), J = (e) => Fe(e) ? e : e == null ? "" : he(e) || De(e) && (e.toString === Ga || !be(e.toString)) ? qa(e) ? J(e.value) : JSON.stringify(e, Ka, 2) : String(e), Ka = (e, t) => qa(t) ? Ka(e, t.value) : Bn(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [o, i], r) => (n[sr(o, r) + " =>"] = i, n),
    {}
  )
} : eo(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => sr(n))
} : kt(t) ? sr(t) : De(t) && !he(t) && !Ya(t) ? String(t) : t, sr = (e, t = "") => {
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
class Za {
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
function Ja(e) {
  return new Za(e);
}
function bs() {
  return st;
}
function ri(e, t = !1) {
  st && st.cleanups.push(e);
}
let Ae;
const lr = /* @__PURE__ */ new WeakSet();
class Qa {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, st && st.active && st.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, lr.has(this) && (lr.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || tu(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Js(this), nu(this);
    const t = Ae, n = xt;
    Ae = this, xt = !0;
    try {
      return this.fn();
    } finally {
      ou(this), Ae = t, xt = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Es(t);
      this.deps = this.depsTail = void 0, Js(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? lr.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Dr(this) && this.run();
  }
  get dirty() {
    return Dr(this);
  }
}
let eu = 0, go, mo;
function tu(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = mo, mo = e;
    return;
  }
  e.next = go, go = e;
}
function _s() {
  eu++;
}
function ws() {
  if (--eu > 0)
    return;
  if (mo) {
    let t = mo;
    for (mo = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; go; ) {
    let t = go;
    for (go = void 0; t; ) {
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
function nu(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function ou(e) {
  let t, n = e.depsTail, o = n;
  for (; o; ) {
    const i = o.prevDep;
    o.version === -1 ? (o === n && (n = i), Es(o), nf(o)) : t = o, o.dep.activeLink = o.prevActiveLink, o.prevActiveLink = void 0, o = i;
  }
  e.deps = t, e.depsTail = n;
}
function Dr(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (iu(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function iu(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === xo))
    return;
  e.globalVersion = xo;
  const t = e.dep;
  if (e.flags |= 2, t.version > 0 && !e.isSSR && e.deps && !Dr(e)) {
    e.flags &= -3;
    return;
  }
  const n = Ae, o = xt;
  Ae = e, xt = !0;
  try {
    nu(e);
    const i = e.fn(e._value);
    (t.version === 0 || Xt(i, e._value)) && (e._value = i, t.version++);
  } catch (i) {
    throw t.version++, i;
  } finally {
    Ae = n, xt = o, ou(e), e.flags &= -3;
  }
}
function Es(e, t = !1) {
  const { dep: n, prevSub: o, nextSub: i } = e;
  if (o && (o.nextSub = i, e.prevSub = void 0), i && (i.prevSub = o, e.nextSub = void 0), n.subs === e && (n.subs = o, !o && n.computed)) {
    n.computed.flags &= -5;
    for (let r = n.computed.deps; r; r = r.nextDep)
      Es(r, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function nf(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let xt = !0;
const ru = [];
function hn() {
  ru.push(xt), xt = !1;
}
function pn() {
  const e = ru.pop();
  xt = e === void 0 ? !0 : e;
}
function Js(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = Ae;
    Ae = void 0;
    try {
      t();
    } finally {
      Ae = n;
    }
  }
}
let xo = 0;
class of {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Ri {
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0;
  }
  track(t) {
    if (!Ae || !xt || Ae === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== Ae)
      n = this.activeLink = new of(Ae, this), Ae.deps ? (n.prevDep = Ae.depsTail, Ae.depsTail.nextDep = n, Ae.depsTail = n) : Ae.deps = Ae.depsTail = n, su(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const o = n.nextDep;
      o.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = o), n.prevDep = Ae.depsTail, n.nextDep = void 0, Ae.depsTail.nextDep = n, Ae.depsTail = n, Ae.deps === n && (Ae.deps = o);
    }
    return n;
  }
  trigger(t) {
    this.version++, xo++, this.notify(t);
  }
  notify(t) {
    _s();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      ws();
    }
  }
}
function su(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let o = t.deps; o; o = o.nextDep)
        su(o);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const vi = /* @__PURE__ */ new WeakMap(), En = Symbol(
  ""
), Ar = Symbol(
  ""
), ko = Symbol(
  ""
);
function Qe(e, t, n) {
  if (xt && Ae) {
    let o = vi.get(e);
    o || vi.set(e, o = /* @__PURE__ */ new Map());
    let i = o.get(n);
    i || (o.set(n, i = new Ri()), i.map = o, i.key = n), i.track();
  }
}
function Ht(e, t, n, o, i, r) {
  const s = vi.get(e);
  if (!s) {
    xo++;
    return;
  }
  const l = (a) => {
    a && a.trigger();
  };
  if (_s(), t === "clear")
    s.forEach(l);
  else {
    const a = he(e), u = a && ms(n);
    if (a && n === "length") {
      const c = Number(o);
      s.forEach((f, h) => {
        (h === "length" || h === ko || !kt(h) && h >= c) && l(f);
      });
    } else
      switch ((n !== void 0 || s.has(void 0)) && l(s.get(n)), u && l(s.get(ko)), t) {
        case "add":
          a ? u && l(s.get("length")) : (l(s.get(En)), Bn(e) && l(s.get(Ar)));
          break;
        case "delete":
          a || (l(s.get(En)), Bn(e) && l(s.get(Ar)));
          break;
        case "set":
          Bn(e) && l(s.get(En));
          break;
      }
  }
  ws();
}
function rf(e, t) {
  const n = vi.get(e);
  return n && n.get(t);
}
function Rn(e) {
  const t = Me(e);
  return t === e ? t : (Qe(t, "iterate", ko), yt(e) ? t : t.map(et));
}
function Li(e) {
  return Qe(e = Me(e), "iterate", ko), e;
}
const sf = {
  __proto__: null,
  [Symbol.iterator]() {
    return ar(this, Symbol.iterator, et);
  },
  concat(...e) {
    return Rn(this).concat(
      ...e.map((t) => he(t) ? Rn(t) : t)
    );
  },
  entries() {
    return ar(this, "entries", (e) => (e[1] = et(e[1]), e));
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
    return ur(this, "includes", e);
  },
  indexOf(...e) {
    return ur(this, "indexOf", e);
  },
  join(e) {
    return Rn(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return ur(this, "lastIndexOf", e);
  },
  map(e, t) {
    return zt(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return oo(this, "pop");
  },
  push(...e) {
    return oo(this, "push", e);
  },
  reduce(e, ...t) {
    return Qs(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Qs(this, "reduceRight", e, t);
  },
  shift() {
    return oo(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return zt(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return oo(this, "splice", e);
  },
  toReversed() {
    return Rn(this).toReversed();
  },
  toSorted(e) {
    return Rn(this).toSorted(e);
  },
  toSpliced(...e) {
    return Rn(this).toSpliced(...e);
  },
  unshift(...e) {
    return oo(this, "unshift", e);
  },
  values() {
    return ar(this, "values", et);
  }
};
function ar(e, t, n) {
  const o = Li(e), i = o[t]();
  return o !== e && !yt(e) && (i._next = i.next, i.next = () => {
    const r = i._next();
    return r.value && (r.value = n(r.value)), r;
  }), i;
}
const lf = Array.prototype;
function zt(e, t, n, o, i, r) {
  const s = Li(e), l = s !== e && !yt(e), a = s[t];
  if (a !== lf[t]) {
    const f = a.apply(e, r);
    return l ? et(f) : f;
  }
  let u = n;
  s !== e && (l ? u = function(f, h) {
    return n.call(this, et(f), h, e);
  } : n.length > 2 && (u = function(f, h) {
    return n.call(this, f, h, e);
  }));
  const c = a.call(s, u, o);
  return l && i ? i(c) : c;
}
function Qs(e, t, n, o) {
  const i = Li(e);
  let r = n;
  return i !== e && (yt(e) ? n.length > 3 && (r = function(s, l, a) {
    return n.call(this, s, l, a, e);
  }) : r = function(s, l, a) {
    return n.call(this, s, et(l), a, e);
  }), i[t](r, ...o);
}
function ur(e, t, n) {
  const o = Me(e);
  Qe(o, "iterate", ko);
  const i = o[t](...n);
  return (i === -1 || i === !1) && Cs(n[0]) ? (n[0] = Me(n[0]), o[t](...n)) : i;
}
function oo(e, t, n = []) {
  hn(), _s();
  const o = Me(e)[t].apply(e, n);
  return ws(), pn(), o;
}
const af = /* @__PURE__ */ ps("__proto__,__v_isRef,__isVue"), lu = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(kt)
);
function uf(e) {
  kt(e) || (e = String(e));
  const t = Me(this);
  return Qe(t, "has", e), t.hasOwnProperty(e);
}
class au {
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
      return o === (i ? r ? bf : fu : r ? du : cu).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(o) ? t : void 0;
    const s = he(t);
    if (!i) {
      let a;
      if (s && (a = sf[n]))
        return a;
      if (n === "hasOwnProperty")
        return uf;
    }
    const l = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      He(t) ? t : o
    );
    return (kt(n) ? lu.has(n) : af(n)) || (i || Qe(t, "get", n), r) ? l : He(l) ? s && ms(n) ? l : l.value : De(l) ? i ? ks(l) : xn(l) : l;
  }
}
class uu extends au {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, o, i) {
    let r = t[n];
    if (!this._isShallow) {
      const a = Nn(r);
      if (!yt(o) && !Nn(o) && (r = Me(r), o = Me(o)), !he(t) && He(r) && !He(o))
        return a ? !1 : (r.value = o, !0);
    }
    const s = he(t) && ms(n) ? Number(n) < t.length : Oe(t, n), l = Reflect.set(
      t,
      n,
      o,
      He(t) ? t : i
    );
    return t === Me(i) && (s ? Xt(o, r) && Ht(t, "set", n, o) : Ht(t, "add", n, o)), l;
  }
  deleteProperty(t, n) {
    const o = Oe(t, n);
    t[n];
    const i = Reflect.deleteProperty(t, n);
    return i && o && Ht(t, "delete", n, void 0), i;
  }
  has(t, n) {
    const o = Reflect.has(t, n);
    return (!kt(n) || !lu.has(n)) && Qe(t, "has", n), o;
  }
  ownKeys(t) {
    return Qe(
      t,
      "iterate",
      he(t) ? "length" : En
    ), Reflect.ownKeys(t);
  }
}
class cf extends au {
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
const df = /* @__PURE__ */ new uu(), ff = /* @__PURE__ */ new cf(), hf = /* @__PURE__ */ new uu(!0);
const Rr = (e) => e, Uo = (e) => Reflect.getPrototypeOf(e);
function pf(e, t, n) {
  return function(...o) {
    const i = this.__v_raw, r = Me(i), s = Bn(r), l = e === "entries" || e === Symbol.iterator && s, a = e === "keys" && s, u = i[e](...o), c = n ? Rr : t ? Lr : et;
    return !t && Qe(
      r,
      "iterate",
      a ? Ar : En
    ), {
      // iterator protocol
      next() {
        const { value: f, done: h } = u.next();
        return h ? { value: f, done: h } : {
          value: l ? [c(f[0]), c(f[1])] : c(f),
          done: h
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function Go(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function vf(e, t) {
  const n = {
    get(i) {
      const r = this.__v_raw, s = Me(r), l = Me(i);
      e || (Xt(i, l) && Qe(s, "get", i), Qe(s, "get", l));
      const { has: a } = Uo(s), u = t ? Rr : e ? Lr : et;
      if (a.call(s, i))
        return u(r.get(i));
      if (a.call(s, l))
        return u(r.get(l));
      r !== s && r.get(i);
    },
    get size() {
      const i = this.__v_raw;
      return !e && Qe(Me(i), "iterate", En), Reflect.get(i, "size", i);
    },
    has(i) {
      const r = this.__v_raw, s = Me(r), l = Me(i);
      return e || (Xt(i, l) && Qe(s, "has", i), Qe(s, "has", l)), i === l ? r.has(i) : r.has(i) || r.has(l);
    },
    forEach(i, r) {
      const s = this, l = s.__v_raw, a = Me(l), u = t ? Rr : e ? Lr : et;
      return !e && Qe(a, "iterate", En), l.forEach((c, f) => i.call(r, u(c), u(f), s));
    }
  };
  return tt(
    n,
    e ? {
      add: Go("add"),
      set: Go("set"),
      delete: Go("delete"),
      clear: Go("clear")
    } : {
      add(i) {
        !t && !yt(i) && !Nn(i) && (i = Me(i));
        const r = Me(this);
        return Uo(r).has.call(r, i) || (r.add(i), Ht(r, "add", i, i)), this;
      },
      set(i, r) {
        !t && !yt(r) && !Nn(r) && (r = Me(r));
        const s = Me(this), { has: l, get: a } = Uo(s);
        let u = l.call(s, i);
        u || (i = Me(i), u = l.call(s, i));
        const c = a.call(s, i);
        return s.set(i, r), u ? Xt(r, c) && Ht(s, "set", i, r) : Ht(s, "add", i, r), this;
      },
      delete(i) {
        const r = Me(this), { has: s, get: l } = Uo(r);
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
    n[i] = pf(i, e, t);
  }), n;
}
function xs(e, t) {
  const n = vf(e, t);
  return (o, i, r) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_raw" ? o : Reflect.get(
    Oe(n, i) && i in o ? n : o,
    i,
    r
  );
}
const gf = {
  get: /* @__PURE__ */ xs(!1, !1)
}, mf = {
  get: /* @__PURE__ */ xs(!1, !0)
}, yf = {
  get: /* @__PURE__ */ xs(!0, !1)
};
const cu = /* @__PURE__ */ new WeakMap(), du = /* @__PURE__ */ new WeakMap(), fu = /* @__PURE__ */ new WeakMap(), bf = /* @__PURE__ */ new WeakMap();
function _f(e) {
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
function wf(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : _f(Yd(e));
}
function xn(e) {
  return Nn(e) ? e : Ss(
    e,
    !1,
    df,
    gf,
    cu
  );
}
function Ef(e) {
  return Ss(
    e,
    !1,
    hf,
    mf,
    du
  );
}
function ks(e) {
  return Ss(
    e,
    !0,
    ff,
    yf,
    fu
  );
}
function Ss(e, t, n, o, i) {
  if (!De(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const r = i.get(e);
  if (r)
    return r;
  const s = wf(e);
  if (s === 0)
    return e;
  const l = new Proxy(
    e,
    s === 2 ? o : n
  );
  return i.set(e, l), l;
}
function Fn(e) {
  return Nn(e) ? Fn(e.__v_raw) : !!(e && e.__v_isReactive);
}
function Nn(e) {
  return !!(e && e.__v_isReadonly);
}
function yt(e) {
  return !!(e && e.__v_isShallow);
}
function Cs(e) {
  return e ? !!e.__v_raw : !1;
}
function Me(e) {
  const t = e && e.__v_raw;
  return t ? Me(t) : e;
}
function kn(e) {
  return !Oe(e, "__v_skip") && Object.isExtensible(e) && Xa(e, "__v_skip", !0), e;
}
const et = (e) => De(e) ? xn(e) : e, Lr = (e) => De(e) ? ks(e) : e;
function He(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function re(e) {
  return xf(e, !1);
}
function xf(e, t) {
  return He(e) ? e : new kf(e, t);
}
class kf {
  constructor(t, n) {
    this.dep = new Ri(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : Me(t), this._value = n ? t : et(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, o = this.__v_isShallow || yt(t) || Nn(t);
    t = o ? t : Me(t), Xt(t, n) && (this._rawValue = t, this._value = o ? t : et(t), this.dep.trigger());
  }
}
function V(e) {
  return He(e) ? e.value : e;
}
function Ce(e) {
  return be(e) ? e() : V(e);
}
const Sf = {
  get: (e, t, n) => t === "__v_raw" ? e : V(Reflect.get(e, t, n)),
  set: (e, t, n, o) => {
    const i = e[t];
    return He(i) && !He(n) ? (i.value = n, !0) : Reflect.set(e, t, n, o);
  }
};
function hu(e) {
  return Fn(e) ? e : new Proxy(e, Sf);
}
class Cf {
  constructor(t) {
    this.__v_isRef = !0, this._value = void 0;
    const n = this.dep = new Ri(), { get: o, set: i } = t(n.track.bind(n), n.trigger.bind(n));
    this._get = o, this._set = i;
  }
  get value() {
    return this._value = this._get();
  }
  set value(t) {
    this._set(t);
  }
}
function Nf(e) {
  return new Cf(e);
}
function $f(e) {
  const t = he(e) ? new Array(e.length) : {};
  for (const n in e)
    t[n] = pu(e, n);
  return t;
}
class Mf {
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
    return rf(Me(this._object), this._key);
  }
}
class If {
  constructor(t) {
    this._getter = t, this.__v_isRef = !0, this.__v_isReadonly = !0, this._value = void 0;
  }
  get value() {
    return this._value = this._getter();
  }
}
function ze(e, t, n) {
  return He(e) ? e : be(e) ? new If(e) : De(e) && arguments.length > 1 ? pu(e, t, n) : re(e);
}
function pu(e, t, n) {
  const o = e[t];
  return He(o) ? o : new Mf(e, t, n);
}
class Of {
  constructor(t, n, o) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Ri(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = xo - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = o;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    Ae !== this)
      return tu(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return iu(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Tf(e, t, n = !1) {
  let o, i;
  return be(e) ? o = e : (o = e.get, i = e.set), new Of(o, i, n);
}
const Yo = {}, gi = /* @__PURE__ */ new WeakMap();
let yn;
function Pf(e, t = !1, n = yn) {
  if (n) {
    let o = gi.get(n);
    o || gi.set(n, o = []), o.push(e);
  }
}
function Df(e, t, n = Pe) {
  const { immediate: o, deep: i, once: r, scheduler: s, augmentJob: l, call: a } = n, u = (_) => i ? _ : yt(_) || i === !1 || i === 0 ? jt(_, 1) : jt(_);
  let c, f, h, m, C = !1, N = !1;
  if (He(e) ? (f = () => e.value, C = yt(e)) : Fn(e) ? (f = () => u(e), C = !0) : he(e) ? (N = !0, C = e.some((_) => Fn(_) || yt(_)), f = () => e.map((_) => {
    if (He(_))
      return _.value;
    if (Fn(_))
      return u(_);
    if (be(_))
      return a ? a(_, 2) : _();
  })) : be(e) ? t ? f = a ? () => a(e, 2) : e : f = () => {
    if (h) {
      hn();
      try {
        h();
      } finally {
        pn();
      }
    }
    const _ = yn;
    yn = c;
    try {
      return a ? a(e, 3, [m]) : e(m);
    } finally {
      yn = _;
    }
  } : f = Dt, t && i) {
    const _ = f, B = i === !0 ? 1 / 0 : i;
    f = () => jt(_(), B);
  }
  const $ = bs(), I = () => {
    c.stop(), $ && $.active && gs($.effects, c);
  };
  if (r && t) {
    const _ = t;
    t = (...B) => {
      _(...B), I();
    };
  }
  let A = N ? new Array(e.length).fill(Yo) : Yo;
  const k = (_) => {
    if (!(!(c.flags & 1) || !c.dirty && !_))
      if (t) {
        const B = c.run();
        if (i || C || (N ? B.some((M, E) => Xt(M, A[E])) : Xt(B, A))) {
          h && h();
          const M = yn;
          yn = c;
          try {
            const E = [
              B,
              // pass undefined as the old value when it's changed for the first time
              A === Yo ? void 0 : N && A[0] === Yo ? [] : A,
              m
            ];
            a ? a(t, 3, E) : (
              // @ts-expect-error
              t(...E)
            ), A = B;
          } finally {
            yn = M;
          }
        }
      } else
        c.run();
  };
  return l && l(k), c = new Qa(f), c.scheduler = s ? () => s(k, !1) : k, m = (_) => Pf(_, !1, c), h = c.onStop = () => {
    const _ = gi.get(c);
    if (_) {
      if (a)
        a(_, 4);
      else
        for (const B of _) B();
      gi.delete(c);
    }
  }, t ? o ? k(!0) : A = c.run() : s ? s(k.bind(null, !0), !0) : c.run(), I.pause = c.pause.bind(c), I.resume = c.resume.bind(c), I.stop = I, I;
}
function jt(e, t = 1 / 0, n) {
  if (t <= 0 || !De(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, He(e))
    jt(e.value, t, n);
  else if (he(e))
    for (let o = 0; o < e.length; o++)
      jt(e[o], t, n);
  else if (eo(e) || Bn(e))
    e.forEach((o) => {
      jt(o, t, n);
    });
  else if (Ya(e)) {
    for (const o in e)
      jt(e[o], t, n);
    for (const o of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, o) && jt(e[o], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function zo(e, t, n, o) {
  try {
    return o ? e(...o) : e();
  } catch (i) {
    Vi(i, t, n);
  }
}
function Lt(e, t, n, o) {
  if (be(e)) {
    const i = zo(e, t, n, o);
    return i && Ua(i) && i.catch((r) => {
      Vi(r, t, n);
    }), i;
  }
  if (he(e)) {
    const i = [];
    for (let r = 0; r < e.length; r++)
      i.push(Lt(e[r], t, n, o));
    return i;
  }
}
function Vi(e, t, n, o = !0) {
  const i = t ? t.vnode : null, { errorHandler: r, throwUnhandledErrorInProduction: s } = t && t.appContext.config || Pe;
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
      hn(), zo(r, null, 10, [
        e,
        a,
        u
      ]), pn();
      return;
    }
  }
  Af(e, n, i, o, s);
}
function Af(e, t, n, o = !0, i = !1) {
  if (i)
    throw e;
  console.error(e);
}
const lt = [];
let Ot = -1;
const Hn = [];
let en = null, Vn = 0;
const vu = /* @__PURE__ */ Promise.resolve();
let mi = null;
function Ze(e) {
  const t = mi || vu;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Rf(e) {
  let t = Ot + 1, n = lt.length;
  for (; t < n; ) {
    const o = t + n >>> 1, i = lt[o], r = So(i);
    r < e || r === e && i.flags & 2 ? t = o + 1 : n = o;
  }
  return t;
}
function Ns(e) {
  if (!(e.flags & 1)) {
    const t = So(e), n = lt[lt.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= So(n) ? lt.push(e) : lt.splice(Rf(t), 0, e), e.flags |= 1, gu();
  }
}
function gu() {
  mi || (mi = vu.then(yu));
}
function Lf(e) {
  he(e) ? Hn.push(...e) : en && e.id === -1 ? en.splice(Vn + 1, 0, e) : e.flags & 1 || (Hn.push(e), e.flags |= 1), gu();
}
function el(e, t, n = Ot + 1) {
  for (; n < lt.length; n++) {
    const o = lt[n];
    if (o && o.flags & 2) {
      if (e && o.id !== e.uid)
        continue;
      lt.splice(n, 1), n--, o.flags & 4 && (o.flags &= -2), o(), o.flags & 4 || (o.flags &= -2);
    }
  }
}
function mu(e) {
  if (Hn.length) {
    const t = [...new Set(Hn)].sort(
      (n, o) => So(n) - So(o)
    );
    if (Hn.length = 0, en) {
      en.push(...t);
      return;
    }
    for (en = t, Vn = 0; Vn < en.length; Vn++) {
      const n = en[Vn];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    en = null, Vn = 0;
  }
}
const So = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function yu(e) {
  try {
    for (Ot = 0; Ot < lt.length; Ot++) {
      const t = lt[Ot];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), zo(
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
    Ot = -1, lt.length = 0, mu(), mi = null, (lt.length || Hn.length) && yu();
  }
}
let Ke = null, bu = null;
function yi(e) {
  const t = Ke;
  return Ke = e, bu = e && e.type.__scopeId || null, t;
}
function un(e, t = Ke, n) {
  if (!t || e._n)
    return e;
  const o = (...i) => {
    o._d && cl(-1);
    const r = yi(t);
    let s;
    try {
      s = e(...i);
    } finally {
      yi(r), o._d && cl(1);
    }
    return s;
  };
  return o._n = !0, o._c = !0, o._d = !0, o;
}
function Xe(e, t) {
  if (Ke === null)
    return e;
  const n = ji(Ke), o = e.dirs || (e.dirs = []);
  for (let i = 0; i < t.length; i++) {
    let [r, s, l, a = Pe] = t[i];
    r && (be(r) && (r = {
      mounted: r,
      updated: r
    }), r.deep && jt(s), o.push({
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
function vn(e, t, n, o) {
  const i = e.dirs, r = t && t.dirs;
  for (let s = 0; s < i.length; s++) {
    const l = i[s];
    r && (l.oldValue = r[s].value);
    let a = l.dir[o];
    a && (hn(), Lt(a, n, 8, [
      e.el,
      l,
      e,
      t
    ]), pn());
  }
}
const Vf = Symbol("_vte"), zf = (e) => e.__isTeleport;
function $s(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, $s(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Te(e, t) {
  return be(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    tt({ name: e.name }, t, { setup: e })
  ) : e;
}
function _u(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function bi(e, t, n, o, i = !1) {
  if (he(e)) {
    e.forEach(
      (C, N) => bi(
        C,
        t && (he(t) ? t[N] : t),
        n,
        o,
        i
      )
    );
    return;
  }
  if (jn(o) && !i) {
    o.shapeFlag & 512 && o.type.__asyncResolved && o.component.subTree.component && bi(e, t, n, o.component.subTree);
    return;
  }
  const r = o.shapeFlag & 4 ? ji(o.component) : o.el, s = i ? null : r, { i: l, r: a } = e, u = t && t.r, c = l.refs === Pe ? l.refs = {} : l.refs, f = l.setupState, h = Me(f), m = f === Pe ? () => !1 : (C) => Oe(h, C);
  if (u != null && u !== a && (Fe(u) ? (c[u] = null, m(u) && (f[u] = null)) : He(u) && (u.value = null)), be(a))
    zo(a, l, 12, [s, c]);
  else {
    const C = Fe(a), N = He(a);
    if (C || N) {
      const $ = () => {
        if (e.f) {
          const I = C ? m(a) ? f[a] : c[a] : a.value;
          i ? he(I) && gs(I, r) : he(I) ? I.includes(r) || I.push(r) : C ? (c[a] = [r], m(a) && (f[a] = c[a])) : (a.value = [r], e.k && (c[e.k] = a.value));
        } else C ? (c[a] = s, m(a) && (f[a] = s)) : N && (a.value = s, e.k && (c[e.k] = s));
      };
      s ? ($.id = -1, pt($, n)) : $();
    }
  }
}
Ai().requestIdleCallback;
Ai().cancelIdleCallback;
const jn = (e) => !!e.type.__asyncLoader, wu = (e) => e.type.__isKeepAlive;
function Bf(e, t) {
  Eu(e, "a", t);
}
function Ff(e, t) {
  Eu(e, "da", t);
}
function Eu(e, t, n = Je) {
  const o = e.__wdc || (e.__wdc = () => {
    let i = n;
    for (; i; ) {
      if (i.isDeactivated)
        return;
      i = i.parent;
    }
    return e();
  });
  if (zi(t, o, n), n) {
    let i = n.parent;
    for (; i && i.parent; )
      wu(i.parent.vnode) && Hf(o, t, n, i), i = i.parent;
  }
}
function Hf(e, t, n, o) {
  const i = zi(
    t,
    e,
    o,
    !0
    /* prepend */
  );
  Bi(() => {
    gs(o[t], i);
  }, n);
}
function zi(e, t, n = Je, o = !1) {
  if (n) {
    const i = n[e] || (n[e] = []), r = t.__weh || (t.__weh = (...s) => {
      hn();
      const l = Bo(n), a = Lt(t, n, e, s);
      return l(), pn(), a;
    });
    return o ? i.unshift(r) : i.push(r), r;
  }
}
const Zt = (e) => (t, n = Je) => {
  (!No || e === "sp") && zi(e, (...o) => t(...o), n);
}, xu = Zt("bm"), mt = Zt("m"), jf = Zt(
  "bu"
), Uf = Zt("u"), Dn = Zt(
  "bum"
), Bi = Zt("um"), Gf = Zt(
  "sp"
), Yf = Zt("rtg"), Xf = Zt("rtc");
function Wf(e, t = Je) {
  zi("ec", e, t);
}
const ku = "components";
function Su(e, t) {
  return $u(ku, e, !0, t) || e;
}
const Cu = Symbol.for("v-ndc");
function Nu(e) {
  return Fe(e) ? $u(ku, e, !1) || e : e || Cu;
}
function $u(e, t, n = !0, o = !1) {
  const i = Ke || Je;
  if (i) {
    const r = i.type;
    {
      const l = Dh(
        r,
        !1
      );
      if (l && (l === t || l === bt(t) || l === Di(bt(t))))
        return r;
    }
    const s = (
      // local registration
      // check instance[type] first which is resolved for options API
      tl(i[e] || r[e], t) || // global registration
      tl(i.appContext[e], t)
    );
    return !s && o ? r : s;
  }
}
function tl(e, t) {
  return e && (e[t] || e[bt(t)] || e[Di(bt(t))]);
}
function Re(e, t, n, o) {
  let i;
  const r = n && n[o], s = he(e);
  if (s || Fe(e)) {
    const l = s && Fn(e);
    let a = !1;
    l && (a = !yt(e), e = Li(e)), i = new Array(e.length);
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
  } else if (De(e))
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
function $n(e, t, n = {}, o, i) {
  if (Ke.ce || Ke.parent && jn(Ke.parent) && Ke.parent.ce)
    return t !== "default" && (n.name = t), U(), vt(
      me,
      null,
      [ie("slot", n, o && o())],
      64
    );
  let r = e[t];
  r && r._c && (r._d = !1), U();
  const s = r && Mu(r(n)), l = n.key || // slot content array of a dynamic conditional slot may have a branch
  // key attached in the `createSlots` helper, respect that
  s && s.key, a = vt(
    me,
    {
      key: (l && !kt(l) ? l : `_${t}`) + // #7256 force differentiate fallback content from actual content
      (!s && o ? "_fb" : "")
    },
    s || (o ? o() : []),
    s && e._ === 1 ? 64 : -2
  );
  return a.scopeId && (a.slotScopeIds = [a.scopeId + "-s"]), r && r._c && (r._d = !0), a;
}
function Mu(e) {
  return e.some((t) => Co(t) ? !(t.type === dn || t.type === me && !Mu(t.children)) : !0) ? e : null;
}
const Vr = (e) => e ? Ju(e) ? ji(e) : Vr(e.parent) : null, yo = (
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
    $parent: (e) => Vr(e.parent),
    $root: (e) => Vr(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => Pu(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Ns(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = Ze.bind(e.proxy)),
    $watch: (e) => mh.bind(e)
  })
), cr = (e, t) => e !== Pe && !e.__isScriptSetup && Oe(e, t), qf = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: o, data: i, props: r, accessCache: s, type: l, appContext: a } = e;
    let u;
    if (t[0] !== "$") {
      const m = s[t];
      if (m !== void 0)
        switch (m) {
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
        if (cr(o, t))
          return s[t] = 1, o[t];
        if (i !== Pe && Oe(i, t))
          return s[t] = 2, i[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (u = e.propsOptions[0]) && Oe(u, t)
        )
          return s[t] = 3, r[t];
        if (n !== Pe && Oe(n, t))
          return s[t] = 4, n[t];
        zr && (s[t] = 0);
      }
    }
    const c = yo[t];
    let f, h;
    if (c)
      return t === "$attrs" && Qe(e.attrs, "get", ""), c(e);
    if (
      // css module (injected by vue-loader)
      (f = l.__cssModules) && (f = f[t])
    )
      return f;
    if (n !== Pe && Oe(n, t))
      return s[t] = 4, n[t];
    if (
      // global properties
      h = a.config.globalProperties, Oe(h, t)
    )
      return h[t];
  },
  set({ _: e }, t, n) {
    const { data: o, setupState: i, ctx: r } = e;
    return cr(i, t) ? (i[t] = n, !0) : o !== Pe && Oe(o, t) ? (o[t] = n, !0) : Oe(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (r[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: o, appContext: i, propsOptions: r }
  }, s) {
    let l;
    return !!n[s] || e !== Pe && Oe(e, s) || cr(t, s) || (l = r[0]) && Oe(l, s) || Oe(o, s) || Oe(yo, s) || Oe(i.config.globalProperties, s);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : Oe(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Kf() {
  return Iu().slots;
}
function Zf() {
  return Iu().attrs;
}
function Iu() {
  const e = to();
  return e.setupContext || (e.setupContext = ec(e));
}
function nl(e) {
  return he(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
function Ou(e, t) {
  const n = {};
  for (const o in e)
    t.includes(o) || Object.defineProperty(n, o, {
      enumerable: !0,
      get: () => e[o]
    });
  return n;
}
let zr = !0;
function Jf(e) {
  const t = Pu(e), n = e.proxy, o = e.ctx;
  zr = !1, t.beforeCreate && ol(t.beforeCreate, e, "bc");
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
    mounted: h,
    beforeUpdate: m,
    updated: C,
    activated: N,
    deactivated: $,
    beforeDestroy: I,
    beforeUnmount: A,
    destroyed: k,
    unmounted: _,
    render: B,
    renderTracked: M,
    renderTriggered: E,
    errorCaptured: Y,
    serverPrefetch: ne,
    // public API
    expose: G,
    inheritAttrs: Z,
    // assets
    components: T,
    directives: R,
    filters: w
  } = t;
  if (u && Qf(u, o, null), s)
    for (const F in s) {
      const X = s[F];
      be(X) && (o[F] = X.bind(n));
    }
  if (i) {
    const F = i.call(n, n);
    De(F) && (e.data = xn(F));
  }
  if (zr = !0, r)
    for (const F in r) {
      const X = r[F], Q = be(X) ? X.bind(n, n) : be(X.get) ? X.get.bind(n, n) : Dt, oe = !be(X) && be(X.set) ? X.set.bind(n) : Dt, ue = ce({
        get: Q,
        set: oe
      });
      Object.defineProperty(o, F, {
        enumerable: !0,
        configurable: !0,
        get: () => ue.value,
        set: (ee) => ue.value = ee
      });
    }
  if (l)
    for (const F in l)
      Tu(l[F], o, n, F);
  if (a) {
    const F = be(a) ? a.call(n) : a;
    Reflect.ownKeys(F).forEach((X) => {
      Mn(X, F[X]);
    });
  }
  c && ol(c, e, "c");
  function P(F, X) {
    he(X) ? X.forEach((Q) => F(Q.bind(n))) : X && F(X.bind(n));
  }
  if (P(xu, f), P(mt, h), P(jf, m), P(Uf, C), P(Bf, N), P(Ff, $), P(Wf, Y), P(Xf, M), P(Yf, E), P(Dn, A), P(Bi, _), P(Gf, ne), he(G))
    if (G.length) {
      const F = e.exposed || (e.exposed = {});
      G.forEach((X) => {
        Object.defineProperty(F, X, {
          get: () => n[X],
          set: (Q) => n[X] = Q
        });
      });
    } else e.exposed || (e.exposed = {});
  B && e.render === Dt && (e.render = B), Z != null && (e.inheritAttrs = Z), T && (e.components = T), R && (e.directives = R), ne && _u(e);
}
function Qf(e, t, n = Dt) {
  he(e) && (e = Br(e));
  for (const o in e) {
    const i = e[o];
    let r;
    De(i) ? "default" in i ? r = At(
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
function ol(e, t, n) {
  Lt(
    he(e) ? e.map((o) => o.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function Tu(e, t, n, o) {
  let i = o.includes(".") ? Xu(n, o) : () => n[o];
  if (Fe(e)) {
    const r = t[e];
    be(r) && ke(i, r);
  } else if (be(e))
    ke(i, e.bind(n));
  else if (De(e))
    if (he(e))
      e.forEach((r) => Tu(r, t, n, o));
    else {
      const r = be(e.handler) ? e.handler.bind(n) : t[e.handler];
      be(r) && ke(i, r, e);
    }
}
function Pu(e) {
  const t = e.type, { mixins: n, extends: o } = t, {
    mixins: i,
    optionsCache: r,
    config: { optionMergeStrategies: s }
  } = e.appContext, l = r.get(t);
  let a;
  return l ? a = l : !i.length && !n && !o ? a = t : (a = {}, i.length && i.forEach(
    (u) => _i(a, u, s, !0)
  ), _i(a, t, s)), De(t) && r.set(t, a), a;
}
function _i(e, t, n, o = !1) {
  const { mixins: i, extends: r } = t;
  r && _i(e, r, n, !0), i && i.forEach(
    (s) => _i(e, s, n, !0)
  );
  for (const s in t)
    if (!(o && s === "expose")) {
      const l = eh[s] || n && n[s];
      e[s] = l ? l(e[s], t[s]) : t[s];
    }
  return e;
}
const eh = {
  data: il,
  props: rl,
  emits: rl,
  // objects
  methods: ao,
  computed: ao,
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
  components: ao,
  directives: ao,
  // watch
  watch: nh,
  // provide / inject
  provide: il,
  inject: th
};
function il(e, t) {
  return t ? e ? function() {
    return tt(
      be(e) ? e.call(this, this) : e,
      be(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function th(e, t) {
  return ao(Br(e), Br(t));
}
function Br(e) {
  if (he(e)) {
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
function ao(e, t) {
  return e ? tt(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function rl(e, t) {
  return e ? he(e) && he(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : tt(
    /* @__PURE__ */ Object.create(null),
    nl(e),
    nl(t ?? {})
  ) : t;
}
function nh(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = tt(/* @__PURE__ */ Object.create(null), e);
  for (const o in t)
    n[o] = ot(e[o], t[o]);
  return n;
}
function Du() {
  return {
    app: null,
    config: {
      isNativeTag: Ud,
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
let oh = 0;
function ih(e, t) {
  return function(o, i = null) {
    be(o) || (o = tt({}, o)), i != null && !De(i) && (i = null);
    const r = Du(), s = /* @__PURE__ */ new WeakSet(), l = [];
    let a = !1;
    const u = r.app = {
      _uid: oh++,
      _component: o,
      _props: i,
      _container: null,
      _context: r,
      _instance: null,
      version: Lh,
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
      mount(c, f, h) {
        if (!a) {
          const m = u._ceVNode || ie(o, i);
          return m.appContext = r, h === !0 ? h = "svg" : h === !1 && (h = void 0), e(m, c, h), a = !0, u._container = c, c.__vue_app__ = u, ji(m.component);
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
        const f = Un;
        Un = u;
        try {
          return c();
        } finally {
          Un = f;
        }
      }
    };
    return u;
  };
}
let Un = null;
function Mn(e, t) {
  if (Je) {
    let n = Je.provides;
    const o = Je.parent && Je.parent.provides;
    o === n && (n = Je.provides = Object.create(o)), n[e] = t;
  }
}
function At(e, t, n = !1) {
  const o = Je || Ke;
  if (o || Un) {
    const i = Un ? Un._context.provides : o ? o.parent == null ? o.vnode.appContext && o.vnode.appContext.provides : o.parent.provides : void 0;
    if (i && e in i)
      return i[e];
    if (arguments.length > 1)
      return n && be(t) ? t.call(o && o.proxy) : t;
  }
}
const Au = {}, Ru = () => Object.create(Au), Lu = (e) => Object.getPrototypeOf(e) === Au;
function rh(e, t, n, o = !1) {
  const i = {}, r = Ru();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), Vu(e, t, i, r);
  for (const s in e.propsOptions[0])
    s in i || (i[s] = void 0);
  n ? e.props = o ? i : Ef(i) : e.type.props ? e.props = i : e.props = r, e.attrs = r;
}
function sh(e, t, n, o) {
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
        let h = c[f];
        if (Fi(e.emitsOptions, h))
          continue;
        const m = t[h];
        if (a)
          if (Oe(r, h))
            m !== r[h] && (r[h] = m, u = !0);
          else {
            const C = bt(h);
            i[C] = Fr(
              a,
              l,
              C,
              m,
              e,
              !1
            );
          }
        else
          m !== r[h] && (r[h] = m, u = !0);
      }
    }
  } else {
    Vu(e, t, i, r) && (u = !0);
    let c;
    for (const f in l)
      (!t || // for camelCase
      !Oe(t, f) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = Pn(f)) === f || !Oe(t, c))) && (a ? n && // for camelCase
      (n[f] !== void 0 || // for kebab-case
      n[c] !== void 0) && (i[f] = Fr(
        a,
        l,
        f,
        void 0,
        e,
        !0
      )) : delete i[f]);
    if (r !== l)
      for (const f in r)
        (!t || !Oe(t, f)) && (delete r[f], u = !0);
  }
  u && Ht(e.attrs, "set", "");
}
function Vu(e, t, n, o) {
  const [i, r] = e.propsOptions;
  let s = !1, l;
  if (t)
    for (let a in t) {
      if (vo(a))
        continue;
      const u = t[a];
      let c;
      i && Oe(i, c = bt(a)) ? !r || !r.includes(c) ? n[c] = u : (l || (l = {}))[c] = u : Fi(e.emitsOptions, a) || (!(a in o) || u !== o[a]) && (o[a] = u, s = !0);
    }
  if (r) {
    const a = Me(n), u = l || Pe;
    for (let c = 0; c < r.length; c++) {
      const f = r[c];
      n[f] = Fr(
        i,
        a,
        f,
        u[f],
        e,
        !Oe(u, f)
      );
    }
  }
  return s;
}
function Fr(e, t, n, o, i, r) {
  const s = e[n];
  if (s != null) {
    const l = Oe(s, "default");
    if (l && o === void 0) {
      const a = s.default;
      if (s.type !== Function && !s.skipFactory && be(a)) {
        const { propsDefaults: u } = i;
        if (n in u)
          o = u[n];
        else {
          const c = Bo(i);
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
    ] && (o === "" || o === Pn(n)) && (o = !0));
  }
  return o;
}
const lh = /* @__PURE__ */ new WeakMap();
function zu(e, t, n = !1) {
  const o = n ? lh : t.propsCache, i = o.get(e);
  if (i)
    return i;
  const r = e.props, s = {}, l = [];
  let a = !1;
  if (!be(e)) {
    const c = (f) => {
      a = !0;
      const [h, m] = zu(f, t, !0);
      tt(s, h), m && l.push(...m);
    };
    !n && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
  }
  if (!r && !a)
    return De(e) && o.set(e, zn), zn;
  if (he(r))
    for (let c = 0; c < r.length; c++) {
      const f = bt(r[c]);
      sl(f) && (s[f] = Pe);
    }
  else if (r)
    for (const c in r) {
      const f = bt(c);
      if (sl(f)) {
        const h = r[c], m = s[f] = he(h) || be(h) ? { type: h } : tt({}, h), C = m.type;
        let N = !1, $ = !0;
        if (he(C))
          for (let I = 0; I < C.length; ++I) {
            const A = C[I], k = be(A) && A.name;
            if (k === "Boolean") {
              N = !0;
              break;
            } else k === "String" && ($ = !1);
          }
        else
          N = be(C) && C.name === "Boolean";
        m[
          0
          /* shouldCast */
        ] = N, m[
          1
          /* shouldCastTrue */
        ] = $, (N || Oe(m, "default")) && l.push(f);
      }
    }
  const u = [s, l];
  return De(e) && o.set(e, u), u;
}
function sl(e) {
  return e[0] !== "$" && !vo(e);
}
const Bu = (e) => e[0] === "_" || e === "$stable", Ms = (e) => he(e) ? e.map(Pt) : [Pt(e)], ah = (e, t, n) => {
  if (t._n)
    return t;
  const o = un((...i) => Ms(t(...i)), n);
  return o._c = !1, o;
}, Fu = (e, t, n) => {
  const o = e._ctx;
  for (const i in e) {
    if (Bu(i)) continue;
    const r = e[i];
    if (be(r))
      t[i] = ah(i, r, o);
    else if (r != null) {
      const s = Ms(r);
      t[i] = () => s;
    }
  }
}, Hu = (e, t) => {
  const n = Ms(t);
  e.slots.default = () => n;
}, ju = (e, t, n) => {
  for (const o in t)
    (n || o !== "_") && (e[o] = t[o]);
}, uh = (e, t, n) => {
  const o = e.slots = Ru();
  if (e.vnode.shapeFlag & 32) {
    const i = t._;
    i ? (ju(o, t, n), n && Xa(o, "_", i, !0)) : Fu(t, o);
  } else t && Hu(e, t);
}, ch = (e, t, n) => {
  const { vnode: o, slots: i } = e;
  let r = !0, s = Pe;
  if (o.shapeFlag & 32) {
    const l = t._;
    l ? n && l === 1 ? r = !1 : ju(i, t, n) : (r = !t.$stable, Fu(t, i)), s = t;
  } else t && (Hu(e, t), s = { default: 1 });
  if (r)
    for (const l in i)
      !Bu(l) && s[l] == null && delete i[l];
}, pt = kh;
function dh(e) {
  return fh(e);
}
function fh(e, t) {
  const n = Ai();
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
    nextSibling: h,
    setScopeId: m = Dt,
    insertStaticContent: C
  } = e, N = (d, x, v, g = null, y = null, b = null, O = void 0, L = null, z = !!x.dynamicChildren) => {
    if (d === x)
      return;
    d && !io(d, x) && (g = ye(d), ee(d, y, b, !0), d = null), x.patchFlag === -2 && (z = !1, x.dynamicChildren = null);
    const { type: S, ref: K, shapeFlag: q } = x;
    switch (S) {
      case Hi:
        $(d, x, v, g);
        break;
      case dn:
        I(d, x, v, g);
        break;
      case si:
        d == null && A(x, v, g, O);
        break;
      case me:
        T(
          d,
          x,
          v,
          g,
          y,
          b,
          O,
          L,
          z
        );
        break;
      default:
        q & 1 ? B(
          d,
          x,
          v,
          g,
          y,
          b,
          O,
          L,
          z
        ) : q & 6 ? R(
          d,
          x,
          v,
          g,
          y,
          b,
          O,
          L,
          z
        ) : (q & 64 || q & 128) && S.process(
          d,
          x,
          v,
          g,
          y,
          b,
          O,
          L,
          z,
          pe
        );
    }
    K != null && y && bi(K, d && d.ref, b, x || d, !x);
  }, $ = (d, x, v, g) => {
    if (d == null)
      o(
        x.el = l(x.children),
        v,
        g
      );
    else {
      const y = x.el = d.el;
      x.children !== d.children && u(y, x.children);
    }
  }, I = (d, x, v, g) => {
    d == null ? o(
      x.el = a(x.children || ""),
      v,
      g
    ) : x.el = d.el;
  }, A = (d, x, v, g) => {
    [d.el, d.anchor] = C(
      d.children,
      x,
      v,
      g,
      d.el,
      d.anchor
    );
  }, k = ({ el: d, anchor: x }, v, g) => {
    let y;
    for (; d && d !== x; )
      y = h(d), o(d, v, g), d = y;
    o(x, v, g);
  }, _ = ({ el: d, anchor: x }) => {
    let v;
    for (; d && d !== x; )
      v = h(d), i(d), d = v;
    i(x);
  }, B = (d, x, v, g, y, b, O, L, z) => {
    x.type === "svg" ? O = "svg" : x.type === "math" && (O = "mathml"), d == null ? M(
      x,
      v,
      g,
      y,
      b,
      O,
      L,
      z
    ) : ne(
      d,
      x,
      y,
      b,
      O,
      L,
      z
    );
  }, M = (d, x, v, g, y, b, O, L) => {
    let z, S;
    const { props: K, shapeFlag: q, transition: te, dirs: se } = d;
    if (z = d.el = s(
      d.type,
      b,
      K && K.is,
      K
    ), q & 8 ? c(z, d.children) : q & 16 && Y(
      d.children,
      z,
      null,
      g,
      y,
      dr(d, b),
      O,
      L
    ), se && vn(d, null, g, "created"), E(z, d, d.scopeId, O, g), K) {
      for (const Ee in K)
        Ee !== "value" && !vo(Ee) && r(z, Ee, null, K[Ee], b, g);
      "value" in K && r(z, "value", null, K.value, b), (S = K.onVnodeBeforeMount) && It(S, g, d);
    }
    se && vn(d, null, g, "beforeMount");
    const ve = hh(y, te);
    ve && te.beforeEnter(z), o(z, x, v), ((S = K && K.onVnodeMounted) || ve || se) && pt(() => {
      S && It(S, g, d), ve && te.enter(z), se && vn(d, null, g, "mounted");
    }, y);
  }, E = (d, x, v, g, y) => {
    if (v && m(d, v), g)
      for (let b = 0; b < g.length; b++)
        m(d, g[b]);
    if (y) {
      let b = y.subTree;
      if (x === b || qu(b.type) && (b.ssContent === x || b.ssFallback === x)) {
        const O = y.vnode;
        E(
          d,
          O,
          O.scopeId,
          O.slotScopeIds,
          y.parent
        );
      }
    }
  }, Y = (d, x, v, g, y, b, O, L, z = 0) => {
    for (let S = z; S < d.length; S++) {
      const K = d[S] = L ? tn(d[S]) : Pt(d[S]);
      N(
        null,
        K,
        x,
        v,
        g,
        y,
        b,
        O,
        L
      );
    }
  }, ne = (d, x, v, g, y, b, O) => {
    const L = x.el = d.el;
    let { patchFlag: z, dynamicChildren: S, dirs: K } = x;
    z |= d.patchFlag & 16;
    const q = d.props || Pe, te = x.props || Pe;
    let se;
    if (v && gn(v, !1), (se = te.onVnodeBeforeUpdate) && It(se, v, x, d), K && vn(x, d, v, "beforeUpdate"), v && gn(v, !0), (q.innerHTML && te.innerHTML == null || q.textContent && te.textContent == null) && c(L, ""), S ? G(
      d.dynamicChildren,
      S,
      L,
      v,
      g,
      dr(x, y),
      b
    ) : O || X(
      d,
      x,
      L,
      null,
      v,
      g,
      dr(x, y),
      b,
      !1
    ), z > 0) {
      if (z & 16)
        Z(L, q, te, v, y);
      else if (z & 2 && q.class !== te.class && r(L, "class", null, te.class, y), z & 4 && r(L, "style", q.style, te.style, y), z & 8) {
        const ve = x.dynamicProps;
        for (let Ee = 0; Ee < ve.length; Ee++) {
          const $e = ve[Ee], nt = q[$e], ct = te[$e];
          (ct !== nt || $e === "value") && r(L, $e, nt, ct, y, v);
        }
      }
      z & 1 && d.children !== x.children && c(L, x.children);
    } else !O && S == null && Z(L, q, te, v, y);
    ((se = te.onVnodeUpdated) || K) && pt(() => {
      se && It(se, v, x, d), K && vn(x, d, v, "updated");
    }, g);
  }, G = (d, x, v, g, y, b, O) => {
    for (let L = 0; L < x.length; L++) {
      const z = d[L], S = x[L], K = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        z.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (z.type === me || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !io(z, S) || // - In the case of a component, it could contain anything.
        z.shapeFlag & 70) ? f(z.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          v
        )
      );
      N(
        z,
        S,
        K,
        null,
        g,
        y,
        b,
        O,
        !0
      );
    }
  }, Z = (d, x, v, g, y) => {
    if (x !== v) {
      if (x !== Pe)
        for (const b in x)
          !vo(b) && !(b in v) && r(
            d,
            b,
            x[b],
            null,
            y,
            g
          );
      for (const b in v) {
        if (vo(b)) continue;
        const O = v[b], L = x[b];
        O !== L && b !== "value" && r(d, b, L, O, y, g);
      }
      "value" in v && r(d, "value", x.value, v.value, y);
    }
  }, T = (d, x, v, g, y, b, O, L, z) => {
    const S = x.el = d ? d.el : l(""), K = x.anchor = d ? d.anchor : l("");
    let { patchFlag: q, dynamicChildren: te, slotScopeIds: se } = x;
    se && (L = L ? L.concat(se) : se), d == null ? (o(S, v, g), o(K, v, g), Y(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      x.children || [],
      v,
      K,
      y,
      b,
      O,
      L,
      z
    )) : q > 0 && q & 64 && te && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    d.dynamicChildren ? (G(
      d.dynamicChildren,
      te,
      v,
      y,
      b,
      O,
      L
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (x.key != null || y && x === y.subTree) && Uu(
      d,
      x,
      !0
      /* shallow */
    )) : X(
      d,
      x,
      v,
      K,
      y,
      b,
      O,
      L,
      z
    );
  }, R = (d, x, v, g, y, b, O, L, z) => {
    x.slotScopeIds = L, d == null ? x.shapeFlag & 512 ? y.ctx.activate(
      x,
      v,
      g,
      O,
      z
    ) : w(
      x,
      v,
      g,
      y,
      b,
      O,
      z
    ) : D(d, x, z);
  }, w = (d, x, v, g, y, b, O) => {
    const L = d.component = Ih(
      d,
      g,
      y
    );
    if (wu(d) && (L.ctx.renderer = pe), Oh(L, !1, O), L.asyncDep) {
      if (y && y.registerDep(L, P, O), !d.el) {
        const z = L.subTree = ie(dn);
        I(null, z, x, v);
      }
    } else
      P(
        L,
        d,
        x,
        v,
        y,
        b,
        O
      );
  }, D = (d, x, v) => {
    const g = x.component = d.component;
    if (Eh(d, x, v))
      if (g.asyncDep && !g.asyncResolved) {
        F(g, x, v);
        return;
      } else
        g.next = x, g.update();
    else
      x.el = d.el, g.vnode = x;
  }, P = (d, x, v, g, y, b, O) => {
    const L = () => {
      if (d.isMounted) {
        let { next: q, bu: te, u: se, parent: ve, vnode: Ee } = d;
        {
          const $t = Gu(d);
          if ($t) {
            q && (q.el = Ee.el, F(d, q, O)), $t.asyncDep.then(() => {
              d.isUnmounted || L();
            });
            return;
          }
        }
        let $e = q, nt;
        gn(d, !1), q ? (q.el = Ee.el, F(d, q, O)) : q = Ee, te && ii(te), (nt = q.props && q.props.onVnodeBeforeUpdate) && It(nt, ve, q, Ee), gn(d, !0);
        const ct = al(d), Nt = d.subTree;
        d.subTree = ct, N(
          Nt,
          ct,
          // parent may have changed if it's in a teleport
          f(Nt.el),
          // anchor may have changed if it's in a fragment
          ye(Nt),
          d,
          y,
          b
        ), q.el = ct.el, $e === null && xh(d, ct.el), se && pt(se, y), (nt = q.props && q.props.onVnodeUpdated) && pt(
          () => It(nt, ve, q, Ee),
          y
        );
      } else {
        let q;
        const { el: te, props: se } = x, { bm: ve, m: Ee, parent: $e, root: nt, type: ct } = d, Nt = jn(x);
        gn(d, !1), ve && ii(ve), !Nt && (q = se && se.onVnodeBeforeMount) && It(q, $e, x), gn(d, !0);
        {
          nt.ce && nt.ce._injectChildStyle(ct);
          const $t = d.subTree = al(d);
          N(
            null,
            $t,
            v,
            g,
            d,
            y,
            b
          ), x.el = $t.el;
        }
        if (Ee && pt(Ee, y), !Nt && (q = se && se.onVnodeMounted)) {
          const $t = x;
          pt(
            () => It(q, $e, $t),
            y
          );
        }
        (x.shapeFlag & 256 || $e && jn($e.vnode) && $e.vnode.shapeFlag & 256) && d.a && pt(d.a, y), d.isMounted = !0, x = v = g = null;
      }
    };
    d.scope.on();
    const z = d.effect = new Qa(L);
    d.scope.off();
    const S = d.update = z.run.bind(z), K = d.job = z.runIfDirty.bind(z);
    K.i = d, K.id = d.uid, z.scheduler = () => Ns(K), gn(d, !0), S();
  }, F = (d, x, v) => {
    x.component = d;
    const g = d.vnode.props;
    d.vnode = x, d.next = null, sh(d, x.props, g, v), ch(d, x.children, v), hn(), el(d), pn();
  }, X = (d, x, v, g, y, b, O, L, z = !1) => {
    const S = d && d.children, K = d ? d.shapeFlag : 0, q = x.children, { patchFlag: te, shapeFlag: se } = x;
    if (te > 0) {
      if (te & 128) {
        oe(
          S,
          q,
          v,
          g,
          y,
          b,
          O,
          L,
          z
        );
        return;
      } else if (te & 256) {
        Q(
          S,
          q,
          v,
          g,
          y,
          b,
          O,
          L,
          z
        );
        return;
      }
    }
    se & 8 ? (K & 16 && _e(S, y, b), q !== S && c(v, q)) : K & 16 ? se & 16 ? oe(
      S,
      q,
      v,
      g,
      y,
      b,
      O,
      L,
      z
    ) : _e(S, y, b, !0) : (K & 8 && c(v, ""), se & 16 && Y(
      q,
      v,
      g,
      y,
      b,
      O,
      L,
      z
    ));
  }, Q = (d, x, v, g, y, b, O, L, z) => {
    d = d || zn, x = x || zn;
    const S = d.length, K = x.length, q = Math.min(S, K);
    let te;
    for (te = 0; te < q; te++) {
      const se = x[te] = z ? tn(x[te]) : Pt(x[te]);
      N(
        d[te],
        se,
        v,
        null,
        y,
        b,
        O,
        L,
        z
      );
    }
    S > K ? _e(
      d,
      y,
      b,
      !0,
      !1,
      q
    ) : Y(
      x,
      v,
      g,
      y,
      b,
      O,
      L,
      z,
      q
    );
  }, oe = (d, x, v, g, y, b, O, L, z) => {
    let S = 0;
    const K = x.length;
    let q = d.length - 1, te = K - 1;
    for (; S <= q && S <= te; ) {
      const se = d[S], ve = x[S] = z ? tn(x[S]) : Pt(x[S]);
      if (io(se, ve))
        N(
          se,
          ve,
          v,
          null,
          y,
          b,
          O,
          L,
          z
        );
      else
        break;
      S++;
    }
    for (; S <= q && S <= te; ) {
      const se = d[q], ve = x[te] = z ? tn(x[te]) : Pt(x[te]);
      if (io(se, ve))
        N(
          se,
          ve,
          v,
          null,
          y,
          b,
          O,
          L,
          z
        );
      else
        break;
      q--, te--;
    }
    if (S > q) {
      if (S <= te) {
        const se = te + 1, ve = se < K ? x[se].el : g;
        for (; S <= te; )
          N(
            null,
            x[S] = z ? tn(x[S]) : Pt(x[S]),
            v,
            ve,
            y,
            b,
            O,
            L,
            z
          ), S++;
      }
    } else if (S > te)
      for (; S <= q; )
        ee(d[S], y, b, !0), S++;
    else {
      const se = S, ve = S, Ee = /* @__PURE__ */ new Map();
      for (S = ve; S <= te; S++) {
        const ht = x[S] = z ? tn(x[S]) : Pt(x[S]);
        ht.key != null && Ee.set(ht.key, S);
      }
      let $e, nt = 0;
      const ct = te - ve + 1;
      let Nt = !1, $t = 0;
      const no = new Array(ct);
      for (S = 0; S < ct; S++) no[S] = 0;
      for (S = se; S <= q; S++) {
        const ht = d[S];
        if (nt >= ct) {
          ee(ht, y, b, !0);
          continue;
        }
        let Mt;
        if (ht.key != null)
          Mt = Ee.get(ht.key);
        else
          for ($e = ve; $e <= te; $e++)
            if (no[$e - ve] === 0 && io(ht, x[$e])) {
              Mt = $e;
              break;
            }
        Mt === void 0 ? ee(ht, y, b, !0) : (no[Mt - ve] = S + 1, Mt >= $t ? $t = Mt : Nt = !0, N(
          ht,
          x[Mt],
          v,
          null,
          y,
          b,
          O,
          L,
          z
        ), nt++);
      }
      const Ws = Nt ? ph(no) : zn;
      for ($e = Ws.length - 1, S = ct - 1; S >= 0; S--) {
        const ht = ve + S, Mt = x[ht], qs = ht + 1 < K ? x[ht + 1].el : g;
        no[S] === 0 ? N(
          null,
          Mt,
          v,
          qs,
          y,
          b,
          O,
          L,
          z
        ) : Nt && ($e < 0 || S !== Ws[$e] ? ue(Mt, v, qs, 2) : $e--);
      }
    }
  }, ue = (d, x, v, g, y = null) => {
    const { el: b, type: O, transition: L, children: z, shapeFlag: S } = d;
    if (S & 6) {
      ue(d.component.subTree, x, v, g);
      return;
    }
    if (S & 128) {
      d.suspense.move(x, v, g);
      return;
    }
    if (S & 64) {
      O.move(d, x, v, pe);
      return;
    }
    if (O === me) {
      o(b, x, v);
      for (let q = 0; q < z.length; q++)
        ue(z[q], x, v, g);
      o(d.anchor, x, v);
      return;
    }
    if (O === si) {
      k(d, x, v);
      return;
    }
    if (g !== 2 && S & 1 && L)
      if (g === 0)
        L.beforeEnter(b), o(b, x, v), pt(() => L.enter(b), y);
      else {
        const { leave: q, delayLeave: te, afterLeave: se } = L, ve = () => o(b, x, v), Ee = () => {
          q(b, () => {
            ve(), se && se();
          });
        };
        te ? te(b, ve, Ee) : Ee();
      }
    else
      o(b, x, v);
  }, ee = (d, x, v, g = !1, y = !1) => {
    const {
      type: b,
      props: O,
      ref: L,
      children: z,
      dynamicChildren: S,
      shapeFlag: K,
      patchFlag: q,
      dirs: te,
      cacheIndex: se
    } = d;
    if (q === -2 && (y = !1), L != null && bi(L, null, v, d, !0), se != null && (x.renderCache[se] = void 0), K & 256) {
      x.ctx.deactivate(d);
      return;
    }
    const ve = K & 1 && te, Ee = !jn(d);
    let $e;
    if (Ee && ($e = O && O.onVnodeBeforeUnmount) && It($e, x, d), K & 6)
      ge(d.component, v, g);
    else {
      if (K & 128) {
        d.suspense.unmount(v, g);
        return;
      }
      ve && vn(d, null, x, "beforeUnmount"), K & 64 ? d.type.remove(
        d,
        x,
        v,
        pe,
        g
      ) : S && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !S.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (b !== me || q > 0 && q & 64) ? _e(
        S,
        x,
        v,
        !1,
        !0
      ) : (b === me && q & 384 || !y && K & 16) && _e(z, x, v), g && le(d);
    }
    (Ee && ($e = O && O.onVnodeUnmounted) || ve) && pt(() => {
      $e && It($e, x, d), ve && vn(d, null, x, "unmounted");
    }, v);
  }, le = (d) => {
    const { type: x, el: v, anchor: g, transition: y } = d;
    if (x === me) {
      j(v, g);
      return;
    }
    if (x === si) {
      _(d);
      return;
    }
    const b = () => {
      i(v), y && !y.persisted && y.afterLeave && y.afterLeave();
    };
    if (d.shapeFlag & 1 && y && !y.persisted) {
      const { leave: O, delayLeave: L } = y, z = () => O(v, b);
      L ? L(d.el, b, z) : z();
    } else
      b();
  }, j = (d, x) => {
    let v;
    for (; d !== x; )
      v = h(d), i(d), d = v;
    i(x);
  }, ge = (d, x, v) => {
    const { bum: g, scope: y, job: b, subTree: O, um: L, m: z, a: S } = d;
    ll(z), ll(S), g && ii(g), y.stop(), b && (b.flags |= 8, ee(O, d, x, v)), L && pt(L, x), pt(() => {
      d.isUnmounted = !0;
    }, x), x && x.pendingBranch && !x.isUnmounted && d.asyncDep && !d.asyncResolved && d.suspenseId === x.pendingId && (x.deps--, x.deps === 0 && x.resolve());
  }, _e = (d, x, v, g = !1, y = !1, b = 0) => {
    for (let O = b; O < d.length; O++)
      ee(d[O], x, v, g, y);
  }, ye = (d) => {
    if (d.shapeFlag & 6)
      return ye(d.component.subTree);
    if (d.shapeFlag & 128)
      return d.suspense.next();
    const x = h(d.anchor || d.el), v = x && x[Vf];
    return v ? h(v) : x;
  };
  let we = !1;
  const fe = (d, x, v) => {
    d == null ? x._vnode && ee(x._vnode, null, null, !0) : N(
      x._vnode || null,
      d,
      x,
      null,
      null,
      null,
      v
    ), x._vnode = d, we || (we = !0, el(), mu(), we = !1);
  }, pe = {
    p: N,
    um: ee,
    m: ue,
    r: le,
    mt: w,
    mc: Y,
    pc: X,
    pbc: G,
    n: ye,
    o: e
  };
  return {
    render: fe,
    hydrate: void 0,
    createApp: ih(fe)
  };
}
function dr({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function gn({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function hh(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Uu(e, t, n = !1) {
  const o = e.children, i = t.children;
  if (he(o) && he(i))
    for (let r = 0; r < o.length; r++) {
      const s = o[r];
      let l = i[r];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = i[r] = tn(i[r]), l.el = s.el), !n && l.patchFlag !== -2 && Uu(s, l)), l.type === Hi && (l.el = s.el);
    }
}
function ph(e) {
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
function Gu(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Gu(t);
}
function ll(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const vh = Symbol.for("v-scx"), gh = () => At(vh);
function ke(e, t, n) {
  return Yu(e, t, n);
}
function Yu(e, t, n = Pe) {
  const { immediate: o, deep: i, flush: r, once: s } = n, l = tt({}, n), a = t && o || !t && r !== "post";
  let u;
  if (No) {
    if (r === "sync") {
      const m = gh();
      u = m.__watcherHandles || (m.__watcherHandles = []);
    } else if (!a) {
      const m = () => {
      };
      return m.stop = Dt, m.resume = Dt, m.pause = Dt, m;
    }
  }
  const c = Je;
  l.call = (m, C, N) => Lt(m, c, C, N);
  let f = !1;
  r === "post" ? l.scheduler = (m) => {
    pt(m, c && c.suspense);
  } : r !== "sync" && (f = !0, l.scheduler = (m, C) => {
    C ? m() : Ns(m);
  }), l.augmentJob = (m) => {
    t && (m.flags |= 4), f && (m.flags |= 2, c && (m.id = c.uid, m.i = c));
  };
  const h = Df(e, t, l);
  return No && (u ? u.push(h) : a && h()), h;
}
function mh(e, t, n) {
  const o = this.proxy, i = Fe(e) ? e.includes(".") ? Xu(o, e) : () => o[e] : e.bind(o, o);
  let r;
  be(t) ? r = t : (r = t.handler, n = t);
  const s = Bo(this), l = Yu(i, r.bind(o), n);
  return s(), l;
}
function Xu(e, t) {
  const n = t.split(".");
  return () => {
    let o = e;
    for (let i = 0; i < n.length && o; i++)
      o = o[n[i]];
    return o;
  };
}
const yh = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${bt(t)}Modifiers`] || e[`${Pn(t)}Modifiers`];
function bh(e, t, ...n) {
  if (e.isUnmounted) return;
  const o = e.vnode.props || Pe;
  let i = n;
  const r = t.startsWith("update:"), s = r && yh(o, t.slice(7));
  s && (s.trim && (i = n.map((c) => Fe(c) ? c.trim() : c)), s.number && (i = n.map(pi)));
  let l, a = o[l = ir(t)] || // also try camelCase event handler (#2249)
  o[l = ir(bt(t))];
  !a && r && (a = o[l = ir(Pn(t))]), a && Lt(
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
function Wu(e, t, n = !1) {
  const o = t.emitsCache, i = o.get(e);
  if (i !== void 0)
    return i;
  const r = e.emits;
  let s = {}, l = !1;
  if (!be(e)) {
    const a = (u) => {
      const c = Wu(u, t, !0);
      c && (l = !0, tt(s, c));
    };
    !n && t.mixins.length && t.mixins.forEach(a), e.extends && a(e.extends), e.mixins && e.mixins.forEach(a);
  }
  return !r && !l ? (De(e) && o.set(e, null), null) : (he(r) ? r.forEach((a) => s[a] = null) : tt(s, r), De(e) && o.set(e, s), s);
}
function Fi(e, t) {
  return !e || !Ti(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), Oe(e, t[0].toLowerCase() + t.slice(1)) || Oe(e, Pn(t)) || Oe(e, t));
}
function al(e) {
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
    data: h,
    setupState: m,
    ctx: C,
    inheritAttrs: N
  } = e, $ = yi(e);
  let I, A;
  try {
    if (n.shapeFlag & 4) {
      const _ = i || o, B = _;
      I = Pt(
        u.call(
          B,
          _,
          c,
          f,
          m,
          h,
          C
        )
      ), A = l;
    } else {
      const _ = t;
      I = Pt(
        _.length > 1 ? _(
          f,
          { attrs: l, slots: s, emit: a }
        ) : _(
          f,
          null
        )
      ), A = t.props ? l : _h(l);
    }
  } catch (_) {
    bo.length = 0, Vi(_, e, 1), I = ie(dn);
  }
  let k = I;
  if (A && N !== !1) {
    const _ = Object.keys(A), { shapeFlag: B } = k;
    _.length && B & 7 && (r && _.some(vs) && (A = wh(
      A,
      r
    )), k = qn(k, A, !1, !0));
  }
  return n.dirs && (k = qn(k, null, !1, !0), k.dirs = k.dirs ? k.dirs.concat(n.dirs) : n.dirs), n.transition && $s(k, n.transition), I = k, yi($), I;
}
const _h = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Ti(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, wh = (e, t) => {
  const n = {};
  for (const o in e)
    (!vs(o) || !(o.slice(9) in t)) && (n[o] = e[o]);
  return n;
};
function Eh(e, t, n) {
  const { props: o, children: i, component: r } = e, { props: s, children: l, patchFlag: a } = t, u = r.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && a >= 0) {
    if (a & 1024)
      return !0;
    if (a & 16)
      return o ? ul(o, s, u) : !!s;
    if (a & 8) {
      const c = t.dynamicProps;
      for (let f = 0; f < c.length; f++) {
        const h = c[f];
        if (s[h] !== o[h] && !Fi(u, h))
          return !0;
      }
    }
  } else
    return (i || l) && (!l || !l.$stable) ? !0 : o === s ? !1 : o ? s ? ul(o, s, u) : !0 : !!s;
  return !1;
}
function ul(e, t, n) {
  const o = Object.keys(t);
  if (o.length !== Object.keys(e).length)
    return !0;
  for (let i = 0; i < o.length; i++) {
    const r = o[i];
    if (t[r] !== e[r] && !Fi(n, r))
      return !0;
  }
  return !1;
}
function xh({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const o = t.subTree;
    if (o.suspense && o.suspense.activeBranch === e && (o.el = e.el), o === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const qu = (e) => e.__isSuspense;
function kh(e, t) {
  t && t.pendingBranch ? he(e) ? t.effects.push(...e) : t.effects.push(e) : Lf(e);
}
const me = Symbol.for("v-fgt"), Hi = Symbol.for("v-txt"), dn = Symbol.for("v-cmt"), si = Symbol.for("v-stc"), bo = [];
let at = null;
function U(e = !1) {
  bo.push(at = e ? null : []);
}
function Sh() {
  bo.pop(), at = bo[bo.length - 1] || null;
}
let Wn = 1;
function cl(e, t = !1) {
  Wn += e, e < 0 && at && t && (at.hasOnce = !0);
}
function Ku(e) {
  return e.dynamicChildren = Wn > 0 ? at || zn : null, Sh(), Wn > 0 && at && at.push(e), e;
}
function W(e, t, n, o, i, r) {
  return Ku(
    p(
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
function vt(e, t, n, o, i) {
  return Ku(
    ie(
      e,
      t,
      n,
      o,
      i,
      !0
    )
  );
}
function Co(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function io(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Zu = ({ key: e }) => e ?? null, li = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? Fe(e) || He(e) || be(e) ? { i: Ke, r: e, k: t, f: !!n } : e : null);
function p(e, t = null, n = null, o = 0, i = null, r = e === me ? 0 : 1, s = !1, l = !1) {
  const a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Zu(t),
    ref: t && li(t),
    scopeId: bu,
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
  return l ? (Is(a, n), r & 128 && e.normalize(a)) : n && (a.shapeFlag |= Fe(n) ? 8 : 16), Wn > 0 && // avoid a block node from tracking itself
  !s && // has current parent block
  at && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (a.patchFlag > 0 || r & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  a.patchFlag !== 32 && at.push(a), a;
}
const ie = Ch;
function Ch(e, t = null, n = null, o = 0, i = null, r = !1) {
  if ((!e || e === Cu) && (e = dn), Co(e)) {
    const l = qn(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Is(l, n), Wn > 0 && !r && at && (l.shapeFlag & 6 ? at[at.indexOf(e)] = l : at.push(l)), l.patchFlag = -2, l;
  }
  if (Ah(e) && (e = e.__vccOpts), t) {
    t = ai(t);
    let { class: l, style: a } = t;
    l && !Fe(l) && (t.class = xe(l)), De(a) && (Cs(a) && !he(a) && (a = tt({}, a)), t.style = ft(a));
  }
  const s = Fe(e) ? 1 : qu(e) ? 128 : zf(e) ? 64 : De(e) ? 4 : be(e) ? 2 : 0;
  return p(
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
function ai(e) {
  return e ? Cs(e) || Lu(e) ? tt({}, e) : e : null;
}
function qn(e, t, n = !1, o = !1) {
  const { props: i, ref: r, patchFlag: s, children: l, transition: a } = e, u = t ? Os(i || {}, t) : i, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: u,
    key: u && Zu(u),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && r ? he(r) ? r.concat(li(t)) : [r, li(t)] : li(t)
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
    patchFlag: t && e.type !== me ? s === -1 ? 16 : s | 16 : s,
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
    ssContent: e.ssContent && qn(e.ssContent),
    ssFallback: e.ssFallback && qn(e.ssFallback),
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return a && o && $s(
    c,
    a.clone(c)
  ), c;
}
function Le(e = " ", t = 0) {
  return ie(Hi, null, e, t);
}
function Nh(e, t) {
  const n = ie(si, null, e);
  return n.staticCount = t, n;
}
function Se(e = "", t = !1) {
  return t ? (U(), vt(dn, null, e)) : ie(dn, null, e);
}
function Pt(e) {
  return e == null || typeof e == "boolean" ? ie(dn) : he(e) ? ie(
    me,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Co(e) ? tn(e) : ie(Hi, null, String(e));
}
function tn(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : qn(e);
}
function Is(e, t) {
  let n = 0;
  const { shapeFlag: o } = e;
  if (t == null)
    t = null;
  else if (he(t))
    n = 16;
  else if (typeof t == "object")
    if (o & 65) {
      const i = t.default;
      i && (i._c && (i._d = !1), Is(e, i()), i._c && (i._d = !0));
      return;
    } else {
      n = 32;
      const i = t._;
      !i && !Lu(t) ? t._ctx = Ke : i === 3 && Ke && (Ke.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else be(t) ? (t = { default: t, _ctx: Ke }, n = 32) : (t = String(t), o & 64 ? (n = 16, t = [Le(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Os(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const o = e[n];
    for (const i in o)
      if (i === "class")
        t.class !== o.class && (t.class = xe([t.class, o.class]));
      else if (i === "style")
        t.style = ft([t.style, o.style]);
      else if (Ti(i)) {
        const r = t[i], s = o[i];
        s && r !== s && !(he(r) && r.includes(s)) && (t[i] = r ? [].concat(r, s) : s);
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
const $h = Du();
let Mh = 0;
function Ih(e, t, n) {
  const o = e.type, i = (t ? t.appContext : e.appContext) || $h, r = {
    uid: Mh++,
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
    scope: new Za(
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
    propsOptions: zu(o, i),
    emitsOptions: Wu(o, i),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: Pe,
    // inheritAttrs
    inheritAttrs: o.inheritAttrs,
    // state
    ctx: Pe,
    data: Pe,
    props: Pe,
    attrs: Pe,
    slots: Pe,
    refs: Pe,
    setupState: Pe,
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
  return r.ctx = { _: r }, r.root = t ? t.root : r, r.emit = bh.bind(null, r), e.ce && e.ce(r), r;
}
let Je = null;
const to = () => Je || Ke;
let wi, Hr;
{
  const e = Ai(), t = (n, o) => {
    let i;
    return (i = e[n]) || (i = e[n] = []), i.push(o), (r) => {
      i.length > 1 ? i.forEach((s) => s(r)) : i[0](r);
    };
  };
  wi = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => Je = n
  ), Hr = t(
    "__VUE_SSR_SETTERS__",
    (n) => No = n
  );
}
const Bo = (e) => {
  const t = Je;
  return wi(e), e.scope.on(), () => {
    e.scope.off(), wi(t);
  };
}, dl = () => {
  Je && Je.scope.off(), wi(null);
};
function Ju(e) {
  return e.vnode.shapeFlag & 4;
}
let No = !1;
function Oh(e, t = !1, n = !1) {
  t && Hr(t);
  const { props: o, children: i } = e.vnode, r = Ju(e);
  rh(e, o, r, t), uh(e, i, n);
  const s = r ? Th(e, t) : void 0;
  return t && Hr(!1), s;
}
function Th(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, qf);
  const { setup: o } = n;
  if (o) {
    hn();
    const i = e.setupContext = o.length > 1 ? ec(e) : null, r = Bo(e), s = zo(
      o,
      e,
      0,
      [
        e.props,
        i
      ]
    ), l = Ua(s);
    if (pn(), r(), (l || e.sp) && !jn(e) && _u(e), l) {
      if (s.then(dl, dl), t)
        return s.then((a) => {
          fl(e, a);
        }).catch((a) => {
          Vi(a, e, 0);
        });
      e.asyncDep = s;
    } else
      fl(e, s);
  } else
    Qu(e);
}
function fl(e, t, n) {
  be(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : De(t) && (e.setupState = hu(t)), Qu(e);
}
function Qu(e, t, n) {
  const o = e.type;
  e.render || (e.render = o.render || Dt);
  {
    const i = Bo(e);
    hn();
    try {
      Jf(e);
    } finally {
      pn(), i();
    }
  }
}
const Ph = {
  get(e, t) {
    return Qe(e, "get", ""), e[t];
  }
};
function ec(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, Ph),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function ji(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(hu(kn(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in yo)
        return yo[n](e);
    },
    has(t, n) {
      return n in t || n in yo;
    }
  })) : e.proxy;
}
function Dh(e, t = !0) {
  return be(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Ah(e) {
  return be(e) && "__vccOpts" in e;
}
const ce = (e, t) => Tf(e, t, No);
function Ie(e, t, n) {
  const o = arguments.length;
  return o === 2 ? De(t) && !he(t) ? Co(t) ? ie(e, null, [t]) : ie(e, t) : ie(e, null, t) : (o > 3 ? n = Array.prototype.slice.call(arguments, 2) : o === 3 && Co(n) && (n = [n]), ie(e, t, n));
}
function Rh(e, t) {
  const n = e.memo;
  if (n.length != t.length)
    return !1;
  for (let o = 0; o < n.length; o++)
    if (Xt(n[o], t[o]))
      return !1;
  return Wn > 0 && at && at.push(e), !0;
}
const Lh = "3.5.13";
/**
* @vue/runtime-dom v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let jr;
const hl = typeof window < "u" && window.trustedTypes;
if (hl)
  try {
    jr = /* @__PURE__ */ hl.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const tc = jr ? (e) => jr.createHTML(e) : (e) => e, Vh = "http://www.w3.org/2000/svg", zh = "http://www.w3.org/1998/Math/MathML", Ft = typeof document < "u" ? document : null, pl = Ft && /* @__PURE__ */ Ft.createElement("template"), Bh = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, o) => {
    const i = t === "svg" ? Ft.createElementNS(Vh, e) : t === "mathml" ? Ft.createElementNS(zh, e) : n ? Ft.createElement(e, { is: n }) : Ft.createElement(e);
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
      pl.innerHTML = tc(
        o === "svg" ? `<svg>${e}</svg>` : o === "mathml" ? `<math>${e}</math>` : e
      );
      const l = pl.content;
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
}, Fh = Symbol("_vtc");
function Hh(e, t, n) {
  const o = e[Fh];
  o && (t = (t ? [t, ...o] : [...o]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const vl = Symbol("_vod"), jh = Symbol("_vsh"), Uh = Symbol(""), Gh = /(^|;)\s*display\s*:/;
function Yh(e, t, n) {
  const o = e.style, i = Fe(n);
  let r = !1;
  if (n && !i) {
    if (t)
      if (Fe(t))
        for (const s of t.split(";")) {
          const l = s.slice(0, s.indexOf(":")).trim();
          n[l] == null && ui(o, l, "");
        }
      else
        for (const s in t)
          n[s] == null && ui(o, s, "");
    for (const s in n)
      s === "display" && (r = !0), ui(o, s, n[s]);
  } else if (i) {
    if (t !== n) {
      const s = o[Uh];
      s && (n += ";" + s), o.cssText = n, r = Gh.test(n);
    }
  } else t && e.removeAttribute("style");
  vl in e && (e[vl] = r ? o.display : "", e[jh] && (o.display = "none"));
}
const gl = /\s*!important$/;
function ui(e, t, n) {
  if (he(n))
    n.forEach((o) => ui(e, t, o));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const o = Xh(e, t);
    gl.test(n) ? e.setProperty(
      Pn(o),
      n.replace(gl, ""),
      "important"
    ) : e[o] = n;
  }
}
const ml = ["Webkit", "Moz", "ms"], fr = {};
function Xh(e, t) {
  const n = fr[t];
  if (n)
    return n;
  let o = bt(t);
  if (o !== "filter" && o in e)
    return fr[t] = o;
  o = Di(o);
  for (let i = 0; i < ml.length; i++) {
    const r = ml[i] + o;
    if (r in e)
      return fr[t] = r;
  }
  return t;
}
const yl = "http://www.w3.org/1999/xlink";
function bl(e, t, n, o, i, r = ef(t)) {
  o && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(yl, t.slice(6, t.length)) : e.setAttributeNS(yl, t, n) : n == null || r && !Wa(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    r ? "" : kt(n) ? String(n) : n
  );
}
function _l(e, t, n, o, i) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? tc(n) : n);
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
    l === "boolean" ? n = Wa(n) : n == null && l === "string" ? (n = "", s = !0) : l === "number" && (n = 0, s = !0);
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
function Wh(e, t, n, o) {
  e.removeEventListener(t, n, o);
}
const wl = Symbol("_vei");
function qh(e, t, n, o, i = null) {
  const r = e[wl] || (e[wl] = {}), s = r[t];
  if (o && s)
    s.value = o;
  else {
    const [l, a] = Kh(t);
    if (o) {
      const u = r[t] = Qh(
        o,
        i
      );
      rn(e, l, u, a);
    } else s && (Wh(e, l, s, a), r[t] = void 0);
  }
}
const El = /(?:Once|Passive|Capture)$/;
function Kh(e) {
  let t;
  if (El.test(e)) {
    t = {};
    let o;
    for (; o = e.match(El); )
      e = e.slice(0, e.length - o[0].length), t[o[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : Pn(e.slice(2)), t];
}
let hr = 0;
const Zh = /* @__PURE__ */ Promise.resolve(), Jh = () => hr || (Zh.then(() => hr = 0), hr = Date.now());
function Qh(e, t) {
  const n = (o) => {
    if (!o._vts)
      o._vts = Date.now();
    else if (o._vts <= n.attached)
      return;
    Lt(
      ep(o, n.value),
      t,
      5,
      [o]
    );
  };
  return n.value = e, n.attached = Jh(), n;
}
function ep(e, t) {
  if (he(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (o) => (i) => !i._stopped && o && o(i)
    );
  } else
    return t;
}
const xl = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, tp = (e, t, n, o, i, r) => {
  const s = i === "svg";
  t === "class" ? Hh(e, o, s) : t === "style" ? Yh(e, n, o) : Ti(t) ? vs(t) || qh(e, t, n, o, r) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : np(e, t, o, s)) ? (_l(e, t, o), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && bl(e, t, o, s, r, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !Fe(o)) ? _l(e, bt(t), o, r, t) : (t === "true-value" ? e._trueValue = o : t === "false-value" && (e._falseValue = o), bl(e, t, o, s));
};
function np(e, t, n, o) {
  if (o)
    return !!(t === "innerHTML" || t === "textContent" || t in e && xl(t) && be(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const i = e.tagName;
    if (i === "IMG" || i === "VIDEO" || i === "CANVAS" || i === "SOURCE")
      return !1;
  }
  return xl(t) && Fe(n) ? !1 : t in e;
}
const Kn = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return he(t) ? (n) => ii(t, n) : t;
};
function op(e) {
  e.target.composing = !0;
}
function kl(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Wt = Symbol("_assign"), it = {
  created(e, { modifiers: { lazy: t, trim: n, number: o } }, i) {
    e[Wt] = Kn(i);
    const r = o || i.props && i.props.type === "number";
    rn(e, t ? "change" : "input", (s) => {
      if (s.target.composing) return;
      let l = e.value;
      n && (l = l.trim()), r && (l = pi(l)), e[Wt](l);
    }), n && rn(e, "change", () => {
      e.value = e.value.trim();
    }), t || (rn(e, "compositionstart", op), rn(e, "compositionend", kl), rn(e, "change", kl));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: o, trim: i, number: r } }, s) {
    if (e[Wt] = Kn(s), e.composing) return;
    const l = (r || e.type === "number") && !/^0\d/.test(e.value) ? pi(e.value) : e.value, a = t ?? "";
    l !== a && (document.activeElement === e && e.type !== "range" && (o && t === n || i && e.value.trim() === a) || (e.value = a));
  }
}, ip = {
  // #4096 array checkboxes need to be deep traversed
  deep: !0,
  created(e, t, n) {
    e[Wt] = Kn(n), rn(e, "change", () => {
      const o = e._modelValue, i = $o(e), r = e.checked, s = e[Wt];
      if (he(o)) {
        const l = ys(o, i), a = l !== -1;
        if (r && !a)
          s(o.concat(i));
        else if (!r && a) {
          const u = [...o];
          u.splice(l, 1), s(u);
        }
      } else if (eo(o)) {
        const l = new Set(o);
        r ? l.add(i) : l.delete(i), s(l);
      } else
        s(nc(e, r));
    });
  },
  // set initial checked on mount to wait for true-value/false-value
  mounted: Sl,
  beforeUpdate(e, t, n) {
    e[Wt] = Kn(n), Sl(e, t, n);
  }
};
function Sl(e, { value: t, oldValue: n }, o) {
  e._modelValue = t;
  let i;
  if (he(t))
    i = ys(t, o.props.value) > -1;
  else if (eo(t))
    i = t.has(o.props.value);
  else {
    if (t === n) return;
    i = Vo(t, nc(e, !0));
  }
  e.checked !== i && (e.checked = i);
}
const Ur = {
  // <select multiple> value need to be deep traversed
  deep: !0,
  created(e, { value: t, modifiers: { number: n } }, o) {
    const i = eo(t);
    rn(e, "change", () => {
      const r = Array.prototype.filter.call(e.options, (s) => s.selected).map(
        (s) => n ? pi($o(s)) : $o(s)
      );
      e[Wt](
        e.multiple ? i ? new Set(r) : r : r[0]
      ), e._assigning = !0, Ze(() => {
        e._assigning = !1;
      });
    }), e[Wt] = Kn(o);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(e, { value: t }) {
    Cl(e, t);
  },
  beforeUpdate(e, t, n) {
    e[Wt] = Kn(n);
  },
  updated(e, { value: t }) {
    e._assigning || Cl(e, t);
  }
};
function Cl(e, t) {
  const n = e.multiple, o = he(t);
  if (!(n && !o && !eo(t))) {
    for (let i = 0, r = e.options.length; i < r; i++) {
      const s = e.options[i], l = $o(s);
      if (n)
        if (o) {
          const a = typeof l;
          a === "string" || a === "number" ? s.selected = t.some((u) => String(u) === String(l)) : s.selected = ys(t, l) > -1;
        } else
          s.selected = t.has(l);
      else if (Vo($o(s), t)) {
        e.selectedIndex !== i && (e.selectedIndex = i);
        return;
      }
    }
    !n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
  }
}
function $o(e) {
  return "_value" in e ? e._value : e.value;
}
function nc(e, t) {
  const n = t ? "_trueValue" : "_falseValue";
  return n in e ? e[n] : t;
}
const rp = ["ctrl", "shift", "alt", "meta"], sp = {
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
  exact: (e, t) => rp.some((n) => e[`${n}Key`] && !t.includes(n))
}, Mo = (e, t) => {
  const n = e._withMods || (e._withMods = {}), o = t.join(".");
  return n[o] || (n[o] = (i, ...r) => {
    for (let s = 0; s < t.length; s++) {
      const l = sp[t[s]];
      if (l && l(i, t)) return;
    }
    return e(i, ...r);
  });
}, lp = /* @__PURE__ */ tt({ patchProp: tp }, Bh);
let Nl;
function ap() {
  return Nl || (Nl = dh(lp));
}
const Ts = (...e) => {
  const t = ap().createApp(...e), { mount: n } = t;
  return t.mount = (o) => {
    const i = cp(o);
    if (!i) return;
    const r = t._component;
    !be(r) && !r.render && !r.template && (r.template = i.innerHTML), i.nodeType === 1 && (i.textContent = "");
    const s = n(i, !1, up(i));
    return i instanceof Element && (i.removeAttribute("v-cloak"), i.setAttribute("data-v-app", "")), s;
  }, t;
};
function up(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function cp(e) {
  return Fe(e) ? document.querySelector(e) : e;
}
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const dp = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var Xo = {
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
const fp = ({ size: e, strokeWidth: t = 2, absoluteStrokeWidth: n, color: o, iconNode: i, name: r, class: s, ...l }, { slots: a }) => Ie(
  "svg",
  {
    ...Xo,
    width: e || Xo.width,
    height: e || Xo.height,
    stroke: o || Xo.stroke,
    "stroke-width": n ? Number(t) * 24 / Number(e) : t,
    class: ["lucide", `lucide-${dp(r ?? "icon")}`],
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
  fp,
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
const hp = Ne("BotIcon", [
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
const pp = Ne("BrainIcon", [
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
const vp = Ne("ChartColumnIcon", [
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
const gp = Ne("CheckIcon", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const mp = Ne("ChevronDownIcon", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const yp = Ne("DatabaseIcon", [
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
const oc = Ne("DownloadIcon", [
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
const $l = Ne("ExternalLinkIcon", [
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
const Ml = Ne("EyeIcon", [
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
const bp = Ne("FolderOpenIcon", [
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
const _p = Ne("LayersIcon", [
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
const wp = Ne("Maximize2Icon", [
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
const Ep = Ne("MicVocalIcon", [
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
const xp = Ne("MinusIcon", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const kp = Ne("PenLineIcon", [
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
const ic = Ne("PlayIcon", [
  ["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Sp = Ne("PlugIcon", [
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
const uo = Ne("PlusIcon", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Cp = Ne("PuzzleIcon", [
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
const Gr = Ne("RefreshCwIcon", [
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
const rc = Ne("RotateCcwIcon", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Yr = Ne("SaveIcon", [
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
const Np = Ne("ScanFaceIcon", [
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
const $p = Ne("ScanSearchIcon", [
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
const Xr = Ne("SearchIcon", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mp = Ne("ShieldCheckIcon", [
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
const _o = Ne("Trash2Icon", [
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
const Ip = Ne("Undo2Icon", [
  ["path", { d: "M9 14 4 9l5-5", key: "102s5s" }],
  ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11", key: "f3b9sd" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Wr = Ne("UploadIcon", [
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
const qr = Ne("UserRoundIcon", [
  ["circle", { cx: "12", cy: "8", r: "5", key: "1hypcn" }],
  ["path", { d: "M20 21a8 8 0 0 0-16 0", key: "rfgkzh" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Op = Ne("WrenchIcon", [
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
const Il = Ne("XIcon", [
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
function pr() {
  return ut("/api/personas", { cache: "no-store" });
}
function sc(e) {
  return ut(`/api/personas/${encodeURIComponent(e)}/documents`, { cache: "no-store" });
}
async function lc() {
  return (await ut("/api/live2d/models", { cache: "no-store" })).models;
}
async function Tp() {
  await ut("/api/live2d/model-directory", {
    method: "POST",
    headers: { "X-YUMENO-Request": "web" }
  });
}
async function Ol(e) {
  const [t, n, o, i, r, s] = await Promise.all([
    ut(`/api/personas/${encodeURIComponent(e.id)}/capabilities`, { cache: "no-store" }),
    ut(`/api/personas/${encodeURIComponent(e.id)}/mcp-grants`, { cache: "no-store" }),
    sc(e.id),
    ut("/api/mcp/servers", { cache: "no-store" }).catch(() => []),
    lc().then((a) => ({ models: a })).catch(() => ({ models: [] })),
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
async function Pp(e) {
  await ut(`/api/personas/${encodeURIComponent(e.id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: e.name, profile: e.profile || {} })
  });
}
async function Dp(e, t) {
  await ut(`/api/personas/${encodeURIComponent(e)}/capabilities`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ overrides: t })
  });
}
async function Ap(e, t) {
  const n = t.filter((o) => o.authorized && !o.global).map((o) => o.name);
  await ut(`/api/personas/${encodeURIComponent(e)}/mcp-grants`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ server_names: n })
  });
}
async function Rp(e) {
  await ut(`/api/personas/${encodeURIComponent(e)}`, { method: "DELETE" });
}
async function Lp(e, t, n) {
  if (!e.knowledge_space_id) throw new Error("角色知识空间不可用");
  const o = new FormData();
  t.forEach((r) => o.append("files", r)), n.trim() && o.append("files", new File([n.trim()], `text-${Date.now()}.txt`, { type: "text/plain;charset=utf-8" }));
  const i = await ut(`/api/knowledge-spaces/${encodeURIComponent(e.knowledge_space_id)}/documents/upload`, { method: "POST", body: o });
  await Promise.all(i.map((r) => ut(`/api/documents/${encodeURIComponent(r.id)}/confirm`, { method: "POST" })));
}
async function Vp(e) {
  var n;
  const t = await fetch(`/api/documents/${encodeURIComponent(e)}`, { method: "DELETE" });
  if (!t.ok) throw new Error(((n = await t.json().catch(() => null)) == null ? void 0 : n.detail) || `删除失败 (${t.status})`);
}
async function zp(e) {
  await ut(`/api/documents/${encodeURIComponent(e)}/retry-index`, { method: "POST" });
}
async function Bp(e, t) {
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
const Fp = [
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
function Hp(e) {
  return ["available", "partial", "unassigned", "blocked", "pending", "error"].includes(e) ? e : "blocked";
}
function ro(e, t, n) {
  return { id: e, type: t, position: { x: 0, y: 0 }, data: n };
}
function jp(e) {
  var r, s;
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = `persona:${e.persona.id}`, i = "module:extensions";
  t.set(o, ro(o, "persona", { kind: "persona", label: e.persona.name, summary: String(((r = e.persona.profile) == null ? void 0 : r.description) || "尚未填写人设"), status: "available", level: 0 }));
  for (const l of Fp) {
    const a = `module:${l.id}`;
    t.set(a, ro(a, "module", { kind: l.id, label: l.label, summary: l.summary(e), status: "available", level: 0 }));
    const u = l.id === "extensions";
    n.set(`${o}->${a}`, { id: `${o}->${a}`, source: o, target: a, sourceHandle: u ? "right-source" : "left-source", targetHandle: u ? "left-target" : "right-target" });
  }
  for (const l of e.capabilities.packages) {
    const a = l.kind === "skill" ? "skill" : "tool", u = e.capabilities.overrides[l.id], c = u === void 0 ? l.assigned : u, f = u === !1 ? "blocked" : u === !0 && l.status === "unassigned" ? "available" : l.status;
    t.set(l.id, ro(l.id, "capability", {
      kind: a,
      label: l.name,
      summary: l.description || l.reason || "能力包",
      status: Hp(f),
      level: l.level,
      assigned: c,
      configurable: !0,
      sourceId: l.id
    })), n.set(`${i}->${l.id}`, { id: `${i}->${l.id}`, source: i, target: l.id, sourceHandle: "right-source", targetHandle: "left-target" });
    for (const h of l.dependencies || []) {
      if (!h.id) continue;
      const m = e.capabilities.overrides[h.id], C = m === void 0 ? h.effective : m;
      if (t.set(h.id, ro(h.id, "capability", {
        kind: "tool",
        label: h.name,
        summary: h.server ? `MCP · ${h.server}` : h.source,
        status: C ? "available" : "blocked",
        level: h.level,
        assigned: C,
        configurable: !1,
        sourceId: h.id
      })), n.set(`${l.id}->${h.id}`, { id: `${l.id}->${h.id}`, source: l.id, target: h.id, sourceHandle: "right-source", targetHandle: "left-target" }), h.server) {
        const N = `mcp:${h.server}`, $ = e.grants.servers.find((A) => A.name === h.server), I = ((s = $ == null ? void 0 : $.status) == null ? void 0 : s.status) === "connected";
        t.set(N, ro(N, "capability", {
          kind: "mcp",
          label: h.server,
          summary: ($ == null ? void 0 : $.description) || "MCP 服务",
          status: $ != null && $.authorized && I ? "available" : "blocked",
          level: h.level,
          assigned: !!($ != null && $.authorized),
          configurable: !!($ && !$.global),
          sourceId: h.server
        })), n.set(`${h.id}->${N}`, { id: `${h.id}->${N}`, source: h.id, target: N, sourceHandle: "right-source", targetHandle: "left-target" });
      }
    }
  }
  return { nodes: [...t.values()], edges: [...n.values()] };
}
function Up(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Gp = "\0", mn = "\0", Tl = "";
let Yp = class {
  constructor(t) {
    je(this, "_isDirected", !0);
    je(this, "_isMultigraph", !1);
    je(this, "_isCompound", !1);
    // Label for the graph itself
    je(this, "_label");
    // Defaults to be set when creating a new node
    je(this, "_defaultNodeLabelFn", () => {
    });
    // Defaults to be set when creating a new edge
    je(this, "_defaultEdgeLabelFn", () => {
    });
    // v -> label
    je(this, "_nodes", {});
    // v -> edgeObj
    je(this, "_in", {});
    // u -> v -> Number
    je(this, "_preds", {});
    // v -> edgeObj
    je(this, "_out", {});
    // v -> w -> Number
    je(this, "_sucs", {});
    // e -> edgeObj
    je(this, "_edgeObjs", {});
    // e -> label
    je(this, "_edgeLabels", {});
    /* Number of nodes in the graph. Should only be changed by the implementation. */
    je(this, "_nodeCount", 0);
    /* Number of edges in the graph. Should only be changed by the implementation. */
    je(this, "_edgeCount", 0);
    je(this, "_parent");
    je(this, "_children");
    t && (this._isDirected = Object.hasOwn(t, "directed") ? t.directed : !0, this._isMultigraph = Object.hasOwn(t, "multigraph") ? t.multigraph : !1, this._isCompound = Object.hasOwn(t, "compound") ? t.compound : !1), this._isCompound && (this._parent = {}, this._children = {}, this._children[mn] = {});
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
    return Object.hasOwn(this._nodes, t) ? (arguments.length > 1 && (this._nodes[t] = n), this) : (this._nodes[t] = arguments.length > 1 ? n : this._defaultNodeLabelFn(t), this._isCompound && (this._parent[t] = mn, this._children[t] = {}, this._children[mn][t] = !0), this._in[t] = {}, this._preds[t] = {}, this._out[t] = {}, this._sucs[t] = {}, ++this._nodeCount, this);
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
      n = mn;
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
      if (n !== mn)
        return n;
    }
  }
  /**
   * Gets list of direct children of node v.
   * Complexity: O(1).
   */
  children(t = mn) {
    if (this._isCompound) {
      var n = this._children[t];
      if (n)
        return Object.keys(n);
    } else {
      if (t === mn)
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
    var l = co(this._isDirected, t, n, o);
    if (Object.hasOwn(this._edgeLabels, l))
      return r && (this._edgeLabels[l] = i), this;
    if (o !== void 0 && !this._isMultigraph)
      throw new Error("Cannot set a named edge when isMultigraph = false");
    this.setNode(t), this.setNode(n), this._edgeLabels[l] = r ? i : this._defaultEdgeLabelFn(t, n, o);
    var a = Xp(this._isDirected, t, n, o);
    return t = a.v, n = a.w, Object.freeze(a), this._edgeObjs[l] = a, Pl(this._preds[n], t), Pl(this._sucs[t], n), this._in[n][l] = a, this._out[t][l] = a, this._edgeCount++, this;
  }
  /**
   * Gets the label for the specified edge.
   * Complexity: O(1).
   */
  edge(t, n, o) {
    var i = arguments.length === 1 ? vr(this._isDirected, arguments[0]) : co(this._isDirected, t, n, o);
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
    var i = arguments.length === 1 ? vr(this._isDirected, arguments[0]) : co(this._isDirected, t, n, o);
    return Object.hasOwn(this._edgeLabels, i);
  }
  /**
   * Removes the specified edge from the graph. No subgraphs are considered.
   * Complexity: O(1).
   */
  removeEdge(t, n, o) {
    var i = arguments.length === 1 ? vr(this._isDirected, arguments[0]) : co(this._isDirected, t, n, o), r = this._edgeObjs[i];
    return r && (t = r.v, n = r.w, delete this._edgeLabels[i], delete this._edgeObjs[i], Dl(this._preds[n], t), Dl(this._sucs[t], n), delete this._in[n][i], delete this._out[t][i], this._edgeCount--), this;
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
function Pl(e, t) {
  e[t] ? e[t]++ : e[t] = 1;
}
function Dl(e, t) {
  --e[t] || delete e[t];
}
function co(e, t, n, o) {
  var i = "" + t, r = "" + n;
  if (!e && i > r) {
    var s = i;
    i = r, r = s;
  }
  return i + Tl + r + Tl + (o === void 0 ? Gp : o);
}
function Xp(e, t, n, o) {
  var i = "" + t, r = "" + n;
  if (!e && i > r) {
    var s = i;
    i = r, r = s;
  }
  var l = { v: i, w: r };
  return o && (l.name = o), l;
}
function vr(e, t) {
  return co(e, t.v, t.w, t.name);
}
var Ps = Yp, Wp = "2.2.4", qp = {
  Graph: Ps,
  version: Wp
}, Kp = Ps, Zp = {
  write: Jp,
  read: tv
};
function Jp(e) {
  var t = {
    options: {
      directed: e.isDirected(),
      multigraph: e.isMultigraph(),
      compound: e.isCompound()
    },
    nodes: Qp(e),
    edges: ev(e)
  };
  return e.graph() !== void 0 && (t.value = structuredClone(e.graph())), t;
}
function Qp(e) {
  return e.nodes().map(function(t) {
    var n = e.node(t), o = e.parent(t), i = { v: t };
    return n !== void 0 && (i.value = n), o !== void 0 && (i.parent = o), i;
  });
}
function ev(e) {
  return e.edges().map(function(t) {
    var n = e.edge(t), o = { v: t.v, w: t.w };
    return t.name !== void 0 && (o.name = t.name), n !== void 0 && (o.value = n), o;
  });
}
function tv(e) {
  var t = new Kp(e.options).setGraph(e.value);
  return e.nodes.forEach(function(n) {
    t.setNode(n.v, n.value), n.parent && t.setParent(n.v, n.parent);
  }), e.edges.forEach(function(n) {
    t.setEdge({ v: n.v, w: n.w, name: n.name }, n.value);
  }), t;
}
var nv = ov;
function ov(e) {
  var t = {}, n = [], o;
  function i(r) {
    Object.hasOwn(t, r) || (t[r] = !0, o.push(r), e.successors(r).forEach(i), e.predecessors(r).forEach(i));
  }
  return e.nodes().forEach(function(r) {
    o = [], i(r), o.length && n.push(o);
  }), n;
}
let iv = class {
  constructor() {
    je(this, "_arr", []);
    je(this, "_keyIndices", {});
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
var ac = iv, rv = ac, uc = lv, sv = () => 1;
function lv(e, t, n, o) {
  return av(
    e,
    String(t),
    n || sv,
    o || function(i) {
      return e.outEdges(i);
    }
  );
}
function av(e, t, n, o) {
  var i = {}, r = new rv(), s, l, a = function(u) {
    var c = u.v !== s ? u.v : u.w, f = i[c], h = n(u), m = l.distance + h;
    if (h < 0)
      throw new Error("dijkstra does not allow negative edge weights. Bad edge: " + u + " Weight: " + h);
    m < f.distance && (f.distance = m, f.predecessor = s, r.decrease(c, m));
  };
  for (e.nodes().forEach(function(u) {
    var c = u === t ? 0 : Number.POSITIVE_INFINITY;
    i[u] = { distance: c }, r.add(u, c);
  }); r.size() > 0 && (s = r.removeMin(), l = i[s], l.distance !== Number.POSITIVE_INFINITY); )
    o(s).forEach(a);
  return i;
}
var uv = uc, cv = dv;
function dv(e, t, n) {
  return e.nodes().reduce(function(o, i) {
    return o[i] = uv(e, i, t, n), o;
  }, {});
}
var cc = fv;
function fv(e) {
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
var hv = cc, pv = vv;
function vv(e) {
  return hv(e).filter(function(t) {
    return t.length > 1 || t.length === 1 && e.hasEdge(t[0], t[0]);
  });
}
var gv = yv, mv = () => 1;
function yv(e, t, n) {
  return bv(
    e,
    t || mv,
    n || function(o) {
      return e.outEdges(o);
    }
  );
}
function bv(e, t, n) {
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
        var c = a[r], f = s[u], h = a[u], m = c.distance + f.distance;
        m < h.distance && (h.distance = m, h.predecessor = f.predecessor);
      });
    });
  }), o;
}
function dc(e) {
  var t = {}, n = {}, o = [];
  function i(r) {
    if (Object.hasOwn(n, r))
      throw new Kr();
    Object.hasOwn(t, r) || (n[r] = !0, t[r] = !0, e.predecessors(r).forEach(i), delete n[r], o.push(r));
  }
  if (e.sinks().forEach(i), Object.keys(t).length !== e.nodeCount())
    throw new Kr();
  return o;
}
class Kr extends Error {
  constructor() {
    super(...arguments);
  }
}
var fc = dc;
dc.CycleException = Kr;
var Al = fc, _v = wv;
function wv(e) {
  try {
    Al(e);
  } catch (t) {
    if (t instanceof Al.CycleException)
      return !1;
    throw t;
  }
  return !0;
}
var hc = Ev;
function Ev(e, t, n) {
  Array.isArray(t) || (t = [t]);
  var o = e.isDirected() ? (l) => e.successors(l) : (l) => e.neighbors(l), i = n === "post" ? xv : kv, r = [], s = {};
  return t.forEach((l) => {
    if (!e.hasNode(l))
      throw new Error("Graph does not have node: " + l);
    i(l, o, s, r);
  }), r;
}
function xv(e, t, n, o) {
  for (var i = [[e, !1]]; i.length > 0; ) {
    var r = i.pop();
    r[1] ? o.push(r[0]) : Object.hasOwn(n, r[0]) || (n[r[0]] = !0, i.push([r[0], !0]), pc(t(r[0]), (s) => i.push([s, !1])));
  }
}
function kv(e, t, n, o) {
  for (var i = [e]; i.length > 0; ) {
    var r = i.pop();
    Object.hasOwn(n, r) || (n[r] = !0, o.push(r), pc(t(r), (s) => i.push(s)));
  }
}
function pc(e, t) {
  for (var n = e.length; n--; )
    t(e[n], n, e);
  return e;
}
var Sv = hc, Cv = Nv;
function Nv(e, t) {
  return Sv(e, t, "post");
}
var $v = hc, Mv = Iv;
function Iv(e, t) {
  return $v(e, t, "pre");
}
var Ov = Ps, Tv = ac, Pv = Dv;
function Dv(e, t) {
  var n = new Ov(), o = {}, i = new Tv(), r;
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
var Av = {
  components: nv,
  dijkstra: uc,
  dijkstraAll: cv,
  findCycles: pv,
  floydWarshall: gv,
  isAcyclic: _v,
  postorder: Cv,
  preorder: Mv,
  prim: Pv,
  tarjan: cc,
  topsort: fc
}, Rl = qp, St = {
  Graph: Rl.Graph,
  json: Zp,
  alg: Av,
  version: Rl.version
};
let Rv = class {
  constructor() {
    let t = {};
    t._next = t._prev = t, this._sentinel = t;
  }
  dequeue() {
    let t = this._sentinel, n = t._prev;
    if (n !== t)
      return Ll(n), n;
  }
  enqueue(t) {
    let n = this._sentinel;
    t._prev && t._next && Ll(t), t._next = n._next, n._next._prev = t, n._next = t, t._prev = n;
  }
  toString() {
    let t = [], n = this._sentinel, o = n._prev;
    for (; o !== n; )
      t.push(JSON.stringify(o, Lv)), o = o._prev;
    return "[" + t.join(", ") + "]";
  }
};
function Ll(e) {
  e._prev._next = e._next, e._next._prev = e._prev, delete e._next, delete e._prev;
}
function Lv(e, t) {
  if (e !== "_next" && e !== "_prev")
    return t;
}
var Vv = Rv;
let zv = St.Graph, Bv = Vv;
var Fv = jv;
let Hv = () => 1;
function jv(e, t) {
  if (e.nodeCount() <= 1)
    return [];
  let n = Gv(e, t || Hv);
  return Uv(n.graph, n.buckets, n.zeroIdx).flatMap((i) => e.outEdges(i.v, i.w));
}
function Uv(e, t, n) {
  let o = [], i = t[t.length - 1], r = t[0], s;
  for (; e.nodeCount(); ) {
    for (; s = r.dequeue(); )
      gr(e, t, n, s);
    for (; s = i.dequeue(); )
      gr(e, t, n, s);
    if (e.nodeCount()) {
      for (let l = t.length - 2; l > 0; --l)
        if (s = t[l].dequeue(), s) {
          o = o.concat(gr(e, t, n, s, !0));
          break;
        }
    }
  }
  return o;
}
function gr(e, t, n, o, i) {
  let r = i ? [] : void 0;
  return e.inEdges(o.v).forEach((s) => {
    let l = e.edge(s), a = e.node(s.v);
    i && r.push({ v: s.v, w: s.w }), a.out -= l, Zr(t, n, a);
  }), e.outEdges(o.v).forEach((s) => {
    let l = e.edge(s), a = s.w, u = e.node(a);
    u.in -= l, Zr(t, n, u);
  }), e.removeNode(o.v), r;
}
function Gv(e, t) {
  let n = new zv(), o = 0, i = 0;
  e.nodes().forEach((l) => {
    n.setNode(l, { v: l, in: 0, out: 0 });
  }), e.edges().forEach((l) => {
    let a = n.edge(l.v, l.w) || 0, u = t(l), c = a + u;
    n.setEdge(l.v, l.w, c), i = Math.max(i, n.node(l.v).out += u), o = Math.max(o, n.node(l.w).in += u);
  });
  let r = Yv(i + o + 3).map(() => new Bv()), s = o + 1;
  return n.nodes().forEach((l) => {
    Zr(r, s, n.node(l));
  }), { graph: n, buckets: r, zeroIdx: s };
}
function Zr(e, t, n) {
  n.out ? n.in ? e[n.out - n.in + t].enqueue(n) : e[e.length - 1].enqueue(n) : e[0].enqueue(n);
}
function Yv(e) {
  const t = [];
  for (let n = 0; n < e; n++)
    t.push(n);
  return t;
}
let vc = St.Graph;
var Ye = {
  addBorderNode: tg,
  addDummyNode: gc,
  applyWithChunking: Ui,
  asNonCompoundGraph: Wv,
  buildLayerMatrix: Jv,
  intersectRect: Zv,
  mapValues: ag,
  maxRank: yc,
  normalizeRanks: Qv,
  notime: rg,
  partition: og,
  pick: lg,
  predecessorWeights: Kv,
  range: _c,
  removeEmptyRanks: eg,
  simplify: Xv,
  successorWeights: qv,
  time: ig,
  uniqueId: bc,
  zipObject: Ds
};
function gc(e, t, n, o) {
  for (var i = o; e.hasNode(i); )
    i = bc(o);
  return n.dummy = t, e.setNode(i, n), i;
}
function Xv(e) {
  let t = new vc().setGraph(e.graph());
  return e.nodes().forEach((n) => t.setNode(n, e.node(n))), e.edges().forEach((n) => {
    let o = t.edge(n.v, n.w) || { weight: 0, minlen: 1 }, i = e.edge(n);
    t.setEdge(n.v, n.w, {
      weight: o.weight + i.weight,
      minlen: Math.max(o.minlen, i.minlen)
    });
  }), t;
}
function Wv(e) {
  let t = new vc({ multigraph: e.isMultigraph() }).setGraph(e.graph());
  return e.nodes().forEach((n) => {
    e.children(n).length || t.setNode(n, e.node(n));
  }), e.edges().forEach((n) => {
    t.setEdge(n, e.edge(n));
  }), t;
}
function qv(e) {
  let t = e.nodes().map((n) => {
    let o = {};
    return e.outEdges(n).forEach((i) => {
      o[i.w] = (o[i.w] || 0) + e.edge(i).weight;
    }), o;
  });
  return Ds(e.nodes(), t);
}
function Kv(e) {
  let t = e.nodes().map((n) => {
    let o = {};
    return e.inEdges(n).forEach((i) => {
      o[i.v] = (o[i.v] || 0) + e.edge(i).weight;
    }), o;
  });
  return Ds(e.nodes(), t);
}
function Zv(e, t) {
  let n = e.x, o = e.y, i = t.x - n, r = t.y - o, s = e.width / 2, l = e.height / 2;
  if (!i && !r)
    throw new Error("Not possible to find intersection inside of the rectangle");
  let a, u;
  return Math.abs(r) * s > Math.abs(i) * l ? (r < 0 && (l = -l), a = l * i / r, u = l) : (i < 0 && (s = -s), a = s, u = s * r / i), { x: n + a, y: o + u };
}
function Jv(e) {
  let t = _c(yc(e) + 1).map(() => []);
  return e.nodes().forEach((n) => {
    let o = e.node(n), i = o.rank;
    i !== void 0 && (t[i][o.order] = n);
  }), t;
}
function Qv(e) {
  let t = e.nodes().map((o) => {
    let i = e.node(o).rank;
    return i === void 0 ? Number.MAX_VALUE : i;
  }), n = Ui(Math.min, t);
  e.nodes().forEach((o) => {
    let i = e.node(o);
    Object.hasOwn(i, "rank") && (i.rank -= n);
  });
}
function eg(e) {
  let t = e.nodes().map((s) => e.node(s).rank), n = Ui(Math.min, t), o = [];
  e.nodes().forEach((s) => {
    let l = e.node(s).rank - n;
    o[l] || (o[l] = []), o[l].push(s);
  });
  let i = 0, r = e.graph().nodeRankFactor;
  Array.from(o).forEach((s, l) => {
    s === void 0 && l % r !== 0 ? --i : s !== void 0 && i && s.forEach((a) => e.node(a).rank += i);
  });
}
function tg(e, t, n, o) {
  let i = {
    width: 0,
    height: 0
  };
  return arguments.length >= 4 && (i.rank = n, i.order = o), gc(e, "border", i, t);
}
function ng(e, t = mc) {
  const n = [];
  for (let o = 0; o < e.length; o += t) {
    const i = e.slice(o, o + t);
    n.push(i);
  }
  return n;
}
const mc = 65535;
function Ui(e, t) {
  if (t.length > mc) {
    const n = ng(t);
    return e.apply(null, n.map((o) => e.apply(null, o)));
  } else
    return e.apply(null, t);
}
function yc(e) {
  const n = e.nodes().map((o) => {
    let i = e.node(o).rank;
    return i === void 0 ? Number.MIN_VALUE : i;
  });
  return Ui(Math.max, n);
}
function og(e, t) {
  let n = { lhs: [], rhs: [] };
  return e.forEach((o) => {
    t(o) ? n.lhs.push(o) : n.rhs.push(o);
  }), n;
}
function ig(e, t) {
  let n = Date.now();
  try {
    return t();
  } finally {
    console.log(e + " time: " + (Date.now() - n) + "ms");
  }
}
function rg(e, t) {
  return t();
}
let sg = 0;
function bc(e) {
  var t = ++sg;
  return e + ("" + t);
}
function _c(e, t, n = 1) {
  t == null && (t = e, e = 0);
  let o = (r) => r < t;
  n < 0 && (o = (r) => t < r);
  const i = [];
  for (let r = e; o(r); r += n)
    i.push(r);
  return i;
}
function lg(e, t) {
  const n = {};
  for (const o of t)
    e[o] !== void 0 && (n[o] = e[o]);
  return n;
}
function ag(e, t) {
  let n = t;
  return typeof t == "string" && (n = (o) => o[t]), Object.entries(e).reduce((o, [i, r]) => (o[i] = n(r, i), o), {});
}
function Ds(e, t) {
  return e.reduce((n, o, i) => (n[o] = t[i], n), {});
}
let ug = Fv, cg = Ye.uniqueId;
var dg = {
  run: fg,
  undo: pg
};
function fg(e) {
  (e.graph().acyclicer === "greedy" ? ug(e, n(e)) : hg(e)).forEach((o) => {
    let i = e.edge(o);
    e.removeEdge(o), i.forwardName = o.name, i.reversed = !0, e.setEdge(o.w, o.v, i, cg("rev"));
  });
  function n(o) {
    return (i) => o.edge(i).weight;
  }
}
function hg(e) {
  let t = [], n = {}, o = {};
  function i(r) {
    Object.hasOwn(o, r) || (o[r] = !0, n[r] = !0, e.outEdges(r).forEach((s) => {
      Object.hasOwn(n, s.w) ? t.push(s) : i(s.w);
    }), delete n[r]);
  }
  return e.nodes().forEach(i), t;
}
function pg(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t);
    if (n.reversed) {
      e.removeEdge(t);
      let o = n.forwardName;
      delete n.reversed, delete n.forwardName, e.setEdge(t.w, t.v, n, o);
    }
  });
}
let vg = Ye;
var gg = {
  run: mg,
  undo: bg
};
function mg(e) {
  e.graph().dummyChains = [], e.edges().forEach((t) => yg(e, t));
}
function yg(e, t) {
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
    }, u = vg.addDummyNode(e, "edge", c, "_d"), o === a && (c.width = l.width, c.height = l.height, c.dummy = "edge-label", c.labelpos = l.labelpos), e.setEdge(n, u, { weight: l.weight }, s), f === 0 && e.graph().dummyChains.push(u), n = u;
  e.setEdge(n, i, { weight: l.weight }, s);
}
function bg(e) {
  e.graph().dummyChains.forEach((t) => {
    let n = e.node(t), o = n.edgeLabel, i;
    for (e.setEdge(n.edgeObj, o); n.dummy; )
      i = e.successors(t)[0], e.removeNode(t), o.points.push({ x: n.x, y: n.y }), n.dummy === "edge-label" && (o.x = n.x, o.y = n.y, o.width = n.width, o.height = n.height), t = i, n = e.node(t);
  });
}
const { applyWithChunking: _g } = Ye;
var Gi = {
  longestPath: wg,
  slack: Eg
};
function wg(e) {
  var t = {};
  function n(o) {
    var i = e.node(o);
    if (Object.hasOwn(t, o))
      return i.rank;
    t[o] = !0;
    let r = e.outEdges(o).map((l) => l == null ? Number.POSITIVE_INFINITY : n(l.w) - e.edge(l).minlen);
    var s = _g(Math.min, r);
    return s === Number.POSITIVE_INFINITY && (s = 0), i.rank = s;
  }
  e.sources().forEach(n);
}
function Eg(e, t) {
  return e.node(t.w).rank - e.node(t.v).rank - e.edge(t).minlen;
}
var xg = St.Graph, Ei = Gi.slack, wc = kg;
function kg(e) {
  var t = new xg({ directed: !1 }), n = e.nodes()[0], o = e.nodeCount();
  t.setNode(n, {});
  for (var i, r; Sg(t, e) < o; )
    i = Cg(t, e), r = t.hasNode(i.v) ? Ei(e, i) : -Ei(e, i), Ng(t, e, r);
  return t;
}
function Sg(e, t) {
  function n(o) {
    t.nodeEdges(o).forEach((i) => {
      var r = i.v, s = o === r ? i.w : r;
      !e.hasNode(s) && !Ei(t, i) && (e.setNode(s, {}), e.setEdge(o, s, {}), n(s));
    });
  }
  return e.nodes().forEach(n), e.nodeCount();
}
function Cg(e, t) {
  return t.edges().reduce((o, i) => {
    let r = Number.POSITIVE_INFINITY;
    return e.hasNode(i.v) !== e.hasNode(i.w) && (r = Ei(t, i)), r < o[0] ? [r, i] : o;
  }, [Number.POSITIVE_INFINITY, null])[1];
}
function Ng(e, t, n) {
  e.nodes().forEach((o) => t.node(o).rank += n);
}
var $g = wc, Vl = Gi.slack, Mg = Gi.longestPath, Ig = St.alg.preorder, Og = St.alg.postorder, Tg = Ye.simplify, Pg = An;
An.initLowLimValues = Rs;
An.initCutValues = As;
An.calcCutValue = Ec;
An.leaveEdge = kc;
An.enterEdge = Sc;
An.exchangeEdges = Cc;
function An(e) {
  e = Tg(e), Mg(e);
  var t = $g(e);
  Rs(t), As(t, e);
  for (var n, o; n = kc(t); )
    o = Sc(t, e, n), Cc(t, e, n, o);
}
function As(e, t) {
  var n = Og(e, e.nodes());
  n = n.slice(0, n.length - 1), n.forEach((o) => Dg(e, t, o));
}
function Dg(e, t, n) {
  var o = e.node(n), i = o.parent;
  e.edge(n, i).cutvalue = Ec(e, t, n);
}
function Ec(e, t, n) {
  var o = e.node(n), i = o.parent, r = !0, s = t.edge(n, i), l = 0;
  return s || (r = !1, s = t.edge(i, n)), l = s.weight, t.nodeEdges(n).forEach((a) => {
    var u = a.v === n, c = u ? a.w : a.v;
    if (c !== i) {
      var f = u === r, h = t.edge(a).weight;
      if (l += f ? h : -h, Rg(e, n, c)) {
        var m = e.edge(n, c).cutvalue;
        l += f ? -m : m;
      }
    }
  }), l;
}
function Rs(e, t) {
  arguments.length < 2 && (t = e.nodes()[0]), xc(e, {}, 1, t);
}
function xc(e, t, n, o, i) {
  var r = n, s = e.node(o);
  return t[o] = !0, e.neighbors(o).forEach((l) => {
    Object.hasOwn(t, l) || (n = xc(e, t, n, l, o));
  }), s.low = r, s.lim = n++, i ? s.parent = i : delete s.parent, n;
}
function kc(e) {
  return e.edges().find((t) => e.edge(t).cutvalue < 0);
}
function Sc(e, t, n) {
  var o = n.v, i = n.w;
  t.hasEdge(o, i) || (o = n.w, i = n.v);
  var r = e.node(o), s = e.node(i), l = r, a = !1;
  r.lim > s.lim && (l = s, a = !0);
  var u = t.edges().filter((c) => a === zl(e, e.node(c.v), l) && a !== zl(e, e.node(c.w), l));
  return u.reduce((c, f) => Vl(t, f) < Vl(t, c) ? f : c);
}
function Cc(e, t, n, o) {
  var i = n.v, r = n.w;
  e.removeEdge(i, r), e.setEdge(o.v, o.w, {}), Rs(e), As(e, t), Ag(e, t);
}
function Ag(e, t) {
  var n = e.nodes().find((i) => !t.node(i).parent), o = Ig(e, n);
  o = o.slice(1), o.forEach((i) => {
    var r = e.node(i).parent, s = t.edge(i, r), l = !1;
    s || (s = t.edge(r, i), l = !0), t.node(i).rank = t.node(r).rank + (l ? s.minlen : -s.minlen);
  });
}
function Rg(e, t, n) {
  return e.hasEdge(t, n);
}
function zl(e, t, n) {
  return n.low <= t.lim && t.lim <= n.lim;
}
var Lg = Gi, Nc = Lg.longestPath, Vg = wc, zg = Pg, Bg = Fg;
function Fg(e) {
  var t = e.graph().ranker;
  if (t instanceof Function)
    return t(e);
  switch (e.graph().ranker) {
    case "network-simplex":
      Bl(e);
      break;
    case "tight-tree":
      jg(e);
      break;
    case "longest-path":
      Hg(e);
      break;
    case "none":
      break;
    default:
      Bl(e);
  }
}
var Hg = Nc;
function jg(e) {
  Nc(e), Vg(e);
}
function Bl(e) {
  zg(e);
}
var Ug = Gg;
function Gg(e) {
  let t = Xg(e);
  e.graph().dummyChains.forEach((n) => {
    let o = e.node(n), i = o.edgeObj, r = Yg(e, t, i.v, i.w), s = r.path, l = r.lca, a = 0, u = s[a], c = !0;
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
function Yg(e, t, n, o) {
  let i = [], r = [], s = Math.min(t[n].low, t[o].low), l = Math.max(t[n].lim, t[o].lim), a, u;
  a = n;
  do
    a = e.parent(a), i.push(a);
  while (a && (t[a].low > s || l > t[a].lim));
  for (u = a, a = o; (a = e.parent(a)) !== u; )
    r.push(a);
  return { path: i.concat(r.reverse()), lca: u };
}
function Xg(e) {
  let t = {}, n = 0;
  function o(i) {
    let r = n;
    e.children(i).forEach(o), t[i] = { low: r, lim: n++ };
  }
  return e.children().forEach(o), t;
}
let xi = Ye;
var Wg = {
  run: qg,
  cleanup: Jg
};
function qg(e) {
  let t = xi.addDummyNode(e, "root", {}, "_root"), n = Kg(e), o = Object.values(n), i = xi.applyWithChunking(Math.max, o) - 1, r = 2 * i + 1;
  e.graph().nestingRoot = t, e.edges().forEach((l) => e.edge(l).minlen *= r);
  let s = Zg(e) + 1;
  e.children().forEach((l) => $c(e, t, r, s, i, n, l)), e.graph().nodeRankFactor = r;
}
function $c(e, t, n, o, i, r, s) {
  let l = e.children(s);
  if (!l.length) {
    s !== t && e.setEdge(t, s, { weight: 0, minlen: n });
    return;
  }
  let a = xi.addBorderNode(e, "_bt"), u = xi.addBorderNode(e, "_bb"), c = e.node(s);
  e.setParent(a, s), c.borderTop = a, e.setParent(u, s), c.borderBottom = u, l.forEach((f) => {
    $c(e, t, n, o, i, r, f);
    let h = e.node(f), m = h.borderTop ? h.borderTop : f, C = h.borderBottom ? h.borderBottom : f, N = h.borderTop ? o : 2 * o, $ = m !== C ? 1 : i - r[s] + 1;
    e.setEdge(a, m, {
      weight: N,
      minlen: $,
      nestingEdge: !0
    }), e.setEdge(C, u, {
      weight: N,
      minlen: $,
      nestingEdge: !0
    });
  }), e.parent(s) || e.setEdge(t, a, { weight: 0, minlen: i + r[s] });
}
function Kg(e) {
  var t = {};
  function n(o, i) {
    var r = e.children(o);
    r && r.length && r.forEach((s) => n(s, i + 1)), t[o] = i;
  }
  return e.children().forEach((o) => n(o, 1)), t;
}
function Zg(e) {
  return e.edges().reduce((t, n) => t + e.edge(n).weight, 0);
}
function Jg(e) {
  var t = e.graph();
  e.removeNode(t.nestingRoot), delete t.nestingRoot, e.edges().forEach((n) => {
    var o = e.edge(n);
    o.nestingEdge && e.removeEdge(n);
  });
}
let Qg = Ye;
var em = tm;
function tm(e) {
  function t(n) {
    let o = e.children(n), i = e.node(n);
    if (o.length && o.forEach(t), Object.hasOwn(i, "minRank")) {
      i.borderLeft = [], i.borderRight = [];
      for (let r = i.minRank, s = i.maxRank + 1; r < s; ++r)
        Fl(e, "borderLeft", "_bl", n, i, r), Fl(e, "borderRight", "_br", n, i, r);
    }
  }
  e.children().forEach(t);
}
function Fl(e, t, n, o, i, r) {
  let s = { width: 0, height: 0, rank: r, borderType: t }, l = i[t][r - 1], a = Qg.addDummyNode(e, "border", s, n);
  i[t][r] = a, e.setParent(a, o), l && e.setEdge(l, a, { weight: 1 });
}
var nm = {
  adjust: om,
  undo: im
};
function om(e) {
  let t = e.graph().rankdir.toLowerCase();
  (t === "lr" || t === "rl") && Mc(e);
}
function im(e) {
  let t = e.graph().rankdir.toLowerCase();
  (t === "bt" || t === "rl") && rm(e), (t === "lr" || t === "rl") && (sm(e), Mc(e));
}
function Mc(e) {
  e.nodes().forEach((t) => Hl(e.node(t))), e.edges().forEach((t) => Hl(e.edge(t)));
}
function Hl(e) {
  let t = e.width;
  e.width = e.height, e.height = t;
}
function rm(e) {
  e.nodes().forEach((t) => mr(e.node(t))), e.edges().forEach((t) => {
    let n = e.edge(t);
    n.points.forEach(mr), Object.hasOwn(n, "y") && mr(n);
  });
}
function mr(e) {
  e.y = -e.y;
}
function sm(e) {
  e.nodes().forEach((t) => yr(e.node(t))), e.edges().forEach((t) => {
    let n = e.edge(t);
    n.points.forEach(yr), Object.hasOwn(n, "x") && yr(n);
  });
}
function yr(e) {
  let t = e.x;
  e.x = e.y, e.y = t;
}
let jl = Ye;
var lm = am;
function am(e) {
  let t = {}, n = e.nodes().filter((a) => !e.children(a).length), o = n.map((a) => e.node(a).rank), i = jl.applyWithChunking(Math.max, o), r = jl.range(i + 1).map(() => []);
  function s(a) {
    if (t[a]) return;
    t[a] = !0;
    let u = e.node(a);
    r[u.rank].push(a), e.successors(a).forEach(s);
  }
  return n.sort((a, u) => e.node(a).rank - e.node(u).rank).forEach(s), r;
}
let um = Ye.zipObject;
var cm = dm;
function dm(e, t) {
  let n = 0;
  for (let o = 1; o < t.length; ++o)
    n += fm(e, t[o - 1], t[o]);
  return n;
}
function fm(e, t, n) {
  let o = um(n, n.map((u, c) => c)), i = t.flatMap((u) => e.outEdges(u).map((c) => ({ pos: o[c.w], weight: e.edge(c).weight })).sort((c, f) => c.pos - f.pos)), r = 1;
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
var hm = pm;
function pm(e, t = []) {
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
let vm = Ye;
var gm = mm;
function mm(e, t) {
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
  return ym(o);
}
function ym(e) {
  let t = [];
  function n(i) {
    return (r) => {
      r.merged || (r.barycenter === void 0 || i.barycenter === void 0 || r.barycenter >= i.barycenter) && bm(i, r);
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
  return t.filter((i) => !i.merged).map((i) => vm.pick(i, ["vs", "i", "barycenter", "weight"]));
}
function bm(e, t) {
  let n = 0, o = 0;
  e.weight && (n += e.barycenter * e.weight, o += e.weight), t.weight && (n += t.barycenter * t.weight, o += t.weight), e.vs = t.vs.concat(e.vs), e.barycenter = n / o, e.weight = o, e.i = Math.min(t.i, e.i), t.merged = !0;
}
let _m = Ye;
var wm = Em;
function Em(e, t) {
  let n = _m.partition(e, (c) => Object.hasOwn(c, "barycenter")), o = n.lhs, i = n.rhs.sort((c, f) => f.i - c.i), r = [], s = 0, l = 0, a = 0;
  o.sort(xm(!!t)), a = Ul(r, i, a), o.forEach((c) => {
    a += c.vs.length, r.push(c.vs), s += c.barycenter * c.weight, l += c.weight, a = Ul(r, i, a);
  });
  let u = { vs: r.flat(!0) };
  return l && (u.barycenter = s / l, u.weight = l), u;
}
function Ul(e, t, n) {
  let o;
  for (; t.length && (o = t[t.length - 1]).i <= n; )
    t.pop(), e.push(o.vs), n++;
  return n;
}
function xm(e) {
  return (t, n) => t.barycenter < n.barycenter ? -1 : t.barycenter > n.barycenter ? 1 : e ? n.i - t.i : t.i - n.i;
}
let km = hm, Sm = gm, Cm = wm;
var Nm = Ic;
function Ic(e, t, n, o) {
  let i = e.children(t), r = e.node(t), s = r ? r.borderLeft : void 0, l = r ? r.borderRight : void 0, a = {};
  s && (i = i.filter((h) => h !== s && h !== l));
  let u = km(e, i);
  u.forEach((h) => {
    if (e.children(h.v).length) {
      let m = Ic(e, h.v, n, o);
      a[h.v] = m, Object.hasOwn(m, "barycenter") && Mm(h, m);
    }
  });
  let c = Sm(u, n);
  $m(c, a);
  let f = Cm(c, o);
  if (s && (f.vs = [s, f.vs, l].flat(!0), e.predecessors(s).length)) {
    let h = e.node(e.predecessors(s)[0]), m = e.node(e.predecessors(l)[0]);
    Object.hasOwn(f, "barycenter") || (f.barycenter = 0, f.weight = 0), f.barycenter = (f.barycenter * f.weight + h.order + m.order) / (f.weight + 2), f.weight += 2;
  }
  return f;
}
function $m(e, t) {
  e.forEach((n) => {
    n.vs = n.vs.flatMap((o) => t[o] ? t[o].vs : o);
  });
}
function Mm(e, t) {
  e.barycenter !== void 0 ? (e.barycenter = (e.barycenter * e.weight + t.barycenter * t.weight) / (e.weight + t.weight), e.weight += t.weight) : (e.barycenter = t.barycenter, e.weight = t.weight);
}
let Im = St.Graph, Om = Ye;
var Tm = Pm;
function Pm(e, t, n) {
  let o = Dm(e), i = new Im({ compound: !0 }).setGraph({ root: o }).setDefaultNodeLabel((r) => e.node(r));
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
function Dm(e) {
  for (var t; e.hasNode(t = Om.uniqueId("_root")); ) ;
  return t;
}
var Am = Rm;
function Rm(e, t, n) {
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
let Lm = lm, Vm = cm, zm = Nm, Bm = Tm, Fm = Am, Hm = St.Graph, Wo = Ye;
var jm = Oc;
function Oc(e, t) {
  if (t && typeof t.customOrder == "function") {
    t.customOrder(e, Oc);
    return;
  }
  let n = Wo.maxRank(e), o = Gl(e, Wo.range(1, n + 1), "inEdges"), i = Gl(e, Wo.range(n - 1, -1, -1), "outEdges"), r = Lm(e);
  if (Yl(e, r), t && t.disableOptimalOrderHeuristic)
    return;
  let s = Number.POSITIVE_INFINITY, l;
  for (let a = 0, u = 0; u < 4; ++a, ++u) {
    Um(a % 2 ? o : i, a % 4 >= 2), r = Wo.buildLayerMatrix(e);
    let c = Vm(e, r);
    c < s && (u = 0, l = Object.assign({}, r), s = c);
  }
  Yl(e, l);
}
function Gl(e, t, n) {
  return t.map(function(o) {
    return Bm(e, o, n);
  });
}
function Um(e, t) {
  let n = new Hm();
  e.forEach(function(o) {
    let i = o.graph().root, r = zm(o, i, n, t);
    r.vs.forEach((s, l) => o.node(s).order = l), Fm(o, n, r.vs);
  });
}
function Yl(e, t) {
  Object.values(t).forEach((n) => n.forEach((o, i) => e.node(o).order = i));
}
let Gm = St.Graph, Ut = Ye;
var Ym = {
  positionX: oy
};
function Xm(e, t) {
  let n = {};
  function o(i, r) {
    let s = 0, l = 0, a = i.length, u = r[r.length - 1];
    return r.forEach((c, f) => {
      let h = qm(e, c), m = h ? e.node(h).order : a;
      (h || c === u) && (r.slice(l, f + 1).forEach((C) => {
        e.predecessors(C).forEach((N) => {
          let $ = e.node(N), I = $.order;
          (I < s || m < I) && !($.dummy && e.node(C).dummy) && Tc(n, N, C);
        });
      }), l = f + 1, s = m);
    }), r;
  }
  return t.length && t.reduce(o), n;
}
function Wm(e, t) {
  let n = {};
  function o(r, s, l, a, u) {
    let c;
    Ut.range(s, l).forEach((f) => {
      c = r[f], e.node(c).dummy && e.predecessors(c).forEach((h) => {
        let m = e.node(h);
        m.dummy && (m.order < a || m.order > u) && Tc(n, h, c);
      });
    });
  }
  function i(r, s) {
    let l = -1, a, u = 0;
    return s.forEach((c, f) => {
      if (e.node(c).dummy === "border") {
        let h = e.predecessors(c);
        h.length && (a = e.node(h[0]).order, o(s, u, f, l, a), u = f, l = a);
      }
      o(s, u, s.length, a, r.length);
    }), s;
  }
  return t.length && t.reduce(i), n;
}
function qm(e, t) {
  if (e.node(t).dummy)
    return e.predecessors(t).find((n) => e.node(n).dummy);
}
function Tc(e, t, n) {
  if (t > n) {
    let i = t;
    t = n, n = i;
  }
  let o = e[t];
  o || (e[t] = o = {}), o[n] = !0;
}
function Km(e, t, n) {
  if (t > n) {
    let o = t;
    t = n, n = o;
  }
  return !!e[t] && Object.hasOwn(e[t], n);
}
function Zm(e, t, n, o) {
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
        c = c.sort((h, m) => s[h] - s[m]);
        let f = (c.length - 1) / 2;
        for (let h = Math.floor(f), m = Math.ceil(f); h <= m; ++h) {
          let C = c[h];
          r[u] === u && a < s[C] && !Km(n, u, C) && (r[C] = u, r[u] = i[u] = i[C], a = s[C]);
        }
      }
    });
  }), { root: i, align: r };
}
function Jm(e, t, n, o, i) {
  let r = {}, s = Qm(e, t, n, i), l = i ? "borderLeft" : "borderRight";
  function a(f, h) {
    let m = s.nodes(), C = m.pop(), N = {};
    for (; C; )
      N[C] ? f(C) : (N[C] = !0, m.push(C), m = m.concat(h(C))), C = m.pop();
  }
  function u(f) {
    r[f] = s.inEdges(f).reduce((h, m) => Math.max(h, r[m.v] + s.edge(m)), 0);
  }
  function c(f) {
    let h = s.outEdges(f).reduce((C, N) => Math.min(C, r[N.w] - s.edge(N)), Number.POSITIVE_INFINITY), m = e.node(f);
    h !== Number.POSITIVE_INFINITY && m.borderType !== l && (r[f] = Math.max(r[f], h));
  }
  return a(u, s.predecessors.bind(s)), a(c, s.successors.bind(s)), Object.keys(o).forEach((f) => r[f] = r[n[f]]), r;
}
function Qm(e, t, n, o) {
  let i = new Gm(), r = e.graph(), s = iy(r.nodesep, r.edgesep, o);
  return t.forEach((l) => {
    let a;
    l.forEach((u) => {
      let c = n[u];
      if (i.setNode(c), a) {
        var f = n[a], h = i.edge(f, c);
        i.setEdge(f, c, Math.max(s(e, u, a), h || 0));
      }
      a = u;
    });
  }), i;
}
function ey(e, t) {
  return Object.values(t).reduce((n, o) => {
    let i = Number.NEGATIVE_INFINITY, r = Number.POSITIVE_INFINITY;
    Object.entries(o).forEach(([l, a]) => {
      let u = ry(e, l) / 2;
      i = Math.max(a + u, i), r = Math.min(a - u, r);
    });
    const s = i - r;
    return s < n[0] && (n = [s, o]), n;
  }, [Number.POSITIVE_INFINITY, null])[1];
}
function ty(e, t) {
  let n = Object.values(t), o = Ut.applyWithChunking(Math.min, n), i = Ut.applyWithChunking(Math.max, n);
  ["u", "d"].forEach((r) => {
    ["l", "r"].forEach((s) => {
      let l = r + s, a = e[l];
      if (a === t) return;
      let u = Object.values(a), c = o - Ut.applyWithChunking(Math.min, u);
      s !== "l" && (c = i - Ut.applyWithChunking(Math.max, u)), c && (e[l] = Ut.mapValues(a, (f) => f + c));
    });
  });
}
function ny(e, t) {
  return Ut.mapValues(e.ul, (n, o) => {
    if (t)
      return e[t.toLowerCase()][o];
    {
      let i = Object.values(e).map((r) => r[o]).sort((r, s) => r - s);
      return (i[1] + i[2]) / 2;
    }
  });
}
function oy(e) {
  let t = Ut.buildLayerMatrix(e), n = Object.assign(
    Xm(e, t),
    Wm(e, t)
  ), o = {}, i;
  ["u", "d"].forEach((s) => {
    i = s === "u" ? t : Object.values(t).reverse(), ["l", "r"].forEach((l) => {
      l === "r" && (i = i.map((f) => Object.values(f).reverse()));
      let a = (s === "u" ? e.predecessors : e.successors).bind(e), u = Zm(e, i, n, a), c = Jm(
        e,
        i,
        u.root,
        u.align,
        l === "r"
      );
      l === "r" && (c = Ut.mapValues(c, (f) => -f)), o[s + l] = c;
    });
  });
  let r = ey(e, o);
  return ty(o, r), ny(o, e.graph().align);
}
function iy(e, t, n) {
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
function ry(e, t) {
  return e.node(t).width;
}
let Pc = Ye, sy = Ym.positionX;
var ly = ay;
function ay(e) {
  e = Pc.asNonCompoundGraph(e), uy(e), Object.entries(sy(e)).forEach(([t, n]) => e.node(t).x = n);
}
function uy(e) {
  let t = Pc.buildLayerMatrix(e), n = e.graph().ranksep, o = 0;
  t.forEach((i) => {
    const r = i.reduce((s, l) => {
      const a = e.node(l).height;
      return s > a ? s : a;
    }, 0);
    i.forEach((s) => e.node(s).y = o + r / 2), o += r + n;
  });
}
let Xl = dg, Wl = gg, cy = Bg, dy = Ye.normalizeRanks, fy = Ug, hy = Ye.removeEmptyRanks, ql = Wg, py = em, Kl = nm, vy = jm, gy = ly, _t = Ye, my = St.Graph;
var yy = by;
function by(e, t) {
  let n = t && t.debugTiming ? _t.time : _t.notime;
  n("layout", () => {
    let o = n("  buildLayoutGraph", () => My(e));
    n("  runLayout", () => _y(o, n, t)), n("  updateInputGraph", () => wy(e, o));
  });
}
function _y(e, t, n) {
  t("    makeSpaceForEdgeLabels", () => Iy(e)), t("    removeSelfEdges", () => zy(e)), t("    acyclic", () => Xl.run(e)), t("    nestingGraph.run", () => ql.run(e)), t("    rank", () => cy(_t.asNonCompoundGraph(e))), t("    injectEdgeLabelProxies", () => Oy(e)), t("    removeEmptyRanks", () => hy(e)), t("    nestingGraph.cleanup", () => ql.cleanup(e)), t("    normalizeRanks", () => dy(e)), t("    assignRankMinMax", () => Ty(e)), t("    removeEdgeLabelProxies", () => Py(e)), t("    normalize.run", () => Wl.run(e)), t("    parentDummyChains", () => fy(e)), t("    addBorderSegments", () => py(e)), t("    order", () => vy(e, n)), t("    insertSelfEdges", () => By(e)), t("    adjustCoordinateSystem", () => Kl.adjust(e)), t("    position", () => gy(e)), t("    positionSelfEdges", () => Fy(e)), t("    removeBorderNodes", () => Vy(e)), t("    normalize.undo", () => Wl.undo(e)), t("    fixupEdgeLabelCoords", () => Ry(e)), t("    undoCoordinateSystem", () => Kl.undo(e)), t("    translateGraph", () => Dy(e)), t("    assignNodeIntersects", () => Ay(e)), t("    reversePoints", () => Ly(e)), t("    acyclic.undo", () => Xl.undo(e));
}
function wy(e, t) {
  e.nodes().forEach((n) => {
    let o = e.node(n), i = t.node(n);
    o && (o.x = i.x, o.y = i.y, o.rank = i.rank, t.children(n).length && (o.width = i.width, o.height = i.height));
  }), e.edges().forEach((n) => {
    let o = e.edge(n), i = t.edge(n);
    o.points = i.points, Object.hasOwn(i, "x") && (o.x = i.x, o.y = i.y);
  }), e.graph().width = t.graph().width, e.graph().height = t.graph().height;
}
let Ey = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"], xy = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: "tb" }, ky = ["acyclicer", "ranker", "rankdir", "align"], Sy = ["width", "height", "rank"], Zl = { width: 0, height: 0 }, Cy = ["minlen", "weight", "width", "height", "labeloffset"], Ny = {
  minlen: 1,
  weight: 1,
  width: 0,
  height: 0,
  labeloffset: 10,
  labelpos: "r"
}, $y = ["labelpos"];
function My(e) {
  let t = new my({ multigraph: !0, compound: !0 }), n = _r(e.graph());
  return t.setGraph(Object.assign(
    {},
    xy,
    br(n, Ey),
    _t.pick(n, ky)
  )), e.nodes().forEach((o) => {
    let i = _r(e.node(o));
    const r = br(i, Sy);
    Object.keys(Zl).forEach((s) => {
      r[s] === void 0 && (r[s] = Zl[s]);
    }), t.setNode(o, r), t.setParent(o, e.parent(o));
  }), e.edges().forEach((o) => {
    let i = _r(e.edge(o));
    t.setEdge(o, Object.assign(
      {},
      Ny,
      br(i, Cy),
      _t.pick(i, $y)
    ));
  }), t;
}
function Iy(e) {
  let t = e.graph();
  t.ranksep /= 2, e.edges().forEach((n) => {
    let o = e.edge(n);
    o.minlen *= 2, o.labelpos.toLowerCase() !== "c" && (t.rankdir === "TB" || t.rankdir === "BT" ? o.width += o.labeloffset : o.height += o.labeloffset);
  });
}
function Oy(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t);
    if (n.width && n.height) {
      let o = e.node(t.v), r = { rank: (e.node(t.w).rank - o.rank) / 2 + o.rank, e: t };
      _t.addDummyNode(e, "edge-proxy", r, "_ep");
    }
  });
}
function Ty(e) {
  let t = 0;
  e.nodes().forEach((n) => {
    let o = e.node(n);
    o.borderTop && (o.minRank = e.node(o.borderTop).rank, o.maxRank = e.node(o.borderBottom).rank, t = Math.max(t, o.maxRank));
  }), e.graph().maxRank = t;
}
function Py(e) {
  e.nodes().forEach((t) => {
    let n = e.node(t);
    n.dummy === "edge-proxy" && (e.edge(n.e).labelRank = n.rank, e.removeNode(t));
  });
}
function Dy(e) {
  let t = Number.POSITIVE_INFINITY, n = 0, o = Number.POSITIVE_INFINITY, i = 0, r = e.graph(), s = r.marginx || 0, l = r.marginy || 0;
  function a(u) {
    let c = u.x, f = u.y, h = u.width, m = u.height;
    t = Math.min(t, c - h / 2), n = Math.max(n, c + h / 2), o = Math.min(o, f - m / 2), i = Math.max(i, f + m / 2);
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
function Ay(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t), o = e.node(t.v), i = e.node(t.w), r, s;
    n.points ? (r = n.points[0], s = n.points[n.points.length - 1]) : (n.points = [], r = i, s = o), n.points.unshift(_t.intersectRect(o, r)), n.points.push(_t.intersectRect(i, s));
  });
}
function Ry(e) {
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
function Ly(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t);
    n.reversed && n.points.reverse();
  });
}
function Vy(e) {
  e.nodes().forEach((t) => {
    if (e.children(t).length) {
      let n = e.node(t), o = e.node(n.borderTop), i = e.node(n.borderBottom), r = e.node(n.borderLeft[n.borderLeft.length - 1]), s = e.node(n.borderRight[n.borderRight.length - 1]);
      n.width = Math.abs(s.x - r.x), n.height = Math.abs(i.y - o.y), n.x = r.x + n.width / 2, n.y = o.y + n.height / 2;
    }
  }), e.nodes().forEach((t) => {
    e.node(t).dummy === "border" && e.removeNode(t);
  });
}
function zy(e) {
  e.edges().forEach((t) => {
    if (t.v === t.w) {
      var n = e.node(t.v);
      n.selfEdges || (n.selfEdges = []), n.selfEdges.push({ e: t, label: e.edge(t) }), e.removeEdge(t);
    }
  });
}
function By(e) {
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
function Fy(e) {
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
function br(e, t) {
  return _t.mapValues(_t.pick(e, t), Number);
}
function _r(e) {
  var t = {};
  return e && Object.entries(e).forEach(([n, o]) => {
    typeof n == "string" && (n = n.toLowerCase()), t[n] = o;
  }), t;
}
let Hy = Ye, jy = St.Graph;
var Uy = {
  debugOrdering: Gy
};
function Gy(e) {
  let t = Hy.buildLayerMatrix(e), n = new jy({ compound: !0, multigraph: !0 }).setGraph({});
  return e.nodes().forEach((o) => {
    n.setNode(o, { label: o }), n.setParent(o, "layer" + e.node(o).rank);
  }), e.edges().forEach((o) => n.setEdge(o.v, o.w, {}, o.name)), t.forEach((o, i) => {
    let r = "layer" + i;
    n.setNode(r, { rank: "same" }), o.reduce((s, l) => (n.setEdge(s, l, { style: "invis" }), l));
  }), n;
}
var Yy = "1.1.5", Xy = {
  graphlib: St,
  layout: yy,
  debug: Uy,
  util: {
    time: Ye.time,
    notime: Ye.notime
  },
  version: Yy
};
const Jl = /* @__PURE__ */ Up(Xy), Ql = 190, ea = 78, ta = ["profile", "memory", "rag", "extensions", "voice", "live2d"];
function Wy(e) {
  const t = e.nodes.find((a) => a.data.kind === "persona"), n = e.nodes.find((a) => a.data.kind === "extensions");
  if (!t || !n) return;
  const o = /* @__PURE__ */ new Map(), i = e.nodes.filter((a) => a.type === "module" && a.data.kind !== "extensions").sort((a, u) => ta.indexOf(a.data.kind) - ta.indexOf(u.data.kind));
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
      const h = c.shift(), m = u.get(h);
      e.edges.filter((C) => C.source === h).forEach((C) => {
        u.has(C.target) || (u.set(C.target, m + 1), c.push(C.target));
      });
    }
    const f = Math.max(0, ...u.values());
    for (let h = 1; h <= f; h += 1) {
      const m = e.nodes.filter((N) => u.get(N.id) === h).sort((N, $) => N.data.label.localeCompare($.data.label)), C = o.get(n.id).y;
      m.forEach((N, $) => o.set(N.id, {
        x: 960 + h * 260,
        y: C + ($ - (m.length - 1) / 2) * 104
      }));
    }
  }
  return {
    nodes: e.nodes.map((a) => ({ ...a, position: o.get(a.id) || a.position })),
    edges: e.edges.map((a) => ({ ...a }))
  };
}
function qy(e) {
  const t = Wy(e);
  if (t) return t;
  const n = new Jl.graphlib.Graph();
  return n.setDefaultEdgeLabel(() => ({})), n.setGraph({ rankdir: "LR", nodesep: 34, ranksep: 96, marginx: 28, marginy: 28 }), [...e.nodes].sort((o, i) => o.id.localeCompare(i.id)).forEach((o) => n.setNode(o.id, { width: Ql, height: ea })), [...e.edges].sort((o, i) => o.id.localeCompare(i.id)).forEach((o) => n.setEdge(o.source, o.target)), Jl.layout(n), {
    nodes: e.nodes.map((o) => {
      const i = n.node(o.id);
      return { ...o, position: { x: i.x - Ql / 2, y: i.y - ea / 2 } };
    }),
    edges: e.edges.map((o) => ({ ...o }))
  };
}
function Ky(e, t) {
  const n = /* @__PURE__ */ new Set([t]), o = [t];
  for (; o.length; ) {
    const i = o.shift();
    for (const r of e.edges)
      r.source !== i || n.has(r.target) || (n.add(r.target), o.push(r.target));
  }
  return n;
}
function Zy(e, t, n) {
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
function Jy(e, t) {
  var a;
  const n = e.nodes.find((u) => u.data.kind === "persona");
  if (!n) return e;
  const o = (a = e.nodes.find((u) => u.data.kind === "extensions")) == null ? void 0 : a.id, i = new Set(
    e.edges.filter((u) => u.source === (o || n.id)).map((u) => u.target).filter((u) => e.nodes.some((c) => c.id === u && ["skill", "tool"].includes(c.data.kind)))
  ), r = Zy(e, t, i), s = t === o, l = /* @__PURE__ */ new Set([
    n.id,
    ...e.nodes.filter((u) => u.type === "module").map((u) => u.id),
    ...r ? [r] : s ? i : []
  ]);
  return r && Ky(e, r).forEach((u) => l.add(u)), {
    nodes: e.nodes.filter((u) => l.has(u.id)),
    edges: e.edges.filter((u) => l.has(u.source) && l.has(u.target))
  };
}
const Qy = ["aria-busy"], e0 = {
  key: 0,
  class: "inspect-fields"
}, t0 = ["value"], n0 = ["value"], o0 = ["value"], i0 = {
  key: 1,
  class: "inspect-stack rag-inspector"
}, r0 = ["disabled"], s0 = {
  key: 0,
  class: "pending-files"
}, l0 = ["onClick"], a0 = ["onClick"], u0 = ["disabled"], c0 = { class: "document-items" }, d0 = { class: "document-actions" }, f0 = ["onClick"], h0 = ["onClick"], p0 = ["onClick"], v0 = {
  key: 2,
  class: "inspect-stack"
}, g0 = {
  key: 3,
  class: "inspect-stack"
}, m0 = {
  key: 4,
  class: "inspect-fields"
}, y0 = { class: "inline-check" }, b0 = ["checked"], _0 = { class: "inline-check" }, w0 = ["checked"], E0 = ["value"], x0 = ["value"], k0 = ["value"], S0 = { class: "inspect-button-row" }, C0 = ["disabled"], N0 = {
  key: 5,
  class: "live2d-model-library"
}, $0 = { class: "live2d-binding-summary" }, M0 = ["disabled"], I0 = { class: "live2d-library-actions" }, O0 = ["disabled"], T0 = ["disabled"], P0 = { class: "live2d-model-heading" }, D0 = {
  key: 0,
  class: "live2d-model-items"
}, A0 = { class: "live2d-model-copy" }, R0 = { class: "live2d-model-state" }, L0 = {
  key: 0,
  type: "button",
  disabled: "",
  class: "is-bound"
}, V0 = ["disabled", "title", "onClick"], z0 = {
  key: 1,
  class: "live2d-model-empty"
}, B0 = {
  key: 6,
  class: "inspect-fields"
}, F0 = { key: 0 }, H0 = ["value"], j0 = { key: 1 }, U0 = {
  key: 2,
  class: "dependency-list"
}, G0 = {
  key: 7,
  class: "inspect-fields"
}, Y0 = { class: "inline-check" }, X0 = ["checked", "disabled"], W0 = /* @__PURE__ */ Te({
  __name: "NodeInspector",
  props: {
    node: {},
    draft: {},
    disabled: { type: Boolean },
    uploadCompleteToken: {}
  },
  emits: ["profile", "capability", "server", "upload", "deleteDocument", "retryDocument", "deletePersona", "previewVoice", "openVoiceStudio", "openRagEval", "previewDocument", "previewLocalFile", "refreshLive2d", "openLive2dDirectory"],
  setup(e, { emit: t }) {
    const n = e, o = t, i = re([]), r = re(""), s = re(0), l = ce(() => {
      var M;
      return ((M = n.node) == null ? void 0 : M.data.kind) || "persona";
    }), a = ce(() => n.draft.capabilities.packages.find((M) => {
      var E;
      return M.id === ((E = n.node) == null ? void 0 : E.id);
    })), u = ce(() => l.value === "mcp" ? n.draft.grants.servers.find((M) => {
      var E;
      return `mcp:${M.name}` === ((E = n.node) == null ? void 0 : E.id);
    }) : void 0), c = ce(() => {
      const M = n.node ? n.draft.capabilities.overrides[n.node.id] : void 0;
      return M === !0 ? "allow" : M === !1 ? "deny" : "inherit";
    }), f = ce(() => {
      var M, E;
      return String(((E = (M = n.draft.persona.profile) == null ? void 0 : M.live2d) == null ? void 0 : E.model) || "");
    }), h = ce(() => {
      var M;
      return ((M = n.draft.resources) == null ? void 0 : M.live2dModels) || [];
    }), m = ce(() => {
      var M;
      return { available: "可用", partial: "部分可用", unassigned: "未分配", blocked: "不可用", pending: "等待中", error: "异常" }[((M = n.node) == null ? void 0 : M.data.status) || "blocked"];
    });
    function C(M) {
      return M.kind === "cubism2" ? "Cubism 2" : M.moc_version ? `MOC3 v${M.moc_version}` : "Cubism / MOC3";
    }
    function N(M, E) {
      const Y = qe(n.draft.persona), ne = { ...Y.profile || {} };
      M === "name" ? Y.name = String(E) : ne[M] = E, Y.profile = ne, o("profile", Y);
    }
    function $(M, E) {
      const Y = qe(n.draft.persona), ne = { ...Y.profile || {} };
      ne.tts = { ...ne.tts || {}, [M]: E }, Y.profile = ne, o("profile", Y);
    }
    function I(M) {
      const E = qe(n.draft.persona), Y = { ...E.profile || {} };
      Y.live2d = { ...Y.live2d || {}, model: M }, E.profile = Y, o("profile", E);
    }
    function A(M) {
      i.value = Array.from(M.target.files || []);
    }
    function k(M) {
      var E;
      i.value = Array.from(((E = M.dataTransfer) == null ? void 0 : E.files) || []);
    }
    function _(M) {
      i.value = i.value.filter((E, Y) => Y !== M);
    }
    function B() {
      n.disabled || !i.value.length && !r.value.trim() || o("upload", i.value, r.value);
    }
    return ke(() => n.uploadCompleteToken, () => {
      i.value = [], r.value = "", s.value += 1;
    }), (M, E) => {
      var Y, ne, G, Z, T, R, w, D, P, F, X, Q, oe, ue, ee, le;
      return U(), W("aside", {
        class: xe(["node-inspector", { "is-disabled": M.disabled }]),
        "aria-busy": M.disabled
      }, [
        p("header", null, [
          p("div", null, [
            p("strong", null, J(((Y = M.node) == null ? void 0 : Y.data.label) || "角色配置"), 1),
            p("small", null, J((ne = M.node) == null ? void 0 : ne.data.summary), 1)
          ]),
          M.node ? (U(), W("span", {
            key: 0,
            class: xe(`inspect-status status-${M.node.data.status}`)
          }, J(m.value), 3)) : Se("", !0)
        ]),
        l.value === "profile" ? (U(), W("div", e0, [
          p("label", null, [
            E[18] || (E[18] = p("span", null, "角色名称", -1)),
            p("input", {
              value: M.draft.persona.name,
              onInput: E[0] || (E[0] = (j) => N("name", j.target.value))
            }, null, 40, t0)
          ]),
          p("label", null, [
            E[19] || (E[19] = p("span", null, "角色人设", -1)),
            p("textarea", {
              rows: "7",
              value: String(((G = M.draft.persona.profile) == null ? void 0 : G.description) || ""),
              onInput: E[1] || (E[1] = (j) => N("description", j.target.value))
            }, null, 40, n0)
          ]),
          p("label", null, [
            E[21] || (E[21] = p("span", null, "回复语言", -1)),
            p("select", {
              value: String(((Z = M.draft.persona.profile) == null ? void 0 : Z.reply_language) || ""),
              onChange: E[2] || (E[2] = (j) => N("reply_language", j.target.value))
            }, E[20] || (E[20] = [
              p("option", { value: "" }, "跟随对话", -1),
              p("option", { value: "zh" }, "中文", -1),
              p("option", { value: "ja" }, "日语", -1),
              p("option", { value: "en" }, "英语", -1)
            ]), 40, o0)
          ]),
          p("button", {
            type: "button",
            class: "inspect-danger",
            onClick: E[3] || (E[3] = (j) => o("deletePersona"))
          }, [
            ie(V(_o), { size: 15 }),
            E[22] || (E[22] = Le("删除当前角色"))
          ])
        ])) : l.value === "rag" ? (U(), W("div", i0, [
          p("p", null, J(M.draft.documents.length) + " 份资料已关联到角色知识空间。", 1),
          p("label", {
            class: "document-picker",
            onDragover: E[4] || (E[4] = Mo(() => {
            }, ["prevent"])),
            onDrop: Mo(k, ["prevent"])
          }, [
            ie(V(Wr), { size: 15 }),
            p("span", null, J(i.value.length ? `已选择 ${i.value.length} 个文件` : "选择或拖入资料文件"), 1),
            (U(), W("input", {
              key: s.value,
              type: "file",
              multiple: "",
              disabled: M.disabled,
              onChange: A
            }, null, 40, r0))
          ], 32),
          i.value.length ? (U(), W("ul", s0, [
            (U(!0), W(me, null, Re(i.value, (j, ge) => (U(), W("li", {
              key: `${j.name}-${j.size}-${ge}`
            }, [
              p("span", null, J(j.name), 1),
              p("span", null, [
                p("button", {
                  type: "button",
                  title: "上传前预览",
                  onClick: (_e) => o("previewLocalFile", j)
                }, [
                  ie(V(Ml), { size: 14 })
                ], 8, l0),
                p("button", {
                  type: "button",
                  title: "移除",
                  onClick: (_e) => _(ge)
                }, [
                  ie(V(_o), { size: 14 })
                ], 8, a0)
              ])
            ]))), 128))
          ])) : Se("", !0),
          p("label", null, [
            E[23] || (E[23] = p("span", null, "补充文本", -1)),
            Xe(p("textarea", {
              "onUpdate:modelValue": E[5] || (E[5] = (j) => r.value = j),
              rows: "3",
              placeholder: "直接写入角色知识库"
            }, null, 512), [
              [it, r.value]
            ])
          ]),
          p("button", {
            type: "button",
            class: "inspect-action",
            disabled: M.disabled || !i.value.length && !r.value.trim(),
            onClick: B
          }, [
            ie(V(Wr), { size: 15 }),
            Le(J(M.disabled ? "处理中" : "写入知识库"), 1)
          ], 8, u0),
          p("ul", c0, [
            (U(!0), W(me, null, Re(M.draft.documents, (j) => (U(), W("li", {
              key: String(j.id)
            }, [
              p("div", null, [
                p("b", null, J(j.original_filename || j.original_name || j.id), 1),
                p("span", null, J(j.status), 1)
              ]),
              p("span", d0, [
                p("button", {
                  type: "button",
                  title: "预览 Markdown",
                  onClick: (ge) => o("previewDocument", j)
                }, [
                  ie(V(Ml), { size: 14 })
                ], 8, f0),
                j.status === "index_failed" ? (U(), W("button", {
                  key: 0,
                  type: "button",
                  title: "重新索引",
                  onClick: (ge) => o("retryDocument", String(j.id))
                }, [
                  ie(V(rc), { size: 14 })
                ], 8, h0)) : Se("", !0),
                p("button", {
                  type: "button",
                  title: "删除资料",
                  onClick: (ge) => o("deleteDocument", String(j.id))
                }, [
                  ie(V(_o), { size: 14 })
                ], 8, p0)
              ])
            ]))), 128))
          ]),
          p("button", {
            type: "button",
            class: "inspect-action",
            onClick: E[6] || (E[6] = (j) => o("openRagEval"))
          }, [
            ie(V($l), { size: 15 }),
            E[24] || (E[24] = Le("前往 RAG 评测"))
          ])
        ])) : l.value === "memory" ? (U(), W("div", v0, E[25] || (E[25] = [
          p("p", null, "会话记忆按对话窗口隔离，长期记忆与角色绑定。", -1),
          p("small", null, "清理操作继续在对应对话或接入窗口执行，避免误清其他会话。", -1)
        ]))) : l.value === "extensions" ? (U(), W("div", g0, [
          p("p", null, "当前角色可配置 " + J(M.draft.capabilities.packages.length) + " 项扩展能力。", 1),
          E[26] || (E[26] = p("small", null, "选择画布中的 Skill 或 Tool 查看依赖并设置角色策略；依赖只在选中时展开。", -1))
        ])) : l.value === "voice" ? (U(), W("div", m0, [
          p("label", y0, [
            p("input", {
              type: "checkbox",
              checked: !!((R = (T = M.draft.persona.profile) == null ? void 0 : T.tts) != null && R.enabled),
              onChange: E[7] || (E[7] = (j) => $("enabled", j.target.checked))
            }, null, 40, b0),
            E[27] || (E[27] = p("span", null, "生成语音", -1))
          ]),
          p("label", _0, [
            p("input", {
              type: "checkbox",
              checked: !!((D = (w = M.draft.persona.profile) == null ? void 0 : w.tts) != null && D.auto_play),
              onChange: E[8] || (E[8] = (j) => $("auto_play", j.target.checked))
            }, null, 40, w0),
            E[28] || (E[28] = p("span", null, "自动播放", -1))
          ]),
          p("label", null, [
            E[30] || (E[30] = p("span", null, "角色音色", -1)),
            p("select", {
              value: String(((F = (P = M.draft.persona.profile) == null ? void 0 : P.tts) == null ? void 0 : F.voice_asset_id) || ""),
              onChange: E[9] || (E[9] = (j) => $("voice_asset_id", j.target.value))
            }, [
              E[29] || (E[29] = p("option", { value: "" }, "不绑定音色", -1)),
              (U(!0), W(me, null, Re((X = M.draft.resources) == null ? void 0 : X.voiceAssets, (j) => (U(), W("option", {
                key: j.id,
                value: j.id
              }, J(j.name), 9, x0))), 128))
            ], 40, E0)
          ]),
          p("label", null, [
            E[32] || (E[32] = p("span", null, "输出语言", -1)),
            p("select", {
              value: String(((oe = (Q = M.draft.persona.profile) == null ? void 0 : Q.tts) == null ? void 0 : oe.output_language) || "auto"),
              onChange: E[10] || (E[10] = (j) => $("output_language", j.target.value))
            }, E[31] || (E[31] = [
              p("option", { value: "auto" }, "自动", -1),
              p("option", { value: "zh" }, "中文", -1),
              p("option", { value: "ja" }, "日语", -1),
              p("option", { value: "en" }, "英语", -1)
            ]), 40, k0)
          ]),
          p("div", S0, [
            p("button", {
              type: "button",
              class: "inspect-action",
              disabled: !((ee = (ue = M.draft.persona.profile) == null ? void 0 : ue.tts) != null && ee.voice_asset_id),
              onClick: E[11] || (E[11] = (j) => o("previewVoice"))
            }, [
              ie(V(ic), { size: 15 }),
              E[33] || (E[33] = Le("试听"))
            ], 8, C0),
            p("button", {
              type: "button",
              class: "inspect-action",
              onClick: E[12] || (E[12] = (j) => o("openVoiceStudio"))
            }, [
              ie(V($l), { size: 15 }),
              E[34] || (E[34] = Le("声音工坊"))
            ])
          ])
        ])) : l.value === "live2d" ? (U(), W("div", N0, [
          p("section", $0, [
            E[35] || (E[35] = p("span", null, "当前角色绑定", -1)),
            p("strong", null, J(f.value || "未绑定模型"), 1),
            f.value ? (U(), W("button", {
              key: 0,
              type: "button",
              disabled: M.disabled,
              onClick: E[13] || (E[13] = (j) => I(""))
            }, "解除绑定", 8, M0)) : Se("", !0)
          ]),
          p("div", I0, [
            p("button", {
              type: "button",
              disabled: M.disabled,
              title: "重新扫描模型",
              onClick: E[14] || (E[14] = (j) => o("refreshLive2d"))
            }, [
              ie(V(Gr), { size: 15 }),
              E[36] || (E[36] = Le("刷新"))
            ], 8, O0),
            p("button", {
              type: "button",
              disabled: M.disabled,
              title: "打开 Live2D 模型文件夹",
              onClick: E[15] || (E[15] = (j) => o("openLive2dDirectory"))
            }, [
              ie(V(bp), { size: 15 }),
              E[37] || (E[37] = Le("打开文件夹"))
            ], 8, T0)
          ]),
          p("div", P0, [
            E[38] || (E[38] = p("strong", null, "已安装模型", -1)),
            p("span", null, J(h.value.length) + " 个", 1)
          ]),
          h.value.length ? (U(), W("ul", D0, [
            (U(!0), W(me, null, Re(h.value, (j) => (U(), W("li", {
              key: j.id,
              class: xe({ bound: f.value === j.id, incompatible: j.compatible === !1 })
            }, [
              p("div", A0, [
                p("strong", null, J(j.name), 1),
                p("span", null, J(C(j)), 1)
              ]),
              p("div", R0, [
                p("span", {
                  class: xe(j.compatible === !1 ? "is-error" : "is-compatible")
                }, J(j.compatible === !1 ? "不兼容" : "兼容"), 3),
                f.value === j.id ? (U(), W("button", L0, [
                  ie(V(gp), { size: 14 }),
                  E[39] || (E[39] = Le("已绑定"))
                ])) : (U(), W("button", {
                  key: 1,
                  type: "button",
                  disabled: M.disabled || j.compatible === !1,
                  title: j.compatible === !1 ? "当前 Live2D 运行时不支持此 MOC3 版本" : `绑定 ${j.name}`,
                  onClick: (ge) => I(j.id)
                }, "绑定", 8, V0))
              ])
            ], 2))), 128))
          ])) : (U(), W("div", z0, E[40] || (E[40] = [
            p("strong", null, "尚未发现模型", -1),
            p("p", null, "将模型文件夹放入 data/live2d 后刷新。", -1)
          ]))),
          E[41] || (E[41] = p("p", { class: "live2d-save-hint" }, "绑定修改会随页面顶部“保存配置”一起生效。", -1))
        ])) : l.value === "skill" || l.value === "tool" ? (U(), W("div", B0, [
          a.value ? (U(), W("label", F0, [
            E[43] || (E[43] = p("span", null, "角色策略", -1)),
            p("select", {
              value: c.value,
              onChange: E[16] || (E[16] = (j) => o("capability", M.node.id, j.target.value))
            }, E[42] || (E[42] = [
              p("option", { value: "inherit" }, "继承默认", -1),
              p("option", { value: "allow" }, "允许", -1),
              p("option", { value: "deny" }, "禁用", -1)
            ]), 40, H0)
          ])) : (U(), W("p", j0, "此 Tool 由上级能力包管理，不单独保存开关。")),
          a.value ? (U(), W("div", U0, [
            E[44] || (E[44] = p("b", null, "依赖", -1)),
            (U(!0), W(me, null, Re(a.value.dependencies, (j) => (U(), W("p", {
              key: j.id || j.name
            }, [
              p("span", null, J(j.name), 1),
              p("em", null, J(j.server || j.source), 1)
            ]))), 128))
          ])) : Se("", !0)
        ])) : l.value === "mcp" && u.value ? (U(), W("div", G0, [
          p("label", Y0, [
            p("input", {
              type: "checkbox",
              checked: u.value.authorized,
              disabled: u.value.global,
              onChange: E[17] || (E[17] = (j) => o("server", u.value.name, j.target.checked))
            }, null, 40, X0),
            p("span", null, J(u.value.global ? "全局授权" : "允许当前角色使用"), 1)
          ]),
          p("p", null, J(u.value.description || "MCP 服务"), 1),
          p("small", null, "连接状态：" + J(((le = u.value.status) == null ? void 0 : le.status) || "unknown"), 1)
        ])) : Se("", !0)
      ], 10, Qy);
    };
  }
});
function Yi(e) {
  return bs() ? (ri(e), !0) : !1;
}
function Gt(e) {
  return typeof e == "function" ? e() : V(e);
}
const q0 = typeof window < "u" && typeof document < "u", K0 = (e) => typeof e < "u", Z0 = Object.prototype.toString, J0 = (e) => Z0.call(e) === "[object Object]", Q0 = () => {
};
function e1(e, t) {
  function n(...o) {
    return new Promise((i, r) => {
      Promise.resolve(e(() => t.apply(this, o), { fn: t, thisArg: this, args: o })).then(i).catch(r);
    });
  }
  return n;
}
const Dc = (e) => e();
function t1(e = Dc) {
  const t = re(!0);
  function n() {
    t.value = !1;
  }
  function o() {
    t.value = !0;
  }
  const i = (...r) => {
    t.value && e(...r);
  };
  return { isActive: ks(t), pause: n, resume: o, eventFilter: i };
}
function na(e, t = !1, n = "Timeout") {
  return new Promise((o, i) => {
    setTimeout(t ? () => i(n) : o, e);
  });
}
function n1(e, t, n = {}) {
  const {
    eventFilter: o = Dc,
    ...i
  } = n;
  return ke(
    e,
    e1(
      o,
      t
    ),
    i
  );
}
function Ln(e, t, n = {}) {
  const {
    eventFilter: o,
    ...i
  } = n, { eventFilter: r, pause: s, resume: l, isActive: a } = t1(o);
  return { stop: n1(
    e,
    t,
    {
      ...i,
      eventFilter: r
    }
  ), pause: s, resume: l, isActive: a };
}
function o1(e, t = {}) {
  if (!He(e))
    return $f(e);
  const n = Array.isArray(e.value) ? Array.from({ length: e.value.length }) : {};
  for (const o in e.value)
    n[o] = Nf(() => ({
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
function Jr(e, t = !1) {
  function n(f, { flush: h = "sync", deep: m = !1, timeout: C, throwOnTimeout: N } = {}) {
    let $ = null;
    const A = [new Promise((k) => {
      $ = ke(
        e,
        (_) => {
          f(_) !== t && ($ == null || $(), k(_));
        },
        {
          flush: h,
          deep: m,
          immediate: !0
        }
      );
    })];
    return C != null && A.push(
      na(C, N).then(() => Gt(e)).finally(() => $ == null ? void 0 : $())
    ), Promise.race(A);
  }
  function o(f, h) {
    if (!He(f))
      return n((_) => _ === f, h);
    const { flush: m = "sync", deep: C = !1, timeout: N, throwOnTimeout: $ } = h ?? {};
    let I = null;
    const k = [new Promise((_) => {
      I = ke(
        [e, f],
        ([B, M]) => {
          t !== (B === M) && (I == null || I(), _(B));
        },
        {
          flush: m,
          deep: C,
          immediate: !0
        }
      );
    })];
    return N != null && k.push(
      na(N, $).then(() => Gt(e)).finally(() => (I == null || I(), Gt(e)))
    ), Promise.race(k);
  }
  function i(f) {
    return n((h) => !!h, f);
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
  function a(f, h) {
    return n((m) => {
      const C = Array.from(m);
      return C.includes(f) || C.includes(Gt(f));
    }, h);
  }
  function u(f) {
    return c(1, f);
  }
  function c(f = 1, h) {
    let m = -1;
    return n(() => (m += 1, m >= f), h);
  }
  return Array.isArray(Gt(e)) ? {
    toMatch: n,
    toContains: a,
    changed: u,
    changedTimes: c,
    get not() {
      return Jr(e, !t);
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
      return Jr(e, !t);
    }
  };
}
function Qr(e) {
  return Jr(e);
}
function i1(e) {
  var t;
  const n = Gt(e);
  return (t = n == null ? void 0 : n.$el) != null ? t : n;
}
const Ac = q0 ? window : void 0;
function Rc(...e) {
  let t, n, o, i;
  if (typeof e[0] == "string" || Array.isArray(e[0]) ? ([n, o, i] = e, t = Ac) : [t, n, o, i] = e, !t)
    return Q0;
  Array.isArray(n) || (n = [n]), Array.isArray(o) || (o = [o]);
  const r = [], s = () => {
    r.forEach((c) => c()), r.length = 0;
  }, l = (c, f, h, m) => (c.addEventListener(f, h, m), () => c.removeEventListener(f, h, m)), a = ke(
    () => [i1(t), Gt(i)],
    ([c, f]) => {
      if (s(), !c)
        return;
      const h = J0(f) ? { ...f } : f;
      r.push(
        ...n.flatMap((m) => o.map((C) => l(c, m, C, h)))
      );
    },
    { immediate: !0, flush: "post" }
  ), u = () => {
    a(), s();
  };
  return Yi(u), u;
}
function r1(e) {
  return typeof e == "function" ? e : typeof e == "string" ? (t) => t.key === e : Array.isArray(e) ? (t) => e.includes(t.key) : () => !0;
}
function oa(...e) {
  let t, n, o = {};
  e.length === 3 ? (t = e[0], n = e[1], o = e[2]) : e.length === 2 ? typeof e[1] == "object" ? (t = !0, n = e[0], o = e[1]) : (t = e[0], n = e[1]) : (t = !0, n = e[0]);
  const {
    target: i = Ac,
    eventName: r = "keydown",
    passive: s = !1,
    dedupe: l = !1
  } = o, a = r1(t);
  return Rc(i, r, (c) => {
    c.repeat && Gt(l) || a(c) && n(c);
  }, s);
}
function s1(e) {
  return JSON.parse(JSON.stringify(e));
}
function wr(e, t, n, o = {}) {
  var i, r, s;
  const {
    clone: l = !1,
    passive: a = !1,
    eventName: u,
    deep: c = !1,
    defaultValue: f,
    shouldEmit: h
  } = o, m = to(), C = n || (m == null ? void 0 : m.emit) || ((i = m == null ? void 0 : m.$emit) == null ? void 0 : i.bind(m)) || ((s = (r = m == null ? void 0 : m.proxy) == null ? void 0 : r.$emit) == null ? void 0 : s.bind(m == null ? void 0 : m.proxy));
  let N = u;
  t || (t = "modelValue"), N = N || `update:${t.toString()}`;
  const $ = (k) => l ? typeof l == "function" ? l(k) : s1(k) : k, I = () => K0(e[t]) ? $(e[t]) : f, A = (k) => {
    h ? h(k) && C(N, k) : C(N, k);
  };
  if (a) {
    const k = I(), _ = re(k);
    let B = !1;
    return ke(
      () => e[t],
      (M) => {
        B || (B = !0, _.value = $(M), Ze(() => B = !1));
      }
    ), ke(
      _,
      (M) => {
        !B && (M !== e[t] || c) && A(M);
      },
      { deep: c }
    ), _;
  } else
    return ce({
      get() {
        return I();
      },
      set(k) {
        A(k);
      }
    });
}
var l1 = { value: () => {
} };
function Xi() {
  for (var e = 0, t = arguments.length, n = {}, o; e < t; ++e) {
    if (!(o = arguments[e] + "") || o in n || /[\s.]/.test(o))
      throw new Error("illegal type: " + o);
    n[o] = [];
  }
  return new ci(n);
}
function ci(e) {
  this._ = e;
}
function a1(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var o = "", i = n.indexOf(".");
    if (i >= 0 && (o = n.slice(i + 1), n = n.slice(0, i)), n && !t.hasOwnProperty(n))
      throw new Error("unknown type: " + n);
    return { type: n, name: o };
  });
}
ci.prototype = Xi.prototype = {
  constructor: ci,
  on: function(e, t) {
    var n = this._, o = a1(e + "", n), i, r = -1, s = o.length;
    if (arguments.length < 2) {
      for (; ++r < s; )
        if ((i = (e = o[r]).type) && (i = u1(n[i], e.name)))
          return i;
      return;
    }
    if (t != null && typeof t != "function")
      throw new Error("invalid callback: " + t);
    for (; ++r < s; )
      if (i = (e = o[r]).type)
        n[i] = ia(n[i], e.name, t);
      else if (t == null)
        for (i in n)
          n[i] = ia(n[i], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t)
      e[n] = t[n].slice();
    return new ci(e);
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
function u1(e, t) {
  for (var n = 0, o = e.length, i; n < o; ++n)
    if ((i = e[n]).name === t)
      return i.value;
}
function ia(e, t, n) {
  for (var o = 0, i = e.length; o < i; ++o)
    if (e[o].name === t) {
      e[o] = l1, e = e.slice(0, o).concat(e.slice(o + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var es = "http://www.w3.org/1999/xhtml";
const ra = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: es,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function Wi(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), ra.hasOwnProperty(t) ? { space: ra[t], local: e } : e;
}
function c1(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === es && t.documentElement.namespaceURI === es ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function d1(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function Lc(e) {
  var t = Wi(e);
  return (t.local ? d1 : c1)(t);
}
function f1() {
}
function Ls(e) {
  return e == null ? f1 : function() {
    return this.querySelector(e);
  };
}
function h1(e) {
  typeof e != "function" && (e = Ls(e));
  for (var t = this._groups, n = t.length, o = new Array(n), i = 0; i < n; ++i)
    for (var r = t[i], s = r.length, l = o[i] = new Array(s), a, u, c = 0; c < s; ++c)
      (a = r[c]) && (u = e.call(a, a.__data__, c, r)) && ("__data__" in a && (u.__data__ = a.__data__), l[c] = u);
  return new gt(o, this._parents);
}
function p1(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function v1() {
  return [];
}
function Vc(e) {
  return e == null ? v1 : function() {
    return this.querySelectorAll(e);
  };
}
function g1(e) {
  return function() {
    return p1(e.apply(this, arguments));
  };
}
function m1(e) {
  typeof e == "function" ? e = g1(e) : e = Vc(e);
  for (var t = this._groups, n = t.length, o = [], i = [], r = 0; r < n; ++r)
    for (var s = t[r], l = s.length, a, u = 0; u < l; ++u)
      (a = s[u]) && (o.push(e.call(a, a.__data__, u, s)), i.push(a));
  return new gt(o, i);
}
function zc(e) {
  return function() {
    return this.matches(e);
  };
}
function Bc(e) {
  return function(t) {
    return t.matches(e);
  };
}
var y1 = Array.prototype.find;
function b1(e) {
  return function() {
    return y1.call(this.children, e);
  };
}
function _1() {
  return this.firstElementChild;
}
function w1(e) {
  return this.select(e == null ? _1 : b1(typeof e == "function" ? e : Bc(e)));
}
var E1 = Array.prototype.filter;
function x1() {
  return Array.from(this.children);
}
function k1(e) {
  return function() {
    return E1.call(this.children, e);
  };
}
function S1(e) {
  return this.selectAll(e == null ? x1 : k1(typeof e == "function" ? e : Bc(e)));
}
function C1(e) {
  typeof e != "function" && (e = zc(e));
  for (var t = this._groups, n = t.length, o = new Array(n), i = 0; i < n; ++i)
    for (var r = t[i], s = r.length, l = o[i] = [], a, u = 0; u < s; ++u)
      (a = r[u]) && e.call(a, a.__data__, u, r) && l.push(a);
  return new gt(o, this._parents);
}
function Fc(e) {
  return new Array(e.length);
}
function N1() {
  return new gt(this._enter || this._groups.map(Fc), this._parents);
}
function ki(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
ki.prototype = {
  constructor: ki,
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
function $1(e) {
  return function() {
    return e;
  };
}
function M1(e, t, n, o, i, r) {
  for (var s = 0, l, a = t.length, u = r.length; s < u; ++s)
    (l = t[s]) ? (l.__data__ = r[s], o[s] = l) : n[s] = new ki(e, r[s]);
  for (; s < a; ++s)
    (l = t[s]) && (i[s] = l);
}
function I1(e, t, n, o, i, r, s) {
  var l, a, u = /* @__PURE__ */ new Map(), c = t.length, f = r.length, h = new Array(c), m;
  for (l = 0; l < c; ++l)
    (a = t[l]) && (h[l] = m = s.call(a, a.__data__, l, t) + "", u.has(m) ? i[l] = a : u.set(m, a));
  for (l = 0; l < f; ++l)
    m = s.call(e, r[l], l, r) + "", (a = u.get(m)) ? (o[l] = a, a.__data__ = r[l], u.delete(m)) : n[l] = new ki(e, r[l]);
  for (l = 0; l < c; ++l)
    (a = t[l]) && u.get(h[l]) === a && (i[l] = a);
}
function O1(e) {
  return e.__data__;
}
function T1(e, t) {
  if (!arguments.length)
    return Array.from(this, O1);
  var n = t ? I1 : M1, o = this._parents, i = this._groups;
  typeof e != "function" && (e = $1(e));
  for (var r = i.length, s = new Array(r), l = new Array(r), a = new Array(r), u = 0; u < r; ++u) {
    var c = o[u], f = i[u], h = f.length, m = P1(e.call(c, c && c.__data__, u, o)), C = m.length, N = l[u] = new Array(C), $ = s[u] = new Array(C), I = a[u] = new Array(h);
    n(c, f, N, $, I, m, t);
    for (var A = 0, k = 0, _, B; A < C; ++A)
      if (_ = N[A]) {
        for (A >= k && (k = A + 1); !(B = $[k]) && ++k < C; )
          ;
        _._next = B || null;
      }
  }
  return s = new gt(s, o), s._enter = l, s._exit = a, s;
}
function P1(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function D1() {
  return new gt(this._exit || this._groups.map(Fc), this._parents);
}
function A1(e, t, n) {
  var o = this.enter(), i = this, r = this.exit();
  return typeof e == "function" ? (o = e(o), o && (o = o.selection())) : o = o.append(e + ""), t != null && (i = t(i), i && (i = i.selection())), n == null ? r.remove() : n(r), o && i ? o.merge(i).order() : i;
}
function R1(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, o = t._groups, i = n.length, r = o.length, s = Math.min(i, r), l = new Array(i), a = 0; a < s; ++a)
    for (var u = n[a], c = o[a], f = u.length, h = l[a] = new Array(f), m, C = 0; C < f; ++C)
      (m = u[C] || c[C]) && (h[C] = m);
  for (; a < i; ++a)
    l[a] = n[a];
  return new gt(l, this._parents);
}
function L1() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var o = e[t], i = o.length - 1, r = o[i], s; --i >= 0; )
      (s = o[i]) && (r && s.compareDocumentPosition(r) ^ 4 && r.parentNode.insertBefore(s, r), r = s);
  return this;
}
function V1(e) {
  e || (e = z1);
  function t(f, h) {
    return f && h ? e(f.__data__, h.__data__) : !f - !h;
  }
  for (var n = this._groups, o = n.length, i = new Array(o), r = 0; r < o; ++r) {
    for (var s = n[r], l = s.length, a = i[r] = new Array(l), u, c = 0; c < l; ++c)
      (u = s[c]) && (a[c] = u);
    a.sort(t);
  }
  return new gt(i, this._parents).order();
}
function z1(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function B1() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function F1() {
  return Array.from(this);
}
function H1() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var o = e[t], i = 0, r = o.length; i < r; ++i) {
      var s = o[i];
      if (s)
        return s;
    }
  return null;
}
function j1() {
  let e = 0;
  for (const t of this)
    ++e;
  return e;
}
function U1() {
  return !this.node();
}
function G1(e) {
  for (var t = this._groups, n = 0, o = t.length; n < o; ++n)
    for (var i = t[n], r = 0, s = i.length, l; r < s; ++r)
      (l = i[r]) && e.call(l, l.__data__, r, i);
  return this;
}
function Y1(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function X1(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function W1(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function q1(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function K1(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function Z1(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function J1(e, t) {
  var n = Wi(e);
  if (arguments.length < 2) {
    var o = this.node();
    return n.local ? o.getAttributeNS(n.space, n.local) : o.getAttribute(n);
  }
  return this.each((t == null ? n.local ? X1 : Y1 : typeof t == "function" ? n.local ? Z1 : K1 : n.local ? q1 : W1)(n, t));
}
function Hc(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function Q1(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function eb(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function tb(e, t, n) {
  return function() {
    var o = t.apply(this, arguments);
    o == null ? this.style.removeProperty(e) : this.style.setProperty(e, o, n);
  };
}
function nb(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? Q1 : typeof t == "function" ? tb : eb)(e, t, n ?? "")) : Zn(this.node(), e);
}
function Zn(e, t) {
  return e.style.getPropertyValue(t) || Hc(e).getComputedStyle(e, null).getPropertyValue(t);
}
function ob(e) {
  return function() {
    delete this[e];
  };
}
function ib(e, t) {
  return function() {
    this[e] = t;
  };
}
function rb(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function sb(e, t) {
  return arguments.length > 1 ? this.each((t == null ? ob : typeof t == "function" ? rb : ib)(e, t)) : this.node()[e];
}
function jc(e) {
  return e.trim().split(/^|\s+/);
}
function Vs(e) {
  return e.classList || new Uc(e);
}
function Uc(e) {
  this._node = e, this._names = jc(e.getAttribute("class") || "");
}
Uc.prototype = {
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
function Gc(e, t) {
  for (var n = Vs(e), o = -1, i = t.length; ++o < i; )
    n.add(t[o]);
}
function Yc(e, t) {
  for (var n = Vs(e), o = -1, i = t.length; ++o < i; )
    n.remove(t[o]);
}
function lb(e) {
  return function() {
    Gc(this, e);
  };
}
function ab(e) {
  return function() {
    Yc(this, e);
  };
}
function ub(e, t) {
  return function() {
    (t.apply(this, arguments) ? Gc : Yc)(this, e);
  };
}
function cb(e, t) {
  var n = jc(e + "");
  if (arguments.length < 2) {
    for (var o = Vs(this.node()), i = -1, r = n.length; ++i < r; )
      if (!o.contains(n[i]))
        return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? ub : t ? lb : ab)(n, t));
}
function db() {
  this.textContent = "";
}
function fb(e) {
  return function() {
    this.textContent = e;
  };
}
function hb(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function pb(e) {
  return arguments.length ? this.each(e == null ? db : (typeof e == "function" ? hb : fb)(e)) : this.node().textContent;
}
function vb() {
  this.innerHTML = "";
}
function gb(e) {
  return function() {
    this.innerHTML = e;
  };
}
function mb(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function yb(e) {
  return arguments.length ? this.each(e == null ? vb : (typeof e == "function" ? mb : gb)(e)) : this.node().innerHTML;
}
function bb() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function _b() {
  return this.each(bb);
}
function wb() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Eb() {
  return this.each(wb);
}
function xb(e) {
  var t = typeof e == "function" ? e : Lc(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function kb() {
  return null;
}
function Sb(e, t) {
  var n = typeof e == "function" ? e : Lc(e), o = t == null ? kb : typeof t == "function" ? t : Ls(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), o.apply(this, arguments) || null);
  });
}
function Cb() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function Nb() {
  return this.each(Cb);
}
function $b() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Mb() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Ib(e) {
  return this.select(e ? Mb : $b);
}
function Ob(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function Tb(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function Pb(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", o = t.indexOf(".");
    return o >= 0 && (n = t.slice(o + 1), t = t.slice(0, o)), { type: t, name: n };
  });
}
function Db(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, o = -1, i = t.length, r; n < i; ++n)
        r = t[n], (!e.type || r.type === e.type) && r.name === e.name ? this.removeEventListener(r.type, r.listener, r.options) : t[++o] = r;
      ++o ? t.length = o : delete this.__on;
    }
  };
}
function Ab(e, t, n) {
  return function() {
    var o = this.__on, i, r = Tb(t);
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
function Rb(e, t, n) {
  var o = Pb(e + ""), i, r = o.length, s;
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
  for (l = t ? Ab : Db, i = 0; i < r; ++i)
    this.each(l(o[i], t, n));
  return this;
}
function Xc(e, t, n) {
  var o = Hc(e), i = o.CustomEvent;
  typeof i == "function" ? i = new i(t, n) : (i = o.document.createEvent("Event"), n ? (i.initEvent(t, n.bubbles, n.cancelable), i.detail = n.detail) : i.initEvent(t, !1, !1)), e.dispatchEvent(i);
}
function Lb(e, t) {
  return function() {
    return Xc(this, e, t);
  };
}
function Vb(e, t) {
  return function() {
    return Xc(this, e, t.apply(this, arguments));
  };
}
function zb(e, t) {
  return this.each((typeof t == "function" ? Vb : Lb)(e, t));
}
function* Bb() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var o = e[t], i = 0, r = o.length, s; i < r; ++i)
      (s = o[i]) && (yield s);
}
var Wc = [null];
function gt(e, t) {
  this._groups = e, this._parents = t;
}
function Fo() {
  return new gt([[document.documentElement]], Wc);
}
function Fb() {
  return this;
}
gt.prototype = Fo.prototype = {
  constructor: gt,
  select: h1,
  selectAll: m1,
  selectChild: w1,
  selectChildren: S1,
  filter: C1,
  data: T1,
  enter: N1,
  exit: D1,
  join: A1,
  merge: R1,
  selection: Fb,
  order: L1,
  sort: V1,
  call: B1,
  nodes: F1,
  node: H1,
  size: j1,
  empty: U1,
  each: G1,
  attr: J1,
  style: nb,
  property: sb,
  classed: cb,
  text: pb,
  html: yb,
  raise: _b,
  lower: Eb,
  append: xb,
  insert: Sb,
  remove: Nb,
  clone: Ib,
  datum: Ob,
  on: Rb,
  dispatch: zb,
  [Symbol.iterator]: Bb
};
function wt(e) {
  return typeof e == "string" ? new gt([[document.querySelector(e)]], [document.documentElement]) : new gt([[e]], Wc);
}
function Hb(e) {
  let t;
  for (; t = e.sourceEvent; )
    e = t;
  return e;
}
function Tt(e, t) {
  if (e = Hb(e), t === void 0 && (t = e.currentTarget), t) {
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
const jb = { passive: !1 }, Io = { capture: !0, passive: !1 };
function Er(e) {
  e.stopImmediatePropagation();
}
function Gn(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function qc(e) {
  var t = e.document.documentElement, n = wt(e).on("dragstart.drag", Gn, Io);
  "onselectstart" in t ? n.on("selectstart.drag", Gn, Io) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function Kc(e, t) {
  var n = e.document.documentElement, o = wt(e).on("dragstart.drag", null);
  t && (o.on("click.drag", Gn, Io), setTimeout(function() {
    o.on("click.drag", null);
  }, 0)), "onselectstart" in n ? o.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
const qo = (e) => () => e;
function ts(e, {
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
ts.prototype.on = function() {
  var e = this._.on.apply(this._, arguments);
  return e === this._ ? this : e;
};
function Ub(e) {
  return !e.ctrlKey && !e.button;
}
function Gb() {
  return this.parentNode;
}
function Yb(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function Xb() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function Wb() {
  var e = Ub, t = Gb, n = Yb, o = Xb, i = {}, r = Xi("start", "drag", "end"), s = 0, l, a, u, c, f = 0;
  function h(_) {
    _.on("mousedown.drag", m).filter(o).on("touchstart.drag", $).on("touchmove.drag", I, jb).on("touchend.drag touchcancel.drag", A).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function m(_, B) {
    if (!(c || !e.call(this, _, B))) {
      var M = k(this, t.call(this, _, B), _, B, "mouse");
      M && (wt(_.view).on("mousemove.drag", C, Io).on("mouseup.drag", N, Io), qc(_.view), Er(_), u = !1, l = _.clientX, a = _.clientY, M("start", _));
    }
  }
  function C(_) {
    if (Gn(_), !u) {
      var B = _.clientX - l, M = _.clientY - a;
      u = B * B + M * M > f;
    }
    i.mouse("drag", _);
  }
  function N(_) {
    wt(_.view).on("mousemove.drag mouseup.drag", null), Kc(_.view, u), Gn(_), i.mouse("end", _);
  }
  function $(_, B) {
    if (e.call(this, _, B)) {
      var M = _.changedTouches, E = t.call(this, _, B), Y = M.length, ne, G;
      for (ne = 0; ne < Y; ++ne)
        (G = k(this, E, _, B, M[ne].identifier, M[ne])) && (Er(_), G("start", _, M[ne]));
    }
  }
  function I(_) {
    var B = _.changedTouches, M = B.length, E, Y;
    for (E = 0; E < M; ++E)
      (Y = i[B[E].identifier]) && (Gn(_), Y("drag", _, B[E]));
  }
  function A(_) {
    var B = _.changedTouches, M = B.length, E, Y;
    for (c && clearTimeout(c), c = setTimeout(function() {
      c = null;
    }, 500), E = 0; E < M; ++E)
      (Y = i[B[E].identifier]) && (Er(_), Y("end", _, B[E]));
  }
  function k(_, B, M, E, Y, ne) {
    var G = r.copy(), Z = Tt(ne || M, B), T, R, w;
    if ((w = n.call(_, new ts("beforestart", {
      sourceEvent: M,
      target: h,
      identifier: Y,
      active: s,
      x: Z[0],
      y: Z[1],
      dx: 0,
      dy: 0,
      dispatch: G
    }), E)) != null)
      return T = w.x - Z[0] || 0, R = w.y - Z[1] || 0, function D(P, F, X) {
        var Q = Z, oe;
        switch (P) {
          case "start":
            i[Y] = D, oe = s++;
            break;
          case "end":
            delete i[Y], --s;
          case "drag":
            Z = Tt(X || F, B), oe = s;
            break;
        }
        G.call(
          P,
          _,
          new ts(P, {
            sourceEvent: F,
            subject: w,
            target: h,
            identifier: Y,
            active: oe,
            x: Z[0] + T,
            y: Z[1] + R,
            dx: Z[0] - Q[0],
            dy: Z[1] - Q[1],
            dispatch: G
          }),
          E
        );
      };
  }
  return h.filter = function(_) {
    return arguments.length ? (e = typeof _ == "function" ? _ : qo(!!_), h) : e;
  }, h.container = function(_) {
    return arguments.length ? (t = typeof _ == "function" ? _ : qo(_), h) : t;
  }, h.subject = function(_) {
    return arguments.length ? (n = typeof _ == "function" ? _ : qo(_), h) : n;
  }, h.touchable = function(_) {
    return arguments.length ? (o = typeof _ == "function" ? _ : qo(!!_), h) : o;
  }, h.on = function() {
    var _ = r.on.apply(r, arguments);
    return _ === r ? h : _;
  }, h.clickDistance = function(_) {
    return arguments.length ? (f = (_ = +_) * _, h) : Math.sqrt(f);
  }, h;
}
function zs(e, t, n) {
  e.prototype = t.prototype = n, n.constructor = e;
}
function Zc(e, t) {
  var n = Object.create(e.prototype);
  for (var o in t)
    n[o] = t[o];
  return n;
}
function Ho() {
}
var Oo = 0.7, Si = 1 / Oo, Yn = "\\s*([+-]?\\d+)\\s*", To = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", Rt = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", qb = /^#([0-9a-f]{3,8})$/, Kb = new RegExp(`^rgb\\(${Yn},${Yn},${Yn}\\)$`), Zb = new RegExp(`^rgb\\(${Rt},${Rt},${Rt}\\)$`), Jb = new RegExp(`^rgba\\(${Yn},${Yn},${Yn},${To}\\)$`), Qb = new RegExp(`^rgba\\(${Rt},${Rt},${Rt},${To}\\)$`), e_ = new RegExp(`^hsl\\(${To},${Rt},${Rt}\\)$`), t_ = new RegExp(`^hsla\\(${To},${Rt},${Rt},${To}\\)$`), sa = {
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
zs(Ho, Po, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: la,
  // Deprecated! Use color.formatHex.
  formatHex: la,
  formatHex8: n_,
  formatHsl: o_,
  formatRgb: aa,
  toString: aa
});
function la() {
  return this.rgb().formatHex();
}
function n_() {
  return this.rgb().formatHex8();
}
function o_() {
  return Jc(this).formatHsl();
}
function aa() {
  return this.rgb().formatRgb();
}
function Po(e) {
  var t, n;
  return e = (e + "").trim().toLowerCase(), (t = qb.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? ua(t) : n === 3 ? new dt(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? Ko(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? Ko(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = Kb.exec(e)) ? new dt(t[1], t[2], t[3], 1) : (t = Zb.exec(e)) ? new dt(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = Jb.exec(e)) ? Ko(t[1], t[2], t[3], t[4]) : (t = Qb.exec(e)) ? Ko(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = e_.exec(e)) ? fa(t[1], t[2] / 100, t[3] / 100, 1) : (t = t_.exec(e)) ? fa(t[1], t[2] / 100, t[3] / 100, t[4]) : sa.hasOwnProperty(e) ? ua(sa[e]) : e === "transparent" ? new dt(NaN, NaN, NaN, 0) : null;
}
function ua(e) {
  return new dt(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function Ko(e, t, n, o) {
  return o <= 0 && (e = t = n = NaN), new dt(e, t, n, o);
}
function i_(e) {
  return e instanceof Ho || (e = Po(e)), e ? (e = e.rgb(), new dt(e.r, e.g, e.b, e.opacity)) : new dt();
}
function ns(e, t, n, o) {
  return arguments.length === 1 ? i_(e) : new dt(e, t, n, o ?? 1);
}
function dt(e, t, n, o) {
  this.r = +e, this.g = +t, this.b = +n, this.opacity = +o;
}
zs(dt, ns, Zc(Ho, {
  brighter(e) {
    return e = e == null ? Si : Math.pow(Si, e), new dt(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? Oo : Math.pow(Oo, e), new dt(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new dt(Sn(this.r), Sn(this.g), Sn(this.b), Ci(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: ca,
  // Deprecated! Use color.formatHex.
  formatHex: ca,
  formatHex8: r_,
  formatRgb: da,
  toString: da
}));
function ca() {
  return `#${wn(this.r)}${wn(this.g)}${wn(this.b)}`;
}
function r_() {
  return `#${wn(this.r)}${wn(this.g)}${wn(this.b)}${wn((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function da() {
  const e = Ci(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${Sn(this.r)}, ${Sn(this.g)}, ${Sn(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function Ci(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function Sn(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function wn(e) {
  return e = Sn(e), (e < 16 ? "0" : "") + e.toString(16);
}
function fa(e, t, n, o) {
  return o <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new Et(e, t, n, o);
}
function Jc(e) {
  if (e instanceof Et)
    return new Et(e.h, e.s, e.l, e.opacity);
  if (e instanceof Ho || (e = Po(e)), !e)
    return new Et();
  if (e instanceof Et)
    return e;
  e = e.rgb();
  var t = e.r / 255, n = e.g / 255, o = e.b / 255, i = Math.min(t, n, o), r = Math.max(t, n, o), s = NaN, l = r - i, a = (r + i) / 2;
  return l ? (t === r ? s = (n - o) / l + (n < o) * 6 : n === r ? s = (o - t) / l + 2 : s = (t - n) / l + 4, l /= a < 0.5 ? r + i : 2 - r - i, s *= 60) : l = a > 0 && a < 1 ? 0 : s, new Et(s, l, a, e.opacity);
}
function s_(e, t, n, o) {
  return arguments.length === 1 ? Jc(e) : new Et(e, t, n, o ?? 1);
}
function Et(e, t, n, o) {
  this.h = +e, this.s = +t, this.l = +n, this.opacity = +o;
}
zs(Et, s_, Zc(Ho, {
  brighter(e) {
    return e = e == null ? Si : Math.pow(Si, e), new Et(this.h, this.s, this.l * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? Oo : Math.pow(Oo, e), new Et(this.h, this.s, this.l * e, this.opacity);
  },
  rgb() {
    var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, n = this.l, o = n + (n < 0.5 ? n : 1 - n) * t, i = 2 * n - o;
    return new dt(
      xr(e >= 240 ? e - 240 : e + 120, i, o),
      xr(e, i, o),
      xr(e < 120 ? e + 240 : e - 120, i, o),
      this.opacity
    );
  },
  clamp() {
    return new Et(ha(this.h), Zo(this.s), Zo(this.l), Ci(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = Ci(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${ha(this.h)}, ${Zo(this.s) * 100}%, ${Zo(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function ha(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function Zo(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function xr(e, t, n) {
  return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
const Qc = (e) => () => e;
function l_(e, t) {
  return function(n) {
    return e + n * t;
  };
}
function a_(e, t, n) {
  return e = Math.pow(e, n), t = Math.pow(t, n) - e, n = 1 / n, function(o) {
    return Math.pow(e + o * t, n);
  };
}
function u_(e) {
  return (e = +e) == 1 ? ed : function(t, n) {
    return n - t ? a_(t, n, e) : Qc(isNaN(t) ? n : t);
  };
}
function ed(e, t) {
  var n = t - e;
  return n ? l_(e, n) : Qc(isNaN(e) ? t : e);
}
const pa = function e(t) {
  var n = u_(t);
  function o(i, r) {
    var s = n((i = ns(i)).r, (r = ns(r)).r), l = n(i.g, r.g), a = n(i.b, r.b), u = ed(i.opacity, r.opacity);
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
var os = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, kr = new RegExp(os.source, "g");
function c_(e) {
  return function() {
    return e;
  };
}
function d_(e) {
  return function(t) {
    return e(t) + "";
  };
}
function f_(e, t) {
  var n = os.lastIndex = kr.lastIndex = 0, o, i, r, s = -1, l = [], a = [];
  for (e = e + "", t = t + ""; (o = os.exec(e)) && (i = kr.exec(t)); )
    (r = i.index) > n && (r = t.slice(n, r), l[s] ? l[s] += r : l[++s] = r), (o = o[0]) === (i = i[0]) ? l[s] ? l[s] += i : l[++s] = i : (l[++s] = null, a.push({ i: s, x: nn(o, i) })), n = kr.lastIndex;
  return n < t.length && (r = t.slice(n), l[s] ? l[s] += r : l[++s] = r), l.length < 2 ? a[0] ? d_(a[0].x) : c_(t) : (t = a.length, function(u) {
    for (var c = 0, f; c < t; ++c)
      l[(f = a[c]).i] = f.x(u);
    return l.join("");
  });
}
var va = 180 / Math.PI, is = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function td(e, t, n, o, i, r) {
  var s, l, a;
  return (s = Math.sqrt(e * e + t * t)) && (e /= s, t /= s), (a = e * n + t * o) && (n -= e * a, o -= t * a), (l = Math.sqrt(n * n + o * o)) && (n /= l, o /= l, a /= l), e * o < t * n && (e = -e, t = -t, a = -a, s = -s), {
    translateX: i,
    translateY: r,
    rotate: Math.atan2(t, e) * va,
    skewX: Math.atan(a) * va,
    scaleX: s,
    scaleY: l
  };
}
var Jo;
function h_(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? is : td(t.a, t.b, t.c, t.d, t.e, t.f);
}
function p_(e) {
  return e == null || (Jo || (Jo = document.createElementNS("http://www.w3.org/2000/svg", "g")), Jo.setAttribute("transform", e), !(e = Jo.transform.baseVal.consolidate())) ? is : (e = e.matrix, td(e.a, e.b, e.c, e.d, e.e, e.f));
}
function nd(e, t, n, o) {
  function i(u) {
    return u.length ? u.pop() + " " : "";
  }
  function r(u, c, f, h, m, C) {
    if (u !== f || c !== h) {
      var N = m.push("translate(", null, t, null, n);
      C.push({ i: N - 4, x: nn(u, f) }, { i: N - 2, x: nn(c, h) });
    } else (f || h) && m.push("translate(" + f + t + h + n);
  }
  function s(u, c, f, h) {
    u !== c ? (u - c > 180 ? c += 360 : c - u > 180 && (u += 360), h.push({ i: f.push(i(f) + "rotate(", null, o) - 2, x: nn(u, c) })) : c && f.push(i(f) + "rotate(" + c + o);
  }
  function l(u, c, f, h) {
    u !== c ? h.push({ i: f.push(i(f) + "skewX(", null, o) - 2, x: nn(u, c) }) : c && f.push(i(f) + "skewX(" + c + o);
  }
  function a(u, c, f, h, m, C) {
    if (u !== f || c !== h) {
      var N = m.push(i(m) + "scale(", null, ",", null, ")");
      C.push({ i: N - 4, x: nn(u, f) }, { i: N - 2, x: nn(c, h) });
    } else (f !== 1 || h !== 1) && m.push(i(m) + "scale(" + f + "," + h + ")");
  }
  return function(u, c) {
    var f = [], h = [];
    return u = e(u), c = e(c), r(u.translateX, u.translateY, c.translateX, c.translateY, f, h), s(u.rotate, c.rotate, f, h), l(u.skewX, c.skewX, f, h), a(u.scaleX, u.scaleY, c.scaleX, c.scaleY, f, h), u = c = null, function(m) {
      for (var C = -1, N = h.length, $; ++C < N; )
        f[($ = h[C]).i] = $.x(m);
      return f.join("");
    };
  };
}
var v_ = nd(h_, "px, ", "px)", "deg)"), g_ = nd(p_, ", ", ")", ")"), m_ = 1e-12;
function ga(e) {
  return ((e = Math.exp(e)) + 1 / e) / 2;
}
function y_(e) {
  return ((e = Math.exp(e)) - 1 / e) / 2;
}
function b_(e) {
  return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const __ = function e(t, n, o) {
  function i(r, s) {
    var l = r[0], a = r[1], u = r[2], c = s[0], f = s[1], h = s[2], m = c - l, C = f - a, N = m * m + C * C, $, I;
    if (N < m_)
      I = Math.log(h / u) / t, $ = function(E) {
        return [
          l + E * m,
          a + E * C,
          u * Math.exp(t * E * I)
        ];
      };
    else {
      var A = Math.sqrt(N), k = (h * h - u * u + o * N) / (2 * u * n * A), _ = (h * h - u * u - o * N) / (2 * h * n * A), B = Math.log(Math.sqrt(k * k + 1) - k), M = Math.log(Math.sqrt(_ * _ + 1) - _);
      I = (M - B) / t, $ = function(E) {
        var Y = E * I, ne = ga(B), G = u / (n * A) * (ne * b_(t * Y + B) - y_(B));
        return [
          l + G * m,
          a + G * C,
          u * ne / ga(t * Y + B)
        ];
      };
    }
    return $.duration = I * 1e3 * t / Math.SQRT2, $;
  }
  return i.rho = function(r) {
    var s = Math.max(1e-3, +r), l = s * s, a = l * l;
    return e(s, l, a);
  }, i;
}(Math.SQRT2, 2, 4);
var Jn = 0, fo = 0, so = 0, od = 1e3, Ni, ho, $i = 0, In = 0, qi = 0, Do = typeof performance == "object" && performance.now ? performance : Date, id = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function Bs() {
  return In || (id(w_), In = Do.now() + qi);
}
function w_() {
  In = 0;
}
function Mi() {
  this._call = this._time = this._next = null;
}
Mi.prototype = rd.prototype = {
  constructor: Mi,
  restart: function(e, t, n) {
    if (typeof e != "function")
      throw new TypeError("callback is not a function");
    n = (n == null ? Bs() : +n) + (t == null ? 0 : +t), !this._next && ho !== this && (ho ? ho._next = this : Ni = this, ho = this), this._call = e, this._time = n, rs();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, rs());
  }
};
function rd(e, t, n) {
  var o = new Mi();
  return o.restart(e, t, n), o;
}
function E_() {
  Bs(), ++Jn;
  for (var e = Ni, t; e; )
    (t = In - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --Jn;
}
function ma() {
  In = ($i = Do.now()) + qi, Jn = fo = 0;
  try {
    E_();
  } finally {
    Jn = 0, k_(), In = 0;
  }
}
function x_() {
  var e = Do.now(), t = e - $i;
  t > od && (qi -= t, $i = e);
}
function k_() {
  for (var e, t = Ni, n, o = 1 / 0; t; )
    t._call ? (o > t._time && (o = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : Ni = n);
  ho = e, rs(o);
}
function rs(e) {
  if (!Jn) {
    fo && (fo = clearTimeout(fo));
    var t = e - In;
    t > 24 ? (e < 1 / 0 && (fo = setTimeout(ma, e - Do.now() - qi)), so && (so = clearInterval(so))) : (so || ($i = Do.now(), so = setInterval(x_, od)), Jn = 1, id(ma));
  }
}
function ya(e, t, n) {
  var o = new Mi();
  return t = t == null ? 0 : +t, o.restart((i) => {
    o.stop(), e(i + t);
  }, t, n), o;
}
var S_ = Xi("start", "end", "cancel", "interrupt"), C_ = [], sd = 0, ba = 1, ss = 2, di = 3, _a = 4, ls = 5, fi = 6;
function Ki(e, t, n, o, i, r) {
  var s = e.__transition;
  if (!s)
    e.__transition = {};
  else if (n in s)
    return;
  N_(e, n, {
    name: t,
    index: o,
    // For context during callback.
    group: i,
    // For context during callback.
    on: S_,
    tween: C_,
    time: r.time,
    delay: r.delay,
    duration: r.duration,
    ease: r.ease,
    timer: null,
    state: sd
  });
}
function Fs(e, t) {
  var n = Ct(e, t);
  if (n.state > sd)
    throw new Error("too late; already scheduled");
  return n;
}
function Vt(e, t) {
  var n = Ct(e, t);
  if (n.state > di)
    throw new Error("too late; already running");
  return n;
}
function Ct(e, t) {
  var n = e.__transition;
  if (!n || !(n = n[t]))
    throw new Error("transition not found");
  return n;
}
function N_(e, t, n) {
  var o = e.__transition, i;
  o[t] = n, n.timer = rd(r, 0, n.time);
  function r(u) {
    n.state = ba, n.timer.restart(s, n.delay, n.time), n.delay <= u && s(u - n.delay);
  }
  function s(u) {
    var c, f, h, m;
    if (n.state !== ba)
      return a();
    for (c in o)
      if (m = o[c], m.name === n.name) {
        if (m.state === di)
          return ya(s);
        m.state === _a ? (m.state = fi, m.timer.stop(), m.on.call("interrupt", e, e.__data__, m.index, m.group), delete o[c]) : +c < t && (m.state = fi, m.timer.stop(), m.on.call("cancel", e, e.__data__, m.index, m.group), delete o[c]);
      }
    if (ya(function() {
      n.state === di && (n.state = _a, n.timer.restart(l, n.delay, n.time), l(u));
    }), n.state = ss, n.on.call("start", e, e.__data__, n.index, n.group), n.state === ss) {
      for (n.state = di, i = new Array(h = n.tween.length), c = 0, f = -1; c < h; ++c)
        (m = n.tween[c].value.call(e, e.__data__, n.index, n.group)) && (i[++f] = m);
      i.length = f + 1;
    }
  }
  function l(u) {
    for (var c = u < n.duration ? n.ease.call(null, u / n.duration) : (n.timer.restart(a), n.state = ls, 1), f = -1, h = i.length; ++f < h; )
      i[f].call(e, c);
    n.state === ls && (n.on.call("end", e, e.__data__, n.index, n.group), a());
  }
  function a() {
    n.state = fi, n.timer.stop(), delete o[t];
    for (var u in o)
      return;
    delete e.__transition;
  }
}
function hi(e, t) {
  var n = e.__transition, o, i, r = !0, s;
  if (n) {
    t = t == null ? null : t + "";
    for (s in n) {
      if ((o = n[s]).name !== t) {
        r = !1;
        continue;
      }
      i = o.state > ss && o.state < ls, o.state = fi, o.timer.stop(), o.on.call(i ? "interrupt" : "cancel", e, e.__data__, o.index, o.group), delete n[s];
    }
    r && delete e.__transition;
  }
}
function $_(e) {
  return this.each(function() {
    hi(this, e);
  });
}
function M_(e, t) {
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
function I_(e, t, n) {
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
function O_(e, t) {
  var n = this._id;
  if (e += "", arguments.length < 2) {
    for (var o = Ct(this.node(), n).tween, i = 0, r = o.length, s; i < r; ++i)
      if ((s = o[i]).name === e)
        return s.value;
    return null;
  }
  return this.each((t == null ? M_ : I_)(n, e, t));
}
function Hs(e, t, n) {
  var o = e._id;
  return e.each(function() {
    var i = Vt(this, o);
    (i.value || (i.value = {}))[t] = n.apply(this, arguments);
  }), function(i) {
    return Ct(i, o).value[t];
  };
}
function ld(e, t) {
  var n;
  return (typeof t == "number" ? nn : t instanceof Po ? pa : (n = Po(t)) ? (t = n, pa) : f_)(e, t);
}
function T_(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function P_(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function D_(e, t, n) {
  var o, i = n + "", r;
  return function() {
    var s = this.getAttribute(e);
    return s === i ? null : s === o ? r : r = t(o = s, n);
  };
}
function A_(e, t, n) {
  var o, i = n + "", r;
  return function() {
    var s = this.getAttributeNS(e.space, e.local);
    return s === i ? null : s === o ? r : r = t(o = s, n);
  };
}
function R_(e, t, n) {
  var o, i, r;
  return function() {
    var s, l = n(this), a;
    return l == null ? void this.removeAttribute(e) : (s = this.getAttribute(e), a = l + "", s === a ? null : s === o && a === i ? r : (i = a, r = t(o = s, l)));
  };
}
function L_(e, t, n) {
  var o, i, r;
  return function() {
    var s, l = n(this), a;
    return l == null ? void this.removeAttributeNS(e.space, e.local) : (s = this.getAttributeNS(e.space, e.local), a = l + "", s === a ? null : s === o && a === i ? r : (i = a, r = t(o = s, l)));
  };
}
function V_(e, t) {
  var n = Wi(e), o = n === "transform" ? g_ : ld;
  return this.attrTween(e, typeof t == "function" ? (n.local ? L_ : R_)(n, o, Hs(this, "attr." + e, t)) : t == null ? (n.local ? P_ : T_)(n) : (n.local ? A_ : D_)(n, o, t));
}
function z_(e, t) {
  return function(n) {
    this.setAttribute(e, t.call(this, n));
  };
}
function B_(e, t) {
  return function(n) {
    this.setAttributeNS(e.space, e.local, t.call(this, n));
  };
}
function F_(e, t) {
  var n, o;
  function i() {
    var r = t.apply(this, arguments);
    return r !== o && (n = (o = r) && B_(e, r)), n;
  }
  return i._value = t, i;
}
function H_(e, t) {
  var n, o;
  function i() {
    var r = t.apply(this, arguments);
    return r !== o && (n = (o = r) && z_(e, r)), n;
  }
  return i._value = t, i;
}
function j_(e, t) {
  var n = "attr." + e;
  if (arguments.length < 2)
    return (n = this.tween(n)) && n._value;
  if (t == null)
    return this.tween(n, null);
  if (typeof t != "function")
    throw new Error();
  var o = Wi(e);
  return this.tween(n, (o.local ? F_ : H_)(o, t));
}
function U_(e, t) {
  return function() {
    Fs(this, e).delay = +t.apply(this, arguments);
  };
}
function G_(e, t) {
  return t = +t, function() {
    Fs(this, e).delay = t;
  };
}
function Y_(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? U_ : G_)(t, e)) : Ct(this.node(), t).delay;
}
function X_(e, t) {
  return function() {
    Vt(this, e).duration = +t.apply(this, arguments);
  };
}
function W_(e, t) {
  return t = +t, function() {
    Vt(this, e).duration = t;
  };
}
function q_(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? X_ : W_)(t, e)) : Ct(this.node(), t).duration;
}
function K_(e, t) {
  if (typeof t != "function")
    throw new Error();
  return function() {
    Vt(this, e).ease = t;
  };
}
function Z_(e) {
  var t = this._id;
  return arguments.length ? this.each(K_(t, e)) : Ct(this.node(), t).ease;
}
function J_(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    if (typeof n != "function")
      throw new Error();
    Vt(this, e).ease = n;
  };
}
function Q_(e) {
  if (typeof e != "function")
    throw new Error();
  return this.each(J_(this._id, e));
}
function ew(e) {
  typeof e != "function" && (e = zc(e));
  for (var t = this._groups, n = t.length, o = new Array(n), i = 0; i < n; ++i)
    for (var r = t[i], s = r.length, l = o[i] = [], a, u = 0; u < s; ++u)
      (a = r[u]) && e.call(a, a.__data__, u, r) && l.push(a);
  return new Kt(o, this._parents, this._name, this._id);
}
function tw(e) {
  if (e._id !== this._id)
    throw new Error();
  for (var t = this._groups, n = e._groups, o = t.length, i = n.length, r = Math.min(o, i), s = new Array(o), l = 0; l < r; ++l)
    for (var a = t[l], u = n[l], c = a.length, f = s[l] = new Array(c), h, m = 0; m < c; ++m)
      (h = a[m] || u[m]) && (f[m] = h);
  for (; l < o; ++l)
    s[l] = t[l];
  return new Kt(s, this._parents, this._name, this._id);
}
function nw(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var n = t.indexOf(".");
    return n >= 0 && (t = t.slice(0, n)), !t || t === "start";
  });
}
function ow(e, t, n) {
  var o, i, r = nw(t) ? Fs : Vt;
  return function() {
    var s = r(this, e), l = s.on;
    l !== o && (i = (o = l).copy()).on(t, n), s.on = i;
  };
}
function iw(e, t) {
  var n = this._id;
  return arguments.length < 2 ? Ct(this.node(), n).on.on(e) : this.each(ow(n, e, t));
}
function rw(e) {
  return function() {
    var t = this.parentNode;
    for (var n in this.__transition)
      if (+n !== e)
        return;
    t && t.removeChild(this);
  };
}
function sw() {
  return this.on("end.remove", rw(this._id));
}
function lw(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = Ls(e));
  for (var o = this._groups, i = o.length, r = new Array(i), s = 0; s < i; ++s)
    for (var l = o[s], a = l.length, u = r[s] = new Array(a), c, f, h = 0; h < a; ++h)
      (c = l[h]) && (f = e.call(c, c.__data__, h, l)) && ("__data__" in c && (f.__data__ = c.__data__), u[h] = f, Ki(u[h], t, n, h, u, Ct(c, n)));
  return new Kt(r, this._parents, t, n);
}
function aw(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = Vc(e));
  for (var o = this._groups, i = o.length, r = [], s = [], l = 0; l < i; ++l)
    for (var a = o[l], u = a.length, c, f = 0; f < u; ++f)
      if (c = a[f]) {
        for (var h = e.call(c, c.__data__, f, a), m, C = Ct(c, n), N = 0, $ = h.length; N < $; ++N)
          (m = h[N]) && Ki(m, t, n, N, h, C);
        r.push(h), s.push(c);
      }
  return new Kt(r, s, t, n);
}
var uw = Fo.prototype.constructor;
function cw() {
  return new uw(this._groups, this._parents);
}
function dw(e, t) {
  var n, o, i;
  return function() {
    var r = Zn(this, e), s = (this.style.removeProperty(e), Zn(this, e));
    return r === s ? null : r === n && s === o ? i : i = t(n = r, o = s);
  };
}
function ad(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function fw(e, t, n) {
  var o, i = n + "", r;
  return function() {
    var s = Zn(this, e);
    return s === i ? null : s === o ? r : r = t(o = s, n);
  };
}
function hw(e, t, n) {
  var o, i, r;
  return function() {
    var s = Zn(this, e), l = n(this), a = l + "";
    return l == null && (a = l = (this.style.removeProperty(e), Zn(this, e))), s === a ? null : s === o && a === i ? r : (i = a, r = t(o = s, l));
  };
}
function pw(e, t) {
  var n, o, i, r = "style." + t, s = "end." + r, l;
  return function() {
    var a = Vt(this, e), u = a.on, c = a.value[r] == null ? l || (l = ad(t)) : void 0;
    (u !== n || i !== c) && (o = (n = u).copy()).on(s, i = c), a.on = o;
  };
}
function vw(e, t, n) {
  var o = (e += "") == "transform" ? v_ : ld;
  return t == null ? this.styleTween(e, dw(e, o)).on("end.style." + e, ad(e)) : typeof t == "function" ? this.styleTween(e, hw(e, o, Hs(this, "style." + e, t))).each(pw(this._id, e)) : this.styleTween(e, fw(e, o, t), n).on("end.style." + e, null);
}
function gw(e, t, n) {
  return function(o) {
    this.style.setProperty(e, t.call(this, o), n);
  };
}
function mw(e, t, n) {
  var o, i;
  function r() {
    var s = t.apply(this, arguments);
    return s !== i && (o = (i = s) && gw(e, s, n)), o;
  }
  return r._value = t, r;
}
function yw(e, t, n) {
  var o = "style." + (e += "");
  if (arguments.length < 2)
    return (o = this.tween(o)) && o._value;
  if (t == null)
    return this.tween(o, null);
  if (typeof t != "function")
    throw new Error();
  return this.tween(o, mw(e, t, n ?? ""));
}
function bw(e) {
  return function() {
    this.textContent = e;
  };
}
function _w(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function ww(e) {
  return this.tween("text", typeof e == "function" ? _w(Hs(this, "text", e)) : bw(e == null ? "" : e + ""));
}
function Ew(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function xw(e) {
  var t, n;
  function o() {
    var i = e.apply(this, arguments);
    return i !== n && (t = (n = i) && Ew(i)), t;
  }
  return o._value = e, o;
}
function kw(e) {
  var t = "text";
  if (arguments.length < 1)
    return (t = this.tween(t)) && t._value;
  if (e == null)
    return this.tween(t, null);
  if (typeof e != "function")
    throw new Error();
  return this.tween(t, xw(e));
}
function Sw() {
  for (var e = this._name, t = this._id, n = ud(), o = this._groups, i = o.length, r = 0; r < i; ++r)
    for (var s = o[r], l = s.length, a, u = 0; u < l; ++u)
      if (a = s[u]) {
        var c = Ct(a, t);
        Ki(a, e, n, u, s, {
          time: c.time + c.delay + c.duration,
          delay: 0,
          duration: c.duration,
          ease: c.ease
        });
      }
  return new Kt(o, this._parents, e, n);
}
function Cw() {
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
var Nw = 0;
function Kt(e, t, n, o) {
  this._groups = e, this._parents = t, this._name = n, this._id = o;
}
function ud() {
  return ++Nw;
}
var Bt = Fo.prototype;
Kt.prototype = {
  constructor: Kt,
  select: lw,
  selectAll: aw,
  selectChild: Bt.selectChild,
  selectChildren: Bt.selectChildren,
  filter: ew,
  merge: tw,
  selection: cw,
  transition: Sw,
  call: Bt.call,
  nodes: Bt.nodes,
  node: Bt.node,
  size: Bt.size,
  empty: Bt.empty,
  each: Bt.each,
  on: iw,
  attr: V_,
  attrTween: j_,
  style: vw,
  styleTween: yw,
  text: ww,
  textTween: kw,
  remove: sw,
  tween: O_,
  delay: Y_,
  duration: q_,
  ease: Z_,
  easeVarying: Q_,
  end: Cw,
  [Symbol.iterator]: Bt[Symbol.iterator]
};
function $w(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var Mw = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: $w
};
function Iw(e, t) {
  for (var n; !(n = e.__transition) || !(n = n[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return n;
}
function Ow(e) {
  var t, n;
  e instanceof Kt ? (t = e._id, e = e._name) : (t = ud(), (n = Mw).time = Bs(), e = e == null ? null : e + "");
  for (var o = this._groups, i = o.length, r = 0; r < i; ++r)
    for (var s = o[r], l = s.length, a, u = 0; u < l; ++u)
      (a = s[u]) && Ki(a, e, t, u, s, n || Iw(a, t));
  return new Kt(o, this._parents, e, t);
}
Fo.prototype.interrupt = $_;
Fo.prototype.transition = Ow;
const Qo = (e) => () => e;
function Tw(e, {
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
var Qn = new Yt(1, 0, 0);
Yt.prototype;
function Sr(e) {
  e.stopImmediatePropagation();
}
function lo(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function Pw(e) {
  return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function Dw() {
  var e = this;
  return e instanceof SVGElement ? (e = e.ownerSVGElement || e, e.hasAttribute("viewBox") ? (e = e.viewBox.baseVal, [[e.x, e.y], [e.x + e.width, e.y + e.height]]) : [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]) : [[0, 0], [e.clientWidth, e.clientHeight]];
}
function wa() {
  return this.__zoom || Qn;
}
function Aw(e) {
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * (e.ctrlKey ? 10 : 1);
}
function Rw() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function Lw(e, t, n) {
  var o = e.invertX(t[0][0]) - n[0][0], i = e.invertX(t[1][0]) - n[1][0], r = e.invertY(t[0][1]) - n[0][1], s = e.invertY(t[1][1]) - n[1][1];
  return e.translate(
    i > o ? (o + i) / 2 : Math.min(0, o) || Math.max(0, i),
    s > r ? (r + s) / 2 : Math.min(0, r) || Math.max(0, s)
  );
}
function Vw() {
  var e = Pw, t = Dw, n = Lw, o = Aw, i = Rw, r = [0, 1 / 0], s = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], l = 250, a = __, u = Xi("start", "zoom", "end"), c, f, h, m = 500, C = 150, N = 0, $ = 10;
  function I(w) {
    w.property("__zoom", wa).on("wheel.zoom", Y, { passive: !1 }).on("mousedown.zoom", ne).on("dblclick.zoom", G).filter(i).on("touchstart.zoom", Z).on("touchmove.zoom", T).on("touchend.zoom touchcancel.zoom", R).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  I.transform = function(w, D, P, F) {
    var X = w.selection ? w.selection() : w;
    X.property("__zoom", wa), w !== X ? B(w, D, P, F) : X.interrupt().each(function() {
      M(this, arguments).event(F).start().zoom(null, typeof D == "function" ? D.apply(this, arguments) : D).end();
    });
  }, I.scaleBy = function(w, D, P, F) {
    I.scaleTo(w, function() {
      var X = this.__zoom.k, Q = typeof D == "function" ? D.apply(this, arguments) : D;
      return X * Q;
    }, P, F);
  }, I.scaleTo = function(w, D, P, F) {
    I.transform(w, function() {
      var X = t.apply(this, arguments), Q = this.__zoom, oe = P == null ? _(X) : typeof P == "function" ? P.apply(this, arguments) : P, ue = Q.invert(oe), ee = typeof D == "function" ? D.apply(this, arguments) : D;
      return n(k(A(Q, ee), oe, ue), X, s);
    }, P, F);
  }, I.translateBy = function(w, D, P, F) {
    I.transform(w, function() {
      return n(this.__zoom.translate(
        typeof D == "function" ? D.apply(this, arguments) : D,
        typeof P == "function" ? P.apply(this, arguments) : P
      ), t.apply(this, arguments), s);
    }, null, F);
  }, I.translateTo = function(w, D, P, F, X) {
    I.transform(w, function() {
      var Q = t.apply(this, arguments), oe = this.__zoom, ue = F == null ? _(Q) : typeof F == "function" ? F.apply(this, arguments) : F;
      return n(Qn.translate(ue[0], ue[1]).scale(oe.k).translate(
        typeof D == "function" ? -D.apply(this, arguments) : -D,
        typeof P == "function" ? -P.apply(this, arguments) : -P
      ), Q, s);
    }, F, X);
  };
  function A(w, D) {
    return D = Math.max(r[0], Math.min(r[1], D)), D === w.k ? w : new Yt(D, w.x, w.y);
  }
  function k(w, D, P) {
    var F = D[0] - P[0] * w.k, X = D[1] - P[1] * w.k;
    return F === w.x && X === w.y ? w : new Yt(w.k, F, X);
  }
  function _(w) {
    return [(+w[0][0] + +w[1][0]) / 2, (+w[0][1] + +w[1][1]) / 2];
  }
  function B(w, D, P, F) {
    w.on("start.zoom", function() {
      M(this, arguments).event(F).start();
    }).on("interrupt.zoom end.zoom", function() {
      M(this, arguments).event(F).end();
    }).tween("zoom", function() {
      var X = this, Q = arguments, oe = M(X, Q).event(F), ue = t.apply(X, Q), ee = P == null ? _(ue) : typeof P == "function" ? P.apply(X, Q) : P, le = Math.max(ue[1][0] - ue[0][0], ue[1][1] - ue[0][1]), j = X.__zoom, ge = typeof D == "function" ? D.apply(X, Q) : D, _e = a(j.invert(ee).concat(le / j.k), ge.invert(ee).concat(le / ge.k));
      return function(ye) {
        if (ye === 1)
          ye = ge;
        else {
          var we = _e(ye), fe = le / we[2];
          ye = new Yt(fe, ee[0] - we[0] * fe, ee[1] - we[1] * fe);
        }
        oe.zoom(null, ye);
      };
    });
  }
  function M(w, D, P) {
    return !P && w.__zooming || new E(w, D);
  }
  function E(w, D) {
    this.that = w, this.args = D, this.active = 0, this.sourceEvent = null, this.extent = t.apply(w, D), this.taps = 0;
  }
  E.prototype = {
    event: function(w) {
      return w && (this.sourceEvent = w), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(w, D) {
      return this.mouse && w !== "mouse" && (this.mouse[1] = D.invert(this.mouse[0])), this.touch0 && w !== "touch" && (this.touch0[1] = D.invert(this.touch0[0])), this.touch1 && w !== "touch" && (this.touch1[1] = D.invert(this.touch1[0])), this.that.__zoom = D, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(w) {
      var D = wt(this.that).datum();
      u.call(
        w,
        this.that,
        new Tw(w, {
          sourceEvent: this.sourceEvent,
          target: I,
          transform: this.that.__zoom,
          dispatch: u
        }),
        D
      );
    }
  };
  function Y(w, ...D) {
    if (!e.apply(this, arguments))
      return;
    var P = M(this, D).event(w), F = this.__zoom, X = Math.max(r[0], Math.min(r[1], F.k * Math.pow(2, o.apply(this, arguments)))), Q = Tt(w);
    if (P.wheel)
      (P.mouse[0][0] !== Q[0] || P.mouse[0][1] !== Q[1]) && (P.mouse[1] = F.invert(P.mouse[0] = Q)), clearTimeout(P.wheel);
    else {
      if (F.k === X)
        return;
      P.mouse = [Q, F.invert(Q)], hi(this), P.start();
    }
    lo(w), P.wheel = setTimeout(oe, C), P.zoom("mouse", n(k(A(F, X), P.mouse[0], P.mouse[1]), P.extent, s));
    function oe() {
      P.wheel = null, P.end();
    }
  }
  function ne(w, ...D) {
    if (h || !e.apply(this, arguments))
      return;
    var P = w.currentTarget, F = M(this, D, !0).event(w), X = wt(w.view).on("mousemove.zoom", ee, !0).on("mouseup.zoom", le, !0), Q = Tt(w, P), oe = w.clientX, ue = w.clientY;
    qc(w.view), Sr(w), F.mouse = [Q, this.__zoom.invert(Q)], hi(this), F.start();
    function ee(j) {
      if (lo(j), !F.moved) {
        var ge = j.clientX - oe, _e = j.clientY - ue;
        F.moved = ge * ge + _e * _e > N;
      }
      F.event(j).zoom("mouse", n(k(F.that.__zoom, F.mouse[0] = Tt(j, P), F.mouse[1]), F.extent, s));
    }
    function le(j) {
      X.on("mousemove.zoom mouseup.zoom", null), Kc(j.view, F.moved), lo(j), F.event(j).end();
    }
  }
  function G(w, ...D) {
    if (e.apply(this, arguments)) {
      var P = this.__zoom, F = Tt(w.changedTouches ? w.changedTouches[0] : w, this), X = P.invert(F), Q = P.k * (w.shiftKey ? 0.5 : 2), oe = n(k(A(P, Q), F, X), t.apply(this, D), s);
      lo(w), l > 0 ? wt(this).transition().duration(l).call(B, oe, F, w) : wt(this).call(I.transform, oe, F, w);
    }
  }
  function Z(w, ...D) {
    if (e.apply(this, arguments)) {
      var P = w.touches, F = P.length, X = M(this, D, w.changedTouches.length === F).event(w), Q, oe, ue, ee;
      for (Sr(w), oe = 0; oe < F; ++oe)
        ue = P[oe], ee = Tt(ue, this), ee = [ee, this.__zoom.invert(ee), ue.identifier], X.touch0 ? !X.touch1 && X.touch0[2] !== ee[2] && (X.touch1 = ee, X.taps = 0) : (X.touch0 = ee, Q = !0, X.taps = 1 + !!c);
      c && (c = clearTimeout(c)), Q && (X.taps < 2 && (f = ee[0], c = setTimeout(function() {
        c = null;
      }, m)), hi(this), X.start());
    }
  }
  function T(w, ...D) {
    if (this.__zooming) {
      var P = M(this, D).event(w), F = w.changedTouches, X = F.length, Q, oe, ue, ee;
      for (lo(w), Q = 0; Q < X; ++Q)
        oe = F[Q], ue = Tt(oe, this), P.touch0 && P.touch0[2] === oe.identifier ? P.touch0[0] = ue : P.touch1 && P.touch1[2] === oe.identifier && (P.touch1[0] = ue);
      if (oe = P.that.__zoom, P.touch1) {
        var le = P.touch0[0], j = P.touch0[1], ge = P.touch1[0], _e = P.touch1[1], ye = (ye = ge[0] - le[0]) * ye + (ye = ge[1] - le[1]) * ye, we = (we = _e[0] - j[0]) * we + (we = _e[1] - j[1]) * we;
        oe = A(oe, Math.sqrt(ye / we)), ue = [(le[0] + ge[0]) / 2, (le[1] + ge[1]) / 2], ee = [(j[0] + _e[0]) / 2, (j[1] + _e[1]) / 2];
      } else if (P.touch0)
        ue = P.touch0[0], ee = P.touch0[1];
      else
        return;
      P.zoom("touch", n(k(oe, ue, ee), P.extent, s));
    }
  }
  function R(w, ...D) {
    if (this.__zooming) {
      var P = M(this, D).event(w), F = w.changedTouches, X = F.length, Q, oe;
      for (Sr(w), h && clearTimeout(h), h = setTimeout(function() {
        h = null;
      }, m), Q = 0; Q < X; ++Q)
        oe = F[Q], P.touch0 && P.touch0[2] === oe.identifier ? delete P.touch0 : P.touch1 && P.touch1[2] === oe.identifier && delete P.touch1;
      if (P.touch1 && !P.touch0 && (P.touch0 = P.touch1, delete P.touch1), P.touch0)
        P.touch0[1] = this.__zoom.invert(P.touch0[0]);
      else if (P.end(), P.taps === 2 && (oe = Tt(oe, this), Math.hypot(f[0] - oe[0], f[1] - oe[1]) < $)) {
        var ue = wt(this).on("dblclick.zoom");
        ue && ue.apply(this, arguments);
      }
    }
  }
  return I.wheelDelta = function(w) {
    return arguments.length ? (o = typeof w == "function" ? w : Qo(+w), I) : o;
  }, I.filter = function(w) {
    return arguments.length ? (e = typeof w == "function" ? w : Qo(!!w), I) : e;
  }, I.touchable = function(w) {
    return arguments.length ? (i = typeof w == "function" ? w : Qo(!!w), I) : i;
  }, I.extent = function(w) {
    return arguments.length ? (t = typeof w == "function" ? w : Qo([[+w[0][0], +w[0][1]], [+w[1][0], +w[1][1]]]), I) : t;
  }, I.scaleExtent = function(w) {
    return arguments.length ? (r[0] = +w[0], r[1] = +w[1], I) : [r[0], r[1]];
  }, I.translateExtent = function(w) {
    return arguments.length ? (s[0][0] = +w[0][0], s[1][0] = +w[1][0], s[0][1] = +w[0][1], s[1][1] = +w[1][1], I) : [[s[0][0], s[0][1]], [s[1][0], s[1][1]]];
  }, I.constrain = function(w) {
    return arguments.length ? (n = w, I) : n;
  }, I.duration = function(w) {
    return arguments.length ? (l = +w, I) : l;
  }, I.interpolate = function(w) {
    return arguments.length ? (a = w, I) : a;
  }, I.on = function() {
    var w = u.on.apply(u, arguments);
    return w === u ? I : w;
  }, I.clickDistance = function(w) {
    return arguments.length ? (N = (w = +w) * w, I) : Math.sqrt(N);
  }, I.tapDistance = function(w) {
    return arguments.length ? ($ = +w, I) : $;
  }, I;
}
var de = /* @__PURE__ */ ((e) => (e.Left = "left", e.Top = "top", e.Right = "right", e.Bottom = "bottom", e))(de || {}), js = /* @__PURE__ */ ((e) => (e.Partial = "partial", e.Full = "full", e))(js || {}), bn = /* @__PURE__ */ ((e) => (e.Bezier = "default", e.SimpleBezier = "simple-bezier", e.Straight = "straight", e.Step = "step", e.SmoothStep = "smoothstep", e))(bn || {}), On = /* @__PURE__ */ ((e) => (e.Strict = "strict", e.Loose = "loose", e))(On || {}), as = /* @__PURE__ */ ((e) => (e.Arrow = "arrow", e.ArrowClosed = "arrowclosed", e))(as || {}), wo = /* @__PURE__ */ ((e) => (e.Free = "free", e.Vertical = "vertical", e.Horizontal = "horizontal", e))(wo || {});
function us(e) {
  var t, n;
  const o = ((n = (t = e.composedPath) == null ? void 0 : t.call(e)) == null ? void 0 : n[0]) || e.target, i = typeof (o == null ? void 0 : o.hasAttribute) == "function" ? o.hasAttribute("contenteditable") : !1, r = typeof (o == null ? void 0 : o.closest) == "function" ? o.closest(".nokey") : null;
  return ["INPUT", "SELECT", "TEXTAREA"].includes(o == null ? void 0 : o.nodeName) || i || !!r;
}
function zw(e) {
  return e.ctrlKey || e.metaKey || e.shiftKey;
}
function Ea(e, t, n, o) {
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
function Bw(e, t) {
  return (n) => {
    if (!n.code && !n.key)
      return !1;
    const o = Fw(n.code, e);
    return Array.isArray(e) ? e.some((i) => Ea(n[o], i, t, n.type === "keyup")) : Ea(n[o], e, t, n.type === "keyup");
  };
}
function Fw(e, t) {
  return t.includes(e) ? "code" : "key";
}
function Eo(e, t) {
  const n = ze(() => Ce(t == null ? void 0 : t.actInsideInputWithModifier) ?? !1), o = ze(() => Ce(t == null ? void 0 : t.target) ?? window), i = re(Ce(e) === !0);
  let r = !1;
  const s = /* @__PURE__ */ new Set();
  let l = u(Ce(e));
  ke(
    () => Ce(e),
    (c, f) => {
      typeof f == "boolean" && typeof c != "boolean" && a(), l = u(c);
    },
    {
      immediate: !0
    }
  ), Rc(["blur", "contextmenu"], a), oa(
    (...c) => l(...c),
    (c) => {
      r = zw(c), !((!r || r && !n.value) && us(c)) && (c.preventDefault(), i.value = !0);
    },
    { eventName: "keydown", target: o }
  ), oa(
    (...c) => l(...c),
    (c) => {
      if (i.value) {
        if ((!r || r && !n.value) && us(c))
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
    return c === null ? (a(), () => !1) : typeof c == "boolean" ? (a(), i.value = c, () => !1) : Array.isArray(c) || typeof c == "string" ? Bw(c, s) : c;
  }
  return i;
}
const cd = "vue-flow__node-desc", dd = "vue-flow__edge-desc", Hw = "vue-flow__aria-live", fd = ["Enter", " ", "Escape"], Xn = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};
function cs(e) {
  return {
    ...e.computedPosition || { x: 0, y: 0 },
    width: e.dimensions.width || 0,
    height: e.dimensions.height || 0
  };
}
function ds(e, t) {
  const n = Math.max(0, Math.min(e.x + e.width, t.x + t.width) - Math.max(e.x, t.x)), o = Math.max(0, Math.min(e.y + e.height, t.y + t.height) - Math.max(e.y, t.y));
  return Math.ceil(n * o);
}
function Zi(e) {
  return {
    width: e.offsetWidth,
    height: e.offsetHeight
  };
}
function Tn(e, t = 0, n = 1) {
  return Math.min(Math.max(e, t), n);
}
function hd(e, t) {
  return {
    x: Tn(e.x, t[0][0], t[1][0]),
    y: Tn(e.y, t[0][1], t[1][1])
  };
}
function xa(e) {
  const t = e.getRootNode();
  return "elementFromPoint" in t ? t : window.document;
}
function fn(e) {
  return e && typeof e == "object" && "id" in e && "source" in e && "target" in e;
}
function Cn(e) {
  return e && typeof e == "object" && "id" in e && "position" in e && !fn(e);
}
function po(e) {
  return Cn(e) && "computedPosition" in e;
}
function ei(e) {
  return !Number.isNaN(e) && Number.isFinite(e);
}
function jw(e) {
  return ei(e.width) && ei(e.height) && ei(e.x) && ei(e.y);
}
function Uw(e, t, n) {
  const o = {
    id: e.id.toString(),
    type: e.type ?? "default",
    dimensions: kn({
      width: 0,
      height: 0
    }),
    computedPosition: kn({
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
    data: Ue(e.data) ? e.data : {},
    events: kn(Ue(e.events) ? e.events : {})
  };
  return Object.assign(t ?? o, e, { id: e.id.toString(), parentNode: n });
}
function pd(e, t, n) {
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
    data: Ue(e.data) ? e.data : {},
    events: kn(Ue(e.events) ? e.events : {}),
    label: e.label ?? "",
    interactionWidth: e.interactionWidth ?? (n == null ? void 0 : n.interactionWidth),
    ...n ?? {}
  };
  return Object.assign(t ?? r, e, { id: e.id.toString() });
}
function vd(e, t, n, o) {
  const i = typeof e == "string" ? e : e.id, r = /* @__PURE__ */ new Set(), s = o === "source" ? "target" : "source";
  for (const l of n)
    l[s] === i && r.add(l[o]);
  return t.filter((l) => r.has(l.id));
}
function Gw(...e) {
  if (e.length === 3) {
    const [r, s, l] = e;
    return vd(r, s, l, "target");
  }
  const [t, n] = e, o = typeof t == "string" ? t : t.id;
  return n.filter((r) => fn(r) && r.source === o).map((r) => n.find((s) => Cn(s) && s.id === r.target));
}
function Yw(...e) {
  if (e.length === 3) {
    const [r, s, l] = e;
    return vd(r, s, l, "source");
  }
  const [t, n] = e, o = typeof t == "string" ? t : t.id;
  return n.filter((r) => fn(r) && r.target === o).map((r) => n.find((s) => Cn(s) && s.id === r.source));
}
function gd({ source: e, sourceHandle: t, target: n, targetHandle: o }) {
  return `vueflow__edge-${e}${t ?? ""}-${n}${o ?? ""}`;
}
function Xw(e, t) {
  return t.some(
    (n) => fn(n) && n.source === e.source && n.target === e.target && (n.sourceHandle === e.sourceHandle || !n.sourceHandle && !e.sourceHandle) && (n.targetHandle === e.targetHandle || !n.targetHandle && !e.targetHandle)
  );
}
function md({ x: e, y: t }, { x: n, y: o, zoom: i }) {
  return {
    x: e * i + n,
    y: t * i + o
  };
}
function Ao({ x: e, y: t }, { x: n, y: o, zoom: i }, r = !1, s = [1, 1]) {
  const l = {
    x: (e - n) / i,
    y: (t - o) / i
  };
  return r ? Ji(l, s) : l;
}
function Ww(e, t) {
  return {
    x: Math.min(e.x, t.x),
    y: Math.min(e.y, t.y),
    x2: Math.max(e.x2, t.x2),
    y2: Math.max(e.y2, t.y2)
  };
}
function yd({ x: e, y: t, width: n, height: o }) {
  return {
    x: e,
    y: t,
    x2: e + n,
    y2: t + o
  };
}
function qw({ x: e, y: t, x2: n, y2: o }) {
  return {
    x: e,
    y: t,
    width: n - e,
    height: o - t
  };
}
function bd(e) {
  let t = {
    x: Number.POSITIVE_INFINITY,
    y: Number.POSITIVE_INFINITY,
    x2: Number.NEGATIVE_INFINITY,
    y2: Number.NEGATIVE_INFINITY
  };
  for (let n = 0; n < e.length; n++) {
    const o = e[n];
    t = Ww(
      t,
      yd({
        ...o.computedPosition,
        ...o.dimensions
      })
    );
  }
  return qw(t);
}
function _d(e, t, n = { x: 0, y: 0, zoom: 1 }, o = !1, i = !1) {
  const r = {
    ...Ao(t, n),
    width: t.width / n.zoom,
    height: t.height / n.zoom
  }, s = [];
  for (const l of e) {
    const { dimensions: a, selectable: u = !0, hidden: c = !1 } = l, f = a.width ?? l.width ?? null, h = a.height ?? l.height ?? null;
    if (i && !u || c)
      continue;
    const m = ds(r, cs(l)), C = f === null || h === null, N = o && m > 0, $ = (f ?? 0) * (h ?? 0);
    (C || N || m >= $ || l.dragging) && s.push(l);
  }
  return s;
}
function wd(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (typeof e == "string")
    n.add(e);
  else if (e.length >= 1)
    for (const o of e)
      n.add(o.id);
  return t.filter((o) => n.has(o.source) || n.has(o.target));
}
function ka(e, t, n, o, i, r = 0.1, s = { x: 0, y: 0 }) {
  const l = t / (e.width * (1 + r)), a = n / (e.height * (1 + r)), u = Math.min(l, a), c = Tn(u, o, i), f = e.x + e.width / 2, h = e.y + e.height / 2, m = t / 2 - f * c + (s.x ?? 0), C = n / 2 - h * c + (s.y ?? 0);
  return { x: m, y: C, zoom: c };
}
function Kw(e, t) {
  return {
    x: t.x + e.x,
    y: t.y + e.y,
    z: (e.z > t.z ? e.z : t.z) + 1
  };
}
function Ed(e, t) {
  if (!e.parentNode)
    return !1;
  const n = t(e.parentNode);
  return n ? n.selected ? !0 : Ed(n, t) : !1;
}
function Ro(e, t) {
  return typeof e > "u" ? "" : typeof e == "string" ? e : `${t ? `${t}__` : ""}${Object.keys(e).sort().map((o) => `${o}=${e[o]}`).join("&")}`;
}
function Sa(e, t, n) {
  return e < t ? Tn(Math.abs(e - t), 1, t) / t : e > n ? -Tn(Math.abs(e - n), 1, t) / t : 0;
}
function xd(e, t, n = 15, o = 40) {
  const i = Sa(e.x, o, t.width - o) * n, r = Sa(e.y, o, t.height - o) * n;
  return [i, r];
}
function Cr(e, t) {
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
function Ca(e, t) {
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
            if (po(s) && (typeof l.position < "u" && (s.position = l.position), typeof l.dragging < "u" && (s.dragging = l.dragging), s.expandParent && s.parentNode)) {
              const a = t[r.indexOf(s.parentNode)];
              a && po(a) && Cr(s, a);
            }
            break;
          case "dimensions":
            if (po(s) && (typeof l.dimensions < "u" && (s.dimensions = l.dimensions), typeof l.updateStyle < "u" && l.updateStyle && (s.style = {
              ...s.style || {},
              width: `${(n = l.dimensions) == null ? void 0 : n.width}px`,
              height: `${(o = l.dimensions) == null ? void 0 : o.height}px`
            }), typeof l.resizing < "u" && (s.resizing = l.resizing), s.expandParent && s.parentNode)) {
              const a = t[r.indexOf(s.parentNode)];
              a && po(a) && (!!a.dimensions.width && !!a.dimensions.height ? Cr(s, a) : Ze(() => {
                Cr(s, a);
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
function Na(e) {
  return {
    item: e,
    type: "add"
  };
}
function $a(e) {
  return {
    id: e,
    type: "remove"
  };
}
function Ma(e, t, n, o, i) {
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
function ae(e) {
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
      return Yi(a), {
        off: a
      };
    },
    off: i,
    trigger: (l) => Promise.all(Array.from(t).map((a) => a(l))),
    hasListeners: o,
    fns: t
  };
}
function Ia(e, t, n) {
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
function Zw(e, t, n, o, i) {
  var r, s;
  const l = [];
  for (const a of e)
    (a.selected || a.id === i) && (!a.parentNode || !Ed(a, o)) && (a.draggable || t && typeof a.draggable > "u") && l.push(
      kn({
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
function Nr({
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
function kd(e) {
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
function Jw(e, t, n) {
  const [o, i, r, s] = typeof e != "string" ? kd(e.padding) : [0, 0, 0, 0];
  return n && typeof n.computedPosition.x < "u" && typeof n.computedPosition.y < "u" && typeof n.dimensions.width < "u" && typeof n.dimensions.height < "u" ? [
    [n.computedPosition.x + s, n.computedPosition.y + o],
    [
      n.computedPosition.x + n.dimensions.width - i,
      n.computedPosition.y + n.dimensions.height - r
    ]
  ] : !1;
}
function Qw(e, t, n, o) {
  let i = e.extent || n;
  if ((i === "parent" || !Array.isArray(i) && (i == null ? void 0 : i.range) === "parent") && !e.expandParent)
    if (e.parentNode && o && e.dimensions.width && e.dimensions.height) {
      const r = Jw(i, e, o);
      r && (i = r);
    } else
      t(new We(Ge.NODE_EXTENT_INVALID, e.id)), i = n;
  else if (Array.isArray(i)) {
    const r = (o == null ? void 0 : o.computedPosition.x) || 0, s = (o == null ? void 0 : o.computedPosition.y) || 0;
    i = [
      [i[0][0] + r, i[0][1] + s],
      [i[1][0] + r, i[1][1] + s]
    ];
  } else if (i !== "parent" && (i != null && i.range) && Array.isArray(i.range)) {
    const [r, s, l, a] = kd(i.padding), u = (o == null ? void 0 : o.computedPosition.x) || 0, c = (o == null ? void 0 : o.computedPosition.y) || 0;
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
function eE({ width: e, height: t }, n) {
  return [n[0], [n[1][0] - (e || 0), n[1][1] - (t || 0)]];
}
function Us(e, t, n, o, i) {
  const r = eE(e.dimensions, Qw(e, n, o, i)), s = hd(t, r);
  return {
    position: {
      x: s.x - ((i == null ? void 0 : i.computedPosition.x) || 0),
      y: s.y - ((i == null ? void 0 : i.computedPosition.y) || 0)
    },
    computedPosition: s
  };
}
function Ii(e, t, n = de.Left) {
  const o = ((t == null ? void 0 : t.x) ?? 0) + e.computedPosition.x, i = ((t == null ? void 0 : t.y) ?? 0) + e.computedPosition.y, { width: r, height: s } = t ?? oE(e);
  switch ((t == null ? void 0 : t.position) ?? n) {
    case de.Top:
      return {
        x: o + r / 2,
        y: i
      };
    case de.Right:
      return {
        x: o + r,
        y: i + s / 2
      };
    case de.Bottom:
      return {
        x: o + r / 2,
        y: i + s
      };
    case de.Left:
      return {
        x: o,
        y: i + s / 2
      };
  }
}
function Oa(e = [], t) {
  return e.length && (t ? e.find((n) => n.id === t) : e[0]) || null;
}
function tE({
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
  const c = yd({
    x: (0 - a.x) / a.zoom,
    y: (0 - a.y) / a.zoom,
    width: s / a.zoom,
    height: l / a.zoom
  }), f = Math.max(0, Math.min(c.x2, u.x2) - Math.max(c.x, u.x)), h = Math.max(0, Math.min(c.y2, u.y2) - Math.max(c.y, u.y));
  return Math.ceil(f * h) > 0;
}
function nE(e, t, n = !1) {
  const o = typeof e.zIndex == "number";
  let i = o ? e.zIndex : 0;
  const r = t(e.source), s = t(e.target);
  return !r || !s ? 0 : (n && (i = o ? e.zIndex : Math.max(r.computedPosition.z || 0, s.computedPosition.z || 0)), i);
}
var Ge = /* @__PURE__ */ ((e) => (e.MISSING_STYLES = "MISSING_STYLES", e.MISSING_VIEWPORT_DIMENSIONS = "MISSING_VIEWPORT_DIMENSIONS", e.NODE_INVALID = "NODE_INVALID", e.NODE_NOT_FOUND = "NODE_NOT_FOUND", e.NODE_MISSING_PARENT = "NODE_MISSING_PARENT", e.NODE_TYPE_MISSING = "NODE_TYPE_MISSING", e.NODE_EXTENT_INVALID = "NODE_EXTENT_INVALID", e.EDGE_INVALID = "EDGE_INVALID", e.EDGE_NOT_FOUND = "EDGE_NOT_FOUND", e.EDGE_SOURCE_MISSING = "EDGE_SOURCE_MISSING", e.EDGE_TARGET_MISSING = "EDGE_TARGET_MISSING", e.EDGE_TYPE_MISSING = "EDGE_TYPE_MISSING", e.EDGE_SOURCE_TARGET_SAME = "EDGE_SOURCE_TARGET_SAME", e.EDGE_SOURCE_TARGET_MISSING = "EDGE_SOURCE_TARGET_MISSING", e.EDGE_ORPHANED = "EDGE_ORPHANED", e.USEVUEFLOW_OPTIONS = "USEVUEFLOW_OPTIONS", e))(Ge || {});
const Ta = {
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
    super((o = Ta[t]) == null ? void 0 : o.call(Ta, ...n)), this.name = "VueFlowError", this.code = t, this.args = n;
  }
}
function Gs(e) {
  return "clientX" in e;
}
function Sd(e) {
  return "sourceEvent" in e;
}
function qt(e, t) {
  var n, o;
  const i = Gs(e), r = i ? e.clientX : (n = e.touches) == null ? void 0 : n[0].clientX, s = i ? e.clientY : (o = e.touches) == null ? void 0 : o[0].clientY;
  return {
    x: r - ((t == null ? void 0 : t.left) ?? 0),
    y: s - ((t == null ? void 0 : t.top) ?? 0)
  };
}
const Oi = () => {
  var e;
  return typeof navigator < "u" && ((e = navigator == null ? void 0 : navigator.userAgent) == null ? void 0 : e.indexOf("Mac")) >= 0;
};
function oE(e) {
  var t, n;
  return {
    width: ((t = e.dimensions) == null ? void 0 : t.width) ?? e.width ?? 0,
    height: ((n = e.dimensions) == null ? void 0 : n.height) ?? e.height ?? 0
  };
}
function Ji(e, t = [1, 1]) {
  return {
    x: t[0] * Math.round(e.x / t[0]),
    y: t[1] * Math.round(e.y / t[1])
  };
}
function Cd() {
  return {
    handleDomNode: null,
    isValid: !1,
    connection: { source: "", target: "", sourceHandle: null, targetHandle: null },
    endHandle: null
  };
}
function $r(e) {
  e == null || e.classList.remove("valid", "connecting", "vue-flow__handle-valid", "vue-flow__handle-connecting");
}
function Pa(e, t, n, o) {
  const i = [];
  for (const r of t[n] || [])
    if (`${e.id}-${r.id}-${n}` !== o) {
      const { x: s, y: l } = Ii(e, r);
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
function iE(e, t, n, o, i, r) {
  const { x: s, y: l } = qt(e), u = t.elementsFromPoint(s, l).find((C) => C.classList.contains("vue-flow__handle"));
  if (u) {
    const C = u.getAttribute("data-nodeid");
    if (C) {
      const N = Ys(void 0, u), $ = u.getAttribute("data-handleid"), I = r({ nodeId: C, id: $, type: N });
      if (I) {
        const A = i.find((k) => k.nodeId === C && k.type === N && k.id === $);
        return {
          handle: {
            id: $,
            type: N,
            nodeId: C,
            x: (A == null ? void 0 : A.x) || n.x,
            y: (A == null ? void 0 : A.y) || n.y
          },
          validHandleResult: I
        };
      }
    }
  }
  let c = [], f = Number.POSITIVE_INFINITY;
  for (const C of i) {
    const N = Math.sqrt((C.x - n.x) ** 2 + (C.y - n.y) ** 2);
    if (N <= o) {
      const $ = r(C);
      N <= f && (N < f ? c = [{ handle: C, validHandleResult: $ }] : N === f && c.push({
        handle: C,
        validHandleResult: $
      }), f = N);
    }
  }
  if (!c.length)
    return { handle: null, validHandleResult: Cd() };
  if (c.length === 1)
    return c[0];
  const h = c.some(({ validHandleResult: C }) => C.isValid), m = c.some(({ handle: C }) => C.type === "target");
  return c.find(
    ({ handle: C, validHandleResult: N }) => m ? C.type === "target" : h ? N.isValid : !0
  ) || c[0];
}
function Da(e, t, n, o, i, r, s, l, a, u, c) {
  const f = r === "target", h = l.querySelector(`.vue-flow__handle[data-id="${t == null ? void 0 : t.nodeId}-${t == null ? void 0 : t.id}-${t == null ? void 0 : t.type}"]`), { x: m, y: C } = qt(e), N = l.elementFromPoint(m, C), $ = N != null && N.classList.contains("vue-flow__handle") ? N : h, I = Cd();
  if ($) {
    I.handleDomNode = $;
    const A = Ys(void 0, $), k = $.getAttribute("data-nodeid"), _ = $.getAttribute("data-handleid"), B = $.classList.contains("connectable"), M = $.classList.contains("connectableend"), E = {
      source: f ? k : o,
      sourceHandle: f ? _ : i,
      target: f ? o : k,
      targetHandle: f ? i : _
    };
    I.connection = E, B && M && (n === On.Strict ? f && A === "source" || !f && A === "target" : k !== o || _ !== i) && (I.isValid = s(E, {
      edges: a,
      nodes: u,
      sourceNode: c(E.source),
      targetNode: c(E.target)
    }), I.endHandle = {
      nodeId: k,
      handleId: _,
      type: A,
      position: I.isValid ? $.getAttribute("data-handlepos") : null
    });
  }
  return I;
}
function rE({ nodes: e, nodeId: t, handleId: n, handleType: o }) {
  const i = [];
  for (let r = 0; r < e.length; r++) {
    const s = e[r], { handleBounds: l } = s;
    let a = [], u = [];
    l && (a = Pa(s, l, "source", `${t}-${n}-${o}`), u = Pa(s, l, "target", `${t}-${n}-${o}`)), i.push(...a, ...u);
  }
  return i;
}
function Ys(e, t) {
  return e || (t != null && t.classList.contains("target") ? "target" : t != null && t.classList.contains("source") ? "source" : null);
}
function sE(e, t) {
  let n = null;
  return t ? n = "valid" : e && !t && (n = "invalid"), n;
}
const lE = ["production", "prod"];
function Qi(e, ...t) {
  Nd() && console.warn(`[Vue Flow]: ${e}`, ...t);
}
function Nd() {
  return !lE.includes("production");
}
function Aa(e, t, n, o) {
  const i = t.querySelectorAll(`.vue-flow__handle${e}`);
  return Array.from(i).map((s) => {
    const l = s.getBoundingClientRect();
    return {
      id: s.getAttribute("data-handleid"),
      position: s.getAttribute("data-handlepos"),
      x: (l.left - n.left) / o,
      y: (l.top - n.top) / o,
      ...Zi(s)
    };
  });
}
function fs(e, t, n, o, i, r = !1, s) {
  i.value = !1, e.selected ? (r || e.selected && t) && (o([e]), Ze(() => {
    s.blur();
  })) : n([e]);
}
function Ue(e) {
  return typeof V(e) < "u";
}
function aE(e, t, n, o) {
  if (!e || !e.source || !e.target)
    return n(new We(Ge.EDGE_INVALID, (e == null ? void 0 : e.id) ?? "[ID UNKNOWN]")), !1;
  let i;
  return fn(e) ? i = e : i = {
    ...e,
    id: gd(e)
  }, i = pd(i, void 0, o), Xw(i, t) ? !1 : i;
}
function uE(e, t, n, o, i) {
  if (!t.source || !t.target)
    return i(new We(Ge.EDGE_INVALID, e.id)), !1;
  if (!n)
    return i(new We(Ge.EDGE_NOT_FOUND, e.id)), !1;
  const { id: r, ...s } = e;
  return {
    ...s,
    id: o ? gd(t) : r,
    source: t.source,
    target: t.target,
    sourceHandle: t.sourceHandle,
    targetHandle: t.targetHandle
  };
}
function Ra(e, t, n) {
  const o = {}, i = [];
  for (let r = 0; r < e.length; ++r) {
    const s = e[r];
    if (!Cn(s)) {
      n(
        new We(Ge.NODE_INVALID, s == null ? void 0 : s.id) || `[ID UNKNOWN|INDEX ${r}]`
      );
      continue;
    }
    const l = Uw(s, t(s.id), s.parentNode);
    s.parentNode && (o[s.parentNode] = !0), i[r] = l;
  }
  for (const r of i) {
    const s = t(r.parentNode) || i.find((l) => l.id === r.parentNode);
    r.parentNode && !s && n(new We(Ge.NODE_MISSING_PARENT, r.id, r.parentNode)), (r.parentNode || o[r.id]) && (o[r.id] && (r.isParent = !0), s && (s.isParent = !0));
  }
  return i;
}
function Mr(e, t) {
  e.clear();
  for (const n of t) {
    const { id: o, source: i, target: r, sourceHandle: s = null, targetHandle: l = null } = n, a = `${i}-source-${s}`, u = `${r}-target-${l}`, c = e.get(a) || /* @__PURE__ */ new Map(), f = e.get(u) || /* @__PURE__ */ new Map(), h = kn({ edgeId: o, source: i, target: r, sourceHandle: s, targetHandle: l });
    e.set(a, c.set(`${r}-${l}`, h)), e.set(u, f.set(`${i}-${s}`, h));
  }
}
function Ir(e, t, n, o, i, r, s, l) {
  const a = [];
  for (const u of e) {
    const c = fn(u) ? u : aE(u, l, i, r);
    if (!c)
      continue;
    const f = n(c.source), h = n(c.target);
    if (!f || !h) {
      i(new We(Ge.EDGE_SOURCE_TARGET_MISSING, c.id, c.source, c.target));
      continue;
    }
    if (!f) {
      i(new We(Ge.EDGE_SOURCE_MISSING, c.id, c.source));
      continue;
    }
    if (!h) {
      i(new We(Ge.EDGE_TARGET_MISSING, c.id, c.target));
      continue;
    }
    if (t && !t(c, {
      edges: l,
      nodes: s,
      sourceNode: f,
      targetNode: h
    })) {
      i(new We(Ge.EDGE_INVALID, c.id));
      continue;
    }
    const m = o(c.id);
    a.push({
      ...pd(c, m, r),
      sourceNode: f,
      targetNode: h
    });
  }
  return a;
}
const La = Symbol("vueFlow"), $d = Symbol("nodeId"), Md = Symbol("nodeRef"), cE = Symbol("edgeId"), dE = Symbol("edgeRef"), er = Symbol("slots");
function Id(e) {
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
    panBy: h,
    findNode: m,
    multiSelectionActive: C,
    nodesSelectionActive: N,
    selectNodesOnDrag: $,
    removeSelectedElements: I,
    addSelectedNodes: A,
    updateNodePositions: k,
    emits: _
  } = Be(), { onStart: B, onDrag: M, onStop: E, onClick: Y, el: ne, disabled: G, id: Z, selectable: T, dragHandle: R } = e, w = re(!1);
  let D = [], P, F = null, X = { x: void 0, y: void 0 }, Q = { x: 0, y: 0 }, oe = null, ue = !1, ee = 0, le = !1;
  const j = pE(), ge = ({ x: H, y: d }) => {
    X = { x: H, y: d };
    let x = !1;
    if (D = D.map((v) => {
      const g = { x: H - v.distance.x, y: d - v.distance.y }, { computedPosition: y } = Us(
        v,
        n.value ? Ji(g, o.value) : g,
        _.error,
        s.value,
        v.parentNode ? m(v.parentNode) : void 0
      );
      return x = x || v.position.x !== y.x || v.position.y !== y.y, v.position = y, v;
    }), !!x && (k(D, !0, !0), w.value = !0, oe)) {
      const [v, g] = Nr({
        id: Z,
        dragItems: D,
        findNode: m
      });
      M({ event: oe, node: v, nodes: g });
    }
  }, _e = () => {
    if (!F)
      return;
    const [H, d] = xd(Q, F, c.value);
    if (H !== 0 || d !== 0) {
      const x = {
        x: (X.x ?? 0) - H / a.value.zoom,
        y: (X.y ?? 0) - d / a.value.zoom
      };
      h({ x: H, y: d }) && ge(x);
    }
    ee = requestAnimationFrame(_e);
  }, ye = (H, d) => {
    ue = !0;
    const x = m(Z);
    !$.value && !C.value && x && (x.selected || I()), x && Ce(T) && $.value && fs(
      x,
      C.value,
      A,
      I,
      N,
      !1,
      d
    );
    const v = j(H.sourceEvent);
    if (X = v, D = Zw(r.value, f.value, v, m, Z), D.length) {
      const [g, y] = Nr({
        id: Z,
        dragItems: D,
        findNode: m
      });
      B({ event: H.sourceEvent, node: g, nodes: y });
    }
  }, we = (H, d) => {
    var x;
    H.sourceEvent.type === "touchmove" && H.sourceEvent.touches.length > 1 || (l.value === 0 && ye(H, d), X = j(H.sourceEvent), F = ((x = t.value) == null ? void 0 : x.getBoundingClientRect()) || null, Q = qt(H.sourceEvent, F));
  }, fe = (H, d) => {
    const x = j(H.sourceEvent);
    if (!le && ue && u.value && (le = !0, _e()), !ue) {
      const v = x.xSnapped - (X.x ?? 0), g = x.ySnapped - (X.y ?? 0);
      Math.sqrt(v * v + g * g) > l.value && ye(H, d);
    }
    (X.x !== x.xSnapped || X.y !== x.ySnapped) && D.length && ue && (oe = H.sourceEvent, Q = qt(H.sourceEvent, F), ge(x));
  }, pe = (H) => {
    if (!Sd(H) && !ue && !w.value && !C.value) {
      const d = H, x = j(d), v = x.xSnapped - (X.x ?? 0), g = x.ySnapped - (X.y ?? 0), y = Math.sqrt(v * v + g * g);
      y !== 0 && y <= l.value && (Y == null || Y(d));
      return;
    }
    if (w.value = !1, le = !1, ue = !1, X = { x: void 0, y: void 0 }, cancelAnimationFrame(ee), D.length) {
      k(D, !1, !1);
      const [d, x] = Nr({
        id: Z,
        dragItems: D,
        findNode: m
      });
      E({ event: H.sourceEvent, node: d, nodes: x });
    }
  };
  return ke([() => Ce(G), ne], ([H, d], x, v) => {
    if (d) {
      const g = wt(d);
      H || (P = Wb().on("start", (y) => we(y, d)).on("drag", (y) => fe(y, d)).on("end", (y) => pe(y)).filter((y) => {
        const b = y.target, O = Ce(R);
        return !y.button && (!i.value || !Ia(b, `.${i.value}`, d) && (!O || Ia(b, O, d)));
      }), g.call(P)), v(() => {
        g.on(".drag", null), P && (P.on("start", null), P.on("drag", null), P.on("end", null));
      });
    }
  }), w;
}
function fE() {
  return {
    doubleClick: ae(),
    click: ae(),
    mouseEnter: ae(),
    mouseMove: ae(),
    mouseLeave: ae(),
    contextMenu: ae(),
    updateStart: ae(),
    update: ae(),
    updateEnd: ae()
  };
}
function hE(e, t) {
  const n = fE();
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
function pE() {
  const { viewport: e, snapGrid: t, snapToGrid: n } = Be();
  return (o) => {
    const i = Sd(o) ? o.sourceEvent : o, { x: r, y: s } = qt(i), l = Ao({ x: r, y: s }, e.value), { x: a, y: u } = n.value ? Ji(l, t.value) : l;
    return {
      xSnapped: a,
      ySnapped: u,
      ...l
    };
  };
}
function ti() {
  return !0;
}
function Od({
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
    nodesConnectable: h,
    autoPanOnConnect: m,
    autoPanSpeed: C,
    findNode: N,
    panBy: $,
    startConnection: I,
    updateConnection: A,
    endConnection: k,
    emits: _,
    viewport: B,
    edges: M,
    nodes: E,
    isValidConnection: Y
  } = Be();
  let ne = null, G = !1, Z = null, T = null;
  function R(D) {
    var P;
    const F = Ce(n) === "target", X = Gs(D), Q = xa(D.target);
    if (X && D.button === 0 || !X) {
      let oe = function(y) {
        d = qt(y, pe);
        const { handle: b, validHandleResult: O } = iE(
          y,
          Q,
          Ao(d, B.value, !1, [1, 1]),
          u.value,
          v,
          (L) => Da(
            y,
            L,
            a.value,
            Ce(t),
            Ce(e),
            F ? "target" : "source",
            le,
            Q,
            M.value,
            E.value,
            N
          )
        );
        if (j = b, x || (g(), x = !0), ne = O.connection, G = O.isValid, Z = O.handleDomNode, !(G && j && (T != null && T.endHandle) && O.endHandle && T.endHandle.type === O.endHandle.type && T.endHandle.nodeId === O.endHandle.nodeId && T.endHandle.handleId === O.endHandle.handleId)) {
          if (A(
            j && G ? md(
              {
                x: j.x,
                y: j.y
              },
              B.value
            ) : d,
            O.endHandle,
            sE(!!j, G)
          ), T = O, !j && !G && !Z)
            return $r(H);
          ne && ne.source !== ne.target && Z && ($r(H), H = Z, Z.classList.add("connecting", "vue-flow__handle-connecting"), Z.classList.toggle("valid", G), Z.classList.toggle("vue-flow__handle-valid", G));
        }
      }, ue = function(y) {
        (j || Z) && ne && G && (r ? r(y, ne) : _.connect(ne)), _.connectEnd(y), i && (s == null || s(y)), $r(H), cancelAnimationFrame(ge), k(y), x = !1, G = !1, ne = null, Z = null, Q.removeEventListener("mousemove", oe), Q.removeEventListener("mouseup", ue), Q.removeEventListener("touchmove", oe), Q.removeEventListener("touchend", ue);
      };
      const ee = N(Ce(t));
      let le = Ce(o) || Y.value || ti;
      !le && ee && (le = (F ? ee.isValidSourcePos : ee.isValidTargetPos) || ti);
      let j, ge = 0;
      const { x: _e, y: ye } = qt(D), we = Q == null ? void 0 : Q.elementFromPoint(_e, ye), fe = Ys(Ce(i), we), pe = (P = l.value) == null ? void 0 : P.getBoundingClientRect();
      if (!pe || !fe)
        return;
      let H, d = qt(D, pe), x = !1;
      const v = rE({
        nodes: E.value,
        nodeId: Ce(t),
        handleId: Ce(e),
        handleType: fe
      }), g = () => {
        if (!m.value)
          return;
        const [y, b] = xd(d, pe, C.value);
        $({ x: y, y: b }), ge = requestAnimationFrame(g);
      };
      I(
        {
          nodeId: Ce(t),
          handleId: Ce(e),
          type: fe,
          position: (we == null ? void 0 : we.getAttribute("data-handlepos")) || de.Top
        },
        {
          x: _e - pe.left,
          y: ye - pe.top
        }
      ), _.connectStart({ event: D, nodeId: Ce(t), handleId: Ce(e), handleType: fe }), Q.addEventListener("mousemove", oe), Q.addEventListener("mouseup", ue), Q.addEventListener("touchmove", oe), Q.addEventListener("touchend", ue);
    }
  }
  function w(D) {
    if (!c.value)
      return;
    const P = Ce(n) === "target";
    if (!f.value)
      _.clickConnectStart({ event: D, nodeId: Ce(t), handleId: Ce(e) }), I({ nodeId: Ce(t), type: Ce(n), handleId: Ce(e) }, void 0, !0);
    else {
      let F = Ce(o) || Y.value || ti;
      const X = N(Ce(t));
      if (!F && X && (F = (P ? X.isValidSourcePos : X.isValidTargetPos) || ti), X && (typeof X.connectable > "u" ? h.value : X.connectable) === !1)
        return;
      const Q = xa(D.target), { connection: oe, isValid: ue } = Da(
        D,
        {
          nodeId: Ce(t),
          id: Ce(e),
          type: Ce(n)
        },
        a.value,
        f.value.nodeId,
        f.value.handleId || null,
        f.value.type,
        F,
        Q,
        M.value,
        E.value,
        N
      ), ee = oe.source === oe.target;
      ue && !ee && _.connect(oe), _.clickConnectEnd(D), k(D, !0);
    }
  }
  return {
    handlePointerDown: R,
    handleClick: w
  };
}
function vE() {
  return At($d, "");
}
function Td(e) {
  const t = e ?? vE() ?? "", n = At(Md, re(null)), { findNode: o, edges: i, emits: r } = Be(), s = o(t);
  return s || r.error(new We(Ge.NODE_NOT_FOUND, t)), {
    id: t,
    nodeEl: n,
    node: s,
    parentNode: ce(() => o(s.parentNode)),
    connectedEdges: ce(() => wd([s], i.value))
  };
}
function gE() {
  return {
    doubleClick: ae(),
    click: ae(),
    mouseEnter: ae(),
    mouseMove: ae(),
    mouseLeave: ae(),
    contextMenu: ae(),
    dragStart: ae(),
    drag: ae(),
    dragStop: ae()
  };
}
function mE(e, t) {
  const n = gE();
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
function Pd() {
  const { getSelectedNodes: e, nodeExtent: t, updateNodePositions: n, findNode: o, snapGrid: i, snapToGrid: r, nodesDraggable: s, emits: l } = Be();
  return (a, u = !1) => {
    const c = r.value ? i.value[0] : 5, f = r.value ? i.value[1] : 5, h = u ? 4 : 1, m = a.x * c * h, C = a.y * f * h, N = [];
    for (const $ of e.value)
      if ($.draggable || s && typeof $.draggable > "u") {
        const I = { x: $.computedPosition.x + m, y: $.computedPosition.y + C }, { computedPosition: A } = Us(
          $,
          I,
          l.error,
          t.value,
          $.parentNode ? o($.parentNode) : void 0
        );
        N.push({
          id: $.id,
          position: A,
          from: $.position,
          distance: { x: a.x, y: a.y },
          dimensions: $.dimensions
        });
      }
    n(N, !0, !1);
  };
}
const Or = 0.1;
function Jt() {
  return Qi("Viewport not initialized yet."), Promise.resolve(!1);
}
const yE = {
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
function bE(e) {
  function t(o, i) {
    return new Promise((r) => {
      e.d3Selection && e.d3Zoom ? e.d3Zoom.scaleBy(
        Tr(e.d3Selection, i, () => {
          r(!0);
        }),
        o
      ) : r(!1);
    });
  }
  function n(o, i, r, s) {
    return new Promise((l) => {
      const { x: a, y: u } = hd({ x: -o, y: -i }, e.translateExtent), c = Qn.translate(-a, -u).scale(r);
      e.d3Selection && e.d3Zoom ? e.d3Zoom.transform(
        Tr(e.d3Selection, s, () => {
          l(!0);
        }),
        c
      ) : l(!1);
    });
  }
  return ce(() => e.d3Zoom && e.d3Selection && e.dimensions.width && e.dimensions.height ? {
    viewportInitialized: !0,
    // todo: allow passing scale as option
    zoomIn: (i) => t(1.2, i == null ? void 0 : i.duration),
    zoomOut: (i) => t(1 / 1.2, i == null ? void 0 : i.duration),
    zoomTo: (i, r) => new Promise((s) => {
      e.d3Selection && e.d3Zoom ? e.d3Zoom.scaleTo(
        Tr(e.d3Selection, r == null ? void 0 : r.duration, () => {
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
      padding: Or,
      includeHiddenNodes: !1,
      duration: 0
    }) => {
      var r, s;
      const l = [];
      for (const h of e.nodes)
        h.dimensions.width && h.dimensions.height && ((i == null ? void 0 : i.includeHiddenNodes) || !h.hidden) && (!((r = i.nodes) != null && r.length) || (s = i.nodes) != null && s.length && i.nodes.includes(h.id)) && l.push(h);
      if (!l.length)
        return Promise.resolve(!1);
      const a = bd(l), { x: u, y: c, zoom: f } = ka(
        a,
        e.dimensions.width,
        e.dimensions.height,
        i.minZoom ?? e.minZoom,
        i.maxZoom ?? e.maxZoom,
        i.padding ?? Or,
        i.offset
      );
      return n(u, c, f, i == null ? void 0 : i.duration);
    },
    setCenter: (i, r, s) => {
      const l = typeof (s == null ? void 0 : s.zoom) < "u" ? s.zoom : e.maxZoom, a = e.dimensions.width / 2 - i * l, u = e.dimensions.height / 2 - r * l;
      return n(a, u, l, s == null ? void 0 : s.duration);
    },
    fitBounds: (i, r = { padding: Or }) => {
      const { x: s, y: l, zoom: a } = ka(
        i,
        e.dimensions.width,
        e.dimensions.height,
        e.minZoom,
        e.maxZoom,
        r.padding
      );
      return n(s, l, a, r == null ? void 0 : r.duration);
    },
    project: (i) => Ao(i, e.viewport, e.snapToGrid, e.snapGrid),
    screenToFlowCoordinate: (i) => {
      if (e.vueFlowRef) {
        const { x: r, y: s } = e.vueFlowRef.getBoundingClientRect(), l = {
          x: i.x - r,
          y: i.y - s
        };
        return Ao(l, e.viewport, e.snapToGrid, e.snapGrid);
      }
      return { x: 0, y: 0 };
    },
    flowToScreenCoordinate: (i) => {
      if (e.vueFlowRef) {
        const { x: r, y: s } = e.vueFlowRef.getBoundingClientRect(), l = {
          x: i.x + r,
          y: i.y + s
        };
        return md(l, e.viewport);
      }
      return { x: 0, y: 0 };
    }
  } : yE);
}
function Tr(e, t = 0, n) {
  return e.transition().duration(t).on("end", n);
}
function _E(e, t, n) {
  const o = Ja(!0);
  return o.run(() => {
    const i = () => {
      o.run(() => {
        let N, $, I = !!(n.nodes.value.length || n.edges.value.length);
        N = Ln([e.modelValue, () => {
          var A, k;
          return (k = (A = e.modelValue) == null ? void 0 : A.value) == null ? void 0 : k.length;
        }], ([A]) => {
          A && Array.isArray(A) && ($ == null || $.pause(), n.setElements(A), !$ && !I && A.length ? I = !0 : $ == null || $.resume());
        }), $ = Ln(
          [n.nodes, n.edges, () => n.edges.value.length, () => n.nodes.value.length],
          ([A, k]) => {
            var _;
            (_ = e.modelValue) != null && _.value && Array.isArray(e.modelValue.value) && (N == null || N.pause(), e.modelValue.value = [...A, ...k], Ze(() => {
              N == null || N.resume();
            }));
          },
          { immediate: I }
        ), ri(() => {
          N == null || N.stop(), $ == null || $.stop();
        });
      });
    }, r = () => {
      o.run(() => {
        let N, $, I = !!n.nodes.value.length;
        N = Ln([e.nodes, () => {
          var A, k;
          return (k = (A = e.nodes) == null ? void 0 : A.value) == null ? void 0 : k.length;
        }], ([A]) => {
          A && Array.isArray(A) && ($ == null || $.pause(), n.setNodes(A), !$ && !I && A.length ? I = !0 : $ == null || $.resume());
        }), $ = Ln(
          [n.nodes, () => n.nodes.value.length],
          ([A]) => {
            var k;
            (k = e.nodes) != null && k.value && Array.isArray(e.nodes.value) && (N == null || N.pause(), e.nodes.value = [...A], Ze(() => {
              N == null || N.resume();
            }));
          },
          { immediate: I }
        ), ri(() => {
          N == null || N.stop(), $ == null || $.stop();
        });
      });
    }, s = () => {
      o.run(() => {
        let N, $, I = !!n.edges.value.length;
        N = Ln([e.edges, () => {
          var A, k;
          return (k = (A = e.edges) == null ? void 0 : A.value) == null ? void 0 : k.length;
        }], ([A]) => {
          A && Array.isArray(A) && ($ == null || $.pause(), n.setEdges(A), !$ && !I && A.length ? I = !0 : $ == null || $.resume());
        }), $ = Ln(
          [n.edges, () => n.edges.value.length],
          ([A]) => {
            var k;
            (k = e.edges) != null && k.value && Array.isArray(e.edges.value) && (N == null || N.pause(), e.edges.value = [...A], Ze(() => {
              N == null || N.resume();
            }));
          },
          { immediate: I }
        ), ri(() => {
          N == null || N.stop(), $ == null || $.stop();
        });
      });
    }, l = () => {
      o.run(() => {
        ke(
          () => t.maxZoom,
          () => {
            t.maxZoom && Ue(t.maxZoom) && n.setMaxZoom(t.maxZoom);
          },
          {
            immediate: !0
          }
        );
      });
    }, a = () => {
      o.run(() => {
        ke(
          () => t.minZoom,
          () => {
            t.minZoom && Ue(t.minZoom) && n.setMinZoom(t.minZoom);
          },
          { immediate: !0 }
        );
      });
    }, u = () => {
      o.run(() => {
        ke(
          () => t.translateExtent,
          () => {
            t.translateExtent && Ue(t.translateExtent) && n.setTranslateExtent(t.translateExtent);
          },
          {
            immediate: !0
          }
        );
      });
    }, c = () => {
      o.run(() => {
        ke(
          () => t.nodeExtent,
          () => {
            t.nodeExtent && Ue(t.nodeExtent) && n.setNodeExtent(t.nodeExtent);
          },
          {
            immediate: !0
          }
        );
      });
    }, f = () => {
      o.run(() => {
        ke(
          () => t.applyDefault,
          () => {
            Ue(t.applyDefault) && (n.applyDefault.value = t.applyDefault);
          },
          {
            immediate: !0
          }
        );
      });
    }, h = () => {
      o.run(() => {
        const N = async ($) => {
          let I = $;
          typeof t.autoConnect == "function" && (I = await t.autoConnect($)), I !== !1 && n.addEdges([I]);
        };
        ke(
          () => t.autoConnect,
          () => {
            Ue(t.autoConnect) && (n.autoConnect.value = t.autoConnect);
          },
          { immediate: !0 }
        ), ke(
          n.autoConnect,
          ($, I, A) => {
            $ ? n.onConnect(N) : n.hooks.value.connect.off(N), A(() => {
              n.hooks.value.connect.off(N);
            });
          },
          { immediate: !0 }
        );
      });
    }, m = () => {
      const N = [
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
        const I = $;
        if (!N.includes(I)) {
          const A = ze(() => t[I]), k = n[I];
          He(k) && o.run(() => {
            ke(
              A,
              (_) => {
                Ue(_) && (k.value = _);
              },
              { immediate: !0 }
            );
          });
        }
      }
    };
    (() => {
      i(), r(), s(), a(), l(), u(), c(), f(), h(), m();
    })();
  }), () => o.stop();
}
function wE() {
  return {
    edgesChange: ae(),
    nodesChange: ae(),
    nodeDoubleClick: ae(),
    nodeClick: ae(),
    nodeMouseEnter: ae(),
    nodeMouseMove: ae(),
    nodeMouseLeave: ae(),
    nodeContextMenu: ae(),
    nodeDragStart: ae(),
    nodeDrag: ae(),
    nodeDragStop: ae(),
    nodesInitialized: ae(),
    miniMapNodeClick: ae(),
    miniMapNodeDoubleClick: ae(),
    miniMapNodeMouseEnter: ae(),
    miniMapNodeMouseMove: ae(),
    miniMapNodeMouseLeave: ae(),
    connect: ae(),
    connectStart: ae(),
    connectEnd: ae(),
    clickConnectStart: ae(),
    clickConnectEnd: ae(),
    paneReady: ae(),
    init: ae(),
    move: ae(),
    moveStart: ae(),
    moveEnd: ae(),
    selectionDragStart: ae(),
    selectionDrag: ae(),
    selectionDragStop: ae(),
    selectionContextMenu: ae(),
    selectionStart: ae(),
    selectionEnd: ae(),
    viewportChangeStart: ae(),
    viewportChange: ae(),
    viewportChangeEnd: ae(),
    paneScroll: ae(),
    paneClick: ae(),
    paneContextMenu: ae(),
    paneMouseEnter: ae(),
    paneMouseMove: ae(),
    paneMouseLeave: ae(),
    edgeContextMenu: ae(),
    edgeMouseEnter: ae(),
    edgeMouseMove: ae(),
    edgeMouseLeave: ae(),
    edgeDoubleClick: ae(),
    edgeClick: ae(),
    edgeUpdateStart: ae(),
    edgeUpdate: ae(),
    edgeUpdateEnd: ae(),
    updateNodeInternals: ae(),
    error: ae((e) => Qi(e.message))
  };
}
function EE(e, t) {
  xu(() => {
    for (const [n, o] of Object.entries(t.value)) {
      const i = (r) => {
        e(n, r);
      };
      o.fns.add(i), Yi(() => {
        o.off(i);
      });
    }
  });
}
function Dd() {
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
    selectionMode: js.Full,
    paneDragging: !1,
    preventScrolling: !0,
    zoomOnScroll: !0,
    zoomOnPinch: !0,
    zoomOnDoubleClick: !0,
    panOnScroll: !1,
    panOnScrollSpeed: 0.5,
    panOnScrollMode: wo.Free,
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
      type: bn.Bezier,
      style: {}
    },
    connectionMode: On.Loose,
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
    multiSelectionKeyCode: Oi() ? "Meta" : "Control",
    zoomActivationKeyCode: Oi() ? "Meta" : "Control",
    deleteKeyCode: "Backspace",
    panActivationKeyCode: "Space",
    hooks: wE(),
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
const xE = [
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
function kE(e, t, n) {
  const o = bE(e), i = (v) => {
    const g = v ?? [];
    e.hooks.updateNodeInternals.trigger(g);
  }, r = (v) => Yw(v, e.nodes, e.edges), s = (v) => Gw(v, e.nodes, e.edges), l = (v) => wd(v, e.edges), a = ({ id: v, type: g, nodeId: y }) => {
    var b;
    return Array.from(((b = e.connectionLookup.get(`${y}-${g}-${v ?? null}`)) == null ? void 0 : b.values()) ?? []);
  }, u = (v) => {
    if (v)
      return t.value.get(v);
  }, c = (v) => {
    if (v)
      return n.value.get(v);
  }, f = (v, g, y) => {
    var b, O;
    const L = [];
    for (const z of v) {
      const S = {
        id: z.id,
        type: "position",
        dragging: y,
        from: z.from
      };
      if (g && (S.position = z.position, z.parentNode)) {
        const K = u(z.parentNode);
        S.position = {
          x: S.position.x - (((b = K == null ? void 0 : K.computedPosition) == null ? void 0 : b.x) ?? 0),
          y: S.position.y - (((O = K == null ? void 0 : K.computedPosition) == null ? void 0 : O.y) ?? 0)
        };
      }
      L.push(S);
    }
    L != null && L.length && e.hooks.nodesChange.trigger(L);
  }, h = (v) => {
    if (!e.vueFlowRef)
      return;
    const g = e.vueFlowRef.querySelector(".vue-flow__transformationpane");
    if (!g)
      return;
    const y = window.getComputedStyle(g), { m22: b } = new window.DOMMatrixReadOnly(y.transform), O = [];
    for (let L = 0; L < v.length; ++L) {
      const z = v[L], S = u(z.id);
      if (S) {
        const K = Zi(z.nodeElement);
        if (!!(K.width && K.height && (S.dimensions.width !== K.width || S.dimensions.height !== K.height || z.forceUpdate))) {
          const te = z.nodeElement.getBoundingClientRect();
          S.dimensions = K, S.handleBounds.source = Aa(".source", z.nodeElement, te, b), S.handleBounds.target = Aa(".target", z.nodeElement, te, b), O.push({
            id: S.id,
            type: "dimensions",
            dimensions: K
          });
        }
      }
    }
    !e.fitViewOnInitDone && e.fitViewOnInit && o.value.fitView().then(() => {
      e.fitViewOnInitDone = !0;
    }), O.length && e.hooks.nodesChange.trigger(O);
  }, m = (v, g) => {
    const y = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Set();
    for (const z of v)
      Cn(z) ? y.add(z.id) : fn(z) && b.add(z.id);
    const O = on(t.value, y, !0), L = on(n.value, b);
    if (e.multiSelectionActive) {
      for (const z of y)
        O.push(Qt(z, g));
      for (const z of b)
        L.push(Qt(z, g));
    }
    O.length && e.hooks.nodesChange.trigger(O), L.length && e.hooks.edgesChange.trigger(L);
  }, C = (v) => {
    if (e.multiSelectionActive) {
      const g = v.map((y) => Qt(y.id, !0));
      e.hooks.nodesChange.trigger(g);
      return;
    }
    e.hooks.nodesChange.trigger(on(t.value, new Set(v.map((g) => g.id)), !0)), e.hooks.edgesChange.trigger(on(n.value));
  }, N = (v) => {
    if (e.multiSelectionActive) {
      const g = v.map((y) => Qt(y.id, !0));
      e.hooks.edgesChange.trigger(g);
      return;
    }
    e.hooks.edgesChange.trigger(on(n.value, new Set(v.map((g) => g.id)))), e.hooks.nodesChange.trigger(on(t.value, /* @__PURE__ */ new Set(), !0));
  }, $ = (v) => {
    m(v, !0);
  }, I = (v) => {
    const y = (v || e.nodes).map((b) => (b.selected = !1, Qt(b.id, !1)));
    e.hooks.nodesChange.trigger(y);
  }, A = (v) => {
    const y = (v || e.edges).map((b) => (b.selected = !1, Qt(b.id, !1)));
    e.hooks.edgesChange.trigger(y);
  }, k = (v) => {
    if (!v || !v.length)
      return m([], !1);
    const g = v.reduce(
      (y, b) => {
        const O = Qt(b.id, !1);
        return Cn(b) ? y.nodes.push(O) : y.edges.push(O), y;
      },
      { nodes: [], edges: [] }
    );
    g.nodes.length && e.hooks.nodesChange.trigger(g.nodes), g.edges.length && e.hooks.edgesChange.trigger(g.edges);
  }, _ = (v) => {
    var g;
    (g = e.d3Zoom) == null || g.scaleExtent([v, e.maxZoom]), e.minZoom = v;
  }, B = (v) => {
    var g;
    (g = e.d3Zoom) == null || g.scaleExtent([e.minZoom, v]), e.maxZoom = v;
  }, M = (v) => {
    var g;
    (g = e.d3Zoom) == null || g.translateExtent(v), e.translateExtent = v;
  }, E = (v) => {
    e.nodeExtent = v, i();
  }, Y = (v) => {
    var g;
    (g = e.d3Zoom) == null || g.clickDistance(v);
  }, ne = (v) => {
    e.nodesDraggable = v, e.nodesConnectable = v, e.elementsSelectable = v;
  }, G = (v) => {
    const g = v instanceof Function ? v(e.nodes) : v;
    !e.initialized && !g.length || (e.nodes = Ra(g, u, e.hooks.error.trigger));
  }, Z = (v) => {
    const g = v instanceof Function ? v(e.edges) : v;
    if (!e.initialized && !g.length)
      return;
    const y = Ir(
      g,
      e.isValidConnection,
      u,
      c,
      e.hooks.error.trigger,
      e.defaultEdgeOptions,
      e.nodes,
      e.edges
    );
    Mr(e.connectionLookup, y), e.edges = y;
  }, T = (v) => {
    const g = v instanceof Function ? v([...e.nodes, ...e.edges]) : v;
    !e.initialized && !g.length || (G(g.filter(Cn)), Z(g.filter(fn)));
  }, R = (v) => {
    let g = v instanceof Function ? v(e.nodes) : v;
    g = Array.isArray(g) ? g : [g];
    const y = Ra(g, u, e.hooks.error.trigger), b = [];
    for (const O of y)
      b.push(Na(O));
    b.length && e.hooks.nodesChange.trigger(b);
  }, w = (v) => {
    let g = v instanceof Function ? v(e.edges) : v;
    g = Array.isArray(g) ? g : [g];
    const y = Ir(
      g,
      e.isValidConnection,
      u,
      c,
      e.hooks.error.trigger,
      e.defaultEdgeOptions,
      e.nodes,
      e.edges
    ), b = [];
    for (const O of y)
      b.push(Na(O));
    b.length && e.hooks.edgesChange.trigger(b);
  }, D = (v, g = !0, y = !1) => {
    const b = v instanceof Function ? v(e.nodes) : v, O = Array.isArray(b) ? b : [b], L = [], z = [];
    function S(q) {
      const te = l(q);
      for (const se of te)
        (!Ue(se.deletable) || se.deletable) && z.push(Ma(se.id, se.source, se.target, se.sourceHandle, se.targetHandle));
    }
    function K(q) {
      const te = [];
      for (const se of e.nodes)
        se.parentNode === q && te.push(se);
      if (te.length) {
        for (const se of te)
          L.push($a(se.id));
        g && S(te);
        for (const se of te)
          K(se.id);
      }
    }
    for (const q of O) {
      const te = typeof q == "string" ? u(q) : q;
      te && (Ue(te.deletable) && !te.deletable || (L.push($a(te.id)), g && S([te]), y && K(te.id)));
    }
    z.length && e.hooks.edgesChange.trigger(z), L.length && e.hooks.nodesChange.trigger(L);
  }, P = (v) => {
    const g = v instanceof Function ? v(e.edges) : v, y = Array.isArray(g) ? g : [g], b = [];
    for (const O of y) {
      const L = typeof O == "string" ? c(O) : O;
      L && (Ue(L.deletable) && !L.deletable || b.push(
        Ma(
          typeof O == "string" ? O : O.id,
          L.source,
          L.target,
          L.sourceHandle,
          L.targetHandle
        )
      ));
    }
    e.hooks.edgesChange.trigger(b);
  }, F = (v, g, y = !0) => {
    const b = c(v.id), O = uE(v, g, b, y, e.hooks.error.trigger);
    if (O) {
      const [L] = Ir(
        [O],
        e.isValidConnection,
        u,
        c,
        e.hooks.error.trigger,
        e.defaultEdgeOptions,
        e.nodes,
        e.edges
      );
      return e.edges.splice(e.edges.indexOf(b), 1, L), Mr(e.connectionLookup, [L]), L;
    }
    return !1;
  }, X = (v, g, y = { replace: !1 }) => {
    const b = c(v);
    if (!b)
      return;
    const O = typeof g == "function" ? g(b) : g;
    b.data = y.replace ? O : { ...b.data, ...O };
  }, Q = (v) => Ca(v, e.nodes), oe = (v) => {
    const g = Ca(v, e.edges);
    return Mr(e.connectionLookup, g), g;
  }, ue = (v, g, y = { replace: !1 }) => {
    const b = u(v);
    if (!b)
      return;
    const O = typeof g == "function" ? g(b) : g;
    y.replace ? e.nodes.splice(e.nodes.indexOf(b), 1, O) : Object.assign(b, O);
  }, ee = (v, g, y = { replace: !1 }) => {
    const b = u(v);
    if (!b)
      return;
    const O = typeof g == "function" ? g(b) : g;
    b.data = y.replace ? O : { ...b.data, ...O };
  }, le = (v, g, y = !1) => {
    y ? e.connectionClickStartHandle = v : e.connectionStartHandle = v, e.connectionEndHandle = null, e.connectionStatus = null, g && (e.connectionPosition = g);
  }, j = (v, g = null, y = null) => {
    e.connectionStartHandle && (e.connectionPosition = v, e.connectionEndHandle = g, e.connectionStatus = y);
  }, ge = (v, g) => {
    e.connectionPosition = { x: Number.NaN, y: Number.NaN }, e.connectionEndHandle = null, e.connectionStatus = null, g ? e.connectionClickStartHandle = null : e.connectionStartHandle = null;
  }, _e = (v) => {
    const g = jw(v), y = g ? null : po(v) ? v : u(v.id);
    return !g && !y ? [null, null, g] : [g ? v : cs(y), y, g];
  }, ye = (v, g = !0, y = e.nodes) => {
    const [b, O, L] = _e(v);
    if (!b)
      return [];
    const z = [];
    for (const S of y || e.nodes) {
      if (!L && (S.id === O.id || !S.computedPosition))
        continue;
      const K = cs(S), q = ds(K, b);
      (g && q > 0 || q >= Number(b.width) * Number(b.height)) && z.push(S);
    }
    return z;
  }, we = (v, g, y = !0) => {
    const [b] = _e(v);
    if (!b)
      return !1;
    const O = ds(b, g);
    return y && O > 0 || O >= Number(b.width) * Number(b.height);
  }, fe = (v) => {
    const { viewport: g, dimensions: y, d3Zoom: b, d3Selection: O, translateExtent: L } = e;
    if (!b || !O || !v.x && !v.y)
      return !1;
    const z = Qn.translate(g.x + v.x, g.y + v.y).scale(g.zoom), S = [
      [0, 0],
      [y.width, y.height]
    ], K = b.constrain()(z, S, L), q = e.viewport.x !== K.x || e.viewport.y !== K.y || e.viewport.zoom !== K.k;
    return b.transform(O, K), q;
  }, pe = (v) => {
    const g = v instanceof Function ? v(e) : v, y = [
      "d3Zoom",
      "d3Selection",
      "d3ZoomHandler",
      "viewportRef",
      "vueFlowRef",
      "dimensions",
      "hooks"
    ];
    Ue(g.defaultEdgeOptions) && (e.defaultEdgeOptions = g.defaultEdgeOptions);
    const b = g.modelValue || g.nodes || g.edges ? [] : void 0;
    b && (g.modelValue && b.push(...g.modelValue), g.nodes && b.push(...g.nodes), g.edges && b.push(...g.edges), T(b));
    const O = () => {
      Ue(g.maxZoom) && B(g.maxZoom), Ue(g.minZoom) && _(g.minZoom), Ue(g.translateExtent) && M(g.translateExtent);
    };
    for (const L of Object.keys(g)) {
      const z = L, S = g[z];
      ![...xE, ...y].includes(z) && Ue(S) && (e[z] = S);
    }
    Qr(() => e.d3Zoom).not.toBeNull().then(O), e.initialized || (e.initialized = !0);
  };
  return {
    updateNodePositions: f,
    updateNodeDimensions: h,
    setElements: T,
    setNodes: G,
    setEdges: Z,
    addNodes: R,
    addEdges: w,
    removeNodes: D,
    removeEdges: P,
    findNode: u,
    findEdge: c,
    updateEdge: F,
    updateEdgeData: X,
    updateNode: ue,
    updateNodeData: ee,
    applyEdgeChanges: oe,
    applyNodeChanges: Q,
    addSelectedElements: $,
    addSelectedNodes: C,
    addSelectedEdges: N,
    setMinZoom: _,
    setMaxZoom: B,
    setTranslateExtent: M,
    setNodeExtent: E,
    setPaneClickDistance: Y,
    removeSelectedElements: k,
    removeSelectedNodes: I,
    removeSelectedEdges: A,
    startConnection: le,
    updateConnection: j,
    endConnection: ge,
    setInteractive: ne,
    setState: pe,
    getIntersectingNodes: ye,
    getIncomers: r,
    getOutgoers: s,
    getConnectedEdges: l,
    getHandleConnections: a,
    isNodeIntersecting: we,
    panBy: fe,
    fitView: (v) => o.value.fitView(v),
    zoomIn: (v) => o.value.zoomIn(v),
    zoomOut: (v) => o.value.zoomOut(v),
    zoomTo: (v, g) => o.value.zoomTo(v, g),
    setViewport: (v, g) => o.value.setViewport(v, g),
    setTransform: (v, g) => o.value.setTransform(v, g),
    getViewport: () => o.value.getViewport(),
    getTransform: () => o.value.getTransform(),
    setCenter: (v, g, y) => o.value.setCenter(v, g, y),
    fitBounds: (v, g) => o.value.fitBounds(v, g),
    project: (v) => o.value.project(v),
    screenToFlowCoordinate: (v) => o.value.screenToFlowCoordinate(v),
    flowToScreenCoordinate: (v) => o.value.flowToScreenCoordinate(v),
    toObject: () => {
      const v = [], g = [];
      for (const y of e.nodes) {
        const {
          computedPosition: b,
          handleBounds: O,
          selected: L,
          dimensions: z,
          isParent: S,
          resizing: K,
          dragging: q,
          events: te,
          ...se
        } = y;
        v.push(se);
      }
      for (const y of e.edges) {
        const { selected: b, sourceNode: O, targetNode: L, events: z, ...S } = y;
        g.push(S);
      }
      return JSON.parse(
        JSON.stringify({
          nodes: v,
          edges: g,
          position: [e.viewport.x, e.viewport.y],
          zoom: e.viewport.zoom,
          viewport: e.viewport
        })
      );
    },
    fromObject: (v) => new Promise((g) => {
      const { nodes: y, edges: b, position: O, zoom: L, viewport: z } = v;
      if (y && G(y), b && Z(b), z != null && z.x && (z != null && z.y) || O) {
        const S = (z == null ? void 0 : z.x) || O[0], K = (z == null ? void 0 : z.y) || O[1], q = (z == null ? void 0 : z.zoom) || L || e.viewport.zoom;
        return Qr(() => o.value.viewportInitialized).toBe(!0).then(() => {
          o.value.setViewport({
            x: S,
            y: K,
            zoom: q
          }).then(() => {
            g(!0);
          });
        });
      } else
        g(!0);
    }),
    updateNodeInternals: i,
    viewportHelper: o,
    $reset: () => {
      const v = Dd();
      if (e.edges = [], e.nodes = [], e.d3Zoom && e.d3Selection) {
        const g = Qn.translate(v.defaultViewport.x ?? 0, v.defaultViewport.y ?? 0).scale(Tn(v.defaultViewport.zoom ?? 1, v.minZoom, v.maxZoom)), y = e.viewportRef.getBoundingClientRect(), b = [
          [0, 0],
          [y.width, y.height]
        ], O = e.d3Zoom.constrain()(g, b, v.translateExtent);
        e.d3Zoom.transform(e.d3Selection, O);
      }
      pe(v);
    },
    $destroy: () => {
    }
  };
}
const SE = ["data-id", "data-handleid", "data-nodeid", "data-handlepos"], CE = {
  name: "Handle",
  compatConfig: { MODE: 3 }
}, cn = /* @__PURE__ */ Te({
  ...CE,
  props: {
    id: { default: null },
    type: {},
    position: { default: () => de.Top },
    isValidConnection: { type: Function },
    connectable: { type: [Boolean, Number, String, Function], default: void 0 },
    connectableStart: { type: Boolean, default: !0 },
    connectableEnd: { type: Boolean, default: !0 }
  },
  setup(e, { expose: t }) {
    const n = Ou(e, ["position", "connectable", "connectableStart", "connectableEnd", "id"]), o = ze(() => n.type ?? "source"), i = ze(() => n.isValidConnection ?? null), {
      connectionStartHandle: r,
      connectionClickStartHandle: s,
      connectionEndHandle: l,
      vueFlowRef: a,
      nodesConnectable: u,
      noDragClassName: c,
      noPanClassName: f
    } = Be(), { id: h, node: m, nodeEl: C, connectedEdges: N } = Td(), $ = re(), I = ze(() => typeof e.connectableStart < "u" ? e.connectableStart : !0), A = ze(() => typeof e.connectableEnd < "u" ? e.connectableEnd : !0), k = ze(
      () => {
        var G, Z, T, R, w, D;
        return ((G = r.value) == null ? void 0 : G.nodeId) === h && ((Z = r.value) == null ? void 0 : Z.handleId) === e.id && ((T = r.value) == null ? void 0 : T.type) === o.value || ((R = l.value) == null ? void 0 : R.nodeId) === h && ((w = l.value) == null ? void 0 : w.handleId) === e.id && ((D = l.value) == null ? void 0 : D.type) === o.value;
      }
    ), _ = ze(
      () => {
        var G, Z, T;
        return ((G = s.value) == null ? void 0 : G.nodeId) === h && ((Z = s.value) == null ? void 0 : Z.handleId) === e.id && ((T = s.value) == null ? void 0 : T.type) === o.value;
      }
    ), { handlePointerDown: B, handleClick: M } = Od({
      nodeId: h,
      handleId: e.id,
      isValidConnection: i,
      type: o
    }), E = ce(() => typeof e.connectable == "string" && e.connectable === "single" ? !N.value.some((G) => {
      const Z = G[`${o.value}Handle`];
      return G[o.value] !== h ? !1 : Z ? Z === e.id : !0;
    }) : typeof e.connectable == "number" ? N.value.filter((G) => {
      const Z = G[`${o.value}Handle`];
      return G[o.value] !== h ? !1 : Z ? Z === e.id : !0;
    }).length < e.connectable : typeof e.connectable == "function" ? e.connectable(m, N.value) : Ue(e.connectable) ? e.connectable : u.value);
    mt(() => {
      var G;
      if (!m.dimensions.width || !m.dimensions.height)
        return;
      const Z = (G = m.handleBounds[o.value]) == null ? void 0 : G.find((X) => X.id === e.id);
      if (!a.value || Z)
        return;
      const T = a.value.querySelector(".vue-flow__transformationpane");
      if (!C.value || !$.value || !T || !e.id)
        return;
      const R = C.value.getBoundingClientRect(), w = $.value.getBoundingClientRect(), D = window.getComputedStyle(T), { m22: P } = new window.DOMMatrixReadOnly(D.transform), F = {
        id: e.id,
        position: e.position,
        x: (w.left - R.left) / P,
        y: (w.top - R.top) / P,
        ...Zi($.value)
      };
      m.handleBounds[o.value] = [...m.handleBounds[o.value] ?? [], F];
    }), Bi(() => {
      const G = m.handleBounds[o.value];
      G && (m.handleBounds[o.value] = G.filter((Z) => Z.id !== e.id));
    });
    function Y(G) {
      const Z = Gs(G);
      E.value && I.value && (Z && G.button === 0 || !Z) && B(G);
    }
    function ne(G) {
      !h || !s.value && !I.value || E.value && M(G);
    }
    return t({
      handleClick: M,
      handlePointerDown: B,
      onClick: ne,
      onPointerDown: Y
    }), (G, Z) => (U(), W("div", {
      ref_key: "handle",
      ref: $,
      "data-id": `${V(h)}-${e.id}-${o.value}`,
      "data-handleid": e.id,
      "data-nodeid": V(h),
      "data-handlepos": G.position,
      class: xe(["vue-flow__handle", [
        `vue-flow__handle-${G.position}`,
        `vue-flow__handle-${e.id}`,
        V(c),
        V(f),
        o.value,
        {
          connectable: E.value,
          connecting: _.value,
          connectablestart: I.value,
          connectableend: A.value,
          connectionindicator: E.value && (I.value && !k.value || A.value && k.value)
        }
      ]]),
      onMousedown: Y,
      onTouchstartPassive: Y,
      onClick: ne
    }, [
      $n(G.$slots, "default", { id: G.id })
    ], 42, SE));
  }
}), tr = function({
  sourcePosition: e = de.Bottom,
  targetPosition: t = de.Top,
  label: n,
  connectable: o = !0,
  isValidTargetPos: i,
  isValidSourcePos: r,
  data: s
}) {
  const l = s.label || n;
  return [
    Ie(cn, { type: "target", position: t, connectable: o, isValidConnection: i }),
    typeof l != "string" && l ? Ie(l) : Ie(me, [l]),
    Ie(cn, { type: "source", position: e, connectable: o, isValidConnection: r })
  ];
};
tr.props = ["sourcePosition", "targetPosition", "label", "isValidTargetPos", "isValidSourcePos", "connectable", "data"];
tr.inheritAttrs = !1;
tr.compatConfig = { MODE: 3 };
const NE = tr, nr = function({
  targetPosition: e = de.Top,
  label: t,
  connectable: n = !0,
  isValidTargetPos: o,
  data: i
}) {
  const r = i.label || t;
  return [
    Ie(cn, { type: "target", position: e, connectable: n, isValidConnection: o }),
    typeof r != "string" && r ? Ie(r) : Ie(me, [r])
  ];
};
nr.props = ["targetPosition", "label", "isValidTargetPos", "connectable", "data"];
nr.inheritAttrs = !1;
nr.compatConfig = { MODE: 3 };
const $E = nr, or = function({
  sourcePosition: e = de.Bottom,
  label: t,
  connectable: n = !0,
  isValidSourcePos: o,
  data: i
}) {
  const r = i.label || t;
  return [
    typeof r != "string" && r ? Ie(r) : Ie(me, [r]),
    Ie(cn, { type: "source", position: e, connectable: n, isValidConnection: o })
  ];
};
or.props = ["sourcePosition", "label", "isValidSourcePos", "connectable", "data"];
or.inheritAttrs = !1;
or.compatConfig = { MODE: 3 };
const ME = or, IE = ["transform"], OE = ["width", "height", "x", "y", "rx", "ry"], TE = ["y"], PE = {
  name: "EdgeText",
  compatConfig: { MODE: 3 }
}, DE = /* @__PURE__ */ Te({
  ...PE,
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
    const t = re({ x: 0, y: 0, width: 0, height: 0 }), n = re(null), o = ce(() => `translate(${e.x - t.value.width / 2} ${e.y - t.value.height / 2})`);
    mt(i), ke([() => e.x, () => e.y, n, () => e.label], i);
    function i() {
      if (!n.value)
        return;
      const r = n.value.getBBox();
      (r.width !== t.value.width || r.height !== t.value.height) && (t.value = r);
    }
    return (r, s) => (U(), W("g", {
      transform: o.value,
      class: "vue-flow__edge-textwrapper"
    }, [
      r.labelShowBg ? (U(), W("rect", {
        key: 0,
        class: "vue-flow__edge-textbg",
        width: `${t.value.width + 2 * r.labelBgPadding[0]}px`,
        height: `${t.value.height + 2 * r.labelBgPadding[1]}px`,
        x: -r.labelBgPadding[0],
        y: -r.labelBgPadding[1],
        style: ft(r.labelBgStyle),
        rx: r.labelBgBorderRadius,
        ry: r.labelBgBorderRadius
      }, null, 12, OE)) : Se("", !0),
      p("text", Os(r.$attrs, {
        ref_key: "el",
        ref: n,
        class: "vue-flow__edge-text",
        y: t.value.height / 2,
        dy: "0.3em",
        style: r.labelStyle
      }), [
        $n(r.$slots, "default", {}, () => [
          typeof r.label != "string" ? (U(), vt(Nu(r.label), { key: 0 })) : (U(), W(me, { key: 1 }, [
            Le(J(r.label), 1)
          ], 64))
        ])
      ], 16, TE)
    ], 8, IE));
  }
}), AE = ["id", "d", "marker-end", "marker-start"], RE = ["d", "stroke-width"], LE = {
  name: "BaseEdge",
  inheritAttrs: !1,
  compatConfig: { MODE: 3 }
}, jo = /* @__PURE__ */ Te({
  ...LE,
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
    const n = Ou(e, ["interactionWidth", "labelShowBg"]), o = re(null), i = re(null), r = re(null), s = Zf();
    return t({
      pathEl: o,
      interactionEl: i,
      labelEl: r
    }), (l, a) => (U(), W(me, null, [
      p("path", {
        id: l.id,
        ref_key: "pathEl",
        ref: o,
        d: l.path,
        style: ft(n.style),
        class: xe(["vue-flow__edge-path", V(s).class]),
        "marker-end": l.markerEnd,
        "marker-start": l.markerStart
      }, null, 14, AE),
      l.interactionWidth ? (U(), W("path", {
        key: 0,
        ref_key: "interactionEl",
        ref: i,
        fill: "none",
        d: l.path,
        "stroke-width": l.interactionWidth,
        "stroke-opacity": 0,
        class: "vue-flow__edge-interaction"
      }, null, 8, RE)) : Se("", !0),
      l.label && l.labelX && l.labelY ? (U(), vt(DE, {
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
      }, null, 8, ["x", "y", "label", "label-show-bg", "label-bg-style", "label-bg-padding", "label-bg-border-radius", "label-style"])) : Se("", !0)
    ], 64));
  }
});
function Ad({
  sourceX: e,
  sourceY: t,
  targetX: n,
  targetY: o
}) {
  const i = Math.abs(n - e) / 2, r = n < e ? n + i : n - i, s = Math.abs(o - t) / 2, l = o < t ? o + s : o - s;
  return [r, l, i, s];
}
function Rd({
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
function ni(e, t) {
  return e >= 0 ? 0.5 * e : t * 25 * Math.sqrt(-e);
}
function Va({ pos: e, x1: t, y1: n, x2: o, y2: i, c: r }) {
  let s, l;
  switch (e) {
    case de.Left:
      s = t - ni(t - o, r), l = n;
      break;
    case de.Right:
      s = t + ni(o - t, r), l = n;
      break;
    case de.Top:
      s = t, l = n - ni(n - i, r);
      break;
    case de.Bottom:
      s = t, l = n + ni(i - n, r);
      break;
  }
  return [s, l];
}
function Ld(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: o = de.Bottom,
    targetX: i,
    targetY: r,
    targetPosition: s = de.Top,
    curvature: l = 0.25
  } = e, [a, u] = Va({
    pos: o,
    x1: t,
    y1: n,
    x2: i,
    y2: r,
    c: l
  }), [c, f] = Va({
    pos: s,
    x1: i,
    y1: r,
    x2: t,
    y2: n,
    c: l
  }), [h, m, C, N] = Rd({
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
    h,
    m,
    C,
    N
  ];
}
function za({ pos: e, x1: t, y1: n, x2: o, y2: i }) {
  let r, s;
  switch (e) {
    case de.Left:
    case de.Right:
      r = 0.5 * (t + o), s = n;
      break;
    case de.Top:
    case de.Bottom:
      r = t, s = 0.5 * (n + i);
      break;
  }
  return [r, s];
}
function Vd(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: o = de.Bottom,
    targetX: i,
    targetY: r,
    targetPosition: s = de.Top
  } = e, [l, a] = za({
    pos: o,
    x1: t,
    y1: n,
    x2: i,
    y2: r
  }), [u, c] = za({
    pos: s,
    x1: i,
    y1: r,
    x2: t,
    y2: n
  }), [f, h, m, C] = Rd({
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
    h,
    m,
    C
  ];
}
const Ba = {
  [de.Left]: { x: -1, y: 0 },
  [de.Right]: { x: 1, y: 0 },
  [de.Top]: { x: 0, y: -1 },
  [de.Bottom]: { x: 0, y: 1 }
};
function VE({
  source: e,
  sourcePosition: t = de.Bottom,
  target: n
}) {
  return t === de.Left || t === de.Right ? e.x < n.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : e.y < n.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
}
function Fa(e, t) {
  return Math.sqrt((t.x - e.x) ** 2 + (t.y - e.y) ** 2);
}
function zE({
  source: e,
  sourcePosition: t = de.Bottom,
  target: n,
  targetPosition: o = de.Top,
  center: i,
  offset: r
}) {
  const s = Ba[t], l = Ba[o], a = { x: e.x + s.x * r, y: e.y + s.y * r }, u = { x: n.x + l.x * r, y: n.y + l.y * r }, c = VE({
    source: a,
    sourcePosition: t,
    target: u
  }), f = c.x !== 0 ? "x" : "y", h = c[f];
  let m, C, N;
  const $ = { x: 0, y: 0 }, I = { x: 0, y: 0 }, [A, k, _, B] = Ad({
    sourceX: e.x,
    sourceY: e.y,
    targetX: n.x,
    targetY: n.y
  });
  if (s[f] * l[f] === -1) {
    C = i.x ?? A, N = i.y ?? k;
    const E = [
      { x: C, y: a.y },
      { x: C, y: u.y }
    ], Y = [
      { x: a.x, y: N },
      { x: u.x, y: N }
    ];
    s[f] === h ? m = f === "x" ? E : Y : m = f === "x" ? Y : E;
  } else {
    const E = [{ x: a.x, y: u.y }], Y = [{ x: u.x, y: a.y }];
    if (f === "x" ? m = s.x === h ? Y : E : m = s.y === h ? E : Y, t === o) {
      const R = Math.abs(e[f] - n[f]);
      if (R <= r) {
        const w = Math.min(r - 1, r - R);
        s[f] === h ? $[f] = (a[f] > e[f] ? -1 : 1) * w : I[f] = (u[f] > n[f] ? -1 : 1) * w;
      }
    }
    if (t !== o) {
      const R = f === "x" ? "y" : "x", w = s[f] === l[R], D = a[R] > u[R], P = a[R] < u[R];
      (s[f] === 1 && (!w && D || w && P) || s[f] !== 1 && (!w && P || w && D)) && (m = f === "x" ? E : Y);
    }
    const ne = { x: a.x + $.x, y: a.y + $.y }, G = { x: u.x + I.x, y: u.y + I.y }, Z = Math.max(Math.abs(ne.x - m[0].x), Math.abs(G.x - m[0].x)), T = Math.max(Math.abs(ne.y - m[0].y), Math.abs(G.y - m[0].y));
    Z >= T ? (C = (ne.x + G.x) / 2, N = m[0].y) : (C = m[0].x, N = (ne.y + G.y) / 2);
  }
  return [[
    e,
    { x: a.x + $.x, y: a.y + $.y },
    ...m,
    { x: u.x + I.x, y: u.y + I.y },
    n
  ], C, N, _, B];
}
function BE(e, t, n, o) {
  const i = Math.min(Fa(e, t) / 2, Fa(t, n) / 2, o), { x: r, y: s } = t;
  if (e.x === r && r === n.x || e.y === s && s === n.y)
    return `L${r} ${s}`;
  if (e.y === s) {
    const u = e.x < n.x ? -1 : 1, c = e.y < n.y ? 1 : -1;
    return `L ${r + i * u},${s}Q ${r},${s} ${r},${s + i * c}`;
  }
  const l = e.x < n.x ? 1 : -1, a = e.y < n.y ? -1 : 1;
  return `L ${r},${s + i * a}Q ${r},${s} ${r + i * l},${s}`;
}
function hs(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: o = de.Bottom,
    targetX: i,
    targetY: r,
    targetPosition: s = de.Top,
    borderRadius: l = 5,
    centerX: a,
    centerY: u,
    offset: c = 20
  } = e, [f, h, m, C, N] = zE({
    source: { x: t, y: n },
    sourcePosition: o,
    target: { x: i, y: r },
    targetPosition: s,
    center: { x: a, y: u },
    offset: c
  });
  return [f.reduce((I, A, k) => {
    let _;
    return k > 0 && k < f.length - 1 ? _ = BE(f[k - 1], A, f[k + 1], l) : _ = `${k === 0 ? "M" : "L"}${A.x} ${A.y}`, I += _, I;
  }, ""), h, m, C, N];
}
function FE(e) {
  const { sourceX: t, sourceY: n, targetX: o, targetY: i } = e, [r, s, l, a] = Ad({
    sourceX: t,
    sourceY: n,
    targetX: o,
    targetY: i
  });
  return [`M ${t},${n}L ${o},${i}`, r, s, l, a];
}
const HE = /* @__PURE__ */ Te({
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
      const [n, o, i] = FE(e);
      return Ie(jo, {
        path: n,
        labelX: o,
        labelY: i,
        ...t,
        ...e
      });
    };
  }
}), jE = HE, UE = /* @__PURE__ */ Te({
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
      const [n, o, i] = hs({
        ...e,
        sourcePosition: e.sourcePosition ?? de.Bottom,
        targetPosition: e.targetPosition ?? de.Top
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
}), zd = UE, GE = /* @__PURE__ */ Te({
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
    return () => Ie(zd, { ...e, ...t, borderRadius: 0 });
  }
}), YE = GE, XE = /* @__PURE__ */ Te({
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
      const [n, o, i] = Ld({
        ...e,
        sourcePosition: e.sourcePosition ?? de.Bottom,
        targetPosition: e.targetPosition ?? de.Top
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
}), WE = XE, qE = /* @__PURE__ */ Te({
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
      const [n, o, i] = Vd({
        ...e,
        sourcePosition: e.sourcePosition ?? de.Bottom,
        targetPosition: e.targetPosition ?? de.Top
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
}), KE = qE, ZE = {
  input: ME,
  default: NE,
  output: $E
}, JE = {
  default: WE,
  straight: jE,
  step: YE,
  smoothstep: zd,
  simplebezier: KE
};
function QE(e, t, n) {
  const o = ce(() => (N) => t.value.get(N)), i = ce(() => (N) => n.value.get(N)), r = ce(() => {
    const N = {
      ...JE,
      ...e.edgeTypes
    }, $ = Object.keys(N);
    for (const I of e.edges)
      I.type && !$.includes(I.type) && (N[I.type] = I.type);
    return N;
  }), s = ce(() => {
    const N = {
      ...ZE,
      ...e.nodeTypes
    }, $ = Object.keys(N);
    for (const I of e.nodes)
      I.type && !$.includes(I.type) && (N[I.type] = I.type);
    return N;
  }), l = ce(() => e.onlyRenderVisibleElements ? _d(
    e.nodes,
    {
      x: 0,
      y: 0,
      width: e.dimensions.width,
      height: e.dimensions.height
    },
    e.viewport,
    !0
  ) : e.nodes), a = ce(() => {
    if (e.onlyRenderVisibleElements) {
      const N = [];
      for (const $ of e.edges) {
        const I = t.value.get($.source), A = t.value.get($.target);
        tE({
          sourcePos: I.computedPosition || { x: 0, y: 0 },
          targetPos: A.computedPosition || { x: 0, y: 0 },
          sourceWidth: I.dimensions.width,
          sourceHeight: I.dimensions.height,
          targetWidth: A.dimensions.width,
          targetHeight: A.dimensions.height,
          width: e.dimensions.width,
          height: e.dimensions.height,
          viewport: e.viewport
        }) && N.push($);
      }
      return N;
    }
    return e.edges;
  }), u = ce(() => [...l.value, ...a.value]), c = ce(() => {
    const N = [];
    for (const $ of e.nodes)
      $.selected && N.push($);
    return N;
  }), f = ce(() => {
    const N = [];
    for (const $ of e.edges)
      $.selected && N.push($);
    return N;
  }), h = ce(() => [
    ...c.value,
    ...f.value
  ]), m = ce(() => {
    const N = [];
    for (const $ of e.nodes)
      $.dimensions.width && $.dimensions.height && $.handleBounds !== void 0 && N.push($);
    return N;
  }), C = ce(
    () => l.value.length > 0 && m.value.length === l.value.length
  );
  return {
    getNode: o,
    getEdge: i,
    getElements: u,
    getEdgeTypes: r,
    getNodeTypes: s,
    getEdges: a,
    getNodes: l,
    getSelectedElements: h,
    getSelectedNodes: c,
    getSelectedEdges: f,
    getNodesInitialized: m,
    areNodesInitialized: C
  };
}
class _n {
  constructor() {
    this.currentId = 0, this.flows = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    var t;
    const n = (t = to()) == null ? void 0 : t.appContext.app, o = (n == null ? void 0 : n.config.globalProperties.$vueFlowStorage) ?? _n.instance;
    return _n.instance = o ?? new _n(), n && (n.config.globalProperties.$vueFlowStorage = _n.instance), _n.instance;
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
    const o = Dd(), i = xn(o), r = {};
    for (const [h, m] of Object.entries(i.hooks)) {
      const C = `on${h.charAt(0).toUpperCase() + h.slice(1)}`;
      r[C] = m.on;
    }
    const s = {};
    for (const [h, m] of Object.entries(i.hooks))
      s[h] = m.trigger;
    const l = ce(() => {
      const h = /* @__PURE__ */ new Map();
      for (const m of i.nodes)
        h.set(m.id, m);
      return h;
    }), a = ce(() => {
      const h = /* @__PURE__ */ new Map();
      for (const m of i.edges)
        h.set(m.id, m);
      return h;
    }), u = QE(i, l, a), c = kE(i, l, a);
    c.setState({ ...i, ...n });
    const f = {
      ...r,
      ...u,
      ...c,
      ...o1(i),
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
  const t = _n.getInstance(), n = bs(), o = typeof e == "object", i = o ? e : { id: e }, r = i.id, s = r ?? (n == null ? void 0 : n.vueFlowId);
  let l;
  if (n) {
    const a = At(La, null);
    typeof a < "u" && a !== null && (!s || a.id === s) && (l = a);
  }
  if (l || s && (l = t.get(s)), !l || s && l.id !== s) {
    const a = r ?? t.getId(), u = t.create(a, i);
    l = u, (n ?? Ja(!0)).run(() => {
      ke(
        u.applyDefault,
        (f, h, m) => {
          const C = ($) => {
            u.applyNodeChanges($);
          }, N = ($) => {
            u.applyEdgeChanges($);
          };
          f ? (u.onNodesChange(C), u.onEdgesChange(N)) : (u.hooks.value.nodesChange.off(C), u.hooks.value.edgesChange.off(N)), m(() => {
            u.hooks.value.nodesChange.off(C), u.hooks.value.edgesChange.off(N);
          });
        },
        { immediate: !0 }
      ), Yi(() => {
        if (l) {
          const f = t.get(l.id);
          f ? f.$destroy() : Qi(`No store instance found for id ${l.id} in storage.`);
        }
      });
    });
  } else
    o && l.setState(i);
  if (n && (Mn(La, l), n.vueFlowId = l.id), o) {
    const a = to();
    (a == null ? void 0 : a.type.name) !== "VueFlow" && l.emits.error(new We(Ge.USEVUEFLOW_OPTIONS));
  }
  return l;
}
function ex(e) {
  const { emits: t, dimensions: n } = Be();
  let o;
  mt(() => {
    const i = e.value, r = () => {
      if (!i)
        return;
      const s = Zi(i);
      (s.width === 0 || s.height === 0) && t.error(new We(Ge.MISSING_VIEWPORT_DIMENSIONS)), n.value = { width: s.width || 500, height: s.height || 500 };
    };
    r(), window.addEventListener("resize", r), i && (o = new ResizeObserver(() => r()), o.observe(i)), Dn(() => {
      window.removeEventListener("resize", r), o && i && o.unobserve(i);
    });
  });
}
const tx = {
  name: "UserSelection",
  compatConfig: { MODE: 3 }
}, nx = /* @__PURE__ */ Te({
  ...tx,
  props: {
    userSelectionRect: {}
  },
  setup(e) {
    return (t, n) => (U(), W("div", {
      class: "vue-flow__selection vue-flow__container",
      style: ft({
        width: `${t.userSelectionRect.width}px`,
        height: `${t.userSelectionRect.height}px`,
        transform: `translate(${t.userSelectionRect.x}px, ${t.userSelectionRect.y}px)`
      })
    }, null, 4));
  }
}), ox = ["tabIndex"], ix = {
  name: "NodesSelection",
  compatConfig: { MODE: 3 }
}, rx = /* @__PURE__ */ Te({
  ...ix,
  setup(e) {
    const { emits: t, viewport: n, getSelectedNodes: o, noPanClassName: i, disableKeyboardA11y: r, userSelectionActive: s } = Be(), l = Pd(), a = re(null), u = Id({
      el: a,
      onStart(C) {
        t.selectionDragStart(C);
      },
      onDrag(C) {
        t.selectionDrag(C);
      },
      onStop(C) {
        t.selectionDragStop(C);
      }
    });
    mt(() => {
      var C;
      r.value || (C = a.value) == null || C.focus({ preventScroll: !0 });
    });
    const c = ce(() => bd(o.value)), f = ce(() => ({
      width: `${c.value.width}px`,
      height: `${c.value.height}px`,
      top: `${c.value.y}px`,
      left: `${c.value.x}px`
    }));
    function h(C) {
      t.selectionContextMenu({ event: C, nodes: o.value });
    }
    function m(C) {
      r || Xn[C.key] && (C.preventDefault(), l(
        {
          x: Xn[C.key].x,
          y: Xn[C.key].y
        },
        C.shiftKey
      ));
    }
    return (C, N) => !V(s) && c.value.width && c.value.height ? (U(), W("div", {
      key: 0,
      class: xe(["vue-flow__nodesselection vue-flow__container", V(i)]),
      style: ft({ transform: `translate(${V(n).x}px,${V(n).y}px) scale(${V(n).zoom})` })
    }, [
      p("div", {
        ref_key: "el",
        ref: a,
        class: xe([{ dragging: V(u) }, "vue-flow__nodesselection-rect"]),
        style: ft(f.value),
        tabIndex: V(r) ? void 0 : -1,
        onContextmenu: h,
        onKeydown: m
      }, null, 46, ox)
    ], 6)) : Se("", !0);
  }
});
function sx(e, t) {
  return {
    x: e.clientX - t.left,
    y: e.clientY - t.top
  };
}
const lx = {
  name: "Pane",
  compatConfig: { MODE: 3 }
}, ax = /* @__PURE__ */ Te({
  ...lx,
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
      removeNodes: h,
      removeEdges: m,
      selectionMode: C,
      deleteKeyCode: N,
      multiSelectionKeyCode: $,
      multiSelectionActive: I,
      edgeLookup: A,
      nodeLookup: k
    } = Be(), _ = re(null), B = re(0), M = re(0), E = re(), Y = re(/* @__PURE__ */ new Map()), ne = ze(() => a.value && (e.isSelecting || r.value));
    let G = !1, Z = !1;
    const T = Eo(N, { actInsideInputWithModifier: !1 }), R = Eo($);
    ke(T, (ee) => {
      ee && (h(f.value), m(c.value), u.value = !1);
    }), ke(R, (ee) => {
      I.value = ee;
    });
    function w(ee, le) {
      return (j) => {
        j.target === le && (ee == null || ee(j));
      };
    }
    function D() {
      r.value = !1, l.value = null, B.value = 0, M.value = 0;
    }
    function P(ee) {
      if (G) {
        G = !1;
        return;
      }
      i.paneClick(ee), s(), u.value = !1;
    }
    function F(ee) {
      ee.preventDefault(), ee.stopPropagation(), i.paneContextMenu(ee);
    }
    function X(ee) {
      i.paneScroll(ee);
    }
    function Q(ee) {
      var le, j, ge, _e, ye;
      if (E.value = (le = t.value) == null ? void 0 : le.getBoundingClientRect(), !a.value || !e.isSelecting || ee.button !== 0 || ee.target !== _.value || !E.value)
        return;
      (ge = (j = ee.target) == null ? void 0 : j.setPointerCapture) == null || ge.call(j, ee.pointerId);
      const { x: we, y: fe } = sx(ee, E.value);
      Z = !0, G = !1, Y.value = /* @__PURE__ */ new Map();
      for (const [pe, H] of A.value)
        Y.value.set(H.source, ((_e = Y.value.get(H.source)) == null ? void 0 : _e.add(pe)) || /* @__PURE__ */ new Set([pe])), Y.value.set(H.target, ((ye = Y.value.get(H.target)) == null ? void 0 : ye.add(pe)) || /* @__PURE__ */ new Set([pe]));
      s(), l.value = {
        width: 0,
        height: 0,
        startX: we,
        startY: fe,
        x: we,
        y: fe
      }, i.selectionStart(ee);
    }
    function oe(ee) {
      if (!E.value || !l.value)
        return;
      G = !0;
      const { x: le, y: j } = qt(ee, E.value), { startX: ge = 0, startY: _e = 0 } = l.value, ye = {
        startX: ge,
        startY: _e,
        x: le < ge ? le : ge,
        y: j < _e ? j : _e,
        width: Math.abs(le - ge),
        height: Math.abs(j - _e)
      }, we = _d(
        n.value,
        ye,
        o.value,
        C.value === js.Partial,
        !0
      ), fe = /* @__PURE__ */ new Set(), pe = /* @__PURE__ */ new Set();
      for (const H of we) {
        pe.add(H.id);
        const d = Y.value.get(H.id);
        if (d)
          for (const x of d)
            fe.add(x);
      }
      if (B.value !== pe.size) {
        B.value = pe.size;
        const H = on(k.value, pe, !0);
        i.nodesChange(H);
      }
      if (M.value !== fe.size) {
        M.value = fe.size;
        const H = on(A.value, fe);
        i.edgesChange(H);
      }
      l.value = ye, r.value = !0, u.value = !1;
    }
    function ue(ee) {
      var le;
      ee.button !== 0 || !Z || ((le = ee.target) == null || le.releasePointerCapture(ee.pointerId), !r.value && l.value && ee.target === _.value && P(ee), B.value > 0 && (u.value = !0), D(), i.selectionEnd(ee), e.selectionKeyPressed && (G = !1), Z = !1);
    }
    return (ee, le) => (U(), W("div", {
      ref_key: "container",
      ref: _,
      class: xe(["vue-flow__pane vue-flow__container", { selection: ee.isSelecting }]),
      onClick: le[0] || (le[0] = (j) => ne.value ? void 0 : w(P, _.value)(j)),
      onContextmenu: le[1] || (le[1] = (j) => w(F, _.value)(j)),
      onWheelPassive: le[2] || (le[2] = (j) => w(X, _.value)(j)),
      onPointerenter: le[3] || (le[3] = (j) => ne.value ? void 0 : V(i).paneMouseEnter(j)),
      onPointerdown: le[4] || (le[4] = (j) => ne.value ? Q(j) : V(i).paneMouseMove(j)),
      onPointermove: le[5] || (le[5] = (j) => ne.value ? oe(j) : V(i).paneMouseMove(j)),
      onPointerup: le[6] || (le[6] = (j) => ne.value ? ue(j) : void 0),
      onPointerleave: le[7] || (le[7] = (j) => V(i).paneMouseLeave(j))
    }, [
      $n(ee.$slots, "default"),
      V(r) && V(l) ? (U(), vt(nx, {
        key: 0,
        "user-selection-rect": V(l)
      }, null, 8, ["user-selection-rect"])) : Se("", !0),
      V(u) && V(f).length ? (U(), vt(rx, { key: 1 })) : Se("", !0)
    ], 34));
  }
}), ux = {
  name: "Transform",
  compatConfig: { MODE: 3 }
}, cx = /* @__PURE__ */ Te({
  ...ux,
  setup(e) {
    const { viewport: t, fitViewOnInit: n, fitViewOnInitDone: o } = Be(), i = ce(() => n.value ? !o.value : !1), r = ce(() => `translate(${t.value.x}px,${t.value.y}px) scale(${t.value.zoom})`);
    return (s, l) => (U(), W("div", {
      class: "vue-flow__transformationpane vue-flow__container",
      style: ft({ transform: r.value, opacity: i.value ? 0 : void 0 })
    }, [
      $n(s.$slots, "default")
    ], 4));
  }
}), dx = {
  name: "Viewport",
  compatConfig: { MODE: 3 }
}, fx = /* @__PURE__ */ Te({
  ...dx,
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
      zoomOnDoubleClick: h,
      zoomOnPinch: m,
      zoomOnScroll: C,
      preventScrolling: N,
      noWheelClassName: $,
      noPanClassName: I,
      emits: A,
      connectionStartHandle: k,
      userSelectionActive: _,
      paneDragging: B,
      d3Zoom: M,
      d3Selection: E,
      d3ZoomHandler: Y,
      viewport: ne,
      viewportRef: G,
      paneClickDistance: Z
    } = Be();
    ex(G);
    const T = re(!1), R = re(!1);
    let w = null, D = !1, P = 0, F = {
      x: 0,
      y: 0,
      zoom: 0
    };
    const X = Eo(l), Q = Eo(s), oe = Eo(r), ue = ze(
      () => (!Q.value || Q.value && s.value === !0) && (X.value || f.value)
    ), ee = ze(() => X.value || a.value), le = ze(() => Q.value || s.value === !0 && ue.value !== !0);
    mt(() => {
      if (!G.value) {
        Qi("Viewport element is missing");
        return;
      }
      const fe = G.value, pe = fe.getBoundingClientRect(), H = Vw().clickDistance(Z.value).scaleExtent([t.value, n.value]).translateExtent(i.value), d = wt(fe).call(H), x = d.on("wheel.zoom"), v = Qn.translate(o.value.x ?? 0, o.value.y ?? 0).scale(Tn(o.value.zoom ?? 1, t.value, n.value)), g = [
        [0, 0],
        [pe.width, pe.height]
      ], y = H.constrain()(v, g, i.value);
      H.transform(d, y), H.wheelDelta(ge), M.value = H, E.value = d, Y.value = x, ne.value = { x: y.x, y: y.y, zoom: y.k }, H.on("start", (b) => {
        var O;
        if (!b.sourceEvent)
          return null;
        P = b.sourceEvent.button, T.value = !0;
        const L = ye(b.transform);
        ((O = b.sourceEvent) == null ? void 0 : O.type) === "mousedown" && (B.value = !0), F = L, A.viewportChangeStart(L), A.moveStart({ event: b, flowTransform: L });
      }), H.on("end", (b) => {
        if (!b.sourceEvent)
          return null;
        if (T.value = !1, B.value = !1, j(ue.value, P ?? 0) && !D && A.paneContextMenu(b.sourceEvent), D = !1, _e(F, b.transform)) {
          const O = ye(b.transform);
          F = O, A.viewportChangeEnd(O), A.moveEnd({ event: b, flowTransform: O });
        }
      }), H.filter((b) => {
        var O;
        const L = oe.value || C.value, z = m.value && b.ctrlKey, S = b.button;
        if (S === 1 && b.type === "mousedown" && (we(b, "vue-flow__node") || we(b, "vue-flow__edge")))
          return !0;
        if (!ue.value && !L && !ee.value && !h.value && !m.value || _.value || !h.value && b.type === "dblclick" || we(b, $.value) && b.type === "wheel" || we(b, I.value) && (b.type !== "wheel" || ee.value && b.type === "wheel" && !oe.value) || !m.value && b.ctrlKey && b.type === "wheel" || !L && !ee.value && !z && b.type === "wheel")
          return !1;
        if (!m && b.type === "touchstart" && ((O = b.touches) == null ? void 0 : O.length) > 1)
          return b.preventDefault(), !1;
        if (!ue.value && (b.type === "mousedown" || b.type === "touchstart") || s.value === !0 && Array.isArray(f.value) && f.value.includes(0) && S === 0 || Array.isArray(f.value) && !f.value.includes(S) && (b.type === "mousedown" || b.type === "touchstart"))
          return !1;
        const K = Array.isArray(f.value) && f.value.includes(S) || s.value === !0 && Array.isArray(f.value) && !f.value.includes(0) || !S || S <= 1;
        return (!b.ctrlKey || X.value || b.type === "wheel") && K;
      }), ke(
        [_, ue],
        () => {
          _.value && !T.value ? H.on("zoom", null) : _.value || H.on("zoom", (b) => {
            ne.value = { x: b.transform.x, y: b.transform.y, zoom: b.transform.k };
            const O = ye(b.transform);
            D = j(ue.value, P ?? 0), A.viewportChange(O), A.move({ event: b, flowTransform: O });
          });
        },
        { immediate: !0 }
      ), ke(
        [_, ee, u, oe, m, N, $],
        () => {
          ee.value && !oe.value && !_.value ? d.on(
            "wheel.zoom",
            (b) => {
              if (we(b, $.value))
                return !1;
              const O = oe.value || C.value, L = m.value && b.ctrlKey;
              if (!(!N.value || ee.value || O || L))
                return !1;
              b.preventDefault(), b.stopImmediatePropagation();
              const S = d.property("__zoom").k || 1, K = Oi();
              if (!X.value && b.ctrlKey && m.value && K) {
                const Ee = Tt(b), $e = ge(b), nt = S * 2 ** $e;
                H.scaleTo(d, nt, Ee, b);
                return;
              }
              const q = b.deltaMode === 1 ? 20 : 1;
              let te = u.value === wo.Vertical ? 0 : b.deltaX * q, se = u.value === wo.Horizontal ? 0 : b.deltaY * q;
              !K && b.shiftKey && u.value !== wo.Vertical && !te && se && (te = se, se = 0), H.translateBy(
                d,
                -(te / S) * c.value,
                -(se / S) * c.value
              );
              const ve = ye(d.property("__zoom"));
              w && clearTimeout(w), R.value ? (A.move({ event: b, flowTransform: ve }), A.viewportChange(ve), w = setTimeout(() => {
                A.moveEnd({ event: b, flowTransform: ve }), A.viewportChangeEnd(ve), R.value = !1;
              }, 150)) : (R.value = !0, A.moveStart({ event: b, flowTransform: ve }), A.viewportChangeStart(ve));
            },
            { passive: !1 }
          ) : typeof x < "u" && d.on(
            "wheel.zoom",
            function(b, O) {
              const L = !N.value && b.type === "wheel" && !b.ctrlKey, z = oe.value || C.value, S = m.value && b.ctrlKey;
              if (!z && !a.value && !S && b.type === "wheel" || L || we(b, $.value))
                return null;
              b.preventDefault(), x.call(this, b, O);
            },
            { passive: !1 }
          );
        },
        { immediate: !0 }
      );
    });
    function j(fe, pe) {
      return pe === 2 && Array.isArray(fe) && fe.includes(2);
    }
    function ge(fe) {
      const pe = fe.ctrlKey && Oi() ? 10 : 1;
      return -fe.deltaY * (fe.deltaMode === 1 ? 0.05 : fe.deltaMode ? 1 : 2e-3) * pe;
    }
    function _e(fe, pe) {
      return fe.x !== pe.x && !Number.isNaN(pe.x) || fe.y !== pe.y && !Number.isNaN(pe.y) || fe.zoom !== pe.k && !Number.isNaN(pe.k);
    }
    function ye(fe) {
      return {
        x: fe.x,
        y: fe.y,
        zoom: fe.k
      };
    }
    function we(fe, pe) {
      return fe.target.closest(`.${pe}`);
    }
    return (fe, pe) => (U(), W("div", {
      ref_key: "viewportRef",
      ref: G,
      class: "vue-flow__viewport vue-flow__container"
    }, [
      ie(ax, {
        "is-selecting": le.value,
        "selection-key-pressed": V(Q),
        class: xe({
          connecting: !!V(k),
          dragging: V(B),
          draggable: V(f) === !0 || Array.isArray(V(f)) && V(f).includes(0)
        })
      }, {
        default: un(() => [
          ie(cx, null, {
            default: un(() => [
              $n(fe.$slots, "default")
            ]),
            _: 3
          })
        ]),
        _: 3
      }, 8, ["is-selecting", "selection-key-pressed", "class"])
    ], 512));
  }
}), hx = ["id"], px = ["id"], vx = ["id"], gx = {
  name: "A11yDescriptions",
  compatConfig: { MODE: 3 }
}, mx = /* @__PURE__ */ Te({
  ...gx,
  setup(e) {
    const { id: t, disableKeyboardA11y: n, ariaLiveMessage: o } = Be();
    return (i, r) => (U(), W(me, null, [
      p("div", {
        id: `${V(cd)}-${V(t)}`,
        style: { display: "none" }
      }, " Press enter or space to select a node. " + J(V(n) ? "" : "You can then use the arrow keys to move the node around.") + " You can then use the arrow keys to move the node around, press delete to remove it and press escape to cancel. ", 9, hx),
      p("div", {
        id: `${V(dd)}-${V(t)}`,
        style: { display: "none" }
      }, " Press enter or space to select an edge. You can then press delete to remove it or press escape to cancel. ", 8, px),
      V(n) ? Se("", !0) : (U(), W("div", {
        key: 0,
        id: `${V(Hw)}-${V(t)}`,
        "aria-live": "assertive",
        "aria-atomic": "true",
        style: { position: "absolute", width: "1px", height: "1px", margin: "-1px", border: "0", padding: "0", overflow: "hidden", clip: "rect(0px, 0px, 0px, 0px)", "clip-path": "inset(100%)" }
      }, J(V(o)), 9, vx))
    ], 64));
  }
});
function yx() {
  const e = Be();
  ke(
    () => e.viewportHelper.value.viewportInitialized,
    (t) => {
      t && setTimeout(() => {
        e.emits.init(e), e.emits.paneReady(e);
      }, 1);
    }
  );
}
function bx(e, t, n) {
  return n === de.Left ? e - t : n === de.Right ? e + t : e;
}
function _x(e, t, n) {
  return n === de.Top ? e - t : n === de.Bottom ? e + t : e;
}
const Xs = function({
  radius: e = 10,
  centerX: t = 0,
  centerY: n = 0,
  position: o = de.Top,
  type: i
}) {
  return Ie("circle", {
    class: `vue-flow__edgeupdater vue-flow__edgeupdater-${i}`,
    cx: bx(t, e, o),
    cy: _x(n, e, o),
    r: e,
    stroke: "transparent",
    fill: "transparent"
  });
};
Xs.props = ["radius", "centerX", "centerY", "position", "type"];
Xs.compatConfig = { MODE: 3 };
const Ha = Xs, wx = /* @__PURE__ */ Te({
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
      isValidConnection: h,
      multiSelectionActive: m,
      disableKeyboardA11y: C,
      elementsSelectable: N,
      edgesUpdatable: $,
      edgesFocusable: I,
      hooks: A
    } = Be(), k = ce(() => c(e.id)), { emit: _, on: B } = hE(k.value, r), M = At(er), E = to(), Y = re(!1), ne = re(!1), G = re(""), Z = re(null), T = re("source"), R = re(null), w = ze(
      () => typeof k.value.selectable > "u" ? N.value : k.value.selectable
    ), D = ze(() => typeof k.value.updatable > "u" ? $.value : k.value.updatable), P = ze(() => typeof k.value.focusable > "u" ? I.value : k.value.focusable);
    Mn(cE, e.id), Mn(dE, R);
    const F = ce(() => k.value.class instanceof Function ? k.value.class(k.value) : k.value.class), X = ce(() => k.value.style instanceof Function ? k.value.style(k.value) : k.value.style), Q = ce(() => {
      const g = k.value.type || "default", y = M == null ? void 0 : M[`edge-${g}`];
      if (y)
        return y;
      let b = k.value.template ?? a.value[g];
      if (typeof b == "string" && E) {
        const O = Object.keys(E.appContext.components);
        O && O.includes(g) && (b = Su(g, !1));
      }
      return b && typeof b != "string" ? b : (r.error(new We(Ge.EDGE_TYPE_MISSING, b)), !1);
    }), { handlePointerDown: oe } = Od({
      nodeId: G,
      handleId: Z,
      type: T,
      isValidConnection: h,
      edgeUpdaterType: T,
      onEdgeUpdate: le,
      onEdgeUpdateEnd: j
    });
    return () => {
      const g = f(k.value.source), y = f(k.value.target), b = "pathOptions" in k.value ? k.value.pathOptions : {};
      if (!g && !y)
        return r.error(new We(Ge.EDGE_SOURCE_TARGET_MISSING, k.value.id, k.value.source, k.value.target)), null;
      if (!g)
        return r.error(new We(Ge.EDGE_SOURCE_MISSING, k.value.id, k.value.source)), null;
      if (!y)
        return r.error(new We(Ge.EDGE_TARGET_MISSING, k.value.id, k.value.target)), null;
      if (!k.value || k.value.hidden || g.hidden || y.hidden)
        return null;
      let O;
      o.value === On.Strict ? O = g.handleBounds.source : O = [...g.handleBounds.source || [], ...g.handleBounds.target || []];
      const L = Oa(O, k.value.sourceHandle);
      let z;
      o.value === On.Strict ? z = y.handleBounds.target : z = [...y.handleBounds.target || [], ...y.handleBounds.source || []];
      const S = Oa(z, k.value.targetHandle), K = (L == null ? void 0 : L.position) || de.Bottom, q = (S == null ? void 0 : S.position) || de.Top, { x: te, y: se } = Ii(g, L, K), { x: ve, y: Ee } = Ii(y, S, q);
      return k.value.sourceX = te, k.value.sourceY = se, k.value.targetX = ve, k.value.targetY = Ee, Ie(
        "g",
        {
          ref: R,
          key: e.id,
          "data-id": e.id,
          class: [
            "vue-flow__edge",
            `vue-flow__edge-${Q.value === !1 ? "default" : k.value.type || "default"}`,
            l.value,
            F.value,
            {
              updating: Y.value,
              selected: k.value.selected,
              animated: k.value.animated,
              inactive: !w.value && !A.value.edgeClick.hasListeners()
            }
          ],
          onClick: _e,
          onContextmenu: ye,
          onDblclick: we,
          onMouseenter: fe,
          onMousemove: pe,
          onMouseleave: H,
          onKeyDown: P.value ? v : void 0,
          tabIndex: P.value ? 0 : void 0,
          "aria-label": k.value.ariaLabel === null ? void 0 : k.value.ariaLabel || `Edge from ${k.value.source} to ${k.value.target}`,
          "aria-describedby": P.value ? `${dd}-${t}` : void 0,
          role: P.value ? "button" : "img"
        },
        [
          ne.value ? null : Ie(Q.value === !1 ? a.value.default : Q.value, {
            id: e.id,
            sourceNode: g,
            targetNode: y,
            source: k.value.source,
            target: k.value.target,
            type: k.value.type,
            updatable: D.value,
            selected: k.value.selected,
            animated: k.value.animated,
            label: k.value.label,
            labelStyle: k.value.labelStyle,
            labelShowBg: k.value.labelShowBg,
            labelBgStyle: k.value.labelBgStyle,
            labelBgPadding: k.value.labelBgPadding,
            labelBgBorderRadius: k.value.labelBgBorderRadius,
            data: k.value.data,
            events: { ...k.value.events, ...B },
            style: X.value,
            markerStart: `url('#${Ro(k.value.markerStart, t)}')`,
            markerEnd: `url('#${Ro(k.value.markerEnd, t)}')`,
            sourcePosition: K,
            targetPosition: q,
            sourceX: te,
            sourceY: se,
            targetX: ve,
            targetY: Ee,
            sourceHandleId: k.value.sourceHandle,
            targetHandleId: k.value.targetHandle,
            interactionWidth: k.value.interactionWidth,
            ...b
          }),
          [
            D.value === "source" || D.value === !0 ? [
              Ie(
                "g",
                {
                  onMousedown: d,
                  onMouseenter: ue,
                  onMouseout: ee
                },
                Ie(Ha, {
                  position: K,
                  centerX: te,
                  centerY: se,
                  radius: i.value,
                  type: "source",
                  "data-type": "source"
                })
              )
            ] : null,
            D.value === "target" || D.value === !0 ? [
              Ie(
                "g",
                {
                  onMousedown: x,
                  onMouseenter: ue,
                  onMouseout: ee
                },
                Ie(Ha, {
                  position: q,
                  centerX: ve,
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
    function ue() {
      Y.value = !0;
    }
    function ee() {
      Y.value = !1;
    }
    function le(g, y) {
      _.update({ event: g, edge: k.value, connection: y });
    }
    function j(g) {
      _.updateEnd({ event: g, edge: k.value }), ne.value = !1;
    }
    function ge(g, y) {
      g.button === 0 && (ne.value = !0, G.value = y ? k.value.target : k.value.source, Z.value = (y ? k.value.targetHandle : k.value.sourceHandle) ?? "", T.value = y ? "target" : "source", _.updateStart({ event: g, edge: k.value }), oe(g));
    }
    function _e(g) {
      var y;
      const b = { event: g, edge: k.value };
      w.value && (s.value = !1, k.value.selected && m.value ? (u([k.value]), (y = R.value) == null || y.blur()) : n([k.value])), _.click(b);
    }
    function ye(g) {
      _.contextMenu({ event: g, edge: k.value });
    }
    function we(g) {
      _.doubleClick({ event: g, edge: k.value });
    }
    function fe(g) {
      _.mouseEnter({ event: g, edge: k.value });
    }
    function pe(g) {
      _.mouseMove({ event: g, edge: k.value });
    }
    function H(g) {
      _.mouseLeave({ event: g, edge: k.value });
    }
    function d(g) {
      ge(g, !0);
    }
    function x(g) {
      ge(g, !1);
    }
    function v(g) {
      var y;
      !C.value && fd.includes(g.key) && w.value && (g.key === "Escape" ? ((y = R.value) == null || y.blur(), u([c(e.id)])) : n([c(e.id)]));
    }
  }
}), Ex = wx, xx = {
  [de.Left]: de.Right,
  [de.Right]: de.Left,
  [de.Top]: de.Bottom,
  [de.Bottom]: de.Top
}, kx = /* @__PURE__ */ Te({
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
    } = Be(), h = (e = At(er)) == null ? void 0 : e["connection-line"], m = ce(() => {
      var A;
      return f((A = o.value) == null ? void 0 : A.nodeId);
    }), C = ce(() => {
      var A;
      return f((A = i.value) == null ? void 0 : A.nodeId) ?? null;
    }), N = ce(() => ({
      x: (r.value.x - c.value.x) / c.value.zoom,
      y: (r.value.y - c.value.y) / c.value.zoom
    })), $ = ce(
      () => a.value.markerStart ? `url(#${Ro(a.value.markerStart, t)})` : ""
    ), I = ce(
      () => a.value.markerEnd ? `url(#${Ro(a.value.markerEnd, t)})` : ""
    );
    return () => {
      var A, k, _, B;
      if (!m.value || !o.value)
        return null;
      const M = o.value.handleId, E = o.value.type, Y = m.value.handleBounds;
      let ne = (Y == null ? void 0 : Y[E]) || [];
      if (n.value === On.Loose) {
        const Q = (Y == null ? void 0 : Y[E === "source" ? "target" : "source"]) || [];
        ne = [...ne, ...Q];
      }
      if (!ne)
        return null;
      const G = (M ? ne.find((Q) => Q.id === M) : ne[0]) ?? null, Z = (G == null ? void 0 : G.position) || de.Top, { x: T, y: R } = Ii(m.value, G, Z);
      let w = null;
      C.value && ((A = i.value) != null && A.handleId) && (n.value === On.Strict ? w = ((k = C.value.handleBounds[E === "source" ? "target" : "source"]) == null ? void 0 : k.find(
        (Q) => {
          var oe;
          return Q.id === ((oe = i.value) == null ? void 0 : oe.handleId);
        }
      )) || null : w = ((_ = [...C.value.handleBounds.source || [], ...C.value.handleBounds.target || []]) == null ? void 0 : _.find(
        (Q) => {
          var oe;
          return Q.id === ((oe = i.value) == null ? void 0 : oe.handleId);
        }
      )) || null);
      const D = ((B = i.value) == null ? void 0 : B.position) ?? (Z ? xx[Z] : null);
      if (!Z || !D)
        return null;
      const P = s.value ?? a.value.type ?? bn.Bezier;
      let F = "";
      const X = {
        sourceX: T,
        sourceY: R,
        sourcePosition: Z,
        targetX: N.value.x,
        targetY: N.value.y,
        targetPosition: D
      };
      return P === bn.Bezier ? [F] = Ld(X) : P === bn.Step ? [F] = hs({
        ...X,
        borderRadius: 0
      }) : P === bn.SmoothStep ? [F] = hs(X) : P === bn.SimpleBezier ? [F] = Vd(X) : F = `M${T},${R} ${N.value.x},${N.value.y}`, Ie(
        "svg",
        { class: "vue-flow__edges vue-flow__connectionline vue-flow__container" },
        Ie(
          "g",
          { class: "vue-flow__connection" },
          h ? Ie(h, {
            sourceX: T,
            sourceY: R,
            sourcePosition: Z,
            targetX: N.value.x,
            targetY: N.value.y,
            targetPosition: D,
            sourceNode: m.value,
            sourceHandle: G,
            targetNode: C.value,
            targetHandle: w,
            markerEnd: I.value,
            markerStart: $.value,
            connectionStatus: u.value
          }) : Ie("path", {
            d: F,
            class: [a.value.class, u, "vue-flow__connection-path"],
            style: {
              ...l.value,
              ...a.value.style
            },
            "marker-end": I.value,
            "marker-start": $.value
          })
        )
      );
    };
  }
}), Sx = kx, Cx = ["id", "markerWidth", "markerHeight", "markerUnits", "orient"], Nx = {
  name: "MarkerType",
  compatConfig: { MODE: 3 }
}, $x = /* @__PURE__ */ Te({
  ...Nx,
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
    return (t, n) => (U(), W("marker", {
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
      t.type === V(as).ArrowClosed ? (U(), W("polyline", {
        key: 0,
        style: ft({
          stroke: t.color,
          fill: t.color,
          strokeWidth: t.strokeWidth
        }),
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        points: "-5,-4 0,0 -5,4 -5,-4"
      }, null, 4)) : Se("", !0),
      t.type === V(as).Arrow ? (U(), W("polyline", {
        key: 1,
        style: ft({
          stroke: t.color,
          strokeWidth: t.strokeWidth
        }),
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        fill: "none",
        points: "-5,-4 0,0 -5,4"
      }, null, 4)) : Se("", !0)
    ], 8, Cx));
  }
}), Mx = { class: "vue-flow__marker vue-flow__container" }, Ix = {
  name: "MarkerDefinitions",
  compatConfig: { MODE: 3 }
}, Ox = /* @__PURE__ */ Te({
  ...Ix,
  setup(e) {
    const { id: t, edges: n, connectionLineOptions: o, defaultMarkerColor: i } = Be(), r = ce(() => {
      const s = /* @__PURE__ */ new Set(), l = [], a = (u) => {
        if (u) {
          const c = Ro(u, t);
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
    return (s, l) => (U(), W("svg", Mx, [
      p("defs", null, [
        (U(!0), W(me, null, Re(r.value, (a) => (U(), vt($x, {
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
}), Tx = {
  name: "Edges",
  compatConfig: { MODE: 3 }
}, Px = /* @__PURE__ */ Te({
  ...Tx,
  setup(e) {
    const { findNode: t, getEdges: n, elevateEdgesOnSelect: o } = Be();
    return (i, r) => (U(), W(me, null, [
      ie(Ox),
      (U(!0), W(me, null, Re(V(n), (s) => (U(), W("svg", {
        key: s.id,
        class: "vue-flow__edges vue-flow__container",
        style: ft({ zIndex: V(nE)(s, V(t), V(o)) })
      }, [
        ie(V(Ex), {
          id: s.id
        }, null, 8, ["id"])
      ], 4))), 128)),
      ie(V(Sx))
    ], 64));
  }
}), Dx = /* @__PURE__ */ Te({
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
      nodeExtent: h,
      elevateNodesOnSelect: m,
      disableKeyboardA11y: C,
      ariaLiveMessage: N,
      snapToGrid: $,
      snapGrid: I,
      nodeDragThreshold: A,
      nodesDraggable: k,
      elementsSelectable: _,
      nodesConnectable: B,
      nodesFocusable: M,
      hooks: E
    } = Be(), Y = re(null);
    Mn(Md, Y), Mn($d, e.id);
    const ne = At(er), G = to(), Z = Pd(), { node: T, parentNode: R } = Td(e.id), { emit: w, on: D } = mE(T, s), P = ze(() => typeof T.draggable > "u" ? k.value : T.draggable), F = ze(() => typeof T.selectable > "u" ? _.value : T.selectable), X = ze(() => typeof T.connectable > "u" ? B.value : T.connectable), Q = ze(() => typeof T.focusable > "u" ? M.value : T.focusable), oe = ze(
      () => F.value || P.value || E.value.nodeClick.hasListeners() || E.value.nodeDoubleClick.hasListeners() || E.value.nodeMouseEnter.hasListeners() || E.value.nodeMouseMove.hasListeners() || E.value.nodeMouseLeave.hasListeners()
    ), ue = ze(() => !!T.dimensions.width && !!T.dimensions.height), ee = ce(() => {
      const y = T.type || "default", b = ne == null ? void 0 : ne[`node-${y}`];
      if (b)
        return b;
      let O = T.template || f.value[y];
      if (typeof O == "string" && G) {
        const L = Object.keys(G.appContext.components);
        L && L.includes(y) && (O = Su(y, !1));
      }
      return O && typeof O != "string" ? O : (s.error(new We(Ge.NODE_TYPE_MISSING, O)), !1);
    }), le = Id({
      id: e.id,
      el: Y,
      disabled: () => !P.value,
      selectable: F,
      dragHandle: () => T.dragHandle,
      onStart(y) {
        w.dragStart(y);
      },
      onDrag(y) {
        w.drag(y);
      },
      onStop(y) {
        w.dragStop(y);
      },
      onClick(y) {
        v(y);
      }
    }), j = ce(() => T.class instanceof Function ? T.class(T) : T.class), ge = ce(() => {
      const y = (T.style instanceof Function ? T.style(T) : T.style) || {}, b = T.width instanceof Function ? T.width(T) : T.width, O = T.height instanceof Function ? T.height(T) : T.height;
      return !y.width && b && (y.width = typeof b == "string" ? b : `${b}px`), !y.height && O && (y.height = typeof O == "string" ? O : `${O}px`), y;
    }), _e = ze(() => Number(T.zIndex ?? ge.value.zIndex ?? 0));
    return c((y) => {
      (y.includes(e.id) || !y.length) && we();
    }), mt(() => {
      ke(
        () => T.hidden,
        (y = !1, b, O) => {
          !y && Y.value && (e.resizeObserver.observe(Y.value), O(() => {
            Y.value && e.resizeObserver.unobserve(Y.value);
          }));
        },
        { immediate: !0, flush: "post" }
      );
    }), ke([() => T.type, () => T.sourcePosition, () => T.targetPosition], () => {
      Ze(() => {
        u([{ id: e.id, nodeElement: Y.value, forceUpdate: !0 }]);
      });
    }), ke(
      [
        () => T.position.x,
        () => T.position.y,
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
        _e,
        () => T.selected,
        () => T.dimensions.height,
        () => T.dimensions.width,
        () => {
          var y;
          return (y = R.value) == null ? void 0 : y.dimensions.height;
        },
        () => {
          var y;
          return (y = R.value) == null ? void 0 : y.dimensions.width;
        }
      ],
      ([y, b, O, L, z, S]) => {
        const K = {
          x: y,
          y: b,
          z: S + (m.value && T.selected ? 1e3 : 0)
        };
        typeof O < "u" && typeof L < "u" ? T.computedPosition = Kw({ x: O, y: L, z }, K) : T.computedPosition = K;
      },
      { flush: "post", immediate: !0 }
    ), ke([() => T.extent, h], ([y, b], [O, L]) => {
      (y !== O || b !== L) && ye();
    }), T.extent === "parent" || typeof T.extent == "object" && "range" in T.extent && T.extent.range === "parent" ? Qr(() => ue).toBe(!0).then(ye) : ye(), () => T.hidden ? null : Ie(
      "div",
      {
        ref: Y,
        "data-id": T.id,
        class: [
          "vue-flow__node",
          `vue-flow__node-${ee.value === !1 ? "default" : T.type || "default"}`,
          {
            [n.value]: P.value,
            dragging: le == null ? void 0 : le.value,
            draggable: P.value,
            selected: T.selected,
            selectable: F.value,
            parent: T.isParent
          },
          j.value
        ],
        style: {
          visibility: ue.value ? "visible" : "hidden",
          zIndex: T.computedPosition.z ?? _e.value,
          transform: `translate(${T.computedPosition.x}px,${T.computedPosition.y}px)`,
          pointerEvents: oe.value ? "all" : "none",
          ...ge.value
        },
        tabIndex: Q.value ? 0 : void 0,
        role: Q.value ? "button" : void 0,
        "aria-describedby": C.value ? void 0 : `${cd}-${t}`,
        "aria-label": T.ariaLabel,
        onMouseenter: fe,
        onMousemove: pe,
        onMouseleave: H,
        onContextmenu: d,
        onClick: v,
        onDblclick: x,
        onKeydown: g
      },
      [
        Ie(ee.value === !1 ? f.value.default : ee.value, {
          id: T.id,
          type: T.type,
          data: T.data,
          events: { ...T.events, ...D },
          selected: T.selected,
          resizing: T.resizing,
          dragging: le.value,
          connectable: X.value,
          position: T.computedPosition,
          dimensions: T.dimensions,
          isValidTargetPos: T.isValidTargetPos,
          isValidSourcePos: T.isValidSourcePos,
          parent: T.parentNode,
          parentNodeId: T.parentNode,
          zIndex: T.computedPosition.z ?? _e.value,
          targetPosition: T.targetPosition,
          sourcePosition: T.sourcePosition,
          label: T.label,
          dragHandle: T.dragHandle,
          onUpdateNodeInternals: we
        })
      ]
    );
    function ye() {
      const y = T.computedPosition, { computedPosition: b, position: O } = Us(
        T,
        $.value ? Ji(y, I.value) : y,
        s.error,
        h.value,
        R.value
      );
      (T.computedPosition.x !== b.x || T.computedPosition.y !== b.y) && (T.computedPosition = { ...T.computedPosition, ...b }), (T.position.x !== O.x || T.position.y !== O.y) && (T.position = O);
    }
    function we() {
      Y.value && u([{ id: e.id, nodeElement: Y.value, forceUpdate: !0 }]);
    }
    function fe(y) {
      le != null && le.value || w.mouseEnter({ event: y, node: T });
    }
    function pe(y) {
      le != null && le.value || w.mouseMove({ event: y, node: T });
    }
    function H(y) {
      le != null && le.value || w.mouseLeave({ event: y, node: T });
    }
    function d(y) {
      return w.contextMenu({ event: y, node: T });
    }
    function x(y) {
      return w.doubleClick({ event: y, node: T });
    }
    function v(y) {
      F.value && (!o.value || !P.value || A.value > 0) && fs(
        T,
        r.value,
        a,
        l,
        i,
        !1,
        Y.value
      ), w.click({ event: y, node: T });
    }
    function g(y) {
      if (!(us(y) || C.value))
        if (fd.includes(y.key) && F.value) {
          const b = y.key === "Escape";
          fs(
            T,
            r.value,
            a,
            l,
            i,
            b,
            Y.value
          );
        } else P.value && T.selected && Xn[y.key] && (y.preventDefault(), N.value = `Moved selected node ${y.key.replace("Arrow", "").toLowerCase()}. New position, x: ${~~T.position.x}, y: ${~~T.position.y}`, Z(
          {
            x: Xn[y.key].x,
            y: Xn[y.key].y
          },
          y.shiftKey
        ));
    }
  }
}), Ax = Dx;
function Rx(e = { includeHiddenNodes: !1 }) {
  const { nodes: t } = Be();
  return ce(() => {
    if (t.value.length === 0)
      return !1;
    for (const n of t.value)
      if ((e.includeHiddenNodes || !n.hidden) && ((n == null ? void 0 : n.handleBounds) === void 0 || n.dimensions.width === 0 || n.dimensions.height === 0))
        return !1;
    return !0;
  });
}
const Lx = { class: "vue-flow__nodes vue-flow__container" }, Vx = {
  name: "Nodes",
  compatConfig: { MODE: 3 }
}, zx = /* @__PURE__ */ Te({
  ...Vx,
  setup(e) {
    const { getNodes: t, updateNodeDimensions: n, emits: o } = Be(), i = Rx(), r = re();
    return ke(
      i,
      (s) => {
        s && Ze(() => {
          o.nodesInitialized(t.value);
        });
      },
      { immediate: !0 }
    ), mt(() => {
      r.value = new ResizeObserver((s) => {
        const l = s.map((a) => ({
          id: a.target.getAttribute("data-id"),
          nodeElement: a.target,
          forceUpdate: !0
        }));
        Ze(() => n(l));
      });
    }), Dn(() => {
      var s;
      return (s = r.value) == null ? void 0 : s.disconnect();
    }), (s, l) => (U(), W("div", Lx, [
      r.value ? (U(!0), W(me, { key: 0 }, Re(V(t), (a, u, c, f) => {
        const h = [a.id];
        if (f && f.key === a.id && Rh(f, h))
          return f;
        const m = (U(), vt(V(Ax), {
          id: a.id,
          key: a.id,
          "resize-observer": r.value
        }, null, 8, ["id", "resize-observer"]));
        return m.memo = h, m;
      }, l, 0), 128)) : Se("", !0)
    ]));
  }
});
function Bx() {
  const { emits: e } = Be();
  mt(() => {
    if (Nd()) {
      const t = document.querySelector(".vue-flow__pane");
      t && window.getComputedStyle(t).zIndex !== "1" && e.error(new We(Ge.MISSING_STYLES));
    }
  });
}
const Fx = /* @__PURE__ */ p("div", { class: "vue-flow__edge-labels" }, null, -1), Hx = {
  name: "VueFlow",
  compatConfig: { MODE: 3 }
}, jx = /* @__PURE__ */ Te({
  ...Hx,
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
    const o = e, i = Kf(), r = wr(o, "modelValue", n), s = wr(o, "nodes", n), l = wr(o, "edges", n), a = Be(o), u = _E({ modelValue: r, nodes: s, edges: l }, o, a);
    return EE(n, a.hooks), yx(), Bx(), Mn(er, i), Bi(() => {
      u();
    }), t(a), (c, f) => (U(), W("div", {
      ref: V(a).vueFlowRef,
      class: "vue-flow"
    }, [
      ie(fx, null, {
        default: un(() => [
          ie(Px),
          Fx,
          ie(zx),
          $n(c.$slots, "zoom-pane")
        ]),
        _: 3
      }),
      $n(c.$slots, "default"),
      ie(mx)
    ], 512));
  }
}), Ux = { class: "graph-node-head" }, Gx = {
  key: 0,
  class: "level-tag"
}, Yx = ["aria-pressed", "aria-label"], Pr = /* @__PURE__ */ Te({
  __name: "GraphNodeCard",
  props: {
    data: {},
    selected: { type: Boolean }
  },
  emits: ["toggle"],
  setup(e, { emit: t }) {
    const n = e, o = t, i = { persona: hp, profile: qr, memory: pp, rag: yp, voice: Ep, live2d: Np, extensions: _p, skill: Cp, tool: Op, mcp: Sp }, r = !!n.data.configurable && n.data.level > 0;
    return (s, l) => (U(), W("article", {
      class: xe(["graph-node", [`kind-${s.data.kind}`, `status-${s.data.status}`, { selected: s.selected }]])
    }, [
      ie(V(cn), {
        id: "left-target",
        type: "target",
        position: V(de).Left,
        class: "graph-handle"
      }, null, 8, ["position"]),
      ie(V(cn), {
        id: "left-source",
        type: "source",
        position: V(de).Left,
        class: "graph-handle"
      }, null, 8, ["position"]),
      ie(V(cn), {
        id: "right-target",
        type: "target",
        position: V(de).Right,
        class: "graph-handle"
      }, null, 8, ["position"]),
      ie(V(cn), {
        id: "right-source",
        type: "source",
        position: V(de).Right,
        class: "graph-handle"
      }, null, 8, ["position"]),
      p("div", Ux, [
        (U(), vt(Nu(i[s.data.kind]), { size: 16 })),
        p("b", null, J(s.data.label), 1),
        s.data.kind === "skill" || s.data.kind === "tool" ? (U(), W("span", Gx, "L" + J(s.data.level), 1)) : Se("", !0)
      ]),
      p("p", null, J(s.data.summary), 1),
      p("footer", null, [
        p("span", null, J(s.data.status === "available" ? "可用" : s.data.status === "unassigned" ? "未分配" : s.data.status === "partial" ? "部分可用" : "不可用"), 1),
        V(r) ? (U(), W("button", {
          key: 0,
          type: "button",
          class: xe(["graph-switch", { on: s.data.assigned }]),
          "aria-pressed": !!s.data.assigned,
          "aria-label": `${s.data.label}能力开关`,
          onClick: l[0] || (l[0] = Mo((a) => o("toggle"), ["stop"]))
        }, l[1] || (l[1] = [
          p("i", null, null, -1)
        ]), 10, Yx)) : Se("", !0)
      ])
    ], 2));
  }
}), Xx = /* @__PURE__ */ Te({
  __name: "BraceEdge",
  props: {
    sourceX: {},
    sourceY: {},
    targetX: {},
    targetY: {},
    selected: { type: Boolean }
  },
  setup(e) {
    const t = e, n = ce(() => {
      const o = t.targetX >= t.sourceX ? 1 : -1, i = Math.abs(t.targetX - t.sourceX), r = Math.min(86, i * 0.34), s = (t.sourceX + t.targetX) / 2, l = (t.sourceY + t.targetY) / 2;
      return `M ${t.sourceX} ${t.sourceY} C ${t.sourceX + o * r} ${t.sourceY}, ${s} ${t.sourceY}, ${s} ${l} C ${s} ${t.targetY}, ${t.targetX - o * r} ${t.targetY}, ${t.targetX} ${t.targetY}`;
    });
    return (o, i) => (U(), vt(V(jo), {
      path: n.value,
      class: xe({ selected: o.selected })
    }, null, 8, ["path", "class"]));
  }
}), Wx = {
  class: "graph-stage",
  "aria-label": "角色能力架构画布"
}, qx = {
  class: "graph-tools",
  "aria-label": "画布工具"
}, Kx = /* @__PURE__ */ Te({
  __name: "RoleGraphCanvas",
  props: {
    graph: {},
    selectedNodeId: {}
  },
  emits: ["select", "toggle", "reset"],
  setup(e, { emit: t }) {
    const n = e, o = t, i = re([]), r = re([]), { fitView: s, zoomIn: l, zoomOut: a } = Be({ id: "role-architecture" }), u = re(!1);
    function c() {
      return new Promise((k) => requestAnimationFrame(() => requestAnimationFrame(() => k())));
    }
    function f(k) {
      const _ = /* @__PURE__ */ new Set([k]), B = [k];
      for (; B.length; ) {
        const M = B.shift();
        for (const E of r.value)
          E.source !== M || _.has(E.target) || (_.add(E.target), B.push(E.target));
      }
      return _;
    }
    function h(k) {
      var M;
      let _ = k;
      const B = /* @__PURE__ */ new Set();
      for (; !B.has(_); ) {
        B.add(_);
        const E = (M = r.value.find((Y) => Y.target === _)) == null ? void 0 : M.source;
        if (!E) return;
        if (E === "module:extensions") return _;
        _ = E;
      }
    }
    async function m(k, _) {
      !u.value || !k.length || (await Ze(), await c(), await s({ nodes: k, ..._ }));
    }
    function C(k = 220) {
      const _ = i.value.filter((B) => B.data.kind === "persona" || ["profile", "memory", "rag", "voice", "live2d", "extensions"].includes(B.data.kind));
      return m(_.map((B) => B.id), { padding: 0.18, minZoom: 0.68, maxZoom: 1.08, duration: k });
    }
    function N(k = 220) {
      if (n.selectedNodeId === "module:extensions") {
        const B = i.value.filter((M) => M.id === "module:extensions" || ["skill", "tool"].includes(M.data.kind));
        return m(B.map((M) => M.id), { padding: 0.16, minZoom: 0.38, maxZoom: 0.86, duration: k });
      }
      const _ = h(n.selectedNodeId);
      if (_) {
        const B = f(_);
        return B.add("module:extensions"), m([...B], { padding: 0.24, minZoom: 0.58, maxZoom: 1, duration: k });
      }
      return C(k);
    }
    ke(() => n.graph, async (k) => {
      i.value = k.nodes.map((_) => ({ ..._, selected: _.id === n.selectedNodeId })), r.value = k.edges.map((_) => ({ ..._, type: "brace", animated: !1 })), await Ze(), await N();
    }, { immediate: !0, deep: !0 }), ke(() => n.selectedNodeId, (k) => i.value = i.value.map((_) => ({ ..._, selected: _.id === k })));
    function $(k) {
      o("select", k.node.id);
    }
    async function I() {
      o("reset"), await Ze(), C();
    }
    async function A() {
      u.value = !0, await N(0);
    }
    return (k, _) => (U(), W("section", Wx, [
      p("div", qx, [
        p("button", {
          type: "button",
          title: "放大",
          onClick: _[0] || (_[0] = () => V(l)())
        }, [
          ie(V(uo), { size: 16 })
        ]),
        p("button", {
          type: "button",
          title: "缩小",
          onClick: _[1] || (_[1] = () => V(a)())
        }, [
          ie(V(xp), { size: 16 })
        ]),
        p("button", {
          type: "button",
          title: "适应视图",
          onClick: _[2] || (_[2] = (B) => V(s)({ padding: 0.15, duration: 220 }))
        }, [
          ie(V(wp), { size: 16 })
        ]),
        p("button", {
          type: "button",
          title: "恢复自动布局",
          onClick: I
        }, [
          ie(V(rc), { size: 16 })
        ])
      ]),
      ie(V(jx), {
        id: "role-architecture",
        nodes: i.value,
        "onUpdate:nodes": _[3] || (_[3] = (B) => i.value = B),
        edges: r.value,
        "onUpdate:edges": _[4] || (_[4] = (B) => r.value = B),
        "min-zoom": 0.32,
        "max-zoom": 1.8,
        "fit-view-on-init": !1,
        onInit: A,
        onNodeClick: $
      }, {
        "node-persona": un((B) => [
          ie(Pr, rr(ai(B)), null, 16)
        ]),
        "node-module": un((B) => [
          ie(Pr, rr(ai(B)), null, 16)
        ]),
        "node-capability": un((B) => [
          ie(Pr, Os(B, {
            onToggle: (M) => o("toggle", B.id)
          }), null, 16, ["onToggle"])
        ]),
        "edge-brace": un((B) => [
          ie(Xx, rr(ai(B)), null, 16)
        ]),
        _: 1
      }, 8, ["nodes", "edges"])
    ]));
  }
}), Zx = ["disabled", "aria-expanded"], Jx = {
  key: 0,
  id: "manage-role-menu",
  class: "role-picker-menu"
}, Qx = { class: "role-search" }, ek = {
  class: "role-list",
  role: "listbox",
  "aria-label": "选择角色"
}, tk = ["aria-selected", "disabled", "onClick"], nk = {
  key: 0,
  class: "role-empty"
}, ok = /* @__PURE__ */ Te({
  __name: "RoleNavigator",
  props: {
    personas: {},
    selectedId: {},
    disabled: { type: Boolean }
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const n = e, o = t, i = re(null), r = re(null), s = re(!1), l = re(""), a = ce(() => n.personas.filter((C) => C.name.toLowerCase().includes(l.value.trim().toLowerCase()))), u = ce(() => n.personas.find((C) => C.id === n.selectedId));
    async function c() {
      n.disabled || (s.value = !s.value, s.value && await Ze(() => {
        var C;
        return (C = r.value) == null ? void 0 : C.focus();
      }));
    }
    function f(C) {
      o("select", C), s.value = !1, l.value = "";
    }
    function h(C) {
      var N;
      (N = i.value) != null && N.contains(C.target) || (s.value = !1);
    }
    function m(C) {
      C.key === "Escape" && (s.value = !1);
    }
    return ke(() => n.disabled, (C) => {
      C && (s.value = !1);
    }), mt(() => {
      document.addEventListener("pointerdown", h), document.addEventListener("keydown", m);
    }), Dn(() => {
      document.removeEventListener("pointerdown", h), document.removeEventListener("keydown", m);
    }), (C, N) => {
      var $;
      return U(), W("div", {
        ref_key: "root",
        ref: i,
        class: "role-picker"
      }, [
        p("button", {
          type: "button",
          class: "role-picker-trigger",
          disabled: C.disabled || !C.personas.length,
          "aria-haspopup": "listbox",
          "aria-expanded": s.value,
          "aria-controls": "manage-role-menu",
          onClick: c
        }, [
          ie(V(qr), { size: 17 }),
          p("strong", null, J((($ = u.value) == null ? void 0 : $.name) || "角色管理"), 1),
          ie(V(mp), { size: 15 })
        ], 8, Zx),
        s.value ? (U(), W("div", Jx, [
          p("label", Qx, [
            ie(V(Xr), { size: 15 }),
            Xe(p("input", {
              ref_key: "searchInput",
              ref: r,
              "onUpdate:modelValue": N[0] || (N[0] = (I) => l.value = I),
              placeholder: "查找角色",
              "aria-label": "查找角色"
            }, null, 512), [
              [it, l.value]
            ])
          ]),
          p("div", ek, [
            (U(!0), W(me, null, Re(a.value, (I) => {
              var A;
              return U(), W("button", {
                key: I.id,
                type: "button",
                role: "option",
                "aria-selected": I.id === C.selectedId,
                disabled: C.disabled,
                class: xe({ active: I.id === C.selectedId }),
                onClick: (k) => f(I.id)
              }, [
                ie(V(qr), { size: 17 }),
                p("span", null, [
                  p("b", null, J(I.name), 1),
                  p("small", null, J(((A = I.profile) == null ? void 0 : A.description) || "尚未填写人设"), 1)
                ])
              ], 10, tk);
            }), 128)),
            a.value.length ? Se("", !0) : (U(), W("p", nk, "没有匹配的角色"))
          ])
        ])) : Se("", !0)
      ], 512);
    };
  }
});
function ik(e, t, n) {
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
async function rk(e) {
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
function sk(e, t, n) {
  const o = qe(e);
  return n.has("profile") && (o.persona = qe(t.persona)), n.has("capabilities") && (o.capabilities.overrides = qe(t.capabilities.overrides)), n.has("grants") && (o.grants.servers = qe(t.grants.servers)), o;
}
function lk() {
  const e = re([]), t = re(""), n = re(null), o = re(null), i = re(""), r = re(/* @__PURE__ */ new Set()), s = re(!1), l = re(!1), a = re(!1), u = re(""), c = re(""), f = ce(() => r.value.size > 0);
  async function h() {
    if (!s.value) {
      s.value = !0, u.value = "";
      try {
        e.value = await pr();
        const R = t.value || sessionStorage.getItem("yumeno.manage.persona"), w = e.value.find((D) => D.id === R) || e.value[0];
        w && await C(w.id, !0);
      } catch (R) {
        u.value = R instanceof Error ? R.message : String(R);
      } finally {
        s.value = !1;
      }
    }
  }
  async function m() {
    f.value || s.value || l.value || a.value || await h();
  }
  async function C(R, w = !1) {
    if (!w && (l.value || a.value)) {
      c.value = "当前操作完成后才能切换角色";
      return;
    }
    if (!w && f.value && !window.confirm("当前角色有未保存修改，放弃后切换角色？")) return;
    const D = e.value.find((P) => P.id === R);
    if (D) {
      s.value = !0, u.value = "", c.value = "";
      try {
        const P = await Ol(D);
        n.value = P, o.value = qe(P), t.value = R, i.value = `persona:${R}`, r.value = /* @__PURE__ */ new Set(), sessionStorage.setItem("yumeno.manage.persona", R);
      } catch (P) {
        u.value = P instanceof Error ? P.message : String(P);
      } finally {
        s.value = !1;
      }
    }
  }
  function N(R) {
    i.value = R;
  }
  function $(R) {
    o.value && (o.value.persona = qe(R), r.value = new Set(r.value).add("profile"));
  }
  function I(R, w) {
    if (!o.value) return;
    o.value = ik(o.value, R, w);
    const D = new Set(r.value);
    D.add("capabilities"), D.add("grants"), r.value = D;
  }
  function A(R, w) {
    if (!o.value) return;
    const D = o.value.grants.servers.find((P) => P.name === R);
    D && !D.global && (D.authorized = w), r.value = new Set(r.value).add("grants");
  }
  function k() {
    n.value && (o.value = qe(n.value), r.value = /* @__PURE__ */ new Set(), c.value = "已撤销本轮修改");
  }
  async function _() {
    if (!o.value || !n.value) return;
    const R = await sc(o.value.persona.id);
    o.value.documents = R, n.value.documents = qe(R);
  }
  async function B() {
    if (!(!o.value || !n.value || a.value)) {
      a.value = !0, u.value = "", c.value = "正在扫描 Live2D 模型...";
      try {
        const R = await lc();
        o.value.resources = { ...o.value.resources || { voiceAssets: [], live2dModels: [] }, live2dModels: R }, n.value.resources = { ...n.value.resources || { voiceAssets: [], live2dModels: [] }, live2dModels: qe(R) }, c.value = `已发现 ${R.length} 个 Live2D 模型`;
      } catch (R) {
        u.value = R instanceof Error ? R.message : String(R);
      } finally {
        a.value = !1;
      }
    }
  }
  async function M() {
    if (!a.value) {
      a.value = !0, u.value = "";
      try {
        await Tp(), c.value = "已打开 Live2D 模型文件夹";
      } catch (R) {
        u.value = R instanceof Error ? R.message : String(R);
      } finally {
        a.value = !1;
      }
    }
  }
  function E(R, w = 10) {
    w <= 0 || window.setTimeout(async () => {
      var D;
      if (((D = o.value) == null ? void 0 : D.persona.id) === R)
        try {
          await _(), o.value.documents.some((F) => ["converting", "preview_ready", "indexing"].includes(String(F.status))) && E(R, w - 1);
        } catch {
        }
    }, 1400);
  }
  async function Y(R, w) {
    if (!o.value || !R.length && !w.trim() || a.value) return !1;
    a.value = !0, u.value = "", c.value = "正在写入角色知识库...";
    try {
      const D = o.value.persona.id;
      return await Lp(o.value.persona, R, w), await _(), E(D), c.value = "资料已提交，正在建立索引", !0;
    } catch (D) {
      return u.value = D instanceof Error ? D.message : String(D), !1;
    } finally {
      a.value = !1;
    }
  }
  async function ne(R) {
    a.value = !0, u.value = "";
    try {
      await Vp(R), await _(), c.value = "资料已删除";
    } catch (w) {
      u.value = w instanceof Error ? w.message : String(w);
    } finally {
      a.value = !1;
    }
  }
  async function G(R) {
    var w;
    a.value = !0, u.value = "";
    try {
      const D = ((w = o.value) == null ? void 0 : w.persona.id) || "";
      await zp(R), await _(), D && E(D), c.value = "已重新提交索引";
    } catch (D) {
      u.value = D instanceof Error ? D.message : String(D);
    } finally {
      a.value = !1;
    }
  }
  async function Z() {
    if (o.value) {
      a.value = !0, u.value = "";
      try {
        const R = o.value.persona.id;
        await Rp(R), e.value = (await pr()).filter((w) => w.id !== R), n.value = null, o.value = null, t.value = "", r.value = /* @__PURE__ */ new Set(), e.value[0] && await C(e.value[0].id, !0), c.value = "角色已删除";
      } catch (R) {
        u.value = R instanceof Error ? R.message : String(R);
      } finally {
        a.value = !1;
      }
    }
  }
  async function T() {
    if (!o.value || !f.value) return;
    l.value = !0, u.value = "", c.value = "";
    const R = qe(o.value), w = {};
    r.value.has("profile") && (w.profile = () => Pp(R.persona)), r.value.has("capabilities") && (w.capabilities = () => Dp(R.persona.id, R.capabilities.overrides)), r.value.has("grants") && (w.grants = () => Ap(R.persona.id, R.grants.servers));
    const D = await rk(w), P = new Set(D.failedDomains.map((F) => F.domain));
    if (r.value = P, D.savedDomains.length)
      try {
        e.value = await pr();
        const F = e.value.find((Q) => Q.id === R.persona.id) || R.persona, X = await Ol(F);
        n.value = X, o.value = sk(X, R, P);
      } catch (F) {
        const X = qe(n.value || R);
        D.savedDomains.includes("profile") && (X.persona = qe(R.persona)), D.savedDomains.includes("capabilities") && (X.capabilities.overrides = qe(R.capabilities.overrides)), D.savedDomains.includes("grants") && (X.grants.servers = qe(R.grants.servers)), n.value = X, o.value = R, u.value = `配置已保存，但刷新失败：${F instanceof Error ? F.message : String(F)}`;
      }
    D.ok ? c.value = "角色配置已保存" : u.value = D.failedDomains.map((F) => `${F.domain}: ${F.message}`).join("；"), l.value = !1;
  }
  return { personas: e, selectedPersonaId: t, snapshot: n, draft: o, selectedNodeId: i, dirtyDomains: r, loading: s, isSaving: l, operationPending: a, error: u, message: c, isDirty: f, initialize: h, refreshIfClean: m, selectPersona: C, selectNode: N, updateProfile: $, setCapability: I, setServer: A, discard: k, save: T, addDocuments: Y, removeDocument: ne, reindexDocument: G, refreshLive2dResources: B, openLive2dDirectory: M, removeCurrentPersona: Z };
}
const ak = { class: "workbench-toolbar" }, uk = { class: "toolbar-identity" }, ck = { class: "toolbar-actions" }, dk = {
  key: 0,
  class: "dirty-state"
}, fk = ["disabled"], hk = ["disabled"], pk = {
  key: 0,
  class: "workbench-message error"
}, vk = {
  key: 1,
  class: "workbench-message"
}, gk = { class: "workbench-content" }, mk = { class: "workbench-canvas-region" }, yk = {
  key: 0,
  class: "workbench-loading"
}, bk = {
  key: 1,
  class: "workbench-empty"
}, _k = /* @__PURE__ */ Te({
  __name: "App",
  setup(e) {
    const t = lk(), n = re(0), o = re(0), i = ce(() => t.isSaving.value || t.operationPending.value), r = ce(() => t.draft.value ? jp(t.draft.value) : { nodes: [], edges: [] }), s = ce(() => (n.value, qy(Jy(r.value, t.selectedNodeId.value)))), l = ce(() => r.value.nodes.find((M) => M.id === t.selectedNodeId.value));
    function a(M) {
      const E = s.value.nodes.find((Y) => Y.id === M);
      if (E != null && E.data.configurable) {
        if (E.data.kind === "mcp" && E.data.sourceId) {
          t.setServer(E.data.sourceId, !E.data.assigned);
          return;
        }
        t.setCapability(M, E.data.assigned ? "deny" : "allow");
      }
    }
    async function u() {
      var E, Y, ne;
      const M = (Y = (E = t.draft.value) == null ? void 0 : E.persona.profile) == null ? void 0 : Y.tts;
      if (M != null && M.voice_asset_id)
        try {
          const G = await Bp(M.voice_asset_id, M.output_language || "auto"), Z = new Audio(URL.createObjectURL(G)), T = (ne = window.PL) == null ? void 0 : ne.audio;
          T ? await T.play(Z) : await Z.play();
        } catch (G) {
          t.error.value = G instanceof Error ? G.message : String(G);
        }
    }
    function c() {
      var M;
      (M = document.querySelector('[data-view="voice"]')) == null || M.click();
    }
    function f() {
      var M;
      (M = document.querySelector('[data-view="test"]')) == null || M.click();
    }
    async function h() {
      var E;
      const M = (E = t.draft.value) == null ? void 0 : E.persona.name;
      !M || !window.confirm(`永久删除“${M}”及其资料、记忆、向量和对话？此操作无法恢复。`) || await t.removeCurrentPersona();
    }
    async function m(M) {
      window.confirm("从角色资料中删除该文件？知识库向量与本地文件将一并移除。") && await t.removeDocument(M);
    }
    async function C(M, E) {
      await t.addDocuments(M, E) && (o.value += 1);
    }
    function N(M, E) {
      var G, Z;
      const Y = document.querySelector("#preview-title"), ne = document.querySelector("#preview-content");
      !Y || !ne || (Y.textContent = M, ne.replaceChildren(typeof E == "string" ? document.createTextNode(E) : E), (G = document.querySelector("#preview-drawer")) == null || G.classList.add("is-open"), (Z = document.querySelector("#preview-backdrop")) == null || Z.classList.add("is-open"));
    }
    function $() {
      var M, E;
      (M = document.querySelector("#preview-drawer")) == null || M.classList.remove("is-open"), (E = document.querySelector("#preview-backdrop")) == null || E.classList.remove("is-open");
    }
    function I(M) {
      N(String(M.original_filename || M.original_name || "资料预览"), String(M.markdown_preview || M.error_message || "暂无预览内容"));
    }
    async function A(M) {
      if (M.type.startsWith("image/")) {
        const Y = document.createElement("img"), ne = URL.createObjectURL(M);
        Y.src = ne, Y.alt = M.name, Y.style.maxWidth = "100%", Y.onload = () => URL.revokeObjectURL(ne), N(M.name, Y);
        return;
      }
      const E = M.type.startsWith("text/") || /\.(md|txt|json|csv|ya?ml)$/i.test(M.name);
      N(M.name, E ? await M.text() : "该文件将在上传转换后提供 Markdown 预览。");
    }
    function k(M) {
      t.isDirty.value && (M.preventDefault(), M.returnValue = "");
    }
    function _(M) {
      var Y;
      const E = ((Y = M == null ? void 0 : M.detail) == null ? void 0 : Y.nodeId) || sessionStorage.getItem("yumeno.manage.node");
      E && (sessionStorage.removeItem("yumeno.manage.node"), t.selectNode(E));
    }
    async function B() {
      await t.refreshIfClean(), _();
    }
    return mt(async () => {
      var M, E, Y;
      await t.initialize(), _(), window.addEventListener("beforeunload", k), (M = document.querySelector("#role-workbench-root")) == null || M.addEventListener("yumeno:manage-show", B), document.addEventListener("yumeno:manage-select-node", _), (E = document.querySelector("#close-preview")) == null || E.addEventListener("click", $), (Y = document.querySelector("#preview-backdrop")) == null || Y.addEventListener("click", $);
    }), Dn(() => {
      var M, E, Y;
      window.removeEventListener("beforeunload", k), (M = document.querySelector("#role-workbench-root")) == null || M.removeEventListener("yumeno:manage-show", B), document.removeEventListener("yumeno:manage-select-node", _), (E = document.querySelector("#close-preview")) == null || E.removeEventListener("click", $), (Y = document.querySelector("#preview-backdrop")) == null || Y.removeEventListener("click", $);
    }), (M, E) => (U(), W("div", {
      class: xe(["role-workbench", { "is-busy": i.value }])
    }, [
      p("header", ak, [
        p("div", uk, [
          ie(ok, {
            personas: V(t).personas.value,
            "selected-id": V(t).selectedPersonaId.value,
            disabled: i.value,
            onSelect: V(t).selectPersona
          }, null, 8, ["personas", "selected-id", "disabled", "onSelect"]),
          E[3] || (E[3] = p("p", null, "角色运行架构与能力配置", -1))
        ]),
        p("div", ck, [
          V(t).isDirty.value ? (U(), W("span", dk, "存在未保存修改")) : Se("", !0),
          p("button", {
            type: "button",
            disabled: !V(t).isDirty.value || V(t).isSaving.value || V(t).operationPending.value,
            onClick: E[0] || (E[0] = //@ts-ignore
            (...Y) => V(t).discard && V(t).discard(...Y))
          }, [
            ie(V(Ip), { size: 16 }),
            E[4] || (E[4] = Le("撤销"))
          ], 8, fk),
          p("button", {
            type: "button",
            class: "primary",
            disabled: !V(t).isDirty.value || V(t).isSaving.value || V(t).operationPending.value,
            onClick: E[1] || (E[1] = //@ts-ignore
            (...Y) => V(t).save && V(t).save(...Y))
          }, [
            ie(V(Yr), { size: 16 }),
            Le(J(V(t).isSaving.value ? "保存中" : "保存配置"), 1)
          ], 8, hk)
        ])
      ]),
      V(t).error.value ? (U(), W("p", pk, J(V(t).error.value), 1)) : V(t).message.value ? (U(), W("p", vk, J(V(t).message.value), 1)) : Se("", !0),
      p("div", gk, [
        p("main", mk, [
          V(t).loading.value ? (U(), W("div", yk, "正在读取角色架构...")) : V(t).personas.value.length ? (U(), vt(Kx, {
            key: 2,
            graph: s.value,
            "selected-node-id": V(t).selectedNodeId.value,
            onSelect: V(t).selectNode,
            onToggle: a,
            onReset: E[2] || (E[2] = (Y) => n.value++)
          }, null, 8, ["graph", "selected-node-id", "onSelect"])) : (U(), W("div", bk, E[5] || (E[5] = [
            p("strong", null, "还没有角色", -1),
            p("p", null, "先在“创建角色”页面建立角色。", -1)
          ])))
        ]),
        V(t).draft.value ? (U(), vt(W0, {
          key: 0,
          node: l.value,
          draft: V(t).draft.value,
          disabled: i.value,
          "upload-complete-token": o.value,
          onProfile: V(t).updateProfile,
          onCapability: V(t).setCapability,
          onServer: V(t).setServer,
          onUpload: C,
          onDeleteDocument: m,
          onRetryDocument: V(t).reindexDocument,
          onDeletePersona: h,
          onPreviewVoice: u,
          onOpenVoiceStudio: c,
          onOpenRagEval: f,
          onPreviewDocument: I,
          onPreviewLocalFile: A,
          onRefreshLive2d: V(t).refreshLive2dResources,
          onOpenLive2dDirectory: V(t).openLive2dDirectory
        }, null, 8, ["node", "draft", "disabled", "upload-complete-token", "onProfile", "onCapability", "onServer", "onRetryDocument", "onRefreshLive2d", "onOpenLive2dDirectory"])) : Se("", !0)
      ])
    ], 2));
  }
});
let sn = null;
function o2(e = "#role-workbench-root") {
  if (sn) return sn;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("角色工作台挂载点不存在");
  return sn = Ts(_k), sn.mount(t), sn;
}
function i2() {
  var e;
  (e = document.querySelector("#role-workbench-root")) == null || e.dispatchEvent(new CustomEvent("yumeno:manage-show"));
}
function r2() {
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
function wk(e) {
  const t = e.skills || [], n = e.servers || [], o = e.tools || [], i = t.filter((a) => a.enabled).length, r = n.filter((a) => {
    var u;
    return a.enabled && ((u = a.status) == null ? void 0 : u.status) === "connected";
  }).length, s = n.filter((a) => {
    var u, c;
    return ((u = a.status) == null ? void 0 : u.status) === "error" || a.enabled && ((c = a.status) == null ? void 0 : c.status) !== "connected";
  }).length, l = t.filter((a) => !a.builtin && !a.trusted).length;
  return { enabledSkills: i, mcpOnline: r, mcpIssues: s, toolCount: o.length, attentionCount: s + l };
}
function ja(e) {
  const t = {};
  for (const n of e.split(/\r?\n/)) {
    const o = n.trim();
    if (!o) continue;
    const i = o.indexOf("="), r = o.indexOf(":"), s = i > 0 && (r < 0 || i < r) ? i : r;
    s > 0 && (t[o.slice(0, s).trim()] = o.slice(s + 1).trim());
  }
  return t;
}
const Ek = { class: "yv-page extension-page" }, xk = { class: "extension-hero" }, kk = { class: "hero-actions" }, Sk = ["disabled"], Ck = {
  class: "signal-strip",
  "aria-label": "能力状态"
}, Nk = { class: "extension-tabs" }, $k = ["onClick"], Mk = {
  key: 1,
  class: "overview-layout"
}, Ik = { class: "overview-foot" }, Ok = {
  key: 0,
  class: "yv-empty"
}, Tk = { class: "quick-entry" }, Pk = {
  key: 2,
  class: "content-section"
}, Dk = {
  key: 0,
  class: "yv-empty"
}, Ak = { class: "row-main" }, Rk = { class: "tag-line" }, Lk = { class: "row-actions" }, Vk = ["title", "onClick"], zk = ["onClick"], Bk = ["onClick"], Fk = ["onClick"], Hk = {
  key: 3,
  class: "content-section"
}, jk = {
  key: 0,
  class: "yv-empty"
}, Uk = { class: "row-main" }, Gk = { class: "grant-field" }, Yk = ["value", "onChange"], Xk = { class: "row-actions" }, Wk = ["onClick"], qk = ["onClick"], Kk = ["onClick"], Zk = {
  key: 4,
  class: "content-section"
}, Jk = { class: "filter-input" }, Qk = {
  key: 0,
  class: "yv-empty"
}, eS = { class: "row-main" }, tS = {
  key: 5,
  class: "content-section"
}, nS = { class: "catalog-tools" }, oS = { class: "filter-input" }, iS = { class: "catalog-grid" }, rS = { class: "tag-line" }, sS = ["disabled", "onClick"], lS = { class: "dialog-head" }, aS = { class: "yv-kicker" }, uS = { class: "yv-field" }, cS = ["readonly"], dS = { class: "yv-field" }, fS = { class: "yv-field" }, hS = { class: "yv-field" }, pS = { class: "tool-options" }, vS = ["value"], gS = {
  class: "yv-button primary",
  type: "submit"
}, mS = { class: "yv-field" }, yS = { class: "yv-field" }, bS = { class: "transport-tabs" }, _S = ["onClick"], wS = { class: "yv-field" }, ES = { class: "yv-field" }, xS = { class: "yv-field" }, kS = { class: "yv-field" }, SS = { class: "yv-field" }, CS = {
  class: "yv-button primary",
  type: "submit"
}, NS = { class: "dialog-head" }, $S = { class: "dialog-body" }, MS = { class: "catalog-detail" }, IS = /* @__PURE__ */ Te({
  __name: "App",
  setup(e) {
    const t = [
      { id: "overview", label: "总览" },
      { id: "skills", label: "技能" },
      { id: "mcp", label: "MCP 服务" },
      { id: "tools", label: "工具目录" },
      { id: "catalog", label: "在线扩展" }
    ], n = xn({ skills: [], servers: [], tools: [] }), o = re("overview"), i = re(!1), r = re(""), s = re(!1), l = re(""), a = re(null), u = re("skill"), c = re(null), f = re(null), h = re([]), m = re(!1), C = re(""), N = re("all"), $ = re(null), I = re([]), A = re(null), k = xn({ name: "", description: "", instructions: "", prompt_hint: "", tool_names: [] }), _ = xn({ name: "", description: "", transport: "stdio", command: "", args: "", env: "", url: "", headers: "" }), B = ce(() => wk(n)), M = ce(() => {
      const H = l.value.trim().toLowerCase();
      return n.tools.filter((d) => !H || [d.name, d.server, d.description].some((x) => String(x || "").toLowerCase().includes(H)));
    }), E = ce(() => {
      const H = C.value.trim().toLowerCase();
      return h.value.filter((d) => !H || [d.id, d.name, d.description, ...d.categories || []].join(" ").toLowerCase().includes(H));
    }), Y = ce(() => Object.entries(n.skills.reduce((H, d) => {
      var v;
      const x = ((v = d.metadata) == null ? void 0 : v.category) || "其他";
      return (H[x] || (H[x] = [])).push(d), H;
    }, {})).sort(([H], [d]) => H.localeCompare(d, "zh")));
    let ne = 0;
    function G(H, d = !1) {
      r.value = H, s.value = d;
    }
    async function Z(H = !1) {
      H || (i.value = !0);
      try {
        const [d, x, v, g] = await Promise.all([
          Ve("/api/skills"),
          Ve("/api/mcp/servers"),
          Ve("/api/mcp/tools"),
          Ve("/api/skills/tools")
        ]);
        n.skills = d, n.servers = x, n.tools = v, I.value = g, H || G("扩展状态已刷新");
      } catch (d) {
        G(rt(d), !0);
      } finally {
        i.value = !1;
      }
    }
    function T() {
      R(), ne = window.setInterval(() => Z(!0), 3e4);
    }
    function R() {
      ne && window.clearInterval(ne), ne = 0;
    }
    async function w() {
      await Z(!0), T();
    }
    function D() {
      A.value = null, Object.assign(k, { name: "", description: "", instructions: "", prompt_hint: "", tool_names: [] });
    }
    function P(H) {
      D(), u.value = "skill", H && (A.value = H.name, Object.assign(k, { name: H.name, description: H.description || "", instructions: H.instructions || "", prompt_hint: H.prompt_hint || "", tool_names: [...H.tool_names || []] })), Ze(() => {
        var d;
        return (d = a.value) == null ? void 0 : d.showModal();
      });
    }
    function F() {
      u.value = "mcp", Object.assign(_, { name: "", description: "", transport: "stdio", command: "", args: "", env: "", url: "", headers: "" }), Ze(() => {
        var H;
        return (H = a.value) == null ? void 0 : H.showModal();
      });
    }
    async function X() {
      var H;
      if (!k.name.trim() || !k.instructions.trim()) return G("名称与提示词不能为空", !0);
      i.value = !0;
      try {
        const d = { description: k.description.trim(), instructions: k.instructions.trim(), prompt_hint: k.prompt_hint.trim(), tool_names: k.tool_names };
        A.value ? await Ve(`/api/skills/${encodeURIComponent(A.value)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }) : await Ve("/api/skills", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: k.name.trim(), ...d }) }), (H = a.value) == null || H.close(), await Z(!0), G(A.value ? "技能修改已保存" : "技能已创建");
      } catch (d) {
        G(rt(d), !0);
      } finally {
        i.value = !1;
      }
    }
    async function Q(H, d) {
      try {
        await Ve(`/api/skills/${encodeURIComponent(H.name)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }), await Z(!0), G("技能状态已更新");
      } catch (x) {
        G(rt(x), !0);
      }
    }
    async function oe(H) {
      if (confirm(`删除技能 ${H.name}？`))
        try {
          await Ve(`/api/skills/${encodeURIComponent(H.name)}`, { method: "DELETE" }), await Z(!0), G("技能已删除");
        } catch (d) {
          G(rt(d), !0);
        }
    }
    async function ue(H) {
      var x;
      if (!H) return;
      const d = new FormData();
      d.append("file", H);
      try {
        const v = await Ve("/api/skills/upload", { method: "POST", body: d });
        await Z(!0), G((x = v.installed) != null && x.length ? `已安装：${v.installed.join("、")}` : "上传完成");
      } catch (v) {
        G(rt(v), !0);
      } finally {
        c.value && (c.value.value = "");
      }
    }
    async function ee() {
      var H;
      if (!_.name.trim()) return G("服务器名称不能为空", !0);
      try {
        await Ve("/api/mcp/servers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: _.name.trim(), description: _.description.trim(), transport: _.transport, command: _.command.trim(), args: _.args.split(/\r?\n/).map((d) => d.trim()).filter(Boolean), env: ja(_.env), url: _.url.trim(), headers: ja(_.headers), enabled: !0 }) }), (H = a.value) == null || H.close(), await Z(!0), G("MCP 服务已保存并连接");
      } catch (d) {
        G(rt(d), !0);
      }
    }
    async function le(H) {
      try {
        await Ve(`/api/mcp/servers/${encodeURIComponent(H.name)}/${H.enabled ? "disable" : "enable"}`, { method: "POST" }), await Z(!0);
      } catch (d) {
        G(rt(d), !0);
      }
    }
    async function j(H) {
      G(`正在测试 ${H.name}…`);
      try {
        const d = await Ve(`/api/mcp/servers/${encodeURIComponent(H.name)}/test`, { method: "POST" });
        G(d.ok ? `${H.name} 连接正常：${d.tool_count} 个工具，耗时 ${d.elapsed_ms}ms` : `${H.name} 连接失败：${d.error}`, !d.ok), await Z(!0);
      } catch (d) {
        G(rt(d), !0);
      }
    }
    async function ge(H, d) {
      const v = d.target.value.split(",").map((g) => g.trim()).filter(Boolean);
      try {
        await Ve(`/api/mcp/servers/${encodeURIComponent(H.name)}/grants`, { method: "PATCH", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" }, body: JSON.stringify({ allowed_persona_ids: v }) }), G(`已更新 ${H.name} 的授权`);
      } catch (g) {
        G(rt(g), !0);
      }
    }
    async function _e(H) {
      if (confirm(`删除 MCP 服务器 ${H.name}？其工具将立即不可用。`))
        try {
          await Ve(`/api/mcp/servers/${encodeURIComponent(H.name)}`, { method: "DELETE" }), await Z(!0), G("MCP 服务已删除");
        } catch (d) {
          G(rt(d), !0);
        }
    }
    async function ye(H = !1) {
      try {
        const d = await Ve(`/api/extensions/catalog?kind=${encodeURIComponent(N.value)}${H ? "&refresh=true" : ""}`);
        h.value = d.items || [], m.value = !!d.stale;
      } catch {
        G("在线扩展目录暂时不可用，可稍后重试", !0), h.value = [];
      }
    }
    function we(H) {
      return H.kind === "skill" ? n.skills.some((d) => d.name === H.id) : n.servers.some((d) => d.name === H.id);
    }
    function fe(H) {
      $.value = H, Ze(() => {
        var d;
        return (d = f.value) == null ? void 0 : d.showModal();
      });
    }
    async function pe() {
      var d, x, v;
      const H = $.value;
      if (H)
        try {
          const g = await Ve(`/api/extensions/catalog/${encodeURIComponent(H.id)}/install`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmed: !1 }) });
          if ((x = (d = g.preview) == null ? void 0 : d.conflicts) != null && x.length) throw new Error(g.preview.conflicts.join("；"));
          const y = await Ve(`/api/extensions/catalog/${encodeURIComponent(H.id)}/install`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmed: !0 }) });
          if (y.status !== "installed") throw new Error(y.message || "安装未完成");
          await Z(!0), (v = f.value) == null || v.close(), G(H.kind === "skill" ? "安装完成，请在技能页启用并信任" : "安装完成，请在 MCP 页启用并授权角色");
        } catch (g) {
          G(rt(g), !0);
        }
    }
    return mt(() => {
      const H = document.querySelector("#extensions-app-root");
      H == null || H.addEventListener("yumeno:extensions-show", w), H == null || H.addEventListener("yumeno:extensions-hide", R), w();
    }), Dn(() => R()), (H, d) => {
      var x, v, g, y, b, O, L, z;
      return U(), W("main", Ek, [
        p("header", xk, [
          d[26] || (d[26] = p("div", null, [
            p("span", { class: "yv-kicker" }, "Agent capability registry"),
            p("h1", null, "能力扩展"),
            p("p", null, "统一管理角色可调用的 Skill、Tool 与 MCP 服务。")
          ], -1)),
          p("div", kk, [
            p("span", {
              class: xe(["yv-status", B.value.attentionCount ? "warn" : "ok"])
            }, J(B.value.attentionCount ? `${B.value.attentionCount} 项待处理` : "运行正常"), 3),
            p("button", {
              class: "yv-button yv-icon-button",
              title: "刷新",
              disabled: i.value,
              onClick: d[0] || (d[0] = (S) => Z())
            }, [
              ie(V(Gr))
            ], 8, Sk)
          ])
        ]),
        p("section", Ck, [
          p("div", null, [
            d[27] || (d[27] = p("span", null, "已启用技能", -1)),
            p("strong", null, J(B.value.enabledSkills), 1),
            p("small", null, "共 " + J(n.skills.length) + " 个", 1)
          ]),
          p("div", null, [
            d[28] || (d[28] = p("span", null, "MCP 在线", -1)),
            p("strong", null, J(B.value.mcpOnline), 1),
            p("small", null, J(B.value.mcpIssues) + " 项异常", 1)
          ]),
          p("div", null, [
            d[29] || (d[29] = p("span", null, "已注册工具", -1)),
            p("strong", null, J(B.value.toolCount), 1),
            d[30] || (d[30] = p("small", null, "统一工具注册表", -1))
          ]),
          p("div", null, [
            d[31] || (d[31] = p("span", null, "需要处理", -1)),
            p("strong", null, J(B.value.attentionCount), 1),
            d[32] || (d[32] = p("small", null, "信任与连接状态", -1))
          ])
        ]),
        p("nav", Nk, [
          (U(), W(me, null, Re(t, (S) => p("button", {
            key: S.id,
            class: xe({ active: o.value === S.id }),
            onClick: (K) => {
              o.value = S.id, S.id === "catalog" && ye(!1);
            }
          }, J(S.label), 11, $k)), 64))
        ]),
        r.value ? (U(), W("p", {
          key: 0,
          class: xe(["extension-message", { error: s.value }]),
          role: "status"
        }, J(r.value), 3)) : Se("", !0),
        o.value === "overview" ? (U(), W("section", Mk, [
          d[37] || (d[37] = Nh('<div class="capability-line"><article><span>决策层</span><strong>Agent</strong><p>选择是否调用扩展能力</p></article><article class="skill"><span>指令层</span><strong>Skill</strong><p>按场景注入执行规则</p></article><article class="tool"><span>执行层</span><strong>Tool</strong><p>标准化系统动作</p></article><article class="mcp"><span>协议层</span><strong>MCP</strong><p>连接外部工具服务</p></article></div>', 1)),
          p("div", Ik, [
            p("div", null, [
              d[33] || (d[33] = p("h2", null, "当前连接", -1)),
              n.servers.length ? Se("", !0) : (U(), W("p", Ok, "尚未配置 MCP 服务")),
              (U(!0), W(me, null, Re(n.servers, (S) => {
                var K, q, te;
                return U(), W("div", {
                  key: S.name,
                  class: "health-row"
                }, [
                  p("strong", null, J(S.name), 1),
                  p("span", null, J(S.description || "外部工具服务"), 1),
                  p("em", {
                    class: xe(["yv-status", ((K = S.status) == null ? void 0 : K.status) === "connected" ? "ok" : "warn"])
                  }, J(((q = S.status) == null ? void 0 : q.status) === "connected" ? `${S.status.tool_count} 个工具` : ((te = S.status) == null ? void 0 : te.status) === "error" ? "连接异常" : "未连接"), 3)
                ]);
              }), 128))
            ]),
            p("div", Tk, [
              d[36] || (d[36] = p("h2", null, "管理入口", -1)),
              p("button", {
                class: "yv-button primary",
                onClick: d[1] || (d[1] = (S) => P())
              }, [
                ie(V(uo)),
                d[34] || (d[34] = Le("新增技能"))
              ]),
              p("button", {
                class: "yv-button",
                onClick: d[2] || (d[2] = (S) => F())
              }, [
                ie(V(uo)),
                d[35] || (d[35] = Le("新增 MCP 服务"))
              ])
            ])
          ])
        ])) : o.value === "skills" ? (U(), W("section", Pk, [
          p("header", null, [
            d[40] || (d[40] = p("div", null, [
              p("span", { class: "yv-kicker" }, "Instruction packages"),
              p("h2", null, "技能"),
              p("p", null, "为 Agent 提供按需加载的规则与工具组合。")
            ], -1)),
            p("div", null, [
              p("input", {
                ref_key: "uploadInput",
                ref: c,
                hidden: "",
                type: "file",
                accept: ".zip",
                onChange: d[3] || (d[3] = (S) => {
                  var K;
                  return ue((K = S.target.files) == null ? void 0 : K[0]);
                })
              }, null, 544),
              p("button", {
                class: "yv-button",
                onClick: d[4] || (d[4] = (S) => {
                  var K;
                  return (K = c.value) == null ? void 0 : K.click();
                })
              }, [
                ie(V(Wr)),
                d[38] || (d[38] = Le("上传技能包"))
              ]),
              p("button", {
                class: "yv-button primary",
                onClick: d[5] || (d[5] = (S) => P())
              }, [
                ie(V(uo)),
                d[39] || (d[39] = Le("新增技能"))
              ])
            ])
          ]),
          n.skills.length ? Se("", !0) : (U(), W("div", Dk, "还没有技能")),
          (U(!0), W(me, null, Re(Y.value, ([S, K]) => (U(), W("section", {
            key: S,
            class: "skill-group"
          }, [
            p("h3", null, J(S), 1),
            (U(!0), W(me, null, Re(K, (q) => (U(), W("article", {
              key: q.name,
              class: "extension-row kind-skill"
            }, [
              p("div", Ak, [
                p("div", null, [
                  p("strong", null, J(q.name), 1),
                  p("span", null, J(q.builtin ? "内置" : "自定义") + " · " + J(q.format === "skillmd" ? "标准包" : "JSON"), 1)
                ]),
                p("p", null, J(q.description || "暂无说明"), 1),
                p("div", Rk, [
                  (U(!0), W(me, null, Re(q.tool_names, (te) => (U(), W("span", { key: te }, J(te), 1))), 128))
                ])
              ]),
              p("div", Lk, [
                p("span", {
                  class: xe(["yv-status", q.enabled ? "ok" : "warn"])
                }, J(q.enabled ? "已启用" : "已停用"), 3),
                p("button", {
                  class: "yv-button yv-icon-button",
                  title: q.enabled ? "停用" : "启用",
                  onClick: (te) => Q(q, { enabled: !q.enabled })
                }, [
                  ie(V(Mp))
                ], 8, Vk),
                !q.builtin && !q.trusted ? (U(), W("button", {
                  key: 0,
                  class: "yv-button",
                  onClick: (te) => Q(q, { trusted: !0 })
                }, "信任", 8, zk)) : Se("", !0),
                q.builtin ? Se("", !0) : (U(), W("button", {
                  key: 1,
                  class: "yv-button yv-icon-button",
                  title: "编辑",
                  onClick: (te) => P(q)
                }, [
                  ie(V(kp))
                ], 8, Bk)),
                q.builtin ? Se("", !0) : (U(), W("button", {
                  key: 2,
                  class: "yv-button yv-icon-button danger",
                  title: "删除",
                  onClick: (te) => oe(q)
                }, [
                  ie(V(_o))
                ], 8, Fk))
              ])
            ]))), 128))
          ]))), 128))
        ])) : o.value === "mcp" ? (U(), W("section", Hk, [
          p("header", null, [
            d[42] || (d[42] = p("div", null, [
              p("span", { class: "yv-kicker" }, "External protocol services"),
              p("h2", null, "MCP 服务"),
              p("p", null, "连接、测试并限制外部服务可访问的角色。")
            ], -1)),
            p("button", {
              class: "yv-button primary",
              onClick: d[6] || (d[6] = (S) => F())
            }, [
              ie(V(uo)),
              d[41] || (d[41] = Le("新增服务"))
            ])
          ]),
          n.servers.length ? Se("", !0) : (U(), W("div", jk, "尚未配置 MCP 服务")),
          (U(!0), W(me, null, Re(n.servers, (S) => {
            var K, q, te, se, ve;
            return U(), W("article", {
              key: S.name,
              class: "extension-row kind-mcp"
            }, [
              p("div", Uk, [
                p("div", null, [
                  p("strong", null, J(S.name), 1),
                  p("span", null, J(S.transport) + " · " + J(S.enabled ? "已启用" : "已停用"), 1)
                ]),
                p("p", null, J(S.description || ((K = S.status) == null ? void 0 : K.error) || "暂无说明"), 1),
                p("label", Gk, [
                  d[43] || (d[43] = p("span", null, "授权角色", -1)),
                  p("input", {
                    value: (S.allowed_persona_ids || []).join(","),
                    placeholder: "* 或角色 ID，逗号分隔",
                    onChange: (Ee) => ge(S, Ee)
                  }, null, 40, Yk)
                ])
              ]),
              p("div", Xk, [
                p("span", {
                  class: xe(["yv-status", ((q = S.status) == null ? void 0 : q.status) === "connected" ? "ok" : ((te = S.status) == null ? void 0 : te.status) === "error" ? "error" : "warn"])
                }, J(((se = S.status) == null ? void 0 : se.status) === "connected" ? `${S.status.tool_count} 个工具` : ((ve = S.status) == null ? void 0 : ve.status) === "error" ? "连接失败" : "等待连接"), 3),
                p("button", {
                  class: "yv-button",
                  onClick: (Ee) => j(S)
                }, "测试", 8, Wk),
                p("button", {
                  class: "yv-button",
                  onClick: (Ee) => le(S)
                }, J(S.enabled ? "停用" : "启用"), 9, qk),
                p("button", {
                  class: "yv-button yv-icon-button danger",
                  title: "删除",
                  onClick: (Ee) => _e(S)
                }, [
                  ie(V(_o))
                ], 8, Kk)
              ])
            ]);
          }), 128))
        ])) : o.value === "tools" ? (U(), W("section", Zk, [
          p("header", null, [
            d[44] || (d[44] = p("div", null, [
              p("span", { class: "yv-kicker" }, "Unified registry"),
              p("h2", null, "工具目录"),
              p("p", null, "查看内置工具与 MCP 工具的统一注册结果。")
            ], -1)),
            p("label", Jk, [
              ie(V(Xr)),
              Xe(p("input", {
                "onUpdate:modelValue": d[7] || (d[7] = (S) => l.value = S),
                placeholder: "搜索工具名、服务或描述"
              }, null, 512), [
                [it, l.value]
              ])
            ])
          ]),
          M.value.length ? Se("", !0) : (U(), W("div", Qk, "没有匹配的工具")),
          (U(!0), W(me, null, Re(M.value, (S) => (U(), W("article", {
            key: `${S.server}/${S.name}`,
            class: "extension-row kind-tool"
          }, [
            p("div", eS, [
              p("div", null, [
                p("strong", null, J(S.name), 1),
                p("span", null, J(S.server || "内置"), 1)
              ]),
              p("p", null, J(S.description || "暂无说明"), 1)
            ]),
            p("span", {
              class: xe(["yv-status", S.requires_confirmation ? "warn" : "ok"])
            }, J(S.requires_confirmation ? "调用需确认" : "可直接调用"), 3)
          ]))), 128))
        ])) : (U(), W("section", tS, [
          p("header", null, [
            d[46] || (d[46] = p("div", null, [
              p("span", { class: "yv-kicker" }, "Curated catalog"),
              p("h2", null, "在线扩展"),
              p("p", null, "先检查来源与权限，再将扩展加入本地能力系统。")
            ], -1)),
            p("button", {
              class: "yv-button",
              onClick: d[8] || (d[8] = (S) => ye(!0))
            }, [
              ie(V(Gr)),
              d[45] || (d[45] = Le("刷新目录"))
            ])
          ]),
          p("div", nS, [
            p("label", oS, [
              ie(V(Xr)),
              Xe(p("input", {
                "onUpdate:modelValue": d[9] || (d[9] = (S) => C.value = S),
                placeholder: "搜索名称、说明或分类"
              }, null, 512), [
                [it, C.value]
              ])
            ]),
            Xe(p("select", {
              "onUpdate:modelValue": d[10] || (d[10] = (S) => N.value = S),
              onChange: d[11] || (d[11] = (S) => ye(!1))
            }, d[47] || (d[47] = [
              p("option", { value: "all" }, "全部类型", -1),
              p("option", { value: "skill" }, "Skill", -1),
              p("option", { value: "mcp" }, "MCP", -1)
            ]), 544), [
              [Ur, N.value]
            ]),
            p("span", {
              class: xe(["yv-status", m.value ? "warn" : "ok"])
            }, J(m.value ? "缓存目录" : `${h.value.length} 个条目`), 3)
          ]),
          p("div", iS, [
            (U(!0), W(me, null, Re(E.value, (S) => (U(), W("article", {
              key: S.id,
              class: xe(["catalog-item", `kind-${S.kind}`])
            }, [
              p("span", null, J(S.kind.toUpperCase()), 1),
              p("h3", null, J(S.name || S.id), 1),
              p("small", null, "v" + J(S.version || "未知") + " · " + J(S.id), 1),
              p("p", null, J(S.description || "暂无说明"), 1),
              p("div", rS, [
                (U(!0), W(me, null, Re(S.categories, (K) => (U(), W("span", { key: K }, J(K), 1))), 128))
              ]),
              p("button", {
                class: "yv-button",
                disabled: we(S),
                onClick: (K) => fe(S)
              }, J(we(S) ? "已安装" : "查看并安装"), 9, sS)
            ], 2))), 128))
          ])
        ])),
        p("dialog", {
          ref_key: "drawer",
          ref: a,
          class: "yv-dialog"
        }, [
          p("header", lS, [
            p("div", null, [
              p("span", aS, J(u.value === "skill" ? "Instruction package" : "Protocol service"), 1),
              p("h2", null, J(u.value === "skill" ? A.value ? `编辑 ${A.value}` : "新增技能" : "新增 MCP 服务"), 1)
            ]),
            p("button", {
              class: "yv-button yv-icon-button",
              title: "关闭",
              onClick: d[12] || (d[12] = (S) => {
                var K;
                return (K = a.value) == null ? void 0 : K.close();
              })
            }, [
              ie(V(Il))
            ])
          ]),
          u.value === "skill" ? (U(), W("form", {
            key: 0,
            class: "dialog-body",
            onSubmit: Mo(X, ["prevent"])
          }, [
            p("label", uS, [
              d[48] || (d[48] = p("span", null, "名称", -1)),
              Xe(p("input", {
                "onUpdate:modelValue": d[13] || (d[13] = (S) => k.name = S),
                readonly: !!A.value
              }, null, 8, cS), [
                [it, k.name]
              ])
            ]),
            p("label", dS, [
              d[49] || (d[49] = p("span", null, "描述", -1)),
              Xe(p("input", {
                "onUpdate:modelValue": d[14] || (d[14] = (S) => k.description = S)
              }, null, 512), [
                [it, k.description]
              ])
            ]),
            p("label", fS, [
              d[50] || (d[50] = p("span", null, "提示词", -1)),
              Xe(p("textarea", {
                "onUpdate:modelValue": d[15] || (d[15] = (S) => k.instructions = S),
                rows: "6"
              }, null, 512), [
                [it, k.instructions]
              ])
            ]),
            p("label", hS, [
              d[51] || (d[51] = p("span", null, "触发提示", -1)),
              Xe(p("input", {
                "onUpdate:modelValue": d[16] || (d[16] = (S) => k.prompt_hint = S)
              }, null, 512), [
                [it, k.prompt_hint]
              ])
            ]),
            p("fieldset", pS, [
              d[52] || (d[52] = p("legend", null, "可附加工具", -1)),
              (U(!0), W(me, null, Re(I.value, (S) => (U(), W("label", {
                key: S.name
              }, [
                Xe(p("input", {
                  "onUpdate:modelValue": d[17] || (d[17] = (K) => k.tool_names = K),
                  type: "checkbox",
                  value: S.name
                }, null, 8, vS), [
                  [ip, k.tool_names]
                ]),
                p("span", null, J(S.name) + J(S.requires_confirmation ? "（需确认）" : ""), 1)
              ]))), 128))
            ]),
            p("button", gS, [
              ie(V(Yr)),
              d[53] || (d[53] = Le("保存技能"))
            ])
          ], 32)) : (U(), W("form", {
            key: 1,
            class: "dialog-body",
            onSubmit: Mo(ee, ["prevent"])
          }, [
            p("label", mS, [
              d[54] || (d[54] = p("span", null, "名称", -1)),
              Xe(p("input", {
                "onUpdate:modelValue": d[18] || (d[18] = (S) => _.name = S)
              }, null, 512), [
                [it, _.name]
              ])
            ]),
            p("label", yS, [
              d[55] || (d[55] = p("span", null, "描述", -1)),
              Xe(p("input", {
                "onUpdate:modelValue": d[19] || (d[19] = (S) => _.description = S)
              }, null, 512), [
                [it, _.description]
              ])
            ]),
            p("div", bS, [
              (U(), W(me, null, Re([{ id: "stdio", label: "本地进程" }, { id: "streamable_http", label: "远程 HTTP" }, { id: "sse", label: "远程 SSE" }], (S) => p("button", {
                key: S.id,
                type: "button",
                class: xe({ active: _.transport === S.id }),
                onClick: (K) => _.transport = S.id
              }, J(S.label), 11, _S)), 64))
            ]),
            _.transport === "stdio" ? (U(), W(me, { key: 0 }, [
              p("label", wS, [
                d[56] || (d[56] = p("span", null, "启动命令", -1)),
                Xe(p("input", {
                  "onUpdate:modelValue": d[20] || (d[20] = (S) => _.command = S)
                }, null, 512), [
                  [it, _.command]
                ])
              ]),
              p("label", ES, [
                d[57] || (d[57] = p("span", null, "参数（每行一个）", -1)),
                Xe(p("textarea", {
                  "onUpdate:modelValue": d[21] || (d[21] = (S) => _.args = S),
                  rows: "3"
                }, null, 512), [
                  [it, _.args]
                ])
              ]),
              p("label", xS, [
                d[58] || (d[58] = p("span", null, "环境变量（KEY=VALUE）", -1)),
                Xe(p("textarea", {
                  "onUpdate:modelValue": d[22] || (d[22] = (S) => _.env = S),
                  rows: "3"
                }, null, 512), [
                  [it, _.env]
                ])
              ])
            ], 64)) : (U(), W(me, { key: 1 }, [
              p("label", kS, [
                d[59] || (d[59] = p("span", null, "服务器地址", -1)),
                Xe(p("input", {
                  "onUpdate:modelValue": d[23] || (d[23] = (S) => _.url = S)
                }, null, 512), [
                  [it, _.url]
                ])
              ]),
              p("label", SS, [
                d[60] || (d[60] = p("span", null, "请求头（KEY: VALUE）", -1)),
                Xe(p("textarea", {
                  "onUpdate:modelValue": d[24] || (d[24] = (S) => _.headers = S),
                  rows: "3"
                }, null, 512), [
                  [it, _.headers]
                ])
              ])
            ], 64)),
            p("button", CS, [
              ie(V(Yr)),
              d[61] || (d[61] = Le("保存服务"))
            ])
          ], 32))
        ], 512),
        p("dialog", {
          ref_key: "catalogDialog",
          ref: f,
          class: "yv-dialog"
        }, [
          p("header", NS, [
            p("div", null, [
              d[62] || (d[62] = p("span", { class: "yv-kicker" }, "安装预览", -1)),
              p("h2", null, J(((x = $.value) == null ? void 0 : x.name) || ((v = $.value) == null ? void 0 : v.id)), 1)
            ]),
            p("button", {
              class: "yv-button yv-icon-button",
              title: "关闭",
              onClick: d[25] || (d[25] = (S) => {
                var K;
                return (K = f.value) == null ? void 0 : K.close();
              })
            }, [
              ie(V(Il))
            ])
          ]),
          p("div", $S, [
            p("p", null, J(((g = $.value) == null ? void 0 : g.description) || "暂无说明"), 1),
            p("dl", MS, [
              d[63] || (d[63] = p("dt", null, "类型", -1)),
              p("dd", null, J((b = (y = $.value) == null ? void 0 : y.kind) == null ? void 0 : b.toUpperCase()), 1),
              d[64] || (d[64] = p("dt", null, "版本", -1)),
              p("dd", null, J(((O = $.value) == null ? void 0 : O.version) || "未知"), 1),
              d[65] || (d[65] = p("dt", null, "来源", -1)),
              p("dd", null, J(((z = (L = $.value) == null ? void 0 : L.source) == null ? void 0 : z.type) || "未知"), 1)
            ]),
            p("button", {
              class: "yv-button primary",
              onClick: pe
            }, [
              ie(V(oc)),
              d[66] || (d[66] = Le("确认安装"))
            ])
          ])
        ], 512)
      ]);
    };
  }
});
let ln = null;
const Bd = () => document.querySelector("#extensions-app-root");
function s2(e = "#extensions-app-root") {
  if (ln) return ln;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("能力扩展挂载点不存在");
  return ln = Ts(IS), ln.mount(t), ln;
}
function l2() {
  var e;
  (e = Bd()) == null || e.dispatchEvent(new CustomEvent("yumeno:extensions-show"));
}
function a2() {
  var e;
  (e = Bd()) == null || e.dispatchEvent(new CustomEvent("yumeno:extensions-hide"));
}
function u2() {
  ln && (ln.unmount(), ln = null);
}
const OS = /* @__PURE__ */ new Set([
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
function oi(e, t) {
  if (e === "scope_isolation_ok") return t ? "通过" : "未通过";
  const n = Number(t);
  return OS.has(e) && Number.isFinite(n) ? `${Math.round(n * 100)}%` : typeof t == "number" && Number.isFinite(n) ? Number.isInteger(n) ? String(n) : n.toFixed(3) : String(t ?? "—");
}
function TS(e, t) {
  return t ? Math.max(0, Math.min(100, Math.round(e / t * 100))) : 0;
}
const PS = { class: "yv-page evaluation-page" }, DS = { class: "evaluation-hero" }, AS = { class: "evaluation-control" }, RS = { class: "control-fields" }, LS = { class: "yv-field" }, VS = ["value"], zS = { class: "yv-field" }, BS = { class: "control-actions" }, FS = ["disabled"], HS = ["disabled"], jS = ["href"], US = { class: "run-status" }, GS = {
  key: 0,
  class: "results-stage"
}, YS = { class: "metric-lead" }, XS = { class: "metric-groups" }, WS = {
  key: 0,
  class: "analysis-block"
}, qS = { class: "case-section" }, KS = { class: "case-index" }, ZS = {
  key: 1,
  class: "evaluation-empty"
}, JS = /* @__PURE__ */ Te({
  __name: "App",
  setup(e) {
    const t = re([]), n = re(""), o = re("fast"), i = re({ state: "idle", progress: 0, total: 0 }), r = re(null), s = re(""), l = re(""), a = re(!1), u = re(!1), c = re(!1);
    let f = 0;
    const h = ce(() => ({ idle: "未运行", running: i.value.phase === "generating" ? "生成问题" : "评测中", done: "已完成", error: "失败" })[i.value.state] || i.value.state || "未运行"), m = ce(() => TS(Number(i.value.progress || 0), Number(i.value.total || 0))), C = ce(() => {
      var T;
      return ((T = r.value) == null ? void 0 : T.cases) || [];
    }), N = ce(() => c.value ? C.value : C.value.slice(0, 3)), $ = ce(() => {
      var R;
      const T = ((R = r.value) == null ? void 0 : R.metrics) || {};
      return [
        { label: "Top 3 召回率", value: oi("recall_at_3_answerable", T.recall_at_3_answerable), tone: k("recall_at_3_answerable", T.recall_at_3_answerable) },
        { label: "回答接地率", value: oi("grounded_rate", T.grounded_rate), tone: k("grounded_rate", T.grounded_rate) },
        { label: "质量通过率", value: oi("accepted_rate", T.accepted_rate), tone: k("accepted_rate", T.accepted_rate) },
        { label: "P95 总延迟", value: T.p95_total_latency_ms == null ? "—" : `${Math.round(Number(T.p95_total_latency_ms))} ms`, tone: "" }
      ];
    }), I = [
      { title: "检索质量", keys: ["recall_at_3_answerable", "precision_at_3_answerable", "mrr_at_3_answerable", "hit_at_3_answerable", "cases_answerable", "mean_latency_ms", "p95_latency_ms"] },
      { title: "回答质量", keys: ["grounded_rate", "useful_rate", "accepted_rate", "answer_rate", "refusal_rate", "cases_checked", "mean_confidence", "scope_isolation_ok"] },
      { title: "行为与性能", keys: ["rewrite_rate", "correction_rate", "mean_rewrite_count", "mean_correction_count", "complex_rewrite_rate", "complex_correction_rate", "probe_refusal_rate", "cases_total", "cases_complex", "mean_total_latency_ms", "p95_total_latency_ms"] }
    ], A = { recall_at_3_answerable: "可答问题召回率 Recall@3", precision_at_3_answerable: "可答问题精确率 Precision@3", mrr_at_3_answerable: "可答问题 MRR@3", hit_at_3_answerable: "可答问题命中 Hit@3", cases_answerable: "可答用例数", mean_latency_ms: "平均检索延迟 (ms)", p95_latency_ms: "P95 检索延迟 (ms)", grounded_rate: "事实接地率", useful_rate: "问题解决率", accepted_rate: "质量通过率", answer_rate: "正常作答率", refusal_rate: "拒答率", cases_checked: "生成已检用例", mean_confidence: "平均置信度", scope_isolation_ok: "跨角色隔离校验", rewrite_rate: "查询改写触发率", correction_rate: "生成纠错触发率", mean_rewrite_count: "平均改写次数", mean_correction_count: "平均纠错次数", complex_rewrite_rate: "复杂题改写率", complex_correction_rate: "复杂题纠错率", probe_refusal_rate: "无关问题拒答率", cases_total: "用例总数", cases_complex: "复杂题数", mean_total_latency_ms: "平均整链路延迟 (ms)", p95_total_latency_ms: "P95 整链路延迟 (ms)" };
    function k(T, R) {
      if (T === "scope_isolation_ok") return R ? "good" : "bad";
      const w = Number(R);
      return !["recall_at_3_answerable", "precision_at_3_answerable", "mrr_at_3_answerable", "hit_at_3_answerable", "grounded_rate", "useful_rate", "accepted_rate", "answer_rate", "mean_confidence"].includes(T) || !Number.isFinite(w) ? "" : w >= 0.8 ? "good" : w <= 0.2 ? "bad" : "";
    }
    function _() {
      return i.value.phase === "generating" ? i.value.status_text || "正在从角色资料生成问题" : i.value.total > 0 ? [`已完成 ${i.value.progress}/${i.value.total} 条`, i.value.current_question_text, i.value.current_step].filter(Boolean).join(" · ") : l.value || "等待开始";
    }
    async function B() {
      try {
        t.value = await Ve("/api/personas"), !n.value && t.value.length && (n.value = t.value[0].id);
      } catch (T) {
        l.value = rt(T);
      }
    }
    async function M() {
      r.value = await Ve("/api/eval/results");
    }
    function E() {
      f += 1, a.value = !1;
    }
    async function Y() {
      const T = ++f;
      a.value = !0;
      for (let R = 0; R < 1200 && T === f; R += 1) {
        try {
          if (i.value = await Ve("/api/eval/status"), i.value.state === "done") {
            await M(), a.value = !1;
            return;
          }
          if (i.value.state === "error") {
            l.value = i.value.error || "评测失败", a.value = !1;
            return;
          }
        } catch (w) {
          l.value = rt(w), a.value = !1;
          return;
        }
        await new Promise((w) => setTimeout(w, 500));
      }
    }
    async function ne() {
      if (!n.value) {
        l.value = "请先选择评测角色";
        return;
      }
      l.value = "", r.value = null, s.value = "", c.value = !1;
      try {
        await Ve("/api/eval/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ persona_id: n.value, tier: o.value }) }), await Y();
      } catch (T) {
        l.value = rt(T), a.value = !1;
      }
    }
    async function G() {
      u.value = !0;
      try {
        const T = await Ve("/api/eval/analyze", { method: "POST" });
        s.value = T.analysis || "分析结果为空";
      } catch (T) {
        l.value = rt(T);
      } finally {
        u.value = !1;
      }
    }
    async function Z() {
      await B();
      try {
        i.value = await Ve("/api/eval/status"), i.value.state === "running" ? Y() : i.value.state === "done" && await M();
      } catch {
      }
    }
    return mt(() => {
      const T = document.querySelector("#evaluation-app-root");
      T == null || T.addEventListener("yumeno:evaluation-show", Z), T == null || T.addEventListener("yumeno:evaluation-hide", E), Z();
    }), Dn(E), (T, R) => (U(), W("main", PS, [
      p("header", DS, [
        R[3] || (R[3] = p("div", null, [
          p("span", { class: "yv-kicker" }, "Retrieval quality lab"),
          p("h1", null, "RAG 评测"),
          p("p", null, "用可复现指标检查召回、回答接地与整链路延迟。")
        ], -1)),
        p("span", {
          class: xe(["yv-status", i.value.state === "done" ? "ok" : i.value.state === "error" ? "error" : a.value ? "warn" : ""])
        }, J(h.value), 3)
      ]),
      p("section", AS, [
        p("div", RS, [
          p("label", LS, [
            R[5] || (R[5] = p("span", null, "评测角色", -1)),
            Xe(p("select", {
              "onUpdate:modelValue": R[0] || (R[0] = (w) => n.value = w)
            }, [
              R[4] || (R[4] = p("option", { value: "" }, "请选择角色", -1)),
              (U(!0), W(me, null, Re(t.value, (w) => (U(), W("option", {
                key: w.id,
                value: w.id
              }, J(w.name), 9, VS))), 128))
            ], 512), [
              [Ur, n.value]
            ])
          ]),
          p("label", zS, [
            R[7] || (R[7] = p("span", null, "问题规模", -1)),
            Xe(p("select", {
              "onUpdate:modelValue": R[1] || (R[1] = (w) => o.value = w)
            }, R[6] || (R[6] = [
              p("option", { value: "fast" }, "轻量 · 5 个问题", -1),
              p("option", { value: "standard" }, "标准 · 10 个问题", -1),
              p("option", { value: "thorough" }, "全面 · 15 个问题", -1)
            ]), 512), [
              [Ur, o.value]
            ])
          ])
        ]),
        p("div", BS, [
          p("button", {
            class: "yv-button primary",
            disabled: a.value,
            onClick: ne
          }, [
            ie(V(ic)),
            Le(J(a.value ? "评测进行中" : "生成并评测"), 1)
          ], 8, FS),
          p("button", {
            class: "yv-button",
            disabled: !r.value || u.value,
            onClick: G
          }, [
            ie(V($p)),
            Le(J(u.value ? "分析中" : "AI 分析"), 1)
          ], 8, HS),
          p("a", {
            class: xe(["yv-button", { disabled: !r.value }]),
            href: r.value ? "/api/eval/export" : void 0
          }, [
            ie(V(oc)),
            R[8] || (R[8] = Le("导出 JSON"))
          ], 10, jS)
        ])
      ]),
      p("section", US, [
        p("div", null, [
          p("strong", null, J(h.value), 1),
          p("p", {
            class: xe({ error: l.value })
          }, J(l.value || _()), 3)
        ]),
        p("div", {
          class: xe(["progress-track", { indeterminate: a.value && i.value.phase === "generating" }])
        }, [
          p("span", {
            style: ft({ width: `${m.value}%` })
          }, null, 4)
        ], 2)
      ]),
      r.value ? (U(), W("section", GS, [
        p("div", YS, [
          (U(!0), W(me, null, Re($.value, (w) => (U(), W("article", {
            key: w.label,
            class: xe(w.tone)
          }, [
            p("span", null, J(w.label), 1),
            p("strong", null, J(w.value), 1)
          ], 2))), 128))
        ]),
        p("div", XS, [
          (U(), W(me, null, Re(I, (w) => p("section", {
            key: w.title
          }, [
            p("h2", null, J(w.title), 1),
            p("div", null, [
              (U(!0), W(me, null, Re(w.keys.filter((D) => {
                var P, F;
                return ((P = r.value.metrics) == null ? void 0 : P[D]) !== void 0 && ((F = r.value.metrics) == null ? void 0 : F[D]) !== null;
              }), (D) => (U(), W("article", { key: D }, [
                p("span", null, J(A[D] || D), 1),
                p("strong", {
                  class: xe(k(D, r.value.metrics[D]))
                }, J(V(oi)(D, r.value.metrics[D])), 3)
              ]))), 128))
            ])
          ])), 64))
        ]),
        s.value ? (U(), W("section", WS, [
          R[9] || (R[9] = p("span", { class: "yv-kicker" }, "AI review", -1)),
          R[10] || (R[10] = p("h2", null, "结果解读", -1)),
          p("p", null, J(s.value), 1)
        ])) : Se("", !0),
        p("section", qS, [
          p("header", null, [
            R[11] || (R[11] = p("div", null, [
              p("span", { class: "yv-kicker" }, "Case evidence"),
              p("h2", null, "逐条详情")
            ], -1)),
            C.value.length > 3 ? (U(), W("button", {
              key: 0,
              class: "yv-button",
              onClick: R[2] || (R[2] = (w) => c.value = !c.value)
            }, J(c.value ? "收起" : `展开全部 ${C.value.length} 条`), 1)) : Se("", !0)
          ]),
          (U(!0), W(me, null, Re(N.value, (w, D) => (U(), W("article", {
            key: D,
            class: "case-row"
          }, [
            p("div", KS, J(String(D + 1).padStart(2, "0")), 1),
            p("div", null, [
              p("strong", null, J(w.question), 1),
              p("p", null, J((w.answer || "").slice(0, 240)), 1),
              p("small", null, J([w.grounded == null ? "grounded=—" : `grounded=${w.grounded}`, w.useful == null ? "useful=—" : `useful=${w.useful}`, `confidence=${w.confidence ?? "—"}`, w.rewrite_used ? "查询改写" : "", w.corrected ? "生成纠错" : "", w.is_probe ? "无关探针" : ""].filter(Boolean).join(" · ")), 1)
            ]),
            p("span", {
              class: xe(["yv-status", w.accepted || w.is_probe && w.refused ? "ok" : "error"])
            }, J(w.accepted || w.is_probe && w.refused ? "符合预期" : "未通过"), 3)
          ]))), 128))
        ])
      ])) : (U(), W("section", ZS, [
        ie(V(vp)),
        R[12] || (R[12] = p("h2", null, "等待一轮可比较的结果", -1)),
        R[13] || (R[13] = p("p", null, "选择角色和问题规模后开始。评测会覆盖知识召回、复杂问题与无关问题拒答。", -1))
      ]))
    ]));
  }
});
let an = null;
const Fd = () => document.querySelector("#evaluation-app-root");
function c2(e = "#evaluation-app-root") {
  if (an) return an;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("RAG 评测挂载点不存在");
  return an = Ts(JS), an.mount(t), an;
}
function d2() {
  var e;
  (e = Fd()) == null || e.dispatchEvent(new CustomEvent("yumeno:evaluation-show"));
}
function f2() {
  var e;
  (e = Fd()) == null || e.dispatchEvent(new CustomEvent("yumeno:evaluation-hide"));
}
function h2() {
  an && (an.unmount(), an = null);
}
export {
  h2 as destroyEvaluationApp,
  u2 as destroyExtensionsApp,
  r2 as destroyManageApp,
  f2 as hideEvaluationApp,
  a2 as hideExtensionsApp,
  c2 as mountEvaluationApp,
  s2 as mountExtensionsApp,
  o2 as mountManageApp,
  d2 as showEvaluationApp,
  l2 as showExtensionsApp,
  i2 as showManageApp
};

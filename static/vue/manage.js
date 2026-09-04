var $f = Object.defineProperty;
var Nf = (e, t, n) => t in e ? $f(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Ye = (e, t, n) => Nf(e, typeof t != "symbol" ? t + "" : t, n);
/**
* @vue/shared v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Mr(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const ze = {}, Wn = [], Lt = () => {
}, If = () => !1, Xs = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Or = (e) => e.startsWith("onUpdate:"), ct = Object.assign, Tr = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, Mf = Object.prototype.hasOwnProperty, Le = (e, t) => Mf.call(e, t), Ee = Array.isArray, Zn = (e) => Wo(e) === "[object Map]", po = (e) => Wo(e) === "[object Set]", Pl = (e) => Wo(e) === "[object Date]", Se = (e) => typeof e == "function", Ge = (e) => typeof e == "string", Mt = (e) => typeof e == "symbol", Be = (e) => e !== null && typeof e == "object", Cu = (e) => (Be(e) || Se(e)) && Se(e.then) && Se(e.catch), $u = Object.prototype.toString, Wo = (e) => $u.call(e), Of = (e) => Wo(e).slice(8, -1), Nu = (e) => Wo(e) === "[object Object]", Pr = (e) => Ge(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Io = /* @__PURE__ */ Mr(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Ks = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, Tf = /-(\w)/g, xt = Ks(
  (e) => e.replace(Tf, (t, n) => n ? n.toUpperCase() : "")
), Pf = /\B([A-Z])/g, xn = Ks(
  (e) => e.replace(Pf, "-$1").toLowerCase()
), Ws = Ks((e) => e.charAt(0).toUpperCase() + e.slice(1)), _i = Ks(
  (e) => e ? `on${Ws(e)}` : ""
), Zt = (e, t) => !Object.is(e, t), bs = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, Iu = (e, t, n, o = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: o,
    value: n
  });
}, Is = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Dl;
const Zs = () => Dl || (Dl = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function it(e) {
  if (Ee(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const o = e[n], s = Ge(o) ? Lf(o) : it(o);
      if (s)
        for (const i in s)
          t[i] = s[i];
    }
    return t;
  } else if (Ge(e) || Be(e))
    return e;
}
const Df = /;(?![^(]*\))/g, Rf = /:([^]+)/, Af = /\/\*[^]*?\*\//g;
function Lf(e) {
  const t = {};
  return e.replace(Af, "").split(Df).forEach((n) => {
    if (n) {
      const o = n.split(Rf);
      o.length > 1 && (t[o[0].trim()] = o[1].trim());
    }
  }), t;
}
function ve(e) {
  let t = "";
  if (Ge(e))
    t = e;
  else if (Ee(e))
    for (let n = 0; n < e.length; n++) {
      const o = ve(e[n]);
      o && (t += o + " ");
    }
  else if (Be(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
function wi(e) {
  if (!e) return null;
  let { class: t, style: n } = e;
  return t && !Ge(t) && (e.class = ve(t)), n && (e.style = it(n)), e;
}
const Vf = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", zf = /* @__PURE__ */ Mr(Vf);
function Mu(e) {
  return !!e || e === "";
}
function Bf(e, t) {
  if (e.length !== t.length) return !1;
  let n = !0;
  for (let o = 0; n && o < e.length; o++)
    n = Zo(e[o], t[o]);
  return n;
}
function Zo(e, t) {
  if (e === t) return !0;
  let n = Pl(e), o = Pl(t);
  if (n || o)
    return n && o ? e.getTime() === t.getTime() : !1;
  if (n = Mt(e), o = Mt(t), n || o)
    return e === t;
  if (n = Ee(e), o = Ee(t), n || o)
    return n && o ? Bf(e, t) : !1;
  if (n = Be(e), o = Be(t), n || o) {
    if (!n || !o)
      return !1;
    const s = Object.keys(e).length, i = Object.keys(t).length;
    if (s !== i)
      return !1;
    for (const r in e) {
      const l = e.hasOwnProperty(r), a = t.hasOwnProperty(r);
      if (l && !a || !l && a || !Zo(e[r], t[r]))
        return !1;
    }
  }
  return String(e) === String(t);
}
function Dr(e, t) {
  return e.findIndex((n) => Zo(n, t));
}
const Ou = (e) => !!(e && e.__v_isRef === !0), L = (e) => Ge(e) ? e : e == null ? "" : Ee(e) || Be(e) && (e.toString === $u || !Se(e.toString)) ? Ou(e) ? L(e.value) : JSON.stringify(e, Tu, 2) : String(e), Tu = (e, t) => Ou(t) ? Tu(e, t.value) : Zn(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [o, s], i) => (n[ki(o, i) + " =>"] = s, n),
    {}
  )
} : po(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => ki(n))
} : Mt(t) ? ki(t) : Be(t) && !Ee(t) && !Nu(t) ? String(t) : t, ki = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Mt(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let ft;
class Pu {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = ft, !t && ft && (this.index = (ft.scopes || (ft.scopes = [])).push(
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
      const n = ft;
      try {
        return ft = this, t();
      } finally {
        ft = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ft = this;
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    ft = this.parent;
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
        const s = this.parent.scopes.pop();
        s && s !== this && (this.parent.scopes[this.index] = s, s.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function Du(e) {
  return new Pu(e);
}
function Rr() {
  return ft;
}
function _s(e, t = !1) {
  ft && ft.cleanups.push(e);
}
let Fe;
const Ei = /* @__PURE__ */ new WeakSet();
class Ru {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, ft && ft.active && ft.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Ei.has(this) && (Ei.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Lu(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Rl(this), Vu(this);
    const t = Fe, n = It;
    Fe = this, It = !0;
    try {
      return this.fn();
    } finally {
      zu(this), Fe = t, It = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Vr(t);
      this.deps = this.depsTail = void 0, Rl(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Ei.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Zi(this) && this.run();
  }
  get dirty() {
    return Zi(this);
  }
}
let Au = 0, Mo, Oo;
function Lu(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Oo, Oo = e;
    return;
  }
  e.next = Mo, Mo = e;
}
function Ar() {
  Au++;
}
function Lr() {
  if (--Au > 0)
    return;
  if (Oo) {
    let t = Oo;
    for (Oo = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; Mo; ) {
    let t = Mo;
    for (Mo = void 0; t; ) {
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
function Vu(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function zu(e) {
  let t, n = e.depsTail, o = n;
  for (; o; ) {
    const s = o.prevDep;
    o.version === -1 ? (o === n && (n = s), Vr(o), Ff(o)) : t = o, o.dep.activeLink = o.prevActiveLink, o.prevActiveLink = void 0, o = s;
  }
  e.deps = t, e.depsTail = n;
}
function Zi(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Bu(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Bu(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Lo))
    return;
  e.globalVersion = Lo;
  const t = e.dep;
  if (e.flags |= 2, t.version > 0 && !e.isSSR && e.deps && !Zi(e)) {
    e.flags &= -3;
    return;
  }
  const n = Fe, o = It;
  Fe = e, It = !0;
  try {
    Vu(e);
    const s = e.fn(e._value);
    (t.version === 0 || Zt(s, e._value)) && (e._value = s, t.version++);
  } catch (s) {
    throw t.version++, s;
  } finally {
    Fe = n, It = o, zu(e), e.flags &= -3;
  }
}
function Vr(e, t = !1) {
  const { dep: n, prevSub: o, nextSub: s } = e;
  if (o && (o.nextSub = s, e.prevSub = void 0), s && (s.prevSub = o, e.nextSub = void 0), n.subs === e && (n.subs = o, !o && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      Vr(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function Ff(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let It = !0;
const Fu = [];
function Sn() {
  Fu.push(It), It = !1;
}
function Cn() {
  const e = Fu.pop();
  It = e === void 0 ? !0 : e;
}
function Rl(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = Fe;
    Fe = void 0;
    try {
      t();
    } finally {
      Fe = n;
    }
  }
}
let Lo = 0;
class Uf {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Js {
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0;
  }
  track(t) {
    if (!Fe || !It || Fe === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== Fe)
      n = this.activeLink = new Uf(Fe, this), Fe.deps ? (n.prevDep = Fe.depsTail, Fe.depsTail.nextDep = n, Fe.depsTail = n) : Fe.deps = Fe.depsTail = n, Uu(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const o = n.nextDep;
      o.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = o), n.prevDep = Fe.depsTail, n.nextDep = void 0, Fe.depsTail.nextDep = n, Fe.depsTail = n, Fe.deps === n && (Fe.deps = o);
    }
    return n;
  }
  trigger(t) {
    this.version++, Lo++, this.notify(t);
  }
  notify(t) {
    Ar();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      Lr();
    }
  }
}
function Uu(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let o = t.deps; o; o = o.nextDep)
        Uu(o);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const Ms = /* @__PURE__ */ new WeakMap(), Rn = Symbol(
  ""
), Ji = Symbol(
  ""
), Vo = Symbol(
  ""
);
function at(e, t, n) {
  if (It && Fe) {
    let o = Ms.get(e);
    o || Ms.set(e, o = /* @__PURE__ */ new Map());
    let s = o.get(n);
    s || (o.set(n, s = new Js()), s.map = o, s.key = n), s.track();
  }
}
function Gt(e, t, n, o, s, i) {
  const r = Ms.get(e);
  if (!r) {
    Lo++;
    return;
  }
  const l = (a) => {
    a && a.trigger();
  };
  if (Ar(), t === "clear")
    r.forEach(l);
  else {
    const a = Ee(e), c = a && Pr(n);
    if (a && n === "length") {
      const d = Number(o);
      r.forEach((p, v) => {
        (v === "length" || v === Vo || !Mt(v) && v >= d) && l(p);
      });
    } else
      switch ((n !== void 0 || r.has(void 0)) && l(r.get(n)), c && l(r.get(Vo)), t) {
        case "add":
          a ? c && l(r.get("length")) : (l(r.get(Rn)), Zn(e) && l(r.get(Ji)));
          break;
        case "delete":
          a || (l(r.get(Rn)), Zn(e) && l(r.get(Ji)));
          break;
        case "set":
          Zn(e) && l(r.get(Rn));
          break;
      }
  }
  Lr();
}
function Hf(e, t) {
  const n = Ms.get(e);
  return n && n.get(t);
}
function Yn(e) {
  const t = Re(e);
  return t === e ? t : (at(t, "iterate", Vo), Et(e) ? t : t.map(ut));
}
function Qs(e) {
  return at(e = Re(e), "iterate", Vo), e;
}
const jf = {
  __proto__: null,
  [Symbol.iterator]() {
    return xi(this, Symbol.iterator, ut);
  },
  concat(...e) {
    return Yn(this).concat(
      ...e.map((t) => Ee(t) ? Yn(t) : t)
    );
  },
  entries() {
    return xi(this, "entries", (e) => (e[1] = ut(e[1]), e));
  },
  every(e, t) {
    return Ut(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Ut(this, "filter", e, t, (n) => n.map(ut), arguments);
  },
  find(e, t) {
    return Ut(this, "find", e, t, ut, arguments);
  },
  findIndex(e, t) {
    return Ut(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Ut(this, "findLast", e, t, ut, arguments);
  },
  findLastIndex(e, t) {
    return Ut(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Ut(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return Si(this, "includes", e);
  },
  indexOf(...e) {
    return Si(this, "indexOf", e);
  },
  join(e) {
    return Yn(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return Si(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Ut(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return bo(this, "pop");
  },
  push(...e) {
    return bo(this, "push", e);
  },
  reduce(e, ...t) {
    return Al(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Al(this, "reduceRight", e, t);
  },
  shift() {
    return bo(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Ut(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return bo(this, "splice", e);
  },
  toReversed() {
    return Yn(this).toReversed();
  },
  toSorted(e) {
    return Yn(this).toSorted(e);
  },
  toSpliced(...e) {
    return Yn(this).toSpliced(...e);
  },
  unshift(...e) {
    return bo(this, "unshift", e);
  },
  values() {
    return xi(this, "values", ut);
  }
};
function xi(e, t, n) {
  const o = Qs(e), s = o[t]();
  return o !== e && !Et(e) && (s._next = s.next, s.next = () => {
    const i = s._next();
    return i.value && (i.value = n(i.value)), i;
  }), s;
}
const Gf = Array.prototype;
function Ut(e, t, n, o, s, i) {
  const r = Qs(e), l = r !== e && !Et(e), a = r[t];
  if (a !== Gf[t]) {
    const p = a.apply(e, i);
    return l ? ut(p) : p;
  }
  let c = n;
  r !== e && (l ? c = function(p, v) {
    return n.call(this, ut(p), v, e);
  } : n.length > 2 && (c = function(p, v) {
    return n.call(this, p, v, e);
  }));
  const d = a.call(r, c, o);
  return l && s ? s(d) : d;
}
function Al(e, t, n, o) {
  const s = Qs(e);
  let i = n;
  return s !== e && (Et(e) ? n.length > 3 && (i = function(r, l, a) {
    return n.call(this, r, l, a, e);
  }) : i = function(r, l, a) {
    return n.call(this, r, ut(l), a, e);
  }), s[t](i, ...o);
}
function Si(e, t, n) {
  const o = Re(e);
  at(o, "iterate", Vo);
  const s = o[t](...n);
  return (s === -1 || s === !1) && Ur(n[0]) ? (n[0] = Re(n[0]), o[t](...n)) : s;
}
function bo(e, t, n = []) {
  Sn(), Ar();
  const o = Re(e)[t].apply(e, n);
  return Lr(), Cn(), o;
}
const Yf = /* @__PURE__ */ Mr("__proto__,__v_isRef,__isVue"), Hu = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(Mt)
);
function qf(e) {
  Mt(e) || (e = String(e));
  const t = Re(this);
  return at(t, "has", e), t.hasOwnProperty(e);
}
class ju {
  constructor(t = !1, n = !1) {
    this._isReadonly = t, this._isShallow = n;
  }
  get(t, n, o) {
    if (n === "__v_skip") return t.__v_skip;
    const s = this._isReadonly, i = this._isShallow;
    if (n === "__v_isReactive")
      return !s;
    if (n === "__v_isReadonly")
      return s;
    if (n === "__v_isShallow")
      return i;
    if (n === "__v_raw")
      return o === (s ? i ? op : Xu : i ? qu : Yu).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(o) ? t : void 0;
    const r = Ee(t);
    if (!s) {
      let a;
      if (r && (a = jf[n]))
        return a;
      if (n === "hasOwnProperty")
        return qf;
    }
    const l = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      Xe(t) ? t : o
    );
    return (Mt(n) ? Hu.has(n) : Yf(n)) || (s || at(t, "get", n), i) ? l : Xe(l) ? r && Pr(n) ? l : l.value : Be(l) ? s ? Br(l) : wn(l) : l;
  }
}
class Gu extends ju {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, o, s) {
    let i = t[n];
    if (!this._isShallow) {
      const a = zn(i);
      if (!Et(o) && !zn(o) && (i = Re(i), o = Re(o)), !Ee(t) && Xe(i) && !Xe(o))
        return a ? !1 : (i.value = o, !0);
    }
    const r = Ee(t) && Pr(n) ? Number(n) < t.length : Le(t, n), l = Reflect.set(
      t,
      n,
      o,
      Xe(t) ? t : s
    );
    return t === Re(s) && (r ? Zt(o, i) && Gt(t, "set", n, o) : Gt(t, "add", n, o)), l;
  }
  deleteProperty(t, n) {
    const o = Le(t, n);
    t[n];
    const s = Reflect.deleteProperty(t, n);
    return s && o && Gt(t, "delete", n, void 0), s;
  }
  has(t, n) {
    const o = Reflect.has(t, n);
    return (!Mt(n) || !Hu.has(n)) && at(t, "has", n), o;
  }
  ownKeys(t) {
    return at(
      t,
      "iterate",
      Ee(t) ? "length" : Rn
    ), Reflect.ownKeys(t);
  }
}
class Xf extends ju {
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
const Kf = /* @__PURE__ */ new Gu(), Wf = /* @__PURE__ */ new Xf(), Zf = /* @__PURE__ */ new Gu(!0);
const Qi = (e) => e, is = (e) => Reflect.getPrototypeOf(e);
function Jf(e, t, n) {
  return function(...o) {
    const s = this.__v_raw, i = Re(s), r = Zn(i), l = e === "entries" || e === Symbol.iterator && r, a = e === "keys" && r, c = s[e](...o), d = n ? Qi : t ? er : ut;
    return !t && at(
      i,
      "iterate",
      a ? Ji : Rn
    ), {
      // iterator protocol
      next() {
        const { value: p, done: v } = c.next();
        return v ? { value: p, done: v } : {
          value: l ? [d(p[0]), d(p[1])] : d(p),
          done: v
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function rs(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function Qf(e, t) {
  const n = {
    get(s) {
      const i = this.__v_raw, r = Re(i), l = Re(s);
      e || (Zt(s, l) && at(r, "get", s), at(r, "get", l));
      const { has: a } = is(r), c = t ? Qi : e ? er : ut;
      if (a.call(r, s))
        return c(i.get(s));
      if (a.call(r, l))
        return c(i.get(l));
      i !== r && i.get(s);
    },
    get size() {
      const s = this.__v_raw;
      return !e && at(Re(s), "iterate", Rn), Reflect.get(s, "size", s);
    },
    has(s) {
      const i = this.__v_raw, r = Re(i), l = Re(s);
      return e || (Zt(s, l) && at(r, "has", s), at(r, "has", l)), s === l ? i.has(s) : i.has(s) || i.has(l);
    },
    forEach(s, i) {
      const r = this, l = r.__v_raw, a = Re(l), c = t ? Qi : e ? er : ut;
      return !e && at(a, "iterate", Rn), l.forEach((d, p) => s.call(i, c(d), c(p), r));
    }
  };
  return ct(
    n,
    e ? {
      add: rs("add"),
      set: rs("set"),
      delete: rs("delete"),
      clear: rs("clear")
    } : {
      add(s) {
        !t && !Et(s) && !zn(s) && (s = Re(s));
        const i = Re(this);
        return is(i).has.call(i, s) || (i.add(s), Gt(i, "add", s, s)), this;
      },
      set(s, i) {
        !t && !Et(i) && !zn(i) && (i = Re(i));
        const r = Re(this), { has: l, get: a } = is(r);
        let c = l.call(r, s);
        c || (s = Re(s), c = l.call(r, s));
        const d = a.call(r, s);
        return r.set(s, i), c ? Zt(i, d) && Gt(r, "set", s, i) : Gt(r, "add", s, i), this;
      },
      delete(s) {
        const i = Re(this), { has: r, get: l } = is(i);
        let a = r.call(i, s);
        a || (s = Re(s), a = r.call(i, s)), l && l.call(i, s);
        const c = i.delete(s);
        return a && Gt(i, "delete", s, void 0), c;
      },
      clear() {
        const s = Re(this), i = s.size !== 0, r = s.clear();
        return i && Gt(
          s,
          "clear",
          void 0,
          void 0
        ), r;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((s) => {
    n[s] = Jf(s, e, t);
  }), n;
}
function zr(e, t) {
  const n = Qf(e, t);
  return (o, s, i) => s === "__v_isReactive" ? !e : s === "__v_isReadonly" ? e : s === "__v_raw" ? o : Reflect.get(
    Le(n, s) && s in o ? n : o,
    s,
    i
  );
}
const ep = {
  get: /* @__PURE__ */ zr(!1, !1)
}, tp = {
  get: /* @__PURE__ */ zr(!1, !0)
}, np = {
  get: /* @__PURE__ */ zr(!0, !1)
};
const Yu = /* @__PURE__ */ new WeakMap(), qu = /* @__PURE__ */ new WeakMap(), Xu = /* @__PURE__ */ new WeakMap(), op = /* @__PURE__ */ new WeakMap();
function sp(e) {
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
function ip(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : sp(Of(e));
}
function wn(e) {
  return zn(e) ? e : Fr(
    e,
    !1,
    Kf,
    ep,
    Yu
  );
}
function rp(e) {
  return Fr(
    e,
    !1,
    Zf,
    tp,
    qu
  );
}
function Br(e) {
  return Fr(
    e,
    !0,
    Wf,
    np,
    Xu
  );
}
function Fr(e, t, n, o, s) {
  if (!Be(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = s.get(e);
  if (i)
    return i;
  const r = ip(e);
  if (r === 0)
    return e;
  const l = new Proxy(
    e,
    r === 2 ? o : n
  );
  return s.set(e, l), l;
}
function Jn(e) {
  return zn(e) ? Jn(e.__v_raw) : !!(e && e.__v_isReactive);
}
function zn(e) {
  return !!(e && e.__v_isReadonly);
}
function Et(e) {
  return !!(e && e.__v_isShallow);
}
function Ur(e) {
  return e ? !!e.__v_raw : !1;
}
function Re(e) {
  const t = e && e.__v_raw;
  return t ? Re(t) : e;
}
function An(e) {
  return !Le(e, "__v_skip") && Object.isExtensible(e) && Iu(e, "__v_skip", !0), e;
}
const ut = (e) => Be(e) ? wn(e) : e, er = (e) => Be(e) ? Br(e) : e;
function Xe(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function ee(e) {
  return lp(e, !1);
}
function lp(e, t) {
  return Xe(e) ? e : new ap(e, t);
}
class ap {
  constructor(t, n) {
    this.dep = new Js(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : Re(t), this._value = n ? t : ut(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, o = this.__v_isShallow || Et(t) || zn(t);
    t = o ? t : Re(t), Zt(t, n) && (this._rawValue = t, this._value = o ? t : ut(t), this.dep.trigger());
  }
}
function B(e) {
  return Xe(e) ? e.value : e;
}
function Pe(e) {
  return Se(e) ? e() : B(e);
}
const up = {
  get: (e, t, n) => t === "__v_raw" ? e : B(Reflect.get(e, t, n)),
  set: (e, t, n, o) => {
    const s = e[t];
    return Xe(s) && !Xe(n) ? (s.value = n, !0) : Reflect.set(e, t, n, o);
  }
};
function Ku(e) {
  return Jn(e) ? e : new Proxy(e, up);
}
class cp {
  constructor(t) {
    this.__v_isRef = !0, this._value = void 0;
    const n = this.dep = new Js(), { get: o, set: s } = t(n.track.bind(n), n.trigger.bind(n));
    this._get = o, this._set = s;
  }
  get value() {
    return this._value = this._get();
  }
  set value(t) {
    this._set(t);
  }
}
function dp(e) {
  return new cp(e);
}
function fp(e) {
  const t = Ee(e) ? new Array(e.length) : {};
  for (const n in e)
    t[n] = Wu(e, n);
  return t;
}
class pp {
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
    return Hf(Re(this._object), this._key);
  }
}
class hp {
  constructor(t) {
    this._getter = t, this.__v_isRef = !0, this.__v_isReadonly = !0, this._value = void 0;
  }
  get value() {
    return this._value = this._getter();
  }
}
function Ue(e, t, n) {
  return Xe(e) ? e : Se(e) ? new hp(e) : Be(e) && arguments.length > 1 ? Wu(e, t, n) : ee(e);
}
function Wu(e, t, n) {
  const o = e[t];
  return Xe(o) ? o : new pp(e, t, n);
}
class vp {
  constructor(t, n, o) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Js(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Lo - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = o;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    Fe !== this)
      return Lu(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Bu(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function gp(e, t, n = !1) {
  let o, s;
  return Se(e) ? o = e : (o = e.get, s = e.set), new vp(o, s, n);
}
const ls = {}, Os = /* @__PURE__ */ new WeakMap();
let Mn;
function mp(e, t = !1, n = Mn) {
  if (n) {
    let o = Os.get(n);
    o || Os.set(n, o = []), o.push(e);
  }
}
function yp(e, t, n = ze) {
  const { immediate: o, deep: s, once: i, scheduler: r, augmentJob: l, call: a } = n, c = (_) => s ? _ : Et(_) || s === !1 || s === 0 ? Yt(_, 1) : Yt(_);
  let d, p, v, g, k = !1, $ = !1;
  if (Xe(e) ? (p = () => e.value, k = Et(e)) : Jn(e) ? (p = () => c(e), k = !0) : Ee(e) ? ($ = !0, k = e.some((_) => Jn(_) || Et(_)), p = () => e.map((_) => {
    if (Xe(_))
      return _.value;
    if (Jn(_))
      return c(_);
    if (Se(_))
      return a ? a(_, 2) : _();
  })) : Se(e) ? t ? p = a ? () => a(e, 2) : e : p = () => {
    if (v) {
      Sn();
      try {
        v();
      } finally {
        Cn();
      }
    }
    const _ = Mn;
    Mn = d;
    try {
      return a ? a(e, 3, [g]) : e(g);
    } finally {
      Mn = _;
    }
  } : p = Lt, t && s) {
    const _ = p, z = s === !0 ? 1 / 0 : s;
    p = () => Yt(_(), z);
  }
  const S = Rr(), T = () => {
    d.stop(), S && S.active && Tr(S.effects, d);
  };
  if (i && t) {
    const _ = t;
    t = (...z) => {
      _(...z), T();
    };
  }
  let D = $ ? new Array(e.length).fill(ls) : ls;
  const m = (_) => {
    if (!(!(d.flags & 1) || !d.dirty && !_))
      if (t) {
        const z = d.run();
        if (s || k || ($ ? z.some((U, Z) => Zt(U, D[Z])) : Zt(z, D))) {
          v && v();
          const U = Mn;
          Mn = d;
          try {
            const Z = [
              z,
              // pass undefined as the old value when it's changed for the first time
              D === ls ? void 0 : $ && D[0] === ls ? [] : D,
              g
            ];
            a ? a(t, 3, Z) : (
              // @ts-expect-error
              t(...Z)
            ), D = z;
          } finally {
            Mn = U;
          }
        }
      } else
        d.run();
  };
  return l && l(m), d = new Ru(p), d.scheduler = r ? () => r(m, !1) : m, g = (_) => mp(_, !1, d), v = d.onStop = () => {
    const _ = Os.get(d);
    if (_) {
      if (a)
        a(_, 4);
      else
        for (const z of _) z();
      Os.delete(d);
    }
  }, t ? o ? m(!0) : D = d.run() : r ? r(m.bind(null, !0), !0) : d.run(), T.pause = d.pause.bind(d), T.resume = d.resume.bind(d), T.stop = T, T;
}
function Yt(e, t = 1 / 0, n) {
  if (t <= 0 || !Be(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, Xe(e))
    Yt(e.value, t, n);
  else if (Ee(e))
    for (let o = 0; o < e.length; o++)
      Yt(e[o], t, n);
  else if (po(e) || Zn(e))
    e.forEach((o) => {
      Yt(o, t, n);
    });
  else if (Nu(e)) {
    for (const o in e)
      Yt(e[o], t, n);
    for (const o of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, o) && Yt(e[o], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Jo(e, t, n, o) {
  try {
    return o ? e(...o) : e();
  } catch (s) {
    ei(s, t, n);
  }
}
function Bt(e, t, n, o) {
  if (Se(e)) {
    const s = Jo(e, t, n, o);
    return s && Cu(s) && s.catch((i) => {
      ei(i, t, n);
    }), s;
  }
  if (Ee(e)) {
    const s = [];
    for (let i = 0; i < e.length; i++)
      s.push(Bt(e[i], t, n, o));
    return s;
  }
}
function ei(e, t, n, o = !0) {
  const s = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: r } = t && t.appContext.config || ze;
  if (t) {
    let l = t.parent;
    const a = t.proxy, c = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; l; ) {
      const d = l.ec;
      if (d) {
        for (let p = 0; p < d.length; p++)
          if (d[p](e, a, c) === !1)
            return;
      }
      l = l.parent;
    }
    if (i) {
      Sn(), Jo(i, null, 10, [
        e,
        a,
        c
      ]), Cn();
      return;
    }
  }
  bp(e, n, s, o, r);
}
function bp(e, t, n, o = !0, s = !1) {
  if (s)
    throw e;
  console.error(e);
}
const pt = [];
let Dt = -1;
const Qn = [];
let un = null, Xn = 0;
const Zu = /* @__PURE__ */ Promise.resolve();
let Ts = null;
function nt(e) {
  const t = Ts || Zu;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function _p(e) {
  let t = Dt + 1, n = pt.length;
  for (; t < n; ) {
    const o = t + n >>> 1, s = pt[o], i = zo(s);
    i < e || i === e && s.flags & 2 ? t = o + 1 : n = o;
  }
  return t;
}
function Hr(e) {
  if (!(e.flags & 1)) {
    const t = zo(e), n = pt[pt.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= zo(n) ? pt.push(e) : pt.splice(_p(t), 0, e), e.flags |= 1, Ju();
  }
}
function Ju() {
  Ts || (Ts = Zu.then(ec));
}
function wp(e) {
  Ee(e) ? Qn.push(...e) : un && e.id === -1 ? un.splice(Xn + 1, 0, e) : e.flags & 1 || (Qn.push(e), e.flags |= 1), Ju();
}
function Ll(e, t, n = Dt + 1) {
  for (; n < pt.length; n++) {
    const o = pt[n];
    if (o && o.flags & 2) {
      if (e && o.id !== e.uid)
        continue;
      pt.splice(n, 1), n--, o.flags & 4 && (o.flags &= -2), o(), o.flags & 4 || (o.flags &= -2);
    }
  }
}
function Qu(e) {
  if (Qn.length) {
    const t = [...new Set(Qn)].sort(
      (n, o) => zo(n) - zo(o)
    );
    if (Qn.length = 0, un) {
      un.push(...t);
      return;
    }
    for (un = t, Xn = 0; Xn < un.length; Xn++) {
      const n = un[Xn];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    un = null, Xn = 0;
  }
}
const zo = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function ec(e) {
  try {
    for (Dt = 0; Dt < pt.length; Dt++) {
      const t = pt[Dt];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Jo(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Dt < pt.length; Dt++) {
      const t = pt[Dt];
      t && (t.flags &= -2);
    }
    Dt = -1, pt.length = 0, Qu(), Ts = null, (pt.length || Qn.length) && ec();
  }
}
let tt = null, tc = null;
function Ps(e) {
  const t = tt;
  return tt = e, tc = e && e.type.__scopeId || null, t;
}
function bn(e, t = tt, n) {
  if (!t || e._n)
    return e;
  const o = (...s) => {
    o._d && ql(-1);
    const i = Ps(t);
    let r;
    try {
      r = e(...s);
    } finally {
      Ps(i), o._d && ql(1);
    }
    return r;
  };
  return o._n = !0, o._c = !0, o._d = !0, o;
}
function $e(e, t) {
  if (tt === null)
    return e;
  const n = ii(tt), o = e.dirs || (e.dirs = []);
  for (let s = 0; s < t.length; s++) {
    let [i, r, l, a = ze] = t[s];
    i && (Se(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && Yt(r), o.push({
      dir: i,
      instance: n,
      value: r,
      oldValue: void 0,
      arg: l,
      modifiers: a
    }));
  }
  return e;
}
function $n(e, t, n, o) {
  const s = e.dirs, i = t && t.dirs;
  for (let r = 0; r < s.length; r++) {
    const l = s[r];
    i && (l.oldValue = i[r].value);
    let a = l.dir[o];
    a && (Sn(), Bt(a, n, 8, [
      e.el,
      l,
      e,
      t
    ]), Cn());
  }
}
const kp = Symbol("_vte"), Ep = (e) => e.__isTeleport;
function jr(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, jr(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function Me(e, t) {
  return Se(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    ct({ name: e.name }, t, { setup: e })
  ) : e;
}
function nc(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Ds(e, t, n, o, s = !1) {
  if (Ee(e)) {
    e.forEach(
      (k, $) => Ds(
        k,
        t && (Ee(t) ? t[$] : t),
        n,
        o,
        s
      )
    );
    return;
  }
  if (eo(o) && !s) {
    o.shapeFlag & 512 && o.type.__asyncResolved && o.component.subTree.component && Ds(e, t, n, o.component.subTree);
    return;
  }
  const i = o.shapeFlag & 4 ? ii(o.component) : o.el, r = s ? null : i, { i: l, r: a } = e, c = t && t.r, d = l.refs === ze ? l.refs = {} : l.refs, p = l.setupState, v = Re(p), g = p === ze ? () => !1 : (k) => Le(v, k);
  if (c != null && c !== a && (Ge(c) ? (d[c] = null, g(c) && (p[c] = null)) : Xe(c) && (c.value = null)), Se(a))
    Jo(a, l, 12, [r, d]);
  else {
    const k = Ge(a), $ = Xe(a);
    if (k || $) {
      const S = () => {
        if (e.f) {
          const T = k ? g(a) ? p[a] : d[a] : a.value;
          s ? Ee(T) && Tr(T, i) : Ee(T) ? T.includes(i) || T.push(i) : k ? (d[a] = [i], g(a) && (p[a] = d[a])) : (a.value = [i], e.k && (d[e.k] = a.value));
        } else k ? (d[a] = r, g(a) && (p[a] = r)) : $ && (a.value = r, e.k && (d[e.k] = r));
      };
      r ? (S.id = -1, wt(S, n)) : S();
    }
  }
}
Zs().requestIdleCallback;
Zs().cancelIdleCallback;
const eo = (e) => !!e.type.__asyncLoader, oc = (e) => e.type.__isKeepAlive;
function xp(e, t) {
  sc(e, "a", t);
}
function Sp(e, t) {
  sc(e, "da", t);
}
function sc(e, t, n = st) {
  const o = e.__wdc || (e.__wdc = () => {
    let s = n;
    for (; s; ) {
      if (s.isDeactivated)
        return;
      s = s.parent;
    }
    return e();
  });
  if (ti(t, o, n), n) {
    let s = n.parent;
    for (; s && s.parent; )
      oc(s.parent.vnode) && Cp(o, t, n, s), s = s.parent;
  }
}
function Cp(e, t, n, o) {
  const s = ti(
    t,
    e,
    o,
    !0
    /* prepend */
  );
  ni(() => {
    Tr(o[t], s);
  }, n);
}
function ti(e, t, n = st, o = !1) {
  if (n) {
    const s = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...r) => {
      Sn();
      const l = Qo(n), a = Bt(t, n, e, r);
      return l(), Cn(), a;
    });
    return o ? s.unshift(i) : s.push(i), i;
  }
}
const on = (e) => (t, n = st) => {
  (!Fo || e === "sp") && ti(e, (...o) => t(...o), n);
}, ic = on("bm"), rt = on("m"), $p = on(
  "bu"
), Np = on("u"), sn = on(
  "bum"
), ni = on("um"), Ip = on(
  "sp"
), Mp = on("rtg"), Op = on("rtc");
function Tp(e, t = st) {
  ti("ec", e, t);
}
const rc = "components";
function lc(e, t) {
  return cc(rc, e, !0, t) || e;
}
const ac = Symbol.for("v-ndc");
function uc(e) {
  return Ge(e) ? cc(rc, e, !1) || e : e || ac;
}
function cc(e, t, n = !0, o = !1) {
  const s = tt || st;
  if (s) {
    const i = s.type;
    {
      const l = yh(
        i,
        !1
      );
      if (l && (l === t || l === xt(t) || l === Ws(xt(t))))
        return i;
    }
    const r = (
      // local registration
      // check instance[type] first which is resolved for options API
      Vl(s[e] || i[e], t) || // global registration
      Vl(s.appContext[e], t)
    );
    return !r && o ? i : r;
  }
}
function Vl(e, t) {
  return e && (e[t] || e[xt(t)] || e[Ws(xt(t))]);
}
function Te(e, t, n, o) {
  let s;
  const i = n && n[o], r = Ee(e);
  if (r || Ge(e)) {
    const l = r && Jn(e);
    let a = !1;
    l && (a = !Et(e), e = Qs(e)), s = new Array(e.length);
    for (let c = 0, d = e.length; c < d; c++)
      s[c] = t(
        a ? ut(e[c]) : e[c],
        c,
        void 0,
        i && i[c]
      );
  } else if (typeof e == "number") {
    s = new Array(e);
    for (let l = 0; l < e; l++)
      s[l] = t(l + 1, l, void 0, i && i[l]);
  } else if (Be(e))
    if (e[Symbol.iterator])
      s = Array.from(
        e,
        (l, a) => t(l, a, void 0, i && i[a])
      );
    else {
      const l = Object.keys(e);
      s = new Array(l.length);
      for (let a = 0, c = l.length; a < c; a++) {
        const d = l[a];
        s[a] = t(e[d], d, a, i && i[a]);
      }
    }
  else
    s = [];
  return n && (n[o] = s), s;
}
function Bn(e, t, n = {}, o, s) {
  if (tt.ce || tt.parent && eo(tt.parent) && tt.parent.ce)
    return t !== "default" && (n.name = t), N(), vt(
      me,
      null,
      [Q("slot", n, o && o())],
      64
    );
  let i = e[t];
  i && i._c && (i._d = !1), N();
  const r = i && dc(i(n)), l = n.key || // slot content array of a dynamic conditional slot may have a branch
  // key attached in the `createSlots` helper, respect that
  r && r.key, a = vt(
    me,
    {
      key: (l && !Mt(l) ? l : `_${t}`) + // #7256 force differentiate fallback content from actual content
      (!r && o ? "_fb" : "")
    },
    r || (o ? o() : []),
    r && e._ === 1 ? 64 : -2
  );
  return a.scopeId && (a.slotScopeIds = [a.scopeId + "-s"]), i && i._c && (i._d = !0), a;
}
function dc(e) {
  return e.some((t) => Bo(t) ? !(t.type === kn || t.type === me && !dc(t.children)) : !0) ? e : null;
}
const tr = (e) => e ? Dc(e) ? ii(e) : tr(e.parent) : null, To = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ ct(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => tr(e.parent),
    $root: (e) => tr(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => vc(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Hr(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = nt.bind(e.proxy)),
    $watch: (e) => th.bind(e)
  })
), Ci = (e, t) => e !== ze && !e.__isScriptSetup && Le(e, t), Pp = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: o, data: s, props: i, accessCache: r, type: l, appContext: a } = e;
    let c;
    if (t[0] !== "$") {
      const g = r[t];
      if (g !== void 0)
        switch (g) {
          case 1:
            return o[t];
          case 2:
            return s[t];
          case 4:
            return n[t];
          case 3:
            return i[t];
        }
      else {
        if (Ci(o, t))
          return r[t] = 1, o[t];
        if (s !== ze && Le(s, t))
          return r[t] = 2, s[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (c = e.propsOptions[0]) && Le(c, t)
        )
          return r[t] = 3, i[t];
        if (n !== ze && Le(n, t))
          return r[t] = 4, n[t];
        nr && (r[t] = 0);
      }
    }
    const d = To[t];
    let p, v;
    if (d)
      return t === "$attrs" && at(e.attrs, "get", ""), d(e);
    if (
      // css module (injected by vue-loader)
      (p = l.__cssModules) && (p = p[t])
    )
      return p;
    if (n !== ze && Le(n, t))
      return r[t] = 4, n[t];
    if (
      // global properties
      v = a.config.globalProperties, Le(v, t)
    )
      return v[t];
  },
  set({ _: e }, t, n) {
    const { data: o, setupState: s, ctx: i } = e;
    return Ci(s, t) ? (s[t] = n, !0) : o !== ze && Le(o, t) ? (o[t] = n, !0) : Le(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: o, appContext: s, propsOptions: i }
  }, r) {
    let l;
    return !!n[r] || e !== ze && Le(e, r) || Ci(t, r) || (l = i[0]) && Le(l, r) || Le(o, r) || Le(To, r) || Le(s.config.globalProperties, r);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : Le(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Dp() {
  return fc().slots;
}
function Rp() {
  return fc().attrs;
}
function fc() {
  const e = ho();
  return e.setupContext || (e.setupContext = Ac(e));
}
function zl(e) {
  return Ee(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
function pc(e, t) {
  const n = {};
  for (const o in e)
    t.includes(o) || Object.defineProperty(n, o, {
      enumerable: !0,
      get: () => e[o]
    });
  return n;
}
let nr = !0;
function Ap(e) {
  const t = vc(e), n = e.proxy, o = e.ctx;
  nr = !1, t.beforeCreate && Bl(t.beforeCreate, e, "bc");
  const {
    // state
    data: s,
    computed: i,
    methods: r,
    watch: l,
    provide: a,
    inject: c,
    // lifecycle
    created: d,
    beforeMount: p,
    mounted: v,
    beforeUpdate: g,
    updated: k,
    activated: $,
    deactivated: S,
    beforeDestroy: T,
    beforeUnmount: D,
    destroyed: m,
    unmounted: _,
    render: z,
    renderTracked: U,
    renderTriggered: Z,
    errorCaptured: G,
    serverPrefetch: P,
    // public API
    expose: V,
    inheritAttrs: Y,
    // assets
    components: H,
    directives: J,
    filters: C
  } = t;
  if (c && Lp(c, o, null), r)
    for (const R in r) {
      const j = r[R];
      Se(j) && (o[R] = j.bind(n));
    }
  if (s) {
    const R = s.call(n, n);
    Be(R) && (e.data = wn(R));
  }
  if (nr = !0, i)
    for (const R in i) {
      const j = i[R], ne = Se(j) ? j.bind(n, n) : Se(j.get) ? j.get.bind(n, n) : Lt, le = !Se(j) && Se(j.set) ? j.set.bind(n) : Lt, fe = ae({
        get: ne,
        set: le
      });
      Object.defineProperty(o, R, {
        enumerable: !0,
        configurable: !0,
        get: () => fe.value,
        set: (se) => fe.value = se
      });
    }
  if (l)
    for (const R in l)
      hc(l[R], o, n, R);
  if (a) {
    const R = Se(a) ? a.call(n) : a;
    Reflect.ownKeys(R).forEach((j) => {
      Fn(j, R[j]);
    });
  }
  d && Bl(d, e, "c");
  function M(R, j) {
    Ee(j) ? j.forEach((ne) => R(ne.bind(n))) : j && R(j.bind(n));
  }
  if (M(ic, p), M(rt, v), M($p, g), M(Np, k), M(xp, $), M(Sp, S), M(Tp, G), M(Op, U), M(Mp, Z), M(sn, D), M(ni, _), M(Ip, P), Ee(V))
    if (V.length) {
      const R = e.exposed || (e.exposed = {});
      V.forEach((j) => {
        Object.defineProperty(R, j, {
          get: () => n[j],
          set: (ne) => n[j] = ne
        });
      });
    } else e.exposed || (e.exposed = {});
  z && e.render === Lt && (e.render = z), Y != null && (e.inheritAttrs = Y), H && (e.components = H), J && (e.directives = J), P && nc(e);
}
function Lp(e, t, n = Lt) {
  Ee(e) && (e = or(e));
  for (const o in e) {
    const s = e[o];
    let i;
    Be(s) ? "default" in s ? i = Vt(
      s.from || o,
      s.default,
      !0
    ) : i = Vt(s.from || o) : i = Vt(s), Xe(i) ? Object.defineProperty(t, o, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (r) => i.value = r
    }) : t[o] = i;
  }
}
function Bl(e, t, n) {
  Bt(
    Ee(e) ? e.map((o) => o.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function hc(e, t, n, o) {
  let s = o.includes(".") ? Ic(n, o) : () => n[o];
  if (Ge(e)) {
    const i = t[e];
    Se(i) && Ne(s, i);
  } else if (Se(e))
    Ne(s, e.bind(n));
  else if (Be(e))
    if (Ee(e))
      e.forEach((i) => hc(i, t, n, o));
    else {
      const i = Se(e.handler) ? e.handler.bind(n) : t[e.handler];
      Se(i) && Ne(s, i, e);
    }
}
function vc(e) {
  const t = e.type, { mixins: n, extends: o } = t, {
    mixins: s,
    optionsCache: i,
    config: { optionMergeStrategies: r }
  } = e.appContext, l = i.get(t);
  let a;
  return l ? a = l : !s.length && !n && !o ? a = t : (a = {}, s.length && s.forEach(
    (c) => Rs(a, c, r, !0)
  ), Rs(a, t, r)), Be(t) && i.set(t, a), a;
}
function Rs(e, t, n, o = !1) {
  const { mixins: s, extends: i } = t;
  i && Rs(e, i, n, !0), s && s.forEach(
    (r) => Rs(e, r, n, !0)
  );
  for (const r in t)
    if (!(o && r === "expose")) {
      const l = Vp[r] || n && n[r];
      e[r] = l ? l(e[r], t[r]) : t[r];
    }
  return e;
}
const Vp = {
  data: Fl,
  props: Ul,
  emits: Ul,
  // objects
  methods: xo,
  computed: xo,
  // lifecycle
  beforeCreate: dt,
  created: dt,
  beforeMount: dt,
  mounted: dt,
  beforeUpdate: dt,
  updated: dt,
  beforeDestroy: dt,
  beforeUnmount: dt,
  destroyed: dt,
  unmounted: dt,
  activated: dt,
  deactivated: dt,
  errorCaptured: dt,
  serverPrefetch: dt,
  // assets
  components: xo,
  directives: xo,
  // watch
  watch: Bp,
  // provide / inject
  provide: Fl,
  inject: zp
};
function Fl(e, t) {
  return t ? e ? function() {
    return ct(
      Se(e) ? e.call(this, this) : e,
      Se(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function zp(e, t) {
  return xo(or(e), or(t));
}
function or(e) {
  if (Ee(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function dt(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function xo(e, t) {
  return e ? ct(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Ul(e, t) {
  return e ? Ee(e) && Ee(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : ct(
    /* @__PURE__ */ Object.create(null),
    zl(e),
    zl(t ?? {})
  ) : t;
}
function Bp(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = ct(/* @__PURE__ */ Object.create(null), e);
  for (const o in t)
    n[o] = dt(e[o], t[o]);
  return n;
}
function gc() {
  return {
    app: null,
    config: {
      isNativeTag: If,
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
let Fp = 0;
function Up(e, t) {
  return function(o, s = null) {
    Se(o) || (o = ct({}, o)), s != null && !Be(s) && (s = null);
    const i = gc(), r = /* @__PURE__ */ new WeakSet(), l = [];
    let a = !1;
    const c = i.app = {
      _uid: Fp++,
      _component: o,
      _props: s,
      _container: null,
      _context: i,
      _instance: null,
      version: wh,
      get config() {
        return i.config;
      },
      set config(d) {
      },
      use(d, ...p) {
        return r.has(d) || (d && Se(d.install) ? (r.add(d), d.install(c, ...p)) : Se(d) && (r.add(d), d(c, ...p))), c;
      },
      mixin(d) {
        return i.mixins.includes(d) || i.mixins.push(d), c;
      },
      component(d, p) {
        return p ? (i.components[d] = p, c) : i.components[d];
      },
      directive(d, p) {
        return p ? (i.directives[d] = p, c) : i.directives[d];
      },
      mount(d, p, v) {
        if (!a) {
          const g = c._ceVNode || Q(o, s);
          return g.appContext = i, v === !0 ? v = "svg" : v === !1 && (v = void 0), e(g, d, v), a = !0, c._container = d, d.__vue_app__ = c, ii(g.component);
        }
      },
      onUnmount(d) {
        l.push(d);
      },
      unmount() {
        a && (Bt(
          l,
          c._instance,
          16
        ), e(null, c._container), delete c._container.__vue_app__);
      },
      provide(d, p) {
        return i.provides[d] = p, c;
      },
      runWithContext(d) {
        const p = to;
        to = c;
        try {
          return d();
        } finally {
          to = p;
        }
      }
    };
    return c;
  };
}
let to = null;
function Fn(e, t) {
  if (st) {
    let n = st.provides;
    const o = st.parent && st.parent.provides;
    o === n && (n = st.provides = Object.create(o)), n[e] = t;
  }
}
function Vt(e, t, n = !1) {
  const o = st || tt;
  if (o || to) {
    const s = to ? to._context.provides : o ? o.parent == null ? o.vnode.appContext && o.vnode.appContext.provides : o.parent.provides : void 0;
    if (s && e in s)
      return s[e];
    if (arguments.length > 1)
      return n && Se(t) ? t.call(o && o.proxy) : t;
  }
}
const mc = {}, yc = () => Object.create(mc), bc = (e) => Object.getPrototypeOf(e) === mc;
function Hp(e, t, n, o = !1) {
  const s = {}, i = yc();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), _c(e, t, s, i);
  for (const r in e.propsOptions[0])
    r in s || (s[r] = void 0);
  n ? e.props = o ? s : rp(s) : e.type.props ? e.props = s : e.props = i, e.attrs = i;
}
function jp(e, t, n, o) {
  const {
    props: s,
    attrs: i,
    vnode: { patchFlag: r }
  } = e, l = Re(s), [a] = e.propsOptions;
  let c = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (o || r > 0) && !(r & 16)
  ) {
    if (r & 8) {
      const d = e.vnode.dynamicProps;
      for (let p = 0; p < d.length; p++) {
        let v = d[p];
        if (oi(e.emitsOptions, v))
          continue;
        const g = t[v];
        if (a)
          if (Le(i, v))
            g !== i[v] && (i[v] = g, c = !0);
          else {
            const k = xt(v);
            s[k] = sr(
              a,
              l,
              k,
              g,
              e,
              !1
            );
          }
        else
          g !== i[v] && (i[v] = g, c = !0);
      }
    }
  } else {
    _c(e, t, s, i) && (c = !0);
    let d;
    for (const p in l)
      (!t || // for camelCase
      !Le(t, p) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((d = xn(p)) === p || !Le(t, d))) && (a ? n && // for camelCase
      (n[p] !== void 0 || // for kebab-case
      n[d] !== void 0) && (s[p] = sr(
        a,
        l,
        p,
        void 0,
        e,
        !0
      )) : delete s[p]);
    if (i !== l)
      for (const p in i)
        (!t || !Le(t, p)) && (delete i[p], c = !0);
  }
  c && Gt(e.attrs, "set", "");
}
function _c(e, t, n, o) {
  const [s, i] = e.propsOptions;
  let r = !1, l;
  if (t)
    for (let a in t) {
      if (Io(a))
        continue;
      const c = t[a];
      let d;
      s && Le(s, d = xt(a)) ? !i || !i.includes(d) ? n[d] = c : (l || (l = {}))[d] = c : oi(e.emitsOptions, a) || (!(a in o) || c !== o[a]) && (o[a] = c, r = !0);
    }
  if (i) {
    const a = Re(n), c = l || ze;
    for (let d = 0; d < i.length; d++) {
      const p = i[d];
      n[p] = sr(
        s,
        a,
        p,
        c[p],
        e,
        !Le(c, p)
      );
    }
  }
  return r;
}
function sr(e, t, n, o, s, i) {
  const r = e[n];
  if (r != null) {
    const l = Le(r, "default");
    if (l && o === void 0) {
      const a = r.default;
      if (r.type !== Function && !r.skipFactory && Se(a)) {
        const { propsDefaults: c } = s;
        if (n in c)
          o = c[n];
        else {
          const d = Qo(s);
          o = c[n] = a.call(
            null,
            t
          ), d();
        }
      } else
        o = a;
      s.ce && s.ce._setProp(n, o);
    }
    r[
      0
      /* shouldCast */
    ] && (i && !l ? o = !1 : r[
      1
      /* shouldCastTrue */
    ] && (o === "" || o === xn(n)) && (o = !0));
  }
  return o;
}
const Gp = /* @__PURE__ */ new WeakMap();
function wc(e, t, n = !1) {
  const o = n ? Gp : t.propsCache, s = o.get(e);
  if (s)
    return s;
  const i = e.props, r = {}, l = [];
  let a = !1;
  if (!Se(e)) {
    const d = (p) => {
      a = !0;
      const [v, g] = wc(p, t, !0);
      ct(r, v), g && l.push(...g);
    };
    !n && t.mixins.length && t.mixins.forEach(d), e.extends && d(e.extends), e.mixins && e.mixins.forEach(d);
  }
  if (!i && !a)
    return Be(e) && o.set(e, Wn), Wn;
  if (Ee(i))
    for (let d = 0; d < i.length; d++) {
      const p = xt(i[d]);
      Hl(p) && (r[p] = ze);
    }
  else if (i)
    for (const d in i) {
      const p = xt(d);
      if (Hl(p)) {
        const v = i[d], g = r[p] = Ee(v) || Se(v) ? { type: v } : ct({}, v), k = g.type;
        let $ = !1, S = !0;
        if (Ee(k))
          for (let T = 0; T < k.length; ++T) {
            const D = k[T], m = Se(D) && D.name;
            if (m === "Boolean") {
              $ = !0;
              break;
            } else m === "String" && (S = !1);
          }
        else
          $ = Se(k) && k.name === "Boolean";
        g[
          0
          /* shouldCast */
        ] = $, g[
          1
          /* shouldCastTrue */
        ] = S, ($ || Le(g, "default")) && l.push(p);
      }
    }
  const c = [r, l];
  return Be(e) && o.set(e, c), c;
}
function Hl(e) {
  return e[0] !== "$" && !Io(e);
}
const kc = (e) => e[0] === "_" || e === "$stable", Gr = (e) => Ee(e) ? e.map(At) : [At(e)], Yp = (e, t, n) => {
  if (t._n)
    return t;
  const o = bn((...s) => Gr(t(...s)), n);
  return o._c = !1, o;
}, Ec = (e, t, n) => {
  const o = e._ctx;
  for (const s in e) {
    if (kc(s)) continue;
    const i = e[s];
    if (Se(i))
      t[s] = Yp(s, i, o);
    else if (i != null) {
      const r = Gr(i);
      t[s] = () => r;
    }
  }
}, xc = (e, t) => {
  const n = Gr(t);
  e.slots.default = () => n;
}, Sc = (e, t, n) => {
  for (const o in t)
    (n || o !== "_") && (e[o] = t[o]);
}, qp = (e, t, n) => {
  const o = e.slots = yc();
  if (e.vnode.shapeFlag & 32) {
    const s = t._;
    s ? (Sc(o, t, n), n && Iu(o, "_", s, !0)) : Ec(t, o);
  } else t && xc(e, t);
}, Xp = (e, t, n) => {
  const { vnode: o, slots: s } = e;
  let i = !0, r = ze;
  if (o.shapeFlag & 32) {
    const l = t._;
    l ? n && l === 1 ? i = !1 : Sc(s, t, n) : (i = !t.$stable, Ec(t, s)), r = t;
  } else t && (xc(e, t), r = { default: 1 });
  if (i)
    for (const l in s)
      !kc(l) && r[l] == null && delete s[l];
}, wt = ah;
function Kp(e) {
  return Wp(e);
}
function Wp(e, t) {
  const n = Zs();
  n.__VUE__ = !0;
  const {
    insert: o,
    remove: s,
    patchProp: i,
    createElement: r,
    createText: l,
    createComment: a,
    setText: c,
    setElementText: d,
    parentNode: p,
    nextSibling: v,
    setScopeId: g = Lt,
    insertStaticContent: k
  } = e, $ = (h, I, y, b = null, w = null, E = null, F = void 0, K = null, x = !!I.dynamicChildren) => {
    if (h === I)
      return;
    h && !_o(h, I) && (b = we(h), se(h, w, E, !0), h = null), I.patchFlag === -2 && (x = !1, I.dynamicChildren = null);
    const { type: f, ref: q, shapeFlag: X } = I;
    switch (f) {
      case si:
        S(h, I, y, b);
        break;
      case kn:
        T(h, I, y, b);
        break;
      case ws:
        h == null && D(I, y, b, F);
        break;
      case me:
        H(
          h,
          I,
          y,
          b,
          w,
          E,
          F,
          K,
          x
        );
        break;
      default:
        X & 1 ? z(
          h,
          I,
          y,
          b,
          w,
          E,
          F,
          K,
          x
        ) : X & 6 ? J(
          h,
          I,
          y,
          b,
          w,
          E,
          F,
          K,
          x
        ) : (X & 64 || X & 128) && f.process(
          h,
          I,
          y,
          b,
          w,
          E,
          F,
          K,
          x,
          ke
        );
    }
    q != null && w && Ds(q, h && h.ref, E, I || h, !I);
  }, S = (h, I, y, b) => {
    if (h == null)
      o(
        I.el = l(I.children),
        y,
        b
      );
    else {
      const w = I.el = h.el;
      I.children !== h.children && c(w, I.children);
    }
  }, T = (h, I, y, b) => {
    h == null ? o(
      I.el = a(I.children || ""),
      y,
      b
    ) : I.el = h.el;
  }, D = (h, I, y, b) => {
    [h.el, h.anchor] = k(
      h.children,
      I,
      y,
      b,
      h.el,
      h.anchor
    );
  }, m = ({ el: h, anchor: I }, y, b) => {
    let w;
    for (; h && h !== I; )
      w = v(h), o(h, y, b), h = w;
    o(I, y, b);
  }, _ = ({ el: h, anchor: I }) => {
    let y;
    for (; h && h !== I; )
      y = v(h), s(h), h = y;
    s(I);
  }, z = (h, I, y, b, w, E, F, K, x) => {
    I.type === "svg" ? F = "svg" : I.type === "math" && (F = "mathml"), h == null ? U(
      I,
      y,
      b,
      w,
      E,
      F,
      K,
      x
    ) : P(
      h,
      I,
      w,
      E,
      F,
      K,
      x
    );
  }, U = (h, I, y, b, w, E, F, K) => {
    let x, f;
    const { props: q, shapeFlag: X, transition: ie, dirs: de } = h;
    if (x = h.el = r(
      h.type,
      E,
      q && q.is,
      q
    ), X & 8 ? d(x, h.children) : X & 16 && G(
      h.children,
      x,
      null,
      b,
      w,
      $i(h, E),
      F,
      K
    ), de && $n(h, null, b, "created"), Z(x, h, h.scopeId, F, b), q) {
      for (const Ce in q)
        Ce !== "value" && !Io(Ce) && i(x, Ce, null, q[Ce], E, b);
      "value" in q && i(x, "value", null, q.value, E), (f = q.onVnodeBeforeMount) && Pt(f, b, h);
    }
    de && $n(h, null, b, "beforeMount");
    const be = Zp(w, ie);
    be && ie.beforeEnter(x), o(x, I, y), ((f = q && q.onVnodeMounted) || be || de) && wt(() => {
      f && Pt(f, b, h), be && ie.enter(x), de && $n(h, null, b, "mounted");
    }, w);
  }, Z = (h, I, y, b, w) => {
    if (y && g(h, y), b)
      for (let E = 0; E < b.length; E++)
        g(h, b[E]);
    if (w) {
      let E = w.subTree;
      if (I === E || Oc(E.type) && (E.ssContent === I || E.ssFallback === I)) {
        const F = w.vnode;
        Z(
          h,
          F,
          F.scopeId,
          F.slotScopeIds,
          w.parent
        );
      }
    }
  }, G = (h, I, y, b, w, E, F, K, x = 0) => {
    for (let f = x; f < h.length; f++) {
      const q = h[f] = K ? cn(h[f]) : At(h[f]);
      $(
        null,
        q,
        I,
        y,
        b,
        w,
        E,
        F,
        K
      );
    }
  }, P = (h, I, y, b, w, E, F) => {
    const K = I.el = h.el;
    let { patchFlag: x, dynamicChildren: f, dirs: q } = I;
    x |= h.patchFlag & 16;
    const X = h.props || ze, ie = I.props || ze;
    let de;
    if (y && Nn(y, !1), (de = ie.onVnodeBeforeUpdate) && Pt(de, y, I, h), q && $n(I, h, y, "beforeUpdate"), y && Nn(y, !0), (X.innerHTML && ie.innerHTML == null || X.textContent && ie.textContent == null) && d(K, ""), f ? V(
      h.dynamicChildren,
      f,
      K,
      y,
      b,
      $i(I, w),
      E
    ) : F || j(
      h,
      I,
      K,
      null,
      y,
      b,
      $i(I, w),
      E,
      !1
    ), x > 0) {
      if (x & 16)
        Y(K, X, ie, y, w);
      else if (x & 2 && X.class !== ie.class && i(K, "class", null, ie.class, w), x & 4 && i(K, "style", X.style, ie.style, w), x & 8) {
        const be = I.dynamicProps;
        for (let Ce = 0; Ce < be.length; Ce++) {
          const Oe = be[Ce], et = X[Oe], ot = ie[Oe];
          (ot !== et || Oe === "value") && i(K, Oe, et, ot, w, y);
        }
      }
      x & 1 && h.children !== I.children && d(K, I.children);
    } else !F && f == null && Y(K, X, ie, y, w);
    ((de = ie.onVnodeUpdated) || q) && wt(() => {
      de && Pt(de, y, I, h), q && $n(I, h, y, "updated");
    }, b);
  }, V = (h, I, y, b, w, E, F) => {
    for (let K = 0; K < I.length; K++) {
      const x = h[K], f = I[K], q = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        x.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (x.type === me || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !_o(x, f) || // - In the case of a component, it could contain anything.
        x.shapeFlag & 70) ? p(x.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          y
        )
      );
      $(
        x,
        f,
        q,
        null,
        b,
        w,
        E,
        F,
        !0
      );
    }
  }, Y = (h, I, y, b, w) => {
    if (I !== y) {
      if (I !== ze)
        for (const E in I)
          !Io(E) && !(E in y) && i(
            h,
            E,
            I[E],
            null,
            w,
            b
          );
      for (const E in y) {
        if (Io(E)) continue;
        const F = y[E], K = I[E];
        F !== K && E !== "value" && i(h, E, K, F, w, b);
      }
      "value" in y && i(h, "value", I.value, y.value, w);
    }
  }, H = (h, I, y, b, w, E, F, K, x) => {
    const f = I.el = h ? h.el : l(""), q = I.anchor = h ? h.anchor : l("");
    let { patchFlag: X, dynamicChildren: ie, slotScopeIds: de } = I;
    de && (K = K ? K.concat(de) : de), h == null ? (o(f, y, b), o(q, y, b), G(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      I.children || [],
      y,
      q,
      w,
      E,
      F,
      K,
      x
    )) : X > 0 && X & 64 && ie && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    h.dynamicChildren ? (V(
      h.dynamicChildren,
      ie,
      y,
      w,
      E,
      F,
      K
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (I.key != null || w && I === w.subTree) && Cc(
      h,
      I,
      !0
      /* shallow */
    )) : j(
      h,
      I,
      y,
      q,
      w,
      E,
      F,
      K,
      x
    );
  }, J = (h, I, y, b, w, E, F, K, x) => {
    I.slotScopeIds = K, h == null ? I.shapeFlag & 512 ? w.ctx.activate(
      I,
      y,
      b,
      F,
      x
    ) : C(
      I,
      y,
      b,
      w,
      E,
      F,
      x
    ) : A(h, I, x);
  }, C = (h, I, y, b, w, E, F) => {
    const K = h.component = hh(
      h,
      b,
      w
    );
    if (oc(h) && (K.ctx.renderer = ke), vh(K, !1, F), K.asyncDep) {
      if (w && w.registerDep(K, M, F), !h.el) {
        const x = K.subTree = Q(kn);
        T(null, x, I, y);
      }
    } else
      M(
        K,
        h,
        I,
        y,
        w,
        E,
        F
      );
  }, A = (h, I, y) => {
    const b = I.component = h.component;
    if (rh(h, I, y))
      if (b.asyncDep && !b.asyncResolved) {
        R(b, I, y);
        return;
      } else
        b.next = I, b.update();
    else
      I.el = h.el, b.vnode = I;
  }, M = (h, I, y, b, w, E, F) => {
    const K = () => {
      if (h.isMounted) {
        let { next: X, bu: ie, u: de, parent: be, vnode: Ce } = h;
        {
          const bt = $c(h);
          if (bt) {
            X && (X.el = Ce.el, R(h, X, F)), bt.asyncDep.then(() => {
              h.isUnmounted || K();
            });
            return;
          }
        }
        let Oe = X, et;
        Nn(h, !1), X ? (X.el = Ce.el, R(h, X, F)) : X = Ce, ie && bs(ie), (et = X.props && X.props.onVnodeBeforeUpdate) && Pt(et, be, X, Ce), Nn(h, !0);
        const ot = Gl(h), yt = h.subTree;
        h.subTree = ot, $(
          yt,
          ot,
          // parent may have changed if it's in a teleport
          p(yt.el),
          // anchor may have changed if it's in a fragment
          we(yt),
          h,
          w,
          E
        ), X.el = ot.el, Oe === null && lh(h, ot.el), de && wt(de, w), (et = X.props && X.props.onVnodeUpdated) && wt(
          () => Pt(et, be, X, Ce),
          w
        );
      } else {
        let X;
        const { el: ie, props: de } = I, { bm: be, m: Ce, parent: Oe, root: et, type: ot } = h, yt = eo(I);
        Nn(h, !1), be && bs(be), !yt && (X = de && de.onVnodeBeforeMount) && Pt(X, Oe, I), Nn(h, !0);
        {
          et.ce && et.ce._injectChildStyle(ot);
          const bt = h.subTree = Gl(h);
          $(
            null,
            bt,
            y,
            b,
            h,
            w,
            E
          ), I.el = bt.el;
        }
        if (Ce && wt(Ce, w), !yt && (X = de && de.onVnodeMounted)) {
          const bt = I;
          wt(
            () => Pt(X, Oe, bt),
            w
          );
        }
        (I.shapeFlag & 256 || Oe && eo(Oe.vnode) && Oe.vnode.shapeFlag & 256) && h.a && wt(h.a, w), h.isMounted = !0, I = y = b = null;
      }
    };
    h.scope.on();
    const x = h.effect = new Ru(K);
    h.scope.off();
    const f = h.update = x.run.bind(x), q = h.job = x.runIfDirty.bind(x);
    q.i = h, q.id = h.uid, x.scheduler = () => Hr(q), Nn(h, !0), f();
  }, R = (h, I, y) => {
    I.component = h;
    const b = h.vnode.props;
    h.vnode = I, h.next = null, jp(h, I.props, b, y), Xp(h, I.children, y), Sn(), Ll(h), Cn();
  }, j = (h, I, y, b, w, E, F, K, x = !1) => {
    const f = h && h.children, q = h ? h.shapeFlag : 0, X = I.children, { patchFlag: ie, shapeFlag: de } = I;
    if (ie > 0) {
      if (ie & 128) {
        le(
          f,
          X,
          y,
          b,
          w,
          E,
          F,
          K,
          x
        );
        return;
      } else if (ie & 256) {
        ne(
          f,
          X,
          y,
          b,
          w,
          E,
          F,
          K,
          x
        );
        return;
      }
    }
    de & 8 ? (q & 16 && te(f, w, E), X !== f && d(y, X)) : q & 16 ? de & 16 ? le(
      f,
      X,
      y,
      b,
      w,
      E,
      F,
      K,
      x
    ) : te(f, w, E, !0) : (q & 8 && d(y, ""), de & 16 && G(
      X,
      y,
      b,
      w,
      E,
      F,
      K,
      x
    ));
  }, ne = (h, I, y, b, w, E, F, K, x) => {
    h = h || Wn, I = I || Wn;
    const f = h.length, q = I.length, X = Math.min(f, q);
    let ie;
    for (ie = 0; ie < X; ie++) {
      const de = I[ie] = x ? cn(I[ie]) : At(I[ie]);
      $(
        h[ie],
        de,
        y,
        null,
        w,
        E,
        F,
        K,
        x
      );
    }
    f > q ? te(
      h,
      w,
      E,
      !0,
      !1,
      X
    ) : G(
      I,
      y,
      b,
      w,
      E,
      F,
      K,
      x,
      X
    );
  }, le = (h, I, y, b, w, E, F, K, x) => {
    let f = 0;
    const q = I.length;
    let X = h.length - 1, ie = q - 1;
    for (; f <= X && f <= ie; ) {
      const de = h[f], be = I[f] = x ? cn(I[f]) : At(I[f]);
      if (_o(de, be))
        $(
          de,
          be,
          y,
          null,
          w,
          E,
          F,
          K,
          x
        );
      else
        break;
      f++;
    }
    for (; f <= X && f <= ie; ) {
      const de = h[X], be = I[ie] = x ? cn(I[ie]) : At(I[ie]);
      if (_o(de, be))
        $(
          de,
          be,
          y,
          null,
          w,
          E,
          F,
          K,
          x
        );
      else
        break;
      X--, ie--;
    }
    if (f > X) {
      if (f <= ie) {
        const de = ie + 1, be = de < q ? I[de].el : b;
        for (; f <= ie; )
          $(
            null,
            I[f] = x ? cn(I[f]) : At(I[f]),
            y,
            be,
            w,
            E,
            F,
            K,
            x
          ), f++;
      }
    } else if (f > ie)
      for (; f <= X; )
        se(h[f], w, E, !0), f++;
    else {
      const de = f, be = f, Ce = /* @__PURE__ */ new Map();
      for (f = be; f <= ie; f++) {
        const lt = I[f] = x ? cn(I[f]) : At(I[f]);
        lt.key != null && Ce.set(lt.key, f);
      }
      let Oe, et = 0;
      const ot = ie - be + 1;
      let yt = !1, bt = 0;
      const rn = new Array(ot);
      for (f = 0; f < ot; f++) rn[f] = 0;
      for (f = de; f <= X; f++) {
        const lt = h[f];
        if (et >= ot) {
          se(lt, w, E, !0);
          continue;
        }
        let _t;
        if (lt.key != null)
          _t = Ce.get(lt.key);
        else
          for (Oe = be; Oe <= ie; Oe++)
            if (rn[Oe - be] === 0 && _o(lt, I[Oe])) {
              _t = Oe;
              break;
            }
        _t === void 0 ? se(lt, w, E, !0) : (rn[_t - be] = f + 1, _t >= bt ? bt = _t : yt = !0, $(
          lt,
          I[_t],
          y,
          null,
          w,
          E,
          F,
          K,
          x
        ), et++);
      }
      const vo = yt ? Jp(rn) : Wn;
      for (Oe = vo.length - 1, f = ot - 1; f >= 0; f--) {
        const lt = be + f, _t = I[lt], go = lt + 1 < q ? I[lt + 1].el : b;
        rn[f] === 0 ? $(
          null,
          _t,
          y,
          go,
          w,
          E,
          F,
          K,
          x
        ) : yt && (Oe < 0 || f !== vo[Oe] ? fe(_t, y, go, 2) : Oe--);
      }
    }
  }, fe = (h, I, y, b, w = null) => {
    const { el: E, type: F, transition: K, children: x, shapeFlag: f } = h;
    if (f & 6) {
      fe(h.component.subTree, I, y, b);
      return;
    }
    if (f & 128) {
      h.suspense.move(I, y, b);
      return;
    }
    if (f & 64) {
      F.move(h, I, y, ke);
      return;
    }
    if (F === me) {
      o(E, I, y);
      for (let X = 0; X < x.length; X++)
        fe(x[X], I, y, b);
      o(h.anchor, I, y);
      return;
    }
    if (F === ws) {
      m(h, I, y);
      return;
    }
    if (b !== 2 && f & 1 && K)
      if (b === 0)
        K.beforeEnter(E), o(E, I, y), wt(() => K.enter(E), w);
      else {
        const { leave: X, delayLeave: ie, afterLeave: de } = K, be = () => o(E, I, y), Ce = () => {
          X(E, () => {
            be(), de && de();
          });
        };
        ie ? ie(E, be, Ce) : Ce();
      }
    else
      o(E, I, y);
  }, se = (h, I, y, b = !1, w = !1) => {
    const {
      type: E,
      props: F,
      ref: K,
      children: x,
      dynamicChildren: f,
      shapeFlag: q,
      patchFlag: X,
      dirs: ie,
      cacheIndex: de
    } = h;
    if (X === -2 && (w = !1), K != null && Ds(K, null, y, h, !0), de != null && (I.renderCache[de] = void 0), q & 256) {
      I.ctx.deactivate(h);
      return;
    }
    const be = q & 1 && ie, Ce = !eo(h);
    let Oe;
    if (Ce && (Oe = F && F.onVnodeBeforeUnmount) && Pt(Oe, I, h), q & 6)
      ge(h.component, y, b);
    else {
      if (q & 128) {
        h.suspense.unmount(y, b);
        return;
      }
      be && $n(h, null, I, "beforeUnmount"), q & 64 ? h.type.remove(
        h,
        I,
        y,
        ke,
        b
      ) : f && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !f.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (E !== me || X > 0 && X & 64) ? te(
        f,
        I,
        y,
        !1,
        !0
      ) : (E === me && X & 384 || !w && q & 16) && te(x, I, y), b && ce(h);
    }
    (Ce && (Oe = F && F.onVnodeUnmounted) || be) && wt(() => {
      Oe && Pt(Oe, I, h), be && $n(h, null, I, "unmounted");
    }, y);
  }, ce = (h) => {
    const { type: I, el: y, anchor: b, transition: w } = h;
    if (I === me) {
      ue(y, b);
      return;
    }
    if (I === ws) {
      _(h);
      return;
    }
    const E = () => {
      s(y), w && !w.persisted && w.afterLeave && w.afterLeave();
    };
    if (h.shapeFlag & 1 && w && !w.persisted) {
      const { leave: F, delayLeave: K } = w, x = () => F(y, E);
      K ? K(h.el, E, x) : x();
    } else
      E();
  }, ue = (h, I) => {
    let y;
    for (; h !== I; )
      y = v(h), s(h), h = y;
    s(I);
  }, ge = (h, I, y) => {
    const { bum: b, scope: w, job: E, subTree: F, um: K, m: x, a: f } = h;
    jl(x), jl(f), b && bs(b), w.stop(), E && (E.flags |= 8, se(F, h, I, y)), K && wt(K, I), wt(() => {
      h.isUnmounted = !0;
    }, I), I && I.pendingBranch && !I.isUnmounted && h.asyncDep && !h.asyncResolved && h.suspenseId === I.pendingId && (I.deps--, I.deps === 0 && I.resolve());
  }, te = (h, I, y, b = !1, w = !1, E = 0) => {
    for (let F = E; F < h.length; F++)
      se(h[F], I, y, b, w);
  }, we = (h) => {
    if (h.shapeFlag & 6)
      return we(h.component.subTree);
    if (h.shapeFlag & 128)
      return h.suspense.next();
    const I = v(h.anchor || h.el), y = I && I[kp];
    return y ? v(y) : I;
  };
  let xe = !1;
  const _e = (h, I, y) => {
    h == null ? I._vnode && se(I._vnode, null, null, !0) : $(
      I._vnode || null,
      h,
      I,
      null,
      null,
      null,
      y
    ), I._vnode = h, xe || (xe = !0, Ll(), Qu(), xe = !1);
  }, ke = {
    p: $,
    um: se,
    m: fe,
    r: ce,
    mt: C,
    mc: G,
    pc: j,
    pbc: V,
    n: we,
    o: e
  };
  return {
    render: _e,
    hydrate: void 0,
    createApp: Up(_e)
  };
}
function $i({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Nn({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Zp(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Cc(e, t, n = !1) {
  const o = e.children, s = t.children;
  if (Ee(o) && Ee(s))
    for (let i = 0; i < o.length; i++) {
      const r = o[i];
      let l = s[i];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = s[i] = cn(s[i]), l.el = r.el), !n && l.patchFlag !== -2 && Cc(r, l)), l.type === si && (l.el = r.el);
    }
}
function Jp(e) {
  const t = e.slice(), n = [0];
  let o, s, i, r, l;
  const a = e.length;
  for (o = 0; o < a; o++) {
    const c = e[o];
    if (c !== 0) {
      if (s = n[n.length - 1], e[s] < c) {
        t[o] = s, n.push(o);
        continue;
      }
      for (i = 0, r = n.length - 1; i < r; )
        l = i + r >> 1, e[n[l]] < c ? i = l + 1 : r = l;
      c < e[n[i]] && (i > 0 && (t[o] = n[i - 1]), n[i] = o);
    }
  }
  for (i = n.length, r = n[i - 1]; i-- > 0; )
    n[i] = r, r = t[r];
  return n;
}
function $c(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : $c(t);
}
function jl(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Qp = Symbol.for("v-scx"), eh = () => Vt(Qp);
function Ne(e, t, n) {
  return Nc(e, t, n);
}
function Nc(e, t, n = ze) {
  const { immediate: o, deep: s, flush: i, once: r } = n, l = ct({}, n), a = t && o || !t && i !== "post";
  let c;
  if (Fo) {
    if (i === "sync") {
      const g = eh();
      c = g.__watcherHandles || (g.__watcherHandles = []);
    } else if (!a) {
      const g = () => {
      };
      return g.stop = Lt, g.resume = Lt, g.pause = Lt, g;
    }
  }
  const d = st;
  l.call = (g, k, $) => Bt(g, d, k, $);
  let p = !1;
  i === "post" ? l.scheduler = (g) => {
    wt(g, d && d.suspense);
  } : i !== "sync" && (p = !0, l.scheduler = (g, k) => {
    k ? g() : Hr(g);
  }), l.augmentJob = (g) => {
    t && (g.flags |= 4), p && (g.flags |= 2, d && (g.id = d.uid, g.i = d));
  };
  const v = yp(e, t, l);
  return Fo && (c ? c.push(v) : a && v()), v;
}
function th(e, t, n) {
  const o = this.proxy, s = Ge(e) ? e.includes(".") ? Ic(o, e) : () => o[e] : e.bind(o, o);
  let i;
  Se(t) ? i = t : (i = t.handler, n = t);
  const r = Qo(this), l = Nc(s, i.bind(o), n);
  return r(), l;
}
function Ic(e, t) {
  const n = t.split(".");
  return () => {
    let o = e;
    for (let s = 0; s < n.length && o; s++)
      o = o[n[s]];
    return o;
  };
}
const nh = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${xt(t)}Modifiers`] || e[`${xn(t)}Modifiers`];
function oh(e, t, ...n) {
  if (e.isUnmounted) return;
  const o = e.vnode.props || ze;
  let s = n;
  const i = t.startsWith("update:"), r = i && nh(o, t.slice(7));
  r && (r.trim && (s = n.map((d) => Ge(d) ? d.trim() : d)), r.number && (s = n.map(Is)));
  let l, a = o[l = _i(t)] || // also try camelCase event handler (#2249)
  o[l = _i(xt(t))];
  !a && i && (a = o[l = _i(xn(t))]), a && Bt(
    a,
    e,
    6,
    s
  );
  const c = o[l + "Once"];
  if (c) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[l])
      return;
    e.emitted[l] = !0, Bt(
      c,
      e,
      6,
      s
    );
  }
}
function Mc(e, t, n = !1) {
  const o = t.emitsCache, s = o.get(e);
  if (s !== void 0)
    return s;
  const i = e.emits;
  let r = {}, l = !1;
  if (!Se(e)) {
    const a = (c) => {
      const d = Mc(c, t, !0);
      d && (l = !0, ct(r, d));
    };
    !n && t.mixins.length && t.mixins.forEach(a), e.extends && a(e.extends), e.mixins && e.mixins.forEach(a);
  }
  return !i && !l ? (Be(e) && o.set(e, null), null) : (Ee(i) ? i.forEach((a) => r[a] = null) : ct(r, i), Be(e) && o.set(e, r), r);
}
function oi(e, t) {
  return !e || !Xs(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), Le(e, t[0].toLowerCase() + t.slice(1)) || Le(e, xn(t)) || Le(e, t));
}
function Gl(e) {
  const {
    type: t,
    vnode: n,
    proxy: o,
    withProxy: s,
    propsOptions: [i],
    slots: r,
    attrs: l,
    emit: a,
    render: c,
    renderCache: d,
    props: p,
    data: v,
    setupState: g,
    ctx: k,
    inheritAttrs: $
  } = e, S = Ps(e);
  let T, D;
  try {
    if (n.shapeFlag & 4) {
      const _ = s || o, z = _;
      T = At(
        c.call(
          z,
          _,
          d,
          p,
          g,
          v,
          k
        )
      ), D = l;
    } else {
      const _ = t;
      T = At(
        _.length > 1 ? _(
          p,
          { attrs: l, slots: r, emit: a }
        ) : _(
          p,
          null
        )
      ), D = t.props ? l : sh(l);
    }
  } catch (_) {
    Po.length = 0, ei(_, e, 1), T = Q(kn);
  }
  let m = T;
  if (D && $ !== !1) {
    const _ = Object.keys(D), { shapeFlag: z } = m;
    _.length && z & 7 && (i && _.some(Or) && (D = ih(
      D,
      i
    )), m = ro(m, D, !1, !0));
  }
  return n.dirs && (m = ro(m, null, !1, !0), m.dirs = m.dirs ? m.dirs.concat(n.dirs) : n.dirs), n.transition && jr(m, n.transition), T = m, Ps(S), T;
}
const sh = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Xs(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, ih = (e, t) => {
  const n = {};
  for (const o in e)
    (!Or(o) || !(o.slice(9) in t)) && (n[o] = e[o]);
  return n;
};
function rh(e, t, n) {
  const { props: o, children: s, component: i } = e, { props: r, children: l, patchFlag: a } = t, c = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && a >= 0) {
    if (a & 1024)
      return !0;
    if (a & 16)
      return o ? Yl(o, r, c) : !!r;
    if (a & 8) {
      const d = t.dynamicProps;
      for (let p = 0; p < d.length; p++) {
        const v = d[p];
        if (r[v] !== o[v] && !oi(c, v))
          return !0;
      }
    }
  } else
    return (s || l) && (!l || !l.$stable) ? !0 : o === r ? !1 : o ? r ? Yl(o, r, c) : !0 : !!r;
  return !1;
}
function Yl(e, t, n) {
  const o = Object.keys(t);
  if (o.length !== Object.keys(e).length)
    return !0;
  for (let s = 0; s < o.length; s++) {
    const i = o[s];
    if (t[i] !== e[i] && !oi(n, i))
      return !0;
  }
  return !1;
}
function lh({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const o = t.subTree;
    if (o.suspense && o.suspense.activeBranch === e && (o.el = e.el), o === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const Oc = (e) => e.__isSuspense;
function ah(e, t) {
  t && t.pendingBranch ? Ee(e) ? t.effects.push(...e) : t.effects.push(e) : wp(e);
}
const me = Symbol.for("v-fgt"), si = Symbol.for("v-txt"), kn = Symbol.for("v-cmt"), ws = Symbol.for("v-stc"), Po = [];
let ht = null;
function N(e = !1) {
  Po.push(ht = e ? null : []);
}
function uh() {
  Po.pop(), ht = Po[Po.length - 1] || null;
}
let io = 1;
function ql(e, t = !1) {
  io += e, e < 0 && ht && t && (ht.hasOnce = !0);
}
function Tc(e) {
  return e.dynamicChildren = io > 0 ? ht || Wn : null, uh(), io > 0 && ht && ht.push(e), e;
}
function O(e, t, n, o, s, i) {
  return Tc(
    u(
      e,
      t,
      n,
      o,
      s,
      i,
      !0
    )
  );
}
function vt(e, t, n, o, s) {
  return Tc(
    Q(
      e,
      t,
      n,
      o,
      s,
      !0
    )
  );
}
function Bo(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function _o(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Pc = ({ key: e }) => e ?? null, ks = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? Ge(e) || Xe(e) || Se(e) ? { i: tt, r: e, k: t, f: !!n } : e : null);
function u(e, t = null, n = null, o = 0, s = null, i = e === me ? 0 : 1, r = !1, l = !1) {
  const a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Pc(t),
    ref: t && ks(t),
    scopeId: tc,
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
    shapeFlag: i,
    patchFlag: o,
    dynamicProps: s,
    dynamicChildren: null,
    appContext: null,
    ctx: tt
  };
  return l ? (Yr(a, n), i & 128 && e.normalize(a)) : n && (a.shapeFlag |= Ge(n) ? 8 : 16), io > 0 && // avoid a block node from tracking itself
  !r && // has current parent block
  ht && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (a.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  a.patchFlag !== 32 && ht.push(a), a;
}
const Q = ch;
function ch(e, t = null, n = null, o = 0, s = null, i = !1) {
  if ((!e || e === ac) && (e = kn), Bo(e)) {
    const l = ro(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Yr(l, n), io > 0 && !i && ht && (l.shapeFlag & 6 ? ht[ht.indexOf(e)] = l : ht.push(l)), l.patchFlag = -2, l;
  }
  if (bh(e) && (e = e.__vccOpts), t) {
    t = Es(t);
    let { class: l, style: a } = t;
    l && !Ge(l) && (t.class = ve(l)), Be(a) && (Ur(a) && !Ee(a) && (a = ct({}, a)), t.style = it(a));
  }
  const r = Ge(e) ? 1 : Oc(e) ? 128 : Ep(e) ? 64 : Be(e) ? 4 : Se(e) ? 2 : 0;
  return u(
    e,
    t,
    n,
    o,
    s,
    r,
    i,
    !0
  );
}
function Es(e) {
  return e ? Ur(e) || bc(e) ? ct({}, e) : e : null;
}
function ro(e, t, n = !1, o = !1) {
  const { props: s, ref: i, patchFlag: r, children: l, transition: a } = e, c = t ? qr(s || {}, t) : s, d = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: c,
    key: c && Pc(c),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? Ee(i) ? i.concat(ks(t)) : [i, ks(t)] : ks(t)
    ) : i,
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
    patchFlag: t && e.type !== me ? r === -1 ? 16 : r | 16 : r,
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
    ssContent: e.ssContent && ro(e.ssContent),
    ssFallback: e.ssFallback && ro(e.ssFallback),
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return a && o && jr(
    d,
    a.clone(d)
  ), d;
}
function he(e = " ", t = 0) {
  return Q(si, null, e, t);
}
function dh(e, t) {
  const n = Q(ws, null, e);
  return n.staticCount = t, n;
}
function re(e = "", t = !1) {
  return t ? (N(), vt(kn, null, e)) : Q(kn, null, e);
}
function At(e) {
  return e == null || typeof e == "boolean" ? Q(kn) : Ee(e) ? Q(
    me,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Bo(e) ? cn(e) : Q(si, null, String(e));
}
function cn(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : ro(e);
}
function Yr(e, t) {
  let n = 0;
  const { shapeFlag: o } = e;
  if (t == null)
    t = null;
  else if (Ee(t))
    n = 16;
  else if (typeof t == "object")
    if (o & 65) {
      const s = t.default;
      s && (s._c && (s._d = !1), Yr(e, s()), s._c && (s._d = !0));
      return;
    } else {
      n = 32;
      const s = t._;
      !s && !bc(t) ? t._ctx = tt : s === 3 && tt && (tt.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else Se(t) ? (t = { default: t, _ctx: tt }, n = 32) : (t = String(t), o & 64 ? (n = 16, t = [he(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function qr(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const o = e[n];
    for (const s in o)
      if (s === "class")
        t.class !== o.class && (t.class = ve([t.class, o.class]));
      else if (s === "style")
        t.style = it([t.style, o.style]);
      else if (Xs(s)) {
        const i = t[s], r = o[s];
        r && i !== r && !(Ee(i) && i.includes(r)) && (t[s] = i ? [].concat(i, r) : r);
      } else s !== "" && (t[s] = o[s]);
  }
  return t;
}
function Pt(e, t, n, o = null) {
  Bt(e, t, 7, [
    n,
    o
  ]);
}
const fh = gc();
let ph = 0;
function hh(e, t, n) {
  const o = e.type, s = (t ? t.appContext : e.appContext) || fh, i = {
    uid: ph++,
    vnode: e,
    type: o,
    parent: t,
    appContext: s,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new Pu(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(s.provides),
    ids: t ? t.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: wc(o, s),
    emitsOptions: Mc(o, s),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: ze,
    // inheritAttrs
    inheritAttrs: o.inheritAttrs,
    // state
    ctx: ze,
    data: ze,
    props: ze,
    attrs: ze,
    slots: ze,
    refs: ze,
    setupState: ze,
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = oh.bind(null, i), e.ce && e.ce(i), i;
}
let st = null;
const ho = () => st || tt;
let As, ir;
{
  const e = Zs(), t = (n, o) => {
    let s;
    return (s = e[n]) || (s = e[n] = []), s.push(o), (i) => {
      s.length > 1 ? s.forEach((r) => r(i)) : s[0](i);
    };
  };
  As = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => st = n
  ), ir = t(
    "__VUE_SSR_SETTERS__",
    (n) => Fo = n
  );
}
const Qo = (e) => {
  const t = st;
  return As(e), e.scope.on(), () => {
    e.scope.off(), As(t);
  };
}, Xl = () => {
  st && st.scope.off(), As(null);
};
function Dc(e) {
  return e.vnode.shapeFlag & 4;
}
let Fo = !1;
function vh(e, t = !1, n = !1) {
  t && ir(t);
  const { props: o, children: s } = e.vnode, i = Dc(e);
  Hp(e, o, i, t), qp(e, s, n);
  const r = i ? gh(e, t) : void 0;
  return t && ir(!1), r;
}
function gh(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Pp);
  const { setup: o } = n;
  if (o) {
    Sn();
    const s = e.setupContext = o.length > 1 ? Ac(e) : null, i = Qo(e), r = Jo(
      o,
      e,
      0,
      [
        e.props,
        s
      ]
    ), l = Cu(r);
    if (Cn(), i(), (l || e.sp) && !eo(e) && nc(e), l) {
      if (r.then(Xl, Xl), t)
        return r.then((a) => {
          Kl(e, a);
        }).catch((a) => {
          ei(a, e, 0);
        });
      e.asyncDep = r;
    } else
      Kl(e, r);
  } else
    Rc(e);
}
function Kl(e, t, n) {
  Se(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : Be(t) && (e.setupState = Ku(t)), Rc(e);
}
function Rc(e, t, n) {
  const o = e.type;
  e.render || (e.render = o.render || Lt);
  {
    const s = Qo(e);
    Sn();
    try {
      Ap(e);
    } finally {
      Cn(), s();
    }
  }
}
const mh = {
  get(e, t) {
    return at(e, "get", ""), e[t];
  }
};
function Ac(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, mh),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function ii(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Ku(An(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in To)
        return To[n](e);
    },
    has(t, n) {
      return n in t || n in To;
    }
  })) : e.proxy;
}
function yh(e, t = !0) {
  return Se(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function bh(e) {
  return Se(e) && "__vccOpts" in e;
}
const ae = (e, t) => gp(e, t, Fo);
function Ae(e, t, n) {
  const o = arguments.length;
  return o === 2 ? Be(t) && !Ee(t) ? Bo(t) ? Q(e, null, [t]) : Q(e, t) : Q(e, null, t) : (o > 3 ? n = Array.prototype.slice.call(arguments, 2) : o === 3 && Bo(n) && (n = [n]), Q(e, t, n));
}
function _h(e, t) {
  const n = e.memo;
  if (n.length != t.length)
    return !1;
  for (let o = 0; o < n.length; o++)
    if (Zt(n[o], t[o]))
      return !1;
  return io > 0 && ht && ht.push(e), !0;
}
const wh = "3.5.13";
/**
* @vue/runtime-dom v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let rr;
const Wl = typeof window < "u" && window.trustedTypes;
if (Wl)
  try {
    rr = /* @__PURE__ */ Wl.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Lc = rr ? (e) => rr.createHTML(e) : (e) => e, kh = "http://www.w3.org/2000/svg", Eh = "http://www.w3.org/1998/Math/MathML", jt = typeof document < "u" ? document : null, Zl = jt && /* @__PURE__ */ jt.createElement("template"), xh = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, o) => {
    const s = t === "svg" ? jt.createElementNS(kh, e) : t === "mathml" ? jt.createElementNS(Eh, e) : n ? jt.createElement(e, { is: n }) : jt.createElement(e);
    return e === "select" && o && o.multiple != null && s.setAttribute("multiple", o.multiple), s;
  },
  createText: (e) => jt.createTextNode(e),
  createComment: (e) => jt.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => jt.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, n, o, s, i) {
    const r = n ? n.previousSibling : t.lastChild;
    if (s && (s === i || s.nextSibling))
      for (; t.insertBefore(s.cloneNode(!0), n), !(s === i || !(s = s.nextSibling)); )
        ;
    else {
      Zl.innerHTML = Lc(
        o === "svg" ? `<svg>${e}</svg>` : o === "mathml" ? `<math>${e}</math>` : e
      );
      const l = Zl.content;
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
      r ? r.nextSibling : t.firstChild,
      // last
      n ? n.previousSibling : t.lastChild
    ];
  }
}, Sh = Symbol("_vtc");
function Ch(e, t, n) {
  const o = e[Sh];
  o && (t = (t ? [t, ...o] : [...o]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const Jl = Symbol("_vod"), $h = Symbol("_vsh"), Nh = Symbol(""), Ih = /(^|;)\s*display\s*:/;
function Mh(e, t, n) {
  const o = e.style, s = Ge(n);
  let i = !1;
  if (n && !s) {
    if (t)
      if (Ge(t))
        for (const r of t.split(";")) {
          const l = r.slice(0, r.indexOf(":")).trim();
          n[l] == null && xs(o, l, "");
        }
      else
        for (const r in t)
          n[r] == null && xs(o, r, "");
    for (const r in n)
      r === "display" && (i = !0), xs(o, r, n[r]);
  } else if (s) {
    if (t !== n) {
      const r = o[Nh];
      r && (n += ";" + r), o.cssText = n, i = Ih.test(n);
    }
  } else t && e.removeAttribute("style");
  Jl in e && (e[Jl] = i ? o.display : "", e[$h] && (o.display = "none"));
}
const Ql = /\s*!important$/;
function xs(e, t, n) {
  if (Ee(n))
    n.forEach((o) => xs(e, t, o));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const o = Oh(e, t);
    Ql.test(n) ? e.setProperty(
      xn(o),
      n.replace(Ql, ""),
      "important"
    ) : e[o] = n;
  }
}
const ea = ["Webkit", "Moz", "ms"], Ni = {};
function Oh(e, t) {
  const n = Ni[t];
  if (n)
    return n;
  let o = xt(t);
  if (o !== "filter" && o in e)
    return Ni[t] = o;
  o = Ws(o);
  for (let s = 0; s < ea.length; s++) {
    const i = ea[s] + o;
    if (i in e)
      return Ni[t] = i;
  }
  return t;
}
const ta = "http://www.w3.org/1999/xlink";
function na(e, t, n, o, s, i = zf(t)) {
  o && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(ta, t.slice(6, t.length)) : e.setAttributeNS(ta, t, n) : n == null || i && !Mu(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : Mt(n) ? String(n) : n
  );
}
function oa(e, t, n, o, s) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Lc(n) : n);
    return;
  }
  const i = e.tagName;
  if (t === "value" && i !== "PROGRESS" && // custom elements may use _value internally
  !i.includes("-")) {
    const l = i === "OPTION" ? e.getAttribute("value") || "" : e.value, a = n == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(n);
    (l !== a || !("_value" in e)) && (e.value = a), n == null && e.removeAttribute(t), e._value = n;
    return;
  }
  let r = !1;
  if (n === "" || n == null) {
    const l = typeof e[t];
    l === "boolean" ? n = Mu(n) : n == null && l === "string" ? (n = "", r = !0) : l === "number" && (n = 0, r = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  r && e.removeAttribute(s || t);
}
function pn(e, t, n, o) {
  e.addEventListener(t, n, o);
}
function Th(e, t, n, o) {
  e.removeEventListener(t, n, o);
}
const sa = Symbol("_vei");
function Ph(e, t, n, o, s = null) {
  const i = e[sa] || (e[sa] = {}), r = i[t];
  if (o && r)
    r.value = o;
  else {
    const [l, a] = Dh(t);
    if (o) {
      const c = i[t] = Lh(
        o,
        s
      );
      pn(e, l, c, a);
    } else r && (Th(e, l, r, a), i[t] = void 0);
  }
}
const ia = /(?:Once|Passive|Capture)$/;
function Dh(e) {
  let t;
  if (ia.test(e)) {
    t = {};
    let o;
    for (; o = e.match(ia); )
      e = e.slice(0, e.length - o[0].length), t[o[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : xn(e.slice(2)), t];
}
let Ii = 0;
const Rh = /* @__PURE__ */ Promise.resolve(), Ah = () => Ii || (Rh.then(() => Ii = 0), Ii = Date.now());
function Lh(e, t) {
  const n = (o) => {
    if (!o._vts)
      o._vts = Date.now();
    else if (o._vts <= n.attached)
      return;
    Bt(
      Vh(o, n.value),
      t,
      5,
      [o]
    );
  };
  return n.value = e, n.attached = Ah(), n;
}
function Vh(e, t) {
  if (Ee(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (o) => (s) => !s._stopped && o && o(s)
    );
  } else
    return t;
}
const ra = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, zh = (e, t, n, o, s, i) => {
  const r = s === "svg";
  t === "class" ? Ch(e, o, r) : t === "style" ? Mh(e, n, o) : Xs(t) ? Or(t) || Ph(e, t, n, o, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : Bh(e, t, o, r)) ? (oa(e, t, o), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && na(e, t, o, r, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !Ge(o)) ? oa(e, xt(t), o, i, t) : (t === "true-value" ? e._trueValue = o : t === "false-value" && (e._falseValue = o), na(e, t, o, r));
};
function Bh(e, t, n, o) {
  if (o)
    return !!(t === "innerHTML" || t === "textContent" || t in e && ra(t) && Se(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const s = e.tagName;
    if (s === "IMG" || s === "VIDEO" || s === "CANVAS" || s === "SOURCE")
      return !1;
  }
  return ra(t) && Ge(n) ? !1 : t in e;
}
const lo = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return Ee(t) ? (n) => bs(t, n) : t;
};
function Fh(e) {
  e.target.composing = !0;
}
function la(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Jt = Symbol("_assign"), Ve = {
  created(e, { modifiers: { lazy: t, trim: n, number: o } }, s) {
    e[Jt] = lo(s);
    const i = o || s.props && s.props.type === "number";
    pn(e, t ? "change" : "input", (r) => {
      if (r.target.composing) return;
      let l = e.value;
      n && (l = l.trim()), i && (l = Is(l)), e[Jt](l);
    }), n && pn(e, "change", () => {
      e.value = e.value.trim();
    }), t || (pn(e, "compositionstart", Fh), pn(e, "compositionend", la), pn(e, "change", la));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: o, trim: s, number: i } }, r) {
    if (e[Jt] = lo(r), e.composing) return;
    const l = (i || e.type === "number") && !/^0\d/.test(e.value) ? Is(e.value) : e.value, a = t ?? "";
    l !== a && (document.activeElement === e && e.type !== "range" && (o && t === n || s && e.value.trim() === a) || (e.value = a));
  }
}, Xr = {
  // #4096 array checkboxes need to be deep traversed
  deep: !0,
  created(e, t, n) {
    e[Jt] = lo(n), pn(e, "change", () => {
      const o = e._modelValue, s = Uo(e), i = e.checked, r = e[Jt];
      if (Ee(o)) {
        const l = Dr(o, s), a = l !== -1;
        if (i && !a)
          r(o.concat(s));
        else if (!i && a) {
          const c = [...o];
          c.splice(l, 1), r(c);
        }
      } else if (po(o)) {
        const l = new Set(o);
        i ? l.add(s) : l.delete(s), r(l);
      } else
        r(Vc(e, i));
    });
  },
  // set initial checked on mount to wait for true-value/false-value
  mounted: aa,
  beforeUpdate(e, t, n) {
    e[Jt] = lo(n), aa(e, t, n);
  }
};
function aa(e, { value: t, oldValue: n }, o) {
  e._modelValue = t;
  let s;
  if (Ee(t))
    s = Dr(t, o.props.value) > -1;
  else if (po(t))
    s = t.has(o.props.value);
  else {
    if (t === n) return;
    s = Zo(t, Vc(e, !0));
  }
  e.checked !== s && (e.checked = s);
}
const Qt = {
  // <select multiple> value need to be deep traversed
  deep: !0,
  created(e, { value: t, modifiers: { number: n } }, o) {
    const s = po(t);
    pn(e, "change", () => {
      const i = Array.prototype.filter.call(e.options, (r) => r.selected).map(
        (r) => n ? Is(Uo(r)) : Uo(r)
      );
      e[Jt](
        e.multiple ? s ? new Set(i) : i : i[0]
      ), e._assigning = !0, nt(() => {
        e._assigning = !1;
      });
    }), e[Jt] = lo(o);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(e, { value: t }) {
    ua(e, t);
  },
  beforeUpdate(e, t, n) {
    e[Jt] = lo(n);
  },
  updated(e, { value: t }) {
    e._assigning || ua(e, t);
  }
};
function ua(e, t) {
  const n = e.multiple, o = Ee(t);
  if (!(n && !o && !po(t))) {
    for (let s = 0, i = e.options.length; s < i; s++) {
      const r = e.options[s], l = Uo(r);
      if (n)
        if (o) {
          const a = typeof l;
          a === "string" || a === "number" ? r.selected = t.some((c) => String(c) === String(l)) : r.selected = Dr(t, l) > -1;
        } else
          r.selected = t.has(l);
      else if (Zo(Uo(r), t)) {
        e.selectedIndex !== s && (e.selectedIndex = s);
        return;
      }
    }
    !n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
  }
}
function Uo(e) {
  return "_value" in e ? e._value : e.value;
}
function Vc(e, t) {
  const n = t ? "_trueValue" : "_falseValue";
  return n in e ? e[n] : t;
}
const Uh = ["ctrl", "shift", "alt", "meta"], Hh = {
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
  exact: (e, t) => Uh.some((n) => e[`${n}Key`] && !t.includes(n))
}, gt = (e, t) => {
  const n = e._withMods || (e._withMods = {}), o = t.join(".");
  return n[o] || (n[o] = (s, ...i) => {
    for (let r = 0; r < t.length; r++) {
      const l = Hh[t[r]];
      if (l && l(s, t)) return;
    }
    return e(s, ...i);
  });
}, jh = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, ca = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), o = t.join(".");
  return n[o] || (n[o] = (s) => {
    if (!("key" in s))
      return;
    const i = xn(s.key);
    if (t.some(
      (r) => r === i || jh[r] === i
    ))
      return e(s);
  });
}, Gh = /* @__PURE__ */ ct({ patchProp: zh }, xh);
let da;
function Yh() {
  return da || (da = Kp(Gh));
}
const es = (...e) => {
  const t = Yh().createApp(...e), { mount: n } = t;
  return t.mount = (o) => {
    const s = Xh(o);
    if (!s) return;
    const i = t._component;
    !Se(i) && !i.render && !i.template && (i.template = s.innerHTML), s.nodeType === 1 && (s.textContent = "");
    const r = n(s, !1, qh(s));
    return s instanceof Element && (s.removeAttribute("v-cloak"), s.setAttribute("data-v-app", "")), r;
  }, t;
};
function qh(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Xh(e) {
  return Ge(e) ? document.querySelector(e) : e;
}
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Kh = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var as = {
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
const Wh = ({ size: e, strokeWidth: t = 2, absoluteStrokeWidth: n, color: o, iconNode: s, name: i, class: r, ...l }, { slots: a }) => Ae(
  "svg",
  {
    ...as,
    width: e || as.width,
    height: e || as.height,
    stroke: o || as.stroke,
    "stroke-width": n ? Number(t) * 24 / Number(e) : t,
    class: ["lucide", `lucide-${Kh(i ?? "icon")}`],
    ...l
  },
  [...s.map((c) => Ae(...c)), ...a.default ? [a.default()] : []]
);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ie = (e, t) => (n, { slots: o }) => Ae(
  Wh,
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
const Zh = Ie("ArchiveIcon", [
  ["rect", { width: "20", height: "5", x: "2", y: "3", rx: "1", key: "1wp1u1" }],
  ["path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8", key: "1s80jp" }],
  ["path", { d: "M10 12h4", key: "a56b0p" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Jh = Ie("BotIcon", [
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
const Qh = Ie("BrainIcon", [
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
const ev = Ie("ChartColumnIcon", [
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
const ao = Ie("CheckIcon", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const tv = Ie("ChevronDownIcon", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const nv = Ie("Clock3Icon", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16.5 12", key: "1aq6pp" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ov = Ie("DatabaseIcon", [
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
const Kn = Ie("DownloadIcon", [
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
const lr = Ie("ExternalLinkIcon", [
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
const fa = Ie("EyeIcon", [
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
const Do = Ie("FolderOpenIcon", [
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
const zc = Ie("GitBranchIcon", [
  ["line", { x1: "6", x2: "6", y1: "3", y2: "15", key: "17qcm7" }],
  ["circle", { cx: "18", cy: "6", r: "3", key: "1h7g24" }],
  ["circle", { cx: "6", cy: "18", r: "3", key: "fqmcym" }],
  ["path", { d: "M18 9a9 9 0 0 1-9 9", key: "n2h4wq" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const sv = Ie("LayersIcon", [
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
const iv = Ie("Maximize2Icon", [
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
const rv = Ie("MicVocalIcon", [
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
const lv = Ie("MinusIcon", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Bc = Ie("PenLineIcon", [
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
const Fc = Ie("PlayIcon", [
  ["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const av = Ie("PlugIcon", [
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
const Pn = Ie("PlusIcon", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const uv = Ie("PuzzleIcon", [
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
const Nt = Ie("RefreshCwIcon", [
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
const Kr = Ie("RotateCcwIcon", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ar = Ie("SaveIcon", [
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
const cv = Ie("ScanFaceIcon", [
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
const dv = Ie("ScanSearchIcon", [
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
const ur = Ie("SearchIcon", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fv = Ie("SendIcon", [
  [
    "path",
    {
      d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      key: "1ffxy3"
    }
  ],
  ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mi = Ie("SettingsIcon", [
  [
    "path",
    {
      d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
      key: "1qme2f"
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
const pv = Ie("ShieldCheckIcon", [
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
const en = Ie("Trash2Icon", [
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
const hv = Ie("Undo2Icon", [
  ["path", { d: "M9 14 4 9l5-5", key: "102s5s" }],
  ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11", key: "f3b9sd" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const cr = Ie("UploadIcon", [
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
const dr = Ie("UserRoundIcon", [
  ["circle", { cx: "12", cy: "8", r: "5", key: "1hypcn" }],
  ["path", { d: "M20 21a8 8 0 0 0-16 0", key: "rfgkzh" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const vv = Ie("WrenchIcon", [
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
const Kt = Ie("XIcon", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]), gv = /* @__PURE__ */ new Set(["converting", "preview_ready", "indexing"]);
function mv(e) {
  let t = 0, n = 0, o = 0;
  for (const s of e) {
    const i = String(s.status || "");
    i === "indexed" ? t += 1 : i.endsWith("_failed") || ["failed", "error"].includes(i) ? o += 1 : gv.has(i) && i !== "preview_ready" && (n += 1);
  }
  return { total: e.length, indexed: t, processing: n, failed: o, attention: n + o };
}
function yv(e) {
  if (Array.isArray(e)) return e;
  if (!e || typeof e != "object") return [];
  const t = e;
  for (const n of ["items", "evaluations", "results"])
    if (Array.isArray(t[n])) return t[n];
  return [e];
}
function bv(e) {
  const t = Number(e);
  return Number.isFinite(t) ? `${Math.round(t <= 1 ? t * 100 : t)}%` : "—";
}
function _v(e) {
  const t = Number(e == null ? void 0 : e.total_documents), n = Number((e == null ? void 0 : e.indexed_count) ?? (e == null ? void 0 : e.indexed_documents)), o = Number((e == null ? void 0 : e.failed_count) ?? (e == null ? void 0 : e.failed_documents)), s = Number((e == null ? void 0 : e.in_progress_count) ?? (e == null ? void 0 : e.processing_documents)), i = String((e == null ? void 0 : e.status) || (e == null ? void 0 : e.state) || "");
  return ["ready", "completed", "complete", "healthy"].includes(i) ? "处理完成" : ["running", "processing", "pending", "indexing"].includes(i) ? "处理中" : ["failed", "error"].includes(i) || Number.isFinite(o) && o > 0 ? "需要处理" : Number.isFinite(s) && s > 0 ? "处理中" : Number.isFinite(t) && t > 0 && Number.isFinite(n) && n >= t ? "处理完成" : Number.isFinite(t) && t === 0 ? "暂无资料" : e ? "已生成" : "暂无报告";
}
function wv(e) {
  return { completed: "已完成", complete: "已完成", running: "进行中", pending: "等待中", failed: "失败", error: "失败" }[e || ""] || e || "已保存";
}
function Je(e) {
  return JSON.parse(JSON.stringify(e));
}
class Wr extends Error {
  constructor(n, o) {
    super(n);
    Ye(this, "status");
    this.name = "ApiError", this.status = o;
  }
}
async function qe(e, t) {
  const n = await fetch(e, t), o = await n.json().catch(() => null);
  if (!n.ok) throw new Wr((o == null ? void 0 : o.detail) || `请求失败 (${n.status})`, n.status);
  return o;
}
async function Uc(e, t) {
  try {
    return await qe(e, t);
  } catch (n) {
    if (n instanceof Wr && n.status === 404) return null;
    throw n;
  }
}
function Oi() {
  return qe("/api/personas", { cache: "no-store" });
}
function Hc(e) {
  return qe(`/api/personas/${encodeURIComponent(e)}/documents`, { cache: "no-store" });
}
async function jc() {
  return (await qe("/api/live2d/models", { cache: "no-store" })).models;
}
async function kv() {
  await qe("/api/live2d/model-directory", {
    method: "POST",
    headers: { "X-YUMENO-Request": "web" }
  });
}
async function pa(e) {
  const [t, n, o, s, i, r] = await Promise.all([
    qe(`/api/personas/${encodeURIComponent(e.id)}/capabilities`, { cache: "no-store" }),
    qe(`/api/personas/${encodeURIComponent(e.id)}/mcp-grants`, { cache: "no-store" }),
    Hc(e.id),
    qe("/api/mcp/servers", { cache: "no-store" }).catch(() => []),
    jc().then((a) => ({ models: a })).catch(() => ({ models: [] })),
    qe("/api/voice-assets", { cache: "no-store" }).catch(() => ({ items: [] }))
  ]), l = new Map(s.map((a) => [a.name, a.status]));
  return {
    persona: Je(e),
    documents: o,
    capabilities: t,
    grants: { servers: n.servers.map((a) => ({ ...a, status: l.get(a.name) || { status: a.enabled ? "unknown" : "disabled" } })) },
    resources: { live2dModels: i.models, voiceAssets: r.items.filter((a) => a.status === "ready" && (!a.engine || a.engine === "gpt_sovits")) }
  };
}
async function Ev(e) {
  await qe(`/api/personas/${encodeURIComponent(e.id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: e.name, profile: e.profile || {} })
  });
}
async function xv(e, t) {
  await qe(`/api/personas/${encodeURIComponent(e)}/capabilities`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ overrides: t })
  });
}
async function Sv(e, t) {
  const n = t.filter((o) => o.authorized && !o.global).map((o) => o.name);
  await qe(`/api/personas/${encodeURIComponent(e)}/mcp-grants`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ server_names: n })
  });
}
async function Cv(e) {
  await qe(`/api/personas/${encodeURIComponent(e)}`, { method: "DELETE" });
}
async function $v(e, t, n) {
  if (!e.knowledge_space_id) throw new Error("角色知识空间不可用");
  const o = new FormData();
  t.forEach((i) => o.append("files", i)), n.trim() && o.append("files", new File([n.trim()], `text-${Date.now()}.txt`, { type: "text/plain;charset=utf-8" }));
  const s = await qe(`/api/knowledge-spaces/${encodeURIComponent(e.knowledge_space_id)}/documents/upload`, { method: "POST", body: o });
  await Promise.all(s.map((i) => qe(`/api/documents/${encodeURIComponent(i.id)}/confirm`, { method: "POST" })));
}
async function Nv(e) {
  var n;
  const t = await fetch(`/api/documents/${encodeURIComponent(e)}`, { method: "DELETE" });
  if (!t.ok) throw new Error(((n = await t.json().catch(() => null)) == null ? void 0 : n.detail) || `删除失败 (${t.status})`);
}
async function Iv(e) {
  await qe(`/api/documents/${encodeURIComponent(e)}/retry-index`, { method: "POST" });
}
async function Mv(e, t) {
  var s;
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
  if (!o.ok) throw new Error(((s = await o.json().catch(() => null)) == null ? void 0 : s.detail) || "试听失败");
  return o.blob();
}
function Ov(e) {
  return qe(`/api/personas/${encodeURIComponent(e)}/versions`, { cache: "no-store" });
}
function Tv(e, t) {
  return qe(`/api/personas/${encodeURIComponent(e)}/versions/${encodeURIComponent(t)}`, { cache: "no-store" });
}
function Pv(e, t = {}) {
  return qe(`/api/personas/${encodeURIComponent(e)}/versions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label: t.label || "", note: t.note || "" })
  });
}
async function Dv(e, t) {
  return (await qe(
    `/api/personas/${encodeURIComponent(e)}/versions/${encodeURIComponent(t)}/publish`,
    { method: "POST" }
  )).version;
}
async function Rv(e, t) {
  return (await qe(
    `/api/personas/${encodeURIComponent(e)}/versions/${encodeURIComponent(t)}/rollback`,
    { method: "POST" }
  )).version;
}
async function Av(e) {
  return Uc(
    `/api/knowledge-spaces/${encodeURIComponent(e)}/documents/report`,
    { cache: "no-store" }
  );
}
async function Lv(e, t = 1) {
  const n = await Uc(
    `/api/eval/history?persona_id=${encodeURIComponent(e)}&limit=${encodeURIComponent(String(t))}`,
    { cache: "no-store" }
  );
  return yv(n);
}
const Vv = [
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
function zv(e) {
  return ["available", "partial", "unassigned", "blocked", "pending", "error"].includes(e) ? e : "blocked";
}
function wo(e, t, n) {
  return { id: e, type: t, position: { x: 0, y: 0 }, data: n };
}
function Bv(e) {
  var i, r;
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = `persona:${e.persona.id}`, s = "module:extensions";
  t.set(o, wo(o, "persona", { kind: "persona", label: e.persona.name, summary: String(((i = e.persona.profile) == null ? void 0 : i.description) || "尚未填写人设"), status: "available", level: 0 }));
  for (const l of Vv) {
    const a = `module:${l.id}`;
    t.set(a, wo(a, "module", { kind: l.id, label: l.label, summary: l.summary(e), status: "available", level: 0 }));
    const c = l.id === "extensions";
    n.set(`${o}->${a}`, { id: `${o}->${a}`, source: o, target: a, sourceHandle: c ? "right-source" : "left-source", targetHandle: c ? "left-target" : "right-target" });
  }
  for (const l of e.capabilities.packages) {
    const a = l.kind === "skill" ? "skill" : "tool", c = e.capabilities.overrides[l.id], d = c === void 0 ? l.assigned : c, p = c === !1 ? "blocked" : c === !0 && l.status === "unassigned" ? "available" : l.status;
    t.set(l.id, wo(l.id, "capability", {
      kind: a,
      label: l.name,
      summary: l.description || l.reason || "能力包",
      status: zv(p),
      level: l.level,
      assigned: d,
      configurable: !0,
      sourceId: l.id
    })), n.set(`${s}->${l.id}`, { id: `${s}->${l.id}`, source: s, target: l.id, sourceHandle: "right-source", targetHandle: "left-target" });
    for (const v of l.dependencies || []) {
      if (!v.id) continue;
      const g = e.capabilities.overrides[v.id], k = g === void 0 ? v.effective : g;
      if (t.set(v.id, wo(v.id, "capability", {
        kind: "tool",
        label: v.name,
        summary: v.server ? `MCP · ${v.server}` : v.source,
        status: k ? "available" : "blocked",
        level: v.level,
        assigned: k,
        configurable: !1,
        sourceId: v.id
      })), n.set(`${l.id}->${v.id}`, { id: `${l.id}->${v.id}`, source: l.id, target: v.id, sourceHandle: "right-source", targetHandle: "left-target" }), v.server) {
        const $ = `mcp:${v.server}`, S = e.grants.servers.find((D) => D.name === v.server), T = ((r = S == null ? void 0 : S.status) == null ? void 0 : r.status) === "connected";
        t.set($, wo($, "capability", {
          kind: "mcp",
          label: v.server,
          summary: (S == null ? void 0 : S.description) || "MCP 服务",
          status: S != null && S.authorized && T ? "available" : "blocked",
          level: v.level,
          assigned: !!(S != null && S.authorized),
          configurable: !!(S && !S.global),
          sourceId: v.server
        })), n.set(`${v.id}->${$}`, { id: `${v.id}->${$}`, source: v.id, target: $, sourceHandle: "right-source", targetHandle: "left-target" });
      }
    }
  }
  return { nodes: [...t.values()], edges: [...n.values()] };
}
function Fv(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Uv = "\0", In = "\0", ha = "";
let Hv = class {
  constructor(t) {
    Ye(this, "_isDirected", !0);
    Ye(this, "_isMultigraph", !1);
    Ye(this, "_isCompound", !1);
    // Label for the graph itself
    Ye(this, "_label");
    // Defaults to be set when creating a new node
    Ye(this, "_defaultNodeLabelFn", () => {
    });
    // Defaults to be set when creating a new edge
    Ye(this, "_defaultEdgeLabelFn", () => {
    });
    // v -> label
    Ye(this, "_nodes", {});
    // v -> edgeObj
    Ye(this, "_in", {});
    // u -> v -> Number
    Ye(this, "_preds", {});
    // v -> edgeObj
    Ye(this, "_out", {});
    // v -> w -> Number
    Ye(this, "_sucs", {});
    // e -> edgeObj
    Ye(this, "_edgeObjs", {});
    // e -> label
    Ye(this, "_edgeLabels", {});
    /* Number of nodes in the graph. Should only be changed by the implementation. */
    Ye(this, "_nodeCount", 0);
    /* Number of edges in the graph. Should only be changed by the implementation. */
    Ye(this, "_edgeCount", 0);
    Ye(this, "_parent");
    Ye(this, "_children");
    t && (this._isDirected = Object.hasOwn(t, "directed") ? t.directed : !0, this._isMultigraph = Object.hasOwn(t, "multigraph") ? t.multigraph : !1, this._isCompound = Object.hasOwn(t, "compound") ? t.compound : !1), this._isCompound && (this._parent = {}, this._children = {}, this._children[In] = {});
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
    var o = arguments, s = this;
    return t.forEach(function(i) {
      o.length > 1 ? s.setNode(i, n) : s.setNode(i);
    }), this;
  }
  /**
   * Creates or updates the value for the node v in the graph. If label is supplied
   * it is set as the value for the node. If label is not supplied and the node was
   * created by this call then the default node label will be assigned.
   * Complexity: O(1).
   */
  setNode(t, n) {
    return Object.hasOwn(this._nodes, t) ? (arguments.length > 1 && (this._nodes[t] = n), this) : (this._nodes[t] = arguments.length > 1 ? n : this._defaultNodeLabelFn(t), this._isCompound && (this._parent[t] = In, this._children[t] = {}, this._children[In][t] = !0), this._in[t] = {}, this._preds[t] = {}, this._out[t] = {}, this._sucs[t] = {}, ++this._nodeCount, this);
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
      var o = (s) => n.removeEdge(n._edgeObjs[s]);
      delete this._nodes[t], this._isCompound && (this._removeFromParentsChildList(t), delete this._parent[t], this.children(t).forEach(function(s) {
        n.setParent(s);
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
      n = In;
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
      if (n !== In)
        return n;
    }
  }
  /**
   * Gets list of direct children of node v.
   * Complexity: O(1).
   */
  children(t = In) {
    if (this._isCompound) {
      var n = this._children[t];
      if (n)
        return Object.keys(n);
    } else {
      if (t === In)
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
      const s = new Set(n);
      for (var o of this.successors(t))
        s.add(o);
      return Array.from(s.values());
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
    Object.entries(this._nodes).forEach(function([r, l]) {
      t(r) && n.setNode(r, l);
    }), Object.values(this._edgeObjs).forEach(function(r) {
      n.hasNode(r.v) && n.hasNode(r.w) && n.setEdge(r, o.edge(r));
    });
    var s = {};
    function i(r) {
      var l = o.parent(r);
      return l === void 0 || n.hasNode(l) ? (s[r] = l, l) : l in s ? s[l] : i(l);
    }
    return this._isCompound && n.nodes().forEach((r) => n.setParent(r, i(r))), n;
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
    var o = this, s = arguments;
    return t.reduce(function(i, r) {
      return s.length > 1 ? o.setEdge(i, r, n) : o.setEdge(i, r), r;
    }), this;
  }
  /**
   * Creates or updates the label for the edge (v, w) with the optionally supplied
   * name. If label is supplied it is set as the value for the edge. If label is not
   * supplied and the edge was created by this call then the default edge label will
   * be assigned. The name parameter is only useful with multigraphs.
   */
  setEdge() {
    var t, n, o, s, i = !1, r = arguments[0];
    typeof r == "object" && r !== null && "v" in r ? (t = r.v, n = r.w, o = r.name, arguments.length === 2 && (s = arguments[1], i = !0)) : (t = r, n = arguments[1], o = arguments[3], arguments.length > 2 && (s = arguments[2], i = !0)), t = "" + t, n = "" + n, o !== void 0 && (o = "" + o);
    var l = So(this._isDirected, t, n, o);
    if (Object.hasOwn(this._edgeLabels, l))
      return i && (this._edgeLabels[l] = s), this;
    if (o !== void 0 && !this._isMultigraph)
      throw new Error("Cannot set a named edge when isMultigraph = false");
    this.setNode(t), this.setNode(n), this._edgeLabels[l] = i ? s : this._defaultEdgeLabelFn(t, n, o);
    var a = jv(this._isDirected, t, n, o);
    return t = a.v, n = a.w, Object.freeze(a), this._edgeObjs[l] = a, va(this._preds[n], t), va(this._sucs[t], n), this._in[n][l] = a, this._out[t][l] = a, this._edgeCount++, this;
  }
  /**
   * Gets the label for the specified edge.
   * Complexity: O(1).
   */
  edge(t, n, o) {
    var s = arguments.length === 1 ? Ti(this._isDirected, arguments[0]) : So(this._isDirected, t, n, o);
    return this._edgeLabels[s];
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
    var s = arguments.length === 1 ? Ti(this._isDirected, arguments[0]) : So(this._isDirected, t, n, o);
    return Object.hasOwn(this._edgeLabels, s);
  }
  /**
   * Removes the specified edge from the graph. No subgraphs are considered.
   * Complexity: O(1).
   */
  removeEdge(t, n, o) {
    var s = arguments.length === 1 ? Ti(this._isDirected, arguments[0]) : So(this._isDirected, t, n, o), i = this._edgeObjs[s];
    return i && (t = i.v, n = i.w, delete this._edgeLabels[s], delete this._edgeObjs[s], ga(this._preds[n], t), ga(this._sucs[t], n), delete this._in[n][s], delete this._out[t][s], this._edgeCount--), this;
  }
  /**
   * Return all edges that point to the node v. Optionally filters those edges down to just those
   * coming from node u. Behavior is undefined for undirected graphs - use nodeEdges instead.
   * Complexity: O(|E|).
   */
  inEdges(t, n) {
    var o = this._in[t];
    if (o) {
      var s = Object.values(o);
      return n ? s.filter((i) => i.v === n) : s;
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
      var s = Object.values(o);
      return n ? s.filter((i) => i.w === n) : s;
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
function va(e, t) {
  e[t] ? e[t]++ : e[t] = 1;
}
function ga(e, t) {
  --e[t] || delete e[t];
}
function So(e, t, n, o) {
  var s = "" + t, i = "" + n;
  if (!e && s > i) {
    var r = s;
    s = i, i = r;
  }
  return s + ha + i + ha + (o === void 0 ? Uv : o);
}
function jv(e, t, n, o) {
  var s = "" + t, i = "" + n;
  if (!e && s > i) {
    var r = s;
    s = i, i = r;
  }
  var l = { v: s, w: i };
  return o && (l.name = o), l;
}
function Ti(e, t) {
  return So(e, t.v, t.w, t.name);
}
var Zr = Hv, Gv = "2.2.4", Yv = {
  Graph: Zr,
  version: Gv
}, qv = Zr, Xv = {
  write: Kv,
  read: Jv
};
function Kv(e) {
  var t = {
    options: {
      directed: e.isDirected(),
      multigraph: e.isMultigraph(),
      compound: e.isCompound()
    },
    nodes: Wv(e),
    edges: Zv(e)
  };
  return e.graph() !== void 0 && (t.value = structuredClone(e.graph())), t;
}
function Wv(e) {
  return e.nodes().map(function(t) {
    var n = e.node(t), o = e.parent(t), s = { v: t };
    return n !== void 0 && (s.value = n), o !== void 0 && (s.parent = o), s;
  });
}
function Zv(e) {
  return e.edges().map(function(t) {
    var n = e.edge(t), o = { v: t.v, w: t.w };
    return t.name !== void 0 && (o.name = t.name), n !== void 0 && (o.value = n), o;
  });
}
function Jv(e) {
  var t = new qv(e.options).setGraph(e.value);
  return e.nodes.forEach(function(n) {
    t.setNode(n.v, n.value), n.parent && t.setParent(n.v, n.parent);
  }), e.edges.forEach(function(n) {
    t.setEdge({ v: n.v, w: n.w, name: n.name }, n.value);
  }), t;
}
var Qv = eg;
function eg(e) {
  var t = {}, n = [], o;
  function s(i) {
    Object.hasOwn(t, i) || (t[i] = !0, o.push(i), e.successors(i).forEach(s), e.predecessors(i).forEach(s));
  }
  return e.nodes().forEach(function(i) {
    o = [], s(i), o.length && n.push(o);
  }), n;
}
let tg = class {
  constructor() {
    Ye(this, "_arr", []);
    Ye(this, "_keyIndices", {});
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
      var s = this._arr, i = s.length;
      return o[t] = i, s.push({ key: t, priority: n }), this._decrease(i), !0;
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
    var n = this._arr, o = 2 * t, s = o + 1, i = t;
    o < n.length && (i = n[o].priority < n[i].priority ? o : i, s < n.length && (i = n[s].priority < n[i].priority ? s : i), i !== t && (this._swap(t, i), this._heapify(i)));
  }
  _decrease(t) {
    for (var n = this._arr, o = n[t].priority, s; t !== 0 && (s = t >> 1, !(n[s].priority < o)); )
      this._swap(t, s), t = s;
  }
  _swap(t, n) {
    var o = this._arr, s = this._keyIndices, i = o[t], r = o[n];
    o[t] = r, o[n] = i, s[r.key] = t, s[i.key] = n;
  }
};
var Gc = tg, ng = Gc, Yc = sg, og = () => 1;
function sg(e, t, n, o) {
  return ig(
    e,
    String(t),
    n || og,
    o || function(s) {
      return e.outEdges(s);
    }
  );
}
function ig(e, t, n, o) {
  var s = {}, i = new ng(), r, l, a = function(c) {
    var d = c.v !== r ? c.v : c.w, p = s[d], v = n(c), g = l.distance + v;
    if (v < 0)
      throw new Error("dijkstra does not allow negative edge weights. Bad edge: " + c + " Weight: " + v);
    g < p.distance && (p.distance = g, p.predecessor = r, i.decrease(d, g));
  };
  for (e.nodes().forEach(function(c) {
    var d = c === t ? 0 : Number.POSITIVE_INFINITY;
    s[c] = { distance: d }, i.add(c, d);
  }); i.size() > 0 && (r = i.removeMin(), l = s[r], l.distance !== Number.POSITIVE_INFINITY); )
    o(r).forEach(a);
  return s;
}
var rg = Yc, lg = ag;
function ag(e, t, n) {
  return e.nodes().reduce(function(o, s) {
    return o[s] = rg(e, s, t, n), o;
  }, {});
}
var qc = ug;
function ug(e) {
  var t = 0, n = [], o = {}, s = [];
  function i(r) {
    var l = o[r] = {
      onStack: !0,
      lowlink: t,
      index: t++
    };
    if (n.push(r), e.successors(r).forEach(function(d) {
      Object.hasOwn(o, d) ? o[d].onStack && (l.lowlink = Math.min(l.lowlink, o[d].index)) : (i(d), l.lowlink = Math.min(l.lowlink, o[d].lowlink));
    }), l.lowlink === l.index) {
      var a = [], c;
      do
        c = n.pop(), o[c].onStack = !1, a.push(c);
      while (r !== c);
      s.push(a);
    }
  }
  return e.nodes().forEach(function(r) {
    Object.hasOwn(o, r) || i(r);
  }), s;
}
var cg = qc, dg = fg;
function fg(e) {
  return cg(e).filter(function(t) {
    return t.length > 1 || t.length === 1 && e.hasEdge(t[0], t[0]);
  });
}
var pg = vg, hg = () => 1;
function vg(e, t, n) {
  return gg(
    e,
    t || hg,
    n || function(o) {
      return e.outEdges(o);
    }
  );
}
function gg(e, t, n) {
  var o = {}, s = e.nodes();
  return s.forEach(function(i) {
    o[i] = {}, o[i][i] = { distance: 0 }, s.forEach(function(r) {
      i !== r && (o[i][r] = { distance: Number.POSITIVE_INFINITY });
    }), n(i).forEach(function(r) {
      var l = r.v === i ? r.w : r.v, a = t(r);
      o[i][l] = { distance: a, predecessor: i };
    });
  }), s.forEach(function(i) {
    var r = o[i];
    s.forEach(function(l) {
      var a = o[l];
      s.forEach(function(c) {
        var d = a[i], p = r[c], v = a[c], g = d.distance + p.distance;
        g < v.distance && (v.distance = g, v.predecessor = p.predecessor);
      });
    });
  }), o;
}
function Xc(e) {
  var t = {}, n = {}, o = [];
  function s(i) {
    if (Object.hasOwn(n, i))
      throw new fr();
    Object.hasOwn(t, i) || (n[i] = !0, t[i] = !0, e.predecessors(i).forEach(s), delete n[i], o.push(i));
  }
  if (e.sinks().forEach(s), Object.keys(t).length !== e.nodeCount())
    throw new fr();
  return o;
}
class fr extends Error {
  constructor() {
    super(...arguments);
  }
}
var Kc = Xc;
Xc.CycleException = fr;
var ma = Kc, mg = yg;
function yg(e) {
  try {
    ma(e);
  } catch (t) {
    if (t instanceof ma.CycleException)
      return !1;
    throw t;
  }
  return !0;
}
var Wc = bg;
function bg(e, t, n) {
  Array.isArray(t) || (t = [t]);
  var o = e.isDirected() ? (l) => e.successors(l) : (l) => e.neighbors(l), s = n === "post" ? _g : wg, i = [], r = {};
  return t.forEach((l) => {
    if (!e.hasNode(l))
      throw new Error("Graph does not have node: " + l);
    s(l, o, r, i);
  }), i;
}
function _g(e, t, n, o) {
  for (var s = [[e, !1]]; s.length > 0; ) {
    var i = s.pop();
    i[1] ? o.push(i[0]) : Object.hasOwn(n, i[0]) || (n[i[0]] = !0, s.push([i[0], !0]), Zc(t(i[0]), (r) => s.push([r, !1])));
  }
}
function wg(e, t, n, o) {
  for (var s = [e]; s.length > 0; ) {
    var i = s.pop();
    Object.hasOwn(n, i) || (n[i] = !0, o.push(i), Zc(t(i), (r) => s.push(r)));
  }
}
function Zc(e, t) {
  for (var n = e.length; n--; )
    t(e[n], n, e);
  return e;
}
var kg = Wc, Eg = xg;
function xg(e, t) {
  return kg(e, t, "post");
}
var Sg = Wc, Cg = $g;
function $g(e, t) {
  return Sg(e, t, "pre");
}
var Ng = Zr, Ig = Gc, Mg = Og;
function Og(e, t) {
  var n = new Ng(), o = {}, s = new Ig(), i;
  function r(a) {
    var c = a.v === i ? a.w : a.v, d = s.priority(c);
    if (d !== void 0) {
      var p = t(a);
      p < d && (o[c] = i, s.decrease(c, p));
    }
  }
  if (e.nodeCount() === 0)
    return n;
  e.nodes().forEach(function(a) {
    s.add(a, Number.POSITIVE_INFINITY), n.setNode(a);
  }), s.decrease(e.nodes()[0], 0);
  for (var l = !1; s.size() > 0; ) {
    if (i = s.removeMin(), Object.hasOwn(o, i))
      n.setEdge(i, o[i]);
    else {
      if (l)
        throw new Error("Input graph is not connected: " + e);
      l = !0;
    }
    e.nodeEdges(i).forEach(r);
  }
  return n;
}
var Tg = {
  components: Qv,
  dijkstra: Yc,
  dijkstraAll: lg,
  findCycles: dg,
  floydWarshall: pg,
  isAcyclic: mg,
  postorder: Eg,
  preorder: Cg,
  prim: Mg,
  tarjan: qc,
  topsort: Kc
}, ya = Yv, Ot = {
  Graph: ya.Graph,
  json: Xv,
  alg: Tg,
  version: ya.version
};
let Pg = class {
  constructor() {
    let t = {};
    t._next = t._prev = t, this._sentinel = t;
  }
  dequeue() {
    let t = this._sentinel, n = t._prev;
    if (n !== t)
      return ba(n), n;
  }
  enqueue(t) {
    let n = this._sentinel;
    t._prev && t._next && ba(t), t._next = n._next, n._next._prev = t, n._next = t, t._prev = n;
  }
  toString() {
    let t = [], n = this._sentinel, o = n._prev;
    for (; o !== n; )
      t.push(JSON.stringify(o, Dg)), o = o._prev;
    return "[" + t.join(", ") + "]";
  }
};
function ba(e) {
  e._prev._next = e._next, e._next._prev = e._prev, delete e._next, delete e._prev;
}
function Dg(e, t) {
  if (e !== "_next" && e !== "_prev")
    return t;
}
var Rg = Pg;
let Ag = Ot.Graph, Lg = Rg;
var Vg = Bg;
let zg = () => 1;
function Bg(e, t) {
  if (e.nodeCount() <= 1)
    return [];
  let n = Ug(e, t || zg);
  return Fg(n.graph, n.buckets, n.zeroIdx).flatMap((s) => e.outEdges(s.v, s.w));
}
function Fg(e, t, n) {
  let o = [], s = t[t.length - 1], i = t[0], r;
  for (; e.nodeCount(); ) {
    for (; r = i.dequeue(); )
      Pi(e, t, n, r);
    for (; r = s.dequeue(); )
      Pi(e, t, n, r);
    if (e.nodeCount()) {
      for (let l = t.length - 2; l > 0; --l)
        if (r = t[l].dequeue(), r) {
          o = o.concat(Pi(e, t, n, r, !0));
          break;
        }
    }
  }
  return o;
}
function Pi(e, t, n, o, s) {
  let i = s ? [] : void 0;
  return e.inEdges(o.v).forEach((r) => {
    let l = e.edge(r), a = e.node(r.v);
    s && i.push({ v: r.v, w: r.w }), a.out -= l, pr(t, n, a);
  }), e.outEdges(o.v).forEach((r) => {
    let l = e.edge(r), a = r.w, c = e.node(a);
    c.in -= l, pr(t, n, c);
  }), e.removeNode(o.v), i;
}
function Ug(e, t) {
  let n = new Ag(), o = 0, s = 0;
  e.nodes().forEach((l) => {
    n.setNode(l, { v: l, in: 0, out: 0 });
  }), e.edges().forEach((l) => {
    let a = n.edge(l.v, l.w) || 0, c = t(l), d = a + c;
    n.setEdge(l.v, l.w, d), s = Math.max(s, n.node(l.v).out += c), o = Math.max(o, n.node(l.w).in += c);
  });
  let i = Hg(s + o + 3).map(() => new Lg()), r = o + 1;
  return n.nodes().forEach((l) => {
    pr(i, r, n.node(l));
  }), { graph: n, buckets: i, zeroIdx: r };
}
function pr(e, t, n) {
  n.out ? n.in ? e[n.out - n.in + t].enqueue(n) : e[e.length - 1].enqueue(n) : e[0].enqueue(n);
}
function Hg(e) {
  const t = [];
  for (let n = 0; n < e; n++)
    t.push(n);
  return t;
}
let Jc = Ot.Graph;
var Ze = {
  addBorderNode: Jg,
  addDummyNode: Qc,
  applyWithChunking: ri,
  asNonCompoundGraph: Gg,
  buildLayerMatrix: Kg,
  intersectRect: Xg,
  mapValues: im,
  maxRank: td,
  normalizeRanks: Wg,
  notime: nm,
  partition: em,
  pick: sm,
  predecessorWeights: qg,
  range: od,
  removeEmptyRanks: Zg,
  simplify: jg,
  successorWeights: Yg,
  time: tm,
  uniqueId: nd,
  zipObject: Jr
};
function Qc(e, t, n, o) {
  for (var s = o; e.hasNode(s); )
    s = nd(o);
  return n.dummy = t, e.setNode(s, n), s;
}
function jg(e) {
  let t = new Jc().setGraph(e.graph());
  return e.nodes().forEach((n) => t.setNode(n, e.node(n))), e.edges().forEach((n) => {
    let o = t.edge(n.v, n.w) || { weight: 0, minlen: 1 }, s = e.edge(n);
    t.setEdge(n.v, n.w, {
      weight: o.weight + s.weight,
      minlen: Math.max(o.minlen, s.minlen)
    });
  }), t;
}
function Gg(e) {
  let t = new Jc({ multigraph: e.isMultigraph() }).setGraph(e.graph());
  return e.nodes().forEach((n) => {
    e.children(n).length || t.setNode(n, e.node(n));
  }), e.edges().forEach((n) => {
    t.setEdge(n, e.edge(n));
  }), t;
}
function Yg(e) {
  let t = e.nodes().map((n) => {
    let o = {};
    return e.outEdges(n).forEach((s) => {
      o[s.w] = (o[s.w] || 0) + e.edge(s).weight;
    }), o;
  });
  return Jr(e.nodes(), t);
}
function qg(e) {
  let t = e.nodes().map((n) => {
    let o = {};
    return e.inEdges(n).forEach((s) => {
      o[s.v] = (o[s.v] || 0) + e.edge(s).weight;
    }), o;
  });
  return Jr(e.nodes(), t);
}
function Xg(e, t) {
  let n = e.x, o = e.y, s = t.x - n, i = t.y - o, r = e.width / 2, l = e.height / 2;
  if (!s && !i)
    throw new Error("Not possible to find intersection inside of the rectangle");
  let a, c;
  return Math.abs(i) * r > Math.abs(s) * l ? (i < 0 && (l = -l), a = l * s / i, c = l) : (s < 0 && (r = -r), a = r, c = r * i / s), { x: n + a, y: o + c };
}
function Kg(e) {
  let t = od(td(e) + 1).map(() => []);
  return e.nodes().forEach((n) => {
    let o = e.node(n), s = o.rank;
    s !== void 0 && (t[s][o.order] = n);
  }), t;
}
function Wg(e) {
  let t = e.nodes().map((o) => {
    let s = e.node(o).rank;
    return s === void 0 ? Number.MAX_VALUE : s;
  }), n = ri(Math.min, t);
  e.nodes().forEach((o) => {
    let s = e.node(o);
    Object.hasOwn(s, "rank") && (s.rank -= n);
  });
}
function Zg(e) {
  let t = e.nodes().map((r) => e.node(r).rank), n = ri(Math.min, t), o = [];
  e.nodes().forEach((r) => {
    let l = e.node(r).rank - n;
    o[l] || (o[l] = []), o[l].push(r);
  });
  let s = 0, i = e.graph().nodeRankFactor;
  Array.from(o).forEach((r, l) => {
    r === void 0 && l % i !== 0 ? --s : r !== void 0 && s && r.forEach((a) => e.node(a).rank += s);
  });
}
function Jg(e, t, n, o) {
  let s = {
    width: 0,
    height: 0
  };
  return arguments.length >= 4 && (s.rank = n, s.order = o), Qc(e, "border", s, t);
}
function Qg(e, t = ed) {
  const n = [];
  for (let o = 0; o < e.length; o += t) {
    const s = e.slice(o, o + t);
    n.push(s);
  }
  return n;
}
const ed = 65535;
function ri(e, t) {
  if (t.length > ed) {
    const n = Qg(t);
    return e.apply(null, n.map((o) => e.apply(null, o)));
  } else
    return e.apply(null, t);
}
function td(e) {
  const n = e.nodes().map((o) => {
    let s = e.node(o).rank;
    return s === void 0 ? Number.MIN_VALUE : s;
  });
  return ri(Math.max, n);
}
function em(e, t) {
  let n = { lhs: [], rhs: [] };
  return e.forEach((o) => {
    t(o) ? n.lhs.push(o) : n.rhs.push(o);
  }), n;
}
function tm(e, t) {
  let n = Date.now();
  try {
    return t();
  } finally {
    console.log(e + " time: " + (Date.now() - n) + "ms");
  }
}
function nm(e, t) {
  return t();
}
let om = 0;
function nd(e) {
  var t = ++om;
  return e + ("" + t);
}
function od(e, t, n = 1) {
  t == null && (t = e, e = 0);
  let o = (i) => i < t;
  n < 0 && (o = (i) => t < i);
  const s = [];
  for (let i = e; o(i); i += n)
    s.push(i);
  return s;
}
function sm(e, t) {
  const n = {};
  for (const o of t)
    e[o] !== void 0 && (n[o] = e[o]);
  return n;
}
function im(e, t) {
  let n = t;
  return typeof t == "string" && (n = (o) => o[t]), Object.entries(e).reduce((o, [s, i]) => (o[s] = n(i, s), o), {});
}
function Jr(e, t) {
  return e.reduce((n, o, s) => (n[o] = t[s], n), {});
}
let rm = Vg, lm = Ze.uniqueId;
var am = {
  run: um,
  undo: dm
};
function um(e) {
  (e.graph().acyclicer === "greedy" ? rm(e, n(e)) : cm(e)).forEach((o) => {
    let s = e.edge(o);
    e.removeEdge(o), s.forwardName = o.name, s.reversed = !0, e.setEdge(o.w, o.v, s, lm("rev"));
  });
  function n(o) {
    return (s) => o.edge(s).weight;
  }
}
function cm(e) {
  let t = [], n = {}, o = {};
  function s(i) {
    Object.hasOwn(o, i) || (o[i] = !0, n[i] = !0, e.outEdges(i).forEach((r) => {
      Object.hasOwn(n, r.w) ? t.push(r) : s(r.w);
    }), delete n[i]);
  }
  return e.nodes().forEach(s), t;
}
function dm(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t);
    if (n.reversed) {
      e.removeEdge(t);
      let o = n.forwardName;
      delete n.reversed, delete n.forwardName, e.setEdge(t.w, t.v, n, o);
    }
  });
}
let fm = Ze;
var pm = {
  run: hm,
  undo: gm
};
function hm(e) {
  e.graph().dummyChains = [], e.edges().forEach((t) => vm(e, t));
}
function vm(e, t) {
  let n = t.v, o = e.node(n).rank, s = t.w, i = e.node(s).rank, r = t.name, l = e.edge(t), a = l.labelRank;
  if (i === o + 1) return;
  e.removeEdge(t);
  let c, d, p;
  for (p = 0, ++o; o < i; ++p, ++o)
    l.points = [], d = {
      width: 0,
      height: 0,
      edgeLabel: l,
      edgeObj: t,
      rank: o
    }, c = fm.addDummyNode(e, "edge", d, "_d"), o === a && (d.width = l.width, d.height = l.height, d.dummy = "edge-label", d.labelpos = l.labelpos), e.setEdge(n, c, { weight: l.weight }, r), p === 0 && e.graph().dummyChains.push(c), n = c;
  e.setEdge(n, s, { weight: l.weight }, r);
}
function gm(e) {
  e.graph().dummyChains.forEach((t) => {
    let n = e.node(t), o = n.edgeLabel, s;
    for (e.setEdge(n.edgeObj, o); n.dummy; )
      s = e.successors(t)[0], e.removeNode(t), o.points.push({ x: n.x, y: n.y }), n.dummy === "edge-label" && (o.x = n.x, o.y = n.y, o.width = n.width, o.height = n.height), t = s, n = e.node(t);
  });
}
const { applyWithChunking: mm } = Ze;
var li = {
  longestPath: ym,
  slack: bm
};
function ym(e) {
  var t = {};
  function n(o) {
    var s = e.node(o);
    if (Object.hasOwn(t, o))
      return s.rank;
    t[o] = !0;
    let i = e.outEdges(o).map((l) => l == null ? Number.POSITIVE_INFINITY : n(l.w) - e.edge(l).minlen);
    var r = mm(Math.min, i);
    return r === Number.POSITIVE_INFINITY && (r = 0), s.rank = r;
  }
  e.sources().forEach(n);
}
function bm(e, t) {
  return e.node(t.w).rank - e.node(t.v).rank - e.edge(t).minlen;
}
var _m = Ot.Graph, Ls = li.slack, sd = wm;
function wm(e) {
  var t = new _m({ directed: !1 }), n = e.nodes()[0], o = e.nodeCount();
  t.setNode(n, {});
  for (var s, i; km(t, e) < o; )
    s = Em(t, e), i = t.hasNode(s.v) ? Ls(e, s) : -Ls(e, s), xm(t, e, i);
  return t;
}
function km(e, t) {
  function n(o) {
    t.nodeEdges(o).forEach((s) => {
      var i = s.v, r = o === i ? s.w : i;
      !e.hasNode(r) && !Ls(t, s) && (e.setNode(r, {}), e.setEdge(o, r, {}), n(r));
    });
  }
  return e.nodes().forEach(n), e.nodeCount();
}
function Em(e, t) {
  return t.edges().reduce((o, s) => {
    let i = Number.POSITIVE_INFINITY;
    return e.hasNode(s.v) !== e.hasNode(s.w) && (i = Ls(t, s)), i < o[0] ? [i, s] : o;
  }, [Number.POSITIVE_INFINITY, null])[1];
}
function xm(e, t, n) {
  e.nodes().forEach((o) => t.node(o).rank += n);
}
var Sm = sd, _a = li.slack, Cm = li.longestPath, $m = Ot.alg.preorder, Nm = Ot.alg.postorder, Im = Ze.simplify, Mm = Gn;
Gn.initLowLimValues = el;
Gn.initCutValues = Qr;
Gn.calcCutValue = id;
Gn.leaveEdge = ld;
Gn.enterEdge = ad;
Gn.exchangeEdges = ud;
function Gn(e) {
  e = Im(e), Cm(e);
  var t = Sm(e);
  el(t), Qr(t, e);
  for (var n, o; n = ld(t); )
    o = ad(t, e, n), ud(t, e, n, o);
}
function Qr(e, t) {
  var n = Nm(e, e.nodes());
  n = n.slice(0, n.length - 1), n.forEach((o) => Om(e, t, o));
}
function Om(e, t, n) {
  var o = e.node(n), s = o.parent;
  e.edge(n, s).cutvalue = id(e, t, n);
}
function id(e, t, n) {
  var o = e.node(n), s = o.parent, i = !0, r = t.edge(n, s), l = 0;
  return r || (i = !1, r = t.edge(s, n)), l = r.weight, t.nodeEdges(n).forEach((a) => {
    var c = a.v === n, d = c ? a.w : a.v;
    if (d !== s) {
      var p = c === i, v = t.edge(a).weight;
      if (l += p ? v : -v, Pm(e, n, d)) {
        var g = e.edge(n, d).cutvalue;
        l += p ? -g : g;
      }
    }
  }), l;
}
function el(e, t) {
  arguments.length < 2 && (t = e.nodes()[0]), rd(e, {}, 1, t);
}
function rd(e, t, n, o, s) {
  var i = n, r = e.node(o);
  return t[o] = !0, e.neighbors(o).forEach((l) => {
    Object.hasOwn(t, l) || (n = rd(e, t, n, l, o));
  }), r.low = i, r.lim = n++, s ? r.parent = s : delete r.parent, n;
}
function ld(e) {
  return e.edges().find((t) => e.edge(t).cutvalue < 0);
}
function ad(e, t, n) {
  var o = n.v, s = n.w;
  t.hasEdge(o, s) || (o = n.w, s = n.v);
  var i = e.node(o), r = e.node(s), l = i, a = !1;
  i.lim > r.lim && (l = r, a = !0);
  var c = t.edges().filter((d) => a === wa(e, e.node(d.v), l) && a !== wa(e, e.node(d.w), l));
  return c.reduce((d, p) => _a(t, p) < _a(t, d) ? p : d);
}
function ud(e, t, n, o) {
  var s = n.v, i = n.w;
  e.removeEdge(s, i), e.setEdge(o.v, o.w, {}), el(e), Qr(e, t), Tm(e, t);
}
function Tm(e, t) {
  var n = e.nodes().find((s) => !t.node(s).parent), o = $m(e, n);
  o = o.slice(1), o.forEach((s) => {
    var i = e.node(s).parent, r = t.edge(s, i), l = !1;
    r || (r = t.edge(i, s), l = !0), t.node(s).rank = t.node(i).rank + (l ? r.minlen : -r.minlen);
  });
}
function Pm(e, t, n) {
  return e.hasEdge(t, n);
}
function wa(e, t, n) {
  return n.low <= t.lim && t.lim <= n.lim;
}
var Dm = li, cd = Dm.longestPath, Rm = sd, Am = Mm, Lm = Vm;
function Vm(e) {
  var t = e.graph().ranker;
  if (t instanceof Function)
    return t(e);
  switch (e.graph().ranker) {
    case "network-simplex":
      ka(e);
      break;
    case "tight-tree":
      Bm(e);
      break;
    case "longest-path":
      zm(e);
      break;
    case "none":
      break;
    default:
      ka(e);
  }
}
var zm = cd;
function Bm(e) {
  cd(e), Rm(e);
}
function ka(e) {
  Am(e);
}
var Fm = Um;
function Um(e) {
  let t = jm(e);
  e.graph().dummyChains.forEach((n) => {
    let o = e.node(n), s = o.edgeObj, i = Hm(e, t, s.v, s.w), r = i.path, l = i.lca, a = 0, c = r[a], d = !0;
    for (; n !== s.w; ) {
      if (o = e.node(n), d) {
        for (; (c = r[a]) !== l && e.node(c).maxRank < o.rank; )
          a++;
        c === l && (d = !1);
      }
      if (!d) {
        for (; a < r.length - 1 && e.node(c = r[a + 1]).minRank <= o.rank; )
          a++;
        c = r[a];
      }
      e.setParent(n, c), n = e.successors(n)[0];
    }
  });
}
function Hm(e, t, n, o) {
  let s = [], i = [], r = Math.min(t[n].low, t[o].low), l = Math.max(t[n].lim, t[o].lim), a, c;
  a = n;
  do
    a = e.parent(a), s.push(a);
  while (a && (t[a].low > r || l > t[a].lim));
  for (c = a, a = o; (a = e.parent(a)) !== c; )
    i.push(a);
  return { path: s.concat(i.reverse()), lca: c };
}
function jm(e) {
  let t = {}, n = 0;
  function o(s) {
    let i = n;
    e.children(s).forEach(o), t[s] = { low: i, lim: n++ };
  }
  return e.children().forEach(o), t;
}
let Vs = Ze;
var Gm = {
  run: Ym,
  cleanup: Km
};
function Ym(e) {
  let t = Vs.addDummyNode(e, "root", {}, "_root"), n = qm(e), o = Object.values(n), s = Vs.applyWithChunking(Math.max, o) - 1, i = 2 * s + 1;
  e.graph().nestingRoot = t, e.edges().forEach((l) => e.edge(l).minlen *= i);
  let r = Xm(e) + 1;
  e.children().forEach((l) => dd(e, t, i, r, s, n, l)), e.graph().nodeRankFactor = i;
}
function dd(e, t, n, o, s, i, r) {
  let l = e.children(r);
  if (!l.length) {
    r !== t && e.setEdge(t, r, { weight: 0, minlen: n });
    return;
  }
  let a = Vs.addBorderNode(e, "_bt"), c = Vs.addBorderNode(e, "_bb"), d = e.node(r);
  e.setParent(a, r), d.borderTop = a, e.setParent(c, r), d.borderBottom = c, l.forEach((p) => {
    dd(e, t, n, o, s, i, p);
    let v = e.node(p), g = v.borderTop ? v.borderTop : p, k = v.borderBottom ? v.borderBottom : p, $ = v.borderTop ? o : 2 * o, S = g !== k ? 1 : s - i[r] + 1;
    e.setEdge(a, g, {
      weight: $,
      minlen: S,
      nestingEdge: !0
    }), e.setEdge(k, c, {
      weight: $,
      minlen: S,
      nestingEdge: !0
    });
  }), e.parent(r) || e.setEdge(t, a, { weight: 0, minlen: s + i[r] });
}
function qm(e) {
  var t = {};
  function n(o, s) {
    var i = e.children(o);
    i && i.length && i.forEach((r) => n(r, s + 1)), t[o] = s;
  }
  return e.children().forEach((o) => n(o, 1)), t;
}
function Xm(e) {
  return e.edges().reduce((t, n) => t + e.edge(n).weight, 0);
}
function Km(e) {
  var t = e.graph();
  e.removeNode(t.nestingRoot), delete t.nestingRoot, e.edges().forEach((n) => {
    var o = e.edge(n);
    o.nestingEdge && e.removeEdge(n);
  });
}
let Wm = Ze;
var Zm = Jm;
function Jm(e) {
  function t(n) {
    let o = e.children(n), s = e.node(n);
    if (o.length && o.forEach(t), Object.hasOwn(s, "minRank")) {
      s.borderLeft = [], s.borderRight = [];
      for (let i = s.minRank, r = s.maxRank + 1; i < r; ++i)
        Ea(e, "borderLeft", "_bl", n, s, i), Ea(e, "borderRight", "_br", n, s, i);
    }
  }
  e.children().forEach(t);
}
function Ea(e, t, n, o, s, i) {
  let r = { width: 0, height: 0, rank: i, borderType: t }, l = s[t][i - 1], a = Wm.addDummyNode(e, "border", r, n);
  s[t][i] = a, e.setParent(a, o), l && e.setEdge(l, a, { weight: 1 });
}
var Qm = {
  adjust: ey,
  undo: ty
};
function ey(e) {
  let t = e.graph().rankdir.toLowerCase();
  (t === "lr" || t === "rl") && fd(e);
}
function ty(e) {
  let t = e.graph().rankdir.toLowerCase();
  (t === "bt" || t === "rl") && ny(e), (t === "lr" || t === "rl") && (oy(e), fd(e));
}
function fd(e) {
  e.nodes().forEach((t) => xa(e.node(t))), e.edges().forEach((t) => xa(e.edge(t)));
}
function xa(e) {
  let t = e.width;
  e.width = e.height, e.height = t;
}
function ny(e) {
  e.nodes().forEach((t) => Di(e.node(t))), e.edges().forEach((t) => {
    let n = e.edge(t);
    n.points.forEach(Di), Object.hasOwn(n, "y") && Di(n);
  });
}
function Di(e) {
  e.y = -e.y;
}
function oy(e) {
  e.nodes().forEach((t) => Ri(e.node(t))), e.edges().forEach((t) => {
    let n = e.edge(t);
    n.points.forEach(Ri), Object.hasOwn(n, "x") && Ri(n);
  });
}
function Ri(e) {
  let t = e.x;
  e.x = e.y, e.y = t;
}
let Sa = Ze;
var sy = iy;
function iy(e) {
  let t = {}, n = e.nodes().filter((a) => !e.children(a).length), o = n.map((a) => e.node(a).rank), s = Sa.applyWithChunking(Math.max, o), i = Sa.range(s + 1).map(() => []);
  function r(a) {
    if (t[a]) return;
    t[a] = !0;
    let c = e.node(a);
    i[c.rank].push(a), e.successors(a).forEach(r);
  }
  return n.sort((a, c) => e.node(a).rank - e.node(c).rank).forEach(r), i;
}
let ry = Ze.zipObject;
var ly = ay;
function ay(e, t) {
  let n = 0;
  for (let o = 1; o < t.length; ++o)
    n += uy(e, t[o - 1], t[o]);
  return n;
}
function uy(e, t, n) {
  let o = ry(n, n.map((c, d) => d)), s = t.flatMap((c) => e.outEdges(c).map((d) => ({ pos: o[d.w], weight: e.edge(d).weight })).sort((d, p) => d.pos - p.pos)), i = 1;
  for (; i < n.length; ) i <<= 1;
  let r = 2 * i - 1;
  i -= 1;
  let l = new Array(r).fill(0), a = 0;
  return s.forEach((c) => {
    let d = c.pos + i;
    l[d] += c.weight;
    let p = 0;
    for (; d > 0; )
      d % 2 && (p += l[d + 1]), d = d - 1 >> 1, l[d] += c.weight;
    a += c.weight * p;
  }), a;
}
var cy = dy;
function dy(e, t = []) {
  return t.map((n) => {
    let o = e.inEdges(n);
    if (o.length) {
      let s = o.reduce((i, r) => {
        let l = e.edge(r), a = e.node(r.v);
        return {
          sum: i.sum + l.weight * a.order,
          weight: i.weight + l.weight
        };
      }, { sum: 0, weight: 0 });
      return {
        v: n,
        barycenter: s.sum / s.weight,
        weight: s.weight
      };
    } else
      return { v: n };
  });
}
let fy = Ze;
var py = hy;
function hy(e, t) {
  let n = {};
  e.forEach((s, i) => {
    let r = n[s.v] = {
      indegree: 0,
      in: [],
      out: [],
      vs: [s.v],
      i
    };
    s.barycenter !== void 0 && (r.barycenter = s.barycenter, r.weight = s.weight);
  }), t.edges().forEach((s) => {
    let i = n[s.v], r = n[s.w];
    i !== void 0 && r !== void 0 && (r.indegree++, i.out.push(n[s.w]));
  });
  let o = Object.values(n).filter((s) => !s.indegree);
  return vy(o);
}
function vy(e) {
  let t = [];
  function n(s) {
    return (i) => {
      i.merged || (i.barycenter === void 0 || s.barycenter === void 0 || i.barycenter >= s.barycenter) && gy(s, i);
    };
  }
  function o(s) {
    return (i) => {
      i.in.push(s), --i.indegree === 0 && e.push(i);
    };
  }
  for (; e.length; ) {
    let s = e.pop();
    t.push(s), s.in.reverse().forEach(n(s)), s.out.forEach(o(s));
  }
  return t.filter((s) => !s.merged).map((s) => fy.pick(s, ["vs", "i", "barycenter", "weight"]));
}
function gy(e, t) {
  let n = 0, o = 0;
  e.weight && (n += e.barycenter * e.weight, o += e.weight), t.weight && (n += t.barycenter * t.weight, o += t.weight), e.vs = t.vs.concat(e.vs), e.barycenter = n / o, e.weight = o, e.i = Math.min(t.i, e.i), t.merged = !0;
}
let my = Ze;
var yy = by;
function by(e, t) {
  let n = my.partition(e, (d) => Object.hasOwn(d, "barycenter")), o = n.lhs, s = n.rhs.sort((d, p) => p.i - d.i), i = [], r = 0, l = 0, a = 0;
  o.sort(_y(!!t)), a = Ca(i, s, a), o.forEach((d) => {
    a += d.vs.length, i.push(d.vs), r += d.barycenter * d.weight, l += d.weight, a = Ca(i, s, a);
  });
  let c = { vs: i.flat(!0) };
  return l && (c.barycenter = r / l, c.weight = l), c;
}
function Ca(e, t, n) {
  let o;
  for (; t.length && (o = t[t.length - 1]).i <= n; )
    t.pop(), e.push(o.vs), n++;
  return n;
}
function _y(e) {
  return (t, n) => t.barycenter < n.barycenter ? -1 : t.barycenter > n.barycenter ? 1 : e ? n.i - t.i : t.i - n.i;
}
let wy = cy, ky = py, Ey = yy;
var xy = pd;
function pd(e, t, n, o) {
  let s = e.children(t), i = e.node(t), r = i ? i.borderLeft : void 0, l = i ? i.borderRight : void 0, a = {};
  r && (s = s.filter((v) => v !== r && v !== l));
  let c = wy(e, s);
  c.forEach((v) => {
    if (e.children(v.v).length) {
      let g = pd(e, v.v, n, o);
      a[v.v] = g, Object.hasOwn(g, "barycenter") && Cy(v, g);
    }
  });
  let d = ky(c, n);
  Sy(d, a);
  let p = Ey(d, o);
  if (r && (p.vs = [r, p.vs, l].flat(!0), e.predecessors(r).length)) {
    let v = e.node(e.predecessors(r)[0]), g = e.node(e.predecessors(l)[0]);
    Object.hasOwn(p, "barycenter") || (p.barycenter = 0, p.weight = 0), p.barycenter = (p.barycenter * p.weight + v.order + g.order) / (p.weight + 2), p.weight += 2;
  }
  return p;
}
function Sy(e, t) {
  e.forEach((n) => {
    n.vs = n.vs.flatMap((o) => t[o] ? t[o].vs : o);
  });
}
function Cy(e, t) {
  e.barycenter !== void 0 ? (e.barycenter = (e.barycenter * e.weight + t.barycenter * t.weight) / (e.weight + t.weight), e.weight += t.weight) : (e.barycenter = t.barycenter, e.weight = t.weight);
}
let $y = Ot.Graph, Ny = Ze;
var Iy = My;
function My(e, t, n) {
  let o = Oy(e), s = new $y({ compound: !0 }).setGraph({ root: o }).setDefaultNodeLabel((i) => e.node(i));
  return e.nodes().forEach((i) => {
    let r = e.node(i), l = e.parent(i);
    (r.rank === t || r.minRank <= t && t <= r.maxRank) && (s.setNode(i), s.setParent(i, l || o), e[n](i).forEach((a) => {
      let c = a.v === i ? a.w : a.v, d = s.edge(c, i), p = d !== void 0 ? d.weight : 0;
      s.setEdge(c, i, { weight: e.edge(a).weight + p });
    }), Object.hasOwn(r, "minRank") && s.setNode(i, {
      borderLeft: r.borderLeft[t],
      borderRight: r.borderRight[t]
    }));
  }), s;
}
function Oy(e) {
  for (var t; e.hasNode(t = Ny.uniqueId("_root")); ) ;
  return t;
}
var Ty = Py;
function Py(e, t, n) {
  let o = {}, s;
  n.forEach((i) => {
    let r = e.parent(i), l, a;
    for (; r; ) {
      if (l = e.parent(r), l ? (a = o[l], o[l] = r) : (a = s, s = r), a && a !== r) {
        t.setEdge(a, r);
        return;
      }
      r = l;
    }
  });
}
let Dy = sy, Ry = ly, Ay = xy, Ly = Iy, Vy = Ty, zy = Ot.Graph, us = Ze;
var By = hd;
function hd(e, t) {
  if (t && typeof t.customOrder == "function") {
    t.customOrder(e, hd);
    return;
  }
  let n = us.maxRank(e), o = $a(e, us.range(1, n + 1), "inEdges"), s = $a(e, us.range(n - 1, -1, -1), "outEdges"), i = Dy(e);
  if (Na(e, i), t && t.disableOptimalOrderHeuristic)
    return;
  let r = Number.POSITIVE_INFINITY, l;
  for (let a = 0, c = 0; c < 4; ++a, ++c) {
    Fy(a % 2 ? o : s, a % 4 >= 2), i = us.buildLayerMatrix(e);
    let d = Ry(e, i);
    d < r && (c = 0, l = Object.assign({}, i), r = d);
  }
  Na(e, l);
}
function $a(e, t, n) {
  return t.map(function(o) {
    return Ly(e, o, n);
  });
}
function Fy(e, t) {
  let n = new zy();
  e.forEach(function(o) {
    let s = o.graph().root, i = Ay(o, s, n, t);
    i.vs.forEach((r, l) => o.node(r).order = l), Vy(o, n, i.vs);
  });
}
function Na(e, t) {
  Object.values(t).forEach((n) => n.forEach((o, s) => e.node(o).order = s));
}
let Uy = Ot.Graph, qt = Ze;
var Hy = {
  positionX: e1
};
function jy(e, t) {
  let n = {};
  function o(s, i) {
    let r = 0, l = 0, a = s.length, c = i[i.length - 1];
    return i.forEach((d, p) => {
      let v = Yy(e, d), g = v ? e.node(v).order : a;
      (v || d === c) && (i.slice(l, p + 1).forEach((k) => {
        e.predecessors(k).forEach(($) => {
          let S = e.node($), T = S.order;
          (T < r || g < T) && !(S.dummy && e.node(k).dummy) && vd(n, $, k);
        });
      }), l = p + 1, r = g);
    }), i;
  }
  return t.length && t.reduce(o), n;
}
function Gy(e, t) {
  let n = {};
  function o(i, r, l, a, c) {
    let d;
    qt.range(r, l).forEach((p) => {
      d = i[p], e.node(d).dummy && e.predecessors(d).forEach((v) => {
        let g = e.node(v);
        g.dummy && (g.order < a || g.order > c) && vd(n, v, d);
      });
    });
  }
  function s(i, r) {
    let l = -1, a, c = 0;
    return r.forEach((d, p) => {
      if (e.node(d).dummy === "border") {
        let v = e.predecessors(d);
        v.length && (a = e.node(v[0]).order, o(r, c, p, l, a), c = p, l = a);
      }
      o(r, c, r.length, a, i.length);
    }), r;
  }
  return t.length && t.reduce(s), n;
}
function Yy(e, t) {
  if (e.node(t).dummy)
    return e.predecessors(t).find((n) => e.node(n).dummy);
}
function vd(e, t, n) {
  if (t > n) {
    let s = t;
    t = n, n = s;
  }
  let o = e[t];
  o || (e[t] = o = {}), o[n] = !0;
}
function qy(e, t, n) {
  if (t > n) {
    let o = t;
    t = n, n = o;
  }
  return !!e[t] && Object.hasOwn(e[t], n);
}
function Xy(e, t, n, o) {
  let s = {}, i = {}, r = {};
  return t.forEach((l) => {
    l.forEach((a, c) => {
      s[a] = a, i[a] = a, r[a] = c;
    });
  }), t.forEach((l) => {
    let a = -1;
    l.forEach((c) => {
      let d = o(c);
      if (d.length) {
        d = d.sort((v, g) => r[v] - r[g]);
        let p = (d.length - 1) / 2;
        for (let v = Math.floor(p), g = Math.ceil(p); v <= g; ++v) {
          let k = d[v];
          i[c] === c && a < r[k] && !qy(n, c, k) && (i[k] = c, i[c] = s[c] = s[k], a = r[k]);
        }
      }
    });
  }), { root: s, align: i };
}
function Ky(e, t, n, o, s) {
  let i = {}, r = Wy(e, t, n, s), l = s ? "borderLeft" : "borderRight";
  function a(p, v) {
    let g = r.nodes(), k = g.pop(), $ = {};
    for (; k; )
      $[k] ? p(k) : ($[k] = !0, g.push(k), g = g.concat(v(k))), k = g.pop();
  }
  function c(p) {
    i[p] = r.inEdges(p).reduce((v, g) => Math.max(v, i[g.v] + r.edge(g)), 0);
  }
  function d(p) {
    let v = r.outEdges(p).reduce((k, $) => Math.min(k, i[$.w] - r.edge($)), Number.POSITIVE_INFINITY), g = e.node(p);
    v !== Number.POSITIVE_INFINITY && g.borderType !== l && (i[p] = Math.max(i[p], v));
  }
  return a(c, r.predecessors.bind(r)), a(d, r.successors.bind(r)), Object.keys(o).forEach((p) => i[p] = i[n[p]]), i;
}
function Wy(e, t, n, o) {
  let s = new Uy(), i = e.graph(), r = t1(i.nodesep, i.edgesep, o);
  return t.forEach((l) => {
    let a;
    l.forEach((c) => {
      let d = n[c];
      if (s.setNode(d), a) {
        var p = n[a], v = s.edge(p, d);
        s.setEdge(p, d, Math.max(r(e, c, a), v || 0));
      }
      a = c;
    });
  }), s;
}
function Zy(e, t) {
  return Object.values(t).reduce((n, o) => {
    let s = Number.NEGATIVE_INFINITY, i = Number.POSITIVE_INFINITY;
    Object.entries(o).forEach(([l, a]) => {
      let c = n1(e, l) / 2;
      s = Math.max(a + c, s), i = Math.min(a - c, i);
    });
    const r = s - i;
    return r < n[0] && (n = [r, o]), n;
  }, [Number.POSITIVE_INFINITY, null])[1];
}
function Jy(e, t) {
  let n = Object.values(t), o = qt.applyWithChunking(Math.min, n), s = qt.applyWithChunking(Math.max, n);
  ["u", "d"].forEach((i) => {
    ["l", "r"].forEach((r) => {
      let l = i + r, a = e[l];
      if (a === t) return;
      let c = Object.values(a), d = o - qt.applyWithChunking(Math.min, c);
      r !== "l" && (d = s - qt.applyWithChunking(Math.max, c)), d && (e[l] = qt.mapValues(a, (p) => p + d));
    });
  });
}
function Qy(e, t) {
  return qt.mapValues(e.ul, (n, o) => {
    if (t)
      return e[t.toLowerCase()][o];
    {
      let s = Object.values(e).map((i) => i[o]).sort((i, r) => i - r);
      return (s[1] + s[2]) / 2;
    }
  });
}
function e1(e) {
  let t = qt.buildLayerMatrix(e), n = Object.assign(
    jy(e, t),
    Gy(e, t)
  ), o = {}, s;
  ["u", "d"].forEach((r) => {
    s = r === "u" ? t : Object.values(t).reverse(), ["l", "r"].forEach((l) => {
      l === "r" && (s = s.map((p) => Object.values(p).reverse()));
      let a = (r === "u" ? e.predecessors : e.successors).bind(e), c = Xy(e, s, n, a), d = Ky(
        e,
        s,
        c.root,
        c.align,
        l === "r"
      );
      l === "r" && (d = qt.mapValues(d, (p) => -p)), o[r + l] = d;
    });
  });
  let i = Zy(e, o);
  return Jy(o, i), Qy(o, e.graph().align);
}
function t1(e, t, n) {
  return (o, s, i) => {
    let r = o.node(s), l = o.node(i), a = 0, c;
    if (a += r.width / 2, Object.hasOwn(r, "labelpos"))
      switch (r.labelpos.toLowerCase()) {
        case "l":
          c = -r.width / 2;
          break;
        case "r":
          c = r.width / 2;
          break;
      }
    if (c && (a += n ? c : -c), c = 0, a += (r.dummy ? t : e) / 2, a += (l.dummy ? t : e) / 2, a += l.width / 2, Object.hasOwn(l, "labelpos"))
      switch (l.labelpos.toLowerCase()) {
        case "l":
          c = l.width / 2;
          break;
        case "r":
          c = -l.width / 2;
          break;
      }
    return c && (a += n ? c : -c), c = 0, a;
  };
}
function n1(e, t) {
  return e.node(t).width;
}
let gd = Ze, o1 = Hy.positionX;
var s1 = i1;
function i1(e) {
  e = gd.asNonCompoundGraph(e), r1(e), Object.entries(o1(e)).forEach(([t, n]) => e.node(t).x = n);
}
function r1(e) {
  let t = gd.buildLayerMatrix(e), n = e.graph().ranksep, o = 0;
  t.forEach((s) => {
    const i = s.reduce((r, l) => {
      const a = e.node(l).height;
      return r > a ? r : a;
    }, 0);
    s.forEach((r) => e.node(r).y = o + i / 2), o += i + n;
  });
}
let Ia = am, Ma = pm, l1 = Lm, a1 = Ze.normalizeRanks, u1 = Fm, c1 = Ze.removeEmptyRanks, Oa = Gm, d1 = Zm, Ta = Qm, f1 = By, p1 = s1, St = Ze, h1 = Ot.Graph;
var v1 = g1;
function g1(e, t) {
  let n = t && t.debugTiming ? St.time : St.notime;
  n("layout", () => {
    let o = n("  buildLayoutGraph", () => C1(e));
    n("  runLayout", () => m1(o, n, t)), n("  updateInputGraph", () => y1(e, o));
  });
}
function m1(e, t, n) {
  t("    makeSpaceForEdgeLabels", () => $1(e)), t("    removeSelfEdges", () => A1(e)), t("    acyclic", () => Ia.run(e)), t("    nestingGraph.run", () => Oa.run(e)), t("    rank", () => l1(St.asNonCompoundGraph(e))), t("    injectEdgeLabelProxies", () => N1(e)), t("    removeEmptyRanks", () => c1(e)), t("    nestingGraph.cleanup", () => Oa.cleanup(e)), t("    normalizeRanks", () => a1(e)), t("    assignRankMinMax", () => I1(e)), t("    removeEdgeLabelProxies", () => M1(e)), t("    normalize.run", () => Ma.run(e)), t("    parentDummyChains", () => u1(e)), t("    addBorderSegments", () => d1(e)), t("    order", () => f1(e, n)), t("    insertSelfEdges", () => L1(e)), t("    adjustCoordinateSystem", () => Ta.adjust(e)), t("    position", () => p1(e)), t("    positionSelfEdges", () => V1(e)), t("    removeBorderNodes", () => R1(e)), t("    normalize.undo", () => Ma.undo(e)), t("    fixupEdgeLabelCoords", () => P1(e)), t("    undoCoordinateSystem", () => Ta.undo(e)), t("    translateGraph", () => O1(e)), t("    assignNodeIntersects", () => T1(e)), t("    reversePoints", () => D1(e)), t("    acyclic.undo", () => Ia.undo(e));
}
function y1(e, t) {
  e.nodes().forEach((n) => {
    let o = e.node(n), s = t.node(n);
    o && (o.x = s.x, o.y = s.y, o.rank = s.rank, t.children(n).length && (o.width = s.width, o.height = s.height));
  }), e.edges().forEach((n) => {
    let o = e.edge(n), s = t.edge(n);
    o.points = s.points, Object.hasOwn(s, "x") && (o.x = s.x, o.y = s.y);
  }), e.graph().width = t.graph().width, e.graph().height = t.graph().height;
}
let b1 = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"], _1 = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: "tb" }, w1 = ["acyclicer", "ranker", "rankdir", "align"], k1 = ["width", "height", "rank"], Pa = { width: 0, height: 0 }, E1 = ["minlen", "weight", "width", "height", "labeloffset"], x1 = {
  minlen: 1,
  weight: 1,
  width: 0,
  height: 0,
  labeloffset: 10,
  labelpos: "r"
}, S1 = ["labelpos"];
function C1(e) {
  let t = new h1({ multigraph: !0, compound: !0 }), n = Li(e.graph());
  return t.setGraph(Object.assign(
    {},
    _1,
    Ai(n, b1),
    St.pick(n, w1)
  )), e.nodes().forEach((o) => {
    let s = Li(e.node(o));
    const i = Ai(s, k1);
    Object.keys(Pa).forEach((r) => {
      i[r] === void 0 && (i[r] = Pa[r]);
    }), t.setNode(o, i), t.setParent(o, e.parent(o));
  }), e.edges().forEach((o) => {
    let s = Li(e.edge(o));
    t.setEdge(o, Object.assign(
      {},
      x1,
      Ai(s, E1),
      St.pick(s, S1)
    ));
  }), t;
}
function $1(e) {
  let t = e.graph();
  t.ranksep /= 2, e.edges().forEach((n) => {
    let o = e.edge(n);
    o.minlen *= 2, o.labelpos.toLowerCase() !== "c" && (t.rankdir === "TB" || t.rankdir === "BT" ? o.width += o.labeloffset : o.height += o.labeloffset);
  });
}
function N1(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t);
    if (n.width && n.height) {
      let o = e.node(t.v), i = { rank: (e.node(t.w).rank - o.rank) / 2 + o.rank, e: t };
      St.addDummyNode(e, "edge-proxy", i, "_ep");
    }
  });
}
function I1(e) {
  let t = 0;
  e.nodes().forEach((n) => {
    let o = e.node(n);
    o.borderTop && (o.minRank = e.node(o.borderTop).rank, o.maxRank = e.node(o.borderBottom).rank, t = Math.max(t, o.maxRank));
  }), e.graph().maxRank = t;
}
function M1(e) {
  e.nodes().forEach((t) => {
    let n = e.node(t);
    n.dummy === "edge-proxy" && (e.edge(n.e).labelRank = n.rank, e.removeNode(t));
  });
}
function O1(e) {
  let t = Number.POSITIVE_INFINITY, n = 0, o = Number.POSITIVE_INFINITY, s = 0, i = e.graph(), r = i.marginx || 0, l = i.marginy || 0;
  function a(c) {
    let d = c.x, p = c.y, v = c.width, g = c.height;
    t = Math.min(t, d - v / 2), n = Math.max(n, d + v / 2), o = Math.min(o, p - g / 2), s = Math.max(s, p + g / 2);
  }
  e.nodes().forEach((c) => a(e.node(c))), e.edges().forEach((c) => {
    let d = e.edge(c);
    Object.hasOwn(d, "x") && a(d);
  }), t -= r, o -= l, e.nodes().forEach((c) => {
    let d = e.node(c);
    d.x -= t, d.y -= o;
  }), e.edges().forEach((c) => {
    let d = e.edge(c);
    d.points.forEach((p) => {
      p.x -= t, p.y -= o;
    }), Object.hasOwn(d, "x") && (d.x -= t), Object.hasOwn(d, "y") && (d.y -= o);
  }), i.width = n - t + r, i.height = s - o + l;
}
function T1(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t), o = e.node(t.v), s = e.node(t.w), i, r;
    n.points ? (i = n.points[0], r = n.points[n.points.length - 1]) : (n.points = [], i = s, r = o), n.points.unshift(St.intersectRect(o, i)), n.points.push(St.intersectRect(s, r));
  });
}
function P1(e) {
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
function D1(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t);
    n.reversed && n.points.reverse();
  });
}
function R1(e) {
  e.nodes().forEach((t) => {
    if (e.children(t).length) {
      let n = e.node(t), o = e.node(n.borderTop), s = e.node(n.borderBottom), i = e.node(n.borderLeft[n.borderLeft.length - 1]), r = e.node(n.borderRight[n.borderRight.length - 1]);
      n.width = Math.abs(r.x - i.x), n.height = Math.abs(s.y - o.y), n.x = i.x + n.width / 2, n.y = o.y + n.height / 2;
    }
  }), e.nodes().forEach((t) => {
    e.node(t).dummy === "border" && e.removeNode(t);
  });
}
function A1(e) {
  e.edges().forEach((t) => {
    if (t.v === t.w) {
      var n = e.node(t.v);
      n.selfEdges || (n.selfEdges = []), n.selfEdges.push({ e: t, label: e.edge(t) }), e.removeEdge(t);
    }
  });
}
function L1(e) {
  var t = St.buildLayerMatrix(e);
  t.forEach((n) => {
    var o = 0;
    n.forEach((s, i) => {
      var r = e.node(s);
      r.order = i + o, (r.selfEdges || []).forEach((l) => {
        St.addDummyNode(e, "selfedge", {
          width: l.label.width,
          height: l.label.height,
          rank: r.rank,
          order: i + ++o,
          e: l.e,
          label: l.label
        }, "_se");
      }), delete r.selfEdges;
    });
  });
}
function V1(e) {
  e.nodes().forEach((t) => {
    var n = e.node(t);
    if (n.dummy === "selfedge") {
      var o = e.node(n.e.v), s = o.x + o.width / 2, i = o.y, r = n.x - s, l = o.height / 2;
      e.setEdge(n.e, n.label), e.removeNode(t), n.label.points = [
        { x: s + 2 * r / 3, y: i - l },
        { x: s + 5 * r / 6, y: i - l },
        { x: s + r, y: i },
        { x: s + 5 * r / 6, y: i + l },
        { x: s + 2 * r / 3, y: i + l }
      ], n.label.x = n.x, n.label.y = n.y;
    }
  });
}
function Ai(e, t) {
  return St.mapValues(St.pick(e, t), Number);
}
function Li(e) {
  var t = {};
  return e && Object.entries(e).forEach(([n, o]) => {
    typeof n == "string" && (n = n.toLowerCase()), t[n] = o;
  }), t;
}
let z1 = Ze, B1 = Ot.Graph;
var F1 = {
  debugOrdering: U1
};
function U1(e) {
  let t = z1.buildLayerMatrix(e), n = new B1({ compound: !0, multigraph: !0 }).setGraph({});
  return e.nodes().forEach((o) => {
    n.setNode(o, { label: o }), n.setParent(o, "layer" + e.node(o).rank);
  }), e.edges().forEach((o) => n.setEdge(o.v, o.w, {}, o.name)), t.forEach((o, s) => {
    let i = "layer" + s;
    n.setNode(i, { rank: "same" }), o.reduce((r, l) => (n.setEdge(r, l, { style: "invis" }), l));
  }), n;
}
var H1 = "1.1.5", j1 = {
  graphlib: Ot,
  layout: v1,
  debug: F1,
  util: {
    time: Ze.time,
    notime: Ze.notime
  },
  version: H1
};
const Da = /* @__PURE__ */ Fv(j1), Ra = 190, Aa = 78, La = ["profile", "memory", "rag", "extensions", "voice", "live2d"];
function G1(e) {
  const t = e.nodes.find((a) => a.data.kind === "persona"), n = e.nodes.find((a) => a.data.kind === "extensions");
  if (!t || !n) return;
  const o = /* @__PURE__ */ new Map(), s = e.nodes.filter((a) => a.type === "module" && a.data.kind !== "extensions").sort((a, c) => La.indexOf(a.data.kind) - La.indexOf(c.data.kind));
  s.forEach((a, c) => o.set(a.id, { x: 34, y: 24 + c * 112 }));
  const i = 24 + (s.length - 1) * 112 / 2;
  o.set(t.id, { x: 340, y: i }), o.set(n.id, { x: 650, y: i });
  const r = new Set(e.edges.filter((a) => a.source === n.id).map((a) => a.target)), l = e.nodes.filter((a) => r.has(a.id)).sort((a, c) => a.data.level - c.data.level || a.data.label.localeCompare(c.data.label));
  if (l.length > 1) {
    const a = Math.min(3, l.length);
    l.forEach((c, d) => o.set(c.id, {
      x: 960 + d % a * 230,
      y: 24 + Math.floor(d / a) * 108
    }));
  } else if (l.length === 1) {
    const a = l[0];
    o.set(a.id, { x: 960, y: o.get(n.id).y });
    const c = /* @__PURE__ */ new Map([[a.id, 0]]), d = [a.id];
    for (; d.length; ) {
      const v = d.shift(), g = c.get(v);
      e.edges.filter((k) => k.source === v).forEach((k) => {
        c.has(k.target) || (c.set(k.target, g + 1), d.push(k.target));
      });
    }
    const p = Math.max(0, ...c.values());
    for (let v = 1; v <= p; v += 1) {
      const g = e.nodes.filter(($) => c.get($.id) === v).sort(($, S) => $.data.label.localeCompare(S.data.label)), k = o.get(n.id).y;
      g.forEach(($, S) => o.set($.id, {
        x: 960 + v * 260,
        y: k + (S - (g.length - 1) / 2) * 104
      }));
    }
  }
  return {
    nodes: e.nodes.map((a) => ({ ...a, position: o.get(a.id) || a.position })),
    edges: e.edges.map((a) => ({ ...a }))
  };
}
function Y1(e) {
  const t = G1(e);
  if (t) return t;
  const n = new Da.graphlib.Graph();
  return n.setDefaultEdgeLabel(() => ({})), n.setGraph({ rankdir: "LR", nodesep: 34, ranksep: 96, marginx: 28, marginy: 28 }), [...e.nodes].sort((o, s) => o.id.localeCompare(s.id)).forEach((o) => n.setNode(o.id, { width: Ra, height: Aa })), [...e.edges].sort((o, s) => o.id.localeCompare(s.id)).forEach((o) => n.setEdge(o.source, o.target)), Da.layout(n), {
    nodes: e.nodes.map((o) => {
      const s = n.node(o.id);
      return { ...o, position: { x: s.x - Ra / 2, y: s.y - Aa / 2 } };
    }),
    edges: e.edges.map((o) => ({ ...o }))
  };
}
function q1(e, t) {
  const n = /* @__PURE__ */ new Set([t]), o = [t];
  for (; o.length; ) {
    const s = o.shift();
    for (const i of e.edges)
      i.source !== s || n.has(i.target) || (n.add(i.target), o.push(i.target));
  }
  return n;
}
function X1(e, t, n) {
  if (n.has(t)) return t;
  const o = /* @__PURE__ */ new Set(), s = [t];
  for (; s.length; ) {
    const i = s.shift();
    if (!o.has(i)) {
      o.add(i);
      for (const r of e.edges)
        if (r.target === i) {
          if (n.has(r.source)) return r.source;
          s.push(r.source);
        }
    }
  }
}
function K1(e, t) {
  var a;
  const n = e.nodes.find((c) => c.data.kind === "persona");
  if (!n) return e;
  const o = (a = e.nodes.find((c) => c.data.kind === "extensions")) == null ? void 0 : a.id, s = new Set(
    e.edges.filter((c) => c.source === (o || n.id)).map((c) => c.target).filter((c) => e.nodes.some((d) => d.id === c && ["skill", "tool"].includes(d.data.kind)))
  ), i = X1(e, t, s), r = t === o, l = /* @__PURE__ */ new Set([
    n.id,
    ...e.nodes.filter((c) => c.type === "module").map((c) => c.id),
    ...i ? [i] : r ? s : []
  ]);
  return i && q1(e, i).forEach((c) => l.add(c)), {
    nodes: e.nodes.filter((c) => l.has(c.id)),
    edges: e.edges.filter((c) => l.has(c.source) && l.has(c.target))
  };
}
const W1 = {
  class: "knowledge-quality",
  "aria-label": "知识质量"
}, Z1 = { class: "knowledge-quality-heading" }, J1 = ["disabled"], Q1 = {
  class: "knowledge-quality-stats",
  "aria-label": "资料处理概览"
}, eb = { class: "knowledge-quality-report" }, tb = { class: "knowledge-quality-subheading" }, nb = {
  key: 0,
  class: "knowledge-quality-summary"
}, ob = {
  key: 1,
  class: "knowledge-quality-meta"
}, sb = { key: 0 }, ib = { key: 1 }, rb = { key: 2 }, lb = { key: 3 }, ab = {
  key: 2,
  class: "knowledge-quality-empty"
}, ub = { class: "knowledge-quality-evaluation" }, cb = { class: "knowledge-quality-subheading" }, db = { key: 0 }, fb = {
  key: 0,
  class: "knowledge-quality-summary"
}, pb = { class: "knowledge-quality-eval-facts" }, hb = { key: 0 }, vb = { key: 1 }, gb = {
  key: 1,
  class: "knowledge-quality-empty"
}, mb = {
  key: 0,
  class: "knowledge-quality-error"
}, yb = /* @__PURE__ */ Me({
  __name: "KnowledgeQualityPanel",
  props: {
    personaId: {},
    knowledgeSpaceId: {},
    documents: {},
    disabled: { type: Boolean }
  },
  setup(e) {
    const t = e, n = ee(null), o = ee([]), s = ee(!1), i = ee("");
    let r = 0;
    const l = ae(() => mv(t.documents)), a = ae(() => {
      if (!n.value) return l.value;
      const S = Number(n.value.total_documents), T = Number(n.value.indexed_count ?? n.value.indexed_documents), D = Number(n.value.in_progress_count ?? n.value.processing_documents), m = Number(n.value.failed_count ?? n.value.failed_documents);
      return [S, T, D, m].every(Number.isFinite) ? { total: S, indexed: T, processing: D, failed: m, attention: D + m } : l.value;
    }), c = ae(() => o.value[0] || null), d = ae(() => _v(n.value)), p = ae(() => {
      var T, D, m;
      const S = ((T = n.value) == null ? void 0 : T.chunk_count) ?? ((D = n.value) == null ? void 0 : D.chunks) ?? ((m = n.value) == null ? void 0 : m.total_chunks);
      return Number.isFinite(Number(S)) ? Number(S) : null;
    }), v = ae(() => {
      var S, T, D;
      return ((T = (S = c.value) == null ? void 0 : S.metrics) == null ? void 0 : T.accepted_rate) ?? ((D = c.value) == null ? void 0 : D.accepted_rate);
    }), g = ae(() => {
      var D;
      const S = (D = n.value) == null ? void 0 : D.index_version_counts;
      if (!S) return "";
      const [T] = Object.keys(S);
      return T ? `索引 ${T}` : "";
    });
    function k(S) {
      if (!S) return "";
      const T = new Date(S);
      return Number.isNaN(T.getTime()) ? S : new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(T);
    }
    async function $() {
      const S = ++r;
      if (!t.knowledgeSpaceId) {
        n.value = null, o.value = [], i.value = "";
        return;
      }
      s.value = !0, i.value = "";
      const [T, D] = await Promise.allSettled([
        Av(t.knowledgeSpaceId),
        Lv(t.personaId)
      ]);
      if (S !== r) return;
      T.status === "fulfilled" && (n.value = T.value), D.status === "fulfilled" && (o.value = D.value);
      const m = [T, D].find((_) => _.status === "rejected");
      (m == null ? void 0 : m.status) === "rejected" && (i.value = m.reason instanceof Error ? m.reason.message : String(m.reason)), s.value = !1;
    }
    return Ne(() => [t.personaId, t.knowledgeSpaceId], $), rt($), (S, T) => {
      var D, m, _;
      return N(), O("section", W1, [
        u("header", Z1, [
          T[0] || (T[0] = u("div", null, [
            u("span", null, "知识质量"),
            u("strong", null, "处理与评测")
          ], -1)),
          u("button", {
            type: "button",
            class: "knowledge-quality-refresh",
            disabled: s.value || S.disabled || !S.knowledgeSpaceId,
            title: "刷新知识质量",
            onClick: $
          }, [
            Q(B(Nt), {
              size: 13,
              class: ve({ "is-spinning": s.value })
            }, null, 8, ["class"]),
            u("span", null, L(s.value ? "读取中" : "刷新"), 1)
          ], 8, J1)
        ]),
        u("div", Q1, [
          u("div", null, [
            u("strong", null, L(a.value.total), 1),
            T[1] || (T[1] = u("span", null, "资料", -1))
          ]),
          u("div", null, [
            u("strong", null, L(a.value.indexed), 1),
            T[2] || (T[2] = u("span", null, "已索引", -1))
          ]),
          u("div", {
            class: ve({ "has-attention": a.value.attention > 0 })
          }, [
            u("strong", null, L(a.value.attention), 1),
            T[3] || (T[3] = u("span", null, "需处理", -1))
          ], 2)
        ]),
        u("div", eb, [
          u("div", tb, [
            T[4] || (T[4] = u("span", null, "处理报告", -1)),
            u("b", {
              class: ve({ "is-attention": a.value.attention > 0 })
            }, L(d.value), 3)
          ]),
          (D = n.value) != null && D.summary ? (N(), O("p", nb, L(n.value.summary), 1)) : re("", !0),
          p.value !== null || g.value ? (N(), O("p", ob, [
            p.value !== null ? (N(), O("span", sb, L(p.value) + " 个片段", 1)) : re("", !0),
            p.value !== null && g.value ? (N(), O("span", ib, " · ")) : re("", !0),
            g.value ? (N(), O("span", rb, L(g.value), 1)) : re("", !0),
            (m = n.value) != null && m.latest_updated_at || (_ = n.value) != null && _.updated_at ? (N(), O("span", lb, " · " + L(k(n.value.latest_updated_at || n.value.updated_at)) + " 更新", 1)) : re("", !0)
          ])) : n.value ? re("", !0) : (N(), O("p", ab, "暂无处理报告，当前先显示资料状态。"))
        ]),
        u("div", ub, [
          u("div", cb, [
            T[5] || (T[5] = u("span", null, "最近评测", -1)),
            c.value ? (N(), O("b", db, L(B(wv)(c.value.status)), 1)) : re("", !0)
          ]),
          c.value ? (N(), O(me, { key: 0 }, [
            c.value.summary ? (N(), O("p", fb, L(c.value.summary), 1)) : re("", !0),
            u("div", pb, [
              v.value !== void 0 && v.value !== null ? (N(), O("span", hb, [
                T[6] || (T[6] = he("通过率 ")),
                u("strong", null, L(B(bv)(v.value)), 1)
              ])) : re("", !0),
              c.value.created_at ? (N(), O("span", vb, L(k(c.value.created_at)), 1)) : re("", !0)
            ])
          ], 64)) : (N(), O("p", gb, "暂无已保存评测，可从下方进入完整 RAG 评测。"))
        ]),
        i.value ? (N(), O("p", mb, "读取质量数据失败：" + L(i.value), 1)) : re("", !0)
      ]);
    };
  }
}), bb = ["aria-busy"], _b = {
  key: 0,
  class: "inspect-fields"
}, wb = ["value"], kb = ["value"], Eb = ["value"], xb = { class: "inspect-fieldset" }, Sb = ["value"], Cb = ["value"], $b = ["value"], Nb = ["value"], Ib = ["value"], Mb = { class: "inline-check" }, Ob = ["checked"], Tb = {
  key: 1,
  class: "inspect-stack rag-inspector"
}, Pb = ["disabled"], Db = {
  key: 0,
  class: "pending-files"
}, Rb = ["onClick"], Ab = ["onClick"], Lb = ["disabled"], Vb = { class: "document-items" }, zb = { class: "document-actions" }, Bb = ["onClick"], Fb = ["onClick"], Ub = ["onClick"], Hb = {
  key: 2,
  class: "inspect-stack"
}, jb = {
  key: 3,
  class: "inspect-stack"
}, Gb = {
  key: 4,
  class: "inspect-fields"
}, Yb = { class: "inline-check" }, qb = ["checked"], Xb = { class: "inline-check" }, Kb = ["checked"], Wb = ["value"], Zb = ["value"], Jb = ["value"], Qb = { class: "inspect-button-row" }, e0 = ["disabled"], t0 = {
  key: 5,
  class: "live2d-model-library"
}, n0 = { class: "live2d-binding-summary" }, o0 = ["disabled"], s0 = { class: "live2d-library-actions" }, i0 = ["disabled"], r0 = ["disabled"], l0 = { class: "live2d-model-heading" }, a0 = {
  key: 0,
  class: "live2d-model-items"
}, u0 = { class: "live2d-model-copy" }, c0 = { class: "live2d-model-state" }, d0 = {
  key: 0,
  type: "button",
  disabled: "",
  class: "is-bound"
}, f0 = ["disabled", "title", "onClick"], p0 = {
  key: 1,
  class: "live2d-model-empty"
}, h0 = {
  key: 6,
  class: "inspect-fields"
}, v0 = { key: 0 }, g0 = ["value"], m0 = { key: 1 }, y0 = {
  key: 2,
  class: "dependency-list"
}, b0 = {
  key: 7,
  class: "inspect-fields"
}, _0 = { class: "inline-check" }, w0 = ["checked", "disabled"], k0 = /* @__PURE__ */ Me({
  __name: "NodeInspector",
  props: {
    node: {},
    draft: {},
    disabled: { type: Boolean },
    uploadCompleteToken: {}
  },
  emits: ["profile", "capability", "server", "upload", "deleteDocument", "retryDocument", "deletePersona", "previewVoice", "openVoiceStudio", "openRagEval", "previewDocument", "previewLocalFile", "refreshLive2d", "openLive2dDirectory"],
  setup(e, { emit: t }) {
    const n = e, o = t, s = ee([]), i = ee(""), r = ee(0), l = ae(() => {
      var G;
      return ((G = n.node) == null ? void 0 : G.data.kind) || "persona";
    }), a = ae(() => n.draft.capabilities.packages.find((G) => {
      var P;
      return G.id === ((P = n.node) == null ? void 0 : P.id);
    })), c = ae(() => l.value === "mcp" ? n.draft.grants.servers.find((G) => {
      var P;
      return `mcp:${G.name}` === ((P = n.node) == null ? void 0 : P.id);
    }) : void 0), d = ae(() => {
      const G = n.node ? n.draft.capabilities.overrides[n.node.id] : void 0;
      return G === !0 ? "allow" : G === !1 ? "deny" : "inherit";
    }), p = ae(() => {
      var G, P;
      return String(((P = (G = n.draft.persona.profile) == null ? void 0 : G.live2d) == null ? void 0 : P.model) || "");
    }), v = ae(() => {
      var G;
      return ((G = n.draft.resources) == null ? void 0 : G.live2dModels) || [];
    }), g = ae(() => {
      var G;
      return { available: "可用", partial: "部分可用", unassigned: "未分配", blocked: "不可用", pending: "等待中", error: "异常" }[((G = n.node) == null ? void 0 : G.data.status) || "blocked"];
    });
    function k(G) {
      return G.kind === "cubism2" ? "Cubism 2" : G.moc_version ? `MOC3 v${G.moc_version}` : "Cubism / MOC3";
    }
    function $(G, P) {
      const V = Je(n.draft.persona), Y = { ...V.profile || {} };
      G === "name" ? V.name = String(P) : Y[G] = P, V.profile = Y, o("profile", V);
    }
    function S(G, P) {
      const V = Je(n.draft.persona), Y = { ...V.profile || {} };
      Y.tts = { ...Y.tts || {}, [G]: P }, V.profile = Y, o("profile", V);
    }
    function T(G) {
      const P = Je(n.draft.persona), V = { ...P.profile || {} };
      V.live2d = { ...V.live2d || {}, model: G }, P.profile = V, o("profile", P);
    }
    const D = ae(() => {
      var G;
      return ((G = n.draft.persona.profile) == null ? void 0 : G.rag) || {};
    });
    function m(G, P) {
      const V = Je(n.draft.persona), Y = { ...V.profile || {} };
      Y.rag = { ...Y.rag || {}, [G]: P }, V.profile = Y, o("profile", V);
    }
    function _(G) {
      s.value = Array.from(G.target.files || []);
    }
    function z(G) {
      var P;
      s.value = Array.from(((P = G.dataTransfer) == null ? void 0 : P.files) || []);
    }
    function U(G) {
      s.value = s.value.filter((P, V) => V !== G);
    }
    function Z() {
      n.disabled || !s.value.length && !i.value.trim() || o("upload", s.value, i.value);
    }
    return Ne(() => n.uploadCompleteToken, () => {
      s.value = [], i.value = "", r.value += 1;
    }), (G, P) => {
      var V, Y, H, J, C, A, M, R, j, ne, le, fe, se, ce, ue, ge;
      return N(), O("aside", {
        class: ve(["node-inspector", { "is-disabled": G.disabled }]),
        "aria-busy": G.disabled
      }, [
        u("header", null, [
          u("div", null, [
            u("strong", null, L(((V = G.node) == null ? void 0 : V.data.label) || "角色配置"), 1),
            u("small", null, L((Y = G.node) == null ? void 0 : Y.data.summary), 1)
          ]),
          G.node ? (N(), O("span", {
            key: 0,
            class: ve(`inspect-status status-${G.node.data.status}`)
          }, L(g.value), 3)) : re("", !0)
        ]),
        l.value === "profile" ? (N(), O("div", _b, [
          u("label", null, [
            P[24] || (P[24] = u("span", null, "角色名称", -1)),
            u("input", {
              value: G.draft.persona.name,
              onInput: P[0] || (P[0] = (te) => $("name", te.target.value))
            }, null, 40, wb)
          ]),
          u("label", null, [
            P[25] || (P[25] = u("span", null, "角色人设", -1)),
            u("textarea", {
              rows: "7",
              value: String(((H = G.draft.persona.profile) == null ? void 0 : H.description) || ""),
              onInput: P[1] || (P[1] = (te) => $("description", te.target.value))
            }, null, 40, kb)
          ]),
          u("label", null, [
            P[27] || (P[27] = u("span", null, "回复语言", -1)),
            u("select", {
              value: String(((J = G.draft.persona.profile) == null ? void 0 : J.reply_language) || ""),
              onChange: P[2] || (P[2] = (te) => $("reply_language", te.target.value))
            }, P[26] || (P[26] = [
              u("option", { value: "" }, "跟随对话", -1),
              u("option", { value: "zh" }, "中文", -1),
              u("option", { value: "ja" }, "日语", -1),
              u("option", { value: "en" }, "英语", -1)
            ]), 40, Eb)
          ]),
          u("fieldset", xb, [
            P[35] || (P[35] = u("legend", null, "知识检索", -1)),
            u("label", null, [
              P[29] || (P[29] = u("span", null, "检索预设", -1)),
              u("select", {
                value: String(D.value.profile || "deep"),
                onChange: P[3] || (P[3] = (te) => m("profile", te.target.value))
              }, P[28] || (P[28] = [
                u("option", { value: "precise" }, "精准检索", -1),
                u("option", { value: "deep" }, "深度检索", -1),
                u("option", { value: "custom" }, "自定义", -1)
              ]), 40, Sb)
            ]),
            D.value.profile === "custom" ? (N(), O(me, { key: 0 }, [
              u("label", null, [
                P[30] || (P[30] = u("span", null, "初始召回 K", -1)),
                u("input", {
                  type: "number",
                  min: "1",
                  max: "100",
                  value: D.value.retrieval_k || 20,
                  onChange: P[4] || (P[4] = (te) => m("retrieval_k", Number(te.target.value)))
                }, null, 40, Cb)
              ]),
              u("label", null, [
                P[31] || (P[31] = u("span", null, "重排保留 K", -1)),
                u("input", {
                  type: "number",
                  min: "1",
                  max: "100",
                  value: D.value.rerank_k || 8,
                  onChange: P[5] || (P[5] = (te) => m("rerank_k", Number(te.target.value)))
                }, null, 40, $b)
              ]),
              u("label", null, [
                P[32] || (P[32] = u("span", null, "最终上下文 K", -1)),
                u("input", {
                  type: "number",
                  min: "1",
                  max: "30",
                  value: D.value.final_context_k || 8,
                  onChange: P[6] || (P[6] = (te) => m("final_context_k", Number(te.target.value)))
                }, null, 40, Nb)
              ]),
              u("label", null, [
                P[33] || (P[33] = u("span", null, "证据 Token 预算", -1)),
                u("input", {
                  type: "number",
                  min: "256",
                  max: "20000",
                  step: "256",
                  value: D.value.evidence_token_budget || 4500,
                  onChange: P[7] || (P[7] = (te) => m("evidence_token_budget", Number(te.target.value)))
                }, null, 40, Ib)
              ]),
              u("label", Mb, [
                u("input", {
                  type: "checkbox",
                  checked: D.value.allow_neighbors !== !1,
                  onChange: P[8] || (P[8] = (te) => m("allow_neighbors", te.target.checked))
                }, null, 40, Ob),
                P[34] || (P[34] = u("span", null, "允许补充相邻片段", -1))
              ])
            ], 64)) : re("", !0),
            P[36] || (P[36] = u("small", null, "查询时直接使用这里保存的参数，不额外调用模型判断检索模式。", -1))
          ]),
          u("button", {
            type: "button",
            class: "inspect-danger",
            onClick: P[9] || (P[9] = (te) => o("deletePersona"))
          }, [
            Q(B(en), { size: 15 }),
            P[37] || (P[37] = he("删除当前角色"))
          ])
        ])) : l.value === "rag" ? (N(), O("div", Tb, [
          u("p", null, L(G.draft.documents.length) + " 份资料已关联到角色知识空间。", 1),
          u("label", {
            class: "document-picker",
            onDragover: P[10] || (P[10] = gt(() => {
            }, ["prevent"])),
            onDrop: gt(z, ["prevent"])
          }, [
            Q(B(cr), { size: 15 }),
            u("span", null, L(s.value.length ? `已选择 ${s.value.length} 个文件` : "选择或拖入资料文件"), 1),
            (N(), O("input", {
              key: r.value,
              type: "file",
              multiple: "",
              disabled: G.disabled,
              onChange: _
            }, null, 40, Pb))
          ], 32),
          s.value.length ? (N(), O("ul", Db, [
            (N(!0), O(me, null, Te(s.value, (te, we) => (N(), O("li", {
              key: `${te.name}-${te.size}-${we}`
            }, [
              u("span", null, L(te.name), 1),
              u("span", null, [
                u("button", {
                  type: "button",
                  title: "上传前预览",
                  onClick: (xe) => o("previewLocalFile", te)
                }, [
                  Q(B(fa), { size: 14 })
                ], 8, Rb),
                u("button", {
                  type: "button",
                  title: "移除",
                  onClick: (xe) => U(we)
                }, [
                  Q(B(en), { size: 14 })
                ], 8, Ab)
              ])
            ]))), 128))
          ])) : re("", !0),
          u("label", null, [
            P[38] || (P[38] = u("span", null, "补充文本", -1)),
            $e(u("textarea", {
              "onUpdate:modelValue": P[11] || (P[11] = (te) => i.value = te),
              rows: "3",
              placeholder: "直接写入角色知识库"
            }, null, 512), [
              [Ve, i.value]
            ])
          ]),
          u("button", {
            type: "button",
            class: "inspect-action",
            disabled: G.disabled || !s.value.length && !i.value.trim(),
            onClick: Z
          }, [
            Q(B(cr), { size: 15 }),
            he(L(G.disabled ? "处理中" : "写入知识库"), 1)
          ], 8, Lb),
          u("ul", Vb, [
            (N(!0), O(me, null, Te(G.draft.documents, (te) => (N(), O("li", {
              key: String(te.id)
            }, [
              u("div", null, [
                u("b", null, L(te.original_filename || te.original_name || te.id), 1),
                u("span", null, L(te.status), 1)
              ]),
              u("span", zb, [
                u("button", {
                  type: "button",
                  title: "预览 Markdown",
                  onClick: (we) => o("previewDocument", te)
                }, [
                  Q(B(fa), { size: 14 })
                ], 8, Bb),
                te.status === "index_failed" ? (N(), O("button", {
                  key: 0,
                  type: "button",
                  title: "重新索引",
                  onClick: (we) => o("retryDocument", String(te.id))
                }, [
                  Q(B(Kr), { size: 14 })
                ], 8, Fb)) : re("", !0),
                u("button", {
                  type: "button",
                  title: "删除资料",
                  onClick: (we) => o("deleteDocument", String(te.id))
                }, [
                  Q(B(en), { size: 14 })
                ], 8, Ub)
              ])
            ]))), 128))
          ]),
          Q(yb, {
            "persona-id": G.draft.persona.id,
            "knowledge-space-id": G.draft.persona.knowledge_space_id,
            documents: G.draft.documents,
            disabled: G.disabled
          }, null, 8, ["persona-id", "knowledge-space-id", "documents", "disabled"]),
          u("button", {
            type: "button",
            class: "inspect-action",
            onClick: P[12] || (P[12] = (te) => o("openRagEval"))
          }, [
            Q(B(lr), { size: 15 }),
            P[39] || (P[39] = he("前往 RAG 评测"))
          ])
        ])) : l.value === "memory" ? (N(), O("div", Hb, P[40] || (P[40] = [
          u("p", null, "会话记忆按对话窗口隔离，长期记忆与角色绑定。", -1),
          u("small", null, "清理操作继续在对应对话或接入窗口执行，避免误清其他会话。", -1)
        ]))) : l.value === "extensions" ? (N(), O("div", jb, [
          u("p", null, "当前角色可配置 " + L(G.draft.capabilities.packages.length) + " 项扩展能力。", 1),
          P[41] || (P[41] = u("small", null, "选择画布中的 Skill 或 Tool 查看依赖并设置角色策略；依赖只在选中时展开。", -1))
        ])) : l.value === "voice" ? (N(), O("div", Gb, [
          u("label", Yb, [
            u("input", {
              type: "checkbox",
              checked: !!((A = (C = G.draft.persona.profile) == null ? void 0 : C.tts) != null && A.enabled),
              onChange: P[13] || (P[13] = (te) => S("enabled", te.target.checked))
            }, null, 40, qb),
            P[42] || (P[42] = u("span", null, "生成语音", -1))
          ]),
          u("label", Xb, [
            u("input", {
              type: "checkbox",
              checked: !!((R = (M = G.draft.persona.profile) == null ? void 0 : M.tts) != null && R.auto_play),
              onChange: P[14] || (P[14] = (te) => S("auto_play", te.target.checked))
            }, null, 40, Kb),
            P[43] || (P[43] = u("span", null, "自动播放", -1))
          ]),
          u("label", null, [
            P[45] || (P[45] = u("span", null, "角色音色", -1)),
            u("select", {
              value: String(((ne = (j = G.draft.persona.profile) == null ? void 0 : j.tts) == null ? void 0 : ne.voice_asset_id) || ""),
              onChange: P[15] || (P[15] = (te) => S("voice_asset_id", te.target.value))
            }, [
              P[44] || (P[44] = u("option", { value: "" }, "不绑定音色", -1)),
              (N(!0), O(me, null, Te((le = G.draft.resources) == null ? void 0 : le.voiceAssets, (te) => (N(), O("option", {
                key: te.id,
                value: te.id
              }, L(te.name), 9, Zb))), 128))
            ], 40, Wb)
          ]),
          u("label", null, [
            P[47] || (P[47] = u("span", null, "输出语言", -1)),
            u("select", {
              value: String(((se = (fe = G.draft.persona.profile) == null ? void 0 : fe.tts) == null ? void 0 : se.output_language) || "auto"),
              onChange: P[16] || (P[16] = (te) => S("output_language", te.target.value))
            }, P[46] || (P[46] = [
              u("option", { value: "auto" }, "自动", -1),
              u("option", { value: "zh" }, "中文", -1),
              u("option", { value: "ja" }, "日语", -1),
              u("option", { value: "en" }, "英语", -1)
            ]), 40, Jb)
          ]),
          u("div", Qb, [
            u("button", {
              type: "button",
              class: "inspect-action",
              disabled: !((ue = (ce = G.draft.persona.profile) == null ? void 0 : ce.tts) != null && ue.voice_asset_id),
              onClick: P[17] || (P[17] = (te) => o("previewVoice"))
            }, [
              Q(B(Fc), { size: 15 }),
              P[48] || (P[48] = he("试听"))
            ], 8, e0),
            u("button", {
              type: "button",
              class: "inspect-action",
              onClick: P[18] || (P[18] = (te) => o("openVoiceStudio"))
            }, [
              Q(B(lr), { size: 15 }),
              P[49] || (P[49] = he("声音工坊"))
            ])
          ])
        ])) : l.value === "live2d" ? (N(), O("div", t0, [
          u("section", n0, [
            P[50] || (P[50] = u("span", null, "当前角色绑定", -1)),
            u("strong", null, L(p.value || "未绑定模型"), 1),
            p.value ? (N(), O("button", {
              key: 0,
              type: "button",
              disabled: G.disabled,
              onClick: P[19] || (P[19] = (te) => T(""))
            }, "解除绑定", 8, o0)) : re("", !0)
          ]),
          u("div", s0, [
            u("button", {
              type: "button",
              disabled: G.disabled,
              title: "重新扫描模型",
              onClick: P[20] || (P[20] = (te) => o("refreshLive2d"))
            }, [
              Q(B(Nt), { size: 15 }),
              P[51] || (P[51] = he("刷新"))
            ], 8, i0),
            u("button", {
              type: "button",
              disabled: G.disabled,
              title: "打开 Live2D 模型文件夹",
              onClick: P[21] || (P[21] = (te) => o("openLive2dDirectory"))
            }, [
              Q(B(Do), { size: 15 }),
              P[52] || (P[52] = he("打开文件夹"))
            ], 8, r0)
          ]),
          u("div", l0, [
            P[53] || (P[53] = u("strong", null, "已安装模型", -1)),
            u("span", null, L(v.value.length) + " 个", 1)
          ]),
          v.value.length ? (N(), O("ul", a0, [
            (N(!0), O(me, null, Te(v.value, (te) => (N(), O("li", {
              key: te.id,
              class: ve({ bound: p.value === te.id, incompatible: te.compatible === !1 })
            }, [
              u("div", u0, [
                u("strong", null, L(te.name), 1),
                u("span", null, L(k(te)), 1)
              ]),
              u("div", c0, [
                u("span", {
                  class: ve(te.compatible === !1 ? "is-error" : "is-compatible")
                }, L(te.compatible === !1 ? "不兼容" : "兼容"), 3),
                p.value === te.id ? (N(), O("button", d0, [
                  Q(B(ao), { size: 14 }),
                  P[54] || (P[54] = he("已绑定"))
                ])) : (N(), O("button", {
                  key: 1,
                  type: "button",
                  disabled: G.disabled || te.compatible === !1,
                  title: te.compatible === !1 ? "当前 Live2D 运行时不支持此 MOC3 版本" : `绑定 ${te.name}`,
                  onClick: (we) => T(te.id)
                }, "绑定", 8, f0))
              ])
            ], 2))), 128))
          ])) : (N(), O("div", p0, P[55] || (P[55] = [
            u("strong", null, "尚未发现模型", -1),
            u("p", null, "将模型文件夹放入 data/live2d 后刷新。", -1)
          ]))),
          P[56] || (P[56] = u("p", { class: "live2d-save-hint" }, "绑定修改会随页面顶部“保存配置”一起生效。", -1))
        ])) : l.value === "skill" || l.value === "tool" ? (N(), O("div", h0, [
          a.value ? (N(), O("label", v0, [
            P[58] || (P[58] = u("span", null, "角色策略", -1)),
            u("select", {
              value: d.value,
              onChange: P[22] || (P[22] = (te) => o("capability", G.node.id, te.target.value))
            }, P[57] || (P[57] = [
              u("option", { value: "inherit" }, "继承默认", -1),
              u("option", { value: "allow" }, "允许", -1),
              u("option", { value: "deny" }, "禁用", -1)
            ]), 40, g0)
          ])) : (N(), O("p", m0, "此 Tool 由上级能力包管理，不单独保存开关。")),
          a.value ? (N(), O("div", y0, [
            P[59] || (P[59] = u("b", null, "依赖", -1)),
            (N(!0), O(me, null, Te(a.value.dependencies, (te) => (N(), O("p", {
              key: te.id || te.name
            }, [
              u("span", null, L(te.name), 1),
              u("em", null, L(te.server || te.source), 1)
            ]))), 128))
          ])) : re("", !0)
        ])) : l.value === "mcp" && c.value ? (N(), O("div", b0, [
          u("label", _0, [
            u("input", {
              type: "checkbox",
              checked: c.value.authorized,
              disabled: c.value.global,
              onChange: P[23] || (P[23] = (te) => o("server", c.value.name, te.target.checked))
            }, null, 40, w0),
            u("span", null, L(c.value.global ? "全局授权" : "允许当前角色使用"), 1)
          ]),
          u("p", null, L(c.value.description || "MCP 服务"), 1),
          u("small", null, "连接状态：" + L(((ge = c.value.status) == null ? void 0 : ge.status) || "unknown"), 1)
        ])) : re("", !0)
      ], 10, bb);
    };
  }
});
function ai(e) {
  return Rr() ? (_s(e), !0) : !1;
}
function Xt(e) {
  return typeof e == "function" ? e() : B(e);
}
const E0 = typeof window < "u" && typeof document < "u", x0 = (e) => typeof e < "u", S0 = Object.prototype.toString, C0 = (e) => S0.call(e) === "[object Object]", $0 = () => {
};
function N0(e, t) {
  function n(...o) {
    return new Promise((s, i) => {
      Promise.resolve(e(() => t.apply(this, o), { fn: t, thisArg: this, args: o })).then(s).catch(i);
    });
  }
  return n;
}
const md = (e) => e();
function I0(e = md) {
  const t = ee(!0);
  function n() {
    t.value = !1;
  }
  function o() {
    t.value = !0;
  }
  const s = (...i) => {
    t.value && e(...i);
  };
  return { isActive: Br(t), pause: n, resume: o, eventFilter: s };
}
function Va(e, t = !1, n = "Timeout") {
  return new Promise((o, s) => {
    setTimeout(t ? () => s(n) : o, e);
  });
}
function M0(e, t, n = {}) {
  const {
    eventFilter: o = md,
    ...s
  } = n;
  return Ne(
    e,
    N0(
      o,
      t
    ),
    s
  );
}
function qn(e, t, n = {}) {
  const {
    eventFilter: o,
    ...s
  } = n, { eventFilter: i, pause: r, resume: l, isActive: a } = I0(o);
  return { stop: M0(
    e,
    t,
    {
      ...s,
      eventFilter: i
    }
  ), pause: r, resume: l, isActive: a };
}
function O0(e, t = {}) {
  if (!Xe(e))
    return fp(e);
  const n = Array.isArray(e.value) ? Array.from({ length: e.value.length }) : {};
  for (const o in e.value)
    n[o] = dp(() => ({
      get() {
        return e.value[o];
      },
      set(s) {
        var i;
        if ((i = Xt(t.replaceRef)) != null ? i : !0)
          if (Array.isArray(e.value)) {
            const l = [...e.value];
            l[o] = s, e.value = l;
          } else {
            const l = { ...e.value, [o]: s };
            Object.setPrototypeOf(l, Object.getPrototypeOf(e.value)), e.value = l;
          }
        else
          e.value[o] = s;
      }
    }));
  return n;
}
function hr(e, t = !1) {
  function n(p, { flush: v = "sync", deep: g = !1, timeout: k, throwOnTimeout: $ } = {}) {
    let S = null;
    const D = [new Promise((m) => {
      S = Ne(
        e,
        (_) => {
          p(_) !== t && (S == null || S(), m(_));
        },
        {
          flush: v,
          deep: g,
          immediate: !0
        }
      );
    })];
    return k != null && D.push(
      Va(k, $).then(() => Xt(e)).finally(() => S == null ? void 0 : S())
    ), Promise.race(D);
  }
  function o(p, v) {
    if (!Xe(p))
      return n((_) => _ === p, v);
    const { flush: g = "sync", deep: k = !1, timeout: $, throwOnTimeout: S } = v ?? {};
    let T = null;
    const m = [new Promise((_) => {
      T = Ne(
        [e, p],
        ([z, U]) => {
          t !== (z === U) && (T == null || T(), _(z));
        },
        {
          flush: g,
          deep: k,
          immediate: !0
        }
      );
    })];
    return $ != null && m.push(
      Va($, S).then(() => Xt(e)).finally(() => (T == null || T(), Xt(e)))
    ), Promise.race(m);
  }
  function s(p) {
    return n((v) => !!v, p);
  }
  function i(p) {
    return o(null, p);
  }
  function r(p) {
    return o(void 0, p);
  }
  function l(p) {
    return n(Number.isNaN, p);
  }
  function a(p, v) {
    return n((g) => {
      const k = Array.from(g);
      return k.includes(p) || k.includes(Xt(p));
    }, v);
  }
  function c(p) {
    return d(1, p);
  }
  function d(p = 1, v) {
    let g = -1;
    return n(() => (g += 1, g >= p), v);
  }
  return Array.isArray(Xt(e)) ? {
    toMatch: n,
    toContains: a,
    changed: c,
    changedTimes: d,
    get not() {
      return hr(e, !t);
    }
  } : {
    toMatch: n,
    toBe: o,
    toBeTruthy: s,
    toBeNull: i,
    toBeNaN: l,
    toBeUndefined: r,
    changed: c,
    changedTimes: d,
    get not() {
      return hr(e, !t);
    }
  };
}
function vr(e) {
  return hr(e);
}
function T0(e) {
  var t;
  const n = Xt(e);
  return (t = n == null ? void 0 : n.$el) != null ? t : n;
}
const yd = E0 ? window : void 0;
function bd(...e) {
  let t, n, o, s;
  if (typeof e[0] == "string" || Array.isArray(e[0]) ? ([n, o, s] = e, t = yd) : [t, n, o, s] = e, !t)
    return $0;
  Array.isArray(n) || (n = [n]), Array.isArray(o) || (o = [o]);
  const i = [], r = () => {
    i.forEach((d) => d()), i.length = 0;
  }, l = (d, p, v, g) => (d.addEventListener(p, v, g), () => d.removeEventListener(p, v, g)), a = Ne(
    () => [T0(t), Xt(s)],
    ([d, p]) => {
      if (r(), !d)
        return;
      const v = C0(p) ? { ...p } : p;
      i.push(
        ...n.flatMap((g) => o.map((k) => l(d, g, k, v)))
      );
    },
    { immediate: !0, flush: "post" }
  ), c = () => {
    a(), r();
  };
  return ai(c), c;
}
function P0(e) {
  return typeof e == "function" ? e : typeof e == "string" ? (t) => t.key === e : Array.isArray(e) ? (t) => e.includes(t.key) : () => !0;
}
function za(...e) {
  let t, n, o = {};
  e.length === 3 ? (t = e[0], n = e[1], o = e[2]) : e.length === 2 ? typeof e[1] == "object" ? (t = !0, n = e[0], o = e[1]) : (t = e[0], n = e[1]) : (t = !0, n = e[0]);
  const {
    target: s = yd,
    eventName: i = "keydown",
    passive: r = !1,
    dedupe: l = !1
  } = o, a = P0(t);
  return bd(s, i, (d) => {
    d.repeat && Xt(l) || a(d) && n(d);
  }, r);
}
function D0(e) {
  return JSON.parse(JSON.stringify(e));
}
function Vi(e, t, n, o = {}) {
  var s, i, r;
  const {
    clone: l = !1,
    passive: a = !1,
    eventName: c,
    deep: d = !1,
    defaultValue: p,
    shouldEmit: v
  } = o, g = ho(), k = n || (g == null ? void 0 : g.emit) || ((s = g == null ? void 0 : g.$emit) == null ? void 0 : s.bind(g)) || ((r = (i = g == null ? void 0 : g.proxy) == null ? void 0 : i.$emit) == null ? void 0 : r.bind(g == null ? void 0 : g.proxy));
  let $ = c;
  t || (t = "modelValue"), $ = $ || `update:${t.toString()}`;
  const S = (m) => l ? typeof l == "function" ? l(m) : D0(m) : m, T = () => x0(e[t]) ? S(e[t]) : p, D = (m) => {
    v ? v(m) && k($, m) : k($, m);
  };
  if (a) {
    const m = T(), _ = ee(m);
    let z = !1;
    return Ne(
      () => e[t],
      (U) => {
        z || (z = !0, _.value = S(U), nt(() => z = !1));
      }
    ), Ne(
      _,
      (U) => {
        !z && (U !== e[t] || d) && D(U);
      },
      { deep: d }
    ), _;
  } else
    return ae({
      get() {
        return T();
      },
      set(m) {
        D(m);
      }
    });
}
var R0 = { value: () => {
} };
function ui() {
  for (var e = 0, t = arguments.length, n = {}, o; e < t; ++e) {
    if (!(o = arguments[e] + "") || o in n || /[\s.]/.test(o))
      throw new Error("illegal type: " + o);
    n[o] = [];
  }
  return new Ss(n);
}
function Ss(e) {
  this._ = e;
}
function A0(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var o = "", s = n.indexOf(".");
    if (s >= 0 && (o = n.slice(s + 1), n = n.slice(0, s)), n && !t.hasOwnProperty(n))
      throw new Error("unknown type: " + n);
    return { type: n, name: o };
  });
}
Ss.prototype = ui.prototype = {
  constructor: Ss,
  on: function(e, t) {
    var n = this._, o = A0(e + "", n), s, i = -1, r = o.length;
    if (arguments.length < 2) {
      for (; ++i < r; )
        if ((s = (e = o[i]).type) && (s = L0(n[s], e.name)))
          return s;
      return;
    }
    if (t != null && typeof t != "function")
      throw new Error("invalid callback: " + t);
    for (; ++i < r; )
      if (s = (e = o[i]).type)
        n[s] = Ba(n[s], e.name, t);
      else if (t == null)
        for (s in n)
          n[s] = Ba(n[s], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t)
      e[n] = t[n].slice();
    return new Ss(e);
  },
  call: function(e, t) {
    if ((s = arguments.length - 2) > 0)
      for (var n = new Array(s), o = 0, s, i; o < s; ++o)
        n[o] = arguments[o + 2];
    if (!this._.hasOwnProperty(e))
      throw new Error("unknown type: " + e);
    for (i = this._[e], o = 0, s = i.length; o < s; ++o)
      i[o].value.apply(t, n);
  },
  apply: function(e, t, n) {
    if (!this._.hasOwnProperty(e))
      throw new Error("unknown type: " + e);
    for (var o = this._[e], s = 0, i = o.length; s < i; ++s)
      o[s].value.apply(t, n);
  }
};
function L0(e, t) {
  for (var n = 0, o = e.length, s; n < o; ++n)
    if ((s = e[n]).name === t)
      return s.value;
}
function Ba(e, t, n) {
  for (var o = 0, s = e.length; o < s; ++o)
    if (e[o].name === t) {
      e[o] = R0, e = e.slice(0, o).concat(e.slice(o + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var gr = "http://www.w3.org/1999/xhtml";
const Fa = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: gr,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function ci(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), Fa.hasOwnProperty(t) ? { space: Fa[t], local: e } : e;
}
function V0(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === gr && t.documentElement.namespaceURI === gr ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function z0(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function _d(e) {
  var t = ci(e);
  return (t.local ? z0 : V0)(t);
}
function B0() {
}
function tl(e) {
  return e == null ? B0 : function() {
    return this.querySelector(e);
  };
}
function F0(e) {
  typeof e != "function" && (e = tl(e));
  for (var t = this._groups, n = t.length, o = new Array(n), s = 0; s < n; ++s)
    for (var i = t[s], r = i.length, l = o[s] = new Array(r), a, c, d = 0; d < r; ++d)
      (a = i[d]) && (c = e.call(a, a.__data__, d, i)) && ("__data__" in a && (c.__data__ = a.__data__), l[d] = c);
  return new kt(o, this._parents);
}
function U0(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function H0() {
  return [];
}
function wd(e) {
  return e == null ? H0 : function() {
    return this.querySelectorAll(e);
  };
}
function j0(e) {
  return function() {
    return U0(e.apply(this, arguments));
  };
}
function G0(e) {
  typeof e == "function" ? e = j0(e) : e = wd(e);
  for (var t = this._groups, n = t.length, o = [], s = [], i = 0; i < n; ++i)
    for (var r = t[i], l = r.length, a, c = 0; c < l; ++c)
      (a = r[c]) && (o.push(e.call(a, a.__data__, c, r)), s.push(a));
  return new kt(o, s);
}
function kd(e) {
  return function() {
    return this.matches(e);
  };
}
function Ed(e) {
  return function(t) {
    return t.matches(e);
  };
}
var Y0 = Array.prototype.find;
function q0(e) {
  return function() {
    return Y0.call(this.children, e);
  };
}
function X0() {
  return this.firstElementChild;
}
function K0(e) {
  return this.select(e == null ? X0 : q0(typeof e == "function" ? e : Ed(e)));
}
var W0 = Array.prototype.filter;
function Z0() {
  return Array.from(this.children);
}
function J0(e) {
  return function() {
    return W0.call(this.children, e);
  };
}
function Q0(e) {
  return this.selectAll(e == null ? Z0 : J0(typeof e == "function" ? e : Ed(e)));
}
function e_(e) {
  typeof e != "function" && (e = kd(e));
  for (var t = this._groups, n = t.length, o = new Array(n), s = 0; s < n; ++s)
    for (var i = t[s], r = i.length, l = o[s] = [], a, c = 0; c < r; ++c)
      (a = i[c]) && e.call(a, a.__data__, c, i) && l.push(a);
  return new kt(o, this._parents);
}
function xd(e) {
  return new Array(e.length);
}
function t_() {
  return new kt(this._enter || this._groups.map(xd), this._parents);
}
function zs(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
zs.prototype = {
  constructor: zs,
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
function n_(e) {
  return function() {
    return e;
  };
}
function o_(e, t, n, o, s, i) {
  for (var r = 0, l, a = t.length, c = i.length; r < c; ++r)
    (l = t[r]) ? (l.__data__ = i[r], o[r] = l) : n[r] = new zs(e, i[r]);
  for (; r < a; ++r)
    (l = t[r]) && (s[r] = l);
}
function s_(e, t, n, o, s, i, r) {
  var l, a, c = /* @__PURE__ */ new Map(), d = t.length, p = i.length, v = new Array(d), g;
  for (l = 0; l < d; ++l)
    (a = t[l]) && (v[l] = g = r.call(a, a.__data__, l, t) + "", c.has(g) ? s[l] = a : c.set(g, a));
  for (l = 0; l < p; ++l)
    g = r.call(e, i[l], l, i) + "", (a = c.get(g)) ? (o[l] = a, a.__data__ = i[l], c.delete(g)) : n[l] = new zs(e, i[l]);
  for (l = 0; l < d; ++l)
    (a = t[l]) && c.get(v[l]) === a && (s[l] = a);
}
function i_(e) {
  return e.__data__;
}
function r_(e, t) {
  if (!arguments.length)
    return Array.from(this, i_);
  var n = t ? s_ : o_, o = this._parents, s = this._groups;
  typeof e != "function" && (e = n_(e));
  for (var i = s.length, r = new Array(i), l = new Array(i), a = new Array(i), c = 0; c < i; ++c) {
    var d = o[c], p = s[c], v = p.length, g = l_(e.call(d, d && d.__data__, c, o)), k = g.length, $ = l[c] = new Array(k), S = r[c] = new Array(k), T = a[c] = new Array(v);
    n(d, p, $, S, T, g, t);
    for (var D = 0, m = 0, _, z; D < k; ++D)
      if (_ = $[D]) {
        for (D >= m && (m = D + 1); !(z = S[m]) && ++m < k; )
          ;
        _._next = z || null;
      }
  }
  return r = new kt(r, o), r._enter = l, r._exit = a, r;
}
function l_(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function a_() {
  return new kt(this._exit || this._groups.map(xd), this._parents);
}
function u_(e, t, n) {
  var o = this.enter(), s = this, i = this.exit();
  return typeof e == "function" ? (o = e(o), o && (o = o.selection())) : o = o.append(e + ""), t != null && (s = t(s), s && (s = s.selection())), n == null ? i.remove() : n(i), o && s ? o.merge(s).order() : s;
}
function c_(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, o = t._groups, s = n.length, i = o.length, r = Math.min(s, i), l = new Array(s), a = 0; a < r; ++a)
    for (var c = n[a], d = o[a], p = c.length, v = l[a] = new Array(p), g, k = 0; k < p; ++k)
      (g = c[k] || d[k]) && (v[k] = g);
  for (; a < s; ++a)
    l[a] = n[a];
  return new kt(l, this._parents);
}
function d_() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var o = e[t], s = o.length - 1, i = o[s], r; --s >= 0; )
      (r = o[s]) && (i && r.compareDocumentPosition(i) ^ 4 && i.parentNode.insertBefore(r, i), i = r);
  return this;
}
function f_(e) {
  e || (e = p_);
  function t(p, v) {
    return p && v ? e(p.__data__, v.__data__) : !p - !v;
  }
  for (var n = this._groups, o = n.length, s = new Array(o), i = 0; i < o; ++i) {
    for (var r = n[i], l = r.length, a = s[i] = new Array(l), c, d = 0; d < l; ++d)
      (c = r[d]) && (a[d] = c);
    a.sort(t);
  }
  return new kt(s, this._parents).order();
}
function p_(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function h_() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function v_() {
  return Array.from(this);
}
function g_() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var o = e[t], s = 0, i = o.length; s < i; ++s) {
      var r = o[s];
      if (r)
        return r;
    }
  return null;
}
function m_() {
  let e = 0;
  for (const t of this)
    ++e;
  return e;
}
function y_() {
  return !this.node();
}
function b_(e) {
  for (var t = this._groups, n = 0, o = t.length; n < o; ++n)
    for (var s = t[n], i = 0, r = s.length, l; i < r; ++i)
      (l = s[i]) && e.call(l, l.__data__, i, s);
  return this;
}
function __(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function w_(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function k_(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function E_(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function x_(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function S_(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function C_(e, t) {
  var n = ci(e);
  if (arguments.length < 2) {
    var o = this.node();
    return n.local ? o.getAttributeNS(n.space, n.local) : o.getAttribute(n);
  }
  return this.each((t == null ? n.local ? w_ : __ : typeof t == "function" ? n.local ? S_ : x_ : n.local ? E_ : k_)(n, t));
}
function Sd(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function $_(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function N_(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function I_(e, t, n) {
  return function() {
    var o = t.apply(this, arguments);
    o == null ? this.style.removeProperty(e) : this.style.setProperty(e, o, n);
  };
}
function M_(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? $_ : typeof t == "function" ? I_ : N_)(e, t, n ?? "")) : uo(this.node(), e);
}
function uo(e, t) {
  return e.style.getPropertyValue(t) || Sd(e).getComputedStyle(e, null).getPropertyValue(t);
}
function O_(e) {
  return function() {
    delete this[e];
  };
}
function T_(e, t) {
  return function() {
    this[e] = t;
  };
}
function P_(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function D_(e, t) {
  return arguments.length > 1 ? this.each((t == null ? O_ : typeof t == "function" ? P_ : T_)(e, t)) : this.node()[e];
}
function Cd(e) {
  return e.trim().split(/^|\s+/);
}
function nl(e) {
  return e.classList || new $d(e);
}
function $d(e) {
  this._node = e, this._names = Cd(e.getAttribute("class") || "");
}
$d.prototype = {
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
function Nd(e, t) {
  for (var n = nl(e), o = -1, s = t.length; ++o < s; )
    n.add(t[o]);
}
function Id(e, t) {
  for (var n = nl(e), o = -1, s = t.length; ++o < s; )
    n.remove(t[o]);
}
function R_(e) {
  return function() {
    Nd(this, e);
  };
}
function A_(e) {
  return function() {
    Id(this, e);
  };
}
function L_(e, t) {
  return function() {
    (t.apply(this, arguments) ? Nd : Id)(this, e);
  };
}
function V_(e, t) {
  var n = Cd(e + "");
  if (arguments.length < 2) {
    for (var o = nl(this.node()), s = -1, i = n.length; ++s < i; )
      if (!o.contains(n[s]))
        return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? L_ : t ? R_ : A_)(n, t));
}
function z_() {
  this.textContent = "";
}
function B_(e) {
  return function() {
    this.textContent = e;
  };
}
function F_(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function U_(e) {
  return arguments.length ? this.each(e == null ? z_ : (typeof e == "function" ? F_ : B_)(e)) : this.node().textContent;
}
function H_() {
  this.innerHTML = "";
}
function j_(e) {
  return function() {
    this.innerHTML = e;
  };
}
function G_(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function Y_(e) {
  return arguments.length ? this.each(e == null ? H_ : (typeof e == "function" ? G_ : j_)(e)) : this.node().innerHTML;
}
function q_() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function X_() {
  return this.each(q_);
}
function K_() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function W_() {
  return this.each(K_);
}
function Z_(e) {
  var t = typeof e == "function" ? e : _d(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function J_() {
  return null;
}
function Q_(e, t) {
  var n = typeof e == "function" ? e : _d(e), o = t == null ? J_ : typeof t == "function" ? t : tl(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), o.apply(this, arguments) || null);
  });
}
function ew() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function tw() {
  return this.each(ew);
}
function nw() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function ow() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function sw(e) {
  return this.select(e ? ow : nw);
}
function iw(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function rw(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function lw(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", o = t.indexOf(".");
    return o >= 0 && (n = t.slice(o + 1), t = t.slice(0, o)), { type: t, name: n };
  });
}
function aw(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, o = -1, s = t.length, i; n < s; ++n)
        i = t[n], (!e.type || i.type === e.type) && i.name === e.name ? this.removeEventListener(i.type, i.listener, i.options) : t[++o] = i;
      ++o ? t.length = o : delete this.__on;
    }
  };
}
function uw(e, t, n) {
  return function() {
    var o = this.__on, s, i = rw(t);
    if (o) {
      for (var r = 0, l = o.length; r < l; ++r)
        if ((s = o[r]).type === e.type && s.name === e.name) {
          this.removeEventListener(s.type, s.listener, s.options), this.addEventListener(s.type, s.listener = i, s.options = n), s.value = t;
          return;
        }
    }
    this.addEventListener(e.type, i, n), s = { type: e.type, name: e.name, value: t, listener: i, options: n }, o ? o.push(s) : this.__on = [s];
  };
}
function cw(e, t, n) {
  var o = lw(e + ""), s, i = o.length, r;
  if (arguments.length < 2) {
    var l = this.node().__on;
    if (l) {
      for (var a = 0, c = l.length, d; a < c; ++a)
        for (s = 0, d = l[a]; s < i; ++s)
          if ((r = o[s]).type === d.type && r.name === d.name)
            return d.value;
    }
    return;
  }
  for (l = t ? uw : aw, s = 0; s < i; ++s)
    this.each(l(o[s], t, n));
  return this;
}
function Md(e, t, n) {
  var o = Sd(e), s = o.CustomEvent;
  typeof s == "function" ? s = new s(t, n) : (s = o.document.createEvent("Event"), n ? (s.initEvent(t, n.bubbles, n.cancelable), s.detail = n.detail) : s.initEvent(t, !1, !1)), e.dispatchEvent(s);
}
function dw(e, t) {
  return function() {
    return Md(this, e, t);
  };
}
function fw(e, t) {
  return function() {
    return Md(this, e, t.apply(this, arguments));
  };
}
function pw(e, t) {
  return this.each((typeof t == "function" ? fw : dw)(e, t));
}
function* hw() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var o = e[t], s = 0, i = o.length, r; s < i; ++s)
      (r = o[s]) && (yield r);
}
var Od = [null];
function kt(e, t) {
  this._groups = e, this._parents = t;
}
function ts() {
  return new kt([[document.documentElement]], Od);
}
function vw() {
  return this;
}
kt.prototype = ts.prototype = {
  constructor: kt,
  select: F0,
  selectAll: G0,
  selectChild: K0,
  selectChildren: Q0,
  filter: e_,
  data: r_,
  enter: t_,
  exit: a_,
  join: u_,
  merge: c_,
  selection: vw,
  order: d_,
  sort: f_,
  call: h_,
  nodes: v_,
  node: g_,
  size: m_,
  empty: y_,
  each: b_,
  attr: C_,
  style: M_,
  property: D_,
  classed: V_,
  text: U_,
  html: Y_,
  raise: X_,
  lower: W_,
  append: Z_,
  insert: Q_,
  remove: tw,
  clone: sw,
  datum: iw,
  on: cw,
  dispatch: pw,
  [Symbol.iterator]: hw
};
function Ct(e) {
  return typeof e == "string" ? new kt([[document.querySelector(e)]], [document.documentElement]) : new kt([[e]], Od);
}
function gw(e) {
  let t;
  for (; t = e.sourceEvent; )
    e = t;
  return e;
}
function Rt(e, t) {
  if (e = gw(e), t === void 0 && (t = e.currentTarget), t) {
    var n = t.ownerSVGElement || t;
    if (n.createSVGPoint) {
      var o = n.createSVGPoint();
      return o.x = e.clientX, o.y = e.clientY, o = o.matrixTransform(t.getScreenCTM().inverse()), [o.x, o.y];
    }
    if (t.getBoundingClientRect) {
      var s = t.getBoundingClientRect();
      return [e.clientX - s.left - t.clientLeft, e.clientY - s.top - t.clientTop];
    }
  }
  return [e.pageX, e.pageY];
}
const mw = { passive: !1 }, Ho = { capture: !0, passive: !1 };
function zi(e) {
  e.stopImmediatePropagation();
}
function no(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function Td(e) {
  var t = e.document.documentElement, n = Ct(e).on("dragstart.drag", no, Ho);
  "onselectstart" in t ? n.on("selectstart.drag", no, Ho) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function Pd(e, t) {
  var n = e.document.documentElement, o = Ct(e).on("dragstart.drag", null);
  t && (o.on("click.drag", no, Ho), setTimeout(function() {
    o.on("click.drag", null);
  }, 0)), "onselectstart" in n ? o.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
const cs = (e) => () => e;
function mr(e, {
  sourceEvent: t,
  subject: n,
  target: o,
  identifier: s,
  active: i,
  x: r,
  y: l,
  dx: a,
  dy: c,
  dispatch: d
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    subject: { value: n, enumerable: !0, configurable: !0 },
    target: { value: o, enumerable: !0, configurable: !0 },
    identifier: { value: s, enumerable: !0, configurable: !0 },
    active: { value: i, enumerable: !0, configurable: !0 },
    x: { value: r, enumerable: !0, configurable: !0 },
    y: { value: l, enumerable: !0, configurable: !0 },
    dx: { value: a, enumerable: !0, configurable: !0 },
    dy: { value: c, enumerable: !0, configurable: !0 },
    _: { value: d }
  });
}
mr.prototype.on = function() {
  var e = this._.on.apply(this._, arguments);
  return e === this._ ? this : e;
};
function yw(e) {
  return !e.ctrlKey && !e.button;
}
function bw() {
  return this.parentNode;
}
function _w(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function ww() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function kw() {
  var e = yw, t = bw, n = _w, o = ww, s = {}, i = ui("start", "drag", "end"), r = 0, l, a, c, d, p = 0;
  function v(_) {
    _.on("mousedown.drag", g).filter(o).on("touchstart.drag", S).on("touchmove.drag", T, mw).on("touchend.drag touchcancel.drag", D).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function g(_, z) {
    if (!(d || !e.call(this, _, z))) {
      var U = m(this, t.call(this, _, z), _, z, "mouse");
      U && (Ct(_.view).on("mousemove.drag", k, Ho).on("mouseup.drag", $, Ho), Td(_.view), zi(_), c = !1, l = _.clientX, a = _.clientY, U("start", _));
    }
  }
  function k(_) {
    if (no(_), !c) {
      var z = _.clientX - l, U = _.clientY - a;
      c = z * z + U * U > p;
    }
    s.mouse("drag", _);
  }
  function $(_) {
    Ct(_.view).on("mousemove.drag mouseup.drag", null), Pd(_.view, c), no(_), s.mouse("end", _);
  }
  function S(_, z) {
    if (e.call(this, _, z)) {
      var U = _.changedTouches, Z = t.call(this, _, z), G = U.length, P, V;
      for (P = 0; P < G; ++P)
        (V = m(this, Z, _, z, U[P].identifier, U[P])) && (zi(_), V("start", _, U[P]));
    }
  }
  function T(_) {
    var z = _.changedTouches, U = z.length, Z, G;
    for (Z = 0; Z < U; ++Z)
      (G = s[z[Z].identifier]) && (no(_), G("drag", _, z[Z]));
  }
  function D(_) {
    var z = _.changedTouches, U = z.length, Z, G;
    for (d && clearTimeout(d), d = setTimeout(function() {
      d = null;
    }, 500), Z = 0; Z < U; ++Z)
      (G = s[z[Z].identifier]) && (zi(_), G("end", _, z[Z]));
  }
  function m(_, z, U, Z, G, P) {
    var V = i.copy(), Y = Rt(P || U, z), H, J, C;
    if ((C = n.call(_, new mr("beforestart", {
      sourceEvent: U,
      target: v,
      identifier: G,
      active: r,
      x: Y[0],
      y: Y[1],
      dx: 0,
      dy: 0,
      dispatch: V
    }), Z)) != null)
      return H = C.x - Y[0] || 0, J = C.y - Y[1] || 0, function A(M, R, j) {
        var ne = Y, le;
        switch (M) {
          case "start":
            s[G] = A, le = r++;
            break;
          case "end":
            delete s[G], --r;
          case "drag":
            Y = Rt(j || R, z), le = r;
            break;
        }
        V.call(
          M,
          _,
          new mr(M, {
            sourceEvent: R,
            subject: C,
            target: v,
            identifier: G,
            active: le,
            x: Y[0] + H,
            y: Y[1] + J,
            dx: Y[0] - ne[0],
            dy: Y[1] - ne[1],
            dispatch: V
          }),
          Z
        );
      };
  }
  return v.filter = function(_) {
    return arguments.length ? (e = typeof _ == "function" ? _ : cs(!!_), v) : e;
  }, v.container = function(_) {
    return arguments.length ? (t = typeof _ == "function" ? _ : cs(_), v) : t;
  }, v.subject = function(_) {
    return arguments.length ? (n = typeof _ == "function" ? _ : cs(_), v) : n;
  }, v.touchable = function(_) {
    return arguments.length ? (o = typeof _ == "function" ? _ : cs(!!_), v) : o;
  }, v.on = function() {
    var _ = i.on.apply(i, arguments);
    return _ === i ? v : _;
  }, v.clickDistance = function(_) {
    return arguments.length ? (p = (_ = +_) * _, v) : Math.sqrt(p);
  }, v;
}
function ol(e, t, n) {
  e.prototype = t.prototype = n, n.constructor = e;
}
function Dd(e, t) {
  var n = Object.create(e.prototype);
  for (var o in t)
    n[o] = t[o];
  return n;
}
function ns() {
}
var jo = 0.7, Bs = 1 / jo, oo = "\\s*([+-]?\\d+)\\s*", Go = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", zt = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", Ew = /^#([0-9a-f]{3,8})$/, xw = new RegExp(`^rgb\\(${oo},${oo},${oo}\\)$`), Sw = new RegExp(`^rgb\\(${zt},${zt},${zt}\\)$`), Cw = new RegExp(`^rgba\\(${oo},${oo},${oo},${Go}\\)$`), $w = new RegExp(`^rgba\\(${zt},${zt},${zt},${Go}\\)$`), Nw = new RegExp(`^hsl\\(${Go},${zt},${zt}\\)$`), Iw = new RegExp(`^hsla\\(${Go},${zt},${zt},${Go}\\)$`), Ua = {
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
ol(ns, Yo, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: Ha,
  // Deprecated! Use color.formatHex.
  formatHex: Ha,
  formatHex8: Mw,
  formatHsl: Ow,
  formatRgb: ja,
  toString: ja
});
function Ha() {
  return this.rgb().formatHex();
}
function Mw() {
  return this.rgb().formatHex8();
}
function Ow() {
  return Rd(this).formatHsl();
}
function ja() {
  return this.rgb().formatRgb();
}
function Yo(e) {
  var t, n;
  return e = (e + "").trim().toLowerCase(), (t = Ew.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? Ga(t) : n === 3 ? new mt(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? ds(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? ds(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = xw.exec(e)) ? new mt(t[1], t[2], t[3], 1) : (t = Sw.exec(e)) ? new mt(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = Cw.exec(e)) ? ds(t[1], t[2], t[3], t[4]) : (t = $w.exec(e)) ? ds(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = Nw.exec(e)) ? Xa(t[1], t[2] / 100, t[3] / 100, 1) : (t = Iw.exec(e)) ? Xa(t[1], t[2] / 100, t[3] / 100, t[4]) : Ua.hasOwnProperty(e) ? Ga(Ua[e]) : e === "transparent" ? new mt(NaN, NaN, NaN, 0) : null;
}
function Ga(e) {
  return new mt(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function ds(e, t, n, o) {
  return o <= 0 && (e = t = n = NaN), new mt(e, t, n, o);
}
function Tw(e) {
  return e instanceof ns || (e = Yo(e)), e ? (e = e.rgb(), new mt(e.r, e.g, e.b, e.opacity)) : new mt();
}
function yr(e, t, n, o) {
  return arguments.length === 1 ? Tw(e) : new mt(e, t, n, o ?? 1);
}
function mt(e, t, n, o) {
  this.r = +e, this.g = +t, this.b = +n, this.opacity = +o;
}
ol(mt, yr, Dd(ns, {
  brighter(e) {
    return e = e == null ? Bs : Math.pow(Bs, e), new mt(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? jo : Math.pow(jo, e), new mt(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new mt(Ln(this.r), Ln(this.g), Ln(this.b), Fs(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: Ya,
  // Deprecated! Use color.formatHex.
  formatHex: Ya,
  formatHex8: Pw,
  formatRgb: qa,
  toString: qa
}));
function Ya() {
  return `#${Dn(this.r)}${Dn(this.g)}${Dn(this.b)}`;
}
function Pw() {
  return `#${Dn(this.r)}${Dn(this.g)}${Dn(this.b)}${Dn((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function qa() {
  const e = Fs(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${Ln(this.r)}, ${Ln(this.g)}, ${Ln(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function Fs(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function Ln(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function Dn(e) {
  return e = Ln(e), (e < 16 ? "0" : "") + e.toString(16);
}
function Xa(e, t, n, o) {
  return o <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new $t(e, t, n, o);
}
function Rd(e) {
  if (e instanceof $t)
    return new $t(e.h, e.s, e.l, e.opacity);
  if (e instanceof ns || (e = Yo(e)), !e)
    return new $t();
  if (e instanceof $t)
    return e;
  e = e.rgb();
  var t = e.r / 255, n = e.g / 255, o = e.b / 255, s = Math.min(t, n, o), i = Math.max(t, n, o), r = NaN, l = i - s, a = (i + s) / 2;
  return l ? (t === i ? r = (n - o) / l + (n < o) * 6 : n === i ? r = (o - t) / l + 2 : r = (t - n) / l + 4, l /= a < 0.5 ? i + s : 2 - i - s, r *= 60) : l = a > 0 && a < 1 ? 0 : r, new $t(r, l, a, e.opacity);
}
function Dw(e, t, n, o) {
  return arguments.length === 1 ? Rd(e) : new $t(e, t, n, o ?? 1);
}
function $t(e, t, n, o) {
  this.h = +e, this.s = +t, this.l = +n, this.opacity = +o;
}
ol($t, Dw, Dd(ns, {
  brighter(e) {
    return e = e == null ? Bs : Math.pow(Bs, e), new $t(this.h, this.s, this.l * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? jo : Math.pow(jo, e), new $t(this.h, this.s, this.l * e, this.opacity);
  },
  rgb() {
    var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, n = this.l, o = n + (n < 0.5 ? n : 1 - n) * t, s = 2 * n - o;
    return new mt(
      Bi(e >= 240 ? e - 240 : e + 120, s, o),
      Bi(e, s, o),
      Bi(e < 120 ? e + 240 : e - 120, s, o),
      this.opacity
    );
  },
  clamp() {
    return new $t(Ka(this.h), fs(this.s), fs(this.l), Fs(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = Fs(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${Ka(this.h)}, ${fs(this.s) * 100}%, ${fs(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function Ka(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function fs(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function Bi(e, t, n) {
  return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
const Ad = (e) => () => e;
function Rw(e, t) {
  return function(n) {
    return e + n * t;
  };
}
function Aw(e, t, n) {
  return e = Math.pow(e, n), t = Math.pow(t, n) - e, n = 1 / n, function(o) {
    return Math.pow(e + o * t, n);
  };
}
function Lw(e) {
  return (e = +e) == 1 ? Ld : function(t, n) {
    return n - t ? Aw(t, n, e) : Ad(isNaN(t) ? n : t);
  };
}
function Ld(e, t) {
  var n = t - e;
  return n ? Rw(e, n) : Ad(isNaN(e) ? t : e);
}
const Wa = function e(t) {
  var n = Lw(t);
  function o(s, i) {
    var r = n((s = yr(s)).r, (i = yr(i)).r), l = n(s.g, i.g), a = n(s.b, i.b), c = Ld(s.opacity, i.opacity);
    return function(d) {
      return s.r = r(d), s.g = l(d), s.b = a(d), s.opacity = c(d), s + "";
    };
  }
  return o.gamma = e, o;
}(1);
function dn(e, t) {
  return e = +e, t = +t, function(n) {
    return e * (1 - n) + t * n;
  };
}
var br = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, Fi = new RegExp(br.source, "g");
function Vw(e) {
  return function() {
    return e;
  };
}
function zw(e) {
  return function(t) {
    return e(t) + "";
  };
}
function Bw(e, t) {
  var n = br.lastIndex = Fi.lastIndex = 0, o, s, i, r = -1, l = [], a = [];
  for (e = e + "", t = t + ""; (o = br.exec(e)) && (s = Fi.exec(t)); )
    (i = s.index) > n && (i = t.slice(n, i), l[r] ? l[r] += i : l[++r] = i), (o = o[0]) === (s = s[0]) ? l[r] ? l[r] += s : l[++r] = s : (l[++r] = null, a.push({ i: r, x: dn(o, s) })), n = Fi.lastIndex;
  return n < t.length && (i = t.slice(n), l[r] ? l[r] += i : l[++r] = i), l.length < 2 ? a[0] ? zw(a[0].x) : Vw(t) : (t = a.length, function(c) {
    for (var d = 0, p; d < t; ++d)
      l[(p = a[d]).i] = p.x(c);
    return l.join("");
  });
}
var Za = 180 / Math.PI, _r = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function Vd(e, t, n, o, s, i) {
  var r, l, a;
  return (r = Math.sqrt(e * e + t * t)) && (e /= r, t /= r), (a = e * n + t * o) && (n -= e * a, o -= t * a), (l = Math.sqrt(n * n + o * o)) && (n /= l, o /= l, a /= l), e * o < t * n && (e = -e, t = -t, a = -a, r = -r), {
    translateX: s,
    translateY: i,
    rotate: Math.atan2(t, e) * Za,
    skewX: Math.atan(a) * Za,
    scaleX: r,
    scaleY: l
  };
}
var ps;
function Fw(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? _r : Vd(t.a, t.b, t.c, t.d, t.e, t.f);
}
function Uw(e) {
  return e == null || (ps || (ps = document.createElementNS("http://www.w3.org/2000/svg", "g")), ps.setAttribute("transform", e), !(e = ps.transform.baseVal.consolidate())) ? _r : (e = e.matrix, Vd(e.a, e.b, e.c, e.d, e.e, e.f));
}
function zd(e, t, n, o) {
  function s(c) {
    return c.length ? c.pop() + " " : "";
  }
  function i(c, d, p, v, g, k) {
    if (c !== p || d !== v) {
      var $ = g.push("translate(", null, t, null, n);
      k.push({ i: $ - 4, x: dn(c, p) }, { i: $ - 2, x: dn(d, v) });
    } else (p || v) && g.push("translate(" + p + t + v + n);
  }
  function r(c, d, p, v) {
    c !== d ? (c - d > 180 ? d += 360 : d - c > 180 && (c += 360), v.push({ i: p.push(s(p) + "rotate(", null, o) - 2, x: dn(c, d) })) : d && p.push(s(p) + "rotate(" + d + o);
  }
  function l(c, d, p, v) {
    c !== d ? v.push({ i: p.push(s(p) + "skewX(", null, o) - 2, x: dn(c, d) }) : d && p.push(s(p) + "skewX(" + d + o);
  }
  function a(c, d, p, v, g, k) {
    if (c !== p || d !== v) {
      var $ = g.push(s(g) + "scale(", null, ",", null, ")");
      k.push({ i: $ - 4, x: dn(c, p) }, { i: $ - 2, x: dn(d, v) });
    } else (p !== 1 || v !== 1) && g.push(s(g) + "scale(" + p + "," + v + ")");
  }
  return function(c, d) {
    var p = [], v = [];
    return c = e(c), d = e(d), i(c.translateX, c.translateY, d.translateX, d.translateY, p, v), r(c.rotate, d.rotate, p, v), l(c.skewX, d.skewX, p, v), a(c.scaleX, c.scaleY, d.scaleX, d.scaleY, p, v), c = d = null, function(g) {
      for (var k = -1, $ = v.length, S; ++k < $; )
        p[(S = v[k]).i] = S.x(g);
      return p.join("");
    };
  };
}
var Hw = zd(Fw, "px, ", "px)", "deg)"), jw = zd(Uw, ", ", ")", ")"), Gw = 1e-12;
function Ja(e) {
  return ((e = Math.exp(e)) + 1 / e) / 2;
}
function Yw(e) {
  return ((e = Math.exp(e)) - 1 / e) / 2;
}
function qw(e) {
  return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const Xw = function e(t, n, o) {
  function s(i, r) {
    var l = i[0], a = i[1], c = i[2], d = r[0], p = r[1], v = r[2], g = d - l, k = p - a, $ = g * g + k * k, S, T;
    if ($ < Gw)
      T = Math.log(v / c) / t, S = function(Z) {
        return [
          l + Z * g,
          a + Z * k,
          c * Math.exp(t * Z * T)
        ];
      };
    else {
      var D = Math.sqrt($), m = (v * v - c * c + o * $) / (2 * c * n * D), _ = (v * v - c * c - o * $) / (2 * v * n * D), z = Math.log(Math.sqrt(m * m + 1) - m), U = Math.log(Math.sqrt(_ * _ + 1) - _);
      T = (U - z) / t, S = function(Z) {
        var G = Z * T, P = Ja(z), V = c / (n * D) * (P * qw(t * G + z) - Yw(z));
        return [
          l + V * g,
          a + V * k,
          c * P / Ja(t * G + z)
        ];
      };
    }
    return S.duration = T * 1e3 * t / Math.SQRT2, S;
  }
  return s.rho = function(i) {
    var r = Math.max(1e-3, +i), l = r * r, a = l * l;
    return e(r, l, a);
  }, s;
}(Math.SQRT2, 2, 4);
var co = 0, Co = 0, ko = 0, Bd = 1e3, Us, $o, Hs = 0, Un = 0, di = 0, qo = typeof performance == "object" && performance.now ? performance : Date, Fd = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function sl() {
  return Un || (Fd(Kw), Un = qo.now() + di);
}
function Kw() {
  Un = 0;
}
function js() {
  this._call = this._time = this._next = null;
}
js.prototype = Ud.prototype = {
  constructor: js,
  restart: function(e, t, n) {
    if (typeof e != "function")
      throw new TypeError("callback is not a function");
    n = (n == null ? sl() : +n) + (t == null ? 0 : +t), !this._next && $o !== this && ($o ? $o._next = this : Us = this, $o = this), this._call = e, this._time = n, wr();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, wr());
  }
};
function Ud(e, t, n) {
  var o = new js();
  return o.restart(e, t, n), o;
}
function Ww() {
  sl(), ++co;
  for (var e = Us, t; e; )
    (t = Un - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --co;
}
function Qa() {
  Un = (Hs = qo.now()) + di, co = Co = 0;
  try {
    Ww();
  } finally {
    co = 0, Jw(), Un = 0;
  }
}
function Zw() {
  var e = qo.now(), t = e - Hs;
  t > Bd && (di -= t, Hs = e);
}
function Jw() {
  for (var e, t = Us, n, o = 1 / 0; t; )
    t._call ? (o > t._time && (o = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : Us = n);
  $o = e, wr(o);
}
function wr(e) {
  if (!co) {
    Co && (Co = clearTimeout(Co));
    var t = e - Un;
    t > 24 ? (e < 1 / 0 && (Co = setTimeout(Qa, e - qo.now() - di)), ko && (ko = clearInterval(ko))) : (ko || (Hs = qo.now(), ko = setInterval(Zw, Bd)), co = 1, Fd(Qa));
  }
}
function eu(e, t, n) {
  var o = new js();
  return t = t == null ? 0 : +t, o.restart((s) => {
    o.stop(), e(s + t);
  }, t, n), o;
}
var Qw = ui("start", "end", "cancel", "interrupt"), ek = [], Hd = 0, tu = 1, kr = 2, Cs = 3, nu = 4, Er = 5, $s = 6;
function fi(e, t, n, o, s, i) {
  var r = e.__transition;
  if (!r)
    e.__transition = {};
  else if (n in r)
    return;
  tk(e, n, {
    name: t,
    index: o,
    // For context during callback.
    group: s,
    // For context during callback.
    on: Qw,
    tween: ek,
    time: i.time,
    delay: i.delay,
    duration: i.duration,
    ease: i.ease,
    timer: null,
    state: Hd
  });
}
function il(e, t) {
  var n = Tt(e, t);
  if (n.state > Hd)
    throw new Error("too late; already scheduled");
  return n;
}
function Ft(e, t) {
  var n = Tt(e, t);
  if (n.state > Cs)
    throw new Error("too late; already running");
  return n;
}
function Tt(e, t) {
  var n = e.__transition;
  if (!n || !(n = n[t]))
    throw new Error("transition not found");
  return n;
}
function tk(e, t, n) {
  var o = e.__transition, s;
  o[t] = n, n.timer = Ud(i, 0, n.time);
  function i(c) {
    n.state = tu, n.timer.restart(r, n.delay, n.time), n.delay <= c && r(c - n.delay);
  }
  function r(c) {
    var d, p, v, g;
    if (n.state !== tu)
      return a();
    for (d in o)
      if (g = o[d], g.name === n.name) {
        if (g.state === Cs)
          return eu(r);
        g.state === nu ? (g.state = $s, g.timer.stop(), g.on.call("interrupt", e, e.__data__, g.index, g.group), delete o[d]) : +d < t && (g.state = $s, g.timer.stop(), g.on.call("cancel", e, e.__data__, g.index, g.group), delete o[d]);
      }
    if (eu(function() {
      n.state === Cs && (n.state = nu, n.timer.restart(l, n.delay, n.time), l(c));
    }), n.state = kr, n.on.call("start", e, e.__data__, n.index, n.group), n.state === kr) {
      for (n.state = Cs, s = new Array(v = n.tween.length), d = 0, p = -1; d < v; ++d)
        (g = n.tween[d].value.call(e, e.__data__, n.index, n.group)) && (s[++p] = g);
      s.length = p + 1;
    }
  }
  function l(c) {
    for (var d = c < n.duration ? n.ease.call(null, c / n.duration) : (n.timer.restart(a), n.state = Er, 1), p = -1, v = s.length; ++p < v; )
      s[p].call(e, d);
    n.state === Er && (n.on.call("end", e, e.__data__, n.index, n.group), a());
  }
  function a() {
    n.state = $s, n.timer.stop(), delete o[t];
    for (var c in o)
      return;
    delete e.__transition;
  }
}
function Ns(e, t) {
  var n = e.__transition, o, s, i = !0, r;
  if (n) {
    t = t == null ? null : t + "";
    for (r in n) {
      if ((o = n[r]).name !== t) {
        i = !1;
        continue;
      }
      s = o.state > kr && o.state < Er, o.state = $s, o.timer.stop(), o.on.call(s ? "interrupt" : "cancel", e, e.__data__, o.index, o.group), delete n[r];
    }
    i && delete e.__transition;
  }
}
function nk(e) {
  return this.each(function() {
    Ns(this, e);
  });
}
function ok(e, t) {
  var n, o;
  return function() {
    var s = Ft(this, e), i = s.tween;
    if (i !== n) {
      o = n = i;
      for (var r = 0, l = o.length; r < l; ++r)
        if (o[r].name === t) {
          o = o.slice(), o.splice(r, 1);
          break;
        }
    }
    s.tween = o;
  };
}
function sk(e, t, n) {
  var o, s;
  if (typeof n != "function")
    throw new Error();
  return function() {
    var i = Ft(this, e), r = i.tween;
    if (r !== o) {
      s = (o = r).slice();
      for (var l = { name: t, value: n }, a = 0, c = s.length; a < c; ++a)
        if (s[a].name === t) {
          s[a] = l;
          break;
        }
      a === c && s.push(l);
    }
    i.tween = s;
  };
}
function ik(e, t) {
  var n = this._id;
  if (e += "", arguments.length < 2) {
    for (var o = Tt(this.node(), n).tween, s = 0, i = o.length, r; s < i; ++s)
      if ((r = o[s]).name === e)
        return r.value;
    return null;
  }
  return this.each((t == null ? ok : sk)(n, e, t));
}
function rl(e, t, n) {
  var o = e._id;
  return e.each(function() {
    var s = Ft(this, o);
    (s.value || (s.value = {}))[t] = n.apply(this, arguments);
  }), function(s) {
    return Tt(s, o).value[t];
  };
}
function jd(e, t) {
  var n;
  return (typeof t == "number" ? dn : t instanceof Yo ? Wa : (n = Yo(t)) ? (t = n, Wa) : Bw)(e, t);
}
function rk(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function lk(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function ak(e, t, n) {
  var o, s = n + "", i;
  return function() {
    var r = this.getAttribute(e);
    return r === s ? null : r === o ? i : i = t(o = r, n);
  };
}
function uk(e, t, n) {
  var o, s = n + "", i;
  return function() {
    var r = this.getAttributeNS(e.space, e.local);
    return r === s ? null : r === o ? i : i = t(o = r, n);
  };
}
function ck(e, t, n) {
  var o, s, i;
  return function() {
    var r, l = n(this), a;
    return l == null ? void this.removeAttribute(e) : (r = this.getAttribute(e), a = l + "", r === a ? null : r === o && a === s ? i : (s = a, i = t(o = r, l)));
  };
}
function dk(e, t, n) {
  var o, s, i;
  return function() {
    var r, l = n(this), a;
    return l == null ? void this.removeAttributeNS(e.space, e.local) : (r = this.getAttributeNS(e.space, e.local), a = l + "", r === a ? null : r === o && a === s ? i : (s = a, i = t(o = r, l)));
  };
}
function fk(e, t) {
  var n = ci(e), o = n === "transform" ? jw : jd;
  return this.attrTween(e, typeof t == "function" ? (n.local ? dk : ck)(n, o, rl(this, "attr." + e, t)) : t == null ? (n.local ? lk : rk)(n) : (n.local ? uk : ak)(n, o, t));
}
function pk(e, t) {
  return function(n) {
    this.setAttribute(e, t.call(this, n));
  };
}
function hk(e, t) {
  return function(n) {
    this.setAttributeNS(e.space, e.local, t.call(this, n));
  };
}
function vk(e, t) {
  var n, o;
  function s() {
    var i = t.apply(this, arguments);
    return i !== o && (n = (o = i) && hk(e, i)), n;
  }
  return s._value = t, s;
}
function gk(e, t) {
  var n, o;
  function s() {
    var i = t.apply(this, arguments);
    return i !== o && (n = (o = i) && pk(e, i)), n;
  }
  return s._value = t, s;
}
function mk(e, t) {
  var n = "attr." + e;
  if (arguments.length < 2)
    return (n = this.tween(n)) && n._value;
  if (t == null)
    return this.tween(n, null);
  if (typeof t != "function")
    throw new Error();
  var o = ci(e);
  return this.tween(n, (o.local ? vk : gk)(o, t));
}
function yk(e, t) {
  return function() {
    il(this, e).delay = +t.apply(this, arguments);
  };
}
function bk(e, t) {
  return t = +t, function() {
    il(this, e).delay = t;
  };
}
function _k(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? yk : bk)(t, e)) : Tt(this.node(), t).delay;
}
function wk(e, t) {
  return function() {
    Ft(this, e).duration = +t.apply(this, arguments);
  };
}
function kk(e, t) {
  return t = +t, function() {
    Ft(this, e).duration = t;
  };
}
function Ek(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? wk : kk)(t, e)) : Tt(this.node(), t).duration;
}
function xk(e, t) {
  if (typeof t != "function")
    throw new Error();
  return function() {
    Ft(this, e).ease = t;
  };
}
function Sk(e) {
  var t = this._id;
  return arguments.length ? this.each(xk(t, e)) : Tt(this.node(), t).ease;
}
function Ck(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    if (typeof n != "function")
      throw new Error();
    Ft(this, e).ease = n;
  };
}
function $k(e) {
  if (typeof e != "function")
    throw new Error();
  return this.each(Ck(this._id, e));
}
function Nk(e) {
  typeof e != "function" && (e = kd(e));
  for (var t = this._groups, n = t.length, o = new Array(n), s = 0; s < n; ++s)
    for (var i = t[s], r = i.length, l = o[s] = [], a, c = 0; c < r; ++c)
      (a = i[c]) && e.call(a, a.__data__, c, i) && l.push(a);
  return new nn(o, this._parents, this._name, this._id);
}
function Ik(e) {
  if (e._id !== this._id)
    throw new Error();
  for (var t = this._groups, n = e._groups, o = t.length, s = n.length, i = Math.min(o, s), r = new Array(o), l = 0; l < i; ++l)
    for (var a = t[l], c = n[l], d = a.length, p = r[l] = new Array(d), v, g = 0; g < d; ++g)
      (v = a[g] || c[g]) && (p[g] = v);
  for (; l < o; ++l)
    r[l] = t[l];
  return new nn(r, this._parents, this._name, this._id);
}
function Mk(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var n = t.indexOf(".");
    return n >= 0 && (t = t.slice(0, n)), !t || t === "start";
  });
}
function Ok(e, t, n) {
  var o, s, i = Mk(t) ? il : Ft;
  return function() {
    var r = i(this, e), l = r.on;
    l !== o && (s = (o = l).copy()).on(t, n), r.on = s;
  };
}
function Tk(e, t) {
  var n = this._id;
  return arguments.length < 2 ? Tt(this.node(), n).on.on(e) : this.each(Ok(n, e, t));
}
function Pk(e) {
  return function() {
    var t = this.parentNode;
    for (var n in this.__transition)
      if (+n !== e)
        return;
    t && t.removeChild(this);
  };
}
function Dk() {
  return this.on("end.remove", Pk(this._id));
}
function Rk(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = tl(e));
  for (var o = this._groups, s = o.length, i = new Array(s), r = 0; r < s; ++r)
    for (var l = o[r], a = l.length, c = i[r] = new Array(a), d, p, v = 0; v < a; ++v)
      (d = l[v]) && (p = e.call(d, d.__data__, v, l)) && ("__data__" in d && (p.__data__ = d.__data__), c[v] = p, fi(c[v], t, n, v, c, Tt(d, n)));
  return new nn(i, this._parents, t, n);
}
function Ak(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = wd(e));
  for (var o = this._groups, s = o.length, i = [], r = [], l = 0; l < s; ++l)
    for (var a = o[l], c = a.length, d, p = 0; p < c; ++p)
      if (d = a[p]) {
        for (var v = e.call(d, d.__data__, p, a), g, k = Tt(d, n), $ = 0, S = v.length; $ < S; ++$)
          (g = v[$]) && fi(g, t, n, $, v, k);
        i.push(v), r.push(d);
      }
  return new nn(i, r, t, n);
}
var Lk = ts.prototype.constructor;
function Vk() {
  return new Lk(this._groups, this._parents);
}
function zk(e, t) {
  var n, o, s;
  return function() {
    var i = uo(this, e), r = (this.style.removeProperty(e), uo(this, e));
    return i === r ? null : i === n && r === o ? s : s = t(n = i, o = r);
  };
}
function Gd(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function Bk(e, t, n) {
  var o, s = n + "", i;
  return function() {
    var r = uo(this, e);
    return r === s ? null : r === o ? i : i = t(o = r, n);
  };
}
function Fk(e, t, n) {
  var o, s, i;
  return function() {
    var r = uo(this, e), l = n(this), a = l + "";
    return l == null && (a = l = (this.style.removeProperty(e), uo(this, e))), r === a ? null : r === o && a === s ? i : (s = a, i = t(o = r, l));
  };
}
function Uk(e, t) {
  var n, o, s, i = "style." + t, r = "end." + i, l;
  return function() {
    var a = Ft(this, e), c = a.on, d = a.value[i] == null ? l || (l = Gd(t)) : void 0;
    (c !== n || s !== d) && (o = (n = c).copy()).on(r, s = d), a.on = o;
  };
}
function Hk(e, t, n) {
  var o = (e += "") == "transform" ? Hw : jd;
  return t == null ? this.styleTween(e, zk(e, o)).on("end.style." + e, Gd(e)) : typeof t == "function" ? this.styleTween(e, Fk(e, o, rl(this, "style." + e, t))).each(Uk(this._id, e)) : this.styleTween(e, Bk(e, o, t), n).on("end.style." + e, null);
}
function jk(e, t, n) {
  return function(o) {
    this.style.setProperty(e, t.call(this, o), n);
  };
}
function Gk(e, t, n) {
  var o, s;
  function i() {
    var r = t.apply(this, arguments);
    return r !== s && (o = (s = r) && jk(e, r, n)), o;
  }
  return i._value = t, i;
}
function Yk(e, t, n) {
  var o = "style." + (e += "");
  if (arguments.length < 2)
    return (o = this.tween(o)) && o._value;
  if (t == null)
    return this.tween(o, null);
  if (typeof t != "function")
    throw new Error();
  return this.tween(o, Gk(e, t, n ?? ""));
}
function qk(e) {
  return function() {
    this.textContent = e;
  };
}
function Xk(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function Kk(e) {
  return this.tween("text", typeof e == "function" ? Xk(rl(this, "text", e)) : qk(e == null ? "" : e + ""));
}
function Wk(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function Zk(e) {
  var t, n;
  function o() {
    var s = e.apply(this, arguments);
    return s !== n && (t = (n = s) && Wk(s)), t;
  }
  return o._value = e, o;
}
function Jk(e) {
  var t = "text";
  if (arguments.length < 1)
    return (t = this.tween(t)) && t._value;
  if (e == null)
    return this.tween(t, null);
  if (typeof e != "function")
    throw new Error();
  return this.tween(t, Zk(e));
}
function Qk() {
  for (var e = this._name, t = this._id, n = Yd(), o = this._groups, s = o.length, i = 0; i < s; ++i)
    for (var r = o[i], l = r.length, a, c = 0; c < l; ++c)
      if (a = r[c]) {
        var d = Tt(a, t);
        fi(a, e, n, c, r, {
          time: d.time + d.delay + d.duration,
          delay: 0,
          duration: d.duration,
          ease: d.ease
        });
      }
  return new nn(o, this._parents, e, n);
}
function e2() {
  var e, t, n = this, o = n._id, s = n.size();
  return new Promise(function(i, r) {
    var l = { value: r }, a = { value: function() {
      --s === 0 && i();
    } };
    n.each(function() {
      var c = Ft(this, o), d = c.on;
      d !== e && (t = (e = d).copy(), t._.cancel.push(l), t._.interrupt.push(l), t._.end.push(a)), c.on = t;
    }), s === 0 && i();
  });
}
var t2 = 0;
function nn(e, t, n, o) {
  this._groups = e, this._parents = t, this._name = n, this._id = o;
}
function Yd() {
  return ++t2;
}
var Ht = ts.prototype;
nn.prototype = {
  constructor: nn,
  select: Rk,
  selectAll: Ak,
  selectChild: Ht.selectChild,
  selectChildren: Ht.selectChildren,
  filter: Nk,
  merge: Ik,
  selection: Vk,
  transition: Qk,
  call: Ht.call,
  nodes: Ht.nodes,
  node: Ht.node,
  size: Ht.size,
  empty: Ht.empty,
  each: Ht.each,
  on: Tk,
  attr: fk,
  attrTween: mk,
  style: Hk,
  styleTween: Yk,
  text: Kk,
  textTween: Jk,
  remove: Dk,
  tween: ik,
  delay: _k,
  duration: Ek,
  ease: Sk,
  easeVarying: $k,
  end: e2,
  [Symbol.iterator]: Ht[Symbol.iterator]
};
function n2(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var o2 = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: n2
};
function s2(e, t) {
  for (var n; !(n = e.__transition) || !(n = n[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return n;
}
function i2(e) {
  var t, n;
  e instanceof nn ? (t = e._id, e = e._name) : (t = Yd(), (n = o2).time = sl(), e = e == null ? null : e + "");
  for (var o = this._groups, s = o.length, i = 0; i < s; ++i)
    for (var r = o[i], l = r.length, a, c = 0; c < l; ++c)
      (a = r[c]) && fi(a, e, t, c, r, n || s2(a, t));
  return new nn(o, this._parents, e, t);
}
ts.prototype.interrupt = nk;
ts.prototype.transition = i2;
const hs = (e) => () => e;
function r2(e, {
  sourceEvent: t,
  target: n,
  transform: o,
  dispatch: s
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    target: { value: n, enumerable: !0, configurable: !0 },
    transform: { value: o, enumerable: !0, configurable: !0 },
    _: { value: s }
  });
}
function Wt(e, t, n) {
  this.k = e, this.x = t, this.y = n;
}
Wt.prototype = {
  constructor: Wt,
  scale: function(e) {
    return e === 1 ? this : new Wt(this.k * e, this.x, this.y);
  },
  translate: function(e, t) {
    return e === 0 & t === 0 ? this : new Wt(this.k, this.x + this.k * e, this.y + this.k * t);
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
var fo = new Wt(1, 0, 0);
Wt.prototype;
function Ui(e) {
  e.stopImmediatePropagation();
}
function Eo(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function l2(e) {
  return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function a2() {
  var e = this;
  return e instanceof SVGElement ? (e = e.ownerSVGElement || e, e.hasAttribute("viewBox") ? (e = e.viewBox.baseVal, [[e.x, e.y], [e.x + e.width, e.y + e.height]]) : [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]) : [[0, 0], [e.clientWidth, e.clientHeight]];
}
function ou() {
  return this.__zoom || fo;
}
function u2(e) {
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * (e.ctrlKey ? 10 : 1);
}
function c2() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function d2(e, t, n) {
  var o = e.invertX(t[0][0]) - n[0][0], s = e.invertX(t[1][0]) - n[1][0], i = e.invertY(t[0][1]) - n[0][1], r = e.invertY(t[1][1]) - n[1][1];
  return e.translate(
    s > o ? (o + s) / 2 : Math.min(0, o) || Math.max(0, s),
    r > i ? (i + r) / 2 : Math.min(0, i) || Math.max(0, r)
  );
}
function f2() {
  var e = l2, t = a2, n = d2, o = u2, s = c2, i = [0, 1 / 0], r = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], l = 250, a = Xw, c = ui("start", "zoom", "end"), d, p, v, g = 500, k = 150, $ = 0, S = 10;
  function T(C) {
    C.property("__zoom", ou).on("wheel.zoom", G, { passive: !1 }).on("mousedown.zoom", P).on("dblclick.zoom", V).filter(s).on("touchstart.zoom", Y).on("touchmove.zoom", H).on("touchend.zoom touchcancel.zoom", J).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  T.transform = function(C, A, M, R) {
    var j = C.selection ? C.selection() : C;
    j.property("__zoom", ou), C !== j ? z(C, A, M, R) : j.interrupt().each(function() {
      U(this, arguments).event(R).start().zoom(null, typeof A == "function" ? A.apply(this, arguments) : A).end();
    });
  }, T.scaleBy = function(C, A, M, R) {
    T.scaleTo(C, function() {
      var j = this.__zoom.k, ne = typeof A == "function" ? A.apply(this, arguments) : A;
      return j * ne;
    }, M, R);
  }, T.scaleTo = function(C, A, M, R) {
    T.transform(C, function() {
      var j = t.apply(this, arguments), ne = this.__zoom, le = M == null ? _(j) : typeof M == "function" ? M.apply(this, arguments) : M, fe = ne.invert(le), se = typeof A == "function" ? A.apply(this, arguments) : A;
      return n(m(D(ne, se), le, fe), j, r);
    }, M, R);
  }, T.translateBy = function(C, A, M, R) {
    T.transform(C, function() {
      return n(this.__zoom.translate(
        typeof A == "function" ? A.apply(this, arguments) : A,
        typeof M == "function" ? M.apply(this, arguments) : M
      ), t.apply(this, arguments), r);
    }, null, R);
  }, T.translateTo = function(C, A, M, R, j) {
    T.transform(C, function() {
      var ne = t.apply(this, arguments), le = this.__zoom, fe = R == null ? _(ne) : typeof R == "function" ? R.apply(this, arguments) : R;
      return n(fo.translate(fe[0], fe[1]).scale(le.k).translate(
        typeof A == "function" ? -A.apply(this, arguments) : -A,
        typeof M == "function" ? -M.apply(this, arguments) : -M
      ), ne, r);
    }, R, j);
  };
  function D(C, A) {
    return A = Math.max(i[0], Math.min(i[1], A)), A === C.k ? C : new Wt(A, C.x, C.y);
  }
  function m(C, A, M) {
    var R = A[0] - M[0] * C.k, j = A[1] - M[1] * C.k;
    return R === C.x && j === C.y ? C : new Wt(C.k, R, j);
  }
  function _(C) {
    return [(+C[0][0] + +C[1][0]) / 2, (+C[0][1] + +C[1][1]) / 2];
  }
  function z(C, A, M, R) {
    C.on("start.zoom", function() {
      U(this, arguments).event(R).start();
    }).on("interrupt.zoom end.zoom", function() {
      U(this, arguments).event(R).end();
    }).tween("zoom", function() {
      var j = this, ne = arguments, le = U(j, ne).event(R), fe = t.apply(j, ne), se = M == null ? _(fe) : typeof M == "function" ? M.apply(j, ne) : M, ce = Math.max(fe[1][0] - fe[0][0], fe[1][1] - fe[0][1]), ue = j.__zoom, ge = typeof A == "function" ? A.apply(j, ne) : A, te = a(ue.invert(se).concat(ce / ue.k), ge.invert(se).concat(ce / ge.k));
      return function(we) {
        if (we === 1)
          we = ge;
        else {
          var xe = te(we), _e = ce / xe[2];
          we = new Wt(_e, se[0] - xe[0] * _e, se[1] - xe[1] * _e);
        }
        le.zoom(null, we);
      };
    });
  }
  function U(C, A, M) {
    return !M && C.__zooming || new Z(C, A);
  }
  function Z(C, A) {
    this.that = C, this.args = A, this.active = 0, this.sourceEvent = null, this.extent = t.apply(C, A), this.taps = 0;
  }
  Z.prototype = {
    event: function(C) {
      return C && (this.sourceEvent = C), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(C, A) {
      return this.mouse && C !== "mouse" && (this.mouse[1] = A.invert(this.mouse[0])), this.touch0 && C !== "touch" && (this.touch0[1] = A.invert(this.touch0[0])), this.touch1 && C !== "touch" && (this.touch1[1] = A.invert(this.touch1[0])), this.that.__zoom = A, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(C) {
      var A = Ct(this.that).datum();
      c.call(
        C,
        this.that,
        new r2(C, {
          sourceEvent: this.sourceEvent,
          target: T,
          transform: this.that.__zoom,
          dispatch: c
        }),
        A
      );
    }
  };
  function G(C, ...A) {
    if (!e.apply(this, arguments))
      return;
    var M = U(this, A).event(C), R = this.__zoom, j = Math.max(i[0], Math.min(i[1], R.k * Math.pow(2, o.apply(this, arguments)))), ne = Rt(C);
    if (M.wheel)
      (M.mouse[0][0] !== ne[0] || M.mouse[0][1] !== ne[1]) && (M.mouse[1] = R.invert(M.mouse[0] = ne)), clearTimeout(M.wheel);
    else {
      if (R.k === j)
        return;
      M.mouse = [ne, R.invert(ne)], Ns(this), M.start();
    }
    Eo(C), M.wheel = setTimeout(le, k), M.zoom("mouse", n(m(D(R, j), M.mouse[0], M.mouse[1]), M.extent, r));
    function le() {
      M.wheel = null, M.end();
    }
  }
  function P(C, ...A) {
    if (v || !e.apply(this, arguments))
      return;
    var M = C.currentTarget, R = U(this, A, !0).event(C), j = Ct(C.view).on("mousemove.zoom", se, !0).on("mouseup.zoom", ce, !0), ne = Rt(C, M), le = C.clientX, fe = C.clientY;
    Td(C.view), Ui(C), R.mouse = [ne, this.__zoom.invert(ne)], Ns(this), R.start();
    function se(ue) {
      if (Eo(ue), !R.moved) {
        var ge = ue.clientX - le, te = ue.clientY - fe;
        R.moved = ge * ge + te * te > $;
      }
      R.event(ue).zoom("mouse", n(m(R.that.__zoom, R.mouse[0] = Rt(ue, M), R.mouse[1]), R.extent, r));
    }
    function ce(ue) {
      j.on("mousemove.zoom mouseup.zoom", null), Pd(ue.view, R.moved), Eo(ue), R.event(ue).end();
    }
  }
  function V(C, ...A) {
    if (e.apply(this, arguments)) {
      var M = this.__zoom, R = Rt(C.changedTouches ? C.changedTouches[0] : C, this), j = M.invert(R), ne = M.k * (C.shiftKey ? 0.5 : 2), le = n(m(D(M, ne), R, j), t.apply(this, A), r);
      Eo(C), l > 0 ? Ct(this).transition().duration(l).call(z, le, R, C) : Ct(this).call(T.transform, le, R, C);
    }
  }
  function Y(C, ...A) {
    if (e.apply(this, arguments)) {
      var M = C.touches, R = M.length, j = U(this, A, C.changedTouches.length === R).event(C), ne, le, fe, se;
      for (Ui(C), le = 0; le < R; ++le)
        fe = M[le], se = Rt(fe, this), se = [se, this.__zoom.invert(se), fe.identifier], j.touch0 ? !j.touch1 && j.touch0[2] !== se[2] && (j.touch1 = se, j.taps = 0) : (j.touch0 = se, ne = !0, j.taps = 1 + !!d);
      d && (d = clearTimeout(d)), ne && (j.taps < 2 && (p = se[0], d = setTimeout(function() {
        d = null;
      }, g)), Ns(this), j.start());
    }
  }
  function H(C, ...A) {
    if (this.__zooming) {
      var M = U(this, A).event(C), R = C.changedTouches, j = R.length, ne, le, fe, se;
      for (Eo(C), ne = 0; ne < j; ++ne)
        le = R[ne], fe = Rt(le, this), M.touch0 && M.touch0[2] === le.identifier ? M.touch0[0] = fe : M.touch1 && M.touch1[2] === le.identifier && (M.touch1[0] = fe);
      if (le = M.that.__zoom, M.touch1) {
        var ce = M.touch0[0], ue = M.touch0[1], ge = M.touch1[0], te = M.touch1[1], we = (we = ge[0] - ce[0]) * we + (we = ge[1] - ce[1]) * we, xe = (xe = te[0] - ue[0]) * xe + (xe = te[1] - ue[1]) * xe;
        le = D(le, Math.sqrt(we / xe)), fe = [(ce[0] + ge[0]) / 2, (ce[1] + ge[1]) / 2], se = [(ue[0] + te[0]) / 2, (ue[1] + te[1]) / 2];
      } else if (M.touch0)
        fe = M.touch0[0], se = M.touch0[1];
      else
        return;
      M.zoom("touch", n(m(le, fe, se), M.extent, r));
    }
  }
  function J(C, ...A) {
    if (this.__zooming) {
      var M = U(this, A).event(C), R = C.changedTouches, j = R.length, ne, le;
      for (Ui(C), v && clearTimeout(v), v = setTimeout(function() {
        v = null;
      }, g), ne = 0; ne < j; ++ne)
        le = R[ne], M.touch0 && M.touch0[2] === le.identifier ? delete M.touch0 : M.touch1 && M.touch1[2] === le.identifier && delete M.touch1;
      if (M.touch1 && !M.touch0 && (M.touch0 = M.touch1, delete M.touch1), M.touch0)
        M.touch0[1] = this.__zoom.invert(M.touch0[0]);
      else if (M.end(), M.taps === 2 && (le = Rt(le, this), Math.hypot(p[0] - le[0], p[1] - le[1]) < S)) {
        var fe = Ct(this).on("dblclick.zoom");
        fe && fe.apply(this, arguments);
      }
    }
  }
  return T.wheelDelta = function(C) {
    return arguments.length ? (o = typeof C == "function" ? C : hs(+C), T) : o;
  }, T.filter = function(C) {
    return arguments.length ? (e = typeof C == "function" ? C : hs(!!C), T) : e;
  }, T.touchable = function(C) {
    return arguments.length ? (s = typeof C == "function" ? C : hs(!!C), T) : s;
  }, T.extent = function(C) {
    return arguments.length ? (t = typeof C == "function" ? C : hs([[+C[0][0], +C[0][1]], [+C[1][0], +C[1][1]]]), T) : t;
  }, T.scaleExtent = function(C) {
    return arguments.length ? (i[0] = +C[0], i[1] = +C[1], T) : [i[0], i[1]];
  }, T.translateExtent = function(C) {
    return arguments.length ? (r[0][0] = +C[0][0], r[1][0] = +C[1][0], r[0][1] = +C[0][1], r[1][1] = +C[1][1], T) : [[r[0][0], r[0][1]], [r[1][0], r[1][1]]];
  }, T.constrain = function(C) {
    return arguments.length ? (n = C, T) : n;
  }, T.duration = function(C) {
    return arguments.length ? (l = +C, T) : l;
  }, T.interpolate = function(C) {
    return arguments.length ? (a = C, T) : a;
  }, T.on = function() {
    var C = c.on.apply(c, arguments);
    return C === c ? T : C;
  }, T.clickDistance = function(C) {
    return arguments.length ? ($ = (C = +C) * C, T) : Math.sqrt($);
  }, T.tapDistance = function(C) {
    return arguments.length ? (S = +C, T) : S;
  }, T;
}
var ye = /* @__PURE__ */ ((e) => (e.Left = "left", e.Top = "top", e.Right = "right", e.Bottom = "bottom", e))(ye || {}), ll = /* @__PURE__ */ ((e) => (e.Partial = "partial", e.Full = "full", e))(ll || {}), On = /* @__PURE__ */ ((e) => (e.Bezier = "default", e.SimpleBezier = "simple-bezier", e.Straight = "straight", e.Step = "step", e.SmoothStep = "smoothstep", e))(On || {}), Hn = /* @__PURE__ */ ((e) => (e.Strict = "strict", e.Loose = "loose", e))(Hn || {}), xr = /* @__PURE__ */ ((e) => (e.Arrow = "arrow", e.ArrowClosed = "arrowclosed", e))(xr || {}), Ro = /* @__PURE__ */ ((e) => (e.Free = "free", e.Vertical = "vertical", e.Horizontal = "horizontal", e))(Ro || {});
function Sr(e) {
  var t, n;
  const o = ((n = (t = e.composedPath) == null ? void 0 : t.call(e)) == null ? void 0 : n[0]) || e.target, s = typeof (o == null ? void 0 : o.hasAttribute) == "function" ? o.hasAttribute("contenteditable") : !1, i = typeof (o == null ? void 0 : o.closest) == "function" ? o.closest(".nokey") : null;
  return ["INPUT", "SELECT", "TEXTAREA"].includes(o == null ? void 0 : o.nodeName) || s || !!i;
}
function p2(e) {
  return e.ctrlKey || e.metaKey || e.shiftKey;
}
function su(e, t, n, o) {
  const s = t.replace("+", `
`).replace(`

`, `
+`).split(`
`).map((r) => r.trim().toLowerCase());
  if (s.length === 1)
    return e.toLowerCase() === t.toLowerCase();
  o || n.add(e.toLowerCase());
  const i = s.every(
    (r, l) => n.has(r) && Array.from(n.values())[l] === s[l]
  );
  return o && n.delete(e.toLowerCase()), i;
}
function h2(e, t) {
  return (n) => {
    if (!n.code && !n.key)
      return !1;
    const o = v2(n.code, e);
    return Array.isArray(e) ? e.some((s) => su(n[o], s, t, n.type === "keyup")) : su(n[o], e, t, n.type === "keyup");
  };
}
function v2(e, t) {
  return t.includes(e) ? "code" : "key";
}
function Ao(e, t) {
  const n = Ue(() => Pe(t == null ? void 0 : t.actInsideInputWithModifier) ?? !1), o = Ue(() => Pe(t == null ? void 0 : t.target) ?? window), s = ee(Pe(e) === !0);
  let i = !1;
  const r = /* @__PURE__ */ new Set();
  let l = c(Pe(e));
  Ne(
    () => Pe(e),
    (d, p) => {
      typeof p == "boolean" && typeof d != "boolean" && a(), l = c(d);
    },
    {
      immediate: !0
    }
  ), bd(["blur", "contextmenu"], a), za(
    (...d) => l(...d),
    (d) => {
      i = p2(d), !((!i || i && !n.value) && Sr(d)) && (d.preventDefault(), s.value = !0);
    },
    { eventName: "keydown", target: o }
  ), za(
    (...d) => l(...d),
    (d) => {
      if (s.value) {
        if ((!i || i && !n.value) && Sr(d))
          return;
        i = !1, s.value = !1;
      }
    },
    { eventName: "keyup", target: o }
  );
  function a() {
    i = !1, r.clear(), s.value = Pe(e) === !0;
  }
  function c(d) {
    return d === null ? (a(), () => !1) : typeof d == "boolean" ? (a(), s.value = d, () => !1) : Array.isArray(d) || typeof d == "string" ? h2(d, r) : d;
  }
  return s;
}
const qd = "vue-flow__node-desc", Xd = "vue-flow__edge-desc", g2 = "vue-flow__aria-live", Kd = ["Enter", " ", "Escape"], so = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};
function Cr(e) {
  return {
    ...e.computedPosition || { x: 0, y: 0 },
    width: e.dimensions.width || 0,
    height: e.dimensions.height || 0
  };
}
function $r(e, t) {
  const n = Math.max(0, Math.min(e.x + e.width, t.x + t.width) - Math.max(e.x, t.x)), o = Math.max(0, Math.min(e.y + e.height, t.y + t.height) - Math.max(e.y, t.y));
  return Math.ceil(n * o);
}
function pi(e) {
  return {
    width: e.offsetWidth,
    height: e.offsetHeight
  };
}
function jn(e, t = 0, n = 1) {
  return Math.min(Math.max(e, t), n);
}
function Wd(e, t) {
  return {
    x: jn(e.x, t[0][0], t[1][0]),
    y: jn(e.y, t[0][1], t[1][1])
  };
}
function iu(e) {
  const t = e.getRootNode();
  return "elementFromPoint" in t ? t : window.document;
}
function En(e) {
  return e && typeof e == "object" && "id" in e && "source" in e && "target" in e;
}
function Vn(e) {
  return e && typeof e == "object" && "id" in e && "position" in e && !En(e);
}
function No(e) {
  return Vn(e) && "computedPosition" in e;
}
function vs(e) {
  return !Number.isNaN(e) && Number.isFinite(e);
}
function m2(e) {
  return vs(e.width) && vs(e.height) && vs(e.x) && vs(e.y);
}
function y2(e, t, n) {
  const o = {
    id: e.id.toString(),
    type: e.type ?? "default",
    dimensions: An({
      width: 0,
      height: 0
    }),
    computedPosition: An({
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
    data: Ke(e.data) ? e.data : {},
    events: An(Ke(e.events) ? e.events : {})
  };
  return Object.assign(t ?? o, e, { id: e.id.toString(), parentNode: n });
}
function Zd(e, t, n) {
  var o, s;
  const i = {
    id: e.id.toString(),
    type: e.type ?? (t == null ? void 0 : t.type) ?? "default",
    source: e.source.toString(),
    target: e.target.toString(),
    sourceHandle: (o = e.sourceHandle) == null ? void 0 : o.toString(),
    targetHandle: (s = e.targetHandle) == null ? void 0 : s.toString(),
    updatable: e.updatable ?? (n == null ? void 0 : n.updatable),
    selectable: e.selectable ?? (n == null ? void 0 : n.selectable),
    focusable: e.focusable ?? (n == null ? void 0 : n.focusable),
    data: Ke(e.data) ? e.data : {},
    events: An(Ke(e.events) ? e.events : {}),
    label: e.label ?? "",
    interactionWidth: e.interactionWidth ?? (n == null ? void 0 : n.interactionWidth),
    ...n ?? {}
  };
  return Object.assign(t ?? i, e, { id: e.id.toString() });
}
function Jd(e, t, n, o) {
  const s = typeof e == "string" ? e : e.id, i = /* @__PURE__ */ new Set(), r = o === "source" ? "target" : "source";
  for (const l of n)
    l[r] === s && i.add(l[o]);
  return t.filter((l) => i.has(l.id));
}
function b2(...e) {
  if (e.length === 3) {
    const [i, r, l] = e;
    return Jd(i, r, l, "target");
  }
  const [t, n] = e, o = typeof t == "string" ? t : t.id;
  return n.filter((i) => En(i) && i.source === o).map((i) => n.find((r) => Vn(r) && r.id === i.target));
}
function _2(...e) {
  if (e.length === 3) {
    const [i, r, l] = e;
    return Jd(i, r, l, "source");
  }
  const [t, n] = e, o = typeof t == "string" ? t : t.id;
  return n.filter((i) => En(i) && i.target === o).map((i) => n.find((r) => Vn(r) && r.id === i.source));
}
function Qd({ source: e, sourceHandle: t, target: n, targetHandle: o }) {
  return `vueflow__edge-${e}${t ?? ""}-${n}${o ?? ""}`;
}
function w2(e, t) {
  return t.some(
    (n) => En(n) && n.source === e.source && n.target === e.target && (n.sourceHandle === e.sourceHandle || !n.sourceHandle && !e.sourceHandle) && (n.targetHandle === e.targetHandle || !n.targetHandle && !e.targetHandle)
  );
}
function ef({ x: e, y: t }, { x: n, y: o, zoom: s }) {
  return {
    x: e * s + n,
    y: t * s + o
  };
}
function Xo({ x: e, y: t }, { x: n, y: o, zoom: s }, i = !1, r = [1, 1]) {
  const l = {
    x: (e - n) / s,
    y: (t - o) / s
  };
  return i ? hi(l, r) : l;
}
function k2(e, t) {
  return {
    x: Math.min(e.x, t.x),
    y: Math.min(e.y, t.y),
    x2: Math.max(e.x2, t.x2),
    y2: Math.max(e.y2, t.y2)
  };
}
function tf({ x: e, y: t, width: n, height: o }) {
  return {
    x: e,
    y: t,
    x2: e + n,
    y2: t + o
  };
}
function E2({ x: e, y: t, x2: n, y2: o }) {
  return {
    x: e,
    y: t,
    width: n - e,
    height: o - t
  };
}
function nf(e) {
  let t = {
    x: Number.POSITIVE_INFINITY,
    y: Number.POSITIVE_INFINITY,
    x2: Number.NEGATIVE_INFINITY,
    y2: Number.NEGATIVE_INFINITY
  };
  for (let n = 0; n < e.length; n++) {
    const o = e[n];
    t = k2(
      t,
      tf({
        ...o.computedPosition,
        ...o.dimensions
      })
    );
  }
  return E2(t);
}
function of(e, t, n = { x: 0, y: 0, zoom: 1 }, o = !1, s = !1) {
  const i = {
    ...Xo(t, n),
    width: t.width / n.zoom,
    height: t.height / n.zoom
  }, r = [];
  for (const l of e) {
    const { dimensions: a, selectable: c = !0, hidden: d = !1 } = l, p = a.width ?? l.width ?? null, v = a.height ?? l.height ?? null;
    if (s && !c || d)
      continue;
    const g = $r(i, Cr(l)), k = p === null || v === null, $ = o && g > 0, S = (p ?? 0) * (v ?? 0);
    (k || $ || g >= S || l.dragging) && r.push(l);
  }
  return r;
}
function sf(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (typeof e == "string")
    n.add(e);
  else if (e.length >= 1)
    for (const o of e)
      n.add(o.id);
  return t.filter((o) => n.has(o.source) || n.has(o.target));
}
function ru(e, t, n, o, s, i = 0.1, r = { x: 0, y: 0 }) {
  const l = t / (e.width * (1 + i)), a = n / (e.height * (1 + i)), c = Math.min(l, a), d = jn(c, o, s), p = e.x + e.width / 2, v = e.y + e.height / 2, g = t / 2 - p * d + (r.x ?? 0), k = n / 2 - v * d + (r.y ?? 0);
  return { x: g, y: k, zoom: d };
}
function x2(e, t) {
  return {
    x: t.x + e.x,
    y: t.y + e.y,
    z: (e.z > t.z ? e.z : t.z) + 1
  };
}
function rf(e, t) {
  if (!e.parentNode)
    return !1;
  const n = t(e.parentNode);
  return n ? n.selected ? !0 : rf(n, t) : !1;
}
function Ko(e, t) {
  return typeof e > "u" ? "" : typeof e == "string" ? e : `${t ? `${t}__` : ""}${Object.keys(e).sort().map((o) => `${o}=${e[o]}`).join("&")}`;
}
function lu(e, t, n) {
  return e < t ? jn(Math.abs(e - t), 1, t) / t : e > n ? -jn(Math.abs(e - n), 1, t) / t : 0;
}
function lf(e, t, n = 15, o = 40) {
  const s = lu(e.x, o, t.width - o) * n, i = lu(e.y, o, t.height - o) * n;
  return [s, i];
}
function Hi(e, t) {
  if (t) {
    const n = e.position.x + e.dimensions.width - t.dimensions.width, o = e.position.y + e.dimensions.height - t.dimensions.height;
    if (n > 0 || o > 0 || e.position.x < 0 || e.position.y < 0) {
      let s = {};
      if (typeof t.style == "function" ? s = { ...t.style(t) } : t.style && (s = { ...t.style }), s.width = s.width ?? `${t.dimensions.width}px`, s.height = s.height ?? `${t.dimensions.height}px`, n > 0)
        if (typeof s.width == "string") {
          const i = Number(s.width.replace("px", ""));
          s.width = `${i + n}px`;
        } else
          s.width += n;
      if (o > 0)
        if (typeof s.height == "string") {
          const i = Number(s.height.replace("px", ""));
          s.height = `${i + o}px`;
        } else
          s.height += o;
      if (e.position.x < 0) {
        const i = Math.abs(e.position.x);
        if (t.position.x = t.position.x - i, typeof s.width == "string") {
          const r = Number(s.width.replace("px", ""));
          s.width = `${r + i}px`;
        } else
          s.width += i;
        e.position.x = 0;
      }
      if (e.position.y < 0) {
        const i = Math.abs(e.position.y);
        if (t.position.y = t.position.y - i, typeof s.height == "string") {
          const r = Number(s.height.replace("px", ""));
          s.height = `${r + i}px`;
        } else
          s.height += i;
        e.position.y = 0;
      }
      t.dimensions.width = Number(s.width.toString().replace("px", "")), t.dimensions.height = Number(s.height.toString().replace("px", "")), typeof t.style == "function" ? t.style = (i) => {
        const r = t.style;
        return {
          ...r(i),
          ...s
        };
      } : t.style = {
        ...t.style,
        ...s
      };
    }
  }
}
function au(e, t) {
  var n, o;
  const s = e.filter((r) => r.type === "add" || r.type === "remove");
  for (const r of s)
    if (r.type === "add")
      t.findIndex((a) => a.id === r.item.id) === -1 && t.push(r.item);
    else if (r.type === "remove") {
      const l = t.findIndex((a) => a.id === r.id);
      l !== -1 && t.splice(l, 1);
    }
  const i = t.map((r) => r.id);
  for (const r of t)
    for (const l of e)
      if (l.id === r.id)
        switch (l.type) {
          case "select":
            r.selected = l.selected;
            break;
          case "position":
            if (No(r) && (typeof l.position < "u" && (r.position = l.position), typeof l.dragging < "u" && (r.dragging = l.dragging), r.expandParent && r.parentNode)) {
              const a = t[i.indexOf(r.parentNode)];
              a && No(a) && Hi(r, a);
            }
            break;
          case "dimensions":
            if (No(r) && (typeof l.dimensions < "u" && (r.dimensions = l.dimensions), typeof l.updateStyle < "u" && l.updateStyle && (r.style = {
              ...r.style || {},
              width: `${(n = l.dimensions) == null ? void 0 : n.width}px`,
              height: `${(o = l.dimensions) == null ? void 0 : o.height}px`
            }), typeof l.resizing < "u" && (r.resizing = l.resizing), r.expandParent && r.parentNode)) {
              const a = t[i.indexOf(r.parentNode)];
              a && No(a) && (!!a.dimensions.width && !!a.dimensions.height ? Hi(r, a) : nt(() => {
                Hi(r, a);
              }));
            }
            break;
        }
  return t;
}
function an(e, t) {
  return {
    id: e,
    type: "select",
    selected: t
  };
}
function uu(e) {
  return {
    item: e,
    type: "add"
  };
}
function cu(e) {
  return {
    id: e,
    type: "remove"
  };
}
function du(e, t, n, o, s) {
  return {
    id: e,
    source: t,
    target: n,
    sourceHandle: o || null,
    targetHandle: s || null,
    type: "remove"
  };
}
function fn(e, t = /* @__PURE__ */ new Set(), n = !1) {
  const o = [];
  for (const [s, i] of e) {
    const r = t.has(s);
    !(i.selected === void 0 && !r) && i.selected !== r && (n && (i.selected = r), o.push(an(i.id, r)));
  }
  return o;
}
function pe(e) {
  const t = /* @__PURE__ */ new Set();
  let n = !1;
  const o = () => t.size > 0;
  e && (n = !0, t.add(e));
  const s = (l) => {
    t.delete(l);
  };
  return {
    on: (l) => {
      e && n && t.delete(e), t.add(l);
      const a = () => {
        s(l), e && n && t.add(e);
      };
      return ai(a), {
        off: a
      };
    },
    off: s,
    trigger: (l) => Promise.all(Array.from(t).map((a) => a(l))),
    hasListeners: o,
    fns: t
  };
}
function fu(e, t, n) {
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
function S2(e, t, n, o, s) {
  var i, r;
  const l = [];
  for (const a of e)
    (a.selected || a.id === s) && (!a.parentNode || !rf(a, o)) && (a.draggable || t && typeof a.draggable > "u") && l.push(
      An({
        id: a.id,
        position: a.position || { x: 0, y: 0 },
        distance: {
          x: n.x - ((i = a.computedPosition) == null ? void 0 : i.x) || 0,
          y: n.y - ((r = a.computedPosition) == null ? void 0 : r.y) || 0
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
function ji({
  id: e,
  dragItems: t,
  findNode: n
}) {
  const o = [];
  for (const s of t) {
    const i = n(s.id);
    i && o.push(i);
  }
  return [e ? o.find((s) => s.id === e) : o[0], o];
}
function af(e) {
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
function C2(e, t, n) {
  const [o, s, i, r] = typeof e != "string" ? af(e.padding) : [0, 0, 0, 0];
  return n && typeof n.computedPosition.x < "u" && typeof n.computedPosition.y < "u" && typeof n.dimensions.width < "u" && typeof n.dimensions.height < "u" ? [
    [n.computedPosition.x + r, n.computedPosition.y + o],
    [
      n.computedPosition.x + n.dimensions.width - s,
      n.computedPosition.y + n.dimensions.height - i
    ]
  ] : !1;
}
function $2(e, t, n, o) {
  let s = e.extent || n;
  if ((s === "parent" || !Array.isArray(s) && (s == null ? void 0 : s.range) === "parent") && !e.expandParent)
    if (e.parentNode && o && e.dimensions.width && e.dimensions.height) {
      const i = C2(s, e, o);
      i && (s = i);
    } else
      t(new Qe(We.NODE_EXTENT_INVALID, e.id)), s = n;
  else if (Array.isArray(s)) {
    const i = (o == null ? void 0 : o.computedPosition.x) || 0, r = (o == null ? void 0 : o.computedPosition.y) || 0;
    s = [
      [s[0][0] + i, s[0][1] + r],
      [s[1][0] + i, s[1][1] + r]
    ];
  } else if (s !== "parent" && (s != null && s.range) && Array.isArray(s.range)) {
    const [i, r, l, a] = af(s.padding), c = (o == null ? void 0 : o.computedPosition.x) || 0, d = (o == null ? void 0 : o.computedPosition.y) || 0;
    s = [
      [s.range[0][0] + c + a, s.range[0][1] + d + i],
      [s.range[1][0] + c - r, s.range[1][1] + d - l]
    ];
  }
  return s === "parent" ? [
    [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
  ] : s;
}
function N2({ width: e, height: t }, n) {
  return [n[0], [n[1][0] - (e || 0), n[1][1] - (t || 0)]];
}
function al(e, t, n, o, s) {
  const i = N2(e.dimensions, $2(e, n, o, s)), r = Wd(t, i);
  return {
    position: {
      x: r.x - ((s == null ? void 0 : s.computedPosition.x) || 0),
      y: r.y - ((s == null ? void 0 : s.computedPosition.y) || 0)
    },
    computedPosition: r
  };
}
function Gs(e, t, n = ye.Left) {
  const o = ((t == null ? void 0 : t.x) ?? 0) + e.computedPosition.x, s = ((t == null ? void 0 : t.y) ?? 0) + e.computedPosition.y, { width: i, height: r } = t ?? O2(e);
  switch ((t == null ? void 0 : t.position) ?? n) {
    case ye.Top:
      return {
        x: o + i / 2,
        y: s
      };
    case ye.Right:
      return {
        x: o + i,
        y: s + r / 2
      };
    case ye.Bottom:
      return {
        x: o + i / 2,
        y: s + r
      };
    case ye.Left:
      return {
        x: o,
        y: s + r / 2
      };
  }
}
function pu(e = [], t) {
  return e.length && (t ? e.find((n) => n.id === t) : e[0]) || null;
}
function I2({
  sourcePos: e,
  targetPos: t,
  sourceWidth: n,
  sourceHeight: o,
  targetWidth: s,
  targetHeight: i,
  width: r,
  height: l,
  viewport: a
}) {
  const c = {
    x: Math.min(e.x, t.x),
    y: Math.min(e.y, t.y),
    x2: Math.max(e.x + n, t.x + s),
    y2: Math.max(e.y + o, t.y + i)
  };
  c.x === c.x2 && (c.x2 += 1), c.y === c.y2 && (c.y2 += 1);
  const d = tf({
    x: (0 - a.x) / a.zoom,
    y: (0 - a.y) / a.zoom,
    width: r / a.zoom,
    height: l / a.zoom
  }), p = Math.max(0, Math.min(d.x2, c.x2) - Math.max(d.x, c.x)), v = Math.max(0, Math.min(d.y2, c.y2) - Math.max(d.y, c.y));
  return Math.ceil(p * v) > 0;
}
function M2(e, t, n = !1) {
  const o = typeof e.zIndex == "number";
  let s = o ? e.zIndex : 0;
  const i = t(e.source), r = t(e.target);
  return !i || !r ? 0 : (n && (s = o ? e.zIndex : Math.max(i.computedPosition.z || 0, r.computedPosition.z || 0)), s);
}
var We = /* @__PURE__ */ ((e) => (e.MISSING_STYLES = "MISSING_STYLES", e.MISSING_VIEWPORT_DIMENSIONS = "MISSING_VIEWPORT_DIMENSIONS", e.NODE_INVALID = "NODE_INVALID", e.NODE_NOT_FOUND = "NODE_NOT_FOUND", e.NODE_MISSING_PARENT = "NODE_MISSING_PARENT", e.NODE_TYPE_MISSING = "NODE_TYPE_MISSING", e.NODE_EXTENT_INVALID = "NODE_EXTENT_INVALID", e.EDGE_INVALID = "EDGE_INVALID", e.EDGE_NOT_FOUND = "EDGE_NOT_FOUND", e.EDGE_SOURCE_MISSING = "EDGE_SOURCE_MISSING", e.EDGE_TARGET_MISSING = "EDGE_TARGET_MISSING", e.EDGE_TYPE_MISSING = "EDGE_TYPE_MISSING", e.EDGE_SOURCE_TARGET_SAME = "EDGE_SOURCE_TARGET_SAME", e.EDGE_SOURCE_TARGET_MISSING = "EDGE_SOURCE_TARGET_MISSING", e.EDGE_ORPHANED = "EDGE_ORPHANED", e.USEVUEFLOW_OPTIONS = "USEVUEFLOW_OPTIONS", e))(We || {});
const hu = {
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
class Qe extends Error {
  constructor(t, ...n) {
    var o;
    super((o = hu[t]) == null ? void 0 : o.call(hu, ...n)), this.name = "VueFlowError", this.code = t, this.args = n;
  }
}
function ul(e) {
  return "clientX" in e;
}
function uf(e) {
  return "sourceEvent" in e;
}
function tn(e, t) {
  var n, o;
  const s = ul(e), i = s ? e.clientX : (n = e.touches) == null ? void 0 : n[0].clientX, r = s ? e.clientY : (o = e.touches) == null ? void 0 : o[0].clientY;
  return {
    x: i - ((t == null ? void 0 : t.left) ?? 0),
    y: r - ((t == null ? void 0 : t.top) ?? 0)
  };
}
const Ys = () => {
  var e;
  return typeof navigator < "u" && ((e = navigator == null ? void 0 : navigator.userAgent) == null ? void 0 : e.indexOf("Mac")) >= 0;
};
function O2(e) {
  var t, n;
  return {
    width: ((t = e.dimensions) == null ? void 0 : t.width) ?? e.width ?? 0,
    height: ((n = e.dimensions) == null ? void 0 : n.height) ?? e.height ?? 0
  };
}
function hi(e, t = [1, 1]) {
  return {
    x: t[0] * Math.round(e.x / t[0]),
    y: t[1] * Math.round(e.y / t[1])
  };
}
function cf() {
  return {
    handleDomNode: null,
    isValid: !1,
    connection: { source: "", target: "", sourceHandle: null, targetHandle: null },
    endHandle: null
  };
}
function Gi(e) {
  e == null || e.classList.remove("valid", "connecting", "vue-flow__handle-valid", "vue-flow__handle-connecting");
}
function vu(e, t, n, o) {
  const s = [];
  for (const i of t[n] || [])
    if (`${e.id}-${i.id}-${n}` !== o) {
      const { x: r, y: l } = Gs(e, i);
      s.push({
        id: i.id || null,
        type: n,
        nodeId: e.id,
        x: r,
        y: l
      });
    }
  return s;
}
function T2(e, t, n, o, s, i) {
  const { x: r, y: l } = tn(e), c = t.elementsFromPoint(r, l).find((k) => k.classList.contains("vue-flow__handle"));
  if (c) {
    const k = c.getAttribute("data-nodeid");
    if (k) {
      const $ = cl(void 0, c), S = c.getAttribute("data-handleid"), T = i({ nodeId: k, id: S, type: $ });
      if (T) {
        const D = s.find((m) => m.nodeId === k && m.type === $ && m.id === S);
        return {
          handle: {
            id: S,
            type: $,
            nodeId: k,
            x: (D == null ? void 0 : D.x) || n.x,
            y: (D == null ? void 0 : D.y) || n.y
          },
          validHandleResult: T
        };
      }
    }
  }
  let d = [], p = Number.POSITIVE_INFINITY;
  for (const k of s) {
    const $ = Math.sqrt((k.x - n.x) ** 2 + (k.y - n.y) ** 2);
    if ($ <= o) {
      const S = i(k);
      $ <= p && ($ < p ? d = [{ handle: k, validHandleResult: S }] : $ === p && d.push({
        handle: k,
        validHandleResult: S
      }), p = $);
    }
  }
  if (!d.length)
    return { handle: null, validHandleResult: cf() };
  if (d.length === 1)
    return d[0];
  const v = d.some(({ validHandleResult: k }) => k.isValid), g = d.some(({ handle: k }) => k.type === "target");
  return d.find(
    ({ handle: k, validHandleResult: $ }) => g ? k.type === "target" : v ? $.isValid : !0
  ) || d[0];
}
function gu(e, t, n, o, s, i, r, l, a, c, d) {
  const p = i === "target", v = l.querySelector(`.vue-flow__handle[data-id="${t == null ? void 0 : t.nodeId}-${t == null ? void 0 : t.id}-${t == null ? void 0 : t.type}"]`), { x: g, y: k } = tn(e), $ = l.elementFromPoint(g, k), S = $ != null && $.classList.contains("vue-flow__handle") ? $ : v, T = cf();
  if (S) {
    T.handleDomNode = S;
    const D = cl(void 0, S), m = S.getAttribute("data-nodeid"), _ = S.getAttribute("data-handleid"), z = S.classList.contains("connectable"), U = S.classList.contains("connectableend"), Z = {
      source: p ? m : o,
      sourceHandle: p ? _ : s,
      target: p ? o : m,
      targetHandle: p ? s : _
    };
    T.connection = Z, z && U && (n === Hn.Strict ? p && D === "source" || !p && D === "target" : m !== o || _ !== s) && (T.isValid = r(Z, {
      edges: a,
      nodes: c,
      sourceNode: d(Z.source),
      targetNode: d(Z.target)
    }), T.endHandle = {
      nodeId: m,
      handleId: _,
      type: D,
      position: T.isValid ? S.getAttribute("data-handlepos") : null
    });
  }
  return T;
}
function P2({ nodes: e, nodeId: t, handleId: n, handleType: o }) {
  const s = [];
  for (let i = 0; i < e.length; i++) {
    const r = e[i], { handleBounds: l } = r;
    let a = [], c = [];
    l && (a = vu(r, l, "source", `${t}-${n}-${o}`), c = vu(r, l, "target", `${t}-${n}-${o}`)), s.push(...a, ...c);
  }
  return s;
}
function cl(e, t) {
  return e || (t != null && t.classList.contains("target") ? "target" : t != null && t.classList.contains("source") ? "source" : null);
}
function D2(e, t) {
  let n = null;
  return t ? n = "valid" : e && !t && (n = "invalid"), n;
}
const R2 = ["production", "prod"];
function vi(e, ...t) {
  df() && console.warn(`[Vue Flow]: ${e}`, ...t);
}
function df() {
  return !R2.includes("production");
}
function mu(e, t, n, o) {
  const s = t.querySelectorAll(`.vue-flow__handle${e}`);
  return Array.from(s).map((r) => {
    const l = r.getBoundingClientRect();
    return {
      id: r.getAttribute("data-handleid"),
      position: r.getAttribute("data-handlepos"),
      x: (l.left - n.left) / o,
      y: (l.top - n.top) / o,
      ...pi(r)
    };
  });
}
function Nr(e, t, n, o, s, i = !1, r) {
  s.value = !1, e.selected ? (i || e.selected && t) && (o([e]), nt(() => {
    r.blur();
  })) : n([e]);
}
function Ke(e) {
  return typeof B(e) < "u";
}
function A2(e, t, n, o) {
  if (!e || !e.source || !e.target)
    return n(new Qe(We.EDGE_INVALID, (e == null ? void 0 : e.id) ?? "[ID UNKNOWN]")), !1;
  let s;
  return En(e) ? s = e : s = {
    ...e,
    id: Qd(e)
  }, s = Zd(s, void 0, o), w2(s, t) ? !1 : s;
}
function L2(e, t, n, o, s) {
  if (!t.source || !t.target)
    return s(new Qe(We.EDGE_INVALID, e.id)), !1;
  if (!n)
    return s(new Qe(We.EDGE_NOT_FOUND, e.id)), !1;
  const { id: i, ...r } = e;
  return {
    ...r,
    id: o ? Qd(t) : i,
    source: t.source,
    target: t.target,
    sourceHandle: t.sourceHandle,
    targetHandle: t.targetHandle
  };
}
function yu(e, t, n) {
  const o = {}, s = [];
  for (let i = 0; i < e.length; ++i) {
    const r = e[i];
    if (!Vn(r)) {
      n(
        new Qe(We.NODE_INVALID, r == null ? void 0 : r.id) || `[ID UNKNOWN|INDEX ${i}]`
      );
      continue;
    }
    const l = y2(r, t(r.id), r.parentNode);
    r.parentNode && (o[r.parentNode] = !0), s[i] = l;
  }
  for (const i of s) {
    const r = t(i.parentNode) || s.find((l) => l.id === i.parentNode);
    i.parentNode && !r && n(new Qe(We.NODE_MISSING_PARENT, i.id, i.parentNode)), (i.parentNode || o[i.id]) && (o[i.id] && (i.isParent = !0), r && (r.isParent = !0));
  }
  return s;
}
function Yi(e, t) {
  e.clear();
  for (const n of t) {
    const { id: o, source: s, target: i, sourceHandle: r = null, targetHandle: l = null } = n, a = `${s}-source-${r}`, c = `${i}-target-${l}`, d = e.get(a) || /* @__PURE__ */ new Map(), p = e.get(c) || /* @__PURE__ */ new Map(), v = An({ edgeId: o, source: s, target: i, sourceHandle: r, targetHandle: l });
    e.set(a, d.set(`${i}-${l}`, v)), e.set(c, p.set(`${s}-${r}`, v));
  }
}
function qi(e, t, n, o, s, i, r, l) {
  const a = [];
  for (const c of e) {
    const d = En(c) ? c : A2(c, l, s, i);
    if (!d)
      continue;
    const p = n(d.source), v = n(d.target);
    if (!p || !v) {
      s(new Qe(We.EDGE_SOURCE_TARGET_MISSING, d.id, d.source, d.target));
      continue;
    }
    if (!p) {
      s(new Qe(We.EDGE_SOURCE_MISSING, d.id, d.source));
      continue;
    }
    if (!v) {
      s(new Qe(We.EDGE_TARGET_MISSING, d.id, d.target));
      continue;
    }
    if (t && !t(d, {
      edges: l,
      nodes: r,
      sourceNode: p,
      targetNode: v
    })) {
      s(new Qe(We.EDGE_INVALID, d.id));
      continue;
    }
    const g = o(d.id);
    a.push({
      ...Zd(d, g, i),
      sourceNode: p,
      targetNode: v
    });
  }
  return a;
}
const bu = Symbol("vueFlow"), ff = Symbol("nodeId"), pf = Symbol("nodeRef"), V2 = Symbol("edgeId"), z2 = Symbol("edgeRef"), gi = Symbol("slots");
function hf(e) {
  const {
    vueFlowRef: t,
    snapToGrid: n,
    snapGrid: o,
    noDragClassName: s,
    nodes: i,
    nodeExtent: r,
    nodeDragThreshold: l,
    viewport: a,
    autoPanOnNodeDrag: c,
    autoPanSpeed: d,
    nodesDraggable: p,
    panBy: v,
    findNode: g,
    multiSelectionActive: k,
    nodesSelectionActive: $,
    selectNodesOnDrag: S,
    removeSelectedElements: T,
    addSelectedNodes: D,
    updateNodePositions: m,
    emits: _
  } = He(), { onStart: z, onDrag: U, onStop: Z, onClick: G, el: P, disabled: V, id: Y, selectable: H, dragHandle: J } = e, C = ee(!1);
  let A = [], M, R = null, j = { x: void 0, y: void 0 }, ne = { x: 0, y: 0 }, le = null, fe = !1, se = 0, ce = !1;
  const ue = U2(), ge = ({ x: W, y: h }) => {
    j = { x: W, y: h };
    let I = !1;
    if (A = A.map((y) => {
      const b = { x: W - y.distance.x, y: h - y.distance.y }, { computedPosition: w } = al(
        y,
        n.value ? hi(b, o.value) : b,
        _.error,
        r.value,
        y.parentNode ? g(y.parentNode) : void 0
      );
      return I = I || y.position.x !== w.x || y.position.y !== w.y, y.position = w, y;
    }), !!I && (m(A, !0, !0), C.value = !0, le)) {
      const [y, b] = ji({
        id: Y,
        dragItems: A,
        findNode: g
      });
      U({ event: le, node: y, nodes: b });
    }
  }, te = () => {
    if (!R)
      return;
    const [W, h] = lf(ne, R, d.value);
    if (W !== 0 || h !== 0) {
      const I = {
        x: (j.x ?? 0) - W / a.value.zoom,
        y: (j.y ?? 0) - h / a.value.zoom
      };
      v({ x: W, y: h }) && ge(I);
    }
    se = requestAnimationFrame(te);
  }, we = (W, h) => {
    fe = !0;
    const I = g(Y);
    !S.value && !k.value && I && (I.selected || T()), I && Pe(H) && S.value && Nr(
      I,
      k.value,
      D,
      T,
      $,
      !1,
      h
    );
    const y = ue(W.sourceEvent);
    if (j = y, A = S2(i.value, p.value, y, g, Y), A.length) {
      const [b, w] = ji({
        id: Y,
        dragItems: A,
        findNode: g
      });
      z({ event: W.sourceEvent, node: b, nodes: w });
    }
  }, xe = (W, h) => {
    var I;
    W.sourceEvent.type === "touchmove" && W.sourceEvent.touches.length > 1 || (l.value === 0 && we(W, h), j = ue(W.sourceEvent), R = ((I = t.value) == null ? void 0 : I.getBoundingClientRect()) || null, ne = tn(W.sourceEvent, R));
  }, _e = (W, h) => {
    const I = ue(W.sourceEvent);
    if (!ce && fe && c.value && (ce = !0, te()), !fe) {
      const y = I.xSnapped - (j.x ?? 0), b = I.ySnapped - (j.y ?? 0);
      Math.sqrt(y * y + b * b) > l.value && we(W, h);
    }
    (j.x !== I.xSnapped || j.y !== I.ySnapped) && A.length && fe && (le = W.sourceEvent, ne = tn(W.sourceEvent, R), ge(I));
  }, ke = (W) => {
    if (!uf(W) && !fe && !C.value && !k.value) {
      const h = W, I = ue(h), y = I.xSnapped - (j.x ?? 0), b = I.ySnapped - (j.y ?? 0), w = Math.sqrt(y * y + b * b);
      w !== 0 && w <= l.value && (G == null || G(h));
      return;
    }
    if (C.value = !1, ce = !1, fe = !1, j = { x: void 0, y: void 0 }, cancelAnimationFrame(se), A.length) {
      m(A, !1, !1);
      const [h, I] = ji({
        id: Y,
        dragItems: A,
        findNode: g
      });
      Z({ event: W.sourceEvent, node: h, nodes: I });
    }
  };
  return Ne([() => Pe(V), P], ([W, h], I, y) => {
    if (h) {
      const b = Ct(h);
      W || (M = kw().on("start", (w) => xe(w, h)).on("drag", (w) => _e(w, h)).on("end", (w) => ke(w)).filter((w) => {
        const E = w.target, F = Pe(J);
        return !w.button && (!s.value || !fu(E, `.${s.value}`, h) && (!F || fu(E, F, h)));
      }), b.call(M)), y(() => {
        b.on(".drag", null), M && (M.on("start", null), M.on("drag", null), M.on("end", null));
      });
    }
  }), C;
}
function B2() {
  return {
    doubleClick: pe(),
    click: pe(),
    mouseEnter: pe(),
    mouseMove: pe(),
    mouseLeave: pe(),
    contextMenu: pe(),
    updateStart: pe(),
    update: pe(),
    updateEnd: pe()
  };
}
function F2(e, t) {
  const n = B2();
  return n.doubleClick.on((o) => {
    var s, i;
    t.edgeDoubleClick(o), (i = (s = e.events) == null ? void 0 : s.doubleClick) == null || i.call(s, o);
  }), n.click.on((o) => {
    var s, i;
    t.edgeClick(o), (i = (s = e.events) == null ? void 0 : s.click) == null || i.call(s, o);
  }), n.mouseEnter.on((o) => {
    var s, i;
    t.edgeMouseEnter(o), (i = (s = e.events) == null ? void 0 : s.mouseEnter) == null || i.call(s, o);
  }), n.mouseMove.on((o) => {
    var s, i;
    t.edgeMouseMove(o), (i = (s = e.events) == null ? void 0 : s.mouseMove) == null || i.call(s, o);
  }), n.mouseLeave.on((o) => {
    var s, i;
    t.edgeMouseLeave(o), (i = (s = e.events) == null ? void 0 : s.mouseLeave) == null || i.call(s, o);
  }), n.contextMenu.on((o) => {
    var s, i;
    t.edgeContextMenu(o), (i = (s = e.events) == null ? void 0 : s.contextMenu) == null || i.call(s, o);
  }), n.updateStart.on((o) => {
    var s, i;
    t.edgeUpdateStart(o), (i = (s = e.events) == null ? void 0 : s.updateStart) == null || i.call(s, o);
  }), n.update.on((o) => {
    var s, i;
    t.edgeUpdate(o), (i = (s = e.events) == null ? void 0 : s.update) == null || i.call(s, o);
  }), n.updateEnd.on((o) => {
    var s, i;
    t.edgeUpdateEnd(o), (i = (s = e.events) == null ? void 0 : s.updateEnd) == null || i.call(s, o);
  }), Object.entries(n).reduce(
    (o, [s, i]) => (o.emit[s] = i.trigger, o.on[s] = i.on, o),
    { emit: {}, on: {} }
  );
}
function U2() {
  const { viewport: e, snapGrid: t, snapToGrid: n } = He();
  return (o) => {
    const s = uf(o) ? o.sourceEvent : o, { x: i, y: r } = tn(s), l = Xo({ x: i, y: r }, e.value), { x: a, y: c } = n.value ? hi(l, t.value) : l;
    return {
      xSnapped: a,
      ySnapped: c,
      ...l
    };
  };
}
function gs() {
  return !0;
}
function vf({
  handleId: e,
  nodeId: t,
  type: n,
  isValidConnection: o,
  edgeUpdaterType: s,
  onEdgeUpdate: i,
  onEdgeUpdateEnd: r
}) {
  const {
    vueFlowRef: l,
    connectionMode: a,
    connectionRadius: c,
    connectOnClick: d,
    connectionClickStartHandle: p,
    nodesConnectable: v,
    autoPanOnConnect: g,
    autoPanSpeed: k,
    findNode: $,
    panBy: S,
    startConnection: T,
    updateConnection: D,
    endConnection: m,
    emits: _,
    viewport: z,
    edges: U,
    nodes: Z,
    isValidConnection: G
  } = He();
  let P = null, V = !1, Y = null, H = null;
  function J(A) {
    var M;
    const R = Pe(n) === "target", j = ul(A), ne = iu(A.target);
    if (j && A.button === 0 || !j) {
      let le = function(w) {
        h = tn(w, ke);
        const { handle: E, validHandleResult: F } = T2(
          w,
          ne,
          Xo(h, z.value, !1, [1, 1]),
          c.value,
          y,
          (K) => gu(
            w,
            K,
            a.value,
            Pe(t),
            Pe(e),
            R ? "target" : "source",
            ce,
            ne,
            U.value,
            Z.value,
            $
          )
        );
        if (ue = E, I || (b(), I = !0), P = F.connection, V = F.isValid, Y = F.handleDomNode, !(V && ue && (H != null && H.endHandle) && F.endHandle && H.endHandle.type === F.endHandle.type && H.endHandle.nodeId === F.endHandle.nodeId && H.endHandle.handleId === F.endHandle.handleId)) {
          if (D(
            ue && V ? ef(
              {
                x: ue.x,
                y: ue.y
              },
              z.value
            ) : h,
            F.endHandle,
            D2(!!ue, V)
          ), H = F, !ue && !V && !Y)
            return Gi(W);
          P && P.source !== P.target && Y && (Gi(W), W = Y, Y.classList.add("connecting", "vue-flow__handle-connecting"), Y.classList.toggle("valid", V), Y.classList.toggle("vue-flow__handle-valid", V));
        }
      }, fe = function(w) {
        (ue || Y) && P && V && (i ? i(w, P) : _.connect(P)), _.connectEnd(w), s && (r == null || r(w)), Gi(W), cancelAnimationFrame(ge), m(w), I = !1, V = !1, P = null, Y = null, ne.removeEventListener("mousemove", le), ne.removeEventListener("mouseup", fe), ne.removeEventListener("touchmove", le), ne.removeEventListener("touchend", fe);
      };
      const se = $(Pe(t));
      let ce = Pe(o) || G.value || gs;
      !ce && se && (ce = (R ? se.isValidSourcePos : se.isValidTargetPos) || gs);
      let ue, ge = 0;
      const { x: te, y: we } = tn(A), xe = ne == null ? void 0 : ne.elementFromPoint(te, we), _e = cl(Pe(s), xe), ke = (M = l.value) == null ? void 0 : M.getBoundingClientRect();
      if (!ke || !_e)
        return;
      let W, h = tn(A, ke), I = !1;
      const y = P2({
        nodes: Z.value,
        nodeId: Pe(t),
        handleId: Pe(e),
        handleType: _e
      }), b = () => {
        if (!g.value)
          return;
        const [w, E] = lf(h, ke, k.value);
        S({ x: w, y: E }), ge = requestAnimationFrame(b);
      };
      T(
        {
          nodeId: Pe(t),
          handleId: Pe(e),
          type: _e,
          position: (xe == null ? void 0 : xe.getAttribute("data-handlepos")) || ye.Top
        },
        {
          x: te - ke.left,
          y: we - ke.top
        }
      ), _.connectStart({ event: A, nodeId: Pe(t), handleId: Pe(e), handleType: _e }), ne.addEventListener("mousemove", le), ne.addEventListener("mouseup", fe), ne.addEventListener("touchmove", le), ne.addEventListener("touchend", fe);
    }
  }
  function C(A) {
    if (!d.value)
      return;
    const M = Pe(n) === "target";
    if (!p.value)
      _.clickConnectStart({ event: A, nodeId: Pe(t), handleId: Pe(e) }), T({ nodeId: Pe(t), type: Pe(n), handleId: Pe(e) }, void 0, !0);
    else {
      let R = Pe(o) || G.value || gs;
      const j = $(Pe(t));
      if (!R && j && (R = (M ? j.isValidSourcePos : j.isValidTargetPos) || gs), j && (typeof j.connectable > "u" ? v.value : j.connectable) === !1)
        return;
      const ne = iu(A.target), { connection: le, isValid: fe } = gu(
        A,
        {
          nodeId: Pe(t),
          id: Pe(e),
          type: Pe(n)
        },
        a.value,
        p.value.nodeId,
        p.value.handleId || null,
        p.value.type,
        R,
        ne,
        U.value,
        Z.value,
        $
      ), se = le.source === le.target;
      fe && !se && _.connect(le), _.clickConnectEnd(A), m(A, !0);
    }
  }
  return {
    handlePointerDown: J,
    handleClick: C
  };
}
function H2() {
  return Vt(ff, "");
}
function gf(e) {
  const t = e ?? H2() ?? "", n = Vt(pf, ee(null)), { findNode: o, edges: s, emits: i } = He(), r = o(t);
  return r || i.error(new Qe(We.NODE_NOT_FOUND, t)), {
    id: t,
    nodeEl: n,
    node: r,
    parentNode: ae(() => o(r.parentNode)),
    connectedEdges: ae(() => sf([r], s.value))
  };
}
function j2() {
  return {
    doubleClick: pe(),
    click: pe(),
    mouseEnter: pe(),
    mouseMove: pe(),
    mouseLeave: pe(),
    contextMenu: pe(),
    dragStart: pe(),
    drag: pe(),
    dragStop: pe()
  };
}
function G2(e, t) {
  const n = j2();
  return n.doubleClick.on((o) => {
    var s, i;
    t.nodeDoubleClick(o), (i = (s = e.events) == null ? void 0 : s.doubleClick) == null || i.call(s, o);
  }), n.click.on((o) => {
    var s, i;
    t.nodeClick(o), (i = (s = e.events) == null ? void 0 : s.click) == null || i.call(s, o);
  }), n.mouseEnter.on((o) => {
    var s, i;
    t.nodeMouseEnter(o), (i = (s = e.events) == null ? void 0 : s.mouseEnter) == null || i.call(s, o);
  }), n.mouseMove.on((o) => {
    var s, i;
    t.nodeMouseMove(o), (i = (s = e.events) == null ? void 0 : s.mouseMove) == null || i.call(s, o);
  }), n.mouseLeave.on((o) => {
    var s, i;
    t.nodeMouseLeave(o), (i = (s = e.events) == null ? void 0 : s.mouseLeave) == null || i.call(s, o);
  }), n.contextMenu.on((o) => {
    var s, i;
    t.nodeContextMenu(o), (i = (s = e.events) == null ? void 0 : s.contextMenu) == null || i.call(s, o);
  }), n.dragStart.on((o) => {
    var s, i;
    t.nodeDragStart(o), (i = (s = e.events) == null ? void 0 : s.dragStart) == null || i.call(s, o);
  }), n.drag.on((o) => {
    var s, i;
    t.nodeDrag(o), (i = (s = e.events) == null ? void 0 : s.drag) == null || i.call(s, o);
  }), n.dragStop.on((o) => {
    var s, i;
    t.nodeDragStop(o), (i = (s = e.events) == null ? void 0 : s.dragStop) == null || i.call(s, o);
  }), Object.entries(n).reduce(
    (o, [s, i]) => (o.emit[s] = i.trigger, o.on[s] = i.on, o),
    { emit: {}, on: {} }
  );
}
function mf() {
  const { getSelectedNodes: e, nodeExtent: t, updateNodePositions: n, findNode: o, snapGrid: s, snapToGrid: i, nodesDraggable: r, emits: l } = He();
  return (a, c = !1) => {
    const d = i.value ? s.value[0] : 5, p = i.value ? s.value[1] : 5, v = c ? 4 : 1, g = a.x * d * v, k = a.y * p * v, $ = [];
    for (const S of e.value)
      if (S.draggable || r && typeof S.draggable > "u") {
        const T = { x: S.computedPosition.x + g, y: S.computedPosition.y + k }, { computedPosition: D } = al(
          S,
          T,
          l.error,
          t.value,
          S.parentNode ? o(S.parentNode) : void 0
        );
        $.push({
          id: S.id,
          position: D,
          from: S.position,
          distance: { x: a.x, y: a.y },
          dimensions: S.dimensions
        });
      }
    n($, !0, !1);
  };
}
const Xi = 0.1;
function ln() {
  return vi("Viewport not initialized yet."), Promise.resolve(!1);
}
const Y2 = {
  zoomIn: ln,
  zoomOut: ln,
  zoomTo: ln,
  fitView: ln,
  setCenter: ln,
  fitBounds: ln,
  project: (e) => e,
  screenToFlowCoordinate: (e) => e,
  flowToScreenCoordinate: (e) => e,
  setViewport: ln,
  setTransform: ln,
  getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
  getTransform: () => ({ x: 0, y: 0, zoom: 1 }),
  viewportInitialized: !1
};
function q2(e) {
  function t(o, s) {
    return new Promise((i) => {
      e.d3Selection && e.d3Zoom ? e.d3Zoom.scaleBy(
        Ki(e.d3Selection, s, () => {
          i(!0);
        }),
        o
      ) : i(!1);
    });
  }
  function n(o, s, i, r) {
    return new Promise((l) => {
      const { x: a, y: c } = Wd({ x: -o, y: -s }, e.translateExtent), d = fo.translate(-a, -c).scale(i);
      e.d3Selection && e.d3Zoom ? e.d3Zoom.transform(
        Ki(e.d3Selection, r, () => {
          l(!0);
        }),
        d
      ) : l(!1);
    });
  }
  return ae(() => e.d3Zoom && e.d3Selection && e.dimensions.width && e.dimensions.height ? {
    viewportInitialized: !0,
    // todo: allow passing scale as option
    zoomIn: (s) => t(1.2, s == null ? void 0 : s.duration),
    zoomOut: (s) => t(1 / 1.2, s == null ? void 0 : s.duration),
    zoomTo: (s, i) => new Promise((r) => {
      e.d3Selection && e.d3Zoom ? e.d3Zoom.scaleTo(
        Ki(e.d3Selection, i == null ? void 0 : i.duration, () => {
          r(!0);
        }),
        s
      ) : r(!1);
    }),
    setViewport: (s, i) => n(s.x, s.y, s.zoom, i == null ? void 0 : i.duration),
    setTransform: (s, i) => n(s.x, s.y, s.zoom, i == null ? void 0 : i.duration),
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
    fitView: (s = {
      padding: Xi,
      includeHiddenNodes: !1,
      duration: 0
    }) => {
      var i, r;
      const l = [];
      for (const v of e.nodes)
        v.dimensions.width && v.dimensions.height && ((s == null ? void 0 : s.includeHiddenNodes) || !v.hidden) && (!((i = s.nodes) != null && i.length) || (r = s.nodes) != null && r.length && s.nodes.includes(v.id)) && l.push(v);
      if (!l.length)
        return Promise.resolve(!1);
      const a = nf(l), { x: c, y: d, zoom: p } = ru(
        a,
        e.dimensions.width,
        e.dimensions.height,
        s.minZoom ?? e.minZoom,
        s.maxZoom ?? e.maxZoom,
        s.padding ?? Xi,
        s.offset
      );
      return n(c, d, p, s == null ? void 0 : s.duration);
    },
    setCenter: (s, i, r) => {
      const l = typeof (r == null ? void 0 : r.zoom) < "u" ? r.zoom : e.maxZoom, a = e.dimensions.width / 2 - s * l, c = e.dimensions.height / 2 - i * l;
      return n(a, c, l, r == null ? void 0 : r.duration);
    },
    fitBounds: (s, i = { padding: Xi }) => {
      const { x: r, y: l, zoom: a } = ru(
        s,
        e.dimensions.width,
        e.dimensions.height,
        e.minZoom,
        e.maxZoom,
        i.padding
      );
      return n(r, l, a, i == null ? void 0 : i.duration);
    },
    project: (s) => Xo(s, e.viewport, e.snapToGrid, e.snapGrid),
    screenToFlowCoordinate: (s) => {
      if (e.vueFlowRef) {
        const { x: i, y: r } = e.vueFlowRef.getBoundingClientRect(), l = {
          x: s.x - i,
          y: s.y - r
        };
        return Xo(l, e.viewport, e.snapToGrid, e.snapGrid);
      }
      return { x: 0, y: 0 };
    },
    flowToScreenCoordinate: (s) => {
      if (e.vueFlowRef) {
        const { x: i, y: r } = e.vueFlowRef.getBoundingClientRect(), l = {
          x: s.x + i,
          y: s.y + r
        };
        return ef(l, e.viewport);
      }
      return { x: 0, y: 0 };
    }
  } : Y2);
}
function Ki(e, t = 0, n) {
  return e.transition().duration(t).on("end", n);
}
function X2(e, t, n) {
  const o = Du(!0);
  return o.run(() => {
    const s = () => {
      o.run(() => {
        let $, S, T = !!(n.nodes.value.length || n.edges.value.length);
        $ = qn([e.modelValue, () => {
          var D, m;
          return (m = (D = e.modelValue) == null ? void 0 : D.value) == null ? void 0 : m.length;
        }], ([D]) => {
          D && Array.isArray(D) && (S == null || S.pause(), n.setElements(D), !S && !T && D.length ? T = !0 : S == null || S.resume());
        }), S = qn(
          [n.nodes, n.edges, () => n.edges.value.length, () => n.nodes.value.length],
          ([D, m]) => {
            var _;
            (_ = e.modelValue) != null && _.value && Array.isArray(e.modelValue.value) && ($ == null || $.pause(), e.modelValue.value = [...D, ...m], nt(() => {
              $ == null || $.resume();
            }));
          },
          { immediate: T }
        ), _s(() => {
          $ == null || $.stop(), S == null || S.stop();
        });
      });
    }, i = () => {
      o.run(() => {
        let $, S, T = !!n.nodes.value.length;
        $ = qn([e.nodes, () => {
          var D, m;
          return (m = (D = e.nodes) == null ? void 0 : D.value) == null ? void 0 : m.length;
        }], ([D]) => {
          D && Array.isArray(D) && (S == null || S.pause(), n.setNodes(D), !S && !T && D.length ? T = !0 : S == null || S.resume());
        }), S = qn(
          [n.nodes, () => n.nodes.value.length],
          ([D]) => {
            var m;
            (m = e.nodes) != null && m.value && Array.isArray(e.nodes.value) && ($ == null || $.pause(), e.nodes.value = [...D], nt(() => {
              $ == null || $.resume();
            }));
          },
          { immediate: T }
        ), _s(() => {
          $ == null || $.stop(), S == null || S.stop();
        });
      });
    }, r = () => {
      o.run(() => {
        let $, S, T = !!n.edges.value.length;
        $ = qn([e.edges, () => {
          var D, m;
          return (m = (D = e.edges) == null ? void 0 : D.value) == null ? void 0 : m.length;
        }], ([D]) => {
          D && Array.isArray(D) && (S == null || S.pause(), n.setEdges(D), !S && !T && D.length ? T = !0 : S == null || S.resume());
        }), S = qn(
          [n.edges, () => n.edges.value.length],
          ([D]) => {
            var m;
            (m = e.edges) != null && m.value && Array.isArray(e.edges.value) && ($ == null || $.pause(), e.edges.value = [...D], nt(() => {
              $ == null || $.resume();
            }));
          },
          { immediate: T }
        ), _s(() => {
          $ == null || $.stop(), S == null || S.stop();
        });
      });
    }, l = () => {
      o.run(() => {
        Ne(
          () => t.maxZoom,
          () => {
            t.maxZoom && Ke(t.maxZoom) && n.setMaxZoom(t.maxZoom);
          },
          {
            immediate: !0
          }
        );
      });
    }, a = () => {
      o.run(() => {
        Ne(
          () => t.minZoom,
          () => {
            t.minZoom && Ke(t.minZoom) && n.setMinZoom(t.minZoom);
          },
          { immediate: !0 }
        );
      });
    }, c = () => {
      o.run(() => {
        Ne(
          () => t.translateExtent,
          () => {
            t.translateExtent && Ke(t.translateExtent) && n.setTranslateExtent(t.translateExtent);
          },
          {
            immediate: !0
          }
        );
      });
    }, d = () => {
      o.run(() => {
        Ne(
          () => t.nodeExtent,
          () => {
            t.nodeExtent && Ke(t.nodeExtent) && n.setNodeExtent(t.nodeExtent);
          },
          {
            immediate: !0
          }
        );
      });
    }, p = () => {
      o.run(() => {
        Ne(
          () => t.applyDefault,
          () => {
            Ke(t.applyDefault) && (n.applyDefault.value = t.applyDefault);
          },
          {
            immediate: !0
          }
        );
      });
    }, v = () => {
      o.run(() => {
        const $ = async (S) => {
          let T = S;
          typeof t.autoConnect == "function" && (T = await t.autoConnect(S)), T !== !1 && n.addEdges([T]);
        };
        Ne(
          () => t.autoConnect,
          () => {
            Ke(t.autoConnect) && (n.autoConnect.value = t.autoConnect);
          },
          { immediate: !0 }
        ), Ne(
          n.autoConnect,
          (S, T, D) => {
            S ? n.onConnect($) : n.hooks.value.connect.off($), D(() => {
              n.hooks.value.connect.off($);
            });
          },
          { immediate: !0 }
        );
      });
    }, g = () => {
      const $ = [
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
      for (const S of Object.keys(t)) {
        const T = S;
        if (!$.includes(T)) {
          const D = Ue(() => t[T]), m = n[T];
          Xe(m) && o.run(() => {
            Ne(
              D,
              (_) => {
                Ke(_) && (m.value = _);
              },
              { immediate: !0 }
            );
          });
        }
      }
    };
    (() => {
      s(), i(), r(), a(), l(), c(), d(), p(), v(), g();
    })();
  }), () => o.stop();
}
function K2() {
  return {
    edgesChange: pe(),
    nodesChange: pe(),
    nodeDoubleClick: pe(),
    nodeClick: pe(),
    nodeMouseEnter: pe(),
    nodeMouseMove: pe(),
    nodeMouseLeave: pe(),
    nodeContextMenu: pe(),
    nodeDragStart: pe(),
    nodeDrag: pe(),
    nodeDragStop: pe(),
    nodesInitialized: pe(),
    miniMapNodeClick: pe(),
    miniMapNodeDoubleClick: pe(),
    miniMapNodeMouseEnter: pe(),
    miniMapNodeMouseMove: pe(),
    miniMapNodeMouseLeave: pe(),
    connect: pe(),
    connectStart: pe(),
    connectEnd: pe(),
    clickConnectStart: pe(),
    clickConnectEnd: pe(),
    paneReady: pe(),
    init: pe(),
    move: pe(),
    moveStart: pe(),
    moveEnd: pe(),
    selectionDragStart: pe(),
    selectionDrag: pe(),
    selectionDragStop: pe(),
    selectionContextMenu: pe(),
    selectionStart: pe(),
    selectionEnd: pe(),
    viewportChangeStart: pe(),
    viewportChange: pe(),
    viewportChangeEnd: pe(),
    paneScroll: pe(),
    paneClick: pe(),
    paneContextMenu: pe(),
    paneMouseEnter: pe(),
    paneMouseMove: pe(),
    paneMouseLeave: pe(),
    edgeContextMenu: pe(),
    edgeMouseEnter: pe(),
    edgeMouseMove: pe(),
    edgeMouseLeave: pe(),
    edgeDoubleClick: pe(),
    edgeClick: pe(),
    edgeUpdateStart: pe(),
    edgeUpdate: pe(),
    edgeUpdateEnd: pe(),
    updateNodeInternals: pe(),
    error: pe((e) => vi(e.message))
  };
}
function W2(e, t) {
  ic(() => {
    for (const [n, o] of Object.entries(t.value)) {
      const s = (i) => {
        e(n, i);
      };
      o.fns.add(s), ai(() => {
        o.off(s);
      });
    }
  });
}
function yf() {
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
    selectionMode: ll.Full,
    paneDragging: !1,
    preventScrolling: !0,
    zoomOnScroll: !0,
    zoomOnPinch: !0,
    zoomOnDoubleClick: !0,
    panOnScroll: !1,
    panOnScrollSpeed: 0.5,
    panOnScrollMode: Ro.Free,
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
      type: On.Bezier,
      style: {}
    },
    connectionMode: Hn.Loose,
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
    multiSelectionKeyCode: Ys() ? "Meta" : "Control",
    zoomActivationKeyCode: Ys() ? "Meta" : "Control",
    deleteKeyCode: "Backspace",
    panActivationKeyCode: "Space",
    hooks: K2(),
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
const Z2 = [
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
function J2(e, t, n) {
  const o = q2(e), s = (y) => {
    const b = y ?? [];
    e.hooks.updateNodeInternals.trigger(b);
  }, i = (y) => _2(y, e.nodes, e.edges), r = (y) => b2(y, e.nodes, e.edges), l = (y) => sf(y, e.edges), a = ({ id: y, type: b, nodeId: w }) => {
    var E;
    return Array.from(((E = e.connectionLookup.get(`${w}-${b}-${y ?? null}`)) == null ? void 0 : E.values()) ?? []);
  }, c = (y) => {
    if (y)
      return t.value.get(y);
  }, d = (y) => {
    if (y)
      return n.value.get(y);
  }, p = (y, b, w) => {
    var E, F;
    const K = [];
    for (const x of y) {
      const f = {
        id: x.id,
        type: "position",
        dragging: w,
        from: x.from
      };
      if (b && (f.position = x.position, x.parentNode)) {
        const q = c(x.parentNode);
        f.position = {
          x: f.position.x - (((E = q == null ? void 0 : q.computedPosition) == null ? void 0 : E.x) ?? 0),
          y: f.position.y - (((F = q == null ? void 0 : q.computedPosition) == null ? void 0 : F.y) ?? 0)
        };
      }
      K.push(f);
    }
    K != null && K.length && e.hooks.nodesChange.trigger(K);
  }, v = (y) => {
    if (!e.vueFlowRef)
      return;
    const b = e.vueFlowRef.querySelector(".vue-flow__transformationpane");
    if (!b)
      return;
    const w = window.getComputedStyle(b), { m22: E } = new window.DOMMatrixReadOnly(w.transform), F = [];
    for (let K = 0; K < y.length; ++K) {
      const x = y[K], f = c(x.id);
      if (f) {
        const q = pi(x.nodeElement);
        if (!!(q.width && q.height && (f.dimensions.width !== q.width || f.dimensions.height !== q.height || x.forceUpdate))) {
          const ie = x.nodeElement.getBoundingClientRect();
          f.dimensions = q, f.handleBounds.source = mu(".source", x.nodeElement, ie, E), f.handleBounds.target = mu(".target", x.nodeElement, ie, E), F.push({
            id: f.id,
            type: "dimensions",
            dimensions: q
          });
        }
      }
    }
    !e.fitViewOnInitDone && e.fitViewOnInit && o.value.fitView().then(() => {
      e.fitViewOnInitDone = !0;
    }), F.length && e.hooks.nodesChange.trigger(F);
  }, g = (y, b) => {
    const w = /* @__PURE__ */ new Set(), E = /* @__PURE__ */ new Set();
    for (const x of y)
      Vn(x) ? w.add(x.id) : En(x) && E.add(x.id);
    const F = fn(t.value, w, !0), K = fn(n.value, E);
    if (e.multiSelectionActive) {
      for (const x of w)
        F.push(an(x, b));
      for (const x of E)
        K.push(an(x, b));
    }
    F.length && e.hooks.nodesChange.trigger(F), K.length && e.hooks.edgesChange.trigger(K);
  }, k = (y) => {
    if (e.multiSelectionActive) {
      const b = y.map((w) => an(w.id, !0));
      e.hooks.nodesChange.trigger(b);
      return;
    }
    e.hooks.nodesChange.trigger(fn(t.value, new Set(y.map((b) => b.id)), !0)), e.hooks.edgesChange.trigger(fn(n.value));
  }, $ = (y) => {
    if (e.multiSelectionActive) {
      const b = y.map((w) => an(w.id, !0));
      e.hooks.edgesChange.trigger(b);
      return;
    }
    e.hooks.edgesChange.trigger(fn(n.value, new Set(y.map((b) => b.id)))), e.hooks.nodesChange.trigger(fn(t.value, /* @__PURE__ */ new Set(), !0));
  }, S = (y) => {
    g(y, !0);
  }, T = (y) => {
    const w = (y || e.nodes).map((E) => (E.selected = !1, an(E.id, !1)));
    e.hooks.nodesChange.trigger(w);
  }, D = (y) => {
    const w = (y || e.edges).map((E) => (E.selected = !1, an(E.id, !1)));
    e.hooks.edgesChange.trigger(w);
  }, m = (y) => {
    if (!y || !y.length)
      return g([], !1);
    const b = y.reduce(
      (w, E) => {
        const F = an(E.id, !1);
        return Vn(E) ? w.nodes.push(F) : w.edges.push(F), w;
      },
      { nodes: [], edges: [] }
    );
    b.nodes.length && e.hooks.nodesChange.trigger(b.nodes), b.edges.length && e.hooks.edgesChange.trigger(b.edges);
  }, _ = (y) => {
    var b;
    (b = e.d3Zoom) == null || b.scaleExtent([y, e.maxZoom]), e.minZoom = y;
  }, z = (y) => {
    var b;
    (b = e.d3Zoom) == null || b.scaleExtent([e.minZoom, y]), e.maxZoom = y;
  }, U = (y) => {
    var b;
    (b = e.d3Zoom) == null || b.translateExtent(y), e.translateExtent = y;
  }, Z = (y) => {
    e.nodeExtent = y, s();
  }, G = (y) => {
    var b;
    (b = e.d3Zoom) == null || b.clickDistance(y);
  }, P = (y) => {
    e.nodesDraggable = y, e.nodesConnectable = y, e.elementsSelectable = y;
  }, V = (y) => {
    const b = y instanceof Function ? y(e.nodes) : y;
    !e.initialized && !b.length || (e.nodes = yu(b, c, e.hooks.error.trigger));
  }, Y = (y) => {
    const b = y instanceof Function ? y(e.edges) : y;
    if (!e.initialized && !b.length)
      return;
    const w = qi(
      b,
      e.isValidConnection,
      c,
      d,
      e.hooks.error.trigger,
      e.defaultEdgeOptions,
      e.nodes,
      e.edges
    );
    Yi(e.connectionLookup, w), e.edges = w;
  }, H = (y) => {
    const b = y instanceof Function ? y([...e.nodes, ...e.edges]) : y;
    !e.initialized && !b.length || (V(b.filter(Vn)), Y(b.filter(En)));
  }, J = (y) => {
    let b = y instanceof Function ? y(e.nodes) : y;
    b = Array.isArray(b) ? b : [b];
    const w = yu(b, c, e.hooks.error.trigger), E = [];
    for (const F of w)
      E.push(uu(F));
    E.length && e.hooks.nodesChange.trigger(E);
  }, C = (y) => {
    let b = y instanceof Function ? y(e.edges) : y;
    b = Array.isArray(b) ? b : [b];
    const w = qi(
      b,
      e.isValidConnection,
      c,
      d,
      e.hooks.error.trigger,
      e.defaultEdgeOptions,
      e.nodes,
      e.edges
    ), E = [];
    for (const F of w)
      E.push(uu(F));
    E.length && e.hooks.edgesChange.trigger(E);
  }, A = (y, b = !0, w = !1) => {
    const E = y instanceof Function ? y(e.nodes) : y, F = Array.isArray(E) ? E : [E], K = [], x = [];
    function f(X) {
      const ie = l(X);
      for (const de of ie)
        (!Ke(de.deletable) || de.deletable) && x.push(du(de.id, de.source, de.target, de.sourceHandle, de.targetHandle));
    }
    function q(X) {
      const ie = [];
      for (const de of e.nodes)
        de.parentNode === X && ie.push(de);
      if (ie.length) {
        for (const de of ie)
          K.push(cu(de.id));
        b && f(ie);
        for (const de of ie)
          q(de.id);
      }
    }
    for (const X of F) {
      const ie = typeof X == "string" ? c(X) : X;
      ie && (Ke(ie.deletable) && !ie.deletable || (K.push(cu(ie.id)), b && f([ie]), w && q(ie.id)));
    }
    x.length && e.hooks.edgesChange.trigger(x), K.length && e.hooks.nodesChange.trigger(K);
  }, M = (y) => {
    const b = y instanceof Function ? y(e.edges) : y, w = Array.isArray(b) ? b : [b], E = [];
    for (const F of w) {
      const K = typeof F == "string" ? d(F) : F;
      K && (Ke(K.deletable) && !K.deletable || E.push(
        du(
          typeof F == "string" ? F : F.id,
          K.source,
          K.target,
          K.sourceHandle,
          K.targetHandle
        )
      ));
    }
    e.hooks.edgesChange.trigger(E);
  }, R = (y, b, w = !0) => {
    const E = d(y.id), F = L2(y, b, E, w, e.hooks.error.trigger);
    if (F) {
      const [K] = qi(
        [F],
        e.isValidConnection,
        c,
        d,
        e.hooks.error.trigger,
        e.defaultEdgeOptions,
        e.nodes,
        e.edges
      );
      return e.edges.splice(e.edges.indexOf(E), 1, K), Yi(e.connectionLookup, [K]), K;
    }
    return !1;
  }, j = (y, b, w = { replace: !1 }) => {
    const E = d(y);
    if (!E)
      return;
    const F = typeof b == "function" ? b(E) : b;
    E.data = w.replace ? F : { ...E.data, ...F };
  }, ne = (y) => au(y, e.nodes), le = (y) => {
    const b = au(y, e.edges);
    return Yi(e.connectionLookup, b), b;
  }, fe = (y, b, w = { replace: !1 }) => {
    const E = c(y);
    if (!E)
      return;
    const F = typeof b == "function" ? b(E) : b;
    w.replace ? e.nodes.splice(e.nodes.indexOf(E), 1, F) : Object.assign(E, F);
  }, se = (y, b, w = { replace: !1 }) => {
    const E = c(y);
    if (!E)
      return;
    const F = typeof b == "function" ? b(E) : b;
    E.data = w.replace ? F : { ...E.data, ...F };
  }, ce = (y, b, w = !1) => {
    w ? e.connectionClickStartHandle = y : e.connectionStartHandle = y, e.connectionEndHandle = null, e.connectionStatus = null, b && (e.connectionPosition = b);
  }, ue = (y, b = null, w = null) => {
    e.connectionStartHandle && (e.connectionPosition = y, e.connectionEndHandle = b, e.connectionStatus = w);
  }, ge = (y, b) => {
    e.connectionPosition = { x: Number.NaN, y: Number.NaN }, e.connectionEndHandle = null, e.connectionStatus = null, b ? e.connectionClickStartHandle = null : e.connectionStartHandle = null;
  }, te = (y) => {
    const b = m2(y), w = b ? null : No(y) ? y : c(y.id);
    return !b && !w ? [null, null, b] : [b ? y : Cr(w), w, b];
  }, we = (y, b = !0, w = e.nodes) => {
    const [E, F, K] = te(y);
    if (!E)
      return [];
    const x = [];
    for (const f of w || e.nodes) {
      if (!K && (f.id === F.id || !f.computedPosition))
        continue;
      const q = Cr(f), X = $r(q, E);
      (b && X > 0 || X >= Number(E.width) * Number(E.height)) && x.push(f);
    }
    return x;
  }, xe = (y, b, w = !0) => {
    const [E] = te(y);
    if (!E)
      return !1;
    const F = $r(E, b);
    return w && F > 0 || F >= Number(E.width) * Number(E.height);
  }, _e = (y) => {
    const { viewport: b, dimensions: w, d3Zoom: E, d3Selection: F, translateExtent: K } = e;
    if (!E || !F || !y.x && !y.y)
      return !1;
    const x = fo.translate(b.x + y.x, b.y + y.y).scale(b.zoom), f = [
      [0, 0],
      [w.width, w.height]
    ], q = E.constrain()(x, f, K), X = e.viewport.x !== q.x || e.viewport.y !== q.y || e.viewport.zoom !== q.k;
    return E.transform(F, q), X;
  }, ke = (y) => {
    const b = y instanceof Function ? y(e) : y, w = [
      "d3Zoom",
      "d3Selection",
      "d3ZoomHandler",
      "viewportRef",
      "vueFlowRef",
      "dimensions",
      "hooks"
    ];
    Ke(b.defaultEdgeOptions) && (e.defaultEdgeOptions = b.defaultEdgeOptions);
    const E = b.modelValue || b.nodes || b.edges ? [] : void 0;
    E && (b.modelValue && E.push(...b.modelValue), b.nodes && E.push(...b.nodes), b.edges && E.push(...b.edges), H(E));
    const F = () => {
      Ke(b.maxZoom) && z(b.maxZoom), Ke(b.minZoom) && _(b.minZoom), Ke(b.translateExtent) && U(b.translateExtent);
    };
    for (const K of Object.keys(b)) {
      const x = K, f = b[x];
      ![...Z2, ...w].includes(x) && Ke(f) && (e[x] = f);
    }
    vr(() => e.d3Zoom).not.toBeNull().then(F), e.initialized || (e.initialized = !0);
  };
  return {
    updateNodePositions: p,
    updateNodeDimensions: v,
    setElements: H,
    setNodes: V,
    setEdges: Y,
    addNodes: J,
    addEdges: C,
    removeNodes: A,
    removeEdges: M,
    findNode: c,
    findEdge: d,
    updateEdge: R,
    updateEdgeData: j,
    updateNode: fe,
    updateNodeData: se,
    applyEdgeChanges: le,
    applyNodeChanges: ne,
    addSelectedElements: S,
    addSelectedNodes: k,
    addSelectedEdges: $,
    setMinZoom: _,
    setMaxZoom: z,
    setTranslateExtent: U,
    setNodeExtent: Z,
    setPaneClickDistance: G,
    removeSelectedElements: m,
    removeSelectedNodes: T,
    removeSelectedEdges: D,
    startConnection: ce,
    updateConnection: ue,
    endConnection: ge,
    setInteractive: P,
    setState: ke,
    getIntersectingNodes: we,
    getIncomers: i,
    getOutgoers: r,
    getConnectedEdges: l,
    getHandleConnections: a,
    isNodeIntersecting: xe,
    panBy: _e,
    fitView: (y) => o.value.fitView(y),
    zoomIn: (y) => o.value.zoomIn(y),
    zoomOut: (y) => o.value.zoomOut(y),
    zoomTo: (y, b) => o.value.zoomTo(y, b),
    setViewport: (y, b) => o.value.setViewport(y, b),
    setTransform: (y, b) => o.value.setTransform(y, b),
    getViewport: () => o.value.getViewport(),
    getTransform: () => o.value.getTransform(),
    setCenter: (y, b, w) => o.value.setCenter(y, b, w),
    fitBounds: (y, b) => o.value.fitBounds(y, b),
    project: (y) => o.value.project(y),
    screenToFlowCoordinate: (y) => o.value.screenToFlowCoordinate(y),
    flowToScreenCoordinate: (y) => o.value.flowToScreenCoordinate(y),
    toObject: () => {
      const y = [], b = [];
      for (const w of e.nodes) {
        const {
          computedPosition: E,
          handleBounds: F,
          selected: K,
          dimensions: x,
          isParent: f,
          resizing: q,
          dragging: X,
          events: ie,
          ...de
        } = w;
        y.push(de);
      }
      for (const w of e.edges) {
        const { selected: E, sourceNode: F, targetNode: K, events: x, ...f } = w;
        b.push(f);
      }
      return JSON.parse(
        JSON.stringify({
          nodes: y,
          edges: b,
          position: [e.viewport.x, e.viewport.y],
          zoom: e.viewport.zoom,
          viewport: e.viewport
        })
      );
    },
    fromObject: (y) => new Promise((b) => {
      const { nodes: w, edges: E, position: F, zoom: K, viewport: x } = y;
      if (w && V(w), E && Y(E), x != null && x.x && (x != null && x.y) || F) {
        const f = (x == null ? void 0 : x.x) || F[0], q = (x == null ? void 0 : x.y) || F[1], X = (x == null ? void 0 : x.zoom) || K || e.viewport.zoom;
        return vr(() => o.value.viewportInitialized).toBe(!0).then(() => {
          o.value.setViewport({
            x: f,
            y: q,
            zoom: X
          }).then(() => {
            b(!0);
          });
        });
      } else
        b(!0);
    }),
    updateNodeInternals: s,
    viewportHelper: o,
    $reset: () => {
      const y = yf();
      if (e.edges = [], e.nodes = [], e.d3Zoom && e.d3Selection) {
        const b = fo.translate(y.defaultViewport.x ?? 0, y.defaultViewport.y ?? 0).scale(jn(y.defaultViewport.zoom ?? 1, y.minZoom, y.maxZoom)), w = e.viewportRef.getBoundingClientRect(), E = [
          [0, 0],
          [w.width, w.height]
        ], F = e.d3Zoom.constrain()(b, E, y.translateExtent);
        e.d3Zoom.transform(e.d3Selection, F);
      }
      ke(y);
    },
    $destroy: () => {
    }
  };
}
const Q2 = ["data-id", "data-handleid", "data-nodeid", "data-handlepos"], eE = {
  name: "Handle",
  compatConfig: { MODE: 3 }
}, _n = /* @__PURE__ */ Me({
  ...eE,
  props: {
    id: { default: null },
    type: {},
    position: { default: () => ye.Top },
    isValidConnection: { type: Function },
    connectable: { type: [Boolean, Number, String, Function], default: void 0 },
    connectableStart: { type: Boolean, default: !0 },
    connectableEnd: { type: Boolean, default: !0 }
  },
  setup(e, { expose: t }) {
    const n = pc(e, ["position", "connectable", "connectableStart", "connectableEnd", "id"]), o = Ue(() => n.type ?? "source"), s = Ue(() => n.isValidConnection ?? null), {
      connectionStartHandle: i,
      connectionClickStartHandle: r,
      connectionEndHandle: l,
      vueFlowRef: a,
      nodesConnectable: c,
      noDragClassName: d,
      noPanClassName: p
    } = He(), { id: v, node: g, nodeEl: k, connectedEdges: $ } = gf(), S = ee(), T = Ue(() => typeof e.connectableStart < "u" ? e.connectableStart : !0), D = Ue(() => typeof e.connectableEnd < "u" ? e.connectableEnd : !0), m = Ue(
      () => {
        var V, Y, H, J, C, A;
        return ((V = i.value) == null ? void 0 : V.nodeId) === v && ((Y = i.value) == null ? void 0 : Y.handleId) === e.id && ((H = i.value) == null ? void 0 : H.type) === o.value || ((J = l.value) == null ? void 0 : J.nodeId) === v && ((C = l.value) == null ? void 0 : C.handleId) === e.id && ((A = l.value) == null ? void 0 : A.type) === o.value;
      }
    ), _ = Ue(
      () => {
        var V, Y, H;
        return ((V = r.value) == null ? void 0 : V.nodeId) === v && ((Y = r.value) == null ? void 0 : Y.handleId) === e.id && ((H = r.value) == null ? void 0 : H.type) === o.value;
      }
    ), { handlePointerDown: z, handleClick: U } = vf({
      nodeId: v,
      handleId: e.id,
      isValidConnection: s,
      type: o
    }), Z = ae(() => typeof e.connectable == "string" && e.connectable === "single" ? !$.value.some((V) => {
      const Y = V[`${o.value}Handle`];
      return V[o.value] !== v ? !1 : Y ? Y === e.id : !0;
    }) : typeof e.connectable == "number" ? $.value.filter((V) => {
      const Y = V[`${o.value}Handle`];
      return V[o.value] !== v ? !1 : Y ? Y === e.id : !0;
    }).length < e.connectable : typeof e.connectable == "function" ? e.connectable(g, $.value) : Ke(e.connectable) ? e.connectable : c.value);
    rt(() => {
      var V;
      if (!g.dimensions.width || !g.dimensions.height)
        return;
      const Y = (V = g.handleBounds[o.value]) == null ? void 0 : V.find((j) => j.id === e.id);
      if (!a.value || Y)
        return;
      const H = a.value.querySelector(".vue-flow__transformationpane");
      if (!k.value || !S.value || !H || !e.id)
        return;
      const J = k.value.getBoundingClientRect(), C = S.value.getBoundingClientRect(), A = window.getComputedStyle(H), { m22: M } = new window.DOMMatrixReadOnly(A.transform), R = {
        id: e.id,
        position: e.position,
        x: (C.left - J.left) / M,
        y: (C.top - J.top) / M,
        ...pi(S.value)
      };
      g.handleBounds[o.value] = [...g.handleBounds[o.value] ?? [], R];
    }), ni(() => {
      const V = g.handleBounds[o.value];
      V && (g.handleBounds[o.value] = V.filter((Y) => Y.id !== e.id));
    });
    function G(V) {
      const Y = ul(V);
      Z.value && T.value && (Y && V.button === 0 || !Y) && z(V);
    }
    function P(V) {
      !v || !r.value && !T.value || Z.value && U(V);
    }
    return t({
      handleClick: U,
      handlePointerDown: z,
      onClick: P,
      onPointerDown: G
    }), (V, Y) => (N(), O("div", {
      ref_key: "handle",
      ref: S,
      "data-id": `${B(v)}-${e.id}-${o.value}`,
      "data-handleid": e.id,
      "data-nodeid": B(v),
      "data-handlepos": V.position,
      class: ve(["vue-flow__handle", [
        `vue-flow__handle-${V.position}`,
        `vue-flow__handle-${e.id}`,
        B(d),
        B(p),
        o.value,
        {
          connectable: Z.value,
          connecting: _.value,
          connectablestart: T.value,
          connectableend: D.value,
          connectionindicator: Z.value && (T.value && !m.value || D.value && m.value)
        }
      ]]),
      onMousedown: G,
      onTouchstartPassive: G,
      onClick: P
    }, [
      Bn(V.$slots, "default", { id: V.id })
    ], 42, Q2));
  }
}), mi = function({
  sourcePosition: e = ye.Bottom,
  targetPosition: t = ye.Top,
  label: n,
  connectable: o = !0,
  isValidTargetPos: s,
  isValidSourcePos: i,
  data: r
}) {
  const l = r.label || n;
  return [
    Ae(_n, { type: "target", position: t, connectable: o, isValidConnection: s }),
    typeof l != "string" && l ? Ae(l) : Ae(me, [l]),
    Ae(_n, { type: "source", position: e, connectable: o, isValidConnection: i })
  ];
};
mi.props = ["sourcePosition", "targetPosition", "label", "isValidTargetPos", "isValidSourcePos", "connectable", "data"];
mi.inheritAttrs = !1;
mi.compatConfig = { MODE: 3 };
const tE = mi, yi = function({
  targetPosition: e = ye.Top,
  label: t,
  connectable: n = !0,
  isValidTargetPos: o,
  data: s
}) {
  const i = s.label || t;
  return [
    Ae(_n, { type: "target", position: e, connectable: n, isValidConnection: o }),
    typeof i != "string" && i ? Ae(i) : Ae(me, [i])
  ];
};
yi.props = ["targetPosition", "label", "isValidTargetPos", "connectable", "data"];
yi.inheritAttrs = !1;
yi.compatConfig = { MODE: 3 };
const nE = yi, bi = function({
  sourcePosition: e = ye.Bottom,
  label: t,
  connectable: n = !0,
  isValidSourcePos: o,
  data: s
}) {
  const i = s.label || t;
  return [
    typeof i != "string" && i ? Ae(i) : Ae(me, [i]),
    Ae(_n, { type: "source", position: e, connectable: n, isValidConnection: o })
  ];
};
bi.props = ["sourcePosition", "label", "isValidSourcePos", "connectable", "data"];
bi.inheritAttrs = !1;
bi.compatConfig = { MODE: 3 };
const oE = bi, sE = ["transform"], iE = ["width", "height", "x", "y", "rx", "ry"], rE = ["y"], lE = {
  name: "EdgeText",
  compatConfig: { MODE: 3 }
}, aE = /* @__PURE__ */ Me({
  ...lE,
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
    const t = ee({ x: 0, y: 0, width: 0, height: 0 }), n = ee(null), o = ae(() => `translate(${e.x - t.value.width / 2} ${e.y - t.value.height / 2})`);
    rt(s), Ne([() => e.x, () => e.y, n, () => e.label], s);
    function s() {
      if (!n.value)
        return;
      const i = n.value.getBBox();
      (i.width !== t.value.width || i.height !== t.value.height) && (t.value = i);
    }
    return (i, r) => (N(), O("g", {
      transform: o.value,
      class: "vue-flow__edge-textwrapper"
    }, [
      i.labelShowBg ? (N(), O("rect", {
        key: 0,
        class: "vue-flow__edge-textbg",
        width: `${t.value.width + 2 * i.labelBgPadding[0]}px`,
        height: `${t.value.height + 2 * i.labelBgPadding[1]}px`,
        x: -i.labelBgPadding[0],
        y: -i.labelBgPadding[1],
        style: it(i.labelBgStyle),
        rx: i.labelBgBorderRadius,
        ry: i.labelBgBorderRadius
      }, null, 12, iE)) : re("", !0),
      u("text", qr(i.$attrs, {
        ref_key: "el",
        ref: n,
        class: "vue-flow__edge-text",
        y: t.value.height / 2,
        dy: "0.3em",
        style: i.labelStyle
      }), [
        Bn(i.$slots, "default", {}, () => [
          typeof i.label != "string" ? (N(), vt(uc(i.label), { key: 0 })) : (N(), O(me, { key: 1 }, [
            he(L(i.label), 1)
          ], 64))
        ])
      ], 16, rE)
    ], 8, sE));
  }
}), uE = ["id", "d", "marker-end", "marker-start"], cE = ["d", "stroke-width"], dE = {
  name: "BaseEdge",
  inheritAttrs: !1,
  compatConfig: { MODE: 3 }
}, os = /* @__PURE__ */ Me({
  ...dE,
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
    const n = pc(e, ["interactionWidth", "labelShowBg"]), o = ee(null), s = ee(null), i = ee(null), r = Rp();
    return t({
      pathEl: o,
      interactionEl: s,
      labelEl: i
    }), (l, a) => (N(), O(me, null, [
      u("path", {
        id: l.id,
        ref_key: "pathEl",
        ref: o,
        d: l.path,
        style: it(n.style),
        class: ve(["vue-flow__edge-path", B(r).class]),
        "marker-end": l.markerEnd,
        "marker-start": l.markerStart
      }, null, 14, uE),
      l.interactionWidth ? (N(), O("path", {
        key: 0,
        ref_key: "interactionEl",
        ref: s,
        fill: "none",
        d: l.path,
        "stroke-width": l.interactionWidth,
        "stroke-opacity": 0,
        class: "vue-flow__edge-interaction"
      }, null, 8, cE)) : re("", !0),
      l.label && l.labelX && l.labelY ? (N(), vt(aE, {
        key: 1,
        ref_key: "labelEl",
        ref: i,
        x: l.labelX,
        y: l.labelY,
        label: l.label,
        "label-show-bg": l.labelShowBg,
        "label-bg-style": l.labelBgStyle,
        "label-bg-padding": l.labelBgPadding,
        "label-bg-border-radius": l.labelBgBorderRadius,
        "label-style": l.labelStyle
      }, null, 8, ["x", "y", "label", "label-show-bg", "label-bg-style", "label-bg-padding", "label-bg-border-radius", "label-style"])) : re("", !0)
    ], 64));
  }
});
function bf({
  sourceX: e,
  sourceY: t,
  targetX: n,
  targetY: o
}) {
  const s = Math.abs(n - e) / 2, i = n < e ? n + s : n - s, r = Math.abs(o - t) / 2, l = o < t ? o + r : o - r;
  return [i, l, s, r];
}
function _f({
  sourceX: e,
  sourceY: t,
  targetX: n,
  targetY: o,
  sourceControlX: s,
  sourceControlY: i,
  targetControlX: r,
  targetControlY: l
}) {
  const a = e * 0.125 + s * 0.375 + r * 0.375 + n * 0.125, c = t * 0.125 + i * 0.375 + l * 0.375 + o * 0.125, d = Math.abs(a - e), p = Math.abs(c - t);
  return [a, c, d, p];
}
function ms(e, t) {
  return e >= 0 ? 0.5 * e : t * 25 * Math.sqrt(-e);
}
function _u({ pos: e, x1: t, y1: n, x2: o, y2: s, c: i }) {
  let r, l;
  switch (e) {
    case ye.Left:
      r = t - ms(t - o, i), l = n;
      break;
    case ye.Right:
      r = t + ms(o - t, i), l = n;
      break;
    case ye.Top:
      r = t, l = n - ms(n - s, i);
      break;
    case ye.Bottom:
      r = t, l = n + ms(s - n, i);
      break;
  }
  return [r, l];
}
function wf(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: o = ye.Bottom,
    targetX: s,
    targetY: i,
    targetPosition: r = ye.Top,
    curvature: l = 0.25
  } = e, [a, c] = _u({
    pos: o,
    x1: t,
    y1: n,
    x2: s,
    y2: i,
    c: l
  }), [d, p] = _u({
    pos: r,
    x1: s,
    y1: i,
    x2: t,
    y2: n,
    c: l
  }), [v, g, k, $] = _f({
    sourceX: t,
    sourceY: n,
    targetX: s,
    targetY: i,
    sourceControlX: a,
    sourceControlY: c,
    targetControlX: d,
    targetControlY: p
  });
  return [
    `M${t},${n} C${a},${c} ${d},${p} ${s},${i}`,
    v,
    g,
    k,
    $
  ];
}
function wu({ pos: e, x1: t, y1: n, x2: o, y2: s }) {
  let i, r;
  switch (e) {
    case ye.Left:
    case ye.Right:
      i = 0.5 * (t + o), r = n;
      break;
    case ye.Top:
    case ye.Bottom:
      i = t, r = 0.5 * (n + s);
      break;
  }
  return [i, r];
}
function kf(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: o = ye.Bottom,
    targetX: s,
    targetY: i,
    targetPosition: r = ye.Top
  } = e, [l, a] = wu({
    pos: o,
    x1: t,
    y1: n,
    x2: s,
    y2: i
  }), [c, d] = wu({
    pos: r,
    x1: s,
    y1: i,
    x2: t,
    y2: n
  }), [p, v, g, k] = _f({
    sourceX: t,
    sourceY: n,
    targetX: s,
    targetY: i,
    sourceControlX: l,
    sourceControlY: a,
    targetControlX: c,
    targetControlY: d
  });
  return [
    `M${t},${n} C${l},${a} ${c},${d} ${s},${i}`,
    p,
    v,
    g,
    k
  ];
}
const ku = {
  [ye.Left]: { x: -1, y: 0 },
  [ye.Right]: { x: 1, y: 0 },
  [ye.Top]: { x: 0, y: -1 },
  [ye.Bottom]: { x: 0, y: 1 }
};
function fE({
  source: e,
  sourcePosition: t = ye.Bottom,
  target: n
}) {
  return t === ye.Left || t === ye.Right ? e.x < n.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : e.y < n.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
}
function Eu(e, t) {
  return Math.sqrt((t.x - e.x) ** 2 + (t.y - e.y) ** 2);
}
function pE({
  source: e,
  sourcePosition: t = ye.Bottom,
  target: n,
  targetPosition: o = ye.Top,
  center: s,
  offset: i
}) {
  const r = ku[t], l = ku[o], a = { x: e.x + r.x * i, y: e.y + r.y * i }, c = { x: n.x + l.x * i, y: n.y + l.y * i }, d = fE({
    source: a,
    sourcePosition: t,
    target: c
  }), p = d.x !== 0 ? "x" : "y", v = d[p];
  let g, k, $;
  const S = { x: 0, y: 0 }, T = { x: 0, y: 0 }, [D, m, _, z] = bf({
    sourceX: e.x,
    sourceY: e.y,
    targetX: n.x,
    targetY: n.y
  });
  if (r[p] * l[p] === -1) {
    k = s.x ?? D, $ = s.y ?? m;
    const Z = [
      { x: k, y: a.y },
      { x: k, y: c.y }
    ], G = [
      { x: a.x, y: $ },
      { x: c.x, y: $ }
    ];
    r[p] === v ? g = p === "x" ? Z : G : g = p === "x" ? G : Z;
  } else {
    const Z = [{ x: a.x, y: c.y }], G = [{ x: c.x, y: a.y }];
    if (p === "x" ? g = r.x === v ? G : Z : g = r.y === v ? Z : G, t === o) {
      const J = Math.abs(e[p] - n[p]);
      if (J <= i) {
        const C = Math.min(i - 1, i - J);
        r[p] === v ? S[p] = (a[p] > e[p] ? -1 : 1) * C : T[p] = (c[p] > n[p] ? -1 : 1) * C;
      }
    }
    if (t !== o) {
      const J = p === "x" ? "y" : "x", C = r[p] === l[J], A = a[J] > c[J], M = a[J] < c[J];
      (r[p] === 1 && (!C && A || C && M) || r[p] !== 1 && (!C && M || C && A)) && (g = p === "x" ? Z : G);
    }
    const P = { x: a.x + S.x, y: a.y + S.y }, V = { x: c.x + T.x, y: c.y + T.y }, Y = Math.max(Math.abs(P.x - g[0].x), Math.abs(V.x - g[0].x)), H = Math.max(Math.abs(P.y - g[0].y), Math.abs(V.y - g[0].y));
    Y >= H ? (k = (P.x + V.x) / 2, $ = g[0].y) : (k = g[0].x, $ = (P.y + V.y) / 2);
  }
  return [[
    e,
    { x: a.x + S.x, y: a.y + S.y },
    ...g,
    { x: c.x + T.x, y: c.y + T.y },
    n
  ], k, $, _, z];
}
function hE(e, t, n, o) {
  const s = Math.min(Eu(e, t) / 2, Eu(t, n) / 2, o), { x: i, y: r } = t;
  if (e.x === i && i === n.x || e.y === r && r === n.y)
    return `L${i} ${r}`;
  if (e.y === r) {
    const c = e.x < n.x ? -1 : 1, d = e.y < n.y ? 1 : -1;
    return `L ${i + s * c},${r}Q ${i},${r} ${i},${r + s * d}`;
  }
  const l = e.x < n.x ? 1 : -1, a = e.y < n.y ? -1 : 1;
  return `L ${i},${r + s * a}Q ${i},${r} ${i + s * l},${r}`;
}
function Ir(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: o = ye.Bottom,
    targetX: s,
    targetY: i,
    targetPosition: r = ye.Top,
    borderRadius: l = 5,
    centerX: a,
    centerY: c,
    offset: d = 20
  } = e, [p, v, g, k, $] = pE({
    source: { x: t, y: n },
    sourcePosition: o,
    target: { x: s, y: i },
    targetPosition: r,
    center: { x: a, y: c },
    offset: d
  });
  return [p.reduce((T, D, m) => {
    let _;
    return m > 0 && m < p.length - 1 ? _ = hE(p[m - 1], D, p[m + 1], l) : _ = `${m === 0 ? "M" : "L"}${D.x} ${D.y}`, T += _, T;
  }, ""), v, g, k, $];
}
function vE(e) {
  const { sourceX: t, sourceY: n, targetX: o, targetY: s } = e, [i, r, l, a] = bf({
    sourceX: t,
    sourceY: n,
    targetX: o,
    targetY: s
  });
  return [`M ${t},${n}L ${o},${s}`, i, r, l, a];
}
const gE = /* @__PURE__ */ Me({
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
      const [n, o, s] = vE(e);
      return Ae(os, {
        path: n,
        labelX: o,
        labelY: s,
        ...t,
        ...e
      });
    };
  }
}), mE = gE, yE = /* @__PURE__ */ Me({
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
      const [n, o, s] = Ir({
        ...e,
        sourcePosition: e.sourcePosition ?? ye.Bottom,
        targetPosition: e.targetPosition ?? ye.Top
      });
      return Ae(os, {
        path: n,
        labelX: o,
        labelY: s,
        ...t,
        ...e
      });
    };
  }
}), Ef = yE, bE = /* @__PURE__ */ Me({
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
    return () => Ae(Ef, { ...e, ...t, borderRadius: 0 });
  }
}), _E = bE, wE = /* @__PURE__ */ Me({
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
      const [n, o, s] = wf({
        ...e,
        sourcePosition: e.sourcePosition ?? ye.Bottom,
        targetPosition: e.targetPosition ?? ye.Top
      });
      return Ae(os, {
        path: n,
        labelX: o,
        labelY: s,
        ...t,
        ...e
      });
    };
  }
}), kE = wE, EE = /* @__PURE__ */ Me({
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
      const [n, o, s] = kf({
        ...e,
        sourcePosition: e.sourcePosition ?? ye.Bottom,
        targetPosition: e.targetPosition ?? ye.Top
      });
      return Ae(os, {
        path: n,
        labelX: o,
        labelY: s,
        ...t,
        ...e
      });
    };
  }
}), xE = EE, SE = {
  input: oE,
  default: tE,
  output: nE
}, CE = {
  default: kE,
  straight: mE,
  step: _E,
  smoothstep: Ef,
  simplebezier: xE
};
function $E(e, t, n) {
  const o = ae(() => ($) => t.value.get($)), s = ae(() => ($) => n.value.get($)), i = ae(() => {
    const $ = {
      ...CE,
      ...e.edgeTypes
    }, S = Object.keys($);
    for (const T of e.edges)
      T.type && !S.includes(T.type) && ($[T.type] = T.type);
    return $;
  }), r = ae(() => {
    const $ = {
      ...SE,
      ...e.nodeTypes
    }, S = Object.keys($);
    for (const T of e.nodes)
      T.type && !S.includes(T.type) && ($[T.type] = T.type);
    return $;
  }), l = ae(() => e.onlyRenderVisibleElements ? of(
    e.nodes,
    {
      x: 0,
      y: 0,
      width: e.dimensions.width,
      height: e.dimensions.height
    },
    e.viewport,
    !0
  ) : e.nodes), a = ae(() => {
    if (e.onlyRenderVisibleElements) {
      const $ = [];
      for (const S of e.edges) {
        const T = t.value.get(S.source), D = t.value.get(S.target);
        I2({
          sourcePos: T.computedPosition || { x: 0, y: 0 },
          targetPos: D.computedPosition || { x: 0, y: 0 },
          sourceWidth: T.dimensions.width,
          sourceHeight: T.dimensions.height,
          targetWidth: D.dimensions.width,
          targetHeight: D.dimensions.height,
          width: e.dimensions.width,
          height: e.dimensions.height,
          viewport: e.viewport
        }) && $.push(S);
      }
      return $;
    }
    return e.edges;
  }), c = ae(() => [...l.value, ...a.value]), d = ae(() => {
    const $ = [];
    for (const S of e.nodes)
      S.selected && $.push(S);
    return $;
  }), p = ae(() => {
    const $ = [];
    for (const S of e.edges)
      S.selected && $.push(S);
    return $;
  }), v = ae(() => [
    ...d.value,
    ...p.value
  ]), g = ae(() => {
    const $ = [];
    for (const S of e.nodes)
      S.dimensions.width && S.dimensions.height && S.handleBounds !== void 0 && $.push(S);
    return $;
  }), k = ae(
    () => l.value.length > 0 && g.value.length === l.value.length
  );
  return {
    getNode: o,
    getEdge: s,
    getElements: c,
    getEdgeTypes: i,
    getNodeTypes: r,
    getEdges: a,
    getNodes: l,
    getSelectedElements: v,
    getSelectedNodes: d,
    getSelectedEdges: p,
    getNodesInitialized: g,
    areNodesInitialized: k
  };
}
class Tn {
  constructor() {
    this.currentId = 0, this.flows = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    var t;
    const n = (t = ho()) == null ? void 0 : t.appContext.app, o = (n == null ? void 0 : n.config.globalProperties.$vueFlowStorage) ?? Tn.instance;
    return Tn.instance = o ?? new Tn(), n && (n.config.globalProperties.$vueFlowStorage = Tn.instance), Tn.instance;
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
    const o = yf(), s = wn(o), i = {};
    for (const [v, g] of Object.entries(s.hooks)) {
      const k = `on${v.charAt(0).toUpperCase() + v.slice(1)}`;
      i[k] = g.on;
    }
    const r = {};
    for (const [v, g] of Object.entries(s.hooks))
      r[v] = g.trigger;
    const l = ae(() => {
      const v = /* @__PURE__ */ new Map();
      for (const g of s.nodes)
        v.set(g.id, g);
      return v;
    }), a = ae(() => {
      const v = /* @__PURE__ */ new Map();
      for (const g of s.edges)
        v.set(g.id, g);
      return v;
    }), c = $E(s, l, a), d = J2(s, l, a);
    d.setState({ ...s, ...n });
    const p = {
      ...i,
      ...c,
      ...d,
      ...O0(s),
      nodeLookup: l,
      edgeLookup: a,
      emits: r,
      id: t,
      vueFlowVersion: "1.41.6",
      $destroy: () => {
        this.remove(t);
      }
    };
    return this.set(t, p), p;
  }
  getId() {
    return `vue-flow-${this.currentId++}`;
  }
}
function He(e) {
  const t = Tn.getInstance(), n = Rr(), o = typeof e == "object", s = o ? e : { id: e }, i = s.id, r = i ?? (n == null ? void 0 : n.vueFlowId);
  let l;
  if (n) {
    const a = Vt(bu, null);
    typeof a < "u" && a !== null && (!r || a.id === r) && (l = a);
  }
  if (l || r && (l = t.get(r)), !l || r && l.id !== r) {
    const a = i ?? t.getId(), c = t.create(a, s);
    l = c, (n ?? Du(!0)).run(() => {
      Ne(
        c.applyDefault,
        (p, v, g) => {
          const k = (S) => {
            c.applyNodeChanges(S);
          }, $ = (S) => {
            c.applyEdgeChanges(S);
          };
          p ? (c.onNodesChange(k), c.onEdgesChange($)) : (c.hooks.value.nodesChange.off(k), c.hooks.value.edgesChange.off($)), g(() => {
            c.hooks.value.nodesChange.off(k), c.hooks.value.edgesChange.off($);
          });
        },
        { immediate: !0 }
      ), ai(() => {
        if (l) {
          const p = t.get(l.id);
          p ? p.$destroy() : vi(`No store instance found for id ${l.id} in storage.`);
        }
      });
    });
  } else
    o && l.setState(s);
  if (n && (Fn(bu, l), n.vueFlowId = l.id), o) {
    const a = ho();
    (a == null ? void 0 : a.type.name) !== "VueFlow" && l.emits.error(new Qe(We.USEVUEFLOW_OPTIONS));
  }
  return l;
}
function NE(e) {
  const { emits: t, dimensions: n } = He();
  let o;
  rt(() => {
    const s = e.value, i = () => {
      if (!s)
        return;
      const r = pi(s);
      (r.width === 0 || r.height === 0) && t.error(new Qe(We.MISSING_VIEWPORT_DIMENSIONS)), n.value = { width: r.width || 500, height: r.height || 500 };
    };
    i(), window.addEventListener("resize", i), s && (o = new ResizeObserver(() => i()), o.observe(s)), sn(() => {
      window.removeEventListener("resize", i), o && s && o.unobserve(s);
    });
  });
}
const IE = {
  name: "UserSelection",
  compatConfig: { MODE: 3 }
}, ME = /* @__PURE__ */ Me({
  ...IE,
  props: {
    userSelectionRect: {}
  },
  setup(e) {
    return (t, n) => (N(), O("div", {
      class: "vue-flow__selection vue-flow__container",
      style: it({
        width: `${t.userSelectionRect.width}px`,
        height: `${t.userSelectionRect.height}px`,
        transform: `translate(${t.userSelectionRect.x}px, ${t.userSelectionRect.y}px)`
      })
    }, null, 4));
  }
}), OE = ["tabIndex"], TE = {
  name: "NodesSelection",
  compatConfig: { MODE: 3 }
}, PE = /* @__PURE__ */ Me({
  ...TE,
  setup(e) {
    const { emits: t, viewport: n, getSelectedNodes: o, noPanClassName: s, disableKeyboardA11y: i, userSelectionActive: r } = He(), l = mf(), a = ee(null), c = hf({
      el: a,
      onStart(k) {
        t.selectionDragStart(k);
      },
      onDrag(k) {
        t.selectionDrag(k);
      },
      onStop(k) {
        t.selectionDragStop(k);
      }
    });
    rt(() => {
      var k;
      i.value || (k = a.value) == null || k.focus({ preventScroll: !0 });
    });
    const d = ae(() => nf(o.value)), p = ae(() => ({
      width: `${d.value.width}px`,
      height: `${d.value.height}px`,
      top: `${d.value.y}px`,
      left: `${d.value.x}px`
    }));
    function v(k) {
      t.selectionContextMenu({ event: k, nodes: o.value });
    }
    function g(k) {
      i || so[k.key] && (k.preventDefault(), l(
        {
          x: so[k.key].x,
          y: so[k.key].y
        },
        k.shiftKey
      ));
    }
    return (k, $) => !B(r) && d.value.width && d.value.height ? (N(), O("div", {
      key: 0,
      class: ve(["vue-flow__nodesselection vue-flow__container", B(s)]),
      style: it({ transform: `translate(${B(n).x}px,${B(n).y}px) scale(${B(n).zoom})` })
    }, [
      u("div", {
        ref_key: "el",
        ref: a,
        class: ve([{ dragging: B(c) }, "vue-flow__nodesselection-rect"]),
        style: it(p.value),
        tabIndex: B(i) ? void 0 : -1,
        onContextmenu: v,
        onKeydown: g
      }, null, 46, OE)
    ], 6)) : re("", !0);
  }
});
function DE(e, t) {
  return {
    x: e.clientX - t.left,
    y: e.clientY - t.top
  };
}
const RE = {
  name: "Pane",
  compatConfig: { MODE: 3 }
}, AE = /* @__PURE__ */ Me({
  ...RE,
  props: {
    isSelecting: { type: Boolean },
    selectionKeyPressed: { type: Boolean }
  },
  setup(e) {
    const {
      vueFlowRef: t,
      nodes: n,
      viewport: o,
      emits: s,
      userSelectionActive: i,
      removeSelectedElements: r,
      userSelectionRect: l,
      elementsSelectable: a,
      nodesSelectionActive: c,
      getSelectedEdges: d,
      getSelectedNodes: p,
      removeNodes: v,
      removeEdges: g,
      selectionMode: k,
      deleteKeyCode: $,
      multiSelectionKeyCode: S,
      multiSelectionActive: T,
      edgeLookup: D,
      nodeLookup: m
    } = He(), _ = ee(null), z = ee(0), U = ee(0), Z = ee(), G = ee(/* @__PURE__ */ new Map()), P = Ue(() => a.value && (e.isSelecting || i.value));
    let V = !1, Y = !1;
    const H = Ao($, { actInsideInputWithModifier: !1 }), J = Ao(S);
    Ne(H, (se) => {
      se && (v(p.value), g(d.value), c.value = !1);
    }), Ne(J, (se) => {
      T.value = se;
    });
    function C(se, ce) {
      return (ue) => {
        ue.target === ce && (se == null || se(ue));
      };
    }
    function A() {
      i.value = !1, l.value = null, z.value = 0, U.value = 0;
    }
    function M(se) {
      if (V) {
        V = !1;
        return;
      }
      s.paneClick(se), r(), c.value = !1;
    }
    function R(se) {
      se.preventDefault(), se.stopPropagation(), s.paneContextMenu(se);
    }
    function j(se) {
      s.paneScroll(se);
    }
    function ne(se) {
      var ce, ue, ge, te, we;
      if (Z.value = (ce = t.value) == null ? void 0 : ce.getBoundingClientRect(), !a.value || !e.isSelecting || se.button !== 0 || se.target !== _.value || !Z.value)
        return;
      (ge = (ue = se.target) == null ? void 0 : ue.setPointerCapture) == null || ge.call(ue, se.pointerId);
      const { x: xe, y: _e } = DE(se, Z.value);
      Y = !0, V = !1, G.value = /* @__PURE__ */ new Map();
      for (const [ke, W] of D.value)
        G.value.set(W.source, ((te = G.value.get(W.source)) == null ? void 0 : te.add(ke)) || /* @__PURE__ */ new Set([ke])), G.value.set(W.target, ((we = G.value.get(W.target)) == null ? void 0 : we.add(ke)) || /* @__PURE__ */ new Set([ke]));
      r(), l.value = {
        width: 0,
        height: 0,
        startX: xe,
        startY: _e,
        x: xe,
        y: _e
      }, s.selectionStart(se);
    }
    function le(se) {
      if (!Z.value || !l.value)
        return;
      V = !0;
      const { x: ce, y: ue } = tn(se, Z.value), { startX: ge = 0, startY: te = 0 } = l.value, we = {
        startX: ge,
        startY: te,
        x: ce < ge ? ce : ge,
        y: ue < te ? ue : te,
        width: Math.abs(ce - ge),
        height: Math.abs(ue - te)
      }, xe = of(
        n.value,
        we,
        o.value,
        k.value === ll.Partial,
        !0
      ), _e = /* @__PURE__ */ new Set(), ke = /* @__PURE__ */ new Set();
      for (const W of xe) {
        ke.add(W.id);
        const h = G.value.get(W.id);
        if (h)
          for (const I of h)
            _e.add(I);
      }
      if (z.value !== ke.size) {
        z.value = ke.size;
        const W = fn(m.value, ke, !0);
        s.nodesChange(W);
      }
      if (U.value !== _e.size) {
        U.value = _e.size;
        const W = fn(D.value, _e);
        s.edgesChange(W);
      }
      l.value = we, i.value = !0, c.value = !1;
    }
    function fe(se) {
      var ce;
      se.button !== 0 || !Y || ((ce = se.target) == null || ce.releasePointerCapture(se.pointerId), !i.value && l.value && se.target === _.value && M(se), z.value > 0 && (c.value = !0), A(), s.selectionEnd(se), e.selectionKeyPressed && (V = !1), Y = !1);
    }
    return (se, ce) => (N(), O("div", {
      ref_key: "container",
      ref: _,
      class: ve(["vue-flow__pane vue-flow__container", { selection: se.isSelecting }]),
      onClick: ce[0] || (ce[0] = (ue) => P.value ? void 0 : C(M, _.value)(ue)),
      onContextmenu: ce[1] || (ce[1] = (ue) => C(R, _.value)(ue)),
      onWheelPassive: ce[2] || (ce[2] = (ue) => C(j, _.value)(ue)),
      onPointerenter: ce[3] || (ce[3] = (ue) => P.value ? void 0 : B(s).paneMouseEnter(ue)),
      onPointerdown: ce[4] || (ce[4] = (ue) => P.value ? ne(ue) : B(s).paneMouseMove(ue)),
      onPointermove: ce[5] || (ce[5] = (ue) => P.value ? le(ue) : B(s).paneMouseMove(ue)),
      onPointerup: ce[6] || (ce[6] = (ue) => P.value ? fe(ue) : void 0),
      onPointerleave: ce[7] || (ce[7] = (ue) => B(s).paneMouseLeave(ue))
    }, [
      Bn(se.$slots, "default"),
      B(i) && B(l) ? (N(), vt(ME, {
        key: 0,
        "user-selection-rect": B(l)
      }, null, 8, ["user-selection-rect"])) : re("", !0),
      B(c) && B(p).length ? (N(), vt(PE, { key: 1 })) : re("", !0)
    ], 34));
  }
}), LE = {
  name: "Transform",
  compatConfig: { MODE: 3 }
}, VE = /* @__PURE__ */ Me({
  ...LE,
  setup(e) {
    const { viewport: t, fitViewOnInit: n, fitViewOnInitDone: o } = He(), s = ae(() => n.value ? !o.value : !1), i = ae(() => `translate(${t.value.x}px,${t.value.y}px) scale(${t.value.zoom})`);
    return (r, l) => (N(), O("div", {
      class: "vue-flow__transformationpane vue-flow__container",
      style: it({ transform: i.value, opacity: s.value ? 0 : void 0 })
    }, [
      Bn(r.$slots, "default")
    ], 4));
  }
}), zE = {
  name: "Viewport",
  compatConfig: { MODE: 3 }
}, BE = /* @__PURE__ */ Me({
  ...zE,
  setup(e) {
    const {
      minZoom: t,
      maxZoom: n,
      defaultViewport: o,
      translateExtent: s,
      zoomActivationKeyCode: i,
      selectionKeyCode: r,
      panActivationKeyCode: l,
      panOnScroll: a,
      panOnScrollMode: c,
      panOnScrollSpeed: d,
      panOnDrag: p,
      zoomOnDoubleClick: v,
      zoomOnPinch: g,
      zoomOnScroll: k,
      preventScrolling: $,
      noWheelClassName: S,
      noPanClassName: T,
      emits: D,
      connectionStartHandle: m,
      userSelectionActive: _,
      paneDragging: z,
      d3Zoom: U,
      d3Selection: Z,
      d3ZoomHandler: G,
      viewport: P,
      viewportRef: V,
      paneClickDistance: Y
    } = He();
    NE(V);
    const H = ee(!1), J = ee(!1);
    let C = null, A = !1, M = 0, R = {
      x: 0,
      y: 0,
      zoom: 0
    };
    const j = Ao(l), ne = Ao(r), le = Ao(i), fe = Ue(
      () => (!ne.value || ne.value && r.value === !0) && (j.value || p.value)
    ), se = Ue(() => j.value || a.value), ce = Ue(() => ne.value || r.value === !0 && fe.value !== !0);
    rt(() => {
      if (!V.value) {
        vi("Viewport element is missing");
        return;
      }
      const _e = V.value, ke = _e.getBoundingClientRect(), W = f2().clickDistance(Y.value).scaleExtent([t.value, n.value]).translateExtent(s.value), h = Ct(_e).call(W), I = h.on("wheel.zoom"), y = fo.translate(o.value.x ?? 0, o.value.y ?? 0).scale(jn(o.value.zoom ?? 1, t.value, n.value)), b = [
        [0, 0],
        [ke.width, ke.height]
      ], w = W.constrain()(y, b, s.value);
      W.transform(h, w), W.wheelDelta(ge), U.value = W, Z.value = h, G.value = I, P.value = { x: w.x, y: w.y, zoom: w.k }, W.on("start", (E) => {
        var F;
        if (!E.sourceEvent)
          return null;
        M = E.sourceEvent.button, H.value = !0;
        const K = we(E.transform);
        ((F = E.sourceEvent) == null ? void 0 : F.type) === "mousedown" && (z.value = !0), R = K, D.viewportChangeStart(K), D.moveStart({ event: E, flowTransform: K });
      }), W.on("end", (E) => {
        if (!E.sourceEvent)
          return null;
        if (H.value = !1, z.value = !1, ue(fe.value, M ?? 0) && !A && D.paneContextMenu(E.sourceEvent), A = !1, te(R, E.transform)) {
          const F = we(E.transform);
          R = F, D.viewportChangeEnd(F), D.moveEnd({ event: E, flowTransform: F });
        }
      }), W.filter((E) => {
        var F;
        const K = le.value || k.value, x = g.value && E.ctrlKey, f = E.button;
        if (f === 1 && E.type === "mousedown" && (xe(E, "vue-flow__node") || xe(E, "vue-flow__edge")))
          return !0;
        if (!fe.value && !K && !se.value && !v.value && !g.value || _.value || !v.value && E.type === "dblclick" || xe(E, S.value) && E.type === "wheel" || xe(E, T.value) && (E.type !== "wheel" || se.value && E.type === "wheel" && !le.value) || !g.value && E.ctrlKey && E.type === "wheel" || !K && !se.value && !x && E.type === "wheel")
          return !1;
        if (!g && E.type === "touchstart" && ((F = E.touches) == null ? void 0 : F.length) > 1)
          return E.preventDefault(), !1;
        if (!fe.value && (E.type === "mousedown" || E.type === "touchstart") || r.value === !0 && Array.isArray(p.value) && p.value.includes(0) && f === 0 || Array.isArray(p.value) && !p.value.includes(f) && (E.type === "mousedown" || E.type === "touchstart"))
          return !1;
        const q = Array.isArray(p.value) && p.value.includes(f) || r.value === !0 && Array.isArray(p.value) && !p.value.includes(0) || !f || f <= 1;
        return (!E.ctrlKey || j.value || E.type === "wheel") && q;
      }), Ne(
        [_, fe],
        () => {
          _.value && !H.value ? W.on("zoom", null) : _.value || W.on("zoom", (E) => {
            P.value = { x: E.transform.x, y: E.transform.y, zoom: E.transform.k };
            const F = we(E.transform);
            A = ue(fe.value, M ?? 0), D.viewportChange(F), D.move({ event: E, flowTransform: F });
          });
        },
        { immediate: !0 }
      ), Ne(
        [_, se, c, le, g, $, S],
        () => {
          se.value && !le.value && !_.value ? h.on(
            "wheel.zoom",
            (E) => {
              if (xe(E, S.value))
                return !1;
              const F = le.value || k.value, K = g.value && E.ctrlKey;
              if (!(!$.value || se.value || F || K))
                return !1;
              E.preventDefault(), E.stopImmediatePropagation();
              const f = h.property("__zoom").k || 1, q = Ys();
              if (!j.value && E.ctrlKey && g.value && q) {
                const Ce = Rt(E), Oe = ge(E), et = f * 2 ** Oe;
                W.scaleTo(h, et, Ce, E);
                return;
              }
              const X = E.deltaMode === 1 ? 20 : 1;
              let ie = c.value === Ro.Vertical ? 0 : E.deltaX * X, de = c.value === Ro.Horizontal ? 0 : E.deltaY * X;
              !q && E.shiftKey && c.value !== Ro.Vertical && !ie && de && (ie = de, de = 0), W.translateBy(
                h,
                -(ie / f) * d.value,
                -(de / f) * d.value
              );
              const be = we(h.property("__zoom"));
              C && clearTimeout(C), J.value ? (D.move({ event: E, flowTransform: be }), D.viewportChange(be), C = setTimeout(() => {
                D.moveEnd({ event: E, flowTransform: be }), D.viewportChangeEnd(be), J.value = !1;
              }, 150)) : (J.value = !0, D.moveStart({ event: E, flowTransform: be }), D.viewportChangeStart(be));
            },
            { passive: !1 }
          ) : typeof I < "u" && h.on(
            "wheel.zoom",
            function(E, F) {
              const K = !$.value && E.type === "wheel" && !E.ctrlKey, x = le.value || k.value, f = g.value && E.ctrlKey;
              if (!x && !a.value && !f && E.type === "wheel" || K || xe(E, S.value))
                return null;
              E.preventDefault(), I.call(this, E, F);
            },
            { passive: !1 }
          );
        },
        { immediate: !0 }
      );
    });
    function ue(_e, ke) {
      return ke === 2 && Array.isArray(_e) && _e.includes(2);
    }
    function ge(_e) {
      const ke = _e.ctrlKey && Ys() ? 10 : 1;
      return -_e.deltaY * (_e.deltaMode === 1 ? 0.05 : _e.deltaMode ? 1 : 2e-3) * ke;
    }
    function te(_e, ke) {
      return _e.x !== ke.x && !Number.isNaN(ke.x) || _e.y !== ke.y && !Number.isNaN(ke.y) || _e.zoom !== ke.k && !Number.isNaN(ke.k);
    }
    function we(_e) {
      return {
        x: _e.x,
        y: _e.y,
        zoom: _e.k
      };
    }
    function xe(_e, ke) {
      return _e.target.closest(`.${ke}`);
    }
    return (_e, ke) => (N(), O("div", {
      ref_key: "viewportRef",
      ref: V,
      class: "vue-flow__viewport vue-flow__container"
    }, [
      Q(AE, {
        "is-selecting": ce.value,
        "selection-key-pressed": B(ne),
        class: ve({
          connecting: !!B(m),
          dragging: B(z),
          draggable: B(p) === !0 || Array.isArray(B(p)) && B(p).includes(0)
        })
      }, {
        default: bn(() => [
          Q(VE, null, {
            default: bn(() => [
              Bn(_e.$slots, "default")
            ]),
            _: 3
          })
        ]),
        _: 3
      }, 8, ["is-selecting", "selection-key-pressed", "class"])
    ], 512));
  }
}), FE = ["id"], UE = ["id"], HE = ["id"], jE = {
  name: "A11yDescriptions",
  compatConfig: { MODE: 3 }
}, GE = /* @__PURE__ */ Me({
  ...jE,
  setup(e) {
    const { id: t, disableKeyboardA11y: n, ariaLiveMessage: o } = He();
    return (s, i) => (N(), O(me, null, [
      u("div", {
        id: `${B(qd)}-${B(t)}`,
        style: { display: "none" }
      }, " Press enter or space to select a node. " + L(B(n) ? "" : "You can then use the arrow keys to move the node around.") + " You can then use the arrow keys to move the node around, press delete to remove it and press escape to cancel. ", 9, FE),
      u("div", {
        id: `${B(Xd)}-${B(t)}`,
        style: { display: "none" }
      }, " Press enter or space to select an edge. You can then press delete to remove it or press escape to cancel. ", 8, UE),
      B(n) ? re("", !0) : (N(), O("div", {
        key: 0,
        id: `${B(g2)}-${B(t)}`,
        "aria-live": "assertive",
        "aria-atomic": "true",
        style: { position: "absolute", width: "1px", height: "1px", margin: "-1px", border: "0", padding: "0", overflow: "hidden", clip: "rect(0px, 0px, 0px, 0px)", "clip-path": "inset(100%)" }
      }, L(B(o)), 9, HE))
    ], 64));
  }
});
function YE() {
  const e = He();
  Ne(
    () => e.viewportHelper.value.viewportInitialized,
    (t) => {
      t && setTimeout(() => {
        e.emits.init(e), e.emits.paneReady(e);
      }, 1);
    }
  );
}
function qE(e, t, n) {
  return n === ye.Left ? e - t : n === ye.Right ? e + t : e;
}
function XE(e, t, n) {
  return n === ye.Top ? e - t : n === ye.Bottom ? e + t : e;
}
const dl = function({
  radius: e = 10,
  centerX: t = 0,
  centerY: n = 0,
  position: o = ye.Top,
  type: s
}) {
  return Ae("circle", {
    class: `vue-flow__edgeupdater vue-flow__edgeupdater-${s}`,
    cx: qE(t, e, o),
    cy: XE(n, e, o),
    r: e,
    stroke: "transparent",
    fill: "transparent"
  });
};
dl.props = ["radius", "centerX", "centerY", "position", "type"];
dl.compatConfig = { MODE: 3 };
const xu = dl, KE = /* @__PURE__ */ Me({
  name: "Edge",
  compatConfig: { MODE: 3 },
  props: ["id"],
  setup(e) {
    const {
      id: t,
      addSelectedEdges: n,
      connectionMode: o,
      edgeUpdaterRadius: s,
      emits: i,
      nodesSelectionActive: r,
      noPanClassName: l,
      getEdgeTypes: a,
      removeSelectedEdges: c,
      findEdge: d,
      findNode: p,
      isValidConnection: v,
      multiSelectionActive: g,
      disableKeyboardA11y: k,
      elementsSelectable: $,
      edgesUpdatable: S,
      edgesFocusable: T,
      hooks: D
    } = He(), m = ae(() => d(e.id)), { emit: _, on: z } = F2(m.value, i), U = Vt(gi), Z = ho(), G = ee(!1), P = ee(!1), V = ee(""), Y = ee(null), H = ee("source"), J = ee(null), C = Ue(
      () => typeof m.value.selectable > "u" ? $.value : m.value.selectable
    ), A = Ue(() => typeof m.value.updatable > "u" ? S.value : m.value.updatable), M = Ue(() => typeof m.value.focusable > "u" ? T.value : m.value.focusable);
    Fn(V2, e.id), Fn(z2, J);
    const R = ae(() => m.value.class instanceof Function ? m.value.class(m.value) : m.value.class), j = ae(() => m.value.style instanceof Function ? m.value.style(m.value) : m.value.style), ne = ae(() => {
      const b = m.value.type || "default", w = U == null ? void 0 : U[`edge-${b}`];
      if (w)
        return w;
      let E = m.value.template ?? a.value[b];
      if (typeof E == "string" && Z) {
        const F = Object.keys(Z.appContext.components);
        F && F.includes(b) && (E = lc(b, !1));
      }
      return E && typeof E != "string" ? E : (i.error(new Qe(We.EDGE_TYPE_MISSING, E)), !1);
    }), { handlePointerDown: le } = vf({
      nodeId: V,
      handleId: Y,
      type: H,
      isValidConnection: v,
      edgeUpdaterType: H,
      onEdgeUpdate: ce,
      onEdgeUpdateEnd: ue
    });
    return () => {
      const b = p(m.value.source), w = p(m.value.target), E = "pathOptions" in m.value ? m.value.pathOptions : {};
      if (!b && !w)
        return i.error(new Qe(We.EDGE_SOURCE_TARGET_MISSING, m.value.id, m.value.source, m.value.target)), null;
      if (!b)
        return i.error(new Qe(We.EDGE_SOURCE_MISSING, m.value.id, m.value.source)), null;
      if (!w)
        return i.error(new Qe(We.EDGE_TARGET_MISSING, m.value.id, m.value.target)), null;
      if (!m.value || m.value.hidden || b.hidden || w.hidden)
        return null;
      let F;
      o.value === Hn.Strict ? F = b.handleBounds.source : F = [...b.handleBounds.source || [], ...b.handleBounds.target || []];
      const K = pu(F, m.value.sourceHandle);
      let x;
      o.value === Hn.Strict ? x = w.handleBounds.target : x = [...w.handleBounds.target || [], ...w.handleBounds.source || []];
      const f = pu(x, m.value.targetHandle), q = (K == null ? void 0 : K.position) || ye.Bottom, X = (f == null ? void 0 : f.position) || ye.Top, { x: ie, y: de } = Gs(b, K, q), { x: be, y: Ce } = Gs(w, f, X);
      return m.value.sourceX = ie, m.value.sourceY = de, m.value.targetX = be, m.value.targetY = Ce, Ae(
        "g",
        {
          ref: J,
          key: e.id,
          "data-id": e.id,
          class: [
            "vue-flow__edge",
            `vue-flow__edge-${ne.value === !1 ? "default" : m.value.type || "default"}`,
            l.value,
            R.value,
            {
              updating: G.value,
              selected: m.value.selected,
              animated: m.value.animated,
              inactive: !C.value && !D.value.edgeClick.hasListeners()
            }
          ],
          onClick: te,
          onContextmenu: we,
          onDblclick: xe,
          onMouseenter: _e,
          onMousemove: ke,
          onMouseleave: W,
          onKeyDown: M.value ? y : void 0,
          tabIndex: M.value ? 0 : void 0,
          "aria-label": m.value.ariaLabel === null ? void 0 : m.value.ariaLabel || `Edge from ${m.value.source} to ${m.value.target}`,
          "aria-describedby": M.value ? `${Xd}-${t}` : void 0,
          role: M.value ? "button" : "img"
        },
        [
          P.value ? null : Ae(ne.value === !1 ? a.value.default : ne.value, {
            id: e.id,
            sourceNode: b,
            targetNode: w,
            source: m.value.source,
            target: m.value.target,
            type: m.value.type,
            updatable: A.value,
            selected: m.value.selected,
            animated: m.value.animated,
            label: m.value.label,
            labelStyle: m.value.labelStyle,
            labelShowBg: m.value.labelShowBg,
            labelBgStyle: m.value.labelBgStyle,
            labelBgPadding: m.value.labelBgPadding,
            labelBgBorderRadius: m.value.labelBgBorderRadius,
            data: m.value.data,
            events: { ...m.value.events, ...z },
            style: j.value,
            markerStart: `url('#${Ko(m.value.markerStart, t)}')`,
            markerEnd: `url('#${Ko(m.value.markerEnd, t)}')`,
            sourcePosition: q,
            targetPosition: X,
            sourceX: ie,
            sourceY: de,
            targetX: be,
            targetY: Ce,
            sourceHandleId: m.value.sourceHandle,
            targetHandleId: m.value.targetHandle,
            interactionWidth: m.value.interactionWidth,
            ...E
          }),
          [
            A.value === "source" || A.value === !0 ? [
              Ae(
                "g",
                {
                  onMousedown: h,
                  onMouseenter: fe,
                  onMouseout: se
                },
                Ae(xu, {
                  position: q,
                  centerX: ie,
                  centerY: de,
                  radius: s.value,
                  type: "source",
                  "data-type": "source"
                })
              )
            ] : null,
            A.value === "target" || A.value === !0 ? [
              Ae(
                "g",
                {
                  onMousedown: I,
                  onMouseenter: fe,
                  onMouseout: se
                },
                Ae(xu, {
                  position: X,
                  centerX: be,
                  centerY: Ce,
                  radius: s.value,
                  type: "target",
                  "data-type": "target"
                })
              )
            ] : null
          ]
        ]
      );
    };
    function fe() {
      G.value = !0;
    }
    function se() {
      G.value = !1;
    }
    function ce(b, w) {
      _.update({ event: b, edge: m.value, connection: w });
    }
    function ue(b) {
      _.updateEnd({ event: b, edge: m.value }), P.value = !1;
    }
    function ge(b, w) {
      b.button === 0 && (P.value = !0, V.value = w ? m.value.target : m.value.source, Y.value = (w ? m.value.targetHandle : m.value.sourceHandle) ?? "", H.value = w ? "target" : "source", _.updateStart({ event: b, edge: m.value }), le(b));
    }
    function te(b) {
      var w;
      const E = { event: b, edge: m.value };
      C.value && (r.value = !1, m.value.selected && g.value ? (c([m.value]), (w = J.value) == null || w.blur()) : n([m.value])), _.click(E);
    }
    function we(b) {
      _.contextMenu({ event: b, edge: m.value });
    }
    function xe(b) {
      _.doubleClick({ event: b, edge: m.value });
    }
    function _e(b) {
      _.mouseEnter({ event: b, edge: m.value });
    }
    function ke(b) {
      _.mouseMove({ event: b, edge: m.value });
    }
    function W(b) {
      _.mouseLeave({ event: b, edge: m.value });
    }
    function h(b) {
      ge(b, !0);
    }
    function I(b) {
      ge(b, !1);
    }
    function y(b) {
      var w;
      !k.value && Kd.includes(b.key) && C.value && (b.key === "Escape" ? ((w = J.value) == null || w.blur(), c([d(e.id)])) : n([d(e.id)]));
    }
  }
}), WE = KE, ZE = {
  [ye.Left]: ye.Right,
  [ye.Right]: ye.Left,
  [ye.Top]: ye.Bottom,
  [ye.Bottom]: ye.Top
}, JE = /* @__PURE__ */ Me({
  name: "ConnectionLine",
  compatConfig: { MODE: 3 },
  setup() {
    var e;
    const {
      id: t,
      connectionMode: n,
      connectionStartHandle: o,
      connectionEndHandle: s,
      connectionPosition: i,
      connectionLineType: r,
      connectionLineStyle: l,
      connectionLineOptions: a,
      connectionStatus: c,
      viewport: d,
      findNode: p
    } = He(), v = (e = Vt(gi)) == null ? void 0 : e["connection-line"], g = ae(() => {
      var D;
      return p((D = o.value) == null ? void 0 : D.nodeId);
    }), k = ae(() => {
      var D;
      return p((D = s.value) == null ? void 0 : D.nodeId) ?? null;
    }), $ = ae(() => ({
      x: (i.value.x - d.value.x) / d.value.zoom,
      y: (i.value.y - d.value.y) / d.value.zoom
    })), S = ae(
      () => a.value.markerStart ? `url(#${Ko(a.value.markerStart, t)})` : ""
    ), T = ae(
      () => a.value.markerEnd ? `url(#${Ko(a.value.markerEnd, t)})` : ""
    );
    return () => {
      var D, m, _, z;
      if (!g.value || !o.value)
        return null;
      const U = o.value.handleId, Z = o.value.type, G = g.value.handleBounds;
      let P = (G == null ? void 0 : G[Z]) || [];
      if (n.value === Hn.Loose) {
        const ne = (G == null ? void 0 : G[Z === "source" ? "target" : "source"]) || [];
        P = [...P, ...ne];
      }
      if (!P)
        return null;
      const V = (U ? P.find((ne) => ne.id === U) : P[0]) ?? null, Y = (V == null ? void 0 : V.position) || ye.Top, { x: H, y: J } = Gs(g.value, V, Y);
      let C = null;
      k.value && ((D = s.value) != null && D.handleId) && (n.value === Hn.Strict ? C = ((m = k.value.handleBounds[Z === "source" ? "target" : "source"]) == null ? void 0 : m.find(
        (ne) => {
          var le;
          return ne.id === ((le = s.value) == null ? void 0 : le.handleId);
        }
      )) || null : C = ((_ = [...k.value.handleBounds.source || [], ...k.value.handleBounds.target || []]) == null ? void 0 : _.find(
        (ne) => {
          var le;
          return ne.id === ((le = s.value) == null ? void 0 : le.handleId);
        }
      )) || null);
      const A = ((z = s.value) == null ? void 0 : z.position) ?? (Y ? ZE[Y] : null);
      if (!Y || !A)
        return null;
      const M = r.value ?? a.value.type ?? On.Bezier;
      let R = "";
      const j = {
        sourceX: H,
        sourceY: J,
        sourcePosition: Y,
        targetX: $.value.x,
        targetY: $.value.y,
        targetPosition: A
      };
      return M === On.Bezier ? [R] = wf(j) : M === On.Step ? [R] = Ir({
        ...j,
        borderRadius: 0
      }) : M === On.SmoothStep ? [R] = Ir(j) : M === On.SimpleBezier ? [R] = kf(j) : R = `M${H},${J} ${$.value.x},${$.value.y}`, Ae(
        "svg",
        { class: "vue-flow__edges vue-flow__connectionline vue-flow__container" },
        Ae(
          "g",
          { class: "vue-flow__connection" },
          v ? Ae(v, {
            sourceX: H,
            sourceY: J,
            sourcePosition: Y,
            targetX: $.value.x,
            targetY: $.value.y,
            targetPosition: A,
            sourceNode: g.value,
            sourceHandle: V,
            targetNode: k.value,
            targetHandle: C,
            markerEnd: T.value,
            markerStart: S.value,
            connectionStatus: c.value
          }) : Ae("path", {
            d: R,
            class: [a.value.class, c, "vue-flow__connection-path"],
            style: {
              ...l.value,
              ...a.value.style
            },
            "marker-end": T.value,
            "marker-start": S.value
          })
        )
      );
    };
  }
}), QE = JE, ex = ["id", "markerWidth", "markerHeight", "markerUnits", "orient"], tx = {
  name: "MarkerType",
  compatConfig: { MODE: 3 }
}, nx = /* @__PURE__ */ Me({
  ...tx,
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
    return (t, n) => (N(), O("marker", {
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
      t.type === B(xr).ArrowClosed ? (N(), O("polyline", {
        key: 0,
        style: it({
          stroke: t.color,
          fill: t.color,
          strokeWidth: t.strokeWidth
        }),
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        points: "-5,-4 0,0 -5,4 -5,-4"
      }, null, 4)) : re("", !0),
      t.type === B(xr).Arrow ? (N(), O("polyline", {
        key: 1,
        style: it({
          stroke: t.color,
          strokeWidth: t.strokeWidth
        }),
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        fill: "none",
        points: "-5,-4 0,0 -5,4"
      }, null, 4)) : re("", !0)
    ], 8, ex));
  }
}), ox = { class: "vue-flow__marker vue-flow__container" }, sx = {
  name: "MarkerDefinitions",
  compatConfig: { MODE: 3 }
}, ix = /* @__PURE__ */ Me({
  ...sx,
  setup(e) {
    const { id: t, edges: n, connectionLineOptions: o, defaultMarkerColor: s } = He(), i = ae(() => {
      const r = /* @__PURE__ */ new Set(), l = [], a = (c) => {
        if (c) {
          const d = Ko(c, t);
          r.has(d) || (typeof c == "object" ? l.push({ ...c, id: d, color: c.color || s.value }) : l.push({ id: d, color: s.value, type: c }), r.add(d));
        }
      };
      for (const c of [o.value.markerEnd, o.value.markerStart])
        a(c);
      for (const c of n.value)
        for (const d of [c.markerStart, c.markerEnd])
          a(d);
      return l.sort((c, d) => c.id.localeCompare(d.id));
    });
    return (r, l) => (N(), O("svg", ox, [
      u("defs", null, [
        (N(!0), O(me, null, Te(i.value, (a) => (N(), vt(nx, {
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
}), rx = {
  name: "Edges",
  compatConfig: { MODE: 3 }
}, lx = /* @__PURE__ */ Me({
  ...rx,
  setup(e) {
    const { findNode: t, getEdges: n, elevateEdgesOnSelect: o } = He();
    return (s, i) => (N(), O(me, null, [
      Q(ix),
      (N(!0), O(me, null, Te(B(n), (r) => (N(), O("svg", {
        key: r.id,
        class: "vue-flow__edges vue-flow__container",
        style: it({ zIndex: B(M2)(r, B(t), B(o)) })
      }, [
        Q(B(WE), {
          id: r.id
        }, null, 8, ["id"])
      ], 4))), 128)),
      Q(B(QE))
    ], 64));
  }
}), ax = /* @__PURE__ */ Me({
  name: "Node",
  compatConfig: { MODE: 3 },
  props: ["id", "resizeObserver"],
  setup(e) {
    const {
      id: t,
      noPanClassName: n,
      selectNodesOnDrag: o,
      nodesSelectionActive: s,
      multiSelectionActive: i,
      emits: r,
      removeSelectedNodes: l,
      addSelectedNodes: a,
      updateNodeDimensions: c,
      onUpdateNodeInternals: d,
      getNodeTypes: p,
      nodeExtent: v,
      elevateNodesOnSelect: g,
      disableKeyboardA11y: k,
      ariaLiveMessage: $,
      snapToGrid: S,
      snapGrid: T,
      nodeDragThreshold: D,
      nodesDraggable: m,
      elementsSelectable: _,
      nodesConnectable: z,
      nodesFocusable: U,
      hooks: Z
    } = He(), G = ee(null);
    Fn(pf, G), Fn(ff, e.id);
    const P = Vt(gi), V = ho(), Y = mf(), { node: H, parentNode: J } = gf(e.id), { emit: C, on: A } = G2(H, r), M = Ue(() => typeof H.draggable > "u" ? m.value : H.draggable), R = Ue(() => typeof H.selectable > "u" ? _.value : H.selectable), j = Ue(() => typeof H.connectable > "u" ? z.value : H.connectable), ne = Ue(() => typeof H.focusable > "u" ? U.value : H.focusable), le = Ue(
      () => R.value || M.value || Z.value.nodeClick.hasListeners() || Z.value.nodeDoubleClick.hasListeners() || Z.value.nodeMouseEnter.hasListeners() || Z.value.nodeMouseMove.hasListeners() || Z.value.nodeMouseLeave.hasListeners()
    ), fe = Ue(() => !!H.dimensions.width && !!H.dimensions.height), se = ae(() => {
      const w = H.type || "default", E = P == null ? void 0 : P[`node-${w}`];
      if (E)
        return E;
      let F = H.template || p.value[w];
      if (typeof F == "string" && V) {
        const K = Object.keys(V.appContext.components);
        K && K.includes(w) && (F = lc(w, !1));
      }
      return F && typeof F != "string" ? F : (r.error(new Qe(We.NODE_TYPE_MISSING, F)), !1);
    }), ce = hf({
      id: e.id,
      el: G,
      disabled: () => !M.value,
      selectable: R,
      dragHandle: () => H.dragHandle,
      onStart(w) {
        C.dragStart(w);
      },
      onDrag(w) {
        C.drag(w);
      },
      onStop(w) {
        C.dragStop(w);
      },
      onClick(w) {
        y(w);
      }
    }), ue = ae(() => H.class instanceof Function ? H.class(H) : H.class), ge = ae(() => {
      const w = (H.style instanceof Function ? H.style(H) : H.style) || {}, E = H.width instanceof Function ? H.width(H) : H.width, F = H.height instanceof Function ? H.height(H) : H.height;
      return !w.width && E && (w.width = typeof E == "string" ? E : `${E}px`), !w.height && F && (w.height = typeof F == "string" ? F : `${F}px`), w;
    }), te = Ue(() => Number(H.zIndex ?? ge.value.zIndex ?? 0));
    return d((w) => {
      (w.includes(e.id) || !w.length) && xe();
    }), rt(() => {
      Ne(
        () => H.hidden,
        (w = !1, E, F) => {
          !w && G.value && (e.resizeObserver.observe(G.value), F(() => {
            G.value && e.resizeObserver.unobserve(G.value);
          }));
        },
        { immediate: !0, flush: "post" }
      );
    }), Ne([() => H.type, () => H.sourcePosition, () => H.targetPosition], () => {
      nt(() => {
        c([{ id: e.id, nodeElement: G.value, forceUpdate: !0 }]);
      });
    }), Ne(
      [
        () => H.position.x,
        () => H.position.y,
        () => {
          var w;
          return (w = J.value) == null ? void 0 : w.computedPosition.x;
        },
        () => {
          var w;
          return (w = J.value) == null ? void 0 : w.computedPosition.y;
        },
        () => {
          var w;
          return (w = J.value) == null ? void 0 : w.computedPosition.z;
        },
        te,
        () => H.selected,
        () => H.dimensions.height,
        () => H.dimensions.width,
        () => {
          var w;
          return (w = J.value) == null ? void 0 : w.dimensions.height;
        },
        () => {
          var w;
          return (w = J.value) == null ? void 0 : w.dimensions.width;
        }
      ],
      ([w, E, F, K, x, f]) => {
        const q = {
          x: w,
          y: E,
          z: f + (g.value && H.selected ? 1e3 : 0)
        };
        typeof F < "u" && typeof K < "u" ? H.computedPosition = x2({ x: F, y: K, z: x }, q) : H.computedPosition = q;
      },
      { flush: "post", immediate: !0 }
    ), Ne([() => H.extent, v], ([w, E], [F, K]) => {
      (w !== F || E !== K) && we();
    }), H.extent === "parent" || typeof H.extent == "object" && "range" in H.extent && H.extent.range === "parent" ? vr(() => fe).toBe(!0).then(we) : we(), () => H.hidden ? null : Ae(
      "div",
      {
        ref: G,
        "data-id": H.id,
        class: [
          "vue-flow__node",
          `vue-flow__node-${se.value === !1 ? "default" : H.type || "default"}`,
          {
            [n.value]: M.value,
            dragging: ce == null ? void 0 : ce.value,
            draggable: M.value,
            selected: H.selected,
            selectable: R.value,
            parent: H.isParent
          },
          ue.value
        ],
        style: {
          visibility: fe.value ? "visible" : "hidden",
          zIndex: H.computedPosition.z ?? te.value,
          transform: `translate(${H.computedPosition.x}px,${H.computedPosition.y}px)`,
          pointerEvents: le.value ? "all" : "none",
          ...ge.value
        },
        tabIndex: ne.value ? 0 : void 0,
        role: ne.value ? "button" : void 0,
        "aria-describedby": k.value ? void 0 : `${qd}-${t}`,
        "aria-label": H.ariaLabel,
        onMouseenter: _e,
        onMousemove: ke,
        onMouseleave: W,
        onContextmenu: h,
        onClick: y,
        onDblclick: I,
        onKeydown: b
      },
      [
        Ae(se.value === !1 ? p.value.default : se.value, {
          id: H.id,
          type: H.type,
          data: H.data,
          events: { ...H.events, ...A },
          selected: H.selected,
          resizing: H.resizing,
          dragging: ce.value,
          connectable: j.value,
          position: H.computedPosition,
          dimensions: H.dimensions,
          isValidTargetPos: H.isValidTargetPos,
          isValidSourcePos: H.isValidSourcePos,
          parent: H.parentNode,
          parentNodeId: H.parentNode,
          zIndex: H.computedPosition.z ?? te.value,
          targetPosition: H.targetPosition,
          sourcePosition: H.sourcePosition,
          label: H.label,
          dragHandle: H.dragHandle,
          onUpdateNodeInternals: xe
        })
      ]
    );
    function we() {
      const w = H.computedPosition, { computedPosition: E, position: F } = al(
        H,
        S.value ? hi(w, T.value) : w,
        r.error,
        v.value,
        J.value
      );
      (H.computedPosition.x !== E.x || H.computedPosition.y !== E.y) && (H.computedPosition = { ...H.computedPosition, ...E }), (H.position.x !== F.x || H.position.y !== F.y) && (H.position = F);
    }
    function xe() {
      G.value && c([{ id: e.id, nodeElement: G.value, forceUpdate: !0 }]);
    }
    function _e(w) {
      ce != null && ce.value || C.mouseEnter({ event: w, node: H });
    }
    function ke(w) {
      ce != null && ce.value || C.mouseMove({ event: w, node: H });
    }
    function W(w) {
      ce != null && ce.value || C.mouseLeave({ event: w, node: H });
    }
    function h(w) {
      return C.contextMenu({ event: w, node: H });
    }
    function I(w) {
      return C.doubleClick({ event: w, node: H });
    }
    function y(w) {
      R.value && (!o.value || !M.value || D.value > 0) && Nr(
        H,
        i.value,
        a,
        l,
        s,
        !1,
        G.value
      ), C.click({ event: w, node: H });
    }
    function b(w) {
      if (!(Sr(w) || k.value))
        if (Kd.includes(w.key) && R.value) {
          const E = w.key === "Escape";
          Nr(
            H,
            i.value,
            a,
            l,
            s,
            E,
            G.value
          );
        } else M.value && H.selected && so[w.key] && (w.preventDefault(), $.value = `Moved selected node ${w.key.replace("Arrow", "").toLowerCase()}. New position, x: ${~~H.position.x}, y: ${~~H.position.y}`, Y(
          {
            x: so[w.key].x,
            y: so[w.key].y
          },
          w.shiftKey
        ));
    }
  }
}), ux = ax;
function cx(e = { includeHiddenNodes: !1 }) {
  const { nodes: t } = He();
  return ae(() => {
    if (t.value.length === 0)
      return !1;
    for (const n of t.value)
      if ((e.includeHiddenNodes || !n.hidden) && ((n == null ? void 0 : n.handleBounds) === void 0 || n.dimensions.width === 0 || n.dimensions.height === 0))
        return !1;
    return !0;
  });
}
const dx = { class: "vue-flow__nodes vue-flow__container" }, fx = {
  name: "Nodes",
  compatConfig: { MODE: 3 }
}, px = /* @__PURE__ */ Me({
  ...fx,
  setup(e) {
    const { getNodes: t, updateNodeDimensions: n, emits: o } = He(), s = cx(), i = ee();
    return Ne(
      s,
      (r) => {
        r && nt(() => {
          o.nodesInitialized(t.value);
        });
      },
      { immediate: !0 }
    ), rt(() => {
      i.value = new ResizeObserver((r) => {
        const l = r.map((a) => ({
          id: a.target.getAttribute("data-id"),
          nodeElement: a.target,
          forceUpdate: !0
        }));
        nt(() => n(l));
      });
    }), sn(() => {
      var r;
      return (r = i.value) == null ? void 0 : r.disconnect();
    }), (r, l) => (N(), O("div", dx, [
      i.value ? (N(!0), O(me, { key: 0 }, Te(B(t), (a, c, d, p) => {
        const v = [a.id];
        if (p && p.key === a.id && _h(p, v))
          return p;
        const g = (N(), vt(B(ux), {
          id: a.id,
          key: a.id,
          "resize-observer": i.value
        }, null, 8, ["id", "resize-observer"]));
        return g.memo = v, g;
      }, l, 0), 128)) : re("", !0)
    ]));
  }
});
function hx() {
  const { emits: e } = He();
  rt(() => {
    if (df()) {
      const t = document.querySelector(".vue-flow__pane");
      t && window.getComputedStyle(t).zIndex !== "1" && e.error(new Qe(We.MISSING_STYLES));
    }
  });
}
const vx = /* @__PURE__ */ u("div", { class: "vue-flow__edge-labels" }, null, -1), gx = {
  name: "VueFlow",
  compatConfig: { MODE: 3 }
}, mx = /* @__PURE__ */ Me({
  ...gx,
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
    const o = e, s = Dp(), i = Vi(o, "modelValue", n), r = Vi(o, "nodes", n), l = Vi(o, "edges", n), a = He(o), c = X2({ modelValue: i, nodes: r, edges: l }, o, a);
    return W2(n, a.hooks), YE(), hx(), Fn(gi, s), ni(() => {
      c();
    }), t(a), (d, p) => (N(), O("div", {
      ref: B(a).vueFlowRef,
      class: "vue-flow"
    }, [
      Q(BE, null, {
        default: bn(() => [
          Q(lx),
          vx,
          Q(px),
          Bn(d.$slots, "zoom-pane")
        ]),
        _: 3
      }),
      Bn(d.$slots, "default"),
      Q(GE)
    ], 512));
  }
}), yx = { class: "graph-node-head" }, bx = {
  key: 0,
  class: "level-tag"
}, _x = ["aria-pressed", "aria-label"], Wi = /* @__PURE__ */ Me({
  __name: "GraphNodeCard",
  props: {
    data: {},
    selected: { type: Boolean }
  },
  emits: ["toggle"],
  setup(e, { emit: t }) {
    const n = e, o = t, s = { persona: Jh, profile: dr, memory: Qh, rag: ov, voice: rv, live2d: cv, extensions: sv, skill: uv, tool: vv, mcp: av }, i = !!n.data.configurable && n.data.level > 0;
    return (r, l) => (N(), O("article", {
      class: ve(["graph-node", [`kind-${r.data.kind}`, `status-${r.data.status}`, { selected: r.selected }]])
    }, [
      Q(B(_n), {
        id: "left-target",
        type: "target",
        position: B(ye).Left,
        class: "graph-handle"
      }, null, 8, ["position"]),
      Q(B(_n), {
        id: "left-source",
        type: "source",
        position: B(ye).Left,
        class: "graph-handle"
      }, null, 8, ["position"]),
      Q(B(_n), {
        id: "right-target",
        type: "target",
        position: B(ye).Right,
        class: "graph-handle"
      }, null, 8, ["position"]),
      Q(B(_n), {
        id: "right-source",
        type: "source",
        position: B(ye).Right,
        class: "graph-handle"
      }, null, 8, ["position"]),
      u("div", yx, [
        (N(), vt(uc(s[r.data.kind]), { size: 16 })),
        u("b", null, L(r.data.label), 1),
        r.data.kind === "skill" || r.data.kind === "tool" ? (N(), O("span", bx, "L" + L(r.data.level), 1)) : re("", !0)
      ]),
      u("p", null, L(r.data.summary), 1),
      u("footer", null, [
        u("span", null, L(r.data.status === "available" ? "可用" : r.data.status === "unassigned" ? "未分配" : r.data.status === "partial" ? "部分可用" : "不可用"), 1),
        B(i) ? (N(), O("button", {
          key: 0,
          type: "button",
          class: ve(["graph-switch", { on: r.data.assigned }]),
          "aria-pressed": !!r.data.assigned,
          "aria-label": `${r.data.label}能力开关`,
          onClick: l[0] || (l[0] = gt((a) => o("toggle"), ["stop"]))
        }, l[1] || (l[1] = [
          u("i", null, null, -1)
        ]), 10, _x)) : re("", !0)
      ])
    ], 2));
  }
}), wx = /* @__PURE__ */ Me({
  __name: "BraceEdge",
  props: {
    sourceX: {},
    sourceY: {},
    targetX: {},
    targetY: {},
    selected: { type: Boolean }
  },
  setup(e) {
    const t = e, n = ae(() => {
      const o = t.targetX >= t.sourceX ? 1 : -1, s = Math.abs(t.targetX - t.sourceX), i = Math.min(86, s * 0.34), r = (t.sourceX + t.targetX) / 2, l = (t.sourceY + t.targetY) / 2;
      return `M ${t.sourceX} ${t.sourceY} C ${t.sourceX + o * i} ${t.sourceY}, ${r} ${t.sourceY}, ${r} ${l} C ${r} ${t.targetY}, ${t.targetX - o * i} ${t.targetY}, ${t.targetX} ${t.targetY}`;
    });
    return (o, s) => (N(), vt(B(os), {
      path: n.value,
      class: ve({ selected: o.selected })
    }, null, 8, ["path", "class"]));
  }
}), kx = {
  class: "graph-stage",
  "aria-label": "角色能力架构画布"
}, Ex = {
  class: "graph-tools",
  "aria-label": "画布工具"
}, xx = /* @__PURE__ */ Me({
  __name: "RoleGraphCanvas",
  props: {
    graph: {},
    selectedNodeId: {}
  },
  emits: ["select", "toggle", "reset"],
  setup(e, { emit: t }) {
    const n = e, o = t, s = ee([]), i = ee([]), { fitView: r, zoomIn: l, zoomOut: a } = He({ id: "role-architecture" }), c = ee(!1);
    function d() {
      return new Promise((m) => requestAnimationFrame(() => requestAnimationFrame(() => m())));
    }
    function p(m) {
      const _ = /* @__PURE__ */ new Set([m]), z = [m];
      for (; z.length; ) {
        const U = z.shift();
        for (const Z of i.value)
          Z.source !== U || _.has(Z.target) || (_.add(Z.target), z.push(Z.target));
      }
      return _;
    }
    function v(m) {
      var U;
      let _ = m;
      const z = /* @__PURE__ */ new Set();
      for (; !z.has(_); ) {
        z.add(_);
        const Z = (U = i.value.find((G) => G.target === _)) == null ? void 0 : U.source;
        if (!Z) return;
        if (Z === "module:extensions") return _;
        _ = Z;
      }
    }
    async function g(m, _) {
      !c.value || !m.length || (await nt(), await d(), await r({ nodes: m, ..._ }));
    }
    function k(m = 220) {
      const _ = s.value.filter((z) => z.data.kind === "persona" || ["profile", "memory", "rag", "voice", "live2d", "extensions"].includes(z.data.kind));
      return g(_.map((z) => z.id), { padding: 0.18, minZoom: 0.68, maxZoom: 1.08, duration: m });
    }
    function $(m = 220) {
      if (n.selectedNodeId === "module:extensions") {
        const z = s.value.filter((U) => U.id === "module:extensions" || ["skill", "tool"].includes(U.data.kind));
        return g(z.map((U) => U.id), { padding: 0.16, minZoom: 0.38, maxZoom: 0.86, duration: m });
      }
      const _ = v(n.selectedNodeId);
      if (_) {
        const z = p(_);
        return z.add("module:extensions"), g([...z], { padding: 0.24, minZoom: 0.58, maxZoom: 1, duration: m });
      }
      return k(m);
    }
    Ne(() => n.graph, async (m) => {
      s.value = m.nodes.map((_) => ({ ..._, selected: _.id === n.selectedNodeId })), i.value = m.edges.map((_) => ({ ..._, type: "brace", animated: !1 })), await nt(), await $();
    }, { immediate: !0, deep: !0 }), Ne(() => n.selectedNodeId, (m) => s.value = s.value.map((_) => ({ ..._, selected: _.id === m })));
    function S(m) {
      o("select", m.node.id);
    }
    async function T() {
      o("reset"), await nt(), k();
    }
    async function D() {
      c.value = !0, await $(0);
    }
    return (m, _) => (N(), O("section", kx, [
      u("div", Ex, [
        u("button", {
          type: "button",
          title: "放大",
          onClick: _[0] || (_[0] = () => B(l)())
        }, [
          Q(B(Pn), { size: 16 })
        ]),
        u("button", {
          type: "button",
          title: "缩小",
          onClick: _[1] || (_[1] = () => B(a)())
        }, [
          Q(B(lv), { size: 16 })
        ]),
        u("button", {
          type: "button",
          title: "适应视图",
          onClick: _[2] || (_[2] = (z) => B(r)({ padding: 0.15, duration: 220 }))
        }, [
          Q(B(iv), { size: 16 })
        ]),
        u("button", {
          type: "button",
          title: "恢复自动布局",
          onClick: T
        }, [
          Q(B(Kr), { size: 16 })
        ])
      ]),
      Q(B(mx), {
        id: "role-architecture",
        nodes: s.value,
        "onUpdate:nodes": _[3] || (_[3] = (z) => s.value = z),
        edges: i.value,
        "onUpdate:edges": _[4] || (_[4] = (z) => i.value = z),
        "min-zoom": 0.32,
        "max-zoom": 1.8,
        "fit-view-on-init": !1,
        onInit: D,
        onNodeClick: S
      }, {
        "node-persona": bn((z) => [
          Q(Wi, wi(Es(z)), null, 16)
        ]),
        "node-module": bn((z) => [
          Q(Wi, wi(Es(z)), null, 16)
        ]),
        "node-capability": bn((z) => [
          Q(Wi, qr(z, {
            onToggle: (U) => o("toggle", z.id)
          }), null, 16, ["onToggle"])
        ]),
        "edge-brace": bn((z) => [
          Q(wx, wi(Es(z)), null, 16)
        ]),
        _: 1
      }, 8, ["nodes", "edges"])
    ]));
  }
}), Sx = ["disabled", "aria-expanded"], Cx = {
  key: 0,
  id: "manage-role-menu",
  class: "role-picker-menu"
}, $x = { class: "role-search" }, Nx = {
  class: "role-list",
  role: "listbox",
  "aria-label": "选择角色"
}, Ix = ["aria-selected", "disabled", "onClick"], Mx = {
  key: 0,
  class: "role-empty"
}, Ox = /* @__PURE__ */ Me({
  __name: "RoleNavigator",
  props: {
    personas: {},
    selectedId: {},
    disabled: { type: Boolean }
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const n = e, o = t, s = ee(null), i = ee(null), r = ee(!1), l = ee(""), a = ae(() => n.personas.filter((k) => k.name.toLowerCase().includes(l.value.trim().toLowerCase()))), c = ae(() => n.personas.find((k) => k.id === n.selectedId));
    async function d() {
      n.disabled || (r.value = !r.value, r.value && await nt(() => {
        var k;
        return (k = i.value) == null ? void 0 : k.focus();
      }));
    }
    function p(k) {
      o("select", k), r.value = !1, l.value = "";
    }
    function v(k) {
      var $;
      ($ = s.value) != null && $.contains(k.target) || (r.value = !1);
    }
    function g(k) {
      k.key === "Escape" && (r.value = !1);
    }
    return Ne(() => n.disabled, (k) => {
      k && (r.value = !1);
    }), rt(() => {
      document.addEventListener("pointerdown", v), document.addEventListener("keydown", g);
    }), sn(() => {
      document.removeEventListener("pointerdown", v), document.removeEventListener("keydown", g);
    }), (k, $) => {
      var S;
      return N(), O("div", {
        ref_key: "root",
        ref: s,
        class: "role-picker"
      }, [
        u("button", {
          type: "button",
          class: "role-picker-trigger",
          disabled: k.disabled || !k.personas.length,
          "aria-haspopup": "listbox",
          "aria-expanded": r.value,
          "aria-controls": "manage-role-menu",
          onClick: d
        }, [
          Q(B(dr), { size: 17 }),
          u("strong", null, L(((S = c.value) == null ? void 0 : S.name) || "角色管理"), 1),
          Q(B(tv), { size: 15 })
        ], 8, Sx),
        r.value ? (N(), O("div", Cx, [
          u("label", $x, [
            Q(B(ur), { size: 15 }),
            $e(u("input", {
              ref_key: "searchInput",
              ref: i,
              "onUpdate:modelValue": $[0] || ($[0] = (T) => l.value = T),
              placeholder: "查找角色",
              "aria-label": "查找角色"
            }, null, 512), [
              [Ve, l.value]
            ])
          ]),
          u("div", Nx, [
            (N(!0), O(me, null, Te(a.value, (T) => {
              var D;
              return N(), O("button", {
                key: T.id,
                type: "button",
                role: "option",
                "aria-selected": T.id === k.selectedId,
                disabled: k.disabled,
                class: ve({ active: T.id === k.selectedId }),
                onClick: (m) => p(T.id)
              }, [
                Q(B(dr), { size: 17 }),
                u("span", null, [
                  u("b", null, L(T.name), 1),
                  u("small", null, L(((D = T.profile) == null ? void 0 : D.description) || "尚未填写人设"), 1)
                ])
              ], 10, Ix);
            }), 128)),
            a.value.length ? re("", !0) : (N(), O("p", Mx, "没有匹配的角色"))
          ])
        ])) : re("", !0)
      ], 512);
    };
  }
}), Tx = { class: "version-panel-layer" }, Px = {
  class: "version-panel",
  role: "dialog",
  "aria-modal": "true",
  "aria-labelledby": "version-panel-title"
}, Dx = { class: "version-panel-header" }, Rx = { class: "version-panel-kicker" }, Ax = { id: "version-panel-title" }, Lx = {
  key: 0,
  class: "version-message is-error"
}, Vx = { class: "version-panel-toolbar" }, zx = ["disabled"], Bx = ["disabled"], Fx = {
  key: 0,
  class: "version-form-hint"
}, Ux = { class: "version-form-actions" }, Hx = ["disabled"], jx = ["disabled"], Gx = {
  key: 2,
  class: "version-empty"
}, Yx = {
  key: 3,
  class: "version-empty"
}, qx = {
  key: 4,
  class: "version-body"
}, Xx = {
  class: "version-list",
  role: "listbox",
  "aria-label": "角色版本历史"
}, Kx = ["aria-selected", "disabled", "onClick"], Wx = { class: "version-number" }, Zx = { class: "version-item-copy" }, Jx = { class: "version-detail" }, Qx = { class: "version-detail-heading" }, eS = {
  key: 0,
  class: "version-note"
}, tS = {
  key: 1,
  class: "version-detail-loading"
}, nS = {
  key: 2,
  class: "version-facts"
}, oS = {
  key: 3,
  class: "version-detail-loading"
}, sS = { class: "version-action-row" }, iS = ["disabled"], rS = ["disabled"], lS = {
  key: 2,
  class: "version-current"
}, aS = {
  key: 4,
  class: "version-published"
}, uS = {
  key: 5,
  class: "version-panel-footnote"
}, cS = /* @__PURE__ */ Me({
  __name: "VersionPanel",
  props: {
    personaId: {},
    personaName: {},
    disabled: { type: Boolean }
  },
  emits: ["close", "changed"],
  setup(e, { emit: t }) {
    const n = e, o = t, s = ee([]), i = ee(""), r = ee(null), l = ee(!1), a = ee(!1), c = ee(""), d = ee(""), p = ee(!1), v = ee(""), g = ee("");
    let k = 0;
    const $ = ae(() => l.value || a.value || !!c.value), S = ae(() => s.value.find((M) => M.id === i.value)), T = ae(() => {
      var M;
      return (M = r.value) == null ? void 0 : M.snapshot;
    }), D = ae(() => {
      var M;
      return Object.keys(((M = T.value) == null ? void 0 : M.capability_overrides) || {}).length;
    }), m = ae(() => {
      var M, R;
      return ((R = (M = T.value) == null ? void 0 : M.document_ids) == null ? void 0 : R.length) || 0;
    }), _ = ae(() => {
      var M;
      return ((M = T.value) == null ? void 0 : M.mcp_server_names) || [];
    });
    function z(M) {
      return { draft: "草稿", published: "已发布", superseded: "已替代", archived: "已归档" }[M] || M;
    }
    function U(M) {
      return `is-${M}`;
    }
    function Z(M) {
      if (!M) return "—";
      const R = new Date(M);
      return Number.isNaN(R.getTime()) ? M : new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(R);
    }
    function G(M) {
      return M instanceof Wr && M.status === 404 ? "版本接口尚未启用，请先启用角色版本 API。" : M instanceof Error ? M.message : String(M);
    }
    async function P() {
      const M = ++k;
      if (s.value = [], i.value = "", r.value = null, d.value = "", !!n.personaId) {
        l.value = !0;
        try {
          const R = await Ov(n.personaId);
          if (M !== k) return;
          s.value = R, R.length && await V(R[0].id, M);
        } catch (R) {
          M === k && (d.value = G(R));
        } finally {
          M === k && (l.value = !1);
        }
      }
    }
    async function V(M, R = k) {
      i.value = M, r.value = null, d.value = "", a.value = !0;
      try {
        const j = await Tv(n.personaId, M);
        R === k && (r.value = j);
      } catch (j) {
        R === k && (d.value = G(j));
      } finally {
        R === k && (a.value = !1);
      }
    }
    function Y() {
      var M;
      n.disabled || $.value || (p.value = !0, v.value = `版本 ${Math.max(((M = s.value[0]) == null ? void 0 : M.version_number) || 0, 0) + 1}`, g.value = "");
    }
    function H() {
      c.value || (p.value = !1);
    }
    async function J() {
      if (!(n.disabled || $.value)) {
        c.value = "create", d.value = "";
        try {
          const M = await Pv(n.personaId, { label: v.value, note: g.value });
          p.value = !1, s.value = [M, ...s.value.filter((R) => R.id !== M.id)], i.value = M.id, r.value = M, o("changed", M);
        } catch (M) {
          d.value = G(M);
        } finally {
          c.value = "";
        }
      }
    }
    function C(M) {
      s.value = s.value.map((R) => R.id === M.id ? M : R), i.value = M.id, r.value = M;
    }
    async function A(M) {
      const R = i.value;
      if (!(!R || n.disabled || $.value) && !(M === "rollback" && !window.confirm("确定回滚到这个角色版本？当前未保存的运行配置不会自动保留。"))) {
        c.value = R, d.value = "";
        try {
          const j = M === "publish" ? await Dv(n.personaId, R) : await Rv(n.personaId, R);
          C(j), o("changed", j), await P();
        } catch (j) {
          d.value = G(j);
        } finally {
          c.value = "";
        }
      }
    }
    return Ne(() => n.personaId, () => {
      P();
    }, { immediate: !0 }), (M, R) => {
      var j, ne, le, fe, se, ce, ue;
      return N(), O("div", Tx, [
        u("button", {
          type: "button",
          class: "version-panel-backdrop",
          "aria-label": "关闭版本面板",
          onClick: R[0] || (R[0] = (ge) => o("close"))
        }),
        u("section", Px, [
          u("header", Dx, [
            u("div", null, [
              u("span", Rx, [
                Q(B(zc), { size: 13 }),
                R[6] || (R[6] = he("运行版本"))
              ]),
              u("h2", Ax, L(M.personaName || "当前角色"), 1),
              R[7] || (R[7] = u("p", null, "保存和切换角色的运行配置", -1))
            ]),
            u("button", {
              type: "button",
              class: "icon-button",
              "aria-label": "关闭版本面板",
              onClick: R[1] || (R[1] = (ge) => o("close"))
            }, [
              Q(B(Kt), { size: 17 })
            ])
          ]),
          d.value ? (N(), O("p", Lx, L(d.value), 1)) : re("", !0),
          u("div", Vx, [
            u("span", null, L(s.value.length ? `${s.value.length} 个版本` : "版本历史"), 1),
            u("div", null, [
              u("button", {
                type: "button",
                class: "text-button",
                disabled: $.value,
                onClick: P
              }, [
                Q(B(Nt), { size: 14 }),
                R[8] || (R[8] = he("刷新"))
              ], 8, zx),
              u("button", {
                type: "button",
                class: "text-button is-primary",
                disabled: M.disabled || $.value,
                onClick: Y
              }, [
                Q(B(Pn), { size: 14 }),
                R[9] || (R[9] = he("创建"))
              ], 8, Bx)
            ])
          ]),
          p.value ? (N(), O("form", {
            key: 1,
            class: "version-create-form",
            onSubmit: gt(J, ["prevent"])
          }, [
            u("label", null, [
              R[10] || (R[10] = u("span", null, "版本名称", -1)),
              $e(u("input", {
                "onUpdate:modelValue": R[2] || (R[2] = (ge) => v.value = ge),
                maxlength: "255",
                placeholder: "例如：稳定版"
              }, null, 512), [
                [Ve, v.value]
              ])
            ]),
            u("label", null, [
              R[11] || (R[11] = u("span", null, "备注", -1)),
              $e(u("textarea", {
                "onUpdate:modelValue": R[3] || (R[3] = (ge) => g.value = ge),
                rows: "2",
                maxlength: "5000",
                placeholder: "记录这次配置的变化"
              }, null, 512), [
                [Ve, g.value]
              ])
            ]),
            M.disabled ? (N(), O("p", Fx, "请先保存顶部的角色配置，再创建版本。")) : re("", !0),
            u("div", Ux, [
              u("button", {
                type: "button",
                class: "text-button",
                disabled: !!c.value,
                onClick: H
              }, "取消", 8, Hx),
              u("button", {
                type: "submit",
                class: "text-button is-primary",
                disabled: M.disabled || $.value
              }, L(c.value === "create" ? "创建中…" : "保存版本"), 9, jx)
            ])
          ], 32)) : re("", !0),
          l.value ? (N(), O("div", Gx, "正在读取版本历史…")) : !s.value.length && !d.value ? (N(), O("div", Yx, [
            Q(B(Zh), { size: 22 }),
            R[12] || (R[12] = u("strong", null, "还没有保存的运行版本", -1)),
            R[13] || (R[13] = u("span", null, "创建版本会记录当前已保存的角色配置。", -1))
          ])) : s.value.length ? (N(), O("div", qx, [
            u("div", Xx, [
              (N(!0), O(me, null, Te(s.value, (ge) => (N(), O("button", {
                key: ge.id,
                type: "button",
                class: ve(["version-item", { selected: ge.id === i.value }]),
                "aria-selected": ge.id === i.value,
                role: "option",
                disabled: $.value,
                onClick: (te) => V(ge.id)
              }, [
                u("span", Wx, "v" + L(ge.version_number), 1),
                u("span", Zx, [
                  u("strong", null, L(ge.label || `版本 ${ge.version_number}`), 1),
                  u("small", null, L(Z(ge.created_at)), 1)
                ]),
                u("span", {
                  class: ve(["version-status", U(ge.status)])
                }, L(z(ge.status)), 3)
              ], 10, Kx))), 128))
            ]),
            u("div", Jx, [
              u("div", Qx, [
                u("div", null, [
                  R[14] || (R[14] = u("span", null, "当前选择", -1)),
                  u("strong", null, L(((j = S.value) == null ? void 0 : j.label) || `版本 ${((ne = S.value) == null ? void 0 : ne.version_number) || ""}`), 1)
                ]),
                u("span", {
                  class: ve(["version-status", U(((le = S.value) == null ? void 0 : le.status) || "draft")])
                }, L(z(((fe = S.value) == null ? void 0 : fe.status) || "draft")), 3)
              ]),
              (se = S.value) != null && se.note ? (N(), O("p", eS, L(S.value.note), 1)) : re("", !0),
              a.value ? (N(), O("div", tS, "正在读取快照…")) : T.value ? (N(), O("dl", nS, [
                u("div", null, [
                  R[15] || (R[15] = u("dt", null, "角色名称", -1)),
                  u("dd", null, L(T.value.name), 1)
                ]),
                u("div", null, [
                  R[16] || (R[16] = u("dt", null, "知识库", -1)),
                  u("dd", null, L(T.value.knowledge_space_id || "未绑定"), 1)
                ]),
                u("div", null, [
                  R[17] || (R[17] = u("dt", null, "资料", -1)),
                  u("dd", null, L(m.value) + " 份资料", 1)
                ]),
                u("div", null, [
                  R[18] || (R[18] = u("dt", null, "能力策略", -1)),
                  u("dd", null, L(D.value) + " 项能力", 1)
                ]),
                u("div", null, [
                  R[19] || (R[19] = u("dt", null, "MCP 授权", -1)),
                  u("dd", null, L(_.value.length ? _.value.join("、") : "无"), 1)
                ])
              ])) : (N(), O("p", oS, "暂无快照详情")),
              u("div", sS, [
                ((ce = S.value) == null ? void 0 : ce.status) === "draft" ? (N(), O("button", {
                  key: 0,
                  type: "button",
                  class: "version-action is-primary",
                  disabled: M.disabled || $.value,
                  onClick: R[4] || (R[4] = (ge) => A("publish"))
                }, [
                  Q(B(fv), { size: 14 }),
                  R[20] || (R[20] = he("发布版本"))
                ], 8, iS)) : S.value && S.value.status !== "published" ? (N(), O("button", {
                  key: 1,
                  type: "button",
                  class: "version-action",
                  disabled: M.disabled || $.value,
                  onClick: R[5] || (R[5] = (ge) => A("rollback"))
                }, [
                  Q(B(Kr), { size: 14 }),
                  R[21] || (R[21] = he("回滚到此版本"))
                ], 8, rS)) : (N(), O("span", lS, [
                  Q(B(ao), { size: 14 }),
                  R[22] || (R[22] = he("这是当前发布版本"))
                ]))
              ]),
              (ue = S.value) != null && ue.published_at ? (N(), O("p", aS, [
                Q(B(nv), { size: 13 }),
                he("发布于 " + L(Z(S.value.published_at)), 1)
              ])) : re("", !0)
            ])
          ])) : re("", !0),
          !d.value && M.disabled && s.value.length ? (N(), O("p", uS, "顶部存在未保存修改时，版本操作会暂时停用。")) : re("", !0)
        ])
      ]);
    };
  }
}), fl = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [o, s] of t)
    n[o] = s;
  return n;
}, dS = /* @__PURE__ */ fl(cS, [["__scopeId", "data-v-81aec505"]]);
function fS(e, t, n) {
  const o = {
    ...e,
    capabilities: {
      ...e.capabilities,
      overrides: { ...e.capabilities.overrides }
    },
    grants: { servers: e.grants.servers.map((r) => ({ ...r })) }
  }, s = e.capabilities.packages.find((r) => r.id === t);
  if (!s || (n === "inherit" ? delete o.capabilities.overrides[t] : o.capabilities.overrides[t] = n === "allow", n !== "allow")) return o;
  for (const r of s.dependencies)
    r.id && (o.capabilities.overrides[r.id] = !0);
  const i = new Set(s.required_servers);
  return o.grants.servers.forEach((r) => {
    !r.global && i.has(r.name) && (r.authorized = !0);
  }), o;
}
async function pS(e) {
  const t = Object.entries(e), n = await Promise.all(t.map(async ([o, s]) => {
    try {
      return await s(), { domain: o, ok: !0 };
    } catch (i) {
      return { domain: o, ok: !1, message: i instanceof Error ? i.message : String(i) };
    }
  }));
  return {
    ok: n.every((o) => o.ok),
    savedDomains: n.filter((o) => o.ok).map((o) => o.domain),
    failedDomains: n.filter((o) => !o.ok).map(({ domain: o, message: s }) => ({ domain: o, message: s }))
  };
}
function hS(e, t, n) {
  const o = Je(e);
  return n.has("profile") && (o.persona = Je(t.persona)), n.has("capabilities") && (o.capabilities.overrides = Je(t.capabilities.overrides)), n.has("grants") && (o.grants.servers = Je(t.grants.servers)), o;
}
function vS() {
  const e = ee([]), t = ee(""), n = ee(null), o = ee(null), s = ee(""), i = ee(/* @__PURE__ */ new Set()), r = ee(!1), l = ee(!1), a = ee(!1), c = ee(""), d = ee(""), p = ae(() => i.value.size > 0);
  async function v() {
    if (!r.value) {
      r.value = !0, c.value = "";
      try {
        e.value = await Oi();
        const J = t.value || sessionStorage.getItem("yumeno.manage.persona"), C = e.value.find((A) => A.id === J) || e.value[0];
        C && await k(C.id, !0);
      } catch (J) {
        c.value = J instanceof Error ? J.message : String(J);
      } finally {
        r.value = !1;
      }
    }
  }
  async function g() {
    p.value || r.value || l.value || a.value || await v();
  }
  async function k(J, C = !1) {
    if (!C && (l.value || a.value)) {
      d.value = "当前操作完成后才能切换角色";
      return;
    }
    if (!C && p.value && !window.confirm("当前角色有未保存修改，放弃后切换角色？")) return;
    const A = e.value.find((M) => M.id === J);
    if (A) {
      r.value = !0, c.value = "", d.value = "";
      try {
        const M = await pa(A);
        n.value = M, o.value = Je(M), t.value = J, s.value = `persona:${J}`, i.value = /* @__PURE__ */ new Set(), sessionStorage.setItem("yumeno.manage.persona", J);
      } catch (M) {
        c.value = M instanceof Error ? M.message : String(M);
      } finally {
        r.value = !1;
      }
    }
  }
  function $(J) {
    s.value = J;
  }
  function S(J) {
    o.value && (o.value.persona = Je(J), i.value = new Set(i.value).add("profile"));
  }
  function T(J, C) {
    if (!o.value) return;
    o.value = fS(o.value, J, C);
    const A = new Set(i.value);
    A.add("capabilities"), A.add("grants"), i.value = A;
  }
  function D(J, C) {
    if (!o.value) return;
    const A = o.value.grants.servers.find((M) => M.name === J);
    A && !A.global && (A.authorized = C), i.value = new Set(i.value).add("grants");
  }
  function m() {
    n.value && (o.value = Je(n.value), i.value = /* @__PURE__ */ new Set(), d.value = "已撤销本轮修改");
  }
  async function _() {
    if (!o.value || !n.value) return;
    const J = await Hc(o.value.persona.id);
    o.value.documents = J, n.value.documents = Je(J);
  }
  async function z() {
    if (!(!o.value || !n.value || a.value)) {
      a.value = !0, c.value = "", d.value = "正在扫描 Live2D 模型...";
      try {
        const J = await jc();
        o.value.resources = { ...o.value.resources || { voiceAssets: [], live2dModels: [] }, live2dModels: J }, n.value.resources = { ...n.value.resources || { voiceAssets: [], live2dModels: [] }, live2dModels: Je(J) }, d.value = `已发现 ${J.length} 个 Live2D 模型`;
      } catch (J) {
        c.value = J instanceof Error ? J.message : String(J);
      } finally {
        a.value = !1;
      }
    }
  }
  async function U() {
    if (!a.value) {
      a.value = !0, c.value = "";
      try {
        await kv(), d.value = "已打开 Live2D 模型文件夹";
      } catch (J) {
        c.value = J instanceof Error ? J.message : String(J);
      } finally {
        a.value = !1;
      }
    }
  }
  function Z(J, C = 10) {
    C <= 0 || window.setTimeout(async () => {
      var A;
      if (((A = o.value) == null ? void 0 : A.persona.id) === J)
        try {
          await _(), o.value.documents.some((R) => ["converting", "preview_ready", "indexing"].includes(String(R.status))) && Z(J, C - 1);
        } catch {
        }
    }, 1400);
  }
  async function G(J, C) {
    if (!o.value || !J.length && !C.trim() || a.value) return !1;
    a.value = !0, c.value = "", d.value = "正在写入角色知识库...";
    try {
      const A = o.value.persona.id;
      return await $v(o.value.persona, J, C), await _(), Z(A), d.value = "资料已提交，正在建立索引", !0;
    } catch (A) {
      return c.value = A instanceof Error ? A.message : String(A), !1;
    } finally {
      a.value = !1;
    }
  }
  async function P(J) {
    a.value = !0, c.value = "";
    try {
      await Nv(J), await _(), d.value = "资料已删除";
    } catch (C) {
      c.value = C instanceof Error ? C.message : String(C);
    } finally {
      a.value = !1;
    }
  }
  async function V(J) {
    var C;
    a.value = !0, c.value = "";
    try {
      const A = ((C = o.value) == null ? void 0 : C.persona.id) || "";
      await Iv(J), await _(), A && Z(A), d.value = "已重新提交索引";
    } catch (A) {
      c.value = A instanceof Error ? A.message : String(A);
    } finally {
      a.value = !1;
    }
  }
  async function Y() {
    if (o.value) {
      a.value = !0, c.value = "";
      try {
        const J = o.value.persona.id;
        await Cv(J), e.value = (await Oi()).filter((C) => C.id !== J), n.value = null, o.value = null, t.value = "", i.value = /* @__PURE__ */ new Set(), e.value[0] && await k(e.value[0].id, !0), d.value = "角色已删除";
      } catch (J) {
        c.value = J instanceof Error ? J.message : String(J);
      } finally {
        a.value = !1;
      }
    }
  }
  async function H() {
    if (!o.value || !p.value) return;
    l.value = !0, c.value = "", d.value = "";
    const J = Je(o.value), C = {};
    i.value.has("profile") && (C.profile = () => Ev(J.persona)), i.value.has("capabilities") && (C.capabilities = () => xv(J.persona.id, J.capabilities.overrides)), i.value.has("grants") && (C.grants = () => Sv(J.persona.id, J.grants.servers));
    const A = await pS(C), M = new Set(A.failedDomains.map((R) => R.domain));
    if (i.value = M, A.savedDomains.length)
      try {
        e.value = await Oi();
        const R = e.value.find((ne) => ne.id === J.persona.id) || J.persona, j = await pa(R);
        n.value = j, o.value = hS(j, J, M);
      } catch (R) {
        const j = Je(n.value || J);
        A.savedDomains.includes("profile") && (j.persona = Je(J.persona)), A.savedDomains.includes("capabilities") && (j.capabilities.overrides = Je(J.capabilities.overrides)), A.savedDomains.includes("grants") && (j.grants.servers = Je(J.grants.servers)), n.value = j, o.value = J, c.value = `配置已保存，但刷新失败：${R instanceof Error ? R.message : String(R)}`;
      }
    A.ok ? d.value = "角色配置已保存" : c.value = A.failedDomains.map((R) => `${R.domain}: ${R.message}`).join("；"), l.value = !1;
  }
  return { personas: e, selectedPersonaId: t, snapshot: n, draft: o, selectedNodeId: s, dirtyDomains: i, loading: r, isSaving: l, operationPending: a, error: c, message: d, isDirty: p, initialize: v, refreshIfClean: g, selectPersona: k, selectNode: $, updateProfile: S, setCapability: T, setServer: D, discard: m, save: H, addDocuments: G, removeDocument: P, reindexDocument: V, refreshLive2dResources: z, openLive2dDirectory: U, removeCurrentPersona: Y };
}
const gS = { class: "workbench-toolbar" }, mS = { class: "toolbar-identity" }, yS = { class: "toolbar-actions" }, bS = {
  key: 0,
  class: "dirty-state"
}, _S = ["disabled"], wS = ["disabled"], kS = ["disabled"], ES = {
  key: 0,
  class: "workbench-message error"
}, xS = {
  key: 1,
  class: "workbench-message"
}, SS = { class: "workbench-content" }, CS = { class: "workbench-canvas-region" }, $S = {
  key: 0,
  class: "workbench-loading"
}, NS = {
  key: 1,
  class: "workbench-empty"
}, IS = /* @__PURE__ */ Me({
  __name: "App",
  setup(e) {
    const t = vS(), n = ee(0), o = ee(0), s = ee(!1), i = ae(() => t.isSaving.value || t.operationPending.value), r = ae(() => t.draft.value ? Bv(t.draft.value) : { nodes: [], edges: [] }), l = ae(() => (n.value, Y1(K1(r.value, t.selectedNodeId.value)))), a = ae(() => r.value.nodes.find((V) => V.id === t.selectedNodeId.value));
    function c(V) {
      const Y = l.value.nodes.find((H) => H.id === V);
      if (Y != null && Y.data.configurable) {
        if (Y.data.kind === "mcp" && Y.data.sourceId) {
          t.setServer(Y.data.sourceId, !Y.data.assigned);
          return;
        }
        t.setCapability(V, Y.data.assigned ? "deny" : "allow");
      }
    }
    async function d() {
      var Y, H, J;
      const V = (H = (Y = t.draft.value) == null ? void 0 : Y.persona.profile) == null ? void 0 : H.tts;
      if (V != null && V.voice_asset_id)
        try {
          const C = await Mv(V.voice_asset_id, V.output_language || "auto"), A = new Audio(URL.createObjectURL(C)), M = (J = window.PL) == null ? void 0 : J.audio;
          M ? await M.play(A) : await A.play();
        } catch (C) {
          t.error.value = C instanceof Error ? C.message : String(C);
        }
    }
    function p() {
      var V;
      (V = document.querySelector('[data-view="voice"]')) == null || V.click();
    }
    function v() {
      var V;
      (V = document.querySelector('[data-view="test"]')) == null || V.click();
    }
    function g() {
      !t.draft.value || i.value || (s.value = !s.value);
    }
    function k() {
      s.value = !1;
    }
    async function $() {
      await t.refreshIfClean();
    }
    async function S() {
      var Y;
      const V = (Y = t.draft.value) == null ? void 0 : Y.persona.name;
      !V || !window.confirm(`永久删除“${V}”及其资料、记忆、向量和对话？此操作无法恢复。`) || await t.removeCurrentPersona();
    }
    async function T(V) {
      window.confirm("从角色资料中删除该文件？知识库向量与本地文件将一并移除。") && await t.removeDocument(V);
    }
    async function D(V, Y) {
      await t.addDocuments(V, Y) && (o.value += 1);
    }
    function m(V, Y) {
      var C, A;
      const H = document.querySelector("#preview-title"), J = document.querySelector("#preview-content");
      !H || !J || (H.textContent = V, J.replaceChildren(typeof Y == "string" ? document.createTextNode(Y) : Y), (C = document.querySelector("#preview-drawer")) == null || C.classList.add("is-open"), (A = document.querySelector("#preview-backdrop")) == null || A.classList.add("is-open"));
    }
    function _() {
      var V, Y;
      (V = document.querySelector("#preview-drawer")) == null || V.classList.remove("is-open"), (Y = document.querySelector("#preview-backdrop")) == null || Y.classList.remove("is-open");
    }
    function z(V) {
      m(String(V.original_filename || V.original_name || "资料预览"), String(V.markdown_preview || V.error_message || "暂无预览内容"));
    }
    async function U(V) {
      if (V.type.startsWith("image/")) {
        const H = document.createElement("img"), J = URL.createObjectURL(V);
        H.src = J, H.alt = V.name, H.style.maxWidth = "100%", H.onload = () => URL.revokeObjectURL(J), m(V.name, H);
        return;
      }
      const Y = V.type.startsWith("text/") || /\.(md|txt|json|csv|ya?ml)$/i.test(V.name);
      m(V.name, Y ? await V.text() : "该文件将在上传转换后提供 Markdown 预览。");
    }
    function Z(V) {
      t.isDirty.value && (V.preventDefault(), V.returnValue = "");
    }
    function G(V) {
      var H;
      const Y = ((H = V == null ? void 0 : V.detail) == null ? void 0 : H.nodeId) || sessionStorage.getItem("yumeno.manage.node");
      Y && (sessionStorage.removeItem("yumeno.manage.node"), t.selectNode(Y));
    }
    async function P() {
      await t.refreshIfClean(), G();
    }
    return Ne(() => t.selectedPersonaId.value, () => {
      s.value = !1;
    }), rt(async () => {
      var V, Y, H;
      await t.initialize(), G(), window.addEventListener("beforeunload", Z), (V = document.querySelector("#role-workbench-root")) == null || V.addEventListener("yumeno:manage-show", P), document.addEventListener("yumeno:manage-select-node", G), (Y = document.querySelector("#close-preview")) == null || Y.addEventListener("click", _), (H = document.querySelector("#preview-backdrop")) == null || H.addEventListener("click", _);
    }), sn(() => {
      var V, Y, H;
      window.removeEventListener("beforeunload", Z), (V = document.querySelector("#role-workbench-root")) == null || V.removeEventListener("yumeno:manage-show", P), document.removeEventListener("yumeno:manage-select-node", G), (Y = document.querySelector("#close-preview")) == null || Y.removeEventListener("click", _), (H = document.querySelector("#preview-backdrop")) == null || H.removeEventListener("click", _);
    }), (V, Y) => (N(), O("div", {
      class: ve(["role-workbench", { "is-busy": i.value }])
    }, [
      u("header", gS, [
        u("div", mS, [
          Q(Ox, {
            personas: B(t).personas.value,
            "selected-id": B(t).selectedPersonaId.value,
            disabled: i.value,
            onSelect: B(t).selectPersona
          }, null, 8, ["personas", "selected-id", "disabled", "onSelect"]),
          Y[3] || (Y[3] = u("p", null, "角色运行架构与能力配置", -1))
        ]),
        u("div", yS, [
          B(t).isDirty.value ? (N(), O("span", bS, "存在未保存修改")) : re("", !0),
          u("button", {
            type: "button",
            class: ve({ active: s.value }),
            disabled: !B(t).draft.value || i.value,
            onClick: g
          }, [
            Q(B(zc), { size: 16 }),
            Y[4] || (Y[4] = he("运行版本"))
          ], 10, _S),
          u("button", {
            type: "button",
            disabled: !B(t).isDirty.value || B(t).isSaving.value || B(t).operationPending.value,
            onClick: Y[0] || (Y[0] = //@ts-ignore
            (...H) => B(t).discard && B(t).discard(...H))
          }, [
            Q(B(hv), { size: 16 }),
            Y[5] || (Y[5] = he("撤销"))
          ], 8, wS),
          u("button", {
            type: "button",
            class: "primary",
            disabled: !B(t).isDirty.value || B(t).isSaving.value || B(t).operationPending.value,
            onClick: Y[1] || (Y[1] = //@ts-ignore
            (...H) => B(t).save && B(t).save(...H))
          }, [
            Q(B(ar), { size: 16 }),
            he(L(B(t).isSaving.value ? "保存中" : "保存配置"), 1)
          ], 8, kS)
        ])
      ]),
      B(t).error.value ? (N(), O("p", ES, L(B(t).error.value), 1)) : B(t).message.value ? (N(), O("p", xS, L(B(t).message.value), 1)) : re("", !0),
      u("div", SS, [
        u("main", CS, [
          B(t).loading.value ? (N(), O("div", $S, "正在读取角色架构...")) : B(t).personas.value.length ? (N(), vt(xx, {
            key: 2,
            graph: l.value,
            "selected-node-id": B(t).selectedNodeId.value,
            onSelect: B(t).selectNode,
            onToggle: c,
            onReset: Y[2] || (Y[2] = (H) => n.value++)
          }, null, 8, ["graph", "selected-node-id", "onSelect"])) : (N(), O("div", NS, Y[6] || (Y[6] = [
            u("strong", null, "还没有角色", -1),
            u("p", null, "先在“创建角色”页面建立角色。", -1)
          ])))
        ]),
        B(t).draft.value ? (N(), vt(k0, {
          key: 0,
          node: a.value,
          draft: B(t).draft.value,
          disabled: i.value,
          "upload-complete-token": o.value,
          onProfile: B(t).updateProfile,
          onCapability: B(t).setCapability,
          onServer: B(t).setServer,
          onUpload: D,
          onDeleteDocument: T,
          onRetryDocument: B(t).reindexDocument,
          onDeletePersona: S,
          onPreviewVoice: d,
          onOpenVoiceStudio: p,
          onOpenRagEval: v,
          onPreviewDocument: z,
          onPreviewLocalFile: U,
          onRefreshLive2d: B(t).refreshLive2dResources,
          onOpenLive2dDirectory: B(t).openLive2dDirectory
        }, null, 8, ["node", "draft", "disabled", "upload-complete-token", "onProfile", "onCapability", "onServer", "onRetryDocument", "onRefreshLive2d", "onOpenLive2dDirectory"])) : re("", !0)
      ]),
      s.value && B(t).draft.value ? (N(), vt(dS, {
        key: 2,
        "persona-id": B(t).draft.value.persona.id,
        "persona-name": B(t).draft.value.persona.name,
        disabled: i.value || B(t).isDirty.value,
        onClose: k,
        onChanged: $
      }, null, 8, ["persona-id", "persona-name", "disabled"])) : re("", !0)
    ], 2));
  }
});
let hn = null;
function lM(e = "#role-workbench-root") {
  if (hn) return hn;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("角色工作台挂载点不存在");
  return hn = es(IS), hn.mount(t), hn;
}
function aM() {
  var e;
  (e = document.querySelector("#role-workbench-root")) == null || e.dispatchEvent(new CustomEvent("yumeno:manage-show"));
}
function uM() {
  hn && (hn.unmount(), hn = null);
}
async function De(e, t) {
  const n = await fetch(e, t), s = (n.headers.get("content-type") || "").includes("application/json") ? await n.json() : await n.text();
  if (!n.ok) {
    const i = typeof s == "object" && s && "detail" in s ? s.detail : s;
    throw new Error(typeof i == "string" ? i : `请求失败（${n.status}）`);
  }
  return s;
}
function je(e) {
  return e instanceof Error ? e.message : String(e || "操作失败");
}
function MS(e) {
  const t = e.skills || [], n = e.servers || [], o = e.tools || [], s = t.filter((a) => a.enabled).length, i = n.filter((a) => {
    var c;
    return a.enabled && ((c = a.status) == null ? void 0 : c.status) === "connected";
  }).length, r = n.filter((a) => {
    var c, d;
    return ((c = a.status) == null ? void 0 : c.status) === "error" || a.enabled && ((d = a.status) == null ? void 0 : d.status) !== "connected";
  }).length, l = t.filter((a) => !a.builtin && !a.trusted).length;
  return { enabledSkills: s, mcpOnline: i, mcpIssues: r, toolCount: o.length, attentionCount: r + l };
}
function Su(e) {
  const t = {};
  for (const n of e.split(/\r?\n/)) {
    const o = n.trim();
    if (!o) continue;
    const s = o.indexOf("="), i = o.indexOf(":"), r = s > 0 && (i < 0 || s < i) ? s : i;
    r > 0 && (t[o.slice(0, r).trim()] = o.slice(r + 1).trim());
  }
  return t;
}
const OS = { class: "yv-page extension-page" }, TS = { class: "extension-hero" }, PS = { class: "hero-actions" }, DS = ["disabled"], RS = {
  class: "signal-strip",
  "aria-label": "能力状态"
}, AS = { class: "extension-tabs" }, LS = ["onClick"], VS = {
  key: 1,
  class: "overview-layout"
}, zS = { class: "overview-foot" }, BS = {
  key: 0,
  class: "yv-empty"
}, FS = { class: "quick-entry" }, US = {
  key: 2,
  class: "content-section"
}, HS = {
  key: 0,
  class: "yv-empty"
}, jS = { class: "row-main" }, GS = { class: "tag-line" }, YS = { class: "row-actions" }, qS = ["title", "onClick"], XS = ["onClick"], KS = ["onClick"], WS = ["onClick"], ZS = {
  key: 3,
  class: "content-section"
}, JS = {
  key: 0,
  class: "yv-empty"
}, QS = { class: "row-main" }, eC = { class: "grant-field" }, tC = ["value", "onChange"], nC = { class: "row-actions" }, oC = ["onClick"], sC = ["onClick"], iC = ["onClick"], rC = {
  key: 4,
  class: "content-section"
}, lC = { class: "filter-input" }, aC = {
  key: 0,
  class: "yv-empty"
}, uC = { class: "row-main" }, cC = {
  key: 5,
  class: "content-section"
}, dC = { class: "catalog-tools" }, fC = { class: "filter-input" }, pC = { class: "catalog-grid" }, hC = { class: "tag-line" }, vC = ["disabled", "onClick"], gC = { class: "dialog-head" }, mC = { class: "yv-kicker" }, yC = { class: "yv-field" }, bC = ["readonly"], _C = { class: "yv-field" }, wC = { class: "yv-field" }, kC = { class: "yv-field" }, EC = { class: "tool-options" }, xC = ["value"], SC = {
  class: "yv-button primary",
  type: "submit"
}, CC = { class: "yv-field" }, $C = { class: "yv-field" }, NC = { class: "transport-tabs" }, IC = ["onClick"], MC = { class: "yv-field" }, OC = { class: "yv-field" }, TC = { class: "yv-field" }, PC = { class: "yv-field" }, DC = { class: "yv-field" }, RC = {
  class: "yv-button primary",
  type: "submit"
}, AC = { class: "dialog-head" }, LC = { class: "dialog-body" }, VC = { class: "catalog-detail" }, zC = /* @__PURE__ */ Me({
  __name: "App",
  setup(e) {
    const t = [
      { id: "overview", label: "总览" },
      { id: "skills", label: "技能" },
      { id: "mcp", label: "MCP 服务" },
      { id: "tools", label: "工具目录" },
      { id: "catalog", label: "在线扩展" }
    ], n = wn({ skills: [], servers: [], tools: [] }), o = ee("overview"), s = ee(!1), i = ee(""), r = ee(!1), l = ee(""), a = ee(null), c = ee("skill"), d = ee(null), p = ee(null), v = ee([]), g = ee(!1), k = ee(""), $ = ee("all"), S = ee(null), T = ee([]), D = ee(null), m = wn({ name: "", description: "", instructions: "", prompt_hint: "", tool_names: [] }), _ = wn({ name: "", description: "", transport: "stdio", command: "", args: "", env: "", url: "", headers: "" }), z = ae(() => MS(n)), U = ae(() => {
      const W = l.value.trim().toLowerCase();
      return n.tools.filter((h) => !W || [h.name, h.server, h.description].some((I) => String(I || "").toLowerCase().includes(W)));
    }), Z = ae(() => {
      const W = k.value.trim().toLowerCase();
      return v.value.filter((h) => !W || [h.id, h.name, h.description, ...h.categories || []].join(" ").toLowerCase().includes(W));
    }), G = ae(() => Object.entries(n.skills.reduce((W, h) => {
      var y;
      const I = ((y = h.metadata) == null ? void 0 : y.category) || "其他";
      return (W[I] || (W[I] = [])).push(h), W;
    }, {})).sort(([W], [h]) => W.localeCompare(h, "zh")));
    let P = 0;
    function V(W, h = !1) {
      i.value = W, r.value = h;
    }
    async function Y(W = !1) {
      W || (s.value = !0);
      try {
        const [h, I, y, b] = await Promise.all([
          De("/api/skills"),
          De("/api/mcp/servers"),
          De("/api/mcp/tools"),
          De("/api/skills/tools")
        ]);
        n.skills = h, n.servers = I, n.tools = y, T.value = b, W || V("扩展状态已刷新");
      } catch (h) {
        V(je(h), !0);
      } finally {
        s.value = !1;
      }
    }
    function H() {
      J(), P = window.setInterval(() => Y(!0), 3e4);
    }
    function J() {
      P && window.clearInterval(P), P = 0;
    }
    async function C() {
      await Y(!0), H();
    }
    function A() {
      D.value = null, Object.assign(m, { name: "", description: "", instructions: "", prompt_hint: "", tool_names: [] });
    }
    function M(W) {
      A(), c.value = "skill", W && (D.value = W.name, Object.assign(m, { name: W.name, description: W.description || "", instructions: W.instructions || "", prompt_hint: W.prompt_hint || "", tool_names: [...W.tool_names || []] })), nt(() => {
        var h;
        return (h = a.value) == null ? void 0 : h.showModal();
      });
    }
    function R() {
      c.value = "mcp", Object.assign(_, { name: "", description: "", transport: "stdio", command: "", args: "", env: "", url: "", headers: "" }), nt(() => {
        var W;
        return (W = a.value) == null ? void 0 : W.showModal();
      });
    }
    async function j() {
      var W;
      if (!m.name.trim() || !m.instructions.trim()) return V("名称与提示词不能为空", !0);
      s.value = !0;
      try {
        const h = { description: m.description.trim(), instructions: m.instructions.trim(), prompt_hint: m.prompt_hint.trim(), tool_names: m.tool_names };
        D.value ? await De(`/api/skills/${encodeURIComponent(D.value)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(h) }) : await De("/api/skills", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: m.name.trim(), ...h }) }), (W = a.value) == null || W.close(), await Y(!0), V(D.value ? "技能修改已保存" : "技能已创建");
      } catch (h) {
        V(je(h), !0);
      } finally {
        s.value = !1;
      }
    }
    async function ne(W, h) {
      try {
        await De(`/api/skills/${encodeURIComponent(W.name)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(h) }), await Y(!0), V("技能状态已更新");
      } catch (I) {
        V(je(I), !0);
      }
    }
    async function le(W) {
      if (confirm(`删除技能 ${W.name}？`))
        try {
          await De(`/api/skills/${encodeURIComponent(W.name)}`, { method: "DELETE" }), await Y(!0), V("技能已删除");
        } catch (h) {
          V(je(h), !0);
        }
    }
    async function fe(W) {
      var I;
      if (!W) return;
      const h = new FormData();
      h.append("file", W);
      try {
        const y = await De("/api/skills/upload", { method: "POST", body: h });
        await Y(!0), V((I = y.installed) != null && I.length ? `已安装：${y.installed.join("、")}` : "上传完成");
      } catch (y) {
        V(je(y), !0);
      } finally {
        d.value && (d.value.value = "");
      }
    }
    async function se() {
      var W;
      if (!_.name.trim()) return V("服务器名称不能为空", !0);
      try {
        await De("/api/mcp/servers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: _.name.trim(), description: _.description.trim(), transport: _.transport, command: _.command.trim(), args: _.args.split(/\r?\n/).map((h) => h.trim()).filter(Boolean), env: Su(_.env), url: _.url.trim(), headers: Su(_.headers), enabled: !0 }) }), (W = a.value) == null || W.close(), await Y(!0), V("MCP 服务已保存并连接");
      } catch (h) {
        V(je(h), !0);
      }
    }
    async function ce(W) {
      try {
        await De(`/api/mcp/servers/${encodeURIComponent(W.name)}/${W.enabled ? "disable" : "enable"}`, { method: "POST" }), await Y(!0);
      } catch (h) {
        V(je(h), !0);
      }
    }
    async function ue(W) {
      V(`正在测试 ${W.name}…`);
      try {
        const h = await De(`/api/mcp/servers/${encodeURIComponent(W.name)}/test`, { method: "POST" });
        V(h.ok ? `${W.name} 连接正常：${h.tool_count} 个工具，耗时 ${h.elapsed_ms}ms` : `${W.name} 连接失败：${h.error}`, !h.ok), await Y(!0);
      } catch (h) {
        V(je(h), !0);
      }
    }
    async function ge(W, h) {
      const y = h.target.value.split(",").map((b) => b.trim()).filter(Boolean);
      try {
        await De(`/api/mcp/servers/${encodeURIComponent(W.name)}/grants`, { method: "PATCH", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" }, body: JSON.stringify({ allowed_persona_ids: y }) }), V(`已更新 ${W.name} 的授权`);
      } catch (b) {
        V(je(b), !0);
      }
    }
    async function te(W) {
      if (confirm(`删除 MCP 服务器 ${W.name}？其工具将立即不可用。`))
        try {
          await De(`/api/mcp/servers/${encodeURIComponent(W.name)}`, { method: "DELETE" }), await Y(!0), V("MCP 服务已删除");
        } catch (h) {
          V(je(h), !0);
        }
    }
    async function we(W = !1) {
      try {
        const h = await De(`/api/extensions/catalog?kind=${encodeURIComponent($.value)}${W ? "&refresh=true" : ""}`);
        v.value = h.items || [], g.value = !!h.stale;
      } catch {
        V("在线扩展目录暂时不可用，可稍后重试", !0), v.value = [];
      }
    }
    function xe(W) {
      return W.kind === "skill" ? n.skills.some((h) => h.name === W.id) : n.servers.some((h) => h.name === W.id);
    }
    function _e(W) {
      S.value = W, nt(() => {
        var h;
        return (h = p.value) == null ? void 0 : h.showModal();
      });
    }
    async function ke() {
      var h, I, y;
      const W = S.value;
      if (W)
        try {
          const b = await De(`/api/extensions/catalog/${encodeURIComponent(W.id)}/install`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmed: !1 }) });
          if ((I = (h = b.preview) == null ? void 0 : h.conflicts) != null && I.length) throw new Error(b.preview.conflicts.join("；"));
          const w = await De(`/api/extensions/catalog/${encodeURIComponent(W.id)}/install`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmed: !0 }) });
          if (w.status !== "installed") throw new Error(w.message || "安装未完成");
          await Y(!0), (y = p.value) == null || y.close(), V(W.kind === "skill" ? "安装完成，请在技能页启用并信任" : "安装完成，请在 MCP 页启用并授权角色");
        } catch (b) {
          V(je(b), !0);
        }
    }
    return rt(() => {
      const W = document.querySelector("#extensions-app-root");
      W == null || W.addEventListener("yumeno:extensions-show", C), W == null || W.addEventListener("yumeno:extensions-hide", J), C();
    }), sn(() => J()), (W, h) => {
      var I, y, b, w, E, F, K, x;
      return N(), O("main", OS, [
        u("header", TS, [
          h[26] || (h[26] = u("div", null, [
            u("span", { class: "yv-kicker" }, "Agent capability registry"),
            u("h1", null, "能力扩展"),
            u("p", null, "统一管理角色可调用的 Skill、Tool 与 MCP 服务。")
          ], -1)),
          u("div", PS, [
            u("span", {
              class: ve(["yv-status", z.value.attentionCount ? "warn" : "ok"])
            }, L(z.value.attentionCount ? `${z.value.attentionCount} 项待处理` : "运行正常"), 3),
            u("button", {
              class: "yv-button yv-icon-button",
              title: "刷新",
              disabled: s.value,
              onClick: h[0] || (h[0] = (f) => Y())
            }, [
              Q(B(Nt))
            ], 8, DS)
          ])
        ]),
        u("section", RS, [
          u("div", null, [
            h[27] || (h[27] = u("span", null, "已启用技能", -1)),
            u("strong", null, L(z.value.enabledSkills), 1),
            u("small", null, "共 " + L(n.skills.length) + " 个", 1)
          ]),
          u("div", null, [
            h[28] || (h[28] = u("span", null, "MCP 在线", -1)),
            u("strong", null, L(z.value.mcpOnline), 1),
            u("small", null, L(z.value.mcpIssues) + " 项异常", 1)
          ]),
          u("div", null, [
            h[29] || (h[29] = u("span", null, "已注册工具", -1)),
            u("strong", null, L(z.value.toolCount), 1),
            h[30] || (h[30] = u("small", null, "统一工具注册表", -1))
          ]),
          u("div", null, [
            h[31] || (h[31] = u("span", null, "需要处理", -1)),
            u("strong", null, L(z.value.attentionCount), 1),
            h[32] || (h[32] = u("small", null, "信任与连接状态", -1))
          ])
        ]),
        u("nav", AS, [
          (N(), O(me, null, Te(t, (f) => u("button", {
            key: f.id,
            class: ve({ active: o.value === f.id }),
            onClick: (q) => {
              o.value = f.id, f.id === "catalog" && we(!1);
            }
          }, L(f.label), 11, LS)), 64))
        ]),
        i.value ? (N(), O("p", {
          key: 0,
          class: ve(["extension-message", { error: r.value }]),
          role: "status"
        }, L(i.value), 3)) : re("", !0),
        o.value === "overview" ? (N(), O("section", VS, [
          h[37] || (h[37] = dh('<div class="capability-line"><article><span>决策层</span><strong>Agent</strong><p>选择是否调用扩展能力</p></article><article class="skill"><span>指令层</span><strong>Skill</strong><p>按场景注入执行规则</p></article><article class="tool"><span>执行层</span><strong>Tool</strong><p>标准化系统动作</p></article><article class="mcp"><span>协议层</span><strong>MCP</strong><p>连接外部工具服务</p></article></div>', 1)),
          u("div", zS, [
            u("div", null, [
              h[33] || (h[33] = u("h2", null, "当前连接", -1)),
              n.servers.length ? re("", !0) : (N(), O("p", BS, "尚未配置 MCP 服务")),
              (N(!0), O(me, null, Te(n.servers, (f) => {
                var q, X, ie;
                return N(), O("div", {
                  key: f.name,
                  class: "health-row"
                }, [
                  u("strong", null, L(f.name), 1),
                  u("span", null, L(f.description || "外部工具服务"), 1),
                  u("em", {
                    class: ve(["yv-status", ((q = f.status) == null ? void 0 : q.status) === "connected" ? "ok" : "warn"])
                  }, L(((X = f.status) == null ? void 0 : X.status) === "connected" ? `${f.status.tool_count} 个工具` : ((ie = f.status) == null ? void 0 : ie.status) === "error" ? "连接异常" : "未连接"), 3)
                ]);
              }), 128))
            ]),
            u("div", FS, [
              h[36] || (h[36] = u("h2", null, "管理入口", -1)),
              u("button", {
                class: "yv-button primary",
                onClick: h[1] || (h[1] = (f) => M())
              }, [
                Q(B(Pn)),
                h[34] || (h[34] = he("新增技能"))
              ]),
              u("button", {
                class: "yv-button",
                onClick: h[2] || (h[2] = (f) => R())
              }, [
                Q(B(Pn)),
                h[35] || (h[35] = he("新增 MCP 服务"))
              ])
            ])
          ])
        ])) : o.value === "skills" ? (N(), O("section", US, [
          u("header", null, [
            h[40] || (h[40] = u("div", null, [
              u("span", { class: "yv-kicker" }, "Instruction packages"),
              u("h2", null, "技能"),
              u("p", null, "为 Agent 提供按需加载的规则与工具组合。")
            ], -1)),
            u("div", null, [
              u("input", {
                ref_key: "uploadInput",
                ref: d,
                hidden: "",
                type: "file",
                accept: ".zip",
                onChange: h[3] || (h[3] = (f) => {
                  var q;
                  return fe((q = f.target.files) == null ? void 0 : q[0]);
                })
              }, null, 544),
              u("button", {
                class: "yv-button",
                onClick: h[4] || (h[4] = (f) => {
                  var q;
                  return (q = d.value) == null ? void 0 : q.click();
                })
              }, [
                Q(B(cr)),
                h[38] || (h[38] = he("上传技能包"))
              ]),
              u("button", {
                class: "yv-button primary",
                onClick: h[5] || (h[5] = (f) => M())
              }, [
                Q(B(Pn)),
                h[39] || (h[39] = he("新增技能"))
              ])
            ])
          ]),
          n.skills.length ? re("", !0) : (N(), O("div", HS, "还没有技能")),
          (N(!0), O(me, null, Te(G.value, ([f, q]) => (N(), O("section", {
            key: f,
            class: "skill-group"
          }, [
            u("h3", null, L(f), 1),
            (N(!0), O(me, null, Te(q, (X) => (N(), O("article", {
              key: X.name,
              class: "extension-row kind-skill"
            }, [
              u("div", jS, [
                u("div", null, [
                  u("strong", null, L(X.name), 1),
                  u("span", null, L(X.builtin ? "内置" : "自定义") + " · " + L(X.format === "skillmd" ? "标准包" : "JSON"), 1)
                ]),
                u("p", null, L(X.description || "暂无说明"), 1),
                u("div", GS, [
                  (N(!0), O(me, null, Te(X.tool_names, (ie) => (N(), O("span", { key: ie }, L(ie), 1))), 128))
                ])
              ]),
              u("div", YS, [
                u("span", {
                  class: ve(["yv-status", X.enabled ? "ok" : "warn"])
                }, L(X.enabled ? "已启用" : "已停用"), 3),
                u("button", {
                  class: "yv-button yv-icon-button",
                  title: X.enabled ? "停用" : "启用",
                  onClick: (ie) => ne(X, { enabled: !X.enabled })
                }, [
                  Q(B(pv))
                ], 8, qS),
                !X.builtin && !X.trusted ? (N(), O("button", {
                  key: 0,
                  class: "yv-button",
                  onClick: (ie) => ne(X, { trusted: !0 })
                }, "信任", 8, XS)) : re("", !0),
                X.builtin ? re("", !0) : (N(), O("button", {
                  key: 1,
                  class: "yv-button yv-icon-button",
                  title: "编辑",
                  onClick: (ie) => M(X)
                }, [
                  Q(B(Bc))
                ], 8, KS)),
                X.builtin ? re("", !0) : (N(), O("button", {
                  key: 2,
                  class: "yv-button yv-icon-button danger",
                  title: "删除",
                  onClick: (ie) => le(X)
                }, [
                  Q(B(en))
                ], 8, WS))
              ])
            ]))), 128))
          ]))), 128))
        ])) : o.value === "mcp" ? (N(), O("section", ZS, [
          u("header", null, [
            h[42] || (h[42] = u("div", null, [
              u("span", { class: "yv-kicker" }, "External protocol services"),
              u("h2", null, "MCP 服务"),
              u("p", null, "连接、测试并限制外部服务可访问的角色。")
            ], -1)),
            u("button", {
              class: "yv-button primary",
              onClick: h[6] || (h[6] = (f) => R())
            }, [
              Q(B(Pn)),
              h[41] || (h[41] = he("新增服务"))
            ])
          ]),
          n.servers.length ? re("", !0) : (N(), O("div", JS, "尚未配置 MCP 服务")),
          (N(!0), O(me, null, Te(n.servers, (f) => {
            var q, X, ie, de, be;
            return N(), O("article", {
              key: f.name,
              class: "extension-row kind-mcp"
            }, [
              u("div", QS, [
                u("div", null, [
                  u("strong", null, L(f.name), 1),
                  u("span", null, L(f.transport) + " · " + L(f.enabled ? "已启用" : "已停用"), 1)
                ]),
                u("p", null, L(f.description || ((q = f.status) == null ? void 0 : q.error) || "暂无说明"), 1),
                u("label", eC, [
                  h[43] || (h[43] = u("span", null, "授权角色", -1)),
                  u("input", {
                    value: (f.allowed_persona_ids || []).join(","),
                    placeholder: "* 或角色 ID，逗号分隔",
                    onChange: (Ce) => ge(f, Ce)
                  }, null, 40, tC)
                ])
              ]),
              u("div", nC, [
                u("span", {
                  class: ve(["yv-status", ((X = f.status) == null ? void 0 : X.status) === "connected" ? "ok" : ((ie = f.status) == null ? void 0 : ie.status) === "error" ? "error" : "warn"])
                }, L(((de = f.status) == null ? void 0 : de.status) === "connected" ? `${f.status.tool_count} 个工具` : ((be = f.status) == null ? void 0 : be.status) === "error" ? "连接失败" : "等待连接"), 3),
                u("button", {
                  class: "yv-button",
                  onClick: (Ce) => ue(f)
                }, "测试", 8, oC),
                u("button", {
                  class: "yv-button",
                  onClick: (Ce) => ce(f)
                }, L(f.enabled ? "停用" : "启用"), 9, sC),
                u("button", {
                  class: "yv-button yv-icon-button danger",
                  title: "删除",
                  onClick: (Ce) => te(f)
                }, [
                  Q(B(en))
                ], 8, iC)
              ])
            ]);
          }), 128))
        ])) : o.value === "tools" ? (N(), O("section", rC, [
          u("header", null, [
            h[44] || (h[44] = u("div", null, [
              u("span", { class: "yv-kicker" }, "Unified registry"),
              u("h2", null, "工具目录"),
              u("p", null, "查看内置工具与 MCP 工具的统一注册结果。")
            ], -1)),
            u("label", lC, [
              Q(B(ur)),
              $e(u("input", {
                "onUpdate:modelValue": h[7] || (h[7] = (f) => l.value = f),
                placeholder: "搜索工具名、服务或描述"
              }, null, 512), [
                [Ve, l.value]
              ])
            ])
          ]),
          U.value.length ? re("", !0) : (N(), O("div", aC, "没有匹配的工具")),
          (N(!0), O(me, null, Te(U.value, (f) => (N(), O("article", {
            key: `${f.server}/${f.name}`,
            class: "extension-row kind-tool"
          }, [
            u("div", uC, [
              u("div", null, [
                u("strong", null, L(f.name), 1),
                u("span", null, L(f.server || "内置"), 1)
              ]),
              u("p", null, L(f.description || "暂无说明"), 1)
            ]),
            u("span", {
              class: ve(["yv-status", f.requires_confirmation ? "warn" : "ok"])
            }, L(f.requires_confirmation ? "调用需确认" : "可直接调用"), 3)
          ]))), 128))
        ])) : (N(), O("section", cC, [
          u("header", null, [
            h[46] || (h[46] = u("div", null, [
              u("span", { class: "yv-kicker" }, "Curated catalog"),
              u("h2", null, "在线扩展"),
              u("p", null, "先检查来源与权限，再将扩展加入本地能力系统。")
            ], -1)),
            u("button", {
              class: "yv-button",
              onClick: h[8] || (h[8] = (f) => we(!0))
            }, [
              Q(B(Nt)),
              h[45] || (h[45] = he("刷新目录"))
            ])
          ]),
          u("div", dC, [
            u("label", fC, [
              Q(B(ur)),
              $e(u("input", {
                "onUpdate:modelValue": h[9] || (h[9] = (f) => k.value = f),
                placeholder: "搜索名称、说明或分类"
              }, null, 512), [
                [Ve, k.value]
              ])
            ]),
            $e(u("select", {
              "onUpdate:modelValue": h[10] || (h[10] = (f) => $.value = f),
              onChange: h[11] || (h[11] = (f) => we(!1))
            }, h[47] || (h[47] = [
              u("option", { value: "all" }, "全部类型", -1),
              u("option", { value: "skill" }, "Skill", -1),
              u("option", { value: "mcp" }, "MCP", -1)
            ]), 544), [
              [Qt, $.value]
            ]),
            u("span", {
              class: ve(["yv-status", g.value ? "warn" : "ok"])
            }, L(g.value ? "缓存目录" : `${v.value.length} 个条目`), 3)
          ]),
          u("div", pC, [
            (N(!0), O(me, null, Te(Z.value, (f) => (N(), O("article", {
              key: f.id,
              class: ve(["catalog-item", `kind-${f.kind}`])
            }, [
              u("span", null, L(f.kind.toUpperCase()), 1),
              u("h3", null, L(f.name || f.id), 1),
              u("small", null, "v" + L(f.version || "未知") + " · " + L(f.id), 1),
              u("p", null, L(f.description || "暂无说明"), 1),
              u("div", hC, [
                (N(!0), O(me, null, Te(f.categories, (q) => (N(), O("span", { key: q }, L(q), 1))), 128))
              ]),
              u("button", {
                class: "yv-button",
                disabled: xe(f),
                onClick: (q) => _e(f)
              }, L(xe(f) ? "已安装" : "查看并安装"), 9, vC)
            ], 2))), 128))
          ])
        ])),
        u("dialog", {
          ref_key: "drawer",
          ref: a,
          class: "yv-dialog"
        }, [
          u("header", gC, [
            u("div", null, [
              u("span", mC, L(c.value === "skill" ? "Instruction package" : "Protocol service"), 1),
              u("h2", null, L(c.value === "skill" ? D.value ? `编辑 ${D.value}` : "新增技能" : "新增 MCP 服务"), 1)
            ]),
            u("button", {
              class: "yv-button yv-icon-button",
              title: "关闭",
              onClick: h[12] || (h[12] = (f) => {
                var q;
                return (q = a.value) == null ? void 0 : q.close();
              })
            }, [
              Q(B(Kt))
            ])
          ]),
          c.value === "skill" ? (N(), O("form", {
            key: 0,
            class: "dialog-body",
            onSubmit: gt(j, ["prevent"])
          }, [
            u("label", yC, [
              h[48] || (h[48] = u("span", null, "名称", -1)),
              $e(u("input", {
                "onUpdate:modelValue": h[13] || (h[13] = (f) => m.name = f),
                readonly: !!D.value
              }, null, 8, bC), [
                [Ve, m.name]
              ])
            ]),
            u("label", _C, [
              h[49] || (h[49] = u("span", null, "描述", -1)),
              $e(u("input", {
                "onUpdate:modelValue": h[14] || (h[14] = (f) => m.description = f)
              }, null, 512), [
                [Ve, m.description]
              ])
            ]),
            u("label", wC, [
              h[50] || (h[50] = u("span", null, "提示词", -1)),
              $e(u("textarea", {
                "onUpdate:modelValue": h[15] || (h[15] = (f) => m.instructions = f),
                rows: "6"
              }, null, 512), [
                [Ve, m.instructions]
              ])
            ]),
            u("label", kC, [
              h[51] || (h[51] = u("span", null, "触发提示", -1)),
              $e(u("input", {
                "onUpdate:modelValue": h[16] || (h[16] = (f) => m.prompt_hint = f)
              }, null, 512), [
                [Ve, m.prompt_hint]
              ])
            ]),
            u("fieldset", EC, [
              h[52] || (h[52] = u("legend", null, "可附加工具", -1)),
              (N(!0), O(me, null, Te(T.value, (f) => (N(), O("label", {
                key: f.name
              }, [
                $e(u("input", {
                  "onUpdate:modelValue": h[17] || (h[17] = (q) => m.tool_names = q),
                  type: "checkbox",
                  value: f.name
                }, null, 8, xC), [
                  [Xr, m.tool_names]
                ]),
                u("span", null, L(f.name) + L(f.requires_confirmation ? "（需确认）" : ""), 1)
              ]))), 128))
            ]),
            u("button", SC, [
              Q(B(ar)),
              h[53] || (h[53] = he("保存技能"))
            ])
          ], 32)) : (N(), O("form", {
            key: 1,
            class: "dialog-body",
            onSubmit: gt(se, ["prevent"])
          }, [
            u("label", CC, [
              h[54] || (h[54] = u("span", null, "名称", -1)),
              $e(u("input", {
                "onUpdate:modelValue": h[18] || (h[18] = (f) => _.name = f)
              }, null, 512), [
                [Ve, _.name]
              ])
            ]),
            u("label", $C, [
              h[55] || (h[55] = u("span", null, "描述", -1)),
              $e(u("input", {
                "onUpdate:modelValue": h[19] || (h[19] = (f) => _.description = f)
              }, null, 512), [
                [Ve, _.description]
              ])
            ]),
            u("div", NC, [
              (N(), O(me, null, Te([{ id: "stdio", label: "本地进程" }, { id: "streamable_http", label: "远程 HTTP" }, { id: "sse", label: "远程 SSE" }], (f) => u("button", {
                key: f.id,
                type: "button",
                class: ve({ active: _.transport === f.id }),
                onClick: (q) => _.transport = f.id
              }, L(f.label), 11, IC)), 64))
            ]),
            _.transport === "stdio" ? (N(), O(me, { key: 0 }, [
              u("label", MC, [
                h[56] || (h[56] = u("span", null, "启动命令", -1)),
                $e(u("input", {
                  "onUpdate:modelValue": h[20] || (h[20] = (f) => _.command = f)
                }, null, 512), [
                  [Ve, _.command]
                ])
              ]),
              u("label", OC, [
                h[57] || (h[57] = u("span", null, "参数（每行一个）", -1)),
                $e(u("textarea", {
                  "onUpdate:modelValue": h[21] || (h[21] = (f) => _.args = f),
                  rows: "3"
                }, null, 512), [
                  [Ve, _.args]
                ])
              ]),
              u("label", TC, [
                h[58] || (h[58] = u("span", null, "环境变量（KEY=VALUE）", -1)),
                $e(u("textarea", {
                  "onUpdate:modelValue": h[22] || (h[22] = (f) => _.env = f),
                  rows: "3"
                }, null, 512), [
                  [Ve, _.env]
                ])
              ])
            ], 64)) : (N(), O(me, { key: 1 }, [
              u("label", PC, [
                h[59] || (h[59] = u("span", null, "服务器地址", -1)),
                $e(u("input", {
                  "onUpdate:modelValue": h[23] || (h[23] = (f) => _.url = f)
                }, null, 512), [
                  [Ve, _.url]
                ])
              ]),
              u("label", DC, [
                h[60] || (h[60] = u("span", null, "请求头（KEY: VALUE）", -1)),
                $e(u("textarea", {
                  "onUpdate:modelValue": h[24] || (h[24] = (f) => _.headers = f),
                  rows: "3"
                }, null, 512), [
                  [Ve, _.headers]
                ])
              ])
            ], 64)),
            u("button", RC, [
              Q(B(ar)),
              h[61] || (h[61] = he("保存服务"))
            ])
          ], 32))
        ], 512),
        u("dialog", {
          ref_key: "catalogDialog",
          ref: p,
          class: "yv-dialog"
        }, [
          u("header", AC, [
            u("div", null, [
              h[62] || (h[62] = u("span", { class: "yv-kicker" }, "安装预览", -1)),
              u("h2", null, L(((I = S.value) == null ? void 0 : I.name) || ((y = S.value) == null ? void 0 : y.id)), 1)
            ]),
            u("button", {
              class: "yv-button yv-icon-button",
              title: "关闭",
              onClick: h[25] || (h[25] = (f) => {
                var q;
                return (q = p.value) == null ? void 0 : q.close();
              })
            }, [
              Q(B(Kt))
            ])
          ]),
          u("div", LC, [
            u("p", null, L(((b = S.value) == null ? void 0 : b.description) || "暂无说明"), 1),
            u("dl", VC, [
              h[63] || (h[63] = u("dt", null, "类型", -1)),
              u("dd", null, L((E = (w = S.value) == null ? void 0 : w.kind) == null ? void 0 : E.toUpperCase()), 1),
              h[64] || (h[64] = u("dt", null, "版本", -1)),
              u("dd", null, L(((F = S.value) == null ? void 0 : F.version) || "未知"), 1),
              h[65] || (h[65] = u("dt", null, "来源", -1)),
              u("dd", null, L(((x = (K = S.value) == null ? void 0 : K.source) == null ? void 0 : x.type) || "未知"), 1)
            ]),
            u("button", {
              class: "yv-button primary",
              onClick: ke
            }, [
              Q(B(Kn)),
              h[66] || (h[66] = he("确认安装"))
            ])
          ])
        ], 512)
      ]);
    };
  }
});
let vn = null;
const xf = () => document.querySelector("#extensions-app-root");
function cM(e = "#extensions-app-root") {
  if (vn) return vn;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("能力扩展挂载点不存在");
  return vn = es(zC), vn.mount(t), vn;
}
function dM() {
  var e;
  (e = xf()) == null || e.dispatchEvent(new CustomEvent("yumeno:extensions-show"));
}
function fM() {
  var e;
  (e = xf()) == null || e.dispatchEvent(new CustomEvent("yumeno:extensions-hide"));
}
function pM() {
  vn && (vn.unmount(), vn = null);
}
const BC = /* @__PURE__ */ new Set([
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
function ys(e, t) {
  if (e === "scope_isolation_ok") return t ? "通过" : "未通过";
  const n = Number(t);
  return BC.has(e) && Number.isFinite(n) ? `${Math.round(n * 100)}%` : typeof t == "number" && Number.isFinite(n) ? Number.isInteger(n) ? String(n) : n.toFixed(3) : String(t ?? "—");
}
function FC(e, t) {
  return t ? Math.max(0, Math.min(100, Math.round(e / t * 100))) : 0;
}
function UC(e) {
  return {
    persona_id: e.personaId,
    tier: e.tier,
    dataset_mode: e.datasetMode
  };
}
function qs(e) {
  return [...new Set(e.split(/[\n,，]+/).map((t) => t.trim()).filter(Boolean))];
}
function Sf(e) {
  return {
    question: e.question.trim(),
    expected_answer: e.expectedAnswer.trim(),
    relevant_document_ids: qs(e.documentIds),
    tags: qs(e.tags),
    difficulty: e.difficulty,
    enabled: e.enabled
  };
}
function HC(e) {
  return De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-cases`, { cache: "no-store" });
}
function jC(e, t) {
  return De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Sf(t))
  });
}
function GC(e, t, n) {
  return De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-cases/${encodeURIComponent(t)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Sf(n))
  });
}
async function YC(e, t) {
  await De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-cases/${encodeURIComponent(t)}`, {
    method: "DELETE"
  });
}
function qC(e, t = "pending") {
  return De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-candidates?status=${encodeURIComponent(t)}`, { cache: "no-store" });
}
function XC(e) {
  return De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-candidates/sync`, { method: "POST" });
}
function KC(e) {
  const t = { note: (e.note || "").trim() };
  return e.expectedAnswer !== void 0 && (t.expected_answer = e.expectedAnswer.trim()), e.documentIds !== void 0 && (t.relevant_document_ids = qs(e.documentIds)), e.tags !== void 0 && (t.tags = qs(e.tags)), e.difficulty !== void 0 && (t.difficulty = e.difficulty), t;
}
function WC(e, t, n) {
  return De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-candidates/${encodeURIComponent(t)}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(KC(n))
  });
}
function ZC(e, t, n = "") {
  return De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-candidates/${encodeURIComponent(t)}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note: n.trim() })
  });
}
const JC = {
  class: "eval-dataset",
  "aria-label": "人工评测题集"
}, QC = { class: "eval-dataset-heading" }, e$ = { key: 0 }, t$ = { class: "eval-dataset-actions" }, n$ = ["disabled"], o$ = ["disabled"], s$ = {
  key: 0,
  class: "eval-dataset-error"
}, i$ = {
  key: 1,
  class: "eval-dataset-editor"
}, r$ = { class: "eval-dataset-editor-head" }, l$ = ["disabled"], a$ = { class: "yv-field" }, u$ = { class: "yv-field" }, c$ = { class: "eval-dataset-form-grid" }, d$ = { class: "yv-field" }, f$ = { class: "yv-field" }, p$ = { class: "yv-field" }, h$ = { class: "eval-dataset-check" }, v$ = { class: "eval-dataset-editor-actions" }, g$ = ["disabled"], m$ = ["disabled"], y$ = {
  key: 2,
  class: "eval-dataset-empty"
}, b$ = {
  key: 3,
  class: "eval-dataset-empty"
}, _$ = {
  key: 4,
  class: "eval-dataset-empty"
}, w$ = {
  key: 5,
  class: "eval-dataset-list"
}, k$ = { class: "eval-dataset-row-main" }, E$ = { key: 0 }, x$ = { class: "eval-dataset-meta" }, S$ = { key: 0 }, C$ = { key: 1 }, $$ = { class: "eval-dataset-row-actions" }, N$ = ["disabled", "onClick"], I$ = ["disabled", "onClick"], M$ = /* @__PURE__ */ Me({
  __name: "EvalDatasetPanel",
  props: {
    spaceId: {}
  },
  setup(e) {
    const t = e, n = ee([]), o = ee(!1), s = ee(!1), i = ee(""), r = ee(!1), l = ee(null), a = ee(v());
    let c = 0;
    const d = ae(() => n.value.filter((z) => z.enabled !== !1).length), p = ae(() => !!l.value);
    function v() {
      return { question: "", expectedAnswer: "", documentIds: "", tags: "", difficulty: "medium", enabled: !0 };
    }
    function g(z) {
      return {
        question: z.question || "",
        expectedAnswer: z.expected_answer || "",
        documentIds: (z.relevant_document_ids || []).join(`
`),
        tags: (z.tags || []).join(", "),
        difficulty: z.difficulty || "medium",
        enabled: z.enabled !== !1
      };
    }
    function k(z) {
      return { easy: "简单", medium: "中等", hard: "困难" }[z || "medium"] || "中等";
    }
    function $() {
      l.value = null, a.value = v(), r.value = !0, i.value = "";
    }
    function S(z) {
      l.value = z.id, a.value = g(z), r.value = !0, i.value = "";
    }
    function T() {
      s.value || (r.value = !1, l.value = null);
    }
    async function D() {
      const z = ++c;
      if (!t.spaceId) {
        n.value = [], r.value = !1;
        return;
      }
      o.value = !0, i.value = "";
      try {
        const U = await HC(t.spaceId);
        z === c && (n.value = U.items || []);
      } catch (U) {
        z === c && (i.value = je(U));
      } finally {
        z === c && (o.value = !1);
      }
    }
    async function m() {
      if (!t.spaceId || !a.value.question.trim()) {
        i.value = "请填写问题";
        return;
      }
      s.value = !0, i.value = "";
      try {
        const z = l.value ? await GC(t.spaceId, l.value, a.value) : await jC(t.spaceId, a.value);
        l.value ? n.value = n.value.map((U) => U.id === z.id ? z : U) : n.value = [...n.value, z], T();
      } catch (z) {
        i.value = je(z);
      } finally {
        s.value = !1;
      }
    }
    async function _(z) {
      if (!(!t.spaceId || !window.confirm(`删除这条评测题？

${z.question}`))) {
        s.value = !0, i.value = "";
        try {
          await YC(t.spaceId, z.id), n.value = n.value.filter((U) => U.id !== z.id), l.value === z.id && T();
        } catch (U) {
          i.value = je(U);
        } finally {
          s.value = !1;
        }
      }
    }
    return Ne(() => t.spaceId, D), rt(D), (z, U) => (N(), O("section", JC, [
      u("header", QC, [
        u("div", null, [
          U[7] || (U[7] = u("span", { class: "yv-kicker" }, "Regression set", -1)),
          u("h2", null, [
            U[6] || (U[6] = he("人工题集 ")),
            n.value.length ? (N(), O("small", e$, L(d.value) + "/" + L(n.value.length) + " 启用", 1)) : re("", !0)
          ]),
          U[8] || (U[8] = u("p", null, "把真实问题留成可重复的回归样本。", -1))
        ]),
        u("div", t$, [
          u("button", {
            class: "yv-button",
            type: "button",
            disabled: o.value || s.value || !z.spaceId,
            title: "刷新题集",
            onClick: D
          }, [
            Q(B(Nt), {
              size: 14,
              class: ve({ "is-spinning": o.value })
            }, null, 8, ["class"]),
            U[9] || (U[9] = he("刷新"))
          ], 8, n$),
          u("button", {
            class: "yv-button primary",
            type: "button",
            disabled: s.value || !z.spaceId,
            onClick: $
          }, [
            Q(B(Pn), { size: 14 }),
            U[10] || (U[10] = he("新增题目"))
          ], 8, o$)
        ])
      ]),
      i.value ? (N(), O("p", s$, L(i.value), 1)) : re("", !0),
      r.value ? (N(), O("div", i$, [
        u("div", r$, [
          u("strong", null, L(p.value ? "编辑题目" : "新增题目"), 1),
          u("button", {
            class: "icon-button",
            type: "button",
            title: "关闭",
            disabled: s.value,
            onClick: T
          }, [
            Q(B(Kt), { size: 15 })
          ], 8, l$)
        ]),
        u("label", a$, [
          U[11] || (U[11] = u("span", null, "问题", -1)),
          $e(u("textarea", {
            name: "question",
            "onUpdate:modelValue": U[0] || (U[0] = (Z) => a.value.question = Z),
            rows: "2",
            maxlength: "4000",
            placeholder: "例如：YUMENO 如何选择知识检索路径？"
          }, null, 512), [
            [Ve, a.value.question]
          ])
        ]),
        u("label", u$, [
          U[12] || (U[12] = u("span", null, [
            he("预期答案 "),
            u("em", null, "可选")
          ], -1)),
          $e(u("textarea", {
            name: "expected_answer",
            "onUpdate:modelValue": U[1] || (U[1] = (Z) => a.value.expectedAnswer = Z),
            rows: "3",
            maxlength: "8000",
            placeholder: "用于人工复核与后续答案对比"
          }, null, 512), [
            [Ve, a.value.expectedAnswer]
          ])
        ]),
        u("div", c$, [
          u("label", d$, [
            U[13] || (U[13] = u("span", null, [
              he("相关资料 ID "),
              u("em", null, "每行一个，也可用逗号分隔")
            ], -1)),
            $e(u("textarea", {
              "onUpdate:modelValue": U[2] || (U[2] = (Z) => a.value.documentIds = Z),
              rows: "2",
              placeholder: "上传资料列表中的 ID"
            }, null, 512), [
              [Ve, a.value.documentIds]
            ])
          ]),
          u("label", f$, [
            U[14] || (U[14] = u("span", null, [
              he("标签 "),
              u("em", null, "用逗号分隔")
            ], -1)),
            $e(u("input", {
              "onUpdate:modelValue": U[3] || (U[3] = (Z) => a.value.tags = Z),
              placeholder: "角色, RAG, 回归"
            }, null, 512), [
              [Ve, a.value.tags]
            ])
          ]),
          u("label", p$, [
            U[16] || (U[16] = u("span", null, "难度", -1)),
            $e(u("select", {
              "onUpdate:modelValue": U[4] || (U[4] = (Z) => a.value.difficulty = Z)
            }, U[15] || (U[15] = [
              u("option", { value: "easy" }, "简单", -1),
              u("option", { value: "medium" }, "中等", -1),
              u("option", { value: "hard" }, "困难", -1)
            ]), 512), [
              [Qt, a.value.difficulty]
            ])
          ]),
          u("label", h$, [
            $e(u("input", {
              "onUpdate:modelValue": U[5] || (U[5] = (Z) => a.value.enabled = Z),
              type: "checkbox"
            }, null, 512), [
              [Xr, a.value.enabled]
            ]),
            U[17] || (U[17] = u("span", null, "加入后续评测", -1))
          ])
        ]),
        u("div", v$, [
          u("button", {
            class: "yv-button",
            type: "button",
            disabled: s.value,
            onClick: T
          }, "取消", 8, g$),
          u("button", {
            class: "yv-button primary",
            type: "button",
            disabled: s.value || !a.value.question.trim(),
            onClick: m
          }, [
            Q(B(ao), { size: 14 }),
            he(L(s.value ? "保存中" : "保存题目"), 1)
          ], 8, m$)
        ])
      ])) : re("", !0),
      o.value && !n.value.length ? (N(), O("div", y$, "读取题集…")) : !n.value.length && !z.spaceId ? (N(), O("div", b$, "先选择一个角色")) : n.value.length ? (N(), O("div", w$, [
        (N(!0), O(me, null, Te(n.value, (Z) => {
          var G;
          return N(), O("article", {
            key: Z.id,
            class: ve(["eval-dataset-row", { "is-disabled": Z.enabled === !1 }])
          }, [
            u("div", k$, [
              u("strong", null, L(Z.question), 1),
              Z.expected_answer ? (N(), O("p", E$, L(Z.expected_answer), 1)) : re("", !0),
              u("div", x$, [
                u("span", null, L(k(Z.difficulty)), 1),
                (G = Z.relevant_document_ids) != null && G.length ? (N(), O("span", S$, L(Z.relevant_document_ids.length) + " 份资料", 1)) : re("", !0),
                (N(!0), O(me, null, Te(Z.tags || [], (P) => (N(), O("span", {
                  key: P,
                  class: "eval-dataset-tag"
                }, L(P), 1))), 128)),
                Z.enabled === !1 ? (N(), O("span", C$, "已停用")) : re("", !0)
              ])
            ]),
            u("div", $$, [
              u("button", {
                class: "icon-button",
                type: "button",
                title: "编辑",
                disabled: s.value,
                onClick: (P) => S(Z)
              }, [
                Q(B(Bc), { size: 15 })
              ], 8, N$),
              u("button", {
                class: "icon-button danger",
                type: "button",
                title: "删除",
                disabled: s.value,
                onClick: (P) => _(Z)
              }, [
                Q(B(en), { size: 15 })
              ], 8, I$)
            ])
          ], 2);
        }), 128))
      ])) : (N(), O("div", _$, "还没有人工题目，先保存一条真实问题。"))
    ]));
  }
}), O$ = { class: "eval-candidates" }, T$ = { class: "eval-candidates-heading" }, P$ = { key: 0 }, D$ = ["disabled"], R$ = {
  key: 0,
  class: "eval-candidates-error"
}, A$ = {
  key: 1,
  class: "eval-candidates-empty"
}, L$ = {
  key: 2,
  class: "eval-candidates-empty"
}, V$ = {
  key: 3,
  class: "eval-candidates-empty"
}, z$ = {
  key: 4,
  class: "eval-candidates-list"
}, B$ = { class: "eval-candidate-head" }, F$ = { class: "eval-candidate-source" }, U$ = { class: "eval-candidate-signals" }, H$ = { class: "eval-candidate-question" }, j$ = { class: "eval-candidate-meta" }, G$ = { class: "eval-candidate-editor" }, Y$ = { class: "yv-field" }, q$ = ["onUpdate:modelValue"], X$ = { class: "eval-candidate-fields" }, K$ = { class: "yv-field" }, W$ = ["onUpdate:modelValue"], Z$ = { class: "yv-field" }, J$ = ["onUpdate:modelValue"], Q$ = { class: "yv-field" }, eN = ["onUpdate:modelValue"], tN = { class: "yv-field" }, nN = ["onUpdate:modelValue"], oN = { class: "eval-candidate-actions" }, sN = ["disabled", "onClick"], iN = ["disabled", "onClick"], rN = /* @__PURE__ */ Me({
  __name: "EvalCandidatePanel",
  props: {
    spaceId: {}
  },
  emits: ["accepted"],
  setup(e, { emit: t }) {
    const n = e, o = t, s = ee([]), i = ee(0), r = ee(!1), l = ee(!1), a = ee(""), c = ee(""), d = wn({}), p = ae(() => !!n.spaceId);
    function v(D) {
      return d[D.id] || (d[D.id] = {
        expectedAnswer: D.suggested_answer || "",
        documentIds: (D.relevant_document_ids || []).join(`
`),
        tags: (D.tags || []).join(", "),
        difficulty: "medium",
        note: ""
      });
    }
    function g(D) {
      return D.source === "feedback" ? "用户反馈" : "质量信号";
    }
    function k() {
      return n.spaceId ? (r.value = !0, c.value = "", qC(n.spaceId).then((D) => {
        s.value = D.items || [], i.value = D.pending_total || s.value.length;
        for (const m of s.value) v(m);
      }).catch((D) => {
        c.value = je(D);
      }).finally(() => {
        r.value = !1;
      })) : (s.value = [], i.value = 0, Promise.resolve());
    }
    async function $() {
      if (n.spaceId) {
        l.value = !0, c.value = "";
        try {
          const D = await XC(n.spaceId);
          s.value = D.items || [], i.value = s.value.length;
          for (const m of s.value) v(m);
        } catch (D) {
          c.value = je(D);
        } finally {
          l.value = !1;
        }
      }
    }
    async function S(D) {
      if (n.spaceId) {
        a.value = D.id, c.value = "";
        try {
          await WC(n.spaceId, D.id, v(D)), s.value = s.value.filter((m) => m.id !== D.id), i.value = Math.max(0, i.value - 1), o("accepted");
        } catch (m) {
          c.value = je(m);
        } finally {
          a.value = "";
        }
      }
    }
    async function T(D) {
      if (n.spaceId) {
        a.value = D.id, c.value = "";
        try {
          await ZC(n.spaceId, D.id, d[D.id].note), s.value = s.value.filter((m) => m.id !== D.id), i.value = Math.max(0, i.value - 1);
        } catch (m) {
          c.value = je(m);
        } finally {
          a.value = "";
        }
      }
    }
    return Ne(() => n.spaceId, k, { immediate: !0 }), (D, m) => (N(), O("section", O$, [
      u("header", T$, [
        u("div", null, [
          m[1] || (m[1] = u("span", { class: "yv-kicker" }, "Quality loop", -1)),
          u("h2", null, [
            m[0] || (m[0] = he("失败样本 ")),
            p.value ? (N(), O("small", P$, L(i.value) + " 条待确认", 1)) : re("", !0)
          ]),
          m[2] || (m[2] = u("p", null, "把真实问答里的问题沉淀为人工题，确认后才会进入正式评测。", -1))
        ]),
        u("button", {
          class: "yv-button",
          type: "button",
          disabled: !p.value || l.value,
          onClick: $
        }, [
          Q(B(Nt), {
            size: 14,
            class: ve({ "is-spinning": l.value })
          }, null, 8, ["class"]),
          he(L(l.value ? "扫描中" : "扫描新样本"), 1)
        ], 8, D$)
      ]),
      c.value ? (N(), O("p", R$, L(c.value), 1)) : re("", !0),
      p.value ? r.value && !s.value.length ? (N(), O("div", L$, "读取待确认样本…")) : s.value.length ? (N(), O("div", z$, [
        (N(!0), O(me, null, Te(s.value, (_) => (N(), O("article", {
          key: _.id,
          class: "eval-candidate-row"
        }, [
          u("div", B$, [
            u("div", null, [
              u("span", F$, L(g(_)), 1),
              u("small", null, "查询 " + L(_.source_query_id.slice(0, 8)), 1)
            ]),
            u("div", U$, [
              (N(!0), O(me, null, Te(_.signals, (z) => (N(), O("span", {
                key: z.code
              }, L(z.label), 1))), 128))
            ])
          ]),
          u("strong", H$, L(_.question), 1),
          u("div", j$, [
            u("span", null, "置信度 " + L(_.confidence.toFixed(2)), 1),
            u("span", null, L(_.grounded ? "已接地" : "未接地"), 1),
            u("span", null, L(_.useful ? "已解决" : "未解决"), 1)
          ]),
          u("div", G$, [
            u("label", Y$, [
              m[3] || (m[3] = u("span", null, [
                he("标准答案 "),
                u("em", null, "建议答案可直接修改")
              ], -1)),
              $e(u("textarea", {
                "onUpdate:modelValue": (z) => d[_.id].expectedAnswer = z,
                rows: "3"
              }, null, 8, q$), [
                [Ve, d[_.id].expectedAnswer]
              ])
            ]),
            u("div", X$, [
              u("label", K$, [
                m[4] || (m[4] = u("span", null, "关联资料 ID", -1)),
                $e(u("input", {
                  "onUpdate:modelValue": (z) => d[_.id].documentIds = z,
                  placeholder: "每行一个 DocumentJob ID"
                }, null, 8, W$), [
                  [Ve, d[_.id].documentIds]
                ])
              ]),
              u("label", Z$, [
                m[5] || (m[5] = u("span", null, "标签", -1)),
                $e(u("input", {
                  "onUpdate:modelValue": (z) => d[_.id].tags = z,
                  placeholder: "例如：反馈回流, 边界问题"
                }, null, 8, J$), [
                  [Ve, d[_.id].tags]
                ])
              ]),
              u("label", Q$, [
                m[7] || (m[7] = u("span", null, "难度", -1)),
                $e(u("select", {
                  "onUpdate:modelValue": (z) => d[_.id].difficulty = z
                }, m[6] || (m[6] = [
                  u("option", { value: "easy" }, "简单", -1),
                  u("option", { value: "medium" }, "中等", -1),
                  u("option", { value: "hard" }, "困难", -1)
                ]), 8, eN), [
                  [Qt, d[_.id].difficulty]
                ])
              ])
            ]),
            u("label", tN, [
              m[8] || (m[8] = u("span", null, "复核备注", -1)),
              $e(u("input", {
                "onUpdate:modelValue": (z) => d[_.id].note = z,
                placeholder: "可选：记录为什么收录或忽略"
              }, null, 8, nN), [
                [Ve, d[_.id].note]
              ])
            ])
          ]),
          u("div", oN, [
            u("button", {
              class: "yv-button primary",
              type: "button",
              disabled: a.value === _.id,
              onClick: (z) => S(_)
            }, [
              Q(B(ao), { size: 14 }),
              m[9] || (m[9] = he("收录为人工题"))
            ], 8, sN),
            u("button", {
              class: "yv-button",
              type: "button",
              disabled: a.value === _.id,
              onClick: (z) => T(_)
            }, [
              Q(B(Kt), { size: 14 }),
              m[10] || (m[10] = he("忽略"))
            ], 8, iN)
          ])
        ]))), 128))
      ])) : (N(), O("div", V$, "暂无待确认样本。点击“扫描新样本”读取低置信度、未接地或负反馈查询。")) : (N(), O("div", A$, "先选择一个角色。"))
    ]));
  }
}), lN = { class: "yv-page evaluation-page" }, aN = { class: "evaluation-hero" }, uN = { class: "evaluation-control" }, cN = { class: "control-fields" }, dN = { class: "yv-field" }, fN = ["value"], pN = { class: "yv-field" }, hN = { class: "yv-field" }, vN = { class: "control-actions" }, gN = ["disabled"], mN = ["disabled"], yN = ["href"], bN = { class: "run-status" }, _N = {
  key: 0,
  class: "results-stage"
}, wN = { class: "metric-lead" }, kN = { class: "metric-groups" }, EN = {
  key: 0,
  class: "analysis-block"
}, xN = { class: "case-section" }, SN = { class: "case-index" }, CN = {
  key: 1,
  class: "evaluation-empty"
}, $N = /* @__PURE__ */ Me({
  __name: "App",
  setup(e) {
    const t = ee([]), n = ee(""), o = ee("fast"), s = ee("generated"), i = ae(() => t.value.find((C) => C.id === n.value)), r = ee({ state: "idle", progress: 0, total: 0 }), l = ee(null), a = ee(""), c = ee(""), d = ee(!1), p = ee(!1), v = ee(!1);
    let g = 0;
    const k = ae(() => ({ idle: "未运行", running: r.value.phase === "generating" ? "生成问题" : "评测中", done: "已完成", error: "失败" })[r.value.state] || r.value.state || "未运行"), $ = ae(() => FC(Number(r.value.progress || 0), Number(r.value.total || 0))), S = ae(() => {
      var C;
      return ((C = l.value) == null ? void 0 : C.cases) || [];
    }), T = ae(() => v.value ? S.value : S.value.slice(0, 3)), D = ae(() => {
      var A;
      const C = ((A = l.value) == null ? void 0 : A.metrics) || {};
      return [
        { label: "Top 3 召回率", value: ys("recall_at_3_answerable", C.recall_at_3_answerable), tone: z("recall_at_3_answerable", C.recall_at_3_answerable) },
        { label: "回答接地率", value: ys("grounded_rate", C.grounded_rate), tone: z("grounded_rate", C.grounded_rate) },
        { label: "质量通过率", value: ys("accepted_rate", C.accepted_rate), tone: z("accepted_rate", C.accepted_rate) },
        { label: "P95 总延迟", value: C.p95_total_latency_ms == null ? "—" : `${Math.round(Number(C.p95_total_latency_ms))} ms`, tone: "" }
      ];
    }), m = [
      { title: "检索质量", keys: ["recall_at_3_answerable", "precision_at_3_answerable", "mrr_at_3_answerable", "hit_at_3_answerable", "cases_answerable", "mean_latency_ms", "p95_latency_ms"] },
      { title: "回答质量", keys: ["grounded_rate", "useful_rate", "accepted_rate", "answer_rate", "refusal_rate", "cases_checked", "mean_confidence", "scope_isolation_ok"] },
      { title: "行为与性能", keys: ["rewrite_rate", "correction_rate", "mean_rewrite_count", "mean_correction_count", "complex_rewrite_rate", "complex_correction_rate", "probe_refusal_rate", "cases_total", "cases_complex", "mean_total_latency_ms", "p95_total_latency_ms"] }
    ], _ = { recall_at_3_answerable: "可答问题召回率 Recall@3", precision_at_3_answerable: "可答问题精确率 Precision@3", mrr_at_3_answerable: "可答问题 MRR@3", hit_at_3_answerable: "可答问题命中 Hit@3", cases_answerable: "可答用例数", mean_latency_ms: "平均检索延迟 (ms)", p95_latency_ms: "P95 检索延迟 (ms)", grounded_rate: "事实接地率", useful_rate: "问题解决率", accepted_rate: "质量通过率", answer_rate: "正常作答率", refusal_rate: "拒答率", cases_checked: "生成已检用例", mean_confidence: "平均置信度", scope_isolation_ok: "跨角色隔离校验", rewrite_rate: "查询改写触发率", correction_rate: "生成纠错触发率", mean_rewrite_count: "平均改写次数", mean_correction_count: "平均纠错次数", complex_rewrite_rate: "复杂题改写率", complex_correction_rate: "复杂题纠错率", probe_refusal_rate: "无关问题拒答率", cases_total: "用例总数", cases_complex: "复杂题数", mean_total_latency_ms: "平均整链路延迟 (ms)", p95_total_latency_ms: "P95 整链路延迟 (ms)" };
    function z(C, A) {
      if (C === "scope_isolation_ok") return A ? "good" : "bad";
      const M = Number(A);
      return !["recall_at_3_answerable", "precision_at_3_answerable", "mrr_at_3_answerable", "hit_at_3_answerable", "grounded_rate", "useful_rate", "accepted_rate", "answer_rate", "mean_confidence"].includes(C) || !Number.isFinite(M) ? "" : M >= 0.8 ? "good" : M <= 0.2 ? "bad" : "";
    }
    function U() {
      return r.value.phase === "generating" ? r.value.status_text || "正在从角色资料生成问题" : r.value.total > 0 ? [`已完成 ${r.value.progress}/${r.value.total} 条`, r.value.current_question_text, r.value.current_step].filter(Boolean).join(" · ") : c.value || "等待开始";
    }
    async function Z() {
      try {
        t.value = await De("/api/personas"), !n.value && t.value.length && (n.value = t.value[0].id);
      } catch (C) {
        c.value = je(C);
      }
    }
    async function G() {
      l.value = await De("/api/eval/results");
    }
    function P() {
      g += 1, d.value = !1;
    }
    async function V() {
      const C = ++g;
      d.value = !0;
      for (let A = 0; A < 1200 && C === g; A += 1) {
        try {
          if (r.value = await De("/api/eval/status"), r.value.state === "done") {
            await G(), d.value = !1;
            return;
          }
          if (r.value.state === "error") {
            c.value = r.value.error || "评测失败", d.value = !1;
            return;
          }
        } catch (M) {
          c.value = je(M), d.value = !1;
          return;
        }
        await new Promise((M) => setTimeout(M, 500));
      }
    }
    async function Y() {
      if (!n.value) {
        c.value = "请先选择评测角色";
        return;
      }
      c.value = "", l.value = null, a.value = "", v.value = !1;
      try {
        await De("/api/eval/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(UC({ personaId: n.value, tier: o.value, datasetMode: s.value })) }), await V();
      } catch (C) {
        c.value = je(C), d.value = !1;
      }
    }
    async function H() {
      p.value = !0;
      try {
        const C = await De("/api/eval/analyze", { method: "POST" });
        a.value = C.analysis || "分析结果为空";
      } catch (C) {
        c.value = je(C);
      } finally {
        p.value = !1;
      }
    }
    async function J() {
      await Z();
      try {
        r.value = await De("/api/eval/status"), r.value.state === "running" ? V() : r.value.state === "done" && await G();
      } catch {
      }
    }
    return rt(() => {
      const C = document.querySelector("#evaluation-app-root");
      C == null || C.addEventListener("yumeno:evaluation-show", J), C == null || C.addEventListener("yumeno:evaluation-hide", P), J();
    }), sn(P), (C, A) => {
      var M, R;
      return N(), O("main", lN, [
        u("header", aN, [
          A[4] || (A[4] = u("div", null, [
            u("span", { class: "yv-kicker" }, "Retrieval quality lab"),
            u("h1", null, "RAG 评测"),
            u("p", null, "用可复现指标检查召回、回答接地与整链路延迟。")
          ], -1)),
          u("span", {
            class: ve(["yv-status", r.value.state === "done" ? "ok" : r.value.state === "error" ? "error" : d.value ? "warn" : ""])
          }, L(k.value), 3)
        ]),
        u("section", uN, [
          u("div", cN, [
            u("label", dN, [
              A[6] || (A[6] = u("span", null, "评测角色", -1)),
              $e(u("select", {
                "onUpdate:modelValue": A[0] || (A[0] = (j) => n.value = j)
              }, [
                A[5] || (A[5] = u("option", { value: "" }, "请选择角色", -1)),
                (N(!0), O(me, null, Te(t.value, (j) => (N(), O("option", {
                  key: j.id,
                  value: j.id
                }, L(j.name), 9, fN))), 128))
              ], 512), [
                [Qt, n.value]
              ])
            ]),
            u("label", pN, [
              A[8] || (A[8] = u("span", null, "问题规模", -1)),
              $e(u("select", {
                "onUpdate:modelValue": A[1] || (A[1] = (j) => o.value = j)
              }, A[7] || (A[7] = [
                u("option", { value: "fast" }, "轻量 · 5 个问题", -1),
                u("option", { value: "standard" }, "标准 · 10 个问题", -1),
                u("option", { value: "thorough" }, "全面 · 15 个问题", -1)
              ]), 512), [
                [Qt, o.value]
              ])
            ]),
            u("label", hN, [
              A[10] || (A[10] = u("span", null, "题目来源", -1)),
              $e(u("select", {
                "onUpdate:modelValue": A[2] || (A[2] = (j) => s.value = j)
              }, A[9] || (A[9] = [
                u("option", { value: "generated" }, "自动生成", -1),
                u("option", { value: "manual" }, "人工题集", -1),
                u("option", { value: "combined" }, "人工 + 自动", -1)
              ]), 512), [
                [Qt, s.value]
              ])
            ])
          ]),
          u("div", vN, [
            u("button", {
              class: "yv-button primary",
              disabled: d.value,
              onClick: Y
            }, [
              Q(B(Fc)),
              he(L(d.value ? "评测进行中" : "生成并评测"), 1)
            ], 8, gN),
            u("button", {
              class: "yv-button",
              disabled: !l.value || p.value,
              onClick: H
            }, [
              Q(B(dv)),
              he(L(p.value ? "分析中" : "AI 分析"), 1)
            ], 8, mN),
            u("a", {
              class: ve(["yv-button", { disabled: !l.value }]),
              href: l.value ? "/api/eval/export" : void 0
            }, [
              Q(B(Kn)),
              A[11] || (A[11] = he("导出 JSON"))
            ], 10, yN)
          ])
        ]),
        Q(rN, {
          "space-id": (M = i.value) == null ? void 0 : M.knowledge_space_id
        }, null, 8, ["space-id"]),
        Q(M$, {
          "space-id": (R = i.value) == null ? void 0 : R.knowledge_space_id
        }, null, 8, ["space-id"]),
        u("section", bN, [
          u("div", null, [
            u("strong", null, L(k.value), 1),
            u("p", {
              class: ve({ error: c.value })
            }, L(c.value || U()), 3)
          ]),
          u("div", {
            class: ve(["progress-track", { indeterminate: d.value && r.value.phase === "generating" }])
          }, [
            u("span", {
              style: it({ width: `${$.value}%` })
            }, null, 4)
          ], 2)
        ]),
        l.value ? (N(), O("section", _N, [
          u("div", wN, [
            (N(!0), O(me, null, Te(D.value, (j) => (N(), O("article", {
              key: j.label,
              class: ve(j.tone)
            }, [
              u("span", null, L(j.label), 1),
              u("strong", null, L(j.value), 1)
            ], 2))), 128))
          ]),
          u("div", kN, [
            (N(), O(me, null, Te(m, (j) => u("section", {
              key: j.title
            }, [
              u("h2", null, L(j.title), 1),
              u("div", null, [
                (N(!0), O(me, null, Te(j.keys.filter((ne) => {
                  var le, fe;
                  return ((le = l.value.metrics) == null ? void 0 : le[ne]) !== void 0 && ((fe = l.value.metrics) == null ? void 0 : fe[ne]) !== null;
                }), (ne) => (N(), O("article", { key: ne }, [
                  u("span", null, L(_[ne] || ne), 1),
                  u("strong", {
                    class: ve(z(ne, l.value.metrics[ne]))
                  }, L(B(ys)(ne, l.value.metrics[ne])), 3)
                ]))), 128))
              ])
            ])), 64))
          ]),
          a.value ? (N(), O("section", EN, [
            A[12] || (A[12] = u("span", { class: "yv-kicker" }, "AI review", -1)),
            A[13] || (A[13] = u("h2", null, "结果解读", -1)),
            u("p", null, L(a.value), 1)
          ])) : re("", !0),
          u("section", xN, [
            u("header", null, [
              A[14] || (A[14] = u("div", null, [
                u("span", { class: "yv-kicker" }, "Case evidence"),
                u("h2", null, "逐条详情")
              ], -1)),
              S.value.length > 3 ? (N(), O("button", {
                key: 0,
                class: "yv-button",
                onClick: A[3] || (A[3] = (j) => v.value = !v.value)
              }, L(v.value ? "收起" : `展开全部 ${S.value.length} 条`), 1)) : re("", !0)
            ]),
            (N(!0), O(me, null, Te(T.value, (j, ne) => (N(), O("article", {
              key: ne,
              class: "case-row"
            }, [
              u("div", SN, L(String(ne + 1).padStart(2, "0")), 1),
              u("div", null, [
                u("strong", null, L(j.question), 1),
                u("p", null, L((j.answer || "").slice(0, 240)), 1),
                u("small", null, L([j.grounded == null ? "grounded=—" : `grounded=${j.grounded}`, j.useful == null ? "useful=—" : `useful=${j.useful}`, `confidence=${j.confidence ?? "—"}`, j.rewrite_used ? "查询改写" : "", j.corrected ? "生成纠错" : "", j.is_probe ? "无关探针" : ""].filter(Boolean).join(" · ")), 1)
              ]),
              u("span", {
                class: ve(["yv-status", j.accepted || j.is_probe && j.refused ? "ok" : "error"])
              }, L(j.accepted || j.is_probe && j.refused ? "符合预期" : "未通过"), 3)
            ]))), 128))
          ])
        ])) : (N(), O("section", CN, [
          Q(B(ev)),
          A[15] || (A[15] = u("h2", null, "等待一轮可比较的结果", -1)),
          A[16] || (A[16] = u("p", null, "选择角色和问题规模后开始。评测会覆盖知识召回、复杂问题与无关问题拒答。", -1))
        ]))
      ]);
    };
  }
});
let gn = null;
const Cf = () => document.querySelector("#evaluation-app-root");
function hM(e = "#evaluation-app-root") {
  if (gn) return gn;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("RAG 评测挂载点不存在");
  return gn = es($N), gn.mount(t), gn;
}
function vM() {
  var e;
  (e = Cf()) == null || e.dispatchEvent(new CustomEvent("yumeno:evaluation-show"));
}
function gM() {
  var e;
  (e = Cf()) == null || e.dispatchEvent(new CustomEvent("yumeno:evaluation-hide"));
}
function mM() {
  gn && (gn.unmount(), gn = null);
}
async function ss(e, t) {
  const n = await fetch(e, t), o = await n.json().catch(() => null);
  if (!n.ok) throw new Error((o == null ? void 0 : o.detail) || `请求失败 (${n.status})`);
  return o;
}
function NN() {
  return ss("/api/reranker/status", { cache: "no-store" });
}
function IN(e) {
  return ss("/api/reranker/install", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
    body: JSON.stringify({ model_id: "Qwen/Qwen3-Reranker-0.6B", source: "modelscope", device: e })
  });
}
function MN() {
  return ss("/api/reranker/install/cancel", { method: "DELETE", headers: { "X-YUMENO-Request": "web" } });
}
function ON() {
  return ss("/api/reranker/model", { method: "DELETE", headers: { "X-YUMENO-Request": "web" } });
}
function TN() {
  return ss("/api/reranker/model-directory", { method: "POST", headers: { "X-YUMENO-Request": "web" } });
}
const PN = { class: "settings-summary" }, DN = { class: "section-toggle-label" }, RN = { class: "asr-resource-bar" }, AN = {
  key: 0,
  max: "100"
}, LN = {
  key: 1,
  class: "inline-status"
}, VN = { class: "asr-actions" }, zN = ["disabled"], BN = ["disabled"], FN = ["disabled"], UN = ["disabled"], HN = { class: "settings-grid one-column reranker-settings-grid" }, jN = { class: "field provider-field" }, GN = ["disabled"], YN = /* @__PURE__ */ Me({
  __name: "RerankerSettingsApp",
  setup(e) {
    const t = ee(null), n = ee("auto"), o = ee(!1), s = ee(""), i = ee(!1);
    let r;
    const l = ae(() => s.value ? "检查失败" : t.value ? t.value.installing ? "安装中" : t.value.ready ? "已就绪" : t.value.installed ? "已安装，等待加载" : "未安装" : "检查中"), a = ae(() => s.value ? s.value : t.value ? t.value.ready ? "本地精排可用；检索候选将经过语义重排序。" : t.value.installed ? "模型文件完整，将在首次检索时加载。" : "未安装时系统自动使用 RRF 融合结果，不会阻断知识检索。" : "正在读取本地模型状态"), c = ae(() => {
      var $;
      if (!(($ = t.value) != null && $.installing)) return "";
      const g = t.value.phase || "准备资源";
      return `${t.value.current_file || g} · ${Math.round(t.value.elapsed_seconds || 0)} 秒`;
    });
    async function d() {
      try {
        t.value = await NN(), n.value = t.value.device || n.value, s.value = t.value.error || "";
      } catch (g) {
        s.value = g instanceof Error ? g.message : "无法读取 Reranker 状态";
      }
    }
    async function p(g) {
      if (!o.value) {
        o.value = !0, s.value = "";
        try {
          t.value = await g();
        } catch (k) {
          s.value = k instanceof Error ? k.message : "操作失败";
        } finally {
          o.value = !1;
        }
      }
    }
    async function v() {
      if (!o.value) {
        o.value = !0, s.value = "";
        try {
          await TN();
        } catch (g) {
          s.value = g instanceof Error ? g.message : "无法打开模型目录";
        } finally {
          o.value = !1;
        }
      }
    }
    return rt(() => {
      d(), r = window.setInterval(() => {
        var g;
        (g = t.value) != null && g.installing && d();
      }, 1500);
    }), sn(() => {
      r && window.clearInterval(r);
    }), (g, k) => {
      var $, S, T, D, m, _, z;
      return N(), O("details", {
        class: "panel settings-section",
        "data-collapsible": "",
        onToggle: k[4] || (k[4] = (U) => i.value = U.currentTarget.open)
      }, [
        u("summary", PN, [
          k[5] || (k[5] = u("span", { class: "settings-summary-title" }, [
            u("strong", null, "Reranker 精排"),
            u("span", { class: "settings-summary-meta" }, "候选重排序 · 本地模型 · RRF 自动降级")
          ], -1)),
          u("span", DN, L(i.value ? "收起" : "展开"), 1)
        ]),
        k[9] || (k[9] = u("p", { class: "settings-help" }, [
          he("使用本地模型 "),
          u("code", null, "Qwen3-Reranker-0.6B"),
          he(" 对召回候选精排；模型未安装或暂不可用时，系统自动保留 RRF 融合结果。")
        ], -1)),
        u("div", RN, [
          u("div", null, [
            u("strong", null, L(l.value), 1),
            u("p", {
              class: ve(["inline-status", { "is-error": !!s.value }]),
              role: "status",
              "aria-live": "polite"
            }, L(a.value), 3),
            ($ = t.value) != null && $.installing ? (N(), O("progress", AN)) : re("", !0),
            c.value ? (N(), O("p", LN, L(c.value), 1)) : re("", !0)
          ]),
          u("div", VN, [
            u("button", {
              class: "button button-secondary",
              type: "button",
              disabled: o.value,
              onClick: v
            }, [
              Q(B(Do), { size: 16 }),
              k[6] || (k[6] = he("打开目录"))
            ], 8, zN),
            u("button", {
              class: "button button-danger",
              type: "button",
              disabled: o.value || !((S = t.value) != null && S.installed) || ((T = t.value) == null ? void 0 : T.installing),
              onClick: k[0] || (k[0] = (U) => p(B(ON)))
            }, "删除", 8, BN),
            (D = t.value) != null && D.installing ? (N(), O("button", {
              key: 0,
              class: "button button-secondary",
              type: "button",
              disabled: o.value || t.value.cancelling,
              onClick: k[1] || (k[1] = (U) => p(B(MN)))
            }, "取消下载", 8, FN)) : (N(), O("button", {
              key: 1,
              class: "button button-primary",
              type: "button",
              disabled: o.value || ((m = t.value) == null ? void 0 : m.installed),
              onClick: k[2] || (k[2] = (U) => p(() => B(IN)(n.value)))
            }, "安装", 8, UN))
          ])
        ]),
        u("div", HN, [
          u("label", jN, [
            k[8] || (k[8] = u("span", null, "运行设备", -1)),
            $e(u("select", {
              "onUpdate:modelValue": k[3] || (k[3] = (U) => n.value = U),
              disabled: o.value || ((_ = t.value) == null ? void 0 : _.installing) || ((z = t.value) == null ? void 0 : z.installed)
            }, k[7] || (k[7] = [
              u("option", { value: "auto" }, "自动（GPU 优先）", -1),
              u("option", { value: "cuda" }, "仅 GPU", -1),
              u("option", { value: "cpu" }, "仅 CPU", -1)
            ]), 8, GN), [
              [Qt, n.value]
            ])
          ])
        ]),
        k[10] || (k[10] = u("details", { class: "settings-help" }, [
          u("summary", null, "参数说明"),
          u("p", null, [
            he("模型固定为 "),
            u("code", null, "Qwen/Qwen3-Reranker-0.6B"),
            he("，从 ModelScope 下载。设备选择在安装时保存；需要更换设备时，删除后重新安装。")
          ])
        ], -1))
      ], 32);
    };
  }
}), qN = /* @__PURE__ */ fl(YN, [["__scopeId", "data-v-bf7b6366"]]), XN = { class: "providers-settings" }, KN = { class: "settings-header" }, WN = ["disabled"], ZN = {
  class: "provider-tabs",
  role: "tablist",
  "aria-label": "供应商类型"
}, JN = ["aria-selected", "onClick"], QN = {
  key: 0,
  class: "download-center",
  "aria-label": "资源下载中心"
}, eI = ["aria-expanded"], tI = { class: "download-summary-icon" }, nI = { class: "download-summary-copy" }, oI = {
  key: 0,
  class: "download-summary-progress"
}, sI = {
  class: "config-drawer download-drawer",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "资源下载任务"
}, iI = { class: "drawer-header" }, rI = { class: "drawer-header-actions" }, lI = { class: "drawer-body download-list" }, aI = {
  key: 0,
  class: "empty-state"
}, uI = {
  key: 1,
  class: "empty-state"
}, cI = { class: "download-task-head" }, dI = { class: "task-progress" }, fI = { class: "download-task-meta" }, pI = { key: 0 }, hI = { key: 1 }, vI = { key: 2 }, gI = {
  key: 3,
  class: "task-error"
}, mI = {
  key: 0,
  class: "download-task-actions"
}, yI = ["onClick"], bI = {
  key: 1,
  class: "download-task-actions"
}, _I = ["onClick"], wI = {
  key: 2,
  class: "local-production-zone",
  "aria-labelledby": "local-production-title"
}, kI = { class: "production-grid" }, EI = {
  key: 0,
  class: "production-card production-card-rvc"
}, xI = { class: "production-card-head" }, SI = { class: "production-facts" }, CI = { class: "production-actions" }, $I = {
  key: 1,
  class: "production-card"
}, NI = { class: "production-card-head" }, II = { class: "production-actions" }, MI = { class: "production-card production-card-ffmpeg" }, OI = { class: "production-card-head" }, TI = { class: "production-facts" }, PI = { class: "production-actions" }, DI = ["disabled"], RI = ["disabled"], AI = ["disabled"], LI = {
  key: 3,
  class: "providers-main"
}, VI = { class: "section-heading" }, zI = { class: "section-label" }, BI = {
  key: 0,
  class: "loading-state"
}, FI = {
  key: 1,
  class: "error-state"
}, UI = {
  key: 2,
  class: "empty-state"
}, HI = ["onClick", "onKeydown"], jI = { class: "provider-header" }, GI = { class: "provider-title" }, YI = {
  key: 0,
  class: "mode-badge"
}, qI = {
  key: 1,
  class: "mode-badge api"
}, XI = { class: "provider-description" }, KI = ["title"], WI = {
  key: 0,
  class: "provider-meta resource-meta"
}, ZI = {
  key: 1,
  class: "provider-meta"
}, JI = {
  key: 0,
  class: "meta-url"
}, QI = { class: "provider-actions" }, e3 = ["onClick"], t3 = ["onClick", "disabled"], n3 = ["onClick", "disabled"], o3 = {
  class: "config-drawer rvc-workspace-drawer",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "RVC 音频生产资源管理"
}, s3 = { class: "drawer-header" }, i3 = { class: "drawer-body rvc-workspace-body" }, r3 = { class: "rvc-workspace-summary" }, l3 = {
  class: "rvc-component-list",
  "aria-label": "RVC 资源状态"
}, a3 = { class: "rvc-component-icon" }, u3 = { key: 1 }, c3 = { class: "rvc-component-copy" }, d3 = { class: "rvc-install-block" }, f3 = {
  key: 0,
  class: "rvc-progress"
}, p3 = { class: "production-actions" }, h3 = ["disabled"], v3 = ["disabled"], g3 = ["disabled"], m3 = ["disabled"], y3 = {
  key: 0,
  class: "config-error"
}, b3 = {
  key: 1,
  class: "config-error"
}, _3 = ["aria-label"], w3 = { class: "drawer-header" }, k3 = { class: "drawer-body" }, E3 = { class: "drawer-status" }, x3 = {
  key: 0,
  class: "field"
}, S3 = { class: "field" }, C3 = ["placeholder"], $3 = { class: "field" }, N3 = ["placeholder"], I3 = { class: "resource-config-intro" }, M3 = {
  key: 0,
  class: "config-hint"
}, O3 = { class: "field" }, T3 = ["placeholder"], P3 = { class: "form-row" }, D3 = { class: "field" }, R3 = { class: "field" }, A3 = {
  key: 1,
  class: "resource-install-form"
}, L3 = { class: "field" }, V3 = {
  key: 2,
  class: "resource-config-readonly"
}, z3 = {
  key: 3,
  class: "resource-config-readonly"
}, B3 = { class: "resource-controls" }, F3 = { class: "resource-control-actions" }, U3 = ["disabled"], H3 = ["disabled"], j3 = ["disabled"], G3 = ["disabled"], Y3 = ["disabled"], q3 = ["disabled"], X3 = { class: "field checkbox-field" }, K3 = ["disabled"], W3 = {
  key: 2,
  class: "config-hint"
}, Z3 = { class: "modal-actions" }, J3 = ["disabled"], Q3 = {
  key: 3,
  class: "config-success"
}, eM = {
  key: 5,
  class: "config-error"
}, tM = /* @__PURE__ */ Me({
  __name: "ProvidersApp",
  setup(e) {
    const t = ee([]), n = ee("llm"), o = ee(!1), s = ee(""), i = ee(null), r = ee(null), l = ee(null), a = ee(""), c = ee(""), d = ee(""), p = ee([]), v = ee(!1), g = ee(!1), k = ee(!1);
    let $;
    const S = ee({
      provider_type: "",
      provider_id: "",
      api_key: "",
      base_url: "",
      model: "",
      source: "modelscope",
      device: "auto",
      enabled: !1
    }), T = [
      { id: "llm", label: "大语言模型(LLM)", count: 0 },
      { id: "embedding", label: "向量模型(Embedding)", count: 0 },
      { id: "reranker", label: "重排序(Rerankr)", count: 0 },
      { id: "stt", label: "语音转文字(STT)", count: 0 },
      { id: "tts", label: "文字转语音(TTS)", count: 0 },
      { id: "web_search", label: "联网搜索", count: 0 },
      { id: "audio", label: "音频", count: 0 }
    ], D = ae(() => t.value.filter((x) => x.type === n.value)), m = ae(() => t.value.find((x) => x.id === "rvc")), _ = ae(() => t.value.find((x) => x.id === "separator")), z = ee({}), U = ae(() => t.value.find((x) => x.id === i.value)), Z = ae(() => {
      var f;
      const x = (f = U.value) == null ? void 0 : f.id;
      return x === "local_embedding" ? "embedding" : x === "local_rerank" ? "reranker" : x === "local_stt" ? "stt" : x === "gsv_tts_local" ? "gpt_sovits" : x === "separator" ? "separator" : "none";
    });
    function G() {
      switch (Z.value) {
        case "embedding":
          return "用于知识库向量化；安装前可选择模型来源和运行设备。";
        case "reranker":
          return "用于检索结果重排；未安装时仍可使用 RRF 融合，不会阻断检索。";
        case "stt":
          return "本地语音识别由系统按固定清单准备，不需要在此重复填写模型参数。";
        case "gpt_sovits":
          return "引擎按需启动；安装完成后，声音资产仍在“声音”模块管理。";
        case "separator":
          return "人声分离使用应用已验证的固定模型，不需要填写通用模型来源或设备。";
        default:
          return "";
      }
    }
    const P = {
      local_embedding: { status: "/api/embedding/status", install: "/api/embedding/install", cancel: "/api/embedding/install/cancel", remove: "/api/embedding/model", directory: "/api/embedding/model-directory" },
      local_rerank: { status: "/api/reranker/status", install: "/api/reranker/install", cancel: "/api/reranker/install/cancel", remove: "/api/reranker/model", directory: "/api/reranker/model-directory" },
      local_stt: { status: "/api/stt/status", install: "/api/stt/install", cancel: "/api/stt/install/cancel", remove: "/api/stt/install", directory: "/api/stt/model-directory" },
      gsv_tts_local: { status: "/api/gpt-sovits/status", install: "/api/gpt-sovits/install", cancel: "/api/gpt-sovits/install/cancel", remove: "/api/gpt-sovits/install", directory: "/api/gpt-sovits/model-directory", start: "/api/gpt-sovits/service/start", stop: "/api/gpt-sovits/service/stop" },
      // RVC 是音色转换资源，不计入 TTS 供应商数量；后端未实现时由抽屉显示可读错误。
      rvc: { status: "/api/providers/rvc/status", install: "/api/providers/rvc/install", cancel: "/api/providers/rvc/install/cancel", remove: "/api/providers/rvc/install", directory: "/api/providers/rvc/directory" },
      separator: { status: "/api/providers/resources/separator", install: "/api/providers/resources/separator/install", cancel: "/api/providers/resources/tasks", remove: "/api/providers/resources/separator", directory: "/api/providers/resources/separator" }
    };
    function V(x) {
      return ["queued", "preparing", "downloading", "verifying", "installing"].includes(x.status);
    }
    const Y = ae(() => p.value.filter(V)), H = ae(() => p.value.filter((x) => !V(x)).length);
    function J(x) {
      if (!x || x < 1024) return `${x || 0} B`;
      const f = ["KB", "MB", "GB", "TB"];
      let q = x, X = -1;
      do
        q /= 1024, X++;
      while (q >= 1024 && X < f.length - 1);
      return `${q.toFixed(q >= 100 ? 0 : q >= 10 ? 1 : 2)} ${f[X]}`;
    }
    function C(x) {
      return x == null || x < 0 ? "—" : x < 60 ? `${Math.round(x)} 秒` : `${Math.floor(x / 60)} 分 ${Math.round(x % 60)} 秒`;
    }
    function A(x) {
      return { queued: "排队中", preparing: "准备中", downloading: "下载中", verifying: "校验中", installing: "安装中", ready: "已完成", failed: "失败", cancelled: "已取消", interrupted: "已中断" }[x.status] || x.status;
    }
    async function M() {
      k.value = !0;
      try {
        const x = await fetch("/api/resources/tasks?limit=30", { headers: { "X-YUMENO-Request": "web" }, cache: "no-store" });
        if (!x.ok) return;
        const f = await x.json(), q = Array.isArray(f) ? f : f.tasks || f.items || [];
        p.value = q.map((X) => ({
          ...X,
          progress_percent: X.progress_percent ?? (typeof X.progress == "number" ? X.progress : 0),
          error_message: X.error_message ?? X.error,
          current_file: X.current_file ?? X.detail
        }));
      } catch {
      } finally {
        k.value = !1;
      }
    }
    async function R(x) {
      try {
        await fetch(`/api/resources/tasks/${encodeURIComponent(x.task_id)}`, { method: "DELETE", headers: { "X-YUMENO-Request": "web" } }), await M();
      } catch (f) {
        s.value = f instanceof Error ? f.message : "取消下载失败";
      }
    }
    async function j() {
      try {
        const x = await fetch("/api/resources/tasks?finished=true", { method: "DELETE", headers: { "X-YUMENO-Request": "web" } });
        if (!x.ok) {
          const f = await x.json().catch(() => ({}));
          throw new Error(f.detail || `HTTP ${x.status}`);
        }
        await M();
      } catch (x) {
        s.value = x instanceof Error ? x.message : "清理下载记录失败";
      }
    }
    async function ne(x) {
      try {
        const f = await fetch(`/api/resources/tasks/${encodeURIComponent(x.task_id)}/retry`, { method: "POST", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" } });
        if (!f.ok) {
          const q = await f.json().catch(() => ({}));
          throw new Error(q.detail || `HTTP ${f.status}`);
        }
        await M();
      } catch (f) {
        s.value = f instanceof Error ? f.message : "重试下载失败";
      }
    }
    async function le() {
      try {
        const x = await fetch("/api/providers/resources/ffmpeg/status", { headers: { "X-YUMENO-Request": "web" }, cache: "no-store" });
        x.ok && (z.value = await x.json());
      } catch {
      }
    }
    async function fe(x) {
      const f = { install: "/api/providers/resources/ffmpeg/install", remove: "/api/providers/resources/ffmpeg", directory: "/api/providers/resources/ffmpeg/directory" };
      l.value = `ffmpeg:${x}`, s.value = "";
      try {
        const q = await fetch(f[x], { method: x === "remove" ? "DELETE" : x === "directory" ? "GET" : "POST", headers: { "X-YUMENO-Request": "web" } });
        if (!q.ok) {
          const X = await q.json().catch(() => ({}));
          throw new Error(X.detail || `HTTP ${q.status}`);
        }
        z.value = await q.json();
      } catch (q) {
        s.value = q instanceof Error ? q.message : "FFmpeg 操作失败";
      } finally {
        l.value = null;
      }
    }
    async function se() {
      o.value = !0, s.value = "";
      try {
        const x = await fetch("/api/providers/list", { cache: "no-store" });
        if (!x.ok) throw new Error(`HTTP ${x.status}`);
        const f = await x.json();
        t.value = f.providers || [], await le(), T.forEach((q) => {
          q.count = t.value.filter((X) => X.type === q.id).length;
        });
      } catch (x) {
        s.value = x instanceof Error ? x.message : "加载失败";
      } finally {
        o.value = !1;
      }
    }
    function ce(x) {
      if (x.id === "rvc") {
        g.value = !0, se();
        return;
      }
      i.value = x.id, a.value = "", c.value = "", s.value = "";
      const f = x.resource_status || {};
      S.value = {
        provider_type: x.type,
        provider_id: x.id,
        api_key: x.current_api_key || "",
        base_url: x.current_base_url || x.default_base_url,
        model: x.current_model || String(f.model_id || x.default_model || ""),
        source: String(f.source || "modelscope"),
        device: String(f.device || "auto"),
        enabled: x.is_active
      }, d.value = "";
    }
    function ue() {
      g.value = !1, s.value = "";
    }
    function ge(x) {
      var q, X;
      const f = (X = (q = m.value) == null ? void 0 : q.resource_status) == null ? void 0 : X.components;
      return (f == null ? void 0 : f[x]) || {};
    }
    function te(x) {
      return !!ge(x).ready;
    }
    function we(x) {
      return te(x) ? "已就绪" : x === "indices" ? "可选" : "待准备";
    }
    function xe() {
      var f, q;
      const x = (q = (f = m.value) == null ? void 0 : f.resource_status) == null ? void 0 : q.progress_percent;
      return typeof x == "number" ? Math.min(100, Math.max(0, x)) : 0;
    }
    function _e() {
      i.value = null, a.value = "", c.value = "", d.value = "", S.value = { provider_type: "", provider_id: "", api_key: "", base_url: "", model: "", source: "modelscope", device: "auto", enabled: !1 };
    }
    async function ke() {
      if (S.value.provider_id) {
        o.value = !0, s.value = "", a.value = "";
        try {
          const x = await fetch("/api/providers/configure", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
            body: JSON.stringify(h())
          });
          if (!x.ok) {
            const q = await x.json().catch(() => ({}));
            throw new Error(q.detail || `HTTP ${x.status}`);
          }
          const f = await x.json();
          a.value = f.message || "配置已保存", await se();
        } catch (x) {
          s.value = x instanceof Error ? x.message : "配置失败";
        } finally {
          o.value = !1;
        }
      }
    }
    function W() {
      switch (Z.value) {
        case "embedding":
        case "reranker":
          return { model_id: S.value.model, source: S.value.source || "modelscope", device: S.value.device || "auto" };
        case "gpt_sovits":
          return { url: d.value.trim() };
        default:
          return {};
      }
    }
    function h() {
      var f;
      const x = { ...S.value };
      return ((f = U.value) == null ? void 0 : f.mode) === "local" && (["embedding", "reranker"].includes(Z.value) || (delete x.model, delete x.source, delete x.device), delete x.api_key, delete x.base_url), x;
    }
    async function I(x, f) {
      const q = P[x.id], X = q == null ? void 0 : q[f];
      if (X) {
        l.value = `${x.id}:${f}`, s.value = "";
        try {
          const ie = f === "remove" || f === "cancel" ? "DELETE" : f === "directory" && x.id === "rvc" ? "GET" : f === "install" || f === "directory" || f === "start" || f === "stop" ? "POST" : "GET";
          let de;
          f === "install" && (de = x.id === "gsv_tts_local" ? JSON.stringify({ url: d.value.trim() }) : x.id === "local_stt" ? void 0 : JSON.stringify(W()));
          let be;
          if (f === "install" && x.mode === "local") {
            const Ce = `/api/resources/${encodeURIComponent(x.id)}/install`;
            be = await fetch(Ce, { method: "POST", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" }, body: JSON.stringify({ parameters: x.id === "gsv_tts_local" ? { url: d.value.trim() } : W() }) }), (be.status === 404 || be.status === 405) && (be = await fetch(X, { method: ie, headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" }, body: de }));
          } else
            be = await fetch(X, { method: ie, headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" }, body: de });
          if (!be.ok) {
            const Ce = await be.json().catch(() => ({}));
            throw new Error(Ce.detail || `HTTP ${be.status}`);
          }
          await se(), await M();
        } catch (ie) {
          s.value = ie instanceof Error ? ie.message : "资源操作失败";
        } finally {
          l.value = null;
        }
      }
    }
    async function y(x) {
      var f, q;
      o.value = !0, s.value = "";
      try {
        const X = await fetch("/api/providers/configure", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
          body: JSON.stringify({ provider_type: x.type, provider_id: x.id, api_key: x.current_api_key, base_url: x.current_base_url || x.default_base_url, model: x.current_model || x.default_model, source: (f = x.resource_status) == null ? void 0 : f.source, device: (q = x.resource_status) == null ? void 0 : q.device, enabled: !x.is_active })
        });
        if (!X.ok) {
          const ie = await X.json().catch(() => ({}));
          throw new Error(ie.detail || `HTTP ${X.status}`);
        }
        await se();
      } catch (X) {
        s.value = X instanceof Error ? X.message : "切换失败";
      } finally {
        o.value = !1;
      }
    }
    async function b(x) {
      r.value = x.id, s.value = "", c.value = "";
      try {
        const f = await fetch("/api/providers/test", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
          body: JSON.stringify({ provider_type: x.type, provider_id: x.id, api_key: x.current_api_key, base_url: x.current_base_url, model: x.current_model })
        });
        if (!f.ok) throw new Error(`HTTP ${f.status}`);
        const q = await f.json();
        c.value = q.ok ? `连接成功 · ${q.latency_ms}ms` : `连接失败 · ${q.message || "未知错误"}`;
      } catch (f) {
        c.value = `连接失败 · ${f instanceof Error ? f.message : "网络错误"}`;
      } finally {
        r.value = null;
      }
    }
    function w(x) {
      var q;
      const f = x.resource_status || {};
      return !!(f.ready || f.service_running || f.installed || (q = f.install) != null && q.installed);
    }
    function E(x) {
      var q;
      const f = x.resource_status || {};
      return !!(f.installing || (q = f.install) != null && q.installing);
    }
    function F(x) {
      var f, q;
      return E(x) ? `安装中${(f = x.resource_status) != null && f.phase ? ` · ${x.resource_status.phase}` : ""}` : x.id === "gsv_tts_local" && ((q = x.resource_status) != null && q.service_running) ? "服务运行中" : w(x) ? "资源就绪" : "未安装";
    }
    function K(x) {
      x.key === "Escape" && i.value && _e();
    }
    return rt(() => {
      se(), M(), $ = window.setInterval(() => {
        M(), se(), le();
      }, 2500), window.addEventListener("keydown", K);
    }), sn(() => {
      $ && window.clearInterval($), window.removeEventListener("keydown", K);
    }), (x, f) => {
      var q, X, ie, de, be, Ce, Oe, et, ot, yt, bt, rn, vo, lt, _t, go, pl, hl, vl, gl, ml, yl, bl, _l, wl, kl, El, xl, Sl, Cl, $l, Nl, Il, Ml, Ol, Tl;
      return N(), O("div", XN, [
        u("header", KN, [
          f[27] || (f[27] = u("div", null, [
            u("p", { class: "eyebrow" }, "RUNTIME / PROVIDERS"),
            u("h2", null, "供应商配置"),
            u("p", { class: "settings-help" }, "管理真正会被系统调用的 API 与本地资源。")
          ], -1)),
          u("button", {
            class: "refresh-button",
            type: "button",
            onClick: se,
            disabled: o.value,
            "aria-label": "刷新供应商列表"
          }, [
            Q(B(Nt), {
              size: 16,
              class: ve({ spin: o.value })
            }, null, 8, ["class"]),
            f[26] || (f[26] = he("刷新"))
          ], 8, WN)
        ]),
        u("nav", ZN, [
          (N(), O(me, null, Te(T, (oe) => u("button", {
            key: oe.id,
            class: ve(["tab-button", { active: n.value === oe.id }]),
            role: "tab",
            "aria-selected": n.value === oe.id,
            onClick: (mo) => n.value = oe.id
          }, [
            u("span", null, L(oe.label), 1)
          ], 10, JN)), 64))
        ]),
        Y.value.length ? (N(), O("section", QN, [
          u("button", {
            class: "download-summary",
            type: "button",
            onClick: f[0] || (f[0] = (oe) => v.value = !0),
            "aria-expanded": v.value
          }, [
            u("span", tI, [
              Q(B(Kn), {
                size: 16,
                class: ve({ spin: Y.value.length > 0 })
              }, null, 8, ["class"])
            ]),
            u("span", nI, [
              u("strong", null, L(Y.value.length ? `正在处理 ${Y.value.length} 个资源` : "资源任务中心"), 1),
              u("span", null, L(Y.value[0] ? `${Y.value[0].resource_name || Y.value[0].provider_id} · ${A(Y.value[0])}` : "查看最近的安装、校验与失败记录"), 1)
            ]),
            Y.value[0] ? (N(), O("span", oI, [
              u("b", null, L(Math.round(Y.value[0].progress_percent || 0)) + "%", 1),
              u("i", null, [
                u("em", {
                  style: it({ width: `${Math.min(100, Math.max(0, Y.value[0].progress_percent || 0))}%` })
                }, null, 4)
              ])
            ])) : re("", !0),
            f[28] || (f[28] = u("span", { class: "download-summary-arrow" }, "查看详情 →", -1))
          ], 8, eI)
        ])) : re("", !0),
        v.value ? (N(), O("div", {
          key: 1,
          class: "drawer-overlay",
          onClick: f[2] || (f[2] = gt((oe) => v.value = !1, ["self"]))
        }, [
          u("aside", sI, [
            u("div", iI, [
              f[29] || (f[29] = u("div", null, [
                u("p", { class: "eyebrow" }, "RESOURCE TASKS"),
                u("h3", null, "下载中心"),
                u("p", null, "只在有活动任务时显示入口；已结束任务可在这里重试或清理。")
              ], -1)),
              u("div", rI, [
                H.value ? (N(), O("button", {
                  key: 0,
                  class: "button button-quiet",
                  type: "button",
                  onClick: j
                }, "清理已结束")) : re("", !0),
                u("button", {
                  class: "modal-close",
                  type: "button",
                  onClick: f[1] || (f[1] = (oe) => v.value = !1),
                  "aria-label": "关闭下载中心"
                }, [
                  Q(B(Kt), { size: 18 })
                ])
              ])
            ]),
            u("div", lI, [
              k.value && !p.value.length ? (N(), O("p", aI, "加载任务中…")) : p.value.length ? re("", !0) : (N(), O("p", uI, "暂无资源任务")),
              (N(!0), O(me, null, Te(p.value, (oe) => (N(), O("article", {
                key: oe.task_id,
                class: ve(["download-task", `task-${oe.status}`])
              }, [
                u("div", cI, [
                  u("div", null, [
                    u("strong", null, L(oe.resource_name || oe.provider_id), 1),
                    u("span", null, [
                      he(L(A(oe)), 1),
                      oe.phase ? (N(), O(me, { key: 0 }, [
                        he(" · " + L(oe.phase), 1)
                      ], 64)) : re("", !0)
                    ])
                  ]),
                  u("b", null, L(oe.progress_percent == null ? "—" : `${Math.round(oe.progress_percent)}%`), 1)
                ]),
                u("div", dI, [
                  u("i", {
                    style: it({ width: `${Math.min(100, Math.max(0, oe.progress_percent || 0))}%` })
                  }, null, 4)
                ]),
                u("div", fI, [
                  oe.current_file ? (N(), O("span", pI, "当前文件：" + L(oe.current_file), 1)) : re("", !0),
                  oe.total_bytes ? (N(), O("span", hI, L(J(oe.downloaded_bytes)) + " / " + L(J(oe.total_bytes)), 1)) : re("", !0),
                  V(oe) ? (N(), O("span", vI, "速度 " + L(J(oe.speed_bytes_per_second)) + "/秒 · 剩余 " + L(C(oe.eta_seconds)), 1)) : re("", !0),
                  oe.error_message ? (N(), O("span", gI, L(oe.error_message), 1)) : re("", !0)
                ]),
                V(oe) ? (N(), O("div", mI, [
                  u("button", {
                    class: "button button-secondary",
                    type: "button",
                    onClick: (mo) => R(oe)
                  }, "取消", 8, yI)
                ])) : oe.status === "failed" ? (N(), O("div", bI, [
                  u("button", {
                    class: "button button-secondary",
                    type: "button",
                    onClick: (mo) => ne(oe)
                  }, [
                    Q(B(Nt), { size: 14 }),
                    f[30] || (f[30] = he("重试"))
                  ], 8, _I)
                ])) : re("", !0)
              ], 2))), 128))
            ])
          ])
        ])) : re("", !0),
        n.value === "audio" && (m.value || _.value) ? (N(), O("section", wI, [
          f[43] || (f[43] = u("div", { class: "section-heading" }, [
            u("div", null, [
              u("span", { class: "section-label" }, "LOCAL AUDIO PRODUCTION"),
              u("h3", { id: "local-production-title" }, "本地音频生产")
            ]),
            u("span", { class: "section-note" }, "不参与角色对话，只用于素材处理和文件生成")
          ], -1)),
          u("div", kI, [
            m.value ? (N(), O("article", EI, [
              u("div", xI, [
                f[31] || (f[31] = u("div", null, [
                  u("span", { class: "production-kicker" }, "RVC"),
                  u("h3", null, "RVC 音频生产")
                ], -1)),
                u("span", {
                  class: ve(["status-chip", { on: (q = m.value.resource_status) == null ? void 0 : q.ready }])
                }, L((X = m.value.resource_status) != null && X.ready ? "可用于音频生产" : (ie = m.value.resource_status) != null && ie.installing ? "准备中" : "资源未就绪"), 3)
              ]),
              f[34] || (f[34] = u("p", null, "使用已有音频和训练好的 .pth 音色模型生成新的变声音频文件。RVC 不作为 TTS，也不改变角色对话音色。", -1)),
              u("div", SI, [
                u("span", null, "内置核心：" + L((Ce = (be = (de = m.value.resource_status) == null ? void 0 : de.components) == null ? void 0 : be.source) != null && Ce.ready ? "已就绪" : "待准备"), 1),
                u("span", null, "Hubert：" + L((Oe = m.value.resource_status) != null && Oe.hubert_ready ? "已就绪" : "待准备"), 1),
                u("span", null, "RMVPE：" + L((et = m.value.resource_status) != null && et.rmvpe_ready ? "已就绪" : "待准备"), 1),
                f[32] || (f[32] = u("span", null, "模型由 RVC 页面管理", -1))
              ]),
              u("div", CI, [
                u("button", {
                  class: "button button-primary",
                  type: "button",
                  onClick: f[3] || (f[3] = (oe) => ce(m.value))
                }, [
                  Q(B(Mi), { size: 15 }),
                  f[33] || (f[33] = he("管理 RVC 资源"))
                ])
              ])
            ])) : re("", !0),
            _.value ? (N(), O("article", $I, [
              u("div", NI, [
                f[35] || (f[35] = u("div", null, [
                  u("span", { class: "production-kicker" }, "COMMON AUDIO"),
                  u("h3", null, "人声分离")
                ], -1)),
                u("span", {
                  class: ve(["status-chip", { on: (ot = _.value.resource_status) == null ? void 0 : ot.ready }])
                }, L((yt = _.value.resource_status) != null && yt.ready ? "已就绪" : "待准备"), 3)
              ]),
              f[37] || (f[37] = u("p", null, "通用声音前处理资源，供 GPT-SoVITS 数据集流程和其他音频处理任务使用。", -1)),
              u("div", II, [
                u("button", {
                  class: "button button-secondary",
                  type: "button",
                  onClick: f[4] || (f[4] = (oe) => ce(_.value))
                }, [
                  Q(B(Mi), { size: 15 }),
                  f[36] || (f[36] = he("管理人声分离"))
                ])
              ])
            ])) : re("", !0),
            u("article", MI, [
              u("div", OI, [
                f[38] || (f[38] = u("div", null, [
                  u("span", { class: "production-kicker" }, "MEDIA RUNTIME"),
                  u("h3", null, "FFmpeg")
                ], -1)),
                u("span", {
                  class: ve(["status-chip", { on: z.value.ready }])
                }, L(z.value.ready ? "可用" : "未安装"), 3)
              ]),
              f[42] || (f[42] = u("p", null, "音视频抽取、格式转换和声音工作流的基础运行时。使用独立受管副本，不复用 RVC 的来源或设备配置。", -1)),
              u("div", TI, [
                u("span", null, "受管副本：" + L(z.value.installed ? "已存在" : "未准备"), 1),
                u("span", null, "系统命令：" + L(z.value.system_path ? "已发现" : "未发现"), 1)
              ]),
              u("div", PI, [
                z.value.installed ? (N(), O("button", {
                  key: 1,
                  class: "button button-secondary",
                  type: "button",
                  onClick: f[6] || (f[6] = (oe) => fe("remove")),
                  disabled: l.value !== null
                }, [
                  Q(B(en), { size: 15 }),
                  f[40] || (f[40] = he("移除受管副本"))
                ], 8, RI)) : (N(), O("button", {
                  key: 0,
                  class: "button button-primary",
                  type: "button",
                  onClick: f[5] || (f[5] = (oe) => fe("install")),
                  disabled: l.value !== null
                }, [
                  Q(B(Kn), { size: 15 }),
                  f[39] || (f[39] = he("下载 FFmpeg"))
                ], 8, DI)),
                u("button", {
                  class: "button button-secondary",
                  type: "button",
                  onClick: f[7] || (f[7] = (oe) => fe("directory")),
                  disabled: l.value !== null
                }, [
                  Q(B(Do), { size: 15 }),
                  f[41] || (f[41] = he("打开目录"))
                ], 8, AI)
              ])
            ])
          ])
        ])) : re("", !0),
        n.value !== "audio" ? (N(), O("main", LI, [
          u("div", VI, [
            u("div", null, [
              u("span", zI, L((bt = T.find((oe) => oe.id === n.value)) == null ? void 0 : bt.label), 1),
              f[44] || (f[44] = u("h3", null, "供应商", -1))
            ]),
            f[45] || (f[45] = u("span", { class: "section-note" }, "点击卡片查看配置", -1))
          ]),
          o.value && t.value.length === 0 ? (N(), O("div", BI, [
            Q(B(Nt), {
              size: 22,
              class: "spin"
            }),
            f[46] || (f[46] = u("p", null, "加载中...", -1))
          ])) : s.value && t.value.length === 0 ? (N(), O("div", FI, [
            Q(B(Kt), { size: 22 }),
            u("p", null, L(s.value), 1),
            u("button", {
              class: "button button-primary",
              onClick: se
            }, "重试")
          ])) : D.value.length === 0 ? (N(), O("div", UI, f[47] || (f[47] = [
            u("p", null, "这个分类暂时没有可用供应商。", -1)
          ]))) : (N(), O("div", {
            key: 3,
            class: ve(["providers-grid", { compact: n.value === "llm" }])
          }, [
            (N(!0), O(me, null, Te(D.value, (oe) => {
              var mo;
              return N(), O("article", {
                key: oe.type + ":" + oe.id,
                class: ve(["provider-card", { configured: oe.is_configured, active: oe.is_active, local: oe.mode === "local" }]),
                tabindex: "0",
                onClick: (yo) => ce(oe),
                onKeydown: [
                  ca((yo) => ce(oe), ["enter"]),
                  ca(gt((yo) => ce(oe), ["prevent"]), ["space"])
                ]
              }, [
                u("div", jI, [
                  u("div", GI, [
                    u("span", {
                      class: ve(["provider-mark", { local: oe.mode === "local" }])
                    }, null, 2),
                    u("h3", null, L(oe.name), 1),
                    oe.mode === "local" ? (N(), O("span", YI, "本地")) : (N(), O("span", qI, "API"))
                  ]),
                  u("span", {
                    class: ve(["active-label", { on: oe.is_active }])
                  }, L(oe.is_active ? "已启用" : oe.runtime_supported ? "可启用" : "仅配置"), 3)
                ]),
                u("p", XI, L(oe.description), 1),
                u("div", {
                  class: ve(["runtime-status", { supported: oe.runtime_supported }]),
                  title: oe.runtime_note
                }, [
                  f[48] || (f[48] = u("span", { class: "runtime-dot" }, null, -1)),
                  he(L(oe.runtime_supported ? "已接入运行链路" : "暂未接入运行链路"), 1)
                ], 10, KI),
                oe.mode === "local" ? (N(), O("div", WI, [
                  f[49] || (f[49] = u("span", { class: "meta-label" }, "资源状态", -1)),
                  u("strong", null, L(F(oe)), 1),
                  u("code", null, L(((mo = oe.resource_status) == null ? void 0 : mo.model_id) || "尚未选择资源"), 1)
                ])) : (N(), O("div", ZI, [
                  f[50] || (f[50] = u("span", { class: "meta-label" }, "当前模型", -1)),
                  u("code", null, L(oe.current_model || oe.default_model || "按接口默认"), 1),
                  oe.current_base_url ? (N(), O("span", JI, L(oe.current_base_url), 1)) : re("", !0)
                ])),
                u("footer", QI, [
                  u("button", {
                    class: "button button-secondary",
                    type: "button",
                    onClick: gt((yo) => ce(oe), ["stop"])
                  }, [
                    Q(B(Mi), { size: 15 }),
                    f[51] || (f[51] = he("配置"))
                  ], 8, e3),
                  oe.mode === "api" && oe.is_configured && oe.runtime_supported ? (N(), O("button", {
                    key: 0,
                    class: "button button-test",
                    type: "button",
                    onClick: gt((yo) => b(oe), ["stop"]),
                    disabled: r.value === oe.id
                  }, [
                    Q(B(Nt), {
                      size: 15,
                      class: ve({ spin: r.value === oe.id })
                    }, null, 8, ["class"]),
                    he(L(r.value === oe.id ? "测试中" : "测试连接"), 1)
                  ], 8, t3)) : re("", !0),
                  oe.runtime_supported ? (N(), O("button", {
                    key: 1,
                    class: ve(["button", oe.is_active ? "button-active" : "button-primary"]),
                    type: "button",
                    onClick: gt((yo) => y(oe), ["stop"]),
                    disabled: o.value
                  }, L(oe.is_active ? "停用" : "启用"), 11, n3)) : re("", !0)
                ])
              ], 42, HI);
            }), 128))
          ], 2))
        ])) : re("", !0),
        g.value && m.value ? (N(), O("div", {
          key: 4,
          class: "drawer-overlay",
          onClick: gt(ue, ["self"])
        }, [
          u("aside", o3, [
            u("div", s3, [
              f[52] || (f[52] = u("div", null, [
                u("p", { class: "eyebrow" }, "LOCAL AUDIO PRODUCTION / RVC"),
                u("h3", null, "RVC 音频生产"),
                u("p", null, "只管理 RVC 音频到音频推理所需的运行时和模型，不参与角色对话或 TTS。")
              ], -1)),
              u("button", {
                class: "modal-close",
                type: "button",
                onClick: ue,
                "aria-label": "关闭 RVC 管理"
              }, [
                Q(B(Kt), { size: 18 })
              ])
            ]),
            u("div", i3, [
              u("div", r3, [
                u("div", null, [
                  f[53] || (f[53] = u("span", { class: "section-label" }, "推理可用性", -1)),
                  u("strong", null, L((rn = m.value.resource_status) != null && rn.ready ? "可以开始生成变声音频" : "还需要补完资源"), 1)
                ]),
                u("span", {
                  class: ve(["status-chip", { on: (vo = m.value.resource_status) == null ? void 0 : vo.ready }])
                }, L((lt = m.value.resource_status) != null && lt.ready ? "READY" : "INCOMPLETE"), 3)
              ]),
              u("div", l3, [
                (N(), O(me, null, Te([{ key: "source", title: "YUMENO 内置 RVC 核心", detail: "项目内置推理核心" }, { key: "runtime", title: "独立 Python 运行时", detail: "YUMENO/runtime/rvc" }, { key: "hubert", title: "Hubert 特征模型", detail: "用于音频特征提取" }, { key: "rmvpe", title: "RMVPE 音高模型", detail: "用于 F0 提取" }], (oe) => u("div", {
                  key: oe.key,
                  class: "rvc-component-row"
                }, [
                  u("div", a3, [
                    te(oe.key) ? (N(), vt(B(ao), {
                      key: 0,
                      size: 16
                    })) : (N(), O("span", u3, "·"))
                  ]),
                  u("div", c3, [
                    u("strong", null, L(oe.title), 1),
                    u("span", null, L(oe.detail), 1)
                  ]),
                  u("b", {
                    class: ve({ ready: te(oe.key) })
                  }, L(we(oe.key)), 3)
                ])), 64))
              ]),
              u("div", d3, [
                u("div", null, [
                  u("strong", null, L((_t = m.value.resource_status) != null && _t.installing ? "正在准备 RVC 运行时" : "补完推理环境"), 1),
                  u("p", null, L(((go = m.value.resource_status) == null ? void 0 : go.detail) || ((pl = m.value.resource_status) == null ? void 0 : pl.note)), 1)
                ]),
                (hl = m.value.resource_status) != null && hl.installing ? (N(), O("div", f3, [
                  u("span", null, L(Math.round(xe())) + "%", 1),
                  u("i", null, [
                    u("em", {
                      style: it({ width: `${xe()}%` })
                    }, null, 4)
                  ])
                ])) : re("", !0),
                u("div", p3, [
                  (vl = m.value.resource_status) != null && vl.installing ? (N(), O("button", {
                    key: 0,
                    class: "button button-secondary",
                    type: "button",
                    onClick: f[8] || (f[8] = (oe) => I(m.value, "cancel")),
                    disabled: l.value !== null
                  }, "取消准备", 8, h3)) : (gl = m.value.resource_status) != null && gl.ready ? re("", !0) : (N(), O("button", {
                    key: 1,
                    class: "button button-primary",
                    type: "button",
                    onClick: f[9] || (f[9] = (oe) => I(m.value, "install")),
                    disabled: l.value !== null
                  }, [
                    Q(B(Kn), { size: 15 }),
                    f[54] || (f[54] = he("准备运行时与基础模型"))
                  ], 8, v3)),
                  (ml = m.value.resource_status) != null && ml.ready ? (N(), O("button", {
                    key: 2,
                    class: "button button-secondary",
                    type: "button",
                    onClick: f[10] || (f[10] = (oe) => I(m.value, "remove")),
                    disabled: l.value !== null
                  }, [
                    Q(B(en), { size: 15 }),
                    f[55] || (f[55] = he("移除 YUMENO 运行时"))
                  ], 8, g3)) : re("", !0),
                  u("button", {
                    class: "button button-secondary",
                    type: "button",
                    onClick: f[11] || (f[11] = (oe) => I(m.value, "directory")),
                    disabled: l.value !== null
                  }, [
                    Q(B(Do), { size: 15 }),
                    f[56] || (f[56] = he("查看资源目录"))
                  ], 8, m3)
                ])
              ]),
              (yl = m.value.resource_status) != null && yl.error ? (N(), O("p", y3, L(m.value.resource_status.error), 1)) : re("", !0),
              s.value ? (N(), O("p", b3, L(s.value), 1)) : re("", !0),
              f[57] || (f[57] = u("div", { class: "rvc-workspace-note" }, [
                u("strong", null, "下一步"),
                u("span", null, "将自己的 .pth 音色模型放入受管的 weights 目录；.index 文件不是必需项。完成后到独立的“RVC”页面上传音频并生成文件。")
              ], -1))
            ])
          ])
        ])) : re("", !0),
        i.value ? (N(), O("div", {
          key: 5,
          class: "drawer-overlay",
          onClick: gt(_e, ["self"])
        }, [
          u("aside", {
            class: "config-drawer",
            role: "dialog",
            "aria-modal": "true",
            "aria-label": `配置 ${((bl = U.value) == null ? void 0 : bl.name) || "供应商"}`
          }, [
            u("div", w3, [
              u("div", null, [
                f[58] || (f[58] = u("p", { class: "eyebrow" }, "CONFIGURE", -1)),
                u("h3", null, L((_l = U.value) == null ? void 0 : _l.name), 1),
                u("p", null, L((wl = U.value) == null ? void 0 : wl.description), 1)
              ]),
              u("button", {
                class: "modal-close",
                type: "button",
                onClick: _e,
                "aria-label": "关闭配置"
              }, [
                Q(B(Kt), { size: 18 })
              ])
            ]),
            u("div", k3, [
              u("div", E3, [
                u("span", {
                  class: ve(["status-chip", { on: (kl = U.value) == null ? void 0 : kl.is_active }])
                }, L((El = U.value) != null && El.is_active ? "当前启用" : (xl = U.value) != null && xl.runtime_supported ? "可用" : "仅保存配置"), 3),
                u("span", null, L(((Sl = U.value) == null ? void 0 : Sl.mode) === "local" ? "本地资源" : "API 接口"), 1)
              ]),
              u("form", {
                onSubmit: gt(ke, ["prevent"]),
                class: "config-form"
              }, [
                ((Cl = U.value) == null ? void 0 : Cl.mode) === "api" ? (N(), O(me, { key: 0 }, [
                  U.value.requires_api_key ? (N(), O("label", x3, [
                    f[59] || (f[59] = u("span", null, [
                      he("API Key "),
                      u("span", { class: "required" }, "*")
                    ], -1)),
                    $e(u("input", {
                      type: "text",
                      "onUpdate:modelValue": f[12] || (f[12] = (oe) => S.value.api_key = oe),
                      placeholder: "输入 API Key",
                      required: "",
                      autocomplete: "off"
                    }, null, 512), [
                      [Ve, S.value.api_key]
                    ])
                  ])) : re("", !0),
                  u("label", S3, [
                    f[60] || (f[60] = u("span", null, "Base URL", -1)),
                    $e(u("input", {
                      type: "text",
                      "onUpdate:modelValue": f[13] || (f[13] = (oe) => S.value.base_url = oe),
                      placeholder: U.value.default_base_url
                    }, null, 8, C3), [
                      [Ve, S.value.base_url]
                    ])
                  ]),
                  u("label", $3, [
                    f[61] || (f[61] = u("span", null, "模型名称", -1)),
                    $e(u("input", {
                      type: "text",
                      "onUpdate:modelValue": f[14] || (f[14] = (oe) => S.value.model = oe),
                      placeholder: U.value.default_model
                    }, null, 8, N3), [
                      [Ve, S.value.model]
                    ])
                  ])
                ], 64)) : (N(), O(me, { key: 1 }, [
                  u("div", I3, [
                    f[62] || (f[62] = u("span", { class: "meta-label" }, "资源配置", -1)),
                    G() ? (N(), O("p", M3, L(G()), 1)) : re("", !0)
                  ]),
                  Z.value === "embedding" || Z.value === "reranker" ? (N(), O(me, { key: 0 }, [
                    u("label", O3, [
                      u("span", null, L(Z.value === "embedding" ? "向量模型 ID" : "精排模型 ID"), 1),
                      $e(u("input", {
                        type: "text",
                        "onUpdate:modelValue": f[15] || (f[15] = (oe) => S.value.model = oe),
                        placeholder: ($l = U.value) == null ? void 0 : $l.default_model
                      }, null, 8, T3), [
                        [Ve, S.value.model]
                      ])
                    ]),
                    u("div", P3, [
                      u("label", D3, [
                        f[64] || (f[64] = u("span", null, "模型来源", -1)),
                        $e(u("select", {
                          "onUpdate:modelValue": f[16] || (f[16] = (oe) => S.value.source = oe)
                        }, f[63] || (f[63] = [
                          u("option", { value: "modelscope" }, "ModelScope", -1),
                          u("option", { value: "huggingface" }, "Hugging Face", -1)
                        ]), 512), [
                          [Qt, S.value.source]
                        ])
                      ]),
                      u("label", R3, [
                        f[66] || (f[66] = u("span", null, "运行设备", -1)),
                        $e(u("select", {
                          "onUpdate:modelValue": f[17] || (f[17] = (oe) => S.value.device = oe)
                        }, f[65] || (f[65] = [
                          u("option", { value: "auto" }, "自动（GPU 优先）", -1),
                          u("option", { value: "cuda" }, "CUDA", -1),
                          u("option", { value: "cpu" }, "CPU", -1)
                        ]), 512), [
                          [Qt, S.value.device]
                        ])
                      ])
                    ])
                  ], 64)) : Z.value === "gpt_sovits" ? (N(), O("div", A3, [
                    u("label", L3, [
                      f[67] || (f[67] = u("span", null, "整合包下载地址", -1)),
                      $e(u("input", {
                        type: "url",
                        "onUpdate:modelValue": f[18] || (f[18] = (oe) => d.value = oe),
                        placeholder: "https://…/gpt-sovits.zip"
                      }, null, 512), [
                        [Ve, d.value]
                      ])
                    ])
                  ])) : Z.value === "stt" ? (N(), O("div", V3, f[68] || (f[68] = [
                    u("span", null, "固定资源清单", -1),
                    u("strong", null, "Qwen3-ASR-0.6B + FFmpeg", -1)
                  ]))) : Z.value === "separator" ? (N(), O("div", z3, f[69] || (f[69] = [
                    u("span", null, "固定资源", -1),
                    u("strong", null, "HT-Demucs 人声分离模型 · 约 165 MB", -1)
                  ]))) : re("", !0),
                  u("div", B3, [
                    u("div", null, [
                      f[70] || (f[70] = u("span", { class: "meta-label" }, "资源状态", -1)),
                      u("strong", null, L(U.value ? F(U.value) : "未知"), 1)
                    ]),
                    u("div", F3, [
                      E(U.value) ? (N(), O("button", {
                        key: 0,
                        type: "button",
                        class: "button button-secondary",
                        onClick: f[19] || (f[19] = (oe) => I(U.value, "cancel")),
                        disabled: l.value !== null
                      }, "取消安装", 8, U3)) : w(U.value) ? re("", !0) : (N(), O("button", {
                        key: 1,
                        type: "button",
                        class: "button button-primary",
                        onClick: f[20] || (f[20] = (oe) => I(U.value, "install")),
                        disabled: l.value !== null || ((Nl = U.value) == null ? void 0 : Nl.id) === "gsv_tts_local" && !d.value
                      }, [
                        Q(B(Kn), { size: 15 }),
                        f[71] || (f[71] = he(" 安装资源"))
                      ], 8, H3)),
                      w(U.value) ? (N(), O("button", {
                        key: 2,
                        type: "button",
                        class: "button button-secondary",
                        onClick: f[21] || (f[21] = (oe) => I(U.value, "remove")),
                        disabled: l.value !== null
                      }, [
                        Q(B(en), { size: 15 }),
                        f[72] || (f[72] = he(" 删除"))
                      ], 8, j3)) : re("", !0),
                      u("button", {
                        type: "button",
                        class: "button button-secondary",
                        onClick: f[22] || (f[22] = (oe) => I(U.value, "directory")),
                        disabled: l.value !== null
                      }, [
                        Q(B(Do), { size: 15 }),
                        f[73] || (f[73] = he(" 打开目录"))
                      ], 8, G3),
                      ((Il = U.value) == null ? void 0 : Il.id) === "gsv_tts_local" && ((Ml = U.value.resource_status) != null && Ml.service_running) ? (N(), O("button", {
                        key: 3,
                        type: "button",
                        class: "button button-secondary",
                        onClick: f[23] || (f[23] = (oe) => I(U.value, "stop")),
                        disabled: l.value !== null
                      }, "停止服务", 8, Y3)) : ((Ol = U.value) == null ? void 0 : Ol.id) === "gsv_tts_local" && w(U.value) ? (N(), O("button", {
                        key: 4,
                        type: "button",
                        class: "button button-primary",
                        onClick: f[24] || (f[24] = (oe) => I(U.value, "start")),
                        disabled: l.value !== null
                      }, [
                        Q(B(lr), { size: 15 }),
                        f[74] || (f[74] = he(" 启动服务"))
                      ], 8, q3)) : re("", !0)
                    ])
                  ])
                ], 64)),
                u("label", X3, [
                  $e(u("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": f[25] || (f[25] = (oe) => S.value.enabled = oe),
                    disabled: !((Tl = U.value) != null && Tl.runtime_supported)
                  }, null, 8, K3), [
                    [Xr, S.value.enabled]
                  ]),
                  f[75] || (f[75] = u("span", null, "设为当前激活供应商", -1))
                ]),
                U.value && !U.value.runtime_supported ? (N(), O("p", W3, "当前运行时还没有这个 Provider 的适配器，因此这里只保存配置，不会自动调用。")) : re("", !0),
                u("div", Z3, [
                  u("button", {
                    type: "button",
                    class: "button button-secondary",
                    onClick: _e
                  }, "取消"),
                  u("button", {
                    type: "submit",
                    class: "button button-primary",
                    disabled: o.value
                  }, L(o.value ? "保存中..." : "保存并应用"), 9, J3)
                ]),
                a.value ? (N(), O("p", Q3, [
                  Q(B(ao), { size: 16 }),
                  he(" " + L(a.value), 1)
                ])) : re("", !0),
                c.value ? (N(), O("p", {
                  key: 4,
                  class: ve(["config-message", c.value.startsWith("连接成功") ? "success" : "error"])
                }, L(c.value), 3)) : re("", !0),
                s.value ? (N(), O("p", eM, L(s.value), 1)) : re("", !0)
              ], 32)
            ])
          ], 8, _3)
        ])) : re("", !0)
      ]);
    };
  }
}), nM = /* @__PURE__ */ fl(tM, [["__scopeId", "data-v-a560be80"]]);
let mn = null, yn = null;
function yM(e = "#reranker-settings-root") {
  if (mn) return mn;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("Reranker 设置挂载点不存在");
  return mn = es(qN), mn.mount(t), mn;
}
function bM() {
  mn && (mn.unmount(), mn = null);
}
function _M(e = "#providers-root") {
  if (yn) return yn;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("提供商配置挂载点不存在");
  return yn = es(nM), yn.mount(t), yn;
}
function wM() {
  yn && (yn.unmount(), yn = null);
}
export {
  mM as destroyEvaluationApp,
  pM as destroyExtensionsApp,
  uM as destroyManageApp,
  wM as destroyProvidersApp,
  bM as destroyRerankerSettingsApp,
  gM as hideEvaluationApp,
  fM as hideExtensionsApp,
  hM as mountEvaluationApp,
  cM as mountExtensionsApp,
  lM as mountManageApp,
  _M as mountProvidersApp,
  yM as mountRerankerSettingsApp,
  vM as showEvaluationApp,
  dM as showExtensionsApp,
  aM as showManageApp
};

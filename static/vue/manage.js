var Cf = Object.defineProperty;
var $f = (e, t, n) => t in e ? Cf(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Ye = (e, t, n) => $f(e, typeof t != "symbol" ? t + "" : t, n);
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
const ze = {}, Wn = [], Vt = () => {
}, Nf = () => !1, Xs = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Or = (e) => e.startsWith("onUpdate:"), ct = Object.assign, Tr = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, If = Object.prototype.hasOwnProperty, Ve = (e, t) => If.call(e, t), Ee = Array.isArray, Zn = (e) => Wo(e) === "[object Map]", po = (e) => Wo(e) === "[object Set]", Tl = (e) => Wo(e) === "[object Date]", Se = (e) => typeof e == "function", Ge = (e) => typeof e == "string", Mt = (e) => typeof e == "symbol", Be = (e) => e !== null && typeof e == "object", Su = (e) => (Be(e) || Se(e)) && Se(e.then) && Se(e.catch), Cu = Object.prototype.toString, Wo = (e) => Cu.call(e), Mf = (e) => Wo(e).slice(8, -1), $u = (e) => Wo(e) === "[object Object]", Pr = (e) => Ge(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Io = /* @__PURE__ */ Mr(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Ks = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, Of = /-(\w)/g, xt = Ks(
  (e) => e.replace(Of, (t, n) => n ? n.toUpperCase() : "")
), Tf = /\B([A-Z])/g, xn = Ks(
  (e) => e.replace(Tf, "-$1").toLowerCase()
), Ws = Ks((e) => e.charAt(0).toUpperCase() + e.slice(1)), _i = Ks(
  (e) => e ? `on${Ws(e)}` : ""
), Zt = (e, t) => !Object.is(e, t), bs = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, Nu = (e, t, n, o = !1) => {
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
let Pl;
const Zs = () => Pl || (Pl = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function it(e) {
  if (Ee(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const o = e[n], s = Ge(o) ? Af(o) : it(o);
      if (s)
        for (const i in s)
          t[i] = s[i];
    }
    return t;
  } else if (Ge(e) || Be(e))
    return e;
}
const Pf = /;(?![^(]*\))/g, Df = /:([^]+)/, Rf = /\/\*[^]*?\*\//g;
function Af(e) {
  const t = {};
  return e.replace(Rf, "").split(Pf).forEach((n) => {
    if (n) {
      const o = n.split(Df);
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
const Vf = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Lf = /* @__PURE__ */ Mr(Vf);
function Iu(e) {
  return !!e || e === "";
}
function zf(e, t) {
  if (e.length !== t.length) return !1;
  let n = !0;
  for (let o = 0; n && o < e.length; o++)
    n = Zo(e[o], t[o]);
  return n;
}
function Zo(e, t) {
  if (e === t) return !0;
  let n = Tl(e), o = Tl(t);
  if (n || o)
    return n && o ? e.getTime() === t.getTime() : !1;
  if (n = Mt(e), o = Mt(t), n || o)
    return e === t;
  if (n = Ee(e), o = Ee(t), n || o)
    return n && o ? zf(e, t) : !1;
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
const Mu = (e) => !!(e && e.__v_isRef === !0), V = (e) => Ge(e) ? e : e == null ? "" : Ee(e) || Be(e) && (e.toString === Cu || !Se(e.toString)) ? Mu(e) ? V(e.value) : JSON.stringify(e, Ou, 2) : String(e), Ou = (e, t) => Mu(t) ? Ou(e, t.value) : Zn(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [o, s], i) => (n[ki(o, i) + " =>"] = s, n),
    {}
  )
} : po(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => ki(n))
} : Mt(t) ? ki(t) : Be(t) && !Ee(t) && !$u(t) ? String(t) : t, ki = (e, t = "") => {
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
class Tu {
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
function Pu(e) {
  return new Tu(e);
}
function Rr() {
  return ft;
}
function _s(e, t = !1) {
  ft && ft.cleanups.push(e);
}
let Fe;
const Ei = /* @__PURE__ */ new WeakSet();
class Du {
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
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Au(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Dl(this), Vu(this);
    const t = Fe, n = It;
    Fe = this, It = !0;
    try {
      return this.fn();
    } finally {
      Lu(this), Fe = t, It = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Lr(t);
      this.deps = this.depsTail = void 0, Dl(this), this.onStop && this.onStop(), this.flags &= -2;
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
let Ru = 0, Mo, Oo;
function Au(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Oo, Oo = e;
    return;
  }
  e.next = Mo, Mo = e;
}
function Ar() {
  Ru++;
}
function Vr() {
  if (--Ru > 0)
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
function Lu(e) {
  let t, n = e.depsTail, o = n;
  for (; o; ) {
    const s = o.prevDep;
    o.version === -1 ? (o === n && (n = s), Lr(o), Bf(o)) : t = o, o.dep.activeLink = o.prevActiveLink, o.prevActiveLink = void 0, o = s;
  }
  e.deps = t, e.depsTail = n;
}
function Zi(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (zu(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function zu(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Vo))
    return;
  e.globalVersion = Vo;
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
    Fe = n, It = o, Lu(e), e.flags &= -3;
  }
}
function Lr(e, t = !1) {
  const { dep: n, prevSub: o, nextSub: s } = e;
  if (o && (o.nextSub = s, e.prevSub = void 0), s && (s.prevSub = o, e.nextSub = void 0), n.subs === e && (n.subs = o, !o && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      Lr(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function Bf(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let It = !0;
const Bu = [];
function Sn() {
  Bu.push(It), It = !1;
}
function Cn() {
  const e = Bu.pop();
  It = e === void 0 ? !0 : e;
}
function Dl(e) {
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
let Vo = 0;
class Ff {
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
      n = this.activeLink = new Ff(Fe, this), Fe.deps ? (n.prevDep = Fe.depsTail, Fe.depsTail.nextDep = n, Fe.depsTail = n) : Fe.deps = Fe.depsTail = n, Fu(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const o = n.nextDep;
      o.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = o), n.prevDep = Fe.depsTail, n.nextDep = void 0, Fe.depsTail.nextDep = n, Fe.depsTail = n, Fe.deps === n && (Fe.deps = o);
    }
    return n;
  }
  trigger(t) {
    this.version++, Vo++, this.notify(t);
  }
  notify(t) {
    Ar();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      Vr();
    }
  }
}
function Fu(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let o = t.deps; o; o = o.nextDep)
        Fu(o);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const Ms = /* @__PURE__ */ new WeakMap(), Rn = Symbol(
  ""
), Ji = Symbol(
  ""
), Lo = Symbol(
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
    Vo++;
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
      r.forEach((f, g) => {
        (g === "length" || g === Lo || !Mt(g) && g >= d) && l(f);
      });
    } else
      switch ((n !== void 0 || r.has(void 0)) && l(r.get(n)), c && l(r.get(Lo)), t) {
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
  Vr();
}
function Uf(e, t) {
  const n = Ms.get(e);
  return n && n.get(t);
}
function Yn(e) {
  const t = Re(e);
  return t === e ? t : (at(t, "iterate", Lo), Et(e) ? t : t.map(ut));
}
function Qs(e) {
  return at(e = Re(e), "iterate", Lo), e;
}
const Hf = {
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
    return Rl(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Rl(this, "reduceRight", e, t);
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
const jf = Array.prototype;
function Ut(e, t, n, o, s, i) {
  const r = Qs(e), l = r !== e && !Et(e), a = r[t];
  if (a !== jf[t]) {
    const f = a.apply(e, i);
    return l ? ut(f) : f;
  }
  let c = n;
  r !== e && (l ? c = function(f, g) {
    return n.call(this, ut(f), g, e);
  } : n.length > 2 && (c = function(f, g) {
    return n.call(this, f, g, e);
  }));
  const d = a.call(r, c, o);
  return l && s ? s(d) : d;
}
function Rl(e, t, n, o) {
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
  at(o, "iterate", Lo);
  const s = o[t](...n);
  return (s === -1 || s === !1) && Ur(n[0]) ? (n[0] = Re(n[0]), o[t](...n)) : s;
}
function bo(e, t, n = []) {
  Sn(), Ar();
  const o = Re(e)[t].apply(e, n);
  return Vr(), Cn(), o;
}
const Gf = /* @__PURE__ */ Mr("__proto__,__v_isRef,__isVue"), Uu = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(Mt)
);
function Yf(e) {
  Mt(e) || (e = String(e));
  const t = Re(this);
  return at(t, "has", e), t.hasOwnProperty(e);
}
class Hu {
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
      return o === (s ? i ? np : qu : i ? Yu : Gu).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(o) ? t : void 0;
    const r = Ee(t);
    if (!s) {
      let a;
      if (r && (a = Hf[n]))
        return a;
      if (n === "hasOwnProperty")
        return Yf;
    }
    const l = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      Xe(t) ? t : o
    );
    return (Mt(n) ? Uu.has(n) : Gf(n)) || (s || at(t, "get", n), i) ? l : Xe(l) ? r && Pr(n) ? l : l.value : Be(l) ? s ? Br(l) : wn(l) : l;
  }
}
class ju extends Hu {
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
    const r = Ee(t) && Pr(n) ? Number(n) < t.length : Ve(t, n), l = Reflect.set(
      t,
      n,
      o,
      Xe(t) ? t : s
    );
    return t === Re(s) && (r ? Zt(o, i) && Gt(t, "set", n, o) : Gt(t, "add", n, o)), l;
  }
  deleteProperty(t, n) {
    const o = Ve(t, n);
    t[n];
    const s = Reflect.deleteProperty(t, n);
    return s && o && Gt(t, "delete", n, void 0), s;
  }
  has(t, n) {
    const o = Reflect.has(t, n);
    return (!Mt(n) || !Uu.has(n)) && at(t, "has", n), o;
  }
  ownKeys(t) {
    return at(
      t,
      "iterate",
      Ee(t) ? "length" : Rn
    ), Reflect.ownKeys(t);
  }
}
class qf extends Hu {
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
const Xf = /* @__PURE__ */ new ju(), Kf = /* @__PURE__ */ new qf(), Wf = /* @__PURE__ */ new ju(!0);
const Qi = (e) => e, is = (e) => Reflect.getPrototypeOf(e);
function Zf(e, t, n) {
  return function(...o) {
    const s = this.__v_raw, i = Re(s), r = Zn(i), l = e === "entries" || e === Symbol.iterator && r, a = e === "keys" && r, c = s[e](...o), d = n ? Qi : t ? er : ut;
    return !t && at(
      i,
      "iterate",
      a ? Ji : Rn
    ), {
      // iterator protocol
      next() {
        const { value: f, done: g } = c.next();
        return g ? { value: f, done: g } : {
          value: l ? [d(f[0]), d(f[1])] : d(f),
          done: g
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
function Jf(e, t) {
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
      return !e && at(a, "iterate", Rn), l.forEach((d, f) => s.call(i, c(d), c(f), r));
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
    n[s] = Zf(s, e, t);
  }), n;
}
function zr(e, t) {
  const n = Jf(e, t);
  return (o, s, i) => s === "__v_isReactive" ? !e : s === "__v_isReadonly" ? e : s === "__v_raw" ? o : Reflect.get(
    Ve(n, s) && s in o ? n : o,
    s,
    i
  );
}
const Qf = {
  get: /* @__PURE__ */ zr(!1, !1)
}, ep = {
  get: /* @__PURE__ */ zr(!1, !0)
}, tp = {
  get: /* @__PURE__ */ zr(!0, !1)
};
const Gu = /* @__PURE__ */ new WeakMap(), Yu = /* @__PURE__ */ new WeakMap(), qu = /* @__PURE__ */ new WeakMap(), np = /* @__PURE__ */ new WeakMap();
function op(e) {
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
function sp(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : op(Mf(e));
}
function wn(e) {
  return zn(e) ? e : Fr(
    e,
    !1,
    Xf,
    Qf,
    Gu
  );
}
function ip(e) {
  return Fr(
    e,
    !1,
    Wf,
    ep,
    Yu
  );
}
function Br(e) {
  return Fr(
    e,
    !0,
    Kf,
    tp,
    qu
  );
}
function Fr(e, t, n, o, s) {
  if (!Be(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = s.get(e);
  if (i)
    return i;
  const r = sp(e);
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
  return !Ve(e, "__v_skip") && Object.isExtensible(e) && Nu(e, "__v_skip", !0), e;
}
const ut = (e) => Be(e) ? wn(e) : e, er = (e) => Be(e) ? Br(e) : e;
function Xe(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function Q(e) {
  return rp(e, !1);
}
function rp(e, t) {
  return Xe(e) ? e : new lp(e, t);
}
class lp {
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
function F(e) {
  return Xe(e) ? e.value : e;
}
function Pe(e) {
  return Se(e) ? e() : F(e);
}
const ap = {
  get: (e, t, n) => t === "__v_raw" ? e : F(Reflect.get(e, t, n)),
  set: (e, t, n, o) => {
    const s = e[t];
    return Xe(s) && !Xe(n) ? (s.value = n, !0) : Reflect.set(e, t, n, o);
  }
};
function Xu(e) {
  return Jn(e) ? e : new Proxy(e, ap);
}
class up {
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
function cp(e) {
  return new up(e);
}
function dp(e) {
  const t = Ee(e) ? new Array(e.length) : {};
  for (const n in e)
    t[n] = Ku(e, n);
  return t;
}
class fp {
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
    return Uf(Re(this._object), this._key);
  }
}
class pp {
  constructor(t) {
    this._getter = t, this.__v_isRef = !0, this.__v_isReadonly = !0, this._value = void 0;
  }
  get value() {
    return this._value = this._getter();
  }
}
function Ue(e, t, n) {
  return Xe(e) ? e : Se(e) ? new pp(e) : Be(e) && arguments.length > 1 ? Ku(e, t, n) : Q(e);
}
function Ku(e, t, n) {
  const o = e[t];
  return Xe(o) ? o : new fp(e, t, n);
}
class hp {
  constructor(t, n, o) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Js(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Vo - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = o;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    Fe !== this)
      return Au(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return zu(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function vp(e, t, n = !1) {
  let o, s;
  return Se(e) ? o = e : (o = e.get, s = e.set), new hp(o, s, n);
}
const ls = {}, Os = /* @__PURE__ */ new WeakMap();
let Mn;
function gp(e, t = !1, n = Mn) {
  if (n) {
    let o = Os.get(n);
    o || Os.set(n, o = []), o.push(e);
  }
}
function mp(e, t, n = ze) {
  const { immediate: o, deep: s, once: i, scheduler: r, augmentJob: l, call: a } = n, c = (w) => s ? w : Et(w) || s === !1 || s === 0 ? Yt(w, 1) : Yt(w);
  let d, f, g, m, E = !1, C = !1;
  if (Xe(e) ? (f = () => e.value, E = Et(e)) : Jn(e) ? (f = () => c(e), E = !0) : Ee(e) ? (C = !0, E = e.some((w) => Jn(w) || Et(w)), f = () => e.map((w) => {
    if (Xe(w))
      return w.value;
    if (Jn(w))
      return c(w);
    if (Se(w))
      return a ? a(w, 2) : w();
  })) : Se(e) ? t ? f = a ? () => a(e, 2) : e : f = () => {
    if (g) {
      Sn();
      try {
        g();
      } finally {
        Cn();
      }
    }
    const w = Mn;
    Mn = d;
    try {
      return a ? a(e, 3, [m]) : e(m);
    } finally {
      Mn = w;
    }
  } : f = Vt, t && s) {
    const w = f, z = s === !0 ? 1 / 0 : s;
    f = () => Yt(w(), z);
  }
  const x = Rr(), O = () => {
    d.stop(), x && x.active && Tr(x.effects, d);
  };
  if (i && t) {
    const w = t;
    t = (...z) => {
      w(...z), O();
    };
  }
  let D = C ? new Array(e.length).fill(ls) : ls;
  const y = (w) => {
    if (!(!(d.flags & 1) || !d.dirty && !w))
      if (t) {
        const z = d.run();
        if (s || E || (C ? z.some((U, W) => Zt(U, D[W])) : Zt(z, D))) {
          g && g();
          const U = Mn;
          Mn = d;
          try {
            const W = [
              z,
              // pass undefined as the old value when it's changed for the first time
              D === ls ? void 0 : C && D[0] === ls ? [] : D,
              m
            ];
            a ? a(t, 3, W) : (
              // @ts-expect-error
              t(...W)
            ), D = z;
          } finally {
            Mn = U;
          }
        }
      } else
        d.run();
  };
  return l && l(y), d = new Du(f), d.scheduler = r ? () => r(y, !1) : y, m = (w) => gp(w, !1, d), g = d.onStop = () => {
    const w = Os.get(d);
    if (w) {
      if (a)
        a(w, 4);
      else
        for (const z of w) z();
      Os.delete(d);
    }
  }, t ? o ? y(!0) : D = d.run() : r ? r(y.bind(null, !0), !0) : d.run(), O.pause = d.pause.bind(d), O.resume = d.resume.bind(d), O.stop = O, O;
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
  else if ($u(e)) {
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
    return s && Su(s) && s.catch((i) => {
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
        for (let f = 0; f < d.length; f++)
          if (d[f](e, a, c) === !1)
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
  yp(e, n, s, o, r);
}
function yp(e, t, n, o = !0, s = !1) {
  if (s)
    throw e;
  console.error(e);
}
const pt = [];
let Dt = -1;
const Qn = [];
let un = null, Xn = 0;
const Wu = /* @__PURE__ */ Promise.resolve();
let Ts = null;
function nt(e) {
  const t = Ts || Wu;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function bp(e) {
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
    !(e.flags & 2) && t >= zo(n) ? pt.push(e) : pt.splice(bp(t), 0, e), e.flags |= 1, Zu();
  }
}
function Zu() {
  Ts || (Ts = Wu.then(Qu));
}
function _p(e) {
  Ee(e) ? Qn.push(...e) : un && e.id === -1 ? un.splice(Xn + 1, 0, e) : e.flags & 1 || (Qn.push(e), e.flags |= 1), Zu();
}
function Al(e, t, n = Dt + 1) {
  for (; n < pt.length; n++) {
    const o = pt[n];
    if (o && o.flags & 2) {
      if (e && o.id !== e.uid)
        continue;
      pt.splice(n, 1), n--, o.flags & 4 && (o.flags &= -2), o(), o.flags & 4 || (o.flags &= -2);
    }
  }
}
function Ju(e) {
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
function Qu(e) {
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
    Dt = -1, pt.length = 0, Ju(), Ts = null, (pt.length || Qn.length) && Qu();
  }
}
let tt = null, ec = null;
function Ps(e) {
  const t = tt;
  return tt = e, ec = e && e.type.__scopeId || null, t;
}
function bn(e, t = tt, n) {
  if (!t || e._n)
    return e;
  const o = (...s) => {
    o._d && Yl(-1);
    const i = Ps(t);
    let r;
    try {
      r = e(...s);
    } finally {
      Ps(i), o._d && Yl(1);
    }
    return r;
  };
  return o._n = !0, o._c = !0, o._d = !0, o;
}
function Ce(e, t) {
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
const wp = Symbol("_vte"), kp = (e) => e.__isTeleport;
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
function tc(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Ds(e, t, n, o, s = !1) {
  if (Ee(e)) {
    e.forEach(
      (E, C) => Ds(
        E,
        t && (Ee(t) ? t[C] : t),
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
  const i = o.shapeFlag & 4 ? ii(o.component) : o.el, r = s ? null : i, { i: l, r: a } = e, c = t && t.r, d = l.refs === ze ? l.refs = {} : l.refs, f = l.setupState, g = Re(f), m = f === ze ? () => !1 : (E) => Ve(g, E);
  if (c != null && c !== a && (Ge(c) ? (d[c] = null, m(c) && (f[c] = null)) : Xe(c) && (c.value = null)), Se(a))
    Jo(a, l, 12, [r, d]);
  else {
    const E = Ge(a), C = Xe(a);
    if (E || C) {
      const x = () => {
        if (e.f) {
          const O = E ? m(a) ? f[a] : d[a] : a.value;
          s ? Ee(O) && Tr(O, i) : Ee(O) ? O.includes(i) || O.push(i) : E ? (d[a] = [i], m(a) && (f[a] = d[a])) : (a.value = [i], e.k && (d[e.k] = a.value));
        } else E ? (d[a] = r, m(a) && (f[a] = r)) : C && (a.value = r, e.k && (d[e.k] = r));
      };
      r ? (x.id = -1, wt(x, n)) : x();
    }
  }
}
Zs().requestIdleCallback;
Zs().cancelIdleCallback;
const eo = (e) => !!e.type.__asyncLoader, nc = (e) => e.type.__isKeepAlive;
function Ep(e, t) {
  oc(e, "a", t);
}
function xp(e, t) {
  oc(e, "da", t);
}
function oc(e, t, n = st) {
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
      nc(s.parent.vnode) && Sp(o, t, n, s), s = s.parent;
  }
}
function Sp(e, t, n, o) {
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
}, sc = on("bm"), rt = on("m"), Cp = on(
  "bu"
), $p = on("u"), sn = on(
  "bum"
), ni = on("um"), Np = on(
  "sp"
), Ip = on("rtg"), Mp = on("rtc");
function Op(e, t = st) {
  ti("ec", e, t);
}
const ic = "components";
function rc(e, t) {
  return uc(ic, e, !0, t) || e;
}
const lc = Symbol.for("v-ndc");
function ac(e) {
  return Ge(e) ? uc(ic, e, !1) || e : e || lc;
}
function uc(e, t, n = !0, o = !1) {
  const s = tt || st;
  if (s) {
    const i = s.type;
    {
      const l = mh(
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
    return t !== "default" && (n.name = t), $(), vt(
      be,
      null,
      [J("slot", n, o && o())],
      64
    );
  let i = e[t];
  i && i._c && (i._d = !1), $();
  const r = i && cc(i(n)), l = n.key || // slot content array of a dynamic conditional slot may have a branch
  // key attached in the `createSlots` helper, respect that
  r && r.key, a = vt(
    be,
    {
      key: (l && !Mt(l) ? l : `_${t}`) + // #7256 force differentiate fallback content from actual content
      (!r && o ? "_fb" : "")
    },
    r || (o ? o() : []),
    r && e._ === 1 ? 64 : -2
  );
  return a.scopeId && (a.slotScopeIds = [a.scopeId + "-s"]), i && i._c && (i._d = !0), a;
}
function cc(e) {
  return e.some((t) => Bo(t) ? !(t.type === kn || t.type === be && !cc(t.children)) : !0) ? e : null;
}
const tr = (e) => e ? Pc(e) ? ii(e) : tr(e.parent) : null, To = (
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
    $options: (e) => hc(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Hr(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = nt.bind(e.proxy)),
    $watch: (e) => eh.bind(e)
  })
), Ci = (e, t) => e !== ze && !e.__isScriptSetup && Ve(e, t), Tp = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: o, data: s, props: i, accessCache: r, type: l, appContext: a } = e;
    let c;
    if (t[0] !== "$") {
      const m = r[t];
      if (m !== void 0)
        switch (m) {
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
        if (s !== ze && Ve(s, t))
          return r[t] = 2, s[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (c = e.propsOptions[0]) && Ve(c, t)
        )
          return r[t] = 3, i[t];
        if (n !== ze && Ve(n, t))
          return r[t] = 4, n[t];
        nr && (r[t] = 0);
      }
    }
    const d = To[t];
    let f, g;
    if (d)
      return t === "$attrs" && at(e.attrs, "get", ""), d(e);
    if (
      // css module (injected by vue-loader)
      (f = l.__cssModules) && (f = f[t])
    )
      return f;
    if (n !== ze && Ve(n, t))
      return r[t] = 4, n[t];
    if (
      // global properties
      g = a.config.globalProperties, Ve(g, t)
    )
      return g[t];
  },
  set({ _: e }, t, n) {
    const { data: o, setupState: s, ctx: i } = e;
    return Ci(s, t) ? (s[t] = n, !0) : o !== ze && Ve(o, t) ? (o[t] = n, !0) : Ve(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: o, appContext: s, propsOptions: i }
  }, r) {
    let l;
    return !!n[r] || e !== ze && Ve(e, r) || Ci(t, r) || (l = i[0]) && Ve(l, r) || Ve(o, r) || Ve(To, r) || Ve(s.config.globalProperties, r);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : Ve(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Pp() {
  return dc().slots;
}
function Dp() {
  return dc().attrs;
}
function dc() {
  const e = ho();
  return e.setupContext || (e.setupContext = Rc(e));
}
function Ll(e) {
  return Ee(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
function fc(e, t) {
  const n = {};
  for (const o in e)
    t.includes(o) || Object.defineProperty(n, o, {
      enumerable: !0,
      get: () => e[o]
    });
  return n;
}
let nr = !0;
function Rp(e) {
  const t = hc(e), n = e.proxy, o = e.ctx;
  nr = !1, t.beforeCreate && zl(t.beforeCreate, e, "bc");
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
    beforeMount: f,
    mounted: g,
    beforeUpdate: m,
    updated: E,
    activated: C,
    deactivated: x,
    beforeDestroy: O,
    beforeUnmount: D,
    destroyed: y,
    unmounted: w,
    render: z,
    renderTracked: U,
    renderTriggered: W,
    errorCaptured: G,
    serverPrefetch: P,
    // public API
    expose: L,
    inheritAttrs: q,
    // assets
    components: H,
    directives: K,
    filters: S
  } = t;
  if (c && Ap(c, o, null), r)
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
      const j = i[R], ne = Se(j) ? j.bind(n, n) : Se(j.get) ? j.get.bind(n, n) : Vt, re = !Se(j) && Se(j.set) ? j.set.bind(n) : Vt, ue = ae({
        get: ne,
        set: re
      });
      Object.defineProperty(o, R, {
        enumerable: !0,
        configurable: !0,
        get: () => ue.value,
        set: (se) => ue.value = se
      });
    }
  if (l)
    for (const R in l)
      pc(l[R], o, n, R);
  if (a) {
    const R = Se(a) ? a.call(n) : a;
    Reflect.ownKeys(R).forEach((j) => {
      Fn(j, R[j]);
    });
  }
  d && zl(d, e, "c");
  function M(R, j) {
    Ee(j) ? j.forEach((ne) => R(ne.bind(n))) : j && R(j.bind(n));
  }
  if (M(sc, f), M(rt, g), M(Cp, m), M($p, E), M(Ep, C), M(xp, x), M(Op, G), M(Mp, U), M(Ip, W), M(sn, D), M(ni, w), M(Np, P), Ee(L))
    if (L.length) {
      const R = e.exposed || (e.exposed = {});
      L.forEach((j) => {
        Object.defineProperty(R, j, {
          get: () => n[j],
          set: (ne) => n[j] = ne
        });
      });
    } else e.exposed || (e.exposed = {});
  z && e.render === Vt && (e.render = z), q != null && (e.inheritAttrs = q), H && (e.components = H), K && (e.directives = K), P && tc(e);
}
function Ap(e, t, n = Vt) {
  Ee(e) && (e = or(e));
  for (const o in e) {
    const s = e[o];
    let i;
    Be(s) ? "default" in s ? i = Lt(
      s.from || o,
      s.default,
      !0
    ) : i = Lt(s.from || o) : i = Lt(s), Xe(i) ? Object.defineProperty(t, o, {
      enumerable: !0,
      configurable: !0,
      get: () => i.value,
      set: (r) => i.value = r
    }) : t[o] = i;
  }
}
function zl(e, t, n) {
  Bt(
    Ee(e) ? e.map((o) => o.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function pc(e, t, n, o) {
  let s = o.includes(".") ? Nc(n, o) : () => n[o];
  if (Ge(e)) {
    const i = t[e];
    Se(i) && Ne(s, i);
  } else if (Se(e))
    Ne(s, e.bind(n));
  else if (Be(e))
    if (Ee(e))
      e.forEach((i) => pc(i, t, n, o));
    else {
      const i = Se(e.handler) ? e.handler.bind(n) : t[e.handler];
      Se(i) && Ne(s, i, e);
    }
}
function hc(e) {
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
  data: Bl,
  props: Fl,
  emits: Fl,
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
  watch: zp,
  // provide / inject
  provide: Bl,
  inject: Lp
};
function Bl(e, t) {
  return t ? e ? function() {
    return ct(
      Se(e) ? e.call(this, this) : e,
      Se(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Lp(e, t) {
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
function Fl(e, t) {
  return e ? Ee(e) && Ee(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : ct(
    /* @__PURE__ */ Object.create(null),
    Ll(e),
    Ll(t ?? {})
  ) : t;
}
function zp(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = ct(/* @__PURE__ */ Object.create(null), e);
  for (const o in t)
    n[o] = dt(e[o], t[o]);
  return n;
}
function vc() {
  return {
    app: null,
    config: {
      isNativeTag: Nf,
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
let Bp = 0;
function Fp(e, t) {
  return function(o, s = null) {
    Se(o) || (o = ct({}, o)), s != null && !Be(s) && (s = null);
    const i = vc(), r = /* @__PURE__ */ new WeakSet(), l = [];
    let a = !1;
    const c = i.app = {
      _uid: Bp++,
      _component: o,
      _props: s,
      _container: null,
      _context: i,
      _instance: null,
      version: _h,
      get config() {
        return i.config;
      },
      set config(d) {
      },
      use(d, ...f) {
        return r.has(d) || (d && Se(d.install) ? (r.add(d), d.install(c, ...f)) : Se(d) && (r.add(d), d(c, ...f))), c;
      },
      mixin(d) {
        return i.mixins.includes(d) || i.mixins.push(d), c;
      },
      component(d, f) {
        return f ? (i.components[d] = f, c) : i.components[d];
      },
      directive(d, f) {
        return f ? (i.directives[d] = f, c) : i.directives[d];
      },
      mount(d, f, g) {
        if (!a) {
          const m = c._ceVNode || J(o, s);
          return m.appContext = i, g === !0 ? g = "svg" : g === !1 && (g = void 0), e(m, d, g), a = !0, c._container = d, d.__vue_app__ = c, ii(m.component);
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
      provide(d, f) {
        return i.provides[d] = f, c;
      },
      runWithContext(d) {
        const f = to;
        to = c;
        try {
          return d();
        } finally {
          to = f;
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
function Lt(e, t, n = !1) {
  const o = st || tt;
  if (o || to) {
    const s = to ? to._context.provides : o ? o.parent == null ? o.vnode.appContext && o.vnode.appContext.provides : o.parent.provides : void 0;
    if (s && e in s)
      return s[e];
    if (arguments.length > 1)
      return n && Se(t) ? t.call(o && o.proxy) : t;
  }
}
const gc = {}, mc = () => Object.create(gc), yc = (e) => Object.getPrototypeOf(e) === gc;
function Up(e, t, n, o = !1) {
  const s = {}, i = mc();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), bc(e, t, s, i);
  for (const r in e.propsOptions[0])
    r in s || (s[r] = void 0);
  n ? e.props = o ? s : ip(s) : e.type.props ? e.props = s : e.props = i, e.attrs = i;
}
function Hp(e, t, n, o) {
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
      for (let f = 0; f < d.length; f++) {
        let g = d[f];
        if (oi(e.emitsOptions, g))
          continue;
        const m = t[g];
        if (a)
          if (Ve(i, g))
            m !== i[g] && (i[g] = m, c = !0);
          else {
            const E = xt(g);
            s[E] = sr(
              a,
              l,
              E,
              m,
              e,
              !1
            );
          }
        else
          m !== i[g] && (i[g] = m, c = !0);
      }
    }
  } else {
    bc(e, t, s, i) && (c = !0);
    let d;
    for (const f in l)
      (!t || // for camelCase
      !Ve(t, f) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((d = xn(f)) === f || !Ve(t, d))) && (a ? n && // for camelCase
      (n[f] !== void 0 || // for kebab-case
      n[d] !== void 0) && (s[f] = sr(
        a,
        l,
        f,
        void 0,
        e,
        !0
      )) : delete s[f]);
    if (i !== l)
      for (const f in i)
        (!t || !Ve(t, f)) && (delete i[f], c = !0);
  }
  c && Gt(e.attrs, "set", "");
}
function bc(e, t, n, o) {
  const [s, i] = e.propsOptions;
  let r = !1, l;
  if (t)
    for (let a in t) {
      if (Io(a))
        continue;
      const c = t[a];
      let d;
      s && Ve(s, d = xt(a)) ? !i || !i.includes(d) ? n[d] = c : (l || (l = {}))[d] = c : oi(e.emitsOptions, a) || (!(a in o) || c !== o[a]) && (o[a] = c, r = !0);
    }
  if (i) {
    const a = Re(n), c = l || ze;
    for (let d = 0; d < i.length; d++) {
      const f = i[d];
      n[f] = sr(
        s,
        a,
        f,
        c[f],
        e,
        !Ve(c, f)
      );
    }
  }
  return r;
}
function sr(e, t, n, o, s, i) {
  const r = e[n];
  if (r != null) {
    const l = Ve(r, "default");
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
const jp = /* @__PURE__ */ new WeakMap();
function _c(e, t, n = !1) {
  const o = n ? jp : t.propsCache, s = o.get(e);
  if (s)
    return s;
  const i = e.props, r = {}, l = [];
  let a = !1;
  if (!Se(e)) {
    const d = (f) => {
      a = !0;
      const [g, m] = _c(f, t, !0);
      ct(r, g), m && l.push(...m);
    };
    !n && t.mixins.length && t.mixins.forEach(d), e.extends && d(e.extends), e.mixins && e.mixins.forEach(d);
  }
  if (!i && !a)
    return Be(e) && o.set(e, Wn), Wn;
  if (Ee(i))
    for (let d = 0; d < i.length; d++) {
      const f = xt(i[d]);
      Ul(f) && (r[f] = ze);
    }
  else if (i)
    for (const d in i) {
      const f = xt(d);
      if (Ul(f)) {
        const g = i[d], m = r[f] = Ee(g) || Se(g) ? { type: g } : ct({}, g), E = m.type;
        let C = !1, x = !0;
        if (Ee(E))
          for (let O = 0; O < E.length; ++O) {
            const D = E[O], y = Se(D) && D.name;
            if (y === "Boolean") {
              C = !0;
              break;
            } else y === "String" && (x = !1);
          }
        else
          C = Se(E) && E.name === "Boolean";
        m[
          0
          /* shouldCast */
        ] = C, m[
          1
          /* shouldCastTrue */
        ] = x, (C || Ve(m, "default")) && l.push(f);
      }
    }
  const c = [r, l];
  return Be(e) && o.set(e, c), c;
}
function Ul(e) {
  return e[0] !== "$" && !Io(e);
}
const wc = (e) => e[0] === "_" || e === "$stable", Gr = (e) => Ee(e) ? e.map(At) : [At(e)], Gp = (e, t, n) => {
  if (t._n)
    return t;
  const o = bn((...s) => Gr(t(...s)), n);
  return o._c = !1, o;
}, kc = (e, t, n) => {
  const o = e._ctx;
  for (const s in e) {
    if (wc(s)) continue;
    const i = e[s];
    if (Se(i))
      t[s] = Gp(s, i, o);
    else if (i != null) {
      const r = Gr(i);
      t[s] = () => r;
    }
  }
}, Ec = (e, t) => {
  const n = Gr(t);
  e.slots.default = () => n;
}, xc = (e, t, n) => {
  for (const o in t)
    (n || o !== "_") && (e[o] = t[o]);
}, Yp = (e, t, n) => {
  const o = e.slots = mc();
  if (e.vnode.shapeFlag & 32) {
    const s = t._;
    s ? (xc(o, t, n), n && Nu(o, "_", s, !0)) : kc(t, o);
  } else t && Ec(e, t);
}, qp = (e, t, n) => {
  const { vnode: o, slots: s } = e;
  let i = !0, r = ze;
  if (o.shapeFlag & 32) {
    const l = t._;
    l ? n && l === 1 ? i = !1 : xc(s, t, n) : (i = !t.$stable, kc(t, s)), r = t;
  } else t && (Ec(e, t), r = { default: 1 });
  if (i)
    for (const l in s)
      !wc(l) && r[l] == null && delete s[l];
}, wt = lh;
function Xp(e) {
  return Kp(e);
}
function Kp(e, t) {
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
    parentNode: f,
    nextSibling: g,
    setScopeId: m = Vt,
    insertStaticContent: E
  } = e, C = (p, I, b, _ = null, k = null, v = null, h = void 0, B = null, Y = !!I.dynamicChildren) => {
    if (p === I)
      return;
    p && !_o(p, I) && (_ = _e(p), se(p, k, v, !0), p = null), I.patchFlag === -2 && (Y = !1, I.dynamicChildren = null);
    const { type: N, ref: te, shapeFlag: Z } = I;
    switch (N) {
      case si:
        x(p, I, b, _);
        break;
      case kn:
        O(p, I, b, _);
        break;
      case ws:
        p == null && D(I, b, _, h);
        break;
      case be:
        H(
          p,
          I,
          b,
          _,
          k,
          v,
          h,
          B,
          Y
        );
        break;
      default:
        Z & 1 ? z(
          p,
          I,
          b,
          _,
          k,
          v,
          h,
          B,
          Y
        ) : Z & 6 ? K(
          p,
          I,
          b,
          _,
          k,
          v,
          h,
          B,
          Y
        ) : (Z & 64 || Z & 128) && N.process(
          p,
          I,
          b,
          _,
          k,
          v,
          h,
          B,
          Y,
          me
        );
    }
    te != null && k && Ds(te, p && p.ref, v, I || p, !I);
  }, x = (p, I, b, _) => {
    if (p == null)
      o(
        I.el = l(I.children),
        b,
        _
      );
    else {
      const k = I.el = p.el;
      I.children !== p.children && c(k, I.children);
    }
  }, O = (p, I, b, _) => {
    p == null ? o(
      I.el = a(I.children || ""),
      b,
      _
    ) : I.el = p.el;
  }, D = (p, I, b, _) => {
    [p.el, p.anchor] = E(
      p.children,
      I,
      b,
      _,
      p.el,
      p.anchor
    );
  }, y = ({ el: p, anchor: I }, b, _) => {
    let k;
    for (; p && p !== I; )
      k = g(p), o(p, b, _), p = k;
    o(I, b, _);
  }, w = ({ el: p, anchor: I }) => {
    let b;
    for (; p && p !== I; )
      b = g(p), s(p), p = b;
    s(I);
  }, z = (p, I, b, _, k, v, h, B, Y) => {
    I.type === "svg" ? h = "svg" : I.type === "math" && (h = "mathml"), p == null ? U(
      I,
      b,
      _,
      k,
      v,
      h,
      B,
      Y
    ) : P(
      p,
      I,
      k,
      v,
      h,
      B,
      Y
    );
  }, U = (p, I, b, _, k, v, h, B) => {
    let Y, N;
    const { props: te, shapeFlag: Z, transition: ie, dirs: de } = p;
    if (Y = p.el = r(
      p.type,
      v,
      te && te.is,
      te
    ), Z & 8 ? d(Y, p.children) : Z & 16 && G(
      p.children,
      Y,
      null,
      _,
      k,
      $i(p, v),
      h,
      B
    ), de && $n(p, null, _, "created"), W(Y, p, p.scopeId, h, _), te) {
      for (const $e in te)
        $e !== "value" && !Io($e) && i(Y, $e, null, te[$e], v, _);
      "value" in te && i(Y, "value", null, te.value, v), (N = te.onVnodeBeforeMount) && Pt(N, _, p);
    }
    de && $n(p, null, _, "beforeMount");
    const ke = Wp(k, ie);
    ke && ie.beforeEnter(Y), o(Y, I, b), ((N = te && te.onVnodeMounted) || ke || de) && wt(() => {
      N && Pt(N, _, p), ke && ie.enter(Y), de && $n(p, null, _, "mounted");
    }, k);
  }, W = (p, I, b, _, k) => {
    if (b && m(p, b), _)
      for (let v = 0; v < _.length; v++)
        m(p, _[v]);
    if (k) {
      let v = k.subTree;
      if (I === v || Mc(v.type) && (v.ssContent === I || v.ssFallback === I)) {
        const h = k.vnode;
        W(
          p,
          h,
          h.scopeId,
          h.slotScopeIds,
          k.parent
        );
      }
    }
  }, G = (p, I, b, _, k, v, h, B, Y = 0) => {
    for (let N = Y; N < p.length; N++) {
      const te = p[N] = B ? cn(p[N]) : At(p[N]);
      C(
        null,
        te,
        I,
        b,
        _,
        k,
        v,
        h,
        B
      );
    }
  }, P = (p, I, b, _, k, v, h) => {
    const B = I.el = p.el;
    let { patchFlag: Y, dynamicChildren: N, dirs: te } = I;
    Y |= p.patchFlag & 16;
    const Z = p.props || ze, ie = I.props || ze;
    let de;
    if (b && Nn(b, !1), (de = ie.onVnodeBeforeUpdate) && Pt(de, b, I, p), te && $n(I, p, b, "beforeUpdate"), b && Nn(b, !0), (Z.innerHTML && ie.innerHTML == null || Z.textContent && ie.textContent == null) && d(B, ""), N ? L(
      p.dynamicChildren,
      N,
      B,
      b,
      _,
      $i(I, k),
      v
    ) : h || j(
      p,
      I,
      B,
      null,
      b,
      _,
      $i(I, k),
      v,
      !1
    ), Y > 0) {
      if (Y & 16)
        q(B, Z, ie, b, k);
      else if (Y & 2 && Z.class !== ie.class && i(B, "class", null, ie.class, k), Y & 4 && i(B, "style", Z.style, ie.style, k), Y & 8) {
        const ke = I.dynamicProps;
        for (let $e = 0; $e < ke.length; $e++) {
          const Oe = ke[$e], et = Z[Oe], ot = ie[Oe];
          (ot !== et || Oe === "value") && i(B, Oe, et, ot, k, b);
        }
      }
      Y & 1 && p.children !== I.children && d(B, I.children);
    } else !h && N == null && q(B, Z, ie, b, k);
    ((de = ie.onVnodeUpdated) || te) && wt(() => {
      de && Pt(de, b, I, p), te && $n(I, p, b, "updated");
    }, _);
  }, L = (p, I, b, _, k, v, h) => {
    for (let B = 0; B < I.length; B++) {
      const Y = p[B], N = I[B], te = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        Y.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (Y.type === be || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !_o(Y, N) || // - In the case of a component, it could contain anything.
        Y.shapeFlag & 70) ? f(Y.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          b
        )
      );
      C(
        Y,
        N,
        te,
        null,
        _,
        k,
        v,
        h,
        !0
      );
    }
  }, q = (p, I, b, _, k) => {
    if (I !== b) {
      if (I !== ze)
        for (const v in I)
          !Io(v) && !(v in b) && i(
            p,
            v,
            I[v],
            null,
            k,
            _
          );
      for (const v in b) {
        if (Io(v)) continue;
        const h = b[v], B = I[v];
        h !== B && v !== "value" && i(p, v, B, h, k, _);
      }
      "value" in b && i(p, "value", I.value, b.value, k);
    }
  }, H = (p, I, b, _, k, v, h, B, Y) => {
    const N = I.el = p ? p.el : l(""), te = I.anchor = p ? p.anchor : l("");
    let { patchFlag: Z, dynamicChildren: ie, slotScopeIds: de } = I;
    de && (B = B ? B.concat(de) : de), p == null ? (o(N, b, _), o(te, b, _), G(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      I.children || [],
      b,
      te,
      k,
      v,
      h,
      B,
      Y
    )) : Z > 0 && Z & 64 && ie && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    p.dynamicChildren ? (L(
      p.dynamicChildren,
      ie,
      b,
      k,
      v,
      h,
      B
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (I.key != null || k && I === k.subTree) && Sc(
      p,
      I,
      !0
      /* shallow */
    )) : j(
      p,
      I,
      b,
      te,
      k,
      v,
      h,
      B,
      Y
    );
  }, K = (p, I, b, _, k, v, h, B, Y) => {
    I.slotScopeIds = B, p == null ? I.shapeFlag & 512 ? k.ctx.activate(
      I,
      b,
      _,
      h,
      Y
    ) : S(
      I,
      b,
      _,
      k,
      v,
      h,
      Y
    ) : A(p, I, Y);
  }, S = (p, I, b, _, k, v, h) => {
    const B = p.component = ph(
      p,
      _,
      k
    );
    if (nc(p) && (B.ctx.renderer = me), hh(B, !1, h), B.asyncDep) {
      if (k && k.registerDep(B, M, h), !p.el) {
        const Y = B.subTree = J(kn);
        O(null, Y, I, b);
      }
    } else
      M(
        B,
        p,
        I,
        b,
        k,
        v,
        h
      );
  }, A = (p, I, b) => {
    const _ = I.component = p.component;
    if (ih(p, I, b))
      if (_.asyncDep && !_.asyncResolved) {
        R(_, I, b);
        return;
      } else
        _.next = I, _.update();
    else
      I.el = p.el, _.vnode = I;
  }, M = (p, I, b, _, k, v, h) => {
    const B = () => {
      if (p.isMounted) {
        let { next: Z, bu: ie, u: de, parent: ke, vnode: $e } = p;
        {
          const bt = Cc(p);
          if (bt) {
            Z && (Z.el = $e.el, R(p, Z, h)), bt.asyncDep.then(() => {
              p.isUnmounted || B();
            });
            return;
          }
        }
        let Oe = Z, et;
        Nn(p, !1), Z ? (Z.el = $e.el, R(p, Z, h)) : Z = $e, ie && bs(ie), (et = Z.props && Z.props.onVnodeBeforeUpdate) && Pt(et, ke, Z, $e), Nn(p, !0);
        const ot = jl(p), yt = p.subTree;
        p.subTree = ot, C(
          yt,
          ot,
          // parent may have changed if it's in a teleport
          f(yt.el),
          // anchor may have changed if it's in a fragment
          _e(yt),
          p,
          k,
          v
        ), Z.el = ot.el, Oe === null && rh(p, ot.el), de && wt(de, k), (et = Z.props && Z.props.onVnodeUpdated) && wt(
          () => Pt(et, ke, Z, $e),
          k
        );
      } else {
        let Z;
        const { el: ie, props: de } = I, { bm: ke, m: $e, parent: Oe, root: et, type: ot } = p, yt = eo(I);
        Nn(p, !1), ke && bs(ke), !yt && (Z = de && de.onVnodeBeforeMount) && Pt(Z, Oe, I), Nn(p, !0);
        {
          et.ce && et.ce._injectChildStyle(ot);
          const bt = p.subTree = jl(p);
          C(
            null,
            bt,
            b,
            _,
            p,
            k,
            v
          ), I.el = bt.el;
        }
        if ($e && wt($e, k), !yt && (Z = de && de.onVnodeMounted)) {
          const bt = I;
          wt(
            () => Pt(Z, Oe, bt),
            k
          );
        }
        (I.shapeFlag & 256 || Oe && eo(Oe.vnode) && Oe.vnode.shapeFlag & 256) && p.a && wt(p.a, k), p.isMounted = !0, I = b = _ = null;
      }
    };
    p.scope.on();
    const Y = p.effect = new Du(B);
    p.scope.off();
    const N = p.update = Y.run.bind(Y), te = p.job = Y.runIfDirty.bind(Y);
    te.i = p, te.id = p.uid, Y.scheduler = () => Hr(te), Nn(p, !0), N();
  }, R = (p, I, b) => {
    I.component = p;
    const _ = p.vnode.props;
    p.vnode = I, p.next = null, Hp(p, I.props, _, b), qp(p, I.children, b), Sn(), Al(p), Cn();
  }, j = (p, I, b, _, k, v, h, B, Y = !1) => {
    const N = p && p.children, te = p ? p.shapeFlag : 0, Z = I.children, { patchFlag: ie, shapeFlag: de } = I;
    if (ie > 0) {
      if (ie & 128) {
        re(
          N,
          Z,
          b,
          _,
          k,
          v,
          h,
          B,
          Y
        );
        return;
      } else if (ie & 256) {
        ne(
          N,
          Z,
          b,
          _,
          k,
          v,
          h,
          B,
          Y
        );
        return;
      }
    }
    de & 8 ? (te & 16 && ee(N, k, v), Z !== N && d(b, Z)) : te & 16 ? de & 16 ? re(
      N,
      Z,
      b,
      _,
      k,
      v,
      h,
      B,
      Y
    ) : ee(N, k, v, !0) : (te & 8 && d(b, ""), de & 16 && G(
      Z,
      b,
      _,
      k,
      v,
      h,
      B,
      Y
    ));
  }, ne = (p, I, b, _, k, v, h, B, Y) => {
    p = p || Wn, I = I || Wn;
    const N = p.length, te = I.length, Z = Math.min(N, te);
    let ie;
    for (ie = 0; ie < Z; ie++) {
      const de = I[ie] = Y ? cn(I[ie]) : At(I[ie]);
      C(
        p[ie],
        de,
        b,
        null,
        k,
        v,
        h,
        B,
        Y
      );
    }
    N > te ? ee(
      p,
      k,
      v,
      !0,
      !1,
      Z
    ) : G(
      I,
      b,
      _,
      k,
      v,
      h,
      B,
      Y,
      Z
    );
  }, re = (p, I, b, _, k, v, h, B, Y) => {
    let N = 0;
    const te = I.length;
    let Z = p.length - 1, ie = te - 1;
    for (; N <= Z && N <= ie; ) {
      const de = p[N], ke = I[N] = Y ? cn(I[N]) : At(I[N]);
      if (_o(de, ke))
        C(
          de,
          ke,
          b,
          null,
          k,
          v,
          h,
          B,
          Y
        );
      else
        break;
      N++;
    }
    for (; N <= Z && N <= ie; ) {
      const de = p[Z], ke = I[ie] = Y ? cn(I[ie]) : At(I[ie]);
      if (_o(de, ke))
        C(
          de,
          ke,
          b,
          null,
          k,
          v,
          h,
          B,
          Y
        );
      else
        break;
      Z--, ie--;
    }
    if (N > Z) {
      if (N <= ie) {
        const de = ie + 1, ke = de < te ? I[de].el : _;
        for (; N <= ie; )
          C(
            null,
            I[N] = Y ? cn(I[N]) : At(I[N]),
            b,
            ke,
            k,
            v,
            h,
            B,
            Y
          ), N++;
      }
    } else if (N > ie)
      for (; N <= Z; )
        se(p[N], k, v, !0), N++;
    else {
      const de = N, ke = N, $e = /* @__PURE__ */ new Map();
      for (N = ke; N <= ie; N++) {
        const lt = I[N] = Y ? cn(I[N]) : At(I[N]);
        lt.key != null && $e.set(lt.key, N);
      }
      let Oe, et = 0;
      const ot = ie - ke + 1;
      let yt = !1, bt = 0;
      const rn = new Array(ot);
      for (N = 0; N < ot; N++) rn[N] = 0;
      for (N = de; N <= Z; N++) {
        const lt = p[N];
        if (et >= ot) {
          se(lt, k, v, !0);
          continue;
        }
        let _t;
        if (lt.key != null)
          _t = $e.get(lt.key);
        else
          for (Oe = ke; Oe <= ie; Oe++)
            if (rn[Oe - ke] === 0 && _o(lt, I[Oe])) {
              _t = Oe;
              break;
            }
        _t === void 0 ? se(lt, k, v, !0) : (rn[_t - ke] = N + 1, _t >= bt ? bt = _t : yt = !0, C(
          lt,
          I[_t],
          b,
          null,
          k,
          v,
          h,
          B,
          Y
        ), et++);
      }
      const vo = yt ? Zp(rn) : Wn;
      for (Oe = vo.length - 1, N = ot - 1; N >= 0; N--) {
        const lt = ke + N, _t = I[lt], go = lt + 1 < te ? I[lt + 1].el : _;
        rn[N] === 0 ? C(
          null,
          _t,
          b,
          go,
          k,
          v,
          h,
          B,
          Y
        ) : yt && (Oe < 0 || N !== vo[Oe] ? ue(_t, b, go, 2) : Oe--);
      }
    }
  }, ue = (p, I, b, _, k = null) => {
    const { el: v, type: h, transition: B, children: Y, shapeFlag: N } = p;
    if (N & 6) {
      ue(p.component.subTree, I, b, _);
      return;
    }
    if (N & 128) {
      p.suspense.move(I, b, _);
      return;
    }
    if (N & 64) {
      h.move(p, I, b, me);
      return;
    }
    if (h === be) {
      o(v, I, b);
      for (let Z = 0; Z < Y.length; Z++)
        ue(Y[Z], I, b, _);
      o(p.anchor, I, b);
      return;
    }
    if (h === ws) {
      y(p, I, b);
      return;
    }
    if (_ !== 2 && N & 1 && B)
      if (_ === 0)
        B.beforeEnter(v), o(v, I, b), wt(() => B.enter(v), k);
      else {
        const { leave: Z, delayLeave: ie, afterLeave: de } = B, ke = () => o(v, I, b), $e = () => {
          Z(v, () => {
            ke(), de && de();
          });
        };
        ie ? ie(v, ke, $e) : $e();
      }
    else
      o(v, I, b);
  }, se = (p, I, b, _ = !1, k = !1) => {
    const {
      type: v,
      props: h,
      ref: B,
      children: Y,
      dynamicChildren: N,
      shapeFlag: te,
      patchFlag: Z,
      dirs: ie,
      cacheIndex: de
    } = p;
    if (Z === -2 && (k = !1), B != null && Ds(B, null, b, p, !0), de != null && (I.renderCache[de] = void 0), te & 256) {
      I.ctx.deactivate(p);
      return;
    }
    const ke = te & 1 && ie, $e = !eo(p);
    let Oe;
    if ($e && (Oe = h && h.onVnodeBeforeUnmount) && Pt(Oe, I, p), te & 6)
      ge(p.component, b, _);
    else {
      if (te & 128) {
        p.suspense.unmount(b, _);
        return;
      }
      ke && $n(p, null, I, "beforeUnmount"), te & 64 ? p.type.remove(
        p,
        I,
        b,
        me,
        _
      ) : N && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !N.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (v !== be || Z > 0 && Z & 64) ? ee(
        N,
        I,
        b,
        !1,
        !0
      ) : (v === be && Z & 384 || !k && te & 16) && ee(Y, I, b), _ && fe(p);
    }
    ($e && (Oe = h && h.onVnodeUnmounted) || ke) && wt(() => {
      Oe && Pt(Oe, I, p), ke && $n(p, null, I, "unmounted");
    }, b);
  }, fe = (p) => {
    const { type: I, el: b, anchor: _, transition: k } = p;
    if (I === be) {
      ce(b, _);
      return;
    }
    if (I === ws) {
      w(p);
      return;
    }
    const v = () => {
      s(b), k && !k.persisted && k.afterLeave && k.afterLeave();
    };
    if (p.shapeFlag & 1 && k && !k.persisted) {
      const { leave: h, delayLeave: B } = k, Y = () => h(b, v);
      B ? B(p.el, v, Y) : Y();
    } else
      v();
  }, ce = (p, I) => {
    let b;
    for (; p !== I; )
      b = g(p), s(p), p = b;
    s(I);
  }, ge = (p, I, b) => {
    const { bum: _, scope: k, job: v, subTree: h, um: B, m: Y, a: N } = p;
    Hl(Y), Hl(N), _ && bs(_), k.stop(), v && (v.flags |= 8, se(h, p, I, b)), B && wt(B, I), wt(() => {
      p.isUnmounted = !0;
    }, I), I && I.pendingBranch && !I.isUnmounted && p.asyncDep && !p.asyncResolved && p.suspenseId === I.pendingId && (I.deps--, I.deps === 0 && I.resolve());
  }, ee = (p, I, b, _ = !1, k = !1, v = 0) => {
    for (let h = v; h < p.length; h++)
      se(p[h], I, b, _, k);
  }, _e = (p) => {
    if (p.shapeFlag & 6)
      return _e(p.component.subTree);
    if (p.shapeFlag & 128)
      return p.suspense.next();
    const I = g(p.anchor || p.el), b = I && I[wp];
    return b ? g(b) : I;
  };
  let xe = !1;
  const we = (p, I, b) => {
    p == null ? I._vnode && se(I._vnode, null, null, !0) : C(
      I._vnode || null,
      p,
      I,
      null,
      null,
      null,
      b
    ), I._vnode = p, xe || (xe = !0, Al(), Ju(), xe = !1);
  }, me = {
    p: C,
    um: se,
    m: ue,
    r: fe,
    mt: S,
    mc: G,
    pc: j,
    pbc: L,
    n: _e,
    o: e
  };
  return {
    render: we,
    hydrate: void 0,
    createApp: Fp(we)
  };
}
function $i({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Nn({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Wp(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Sc(e, t, n = !1) {
  const o = e.children, s = t.children;
  if (Ee(o) && Ee(s))
    for (let i = 0; i < o.length; i++) {
      const r = o[i];
      let l = s[i];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = s[i] = cn(s[i]), l.el = r.el), !n && l.patchFlag !== -2 && Sc(r, l)), l.type === si && (l.el = r.el);
    }
}
function Zp(e) {
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
function Cc(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Cc(t);
}
function Hl(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Jp = Symbol.for("v-scx"), Qp = () => Lt(Jp);
function Ne(e, t, n) {
  return $c(e, t, n);
}
function $c(e, t, n = ze) {
  const { immediate: o, deep: s, flush: i, once: r } = n, l = ct({}, n), a = t && o || !t && i !== "post";
  let c;
  if (Fo) {
    if (i === "sync") {
      const m = Qp();
      c = m.__watcherHandles || (m.__watcherHandles = []);
    } else if (!a) {
      const m = () => {
      };
      return m.stop = Vt, m.resume = Vt, m.pause = Vt, m;
    }
  }
  const d = st;
  l.call = (m, E, C) => Bt(m, d, E, C);
  let f = !1;
  i === "post" ? l.scheduler = (m) => {
    wt(m, d && d.suspense);
  } : i !== "sync" && (f = !0, l.scheduler = (m, E) => {
    E ? m() : Hr(m);
  }), l.augmentJob = (m) => {
    t && (m.flags |= 4), f && (m.flags |= 2, d && (m.id = d.uid, m.i = d));
  };
  const g = mp(e, t, l);
  return Fo && (c ? c.push(g) : a && g()), g;
}
function eh(e, t, n) {
  const o = this.proxy, s = Ge(e) ? e.includes(".") ? Nc(o, e) : () => o[e] : e.bind(o, o);
  let i;
  Se(t) ? i = t : (i = t.handler, n = t);
  const r = Qo(this), l = $c(s, i.bind(o), n);
  return r(), l;
}
function Nc(e, t) {
  const n = t.split(".");
  return () => {
    let o = e;
    for (let s = 0; s < n.length && o; s++)
      o = o[n[s]];
    return o;
  };
}
const th = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${xt(t)}Modifiers`] || e[`${xn(t)}Modifiers`];
function nh(e, t, ...n) {
  if (e.isUnmounted) return;
  const o = e.vnode.props || ze;
  let s = n;
  const i = t.startsWith("update:"), r = i && th(o, t.slice(7));
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
function Ic(e, t, n = !1) {
  const o = t.emitsCache, s = o.get(e);
  if (s !== void 0)
    return s;
  const i = e.emits;
  let r = {}, l = !1;
  if (!Se(e)) {
    const a = (c) => {
      const d = Ic(c, t, !0);
      d && (l = !0, ct(r, d));
    };
    !n && t.mixins.length && t.mixins.forEach(a), e.extends && a(e.extends), e.mixins && e.mixins.forEach(a);
  }
  return !i && !l ? (Be(e) && o.set(e, null), null) : (Ee(i) ? i.forEach((a) => r[a] = null) : ct(r, i), Be(e) && o.set(e, r), r);
}
function oi(e, t) {
  return !e || !Xs(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), Ve(e, t[0].toLowerCase() + t.slice(1)) || Ve(e, xn(t)) || Ve(e, t));
}
function jl(e) {
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
    props: f,
    data: g,
    setupState: m,
    ctx: E,
    inheritAttrs: C
  } = e, x = Ps(e);
  let O, D;
  try {
    if (n.shapeFlag & 4) {
      const w = s || o, z = w;
      O = At(
        c.call(
          z,
          w,
          d,
          f,
          m,
          g,
          E
        )
      ), D = l;
    } else {
      const w = t;
      O = At(
        w.length > 1 ? w(
          f,
          { attrs: l, slots: r, emit: a }
        ) : w(
          f,
          null
        )
      ), D = t.props ? l : oh(l);
    }
  } catch (w) {
    Po.length = 0, ei(w, e, 1), O = J(kn);
  }
  let y = O;
  if (D && C !== !1) {
    const w = Object.keys(D), { shapeFlag: z } = y;
    w.length && z & 7 && (i && w.some(Or) && (D = sh(
      D,
      i
    )), y = ro(y, D, !1, !0));
  }
  return n.dirs && (y = ro(y, null, !1, !0), y.dirs = y.dirs ? y.dirs.concat(n.dirs) : n.dirs), n.transition && jr(y, n.transition), O = y, Ps(x), O;
}
const oh = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Xs(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, sh = (e, t) => {
  const n = {};
  for (const o in e)
    (!Or(o) || !(o.slice(9) in t)) && (n[o] = e[o]);
  return n;
};
function ih(e, t, n) {
  const { props: o, children: s, component: i } = e, { props: r, children: l, patchFlag: a } = t, c = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && a >= 0) {
    if (a & 1024)
      return !0;
    if (a & 16)
      return o ? Gl(o, r, c) : !!r;
    if (a & 8) {
      const d = t.dynamicProps;
      for (let f = 0; f < d.length; f++) {
        const g = d[f];
        if (r[g] !== o[g] && !oi(c, g))
          return !0;
      }
    }
  } else
    return (s || l) && (!l || !l.$stable) ? !0 : o === r ? !1 : o ? r ? Gl(o, r, c) : !0 : !!r;
  return !1;
}
function Gl(e, t, n) {
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
function rh({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const o = t.subTree;
    if (o.suspense && o.suspense.activeBranch === e && (o.el = e.el), o === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const Mc = (e) => e.__isSuspense;
function lh(e, t) {
  t && t.pendingBranch ? Ee(e) ? t.effects.push(...e) : t.effects.push(e) : _p(e);
}
const be = Symbol.for("v-fgt"), si = Symbol.for("v-txt"), kn = Symbol.for("v-cmt"), ws = Symbol.for("v-stc"), Po = [];
let ht = null;
function $(e = !1) {
  Po.push(ht = e ? null : []);
}
function ah() {
  Po.pop(), ht = Po[Po.length - 1] || null;
}
let io = 1;
function Yl(e, t = !1) {
  io += e, e < 0 && ht && t && (ht.hasOnce = !0);
}
function Oc(e) {
  return e.dynamicChildren = io > 0 ? ht || Wn : null, ah(), io > 0 && ht && ht.push(e), e;
}
function T(e, t, n, o, s, i) {
  return Oc(
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
  return Oc(
    J(
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
const Tc = ({ key: e }) => e ?? null, ks = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? Ge(e) || Xe(e) || Se(e) ? { i: tt, r: e, k: t, f: !!n } : e : null);
function u(e, t = null, n = null, o = 0, s = null, i = e === be ? 0 : 1, r = !1, l = !1) {
  const a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Tc(t),
    ref: t && ks(t),
    scopeId: ec,
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
const J = uh;
function uh(e, t = null, n = null, o = 0, s = null, i = !1) {
  if ((!e || e === lc) && (e = kn), Bo(e)) {
    const l = ro(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Yr(l, n), io > 0 && !i && ht && (l.shapeFlag & 6 ? ht[ht.indexOf(e)] = l : ht.push(l)), l.patchFlag = -2, l;
  }
  if (yh(e) && (e = e.__vccOpts), t) {
    t = Es(t);
    let { class: l, style: a } = t;
    l && !Ge(l) && (t.class = ve(l)), Be(a) && (Ur(a) && !Ee(a) && (a = ct({}, a)), t.style = it(a));
  }
  const r = Ge(e) ? 1 : Mc(e) ? 128 : kp(e) ? 64 : Be(e) ? 4 : Se(e) ? 2 : 0;
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
  return e ? Ur(e) || yc(e) ? ct({}, e) : e : null;
}
function ro(e, t, n = !1, o = !1) {
  const { props: s, ref: i, patchFlag: r, children: l, transition: a } = e, c = t ? qr(s || {}, t) : s, d = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: c,
    key: c && Tc(c),
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
    patchFlag: t && e.type !== be ? r === -1 ? 16 : r | 16 : r,
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
  return J(si, null, e, t);
}
function ch(e, t) {
  const n = J(ws, null, e);
  return n.staticCount = t, n;
}
function le(e = "", t = !1) {
  return t ? ($(), vt(kn, null, e)) : J(kn, null, e);
}
function At(e) {
  return e == null || typeof e == "boolean" ? J(kn) : Ee(e) ? J(
    be,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Bo(e) ? cn(e) : J(si, null, String(e));
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
      !s && !yc(t) ? t._ctx = tt : s === 3 && tt && (tt.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
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
const dh = vc();
let fh = 0;
function ph(e, t, n) {
  const o = e.type, s = (t ? t.appContext : e.appContext) || dh, i = {
    uid: fh++,
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
    scope: new Tu(
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
    propsOptions: _c(o, s),
    emitsOptions: Ic(o, s),
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = nh.bind(null, i), e.ce && e.ce(i), i;
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
}, ql = () => {
  st && st.scope.off(), As(null);
};
function Pc(e) {
  return e.vnode.shapeFlag & 4;
}
let Fo = !1;
function hh(e, t = !1, n = !1) {
  t && ir(t);
  const { props: o, children: s } = e.vnode, i = Pc(e);
  Up(e, o, i, t), Yp(e, s, n);
  const r = i ? vh(e, t) : void 0;
  return t && ir(!1), r;
}
function vh(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Tp);
  const { setup: o } = n;
  if (o) {
    Sn();
    const s = e.setupContext = o.length > 1 ? Rc(e) : null, i = Qo(e), r = Jo(
      o,
      e,
      0,
      [
        e.props,
        s
      ]
    ), l = Su(r);
    if (Cn(), i(), (l || e.sp) && !eo(e) && tc(e), l) {
      if (r.then(ql, ql), t)
        return r.then((a) => {
          Xl(e, a);
        }).catch((a) => {
          ei(a, e, 0);
        });
      e.asyncDep = r;
    } else
      Xl(e, r);
  } else
    Dc(e);
}
function Xl(e, t, n) {
  Se(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : Be(t) && (e.setupState = Xu(t)), Dc(e);
}
function Dc(e, t, n) {
  const o = e.type;
  e.render || (e.render = o.render || Vt);
  {
    const s = Qo(e);
    Sn();
    try {
      Rp(e);
    } finally {
      Cn(), s();
    }
  }
}
const gh = {
  get(e, t) {
    return at(e, "get", ""), e[t];
  }
};
function Rc(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, gh),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function ii(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Xu(An(e.exposed)), {
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
function mh(e, t = !0) {
  return Se(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function yh(e) {
  return Se(e) && "__vccOpts" in e;
}
const ae = (e, t) => vp(e, t, Fo);
function Ae(e, t, n) {
  const o = arguments.length;
  return o === 2 ? Be(t) && !Ee(t) ? Bo(t) ? J(e, null, [t]) : J(e, t) : J(e, null, t) : (o > 3 ? n = Array.prototype.slice.call(arguments, 2) : o === 3 && Bo(n) && (n = [n]), J(e, t, n));
}
function bh(e, t) {
  const n = e.memo;
  if (n.length != t.length)
    return !1;
  for (let o = 0; o < n.length; o++)
    if (Zt(n[o], t[o]))
      return !1;
  return io > 0 && ht && ht.push(e), !0;
}
const _h = "3.5.13";
/**
* @vue/runtime-dom v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let rr;
const Kl = typeof window < "u" && window.trustedTypes;
if (Kl)
  try {
    rr = /* @__PURE__ */ Kl.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Ac = rr ? (e) => rr.createHTML(e) : (e) => e, wh = "http://www.w3.org/2000/svg", kh = "http://www.w3.org/1998/Math/MathML", jt = typeof document < "u" ? document : null, Wl = jt && /* @__PURE__ */ jt.createElement("template"), Eh = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, o) => {
    const s = t === "svg" ? jt.createElementNS(wh, e) : t === "mathml" ? jt.createElementNS(kh, e) : n ? jt.createElement(e, { is: n }) : jt.createElement(e);
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
      Wl.innerHTML = Ac(
        o === "svg" ? `<svg>${e}</svg>` : o === "mathml" ? `<math>${e}</math>` : e
      );
      const l = Wl.content;
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
}, xh = Symbol("_vtc");
function Sh(e, t, n) {
  const o = e[xh];
  o && (t = (t ? [t, ...o] : [...o]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const Zl = Symbol("_vod"), Ch = Symbol("_vsh"), $h = Symbol(""), Nh = /(^|;)\s*display\s*:/;
function Ih(e, t, n) {
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
      const r = o[$h];
      r && (n += ";" + r), o.cssText = n, i = Nh.test(n);
    }
  } else t && e.removeAttribute("style");
  Zl in e && (e[Zl] = i ? o.display : "", e[Ch] && (o.display = "none"));
}
const Jl = /\s*!important$/;
function xs(e, t, n) {
  if (Ee(n))
    n.forEach((o) => xs(e, t, o));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const o = Mh(e, t);
    Jl.test(n) ? e.setProperty(
      xn(o),
      n.replace(Jl, ""),
      "important"
    ) : e[o] = n;
  }
}
const Ql = ["Webkit", "Moz", "ms"], Ni = {};
function Mh(e, t) {
  const n = Ni[t];
  if (n)
    return n;
  let o = xt(t);
  if (o !== "filter" && o in e)
    return Ni[t] = o;
  o = Ws(o);
  for (let s = 0; s < Ql.length; s++) {
    const i = Ql[s] + o;
    if (i in e)
      return Ni[t] = i;
  }
  return t;
}
const ea = "http://www.w3.org/1999/xlink";
function ta(e, t, n, o, s, i = Lf(t)) {
  o && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(ea, t.slice(6, t.length)) : e.setAttributeNS(ea, t, n) : n == null || i && !Iu(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : Mt(n) ? String(n) : n
  );
}
function na(e, t, n, o, s) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Ac(n) : n);
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
    l === "boolean" ? n = Iu(n) : n == null && l === "string" ? (n = "", r = !0) : l === "number" && (n = 0, r = !0);
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
function Oh(e, t, n, o) {
  e.removeEventListener(t, n, o);
}
const oa = Symbol("_vei");
function Th(e, t, n, o, s = null) {
  const i = e[oa] || (e[oa] = {}), r = i[t];
  if (o && r)
    r.value = o;
  else {
    const [l, a] = Ph(t);
    if (o) {
      const c = i[t] = Ah(
        o,
        s
      );
      pn(e, l, c, a);
    } else r && (Oh(e, l, r, a), i[t] = void 0);
  }
}
const sa = /(?:Once|Passive|Capture)$/;
function Ph(e) {
  let t;
  if (sa.test(e)) {
    t = {};
    let o;
    for (; o = e.match(sa); )
      e = e.slice(0, e.length - o[0].length), t[o[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : xn(e.slice(2)), t];
}
let Ii = 0;
const Dh = /* @__PURE__ */ Promise.resolve(), Rh = () => Ii || (Dh.then(() => Ii = 0), Ii = Date.now());
function Ah(e, t) {
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
  return n.value = e, n.attached = Rh(), n;
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
const ia = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Lh = (e, t, n, o, s, i) => {
  const r = s === "svg";
  t === "class" ? Sh(e, o, r) : t === "style" ? Ih(e, n, o) : Xs(t) ? Or(t) || Th(e, t, n, o, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : zh(e, t, o, r)) ? (na(e, t, o), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && ta(e, t, o, r, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !Ge(o)) ? na(e, xt(t), o, i, t) : (t === "true-value" ? e._trueValue = o : t === "false-value" && (e._falseValue = o), ta(e, t, o, r));
};
function zh(e, t, n, o) {
  if (o)
    return !!(t === "innerHTML" || t === "textContent" || t in e && ia(t) && Se(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const s = e.tagName;
    if (s === "IMG" || s === "VIDEO" || s === "CANVAS" || s === "SOURCE")
      return !1;
  }
  return ia(t) && Ge(n) ? !1 : t in e;
}
const lo = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return Ee(t) ? (n) => bs(t, n) : t;
};
function Bh(e) {
  e.target.composing = !0;
}
function ra(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Jt = Symbol("_assign"), Le = {
  created(e, { modifiers: { lazy: t, trim: n, number: o } }, s) {
    e[Jt] = lo(s);
    const i = o || s.props && s.props.type === "number";
    pn(e, t ? "change" : "input", (r) => {
      if (r.target.composing) return;
      let l = e.value;
      n && (l = l.trim()), i && (l = Is(l)), e[Jt](l);
    }), n && pn(e, "change", () => {
      e.value = e.value.trim();
    }), t || (pn(e, "compositionstart", Bh), pn(e, "compositionend", ra), pn(e, "change", ra));
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
  mounted: la,
  beforeUpdate(e, t, n) {
    e[Jt] = lo(n), la(e, t, n);
  }
};
function la(e, { value: t, oldValue: n }, o) {
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
    aa(e, t);
  },
  beforeUpdate(e, t, n) {
    e[Jt] = lo(n);
  },
  updated(e, { value: t }) {
    e._assigning || aa(e, t);
  }
};
function aa(e, t) {
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
const Fh = ["ctrl", "shift", "alt", "meta"], Uh = {
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
  exact: (e, t) => Fh.some((n) => e[`${n}Key`] && !t.includes(n))
}, gt = (e, t) => {
  const n = e._withMods || (e._withMods = {}), o = t.join(".");
  return n[o] || (n[o] = (s, ...i) => {
    for (let r = 0; r < t.length; r++) {
      const l = Uh[t[r]];
      if (l && l(s, t)) return;
    }
    return e(s, ...i);
  });
}, Hh = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, ua = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), o = t.join(".");
  return n[o] || (n[o] = (s) => {
    if (!("key" in s))
      return;
    const i = xn(s.key);
    if (t.some(
      (r) => r === i || Hh[r] === i
    ))
      return e(s);
  });
}, jh = /* @__PURE__ */ ct({ patchProp: Lh }, Eh);
let ca;
function Gh() {
  return ca || (ca = Xp(jh));
}
const es = (...e) => {
  const t = Gh().createApp(...e), { mount: n } = t;
  return t.mount = (o) => {
    const s = qh(o);
    if (!s) return;
    const i = t._component;
    !Se(i) && !i.render && !i.template && (i.template = s.innerHTML), s.nodeType === 1 && (s.textContent = "");
    const r = n(s, !1, Yh(s));
    return s instanceof Element && (s.removeAttribute("v-cloak"), s.setAttribute("data-v-app", "")), r;
  }, t;
};
function Yh(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function qh(e) {
  return Ge(e) ? document.querySelector(e) : e;
}
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Xh = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
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
const Kh = ({ size: e, strokeWidth: t = 2, absoluteStrokeWidth: n, color: o, iconNode: s, name: i, class: r, ...l }, { slots: a }) => Ae(
  "svg",
  {
    ...as,
    width: e || as.width,
    height: e || as.height,
    stroke: o || as.stroke,
    "stroke-width": n ? Number(t) * 24 / Number(e) : t,
    class: ["lucide", `lucide-${Xh(i ?? "icon")}`],
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
  Kh,
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
const Wh = Ie("ArchiveIcon", [
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
const Zh = Ie("BotIcon", [
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
const Jh = Ie("BrainIcon", [
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
const Qh = Ie("ChartColumnIcon", [
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
const ev = Ie("ChevronDownIcon", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const tv = Ie("Clock3Icon", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16.5 12", key: "1aq6pp" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const nv = Ie("DatabaseIcon", [
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
const da = Ie("EyeIcon", [
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
const Lc = Ie("GitBranchIcon", [
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
const ov = Ie("LayersIcon", [
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
const sv = Ie("Maximize2Icon", [
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
const iv = Ie("MicVocalIcon", [
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
const rv = Ie("MinusIcon", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zc = Ie("PenLineIcon", [
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
const Bc = Ie("PlayIcon", [
  ["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]
]);
/**
 * @license lucide-vue-next v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const lv = Ie("PlugIcon", [
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
const av = Ie("PuzzleIcon", [
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
const uv = Ie("ScanFaceIcon", [
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
const cv = Ie("ScanSearchIcon", [
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
const dv = Ie("SendIcon", [
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
const fv = Ie("ShieldCheckIcon", [
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
const pv = Ie("Undo2Icon", [
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
const hv = Ie("WrenchIcon", [
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
]), vv = /* @__PURE__ */ new Set(["converting", "preview_ready", "indexing"]);
function gv(e) {
  let t = 0, n = 0, o = 0;
  for (const s of e) {
    const i = String(s.status || "");
    i === "indexed" ? t += 1 : i.endsWith("_failed") || ["failed", "error"].includes(i) ? o += 1 : vv.has(i) && i !== "preview_ready" && (n += 1);
  }
  return { total: e.length, indexed: t, processing: n, failed: o, attention: n + o };
}
function mv(e) {
  if (Array.isArray(e)) return e;
  if (!e || typeof e != "object") return [];
  const t = e;
  for (const n of ["items", "evaluations", "results"])
    if (Array.isArray(t[n])) return t[n];
  return [e];
}
function yv(e) {
  const t = Number(e);
  return Number.isFinite(t) ? `${Math.round(t <= 1 ? t * 100 : t)}%` : "—";
}
function bv(e) {
  const t = Number(e == null ? void 0 : e.total_documents), n = Number((e == null ? void 0 : e.indexed_count) ?? (e == null ? void 0 : e.indexed_documents)), o = Number((e == null ? void 0 : e.failed_count) ?? (e == null ? void 0 : e.failed_documents)), s = Number((e == null ? void 0 : e.in_progress_count) ?? (e == null ? void 0 : e.processing_documents)), i = String((e == null ? void 0 : e.status) || (e == null ? void 0 : e.state) || "");
  return ["ready", "completed", "complete", "healthy"].includes(i) ? "处理完成" : ["running", "processing", "pending", "indexing"].includes(i) ? "处理中" : ["failed", "error"].includes(i) || Number.isFinite(o) && o > 0 ? "需要处理" : Number.isFinite(s) && s > 0 ? "处理中" : Number.isFinite(t) && t > 0 && Number.isFinite(n) && n >= t ? "处理完成" : Number.isFinite(t) && t === 0 ? "暂无资料" : e ? "已生成" : "暂无报告";
}
function _v(e) {
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
async function Fc(e, t) {
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
function Uc(e) {
  return qe(`/api/personas/${encodeURIComponent(e)}/documents`, { cache: "no-store" });
}
async function Hc() {
  return (await qe("/api/live2d/models", { cache: "no-store" })).models;
}
async function wv() {
  await qe("/api/live2d/model-directory", {
    method: "POST",
    headers: { "X-YUMENO-Request": "web" }
  });
}
async function fa(e) {
  const [t, n, o, s, i, r] = await Promise.all([
    qe(`/api/personas/${encodeURIComponent(e.id)}/capabilities`, { cache: "no-store" }),
    qe(`/api/personas/${encodeURIComponent(e.id)}/mcp-grants`, { cache: "no-store" }),
    Uc(e.id),
    qe("/api/mcp/servers", { cache: "no-store" }).catch(() => []),
    Hc().then((a) => ({ models: a })).catch(() => ({ models: [] })),
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
async function kv(e) {
  await qe(`/api/personas/${encodeURIComponent(e.id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: e.name, profile: e.profile || {} })
  });
}
async function Ev(e, t) {
  await qe(`/api/personas/${encodeURIComponent(e)}/capabilities`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ overrides: t })
  });
}
async function xv(e, t) {
  const n = t.filter((o) => o.authorized && !o.global).map((o) => o.name);
  await qe(`/api/personas/${encodeURIComponent(e)}/mcp-grants`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ server_names: n })
  });
}
async function Sv(e) {
  await qe(`/api/personas/${encodeURIComponent(e)}`, { method: "DELETE" });
}
async function Cv(e, t, n) {
  if (!e.knowledge_space_id) throw new Error("角色知识空间不可用");
  const o = new FormData();
  t.forEach((i) => o.append("files", i)), n.trim() && o.append("files", new File([n.trim()], `text-${Date.now()}.txt`, { type: "text/plain;charset=utf-8" }));
  const s = await qe(`/api/knowledge-spaces/${encodeURIComponent(e.knowledge_space_id)}/documents/upload`, { method: "POST", body: o });
  await Promise.all(s.map((i) => qe(`/api/documents/${encodeURIComponent(i.id)}/confirm`, { method: "POST" })));
}
async function $v(e) {
  var n;
  const t = await fetch(`/api/documents/${encodeURIComponent(e)}`, { method: "DELETE" });
  if (!t.ok) throw new Error(((n = await t.json().catch(() => null)) == null ? void 0 : n.detail) || `删除失败 (${t.status})`);
}
async function Nv(e) {
  await qe(`/api/documents/${encodeURIComponent(e)}/retry-index`, { method: "POST" });
}
async function Iv(e, t) {
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
function Mv(e) {
  return qe(`/api/personas/${encodeURIComponent(e)}/versions`, { cache: "no-store" });
}
function Ov(e, t) {
  return qe(`/api/personas/${encodeURIComponent(e)}/versions/${encodeURIComponent(t)}`, { cache: "no-store" });
}
function Tv(e, t = {}) {
  return qe(`/api/personas/${encodeURIComponent(e)}/versions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label: t.label || "", note: t.note || "" })
  });
}
async function Pv(e, t) {
  return (await qe(
    `/api/personas/${encodeURIComponent(e)}/versions/${encodeURIComponent(t)}/publish`,
    { method: "POST" }
  )).version;
}
async function Dv(e, t) {
  return (await qe(
    `/api/personas/${encodeURIComponent(e)}/versions/${encodeURIComponent(t)}/rollback`,
    { method: "POST" }
  )).version;
}
async function Rv(e) {
  return Fc(
    `/api/knowledge-spaces/${encodeURIComponent(e)}/documents/report`,
    { cache: "no-store" }
  );
}
async function Av(e, t = 1) {
  const n = await Fc(
    `/api/eval/history?persona_id=${encodeURIComponent(e)}&limit=${encodeURIComponent(String(t))}`,
    { cache: "no-store" }
  );
  return mv(n);
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
function Lv(e) {
  return ["available", "partial", "unassigned", "blocked", "pending", "error"].includes(e) ? e : "blocked";
}
function wo(e, t, n) {
  return { id: e, type: t, position: { x: 0, y: 0 }, data: n };
}
function zv(e) {
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
    const a = l.kind === "skill" ? "skill" : "tool", c = e.capabilities.overrides[l.id], d = c === void 0 ? l.assigned : c, f = c === !1 ? "blocked" : c === !0 && l.status === "unassigned" ? "available" : l.status;
    t.set(l.id, wo(l.id, "capability", {
      kind: a,
      label: l.name,
      summary: l.description || l.reason || "能力包",
      status: Lv(f),
      level: l.level,
      assigned: d,
      configurable: !0,
      sourceId: l.id
    })), n.set(`${s}->${l.id}`, { id: `${s}->${l.id}`, source: s, target: l.id, sourceHandle: "right-source", targetHandle: "left-target" });
    for (const g of l.dependencies || []) {
      if (!g.id) continue;
      const m = e.capabilities.overrides[g.id], E = m === void 0 ? g.effective : m;
      if (t.set(g.id, wo(g.id, "capability", {
        kind: "tool",
        label: g.name,
        summary: g.server ? `MCP · ${g.server}` : g.source,
        status: E ? "available" : "blocked",
        level: g.level,
        assigned: E,
        configurable: !1,
        sourceId: g.id
      })), n.set(`${l.id}->${g.id}`, { id: `${l.id}->${g.id}`, source: l.id, target: g.id, sourceHandle: "right-source", targetHandle: "left-target" }), g.server) {
        const C = `mcp:${g.server}`, x = e.grants.servers.find((D) => D.name === g.server), O = ((r = x == null ? void 0 : x.status) == null ? void 0 : r.status) === "connected";
        t.set(C, wo(C, "capability", {
          kind: "mcp",
          label: g.server,
          summary: (x == null ? void 0 : x.description) || "MCP 服务",
          status: x != null && x.authorized && O ? "available" : "blocked",
          level: g.level,
          assigned: !!(x != null && x.authorized),
          configurable: !!(x && !x.global),
          sourceId: g.server
        })), n.set(`${g.id}->${C}`, { id: `${g.id}->${C}`, source: g.id, target: C, sourceHandle: "right-source", targetHandle: "left-target" });
      }
    }
  }
  return { nodes: [...t.values()], edges: [...n.values()] };
}
function Bv(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Fv = "\0", In = "\0", pa = "";
let Uv = class {
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
    var a = Hv(this._isDirected, t, n, o);
    return t = a.v, n = a.w, Object.freeze(a), this._edgeObjs[l] = a, ha(this._preds[n], t), ha(this._sucs[t], n), this._in[n][l] = a, this._out[t][l] = a, this._edgeCount++, this;
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
    return i && (t = i.v, n = i.w, delete this._edgeLabels[s], delete this._edgeObjs[s], va(this._preds[n], t), va(this._sucs[t], n), delete this._in[n][s], delete this._out[t][s], this._edgeCount--), this;
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
function ha(e, t) {
  e[t] ? e[t]++ : e[t] = 1;
}
function va(e, t) {
  --e[t] || delete e[t];
}
function So(e, t, n, o) {
  var s = "" + t, i = "" + n;
  if (!e && s > i) {
    var r = s;
    s = i, i = r;
  }
  return s + pa + i + pa + (o === void 0 ? Fv : o);
}
function Hv(e, t, n, o) {
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
var Zr = Uv, jv = "2.2.4", Gv = {
  Graph: Zr,
  version: jv
}, Yv = Zr, qv = {
  write: Xv,
  read: Zv
};
function Xv(e) {
  var t = {
    options: {
      directed: e.isDirected(),
      multigraph: e.isMultigraph(),
      compound: e.isCompound()
    },
    nodes: Kv(e),
    edges: Wv(e)
  };
  return e.graph() !== void 0 && (t.value = structuredClone(e.graph())), t;
}
function Kv(e) {
  return e.nodes().map(function(t) {
    var n = e.node(t), o = e.parent(t), s = { v: t };
    return n !== void 0 && (s.value = n), o !== void 0 && (s.parent = o), s;
  });
}
function Wv(e) {
  return e.edges().map(function(t) {
    var n = e.edge(t), o = { v: t.v, w: t.w };
    return t.name !== void 0 && (o.name = t.name), n !== void 0 && (o.value = n), o;
  });
}
function Zv(e) {
  var t = new Yv(e.options).setGraph(e.value);
  return e.nodes.forEach(function(n) {
    t.setNode(n.v, n.value), n.parent && t.setParent(n.v, n.parent);
  }), e.edges.forEach(function(n) {
    t.setEdge({ v: n.v, w: n.w, name: n.name }, n.value);
  }), t;
}
var Jv = Qv;
function Qv(e) {
  var t = {}, n = [], o;
  function s(i) {
    Object.hasOwn(t, i) || (t[i] = !0, o.push(i), e.successors(i).forEach(s), e.predecessors(i).forEach(s));
  }
  return e.nodes().forEach(function(i) {
    o = [], s(i), o.length && n.push(o);
  }), n;
}
let eg = class {
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
var jc = eg, tg = jc, Gc = og, ng = () => 1;
function og(e, t, n, o) {
  return sg(
    e,
    String(t),
    n || ng,
    o || function(s) {
      return e.outEdges(s);
    }
  );
}
function sg(e, t, n, o) {
  var s = {}, i = new tg(), r, l, a = function(c) {
    var d = c.v !== r ? c.v : c.w, f = s[d], g = n(c), m = l.distance + g;
    if (g < 0)
      throw new Error("dijkstra does not allow negative edge weights. Bad edge: " + c + " Weight: " + g);
    m < f.distance && (f.distance = m, f.predecessor = r, i.decrease(d, m));
  };
  for (e.nodes().forEach(function(c) {
    var d = c === t ? 0 : Number.POSITIVE_INFINITY;
    s[c] = { distance: d }, i.add(c, d);
  }); i.size() > 0 && (r = i.removeMin(), l = s[r], l.distance !== Number.POSITIVE_INFINITY); )
    o(r).forEach(a);
  return s;
}
var ig = Gc, rg = lg;
function lg(e, t, n) {
  return e.nodes().reduce(function(o, s) {
    return o[s] = ig(e, s, t, n), o;
  }, {});
}
var Yc = ag;
function ag(e) {
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
var ug = Yc, cg = dg;
function dg(e) {
  return ug(e).filter(function(t) {
    return t.length > 1 || t.length === 1 && e.hasEdge(t[0], t[0]);
  });
}
var fg = hg, pg = () => 1;
function hg(e, t, n) {
  return vg(
    e,
    t || pg,
    n || function(o) {
      return e.outEdges(o);
    }
  );
}
function vg(e, t, n) {
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
        var d = a[i], f = r[c], g = a[c], m = d.distance + f.distance;
        m < g.distance && (g.distance = m, g.predecessor = f.predecessor);
      });
    });
  }), o;
}
function qc(e) {
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
var Xc = qc;
qc.CycleException = fr;
var ga = Xc, gg = mg;
function mg(e) {
  try {
    ga(e);
  } catch (t) {
    if (t instanceof ga.CycleException)
      return !1;
    throw t;
  }
  return !0;
}
var Kc = yg;
function yg(e, t, n) {
  Array.isArray(t) || (t = [t]);
  var o = e.isDirected() ? (l) => e.successors(l) : (l) => e.neighbors(l), s = n === "post" ? bg : _g, i = [], r = {};
  return t.forEach((l) => {
    if (!e.hasNode(l))
      throw new Error("Graph does not have node: " + l);
    s(l, o, r, i);
  }), i;
}
function bg(e, t, n, o) {
  for (var s = [[e, !1]]; s.length > 0; ) {
    var i = s.pop();
    i[1] ? o.push(i[0]) : Object.hasOwn(n, i[0]) || (n[i[0]] = !0, s.push([i[0], !0]), Wc(t(i[0]), (r) => s.push([r, !1])));
  }
}
function _g(e, t, n, o) {
  for (var s = [e]; s.length > 0; ) {
    var i = s.pop();
    Object.hasOwn(n, i) || (n[i] = !0, o.push(i), Wc(t(i), (r) => s.push(r)));
  }
}
function Wc(e, t) {
  for (var n = e.length; n--; )
    t(e[n], n, e);
  return e;
}
var wg = Kc, kg = Eg;
function Eg(e, t) {
  return wg(e, t, "post");
}
var xg = Kc, Sg = Cg;
function Cg(e, t) {
  return xg(e, t, "pre");
}
var $g = Zr, Ng = jc, Ig = Mg;
function Mg(e, t) {
  var n = new $g(), o = {}, s = new Ng(), i;
  function r(a) {
    var c = a.v === i ? a.w : a.v, d = s.priority(c);
    if (d !== void 0) {
      var f = t(a);
      f < d && (o[c] = i, s.decrease(c, f));
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
var Og = {
  components: Jv,
  dijkstra: Gc,
  dijkstraAll: rg,
  findCycles: cg,
  floydWarshall: fg,
  isAcyclic: gg,
  postorder: kg,
  preorder: Sg,
  prim: Ig,
  tarjan: Yc,
  topsort: Xc
}, ma = Gv, Ot = {
  Graph: ma.Graph,
  json: qv,
  alg: Og,
  version: ma.version
};
let Tg = class {
  constructor() {
    let t = {};
    t._next = t._prev = t, this._sentinel = t;
  }
  dequeue() {
    let t = this._sentinel, n = t._prev;
    if (n !== t)
      return ya(n), n;
  }
  enqueue(t) {
    let n = this._sentinel;
    t._prev && t._next && ya(t), t._next = n._next, n._next._prev = t, n._next = t, t._prev = n;
  }
  toString() {
    let t = [], n = this._sentinel, o = n._prev;
    for (; o !== n; )
      t.push(JSON.stringify(o, Pg)), o = o._prev;
    return "[" + t.join(", ") + "]";
  }
};
function ya(e) {
  e._prev._next = e._next, e._next._prev = e._prev, delete e._next, delete e._prev;
}
function Pg(e, t) {
  if (e !== "_next" && e !== "_prev")
    return t;
}
var Dg = Tg;
let Rg = Ot.Graph, Ag = Dg;
var Vg = zg;
let Lg = () => 1;
function zg(e, t) {
  if (e.nodeCount() <= 1)
    return [];
  let n = Fg(e, t || Lg);
  return Bg(n.graph, n.buckets, n.zeroIdx).flatMap((s) => e.outEdges(s.v, s.w));
}
function Bg(e, t, n) {
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
function Fg(e, t) {
  let n = new Rg(), o = 0, s = 0;
  e.nodes().forEach((l) => {
    n.setNode(l, { v: l, in: 0, out: 0 });
  }), e.edges().forEach((l) => {
    let a = n.edge(l.v, l.w) || 0, c = t(l), d = a + c;
    n.setEdge(l.v, l.w, d), s = Math.max(s, n.node(l.v).out += c), o = Math.max(o, n.node(l.w).in += c);
  });
  let i = Ug(s + o + 3).map(() => new Ag()), r = o + 1;
  return n.nodes().forEach((l) => {
    pr(i, r, n.node(l));
  }), { graph: n, buckets: i, zeroIdx: r };
}
function pr(e, t, n) {
  n.out ? n.in ? e[n.out - n.in + t].enqueue(n) : e[e.length - 1].enqueue(n) : e[0].enqueue(n);
}
function Ug(e) {
  const t = [];
  for (let n = 0; n < e; n++)
    t.push(n);
  return t;
}
let Zc = Ot.Graph;
var Ze = {
  addBorderNode: Zg,
  addDummyNode: Jc,
  applyWithChunking: ri,
  asNonCompoundGraph: jg,
  buildLayerMatrix: Xg,
  intersectRect: qg,
  mapValues: sm,
  maxRank: ed,
  normalizeRanks: Kg,
  notime: tm,
  partition: Qg,
  pick: om,
  predecessorWeights: Yg,
  range: nd,
  removeEmptyRanks: Wg,
  simplify: Hg,
  successorWeights: Gg,
  time: em,
  uniqueId: td,
  zipObject: Jr
};
function Jc(e, t, n, o) {
  for (var s = o; e.hasNode(s); )
    s = td(o);
  return n.dummy = t, e.setNode(s, n), s;
}
function Hg(e) {
  let t = new Zc().setGraph(e.graph());
  return e.nodes().forEach((n) => t.setNode(n, e.node(n))), e.edges().forEach((n) => {
    let o = t.edge(n.v, n.w) || { weight: 0, minlen: 1 }, s = e.edge(n);
    t.setEdge(n.v, n.w, {
      weight: o.weight + s.weight,
      minlen: Math.max(o.minlen, s.minlen)
    });
  }), t;
}
function jg(e) {
  let t = new Zc({ multigraph: e.isMultigraph() }).setGraph(e.graph());
  return e.nodes().forEach((n) => {
    e.children(n).length || t.setNode(n, e.node(n));
  }), e.edges().forEach((n) => {
    t.setEdge(n, e.edge(n));
  }), t;
}
function Gg(e) {
  let t = e.nodes().map((n) => {
    let o = {};
    return e.outEdges(n).forEach((s) => {
      o[s.w] = (o[s.w] || 0) + e.edge(s).weight;
    }), o;
  });
  return Jr(e.nodes(), t);
}
function Yg(e) {
  let t = e.nodes().map((n) => {
    let o = {};
    return e.inEdges(n).forEach((s) => {
      o[s.v] = (o[s.v] || 0) + e.edge(s).weight;
    }), o;
  });
  return Jr(e.nodes(), t);
}
function qg(e, t) {
  let n = e.x, o = e.y, s = t.x - n, i = t.y - o, r = e.width / 2, l = e.height / 2;
  if (!s && !i)
    throw new Error("Not possible to find intersection inside of the rectangle");
  let a, c;
  return Math.abs(i) * r > Math.abs(s) * l ? (i < 0 && (l = -l), a = l * s / i, c = l) : (s < 0 && (r = -r), a = r, c = r * i / s), { x: n + a, y: o + c };
}
function Xg(e) {
  let t = nd(ed(e) + 1).map(() => []);
  return e.nodes().forEach((n) => {
    let o = e.node(n), s = o.rank;
    s !== void 0 && (t[s][o.order] = n);
  }), t;
}
function Kg(e) {
  let t = e.nodes().map((o) => {
    let s = e.node(o).rank;
    return s === void 0 ? Number.MAX_VALUE : s;
  }), n = ri(Math.min, t);
  e.nodes().forEach((o) => {
    let s = e.node(o);
    Object.hasOwn(s, "rank") && (s.rank -= n);
  });
}
function Wg(e) {
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
function Zg(e, t, n, o) {
  let s = {
    width: 0,
    height: 0
  };
  return arguments.length >= 4 && (s.rank = n, s.order = o), Jc(e, "border", s, t);
}
function Jg(e, t = Qc) {
  const n = [];
  for (let o = 0; o < e.length; o += t) {
    const s = e.slice(o, o + t);
    n.push(s);
  }
  return n;
}
const Qc = 65535;
function ri(e, t) {
  if (t.length > Qc) {
    const n = Jg(t);
    return e.apply(null, n.map((o) => e.apply(null, o)));
  } else
    return e.apply(null, t);
}
function ed(e) {
  const n = e.nodes().map((o) => {
    let s = e.node(o).rank;
    return s === void 0 ? Number.MIN_VALUE : s;
  });
  return ri(Math.max, n);
}
function Qg(e, t) {
  let n = { lhs: [], rhs: [] };
  return e.forEach((o) => {
    t(o) ? n.lhs.push(o) : n.rhs.push(o);
  }), n;
}
function em(e, t) {
  let n = Date.now();
  try {
    return t();
  } finally {
    console.log(e + " time: " + (Date.now() - n) + "ms");
  }
}
function tm(e, t) {
  return t();
}
let nm = 0;
function td(e) {
  var t = ++nm;
  return e + ("" + t);
}
function nd(e, t, n = 1) {
  t == null && (t = e, e = 0);
  let o = (i) => i < t;
  n < 0 && (o = (i) => t < i);
  const s = [];
  for (let i = e; o(i); i += n)
    s.push(i);
  return s;
}
function om(e, t) {
  const n = {};
  for (const o of t)
    e[o] !== void 0 && (n[o] = e[o]);
  return n;
}
function sm(e, t) {
  let n = t;
  return typeof t == "string" && (n = (o) => o[t]), Object.entries(e).reduce((o, [s, i]) => (o[s] = n(i, s), o), {});
}
function Jr(e, t) {
  return e.reduce((n, o, s) => (n[o] = t[s], n), {});
}
let im = Vg, rm = Ze.uniqueId;
var lm = {
  run: am,
  undo: cm
};
function am(e) {
  (e.graph().acyclicer === "greedy" ? im(e, n(e)) : um(e)).forEach((o) => {
    let s = e.edge(o);
    e.removeEdge(o), s.forwardName = o.name, s.reversed = !0, e.setEdge(o.w, o.v, s, rm("rev"));
  });
  function n(o) {
    return (s) => o.edge(s).weight;
  }
}
function um(e) {
  let t = [], n = {}, o = {};
  function s(i) {
    Object.hasOwn(o, i) || (o[i] = !0, n[i] = !0, e.outEdges(i).forEach((r) => {
      Object.hasOwn(n, r.w) ? t.push(r) : s(r.w);
    }), delete n[i]);
  }
  return e.nodes().forEach(s), t;
}
function cm(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t);
    if (n.reversed) {
      e.removeEdge(t);
      let o = n.forwardName;
      delete n.reversed, delete n.forwardName, e.setEdge(t.w, t.v, n, o);
    }
  });
}
let dm = Ze;
var fm = {
  run: pm,
  undo: vm
};
function pm(e) {
  e.graph().dummyChains = [], e.edges().forEach((t) => hm(e, t));
}
function hm(e, t) {
  let n = t.v, o = e.node(n).rank, s = t.w, i = e.node(s).rank, r = t.name, l = e.edge(t), a = l.labelRank;
  if (i === o + 1) return;
  e.removeEdge(t);
  let c, d, f;
  for (f = 0, ++o; o < i; ++f, ++o)
    l.points = [], d = {
      width: 0,
      height: 0,
      edgeLabel: l,
      edgeObj: t,
      rank: o
    }, c = dm.addDummyNode(e, "edge", d, "_d"), o === a && (d.width = l.width, d.height = l.height, d.dummy = "edge-label", d.labelpos = l.labelpos), e.setEdge(n, c, { weight: l.weight }, r), f === 0 && e.graph().dummyChains.push(c), n = c;
  e.setEdge(n, s, { weight: l.weight }, r);
}
function vm(e) {
  e.graph().dummyChains.forEach((t) => {
    let n = e.node(t), o = n.edgeLabel, s;
    for (e.setEdge(n.edgeObj, o); n.dummy; )
      s = e.successors(t)[0], e.removeNode(t), o.points.push({ x: n.x, y: n.y }), n.dummy === "edge-label" && (o.x = n.x, o.y = n.y, o.width = n.width, o.height = n.height), t = s, n = e.node(t);
  });
}
const { applyWithChunking: gm } = Ze;
var li = {
  longestPath: mm,
  slack: ym
};
function mm(e) {
  var t = {};
  function n(o) {
    var s = e.node(o);
    if (Object.hasOwn(t, o))
      return s.rank;
    t[o] = !0;
    let i = e.outEdges(o).map((l) => l == null ? Number.POSITIVE_INFINITY : n(l.w) - e.edge(l).minlen);
    var r = gm(Math.min, i);
    return r === Number.POSITIVE_INFINITY && (r = 0), s.rank = r;
  }
  e.sources().forEach(n);
}
function ym(e, t) {
  return e.node(t.w).rank - e.node(t.v).rank - e.edge(t).minlen;
}
var bm = Ot.Graph, Vs = li.slack, od = _m;
function _m(e) {
  var t = new bm({ directed: !1 }), n = e.nodes()[0], o = e.nodeCount();
  t.setNode(n, {});
  for (var s, i; wm(t, e) < o; )
    s = km(t, e), i = t.hasNode(s.v) ? Vs(e, s) : -Vs(e, s), Em(t, e, i);
  return t;
}
function wm(e, t) {
  function n(o) {
    t.nodeEdges(o).forEach((s) => {
      var i = s.v, r = o === i ? s.w : i;
      !e.hasNode(r) && !Vs(t, s) && (e.setNode(r, {}), e.setEdge(o, r, {}), n(r));
    });
  }
  return e.nodes().forEach(n), e.nodeCount();
}
function km(e, t) {
  return t.edges().reduce((o, s) => {
    let i = Number.POSITIVE_INFINITY;
    return e.hasNode(s.v) !== e.hasNode(s.w) && (i = Vs(t, s)), i < o[0] ? [i, s] : o;
  }, [Number.POSITIVE_INFINITY, null])[1];
}
function Em(e, t, n) {
  e.nodes().forEach((o) => t.node(o).rank += n);
}
var xm = od, ba = li.slack, Sm = li.longestPath, Cm = Ot.alg.preorder, $m = Ot.alg.postorder, Nm = Ze.simplify, Im = Gn;
Gn.initLowLimValues = el;
Gn.initCutValues = Qr;
Gn.calcCutValue = sd;
Gn.leaveEdge = rd;
Gn.enterEdge = ld;
Gn.exchangeEdges = ad;
function Gn(e) {
  e = Nm(e), Sm(e);
  var t = xm(e);
  el(t), Qr(t, e);
  for (var n, o; n = rd(t); )
    o = ld(t, e, n), ad(t, e, n, o);
}
function Qr(e, t) {
  var n = $m(e, e.nodes());
  n = n.slice(0, n.length - 1), n.forEach((o) => Mm(e, t, o));
}
function Mm(e, t, n) {
  var o = e.node(n), s = o.parent;
  e.edge(n, s).cutvalue = sd(e, t, n);
}
function sd(e, t, n) {
  var o = e.node(n), s = o.parent, i = !0, r = t.edge(n, s), l = 0;
  return r || (i = !1, r = t.edge(s, n)), l = r.weight, t.nodeEdges(n).forEach((a) => {
    var c = a.v === n, d = c ? a.w : a.v;
    if (d !== s) {
      var f = c === i, g = t.edge(a).weight;
      if (l += f ? g : -g, Tm(e, n, d)) {
        var m = e.edge(n, d).cutvalue;
        l += f ? -m : m;
      }
    }
  }), l;
}
function el(e, t) {
  arguments.length < 2 && (t = e.nodes()[0]), id(e, {}, 1, t);
}
function id(e, t, n, o, s) {
  var i = n, r = e.node(o);
  return t[o] = !0, e.neighbors(o).forEach((l) => {
    Object.hasOwn(t, l) || (n = id(e, t, n, l, o));
  }), r.low = i, r.lim = n++, s ? r.parent = s : delete r.parent, n;
}
function rd(e) {
  return e.edges().find((t) => e.edge(t).cutvalue < 0);
}
function ld(e, t, n) {
  var o = n.v, s = n.w;
  t.hasEdge(o, s) || (o = n.w, s = n.v);
  var i = e.node(o), r = e.node(s), l = i, a = !1;
  i.lim > r.lim && (l = r, a = !0);
  var c = t.edges().filter((d) => a === _a(e, e.node(d.v), l) && a !== _a(e, e.node(d.w), l));
  return c.reduce((d, f) => ba(t, f) < ba(t, d) ? f : d);
}
function ad(e, t, n, o) {
  var s = n.v, i = n.w;
  e.removeEdge(s, i), e.setEdge(o.v, o.w, {}), el(e), Qr(e, t), Om(e, t);
}
function Om(e, t) {
  var n = e.nodes().find((s) => !t.node(s).parent), o = Cm(e, n);
  o = o.slice(1), o.forEach((s) => {
    var i = e.node(s).parent, r = t.edge(s, i), l = !1;
    r || (r = t.edge(i, s), l = !0), t.node(s).rank = t.node(i).rank + (l ? r.minlen : -r.minlen);
  });
}
function Tm(e, t, n) {
  return e.hasEdge(t, n);
}
function _a(e, t, n) {
  return n.low <= t.lim && t.lim <= n.lim;
}
var Pm = li, ud = Pm.longestPath, Dm = od, Rm = Im, Am = Vm;
function Vm(e) {
  var t = e.graph().ranker;
  if (t instanceof Function)
    return t(e);
  switch (e.graph().ranker) {
    case "network-simplex":
      wa(e);
      break;
    case "tight-tree":
      zm(e);
      break;
    case "longest-path":
      Lm(e);
      break;
    case "none":
      break;
    default:
      wa(e);
  }
}
var Lm = ud;
function zm(e) {
  ud(e), Dm(e);
}
function wa(e) {
  Rm(e);
}
var Bm = Fm;
function Fm(e) {
  let t = Hm(e);
  e.graph().dummyChains.forEach((n) => {
    let o = e.node(n), s = o.edgeObj, i = Um(e, t, s.v, s.w), r = i.path, l = i.lca, a = 0, c = r[a], d = !0;
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
function Um(e, t, n, o) {
  let s = [], i = [], r = Math.min(t[n].low, t[o].low), l = Math.max(t[n].lim, t[o].lim), a, c;
  a = n;
  do
    a = e.parent(a), s.push(a);
  while (a && (t[a].low > r || l > t[a].lim));
  for (c = a, a = o; (a = e.parent(a)) !== c; )
    i.push(a);
  return { path: s.concat(i.reverse()), lca: c };
}
function Hm(e) {
  let t = {}, n = 0;
  function o(s) {
    let i = n;
    e.children(s).forEach(o), t[s] = { low: i, lim: n++ };
  }
  return e.children().forEach(o), t;
}
let Ls = Ze;
var jm = {
  run: Gm,
  cleanup: Xm
};
function Gm(e) {
  let t = Ls.addDummyNode(e, "root", {}, "_root"), n = Ym(e), o = Object.values(n), s = Ls.applyWithChunking(Math.max, o) - 1, i = 2 * s + 1;
  e.graph().nestingRoot = t, e.edges().forEach((l) => e.edge(l).minlen *= i);
  let r = qm(e) + 1;
  e.children().forEach((l) => cd(e, t, i, r, s, n, l)), e.graph().nodeRankFactor = i;
}
function cd(e, t, n, o, s, i, r) {
  let l = e.children(r);
  if (!l.length) {
    r !== t && e.setEdge(t, r, { weight: 0, minlen: n });
    return;
  }
  let a = Ls.addBorderNode(e, "_bt"), c = Ls.addBorderNode(e, "_bb"), d = e.node(r);
  e.setParent(a, r), d.borderTop = a, e.setParent(c, r), d.borderBottom = c, l.forEach((f) => {
    cd(e, t, n, o, s, i, f);
    let g = e.node(f), m = g.borderTop ? g.borderTop : f, E = g.borderBottom ? g.borderBottom : f, C = g.borderTop ? o : 2 * o, x = m !== E ? 1 : s - i[r] + 1;
    e.setEdge(a, m, {
      weight: C,
      minlen: x,
      nestingEdge: !0
    }), e.setEdge(E, c, {
      weight: C,
      minlen: x,
      nestingEdge: !0
    });
  }), e.parent(r) || e.setEdge(t, a, { weight: 0, minlen: s + i[r] });
}
function Ym(e) {
  var t = {};
  function n(o, s) {
    var i = e.children(o);
    i && i.length && i.forEach((r) => n(r, s + 1)), t[o] = s;
  }
  return e.children().forEach((o) => n(o, 1)), t;
}
function qm(e) {
  return e.edges().reduce((t, n) => t + e.edge(n).weight, 0);
}
function Xm(e) {
  var t = e.graph();
  e.removeNode(t.nestingRoot), delete t.nestingRoot, e.edges().forEach((n) => {
    var o = e.edge(n);
    o.nestingEdge && e.removeEdge(n);
  });
}
let Km = Ze;
var Wm = Zm;
function Zm(e) {
  function t(n) {
    let o = e.children(n), s = e.node(n);
    if (o.length && o.forEach(t), Object.hasOwn(s, "minRank")) {
      s.borderLeft = [], s.borderRight = [];
      for (let i = s.minRank, r = s.maxRank + 1; i < r; ++i)
        ka(e, "borderLeft", "_bl", n, s, i), ka(e, "borderRight", "_br", n, s, i);
    }
  }
  e.children().forEach(t);
}
function ka(e, t, n, o, s, i) {
  let r = { width: 0, height: 0, rank: i, borderType: t }, l = s[t][i - 1], a = Km.addDummyNode(e, "border", r, n);
  s[t][i] = a, e.setParent(a, o), l && e.setEdge(l, a, { weight: 1 });
}
var Jm = {
  adjust: Qm,
  undo: ey
};
function Qm(e) {
  let t = e.graph().rankdir.toLowerCase();
  (t === "lr" || t === "rl") && dd(e);
}
function ey(e) {
  let t = e.graph().rankdir.toLowerCase();
  (t === "bt" || t === "rl") && ty(e), (t === "lr" || t === "rl") && (ny(e), dd(e));
}
function dd(e) {
  e.nodes().forEach((t) => Ea(e.node(t))), e.edges().forEach((t) => Ea(e.edge(t)));
}
function Ea(e) {
  let t = e.width;
  e.width = e.height, e.height = t;
}
function ty(e) {
  e.nodes().forEach((t) => Di(e.node(t))), e.edges().forEach((t) => {
    let n = e.edge(t);
    n.points.forEach(Di), Object.hasOwn(n, "y") && Di(n);
  });
}
function Di(e) {
  e.y = -e.y;
}
function ny(e) {
  e.nodes().forEach((t) => Ri(e.node(t))), e.edges().forEach((t) => {
    let n = e.edge(t);
    n.points.forEach(Ri), Object.hasOwn(n, "x") && Ri(n);
  });
}
function Ri(e) {
  let t = e.x;
  e.x = e.y, e.y = t;
}
let xa = Ze;
var oy = sy;
function sy(e) {
  let t = {}, n = e.nodes().filter((a) => !e.children(a).length), o = n.map((a) => e.node(a).rank), s = xa.applyWithChunking(Math.max, o), i = xa.range(s + 1).map(() => []);
  function r(a) {
    if (t[a]) return;
    t[a] = !0;
    let c = e.node(a);
    i[c.rank].push(a), e.successors(a).forEach(r);
  }
  return n.sort((a, c) => e.node(a).rank - e.node(c).rank).forEach(r), i;
}
let iy = Ze.zipObject;
var ry = ly;
function ly(e, t) {
  let n = 0;
  for (let o = 1; o < t.length; ++o)
    n += ay(e, t[o - 1], t[o]);
  return n;
}
function ay(e, t, n) {
  let o = iy(n, n.map((c, d) => d)), s = t.flatMap((c) => e.outEdges(c).map((d) => ({ pos: o[d.w], weight: e.edge(d).weight })).sort((d, f) => d.pos - f.pos)), i = 1;
  for (; i < n.length; ) i <<= 1;
  let r = 2 * i - 1;
  i -= 1;
  let l = new Array(r).fill(0), a = 0;
  return s.forEach((c) => {
    let d = c.pos + i;
    l[d] += c.weight;
    let f = 0;
    for (; d > 0; )
      d % 2 && (f += l[d + 1]), d = d - 1 >> 1, l[d] += c.weight;
    a += c.weight * f;
  }), a;
}
var uy = cy;
function cy(e, t = []) {
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
let dy = Ze;
var fy = py;
function py(e, t) {
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
  return hy(o);
}
function hy(e) {
  let t = [];
  function n(s) {
    return (i) => {
      i.merged || (i.barycenter === void 0 || s.barycenter === void 0 || i.barycenter >= s.barycenter) && vy(s, i);
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
  return t.filter((s) => !s.merged).map((s) => dy.pick(s, ["vs", "i", "barycenter", "weight"]));
}
function vy(e, t) {
  let n = 0, o = 0;
  e.weight && (n += e.barycenter * e.weight, o += e.weight), t.weight && (n += t.barycenter * t.weight, o += t.weight), e.vs = t.vs.concat(e.vs), e.barycenter = n / o, e.weight = o, e.i = Math.min(t.i, e.i), t.merged = !0;
}
let gy = Ze;
var my = yy;
function yy(e, t) {
  let n = gy.partition(e, (d) => Object.hasOwn(d, "barycenter")), o = n.lhs, s = n.rhs.sort((d, f) => f.i - d.i), i = [], r = 0, l = 0, a = 0;
  o.sort(by(!!t)), a = Sa(i, s, a), o.forEach((d) => {
    a += d.vs.length, i.push(d.vs), r += d.barycenter * d.weight, l += d.weight, a = Sa(i, s, a);
  });
  let c = { vs: i.flat(!0) };
  return l && (c.barycenter = r / l, c.weight = l), c;
}
function Sa(e, t, n) {
  let o;
  for (; t.length && (o = t[t.length - 1]).i <= n; )
    t.pop(), e.push(o.vs), n++;
  return n;
}
function by(e) {
  return (t, n) => t.barycenter < n.barycenter ? -1 : t.barycenter > n.barycenter ? 1 : e ? n.i - t.i : t.i - n.i;
}
let _y = uy, wy = fy, ky = my;
var Ey = fd;
function fd(e, t, n, o) {
  let s = e.children(t), i = e.node(t), r = i ? i.borderLeft : void 0, l = i ? i.borderRight : void 0, a = {};
  r && (s = s.filter((g) => g !== r && g !== l));
  let c = _y(e, s);
  c.forEach((g) => {
    if (e.children(g.v).length) {
      let m = fd(e, g.v, n, o);
      a[g.v] = m, Object.hasOwn(m, "barycenter") && Sy(g, m);
    }
  });
  let d = wy(c, n);
  xy(d, a);
  let f = ky(d, o);
  if (r && (f.vs = [r, f.vs, l].flat(!0), e.predecessors(r).length)) {
    let g = e.node(e.predecessors(r)[0]), m = e.node(e.predecessors(l)[0]);
    Object.hasOwn(f, "barycenter") || (f.barycenter = 0, f.weight = 0), f.barycenter = (f.barycenter * f.weight + g.order + m.order) / (f.weight + 2), f.weight += 2;
  }
  return f;
}
function xy(e, t) {
  e.forEach((n) => {
    n.vs = n.vs.flatMap((o) => t[o] ? t[o].vs : o);
  });
}
function Sy(e, t) {
  e.barycenter !== void 0 ? (e.barycenter = (e.barycenter * e.weight + t.barycenter * t.weight) / (e.weight + t.weight), e.weight += t.weight) : (e.barycenter = t.barycenter, e.weight = t.weight);
}
let Cy = Ot.Graph, $y = Ze;
var Ny = Iy;
function Iy(e, t, n) {
  let o = My(e), s = new Cy({ compound: !0 }).setGraph({ root: o }).setDefaultNodeLabel((i) => e.node(i));
  return e.nodes().forEach((i) => {
    let r = e.node(i), l = e.parent(i);
    (r.rank === t || r.minRank <= t && t <= r.maxRank) && (s.setNode(i), s.setParent(i, l || o), e[n](i).forEach((a) => {
      let c = a.v === i ? a.w : a.v, d = s.edge(c, i), f = d !== void 0 ? d.weight : 0;
      s.setEdge(c, i, { weight: e.edge(a).weight + f });
    }), Object.hasOwn(r, "minRank") && s.setNode(i, {
      borderLeft: r.borderLeft[t],
      borderRight: r.borderRight[t]
    }));
  }), s;
}
function My(e) {
  for (var t; e.hasNode(t = $y.uniqueId("_root")); ) ;
  return t;
}
var Oy = Ty;
function Ty(e, t, n) {
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
let Py = oy, Dy = ry, Ry = Ey, Ay = Ny, Vy = Oy, Ly = Ot.Graph, us = Ze;
var zy = pd;
function pd(e, t) {
  if (t && typeof t.customOrder == "function") {
    t.customOrder(e, pd);
    return;
  }
  let n = us.maxRank(e), o = Ca(e, us.range(1, n + 1), "inEdges"), s = Ca(e, us.range(n - 1, -1, -1), "outEdges"), i = Py(e);
  if ($a(e, i), t && t.disableOptimalOrderHeuristic)
    return;
  let r = Number.POSITIVE_INFINITY, l;
  for (let a = 0, c = 0; c < 4; ++a, ++c) {
    By(a % 2 ? o : s, a % 4 >= 2), i = us.buildLayerMatrix(e);
    let d = Dy(e, i);
    d < r && (c = 0, l = Object.assign({}, i), r = d);
  }
  $a(e, l);
}
function Ca(e, t, n) {
  return t.map(function(o) {
    return Ay(e, o, n);
  });
}
function By(e, t) {
  let n = new Ly();
  e.forEach(function(o) {
    let s = o.graph().root, i = Ry(o, s, n, t);
    i.vs.forEach((r, l) => o.node(r).order = l), Vy(o, n, i.vs);
  });
}
function $a(e, t) {
  Object.values(t).forEach((n) => n.forEach((o, s) => e.node(o).order = s));
}
let Fy = Ot.Graph, qt = Ze;
var Uy = {
  positionX: Qy
};
function Hy(e, t) {
  let n = {};
  function o(s, i) {
    let r = 0, l = 0, a = s.length, c = i[i.length - 1];
    return i.forEach((d, f) => {
      let g = Gy(e, d), m = g ? e.node(g).order : a;
      (g || d === c) && (i.slice(l, f + 1).forEach((E) => {
        e.predecessors(E).forEach((C) => {
          let x = e.node(C), O = x.order;
          (O < r || m < O) && !(x.dummy && e.node(E).dummy) && hd(n, C, E);
        });
      }), l = f + 1, r = m);
    }), i;
  }
  return t.length && t.reduce(o), n;
}
function jy(e, t) {
  let n = {};
  function o(i, r, l, a, c) {
    let d;
    qt.range(r, l).forEach((f) => {
      d = i[f], e.node(d).dummy && e.predecessors(d).forEach((g) => {
        let m = e.node(g);
        m.dummy && (m.order < a || m.order > c) && hd(n, g, d);
      });
    });
  }
  function s(i, r) {
    let l = -1, a, c = 0;
    return r.forEach((d, f) => {
      if (e.node(d).dummy === "border") {
        let g = e.predecessors(d);
        g.length && (a = e.node(g[0]).order, o(r, c, f, l, a), c = f, l = a);
      }
      o(r, c, r.length, a, i.length);
    }), r;
  }
  return t.length && t.reduce(s), n;
}
function Gy(e, t) {
  if (e.node(t).dummy)
    return e.predecessors(t).find((n) => e.node(n).dummy);
}
function hd(e, t, n) {
  if (t > n) {
    let s = t;
    t = n, n = s;
  }
  let o = e[t];
  o || (e[t] = o = {}), o[n] = !0;
}
function Yy(e, t, n) {
  if (t > n) {
    let o = t;
    t = n, n = o;
  }
  return !!e[t] && Object.hasOwn(e[t], n);
}
function qy(e, t, n, o) {
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
        d = d.sort((g, m) => r[g] - r[m]);
        let f = (d.length - 1) / 2;
        for (let g = Math.floor(f), m = Math.ceil(f); g <= m; ++g) {
          let E = d[g];
          i[c] === c && a < r[E] && !Yy(n, c, E) && (i[E] = c, i[c] = s[c] = s[E], a = r[E]);
        }
      }
    });
  }), { root: s, align: i };
}
function Xy(e, t, n, o, s) {
  let i = {}, r = Ky(e, t, n, s), l = s ? "borderLeft" : "borderRight";
  function a(f, g) {
    let m = r.nodes(), E = m.pop(), C = {};
    for (; E; )
      C[E] ? f(E) : (C[E] = !0, m.push(E), m = m.concat(g(E))), E = m.pop();
  }
  function c(f) {
    i[f] = r.inEdges(f).reduce((g, m) => Math.max(g, i[m.v] + r.edge(m)), 0);
  }
  function d(f) {
    let g = r.outEdges(f).reduce((E, C) => Math.min(E, i[C.w] - r.edge(C)), Number.POSITIVE_INFINITY), m = e.node(f);
    g !== Number.POSITIVE_INFINITY && m.borderType !== l && (i[f] = Math.max(i[f], g));
  }
  return a(c, r.predecessors.bind(r)), a(d, r.successors.bind(r)), Object.keys(o).forEach((f) => i[f] = i[n[f]]), i;
}
function Ky(e, t, n, o) {
  let s = new Fy(), i = e.graph(), r = e1(i.nodesep, i.edgesep, o);
  return t.forEach((l) => {
    let a;
    l.forEach((c) => {
      let d = n[c];
      if (s.setNode(d), a) {
        var f = n[a], g = s.edge(f, d);
        s.setEdge(f, d, Math.max(r(e, c, a), g || 0));
      }
      a = c;
    });
  }), s;
}
function Wy(e, t) {
  return Object.values(t).reduce((n, o) => {
    let s = Number.NEGATIVE_INFINITY, i = Number.POSITIVE_INFINITY;
    Object.entries(o).forEach(([l, a]) => {
      let c = t1(e, l) / 2;
      s = Math.max(a + c, s), i = Math.min(a - c, i);
    });
    const r = s - i;
    return r < n[0] && (n = [r, o]), n;
  }, [Number.POSITIVE_INFINITY, null])[1];
}
function Zy(e, t) {
  let n = Object.values(t), o = qt.applyWithChunking(Math.min, n), s = qt.applyWithChunking(Math.max, n);
  ["u", "d"].forEach((i) => {
    ["l", "r"].forEach((r) => {
      let l = i + r, a = e[l];
      if (a === t) return;
      let c = Object.values(a), d = o - qt.applyWithChunking(Math.min, c);
      r !== "l" && (d = s - qt.applyWithChunking(Math.max, c)), d && (e[l] = qt.mapValues(a, (f) => f + d));
    });
  });
}
function Jy(e, t) {
  return qt.mapValues(e.ul, (n, o) => {
    if (t)
      return e[t.toLowerCase()][o];
    {
      let s = Object.values(e).map((i) => i[o]).sort((i, r) => i - r);
      return (s[1] + s[2]) / 2;
    }
  });
}
function Qy(e) {
  let t = qt.buildLayerMatrix(e), n = Object.assign(
    Hy(e, t),
    jy(e, t)
  ), o = {}, s;
  ["u", "d"].forEach((r) => {
    s = r === "u" ? t : Object.values(t).reverse(), ["l", "r"].forEach((l) => {
      l === "r" && (s = s.map((f) => Object.values(f).reverse()));
      let a = (r === "u" ? e.predecessors : e.successors).bind(e), c = qy(e, s, n, a), d = Xy(
        e,
        s,
        c.root,
        c.align,
        l === "r"
      );
      l === "r" && (d = qt.mapValues(d, (f) => -f)), o[r + l] = d;
    });
  });
  let i = Wy(e, o);
  return Zy(o, i), Jy(o, e.graph().align);
}
function e1(e, t, n) {
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
function t1(e, t) {
  return e.node(t).width;
}
let vd = Ze, n1 = Uy.positionX;
var o1 = s1;
function s1(e) {
  e = vd.asNonCompoundGraph(e), i1(e), Object.entries(n1(e)).forEach(([t, n]) => e.node(t).x = n);
}
function i1(e) {
  let t = vd.buildLayerMatrix(e), n = e.graph().ranksep, o = 0;
  t.forEach((s) => {
    const i = s.reduce((r, l) => {
      const a = e.node(l).height;
      return r > a ? r : a;
    }, 0);
    s.forEach((r) => e.node(r).y = o + i / 2), o += i + n;
  });
}
let Na = lm, Ia = fm, r1 = Am, l1 = Ze.normalizeRanks, a1 = Bm, u1 = Ze.removeEmptyRanks, Ma = jm, c1 = Wm, Oa = Jm, d1 = zy, f1 = o1, St = Ze, p1 = Ot.Graph;
var h1 = v1;
function v1(e, t) {
  let n = t && t.debugTiming ? St.time : St.notime;
  n("layout", () => {
    let o = n("  buildLayoutGraph", () => S1(e));
    n("  runLayout", () => g1(o, n, t)), n("  updateInputGraph", () => m1(e, o));
  });
}
function g1(e, t, n) {
  t("    makeSpaceForEdgeLabels", () => C1(e)), t("    removeSelfEdges", () => R1(e)), t("    acyclic", () => Na.run(e)), t("    nestingGraph.run", () => Ma.run(e)), t("    rank", () => r1(St.asNonCompoundGraph(e))), t("    injectEdgeLabelProxies", () => $1(e)), t("    removeEmptyRanks", () => u1(e)), t("    nestingGraph.cleanup", () => Ma.cleanup(e)), t("    normalizeRanks", () => l1(e)), t("    assignRankMinMax", () => N1(e)), t("    removeEdgeLabelProxies", () => I1(e)), t("    normalize.run", () => Ia.run(e)), t("    parentDummyChains", () => a1(e)), t("    addBorderSegments", () => c1(e)), t("    order", () => d1(e, n)), t("    insertSelfEdges", () => A1(e)), t("    adjustCoordinateSystem", () => Oa.adjust(e)), t("    position", () => f1(e)), t("    positionSelfEdges", () => V1(e)), t("    removeBorderNodes", () => D1(e)), t("    normalize.undo", () => Ia.undo(e)), t("    fixupEdgeLabelCoords", () => T1(e)), t("    undoCoordinateSystem", () => Oa.undo(e)), t("    translateGraph", () => M1(e)), t("    assignNodeIntersects", () => O1(e)), t("    reversePoints", () => P1(e)), t("    acyclic.undo", () => Na.undo(e));
}
function m1(e, t) {
  e.nodes().forEach((n) => {
    let o = e.node(n), s = t.node(n);
    o && (o.x = s.x, o.y = s.y, o.rank = s.rank, t.children(n).length && (o.width = s.width, o.height = s.height));
  }), e.edges().forEach((n) => {
    let o = e.edge(n), s = t.edge(n);
    o.points = s.points, Object.hasOwn(s, "x") && (o.x = s.x, o.y = s.y);
  }), e.graph().width = t.graph().width, e.graph().height = t.graph().height;
}
let y1 = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"], b1 = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: "tb" }, _1 = ["acyclicer", "ranker", "rankdir", "align"], w1 = ["width", "height", "rank"], Ta = { width: 0, height: 0 }, k1 = ["minlen", "weight", "width", "height", "labeloffset"], E1 = {
  minlen: 1,
  weight: 1,
  width: 0,
  height: 0,
  labeloffset: 10,
  labelpos: "r"
}, x1 = ["labelpos"];
function S1(e) {
  let t = new p1({ multigraph: !0, compound: !0 }), n = Vi(e.graph());
  return t.setGraph(Object.assign(
    {},
    b1,
    Ai(n, y1),
    St.pick(n, _1)
  )), e.nodes().forEach((o) => {
    let s = Vi(e.node(o));
    const i = Ai(s, w1);
    Object.keys(Ta).forEach((r) => {
      i[r] === void 0 && (i[r] = Ta[r]);
    }), t.setNode(o, i), t.setParent(o, e.parent(o));
  }), e.edges().forEach((o) => {
    let s = Vi(e.edge(o));
    t.setEdge(o, Object.assign(
      {},
      E1,
      Ai(s, k1),
      St.pick(s, x1)
    ));
  }), t;
}
function C1(e) {
  let t = e.graph();
  t.ranksep /= 2, e.edges().forEach((n) => {
    let o = e.edge(n);
    o.minlen *= 2, o.labelpos.toLowerCase() !== "c" && (t.rankdir === "TB" || t.rankdir === "BT" ? o.width += o.labeloffset : o.height += o.labeloffset);
  });
}
function $1(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t);
    if (n.width && n.height) {
      let o = e.node(t.v), i = { rank: (e.node(t.w).rank - o.rank) / 2 + o.rank, e: t };
      St.addDummyNode(e, "edge-proxy", i, "_ep");
    }
  });
}
function N1(e) {
  let t = 0;
  e.nodes().forEach((n) => {
    let o = e.node(n);
    o.borderTop && (o.minRank = e.node(o.borderTop).rank, o.maxRank = e.node(o.borderBottom).rank, t = Math.max(t, o.maxRank));
  }), e.graph().maxRank = t;
}
function I1(e) {
  e.nodes().forEach((t) => {
    let n = e.node(t);
    n.dummy === "edge-proxy" && (e.edge(n.e).labelRank = n.rank, e.removeNode(t));
  });
}
function M1(e) {
  let t = Number.POSITIVE_INFINITY, n = 0, o = Number.POSITIVE_INFINITY, s = 0, i = e.graph(), r = i.marginx || 0, l = i.marginy || 0;
  function a(c) {
    let d = c.x, f = c.y, g = c.width, m = c.height;
    t = Math.min(t, d - g / 2), n = Math.max(n, d + g / 2), o = Math.min(o, f - m / 2), s = Math.max(s, f + m / 2);
  }
  e.nodes().forEach((c) => a(e.node(c))), e.edges().forEach((c) => {
    let d = e.edge(c);
    Object.hasOwn(d, "x") && a(d);
  }), t -= r, o -= l, e.nodes().forEach((c) => {
    let d = e.node(c);
    d.x -= t, d.y -= o;
  }), e.edges().forEach((c) => {
    let d = e.edge(c);
    d.points.forEach((f) => {
      f.x -= t, f.y -= o;
    }), Object.hasOwn(d, "x") && (d.x -= t), Object.hasOwn(d, "y") && (d.y -= o);
  }), i.width = n - t + r, i.height = s - o + l;
}
function O1(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t), o = e.node(t.v), s = e.node(t.w), i, r;
    n.points ? (i = n.points[0], r = n.points[n.points.length - 1]) : (n.points = [], i = s, r = o), n.points.unshift(St.intersectRect(o, i)), n.points.push(St.intersectRect(s, r));
  });
}
function T1(e) {
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
function P1(e) {
  e.edges().forEach((t) => {
    let n = e.edge(t);
    n.reversed && n.points.reverse();
  });
}
function D1(e) {
  e.nodes().forEach((t) => {
    if (e.children(t).length) {
      let n = e.node(t), o = e.node(n.borderTop), s = e.node(n.borderBottom), i = e.node(n.borderLeft[n.borderLeft.length - 1]), r = e.node(n.borderRight[n.borderRight.length - 1]);
      n.width = Math.abs(r.x - i.x), n.height = Math.abs(s.y - o.y), n.x = i.x + n.width / 2, n.y = o.y + n.height / 2;
    }
  }), e.nodes().forEach((t) => {
    e.node(t).dummy === "border" && e.removeNode(t);
  });
}
function R1(e) {
  e.edges().forEach((t) => {
    if (t.v === t.w) {
      var n = e.node(t.v);
      n.selfEdges || (n.selfEdges = []), n.selfEdges.push({ e: t, label: e.edge(t) }), e.removeEdge(t);
    }
  });
}
function A1(e) {
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
function Vi(e) {
  var t = {};
  return e && Object.entries(e).forEach(([n, o]) => {
    typeof n == "string" && (n = n.toLowerCase()), t[n] = o;
  }), t;
}
let L1 = Ze, z1 = Ot.Graph;
var B1 = {
  debugOrdering: F1
};
function F1(e) {
  let t = L1.buildLayerMatrix(e), n = new z1({ compound: !0, multigraph: !0 }).setGraph({});
  return e.nodes().forEach((o) => {
    n.setNode(o, { label: o }), n.setParent(o, "layer" + e.node(o).rank);
  }), e.edges().forEach((o) => n.setEdge(o.v, o.w, {}, o.name)), t.forEach((o, s) => {
    let i = "layer" + s;
    n.setNode(i, { rank: "same" }), o.reduce((r, l) => (n.setEdge(r, l, { style: "invis" }), l));
  }), n;
}
var U1 = "1.1.5", H1 = {
  graphlib: Ot,
  layout: h1,
  debug: B1,
  util: {
    time: Ze.time,
    notime: Ze.notime
  },
  version: U1
};
const Pa = /* @__PURE__ */ Bv(H1), Da = 190, Ra = 78, Aa = ["profile", "memory", "rag", "extensions", "voice", "live2d"];
function j1(e) {
  const t = e.nodes.find((a) => a.data.kind === "persona"), n = e.nodes.find((a) => a.data.kind === "extensions");
  if (!t || !n) return;
  const o = /* @__PURE__ */ new Map(), s = e.nodes.filter((a) => a.type === "module" && a.data.kind !== "extensions").sort((a, c) => Aa.indexOf(a.data.kind) - Aa.indexOf(c.data.kind));
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
      const g = d.shift(), m = c.get(g);
      e.edges.filter((E) => E.source === g).forEach((E) => {
        c.has(E.target) || (c.set(E.target, m + 1), d.push(E.target));
      });
    }
    const f = Math.max(0, ...c.values());
    for (let g = 1; g <= f; g += 1) {
      const m = e.nodes.filter((C) => c.get(C.id) === g).sort((C, x) => C.data.label.localeCompare(x.data.label)), E = o.get(n.id).y;
      m.forEach((C, x) => o.set(C.id, {
        x: 960 + g * 260,
        y: E + (x - (m.length - 1) / 2) * 104
      }));
    }
  }
  return {
    nodes: e.nodes.map((a) => ({ ...a, position: o.get(a.id) || a.position })),
    edges: e.edges.map((a) => ({ ...a }))
  };
}
function G1(e) {
  const t = j1(e);
  if (t) return t;
  const n = new Pa.graphlib.Graph();
  return n.setDefaultEdgeLabel(() => ({})), n.setGraph({ rankdir: "LR", nodesep: 34, ranksep: 96, marginx: 28, marginy: 28 }), [...e.nodes].sort((o, s) => o.id.localeCompare(s.id)).forEach((o) => n.setNode(o.id, { width: Da, height: Ra })), [...e.edges].sort((o, s) => o.id.localeCompare(s.id)).forEach((o) => n.setEdge(o.source, o.target)), Pa.layout(n), {
    nodes: e.nodes.map((o) => {
      const s = n.node(o.id);
      return { ...o, position: { x: s.x - Da / 2, y: s.y - Ra / 2 } };
    }),
    edges: e.edges.map((o) => ({ ...o }))
  };
}
function Y1(e, t) {
  const n = /* @__PURE__ */ new Set([t]), o = [t];
  for (; o.length; ) {
    const s = o.shift();
    for (const i of e.edges)
      i.source !== s || n.has(i.target) || (n.add(i.target), o.push(i.target));
  }
  return n;
}
function q1(e, t, n) {
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
function X1(e, t) {
  var a;
  const n = e.nodes.find((c) => c.data.kind === "persona");
  if (!n) return e;
  const o = (a = e.nodes.find((c) => c.data.kind === "extensions")) == null ? void 0 : a.id, s = new Set(
    e.edges.filter((c) => c.source === (o || n.id)).map((c) => c.target).filter((c) => e.nodes.some((d) => d.id === c && ["skill", "tool"].includes(d.data.kind)))
  ), i = q1(e, t, s), r = t === o, l = /* @__PURE__ */ new Set([
    n.id,
    ...e.nodes.filter((c) => c.type === "module").map((c) => c.id),
    ...i ? [i] : r ? s : []
  ]);
  return i && Y1(e, i).forEach((c) => l.add(c)), {
    nodes: e.nodes.filter((c) => l.has(c.id)),
    edges: e.edges.filter((c) => l.has(c.source) && l.has(c.target))
  };
}
const K1 = {
  class: "knowledge-quality",
  "aria-label": "知识质量"
}, W1 = { class: "knowledge-quality-heading" }, Z1 = ["disabled"], J1 = {
  class: "knowledge-quality-stats",
  "aria-label": "资料处理概览"
}, Q1 = { class: "knowledge-quality-report" }, eb = { class: "knowledge-quality-subheading" }, tb = {
  key: 0,
  class: "knowledge-quality-summary"
}, nb = {
  key: 1,
  class: "knowledge-quality-meta"
}, ob = { key: 0 }, sb = { key: 1 }, ib = { key: 2 }, rb = { key: 3 }, lb = {
  key: 2,
  class: "knowledge-quality-empty"
}, ab = { class: "knowledge-quality-evaluation" }, ub = { class: "knowledge-quality-subheading" }, cb = { key: 0 }, db = {
  key: 0,
  class: "knowledge-quality-summary"
}, fb = { class: "knowledge-quality-eval-facts" }, pb = { key: 0 }, hb = { key: 1 }, vb = {
  key: 1,
  class: "knowledge-quality-empty"
}, gb = {
  key: 0,
  class: "knowledge-quality-error"
}, mb = /* @__PURE__ */ Me({
  __name: "KnowledgeQualityPanel",
  props: {
    personaId: {},
    knowledgeSpaceId: {},
    documents: {},
    disabled: { type: Boolean }
  },
  setup(e) {
    const t = e, n = Q(null), o = Q([]), s = Q(!1), i = Q("");
    let r = 0;
    const l = ae(() => gv(t.documents)), a = ae(() => {
      if (!n.value) return l.value;
      const x = Number(n.value.total_documents), O = Number(n.value.indexed_count ?? n.value.indexed_documents), D = Number(n.value.in_progress_count ?? n.value.processing_documents), y = Number(n.value.failed_count ?? n.value.failed_documents);
      return [x, O, D, y].every(Number.isFinite) ? { total: x, indexed: O, processing: D, failed: y, attention: D + y } : l.value;
    }), c = ae(() => o.value[0] || null), d = ae(() => bv(n.value)), f = ae(() => {
      var O, D, y;
      const x = ((O = n.value) == null ? void 0 : O.chunk_count) ?? ((D = n.value) == null ? void 0 : D.chunks) ?? ((y = n.value) == null ? void 0 : y.total_chunks);
      return Number.isFinite(Number(x)) ? Number(x) : null;
    }), g = ae(() => {
      var x, O, D;
      return ((O = (x = c.value) == null ? void 0 : x.metrics) == null ? void 0 : O.accepted_rate) ?? ((D = c.value) == null ? void 0 : D.accepted_rate);
    }), m = ae(() => {
      var D;
      const x = (D = n.value) == null ? void 0 : D.index_version_counts;
      if (!x) return "";
      const [O] = Object.keys(x);
      return O ? `索引 ${O}` : "";
    });
    function E(x) {
      if (!x) return "";
      const O = new Date(x);
      return Number.isNaN(O.getTime()) ? x : new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(O);
    }
    async function C() {
      const x = ++r;
      if (!t.knowledgeSpaceId) {
        n.value = null, o.value = [], i.value = "";
        return;
      }
      s.value = !0, i.value = "";
      const [O, D] = await Promise.allSettled([
        Rv(t.knowledgeSpaceId),
        Av(t.personaId)
      ]);
      if (x !== r) return;
      O.status === "fulfilled" && (n.value = O.value), D.status === "fulfilled" && (o.value = D.value);
      const y = [O, D].find((w) => w.status === "rejected");
      (y == null ? void 0 : y.status) === "rejected" && (i.value = y.reason instanceof Error ? y.reason.message : String(y.reason)), s.value = !1;
    }
    return Ne(() => [t.personaId, t.knowledgeSpaceId], C), rt(C), (x, O) => {
      var D, y, w;
      return $(), T("section", K1, [
        u("header", W1, [
          O[0] || (O[0] = u("div", null, [
            u("span", null, "知识质量"),
            u("strong", null, "处理与评测")
          ], -1)),
          u("button", {
            type: "button",
            class: "knowledge-quality-refresh",
            disabled: s.value || x.disabled || !x.knowledgeSpaceId,
            title: "刷新知识质量",
            onClick: C
          }, [
            J(F(Nt), {
              size: 13,
              class: ve({ "is-spinning": s.value })
            }, null, 8, ["class"]),
            u("span", null, V(s.value ? "读取中" : "刷新"), 1)
          ], 8, Z1)
        ]),
        u("div", J1, [
          u("div", null, [
            u("strong", null, V(a.value.total), 1),
            O[1] || (O[1] = u("span", null, "资料", -1))
          ]),
          u("div", null, [
            u("strong", null, V(a.value.indexed), 1),
            O[2] || (O[2] = u("span", null, "已索引", -1))
          ]),
          u("div", {
            class: ve({ "has-attention": a.value.attention > 0 })
          }, [
            u("strong", null, V(a.value.attention), 1),
            O[3] || (O[3] = u("span", null, "需处理", -1))
          ], 2)
        ]),
        u("div", Q1, [
          u("div", eb, [
            O[4] || (O[4] = u("span", null, "处理报告", -1)),
            u("b", {
              class: ve({ "is-attention": a.value.attention > 0 })
            }, V(d.value), 3)
          ]),
          (D = n.value) != null && D.summary ? ($(), T("p", tb, V(n.value.summary), 1)) : le("", !0),
          f.value !== null || m.value ? ($(), T("p", nb, [
            f.value !== null ? ($(), T("span", ob, V(f.value) + " 个片段", 1)) : le("", !0),
            f.value !== null && m.value ? ($(), T("span", sb, " · ")) : le("", !0),
            m.value ? ($(), T("span", ib, V(m.value), 1)) : le("", !0),
            (y = n.value) != null && y.latest_updated_at || (w = n.value) != null && w.updated_at ? ($(), T("span", rb, " · " + V(E(n.value.latest_updated_at || n.value.updated_at)) + " 更新", 1)) : le("", !0)
          ])) : n.value ? le("", !0) : ($(), T("p", lb, "暂无处理报告，当前先显示资料状态。"))
        ]),
        u("div", ab, [
          u("div", ub, [
            O[5] || (O[5] = u("span", null, "最近评测", -1)),
            c.value ? ($(), T("b", cb, V(F(_v)(c.value.status)), 1)) : le("", !0)
          ]),
          c.value ? ($(), T(be, { key: 0 }, [
            c.value.summary ? ($(), T("p", db, V(c.value.summary), 1)) : le("", !0),
            u("div", fb, [
              g.value !== void 0 && g.value !== null ? ($(), T("span", pb, [
                O[6] || (O[6] = he("通过率 ")),
                u("strong", null, V(F(yv)(g.value)), 1)
              ])) : le("", !0),
              c.value.created_at ? ($(), T("span", hb, V(E(c.value.created_at)), 1)) : le("", !0)
            ])
          ], 64)) : ($(), T("p", vb, "暂无已保存评测，可从下方进入完整 RAG 评测。"))
        ]),
        i.value ? ($(), T("p", gb, "读取质量数据失败：" + V(i.value), 1)) : le("", !0)
      ]);
    };
  }
}), yb = ["aria-busy"], bb = {
  key: 0,
  class: "inspect-fields"
}, _b = ["value"], wb = ["value"], kb = ["value"], Eb = { class: "inspect-fieldset" }, xb = ["value"], Sb = ["value"], Cb = ["value"], $b = ["value"], Nb = ["value"], Ib = { class: "inline-check" }, Mb = ["checked"], Ob = {
  key: 1,
  class: "inspect-stack rag-inspector"
}, Tb = ["disabled"], Pb = {
  key: 0,
  class: "pending-files"
}, Db = ["onClick"], Rb = ["onClick"], Ab = ["disabled"], Vb = { class: "document-items" }, Lb = { class: "document-actions" }, zb = ["onClick"], Bb = ["onClick"], Fb = ["onClick"], Ub = {
  key: 2,
  class: "inspect-stack"
}, Hb = {
  key: 3,
  class: "inspect-stack"
}, jb = {
  key: 4,
  class: "inspect-fields"
}, Gb = { class: "inline-check" }, Yb = ["checked"], qb = { class: "inline-check" }, Xb = ["checked"], Kb = ["value"], Wb = ["value"], Zb = ["value"], Jb = { class: "inspect-button-row" }, Qb = ["disabled"], e0 = {
  key: 5,
  class: "live2d-model-library"
}, t0 = { class: "live2d-binding-summary" }, n0 = ["disabled"], o0 = { class: "live2d-library-actions" }, s0 = ["disabled"], i0 = ["disabled"], r0 = { class: "live2d-model-heading" }, l0 = {
  key: 0,
  class: "live2d-model-items"
}, a0 = { class: "live2d-model-copy" }, u0 = { class: "live2d-model-state" }, c0 = {
  key: 0,
  type: "button",
  disabled: "",
  class: "is-bound"
}, d0 = ["disabled", "title", "onClick"], f0 = {
  key: 1,
  class: "live2d-model-empty"
}, p0 = {
  key: 6,
  class: "inspect-fields"
}, h0 = { key: 0 }, v0 = ["value"], g0 = { key: 1 }, m0 = {
  key: 2,
  class: "dependency-list"
}, y0 = {
  key: 7,
  class: "inspect-fields"
}, b0 = { class: "inline-check" }, _0 = ["checked", "disabled"], w0 = /* @__PURE__ */ Me({
  __name: "NodeInspector",
  props: {
    node: {},
    draft: {},
    disabled: { type: Boolean },
    uploadCompleteToken: {}
  },
  emits: ["profile", "capability", "server", "upload", "deleteDocument", "retryDocument", "deletePersona", "previewVoice", "openVoiceStudio", "openRagEval", "previewDocument", "previewLocalFile", "refreshLive2d", "openLive2dDirectory"],
  setup(e, { emit: t }) {
    const n = e, o = t, s = Q([]), i = Q(""), r = Q(0), l = ae(() => {
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
    }), f = ae(() => {
      var G, P;
      return String(((P = (G = n.draft.persona.profile) == null ? void 0 : G.live2d) == null ? void 0 : P.model) || "");
    }), g = ae(() => {
      var G;
      return ((G = n.draft.resources) == null ? void 0 : G.live2dModels) || [];
    }), m = ae(() => {
      var G;
      return { available: "可用", partial: "部分可用", unassigned: "未分配", blocked: "不可用", pending: "等待中", error: "异常" }[((G = n.node) == null ? void 0 : G.data.status) || "blocked"];
    });
    function E(G) {
      return G.kind === "cubism2" ? "Cubism 2" : G.moc_version ? `MOC3 v${G.moc_version}` : "Cubism / MOC3";
    }
    function C(G, P) {
      const L = Je(n.draft.persona), q = { ...L.profile || {} };
      G === "name" ? L.name = String(P) : q[G] = P, L.profile = q, o("profile", L);
    }
    function x(G, P) {
      const L = Je(n.draft.persona), q = { ...L.profile || {} };
      q.tts = { ...q.tts || {}, [G]: P }, L.profile = q, o("profile", L);
    }
    function O(G) {
      const P = Je(n.draft.persona), L = { ...P.profile || {} };
      L.live2d = { ...L.live2d || {}, model: G }, P.profile = L, o("profile", P);
    }
    const D = ae(() => {
      var G;
      return ((G = n.draft.persona.profile) == null ? void 0 : G.rag) || {};
    });
    function y(G, P) {
      const L = Je(n.draft.persona), q = { ...L.profile || {} };
      q.rag = { ...q.rag || {}, [G]: P }, L.profile = q, o("profile", L);
    }
    function w(G) {
      s.value = Array.from(G.target.files || []);
    }
    function z(G) {
      var P;
      s.value = Array.from(((P = G.dataTransfer) == null ? void 0 : P.files) || []);
    }
    function U(G) {
      s.value = s.value.filter((P, L) => L !== G);
    }
    function W() {
      n.disabled || !s.value.length && !i.value.trim() || o("upload", s.value, i.value);
    }
    return Ne(() => n.uploadCompleteToken, () => {
      s.value = [], i.value = "", r.value += 1;
    }), (G, P) => {
      var L, q, H, K, S, A, M, R, j, ne, re, ue, se, fe, ce, ge;
      return $(), T("aside", {
        class: ve(["node-inspector", { "is-disabled": G.disabled }]),
        "aria-busy": G.disabled
      }, [
        u("header", null, [
          u("div", null, [
            u("strong", null, V(((L = G.node) == null ? void 0 : L.data.label) || "角色配置"), 1),
            u("small", null, V((q = G.node) == null ? void 0 : q.data.summary), 1)
          ]),
          G.node ? ($(), T("span", {
            key: 0,
            class: ve(`inspect-status status-${G.node.data.status}`)
          }, V(m.value), 3)) : le("", !0)
        ]),
        l.value === "profile" ? ($(), T("div", bb, [
          u("label", null, [
            P[24] || (P[24] = u("span", null, "角色名称", -1)),
            u("input", {
              value: G.draft.persona.name,
              onInput: P[0] || (P[0] = (ee) => C("name", ee.target.value))
            }, null, 40, _b)
          ]),
          u("label", null, [
            P[25] || (P[25] = u("span", null, "角色人设", -1)),
            u("textarea", {
              rows: "7",
              value: String(((H = G.draft.persona.profile) == null ? void 0 : H.description) || ""),
              onInput: P[1] || (P[1] = (ee) => C("description", ee.target.value))
            }, null, 40, wb)
          ]),
          u("label", null, [
            P[27] || (P[27] = u("span", null, "回复语言", -1)),
            u("select", {
              value: String(((K = G.draft.persona.profile) == null ? void 0 : K.reply_language) || ""),
              onChange: P[2] || (P[2] = (ee) => C("reply_language", ee.target.value))
            }, P[26] || (P[26] = [
              u("option", { value: "" }, "跟随对话", -1),
              u("option", { value: "zh" }, "中文", -1),
              u("option", { value: "ja" }, "日语", -1),
              u("option", { value: "en" }, "英语", -1)
            ]), 40, kb)
          ]),
          u("fieldset", Eb, [
            P[35] || (P[35] = u("legend", null, "知识检索", -1)),
            u("label", null, [
              P[29] || (P[29] = u("span", null, "检索预设", -1)),
              u("select", {
                value: String(D.value.profile || "deep"),
                onChange: P[3] || (P[3] = (ee) => y("profile", ee.target.value))
              }, P[28] || (P[28] = [
                u("option", { value: "precise" }, "精准检索", -1),
                u("option", { value: "deep" }, "深度检索", -1),
                u("option", { value: "custom" }, "自定义", -1)
              ]), 40, xb)
            ]),
            D.value.profile === "custom" ? ($(), T(be, { key: 0 }, [
              u("label", null, [
                P[30] || (P[30] = u("span", null, "初始召回 K", -1)),
                u("input", {
                  type: "number",
                  min: "1",
                  max: "100",
                  value: D.value.retrieval_k || 20,
                  onChange: P[4] || (P[4] = (ee) => y("retrieval_k", Number(ee.target.value)))
                }, null, 40, Sb)
              ]),
              u("label", null, [
                P[31] || (P[31] = u("span", null, "重排保留 K", -1)),
                u("input", {
                  type: "number",
                  min: "1",
                  max: "100",
                  value: D.value.rerank_k || 8,
                  onChange: P[5] || (P[5] = (ee) => y("rerank_k", Number(ee.target.value)))
                }, null, 40, Cb)
              ]),
              u("label", null, [
                P[32] || (P[32] = u("span", null, "最终上下文 K", -1)),
                u("input", {
                  type: "number",
                  min: "1",
                  max: "30",
                  value: D.value.final_context_k || 8,
                  onChange: P[6] || (P[6] = (ee) => y("final_context_k", Number(ee.target.value)))
                }, null, 40, $b)
              ]),
              u("label", null, [
                P[33] || (P[33] = u("span", null, "证据 Token 预算", -1)),
                u("input", {
                  type: "number",
                  min: "256",
                  max: "20000",
                  step: "256",
                  value: D.value.evidence_token_budget || 4500,
                  onChange: P[7] || (P[7] = (ee) => y("evidence_token_budget", Number(ee.target.value)))
                }, null, 40, Nb)
              ]),
              u("label", Ib, [
                u("input", {
                  type: "checkbox",
                  checked: D.value.allow_neighbors !== !1,
                  onChange: P[8] || (P[8] = (ee) => y("allow_neighbors", ee.target.checked))
                }, null, 40, Mb),
                P[34] || (P[34] = u("span", null, "允许补充相邻片段", -1))
              ])
            ], 64)) : le("", !0),
            P[36] || (P[36] = u("small", null, "查询时直接使用这里保存的参数，不额外调用模型判断检索模式。", -1))
          ]),
          u("button", {
            type: "button",
            class: "inspect-danger",
            onClick: P[9] || (P[9] = (ee) => o("deletePersona"))
          }, [
            J(F(en), { size: 15 }),
            P[37] || (P[37] = he("删除当前角色"))
          ])
        ])) : l.value === "rag" ? ($(), T("div", Ob, [
          u("p", null, V(G.draft.documents.length) + " 份资料已关联到角色知识空间。", 1),
          u("label", {
            class: "document-picker",
            onDragover: P[10] || (P[10] = gt(() => {
            }, ["prevent"])),
            onDrop: gt(z, ["prevent"])
          }, [
            J(F(cr), { size: 15 }),
            u("span", null, V(s.value.length ? `已选择 ${s.value.length} 个文件` : "选择或拖入资料文件"), 1),
            ($(), T("input", {
              key: r.value,
              type: "file",
              multiple: "",
              disabled: G.disabled,
              onChange: w
            }, null, 40, Tb))
          ], 32),
          s.value.length ? ($(), T("ul", Pb, [
            ($(!0), T(be, null, Te(s.value, (ee, _e) => ($(), T("li", {
              key: `${ee.name}-${ee.size}-${_e}`
            }, [
              u("span", null, V(ee.name), 1),
              u("span", null, [
                u("button", {
                  type: "button",
                  title: "上传前预览",
                  onClick: (xe) => o("previewLocalFile", ee)
                }, [
                  J(F(da), { size: 14 })
                ], 8, Db),
                u("button", {
                  type: "button",
                  title: "移除",
                  onClick: (xe) => U(_e)
                }, [
                  J(F(en), { size: 14 })
                ], 8, Rb)
              ])
            ]))), 128))
          ])) : le("", !0),
          u("label", null, [
            P[38] || (P[38] = u("span", null, "补充文本", -1)),
            Ce(u("textarea", {
              "onUpdate:modelValue": P[11] || (P[11] = (ee) => i.value = ee),
              rows: "3",
              placeholder: "直接写入角色知识库"
            }, null, 512), [
              [Le, i.value]
            ])
          ]),
          u("button", {
            type: "button",
            class: "inspect-action",
            disabled: G.disabled || !s.value.length && !i.value.trim(),
            onClick: W
          }, [
            J(F(cr), { size: 15 }),
            he(V(G.disabled ? "处理中" : "写入知识库"), 1)
          ], 8, Ab),
          u("ul", Vb, [
            ($(!0), T(be, null, Te(G.draft.documents, (ee) => ($(), T("li", {
              key: String(ee.id)
            }, [
              u("div", null, [
                u("b", null, V(ee.original_filename || ee.original_name || ee.id), 1),
                u("span", null, V(ee.status), 1)
              ]),
              u("span", Lb, [
                u("button", {
                  type: "button",
                  title: "预览 Markdown",
                  onClick: (_e) => o("previewDocument", ee)
                }, [
                  J(F(da), { size: 14 })
                ], 8, zb),
                ee.status === "index_failed" ? ($(), T("button", {
                  key: 0,
                  type: "button",
                  title: "重新索引",
                  onClick: (_e) => o("retryDocument", String(ee.id))
                }, [
                  J(F(Kr), { size: 14 })
                ], 8, Bb)) : le("", !0),
                u("button", {
                  type: "button",
                  title: "删除资料",
                  onClick: (_e) => o("deleteDocument", String(ee.id))
                }, [
                  J(F(en), { size: 14 })
                ], 8, Fb)
              ])
            ]))), 128))
          ]),
          J(mb, {
            "persona-id": G.draft.persona.id,
            "knowledge-space-id": G.draft.persona.knowledge_space_id,
            documents: G.draft.documents,
            disabled: G.disabled
          }, null, 8, ["persona-id", "knowledge-space-id", "documents", "disabled"]),
          u("button", {
            type: "button",
            class: "inspect-action",
            onClick: P[12] || (P[12] = (ee) => o("openRagEval"))
          }, [
            J(F(lr), { size: 15 }),
            P[39] || (P[39] = he("前往 RAG 评测"))
          ])
        ])) : l.value === "memory" ? ($(), T("div", Ub, P[40] || (P[40] = [
          u("p", null, "会话记忆按对话窗口隔离，长期记忆与角色绑定。", -1),
          u("small", null, "清理操作继续在对应对话或接入窗口执行，避免误清其他会话。", -1)
        ]))) : l.value === "extensions" ? ($(), T("div", Hb, [
          u("p", null, "当前角色可配置 " + V(G.draft.capabilities.packages.length) + " 项扩展能力。", 1),
          P[41] || (P[41] = u("small", null, "选择画布中的 Skill 或 Tool 查看依赖并设置角色策略；依赖只在选中时展开。", -1))
        ])) : l.value === "voice" ? ($(), T("div", jb, [
          u("label", Gb, [
            u("input", {
              type: "checkbox",
              checked: !!((A = (S = G.draft.persona.profile) == null ? void 0 : S.tts) != null && A.enabled),
              onChange: P[13] || (P[13] = (ee) => x("enabled", ee.target.checked))
            }, null, 40, Yb),
            P[42] || (P[42] = u("span", null, "生成语音", -1))
          ]),
          u("label", qb, [
            u("input", {
              type: "checkbox",
              checked: !!((R = (M = G.draft.persona.profile) == null ? void 0 : M.tts) != null && R.auto_play),
              onChange: P[14] || (P[14] = (ee) => x("auto_play", ee.target.checked))
            }, null, 40, Xb),
            P[43] || (P[43] = u("span", null, "自动播放", -1))
          ]),
          u("label", null, [
            P[45] || (P[45] = u("span", null, "角色音色", -1)),
            u("select", {
              value: String(((ne = (j = G.draft.persona.profile) == null ? void 0 : j.tts) == null ? void 0 : ne.voice_asset_id) || ""),
              onChange: P[15] || (P[15] = (ee) => x("voice_asset_id", ee.target.value))
            }, [
              P[44] || (P[44] = u("option", { value: "" }, "不绑定音色", -1)),
              ($(!0), T(be, null, Te((re = G.draft.resources) == null ? void 0 : re.voiceAssets, (ee) => ($(), T("option", {
                key: ee.id,
                value: ee.id
              }, V(ee.name), 9, Wb))), 128))
            ], 40, Kb)
          ]),
          u("label", null, [
            P[47] || (P[47] = u("span", null, "输出语言", -1)),
            u("select", {
              value: String(((se = (ue = G.draft.persona.profile) == null ? void 0 : ue.tts) == null ? void 0 : se.output_language) || "auto"),
              onChange: P[16] || (P[16] = (ee) => x("output_language", ee.target.value))
            }, P[46] || (P[46] = [
              u("option", { value: "auto" }, "自动", -1),
              u("option", { value: "zh" }, "中文", -1),
              u("option", { value: "ja" }, "日语", -1),
              u("option", { value: "en" }, "英语", -1)
            ]), 40, Zb)
          ]),
          u("div", Jb, [
            u("button", {
              type: "button",
              class: "inspect-action",
              disabled: !((ce = (fe = G.draft.persona.profile) == null ? void 0 : fe.tts) != null && ce.voice_asset_id),
              onClick: P[17] || (P[17] = (ee) => o("previewVoice"))
            }, [
              J(F(Bc), { size: 15 }),
              P[48] || (P[48] = he("试听"))
            ], 8, Qb),
            u("button", {
              type: "button",
              class: "inspect-action",
              onClick: P[18] || (P[18] = (ee) => o("openVoiceStudio"))
            }, [
              J(F(lr), { size: 15 }),
              P[49] || (P[49] = he("声音工坊"))
            ])
          ])
        ])) : l.value === "live2d" ? ($(), T("div", e0, [
          u("section", t0, [
            P[50] || (P[50] = u("span", null, "当前角色绑定", -1)),
            u("strong", null, V(f.value || "未绑定模型"), 1),
            f.value ? ($(), T("button", {
              key: 0,
              type: "button",
              disabled: G.disabled,
              onClick: P[19] || (P[19] = (ee) => O(""))
            }, "解除绑定", 8, n0)) : le("", !0)
          ]),
          u("div", o0, [
            u("button", {
              type: "button",
              disabled: G.disabled,
              title: "重新扫描模型",
              onClick: P[20] || (P[20] = (ee) => o("refreshLive2d"))
            }, [
              J(F(Nt), { size: 15 }),
              P[51] || (P[51] = he("刷新"))
            ], 8, s0),
            u("button", {
              type: "button",
              disabled: G.disabled,
              title: "打开 Live2D 模型文件夹",
              onClick: P[21] || (P[21] = (ee) => o("openLive2dDirectory"))
            }, [
              J(F(Do), { size: 15 }),
              P[52] || (P[52] = he("打开文件夹"))
            ], 8, i0)
          ]),
          u("div", r0, [
            P[53] || (P[53] = u("strong", null, "已安装模型", -1)),
            u("span", null, V(g.value.length) + " 个", 1)
          ]),
          g.value.length ? ($(), T("ul", l0, [
            ($(!0), T(be, null, Te(g.value, (ee) => ($(), T("li", {
              key: ee.id,
              class: ve({ bound: f.value === ee.id, incompatible: ee.compatible === !1 })
            }, [
              u("div", a0, [
                u("strong", null, V(ee.name), 1),
                u("span", null, V(E(ee)), 1)
              ]),
              u("div", u0, [
                u("span", {
                  class: ve(ee.compatible === !1 ? "is-error" : "is-compatible")
                }, V(ee.compatible === !1 ? "不兼容" : "兼容"), 3),
                f.value === ee.id ? ($(), T("button", c0, [
                  J(F(ao), { size: 14 }),
                  P[54] || (P[54] = he("已绑定"))
                ])) : ($(), T("button", {
                  key: 1,
                  type: "button",
                  disabled: G.disabled || ee.compatible === !1,
                  title: ee.compatible === !1 ? "当前 Live2D 运行时不支持此 MOC3 版本" : `绑定 ${ee.name}`,
                  onClick: (_e) => O(ee.id)
                }, "绑定", 8, d0))
              ])
            ], 2))), 128))
          ])) : ($(), T("div", f0, P[55] || (P[55] = [
            u("strong", null, "尚未发现模型", -1),
            u("p", null, "将模型文件夹放入 data/live2d 后刷新。", -1)
          ]))),
          P[56] || (P[56] = u("p", { class: "live2d-save-hint" }, "绑定修改会随页面顶部“保存配置”一起生效。", -1))
        ])) : l.value === "skill" || l.value === "tool" ? ($(), T("div", p0, [
          a.value ? ($(), T("label", h0, [
            P[58] || (P[58] = u("span", null, "角色策略", -1)),
            u("select", {
              value: d.value,
              onChange: P[22] || (P[22] = (ee) => o("capability", G.node.id, ee.target.value))
            }, P[57] || (P[57] = [
              u("option", { value: "inherit" }, "继承默认", -1),
              u("option", { value: "allow" }, "允许", -1),
              u("option", { value: "deny" }, "禁用", -1)
            ]), 40, v0)
          ])) : ($(), T("p", g0, "此 Tool 由上级能力包管理，不单独保存开关。")),
          a.value ? ($(), T("div", m0, [
            P[59] || (P[59] = u("b", null, "依赖", -1)),
            ($(!0), T(be, null, Te(a.value.dependencies, (ee) => ($(), T("p", {
              key: ee.id || ee.name
            }, [
              u("span", null, V(ee.name), 1),
              u("em", null, V(ee.server || ee.source), 1)
            ]))), 128))
          ])) : le("", !0)
        ])) : l.value === "mcp" && c.value ? ($(), T("div", y0, [
          u("label", b0, [
            u("input", {
              type: "checkbox",
              checked: c.value.authorized,
              disabled: c.value.global,
              onChange: P[23] || (P[23] = (ee) => o("server", c.value.name, ee.target.checked))
            }, null, 40, _0),
            u("span", null, V(c.value.global ? "全局授权" : "允许当前角色使用"), 1)
          ]),
          u("p", null, V(c.value.description || "MCP 服务"), 1),
          u("small", null, "连接状态：" + V(((ge = c.value.status) == null ? void 0 : ge.status) || "unknown"), 1)
        ])) : le("", !0)
      ], 10, yb);
    };
  }
});
function ai(e) {
  return Rr() ? (_s(e), !0) : !1;
}
function Xt(e) {
  return typeof e == "function" ? e() : F(e);
}
const k0 = typeof window < "u" && typeof document < "u", E0 = (e) => typeof e < "u", x0 = Object.prototype.toString, S0 = (e) => x0.call(e) === "[object Object]", C0 = () => {
};
function $0(e, t) {
  function n(...o) {
    return new Promise((s, i) => {
      Promise.resolve(e(() => t.apply(this, o), { fn: t, thisArg: this, args: o })).then(s).catch(i);
    });
  }
  return n;
}
const gd = (e) => e();
function N0(e = gd) {
  const t = Q(!0);
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
function I0(e, t, n = {}) {
  const {
    eventFilter: o = gd,
    ...s
  } = n;
  return Ne(
    e,
    $0(
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
  } = n, { eventFilter: i, pause: r, resume: l, isActive: a } = N0(o);
  return { stop: I0(
    e,
    t,
    {
      ...s,
      eventFilter: i
    }
  ), pause: r, resume: l, isActive: a };
}
function M0(e, t = {}) {
  if (!Xe(e))
    return dp(e);
  const n = Array.isArray(e.value) ? Array.from({ length: e.value.length }) : {};
  for (const o in e.value)
    n[o] = cp(() => ({
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
  function n(f, { flush: g = "sync", deep: m = !1, timeout: E, throwOnTimeout: C } = {}) {
    let x = null;
    const D = [new Promise((y) => {
      x = Ne(
        e,
        (w) => {
          f(w) !== t && (x == null || x(), y(w));
        },
        {
          flush: g,
          deep: m,
          immediate: !0
        }
      );
    })];
    return E != null && D.push(
      Va(E, C).then(() => Xt(e)).finally(() => x == null ? void 0 : x())
    ), Promise.race(D);
  }
  function o(f, g) {
    if (!Xe(f))
      return n((w) => w === f, g);
    const { flush: m = "sync", deep: E = !1, timeout: C, throwOnTimeout: x } = g ?? {};
    let O = null;
    const y = [new Promise((w) => {
      O = Ne(
        [e, f],
        ([z, U]) => {
          t !== (z === U) && (O == null || O(), w(z));
        },
        {
          flush: m,
          deep: E,
          immediate: !0
        }
      );
    })];
    return C != null && y.push(
      Va(C, x).then(() => Xt(e)).finally(() => (O == null || O(), Xt(e)))
    ), Promise.race(y);
  }
  function s(f) {
    return n((g) => !!g, f);
  }
  function i(f) {
    return o(null, f);
  }
  function r(f) {
    return o(void 0, f);
  }
  function l(f) {
    return n(Number.isNaN, f);
  }
  function a(f, g) {
    return n((m) => {
      const E = Array.from(m);
      return E.includes(f) || E.includes(Xt(f));
    }, g);
  }
  function c(f) {
    return d(1, f);
  }
  function d(f = 1, g) {
    let m = -1;
    return n(() => (m += 1, m >= f), g);
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
function O0(e) {
  var t;
  const n = Xt(e);
  return (t = n == null ? void 0 : n.$el) != null ? t : n;
}
const md = k0 ? window : void 0;
function yd(...e) {
  let t, n, o, s;
  if (typeof e[0] == "string" || Array.isArray(e[0]) ? ([n, o, s] = e, t = md) : [t, n, o, s] = e, !t)
    return C0;
  Array.isArray(n) || (n = [n]), Array.isArray(o) || (o = [o]);
  const i = [], r = () => {
    i.forEach((d) => d()), i.length = 0;
  }, l = (d, f, g, m) => (d.addEventListener(f, g, m), () => d.removeEventListener(f, g, m)), a = Ne(
    () => [O0(t), Xt(s)],
    ([d, f]) => {
      if (r(), !d)
        return;
      const g = S0(f) ? { ...f } : f;
      i.push(
        ...n.flatMap((m) => o.map((E) => l(d, m, E, g)))
      );
    },
    { immediate: !0, flush: "post" }
  ), c = () => {
    a(), r();
  };
  return ai(c), c;
}
function T0(e) {
  return typeof e == "function" ? e : typeof e == "string" ? (t) => t.key === e : Array.isArray(e) ? (t) => e.includes(t.key) : () => !0;
}
function La(...e) {
  let t, n, o = {};
  e.length === 3 ? (t = e[0], n = e[1], o = e[2]) : e.length === 2 ? typeof e[1] == "object" ? (t = !0, n = e[0], o = e[1]) : (t = e[0], n = e[1]) : (t = !0, n = e[0]);
  const {
    target: s = md,
    eventName: i = "keydown",
    passive: r = !1,
    dedupe: l = !1
  } = o, a = T0(t);
  return yd(s, i, (d) => {
    d.repeat && Xt(l) || a(d) && n(d);
  }, r);
}
function P0(e) {
  return JSON.parse(JSON.stringify(e));
}
function Li(e, t, n, o = {}) {
  var s, i, r;
  const {
    clone: l = !1,
    passive: a = !1,
    eventName: c,
    deep: d = !1,
    defaultValue: f,
    shouldEmit: g
  } = o, m = ho(), E = n || (m == null ? void 0 : m.emit) || ((s = m == null ? void 0 : m.$emit) == null ? void 0 : s.bind(m)) || ((r = (i = m == null ? void 0 : m.proxy) == null ? void 0 : i.$emit) == null ? void 0 : r.bind(m == null ? void 0 : m.proxy));
  let C = c;
  t || (t = "modelValue"), C = C || `update:${t.toString()}`;
  const x = (y) => l ? typeof l == "function" ? l(y) : P0(y) : y, O = () => E0(e[t]) ? x(e[t]) : f, D = (y) => {
    g ? g(y) && E(C, y) : E(C, y);
  };
  if (a) {
    const y = O(), w = Q(y);
    let z = !1;
    return Ne(
      () => e[t],
      (U) => {
        z || (z = !0, w.value = x(U), nt(() => z = !1));
      }
    ), Ne(
      w,
      (U) => {
        !z && (U !== e[t] || d) && D(U);
      },
      { deep: d }
    ), w;
  } else
    return ae({
      get() {
        return O();
      },
      set(y) {
        D(y);
      }
    });
}
var D0 = { value: () => {
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
function R0(e, t) {
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
    var n = this._, o = R0(e + "", n), s, i = -1, r = o.length;
    if (arguments.length < 2) {
      for (; ++i < r; )
        if ((s = (e = o[i]).type) && (s = A0(n[s], e.name)))
          return s;
      return;
    }
    if (t != null && typeof t != "function")
      throw new Error("invalid callback: " + t);
    for (; ++i < r; )
      if (s = (e = o[i]).type)
        n[s] = za(n[s], e.name, t);
      else if (t == null)
        for (s in n)
          n[s] = za(n[s], e.name, null);
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
function A0(e, t) {
  for (var n = 0, o = e.length, s; n < o; ++n)
    if ((s = e[n]).name === t)
      return s.value;
}
function za(e, t, n) {
  for (var o = 0, s = e.length; o < s; ++o)
    if (e[o].name === t) {
      e[o] = D0, e = e.slice(0, o).concat(e.slice(o + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var gr = "http://www.w3.org/1999/xhtml";
const Ba = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: gr,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function ci(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), Ba.hasOwnProperty(t) ? { space: Ba[t], local: e } : e;
}
function V0(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === gr && t.documentElement.namespaceURI === gr ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function L0(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function bd(e) {
  var t = ci(e);
  return (t.local ? L0 : V0)(t);
}
function z0() {
}
function tl(e) {
  return e == null ? z0 : function() {
    return this.querySelector(e);
  };
}
function B0(e) {
  typeof e != "function" && (e = tl(e));
  for (var t = this._groups, n = t.length, o = new Array(n), s = 0; s < n; ++s)
    for (var i = t[s], r = i.length, l = o[s] = new Array(r), a, c, d = 0; d < r; ++d)
      (a = i[d]) && (c = e.call(a, a.__data__, d, i)) && ("__data__" in a && (c.__data__ = a.__data__), l[d] = c);
  return new kt(o, this._parents);
}
function F0(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function U0() {
  return [];
}
function _d(e) {
  return e == null ? U0 : function() {
    return this.querySelectorAll(e);
  };
}
function H0(e) {
  return function() {
    return F0(e.apply(this, arguments));
  };
}
function j0(e) {
  typeof e == "function" ? e = H0(e) : e = _d(e);
  for (var t = this._groups, n = t.length, o = [], s = [], i = 0; i < n; ++i)
    for (var r = t[i], l = r.length, a, c = 0; c < l; ++c)
      (a = r[c]) && (o.push(e.call(a, a.__data__, c, r)), s.push(a));
  return new kt(o, s);
}
function wd(e) {
  return function() {
    return this.matches(e);
  };
}
function kd(e) {
  return function(t) {
    return t.matches(e);
  };
}
var G0 = Array.prototype.find;
function Y0(e) {
  return function() {
    return G0.call(this.children, e);
  };
}
function q0() {
  return this.firstElementChild;
}
function X0(e) {
  return this.select(e == null ? q0 : Y0(typeof e == "function" ? e : kd(e)));
}
var K0 = Array.prototype.filter;
function W0() {
  return Array.from(this.children);
}
function Z0(e) {
  return function() {
    return K0.call(this.children, e);
  };
}
function J0(e) {
  return this.selectAll(e == null ? W0 : Z0(typeof e == "function" ? e : kd(e)));
}
function Q0(e) {
  typeof e != "function" && (e = wd(e));
  for (var t = this._groups, n = t.length, o = new Array(n), s = 0; s < n; ++s)
    for (var i = t[s], r = i.length, l = o[s] = [], a, c = 0; c < r; ++c)
      (a = i[c]) && e.call(a, a.__data__, c, i) && l.push(a);
  return new kt(o, this._parents);
}
function Ed(e) {
  return new Array(e.length);
}
function e_() {
  return new kt(this._enter || this._groups.map(Ed), this._parents);
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
function t_(e) {
  return function() {
    return e;
  };
}
function n_(e, t, n, o, s, i) {
  for (var r = 0, l, a = t.length, c = i.length; r < c; ++r)
    (l = t[r]) ? (l.__data__ = i[r], o[r] = l) : n[r] = new zs(e, i[r]);
  for (; r < a; ++r)
    (l = t[r]) && (s[r] = l);
}
function o_(e, t, n, o, s, i, r) {
  var l, a, c = /* @__PURE__ */ new Map(), d = t.length, f = i.length, g = new Array(d), m;
  for (l = 0; l < d; ++l)
    (a = t[l]) && (g[l] = m = r.call(a, a.__data__, l, t) + "", c.has(m) ? s[l] = a : c.set(m, a));
  for (l = 0; l < f; ++l)
    m = r.call(e, i[l], l, i) + "", (a = c.get(m)) ? (o[l] = a, a.__data__ = i[l], c.delete(m)) : n[l] = new zs(e, i[l]);
  for (l = 0; l < d; ++l)
    (a = t[l]) && c.get(g[l]) === a && (s[l] = a);
}
function s_(e) {
  return e.__data__;
}
function i_(e, t) {
  if (!arguments.length)
    return Array.from(this, s_);
  var n = t ? o_ : n_, o = this._parents, s = this._groups;
  typeof e != "function" && (e = t_(e));
  for (var i = s.length, r = new Array(i), l = new Array(i), a = new Array(i), c = 0; c < i; ++c) {
    var d = o[c], f = s[c], g = f.length, m = r_(e.call(d, d && d.__data__, c, o)), E = m.length, C = l[c] = new Array(E), x = r[c] = new Array(E), O = a[c] = new Array(g);
    n(d, f, C, x, O, m, t);
    for (var D = 0, y = 0, w, z; D < E; ++D)
      if (w = C[D]) {
        for (D >= y && (y = D + 1); !(z = x[y]) && ++y < E; )
          ;
        w._next = z || null;
      }
  }
  return r = new kt(r, o), r._enter = l, r._exit = a, r;
}
function r_(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function l_() {
  return new kt(this._exit || this._groups.map(Ed), this._parents);
}
function a_(e, t, n) {
  var o = this.enter(), s = this, i = this.exit();
  return typeof e == "function" ? (o = e(o), o && (o = o.selection())) : o = o.append(e + ""), t != null && (s = t(s), s && (s = s.selection())), n == null ? i.remove() : n(i), o && s ? o.merge(s).order() : s;
}
function u_(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, o = t._groups, s = n.length, i = o.length, r = Math.min(s, i), l = new Array(s), a = 0; a < r; ++a)
    for (var c = n[a], d = o[a], f = c.length, g = l[a] = new Array(f), m, E = 0; E < f; ++E)
      (m = c[E] || d[E]) && (g[E] = m);
  for (; a < s; ++a)
    l[a] = n[a];
  return new kt(l, this._parents);
}
function c_() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var o = e[t], s = o.length - 1, i = o[s], r; --s >= 0; )
      (r = o[s]) && (i && r.compareDocumentPosition(i) ^ 4 && i.parentNode.insertBefore(r, i), i = r);
  return this;
}
function d_(e) {
  e || (e = f_);
  function t(f, g) {
    return f && g ? e(f.__data__, g.__data__) : !f - !g;
  }
  for (var n = this._groups, o = n.length, s = new Array(o), i = 0; i < o; ++i) {
    for (var r = n[i], l = r.length, a = s[i] = new Array(l), c, d = 0; d < l; ++d)
      (c = r[d]) && (a[d] = c);
    a.sort(t);
  }
  return new kt(s, this._parents).order();
}
function f_(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function p_() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function h_() {
  return Array.from(this);
}
function v_() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var o = e[t], s = 0, i = o.length; s < i; ++s) {
      var r = o[s];
      if (r)
        return r;
    }
  return null;
}
function g_() {
  let e = 0;
  for (const t of this)
    ++e;
  return e;
}
function m_() {
  return !this.node();
}
function y_(e) {
  for (var t = this._groups, n = 0, o = t.length; n < o; ++n)
    for (var s = t[n], i = 0, r = s.length, l; i < r; ++i)
      (l = s[i]) && e.call(l, l.__data__, i, s);
  return this;
}
function b_(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function __(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function w_(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function k_(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function E_(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function x_(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function S_(e, t) {
  var n = ci(e);
  if (arguments.length < 2) {
    var o = this.node();
    return n.local ? o.getAttributeNS(n.space, n.local) : o.getAttribute(n);
  }
  return this.each((t == null ? n.local ? __ : b_ : typeof t == "function" ? n.local ? x_ : E_ : n.local ? k_ : w_)(n, t));
}
function xd(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function C_(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function $_(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function N_(e, t, n) {
  return function() {
    var o = t.apply(this, arguments);
    o == null ? this.style.removeProperty(e) : this.style.setProperty(e, o, n);
  };
}
function I_(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? C_ : typeof t == "function" ? N_ : $_)(e, t, n ?? "")) : uo(this.node(), e);
}
function uo(e, t) {
  return e.style.getPropertyValue(t) || xd(e).getComputedStyle(e, null).getPropertyValue(t);
}
function M_(e) {
  return function() {
    delete this[e];
  };
}
function O_(e, t) {
  return function() {
    this[e] = t;
  };
}
function T_(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function P_(e, t) {
  return arguments.length > 1 ? this.each((t == null ? M_ : typeof t == "function" ? T_ : O_)(e, t)) : this.node()[e];
}
function Sd(e) {
  return e.trim().split(/^|\s+/);
}
function nl(e) {
  return e.classList || new Cd(e);
}
function Cd(e) {
  this._node = e, this._names = Sd(e.getAttribute("class") || "");
}
Cd.prototype = {
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
function $d(e, t) {
  for (var n = nl(e), o = -1, s = t.length; ++o < s; )
    n.add(t[o]);
}
function Nd(e, t) {
  for (var n = nl(e), o = -1, s = t.length; ++o < s; )
    n.remove(t[o]);
}
function D_(e) {
  return function() {
    $d(this, e);
  };
}
function R_(e) {
  return function() {
    Nd(this, e);
  };
}
function A_(e, t) {
  return function() {
    (t.apply(this, arguments) ? $d : Nd)(this, e);
  };
}
function V_(e, t) {
  var n = Sd(e + "");
  if (arguments.length < 2) {
    for (var o = nl(this.node()), s = -1, i = n.length; ++s < i; )
      if (!o.contains(n[s]))
        return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? A_ : t ? D_ : R_)(n, t));
}
function L_() {
  this.textContent = "";
}
function z_(e) {
  return function() {
    this.textContent = e;
  };
}
function B_(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function F_(e) {
  return arguments.length ? this.each(e == null ? L_ : (typeof e == "function" ? B_ : z_)(e)) : this.node().textContent;
}
function U_() {
  this.innerHTML = "";
}
function H_(e) {
  return function() {
    this.innerHTML = e;
  };
}
function j_(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function G_(e) {
  return arguments.length ? this.each(e == null ? U_ : (typeof e == "function" ? j_ : H_)(e)) : this.node().innerHTML;
}
function Y_() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function q_() {
  return this.each(Y_);
}
function X_() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function K_() {
  return this.each(X_);
}
function W_(e) {
  var t = typeof e == "function" ? e : bd(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function Z_() {
  return null;
}
function J_(e, t) {
  var n = typeof e == "function" ? e : bd(e), o = t == null ? Z_ : typeof t == "function" ? t : tl(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), o.apply(this, arguments) || null);
  });
}
function Q_() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function ew() {
  return this.each(Q_);
}
function tw() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function nw() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function ow(e) {
  return this.select(e ? nw : tw);
}
function sw(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function iw(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function rw(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", o = t.indexOf(".");
    return o >= 0 && (n = t.slice(o + 1), t = t.slice(0, o)), { type: t, name: n };
  });
}
function lw(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, o = -1, s = t.length, i; n < s; ++n)
        i = t[n], (!e.type || i.type === e.type) && i.name === e.name ? this.removeEventListener(i.type, i.listener, i.options) : t[++o] = i;
      ++o ? t.length = o : delete this.__on;
    }
  };
}
function aw(e, t, n) {
  return function() {
    var o = this.__on, s, i = iw(t);
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
function uw(e, t, n) {
  var o = rw(e + ""), s, i = o.length, r;
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
  for (l = t ? aw : lw, s = 0; s < i; ++s)
    this.each(l(o[s], t, n));
  return this;
}
function Id(e, t, n) {
  var o = xd(e), s = o.CustomEvent;
  typeof s == "function" ? s = new s(t, n) : (s = o.document.createEvent("Event"), n ? (s.initEvent(t, n.bubbles, n.cancelable), s.detail = n.detail) : s.initEvent(t, !1, !1)), e.dispatchEvent(s);
}
function cw(e, t) {
  return function() {
    return Id(this, e, t);
  };
}
function dw(e, t) {
  return function() {
    return Id(this, e, t.apply(this, arguments));
  };
}
function fw(e, t) {
  return this.each((typeof t == "function" ? dw : cw)(e, t));
}
function* pw() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var o = e[t], s = 0, i = o.length, r; s < i; ++s)
      (r = o[s]) && (yield r);
}
var Md = [null];
function kt(e, t) {
  this._groups = e, this._parents = t;
}
function ts() {
  return new kt([[document.documentElement]], Md);
}
function hw() {
  return this;
}
kt.prototype = ts.prototype = {
  constructor: kt,
  select: B0,
  selectAll: j0,
  selectChild: X0,
  selectChildren: J0,
  filter: Q0,
  data: i_,
  enter: e_,
  exit: l_,
  join: a_,
  merge: u_,
  selection: hw,
  order: c_,
  sort: d_,
  call: p_,
  nodes: h_,
  node: v_,
  size: g_,
  empty: m_,
  each: y_,
  attr: S_,
  style: I_,
  property: P_,
  classed: V_,
  text: F_,
  html: G_,
  raise: q_,
  lower: K_,
  append: W_,
  insert: J_,
  remove: ew,
  clone: ow,
  datum: sw,
  on: uw,
  dispatch: fw,
  [Symbol.iterator]: pw
};
function Ct(e) {
  return typeof e == "string" ? new kt([[document.querySelector(e)]], [document.documentElement]) : new kt([[e]], Md);
}
function vw(e) {
  let t;
  for (; t = e.sourceEvent; )
    e = t;
  return e;
}
function Rt(e, t) {
  if (e = vw(e), t === void 0 && (t = e.currentTarget), t) {
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
const gw = { passive: !1 }, Ho = { capture: !0, passive: !1 };
function zi(e) {
  e.stopImmediatePropagation();
}
function no(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function Od(e) {
  var t = e.document.documentElement, n = Ct(e).on("dragstart.drag", no, Ho);
  "onselectstart" in t ? n.on("selectstart.drag", no, Ho) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function Td(e, t) {
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
function mw(e) {
  return !e.ctrlKey && !e.button;
}
function yw() {
  return this.parentNode;
}
function bw(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function _w() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function ww() {
  var e = mw, t = yw, n = bw, o = _w, s = {}, i = ui("start", "drag", "end"), r = 0, l, a, c, d, f = 0;
  function g(w) {
    w.on("mousedown.drag", m).filter(o).on("touchstart.drag", x).on("touchmove.drag", O, gw).on("touchend.drag touchcancel.drag", D).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function m(w, z) {
    if (!(d || !e.call(this, w, z))) {
      var U = y(this, t.call(this, w, z), w, z, "mouse");
      U && (Ct(w.view).on("mousemove.drag", E, Ho).on("mouseup.drag", C, Ho), Od(w.view), zi(w), c = !1, l = w.clientX, a = w.clientY, U("start", w));
    }
  }
  function E(w) {
    if (no(w), !c) {
      var z = w.clientX - l, U = w.clientY - a;
      c = z * z + U * U > f;
    }
    s.mouse("drag", w);
  }
  function C(w) {
    Ct(w.view).on("mousemove.drag mouseup.drag", null), Td(w.view, c), no(w), s.mouse("end", w);
  }
  function x(w, z) {
    if (e.call(this, w, z)) {
      var U = w.changedTouches, W = t.call(this, w, z), G = U.length, P, L;
      for (P = 0; P < G; ++P)
        (L = y(this, W, w, z, U[P].identifier, U[P])) && (zi(w), L("start", w, U[P]));
    }
  }
  function O(w) {
    var z = w.changedTouches, U = z.length, W, G;
    for (W = 0; W < U; ++W)
      (G = s[z[W].identifier]) && (no(w), G("drag", w, z[W]));
  }
  function D(w) {
    var z = w.changedTouches, U = z.length, W, G;
    for (d && clearTimeout(d), d = setTimeout(function() {
      d = null;
    }, 500), W = 0; W < U; ++W)
      (G = s[z[W].identifier]) && (zi(w), G("end", w, z[W]));
  }
  function y(w, z, U, W, G, P) {
    var L = i.copy(), q = Rt(P || U, z), H, K, S;
    if ((S = n.call(w, new mr("beforestart", {
      sourceEvent: U,
      target: g,
      identifier: G,
      active: r,
      x: q[0],
      y: q[1],
      dx: 0,
      dy: 0,
      dispatch: L
    }), W)) != null)
      return H = S.x - q[0] || 0, K = S.y - q[1] || 0, function A(M, R, j) {
        var ne = q, re;
        switch (M) {
          case "start":
            s[G] = A, re = r++;
            break;
          case "end":
            delete s[G], --r;
          case "drag":
            q = Rt(j || R, z), re = r;
            break;
        }
        L.call(
          M,
          w,
          new mr(M, {
            sourceEvent: R,
            subject: S,
            target: g,
            identifier: G,
            active: re,
            x: q[0] + H,
            y: q[1] + K,
            dx: q[0] - ne[0],
            dy: q[1] - ne[1],
            dispatch: L
          }),
          W
        );
      };
  }
  return g.filter = function(w) {
    return arguments.length ? (e = typeof w == "function" ? w : cs(!!w), g) : e;
  }, g.container = function(w) {
    return arguments.length ? (t = typeof w == "function" ? w : cs(w), g) : t;
  }, g.subject = function(w) {
    return arguments.length ? (n = typeof w == "function" ? w : cs(w), g) : n;
  }, g.touchable = function(w) {
    return arguments.length ? (o = typeof w == "function" ? w : cs(!!w), g) : o;
  }, g.on = function() {
    var w = i.on.apply(i, arguments);
    return w === i ? g : w;
  }, g.clickDistance = function(w) {
    return arguments.length ? (f = (w = +w) * w, g) : Math.sqrt(f);
  }, g;
}
function ol(e, t, n) {
  e.prototype = t.prototype = n, n.constructor = e;
}
function Pd(e, t) {
  var n = Object.create(e.prototype);
  for (var o in t)
    n[o] = t[o];
  return n;
}
function ns() {
}
var jo = 0.7, Bs = 1 / jo, oo = "\\s*([+-]?\\d+)\\s*", Go = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", zt = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", kw = /^#([0-9a-f]{3,8})$/, Ew = new RegExp(`^rgb\\(${oo},${oo},${oo}\\)$`), xw = new RegExp(`^rgb\\(${zt},${zt},${zt}\\)$`), Sw = new RegExp(`^rgba\\(${oo},${oo},${oo},${Go}\\)$`), Cw = new RegExp(`^rgba\\(${zt},${zt},${zt},${Go}\\)$`), $w = new RegExp(`^hsl\\(${Go},${zt},${zt}\\)$`), Nw = new RegExp(`^hsla\\(${Go},${zt},${zt},${Go}\\)$`), Fa = {
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
  hex: Ua,
  // Deprecated! Use color.formatHex.
  formatHex: Ua,
  formatHex8: Iw,
  formatHsl: Mw,
  formatRgb: Ha,
  toString: Ha
});
function Ua() {
  return this.rgb().formatHex();
}
function Iw() {
  return this.rgb().formatHex8();
}
function Mw() {
  return Dd(this).formatHsl();
}
function Ha() {
  return this.rgb().formatRgb();
}
function Yo(e) {
  var t, n;
  return e = (e + "").trim().toLowerCase(), (t = kw.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? ja(t) : n === 3 ? new mt(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? ds(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? ds(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = Ew.exec(e)) ? new mt(t[1], t[2], t[3], 1) : (t = xw.exec(e)) ? new mt(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = Sw.exec(e)) ? ds(t[1], t[2], t[3], t[4]) : (t = Cw.exec(e)) ? ds(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = $w.exec(e)) ? qa(t[1], t[2] / 100, t[3] / 100, 1) : (t = Nw.exec(e)) ? qa(t[1], t[2] / 100, t[3] / 100, t[4]) : Fa.hasOwnProperty(e) ? ja(Fa[e]) : e === "transparent" ? new mt(NaN, NaN, NaN, 0) : null;
}
function ja(e) {
  return new mt(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function ds(e, t, n, o) {
  return o <= 0 && (e = t = n = NaN), new mt(e, t, n, o);
}
function Ow(e) {
  return e instanceof ns || (e = Yo(e)), e ? (e = e.rgb(), new mt(e.r, e.g, e.b, e.opacity)) : new mt();
}
function yr(e, t, n, o) {
  return arguments.length === 1 ? Ow(e) : new mt(e, t, n, o ?? 1);
}
function mt(e, t, n, o) {
  this.r = +e, this.g = +t, this.b = +n, this.opacity = +o;
}
ol(mt, yr, Pd(ns, {
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
    return new mt(Vn(this.r), Vn(this.g), Vn(this.b), Fs(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: Ga,
  // Deprecated! Use color.formatHex.
  formatHex: Ga,
  formatHex8: Tw,
  formatRgb: Ya,
  toString: Ya
}));
function Ga() {
  return `#${Dn(this.r)}${Dn(this.g)}${Dn(this.b)}`;
}
function Tw() {
  return `#${Dn(this.r)}${Dn(this.g)}${Dn(this.b)}${Dn((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function Ya() {
  const e = Fs(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${Vn(this.r)}, ${Vn(this.g)}, ${Vn(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function Fs(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function Vn(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function Dn(e) {
  return e = Vn(e), (e < 16 ? "0" : "") + e.toString(16);
}
function qa(e, t, n, o) {
  return o <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new $t(e, t, n, o);
}
function Dd(e) {
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
function Pw(e, t, n, o) {
  return arguments.length === 1 ? Dd(e) : new $t(e, t, n, o ?? 1);
}
function $t(e, t, n, o) {
  this.h = +e, this.s = +t, this.l = +n, this.opacity = +o;
}
ol($t, Pw, Pd(ns, {
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
    return new $t(Xa(this.h), fs(this.s), fs(this.l), Fs(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = Fs(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${Xa(this.h)}, ${fs(this.s) * 100}%, ${fs(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function Xa(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function fs(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function Bi(e, t, n) {
  return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
const Rd = (e) => () => e;
function Dw(e, t) {
  return function(n) {
    return e + n * t;
  };
}
function Rw(e, t, n) {
  return e = Math.pow(e, n), t = Math.pow(t, n) - e, n = 1 / n, function(o) {
    return Math.pow(e + o * t, n);
  };
}
function Aw(e) {
  return (e = +e) == 1 ? Ad : function(t, n) {
    return n - t ? Rw(t, n, e) : Rd(isNaN(t) ? n : t);
  };
}
function Ad(e, t) {
  var n = t - e;
  return n ? Dw(e, n) : Rd(isNaN(e) ? t : e);
}
const Ka = function e(t) {
  var n = Aw(t);
  function o(s, i) {
    var r = n((s = yr(s)).r, (i = yr(i)).r), l = n(s.g, i.g), a = n(s.b, i.b), c = Ad(s.opacity, i.opacity);
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
function Lw(e) {
  return function(t) {
    return e(t) + "";
  };
}
function zw(e, t) {
  var n = br.lastIndex = Fi.lastIndex = 0, o, s, i, r = -1, l = [], a = [];
  for (e = e + "", t = t + ""; (o = br.exec(e)) && (s = Fi.exec(t)); )
    (i = s.index) > n && (i = t.slice(n, i), l[r] ? l[r] += i : l[++r] = i), (o = o[0]) === (s = s[0]) ? l[r] ? l[r] += s : l[++r] = s : (l[++r] = null, a.push({ i: r, x: dn(o, s) })), n = Fi.lastIndex;
  return n < t.length && (i = t.slice(n), l[r] ? l[r] += i : l[++r] = i), l.length < 2 ? a[0] ? Lw(a[0].x) : Vw(t) : (t = a.length, function(c) {
    for (var d = 0, f; d < t; ++d)
      l[(f = a[d]).i] = f.x(c);
    return l.join("");
  });
}
var Wa = 180 / Math.PI, _r = {
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
    rotate: Math.atan2(t, e) * Wa,
    skewX: Math.atan(a) * Wa,
    scaleX: r,
    scaleY: l
  };
}
var ps;
function Bw(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? _r : Vd(t.a, t.b, t.c, t.d, t.e, t.f);
}
function Fw(e) {
  return e == null || (ps || (ps = document.createElementNS("http://www.w3.org/2000/svg", "g")), ps.setAttribute("transform", e), !(e = ps.transform.baseVal.consolidate())) ? _r : (e = e.matrix, Vd(e.a, e.b, e.c, e.d, e.e, e.f));
}
function Ld(e, t, n, o) {
  function s(c) {
    return c.length ? c.pop() + " " : "";
  }
  function i(c, d, f, g, m, E) {
    if (c !== f || d !== g) {
      var C = m.push("translate(", null, t, null, n);
      E.push({ i: C - 4, x: dn(c, f) }, { i: C - 2, x: dn(d, g) });
    } else (f || g) && m.push("translate(" + f + t + g + n);
  }
  function r(c, d, f, g) {
    c !== d ? (c - d > 180 ? d += 360 : d - c > 180 && (c += 360), g.push({ i: f.push(s(f) + "rotate(", null, o) - 2, x: dn(c, d) })) : d && f.push(s(f) + "rotate(" + d + o);
  }
  function l(c, d, f, g) {
    c !== d ? g.push({ i: f.push(s(f) + "skewX(", null, o) - 2, x: dn(c, d) }) : d && f.push(s(f) + "skewX(" + d + o);
  }
  function a(c, d, f, g, m, E) {
    if (c !== f || d !== g) {
      var C = m.push(s(m) + "scale(", null, ",", null, ")");
      E.push({ i: C - 4, x: dn(c, f) }, { i: C - 2, x: dn(d, g) });
    } else (f !== 1 || g !== 1) && m.push(s(m) + "scale(" + f + "," + g + ")");
  }
  return function(c, d) {
    var f = [], g = [];
    return c = e(c), d = e(d), i(c.translateX, c.translateY, d.translateX, d.translateY, f, g), r(c.rotate, d.rotate, f, g), l(c.skewX, d.skewX, f, g), a(c.scaleX, c.scaleY, d.scaleX, d.scaleY, f, g), c = d = null, function(m) {
      for (var E = -1, C = g.length, x; ++E < C; )
        f[(x = g[E]).i] = x.x(m);
      return f.join("");
    };
  };
}
var Uw = Ld(Bw, "px, ", "px)", "deg)"), Hw = Ld(Fw, ", ", ")", ")"), jw = 1e-12;
function Za(e) {
  return ((e = Math.exp(e)) + 1 / e) / 2;
}
function Gw(e) {
  return ((e = Math.exp(e)) - 1 / e) / 2;
}
function Yw(e) {
  return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const qw = function e(t, n, o) {
  function s(i, r) {
    var l = i[0], a = i[1], c = i[2], d = r[0], f = r[1], g = r[2], m = d - l, E = f - a, C = m * m + E * E, x, O;
    if (C < jw)
      O = Math.log(g / c) / t, x = function(W) {
        return [
          l + W * m,
          a + W * E,
          c * Math.exp(t * W * O)
        ];
      };
    else {
      var D = Math.sqrt(C), y = (g * g - c * c + o * C) / (2 * c * n * D), w = (g * g - c * c - o * C) / (2 * g * n * D), z = Math.log(Math.sqrt(y * y + 1) - y), U = Math.log(Math.sqrt(w * w + 1) - w);
      O = (U - z) / t, x = function(W) {
        var G = W * O, P = Za(z), L = c / (n * D) * (P * Yw(t * G + z) - Gw(z));
        return [
          l + L * m,
          a + L * E,
          c * P / Za(t * G + z)
        ];
      };
    }
    return x.duration = O * 1e3 * t / Math.SQRT2, x;
  }
  return s.rho = function(i) {
    var r = Math.max(1e-3, +i), l = r * r, a = l * l;
    return e(r, l, a);
  }, s;
}(Math.SQRT2, 2, 4);
var co = 0, Co = 0, ko = 0, zd = 1e3, Us, $o, Hs = 0, Un = 0, di = 0, qo = typeof performance == "object" && performance.now ? performance : Date, Bd = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function sl() {
  return Un || (Bd(Xw), Un = qo.now() + di);
}
function Xw() {
  Un = 0;
}
function js() {
  this._call = this._time = this._next = null;
}
js.prototype = Fd.prototype = {
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
function Fd(e, t, n) {
  var o = new js();
  return o.restart(e, t, n), o;
}
function Kw() {
  sl(), ++co;
  for (var e = Us, t; e; )
    (t = Un - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --co;
}
function Ja() {
  Un = (Hs = qo.now()) + di, co = Co = 0;
  try {
    Kw();
  } finally {
    co = 0, Zw(), Un = 0;
  }
}
function Ww() {
  var e = qo.now(), t = e - Hs;
  t > zd && (di -= t, Hs = e);
}
function Zw() {
  for (var e, t = Us, n, o = 1 / 0; t; )
    t._call ? (o > t._time && (o = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : Us = n);
  $o = e, wr(o);
}
function wr(e) {
  if (!co) {
    Co && (Co = clearTimeout(Co));
    var t = e - Un;
    t > 24 ? (e < 1 / 0 && (Co = setTimeout(Ja, e - qo.now() - di)), ko && (ko = clearInterval(ko))) : (ko || (Hs = qo.now(), ko = setInterval(Ww, zd)), co = 1, Bd(Ja));
  }
}
function Qa(e, t, n) {
  var o = new js();
  return t = t == null ? 0 : +t, o.restart((s) => {
    o.stop(), e(s + t);
  }, t, n), o;
}
var Jw = ui("start", "end", "cancel", "interrupt"), Qw = [], Ud = 0, eu = 1, kr = 2, Cs = 3, tu = 4, Er = 5, $s = 6;
function fi(e, t, n, o, s, i) {
  var r = e.__transition;
  if (!r)
    e.__transition = {};
  else if (n in r)
    return;
  ek(e, n, {
    name: t,
    index: o,
    // For context during callback.
    group: s,
    // For context during callback.
    on: Jw,
    tween: Qw,
    time: i.time,
    delay: i.delay,
    duration: i.duration,
    ease: i.ease,
    timer: null,
    state: Ud
  });
}
function il(e, t) {
  var n = Tt(e, t);
  if (n.state > Ud)
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
function ek(e, t, n) {
  var o = e.__transition, s;
  o[t] = n, n.timer = Fd(i, 0, n.time);
  function i(c) {
    n.state = eu, n.timer.restart(r, n.delay, n.time), n.delay <= c && r(c - n.delay);
  }
  function r(c) {
    var d, f, g, m;
    if (n.state !== eu)
      return a();
    for (d in o)
      if (m = o[d], m.name === n.name) {
        if (m.state === Cs)
          return Qa(r);
        m.state === tu ? (m.state = $s, m.timer.stop(), m.on.call("interrupt", e, e.__data__, m.index, m.group), delete o[d]) : +d < t && (m.state = $s, m.timer.stop(), m.on.call("cancel", e, e.__data__, m.index, m.group), delete o[d]);
      }
    if (Qa(function() {
      n.state === Cs && (n.state = tu, n.timer.restart(l, n.delay, n.time), l(c));
    }), n.state = kr, n.on.call("start", e, e.__data__, n.index, n.group), n.state === kr) {
      for (n.state = Cs, s = new Array(g = n.tween.length), d = 0, f = -1; d < g; ++d)
        (m = n.tween[d].value.call(e, e.__data__, n.index, n.group)) && (s[++f] = m);
      s.length = f + 1;
    }
  }
  function l(c) {
    for (var d = c < n.duration ? n.ease.call(null, c / n.duration) : (n.timer.restart(a), n.state = Er, 1), f = -1, g = s.length; ++f < g; )
      s[f].call(e, d);
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
function tk(e) {
  return this.each(function() {
    Ns(this, e);
  });
}
function nk(e, t) {
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
function ok(e, t, n) {
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
function sk(e, t) {
  var n = this._id;
  if (e += "", arguments.length < 2) {
    for (var o = Tt(this.node(), n).tween, s = 0, i = o.length, r; s < i; ++s)
      if ((r = o[s]).name === e)
        return r.value;
    return null;
  }
  return this.each((t == null ? nk : ok)(n, e, t));
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
function Hd(e, t) {
  var n;
  return (typeof t == "number" ? dn : t instanceof Yo ? Ka : (n = Yo(t)) ? (t = n, Ka) : zw)(e, t);
}
function ik(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function rk(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function lk(e, t, n) {
  var o, s = n + "", i;
  return function() {
    var r = this.getAttribute(e);
    return r === s ? null : r === o ? i : i = t(o = r, n);
  };
}
function ak(e, t, n) {
  var o, s = n + "", i;
  return function() {
    var r = this.getAttributeNS(e.space, e.local);
    return r === s ? null : r === o ? i : i = t(o = r, n);
  };
}
function uk(e, t, n) {
  var o, s, i;
  return function() {
    var r, l = n(this), a;
    return l == null ? void this.removeAttribute(e) : (r = this.getAttribute(e), a = l + "", r === a ? null : r === o && a === s ? i : (s = a, i = t(o = r, l)));
  };
}
function ck(e, t, n) {
  var o, s, i;
  return function() {
    var r, l = n(this), a;
    return l == null ? void this.removeAttributeNS(e.space, e.local) : (r = this.getAttributeNS(e.space, e.local), a = l + "", r === a ? null : r === o && a === s ? i : (s = a, i = t(o = r, l)));
  };
}
function dk(e, t) {
  var n = ci(e), o = n === "transform" ? Hw : Hd;
  return this.attrTween(e, typeof t == "function" ? (n.local ? ck : uk)(n, o, rl(this, "attr." + e, t)) : t == null ? (n.local ? rk : ik)(n) : (n.local ? ak : lk)(n, o, t));
}
function fk(e, t) {
  return function(n) {
    this.setAttribute(e, t.call(this, n));
  };
}
function pk(e, t) {
  return function(n) {
    this.setAttributeNS(e.space, e.local, t.call(this, n));
  };
}
function hk(e, t) {
  var n, o;
  function s() {
    var i = t.apply(this, arguments);
    return i !== o && (n = (o = i) && pk(e, i)), n;
  }
  return s._value = t, s;
}
function vk(e, t) {
  var n, o;
  function s() {
    var i = t.apply(this, arguments);
    return i !== o && (n = (o = i) && fk(e, i)), n;
  }
  return s._value = t, s;
}
function gk(e, t) {
  var n = "attr." + e;
  if (arguments.length < 2)
    return (n = this.tween(n)) && n._value;
  if (t == null)
    return this.tween(n, null);
  if (typeof t != "function")
    throw new Error();
  var o = ci(e);
  return this.tween(n, (o.local ? hk : vk)(o, t));
}
function mk(e, t) {
  return function() {
    il(this, e).delay = +t.apply(this, arguments);
  };
}
function yk(e, t) {
  return t = +t, function() {
    il(this, e).delay = t;
  };
}
function bk(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? mk : yk)(t, e)) : Tt(this.node(), t).delay;
}
function _k(e, t) {
  return function() {
    Ft(this, e).duration = +t.apply(this, arguments);
  };
}
function wk(e, t) {
  return t = +t, function() {
    Ft(this, e).duration = t;
  };
}
function kk(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? _k : wk)(t, e)) : Tt(this.node(), t).duration;
}
function Ek(e, t) {
  if (typeof t != "function")
    throw new Error();
  return function() {
    Ft(this, e).ease = t;
  };
}
function xk(e) {
  var t = this._id;
  return arguments.length ? this.each(Ek(t, e)) : Tt(this.node(), t).ease;
}
function Sk(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    if (typeof n != "function")
      throw new Error();
    Ft(this, e).ease = n;
  };
}
function Ck(e) {
  if (typeof e != "function")
    throw new Error();
  return this.each(Sk(this._id, e));
}
function $k(e) {
  typeof e != "function" && (e = wd(e));
  for (var t = this._groups, n = t.length, o = new Array(n), s = 0; s < n; ++s)
    for (var i = t[s], r = i.length, l = o[s] = [], a, c = 0; c < r; ++c)
      (a = i[c]) && e.call(a, a.__data__, c, i) && l.push(a);
  return new nn(o, this._parents, this._name, this._id);
}
function Nk(e) {
  if (e._id !== this._id)
    throw new Error();
  for (var t = this._groups, n = e._groups, o = t.length, s = n.length, i = Math.min(o, s), r = new Array(o), l = 0; l < i; ++l)
    for (var a = t[l], c = n[l], d = a.length, f = r[l] = new Array(d), g, m = 0; m < d; ++m)
      (g = a[m] || c[m]) && (f[m] = g);
  for (; l < o; ++l)
    r[l] = t[l];
  return new nn(r, this._parents, this._name, this._id);
}
function Ik(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var n = t.indexOf(".");
    return n >= 0 && (t = t.slice(0, n)), !t || t === "start";
  });
}
function Mk(e, t, n) {
  var o, s, i = Ik(t) ? il : Ft;
  return function() {
    var r = i(this, e), l = r.on;
    l !== o && (s = (o = l).copy()).on(t, n), r.on = s;
  };
}
function Ok(e, t) {
  var n = this._id;
  return arguments.length < 2 ? Tt(this.node(), n).on.on(e) : this.each(Mk(n, e, t));
}
function Tk(e) {
  return function() {
    var t = this.parentNode;
    for (var n in this.__transition)
      if (+n !== e)
        return;
    t && t.removeChild(this);
  };
}
function Pk() {
  return this.on("end.remove", Tk(this._id));
}
function Dk(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = tl(e));
  for (var o = this._groups, s = o.length, i = new Array(s), r = 0; r < s; ++r)
    for (var l = o[r], a = l.length, c = i[r] = new Array(a), d, f, g = 0; g < a; ++g)
      (d = l[g]) && (f = e.call(d, d.__data__, g, l)) && ("__data__" in d && (f.__data__ = d.__data__), c[g] = f, fi(c[g], t, n, g, c, Tt(d, n)));
  return new nn(i, this._parents, t, n);
}
function Rk(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = _d(e));
  for (var o = this._groups, s = o.length, i = [], r = [], l = 0; l < s; ++l)
    for (var a = o[l], c = a.length, d, f = 0; f < c; ++f)
      if (d = a[f]) {
        for (var g = e.call(d, d.__data__, f, a), m, E = Tt(d, n), C = 0, x = g.length; C < x; ++C)
          (m = g[C]) && fi(m, t, n, C, g, E);
        i.push(g), r.push(d);
      }
  return new nn(i, r, t, n);
}
var Ak = ts.prototype.constructor;
function Vk() {
  return new Ak(this._groups, this._parents);
}
function Lk(e, t) {
  var n, o, s;
  return function() {
    var i = uo(this, e), r = (this.style.removeProperty(e), uo(this, e));
    return i === r ? null : i === n && r === o ? s : s = t(n = i, o = r);
  };
}
function jd(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function zk(e, t, n) {
  var o, s = n + "", i;
  return function() {
    var r = uo(this, e);
    return r === s ? null : r === o ? i : i = t(o = r, n);
  };
}
function Bk(e, t, n) {
  var o, s, i;
  return function() {
    var r = uo(this, e), l = n(this), a = l + "";
    return l == null && (a = l = (this.style.removeProperty(e), uo(this, e))), r === a ? null : r === o && a === s ? i : (s = a, i = t(o = r, l));
  };
}
function Fk(e, t) {
  var n, o, s, i = "style." + t, r = "end." + i, l;
  return function() {
    var a = Ft(this, e), c = a.on, d = a.value[i] == null ? l || (l = jd(t)) : void 0;
    (c !== n || s !== d) && (o = (n = c).copy()).on(r, s = d), a.on = o;
  };
}
function Uk(e, t, n) {
  var o = (e += "") == "transform" ? Uw : Hd;
  return t == null ? this.styleTween(e, Lk(e, o)).on("end.style." + e, jd(e)) : typeof t == "function" ? this.styleTween(e, Bk(e, o, rl(this, "style." + e, t))).each(Fk(this._id, e)) : this.styleTween(e, zk(e, o, t), n).on("end.style." + e, null);
}
function Hk(e, t, n) {
  return function(o) {
    this.style.setProperty(e, t.call(this, o), n);
  };
}
function jk(e, t, n) {
  var o, s;
  function i() {
    var r = t.apply(this, arguments);
    return r !== s && (o = (s = r) && Hk(e, r, n)), o;
  }
  return i._value = t, i;
}
function Gk(e, t, n) {
  var o = "style." + (e += "");
  if (arguments.length < 2)
    return (o = this.tween(o)) && o._value;
  if (t == null)
    return this.tween(o, null);
  if (typeof t != "function")
    throw new Error();
  return this.tween(o, jk(e, t, n ?? ""));
}
function Yk(e) {
  return function() {
    this.textContent = e;
  };
}
function qk(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function Xk(e) {
  return this.tween("text", typeof e == "function" ? qk(rl(this, "text", e)) : Yk(e == null ? "" : e + ""));
}
function Kk(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function Wk(e) {
  var t, n;
  function o() {
    var s = e.apply(this, arguments);
    return s !== n && (t = (n = s) && Kk(s)), t;
  }
  return o._value = e, o;
}
function Zk(e) {
  var t = "text";
  if (arguments.length < 1)
    return (t = this.tween(t)) && t._value;
  if (e == null)
    return this.tween(t, null);
  if (typeof e != "function")
    throw new Error();
  return this.tween(t, Wk(e));
}
function Jk() {
  for (var e = this._name, t = this._id, n = Gd(), o = this._groups, s = o.length, i = 0; i < s; ++i)
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
function Qk() {
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
var e2 = 0;
function nn(e, t, n, o) {
  this._groups = e, this._parents = t, this._name = n, this._id = o;
}
function Gd() {
  return ++e2;
}
var Ht = ts.prototype;
nn.prototype = {
  constructor: nn,
  select: Dk,
  selectAll: Rk,
  selectChild: Ht.selectChild,
  selectChildren: Ht.selectChildren,
  filter: $k,
  merge: Nk,
  selection: Vk,
  transition: Jk,
  call: Ht.call,
  nodes: Ht.nodes,
  node: Ht.node,
  size: Ht.size,
  empty: Ht.empty,
  each: Ht.each,
  on: Ok,
  attr: dk,
  attrTween: gk,
  style: Uk,
  styleTween: Gk,
  text: Xk,
  textTween: Zk,
  remove: Pk,
  tween: sk,
  delay: bk,
  duration: kk,
  ease: xk,
  easeVarying: Ck,
  end: Qk,
  [Symbol.iterator]: Ht[Symbol.iterator]
};
function t2(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var n2 = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: t2
};
function o2(e, t) {
  for (var n; !(n = e.__transition) || !(n = n[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return n;
}
function s2(e) {
  var t, n;
  e instanceof nn ? (t = e._id, e = e._name) : (t = Gd(), (n = n2).time = sl(), e = e == null ? null : e + "");
  for (var o = this._groups, s = o.length, i = 0; i < s; ++i)
    for (var r = o[i], l = r.length, a, c = 0; c < l; ++c)
      (a = r[c]) && fi(a, e, t, c, r, n || o2(a, t));
  return new nn(o, this._parents, e, t);
}
ts.prototype.interrupt = tk;
ts.prototype.transition = s2;
const hs = (e) => () => e;
function i2(e, {
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
function r2(e) {
  return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function l2() {
  var e = this;
  return e instanceof SVGElement ? (e = e.ownerSVGElement || e, e.hasAttribute("viewBox") ? (e = e.viewBox.baseVal, [[e.x, e.y], [e.x + e.width, e.y + e.height]]) : [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]) : [[0, 0], [e.clientWidth, e.clientHeight]];
}
function nu() {
  return this.__zoom || fo;
}
function a2(e) {
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * (e.ctrlKey ? 10 : 1);
}
function u2() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function c2(e, t, n) {
  var o = e.invertX(t[0][0]) - n[0][0], s = e.invertX(t[1][0]) - n[1][0], i = e.invertY(t[0][1]) - n[0][1], r = e.invertY(t[1][1]) - n[1][1];
  return e.translate(
    s > o ? (o + s) / 2 : Math.min(0, o) || Math.max(0, s),
    r > i ? (i + r) / 2 : Math.min(0, i) || Math.max(0, r)
  );
}
function d2() {
  var e = r2, t = l2, n = c2, o = a2, s = u2, i = [0, 1 / 0], r = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], l = 250, a = qw, c = ui("start", "zoom", "end"), d, f, g, m = 500, E = 150, C = 0, x = 10;
  function O(S) {
    S.property("__zoom", nu).on("wheel.zoom", G, { passive: !1 }).on("mousedown.zoom", P).on("dblclick.zoom", L).filter(s).on("touchstart.zoom", q).on("touchmove.zoom", H).on("touchend.zoom touchcancel.zoom", K).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  O.transform = function(S, A, M, R) {
    var j = S.selection ? S.selection() : S;
    j.property("__zoom", nu), S !== j ? z(S, A, M, R) : j.interrupt().each(function() {
      U(this, arguments).event(R).start().zoom(null, typeof A == "function" ? A.apply(this, arguments) : A).end();
    });
  }, O.scaleBy = function(S, A, M, R) {
    O.scaleTo(S, function() {
      var j = this.__zoom.k, ne = typeof A == "function" ? A.apply(this, arguments) : A;
      return j * ne;
    }, M, R);
  }, O.scaleTo = function(S, A, M, R) {
    O.transform(S, function() {
      var j = t.apply(this, arguments), ne = this.__zoom, re = M == null ? w(j) : typeof M == "function" ? M.apply(this, arguments) : M, ue = ne.invert(re), se = typeof A == "function" ? A.apply(this, arguments) : A;
      return n(y(D(ne, se), re, ue), j, r);
    }, M, R);
  }, O.translateBy = function(S, A, M, R) {
    O.transform(S, function() {
      return n(this.__zoom.translate(
        typeof A == "function" ? A.apply(this, arguments) : A,
        typeof M == "function" ? M.apply(this, arguments) : M
      ), t.apply(this, arguments), r);
    }, null, R);
  }, O.translateTo = function(S, A, M, R, j) {
    O.transform(S, function() {
      var ne = t.apply(this, arguments), re = this.__zoom, ue = R == null ? w(ne) : typeof R == "function" ? R.apply(this, arguments) : R;
      return n(fo.translate(ue[0], ue[1]).scale(re.k).translate(
        typeof A == "function" ? -A.apply(this, arguments) : -A,
        typeof M == "function" ? -M.apply(this, arguments) : -M
      ), ne, r);
    }, R, j);
  };
  function D(S, A) {
    return A = Math.max(i[0], Math.min(i[1], A)), A === S.k ? S : new Wt(A, S.x, S.y);
  }
  function y(S, A, M) {
    var R = A[0] - M[0] * S.k, j = A[1] - M[1] * S.k;
    return R === S.x && j === S.y ? S : new Wt(S.k, R, j);
  }
  function w(S) {
    return [(+S[0][0] + +S[1][0]) / 2, (+S[0][1] + +S[1][1]) / 2];
  }
  function z(S, A, M, R) {
    S.on("start.zoom", function() {
      U(this, arguments).event(R).start();
    }).on("interrupt.zoom end.zoom", function() {
      U(this, arguments).event(R).end();
    }).tween("zoom", function() {
      var j = this, ne = arguments, re = U(j, ne).event(R), ue = t.apply(j, ne), se = M == null ? w(ue) : typeof M == "function" ? M.apply(j, ne) : M, fe = Math.max(ue[1][0] - ue[0][0], ue[1][1] - ue[0][1]), ce = j.__zoom, ge = typeof A == "function" ? A.apply(j, ne) : A, ee = a(ce.invert(se).concat(fe / ce.k), ge.invert(se).concat(fe / ge.k));
      return function(_e) {
        if (_e === 1)
          _e = ge;
        else {
          var xe = ee(_e), we = fe / xe[2];
          _e = new Wt(we, se[0] - xe[0] * we, se[1] - xe[1] * we);
        }
        re.zoom(null, _e);
      };
    });
  }
  function U(S, A, M) {
    return !M && S.__zooming || new W(S, A);
  }
  function W(S, A) {
    this.that = S, this.args = A, this.active = 0, this.sourceEvent = null, this.extent = t.apply(S, A), this.taps = 0;
  }
  W.prototype = {
    event: function(S) {
      return S && (this.sourceEvent = S), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(S, A) {
      return this.mouse && S !== "mouse" && (this.mouse[1] = A.invert(this.mouse[0])), this.touch0 && S !== "touch" && (this.touch0[1] = A.invert(this.touch0[0])), this.touch1 && S !== "touch" && (this.touch1[1] = A.invert(this.touch1[0])), this.that.__zoom = A, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(S) {
      var A = Ct(this.that).datum();
      c.call(
        S,
        this.that,
        new i2(S, {
          sourceEvent: this.sourceEvent,
          target: O,
          transform: this.that.__zoom,
          dispatch: c
        }),
        A
      );
    }
  };
  function G(S, ...A) {
    if (!e.apply(this, arguments))
      return;
    var M = U(this, A).event(S), R = this.__zoom, j = Math.max(i[0], Math.min(i[1], R.k * Math.pow(2, o.apply(this, arguments)))), ne = Rt(S);
    if (M.wheel)
      (M.mouse[0][0] !== ne[0] || M.mouse[0][1] !== ne[1]) && (M.mouse[1] = R.invert(M.mouse[0] = ne)), clearTimeout(M.wheel);
    else {
      if (R.k === j)
        return;
      M.mouse = [ne, R.invert(ne)], Ns(this), M.start();
    }
    Eo(S), M.wheel = setTimeout(re, E), M.zoom("mouse", n(y(D(R, j), M.mouse[0], M.mouse[1]), M.extent, r));
    function re() {
      M.wheel = null, M.end();
    }
  }
  function P(S, ...A) {
    if (g || !e.apply(this, arguments))
      return;
    var M = S.currentTarget, R = U(this, A, !0).event(S), j = Ct(S.view).on("mousemove.zoom", se, !0).on("mouseup.zoom", fe, !0), ne = Rt(S, M), re = S.clientX, ue = S.clientY;
    Od(S.view), Ui(S), R.mouse = [ne, this.__zoom.invert(ne)], Ns(this), R.start();
    function se(ce) {
      if (Eo(ce), !R.moved) {
        var ge = ce.clientX - re, ee = ce.clientY - ue;
        R.moved = ge * ge + ee * ee > C;
      }
      R.event(ce).zoom("mouse", n(y(R.that.__zoom, R.mouse[0] = Rt(ce, M), R.mouse[1]), R.extent, r));
    }
    function fe(ce) {
      j.on("mousemove.zoom mouseup.zoom", null), Td(ce.view, R.moved), Eo(ce), R.event(ce).end();
    }
  }
  function L(S, ...A) {
    if (e.apply(this, arguments)) {
      var M = this.__zoom, R = Rt(S.changedTouches ? S.changedTouches[0] : S, this), j = M.invert(R), ne = M.k * (S.shiftKey ? 0.5 : 2), re = n(y(D(M, ne), R, j), t.apply(this, A), r);
      Eo(S), l > 0 ? Ct(this).transition().duration(l).call(z, re, R, S) : Ct(this).call(O.transform, re, R, S);
    }
  }
  function q(S, ...A) {
    if (e.apply(this, arguments)) {
      var M = S.touches, R = M.length, j = U(this, A, S.changedTouches.length === R).event(S), ne, re, ue, se;
      for (Ui(S), re = 0; re < R; ++re)
        ue = M[re], se = Rt(ue, this), se = [se, this.__zoom.invert(se), ue.identifier], j.touch0 ? !j.touch1 && j.touch0[2] !== se[2] && (j.touch1 = se, j.taps = 0) : (j.touch0 = se, ne = !0, j.taps = 1 + !!d);
      d && (d = clearTimeout(d)), ne && (j.taps < 2 && (f = se[0], d = setTimeout(function() {
        d = null;
      }, m)), Ns(this), j.start());
    }
  }
  function H(S, ...A) {
    if (this.__zooming) {
      var M = U(this, A).event(S), R = S.changedTouches, j = R.length, ne, re, ue, se;
      for (Eo(S), ne = 0; ne < j; ++ne)
        re = R[ne], ue = Rt(re, this), M.touch0 && M.touch0[2] === re.identifier ? M.touch0[0] = ue : M.touch1 && M.touch1[2] === re.identifier && (M.touch1[0] = ue);
      if (re = M.that.__zoom, M.touch1) {
        var fe = M.touch0[0], ce = M.touch0[1], ge = M.touch1[0], ee = M.touch1[1], _e = (_e = ge[0] - fe[0]) * _e + (_e = ge[1] - fe[1]) * _e, xe = (xe = ee[0] - ce[0]) * xe + (xe = ee[1] - ce[1]) * xe;
        re = D(re, Math.sqrt(_e / xe)), ue = [(fe[0] + ge[0]) / 2, (fe[1] + ge[1]) / 2], se = [(ce[0] + ee[0]) / 2, (ce[1] + ee[1]) / 2];
      } else if (M.touch0)
        ue = M.touch0[0], se = M.touch0[1];
      else
        return;
      M.zoom("touch", n(y(re, ue, se), M.extent, r));
    }
  }
  function K(S, ...A) {
    if (this.__zooming) {
      var M = U(this, A).event(S), R = S.changedTouches, j = R.length, ne, re;
      for (Ui(S), g && clearTimeout(g), g = setTimeout(function() {
        g = null;
      }, m), ne = 0; ne < j; ++ne)
        re = R[ne], M.touch0 && M.touch0[2] === re.identifier ? delete M.touch0 : M.touch1 && M.touch1[2] === re.identifier && delete M.touch1;
      if (M.touch1 && !M.touch0 && (M.touch0 = M.touch1, delete M.touch1), M.touch0)
        M.touch0[1] = this.__zoom.invert(M.touch0[0]);
      else if (M.end(), M.taps === 2 && (re = Rt(re, this), Math.hypot(f[0] - re[0], f[1] - re[1]) < x)) {
        var ue = Ct(this).on("dblclick.zoom");
        ue && ue.apply(this, arguments);
      }
    }
  }
  return O.wheelDelta = function(S) {
    return arguments.length ? (o = typeof S == "function" ? S : hs(+S), O) : o;
  }, O.filter = function(S) {
    return arguments.length ? (e = typeof S == "function" ? S : hs(!!S), O) : e;
  }, O.touchable = function(S) {
    return arguments.length ? (s = typeof S == "function" ? S : hs(!!S), O) : s;
  }, O.extent = function(S) {
    return arguments.length ? (t = typeof S == "function" ? S : hs([[+S[0][0], +S[0][1]], [+S[1][0], +S[1][1]]]), O) : t;
  }, O.scaleExtent = function(S) {
    return arguments.length ? (i[0] = +S[0], i[1] = +S[1], O) : [i[0], i[1]];
  }, O.translateExtent = function(S) {
    return arguments.length ? (r[0][0] = +S[0][0], r[1][0] = +S[1][0], r[0][1] = +S[0][1], r[1][1] = +S[1][1], O) : [[r[0][0], r[0][1]], [r[1][0], r[1][1]]];
  }, O.constrain = function(S) {
    return arguments.length ? (n = S, O) : n;
  }, O.duration = function(S) {
    return arguments.length ? (l = +S, O) : l;
  }, O.interpolate = function(S) {
    return arguments.length ? (a = S, O) : a;
  }, O.on = function() {
    var S = c.on.apply(c, arguments);
    return S === c ? O : S;
  }, O.clickDistance = function(S) {
    return arguments.length ? (C = (S = +S) * S, O) : Math.sqrt(C);
  }, O.tapDistance = function(S) {
    return arguments.length ? (x = +S, O) : x;
  }, O;
}
var ye = /* @__PURE__ */ ((e) => (e.Left = "left", e.Top = "top", e.Right = "right", e.Bottom = "bottom", e))(ye || {}), ll = /* @__PURE__ */ ((e) => (e.Partial = "partial", e.Full = "full", e))(ll || {}), On = /* @__PURE__ */ ((e) => (e.Bezier = "default", e.SimpleBezier = "simple-bezier", e.Straight = "straight", e.Step = "step", e.SmoothStep = "smoothstep", e))(On || {}), Hn = /* @__PURE__ */ ((e) => (e.Strict = "strict", e.Loose = "loose", e))(Hn || {}), xr = /* @__PURE__ */ ((e) => (e.Arrow = "arrow", e.ArrowClosed = "arrowclosed", e))(xr || {}), Ro = /* @__PURE__ */ ((e) => (e.Free = "free", e.Vertical = "vertical", e.Horizontal = "horizontal", e))(Ro || {});
function Sr(e) {
  var t, n;
  const o = ((n = (t = e.composedPath) == null ? void 0 : t.call(e)) == null ? void 0 : n[0]) || e.target, s = typeof (o == null ? void 0 : o.hasAttribute) == "function" ? o.hasAttribute("contenteditable") : !1, i = typeof (o == null ? void 0 : o.closest) == "function" ? o.closest(".nokey") : null;
  return ["INPUT", "SELECT", "TEXTAREA"].includes(o == null ? void 0 : o.nodeName) || s || !!i;
}
function f2(e) {
  return e.ctrlKey || e.metaKey || e.shiftKey;
}
function ou(e, t, n, o) {
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
function p2(e, t) {
  return (n) => {
    if (!n.code && !n.key)
      return !1;
    const o = h2(n.code, e);
    return Array.isArray(e) ? e.some((s) => ou(n[o], s, t, n.type === "keyup")) : ou(n[o], e, t, n.type === "keyup");
  };
}
function h2(e, t) {
  return t.includes(e) ? "code" : "key";
}
function Ao(e, t) {
  const n = Ue(() => Pe(t == null ? void 0 : t.actInsideInputWithModifier) ?? !1), o = Ue(() => Pe(t == null ? void 0 : t.target) ?? window), s = Q(Pe(e) === !0);
  let i = !1;
  const r = /* @__PURE__ */ new Set();
  let l = c(Pe(e));
  Ne(
    () => Pe(e),
    (d, f) => {
      typeof f == "boolean" && typeof d != "boolean" && a(), l = c(d);
    },
    {
      immediate: !0
    }
  ), yd(["blur", "contextmenu"], a), La(
    (...d) => l(...d),
    (d) => {
      i = f2(d), !((!i || i && !n.value) && Sr(d)) && (d.preventDefault(), s.value = !0);
    },
    { eventName: "keydown", target: o }
  ), La(
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
    return d === null ? (a(), () => !1) : typeof d == "boolean" ? (a(), s.value = d, () => !1) : Array.isArray(d) || typeof d == "string" ? p2(d, r) : d;
  }
  return s;
}
const Yd = "vue-flow__node-desc", qd = "vue-flow__edge-desc", v2 = "vue-flow__aria-live", Xd = ["Enter", " ", "Escape"], so = {
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
function Kd(e, t) {
  return {
    x: jn(e.x, t[0][0], t[1][0]),
    y: jn(e.y, t[0][1], t[1][1])
  };
}
function su(e) {
  const t = e.getRootNode();
  return "elementFromPoint" in t ? t : window.document;
}
function En(e) {
  return e && typeof e == "object" && "id" in e && "source" in e && "target" in e;
}
function Ln(e) {
  return e && typeof e == "object" && "id" in e && "position" in e && !En(e);
}
function No(e) {
  return Ln(e) && "computedPosition" in e;
}
function vs(e) {
  return !Number.isNaN(e) && Number.isFinite(e);
}
function g2(e) {
  return vs(e.width) && vs(e.height) && vs(e.x) && vs(e.y);
}
function m2(e, t, n) {
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
function Wd(e, t, n) {
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
function Zd(e, t, n, o) {
  const s = typeof e == "string" ? e : e.id, i = /* @__PURE__ */ new Set(), r = o === "source" ? "target" : "source";
  for (const l of n)
    l[r] === s && i.add(l[o]);
  return t.filter((l) => i.has(l.id));
}
function y2(...e) {
  if (e.length === 3) {
    const [i, r, l] = e;
    return Zd(i, r, l, "target");
  }
  const [t, n] = e, o = typeof t == "string" ? t : t.id;
  return n.filter((i) => En(i) && i.source === o).map((i) => n.find((r) => Ln(r) && r.id === i.target));
}
function b2(...e) {
  if (e.length === 3) {
    const [i, r, l] = e;
    return Zd(i, r, l, "source");
  }
  const [t, n] = e, o = typeof t == "string" ? t : t.id;
  return n.filter((i) => En(i) && i.target === o).map((i) => n.find((r) => Ln(r) && r.id === i.source));
}
function Jd({ source: e, sourceHandle: t, target: n, targetHandle: o }) {
  return `vueflow__edge-${e}${t ?? ""}-${n}${o ?? ""}`;
}
function _2(e, t) {
  return t.some(
    (n) => En(n) && n.source === e.source && n.target === e.target && (n.sourceHandle === e.sourceHandle || !n.sourceHandle && !e.sourceHandle) && (n.targetHandle === e.targetHandle || !n.targetHandle && !e.targetHandle)
  );
}
function Qd({ x: e, y: t }, { x: n, y: o, zoom: s }) {
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
function w2(e, t) {
  return {
    x: Math.min(e.x, t.x),
    y: Math.min(e.y, t.y),
    x2: Math.max(e.x2, t.x2),
    y2: Math.max(e.y2, t.y2)
  };
}
function ef({ x: e, y: t, width: n, height: o }) {
  return {
    x: e,
    y: t,
    x2: e + n,
    y2: t + o
  };
}
function k2({ x: e, y: t, x2: n, y2: o }) {
  return {
    x: e,
    y: t,
    width: n - e,
    height: o - t
  };
}
function tf(e) {
  let t = {
    x: Number.POSITIVE_INFINITY,
    y: Number.POSITIVE_INFINITY,
    x2: Number.NEGATIVE_INFINITY,
    y2: Number.NEGATIVE_INFINITY
  };
  for (let n = 0; n < e.length; n++) {
    const o = e[n];
    t = w2(
      t,
      ef({
        ...o.computedPosition,
        ...o.dimensions
      })
    );
  }
  return k2(t);
}
function nf(e, t, n = { x: 0, y: 0, zoom: 1 }, o = !1, s = !1) {
  const i = {
    ...Xo(t, n),
    width: t.width / n.zoom,
    height: t.height / n.zoom
  }, r = [];
  for (const l of e) {
    const { dimensions: a, selectable: c = !0, hidden: d = !1 } = l, f = a.width ?? l.width ?? null, g = a.height ?? l.height ?? null;
    if (s && !c || d)
      continue;
    const m = $r(i, Cr(l)), E = f === null || g === null, C = o && m > 0, x = (f ?? 0) * (g ?? 0);
    (E || C || m >= x || l.dragging) && r.push(l);
  }
  return r;
}
function of(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (typeof e == "string")
    n.add(e);
  else if (e.length >= 1)
    for (const o of e)
      n.add(o.id);
  return t.filter((o) => n.has(o.source) || n.has(o.target));
}
function iu(e, t, n, o, s, i = 0.1, r = { x: 0, y: 0 }) {
  const l = t / (e.width * (1 + i)), a = n / (e.height * (1 + i)), c = Math.min(l, a), d = jn(c, o, s), f = e.x + e.width / 2, g = e.y + e.height / 2, m = t / 2 - f * d + (r.x ?? 0), E = n / 2 - g * d + (r.y ?? 0);
  return { x: m, y: E, zoom: d };
}
function E2(e, t) {
  return {
    x: t.x + e.x,
    y: t.y + e.y,
    z: (e.z > t.z ? e.z : t.z) + 1
  };
}
function sf(e, t) {
  if (!e.parentNode)
    return !1;
  const n = t(e.parentNode);
  return n ? n.selected ? !0 : sf(n, t) : !1;
}
function Ko(e, t) {
  return typeof e > "u" ? "" : typeof e == "string" ? e : `${t ? `${t}__` : ""}${Object.keys(e).sort().map((o) => `${o}=${e[o]}`).join("&")}`;
}
function ru(e, t, n) {
  return e < t ? jn(Math.abs(e - t), 1, t) / t : e > n ? -jn(Math.abs(e - n), 1, t) / t : 0;
}
function rf(e, t, n = 15, o = 40) {
  const s = ru(e.x, o, t.width - o) * n, i = ru(e.y, o, t.height - o) * n;
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
function lu(e, t) {
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
function au(e) {
  return {
    item: e,
    type: "add"
  };
}
function uu(e) {
  return {
    id: e,
    type: "remove"
  };
}
function cu(e, t, n, o, s) {
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
function du(e, t, n) {
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
function x2(e, t, n, o, s) {
  var i, r;
  const l = [];
  for (const a of e)
    (a.selected || a.id === s) && (!a.parentNode || !sf(a, o)) && (a.draggable || t && typeof a.draggable > "u") && l.push(
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
function lf(e) {
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
function S2(e, t, n) {
  const [o, s, i, r] = typeof e != "string" ? lf(e.padding) : [0, 0, 0, 0];
  return n && typeof n.computedPosition.x < "u" && typeof n.computedPosition.y < "u" && typeof n.dimensions.width < "u" && typeof n.dimensions.height < "u" ? [
    [n.computedPosition.x + r, n.computedPosition.y + o],
    [
      n.computedPosition.x + n.dimensions.width - s,
      n.computedPosition.y + n.dimensions.height - i
    ]
  ] : !1;
}
function C2(e, t, n, o) {
  let s = e.extent || n;
  if ((s === "parent" || !Array.isArray(s) && (s == null ? void 0 : s.range) === "parent") && !e.expandParent)
    if (e.parentNode && o && e.dimensions.width && e.dimensions.height) {
      const i = S2(s, e, o);
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
    const [i, r, l, a] = lf(s.padding), c = (o == null ? void 0 : o.computedPosition.x) || 0, d = (o == null ? void 0 : o.computedPosition.y) || 0;
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
function $2({ width: e, height: t }, n) {
  return [n[0], [n[1][0] - (e || 0), n[1][1] - (t || 0)]];
}
function al(e, t, n, o, s) {
  const i = $2(e.dimensions, C2(e, n, o, s)), r = Kd(t, i);
  return {
    position: {
      x: r.x - ((s == null ? void 0 : s.computedPosition.x) || 0),
      y: r.y - ((s == null ? void 0 : s.computedPosition.y) || 0)
    },
    computedPosition: r
  };
}
function Gs(e, t, n = ye.Left) {
  const o = ((t == null ? void 0 : t.x) ?? 0) + e.computedPosition.x, s = ((t == null ? void 0 : t.y) ?? 0) + e.computedPosition.y, { width: i, height: r } = t ?? M2(e);
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
function fu(e = [], t) {
  return e.length && (t ? e.find((n) => n.id === t) : e[0]) || null;
}
function N2({
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
  const d = ef({
    x: (0 - a.x) / a.zoom,
    y: (0 - a.y) / a.zoom,
    width: r / a.zoom,
    height: l / a.zoom
  }), f = Math.max(0, Math.min(d.x2, c.x2) - Math.max(d.x, c.x)), g = Math.max(0, Math.min(d.y2, c.y2) - Math.max(d.y, c.y));
  return Math.ceil(f * g) > 0;
}
function I2(e, t, n = !1) {
  const o = typeof e.zIndex == "number";
  let s = o ? e.zIndex : 0;
  const i = t(e.source), r = t(e.target);
  return !i || !r ? 0 : (n && (s = o ? e.zIndex : Math.max(i.computedPosition.z || 0, r.computedPosition.z || 0)), s);
}
var We = /* @__PURE__ */ ((e) => (e.MISSING_STYLES = "MISSING_STYLES", e.MISSING_VIEWPORT_DIMENSIONS = "MISSING_VIEWPORT_DIMENSIONS", e.NODE_INVALID = "NODE_INVALID", e.NODE_NOT_FOUND = "NODE_NOT_FOUND", e.NODE_MISSING_PARENT = "NODE_MISSING_PARENT", e.NODE_TYPE_MISSING = "NODE_TYPE_MISSING", e.NODE_EXTENT_INVALID = "NODE_EXTENT_INVALID", e.EDGE_INVALID = "EDGE_INVALID", e.EDGE_NOT_FOUND = "EDGE_NOT_FOUND", e.EDGE_SOURCE_MISSING = "EDGE_SOURCE_MISSING", e.EDGE_TARGET_MISSING = "EDGE_TARGET_MISSING", e.EDGE_TYPE_MISSING = "EDGE_TYPE_MISSING", e.EDGE_SOURCE_TARGET_SAME = "EDGE_SOURCE_TARGET_SAME", e.EDGE_SOURCE_TARGET_MISSING = "EDGE_SOURCE_TARGET_MISSING", e.EDGE_ORPHANED = "EDGE_ORPHANED", e.USEVUEFLOW_OPTIONS = "USEVUEFLOW_OPTIONS", e))(We || {});
const pu = {
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
    super((o = pu[t]) == null ? void 0 : o.call(pu, ...n)), this.name = "VueFlowError", this.code = t, this.args = n;
  }
}
function ul(e) {
  return "clientX" in e;
}
function af(e) {
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
function M2(e) {
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
function uf() {
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
function hu(e, t, n, o) {
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
function O2(e, t, n, o, s, i) {
  const { x: r, y: l } = tn(e), c = t.elementsFromPoint(r, l).find((E) => E.classList.contains("vue-flow__handle"));
  if (c) {
    const E = c.getAttribute("data-nodeid");
    if (E) {
      const C = cl(void 0, c), x = c.getAttribute("data-handleid"), O = i({ nodeId: E, id: x, type: C });
      if (O) {
        const D = s.find((y) => y.nodeId === E && y.type === C && y.id === x);
        return {
          handle: {
            id: x,
            type: C,
            nodeId: E,
            x: (D == null ? void 0 : D.x) || n.x,
            y: (D == null ? void 0 : D.y) || n.y
          },
          validHandleResult: O
        };
      }
    }
  }
  let d = [], f = Number.POSITIVE_INFINITY;
  for (const E of s) {
    const C = Math.sqrt((E.x - n.x) ** 2 + (E.y - n.y) ** 2);
    if (C <= o) {
      const x = i(E);
      C <= f && (C < f ? d = [{ handle: E, validHandleResult: x }] : C === f && d.push({
        handle: E,
        validHandleResult: x
      }), f = C);
    }
  }
  if (!d.length)
    return { handle: null, validHandleResult: uf() };
  if (d.length === 1)
    return d[0];
  const g = d.some(({ validHandleResult: E }) => E.isValid), m = d.some(({ handle: E }) => E.type === "target");
  return d.find(
    ({ handle: E, validHandleResult: C }) => m ? E.type === "target" : g ? C.isValid : !0
  ) || d[0];
}
function vu(e, t, n, o, s, i, r, l, a, c, d) {
  const f = i === "target", g = l.querySelector(`.vue-flow__handle[data-id="${t == null ? void 0 : t.nodeId}-${t == null ? void 0 : t.id}-${t == null ? void 0 : t.type}"]`), { x: m, y: E } = tn(e), C = l.elementFromPoint(m, E), x = C != null && C.classList.contains("vue-flow__handle") ? C : g, O = uf();
  if (x) {
    O.handleDomNode = x;
    const D = cl(void 0, x), y = x.getAttribute("data-nodeid"), w = x.getAttribute("data-handleid"), z = x.classList.contains("connectable"), U = x.classList.contains("connectableend"), W = {
      source: f ? y : o,
      sourceHandle: f ? w : s,
      target: f ? o : y,
      targetHandle: f ? s : w
    };
    O.connection = W, z && U && (n === Hn.Strict ? f && D === "source" || !f && D === "target" : y !== o || w !== s) && (O.isValid = r(W, {
      edges: a,
      nodes: c,
      sourceNode: d(W.source),
      targetNode: d(W.target)
    }), O.endHandle = {
      nodeId: y,
      handleId: w,
      type: D,
      position: O.isValid ? x.getAttribute("data-handlepos") : null
    });
  }
  return O;
}
function T2({ nodes: e, nodeId: t, handleId: n, handleType: o }) {
  const s = [];
  for (let i = 0; i < e.length; i++) {
    const r = e[i], { handleBounds: l } = r;
    let a = [], c = [];
    l && (a = hu(r, l, "source", `${t}-${n}-${o}`), c = hu(r, l, "target", `${t}-${n}-${o}`)), s.push(...a, ...c);
  }
  return s;
}
function cl(e, t) {
  return e || (t != null && t.classList.contains("target") ? "target" : t != null && t.classList.contains("source") ? "source" : null);
}
function P2(e, t) {
  let n = null;
  return t ? n = "valid" : e && !t && (n = "invalid"), n;
}
const D2 = ["production", "prod"];
function vi(e, ...t) {
  cf() && console.warn(`[Vue Flow]: ${e}`, ...t);
}
function cf() {
  return !D2.includes("production");
}
function gu(e, t, n, o) {
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
  return typeof F(e) < "u";
}
function R2(e, t, n, o) {
  if (!e || !e.source || !e.target)
    return n(new Qe(We.EDGE_INVALID, (e == null ? void 0 : e.id) ?? "[ID UNKNOWN]")), !1;
  let s;
  return En(e) ? s = e : s = {
    ...e,
    id: Jd(e)
  }, s = Wd(s, void 0, o), _2(s, t) ? !1 : s;
}
function A2(e, t, n, o, s) {
  if (!t.source || !t.target)
    return s(new Qe(We.EDGE_INVALID, e.id)), !1;
  if (!n)
    return s(new Qe(We.EDGE_NOT_FOUND, e.id)), !1;
  const { id: i, ...r } = e;
  return {
    ...r,
    id: o ? Jd(t) : i,
    source: t.source,
    target: t.target,
    sourceHandle: t.sourceHandle,
    targetHandle: t.targetHandle
  };
}
function mu(e, t, n) {
  const o = {}, s = [];
  for (let i = 0; i < e.length; ++i) {
    const r = e[i];
    if (!Ln(r)) {
      n(
        new Qe(We.NODE_INVALID, r == null ? void 0 : r.id) || `[ID UNKNOWN|INDEX ${i}]`
      );
      continue;
    }
    const l = m2(r, t(r.id), r.parentNode);
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
    const { id: o, source: s, target: i, sourceHandle: r = null, targetHandle: l = null } = n, a = `${s}-source-${r}`, c = `${i}-target-${l}`, d = e.get(a) || /* @__PURE__ */ new Map(), f = e.get(c) || /* @__PURE__ */ new Map(), g = An({ edgeId: o, source: s, target: i, sourceHandle: r, targetHandle: l });
    e.set(a, d.set(`${i}-${l}`, g)), e.set(c, f.set(`${s}-${r}`, g));
  }
}
function qi(e, t, n, o, s, i, r, l) {
  const a = [];
  for (const c of e) {
    const d = En(c) ? c : R2(c, l, s, i);
    if (!d)
      continue;
    const f = n(d.source), g = n(d.target);
    if (!f || !g) {
      s(new Qe(We.EDGE_SOURCE_TARGET_MISSING, d.id, d.source, d.target));
      continue;
    }
    if (!f) {
      s(new Qe(We.EDGE_SOURCE_MISSING, d.id, d.source));
      continue;
    }
    if (!g) {
      s(new Qe(We.EDGE_TARGET_MISSING, d.id, d.target));
      continue;
    }
    if (t && !t(d, {
      edges: l,
      nodes: r,
      sourceNode: f,
      targetNode: g
    })) {
      s(new Qe(We.EDGE_INVALID, d.id));
      continue;
    }
    const m = o(d.id);
    a.push({
      ...Wd(d, m, i),
      sourceNode: f,
      targetNode: g
    });
  }
  return a;
}
const yu = Symbol("vueFlow"), df = Symbol("nodeId"), ff = Symbol("nodeRef"), V2 = Symbol("edgeId"), L2 = Symbol("edgeRef"), gi = Symbol("slots");
function pf(e) {
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
    nodesDraggable: f,
    panBy: g,
    findNode: m,
    multiSelectionActive: E,
    nodesSelectionActive: C,
    selectNodesOnDrag: x,
    removeSelectedElements: O,
    addSelectedNodes: D,
    updateNodePositions: y,
    emits: w
  } = He(), { onStart: z, onDrag: U, onStop: W, onClick: G, el: P, disabled: L, id: q, selectable: H, dragHandle: K } = e, S = Q(!1);
  let A = [], M, R = null, j = { x: void 0, y: void 0 }, ne = { x: 0, y: 0 }, re = null, ue = !1, se = 0, fe = !1;
  const ce = F2(), ge = ({ x: X, y: p }) => {
    j = { x: X, y: p };
    let I = !1;
    if (A = A.map((b) => {
      const _ = { x: X - b.distance.x, y: p - b.distance.y }, { computedPosition: k } = al(
        b,
        n.value ? hi(_, o.value) : _,
        w.error,
        r.value,
        b.parentNode ? m(b.parentNode) : void 0
      );
      return I = I || b.position.x !== k.x || b.position.y !== k.y, b.position = k, b;
    }), !!I && (y(A, !0, !0), S.value = !0, re)) {
      const [b, _] = ji({
        id: q,
        dragItems: A,
        findNode: m
      });
      U({ event: re, node: b, nodes: _ });
    }
  }, ee = () => {
    if (!R)
      return;
    const [X, p] = rf(ne, R, d.value);
    if (X !== 0 || p !== 0) {
      const I = {
        x: (j.x ?? 0) - X / a.value.zoom,
        y: (j.y ?? 0) - p / a.value.zoom
      };
      g({ x: X, y: p }) && ge(I);
    }
    se = requestAnimationFrame(ee);
  }, _e = (X, p) => {
    ue = !0;
    const I = m(q);
    !x.value && !E.value && I && (I.selected || O()), I && Pe(H) && x.value && Nr(
      I,
      E.value,
      D,
      O,
      C,
      !1,
      p
    );
    const b = ce(X.sourceEvent);
    if (j = b, A = x2(i.value, f.value, b, m, q), A.length) {
      const [_, k] = ji({
        id: q,
        dragItems: A,
        findNode: m
      });
      z({ event: X.sourceEvent, node: _, nodes: k });
    }
  }, xe = (X, p) => {
    var I;
    X.sourceEvent.type === "touchmove" && X.sourceEvent.touches.length > 1 || (l.value === 0 && _e(X, p), j = ce(X.sourceEvent), R = ((I = t.value) == null ? void 0 : I.getBoundingClientRect()) || null, ne = tn(X.sourceEvent, R));
  }, we = (X, p) => {
    const I = ce(X.sourceEvent);
    if (!fe && ue && c.value && (fe = !0, ee()), !ue) {
      const b = I.xSnapped - (j.x ?? 0), _ = I.ySnapped - (j.y ?? 0);
      Math.sqrt(b * b + _ * _) > l.value && _e(X, p);
    }
    (j.x !== I.xSnapped || j.y !== I.ySnapped) && A.length && ue && (re = X.sourceEvent, ne = tn(X.sourceEvent, R), ge(I));
  }, me = (X) => {
    if (!af(X) && !ue && !S.value && !E.value) {
      const p = X, I = ce(p), b = I.xSnapped - (j.x ?? 0), _ = I.ySnapped - (j.y ?? 0), k = Math.sqrt(b * b + _ * _);
      k !== 0 && k <= l.value && (G == null || G(p));
      return;
    }
    if (S.value = !1, fe = !1, ue = !1, j = { x: void 0, y: void 0 }, cancelAnimationFrame(se), A.length) {
      y(A, !1, !1);
      const [p, I] = ji({
        id: q,
        dragItems: A,
        findNode: m
      });
      W({ event: X.sourceEvent, node: p, nodes: I });
    }
  };
  return Ne([() => Pe(L), P], ([X, p], I, b) => {
    if (p) {
      const _ = Ct(p);
      X || (M = ww().on("start", (k) => xe(k, p)).on("drag", (k) => we(k, p)).on("end", (k) => me(k)).filter((k) => {
        const v = k.target, h = Pe(K);
        return !k.button && (!s.value || !du(v, `.${s.value}`, p) && (!h || du(v, h, p)));
      }), _.call(M)), b(() => {
        _.on(".drag", null), M && (M.on("start", null), M.on("drag", null), M.on("end", null));
      });
    }
  }), S;
}
function z2() {
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
function B2(e, t) {
  const n = z2();
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
function F2() {
  const { viewport: e, snapGrid: t, snapToGrid: n } = He();
  return (o) => {
    const s = af(o) ? o.sourceEvent : o, { x: i, y: r } = tn(s), l = Xo({ x: i, y: r }, e.value), { x: a, y: c } = n.value ? hi(l, t.value) : l;
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
function hf({
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
    connectionClickStartHandle: f,
    nodesConnectable: g,
    autoPanOnConnect: m,
    autoPanSpeed: E,
    findNode: C,
    panBy: x,
    startConnection: O,
    updateConnection: D,
    endConnection: y,
    emits: w,
    viewport: z,
    edges: U,
    nodes: W,
    isValidConnection: G
  } = He();
  let P = null, L = !1, q = null, H = null;
  function K(A) {
    var M;
    const R = Pe(n) === "target", j = ul(A), ne = su(A.target);
    if (j && A.button === 0 || !j) {
      let re = function(k) {
        p = tn(k, me);
        const { handle: v, validHandleResult: h } = O2(
          k,
          ne,
          Xo(p, z.value, !1, [1, 1]),
          c.value,
          b,
          (B) => vu(
            k,
            B,
            a.value,
            Pe(t),
            Pe(e),
            R ? "target" : "source",
            fe,
            ne,
            U.value,
            W.value,
            C
          )
        );
        if (ce = v, I || (_(), I = !0), P = h.connection, L = h.isValid, q = h.handleDomNode, !(L && ce && (H != null && H.endHandle) && h.endHandle && H.endHandle.type === h.endHandle.type && H.endHandle.nodeId === h.endHandle.nodeId && H.endHandle.handleId === h.endHandle.handleId)) {
          if (D(
            ce && L ? Qd(
              {
                x: ce.x,
                y: ce.y
              },
              z.value
            ) : p,
            h.endHandle,
            P2(!!ce, L)
          ), H = h, !ce && !L && !q)
            return Gi(X);
          P && P.source !== P.target && q && (Gi(X), X = q, q.classList.add("connecting", "vue-flow__handle-connecting"), q.classList.toggle("valid", L), q.classList.toggle("vue-flow__handle-valid", L));
        }
      }, ue = function(k) {
        (ce || q) && P && L && (i ? i(k, P) : w.connect(P)), w.connectEnd(k), s && (r == null || r(k)), Gi(X), cancelAnimationFrame(ge), y(k), I = !1, L = !1, P = null, q = null, ne.removeEventListener("mousemove", re), ne.removeEventListener("mouseup", ue), ne.removeEventListener("touchmove", re), ne.removeEventListener("touchend", ue);
      };
      const se = C(Pe(t));
      let fe = Pe(o) || G.value || gs;
      !fe && se && (fe = (R ? se.isValidSourcePos : se.isValidTargetPos) || gs);
      let ce, ge = 0;
      const { x: ee, y: _e } = tn(A), xe = ne == null ? void 0 : ne.elementFromPoint(ee, _e), we = cl(Pe(s), xe), me = (M = l.value) == null ? void 0 : M.getBoundingClientRect();
      if (!me || !we)
        return;
      let X, p = tn(A, me), I = !1;
      const b = T2({
        nodes: W.value,
        nodeId: Pe(t),
        handleId: Pe(e),
        handleType: we
      }), _ = () => {
        if (!m.value)
          return;
        const [k, v] = rf(p, me, E.value);
        x({ x: k, y: v }), ge = requestAnimationFrame(_);
      };
      O(
        {
          nodeId: Pe(t),
          handleId: Pe(e),
          type: we,
          position: (xe == null ? void 0 : xe.getAttribute("data-handlepos")) || ye.Top
        },
        {
          x: ee - me.left,
          y: _e - me.top
        }
      ), w.connectStart({ event: A, nodeId: Pe(t), handleId: Pe(e), handleType: we }), ne.addEventListener("mousemove", re), ne.addEventListener("mouseup", ue), ne.addEventListener("touchmove", re), ne.addEventListener("touchend", ue);
    }
  }
  function S(A) {
    if (!d.value)
      return;
    const M = Pe(n) === "target";
    if (!f.value)
      w.clickConnectStart({ event: A, nodeId: Pe(t), handleId: Pe(e) }), O({ nodeId: Pe(t), type: Pe(n), handleId: Pe(e) }, void 0, !0);
    else {
      let R = Pe(o) || G.value || gs;
      const j = C(Pe(t));
      if (!R && j && (R = (M ? j.isValidSourcePos : j.isValidTargetPos) || gs), j && (typeof j.connectable > "u" ? g.value : j.connectable) === !1)
        return;
      const ne = su(A.target), { connection: re, isValid: ue } = vu(
        A,
        {
          nodeId: Pe(t),
          id: Pe(e),
          type: Pe(n)
        },
        a.value,
        f.value.nodeId,
        f.value.handleId || null,
        f.value.type,
        R,
        ne,
        U.value,
        W.value,
        C
      ), se = re.source === re.target;
      ue && !se && w.connect(re), w.clickConnectEnd(A), y(A, !0);
    }
  }
  return {
    handlePointerDown: K,
    handleClick: S
  };
}
function U2() {
  return Lt(df, "");
}
function vf(e) {
  const t = e ?? U2() ?? "", n = Lt(ff, Q(null)), { findNode: o, edges: s, emits: i } = He(), r = o(t);
  return r || i.error(new Qe(We.NODE_NOT_FOUND, t)), {
    id: t,
    nodeEl: n,
    node: r,
    parentNode: ae(() => o(r.parentNode)),
    connectedEdges: ae(() => of([r], s.value))
  };
}
function H2() {
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
function j2(e, t) {
  const n = H2();
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
function gf() {
  const { getSelectedNodes: e, nodeExtent: t, updateNodePositions: n, findNode: o, snapGrid: s, snapToGrid: i, nodesDraggable: r, emits: l } = He();
  return (a, c = !1) => {
    const d = i.value ? s.value[0] : 5, f = i.value ? s.value[1] : 5, g = c ? 4 : 1, m = a.x * d * g, E = a.y * f * g, C = [];
    for (const x of e.value)
      if (x.draggable || r && typeof x.draggable > "u") {
        const O = { x: x.computedPosition.x + m, y: x.computedPosition.y + E }, { computedPosition: D } = al(
          x,
          O,
          l.error,
          t.value,
          x.parentNode ? o(x.parentNode) : void 0
        );
        C.push({
          id: x.id,
          position: D,
          from: x.position,
          distance: { x: a.x, y: a.y },
          dimensions: x.dimensions
        });
      }
    n(C, !0, !1);
  };
}
const Xi = 0.1;
function ln() {
  return vi("Viewport not initialized yet."), Promise.resolve(!1);
}
const G2 = {
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
function Y2(e) {
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
      const { x: a, y: c } = Kd({ x: -o, y: -s }, e.translateExtent), d = fo.translate(-a, -c).scale(i);
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
      for (const g of e.nodes)
        g.dimensions.width && g.dimensions.height && ((s == null ? void 0 : s.includeHiddenNodes) || !g.hidden) && (!((i = s.nodes) != null && i.length) || (r = s.nodes) != null && r.length && s.nodes.includes(g.id)) && l.push(g);
      if (!l.length)
        return Promise.resolve(!1);
      const a = tf(l), { x: c, y: d, zoom: f } = iu(
        a,
        e.dimensions.width,
        e.dimensions.height,
        s.minZoom ?? e.minZoom,
        s.maxZoom ?? e.maxZoom,
        s.padding ?? Xi,
        s.offset
      );
      return n(c, d, f, s == null ? void 0 : s.duration);
    },
    setCenter: (s, i, r) => {
      const l = typeof (r == null ? void 0 : r.zoom) < "u" ? r.zoom : e.maxZoom, a = e.dimensions.width / 2 - s * l, c = e.dimensions.height / 2 - i * l;
      return n(a, c, l, r == null ? void 0 : r.duration);
    },
    fitBounds: (s, i = { padding: Xi }) => {
      const { x: r, y: l, zoom: a } = iu(
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
        return Qd(l, e.viewport);
      }
      return { x: 0, y: 0 };
    }
  } : G2);
}
function Ki(e, t = 0, n) {
  return e.transition().duration(t).on("end", n);
}
function q2(e, t, n) {
  const o = Pu(!0);
  return o.run(() => {
    const s = () => {
      o.run(() => {
        let C, x, O = !!(n.nodes.value.length || n.edges.value.length);
        C = qn([e.modelValue, () => {
          var D, y;
          return (y = (D = e.modelValue) == null ? void 0 : D.value) == null ? void 0 : y.length;
        }], ([D]) => {
          D && Array.isArray(D) && (x == null || x.pause(), n.setElements(D), !x && !O && D.length ? O = !0 : x == null || x.resume());
        }), x = qn(
          [n.nodes, n.edges, () => n.edges.value.length, () => n.nodes.value.length],
          ([D, y]) => {
            var w;
            (w = e.modelValue) != null && w.value && Array.isArray(e.modelValue.value) && (C == null || C.pause(), e.modelValue.value = [...D, ...y], nt(() => {
              C == null || C.resume();
            }));
          },
          { immediate: O }
        ), _s(() => {
          C == null || C.stop(), x == null || x.stop();
        });
      });
    }, i = () => {
      o.run(() => {
        let C, x, O = !!n.nodes.value.length;
        C = qn([e.nodes, () => {
          var D, y;
          return (y = (D = e.nodes) == null ? void 0 : D.value) == null ? void 0 : y.length;
        }], ([D]) => {
          D && Array.isArray(D) && (x == null || x.pause(), n.setNodes(D), !x && !O && D.length ? O = !0 : x == null || x.resume());
        }), x = qn(
          [n.nodes, () => n.nodes.value.length],
          ([D]) => {
            var y;
            (y = e.nodes) != null && y.value && Array.isArray(e.nodes.value) && (C == null || C.pause(), e.nodes.value = [...D], nt(() => {
              C == null || C.resume();
            }));
          },
          { immediate: O }
        ), _s(() => {
          C == null || C.stop(), x == null || x.stop();
        });
      });
    }, r = () => {
      o.run(() => {
        let C, x, O = !!n.edges.value.length;
        C = qn([e.edges, () => {
          var D, y;
          return (y = (D = e.edges) == null ? void 0 : D.value) == null ? void 0 : y.length;
        }], ([D]) => {
          D && Array.isArray(D) && (x == null || x.pause(), n.setEdges(D), !x && !O && D.length ? O = !0 : x == null || x.resume());
        }), x = qn(
          [n.edges, () => n.edges.value.length],
          ([D]) => {
            var y;
            (y = e.edges) != null && y.value && Array.isArray(e.edges.value) && (C == null || C.pause(), e.edges.value = [...D], nt(() => {
              C == null || C.resume();
            }));
          },
          { immediate: O }
        ), _s(() => {
          C == null || C.stop(), x == null || x.stop();
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
    }, f = () => {
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
    }, g = () => {
      o.run(() => {
        const C = async (x) => {
          let O = x;
          typeof t.autoConnect == "function" && (O = await t.autoConnect(x)), O !== !1 && n.addEdges([O]);
        };
        Ne(
          () => t.autoConnect,
          () => {
            Ke(t.autoConnect) && (n.autoConnect.value = t.autoConnect);
          },
          { immediate: !0 }
        ), Ne(
          n.autoConnect,
          (x, O, D) => {
            x ? n.onConnect(C) : n.hooks.value.connect.off(C), D(() => {
              n.hooks.value.connect.off(C);
            });
          },
          { immediate: !0 }
        );
      });
    }, m = () => {
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
      for (const x of Object.keys(t)) {
        const O = x;
        if (!C.includes(O)) {
          const D = Ue(() => t[O]), y = n[O];
          Xe(y) && o.run(() => {
            Ne(
              D,
              (w) => {
                Ke(w) && (y.value = w);
              },
              { immediate: !0 }
            );
          });
        }
      }
    };
    (() => {
      s(), i(), r(), a(), l(), c(), d(), f(), g(), m();
    })();
  }), () => o.stop();
}
function X2() {
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
function K2(e, t) {
  sc(() => {
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
function mf() {
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
    hooks: X2(),
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
const W2 = [
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
function Z2(e, t, n) {
  const o = Y2(e), s = (b) => {
    const _ = b ?? [];
    e.hooks.updateNodeInternals.trigger(_);
  }, i = (b) => b2(b, e.nodes, e.edges), r = (b) => y2(b, e.nodes, e.edges), l = (b) => of(b, e.edges), a = ({ id: b, type: _, nodeId: k }) => {
    var v;
    return Array.from(((v = e.connectionLookup.get(`${k}-${_}-${b ?? null}`)) == null ? void 0 : v.values()) ?? []);
  }, c = (b) => {
    if (b)
      return t.value.get(b);
  }, d = (b) => {
    if (b)
      return n.value.get(b);
  }, f = (b, _, k) => {
    var v, h;
    const B = [];
    for (const Y of b) {
      const N = {
        id: Y.id,
        type: "position",
        dragging: k,
        from: Y.from
      };
      if (_ && (N.position = Y.position, Y.parentNode)) {
        const te = c(Y.parentNode);
        N.position = {
          x: N.position.x - (((v = te == null ? void 0 : te.computedPosition) == null ? void 0 : v.x) ?? 0),
          y: N.position.y - (((h = te == null ? void 0 : te.computedPosition) == null ? void 0 : h.y) ?? 0)
        };
      }
      B.push(N);
    }
    B != null && B.length && e.hooks.nodesChange.trigger(B);
  }, g = (b) => {
    if (!e.vueFlowRef)
      return;
    const _ = e.vueFlowRef.querySelector(".vue-flow__transformationpane");
    if (!_)
      return;
    const k = window.getComputedStyle(_), { m22: v } = new window.DOMMatrixReadOnly(k.transform), h = [];
    for (let B = 0; B < b.length; ++B) {
      const Y = b[B], N = c(Y.id);
      if (N) {
        const te = pi(Y.nodeElement);
        if (!!(te.width && te.height && (N.dimensions.width !== te.width || N.dimensions.height !== te.height || Y.forceUpdate))) {
          const ie = Y.nodeElement.getBoundingClientRect();
          N.dimensions = te, N.handleBounds.source = gu(".source", Y.nodeElement, ie, v), N.handleBounds.target = gu(".target", Y.nodeElement, ie, v), h.push({
            id: N.id,
            type: "dimensions",
            dimensions: te
          });
        }
      }
    }
    !e.fitViewOnInitDone && e.fitViewOnInit && o.value.fitView().then(() => {
      e.fitViewOnInitDone = !0;
    }), h.length && e.hooks.nodesChange.trigger(h);
  }, m = (b, _) => {
    const k = /* @__PURE__ */ new Set(), v = /* @__PURE__ */ new Set();
    for (const Y of b)
      Ln(Y) ? k.add(Y.id) : En(Y) && v.add(Y.id);
    const h = fn(t.value, k, !0), B = fn(n.value, v);
    if (e.multiSelectionActive) {
      for (const Y of k)
        h.push(an(Y, _));
      for (const Y of v)
        B.push(an(Y, _));
    }
    h.length && e.hooks.nodesChange.trigger(h), B.length && e.hooks.edgesChange.trigger(B);
  }, E = (b) => {
    if (e.multiSelectionActive) {
      const _ = b.map((k) => an(k.id, !0));
      e.hooks.nodesChange.trigger(_);
      return;
    }
    e.hooks.nodesChange.trigger(fn(t.value, new Set(b.map((_) => _.id)), !0)), e.hooks.edgesChange.trigger(fn(n.value));
  }, C = (b) => {
    if (e.multiSelectionActive) {
      const _ = b.map((k) => an(k.id, !0));
      e.hooks.edgesChange.trigger(_);
      return;
    }
    e.hooks.edgesChange.trigger(fn(n.value, new Set(b.map((_) => _.id)))), e.hooks.nodesChange.trigger(fn(t.value, /* @__PURE__ */ new Set(), !0));
  }, x = (b) => {
    m(b, !0);
  }, O = (b) => {
    const k = (b || e.nodes).map((v) => (v.selected = !1, an(v.id, !1)));
    e.hooks.nodesChange.trigger(k);
  }, D = (b) => {
    const k = (b || e.edges).map((v) => (v.selected = !1, an(v.id, !1)));
    e.hooks.edgesChange.trigger(k);
  }, y = (b) => {
    if (!b || !b.length)
      return m([], !1);
    const _ = b.reduce(
      (k, v) => {
        const h = an(v.id, !1);
        return Ln(v) ? k.nodes.push(h) : k.edges.push(h), k;
      },
      { nodes: [], edges: [] }
    );
    _.nodes.length && e.hooks.nodesChange.trigger(_.nodes), _.edges.length && e.hooks.edgesChange.trigger(_.edges);
  }, w = (b) => {
    var _;
    (_ = e.d3Zoom) == null || _.scaleExtent([b, e.maxZoom]), e.minZoom = b;
  }, z = (b) => {
    var _;
    (_ = e.d3Zoom) == null || _.scaleExtent([e.minZoom, b]), e.maxZoom = b;
  }, U = (b) => {
    var _;
    (_ = e.d3Zoom) == null || _.translateExtent(b), e.translateExtent = b;
  }, W = (b) => {
    e.nodeExtent = b, s();
  }, G = (b) => {
    var _;
    (_ = e.d3Zoom) == null || _.clickDistance(b);
  }, P = (b) => {
    e.nodesDraggable = b, e.nodesConnectable = b, e.elementsSelectable = b;
  }, L = (b) => {
    const _ = b instanceof Function ? b(e.nodes) : b;
    !e.initialized && !_.length || (e.nodes = mu(_, c, e.hooks.error.trigger));
  }, q = (b) => {
    const _ = b instanceof Function ? b(e.edges) : b;
    if (!e.initialized && !_.length)
      return;
    const k = qi(
      _,
      e.isValidConnection,
      c,
      d,
      e.hooks.error.trigger,
      e.defaultEdgeOptions,
      e.nodes,
      e.edges
    );
    Yi(e.connectionLookup, k), e.edges = k;
  }, H = (b) => {
    const _ = b instanceof Function ? b([...e.nodes, ...e.edges]) : b;
    !e.initialized && !_.length || (L(_.filter(Ln)), q(_.filter(En)));
  }, K = (b) => {
    let _ = b instanceof Function ? b(e.nodes) : b;
    _ = Array.isArray(_) ? _ : [_];
    const k = mu(_, c, e.hooks.error.trigger), v = [];
    for (const h of k)
      v.push(au(h));
    v.length && e.hooks.nodesChange.trigger(v);
  }, S = (b) => {
    let _ = b instanceof Function ? b(e.edges) : b;
    _ = Array.isArray(_) ? _ : [_];
    const k = qi(
      _,
      e.isValidConnection,
      c,
      d,
      e.hooks.error.trigger,
      e.defaultEdgeOptions,
      e.nodes,
      e.edges
    ), v = [];
    for (const h of k)
      v.push(au(h));
    v.length && e.hooks.edgesChange.trigger(v);
  }, A = (b, _ = !0, k = !1) => {
    const v = b instanceof Function ? b(e.nodes) : b, h = Array.isArray(v) ? v : [v], B = [], Y = [];
    function N(Z) {
      const ie = l(Z);
      for (const de of ie)
        (!Ke(de.deletable) || de.deletable) && Y.push(cu(de.id, de.source, de.target, de.sourceHandle, de.targetHandle));
    }
    function te(Z) {
      const ie = [];
      for (const de of e.nodes)
        de.parentNode === Z && ie.push(de);
      if (ie.length) {
        for (const de of ie)
          B.push(uu(de.id));
        _ && N(ie);
        for (const de of ie)
          te(de.id);
      }
    }
    for (const Z of h) {
      const ie = typeof Z == "string" ? c(Z) : Z;
      ie && (Ke(ie.deletable) && !ie.deletable || (B.push(uu(ie.id)), _ && N([ie]), k && te(ie.id)));
    }
    Y.length && e.hooks.edgesChange.trigger(Y), B.length && e.hooks.nodesChange.trigger(B);
  }, M = (b) => {
    const _ = b instanceof Function ? b(e.edges) : b, k = Array.isArray(_) ? _ : [_], v = [];
    for (const h of k) {
      const B = typeof h == "string" ? d(h) : h;
      B && (Ke(B.deletable) && !B.deletable || v.push(
        cu(
          typeof h == "string" ? h : h.id,
          B.source,
          B.target,
          B.sourceHandle,
          B.targetHandle
        )
      ));
    }
    e.hooks.edgesChange.trigger(v);
  }, R = (b, _, k = !0) => {
    const v = d(b.id), h = A2(b, _, v, k, e.hooks.error.trigger);
    if (h) {
      const [B] = qi(
        [h],
        e.isValidConnection,
        c,
        d,
        e.hooks.error.trigger,
        e.defaultEdgeOptions,
        e.nodes,
        e.edges
      );
      return e.edges.splice(e.edges.indexOf(v), 1, B), Yi(e.connectionLookup, [B]), B;
    }
    return !1;
  }, j = (b, _, k = { replace: !1 }) => {
    const v = d(b);
    if (!v)
      return;
    const h = typeof _ == "function" ? _(v) : _;
    v.data = k.replace ? h : { ...v.data, ...h };
  }, ne = (b) => lu(b, e.nodes), re = (b) => {
    const _ = lu(b, e.edges);
    return Yi(e.connectionLookup, _), _;
  }, ue = (b, _, k = { replace: !1 }) => {
    const v = c(b);
    if (!v)
      return;
    const h = typeof _ == "function" ? _(v) : _;
    k.replace ? e.nodes.splice(e.nodes.indexOf(v), 1, h) : Object.assign(v, h);
  }, se = (b, _, k = { replace: !1 }) => {
    const v = c(b);
    if (!v)
      return;
    const h = typeof _ == "function" ? _(v) : _;
    v.data = k.replace ? h : { ...v.data, ...h };
  }, fe = (b, _, k = !1) => {
    k ? e.connectionClickStartHandle = b : e.connectionStartHandle = b, e.connectionEndHandle = null, e.connectionStatus = null, _ && (e.connectionPosition = _);
  }, ce = (b, _ = null, k = null) => {
    e.connectionStartHandle && (e.connectionPosition = b, e.connectionEndHandle = _, e.connectionStatus = k);
  }, ge = (b, _) => {
    e.connectionPosition = { x: Number.NaN, y: Number.NaN }, e.connectionEndHandle = null, e.connectionStatus = null, _ ? e.connectionClickStartHandle = null : e.connectionStartHandle = null;
  }, ee = (b) => {
    const _ = g2(b), k = _ ? null : No(b) ? b : c(b.id);
    return !_ && !k ? [null, null, _] : [_ ? b : Cr(k), k, _];
  }, _e = (b, _ = !0, k = e.nodes) => {
    const [v, h, B] = ee(b);
    if (!v)
      return [];
    const Y = [];
    for (const N of k || e.nodes) {
      if (!B && (N.id === h.id || !N.computedPosition))
        continue;
      const te = Cr(N), Z = $r(te, v);
      (_ && Z > 0 || Z >= Number(v.width) * Number(v.height)) && Y.push(N);
    }
    return Y;
  }, xe = (b, _, k = !0) => {
    const [v] = ee(b);
    if (!v)
      return !1;
    const h = $r(v, _);
    return k && h > 0 || h >= Number(v.width) * Number(v.height);
  }, we = (b) => {
    const { viewport: _, dimensions: k, d3Zoom: v, d3Selection: h, translateExtent: B } = e;
    if (!v || !h || !b.x && !b.y)
      return !1;
    const Y = fo.translate(_.x + b.x, _.y + b.y).scale(_.zoom), N = [
      [0, 0],
      [k.width, k.height]
    ], te = v.constrain()(Y, N, B), Z = e.viewport.x !== te.x || e.viewport.y !== te.y || e.viewport.zoom !== te.k;
    return v.transform(h, te), Z;
  }, me = (b) => {
    const _ = b instanceof Function ? b(e) : b, k = [
      "d3Zoom",
      "d3Selection",
      "d3ZoomHandler",
      "viewportRef",
      "vueFlowRef",
      "dimensions",
      "hooks"
    ];
    Ke(_.defaultEdgeOptions) && (e.defaultEdgeOptions = _.defaultEdgeOptions);
    const v = _.modelValue || _.nodes || _.edges ? [] : void 0;
    v && (_.modelValue && v.push(..._.modelValue), _.nodes && v.push(..._.nodes), _.edges && v.push(..._.edges), H(v));
    const h = () => {
      Ke(_.maxZoom) && z(_.maxZoom), Ke(_.minZoom) && w(_.minZoom), Ke(_.translateExtent) && U(_.translateExtent);
    };
    for (const B of Object.keys(_)) {
      const Y = B, N = _[Y];
      ![...W2, ...k].includes(Y) && Ke(N) && (e[Y] = N);
    }
    vr(() => e.d3Zoom).not.toBeNull().then(h), e.initialized || (e.initialized = !0);
  };
  return {
    updateNodePositions: f,
    updateNodeDimensions: g,
    setElements: H,
    setNodes: L,
    setEdges: q,
    addNodes: K,
    addEdges: S,
    removeNodes: A,
    removeEdges: M,
    findNode: c,
    findEdge: d,
    updateEdge: R,
    updateEdgeData: j,
    updateNode: ue,
    updateNodeData: se,
    applyEdgeChanges: re,
    applyNodeChanges: ne,
    addSelectedElements: x,
    addSelectedNodes: E,
    addSelectedEdges: C,
    setMinZoom: w,
    setMaxZoom: z,
    setTranslateExtent: U,
    setNodeExtent: W,
    setPaneClickDistance: G,
    removeSelectedElements: y,
    removeSelectedNodes: O,
    removeSelectedEdges: D,
    startConnection: fe,
    updateConnection: ce,
    endConnection: ge,
    setInteractive: P,
    setState: me,
    getIntersectingNodes: _e,
    getIncomers: i,
    getOutgoers: r,
    getConnectedEdges: l,
    getHandleConnections: a,
    isNodeIntersecting: xe,
    panBy: we,
    fitView: (b) => o.value.fitView(b),
    zoomIn: (b) => o.value.zoomIn(b),
    zoomOut: (b) => o.value.zoomOut(b),
    zoomTo: (b, _) => o.value.zoomTo(b, _),
    setViewport: (b, _) => o.value.setViewport(b, _),
    setTransform: (b, _) => o.value.setTransform(b, _),
    getViewport: () => o.value.getViewport(),
    getTransform: () => o.value.getTransform(),
    setCenter: (b, _, k) => o.value.setCenter(b, _, k),
    fitBounds: (b, _) => o.value.fitBounds(b, _),
    project: (b) => o.value.project(b),
    screenToFlowCoordinate: (b) => o.value.screenToFlowCoordinate(b),
    flowToScreenCoordinate: (b) => o.value.flowToScreenCoordinate(b),
    toObject: () => {
      const b = [], _ = [];
      for (const k of e.nodes) {
        const {
          computedPosition: v,
          handleBounds: h,
          selected: B,
          dimensions: Y,
          isParent: N,
          resizing: te,
          dragging: Z,
          events: ie,
          ...de
        } = k;
        b.push(de);
      }
      for (const k of e.edges) {
        const { selected: v, sourceNode: h, targetNode: B, events: Y, ...N } = k;
        _.push(N);
      }
      return JSON.parse(
        JSON.stringify({
          nodes: b,
          edges: _,
          position: [e.viewport.x, e.viewport.y],
          zoom: e.viewport.zoom,
          viewport: e.viewport
        })
      );
    },
    fromObject: (b) => new Promise((_) => {
      const { nodes: k, edges: v, position: h, zoom: B, viewport: Y } = b;
      if (k && L(k), v && q(v), Y != null && Y.x && (Y != null && Y.y) || h) {
        const N = (Y == null ? void 0 : Y.x) || h[0], te = (Y == null ? void 0 : Y.y) || h[1], Z = (Y == null ? void 0 : Y.zoom) || B || e.viewport.zoom;
        return vr(() => o.value.viewportInitialized).toBe(!0).then(() => {
          o.value.setViewport({
            x: N,
            y: te,
            zoom: Z
          }).then(() => {
            _(!0);
          });
        });
      } else
        _(!0);
    }),
    updateNodeInternals: s,
    viewportHelper: o,
    $reset: () => {
      const b = mf();
      if (e.edges = [], e.nodes = [], e.d3Zoom && e.d3Selection) {
        const _ = fo.translate(b.defaultViewport.x ?? 0, b.defaultViewport.y ?? 0).scale(jn(b.defaultViewport.zoom ?? 1, b.minZoom, b.maxZoom)), k = e.viewportRef.getBoundingClientRect(), v = [
          [0, 0],
          [k.width, k.height]
        ], h = e.d3Zoom.constrain()(_, v, b.translateExtent);
        e.d3Zoom.transform(e.d3Selection, h);
      }
      me(b);
    },
    $destroy: () => {
    }
  };
}
const J2 = ["data-id", "data-handleid", "data-nodeid", "data-handlepos"], Q2 = {
  name: "Handle",
  compatConfig: { MODE: 3 }
}, _n = /* @__PURE__ */ Me({
  ...Q2,
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
    const n = fc(e, ["position", "connectable", "connectableStart", "connectableEnd", "id"]), o = Ue(() => n.type ?? "source"), s = Ue(() => n.isValidConnection ?? null), {
      connectionStartHandle: i,
      connectionClickStartHandle: r,
      connectionEndHandle: l,
      vueFlowRef: a,
      nodesConnectable: c,
      noDragClassName: d,
      noPanClassName: f
    } = He(), { id: g, node: m, nodeEl: E, connectedEdges: C } = vf(), x = Q(), O = Ue(() => typeof e.connectableStart < "u" ? e.connectableStart : !0), D = Ue(() => typeof e.connectableEnd < "u" ? e.connectableEnd : !0), y = Ue(
      () => {
        var L, q, H, K, S, A;
        return ((L = i.value) == null ? void 0 : L.nodeId) === g && ((q = i.value) == null ? void 0 : q.handleId) === e.id && ((H = i.value) == null ? void 0 : H.type) === o.value || ((K = l.value) == null ? void 0 : K.nodeId) === g && ((S = l.value) == null ? void 0 : S.handleId) === e.id && ((A = l.value) == null ? void 0 : A.type) === o.value;
      }
    ), w = Ue(
      () => {
        var L, q, H;
        return ((L = r.value) == null ? void 0 : L.nodeId) === g && ((q = r.value) == null ? void 0 : q.handleId) === e.id && ((H = r.value) == null ? void 0 : H.type) === o.value;
      }
    ), { handlePointerDown: z, handleClick: U } = hf({
      nodeId: g,
      handleId: e.id,
      isValidConnection: s,
      type: o
    }), W = ae(() => typeof e.connectable == "string" && e.connectable === "single" ? !C.value.some((L) => {
      const q = L[`${o.value}Handle`];
      return L[o.value] !== g ? !1 : q ? q === e.id : !0;
    }) : typeof e.connectable == "number" ? C.value.filter((L) => {
      const q = L[`${o.value}Handle`];
      return L[o.value] !== g ? !1 : q ? q === e.id : !0;
    }).length < e.connectable : typeof e.connectable == "function" ? e.connectable(m, C.value) : Ke(e.connectable) ? e.connectable : c.value);
    rt(() => {
      var L;
      if (!m.dimensions.width || !m.dimensions.height)
        return;
      const q = (L = m.handleBounds[o.value]) == null ? void 0 : L.find((j) => j.id === e.id);
      if (!a.value || q)
        return;
      const H = a.value.querySelector(".vue-flow__transformationpane");
      if (!E.value || !x.value || !H || !e.id)
        return;
      const K = E.value.getBoundingClientRect(), S = x.value.getBoundingClientRect(), A = window.getComputedStyle(H), { m22: M } = new window.DOMMatrixReadOnly(A.transform), R = {
        id: e.id,
        position: e.position,
        x: (S.left - K.left) / M,
        y: (S.top - K.top) / M,
        ...pi(x.value)
      };
      m.handleBounds[o.value] = [...m.handleBounds[o.value] ?? [], R];
    }), ni(() => {
      const L = m.handleBounds[o.value];
      L && (m.handleBounds[o.value] = L.filter((q) => q.id !== e.id));
    });
    function G(L) {
      const q = ul(L);
      W.value && O.value && (q && L.button === 0 || !q) && z(L);
    }
    function P(L) {
      !g || !r.value && !O.value || W.value && U(L);
    }
    return t({
      handleClick: U,
      handlePointerDown: z,
      onClick: P,
      onPointerDown: G
    }), (L, q) => ($(), T("div", {
      ref_key: "handle",
      ref: x,
      "data-id": `${F(g)}-${e.id}-${o.value}`,
      "data-handleid": e.id,
      "data-nodeid": F(g),
      "data-handlepos": L.position,
      class: ve(["vue-flow__handle", [
        `vue-flow__handle-${L.position}`,
        `vue-flow__handle-${e.id}`,
        F(d),
        F(f),
        o.value,
        {
          connectable: W.value,
          connecting: w.value,
          connectablestart: O.value,
          connectableend: D.value,
          connectionindicator: W.value && (O.value && !y.value || D.value && y.value)
        }
      ]]),
      onMousedown: G,
      onTouchstartPassive: G,
      onClick: P
    }, [
      Bn(L.$slots, "default", { id: L.id })
    ], 42, J2));
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
    typeof l != "string" && l ? Ae(l) : Ae(be, [l]),
    Ae(_n, { type: "source", position: e, connectable: o, isValidConnection: i })
  ];
};
mi.props = ["sourcePosition", "targetPosition", "label", "isValidTargetPos", "isValidSourcePos", "connectable", "data"];
mi.inheritAttrs = !1;
mi.compatConfig = { MODE: 3 };
const eE = mi, yi = function({
  targetPosition: e = ye.Top,
  label: t,
  connectable: n = !0,
  isValidTargetPos: o,
  data: s
}) {
  const i = s.label || t;
  return [
    Ae(_n, { type: "target", position: e, connectable: n, isValidConnection: o }),
    typeof i != "string" && i ? Ae(i) : Ae(be, [i])
  ];
};
yi.props = ["targetPosition", "label", "isValidTargetPos", "connectable", "data"];
yi.inheritAttrs = !1;
yi.compatConfig = { MODE: 3 };
const tE = yi, bi = function({
  sourcePosition: e = ye.Bottom,
  label: t,
  connectable: n = !0,
  isValidSourcePos: o,
  data: s
}) {
  const i = s.label || t;
  return [
    typeof i != "string" && i ? Ae(i) : Ae(be, [i]),
    Ae(_n, { type: "source", position: e, connectable: n, isValidConnection: o })
  ];
};
bi.props = ["sourcePosition", "label", "isValidSourcePos", "connectable", "data"];
bi.inheritAttrs = !1;
bi.compatConfig = { MODE: 3 };
const nE = bi, oE = ["transform"], sE = ["width", "height", "x", "y", "rx", "ry"], iE = ["y"], rE = {
  name: "EdgeText",
  compatConfig: { MODE: 3 }
}, lE = /* @__PURE__ */ Me({
  ...rE,
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
    const t = Q({ x: 0, y: 0, width: 0, height: 0 }), n = Q(null), o = ae(() => `translate(${e.x - t.value.width / 2} ${e.y - t.value.height / 2})`);
    rt(s), Ne([() => e.x, () => e.y, n, () => e.label], s);
    function s() {
      if (!n.value)
        return;
      const i = n.value.getBBox();
      (i.width !== t.value.width || i.height !== t.value.height) && (t.value = i);
    }
    return (i, r) => ($(), T("g", {
      transform: o.value,
      class: "vue-flow__edge-textwrapper"
    }, [
      i.labelShowBg ? ($(), T("rect", {
        key: 0,
        class: "vue-flow__edge-textbg",
        width: `${t.value.width + 2 * i.labelBgPadding[0]}px`,
        height: `${t.value.height + 2 * i.labelBgPadding[1]}px`,
        x: -i.labelBgPadding[0],
        y: -i.labelBgPadding[1],
        style: it(i.labelBgStyle),
        rx: i.labelBgBorderRadius,
        ry: i.labelBgBorderRadius
      }, null, 12, sE)) : le("", !0),
      u("text", qr(i.$attrs, {
        ref_key: "el",
        ref: n,
        class: "vue-flow__edge-text",
        y: t.value.height / 2,
        dy: "0.3em",
        style: i.labelStyle
      }), [
        Bn(i.$slots, "default", {}, () => [
          typeof i.label != "string" ? ($(), vt(ac(i.label), { key: 0 })) : ($(), T(be, { key: 1 }, [
            he(V(i.label), 1)
          ], 64))
        ])
      ], 16, iE)
    ], 8, oE));
  }
}), aE = ["id", "d", "marker-end", "marker-start"], uE = ["d", "stroke-width"], cE = {
  name: "BaseEdge",
  inheritAttrs: !1,
  compatConfig: { MODE: 3 }
}, os = /* @__PURE__ */ Me({
  ...cE,
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
    const n = fc(e, ["interactionWidth", "labelShowBg"]), o = Q(null), s = Q(null), i = Q(null), r = Dp();
    return t({
      pathEl: o,
      interactionEl: s,
      labelEl: i
    }), (l, a) => ($(), T(be, null, [
      u("path", {
        id: l.id,
        ref_key: "pathEl",
        ref: o,
        d: l.path,
        style: it(n.style),
        class: ve(["vue-flow__edge-path", F(r).class]),
        "marker-end": l.markerEnd,
        "marker-start": l.markerStart
      }, null, 14, aE),
      l.interactionWidth ? ($(), T("path", {
        key: 0,
        ref_key: "interactionEl",
        ref: s,
        fill: "none",
        d: l.path,
        "stroke-width": l.interactionWidth,
        "stroke-opacity": 0,
        class: "vue-flow__edge-interaction"
      }, null, 8, uE)) : le("", !0),
      l.label && l.labelX && l.labelY ? ($(), vt(lE, {
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
      }, null, 8, ["x", "y", "label", "label-show-bg", "label-bg-style", "label-bg-padding", "label-bg-border-radius", "label-style"])) : le("", !0)
    ], 64));
  }
});
function yf({
  sourceX: e,
  sourceY: t,
  targetX: n,
  targetY: o
}) {
  const s = Math.abs(n - e) / 2, i = n < e ? n + s : n - s, r = Math.abs(o - t) / 2, l = o < t ? o + r : o - r;
  return [i, l, s, r];
}
function bf({
  sourceX: e,
  sourceY: t,
  targetX: n,
  targetY: o,
  sourceControlX: s,
  sourceControlY: i,
  targetControlX: r,
  targetControlY: l
}) {
  const a = e * 0.125 + s * 0.375 + r * 0.375 + n * 0.125, c = t * 0.125 + i * 0.375 + l * 0.375 + o * 0.125, d = Math.abs(a - e), f = Math.abs(c - t);
  return [a, c, d, f];
}
function ms(e, t) {
  return e >= 0 ? 0.5 * e : t * 25 * Math.sqrt(-e);
}
function bu({ pos: e, x1: t, y1: n, x2: o, y2: s, c: i }) {
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
function _f(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: o = ye.Bottom,
    targetX: s,
    targetY: i,
    targetPosition: r = ye.Top,
    curvature: l = 0.25
  } = e, [a, c] = bu({
    pos: o,
    x1: t,
    y1: n,
    x2: s,
    y2: i,
    c: l
  }), [d, f] = bu({
    pos: r,
    x1: s,
    y1: i,
    x2: t,
    y2: n,
    c: l
  }), [g, m, E, C] = bf({
    sourceX: t,
    sourceY: n,
    targetX: s,
    targetY: i,
    sourceControlX: a,
    sourceControlY: c,
    targetControlX: d,
    targetControlY: f
  });
  return [
    `M${t},${n} C${a},${c} ${d},${f} ${s},${i}`,
    g,
    m,
    E,
    C
  ];
}
function _u({ pos: e, x1: t, y1: n, x2: o, y2: s }) {
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
function wf(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: o = ye.Bottom,
    targetX: s,
    targetY: i,
    targetPosition: r = ye.Top
  } = e, [l, a] = _u({
    pos: o,
    x1: t,
    y1: n,
    x2: s,
    y2: i
  }), [c, d] = _u({
    pos: r,
    x1: s,
    y1: i,
    x2: t,
    y2: n
  }), [f, g, m, E] = bf({
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
    f,
    g,
    m,
    E
  ];
}
const wu = {
  [ye.Left]: { x: -1, y: 0 },
  [ye.Right]: { x: 1, y: 0 },
  [ye.Top]: { x: 0, y: -1 },
  [ye.Bottom]: { x: 0, y: 1 }
};
function dE({
  source: e,
  sourcePosition: t = ye.Bottom,
  target: n
}) {
  return t === ye.Left || t === ye.Right ? e.x < n.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : e.y < n.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
}
function ku(e, t) {
  return Math.sqrt((t.x - e.x) ** 2 + (t.y - e.y) ** 2);
}
function fE({
  source: e,
  sourcePosition: t = ye.Bottom,
  target: n,
  targetPosition: o = ye.Top,
  center: s,
  offset: i
}) {
  const r = wu[t], l = wu[o], a = { x: e.x + r.x * i, y: e.y + r.y * i }, c = { x: n.x + l.x * i, y: n.y + l.y * i }, d = dE({
    source: a,
    sourcePosition: t,
    target: c
  }), f = d.x !== 0 ? "x" : "y", g = d[f];
  let m, E, C;
  const x = { x: 0, y: 0 }, O = { x: 0, y: 0 }, [D, y, w, z] = yf({
    sourceX: e.x,
    sourceY: e.y,
    targetX: n.x,
    targetY: n.y
  });
  if (r[f] * l[f] === -1) {
    E = s.x ?? D, C = s.y ?? y;
    const W = [
      { x: E, y: a.y },
      { x: E, y: c.y }
    ], G = [
      { x: a.x, y: C },
      { x: c.x, y: C }
    ];
    r[f] === g ? m = f === "x" ? W : G : m = f === "x" ? G : W;
  } else {
    const W = [{ x: a.x, y: c.y }], G = [{ x: c.x, y: a.y }];
    if (f === "x" ? m = r.x === g ? G : W : m = r.y === g ? W : G, t === o) {
      const K = Math.abs(e[f] - n[f]);
      if (K <= i) {
        const S = Math.min(i - 1, i - K);
        r[f] === g ? x[f] = (a[f] > e[f] ? -1 : 1) * S : O[f] = (c[f] > n[f] ? -1 : 1) * S;
      }
    }
    if (t !== o) {
      const K = f === "x" ? "y" : "x", S = r[f] === l[K], A = a[K] > c[K], M = a[K] < c[K];
      (r[f] === 1 && (!S && A || S && M) || r[f] !== 1 && (!S && M || S && A)) && (m = f === "x" ? W : G);
    }
    const P = { x: a.x + x.x, y: a.y + x.y }, L = { x: c.x + O.x, y: c.y + O.y }, q = Math.max(Math.abs(P.x - m[0].x), Math.abs(L.x - m[0].x)), H = Math.max(Math.abs(P.y - m[0].y), Math.abs(L.y - m[0].y));
    q >= H ? (E = (P.x + L.x) / 2, C = m[0].y) : (E = m[0].x, C = (P.y + L.y) / 2);
  }
  return [[
    e,
    { x: a.x + x.x, y: a.y + x.y },
    ...m,
    { x: c.x + O.x, y: c.y + O.y },
    n
  ], E, C, w, z];
}
function pE(e, t, n, o) {
  const s = Math.min(ku(e, t) / 2, ku(t, n) / 2, o), { x: i, y: r } = t;
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
  } = e, [f, g, m, E, C] = fE({
    source: { x: t, y: n },
    sourcePosition: o,
    target: { x: s, y: i },
    targetPosition: r,
    center: { x: a, y: c },
    offset: d
  });
  return [f.reduce((O, D, y) => {
    let w;
    return y > 0 && y < f.length - 1 ? w = pE(f[y - 1], D, f[y + 1], l) : w = `${y === 0 ? "M" : "L"}${D.x} ${D.y}`, O += w, O;
  }, ""), g, m, E, C];
}
function hE(e) {
  const { sourceX: t, sourceY: n, targetX: o, targetY: s } = e, [i, r, l, a] = yf({
    sourceX: t,
    sourceY: n,
    targetX: o,
    targetY: s
  });
  return [`M ${t},${n}L ${o},${s}`, i, r, l, a];
}
const vE = /* @__PURE__ */ Me({
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
      const [n, o, s] = hE(e);
      return Ae(os, {
        path: n,
        labelX: o,
        labelY: s,
        ...t,
        ...e
      });
    };
  }
}), gE = vE, mE = /* @__PURE__ */ Me({
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
}), kf = mE, yE = /* @__PURE__ */ Me({
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
    return () => Ae(kf, { ...e, ...t, borderRadius: 0 });
  }
}), bE = yE, _E = /* @__PURE__ */ Me({
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
      const [n, o, s] = _f({
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
}), wE = _E, kE = /* @__PURE__ */ Me({
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
}), EE = kE, xE = {
  input: nE,
  default: eE,
  output: tE
}, SE = {
  default: wE,
  straight: gE,
  step: bE,
  smoothstep: kf,
  simplebezier: EE
};
function CE(e, t, n) {
  const o = ae(() => (C) => t.value.get(C)), s = ae(() => (C) => n.value.get(C)), i = ae(() => {
    const C = {
      ...SE,
      ...e.edgeTypes
    }, x = Object.keys(C);
    for (const O of e.edges)
      O.type && !x.includes(O.type) && (C[O.type] = O.type);
    return C;
  }), r = ae(() => {
    const C = {
      ...xE,
      ...e.nodeTypes
    }, x = Object.keys(C);
    for (const O of e.nodes)
      O.type && !x.includes(O.type) && (C[O.type] = O.type);
    return C;
  }), l = ae(() => e.onlyRenderVisibleElements ? nf(
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
      const C = [];
      for (const x of e.edges) {
        const O = t.value.get(x.source), D = t.value.get(x.target);
        N2({
          sourcePos: O.computedPosition || { x: 0, y: 0 },
          targetPos: D.computedPosition || { x: 0, y: 0 },
          sourceWidth: O.dimensions.width,
          sourceHeight: O.dimensions.height,
          targetWidth: D.dimensions.width,
          targetHeight: D.dimensions.height,
          width: e.dimensions.width,
          height: e.dimensions.height,
          viewport: e.viewport
        }) && C.push(x);
      }
      return C;
    }
    return e.edges;
  }), c = ae(() => [...l.value, ...a.value]), d = ae(() => {
    const C = [];
    for (const x of e.nodes)
      x.selected && C.push(x);
    return C;
  }), f = ae(() => {
    const C = [];
    for (const x of e.edges)
      x.selected && C.push(x);
    return C;
  }), g = ae(() => [
    ...d.value,
    ...f.value
  ]), m = ae(() => {
    const C = [];
    for (const x of e.nodes)
      x.dimensions.width && x.dimensions.height && x.handleBounds !== void 0 && C.push(x);
    return C;
  }), E = ae(
    () => l.value.length > 0 && m.value.length === l.value.length
  );
  return {
    getNode: o,
    getEdge: s,
    getElements: c,
    getEdgeTypes: i,
    getNodeTypes: r,
    getEdges: a,
    getNodes: l,
    getSelectedElements: g,
    getSelectedNodes: d,
    getSelectedEdges: f,
    getNodesInitialized: m,
    areNodesInitialized: E
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
    const o = mf(), s = wn(o), i = {};
    for (const [g, m] of Object.entries(s.hooks)) {
      const E = `on${g.charAt(0).toUpperCase() + g.slice(1)}`;
      i[E] = m.on;
    }
    const r = {};
    for (const [g, m] of Object.entries(s.hooks))
      r[g] = m.trigger;
    const l = ae(() => {
      const g = /* @__PURE__ */ new Map();
      for (const m of s.nodes)
        g.set(m.id, m);
      return g;
    }), a = ae(() => {
      const g = /* @__PURE__ */ new Map();
      for (const m of s.edges)
        g.set(m.id, m);
      return g;
    }), c = CE(s, l, a), d = Z2(s, l, a);
    d.setState({ ...s, ...n });
    const f = {
      ...i,
      ...c,
      ...d,
      ...M0(s),
      nodeLookup: l,
      edgeLookup: a,
      emits: r,
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
function He(e) {
  const t = Tn.getInstance(), n = Rr(), o = typeof e == "object", s = o ? e : { id: e }, i = s.id, r = i ?? (n == null ? void 0 : n.vueFlowId);
  let l;
  if (n) {
    const a = Lt(yu, null);
    typeof a < "u" && a !== null && (!r || a.id === r) && (l = a);
  }
  if (l || r && (l = t.get(r)), !l || r && l.id !== r) {
    const a = i ?? t.getId(), c = t.create(a, s);
    l = c, (n ?? Pu(!0)).run(() => {
      Ne(
        c.applyDefault,
        (f, g, m) => {
          const E = (x) => {
            c.applyNodeChanges(x);
          }, C = (x) => {
            c.applyEdgeChanges(x);
          };
          f ? (c.onNodesChange(E), c.onEdgesChange(C)) : (c.hooks.value.nodesChange.off(E), c.hooks.value.edgesChange.off(C)), m(() => {
            c.hooks.value.nodesChange.off(E), c.hooks.value.edgesChange.off(C);
          });
        },
        { immediate: !0 }
      ), ai(() => {
        if (l) {
          const f = t.get(l.id);
          f ? f.$destroy() : vi(`No store instance found for id ${l.id} in storage.`);
        }
      });
    });
  } else
    o && l.setState(s);
  if (n && (Fn(yu, l), n.vueFlowId = l.id), o) {
    const a = ho();
    (a == null ? void 0 : a.type.name) !== "VueFlow" && l.emits.error(new Qe(We.USEVUEFLOW_OPTIONS));
  }
  return l;
}
function $E(e) {
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
const NE = {
  name: "UserSelection",
  compatConfig: { MODE: 3 }
}, IE = /* @__PURE__ */ Me({
  ...NE,
  props: {
    userSelectionRect: {}
  },
  setup(e) {
    return (t, n) => ($(), T("div", {
      class: "vue-flow__selection vue-flow__container",
      style: it({
        width: `${t.userSelectionRect.width}px`,
        height: `${t.userSelectionRect.height}px`,
        transform: `translate(${t.userSelectionRect.x}px, ${t.userSelectionRect.y}px)`
      })
    }, null, 4));
  }
}), ME = ["tabIndex"], OE = {
  name: "NodesSelection",
  compatConfig: { MODE: 3 }
}, TE = /* @__PURE__ */ Me({
  ...OE,
  setup(e) {
    const { emits: t, viewport: n, getSelectedNodes: o, noPanClassName: s, disableKeyboardA11y: i, userSelectionActive: r } = He(), l = gf(), a = Q(null), c = pf({
      el: a,
      onStart(E) {
        t.selectionDragStart(E);
      },
      onDrag(E) {
        t.selectionDrag(E);
      },
      onStop(E) {
        t.selectionDragStop(E);
      }
    });
    rt(() => {
      var E;
      i.value || (E = a.value) == null || E.focus({ preventScroll: !0 });
    });
    const d = ae(() => tf(o.value)), f = ae(() => ({
      width: `${d.value.width}px`,
      height: `${d.value.height}px`,
      top: `${d.value.y}px`,
      left: `${d.value.x}px`
    }));
    function g(E) {
      t.selectionContextMenu({ event: E, nodes: o.value });
    }
    function m(E) {
      i || so[E.key] && (E.preventDefault(), l(
        {
          x: so[E.key].x,
          y: so[E.key].y
        },
        E.shiftKey
      ));
    }
    return (E, C) => !F(r) && d.value.width && d.value.height ? ($(), T("div", {
      key: 0,
      class: ve(["vue-flow__nodesselection vue-flow__container", F(s)]),
      style: it({ transform: `translate(${F(n).x}px,${F(n).y}px) scale(${F(n).zoom})` })
    }, [
      u("div", {
        ref_key: "el",
        ref: a,
        class: ve([{ dragging: F(c) }, "vue-flow__nodesselection-rect"]),
        style: it(f.value),
        tabIndex: F(i) ? void 0 : -1,
        onContextmenu: g,
        onKeydown: m
      }, null, 46, ME)
    ], 6)) : le("", !0);
  }
});
function PE(e, t) {
  return {
    x: e.clientX - t.left,
    y: e.clientY - t.top
  };
}
const DE = {
  name: "Pane",
  compatConfig: { MODE: 3 }
}, RE = /* @__PURE__ */ Me({
  ...DE,
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
      getSelectedNodes: f,
      removeNodes: g,
      removeEdges: m,
      selectionMode: E,
      deleteKeyCode: C,
      multiSelectionKeyCode: x,
      multiSelectionActive: O,
      edgeLookup: D,
      nodeLookup: y
    } = He(), w = Q(null), z = Q(0), U = Q(0), W = Q(), G = Q(/* @__PURE__ */ new Map()), P = Ue(() => a.value && (e.isSelecting || i.value));
    let L = !1, q = !1;
    const H = Ao(C, { actInsideInputWithModifier: !1 }), K = Ao(x);
    Ne(H, (se) => {
      se && (g(f.value), m(d.value), c.value = !1);
    }), Ne(K, (se) => {
      O.value = se;
    });
    function S(se, fe) {
      return (ce) => {
        ce.target === fe && (se == null || se(ce));
      };
    }
    function A() {
      i.value = !1, l.value = null, z.value = 0, U.value = 0;
    }
    function M(se) {
      if (L) {
        L = !1;
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
      var fe, ce, ge, ee, _e;
      if (W.value = (fe = t.value) == null ? void 0 : fe.getBoundingClientRect(), !a.value || !e.isSelecting || se.button !== 0 || se.target !== w.value || !W.value)
        return;
      (ge = (ce = se.target) == null ? void 0 : ce.setPointerCapture) == null || ge.call(ce, se.pointerId);
      const { x: xe, y: we } = PE(se, W.value);
      q = !0, L = !1, G.value = /* @__PURE__ */ new Map();
      for (const [me, X] of D.value)
        G.value.set(X.source, ((ee = G.value.get(X.source)) == null ? void 0 : ee.add(me)) || /* @__PURE__ */ new Set([me])), G.value.set(X.target, ((_e = G.value.get(X.target)) == null ? void 0 : _e.add(me)) || /* @__PURE__ */ new Set([me]));
      r(), l.value = {
        width: 0,
        height: 0,
        startX: xe,
        startY: we,
        x: xe,
        y: we
      }, s.selectionStart(se);
    }
    function re(se) {
      if (!W.value || !l.value)
        return;
      L = !0;
      const { x: fe, y: ce } = tn(se, W.value), { startX: ge = 0, startY: ee = 0 } = l.value, _e = {
        startX: ge,
        startY: ee,
        x: fe < ge ? fe : ge,
        y: ce < ee ? ce : ee,
        width: Math.abs(fe - ge),
        height: Math.abs(ce - ee)
      }, xe = nf(
        n.value,
        _e,
        o.value,
        E.value === ll.Partial,
        !0
      ), we = /* @__PURE__ */ new Set(), me = /* @__PURE__ */ new Set();
      for (const X of xe) {
        me.add(X.id);
        const p = G.value.get(X.id);
        if (p)
          for (const I of p)
            we.add(I);
      }
      if (z.value !== me.size) {
        z.value = me.size;
        const X = fn(y.value, me, !0);
        s.nodesChange(X);
      }
      if (U.value !== we.size) {
        U.value = we.size;
        const X = fn(D.value, we);
        s.edgesChange(X);
      }
      l.value = _e, i.value = !0, c.value = !1;
    }
    function ue(se) {
      var fe;
      se.button !== 0 || !q || ((fe = se.target) == null || fe.releasePointerCapture(se.pointerId), !i.value && l.value && se.target === w.value && M(se), z.value > 0 && (c.value = !0), A(), s.selectionEnd(se), e.selectionKeyPressed && (L = !1), q = !1);
    }
    return (se, fe) => ($(), T("div", {
      ref_key: "container",
      ref: w,
      class: ve(["vue-flow__pane vue-flow__container", { selection: se.isSelecting }]),
      onClick: fe[0] || (fe[0] = (ce) => P.value ? void 0 : S(M, w.value)(ce)),
      onContextmenu: fe[1] || (fe[1] = (ce) => S(R, w.value)(ce)),
      onWheelPassive: fe[2] || (fe[2] = (ce) => S(j, w.value)(ce)),
      onPointerenter: fe[3] || (fe[3] = (ce) => P.value ? void 0 : F(s).paneMouseEnter(ce)),
      onPointerdown: fe[4] || (fe[4] = (ce) => P.value ? ne(ce) : F(s).paneMouseMove(ce)),
      onPointermove: fe[5] || (fe[5] = (ce) => P.value ? re(ce) : F(s).paneMouseMove(ce)),
      onPointerup: fe[6] || (fe[6] = (ce) => P.value ? ue(ce) : void 0),
      onPointerleave: fe[7] || (fe[7] = (ce) => F(s).paneMouseLeave(ce))
    }, [
      Bn(se.$slots, "default"),
      F(i) && F(l) ? ($(), vt(IE, {
        key: 0,
        "user-selection-rect": F(l)
      }, null, 8, ["user-selection-rect"])) : le("", !0),
      F(c) && F(f).length ? ($(), vt(TE, { key: 1 })) : le("", !0)
    ], 34));
  }
}), AE = {
  name: "Transform",
  compatConfig: { MODE: 3 }
}, VE = /* @__PURE__ */ Me({
  ...AE,
  setup(e) {
    const { viewport: t, fitViewOnInit: n, fitViewOnInitDone: o } = He(), s = ae(() => n.value ? !o.value : !1), i = ae(() => `translate(${t.value.x}px,${t.value.y}px) scale(${t.value.zoom})`);
    return (r, l) => ($(), T("div", {
      class: "vue-flow__transformationpane vue-flow__container",
      style: it({ transform: i.value, opacity: s.value ? 0 : void 0 })
    }, [
      Bn(r.$slots, "default")
    ], 4));
  }
}), LE = {
  name: "Viewport",
  compatConfig: { MODE: 3 }
}, zE = /* @__PURE__ */ Me({
  ...LE,
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
      panOnDrag: f,
      zoomOnDoubleClick: g,
      zoomOnPinch: m,
      zoomOnScroll: E,
      preventScrolling: C,
      noWheelClassName: x,
      noPanClassName: O,
      emits: D,
      connectionStartHandle: y,
      userSelectionActive: w,
      paneDragging: z,
      d3Zoom: U,
      d3Selection: W,
      d3ZoomHandler: G,
      viewport: P,
      viewportRef: L,
      paneClickDistance: q
    } = He();
    $E(L);
    const H = Q(!1), K = Q(!1);
    let S = null, A = !1, M = 0, R = {
      x: 0,
      y: 0,
      zoom: 0
    };
    const j = Ao(l), ne = Ao(r), re = Ao(i), ue = Ue(
      () => (!ne.value || ne.value && r.value === !0) && (j.value || f.value)
    ), se = Ue(() => j.value || a.value), fe = Ue(() => ne.value || r.value === !0 && ue.value !== !0);
    rt(() => {
      if (!L.value) {
        vi("Viewport element is missing");
        return;
      }
      const we = L.value, me = we.getBoundingClientRect(), X = d2().clickDistance(q.value).scaleExtent([t.value, n.value]).translateExtent(s.value), p = Ct(we).call(X), I = p.on("wheel.zoom"), b = fo.translate(o.value.x ?? 0, o.value.y ?? 0).scale(jn(o.value.zoom ?? 1, t.value, n.value)), _ = [
        [0, 0],
        [me.width, me.height]
      ], k = X.constrain()(b, _, s.value);
      X.transform(p, k), X.wheelDelta(ge), U.value = X, W.value = p, G.value = I, P.value = { x: k.x, y: k.y, zoom: k.k }, X.on("start", (v) => {
        var h;
        if (!v.sourceEvent)
          return null;
        M = v.sourceEvent.button, H.value = !0;
        const B = _e(v.transform);
        ((h = v.sourceEvent) == null ? void 0 : h.type) === "mousedown" && (z.value = !0), R = B, D.viewportChangeStart(B), D.moveStart({ event: v, flowTransform: B });
      }), X.on("end", (v) => {
        if (!v.sourceEvent)
          return null;
        if (H.value = !1, z.value = !1, ce(ue.value, M ?? 0) && !A && D.paneContextMenu(v.sourceEvent), A = !1, ee(R, v.transform)) {
          const h = _e(v.transform);
          R = h, D.viewportChangeEnd(h), D.moveEnd({ event: v, flowTransform: h });
        }
      }), X.filter((v) => {
        var h;
        const B = re.value || E.value, Y = m.value && v.ctrlKey, N = v.button;
        if (N === 1 && v.type === "mousedown" && (xe(v, "vue-flow__node") || xe(v, "vue-flow__edge")))
          return !0;
        if (!ue.value && !B && !se.value && !g.value && !m.value || w.value || !g.value && v.type === "dblclick" || xe(v, x.value) && v.type === "wheel" || xe(v, O.value) && (v.type !== "wheel" || se.value && v.type === "wheel" && !re.value) || !m.value && v.ctrlKey && v.type === "wheel" || !B && !se.value && !Y && v.type === "wheel")
          return !1;
        if (!m && v.type === "touchstart" && ((h = v.touches) == null ? void 0 : h.length) > 1)
          return v.preventDefault(), !1;
        if (!ue.value && (v.type === "mousedown" || v.type === "touchstart") || r.value === !0 && Array.isArray(f.value) && f.value.includes(0) && N === 0 || Array.isArray(f.value) && !f.value.includes(N) && (v.type === "mousedown" || v.type === "touchstart"))
          return !1;
        const te = Array.isArray(f.value) && f.value.includes(N) || r.value === !0 && Array.isArray(f.value) && !f.value.includes(0) || !N || N <= 1;
        return (!v.ctrlKey || j.value || v.type === "wheel") && te;
      }), Ne(
        [w, ue],
        () => {
          w.value && !H.value ? X.on("zoom", null) : w.value || X.on("zoom", (v) => {
            P.value = { x: v.transform.x, y: v.transform.y, zoom: v.transform.k };
            const h = _e(v.transform);
            A = ce(ue.value, M ?? 0), D.viewportChange(h), D.move({ event: v, flowTransform: h });
          });
        },
        { immediate: !0 }
      ), Ne(
        [w, se, c, re, m, C, x],
        () => {
          se.value && !re.value && !w.value ? p.on(
            "wheel.zoom",
            (v) => {
              if (xe(v, x.value))
                return !1;
              const h = re.value || E.value, B = m.value && v.ctrlKey;
              if (!(!C.value || se.value || h || B))
                return !1;
              v.preventDefault(), v.stopImmediatePropagation();
              const N = p.property("__zoom").k || 1, te = Ys();
              if (!j.value && v.ctrlKey && m.value && te) {
                const $e = Rt(v), Oe = ge(v), et = N * 2 ** Oe;
                X.scaleTo(p, et, $e, v);
                return;
              }
              const Z = v.deltaMode === 1 ? 20 : 1;
              let ie = c.value === Ro.Vertical ? 0 : v.deltaX * Z, de = c.value === Ro.Horizontal ? 0 : v.deltaY * Z;
              !te && v.shiftKey && c.value !== Ro.Vertical && !ie && de && (ie = de, de = 0), X.translateBy(
                p,
                -(ie / N) * d.value,
                -(de / N) * d.value
              );
              const ke = _e(p.property("__zoom"));
              S && clearTimeout(S), K.value ? (D.move({ event: v, flowTransform: ke }), D.viewportChange(ke), S = setTimeout(() => {
                D.moveEnd({ event: v, flowTransform: ke }), D.viewportChangeEnd(ke), K.value = !1;
              }, 150)) : (K.value = !0, D.moveStart({ event: v, flowTransform: ke }), D.viewportChangeStart(ke));
            },
            { passive: !1 }
          ) : typeof I < "u" && p.on(
            "wheel.zoom",
            function(v, h) {
              const B = !C.value && v.type === "wheel" && !v.ctrlKey, Y = re.value || E.value, N = m.value && v.ctrlKey;
              if (!Y && !a.value && !N && v.type === "wheel" || B || xe(v, x.value))
                return null;
              v.preventDefault(), I.call(this, v, h);
            },
            { passive: !1 }
          );
        },
        { immediate: !0 }
      );
    });
    function ce(we, me) {
      return me === 2 && Array.isArray(we) && we.includes(2);
    }
    function ge(we) {
      const me = we.ctrlKey && Ys() ? 10 : 1;
      return -we.deltaY * (we.deltaMode === 1 ? 0.05 : we.deltaMode ? 1 : 2e-3) * me;
    }
    function ee(we, me) {
      return we.x !== me.x && !Number.isNaN(me.x) || we.y !== me.y && !Number.isNaN(me.y) || we.zoom !== me.k && !Number.isNaN(me.k);
    }
    function _e(we) {
      return {
        x: we.x,
        y: we.y,
        zoom: we.k
      };
    }
    function xe(we, me) {
      return we.target.closest(`.${me}`);
    }
    return (we, me) => ($(), T("div", {
      ref_key: "viewportRef",
      ref: L,
      class: "vue-flow__viewport vue-flow__container"
    }, [
      J(RE, {
        "is-selecting": fe.value,
        "selection-key-pressed": F(ne),
        class: ve({
          connecting: !!F(y),
          dragging: F(z),
          draggable: F(f) === !0 || Array.isArray(F(f)) && F(f).includes(0)
        })
      }, {
        default: bn(() => [
          J(VE, null, {
            default: bn(() => [
              Bn(we.$slots, "default")
            ]),
            _: 3
          })
        ]),
        _: 3
      }, 8, ["is-selecting", "selection-key-pressed", "class"])
    ], 512));
  }
}), BE = ["id"], FE = ["id"], UE = ["id"], HE = {
  name: "A11yDescriptions",
  compatConfig: { MODE: 3 }
}, jE = /* @__PURE__ */ Me({
  ...HE,
  setup(e) {
    const { id: t, disableKeyboardA11y: n, ariaLiveMessage: o } = He();
    return (s, i) => ($(), T(be, null, [
      u("div", {
        id: `${F(Yd)}-${F(t)}`,
        style: { display: "none" }
      }, " Press enter or space to select a node. " + V(F(n) ? "" : "You can then use the arrow keys to move the node around.") + " You can then use the arrow keys to move the node around, press delete to remove it and press escape to cancel. ", 9, BE),
      u("div", {
        id: `${F(qd)}-${F(t)}`,
        style: { display: "none" }
      }, " Press enter or space to select an edge. You can then press delete to remove it or press escape to cancel. ", 8, FE),
      F(n) ? le("", !0) : ($(), T("div", {
        key: 0,
        id: `${F(v2)}-${F(t)}`,
        "aria-live": "assertive",
        "aria-atomic": "true",
        style: { position: "absolute", width: "1px", height: "1px", margin: "-1px", border: "0", padding: "0", overflow: "hidden", clip: "rect(0px, 0px, 0px, 0px)", "clip-path": "inset(100%)" }
      }, V(F(o)), 9, UE))
    ], 64));
  }
});
function GE() {
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
function YE(e, t, n) {
  return n === ye.Left ? e - t : n === ye.Right ? e + t : e;
}
function qE(e, t, n) {
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
    cx: YE(t, e, o),
    cy: qE(n, e, o),
    r: e,
    stroke: "transparent",
    fill: "transparent"
  });
};
dl.props = ["radius", "centerX", "centerY", "position", "type"];
dl.compatConfig = { MODE: 3 };
const Eu = dl, XE = /* @__PURE__ */ Me({
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
      findNode: f,
      isValidConnection: g,
      multiSelectionActive: m,
      disableKeyboardA11y: E,
      elementsSelectable: C,
      edgesUpdatable: x,
      edgesFocusable: O,
      hooks: D
    } = He(), y = ae(() => d(e.id)), { emit: w, on: z } = B2(y.value, i), U = Lt(gi), W = ho(), G = Q(!1), P = Q(!1), L = Q(""), q = Q(null), H = Q("source"), K = Q(null), S = Ue(
      () => typeof y.value.selectable > "u" ? C.value : y.value.selectable
    ), A = Ue(() => typeof y.value.updatable > "u" ? x.value : y.value.updatable), M = Ue(() => typeof y.value.focusable > "u" ? O.value : y.value.focusable);
    Fn(V2, e.id), Fn(L2, K);
    const R = ae(() => y.value.class instanceof Function ? y.value.class(y.value) : y.value.class), j = ae(() => y.value.style instanceof Function ? y.value.style(y.value) : y.value.style), ne = ae(() => {
      const _ = y.value.type || "default", k = U == null ? void 0 : U[`edge-${_}`];
      if (k)
        return k;
      let v = y.value.template ?? a.value[_];
      if (typeof v == "string" && W) {
        const h = Object.keys(W.appContext.components);
        h && h.includes(_) && (v = rc(_, !1));
      }
      return v && typeof v != "string" ? v : (i.error(new Qe(We.EDGE_TYPE_MISSING, v)), !1);
    }), { handlePointerDown: re } = hf({
      nodeId: L,
      handleId: q,
      type: H,
      isValidConnection: g,
      edgeUpdaterType: H,
      onEdgeUpdate: fe,
      onEdgeUpdateEnd: ce
    });
    return () => {
      const _ = f(y.value.source), k = f(y.value.target), v = "pathOptions" in y.value ? y.value.pathOptions : {};
      if (!_ && !k)
        return i.error(new Qe(We.EDGE_SOURCE_TARGET_MISSING, y.value.id, y.value.source, y.value.target)), null;
      if (!_)
        return i.error(new Qe(We.EDGE_SOURCE_MISSING, y.value.id, y.value.source)), null;
      if (!k)
        return i.error(new Qe(We.EDGE_TARGET_MISSING, y.value.id, y.value.target)), null;
      if (!y.value || y.value.hidden || _.hidden || k.hidden)
        return null;
      let h;
      o.value === Hn.Strict ? h = _.handleBounds.source : h = [..._.handleBounds.source || [], ..._.handleBounds.target || []];
      const B = fu(h, y.value.sourceHandle);
      let Y;
      o.value === Hn.Strict ? Y = k.handleBounds.target : Y = [...k.handleBounds.target || [], ...k.handleBounds.source || []];
      const N = fu(Y, y.value.targetHandle), te = (B == null ? void 0 : B.position) || ye.Bottom, Z = (N == null ? void 0 : N.position) || ye.Top, { x: ie, y: de } = Gs(_, B, te), { x: ke, y: $e } = Gs(k, N, Z);
      return y.value.sourceX = ie, y.value.sourceY = de, y.value.targetX = ke, y.value.targetY = $e, Ae(
        "g",
        {
          ref: K,
          key: e.id,
          "data-id": e.id,
          class: [
            "vue-flow__edge",
            `vue-flow__edge-${ne.value === !1 ? "default" : y.value.type || "default"}`,
            l.value,
            R.value,
            {
              updating: G.value,
              selected: y.value.selected,
              animated: y.value.animated,
              inactive: !S.value && !D.value.edgeClick.hasListeners()
            }
          ],
          onClick: ee,
          onContextmenu: _e,
          onDblclick: xe,
          onMouseenter: we,
          onMousemove: me,
          onMouseleave: X,
          onKeyDown: M.value ? b : void 0,
          tabIndex: M.value ? 0 : void 0,
          "aria-label": y.value.ariaLabel === null ? void 0 : y.value.ariaLabel || `Edge from ${y.value.source} to ${y.value.target}`,
          "aria-describedby": M.value ? `${qd}-${t}` : void 0,
          role: M.value ? "button" : "img"
        },
        [
          P.value ? null : Ae(ne.value === !1 ? a.value.default : ne.value, {
            id: e.id,
            sourceNode: _,
            targetNode: k,
            source: y.value.source,
            target: y.value.target,
            type: y.value.type,
            updatable: A.value,
            selected: y.value.selected,
            animated: y.value.animated,
            label: y.value.label,
            labelStyle: y.value.labelStyle,
            labelShowBg: y.value.labelShowBg,
            labelBgStyle: y.value.labelBgStyle,
            labelBgPadding: y.value.labelBgPadding,
            labelBgBorderRadius: y.value.labelBgBorderRadius,
            data: y.value.data,
            events: { ...y.value.events, ...z },
            style: j.value,
            markerStart: `url('#${Ko(y.value.markerStart, t)}')`,
            markerEnd: `url('#${Ko(y.value.markerEnd, t)}')`,
            sourcePosition: te,
            targetPosition: Z,
            sourceX: ie,
            sourceY: de,
            targetX: ke,
            targetY: $e,
            sourceHandleId: y.value.sourceHandle,
            targetHandleId: y.value.targetHandle,
            interactionWidth: y.value.interactionWidth,
            ...v
          }),
          [
            A.value === "source" || A.value === !0 ? [
              Ae(
                "g",
                {
                  onMousedown: p,
                  onMouseenter: ue,
                  onMouseout: se
                },
                Ae(Eu, {
                  position: te,
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
                  onMouseenter: ue,
                  onMouseout: se
                },
                Ae(Eu, {
                  position: Z,
                  centerX: ke,
                  centerY: $e,
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
    function ue() {
      G.value = !0;
    }
    function se() {
      G.value = !1;
    }
    function fe(_, k) {
      w.update({ event: _, edge: y.value, connection: k });
    }
    function ce(_) {
      w.updateEnd({ event: _, edge: y.value }), P.value = !1;
    }
    function ge(_, k) {
      _.button === 0 && (P.value = !0, L.value = k ? y.value.target : y.value.source, q.value = (k ? y.value.targetHandle : y.value.sourceHandle) ?? "", H.value = k ? "target" : "source", w.updateStart({ event: _, edge: y.value }), re(_));
    }
    function ee(_) {
      var k;
      const v = { event: _, edge: y.value };
      S.value && (r.value = !1, y.value.selected && m.value ? (c([y.value]), (k = K.value) == null || k.blur()) : n([y.value])), w.click(v);
    }
    function _e(_) {
      w.contextMenu({ event: _, edge: y.value });
    }
    function xe(_) {
      w.doubleClick({ event: _, edge: y.value });
    }
    function we(_) {
      w.mouseEnter({ event: _, edge: y.value });
    }
    function me(_) {
      w.mouseMove({ event: _, edge: y.value });
    }
    function X(_) {
      w.mouseLeave({ event: _, edge: y.value });
    }
    function p(_) {
      ge(_, !0);
    }
    function I(_) {
      ge(_, !1);
    }
    function b(_) {
      var k;
      !E.value && Xd.includes(_.key) && S.value && (_.key === "Escape" ? ((k = K.value) == null || k.blur(), c([d(e.id)])) : n([d(e.id)]));
    }
  }
}), KE = XE, WE = {
  [ye.Left]: ye.Right,
  [ye.Right]: ye.Left,
  [ye.Top]: ye.Bottom,
  [ye.Bottom]: ye.Top
}, ZE = /* @__PURE__ */ Me({
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
      findNode: f
    } = He(), g = (e = Lt(gi)) == null ? void 0 : e["connection-line"], m = ae(() => {
      var D;
      return f((D = o.value) == null ? void 0 : D.nodeId);
    }), E = ae(() => {
      var D;
      return f((D = s.value) == null ? void 0 : D.nodeId) ?? null;
    }), C = ae(() => ({
      x: (i.value.x - d.value.x) / d.value.zoom,
      y: (i.value.y - d.value.y) / d.value.zoom
    })), x = ae(
      () => a.value.markerStart ? `url(#${Ko(a.value.markerStart, t)})` : ""
    ), O = ae(
      () => a.value.markerEnd ? `url(#${Ko(a.value.markerEnd, t)})` : ""
    );
    return () => {
      var D, y, w, z;
      if (!m.value || !o.value)
        return null;
      const U = o.value.handleId, W = o.value.type, G = m.value.handleBounds;
      let P = (G == null ? void 0 : G[W]) || [];
      if (n.value === Hn.Loose) {
        const ne = (G == null ? void 0 : G[W === "source" ? "target" : "source"]) || [];
        P = [...P, ...ne];
      }
      if (!P)
        return null;
      const L = (U ? P.find((ne) => ne.id === U) : P[0]) ?? null, q = (L == null ? void 0 : L.position) || ye.Top, { x: H, y: K } = Gs(m.value, L, q);
      let S = null;
      E.value && ((D = s.value) != null && D.handleId) && (n.value === Hn.Strict ? S = ((y = E.value.handleBounds[W === "source" ? "target" : "source"]) == null ? void 0 : y.find(
        (ne) => {
          var re;
          return ne.id === ((re = s.value) == null ? void 0 : re.handleId);
        }
      )) || null : S = ((w = [...E.value.handleBounds.source || [], ...E.value.handleBounds.target || []]) == null ? void 0 : w.find(
        (ne) => {
          var re;
          return ne.id === ((re = s.value) == null ? void 0 : re.handleId);
        }
      )) || null);
      const A = ((z = s.value) == null ? void 0 : z.position) ?? (q ? WE[q] : null);
      if (!q || !A)
        return null;
      const M = r.value ?? a.value.type ?? On.Bezier;
      let R = "";
      const j = {
        sourceX: H,
        sourceY: K,
        sourcePosition: q,
        targetX: C.value.x,
        targetY: C.value.y,
        targetPosition: A
      };
      return M === On.Bezier ? [R] = _f(j) : M === On.Step ? [R] = Ir({
        ...j,
        borderRadius: 0
      }) : M === On.SmoothStep ? [R] = Ir(j) : M === On.SimpleBezier ? [R] = wf(j) : R = `M${H},${K} ${C.value.x},${C.value.y}`, Ae(
        "svg",
        { class: "vue-flow__edges vue-flow__connectionline vue-flow__container" },
        Ae(
          "g",
          { class: "vue-flow__connection" },
          g ? Ae(g, {
            sourceX: H,
            sourceY: K,
            sourcePosition: q,
            targetX: C.value.x,
            targetY: C.value.y,
            targetPosition: A,
            sourceNode: m.value,
            sourceHandle: L,
            targetNode: E.value,
            targetHandle: S,
            markerEnd: O.value,
            markerStart: x.value,
            connectionStatus: c.value
          }) : Ae("path", {
            d: R,
            class: [a.value.class, c, "vue-flow__connection-path"],
            style: {
              ...l.value,
              ...a.value.style
            },
            "marker-end": O.value,
            "marker-start": x.value
          })
        )
      );
    };
  }
}), JE = ZE, QE = ["id", "markerWidth", "markerHeight", "markerUnits", "orient"], ex = {
  name: "MarkerType",
  compatConfig: { MODE: 3 }
}, tx = /* @__PURE__ */ Me({
  ...ex,
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
    return (t, n) => ($(), T("marker", {
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
      t.type === F(xr).ArrowClosed ? ($(), T("polyline", {
        key: 0,
        style: it({
          stroke: t.color,
          fill: t.color,
          strokeWidth: t.strokeWidth
        }),
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        points: "-5,-4 0,0 -5,4 -5,-4"
      }, null, 4)) : le("", !0),
      t.type === F(xr).Arrow ? ($(), T("polyline", {
        key: 1,
        style: it({
          stroke: t.color,
          strokeWidth: t.strokeWidth
        }),
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        fill: "none",
        points: "-5,-4 0,0 -5,4"
      }, null, 4)) : le("", !0)
    ], 8, QE));
  }
}), nx = { class: "vue-flow__marker vue-flow__container" }, ox = {
  name: "MarkerDefinitions",
  compatConfig: { MODE: 3 }
}, sx = /* @__PURE__ */ Me({
  ...ox,
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
    return (r, l) => ($(), T("svg", nx, [
      u("defs", null, [
        ($(!0), T(be, null, Te(i.value, (a) => ($(), vt(tx, {
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
}), ix = {
  name: "Edges",
  compatConfig: { MODE: 3 }
}, rx = /* @__PURE__ */ Me({
  ...ix,
  setup(e) {
    const { findNode: t, getEdges: n, elevateEdgesOnSelect: o } = He();
    return (s, i) => ($(), T(be, null, [
      J(sx),
      ($(!0), T(be, null, Te(F(n), (r) => ($(), T("svg", {
        key: r.id,
        class: "vue-flow__edges vue-flow__container",
        style: it({ zIndex: F(I2)(r, F(t), F(o)) })
      }, [
        J(F(KE), {
          id: r.id
        }, null, 8, ["id"])
      ], 4))), 128)),
      J(F(JE))
    ], 64));
  }
}), lx = /* @__PURE__ */ Me({
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
      getNodeTypes: f,
      nodeExtent: g,
      elevateNodesOnSelect: m,
      disableKeyboardA11y: E,
      ariaLiveMessage: C,
      snapToGrid: x,
      snapGrid: O,
      nodeDragThreshold: D,
      nodesDraggable: y,
      elementsSelectable: w,
      nodesConnectable: z,
      nodesFocusable: U,
      hooks: W
    } = He(), G = Q(null);
    Fn(ff, G), Fn(df, e.id);
    const P = Lt(gi), L = ho(), q = gf(), { node: H, parentNode: K } = vf(e.id), { emit: S, on: A } = j2(H, r), M = Ue(() => typeof H.draggable > "u" ? y.value : H.draggable), R = Ue(() => typeof H.selectable > "u" ? w.value : H.selectable), j = Ue(() => typeof H.connectable > "u" ? z.value : H.connectable), ne = Ue(() => typeof H.focusable > "u" ? U.value : H.focusable), re = Ue(
      () => R.value || M.value || W.value.nodeClick.hasListeners() || W.value.nodeDoubleClick.hasListeners() || W.value.nodeMouseEnter.hasListeners() || W.value.nodeMouseMove.hasListeners() || W.value.nodeMouseLeave.hasListeners()
    ), ue = Ue(() => !!H.dimensions.width && !!H.dimensions.height), se = ae(() => {
      const k = H.type || "default", v = P == null ? void 0 : P[`node-${k}`];
      if (v)
        return v;
      let h = H.template || f.value[k];
      if (typeof h == "string" && L) {
        const B = Object.keys(L.appContext.components);
        B && B.includes(k) && (h = rc(k, !1));
      }
      return h && typeof h != "string" ? h : (r.error(new Qe(We.NODE_TYPE_MISSING, h)), !1);
    }), fe = pf({
      id: e.id,
      el: G,
      disabled: () => !M.value,
      selectable: R,
      dragHandle: () => H.dragHandle,
      onStart(k) {
        S.dragStart(k);
      },
      onDrag(k) {
        S.drag(k);
      },
      onStop(k) {
        S.dragStop(k);
      },
      onClick(k) {
        b(k);
      }
    }), ce = ae(() => H.class instanceof Function ? H.class(H) : H.class), ge = ae(() => {
      const k = (H.style instanceof Function ? H.style(H) : H.style) || {}, v = H.width instanceof Function ? H.width(H) : H.width, h = H.height instanceof Function ? H.height(H) : H.height;
      return !k.width && v && (k.width = typeof v == "string" ? v : `${v}px`), !k.height && h && (k.height = typeof h == "string" ? h : `${h}px`), k;
    }), ee = Ue(() => Number(H.zIndex ?? ge.value.zIndex ?? 0));
    return d((k) => {
      (k.includes(e.id) || !k.length) && xe();
    }), rt(() => {
      Ne(
        () => H.hidden,
        (k = !1, v, h) => {
          !k && G.value && (e.resizeObserver.observe(G.value), h(() => {
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
          var k;
          return (k = K.value) == null ? void 0 : k.computedPosition.x;
        },
        () => {
          var k;
          return (k = K.value) == null ? void 0 : k.computedPosition.y;
        },
        () => {
          var k;
          return (k = K.value) == null ? void 0 : k.computedPosition.z;
        },
        ee,
        () => H.selected,
        () => H.dimensions.height,
        () => H.dimensions.width,
        () => {
          var k;
          return (k = K.value) == null ? void 0 : k.dimensions.height;
        },
        () => {
          var k;
          return (k = K.value) == null ? void 0 : k.dimensions.width;
        }
      ],
      ([k, v, h, B, Y, N]) => {
        const te = {
          x: k,
          y: v,
          z: N + (m.value && H.selected ? 1e3 : 0)
        };
        typeof h < "u" && typeof B < "u" ? H.computedPosition = E2({ x: h, y: B, z: Y }, te) : H.computedPosition = te;
      },
      { flush: "post", immediate: !0 }
    ), Ne([() => H.extent, g], ([k, v], [h, B]) => {
      (k !== h || v !== B) && _e();
    }), H.extent === "parent" || typeof H.extent == "object" && "range" in H.extent && H.extent.range === "parent" ? vr(() => ue).toBe(!0).then(_e) : _e(), () => H.hidden ? null : Ae(
      "div",
      {
        ref: G,
        "data-id": H.id,
        class: [
          "vue-flow__node",
          `vue-flow__node-${se.value === !1 ? "default" : H.type || "default"}`,
          {
            [n.value]: M.value,
            dragging: fe == null ? void 0 : fe.value,
            draggable: M.value,
            selected: H.selected,
            selectable: R.value,
            parent: H.isParent
          },
          ce.value
        ],
        style: {
          visibility: ue.value ? "visible" : "hidden",
          zIndex: H.computedPosition.z ?? ee.value,
          transform: `translate(${H.computedPosition.x}px,${H.computedPosition.y}px)`,
          pointerEvents: re.value ? "all" : "none",
          ...ge.value
        },
        tabIndex: ne.value ? 0 : void 0,
        role: ne.value ? "button" : void 0,
        "aria-describedby": E.value ? void 0 : `${Yd}-${t}`,
        "aria-label": H.ariaLabel,
        onMouseenter: we,
        onMousemove: me,
        onMouseleave: X,
        onContextmenu: p,
        onClick: b,
        onDblclick: I,
        onKeydown: _
      },
      [
        Ae(se.value === !1 ? f.value.default : se.value, {
          id: H.id,
          type: H.type,
          data: H.data,
          events: { ...H.events, ...A },
          selected: H.selected,
          resizing: H.resizing,
          dragging: fe.value,
          connectable: j.value,
          position: H.computedPosition,
          dimensions: H.dimensions,
          isValidTargetPos: H.isValidTargetPos,
          isValidSourcePos: H.isValidSourcePos,
          parent: H.parentNode,
          parentNodeId: H.parentNode,
          zIndex: H.computedPosition.z ?? ee.value,
          targetPosition: H.targetPosition,
          sourcePosition: H.sourcePosition,
          label: H.label,
          dragHandle: H.dragHandle,
          onUpdateNodeInternals: xe
        })
      ]
    );
    function _e() {
      const k = H.computedPosition, { computedPosition: v, position: h } = al(
        H,
        x.value ? hi(k, O.value) : k,
        r.error,
        g.value,
        K.value
      );
      (H.computedPosition.x !== v.x || H.computedPosition.y !== v.y) && (H.computedPosition = { ...H.computedPosition, ...v }), (H.position.x !== h.x || H.position.y !== h.y) && (H.position = h);
    }
    function xe() {
      G.value && c([{ id: e.id, nodeElement: G.value, forceUpdate: !0 }]);
    }
    function we(k) {
      fe != null && fe.value || S.mouseEnter({ event: k, node: H });
    }
    function me(k) {
      fe != null && fe.value || S.mouseMove({ event: k, node: H });
    }
    function X(k) {
      fe != null && fe.value || S.mouseLeave({ event: k, node: H });
    }
    function p(k) {
      return S.contextMenu({ event: k, node: H });
    }
    function I(k) {
      return S.doubleClick({ event: k, node: H });
    }
    function b(k) {
      R.value && (!o.value || !M.value || D.value > 0) && Nr(
        H,
        i.value,
        a,
        l,
        s,
        !1,
        G.value
      ), S.click({ event: k, node: H });
    }
    function _(k) {
      if (!(Sr(k) || E.value))
        if (Xd.includes(k.key) && R.value) {
          const v = k.key === "Escape";
          Nr(
            H,
            i.value,
            a,
            l,
            s,
            v,
            G.value
          );
        } else M.value && H.selected && so[k.key] && (k.preventDefault(), C.value = `Moved selected node ${k.key.replace("Arrow", "").toLowerCase()}. New position, x: ${~~H.position.x}, y: ${~~H.position.y}`, q(
          {
            x: so[k.key].x,
            y: so[k.key].y
          },
          k.shiftKey
        ));
    }
  }
}), ax = lx;
function ux(e = { includeHiddenNodes: !1 }) {
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
const cx = { class: "vue-flow__nodes vue-flow__container" }, dx = {
  name: "Nodes",
  compatConfig: { MODE: 3 }
}, fx = /* @__PURE__ */ Me({
  ...dx,
  setup(e) {
    const { getNodes: t, updateNodeDimensions: n, emits: o } = He(), s = ux(), i = Q();
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
    }), (r, l) => ($(), T("div", cx, [
      i.value ? ($(!0), T(be, { key: 0 }, Te(F(t), (a, c, d, f) => {
        const g = [a.id];
        if (f && f.key === a.id && bh(f, g))
          return f;
        const m = ($(), vt(F(ax), {
          id: a.id,
          key: a.id,
          "resize-observer": i.value
        }, null, 8, ["id", "resize-observer"]));
        return m.memo = g, m;
      }, l, 0), 128)) : le("", !0)
    ]));
  }
});
function px() {
  const { emits: e } = He();
  rt(() => {
    if (cf()) {
      const t = document.querySelector(".vue-flow__pane");
      t && window.getComputedStyle(t).zIndex !== "1" && e.error(new Qe(We.MISSING_STYLES));
    }
  });
}
const hx = /* @__PURE__ */ u("div", { class: "vue-flow__edge-labels" }, null, -1), vx = {
  name: "VueFlow",
  compatConfig: { MODE: 3 }
}, gx = /* @__PURE__ */ Me({
  ...vx,
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
    const o = e, s = Pp(), i = Li(o, "modelValue", n), r = Li(o, "nodes", n), l = Li(o, "edges", n), a = He(o), c = q2({ modelValue: i, nodes: r, edges: l }, o, a);
    return K2(n, a.hooks), GE(), px(), Fn(gi, s), ni(() => {
      c();
    }), t(a), (d, f) => ($(), T("div", {
      ref: F(a).vueFlowRef,
      class: "vue-flow"
    }, [
      J(zE, null, {
        default: bn(() => [
          J(rx),
          hx,
          J(fx),
          Bn(d.$slots, "zoom-pane")
        ]),
        _: 3
      }),
      Bn(d.$slots, "default"),
      J(jE)
    ], 512));
  }
}), mx = { class: "graph-node-head" }, yx = {
  key: 0,
  class: "level-tag"
}, bx = ["aria-pressed", "aria-label"], Wi = /* @__PURE__ */ Me({
  __name: "GraphNodeCard",
  props: {
    data: {},
    selected: { type: Boolean }
  },
  emits: ["toggle"],
  setup(e, { emit: t }) {
    const n = e, o = t, s = { persona: Zh, profile: dr, memory: Jh, rag: nv, voice: iv, live2d: uv, extensions: ov, skill: av, tool: hv, mcp: lv }, i = !!n.data.configurable && n.data.level > 0;
    return (r, l) => ($(), T("article", {
      class: ve(["graph-node", [`kind-${r.data.kind}`, `status-${r.data.status}`, { selected: r.selected }]])
    }, [
      J(F(_n), {
        id: "left-target",
        type: "target",
        position: F(ye).Left,
        class: "graph-handle"
      }, null, 8, ["position"]),
      J(F(_n), {
        id: "left-source",
        type: "source",
        position: F(ye).Left,
        class: "graph-handle"
      }, null, 8, ["position"]),
      J(F(_n), {
        id: "right-target",
        type: "target",
        position: F(ye).Right,
        class: "graph-handle"
      }, null, 8, ["position"]),
      J(F(_n), {
        id: "right-source",
        type: "source",
        position: F(ye).Right,
        class: "graph-handle"
      }, null, 8, ["position"]),
      u("div", mx, [
        ($(), vt(ac(s[r.data.kind]), { size: 16 })),
        u("b", null, V(r.data.label), 1),
        r.data.kind === "skill" || r.data.kind === "tool" ? ($(), T("span", yx, "L" + V(r.data.level), 1)) : le("", !0)
      ]),
      u("p", null, V(r.data.summary), 1),
      u("footer", null, [
        u("span", null, V(r.data.status === "available" ? "可用" : r.data.status === "unassigned" ? "未分配" : r.data.status === "partial" ? "部分可用" : "不可用"), 1),
        F(i) ? ($(), T("button", {
          key: 0,
          type: "button",
          class: ve(["graph-switch", { on: r.data.assigned }]),
          "aria-pressed": !!r.data.assigned,
          "aria-label": `${r.data.label}能力开关`,
          onClick: l[0] || (l[0] = gt((a) => o("toggle"), ["stop"]))
        }, l[1] || (l[1] = [
          u("i", null, null, -1)
        ]), 10, bx)) : le("", !0)
      ])
    ], 2));
  }
}), _x = /* @__PURE__ */ Me({
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
    return (o, s) => ($(), vt(F(os), {
      path: n.value,
      class: ve({ selected: o.selected })
    }, null, 8, ["path", "class"]));
  }
}), wx = {
  class: "graph-stage",
  "aria-label": "角色能力架构画布"
}, kx = {
  class: "graph-tools",
  "aria-label": "画布工具"
}, Ex = /* @__PURE__ */ Me({
  __name: "RoleGraphCanvas",
  props: {
    graph: {},
    selectedNodeId: {}
  },
  emits: ["select", "toggle", "reset"],
  setup(e, { emit: t }) {
    const n = e, o = t, s = Q([]), i = Q([]), { fitView: r, zoomIn: l, zoomOut: a } = He({ id: "role-architecture" }), c = Q(!1);
    function d() {
      return new Promise((y) => requestAnimationFrame(() => requestAnimationFrame(() => y())));
    }
    function f(y) {
      const w = /* @__PURE__ */ new Set([y]), z = [y];
      for (; z.length; ) {
        const U = z.shift();
        for (const W of i.value)
          W.source !== U || w.has(W.target) || (w.add(W.target), z.push(W.target));
      }
      return w;
    }
    function g(y) {
      var U;
      let w = y;
      const z = /* @__PURE__ */ new Set();
      for (; !z.has(w); ) {
        z.add(w);
        const W = (U = i.value.find((G) => G.target === w)) == null ? void 0 : U.source;
        if (!W) return;
        if (W === "module:extensions") return w;
        w = W;
      }
    }
    async function m(y, w) {
      !c.value || !y.length || (await nt(), await d(), await r({ nodes: y, ...w }));
    }
    function E(y = 220) {
      const w = s.value.filter((z) => z.data.kind === "persona" || ["profile", "memory", "rag", "voice", "live2d", "extensions"].includes(z.data.kind));
      return m(w.map((z) => z.id), { padding: 0.18, minZoom: 0.68, maxZoom: 1.08, duration: y });
    }
    function C(y = 220) {
      if (n.selectedNodeId === "module:extensions") {
        const z = s.value.filter((U) => U.id === "module:extensions" || ["skill", "tool"].includes(U.data.kind));
        return m(z.map((U) => U.id), { padding: 0.16, minZoom: 0.38, maxZoom: 0.86, duration: y });
      }
      const w = g(n.selectedNodeId);
      if (w) {
        const z = f(w);
        return z.add("module:extensions"), m([...z], { padding: 0.24, minZoom: 0.58, maxZoom: 1, duration: y });
      }
      return E(y);
    }
    Ne(() => n.graph, async (y) => {
      s.value = y.nodes.map((w) => ({ ...w, selected: w.id === n.selectedNodeId })), i.value = y.edges.map((w) => ({ ...w, type: "brace", animated: !1 })), await nt(), await C();
    }, { immediate: !0, deep: !0 }), Ne(() => n.selectedNodeId, (y) => s.value = s.value.map((w) => ({ ...w, selected: w.id === y })));
    function x(y) {
      o("select", y.node.id);
    }
    async function O() {
      o("reset"), await nt(), E();
    }
    async function D() {
      c.value = !0, await C(0);
    }
    return (y, w) => ($(), T("section", wx, [
      u("div", kx, [
        u("button", {
          type: "button",
          title: "放大",
          onClick: w[0] || (w[0] = () => F(l)())
        }, [
          J(F(Pn), { size: 16 })
        ]),
        u("button", {
          type: "button",
          title: "缩小",
          onClick: w[1] || (w[1] = () => F(a)())
        }, [
          J(F(rv), { size: 16 })
        ]),
        u("button", {
          type: "button",
          title: "适应视图",
          onClick: w[2] || (w[2] = (z) => F(r)({ padding: 0.15, duration: 220 }))
        }, [
          J(F(sv), { size: 16 })
        ]),
        u("button", {
          type: "button",
          title: "恢复自动布局",
          onClick: O
        }, [
          J(F(Kr), { size: 16 })
        ])
      ]),
      J(F(gx), {
        id: "role-architecture",
        nodes: s.value,
        "onUpdate:nodes": w[3] || (w[3] = (z) => s.value = z),
        edges: i.value,
        "onUpdate:edges": w[4] || (w[4] = (z) => i.value = z),
        "min-zoom": 0.32,
        "max-zoom": 1.8,
        "fit-view-on-init": !1,
        onInit: D,
        onNodeClick: x
      }, {
        "node-persona": bn((z) => [
          J(Wi, wi(Es(z)), null, 16)
        ]),
        "node-module": bn((z) => [
          J(Wi, wi(Es(z)), null, 16)
        ]),
        "node-capability": bn((z) => [
          J(Wi, qr(z, {
            onToggle: (U) => o("toggle", z.id)
          }), null, 16, ["onToggle"])
        ]),
        "edge-brace": bn((z) => [
          J(_x, wi(Es(z)), null, 16)
        ]),
        _: 1
      }, 8, ["nodes", "edges"])
    ]));
  }
}), xx = ["disabled", "aria-expanded"], Sx = {
  key: 0,
  id: "manage-role-menu",
  class: "role-picker-menu"
}, Cx = { class: "role-search" }, $x = {
  class: "role-list",
  role: "listbox",
  "aria-label": "选择角色"
}, Nx = ["aria-selected", "disabled", "onClick"], Ix = {
  key: 0,
  class: "role-empty"
}, Mx = /* @__PURE__ */ Me({
  __name: "RoleNavigator",
  props: {
    personas: {},
    selectedId: {},
    disabled: { type: Boolean }
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const n = e, o = t, s = Q(null), i = Q(null), r = Q(!1), l = Q(""), a = ae(() => n.personas.filter((E) => E.name.toLowerCase().includes(l.value.trim().toLowerCase()))), c = ae(() => n.personas.find((E) => E.id === n.selectedId));
    async function d() {
      n.disabled || (r.value = !r.value, r.value && await nt(() => {
        var E;
        return (E = i.value) == null ? void 0 : E.focus();
      }));
    }
    function f(E) {
      o("select", E), r.value = !1, l.value = "";
    }
    function g(E) {
      var C;
      (C = s.value) != null && C.contains(E.target) || (r.value = !1);
    }
    function m(E) {
      E.key === "Escape" && (r.value = !1);
    }
    return Ne(() => n.disabled, (E) => {
      E && (r.value = !1);
    }), rt(() => {
      document.addEventListener("pointerdown", g), document.addEventListener("keydown", m);
    }), sn(() => {
      document.removeEventListener("pointerdown", g), document.removeEventListener("keydown", m);
    }), (E, C) => {
      var x;
      return $(), T("div", {
        ref_key: "root",
        ref: s,
        class: "role-picker"
      }, [
        u("button", {
          type: "button",
          class: "role-picker-trigger",
          disabled: E.disabled || !E.personas.length,
          "aria-haspopup": "listbox",
          "aria-expanded": r.value,
          "aria-controls": "manage-role-menu",
          onClick: d
        }, [
          J(F(dr), { size: 17 }),
          u("strong", null, V(((x = c.value) == null ? void 0 : x.name) || "角色管理"), 1),
          J(F(ev), { size: 15 })
        ], 8, xx),
        r.value ? ($(), T("div", Sx, [
          u("label", Cx, [
            J(F(ur), { size: 15 }),
            Ce(u("input", {
              ref_key: "searchInput",
              ref: i,
              "onUpdate:modelValue": C[0] || (C[0] = (O) => l.value = O),
              placeholder: "查找角色",
              "aria-label": "查找角色"
            }, null, 512), [
              [Le, l.value]
            ])
          ]),
          u("div", $x, [
            ($(!0), T(be, null, Te(a.value, (O) => {
              var D;
              return $(), T("button", {
                key: O.id,
                type: "button",
                role: "option",
                "aria-selected": O.id === E.selectedId,
                disabled: E.disabled,
                class: ve({ active: O.id === E.selectedId }),
                onClick: (y) => f(O.id)
              }, [
                J(F(dr), { size: 17 }),
                u("span", null, [
                  u("b", null, V(O.name), 1),
                  u("small", null, V(((D = O.profile) == null ? void 0 : D.description) || "尚未填写人设"), 1)
                ])
              ], 10, Nx);
            }), 128)),
            a.value.length ? le("", !0) : ($(), T("p", Ix, "没有匹配的角色"))
          ])
        ])) : le("", !0)
      ], 512);
    };
  }
}), Ox = { class: "version-panel-layer" }, Tx = {
  class: "version-panel",
  role: "dialog",
  "aria-modal": "true",
  "aria-labelledby": "version-panel-title"
}, Px = { class: "version-panel-header" }, Dx = { class: "version-panel-kicker" }, Rx = { id: "version-panel-title" }, Ax = {
  key: 0,
  class: "version-message is-error"
}, Vx = { class: "version-panel-toolbar" }, Lx = ["disabled"], zx = ["disabled"], Bx = {
  key: 0,
  class: "version-form-hint"
}, Fx = { class: "version-form-actions" }, Ux = ["disabled"], Hx = ["disabled"], jx = {
  key: 2,
  class: "version-empty"
}, Gx = {
  key: 3,
  class: "version-empty"
}, Yx = {
  key: 4,
  class: "version-body"
}, qx = {
  class: "version-list",
  role: "listbox",
  "aria-label": "角色版本历史"
}, Xx = ["aria-selected", "disabled", "onClick"], Kx = { class: "version-number" }, Wx = { class: "version-item-copy" }, Zx = { class: "version-detail" }, Jx = { class: "version-detail-heading" }, Qx = {
  key: 0,
  class: "version-note"
}, eS = {
  key: 1,
  class: "version-detail-loading"
}, tS = {
  key: 2,
  class: "version-facts"
}, nS = {
  key: 3,
  class: "version-detail-loading"
}, oS = { class: "version-action-row" }, sS = ["disabled"], iS = ["disabled"], rS = {
  key: 2,
  class: "version-current"
}, lS = {
  key: 4,
  class: "version-published"
}, aS = {
  key: 5,
  class: "version-panel-footnote"
}, uS = /* @__PURE__ */ Me({
  __name: "VersionPanel",
  props: {
    personaId: {},
    personaName: {},
    disabled: { type: Boolean }
  },
  emits: ["close", "changed"],
  setup(e, { emit: t }) {
    const n = e, o = t, s = Q([]), i = Q(""), r = Q(null), l = Q(!1), a = Q(!1), c = Q(""), d = Q(""), f = Q(!1), g = Q(""), m = Q("");
    let E = 0;
    const C = ae(() => l.value || a.value || !!c.value), x = ae(() => s.value.find((M) => M.id === i.value)), O = ae(() => {
      var M;
      return (M = r.value) == null ? void 0 : M.snapshot;
    }), D = ae(() => {
      var M;
      return Object.keys(((M = O.value) == null ? void 0 : M.capability_overrides) || {}).length;
    }), y = ae(() => {
      var M, R;
      return ((R = (M = O.value) == null ? void 0 : M.document_ids) == null ? void 0 : R.length) || 0;
    }), w = ae(() => {
      var M;
      return ((M = O.value) == null ? void 0 : M.mcp_server_names) || [];
    });
    function z(M) {
      return { draft: "草稿", published: "已发布", superseded: "已替代", archived: "已归档" }[M] || M;
    }
    function U(M) {
      return `is-${M}`;
    }
    function W(M) {
      if (!M) return "—";
      const R = new Date(M);
      return Number.isNaN(R.getTime()) ? M : new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(R);
    }
    function G(M) {
      return M instanceof Wr && M.status === 404 ? "版本接口尚未启用，请先启用角色版本 API。" : M instanceof Error ? M.message : String(M);
    }
    async function P() {
      const M = ++E;
      if (s.value = [], i.value = "", r.value = null, d.value = "", !!n.personaId) {
        l.value = !0;
        try {
          const R = await Mv(n.personaId);
          if (M !== E) return;
          s.value = R, R.length && await L(R[0].id, M);
        } catch (R) {
          M === E && (d.value = G(R));
        } finally {
          M === E && (l.value = !1);
        }
      }
    }
    async function L(M, R = E) {
      i.value = M, r.value = null, d.value = "", a.value = !0;
      try {
        const j = await Ov(n.personaId, M);
        R === E && (r.value = j);
      } catch (j) {
        R === E && (d.value = G(j));
      } finally {
        R === E && (a.value = !1);
      }
    }
    function q() {
      var M;
      n.disabled || C.value || (f.value = !0, g.value = `版本 ${Math.max(((M = s.value[0]) == null ? void 0 : M.version_number) || 0, 0) + 1}`, m.value = "");
    }
    function H() {
      c.value || (f.value = !1);
    }
    async function K() {
      if (!(n.disabled || C.value)) {
        c.value = "create", d.value = "";
        try {
          const M = await Tv(n.personaId, { label: g.value, note: m.value });
          f.value = !1, s.value = [M, ...s.value.filter((R) => R.id !== M.id)], i.value = M.id, r.value = M, o("changed", M);
        } catch (M) {
          d.value = G(M);
        } finally {
          c.value = "";
        }
      }
    }
    function S(M) {
      s.value = s.value.map((R) => R.id === M.id ? M : R), i.value = M.id, r.value = M;
    }
    async function A(M) {
      const R = i.value;
      if (!(!R || n.disabled || C.value) && !(M === "rollback" && !window.confirm("确定回滚到这个角色版本？当前未保存的运行配置不会自动保留。"))) {
        c.value = R, d.value = "";
        try {
          const j = M === "publish" ? await Pv(n.personaId, R) : await Dv(n.personaId, R);
          S(j), o("changed", j), await P();
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
      var j, ne, re, ue, se, fe, ce;
      return $(), T("div", Ox, [
        u("button", {
          type: "button",
          class: "version-panel-backdrop",
          "aria-label": "关闭版本面板",
          onClick: R[0] || (R[0] = (ge) => o("close"))
        }),
        u("section", Tx, [
          u("header", Px, [
            u("div", null, [
              u("span", Dx, [
                J(F(Lc), { size: 13 }),
                R[6] || (R[6] = he("运行版本"))
              ]),
              u("h2", Rx, V(M.personaName || "当前角色"), 1),
              R[7] || (R[7] = u("p", null, "保存和切换角色的运行配置", -1))
            ]),
            u("button", {
              type: "button",
              class: "icon-button",
              "aria-label": "关闭版本面板",
              onClick: R[1] || (R[1] = (ge) => o("close"))
            }, [
              J(F(Kt), { size: 17 })
            ])
          ]),
          d.value ? ($(), T("p", Ax, V(d.value), 1)) : le("", !0),
          u("div", Vx, [
            u("span", null, V(s.value.length ? `${s.value.length} 个版本` : "版本历史"), 1),
            u("div", null, [
              u("button", {
                type: "button",
                class: "text-button",
                disabled: C.value,
                onClick: P
              }, [
                J(F(Nt), { size: 14 }),
                R[8] || (R[8] = he("刷新"))
              ], 8, Lx),
              u("button", {
                type: "button",
                class: "text-button is-primary",
                disabled: M.disabled || C.value,
                onClick: q
              }, [
                J(F(Pn), { size: 14 }),
                R[9] || (R[9] = he("创建"))
              ], 8, zx)
            ])
          ]),
          f.value ? ($(), T("form", {
            key: 1,
            class: "version-create-form",
            onSubmit: gt(K, ["prevent"])
          }, [
            u("label", null, [
              R[10] || (R[10] = u("span", null, "版本名称", -1)),
              Ce(u("input", {
                "onUpdate:modelValue": R[2] || (R[2] = (ge) => g.value = ge),
                maxlength: "255",
                placeholder: "例如：稳定版"
              }, null, 512), [
                [Le, g.value]
              ])
            ]),
            u("label", null, [
              R[11] || (R[11] = u("span", null, "备注", -1)),
              Ce(u("textarea", {
                "onUpdate:modelValue": R[3] || (R[3] = (ge) => m.value = ge),
                rows: "2",
                maxlength: "5000",
                placeholder: "记录这次配置的变化"
              }, null, 512), [
                [Le, m.value]
              ])
            ]),
            M.disabled ? ($(), T("p", Bx, "请先保存顶部的角色配置，再创建版本。")) : le("", !0),
            u("div", Fx, [
              u("button", {
                type: "button",
                class: "text-button",
                disabled: !!c.value,
                onClick: H
              }, "取消", 8, Ux),
              u("button", {
                type: "submit",
                class: "text-button is-primary",
                disabled: M.disabled || C.value
              }, V(c.value === "create" ? "创建中…" : "保存版本"), 9, Hx)
            ])
          ], 32)) : le("", !0),
          l.value ? ($(), T("div", jx, "正在读取版本历史…")) : !s.value.length && !d.value ? ($(), T("div", Gx, [
            J(F(Wh), { size: 22 }),
            R[12] || (R[12] = u("strong", null, "还没有保存的运行版本", -1)),
            R[13] || (R[13] = u("span", null, "创建版本会记录当前已保存的角色配置。", -1))
          ])) : s.value.length ? ($(), T("div", Yx, [
            u("div", qx, [
              ($(!0), T(be, null, Te(s.value, (ge) => ($(), T("button", {
                key: ge.id,
                type: "button",
                class: ve(["version-item", { selected: ge.id === i.value }]),
                "aria-selected": ge.id === i.value,
                role: "option",
                disabled: C.value,
                onClick: (ee) => L(ge.id)
              }, [
                u("span", Kx, "v" + V(ge.version_number), 1),
                u("span", Wx, [
                  u("strong", null, V(ge.label || `版本 ${ge.version_number}`), 1),
                  u("small", null, V(W(ge.created_at)), 1)
                ]),
                u("span", {
                  class: ve(["version-status", U(ge.status)])
                }, V(z(ge.status)), 3)
              ], 10, Xx))), 128))
            ]),
            u("div", Zx, [
              u("div", Jx, [
                u("div", null, [
                  R[14] || (R[14] = u("span", null, "当前选择", -1)),
                  u("strong", null, V(((j = x.value) == null ? void 0 : j.label) || `版本 ${((ne = x.value) == null ? void 0 : ne.version_number) || ""}`), 1)
                ]),
                u("span", {
                  class: ve(["version-status", U(((re = x.value) == null ? void 0 : re.status) || "draft")])
                }, V(z(((ue = x.value) == null ? void 0 : ue.status) || "draft")), 3)
              ]),
              (se = x.value) != null && se.note ? ($(), T("p", Qx, V(x.value.note), 1)) : le("", !0),
              a.value ? ($(), T("div", eS, "正在读取快照…")) : O.value ? ($(), T("dl", tS, [
                u("div", null, [
                  R[15] || (R[15] = u("dt", null, "角色名称", -1)),
                  u("dd", null, V(O.value.name), 1)
                ]),
                u("div", null, [
                  R[16] || (R[16] = u("dt", null, "知识库", -1)),
                  u("dd", null, V(O.value.knowledge_space_id || "未绑定"), 1)
                ]),
                u("div", null, [
                  R[17] || (R[17] = u("dt", null, "资料", -1)),
                  u("dd", null, V(y.value) + " 份资料", 1)
                ]),
                u("div", null, [
                  R[18] || (R[18] = u("dt", null, "能力策略", -1)),
                  u("dd", null, V(D.value) + " 项能力", 1)
                ]),
                u("div", null, [
                  R[19] || (R[19] = u("dt", null, "MCP 授权", -1)),
                  u("dd", null, V(w.value.length ? w.value.join("、") : "无"), 1)
                ])
              ])) : ($(), T("p", nS, "暂无快照详情")),
              u("div", oS, [
                ((fe = x.value) == null ? void 0 : fe.status) === "draft" ? ($(), T("button", {
                  key: 0,
                  type: "button",
                  class: "version-action is-primary",
                  disabled: M.disabled || C.value,
                  onClick: R[4] || (R[4] = (ge) => A("publish"))
                }, [
                  J(F(dv), { size: 14 }),
                  R[20] || (R[20] = he("发布版本"))
                ], 8, sS)) : x.value && x.value.status !== "published" ? ($(), T("button", {
                  key: 1,
                  type: "button",
                  class: "version-action",
                  disabled: M.disabled || C.value,
                  onClick: R[5] || (R[5] = (ge) => A("rollback"))
                }, [
                  J(F(Kr), { size: 14 }),
                  R[21] || (R[21] = he("回滚到此版本"))
                ], 8, iS)) : ($(), T("span", rS, [
                  J(F(ao), { size: 14 }),
                  R[22] || (R[22] = he("这是当前发布版本"))
                ]))
              ]),
              (ce = x.value) != null && ce.published_at ? ($(), T("p", lS, [
                J(F(tv), { size: 13 }),
                he("发布于 " + V(W(x.value.published_at)), 1)
              ])) : le("", !0)
            ])
          ])) : le("", !0),
          !d.value && M.disabled && s.value.length ? ($(), T("p", aS, "顶部存在未保存修改时，版本操作会暂时停用。")) : le("", !0)
        ])
      ]);
    };
  }
}), fl = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [o, s] of t)
    n[o] = s;
  return n;
}, cS = /* @__PURE__ */ fl(uS, [["__scopeId", "data-v-81aec505"]]);
function dS(e, t, n) {
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
async function fS(e) {
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
function pS(e, t, n) {
  const o = Je(e);
  return n.has("profile") && (o.persona = Je(t.persona)), n.has("capabilities") && (o.capabilities.overrides = Je(t.capabilities.overrides)), n.has("grants") && (o.grants.servers = Je(t.grants.servers)), o;
}
function hS() {
  const e = Q([]), t = Q(""), n = Q(null), o = Q(null), s = Q(""), i = Q(/* @__PURE__ */ new Set()), r = Q(!1), l = Q(!1), a = Q(!1), c = Q(""), d = Q(""), f = ae(() => i.value.size > 0);
  async function g() {
    if (!r.value) {
      r.value = !0, c.value = "";
      try {
        e.value = await Oi();
        const K = t.value || sessionStorage.getItem("yumeno.manage.persona"), S = e.value.find((A) => A.id === K) || e.value[0];
        S && await E(S.id, !0);
      } catch (K) {
        c.value = K instanceof Error ? K.message : String(K);
      } finally {
        r.value = !1;
      }
    }
  }
  async function m() {
    f.value || r.value || l.value || a.value || await g();
  }
  async function E(K, S = !1) {
    if (!S && (l.value || a.value)) {
      d.value = "当前操作完成后才能切换角色";
      return;
    }
    if (!S && f.value && !window.confirm("当前角色有未保存修改，放弃后切换角色？")) return;
    const A = e.value.find((M) => M.id === K);
    if (A) {
      r.value = !0, c.value = "", d.value = "";
      try {
        const M = await fa(A);
        n.value = M, o.value = Je(M), t.value = K, s.value = `persona:${K}`, i.value = /* @__PURE__ */ new Set(), sessionStorage.setItem("yumeno.manage.persona", K);
      } catch (M) {
        c.value = M instanceof Error ? M.message : String(M);
      } finally {
        r.value = !1;
      }
    }
  }
  function C(K) {
    s.value = K;
  }
  function x(K) {
    o.value && (o.value.persona = Je(K), i.value = new Set(i.value).add("profile"));
  }
  function O(K, S) {
    if (!o.value) return;
    o.value = dS(o.value, K, S);
    const A = new Set(i.value);
    A.add("capabilities"), A.add("grants"), i.value = A;
  }
  function D(K, S) {
    if (!o.value) return;
    const A = o.value.grants.servers.find((M) => M.name === K);
    A && !A.global && (A.authorized = S), i.value = new Set(i.value).add("grants");
  }
  function y() {
    n.value && (o.value = Je(n.value), i.value = /* @__PURE__ */ new Set(), d.value = "已撤销本轮修改");
  }
  async function w() {
    if (!o.value || !n.value) return;
    const K = await Uc(o.value.persona.id);
    o.value.documents = K, n.value.documents = Je(K);
  }
  async function z() {
    if (!(!o.value || !n.value || a.value)) {
      a.value = !0, c.value = "", d.value = "正在扫描 Live2D 模型...";
      try {
        const K = await Hc();
        o.value.resources = { ...o.value.resources || { voiceAssets: [], live2dModels: [] }, live2dModels: K }, n.value.resources = { ...n.value.resources || { voiceAssets: [], live2dModels: [] }, live2dModels: Je(K) }, d.value = `已发现 ${K.length} 个 Live2D 模型`;
      } catch (K) {
        c.value = K instanceof Error ? K.message : String(K);
      } finally {
        a.value = !1;
      }
    }
  }
  async function U() {
    if (!a.value) {
      a.value = !0, c.value = "";
      try {
        await wv(), d.value = "已打开 Live2D 模型文件夹";
      } catch (K) {
        c.value = K instanceof Error ? K.message : String(K);
      } finally {
        a.value = !1;
      }
    }
  }
  function W(K, S = 10) {
    S <= 0 || window.setTimeout(async () => {
      var A;
      if (((A = o.value) == null ? void 0 : A.persona.id) === K)
        try {
          await w(), o.value.documents.some((R) => ["converting", "preview_ready", "indexing"].includes(String(R.status))) && W(K, S - 1);
        } catch {
        }
    }, 1400);
  }
  async function G(K, S) {
    if (!o.value || !K.length && !S.trim() || a.value) return !1;
    a.value = !0, c.value = "", d.value = "正在写入角色知识库...";
    try {
      const A = o.value.persona.id;
      return await Cv(o.value.persona, K, S), await w(), W(A), d.value = "资料已提交，正在建立索引", !0;
    } catch (A) {
      return c.value = A instanceof Error ? A.message : String(A), !1;
    } finally {
      a.value = !1;
    }
  }
  async function P(K) {
    a.value = !0, c.value = "";
    try {
      await $v(K), await w(), d.value = "资料已删除";
    } catch (S) {
      c.value = S instanceof Error ? S.message : String(S);
    } finally {
      a.value = !1;
    }
  }
  async function L(K) {
    var S;
    a.value = !0, c.value = "";
    try {
      const A = ((S = o.value) == null ? void 0 : S.persona.id) || "";
      await Nv(K), await w(), A && W(A), d.value = "已重新提交索引";
    } catch (A) {
      c.value = A instanceof Error ? A.message : String(A);
    } finally {
      a.value = !1;
    }
  }
  async function q() {
    if (o.value) {
      a.value = !0, c.value = "";
      try {
        const K = o.value.persona.id;
        await Sv(K), e.value = (await Oi()).filter((S) => S.id !== K), n.value = null, o.value = null, t.value = "", i.value = /* @__PURE__ */ new Set(), e.value[0] && await E(e.value[0].id, !0), d.value = "角色已删除";
      } catch (K) {
        c.value = K instanceof Error ? K.message : String(K);
      } finally {
        a.value = !1;
      }
    }
  }
  async function H() {
    if (!o.value || !f.value) return;
    l.value = !0, c.value = "", d.value = "";
    const K = Je(o.value), S = {};
    i.value.has("profile") && (S.profile = () => kv(K.persona)), i.value.has("capabilities") && (S.capabilities = () => Ev(K.persona.id, K.capabilities.overrides)), i.value.has("grants") && (S.grants = () => xv(K.persona.id, K.grants.servers));
    const A = await fS(S), M = new Set(A.failedDomains.map((R) => R.domain));
    if (i.value = M, A.savedDomains.length)
      try {
        e.value = await Oi();
        const R = e.value.find((ne) => ne.id === K.persona.id) || K.persona, j = await fa(R);
        n.value = j, o.value = pS(j, K, M);
      } catch (R) {
        const j = Je(n.value || K);
        A.savedDomains.includes("profile") && (j.persona = Je(K.persona)), A.savedDomains.includes("capabilities") && (j.capabilities.overrides = Je(K.capabilities.overrides)), A.savedDomains.includes("grants") && (j.grants.servers = Je(K.grants.servers)), n.value = j, o.value = K, c.value = `配置已保存，但刷新失败：${R instanceof Error ? R.message : String(R)}`;
      }
    A.ok ? d.value = "角色配置已保存" : c.value = A.failedDomains.map((R) => `${R.domain}: ${R.message}`).join("；"), l.value = !1;
  }
  return { personas: e, selectedPersonaId: t, snapshot: n, draft: o, selectedNodeId: s, dirtyDomains: i, loading: r, isSaving: l, operationPending: a, error: c, message: d, isDirty: f, initialize: g, refreshIfClean: m, selectPersona: E, selectNode: C, updateProfile: x, setCapability: O, setServer: D, discard: y, save: H, addDocuments: G, removeDocument: P, reindexDocument: L, refreshLive2dResources: z, openLive2dDirectory: U, removeCurrentPersona: q };
}
const vS = { class: "workbench-toolbar" }, gS = { class: "toolbar-identity" }, mS = { class: "toolbar-actions" }, yS = {
  key: 0,
  class: "dirty-state"
}, bS = ["disabled"], _S = ["disabled"], wS = ["disabled"], kS = {
  key: 0,
  class: "workbench-message error"
}, ES = {
  key: 1,
  class: "workbench-message"
}, xS = { class: "workbench-content" }, SS = { class: "workbench-canvas-region" }, CS = {
  key: 0,
  class: "workbench-loading"
}, $S = {
  key: 1,
  class: "workbench-empty"
}, NS = /* @__PURE__ */ Me({
  __name: "App",
  setup(e) {
    const t = hS(), n = Q(0), o = Q(0), s = Q(!1), i = ae(() => t.isSaving.value || t.operationPending.value), r = ae(() => t.draft.value ? zv(t.draft.value) : { nodes: [], edges: [] }), l = ae(() => (n.value, G1(X1(r.value, t.selectedNodeId.value)))), a = ae(() => r.value.nodes.find((L) => L.id === t.selectedNodeId.value));
    function c(L) {
      const q = l.value.nodes.find((H) => H.id === L);
      if (q != null && q.data.configurable) {
        if (q.data.kind === "mcp" && q.data.sourceId) {
          t.setServer(q.data.sourceId, !q.data.assigned);
          return;
        }
        t.setCapability(L, q.data.assigned ? "deny" : "allow");
      }
    }
    async function d() {
      var q, H, K;
      const L = (H = (q = t.draft.value) == null ? void 0 : q.persona.profile) == null ? void 0 : H.tts;
      if (L != null && L.voice_asset_id)
        try {
          const S = await Iv(L.voice_asset_id, L.output_language || "auto"), A = new Audio(URL.createObjectURL(S)), M = (K = window.PL) == null ? void 0 : K.audio;
          M ? await M.play(A) : await A.play();
        } catch (S) {
          t.error.value = S instanceof Error ? S.message : String(S);
        }
    }
    function f() {
      var L;
      (L = document.querySelector('[data-view="voice"]')) == null || L.click();
    }
    function g() {
      var L;
      (L = document.querySelector('[data-view="test"]')) == null || L.click();
    }
    function m() {
      !t.draft.value || i.value || (s.value = !s.value);
    }
    function E() {
      s.value = !1;
    }
    async function C() {
      await t.refreshIfClean();
    }
    async function x() {
      var q;
      const L = (q = t.draft.value) == null ? void 0 : q.persona.name;
      !L || !window.confirm(`永久删除“${L}”及其资料、记忆、向量和对话？此操作无法恢复。`) || await t.removeCurrentPersona();
    }
    async function O(L) {
      window.confirm("从角色资料中删除该文件？知识库向量与本地文件将一并移除。") && await t.removeDocument(L);
    }
    async function D(L, q) {
      await t.addDocuments(L, q) && (o.value += 1);
    }
    function y(L, q) {
      var S, A;
      const H = document.querySelector("#preview-title"), K = document.querySelector("#preview-content");
      !H || !K || (H.textContent = L, K.replaceChildren(typeof q == "string" ? document.createTextNode(q) : q), (S = document.querySelector("#preview-drawer")) == null || S.classList.add("is-open"), (A = document.querySelector("#preview-backdrop")) == null || A.classList.add("is-open"));
    }
    function w() {
      var L, q;
      (L = document.querySelector("#preview-drawer")) == null || L.classList.remove("is-open"), (q = document.querySelector("#preview-backdrop")) == null || q.classList.remove("is-open");
    }
    function z(L) {
      y(String(L.original_filename || L.original_name || "资料预览"), String(L.markdown_preview || L.error_message || "暂无预览内容"));
    }
    async function U(L) {
      if (L.type.startsWith("image/")) {
        const H = document.createElement("img"), K = URL.createObjectURL(L);
        H.src = K, H.alt = L.name, H.style.maxWidth = "100%", H.onload = () => URL.revokeObjectURL(K), y(L.name, H);
        return;
      }
      const q = L.type.startsWith("text/") || /\.(md|txt|json|csv|ya?ml)$/i.test(L.name);
      y(L.name, q ? await L.text() : "该文件将在上传转换后提供 Markdown 预览。");
    }
    function W(L) {
      t.isDirty.value && (L.preventDefault(), L.returnValue = "");
    }
    function G(L) {
      var H;
      const q = ((H = L == null ? void 0 : L.detail) == null ? void 0 : H.nodeId) || sessionStorage.getItem("yumeno.manage.node");
      q && (sessionStorage.removeItem("yumeno.manage.node"), t.selectNode(q));
    }
    async function P() {
      await t.refreshIfClean(), G();
    }
    return Ne(() => t.selectedPersonaId.value, () => {
      s.value = !1;
    }), rt(async () => {
      var L, q, H;
      await t.initialize(), G(), window.addEventListener("beforeunload", W), (L = document.querySelector("#role-workbench-root")) == null || L.addEventListener("yumeno:manage-show", P), document.addEventListener("yumeno:manage-select-node", G), (q = document.querySelector("#close-preview")) == null || q.addEventListener("click", w), (H = document.querySelector("#preview-backdrop")) == null || H.addEventListener("click", w);
    }), sn(() => {
      var L, q, H;
      window.removeEventListener("beforeunload", W), (L = document.querySelector("#role-workbench-root")) == null || L.removeEventListener("yumeno:manage-show", P), document.removeEventListener("yumeno:manage-select-node", G), (q = document.querySelector("#close-preview")) == null || q.removeEventListener("click", w), (H = document.querySelector("#preview-backdrop")) == null || H.removeEventListener("click", w);
    }), (L, q) => ($(), T("div", {
      class: ve(["role-workbench", { "is-busy": i.value }])
    }, [
      u("header", vS, [
        u("div", gS, [
          J(Mx, {
            personas: F(t).personas.value,
            "selected-id": F(t).selectedPersonaId.value,
            disabled: i.value,
            onSelect: F(t).selectPersona
          }, null, 8, ["personas", "selected-id", "disabled", "onSelect"]),
          q[3] || (q[3] = u("p", null, "角色运行架构与能力配置", -1))
        ]),
        u("div", mS, [
          F(t).isDirty.value ? ($(), T("span", yS, "存在未保存修改")) : le("", !0),
          u("button", {
            type: "button",
            class: ve({ active: s.value }),
            disabled: !F(t).draft.value || i.value,
            onClick: m
          }, [
            J(F(Lc), { size: 16 }),
            q[4] || (q[4] = he("运行版本"))
          ], 10, bS),
          u("button", {
            type: "button",
            disabled: !F(t).isDirty.value || F(t).isSaving.value || F(t).operationPending.value,
            onClick: q[0] || (q[0] = //@ts-ignore
            (...H) => F(t).discard && F(t).discard(...H))
          }, [
            J(F(pv), { size: 16 }),
            q[5] || (q[5] = he("撤销"))
          ], 8, _S),
          u("button", {
            type: "button",
            class: "primary",
            disabled: !F(t).isDirty.value || F(t).isSaving.value || F(t).operationPending.value,
            onClick: q[1] || (q[1] = //@ts-ignore
            (...H) => F(t).save && F(t).save(...H))
          }, [
            J(F(ar), { size: 16 }),
            he(V(F(t).isSaving.value ? "保存中" : "保存配置"), 1)
          ], 8, wS)
        ])
      ]),
      F(t).error.value ? ($(), T("p", kS, V(F(t).error.value), 1)) : F(t).message.value ? ($(), T("p", ES, V(F(t).message.value), 1)) : le("", !0),
      u("div", xS, [
        u("main", SS, [
          F(t).loading.value ? ($(), T("div", CS, "正在读取角色架构...")) : F(t).personas.value.length ? ($(), vt(Ex, {
            key: 2,
            graph: l.value,
            "selected-node-id": F(t).selectedNodeId.value,
            onSelect: F(t).selectNode,
            onToggle: c,
            onReset: q[2] || (q[2] = (H) => n.value++)
          }, null, 8, ["graph", "selected-node-id", "onSelect"])) : ($(), T("div", $S, q[6] || (q[6] = [
            u("strong", null, "还没有角色", -1),
            u("p", null, "先在“创建角色”页面建立角色。", -1)
          ])))
        ]),
        F(t).draft.value ? ($(), vt(w0, {
          key: 0,
          node: a.value,
          draft: F(t).draft.value,
          disabled: i.value,
          "upload-complete-token": o.value,
          onProfile: F(t).updateProfile,
          onCapability: F(t).setCapability,
          onServer: F(t).setServer,
          onUpload: D,
          onDeleteDocument: O,
          onRetryDocument: F(t).reindexDocument,
          onDeletePersona: x,
          onPreviewVoice: d,
          onOpenVoiceStudio: f,
          onOpenRagEval: g,
          onPreviewDocument: z,
          onPreviewLocalFile: U,
          onRefreshLive2d: F(t).refreshLive2dResources,
          onOpenLive2dDirectory: F(t).openLive2dDirectory
        }, null, 8, ["node", "draft", "disabled", "upload-complete-token", "onProfile", "onCapability", "onServer", "onRetryDocument", "onRefreshLive2d", "onOpenLive2dDirectory"])) : le("", !0)
      ]),
      s.value && F(t).draft.value ? ($(), vt(cS, {
        key: 2,
        "persona-id": F(t).draft.value.persona.id,
        "persona-name": F(t).draft.value.persona.name,
        disabled: i.value || F(t).isDirty.value,
        onClose: E,
        onChanged: C
      }, null, 8, ["persona-id", "persona-name", "disabled"])) : le("", !0)
    ], 2));
  }
});
let hn = null;
function nM(e = "#role-workbench-root") {
  if (hn) return hn;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("角色工作台挂载点不存在");
  return hn = es(NS), hn.mount(t), hn;
}
function oM() {
  var e;
  (e = document.querySelector("#role-workbench-root")) == null || e.dispatchEvent(new CustomEvent("yumeno:manage-show"));
}
function sM() {
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
function IS(e) {
  const t = e.skills || [], n = e.servers || [], o = e.tools || [], s = t.filter((a) => a.enabled).length, i = n.filter((a) => {
    var c;
    return a.enabled && ((c = a.status) == null ? void 0 : c.status) === "connected";
  }).length, r = n.filter((a) => {
    var c, d;
    return ((c = a.status) == null ? void 0 : c.status) === "error" || a.enabled && ((d = a.status) == null ? void 0 : d.status) !== "connected";
  }).length, l = t.filter((a) => !a.builtin && !a.trusted).length;
  return { enabledSkills: s, mcpOnline: i, mcpIssues: r, toolCount: o.length, attentionCount: r + l };
}
function xu(e) {
  const t = {};
  for (const n of e.split(/\r?\n/)) {
    const o = n.trim();
    if (!o) continue;
    const s = o.indexOf("="), i = o.indexOf(":"), r = s > 0 && (i < 0 || s < i) ? s : i;
    r > 0 && (t[o.slice(0, r).trim()] = o.slice(r + 1).trim());
  }
  return t;
}
const MS = { class: "yv-page extension-page" }, OS = { class: "extension-hero" }, TS = { class: "hero-actions" }, PS = ["disabled"], DS = {
  class: "signal-strip",
  "aria-label": "能力状态"
}, RS = { class: "extension-tabs" }, AS = ["onClick"], VS = {
  key: 1,
  class: "overview-layout"
}, LS = { class: "overview-foot" }, zS = {
  key: 0,
  class: "yv-empty"
}, BS = { class: "quick-entry" }, FS = {
  key: 2,
  class: "content-section"
}, US = {
  key: 0,
  class: "yv-empty"
}, HS = { class: "row-main" }, jS = { class: "tag-line" }, GS = { class: "row-actions" }, YS = ["title", "onClick"], qS = ["onClick"], XS = ["onClick"], KS = ["onClick"], WS = {
  key: 3,
  class: "content-section"
}, ZS = {
  key: 0,
  class: "yv-empty"
}, JS = { class: "row-main" }, QS = { class: "grant-field" }, eC = ["value", "onChange"], tC = { class: "row-actions" }, nC = ["onClick"], oC = ["onClick"], sC = ["onClick"], iC = {
  key: 4,
  class: "content-section"
}, rC = { class: "filter-input" }, lC = {
  key: 0,
  class: "yv-empty"
}, aC = { class: "row-main" }, uC = {
  key: 5,
  class: "content-section"
}, cC = { class: "catalog-tools" }, dC = { class: "filter-input" }, fC = { class: "catalog-grid" }, pC = { class: "tag-line" }, hC = ["disabled", "onClick"], vC = { class: "dialog-head" }, gC = { class: "yv-kicker" }, mC = { class: "yv-field" }, yC = ["readonly"], bC = { class: "yv-field" }, _C = { class: "yv-field" }, wC = { class: "yv-field" }, kC = { class: "tool-options" }, EC = ["value"], xC = {
  class: "yv-button primary",
  type: "submit"
}, SC = { class: "yv-field" }, CC = { class: "yv-field" }, $C = { class: "transport-tabs" }, NC = ["onClick"], IC = { class: "yv-field" }, MC = { class: "yv-field" }, OC = { class: "yv-field" }, TC = { class: "yv-field" }, PC = { class: "yv-field" }, DC = {
  class: "yv-button primary",
  type: "submit"
}, RC = { class: "dialog-head" }, AC = { class: "dialog-body" }, VC = { class: "catalog-detail" }, LC = /* @__PURE__ */ Me({
  __name: "App",
  setup(e) {
    const t = [
      { id: "overview", label: "总览" },
      { id: "skills", label: "技能" },
      { id: "mcp", label: "MCP 服务" },
      { id: "tools", label: "工具目录" },
      { id: "catalog", label: "在线扩展" }
    ], n = wn({ skills: [], servers: [], tools: [] }), o = Q("overview"), s = Q(!1), i = Q(""), r = Q(!1), l = Q(""), a = Q(null), c = Q("skill"), d = Q(null), f = Q(null), g = Q([]), m = Q(!1), E = Q(""), C = Q("all"), x = Q(null), O = Q([]), D = Q(null), y = wn({ name: "", description: "", instructions: "", prompt_hint: "", tool_names: [] }), w = wn({ name: "", description: "", transport: "stdio", command: "", args: "", env: "", url: "", headers: "" }), z = ae(() => IS(n)), U = ae(() => {
      const X = l.value.trim().toLowerCase();
      return n.tools.filter((p) => !X || [p.name, p.server, p.description].some((I) => String(I || "").toLowerCase().includes(X)));
    }), W = ae(() => {
      const X = E.value.trim().toLowerCase();
      return g.value.filter((p) => !X || [p.id, p.name, p.description, ...p.categories || []].join(" ").toLowerCase().includes(X));
    }), G = ae(() => Object.entries(n.skills.reduce((X, p) => {
      var b;
      const I = ((b = p.metadata) == null ? void 0 : b.category) || "其他";
      return (X[I] || (X[I] = [])).push(p), X;
    }, {})).sort(([X], [p]) => X.localeCompare(p, "zh")));
    let P = 0;
    function L(X, p = !1) {
      i.value = X, r.value = p;
    }
    async function q(X = !1) {
      X || (s.value = !0);
      try {
        const [p, I, b, _] = await Promise.all([
          De("/api/skills"),
          De("/api/mcp/servers"),
          De("/api/mcp/tools"),
          De("/api/skills/tools")
        ]);
        n.skills = p, n.servers = I, n.tools = b, O.value = _, X || L("扩展状态已刷新");
      } catch (p) {
        L(je(p), !0);
      } finally {
        s.value = !1;
      }
    }
    function H() {
      K(), P = window.setInterval(() => q(!0), 3e4);
    }
    function K() {
      P && window.clearInterval(P), P = 0;
    }
    async function S() {
      await q(!0), H();
    }
    function A() {
      D.value = null, Object.assign(y, { name: "", description: "", instructions: "", prompt_hint: "", tool_names: [] });
    }
    function M(X) {
      A(), c.value = "skill", X && (D.value = X.name, Object.assign(y, { name: X.name, description: X.description || "", instructions: X.instructions || "", prompt_hint: X.prompt_hint || "", tool_names: [...X.tool_names || []] })), nt(() => {
        var p;
        return (p = a.value) == null ? void 0 : p.showModal();
      });
    }
    function R() {
      c.value = "mcp", Object.assign(w, { name: "", description: "", transport: "stdio", command: "", args: "", env: "", url: "", headers: "" }), nt(() => {
        var X;
        return (X = a.value) == null ? void 0 : X.showModal();
      });
    }
    async function j() {
      var X;
      if (!y.name.trim() || !y.instructions.trim()) return L("名称与提示词不能为空", !0);
      s.value = !0;
      try {
        const p = { description: y.description.trim(), instructions: y.instructions.trim(), prompt_hint: y.prompt_hint.trim(), tool_names: y.tool_names };
        D.value ? await De(`/api/skills/${encodeURIComponent(D.value)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) }) : await De("/api/skills", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: y.name.trim(), ...p }) }), (X = a.value) == null || X.close(), await q(!0), L(D.value ? "技能修改已保存" : "技能已创建");
      } catch (p) {
        L(je(p), !0);
      } finally {
        s.value = !1;
      }
    }
    async function ne(X, p) {
      try {
        await De(`/api/skills/${encodeURIComponent(X.name)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) }), await q(!0), L("技能状态已更新");
      } catch (I) {
        L(je(I), !0);
      }
    }
    async function re(X) {
      if (confirm(`删除技能 ${X.name}？`))
        try {
          await De(`/api/skills/${encodeURIComponent(X.name)}`, { method: "DELETE" }), await q(!0), L("技能已删除");
        } catch (p) {
          L(je(p), !0);
        }
    }
    async function ue(X) {
      var I;
      if (!X) return;
      const p = new FormData();
      p.append("file", X);
      try {
        const b = await De("/api/skills/upload", { method: "POST", body: p });
        await q(!0), L((I = b.installed) != null && I.length ? `已安装：${b.installed.join("、")}` : "上传完成");
      } catch (b) {
        L(je(b), !0);
      } finally {
        d.value && (d.value.value = "");
      }
    }
    async function se() {
      var X;
      if (!w.name.trim()) return L("服务器名称不能为空", !0);
      try {
        await De("/api/mcp/servers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: w.name.trim(), description: w.description.trim(), transport: w.transport, command: w.command.trim(), args: w.args.split(/\r?\n/).map((p) => p.trim()).filter(Boolean), env: xu(w.env), url: w.url.trim(), headers: xu(w.headers), enabled: !0 }) }), (X = a.value) == null || X.close(), await q(!0), L("MCP 服务已保存并连接");
      } catch (p) {
        L(je(p), !0);
      }
    }
    async function fe(X) {
      try {
        await De(`/api/mcp/servers/${encodeURIComponent(X.name)}/${X.enabled ? "disable" : "enable"}`, { method: "POST" }), await q(!0);
      } catch (p) {
        L(je(p), !0);
      }
    }
    async function ce(X) {
      L(`正在测试 ${X.name}…`);
      try {
        const p = await De(`/api/mcp/servers/${encodeURIComponent(X.name)}/test`, { method: "POST" });
        L(p.ok ? `${X.name} 连接正常：${p.tool_count} 个工具，耗时 ${p.elapsed_ms}ms` : `${X.name} 连接失败：${p.error}`, !p.ok), await q(!0);
      } catch (p) {
        L(je(p), !0);
      }
    }
    async function ge(X, p) {
      const b = p.target.value.split(",").map((_) => _.trim()).filter(Boolean);
      try {
        await De(`/api/mcp/servers/${encodeURIComponent(X.name)}/grants`, { method: "PATCH", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" }, body: JSON.stringify({ allowed_persona_ids: b }) }), L(`已更新 ${X.name} 的授权`);
      } catch (_) {
        L(je(_), !0);
      }
    }
    async function ee(X) {
      if (confirm(`删除 MCP 服务器 ${X.name}？其工具将立即不可用。`))
        try {
          await De(`/api/mcp/servers/${encodeURIComponent(X.name)}`, { method: "DELETE" }), await q(!0), L("MCP 服务已删除");
        } catch (p) {
          L(je(p), !0);
        }
    }
    async function _e(X = !1) {
      try {
        const p = await De(`/api/extensions/catalog?kind=${encodeURIComponent(C.value)}${X ? "&refresh=true" : ""}`);
        g.value = p.items || [], m.value = !!p.stale;
      } catch {
        L("在线扩展目录暂时不可用，可稍后重试", !0), g.value = [];
      }
    }
    function xe(X) {
      return X.kind === "skill" ? n.skills.some((p) => p.name === X.id) : n.servers.some((p) => p.name === X.id);
    }
    function we(X) {
      x.value = X, nt(() => {
        var p;
        return (p = f.value) == null ? void 0 : p.showModal();
      });
    }
    async function me() {
      var p, I, b;
      const X = x.value;
      if (X)
        try {
          const _ = await De(`/api/extensions/catalog/${encodeURIComponent(X.id)}/install`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmed: !1 }) });
          if ((I = (p = _.preview) == null ? void 0 : p.conflicts) != null && I.length) throw new Error(_.preview.conflicts.join("；"));
          const k = await De(`/api/extensions/catalog/${encodeURIComponent(X.id)}/install`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmed: !0 }) });
          if (k.status !== "installed") throw new Error(k.message || "安装未完成");
          await q(!0), (b = f.value) == null || b.close(), L(X.kind === "skill" ? "安装完成，请在技能页启用并信任" : "安装完成，请在 MCP 页启用并授权角色");
        } catch (_) {
          L(je(_), !0);
        }
    }
    return rt(() => {
      const X = document.querySelector("#extensions-app-root");
      X == null || X.addEventListener("yumeno:extensions-show", S), X == null || X.addEventListener("yumeno:extensions-hide", K), S();
    }), sn(() => K()), (X, p) => {
      var I, b, _, k, v, h, B, Y;
      return $(), T("main", MS, [
        u("header", OS, [
          p[26] || (p[26] = u("div", null, [
            u("span", { class: "yv-kicker" }, "Agent capability registry"),
            u("h1", null, "能力扩展"),
            u("p", null, "统一管理角色可调用的 Skill、Tool 与 MCP 服务。")
          ], -1)),
          u("div", TS, [
            u("span", {
              class: ve(["yv-status", z.value.attentionCount ? "warn" : "ok"])
            }, V(z.value.attentionCount ? `${z.value.attentionCount} 项待处理` : "运行正常"), 3),
            u("button", {
              class: "yv-button yv-icon-button",
              title: "刷新",
              disabled: s.value,
              onClick: p[0] || (p[0] = (N) => q())
            }, [
              J(F(Nt))
            ], 8, PS)
          ])
        ]),
        u("section", DS, [
          u("div", null, [
            p[27] || (p[27] = u("span", null, "已启用技能", -1)),
            u("strong", null, V(z.value.enabledSkills), 1),
            u("small", null, "共 " + V(n.skills.length) + " 个", 1)
          ]),
          u("div", null, [
            p[28] || (p[28] = u("span", null, "MCP 在线", -1)),
            u("strong", null, V(z.value.mcpOnline), 1),
            u("small", null, V(z.value.mcpIssues) + " 项异常", 1)
          ]),
          u("div", null, [
            p[29] || (p[29] = u("span", null, "已注册工具", -1)),
            u("strong", null, V(z.value.toolCount), 1),
            p[30] || (p[30] = u("small", null, "统一工具注册表", -1))
          ]),
          u("div", null, [
            p[31] || (p[31] = u("span", null, "需要处理", -1)),
            u("strong", null, V(z.value.attentionCount), 1),
            p[32] || (p[32] = u("small", null, "信任与连接状态", -1))
          ])
        ]),
        u("nav", RS, [
          ($(), T(be, null, Te(t, (N) => u("button", {
            key: N.id,
            class: ve({ active: o.value === N.id }),
            onClick: (te) => {
              o.value = N.id, N.id === "catalog" && _e(!1);
            }
          }, V(N.label), 11, AS)), 64))
        ]),
        i.value ? ($(), T("p", {
          key: 0,
          class: ve(["extension-message", { error: r.value }]),
          role: "status"
        }, V(i.value), 3)) : le("", !0),
        o.value === "overview" ? ($(), T("section", VS, [
          p[37] || (p[37] = ch('<div class="capability-line"><article><span>决策层</span><strong>Agent</strong><p>选择是否调用扩展能力</p></article><article class="skill"><span>指令层</span><strong>Skill</strong><p>按场景注入执行规则</p></article><article class="tool"><span>执行层</span><strong>Tool</strong><p>标准化系统动作</p></article><article class="mcp"><span>协议层</span><strong>MCP</strong><p>连接外部工具服务</p></article></div>', 1)),
          u("div", LS, [
            u("div", null, [
              p[33] || (p[33] = u("h2", null, "当前连接", -1)),
              n.servers.length ? le("", !0) : ($(), T("p", zS, "尚未配置 MCP 服务")),
              ($(!0), T(be, null, Te(n.servers, (N) => {
                var te, Z, ie;
                return $(), T("div", {
                  key: N.name,
                  class: "health-row"
                }, [
                  u("strong", null, V(N.name), 1),
                  u("span", null, V(N.description || "外部工具服务"), 1),
                  u("em", {
                    class: ve(["yv-status", ((te = N.status) == null ? void 0 : te.status) === "connected" ? "ok" : "warn"])
                  }, V(((Z = N.status) == null ? void 0 : Z.status) === "connected" ? `${N.status.tool_count} 个工具` : ((ie = N.status) == null ? void 0 : ie.status) === "error" ? "连接异常" : "未连接"), 3)
                ]);
              }), 128))
            ]),
            u("div", BS, [
              p[36] || (p[36] = u("h2", null, "管理入口", -1)),
              u("button", {
                class: "yv-button primary",
                onClick: p[1] || (p[1] = (N) => M())
              }, [
                J(F(Pn)),
                p[34] || (p[34] = he("新增技能"))
              ]),
              u("button", {
                class: "yv-button",
                onClick: p[2] || (p[2] = (N) => R())
              }, [
                J(F(Pn)),
                p[35] || (p[35] = he("新增 MCP 服务"))
              ])
            ])
          ])
        ])) : o.value === "skills" ? ($(), T("section", FS, [
          u("header", null, [
            p[40] || (p[40] = u("div", null, [
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
                onChange: p[3] || (p[3] = (N) => {
                  var te;
                  return ue((te = N.target.files) == null ? void 0 : te[0]);
                })
              }, null, 544),
              u("button", {
                class: "yv-button",
                onClick: p[4] || (p[4] = (N) => {
                  var te;
                  return (te = d.value) == null ? void 0 : te.click();
                })
              }, [
                J(F(cr)),
                p[38] || (p[38] = he("上传技能包"))
              ]),
              u("button", {
                class: "yv-button primary",
                onClick: p[5] || (p[5] = (N) => M())
              }, [
                J(F(Pn)),
                p[39] || (p[39] = he("新增技能"))
              ])
            ])
          ]),
          n.skills.length ? le("", !0) : ($(), T("div", US, "还没有技能")),
          ($(!0), T(be, null, Te(G.value, ([N, te]) => ($(), T("section", {
            key: N,
            class: "skill-group"
          }, [
            u("h3", null, V(N), 1),
            ($(!0), T(be, null, Te(te, (Z) => ($(), T("article", {
              key: Z.name,
              class: "extension-row kind-skill"
            }, [
              u("div", HS, [
                u("div", null, [
                  u("strong", null, V(Z.name), 1),
                  u("span", null, V(Z.builtin ? "内置" : "自定义") + " · " + V(Z.format === "skillmd" ? "标准包" : "JSON"), 1)
                ]),
                u("p", null, V(Z.description || "暂无说明"), 1),
                u("div", jS, [
                  ($(!0), T(be, null, Te(Z.tool_names, (ie) => ($(), T("span", { key: ie }, V(ie), 1))), 128))
                ])
              ]),
              u("div", GS, [
                u("span", {
                  class: ve(["yv-status", Z.enabled ? "ok" : "warn"])
                }, V(Z.enabled ? "已启用" : "已停用"), 3),
                u("button", {
                  class: "yv-button yv-icon-button",
                  title: Z.enabled ? "停用" : "启用",
                  onClick: (ie) => ne(Z, { enabled: !Z.enabled })
                }, [
                  J(F(fv))
                ], 8, YS),
                !Z.builtin && !Z.trusted ? ($(), T("button", {
                  key: 0,
                  class: "yv-button",
                  onClick: (ie) => ne(Z, { trusted: !0 })
                }, "信任", 8, qS)) : le("", !0),
                Z.builtin ? le("", !0) : ($(), T("button", {
                  key: 1,
                  class: "yv-button yv-icon-button",
                  title: "编辑",
                  onClick: (ie) => M(Z)
                }, [
                  J(F(zc))
                ], 8, XS)),
                Z.builtin ? le("", !0) : ($(), T("button", {
                  key: 2,
                  class: "yv-button yv-icon-button danger",
                  title: "删除",
                  onClick: (ie) => re(Z)
                }, [
                  J(F(en))
                ], 8, KS))
              ])
            ]))), 128))
          ]))), 128))
        ])) : o.value === "mcp" ? ($(), T("section", WS, [
          u("header", null, [
            p[42] || (p[42] = u("div", null, [
              u("span", { class: "yv-kicker" }, "External protocol services"),
              u("h2", null, "MCP 服务"),
              u("p", null, "连接、测试并限制外部服务可访问的角色。")
            ], -1)),
            u("button", {
              class: "yv-button primary",
              onClick: p[6] || (p[6] = (N) => R())
            }, [
              J(F(Pn)),
              p[41] || (p[41] = he("新增服务"))
            ])
          ]),
          n.servers.length ? le("", !0) : ($(), T("div", ZS, "尚未配置 MCP 服务")),
          ($(!0), T(be, null, Te(n.servers, (N) => {
            var te, Z, ie, de, ke;
            return $(), T("article", {
              key: N.name,
              class: "extension-row kind-mcp"
            }, [
              u("div", JS, [
                u("div", null, [
                  u("strong", null, V(N.name), 1),
                  u("span", null, V(N.transport) + " · " + V(N.enabled ? "已启用" : "已停用"), 1)
                ]),
                u("p", null, V(N.description || ((te = N.status) == null ? void 0 : te.error) || "暂无说明"), 1),
                u("label", QS, [
                  p[43] || (p[43] = u("span", null, "授权角色", -1)),
                  u("input", {
                    value: (N.allowed_persona_ids || []).join(","),
                    placeholder: "* 或角色 ID，逗号分隔",
                    onChange: ($e) => ge(N, $e)
                  }, null, 40, eC)
                ])
              ]),
              u("div", tC, [
                u("span", {
                  class: ve(["yv-status", ((Z = N.status) == null ? void 0 : Z.status) === "connected" ? "ok" : ((ie = N.status) == null ? void 0 : ie.status) === "error" ? "error" : "warn"])
                }, V(((de = N.status) == null ? void 0 : de.status) === "connected" ? `${N.status.tool_count} 个工具` : ((ke = N.status) == null ? void 0 : ke.status) === "error" ? "连接失败" : "等待连接"), 3),
                u("button", {
                  class: "yv-button",
                  onClick: ($e) => ce(N)
                }, "测试", 8, nC),
                u("button", {
                  class: "yv-button",
                  onClick: ($e) => fe(N)
                }, V(N.enabled ? "停用" : "启用"), 9, oC),
                u("button", {
                  class: "yv-button yv-icon-button danger",
                  title: "删除",
                  onClick: ($e) => ee(N)
                }, [
                  J(F(en))
                ], 8, sC)
              ])
            ]);
          }), 128))
        ])) : o.value === "tools" ? ($(), T("section", iC, [
          u("header", null, [
            p[44] || (p[44] = u("div", null, [
              u("span", { class: "yv-kicker" }, "Unified registry"),
              u("h2", null, "工具目录"),
              u("p", null, "查看内置工具与 MCP 工具的统一注册结果。")
            ], -1)),
            u("label", rC, [
              J(F(ur)),
              Ce(u("input", {
                "onUpdate:modelValue": p[7] || (p[7] = (N) => l.value = N),
                placeholder: "搜索工具名、服务或描述"
              }, null, 512), [
                [Le, l.value]
              ])
            ])
          ]),
          U.value.length ? le("", !0) : ($(), T("div", lC, "没有匹配的工具")),
          ($(!0), T(be, null, Te(U.value, (N) => ($(), T("article", {
            key: `${N.server}/${N.name}`,
            class: "extension-row kind-tool"
          }, [
            u("div", aC, [
              u("div", null, [
                u("strong", null, V(N.name), 1),
                u("span", null, V(N.server || "内置"), 1)
              ]),
              u("p", null, V(N.description || "暂无说明"), 1)
            ]),
            u("span", {
              class: ve(["yv-status", N.requires_confirmation ? "warn" : "ok"])
            }, V(N.requires_confirmation ? "调用需确认" : "可直接调用"), 3)
          ]))), 128))
        ])) : ($(), T("section", uC, [
          u("header", null, [
            p[46] || (p[46] = u("div", null, [
              u("span", { class: "yv-kicker" }, "Curated catalog"),
              u("h2", null, "在线扩展"),
              u("p", null, "先检查来源与权限，再将扩展加入本地能力系统。")
            ], -1)),
            u("button", {
              class: "yv-button",
              onClick: p[8] || (p[8] = (N) => _e(!0))
            }, [
              J(F(Nt)),
              p[45] || (p[45] = he("刷新目录"))
            ])
          ]),
          u("div", cC, [
            u("label", dC, [
              J(F(ur)),
              Ce(u("input", {
                "onUpdate:modelValue": p[9] || (p[9] = (N) => E.value = N),
                placeholder: "搜索名称、说明或分类"
              }, null, 512), [
                [Le, E.value]
              ])
            ]),
            Ce(u("select", {
              "onUpdate:modelValue": p[10] || (p[10] = (N) => C.value = N),
              onChange: p[11] || (p[11] = (N) => _e(!1))
            }, p[47] || (p[47] = [
              u("option", { value: "all" }, "全部类型", -1),
              u("option", { value: "skill" }, "Skill", -1),
              u("option", { value: "mcp" }, "MCP", -1)
            ]), 544), [
              [Qt, C.value]
            ]),
            u("span", {
              class: ve(["yv-status", m.value ? "warn" : "ok"])
            }, V(m.value ? "缓存目录" : `${g.value.length} 个条目`), 3)
          ]),
          u("div", fC, [
            ($(!0), T(be, null, Te(W.value, (N) => ($(), T("article", {
              key: N.id,
              class: ve(["catalog-item", `kind-${N.kind}`])
            }, [
              u("span", null, V(N.kind.toUpperCase()), 1),
              u("h3", null, V(N.name || N.id), 1),
              u("small", null, "v" + V(N.version || "未知") + " · " + V(N.id), 1),
              u("p", null, V(N.description || "暂无说明"), 1),
              u("div", pC, [
                ($(!0), T(be, null, Te(N.categories, (te) => ($(), T("span", { key: te }, V(te), 1))), 128))
              ]),
              u("button", {
                class: "yv-button",
                disabled: xe(N),
                onClick: (te) => we(N)
              }, V(xe(N) ? "已安装" : "查看并安装"), 9, hC)
            ], 2))), 128))
          ])
        ])),
        u("dialog", {
          ref_key: "drawer",
          ref: a,
          class: "yv-dialog"
        }, [
          u("header", vC, [
            u("div", null, [
              u("span", gC, V(c.value === "skill" ? "Instruction package" : "Protocol service"), 1),
              u("h2", null, V(c.value === "skill" ? D.value ? `编辑 ${D.value}` : "新增技能" : "新增 MCP 服务"), 1)
            ]),
            u("button", {
              class: "yv-button yv-icon-button",
              title: "关闭",
              onClick: p[12] || (p[12] = (N) => {
                var te;
                return (te = a.value) == null ? void 0 : te.close();
              })
            }, [
              J(F(Kt))
            ])
          ]),
          c.value === "skill" ? ($(), T("form", {
            key: 0,
            class: "dialog-body",
            onSubmit: gt(j, ["prevent"])
          }, [
            u("label", mC, [
              p[48] || (p[48] = u("span", null, "名称", -1)),
              Ce(u("input", {
                "onUpdate:modelValue": p[13] || (p[13] = (N) => y.name = N),
                readonly: !!D.value
              }, null, 8, yC), [
                [Le, y.name]
              ])
            ]),
            u("label", bC, [
              p[49] || (p[49] = u("span", null, "描述", -1)),
              Ce(u("input", {
                "onUpdate:modelValue": p[14] || (p[14] = (N) => y.description = N)
              }, null, 512), [
                [Le, y.description]
              ])
            ]),
            u("label", _C, [
              p[50] || (p[50] = u("span", null, "提示词", -1)),
              Ce(u("textarea", {
                "onUpdate:modelValue": p[15] || (p[15] = (N) => y.instructions = N),
                rows: "6"
              }, null, 512), [
                [Le, y.instructions]
              ])
            ]),
            u("label", wC, [
              p[51] || (p[51] = u("span", null, "触发提示", -1)),
              Ce(u("input", {
                "onUpdate:modelValue": p[16] || (p[16] = (N) => y.prompt_hint = N)
              }, null, 512), [
                [Le, y.prompt_hint]
              ])
            ]),
            u("fieldset", kC, [
              p[52] || (p[52] = u("legend", null, "可附加工具", -1)),
              ($(!0), T(be, null, Te(O.value, (N) => ($(), T("label", {
                key: N.name
              }, [
                Ce(u("input", {
                  "onUpdate:modelValue": p[17] || (p[17] = (te) => y.tool_names = te),
                  type: "checkbox",
                  value: N.name
                }, null, 8, EC), [
                  [Xr, y.tool_names]
                ]),
                u("span", null, V(N.name) + V(N.requires_confirmation ? "（需确认）" : ""), 1)
              ]))), 128))
            ]),
            u("button", xC, [
              J(F(ar)),
              p[53] || (p[53] = he("保存技能"))
            ])
          ], 32)) : ($(), T("form", {
            key: 1,
            class: "dialog-body",
            onSubmit: gt(se, ["prevent"])
          }, [
            u("label", SC, [
              p[54] || (p[54] = u("span", null, "名称", -1)),
              Ce(u("input", {
                "onUpdate:modelValue": p[18] || (p[18] = (N) => w.name = N)
              }, null, 512), [
                [Le, w.name]
              ])
            ]),
            u("label", CC, [
              p[55] || (p[55] = u("span", null, "描述", -1)),
              Ce(u("input", {
                "onUpdate:modelValue": p[19] || (p[19] = (N) => w.description = N)
              }, null, 512), [
                [Le, w.description]
              ])
            ]),
            u("div", $C, [
              ($(), T(be, null, Te([{ id: "stdio", label: "本地进程" }, { id: "streamable_http", label: "远程 HTTP" }, { id: "sse", label: "远程 SSE" }], (N) => u("button", {
                key: N.id,
                type: "button",
                class: ve({ active: w.transport === N.id }),
                onClick: (te) => w.transport = N.id
              }, V(N.label), 11, NC)), 64))
            ]),
            w.transport === "stdio" ? ($(), T(be, { key: 0 }, [
              u("label", IC, [
                p[56] || (p[56] = u("span", null, "启动命令", -1)),
                Ce(u("input", {
                  "onUpdate:modelValue": p[20] || (p[20] = (N) => w.command = N)
                }, null, 512), [
                  [Le, w.command]
                ])
              ]),
              u("label", MC, [
                p[57] || (p[57] = u("span", null, "参数（每行一个）", -1)),
                Ce(u("textarea", {
                  "onUpdate:modelValue": p[21] || (p[21] = (N) => w.args = N),
                  rows: "3"
                }, null, 512), [
                  [Le, w.args]
                ])
              ]),
              u("label", OC, [
                p[58] || (p[58] = u("span", null, "环境变量（KEY=VALUE）", -1)),
                Ce(u("textarea", {
                  "onUpdate:modelValue": p[22] || (p[22] = (N) => w.env = N),
                  rows: "3"
                }, null, 512), [
                  [Le, w.env]
                ])
              ])
            ], 64)) : ($(), T(be, { key: 1 }, [
              u("label", TC, [
                p[59] || (p[59] = u("span", null, "服务器地址", -1)),
                Ce(u("input", {
                  "onUpdate:modelValue": p[23] || (p[23] = (N) => w.url = N)
                }, null, 512), [
                  [Le, w.url]
                ])
              ]),
              u("label", PC, [
                p[60] || (p[60] = u("span", null, "请求头（KEY: VALUE）", -1)),
                Ce(u("textarea", {
                  "onUpdate:modelValue": p[24] || (p[24] = (N) => w.headers = N),
                  rows: "3"
                }, null, 512), [
                  [Le, w.headers]
                ])
              ])
            ], 64)),
            u("button", DC, [
              J(F(ar)),
              p[61] || (p[61] = he("保存服务"))
            ])
          ], 32))
        ], 512),
        u("dialog", {
          ref_key: "catalogDialog",
          ref: f,
          class: "yv-dialog"
        }, [
          u("header", RC, [
            u("div", null, [
              p[62] || (p[62] = u("span", { class: "yv-kicker" }, "安装预览", -1)),
              u("h2", null, V(((I = x.value) == null ? void 0 : I.name) || ((b = x.value) == null ? void 0 : b.id)), 1)
            ]),
            u("button", {
              class: "yv-button yv-icon-button",
              title: "关闭",
              onClick: p[25] || (p[25] = (N) => {
                var te;
                return (te = f.value) == null ? void 0 : te.close();
              })
            }, [
              J(F(Kt))
            ])
          ]),
          u("div", AC, [
            u("p", null, V(((_ = x.value) == null ? void 0 : _.description) || "暂无说明"), 1),
            u("dl", VC, [
              p[63] || (p[63] = u("dt", null, "类型", -1)),
              u("dd", null, V((v = (k = x.value) == null ? void 0 : k.kind) == null ? void 0 : v.toUpperCase()), 1),
              p[64] || (p[64] = u("dt", null, "版本", -1)),
              u("dd", null, V(((h = x.value) == null ? void 0 : h.version) || "未知"), 1),
              p[65] || (p[65] = u("dt", null, "来源", -1)),
              u("dd", null, V(((Y = (B = x.value) == null ? void 0 : B.source) == null ? void 0 : Y.type) || "未知"), 1)
            ]),
            u("button", {
              class: "yv-button primary",
              onClick: me
            }, [
              J(F(Kn)),
              p[66] || (p[66] = he("确认安装"))
            ])
          ])
        ], 512)
      ]);
    };
  }
});
let vn = null;
const Ef = () => document.querySelector("#extensions-app-root");
function iM(e = "#extensions-app-root") {
  if (vn) return vn;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("能力扩展挂载点不存在");
  return vn = es(LC), vn.mount(t), vn;
}
function rM() {
  var e;
  (e = Ef()) == null || e.dispatchEvent(new CustomEvent("yumeno:extensions-show"));
}
function lM() {
  var e;
  (e = Ef()) == null || e.dispatchEvent(new CustomEvent("yumeno:extensions-hide"));
}
function aM() {
  vn && (vn.unmount(), vn = null);
}
const zC = /* @__PURE__ */ new Set([
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
  return zC.has(e) && Number.isFinite(n) ? `${Math.round(n * 100)}%` : typeof t == "number" && Number.isFinite(n) ? Number.isInteger(n) ? String(n) : n.toFixed(3) : String(t ?? "—");
}
function BC(e, t) {
  return t ? Math.max(0, Math.min(100, Math.round(e / t * 100))) : 0;
}
function FC(e) {
  return {
    persona_id: e.personaId,
    tier: e.tier,
    dataset_mode: e.datasetMode
  };
}
function qs(e) {
  return [...new Set(e.split(/[\n,，]+/).map((t) => t.trim()).filter(Boolean))];
}
function xf(e) {
  return {
    question: e.question.trim(),
    expected_answer: e.expectedAnswer.trim(),
    relevant_document_ids: qs(e.documentIds),
    tags: qs(e.tags),
    difficulty: e.difficulty,
    enabled: e.enabled
  };
}
function UC(e) {
  return De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-cases`, { cache: "no-store" });
}
function HC(e, t) {
  return De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(xf(t))
  });
}
function jC(e, t, n) {
  return De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-cases/${encodeURIComponent(t)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(xf(n))
  });
}
async function GC(e, t) {
  await De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-cases/${encodeURIComponent(t)}`, {
    method: "DELETE"
  });
}
function YC(e, t = "pending") {
  return De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-candidates?status=${encodeURIComponent(t)}`, { cache: "no-store" });
}
function qC(e) {
  return De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-candidates/sync`, { method: "POST" });
}
function XC(e) {
  const t = { note: (e.note || "").trim() };
  return e.expectedAnswer !== void 0 && (t.expected_answer = e.expectedAnswer.trim()), e.documentIds !== void 0 && (t.relevant_document_ids = qs(e.documentIds)), e.tags !== void 0 && (t.tags = qs(e.tags)), e.difficulty !== void 0 && (t.difficulty = e.difficulty), t;
}
function KC(e, t, n) {
  return De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-candidates/${encodeURIComponent(t)}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(XC(n))
  });
}
function WC(e, t, n = "") {
  return De(`/api/knowledge-spaces/${encodeURIComponent(e)}/eval-candidates/${encodeURIComponent(t)}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note: n.trim() })
  });
}
const ZC = {
  class: "eval-dataset",
  "aria-label": "人工评测题集"
}, JC = { class: "eval-dataset-heading" }, QC = { key: 0 }, e$ = { class: "eval-dataset-actions" }, t$ = ["disabled"], n$ = ["disabled"], o$ = {
  key: 0,
  class: "eval-dataset-error"
}, s$ = {
  key: 1,
  class: "eval-dataset-editor"
}, i$ = { class: "eval-dataset-editor-head" }, r$ = ["disabled"], l$ = { class: "yv-field" }, a$ = { class: "yv-field" }, u$ = { class: "eval-dataset-form-grid" }, c$ = { class: "yv-field" }, d$ = { class: "yv-field" }, f$ = { class: "yv-field" }, p$ = { class: "eval-dataset-check" }, h$ = { class: "eval-dataset-editor-actions" }, v$ = ["disabled"], g$ = ["disabled"], m$ = {
  key: 2,
  class: "eval-dataset-empty"
}, y$ = {
  key: 3,
  class: "eval-dataset-empty"
}, b$ = {
  key: 4,
  class: "eval-dataset-empty"
}, _$ = {
  key: 5,
  class: "eval-dataset-list"
}, w$ = { class: "eval-dataset-row-main" }, k$ = { key: 0 }, E$ = { class: "eval-dataset-meta" }, x$ = { key: 0 }, S$ = { key: 1 }, C$ = { class: "eval-dataset-row-actions" }, $$ = ["disabled", "onClick"], N$ = ["disabled", "onClick"], I$ = /* @__PURE__ */ Me({
  __name: "EvalDatasetPanel",
  props: {
    spaceId: {}
  },
  setup(e) {
    const t = e, n = Q([]), o = Q(!1), s = Q(!1), i = Q(""), r = Q(!1), l = Q(null), a = Q(g());
    let c = 0;
    const d = ae(() => n.value.filter((z) => z.enabled !== !1).length), f = ae(() => !!l.value);
    function g() {
      return { question: "", expectedAnswer: "", documentIds: "", tags: "", difficulty: "medium", enabled: !0 };
    }
    function m(z) {
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
    function E(z) {
      return { easy: "简单", medium: "中等", hard: "困难" }[z || "medium"] || "中等";
    }
    function C() {
      l.value = null, a.value = g(), r.value = !0, i.value = "";
    }
    function x(z) {
      l.value = z.id, a.value = m(z), r.value = !0, i.value = "";
    }
    function O() {
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
        const U = await UC(t.spaceId);
        z === c && (n.value = U.items || []);
      } catch (U) {
        z === c && (i.value = je(U));
      } finally {
        z === c && (o.value = !1);
      }
    }
    async function y() {
      if (!t.spaceId || !a.value.question.trim()) {
        i.value = "请填写问题";
        return;
      }
      s.value = !0, i.value = "";
      try {
        const z = l.value ? await jC(t.spaceId, l.value, a.value) : await HC(t.spaceId, a.value);
        l.value ? n.value = n.value.map((U) => U.id === z.id ? z : U) : n.value = [...n.value, z], O();
      } catch (z) {
        i.value = je(z);
      } finally {
        s.value = !1;
      }
    }
    async function w(z) {
      if (!(!t.spaceId || !window.confirm(`删除这条评测题？

${z.question}`))) {
        s.value = !0, i.value = "";
        try {
          await GC(t.spaceId, z.id), n.value = n.value.filter((U) => U.id !== z.id), l.value === z.id && O();
        } catch (U) {
          i.value = je(U);
        } finally {
          s.value = !1;
        }
      }
    }
    return Ne(() => t.spaceId, D), rt(D), (z, U) => ($(), T("section", ZC, [
      u("header", JC, [
        u("div", null, [
          U[7] || (U[7] = u("span", { class: "yv-kicker" }, "Regression set", -1)),
          u("h2", null, [
            U[6] || (U[6] = he("人工题集 ")),
            n.value.length ? ($(), T("small", QC, V(d.value) + "/" + V(n.value.length) + " 启用", 1)) : le("", !0)
          ]),
          U[8] || (U[8] = u("p", null, "把真实问题留成可重复的回归样本。", -1))
        ]),
        u("div", e$, [
          u("button", {
            class: "yv-button",
            type: "button",
            disabled: o.value || s.value || !z.spaceId,
            title: "刷新题集",
            onClick: D
          }, [
            J(F(Nt), {
              size: 14,
              class: ve({ "is-spinning": o.value })
            }, null, 8, ["class"]),
            U[9] || (U[9] = he("刷新"))
          ], 8, t$),
          u("button", {
            class: "yv-button primary",
            type: "button",
            disabled: s.value || !z.spaceId,
            onClick: C
          }, [
            J(F(Pn), { size: 14 }),
            U[10] || (U[10] = he("新增题目"))
          ], 8, n$)
        ])
      ]),
      i.value ? ($(), T("p", o$, V(i.value), 1)) : le("", !0),
      r.value ? ($(), T("div", s$, [
        u("div", i$, [
          u("strong", null, V(f.value ? "编辑题目" : "新增题目"), 1),
          u("button", {
            class: "icon-button",
            type: "button",
            title: "关闭",
            disabled: s.value,
            onClick: O
          }, [
            J(F(Kt), { size: 15 })
          ], 8, r$)
        ]),
        u("label", l$, [
          U[11] || (U[11] = u("span", null, "问题", -1)),
          Ce(u("textarea", {
            name: "question",
            "onUpdate:modelValue": U[0] || (U[0] = (W) => a.value.question = W),
            rows: "2",
            maxlength: "4000",
            placeholder: "例如：YUMENO 如何选择知识检索路径？"
          }, null, 512), [
            [Le, a.value.question]
          ])
        ]),
        u("label", a$, [
          U[12] || (U[12] = u("span", null, [
            he("预期答案 "),
            u("em", null, "可选")
          ], -1)),
          Ce(u("textarea", {
            name: "expected_answer",
            "onUpdate:modelValue": U[1] || (U[1] = (W) => a.value.expectedAnswer = W),
            rows: "3",
            maxlength: "8000",
            placeholder: "用于人工复核与后续答案对比"
          }, null, 512), [
            [Le, a.value.expectedAnswer]
          ])
        ]),
        u("div", u$, [
          u("label", c$, [
            U[13] || (U[13] = u("span", null, [
              he("相关资料 ID "),
              u("em", null, "每行一个，也可用逗号分隔")
            ], -1)),
            Ce(u("textarea", {
              "onUpdate:modelValue": U[2] || (U[2] = (W) => a.value.documentIds = W),
              rows: "2",
              placeholder: "上传资料列表中的 ID"
            }, null, 512), [
              [Le, a.value.documentIds]
            ])
          ]),
          u("label", d$, [
            U[14] || (U[14] = u("span", null, [
              he("标签 "),
              u("em", null, "用逗号分隔")
            ], -1)),
            Ce(u("input", {
              "onUpdate:modelValue": U[3] || (U[3] = (W) => a.value.tags = W),
              placeholder: "角色, RAG, 回归"
            }, null, 512), [
              [Le, a.value.tags]
            ])
          ]),
          u("label", f$, [
            U[16] || (U[16] = u("span", null, "难度", -1)),
            Ce(u("select", {
              "onUpdate:modelValue": U[4] || (U[4] = (W) => a.value.difficulty = W)
            }, U[15] || (U[15] = [
              u("option", { value: "easy" }, "简单", -1),
              u("option", { value: "medium" }, "中等", -1),
              u("option", { value: "hard" }, "困难", -1)
            ]), 512), [
              [Qt, a.value.difficulty]
            ])
          ]),
          u("label", p$, [
            Ce(u("input", {
              "onUpdate:modelValue": U[5] || (U[5] = (W) => a.value.enabled = W),
              type: "checkbox"
            }, null, 512), [
              [Xr, a.value.enabled]
            ]),
            U[17] || (U[17] = u("span", null, "加入后续评测", -1))
          ])
        ]),
        u("div", h$, [
          u("button", {
            class: "yv-button",
            type: "button",
            disabled: s.value,
            onClick: O
          }, "取消", 8, v$),
          u("button", {
            class: "yv-button primary",
            type: "button",
            disabled: s.value || !a.value.question.trim(),
            onClick: y
          }, [
            J(F(ao), { size: 14 }),
            he(V(s.value ? "保存中" : "保存题目"), 1)
          ], 8, g$)
        ])
      ])) : le("", !0),
      o.value && !n.value.length ? ($(), T("div", m$, "读取题集…")) : !n.value.length && !z.spaceId ? ($(), T("div", y$, "先选择一个角色")) : n.value.length ? ($(), T("div", _$, [
        ($(!0), T(be, null, Te(n.value, (W) => {
          var G;
          return $(), T("article", {
            key: W.id,
            class: ve(["eval-dataset-row", { "is-disabled": W.enabled === !1 }])
          }, [
            u("div", w$, [
              u("strong", null, V(W.question), 1),
              W.expected_answer ? ($(), T("p", k$, V(W.expected_answer), 1)) : le("", !0),
              u("div", E$, [
                u("span", null, V(E(W.difficulty)), 1),
                (G = W.relevant_document_ids) != null && G.length ? ($(), T("span", x$, V(W.relevant_document_ids.length) + " 份资料", 1)) : le("", !0),
                ($(!0), T(be, null, Te(W.tags || [], (P) => ($(), T("span", {
                  key: P,
                  class: "eval-dataset-tag"
                }, V(P), 1))), 128)),
                W.enabled === !1 ? ($(), T("span", S$, "已停用")) : le("", !0)
              ])
            ]),
            u("div", C$, [
              u("button", {
                class: "icon-button",
                type: "button",
                title: "编辑",
                disabled: s.value,
                onClick: (P) => x(W)
              }, [
                J(F(zc), { size: 15 })
              ], 8, $$),
              u("button", {
                class: "icon-button danger",
                type: "button",
                title: "删除",
                disabled: s.value,
                onClick: (P) => w(W)
              }, [
                J(F(en), { size: 15 })
              ], 8, N$)
            ])
          ], 2);
        }), 128))
      ])) : ($(), T("div", b$, "还没有人工题目，先保存一条真实问题。"))
    ]));
  }
}), M$ = { class: "eval-candidates" }, O$ = { class: "eval-candidates-heading" }, T$ = { key: 0 }, P$ = ["disabled"], D$ = {
  key: 0,
  class: "eval-candidates-error"
}, R$ = {
  key: 1,
  class: "eval-candidates-empty"
}, A$ = {
  key: 2,
  class: "eval-candidates-empty"
}, V$ = {
  key: 3,
  class: "eval-candidates-empty"
}, L$ = {
  key: 4,
  class: "eval-candidates-list"
}, z$ = { class: "eval-candidate-head" }, B$ = { class: "eval-candidate-source" }, F$ = { class: "eval-candidate-signals" }, U$ = { class: "eval-candidate-question" }, H$ = { class: "eval-candidate-meta" }, j$ = { class: "eval-candidate-editor" }, G$ = { class: "yv-field" }, Y$ = ["onUpdate:modelValue"], q$ = { class: "eval-candidate-fields" }, X$ = { class: "yv-field" }, K$ = ["onUpdate:modelValue"], W$ = { class: "yv-field" }, Z$ = ["onUpdate:modelValue"], J$ = { class: "yv-field" }, Q$ = ["onUpdate:modelValue"], eN = { class: "yv-field" }, tN = ["onUpdate:modelValue"], nN = { class: "eval-candidate-actions" }, oN = ["disabled", "onClick"], sN = ["disabled", "onClick"], iN = /* @__PURE__ */ Me({
  __name: "EvalCandidatePanel",
  props: {
    spaceId: {}
  },
  emits: ["accepted"],
  setup(e, { emit: t }) {
    const n = e, o = t, s = Q([]), i = Q(0), r = Q(!1), l = Q(!1), a = Q(""), c = Q(""), d = wn({}), f = ae(() => !!n.spaceId);
    function g(D) {
      return d[D.id] || (d[D.id] = {
        expectedAnswer: D.suggested_answer || "",
        documentIds: (D.relevant_document_ids || []).join(`
`),
        tags: (D.tags || []).join(", "),
        difficulty: "medium",
        note: ""
      });
    }
    function m(D) {
      return D.source === "feedback" ? "用户反馈" : "质量信号";
    }
    function E() {
      return n.spaceId ? (r.value = !0, c.value = "", YC(n.spaceId).then((D) => {
        s.value = D.items || [], i.value = D.pending_total || s.value.length;
        for (const y of s.value) g(y);
      }).catch((D) => {
        c.value = je(D);
      }).finally(() => {
        r.value = !1;
      })) : (s.value = [], i.value = 0, Promise.resolve());
    }
    async function C() {
      if (n.spaceId) {
        l.value = !0, c.value = "";
        try {
          const D = await qC(n.spaceId);
          s.value = D.items || [], i.value = s.value.length;
          for (const y of s.value) g(y);
        } catch (D) {
          c.value = je(D);
        } finally {
          l.value = !1;
        }
      }
    }
    async function x(D) {
      if (n.spaceId) {
        a.value = D.id, c.value = "";
        try {
          await KC(n.spaceId, D.id, g(D)), s.value = s.value.filter((y) => y.id !== D.id), i.value = Math.max(0, i.value - 1), o("accepted");
        } catch (y) {
          c.value = je(y);
        } finally {
          a.value = "";
        }
      }
    }
    async function O(D) {
      if (n.spaceId) {
        a.value = D.id, c.value = "";
        try {
          await WC(n.spaceId, D.id, d[D.id].note), s.value = s.value.filter((y) => y.id !== D.id), i.value = Math.max(0, i.value - 1);
        } catch (y) {
          c.value = je(y);
        } finally {
          a.value = "";
        }
      }
    }
    return Ne(() => n.spaceId, E, { immediate: !0 }), (D, y) => ($(), T("section", M$, [
      u("header", O$, [
        u("div", null, [
          y[1] || (y[1] = u("span", { class: "yv-kicker" }, "Quality loop", -1)),
          u("h2", null, [
            y[0] || (y[0] = he("失败样本 ")),
            f.value ? ($(), T("small", T$, V(i.value) + " 条待确认", 1)) : le("", !0)
          ]),
          y[2] || (y[2] = u("p", null, "把真实问答里的问题沉淀为人工题，确认后才会进入正式评测。", -1))
        ]),
        u("button", {
          class: "yv-button",
          type: "button",
          disabled: !f.value || l.value,
          onClick: C
        }, [
          J(F(Nt), {
            size: 14,
            class: ve({ "is-spinning": l.value })
          }, null, 8, ["class"]),
          he(V(l.value ? "扫描中" : "扫描新样本"), 1)
        ], 8, P$)
      ]),
      c.value ? ($(), T("p", D$, V(c.value), 1)) : le("", !0),
      f.value ? r.value && !s.value.length ? ($(), T("div", A$, "读取待确认样本…")) : s.value.length ? ($(), T("div", L$, [
        ($(!0), T(be, null, Te(s.value, (w) => ($(), T("article", {
          key: w.id,
          class: "eval-candidate-row"
        }, [
          u("div", z$, [
            u("div", null, [
              u("span", B$, V(m(w)), 1),
              u("small", null, "查询 " + V(w.source_query_id.slice(0, 8)), 1)
            ]),
            u("div", F$, [
              ($(!0), T(be, null, Te(w.signals, (z) => ($(), T("span", {
                key: z.code
              }, V(z.label), 1))), 128))
            ])
          ]),
          u("strong", U$, V(w.question), 1),
          u("div", H$, [
            u("span", null, "置信度 " + V(w.confidence.toFixed(2)), 1),
            u("span", null, V(w.grounded ? "已接地" : "未接地"), 1),
            u("span", null, V(w.useful ? "已解决" : "未解决"), 1)
          ]),
          u("div", j$, [
            u("label", G$, [
              y[3] || (y[3] = u("span", null, [
                he("标准答案 "),
                u("em", null, "建议答案可直接修改")
              ], -1)),
              Ce(u("textarea", {
                "onUpdate:modelValue": (z) => d[w.id].expectedAnswer = z,
                rows: "3"
              }, null, 8, Y$), [
                [Le, d[w.id].expectedAnswer]
              ])
            ]),
            u("div", q$, [
              u("label", X$, [
                y[4] || (y[4] = u("span", null, "关联资料 ID", -1)),
                Ce(u("input", {
                  "onUpdate:modelValue": (z) => d[w.id].documentIds = z,
                  placeholder: "每行一个 DocumentJob ID"
                }, null, 8, K$), [
                  [Le, d[w.id].documentIds]
                ])
              ]),
              u("label", W$, [
                y[5] || (y[5] = u("span", null, "标签", -1)),
                Ce(u("input", {
                  "onUpdate:modelValue": (z) => d[w.id].tags = z,
                  placeholder: "例如：反馈回流, 边界问题"
                }, null, 8, Z$), [
                  [Le, d[w.id].tags]
                ])
              ]),
              u("label", J$, [
                y[7] || (y[7] = u("span", null, "难度", -1)),
                Ce(u("select", {
                  "onUpdate:modelValue": (z) => d[w.id].difficulty = z
                }, y[6] || (y[6] = [
                  u("option", { value: "easy" }, "简单", -1),
                  u("option", { value: "medium" }, "中等", -1),
                  u("option", { value: "hard" }, "困难", -1)
                ]), 8, Q$), [
                  [Qt, d[w.id].difficulty]
                ])
              ])
            ]),
            u("label", eN, [
              y[8] || (y[8] = u("span", null, "复核备注", -1)),
              Ce(u("input", {
                "onUpdate:modelValue": (z) => d[w.id].note = z,
                placeholder: "可选：记录为什么收录或忽略"
              }, null, 8, tN), [
                [Le, d[w.id].note]
              ])
            ])
          ]),
          u("div", nN, [
            u("button", {
              class: "yv-button primary",
              type: "button",
              disabled: a.value === w.id,
              onClick: (z) => x(w)
            }, [
              J(F(ao), { size: 14 }),
              y[9] || (y[9] = he("收录为人工题"))
            ], 8, oN),
            u("button", {
              class: "yv-button",
              type: "button",
              disabled: a.value === w.id,
              onClick: (z) => O(w)
            }, [
              J(F(Kt), { size: 14 }),
              y[10] || (y[10] = he("忽略"))
            ], 8, sN)
          ])
        ]))), 128))
      ])) : ($(), T("div", V$, "暂无待确认样本。点击“扫描新样本”读取低置信度、未接地或负反馈查询。")) : ($(), T("div", R$, "先选择一个角色。"))
    ]));
  }
}), rN = { class: "yv-page evaluation-page" }, lN = { class: "evaluation-hero" }, aN = { class: "evaluation-control" }, uN = { class: "control-fields" }, cN = { class: "yv-field" }, dN = ["value"], fN = { class: "yv-field" }, pN = { class: "yv-field" }, hN = { class: "control-actions" }, vN = ["disabled"], gN = ["disabled"], mN = ["href"], yN = { class: "run-status" }, bN = {
  key: 0,
  class: "results-stage"
}, _N = { class: "metric-lead" }, wN = { class: "metric-groups" }, kN = {
  key: 0,
  class: "analysis-block"
}, EN = { class: "case-section" }, xN = { class: "case-index" }, SN = {
  key: 1,
  class: "evaluation-empty"
}, CN = /* @__PURE__ */ Me({
  __name: "App",
  setup(e) {
    const t = Q([]), n = Q(""), o = Q("fast"), s = Q("generated"), i = ae(() => t.value.find((S) => S.id === n.value)), r = Q({ state: "idle", progress: 0, total: 0 }), l = Q(null), a = Q(""), c = Q(""), d = Q(!1), f = Q(!1), g = Q(!1);
    let m = 0;
    const E = ae(() => ({ idle: "未运行", running: r.value.phase === "generating" ? "生成问题" : "评测中", done: "已完成", error: "失败" })[r.value.state] || r.value.state || "未运行"), C = ae(() => BC(Number(r.value.progress || 0), Number(r.value.total || 0))), x = ae(() => {
      var S;
      return ((S = l.value) == null ? void 0 : S.cases) || [];
    }), O = ae(() => g.value ? x.value : x.value.slice(0, 3)), D = ae(() => {
      var A;
      const S = ((A = l.value) == null ? void 0 : A.metrics) || {};
      return [
        { label: "Top 3 召回率", value: ys("recall_at_3_answerable", S.recall_at_3_answerable), tone: z("recall_at_3_answerable", S.recall_at_3_answerable) },
        { label: "回答接地率", value: ys("grounded_rate", S.grounded_rate), tone: z("grounded_rate", S.grounded_rate) },
        { label: "质量通过率", value: ys("accepted_rate", S.accepted_rate), tone: z("accepted_rate", S.accepted_rate) },
        { label: "P95 总延迟", value: S.p95_total_latency_ms == null ? "—" : `${Math.round(Number(S.p95_total_latency_ms))} ms`, tone: "" }
      ];
    }), y = [
      { title: "检索质量", keys: ["recall_at_3_answerable", "precision_at_3_answerable", "mrr_at_3_answerable", "hit_at_3_answerable", "cases_answerable", "mean_latency_ms", "p95_latency_ms"] },
      { title: "回答质量", keys: ["grounded_rate", "useful_rate", "accepted_rate", "answer_rate", "refusal_rate", "cases_checked", "mean_confidence", "scope_isolation_ok"] },
      { title: "行为与性能", keys: ["rewrite_rate", "correction_rate", "mean_rewrite_count", "mean_correction_count", "complex_rewrite_rate", "complex_correction_rate", "probe_refusal_rate", "cases_total", "cases_complex", "mean_total_latency_ms", "p95_total_latency_ms"] }
    ], w = { recall_at_3_answerable: "可答问题召回率 Recall@3", precision_at_3_answerable: "可答问题精确率 Precision@3", mrr_at_3_answerable: "可答问题 MRR@3", hit_at_3_answerable: "可答问题命中 Hit@3", cases_answerable: "可答用例数", mean_latency_ms: "平均检索延迟 (ms)", p95_latency_ms: "P95 检索延迟 (ms)", grounded_rate: "事实接地率", useful_rate: "问题解决率", accepted_rate: "质量通过率", answer_rate: "正常作答率", refusal_rate: "拒答率", cases_checked: "生成已检用例", mean_confidence: "平均置信度", scope_isolation_ok: "跨角色隔离校验", rewrite_rate: "查询改写触发率", correction_rate: "生成纠错触发率", mean_rewrite_count: "平均改写次数", mean_correction_count: "平均纠错次数", complex_rewrite_rate: "复杂题改写率", complex_correction_rate: "复杂题纠错率", probe_refusal_rate: "无关问题拒答率", cases_total: "用例总数", cases_complex: "复杂题数", mean_total_latency_ms: "平均整链路延迟 (ms)", p95_total_latency_ms: "P95 整链路延迟 (ms)" };
    function z(S, A) {
      if (S === "scope_isolation_ok") return A ? "good" : "bad";
      const M = Number(A);
      return !["recall_at_3_answerable", "precision_at_3_answerable", "mrr_at_3_answerable", "hit_at_3_answerable", "grounded_rate", "useful_rate", "accepted_rate", "answer_rate", "mean_confidence"].includes(S) || !Number.isFinite(M) ? "" : M >= 0.8 ? "good" : M <= 0.2 ? "bad" : "";
    }
    function U() {
      return r.value.phase === "generating" ? r.value.status_text || "正在从角色资料生成问题" : r.value.total > 0 ? [`已完成 ${r.value.progress}/${r.value.total} 条`, r.value.current_question_text, r.value.current_step].filter(Boolean).join(" · ") : c.value || "等待开始";
    }
    async function W() {
      try {
        t.value = await De("/api/personas"), !n.value && t.value.length && (n.value = t.value[0].id);
      } catch (S) {
        c.value = je(S);
      }
    }
    async function G() {
      l.value = await De("/api/eval/results");
    }
    function P() {
      m += 1, d.value = !1;
    }
    async function L() {
      const S = ++m;
      d.value = !0;
      for (let A = 0; A < 1200 && S === m; A += 1) {
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
    async function q() {
      if (!n.value) {
        c.value = "请先选择评测角色";
        return;
      }
      c.value = "", l.value = null, a.value = "", g.value = !1;
      try {
        await De("/api/eval/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(FC({ personaId: n.value, tier: o.value, datasetMode: s.value })) }), await L();
      } catch (S) {
        c.value = je(S), d.value = !1;
      }
    }
    async function H() {
      f.value = !0;
      try {
        const S = await De("/api/eval/analyze", { method: "POST" });
        a.value = S.analysis || "分析结果为空";
      } catch (S) {
        c.value = je(S);
      } finally {
        f.value = !1;
      }
    }
    async function K() {
      await W();
      try {
        r.value = await De("/api/eval/status"), r.value.state === "running" ? L() : r.value.state === "done" && await G();
      } catch {
      }
    }
    return rt(() => {
      const S = document.querySelector("#evaluation-app-root");
      S == null || S.addEventListener("yumeno:evaluation-show", K), S == null || S.addEventListener("yumeno:evaluation-hide", P), K();
    }), sn(P), (S, A) => {
      var M, R;
      return $(), T("main", rN, [
        u("header", lN, [
          A[4] || (A[4] = u("div", null, [
            u("span", { class: "yv-kicker" }, "Retrieval quality lab"),
            u("h1", null, "RAG 评测"),
            u("p", null, "用可复现指标检查召回、回答接地与整链路延迟。")
          ], -1)),
          u("span", {
            class: ve(["yv-status", r.value.state === "done" ? "ok" : r.value.state === "error" ? "error" : d.value ? "warn" : ""])
          }, V(E.value), 3)
        ]),
        u("section", aN, [
          u("div", uN, [
            u("label", cN, [
              A[6] || (A[6] = u("span", null, "评测角色", -1)),
              Ce(u("select", {
                "onUpdate:modelValue": A[0] || (A[0] = (j) => n.value = j)
              }, [
                A[5] || (A[5] = u("option", { value: "" }, "请选择角色", -1)),
                ($(!0), T(be, null, Te(t.value, (j) => ($(), T("option", {
                  key: j.id,
                  value: j.id
                }, V(j.name), 9, dN))), 128))
              ], 512), [
                [Qt, n.value]
              ])
            ]),
            u("label", fN, [
              A[8] || (A[8] = u("span", null, "问题规模", -1)),
              Ce(u("select", {
                "onUpdate:modelValue": A[1] || (A[1] = (j) => o.value = j)
              }, A[7] || (A[7] = [
                u("option", { value: "fast" }, "轻量 · 5 个问题", -1),
                u("option", { value: "standard" }, "标准 · 10 个问题", -1),
                u("option", { value: "thorough" }, "全面 · 15 个问题", -1)
              ]), 512), [
                [Qt, o.value]
              ])
            ]),
            u("label", pN, [
              A[10] || (A[10] = u("span", null, "题目来源", -1)),
              Ce(u("select", {
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
          u("div", hN, [
            u("button", {
              class: "yv-button primary",
              disabled: d.value,
              onClick: q
            }, [
              J(F(Bc)),
              he(V(d.value ? "评测进行中" : "生成并评测"), 1)
            ], 8, vN),
            u("button", {
              class: "yv-button",
              disabled: !l.value || f.value,
              onClick: H
            }, [
              J(F(cv)),
              he(V(f.value ? "分析中" : "AI 分析"), 1)
            ], 8, gN),
            u("a", {
              class: ve(["yv-button", { disabled: !l.value }]),
              href: l.value ? "/api/eval/export" : void 0
            }, [
              J(F(Kn)),
              A[11] || (A[11] = he("导出 JSON"))
            ], 10, mN)
          ])
        ]),
        J(iN, {
          "space-id": (M = i.value) == null ? void 0 : M.knowledge_space_id
        }, null, 8, ["space-id"]),
        J(I$, {
          "space-id": (R = i.value) == null ? void 0 : R.knowledge_space_id
        }, null, 8, ["space-id"]),
        u("section", yN, [
          u("div", null, [
            u("strong", null, V(E.value), 1),
            u("p", {
              class: ve({ error: c.value })
            }, V(c.value || U()), 3)
          ]),
          u("div", {
            class: ve(["progress-track", { indeterminate: d.value && r.value.phase === "generating" }])
          }, [
            u("span", {
              style: it({ width: `${C.value}%` })
            }, null, 4)
          ], 2)
        ]),
        l.value ? ($(), T("section", bN, [
          u("div", _N, [
            ($(!0), T(be, null, Te(D.value, (j) => ($(), T("article", {
              key: j.label,
              class: ve(j.tone)
            }, [
              u("span", null, V(j.label), 1),
              u("strong", null, V(j.value), 1)
            ], 2))), 128))
          ]),
          u("div", wN, [
            ($(), T(be, null, Te(y, (j) => u("section", {
              key: j.title
            }, [
              u("h2", null, V(j.title), 1),
              u("div", null, [
                ($(!0), T(be, null, Te(j.keys.filter((ne) => {
                  var re, ue;
                  return ((re = l.value.metrics) == null ? void 0 : re[ne]) !== void 0 && ((ue = l.value.metrics) == null ? void 0 : ue[ne]) !== null;
                }), (ne) => ($(), T("article", { key: ne }, [
                  u("span", null, V(w[ne] || ne), 1),
                  u("strong", {
                    class: ve(z(ne, l.value.metrics[ne]))
                  }, V(F(ys)(ne, l.value.metrics[ne])), 3)
                ]))), 128))
              ])
            ])), 64))
          ]),
          a.value ? ($(), T("section", kN, [
            A[12] || (A[12] = u("span", { class: "yv-kicker" }, "AI review", -1)),
            A[13] || (A[13] = u("h2", null, "结果解读", -1)),
            u("p", null, V(a.value), 1)
          ])) : le("", !0),
          u("section", EN, [
            u("header", null, [
              A[14] || (A[14] = u("div", null, [
                u("span", { class: "yv-kicker" }, "Case evidence"),
                u("h2", null, "逐条详情")
              ], -1)),
              x.value.length > 3 ? ($(), T("button", {
                key: 0,
                class: "yv-button",
                onClick: A[3] || (A[3] = (j) => g.value = !g.value)
              }, V(g.value ? "收起" : `展开全部 ${x.value.length} 条`), 1)) : le("", !0)
            ]),
            ($(!0), T(be, null, Te(O.value, (j, ne) => ($(), T("article", {
              key: ne,
              class: "case-row"
            }, [
              u("div", xN, V(String(ne + 1).padStart(2, "0")), 1),
              u("div", null, [
                u("strong", null, V(j.question), 1),
                u("p", null, V((j.answer || "").slice(0, 240)), 1),
                u("small", null, V([j.grounded == null ? "grounded=—" : `grounded=${j.grounded}`, j.useful == null ? "useful=—" : `useful=${j.useful}`, `confidence=${j.confidence ?? "—"}`, j.rewrite_used ? "查询改写" : "", j.corrected ? "生成纠错" : "", j.is_probe ? "无关探针" : ""].filter(Boolean).join(" · ")), 1)
              ]),
              u("span", {
                class: ve(["yv-status", j.accepted || j.is_probe && j.refused ? "ok" : "error"])
              }, V(j.accepted || j.is_probe && j.refused ? "符合预期" : "未通过"), 3)
            ]))), 128))
          ])
        ])) : ($(), T("section", SN, [
          J(F(Qh)),
          A[15] || (A[15] = u("h2", null, "等待一轮可比较的结果", -1)),
          A[16] || (A[16] = u("p", null, "选择角色和问题规模后开始。评测会覆盖知识召回、复杂问题与无关问题拒答。", -1))
        ]))
      ]);
    };
  }
});
let gn = null;
const Sf = () => document.querySelector("#evaluation-app-root");
function uM(e = "#evaluation-app-root") {
  if (gn) return gn;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("RAG 评测挂载点不存在");
  return gn = es(CN), gn.mount(t), gn;
}
function cM() {
  var e;
  (e = Sf()) == null || e.dispatchEvent(new CustomEvent("yumeno:evaluation-show"));
}
function dM() {
  var e;
  (e = Sf()) == null || e.dispatchEvent(new CustomEvent("yumeno:evaluation-hide"));
}
function fM() {
  gn && (gn.unmount(), gn = null);
}
async function ss(e, t) {
  const n = await fetch(e, t), o = await n.json().catch(() => null);
  if (!n.ok) throw new Error((o == null ? void 0 : o.detail) || `请求失败 (${n.status})`);
  return o;
}
function $N() {
  return ss("/api/reranker/status", { cache: "no-store" });
}
function NN(e) {
  return ss("/api/reranker/install", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
    body: JSON.stringify({ model_id: "Qwen/Qwen3-Reranker-0.6B", source: "modelscope", device: e })
  });
}
function IN() {
  return ss("/api/reranker/install/cancel", { method: "DELETE", headers: { "X-YUMENO-Request": "web" } });
}
function MN() {
  return ss("/api/reranker/model", { method: "DELETE", headers: { "X-YUMENO-Request": "web" } });
}
function ON() {
  return ss("/api/reranker/model-directory", { method: "POST", headers: { "X-YUMENO-Request": "web" } });
}
const TN = { class: "settings-summary" }, PN = { class: "section-toggle-label" }, DN = { class: "asr-resource-bar" }, RN = {
  key: 0,
  max: "100"
}, AN = {
  key: 1,
  class: "inline-status"
}, VN = { class: "asr-actions" }, LN = ["disabled"], zN = ["disabled"], BN = ["disabled"], FN = ["disabled"], UN = { class: "settings-grid one-column reranker-settings-grid" }, HN = { class: "field provider-field" }, jN = ["disabled"], GN = /* @__PURE__ */ Me({
  __name: "RerankerSettingsApp",
  setup(e) {
    const t = Q(null), n = Q("auto"), o = Q(!1), s = Q(""), i = Q(!1);
    let r;
    const l = ae(() => s.value ? "检查失败" : t.value ? t.value.installing ? "安装中" : t.value.ready ? "已就绪" : t.value.installed ? "已安装，等待加载" : "未安装" : "检查中"), a = ae(() => s.value ? s.value : t.value ? t.value.ready ? "本地精排可用；检索候选将经过语义重排序。" : t.value.installed ? "模型文件完整，将在首次检索时加载。" : "未安装时系统自动使用 RRF 融合结果，不会阻断知识检索。" : "正在读取本地模型状态"), c = ae(() => {
      var C;
      if (!((C = t.value) != null && C.installing)) return "";
      const m = t.value.phase || "准备资源";
      return `${t.value.current_file || m} · ${Math.round(t.value.elapsed_seconds || 0)} 秒`;
    });
    async function d() {
      try {
        t.value = await $N(), n.value = t.value.device || n.value, s.value = t.value.error || "";
      } catch (m) {
        s.value = m instanceof Error ? m.message : "无法读取 Reranker 状态";
      }
    }
    async function f(m) {
      if (!o.value) {
        o.value = !0, s.value = "";
        try {
          t.value = await m();
        } catch (E) {
          s.value = E instanceof Error ? E.message : "操作失败";
        } finally {
          o.value = !1;
        }
      }
    }
    async function g() {
      if (!o.value) {
        o.value = !0, s.value = "";
        try {
          await ON();
        } catch (m) {
          s.value = m instanceof Error ? m.message : "无法打开模型目录";
        } finally {
          o.value = !1;
        }
      }
    }
    return rt(() => {
      d(), r = window.setInterval(() => {
        var m;
        (m = t.value) != null && m.installing && d();
      }, 1500);
    }), sn(() => {
      r && window.clearInterval(r);
    }), (m, E) => {
      var C, x, O, D, y, w, z;
      return $(), T("details", {
        class: "panel settings-section",
        "data-collapsible": "",
        onToggle: E[4] || (E[4] = (U) => i.value = U.currentTarget.open)
      }, [
        u("summary", TN, [
          E[5] || (E[5] = u("span", { class: "settings-summary-title" }, [
            u("strong", null, "Reranker 精排"),
            u("span", { class: "settings-summary-meta" }, "候选重排序 · 本地模型 · RRF 自动降级")
          ], -1)),
          u("span", PN, V(i.value ? "收起" : "展开"), 1)
        ]),
        E[9] || (E[9] = u("p", { class: "settings-help" }, [
          he("使用本地模型 "),
          u("code", null, "Qwen3-Reranker-0.6B"),
          he(" 对召回候选精排；模型未安装或暂不可用时，系统自动保留 RRF 融合结果。")
        ], -1)),
        u("div", DN, [
          u("div", null, [
            u("strong", null, V(l.value), 1),
            u("p", {
              class: ve(["inline-status", { "is-error": !!s.value }]),
              role: "status",
              "aria-live": "polite"
            }, V(a.value), 3),
            (C = t.value) != null && C.installing ? ($(), T("progress", RN)) : le("", !0),
            c.value ? ($(), T("p", AN, V(c.value), 1)) : le("", !0)
          ]),
          u("div", VN, [
            u("button", {
              class: "button button-secondary",
              type: "button",
              disabled: o.value,
              onClick: g
            }, [
              J(F(Do), { size: 16 }),
              E[6] || (E[6] = he("打开目录"))
            ], 8, LN),
            u("button", {
              class: "button button-danger",
              type: "button",
              disabled: o.value || !((x = t.value) != null && x.installed) || ((O = t.value) == null ? void 0 : O.installing),
              onClick: E[0] || (E[0] = (U) => f(F(MN)))
            }, "删除", 8, zN),
            (D = t.value) != null && D.installing ? ($(), T("button", {
              key: 0,
              class: "button button-secondary",
              type: "button",
              disabled: o.value || t.value.cancelling,
              onClick: E[1] || (E[1] = (U) => f(F(IN)))
            }, "取消下载", 8, BN)) : ($(), T("button", {
              key: 1,
              class: "button button-primary",
              type: "button",
              disabled: o.value || ((y = t.value) == null ? void 0 : y.installed),
              onClick: E[2] || (E[2] = (U) => f(() => F(NN)(n.value)))
            }, "安装", 8, FN))
          ])
        ]),
        u("div", UN, [
          u("label", HN, [
            E[8] || (E[8] = u("span", null, "运行设备", -1)),
            Ce(u("select", {
              "onUpdate:modelValue": E[3] || (E[3] = (U) => n.value = U),
              disabled: o.value || ((w = t.value) == null ? void 0 : w.installing) || ((z = t.value) == null ? void 0 : z.installed)
            }, E[7] || (E[7] = [
              u("option", { value: "auto" }, "自动（GPU 优先）", -1),
              u("option", { value: "cuda" }, "仅 GPU", -1),
              u("option", { value: "cpu" }, "仅 CPU", -1)
            ]), 8, jN), [
              [Qt, n.value]
            ])
          ])
        ]),
        E[10] || (E[10] = u("details", { class: "settings-help" }, [
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
}), YN = /* @__PURE__ */ fl(GN, [["__scopeId", "data-v-bf7b6366"]]), qN = { class: "providers-settings" }, XN = { class: "settings-header" }, KN = ["disabled"], WN = {
  class: "provider-tabs",
  role: "tablist",
  "aria-label": "供应商类型"
}, ZN = ["aria-selected", "onClick"], JN = {
  key: 0,
  class: "download-center",
  "aria-label": "资源下载中心"
}, QN = ["aria-expanded"], eI = { class: "download-summary-icon" }, tI = { class: "download-summary-copy" }, nI = {
  key: 0,
  class: "download-summary-progress"
}, oI = {
  class: "config-drawer download-drawer",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "资源下载任务"
}, sI = { class: "drawer-header" }, iI = { class: "drawer-header-actions" }, rI = { class: "drawer-body download-list" }, lI = {
  key: 0,
  class: "empty-state"
}, aI = {
  key: 1,
  class: "empty-state"
}, uI = { class: "download-task-head" }, cI = { class: "task-progress" }, dI = { class: "download-task-meta" }, fI = { key: 0 }, pI = { key: 1 }, hI = { key: 2 }, vI = {
  key: 3,
  class: "task-error"
}, gI = {
  key: 0,
  class: "download-task-actions"
}, mI = ["onClick"], yI = {
  key: 1,
  class: "download-task-actions"
}, bI = ["onClick"], _I = {
  key: 2,
  class: "local-production-zone",
  "aria-labelledby": "local-production-title"
}, wI = { class: "production-grid" }, kI = {
  key: 0,
  class: "production-card production-card-rvc"
}, EI = { class: "production-card-head" }, xI = { class: "production-facts" }, SI = { class: "production-actions" }, CI = {
  key: 1,
  class: "production-card"
}, $I = { class: "production-card-head" }, NI = { class: "production-actions" }, II = { class: "production-card production-card-ffmpeg" }, MI = { class: "production-card-head" }, OI = { class: "production-facts" }, TI = { class: "production-actions" }, PI = ["disabled"], DI = ["disabled"], RI = ["disabled"], AI = {
  key: 3,
  class: "providers-main"
}, VI = { class: "section-heading" }, LI = { class: "section-label" }, zI = {
  key: 0,
  class: "loading-state"
}, BI = {
  key: 1,
  class: "error-state"
}, FI = {
  key: 2,
  class: "empty-state"
}, UI = ["onClick", "onKeydown"], HI = { class: "provider-header" }, jI = { class: "provider-title" }, GI = {
  key: 0,
  class: "mode-badge"
}, YI = {
  key: 1,
  class: "mode-badge api"
}, qI = { class: "provider-description" }, XI = ["title"], KI = {
  key: 0,
  class: "provider-meta resource-meta"
}, WI = {
  key: 1,
  class: "provider-meta"
}, ZI = {
  key: 0,
  class: "meta-url"
}, JI = { class: "provider-actions" }, QI = ["onClick"], e3 = ["onClick", "disabled"], t3 = ["onClick", "disabled"], n3 = {
  class: "config-drawer rvc-workspace-drawer",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "RVC 音频生产资源管理"
}, o3 = { class: "drawer-header" }, s3 = { class: "drawer-body rvc-workspace-body" }, i3 = { class: "rvc-workspace-summary" }, r3 = {
  class: "rvc-component-list",
  "aria-label": "RVC 资源状态"
}, l3 = { class: "rvc-component-icon" }, a3 = { key: 1 }, u3 = { class: "rvc-component-copy" }, c3 = { class: "rvc-install-block" }, d3 = {
  key: 0,
  class: "rvc-progress"
}, f3 = { class: "production-actions" }, p3 = ["disabled"], h3 = ["disabled"], v3 = ["disabled"], g3 = ["disabled"], m3 = {
  key: 0,
  class: "config-error"
}, y3 = {
  key: 1,
  class: "config-error"
}, b3 = ["aria-label"], _3 = { class: "drawer-header" }, w3 = { class: "drawer-body" }, k3 = { class: "drawer-status" }, E3 = {
  key: 0,
  class: "field"
}, x3 = { class: "field" }, S3 = ["placeholder"], C3 = { class: "field" }, $3 = ["placeholder"], N3 = {
  key: 0,
  class: "field"
}, I3 = ["placeholder"], M3 = {
  key: 1,
  class: "form-row"
}, O3 = { class: "field" }, T3 = { class: "field" }, P3 = {
  key: 2,
  class: "resource-install-form"
}, D3 = { class: "field" }, R3 = { class: "resource-controls" }, A3 = { class: "resource-control-actions" }, V3 = ["disabled"], L3 = ["disabled"], z3 = ["disabled"], B3 = ["disabled"], F3 = ["disabled"], U3 = ["disabled"], H3 = { class: "field checkbox-field" }, j3 = ["disabled"], G3 = {
  key: 2,
  class: "config-hint"
}, Y3 = { class: "modal-actions" }, q3 = ["disabled"], X3 = {
  key: 3,
  class: "config-success"
}, K3 = {
  key: 5,
  class: "config-error"
}, W3 = /* @__PURE__ */ Me({
  __name: "ProvidersApp",
  setup(e) {
    const t = Q([]), n = Q("llm"), o = Q(!1), s = Q(""), i = Q(null), r = Q(null), l = Q(null), a = Q(""), c = Q(""), d = Q(""), f = Q([]), g = Q(!1), m = Q(!1), E = Q(!1);
    let C;
    const x = Q({
      provider_type: "",
      provider_id: "",
      api_key: "",
      base_url: "",
      model: "",
      source: "modelscope",
      device: "auto",
      enabled: !1
    }), O = [
      { id: "llm", label: "大语言模型(LLM)", count: 0 },
      { id: "embedding", label: "向量模型(Embedding)", count: 0 },
      { id: "reranker", label: "重排序(Rerankr)", count: 0 },
      { id: "stt", label: "语音转文字(STT)", count: 0 },
      { id: "tts", label: "文字转语音(TTS)", count: 0 },
      { id: "web_search", label: "联网搜索", count: 0 },
      { id: "audio", label: "音频", count: 0 }
    ], D = ae(() => t.value.filter((v) => v.type === n.value)), y = ae(() => t.value.find((v) => v.id === "rvc")), w = ae(() => t.value.find((v) => v.id === "separator")), z = Q({}), U = ae(() => t.value.find((v) => v.id === i.value)), W = {
      local_embedding: { status: "/api/embedding/status", install: "/api/embedding/install", cancel: "/api/embedding/install/cancel", remove: "/api/embedding/model", directory: "/api/embedding/model-directory" },
      local_rerank: { status: "/api/reranker/status", install: "/api/reranker/install", cancel: "/api/reranker/install/cancel", remove: "/api/reranker/model", directory: "/api/reranker/model-directory" },
      local_stt: { status: "/api/stt/status", install: "/api/stt/install", cancel: "/api/stt/install/cancel", remove: "/api/stt/install", directory: "/api/stt/model-directory" },
      gsv_tts_local: { status: "/api/gpt-sovits/status", install: "/api/gpt-sovits/install", cancel: "/api/gpt-sovits/install/cancel", remove: "/api/gpt-sovits/install", directory: "/api/gpt-sovits/model-directory", start: "/api/gpt-sovits/service/start", stop: "/api/gpt-sovits/service/stop" },
      // RVC 是音色转换资源，不计入 TTS 供应商数量；后端未实现时由抽屉显示可读错误。
      rvc: { status: "/api/providers/rvc/status", install: "/api/providers/rvc/install", cancel: "/api/providers/rvc/install/cancel", remove: "/api/providers/rvc/install", directory: "/api/providers/rvc/directory" },
      separator: { status: "/api/providers/resources/separator", install: "/api/providers/resources/separator/install", cancel: "/api/providers/resources/tasks", remove: "/api/providers/resources/separator", directory: "/api/providers/resources/separator" }
    };
    function G(v) {
      return ["queued", "preparing", "downloading", "verifying", "installing"].includes(v.status);
    }
    const P = ae(() => f.value.filter(G)), L = ae(() => f.value.filter((v) => !G(v)).length);
    function q(v) {
      if (!v || v < 1024) return `${v || 0} B`;
      const h = ["KB", "MB", "GB", "TB"];
      let B = v, Y = -1;
      do
        B /= 1024, Y++;
      while (B >= 1024 && Y < h.length - 1);
      return `${B.toFixed(B >= 100 ? 0 : B >= 10 ? 1 : 2)} ${h[Y]}`;
    }
    function H(v) {
      return v == null || v < 0 ? "—" : v < 60 ? `${Math.round(v)} 秒` : `${Math.floor(v / 60)} 分 ${Math.round(v % 60)} 秒`;
    }
    function K(v) {
      return { queued: "排队中", preparing: "准备中", downloading: "下载中", verifying: "校验中", installing: "安装中", ready: "已完成", failed: "失败", cancelled: "已取消", interrupted: "已中断" }[v.status] || v.status;
    }
    async function S() {
      E.value = !0;
      try {
        const v = await fetch("/api/resources/tasks?limit=30", { headers: { "X-YUMENO-Request": "web" }, cache: "no-store" });
        if (!v.ok) return;
        const h = await v.json(), B = Array.isArray(h) ? h : h.tasks || h.items || [];
        f.value = B.map((Y) => ({
          ...Y,
          progress_percent: Y.progress_percent ?? (typeof Y.progress == "number" ? Y.progress : 0),
          error_message: Y.error_message ?? Y.error,
          current_file: Y.current_file ?? Y.detail
        }));
      } catch {
      } finally {
        E.value = !1;
      }
    }
    async function A(v) {
      try {
        await fetch(`/api/resources/tasks/${encodeURIComponent(v.task_id)}`, { method: "DELETE", headers: { "X-YUMENO-Request": "web" } }), await S();
      } catch (h) {
        s.value = h instanceof Error ? h.message : "取消下载失败";
      }
    }
    async function M() {
      try {
        const v = await fetch("/api/resources/tasks?finished=true", { method: "DELETE", headers: { "X-YUMENO-Request": "web" } });
        if (!v.ok) {
          const h = await v.json().catch(() => ({}));
          throw new Error(h.detail || `HTTP ${v.status}`);
        }
        await S();
      } catch (v) {
        s.value = v instanceof Error ? v.message : "清理下载记录失败";
      }
    }
    async function R(v) {
      try {
        const h = await fetch(`/api/resources/tasks/${encodeURIComponent(v.task_id)}/retry`, { method: "POST", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" } });
        if (!h.ok) {
          const B = await h.json().catch(() => ({}));
          throw new Error(B.detail || `HTTP ${h.status}`);
        }
        await S();
      } catch (h) {
        s.value = h instanceof Error ? h.message : "重试下载失败";
      }
    }
    async function j() {
      try {
        const v = await fetch("/api/providers/resources/ffmpeg/status", { headers: { "X-YUMENO-Request": "web" }, cache: "no-store" });
        v.ok && (z.value = await v.json());
      } catch {
      }
    }
    async function ne(v) {
      const h = { install: "/api/providers/resources/ffmpeg/install", remove: "/api/providers/resources/ffmpeg", directory: "/api/providers/resources/ffmpeg/directory" };
      l.value = `ffmpeg:${v}`, s.value = "";
      try {
        const B = await fetch(h[v], { method: v === "remove" ? "DELETE" : v === "directory" ? "GET" : "POST", headers: { "X-YUMENO-Request": "web" } });
        if (!B.ok) {
          const Y = await B.json().catch(() => ({}));
          throw new Error(Y.detail || `HTTP ${B.status}`);
        }
        z.value = await B.json();
      } catch (B) {
        s.value = B instanceof Error ? B.message : "FFmpeg 操作失败";
      } finally {
        l.value = null;
      }
    }
    async function re() {
      o.value = !0, s.value = "";
      try {
        const v = await fetch("/api/providers/list", { cache: "no-store" });
        if (!v.ok) throw new Error(`HTTP ${v.status}`);
        const h = await v.json();
        t.value = h.providers || [], await j(), O.forEach((B) => {
          B.count = t.value.filter((Y) => Y.type === B.id).length;
        });
      } catch (v) {
        s.value = v instanceof Error ? v.message : "加载失败";
      } finally {
        o.value = !1;
      }
    }
    function ue(v) {
      if (v.id === "rvc") {
        m.value = !0, re();
        return;
      }
      i.value = v.id, a.value = "", c.value = "", s.value = "";
      const h = v.resource_status || {};
      x.value = {
        provider_type: v.type,
        provider_id: v.id,
        api_key: v.current_api_key || "",
        base_url: v.current_base_url || v.default_base_url,
        model: v.current_model || String(h.model_id || v.default_model || ""),
        source: String(h.source || "modelscope"),
        device: String(h.device || "auto"),
        enabled: v.is_active
      }, d.value = "";
    }
    function se() {
      m.value = !1, s.value = "";
    }
    function fe(v) {
      var B, Y;
      const h = (Y = (B = y.value) == null ? void 0 : B.resource_status) == null ? void 0 : Y.components;
      return (h == null ? void 0 : h[v]) || {};
    }
    function ce(v) {
      return !!fe(v).ready;
    }
    function ge(v) {
      return ce(v) ? "已就绪" : v === "indices" ? "可选" : "待准备";
    }
    function ee() {
      var h, B;
      const v = (B = (h = y.value) == null ? void 0 : h.resource_status) == null ? void 0 : B.progress_percent;
      return typeof v == "number" ? Math.min(100, Math.max(0, v)) : 0;
    }
    function _e() {
      i.value = null, a.value = "", c.value = "", d.value = "", x.value = { provider_type: "", provider_id: "", api_key: "", base_url: "", model: "", source: "modelscope", device: "auto", enabled: !1 };
    }
    async function xe() {
      if (x.value.provider_id) {
        o.value = !0, s.value = "", a.value = "";
        try {
          const v = await fetch("/api/providers/configure", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
            body: JSON.stringify(x.value)
          });
          if (!v.ok) {
            const B = await v.json().catch(() => ({}));
            throw new Error(B.detail || `HTTP ${v.status}`);
          }
          const h = await v.json();
          a.value = h.message || "配置已保存", await re();
        } catch (v) {
          s.value = v instanceof Error ? v.message : "配置失败";
        } finally {
          o.value = !1;
        }
      }
    }
    function we() {
      return { model_id: x.value.model, source: x.value.source || "modelscope", device: x.value.device || "auto" };
    }
    async function me(v, h) {
      const B = W[v.id], Y = B == null ? void 0 : B[h];
      if (Y) {
        l.value = `${v.id}:${h}`, s.value = "";
        try {
          const N = h === "remove" || h === "cancel" ? "DELETE" : h === "directory" && v.id === "rvc" ? "GET" : h === "install" || h === "directory" || h === "start" || h === "stop" ? "POST" : "GET";
          let te;
          h === "install" && (te = v.id === "gsv_tts_local" ? JSON.stringify({ url: d.value }) : v.id === "local_stt" ? void 0 : JSON.stringify(we()));
          let Z;
          if (h === "install" && v.mode === "local") {
            const ie = `/api/resources/${encodeURIComponent(v.id)}/install`;
            Z = await fetch(ie, { method: "POST", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" }, body: JSON.stringify({ parameters: v.id === "gsv_tts_local" ? { url: d.value } : we() }) }), (Z.status === 404 || Z.status === 405) && (Z = await fetch(Y, { method: N, headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" }, body: te }));
          } else
            Z = await fetch(Y, { method: N, headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" }, body: te });
          if (!Z.ok) {
            const ie = await Z.json().catch(() => ({}));
            throw new Error(ie.detail || `HTTP ${Z.status}`);
          }
          await re(), await S();
        } catch (N) {
          s.value = N instanceof Error ? N.message : "资源操作失败";
        } finally {
          l.value = null;
        }
      }
    }
    async function X(v) {
      var h, B;
      o.value = !0, s.value = "";
      try {
        const Y = await fetch("/api/providers/configure", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
          body: JSON.stringify({ provider_type: v.type, provider_id: v.id, api_key: v.current_api_key, base_url: v.current_base_url || v.default_base_url, model: v.current_model || v.default_model, source: (h = v.resource_status) == null ? void 0 : h.source, device: (B = v.resource_status) == null ? void 0 : B.device, enabled: !v.is_active })
        });
        if (!Y.ok) {
          const N = await Y.json().catch(() => ({}));
          throw new Error(N.detail || `HTTP ${Y.status}`);
        }
        await re();
      } catch (Y) {
        s.value = Y instanceof Error ? Y.message : "切换失败";
      } finally {
        o.value = !1;
      }
    }
    async function p(v) {
      r.value = v.id, s.value = "", c.value = "";
      try {
        const h = await fetch("/api/providers/test", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
          body: JSON.stringify({ provider_type: v.type, provider_id: v.id, api_key: v.current_api_key, base_url: v.current_base_url, model: v.current_model })
        });
        if (!h.ok) throw new Error(`HTTP ${h.status}`);
        const B = await h.json();
        c.value = B.ok ? `连接成功 · ${B.latency_ms}ms` : `连接失败 · ${B.message || "未知错误"}`;
      } catch (h) {
        c.value = `连接失败 · ${h instanceof Error ? h.message : "网络错误"}`;
      } finally {
        r.value = null;
      }
    }
    function I(v) {
      var B;
      const h = v.resource_status || {};
      return !!(h.ready || h.service_running || h.installed || (B = h.install) != null && B.installed);
    }
    function b(v) {
      var B;
      const h = v.resource_status || {};
      return !!(h.installing || (B = h.install) != null && B.installing);
    }
    function _(v) {
      var h, B;
      return b(v) ? `安装中${(h = v.resource_status) != null && h.phase ? ` · ${v.resource_status.phase}` : ""}` : v.id === "gsv_tts_local" && ((B = v.resource_status) != null && B.service_running) ? "服务运行中" : I(v) ? "资源就绪" : "未安装";
    }
    function k(v) {
      v.key === "Escape" && i.value && _e();
    }
    return rt(() => {
      re(), S(), C = window.setInterval(() => {
        S(), re(), j();
      }, 2500), window.addEventListener("keydown", k);
    }), sn(() => {
      C && window.clearInterval(C), window.removeEventListener("keydown", k);
    }), (v, h) => {
      var B, Y, N, te, Z, ie, de, ke, $e, Oe, et, ot, yt, bt, rn, vo, lt, _t, go, pl, hl, vl, gl, ml, yl, bl, _l, wl, kl, El, xl, Sl, Cl, $l, Nl, Il, Ml, Ol;
      return $(), T("div", qN, [
        u("header", XN, [
          h[27] || (h[27] = u("div", null, [
            u("p", { class: "eyebrow" }, "RUNTIME / PROVIDERS"),
            u("h2", null, "供应商配置"),
            u("p", { class: "settings-help" }, "管理真正会被系统调用的 API 与本地资源。")
          ], -1)),
          u("button", {
            class: "refresh-button",
            type: "button",
            onClick: re,
            disabled: o.value,
            "aria-label": "刷新供应商列表"
          }, [
            J(F(Nt), {
              size: 16,
              class: ve({ spin: o.value })
            }, null, 8, ["class"]),
            h[26] || (h[26] = he("刷新"))
          ], 8, KN)
        ]),
        u("nav", WN, [
          ($(), T(be, null, Te(O, (oe) => u("button", {
            key: oe.id,
            class: ve(["tab-button", { active: n.value === oe.id }]),
            role: "tab",
            "aria-selected": n.value === oe.id,
            onClick: (mo) => n.value = oe.id
          }, [
            u("span", null, V(oe.label), 1)
          ], 10, ZN)), 64))
        ]),
        P.value.length ? ($(), T("section", JN, [
          u("button", {
            class: "download-summary",
            type: "button",
            onClick: h[0] || (h[0] = (oe) => g.value = !0),
            "aria-expanded": g.value
          }, [
            u("span", eI, [
              J(F(Kn), {
                size: 16,
                class: ve({ spin: P.value.length > 0 })
              }, null, 8, ["class"])
            ]),
            u("span", tI, [
              u("strong", null, V(P.value.length ? `正在处理 ${P.value.length} 个资源` : "资源任务中心"), 1),
              u("span", null, V(P.value[0] ? `${P.value[0].resource_name || P.value[0].provider_id} · ${K(P.value[0])}` : "查看最近的安装、校验与失败记录"), 1)
            ]),
            P.value[0] ? ($(), T("span", nI, [
              u("b", null, V(Math.round(P.value[0].progress_percent || 0)) + "%", 1),
              u("i", null, [
                u("em", {
                  style: it({ width: `${Math.min(100, Math.max(0, P.value[0].progress_percent || 0))}%` })
                }, null, 4)
              ])
            ])) : le("", !0),
            h[28] || (h[28] = u("span", { class: "download-summary-arrow" }, "查看详情 →", -1))
          ], 8, QN)
        ])) : le("", !0),
        g.value ? ($(), T("div", {
          key: 1,
          class: "drawer-overlay",
          onClick: h[2] || (h[2] = gt((oe) => g.value = !1, ["self"]))
        }, [
          u("aside", oI, [
            u("div", sI, [
              h[29] || (h[29] = u("div", null, [
                u("p", { class: "eyebrow" }, "RESOURCE TASKS"),
                u("h3", null, "下载中心"),
                u("p", null, "只在有活动任务时显示入口；已结束任务可在这里重试或清理。")
              ], -1)),
              u("div", iI, [
                L.value ? ($(), T("button", {
                  key: 0,
                  class: "button button-quiet",
                  type: "button",
                  onClick: M
                }, "清理已结束")) : le("", !0),
                u("button", {
                  class: "modal-close",
                  type: "button",
                  onClick: h[1] || (h[1] = (oe) => g.value = !1),
                  "aria-label": "关闭下载中心"
                }, [
                  J(F(Kt), { size: 18 })
                ])
              ])
            ]),
            u("div", rI, [
              E.value && !f.value.length ? ($(), T("p", lI, "加载任务中…")) : f.value.length ? le("", !0) : ($(), T("p", aI, "暂无资源任务")),
              ($(!0), T(be, null, Te(f.value, (oe) => ($(), T("article", {
                key: oe.task_id,
                class: ve(["download-task", `task-${oe.status}`])
              }, [
                u("div", uI, [
                  u("div", null, [
                    u("strong", null, V(oe.resource_name || oe.provider_id), 1),
                    u("span", null, [
                      he(V(K(oe)), 1),
                      oe.phase ? ($(), T(be, { key: 0 }, [
                        he(" · " + V(oe.phase), 1)
                      ], 64)) : le("", !0)
                    ])
                  ]),
                  u("b", null, V(oe.progress_percent == null ? "—" : `${Math.round(oe.progress_percent)}%`), 1)
                ]),
                u("div", cI, [
                  u("i", {
                    style: it({ width: `${Math.min(100, Math.max(0, oe.progress_percent || 0))}%` })
                  }, null, 4)
                ]),
                u("div", dI, [
                  oe.current_file ? ($(), T("span", fI, "当前文件：" + V(oe.current_file), 1)) : le("", !0),
                  oe.total_bytes ? ($(), T("span", pI, V(q(oe.downloaded_bytes)) + " / " + V(q(oe.total_bytes)), 1)) : le("", !0),
                  G(oe) ? ($(), T("span", hI, "速度 " + V(q(oe.speed_bytes_per_second)) + "/秒 · 剩余 " + V(H(oe.eta_seconds)), 1)) : le("", !0),
                  oe.error_message ? ($(), T("span", vI, V(oe.error_message), 1)) : le("", !0)
                ]),
                G(oe) ? ($(), T("div", gI, [
                  u("button", {
                    class: "button button-secondary",
                    type: "button",
                    onClick: (mo) => A(oe)
                  }, "取消", 8, mI)
                ])) : oe.status === "failed" ? ($(), T("div", yI, [
                  u("button", {
                    class: "button button-secondary",
                    type: "button",
                    onClick: (mo) => R(oe)
                  }, [
                    J(F(Nt), { size: 14 }),
                    h[30] || (h[30] = he("重试"))
                  ], 8, bI)
                ])) : le("", !0)
              ], 2))), 128))
            ])
          ])
        ])) : le("", !0),
        n.value === "audio" && (y.value || w.value) ? ($(), T("section", _I, [
          h[43] || (h[43] = u("div", { class: "section-heading" }, [
            u("div", null, [
              u("span", { class: "section-label" }, "LOCAL AUDIO PRODUCTION"),
              u("h3", { id: "local-production-title" }, "本地音频生产")
            ]),
            u("span", { class: "section-note" }, "不参与角色对话，只用于素材处理和文件生成")
          ], -1)),
          u("div", wI, [
            y.value ? ($(), T("article", kI, [
              u("div", EI, [
                h[31] || (h[31] = u("div", null, [
                  u("span", { class: "production-kicker" }, "RVC"),
                  u("h3", null, "RVC 音频生产")
                ], -1)),
                u("span", {
                  class: ve(["status-chip", { on: (B = y.value.resource_status) == null ? void 0 : B.ready }])
                }, V((Y = y.value.resource_status) != null && Y.ready ? "可用于音频生产" : (N = y.value.resource_status) != null && N.installing ? "准备中" : "资源未就绪"), 3)
              ]),
              h[34] || (h[34] = u("p", null, "使用已有音频和训练好的 .pth 音色模型生成新的变声音频文件。RVC 不作为 TTS，也不改变角色对话音色。", -1)),
              u("div", xI, [
                u("span", null, "内置核心：" + V((ie = (Z = (te = y.value.resource_status) == null ? void 0 : te.components) == null ? void 0 : Z.source) != null && ie.ready ? "已就绪" : "待准备"), 1),
                u("span", null, "Hubert：" + V((de = y.value.resource_status) != null && de.hubert_ready ? "已就绪" : "待准备"), 1),
                u("span", null, "RMVPE：" + V((ke = y.value.resource_status) != null && ke.rmvpe_ready ? "已就绪" : "待准备"), 1),
                h[32] || (h[32] = u("span", null, "模型由 RVC 页面管理", -1))
              ]),
              u("div", SI, [
                u("button", {
                  class: "button button-primary",
                  type: "button",
                  onClick: h[3] || (h[3] = (oe) => ue(y.value))
                }, [
                  J(F(Mi), { size: 15 }),
                  h[33] || (h[33] = he("管理 RVC 资源"))
                ])
              ])
            ])) : le("", !0),
            w.value ? ($(), T("article", CI, [
              u("div", $I, [
                h[35] || (h[35] = u("div", null, [
                  u("span", { class: "production-kicker" }, "COMMON AUDIO"),
                  u("h3", null, "人声分离")
                ], -1)),
                u("span", {
                  class: ve(["status-chip", { on: ($e = w.value.resource_status) == null ? void 0 : $e.ready }])
                }, V((Oe = w.value.resource_status) != null && Oe.ready ? "已就绪" : "待准备"), 3)
              ]),
              h[37] || (h[37] = u("p", null, "通用声音前处理资源，供 GPT-SoVITS 数据集流程和其他音频处理任务使用。", -1)),
              u("div", NI, [
                u("button", {
                  class: "button button-secondary",
                  type: "button",
                  onClick: h[4] || (h[4] = (oe) => ue(w.value))
                }, [
                  J(F(Mi), { size: 15 }),
                  h[36] || (h[36] = he("管理人声分离"))
                ])
              ])
            ])) : le("", !0),
            u("article", II, [
              u("div", MI, [
                h[38] || (h[38] = u("div", null, [
                  u("span", { class: "production-kicker" }, "MEDIA RUNTIME"),
                  u("h3", null, "FFmpeg")
                ], -1)),
                u("span", {
                  class: ve(["status-chip", { on: z.value.ready }])
                }, V(z.value.ready ? "可用" : "未安装"), 3)
              ]),
              h[42] || (h[42] = u("p", null, "音视频抽取、格式转换和声音工作流的基础运行时。使用独立受管副本，不复用 RVC 的来源或设备配置。", -1)),
              u("div", OI, [
                u("span", null, "受管副本：" + V(z.value.installed ? "已存在" : "未准备"), 1),
                u("span", null, "系统命令：" + V(z.value.system_path ? "已发现" : "未发现"), 1)
              ]),
              u("div", TI, [
                z.value.installed ? ($(), T("button", {
                  key: 1,
                  class: "button button-secondary",
                  type: "button",
                  onClick: h[6] || (h[6] = (oe) => ne("remove")),
                  disabled: l.value !== null
                }, [
                  J(F(en), { size: 15 }),
                  h[40] || (h[40] = he("移除受管副本"))
                ], 8, DI)) : ($(), T("button", {
                  key: 0,
                  class: "button button-primary",
                  type: "button",
                  onClick: h[5] || (h[5] = (oe) => ne("install")),
                  disabled: l.value !== null
                }, [
                  J(F(Kn), { size: 15 }),
                  h[39] || (h[39] = he("下载 FFmpeg"))
                ], 8, PI)),
                u("button", {
                  class: "button button-secondary",
                  type: "button",
                  onClick: h[7] || (h[7] = (oe) => ne("directory")),
                  disabled: l.value !== null
                }, [
                  J(F(Do), { size: 15 }),
                  h[41] || (h[41] = he("打开目录"))
                ], 8, RI)
              ])
            ])
          ])
        ])) : le("", !0),
        n.value !== "audio" ? ($(), T("main", AI, [
          u("div", VI, [
            u("div", null, [
              u("span", LI, V((et = O.find((oe) => oe.id === n.value)) == null ? void 0 : et.label), 1),
              h[44] || (h[44] = u("h3", null, "供应商", -1))
            ]),
            h[45] || (h[45] = u("span", { class: "section-note" }, "点击卡片查看配置", -1))
          ]),
          o.value && t.value.length === 0 ? ($(), T("div", zI, [
            J(F(Nt), {
              size: 22,
              class: "spin"
            }),
            h[46] || (h[46] = u("p", null, "加载中...", -1))
          ])) : s.value && t.value.length === 0 ? ($(), T("div", BI, [
            J(F(Kt), { size: 22 }),
            u("p", null, V(s.value), 1),
            u("button", {
              class: "button button-primary",
              onClick: re
            }, "重试")
          ])) : D.value.length === 0 ? ($(), T("div", FI, h[47] || (h[47] = [
            u("p", null, "这个分类暂时没有可用供应商。", -1)
          ]))) : ($(), T("div", {
            key: 3,
            class: ve(["providers-grid", { compact: n.value === "llm" }])
          }, [
            ($(!0), T(be, null, Te(D.value, (oe) => {
              var mo;
              return $(), T("article", {
                key: oe.type + ":" + oe.id,
                class: ve(["provider-card", { configured: oe.is_configured, active: oe.is_active, local: oe.mode === "local" }]),
                tabindex: "0",
                onClick: (yo) => ue(oe),
                onKeydown: [
                  ua((yo) => ue(oe), ["enter"]),
                  ua(gt((yo) => ue(oe), ["prevent"]), ["space"])
                ]
              }, [
                u("div", HI, [
                  u("div", jI, [
                    u("span", {
                      class: ve(["provider-mark", { local: oe.mode === "local" }])
                    }, null, 2),
                    u("h3", null, V(oe.name), 1),
                    oe.mode === "local" ? ($(), T("span", GI, "本地")) : ($(), T("span", YI, "API"))
                  ]),
                  u("span", {
                    class: ve(["active-label", { on: oe.is_active }])
                  }, V(oe.is_active ? "已启用" : oe.runtime_supported ? "可启用" : "仅配置"), 3)
                ]),
                u("p", qI, V(oe.description), 1),
                u("div", {
                  class: ve(["runtime-status", { supported: oe.runtime_supported }]),
                  title: oe.runtime_note
                }, [
                  h[48] || (h[48] = u("span", { class: "runtime-dot" }, null, -1)),
                  he(V(oe.runtime_supported ? "已接入运行链路" : "暂未接入运行链路"), 1)
                ], 10, XI),
                oe.mode === "local" ? ($(), T("div", KI, [
                  h[49] || (h[49] = u("span", { class: "meta-label" }, "资源状态", -1)),
                  u("strong", null, V(_(oe)), 1),
                  u("code", null, V(((mo = oe.resource_status) == null ? void 0 : mo.model_id) || "尚未选择资源"), 1)
                ])) : ($(), T("div", WI, [
                  h[50] || (h[50] = u("span", { class: "meta-label" }, "当前模型", -1)),
                  u("code", null, V(oe.current_model || oe.default_model || "按接口默认"), 1),
                  oe.current_base_url ? ($(), T("span", ZI, V(oe.current_base_url), 1)) : le("", !0)
                ])),
                u("footer", JI, [
                  u("button", {
                    class: "button button-secondary",
                    type: "button",
                    onClick: gt((yo) => ue(oe), ["stop"])
                  }, [
                    J(F(Mi), { size: 15 }),
                    h[51] || (h[51] = he("配置"))
                  ], 8, QI),
                  oe.mode === "api" && oe.is_configured && oe.runtime_supported ? ($(), T("button", {
                    key: 0,
                    class: "button button-test",
                    type: "button",
                    onClick: gt((yo) => p(oe), ["stop"]),
                    disabled: r.value === oe.id
                  }, [
                    J(F(Nt), {
                      size: 15,
                      class: ve({ spin: r.value === oe.id })
                    }, null, 8, ["class"]),
                    he(V(r.value === oe.id ? "测试中" : "测试连接"), 1)
                  ], 8, e3)) : le("", !0),
                  oe.runtime_supported ? ($(), T("button", {
                    key: 1,
                    class: ve(["button", oe.is_active ? "button-active" : "button-primary"]),
                    type: "button",
                    onClick: gt((yo) => X(oe), ["stop"]),
                    disabled: o.value
                  }, V(oe.is_active ? "停用" : "启用"), 11, t3)) : le("", !0)
                ])
              ], 42, UI);
            }), 128))
          ], 2))
        ])) : le("", !0),
        m.value && y.value ? ($(), T("div", {
          key: 4,
          class: "drawer-overlay",
          onClick: gt(se, ["self"])
        }, [
          u("aside", n3, [
            u("div", o3, [
              h[52] || (h[52] = u("div", null, [
                u("p", { class: "eyebrow" }, "LOCAL AUDIO PRODUCTION / RVC"),
                u("h3", null, "RVC 音频生产"),
                u("p", null, "只管理 RVC 音频到音频推理所需的运行时和模型，不参与角色对话或 TTS。")
              ], -1)),
              u("button", {
                class: "modal-close",
                type: "button",
                onClick: se,
                "aria-label": "关闭 RVC 管理"
              }, [
                J(F(Kt), { size: 18 })
              ])
            ]),
            u("div", s3, [
              u("div", i3, [
                u("div", null, [
                  h[53] || (h[53] = u("span", { class: "section-label" }, "推理可用性", -1)),
                  u("strong", null, V((ot = y.value.resource_status) != null && ot.ready ? "可以开始生成变声音频" : "还需要补完资源"), 1)
                ]),
                u("span", {
                  class: ve(["status-chip", { on: (yt = y.value.resource_status) == null ? void 0 : yt.ready }])
                }, V((bt = y.value.resource_status) != null && bt.ready ? "READY" : "INCOMPLETE"), 3)
              ]),
              u("div", r3, [
                ($(), T(be, null, Te([{ key: "source", title: "YUMENO 内置 RVC 核心", detail: "项目内置推理核心" }, { key: "runtime", title: "独立 Python 运行时", detail: "YUMENO/runtime/rvc" }, { key: "hubert", title: "Hubert 特征模型", detail: "用于音频特征提取" }, { key: "rmvpe", title: "RMVPE 音高模型", detail: "用于 F0 提取" }], (oe) => u("div", {
                  key: oe.key,
                  class: "rvc-component-row"
                }, [
                  u("div", l3, [
                    ce(oe.key) ? ($(), vt(F(ao), {
                      key: 0,
                      size: 16
                    })) : ($(), T("span", a3, "·"))
                  ]),
                  u("div", u3, [
                    u("strong", null, V(oe.title), 1),
                    u("span", null, V(oe.detail), 1)
                  ]),
                  u("b", {
                    class: ve({ ready: ce(oe.key) })
                  }, V(ge(oe.key)), 3)
                ])), 64))
              ]),
              u("div", c3, [
                u("div", null, [
                  u("strong", null, V((rn = y.value.resource_status) != null && rn.installing ? "正在准备 RVC 运行时" : "补完推理环境"), 1),
                  u("p", null, V(((vo = y.value.resource_status) == null ? void 0 : vo.detail) || ((lt = y.value.resource_status) == null ? void 0 : lt.note)), 1)
                ]),
                (_t = y.value.resource_status) != null && _t.installing ? ($(), T("div", d3, [
                  u("span", null, V(Math.round(ee())) + "%", 1),
                  u("i", null, [
                    u("em", {
                      style: it({ width: `${ee()}%` })
                    }, null, 4)
                  ])
                ])) : le("", !0),
                u("div", f3, [
                  (go = y.value.resource_status) != null && go.installing ? ($(), T("button", {
                    key: 0,
                    class: "button button-secondary",
                    type: "button",
                    onClick: h[8] || (h[8] = (oe) => me(y.value, "cancel")),
                    disabled: l.value !== null
                  }, "取消准备", 8, p3)) : (pl = y.value.resource_status) != null && pl.ready ? le("", !0) : ($(), T("button", {
                    key: 1,
                    class: "button button-primary",
                    type: "button",
                    onClick: h[9] || (h[9] = (oe) => me(y.value, "install")),
                    disabled: l.value !== null
                  }, [
                    J(F(Kn), { size: 15 }),
                    h[54] || (h[54] = he("准备运行时与基础模型"))
                  ], 8, h3)),
                  (hl = y.value.resource_status) != null && hl.ready ? ($(), T("button", {
                    key: 2,
                    class: "button button-secondary",
                    type: "button",
                    onClick: h[10] || (h[10] = (oe) => me(y.value, "remove")),
                    disabled: l.value !== null
                  }, [
                    J(F(en), { size: 15 }),
                    h[55] || (h[55] = he("移除 YUMENO 运行时"))
                  ], 8, v3)) : le("", !0),
                  u("button", {
                    class: "button button-secondary",
                    type: "button",
                    onClick: h[11] || (h[11] = (oe) => me(y.value, "directory")),
                    disabled: l.value !== null
                  }, [
                    J(F(Do), { size: 15 }),
                    h[56] || (h[56] = he("查看资源目录"))
                  ], 8, g3)
                ])
              ]),
              (vl = y.value.resource_status) != null && vl.error ? ($(), T("p", m3, V(y.value.resource_status.error), 1)) : le("", !0),
              s.value ? ($(), T("p", y3, V(s.value), 1)) : le("", !0),
              h[57] || (h[57] = u("div", { class: "rvc-workspace-note" }, [
                u("strong", null, "下一步"),
                u("span", null, "将自己的 .pth 音色模型放入受管的 weights 目录；.index 文件不是必需项。完成后到独立的“RVC”页面上传音频并生成文件。")
              ], -1))
            ])
          ])
        ])) : le("", !0),
        i.value ? ($(), T("div", {
          key: 5,
          class: "drawer-overlay",
          onClick: gt(_e, ["self"])
        }, [
          u("aside", {
            class: "config-drawer",
            role: "dialog",
            "aria-modal": "true",
            "aria-label": `配置 ${((gl = U.value) == null ? void 0 : gl.name) || "供应商"}`
          }, [
            u("div", _3, [
              u("div", null, [
                h[58] || (h[58] = u("p", { class: "eyebrow" }, "CONFIGURE", -1)),
                u("h3", null, V((ml = U.value) == null ? void 0 : ml.name), 1),
                u("p", null, V((yl = U.value) == null ? void 0 : yl.description), 1)
              ]),
              u("button", {
                class: "modal-close",
                type: "button",
                onClick: _e,
                "aria-label": "关闭配置"
              }, [
                J(F(Kt), { size: 18 })
              ])
            ]),
            u("div", w3, [
              u("div", k3, [
                u("span", {
                  class: ve(["status-chip", { on: (bl = U.value) == null ? void 0 : bl.is_active }])
                }, V((_l = U.value) != null && _l.is_active ? "当前启用" : (wl = U.value) != null && wl.runtime_supported ? "可用" : "仅保存配置"), 3),
                u("span", null, V(((kl = U.value) == null ? void 0 : kl.mode) === "local" ? "本地资源" : "API 接口"), 1)
              ]),
              u("form", {
                onSubmit: gt(xe, ["prevent"]),
                class: "config-form"
              }, [
                ((El = U.value) == null ? void 0 : El.mode) === "api" ? ($(), T(be, { key: 0 }, [
                  U.value.requires_api_key ? ($(), T("label", E3, [
                    h[59] || (h[59] = u("span", null, [
                      he("API Key "),
                      u("span", { class: "required" }, "*")
                    ], -1)),
                    Ce(u("input", {
                      type: "text",
                      "onUpdate:modelValue": h[12] || (h[12] = (oe) => x.value.api_key = oe),
                      placeholder: "输入 API Key",
                      required: "",
                      autocomplete: "off"
                    }, null, 512), [
                      [Le, x.value.api_key]
                    ])
                  ])) : le("", !0),
                  u("label", x3, [
                    h[60] || (h[60] = u("span", null, "Base URL", -1)),
                    Ce(u("input", {
                      type: "text",
                      "onUpdate:modelValue": h[13] || (h[13] = (oe) => x.value.base_url = oe),
                      placeholder: U.value.default_base_url
                    }, null, 8, S3), [
                      [Le, x.value.base_url]
                    ])
                  ]),
                  u("label", C3, [
                    h[61] || (h[61] = u("span", null, "模型名称", -1)),
                    Ce(u("input", {
                      type: "text",
                      "onUpdate:modelValue": h[14] || (h[14] = (oe) => x.value.model = oe),
                      placeholder: U.value.default_model
                    }, null, 8, $3), [
                      [Le, x.value.model]
                    ])
                  ])
                ], 64)) : ($(), T(be, { key: 1 }, [
                  ((xl = U.value) == null ? void 0 : xl.id) !== "gsv_tts_local" ? ($(), T("label", N3, [
                    h[62] || (h[62] = u("span", null, "模型 ID", -1)),
                    Ce(u("input", {
                      type: "text",
                      "onUpdate:modelValue": h[15] || (h[15] = (oe) => x.value.model = oe),
                      placeholder: (Sl = U.value) == null ? void 0 : Sl.default_model
                    }, null, 8, I3), [
                      [Le, x.value.model]
                    ])
                  ])) : le("", !0),
                  ((Cl = U.value) == null ? void 0 : Cl.id) !== "gsv_tts_local" ? ($(), T("div", M3, [
                    u("label", O3, [
                      h[64] || (h[64] = u("span", null, "来源", -1)),
                      Ce(u("select", {
                        "onUpdate:modelValue": h[16] || (h[16] = (oe) => x.value.source = oe)
                      }, h[63] || (h[63] = [
                        u("option", { value: "modelscope" }, "ModelScope", -1),
                        u("option", { value: "huggingface" }, "Hugging Face", -1)
                      ]), 512), [
                        [Qt, x.value.source]
                      ])
                    ]),
                    u("label", T3, [
                      h[66] || (h[66] = u("span", null, "设备", -1)),
                      Ce(u("select", {
                        "onUpdate:modelValue": h[17] || (h[17] = (oe) => x.value.device = oe)
                      }, h[65] || (h[65] = [
                        u("option", { value: "auto" }, "自动", -1),
                        u("option", { value: "cuda" }, "CUDA", -1),
                        u("option", { value: "cpu" }, "CPU", -1)
                      ]), 512), [
                        [Qt, x.value.device]
                      ])
                    ])
                  ])) : ($(), T("div", P3, [
                    u("label", D3, [
                      h[67] || (h[67] = u("span", null, "GPT-SoVITS 整合包下载地址", -1)),
                      Ce(u("input", {
                        type: "text",
                        "onUpdate:modelValue": h[18] || (h[18] = (oe) => d.value = oe),
                        placeholder: "https://…/gpt-sovits.zip"
                      }, null, 512), [
                        [Le, d.value]
                      ])
                    ]),
                    h[68] || (h[68] = u("p", { class: "config-hint" }, "引擎安装完成后，声音资产仍在“声音”模块单独管理。", -1))
                  ])),
                  u("div", R3, [
                    u("div", null, [
                      h[69] || (h[69] = u("span", { class: "meta-label" }, "资源状态", -1)),
                      u("strong", null, V(U.value ? _(U.value) : "未知"), 1)
                    ]),
                    u("div", A3, [
                      b(U.value) ? ($(), T("button", {
                        key: 0,
                        type: "button",
                        class: "button button-secondary",
                        onClick: h[19] || (h[19] = (oe) => me(U.value, "cancel")),
                        disabled: l.value !== null
                      }, "取消安装", 8, V3)) : I(U.value) ? le("", !0) : ($(), T("button", {
                        key: 1,
                        type: "button",
                        class: "button button-primary",
                        onClick: h[20] || (h[20] = (oe) => me(U.value, "install")),
                        disabled: l.value !== null || (($l = U.value) == null ? void 0 : $l.id) === "gsv_tts_local" && !d.value
                      }, [
                        J(F(Kn), { size: 15 }),
                        h[70] || (h[70] = he(" 安装资源"))
                      ], 8, L3)),
                      I(U.value) ? ($(), T("button", {
                        key: 2,
                        type: "button",
                        class: "button button-secondary",
                        onClick: h[21] || (h[21] = (oe) => me(U.value, "remove")),
                        disabled: l.value !== null
                      }, [
                        J(F(en), { size: 15 }),
                        h[71] || (h[71] = he(" 删除"))
                      ], 8, z3)) : le("", !0),
                      u("button", {
                        type: "button",
                        class: "button button-secondary",
                        onClick: h[22] || (h[22] = (oe) => me(U.value, "directory")),
                        disabled: l.value !== null
                      }, [
                        J(F(Do), { size: 15 }),
                        h[72] || (h[72] = he(" 打开目录"))
                      ], 8, B3),
                      ((Nl = U.value) == null ? void 0 : Nl.id) === "gsv_tts_local" && ((Il = U.value.resource_status) != null && Il.service_running) ? ($(), T("button", {
                        key: 3,
                        type: "button",
                        class: "button button-secondary",
                        onClick: h[23] || (h[23] = (oe) => me(U.value, "stop")),
                        disabled: l.value !== null
                      }, "停止服务", 8, F3)) : ((Ml = U.value) == null ? void 0 : Ml.id) === "gsv_tts_local" && I(U.value) ? ($(), T("button", {
                        key: 4,
                        type: "button",
                        class: "button button-primary",
                        onClick: h[24] || (h[24] = (oe) => me(U.value, "start")),
                        disabled: l.value !== null
                      }, [
                        J(F(lr), { size: 15 }),
                        h[73] || (h[73] = he(" 启动服务"))
                      ], 8, U3)) : le("", !0)
                    ])
                  ])
                ], 64)),
                u("label", H3, [
                  Ce(u("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": h[25] || (h[25] = (oe) => x.value.enabled = oe),
                    disabled: !((Ol = U.value) != null && Ol.runtime_supported)
                  }, null, 8, j3), [
                    [Xr, x.value.enabled]
                  ]),
                  h[74] || (h[74] = u("span", null, "设为当前激活供应商", -1))
                ]),
                U.value && !U.value.runtime_supported ? ($(), T("p", G3, "当前运行时还没有这个 Provider 的适配器，因此这里只保存配置，不会自动调用。")) : le("", !0),
                u("div", Y3, [
                  u("button", {
                    type: "button",
                    class: "button button-secondary",
                    onClick: _e
                  }, "取消"),
                  u("button", {
                    type: "submit",
                    class: "button button-primary",
                    disabled: o.value
                  }, V(o.value ? "保存中..." : "保存并应用"), 9, q3)
                ]),
                a.value ? ($(), T("p", X3, [
                  J(F(ao), { size: 16 }),
                  he(" " + V(a.value), 1)
                ])) : le("", !0),
                c.value ? ($(), T("p", {
                  key: 4,
                  class: ve(["config-message", c.value.startsWith("连接成功") ? "success" : "error"])
                }, V(c.value), 3)) : le("", !0),
                s.value ? ($(), T("p", K3, V(s.value), 1)) : le("", !0)
              ], 32)
            ])
          ], 8, b3)
        ])) : le("", !0)
      ]);
    };
  }
}), Z3 = /* @__PURE__ */ fl(W3, [["__scopeId", "data-v-6357f78c"]]);
let mn = null, yn = null;
function pM(e = "#reranker-settings-root") {
  if (mn) return mn;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("Reranker 设置挂载点不存在");
  return mn = es(YN), mn.mount(t), mn;
}
function hM() {
  mn && (mn.unmount(), mn = null);
}
function vM(e = "#providers-root") {
  if (yn) return yn;
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t) throw new Error("提供商配置挂载点不存在");
  return yn = es(Z3), yn.mount(t), yn;
}
function gM() {
  yn && (yn.unmount(), yn = null);
}
export {
  fM as destroyEvaluationApp,
  aM as destroyExtensionsApp,
  sM as destroyManageApp,
  gM as destroyProvidersApp,
  hM as destroyRerankerSettingsApp,
  dM as hideEvaluationApp,
  lM as hideExtensionsApp,
  uM as mountEvaluationApp,
  iM as mountExtensionsApp,
  nM as mountManageApp,
  vM as mountProvidersApp,
  pM as mountRerankerSettingsApp,
  cM as showEvaluationApp,
  rM as showExtensionsApp,
  oM as showManageApp
};

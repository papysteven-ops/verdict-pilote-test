/* Verdict — coffre chiffré : isole le stockage de cette application.
   Le Client, le Perso et le Pilote sont publiés sur la même adresse de base (papysteven-ops.github.io) et
   partageraient sinon le même stockage local : les données privées se mélangeraient à celles du Client.
   Chargé avant tout autre script dans chaque page déchiffrée ; préfixe localStorage, sessionStorage,
   IndexedDB et Cache Storage par « coffre:<id>: ». */
(function () {
  'use strict';
  var me = document.currentScript, ID = (me && me.getAttribute('data-coffre')) || 'coffre', P = 'coffre:' + ID + ':';
  if (window.__verdictCoffre) return; window.__verdictCoffre = ID;
  try { window.sessionStorage.removeItem('coffre-essais-' + ID); } catch (e) {}
  /* C58 : mot de passe tout juste saisi sur la page d'ouverture → le verrou de l'appli ne redemande rien. */
  try { if (window.top === window && window.sessionStorage.getItem('coffre-frais-' + ID) === '1') { window.sessionStorage.removeItem('coffre-frais-' + ID); window.__verdictCoffreFrais = true; } } catch (e) {}
  function wrap(real) {
    function keys() { var o = []; for (var i = 0; i < real.length; i++) { var k = real.key(i); if (k && k.indexOf(P) === 0) o.push(k.slice(P.length)); } return o; }
    var api = {
      getItem: function (k) { return real.getItem(P + k); },
      setItem: function (k, v) { real.setItem(P + k, String(v)); },
      removeItem: function (k) { real.removeItem(P + k); },
      clear: function () { keys().forEach(function (k) { real.removeItem(P + k); }); },
      key: function (i) { var a = keys(); return i >= 0 && i < a.length ? a[i] : null; }
    };
    Object.defineProperty(api, 'length', { get: function () { return keys().length; } });
    return new Proxy(api, {
      get: function (t, p) { if (p in t) return t[p]; if (typeof p === 'symbol') return undefined; var v = real.getItem(P + p); return v === null ? undefined : v; },
      set: function (t, p, v) { if (p in t) return false; real.setItem(P + p, String(v)); return true; },
      deleteProperty: function (t, p) { real.removeItem(P + p); return true; },
      has: function (t, p) { return p in t || real.getItem(P + p) !== null; },
      ownKeys: function () { return keys(); },
      getOwnPropertyDescriptor: function (t, p) { var v = real.getItem(P + p); return v === null ? undefined : { value: v, enumerable: true, configurable: true, writable: true }; }
    });
  }
  ['localStorage', 'sessionStorage'].forEach(function (name) {
    try { var w = wrap(window[name]); Object.defineProperty(window, name, { configurable: true, enumerable: true, get: function () { return w; } }); } catch (e) {}
  });
  try {
    var F = IDBFactory.prototype, open = F.open, del = F.deleteDatabase, dbs = F.databases;
    F.open = function (n, v) { return v === undefined ? open.call(this, P + n) : open.call(this, P + n, v); };
    F.deleteDatabase = function (n) { return del.call(this, P + n); };
    if (dbs) F.databases = function () { return dbs.call(this).then(function (a) { return a.filter(function (d) { return d.name.indexOf(P) === 0; }).map(function (d) { return { name: d.name.slice(P.length), version: d.version }; }); }); };
  } catch (e) {}
  try {
    var C = CacheStorage.prototype, co = C.open, ch = C.has, cd = C['delete'], ck = C.keys;
    C.open = function (n) { return co.call(this, P + n); };
    C.has = function (n) { return ch.call(this, P + n); };
    C['delete'] = function (n) { return cd.call(this, P + n); };
    C.keys = function () { return ck.call(this).then(function (a) { return a.filter(function (n) { return n.indexOf(P) === 0; }).map(function (n) { return n.slice(P.length); }); }); };
  } catch (e) {}
})();

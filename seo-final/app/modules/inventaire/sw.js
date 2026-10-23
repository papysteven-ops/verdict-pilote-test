/* Verdict — coffre chiffré (service worker).
   En ligne, il n'y a que des fichiers chiffrés (AES-256-GCM) sous v/. Ce service worker les déchiffre dans le
   téléphone avec la clé dérivée du mot de passe (conservée dans l'appareil, jamais envoyée).
   Le même fichier est publié à chaque endroit où l'application enregistre un service worker ; seule la ligne
   ROOT change (racine du coffre relative à ce fichier). */
'use strict';
const ROOT = new URL('../../../../', self.location).href;
const ID = 'pilote';
const CACHE = 'verdict-coffre-' + ID;
const PLAIN = ["pilote.webmanifest","icons/verdict-pilote-app-v43-12-180.png","icons/verdict-pilote-app-v43-12-192.png","icons/verdict-pilote-app-v43-12-512.png","coffre-isole.js"];
let META = null, KEY = null;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
/* La page « mot de passe » transmet la clé dérivée ; le service worker la garde dans son propre cache. */
const KEY_URL = ROOT + '__coffre_cle__';
self.addEventListener('message', e => {
  const d = e.data || {}, reply = v => { try { e.ports[0].postMessage(v); } catch (x) {} };
  if (d.type === 'cle') e.waitUntil(caches.open(CACHE).then(c => c.put(KEY_URL, new Response(d.bits))).then(() => { KEY = null; META = null; return loadKey(); }).then(k => reply(!!k), () => reply(false)));
  else if (d.type === 'etat') e.waitUntil(loadKey().then(k => reply(!!k), () => reply(false)));
  else if (d.type === 'oublier') e.waitUntil(forget().then(() => reply(true)));
});

/* C72 : toucher la notification « Nouvelle version » ouvre l'espace et lance la mise à jour. */
self.addEventListener('notificationclick',event=>{if(!event.notification||event.notification.tag!=='verdict-maj')return;event.notification.close();event.waitUntil((async()=>{const wins=await self.clients.matchAll({type:'window',includeUncontrolled:true});if(wins.length){const w=wins[0];try{await w.focus();}catch(e){}w.postMessage({type:'verdict-maj-appliquer'});}else if(self.clients.openWindow){await self.clients.openWindow(self.registration.scope);}})());});

async function loadKey() {
  if (KEY) return KEY;
  try { const r = await (await caches.open(CACHE)).match(KEY_URL); if (r) KEY = await crypto.subtle.importKey('raw', await r.arrayBuffer(), 'AES-GCM', false, ['decrypt']); } catch (e) { KEY = null; }
  return KEY;
}
async function cached(url, fresh) {
  const c = await caches.open(CACHE);
  if (!fresh) { const hit = await c.match(url); if (hit) return hit; }
  try { const r = await fetch(url, { cache: 'no-store' }); if (r.ok) { await c.put(url, r.clone()); return r; } } catch (e) {}
  const hit = await c.match(url); if (hit) return hit;
  throw new Error('hors ligne : ' + url);
}
async function loadMeta() {
  if (META) return META;
  META = await (await cached(ROOT + 'coffre.json', true)).json();
  setTimeout(() => { META = null; }, 60000);
  return META;
}
function unlockPage() { return cached(ROOT + '404.html', true); } /* page « mot de passe » avec <base> : valable à toute profondeur */
const SHIM = '<script src="' + new URL(ROOT).pathname + 'coffre-isole.js" data-coffre="' + ID + '"></script>';

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!url.href.startsWith(ROOT) || url.origin !== self.location.origin) return;
  let rel = decodeURIComponent(url.pathname.slice(new URL(ROOT).pathname.length));
  if (rel === '' || rel.endsWith('/')) rel += 'index.html';
  if (rel === 'coffre.json' || rel.startsWith('v/') || PLAIN.includes(rel) || rel.endsWith('sw.js')) return;
  e.respondWith(serve(req, rel));
});

async function serve(req, rel) {
  const key = await loadKey();
  if (!key) return req.mode === 'navigate' ? unlockPage() : new Response('Coffre verrouillé', { status: 403 });
  let meta;
  /* Ouverture ou rechargement de page (dont « Mettre à jour ») : la liste publiée est relue, jamais celle gardée en mémoire. */
  if (req.mode === 'navigate') META = null;
  try { meta = await loadMeta(); } catch (e) { return new Response('Hors ligne', { status: 503 }); }
  const f = meta.files[rel];
  if (!f) return new Response('Introuvable', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  let bytes;
  try {
    const buf = await (await cached(ROOT + 'v/' + rel + '.enc?h=' + f.h, false)).arrayBuffer();
    bytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(buf, 0, 12) }, key, new Uint8Array(buf, 12));
  } catch (e) {
    if (req.mode === 'navigate') { await forget(); return unlockPage(); }
    return new Response('Déchiffrement impossible', { status: 500 });
  }
  if (/^text\/html/.test(f.t)) {
    let s = new TextDecoder().decode(bytes);
    const m = /<head[^>]*>/i.exec(s);
    s = m ? s.slice(0, m.index + m[0].length) + SHIM + s.slice(m.index + m[0].length) : SHIM + s;
    return new Response(s, { headers: { 'Content-Type': f.t, 'Cache-Control': 'no-store' } });
  }
  return new Response(bytes, { headers: { 'Content-Type': f.t } });
}
async function forget() {
  KEY = null;
  try { await (await caches.open(CACHE)).delete(KEY_URL); } catch (e) {}
}

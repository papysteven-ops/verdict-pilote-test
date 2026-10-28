/* Verdict — coffre chiffré (service worker).
   En ligne, il n'y a que des fichiers chiffrés (AES-256-GCM) sous v/. Ce service worker les déchiffre dans le
   téléphone avec la clé dérivée du mot de passe (conservée dans l'appareil, jamais envoyée).
   Le même fichier est publié à chaque endroit où l'application enregistre un service worker ; seule la ligne
   ROOT change (racine du coffre relative à ce fichier). */
'use strict';
const ROOT = new URL('../../', self.location).href;
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
/* C444 (L4, audit A55) : coffre.json n'est plus relu sur le réseau avant chaque page. La liste en service est lue dans le cache du
   coffre et relue en arrière-plan, une fois par ouverture de l'appli (page principale ; les cadres Pilotage et Inventaire reprennent
   la liste de leur page). Une liste d'une autre version est gardée comme « suivante » et prend le service à l'ouverture suivante :
   pas de mélange de versions dans les pages gardées d'une même ouverture ; la liste suivante ne prend le service que si la page
   demandée est là (cache ou réseau) : hors ligne, la liste en service reste. Une liste que la clé gardée n'ouvre plus (mot de passe
   changé) fait oublier la clé, sans recharger depuis ici : la page suivante demande le mot de passe.
   Décision 60 (chef, A55) : une version plus récente (ou une clé changée) trouvée au lancement est annoncée à la page principale, qui
   recharge d'office une seule fois si le patron n'a encore rien touché ; sinon elle s'ouvre au lancement suivant (règle A16, C379).
   Un échec réseau n'efface jamais la clé (revue) : seul un échec de déchiffrement le fait. */
const META_URL = ROOT + 'coffre.json', SUIVANTE = ROOT + '__coffre_suivante__', ANCIENNES = ROOT + '__coffre_anciennes__', RECENT = 10000;
let RELU = null, LU = 0, OUV = false;
const enJson = m => new Response(JSON.stringify(m), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
async function lire(c, url) { try { const r = await c.match(url), m = r && await r.json(); return m && m.files && typeof m.files === 'object' ? m : null; } catch (e) { return null; } }
/* Revue : les dernières versions dépassées sont retenues ; une liste déjà dépassée (nœud de cache en retard) n'est ni gardée ni annoncée. */
async function anciennes(c) { try { const r = await c.match(ANCIENNES), a = r && await r.json(); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
async function cleValide(m) {
  const k = await loadKey(); if (!k || !m.check) return true;
  try { const c = Uint8Array.from(atob(m.check), x => x.charCodeAt(0)); await crypto.subtle.decrypt({ name: 'AES-GCM', iv: c.slice(0, 12) }, k, c.slice(12)); return true; } catch (e) { return false; }
}
/* Liste publiée reçue (relecture du service worker, ou lecture faite par la page) : rangée, jamais mise en service d'office. */
async function retenir(r, ouverture) {
  let m = null; try { m = r.ok ? await r.json() : null; } catch (e) {}
  if (!m || !m.files || typeof m.files !== 'object') return; /* portail Wi-Fi, réponse tronquée : la liste gardée reste */
  const c = await caches.open(CACHE);
  if ((await anciennes(c)).includes(m.version)) return; /* avant la clé : une vieille liste ne fait jamais oublier la clé */
  if (!(await cleValide(m))) { await c.delete(SUIVANTE); await c.put(META_URL, enJson(m)); META = null; await forget(); if (ouverture) return annoncer({ type: 'coffre-cle-changee', version: 'cle:' + m.version }); return; }
  const cur = await lire(c, META_URL);
  if (!cur || cur.version === m.version) { await c.delete(SUIVANTE); await c.put(META_URL, enJson(m)); } else await c.put(SUIVANTE, enJson(m));
}
function relire(ouverture) { LU = Date.now(); if (ouverture) OUV = true; /* revue : le drapeau n'est pas perdu si une relecture est déjà en cours */ return RELU || (RELU = fetch(META_URL, { cache: 'no-store' }).then(r => retenir(r, OUV)).catch(() => {}).then(() => { RELU = null; OUV = false; })); }
/* Décision 60 : la liste suivante trouvée au lancement est annoncée aux pages principales (le script D60 de la page décide). */
async function annoncer(msg) { try { for (const w of await self.clients.matchAll({ type: 'window' })) if (w.frameType !== 'nested') w.postMessage(msg); } catch (e) {} }
async function annoncerSuivante() { try { const s = await lire(await caches.open(CACHE), SUIVANTE); if (s) await annoncer({ type: 'coffre-version-suivante', version: s.version }); } catch (e) {} }
/* Revue : la liste suivante ne prend le service que si la page ouverte est disponible (cache, sinon réseau) ; hors ligne ou serveur
   en erreur, la liste en service reste pour ce lancement (l'appli s'ouvre, la clé est gardée). */
async function pret(s, rel) { const f = s.files[rel]; if (!f) return true; try { await cached(ROOT + 'v/' + rel + '.enc?h=' + f.h, false); return true; } catch (e) { return false; } }
async function loadMeta(ouverture, rel) {
  if (META) return META;
  const c = await caches.open(CACHE);
  if (ouverture) { const s = await lire(c, SUIVANTE); if (s && await pret(s, rel)) { const cur = await lire(c, META_URL); if (cur && cur.version !== s.version) await c.put(ANCIENNES, enJson([cur.version].concat((await anciennes(c)).filter(v => v !== cur.version && v !== s.version)).slice(0, 5))); await c.delete(SUIVANTE); await c.put(META_URL, enJson(s)); } }
  let m = await lire(c, META_URL);
  if (!m) { await relire(); m = await lire(c, META_URL); } /* rien de gardé (premier lancement) : on attend le réseau */
  if (!m) throw new Error('hors ligne : coffre.json');
  return (META = m);
}
/* Lecture de coffre.json par la page. « ?maj= » (maj-a18 : version ouverte) : la liste en service, et relecture réseau en
   arrière-plan si la dernière date ; sinon (page « mot de passe », « ?v= » : version publiée) : le réseau tel quel, liste gardée. */
async function lirePage(req, ev, ouverte) {
  const garde = (p) => { try { ev.waitUntil(p); } catch (e) {} };
  if (ouverte) { const m = await lire(await caches.open(CACHE), META_URL); if (m) { if (Date.now() - LU > RECENT) garde(relire()); return enJson(m); } }
  const r = await fetch(req); LU = Date.now();
  await retenir(r.clone(), false).catch(() => {}); /* revue : rangée avant la réponse (« Rechercher » puis rechargement : la nouvelle liste est prête) */
  garde(annoncerSuivante()); /* Décision 60 : la vérification de la page (« ?v= », quelques secondes après le lancement) annonce aussi la version suivante */
  return r;
}
function unlockPage() { return cached(ROOT + '404.html', true); } /* page « mot de passe » avec <base> : valable à toute profondeur */
const SHIM = '<script src="' + new URL(ROOT).pathname + 'coffre-isole.js" data-coffre="' + ID + '"></script>';
/* Décision 60 (chef, A55), dans chaque page ouverte : tout toucher ou chiffre tapé est noté (cadres et cadres srcdoc compris, même
   session) ; la page principale recharge une seule fois à l'annonce d'une version plus récente ou d'une clé changée, seulement si rien
   n'a été touché depuis son ouverture, dans ses 8 premières secondes, hors demande Face ID du verrou (L6) ; après un rechargement,
   aucun autre pendant 10 minutes (marque de session). */
const D60 = '<script>(function(){try{var T="verdict-coffre-touche",M="verdict-coffre-recharge",t0=Date.now(),s=window.sessionStorage,E=["pointerdown","touchstart","keydown","input"];' +
  'var note=function(){try{s.setItem(T,String(Date.now()))}catch(e){}},brancher=function(w){E.forEach(function(n){w.addEventListener(n,note,{capture:true,passive:true})})};brancher(window);' +
  'document.addEventListener("load",function(e){var f=e.target;if(f&&f.tagName==="IFRAME"){try{brancher(f.contentWindow)}catch(x){}}},true);' +
  'if(top!==self||!navigator.serviceWorker)return;navigator.serviceWorker.addEventListener("message",function(e){var d=e.data||{};if((d.type!=="coffre-version-suivante"&&d.type!=="coffre-cle-changee")||Date.now()-t0>8000)return;' +
  'try{var V=window.VerdictVerrou,st=V&&V.state&&V.state();if(st&&st.bio&&st.locked!==false)return}catch(x){}' +
  'var t=0,m=0;try{t=+s.getItem(T)||0;m=+s.getItem(M)||0}catch(x){return}if(t>=t0||(m&&Date.now()-m<600000))return;try{s.setItem(M,String(Date.now()))}catch(x){return}location.reload()})}catch(e){}})();</script>';

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!url.href.startsWith(ROOT) || url.origin !== self.location.origin) return;
  let rel = decodeURIComponent(url.pathname.slice(new URL(ROOT).pathname.length));
  if (rel === '' || rel.endsWith('/')) rel += 'index.html';
  if (rel === 'coffre.json') return e.respondWith(lirePage(req, e, url.searchParams.has('maj'))); /* C444 (L4, audit A55) */
  if (rel.startsWith('v/') || PLAIN.includes(rel) || rel.endsWith('sw.js')) return;
  e.respondWith(serve(req, rel, e));
});

async function serve(req, rel, ev) {
  const key = await loadKey();
  if (!key) return req.mode === 'navigate' ? unlockPage() : new Response('Coffre verrouillé', { status: 403 });
  let meta;
  /* Ouverture ou rechargement de page (dont « Mettre à jour ») : la liste publiée est relue, jamais celle gardée en mémoire.
     C444 (L4, audit A55) : relue dans le cache du coffre, sans attendre le réseau ; seule une page principale (pas un cadre) prend
     la liste suivante et relance la relecture réseau, en arrière-plan, au plus une fois par ouverture. */
  if (req.mode === 'navigate') META = null;
  const ouverture = req.mode === 'navigate' && req.destination !== 'iframe' && req.destination !== 'frame';
  try { meta = await loadMeta(ouverture, rel); } catch (e) { return new Response('Hors ligne', { status: 503 }); }
  if (ouverture && Date.now() - LU > RECENT) { const p = relire(true).then(annoncerSuivante).catch(() => {}); try { ev.waitUntil(p); } catch (e) {} }
  const f = meta.files[rel];
  if (!f) return new Response('Introuvable', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  let bytes, buf;
  try { buf = await (await cached(ROOT + 'v/' + rel + '.enc?h=' + f.h, false)).arrayBuffer(); }
  catch (e) { return new Response('Hors ligne', { status: 503 }); } /* revue : un échec réseau n'efface jamais la clé */
  try {
    bytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(buf, 0, 12) }, key, new Uint8Array(buf, 12));
  } catch (e) {
    if (req.mode === 'navigate') { await forget(); return unlockPage(); }
    return new Response('Déchiffrement impossible', { status: 500 });
  }
  if (/^text\/html/.test(f.t)) {
    let s = new TextDecoder().decode(bytes);
    const m = /<head[^>]*>/i.exec(s);
    const tete = SHIM + (req.mode === 'navigate' ? D60 : ''); /* revue C252 : jamais dans une page lue par fetch (empreintes du studio SEO) */
    s = m ? s.slice(0, m.index + m[0].length) + tete + s.slice(m.index + m[0].length) : tete + s;
    return new Response(s, { headers: { 'Content-Type': f.t, 'Cache-Control': 'no-store' } });
  }
  return new Response(bytes, { headers: { 'Content-Type': f.t } });
}
async function forget() {
  KEY = null;
  try { await (await caches.open(CACHE)).delete(KEY_URL); } catch (e) {}
}

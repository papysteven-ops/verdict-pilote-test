/* Verdict SEO App — sources locales et constats structurels du HTML courant. */
(function (global) {
  'use strict';
  const versionManifest = {"404.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/404.html"}],"a-propos.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/a-propos.html"}],"baisser-food-cost-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/baisser-food-cost-restaurant.html"}],"ca-minimum-par-jour-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/ca-minimum-par-jour-restaurant.html"}],"ca-moyen-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/ca-moyen-restaurant.html"}],"calcul-prix-revient-plat.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/calcul-prix-revient-plat.html"}],"cgv.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/cgv.html"}],"charges-fixes-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/charges-fixes-restaurant.html"}],"charges-variables-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/charges-variables-restaurant.html"}],"coefficient-multiplicateur-restauration.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/coefficient-multiplicateur-restauration.html"}],"combien-gagne-un-restaurateur.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/combien-gagne-un-restaurateur.html"}],"commande-fournisseur-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/commande-fournisseur-restaurant.html"}],"commission-deliveroo-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/commission-deliveroo-restaurant.html"}],"commission-just-eat-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/commission-just-eat-restaurant.html"}],"commission-uber-eats-rentabilite.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/commission-uber-eats-rentabilite.html"}],"confidentialite.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/confidentialite.html"}],"confirmation.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/confirmation.html"}],"contact.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/contact.html"}],"cout-salarie-peu-performant-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/cout-salarie-peu-performant-restaurant.html"}],"dark-kitchen-rentable.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/dark-kitchen-rentable.html"}],"desinscription.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/desinscription.html"}],"diagnostic-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/diagnostic-restaurant.html"}],"ebe-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/ebe-restaurant.html"}],"ecart-food-cost-theorique-reel.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/ecart-food-cost-theorique-reel.html"}],"energie-restaurant-reduire-cout.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/energie-restaurant-reduire-cout.html"}],"essai-gratuit.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/essai-gratuit.html"}],"exemples-restaurants-modeles.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/exemples-restaurants-modeles.html"}],"facturation-electronique-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/facturation-electronique-restaurant.html"}],"faq.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/faq.html"}],"fiche-technique-recette-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/fiche-technique-recette-restaurant.html"}],"food-cost-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/food-cost-restaurant.html"}],"gaspillage-alimentaire-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/gaspillage-alimentaire-restaurant.html"}],"guides.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/guides.html"}],"heures-supplementaires-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/heures-supplementaires-restaurant.html"}],"histoire-restauration.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/histoire-restauration.html"}],"index.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/index.html"},{"id":"hub","label":"Centre de réponses","path":"../site.html"}],"inventaire-restaurant-methode.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/inventaire-restaurant-methode.html"}],"kit-inventaire-gratuit.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/kit-inventaire-gratuit.html"}],"logiciel-pilotage-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/logiciel-pilotage-restaurant.html"}],"marge-boissons-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/marge-boissons-restaurant.html"}],"marge-brute-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/marge-brute-restaurant.html"}],"marge-contribution-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/marge-contribution-restaurant.html"}],"marge-nette-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/marge-nette-restaurant.html"}],"marge-reelle-apres-commission-livraison.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/marge-reelle-apres-commission-livraison.html"}],"marge-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/marge-restaurant.html"}],"masse-salariale-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/masse-salariale-restaurant.html"}],"mentions-legales.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/mentions-legales.html"}],"menu-engineering-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/menu-engineering-restaurant.html"}],"merci.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/merci.html"}],"mon-histoire.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/mon-histoire.html"}],"ouvrir-restaurant-budget.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/ouvrir-restaurant-budget.html"}],"planning-personnel-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/planning-personnel-restaurant.html"}],"pourquoi-les-restaurants-ferment.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/pourquoi-les-restaurants-ferment.html"}],"previsionnel-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/previsionnel-restaurant.html"}],"prime-cost-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/prime-cost-restaurant.html"}],"prix-achat-fournisseur-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/prix-achat-fournisseur-restaurant.html"}],"prix-vente-plat-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/prix-vente-plat-restaurant.html"}],"productivite-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/productivite-restaurant.html"}],"quel-ca-pour-vivre-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/quel-ca-pour-vivre-restaurant.html"}],"rentabilite-bar-tapas.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-bar-tapas.html"}],"rentabilite-bar.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-bar.html"}],"rentabilite-bistrot.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-bistrot.html"}],"rentabilite-boulangerie.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-boulangerie.html"}],"rentabilite-brasserie.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-brasserie.html"}],"rentabilite-cantine.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-cantine.html"}],"rentabilite-carte-courte-vs-carte-longue.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-carte-courte-vs-carte-longue.html"}],"rentabilite-cocktail.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-cocktail.html"}],"rentabilite-coffee-shop.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-coffee-shop.html"}],"rentabilite-creperie.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-creperie.html"}],"rentabilite-food-truck.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-food-truck.html"}],"rentabilite-franchise-restauration.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-franchise-restauration.html"}],"rentabilite-glacier.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-glacier.html"}],"rentabilite-guinguette.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-guinguette.html"}],"rentabilite-hotel-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-hotel-restaurant.html"}],"rentabilite-kebab.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-kebab.html"}],"rentabilite-par-type-de-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-par-type-de-restaurant.html"}],"rentabilite-pizzeria.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-pizzeria.html"}],"rentabilite-pub.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-pub.html"}],"rentabilite-restaurant-asiatique.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-restaurant-asiatique.html"}],"rentabilite-restaurant-burger.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-restaurant-burger.html"}],"rentabilite-restaurant-gastronomique.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-restaurant-gastronomique.html"}],"rentabilite-restaurant-italien.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-restaurant-italien.html"}],"rentabilite-restaurant-mexicain.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-restaurant-mexicain.html"}],"rentabilite-restaurant-poisson.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-restaurant-poisson.html"}],"rentabilite-restaurant-saisonnier.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-restaurant-saisonnier.html"}],"rentabilite-restaurant-vegetarien.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-restaurant-vegetarien.html"}],"rentabilite-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-restaurant.html"}],"rentabilite-salon-de-the.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-salon-de-the.html"}],"rentabilite-snack.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-snack.html"}],"rentabilite-sushi.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-sushi.html"}],"rentabilite-traiteur.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-traiteur.html"}],"rentabilite-vente-emporter.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rentabilite-vente-emporter.html"}],"reprendre-restaurant-rentable.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/reprendre-restaurant-rentable.html"}],"restaurant-deficit-que-faire.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/restaurant-deficit-que-faire.html"}],"restaurant-pas-rentable.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/restaurant-pas-rentable.html"}],"rester-informe.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rester-informe.html"}],"retour-experience.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/retour-experience.html"}],"rotation-tables-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/rotation-tables-restaurant.html"}],"seuil-rentabilite-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/seuil-rentabilite-restaurant.html"}],"sources.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/sources.html"}],"support.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/support.html"}],"tableau-bord-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/tableau-bord-restaurant.html"}],"tarifs.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/tarifs.html"}],"taux-rotation-stock-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/taux-rotation-stock-restaurant.html"}],"ticket-moyen-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/ticket-moyen-restaurant.html"}],"tresorerie-restaurant.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/tresorerie-restaurant.html"}],"vera.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/vera.html"}],"verdict-methode.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/verdict-methode.html"}],"verdict-pro.html":[{"id":"current","label":"Verdict actuel","path":"../seo-pages/verdict-pro.html"},{"id":"presentation","label":"Présentation Verdict","path":"../decouvrir.html"}]};
  const scriptURL = document.currentScript && document.currentScript.src
    ? new URL(document.currentScript.src, location.href)
    : new URL('app-data.js', location.href);
  const appBase = new URL('.', scriptURL);
  const siteBase = new URL('../', appBase);
  const corpus = global.VERDICT_SEO_CORPUS;
  if (!corpus || !Array.isArray(corpus.pages) || corpus.pages.length !== corpus.count) {
    throw new Error('Le corpus Verdict est absent ou incohérent. Chargez seo-corpus-v24.js avant app-data.js.');
  }
  const normalize = value => String(value == null ? '' : value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr').replace(/[^a-z0-9]+/g, ' ').trim();
  const pages = Object.freeze(corpus.pages.map(page => Object.freeze({
    ...page,
    canonicalSlug: page.canonicalPath || page.slug,
    isAlias: Boolean(page.alias),
    versions: Object.freeze((versionManifest[page.slug] || []).map(version => Object.freeze({ ...version })))
  })));
  const pageBySlug = new Map(pages.map(page => [page.slug, page]));
  const pageById = new Map(pages.map(page => [page.id, page]));
  const groups = Object.freeze([...new Set(pages.filter(page => !page.alias)
    .map(page => page.navigationGroup || page.cluster || 'Autres'))]);

  function resolvePage(input) {
    const key = typeof input === 'string' ? input : input && (input.slug || input.id);
    const page = pageBySlug.get(key) || pageById.get(key);
    if (!page) throw new Error('Page absente du corpus Verdict : ' + String(key || 'aucune page'));
    return page;
  }
  function getVersion(input, versionId = 'current') {
    const page = resolvePage(input);
    const version = page.versions.find(item => item.id === versionId);
    if (!version) throw new Error('Version locale indisponible pour cette page : ' + String(versionId));
    return version;
  }
  function versionURL(input, versionId = 'current') {
    const version = getVersion(input, versionId);
    const url = new URL(version.path, appBase);
    if (url.origin !== siteBase.origin || !url.pathname.startsWith(siteBase.pathname) || !/\.html$/i.test(url.pathname)) {
      throw new Error('Chemin de source locale refusé.');
    }
    return url;
  }
  const SOURCE_CACHE_LIMIT = 32;
  const SOURCE_REQUEST_TIMEOUT_MS = 12000;
  const verifiedSourceCache = new Map();
  function sourceAbortError(signal, fallback = 'Lecture de la source annulée.') {
    if (signal && signal.reason instanceof Error) return signal.reason;
    const error = new Error(fallback); error.name = 'AbortError'; return error;
  }
  function clearSourceCache() {
    for (const entry of verifiedSourceCache.values()) {
      if (!entry.settled && entry.controller) entry.controller.abort(sourceAbortError(null));
    }
    verifiedSourceCache.clear();
  }
  function retainSourceEntry(key, entry) {
    verifiedSourceCache.delete(key); verifiedSourceCache.set(key, entry);
    while (verifiedSourceCache.size > SOURCE_CACHE_LIMIT) verifiedSourceCache.delete(verifiedSourceCache.keys().next().value);
  }
  function consumeSourceEntry(entry, signal) {
    if (signal && signal.aborted) return Promise.reject(sourceAbortError(signal));
    return new Promise((resolve, reject) => {
      const token = {}; let finished = false;
      entry.consumers.add(token);
      function release() {
        entry.consumers.delete(token);
        if (signal) signal.removeEventListener('abort', abort);
        if (!entry.settled && entry.consumers.size === 0) {
          if (entry.cacheKey && verifiedSourceCache.get(entry.cacheKey) === entry) verifiedSourceCache.delete(entry.cacheKey);
          if (entry.controller) entry.controller.abort(sourceAbortError(signal));
        }
      }
      function finish(callback, value) {
        if (finished) return; finished = true; release(); callback(value);
      }
      function abort() { finish(reject, sourceAbortError(signal)); }
      if (signal) signal.addEventListener('abort', abort, { once: true });
      entry.promise.then(value => finish(resolve, value), error => finish(reject, error));
      // Handles an abort fired between the initial check and registration.
      if (signal && signal.aborted) abort();
    });
  }
  function createSourceEntry(url, expectedHash, cacheKey) {
    const controller = typeof global.AbortController === 'function' ? new global.AbortController() : null;
    const entry = { controller, cacheKey, consumers: new Set(), settled: false, promise: null };
    let timer;
    const task = (async () => {
      const response = await fetch(url.href, { cache: 'no-store', credentials: 'same-origin', redirect: 'error', ...(controller ? { signal: controller.signal } : {}) });
      if (!response.ok) throw new Error('Source HTML indisponible : HTTP ' + response.status);
      if (new URL(response.url || url.href).origin !== siteBase.origin) throw new Error('La source ne provient pas du site local.');
      const html = await response.text();
      if (!/^\s*<!doctype\s+html(?:\s|>)/i.test(html) || !/<html(?:\s|>)/i.test(html)) throw new Error('La source ne contient pas de document HTML complet.');
      if (expectedHash) {
        const integrity = global.VerdictSourceIntegrity;
        if (!integrity || typeof integrity.sha256 !== 'function') throw new Error('Le module de vérification des sources est indisponible. Rechargez l’application.');
        const actualHash = await integrity.sha256(html);
        // A mismatch is never a reason to accept a fallback or skip verification.
        if (String(actualHash).toLowerCase() !== expectedHash) throw new Error('La source actuelle diffère de son empreinte vérifiée. Synchronisez le corpus avant de continuer.');
      }
      if (controller && controller.signal.aborted) throw sourceAbortError(controller.signal);
      return html;
    })();
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => {
        const error = new Error('Le fichier source ne répond pas dans le délai prévu. Réessayez.'); error.name = 'TimeoutError';
        if (controller) controller.abort(error);
        reject(error);
      }, SOURCE_REQUEST_TIMEOUT_MS);
    });
    entry.promise = Promise.race([task, deadline]).then(html => {
      entry.settled = true; return html;
    }, error => {
      entry.settled = true;
      if (cacheKey && verifiedSourceCache.get(cacheKey) === entry) verifiedSourceCache.delete(cacheKey);
      throw error;
    }).finally(() => clearTimeout(timer));
    return entry;
  }
  async function loadSource(input, versionId = 'current', options = {}) {
    const page = resolvePage(input), signal = options && options.signal;
    if (signal && signal.aborted) throw sourceAbortError(signal);
    const url = versionURL(page, versionId);
    let expectedHash = null;
    if (versionId === 'current') {
      if (!/^[a-f0-9]{64}$/i.test(String(page.sha256 || ''))) throw new Error('L’empreinte de cette source actuelle est absente ou invalide. Synchronisez le corpus.');
      expectedHash = String(page.sha256).toLowerCase();
    }
    // Only verified current sources are cached, under their immutable identity.
    const key = expectedHash ? 'current|' + url.href + '|' + expectedHash : null;
    let entry = key ? verifiedSourceCache.get(key) : null;
    if (!entry) {
      entry = createSourceEntry(url, expectedHash, key);
      if (key) retainSourceEntry(key, entry);
    } else retainSourceEntry(key, entry);
    return consumeSourceEntry(entry, signal);
  }
  function cleanText(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
  function attributeValues(doc, selector, attribute) {
    return [...doc.querySelectorAll(selector)].map(node => cleanText(node.getAttribute(attribute))).filter(Boolean);
  }
  async function audit(input, options = {}) {
    const page = resolvePage(input);
    const hasDraft = Object.prototype.hasOwnProperty.call(options, 'html');
    if (hasDraft && typeof options.html !== 'string') throw new Error('Le brouillon à auditer doit être une chaîne HTML.');
    const html = hasDraft ? options.html : await loadSource(page);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const sourceURL = versionURL(page);
    const title = cleanText(doc.title);
    const description = cleanText(doc.querySelector('meta[name="description" i]')?.content);
    const canonical = cleanText(doc.querySelector('link[rel~="canonical" i]')?.getAttribute('href'));
    const h1s = [...doc.querySelectorAll('h1')].map(node => cleanText(node.textContent));
    const h2Count = doc.querySelectorAll('h2').length;
    const robots = attributeValues(doc, 'meta[name="robots" i],meta[name="googlebot" i]', 'content').join(', ');
    const noindex = /(?:^|[\s,])(?:noindex|none)(?:$|[\s,])/i.test(robots);
    const bodyCopy = (doc.querySelector('main') || doc.body).cloneNode(true);
    bodyCopy.querySelectorAll('script,style,noscript,template,svg,[hidden],[aria-hidden="true"]').forEach(node => node.remove());
    const visibleText = cleanText(bodyCopy.textContent);
    const wordCount = (visibleText.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) || []).length;
    const imageNodes = [...doc.querySelectorAll('img')];
    const missingAltNodes = imageNodes.filter(node => !node.hasAttribute('alt'));
    const imageDetails = imageNodes.map(node => ({
      src: cleanText(node.getAttribute('src')),
      alt: node.hasAttribute('alt') ? node.getAttribute('alt') : null,
      decorative: node.hasAttribute('alt') && node.getAttribute('alt').trim() === ''
    }));
    const links = { total: 0, internal: 0, external: 0, fragmentOnly: 0, contact: 0, invalid: 0, missingLocalAnchors: [] };
    const localLinks = [];
    for (const anchor of doc.querySelectorAll('a[href]')) {
      const href = cleanText(anchor.getAttribute('href'));
      links.total++;
      if (!href) { links.invalid++; continue; }
      if (/^(?:mailto:|tel:)/i.test(href)) { links.contact++; continue; }
      let url;
      try { url = new URL(href, sourceURL); } catch (_) { links.invalid++; continue; }
      if (!['http:', 'https:', 'file:'].includes(url.protocol)) { links.invalid++; continue; }
      if (url.origin !== siteBase.origin) { links.external++; continue; }
      links.internal++;
      if (href.startsWith('#')) links.fragmentOnly++;
      localLinks.push({ href, path: url.pathname, fragment: url.hash });
      if (url.pathname === sourceURL.pathname && url.hash) {
        let target;
        try { target = decodeURIComponent(url.hash.slice(1)); } catch (_) { links.invalid++; continue; }
        if (!doc.getElementById(target) && ![...doc.querySelectorAll('[name]')].some(node => node.getAttribute('name') === target)) {
          links.missingLocalAnchors.push(href);
        }
      }
    }
    const jsonLdNodes = [...doc.querySelectorAll('script[type="application/ld+json"]')];
    const jsonLdErrors = [];
    jsonLdNodes.forEach((node, index) => { try { JSON.parse(node.textContent); } catch (_) { jsonLdErrors.push(index + 1); } });
    const ids = [...doc.querySelectorAll('[id]')].map(node => node.id);
    const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    const refresh = cleanText(doc.querySelector('meta[http-equiv="refresh" i]')?.content);
    const declaredIndexable = page.indexable !== false && !page.alias;
    let canonicalValid = false;
    if (canonical) { try { canonicalValid = ['http:', 'https:'].includes(new URL(canonical, sourceURL).protocol); } catch (_) {} }
    const checks = [
      { id: 'title', label: 'Titre de la page', status: title ? 'pass' : 'warn', detail: title || 'Aucune balise title renseignée.' },
      { id: 'description', label: 'Description', status: description ? 'pass' : 'warn', detail: description || 'Aucune méta description renseignée.' },
      { id: 'h1', label: 'Titre principal', status: h1s.length === 1 && h1s[0] ? 'pass' : 'warn', detail: h1s.length + ' H1 trouvé(s). Un titre principal unique facilite la lecture de cette page.' },
      { id: 'canonical', label: 'Adresse canonique', status: canonicalValid ? 'pass' : 'warn', detail: canonical ? canonical + ' — présence et syntaxe seulement ; le domaine de publication reste à confirmer.' : 'Aucune adresse canonique renseignée.' },
      { id: 'robots', label: 'Consigne d’indexation', status: 'info', detail: noindex ? 'Le HTML demande noindex. Cela peut être voulu pour cette version de travail.' : 'Aucune interdiction noindex détectée dans les métas. Les en-têtes HTTP, robots.txt et l’indexation Google ne sont pas vérifiés.' },
      { id: 'image-alt', label: 'Alternatives des images', status: missingAltNodes.length ? 'warn' : 'pass', detail: missingAltNodes.length ? missingAltNodes.length + ' image(s) sans attribut alt.' : imageNodes.length + ' image(s) ; attribut alt présent, y compris les images décoratives. La pertinence du texte reste à relire.' },
      { id: 'anchors', label: 'Ancres locales de la page', status: links.missingLocalAnchors.length ? 'warn' : 'pass', detail: links.missingLocalAnchors.length ? links.missingLocalAnchors.length + ' ancre(s) introuvable(s) dans ce document.' : 'Aucune ancre interne manquante détectée dans ce document. Les autres pages ne sont pas téléchargées.' },
      { id: 'links', label: 'Liens du document', status: links.invalid ? 'warn' : 'info', detail: links.internal + ' lien(s) local(aux), ' + links.external + ' externe(s), ' + links.contact + ' de contact et ' + links.invalid + ' vide(s) ou non analysable(s). Aucun site externe n’a été interrogé.' },
      { id: 'jsonld', label: 'Données structurées', status: jsonLdErrors.length ? 'warn' : 'info', detail: jsonLdErrors.length ? 'JSON invalide dans ' + jsonLdErrors.length + ' bloc(s).' : jsonLdNodes.length + ' bloc(s) JSON-LD syntaxiquement lisible(s). Cela ne valide pas leur admissibilité aux résultats enrichis.' },
      { id: 'ids', label: 'Identifiants HTML', status: duplicateIds.length ? 'warn' : 'pass', detail: duplicateIds.length ? duplicateIds.length + ' identifiant(s) dupliqué(s).' : 'Aucun identifiant dupliqué.' },
      { id: 'content', label: 'Contenu textuel', status: 'info', detail: wordCount + ' mots dans le contenu principal, hors scripts et éléments explicitement masqués. Le nombre de mots ne mesure pas la qualité.' },
      { id: 'source', label: 'Périmètre du contrôle', status: 'info', detail: hasDraft ? 'Brouillon fourni à l’audit : il ne remplace pas la source livrée et son empreinte n’est pas vérifiée.' : 'HTML actuel chargé depuis le manifeste local et contrôlé par SHA-256 lorsque l’empreinte est fournie.' }
    ];
    if (page.alias || refresh) checks.unshift({ id: 'redirect', label: 'Adresse de redirection', status: 'info', detail: 'Alias du corpus vers ' + (page.canonicalPath || 'destination à vérifier') + (refresh ? '. Rafraîchissement HTML : ' + refresh : '.') });
    return {
      pageId: page.id, slug: page.slug, title, description, canonical, h1s, h2Count, robots,
      wordCount, images: imageNodes.length, missingAlt: missingAltNodes.length, imageDetails,
      links, linkCount: links.total, localLinks, duplicateIds,
      jsonLdCount: jsonLdNodes.length, jsonLdErrors,
      alias: Boolean(page.alias), redirect: refresh || null,
      declaredIndexable, metaAllowsIndex: !noindex,
      indexability: { declared: declaredIndexable, metaAllowsIndex: !noindex, robotsTxtChecked: false, httpHeadersChecked: false, googleChecked: false },
      sourceKind: hasDraft ? 'draft' : 'current', checks, checkedAt: new Date().toISOString(),
      limits: 'Constats structurels du HTML. Aucun score Google, positionnement, trafic, validation réglementaire ou performance terrain n’est mesuré.'
    };
  }
  global.VerdictSEOData = Object.freeze({
    pages, groups, normalize, resolvePage, getVersion, loadSource, clearSourceCache, audit,
    versionURL: (page, versionId = 'current') => versionURL(page, versionId).href,
    corpusInfo: Object.freeze({ count: pages.length, canonicalCount: pages.filter(page => !page.alias).length,
      aliasCount: pages.filter(page => page.alias).length, sourceRelease: corpus.release || null })
  });
})(window);

/* Verdict SEO — revue locale. Aucune donnée n’est envoyée à un serveur. */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'verdict:seo:review-app:v1';
  var SCHEMA = 'verdict-seo-review/v1';
  var MAX_BYTES = 5 * 1024 * 1024;
  var MAX_NOTES = 20000;
  var STATUSES = ['todo', 'review', 'changes', 'approved'];
  var CHECK_KEYS = ['desktop', 'mobile', 'sources', 'calculation', 'content'];
  var RECORD_KEYS = ['status', 'notes', 'favorite', 'checks', 'updatedAt'];
  var PATCH_KEYS = ['status', 'notes', 'favorite', 'checks'];
  var listeners = new Set();
  var owns = Function.call.bind(Object.prototype.hasOwnProperty);

  function fail(code, message) {
    var error = new Error(message);
    error.code = code;
    return error;
  }

  function plainObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    var prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function assertObject(value, allowed, required, label) {
    if (!plainObject(value)) throw fail('INVALID_DATA', label + ' : objet simple attendu.');
    Reflect.ownKeys(value).forEach(function (key) {
      if (typeof key !== 'string' || allowed.indexOf(key) === -1) {
        throw fail('INVALID_DATA', label + ' : champ non autorisé.');
      }
      var descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !owns(descriptor, 'value')) {
        throw fail('INVALID_DATA', label + ' : les accesseurs ne sont pas acceptés.');
      }
    });
    required.forEach(function (key) {
      if (!owns(value, key)) throw fail('INVALID_DATA', label + ' : champ requis absent (' + key + ').');
    });
  }

  function knownSlugs() {
    var data = global.VerdictSEOData;
    if (!data || !Array.isArray(data.pages) || !data.pages.length) {
      throw fail('CATALOGUE_UNAVAILABLE', 'Le catalogue des pages SEO est indisponible. Rechargez l’application avant de sauvegarder.');
    }
    var slugs = Object.create(null);
    data.pages.forEach(function (page) {
      if (page && typeof page.slug === 'string' && page.slug &&
          ['__proto__', 'prototype', 'constructor'].indexOf(page.slug) === -1) {
        slugs[page.slug] = true;
      }
    });
    return slugs;
  }

  function assertSlug(slug, slugs) {
    if (typeof slug !== 'string' || !owns(slugs || knownSlugs(), slug)) {
      throw fail('UNKNOWN_SLUG', 'Cette page ne fait pas partie du catalogue SEO chargé.');
    }
  }

  function defaultChecks() {
    var checks = Object.create(null);
    CHECK_KEYS.forEach(function (key) { checks[key] = false; });
    return checks;
  }

  function defaultRecord() {
    return { status: 'todo', notes: '', favorite: false, checks: defaultChecks(), updatedAt: null };
  }

  function cloneRecord(record) {
    var result = defaultRecord();
    result.status = record.status;
    result.notes = record.notes;
    result.favorite = record.favorite;
    result.updatedAt = record.updatedAt;
    CHECK_KEYS.forEach(function (key) { result.checks[key] = record.checks[key]; });
    return result;
  }

  function cloneReviews(reviews) {
    var result = Object.create(null);
    Object.keys(reviews).forEach(function (slug) { result[slug] = cloneRecord(reviews[slug]); });
    return result;
  }

  function isTimestamp(value) {
    if (typeof value !== 'string' || value.length > 35) return false;
    var time = new Date(value);
    return Number.isFinite(time.getTime()) && time.toISOString() === value;
  }

  function validateCheckValues(checks, complete) {
    assertObject(checks, CHECK_KEYS, complete ? CHECK_KEYS : [], 'Contrôles');
    Object.keys(checks).forEach(function (key) {
      if (typeof checks[key] !== 'boolean') throw fail('INVALID_DATA', 'Chaque contrôle doit être un booléen explicite.');
    });
  }

  function allChecks(record) {
    return CHECK_KEYS.every(function (key) { return record.checks[key] === true; });
  }

  function validateRecord(record) {
    assertObject(record, RECORD_KEYS, RECORD_KEYS, 'Revue');
    if (STATUSES.indexOf(record.status) === -1) throw fail('INVALID_DATA', 'Le statut de revue est invalide.');
    if (typeof record.notes !== 'string' || record.notes.length > MAX_NOTES) {
      throw fail('INVALID_DATA', 'Les notes doivent être un texte de 20 000 caractères maximum.');
    }
    if (typeof record.favorite !== 'boolean') throw fail('INVALID_DATA', 'Le favori doit être un booléen.');
    validateCheckValues(record.checks, true);
    if (record.updatedAt !== null && !isTimestamp(record.updatedAt)) {
      throw fail('INVALID_DATA', 'La date de revue doit être une date ISO valide ou null.');
    }
    if (record.status === 'approved' && !allChecks(record)) {
      throw fail('APPROVAL_INCOMPLETE', 'Validation impossible : ordinateur, mobile, sources, calcul et contenu doivent être contrôlés séparément.');
    }
    return cloneRecord(record);
  }

  function byteLength(value) {
    return new TextEncoder().encode(value).byteLength;
  }

  function parseEnvelope(input) {
    var value = input;
    if (typeof input === 'string') {
      if (byteLength(input) > MAX_BYTES) throw fail('IMPORT_TOO_LARGE', 'Le fichier de revue dépasse la limite de 5 Mo.');
      try { value = JSON.parse(input); }
      catch (error) { throw fail('INVALID_JSON', 'Le fichier de revue ne contient pas un JSON valide.'); }
    }
    assertObject(value, ['schema', 'exportedAt', 'reviews'], ['schema', 'exportedAt', 'reviews'], 'Fichier de revue');
    if (value.schema !== SCHEMA) throw fail('INVALID_SCHEMA', 'Le format du fichier de revue n’est pas reconnu.');
    if (!isTimestamp(value.exportedAt)) throw fail('INVALID_DATA', 'La date d’export n’est pas une date ISO valide.');
    if (!plainObject(value.reviews)) throw fail('INVALID_DATA', 'La liste des revues doit être un objet.');
    var slugs = knownSlugs(), clean = Object.create(null);
    Reflect.ownKeys(value.reviews).forEach(function (slug) {
      assertSlug(slug, slugs);
      var descriptor = Object.getOwnPropertyDescriptor(value.reviews, slug);
      if (!descriptor || !owns(descriptor, 'value')) throw fail('INVALID_DATA', 'Une revue ne peut pas être un accesseur.');
      clean[slug] = validateRecord(descriptor.value);
    });
    var normalized = { schema: SCHEMA, exportedAt: value.exportedAt, reviews: clean };
    // Validate object imports without invoking getters, toJSON, or user-supplied serializers.
    if (byteLength(JSON.stringify(normalized)) > MAX_BYTES) {
      throw fail('IMPORT_TOO_LARGE', 'Le fichier de revue dépasse la limite de 5 Mo.');
    }
    return normalized;
  }

  function unavailable(error) {
    var quota = error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22 || error.code === 1014);
    return fail(quota ? 'STORAGE_QUOTA' : 'STORAGE_UNAVAILABLE', quota
      ? 'Enregistrement impossible : le stockage local est plein. Exportez vos revues avant de libérer de l’espace.'
      : 'Le stockage local est indisponible. Autorisez-le dans ce navigateur pour enregistrer vos revues.');
  }

  function readReviews() {
    var stored;
    try { stored = global.localStorage.getItem(STORAGE_KEY); }
    catch (error) { throw unavailable(error); }
    if (stored === null) return Object.create(null);
    try { return parseEnvelope(stored).reviews; }
    catch (error) {
      throw fail('CORRUPT_STORAGE', 'Les revues locales sont invalides. Aucune donnée n’a été écrasée. Utilisez une sauvegarde de revue valide.');
    }
  }

  function reportListenerError(error) {
    if (typeof global.reportError === 'function') global.reportError(error);
    else global.setTimeout(function () { throw error; }, 0);
  }

  function notify(reviews, event) {
    listeners.forEach(function (listener) {
      try { listener(cloneReviews(reviews), Object.assign({}, event)); }
      catch (error) { reportListenerError(error); }
    });
  }

  function commit(reviews, event) {
    var envelope = { schema: SCHEMA, exportedAt: new Date().toISOString(), reviews: reviews };
    var serialized = JSON.stringify(envelope);
    if (byteLength(serialized) > MAX_BYTES) {
      throw fail('STORAGE_LIMIT', 'Enregistrement impossible : les revues dépassent la limite de 5 Mo. Exportez et allégez vos notes.');
    }
    try { global.localStorage.setItem(STORAGE_KEY, serialized); }
    catch (error) { throw unavailable(error); }
    notify(reviews, event);
  }

  function get(slug) {
    assertSlug(slug);
    var reviews = readReviews();
    return owns(reviews, slug) ? cloneRecord(reviews[slug]) : defaultRecord();
  }

  function set(slug, patch) {
    assertSlug(slug);
    assertObject(patch, PATCH_KEYS, [], 'Modification');
    if (owns(patch, 'status') && STATUSES.indexOf(patch.status) === -1) throw fail('INVALID_DATA', 'Le statut de revue est invalide.');
    if (owns(patch, 'notes') && (typeof patch.notes !== 'string' || patch.notes.length > MAX_NOTES)) {
      throw fail('INVALID_DATA', 'Les notes doivent être un texte de 20 000 caractères maximum.');
    }
    if (owns(patch, 'favorite') && typeof patch.favorite !== 'boolean') throw fail('INVALID_DATA', 'Le favori doit être un booléen.');
    if (owns(patch, 'checks')) validateCheckValues(patch.checks, false);
    var reviews = readReviews();
    var current = owns(reviews, slug) ? cloneRecord(reviews[slug]) : defaultRecord();
    ['status', 'notes', 'favorite'].forEach(function (key) { if (owns(patch, key)) current[key] = patch[key]; });
    if (owns(patch, 'checks')) CHECK_KEYS.forEach(function (key) {
      if (owns(patch.checks, key)) current.checks[key] = patch.checks[key];
    });
    if (current.status === 'approved' && !allChecks(current)) {
      if (patch.status === 'approved') {
        throw fail('APPROVAL_INCOMPLETE', 'Validation impossible : contrôlez séparément ordinateur, mobile, sources, calcul et contenu.');
      }
      // A formerly approved review cannot remain approved after a check is withdrawn.
      current.status = 'review';
    }
    current.updatedAt = new Date().toISOString();
    reviews[slug] = validateRecord(current);
    commit(reviews, { type: 'set', slug: slug });
    return cloneRecord(current);
  }

  function all() { return cloneReviews(readReviews()); }

  function subscribe(listener) {
    if (typeof listener !== 'function') throw fail('INVALID_LISTENER', 'Un abonnement doit être une fonction.');
    listeners.add(listener);
    return function () { listeners.delete(listener); };
  }

  function exportData() {
    return { schema: SCHEMA, exportedAt: new Date().toISOString(), reviews: cloneReviews(readReviews()) };
  }

  function importData(input) {
    // The entire document is checked before reading or writing existing state.
    var imported = parseEnvelope(input).reviews;
    var merged = readReviews();
    Object.keys(imported).forEach(function (slug) { merged[slug] = cloneRecord(imported[slug]); });
    commit(merged, { type: 'import' });
    return { imported: Object.keys(imported).length, total: Object.keys(merged).length };
  }

  global.addEventListener('storage', function (event) {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    try {
      if (event.storageArea && event.storageArea !== global.localStorage) return;
      var reviews = event.newValue === null ? Object.create(null) : parseEnvelope(event.newValue).reviews;
      notify(reviews, { type: 'external' });
    } catch (error) {
      // Invalid external data never becomes application state or an apparent success.
      listeners.forEach(function (listener) {
        try { listener(null, { type: 'external-error', error: fail('CORRUPT_STORAGE', 'Une autre fenêtre a fourni des revues invalides. Aucune validation n’a été appliquée.') }); }
        catch (listenerError) { reportListenerError(listenerError); }
      });
    }
  });

  global.VerdictSEOStore = Object.freeze({
    get: get,
    set: set,
    all: all,
    subscribe: subscribe,
    exportData: exportData,
    importData: importData
  });
})(window);

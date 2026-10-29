/* Verdict SEO — actualisation automatique, après enregistrement et fin de saisie. */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;

  const QUIET_MS = 2000;
  const CHECK_INTERVAL_MS = 10 * 60 * 1000;
  const RETRY_MS = 5000;
  const RELOAD_KEY = 'verdict:seo:auto-update:last-reloaded';
  let registration = null, waiting = null, retryTimer = null, checkTimer = null;
  let lastInput = 0, lastCheck = 0, lastRequest = 0, composing = false;
  let pendingReload = false, reloading = false, checking = false, wantedVersion = '';
  let controlledBy = navigator.serviceWorker.controller;
  let status = 'initializing', statusNode = null;
  let migrationTimer = null, migrating = false, migrationReload = false;
  const rootScope = new URL('../', location.href).href;
  const rootWorkerURL = new URL('../sw.js', location.href).href;
  const legacyScope = new URL('./', location.href).href;
  const legacyWorkerURL = new URL('sw.js', location.href).href;

  function setStatus(next, message) {
    status = next;
    if (!statusNode) {
      statusNode = document.createElement('div');
      statusNode.id = 'appUpdateStatus';
      statusNode.setAttribute('role', 'status');
      statusNode.setAttribute('aria-live', 'polite');
      statusNode.style.cssText = 'margin-top:8px;font-size:10px;line-height:1.6;color:#7d8795;';
      const host = document.querySelector('.storage-note') || document.querySelector('.sidebar-bottom');
      if (host) host.append(statusNode);
    }
    statusNode.dataset.state = next;
    if (statusNode.textContent !== message) statusNode.textContent = message;
  }

  function activeEditable() {
    let element = document.activeElement;
    for (let depth = 0; element && element.tagName === 'IFRAME' && depth < 4; depth++) {
      try { element = element.contentDocument && element.contentDocument.activeElement; }
      catch (_) { return true; }
    }
    if (!element) return false;
    if (element.isContentEditable || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') return true;
    return element.tagName === 'INPUT' && !/^(?:button|submit|reset|checkbox|radio|image|hidden)$/i.test(element.type);
  }

  function locallyIdle() {
    if (composing || Date.now() - lastInput < QUIET_MS) return false;
    // Background windows can safely save their existing draft too. A visible
    // text cursor, including inside an embedded calculator, is never interrupted.
    if (document.visibilityState !== 'hidden' && activeEditable()) return false;
    if (document.querySelector('dialog[open]')) return false;
    return true;
  }

  async function prepareNotes(version) {
    const pending = [];
    const detail = {
      version, handled: false, reason: '',
      waitUntil(promise) { pending.push(Promise.resolve(promise)); }
    };
    const event = new CustomEvent('verdict:before-update', { detail, cancelable: true });
    window.dispatchEvent(event);
    // Fail closed unless the application explicitly acknowledges its saving hook.
    if (!detail.handled) return { ready: false, reason: 'La sauvegarde de cette fenêtre doit être confirmée avant l’actualisation.' };
    if (event.defaultPrevented) return { ready: false, reason: detail.reason || 'Une opération ou une sauvegarde est encore en cours.' };
    if (pending.length) {
      try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(Error('saving-timeout')), 5000));
        const values = await Promise.race([Promise.all(pending), timeout]);
        if (values.some(value => value === false)) return { ready: false, reason: 'Les dernières modifications ne sont pas encore enregistrées.' };
      } catch (_) {
        return { ready: false, reason: 'Les dernières modifications ne sont pas encore enregistrées.' };
      }
    }
    return { ready: locallyIdle(), reason: '' };
  }

  function retrySoon() {
    clearTimeout(retryTimer);
    retryTimer = setTimeout(attemptUpdate, RETRY_MS);
  }

  async function attemptUpdate() {
    clearTimeout(retryTimer);
    if (reloading) return;
    if (pendingReload) {
      if (!locallyIdle()) {
        setStatus('deferred', 'Nouvelle version prête. Actualisation après la saisie en cours.');
        retrySoon();
        return;
      }
      const prepared = await prepareNotes(wantedVersion);
      if (!prepared.ready) {
        setStatus('deferred', 'Actualisation différée : ' + (prepared.reason || 'votre travail reste ouvert.'));
        retrySoon();
        return;
      }
      if (!wantedVersion) { retrySoon(); return; }
      try {
        const reloadKey = migrationReload ? RELOAD_KEY + ':root-scope' : RELOAD_KEY;
        const reloadValue = migrationReload ? rootScope + wantedVersion : wantedVersion;
        if (sessionStorage.getItem(reloadKey) === reloadValue) {
          pendingReload = false;
          setStatus('current', 'Version actuelle conservée. Mises à jour automatiques activées.');
          return;
        }
        sessionStorage.setItem(reloadKey, reloadValue);
      } catch (_) { /* The in-memory lock still prevents a reload loop. */ }
      reloading = true;
      setStatus('applying', 'Modifications enregistrées. Actualisation de l’interface…');
      location.reload();
      return;
    }
    waiting = registration && registration.waiting;
    if (!waiting) return;
    if (!locallyIdle()) {
      setStatus('deferred', 'Nouvelle version prête. Actualisation après la saisie en cours.');
      retrySoon();
      return;
    }
    const localPreparation = await prepareNotes(wantedVersion);
    if (!localPreparation.ready) {
      setStatus('deferred', 'Actualisation différée : ' + (localPreparation.reason || 'une sauvegarde est encore en cours.'));
      retrySoon();
      return;
    }
    if (Date.now() - lastRequest < 3000) { retrySoon(); return; }
    lastRequest = Date.now();
    setStatus('preparing', 'Nouvelle version prête. Vérification des sauvegardes ouvertes…');
    waiting.postMessage({ type: 'VERDICT_REQUEST_UPDATE' });
    retrySoon();
  }

  function workerVersion(worker) {
    return new Promise(resolve => {
      if (!worker) return resolve('');
      const channel = new MessageChannel();
      const timer = setTimeout(() => { channel.port1.close(); resolve(''); }, 1500);
      channel.port1.onmessage = event => {
        clearTimeout(timer); channel.port1.close();
        resolve(event.data && typeof event.data.version === 'string' ? event.data.version : '');
      };
      worker.postMessage({ type: 'VERDICT_GET_VERSION' }, [channel.port2]);
    });
  }

  navigator.serviceWorker.addEventListener('message', async event => {
    const message = event.data || {};
    if (message.type === 'VERDICT_OFFLINE_PROGRESS' || message.type === 'VERDICT_OFFLINE_READY') {
      window.dispatchEvent(new CustomEvent('verdict:offline-progress', { detail: message }));
    }
    if (message.type === 'VERDICT_UPDATE_PREPARE' && event.ports && event.ports[0]) {
      wantedVersion = message.version || '';
      const prepared = locallyIdle() ? await prepareNotes(wantedVersion) : { ready: false, reason: '' };
      event.ports[0].postMessage({ ready: prepared.ready, token: message.token });
      event.ports[0].close();
      if (!prepared.ready) setStatus('deferred', prepared.reason ? 'Actualisation différée : ' + prepared.reason : 'Nouvelle version prête. Actualisation après la saisie en cours.');
    } else if (message.type === 'VERDICT_UPDATE_DEFERRED') {
      wantedVersion = message.version || wantedVersion;
      setStatus('deferred', 'Nouvelle version prête. Une fenêtre termine une saisie ou une opération.');
      retrySoon();
    }
  });

  navigator.serviceWorker.addEventListener('controllerchange', async () => {
    const hadController = Boolean(controlledBy);
    controlledBy = navigator.serviceWorker.controller;
    if (!hadController) {
      setStatus('current', 'Version hors ligne vérifiée. Mises à jour automatiques activées.');
      return;
    }
    wantedVersion = await workerVersion(controlledBy) || wantedVersion;
    pendingReload = true;
    attemptUpdate();
  });

  function observeInstalling(worker) {
    if (!worker) return;
    setStatus('downloading', 'Les pages et l’interface de la nouvelle version sont en téléchargement…');
    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') {
        migrateLegacy();
      } else if (worker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          waiting = registration.waiting || worker;
          setStatus('ready', 'Pages et interface téléchargées. Vos notes sont conservées.');
          attemptUpdate();
        }
      } else if (worker.state === 'redundant' && registration && !registration.waiting) {
        setStatus('error', 'Mise à jour non préparée. La version actuelle est conservée.');
      }
    });
  }

  async function check(force) {
    if (!registration || checking) return;
    if (!navigator.onLine) { setStatus('offline', 'Mises à jour en attente de connexion.'); return; }
    if (!force && Date.now() - lastCheck < 60000) return;
    checking = true; lastCheck = Date.now();
    setStatus('checking', 'Vérification de la version complète…');
    try {
      await registration.update();
      if (registration.installing) observeInstalling(registration.installing);
      else if (registration.waiting) {
        waiting = registration.waiting;
        setStatus('ready', 'Pages et interface téléchargées. Vos notes sont conservées.');
        attemptUpdate();
      } else if (!pendingReload) {
        setStatus('current', 'Mises à jour automatiques activées.');
      }
    } catch (_) {
      setStatus('error', 'Vérification impossible. La version installée est conservée.');
    } finally {
      checking = false;
    }
  }

  function activity() { lastInput = Date.now(); if (waiting || pendingReload) retrySoon(); }
  document.addEventListener('input', activity, true);
  document.addEventListener('compositionstart', () => { composing = true; activity(); }, true);
  document.addEventListener('compositionend', () => { composing = false; activity(); }, true);
  document.addEventListener('focusout', () => { if (waiting || pendingReload) retrySoon(); }, true);
  document.addEventListener('close', () => { if (waiting || pendingReload) retrySoon(); }, true);
  window.addEventListener('verdict:update-safe', attemptUpdate);
  window.addEventListener('online', () => check(true));
  window.addEventListener('offline', () => setStatus('offline', 'Mises à jour en attente de connexion.'));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check(false);
    if (waiting || pendingReload) attemptUpdate();
  });
  window.addEventListener('pageshow', event => { if (event.persisted) check(false); });

  function workerRequest(worker, type, timeoutMs = 12000) {
    return new Promise(resolve => {
      if (!worker) return resolve(null);
      const channel = new MessageChannel();
      const timer = setTimeout(() => { channel.port1.close(); resolve(null); }, timeoutMs);
      channel.port1.onmessage = event => { clearTimeout(timer); channel.port1.close(); resolve(event.data || null); };
      try { worker.postMessage({ type }, [channel.port2]); }
      catch (_) { clearTimeout(timer); channel.port1.close(); resolve(null); }
    });
  }

  function retryMigration() {
    clearTimeout(migrationTimer);
    migrationTimer = setTimeout(migrateLegacy, RETRY_MS);
  }

  async function migrateLegacy() {
    if (migrating || !registration || registration.scope !== rootScope) return;
    const active = registration.active;
    if (!active || active.state !== 'activated' || active.scriptURL !== rootWorkerURL) { retryMigration(); return; }
    migrating = true;
    try {
      const legacy = (await navigator.serviceWorker.getRegistrations()).filter(reg => {
        const script = reg.active || reg.waiting || reg.installing;
        return reg.scope === legacyScope && script && script.scriptURL === legacyWorkerURL;
      });
      if (!legacy.length && navigator.serviceWorker.controller?.scriptURL !== legacyWorkerURL) return;
      const state = await workerRequest(active, 'VERDICT_GET_OFFLINE_STATE');
      if (!state || !state.ready) { retryMigration(); return; }
      wantedVersion = state.version || wantedVersion;
      if (!locallyIdle() || !(await prepareNotes(wantedVersion)).ready) {
        setStatus('deferred', 'Version complète prête. Passage hors ligne après la saisie en cours.');
        retryMigration(); return;
      }
      const prepared = await workerRequest(active, 'VERDICT_MIGRATION_PREPARE');
      if (!prepared || !prepared.ready || !prepared.token) { retryMigration(); return; }
      // Only retire the old app worker after the root cache and all window saves
      // have been acknowledged. No localStorage, IndexedDB or note is cleared.
      await Promise.all(legacy.map(reg => reg.unregister()));
      active.postMessage({ type: 'VERDICT_CLAIM_CLIENTS', token: prepared.token });
      if (navigator.serviceWorker.controller?.scriptURL !== rootWorkerURL) {
        // Some engines keep an existing client attached to its unregistered
        // worker until navigation. Reload only through the normal save/idle
        // guard, with a scope-specific loop guard distinct from version reload.
        clearTimeout(migrationTimer);
        migrationTimer = setTimeout(() => {
          if (navigator.serviceWorker.controller?.scriptURL === rootWorkerURL) return;
          migrationReload = true;
          pendingReload = true;
          attemptUpdate();
        }, 1500);
      }
    } catch (_) { retryMigration(); }
    finally { migrating = false; }
  }

  function watch(reg) {
    if (registration) return;
    if (!reg || reg.scope !== rootScope) throw new Error('Unexpected worker scope');
    registration = reg;
    migrateLegacy();
    registration.addEventListener('updatefound', () => observeInstalling(registration.installing));
    if (registration.installing) observeInstalling(registration.installing);
    if (registration.waiting) { waiting = registration.waiting; attemptUpdate(); }
    else setStatus('current', 'Mises à jour automatiques activées.');
    check(false);
    checkTimer = setInterval(() => { if (document.visibilityState === 'visible') check(false); }, CHECK_INTERVAL_MS);
  }
  // navigator.serviceWorker.ready may still resolve the more-specific legacy
  // /app/ registration. Watch only the root registration returned by app.js.
  function beginWatching() {
    const promised = window.VerdictSEOWorkerRegistration;
    const lookup = promised || navigator.serviceWorker.getRegistrations().then(regs => regs.find(reg => reg.scope === rootScope));
    Promise.resolve(lookup).then(watch).catch(() => setStatus('error', 'Mises à jour automatiques indisponibles dans ce navigateur.'));
  }
  if (document.readyState === 'complete') beginWatching();
  else window.addEventListener('load', beginWatching, { once: true });
  window.VerdictSEOUpdates = Object.freeze({
    check: () => check(true),
    getState: () => ({ state: status, version: wantedVersion || null, pendingReload })
  });
})();

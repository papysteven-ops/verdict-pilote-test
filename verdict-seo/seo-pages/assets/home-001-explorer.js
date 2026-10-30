/* Optional home exploration. All method sections and image links work without JS. */
(function () {
  'use strict';
  const choices = document.getElementById('exploreChoices');
  const host = document.getElementById('explorePanels');
  const neutral = document.getElementById('exploreNeutral');
  const triggers = [...document.querySelectorAll('[data-explore-select]')];
  const panels = [...document.querySelectorAll('[data-explore-panel]')];
  const narrow = window.matchMedia('(max-width: 700px)');
  let selected = null;
  function placePanel() {
    if (!selected) return;
    const panel = document.getElementById(selected.getAttribute('aria-controls'));
    const focus = document.activeElement;
    const restoreFocus = panel.contains(focus);
    if (narrow.matches) selected.after(panel);
    else host.append(panel);
    if (restoreFocus) focus.focus({ preventScroll: true });
  }
  function show(trigger) {
    panels.forEach(panel => { panel.hidden = true; host.append(panel); });
    triggers.forEach(link => link.setAttribute('aria-expanded', 'false'));
    selected = trigger;
    neutral.hidden = Boolean(selected);
    if (selected) {
      selected.setAttribute('aria-expanded', 'true');
      const panel = document.getElementById(selected.getAttribute('aria-controls'));
      panel.hidden = false;
      placePanel();
    }
  }
  function select(trigger) {
    const next = selected === trigger ? null : trigger;
    const hash = next ? next.getAttribute('href') : '#questionExplorer';
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    show(next);
  }
  if (choices && host && neutral && triggers.length && panels.length) {
    triggers.forEach(link => {
      const id = link.getAttribute('href').slice(1);
      if (!document.getElementById(id)) return;
      link.setAttribute('role', 'button');
      link.setAttribute('aria-controls', id);
      link.setAttribute('aria-expanded', 'false');
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); select(link);
      });
      link.addEventListener('keydown', event => {
        if (event.key === ' ') { event.preventDefault(); select(link); }
      });
    });
    panels.forEach(panel => { panel.hidden = true; });
    neutral.hidden = false;
    function openHash() {
      const target = triggers.find(link => link.getAttribute('href') === window.location.hash);
      show(target || null);
    }
    openHash();
    window.addEventListener('hashchange', openHash);
    window.addEventListener('popstate', openHash);
    narrow.addEventListener('change', placePanel);
  }
})();

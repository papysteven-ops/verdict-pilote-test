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
  function select(trigger) {
    const close = selected === trigger;
    panels.forEach(panel => { panel.hidden = true; host.append(panel); });
    triggers.forEach(link => link.setAttribute('aria-expanded', 'false'));
    selected = close ? null : trigger;
    neutral.hidden = !close;
    if (selected) {
      selected.setAttribute('aria-expanded', 'true');
      const panel = document.getElementById(selected.getAttribute('aria-controls'));
      panel.hidden = false;
      placePanel();
    }
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
      if (target && target !== selected) select(target);
    }
    openHash();
    window.addEventListener('hashchange', openHash);
    narrow.addEventListener('change', placePanel);
  }
  document.querySelectorAll('[data-model-card]').forEach(card => {
    const figure = card.querySelector('figure.real-capture');
    const image = figure && figure.querySelector('img');
    const source = figure && figure.querySelector('source');
    const caption = card.querySelector('[data-model-caption]');
    const views = [...card.querySelectorAll('[data-model-view]')];
    if (!figure || !image || !source || !caption || !views.length) return;
    function change(link) {
      const full = link.getAttribute('href');
      const mobile = link.dataset.mobile;
      views.forEach(item => item.setAttribute('aria-pressed', String(item === link)));
      source.media = mobile ? '(max-width:700px)' : 'not all';
      source.srcset = mobile || full;
      source.width = mobile ? 390 : Number(link.dataset.width);
      source.height = mobile ? 844 : Number(link.dataset.height);
      image.width = Number(link.dataset.width);
      image.height = Number(link.dataset.height);
      image.src = full;
      image.alt = link.dataset.alt;
      figure.dataset.captureOriginal = full;
      figure.dataset.captureTitle = link.dataset.title;
      figure.dataset.captureCaption = link.dataset.caption;
      figure.querySelectorAll('[data-capture-zoom]').forEach(zoom => {
        zoom.href = full;
        zoom.setAttribute('aria-label', 'Agrandir : ' + link.dataset.title);
      });
      caption.textContent = link.dataset.caption;
    }
    views.forEach(link => {
      link.setAttribute('role', 'button');
      link.setAttribute('aria-pressed', String(link.dataset.view === 'app'));
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); change(link);
      });
      link.addEventListener('keydown', event => {
        if (event.key === ' ') { event.preventDefault(); change(link); }
      });
    });
  });
})();

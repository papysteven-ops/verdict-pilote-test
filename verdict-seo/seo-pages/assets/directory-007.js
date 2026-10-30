/* Local text filtering only: no storage, request, score or business calculation. */
(function () {
  'use strict';
  var directory = document.querySelector('[data-guide-directory]');
  if (!directory) return;
  var input = directory.querySelector('[data-guide-search]');
  var reset = directory.querySelector('[data-guide-reset]');
  var status = directory.querySelector('[data-guide-status]');
  var empty = directory.querySelector('[data-guide-no-results]');
  var groups = Array.from(directory.querySelectorAll('[data-guide-group]'));
  if (!input || !reset || !status || !empty || !groups.length) return;
  function normalize(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr-FR').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  var entries = groups.map(function (group) {
    return {
      group: group,
      count: group.querySelector('[data-guide-group-count]'),
      rows: Array.from(group.querySelectorAll('[data-guide-entry]')).map(function (node) {
        return { node: node, text: normalize(node.textContent + ' ' + group.dataset.guideFamily) };
      })
    };
  });
  var total = entries.reduce(function (sum, group) { return sum + group.rows.length; }, 0);
  if (!total || entries.some(function (group) { return !group.count; })) return;
  function update() {
    var query = normalize(input.value);
    var terms = query ? query.split(/\s+/) : [];
    var visible = 0;
    entries.forEach(function (group) {
      var matches = 0;
      group.rows.forEach(function (row) {
        var match = terms.every(function (word) { return row.text.includes(word); });
        row.node.hidden = !match;
        if (match) matches++;
      });
      group.group.hidden = matches === 0;
      group.count.textContent = terms.length ? matches + ' sur ' + group.rows.length + ' guides' : group.rows.length + ' guides';
      visible += matches;
    });
    empty.hidden = visible !== 0;
    reset.disabled = input.value.length === 0;
    status.textContent = terms.length ? visible + ' guide' + (visible > 1 ? 's' : '') + ' correspondant' + (visible > 1 ? 's' : '') + ' sur ' + total + '.' : total + ' guides dans le répertoire.';
    directory.dataset.visibleGuides = String(visible);
  }
  function clear() { input.value = ''; update(); }
  input.addEventListener('input', update);
  reset.addEventListener('click', function () { clear(); input.focus(); });
  directory.querySelectorAll('[data-guide-jump]').forEach(function (link) {
    link.addEventListener('click', function () { if (input.value) clear(); });
  });
  function showHashTarget() {
    var target = document.getElementById(window.location.hash.slice(1));
    if (target && target.closest('[data-guide-group]') && target.closest('[data-guide-group]').hidden) {
      clear(); target.scrollIntoView();
    }
  }
  window.addEventListener('hashchange', showHashTarget);
  update();
  input.disabled = false;
  directory.dataset.directoryReady = 'true';
  showHashTarget();
})();

/* Four exclusive amounts, three dependent readings. Separate from the application engine. */
(function (root) {
  'use strict';
  var keys = ['sales', 'material', 'variable', 'other'];
  var labels = ['les ventes HT', 'la matière consommée retenue', 'les autres coûts variables', 'les autres charges retenues'];
  function parseMoney(value) {
    var text = String(value).trim();
    if (!text) return { state: 'empty' };
    if (/^[-\u2212]/.test(text)) return { state: 'invalid', message: 'Montant négatif hors du domaine simplifié. Reprenez les avoirs ou nets négatifs dans vos pièces, sans les remplacer par zéro.' };
    if (text.length > 80 || !/^(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?:[,.]\d{1,2})?$/.test(text)) return { state: 'invalid', message: 'Utilisez un montant positif ou nul, au plus deux décimales et des espaces de milliers correctement groupés.' };
    var parts = text.replace(/[ \u00a0\u202f]/g, '').split(/[,.]/);
    if (parts[0].length > 15) return { state: 'invalid', message: 'Limitez la saisie à quinze chiffres avant le séparateur.' };
    return { state: 'valid', cents: BigInt(parts[0]) * 100n + BigInt((parts[1] || '').padEnd(2, '0')) };
  }
  function roundedDivision(numerator, denominator) {
    var negative = numerator < 0n, absolute = negative ? -numerator : numerator;
    var result = (2n * absolute + denominator) / (2n * denominator);
    return negative ? -result : result;
  }
  function calculate(sales, material, variable, other) {
    var running = typeof sales === 'bigint' ? sales : null;
    return [material, variable, other].map(function (cost, index) {
      running = running !== null && typeof cost === 'bigint' ? running - cost : null;
      return { key: keys[index + 1], amount: running, ratio: running !== null && typeof sales === 'bigint' && sales > 0n ? roundedDivision(running * 10000n, sales) : null };
    });
  }
  function decimal(value) {
    var negative = value < 0n, absolute = negative ? -value : value;
    return (negative ? '-' : '') + (absolute / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + ',' + (absolute % 100n).toString().padStart(2, '0');
  }
  if (typeof module === 'object' && module.exports) module.exports = { parseMoney: parseMoney, calculate: calculate, decimal: decimal, roundedDivision: roundedDivision };
  if (!root.document) return;
  root.document.querySelectorAll('[data-m16-calculator]').forEach(function (box) {
    var inputs = keys.map(function (key) { return box.querySelector('[data-m16-input="' + key + '"]'); });
    var clear = box.querySelector('[data-m16-clear]'), status = box.querySelector('[data-m16-status]');
    var stages = keys.slice(1).map(function (key) { return { money: box.querySelector('[data-m16-money="' + key + '"]'), rate: box.querySelector('[data-m16-rate="' + key + '"]'), reason: box.querySelector('[data-m16-reason="' + key + '"]') }; });
    if (inputs.some(function (node) { return !node; }) || !clear || !status || stages.some(function (stage) { return !stage.money || !stage.rate || !stage.reason; })) return;
    function update() {
      var values = inputs.map(function (input) {
        var value = parseMoney(input.value), error = input.closest('label').querySelector('[data-m16-error]');
        input.setAttribute('aria-invalid', String(value.state === 'invalid'));
        if (error) error.textContent = value.state === 'invalid' ? value.message : '';
        return value;
      });
      var readings = calculate.apply(null, values.map(function (value) { return value.state === 'valid' ? value.cents : null; }));
      var available = 0;
      readings.forEach(function (reading, index) {
        var stage = stages[index];
        if (reading.amount !== null) {
          available += 1;
          stage.money.textContent = decimal(reading.amount) + ' €';
          stage.rate.textContent = reading.ratio === null ? '—' : decimal(reading.ratio) + ' %';
          stage.reason.textContent = reading.ratio === null ? 'Ratio indisponible : ventes HT nulles.' : 'Ratio de ce solde aux ventes HT. Les postes absents restent hors de cette lecture.';
          stage.money.parentElement.dataset.readingState = 'calculated';
        } else {
          stage.money.textContent = stage.rate.textContent = '—';
          var dependencies = values.slice(0, index + 2), invalid = [], empty = [];
          dependencies.forEach(function (value, position) { if (value.state === 'invalid') invalid.push(labels[position]); else if (value.state === 'empty') empty.push(labels[position]); });
          stage.reason.textContent = invalid.length ? 'Étape indisponible : corrigez ' + invalid.join(', ') + '.' : 'Étape en attente : renseignez ' + empty.join(', ') + '. Une case vide ne devient pas zéro.';
          stage.money.parentElement.dataset.readingState = 'unavailable';
        }
      });
      box.dataset.resultState = available === 3 ? 'calculated' : available ? 'partial' : 'unavailable';
      var baseStatus = values.some(function (value) { return value.state === 'invalid'; }) ? 'Corrigez les montants signalés. Les étapes précédentes encore calculables restent à jour.' : available ? 'Lectures limitées aux rubriques renseignées.' : 'Renseignez les ventes HT et la matière pour la première lecture. Une valeur inconnue ne devient pas zéro.';
      var names = ['Après matière', 'Après variables', 'Après charges'];
      var summary = readings.filter(function (reading) { return reading.amount !== null; }).map(function (reading, index) {
        return names[index] + ' : ' + decimal(reading.amount) + ' € (' + (reading.ratio === null ? 'ratio indisponible : ventes HT nulles' : decimal(reading.ratio) + ' % des ventes HT') + ').';
      }).join(' ');
      status.textContent = baseStatus + (summary ? ' ' + summary : '');
    }
    inputs.forEach(function (input) { input.addEventListener('input', update); });
    clear.addEventListener('click', function () { inputs.forEach(function (input) { input.value = ''; }); update(); inputs[0].focus(); });
    update();
    inputs.forEach(function (input) { input.disabled = false; });
    clear.disabled = false;
    box.dataset.calculatorReady = 'true';
  });
})(typeof window === 'undefined' ? globalThis : window);

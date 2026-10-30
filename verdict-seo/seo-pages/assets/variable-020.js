/* Page 020: five amounts on one documented unit, separate from the application engine. */
(function (root) {
  'use strict';
  var keys = ['sales', 'material', 'packaging', 'channel', 'other'];
  var labels = ['la vente HT', 'la matière consommée', 'l’emballage', 'les frais du canal', 'les autres variables'];
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
  function calculate(sales, material, packaging, channel, other) {
    var costs = [material, packaging, channel, other];
    var total = costs.every(function (cost) { return typeof cost === 'bigint'; }) ? costs.reduce(function (sum, cost) { return sum + cost; }, 0n) : null;
    var contribution = total !== null && typeof sales === 'bigint' ? sales - total : null;
    return { total: total, contribution: contribution, ratio: contribution !== null && sales > 0n ? roundedDivision(contribution * 10000n, sales) : null };
  }
  function decimal(value) {
    var negative = value < 0n, absolute = negative ? -value : value;
    return (negative ? '-' : '') + (absolute / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + ',' + (absolute % 100n).toString().padStart(2, '0');
  }
  if (typeof module === 'object' && module.exports) module.exports = { parseMoney: parseMoney, calculate: calculate, decimal: decimal, roundedDivision: roundedDivision };
  if (!root.document) return;
  root.document.querySelectorAll('[data-v20-calculator]').forEach(function (box) {
    var inputs = keys.map(function (key) { return box.querySelector('[data-v20-input="' + key + '"]'); });
    var clear = box.querySelector('[data-v20-clear]'), status = box.querySelector('[data-v20-status]');
    var total = box.querySelector('[data-v20-total]'), contribution = box.querySelector('[data-v20-contribution]'), rate = box.querySelector('[data-v20-rate]');
    var totalReason = box.querySelector('[data-v20-total-reason]'), contributionReason = box.querySelector('[data-v20-contribution-reason]'), rateReason = box.querySelector('[data-v20-rate-reason]');
    if (inputs.some(function (node) { return !node; }) || !clear || !status || !total || !contribution || !rate || !totalReason || !contributionReason || !rateReason) return;
    function unavailable(values, positions, name) {
      var invalid = [], empty = [];
      positions.forEach(function (position) {
        if (values[position].state === 'invalid') invalid.push(labels[position]);
        else if (values[position].state === 'empty') empty.push(labels[position]);
      });
      var reasons = [];
      if (invalid.length) reasons.push('corrigez ' + invalid.join(', '));
      if (empty.length) reasons.push('renseignez ' + empty.join(', '));
      return name + ' indisponible : ' + reasons.join(' ; ') + '. Une valeur inconnue ne devient pas zéro.';
    }
    function update() {
      var values = inputs.map(function (input) {
        var value = parseMoney(input.value), error = input.closest('label').querySelector('[data-v20-error]');
        input.setAttribute('aria-invalid', String(value.state === 'invalid'));
        if (error) error.textContent = value.state === 'invalid' ? value.message : '';
        return value;
      });
      var reading = calculate.apply(null, values.map(function (value) { return value.state === 'valid' ? value.cents : null; }));
      total.textContent = reading.total === null ? '—' : decimal(reading.total) + ' €';
      contribution.textContent = reading.contribution === null ? '—' : decimal(reading.contribution) + ' €';
      rate.textContent = reading.ratio === null ? '—' : decimal(reading.ratio) + ' %';
      totalReason.textContent = reading.total === null ? unavailable(values, [1, 2, 3, 4], 'Total') : 'Total des quatre coûts fournis. Il ne dépend pas du montant de vente et ne complète pas les postes absents.';
      contributionReason.textContent = reading.contribution === null ? unavailable(values, [0, 1, 2, 3, 4], 'Contribution') : 'Vente HT diminuée des quatre coûts fournis, sur la même unité documentée. Les autres charges restent à couvrir.';
      rateReason.textContent = reading.contribution === null ? 'Ratio indisponible tant que la contribution ne peut pas être calculée.' : reading.ratio === null ? 'Ratio indisponible : vente HT nulle.' : 'Taux arrondi de la contribution aux ventes HT. Un affichage à zéro ne prouve pas un solde exact nul.';
      box.dataset.resultState = reading.contribution !== null ? 'calculated' : reading.total !== null ? 'partial' : 'unavailable';
      var summary = [
        reading.total === null ? totalReason.textContent : 'Total des variables renseignées pour l’unité : ' + decimal(reading.total) + ' €.',
        reading.contribution === null ? contributionReason.textContent : 'Contribution de l’unité avant les autres charges : ' + decimal(reading.contribution) + ' €.',
        reading.ratio === null ? rateReason.textContent : 'Contribution rapportée à la vente HT, taux arrondi : ' + decimal(reading.ratio) + ' %.'
      ];
      status.textContent = summary.join(' ');
    }
    inputs.forEach(function (input) { input.addEventListener('input', update); });
    clear.addEventListener('click', function () { inputs.forEach(function (input) { input.value = ''; }); update(); inputs[0].focus(); });
    update();
    inputs.forEach(function (input) { input.disabled = false; });
    clear.disabled = false;
    box.dataset.calculatorReady = 'true';
  });
})(typeof window === 'undefined' ? globalThis : window);

/* A supplied accounting result divided by sales; no tax or result reconstructed. */
(function (root) {
  'use strict';
  function parseMoney(value, signed) {
    var text = String(value).trim().replace(/^\u2212/, '-');
    if (!text) return { state: 'empty' };
    var negative = signed && text[0] === '-';
    if (negative) text = text.slice(1);
    if (text.length > 80 || !/^(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?:[,.]\d{1,2})?$/.test(text)) return { state: 'invalid', message: signed ? 'Utilisez un montant au centime, avec signe moins si nécessaire et des groupes de milliers complets.' : 'Utilisez des ventes positives ou nulles, au centime et sans signe. Des ventes nulles ne permettent pas de ratio.' };
    var parts = text.replace(/[ \u00a0\u202f]/g, '').split(/[,.]/);
    if (parts[0].length > 15) return { state: 'invalid', message: 'Limitez la saisie à quinze chiffres avant le séparateur, hors signe.' };
    var cents = BigInt(parts[0]) * 100n + BigInt((parts[1] || '').padEnd(2, '0'));
    return { state: 'valid', cents: negative ? -cents : cents };
  }
  function roundedDivision(numerator, denominator) {
    var negative = numerator < 0n, absolute = negative ? -numerator : numerator;
    var rounded = (2n * absolute + denominator) / (2n * denominator);
    return negative ? -rounded : rounded;
  }
  function calculate(result, sales) {
    if (typeof result !== 'bigint' || typeof sales !== 'bigint' || sales <= 0n) return null;
    return roundedDivision(result * 10000n, sales);
  }
  function decimal(value) {
    var negative = value < 0n, absolute = negative ? -value : value;
    return (negative ? '-' : '') + (absolute / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + ',' + (absolute % 100n).toString().padStart(2, '0');
  }
  if (typeof module === 'object' && module.exports) module.exports = { parseMoney: parseMoney, calculate: calculate, decimal: decimal, roundedDivision: roundedDivision };
  if (!root.document) return;
  root.document.querySelectorAll('[data-n17-calculator]').forEach(function (box) {
    var fields = ['result', 'sales'].map(function (key) { return box.querySelector('[data-n17-input="' + key + '"]'); });
    var clear = box.querySelector('[data-n17-clear]'), output = box.querySelector('[data-n17-ratio]'), reason = box.querySelector('[data-n17-reason]'), status = box.querySelector('[data-n17-status]');
    if (fields.some(function (field) { return !field; }) || !clear || !output || !reason || !status) return;
    function update() {
      var values = fields.map(function (field, index) {
        var value = parseMoney(field.value, index === 0), error = field.closest('label').querySelector('[data-n17-error]');
        field.setAttribute('aria-invalid', String(value.state === 'invalid'));
        if (error) error.textContent = value.state === 'invalid' ? value.message : '';
        return value;
      });
      output.textContent = '—';
      box.dataset.resultState = 'unavailable';
      if (values.some(function (value) { return value.state === 'invalid'; })) {
        reason.textContent = status.textContent = 'Ratio indisponible : corrigez les montants signalés. Les saisies ne sont pas modifiées.';
        return;
      }
      if (values.some(function (value) { return value.state === 'empty'; })) {
        reason.textContent = status.textContent = 'Renseignez le résultat net établi et les ventes HT du même exercice. Une valeur inconnue ne devient pas zéro.';
        return;
      }
      if (values[1].cents === 0n) {
        reason.textContent = 'Ratio indisponible : ventes HT nulles.';
        status.textContent = 'Ratio indisponible : ventes HT nulles. Le résultat saisi reste une donnée fournie, sans quotient.';
        box.dataset.resultState = 'zero-sales';
        return;
      }
      var rate = calculate(values[0].cents, values[1].cents), formatted = decimal(rate) + ' %';
      output.textContent = formatted;
      reason.textContent = 'Rapport des deux montants fournis. Le quotient ne vérifie pas les pièces, les postes ou l’impôt.';
      status.textContent = 'Marge nette sur CA, selon le résultat fourni : ' + formatted + ' (taux arrondi). Ce quotient ne complète aucun poste ou impôt manquant.';
      box.dataset.resultState = 'calculated';
    }
    fields.forEach(function (field) { field.addEventListener('input', update); });
    clear.addEventListener('click', function () { fields.forEach(function (field) { field.value = ''; }); update(); fields[0].focus(); });
    update();
    fields.forEach(function (field) { field.disabled = false; });
    clear.disabled = false;
    box.dataset.calculatorReady = 'true';
  });
})(typeof window === 'undefined' ? globalThis : window);

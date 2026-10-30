/* Exact pedagogical fractions; no application engine, date, cover or health colour. */
(function (root) {
  'use strict';
  function parseDecimal(value, signed) {
    var text = String(value).trim().replace(/^\u2212/, '-');
    if (!text) return { state: 'empty' };
    var negative = signed && text[0] === '-';
    if (negative) text = text.slice(1);
    if (text.length > 80 || !/^(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?:[,.]\d{1,2})?$/.test(text)) return { state: 'invalid', message: 'Utilisez une valeur avec au plus deux décimales et des groupes de milliers complets.' };
    var parts = text.replace(/[ \u00a0\u202f]/g, '').split(/[,.]/);
    if (parts[0].length > 15) return { state: 'invalid', message: 'Limitez la valeur à quinze chiffres avant le séparateur.' };
    var units = BigInt(parts[0]) * 100n + BigInt((parts[1] || '').padEnd(2, '0'));
    return { state: 'valid', units: negative ? -units : units };
  }
  function parseDays(value) {
    var text = String(value).trim();
    if (!text) return { state: 'empty' };
    if (!/^\d{1,15}$/.test(text) || BigInt(text) === 0n) return { state: 'invalid', message: 'Indiquez un nombre entier strictement positif, de quinze chiffres au maximum.' };
    return { state: 'valid', units: BigInt(text) };
  }
  function calculate(fixedCents, rateBasisPoints, days) {
    if (rateBasisPoints <= 0n || rateBasisPoints > 10000n || fixedCents < 0n) return null;
    var numerator = fixedCents * 10000n;
    return { threshold: { numerator: numerator, denominator: rateBasisPoints }, daily: days > 0n ? { numerator: numerator, denominator: rateBasisPoints * days } : null };
  }
  function moneyCeiling(fraction) {
    var cents = (fraction.numerator + fraction.denominator - 1n) / fraction.denominator;
    return (cents / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + ',' + (cents % 100n).toString().padStart(2, '0') + ' €';
  }
  if (typeof module === 'object' && module.exports) module.exports = { parseDecimal: parseDecimal, parseDays: parseDays, calculate: calculate, moneyCeiling: moneyCeiling };
  if (!root.document) return;
  root.document.querySelectorAll('[data-s9-calculator]').forEach(function (box) {
    var fields = ['fixed', 'rate', 'days'].map(function (key) { return box.querySelector('[data-s9-input="' + key + '"]'); });
    var clear = box.querySelector('[data-s9-clear]'), status = box.querySelector('[data-s9-status]');
    var threshold = box.querySelector('[data-s9-threshold]'), daily = box.querySelector('[data-s9-daily]');
    if (fields.some(function (node) { return !node; }) || !clear || !status || !threshold || !daily) return;
    function update() {
      var values = [parseDecimal(fields[0].value, false), parseDecimal(fields[1].value, true), parseDays(fields[2].value)];
      if (values[1].state === 'valid' && values[1].units > 10000n) values[1] = { state: 'invalid', message: 'Un taux supérieur à 100 % sort du domaine simplifié de cet outil.' };
      values.forEach(function (value, index) {
        fields[index].setAttribute('aria-invalid', String(value.state === 'invalid'));
        var error = fields[index].closest('label').querySelector('[data-s9-error]');
        if (error) error.textContent = value.state === 'invalid' ? value.message : '';
      });
      threshold.textContent = daily.textContent = '—';
      box.dataset.resultState = 'unavailable';
      if (values[0].state !== 'valid' || values[1].state !== 'valid') {
        status.textContent = values[0].state === 'invalid' || values[1].state === 'invalid' ? 'Calcul indisponible : corrigez les charges ou le taux signalés.' : 'Renseignez les charges et le taux de contribution. Les journées ouvertes sont facultatives.';
        return;
      }
      if (values[1].units <= 0n) {
        box.dataset.resultState = 'nonfinancing';
        status.textContent = values[0].units > 0n ? 'Une contribution nulle ou négative ne finance pas des charges fixes positives ; cette formule ne détermine pas de seuil.' : 'Avec des charges nulles et une contribution non positive, cette formule ne détermine pas de seuil ; aucun déficit n’en est déduit.';
        return;
      }
      var result = calculate(values[0].units, values[1].units, values[2].state === 'valid' ? values[2].units : null);
      threshold.textContent = moneyCeiling(result.threshold);
      if (result.daily) {
        daily.textContent = moneyCeiling(result.daily);
        box.dataset.resultState = 'calculated';
        status.textContent = 'Seuil et moyenne limités aux charges retenues et au taux constant saisi. Aucune date de couverture n’est calculée.';
      } else {
        box.dataset.resultState = 'partial';
        status.textContent = values[2].state === 'invalid' ? 'Le seuil reste calculable. Corrigez les journées pour lire la moyenne ; aucune date n’est calculée.' : 'Seuil limité aux charges retenues. Ajoutez les journées ouvertes pour lire une moyenne, sans date de couverture.';
      }
    }
    fields.forEach(function (field) { field.addEventListener('input', update); });
    clear.addEventListener('click', function () { fields.forEach(function (field) { field.value = ''; }); update(); fields[0].focus(); });
    update();
    fields.forEach(function (field) { field.disabled = false; });
    clear.disabled = false;
    box.dataset.calculatorReady = 'true';
  });
})(typeof window === 'undefined' ? globalThis : window);

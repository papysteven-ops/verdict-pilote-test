/* Independent HT pedagogy. Never a cash balance, forecast or native app target. */
(function (root) {
  'use strict';
  function parseDecimal(value, signed) {
    var text = String(value).trim().replace(/^\u2212/, '-');
    if (!text) return { state: 'empty' };
    var negative = signed && text[0] === '-';
    if (negative) text = text.slice(1);
    if (text.length > 80 || !/^(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?:[,.]\d{1,2})?$/.test(text)) return { state: 'invalid', message: 'Utilisez au plus deux décimales et des groupes de milliers complets.' };
    var parts = text.replace(/[ \u00a0\u202f]/g, '').split(/[,.]/);
    if (parts[0].length > 15) return { state: 'invalid', message: 'Limitez la valeur à quinze chiffres avant le séparateur.' };
    var units = BigInt(parts[0]) * 100n + BigInt((parts[1] || '').padEnd(2, '0'));
    return { state: 'valid', units: negative ? -units : units };
  }
  function parseDays(value) {
    var text = String(value).trim();
    if (!text) return { state: 'empty' };
    if (!/^\d{1,15}$/.test(text)) return { state: 'invalid', message: 'Indiquez un nombre entier positif ou nul, de quinze chiffres au maximum.' };
    return { state: 'valid', units: BigInt(text) };
  }
  function remaining(fixed, contribution) { var difference = fixed - contribution; return difference > 0n ? difference : 0n; }
  function future(rest, rateBasisPoints, days) {
    if (rateBasisPoints <= 0n || rateBasisPoints > 10000n) return null;
    var numerator = rest * 10000n;
    return { revenue: { numerator: numerator, denominator: rateBasisPoints }, daily: days > 0n ? { numerator: numerator, denominator: rateBasisPoints * days } : null };
  }
  function moneyCeiling(fraction) {
    var cents = (fraction.numerator + fraction.denominator - 1n) / fraction.denominator;
    return (cents / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + ',' + (cents % 100n).toString().padStart(2, '0') + ' €';
  }
  if (typeof module === 'object' && module.exports) module.exports = { parseDecimal: parseDecimal, parseDays: parseDays, remaining: remaining, future: future, moneyCeiling: moneyCeiling };
  if (!root.document) return;
  root.document.querySelectorAll('[data-d10-calculator]').forEach(function (box) {
    var fields = ['fixed', 'contribution', 'rate', 'days'].map(function (key) { return box.querySelector('[data-d10-input="' + key + '"]'); });
    var clear = box.querySelector('[data-d10-clear]'), status = box.querySelector('[data-d10-status]');
    var restOutput = box.querySelector('[data-d10-remaining]'), revenue = box.querySelector('[data-d10-revenue]'), daily = box.querySelector('[data-d10-daily]');
    if (fields.some(function (node) { return !node; }) || !clear || !status || !restOutput || !revenue || !daily) return;
    function update() {
      var values = [parseDecimal(fields[0].value, false), parseDecimal(fields[1].value, true), parseDecimal(fields[2].value, true), parseDays(fields[3].value)];
      if (values[2].state === 'valid' && values[2].units > 10000n) values[2] = { state: 'invalid', message: 'Un taux supérieur à 100 % sort du domaine simplifié de cet outil.' };
      values.forEach(function (value, index) {
        fields[index].setAttribute('aria-invalid', String(value.state === 'invalid'));
        var error = fields[index].closest('label').querySelector('[data-d10-error]');
        if (error) error.textContent = value.state === 'invalid' ? value.message : '';
      });
      restOutput.textContent = revenue.textContent = daily.textContent = '—';
      box.dataset.resultState = 'unavailable';
      box.dataset.daysState = values[3].state === 'valid' ? (values[3].units === 0n ? 'zero' : 'positive') : values[3].state;
      if (values[0].state !== 'valid' || values[1].state !== 'valid') {
        status.textContent = values[0].state === 'invalid' || values[1].state === 'invalid' ? 'Calcul indisponible : corrigez les charges ou la contribution signalées.' : 'Renseignez les charges et la contribution réalisée. Un zéro connu doit être saisi explicitement.';
        return;
      }
      var rest = remaining(values[0].units, values[1].units);
      restOutput.textContent = moneyCeiling({ numerator: rest, denominator: 1n });
      box.dataset.resultState = 'partial';
      if (values[2].state !== 'valid') {
        status.textContent = values[2].state === 'invalid' ? 'Le reste est calculé. Corrigez le taux futur pour lire le CA correspondant.' : 'Le reste est calculé. Ajoutez un taux futur pour lire le CA correspondant ; ce taux reste une hypothèse.';
        return;
      }
      if (values[2].units <= 0n) {
        box.dataset.resultState = 'nonfinancing';
        status.textContent = rest > 0n ? 'Une contribution future nulle ou négative ne finance pas les charges restant à couvrir ; aucun besoin de CA n’est calculé.' : 'Le reste courant est nul, mais un taux futur non positif ne garantit pas la couverture de la suite ; aucun besoin de CA n’est calculé.';
        return;
      }
      var result = future(rest, values[2].units, values[3].state === 'valid' ? values[3].units : null);
      revenue.textContent = moneyCeiling(result.revenue);
      if (result.daily) {
        daily.textContent = moneyCeiling(result.daily);
        box.dataset.resultState = 'calculated';
        status.textContent = rest === 0n ? 'Reste nul pour les postes et le point d’arrêt renseignés. Ce calcul ne garantit pas la suite.' : 'Répartition arithmétique sous le taux futur saisi. Ce n’est ni une prévision ni la cible propre d’un service.';
      } else if (values[3].state === 'valid') {
        box.dataset.resultState = 'noDays';
        status.textContent = rest > 0n ? 'Le CA correspondant est un montant hypothétique : aucune journée ouverte n’est déclarée pour le réaliser. Le reste demeure lisible ; aucune moyenne n’est calculée.' : 'Aucune journée encore ouverte n’est déclarée. Le reste courant nul ne garantit pas la suite ; aucune moyenne n’est calculée.';
      } else {
        status.textContent = values[3].state === 'invalid' ? 'Reste et CA correspondant calculés. Corrigez les journées signalées pour lire une moyenne.' : 'Reste et CA correspondant calculés. Ajoutez les journées restantes pour une moyenne ; aucune cible précise d’aujourd’hui n’est déduite.';
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

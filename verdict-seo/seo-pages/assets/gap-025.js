/* Individual page025: compare established material amounts, separate from the application engine. */
(function (root) {
  'use strict';
  var keys = ['inventory', 'theoretical', 'sales'];
  var labels = ['la matière d’inventaire', 'la matière théorique', 'les ventes HT'];
  function parseMoney(value) {
    var text = String(value).trim();
    if (!text) return { state: 'empty' };
    if (/^[-\u2212]/.test(text)) return { state: 'invalid', message: 'Ce montant doit être positif ou nul, sans signe moins même sur zéro. Un montant négatif demande un rapprochement préalable, sans valeur absolue ni zéro de substitution.' };
    if (text.length > 80 || !/^(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?:[,.]\d{1,2})?$/.test(text)) return { state: 'invalid', message: 'Utilisez un montant positif ou nul, au plus deux décimales et des espaces de milliers correctement groupés. Ni signe plus ni exposant.' };
    var parts = text.replace(/[ \u00a0\u202f]/g, '').split(/[,.]/);
    if (parts[0].length > 15) return { state: 'invalid', message: 'Limitez la saisie à quinze chiffres avant le séparateur.' };
    return { state: 'valid', cents: BigInt(parts[0]) * 100n + BigInt((parts[1] || '').padEnd(2, '0')) };
  }
  function roundedDivision(numerator, denominator) {
    var negative = numerator < 0n, absolute = negative ? -numerator : numerator;
    var result = (2n * absolute + denominator) / (2n * denominator);
    return negative ? -result : result;
  }
  function nonnegative(value) { return typeof value === 'bigint' && value >= 0n; }
  function calculate(inventory, theoretical, sales) {
    var difference = nonnegative(inventory) && nonnegative(theoretical) ? inventory - theoretical : null;
    return {
      difference: difference,
      points: difference !== null && nonnegative(sales) && sales > 0n ? roundedDivision(difference * 10000n, sales) : null
    };
  }
  function decimal(value) {
    var negative = value < 0n, absolute = negative ? -value : value;
    return (negative ? '-' : '') + (absolute / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + ',' + (absolute % 100n).toString().padStart(2, '0');
  }
  if (typeof module === 'object' && module.exports) module.exports = { parseMoney: parseMoney, calculate: calculate, decimal: decimal, roundedDivision: roundedDivision };
  if (!root.document) return;
  root.document.querySelectorAll('[data-g25-calculator]').forEach(function (box) {
    var inputs = keys.map(function (key) { return box.querySelector('[data-g25-input="' + key + '"]'); });
    var clear = box.querySelector('[data-g25-clear]'), status = box.querySelector('[data-g25-status]');
    var difference = box.querySelector('[data-g25-difference]'), points = box.querySelector('[data-g25-points]');
    var differenceReason = box.querySelector('[data-g25-difference-reason]'), pointsReason = box.querySelector('[data-g25-points-reason]');
    if (inputs.some(function (node) { return !node; }) || !clear || !status || !difference || !points || !differenceReason || !pointsReason) return;
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
        var value = parseMoney(input.value), error = input.closest('label').querySelector('[data-g25-error]');
        input.setAttribute('aria-invalid', String(value.state === 'invalid'));
        if (error) error.textContent = value.state === 'invalid' ? value.message : '';
        return value;
      });
      var reading = calculate.apply(null, values.map(function (value) { return value.state === 'valid' ? value.cents : null; }));
      difference.textContent = reading.difference === null ? '—' : decimal(reading.difference) + ' €';
      points.textContent = reading.points === null ? '—' : decimal(reading.points) + ' points';
      differenceReason.textContent = reading.difference === null ? unavailable(values, [0, 1], 'Écart') : reading.difference > 0n ? 'La matière d’inventaire renseignée est supérieure au théorique. Cette différence demande un rapprochement ; elle ne prouve pas une perte physique.' : reading.difference < 0n ? 'La matière théorique renseignée est supérieure à la matière d’inventaire. Le signe reste visible ; vérifiez les mêmes bases et pièces.' : 'Les deux montants renseignés sont égaux. Cette égalité ne certifie ni leur couverture ni l’absence de perte.';
      pointsReason.textContent = reading.difference === null ? 'Points indisponibles tant que les deux montants matière ne permettent pas de calculer leur écart.' : values[2].state !== 'valid' ? unavailable(values, [2], 'Nombre de points') : reading.points === null ? 'Points indisponibles : les ventes HT sont nulles.' : 'Points arrondis sur la même base de ventes HT, sans variation relative du théorique. Un affichage à zéro ne prouve pas que les deux montants sont exactement égaux.';
      box.dataset.resultState = reading.points !== null ? 'calculated' : reading.difference !== null ? 'amount-only' : 'unavailable';
      status.textContent = [
        reading.difference === null ? differenceReason.textContent : 'Écart entre les montants HT : ' + decimal(reading.difference) + ' €. ' + differenceReason.textContent,
        reading.points === null ? pointsReason.textContent : 'Écart rapporté aux ventes HT, en points arrondis : ' + decimal(reading.points) + ' points. ' + pointsReason.textContent
      ].join(' ');
    }
    inputs.forEach(function (input) { input.addEventListener('input', update); });
    clear.addEventListener('click', function () { inputs.forEach(function (input) { input.value = ''; }); update(); inputs[0].focus(); });
    update();
    inputs.forEach(function (input) { input.disabled = false; });
    clear.disabled = false;
    box.dataset.calculatorReady = 'true';
  });
})(typeof window === 'undefined' ? globalThis : window);

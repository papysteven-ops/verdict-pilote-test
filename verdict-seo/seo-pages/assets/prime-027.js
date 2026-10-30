/* Individual page027: two documented cost families, separate from the application engine. */
(function (root) {
  'use strict';
  var keys = ['material', 'human', 'sales'];
  var labels = ['la matière établie', 'le coût humain chargé', 'les ventes HT'];
  function parseMoney(value) {
    var text = String(value).trim();
    if (!text) return { state: 'empty' };
    if (/^[-\u2212]/.test(text)) return { state: 'invalid', message: 'Ce montant doit être positif ou nul, sans signe moins même sur zéro. Une correction négative demande un rapprochement préalable, sans valeur absolue ni zéro de substitution.' };
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
  function calculate(material, human, sales) {
    var total = nonnegative(material) && nonnegative(human) ? material + human : null;
    return {
      total: total,
      ratio: total !== null && nonnegative(sales) && sales > 0n ? roundedDivision(total * 10000n, sales) : null,
      balance: total !== null && nonnegative(sales) ? sales - total : null
    };
  }
  function decimal(value) {
    var negative = value < 0n, absolute = negative ? -value : value;
    return (negative ? '-' : '') + (absolute / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + ',' + (absolute % 100n).toString().padStart(2, '0');
  }
  if (typeof module === 'object' && module.exports) module.exports = { parseMoney: parseMoney, calculate: calculate, decimal: decimal, roundedDivision: roundedDivision };
  if (!root.document) return;
  root.document.querySelectorAll('[data-p27-calculator]').forEach(function (box) {
    var inputs = keys.map(function (key) { return box.querySelector('[data-p27-input="' + key + '"]'); });
    var clear = box.querySelector('[data-p27-clear]'), status = box.querySelector('[data-p27-status]');
    var total = box.querySelector('[data-p27-total]'), ratio = box.querySelector('[data-p27-ratio]'), balance = box.querySelector('[data-p27-balance]');
    var totalReason = box.querySelector('[data-p27-total-reason]'), ratioReason = box.querySelector('[data-p27-ratio-reason]'), balanceReason = box.querySelector('[data-p27-balance-reason]');
    if (inputs.some(function (node) { return !node; }) || !clear || !status || !total || !ratio || !balance || !totalReason || !ratioReason || !balanceReason) return;
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
        var value = parseMoney(input.value), error = input.closest('label').querySelector('[data-p27-error]');
        input.setAttribute('aria-invalid', String(value.state === 'invalid'));
        if (error) error.textContent = value.state === 'invalid' ? value.message : '';
        return value;
      });
      var reading = calculate.apply(null, values.map(function (value) { return value.state === 'valid' ? value.cents : null; }));
      total.textContent = reading.total === null ? '—' : decimal(reading.total) + ' €';
      ratio.textContent = reading.ratio === null ? '—' : decimal(reading.ratio) + ' %';
      balance.textContent = reading.balance === null ? '—' : decimal(reading.balance) + ' €';
      totalReason.textContent = reading.total === null ? unavailable(values, [0, 1], 'Total') : 'Total des deux coûts renseignés, indépendant des ventes. Il ne complète pas les postes absents et ne certifie pas leur couverture.';
      ratioReason.textContent = reading.total === null ? 'Ratio indisponible tant que les deux coûts ne permettent pas de calculer leur total.' : values[2].state !== 'valid' ? unavailable(values, [2], 'Ratio') : reading.ratio === null ? 'Ratio indisponible : les ventes HT sont nulles.' : 'Taux arrondi du total sur les ventes HT correspondantes. Un affichage à zéro ne prouve pas un total exact nul.';
      balanceReason.textContent = reading.balance === null ? unavailable(values, [0, 1, 2], 'Solde') : 'Ventes HT diminuées des deux coûts renseignés. Les autres variables et les autres charges restent à financer ; ce n’est ni résultat net ni fonds disponibles.';
      box.dataset.resultState = reading.balance !== null ? 'calculated' : reading.total !== null ? 'partial' : 'unavailable';
      status.textContent = [
        reading.total === null ? totalReason.textContent : 'Total matière et coût humain renseignés : ' + decimal(reading.total) + ' €. ' + totalReason.textContent,
        reading.ratio === null ? ratioReason.textContent : 'Total rapporté aux ventes HT, taux arrondi : ' + decimal(reading.ratio) + ' %.',
        reading.balance === null ? balanceReason.textContent : 'Solde après ces deux coûts : ' + decimal(reading.balance) + ' €. Les autres coûts restent à financer.'
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

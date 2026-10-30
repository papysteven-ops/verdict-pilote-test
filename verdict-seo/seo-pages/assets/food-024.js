/* Individual page024: bounded inventory balance, separate from the application engine. */
(function (root) {
  'use strict';
  var keys = ['initial', 'purchases', 'final', 'sales'];
  var labels = ['le stock initial', 'les achats nets', 'le stock final', 'les ventes HT'];
  function parseMoney(value, signed) {
    var text = String(value).trim();
    if (!text) return { state: 'empty' };
    var negative = /^[-\u2212]/.test(text);
    if (negative && !signed) return { state: 'invalid', message: 'Ce montant doit être positif ou nul. Un ajustement négatif reste à rapprocher dans vos pièces, sans remplacement par zéro.' };
    if (negative) text = text.slice(1);
    if (text.length > 80 || !/^(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?:[,.]\d{1,2})?$/.test(text)) return { state: 'invalid', message: 'Utilisez au plus deux décimales et des espaces de milliers correctement groupés. Le signe moins est accepté seulement pour les achats nets ; ni plus ni exposant.' };
    var parts = text.replace(/[ \u00a0\u202f]/g, '').split(/[,.]/);
    if (parts[0].length > 15) return { state: 'invalid', message: 'Limitez la saisie à quinze chiffres avant le séparateur.' };
    var cents = BigInt(parts[0]) * 100n + BigInt((parts[1] || '').padEnd(2, '0'));
    return { state: 'valid', cents: negative ? -cents : cents };
  }
  function roundedDivision(numerator, denominator) {
    var negative = numerator < 0n, absolute = negative ? -numerator : numerator;
    var result = (2n * absolute + denominator) / (2n * denominator);
    return negative ? -result : result;
  }
  function nonnegative(value) { return typeof value === 'bigint' && value >= 0n; }
  function calculate(initial, purchases, final, sales) {
    var balance = nonnegative(initial) && typeof purchases === 'bigint' && nonnegative(final) ? initial + purchases - final : null;
    var usable = balance !== null && balance >= 0n;
    return {
      balance: balance,
      remaining: usable && nonnegative(sales) ? sales - balance : null,
      ratio: usable && nonnegative(sales) && sales > 0n ? roundedDivision(balance * 10000n, sales) : null
    };
  }
  function decimal(value) {
    var negative = value < 0n, absolute = negative ? -value : value;
    return (negative ? '-' : '') + (absolute / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + ',' + (absolute % 100n).toString().padStart(2, '0');
  }
  if (typeof module === 'object' && module.exports) module.exports = { parseMoney: parseMoney, calculate: calculate, decimal: decimal, roundedDivision: roundedDivision };
  if (!root.document) return;
  root.document.querySelectorAll('[data-f24-calculator]').forEach(function (box) {
    var inputs = keys.map(function (key) { return box.querySelector('[data-f24-input="' + key + '"]'); });
    var clear = box.querySelector('[data-f24-clear]'), status = box.querySelector('[data-f24-status]');
    var balance = box.querySelector('[data-f24-balance]'), remaining = box.querySelector('[data-f24-remaining]'), ratio = box.querySelector('[data-f24-ratio]');
    var balanceReason = box.querySelector('[data-f24-balance-reason]'), remainingReason = box.querySelector('[data-f24-remaining-reason]'), ratioReason = box.querySelector('[data-f24-ratio-reason]');
    if (inputs.some(function (node) { return !node; }) || !clear || !status || !balance || !remaining || !ratio || !balanceReason || !remainingReason || !ratioReason) return;
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
      var values = inputs.map(function (input, index) {
        var value = parseMoney(input.value, index === 1), error = input.closest('label').querySelector('[data-f24-error]');
        input.setAttribute('aria-invalid', String(value.state === 'invalid'));
        if (error) error.textContent = value.state === 'invalid' ? value.message : '';
        return value;
      });
      var reading = calculate.apply(null, values.map(function (value) { return value.state === 'valid' ? value.cents : null; }));
      var negative = reading.balance !== null && reading.balance < 0n;
      balance.textContent = reading.balance === null ? '—' : decimal(reading.balance) + ' €';
      remaining.textContent = reading.remaining === null ? '—' : decimal(reading.remaining) + ' €';
      ratio.textContent = reading.ratio === null ? '—' : decimal(reading.ratio) + ' %';
      balanceReason.textContent = reading.balance === null ? unavailable(values, [0, 1, 2], 'Solde matière') : negative ? 'Solde négatif à rapprocher : stocks, achats nets, avoirs, valorisation et autres mouvements. Ce résultat n’est pas une consommation valide dans le périmètre simplifié.' : 'Consommation calculée sous les conditions du périmètre simplifié exposées au-dessus. Le calcul ne vérifie ni les pièces ni la valorisation.';
      remainingReason.textContent = negative ? 'Solde ventes moins matière indisponible : le solde matière négatif doit être rapproché.' : reading.remaining === null ? unavailable(values, [0, 1, 2, 3], 'Solde ventes moins matière') : 'Ventes HT diminuées de la matière calculée sous les conditions exposées. Les autres variables, le personnel et les autres charges restent à couvrir.';
      ratioReason.textContent = negative ? 'Ratio indisponible : le solde matière négatif doit être rapproché.' : reading.balance === null ? 'Ratio indisponible tant que le solde matière ne peut pas être calculé.' : values[3].state !== 'valid' ? unavailable(values, [3], 'Ratio') : reading.ratio === null ? 'Ratio indisponible : les ventes HT sont nulles.' : 'Taux arrondi de la matière calculée aux ventes HT correspondantes. Un affichage à zéro ne prouve pas une matière exacte nulle.';
      box.dataset.resultState = negative ? 'needs-review' : reading.remaining !== null ? 'calculated' : reading.balance !== null ? 'partial' : 'unavailable';
      status.textContent = [
        reading.balance === null ? balanceReason.textContent : 'Solde matière d’inventaire HT : ' + decimal(reading.balance) + ' €. ' + balanceReason.textContent,
        reading.ratio === null ? ratioReason.textContent : 'Food cost calculé rapporté aux ventes HT, taux arrondi : ' + decimal(reading.ratio) + ' %.',
        reading.remaining === null ? remainingReason.textContent : 'Ventes moins matière calculée HT : ' + decimal(reading.remaining) + ' €. Les autres charges restent à couvrir.'
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

/* Individual page030: documented mass, retained unit cost and activity denominator. */
(function (root) {
  'use strict';
  var keys = ['quantity', 'cost', 'covers'];
  var labels = ['la quantité en kg', 'le coût retenu par kg', 'le nombre de couverts'];
  function parseDecimal(value, decimals) {
    var text = String(value).trim();
    if (!text) return { state: 'empty' };
    if (/^[-\u2212]/.test(text)) return { state: 'invalid', message: 'Utilisez une valeur positive ou nulle, sans signe moins même sur zéro. Vérifiez la mesure ou la pièce ; aucun signe n’est supprimé automatiquement.' };
    var pattern = new RegExp('^(?:\\d+|\\d{1,3}(?:[ \\u00a0\\u202f]\\d{3})+)' + (decimals ? '(?:[,.]\\d{1,' + decimals + '})?' : '') + '$');
    if (text.length > 80 || !pattern.test(text)) return { state: 'invalid', message: decimals ? 'Utilisez au plus ' + decimals + ' décimales, une virgule ou un point et des espaces de milliers correctement groupés. Ni signe plus ni exposant.' : 'Renseignez un nombre entier avec des espaces de milliers correctement groupés, sans décimale, signe plus ou exposant.' };
    var parts = text.replace(/[ \u00a0\u202f]/g, '').split(/[,.]/);
    if (parts[0].length > 15) return { state: 'invalid', message: 'Limitez la saisie à quinze chiffres avant le séparateur.' };
    var scale = 10n ** BigInt(decimals);
    return { state: 'valid', units: BigInt(parts[0]) * scale + BigInt((parts[1] || '').padEnd(decimals, '0') || '0') };
  }
  function parseQuantity(value) { return parseDecimal(value, 3); }
  function parseCost(value) { return parseDecimal(value, 4); }
  function parseCovers(value) { return parseDecimal(value, 0); }
  function roundedDivision(numerator, denominator) {
    if (typeof numerator !== 'bigint' || typeof denominator !== 'bigint' || denominator <= 0n) throw new RangeError('A positive integer denominator is required.');
    var negative = numerator < 0n, absolute = negative ? -numerator : numerator;
    var result = (2n * absolute + denominator) / (2n * denominator);
    return negative ? -result : result;
  }
  function nonnegative(value) { return typeof value === 'bigint' && value >= 0n; }
  function calculate(quantityGrams, costTenThousandths, covers) {
    return {
      valueCents: nonnegative(quantityGrams) && nonnegative(costTenThousandths) ? roundedDivision(quantityGrams * costTenThousandths, 100000n) : null,
      massPerCoverCentiGrams: nonnegative(quantityGrams) && nonnegative(covers) && covers > 0n ? roundedDivision(quantityGrams * 100n, covers) : null
    };
  }
  function decimal(value) {
    var negative = value < 0n, absolute = negative ? -value : value;
    return (negative ? '-' : '') + (absolute / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + ',' + (absolute % 100n).toString().padStart(2, '0');
  }
  if (typeof module === 'object' && module.exports) module.exports = { parseQuantity: parseQuantity, parseCost: parseCost, parseCovers: parseCovers, roundedDivision: roundedDivision, calculate: calculate, decimal: decimal };
  if (!root.document) return;
  root.document.querySelectorAll('[data-w30-calculator]').forEach(function (box) {
    var inputs = keys.map(function (key) { return box.querySelector('[data-w30-input="' + key + '"]'); });
    var clear = box.querySelector('[data-w30-clear]'), status = box.querySelector('[data-w30-status]');
    var valueOutput = box.querySelector('[data-w30-value]'), massOutput = box.querySelector('[data-w30-mass]');
    var valueReason = box.querySelector('[data-w30-value-reason]'), massReason = box.querySelector('[data-w30-mass-reason]');
    if (inputs.some(function (node) { return !node; }) || !clear || !status || !valueOutput || !massOutput || !valueReason || !massReason) return;
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
      var parsers = [parseQuantity, parseCost, parseCovers];
      var values = inputs.map(function (input, index) {
        var reading = parsers[index](input.value), error = input.closest('label').querySelector('[data-w30-error]');
        input.setAttribute('aria-invalid', String(reading.state === 'invalid'));
        if (error) error.textContent = reading.state === 'invalid' ? reading.message : '';
        return reading;
      });
      var reading = calculate.apply(null, values.map(function (item) { return item.state === 'valid' ? item.units : null; }));
      valueOutput.textContent = reading.valueCents === null ? '—' : decimal(reading.valueCents) + ' €';
      massOutput.textContent = reading.massPerCoverCentiGrams === null ? '—' : decimal(reading.massPerCoverCentiGrams) + ' g/couvert';
      valueReason.textContent = reading.valueCents === null ? unavailable(values, [0, 1], 'Valeur au coût retenu') : 'Valeur arrondie selon le coût renseigné, pas prix de vente ni économie acquise. Un coût connu nul ou un affichage arrondi à zéro ne prouve pas une quantité physique nulle.';
      massReason.textContent = reading.massPerCoverCentiGrams !== null ? 'Masse arrondie rapportée aux couverts renseignés pour ce périmètre. Ce n’est pas une portion physiquement perdue par personne ; un affichage à zéro ne prouve pas une quantité exacte nulle.' : values[0].state !== 'valid' || values[2].state !== 'valid' ? unavailable(values, [0, 2], 'Masse par couvert') : 'Masse par couvert indisponible : les couverts renseignés sont nuls. La valeur au coût reste calculable si ses données sont valides.';
      box.dataset.resultState = reading.valueCents !== null && reading.massPerCoverCentiGrams !== null ? 'calculated' : reading.valueCents !== null ? 'value-only' : reading.massPerCoverCentiGrams !== null ? 'mass-only' : 'unavailable';
      status.textContent = [
        reading.valueCents === null ? valueReason.textContent : 'Valeur au coût retenu, arrondie : ' + decimal(reading.valueCents) + ' €. ' + valueReason.textContent,
        reading.massPerCoverCentiGrams === null ? massReason.textContent : 'Masse mesurée par couvert du périmètre, arrondie : ' + decimal(reading.massPerCoverCentiGrams) + ' g/couvert. ' + massReason.textContent
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

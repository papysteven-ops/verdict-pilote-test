/* Individual page033: named HT bases and four independent readings. */
(function (root) {
  'use strict';
  var keys = ['price', 'cost'];
  var labels = ['le prix de vente HT', 'le coût matière HT'];
  var readingKeys = ['coefficient', 'difference', 'ratioPrice', 'ratioCost'];
  var names = ['Coefficient HT / coût matière HT', 'Différence prix HT − matière HT', 'Différence matière / prix HT', 'Différence matière / coût matière HT'];
  var places = [4, 2, 2, 2];
  var suffixes = [' ×', ' €', ' %', ' %'];
  function parseDecimal(value) {
    var text = String(value).trim();
    if (!text) return { state: 'empty' };
    if (/^[-\u2212]/.test(text)) return { state: 'invalid', message: 'Utilisez un montant positif ou nul, sans signe moins même sur zéro. Vérifiez la pièce ; aucun signe n’est supprimé automatiquement.' };
    if (text.length > 80 || !/^(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?:[,.]\d{1,4})?$/.test(text)) return { state: 'invalid', message: 'Utilisez au plus quatre décimales, une virgule ou un point et des espaces de milliers correctement groupés. Ni signe plus ni exposant. Une précision excédentaire n’est pas arrondie.' };
    var parts = text.replace(/[ \u00a0\u202f]/g, '').split(/[,.]/);
    if (parts[0].length > 15) return { state: 'invalid', message: 'Limitez la saisie à quinze chiffres avant le séparateur.' };
    return { state: 'valid', units: BigInt(parts[0]) * 10000n + BigInt((parts[1] || '').padEnd(4, '0') || '0') };
  }
  function parsePrice(value) { return parseDecimal(value); }
  function parseCost(value) { return parseDecimal(value); }
  function roundedDivision(numerator, denominator) {
    if (typeof numerator !== 'bigint' || typeof denominator !== 'bigint' || denominator <= 0n) throw new RangeError('A positive integer denominator is required.');
    var negative = numerator < 0n, absolute = negative ? -numerator : numerator;
    var rounded = (2n * absolute + denominator) / (2n * denominator);
    return negative ? -rounded : rounded;
  }
  function nonnegative(value) { return typeof value === 'bigint' && value >= 0n; }
  function sign(value) { return value === 0n ? 'zero' : value > 0n ? 'positive' : 'negative'; }
  function calculate(price, cost) {
    var result = { state: 'unavailable', coefficient: null, difference: null, ratioPrice: null, ratioCost: null, exactSigns: {}, nonzeroRoundedZero: {} };
    readingKeys.forEach(function (key) { result.exactSigns[key] = null; result.nonzeroRoundedZero[key] = false; });
    if (!nonnegative(price) || !nonnegative(cost)) return result;
    var difference = price - cost;
    function record(key, numerator, denominator) {
      result[key] = roundedDivision(numerator, denominator);
      result.exactSigns[key] = sign(numerator);
      result.nonzeroRoundedZero[key] = numerator !== 0n && result[key] === 0n;
    }
    record('difference', difference, 100n);
    if (cost > 0n) {
      record('coefficient', 10000n * price, cost);
      record('ratioCost', 10000n * difference, cost);
    }
    if (price > 0n) record('ratioPrice', 10000n * difference, price);
    result.state = price === 0n && cost === 0n ? 'zero-both' : price === 0n ? 'zero-price' : cost === 0n ? 'zero-cost' : 'calculated';
    return result;
  }
  function formatUnits(value, decimals) {
    if (typeof value !== 'bigint' || (decimals !== 2 && decimals !== 4)) throw new RangeError('A scaled integer with two or four decimal places is required.');
    var negative = value < 0n, absolute = negative ? -value : value, scale = 10n ** BigInt(decimals);
    return (negative ? '-' : '') + (absolute / scale).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + ',' + (absolute % scale).toString().padStart(decimals, '0');
  }
  if (typeof module === 'object' && module.exports) module.exports = { parsePrice: parsePrice, parseCost: parseCost, roundedDivision: roundedDivision, calculate: calculate, formatUnits: formatUnits };
  if (!root.document) return;
  root.document.querySelectorAll('[data-c33-calculator]').forEach(function (box) {
    var inputs = keys.map(function (key) { return box.querySelector('[data-c33-input="' + key + '"]'); });
    var clear = box.querySelector('[data-c33-clear]'), status = box.querySelector('[data-c33-status]');
    var outputs = readingKeys.map(function (key) { return box.querySelector('[data-c33-output="' + key + '"]'); });
    var reasons = readingKeys.map(function (key) { return box.querySelector('[data-c33-reason="' + key + '"]'); });
    if (inputs.some(function (node) { return !node; }) || !clear || !status || outputs.some(function (node) { return !node; }) || reasons.some(function (node) { return !node; })) return;
    function unavailable(values) {
      var invalid = [], empty = [];
      values.forEach(function (value, index) {
        if (value.state === 'invalid') invalid.push(labels[index]);
        else if (value.state === 'empty') empty.push(labels[index]);
      });
      var parts = [];
      if (invalid.length) parts.push('corrigez ' + invalid.join(' et '));
      if (empty.length) parts.push('renseignez ' + empty.join(' et '));
      return 'Lectures indisponibles : ' + parts.join(' ; ') + '. Une donnée inconnue ne devient pas zéro.';
    }
    function smallReason(result, key) {
      if (!result.nonzeroRoundedZero[key]) return '';
      var adjective = result.exactSigns[key] === 'negative' ? 'négative' : 'positive';
      return 'Valeur exacte ' + adjective + ' inférieure à la précision affichée : le zéro affiché est un arrondi, pas une valeur exactement nulle' + (adjective === 'négative' ? ', une égalité ou un équilibre.' : '.') + ' ';
    }
    function update() {
      var parsers = [parsePrice, parseCost];
      var values = inputs.map(function (input, index) {
        var reading = parsers[index](input.value), error = input.closest('label').querySelector('[data-c33-error]');
        input.setAttribute('aria-invalid', String(reading.state === 'invalid'));
        if (error) error.textContent = reading.state === 'invalid' ? reading.message : '';
        return reading;
      });
      var result = calculate.apply(null, values.map(function (value) { return value.state === 'valid' ? value.units : null; }));
      outputs.forEach(function (output, index) {
        var amount = result[readingKeys[index]];
        output.textContent = amount === null ? '—' : formatUnits(amount, places[index]) + suffixes[index];
      });
      if (result.state === 'unavailable') {
        var sharedReason = unavailable(values);
        reasons.forEach(function (reason) { reason.textContent = sharedReason; });
        status.textContent = sharedReason;
      } else {
        reasons[0].textContent = result.coefficient === null ? 'Coefficient indisponible : le coût matière HT est connu nul ; on ne divise pas par ce zéro.' : smallReason(result, 'coefficient') + (result.exactSigns.coefficient === 'zero' ? 'Coefficient exactement nul : le prix HT est connu nul et le coût matière strictement positif.' : 'Rapport du prix HT au coût matière HT de la même unité, arrondi à quatre décimales. Il ne donne ni les euros de la période ni le bénéfice.');
        reasons[1].textContent = smallReason(result, 'difference') + (result.exactSigns.difference === 'zero' ? 'Différence exactement nulle pour ces deux montants connus ; les autres coûts restent hors de ce périmètre.' : 'Différence du prix HT et du coût matière HT, arrondie au centime. Son signe exact est ' + (result.exactSigns.difference === 'negative' ? 'négatif' : 'positif') + ' ; les postes non retirés restent à examiner.');
        reasons[2].textContent = result.ratioPrice === null ? 'Rapport au prix indisponible : le prix HT est connu nul. Cela ne supprime pas les autres lectures dont les données permettent le calcul.' : smallReason(result, 'ratioPrice') + 'La même différence exacte est rapportée au prix HT strictement positif. Ce pourcentage ne reprend pas la différence en euros déjà arrondie.';
        reasons[3].textContent = result.ratioCost === null ? 'Rapport au coût indisponible : le coût matière HT est connu nul. La différence peut rester calculable ; ce quotient ne vaut pas zéro.' : smallReason(result, 'ratioCost') + 'La même différence exacte est rapportée au coût matière HT strictement positif. Le dénominateur diffère du rapport au prix ; aucun seuil ou classement n’est imposé.';
        status.textContent = 'Données connues. ' + readingKeys.map(function (key, index) {
          var amount = result[key];
          if (amount === null) return names[index] + ' indisponible : ' + (key === 'ratioPrice' ? 'prix HT connu nul' : 'coût matière connu nul');
          return names[index] + ' : ' + formatUnits(amount, places[index]) + suffixes[index] + (result.nonzeroRoundedZero[key] ? ', exact ' + (result.exactSigns[key] === 'negative' ? 'négatif' : 'positif') + ' inférieur à la précision affichée' : '');
        }).join(' ; ') + '. Les raisons de chaque lecture restent ci-dessous.';
      }
      box.dataset.resultState = result.state;
    }
    inputs.forEach(function (input) { input.addEventListener('input', update); });
    clear.addEventListener('click', function () { inputs.forEach(function (input) { input.value = ''; }); update(); inputs[0].focus(); });
    update();
    inputs.forEach(function (input) { input.disabled = false; });
    clear.disabled = false;
    box.dataset.calculatorReady = 'true';
  });
})(typeof window === 'undefined' ? globalThis : window);

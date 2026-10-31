/* Individual page032: a declared material-share equation, distinct from native price planning. */
(function (root) {
  'use strict';
  var keys = ['cost', 'target', 'vat'];
  var labels = ['le coût matière HT', 'la cible matière', 'la TVA retenue'];
  var names = ['Prix HT issu de la cible matière', 'Prix TTC avec la TVA renseignée'];
  function parseDecimal(value) {
    var text = String(value).trim();
    if (!text) return { state: 'empty' };
    if (/^[-\u2212]/.test(text)) return { state: 'invalid', message: 'Utilisez une valeur positive ou nulle, sans signe moins même sur zéro. Vérifiez la pièce ou la valeur ; aucun signe n’est supprimé automatiquement.' };
    if (text.length > 80 || !/^(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?:[,.]\d{1,4})?$/.test(text)) return { state: 'invalid', message: 'Utilisez au plus quatre décimales, une virgule ou un point et des espaces de milliers correctement groupés. Ni signe plus ni exposant. Une précision excédentaire n’est pas arrondie.' };
    var parts = text.replace(/[ \u00a0\u202f]/g, '').split(/[,.]/);
    if (parts[0].length > 15) return { state: 'invalid', message: 'Limitez la saisie à quinze chiffres avant le séparateur.' };
    return { state: 'valid', units: BigInt(parts[0]) * 10000n + BigInt((parts[1] || '').padEnd(4, '0') || '0') };
  }
  function parseCost(value) { return parseDecimal(value); }
  function parseTarget(value) { return parseDecimal(value); }
  function parseVAT(value) { return parseDecimal(value); }
  function roundedDivision(numerator, denominator) {
    if (typeof numerator !== 'bigint' || typeof denominator !== 'bigint' || denominator <= 0n) throw new RangeError('A positive integer denominator is required.');
    var negative = numerator < 0n, absolute = negative ? -numerator : numerator;
    var rounded = (2n * absolute + denominator) / (2n * denominator);
    return negative ? -rounded : rounded;
  }
  function nonnegative(value) { return typeof value === 'bigint' && value >= 0n; }
  function calculate(cost, target, vat) {
    var result = { domainState: 'unavailable', htCents: null, ttcCents: null, htPositiveRoundedZero: false, ttcPositiveRoundedZero: false, targetAboveHundred: false };
    if (!nonnegative(cost) || !nonnegative(target)) return result;
    if (cost === 0n && target === 0n) { result.domainState = 'indeterminate'; return result; }
    if (cost === 0n) { result.domainState = 'zero-cost'; return result; }
    if (target === 0n) { result.domainState = 'zero-target'; return result; }
    result.htCents = roundedDivision(10000n * cost, target);
    result.htPositiveRoundedZero = result.htCents === 0n;
    result.targetAboveHundred = target > 1000000n;
    if (nonnegative(vat)) {
      result.ttcCents = roundedDivision(10000n * cost * (1000000n + vat), 1000000n * target);
      result.ttcPositiveRoundedZero = result.ttcCents === 0n;
    }
    result.domainState = result.ttcCents === null ? 'ht-only' : 'calculated';
    return result;
  }
  function decimal(value) {
    var negative = value < 0n, absolute = negative ? -value : value;
    return (negative ? '-' : '') + (absolute / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + ',' + (absolute % 100n).toString().padStart(2, '0');
  }
  if (typeof module === 'object' && module.exports) module.exports = { parseCost: parseCost, parseTarget: parseTarget, parseVAT: parseVAT, roundedDivision: roundedDivision, calculate: calculate, decimal: decimal };
  if (!root.document) return;
  root.document.querySelectorAll('[data-p32-calculator]').forEach(function (box) {
    var inputs = keys.map(function (key) { return box.querySelector('[data-p32-input="' + key + '"]'); });
    var clear = box.querySelector('[data-p32-clear]'), status = box.querySelector('[data-p32-status]');
    var outputs = [box.querySelector('[data-p32-ht]'), box.querySelector('[data-p32-ttc]')];
    var reasons = [box.querySelector('[data-p32-ht-reason]'), box.querySelector('[data-p32-ttc-reason]')];
    if (inputs.some(function (node) { return !node; }) || !clear || !status || outputs.some(function (node) { return !node; }) || reasons.some(function (node) { return !node; })) return;
    function unavailable(values, positions, name) {
      var invalid = [], empty = [];
      positions.forEach(function (position) {
        if (values[position].state === 'invalid') invalid.push(labels[position]);
        else if (values[position].state === 'empty') empty.push(labels[position]);
      });
      var messages = [];
      if (invalid.length) messages.push('corrigez ' + invalid.join(', '));
      if (empty.length) messages.push('renseignez ' + empty.join(', '));
      return name + ' indisponible : ' + messages.join(' ; ') + '. Une donnée inconnue ne devient pas zéro.';
    }
    function zeroReason(state) {
      if (state === 'zero-cost') return 'Coût matière connu nul et cible positive : aucun prix positif ne réalise cette part. La valeur algébrique nulle conduirait à 0/0 ; aucun prix gratuit n’est proposé.';
      if (state === 'zero-target') return 'Coût matière positif et cible connue nulle : aucun prix fini ne réalise cette part.';
      return 'Coût matière et cible connus nuls : le prix reste indéterminé. Ces données ne déterminent aucun prix unique.';
    }
    function smallReason(flag) { return flag ? 'Montant positif inférieur à la précision affichée : 0,00 € est ici un arrondi de lecture, pas un prix nul ou gratuit. ' : ''; }
    function update() {
      var parsers = [parseCost, parseTarget, parseVAT];
      var values = inputs.map(function (input, index) {
        var reading = parsers[index](input.value), error = input.closest('label').querySelector('[data-p32-error]');
        input.setAttribute('aria-invalid', String(reading.state === 'invalid'));
        if (error) error.textContent = reading.state === 'invalid' ? reading.message : '';
        return reading;
      });
      var result = calculate.apply(null, values.map(function (item) { return item.state === 'valid' ? item.units : null; }));
      var amounts = [result.htCents, result.ttcCents];
      outputs.forEach(function (output, index) { output.textContent = amounts[index] === null ? '—' : decimal(amounts[index]) + ' €'; });
      if (['zero-cost', 'zero-target', 'indeterminate'].indexOf(result.domainState) !== -1) {
        reasons[0].textContent = zeroReason(result.domainState);
        reasons[1].textContent = 'Prix TTC indisponible pour la même raison. ' + zeroReason(result.domainState);
      } else {
        reasons[0].textContent = result.htCents === null ? unavailable(values, [0, 1], names[0]) : smallReason(result.htPositiveRoundedZero) + 'Prix arrondi issu de cette équation de cible matière. Reprendre cet affichage comme tarif peut modifier le ratio ; aucun arrondi commercial n’est choisi.' + (result.targetAboveHundred ? ' La cible dépasse cent pour cent : le prix HT exact est inférieur au coût matière, avant les autres coûts.' : '');
        reasons[1].textContent = result.ttcCents === null ? unavailable(values, result.htCents === null ? [0, 1, 2] : [2], names[1]) : smallReason(result.ttcPositiveRoundedZero) + 'Prix arrondi depuis le HT exact et la TVA renseignée. Le taux applicable et le tarif commercial restent à vérifier ; ce calcul n’établit pas une facture.';
      }
      box.dataset.resultState = result.domainState;
      status.textContent = amounts.map(function (amount, index) {
        var reason = reasons[index].textContent;
        if (amount === null) return reason.indexOf(names[index]) === 0 ? reason : names[index] + ' : ' + reason;
        return names[index] + ', arrondi : ' + decimal(amount) + ' €. ' + reason;
      }).join(' ');
    }
    inputs.forEach(function (input) { input.addEventListener('input', update); });
    clear.addEventListener('click', function () { inputs.forEach(function (input) { input.value = ''; }); update(); inputs[0].focus(); });
    update();
    inputs.forEach(function (input) { input.disabled = false; });
    clear.disabled = false;
    box.dataset.calculatorReady = 'true';
  });
})(typeof window === 'undefined' ? globalThis : window);

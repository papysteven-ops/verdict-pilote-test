/* Three explicit amounts, in cents. Separate from the application engine. */
(function (root) {
  'use strict';
  function parseMoney(value) {
    var text = String(value).trim();
    if (!text) return { state: 'empty' };
    if (text.length > 80 || !/^(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?:[,.]\d{1,2})?$/.test(text)) return { state: 'invalid', message: 'Utilisez un montant positif ou nul, avec au plus deux décimales.' };
    var parts = text.replace(/[ \u00a0\u202f]/g, '').split(/[,.]/);
    if (parts[0].length > 15) return { state: 'invalid', message: 'Limitez le montant à quinze chiffres avant le séparateur.' };
    return { state: 'valid', cents: BigInt(parts[0]) * 100n + BigInt((parts[1] || '').padEnd(2, '0')) };
  }
  function roundedDivision(numerator, denominator) {
    var negative = numerator < 0n;
    var absolute = negative ? -numerator : numerator;
    var rounded = (2n * absolute + denominator) / (2n * denominator);
    return negative ? -rounded : rounded;
  }
  function calculate(sales, variable, other) {
    var contribution = sales - variable;
    var balance = contribution - other;
    return { contribution: contribution, balance: balance, ratio: sales > 0n ? roundedDivision(balance * 10000n, sales) : null };
  }
  function decimal(value) {
    var negative = value < 0n, absolute = negative ? -value : value;
    return (negative ? '-' : '') + (absolute / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + ',' + (absolute % 100n).toString().padStart(2, '0');
  }
  if (typeof module === 'object' && module.exports) module.exports = { parseMoney: parseMoney, calculate: calculate, decimal: decimal };
  if (!root.document) return;
  root.document.querySelectorAll('[data-r8-calculator]').forEach(function (box) {
    var inputs = ['sales', 'variable', 'other'].map(function (key) { return box.querySelector('[data-r8-input="' + key + '"]'); });
    var clear = box.querySelector('[data-r8-clear]'), status = box.querySelector('[data-r8-status]');
    var contribution = box.querySelector('[data-r8-contribution]'), balance = box.querySelector('[data-r8-balance]'), ratio = box.querySelector('[data-r8-ratio]');
    if (inputs.some(function (node) { return !node; }) || !clear || !status || !contribution || !balance || !ratio) return;
    function update() {
      var values = inputs.map(function (input) {
        var value = parseMoney(input.value), error = input.closest('label').querySelector('[data-r8-error]');
        input.setAttribute('aria-invalid', String(value.state === 'invalid'));
        if (error) error.textContent = value.state === 'invalid' ? value.message : '';
        return value;
      });
      if (values.some(function (value) { return value.state !== 'valid'; })) {
        contribution.textContent = balance.textContent = ratio.textContent = '—';
        box.dataset.resultState = 'unavailable';
        status.textContent = values.some(function (value) { return value.state === 'invalid'; }) ? 'Calcul indisponible : corrigez le ou les montants signalés.' : 'Renseignez les trois montants. Une case vide n’est pas un zéro.';
        return;
      }
      var result = calculate(values[0].cents, values[1].cents, values[2].cents);
      contribution.textContent = decimal(result.contribution) + ' €';
      balance.textContent = decimal(result.balance) + ' €';
      ratio.textContent = result.ratio === null ? 'Non applicable : ventes nulles' : decimal(result.ratio) + ' %';
      box.dataset.resultState = 'calculated';
      status.textContent = 'Calcul des seuls postes renseignés. Vérifiez les charges absentes avant de conclure.';
    }
    inputs.forEach(function (input) { input.addEventListener('input', update); });
    clear.addEventListener('click', function () { inputs.forEach(function (input) { input.value = ''; }); update(); inputs[0].focus(); });
    update();
    inputs.forEach(function (input) { input.disabled = false; });
    clear.disabled = false;
    box.dataset.calculatorReady = 'true';
  });
})(typeof window === 'undefined' ? globalThis : window);

/* Two independent periods. Exact signed changes, never a causal ranking. */
(function (root) {
  'use strict';
  var posts = ['sales', 'material', 'staff', 'variable', 'other'];
  function parseMoney(value) {
    var text = String(value).trim();
    if (!text) return { state: 'empty' };
    if (/^[-\u2212]/.test(text)) return { state: 'invalid', message: 'Une entrée négative sort du domaine de cet outil. Ne la remplacez pas par zéro ; reprenez son périmètre hors outil.' };
    if (text.length > 80 || !/^(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?:[,.]\d{1,2})?$/.test(text)) return { state: 'invalid', message: 'Utilisez un montant positif ou nul, avec au plus deux décimales et des groupes de milliers complets.' };
    var parts = text.replace(/[ \u00a0\u202f]/g, '').split(/[,.]/);
    if (parts[0].length > 15) return { state: 'invalid', message: 'Limitez le montant à quinze chiffres avant le séparateur.' };
    return { state: 'valid', cents: BigInt(parts[0]) * 100n + BigInt((parts[1] || '').padEnd(2, '0')) };
  }
  function periodBalance(values) { return values[0] - values[1] - values[2] - values[3] - values[4]; }
  function compare(a, b) {
    var variations = a.map(function (value, index) { return b[index] - value; });
    var terms = variations.map(function (value, index) { return index === 0 ? value : -value; });
    return { variations: variations, terms: terms, sum: terms.reduce(function (sum, term) { return sum + term; }, 0n), delta: periodBalance(b) - periodBalance(a) };
  }
  function money(value, signed) {
    var negative = value < 0n, absolute = negative ? -value : value;
    return (negative ? '-' : (signed && value > 0n ? '+' : '')) + (absolute / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + ',' + (absolute % 100n).toString().padStart(2, '0') + ' €';
  }
  if (typeof module === 'object' && module.exports) module.exports = { parseMoney: parseMoney, periodBalance: periodBalance, compare: compare, money: money };
  if (!root.document) return;
  root.document.querySelectorAll('[data-c11-calculator]').forEach(function (box) {
    var periods = ['a', 'b'].map(function (key) {
      return { key: key, output: box.querySelector('[data-c11-balance="' + key + '"]'), inputs: posts.map(function (post) { return box.querySelector('[data-c11-input][data-period="' + key + '"][data-post="' + post + '"]'); }) };
    });
    var delta = box.querySelector('[data-c11-delta]'), sum = box.querySelector('[data-c11-sum]'), status = box.querySelector('[data-c11-status]'), clear = box.querySelector('[data-c11-clear]');
    var rows = posts.map(function (post) { var row = box.querySelector('[data-c11-row="' + post + '"]'); return row ? { variation: row.querySelector('[data-c11-variation]'), term: row.querySelector('[data-c11-term]') } : null; });
    if (periods.some(function (period) { return !period.output || period.inputs.some(function (input) { return !input; }); }) || rows.some(function (row) { return !row || !row.variation || !row.term; }) || !delta || !sum || !status || !clear) return;
    function update() {
      var states = periods.map(function (period) {
        var values = period.inputs.map(function (input) {
          var value = parseMoney(input.value), error = input.closest('label').querySelector('[data-c11-error]');
          input.setAttribute('aria-invalid', String(value.state === 'invalid'));
          if (error) error.textContent = value.state === 'invalid' ? value.message : '';
          return value;
        });
        var complete = values.every(function (value) { return value.state === 'valid'; });
        period.output.textContent = complete ? money(periodBalance(values.map(function (value) { return value.cents; })), false) : '—';
        box.dataset[period.key + 'State'] = complete ? 'calculated' : 'unavailable';
        return { complete: complete, values: values };
      });
      delta.textContent = sum.textContent = '—';
      rows.forEach(function (row) { row.variation.textContent = row.term.textContent = '—'; });
      if (!states[0].complete || !states[1].complete) {
        box.dataset.resultState = 'partial';
        var invalid = states.some(function (state) { return state.values.some(function (value) { return value.state === 'invalid'; }); });
        status.textContent = invalid ? 'Des montants sont hors du contrat de saisie. Relisez les messages des champs ; les soldes des périodes complètes restent lisibles, sans variation conservée.' : states[0].complete ? 'Le solde des postes de A est disponible. Complétez B pour comparer ; aucune variation n’est conservée.' : states[1].complete ? 'Le solde des postes de B est disponible. Complétez A pour comparer ; aucune variation n’est conservée.' : 'Renseignez les postes connus. Une case vide ne devient pas zéro ; chaque période peut être lue séparément.';
        return;
      }
      var result = compare(states[0].values.map(function (value) { return value.cents; }), states[1].values.map(function (value) { return value.cents; }));
      delta.textContent = money(result.delta, true);
      sum.textContent = money(result.sum, true);
      rows.forEach(function (row, index) { row.variation.textContent = money(result.variations[index], true); row.term.textContent = money(result.terms[index], true); });
      box.dataset.resultState = 'calculated';
      status.textContent = 'Les deux jeux de postes sont renseignés. La décomposition explique une égalité arithmétique, sans identifier une cause.';
    }
    periods.forEach(function (period) { period.inputs.forEach(function (input) { input.addEventListener('input', update); }); });
    clear.addEventListener('click', function () { periods.forEach(function (period) { period.inputs.forEach(function (input) { input.value = ''; }); }); update(); periods[0].inputs[0].focus(); });
    update();
    periods.forEach(function (period) { period.inputs.forEach(function (input) { input.disabled = false; }); });
    clear.disabled = false;
    box.dataset.calculatorReady = 'true';
  });
})(typeof window === 'undefined' ? globalThis : window);

(function(root){'use strict';
  var PRICES={"pilotage":{"monthly":6900,"annual":69000,"extraMonthly":3900,"extraAnnual":39000},"pro":{"monthly":12900,"annual":129000,"extraMonthly":6900,"extraAnnual":69000}};
  function total(plan,count){var p=Object.prototype.hasOwnProperty.call(PRICES,plan)?PRICES[plan]:null;if(!p||!Number.isSafeInteger(count)||(count<1||count>500))return null;var n=BigInt(count-1),m=BigInt(p.monthly)+n*BigInt(p.extraMonthly),a=BigInt(p.annual)+n*BigInt(p.extraAnnual);return {monthlyCents:m.toString(),annualCents:a.toString()};}
  var api={version:'V2-A9',prices:PRICES,total:total};
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.VerdictPublicOffer=api;
  if(!root.document)return;
  function euros(s){var b=BigInt(s),whole=(b/100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'\u202f'),c=(b%100n).toString().padStart(2,'0');return whole+(c==='00'?'':','+c)+' €';}
  root.document.querySelectorAll('[data-a9-offer-calculator]').forEach(function(box){
    var plan=box.querySelector('[data-a9-plan]'),count=box.querySelector('[data-a9-count]');
    var monthly=box.querySelector('[data-a9-monthly]'),annual=box.querySelector('[data-a9-annual]');
    var context=box.querySelector('[data-a9-context]'),error=box.querySelector('[data-a9-error]');
    if(!plan||!count||!monthly||!annual)return;
    function update(){
      var raw=count.value.trim(),n=/^[1-9]\d*$/.test(raw)?Number(raw):NaN;
      var countValid=Number.isSafeInteger(n)&&n>=1&&n<=500;
      var planValid=Object.prototype.hasOwnProperty.call(PRICES,plan.value);
      var result=planValid&&countValid?total(plan.value,n):null;
      count.setAttribute('aria-invalid',String(!countValid));
      plan.setAttribute('aria-invalid',String(!planValid));
      box.dataset.resultState=result?'calculated':'unavailable';
      if(!result){
        monthly.textContent='—';annual.textContent='—';
        if(context)context.textContent='Calcul indisponible';
        if(error)error.textContent=!planValid?'Choisissez Pilotage ou Pro.':'Saisissez un nombre entier d’établissements entre 1 et 500.';
        return;
      }
      monthly.textContent=euros(result.monthlyCents)+' HT / mois';
      annual.textContent=euros(result.annualCents)+' HT pour douze mois';
      if(context)context.textContent='Tarifs standard prévus · '+(plan.value==='pilotage'?'Pilotage':'Pro')+' · '+n+' établissement'+(n>1?'s':'')+', premier inclus';
      if(error)error.textContent='';
    }
    plan.addEventListener('change',update);count.addEventListener('input',update);
    update();
    plan.disabled=false;count.disabled=false;
    box.dataset.calculatorReady='true';
  });
})(typeof window==='undefined'?globalThis:window);

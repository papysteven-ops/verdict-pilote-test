(function(root){'use strict';
  var PRICES={"pilotage":{"monthly":6900,"annual":69000,"extraMonthly":3900,"extraAnnual":39000},"pro":{"monthly":12900,"annual":129000,"extraMonthly":6900,"extraAnnual":69000}};
  function total(plan,count){var p=PRICES[plan];if(!p||!Number.isSafeInteger(count)||(count<1||count>500))return null;var n=BigInt(count-1),m=BigInt(p.monthly)+n*BigInt(p.extraMonthly),a=BigInt(p.annual)+n*BigInt(p.extraAnnual);return {monthlyCents:m.toString(),annualCents:a.toString()};}
  var api={version:'V2-A9',prices:PRICES,total:total};
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.VerdictPublicOffer=api;
  if(!root.document)return;
  function euros(s){var b=BigInt(s),whole=(b/100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'\u202f'),c=(b%100n).toString().padStart(2,'0');return whole+(c==='00'?'':','+c)+' €';}
  root.document.querySelectorAll('[data-a9-offer-calculator]').forEach(function(box){var plan=box.querySelector('[data-a9-plan]'),count=box.querySelector('[data-a9-count]');function update(){var raw=count.value.trim(),n=/^[1-9]\d*$/.test(raw)?Number(raw):NaN,t=total(plan.value,n);box.querySelector('[data-a9-monthly]').textContent=t?euros(t.monthlyCents)+' HT / mois':'Saisissez un entier entre 1 et 500';box.querySelector('[data-a9-annual]').textContent=t?euros(t.annualCents)+' HT pour douze mois':'—';}plan.addEventListener('change',update);count.addEventListener('input',update);update();});
})(typeof window==='undefined'?globalThis:window);

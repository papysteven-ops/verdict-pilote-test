/* Information interactive : données du calculateur existant, sans requête ni seuil supposé. */
(function(){'use strict';
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const tabs=[...document.querySelectorAll('[data-info-tab]')],panels=[...document.querySelectorAll('[data-info-panel]')];
if(tabs.length&&panels.length){
 const nav=tabs[0].closest('nav');if(nav)nav.setAttribute('role','tablist');
 function show(name,focus=false){const selected=panels.find(p=>p.dataset.infoPanel===name);if(!selected)return;
  panels.forEach(p=>{p.hidden=p!==selected;p.setAttribute('role','tabpanel');});
  tabs.forEach((t,i)=>{const yes=t.dataset.infoTab===name;t.setAttribute('role','tab');t.id=t.id||'info-tab-'+i;t.setAttribute('aria-selected',String(yes));t.tabIndex=yes?0:-1;t.classList.toggle('active',yes);const p=panels.find(x=>x.dataset.infoPanel===t.dataset.infoTab);if(p){t.setAttribute('aria-controls',p.id);p.setAttribute('aria-labelledby',t.id);}if(yes&&focus)t.focus();});
 }
 function openAncestors(target){let node=target;while(node){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}}
 function revealHash(){let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{}if(!target)return false;const panel=target.closest('[data-info-panel]');if(panel)show(panel.dataset.infoPanel);openAncestors(target);return !!panel;}
 tabs.forEach((t,i)=>{t.addEventListener('click',e=>{e.preventDefault();show(t.dataset.infoTab);if(location.protocol!=='about:'){try{history.replaceState(null,'','#'+t.getAttribute('aria-controls'));}catch{}}});t.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();show(tabs[n].dataset.infoTab,true);}});});
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||a.hasAttribute('data-info-tab'))return;let target;try{target=document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));}catch{}const panel=target?.closest('[data-info-panel]');if(panel){show(panel.dataset.infoPanel);openAncestors(target);}});
 show('understand');if(revealHash())requestAnimationFrame(()=>{try{document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();}catch{}});addEventListener('hashchange',revealHash);document.documentElement.classList.add('info-enhanced');
 addEventListener('beforeprint',()=>{panels.forEach(p=>p.hidden=false);document.querySelectorAll('.info-deep-dive,.info-answer-detail').forEach(d=>{d.dataset.wasOpen=String(d.open);d.open=true;});});
 addEventListener('afterprint',()=>{show(tabs.find(t=>t.getAttribute('aria-selected')==='true')?.dataset.infoTab||'understand');document.querySelectorAll('[data-was-open]').forEach(d=>{d.open=d.dataset.wasOpen==='true';delete d.dataset.wasOpen;});});
}
const live=document.querySelector('[data-info-live]'),calc=document.querySelector('[data-verdict-calculator]');
if(!calc)return;
const api=window.VerdictExperience,base=window.VerdictSeoCalculs;if(!api||!base)return;
const kind=calc.dataset.verdictCalculator,engine=calc.dataset.engine||'base',descriptor=api.descriptor(kind,engine);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=n=>Number.isFinite(n)?new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(n):'—';
const fmt=(n,u='€')=>typeof n==='string'?n:number(n)+(Number.isFinite(n)&&u?' '+u:'');
const controls=()=>[...calc.querySelectorAll('[data-value]')];
const getValues=()=>controls().map(e=>e.type==='checkbox'?Number(e.checked):base.parse(e.value));
const label=i=>(controls()[i]?.getAttribute('aria-label')||descriptor.labels[i]||'Donnée').replace(/\s*\([^()]*\)\s*$/,'');
const unitFor=i=>descriptor.fields[i]?.unit||(/\((€|%|kg|ml|h|jours|mois|unités|kWh)\)\s*$/.exec(controls()[i]?.getAttribute('aria-label')||descriptor.labels[i]||'')?.[1]||'');
const stage=(i,markup)=>'<div class="info-stage" data-info-stage="'+i+'">'+markup+'</div>';
function bars(rows,note='Même unité, même échelle. Les valeurs négatives partent à gauche de zéro.'){
 rows=rows.filter(row=>Number.isFinite(row.value));const neg=rows.some(r=>r.value<0),max=Math.max(1,...rows.map(r=>Math.abs(r.value))),origin=neg?220:0,space=neg?220:440;
 return '<div class="info-chart-bars">'+rows.map((r,i)=>{const w=Math.abs(r.value)/max*space,x=r.value<0?origin-w:origin;return stage(i,'<div class="info-data-row"><span>'+esc(r.label)+'</span><strong class="'+(r.value<0?'is-negative':'')+'">'+esc(fmt(r.value,r.unit??'€'))+'</strong><svg viewBox="0 0 440 13" preserveAspectRatio="none" aria-hidden="true"><rect class="info-bar-track" x="0" y="2" width="440" height="9" rx="4.5"/><rect class="info-bar '+(r.value<0?'is-negative':r.result?'is-result':'')+'" x="'+x+'" y="2" width="'+w+'" height="9" rx="4.5"/>'+(neg?'<path class="info-zero-line" d="M220 0v13"/>':'')+'</svg></div>');}).join('')+'</div><p class="info-chart-note">'+esc(note)+'</p>';
}
function equation(nodes,operators,result,note=descriptor.formula){
 const all=[...nodes,{label:descriptor.outputs[0],value:fmt(result[0],descriptor.units[0]),result:true}];
 return '<div class="info-calculation-chain">'+all.map((n,i)=>{
  const link=i?'<span class="info-chain-link" aria-hidden="true"><svg viewBox="0 0 22 22"><text x="11" y="16" text-anchor="middle">'+esc(i===all.length-1?'=':operators[i-1]||'→')+'</text></svg></span>':'';
  return link+stage(i,'<div class="info-chain-node '+(n.result?'is-result':'')+'"><span>'+esc(n.label)+'</span><strong>'+esc(n.value)+'</strong></div>');
 }).join('')+'</div><p class="info-chart-note">'+esc(note)+'</p>';
}
function chain(values,result){
 return equation(values.slice(0,4).map((v,i)=>({label:label(i),value:fmt(v,unitFor(i))})),[],result);
}
function foodGraph(v,r){
 const ratio=r[1],share=Math.min(100,Math.max(0,ratio)),steps=[['Stock initial',v[0]],['+ Achats nets',v[1]],['− Stock final',v[2]],['= Consommation',r[0]]];
 return '<div class="info-food-chart"><div class="info-euro-ring">'+stage(0,'<svg viewBox="0 0 180 180" role="img" aria-label="'+esc(number(ratio))+' centimes de matière pour un euro de ventes HT"><circle class="info-ring-track" cx="90" cy="90" r="68"/><circle class="info-ring-value '+(ratio>100?'is-negative':'')+'" cx="90" cy="90" r="68" pathLength="100" stroke-dasharray="'+share+' 100" transform="rotate(-90 90 90)"/></svg><div class="info-ring-center"><strong>1 €</strong><span>de ventes HT</span></div>')+'<p><b>'+esc(number(ratio))+' c</b> de matière</p></div><div class="info-stock-flow">'+steps.map(([name,n],i)=>stage(i,'<div class="info-stock-node '+(i===3?'is-result':'')+'"><span>'+name+'</span><strong>'+esc(fmt(n))+'</strong></div>')).join('')+'</div></div><p class="info-food-equation">'+esc(fmt(r[0]))+' <span>÷</span> '+esc(fmt(v[3]))+' <span>× 100 =</span> <strong>'+esc(fmt(ratio,'%'))+'</strong></p><p class="info-chart-note">'+(ratio>100?'La matière dépasse les ventes : anneau plafonné à 100 %, marge matière négative.':'Le reste finance encore le personnel, les locaux et les autres charges.')+'</p>';
}
function chart(v,r){
 const row=(label,value,unit='€',result=false)=>({label,value,unit,result});
 switch(kind){
 case 'daily':return equation([{label:'Charges restant à couvrir',value:fmt(Math.max(0,v[0]-v[4]))},{label:'Taux de contribution',value:number(v[1])+' / 100'},{label:'Poids de ce jour ÷ total des poids',value:number(v[5])+' ÷ '+number(v[2]-1+v[5])}],['÷','×'],r);
 case 'income':return equation([{label:'Charges et rémunération non déjà incluse',value:fmt(v[0]+(v[4]?0:v[1]))},{label:'Taux de contribution',value:number(v[2])+' / 100'}],['÷'],r);
 case 'season':return equation([{label:'Charges de toute la période',value:fmt(v[0])},{label:'Taux de contribution',value:number(v[1])+' / 100'}],['÷'],r,descriptor.formula+' Repère sur '+number(v[2])+' jours ouverts : '+fmt(r[1])+' / jour.');
 case 'averageca':return equation([{label:label(0),value:fmt(v[0])},{label:label(1),value:fmt(v[1],'mois')}],['÷'],r,descriptor.formula+' Moyenne par jour ouvert : '+fmt(r[1])+'.');
 case 'billcovers':return equation([{label:label(0),value:fmt(v[0])},{label:label(1),value:fmt(v[1],'tickets')}],['÷'],r,'Le CA par couvert est '+fmt(r[1])+', sur '+number(v[2])+' couverts. Les deux moyennes ne sont pas interchangeables.');
 case 'stock':return equation([{label:label(1),value:fmt(v[1])},{label:label(0),value:fmt(v[0])}],['÷'],r,'Couverture moyenne : '+fmt(r[1],'jours')+'. Cette durée ne donne pas une conclusion sanitaire.');
 case 'rotation':return equation([{label:label(0),value:fmt(v[0],'couverts')},{label:'Places × services comparés',value:number(v[1])+' × '+number(v[2])}],['÷'],r);
 case 'forecast':return equation(v.map((n,i)=>({label:label(i),value:fmt(n,unitFor(i))})),['×','×','×'],r);
 case 'portion':return equation(v.map((n,i)=>({label:label(i),value:fmt(n,unitFor(i))})),['÷'],r);
 case 'hours':case 'energy':case 'waste':return equation(v.map((n,i)=>({label:label(i),value:fmt(n,unitFor(i))})),['×'],r);
 case 'beverage':return equation([{label:'Doses servies, arrondies à l’entier inférieur',value:number(Math.floor(v[2]/v[3]))},{label:'Doses offertes sur le contenant',value:number(v[4])}],['−'],r,descriptor.formula+' Contribution du contenant : '+fmt(r[2])+'.');
 case 'food':return foodGraph(v,r);
 case 'structure':return bars([row('Ventes HT',v[0]),row('Coûts variables',v[1]),row('Autres charges',v[2]),row('Résultat simplifié',r[0],'€',true)]);
 case 'channel':case 'delivery':return bars([row('Vente HT par commande',v[0]),row('Coûts variables par commande',v[1]+v[2]+v[3]+v[4]),row('Contribution par commande',r[0],'€',true)],'Montants par commande. La contribution couvre encore les charges fixes.');
 case 'compare':return bars([row('Résultat précédent',v[0]-v[1]-v[2]-v[3]-v[4]),row('Résultat actuel',r[0],'€',true),row('Évolution du résultat',r[1])],'Résultats simplifiés des deux périodes et différence, à périmètre comparable.');
 case 'gap':return bars([row('Consommation réelle',v[0]),row('Consommation théorique',v[1]),row('Écart encore à expliquer',r[2]??r[0],'€',true)],'Une différence chiffrée, sans cause automatiquement attribuée.');
 case 'menu':if(engine==='advanced')return bars((r.rows||[]).map(n=>row(n.name,n.total,'€',false)),'Contribution de chaque plat sur la période, selon prix, coûts et quantités saisis.');return bars([row('Prix unitaire HT',v[0]),row('Coûts variables unitaires',v[1]),row('Contribution par vente',r[0],'€',true)],'Comparaison unitaire. La contribution totale dépend aussi de la quantité vendue.');
 case 'cash':return bars([row('Trésorerie au départ',v[0]),row('Encaissements',v[1]),row('Décaissements',v[2]),row('Trésorerie en fin de période',r[0],'€',true)]);
 case 'opening':return bars([row('Besoin total',r[0]),row('Ressources confirmées',r[1]),row('Écart à financer',r[2],'€',true)],'Montants décaissés et ressources confirmées. Chaque disponibilité doit aussi être datée.');
 case 'prime':return bars([row('Matière consommée',v[0]),row('Personnel',v[1]),row('Autres charges',v[3]),row('Solde simplifié',r[2],'€',true)],'Ventes du scénario : '+fmt(v[2])+'. Aucun coût n’est compté deux fois.');
 case 'fullcost':return bars([row('Matières du lot',v[0]),row('Travail attribué au lot',v[1]*v[2]),row('Autres coûts attribués',v[3]),row('Coût du lot',r[2],'€',true)],'Coûts du lot ; les coûts par portion utilisent les portions réellement utilisables.');
 case 'coefficient':return bars([row('Coût matière HT',v[1]),row('Prix de vente HT',v[0]),row('Marge matière unitaire',v[0]-v[1],'€',true)],'Le coefficient et les deux taux de marge utilisent des bases différentes.');
 case 'price':return bars([row('Coût matière par portion',v[0]),row('Prix HT du scénario',r[0],'€',true),row('Prix TTC au taux saisi',r[1])],'La cible matière et la TVA proviennent de vos champs ; ce prix ne prouve pas la rentabilité.');
 case 'productivity':return bars([row('CA par heure',r[0],'€ / h'),row('Contribution avant personnel par heure',r[1],'€ / h',true),row('Coût du personnel par heure',v[3]/v[2],'€ / h')],'Même périmètre d’activité, d’heures et de personnel. Ce n’est pas une mesure individuelle.');
 case 'payroll':if(engine==='advanced')return bars([row('Personnel, dirigeant inclus',r[0],'%'),row('Personnel, dirigeant exclu',r[1],'%')],'Deux périmètres de coût du personnel, rapportés au même CA HT.');return chain(v,r);
 case 'inventory':return bars([row('Quantité comptée',v[0],'unités'),row('Quantité attendue',v[2],'unités'),row('Écart de quantité',r[1],'unités',true)],'Quantités dans la même unité ; la valorisation utilise le coût unitaire saisi.');
 case 'restock':return bars([row('Besoin et réserve choisie',v[0]+v[3],'unités'),row('Stock et arrivages confirmés',v[1]+v[2],'unités'),row('Commande après arrondi au colis',r[2],'unités',true)],'Le conditionnement peut imposer un excédent. Aucune réserve automatique n’est ajoutée.');
 case 'variation':return bars([row('Ancien prix unitaire',v[0]),row('Nouveau prix unitaire',v[1])],'Impact sur '+number(v[2])+' unités : '+fmt(r[1])+'. Quantité constante.');
 case 'netprofit':return bars([row('Résultat net pour 100 € de CA',r[1],'€',true)],'Résultat net fourni par vos comptes ; aucun taux d’impôt supposé.');
 case 'cocktail':return bars([row('Prix HT',v[0]),row('Contribution avant travail',r[0]),row('Travail attribué',r[1]),row('Reste après travail attribué',r[2],'€',true)],'Montants par cocktail. Les locaux et autres charges restent à couvrir.');
 case 'stress':{const before=v[0]*(1-v[1]/100)-v[2];return bars([row('Résultat de référence',before),row('Résultat du scénario',r[0],'€',true),row('Évolution',r[1])],'Baisse testée : '+number(v[3])+' %. Les charges classées fixes restent constantes.');}
 case 'ebe':return bars([row('Valeur ajoutée',v[0]),row('Personnel et impôts de production',v[1]+v[2]),row('Subventions d’exploitation',v[3]),row('EBE du périmètre',r[0],'€',true)],'L’EBE ne représente ni le résultat net ni la trésorerie.');
 default:return chain(v,r);
 }
}
let lastChart='',updateQueued=false,replayToken=0;
function stopReplay(){replayToken++;live?.classList.remove('info-replaying');live?.querySelectorAll('[data-info-stage]').forEach(n=>n.classList.remove('info-stage-pending','info-stage-current'));const b=live?.querySelector('[data-info-replay]');if(b){b.disabled=false;b.setAttribute('aria-pressed','false');}}
function update(){
 updateQueued=false;const values=getValues(),result=api.calculate(kind,values,engine),valid=!!result.values&&!result.reason;
 if(live){
  const primary=kind==='food'?1:0,output=live.querySelector('[data-info-output]');output.textContent=valid?fmt(result.values[primary],descriptor.units[primary]):'—';output.classList.toggle('is-negative',valid&&typeof result.values[primary]==='number'&&result.values[primary]<0);live.dataset.valid=String(valid);
  live.querySelector('[data-info-output-label]').textContent=descriptor.outputs[primary];live.querySelector('[data-info-mode]').textContent=calc.querySelector('[data-calc-mode]')?.textContent||'Exemple fictif';
  // Chart generators use the numerical result array, with rows retained for multi-dish comparisons.
  const numbers=valid?Object.assign([...result.values],{rows:result.rows}):null;
  const html=valid?chart(values,numbers):'<div class="info-chart-empty"><span aria-hidden="true">↗</span><p>'+esc(result.reason||'Complétez les données pour construire le graphique.')+'</p></div>';
  if(html!==lastChart){
   stopReplay();const host=live.querySelector('[data-info-chart]'),oldRing=host.querySelector('.info-ring-value')?.getAttribute('stroke-dasharray'),oldBars=[...host.querySelectorAll('.info-bar')].map(n=>({x:n.getAttribute('x'),width:n.getAttribute('width')}));host.innerHTML=html;
   if(lastChart&&!reduced()){
    const ring=host.querySelector('.info-ring-value');if(ring&&oldRing&&ring.animate)ring.animate([{strokeDasharray:oldRing},{strokeDasharray:ring.getAttribute('stroke-dasharray')}],{duration:220,easing:'ease-out'});
    host.querySelectorAll('.info-bar').forEach((bar,i)=>{if(!oldBars[i]||!bar.animate)return;bar.animate([{x:oldBars[i].x+'px',width:oldBars[i].width+'px'},{x:bar.getAttribute('x')+'px',width:bar.getAttribute('width')+'px'}],{duration:220,easing:'ease-out'});});
   }
   lastChart=html;
  }
  controls().forEach((input,i)=>{const mirror=live.querySelector('[data-info-input="'+i+'"]');if(!mirror)return;if(mirror!==document.activeElement){if(input.type==='checkbox')mirror.checked=input.checked;else mirror.value=input.value;}mirror.setAttribute('aria-invalid',input.getAttribute('aria-invalid')||'false');});
  live.querySelector('[data-info-live-status]').textContent=valid?'Changez une donnée : résultat et graphique se recalculent ensemble.':result.reason||'Une case vide ne devient pas un zéro.';
 }
 updateFood(values,result,valid);
}
function queueUpdate(){if(updateQueued)return;updateQueued=true;requestAnimationFrame(update);}
if(live){
 document.querySelectorAll('.info-hero-copy a.info-primary,.info-hero-actions a[href*=calculate]').forEach(a=>a.addEventListener('click',e=>{
  const first=live.querySelector('[data-info-input]');if(!first)return;e.preventDefault();first.focus({preventScroll:true});if(first.select)first.select();const box=first.getBoundingClientRect();if(box.top<15||box.bottom>innerHeight-15)first.scrollIntoView({block:'center',behavior:reduced()?'auto':'smooth'});live.classList.add('info-focus');setTimeout(()=>live.classList.remove('info-focus'),700);
 }));
 live.querySelectorAll('[data-info-input]').forEach(input=>{input.addEventListener('input',()=>{const original=controls()[Number(input.dataset.infoInput)];if(!original)return;if(original.type==='checkbox')original.checked=input.checked;else original.value=input.value;original.dispatchEvent(new Event('input',{bubbles:true}));queueUpdate();});});
 live.querySelector('[data-info-replay]')?.addEventListener('click',()=>{
  stopReplay();if(live.dataset.valid!=='true')return;const stages=[...live.querySelectorAll('[data-info-stage]')],button=live.querySelector('[data-info-replay]'),token=++replayToken;
  if(reduced()){live.querySelector('[data-info-live-status]').textContent='Les étapes sont toutes visibles. Le mouvement réduit est activé.';return;}
  button.disabled=true;button.setAttribute('aria-pressed','true');live.classList.add('info-replaying');stages.forEach(n=>n.classList.add('info-stage-pending'));
  stages.forEach((node,i)=>setTimeout(()=>{if(token!==replayToken)return;node.classList.remove('info-stage-pending');node.classList.add('info-stage-current');if(node.animate)node.animate([{transform:'translateY(5px)',opacity:.45},{transform:'translateY(0)',opacity:1}],{duration:300,easing:'ease-out'});if(i===stages.length-1){button.disabled=false;button.setAttribute('aria-pressed','false');live.classList.remove('info-replaying');live.querySelector('[data-info-live-status]').textContent='Calcul construit à partir des données affichées. Vous pouvez les modifier.';}},i*350));
 });
}
calc.addEventListener('input',queueUpdate);calc.addEventListener('click',queueUpdate);
const target=document.querySelector('[data-food-target]');target?.addEventListener('input',queueUpdate);
function updateFood(values,r,ok){if(kind!=='food')return;
 const ratio=ok?r.values[1]:null,consumed=ok?r.values[0]:null,remainder=ok?r.values[2]:null;
 for(const [selector,value,unit] of [['[data-food-ratio]',ratio,'%'],['[data-food-consumption]',consumed,'€'],['[data-food-remainder]',remainder,'€'],['[data-food-sales]',ok?values[3]:null,'€'],['[data-food-cents]',ratio,'c']])document.querySelectorAll(selector).forEach(e=>e.textContent=fmt(value,unit));
 document.querySelectorAll('[data-food-ring]').forEach(e=>{e.style.strokeDasharray=(ratio===null?0:Math.max(0,Math.min(100,ratio)))+' 100';});
 const output=document.querySelector('[data-food-comparison]');if(!output||!target)return;
 const goal=base.parse(target.value);target.setAttribute('aria-invalid','false');if(!ok){output.textContent='Complétez d’abord les quatre données du calcul.';return;}
 if(goal===null){output.textContent='Ajoutez votre cible pour mesurer l’écart. Elle doit venir de votre modèle économique ; aucun seuil universel n’est appliqué.';return;}
 if(goal<0||goal>100){target.setAttribute('aria-invalid','true');output.textContent='Saisissez une cible comprise entre 0 et 100 %.';return;}
 const diff=ratio-goal,amount=consumed-values[3]*goal/100;output.textContent=Math.abs(diff)<0.000001?'Le ratio correspond à votre cible saisie. Cela ne suffit pas à valider la rentabilité.':number(Math.abs(diff))+' point'+(Math.abs(diff)>1?'s':'')+' '+(diff>0?'au-dessus':'en dessous')+' de votre cible, soit '+fmt(Math.abs(amount))+' de matière '+(diff>0?'en plus':'en moins')+' à ventes identiques. Cet écart est à expliquer ; ce n’est pas une économie garantie.';
}
update();
})();

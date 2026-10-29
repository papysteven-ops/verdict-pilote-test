(function(){
'use strict';
const cards=[...document.querySelectorAll('.guide-card')],topics=document.querySelector('#topics'),input=document.querySelector('#question');
const chosen=['food-cost-restaurant.html','ca-minimum-par-jour-restaurant.html','calcul-prix-revient-plat.html','inventaire-restaurant-methode.html','masse-salariale-restaurant.html','previsionnel-restaurant.html'];
const doors={pilotage:{label:'Pilotage',groups:['Rentabilité et seuil','Livraison']},matiere:{label:'Matière',groups:['Matière et marges']},carte:{label:'Carte & prix',groups:['Carte et prix']},stocks:{label:'Stocks & achats',groups:['Stocks et achats']},equipe:{label:'Équipe',groups:['Équipe et salle']},projet:{label:'Mon projet',groups:['Création et reprise','Types d’établissement']}};
let active='Tous',activeDoor=null,libraryOpen=false,limit=6;
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const synonyms={'food cost':'matiere marge','point mort':'seuil rentabilite','personnel':'equipe salarie masse salariale','stock':'stocks inventaire achats','tva':'taxe tva','hotel':'hotel hotellerie','cafe':'cafe bar boissons','cout':'cout prix revient'};
const stop=new Set(['comment','pour','les','des','une','dans','quel','quelle','quels','quelles','mon','mes','est','calculer']);
const groupOf=card=>card.querySelector('.overline').textContent.trim(),slugOf=card=>card.dataset.slug||card.getAttribute('href').split('/').pop();
const groups=['Tous',...new Set(cards.map(groupOf))];
for(const group of groups){const b=document.createElement('button');b.type='button';b.textContent=group;b.setAttribute('aria-pressed',String(group===active));b.onclick=()=>{active=group;activeDoor=null;limit=12;libraryOpen=true;render();};topics.append(b);}
document.querySelectorAll('[data-door]').forEach(button=>{const door=doors[button.dataset.door];const count=cards.filter(c=>door.groups.includes(groupOf(c))).length;const tag=document.createElement('span');tag.className='door-count';tag.textContent=count+' sujets';button.querySelector('.door-top').insertBefore(tag,button.querySelector('.door-arrow'));button.addEventListener('click',()=>{activeDoor=button.dataset.door;active='Tous';input.value='';libraryOpen=false;limit=6;render();showResults();});});
function showResults(){document.querySelector('#questions').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
function setMoreLabel(text){const b=document.querySelector('#loadMore');b.textContent=text;const span=document.createElement('span');span.textContent='→';b.append(span);}
function render(){
 const q=normalize(input.value),tokens=q.split(' ').filter(t=>t.length>2&&!stop.has(t)),extra=Object.entries(synonyms).filter(([key])=>q.includes(key)).flatMap(([,v])=>v.split(' '));
 let ranked=cards.map((card,index)=>{const title=normalize(card.querySelector('h3').textContent),text=normalize(card.textContent),group=groupOf(card);const score=tokens.reduce((n,t)=>n+(title.includes(t)?4:text.includes(t)?1:0),0)+extra.reduce((n,t)=>n+(title.includes(t)?2:0),0);return{card,index,score,match:(!activeDoor||doors[activeDoor].groups.includes(group))&&(active==='Tous'||group===active)&&(!q||score>0)};}).filter(x=>x.match).sort((a,b)=>q?b.score-a.score||a.index-b.index:a.index-b.index);
 const initial=!q&&!activeDoor&&active==='Tous'&&!libraryOpen;
 if(initial)ranked=chosen.map(slug=>ranked.find(x=>slugOf(x.card)===slug)).filter(Boolean);
 else if(!q&&activeDoor)ranked.sort((a,b)=>{const ia=chosen.indexOf(slugOf(a.card)),ib=chosen.indexOf(slugOf(b.card));return(ia<0?100:ia)-(ib<0?100:ib)||a.index-b.index;});
 cards.forEach(c=>c.hidden=true);ranked.slice(0,limit).forEach(({card})=>{card.hidden=false;document.querySelector('#guides').append(card);});
 document.body.classList.toggle('is-library-open',libraryOpen);topics.hidden=!libraryOpen;
 document.querySelector('#topicsEyebrow').textContent=q?'VOTRE RECHERCHE':activeDoor?'VOTRE ESPACE · '+doors[activeDoor].label.toUpperCase():libraryOpen?'TOUS LES SUJETS':'À VOUS DE CHOISIR';
 document.querySelector('#topicsTitle').textContent=q?'Les repères pour votre question.':activeDoor?doors[activeDoor].label+' : choisissez votre sujet.':libraryOpen?'Tout explorer, à votre rythme.':'Six sujets pour commencer.';
 document.querySelector('#resultCount').textContent=initial?'6 sujets choisis parmi '+cards.length+' dossiers':ranked.length+' sujet'+(ranked.length>1?'s':'')+(q?' pour votre recherche':' disponibles');
 document.querySelector('#empty').hidden=ranked.length!==0;const more=document.querySelector('#loadMore');more.hidden=!initial&&ranked.length<=limit;
 setMoreLabel(initial?'Explorer les '+cards.length+' sujets':(libraryOpen?'Voir davantage de sujets':'Voir tous les sujets de cet espace'));
 topics.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===active)));
 document.querySelectorAll('[data-door]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.door===activeDoor)));
 const feedback=document.querySelector('#searchFeedback');feedback.hidden=!q;feedback.textContent=q?'Résultats pour « '+input.value.trim()+' » · titres et résumés des dossiers':'';
}
input.addEventListener('input',()=>{active='Tous';activeDoor=null;libraryOpen=true;limit=12;render();});
document.querySelector('#questionForm').onsubmit=e=>{e.preventDefault();render();showResults();};
document.querySelectorAll('[data-query]').forEach(b=>b.onclick=()=>{input.value=b.dataset.query;active='Tous';activeDoor=null;libraryOpen=true;limit=12;render();showResults();});
document.querySelectorAll('[data-open-library]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();active='Tous';activeDoor=null;input.value='';libraryOpen=true;limit=12;render();showResults();}));
document.querySelector('#resetSearch').onclick=()=>{input.value='';active='Tous';activeDoor=null;libraryOpen=false;limit=6;render();};
document.querySelector('#loadMore').onclick=()=>{if(!libraryOpen){libraryOpen=true;limit=12;}else limit+=12;render();};
const parameters=new URLSearchParams(window.VerdictDesktopNavigation?.search||location.search);if(parameters.get('q')){input.value=parameters.get('q');libraryOpen=true;limit=12;}else if(doors[parameters.get('theme')]){activeDoor=parameters.get('theme');limit=6;}render();
function cents(value){if(!/^\d+(?:\.\d{1,2})?$/.test(value))throw Error('Saisissez des montants positifs avec deux décimales maximum.');const [whole,dec='']=value.split('.');const result=BigInt(whole)*100n+BigInt(dec.padEnd(2,'0'));if(result>100000000000n)throw Error('Montant trop élevé pour cet outil.');return result;}
function money(v){return Number(v)/100;}
function pct(n,d){return Number((n*10000n+d/2n)/d)/100;}
function calculate(){const result=document.querySelector('#calcResult');try{const cost=cents(document.querySelector('#cost').value),price=cents(document.querySelector('#price').value);if(price<=0n)throw Error('Le prix de vente HT doit être supérieur à zéro.');const margin=price-cost;const format=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2,minimumFractionDigits:2});const ratio=(n,d)=>{const negative=n<0n;return (negative?'-':'')+format.format(pct(negative?-n:n,d))+' %'};result.replaceChildren();for(const [value,label] of [[format.format(money(margin))+' €','Marge sur coût matière'],[ratio(margin,price),'Taux de marque'],[ratio(cost,price),'Ratio matière']]){const item=document.createElement('div'),b=document.createElement('b'),s=document.createElement('span');b.textContent=value;s.textContent=label;item.append(b,s);result.append(item);}}catch(e){result.textContent=e.message;}}
document.querySelector('#marginForm').onsubmit=e=>{e.preventDefault();calculate()};calculate();
})();

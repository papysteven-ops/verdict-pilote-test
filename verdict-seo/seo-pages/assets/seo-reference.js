/* Simulateurs éditoriaux, indépendants du moteur métier Verdict. Aucun envoi. */
(function (root) {
  'use strict';
  const definitions = {
    structure: {labels:['Ventes HT de la période (€)','Coûts variables (€)','Autres charges, hors impôt sur le bénéfice (€)'],sample:[50000,19000,27000],formula:'Ventes − coûts variables − autres charges',outputs:['Résultat simplifié avant impôt','Part du CA'],unit:['€','%']},
    margin: {labels:['Produits ou ventes de la période (€)','Toutes les charges du périmètre indiqué (€)'],sample:[50000,47500],formula:'Produits − charges du périmètre',outputs:['Solde du périmètre','Solde / produits'],unit:['€','%']},
    channel: {labels:['Vente HT (€)','Matière consommée (€)','Emballage (€)','Frais du canal HT (€)','Autres coûts variables (€)'],sample:[22,7,1.2,5,.8],formula:'Vente HT − matière − emballage − frais − autres coûts variables',outputs:['Contribution avant charges fixes','Contribution / vente'],unit:['€','%']},
    breakeven: {labels:['Charges fixes de la période (€)','Taux de contribution (%)','Jours ouverts de la période'],sample:[18000,60,24],formula:'Charges fixes ÷ (taux de contribution / 100)',outputs:['CA HT à couvrir','Repère moyen par jour ouvert'],unit:['€','€']},
    covers: {labels:['Charges fixes de la période (€)','Contribution moyenne par couvert (€)','Jours réellement ouverts'],sample:[18000,15,24],formula:'Charges fixes ÷ contribution par couvert',outputs:['Couverts sur la période','Couverts par jour, arrondis au-dessus'],unit:['','']},
    food: {labels:['Stock initial valorisé (€)','Achats nets de la période (€)','Stock final valorisé (€)','Ventes HT correspondantes (€)'],sample:[4500,12500,3800,40000],formula:'Consommation = stock initial + achats nets − stock final',outputs:['Consommation de période','Food cost / ventes HT','Marge brute matière'],unit:['€','%','€']},
    portion: {labels:['Coût total retenu pour le lot ou la période (€)','Portions ou couverts réellement produits'],sample:[96,24],formula:'Coût du périmètre ÷ portions réelles',outputs:['Coût par portion ou couvert'],unit:['€']},
    price: {labels:['Coût matière par portion HT (€)','Cible matière dans le prix HT (%)','TVA utilisée pour le scénario (%)'],sample:[4.5,30,10],formula:'Prix HT = coût matière ÷ (cible / 100)',outputs:['Prix HT du scénario','Prix TTC du scénario'],unit:['€','€']},
    coefficient: {labels:['Prix de vente HT (€)','Coût matière HT (€)'],sample:[15,4.5],formula:'Coefficient HT = prix HT ÷ coût HT',outputs:['Coefficient HT / HT','Marge / prix HT','Marge / coût HT'],unit:['×','%','%']},
    menu: {labels:['Prix de vente HT (€)','Coûts variables par plat (€)','Quantité vendue'],sample:[15,5,120],formula:'(Prix − coûts variables) × quantité',outputs:['Contribution du plat','Contribution totale'],unit:['€','€']},
    payroll: {labels:['Coût de personnel du périmètre (€)','Heures travaillées du périmètre','Ventes HT correspondantes (€)'],sample:[16000,800,50000],formula:'Coût personnel ÷ ventes ; ventes ÷ heures',outputs:['Personnel / ventes','CA par heure','Coût par heure'],unit:['%','€','€']},
    hours: {labels:['Heures concernées','Coût horaire chargé retenu (€)'],sample:[24,22],formula:'Heures × coût horaire chargé fourni',outputs:['Coût du scénario, pas un calcul de paie'],unit:['€']},
    bill: {labels:['Ventes HT (€)','Nombre de tickets (ou couverts, selon le périmètre)'],sample:[35000,1750],formula:'Ventes HT ÷ tickets ou couverts',outputs:['Panier HT de l’unité choisie'],unit:['€']},
    rotation: {labels:['Couverts servis','Places proposées','Nombre de services comparés'],sample:[96,60,1],formula:'Couverts ÷ (places × services)',outputs:['Rotation par service'],unit:['×']},
    occupancy: {labels:['Places occupées au même instant','Places réellement offertes'],sample:[42,60],formula:'Places occupées ÷ places offertes × 100',outputs:['Remplissage du créneau'],unit:['%']},
    buffer: {labels:['Stocks (€)','Créances clients (€)','Dettes fournisseurs (€)'],sample:[8000,2500,11000],formula:'Stocks + créances clients − dettes fournisseurs',outputs:['BFR simplifié, hors autres postes'],unit:['€']},
    cash: {labels:['Trésorerie de départ (€)','Encaissements de la période (€)','Décaissements de la période (€)'],sample:[15000,42000,46000],formula:'Trésorerie initiale + encaissements − décaissements',outputs:['Trésorerie de fin du scénario'],unit:['€']},
    ebe: {labels:['Valeur ajoutée (€)','Coût du personnel (€)','Autres impôts sur la production (€)','Subventions d’exploitation (€)'],sample:[24000,16500,1200,300],formula:'Valeur ajoutée − personnel − impôts de production + subventions',outputs:['EBE dans ce périmètre'],unit:['€']},
    stock: {labels:['Stock moyen valorisé au coût (€)','Consommation de période au coût (€)','Jours de la période'],sample:[6000,18000,30],formula:'Rotation = consommation ÷ stock moyen',outputs:['Rotation de période','Couverture moyenne, non sanitaire'],unit:['×','jours']},
    valuation: {labels:['Quantité comptée dans l’unité retenue','Coût unitaire correspondant (€)'],sample:[24,8.5],formula:'Quantité × coût unitaire',outputs:['Valeur de la ligne'],unit:['€']},
    gap: {labels:['Consommation réelle (€)','Consommation théorique (€)','Ventes HT (€)'],sample:[13200,11800,40000],formula:'Consommation réelle − consommation théorique',outputs:['Écart à expliquer','Écart / ventes'],unit:['€','points de CA']},
    waste: {labels:['Perte mesurée (kg)','Coût valorisé par kg (€)'],sample:[18,6],formula:'Quantité perdue × coût retenu',outputs:['Coût valorisé, pas économie garantie'],unit:['€']},
    order: {labels:['Besoin jusqu’au prochain passage','Stock utilisable','Commande déjà confirmée','Réserve justifiée'],sample:[60,18,12,6],formula:'Maximum de 0 et (besoin + réserve − stock − confirmé)',outputs:['Besoin avant arrondi au colis'],unit:['unités']},
    franco: {labels:['Commande utile prévue (€)','Seuil de franco contractuel (€)','Port facturé si sous le seuil (€)'],sample:[280,350,15],formula:'Complément = max(0, seuil − commande) ; comparer au port',outputs:['Achat complémentaire requis','Port évité si franco atteint'],unit:['€','€']},
    variation: {labels:['Ancien prix unitaire (€)','Nouveau prix unitaire (€)','Quantité concernée'],sample:[8,9.2,120],formula:'(Nouveau prix − ancien prix) × quantité',outputs:['Variation de prix','Impact sur la quantité'],unit:['%','€']},
    forecast: {labels:['Places proposées','Rotations supposées par jour','Ticket HT supposé (€)','Jours ouverts supposés'],sample:[50,1.2,25,24],formula:'Places × rotations × ticket × jours',outputs:['CA HT prévisionnel, non constaté'],unit:['€']},
    prime: {labels:['Matières consommées (€)','Coût complet du personnel (€)','Ventes HT (€)'],sample:[13000,17000,50000],formula:'(Matières + personnel) ÷ ventes HT × 100',outputs:['Prime cost en euros','Prime cost / ventes'],unit:['€','%']},
    energy: {labels:['Consommation électrique (kWh)','Prix par kWh retenu (€)'],sample:[4200,.22],formula:'Consommation × prix du kWh',outputs:['Composante calculée, hors abonnement et autres lignes'],unit:['€']}
  };
  const absent = v => typeof v !== 'number' || !Number.isFinite(v);
  const div = (a,b) => b > 0 ? a/b : null;
  function compute(kind, v) {
    const d=definitions[kind];
    if(!d || !Array.isArray(v)||v.length!==d.labels.length || v.some(absent)) return {values:null,reason:'Renseignez chaque donnée ; une case vide n’est pas un zéro.'};
    if(v.some(x=>x<0)) return {values:null,reason:'Ce scénario accepte des montants non négatifs. Un avoir net ou un solde négatif exige une analyse séparée.'};
    const [a,b,c,e,f]=v; let r;
    switch(kind){
      case 'structure':r=[a-b-c,div(a-b-c,a)===null?null:(a-b-c)/a*100];break;
      case 'margin':r=[a-b,div(a-b,a)===null?null:(a-b)/a*100];break;
      case 'channel':{let x=a-b-c-e-f;r=[x,a>0?x/a*100:null];break;}
      case 'breakeven':r=b>0&&b<=100?[a/(b/100),c>0?a/(b/100)/c:null]:[null,null];break;
      case 'covers':r=[b>0?Math.ceil(a/b):null,b>0&&c>0?Math.ceil(a/b/c):null];break;
      case 'food':{let x=a+b-c;r=x<0?[null,null,null]:[x,e>0?x/e*100:null,e-x];break;}
      case 'portion':r=[div(a,b)];break;
      case 'price':r=b>0&&b<=100?[a/(b/100),a/(b/100)*(1+c/100)]:[null,null];break;
      case 'coefficient':r=[div(a,b),a>0?(a-b)/a*100:null,b>0?(a-b)/b*100:null];break;
      case 'menu':r=[a-b,(a-b)*c];break;
      case 'payroll':r=[c>0?a/c*100:null,div(c,b),div(a,b)];break;
      case 'hours':case 'valuation':case 'waste':case 'energy':r=[a*b];break;
      case 'bill':r=[div(a,b)];break;
      case 'rotation':r=[b>0&&c>0?a/(b*c):null];break;
      case 'occupancy':r=[b>0&&a<=b?a/b*100:null];break;
      case 'buffer':r=[a+b-c];break;
      case 'cash':r=[a+b-c];break;
      case 'ebe':r=[a-b-c+e];break;
      case 'stock':r=[div(b,a),b>0?a/b*c:null];break;
      case 'gap':r=[a-b,c>0?(a-b)/c*100:null];break;
      case 'order':r=[Math.max(0,a+e-b-c)];break;
      case 'franco':r=[Math.max(0,b-a),a<b?c:0];break;
      case 'variation':r=[a>0?(b-a)/a*100:null,(b-a)*c];break;
      case 'forecast':r=[a*b*c*e];break;
      case 'prime':r=[a+b,c>0?(a+b)/c*100:null];break;
      default:return {values:null,reason:'Calcul non disponible.'};
    }
    r=r.map(x=>absent(x)?null:x);
    return {values:r,reason:r.some(x=>x===null)?'Rapport non calculable : contrôlez dénominateur, unités et périmètre.':''};
  }
  function parse(raw){if(typeof raw!=='string'||!raw.trim())return null;const s=raw.trim().replace(/[\s\u00a0\u202f]/g,'').replace(',','.');return /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(s)?Number(s):null;}
  function formatted(n,unit){return absent(n)?'—':new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(n)+(unit?' '+unit:'');}
  const api={definitions,compute,parse,formatted,absent};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VerdictSeoCalculs=api;
  if(typeof document==='undefined')return;
  document.querySelectorAll('[data-legacy-calculator]').forEach(box=>{
    const kind=box.dataset.calculator,d=definitions[kind];if(!d)return;
    const inputs=[...box.querySelectorAll('input[data-number]')];
    const values=JSON.parse(box.dataset.example||JSON.stringify(d.sample));
    let mode='Exemple fictif';
    function update(){
      const raw=inputs.map(x=>parse(x.value)),result=compute(kind,raw);
      box.querySelectorAll('[data-result]').forEach(el=>{const i=Number(el.dataset.result);el.textContent=formatted(result.values?result.values[i]:null,d.unit[i]);});
      box.querySelector('[data-calc-status]').textContent=mode+' · '+(result.reason||'Calcul local. Aucune donnée envoyée.');
      const max=Math.max(1,...raw.filter(x=>!absent(x)));
      box.querySelectorAll('[data-bar]').forEach((bar,i)=>{const v=raw[i];bar.style.width=absent(v)?'0%':Math.max(0,Math.min(100,v/max*100))+'%';});
    }
    inputs.forEach(el=>el.addEventListener('input',()=>{mode='Vos hypothèses';update();}));
    box.querySelector('[data-reset-example]').addEventListener('click',()=>{inputs.forEach((el,i)=>{el.value=String(values[i]);});mode='Exemple fictif';update();});
    box.querySelector('[data-clear]').addEventListener('click',()=>{inputs.forEach(el=>{el.value='';});mode='À renseigner';update();inputs[0].focus();});
    update();
  });
  const offer=document.querySelector('[data-offer-calculator]');
  if(offer){const count=offer.querySelector('input');const update=()=>{const n=parse(count.value),ok=!absent(n)&&Number.isSafeInteger(n)&&n>=1&&Number.isSafeInteger(990+(n-1)*390);offer.querySelector('[data-monthly]').textContent=ok?formatted(99+(n-1)*39,'€ HT / mois'):'—';offer.querySelector('[data-yearly]').textContent=ok?formatted(990+(n-1)*390,'€ HT / an'):'—';count.setAttribute('aria-invalid',String(!ok));const status=offer.querySelector('[data-offer-status]');if(status)status.textContent=ok?'Prix HT pour '+n+' établissement'+(n>1?'s':'')+'.':'Saisissez un nombre entier d’établissements, au moins égal à 1, dans les limites de calcul.';};count.addEventListener('input',update);update();}
  const q=document.querySelector('[data-search-pages]');
  if(q){q.addEventListener('input',()=>{const needle=q.value.toLocaleLowerCase('fr');let count=0;document.querySelectorAll('[data-directory-item]').forEach(el=>{const show=el.textContent.toLocaleLowerCase('fr').includes(needle);el.hidden=!show;if(show)count++;});document.querySelector('[data-search-count]').textContent=count+' dossier'+(count>1?'s':'')+' trouvé'+(count>1?'s':'');});}
})(typeof globalThis!=='undefined'?globalThis:this);

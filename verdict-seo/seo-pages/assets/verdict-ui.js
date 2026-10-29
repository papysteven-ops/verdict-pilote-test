/* Interface du site : aucune donnee envoyee, aucun contenu cache sans JavaScript. */
(function(){
"use strict";
var d=document,r=d.documentElement;r.classList.add("js-ok");
var b=d.querySelectorAll("[data-theme-choix]");
function theme(t,memo){
  if(t==="light"||t==="dark"){r.setAttribute("data-theme",t);}else{t="auto";r.removeAttribute("data-theme");}
  for(var i=0;i<b.length;i++){b[i].setAttribute("aria-pressed",String(b[i].getAttribute("data-theme-choix")===t));}
  if(memo){try{window.localStorage.setItem("verdict:affichage",t);}catch(e){}}
}
var choix="auto";try{choix=window.localStorage.getItem("verdict:affichage")||"auto";}catch(e){}
try{var q=new URLSearchParams(window.location.search);if(q.get("theme")){choix=q.get("theme");}}catch(e){}
theme(choix,false);
for(var i=0;i<b.length;i++){(function(x){x.addEventListener("click",function(){theme(x.getAttribute("data-theme-choix"),true);});})(b[i]);}
function ouvrir(){var h=window.location.hash.slice(1);if(!h){return;}var e=d.getElementById(h);while(e){if(e.tagName==="DETAILS"){e.open=true;}e=e.parentElement;}}
window.addEventListener("hashchange",ouvrir);ouvrir();
var m=d.querySelector("details.menu");
if(m){d.addEventListener("click",function(ev){if(m.open&&!m.contains(ev.target)){m.open=false;}});}
if(!(window.CSS&&CSS.supports&&CSS.supports("animation-timeline: scroll()"))){
  var p=d.querySelector(".progression"),att=false;
  if(p){var av=function(){att=false;var h=r.scrollHeight-window.innerHeight;p.style.transform="scaleX("+(h>0?Math.max(0,Math.min(1,window.scrollY/h)):0)+")";};
  window.addEventListener("scroll",function(){if(!att){att=true;window.requestAnimationFrame(av);}},{passive:true});av();}
}
})();
/* Vie de la page : apparitions, compteurs, tickets qui s'impriment, graphe du calculateur. Sans JavaScript, tout reste visible. */
(function(){
"use strict";
var d=document,r=d.documentElement;
var mouv=!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
function compter(e){
  var t=e.textContent;if(/\d\s*[-\u2013\u00e0]\s*\d/.test(t)){return;}
  var m=t.match(/^(\D*?)(\d[\d\s\u00a0\u202f]*)(,\d+)?([\s\S]*)$/);if(!m){return;}
  var dec=m[3]?m[3].length-1:0,cible=parseFloat(m[2].replace(/[^\d]/g,"")+"."+(m[3]?m[3].slice(1):"0"));if(!isFinite(cible)){return;}
  var f=new Intl.NumberFormat("fr-FR",{minimumFractionDigits:dec,maximumFractionDigits:dec}),t0=null;
  function pas(ts){if(t0===null){t0=ts;}var k=Math.min(1,(ts-t0)/900);k=1-Math.pow(1-k,3);e.textContent=m[1]+f.format(cible*k)+m[4];if(k<1){window.requestAnimationFrame(pas);}else{e.textContent=t;}}
  window.requestAnimationFrame(pas);
}
function voir(e,anime){
  if(e.classList.contains("vu")){return;}
  e.classList.add("vu");if(e.classList.contains("imprimante")){var tk=e.querySelector(".ticket");if(tk){tk.classList.add("imprime");tk.classList.add("vu");}}
  if(anime&&(e.classList.contains("chiffre")||e.hasAttribute("data-compte"))){compter(e);}
}
var cibles=[].slice.call(d.querySelectorAll(".rv,.imprimante,.barres,.contenu .chiffre,[data-compte]"));
if(mouv&&"IntersectionObserver" in window){
  r.classList.add("anim");
  var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){voir(x.target,true);io.unobserve(x.target);}});},{threshold:0,rootMargin:"0px 0px -7% 0px"});
  cibles.forEach(function(e){io.observe(e);});
  window.setTimeout(function(){cibles.forEach(function(e){if(e.getBoundingClientRect().top<window.innerHeight){voir(e,false);}});},2500);
  window.addEventListener("beforeprint",function(){cibles.forEach(function(e){voir(e,false);});});
}else{cibles.forEach(function(e){voir(e,false);});}
var C=window.VerdictSeoCalculs;
[].slice.call(d.querySelectorAll("[data-calculator]")).forEach(function(box){
  var ins=[].slice.call(box.querySelectorAll("input[data-number]"));if(!ins.length||!C){return;}
  var g=d.createElement("div");g.className="graphe";g.setAttribute("aria-hidden","true");
  var barres=ins.map(function(inp){var l=d.createElement("div"),s=d.createElement("span"),u=d.createElement("u"),i=d.createElement("i");
    var lab=inp.closest("label");s.textContent=(lab?lab.querySelector("span").textContent:"").replace(/\s*\([^)]*\)\s*$/,"");u.appendChild(i);l.appendChild(s);l.appendChild(u);g.appendChild(l);return i;});
  var f=box.querySelector(".calc-fields");f.parentNode.insertBefore(g,f.nextSibling);
  function maj(){var v=ins.map(function(x){return C.parse(x.value);}),ok=v.filter(function(x){return !C.absent(x)&&x>0;}),mx=Math.max.apply(null,ok.concat([1]));
    barres.forEach(function(b,k){var x=v[k];b.style.width=(C.absent(x)||x<=0)?"0%":Math.max(2,Math.min(100,x/mx*100))+"%";});}
  box.addEventListener("input",maj);box.addEventListener("click",function(){window.setTimeout(maj,0);});window.setTimeout(maj,60);
});
})();

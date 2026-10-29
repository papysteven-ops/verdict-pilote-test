/* R21 : tickets de la référence v3, visibles sans script. Aucun calcul modifié. */
(function () {
 'use strict';
 const root = document.documentElement;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const paused = () => reduced.matches || root.dataset.motion === 'paused' || document.hidden;
 const animations = new Set();
 const counters = new Map();
 function run(el, frames, options) {
  if (paused() || !el.animate) return;
  const a = el.animate(frames, options); animations.add(a);
  const done = () => animations.delete(a);
  a.addEventListener('finish', done, {once:true}); a.addEventListener('cancel', done, {once:true});
 }
 function count(el) {
  if (paused()) return;
  const original = el.textContent;
  const m = original.match(/^([^\d]*?)(\d[\d\s\u00a0\u202f]*)(,\d+)?([^\d]*)$/);
  if (!m) return;
  const digits = m[3] ? m[3].length - 1 : 0;
  const value = Number(m[2].replace(/\s/g, '') + (m[3] || '').replace(',', '.'));
  if (!Number.isFinite(value)) return;
  const format = new Intl.NumberFormat('fr-FR', {minimumFractionDigits:digits, maximumFractionDigits:digits});
  let start;
  const item = {original, id:0}; counters.set(el,item);
  function tick(time) {
   if (paused()) {el.textContent=original;counters.delete(el);return;}
   if (start === undefined) start = time;
   const k = Math.min(1, (time-start)/900);
   el.textContent = m[1] + format.format(value*(1-Math.pow(1-k,3))) + m[4];
   if (k < 1) item.id=requestAnimationFrame(tick);
   else {el.textContent=original;counters.delete(el);}
  }
  item.id=requestAnimationFrame(tick);
 }
 function stop() {
  if (!paused()) return;
  for (const a of animations) a.cancel(); animations.clear();
  for (const [el,item] of counters) {cancelAnimationFrame(item.id);el.textContent=item.original;}
  counters.clear();
 }
 const seen = new WeakSet();
 function reveal(el) {
  if (seen.has(el)) return;
  seen.add(el);el.classList.add('vu');
  if (el.classList.contains('imprimante')) {
   const ticket=el.querySelector('.ticket');
   if(ticket) run(ticket,[{transform:'translateY(-104%)'},{transform:'translateY(0)'}],{duration:1250,easing:'steps(20, end)'});
  } else if (el.classList.contains('barres')) {
   el.querySelectorAll('.piste-b i').forEach(bar=>run(bar,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:850,easing:'ease-out'}));
  } else if (el.hasAttribute('data-compte')) count(el);
  else run(el,[{transform:'translateY(14px)'},{transform:'translateY(0)'}],{duration:550,easing:'ease-out'});
 }
 const elements=[...document.querySelectorAll('.imprimante,.rv,.barres,[data-compte]')];
 if ('IntersectionObserver' in window) {
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
   if(e.isIntersecting){reveal(e.target);observer.unobserve(e.target);}
  }),{threshold:0,rootMargin:'0px 0px -5% 0px'});
  elements.forEach(el=>observer.observe(el));
 } else elements.forEach(el=>el.classList.add('vu'));
 new MutationObserver(stop).observe(root,{attributes:true,attributeFilter:['data-motion']});
 reduced.addEventListener('change',stop);
 document.addEventListener('visibilitychange',stop);
 window.addEventListener('beforeprint',()=>{
  for(const a of animations)a.cancel();animations.clear();
  for(const [el,item] of counters){cancelAnimationFrame(item.id);el.textContent=item.original;}counters.clear();
 });
})();

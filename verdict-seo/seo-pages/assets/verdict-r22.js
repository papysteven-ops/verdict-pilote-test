/* No network calls. The user keeps control of prepared support messages. */
(function(){'use strict';
 document.querySelectorAll('[data-message-form]').forEach(form=>{
  const status=form.querySelector('[role=status]');
  const message=()=>['VERDICT — Message préparé, non envoyé','Sujet : '+form.elements.subject.value.trim(),'','Message :',form.elements.message.value.trim()].join('\n');
  form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const url=URL.createObjectURL(new Blob([message()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='verdict-message.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Fichier de message préparé pour téléchargement. Aucun envoi effectué.';});
  form.querySelector('[data-copy-message]').addEventListener('click',async()=>{if(!form.reportValidity())return;try{await navigator.clipboard.writeText(message());status.textContent='Message copié. Aucun envoi effectué.';}catch{status.textContent='La copie n’est pas disponible ici. Utilisez le téléchargement pour conserver votre message.';}});
 });
 const input=document.querySelector('[data-guide-search]');
 if(input){const cards=[...document.querySelectorAll('[data-guide-card]')],count=document.querySelector('[data-guide-count]');const clean=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const update=()=>{const words=clean(input.value).trim().split(/\s+/).filter(Boolean);let n=0;cards.forEach(c=>{const found=words.every(w=>clean(c.textContent).includes(w));c.hidden=!found;if(found)n++;});count.textContent=n+' guide'+(n>1?'s':'')+' disponible'+(n>1?'s':'')+(n===0?' — essayez un autre terme.':'');};input.addEventListener('input',update);update();}
})();

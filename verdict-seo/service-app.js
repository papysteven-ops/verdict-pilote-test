/* Les animations accompagnent la lecture ; elles ne fabriquent aucune donnée. */
(function(){'use strict';
const body=document.body;if(!body.classList.contains('sv-service'))return;
const cards=[...document.querySelectorAll('main>.bloc')];
if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('sv-arrive');observer.unobserve(entry.target);}}),{threshold:.08});cards.forEach(card=>observer.observe(card));}
const faq=document.querySelector('.faq'),details=faq?[...faq.querySelectorAll('details')]:[];
if(details.length>3){const label=document.createElement('label');label.className='sv-question-search';const title=document.createElement('span');title.textContent='Retrouver une réponse';const input=document.createElement('input');input.type='search';input.placeholder='Un mot, une question…';input.autocomplete='off';label.append(title,input);const empty=document.createElement('p');empty.className='sv-empty';empty.textContent='Aucune réponse ne correspond à ce mot. Essayez un terme plus court.';empty.hidden=true;details[0].before(label);details.at(-1).after(empty);const normalize=value=>value.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');input.addEventListener('input',()=>{const query=normalize(input.value.trim());let found=0;details.forEach(detail=>{const show=!query||normalize(detail.textContent).includes(query);detail.hidden=!show;if(show)found++;});empty.hidden=found>0;});}
})();

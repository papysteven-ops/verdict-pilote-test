(function(){
 'use strict';
 const cfg=window.VERDICT_ACQUISITION||{};
 async function send(action,body){
  const response=await fetch(cfg.endpoint+'/'+action,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(8000)});
  const data=await response.json();if(!response.ok||!data.ok)throw Error('unconfirmed');return data;
 }
 const form=document.querySelector('[data-acquisition-form]');
 if(form){const fields=form.querySelector('fieldset'),status=form.querySelector('[role=status]');fields.disabled=!cfg.enabled;
  if(cfg.enabled)status.textContent='Votre accord est facultatif. Une confirmation sera envoyée par e-mail.';
  form.addEventListener('submit',async e=>{e.preventDefault();if(!cfg.enabled||!form.reportValidity())return;
   const payload={email:form.elements.email.value,consent:form.elements.consent.checked,consent_version:cfg.consentVersion,source:location.pathname};
   fields.disabled=true;status.textContent='Envoi en cours…';
   try{await send('inscription',payload);status.textContent='Demande reçue. Confirmez-la depuis le message envoyé par e-mail. Aucun abonnement payant n’a été créé.';form.reset();}
   catch{status.textContent='Votre demande n’a pas été confirmée. Réessayez plus tard.';}
   finally{fields.disabled=false;}
  });
 }
 const action=document.querySelector('[data-acquisition-action]');
 if(action){const output=document.querySelector('[data-action-status]');let token='';try{token=decodeURIComponent(location.hash.slice(1));}catch{}
  action.disabled=!cfg.enabled||!token;
  if(cfg.enabled)output.textContent=token?'Confirmez l’action pour vérifier votre lien.':'Ouvrez le lien personnel reçu par e-mail. Aucun lien valide n’est présent ici.';
  action.addEventListener('click',async()=>{if(!cfg.enabled||!token)return;action.disabled=true;output.textContent='Vérification en cours…';
   try{const data=await send(action.dataset.acquisitionAction,{token});const expected=action.dataset.acquisitionAction==='retirer'?'retire':'confirme';
    if(data.state!==expected)throw Error('unexpected-state');
    history.replaceState(null,'',location.pathname);token='';output.textContent=expected==='retire'?'Votre adresse a été retirée.':'Votre demande est confirmée.';
   }catch{output.textContent='Le lien est expiré ou le service est indisponible. L’action n’est pas confirmée.';action.disabled=false;}
  });
 }
})();

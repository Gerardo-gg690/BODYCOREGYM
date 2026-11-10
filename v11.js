(()=>{
 const $=id=>document.getElementById(id);
 $('quickLogout').onclick=()=>window.bodycoreFirebase?.logout();
 $('quickRefresh').onclick=async()=>{const b=$('quickRefresh');b.disabled=true;try{await window.bodycoreFirebase?.refresh();}catch(e){alert('Error al actualizar: '+e.message);}finally{b.disabled=false;}};
 const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function reminders(){
  let current;try{current=JSON.parse(localStorage.getItem('bodycore_demo_data')||'{}');}catch(_){current={};}
  const start=new Date();start.setHours(0,0,0,0);
  const rows=(current.members||[]).filter(m=>m.expiry&&m.phone).map(m=>({m,days:Math.round((new Date(m.expiry+'T00:00:00')-start)/86400000)})).filter(x=>x.days>=0&&x.days<=3).sort((a,b)=>a.days-b.days);
  $('waList').innerHTML=rows.length?rows.map(({m,days})=>{const phone=String(m.phone).replace(/\D/g,'');const msg=`Hola ${m.name}, te saludamos de BODYCORE GYM. Tu membresía ${days===0?'vence hoy':`vence en ${days} día(s)`} (${m.expiry}). ¡Te esperamos para renovar!`;return `<div class="wa-item"><span>${escape(m.name)} · ${days===0?'Vence hoy':days+' día(s)'} </span><a target="_blank" rel="noopener noreferrer" href="https://wa.me/${phone.length===8?'503'+phone:phone}?text=${encodeURIComponent(msg)}">Enviar WhatsApp ↗</a></div>`;}).join(''):'No hay membresías con teléfono que venzan en los próximos 3 días.';
 }
 window.addEventListener('bodycore-firebase-loaded',reminders);window.addEventListener('bodycore-live-update',reminders);
 document.addEventListener('click',e=>{if(e.target.closest('#quickRefresh'))setTimeout(reminders,500);});reminders();
})();
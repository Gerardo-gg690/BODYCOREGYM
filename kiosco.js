(() => {
  const codeOut=document.getElementById('memberCode');
  const result=document.getElementById('result');
  let code='';
  const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const dateLabel=value=>value?new Date(`${value}T00:00:00`).toLocaleDateString('es-SV',{day:'2-digit',month:'long',year:'numeric'}):'—';
  const daysLeft=value=>Math.ceil((new Date(`${value}T00:00:00`)-new Date(`${today()}T00:00:00`))/86400000);
  const show=(kind,title,lines)=>{result.className=`result ${kind}`;result.innerHTML=`<div class="result-symbol">${kind==='ok'?'✓':'!'}</div><b>${title}</b>${lines.map((line,i)=>`<span class="${i===lines.length-1&&kind==='no'?'renew':''}">${line}</span>`).join('')}`;};
  const draw=()=>{codeOut.textContent=code.padEnd(4,'_').split('').join(' ');};
  document.getElementById('keypad').addEventListener('click',e=>{const b=e.target.closest('[data-key]');if(!b)return;const k=b.dataset.key;if(k==='clear')code='';else if(k==='back')code=code.slice(0,-1);else if(/^\d$/.test(k)&&code.length<4)code+=k;draw();});
  // Permitir el ingreso del PIN con teclado físico, además del teclado en pantalla.
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat) return;
    const target = e.target;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      document.querySelector(`#keypad [data-key="${e.key}"]`).click();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      document.querySelector('#keypad [data-key="back"]').click();
    } else if (e.key === 'Delete' || e.key === 'Escape') {
      e.preventDefault();
      document.querySelector('#keypad [data-key="clear"]').click();
    } else if (e.key === 'Enter' && target?.id !== 'checkIn') {
      e.preventDefault();
      document.getElementById('checkIn').click();
    }
  });
  document.getElementById('reset').addEventListener('click',()=>{code='';draw();result.className='result';result.innerHTML='<div class="result-symbol">⌨</div><b>Esperando tu código</b><span>Tu estado aparecerá aquí.</span>';});
  document.getElementById('checkIn').addEventListener('click',async()=>{
    if(!/^\d{4}$/.test(code)){show('no','CÓDIGO INCOMPLETO',['Ingresa los cuatro números de tu código.']);return;}
    let data;try{data=JSON.parse(localStorage.getItem('bodycore_demo_data')||'null');}catch(_){data=null;}
    if(!data||!Array.isArray(data.members)){show('no','SISTEMA NO DISPONIBLE',['No se encontraron los datos del gimnasio en este dispositivo.']);return;}
    data.attendance=Array.isArray(data.attendance)?data.attendance:[];data.payments=Array.isArray(data.payments)?data.payments:[];
    const m=data.members.find(x=>String(x.code||'')===code);
    if(!m){show('no','CÓDIGO NO ENCONTRADO',['Verifica los números e inténtalo nuevamente.']);return;}
    const d=today(),n=m.expiry?daysLeft(m.expiry):null;
    const validMember=m.monthPaid===true&&!!m.lastPayment&&!!m.expiry&&m.expiry>=d;
    const validDay=m.plan==='Day pass'&&m.dayPaid===true&&m.lastPayment===d;
    const first=(m.name||'Cliente').trim().split(/\s+/)[0];
    if(!validMember&&!validDay){
      const reason=m.monthPaid&&m.expiry&&n<0?`Tu membresía venció hace ${Math.abs(n)} día(s), el ${dateLabel(m.expiry)}.`:'No tienes una membresía pagada y vigente.';
      show('no','RENOVACIÓN PENDIENTE',[first,reason,'Acércate a recepción para renovar.','Mensualidad $25.00 · 15 días $15.00']);return;
    }
    const already=data.attendance.some(a=>a.memberId===m.id&&a.date===d);
    if(!already){
      const t=new Date().toTimeString().slice(0,5);
      const entry={id:Date.now(),memberId:m.id,date:d,time:t,paymentType:'arrival',planPaid:validDay?'Pase diario pagado':m.plan,dayPaid:false,amount:0,paid:true};
      try {
        const user=firebase.auth().currentUser;
        if(!user)throw new Error('Inicia sesión en el kiosco para registrar la llegada.');
        const ref=firebase.firestore().collection('gyms').doc(user.uid);
        await firebase.firestore().runTransaction(async tx=>{
          const snap=await tx.get(ref);if(!snap.exists)throw new Error('No se encontraron registros en la nube.');
          const latest=snap.data().data||{};
          const visits=Array.isArray(latest.attendance)?latest.attendance:[];
          if(visits.some(a=>a.memberId===m.id&&a.date===d))return;
          tx.update(ref,{data:{...latest,attendance:[...visits,entry]},updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
        });
      }catch(err){show('no','NO SE PUDO REGISTRAR',[err.message,'Comprueba tu conexión.']);return;}
    }
    const remaining=validDay?'Tu pase diario está pagado.':n===0?'Tu membresía vence hoy.':`Te quedan ${n} día(s) para renovar.`;
    show('ok',already?'LLEGADA YA REGISTRADA':'¡LLEGADA REGISTRADA!',[`Hola, ${first}.`,remaining,m.expiry?`Fecha de vencimiento: ${dateLabel(m.expiry)}.`:'Pase válido únicamente hoy.','No se realizó ningún cobro.']);
    code='';draw();
  });
  draw();
})();

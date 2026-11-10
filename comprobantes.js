/* BODYCORE GYM V16: comprobante y acceso a WhatsApp después de registrar pago.
   No es factura fiscal electrónica ni envía archivos automáticamente. */
(function(){
 let current=null;
 const $=id=>document.getElementById(id);
 const clean=x=>String(x??'').replace(/[\x00-\x1f\x7f]/g,' ').trim();
 const phone=x=>{
   let d=String(x||'').replace(/\D/g,'');
   if(d.length===8)d='503'+d;
   return /^503\d{8}$/.test(d)?d:null;
 };
 const date=x=>{
   if(!x)return 'No indicada';
   const parts=String(x).slice(0,10).split('-');
   return parts.length===3?`${parts[2]}/${parts[1]}/${parts[0]}`:clean(x);
 };
 const currency=x=>'$'+Number(x||0).toFixed(2);
 const safeName=x=>clean(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').slice(0,50);
 function pdf(){
   if(!current)return false;
   if(!window.jspdf?.jsPDF){
     alert('No se pudo cargar el generador PDF. Verifica la conexión a Internet y vuelve a intentarlo.');
     return false;
   }
   const {m,payment}=current;
   const doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});
   doc.setFillColor(20,24,32);doc.rect(0,0,210,48,'F');
   doc.setFont('helvetica','bold');doc.setFontSize(24);doc.setTextColor(255,255,255);
   doc.text('BODYCORE GYM',20,25);
   doc.setFontSize(10);doc.text('COMPROBANTE DE PAGO',20,35);
   doc.setTextColor(35,42,53);
   doc.setFontSize(11);doc.setFont('helvetica','normal');
   const lines=[
    ['No. de operacion',String(payment.id||'—')],
    ['Fecha de pago',date(payment.date)],
    ['Cliente',clean(m.name)],
    ['Codigo de cliente',clean(m.code)],
    ['Tipo de membresia',clean(payment.type||m.plan)],
    ['Fecha de vencimiento',date(payment.expiry||m.expiry)],
    ['Monto pagado',currency(payment.amount)],
    ['Estado','PAGADO']
   ];
   let y=65;
   lines.forEach(([k,v],i)=>{
     if(i%2===0){doc.setFillColor(245,247,250);doc.rect(18,y-8,174,13,'F');}
     doc.setFont('helvetica','bold');doc.text(k,22,y);
     doc.setFont('helvetica','normal');
     doc.text(doc.splitTextToSize(v,92),97,y);
     y+=16;
   });
   doc.setDrawColor(224,228,232);doc.line(18,204,192,204);
   doc.setFontSize(9);doc.setTextColor(100,105,112);
   doc.text('Comprobante interno de pago. No sustituye un documento tributario',20,214);
   doc.text('electronico ni una factura fiscal autorizada.',20,220);
   doc.text('Gracias por entrenar con BODYCORE GYM.',20,237);
   doc.save(`BODYCORE_Comprobante_${safeName(m.name)}_${payment.id||'pago'}.pdf`);
   return true;
 }
 function close(){const modal=$('receiptModal');if(modal)modal.style.display='none';}
 function whatsapp(){
   if(!current)return;
   const {m,payment}=current;
   const n=phone(m.phone);
   if(!n){alert('Este cliente no tiene un telefono valido de El Salvador. Actualiza su telefono para abrir WhatsApp.');return;}
   const msg=`Hola, ${clean(m.name)}. Gracias por tu pago en BODYCORE GYM.\n\nMembresia: ${clean(payment.type||m.plan)}\nMonto pagado: ${currency(payment.amount)}\nFecha: ${date(payment.date)}\nVencimiento: ${date(payment.expiry||m.expiry)}\nEstado: PAGADO.\n\nTe compartimos tu comprobante de pago.`;
   window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer');
 }
 // Llamar únicamente después de que el pago se haya guardado correctamente.
 window.bodycoreShowReceipt=function(member,payment){
   if(!member||!payment)return;
   current={m:{...member},payment:{...payment,expiry:member.expiry}};
   const desc=$('receiptDescription');
   if(desc)desc.textContent=`Pago de ${currency(payment.amount)} registrado para ${clean(member.name)}. Descarga el comprobante y abre WhatsApp para enviarlo.`;
   const modal=$('receiptModal');if(modal)modal.style.display='flex';
 };
 document.addEventListener('DOMContentLoaded',()=>{
   $('receiptClose')?.addEventListener('click',close);
   $('receiptDone')?.addEventListener('click',close);
   $('receiptDownload')?.addEventListener('click',pdf);
   $('receiptWhatsApp')?.addEventListener('click',whatsapp);
 });
})();

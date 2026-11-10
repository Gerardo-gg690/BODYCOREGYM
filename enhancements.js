
// BODYCORE GYM - ampliación de recepción, calendario, pagos e inventario.
const catalog = [
 ['Monster','Bebidas',2.75],['Be-light','Bebidas',1.00],['Powerade','Bebidas',1.25],
 ['AMP','Bebidas',1.25],['Agua litro','Bebidas',1.00],['Coca cero','Bebidas',0.80],
 ['Barras Kirkland','Snacks',0.50],['Barras Nature Valley','Snacks',1.00],
 ['Scoop de proteína','Suplementos',2.00],['Scoop de pre entreno','Suplementos',2.00],
 ['Scoop de creatina','Suplementos',1.00]
];
const planPrices={'Mensual':25,'15 días':15,'Day pass':2.50};
data.attendance=data.attendance||[];
data.sales=data.sales||[];
// Normaliza los códigos anteriores a exactamente cuatro dígitos.
data.members.forEach(m=>{const digits=String(m.code||'').replace(/\\D/g,'');m.code=digits.slice(-4).padStart(4,'0');});

data.payments=data.payments||[];
data.products=data.products||[];
data.deletedCatalogNames=data.deletedCatalogNames||[];
catalog.forEach(([name,category,price])=>{
 if(!data.deletedCatalogNames.includes(name.toLowerCase()) && !data.products.some(p=>p.name.toLowerCase()===name.toLowerCase()))
   data.products.push({id:Math.max(0,...data.products.map(p=>Number(p.id)||0))+1,name,category,price,stock:0,image:''});
});
data.members.forEach(m=>{
 if(!m.plan)m.plan='Mensual';
 if(m.dayPaid===undefined)m.dayPaid=false;
 if(m.monthPaid===undefined)m.monthPaid=Number(m.amount||0)>0&&!!m.lastPayment;
});
save();

function ensureExtraPages(){
 const nav=$('.nav-menu');
 if(!$('#navDaily')) nav.insertAdjacentHTML('beforeend','<button class="nav-link" id="navDaily" data-page="daily"><span class="nav-icon">▦</span>Asistencia diaria</button>');
 if(!$('#page-daily')){
  $('#page-inventory').insertAdjacentHTML('afterend',`
  <section class="page" id="page-daily">
   <div class="welcome-row"><div><div class="eyebrow">CALENDARIO / RECEPCIÓN</div><h1>Asistencia <em>diaria.</em></h1><p>Consulta quién llegó y registra pagos del día o mensualidades.</p></div>
    <div class="field-wrap"><label>FECHA DEL REGISTRO</label><input id="dailyDate" type="date"></div>
   </div>
   <div class="stats-grid compact-stats">
    <article class="stat-card"><div class="stat-top"><span>PERSONAS QUE LLEGARON</span><span class="stat-icon blue">♙</span></div><div class="stat-value" id="dailyPeople">0</div><div class="stat-foot">Visitas del día seleccionado</div></article>
    <article class="stat-card"><div class="stat-top"><span>PAGOS DEL DÍA</span><span class="stat-icon green">$</span></div><div class="stat-value" id="dailyRevenue">$0.00</div><div class="stat-foot">Ingresos registrados</div></article>
    <article class="stat-card"><div class="stat-top"><span>MENSUALIDADES COBRADAS</span><span class="stat-icon amber">✓</span></div><div class="stat-value" id="dailyMonthly">0</div><div class="stat-foot">Pagos de mensualidad</div></article>
   </div>
   <article class="panel table-panel">
    <div class="panel-heading"><div><div class="eyebrow">NUEVA VISITA</div><h2>Registrar llegada y pago</h2></div></div>
    <form id="visitForm" class="form-grid">
     <div class="field-wrap"><label>CLIENTE</label><select id="visitMember" required></select></div>
     <div class="field-wrap"><label>TIPO DE INGRESO</label><select id="visitType"><option value="day">Pago del día · $2.50</option><option value="monthly">Mensualidad · $25.00</option><option value="15days">15 días · $15.00</option><option value="visit">Solo registrar llegada</option></select></div>
     <div class="field-wrap"><label>MONTO RECIBIDO ($)</label><input id="visitAmount" type="number" min="0" step="0.01" value="2.50"></div>
     <div class="field-wrap"><label>HORA</label><input id="visitTime" type="time" required></div>
     <div class="full-field"><button class="primary-btn" type="submit">＋ Registrar llegada</button></div>
    </form>
   </article>
   <article class="panel table-panel" style="margin-top:16px">
    <div class="panel-heading"><div><div class="eyebrow">CONTROL DEL DÍA</div><h2>Personas que llegaron</h2></div></div>
    <div class="table-scroll"><table><thead><tr><th>CLIENTE</th><th>HORA</th><th>PAGO DEL DÍA</th><th>MENSUALIDAD / PLAN</th><th>MONTO</th></tr></thead><tbody id="dailyTable"></tbody></table></div>
   </article>
   <article class="panel table-panel" style="margin-top:16px">
    <div class="panel-heading"><div><div class="eyebrow">AVISOS AUTOMÁTICOS</div><h2>Mensualidades por vencer</h2></div></div><p class="muted">El sistema identifica vencimientos a 5 y 3 días. Desde aquí puedes abrir WhatsApp con el recordatorio listo.</p><div id="expiryReminders" class="attention-list"></div>
   </article>
  </section>`);
 }
 const oldNames={dashboard:'Panel general',members:'Clientes',access:'Control de acceso',payments:'Pagos y membresías',inventory:'Inventario y ventas',daily:'Asistencia diaria'};
 window.go=function(page){$$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));$$('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$('#breadcrumbPage').textContent=oldNames[page]||page;$('#sidebar').classList.remove('open');if(page==='daily')renderDaily();};
 $$('.nav-link').forEach(b=>{b.onclick=()=>go(b.dataset.page)});
}
function dateKey(){return $('#dailyDate')?.value||iso(today)}
function fillVisitMembers(){
 const s=$('#visitMember');if(!s)return;
 s.innerHTML=data.members.map(m=>`<option value="${m.id}">${m.name} · ${m.code}</option>`).join('');
}
function sendReminder(m){
 const days=daysLeft(m.expiry);
 const msg=encodeURIComponent(`Hola ${m.name}, te saludamos de BODYCORE GYM. Tu mensualidad vence ${days===0?'hoy':`en ${days} días`}. Puedes pasar a recepción para renovar. ¡Te esperamos!`);
 window.open(`https://wa.me/503${(m.phone||'').replace(/\D/g,'')}?text=${msg}`,'_blank');
}
function renderDaily(){
 fillVisitMembers();
 const d=dateKey(),visits=data.attendance.filter(a=>a.date===d);
 $('#dailyPeople').textContent=visits.length;
 $('#dailyRevenue').textContent=money(visits.reduce((s,a)=>s+Number(a.amount||0),0));
 $('#dailyMonthly').textContent=visits.filter(a=>a.paymentType==='monthly'||a.paymentType==='15days').length;
 $('#dailyTable').innerHTML=visits.map(a=>{const m=data.members.find(x=>x.id===a.memberId);return `<tr><td><b>${m?.name||'Cliente eliminado'}</b></td><td>${a.time}</td><td>${a.dayPaid?'Pagado':'No pagado'}</td><td>${a.planPaid||'—'}</td><td>${money(a.amount)}</td></tr>`}).join('')||'<tr><td colspan="5">No hay llegadas registradas para esta fecha.</td></tr>';
 const reminders=data.members.filter(m=>[5,3].includes(daysLeft(m.expiry)));
 $('#expiryReminders').innerHTML=reminders.map(m=>`<div class="attention-item"><div class="mini-avatar">${initials(m.name)}</div><div class="attention-info"><b>${m.name}</b><small>Vence en ${daysLeft(m.expiry)} días · ${dateText(m.expiry)}</small></div><button class="action-btn" data-remind="${m.id}">Recordar</button></div>`).join('')||'<div class="empty-note">No hay mensualidades que venzan en 5 o 3 días.</div>';
}
function enhancedRenderMembers(){
 const q=($('#memberSearch')?.value||'').toLowerCase(),filter=$('#memberFilter')?.value||'all';
 const list=data.members.filter(m=>(m.name.toLowerCase().includes(q)||m.code.toLowerCase().includes(q))&&(filter==='all'||stateOf(m)===filter));
 $('#membersTable').innerHTML=list.map(m=>`<tr><td><div class="person-cell"><div class="mini-avatar">${initials(m.name)}</div><div><b>${m.name}</b><small>BODYCORE GYM</small></div></div></td><td><b>${m.code}</b></td><td>${m.phone||'—'}</td><td>${m.plan}</td><td>${m.dayPaid?'Sí':'No'}</td><td>${m.monthPaid?'Sí':'No'}</td><td>${dateText(m.expiry)}</td><td>${statusBadge(m)}</td><td><button class="action-btn" data-remind="${m.id}">WhatsApp</button> <button class="action-btn" data-edit-member="${m.id}">Editar</button> <button class="action-btn" style="color:#b42318;border-color:#efb4b4" data-delete-member="${m.id}">Eliminar</button></td></tr>`).join('')||'<tr><td colspan="9">No se encontraron clientes.</td></tr>';
 $('#memberCount').textContent=`Mostrando ${list.length} de ${data.members.length} clientes`;
}
const originalRenderMembers=renderMembers;
renderMembers=enhancedRenderMembers;
function enhancedInventory(){
 $('#productCount').textContent=data.products.length;
 $('#stockCount').textContent=data.products.reduce((a,p)=>a+Number(p.stock),0);
 $('#salesTotal').textContent=money(data.sales.reduce((a,s)=>a+Number(s.total),0));
 $('#inventoryTable').innerHTML=data.products.map(p=>`<tr><td><div class="person-cell">${p.image?`<img src="${p.image}" style="width:35px;height:35px;object-fit:cover;border-radius:6px">`:'<div class="mini-avatar">▤</div>'}<b>${p.name}</b></div></td><td>${p.category}</td><td>${money(p.price)}</td><td>${p.stock}</td><td><span class="${p.stock<=5?'low-stock':'normal-stock'}">${p.stock<=5?'Stock bajo':'Disponible'}</span></td><td><button class="sale-btn" data-sale="${p.id}" ${p.stock<1?'disabled':''}>＋ Vender</button> <button class="action-btn" data-restock="${p.id}">＋ Stock</button> <button class="action-btn" data-delete-product="${p.id}" style="color:#b42318;border-color:#efb4b4">Eliminar</button></td></tr>`).join('');
 const totals={};data.sales.forEach(s=>{const p=data.products.find(x=>x.id===s.productId),cat=p?.category||s.category||'Otros';totals[cat]=(totals[cat]||0)+Number(s.total||0);});
 $('#salesCategorySummary').innerHTML=Object.entries(totals).map(([cat,total])=>`<article class="stat-card"><div class="stat-top"><span>${cat.toUpperCase()}</span><span class="stat-icon amber">$</span></div><div class="stat-value">${money(total)}</div><div class="stat-foot">Total vendido</div></article>`).join('')||'<p class="muted">Aún no hay ventas registradas.</p>';
 const selectedSalesDate=$('#salesReportDate')?.value;const sales=[...data.sales].filter(s=>!selectedSalesDate||s.date===selectedSalesDate).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 $('#salesDetailTable').innerHTML=sales.map(s=>{const p=data.products.find(x=>x.id===s.productId);return `<tr><td>${dateText(s.date)}</td><td><b>${p?.name||s.productName||'Producto eliminado'}</b></td><td>${p?.category||s.category||'—'}</td><td>${Number(s.quantity||1)}</td><td>${money(s.total)}</td></tr>`;}).join('')||'<tr><td colspan="5">No hay ventas registradas para la fecha seleccionada.</td></tr>';
}
renderInventory=enhancedInventory;
const oldRender=render;
render=function(){oldRender();enhancedRenderMembers();enhancedInventory();renderDaily();};
ensureExtraPages();
$('#membersTable').closest('table').querySelector('thead tr').innerHTML='<th>CLIENTE</th><th>CÓDIGO</th><th>TELÉFONO</th><th>PLAN</th><th>PAGÓ DÍA</th><th>PAGÓ MES</th><th>VENCIMIENTO</th><th>ESTADO</th><th></th>';
const planSelect=$('#memberForm select[name=plan]');
planSelect.innerHTML='<option>Mensual</option><option>15 días</option><option>Day pass</option><option value="Promoción personalizada">Promoción personalizada</option>';
$('#memberForm [name=amount]').value=25;
planSelect.addEventListener('change',()=>$('#memberForm [name=amount]').value=planPrices[planSelect.value]);
$('#memberForm [name=amount]').readOnly=false;
$('#paymentForm').elements.amount.addEventListener('focus',e=>e.target.readOnly=false);
$('#dailyDate').value=iso(today);
$('#dailyDate').addEventListener('change',renderDaily);
$('#visitTime').value=new Date().toTimeString().slice(0,5);
$('#visitType').addEventListener('change',()=>{const type=$('#visitType').value;$('#visitAmount').value=({day:2.5,monthly:25,'15days':15,visit:0})[type];$('#visitAmount').readOnly=type==='visit';});
$('#visitForm').addEventListener('submit',e=>{
 e.preventDefault();const memberId=Number($('#visitMember').value),m=data.members.find(x=>x.id===memberId),type=$('#visitType').value,amount=Number($('#visitAmount').value||0),d=dateKey();
 const a={id:Date.now(),memberId,date:d,time:$('#visitTime').value,dayPaid:type==='day',planPaid:type==='monthly'?'Mensualidad':type==='15days'?'15 días':type==='day'?'Day pass':'—',paymentType:type,amount};
 data.attendance.push(a);
 if(type==='day'){m.dayPaid=true;data.payments.push({id:Date.now()+1,memberId,amount,date:d,type:'Day pass'});}
 if(type==='monthly'||type==='15days'){
  const duration=type==='monthly'?30:15;m.plan=type==='monthly'?'Mensual':'15 días';m.start=d;m.expiry=iso(new Date(new Date(d+'T00:00:00').getTime()+duration*86400000));m.lastPayment=d;m.amount=amount;m.monthPaid=true;m.dayPaid=false;
  data.payments.push({id:Date.now()+1,memberId,amount,date:d,type:m.plan});
 }
 save();render();toast('Llegada y pago registrados correctamente.');
});
$('#openProductModal').textContent='＋ Agregar producto';
const productForm=$('#productForm');
productForm.querySelector('[name=category]').outerHTML='<select name="category"><option>Bebidas</option><option>Snacks</option><option>Suplementos</option><option>Accesorios</option><option>Otros</option></select>';
productForm.insertAdjacentHTML('afterbegin','<div class="field-wrap"><label>FOTO DEL PRODUCTO</label><input name="imageFile" type="file" accept="image/*"></div>');
productForm.insertAdjacentHTML('beforeend','<p class="muted">Para un producto que ya existe, usa “＋ Stock” en la tabla. Usa este formulario para crear uno nuevo.</p>');
productForm.addEventListener('submit',e=>{
 const f=e.currentTarget;if(!f.elements.imageFile.files[0])return;
 e.preventDefault();e.stopImmediatePropagation();const fd=new FormData(f),file=f.elements.imageFile.files[0],reader=new FileReader();
 reader.onload=()=>{data.products.push({id:Math.max(0,...data.products.map(p=>p.id))+1,name:fd.get('name').trim(),category:fd.get('category'),price:Number(fd.get('price')),stock:Number(fd.get('stock')),image:reader.result});save();render();closeModal('productModal');toast('Producto agregado con fotografía.');};
 reader.readAsDataURL(file);
},true);
$('#openMemberModal').addEventListener('click',()=>{const f=$('#memberForm');delete f.dataset.editId;f.closest('.modal').querySelector('.modal-head h2').textContent='Registrar cliente';f.querySelector('button[type=submit]').textContent='Guardar cliente';if(f.elements.code){f.elements.code.value='';f.elements.code.readOnly=true;}});
document.addEventListener('click',e=>{
 const edit=e.target.closest('[data-edit-member]');
 if(edit){const m=data.members.find(x=>x.id===Number(edit.dataset.editMember));if(!m)return;const f=$('#memberForm');f.reset();f.dataset.editId=String(m.id);f.elements.name.value=m.name||'';f.elements.phone.value=m.phone||'';f.elements.plan.value=m.plan||'Mensual';f.elements.start.value=m.start||todayKey();f.elements.amount.value=Number(m.amount||0).toFixed(2);f.elements.code.value=String(m.code||'').replace(/\D/g,'').slice(-4).padStart(4,'0');f.elements.code.readOnly=false;f.elements.amount.dispatchEvent(new Event('input',{bubbles:true}));f.elements.expiry.value=m.expiry||'';f.closest('.modal').querySelector('.modal-head h2').textContent='Editar cliente';f.querySelector('button[type=submit]').textContent='Guardar cambios';openModal('memberModal');return;}
 const del=e.target.closest('[data-delete-member]');
 if(del){const id=Number(del.dataset.deleteMember),m=data.members.find(x=>x.id===id);if(!m)return;if(!confirm(`¿Eliminar a ${m.name}? También se quitarán sus registros de pagos y asistencia.`))return;data.members=data.members.filter(x=>x.id!==id);data.payments=data.payments.filter(x=>x.memberId!==id);data.attendance=data.attendance.filter(x=>x.memberId!==id);save();render();toast('Cliente eliminado correctamente.');return;}
 const deleteProduct=e.target.closest('[data-delete-product]');
 if(deleteProduct){
  const id=Number(deleteProduct.dataset.deleteProduct),p=data.products.find(x=>x.id===id);
  if(!p)return;
  if(!confirm(`¿Eliminar "${p.name}" del inventario? Las ventas anteriores se conservarán en los reportes.`))return;
  data.sales.forEach(sale=>{if(sale.productId===id){sale.productName=sale.productName||p.name;sale.category=sale.category||p.category;sale.unitPrice=sale.unitPrice??p.price;}});
  data.products=data.products.filter(x=>x.id!==id);
  if(catalog.some(item=>item[0].toLowerCase()===p.name.toLowerCase())&&!data.deletedCatalogNames.includes(p.name.toLowerCase()))data.deletedCatalogNames.push(p.name.toLowerCase());
  save();render();toast(`Producto "${p.name}" eliminado del inventario.`);return;
 }
 const restock=e.target.closest('[data-restock]');if(restock){const p=data.products.find(x=>x.id===Number(restock.dataset.restock));const qty=Number(prompt(`¿Cuántas unidades deseas agregar a ${p.name}?`));if(Number.isFinite(qty)&&qty>0){p.stock+=Math.floor(qty);save();render();toast('Stock actualizado.');}}
 const sale=e.target.closest('[data-sale]');if(sale){const p=data.products.find(x=>x.id===Number(sale.dataset.sale));if(!p||p.stock<1)return;const qty=Number(prompt(`Unidades de ${p.name} que se vendieron:`, '1'));if(!Number.isInteger(qty)||qty<1||qty>p.stock){toast('Cantidad no válida o stock insuficiente.');return;}p.stock-=qty;data.sales.push({id:Date.now(),productId:p.id,productName:p.name,category:p.category,unitPrice:p.price,total:p.price*qty,quantity:qty,date:iso(today)});save();render();toast(`Venta registrada: ${qty} × ${p.name}.`);}
});
const oldGo=go;
render();

$('#memberForm').addEventListener('submit',()=>{setTimeout(()=>{const m=data.members[data.members.length-1];if(m){m.dayPaid=m.plan==='Day pass'&&Number(m.amount)>0;m.monthPaid=Number(m.amount)>0&&m.plan!=='Day pass';if(!m.monthPaid)m.lastPayment='';save();render();}},0);});

// Mejoras solicitadas: catálogo rápido, control de vigencia y reportes PDF por fecha.
function printReport(title, subtitle, headers, rows, totalLabel='') {
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const oldFrame=document.getElementById('bodycorePrintFrame');if(oldFrame)oldFrame.remove();
 const frame=document.createElement('iframe');frame.id='bodycorePrintFrame';
 frame.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
 document.body.appendChild(frame);
 const w=frame.contentWindow,doc=frame.contentDocument;
 doc.open();
 doc.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#222}h1{margin:0 0 6px;font-size:22px}p{color:#555;margin:0 0 22px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:9px;border:1px solid #ddd;text-align:left}th{background:#eee}.total{margin-top:18px;text-align:right;font-weight:bold}@page{margin:15mm}</style></head><body><h1>${esc(title)}</h1><p>${esc(subtitle)}</p><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>${totalLabel?`<div class="total">${esc(totalLabel)}</div>`:''}</body></html>`);
 doc.close();
 const cleanup=()=>{setTimeout(()=>{frame.remove();window.focus();},300);};
 w.onafterprint=cleanup;
 setTimeout(()=>{try{w.focus();w.print();}catch(err){cleanup();toast('No se pudo abrir la impresión. Intenta nuevamente.');}},250);
}
function selectedDaySales(){const d=dateKey();return data.sales.filter(s=>s.date===d)}
// Reemplaza el formulario de producto por un flujo de producto existente o nuevo.
productForm.innerHTML=`<div class="field-wrap"><label>¿QUÉ DESEAS HACER?</label><select name="mode" id="productMode"><option value="existing">Agregar stock a un producto registrado</option><option value="new">Registrar un producto nuevo</option></select></div>
<div id="existingProductFields"><div class="field-wrap"><label>PRODUCTO DEL CATÁLOGO</label><select name="existingId" id="existingProductSelect"></select></div><div class="field-wrap"><label>UNIDADES QUE INGRESAN AL STOCK</label><input name="addStock" type="number" min="1" step="1" value="1"></div><p class="muted">El nombre, categoría y precio se conservan del producto registrado.</p></div>
<div id="newProductFields" hidden><div class="field-wrap"><label>NOMBRE DEL PRODUCTO</label><input name="name" placeholder="Ej. Agua litro"></div><div class="form-grid"><div class="field-wrap"><label>CATEGORÍA</label><select name="category"><option>Bebidas</option><option>Snacks</option><option>Suplementos</option><option>Accesorios</option><option>Otros</option></select></div><div class="field-wrap"><label>PRECIO ($)</label><input name="price" type="number" min="0" step="0.01"></div><div class="field-wrap full-field"><label>EXISTENCIAS INICIALES</label><input name="stock" type="number" min="0" step="1" value="0"></div></div></div>
<div class="modal-actions"><button type="button" class="secondary-btn" data-close="productModal">Cancelar</button><button class="primary-btn" type="submit">Guardar</button></div>`;
function fillProductSelect(){const s=$('#existingProductSelect');if(s)s.innerHTML=data.products.map(p=>`<option value="${p.id}">${p.name} · ${p.category} · Stock: ${p.stock}</option>`).join('')||'<option value="">No hay productos registrados</option>';}
$('#openProductModal').addEventListener('click',()=>{fillProductSelect();$('#productMode').value='existing';$('#existingProductFields').hidden=false;$('#newProductFields').hidden=true;});
$('#productMode').addEventListener('change',e=>{$('#existingProductFields').hidden=e.target.value!=='existing';$('#newProductFields').hidden=e.target.value!=='new';});
productForm.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();const f=e.currentTarget;if(f.elements.mode.value==='existing'){const p=data.products.find(x=>x.id===Number(f.elements.existingId.value)),qty=Number(f.elements.addStock.value);if(!p||!Number.isInteger(qty)||qty<1){toast('Selecciona un producto y una cantidad válida.');return;}p.stock=Number(p.stock||0)+qty;save();render();closeModal('productModal');toast(`Stock de ${p.name} actualizado.`);return;}const name=f.elements.name.value.trim(),price=Number(f.elements.price.value),stock=Number(f.elements.stock.value);if(!name||!Number.isFinite(price)||price<0||!Number.isInteger(stock)||stock<0){toast('Completa correctamente los datos del producto.');return;}if(data.products.some(p=>p.name.toLowerCase()===name.toLowerCase())){toast('Ese producto ya existe. Selecciónalo para agregar stock.');return;}data.products.push({id:Math.max(0,...data.products.map(p=>Number(p.id)||0))+1,name,category:f.elements.category.value,price,stock,image:''});save();render();closeModal('productModal');toast('Nuevo producto agregado al inventario.');},true);

// Estado de membresía en recepción: si sigue vigente, solo registra llegada; no vuelve a cobrar ni reinicia plazo.
function syncVisitOptions(){
 const id=Number($('#visitMember').value),m=data.members.find(x=>x.id===id),d=dateKey();
 const paid=m&&m.monthPaid===true&&m.expiry>=d,sel=$('#visitType');if(!sel)return;
 const previous=sel.value;
 sel.innerHTML='<option value="day">Pago del día · $2.50</option><option value="monthly">Mensualidad · $25.00</option><option value="15days">15 días · $15.00</option><option value="visit">Solo registrar llegada (sin pago)</option>';
 sel.value=[...sel.options].some(o=>o.value===previous)?previous:(paid?'visit':'monthly');
 $('#visitAmount').value=({day:2.5,monthly:25,'15days':15,visit:0})[sel.value];
 $('#visitAmount').readOnly=sel.value==='visit';
 const hint=$('#membershipVisitHint');
 if(hint)hint.textContent=m?(paid?`Membresía pagada y vigente hasta ${dateText(m.expiry)}. Puedes registrar llegada sin cobrar o registrar otro pago.`:'Este cliente no tiene una membresía pagada y vigente. Para permitir una llegada debes registrar pago del día, mensualidad o 15 días.') :'';
}
$('#visitMember').addEventListener('change',syncVisitOptions);
$('#dailyDate').addEventListener('change',()=>{syncVisitOptions();renderDaily();renderDailySales();});
const visitForm=$('#visitForm');
visitForm.addEventListener('submit',e=>{
 e.preventDefault();e.stopImmediatePropagation();
 const memberId=Number($('#visitMember').value),m=data.members.find(x=>x.id===memberId),type=$('#visitType').value,amount=Number($('#visitAmount').value),d=dateKey();
 if(!m){toast('Selecciona un cliente.');return;}
 const paid=m.monthPaid===true&&m.expiry>=d;
 if(type==='visit'&&!paid){toast('No se puede registrar solo la llegada: este cliente no tiene una membresía pagada y vigente. Registra un pago primero.');syncVisitOptions();return;}
 if(type!=='visit'&&(!Number.isFinite(amount)||amount<=0)){toast('Ingresa un monto mayor que cero para registrar el pago.');return;}
 const labels={day:'Pago del día',monthly:'Mensualidad', '15days':'15 días',visit:`Membresía vigente hasta ${dateText(m.expiry)}`};
 const a={id:Date.now(),memberId,date:d,time:$('#visitTime').value,dayPaid:type==='day',planPaid:labels[type],paymentType:type,amount:type==='visit'?0:amount,paid:type!=='visit'};
 data.attendance.push(a);
 if(type==='day'){
  m.dayPaid=true;data.payments.push({id:Date.now()+1,memberId,amount,date:d,type:'Day pass'});
 }
 if(type==='monthly'||type==='15days'){
  const duration=type==='monthly'?30:15,base=paid&&m.expiry>d?new Date(m.expiry+'T00:00:00'):new Date(d+'T00:00:00');
  base.setDate(base.getDate()+duration);m.plan=type==='monthly'?'Mensual':'15 días';m.start=d;m.expiry=iso(base);m.lastPayment=d;m.amount=amount;m.monthPaid=true;m.dayPaid=false;
  data.payments.push({id:Date.now()+1,memberId,amount,date:d,type:m.plan});
 }
 save();render();syncVisitOptions();toast(type==='visit'?'Llegada registrada. No se realizó ningún cobro.':'Llegada y pago registrados correctamente.');
},true);

$('#visitMember').insertAdjacentHTML('afterend','<small id="membershipVisitHint" class="muted" style="display:block;margin-top:7px"></small>');

// Reportes descargables como PDF mediante Imprimir > Guardar como PDF del navegador.
const invHeading=$('#page-inventory .panel-heading');
invHeading.insertAdjacentHTML('beforeend','<div class="field-wrap" style="min-width:150px"><label>FECHA DE VENTAS</label><input id="salesReportDate" type="date"></div><button class="secondary-btn" id="downloadSalesPdf" type="button">↓ PDF del día</button>');
$('#salesReportDate').value=iso(today);
enhancedInventory();
function renderDailySales(){const d=$('#salesReportDate').value||iso(today),sales=data.sales.filter(s=>s.date===d);$('#salesDayTotal').textContent=money(sales.reduce((a,s)=>a+Number(s.total||0),0));$('#salesDayRows').innerHTML=sales.map(s=>{const p=data.products.find(x=>x.id===s.productId);return `<tr><td>${p?.name||s.productName||'Producto eliminado'}</td><td>${p?.category||s.category||'—'}</td><td>${s.quantity||1}</td><td>${money(s.total)}</td></tr>`}).join('')||'<tr><td colspan="4">No hay ventas para esta fecha.</td></tr>';}
const salesPanel=$('#salesDetailTable').closest('.panel');
salesPanel.insertAdjacentHTML('afterbegin','<div class="panel-heading"><div><div class="eyebrow">RESUMEN POR FECHA</div><h2>Ventas del día seleccionado</h2></div><strong id="salesDayTotal">$0.00</strong></div><div class="table-scroll"><table><thead><tr><th>PRODUCTO</th><th>CATEGORÍA</th><th>UNIDADES</th><th>TOTAL</th></tr></thead><tbody id="salesDayRows"></tbody></table></div>');
$('#salesReportDate').addEventListener('change',()=>{renderDailySales();enhancedInventory();});
$('#downloadSalesPdf').addEventListener('click',()=>{const d=$('#salesReportDate').value||iso(today),sales=data.sales.filter(s=>s.date===d);printReport('BODYCORE GYM — Ventas del día',`Fecha: ${dateText(d)}`,['Producto','Categoría','Unidades','Total'],sales.map(s=>{const p=data.products.find(x=>x.id===s.productId);return [p?.name||s.productName||'Producto eliminado',p?.category||s.category||'—',s.quantity||1,money(s.total)];}),`Total vendido: ${money(sales.reduce((a,s)=>a+Number(s.total||0),0))}`);});
const dailyHeading=$('#page-daily .panel-heading');
dailyHeading.insertAdjacentHTML('beforeend','<button class="secondary-btn" id="downloadAttendancePdf" type="button">↓ PDF de asistencia</button>');
$('#downloadAttendancePdf').addEventListener('click',()=>{const d=dateKey(),visits=data.attendance.filter(a=>a.date===d);printReport('BODYCORE GYM — Asistencia diaria',`Fecha: ${dateText(d)} · Personas: ${visits.length}`,['Cliente','Código','Hora','Plan / ingreso','Monto'],visits.map(a=>{const m=data.members.find(x=>x.id===a.memberId);return [m?.name||'Cliente eliminado',m?.code||'—',a.time,a.planPaid||'—',money(a.amount)];}),`Total recibido: ${money(visits.reduce((s,a)=>s+Number(a.amount||0),0))}`);});
const attendancePanel=$('#dailyTable').closest('.panel');
attendancePanel.insertAdjacentHTML('afterend','<article class="panel table-panel" id="dailyProductsPanel" style="margin-top:16px"><div class="panel-heading"><div><div class="eyebrow">VENTAS DE PRODUCTOS</div><h2>Productos vendidos</h2><p class="muted">Detalle independiente de las ventas realizadas en la fecha seleccionada.</p></div></div><div class="table-scroll"><table><thead><tr><th>PRODUCTO</th><th>CATEGORÍA</th><th>UNIDADES</th><th>TOTAL</th></tr></thead><tbody id="dailySalesRows"></tbody></table></div></article>');
const prevRenderDaily=renderDaily;
renderDaily=function(){prevRenderDaily();const sales=selectedDaySales();$('#dailySalesRows').innerHTML=sales.map(s=>{const p=data.products.find(x=>x.id===s.productId);return `<tr><td>${p?.name||s.productName||'Producto eliminado'}</td><td>${p?.category||s.category||'—'}</td><td>${s.quantity||1}</td><td>${money(s.total)}</td></tr>`}).join('')||'<tr><td colspan="4">No hay productos vendidos en esta fecha.</td></tr>';};
const prevRenderAll=render;
render=function(){prevRenderAll();renderDailySales();};
syncVisitOptions();render();

/* BODYCORE GYM V6 — pagos separados de asistencia y renovaciones desde Clientes. */
(function installMembershipFlow(){
 const $id=id=>document.getElementById(id);
 const todayKey=()=>iso(new Date());
 const addPlanDays=(start,days)=>{const dt=new Date(`${start}T00:00:00`);dt.setDate(dt.getDate()+days);return iso(dt);};
 const durationFor=plan=>plan==='Mensual'?30:plan==='15 días'?15:plan==='Day pass'?1:0;
 const defaultPrice=plan=>plan==='Mensual'?25:plan==='15 días'?15:plan==='Day pass'?2.5:0;
 const isPaidAndValid=(m,d=todayKey())=>{
  if(!m)return false;
  if(m.plan==='Day pass')return m.dayPaid===true&&m.lastPayment===d;
  return m.monthPaid===true&&!!m.lastPayment&&!!m.expiry&&m.expiry>=d;
 };
 const daysRemaining=m=>Math.max(0,daysLeft(m.expiry));
 const membershipLabel=m=>{
  if(!m?.lastPayment)return 'Sin pago registrado';
  if(m.plan==='Day pass')return isPaidAndValid(m)?'Pase diario pagado hoy':'Pase diario vencido';
  if(!m.monthPaid)return 'Sin pago registrado';
  const n=daysLeft(m.expiry);
  if(n<0)return `Vencida el ${dateText(m.expiry)}`;
  if(n===0)return 'Vence hoy';
  return `Le faltan ${n} días · vence ${dateText(m.expiry)}`;
 };
 // Estado real: una fecha futura sin pago no activa una membresía.
 stateOf=function(m){
  if(!m||!isPaidAndValid(m))return 'expired';
  if(m.plan==='Day pass')return 'active';
  const n=daysLeft(m.expiry);return n<=3?'soon':'active';
 };
 statusBadge=function(m){const s=stateOf(m);return `<span class="status ${s}">${s==='active'?'Activa':s==='soon'?'Por vencer':'Vencida / sin pago'}</span>`;};

 // Formulario de alta: el vencimiento se calcula según el plan y el pago inicial.
 const mf=$id('memberForm');
 if(mf){
  const expiry=mf.elements.expiry;expiry.required=false;expiry.readOnly=true;
  const expiryLabel=expiry.closest('.field-wrap')?.querySelector('label');if(expiryLabel)expiryLabel.textContent='VENCIMIENTO AUTOMÁTICO';
  const plan=mf.elements.plan,amount=mf.elements.amount,start=mf.elements.start;
  const customWrap=document.createElement('div');customWrap.className='field-wrap full-field';customWrap.id='customPromotionFields';
  customWrap.innerHTML='<div class="form-grid"><div class="field-wrap"><label>NOMBRE DE LA PROMOCIÓN</label><input name="promoName" maxlength="80" placeholder="Ej. Promo de verano"></div><div class="field-wrap"><label>DURACIÓN (DÍAS)</label><input name="promoDays" type="number" min="1" max="3650" step="1" placeholder="Ej. 45"></div></div>';
  plan.closest('.field-wrap').insertAdjacentElement('afterend',customWrap);
  const promoName=mf.elements.promoName,promoDays=mf.elements.promoDays;
  const isCustom=()=>plan.value==='Promoción personalizada';
  const updateCustomVisibility=()=>{customWrap.hidden=!isCustom();promoName.required=isCustom();promoDays.required=isCustom();};
  const originalPlanDuration=durationFor;
  const selectedDuration=()=>isCustom()?Number(promoDays.value):originalPlanDuration(plan.value);
  const fillEditPromo=m=>{if(m?.promoDays&&m?.promoName){plan.value='Promoción personalizada';promoName.value=m.promoName;promoDays.value=m.promoDays;}else{plan.value=m?.plan||'Mensual';promoName.value='';promoDays.value='';}updateCustomVisibility();};
  document.addEventListener('click',e=>{const edit=e.target.closest('[data-edit-member]');if(edit){const m=data.members.find(x=>x.id===Number(edit.dataset.editMember));if(m)setTimeout(()=>{fillEditPromo(m);expiry.value=m.expiry||'';},0);}});
  $id('openMemberModal')?.addEventListener('click',()=>{promoName.value='';promoDays.value='';updateCustomVisibility();});
  updateCustomVisibility();
 if(!mf.elements.code){const codeWrap=document.createElement('div');codeWrap.className='field-wrap';codeWrap.innerHTML='<label>CÓDIGO DEL CLIENTE</label><input name="code" inputmode="numeric" maxlength="4" placeholder="Se asigna automáticamente"><small class="muted">Puedes cambiarlo al editar, siempre que no esté asignado a otra persona.</small>';mf.querySelector('.form-grid').insertBefore(codeWrap,mf.querySelector('[name=phone]').closest('.field-wrap'));}
 const codeInput=mf.elements.code;
  const updatePreview=()=>{const days=selectedDuration(),paid=Number(amount.value)>0;expiry.value=paid&&Number.isInteger(days)&&days>0?addPlanDays(start.value||todayKey(),days):'';};
  plan.addEventListener('change',()=>{updateCustomVisibility();if(!isCustom())amount.value=defaultPrice(plan.value).toFixed(2);else amount.value='';updatePreview();});promoDays.addEventListener('input',updatePreview);
  [amount,start].forEach(el=>el.addEventListener('input',updatePreview));
  const startDate=start.value||todayKey();if(!start.value)start.value=startDate;updatePreview();
  mf.addEventListener('submit',e=>{
   e.preventDefault();e.stopImmediatePropagation();
   const fd=new FormData(mf),name=String(fd.get('name')||'').trim(),phone=String(fd.get('phone')||'').trim(),p=String(fd.get('plan')||'Mensual'),s=String(fd.get('start')||todayKey()),a=Number(fd.get('amount')||0);
   if(!name||!s||!Number.isFinite(a)||a<0){toast('Revisa el nombre, la fecha y el monto pagado.');return;}
   const custom=isCustom(),customName=promoName.value.trim(),customDays=Number(promoDays.value);
   if(custom&&(!customName||!Number.isInteger(customDays)||customDays<1||customDays>3650)){toast('Ingresa el nombre y una duración válida para la promoción.');return;}
   const chosenPlan=custom?customName:p,chosenDays=custom?customDays:durationFor(p);
   if(custom&&data.members.some(m=>m.plan===customName&&!m.promoDays)){toast('Usa otro nombre para la promoción.');return;}
   const editingId=Number(mf.dataset.editId||0),editing=editingId?data.members.find(x=>x.id===editingId):null;
   let code=String(fd.get('code')||'').replace(/\D/g,'').slice(0,4);
   if(editing&&!code){toast('Ingresa un código válido de 4 dígitos.');return;}
   if(editing&&code.length!==4){toast('El código debe tener exactamente 4 dígitos.');return;}
   if(editing&&data.members.some(x=>x.id!==editingId&&String(x.code)===code)){toast('Ese código ya está asignado a otro cliente.');return;}
   if(editing){
    const previouslyPaid=!!editing.lastPayment&&Number(editing.amount||0)>0;
    editing.name=name;editing.phone=phone;editing.code=code;editing.plan=chosenPlan;editing.promoName=custom?customName:null;editing.promoDays=custom?customDays:null;editing.start=s;editing.amount=a;
    // Editar los datos no crea un pago ni reinicia la membresía.
    editing.expiry=custom&&a>0?addPlanDays(s,chosenDays):String(fd.get('expiry')||editing.expiry||'');
    editing.monthPaid=previouslyPaid&&a>0&&p!=='Day pass';
    editing.dayPaid=previouslyPaid&&a>0&&p==='Day pass';
    if(!previouslyPaid||a<=0){editing.monthPaid=false;editing.dayPaid=false;editing.lastPayment='';}
    save();render();closeModal('memberModal');mf.reset();delete mf.dataset.editId;
    const title=mf.closest('.modal')?.querySelector('.modal-head h2');if(title)title.textContent='Registrar cliente';
    const submit=mf.querySelector('button[type=submit]');if(submit)submit.textContent='Guardar cliente';
    codeInput.readOnly=true;toast(`Datos de ${editing.name} actualizados. No se registró un cobro nuevo.`);return;
   }
   const used=new Set(data.members.map(x=>String(x.code||'').replace(/\D/g,'')));let n=1;while(used.has(String(n).padStart(4,'0'))&&n<=9999)n++;if(n>9999){toast('No quedan códigos disponibles.');return;}
   const id=Math.max(0,...data.members.map(x=>Number(x.id)||0))+1;code=String(n).padStart(4,'0');codeInput.value=code;
   const paid=a>0,days=chosenDays;
   const m={id,name,phone,code,plan:chosenPlan,promoName:custom?customName:null,promoDays:custom?customDays:null,start:s,expiry:paid?addPlanDays(s,days):'',lastPayment:paid?s:'',amount:a,monthPaid:paid&&p!=='Day pass',dayPaid:paid&&p==='Day pass'};
   data.members.push(m);if(paid)data.payments.push({id:Date.now(),memberId:id,amount:a,date:s,type:chosenPlan});
   save();render();closeModal('memberModal');mf.reset();codeInput.readOnly=true;toast(paid?`Cliente registrado y pago guardado. Código: ${code}`:`Cliente registrado sin pago. Código: ${code}`);
  },true);
 }

 // El modal de pagos se convierte en renovación mensual o quincenal solamente.
 const pf=$id('paymentForm');
 if(pf){
  const member=pf.elements.member,amount=pf.elements.amount,expiry=pf.elements.expiry;
  const oldExpiryWrap=expiry.closest('.field-wrap');
  const planWrap=document.createElement('div');planWrap.className='field-wrap';planWrap.innerHTML='<label>TIPO DE RENOVACIÓN</label><select name="renewPlan" id="renewPlan"><option value="Mensual">Mensualidad · $25.00</option><option value="15 días">15 días · $15.00</option></select>';
  oldExpiryWrap?.parentNode.insertBefore(planWrap,amount.closest('.field-wrap'));
  expiry.readOnly=true;expiry.required=false;
  const exLabel=oldExpiryWrap?.querySelector('label');if(exLabel)exLabel.textContent='NUEVO VENCIMIENTO AUTOMÁTICO';
  const rp=$id('renewPlan');
  const refreshRenewal=()=>{const m=data.members.find(x=>x.id===Number(member.value)),p=rp.value;amount.value=defaultPrice(p).toFixed(2);let base=todayKey();if(m?.monthPaid&&m.expiry&&m.expiry>base)base=m.expiry;expiry.value=addPlanDays(base,durationFor(p));};
  member.addEventListener('change',refreshRenewal);rp.addEventListener('change',refreshRenewal);
  pf.addEventListener('submit',e=>{
   e.preventDefault();e.stopImmediatePropagation();
   const m=data.members.find(x=>x.id===Number(member.value)),p=rp.value,a=Number(amount.value);if(!m){toast('Selecciona un cliente.');return;}if(!['Mensual','15 días'].includes(p)){toast('Selecciona mensualidad o 15 días.');return;}if(!Number.isFinite(a)||a<=0){toast('Ingresa un monto válido.');return;}
   let base=todayKey();if(m.monthPaid&&m.expiry&&m.expiry>base)base=m.expiry;
   m.plan=p;m.start=todayKey();m.expiry=addPlanDays(base,durationFor(p));m.lastPayment=todayKey();m.amount=a;m.monthPaid=true;m.dayPaid=false;
   data.payments.push({id:Date.now(),memberId:m.id,amount:a,date:todayKey(),type:p});save();render();closeModal('paymentModal');toast(`Renovación de ${p} registrada para ${m.name}.`);
  },true);
 }

 // Ocultar el cobro global: las renovaciones se inician desde la ficha de cada cliente.
 const openPay=$id('openPaymentModal');if(openPay)openPay.hidden=true;

 // En Clientes se muestran únicamente las dos opciones de renovación solicitadas.
 const clientTable=$id('membersTable');
 const renderClientRows=()=>{
  if(!clientTable)return;
  const q=($id('memberSearch')?.value||'').toLowerCase(),filter=$id('memberFilter')?.value||'all';
  const list=data.members.filter(m=>(m.name.toLowerCase().includes(q)||String(m.code).toLowerCase().includes(q))&&(filter==='all'||stateOf(m)===filter));
  clientTable.innerHTML=list.map(m=>`<tr><td><div class="person-cell"><div class="mini-avatar">${initials(m.name)}</div><div><b>${m.name}</b><small>${m.phone||'Sin teléfono'}</small></div></div></td><td><b>${m.code}</b></td><td>${m.phone||'—'}</td><td>${m.plan||'—'}</td><td>${m.lastPayment?dateText(m.lastPayment):'Sin pago'}</td><td>${m.expiry?dateText(m.expiry):'—'}</td><td>${statusBadge(m)}<small class="muted" style="display:block">${membershipLabel(m)}</small></td><td><div class="member-actions"><button class="action-btn" data-edit-member="${m.id}">Editar</button> <button class="action-btn" data-delete-member="${m.id}" style="color:#b42318;border-color:#efb4b4">Eliminar</button><div style="margin-top:6px"><button class="action-btn" data-renew-member="${m.id}" data-renew-plan="Mensual">Renovar mensual</button> <button class="action-btn" data-renew-member="${m.id}" data-renew-plan="15 días">Renovar 15 días</button></div></div></td></tr>`).join('')||'<tr><td colspan="8">No se encontraron clientes.</td></tr>';
  const count=$id('memberCount');if(count)count.textContent=`Mostrando ${list.length} de ${data.members.length} clientes`;
 };
 const membersHead=clientTable?.closest('table')?.querySelector('thead tr');if(membersHead)membersHead.innerHTML='<th>CLIENTE</th><th>CÓDIGO</th><th>TELÉFONO</th><th>PLAN</th><th>ÚLTIMO PAGO</th><th>VENCIMIENTO</th><th>ESTADO / DÍAS RESTANTES</th><th>ACCIONES</th>'; 
 renderMembers=renderClientRows;

 // La asistencia ya no contiene tipo de ingreso ni monto: solo código y llegada.
 const oldVisit=$id('visitForm');
 if(oldVisit){
  const panel=oldVisit.closest('.panel');const head=panel?.querySelector('.panel-heading h2');if(head)head.textContent='Registrar llegada';
  const form=document.createElement('form');form.id='visitForm';form.className='form-grid';form.innerHTML='<div class="field-wrap"><label for="visitCode">CÓDIGO DEL CLIENTE</label><input id="visitCode" name="code" inputmode="numeric" autocomplete="off" placeholder="Ej. 0127" required></div><div class="field-wrap"><label for="visitTime">HORA DE LLEGADA</label><input id="visitTime" type="time" required></div><div class="full-field"><small id="visitStatusHint" class="muted">Escribe el código para consultar el estado de la membresía.</small></div><div class="full-field"><button class="primary-btn" type="submit">＋ Registrar llegada</button></div>';
  oldVisit.replaceWith(form);
  const time=$id('visitTime');time.value=new Date().toTimeString().slice(0,5);
  const code=$id('visitCode'),hint=$id('visitStatusHint');
  const lookup=()=>{const m=data.members.find(x=>String(x.code).toLowerCase()===code.value.trim().toLowerCase());if(!m){hint.textContent=code.value.trim()?'Código no encontrado. Verifica el código.':'Escribe el código para consultar el estado de la membresía.';return;}hint.textContent=`${m.name} · ${m.plan||'Sin plan'} · ${membershipLabel(m)}${isPaidAndValid(m)?' · Puede registrar llegada':' · Debe pagar o renovar desde Clientes antes de ingresar'}`;};
  code.addEventListener('input',lookup);code.addEventListener('change',lookup);
  form.addEventListener('submit',e=>{e.preventDefault();const m=data.members.find(x=>String(x.code).toLowerCase()===code.value.trim().toLowerCase());if(!m){toast('No encontramos ese código de cliente.');lookup();return;}if(!isPaidAndValid(m)){toast(`${m.name} no tiene un pago vigente. Registra su pago o renovación en Clientes.`);lookup();return;}
   const d=todayKey();if(data.attendance.some(a=>a.memberId===m.id&&a.date===d)){toast(`${m.name} ya tiene una llegada registrada hoy.`);return;}
   data.attendance.push({id:Date.now(),memberId:m.id,date:d,time:time.value,paymentType:'arrival',planPaid:m.plan==='Day pass'?'Pase diario pagado':m.plan,dayPaid:false,amount:0,paid:true});save();render();code.value='';hint.textContent=`Llegada registrada para ${m.name}. ${membershipLabel(m)}`;toast(`Llegada registrada: ${m.name}. No se realizó ningún cobro.`);
  });
 }
 // Desactiva el selector antiguo; el acceso se valida por código y vigencia real.
 syncVisitOptions=function(){};

 // Ajustar la tabla diaria para distinguir claramente llegada de pago.
 const previousDailyRender=renderDaily;
 renderDaily=function(){previousDailyRender();const d=dateKey(),visits=data.attendance.filter(a=>a.date===d),payments=data.payments.filter(p=>p.date===d);const table=$id('dailyTable');if(table)table.innerHTML=visits.map(a=>{const m=data.members.find(x=>x.id===a.memberId);const pay=a.paymentType==='arrival'?'Llegada · sin cobro':a.amount>0?'Pagado':'Sin pago';return `<tr><td><b>${m?.name||'Cliente eliminado'}</b></td><td>${a.time||'—'}</td><td>${pay}</td><td>${a.planPaid||m?.plan||'—'}</td><td>${money(a.amount||0)}</td></tr>`;}).join('')||'<tr><td colspan="5">No hay llegadas registradas para esta fecha.</td></tr>';const revenue=$id('dailyRevenue');if(revenue)revenue.textContent=money(payments.reduce((sum,p)=>sum+Number(p.amount||0),0));const monthly=$id('dailyMonthly');if(monthly)monthly.textContent=payments.filter(p=>['Mensual','15 días','Quincenal'].includes(p.type)).length;};
 const previousRender=render;
 render=function(){
  previousRender();
  renderClientRows();
  renderDaily();
  const todayPayments=data.payments.filter(p=>p.date===todayKey());
  const todayIncome=todayPayments.reduce((sum,p)=>sum+Number(p.amount||0),0);
  const dashboardIncome=$id('statRevenue');if(dashboardIncome)dashboardIncome.textContent=money(todayIncome);
  const paymentsIncome=$id('payRevenue');if(paymentsIncome)paymentsIncome.textContent=money(todayIncome);
  const dashboardFoot=$id('statRevenue')?.parentElement?.querySelector('.stat-foot');if(dashboardFoot)dashboardFoot.textContent='Ingresos de hoy';
  const paymentsFoot=$id('payRevenue')?.parentElement?.querySelector('.stat-foot');if(paymentsFoot)paymentsFoot.textContent='Pagos recibidos hoy';
};

 // Los dos botones de renovación abren el modal con el plan elegido.
 document.addEventListener('click',e=>{const b=e.target.closest('[data-renew-member]');if(!b)return;const m=data.members.find(x=>x.id===Number(b.dataset.renewMember));if(!m)return;const sel=$id('paymentMember');sel.innerHTML=`<option value="${m.id}">${m.name} · ${m.code}</option>`;sel.value=String(m.id);$id('renewPlan').value=b.dataset.renewPlan||'Mensual';refreshRenewalSafe();openModal('paymentModal');});
 function refreshRenewalSafe(){const m=data.members.find(x=>x.id===Number($id('paymentMember').value)),p=$id('renewPlan')?.value||'Mensual';if(!m)return;$id('paymentForm').elements.amount.value=defaultPrice(p).toFixed(2);let base=todayKey();if(m.monthPaid&&m.expiry&&m.expiry>base)base=m.expiry;$id('paymentForm').elements.expiry.value=addPlanDays(base,durationFor(p));}
 const dailyIntro=$id('page-daily')?.querySelector('.welcome-row p');if(dailyIntro)dailyIntro.textContent='Escribe el código del cliente. La llegada se registra sin realizar cobros.';
 save();render();

 // Teclado numérico de autoservicio: consulta vencimiento y registra la llegada.
 const kioskCode=$id('accessCode'),keypad=$id('accessKeypad'),accessForm=$id('accessForm'),accessResult=$id('accessResult');
 if(kioskCode&&keypad&&accessForm&&accessResult){
  const showKioskMessage=(kind,title,person,detail,renew='')=>{
   accessResult.className=`access-result result-card ${kind==='ok'?'allowed':'denied'} kiosk-result`;
   accessResult.innerHTML=`<div class="kiosk-status">${title}</div>${person?`<div class="kiosk-person">${person}</div>`:''}<div class="kiosk-detail">${detail}</div>${renew?`<div class="kiosk-renew">${renew}</div>`:''}`;
  };
  keypad.addEventListener('click',e=>{
   const b=e.target.closest('[data-key]');if(!b)return;const k=b.dataset.key;
   if(k==='clear')kioskCode.value='';else if(k==='back')kioskCode.value=kioskCode.value.slice(0,-1);else if(/^\d$/.test(k)&&kioskCode.value.length<4)kioskCode.value+=k;
   if(accessResult.classList.contains('kiosk-result')){accessResult.className='access-result empty-result';accessResult.innerHTML='<span class="result-icon">⌨</span><b>Confirma tu código</b><small>Presiona el botón para consultar tu membresía.</small>';}
  });
  accessForm.addEventListener('submit',e=>{
   e.preventDefault();const code=kioskCode.value.trim();
   if(!/^\d{4}$/.test(code)){showKioskMessage('no','CÓDIGO INCOMPLETO','','Ingresa los 4 números de tu código.');return;}
   const m=data.members.find(x=>String(x.code)===code);
   if(!m){showKioskMessage('no','CÓDIGO NO ENCONTRADO','','Revisa los números e inténtalo nuevamente.');return;}
   const d=todayKey(),days=m.expiry?daysLeft(m.expiry):null;
   const dayPassValid=m.plan==='Day pass'&&m.dayPaid===true&&m.lastPayment===d;
   const membershipValid=isPaidAndValid(m);
   const name=(m.name||'Cliente').trim().split(/\s+/)[0];
   if(!membershipValid&&!dayPassValid){
    const detail=m.monthPaid&&m.expiry&&days<0?`Tu membresía venció hace ${Math.abs(days)} día(s), el ${dateText(m.expiry)}.`:'No tienes una membresía pagada y vigente.';
    showKioskMessage('no','RENOVACIÓN PENDIENTE',name,detail,'Renueva en recepción: mensualidad $25.00 · 15 días $15.00.');return;
   }
   const existing=data.attendance.find(a=>a.memberId===m.id&&a.date===d);
   if(existing){
    const remain=dayPassValid?'Tu pase diario está pagado.':days===0?'Tu membresía vence hoy.':`Te quedan ${days} día(s) para renovar.`;
    showKioskMessage('ok','LLEGADA YA REGISTRADA',name,`${remain} Vencimiento: ${m.expiry?dateText(m.expiry):'Pase válido hoy'}.`);return;
   }
   const now=new Date();const time=now.toTimeString().slice(0,5);
   data.attendance.push({id:Date.now(),memberId:m.id,date:d,time,paymentType:'arrival',planPaid:dayPassValid?'Pase diario pagado':m.plan,dayPaid:false,amount:0,paid:true});
   save();render();
   const remain=dayPassValid?'Tu pase diario está pagado.':days===0?'Tu membresía vence hoy.':`Te quedan ${days} día(s) para renovar.`;
   showKioskMessage('ok','¡LLEGADA REGISTRADA!',name,`${remain} ${m.expiry?`Vencimiento: ${dateText(m.expiry)}.`:'Pase válido únicamente hoy.'}`,'Gracias por entrenar en BODYCORE GYM.');
   kioskCode.value='';
  });
 }
})();

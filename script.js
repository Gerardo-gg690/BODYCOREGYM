const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const today = new Date(); today.setHours(0,0,0,0);
const iso = d => {const x=new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`};
const addDays = n => {const d=new Date(today);d.setDate(d.getDate()+n);return iso(d)};
const money = n => '$'+Number(n||0).toFixed(2);
const dateText = s => s ? new Date(s+'T00:00:00').toLocaleDateString('es-SV',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const seed = {
  members:[
    {id:1,name:'Carlos Martínez',phone:'7001-2345',code:'0125',plan:'Mensual',start:addDays(-18),expiry:addDays(12),lastPayment:addDays(-18),amount:25},
    {id:2,name:'Andrea López',phone:'7123-4567',code:'0126',plan:'Mensual',start:addDays(-27),expiry:addDays(3),lastPayment:addDays(-27),amount:25},
    {id:3,name:'José Hernández',phone:'7654-3210',code:'0127',plan:'Mensual',start:addDays(-35),expiry:addDays(-5),lastPayment:addDays(-35),amount:25},
    {id:4,name:'María Fernanda Ruiz',phone:'7012-8899',code:'0128',plan:'Quincenal',start:addDays(-6),expiry:addDays(9),lastPayment:addDays(-6),amount:15},
    {id:5,name:'Daniel Rivera',phone:'7890-1234',code:'0129',plan:'Mensual',start:addDays(-2),expiry:addDays(28),lastPayment:addDays(-2),amount:25},
    {id:6,name:'Sofía Castro',phone:'7456-9876',code:'0130',plan:'Mensual',start:addDays(-33),expiry:addDays(-2),lastPayment:addDays(-33),amount:25}
  ],
  products:[
    {id:1,name:'Agua embotellada',category:'Bebidas',price:1.00,stock:24},
    {id:2,name:'Bebida hidratante',category:'Bebidas',price:1.75,stock:12},
    {id:3,name:'Barra de proteína',category:'Snacks',price:2.50,stock:8},
    {id:4,name:'Toalla deportiva',category:'Accesorios',price:5.00,stock:4}
  ],
  payments:[
    {id:1,memberId:1,amount:25,date:addDays(-18)},
    {id:2,memberId:2,amount:25,date:addDays(-27)},
    {id:3,memberId:3,amount:25,date:addDays(-35)},
    {id:4,memberId:4,amount:15,date:addDays(-6)},
    {id:5,memberId:5,amount:25,date:addDays(-2)}
  ],
  sales:[]
};
let data;
try { data=JSON.parse(localStorage.getItem('bodycore_demo_data')) || structuredClone(seed); } catch(e) { data=JSON.parse(JSON.stringify(seed)); }
function save(){localStorage.setItem('bodycore_demo_data',JSON.stringify(data));}
function daysLeft(expiry){return Math.ceil((new Date(expiry+'T00:00:00')-today)/86400000)}
function stateOf(m){if(!m.monthPaid)return 'expired';const n=daysLeft(m.expiry);return n<0?'expired':n<=3?'soon':'active'}
function statusBadge(m){const s=stateOf(m);return `<span class="status ${s}">${s==='active'?'Activa':s==='soon'?'Por vencer':'Vencida'}</span>`}
function initials(name){return name.split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase()}
function render(){
  const active=data.members.filter(m=>stateOf(m)==='active').length;
  const soon=data.members.filter(m=>stateOf(m)==='soon').length;
  const expired=data.members.filter(m=>stateOf(m)==='expired').length;
  const revenue=data.payments.reduce((a,p)=>a+Number(p.amount),0);
  $('#statMembers').textContent=data.members.length;$('#statActive').textContent=active;$('#statSoon').textContent=soon;$('#statRevenue').textContent=money(revenue);
  $('#navMembers').textContent=data.members.length;$('#alertTotal').textContent=soon+expired;
  const attention=data.members.filter(m=>stateOf(m)!=='active').sort((a,b)=>a.expiry.localeCompare(b.expiry));
  $('#attentionList').innerHTML=attention.length?attention.slice(0,5).map(m=>`<div class="attention-item"><div class="mini-avatar">${initials(m.name)}</div><div class="attention-info"><b>${m.name}</b><small>${m.code}</small></div><span class="attention-days ${stateOf(m)==='expired'?'expired':''}">${stateOf(m)==='expired'?'Vencida':daysLeft(m.expiry)+' días'}</span></div>`).join(''):'<div class="empty-note">No hay membresías que requieran atención.</div>';
  $('#recentMembers').innerHTML=[...data.members].slice(-5).reverse().map(m=>`<tr><td><div class="person-cell"><div class="mini-avatar">${initials(m.name)}</div><b>${m.name}</b></div></td><td>${m.code}</td><td>${m.plan}</td><td>${dateText(m.expiry)}</td><td>${statusBadge(m)}</td></tr>`).join('');
  renderMembers();renderPayments();renderInventory();
}
function renderMembers(){
  const q=($('#memberSearch')?.value||'').toLowerCase(),filter=$('#memberFilter')?.value||'all';
  const list=data.members.filter(m=>(m.name.toLowerCase().includes(q)||m.code.toLowerCase().includes(q))&&(filter==='all'||stateOf(m)===filter));
  $('#membersTable').innerHTML=list.map(m=>`<tr><td><div class="person-cell"><div class="mini-avatar">${initials(m.name)}</div><div><b>${m.name}</b><small>Cliente BODYCORE</small></div></div></td><td><b>${m.code}</b></td><td>${m.phone||'—'}</td><td>${m.plan}</td><td>${dateText(m.expiry)}</td><td>${statusBadge(m)}</td><td><button class="action-btn" data-remind="${m.id}">WhatsApp</button></td></tr>`).join('')||'<tr><td colspan="7">No se encontraron clientes.</td></tr>';
  $('#memberCount').textContent=`Mostrando ${list.length} de ${data.members.length} clientes`;
}
function renderPayments(){
  const expired=data.members.filter(m=>stateOf(m)==='expired').length,soon=data.members.filter(m=>stateOf(m)==='soon').length;
  $('#payExpired').textContent=expired;$('#paySoon').textContent=soon;$('#payRevenue').textContent=money(data.payments.reduce((a,p)=>a+Number(p.amount),0));
  $('#paymentsTable').innerHTML=data.members.map(m=>`<tr><td><div class="person-cell"><div class="mini-avatar">${initials(m.name)}</div><b>${m.name}</b></div></td><td>${m.code}</td><td>${m.plan}</td><td>${dateText(m.lastPayment)}</td><td>${dateText(m.expiry)}</td><td>${statusBadge(m)}</td><td><button class="action-btn" data-pay="${m.id}">Renovar</button></td></tr>`).join('');
}
function renderInventory(){
  $('#productCount').textContent=data.products.length;$('#stockCount').textContent=data.products.reduce((a,p)=>a+Number(p.stock),0);
  $('#salesTotal').textContent=money(data.sales.reduce((a,s)=>a+s.total,0));
  $('#inventoryTable').innerHTML=data.products.map(p=>`<tr><td><div class="person-cell"><div class="mini-avatar">▤</div><b>${p.name}</b></div></td><td>${p.category||'General'}</td><td>${money(p.price)}</td><td>${p.stock}</td><td><span class="${p.stock<=5?'low-stock':'normal-stock'}">${p.stock<=5?'Stock bajo':'Disponible'}</span></td><td><button class="sale-btn" data-sale="${p.id}" ${p.stock<1?'disabled':''}>＋ Vender</button></td></tr>`).join('');
}
function showAccess(code,target){
  const m=data.members.find(x=>x.code.toLowerCase()===code.trim().toLowerCase());
  if(!m){target.innerHTML=`<div class="result-card denied"><div class="result-mark">×</div><div><b>CLIENTE NO ENCONTRADO</b><small>Verifica el código ingresado e intenta nuevamente.</small></div></div>`;return}
  const s=stateOf(m),ok=s==='active',detail=ok?`Le quedan ${daysLeft(m.expiry)} días de membresía.`:s==='soon'?`Su membresía vence en ${daysLeft(m.expiry)} día(s).`:`Su membresía venció el ${dateText(m.expiry)}.`;
  target.innerHTML=`<div class="result-card ${ok?'allowed':'denied'}"><div class="result-mark">${ok?'✓':'×'}</div><div><b>${ok?'ACCESO PERMITIDO':s==='soon'?'MEMBRESÍA POR VENCER':'ACCESO NO AUTORIZADO'}</b><small>${m.name} · ${m.code} · ${detail}</small></div></div>`;
}
function openModal(id){$('#'+id).classList.add('open')}
function closeModal(id){$('#'+id).classList.remove('open')}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2600)}
function go(page){$$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));$$('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.page===page));const names={dashboard:'Panel general',members:'Clientes',access:'Control de acceso',payments:'Pagos y membresías',inventory:'Inventario y ventas'};$('#breadcrumbPage').textContent=names[page];$('#sidebar').classList.remove('open');}
$$('.nav-link').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
$('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#todayLabel').textContent=new Date().toLocaleDateString('es-SV',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});
$('#quickAccessForm').addEventListener('submit',e=>{e.preventDefault();showAccess($('#quickCode').value,$('#quickAccessResult'));});
$('#accessForm').addEventListener('submit',e=>{e.preventDefault();showAccess($('#accessCode').value,$('#accessResult'));});
$('#memberSearch').addEventListener('input',renderMembers);$('#memberFilter').addEventListener('change',renderMembers);
$('#openMemberModal').addEventListener('click',()=>{const f=$('#memberForm');f.reset();f.elements.start.value=iso(today);f.elements.expiry.value=addDays(30);openModal('memberModal')});
$('#memberForm').addEventListener('submit',e=>{
 e.preventDefault();const f=e.currentTarget,fd=new FormData(f),id=Math.max(0,...data.members.map(m=>m.id))+1;
 const usedCodes=new Set(data.members.map(x=>String(x.code).replace(/\D/g,'')));let nextCode=1;while(usedCodes.has(String(nextCode).padStart(4,'0'))&&nextCode<=9999)nextCode++;if(nextCode>9999){toast('Se agotaron los códigos disponibles de 4 dígitos.');return;}const code=String(nextCode).padStart(4,'0');const m={id,name:fd.get('name').trim(),phone:fd.get('phone').trim(),code,plan:fd.get('plan'),start:fd.get('start'),expiry:fd.get('expiry'),lastPayment:Number(fd.get('amount')||0)>0&&fd.get('plan')!=='Day pass'?fd.get('start'):'',amount:Number(fd.get('amount')||0),monthPaid:Number(fd.get('amount')||0)>0&&fd.get('plan')!=='Day pass',dayPaid:fd.get('plan')==='Day pass'&&Number(fd.get('amount')||0)>0};
 data.members.push(m);if(m.amount>0)data.payments.push({id:Date.now(),memberId:id,amount:m.amount,date:m.start,type:m.plan});save();render();closeModal('memberModal');toast(`Cliente registrado. Código asignado: ${code}`);
});
$('#openPaymentModal').addEventListener('click',()=>{const sel=$('#paymentMember');sel.innerHTML=data.members.map(m=>`<option value="${m.id}">${m.name} · ${m.code}</option>`).join('');$('#paymentForm').reset();$('#paymentForm').elements.expiry.value=addDays(30);openModal('paymentModal')});
$('#paymentForm').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget,fd=new FormData(f),m=data.members.find(x=>x.id===Number(fd.get('member')));if(!m)return;const amount=Number(fd.get('amount'));if(!Number.isFinite(amount)||amount<=0){toast('Ingresa un monto mayor que cero.');return;}m.expiry=fd.get('expiry');m.lastPayment=iso(today);m.monthPaid=true;m.dayPaid=false;data.payments.push({id:Date.now(),memberId:m.id,amount,date:iso(today),type:m.plan});save();render();closeModal('paymentModal');toast('Pago registrado y membresía actualizada.')});
$('#openProductModal').addEventListener('click',()=>{ $('#productForm').reset();openModal('productModal')});
$('#productForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);data.products.push({id:Math.max(0,...data.products.map(p=>p.id))+1,name:fd.get('name').trim(),category:fd.get('category').trim(),price:Number(fd.get('price')),stock:Number(fd.get('stock'))});save();render();closeModal('productModal');toast('Producto agregado al inventario.')});
document.addEventListener('click',e=>{
 const close=e.target.closest('[data-close]');if(close)closeModal(close.dataset.close);
 const remind=e.target.closest('[data-remind]');if(remind){const m=data.members.find(x=>x.id===Number(remind.dataset.remind));const msg=encodeURIComponent(`Hola ${m.name}, te recordamos que tu membresía de BODYCORE GYM ${stateOf(m)==='expired'?'ha vencido':'está próxima a vencer'}. ¡Te esperamos!`);window.open(`https://wa.me/503${(m.phone||'').replace(/\D/g,'')}?text=${msg}`,'_blank');}
 const pay=e.target.closest('[data-pay]');if(pay){const m=data.members.find(x=>x.id===Number(pay.dataset.pay));$('#paymentMember').innerHTML=`<option value="${m.id}">${m.name} · ${m.code}</option>`;$('#paymentForm').reset();$('#paymentForm').elements.member.value=m.id;$('#paymentForm').elements.amount.value=m.amount||25;$('#paymentForm').elements.expiry.value=addDays(30);openModal('paymentModal');}
});
$$('.modal-backdrop').forEach(b=>b.addEventListener('click',e=>{if(e.target===b)closeModal(b.id)}));
render();
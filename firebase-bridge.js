/* BODYCORE GYM: autenticación y respaldo en Firestore (Firebase compat SDK). */
(() => {
 const cfg=window.BODYCORE_FIREBASE_CONFIG||{};
 const ready=cfg.apiKey&&!cfg.apiKey.startsWith('REEMPLAZAR')&&window.BODYCORE_ADMIN_UID&&!window.BODYCORE_ADMIN_UID.startsWith('REEMPLAZAR');
 const panel=document.createElement('div');panel.id='firebaseLogin';
 panel.style.cssText='position:fixed;inset:0;z-index:999999;background:#090c12;display:flex;align-items:center;justify-content:center;color:white;font:15px system-ui;padding:20px';
 panel.innerHTML=`<form id="firebaseLoginForm" style="background:#171c25;border:1px solid #344051;border-radius:14px;padding:28px;width:min(420px,95vw);display:grid;gap:14px"><h2 style="margin:0">BODYCORE GYM · Firebase</h2><p id="firebaseStatus" style="margin:0;color:#aebbd0">${ready?'Inicia sesión para acceder a los datos del gimnasio.':'Configura firebase-config.js antes de usar la versión en línea.'}</p><input id="firebaseEmail" type="email" placeholder="Correo del administrador" required style="padding:12px"><input id="firebasePassword" type="password" placeholder="Contraseña" required style="padding:12px"><button style="padding:12px;background:#dc3545;border:0;border-radius:8px;color:white;cursor:pointer" ${ready?'':'disabled'}>Ingresar</button></form>`;
 document.body.appendChild(panel);
 if(!ready)return;
 firebase.initializeApp(cfg);
 const auth=firebase.auth(),db=firebase.firestore(),status=panel.querySelector('#firebaseStatus');
 const key='bodycore_demo_data';let loaded=false, queue=Promise.resolve(), snapshot=null;
 function inform(msg){status.textContent=msg;}
 function persist(){
   if(!loaded||!auth.currentUser)return;
   let copy;try{copy=JSON.parse(localStorage.getItem(key)||'null');}catch(_){return;}
   if(!copy)return;
   queue=queue.then(()=>db.collection('gyms').doc(auth.currentUser.uid).set({data:copy,updatedAt:firebase.firestore.FieldValue.serverTimestamp()})).catch(e=>{console.error('Firebase: error guardando',e);alert('No se pudo guardar en la nube. Revisa tu conexión. Los datos permanecen en este navegador.');});
 }
 // El guardado local existente continúa funcionando; también se sincroniza con Firestore.
 const originalSet=Storage.prototype.setItem;
 Storage.prototype.setItem=function(k,v){originalSet.call(this,k,v);if(this===localStorage&&k===key)persist();};
 auth.onAuthStateChanged(async user=>{
   loaded=false;
   if(!user){panel.style.display='flex';return;}
   if(user.uid!==window.BODYCORE_ADMIN_UID){await auth.signOut();inform('Este usuario no está autorizado.');return;}
   inform('Cargando información de Firebase...');
   try{
     const doc=await db.collection('gyms').doc(user.uid).get();
     if(doc.exists&&doc.data().data){snapshot=doc.data().data;originalSet.call(localStorage,key,JSON.stringify(snapshot));}
     else { // primera migración: no subir datos de prueba automáticamente
       const current=localStorage.getItem(key);
       if(current&&confirm('No hay datos en Firebase. ¿Deseas importar los datos guardados en ESTE navegador? Verifica que sean los reales y no los de demostración.')){
         snapshot=JSON.parse(current);
         await db.collection('gyms').doc(user.uid).set({data:snapshot,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
       }else{snapshot={members:[],products:[],payments:[],sales:[],attendance:[]};originalSet.call(localStorage,key,JSON.stringify(snapshot));}
     }
     loaded=true;panel.style.display='none';
     if(typeof data!=='undefined'){data=JSON.parse(JSON.stringify(snapshot));if(typeof render==='function')render();}
     window.dispatchEvent(new Event('bodycore-firebase-loaded'));
   }catch(e){console.error(e);inform('No se pudo cargar Firebase: '+e.message);panel.style.display='flex';}
 });
 panel.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();inform('Verificando...');try{await auth.signInWithEmailAndPassword(panel.querySelector('#firebaseEmail').value,panel.querySelector('#firebasePassword').value);}catch(err){inform('Error al ingresar: '+err.message);}});
 window.bodycoreFirebase={logout:()=>auth.signOut(),save:persist,refresh:async()=>{const d=await db.collection('gyms').doc(auth.currentUser.uid).get();if(d.exists){originalSet.call(localStorage,key,JSON.stringify(d.data().data));if(typeof data!=='undefined'){data=d.data().data;render();}}}};
})();

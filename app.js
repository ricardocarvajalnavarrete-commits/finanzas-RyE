console.log('👛 Billetera v8 — completa');
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=n=>'$'+Math.round(Number(n)||0).toLocaleString('es-CL');
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const dstr=d=>{if(!d)return '—';const[y,m,dd]=String(d).split('-');return `${dd}-${m}-${y}`;};
const days=(a,b)=>Math.round((new Date(b+'T12:00')-new Date(a+'T12:00'))/86400000);
const addMonth=(d,n=1)=>{const t=new Date(d+'T12:00');t.setMonth(t.getMonth()+n);return t.toISOString().slice(0,10);};
const mkey=d=>String(d).slice(0,7);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inp=(id,label,val='',type='text',extra='')=>`<label class="fld"><span>${label}</span><input id="${id}" type="${type}" value="${esc(val)}" ${extra}></label>`;
const sel=(id,label,opts,val='')=>`<label class="fld"><span>${label}</span><select id="${id}">${opts.map(([v,l])=>`<option value="${esc(v)}" ${String(v)===String(val)?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`;
const fmtK=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?Math.round(n/1e3)+'k':Math.round(n);
const normKey=k=>String(k).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
function seed(){
 const A=(id,tipo,nombre)=>({id,tipo,nombre});
 return {
updatedAt:Date.now(), auth:null, fb:{config:'',activo:false}, esSeed:true,
  ajustes:{diasAviso:5},
  personas:['Ricardo','Elías'],
  categorias:['Alimentación','Transporte','Salud','Educación','Hogar y servicios','Entretención','Vestuario','Deudas','Ahorro','Otros'],
  acreedores:[A('a1','financiera','Banco Falabella'),A('a2','financiera','BancoEstado'),A('a14','financiera','Banco Itaú'),A('a15','financiera','Scotiabank'),A('a16','financiera','Banco Santander'),A('a17','financiera','Banco BCI'),A('a18','financiera','Banco Bice'),A('a19','financiera','Banco Ripley'),A('a20','financiera','Banco Consorcio'),A('a3','empresa','La Polar'),A('a4','empresa','ABC Din'),A('a5','empresa','Líder Servicios Financieros'),A('a6','empresa','SalcoBrand'),A('a7','empresa','Unimarc'),A('a8','empresa','Hites'),A('a9','empresa','Mercado Pago'),A('a10','empresa','Enel'),A('a11','empresa','Aguas Andinas'),A('a12','empresa','Entel'),A('a13','empresa','MetroMuv'),A('a21','empresa','Tenpo'),A('a22','empresa','Copec Pay'),A('a23','empresa','Global 66'),A('a24','empresa','Prex'),A('a25','empresa','Tapp Caja Los Andes'),A('a26','empresa','Coopeuch'),A('a27','empresa','Prepago Los Héroes'),A('a28','empresa','GGCC Edificio'),A('a29','empresa','YouTube'),A('a30','empresa','Microsoft'),A('a31','empresa','Google'),A('a32','empresa','Zapping TV')],
  deudas:[],pagos:[],cuentas:[],tarjetas:[],ingresos:[],gastos:[],
  presupuestos:[{categoria:'Alimentación',limite:450000},{categoria:'Transporte',limite:150000},{categoria:'Hogar y servicios',limite:550000},{categoria:'Entretención',limite:80000},{categoria:'Salud',limite:100000}],
  metas:[]
 };
}
const LS='billetera_familiar_v1';
let db=null, curView='dashboard', unlocked=false, showNums=false, deudaFilter='todas', deudaVerArch=false, pagoVerArch=false;
let _auto=false, syncDecidido=false;
let cfTit='todos',cfBan='todos',tfTit='todos',tfEnt='todos';
function load(){try{const s=localStorage.getItem(LS);return s?JSON.parse(s):null;}catch(e){return null;}}
function save(){db.updatedAt=Date.now();if(!_auto)db.esSeed=false;localStorage.setItem(LS,JSON.stringify(db));guardarBackup();pushFB();}
function dbValida(d){return !!(d&&Array.isArray(d.deudas)&&Array.isArray(d.pagos)&&Array.isArray(d.cuentas)&&Array.isArray(d.acreedores)&&Array.isArray(d.gastos));}
function completarDB(d){d.ajustes=d.ajustes||{diasAviso:5};d.fb=d.fb||{config:'',activo:false};d.personas=d.personas||['Ricardo','Elías'];d.categorias=d.categorias||[];d.tarjetas=d.tarjetas||[];d.ingresos=d.ingresos||[];d.presupuestos=d.presupuestos||[];d.metas=d.metas||[];return d;}
function init(){
 let d=load();
 if(!dbValida(d)){try{const b=JSON.parse(localStorage.getItem(LS_BACKUP)||'null');if(b&&dbValida(b.db))d=b.db;}catch(e){}}
 if(!dbValida(d)){localStorage.removeItem(LS);d=null;}
 db=completarDB(d||seed());
 localStorage.setItem(LS,JSON.stringify(db));guardarBackup();evaluarDeudas();
}
const debtById=id=>db.deudas.find(d=>d.id===id);
const acById=id=>db.acreedores.find(a=>a.id===id);
const minPago=d=>(d.tienePagoMinimo&&Number(d.pagoMinimo)>0)?Number(d.pagoMinimo):(Number(d.montoFacturadoMes)||0);
function abonosCiclo(d){if(d.sinVencimiento||!d.vencimiento)return d.abonadoTotal||0;const desde=addMonth(d.vencimiento,-1);return db.pagos.filter(p=>p.deudaId===d.id&&p.fecha>=desde).reduce((s,p)=>s+(Number(p.monto)||0),0);}
function cicloRestante(d){if(d.sinVencimiento)return Math.max(0,(Number(d.montoTotal)||0)-(d.abonadoTotal||0));return Math.max(0,minPago(d)-abonosCiclo(d));}
function saldoFacturado(d){return Math.max(0,(Number(d.montoFacturadoMes)||0)-abonosCiclo(d));}
function saldoTotalPendiente(d){const pagado=db.pagos.filter(p=>p.deudaId===d.id).reduce((s,p)=>s+(Number(p.monto)||0),0);return Math.max(0,(Number(d.montoTotal)||0)-pagado);}
function diasMora(d){return (d.estado==='morosa'&&d.vencimiento)?Math.max(0,days(d.vencimiento,today())):null;}
function moraChip(d){const n=diasMora(d);if(n===null)return '';const cls=n<30?'mora-y':n<60?'mora-o':'mora-r';return `<span class="mora ${cls}">⏱ ${n} día${n===1?'':'s'} de mora</span>`;}
function evaluarDeudas(){let cambio=false;for(const d of db.deudas){if(d.estado==='pagada'||d.sinVencimiento||!d.vencimiento)continue;const vencido=d.vencimiento<today();if(vencido&&abonosCiclo(d)<minPago(d)&&d.estado!=='morosa'){d.estado='morosa';cambio=true;}else if(!vencido&&d.estado==='morosa'){d.estado='vigente';cambio=true;}}if(cambio){_auto=true;save();_auto=false;}}
function attachCompPago(p,file){docPut(p.id+'_comp',file);p.compPdf=true;if(fb.user&&fb.loaded){compUpload(p.id,file).then(path=>{p.compPath=path;save();toast('☁️ Comprobante subido a la nube');}).catch(()=>{p.compPath=null;save();toast('📱 Comprobante en este equipo');});}else toast('📱 Comprobante en este equipo');}
async function removeCompPago(p){if(p.compPath)await compDelete(p.compPath);await docDel(p.id+'_comp');p.compPath=null;p.compPdf=false;save();}
async function migrarComprobantes(){let cambio=false;for(const d of db.deudas){if(!(d.compPdf||d.compPath))continue;const ps=db.pagos.filter(p=>p.deudaId===d.id).sort((a,b)=>a.fecha<b.fecha?1:-1);if(!ps.length)continue;const p=ps[0];const blob=await docGet(d.id+'_comp');if(blob){await docPut(p.id+'_comp',blob);await docDel(d.id+'_comp');}p.compPdf=true;if(d.compPath&&!p.compPath)p.compPath=d.compPath;d.compPdf=false;d.compPath=null;cambio=true;}if(cambio){_auto=true;save();_auto=false;}}
function registrarPago(id,fecha,monto,nota,extraMode,file){
 const d=debtById(id);if(!d)return;
 monto=Math.round(Number(monto));
 const min=d.sinVencimiento?cicloRestante(d):minPago(d);
 const fact=Number(d.montoFacturadoMes)||0;
 const excesoFact=(fact>0&&monto>fact)?monto-fact:0;
 const excesoNoDescontado=extraMode==='gastos'?excesoFact:0;
 const montoDescontado=Math.max(0,monto-excesoNoDescontado);
 let tipo;
 if(excesoFact>0&&extraMode==='gastos')tipo='PAGO FACTURADO + GASTOS/INTERESES';
 else if(excesoFact>0&&extraMode==='abono')tipo='PAGO FACTURADO + ABONO';
 else if(monto<min)tipo='ABONO';
 else if(fact>0&&monto>=fact)tipo='PAGO FACTURADO';
 else if(monto>min)tipo='PAGO SUPERIOR AL PAGO MINIMO E INFERIOR AL PAGO MENSUAL';
 else tipo='PAGO MINIMO';
 const p={id:uid(),deudaId:d.id,deuda:d.nombre,persona:d.persona,fecha,monto,tipo,nota:nota||'',montoDescontado,excesoNoDescontado,extraMode:extraMode||'',compPdf:false,compPath:null,archivado:false};
 db.pagos.unshift(p);
 d.pagadoHistorico=(d.pagadoHistorico||0)+montoDescontado;
 d.saldoTotal=Math.max(0,(d.saldoTotal??d.montoTotal)-montoDescontado);
 if(tipo==='ABONO'){
  if(d.sinVencimiento){d.abonadoTotal=(d.abonadoTotal||0)+montoDescontado;}
  else{d.estado=(d.vencimiento&&d.vencimiento<today()&&abonosCiclo(d)<minPago(d))?'morosa':'vigente';}
 }else{d.estado='pagada';d.fechaPago=fecha;}
 save();
 if(file)attachCompPago(p,file);
 render();
 if(excesoNoDescontado>0)toast('✅ Pago registrado. Exceso no descontado: '+fmt(excesoNoDescontado));
 else tipo==='ABONO'?toast('🧾 Abono registrado'):toast('✅ Pago registrado: '+tipo);
}

function confirmarPago(id,fecha,monto,nota,file){
 const d=debtById(id);
 const min=d.sinVencimiento?cicloRestante(d):minPago(d);
 const fact=Number(d.montoFacturadoMes)||0;

 if(fact>0&&Number(monto)>fact){
  const exceso=Number(monto)-fact;
  openModal('⚠️ Pago superior al monto facturado',`
   <p>Ingresaste un pago de <b>${fmt(monto)}</b>.</p>
   <p>El monto facturado es <b>${fmt(fact)}</b>, por lo tanto hay una diferencia de <b>${fmt(exceso)}</b>.</p>
   <p>¿Cómo quieres tratar esa diferencia?</p>
   <div class="card" style="background:#f8fafc">
    <p><b>1) Intereses, cobranza u otros gastos</b><br><span class="mut">La diferencia NO se descontará del total de la deuda.</span></p>
    <p><b>2) Abono superior al facturado</b><br><span class="mut">La diferencia SÍ se descontará del total de la deuda.</span></p>
   </div>
   <div class="frm-btns">
    <button class="btn warn" id="op-gastos">Gastos / intereses</button>
    <button class="btn pri" id="op-abono">Abono a deuda</button>
    <button class="btn" data-act="close-modal">Cancelar</button>
   </div>
  `);
  $('#op-gastos').onclick=()=>{closeModal();registrarPago(id,fecha,monto,nota,'gastos',file);};
  $('#op-abono').onclick=()=>{closeModal();registrarPago(id,fecha,monto,nota,'abono',file);};
  return;
 }

 if(Number(monto)<min){
  showAlert(
   '⚠️ El pago se considerará un ABONO',
   `El monto ingresado (${fmt(monto)}) es inferior al pago mínimo (${fmt(min)}). Este pago se registrará como un <b>abono a la deuda</b>.`,
   ()=>registrarPago(id,fecha,monto,nota,file)
  );
 }else registrarPago(id,fecha,monto,nota,file);
}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.add('hidden'),2600);}
function openModal(title,body){$('#modal-root').innerHTML=`<div class="modal-back" id="mb"><div class="modal"><div class="row between"><h3>${title}</h3><button class="btn icon" data-act="close-modal">✕</button></div>${body}</div></div>`;$('#mb').addEventListener('click',e=>{if(e.target.id==='mb')closeModal();});}
function closeModal(){$('#modal-root').innerHTML='';}
function showAlert(title,msg,onOk){openModal(title,`<p>${msg}</p><div class="frm-btns"><button class="btn pri" id="al-ok">OK</button></div>`);$('#al-ok').onclick=()=>{closeModal();onOk&&onOk();};}
function confirmDlg(title,msg,onYes){openModal(title,`<p>${msg}</p><div class="frm-btns"><button class="btn warn" id="cf-yes">Sí, continuar</button><button class="btn" data-act="close-modal">Cancelar</button></div>`);$('#cf-yes').onclick=()=>{closeModal();onYes();};}
const VIEWS=[['dashboard','🏠','Inicio'],['deudas','💳','Deudas'],['pagos','🧾','Pagos'],['acreedores','🏦','Acreedores'],['cuentas','🏛️','Cuentas'],['presupuesto','📊','Presupuesto'],['gastos','🛒','Gastos e Ingresos'],['metas','🎯','Metas'],['historico','📈','Histórico'],['archivo','📦','Archivo'],['ajustes','⚙️','Ajustes']];
function toggleCalc(){
 let p=$('#calc-float');
 if(p){p.remove();return;}
 const nums=['7','8','9','/','4','5','6','*','1','2','3','-','0','.','%','+','(',')','C','='];
 p=document.createElement('div');
 p.id='calc-float';
 p.style.cssText='position:fixed;right:14px;bottom:14px;width:270px;background:#fff;border:1px solid #cbd5e1;border-radius:16px;box-shadow:0 16px 40px #0003;z-index:999999;padding:12px;font-family:system-ui';
 p.innerHTML=`<div id="calc-head" style="cursor:move;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b>🧮 Calculadora</b><button class="btn mini" id="calc-x">✕</button></div>
 <input id="calc-d" readonly style="width:100%;box-sizing:border-box;font-size:22px;text-align:right;padding:10px;border:1px solid #cbd5e1;border-radius:10px;margin-bottom:8px" value="">
 <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${nums.map(k=>`<button class="btn" data-k="${k}">${k}</button>`).join('')}</div>`;
 document.body.appendChild(p);
 $('#calc-x').onclick=()=>p.remove();
 p.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{
  const d=$('#calc-d'),k=b.dataset.k;
  if(k==='C'){d.value='';return;}
  if(k==='='){
   try{
    const expr=d.value;
    if(!/^[0-9+\-*/().% ]+$/.test(expr))throw new Error('bad');
    d.value=String(Function('return ('+expr+')')());
   }catch(e){d.value='Error';}
   return;
  }
  if(d.value==='Error')d.value='';
  d.value+=k;
 });
 let ox=0,oy=0,drag=false;
 $('#calc-head').onmousedown=e=>{drag=true;ox=e.clientX-p.offsetLeft;oy=e.clientY-p.offsetTop;};
 document.onmousemove=e=>{if(!drag)return;p.style.left=(e.clientX-ox)+'px';p.style.top=(e.clientY-oy)+'px';p.style.right='auto';p.style.bottom='auto';};
 document.onmouseup=()=>drag=false;
}
function renderNav(){$('#mainnav').innerHTML=VIEWS.map(([v,i,l])=>`<button class="nbtn ${v===curView?'on':''}" data-act="nav" data-id="${v}">${i} ${l}</button>`).join('')+`<button class="nbtn" data-act="calc">🧮 Calculadora</button>`;}
function go(v){curView=v;renderNav();$$('.view').forEach(s=>s.classList.toggle('hidden',s.id!=='view-'+v));render();window.scrollTo({top:0});}
function render(){evaluarDeudas();({dashboard:renderDashboard,deudas:renderDeudas,pagos:renderPagos,acreedores:renderAcreedores,cuentas:renderCuentas,presupuesto:renderPresupuesto,gastos:renderGastos,metas:renderMetas,historico:renderHistorico,archivo:renderArchivo,ajustes:renderAjustes}[curView]||(()=>{}))();}
/* ===FIN PARTE 1=== */
/* ============================== SEGURIDAD ============================== */
const LS_BACKUP='billetera_backup_auto';
function guardarBackup(){try{localStorage.setItem(LS_BACKUP,JSON.stringify({fecha:Date.now(),db:db}));}catch(e){}}
window.addEventListener('error',e=>{
 if(document.getElementById('err-fatal'))return;
 const d=document.createElement('div');d.id='err-fatal';
 d.style.cssText='position:fixed;inset:0;background:#0f172a;color:#f8fafc;z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,sans-serif;text-align:center';
 d.innerHTML='<div style="max-width:560px"><h2 style="font-size:22px;margin:0 0 10px">⚠️ La app encontró un error</h2><p style="opacity:.85;margin:0 0 6px">'+String(e.message||'Error')+' (línea '+(e.lineno||'?')+')</p><p style="opacity:.85;margin:0 0 16px">Tus datos están protegidos por la copia automática.</p><button id="ef-fix" style="background:#16a34a;color:#fff;border:0;border-radius:10px;padding:12px 18px;margin:4px">🔧 Reparar y recargar</button><button id="ef-reload" style="background:#334155;color:#fff;border:0;border-radius:10px;padding:12px 18px;margin:4px">🔄 Solo recargar</button></div>';
 document.body.appendChild(d);
 const f=document.getElementById('ef-fix');if(f)f.onclick=()=>{try{const b=JSON.parse(localStorage.getItem('billetera_backup_auto')||'null');if(b&&b.db)localStorage.setItem('billetera_familiar_v1',JSON.stringify(b.db));}catch(err){}location.reload();};
 const r=document.getElementById('ef-reload');if(r)r.onclick=()=>location.reload();
});
/* ============================== DOCS PDF ============================== */
function idbOpen(){return new Promise((res,rej)=>{const r=indexedDB.open('billetera_docs',1);r.onupgradeneeded=e=>{e.target.result.createObjectStore('docs');};r.onsuccess=e=>res(e.target.result);r.onerror=e=>rej(e);});}
async function docPut(id,blob){const d=await idbOpen();return new Promise((res,rej)=>{const t=d.transaction('docs','readwrite');t.objectStore('docs').put(blob,id);t.oncomplete=res;t.onerror=rej;});}
async function docGet(id){const d=await idbOpen();return new Promise((res,rej)=>{const t=d.transaction('docs','readonly');const q=t.objectStore('docs').get(id);q.onsuccess=()=>res(q.result||null);q.onerror=rej;});}
async function docDel(id){const d=await idbOpen();return new Promise((res,rej)=>{const t=d.transaction('docs','readwrite');t.objectStore('docs').delete(id);t.oncomplete=res;t.onerror=rej;});}
async function stMod(){return await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js');}
async function docUpload(id,file){const m=await stMod();const r=m.ref(m.getStorage(fb.app),'docs/'+fb.user.uid+'/'+id+'.pdf');await m.uploadBytes(r,file,{contentType:'application/pdf'});return r.fullPath;}
async function docUrl(path){const m=await stMod();return await m.getDownloadURL(m.ref(m.getStorage(fb.app),path));}
async function docDelete(path){try{const m=await stMod();await m.deleteObject(m.ref(m.getStorage(fb.app),path));}catch(e){}}
async function compUpload(id,file){const m=await stMod();const r=m.ref(m.getStorage(fb.app),'comprobantes/'+fb.user.uid+'/'+id+'.pdf');await m.uploadBytes(r,file,{contentType:'application/pdf'});return r.fullPath;}
async function compUrl(path){const m=await stMod();return await m.getDownloadURL(m.ref(m.getStorage(fb.app),path));}
async function compDelete(path){try{const m=await stMod();await m.deleteObject(m.ref(m.getStorage(fb.app),path));}catch(e){}}
const docIcon=on=>`<svg width="13" height="15" viewBox="0 0 13 15" style="vertical-align:-2px"><path d="M1 0h8l3 3v11a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1z" fill="${on?'#16a34a':'#9aa5b1'}"/><path d="M9 0l3 3H9z" fill="${on?'#0c6b2f':'#6b7684'}"/><rect x="2.5" y="6" width="7" height="1.2" fill="#fff" opacity=".85"/><rect x="2.5" y="8.5" width="7" height="1.2" fill="#fff" opacity=".85"/><rect x="2.5" y="11" width="5" height="1.2" fill="#fff" opacity=".85"/></svg>`;
const compIcon=on=>`<svg width="13" height="15" viewBox="0 0 13 15" style="vertical-align:-2px"><path d="M1 0h11v15l-1.8-1.2L8.4 15l-1.9-1.2L4.6 15l-1.8-1.2L1 15z" fill="${on?'#16a34a':'#9aa5b1'}"/><rect x="3" y="3.5" width="7" height="1.2" fill="#fff" opacity=".85"/><rect x="3" y="6" width="7" height="1.2" fill="#fff" opacity=".85"/><rect x="3" y="8.5" width="4.5" height="1.2" fill="#fff" opacity=".85"/></svg>`;
function openViewer(d,u,back){openModal('📄 '+esc(d.nombre),`<iframe src="${u}" style="width:100%;height:65vh;border:0;border-radius:10px;background:#fff"></iframe><div class="frm-btns"><button class="btn" id="doc-back">⬅️ Volver</button><button class="btn" data-act="close-modal">Cerrar</button></div>`);$('#doc-back').onclick=()=>(back||docModal)(d.id);}
async function docModal(id){
 const d=debtById(id);if(!d)return;
 const enNube=!!(fb.user&&fb.loaded&&d.docPath);
 const blob=enNube?null:await docGet(id);
 const tiene=enNube||!!blob;
 openModal('📄 Estado de cuenta: '+esc(d.nombre),`<p class="mut">${enNube?'☁️ En la nube (todos los equipos)':blob?'📱 Solo en este dispositivo':'⚪ Sin documento adjunto'}</p>
 <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn pri" id="doc-ver" ${tiene?'':'disabled'}>👁️ Ver</button><button class="btn" id="doc-sub">📎 ${tiene?'Reemplazar':'Subir PDF'}</button><button class="btn warn" id="doc-del" ${tiene?'':'disabled'}>🗑️ Eliminar</button><button class="btn" data-act="close-modal">Cerrar</button></div>
 <p class="mut" style="margin-top:8px">${fb.user&&fb.loaded?'☁️ Los PDF se guardan en la nube para todos tus equipos.':'⚠️ Inicia sesión en Firebase para guardar en la nube.'}</p>`);
 $('#doc-ver').onclick=async()=>{try{if(enNube){openViewer(d,await docUrl(d.docPath),docModal);}else{const b=await docGet(id);if(!b)return toast('❌ Sin documento');openViewer(d,URL.createObjectURL(b),docModal);}}catch(e){toast('❌ No se pudo abrir');}};
 $('#doc-sub').onclick=()=>{const i=document.createElement('input');i.type='file';i.accept='application/pdf,.pdf';i.onchange=async()=>{const f=i.files[0];if(!f)return;if(f.type!=='application/pdf'&&!f.name.toLowerCase().endsWith('.pdf'))return toast('⚠️ Solo PDF');await docPut(id,f);d.docPdf=true;save();if(fb.user&&fb.loaded){try{d.docPath=await docUpload(id,f);save();toast('☁️ PDF subido a la nube');}catch(e){d.docPath=null;toast('📱 PDF en este equipo');}}else toast('📱 PDF en este equipo');docModal(id);};i.click();};
 $('#doc-del').onclick=async()=>{if(d.docPath)await docDelete(d.docPath);await docDel(id);d.docPath=null;d.docPdf=false;save();toast('🗑️ Documento eliminado');docModal(id);};
}
async function compModal(pid){
 const p=db.pagos.find(x=>x.id===pid);if(!p)return;
 const enNube=!!(fb.user&&fb.loaded&&p.compPath);
 const blob=enNube?null:await docGet(pid+'_comp');
 const tiene=enNube||!!blob;
 openModal('🧾 Comprobante: '+esc(p.deuda)+' ('+dstr(p.fecha)+')',`<p class="mut">${enNube?'☁️ En la nube (todos los equipos)':blob?'📱 Solo en este dispositivo':'⚪ Sin comprobante adjunto'}</p>
 <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn pri" id="comp-ver" ${tiene?'':'disabled'}>👁️ Ver</button><button class="btn" id="comp-sub">📎 ${tiene?'Reemplazar':'Subir PDF'}</button><button class="btn warn" id="comp-del" ${tiene?'':'disabled'}>🗑️ Eliminar</button><button class="btn" data-act="close-modal">Cerrar</button></div>
 <p class="mut" style="margin-top:8px">${fb.user&&fb.loaded?'☁️ Los comprobantes se guardan en la nube.':'⚠️ Inicia sesión en Firebase para guardar en la nube.'}</p>`);
 $('#comp-ver').onclick=async()=>{try{const u=enNube?await compUrl(p.compPath):(blob?URL.createObjectURL(blob):null);if(!u)return toast('❌ Sin comprobante');openViewer({nombre:p.deuda},u,()=>compModal(pid));}catch(e){toast('❌ No se pudo abrir');}};
 $('#comp-sub').onclick=()=>{const i=document.createElement('input');i.type='file';i.accept='application/pdf,.pdf';i.onchange=async()=>{const f=i.files[0];if(!f)return;if(f.type!=='application/pdf'&&!f.name.toLowerCase().endsWith('.pdf'))return toast('⚠️ Solo PDF');if(p.compPath)await compDelete(p.compPath);await docDel(pid+'_comp');attachCompPago(p,f);save();compModal(pid);};i.click();};
 $('#comp-del').onclick=async()=>{await removeCompPago(p);toast('🗑️ Comprobante eliminado');compModal(pid);};
}
/* ============================== VISTAS ============================== */
function histData(){const map={};const add=(m,k,v)=>{(map[m]??={ing:0,gas:0});map[m][k]+=Number(v)||0;};for(const g of db.ingresos)add(mkey(g.fecha),'ing',g.monto);for(const g of db.gastos)add(mkey(g.fecha),'gas',g.monto);for(const p of db.pagos)add(mkey(p.fecha),'gas',p.monto);return map;}
function balanceActual(){const h=histData();let b=0;for(const m in h)b+=h[m].ing-h[m].gas;return b;}
function renderDashboard(){
 const deudas=db.deudas.filter(d=>!d.archivada);const activas=deudas.filter(d=>d.estado!=='pagada');const morosas=activas.filter(d=>d.estado==='morosa');
 const totalDeuda=activas.reduce((s,d)=>s+(d.saldoTotal??d.montoTotal),0);const cuotaMes=activas.reduce((s,d)=>s+(minPago(d)||0),0);
 const m=today().slice(0,7);const ingMes=db.ingresos.filter(i=>mkey(i.fecha)===m).reduce((s,i)=>s+i.monto,0);const gasMes=db.gastos.filter(g=>mkey(g.fecha)===m).reduce((s,g)=>s+g.monto,0);const pagadoMes=db.pagos.filter(p=>mkey(p.fecha)===m).reduce((s,p)=>s+p.monto,0);const saldo=balanceActual();
 const alertas=[];
 for(const d of morosas.sort((a,b)=>diasMora(b)-diasMora(a)))alertas.push(`<div class="alert-line r">🔴 <b>${esc(d.nombre)}</b> en mora: ${diasMora(d)} días</div>`);
 for(const d of activas.filter(d=>d.estado==='vigente'&&d.vencimiento)){const dd=days(today(),d.vencimiento);if(dd>=0&&dd<=(db.ajustes.diasAviso||5))alertas.push(`<div class="alert-line y">🟡 <b>${esc(d.nombre)}</b> vence en ${dd} día(s)</div>`);}
 if(!alertas.length)alertas.push('<div class="alert-line b">✨ Sin alertas pendientes.</div>');
 const agrupar=list=>{const g={};for(const d of list){const k=d.tipoDeuda||'Otro';(g[k]=g[k]||{min:0,fact:0,items:[]});g[k].min+=minPago(d);g[k].fact+=Number(d.montoFacturadoMes)||0;g[k].items.push(d);}return g;};
 const gAll=agrupar(activas);const totMin=activas.reduce((s,d)=>s+minPago(d),0);const totFact=activas.reduce((s,d)=>s+(Number(d.montoFacturadoMes)||0),0);
 const htmlCat=Object.entries(gAll).sort((a,b)=>b[1].min-a[1].min).map(([k,v])=>`<div class="list-item"><span><b>${esc(k)}</b> <span class="mut">(${v.items.length})</span></span><span class="row" style="gap:10px"><span class="mut">Mín: <b>${fmt(v.min)}</b></span><span class="mut">Fact: <b>${fmt(v.fact)}</b></span></span></div>`).join('')||'<p class="mut">Sin deudas activas.</p>';
 const porVencer=activas.filter(d=>d.vencimiento&&!d.sinVencimiento&&days(today(),d.vencimiento)>=0&&days(today(),d.vencimiento)<=7);
 const gVen=agrupar(porVencer);
 const htmlVen=Object.entries(gVen).map(([k,v])=>`<div class="card" style="margin:6px 0;background:#f8fafc"><div class="row between"><b>${esc(k)}</b><span class="row" style="gap:10px"><span class="mut">Mín: <b>${fmt(v.min)}</b></span><span class="mut">Fact: <b>${fmt(v.fact)}</b></span></span></div>${v.items.sort((a,b)=>a.vencimiento<b.vencimiento?-1:1).map(d=>`<div class="list-item"><span>📅 ${dstr(d.vencimiento)} · ${esc(d.nombre)}</span><span class="row" style="gap:10px"><span class="mut">Mín: <b>${fmt(minPago(d))}</b></span><span class="mut">Fact: <b>${fmt(Number(d.montoFacturadoMes)||0)}</b></span></span></div>`).join('')}</div>`).join('')||'<p class="mut">No hay pagos por vencer en los próximos 7 días. 🎉</p>';
 const ingList=db.ingresos.filter(i=>mkey(i.fecha)===m);
 const htmlIng=ingList.map(i=>`<div class="list-item"><span>${dstr(i.fecha)} · ${esc(i.descripcion||'')} <span class="pill-persona">${esc(i.persona)}</span></span><b>${fmt(i.monto)}</b></div>`).join('')||'<p class="mut">Sin ingresos registrados este mes.</p>';
 $('#ct-dashboard').innerHTML=`<div class="row between"><h2>🏠 Panel de control</h2><button class="btn pri" data-act="exp-excel">📊 Descargar Excel</button></div>
 <div class="grid mini">
  <div class="card kpi ${totalDeuda>0?'warn':'ok'}"><div class="lbl">Deudas activas</div><div class="val">${fmt(totalDeuda)}</div><div class="mut">${activas.length} deudas · cuota ${fmt(cuotaMes)}</div></div>
  <div class="card kpi ${morosas.length?'warn':'ok'}"><div class="lbl">En mora</div><div class="val">${morosas.length}</div></div>
  <div class="card kpi"><div class="lbl">Ingresos mes</div><div class="val">${fmt(ingMes)}</div></div>
  <div class="card kpi"><div class="lbl">Gastos mes</div><div class="val">${fmt(gasMes+pagadoMes)}</div></div>
  <div class="card kpi ${saldo>=0?'ok':'warn'}"><div class="lbl">Balance</div><div class="val">${fmt(saldo)}</div></div>
 </div>
 <div class="card"><h3>🧮 Deuda por categoría (activas)</h3>${htmlCat}<div class="list-item" style="border-top:1px solid #e2e8f0"><span><b>TOTAL</b></span><span class="row" style="gap:10px"><span>Pagos mínimos: <b>${fmt(totMin)}</b></span><span>Facturado: <b>${fmt(totFact)}</b></span></span></div></div>
 <div class="card"><h3>⏰ Pagos por vencer (próximos 7 días)</h3>${htmlVen}</div>
 <div class="card"><h3>💵 Ingresos del mes (${m})</h3>${htmlIng}<div class="list-item" style="border-top:1px solid #e2e8f0"><span><b>Total ingresos</b></span><b>${fmt(ingMes)}</b></div></div>
 <div class="card"><h3>🚨 Alertas</h3>${alertas.join('')}</div>`;
}
function selAcreedor(tipo,val){const opts=db.acreedores.filter(a=>a.tipo===tipo).map(a=>[a.id,a.nombre]);opts.push(['__new','➕ Añadir nuevo…']);return sel('f_acreedor','Acreedor',opts,val);}
function formDeuda(d={}){
 const ct=d.conTipo||'financiera';
 const ac=acById(d.acreedorId)||{};
 const estOpts=[['vigente','Vigente'],['morosa','Morosa'],['pagada','Pagada']].filter(o=>d.sinVencimiento?o[0]!=='morosa':true);
 const codHtml=ct==='empresa'?inp('f_codcli','Código de cliente / N° suministro / N° contrato',ac.codigoCliente||d.codigoCliente||''):'';
 return `<form id="frm_deuda">
 ${inp('f_nombre','Nombre',d.nombre)}
 ${sel('f_con','La deuda es con',[['financiera','Entidad financiera'],['empresa','Empresa'],['persona','Persona'],['otro','Otros']],ct)}
 ${selAcreedor(ct,d.acreedorId)}
 ${sel('f_persona','Responsable',[...db.personas.map(p=>[p,p]),['Ambos','Ambos']],d.persona||db.personas[0])}
 ${sel('f_tipo','Tipo',['Tarjeta de Crédito','Línea de Crédito','Crédito de Consumo','Servicio','Préstamo','Otro'].map(t=>[t,t]),d.tipoDeuda||'Tarjeta de Crédito')}
 <div id="codcli-wrap">${codHtml}</div>
 <div class="row2">${inp('f_total','Monto total ($)',d.montoTotal??'','number')}${inp('f_saldo','Saldo ($)',d.saldoTotal??'','number')}</div>
 ${inp('f_fact','Facturado mes ($)',d.montoFacturadoMes??'','number')}
 <div class="chk-row"><input type="checkbox" id="f_pm_chk" ${d.tienePagoMinimo?'checked':''}><span>Pago mínimo ($)</span><input type="number" id="f_pm" value="${d.pagoMinimo??''}" ${d.tienePagoMinimo?'':'disabled'}></div>
 <div class="row2">${inp('f_venc','Vencimiento',d.vencimiento||'','date',d.sinVencimiento?'disabled':'')}<label class="chk"><input type="checkbox" id="f_sinv" ${d.sinVencimiento?'checked':''}> Sin vencimiento</label></div>
 ${sel('f_estado','Estado',estOpts,d.estado||'vigente')}
 ${inp('f_notas','Notas',d.notas||'')}
 <label class="fld"><span>📄 Estado de cuenta PDF (opcional)</span><input type="file" id="f_pdf" accept="application/pdf,.pdf"></label>
 <div class="frm-btns"><button type="submit" class="btn pri">💾 Guardar</button><button type="button" class="btn" data-act="close-modal">Cancelar</button></div>
 </form>`;
}
function bindDeudaForm(orig){
 const f=$('#frm_deuda');

 const refreshCod=()=>{
  const wrap=$('#codcli-wrap');if(!wrap)return;
  if($('#f_con').value!=='empresa'){wrap.innerHTML='';return;}
  const ac=acById($('#f_acreedor').value)||{};
  wrap.innerHTML=inp('f_codcli','Código de cliente / N° suministro / N° contrato',ac.codigoCliente||'');
 };

 $('#f_con').onchange=()=>{
  const lab=$('#f_acreedor').closest('label');
  const div=document.createElement('div');
  div.innerHTML=selAcreedor($('#f_con').value,orig.acreedorId||'');
  lab.replaceWith(div.firstChild);
  $('#f_acreedor').onchange=refreshCod;
  refreshCod();
 };

 $('#f_acreedor').onchange=refreshCod;
 $('#f_pm_chk').onchange=e=>$('#f_pm').disabled=!e.target.checked;
 $('#f_sinv').onchange=e=>{$('#f_venc').disabled=e.target.checked;};

 f.onsubmit=async e=>{
  e.preventDefault();

  const v={
   nombre:$('#f_nombre').value.trim(),
   conTipo:$('#f_con').value,
   acreedorId:$('#f_acreedor').value,
   persona:$('#f_persona').value,
   tipoDeuda:$('#f_tipo').value,
   montoTotal:+$('#f_total').value||0,
   saldoTotal:+$('#f_saldo').value||(+$('#f_total').value||0),
   montoFacturadoMes:+$('#f_fact').value||0,
   tienePagoMinimo:$('#f_pm_chk').checked,
   pagoMinimo:$('#f_pm_chk').checked?(+$('#f_pm').value||null):null,
   sinVencimiento:$('#f_sinv').checked,
   vencimiento:$('#f_sinv').checked?null:($('#f_venc').value||null),
   estado:$('#f_estado').value,
   notas:$('#f_notas').value
  };

  if(!v.nombre)return toast('⚠️ Escribe un nombre');

  const codCli=$('#f_codcli')?$('#f_codcli').value.trim():'';

  if(v.acreedorId==='__new'){
   const nom=prompt('Nombre del nuevo acreedor:');
   if(!nom)return toast('⚠️ Escribe un nombre');
   const na={id:uid(),tipo:v.conTipo,nombre:nom.trim(),nota:'',codigoCliente:v.conTipo==='empresa'?codCli:''};
   db.acreedores.push(na);
   v.acreedorId=na.id;
  }else{
   const ac=acById(v.acreedorId);
   if(ac&&v.conTipo==='empresa')ac.codigoCliente=codCli;
  }

  let id=orig.id;
  if(id){Object.assign(debtById(id),v);}
  else{id=uid();db.deudas.push(Object.assign({id,pagadoHistorico:0,abonadoTotal:0,archivada:false},v));}

  const pf=$('#f_pdf')?$('#f_pdf').files[0]:null;
  if(pf){
   if(pf.type!=='application/pdf'&&!pf.name.toLowerCase().endsWith('.pdf'))toast('⚠️ El documento debe ser PDF');
   else{
    const dd=debtById(id);
    if(dd){
     docPut(id,pf);dd.docPdf=true;
     if(fb.user&&fb.loaded){docUpload(id,pf).then(p=>{dd.docPath=p;save();toast('☁️ PDF subido a la nube');}).catch(()=>toast('📱 PDF en este equipo'));}
     else toast('📱 PDF en este equipo');
    }
   }
  }



  save();closeModal();render();toast('💾 Deuda guardada');
 };
}
function openDeudaModal(id){const d=id?debtById(id):{};openModal(id?'✏️ Editar deuda':'➕ Nueva deuda',formDeuda(d));bindDeudaForm(d);}
function openPagoModal(id){const d=debtById(id);if(!d)return;const min=d.sinVencimiento?cicloRestante(d):minPago(d);
 openModal(`💰 Pago: ${esc(d.nombre)}`,`<div class="card" style="background:#f8fafc"><div class="list-item"><span>Facturado mes</span><b>${fmt(d.montoFacturadoMes)}</b></div><div class="list-item"><span>Pago mínimo</span><b>${fmt(min)}</b></div><div class="list-item"><span>Saldo pago mínimo</span><b>${fmt(cicloRestante(d))}</b></div><div class="list-item"><span>Saldo facturado</span><b>${fmt(saldoFacturado(d))}</b></div><div class="list-item"><span>Saldo pendiente</span><b>${fmt(saldoTotalPendiente(d))}</b></div></div><form id="frm_pago"><div class="row2">${inp('p_fecha','Fecha',today(),'date')}${inp('p_monto','Monto ($)','','number','required min="1"')}</div>${inp('p_nota','Nota adicional (opcional)','')}<label class="fld"><span>🧾 Comprobante de pago PDF (opcional)</span><input type="file" id="p_pdf" accept="application/pdf,.pdf"></label><div class="frm-btns"><button class="btn pri" type="submit">✅ Confirmar</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_pago').onsubmit=e=>{e.preventDefault();const fecha=$('#p_fecha').value,monto=+$('#p_monto').value,nota=$('#p_nota').value.trim();if(!fecha||monto<=0)return;
 const f=$('#p_pdf')?$('#p_pdf').files[0]||null:null;
 if(f&&f.type!=='application/pdf'&&!f.name.toLowerCase().endsWith('.pdf'))return toast('⚠️ El comprobante debe ser PDF');
 closeModal();confirmarPago(id,fecha,monto,nota,f);};}
function renderDeudas(){const orden={morosa:0,vigente:1,pagada:2};let list=db.deudas.filter(d=>deudaVerArch?d.archivada:!d.archivada);if(deudaFilter!=='todas')list=list.filter(d=>d.estado===deudaFilter);list.sort((a,b)=>orden[a.estado]-orden[b.estado]||(diasMora(b)||0)-(diasMora(a)||0));
 const cards=list.map(d=>{const ac=acById(d.acreedorId);const rest=cicloRestante(d);const dComp=db.pagos.some(x=>x.deudaId===d.id&&(x.compPdf||x.compPath));return `<div class="card debt ${d.estado==='morosa'?'m':d.estado==='pagada'?'p':''}"><div class="top"><span class="name">${esc(d.nombre)}</span><span class="row" style="gap:6px"><span class="badge b-${d.estado}">${d.estado.toUpperCase()}</span>${moraChip(d)}</span></div><div class="mut">${esc(d.persona)} · ${esc(d.tipoDeuda)} · ${esc(ac?ac.nombre:'—')}</div><div class="data"><span>💵 Total: <b>${fmt(d.montoTotal)}</b></span><span>📉 Saldo: <b>${fmt(d.saldoTotal??d.montoTotal)}</b></span><span>🧾 Facturado: <b>${fmt(d.montoFacturadoMes)}</b></span><span>⬇️ Mínimo: <b>${fmt(minPago(d))}</b></span><span>📅 Vence: <b>${d.sinVencimiento?'Sin venc.':dstr(d.vencimiento)}</b></span><span>👛 Saldo mín.: ${rest<=0?'<span class="al-dia">Al Día ✅</span>':'<b class="err">'+fmt(rest)+'</b>'}</span><span>💼 Pendiente: <b>${fmt(saldoTotalPendiente(d))}</b></span></div><div class="acts">${d.estado!=='pagada'&&!d.archivada?`<button class="btn pri mini" data-act="pago" data-id="${d.id}">💰 Pago</button>`:''}${!d.archivada?`<button class="btn mini" data-act="edit-deuda" data-id="${d.id}">✏️</button><button class="btn mini" data-act="dup-mes" data-id="${d.id}" title="Duplicar p/ próximo mes">🔁 +1 mes</button><button class="btn mini" data-act="doc-deuda" data-id="${d.id}" title="Estado de cuenta PDF">${docIcon(!!(d.docPdf||d.docPath))}</button><button class="btn mini" data-act="comp-deuda" data-id="${d.id}" title="Comprobante de pago PDF">${compIcon(dComp)}</button><button class="btn mini" data-act="arch-deuda" data-id="${d.id}">📦</button>`:`<button class="btn mini" data-act="rest-deuda" data-id="${d.id}">♻️</button><button class="btn mini" data-act="doc-deuda" data-id="${d.id}" title="Estado de cuenta PDF">${docIcon(!!(d.docPdf||d.docPath))}</button><button class="btn mini" data-act="comp-deuda" data-id="${d.id}" title="Comprobante de pago PDF">${compIcon(dComp)}</button><button class="btn warn mini" data-act="del-deuda" data-id="${d.id}">🗑️</button>`}</div></div>`;}).join('');
 $('#ct-deudas').innerHTML=`<div class="row between"><h2>💳 Deudas</h2><span class="row"><button class="btn" data-act="img2pdf" title="Convertir imagen a PDF">🖼️→</button><button class="btn ${deudaVerArch?'soft':'pri'}" data-act="toggle-arch-deudas">📦</button><button class="btn pri" data-act="new-deuda">➕ Nueva</button></span></div><div class="filters">${['todas','vigente','morosa','pagada'].map(f=>`<button class="nbtn ${deudaFilter===f?'on':''}" data-act="filter-deuda" data-id="${f}">${f==='todas'?'Todas':f+'s'}</button>`).join('')}</div>${cards||'<div class="card"><p class="mut">Sin deudas.</p></div>'}`;}
function openEditPago(id){
 const p=db.pagos.find(x=>x.id===id);if(!p)return;
 const tiene=!!(p.compPdf||p.compPath);
 openModal('✏️ Editar pago: '+esc(p.deuda),`<form id="frm_ep">${inp('ep_fecha','Fecha',p.fecha,'date')}${inp('ep_monto','Monto ($)',p.monto,'number')}${inp('ep_nota','Nota adicional (opcional)',p.nota||'')}<div class="row" style="gap:6px;flex-wrap:wrap;margin:4px 0 8px"><button type="button" class="btn" id="ep-ver" ${tiene?'':'disabled'}>🧾 Ver comprobante</button><button type="button" class="btn" id="ep-adj">📎 ${tiene?'Reemplazar':'Adjuntar'} PDF</button><button type="button" class="btn warn" id="ep-qui" ${tiene?'':'disabled'}>🗑️ Quitar</button></div><div class="frm-btns"><button class="btn pri" type="submit">💾 Guardar</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#ep-ver').onclick=()=>compModal(id);
 $('#ep-adj').onclick=()=>{const i=document.createElement('input');i.type='file';i.accept='application/pdf,.pdf';i.onchange=async()=>{const f=i.files[0];if(!f)return;if(f.type!=='application/pdf'&&!f.name.toLowerCase().endsWith('.pdf'))return toast('⚠️ Solo PDF');if(p.compPath)await compDelete(p.compPath);await docDel(id+'_comp');attachCompPago(p,f);save();openEditPago(id);};i.click();};
 $('#ep-qui').onclick=async()=>{await removeCompPago(p);toast('🗑️ Comprobante eliminado');openEditPago(id);};
 $('#frm_ep').onsubmit=e=>{
  e.preventDefault();
  const fecha=$('#ep_fecha').value,monto=Math.round(Number($('#ep_monto').value)||0),nota=$('#ep_nota').value.trim();
  if(!fecha||monto<=0)return toast('⚠️ Revisa fecha y monto');
  const d=debtById(p.deudaId);
  const aplicar=extraMode=>{
   const oldDesc=p.montoDescontado??p.monto;
   const fact=d?Number(d.montoFacturadoMes)||0:0;
   const exceso=(fact>0&&monto>fact)?monto-fact:0;
   const noDesc=(extraMode==='gastos')?exceso:0;
   const desc=Math.max(0,monto-noDesc);
   const min=d?(d.sinVencimiento?cicloRestante(d):minPago(d)):0;
   let tipo;
   if(exceso>0&&extraMode==='gastos')tipo='PAGO FACTURADO + GASTOS/INTERESES';
   else if(exceso>0&&extraMode==='abono')tipo='PAGO FACTURADO + ABONO';
   else if(d&&monto<min)tipo='ABONO';
   else if(fact>0&&monto>=fact)tipo='PAGO FACTURADO';
   else tipo=p.tipo;
   p.fecha=fecha;p.monto=monto;p.nota=nota;p.tipo=tipo;p.montoDescontado=desc;p.excesoNoDescontado=noDesc;p.extraMode=extraMode||'';
   if(d){
    d.saldoTotal=Math.max(0,(d.saldoTotal??d.montoTotal)+(oldDesc-desc));
    d.pagadoHistorico=Math.max(0,(d.pagadoHistorico||0)+(desc-oldDesc));
    const noAbono=db.pagos.filter(x=>x.deudaId===d.id&&x.tipo!=='ABONO').sort((a,b)=>a.fecha<b.fecha?-1:1);
    if(noAbono.length){d.estado='pagada';d.fechaPago=noAbono[noAbono.length-1].fecha;}
    else if(!d.sinVencimiento&&d.vencimiento){d.estado=(d.vencimiento<today()&&abonosCiclo(d)<minPago(d))?'morosa':'vigente';d.fechaPago=null;}
   }
   save();closeModal();render();toast('✅ Pago actualizado');
  };
  const fact=d?Number(d.montoFacturadoMes)||0:0;
  if(fact>0&&monto>fact){
   openModal('⚠️ Pago superior al monto facturado',`<p>Nuevo monto <b>${fmt(monto)}</b> vs facturado <b>${fmt(fact)}</b>. Diferencia: <b>${fmt(monto-fact)}</b>.</p><div class="frm-btns"><button class="btn warn" id="op-g2">Gastos / intereses</button><button class="btn pri" id="op-a2">Abono a deuda</button><button class="btn" data-act="close-modal">Cancelar</button></div>`);
   $('#op-g2').onclick=()=>aplicar('gastos');
   $('#op-a2').onclick=()=>aplicar('abono');
  }else aplicar(p.extraMode||'');
 };
}
function renderPagos(){const list=db.pagos.filter(p=>pagoVerArch?p.archivado:!p.archivado);
 $('#ct-pagos').innerHTML=`<div class="row between"><h2>🧾 Pagos</h2><span class="row"><button class="btn" data-act="img2pdf" title="Convertir imagen a PDF">🖼️→📄</button><button class="btn ${pagoVerArch?'soft':'pri'}" data-act="toggle-arch-pagos">📦</button></span></div><div class="card tblwrap"><table><tr><th>Fecha</th><th>Deuda</th><th>Monto</th><th>Tipo</th><th></th></tr>${list.map(p=>`<tr><td>${dstr(p.fecha)}</td><td>${esc(p.deuda)}${p.nota?'<br><span class="mut">📝 '+esc(p.nota)+'</span>':''}</td><td><b>${fmt(p.monto)}</b>${p.excesoNoDescontado?'<br><span class="mut">Descuenta: '+fmt(p.montoDescontado||0)+'<br>No descuenta: '+fmt(p.excesoNoDescontado)+'</span>':''}</td><td>${p.tipo}</td><td><button class="btn mini" data-act="edit-pago" data-id="${p.id}">✏️</button><button class="btn mini" data-act="comp-pago" data-id="${p.id}" title="Comprobante de pago">${compIcon(!!(p.compPdf||p.compPath))}</button>${p.archivado?`<button class="btn mini" data-act="rest-pago" data-id="${p.id}">♻️</button>`:`<button class="btn mini" data-act="arch-pago" data-id="${p.id}">📦</button>`}</td></tr>`).join('')}</table>${list.length?'':'<p class="mut">Sin pagos.</p>'}</div>`;}
function renderAcreedores(){$('#ct-acreedores').innerHTML=`<h2>🏦 Acreedores</h2>`+[['financiera','🏦 Financieras'],['empresa','🏢 Empresas'],['persona','👤 Personas'],['otro','📌 Otros']].map(([t,l])=>{const list=db.acreedores.filter(a=>a.tipo===t);return `<div class="card"><div class="row between"><h3>${l}</h3><button class="btn pri mini" data-act="new-ac" data-id="${t}">➕</button></div>${list.map(a=>`<div class="list-item"><span><b>${esc(a.nombre)}</b>${a.codigoCliente?'<br><span class="mut">Código cliente: '+esc(a.codigoCliente)+'</span>':''}</span><span class="row"><button class="btn mini" data-act="edit-ac" data-id="${a.id}">✏️</button><button class="btn warn mini" data-act="del-ac" data-id="${a.id}">🗑️</button></span></div>`).join('')||'<p class="mut">Sin registros.</p>'}</div>`;}).join('');}
function acModal(tipo,id){
 const a=id?acById(id):{tipo,nombre:'',nota:'',codigoCliente:''};
 openModal(id?'✏️ Editar acreedor':'➕ Nuevo acreedor',`<form id="frm_ac">
 ${sel('ac_tipo','Tipo',[['financiera','Financiera'],['empresa','Empresa'],['persona','Persona'],['otro','Otro']],a.tipo)}
 ${inp('ac_nom','Nombre',a.nombre)}
 <div id="ac_cod_wrap">${a.tipo==='empresa'?inp('ac_cod','Código de cliente / N° suministro / N° contrato',a.codigoCliente||''):''}</div>
 ${inp('ac_nota','Nota',a.nota||'')}
 <div class="frm-btns"><button class="btn pri">💾</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div>
 </form>`);

 $('#ac_tipo').onchange=()=>{
  $('#ac_cod_wrap').innerHTML=$('#ac_tipo').value==='empresa'?inp('ac_cod','Código de cliente / N° suministro / N° contrato',a.codigoCliente||''):'';
 };

 $('#frm_ac').onsubmit=e=>{
  e.preventDefault();
  const nom=$('#ac_nom').value.trim();
  if(!nom)return toast('⚠️ Nombre');
  const tipo=$('#ac_tipo').value;
  const cod=$('#ac_cod')?$('#ac_cod').value.trim():'';
  if(id){
   a.nombre=nom;
   a.tipo=tipo;
   a.nota=$('#ac_nota').value;
   a.codigoCliente=tipo==='empresa'?cod:'';
  }else{
   db.acreedores.push({id:uid(),tipo,nombre:nom,nota:$('#ac_nota').value,codigoCliente:tipo==='empresa'?cod:''});
  }
  save();closeModal();render();
 };
}
function selBanco(id,label,val){const opts=db.acreedores.filter(a=>a.tipo==='financiera').map(a=>[a.nombre,a.nombre]);if(val&&!opts.some(o=>o[0]===val))opts.unshift([val,val]);opts.push(['__new','➕ Añadir nueva…']);return sel(id,label,opts,val);}
function nuevoAcreedorDesdeSelect(v){if(v!=='__new')return v;const nom=prompt('Nombre de la nueva entidad financiera:');if(!nom||!nom.trim())return null;const n=nom.trim();if(!db.acreedores.some(a=>a.nombre===n))db.acreedores.push({id:uid(),tipo:'financiera',nombre:n,nota:''});return n;}
function cuentaModal(id){const c=id?db.cuentas.find(x=>x.id===id):{persona:db.personas[0],moneda:'CLP',estado:'Activa'};openModal(id?'✏️ Cuenta':'➕ Cuenta',`<form id="frm_c">${sel('c_per','Titular',db.personas.map(p=>[p,p]),c.persona)}${selBanco('c_banco','Banco/Ent. Financiera',c.banco||'')}${sel('c_tipo','Tipo',['Cuenta Corriente','Cuenta Vista','Cuenta RUT','Cuenta de Ahorro','Línea de Crédito','Cuenta USD','Otro'].map(t=>[t,t]),c.tipo||'Cuenta Corriente')}${inp('c_num','N°',c.numero||'')}<div class="row2">${sel('c_mon','Moneda',[['CLP','CLP'],['USD','USD']],c.moneda)}${sel('c_est','Estado',[['Activa','Activa'],['Inactiva','Inactiva'],['Bloqueada','Bloqueada']],c.estado)}</div>${inp('c_nom','Nombre/uso',c.nombre||'')}<div class="frm-btns"><button class="btn pri">💾</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_c').onsubmit=e=>{e.preventDefault();let banco=$('#c_banco').value;const nb=nuevoAcreedorDesdeSelect(banco);if(banco==='__new'){if(!nb)return toast('⚠️ Escribe un nombre');banco=nb;}const v={persona:$('#c_per').value,banco:banco,tipo:$('#c_tipo').value,numero:$('#c_num').value,moneda:$('#c_mon').value,estado:$('#c_est').value,nombre:$('#c_nom').value};if(id)Object.assign(c,v);else db.cuentas.push(Object.assign({id:uid(),archivada:false,saldo:null},v));upsertBoveda(true,c);save();closeModal();render();};}
function normVenc(s){const d=String(s||'').replace(/\D/g,'').slice(0,4);return d.length===4?d.slice(0,2)+'/'+d.slice(2):(s||'');}
function marcaTarjeta(num){const n=String(num||'').replace(/\D/g,'');if(!n)return '';if(/^3[47]/.test(n))return 'Amex';if(/^4/.test(n))return 'Visa';if(/^(5[1-5]|2[2-7])/.test(n))return 'Mastercard';if(/^35/.test(n))return 'JCB';if(/^(6011|64[4-9]|65)/.test(n))return 'Discover';if(/^(30[0-5]|36|38)/.test(n))return 'Diners';if(/^(5018|5020|5038|6304|6759|676[1-3])/.test(n))return 'Maestro';return '';}
const mask=n=>{const s=String(n||'').replace(/\s/g,'');return s.length>4?'•••• •••• '+s.slice(-4):s;};
function tarjetaModal(id){const t=id?db.tarjetas.find(x=>x.id===id):{persona:db.personas[0],formato:'Física',tipo:'Tarjeta Débito'};
 const optsVinc=[['','-- Sin vincular --'],...db.cuentas.filter(c=>!c.archivada).map(c=>[c.id,c.persona+' · '+c.banco+' · '+c.tipo+' · '+c.numero])];
 openModal(id?'✏️ Tarjeta':'➕ Tarjeta',`<form id="frm_t">${sel('t_per','Titular',db.personas.map(p=>[p,p]),t.persona)}${selBanco('t_ent','Banco/Ent. Financiera',t.entidad||'')}${inp('t_nom','Nombre/uso (opcional)',t.nombre||'')}${sel('t_tipo','Tipo',['Tarjeta Débito','Tarjeta Prepago','Tarjeta Crédito'].map(x=>[x,x]),t.tipo)}${sel('t_fmt','Formato',[['Física','💳 Física'],['Virtual','🌐 Virtual'],['Ambas','💳🌐 Ambas']],t.formato)}${sel('t_vinc','Vinculada a cuenta',optsVinc,t.vinculadaCuentaId||'')}${inp('t_num','Número',t.numero||'')}<p class="mut" id="t_marca" style="margin:-4px 0 8px">💳 Marca: <b>${marcaTarjeta(t.numero)||'—'}</b></p>${inp('t_venc','Vence (MM/AA)',normVenc(t.venc),'text','placeholder="MM/AA" maxlength="5" inputmode="numeric"')}${inp('t_ccv','CCV (seguridad)',t.ccv||'')}<div class="frm-btns"><button class="btn pri">💾</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#t_num').addEventListener('input',e=>{const m=marcaTarjeta(e.target.value);$('#t_marca').innerHTML='💳 Marca: <b>'+(m||'—')+'</b>';});
 $('#t_venc').addEventListener('input',e=>{e.target.value=normVenc(e.target.value);});
 $('#frm_t').onsubmit=e=>{e.preventDefault();let ent=$('#t_ent').value;const nb=nuevoAcreedorDesdeSelect(ent);if(ent==='__new'){if(!nb)return toast('⚠️ Escribe un nombre');ent=nb;}const v={persona:$('#t_per').value,entidad:ent,nombre:$('#t_nom').value,tipo:$('#t_tipo').value,formato:$('#t_fmt').value,numero:$('#t_num').value,venc:normVenc($('#t_venc').value),ccv:$('#t_ccv').value,vinculadaCuentaId:$('#t_vinc').value||null};if(id)Object.assign(t,v);else db.tarjetas.push(Object.assign({id:uid(),archivada:false},v));upsertBoveda(false,t);save();closeModal();render();};
}function renderCuentas(){
 const allC=db.cuentas.filter(c=>!c.archivada),allT=db.tarjetas.filter(t=>!t.archivada);
 const titC=[...new Set(allC.map(c=>c.persona))],banC=[...new Set(allC.map(c=>c.banco))].sort();
 const titT=[...new Set(allT.map(t=>t.persona))],entT=[...new Set(allT.map(t=>t.entidad))].sort();
 const cs=allC.filter(c=>(cfTit==='todos'||c.persona===cfTit)&&(cfBan==='todos'||c.banco===cfBan));
 const ts=allT.filter(t=>(tfTit==='todos'||t.persona===tfTit)&&(tfEnt==='todos'||t.entidad===tfEnt));
 const op=(v,cur)=>`<option value="${esc(v)}" ${String(v)===String(cur)?'selected':''}>${esc(v)}</option>`;
 const vincInfo=t=>{const vc=db.cuentas.find(c=>c.id===t.vinculadaCuentaId);return vc?`${esc(vc.tipo)} ${esc(vc.numero)} · ${esc(vc.banco)}`:'—';};
 $('#ct-cuentas').innerHTML=`<div class="row between"><h2>🏛️ Cuentas y tarjetas</h2><span class="row"><a href="https://ricardocarvajalnavarrete-commits.github.io/boveda-bancaria/" target="_blank" rel="noopener" class="btn pri">🔐 Bóveda</a><button class="btn soft" data-act="sync-boveda" title="Actualizar cuentas y tarjetas desde la bóveda">🔄 Actualizar</button><button class="btn soft" data-act="exp-boveda-up" title="Descargar bóveda actualizada con tus cambios">💾 Bóveda</button><button class="btn soft" data-act="exp-boveda-pdf">📄 PDF</button><button class="btn pri" data-act="new-cuenta">➕ Cuenta</button><button class="btn pri" data-act="new-tarjeta">➕ Tarjeta</button></span></div>
 <div class="row" style="gap:8px;margin:10px 0"><select id="f-ct-tit" class="btn" style="max-width:200px"><option value="todos">👤 Titular: todos</option>${titC.map(v=>op(v,cfTit)).join('')}</select><select id="f-ct-ban" class="btn" style="max-width:220px"><option value="todos">🏦 Banco: todos</option>${banC.map(v=>op(v,cfBan)).join('')}</select></div>
 <div class="card"><h3>Cuentas (${cs.length})</h3><div class="tblwrap"><table><tr><th>Titular</th><th>Banco/Ent. Financiera</th><th>Tipo</th><th>Número de cuenta</th><th>Moneda</th><th>Nombre/uso</th><th>Estado</th><th></th></tr>${cs.map(c=>`<tr><td>${esc(c.persona)}</td><td>${esc(c.banco)}</td><td>${esc(c.tipo)}</td><td>${esc(c.numero)}</td><td>${esc(c.moneda||'CLP')}</td><td>${esc(c.nombre||'—')}</td><td>${esc(c.estado||'Activa')}</td><td><button class="btn mini" data-act="edit-cuenta" data-id="${c.id}">✏️</button><button class="btn mini" data-act="arch-cuenta" data-id="${c.id}">📦</button></td></tr>`).join('')||'<tr><td colspan="8" class="mut">Sin resultados.</td></tr>'}</table></div></div>
 <div class="row" style="gap:8px;margin:10px 0"><select id="f-tj-tit" class="btn" style="max-width:200px"><option value="todos">👤 Titular: todos</option>${titT.map(v=>op(v,tfTit)).join('')}</select><select id="f-tj-ent" class="btn" style="max-width:220px"><option value="todos">🏦 Entidad: todas</option>${entT.map(v=>op(v,tfEnt)).join('')}</select></div>
 <div class="card"><h3>Tarjetas (${ts.length})</h3><div class="tblwrap"><table><tr><th>Titular</th><th>Banco/Ent. Financiera</th><th>Nombre/uso</th><th>Tipo</th><th>Formato</th><th>Número</th><th>Vence</th><th>CCV</th><th>Vinculada a</th><th></th></tr>${ts.map(t=>`<tr><td>${esc(t.persona)}</td><td>${esc(t.entidad)}</td><td>${esc(t.nombre||'—')}</td><td>${esc(t.tipo)}</td><td>${t.formato==='Virtual'?'🌐 Virtual':t.formato==='Ambas'?'💳🌐 Ambas':' Física'}</td><td>${esc(t.numero)}${marcaTarjeta(t.numero)?' <span class="mut">· '+marcaTarjeta(t.numero)+'</span>':''}</td><td>${esc(t.venc||'—')}</td><td>${t.ccv?`<span class="ccv-oculto" id="ccv-${t.id}">•••</span> <button class="btn mini" data-ccvbtn="${t.id}" title="Mantén presionado para ver">👁</button>`:'—'}</td><td>${vincInfo(t)}</td><td style="position:sticky;right:0;background:#fff;box-shadow:-6px 0 8px -6px rgba(0,0,0,.2)"><button class="btn mini" data-act="edit-tarjeta" data-id="${t.id}">✏️</button><button class="btn mini" data-act="arch-tarjeta" data-id="${t.id}">📦</button></td></tr>`).join('')||'<tr><td colspan="9" class="mut">Sin resultados.</td></tr>'}</table></div></div>`;
 $('#f-ct-tit').onchange=e=>{cfTit=e.target.value;renderCuentas();};
 $('#f-ct-ban').onchange=e=>{cfBan=e.target.value;renderCuentas();};
 $('#f-tj-tit').onchange=e=>{tfTit=e.target.value;renderCuentas();};
 $('#f-tj-ent').onchange=e=>{tfEnt=e.target.value;renderCuentas();};
}
function gastoCatMes(cat,m){return db.gastos.filter(g=>g.categoria===cat&&mkey(g.fecha)===m).reduce((s,g)=>s+g.monto,0);}
function renderPresupuesto(){const m=today().slice(0,7);$('#ct-presupuesto').innerHTML=`<div class="row between"><h2>📊 Presupuesto</h2><button class="btn pri" data-act="new-pres">➕</button></div>`+db.presupuestos.map(p=>{const g=gastoCatMes(p.categoria,m);const over=g>p.limite&&p.limite>0;return `<div class="card"><div class="row between"><b>${esc(p.categoria)} ${over?'🚨':''}</b><span class="row"><button class="btn mini" data-act="edit-pres" data-id="${esc(p.categoria)}">✏️</button><button class="btn warn mini" data-act="del-pres" data-id="${esc(p.categoria)}">🗑️</button></span></div><div class="row between"><span>Gastado: <b>${fmt(g)}</b></span><span class="mut">Límite: ${fmt(p.limite)}</span></div></div>`;}).join('');}
function presModal(cat){const p=cat?db.presupuestos.find(x=>x.categoria===cat):{};openModal(cat?'✏️ Presupuesto':'➕ Categoría',`<form id="frm_p">${cat?inp('p_cat','Categoría',p.categoria,'text','readonly'):sel('p_cat','Categoría',db.categorias.filter(c=>!db.presupuestos.some(x=>x.categoria===c)).map(c=>[c,c]),'')}${inp('p_lim','Límite ($)',p.limite??'','number')}<div class="frm-btns"><button class="btn pri">💾</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_p').onsubmit=e=>{e.preventDefault();const c=$('#p_cat').value,l=+$('#p_lim').value;if(cat){p.limite=l;}else db.presupuestos.push({categoria:c,limite:l});save();closeModal();render();};}
let gastosMes=today().slice(0,7);
function renderGastos(){const ing=db.ingresos.filter(i=>mkey(i.fecha)===gastosMes);const gas=db.gastos.filter(g=>mkey(g.fecha)===gastosMes);const ti=ing.reduce((s,i)=>s+i.monto,0),tg=gas.reduce((s,g)=>s+g.monto,0);
 $('#ct-gastos').innerHTML=`<div class="row between"><h2>🛒 Gastos e ingresos</h2><input type="month" id="sel-mes" value="${gastosMes}" class="btn"></div><div class="grid mini"><div class="card kpi ok"><div class="lbl">Ingresos</div><div class="val">${fmt(ti)}</div></div><div class="card kpi ${tg>ti?'warn':''}"><div class="lbl">Gastos</div><div class="val">${fmt(tg)}</div></div></div><div class="card"><div class="row between"><h3>💵 Ingresos</h3><button class="btn pri mini" data-act="new-ing">➕</button></div>${ing.map(i=>`<div class="list-item"><span>${dstr(i.fecha)} · ${esc(i.descripcion||'')}</span><span class="row"><b>${fmt(i.monto)}</b><button class="btn warn mini" data-act="del-ing" data-id="${i.id}">🗑️</button></span></div>`).join('')||'<p class="mut">Sin ingresos.</p>'}</div><div class="card"><div class="row between"><h3>🧾 Gastos</h3><button class="btn pri mini" data-act="new-gasto">➕</button></div>${gas.map(g=>`<div class="list-item"><span>${dstr(g.fecha)} · ${esc(g.descripcion||'')}</span><span class="row"><b>${fmt(g.monto)}</b><button class="btn warn mini" data-act="del-gasto" data-id="${g.id}">🗑️</button></span></div>`).join('')||'<p class="mut">Sin gastos.</p>'}</div>`;
 $('#sel-mes').onchange=e=>{gastosMes=e.target.value;renderGastos();};}
function ingModal(){openModal('➕ Ingreso',`<form id="frm_i">${sel('i_per','Persona',[...db.personas.map(p=>[p,p]),['Ambos','Ambos']],db.personas[0])}${inp('i_des','Descripción','Sueldo ')}${inp('i_mon','Monto ($)','','number')}${inp('i_fec','Fecha',today(),'date')}<div class="frm-btns"><button class="btn pri">💾</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_i').onsubmit=e=>{e.preventDefault();db.ingresos.push({id:uid(),persona:$('#i_per').value,descripcion:$('#i_des').value,monto:+$('#i_mon').value||0,fecha:$('#i_fec').value});save();closeModal();render();};}
function gastoModal(){openModal('➕ Gasto',`<form id="frm_g">${sel('g_per','Persona',[...db.personas.map(p=>[p,p]),['Ambos','Ambos']],db.personas[0])}${sel('g_cat','Categoría',db.categorias.map(c=>[c,c]))}${inp('g_des','Descripción','')}${inp('g_mon','Monto ($)','','number')}${inp('g_fec','Fecha',today(),'date')}<div class="frm-btns"><button class="btn pri">💾</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_g').onsubmit=e=>{e.preventDefault();db.gastos.push({id:uid(),persona:$('#g_per').value,categoria:$('#g_cat').value,descripcion:$('#g_des').value,monto:+$('#g_mon').value||0,fecha:$('#g_fec').value});save();closeModal();render();};}
function aplicarAportesMes(){const m=today().slice(0,7);let ok=false;for(const mt of db.metas){if(mt.autoAporte&&mt.aporteMensual>0&&mt.ultimoAporteMes!==m){mt.ahorrado=(mt.ahorrado||0)+mt.aporteMensual;mt.ultimoAporteMes=m;ok=true;db.gastos.push({id:uid(),persona:'Ambos',categoria:'Ahorro',descripcion:'Aporte meta: '+mt.nombre,monto:mt.aporteMensual,fecha:today()});}}if(ok){save();toast('🎯 Aportes aplicados');}}
function renderMetas(){$('#ct-metas').innerHTML=`<div class="row between"><h2>🎯 Metas</h2><button class="btn pri" data-act="new-meta">➕</button></div>`+(db.metas.filter(m=>!m.archivada).map(mt=>{const pct=mt.objetivo>0?Math.min(100,(mt.ahorrado||0)/mt.objetivo*100):0;return `<div class="card"><div class="row between"><b>${esc(mt.nombre)}</b><span class="row"><button class="btn mini" data-act="aporte-meta" data-id="${mt.id}">💰</button><button class="btn mini" data-act="edit-meta" data-id="${mt.id}">✏️</button><button class="btn mini" data-act="arch-meta" data-id="${mt.id}">📦</button></span></div><div class="progress"><i class="gold" style="width:${pct}%"></i></div><div class="row between"><span><b>${fmt(mt.ahorrado||0)}</b> de ${fmt(mt.objetivo)}</span></div></div>`;}).join('')||'<div class="card"><p class="mut">Sin metas.</p></div>');}
function metaModal(id){const mt=id?db.metas.find(x=>x.id===id):{autoAporte:false};openModal(id?'✏️ Meta':'➕ Meta',`<form id="frm_m">${inp('m_nom','Nombre',mt.nombre||'')}${inp('m_obj','Objetivo ($)',mt.objetivo??'','number')}${inp('m_ah','Ahorrado ($)',mt.ahorrado??0,'number')}<div class="chk-row"><input type="checkbox" id="m_auto" ${mt.autoAporte?'checked':''}><span>Aporte auto ($)</span><input type="number" id="m_ap" value="${mt.aporteMensual??''}"></div><div class="frm-btns"><button class="btn pri">💾</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_m').onsubmit=e=>{e.preventDefault();const v={nombre:$('#m_nom').value,objetivo:+$('#m_obj').value||0,ahorrado:+$('#m_ah').value||0,autoAporte:$('#m_auto').checked,aporteMensual:+$('#m_ap').value||0};if(id)Object.assign(mt,v);else db.metas.push(Object.assign({id:uid(),archivada:false},v));save();closeModal();render();};}
function renderHistorico(){$('#ct-historico').innerHTML=`<h2>📈 Evolución</h2><div class="card tblwrap"><table><tr><th>Mes</th><th>Ingresos</th><th>Gastos</th><th>Balance</th></tr>${Object.entries(histData()).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,12).map(([m,v])=>{const b=v.ing-v.gas;return `<tr><td>${m}</td><td>${fmt(v.ing)}</td><td>${fmt(v.gas)}</td><td class="${b>=0?'al-dia':'err'}"><b>${fmt(b)}</b></td></tr>`;}).join('')||'<tr><td colspan=4>Sin datos.</td></tr>'}</table></div>`;}
function renderArchivo(){const sec=(t,items)=>`<div class="card"><h3>${t} (${items.length})</h3>${items.map(i=>i.html).join('')||'<p class="mut">Vacío.</p>'}</div>`;const it=(txt,act,id)=>`<div class="list-item"><span>${txt}</span><span class="row"><button class="btn mini" data-act="${act}" data-id="${id}">♻️</button><button class="btn warn mini" data-act="${act.replace('rest','del')}" data-id="${id}">🗑️</button></span></div>`;
 $('#ct-archivo').innerHTML=`<h2>📦 Archivo</h2>${sec('Deudas',db.deudas.filter(d=>d.archivada).map(d=>({html:it(esc(d.nombre),'rest-deuda',d.id)})))}${sec('Cuentas',db.cuentas.filter(c=>c.archivada).map(c=>({html:it(esc(c.banco),'rest-cuenta',c.id)})))}${sec('Tarjetas',db.tarjetas.filter(t=>t.archivada).map(t=>({html:it(esc(t.entidad),'rest-tarjeta',t.id)})))}${sec('Pagos',db.pagos.filter(p=>p.archivado).map(p=>({html:it(esc(p.deuda),'rest-pago',p.id)})))}${sec('Metas',db.metas.filter(m=>m.archivada).map(m=>({html:it(esc(m.nombre),'rest-meta',m.id)})))}`;}
function renderAjustes(){let bk=null;try{const b=JSON.parse(localStorage.getItem(LS_BACKUP)||'null');if(b)bk=new Date(b.fecha).toLocaleString();}catch(e){}
 $('#ct-ajustes').innerHTML=`<h2>⚙️ Ajustes</h2><div class="card"><h3>🔐 Contraseña</h3>${db.auth?'<p>✅ Protegida.</p><button class="btn" data-act="chg-pass">Cambiar</button> <button class="btn warn" data-act="rm-pass">Quitar</button>':'<p>Sin contraseña.</p><button class="btn pri" data-act="set-pass">🔑 Establecer</button>'}</div><div class="card"><h3>👆 Huella</h3><p>${localStorage.getItem('billetera_bio')?'✅ activada':'⚪ no activada'}</p><button class="btn pri" data-act="bio-on">Activar</button> <button class="btn warn" data-act="bio-off">Desactivar</button></div><div class="card"><h3>💾 Respaldos</h3><div class="row"><button class="btn pri" data-act="exp-cif">⬇️ Cifrado</button><button class="btn" data-act="imp-cif">⬆️ Importar cifrado</button></div><div class="row" style="margin-top:8px"><button class="btn pri" data-act="exp-excel">📊 Excel</button><button class="btn pri" data-act="imp-excel" style="margin-left:8px">📥 Importar Excel</button></div><div class="row" style="margin-top:8px"><button class="btn soft" data-act="exp-json">JSON</button><button class="btn soft" data-act="imp-json">Importar JSON</button></div><div class="row" style="margin-top:8px"><button class="btn soft" data-act="rest-backup">🛟 Restaurar copia</button></div><p class="mut">🛡️ Copia auto: ${bk||'sin copia'}</p></div><div class="card"><h3>☁️ Firebase</h3><textarea id="fb-cfg" placeholder='{"apiKey":"..."}'>${esc(db.fb.config||'')}</textarea><div class="row" style="margin-top:8px"><button class="btn pri" data-act="fb-save">💾 Guardar</button><span id="fb-user">${fb.user?('👤 '+esc(fb.user.email)+' <button class="btn mini" data-act="fb-out">Salir</button>'):(db.fb.config?'<button class="btn" data-act="fb-login">Entrar</button> <button class="btn soft" data-act="fb-reg">Crear</button>':'')}</span></div><label class="chk"><input type="checkbox" id="fb-act" ${db.fb.activo?'checked':''} ${fb.user?'':'disabled'}> Sincronización</label><div class="row" style="margin-top:8px"><button class="btn" data-act="cloud-restore">☁️ Restablecer desde la nube</button></div></div><div class="card"><h3>🧹 Datos</h3><button class="btn warn" data-act="reset">⚠️ Borrar todo</button></div>`;
 const fa=$('#fb-act');if(fa)fa.onchange=e=>{db.fb.activo=e.target.checked;save();if(db.fb.activo)syncStart();};}
/* ============================== CRIPTO ============================== */
const enc=s=>new TextEncoder().encode(s), dec=b=>new TextDecoder().decode(b);
async function pbkdf2Key(pass,ssalt,use){const km=await crypto.subtle.importKey('raw',enc(pass),'PBKDF2',false,use);return crypto.subtle.deriveKey({name:'PBKDF2',salt:ssalt,iterations:120000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
async function hashPass(pass,salt){const km=await crypto.subtle.importKey('raw',enc(pass),'PBKDF2',false,['deriveBits']);const b=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:120000,hash:'SHA-256'},km,256);return [...new Uint8Array(b)];}
function descargar(nombre,contenido){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([contenido],{type:'application/json'}));a.download=nombre;a.click();}
function passModal(titulo,btn,cb){openModal(titulo,`<form id="frm_pw">${inp('pw1','Contraseña','','password')}${inp('pw2','Repite','','password')}<div class="frm-btns"><button class="btn pri">${btn}</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_pw').onsubmit=async e=>{e.preventDefault();const a=$('#pw1').value,b=$('#pw2').value;if(a.length<4)return toast('⚠️ Mín 4');if(a!==b)return toast('⚠️ No coinciden');const salt=crypto.getRandomValues(new Uint8Array(16));db.auth={salt:[...salt],hash:await hashPass(a,salt)};save();closeModal();cb&&cb(a);toast('🔐 Guardada');};}
/* ============================== BIO ============================== */
const b64u=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64uBuf=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const bin=atob(s);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;};
async function bioAvailable(){if(!window.PublicKeyCredential)return false;try{return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();}catch(e){return false;}}
async function bioEnroll(){const cred=await navigator.credentials.create({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),rp:{name:'Billetera Familiar'},user:{id:crypto.getRandomValues(new Uint8Array(16)),name:'billetera',displayName:'Billetera Familiar'},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required'},timeout:60000}});localStorage.setItem('billetera_bio',b64u(cred.rawId));}
async function bioUnlock(){const id=localStorage.getItem('billetera_bio');if(!id)return false;const cred=await navigator.credentials.get({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),allowCredentials:[{type:'public-key',id:b64uBuf(id)}],userVerification:'required',timeout:60000}});return !!cred;}
/* ============================== FIREBASE ============================== */
const fb={app:null,auth:null,dbfs:null,user:null,loaded:false};
function parseFB(txt){txt=String(txt||'').trim().replace(/^(export\s+)?(const|let|var)\s+firebaseConfig\s*=\s*/i,'').replace(/;\s*$/,'');if(txt&&!txt.startsWith('{'))txt='{'+txt;if(txt&&!txt.endsWith('}'))txt+='}';try{return JSON.parse(txt);}catch(e){}const f=txt.replace(/,\s*}/g,'}').replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g,'$1"$2":');return JSON.parse(f);}
async function initFB(){if(!db.fb.config)return;try{const cfg=parseFB(db.fb.config);const {initializeApp}=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');const {getAuth,onAuthStateChanged}=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');const {getFirestore}=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');fb.app=initializeApp(cfg);fb.auth=getAuth(fb.app);fb.dbfs=getFirestore(fb.app);fb.loaded=true;onAuthStateChanged(fb.auth,u=>{fb.user=u;syncStart();if(curView==='ajustes')renderAjustes();updateSyncChip();});}catch(e){console.warn('Firebase:',e);}}
let _snap=null,_pushT=null;
async function syncStart(){if(!fb.user||!db.fb.activo)return;const m=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');if(_snap)_snap();const ref=m.doc(fb.dbfs,'users',fb.user.uid,'data','main');if(syncDecidido){iniciarSnapshot(m,ref);return;}let remoto=null;try{const s=await m.getDoc(ref);if(s.exists())remoto=s.data();}catch(e){}if(!remoto){syncDecidido=true;iniciarSnapshot(m,ref);pushFB();return;}if(db.esSeed){aplicarRemoto(remoto);syncDecidido=true;iniciarSnapshot(m,ref);updateSyncChip(true);toast('☁️ Restaurado desde nube');return;}openModal('☁️ Dos versiones',`<p>Nube: ${new Date(remoto.updatedAt||0).toLocaleString()} · Este: ${new Date(db.updatedAt).toLocaleString()}</p><div class="frm-btns"><button type="button" class="btn pri" id="sc-nube">⬇️ Usar nube</button><button type="button" class="btn" id="sc-local">⬆️ Usar este</button></div>`);$('#sc-nube').onclick=()=>{aplicarRemoto(remoto);syncDecidido=true;iniciarSnapshot(m,ref);closeModal();updateSyncChip(true);};$('#sc-local').onclick=()=>{syncDecidido=true;iniciarSnapshot(m,ref);closeModal();pushFB();};}
function aplicarRemoto(r){try{const d=JSON.parse(r.json);if(!dbValida(d))return toast('❌ Nube dañada');db=completarDB(d);db.esSeed=false;localStorage.setItem(LS,JSON.stringify(db));evaluarDeudas();render();}catch(e){toast('❌ No se leyó nube');}}
function iniciarSnapshot(m,ref){_snap=m.onSnapshot(ref,snap=>{if(!snap.exists())return;const r=snap.data();if(syncDecidido&&r.updatedAt>db.updatedAt){db=completarDB(JSON.parse(r.json));db.esSeed=false;localStorage.setItem(LS,JSON.stringify(db));evaluarDeudas();render();toast('☁️ Actualizado');updateSyncChip();}});}
async function pushFB(){updateSyncChip();if(!(fb.user&&db.fb.activo&&fb.loaded&&syncDecidido))return;clearTimeout(_pushT);_pushT=setTimeout(async()=>{try{const {doc,setDoc}=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');await setDoc(doc(fb.dbfs,'users',fb.user.uid,'data','main'),{json:JSON.stringify(db),updatedAt:db.updatedAt});updateSyncChip(true);}catch(e){console.warn(e);updateSyncChip();}},1200);}
function updateSyncChip(ok){const c=$('#sync-chip');if(!c)return;if(fb.user&&db.fb.activo){c.classList.remove('hidden');c.className='chip '+(ok?'g':'');c.textContent=ok?'☁️ Sincronizado':'☁️ Sincronizando…';}else c.classList.add('hidden');}
function fbAuthModal(reg){openModal(reg?'🆕 Crear cuenta':'🔑 Entrar',`<form id="frm_fb">${inp('fb_e','Correo','','email')}${inp('fb_p','Contraseña','','password')}<div class="frm-btns"><button class="btn pri">${reg?'Crear':'Entrar'}</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_fb').onsubmit=async e=>{e.preventDefault();try{const m=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');const em=$('#fb_e').value,pw=$('#fb_p').value;reg?await m.createUserWithEmailAndPassword(fb.auth,em,pw):await m.signInWithEmailAndPassword(fb.auth,em,pw);closeModal();toast('✅ Sesión iniciada');renderAjustes();}catch(err){showAlert('❌ Error de sesión',String(err.code||err.message)+'<br>Verifica: 1) Email/Contraseña habilitado, 2) dominio github.io autorizado, 3) usuario creado.');}};}
/* ============================== NOTIF ============================== */
function revisarRecordatorios(){if(!('Notification'in window)||Notification.permission!=='granted')return;const vistas=JSON.parse(sessionStorage.getItem('nv')||'[]');const hoy=today();let nuevas=[];for(const d of db.deudas){if(d.archivada||d.estado==='pagada'||d.sinVencimiento||!d.vencimiento)continue;const dd=days(hoy,d.vencimiento);const key=d.id+hoy;if(vistas.includes(key))continue;if(dd<0)nuevas.push(`🔴 "${d.nombre}" en mora`);else if(dd<=(db.ajustes.diasAviso||5))nuevas.push(`🟡 "${d.nombre}" vence en ${dd}d`);if(nuevas.length)vistas.push(key);}nuevas.slice(0,3).forEach(b=>{try{new Notification('👛 Billetera',{body:b});}catch(e){}});sessionStorage.setItem('nv',JSON.stringify(vistas));}
/* ============================== EXCEL ============================== */
function cargarXLSX(){return new Promise((res,rej)=>{if(window.XLSX)return res();const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=()=>res();s.onerror=()=>rej(new Error('sin-cdn'));document.head.appendChild(s);});}
async function exportarExcel(){toast('⏳ Generando…');try{await cargarXLSX();}catch(e){return toast('❌ Sin conexión');}const X=XLSX,wb=X.utils.book_new(),hoy=today(),mes=hoy.slice(0,7);const acNom=id=>{const a=db.acreedores.find(x=>x.id===id);return a?a.nombre:'';};
 X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.deudas.map(d=>({Nombre:d.nombre,Estado:d.estado,Resp:d.persona,Tipo:d.tipoDeuda,Acreedor:acNom(d.acreedorId),Total:d.montoTotal,Saldo:d.saldoTotal??d.montoTotal,Facturado:d.montoFacturadoMes,Minimo:minPago(d),Vencimiento:d.sinVencimiento?'':d.vencimiento}))),'Deudas');
 X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.pagos.map(p=>({Fecha:p.fecha,Deuda:p.deuda,Monto:p.monto,Descuenta:p.montoDescontado??p.monto,'No descuenta':p.excesoNoDescontado||0,Tipo:p.tipo,Nota:p.nota||''}))),'Pagos');
 X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.cuentas.map(c=>({Titular:c.persona,Banco:c.banco,Tipo:c.tipo,Numero:c.numero,Moneda:c.moneda,Estado:c.estado}))),'Cuentas');
 X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.tarjetas.map(t=>({Titular:t.persona,Entidad:t.entidad,Tipo:t.tipo,Formato:t.formato,Numero:t.numero,Vence:t.venc||''}))),'Tarjetas');
 X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.gastos.map(g=>({Fecha:g.fecha,Persona:g.persona,Categoria:g.categoria,Desc:g.descripcion,Monto:g.monto}))),'Gastos');
 X.writeFile(wb,'Billetera_'+hoy+'.xlsx');toast('⬇️ Excel descargado');}
/* ============================== BOVEDA PDF ============================== */
function cargarLibPDF(){return new Promise((res,rej)=>{if(window.jspdf&&window.jspdf.jsPDF)return res();const s1=document.createElement('script');s1.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s1.onload=()=>{const s2=document.createElement('script');s2.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.0/jspdf.plugin.autotable.min.js';s2.onload=res;s2.onerror=rej;document.head.appendChild(s2);};s1.onerror=rej;document.head.appendChild(s1);});}
function limpiarKeys(obj){const o={};for(const k in obj)o[k.trim()]=obj[k];return o;}
function getCampo(r,sins){const keys=Object.keys(r||{});for(const n of sins){for(const k of keys){if(normKey(k)===n)return r[k];}}for(const n of sins){for(const k of keys){if(normKey(k).includes(n))return r[k];}}return '';}
function normalizarBoveda(d){let arr=[];if(Array.isArray(d))arr=d;else if(d&&typeof d==='object'){if(Array.isArray(d.registros))arr=d.registros;else if(Array.isArray(d.items))arr=d.items;else if(Array.isArray(d.cuentas)||Array.isArray(d.tarjetas))arr=[...(d.cuentas||[]),...(d.tarjetas||[])];else{for(const k in d){if(Array.isArray(d[k])&&d[k].length&&typeof d[k][0]==='object'){arr=d[k];break;}}}}return arr.filter(r=>r&&typeof r==='object').map(r=>({titular:String(getCampo(r,['titular','persona','nombre'])||''),tipo:String(getCampo(r,['tipo','clase'])||''),formato:String(getCampo(r,['formato'])||''),banco:String(getCampo(r,['banco','entidad'])||''),numero:String(getCampo(r,['numero','number','tarjeta'])||''),vence:String(getCampo(r,['vence','vencimiento'])||''),ccv:String(getCampo(r,['ccv','cvv','cv'])||''),notas:String(getCampo(r,['notas','alias'])||'')}));}
async function descifrarBoveda(obj,pass){const combos=[];[100000,120000,60000,250000,310000,600000,150000,50000,20000,10000,1000].forEach(it=>combos.push({it,hash:'SHA-256'}));[100000,120000].forEach(it=>combos.push({it,hash:'SHA-1'}));for(const c of combos){try{const km=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:new Uint8Array(obj.salt),iterations:c.it,hash:c.hash},km,{name:'AES-GCM',length:256},false,['decrypt']);const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(obj.iv)},key,new Uint8Array(obj.data));return JSON.parse(new TextDecoder().decode(pt));}catch(e){}}return null;}
async function sincronizarBoveda(){
 let obj=null;
 try{const r=await fetch('https://ricardocarvajalnavarrete-commits.github.io/boveda-bancaria/boveda_cifrada.json',{cache:'no-store'});if(r.ok)obj=limpiarKeys(await r.json());}catch(e){}
 if(!obj||!obj.data||!obj.salt||!obj.iv){
  toast('📁 Bóveda no publicada: selecciónala desde tu equipo');
  obj=await new Promise(res=>{const i=document.createElement('input');i.type='file';i.accept='.json';let done=false;const fin=v=>{if(!done){done=true;res(v);}};i.onchange=async()=>{try{fin(limpiarKeys(JSON.parse(await i.files[0].text())));}catch(e){fin(null);}};i.click();setTimeout(()=>fin(null),120000);});
 }
 if(!obj||!obj.data||!obj.salt||!obj.iv)return toast('❌ No se encontró la bóveda');
 openModal('🔄 Actualizar desde Bóveda',`<form id="frm_sb">${inp('sb_pw','Contraseña de la bóveda','','password','required')}<p class="mut">Se actualizarán/crearán cuentas y tarjetas con los datos descifrados de la bóveda (números completos).</p><div class="frm-btns"><button class="btn pri">🔄 Actualizar</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_sb').onsubmit=async e=>{
  e.preventDefault();
  const pass=$('#sb_pw').value;
  toast('⏳ Descifrando…');
  const datos=await descifrarBoveda(obj,pass);
  if(!datos)return toast('❌ Clave no coincide');
  const regs=normalizarBoveda(datos);
  const digits=s=>String(s||'').replace(/\D/g,'');
  const normP=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  const coinciden=(na,nv,pa,pv)=>{const da=digits(na),dv=digits(nv);if(!da||!dv)return false;if(da===dv)return true;return da.slice(-4)===dv.slice(-4)&&normP(pa)===normP(pv);};
  let act=0,nue=0;
  regs.forEach(r=>{
   if(!r.numero)return;
   const esCuenta=/cuenta|l[ií]nea/i.test(r.tipo)&&!/tarjeta/i.test(r.tipo);
   if(esCuenta){
    let c=db.cuentas.find(x=>coinciden(x.numero,r.numero,x.persona,r.titular));
    if(c){c.persona=r.titular||c.persona;c.banco=r.banco||c.banco;c.tipo=r.tipo||c.tipo;c.numero=r.numero;act++;}
    else{db.cuentas.push({id:uid(),persona:r.titular||db.personas[0],banco:r.banco||'',tipo:r.tipo||'Cuenta Corriente',numero:r.numero,moneda:'CLP',estado:'Activa',nombre:r.notas||'',saldo:null,archivada:false});nue++;}
   }else{
    let t=db.tarjetas.find(x=>coinciden(x.numero,r.numero,x.persona,r.titular));
    if(t){t.persona=r.titular||t.persona;t.entidad=r.banco||t.entidad;t.tipo=r.tipo||t.tipo;t.formato=r.formato||t.formato;t.venc=r.vence||t.venc;t.numero=r.numero;act++;}
    else{db.tarjetas.push({id:uid(),persona:r.titular||db.personas[0],entidad:r.banco||'',tipo:r.tipo||'Tarjeta Débito',formato:r.formato||'Física',numero:r.numero,venc:r.vence||'',ccv:r.ccv||'',nombre:r.notas||'',archivada:false});nue++;}
   }
  });
  save();closeModal();render();
  toast('✅ Bóveda aplicada: '+act+' actualizados y '+nue+' nuevos');
 };
}
async function exportBovedaPDF(){openModal('🔓 Bóveda → PDF',`<form id="frm_bv"><label class="fld"><span>boveda_cifrada.json (opcional)</span><input type="file" id="bv_file" accept=".json"></label>${inp('bv_pw','Contraseña','','password','required')}<label class="chk"><input type="checkbox" id="bv_same" checked> Misma clave para el PDF</label><div class="frm-btns"><button class="btn pri">📄 Generar</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_bv').onsubmit=async e=>{e.preventDefault();const pass=$('#bv_pw').value;let obj=null;const f=$('#bv_file').files[0];if(f){try{obj=limpiarKeys(JSON.parse(await f.text()));}catch(err){return toast('❌ json inválido');}}else{try{const r=await fetch('https://ricardocarvajalnavarrete-commits.github.io/boveda-bancaria/boveda_cifrada.json',{cache:'no-store'});if(r.ok)obj=limpiarKeys(await r.json());}catch(err){}}if(!obj||!obj.data||!obj.salt||!obj.iv)return toast('❌ No se encontró bóveda');toast('⏳ Descifrando…');const datos=await descifrarBoveda(obj,pass);if(!datos)return toast('❌ Clave no coincide');await generarPDFBoveda(normalizarBoveda(datos),pass);closeModal();toast('⬇️ PDF descargado');};}
async function generarPDFBoveda(regs,pass){await cargarLibPDF();const {jsPDF}=window.jspdf;const doc=new jsPDF({orientation:'landscape',encryption:{userPassword:pass,ownerPassword:pass,userPermissions:['print']}});const cuentas=regs.filter(r=>(r.tipo||'').toLowerCase().includes('cuenta'));const tarjetas=regs.filter(r=>!(r.tipo||'').toLowerCase().includes('cuenta'));doc.setFontSize(14);doc.text('Bóveda Bancaria — CONFIDENCIAL',14,16);doc.autoTable({startY:22,head:[['Titular','Tipo','Banco','Número','Notas']],body:cuentas.map(r=>[r.titular,r.tipo,r.banco,r.numero,r.notas]),styles:{fontSize:8}});doc.addPage();doc.autoTable({startY:16,head:[['Titular','Tipo','Formato','Banco','Número','Vence','CVV']],body:tarjetas.map(r=>[r.titular,r.tipo,r.formato,r.banco,r.numero,r.vence,r.ccv]),styles:{fontSize:8}});doc.save('Boveda_CONFIDENCIAL_'+today()+'.pdf');}
/* ============================== CONVERSOR IMG→PDF ============================== */
async function conversorImgPDF(){
 try{await cargarLibPDF();}catch(e){return toast('❌ Sin conexión para cargar el generador PDF');}
 openModal('🖼️ Convertir imagen a PDF',`<p class="mut">Adjunta una o más imágenes (JPG/PNG) y descárgalas como un solo PDF. Luego podrás adjuntarlo como 📄 estado de cuenta o 🧾 comprobante de pago.</p>
 <label class="fld"><span>Imágenes</span><input type="file" id="img2pdf-files" accept="image/*" multiple></label>
 <div id="img2pdf-prev" class="row" style="gap:6px;flex-wrap:wrap;margin:8px 0"></div>
 <div class="frm-btns"><button class="btn pri" id="img2pdf-dl">⬇️ Descargar PDF</button><button class="btn" data-act="close-modal">Cerrar</button></div>`);
 $('#img2pdf-files').onchange=e=>{const prev=$('#img2pdf-prev');prev.innerHTML='';[...e.target.files].forEach(f=>{const im=document.createElement('img');im.src=URL.createObjectURL(f);im.style.cssText='width:56px;height:56px;object-fit:cover;border-radius:8px;border:1px solid #cbd5e1';prev.appendChild(im);});};
 $('#img2pdf-dl').onclick=async()=>{
  const files=[...$('#img2pdf-files').files];
  if(!files.length)return toast('⚠️ Adjunta al menos una imagen');
  toast('⏳ Generando PDF…');
  const {jsPDF}=window.jspdf;let doc=null;
  for(const f of files){
   try{
    let src=await createImageBitmap(f).catch(()=>null);
    let iw=src?src.width:0,ih=src?src.height:0;
    if(!src){
     const dataUrl=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f);});
     src=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=dataUrl;});
     iw=src.naturalWidth||src.width;ih=src.naturalHeight||src.height;
    }
    const maxDim=2000;const sc=Math.min(1,maxDim/Math.max(iw||1,ih||1));
    const cw=Math.max(1,Math.round((iw||1)*sc)),ch=Math.max(1,Math.round((ih||1)*sc));
    const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;
    const cx=cv.getContext('2d');cx.fillStyle='#ffffff';cx.fillRect(0,0,cw,ch);cx.drawImage(src,0,0,cw,ch);
    const jpeg=cv.toDataURL('image/jpeg',0.85);
    const orient=cw>ch?'landscape':'portrait';
    if(!doc)doc=new jsPDF({orientation:orient,unit:'mm',format:'a4'});else doc.addPage('a4',orient);
    const pw=doc.internal.pageSize.getWidth(),ph=doc.internal.pageSize.getHeight(),m=8;
    const ratio=Math.min((pw-2*m)/cw,(ph-2*m)/ch);
    const w=cw*ratio,h=ch*ratio;
    doc.addImage(jpeg,'JPEG',(pw-w)/2,(ph-h)/2,w,h);
   }catch(e){console.error(e);toast('⚠️ No se pudo leer '+f.name);}
  }
  if(!doc)return toast('❌ No se pudo generar el PDF');
  try{doc.save('convertido_'+today()+'.pdf');toast('⬇️ PDF descargado: ya puedes adjuntarlo');}catch(e){console.error(e);toast('❌ No se pudo guardar el PDF');}
 };
}
/* ============================== IMPORTAR EXCEL ============================== */
function parseFecha(v){if(!v)return null;if(v instanceof Date&&!isNaN(v))return v.toISOString().slice(0,10);const s=String(v).trim();let m=s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);if(m){let y=+m[3];if(y<100)y+=2000;return y+'-'+String(+m[2]).padStart(2,'0')+'-'+String(+m[1]).padStart(2,'0');}m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return m[1]+'-'+String(+m[2]).padStart(2,'0')+'-'+String(+m[3]).padStart(2,'0');return null;}
async function importarExcel(){await cargarXLSX();const inpF=document.createElement('input');inpF.type='file';inpF.accept='.xlsx,.xls';inpF.onchange=async()=>{const file=inpF.files[0];if(!file)return;toast('⏳ Leyendo…');try{const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});const res={deudas:[],cuentas:[],tarjetas:[]};const num=v=>Number(String(v).replace(/[^0-9.-]/g,''))||0;
 const sd=wb.SheetNames.find(n=>normKey(n).includes('deuda'));if(sd){XLSX.utils.sheet_to_json(wb.Sheets[sd],{defval:''}).forEach(r=>{const nombre=getCampo(r,['descripcion','acreedor','nombre','tarjeta']);if(!nombre||String(nombre).toUpperCase().includes('TOTAL'))return;const monto=num(getCampo(r,['montototal']));const saldo=num(getCampo(r,['saldopendiente']))||monto;const cuota=num(getCampo(r,['cuotamensual','pagominimo']));const venc=parseFecha(getCampo(r,['vencimiento']));const est=String(getCampo(r,['estado'])).toLowerCase();let e2='vigente';if(est.includes('mor')||est.includes('venc'))e2='morosa';else if(est.includes('pag')||est.includes('cancel'))e2='pagada';res.deudas.push({id:uid(),nombre:String(nombre),tipoDeuda:String(getCampo(r,['tipo'])||'Tarjeta de Crédito'),conTipo:'financiera',acreedorId:(db.acreedores[0]||{id:'a1'}).id,persona:String(getCampo(r,['responsable'])||'Ricardo'),montoTotal:monto,saldoTotal:saldo,montoFacturadoMes:cuota,tienePagoMinimo:cuota>0,pagoMinimo:cuota,vencimiento:venc,sinVencimiento:!venc,estado:e2,archivada:false,notas:''});});}
 const sc=wb.SheetNames.find(n=>normKey(n).includes('cuenta')&&normKey(n).includes('banc'));if(sc){XLSX.utils.sheet_to_json(wb.Sheets[sc],{defval:''}).forEach(r=>{const numero=String(getCampo(r,['numerodecuenta','numero'])).replace(/\s/g,'');if(!numero||numero.length<4)return;res.cuentas.push({id:uid(),persona:String(getCampo(r,['persona'])||'Ricardo'),banco:String(getCampo(r,['banco'])||''),tipo:String(getCampo(r,['tipodecuenta','tipo'])||'Cuenta Corriente'),numero,moneda:String(getCampo(r,['moneda'])||'CLP'),estado:String(getCampo(r,['estado'])||'Activa'),nombre:'',saldo:null,archivada:false});});}
 wb.SheetNames.filter(n=>normKey(n).includes('tarjeta')).forEach(sn=>{XLSX.utils.sheet_to_json(wb.Sheets[sn],{defval:''}).forEach(r=>{const numFis=String(r['Número']||'').replace(/\s/g,'');const numVirt=String(r['Número_1']||'').replace(/\s/g,'');if(!numFis&&!numVirt)return;const tb=String(r['Tipo']||'').toLowerCase();let tipo='Tarjeta Crédito';if(tb.includes('débito')||tb.includes('debito'))tipo='Tarjeta Débito';else if(tb.includes('prepago'))tipo='Tarjeta Prepago';if(numFis&&numFis.length>=4)res.tarjetas.push({id:uid(),persona:String(r['Responsable']||'Ricardo'),entidad:String(r['Banco o Entidad']||''),tipo,formato:'Física',numero:'•••• •••• •••• '+numFis.slice(-4),venc:String(r['Vencimiento']||''),archivada:false});if(numVirt&&numVirt.length>=4)res.tarjetas.push({id:uid(),persona:String(r['Responsable']||'Ricardo'),entidad:String(r['Banco o Entidad']||''),tipo,formato:'Virtual',numero:'•••• •••• •••• '+numVirt.slice(-4),venc:String(r['vencimiento_1']||''),archivada:false});});});
 openModal('📊 Importar Excel',`<p>Encontrados: ${res.deudas.length} deudas, ${res.cuentas.length} cuentas, ${res.tarjetas.length} tarjetas.</p><div class="frm-btns"><button type="button" class="btn pri" id="imp-reemp">🔄 Reemplazar</button><button type="button" class="btn" id="imp-fusion">➕ Agregar</button><button type="button" class="btn" data-act="close-modal">Cancelar</button></div>`);
 $('#imp-reemp').onclick=()=>{db.deudas=res.deudas;db.cuentas=res.cuentas;db.tarjetas=res.tarjetas;save();closeModal();render();toast('✅ Reemplazado');};
 $('#imp-fusion').onclick=()=>{db.deudas=db.deudas.concat(res.deudas);db.cuentas=db.cuentas.concat(res.cuentas);db.tarjetas=db.tarjetas.concat(res.tarjetas);save();closeModal();render();toast('✅ Agregado');};}catch(e){console.error(e);toast('❌ Error al leer');}};inpF.click();}
/* ============================== ACCIONES ============================== */
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const {act,id}=b.dataset;const find=(arr,i)=>arr.find(x=>x.id===i);
 const archToggle=(arr,i,frase)=>{const x=find(arr,i);if(!x)return;const clave=('archivado'in x)?'archivado':'archivada';x[clave]=!x[clave];save();render();toast(x[clave]?`📦 ${frase} archivado`:`♻️ ${frase} restaurado`);};
 switch(act){
  case 'close-modal':closeModal();break;
   case 'calc':toggleCalc();break;
  case 'nav':go(id);break;
  case 'new-deuda':openDeudaModal();break;case 'edit-deuda':openDeudaModal(id);break;case 'pago':openPagoModal(id);break;
  case 'dup-mes':{const d=debtById(id);if(!d)break;const nv=addMonth(d.vencimiento||today(),1);const nd={...d,id:uid(),estado:'vigente',fechaPago:null,abonadoTotal:0,archivada:false,vencimiento:nv,sinVencimiento:false,docPdf:false,docPath:null,compPdf:false,compPath:null};const mesNuevo=new Date(nv+'T12:00').toLocaleDateString('es-CL',{month:'long'});nd.nombre=d.nombre.replace(/ — .*$/,'')+' — '+mesNuevo.charAt(0).toUpperCase()+mesNuevo.slice(1);const sh=d.saldoTotal??d.montoTotal;nd.montoTotal=sh;nd.saldoTotal=sh;db.deudas.push(nd);save();render();toast('🔁 Duplicada para '+mesNuevo);break;}
  case 'doc-deuda':docModal(id);break;
   case 'img2pdf':conversorImgPDF();break;
case 'comp-deuda':{const ps=db.pagos.filter(x=>x.deudaId===id).sort((a,b)=>a.fecha<b.fecha?1:-1);if(!ps.length)return toast('⚠️ Registra un pago para adjuntar su comprobante');compModal(ps[0].id);break;}
case 'comp-pago':compModal(id);break;  case 'arch-deuda':archToggle(db.deudas,id,'Deuda');break;case 'rest-deuda':archToggle(db.deudas,id,'Deuda');break;
  case 'del-deuda':confirmDlg('🗑️ Eliminar','¿Eliminar definitivamente?',()=>{const dd=debtById(id);if(dd){const otroD=db.deudas.find(x=>x.id!==id&&x.docPath&&x.docPath===dd.docPath);const otroC=db.deudas.find(x=>x.id!==id&&x.compPath&&x.compPath===dd.compPath);if(dd.docPath&&!otroD)docDelete(dd.docPath);if(dd.compPath&&!otroC)compDelete(dd.compPath);}docDel(id);docDel(id+'_comp');db.deudas=db.deudas.filter(d=>d.id!==id);save();render();});break;
  case 'filter-deuda':deudaFilter=id;renderDeudas();break;case 'toggle-arch-deudas':deudaVerArch=!deudaVerArch;renderDeudas();break;
  case 'toggle-arch-pagos':pagoVerArch=!pagoVerArch;renderPagos();break;case 'edit-pago':openEditPago(id);break;case 'arch-pago':archToggle(db.pagos,id,'Pago');break;case 'rest-pago':archToggle(db.pagos,id,'Pago');break;
  case 'del-pago':confirmDlg('🗑️','¿Eliminar pago?',async()=>{const p=db.pagos.find(x=>x.id===id);if(p)await removeCompPago(p);db.pagos=db.pagos.filter(p=>p.id!==id);save();render();});break;
  case 'new-ac':acModal(id);break;case 'edit-ac':acModal(null,id);break;
  case 'del-ac':confirmDlg('🗑️','¿Eliminar acreedor?',()=>{db.acreedores=db.acreedores.filter(a=>a.id!==id);save();render();});break;
  case 'toggle-nums':showNums=!showNums;renderCuentas();break;
  case 'new-cuenta':cuentaModal();break;case 'edit-cuenta':cuentaModal(id);break;case 'arch-cuenta':archToggle(db.cuentas,id,'Cuenta');break;case 'rest-cuenta':archToggle(db.cuentas,id,'Cuenta');break;
  case 'del-cuenta':confirmDlg('🗑️','¿Eliminar cuenta?',()=>{db.cuentas=db.cuentas.filter(c=>c.id!==id);save();render();});break;
  case 'new-tarjeta':tarjetaModal();break;case 'edit-tarjeta':tarjetaModal(id);break;case 'arch-tarjeta':archToggle(db.tarjetas,id,'Tarjeta');break;case 'rest-tarjeta':archToggle(db.tarjetas,id,'Tarjeta');break;
  case 'del-tarjeta':confirmDlg('🗑️','¿Eliminar tarjeta?',()=>{db.tarjetas=db.tarjetas.filter(t=>t.id!==id);save();render();});break;
  case 'new-pres':presModal();break;case 'edit-pres':presModal(id);break;case 'del-pres':db.presupuestos=db.presupuestos.filter(p=>p.categoria!==id);save();render();break;
  case 'new-ing':ingModal();break;case 'del-ing':db.ingresos=db.ingresos.filter(i=>i.id!==id);save();render();break;
  case 'new-gasto':gastoModal();break;case 'del-gasto':db.gastos=db.gastos.filter(g=>g.id!==id);save();render();break;
  case 'new-meta':metaModal();break;case 'edit-meta':metaModal(id);break;case 'arch-meta':archToggle(db.metas,id,'Meta');break;case 'rest-meta':archToggle(db.metas,id,'Meta');break;
  case 'aporte-meta':openModal('💰 Aportar',`<form id="frm_ap">${inp('ap_mon','Monto ($)','','number')}<div class="frm-btns"><button class="btn pri">Aportar</button></div></form>`);$('#frm_ap').onsubmit=e=>{e.preventDefault();const mt=find(db.metas,id);mt.ahorrado=(mt.ahorrado||0)+(+$('#ap_mon').value||0);save();closeModal();render();};break;
  case 'set-pass':passModal('🔑 Establecer','Crear');break;case 'chg-pass':passModal('🔑 Cambiar','Cambiar');break;
  case 'rm-pass':confirmDlg('Quitar','¿Quitar contraseña?',()=>{db.auth=null;save();render();});break;
  case 'bio-on':(async()=>{if(!db.auth)return toast('⚠️ Pon contraseña primero');if(!(await bioAvailable()))return toast('❌ Sin huella');try{await bioEnroll();toast('✅ Bio activada');renderAjustes();}catch(e){toast('❌ Cancelado');}})();break;
  case 'bio-off':localStorage.removeItem('billetera_bio');renderAjustes();break;
  case 'notif-perm':if('Notification'in window)Notification.requestPermission().then(()=>{render();toast('🔔 Permiso: '+Notification.permission);});else toast('No soportado');break;
  case 'save-aviso':db.ajustes.diasAviso=+$('#aviso').value||5;save();toast('💾 Guardado');break;
  case 'install':installApp();break;
  case 'exp-cif':passModal('🔐 Cifrar respaldo','Cifrar',async pass=>{const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const key=await pbkdf2Key(pass,salt,['encrypt']);const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc(JSON.stringify(db)));descargar('respaldo_'+today()+'.json',JSON.stringify({salt:[...salt],iv:[...iv],data:[...new Uint8Array(ct)]}));toast('⬇️ Descargado');});break;
  case 'imp-cif':{const iF=document.createElement('input');iF.type='file';iF.accept='.json';iF.onchange=async()=>{const file=iF.files[0];if(!file)return;const obj=JSON.parse(await file.text());openModal('🔓 Importar',`<form id="frm_imp">${inp('imp_pw','Contraseña','','password')}<div class="frm-btns"><button class="btn pri">Importar</button></div></form>`);$('#frm_imp').onsubmit=async e=>{e.preventDefault();try{const key=await pbkdf2Key($('#imp_pw').value,new Uint8Array(obj.salt),['decrypt']);const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(obj.iv)},key,new Uint8Array(obj.data));db=completarDB(JSON.parse(dec(pt)));db.esSeed=false;localStorage.setItem(LS,JSON.stringify(db));evaluarDeudas();closeModal();render();toast('✅ Importado');}catch(err){toast('❌ Clave inválida');}};};iF.click();break;}
  case 'sync-boveda':completarDesdeBoveda();break;case 'sync-boveda2':sincronizarBoveda();break;case 'exp-boveda-up':exportarBovedaActualizada();break;case 'exp-boveda-pdf':exportBovedaPDF();break;case 'imp-excel':importarExcel();break;case 'exp-excel':exportarExcel();break;
  case 'exp-json':descargar('billetera_'+today()+'.json',JSON.stringify(db));break;
  case 'imp-json':{const iF=document.createElement('input');iF.type='file';iF.accept='.json';iF.onchange=async()=>{let d=null;try{d=JSON.parse(await iF.files[0].text());}catch(e){}if(!dbValida(d))return toast('❌ Respaldo inválido');db=completarDB(d);db.esSeed=false;localStorage.setItem(LS,JSON.stringify(db));evaluarDeudas();render();toast('✅ Importado');};iF.click();break;}
  case 'rest-backup':{let b=null;try{b=JSON.parse(localStorage.getItem(LS_BACKUP)||'null');}catch(e){}if(!b||!dbValida(b.db))return toast('❌ Sin copia');confirmDlg('🛟 Restaurar','¿Restaurar copia automática?',()=>{db=completarDB(b.db);db.esSeed=false;localStorage.setItem(LS,JSON.stringify(db));render();toast('✅ Restaurado');});break;}
  case 'cloud-restore':{if(!fb.user||!fb.loaded)return toast('⚠️ Primero inicia sesión en Firebase');confirmDlg('☁️ Restablecer desde la nube','Se reemplazará TODO lo de este dispositivo por la información de la nube. ¿Continuar?',async()=>{try{const m=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');const ref=m.doc(fb.dbfs,'users',fb.user.uid,'data','main');const s=await m.getDoc(ref);if(!s.exists())return toast('❌ No hay datos en la nube');aplicarRemoto(s.data());syncDecidido=true;iniciarSnapshot(m,ref);toast('✅ Datos restablecidos desde la nube');}catch(e){console.warn(e);toast('❌ Error al leer la nube');}});break;}
  case 'fb-save':db.fb.config=$('#fb-cfg').value.trim();save();initFB();toast('💾 Guardado');break;
  case 'fb-login':fbAuthModal(false);break;case 'fb-reg':fbAuthModal(true);break;
  case 'fb-out':import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js').then(m=>m.signOut(fb.auth));break;
  case 'reset':confirmDlg('⚠️ Borrar todo','¿Continuar?',()=>{localStorage.removeItem(LS);location.reload();});break;
 }});
document.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-ccvbtn]');if(!b)return;const t=db.tarjetas.find(x=>x.id===b.dataset.ccvbtn);const s=document.getElementById('ccv-'+b.dataset.ccvbtn);if(t&&s)s.textContent=t.ccv||'•••';});
const ocultarCcv=()=>{$$('.ccv-oculto').forEach(s=>s.textContent='•••');};
document.addEventListener('pointerup',ocultarCcv);
document.addEventListener('pointercancel',ocultarCcv);
document.addEventListener('pointerout',e=>{if(e.target.closest&&e.target.closest('[data-ccvbtn]'))ocultarCcv();});
async function completarDesdeBoveda(){
 let obj=null;
 try{const r=await fetch('https://ricardocarvajalnavarrete-commits.github.io/boveda-bancaria/boveda_cifrada.json',{cache:'no-store'});if(r.ok)obj=limpiarKeys(await r.json());}catch(e){}
 if(!obj||!obj.data||!obj.salt||!obj.iv){
  toast('📁 Selecciona boveda_cifrada.json de tu equipo');
  obj=await new Promise(res=>{const i=document.createElement('input');i.type='file';i.accept='.json';let done=false;const fin=v=>{if(!done){done=true;res(v);}};i.onchange=async()=>{try{fin(limpiarKeys(JSON.parse(await i.files[0].text())));}catch(e){fin(null);}};i.click();setTimeout(()=>fin(null),120000);});
 }
 if(!obj||!obj.data||!obj.salt||!obj.iv)return toast('❌ No se encontró la bóveda');
 openModal('🔐 Completar desde Bóveda',`<form id="frm_cb">${inp('cb_pw','Contraseña de la bóveda','','password','required')}<p class="mut">Completará los números •••• de tarjetas y cuentas con los datos de la bóveda y limpiará duplicados exactos.</p><div class="frm-btns"><button class="btn pri">🔄 Completar</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_cb').onsubmit=async e=>{
  e.preventDefault();
  const datos=await descifrarBoveda(obj,$('#cb_pw').value);
  if(!datos)return toast('❌ Clave no coincide');
  const regs=normalizarBoveda(datos);
  window._bovedaRegs=regs;window._bovedaPass=$('#cb_pw').value;
  const digits=s=>String(s||'').replace(/\D/g,'');
  const last4=s=>digits(s).slice(-4);
  const normP=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  const usados=new Set();
  let act=0,nue=0;
  regs.forEach(r=>{
   if(!r.numero)return;
   const esCuenta=/cuenta|l[ií]nea/i.test(r.tipo)&&!/tarjeta/i.test(r.tipo);
   const lista=esCuenta?db.cuentas:db.tarjetas;
   let hit=lista.find(x=>!usados.has(x)&&digits(x.numero)===digits(r.numero)&&normP(x.persona)===normP(r.titular));
   if(!hit)hit=lista.find(x=>!usados.has(x)&&last4(x.numero)===last4(r.numero)&&normP(x.persona)===normP(r.titular));
   if(hit){
    usados.add(hit);
    if(String(hit.numero)!==String(r.numero)){hit.numero=r.numero;act++;}
    if(r.banco){if(esCuenta)hit.banco=hit.banco||r.banco;else hit.entidad=hit.entidad||r.banco;}
if(r.vence&&!hit.venc)hit.venc=r.vence;
    if(r.ccv)hit.ccv=r.ccv;
if(r.formato&&!hit.formato)hit.formato=r.formato;
    if(r.notas&&!hit.nombre)hit.nombre=r.notas;   }else{
    if(esCuenta)db.cuentas.push({id:uid(),persona:r.titular||db.personas[0],banco:r.banco||'',tipo:r.tipo||'Cuenta Corriente',numero:r.numero,moneda:'CLP',estado:'Activa',nombre:r.notas||'',saldo:null,archivada:false});
    else db.tarjetas.push({id:uid(),persona:r.titular||db.personas[0],entidad:r.banco||'',tipo:r.tipo||'Tarjeta Débito',formato:r.formato||'Física',numero:r.numero,venc:r.vence||'',ccv:r.ccv||'',nombre:r.notas||'',archivada:false});
    nue++;
   }
  });
  const dedup=lista=>{const vistos={};return lista.filter(x=>{const k=normP(x.persona)+'|'+digits(x.numero)+'|'+(x.vinculadaCuentaId||'');if(!digits(x.numero))return true;if(vistos[k])return false;vistos[k]=true;return true;});};
  const tA=db.tarjetas.length,cA=db.cuentas.length;
  db.tarjetas=dedup(db.tarjetas);
  db.cuentas=dedup(db.cuentas);
  const dup=tA-db.tarjetas.length+cA-db.cuentas.length;
  save();closeModal();render();
  toast('✅ Bóveda: '+act+' números completados · '+nue+' nuevos · '+dup+' duplicados limpiados');
 };
}
function upsertBoveda(esCuenta,r){
 if(!window._bovedaRegs)return;
 const digits=s=>String(s||'').replace(/\D/g,'');
 const normP=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
 const rec=esCuenta?{titular:r.persona,tipo:r.tipo,formato:'',banco:r.banco,numero:r.numero,vence:'',ccv:'',notas:r.nombre||''}:{titular:r.persona,tipo:r.tipo,formato:r.formato||'Física',banco:r.entidad,numero:r.numero,vence:r.venc||'',ccv:r.ccv||'',notas:r.nombre||''};
 let hit=window._bovedaRegs.find(x=>digits(x.numero)&&digits(x.numero)===digits(r.numero));
 if(!hit)hit=window._bovedaRegs.find(x=>digits(x.numero).slice(-4)===digits(r.numero).slice(-4)&&normP(x.titular)===normP(r.persona));
 if(hit)Object.assign(hit,rec);else window._bovedaRegs.push(rec);
}
async function exportarBovedaActualizada(){
 if(!window._bovedaRegs)return toast('⚠️ Primero pulsa 🔄 Actualizar y desbloquea la bóveda');
 let pass=window._bovedaPass;if(!pass){pass=prompt('Contraseña de la bóveda:');if(!pass)return;}
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const km=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);
 const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:100000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['encrypt']);
 const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(window._bovedaRegs)));
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({salt:[...salt],iv:[...iv],data:[...new Uint8Array(ct)]})],{type:'application/json'}));a.download='boveda_cifrada.json';a.click();
 toast('⬇️ boveda_cifrada.json descargado: súbelo al repo boveda-bancaria');
}
/* ============================== PWA / ARRANQUE ============================== */
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#install-banner').classList.remove('hidden');});
function installApp(){if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.then(()=>{deferredPrompt=null;$('#install-banner').classList.add('hidden');});if('Notification'in window&&Notification.permission==='default')Notification.requestPermission();}else toast('📱 Usa el menú del navegador → "Instalar app"');}
$('#install-btn').onclick=installApp;
$('#install-x').onclick=()=>$('#install-banner').classList.add('hidden');
window.addEventListener('appinstalled',()=>{$('#install-banner').classList.add('hidden');toast('🎉 ¡App instalada!');if('Notification'in window&&Notification.permission==='default')Notification.requestPermission();});
function doUnlock(){unlocked=true;$('#lock-screen').classList.add('hidden');$('#app').classList.remove('hidden');render();revisarRecordatorios();aplicarAportesMes();}
async function tryUnlock(){const p=$('#lock-pass').value;const h=await hashPass(p,new Uint8Array(db.auth.salt));if(JSON.stringify(h)===JSON.stringify(db.auth.hash))doUnlock();else $('#lock-err').textContent='Contraseña incorrecta';}
function showBioButton(){if(!localStorage.getItem('billetera_bio')||$('#lock-bio'))return;const b=document.createElement('button');b.id='lock-bio';b.className='btn pri';b.style.marginTop='8px';b.textContent='👆 Huella / Face ID';b.onclick=async()=>{try{if(await bioUnlock())doUnlock();}catch(e){$('#lock-err').textContent='Huella no reconocida';}};$('.lock-card').insertBefore(b,$('#lock-btn'));}
document.querySelector('#btn-lock').onclick=()=>{if(!db.auth)return toast('Sin contraseña');unlocked=false;$('#app').classList.add('hidden');$('#lock-screen').classList.remove('hidden');};
$('#lock-btn').onclick=tryUnlock;
$('#lock-pass').addEventListener('keydown',e=>{if(e.key==='Enter')tryUnlock();});
init();renderNav();migrarComprobantes();
if(db.auth&&!unlocked){$('#lock-screen').classList.remove('hidden');showBioButton();bioUnlock().then(ok=>{if(ok)doUnlock();}).catch(()=>{});}
else{unlocked=true;$('#lock-screen').classList.add('hidden');$('#app').classList.remove('hidden');render();revisarRecordatorios();aplicarAportesMes();}
initFB();

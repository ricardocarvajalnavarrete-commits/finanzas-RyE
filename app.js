console.log('👛 Billetera v3 — archivo completo consolidado');
'use strict';
/* ============================== UTILIDADES ============================== */
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

/* ============================== DATOS BASE ============================== */
function seed(){
 const A=(id,tipo,nombre)=>({id,tipo,nombre});
 const D=o=>Object.assign({id:uid(),pagadoHistorico:0,archivada:false,notas:''},o);
 const C=(persona,banco,tipo,numero,moneda='CLP',estado='Activa',nombre='')=>({id:uid(),persona,banco,tipo,numero,moneda,estado,nombre,saldo:null,archivada:false});
 const T=(persona,entidad,tipo,formato,numero,venc='')=>({id:uid(),persona,entidad,tipo,formato,numero,venc,archivada:false});
 return {
  updatedAt:Date.now(), auth:null, fb:{config:'',activo:false},
  ajustes:{diasAviso:5},
  personas:['Ricardo','Elías'],
  categorias:['Alimentación','Transporte','Salud','Educación','Hogar y servicios','Entretención','Vestuario','Deudas','Ahorro','Otros'],
  acreedores:[
   A('a1','financiera','Banco Falabella'),A('a2','financiera','BancoEstado'),A('a14','financiera','Banco Itaú'),
   A('a15','financiera','Scotiabank'),A('a16','financiera','Banco Santander'),A('a17','financiera','Banco BCI'),
   A('a18','financiera','Banco Bice'),A('a19','financiera','Banco Ripley'),A('a20','financiera','Banco Consorcio'),
   A('a3','empresa','La Polar'),A('a4','empresa','ABC Din'),A('a5','empresa','Líder Servicios Financieros'),
   A('a6','empresa','SalcoBrand'),A('a7','empresa','Unimarc'),A('a8','empresa','Hites'),A('a9','empresa','Mercado Pago'),
   A('a10','empresa','Enel'),A('a11','empresa','Aguas Andinas'),A('a12','empresa','Entel'),A('a13','empresa','MetroMuv'),
   A('a21','empresa','Tenpo'),A('a22','empresa','Copec Pay'),A('a23','empresa','Global 66'),A('a24','empresa','Prex'),
   A('a25','empresa','Tapp Caja Los Andes'),A('a26','empresa','Coopeuch'),A('a27','empresa','Prepago Los Héroes'),
   A('a28','empresa','GGCC Edificio'),A('a29','empresa','YouTube'),A('a30','empresa','Microsoft'),A('a31','empresa','Google'),A('a32','empresa','Zapping TV')
  ],
  deudas:[
   D({nombre:'CMR Ricardo',tipoDeuda:'Tarjeta de Crédito',conTipo:'financiera',acreedorId:'a1',persona:'Ricardo',montoTotal:131051,saldoTotal:131051,montoFacturadoMes:149520,tienePagoMinimo:true,pagoMinimo:34435,vencimiento:'2026-05-05',sinVencimiento:false,estado:'vigente'}),
   D({nombre:'CMR Elías',tipoDeuda:'Tarjeta de Crédito',conTipo:'financiera',acreedorId:'a1',persona:'Elías',montoTotal:207650,saldoTotal:207650,montoFacturadoMes:218070,tienePagoMinimo:true,pagoMinimo:74480,vencimiento:'2026-04-10',sinVencimiento:false,estado:'vigente'}),
   D({nombre:'Visa Smart+ BancoEstado',tipoDeuda:'Tarjeta de Crédito',conTipo:'financiera',acreedorId:'a2',persona:'Elías',montoTotal:628222,saldoTotal:0,montoFacturadoMes:628222,tienePagoMinimo:false,pagoMinimo:null,vencimiento:'2026-05-12',sinVencimiento:false,estado:'pagada',fechaPago:'2026-05-10'}),
   D({nombre:'La Polar Visa',tipoDeuda:'Tarjeta de Crédito',conTipo:'empresa',acreedorId:'a3',persona:'Ricardo',montoTotal:1121059,saldoTotal:1121059,montoFacturadoMes:283797,tienePagoMinimo:true,pagoMinimo:283797,vencimiento:'2026-05-04',sinVencimiento:false,estado:'vigente'}),
   D({nombre:'ABC Visa',tipoDeuda:'Tarjeta de Crédito',conTipo:'empresa',acreedorId:'a4',persona:'Ricardo',montoTotal:3176780,saldoTotal:3176780,montoFacturadoMes:374520,tienePagoMinimo:true,pagoMinimo:374520,vencimiento:'2026-05-01',sinVencimiento:false,estado:'vigente'}),
   D({nombre:'Líder BCI',tipoDeuda:'Tarjeta de Crédito',conTipo:'empresa',acreedorId:'a5',persona:'Ricardo',montoTotal:4268613,saldoTotal:4268613,montoFacturadoMes:465654,tienePagoMinimo:true,pagoMinimo:327010,vencimiento:'2026-05-09',sinVencimiento:false,estado:'vigente'}),
   D({nombre:'SB Pay',tipoDeuda:'Tarjeta de Crédito',conTipo:'empresa',acreedorId:'a6',persona:'Ricardo',montoTotal:1712037,saldoTotal:1712037,montoFacturadoMes:95231,tienePagoMinimo:true,pagoMinimo:95231,vencimiento:'2026-06-06',sinVencimiento:false,estado:'vigente'}),
   D({nombre:'Unipay Elías',tipoDeuda:'Tarjeta de Crédito',conTipo:'empresa',acreedorId:'a7',persona:'Elías',montoTotal:35553,saldoTotal:35553,montoFacturadoMes:35553,tienePagoMinimo:false,pagoMinimo:null,vencimiento:null,sinVencimiento:true,estado:'morosa'}),
   D({nombre:'Unipay Ricardo',tipoDeuda:'Tarjeta de Crédito',conTipo:'empresa',acreedorId:'a7',persona:'Ricardo',montoTotal:82119,saldoTotal:82119,montoFacturadoMes:82119,tienePagoMinimo:false,pagoMinimo:null,vencimiento:null,sinVencimiento:true,estado:'morosa'}),
   D({nombre:'Hites Elías',tipoDeuda:'Tarjeta de Crédito',conTipo:'empresa',acreedorId:'a8',persona:'Elías',montoTotal:339960,saldoTotal:339960,montoFacturadoMes:14165,tienePagoMinimo:true,pagoMinimo:14165,vencimiento:'2026-06-05',sinVencimiento:false,estado:'vigente'}),
   D({nombre:'Hites Ricardo',tipoDeuda:'Tarjeta de Crédito',conTipo:'empresa',acreedorId:'a8',persona:'Ricardo',montoTotal:192233,saldoTotal:192233,montoFacturadoMes:15374,tienePagoMinimo:true,pagoMinimo:15374,vencimiento:'2026-06-05',sinVencimiento:false,estado:'morosa'}),
   D({nombre:'Mercado Pago (sin tarjeta)',tipoDeuda:'Tarjeta de Crédito',conTipo:'empresa',acreedorId:'a9',persona:'Ricardo',montoTotal:39990,saldoTotal:39990,montoFacturadoMes:14000,tienePagoMinimo:true,pagoMinimo:14000,vencimiento:'2026-05-04',sinVencimiento:false,estado:'morosa'}),
   D({nombre:'Línea de Crédito Banco Falabella',tipoDeuda:'Línea de Crédito',conTipo:'financiera',acreedorId:'a1',persona:'Ricardo',montoTotal:250000,saldoTotal:249237,montoFacturadoMes:249237,tienePagoMinimo:false,pagoMinimo:null,vencimiento:null,sinVencimiento:true,estado:'vigente'}),
   D({nombre:'Crédito BancoEstado Elías',tipoDeuda:'Crédito de Consumo',conTipo:'financiera',acreedorId:'a2',persona:'Elías',montoTotal:751300,saldoTotal:751300,montoFacturadoMes:68300,tienePagoMinimo:true,pagoMinimo:68300,vencimiento:'2026-07-10',sinVencimiento:false,estado:'vigente',notas:'Cuota 1 de 11 · PAC Cuenta RUT'}),
   D({nombre:'Enel — Junio',tipoDeuda:'Servicio',conTipo:'empresa',acreedorId:'a10',persona:'Ambos',montoTotal:75282,saldoTotal:75282,montoFacturadoMes:75282,tienePagoMinimo:false,pagoMinimo:null,vencimiento:'2026-06-10',sinVencimiento:false,estado:'vigente'}),
   D({nombre:'Aguas Andinas — Mayo',tipoDeuda:'Servicio',conTipo:'empresa',acreedorId:'a11',persona:'Ambos',montoTotal:8070,saldoTotal:8070,montoFacturadoMes:8070,tienePagoMinimo:false,pagoMinimo:null,vencimiento:'2026-05-15',sinVencimiento:false,estado:'vigente'}),
   D({nombre:'GGCC Depto — Mayo',tipoDeuda:'Servicio',conTipo:'empresa',acreedorId:'a28',persona:'Ambos',montoTotal:72428,saldoTotal:72428,montoFacturadoMes:72428,tienePagoMinimo:false,pagoMinimo:null,vencimiento:'2026-05-15',sinVencimiento:false,estado:'vigente'}),
   D({nombre:'GGCC Bodega — Mayo',tipoDeuda:'Servicio',conTipo:'empresa',acreedorId:'a28',persona:'Ambos',montoTotal:5099,saldoTotal:5099,montoFacturadoMes:5099,tienePagoMinimo:false,pagoMinimo:null,vencimiento:'2026-05-15',sinVencimiento:false,estado:'vigente'})
  ],
  pagos:[{id:uid(),deudaId:'d-smart',deuda:'Visa Smart+ BancoEstado',persona:'Elías',fecha:'2026-05-10',monto:628222,tipo:'PAGO FACTURADO',archivado:false}],
  cuentas:[
   C('Ricardo','Banco Estado','Cuenta RUT','13328405'),C('Ricardo','Banco Estado','Cuenta Corriente','34800034436'),
   C('Ricardo','Banco Estado','Cuenta de Ahorro','34861310495','CLP','Activa','AHORRO PREMIUM'),
   C('Ricardo','Banco Estado','Cuenta de Ahorro','34861322809','CLP','Activa','Plazo Vivienda Giro Diferido'),
   C('Ricardo','Banco Estado','Cuenta de Ahorro','30560122973','CLP','Activa','Platino Giro Diferido'),
   C('Ricardo','MetroMuv','Cuenta Vista','13328405','CLP','Activa','Transporte'),
   C('Ricardo','Banco Falabella','Cuenta Corriente','19990043332'),C('Ricardo','Banco Falabella','Cuenta Vista','55040174434'),
   C('Ricardo','Banco Falabella','Cuenta de Ahorro','80-370-0000799-4'),C('Ricardo','Banco Falabella','Cuenta de Ahorro','80-980-0110807-6'),
   C('Ricardo','Banco Falabella','Línea de Crédito','2-999-004333-7'),
   C('Ricardo','Scotiabank','Cuenta Corriente','983942997'),C('Ricardo','Scotiabank','Cuenta USD','90983943004','USD'),
   C('Ricardo','Scotiabank','Cuenta Corriente','986041923','CLP','Activa','Renta Diaria'),
   C('Ricardo','Scotiabank','Cuenta Corriente','992095393','CLP','Activa','Renta Plus'),
   C('Ricardo','Banco Santander','Cuenta Vista','1708224738'),C('Ricardo','Banco Bice','Cuenta Vista','989037814'),
   C('Ricardo','Banco Bice','Cuenta de Ahorro','140107514','CLP','Activa','Cuenta Digital'),
   C('Ricardo','Banco Consorcio','Cuenta Corriente','4310275011'),C('Ricardo','Banco Itaú','Cuenta Corriente','1332840500','CLP','Activa','Cuenta Itu'),
   C('Ricardo','Banco Ripley','Cuenta Corriente','4016071861'),C('Ricardo','Banco BCI/Mach','Cuenta Corriente','777913328405'),
   C('Ricardo','Mercado Pago','Cuenta Vista','1079195851'),C('Ricardo','Tenpo','Cuenta Vista','111113328405'),
   C('Ricardo','Tapp','Cuenta Vista','13328405'),C('Ricardo','Prepago Los Héroes','Cuenta Vista','113328405','CLP','Inactiva'),
   C('Ricardo','Copec Pay','Cuenta Vista','11332840501'),C('Ricardo','Coopeuch','Cuenta Vista','200821959'),
   C('Ricardo','Global 66','Cuenta Vista','11346403'),C('Ricardo','Prex','Cuenta Vista','10020014'),
   C('Elías','Banco Estado','Cuenta RUT','13145464'),
   C('Elías','Banco Estado','Cuenta de Ahorro','33861413581','CLP','Activa','Plazo Vivienda Giro Diferido'),
   C('Elías','Banco Estado','Cuenta de Ahorro','12860143761','CLP','Activa','Platino Giro Diferido'),
   C('Elías','Banco Falabella','Cuenta Corriente','15410133564'),C('Elías','Banco Falabella','Línea de Crédito','2-541-013356-9'),
   C('Elías','Scotiabank','Cuenta Corriente','983977677'),C('Elías','Scotiabank','Cuenta USD','90983977685','USD'),
   C('Elías','Scotiabank','Cuenta Corriente','986042660','CLP','Activa','Renta Diaria'),
   C('Elías','Banco BCI/Mach','Cuenta Corriente','777913145464'),C('Elías','Banco Santander','Cuenta Vista','5613145464','CLP','Bloqueada'),
   C('Elías','Mercado Pago','Cuenta Vista','1005941552'),C('Elías','Copec Pay','Cuenta Vista','11314546401'),
   C('Elías','Global 66','Cuenta Vista','13308434'),C('Elías','Tapp Caja Los Andes','Cuenta Vista','13145464'),
   C('Elías','Prepago Los Héroes','Cuenta Vista','113145464'),C('Elías','Tenpo','Cuenta Vista','111113145464'),
   C('Elías','MetroMuv','Cuenta Vista','13145464')
  ],
  tarjetas:[
   T('Ricardo','Banco Falabella','Tarjeta Crédito','Física','•••• •••• •••• 3978','08/27'),
   T('Elías','Banco Falabella','Tarjeta Crédito','Física','•••• •••• •••• 4866','04/30'),
   T('Ricardo','Banco Falabella','Tarjeta Débito','Virtual','•••• •••• •••• 8939','03/28'),
   T('Ricardo','Banco Falabella','Tarjeta Débito','Virtual','•••• •••• •••• 1731','03/29'),
   T('Ricardo','BancoEstado','Tarjeta Débito','Virtual','•••• •••• •••• 0508','10/29'),
   T('Ricardo','BancoEstado','Tarjeta Débito','Virtual','•••• •••• •••• 0508','01/29'),
   T('Ricardo','Scotiabank','Tarjeta Débito','Física','•••• •••• •••• 8972','09/26'),
   T('Ricardo','Scotiabank','Tarjeta Débito','Virtual','•••• •••• •••• 7461','09/26'),
   T('Ricardo','Banco Santander','Tarjeta Débito','Física','•••• •••• •••• 0015','01/28'),
   T('Ricardo','Banco Bice','Tarjeta Débito','Física','•••• •••• •••• 7320','09/28'),
   T('Ricardo','Banco Consorcio','Tarjeta Débito','Física','•••• •••• •••• 0159','10/28'),
   T('Ricardo','Banco Ripley','Tarjeta Débito','Física','•••• •••• •••• 3551','05/32'),
   T('Ricardo','Banco Itaú','Tarjeta Débito','Virtual','•••• •••• •••• 3895','03/32'),
   T('Ricardo','Banco BCI/Mach','Tarjeta Débito','Virtual','•••• •••• •••• 7995','07/31'),
   T('Ricardo','MetroMuv','Tarjeta Prepago','Física','•••• •••• •••• 6388','12/30'),
   T('Ricardo','MetroMuv','Tarjeta Prepago','Virtual','•••• •••• •••• 1350','01/30'),
   T('Ricardo','Tenpo','Tarjeta Prepago','Física','•••• •••• •••• 9106','02/27'),
   T('Ricardo','Tapp Caja Los Andes','Tarjeta Prepago','Física','•••• •••• •••• 2917','04/28'),
   T('Elías','Tapp Caja Los Andes','Tarjeta Prepago','Física','•••• •••• •••• 0315','06/29'),
   T('Ricardo','Copec Pay','Tarjeta Prepago','Física','•••• •••• •••• 2737','12/28'),
   T('Elías','Copec Pay','Tarjeta Prepago','Física','•••• •••• •••• 9232','06/29'),
   T('Ricardo','Mercado Pago','Tarjeta Prepago','Física','•••• •••• •••• 5417','11/27'),
   T('Elías','Mercado Pago','Tarjeta Prepago','Física','•••• •••• •••• 7422','11/27'),
   T('Ricardo','Global 66','Tarjeta Prepago','Física','•••• •••• •••• 1997','09/29'),
   T('Elías','Global 66','Tarjeta Prepago','Física','•••• •••• •••• 6208','11/29'),
   T('Ricardo','Prex','Tarjeta Prepago','Virtual','•••• •••• •••• 5711','02/31')
  ],
  ingresos:[],
  gastos:[
   {id:uid(),persona:'Ambos',categoria:'Hogar y servicios',descripcion:'Arriendo Depto',monto:325000,fecha:'2026-05-04'},
   {id:uid(),persona:'Ambos',categoria:'Hogar y servicios',descripcion:'Arriendo Bodega',monto:38710,fecha:'2026-04-30'},
   {id:uid(),persona:'Ambos',categoria:'Hogar y servicios',descripcion:'GGCC Depto',monto:72428,fecha:'2026-05-15'},
   {id:uid(),persona:'Ambos',categoria:'Hogar y servicios',descripcion:'GGCC Bodega',monto:5099,fecha:'2026-05-15'},
   {id:uid(),persona:'Ambos',categoria:'Hogar y servicios',descripcion:'Internet Entel',monto:18490,fecha:'2026-04-30'},
   {id:uid(),persona:'Ambos',categoria:'Hogar y servicios',descripcion:'Celulares Entel',monto:18110,fecha:'2026-04-30'},
   {id:uid(),persona:'Ambos',categoria:'Entretención',descripcion:'Zapping TV',monto:19900,fecha:'2026-05-02'},
   {id:uid(),persona:'Ambos',categoria:'Entretención',descripcion:'YouTube Premium',monto:11000,fecha:'2026-05-02'},
   {id:uid(),persona:'Ricardo',categoria:'Hogar y servicios',descripcion:'Microsoft 360',monto:10490,fecha:'2026-05-01'},
   {id:uid(),persona:'Ricardo',categoria:'Hogar y servicios',descripcion:'Google One',monto:1790,fecha:'2026-05-02'}
  ],
  presupuestos:[{categoria:'Alimentación',limite:450000},{categoria:'Transporte',limite:150000},{categoria:'Hogar y servicios',limite:550000},{categoria:'Entretención',limite:80000},{categoria:'Salud',limite:100000}],
  metas:[]
 };
}

/* ============================== ESTADO ============================== */
const LS='billetera_familiar_v1';
let db=null, curView='dashboard', unlocked=false, showNums=false, deudaFilter='todas', deudaVerArch=false, pagoVerArch=false;
function load(){try{const s=localStorage.getItem(LS);return s?JSON.parse(s):null;}catch(e){return null;}}
function save(){db.updatedAt=Date.now();localStorage.setItem(LS,JSON.stringify(db));pushFB();}
function init(){db=load()||seed();localStorage.setItem(LS,JSON.stringify(db));evaluarDeudas();}

/* ============================== LÓGICA DE DEUDAS ============================== */
const debtById=id=>db.deudas.find(d=>d.id===id);
const acById=id=>db.acreedores.find(a=>a.id===id);
const minPago=d=>(d.tienePagoMinimo&&Number(d.pagoMinimo)>0)?Number(d.pagoMinimo):(Number(d.montoFacturadoMes)||0);
function abonosCiclo(d){
 if(d.sinVencimiento||!d.vencimiento)return d.abonadoTotal||0;
 const desde=addMonth(d.vencimiento,-1);
 return db.pagos.filter(p=>p.deudaId===d.id&&p.fecha>=desde).reduce((s,p)=>s+(Number(p.monto)||0),0);
}
function cicloRestante(d){
 if(d.sinVencimiento)return Math.max(0,(Number(d.montoTotal)||0)-(d.abonadoTotal||0));
 return Math.max(0,minPago(d)-abonosCiclo(d));
}
function saldoFacturado(d){
 return Math.max(0,(Number(d.montoFacturadoMes)||0)-abonosCiclo(d));
}
function saldoTotalPendiente(d){
 const pagado=db.pagos.filter(p=>p.deudaId===d.id).reduce((s,p)=>s+(Number(p.monto)||0),0);
 return Math.max(0,(Number(d.montoTotal)||0)-pagado);
}
function diasMora(d){return (d.estado==='morosa'&&d.vencimiento)?Math.max(0,days(d.vencimiento,today())):null;}
function moraChip(d){
 const n=diasMora(d); if(n===null)return '';
 const cls=n<30?'mora-y':n<60?'mora-o':'mora-r';
 return `<span class="mora ${cls}">⏱ ${n} día${n===1?'':'s'} de mora</span>`;
}
function evaluarDeudas(){
 let cambio=false;
 for(const d of db.deudas){
  if(d.estado==='pagada'||d.sinVencimiento||!d.vencimiento)continue;
  const vencido=d.vencimiento<today();
  if(vencido&&abonosCiclo(d)<minPago(d)&&d.estado!=='morosa'){d.estado='morosa';cambio=true;}
  else if(!vencido&&d.estado==='morosa'){d.estado='vigente';cambio=true;}
 }
 if(cambio)save();
}
function registrarPago(id,fecha,monto){
 const d=debtById(id); if(!d)return;
 monto=Math.round(Number(monto));
 const min=d.sinVencimiento?cicloRestante(d):minPago(d);
 const fact=Number(d.montoFacturadoMes)||0;
 let tipo;
 if(monto<min)tipo='ABONO';
 else if(fact>0&&monto>=fact)tipo='PAGO FACTURADO';
 else if(monto>min)tipo='PAGO SUPERIOR AL PAGO MINIMO E INFERIOR AL PAGO MENSUAL';
 else tipo='PAGO MINIMO';
 db.pagos.unshift({id:uid(),deudaId:d.id,deuda:d.nombre,persona:d.persona,fecha,monto,tipo,archivado:false});
 d.pagadoHistorico=(d.pagadoHistorico||0)+monto;
 d.saldoTotal=Math.max(0,(d.saldoTotal??d.montoTotal)-monto);
 if(tipo==='ABONO'){
  if(d.sinVencimiento){d.abonadoTotal=(d.abonadoTotal||0)+monto;}
  else{d.estado=(d.vencimiento&&d.vencimiento<today()&&abonosCiclo(d)<minPago(d))?'morosa':'vigente';}
 }else{
  d.estado='pagada'; d.fechaPago=fecha;
 }
 save(); render();
 tipo==='ABONO'?toast('🧾 Abono registrado'):toast('✅ Pago registrado: '+tipo);
}
function confirmarPago(id,fecha,monto){
 const d=debtById(id);
 const min=d.sinVencimiento?cicloRestante(d):minPago(d);
 if(Number(monto)<min){
  showAlert('⚠️ El pago se considerará un ABONO',
   `El monto ingresado (${fmt(monto)}) es inferior al pago mínimo (${fmt(min)}). Este pago se registrará como un <b>abono a la deuda</b>; se seguirán calculando intereses si pasa la fecha de vencimiento sin pagar la diferencia respecto al pago mínimo o al monto facturado mensual, según corresponda.`,
   ()=>registrarPago(id,fecha,monto));
 }else registrarPago(id,fecha,monto);
}

/* ============================== UI BASE ============================== */
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.add('hidden'),2600);}
function openModal(title,body){$('#modal-root').innerHTML=`<div class="modal-back" id="mb"><div class="modal"><div class="row between"><h3>${title}</h3><button class="btn icon" data-act="close-modal">✕</button></div>${body}</div></div>`;
 $('#mb').addEventListener('click',e=>{if(e.target.id==='mb')closeModal();});}
function closeModal(){$('#modal-root').innerHTML='';}
function showAlert(title,msg,onOk){openModal(title,`<p>${msg}</p><div class="frm-btns"><button class="btn pri" id="al-ok">OK</button></div>`);$('#al-ok').onclick=()=>{closeModal();onOk&&onOk();};}
function confirmDlg(title,msg,onYes){openModal(title,`<p>${msg}</p><div class="frm-btns"><button class="btn warn" id="cf-yes">Sí, continuar</button><button class="btn" data-act="close-modal">Cancelar</button></div>`);$('#cf-yes').onclick=()=>{closeModal();onYes();};}

const VIEWS=[['dashboard','🏠','Inicio'],['deudas','💳','Deudas'],['pagos','🧾','Pagos'],['acreedores','🏦','Acreedores'],['cuentas','🏛️','Cuentas'],['presupuesto','📊','Presupuesto'],['gastos','🛒','Gastos'],['metas','🎯','Metas'],['historico','📈','Histórico'],['archivo','📦','Archivo'],['ajustes','⚙️','Ajustes']];
function renderNav(){$('#mainnav').innerHTML=VIEWS.map(([v,i,l])=>`<button class="nbtn ${v===curView?'on':''}" data-act="nav" data-id="${v}">${i} ${l}</button>`).join('');}
function go(v){curView=v;renderNav();$$('.view').forEach(s=>s.classList.toggle('hidden',s.id!=='view-'+v));render();window.scrollTo({top:0});}
function render(){
 evaluarDeudas();
 ({dashboard:renderDashboard,deudas:renderDeudas,pagos:renderPagos,acreedores:renderAcreedores,cuentas:renderCuentas,
   presupuesto:renderPresupuesto,gastos:renderGastos,metas:renderMetas,historico:renderHistorico,archivo:renderArchivo,ajustes:renderAjustes}[curView]||(()=>{}))();
}

/* ============================== DASHBOARD ============================== */
function histData(){
 const map={};
 const add=(m,k,v)=>{(map[m]??={ing:0,gas:0});map[m][k]+=Number(v)||0;};
 for(const g of db.ingresos)add(mkey(g.fecha),'ing',g.monto);
 for(const g of db.gastos)add(mkey(g.fecha),'gas',g.monto);
 for(const p of db.pagos)add(mkey(p.fecha),'gas',p.monto);
 return map;
}
function balanceActual(){const h=histData();let b=0;for(const m in h)b+=h[m].ing-h[m].gas;return b;}
function renderDashboard(){
 const deudas=db.deudas.filter(d=>!d.archivada);
 const activas=deudas.filter(d=>d.estado!=='pagada');
 const morosas=activas.filter(d=>d.estado==='morosa');
 const totalDeuda=activas.reduce((s,d)=>s+(d.saldoTotal??d.montoTotal),0);
 const cuotaMes=activas.reduce((s,d)=>s+(minPago(d)||0),0);
 const m=today().slice(0,7);
 const ingMes=db.ingresos.filter(i=>mkey(i.fecha)===m).reduce((s,i)=>s+i.monto,0);
 const gasMes=db.gastos.filter(g=>mkey(g.fecha)===m).reduce((s,g)=>s+g.monto,0);
 const pagadoMes=db.pagos.filter(p=>mkey(p.fecha)===m).reduce((s,p)=>s+p.monto,0);
 const saldo=balanceActual();
 const alertas=[];
 for(const d of morosas.sort((a,b)=>diasMora(b)-diasMora(a)))alertas.push(`<div class="alert-line r">🔴 <b>${esc(d.nombre)}</b> en mora: ${diasMora(d)} días (${d.vencimiento?'venció '+dstr(d.vencimiento):'sin vencimiento'})</div>`);
 for(const d of activas.filter(d=>d.estado==='vigente'&&d.vencimiento)){const dd=days(today(),d.vencimiento);if(dd>=0&&dd<=(db.ajustes.diasAviso||5))alertas.push(`<div class="alert-line y">🟡 <b>${esc(d.nombre)}</b> vence en ${dd} día${dd===1?'':'s'} (${dstr(d.vencimiento)})</div>`);}
 const h=histData();
 for(const p of db.presupuestos){const gast=db.gastos.filter(g=>mkey(g.fecha)===m&&g.categoria===p.categoria).reduce((s,g)=>s+g.monto,0);if(p.limite>0&&gast>p.limite)alertas.push(`<div class="alert-line r">💸 Presupuesto excedido en <b>${esc(p.categoria)}</b>: ${fmt(gast)} de ${fmt(p.limite)}</div>`);}
 if(!alertas.length)alertas.push('<div class="alert-line b">✨ Sin alertas pendientes. ¡Buen trabajo!</div>');
 const consejos=[];
 const ingresoRef=ingMes||db.ingresos.slice(-3).reduce((s,i)=>s+i.monto,0)/Math.max(1,new Set(db.ingresos.map(i=>mkey(i.fecha))).size);
 if(ingresoRef>0&&cuotaMes>0){const r=cuotaMes/ingresoRef;
  consejos.push(r>0.35?`🚨 Alto endeudamiento: tus cuotas mensuales (${fmt(cuotaMes)}) representan ${(r*100).toFixed(0)}% de tus ingresos. Ideal: bajo 30%. Prioriza pagar morosas.`
   :r>0.2?`⚠️ Tus cuotas representan ${(r*100).toFixed(0)}% de los ingresos del hogar. Intenta no adquirir nuevas deudas.`
   :`✅ Carga de cuotas saludable (${(r*100).toFixed(0)}% de los ingresos).`);}
 else consejos.push('💡 Registra los ingresos de Ricardo y Elías en <b>Gastos → Ingresos</b> para recibir consejos personalizados.');
 if(morosas.length)consejos.push(`🎯 Estrategia: paga primero "${esc(morosas.sort((a,b)=>diasMora(b)-diasMora(a))[0].nombre)}" (mayor mora) para detener intereses.`);
 if(saldo>0)consejos.push(`💰 Tienes un excedente histórico de ${fmt(saldo)}. Destínalo a la deuda de mayor interés o a una meta de ahorro.`);
 consejos.push(`🛟 Meta recomendada de fondo de emergencia: ${fmt(gasMes*3||900000)} (≈ 3 meses de gastos).`);
 if(!db.metas.length)consejos.push('🎯 Crea tu primera meta de ahorro en la pestaña Metas.');
 const proms=[];const ks=Object.keys(h).sort().slice(-3);for(const k of ks)proms.push(h[k].ing-h[k].gas);
 const prom=proms.length?proms.reduce((a,b)=>a+b,0)/proms.length:0;
 let proy='';
 if(prom!==0){proy=[1,3,6,12].map(k=>`<div class="list-item"><span>Proyección a ${k} mes${k>1?'es':''}</span><b class="${saldo+prom*k<0?'err':'al-dia'}">${fmt(saldo+prom*k)}</b></div>`).join('');}
 $('#ct-dashboard').innerHTML=`
 <div class="row between"> <div class="row between"><h2>🏠 Panel de control</h2><button class="btn pri" data-act="exp-excel">📊 Descargar Excel</button></div><button class="btn pri" data-act="exp-excel">📊 Descargar Excel</button></div> <div class="grid mini">
  <div class="card kpi ${totalDeuda>0?'warn':'ok'}"><div class="lbl">Deudas activas</div><div class="val">${fmt(totalDeuda)}</div><div class="mut">${activas.length} deudas · cuota mes ${fmt(cuotaMes)}</div></div>
  <div class="card kpi ${morosas.length?'warn':'ok'}"><div class="lbl">En mora</div><div class="val">${morosas.length}</div><div class="mut">deuda morosa ${fmt(morosas.reduce((s,d)=>s+(d.saldoTotal||0),0))}</div></div>
  <div class="card kpi"><div class="lbl">Ingresos del mes</div><div class="val">${fmt(ingMes)}</div></div>
  <div class="card kpi"><div class="lbl">Gastos del mes</div><div class="val">${fmt(gasMes+pagadoMes)}</div><div class="mut">incl. pagos de deudas ${fmt(pagadoMes)}</div></div>
  <div class="card kpi ${saldo>=0?'ok':'warn'}"><div class="lbl">Balance acumulado</div><div class="val">${fmt(saldo)}</div></div>
  <div class="card kpi"><div class="lbl">Cuentas</div><div class="val">${db.cuentas.filter(c=>!c.archivada).length+db.tarjetas.filter(t=>!t.archivada).length}</div><div class="mut">productos activos</div></div>
 </div>
 <div class="card"><h3>🚨 Alertas</h3>${alertas.join('')}</div>
 <div class="card"><h3>📈 Proyección de ahorro</h3>${proy||'<p class="mut">Registra ingresos y gastos para ver proyecciones.</p>'}<p class="mut">Basada en el balance promedio de los últimos 3 meses (${fmt(prom)}/mes).</p></div>
 <div class="card"><h3>💡 Consejos financieros</h3>${consejos.map(c=>`<div class="list-item" style="display:block">${c}</div>`).join('')}</div>`;
}

/* ============================== DEUDAS ============================== */
function selAcreedor(tipo,val){
 const opts=db.acreedores.filter(a=>a.tipo===tipo).map(a=>[a.id,a.nombre]);
 opts.push(['__new','➕ Añadir nuevo…']);
 return sel('f_acreedor','Acreedor',opts,val);
}
function formDeuda(d={}){
 const ct=d.conTipo||'financiera';
 const estOpts=[['vigente','Vigente'],['morosa','Morosa'],['pagada','Pagada']].filter(o=>d.sinVencimiento?o[0]!=='morosa':true);
 return `<form id="frm_deuda">
 ${inp('f_nombre','Nombre de la deuda',d.nombre)}
 ${sel('f_con','La deuda es con',[['financiera','Con una entidad financiera (Ej. Bancos)'],['empresa','Con una empresa (Ej. servicios básicos / retail)'],['persona','Con una persona (Ej. deuda con familiar)'],['otro','Otros']],ct)}
 ${selAcreedor(ct,d.acreedorId)}
 ${sel('f_persona','Responsable',[...db.personas.map(p=>[p,p]),['Ambos','Ambos']],d.persona||db.personas[0])}
 ${sel('f_tipo','Tipo de deuda',['Tarjeta de Crédito','Línea de Crédito','Crédito de Consumo','Servicio','Préstamo','Otro'].map(t=>[t,t]),d.tipoDeuda||'Tarjeta de Crédito')}
 <div class="row2">${inp('f_total','Monto total de la deuda ($)',d.montoTotal??'','number')}${inp('f_saldo','Saldo pendiente total ($)',d.saldoTotal??'','number')}</div>
 ${inp('f_fact','Monto a pagar facturado del mes ($)',d.montoFacturadoMes??'','number')}
 <div class="chk-row"><input type="checkbox" id="f_pm_chk" ${d.tienePagoMinimo?'checked':''}><span>Pago mínimo ($)</span><input type="number" id="f_pm" value="${d.pagoMinimo??''}" ${d.tienePagoMinimo?'':'disabled'} placeholder="opcional"></div>
 <div class="row2">${inp('f_venc','Fecha de vencimiento',d.vencimiento||'','date',d.sinVencimiento?'disabled':'')}
 <label class="chk"><input type="checkbox" id="f_sinv" ${d.sinVencimiento?'checked':''}> Sin fecha de vencimiento</label></div>
 ${sel('f_estado','Estado',estOpts,d.estado||'vigente')}
 ${inp('f_notas','Notas',d.notas||'')}
 <div class="frm-btns"><button type="submit" class="btn pri">💾 Guardar</button><button type="button" class="btn" data-act="close-modal">Cancelar</button></div>
 </form>`;
}
function bindDeudaForm(orig){
 const f=$('#frm_deuda');
 $('#f_con').onchange=()=>{const cont=$('#f_acreedor');const tmp=selAcreedor($('#f_con').value,orig.acreedorId||'');const div=document.createElement('div');div.innerHTML=tmp;cont.replaceWith(div.firstChild);}
 $('#f_pm_chk').onchange=e=>$('#f_pm').disabled=!e.target.checked;
 $('#f_sinv').onchange=e=>{ $('#f_venc').disabled=e.target.checked;
   const es=$('#f_estado');const cur=es.value;
   es.innerHTML=[['vigente','Vigente'],['morosa','Morosa'],['pagada','Pagada']].filter(o=>e.target.checked?o[0]!=='morosa':true).map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
   es.value=[...es.options].some(o=>o.value===cur)?cur:'vigente';};
 f.onsubmit=e=>{
  e.preventDefault();
  const v={nombre:$('#f_nombre').value.trim(),conTipo:$('#f_con').value,acreedorId:$('#f_acreedor').value,persona:$('#f_persona').value,tipoDeuda:$('#f_tipo').value,
   montoTotal:+$('#f_total').value||0,saldoTotal:+$('#f_saldo').value||(+$('#f_total').value||0),montoFacturadoMes:+$('#f_fact').value||0,
   tienePagoMinimo:$('#f_pm_chk').checked,pagoMinimo:$('#f_pm_chk').checked?(+$('#f_pm').value||null):null,
   sinVencimiento:$('#f_sinv').checked,vencimiento:$('#f_sinv').checked?null:($('#f_venc').value||null),
   estado:$('#f_estado').value,notas:$('#f_notas').value};
  if(!v.nombre)return toast('⚠️ Escribe un nombre para la deuda');
  if(v.acreedorId==='__new')return toast('⚠️ Selecciona un acreedor válido');
  const quierePagar=v.estado==='pagada'&&orig.estado!=='pagada';
  if(quierePagar)v.estado=orig.estado||'vigente';
  let id=orig.id;
  if(id){Object.assign(debtById(id),v);}else{id=uid();db.deudas.push(Object.assign({id,pagadoHistorico:0,abonadoTotal:0,archivada:false},v));}
  save();closeModal();render();toast('💾 Deuda guardada');
  if(quierePagar)openPagoModal(id);
 };
}
function openDeudaModal(id){const d=id?debtById(id):{};openModal(id?'✏️ Editar deuda':'➕ Nueva deuda',formDeuda(d));bindDeudaForm(d);}
function openPagoModal(id){
 const d=debtById(id); if(!d)return;
 const min=d.sinVencimiento?cicloRestante(d):minPago(d);
 openModal(`💰 Pago: ${esc(d.nombre)}`,`
  <div class="card" style="background:#f8fafc">
   <div class="list-item"><span>Monto facturado del mes</span><b>${fmt(d.montoFacturadoMes)}</b></div>
   <div class="list-item"><span>Pago mínimo</span><b>${fmt(min)}</b></div>
   <div class="list-item"><span>Abonado este ciclo</span><b>${fmt(abonosCiclo(d))}</b></div>
   <div class="list-item"><span>Saldo pago mínimo</span><b>${cicloRestante(d)<=0?'<span class="al-dia">Cuenta al Día ✅</span>':fmt(cicloRestante(d))}</b></div>
    <div class="list-item"><span>Saldo total facturado</span><b>${saldoFacturado(d)<=0?'<span class="al-dia">Cuenta al Día ✅</span>':fmt(saldoFacturado(d))}</b></div>
   <div class="list-item"><span>Saldo total pendiente deuda</span><b>${fmt(saldoTotalPendiente(d))}</b></div>  <div class="list-item"><span>Saldo total facturado</span><b>${saldoFacturado(d)<=0?'<span class="al-dia">Cuenta al Día ✅</span>':fmt(saldoFacturado(d))}</b></div>
  </div>
  <form id="frm_pago">
   <div class="row2">${inp('p_fecha','Fecha del pago',today(),'date')}${inp('p_monto','Monto pagado ($)','','number','required min="1"')}</div>
   <div class="frm-btns"><button class="btn pri" type="submit">✅ Confirmar pago</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div>
  </form>`);
 $('#frm_pago').onsubmit=e=>{e.preventDefault();const fecha=$('#p_fecha').value,monto=+$('#p_monto').value;
  if(!fecha||monto<=0)return;closeModal();confirmarPago(id,fecha,monto);};
}
function renderDeudas(){
 const orden={morosa:0,vigente:1,pagada:2};
 let list=db.deudas.filter(d=>deudaVerArch?d.archivada:!d.archivada);
 if(deudaFilter!=='todas')list=list.filter(d=>d.estado===deudaFilter);
 list.sort((a,b)=>orden[a.estado]-orden[b.estado]||(diasMora(b)||0)-(diasMora(a)||0)||(a.vencimiento||'9999')<(b.vencimiento||'9999')?-1:1);
 const cards=list.map(d=>{
  const ac=acById(d.acreedorId);
  const rest=cicloRestante(d);
  return `<div class="card debt ${d.estado==='morosa'?'m':d.estado==='pagada'?'p':''}">
   <div class="top"><span class="name">${esc(d.nombre)}</span>
    <span class="row" style="gap:6px"><span class="badge b-${d.estado}">${d.estado.toUpperCase()}</span>${moraChip(d)}${d.archivada?'<span class="chip y">📦 archivada</span>':''}</span></div>
   <div class="mut"><span class="pill-persona">${esc(d.persona)}</span> · ${esc(d.tipoDeuda)} · ${esc(ac?ac.nombre:'—')}${d.notas?' · 📝 '+esc(d.notas):''}</div>
   <div class="data">
    <span>💵 Monto total: <b>${fmt(d.montoTotal)}</b></span>
    <span>📉 Saldo deuda: <b>${fmt(d.saldoTotal??d.montoTotal)}</b></span>
    <span>🧾 Facturado del mes: <b>${fmt(d.montoFacturadoMes)}</b></span>
    <span>⬇️ Pago mínimo: <b>${d.tienePagoMinimo?fmt(d.pagoMinimo):fmt(minPago(d))+(d.tienePagoMinimo?'':' (= facturado)')}</b></span>
    <span>📅 Vencimiento: <b>${d.sinVencimiento?'Sin vencimiento':dstr(d.vencimiento)}</b></span>
    <span>👛 Saldo pago mínimo: ${d.estado==='pagada'?'<span class="al-dia">Pagada ✅</span>':rest<=0?'<span class="al-dia">Cuenta al Día ✅</span>':'<b class="err">'+fmt(rest)+'</b>'}</span>
    <span>🧮 Saldo total facturado: ${d.estado==='pagada'?'<span class="al-dia">Pagada ✅</span>':saldoFacturado(d)<=0?'<span class="al-dia">Cuenta al Día ✅</span>':'<b>'+fmt(saldoFacturado(d))+'</b>'}</span>
    <span>💼 Saldo total pendiente deuda: <b>${fmt(saldoTotalPendiente(d))}</b></span>
   </div>
   <div class="acts">
    ${d.estado!=='pagada'&&!d.archivada?`<button class="btn pri mini" data-act="pago" data-id="${d.id}">💰 Pago</button>`:''}
    ${d.estado==='pagada'&&!d.archivada?`<button class="btn soft mini" data-act="cuota" data-id="${d.id}">🔁 Cuota mes siguiente</button>`:''}
    ${!d.archivada?`<button class="btn mini" data-act="edit-deuda" data-id="${d.id}">✏️ Editar</button>
    <button class="btn mini" data-act="arch-deuda" data-id="${d.id}">📦 Archivar</button>`:`
    <button class="btn mini" data-act="rest-deuda" data-id="${d.id}">♻️ Desarchivar</button>
    <button class="btn warn mini" data-act="del-deuda" data-id="${d.id}">🗑️ Eliminar</button>`}
   </div></div>`;
 }).join('');
 $('#ct-deudas').innerHTML=`
 <div class="row between"><h2>💳 Deudas</h2>
  <span class="row"><button class="btn ${deudaVerArch?'soft':'pri'}" data-act="toggle-arch-deudas">📦 ${deudaVerArch?'Ver activas':'Ver archivadas'}</button>
  <button class="btn pri" data-act="new-deuda">➕ Nueva deuda</button></span></div>
 <div class="filters">${['todas','vigente','morosa','pagada'].map(f=>`<button class="nbtn ${deudaFilter===f?'on':''}" data-act="filter-deuda" data-id="${f}">${f==='todas'?'Todas':f[0].toUpperCase()+f.slice(1)+'s'}</button>`).join('')}</div>
 ${cards||'<div class="card"><p class="mut">No hay deudas en esta vista 🎉</p></div>'}`;
}

/* ============================== PAGOS ============================== */
function renderPagos(){
 const list=db.pagos.filter(p=>pagoVerArch?p.archivado:!p.archivado);
 const badge=t=>t==='ABONO'?'b-abono':t==='PAGO MINIMO'?'b-min':t==='PAGO FACTURADO'?'b-fact':'b-sup';
 $('#ct-pagos').innerHTML=`
 <div class="row between"><h2>🧾 Pagos <span class="mut">(solo consulta — se registran desde Deudas)</span></h2>
 <button class="btn ${pagoVerArch?'soft':'pri'}" data-act="toggle-arch-pagos">📦 ${pagoVerArch?'Ver vigentes':'Ver archivados'}</button></div>
 <div class="card tblwrap"><table><tr><th>Fecha</th><th>Deuda</th><th>Responsable</th><th>Monto</th><th>Tipo</th><th></th></tr>
 ${list.map(p=>`<tr><td>${dstr(p.fecha)}</td><td>${esc(p.deuda)}</td><td>${esc(p.persona||'')}</td><td><b>${fmt(p.monto)}</b></td><td><span class="badge ${badge(p.tipo)}">${p.tipo}</span></td>
  <td>${p.archivado?`<button class="btn mini" data-act="rest-pago" data-id="${p.id}">♻️</button><button class="btn warn mini" data-act="del-pago" data-id="${p.id}">🗑️</button>`:`<button class="btn mini" data-act="arch-pago" data-id="${p.id}">📦</button>`}</td></tr>`).join('')}
 </table>${list.length?'':'<p class="mut">Sin pagos registrados.</p>'}</div>`;
}

/* ============================== ACREEDORES ============================== */
const AC_TIPOS=[['financiera','🏦 Entidades financieras'],['empresa','🏢 Empresas'],['persona','👤 Personas'],['otro','📌 Otros']];
function renderAcreedores(){
 $('#ct-acreedores').innerHTML=`<h2>🏦 Acreedores</h2>`+AC_TIPOS.map(([t,l])=>{
  const list=db.acreedores.filter(a=>a.tipo===t);
  return `<div class="card"><div class="row between"><h3>${l}</h3><button class="btn pri mini" data-act="new-ac" data-id="${t}">➕ Añadir</button></div>
  ${list.map(a=>{const n=db.deudas.filter(d=>d.acreedorId===a.id).length;
      return `<div class="list-item"><span><b>${esc(a.nombre)}</b> <span class="mut">(${n} deuda${n===1?'':'s'})</span>${(a.nota||'')?`<div class="mut" style="font-size:.82em;margin-top:2px">📝 ${esc(a.nota)}</div>`:''}</span>
   <span class="row"><button class="btn mini" data-act="edit-ac" data-id="${a.id}">✏️</button><button class="btn warn mini" data-act="del-ac" data-id="${a.id}">🗑️</button></span></div>`;}).join('')||'<p class="mut">Sin registros.</p>'}</div>`;
 }).join('');
}
function acModal(tipo,id){
 const a=id?acById(id):{tipo,nombre:'',nota:''};
 openModal(id?'✏️ Editar acreedor':'➕ Nuevo acreedor',`<form id="frm_ac">
  ${sel('ac_tipo','Tipo',AC_TIPOS,a.tipo)}
  ${inp('ac_nom','Nombre',a.nombre)}
  <label class="fld"><span>📝 Nota (opcional)</span><textarea id="ac_nota" placeholder="Ej: contacto, teléfono, condiciones del préstamo…">${esc(a.nota||'')}</textarea></label>
  <div class="frm-btns"><button class="btn pri">💾 Guardar</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div>
 </form>`);
 $('#frm_ac').onsubmit=e=>{
  e.preventDefault();
  const nom=$('#ac_nom').value.trim(),ti=$('#ac_tipo').value,nota=$('#ac_nota').value.trim();
  if(!nom)return toast('⚠️ Escribe un nombre para el acreedor');
  if(id){a.nombre=nom;a.tipo=ti;a.nota=nota;}
  else db.acreedores.push({id:uid(),tipo:ti,nombre:nom,nota:nota});
  save();closeModal();render();toast('💾 Acreedor guardado');
 };
}
function cuentaModal(id){
 const c=id?db.cuentas.find(x=>x.id===id):{persona:db.personas[0],moneda:'CLP',estado:'Activa'};
 openModal(id?'✏️ Editar cuenta':'➕ Nueva cuenta',`<form id="frm_c">
 ${sel('c_per','Titular',db.personas.map(p=>[p,p]),c.persona)}
 ${inp('c_banco','Banco / Entidad',c.banco||'')}
 ${sel('c_tipo','Tipo',['Cuenta Corriente','Cuenta Vista','Cuenta RUT','Cuenta de Ahorro','Línea de Crédito','Cuenta USD','Otro'].map(t=>[t,t]),c.tipo||'Cuenta Corriente')}
 ${inp('c_num','N° de cuenta',c.numero||'')}
 <div class="row2">${sel('c_mon','Moneda',[['CLP','CLP'],['USD','USD']],c.moneda)}${sel('c_est','Estado',[['Activa','Activa'],['Inactiva','Inactiva'],['Bloqueada','Bloqueada']],c.estado)}</div>
 ${inp('c_sal','Saldo ($)',c.saldo??'','number')}${inp('c_nom','Nombre / uso (opcional)',c.nombre||'')}
 <div class="frm-btns"><button class="btn pri">💾 Guardar</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_c').onsubmit=e=>{e.preventDefault();const v={persona:$('#c_per').value,banco:$('#c_banco').value,tipo:$('#c_tipo').value,numero:$('#c_num').value,moneda:$('#c_mon').value,estado:$('#c_est').value,saldo:+$('#c_sal').value||null,nombre:$('#c_nom').value};
  if(id)Object.assign(c,v);else db.cuentas.push(Object.assign({id:uid(),archivada:false},v));save();closeModal();render();toast('💾 Cuenta guardada');};
}
function tarjetaModal(id){
 const t=id?db.tarjetas.find(x=>x.id===id):{persona:db.personas[0],formato:'Física',tipo:'Tarjeta Débito'};
 openModal(id?'✏️ Editar tarjeta':'➕ Nueva tarjeta',`<form id="frm_t">
 ${sel('t_per','Titular',db.personas.map(p=>[p,p]),t.persona)}
 ${inp('t_ent','Banco / Entidad',t.entidad||'')}
 ${sel('t_tipo','Tipo',['Tarjeta Débito','Tarjeta Prepago','Tarjeta Crédito'].map(x=>[x,x]),t.tipo)}
 ${sel('t_fmt','Formato',[['Física','💳 Física'],['Virtual','🌐 Virtual']],t.formato)}
 ${inp('t_num','Número',t.numero||'')}${inp('t_venc','Vencimiento (MM/AA)',t.venc||'')}
 <div class="frm-btns"><button class="btn pri">💾 Guardar</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_t').onsubmit=e=>{e.preventDefault();const v={persona:$('#t_per').value,entidad:$('#t_ent').value,tipo:$('#t_tipo').value,formato:$('#t_fmt').value,numero:$('#t_num').value,venc:$('#t_venc').value};
  if(id)Object.assign(t,v);else db.tarjetas.push(Object.assign({id:uid(),archivada:false},v));save();closeModal();render();toast('💾 Tarjeta guardada');};
}
const mask=n=>{const s=String(n||'').replace(/\s/g,'');return s.length>4?'•••• •••• '+s.slice(-4):s;};
function renderCuentas(){
 const cs=db.cuentas.filter(c=>!c.archivada), ts=db.tarjetas.filter(t=>!t.archivada);
 $('#ct-cuentas').innerHTML=`
<div class="row between"><h2>🏛️ Cuentas y tarjetas</h2><span class="row">
  <a href="https://ricardocarvajalnavarrete-commits.github.io/boveda-bancaria/" target="_blank" rel="noopener" class="btn pri">🔐 Cuentas y Tarjetas</a>  <button class="btn soft" data-act="toggle-nums">${showNums?'🙈 Ocultar números':'👁 Mostrar números'}</button>
  <button class="btn pri" data-act="new-cuenta">➕ Cuenta</button>
  <button class="btn pri" data-act="new-tarjeta">➕ Tarjeta</button></span></div>
 <div class="card"><h3>Cuentas bancarias (${cs.length})</h3><div class="tblwrap"><table>
 <tr><th>Titular</th><th>Banco</th><th>Tipo</th><th>Número</th><th>Moneda</th><th>Estado</th><th></th></tr>
 ${cs.map(c=>`<tr><td>${esc(c.persona)}</td><td>${esc(c.banco)}</td><td>${esc(c.tipo)}${c.nombre?'<br><span class="mut">'+esc(c.nombre)+'</span>':''}</td>
  <td class="mask">${showNums?esc(c.numero):mask(c.numero)}</td><td>${c.moneda}</td><td>${c.estado}</td>
  <td><button class="btn mini" data-act="edit-cuenta" data-id="${c.id}">✏️</button><button class="btn mini" data-act="arch-cuenta" data-id="${c.id}">📦</button><button class="btn warn mini" data-act="del-cuenta" data-id="${c.id}">🗑️</button></td></tr>`).join('')}
 </table></div></div>
 <div class="card"><h3>Tarjetas (${ts.length})</h3><div class="tblwrap"><table>
 <tr><th>Titular</th><th>Entidad</th><th>Tipo</th><th>Formato</th><th>Número</th><th>Vence</th><th></th></tr>
 ${ts.map(t=>`<tr><td>${esc(t.persona)}</td><td>${esc(t.entidad)}</td><td>${esc(t.tipo)}</td><td>${t.formato==='Física'?'💳':'🌐'} ${t.formato}</td>
  <td class="mask">${showNums?esc(t.numero):mask(t.numero)}</td><td>${t.venc||'—'}</td>
  <td><button class="btn mini" data-act="edit-tarjeta" data-id="${t.id}">✏️</button><button class="btn mini" data-act="arch-tarjeta" data-id="${t.id}">📦</button><button class="btn warn mini" data-act="del-tarjeta" data-id="${t.id}">🗑️</button></td></tr>`).join('')}
 </table></div><p class="mut">🔐 Por seguridad, ingresa números completos y CVV solo con la app protegida con contraseña, y usa respaldos cifrados.</p></div>`;
}

/* ============================== PRESUPUESTO ============================== */
function gastoCatMes(cat,m){return db.gastos.filter(g=>g.categoria===cat&&mkey(g.fecha)===m).reduce((s,g)=>s+g.monto,0);}
function renderPresupuesto(){
 const m=today().slice(0,7);
 $('#ct-presupuesto').innerHTML=`<div class="row between"><h2>📊 Presupuesto por categoría</h2><button class="btn pri" data-act="new-pres">➕ Categoría</button></div>
 <p class="mut">Mes actual: <b>${m}</b>. Las categorías que superen su límite se marcarán en rojo y generarán alerta.</p>`+
 db.presupuestos.map(p=>{
  const g=gastoCatMes(p.categoria,m);const pct=p.limite>0?Math.min(999,g/p.limite*100):0;const over=g>p.limite&&p.limite>0;
  return `<div class="card"><div class="row between"><b>${esc(p.categoria)} ${over?'🚨':''}</b>
   <span class="row"><button class="btn mini" data-act="edit-pres" data-id="${esc(p.categoria)}">✏️</button><button class="btn warn mini" data-act="del-pres" data-id="${esc(p.categoria)}">🗑️</button></span></div>
  <div class="progress"><i class="${over?'over':''}" style="width:${Math.min(100,pct)}%"></i></div>
  <div class="row between"><span class="${over?'err':'mut'}">Gastado: <b>${fmt(g)}</b></span><span class="mut">Límite: ${fmt(p.limite)} (${pct.toFixed(0)}%)</span></div>
  ${over?`<div class="alert-line r">⚠️ Te has pasado por ${fmt(g-p.limite)} en ${esc(p.categoria)}.</div>`:''}</div>`;}).join('');
}
function presModal(cat){
 const p=cat?db.presupuestos.find(x=>x.categoria===cat):{};
 openModal(cat?'✏️ Editar presupuesto':'➕ Nueva categoría',`<form id="frm_p">
 ${cat?inp('p_cat','Categoría',p.categoria,'text','readonly'):sel('p_cat','Categoría',db.categorias.filter(c=>!db.presupuestos.some(x=>x.categoria===c)).map(c=>[c,c]),'')}
 ${inp('p_lim','Límite mensual ($)',p.limite??'','number')}
 <div class="frm-btns"><button class="btn pri">💾 Guardar</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_p').onsubmit=e=>{e.preventDefault();const c=$('#p_cat').value,l=+$('#p_lim').value;
  if(cat){p.limite=l;}else db.presupuestos.push({categoria:c,limite:l});save();closeModal();render();toast('💾 Presupuesto guardado');};
}

/* ============================== GASTOS E INGRESOS ============================== */
let gastosMes=today().slice(0,7);
function renderGastos(){
 const ing=db.ingresos.filter(i=>mkey(i.fecha)===gastosMes).sort((a,b)=>b.fecha.localeCompare(a.fecha));
 const gas=db.gastos.filter(g=>mkey(g.fecha)===gastosMes).sort((a,b)=>b.fecha.localeCompare(a.fecha));
 const ti=ing.reduce((s,i)=>s+i.monto,0),tg=gas.reduce((s,g)=>s+g.monto,0);
 $('#ct-gastos').innerHTML=`
 <div class="row between"><h2>🛒 Gastos e ingresos</h2><input type="month" id="sel-mes" value="${gastosMes}" class="btn"></div>
 <div class="grid mini">
  <div class="card kpi ok"><div class="lbl">Ingresos ${gastosMes}</div><div class="val">${fmt(ti)}</div></div>
  <div class="card kpi ${tg>ti?'warn':''}"><div class="lbl">Gastos ${gastosMes}</div><div class="val">${fmt(tg)}</div></div>
  <div class="card kpi ${ti-tg>=0?'ok':'warn'}"><div class="lbl">Balance del mes</div><div class="val">${fmt(ti-tg)}</div></div>
 </div>
 <div class="card"><div class="row between"><h3>💵 Ingresos</h3><button class="btn pri mini" data-act="new-ing">➕ Ingreso</button></div>
 ${ing.map(i=>`<div class="list-item"><span>${dstr(i.fecha)} · ${esc(i.descripcion||'')} <span class="pill-persona">${esc(i.persona)}</span></span>
  <span class="row"><b>${fmt(i.monto)}</b><button class="btn warn mini" data-act="del-ing" data-id="${i.id}">🗑️</button></span></div>`).join('')||'<p class="mut">Sin ingresos este mes. Registra los sueldos de ambos para activar los consejos.</p>'}</div>
 <div class="card"><div class="row between"><h3>🧾 Gastos variables</h3><button class="btn pri mini" data-act="new-gasto">➕ Gasto</button></div>
 ${gas.map(g=>`<div class="list-item"><span>${dstr(g.fecha)} · ${esc(g.descripcion||'')} <span class="badge b-tipo">${esc(g.categoria)}</span> <span class="pill-persona">${esc(g.persona)}</span></span>
  <span class="row"><b>${fmt(g.monto)}</b><button class="btn warn mini" data-act="del-gasto" data-id="${g.id}">🗑️</button></span></div>`).join('')||'<p class="mut">Sin gastos este mes.</p>'}</div>`;
 $('#sel-mes').onchange=e=>{gastosMes=e.target.value;renderGastos();};
}
function ingModal(){
 openModal('➕ Nuevo ingreso',`<form id="frm_i">${sel('i_per','Persona',[...db.personas.map(p=>[p,p]),['Ambos','Ambos']],db.personas[0])}
 ${inp('i_des','Descripción','Sueldo ')}${inp('i_mon','Monto ($)','','number')}${inp('i_fec','Fecha',today(),'date')}
 <div class="frm-btns"><button class="btn pri">💾 Guardar</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_i').onsubmit=e=>{e.preventDefault();db.ingresos.push({id:uid(),persona:$('#i_per').value,descripcion:$('#i_des').value,monto:+$('#i_mon').value||0,fecha:$('#i_fec').value});save();closeModal();render();toast('💾 Ingreso registrado');};
}
function gastoModal(){
 openModal('➕ Nuevo gasto',`<form id="frm_g">${sel('g_per','Persona',[...db.personas.map(p=>[p,p]),['Ambos','Ambos']],db.personas[0])}
 ${sel('g_cat','Categoría',db.categorias.map(c=>[c,c]))}${inp('g_des','Descripción','')}
 ${inp('g_mon','Monto ($)','','number')}${inp('g_fec','Fecha',today(),'date')}
 <div class="frm-btns"><button class="btn pri">💾 Guardar</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_g').onsubmit=e=>{e.preventDefault();db.gastos.push({id:uid(),persona:$('#g_per').value,categoria:$('#g_cat').value,descripcion:$('#g_des').value,monto:+$('#g_mon').value||0,fecha:$('#g_fec').value});save();closeModal();render();toast('💾 Gasto registrado');};
}

/* ============================== METAS ============================== */
function aplicarAportesMes(){
 const m=today().slice(0,7);let ok=false;
 for(const mt of db.metas){
  if(mt.autoAporte&&mt.aporteMensual>0&&mt.ultimoAporteMes!==m){
   mt.ahorrado=(mt.ahorrado||0)+mt.aporteMensual;mt.ultimoAporteMes=m;ok=true;
   db.gastos.push({id:uid(),persona:'Ambos',categoria:'Ahorro',descripcion:'Aporte automático meta: '+mt.nombre,monto:mt.aporteMensual,fecha:today()});
  }
 }
 if(ok){save();toast('🎯 Aportes automáticos aplicados al presupuesto del mes');}
}
function renderMetas(){
 $('#ct-metas').innerHTML=`<div class="row between"><h2>🎯 Metas de ahorro</h2><button class="btn pri" data-act="new-meta">➕ Nueva meta</button></div>`+
 (db.metas.filter(m=>!m.archivada).map(mt=>{
  const pct=mt.objetivo>0?Math.min(100,(mt.ahorrado||0)/mt.objetivo*100):0;
  const resto=Math.max(0,mt.objetivo-(mt.ahorrado||0));
  const mesesRest=mt.autoAporte&&mt.aporteMensual>0?Math.ceil(resto/mt.aporteMensual):null;
  return `<div class="card"><div class="row between"><b>${esc(mt.nombre)}</b>
   <span class="row"><button class="btn mini" data-act="aporte-meta" data-id="${mt.id}">💰 Aportar</button>
   <button class="btn mini" data-act="edit-meta" data-id="${mt.id}">✏️</button><button class="btn mini" data-act="arch-meta" data-id="${mt.id}">📦</button></span></div>
  <div class="progress"><i class="gold" style="width:${pct}%"></i></div>
  <div class="row between"><span><b>${fmt(mt.ahorrado||0)}</b> de ${fmt(mt.objetivo)} (${pct.toFixed(0)}%)</span>
  <span class="mut">${mt.autoAporte?`🔁 Aporte automático: ${fmt(mt.aporteMensual)}/mes${mesesRest?` · se completa en ~${mesesRest} meses`:''}`:'Aporte manual'}</span></div>
  ${pct>=100?'<div class="alert-line b">🏆 ¡Meta cumplida!</div>':''}</div>`;}).join('')||'<div class="card"><p class="mut">Crea tu primera meta (ej: fondo de emergencia, vacaciones). Puedes activar aporte automático mensual ligado al presupuesto.</p></div>');
}
function metaModal(id){
 const mt=id?db.metas.find(x=>x.id===id):{autoAporte:false};
 openModal(id?'✏️ Editar meta':'➕ Nueva meta',`<form id="frm_m">${inp('m_nom','Nombre de la meta',mt.nombre||'')}
 ${inp('m_obj','Monto objetivo ($)',mt.objetivo??'','number')}${inp('m_ah','Ahorrado hasta ahora ($)',mt.ahorrado??0,'number')}
 <div class="chk-row"><input type="checkbox" id="m_auto" ${mt.autoAporte?'checked':''}><span>Aporte automático mensual ($)</span><input type="number" id="m_ap" value="${mt.aporteMensual??''}"></div>
 <div class="frm-btns"><button class="btn pri">💾 Guardar</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_m').onsubmit=e=>{e.preventDefault();const v={nombre:$('#m_nom').value,objetivo:+$('#m_obj').value||0,ahorrado:+$('#m_ah').value||0,autoAporte:$('#m_auto').checked,aporteMensual:+$('#m_ap').value||0};
  if(id)Object.assign(mt,v);else db.metas.push(Object.assign({id:uid(),archivada:false},v));save();closeModal();render();toast('💾 Meta guardada');};
}

/* ============================== HISTÓRICO ============================== */
function renderHistorico(){
 $('#ct-historico').innerHTML=`<h2>📈 Evolución mensual</h2>
 <div class="card"><canvas id="chart"></canvas>
 <p class="mut">🟩 Ingresos · 🟥 Gastos (incluye pagos de deudas y aportes a metas).</p></div>
 <div class="card tblwrap"><table><tr><th>Mes</th><th>Ingresos</th><th>Gastos</th><th>Balance</th></tr>
 ${Object.entries(histData()).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,12).map(([m,v])=>{const b=v.ing-v.gas;
  return `<tr><td>${m}</td><td>${fmt(v.ing)}</td><td>${fmt(v.gas)}</td><td class="${b>=0?'al-dia':'err'}"><b>${fmt(b)}</b></td></tr>`;}).join('')||'<tr><td colspan="4">Sin datos aún.</td></tr>'}
 </table></div>`;
 drawChart();
}
function drawChart(){
 const cv=$('#chart');if(!cv)return;
 const rows=Object.entries(histData()).sort((a,b)=>a[0].localeCompare(b[0])).slice(-12).map(([m,v])=>({label:m.slice(2),ing:v.ing,gas:v.gas}));
 const ctx=cv.getContext('2d');const W=cv.width=cv.offsetWidth*2||700,H=cv.height=500;
 ctx.clearRect(0,0,W,H);if(!rows.length)return;
 const max=Math.max(1,...rows.map(r=>Math.max(r.ing,r.gas)));
 const pad=90,bw=(W-pad-20)/rows.length;
 ctx.font='20px sans-serif';
 for(let i=0;i<=4;i++){const y=H-70-(H-130)*i/4;ctx.strokeStyle='#e2e8f0';ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(W-10,y);ctx.stroke();ctx.fillStyle='#64748b';ctx.fillText(fmtK(max*i/4),6,y+6);}
 rows.forEach((r,i)=>{const x=pad+i*bw;
  const hI=r.ing/max*(H-130),hG=r.gas/max*(H-130);
  ctx.fillStyle='#16a34a';ctx.fillRect(x+bw*.12,H-70-hI,bw*.32,hI);
  ctx.fillStyle='#dc2626';ctx.fillRect(x+bw*.5,H-70-hG,bw*.32,hG);
  ctx.fillStyle='#475569';ctx.fillText(r.label,x+bw*.15,H-40);});
}

/* ============================== ARCHIVO ============================== */
function renderArchivo(){
 const sec=(titulo,items)=>`<div class="card"><h3>${titulo} (${items.length})</h3>${items.map(i=>i.html).join('')||'<p class="mut">Vacío.</p>'}</div>`;
 const it=(txt,act,id)=>`<div class="list-item"><span>${txt}</span><span class="row"><button class="btn mini" data-act="${act}" data-id="${id}">♻️ Desarchivar</button><button class="btn warn mini" data-act="${act.replace('rest','del')}" data-id="${id}">🗑️ Eliminar</button></span></div>`;
 $('#ct-archivo').innerHTML=`<h2>📦 Archivo</h2><p class="mut">Elementos archivados: puedes restaurarlos o eliminarlos definitivamente.</p>
 ${sec('💳 Deudas archivadas',db.deudas.filter(d=>d.archivada).map(d=>({html:it(`${esc(d.nombre)} · ${fmt(d.saldoTotal??0)}`,'rest-deuda',d.id)})))}
 ${sec('🏛️ Cuentas archivadas',db.cuentas.filter(c=>c.archivada).map(c=>({html:it(`${esc(c.banco)} · ${esc(c.tipo)} (${mask(c.numero)})`,'rest-cuenta',c.id)})))}
 ${sec('💳 Tarjetas archivadas',db.tarjetas.filter(t=>t.archivada).map(t=>({html:it(`${esc(t.entidad)} · ${esc(t.tipo)} (${mask(t.numero)})`,'rest-tarjeta',t.id)})))}
 ${sec('🧾 Pagos archivados',db.pagos.filter(p=>p.archivado).map(p=>({html:it(`${dstr(p.fecha)} · ${esc(p.deuda)} · ${fmt(p.monto)} (${p.tipo})`,'rest-pago',p.id)})))}
 ${sec('🎯 Metas archivadas',db.metas.filter(m=>m.archivada).map(m=>({html:it(esc(m.nombre),'rest-meta',m.id)})))}`;
}

/* ============================== AJUSTES ============================== */
function renderAjustes(){
 const noti=('Notification'in window)?Notification.permission:'unsupported';
 $('#ct-ajustes').innerHTML=`<h2>⚙️ Ajustes</h2>
 <div class="card"><h3>👥 Miembros del hogar</h3>${db.personas.map((p,i)=>`<div class="list-item"><input class="fld-inp" value="${esc(p)}" data-i="${i}" style="padding:7px;border:1px solid #cbd5e1;border-radius:8px;max-width:220px"></div>`).join('')}
 <button class="btn pri mini" data-act="save-personas">💾 Guardar nombres</button></div>
 <div class="card"><h3>🔐 Contraseña</h3>
 ${db.auth?'<p>✅ La app está protegida con contraseña.</p><button class="btn" data-act="chg-pass">Cambiar contraseña</button> <button class="btn warn" data-act="rm-pass">Quitar contraseña</button>'
 :'<p>Sin contraseña. Se recomienda activarla, especialmente si subes la app a internet.</p><button class="btn pri" data-act="set-pass">🔑 Establecer contraseña</button>'}</div>
 <div class="card"><h3>👆 Huella / Face ID</h3>
 <p>Estado: <b>${localStorage.getItem('billetera_bio')?'✅ activada en este dispositivo':'⚪ no activada'}</b></p>
 <p class="mut">Desbloquea la app con tu huella o Face ID solo en este celular. La contraseña sigue siendo la llave maestra para otros dispositivos y los respaldos cifrados.</p>
 <button class="btn pri" data-act="bio-on">Activar en este dispositivo</button>
 <button class="btn warn" data-act="bio-off">Desactivar</button></div>
 <div class="card"><h3>🔔 Notificaciones</h3><p>Estado: <b>${noti==='granted'?'✅ Permitidas':noti==='denied'?'❌ Bloqueadas (actívalas en el navegador)':'⚪ No solicitadas'}</b></p>
 <p class="mut">Se avisa de vencimientos próximos y deudas en mora cada vez que abres la app.</p>
 ${inp('aviso','Avisar vencimientos con anticipación (días)',db.ajustes.diasAviso??5,'number')}
 <button class="btn pri" data-act="notif-perm">🔔 Activar notificaciones</button> <button class="btn" data-act="save-aviso">Guardar días</button></div>
 <div class="card"><h3>📱 Instalar app</h3><p class="mut">En el celular: usa el menú del navegador → "Agregar a pantalla de inicio" o el banner de instalación. En iPhone: Compartir → Agregar a inicio.</p><button class="btn pri" data-act="install">📲 Instalar ahora</button></div>
 <div class="card"><h3>💾 Respaldos cifrados</h3><p class="mut">El respaldo se cifra con AES-256 usando la contraseña que elijas (formato compatible con tu bóveda).</p>
 <div class="row"><button class="btn pri" data-act="exp-cif">⬇️ Exportar respaldo cifrado</button><button class="btn" data-act="imp-cif">⬆️ Importar respaldo cifrado</button></div>
 <div class="row" style="margin-top:8px"><button class="btn pri" data-act="exp-excel">📊 Descargar consolidado Excel</button></div> <div class="row" style="margin-top:8px"><button class="btn soft" data-act="exp-json">Exportar JSON simple</button><button class="btn soft" data-act="imp-json">Importar JSON</button></div></div>
 <div class="card"><h3>☁️ Sincronización Firebase (PC ↔ celular)</h3>
 <p class="mut">Pega aquí la configuración de tu proyecto Firebase (consola → Configuración del proyecto → Tus apps → SDK). Luego habilita Authentication (correo/contraseña) y Firestore.</p>
 <textarea id="fb-cfg" placeholder='{"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}'>${esc(db.fb.config||'')}</textarea>
 <div class="row" style="margin-top:8px"><button class="btn pri" data-act="fb-save">💾 Guardar configuración</button><span id="fb-user">${fb.user?('👤 '+esc(fb.user.email)+' <button class="btn mini" data-act="fb-out">Cerrar sesión</button>'):(db.fb.config?'<button class="btn" data-act="fb-login">Iniciar sesión</button> <button class="btn soft" data-act="fb-reg">Crear cuenta</button>':'')}</span></div>
 <label class="chk"><input type="checkbox" id="fb-act" ${db.fb.activo?'checked':''} ${fb.user?'':'disabled'}> Sincronización automática activada</label>
 <p class="mut">Cuando está activa, todo lo que cambies aquí se reflejará en tus otros dispositivos (y viceversa) sin exportar/importar.</p></div>
 <div class="card"><h3>🧹 Datos</h3><button class="btn warn" data-act="reset">⚠️ Borrar todos los datos y reiniciar</button></div>`;
 const fa=$('#fb-act');if(fa)fa.onchange=e=>{db.fb.activo=e.target.checked;save();toast(db.fb.activo?'☁️ Sincronización activada':'Sincronización desactivada');};
}

/* ============================== CRIPTOGRAFÍA ============================== */
const enc=s=>new TextEncoder().encode(s), dec=b=>new TextDecoder().decode(b);
async function pbkdf2Key(pass,ssalt,use){
 const km=await crypto.subtle.importKey('raw',enc(pass),'PBKDF2',false,use);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt:ssalt,iterations:120000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function hashPass(pass,salt){
 const km=await crypto.subtle.importKey('raw',enc(pass),'PBKDF2',false,['deriveBits']);
 const b=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:120000,hash:'SHA-256'},km,256);
 return [...new Uint8Array(b)];
}
function descargar(nombre,contenido){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([contenido],{type:'application/json'}));a.download=nombre;a.click();}
function passModal(titulo,btn,cb){
 openModal(titulo,`<form id="frm_pw">${inp('pw1','Contraseña','','password')}${inp('pw2','Repite la contraseña','','password')}<div class="frm-btns"><button class="btn pri">${btn}</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_pw').onsubmit=async e=>{e.preventDefault();const a=$('#pw1').value,b=$('#pw2').value;
  if(a.length<4)return toast('⚠️ Mínimo 4 caracteres');if(a!==b)return toast('⚠️ Las contraseñas no coinciden');
  const salt=crypto.getRandomValues(new Uint8Array(16));db.auth={salt:[...salt],hash:await hashPass(a,salt)};
  save();closeModal();cb&&cb(a);toast('🔐 Contraseña guardada');};
}

/* ============================== HUELLA / FACE ID (WebAuthn) ============================== */
const b64u=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64uBuf=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const bin=atob(s);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;};
async function bioAvailable(){if(!window.PublicKeyCredential)return false;try{return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();}catch(e){return false;}}
async function bioEnroll(){
 const cred=await navigator.credentials.create({publicKey:{
  challenge:crypto.getRandomValues(new Uint8Array(32)),
  rp:{name:'Billetera Familiar'},
  user:{id:crypto.getRandomValues(new Uint8Array(16)),name:'billetera',displayName:'Billetera Familiar'},
  pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],
  authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required'},
  timeout:60000}});
 localStorage.setItem('billetera_bio',b64u(cred.rawId));
}
async function bioUnlock(){
 const id=localStorage.getItem('billetera_bio');if(!id)return false;
 const cred=await navigator.credentials.get({publicKey:{
  challenge:crypto.getRandomValues(new Uint8Array(32)),
  allowCredentials:[{type:'public-key',id:b64uBuf(id)}],
  userVerification:'required',timeout:60000}});
 return !!cred;
}

/* ============================== FIREBASE ============================== */
const fb={app:null,auth:null,dbfs:null,user:null,loaded:false};
function parseFB(txt){
  txt=String(txt||'').trim()
    .replace(/^(export\s+)?(const|let|var)\s+firebaseConfig\s*=\s*/i,'')
    .replace(/;\s*$/,'');
  if(txt&&!txt.startsWith('{'))txt='{'+txt;
  if(txt&&!txt.endsWith('}'))txt+='}';
  try{return JSON.parse(txt);}catch(e){}
  const fixed=txt
    .replace(/,\s*}/g,'}')
    .replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g,'$1"$2":');
  return JSON.parse(fixed);
}
async function initFB(){
 if(!db.fb.config)return;
 try{
  const cfg=parseFB(db.fb.config);
  const {initializeApp}=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
  const {getAuth,onAuthStateChanged}=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
  const {getFirestore}=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
  fb.app=initializeApp(cfg);fb.auth=getAuth(fb.app);fb.dbfs=getFirestore(fb.app);fb.loaded=true;
  onAuthStateChanged(fb.auth,u=>{fb.user=u;syncStart();if(curView==='ajustes')renderAjustes();updateSyncChip();});
 }catch(e){console.warn('Firebase:',e);}
}
let _snap=null,_pushT=null;
async function syncStart(){
 if(!fb.user||!db.fb.activo)return;
 const {doc,onSnapshot}=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
 if(_snap)_snap();
 _snap=onSnapshot(doc(fb.dbfs,'users',fb.user.uid,'data','main'),snap=>{
  if(!snap.exists())return;const r=snap.data();
  if(r.updatedAt>db.updatedAt){db=JSON.parse(r.json);localStorage.setItem(LS,JSON.stringify(db));evaluarDeudas();render();toast('☁️ Datos actualizados desde otro dispositivo');updateSyncChip();}
 });
}
async function pushFB(){
 updateSyncChip();
 if(!(fb.user&&db.fb.activo&&fb.loaded))return;
 clearTimeout(_pushT);
 _pushT=setTimeout(async()=>{try{
  const {doc,setDoc}=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
  await setDoc(doc(fb.dbfs,'users',fb.user.uid,'data','main'),{json:JSON.stringify(db),updatedAt:db.updatedAt});
  updateSyncChip(true);
 }catch(e){console.warn(e);updateSyncChip();}},1200);
}
function updateSyncChip(ok){
 const c=$('#sync-chip');if(!c)return;
 if(fb.user&&db.fb.activo){c.classList.remove('hidden');c.className='chip '+(ok?'g':'');c.textContent=ok?'☁️ Sincronizado':'☁️ Sincronizando…';}
 else c.classList.add('hidden');
}
function fbAuthModal(reg){
 openModal(reg?'🆕 Crear cuenta Firebase':'🔑 Iniciar sesión',`<form id="frm_fb">${inp('fb_e','Correo','','email')}${inp('fb_p','Contraseña','','password')}
 <div class="frm-btns"><button class="btn pri">${reg?'Crear cuenta':'Entrar'}</button><button class="btn" type="button" data-act="close-modal">Cancelar</button></div></form>`);
 $('#frm_fb').onsubmit=async e=>{e.preventDefault();try{
  const m=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
  const em=$('#fb_e').value,pw=$('#fb_p').value;
  reg?await m.createUserWithEmailAndPassword(fb.auth,em,pw):await m.signInWithEmailAndPassword(fb.auth,em,pw);
  closeModal();toast('✅ Sesión iniciada. Activa la sincronización.');renderAjustes();
 }catch(err){toast('❌ '+(err.code||err.message));}};
}

/* ============================== NOTIFICACIONES ============================== */
function revisarRecordatorios(){
 if(!('Notification'in window)||Notification.permission!=='granted')return;
 const vistas=JSON.parse(sessionStorage.getItem('nv')||'[]');const hoy=today();let nuevas=[];
 for(const d of db.deudas){
  if(d.archivada||d.estado==='pagada'||d.sinVencimiento||!d.vencimiento)continue;
  const dd=days(hoy,d.vencimiento);const key=d.id+hoy;
  if(vistas.includes(key))continue;
  if(dd<0)nuevas.push(`🔴 "${d.nombre}" está en mora (${Math.abs(dd)} días). Saldo: ${fmt(cicloRestante(d))}`);
  else if(dd<=(db.ajustes.diasAviso||5))nuevas.push(`🟡 "${d.nombre}" vence en ${dd} día${dd===1?'':'s'} (${dstr(d.vencimiento)})`);
  if(nuevas.length)vistas.push(key);
 }
 nuevas.slice(0,3).forEach(b=>{try{new Notification('👛 Billetera Familiar',{body:b,icon:'icon.svg'});}catch(e){}});
 sessionStorage.setItem('nv',JSON.stringify(vistas));
}

/* ============================== EXPORTAR EXCEL ============================== */
function cargarXLSX(){
 return new Promise((res,rej)=>{
  if(window.XLSX)return res();
  const s=document.createElement('script');
  s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  s.onload=()=>res();
  s.onerror=()=>rej(new Error('sin-cdn'));
  document.head.appendChild(s);
 });
}
async function exportarExcel(){
 toast('⏳ Generando Excel…');
 try{await cargarXLSX();}catch(e){toast('❌ Necesitas conexión a internet para generar el Excel');return;}
 const X=XLSX, wb=X.utils.book_new(), hoy=today(), mes=hoy.slice(0,7);
 const acNom=id=>{const a=db.acreedores.find(x=>x.id===id);return a?a.nombre:'';};
 const act=db.deudas.filter(d=>!d.archivada&&d.estado!=='pagada');
 X.utils.book_append_sheet(wb,X.utils.json_to_sheet([
  {Concepto:'Deudas activas (saldo)',Valor:act.reduce((s,d)=>s+(d.saldoTotal??d.montoTotal),0)},
  {Concepto:'Deudas en mora',Valor:act.filter(d=>d.estado==='morosa').length},
  {Concepto:'Ingresos del mes',Valor:db.ingresos.filter(i=>mkey(i.fecha)===mes).reduce((s,i)=>s+i.monto,0)},
  {Concepto:'Gastos del mes',Valor:db.gastos.filter(g=>mkey(g.fecha)===mes).reduce((s,g)=>s+g.monto,0)},
  {Concepto:'Pagos de deudas del mes',Valor:db.pagos.filter(p=>mkey(p.fecha)===mes).reduce((s,p)=>s+p.monto,0)},
  {Concepto:'Balance acumulado',Valor:balanceActual()},
  {Concepto:'Fecha de emisión',Valor:hoy}
 ]),'Resumen');
 X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.deudas.map(d=>({
  Nombre:d.nombre,Estado:d.estado,Responsable:d.persona,Tipo:d.tipoDeuda,Acreedor:acNom(d.acreedorId),
  'Monto total':d.montoTotal,'Saldo deuda':d.saldoTotal??d.montoTotal,'Facturado mes':d.montoFacturadoMes,
  'Pago mínimo':minPago(d),'Abonos ciclo':abonosCiclo(d),'Saldo pago mínimo':cicloRestante(d),
  'Saldo total facturado':saldoFacturado(d),Vencimiento:d.sinVencimiento?'Sin vencimiento':d.vencimiento,
  'Días mora':diasMora(d)??'',Archivada:d.archivada?'Sí':'No',Notas:d.notas||''
 }))),'Deudas');
 X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.pagos.map(p=>({
  Fecha:p.fecha,Deuda:p.deuda,Responsable:p.persona||'',Monto:p.monto,Tipo:p.tipo,Archivado:p.archivado?'Sí':'No'
 }))),'Pagos');
 X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.cuentas.map(c=>({
  Titular:c.persona,Banco:c.banco,Tipo:c.tipo,'N° cuenta':c.numero,Moneda:c.moneda,Saldo:c.saldo??'',Estado:c.estado,Nombre:c.nombre||'',Archivada:c.archivada?'Sí':'No'
 }))),'Cuentas');
 X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.tarjetas.map(t=>({
  Titular:t.persona,Entidad:t.entidad,Tipo:t.tipo,Formato:t.formato,'Número':t.numero,Vence:t.venc||'',Archivada:t.archivada?'Sí':'No'
 }))),'Tarjetas');
 X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.acreedores.map(a=>({
  Nombre:a.nombre,Tipo:a.tipo,Nota:a.nota||''
 }))),'Acreedores');
 X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.ingresos.map(i=>({
  Fecha:i.fecha,Persona:i.persona,Descripcion:i.descripcion||'',Monto:i.monto
 }))),'Ingresos');
 X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.gastos.map(g=>({
  Fecha:g.fecha,Persona:g.persona,Categoria:g.categoria,Descripcion:g.descripcion||'',Monto:g.monto
 }))),'Gastos');
 X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.presupuestos.map(p=>{
  const g=gastoCatMes(p.categoria,mes);
  return {Categoria:p.categoria,'Límite mensual':p.limite,'Gastado mes':g,'% uso':p.limite>0?Math.round(g/p.limite*100):0};
 }))),'Presupuesto');
 X.utils.book_append_sheet(wb,X.utils.json_to_sheet(db.metas.map(m=>({
  Nombre:m.nombre,Objetivo:m.objetivo,Ahorrado:m.ahorrado||0,'% avance':m.objetivo>0?Math.round((m.ahorrado||0)/m.objetivo*100):0,
  'Aporte mensual':m.aporteMensual||0,'Aporte automático':m.autoAporte?'Sí':'No',Archivada:m.archivada?'Sí':'No'
 }))),'Metas');
 X.writeFile(wb,'Billetera_Consolidado_'+hoy+'.xlsx');
 toast('⬇️ Excel descargado');
}
/* ============================== ACCIONES GLOBALES ============================== */
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-act]');if(!b)return;
 const {act,id}=b.dataset;
 const find=(arr,i)=>arr.find(x=>x.id===i);
 const archToggle=(arr,i,frase)=>{
  const x=find(arr,i); if(!x)return;
  const clave=('archivado' in x)?'archivado':'archivada';
  x[clave]=!x[clave];
  if(clave==='archivado')delete x.archivada; else delete x.archivado;
  save();render();
  toast(x[clave]?`📦 ${frase} archivado`:`♻️ ${frase} restaurado`);
 };
 switch(act){
  case 'close-modal':closeModal();break;
  case 'nav':go(id);break;
  case 'new-deuda':openDeudaModal();break;
  case 'edit-deuda':openDeudaModal(id);break;
  case 'pago':openPagoModal(id);break;
  case 'cuota':{const d=debtById(id);const nd={...d,id:uid(),estado:'vigente',fechaPago:null,abonadoTotal:0,archivada:false,vencimiento:d.vencimiento?addMonth(d.vencimiento):null};
    nd.nombre=d.nombre.replace(/ — .*$/,'')+' — '+new Date().toLocaleDateString('es-CL',{month:'long'});db.deudas.push(nd);save();render();toast('🔁 Nueva cuota creada');break;}
  case 'arch-deuda':archToggle(db.deudas,id,'Deuda');break;
  case 'rest-deuda':archToggle(db.deudas,id,'Deuda');break;
  case 'del-deuda':confirmDlg('🗑️ Eliminar deuda',`¿Eliminar definitivamente "${esc(debtById(id)?.nombre)}"? Esta acción no se puede deshacer.`,()=>{db.deudas=db.deudas.filter(d=>d.id!==id);save();render();toast('🗑️ Deuda eliminada');});break;
  case 'filter-deuda':deudaFilter=id;renderDeudas();break;
  case 'toggle-arch-deudas':deudaVerArch=!deudaVerArch;renderDeudas();break;
  case 'toggle-arch-pagos':pagoVerArch=!pagoVerArch;renderPagos();break;
  case 'arch-pago':archToggle(db.pagos,id,'Pago');break;
  case 'rest-pago':archToggle(db.pagos,id,'Pago');break;
  case 'del-pago':confirmDlg('🗑️ Eliminar pago','¿Eliminar definitivamente este registro de pago?',()=>{db.pagos=db.pagos.filter(p=>p.id!==id);save();render();toast('🗑️ Pago eliminado');});break;
  case 'new-ac':acModal(id);break;
  case 'edit-ac':acModal(null,id);break;
  case 'del-ac':{const usado=db.deudas.some(d=>d.acreedorId===id);
    if(usado)toast('⚠️ No se puede eliminar: hay deudas asociadas a este acreedor.');
    else confirmDlg('🗑️ Eliminar acreedor','¿Eliminar este acreedor?',()=>{db.acreedores=db.acreedores.filter(a=>a.id!==id);save();render();toast('🗑️ Eliminado');});break;}
  case 'toggle-nums':showNums=!showNums;renderCuentas();break;
  case 'new-cuenta':cuentaModal();break; case 'edit-cuenta':cuentaModal(id);break;
  case 'arch-cuenta':archToggle(db.cuentas,id,'Cuenta');break; case 'rest-cuenta':archToggle(db.cuentas,id,'Cuenta');break;
  case 'del-cuenta':confirmDlg('🗑️ Eliminar cuenta','¿Eliminar definitivamente?',()=>{db.cuentas=db.cuentas.filter(c=>c.id!==id);save();render();});break;
  case 'new-tarjeta':tarjetaModal();break; case 'edit-tarjeta':tarjetaModal(id);break;
  case 'arch-tarjeta':archToggle(db.tarjetas,id,'Tarjeta');break; case 'rest-tarjeta':archToggle(db.tarjetas,id,'Tarjeta');break;
  case 'del-tarjeta':confirmDlg('🗑️ Eliminar tarjeta','¿Eliminar definitivamente?',()=>{db.tarjetas=db.tarjetas.filter(t=>t.id!==id);save();render();});break;
  case 'new-pres':presModal();break;
  case 'edit-pres':presModal(id);break;
  case 'del-pres':db.presupuestos=db.presupuestos.filter(p=>p.categoria!==id);save();render();break;
  case 'new-ing':ingModal();break;
  case 'del-ing':db.ingresos=db.ingresos.filter(i=>i.id!==id);save();render();break;
  case 'new-gasto':gastoModal();break;
  case 'del-gasto':db.gastos=db.gastos.filter(g=>g.id!==id);save();render();break;
  case 'new-meta':metaModal();break; case 'edit-meta':metaModal(id);break;
  case 'arch-meta':archToggle(db.metas,id,'Meta');break; case 'rest-meta':archToggle(db.metas,id,'Meta');break;
  case 'aporte-meta':openModal('💰 Aportar a la meta',`<form id="frm_ap">${inp('ap_mon','Monto ($)','','number')}<div class="frm-btns"><button class="btn pri">Aportar</button></div></form>`);
   $('#frm_ap').onsubmit=e=>{e.preventDefault();const mt=find(db.metas,id);mt.ahorrado=(mt.ahorrado||0)+(+$('#ap_mon').value||0);save();closeModal();render();toast('💰 Aporte registrado');};break;
  case 'save-personas':$$('.fld-inp').forEach(inpEl=>{db.personas[inpEl.dataset.i]=inpEl.value.trim()||db.personas[inpEl.dataset.i];});save();render();toast('💾 Nombres guardados');break;
  case 'set-pass':passModal('🔑 Establecer contraseña','Crear');break;
  case 'chg-pass':passModal('🔑 Cambiar contraseña','Cambiar');break;
  case 'rm-pass':confirmDlg('Quitar contraseña','¿Seguro? La app quedará sin protección.',()=>{db.auth=null;save();render();toast('Contraseña eliminada');});break;
  case 'bio-on':(async()=>{if(!db.auth)return toast('⚠️ Primero establece una contraseña');if(!(await bioAvailable()))return toast('❌ El navegador no ofrece huella/Face ID');try{await bioEnroll();toast('✅ Desbloqueo biométrico activado');renderAjustes();}catch(e){toast('❌ Operación cancelada');}})();break;
  case 'bio-off':localStorage.removeItem('billetera_bio');renderAjustes();toast('Desbloqueo biométrico desactivado');break;
  case 'notif-perm':if('Notification'in window)Notification.requestPermission().then(()=>{render();toast('🔔 Permiso: '+Notification.permission);});else toast('No soportado');break;
  case 'save-aviso':db.ajustes.diasAviso=+$('#aviso').value||5;save();toast('💾 Guardado');break;
  case 'install':installApp();break;
  case 'exp-cif':passModal('🔐 Contraseña para cifrar el respaldo','Cifrar y descargar',async pass=>{
    const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
    const key=await pbkdf2Key(pass,salt,['encrypt']);
    const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc(JSON.stringify(db)));
    descargar('respaldo_cifrado_'+today()+'.json',JSON.stringify({salt:[...salt],iv:[...iv],data:[...new Uint8Array(ct)]}));
    toast('⬇️ Respaldo cifrado descargado');});break;
  case 'imp-cif':{const inpF=document.createElement('input');inpF.type='file';inpF.accept='.json';inpF.onchange=async()=>{
    const file=inpF.files[0];if(!file)return;const obj=JSON.parse(await file.text());
    openModal('🔓 Importar respaldo cifrado',`<form id="frm_imp">${inp('imp_pw','Contraseña del respaldo','','password')}<div class="frm-btns"><button class="btn pri">Desbloquear e importar</button></div></form>`);
    $('#frm_imp').onsubmit=async e=>{e.preventDefault();try{
      const key=await pbkdf2Key($('#imp_pw').value,new Uint8Array(obj.salt),['decrypt']);
      const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(obj.iv)},key,new Uint8Array(obj.data));
      db=JSON.parse(dec(pt));localStorage.setItem(LS,JSON.stringify(db));evaluarDeudas();closeModal();render();toast('✅ Respaldo importado');
    }catch(err){toast('❌ Contraseña incorrecta o archivo inválido');}};};inpF.click();break;}
  case 'exp-excel':exportarExcel();break;
  case 'exp-json':descargar('billetera_'+today()+'.json',JSON.stringify(db));break;
  case 'imp-json':{const inpF=document.createElement('input');inpF.type='file';inpF.accept='.json';inpF.onchange=async()=>{
    db=JSON.parse(await inpF.files[0].text());localStorage.setItem(LS,JSON.stringify(db));evaluarDeudas();render();toast('✅ Importado');};inpF.click();break;}
  case 'fb-save':db.fb.config=$('#fb-cfg').value.trim();save();initFB();toast('💾 Configuración guardada');break;
  case 'fb-login':fbAuthModal(false);break; case 'fb-reg':fbAuthModal(true);break;
  case 'fb-out':import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js').then(m=>m.signOut(fb.auth));break;
  case 'reset':confirmDlg('⚠️ Borrar todo','Se eliminarán TODOS los datos locales (deudas, cuentas, pagos…). ¿Continuar?',()=>{localStorage.removeItem(LS);location.reload();});break;
 }
});

/* ============================== PWA / INSTALACIÓN ============================== */
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#install-banner').classList.remove('hidden');});
function installApp(){
 if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.then(()=>{deferredPrompt=null;$('#install-banner').classList.add('hidden');});
   if('Notification'in window&&Notification.permission==='default')Notification.requestPermission();}
 else toast('📱 Usa el menú del navegador → "Instalar app" o "Agregar a pantalla de inicio"');
}
$('#install-btn').onclick=installApp;
$('#install-x').onclick=()=>$('#install-banner').classList.add('hidden');
window.addEventListener('appinstalled',()=>{$('#install-banner').classList.add('hidden');toast('🎉 ¡App instalada!');if('Notification'in window&&Notification.permission==='default')Notification.requestPermission();});

/* ============================== BLOQUEO / ARRANQUE ============================== */
function doUnlock(){unlocked=true;$('#lock-screen').classList.add('hidden');$('#app').classList.remove('hidden');render();revisarRecordatorios();aplicarAportesMes();}
async function tryUnlock(){
 const p=$('#lock-pass').value;
 const h=await hashPass(p,new Uint8Array(db.auth.salt));
 if(JSON.stringify(h)===JSON.stringify(db.auth.hash))doUnlock();
 else $('#lock-err').textContent='Contraseña incorrecta';
}
function showBioButton(){
 if(!localStorage.getItem('billetera_bio')||$('#lock-bio'))return;
 const b=document.createElement('button');
 b.id='lock-bio';b.className='btn pri';b.style.marginTop='8px';b.textContent='👆 Desbloquear con huella / Face ID';
 b.onclick=async()=>{try{if(await bioUnlock())doUnlock();}catch(e){$('#lock-err').textContent='Huella no reconocida. Usa tu contraseña.';}};
 $('.lock-card').insertBefore(b,$('#lock-btn'));
}
document.querySelector('#btn-lock').onclick=()=>{if(!db.auth)return toast('Sin contraseña activa (actívala en Ajustes)');unlocked=false;$('#app').classList.add('hidden');$('#lock-screen').classList.remove('hidden');};
$('#lock-btn').onclick=tryUnlock;
$('#lock-pass').addEventListener('keydown',e=>{if(e.key==='Enter')tryUnlock();});
window.addEventListener('resize',()=>{if(curView==='historico')drawChart();});

init();
renderNav();
if(db.auth&&!unlocked){$('#lock-screen').classList.remove('hidden');showBioButton();
 bioUnlock().then(ok=>{if(ok)doUnlock();}).catch(()=>{});}
else{unlocked=true;$('#lock-screen').classList.add('hidden');$('#app').classList.remove('hidden');render();revisarRecordatorios();aplicarAportesMes();}
initFB();
if('Notification'in window&&Notification.permission==='default'){setTimeout(()=>{if(confirm('¿Deseas recibir recordatorios de vencimiento de deudas?'))Notification.requestPermission();},4000);}

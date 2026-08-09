/* data.js */
const KEY='finanzas_re_v1';
const PERSONAS=['Ricardo','Elías'];
const TIPOS_ACREEDOR=['Entidad financiera','Empresa','Persona','Otro'];
const CATEGORIAS=['Supermercado','Transporte','Comida y Restaurant','Salud','Educación','Entretención','Ropa y Calzado','Hogar','Mascotas','Suscripciones','Otros'];
const CAT_COLORS=['#34d399','#60a5fa','#f59e0b','#f87171','#a78bfa','#f472b6','#fbbf24','#38bdf8','#4ade80','#c084fc','#94a3b8'];
const MEDIOS=['Efectivo','Débito','Crédito','Transferencia','Prepago/Billetera','Otro'];
function seed(){return{ingresos:[{id:'i1',persona:'Ricardo',monto:0,fuente:''},{id:'i2',persona:'Elías',monto:0,fuente:''}],deudas:[],servicios:[],cuentas:[],gastos:[],metas:[],presupuesto:{},histoIngresos:{},pagos:[],acreedores:[],sync:{enabled:false,url:'',room:'',apiKey:'',email:''},updatedAt:0,config:{passHash:null,passSalt:null,anticipoDias:7,notif:false}};}
let db=(function(){try{var r=localStorage.getItem(KEY);if(r){var d=JSON.parse(r);if(d&&d.deudas&&d.cuentas)return d;}}catch(e){}return seed();})();
function persist(){try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}}
/*FIN-data*/

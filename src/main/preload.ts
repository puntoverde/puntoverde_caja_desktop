import {contextBridge, ipcRenderer} from 'electron';
import { e } from 'mathjs';
import {IAddCargo, IAddCargoParcialidad, IInscripcion, IPago,IPagosFilterConcepto} from './model/model-type'

let listener
let listener_concepto
let listener_caja//es para el refresh de los cargos
let listener_pago//es para mostrar que ya se pago
let listener_recibo//es para que se le pasen lod datos del pago al recibo
let listener_facturacion//es para que se pasen las direcciones de facturacion
let listener_estado_cuenta//es para que se pasen las direcciones de facturacion
let listener_set_data_main//es para que se pasen las direcciones de facturacion
let listener_inscripcion
contextBridge.exposeInMainWorld('electron', {

  //cerrar ventanas
  closeLogin:()=>ipcRenderer.invoke('close-login'),
  closeMain:()=>ipcRenderer.invoke('close-main'),
  closeCaja:()=>ipcRenderer.invoke('close-caja'),
  closeConceptos:()=>ipcRenderer.invoke('close-conceptos'),
  closeRecibo:()=>ipcRenderer.invoke('close-recibo'),
  closeReimprimir:()=>ipcRenderer.invoke('close-reimprimir'),
  closeReciboReimprimir:()=>ipcRenderer.invoke('close-recibo-reimprimir'),
  closeReportePagos:()=>ipcRenderer.invoke('close-reporte-pagos'),
  closeReportePagosAgrupados:()=>ipcRenderer.invoke('close-reporte-pagos-agrupados'),
  closeEstadoCuenta:()=>ipcRenderer.invoke('close-estado-cuenta'),
  closeFacturaV4:()=>ipcRenderer.invoke('close-factura-v4'),
  closeInscripcion:()=>ipcRenderer.invoke('close-inscripcion'),

  //minimizar ventanas
  miniMain:()=>ipcRenderer.invoke('mini-main'),
  miniCaja:()=>ipcRenderer.invoke('mini-caja'),
  miniReimprimir:()=>ipcRenderer.invoke('mini-reimprimir'),
  miniReportePagos:()=>ipcRenderer.invoke('mini-reporte-pagos'),
  miniReportePagosAgrupados:()=>ipcRenderer.invoke('mini-reporte-pagos-agrupados'),
  
  //inicio de session
  initSession:(usuario,password)=>ipcRenderer.send('init-session',usuario,password),
  //evento on en el rendering linpia la ventana de login 
  clearLogin:callback=>listener=callback,
  onMainLsData:callback=>listener_set_data_main=callback,

  //abrir ventanas
  openWindow:(win)=>ipcRenderer.send('open-windows',win),

  //eventos de caja
  buscarAccion:(n_accion,clasificacion)=>ipcRenderer.sendSync('buscar-accion',n_accion,clasificacion),
  getCargos:(cve_accion)=>ipcRenderer.sendSync('get-cargos',cve_accion),
  openWindowConceptos:(cve_accion)=>ipcRenderer.send('open-window-conceptos',cve_accion),
  getCuotas:()=>ipcRenderer.sendSync('get-cuotas'),
  socioAplicaCuota:(cve_accion,edad_aplica,genero,parentescos_aplica)=>ipcRenderer.sendSync('socio-aplica-cuota',cve_accion,edad_aplica,genero,parentescos_aplica),
  duenoAplicaCuota:(cve_accion,membresia_aplica)=>ipcRenderer.sendSync('dueno-aplica-cuota',cve_accion,membresia_aplica),
  onConceptos:callback=>listener_concepto=callback,
  createCargo:(data:IAddCargo)=>{
    const result=ipcRenderer.sendSync('create-cargo',data)    
    return result
  },
  createCargoMantenimiento:(opcion:number,cve_accion:number,cve_persona:number,periodo:string)=>ipcRenderer.sendSync('create-cargo-mantenimiento',opcion,cve_accion,cve_persona,periodo),
  createCargoParcialidades:(data:IAddCargoParcialidad)=>{
    const result=ipcRenderer.sendSync('create-cargo_parcialidades',data)
    return result
  },

  onRefreshTableCargos:callback=>listener_caja=callback,
  getFormasPago:()=>ipcRenderer.sendSync('get-formas-pago'),
  getBancos:()=>ipcRenderer.sendSync('get-bancos'),
  savePago:(p:IPago)=>ipcRenderer.send('save-pago',p),
  savePagoCero:(cve_accion:number,cargos:number[])=>ipcRenderer.sendSync('save-pago-cero',cve_accion,cargos),
  onPagoOK:callback=>listener_pago=callback,
  onRiciboData:callback=>listener_recibo=callback,
  imprimirRecibo:()=>ipcRenderer.send('imprimir-recibo'),
  reimprimirRecibo:(copies)=>ipcRenderer.send('reimprimir-recibo',copies),
  verificPago:(cargos:number[])=>ipcRenderer.sendSync('verific-pago',cargos),
  

  //metodos de reimprimir 
  findAccionReimprimir:(n_accion,clasificacion)=>ipcRenderer.sendSync('find-accion-reimprimir',n_accion,clasificacion),
  getPagosByPeriodo:(cve_accion,periodos)=>ipcRenderer.sendSync('get-pagos-periodos',cve_accion,periodos),
  openReciboReimprimir:(id_pago)=>ipcRenderer.send('open-recibo-reimprimir',id_pago),

  //metodos de reporte pagos
  getPagosConcepto:(p:IPagosFilterConcepto)=>ipcRenderer.sendSync('get-pagos-conceptos',p),
  getPagosConcentrados:(p:IPagosFilterConcepto)=>ipcRenderer.sendSync('get-pagos-concentrados',p),

  openEstadoCuenta:(cve_accion:number)=>ipcRenderer.send('open-estado-cuenta',cve_accion),
  onEstadoCuentaData:callback=>listener_estado_cuenta=callback,
  imprimirEstadoCuenta:()=>ipcRenderer.send('imprimir-estado-cuenta'),


  openFacturaV4:(cve_accion:number,id_pago:number)=>ipcRenderer.send('open-factura-v4',cve_accion,id_pago),
  onFacturaData:callback=>listener_facturacion=callback,

  saveInscripcion:(data:IInscripcion)=>ipcRenderer.sendSync('create-inscripcion',data),
  onInscripcionData:callback=>listener_inscripcion=callback,

  
})

//evento on a espera de un webcontent.send desde el main process
ipcRenderer.on('clear-login', (event, arg) => {
  if (listener)listener(arg);
  else console.warn('No listener');
});

//evento para recatar la cve_accion en las de conceptos
ipcRenderer.on('on-add-cveaccion', (event, arg) => {
  if (listener_concepto)listener_concepto(arg);
  else console.warn('No listener');
});

ipcRenderer.on('on-refresh-table-cargos',(event,arg)=>{
  console.log('ejecuta el on refresh table')
  if (listener_caja)listener_caja(arg);
  else console.warn('No listener');
})

ipcRenderer.on('on-pago-ok',(event,arg)=>{
  console.log('ejecuta el on de pago')
  if (listener_pago)listener_pago(arg);
  else console.warn('No listener');
})

ipcRenderer.on('on-data-recibo',(event,arg,tipo)=>{
  console.log('ejecuta el on de recibo')
  if (listener_recibo)listener_recibo(arg,tipo);
  else console.warn('No listener');
})

ipcRenderer.on('on-data-facturar',(event,arg,arg2)=>{
  console.log('ejecuta el on de facturar')
  if (listener_facturacion)listener_facturacion(arg,arg2);
  else console.warn('No listener');
})

ipcRenderer.on('on-data-estado-cuenta',(event,arg,arg2)=>{
  console.log('ejecuta el on de estado cuenta')
  if (listener_estado_cuenta)listener_estado_cuenta(arg,arg2);
  else console.warn('No listener');
})

ipcRenderer.on('on-data-main-ls',(event,arg,arg2)=>{
  console.log('ejecuta el on de main para ingresar el usuario')
  if (listener_set_data_main)listener_set_data_main(arg);
  else console.warn('No listener');
})

ipcRenderer.on('on-data-inscripcion',(event,arg)=>{
  console.log('ejecuta el on de inscripciones')
  if (listener_inscripcion)listener_inscripcion(arg);
  else console.warn('No listener');
})
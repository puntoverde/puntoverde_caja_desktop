import {app, BrowserWindow, ipcMain, session,dialog,screen} from 'electron';
import {join} from 'path';
import type {createWindow} from './types-create-window'
import Storage from 'electron-store'

import {login} from './dao/mainDao'
import {findAccion,findCargosByAccion,estadoCuenta} from './dao/cajaDao'
import {getCuotas,getSociosAplica,getDuenoAplica,saveCargo,saveMantenimientoFull, saveCargoParcialidades,prueba_time_zone_cargo_dao} from './dao/cargoDao'
import {getFormasPago,getBancos,savePago,savePagoCero,getPagos,getPagosConcentrados,verificCuotaActivacion} from './dao/pagoDao'
import {getPagoByID,findAccionReimprimir,pagosPeriodo} from './dao/reimprimirDao'
import {updateRFC,findDireccionesFacturacion,findPagoFacturar} from './dao/facturacionDao'
import {saveInscripcion,getDatosDefaultInscripcion} from './dao/inscripcionDao'

import type {IAccion,ICargo,ICuota,IPago,IPagosFilterConcepto,IInscripcion, IAddCargo, IAddCargoParcialidad} from './model/model-type'

let splashWindow:BrowserWindow
let loginWindow:BrowserWindow
let mainWindow:BrowserWindow
let cajaWindow:BrowserWindow|undefined
let conceptosWindow:BrowserWindow|undefined
let recibosWindow:BrowserWindow|undefined
let reimprimirWindow:BrowserWindow|undefined
let recibosReimprimirWindow:BrowserWindow|undefined
let reportePagosWindow:BrowserWindow|undefined
let reportePagosAgrupadosWindow:BrowserWindow|undefined
let estadoCuentaWindow:BrowserWindow|undefined
let facturaV4Window:BrowserWindow|undefined
let InscripcionWindow:BrowserWindow|undefined

function createWindow ({url='main',width,height,frame=false,resizable=false,center=false,alwaysOnTop=false,backgroundColor='#fff',show=false,parent=undefined,modal=false}:createWindow) {
   
  //si width o height son undefined por que no se pasaron se pone la ventana en su tamaño completo
  if(!width || !height)
  {
     const primaryDisplay=screen.getPrimaryDisplay()
     const {width:widthS,height:heightS}=primaryDisplay.workAreaSize
     width=widthS
     height=heightS
  }
console.log('parent->',parent)
  const mainWindow = new BrowserWindow({
    width,
    height,
    frame,
    resizable,
    center,
    alwaysOnTop,
    backgroundColor,
    show,
    parent,
    modal,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    hasShadow:true
  });

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}/pages/${url}/index.html`);
    mainWindow.webContents.openDevTools()
  }
  else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer','pages',url,'index.html'));
    // mainWindow.webContents.openDevTools()
  }

  return mainWindow
}

app.whenReady().then(() => {

  prueba_time_zone_cargo_dao()

  //se crea pantalla de splash
  splashWindow=createWindow({url:'splash',width:600,height:350,center:true,alwaysOnTop:true}); 
  //cuando la pantala splash sea montada por completo ejecuta 
  splashWindow.once('ready-to-show',()=>{
    splashWindow.show()//se muestra cuando ya se monto por completo
    //crea pantalla de login 
    loginWindow=createWindow({url:'login',width:550,height:300,center:true,alwaysOnTop:true})
    //cuadno la pantalla sea montada por completo ejecuta
      loginWindow.once('ready-to-show',()=>{
        //se espera un segundo y medio mas 
        setTimeout(()=>{
          loginWindow.show()//muestra pantalla de login 
          splashWindow.close()//cierra pantalla de splash
        },1500)
      })

  })

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['script-src \'self\'']
      }
    })
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow({width:100,height:100});
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

ipcMain.on('message', (event, message) => {
  console.log(message);
})


//eventos de las peticiones

ipcMain.on('open-windows',(event,windowOpen)=>{
   switch(windowOpen){
     case 'openCaja':
      console.log('CajaWindows->',cajaWindow)
      if(!cajaWindow){
      cajaWindow=createWindow({url:'caja',center:true,parent:mainWindow});
      cajaWindow.once('ready-to-show',()=>{cajaWindow!.show()})

      //se crea conceptos pero no se muestra
      conceptosWindow=createWindow({url:'conceptos',width:1000,height:600,parent:cajaWindow,modal:true})
      //se crea recibo pero no se muestra
      recibosWindow=createWindow({url:'recibo',width:700,height:500,center:true,parent:cajaWindow,modal:true});
      }
      else{cajaWindow.show()}
      break
    case 'openReimprimir':
      if(!reimprimirWindow){
      reimprimirWindow=createWindow({url:'reimprimir',width:800,height:460,center:true,parent:mainWindow});
      reimprimirWindow.once('ready-to-show',()=>{reimprimirWindow!.show()})
      }
      else{reimprimirWindow.restore()}
      break
    case 'openPagos':
      if(!reportePagosWindow){
        reportePagosWindow=createWindow({url:'reporte_pagos',center:true,parent:mainWindow});
        reportePagosWindow.once('ready-to-show',()=>{reportePagosWindow!.show()})
        }
        else{reportePagosWindow.maximize()}
      break
    case 'openPagosAgrupados':
      if(!reportePagosAgrupadosWindow){
        reportePagosAgrupadosWindow=createWindow({url:'reporte_pagos_agrupados',center:true,parent:mainWindow});
        reportePagosAgrupadosWindow.once('ready-to-show',()=>{reportePagosAgrupadosWindow!.show()})
        }
        else{reportePagosAgrupadosWindow.maximize()}
      break      
   }
})


//cerrar ventanas
ipcMain.handle('close-login',()=>loginWindow.close())
ipcMain.handle('close-main',()=>mainWindow.close())
ipcMain.handle('close-caja',()=>{cajaWindow!.close();cajaWindow=undefined})
ipcMain.handle('close-conceptos',()=>conceptosWindow!.hide())
ipcMain.handle('close-recibo',()=>{recibosWindow!.hide();})
ipcMain.handle('close-reimprimir',()=>{reimprimirWindow!.close();reimprimirWindow=undefined})
ipcMain.handle('close-recibo-reimprimir',()=>{recibosReimprimirWindow!.close();recibosReimprimirWindow=undefined})
ipcMain.handle('close-reporte-pagos',()=>{reportePagosWindow!.close();reportePagosWindow=undefined})
ipcMain.handle('close-reporte-pagos-agrupados',()=>{reportePagosAgrupadosWindow!.close();reportePagosAgrupadosWindow=undefined})
ipcMain.handle('close-estado-cuenta',()=>{estadoCuentaWindow!.close();estadoCuentaWindow=undefined})
ipcMain.handle('close-factura-v4',()=>{facturaV4Window!.close();facturaV4Window=undefined})
ipcMain.handle('close-inscripcion',()=>{InscripcionWindow!.close();InscripcionWindow=undefined})

//minimizar ventanas
ipcMain.handle('mini-main',()=>mainWindow.minimize())
ipcMain.handle('mini-caja',()=>cajaWindow!.minimize())
ipcMain.handle('mini-reimprimir',()=>reimprimirWindow!.minimize())
ipcMain.handle('mini-reporte-pagos',()=>reportePagosWindow!.minimize())
ipcMain.handle('mini-reporte-pagos-agrupados',()=>reportePagosAgrupadosWindow!.minimize())

ipcMain.on('init-session',async (e,user,pass)=>{
  let data=await login(user,pass)

  if(!!data)
  {
    const storage=new Storage();
    storage.set('logueado',true);
    storage.set('user',`${data.nombre} ${data.apellido_paterno} ${data.apellido_materno}`)
    storage.set('cve_persona',data.cve_persona)

  //se crea pantalla de inicio
  mainWindow=createWindow({width:1000,height:600,url:'main'})
  //se ejecuta cuando la pantalla inicio termina de montar por completo
  mainWindow.once('ready-to-show',()=>{
    //se espera un segundo y medio mas     
    setTimeout(()=>{
      mainWindow.show()//muestra pantalla de inicio
      loginWindow.close()//cierra pantalla de login
    },1500)

  mainWindow.webContents.send('on-data-main-ls',`${data.nombre} ${data.apellido_paterno} ${data.apellido_materno}`)

  })
  
  }
  else{
    dialog.showMessageBox(loginWindow,{type:'warning',title:'Alert',message:'Usuario o Contraseña erronea'})
    .then(res=>{
      console.log('res->',res)
      loginWindow.webContents.send('clear-login')
    })
  }
})

//metodos de caja 
ipcMain.on('buscar-accion',async(e,n_accion:number,clasificacion:string):Promise<void>=>{
  try {
    const accion:IAccion=await findAccion(n_accion,clasificacion)
    const cargos:ICargo[]=await findCargosByAccion(accion.cve_accion)
    e.returnValue={accion,cargos}
  } catch (error) {    
    dialog.showMessageBox(cajaWindow!,{type:'error',title:'Error',message:`No Existe La Accion: ${n_accion}${['','A','B','C'][clasificacion]}`})
    e.returnValue={accion:null,cargos:[]}
  }
  
})

ipcMain.on('get-cargos',async(e,cve_accion:number)=>e.returnValue= await findCargosByAccion(cve_accion))

ipcMain.on('open-window-conceptos',(e,cve_accion:number)=>{
  conceptosWindow!.webContents.send('on-add-cveaccion',cve_accion)
  conceptosWindow!.show()
})

ipcMain.on('get-cuotas',async(e):Promise<ICuota[]>=>e.returnValue=await getCuotas())
ipcMain.on('socio-aplica-cuota',async(e,cve_accion:number,edad:number,genero:number,parentesco:number)=>e.returnValue=await getSociosAplica(cve_accion,edad,genero,parentesco))
ipcMain.on('dueno-aplica-cuota',async(e,cve_accion:number,membreasia:number)=>e.returnValue=await getDuenoAplica(cve_accion,membreasia))
ipcMain.on('create-cargo',async(e,data:IAddCargo)=>{
 const result=await saveCargo(data);
 if(result==0)
 dialog.showMessageBox(conceptosWindow!,{type:'info',title:'Alert',message:`La Cuota de '${data.concepto}' para el periodo ${data.periodo} ya se encuentra agregada`})
 else if(!Boolean(result))
 dialog.showMessageBox(conceptosWindow!,{type:'error',title:'Alert',message:`Ocurrio un error al intentar agregar '${data.concepto}' para el periodo ${data.periodo}`})
 else {
  cajaWindow!.webContents.send('on-refresh-table-cargos')
  if(data.is_inscripcion==1)
  {
    InscripcionWindow=createWindow({url:'inscripciones',width:460,height:700,parent:conceptosWindow,modal:true})
    const dataInscripcion=await getDatosDefaultInscripcion(data.cve_persona)
    InscripcionWindow!.once('ready-to-show',()=>{
    InscripcionWindow!.show();
    InscripcionWindow!.webContents.send('on-data-inscripcion',{...dataInscripcion,idCargo:result,concepto:data.concepto})
  })
  }  
}
 e.returnValue= result
});

ipcMain.on('create-cargo-mantenimiento',async(e,opcion:number,cve_accion:number,cve_persona:number,periodo:string)=>e.returnValue =await saveMantenimientoFull(opcion,cve_accion,cve_persona,periodo)),

ipcMain.on('create-cargo_parcialidades',async(e,data:IAddCargoParcialidad)=>{
  const result=await saveCargoParcialidades(data);
//   if(result==0)
//   dialog.showMessageBox(conceptosWindow!,{type:'info',title:'Alert',message:`La Cuota de '${data.concepto}' para el periodo ${data.periodo} ya se encuentra agregada`})
//   else if(!Boolean(result))
//   dialog.showMessageBox(conceptosWindow!,{type:'error',title:'Alert',message:`Ocurrio un error al intentar agregar '${data.concepto}' para el periodo ${data.periodo}`})
//   else {
   cajaWindow!.webContents.send('on-refresh-table-cargos')
//    if(data.is_inscripcion==1)
//    {
//      InscripcionWindow=createWindow({url:'inscripciones',width:460,height:700,parent:conceptosWindow,modal:true})
//      const dataInscripcion=await getDatosDefaultInscripcion(data.cve_persona)
//      InscripcionWindow!.once('ready-to-show',()=>{
//      InscripcionWindow!.show();
//      InscripcionWindow!.webContents.send('on-data-inscripcion',{...dataInscripcion,idCargo:result,concepto:data.concepto})
//    })
//    }  
//  }
  e.returnValue= result
 });

ipcMain.on('get-formas-pago',async(e)=>{
  const data=await getFormasPago();
  if(!Boolean(data))
  {
    dialog.showMessageBox(cajaWindow!,{type:'warning',title:'Warning',message:'Nose Cargaron las Formas de Pago'})
  }
  e.returnValue=data
});
ipcMain.on('get-bancos',async(e)=>e.returnValue=await getBancos());
ipcMain.on('save-pago',async(e,p:IPago)=>{
  const id_pago:number=await savePago(p);
  if(id_pago>0)
  {
    const data=await getPagoByID(id_pago)
    recibosWindow?.show()
    recibosWindow!.webContents.send('on-data-recibo',data)
    cajaWindow?.webContents.send('on-pago-ok')
  }
});

ipcMain.on('save-pago-cero',async(e,cve_accion:number,cargos:number[])=>{
  const idpago:number=await savePagoCero(cve_accion,cargos)
  if(idpago>0)
  {
    const data=await getPagoByID(idpago)  
    recibosWindow?.show()    
    recibosWindow!.webContents.send('on-data-recibo',data)
    cajaWindow?.webContents.send('on-pago-ok')
  }
})

ipcMain.on('verific-pago',async(e,cargos:number[])=>{
  e.returnValue=await verificCuotaActivacion(cargos)
})

ipcMain.on('imprimir-recibo',(e)=>{
  recibosWindow!.webContents.print({
    silent: true,
    deviceName: "",
    printBackground: true,
    color: false,
    copies: 2,
  },(success, error) => {if(success) {recibosWindow!.hide();}})
})

ipcMain.on('reimprimir-recibo',(e,copies)=>{
  recibosReimprimirWindow!.webContents.print({
    silent: true,
    deviceName: "",
    printBackground: true,
    color: false,
    copies,
  },(success, error) => {if(success) {recibosReimprimirWindow!.close();recibosReimprimirWindow=undefined}})
})

ipcMain.on('find-accion-reimprimir',async(e,n_accion:number,clasificacion:number)=>e.returnValue=await findAccionReimprimir(n_accion,clasificacion));
ipcMain.on('get-pagos-periodos',async(e,cve_accion:number,periodos:string[])=>e.returnValue=await pagosPeriodo(cve_accion,periodos));
ipcMain.on('open-recibo-reimprimir',async(e,id_pago:number)=>{
  recibosReimprimirWindow=createWindow({url:'recibo_reimprimir',width:700,height:500,center:true,parent:reimprimirWindow,modal:true});
  const data=await getPagoByID(id_pago)
  recibosReimprimirWindow!.once('ready-to-show',()=>{
    recibosReimprimirWindow!.show();
    recibosReimprimirWindow!.webContents.send('on-data-recibo',data)
  })
});
ipcMain.on('get-pagos-conceptos',async(e,p:IPagosFilterConcepto)=>e.returnValue=await getPagos(p));
ipcMain.on('get-pagos-concentrados',async(e,p:IPagosFilterConcepto)=>e.returnValue=await getPagosConcentrados(p));

ipcMain.on('open-estado-cuenta',async(e,cve_accion:number)=>{
  console.log('cve_accion->',cve_accion)
  estadoCuentaWindow=createWindow({url:'estado_cuenta',width:1000,height:600,center:true,parent:cajaWindow,modal:true});
  const data=await estadoCuenta(cve_accion)

  console.log("🚀 ~ file: main.ts:359 ~ ipcMain.on ~ data:", data);

  await new Promise((resolve,reject)=>{
  estadoCuentaWindow!.once('ready-to-show',()=>{estadoCuentaWindow!.show();resolve(true)})
  })
  estadoCuentaWindow.webContents.send('on-data-estado-cuenta',data)
})

ipcMain.on('imprimir-estado-cuenta',(e)=>{
  estadoCuentaWindow!.webContents.print({
    silent: true,
    deviceName: "",
    printBackground: true,
    color: false,
    copies: 1,
  },(success, error) => {if(success) {estadoCuentaWindow!.close();estadoCuentaWindow=undefined}})
})

ipcMain.on('open-factura-v4',async(e,cve_accion:number,idpago:number)=>{
  console.log("🚀 ~ file: main.ts ~ line 292 ~ ipcMain.on ~ cve_accion", cve_accion)
  console.log("🚀 ~ file: main.ts ~ line 293 ~ ipcMain.on ~ idpago", idpago)
  facturaV4Window=createWindow({url:'factura_v4',width:900,height:750,center:true,parent:recibosWindow,modal:true});
  const pago_faturar=await findPagoFacturar(idpago);
  console.log("🚀 ~ file: main.ts ~ line 297 ~ ipcMain.on ~ pago_faturar", pago_faturar)
  const direcciones_facturar=await findDireccionesFacturacion(cve_accion)
  console.log("🚀 ~ file: main.ts ~ line 299 ~ ipcMain.on ~ direcciones_facturar", direcciones_facturar)
  await new Promise((resolve,reject)=>{
    facturaV4Window!.once('ready-to-show',()=>{facturaV4Window!.show();resolve(true)})
  })
  facturaV4Window.webContents.send('on-data-facturar',pago_faturar,direcciones_facturar)
})

ipcMain.on('create-inscripcion',async(e,data:IInscripcion)=>e.returnValue=await saveInscripcion(data))

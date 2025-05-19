import {fnMysql} from '../db'
import ceil from 'lodash/ceil'
import { isEmpty, maxBy } from 'lodash'
import {IPago,IPagosFilterConcepto} from './../model/model-type'
// import { net } from 'electron'
import Store from 'electron-store'

const store =new Store()

const getSociosAccion = async (cve_accion) => {
    
    let pool = await fnMysql();
    let connection=await pool.getConnection()
    try {
      let socios = await connection.query(
        `
    SELECT 
        cve_socio,persona.cve_persona,nombre,apellido_paterno,apellido_materno
    FROM socios
    INNER JOIN persona USING(cve_persona)
    WHERE cve_accion=?
      `,
        [cve_accion]
      );

      return socios;
    } catch (e) {
      console.log(e)
      return e;
    }
    finally
    {
      await connection.release();//se regres ala connecion al pool
    }
  };

const getFormasPago = async () => {
    let pool = await fnMysql();
    let connection = await pool.getConnection()
    try {
        let formas_pago_sat = await connection.query(`SELECT * FROM forma_pago_sat WHERE estatus=1;`);

        return formas_pago_sat;
    }
    catch (e) {
        console.log(e)
        return false;
    }
    finally {
        await connection.release();//se regres ala connecion al pool
    }

}

const getBancos = async () => {
    let pool = await fnMysql();
    let connection = await pool.getConnection()
    try {
        let bancos = await connection.query(`SELECT cve_banco AS id, nombre AS name FROM catalogo_bancos WHERE estatus=1;`);

        return bancos;
    }
    catch (e) {
        console.log(e)
        return false;
    }
    finally {
        await connection.release();//se regres ala connecion al pool
    }

    return false;

}

const savePago = async (p:IPago):Promise<number> => {  
    const cve_persona=store.get('cve_persona')
    let pool = await fnMysql();//inicia el pool
    let connection=await pool.getConnection();//obtiene conexion del pool
    try {
        //inicia transaccion
      await connection.beginTransaction();

    //obtengo el ultimo folio del ultimo pago
      let [{folio}]=await connection.query('SELECT IFNULL(MAX(folio),0) AS folio FROM pago;');

      //inserta el pago
      let {insertId:idpago}=await connection.query(`
      INSERT INTO 
      pago(folio,persona_cobra,fecha_hora_cobro,subtotal,iva, total, descuento,recargo,folio_m8) 
      VALUES(?,?,NOW(),?,?,?,?,?,?)`,
      [(folio+1),cve_persona,ceil(p.subtotal,2),ceil(p.iva,2),p.total,ceil(p.descuento,2),p.recargo,p.folio_m8??'']);
    
      //se actualizan los cargos que se pagaron pero primero se muta para que sea correcto
      let cargos_pagar_map=p.cargos_pagar.map(i=>({idpago:idpago,cve_cargo:i}));
      cargos_pagar_map.forEach(async i=>{
          await connection.query('UPDATE cargo SET idpago=? where cve_cargo=?',[i.idpago,i.cve_cargo])
      })
      
      //inserto las formas de pago (efectivo , credito etc), pero se mutua para que sea un array simple 
      let forma_pagos=p.forma_pagos.map(i=>([idpago,i.clave,i.monto,i.banco,i.cheque]))
      await connection.query('INSERT INTO forma_pago(idpago, clave, monto, banco,numero_cheque) VALUES ?;',[forma_pagos])

     //se revisa que de la accion que pago no tenga mas adeudos que proiban el acceso
     let [{cargos}]=await connection.query(`
     SELECT COUNT(cve_cargo) cargos 
     FROM  cargo
     INNER JOIN cuota USING(cve_cuota)
     WHERE idpago IS NULL AND cuota.obligatoria=1 AND cve_accion=?;`,[p.cve_accion])
      //si lso cargos que bloean es 0 se realiza la activacion de la accion
     if(cargos==0){
         await connection.query('UPDATE acciones SET estatus=1 WHERE cve_accion=?',[p.cve_accion])
     }
   //se termina la transaccion
     await connection.commit(); 

    // return {idpago,folio:(folio+1)};//regreso el folio
    return idpago;
   }
   catch(e)
   {
       console.error(e)
       await connection.rollback();
       return 0;
   }
   finally{
       await connection.release();//se regres ala connecion al pool
   }
}

const savePagoCero = async (cve_accion:number,cargos_pagar:number[]):Promise<number> => {    

    const cve_persona=store.get('cve_persona')

    let pool = await fnMysql();
    let connection=await pool.getConnection();
    try {
        //inicia transaccion
      await connection.beginTransaction();

    //obtengo el ultimo folio 
      let [{folio}]=await connection.query('SELECT IFNULL(MAX(folio),0) AS folio FROM pago;');

      //inserta el pago
      let {insertId:idpago}=await connection.query(`INSERT INTO pago(folio,persona_cobra,fecha_hora_cobro,subtotal,iva, total, descuento,recargo) 
      VALUES(?,?,NOW(),?,?,?,?,?)`,[(folio+1),cve_persona,0,0,0,0,0]);
    
      //se actualizan los cargos que se pagaron pero primero se muta para que sea correcto     
      cargos_pagar.forEach(async i=>{
          await connection.query('UPDATE cargo SET idpago=? where cve_cargo=?',[idpago,i])
      })
      
      //inserto las formas de pago (efectivo , credito etc), default es [idpago,clave(1 efectivo),banco('-'),cheque('-')]
      await connection.query('INSERT INTO forma_pago(idpago, clave, monto, banco,numero_cheque) VALUES (?,1,0,"-","-");',[idpago])

     //se revisa que de la accion que pago no tenga mas adeudos que proiban el acceso
     let [{cargos}]=await connection.query(`
     SELECT COUNT(cve_cargo) cargos 
     FROM  cargo
     INNER JOIN cuota USING(cve_cuota)
     WHERE idpago IS NULL AND cuota.obligatoria=1 AND cve_accion=?;`,[cve_accion])
      //si lso cargos que bloean es 0 se realiza la activacion de la accion
     if(cargos==0){
         await connection.query('UPDATE acciones SET estatus=1 WHERE cve_accion=?',[cve_accion])
     }
   //se termina la transaccion
     await connection.commit(); 

    return idpago;//regreso el id pago
   }
   catch(e)
   {
       console.error(e)
       await connection.rollback();
       return 0
   }
   finally{
       await connection.release();//se regres ala connecion al pool
   }
}

const getPagos = async (p:IPagosFilterConcepto) => {
        
    console.log("🚀 ~ file: pagoDao.ts ~ line 226 ~ getPagos ~ store", store.get('cve_persona'))

    let { cajero, fecha_inicio, fecha_fin } = p
    console.log("🚀 ~ file: pagoDao.ts ~ line 182 ~ getPagos ~ fecha_fin", fecha_fin)
    console.log("🚀 ~ file: pagoDao.ts ~ line 182 ~ getPagos ~ fecha_inicio", fecha_inicio)
    console.log("🚀 ~ file: pagoDao.ts ~ line 182 ~ getPagos ~ cajero", cajero)
    const cve_persona=store.get('cve_persona');

    let pool = await fnMysql();
    let connection = await pool.getConnection();
    try {
        let pagos_concepto = await connection.query(`SELECT 
CONCAT(numero_accion,CASE clasificacion WHEN 1 THEN 'A' WHEN 2 THEN 'B' WHEN 3 THEN 'C' ELSE '' END) AS accion,
cuota.numero_cuota,
cargo.concepto,
cargo.periodo,
cargo.subtotal,
cargo.iva,
cargo.cantidad,
cargo.recargo,
descuento.monto,
CONCAT_WS(' ',socio.nombre,socio.apellido_paterno,socio.apellido_materno) AS sociox,
folio,
fecha_hora_cobro,
(cargo.total*cargo.cantidad) AS total,
pago.descuento,
CONCAT_WS(' ',cajero.nombre,cajero.apellido_paterno,cajero.apellido_materno) AS cajerox ,
cargo.cve_cargo
FROM pago 
INNER JOIN cargo USING(idpago)
LEFT JOIN descuento USING(cve_cargo)
INNER JOIN cuota USING(cve_cuota)
INNER JOIN acciones USING(cve_accion)
INNER JOIN persona AS cajero ON(cajero.cve_persona=pago.persona_cobra)
INNER JOIN persona AS socio ON(socio.cve_persona=cargo.cve_persona) WHERE pago.persona_cobra=? AND CONVERT(fecha_hora_cobro,DATE) BETWEEN ? AND ?;`, [cve_persona, fecha_inicio, fecha_fin]);
       
        return pagos_concepto;
    }
    catch (e) {
        return [];
    }
    finally{await connection.release()}

}
    

const getPagosConcentrados = async (p:IPagosFilterConcepto) => {
    const cve_persona=store.get('cve_persona')
    console.log("🚀 ~ file: pagoDao.ts ~ line 234 ~ getPagosConcentrados ~ cve_persona", cve_persona)
    let { cajero, fecha_inicio, fecha_fin } = p
    console.log("🚀 ~ file: pagoDao.ts ~ line 235 ~ getPagosConcentrados ~ fecha_fin", fecha_fin)
    console.log("🚀 ~ file: pagoDao.ts ~ line 235 ~ getPagosConcentrados ~ fecha_inicio", fecha_inicio)
    
    let pool = await fnMysql();
    let connection = await pool.getConnection();
    try {
        let conceptos = await connection.query(`SELECT 
cuota.numero_cuota AS cve_cuota,
cuota.descripcion,
COUNT(cuota.cve_cuota) AS cantidad,
ROUND(((SUM(cargo.total*cargo.cantidad)-SUM(IFNULL(descuento.monto,0)))/116)*100,2)  AS subtotal ,
ROUND((((SUM(cargo.total*cargo.cantidad)-SUM(IFNULL(descuento.monto,0)))/116)*100)*.16,2)  AS iva ,
SUM(cargo.total*cargo.cantidad) AS monto,
SUM(IFNULL(descuento.monto,0)) AS descuento,
SUM(cargo.total*cargo.cantidad)-SUM(IFNULL(descuento.monto,0)) AS total
FROM pago 
INNER JOIN cargo USING(idpago)
LEFT JOIN descuento using(cve_cargo)
INNER JOIN cuota USING(cve_cuota) 
WHERE pago.persona_cobra=? AND CONVERT(pago.fecha_hora_cobro,DATE) BETWEEN ? AND ? GROUP BY cuota.cve_cuota`, [cve_persona, fecha_inicio, fecha_fin]);

        let forma_pago = await connection.query(`SELECT
forma_pago.clave,
SUM(forma_pago.monto) AS monto
FROM pago 
INNER JOIN forma_pago USING(idpago)
WHERE pago.persona_cobra=? AND CONVERT(pago.fecha_hora_cobro,DATE) BETWEEN ? AND ? GROUP BY forma_pago.clave`, [cve_persona, fecha_inicio, fecha_fin]);
       

        return { conceptos, forma_pago };
    }
    catch (e) {
        return false;
    }
    finally{await connection.release()}

}

const verificCuotaActivacion=async (cargos:number[])=>{

    let pool = await fnMysql();
    let connection = await pool.getConnection();
    try {
        let flag_mantenimiento:boolean=false 
        const [data] = await connection.query(`
    SELECT 
        cve_accion,
        DATE_FORMAT(NOW(),'%m-%Y') AS periodo,
        cargo.cve_persona 
    FROM cargo 
    WHERE 
        cargo.cve_cargo IN (?)
    AND 
        cve_cuota=5;`,[cargos])
        
        if(data)
        {
            const {cve_accion,periodo} =data;
            let [mant_ok]=await connection.query(`SELECT cve_cargo FROM cargo WHERE cve_accion=? AND periodo=? AND cve_cuota=1 LIMIT 1`,[cve_accion,periodo])
            if(mant_ok)flag_mantenimiento=true
        }
        
        return {...data,mantenimiento:flag_mantenimiento};
    }
    catch (e) {
        return false;
    }
    finally{await connection.release()}
}




export { getFormasPago, getBancos, savePago,savePagoCero, getPagos, getPagosConcentrados ,getSociosAccion,verificCuotaActivacion}
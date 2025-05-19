import {fnMysql} from '../db'
import Store from 'electron-store'
import numeral from 'numeral'
import {ceil} from 'mathjs'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { IAddCargo, IAddCargoParcialidad } from '../model/model-type'

dayjs.extend(utc)
dayjs.extend(timezone)
console.log(dayjs.tz.guess())
dayjs.locale('es', {}, true);
// dayjs.tz.setDefault('Europe/Madrid');
dayjs.tz.setDefault('America/Mazatlan')
console.log(dayjs.tz.guess())
console.log(dayjs())


const prueba_time_zone_cargo_dao=async ()=>
{
  console.log('incia prueba timezone cargo')
  let pool = await fnMysql();
  let connection =await pool.getConnection()
  try {
    await connection.query(`INSERT INTO prueba_timezone(fecha_curdate,fecha_now,fecha_carbon,fecha_nativa_php,back) VALUES(CURDATE(),NOW(),?,?,'cargo_dao_caja_desktop')`,[dayjs().tz().format(),new Date()]);
    
  } catch (error) {
    console.log(error)
  }
  finally{
    await connection.release()
    console.log('finaliza prueba timezone cargo')

  }
}

const store=new Store()

const getCuotas = async () => {
  let pool = await fnMysql();
  let connection =await pool.getConnection()
  try {
    let cuotas = await connection.query(`
SELECT 
      CONCAT_WS(' ',cve_cuota,cuota) AS cuota,
      numero_cuota,
      cuota AS concepto,
      cve_cuota,
      cuota.producto_servicio,
		  tipo_cuota,
		  genero_aplica,
		  edad_aplica,
      GROUP_CONCAT(cve_parentesco) AS parentesco,
      GROUP_CONCAT(cve_tipo_accion) AS membresia,
      precio AS total,
      opcion_iva,
		  veces_aplicar,
		  editable,
      cuota.no_adeudo_anterior,
      cuota.is_inscripcion
FROM cuota
LEFT JOIN cuota_parentesco USING(cve_cuota) 
LEFT JOIN cuota_accion USING(cve_cuota)  
WHERE estatus=1 GROUP BY cve_cuota
`);

/*SELECT 
      CONCAT_WS(' ',cve_cuota,descripcion) AS cuota,
      descripcion AS concepto,
      cve_cuota,tipo_cuota,sexo_aplica,edad_aplica,
      GROUP_CONCAT(cve_parentesco) AS parentesco,
      GROUP_CONCAT(cve_tipo_accion) AS membresia,
      cantidad AS total,cantidad_sin_iva AS subtotal, 
      iva,veces_aplicar,editable_cajero 
FROM cuota 
LEFT JOIN cuota_parentesco USING(cve_cuota) 
LEFT JOIN cuota_accion USING(cve_cuota)  
WHERE estatus=1 GROUP BY cve_cuota*/


    return cuotas;
  } catch (e) {
    return false;
  }
  finally{
    await connection.release();//se regres ala connecion al pool
  }
};

const getSociosAplica = async (cve_accion:number, edad:number, sexo:number, parentesco:number) => {
  console.log('cve_accion=>',cve_accion,'edad=>', edad,'genero=>', sexo,'parestecos=>', parentesco);
  let pool = await fnMysql();
  let connection=await pool.getConnection()
  try {
    let socios = await connection.query(
      `
SELECT 
    cve_socio,persona.cve_persona,nombre,apellido_paterno,apellido_materno,
    sexo,fecha_nacimiento,cve_parentesco,TIMESTAMPDIFF(YEAR,persona.fecha_nacimiento,NOW()) AS edad FROM 
socios
INNER JOIN persona USING(cve_persona)
WHERE cve_accion=? 
AND TIMESTAMPDIFF(YEAR,persona.fecha_nacimiento,NOW())>=? 
AND sexo IN(?) 
AND cve_parentesco IN(?)
    `,
      [cve_accion, edad, sexo, parentesco]
    );

    console.log(socios)
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

const getDuenoAplica = async (cve_accion:number, membresias:number) => {
  console.log(cve_accion, membresias);
  let pool = await fnMysql();
  let connection=await pool.getConnection()
  try {
    let [dueno] = await connection.query(
      `
    SELECT 
          cve_dueno,
          persona.cve_persona,
          nombre,
          apellido_paterno,apellido_materno 
    FROM dueno
    INNER JOIN persona USING(cve_persona)
    INNER JOIN acciones USING(cve_dueno)
    WHERE cve_accion=? AND cve_tipo_accion IN(?);
    `,
      [cve_accion, membresias]
    );   

    return dueno;
  } catch (e) {
    console.log(e)
    return e;
  }
  finally{
    await connection.release();//se regres ala connecion al pool
  }
};

const saveCargo = async (data:IAddCargo) => {
  
  const cve_persona_responsable_cargo=store.get('cve_persona')
  
  let pool = await fnMysql();
  let connection=await pool.getConnection();
  try {   
    let id_cargo:number|null = 0
    //indicara si se procede a agregar el cargo
    let flag_add:boolean=true;

    //si veces a plicar es 1 verifica si el cargo ya existe
    if(data.veces_aplicar==1)
    {
      let [{ cargos }] = await connection.query(`SELECT COUNT(cve_cargo) cargos FROM  cargo WHERE cve_cuota=? AND periodo=? AND cve_accion=? AND cve_persona = ?;`,[data.cve_cuota,data.periodo,data.cve_accion,data.cve_persona]);
      flag_add=!Boolean(cargos);
    }

    if(flag_add)
    {
    await connection.beginTransaction();

    // consulta que nos indica si existe un descuento para aplicar y cual es el monto del descuento
    let [montoDescuento] = await connection.query(`SELECT COUNT(monto) yes,monto FROM descuento_programado WHERE cve_accion=? AND cve_persona=? AND cve_cuota=? AND periodo=?;`,[data.cve_accion,data.cve_persona,data.cve_cuota,data.periodo]);
    
    //inserta el cargo
    let { insertId } = await connection.query(`INSERT INTO cargo(cve_accion,cve_cuota,cve_persona,concepto,total,subtotal,iva,cantidad,periodo,responsable_carga) VALUES(?,?,?,?,?,?,?,?,?,?)`,[data.cve_accion,data.cve_cuota,data.cve_persona,data.concepto,data.total,data.subtotal,data.iva,data.cantidad,data.periodo,cve_persona_responsable_cargo]);
    //inserta el descuento si es que se encontro
    if(Boolean(montoDescuento.yes)) await connection.query(`INSERT INTO descuento(cve_cargo,persona_otorga,monto,descripcion,fecha_aplicacion) VALUES(?,0,?,'desc programado',NOW())`,[insertId,montoDescuento.monto]);
    
    id_cargo=insertId//asigana el id de cargo que se agrego
    
    await connection.commit();
    }

    return id_cargo;
    
  } catch (e) {
    console.log('Error=>',e)
    await connection.rollback();
    return null;
  }
  finally{
    console.log('finally save-pago')
    await connection.release();//se regres ala connecion al pool
  }
};

const saveCargoParcialidades=async(data:IAddCargoParcialidad)=>{
  const cve_persona_responsable_cargo=store.get('cve_persona')
  
  let pool = await fnMysql();
  let connection=await pool.getConnection();
  try {   
    let id_cargo:number[]=[]
    //indicara si se procede a agregar el cargo
    let flag_add:boolean=true;

    //se obtiene el precio de la cuota de activacipon 
    const [{precio}]=await connection.query(`SELECT cuota.precio FROM cuota WHERE cve_cuota=5`)


    console.log("🚀 ~ file: cargoDao.ts:193 ~ saveCargoParcialidades ~ precio:", precio);

    //se saca el mod(residuo si es cero es un numero que se puede divir sin arogar decimales) y en caso contrario el mod se le resta al precio
    //ejemplo (5 % 3)=2 el mod es 2 y (4 % 2)=0 mod es cero
    const restante_mod=precio-(precio % data.parcialidad)//es el mod
    const costo_parcial=restante_mod/data.parcialidad

    console.log("🚀 ~ file: cargoDao.ts:199 ~ saveCargoParcialidades ~ restante_mod:", restante_mod);
    const cargos_parciales=Array(data.parcialidad).fill(costo_parcial)
    cargos_parciales[data.parcialidad-1]=numeral(costo_parcial).add(precio % data.parcialidad).value()


    //si veces a plicar es 1 verifica si el cargo ya existe
    if(data.veces_aplicar==1)
    {
      let [{ cargos }] = await connection.query(`SELECT COUNT(cve_cargo) cargos FROM  cargo WHERE cve_cuota=? AND periodo=? AND cve_accion=? AND cve_persona = ?;`,[data.cve_cuota,data.periodo,data.cve_accion,data.cve_persona]);
      flag_add=!Boolean(cargos);
    }

    if(flag_add)
    {
    await connection.beginTransaction();

    // consulta que nos indica si existe un descuento para aplicar y cual es el monto del descuento
    let [montoDescuento] = await connection.query(`SELECT COUNT(monto) yes,monto FROM descuento_programado WHERE cve_accion=? AND cve_persona=? AND cve_cuota=? AND periodo=?;`,[data.cve_accion,data.cve_persona,data.cve_cuota,data.periodo]);
    let index=0;
    const total_les=cargos_parciales.length
    for(const cargo_ of cargos_parciales)
      {
        index++;
        let { insertId } = await connection.query(
          `INSERT INTO cargo(cve_accion,cve_cuota,cve_persona,concepto,total,subtotal,iva,cantidad,periodo,responsable_carga) VALUES(?,?,?,?,?,?,?,?,?,?)`,
          [data.cve_accion,data.cve_cuota,data.cve_persona,`${data.concepto} (${index} de ${total_les})`,cargo_,0,0,data.cantidad,data.periodo,cve_persona_responsable_cargo]);
        console.log("🚀 ~ file: cargoDao.ts:223 ~ constr_cargo_=awaitnewPromise ~ r_cargo_:", insertId);
        id_cargo.push(insertId)
      }


    //inserta el cargo
    /////let { insertId } = await connection.query(`INSERT INTO cargo(cve_accion,cve_cuota,cve_persona,concepto,total,subtotal,iva,cantidad,periodo,responsable_carga) VALUES(?,?,?,?,?,?,?,?,?,?)`,[data.cve_accion,data.cve_cuota,data.cve_persona,data.concepto,data.total,data.subtotal,data.iva,data.cantidad,data.periodo,cve_persona_responsable_cargo]);
    //inserta el descuento si es que se encontro
    /////if(Boolean(montoDescuento.yes)) await connection.query(`INSERT INTO descuento(cve_cargo,persona_otorga,monto,descripcion,fecha_aplicacion) VALUES(?,0,?,'desc programado',NOW())`,[insertId,montoDescuento.monto]);
    
    /////id_cargo=insertId//asigana el id de cargo que se agrego
    
    await connection.commit();
    }

    return id_cargo;
    
  } catch (e) {
    console.log('Error=>',e)
    await connection.rollback();
    return null;
  }
  finally{
    console.log('finally save-pago')
    await connection.release();//se regres ala connecion al pool
  }
}

const deleteCargo = async (data)=>
{

  let pool = await fnMysql();
  let connection=await pool.getConnection();
  try {
    await connection.beginTransaction();

     await connection.query(
        `INSERT INTO 
        cancelar_cargo(cve_cancelar_cargo,cve_accion,cve_cuota,cve_persona,concepto,total,subtotal,iva,cantidad,periodo,responsable_carga,responsable_cancelar,fecha_cargo,recargo,motivo_cancelacion)
        SELECT cve_cargo,cve_accion,cve_cuota,cve_persona,concepto,total,subtotal,iva,cantidad,periodo,responsable_carga,?,fecha_cargo,recargo,?  
        FROM cargo WHERE cve_cargo IN(?)`,
        [data.responsable_cargo,data.motivo_cancelacion,data.cargos_pagar]
      );

      let nDelete=await connection.query(`DELETE FROM cargo WHERE cve_cargo IN(?)`,[data.cargos_pagar]);

      let [{cargos}] = await connection.query(
        `SELECT COUNT(cve_cargo) cargos FROM  cargo
        INNER JOIN cuota USING(cve_cuota)
        WHERE idpago IS NULL AND cuota.obligatoria=1 AND cve_accion=?;`,
        [data.cve_accion]
      );

      if(cargos===0) await connection.query(`UPDATE acciones SET estatus=1 WHERE cve_accion=?`,[data.cve_accion]);
      

      await connection.commit();
      return nDelete;
    
  } catch (e) {
      console.log('error=>',e)
    await connection.rollback();
    return {cargo:0}
  }
  finally{
    await connection.release();//se regres ala connecion al pool
  }
}

const saveMantenimientoFull = async (opcion:number,cve_accion:number,cve_persona:number,periodo:string):Promise<number> => {
    
  const cve_persona_responsable_cargo=store.get('cve_persona')
  
  
  let pool = await fnMysql();
  let connection=await pool.getConnection();
  try {   
  
    // await connection.beginTransaction();
    
    const [{concepto,total}]:{concepto:string,total:number}[]=await connection.query(`SELECT cuota.cuota AS concepto,precio AS total FROM cuota WHERE cve_cuota=1 LIMIT 1`);    
    if(opcion==1)
    {
      let { insertId } = await connection.query(`INSERT INTO cargo(cve_accion,cve_cuota,cve_persona,concepto,total,subtotal,iva,cantidad,periodo,responsable_carga) VALUES(?,?,?,?,?,?,?,?,?,?)`,[cve_accion,1,cve_persona,concepto,0,0,0,1,periodo,cve_persona_responsable_cargo]);
      await connection.query(`DELETE FROM cargo WHERE cve_cargo=?`,[insertId])
      // return insertId
      return 0
    }
    else if(opcion==2)
    {
      const subtotal:number=numeral(total).divide(116).multiply(100).value()!
      const iva:number=numeral(total).divide(116).multiply(100).multiply(16).divide(100).value()!
      let { insertId } = await connection.query(`INSERT INTO cargo(cve_accion,cve_cuota,cve_persona,concepto,total,subtotal,iva,cantidad,periodo,responsable_carga) VALUES(?,?,?,?,?,?,?,?,?,?)`,[cve_accion,1,cve_persona,concepto,total,ceil(subtotal,2),ceil(iva,2),1,periodo,cve_persona_responsable_cargo]);
      // return {total,subtotal:ceil(subtotal,2),iva:ceil(iva,2)}
      return insertId;
    }
    else if(opcion==3)
    { 
      const dias_mes:number=dayjs().daysInMonth();
      const dia_actual:number=dayjs().date();
      const dias_restantes:number=numeral(dias_mes).subtract(dia_actual).value()!
      const total_parcial=numeral(total).divide(dias_mes).multiply(dias_restantes).value()
      const subtotal=numeral(total_parcial).divide(116).multiply(100).value()!
      const iva=numeral(total_parcial).divide(116).multiply(100).multiply(16).divide(100).value()!
      let { insertId } = await connection.query(`INSERT INTO cargo(cve_accion,cve_cuota,cve_persona,concepto,total,subtotal,iva,cantidad,periodo,responsable_carga) VALUES(?,?,?,?,?,?,?,?,?,?)`,[cve_accion,1,cve_persona,concepto,ceil(total_parcial!,2),ceil(subtotal,2),ceil(iva,2),1,periodo,cve_persona_responsable_cargo]);
      // return {total_parcial,subtotal,iva}
      return insertId;
    }

    //inserta el cargo
   
   
    // await connection.commit();
    
    // return insertId;

    return 0
    
  } catch (e) {
    console.log('Error=>',e)
    await connection.rollback();
    return 0;
  }
  finally{
    console.log('finally')
    await connection.release();//se regres ala connecion al pool
  }
};

 

export { getCuotas, getSociosAplica, getDuenoAplica, saveCargo, deleteCargo ,saveMantenimientoFull,saveCargoParcialidades,prueba_time_zone_cargo_dao};

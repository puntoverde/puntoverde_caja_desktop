import {fnMysql} from '../db'



// const findAccion=async(n_accion,clasificacion)=>
// { 
//     let pool= await fnMysql();
//     let connection=await pool.getConnection();
//     try{
// let [accion] =await connection.query(`
// SELECT 
//     cve_accion,CONCAT(numero_accion,CASE clasificacion WHEN 1 THEN 'A' WHEN 2 THEN 'B' WHEN 3 THEN 'C' ELSE '' END) accion,
//     cve_dueno,acciones.estatus,persona.nombre,apellido_paterno,apellido_materno,tipo_accion.nombre AS tipo_accion, dueno.rfc
// FROM acciones
// INNER JOIN tipo_accion USING(cve_tipo_accion)
// INNER JOIN dueno USING(cve_dueno)
// INNER JOIN persona USING(cve_persona) 
// WHERE numero_accion=? AND clasificacion=?;`,[n_accion,clasificacion]);

// let cargos=await connection.query(`
// SELECT 
//       cve_cargo,cve_accion,cve_cuota, cve_persona, concepto, total, subtotal, iva, cantidad, periodo, 
//       responsable_carga, fecha_cargo, recargo, idpago, IFNULL(monto,0) AS descuento, cargo.estatus,
//       CONCAT_WS(' ',nombre,apellido_paterno,apellido_materno) AS persona ,ifnull(historico_invitado_socio.cve_socio,0) AS invitado 
// FROM cargo 
// INNER JOIN persona USING(cve_persona)
// LEFT JOIN descuento USING(cve_cargo)
// LEFT JOIN historico_invitado_socio USING(cve_cargo)
// WHERE cve_accion=? AND idpago IS NULL`,[accion.cve_accion])

// return {accion,cargos};
//     }
//     catch(e){
//         console.error(e)
//         return false;
//     }
//     finally{await connection.release();}//se regres ala connecion al pool

// }

const findAccion=async(n_accion,clasificacion)=>
{ 
    let pool= await fnMysql();
    let connection=await pool.getConnection();
    try{
let [accion] =await connection.query(`
SELECT 
    cve_accion,CONCAT(numero_accion,CASE clasificacion WHEN 1 THEN 'A' WHEN 2 THEN 'B' WHEN 3 THEN 'C' ELSE '' END) accion,
    cve_dueno,acciones.estatus,persona.nombre,apellido_paterno,apellido_materno,tipo_accion.nombre AS tipo_accion, dueno.rfc
FROM acciones
INNER JOIN tipo_accion USING(cve_tipo_accion)
INNER JOIN dueno USING(cve_dueno)
INNER JOIN persona USING(cve_persona) 
WHERE numero_accion=? AND clasificacion=?;`,[n_accion,clasificacion]);

return accion;
    }
    catch(e){
        console.error(e)
        return false;
    }
    finally{await connection.release();}//se regres ala connecion al pool

}

const findCargosByAccion=async(cve_accion:number)=>
{

    let pool= await fnMysql();
    let connection=await pool.getConnection();
    try{

     let cargos=await connection.query(`
     SELECT 
     cargo.cve_cargo, cuota.numero_cuota ,cuota.producto_servicio,cve_accion,cargo.cve_cuota, persona.cve_persona, concepto, total, subtotal, cargo.iva, cargo.cantidad, periodo, 
     responsable_carga, fecha_cargo, recargo, idpago, IFNULL(monto,0) AS descuento, cargo.estatus,
     CONCAT_WS(' ',nombre,apellido_paterno,apellido_materno) AS persona ,ifnull(historico_invitado_socio.cve_socio,0) AS invitado,cuota.no_adeudo_anterior 
FROM cargo 
INNER JOIN cuota ON cargo.cve_cuota=cuota.cve_cuota
INNER JOIN persona ON cargo.cve_persona=persona.cve_persona
LEFT JOIN descuento ON cargo.cve_cargo=descuento.cve_cargo
LEFT JOIN historico_invitado_socio ON cargo.cve_cargo=historico_invitado_socio.cve_cargo
WHERE cve_accion=? AND idpago IS NULL ORDER BY cargo.cve_cargo ASC, cargo.fecha_cargo DESC`,[cve_accion])

return cargos;
    }
    catch(e){
        console.error(e)
        return false;
    }
    finally{await connection.release();}//se regres ala connecion al pool

}

const estadoCuenta=async(cve_accion:number)=>
{

    let pool= await fnMysql();
    let connection=await pool.getConnection();
    try{

     let cargos=await connection.query(`
     SELECT 
     	cargo.cve_cuota,
        cuota.numero_cuota,
     	cargo.concepto,
     	if(cuota.tipo_cuota=1,persona.nombre,'TITULAR') AS usuario,
     	cargo.periodo,
     	cargo.total AS costo,
     	cargo.cantidad,
     	IFNULL(descuento.monto,0) AS descuento,
     	(cargo.total*cargo.cantidad) AS total
     FROM cargo
     INNER JOIN cuota ON cargo.cve_cuota=cuota.cve_cuota
     INNER JOIN persona ON cargo.cve_persona=persona.cve_persona
     LEFT JOIN descuento ON cargo.cve_cargo=descuento.cve_cargo
     WHERE cve_accion=? AND cargo.idpago IS NULL
     `,[cve_accion])

     let [accion_titular]=await connection.query(`
    SELECT 
        CONCAT(acciones.numero_accion,CASE acciones.clasificacion WHEN 1 THEN 'A' WHEN 2 THEN 'B' WHEN 3 THEN 'C' ELSE '' END) AS accion,
        CONCAT_WS(' ',persona.nombre,persona.apellido_paterno,persona.apellido_materno) AS titular
    FROM acciones
    INNER JOIN dueno ON acciones.cve_dueno=dueno.cve_dueno
    INNER JOIN persona ON dueno.cve_persona=persona.cve_persona
    WHERE acciones.cve_accion=? GROUP BY acciones.cve_accion
     `,[cve_accion])

return {accion_titular,cargos};
    }
    catch(e){
        console.error(e)
        return false;
    }
    finally{await connection.release();}//se regres ala connecion al pool

}

export {findAccion,findCargosByAccion,estadoCuenta}
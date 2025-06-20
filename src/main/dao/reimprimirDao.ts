import {fnMysql} from '../db'


const findAccionReimprimir=async(n_accion:number,clasificacion:number)=>
{

    console.log("🚀 ~ file: reimprimirDao.ts ~ line 8 ~ n_accion", n_accion)
    console.log("🚀 ~ file: reimprimirDao.ts ~ line 8 ~ clasificacion", clasificacion)
    let pool= await fnMysql();
    let connection= await pool.getConnection()
    try{
let [accion] =await connection.query(`
SELECT 
    cve_accion,CONCAT(numero_accion,CASE clasificacion WHEN 1 THEN 'A' WHEN 2 THEN 'B' WHEN 3 THEN 'C' ELSE '' END) accion,
    cve_dueno,acciones.estatus,persona.nombre,apellido_paterno,apellido_materno,tipo_accion.nombre AS tipo_accion
FROM acciones
INNER JOIN tipo_accion USING(cve_tipo_accion)
INNER JOIN dueno USING(cve_dueno)
INNER JOIN persona USING(cve_persona) 
WHERE numero_accion=? AND clasificacion=?;`,[n_accion,clasificacion]);

console.log("🚀 ~ file: reimprimirDao.ts ~ line 24 ~ accion", accion)
return accion;
    }
    catch(e){
        return false;
    }
    finally{await connection.release();}//se regres ala connecion al pool

}

const pagosPeriodo=async(accion:number,periodos:string[])=>
{  	
	let pool= await fnMysql();
let connection =await pool.getConnection()
    try{
		// SELECT pago.idpago,pago.folio,pago.total,pago.fecha_hora_cobro,cargo.periodo,GROUP_CONCAT(DISTINCT CONCAT_WS(',',cuota.producto_servicio,cargo.concepto,cargo.total,IFNULL(descuento.monto,0),cargo.cantidad,cargo.periodo,cargo.cve_cargo) SEPARATOR '--') AS cargos, persona.nombre,persona.apellido_paterno,persona.apellido_materno ,GROUP_CONCAT(DISTINCT CONCAT_WS(',',forma_pago_sat.forma_pago,forma_pago.monto) SEPARATOR '-') AS forma_pago FROM cargo
		let pagos =await connection.query(`
SELECT pago.idpago,pago.folio,pago.total,pago.fecha_hora_cobro,cargo.periodo,GROUP_CONCAT(DISTINCT CONCAT_WS(',',cuota.cve_cuota,cargo.concepto,cargo.total,IFNULL(descuento.monto,0),cargo.cantidad,cargo.periodo,cargo.cve_cargo) SEPARATOR '--') AS cargos, persona.nombre,persona.apellido_paterno,persona.apellido_materno ,GROUP_CONCAT(DISTINCT CONCAT_WS(',',forma_pago_sat.forma_pago,forma_pago.monto) SEPARATOR '-') AS forma_pago FROM cargo
INNER JOIN pago USING(idpago)
LEFT JOIN descuento USING(cve_cargo)
INNER JOIN cuota USING(cve_cuota)
INNER JOIN persona ON(persona.cve_persona=pago.persona_cobra)
INNER JOIN forma_pago ON(pago.idpago=forma_pago.idpago)
INNER JOIN forma_pago_sat USING(clave)
WHERE cve_accion=? AND cargo.idpago IS NOT NULL AND DATE_FORMAT(pago.fecha_hora_cobro,'%m-%Y') IN(?) GROUP BY cargo.idpago`,[accion,periodos]);

return pagos;
    }
    catch(e){
        console.log(e)
        return [];
    }
    finally{await connection.release();}//se regresa la connexion al pool

}

const getPagoByID=async(id_pago:number)=>{

let pool= await fnMysql();
let connection =await pool.getConnection()
    try{
let [pago] =await connection.query(`
SELECT 
		pago.idpago,
		pago.folio,
		pago.total,
		pago.fecha_hora_cobro,
		cargo.periodo, 
		GROUP_CONCAT(
			DISTINCT 
				CONCAT_WS('¬',
					#cuota.producto_servicio,
					cuota.numero_cuota ,
					cargo.concepto,
					cargo.total, 
					IFNULL(descuento.monto,0),
					cargo.cantidad,
					cargo.periodo,
					cargo.cve_cargo) 
			SEPARATOR '|') 
		AS cargos,
		CONCAT_WS(' ',
			persona.nombre,
			persona.apellido_paterno,
			persona.apellido_materno) AS socio__,
		GROUP_CONCAT(
			DISTINCT 
				CONCAT_WS(',',
					forma_pago_sat.forma_pago,
					forma_pago.monto) 
			SEPARATOR '|') 
		AS forma_pago,
		CONCAT_WS(' ',
			colaborador.nombre,
			colaborador.apellido_paterno,
			colaborador.apellido_materno) AS persona_cobra,
		cargo.cve_accion,
		CONCAT(acciones.numero_accion,case acciones.clasificacion WHEN 1 THEN 'A' WHEN 2 THEN 'B' WHEN 3 THEN 'C' ELSE '' END) AS accion,
		
		CONCAT_WS(' ',
			persona_dueno.nombre,
			persona_dueno.apellido_paterno,
			persona_dueno.apellido_materno) AS socio
FROM cargo
INNER JOIN pago USING(idpago)
LEFT JOIN descuento USING(cve_cargo)
INNER JOIN cuota USING(cve_cuota)
INNER JOIN persona AS colaborador ON(colaborador.cve_persona=pago.persona_cobra)
INNER JOIN persona ON (persona.cve_persona=cargo.cve_persona)
INNER JOIN forma_pago ON(pago.idpago=forma_pago.idpago)
INNER JOIN forma_pago_sat USING(clave)
INNER JOIN acciones ON acciones.cve_accion=cargo.cve_accion
INNER JOIN dueno ON dueno.cve_dueno=acciones.cve_dueno
INNER JOIN persona AS persona_dueno ON dueno.cve_persona=persona_dueno.cve_persona
WHERE pago.idpago=?
GROUP BY cargo.idpago
`,[id_pago]);

return pago;
    }
    catch(e){
        console.log(e)
return null;
    }
    finally{await connection.release();}//se regresa la connexion al pool
}

const getPagosByAccion=async(cve_accion)=>
{
	let pool= await fnMysql();
	let connection =await pool.getConnection()
		try{
	let [pago] =await connection.query(`
	SELECT 
	
			cargo.periodo, 
			GROUP_CONCAT(
				DISTINCT 
					CONCAT_WS(',',
						#cuota.producto_servicio,
						cuota.cve_cuota,
						cargo.concepto,
						cargo.total, 
						IFNULL(descuento.monto,0),
						cargo.cantidad,
						cargo.periodo,
						cargo.cve_cargo) 
				SEPARATOR '|') 
			AS cargos,
			CONCAT_WS(' ',
				persona.nombre,
				persona.apellido_paterno,
				persona.apellido_materno) AS socio,
			cargo.cve_accion,
			CONCAT(acciones.numero_accion,case acciones.clasificacion WHEN 1 THEN 'A' WHEN 2 THEN 'B' WHEN 3 THEN 'C' ELSE '' END) AS accion
	FROM cargo
	LEFT JOIN descuento USING(cve_cargo)
	INNER JOIN cuota USING(cve_cuota)
	INNER JOIN persona ON(persona.cve_persona=cargo.cve_persona)
	INNER JOIN acciones ON acciones.cve_accion=cargo.cve_accion
	WHERE cargo.cve_accion=300 AND cargo.idpago IS NULL 
	GROUP BY cargo.idpago
	`,[cve_accion]);
	
	return pago;
		}
		catch(e){
			console.log(e)
	return null;
		}
		finally{await connection.release();}//se regresa la connexion al pool

}

export {findAccionReimprimir,pagosPeriodo,getPagoByID}
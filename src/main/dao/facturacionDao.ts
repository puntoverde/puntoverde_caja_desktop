import { fnMysql } from '../db'


const findDireccionesFacturacion = async (cve_accion: number) => {
    let pool = await fnMysql();
    let connection = await pool.getConnection()
    try {
        let dir_facturaciones = await connection.query(`
        SELECT 
        id_datos_facturacion,
        CONCAT(acciones.numero_accion,CASE acciones.clasificacion WHEN 1 THEN 'A' WHEN 2 THEN 'B' WHEN 3 THEN 'C' ELSE '' END) AS codigo_cliente,
        razon_social,
        datos_facturacion.rfc,
        datos_facturacion.regimen_fiscal,
        correo,
        cp,
        calle,
         num_ext,
        num_int,
        colonia,
        municipio, 
        estado, 
        pais
  FROM datos_facturacion 
  INNER JOIN socios ON datos_facturacion.cve_persona=socios.cve_persona
  INNER JOIN acciones ON socios.cve_accion=acciones.cve_accion
  WHERE socios.cve_accion=? AND datos_facturacion.estatus=1
`, [cve_accion]);

        return dir_facturaciones;
    }
    catch (e) {
        console.log(e)
        return [];
    }
    finally {
        await connection.release();//se regres ala connecion al pool
    }

}

const updateRFC = async (rfc, dueno) => {
    try {
        let pool = await fnMysql();
        let connection = await pool.getConnection()
        let update_rfc = await connection.query(`UPDATE dueno SET rfc=? WHERE cve_dueno=?`, [rfc, dueno]);

        await connection.release();//se regres ala connecion al pool

        return update_rfc;
    }
    catch (e) {
        return false;
    }

}

const findPagoFacturar = async (idpago: number) => {

    let pool = await fnMysql();
    let connection = await pool.getConnection()
    try {

        let [facturado] = await connection.query(`SELECT idfactura FROM factura WHERE idpago=?`, [idpago]);
        console.log("🚀 ~ file: facturacionDao.ts ~ line 63 ~ findPagoFacturar ~ facturado", facturado, '->', Boolean(facturado))

        if (!Boolean(facturado)) {


            let [pago] = await connection.query(`
SELECT 
		pago.idpago,
		pago.folio,		
		pago.fecha_hora_cobro
FROM pago 
WHERE pago.idpago=?;
        `, [idpago]);

            let cargos = await connection.query(`
SELECT 
		cuota.producto_servicio,
		cargo.concepto,
		cargo.total, 
		IFNULL(descuento.monto,0) AS descuento,
		cargo.cantidad,
		cargo.periodo,
		cargo.cve_cargo,
		cargo.cve_accion
FROM cargo
LEFT JOIN descuento USING(cve_cargo)
INNER JOIN cuota USING(cve_cuota)
WHERE cargo.idpago=?;
`, [idpago]);

            let [forma_pago] = await connection.query(`
SELECT 
    forma_pago.clave,
    forma_pago_sat.forma_pago 
FROM forma_pago 
INNER JOIN forma_pago_sat ON forma_pago.clave=forma_pago_sat.clave 
WHERE forma_pago.idpago=? 
ORDER BY monto DESC LIMIT 1;
`, [idpago])

            return { pago, cargos, forma_pago };
        }
        else return 0
    }
    catch (e) {
        console.log(e)
        return null;
    }
    finally {
        await connection.release();//se regres ala connecion al pool
    }

}

export { findDireccionesFacturacion, updateRFC, findPagoFacturar }
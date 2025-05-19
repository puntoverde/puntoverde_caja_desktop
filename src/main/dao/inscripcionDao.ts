import { fnMysql } from '../db'
import {IInscripcion} from './../model/model-type'



const saveInscripcion=async(data:IInscripcion)=>
{ 
    let pool= await fnMysql();
    let connection=await pool.getConnection();
    try{
let {insertId} =await connection.query(`
INSERT INTO 
    cuota_inscripciones(id_cargo,nombre,paterno,materno,genero,edad,concepto,telefono,correo) 
VALUES
    (?,?,?,?,?,?,?,?,?);`,
[data.idCargo,data.nombre,data.paterno,data.materno,data.genero,data.edad,data.concepto,data.telefono,data.correo]);

return insertId;
    }
    catch(e){
        console.error(e)
        return false;
    }
    finally{
        await connection.release();//se regres ala connecion al pool
    }

}

const getDatosDefaultInscripcion=async(cve_persona:number)=>{
    let pool= await fnMysql();
    let connection=await pool.getConnection();
    try{
let [data] =await connection.query(`
SELECT 
	nombre,
	apellido_paterno AS paterno,
	apellido_materno As materno,
	CONVERT(sexo,signed) AS genero,
	IFNULL(TIMESTAMPDIFF(YEAR,fecha_nacimiento,CURDATE()),0) AS edad,
	IFNULL(socios.telefono,ifnull(dueno.telefono,'')) AS telefono,
	IFNULL(socios.correo_electronico,'') AS correo
FROM persona
LEFT JOIN socios ON persona.cve_persona=socios.cve_persona
LEFT JOIN dueno ON persona.cve_persona=dueno.cve_persona
WHERE persona.cve_persona=? LIMIT 1`,
[cve_persona]);

return data;
    }
    catch(e){
        console.error(e)
        return false;
    }
    finally{
        await connection.release();//se regres ala connecion al pool
    }
}

export {saveInscripcion,getDatosDefaultInscripcion}
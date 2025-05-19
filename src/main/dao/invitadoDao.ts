import {fnMysql} from '../db'


const detalleInvitado=async(cve_socio)=>
{
    try{
let pool= await fnMysql();
let connection =await pool.getConnection()
let [invitado] =await connection.query(`
select socios.cve_socio, concat(numero_accion,'-',posicion) as accion ,nombre,apellido_paterno,apellido_materno,date_format(historico_invitado_socio.fecha_inicio,'%d/%m/%Y') as date1,date_format(historico_invitado_socio.fecha_fin,'%d/%m/%Y')as date2 from historico_invitado_socio 
inner join socios on historico_invitado_socio.cve_socio=socios.cve_socio
inner join persona on socios.cve_persona=persona.cve_persona
inner join acciones on socios.cve_accion=acciones.cve_accion
where socios.cve_socio=?;`,[cve_socio]);

await connection.release();//se regres ala connecion al pool

return invitado;
    }
    catch(e){
        return false;
    }

}

export {detalleInvitado}
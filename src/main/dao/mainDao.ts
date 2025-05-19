import {fnMysql} from '../db'

const login=async(user,pass)=>
{
    console.log(user,pass)
    try{
let pool= await fnMysql();
let connection = await pool.getConnection()
let [usuario] =await connection.query(`
SELECT 
    persona.cve_persona,
    persona.nombre,
    persona.apellido_paterno,
    persona.apellido_materno,
    usuario.privilegios
FROM usuario
INNER JOIN persona USING(cve_persona)
WHERE usuario.usuario=? AND usuario.contrasena=?`,[user,pass]);

await connection.release();//se regres ala connecion al pool
console.log("🚀 ~ file: mainDao.ts ~ line 21 ~ usuario", usuario)
return usuario;
    }
    catch(e){return undefined;}
}

export {login}
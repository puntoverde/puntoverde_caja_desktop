import mysql from 'promise-mysql'
let pool;
try {

// const local={
//     host:'192.168.1.76',
//     user:'sistema_caja',
//     password:'sistema_caja@10',
//     port:3306,
//     database:'punto_verde_2021',
//     waitForConnections: true, 
//     connectionLimit: 3,
//     queueLimit: 0}
const local={
    host:'127.0.0.1',
    user:'root',
    password:'',
    port:3306,
    database:'punto_verde_v2_respaldo',
    waitForConnections: true, 
    connectionLimit: 3,
    queueLimit: 0}

const server={
    host:'192.168.2.111',
    user:'dev_pv',
    password:'pss_dEv_pv_18',
    port:3306,
    database:'punto_verde_v2',
    waitForConnections: true, 
    connectionLimit: 3,
    queueLimit: 0}
    
pool=mysql.createPool(server)

} catch (error) {
    pool=null
}

const fnMysql=()=>{
    return pool;
}

export {fnMysql}
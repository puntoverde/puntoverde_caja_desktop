export type IAccion = {
    accion: string,
    apellido_materno: string,
    apellido_paterno: string,
    cve_accion: number,
    cve_dueno: number,
    estatus: number,
    nombre: string,
    rfc: string,
    tipo_accion: string
}

export type ICargo = {
    cantidad: number,
    concepto: string,
    cve_accion: number,
    cve_cargo: number,
    cve_cuota: number,
    cve_persona: number,
    descuento: number,
    estatus: number,
    fecha_cargo: string,
    idpago: number | null,
    invitado: number,
    iva: number,
    no_adeudo_anterior: number,
    periodo: string,
    persona: string,
    producto_servicio: number,
    recargo: number,
    responsable_carga: number,
    subtotal: number,
    total: number
}

export type ICuota = {
    concepto: string,
    cuota: string,
    cve_cuota: number,
    edad_aplica: number,
    editable: number,
    genero_aplica: string,
    is_inscripcion: number,
    membresia: string,
    no_adeudo_anterior: number,
    numero_cuota: number,
    opcion_iva: number,
    parentesco: number | null,
    producto_servicio: number,
    tipo_cuota: number,
    total: number,
    veces_aplicar: number
}

export type IPago = {
    // cve_persona: number,
    subtotal: number,
    iva: number,
    total: number,
    descuento: number,
    recargo: number,
    cargos_pagar: number[],
    forma_pagos: { clave: string, monto: number, banco: string, cheque: string }[],
    cve_accion: number,
    folio_m8:number
}

export type IPagoRecibo = {
    cargos: string,
    fecha_hora_cobro: string,
    folio: string,
    forma_pago: string,
    idpago: number,
    periodo: string,
    socio: string,
    total: number,
    persona_cobra: string,
    cve_accion: number,
    accion: string
}

export type IPagosFilterConcepto = {
    cajero: number, fecha_inicio: string, fecha_fin: string
}

export type iFactura = {
    accion: string,
    idpago: number,
    id_dato_factura: number,
    cliente: {
        rfc: string,
        razonSocial: string,
        curp?: string,
        correo: string,
        metodoPago: string,
        usoCFDI: string,
        regimenFiscal: string,
    },
    domicilio: {
        calle: string,
        numExt: string,
        numInt: string,
        colonia: string,
        cp: string,
        municipio: string,
        estado: string,
        pais: string,
    },
    movimientos: { codProducto: number, descuento: number, importe: number, unidades: number }[],
    fecha_pago: string,
    folio_pv: number,
    observaciones: string
}

export type IFacturaData = {
    id_datos_facturacion: number,
    codigo_cliente:string,
    rfc: string,
    razon_social: string,
    curp?: string,
    correo: string,
    regimen_fiscal: string,
    calle: string,
    num_ext: string,
    num_int: string,
    colonia: string,
    cp: string,
    municipio: string,
    estado: string,
    pais: string,
}

export type IPagoData={
    idpago:number,
	folio:number,
	fecha_hora_cobro:string
}

export type ICargoData={
    producto_servicio:number,
	concepto:string,
	total:number, 
	descuento:number,
	cantidad:number,
	periodo:string,
	cve_cargo:number,
	cve_accion:number
}

export type IformaPagoData={
    clave:string,
    forma_pago:string
}

export type IInscripcion={
    idCargo:number,
    nombre:string,
    paterno:string,
    materno:string,
    genero:string,
    edad:number,
    concepto:string,
    telefono:string,
    correo:string
}

export type IAddCargo={
    cve_accion:number,
    cve_cuota:number,
    cve_persona:number,
    concepto:string,
    total:number,
    subtotal:number,
    iva:number,
    cantidad:number,
    periodo:string,
    responsable_cargo?:number,//es el id de quien esta en session
    veces_aplicar:number,
    is_inscripcion:number
}

export type IAddCargoParcialidad={
    cve_accion:number,
    cve_cuota:number,
    cve_persona:number,
    concepto:string,
    total:number,
    subtotal:number,
    iva:number,
    cantidad:number,
    periodo:string,
    responsable_cargo?:number,//es el id de quien esta en session
    veces_aplicar:number,
    is_inscripcion:number,
    parcialidad:number
}
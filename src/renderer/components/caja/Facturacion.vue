<template>
  <v-card height="240" id="content-facturas">
    <v-card-title class="accent--text my-0 py-0">Datos Facturacion {{typeof factura}}</v-card-title>
    <v-divider inset></v-divider>
    <v-list subheaderxx two-line flat nav>
      <v-list-item-group v-model="factura" >
        <v-list-item
          v-for="datos_factura in lst_datos_facturacion"
          :key="datos_factura.id_datos_facturacion"
          :value="datos_factura"
          class="mb-0xx"         
        >
          <template v-slot:default="{ active }">
            <v-list-item-action>
              <v-checkbox :value="active" color="secundary" ></v-checkbox>
            </v-list-item-action>

            <v-list-item-content class="py-1">
              <v-list-item-title>{{`RFC: ${datos_factura.rfc}, RSocial: ${datos_factura.razon_social}`}}</v-list-item-title>
              <v-list-item-subtitle>{{`Domicilio:${datos_factura.calle} # ${datos_factura.num_ext}, ${datos_factura.colonia} cp:${datos_factura.cp} ${datos_factura.municipio} ${datos_factura.estado}` }}</v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-card>
</template>

<script>
import isUndefined from 'lodash/isUndefined'
import { ref, watch } from '@vue/composition-api';

export default {
  props:{cve_accion:{type:Number,default:0}},
  setup(props,context){
      const lst_datos_facturacion=ref([])
      const factura=ref({})

      watch(()=>props.cve_accion,(val)=>{
        console.log('watch')
          if(val>0){
            console.log('busca datos facturacion...')
           lst_datos_facturacion.value= window.ipcRenderer.sendSync("buscarDatosFacturacion",val);
           console.log(lst_datos_facturacion)
          }
          else lst_datos_facturacion.value=[]
      })

      watch(factura,(val)=>{
        if(!isUndefined(val))context.emit('emit-datos-factura',factura.value);
        else context.emit('emit-datos-factura',false)
      })

      return {lst_datos_facturacion,factura}
  }
};
</script>

<style>
#content-facturas{overflow-y: auto;}
</style>
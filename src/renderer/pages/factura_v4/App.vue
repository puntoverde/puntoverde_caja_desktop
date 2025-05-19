<template>
  <v-app>
    <v-system-bar
      app
      color="primary"
      class="mr-0 pr-0"
    >
      <v-icon>mdi-file-document-multiple</v-icon>
      <span>pago, factura  {{editable}}</span>
      <v-spacer></v-spacer>
      <v-btn variant="text" size="small" @click="close">        
      <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-system-bar>

   
    <v-app-bar dense extendedx color="secondary" dark elevation="1" app>
      <v-toolbar-title>RFC: <span v-if="!editable">{{ rfc }} </span></v-toolbar-title>
      <!-- <template v-slot:extension>
         <span v-if="!editable">RFC:{{ rfc }} </span>          
         <v-text-field v-else v-maska="'AAAA######XXX'" label="RFC" solo-inverted dense v-model="rfc" class="my-mayus"  hide-></v-text-field>  
      </template> -->
    </v-app-bar>

    <v-navigation-drawer permanent app width="500">
      <!-- <v-list-item class="secondary" dark>
          <v-list-item-title class="title"
            >Datos Facturacion Seleccionar</v-list-item-title
          >
      </v-list-item> -->
      <v-list-item>
        <v-list-item-content>
          <v-text-field
            hide-details
            prepend-inner-icon="mdi-magnify"
            placeholder="filtrar datos"
            @keyup.enter="buscarAccion"
            clearable
          ></v-text-field>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list three-line flat nav v-model:selected="factura_selected">
        <!-- <v-list-item-group v-model="factura"> -->
          <v-list-item
            v-for="datos_factura in lst_datos_facturacion"
            :key="datos_factura.id_datos_facturacion"
            :value="datos_factura"
            class="py-3"        
          >
            <!-- <template v-slot:default="{ active }"> -->
              <template v-slot:prepend={isActive,isSelected}>
                  <v-icon v-if="isActive" size="large" color="primary">mdi-checkbox-marked</v-icon>
                  <v-icon v-else size="large" color="primary">mdi-checkbox-blank-outline</v-icon>
                   <!-- <v-checkbox  color="primary"></v-checkbox> -->
              </template>       
              
                <v-list-item-title>RFC:{{datos_factura.rfc}}</v-list-item-title>
                <v-list-item-subtitle>RSocial:{{datos_factura.razon_social}}</v-list-item-subtitle>
                <v-list-item-subtitle>
                  Domicilio:{{datos_factura.calle}} # {{datos_factura.num_ext}}, {{datos_factura.colonia}} cp:{{datos_factura.cp}} {{datos_factura.municipio}} {{datos_factura.estado}}
                </v-list-item-subtitle>              
            <!-- </template> -->
          </v-list-item>
        <!-- </v-list-item-group> -->
      </v-list>
    </v-navigation-drawer>

    <v-main >
      <v-container>
      
        <v-select
          label="Pertenece ha"
          v-model="cve_persona_factura"
          hide-details
          dense
          :items="lst_socios_accion"
          item-value="cve_persona"
          :item-text="i=>`${i.nombre} ${i.apellido_paterno} ${i.apellido_materno}`"
       
          v-if="editable"
        >
        </v-select>
      
       
        <v-text-field
          label="Razon Social"
          v-model="razon_social"
          hide-details
          :readonly="!editable"
      
          class="my-mayus"
        >
        </v-text-field>
      
        <!-- <v-text-field label="Curp" v-model="curp" hide-details readonly>
        </v-text-field> -->

        <v-divider></v-divider>
     
        <v-text-field label="Calle" v-model="calle" hide-details :readonly="!editable"  class="my-mayus">
        </v-text-field>

      

        <div class="d-flex justify-space-between">
         
           <v-text-field
            label="Codigo Postal"
            class="mr-2 my-mayus"
            v-model="cp"
            v-maska="'#####'"
            hide-details
            :readonly="!editable"
         
          >
          </v-text-field>
         
          <v-text-field
            label="num ext"
            class="mr-2 my-mayus"
            v-model="num_ext"
            hide-details
            :readonly="!editable"
          >
          </v-text-field>

          <v-text-field label="num int" v-model="num_int" hide-details :readonly="!editable"  class="my-mayus">
          </v-text-field>
        </div>
        
        <v-text-field label="Colonia" v-model="colonia" hide-details :readonly="!editable"  class="my-mayus">
        </v-text-field>

        <v-text-field label="Municipio" v-model="municipio" hide-details :readonly="!editable"  class="my-mayus">
        </v-text-field>
       
        <div class="d-flex justify-space-between">
       
        <v-text-field label="Estado" class="mr-2 my-mayus" v-model="estado" hide-details :readonly="!editable" >
        </v-text-field>

        <v-text-field label="Pais" v-model="pais" hide-details :readonly="!editable"  class="my-mayus">
        </v-text-field>
          
        </div>
       
        <v-text-field label="Correo Electronico" v-model="email" hide-details :readonly="!editable" ></v-text-field>
      
        <v-text-field label="Forma Pago" v-model="forma_pago" hide-details readonly></v-text-field>
        <div class="d-flex justify-space-between">
          
          <v-select label="Metodo Pago" v-model="metodo_pago" class="mr-2" :items="['PUE','PPD']"></v-select>
          <v-select label="uso cfdi" v-model="uso_cfdi" :items="lst_uso_cfdi" item-value="clave" item-text="descripcion"></v-select>
        </div>
      </v-container>
    </v-main>
    <v-footer app >
      
      <v-spacer></v-spacer>
      <v-slide-x-reverse-transition hide-on-leave>
       <v-btn v-if="!editable" color="primary" tile depressed @click="pagar" :loading="loading">facturar prueba <v-icon class="ml-1">mdi-clipboard-check-outline</v-icon></v-btn>           
      </v-slide-x-reverse-transition>

      <v-slide-x-transition hide-on-leave>
          <v-btn v-if="editable" color="secondary" class="mr-2" tile depressed @click="cancelar_captura"><v-icon class="mr-1">mdi-arrow-left</v-icon>cancelar</v-btn>  
      </v-slide-x-transition>
      <v-slide-x-transition hide-on-leave>
          <v-btn v-if="editable" color="secondary" tile depressed @click="handleSubmit(pagar_sin_factura)" :loading="loading"><v-icon class="mr-1">mdi-check</v-icon>Terminar Pago</v-btn>  
      </v-slide-x-transition>
    </v-footer>

  </v-app>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import maxBy from 'lodash/maxBy'
import throttle from 'lodash/throttle'
import isUndefined from "lodash/isUndefined";
import isEmpty from "lodash/isEmpty";
import dayjs from "dayjs";
import lst_uso_cfdi from './../../assets/js/usocfdi.json'
import axios from 'axios'
import {iFactura,IFacturaData,IPagoData,ICargoData,IformaPagoData} from './../../../main/model/model-type'
  
    let id_dato_factura=0;
    const rfc = ref("XAXX010101000");
    const razon_social = ref("Publico en General");
    const curp = ref("");
    const calle =ref('Punto Verde')
    const cp=ref('37298');
    const num_ext=ref('314')
    const num_int=ref('')
    const colonia=ref('Punto Verde')
    const municipio=ref('León')
    const estado=ref('Guanajuato')
    const pais=ref('México')
    const email=ref('facturacionpuntoverdeleon@gmail.com');
    const forma_pago=ref('')
    const metodo_pago=ref('PUE')
    const uso_cfdi=ref('G03')
    const editable=ref(false)

    const loading=ref(false)

    const lst_socios_accion=ref([])
    const cve_persona_factura=ref('')//es el cve_persona del socio o dueño que se le agrega los datos de factura

    let pago_facturar:IPagoData=null;
    let cargos_facturar:ICargoData[]=[]
    let forma_pago_facturar:IformaPagoData=null;



    const lst_datos_facturacion = ref<IFacturaData[]>([]);
    const factura_selected = ref<IFacturaData[]>([]);

    watch(factura_selected,(val)=>{

       if(!!val.length)
       {
         const [factura_data]=val
         id_dato_factura=factura_data.id_datos_facturacion
         rfc.value=factura_data.rfc
         razon_social.value=factura_data.razon_social
         calle.value=factura_data.calle
         cp.value=factura_data.cp
         num_ext.value=factura_data.num_ext
         num_int.value=factura_data.num_int
         colonia.value=factura_data.colonia
         municipio.value=factura_data.municipio
         estado.value=factura_data.estado
         pais.value=factura_data.pais
         email.value=factura_data.correo         
       }
       else {
         id_dato_factura=0
         rfc.value="XAXX010101000"
         razon_social.value="Publico en General"
         calle.value="Punto Verde"
         cp.value="37298"
         num_ext.value="314"
         colonia.value="Punto Verde"
         municipio.value="León"
         estado.value="Guanajuato"
         pais.value="México"
         email.value="punto_verde@gmail.com"
       }
    })
      


    window.electron.onFacturaData((pago,data)=>{
       
       console.log("🚀 ~ file: App.vue ~ line 284 ~ window.electron.onFacturaData ~ data", data)
       console.log("🚀 ~ file: App.vue ~ line 285 ~ window.electron.onFacturaData ~ pago", pago)
       const {pago:pago_ha_facturar,cargos,forma_pago:fpagos}:{pago:IPagoData,cargos:ICargoData[],forma_pago:IformaPagoData} =pago
       lst_datos_facturacion.value=data
       forma_pago.value=fpagos.forma_pago
       pago_facturar=pago_ha_facturar;
       cargos_facturar=cargos;
       forma_pago_facturar=fpagos;

    })

    function close(){      
      window.electron.closeFacturaV4()
    }
     
    function captura_factura_pendiente(){
       
    editable.value=true;
    rfc.value = "";
    razon_social.value = "";
    curp.value = "";
    calle.value =""
    cp.value="";
    num_ext.value=""
    num_int.value=""
    colonia.value=""
    municipio.value=""
    estado.value=""
    pais.value=""
    email.value=""
    cve_persona_factura.value=""

    lst_socios_accion.value=window.ipcRenderer.sendSync("getSociosAccion",cve_accion);//obtine los socios de la accion...

    

    }

    function cancelar_captura(){
      console.log(context.refs.form.reset())
         editable.value=false;
         rfc.value="XAXX010101000"
         razon_social.value="Publico en General"
         calle.value="Punto Verde"
         cp.value="37298"
         num_ext.value="314"
         colonia.value="Punto Verde"
         municipio.value="León"
         estado.value="Guanajuato"
         pais.value="México"
         email.value="punto_verde@gmail.com"
         cve_persona_factura.value=""
    }

    const pagar=throttle(async ()=>{
       
       const [factura_selected_facturar]=factura_selected.value
       console.log("🚀 ~ file: App.vue ~ line 314 ~ pagar ~ factura_selected_facturar", factura_selected_facturar)

      const factura_envio:iFactura = {
        accion:factura_selected_facturar.codigo_cliente,
        idpago:pago_facturar.idpago, 
        id_dato_factura:id_dato_factura,    
        cliente: {
          rfc: rfc.value,
          razonSocial: razon_social.value,
          curp: "NA",
          correo: email.value,
          metodoPago: metodo_pago.value,
          usoCFDI: uso_cfdi.value,
          regimenFiscal: factura_selected_facturar.regimen_fiscal,
        },
        domicilio: {
          calle: calle.value,
          numExt: num_ext.value,
          numInt: num_int.value,
          colonia: colonia.value,
          cp: cp.value,
          municipio: municipio.value,
          estado: estado.value,
          pais: pais.value,
        },
        movimientos:cargos_facturar.map(i=>({codProducto:i.producto_servicio,descuento:i.descuento,importe:i.total,unidades:i.cantidad})),
        fecha_pago:pago_facturar.fecha_hora_cobro,
        folio_pv:pago_facturar.folio,
        observaciones:`folio de pago:${pago_facturar.folio} de la accion(${factura_selected_facturar.codigo_cliente}) | los cargos son: ${cargos_facturar
        .filter((i) => i.total > 0)
        .map((i) => `${i.concepto} ${i.periodo}`)
        .join()}`
      };

      
      console.log("🚀 ~ file: App.vue ~ line 348 ~ pagar ~ factura_envio", factura_envio)

      let {data,status}=await axios.post(`http://192.168.1.76:85/finanzas-api/api/facturacion-v4/factura/${factura_selected_facturar.codigo_cliente}`,factura_envio);

    },3000)

 
</script>

<style>
html,body{overflow-y: hidden!important;}
.my-mayus input{
  text-transform: uppercase
}

</style>
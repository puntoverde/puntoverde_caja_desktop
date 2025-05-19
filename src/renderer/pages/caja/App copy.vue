<template>
  <v-app>
    
    <v-system-bar app color="secondary" class="pr-0">
      <v-icon color="white">mdi-cash-register</v-icon>
      <span class="white--text">Sistema Caja v1.2</span>
      <v-spacer></v-spacer>
      <v-btn small text @click="minimizar">
      <v-icon color="white">mdi-window-minimize</v-icon>      
      </v-btn>
      <v-btn small text @click="close">        
      <v-icon color="white">mdi-window-close</v-icon>
      </v-btn>
    </v-system-bar>
     <!-- componete de banner busca la accion entre otras cosas -->
    <!-- <Banner @emit-setAccion="getCargos" @emit-clean-cargos="cleanCargos" @emit-open_estado-cuenta="estadoCuenta"></Banner> -->
    <v-main app class="grey lighten-1" id="content-full">
      <v-container fluid class="px-5" id="content-cargos">
        <div id="cargos-tabla" ref="parentDiv">
          <v-data-table
            v-model="cargos_cobrar"
            :headers="headers"
            :items="lst_cargos"
            item-key="cve_cargo"
            show-select
            class="elevation-1"
            hide-default-footer
            :loading="load_table"
            loading-text="Buscando Cargos"
            no-data-text="Sin Cargos"
            :items-per-page="100"
            fixed-header
            :height="table_height"
            darkxx
          >
            <template v-slot:item.concepto="{ item }"
              ><v-btn
                icon
                v-if="item.invitado > 0"
                @click="showDetalleInvitado(item.invitado)"
                ><v-icon color="warning">mdi-information</v-icon></v-btn
              >{{ item.concepto }}</template
            >
            <template v-slot:item.total="{ item }">{{
              item.total | currency
            }}</template>
            <template v-slot:item.recargo="{ item }">{{
              item.recargo | currency
            }}</template>
            <template v-slot:item.descuento="{ item }">{{
              item.descuento | currency
            }}</template>
            <template v-slot:item.total_final="{ item }">{{
              (item.total * item.cantidad) | currency
            }}</template>
            <template v-slot:item.persona="{ item }">
              <v-tooltip left>
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on">
                    <v-icon>mdi-account-alert</v-icon>
                  </v-btn>
                </template>
                <span>{{ item.persona }}</span>
              </v-tooltip>
            </template>
          </v-data-table>
        </div>
        <div id="cobro">
          <v-row>
            <!-- <v-col cols="12" lg="7"> -->
              <!-- compoenente que muestra listado de datos facturacion y permite elegir uno  -->
              <!-- <Facturacion :cve_accion="cve_accion" @emit-datos-factura="addFatura"></Facturacion> -->
            <!-- </v-col> -->
            <v-col cols="12" lg="12">
              <!-- componenete de pagos  -->
               <!-- <pagoCaja
                      :subtotal="cSubTotal"
                      :iva="cIva"
                      :total="cTotal"
                      :descuento="cDescuento"
                      :recargo="cRecargo"
                      :factura="factura"
                      :cargosPagar="cargos_cobrar"
                      :cve_accion="cve_accion"
                      :numero_accion="numero_accion"
                      :titular="titular"
                      v-on:emit-pago-ok="pagoOk"
                    ></pagoCaja> -->
            </v-col>
          </v-row>
        </div>

      </v-container>
    </v-main>
    <v-footer app darkx color="blue-greyx secondary white--text" class="d-flex justify-center my-0 py-0"> club deportivo punto verde de leon sa de cv <v-btn absolute right text small @click="openToolsVue">?</v-btn></v-footer>
  </v-app>
</template>
<script setup lang="ts">
import Banner from "../../components/caja/BannerCaja.vue";
import pagoCaja from "../../components/caja/pagoCaja.vue";
// import Facturacion from "@/front/components/Caja/Facturacion";
// import { mask } from "vue-the-mask";
import numeral from "numeral";
import { round } from "mathjs";
import { computed, onMounted, ref } from 'vue';

      //las cabeceras de la tabla 
      const headers=ref([
        {
          text: "Clavesss",
          align: "left",
          sortable: false,
          value: "producto_servicio",
          class: ["body-1"],
        },
        {
          text: "Concepto",
          value: "concepto",
          sortable: false,
          class: ["body-1"],
          align: "center",
        },
        {
          text: "Precio Unitario",
          value: "total",
          sortable: false,
          class: ["body-1"],
          align: "center",
        },
        {
          text: "Cantidad",
          value: "cantidad",
          sortable: false,
          class: ["body-1"],
          align: "center",
        },
        {
          text: "Periodo",
          value: "periodo",
          sortable: false,
          class: ["body-1"],
          align: "center",
        },
        {
          text: "Recargo",
          value: "recargo",
          sortable: false,
          class: ["body-1"],
          align: "center",
        },
        {
          text: "Descuento",
          value: "descuento",
          sortable: false,
          class: ["body-1"],
          align: "center",
        },
        {
          text: "Total",
          value: "total_final",
          sortable: false,
          class: ["body-1"],
          align: "center",
        },
        {
          text: "usuario",
          value: "persona",
          sortable: false,
          class: ["body-1"],
          align: "center",
        },
      ])
      //lista de cargos de la accion a buscar
      const lst_cargos=ref([])
      //son los cargos que se seleccionaron para pagar
      const cargos_cobrar=ref([])
      //loading que se muestra en lo que se buscan los cargos 
      const load_table=ref(false)
      //es la altura de la tabla inicial mente en 48 pixeles
      const table_height=ref(48)
      //es el cajero quien esta cobrando se recupera del localstorage
      const cajero=ref({})
      //cve_accion que se obtiene del banner cuando se encuentra la accion
      const cve_accion=ref(0)
      //es el nombre del titular de la accion y se obtiene del banner
      const titular=ref('')
      //numero de accion se obtiene del banner y tambien vendria siendo el codigo del cliente a facturar
      const numero_accion=ref('')
      //son los datos de facturacion como object o false en caso de que no se requiera factura
      const factura=ref({})

      //computed que calcula el total de los cargos seleccionados a pagar
      const cTotal=computed(()=>round(cargos_cobrar.value.map(i =>numeral(i.total).multiply(i.cantidad).subtract(i.descuento).value()).reduce((prev, cur) => numeral(prev).add(cur).value(), 0),2))

      //computed que calcula el subtotal de los cargos seleccionados a pagar
      const cSubTotal=computed(()=>round(numeral(cTotal.value).divide(116).multiply(100).value(), 2));

      //computed que calcula el iva de los cargos seleccionados a pagar
      const cIva=computed(()=>round(numeral(cSubTotal.value).multiply(0.16).value(), 2));
      
      //computed que calcula el descuento aplicado de los cargos seleccionados a pagar
      const cDescuento=computed(()=> round(cargos_cobrar.value
          .map(i => numeral(i.descuento).value())
          .reduce((prev, cur) => numeral(prev).add(cur).value(), 0),2));

      //computed que calcula el recargo a aplicar de los cargos seleccionados a pagar
      const cRecargo=computed(()=>
        round(cargos_cobrar.value
          .map(i => numeral(i.recargo).value())
          .reduce((prev, cur) => numeral(prev).add(cur).value(), 0),2));
      
      //computed que obtiene array de cve_cargos apagar 
      const cCargos=computed(()=>cargos_cobrar.value.map(i => i.cve_cargo));

     //funcion a ejecutar cuando e monta el componenete
     onMounted(()=>{
          //indica que se realizo el pago y entra a eliminar los cargos y cerrar la sheet y limpiar los pagos
          window.ipcRenderer.on("pagoRealizado",(e)=>{pagoOk()})
          //se asigna el cajero del localstorage
          cajero.value = context.root.$ls.get("user", "--");
          //se crea evento para permitir agregar cargos desde la pantalla de cargos
          window.ipcRenderer.on("addCargo", (e, p) => addCargo(p));
          //calcula el tamaño segun la pantalla
          table_height.value = context.refs.parentDiv.clientHeight-72;
     })

      //function que recupera los cargos de la accion seleccionada, que se ejecuta cuando banner emite el evento emit-setAccion
      function getCargos(id_accion,num_accion,titularx) {//recibe cve_accion ejem(1) y numero accion ejem(1A)
      numero_accion.value=num_accion;//asigna numerao accion 
      cve_accion.value=id_accion//asigna cve_accion
      titular.value=titularx
      cargos_cobrar.value=[]//limpia los cargos a pagar 
      load_table.value=true//inicia loading 
      //consulta los cargos y los asigna a lst_cargos
      lst_cargos.value = window.ipcRenderer.sendSync("getCargosByAccion",id_accion);
      setTimeout(()=>load_table.value=false,500) //temina loading despues de un segundo terminado la consulta
    }
 
     //function limpia las variables 
    function cleanCargos(){
      lst_cargos.value=[]//limpia lista de cargos
      cargos_cobrar.value=[]//limpia cargos a pagar
      cve_accion.value=0;//limpia la accion 
      numero_accion.value=""//limpia numero de accion
    }

    //function que agrega el cargo desde ventana cargos a la lista de cargos
    function addCargo(p){console.log('add concepto->',p);lst_cargos.value.push(p)}
    
    //function que se ejecuta cuando pagpo emite evento
    // function pagoOk(pagosDelete, folio, forma_pago) {//recibe folio de pago y fiorma de pago
     function pagoOk(pagosDelete, folio, forma_pago,idpago) {//recibe folio de pago y fiorma de pago
        
        console.log('pagos delte->',pagosDelete,'   folio->',folio,'  forma pagos->',forma_pago,' idpago->',idpago)
            
      let data = {
        titular: titular.value,//agrega titular 
        accion: numero_accion.value,//agrega numero accion 
        folio: folio,//agera el folio del pago
        cajero: context.root.$ls.get("user", "--"),//obtiene cve_persona del cajero en turno
        cargos: cargos_cobrar.value,//envia lista de los cargos ha pagar
        fpago: forma_pago,//envia las formas de pago 
        fecha: new Date(),//y la fecha del cobro
        idpago,//es el id de pago
        cve_accion:cve_accion.value
      };

      console.log('data->',data)
      
      //revisa los cargos acobrar para eliminarlos de la lista de cargos porque ya se pagaron
     cargos_cobrar.value.forEach((i) => {
        //busca con findindex el index del cargo que se va a eliminar
        let index = lst_cargos.value.findIndex(
          (j) => parseInt(j.cve_cargo) === parseInt(i.cve_cargo)
        );
        //del es $delete se cambia en vue3
        del(lst_cargos.value, index);
      });
      //se limpia al final los cargos a cobrar
      cargos_cobrar.value=[]
      //se abre ventana del recibo y se le envia los datos
    window.ipcRenderer.send("openRecibo", data);
    }

    //function que abre el estado de cuenta
    function estadoCuenta(titularx,accionx) {
      let cargos_mostrar=lst_cargos.value;//asigna el total de los cargos a la variable que se envia
      if(lst_cargos.value.findIndex(i=>i.cve_cuota===5)>=0)//verifica que se encuentre un cargo de activacion 
      {//si encuentra un cargo de activacion entra y solo carga la activacion 
         cargos_mostrar=lst_cargos.value.filter(i=>i.cve_cuota===5)//crea un nuevo array solo con un cargo de activacion 
      }
      let data = {
        titular: titularx,//se agrega el titular
        accion:  accionx,//se agrega el numero de accion
        cargos: cargos_mostrar,//se agregan todos los cargos que tiene la accion consultada
        fecha: new Date(),//se envia la fecha de consulta de estado de cuenta
      }
      //se abre la ventana de estado cuenta y se le envian los datos
      window.ipcRenderer.send("openEstadoCuenta", data);
      }

      //function que muestra el detalle de un invitado 
      function showDetalleInvitado(cve_invitado) {
      //se consultan los datos del invitado
      let invitado = window.ipcRenderer.sendSync("detalleInvitado",cve_invitado);
      //se muestra un messagebox con los datos del invitado
      let ventana = window.remote.getCurrentWindow();
      window.remote.dialog.showMessageBox(ventana, {
        type: "info",
        title: "Detalle del invitado...",
        message: `${invitado.accion}, ${invitado.nombre} ${invitado.apellido_paterno} ${invitado.apellido_materno}`,
        detail: `Periodo: ${invitado.date1} al ${invitado.date2}`,
      });
    }

    //function que se emite cuando el componente de facturacion selecciona un dato de factura 
    function addFatura(fac){
      //si fac es false regresa facura a objeto vacion
       if(!fac)factura.value={}
       //en caso de que no sea dalse asugna los datos de facturacion selecionados
       else factura.value=fac
    }

    function close()
    {
      window.remote.getCurrentWindow().close();
    }

    function minimizar()
    {
      window.remote.getCurrentWindow().minimize()
    }

    function openToolsVue()
    {
      window.remote.getCurrentWindow().toggleDevTools()
    }
    
   

 
  // filters: {
  //   fIcon(val) {
  //     switch (val) {
  //       case "success":
  //         return "mdi-check-circle";
  //         break;
  //       case "info":
  //         return "mdi-information";
  //         break;
  //       case "warning":
  //         return "mdi-alert";
  //         break;
  //       case "error":
  //         return "mdi-close-octagon";
  //         break;
  //     }
  //   },
  // }

</script>

<style scoped>
html {
  overflow-y: hidden;
}

#content-full {
  height: 100vh;
}

#content-cargos {
  overflow-y: hidden;
  height: 100%;
}

#cargos-tabla {
  height: calc(100% - 250px);
  }

#cobro {
  height: 250px!important;
}

.data-table-regular-header-height {
  font-size: 148px;
}
.mdi-magnify.white--text {
  color: #000 !important;
}

.mdi-close.white--text {
  color: #000 !important;
}

.v-data-table-header {
  background-color: #000;
}
</style>
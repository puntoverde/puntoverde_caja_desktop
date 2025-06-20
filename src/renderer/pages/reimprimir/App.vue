<template>
  <v-app style="border:2px solid #14bf98;height:100vh">
    <v-system-bar app color="primary" class="pr-0" >
      <v-spacer></v-spacer>
      <v-btn size="small" variant="text" @click="minimizar">
        <v-icon color="white">mdi-window-minimize</v-icon>
      </v-btn>
      <v-btn size="small" variant="text" @click="close">
        <v-icon color="white">mdi-window-close</v-icon>
      </v-btn>
    </v-system-bar>
    <v-app-bar dense color="secondary" elevation="1" app style="left:2px;width:calc(100% - 4px)">
      <v-toolbar-title>Titular:{{ titular }}</v-toolbar-title>   
    </v-app-bar>

    <v-navigation-drawer permanent app width="290" class="px-1 bg-redx overflow-y-hidden" style="height:calc(100vh - 90px);left:2px">
      <!-- <v-list-item class="primary" dark>
        <v-list-item-content>
          <v-list-item-title class="title">Reimprimir Recibo</v-list-item-title>
        </v-list-item-content>
      </v-list-item> -->
      <v-list-item class="primary my-1 overflow-y-hidden" dark>
        <v-list-item-content>
          <v-text-field
            hide-details
            prepend-inner-icon="mdi-magnify"
            v-model="accion"
            @keyup.enter="buscarAccion"
            v-maska="accionMask"
            clearable
            placeholder="Buscar Accion"
          ></v-text-field>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <!-- <v-date-picker
        type="month"
        color="primary"
        v-model="periodo"
        multiple
        :show-current="false"
        no-title
        :readonly="readonly"
      ></v-date-picker> -->

     <SeledtedMonth @emit-add-periodo="addPeriodo" :disabled="readonly"/>
    </v-navigation-drawer>

    <v-main >
      <v-container class="overflow-y-auto px-0 py-1" style="height:calc(100vh - 92px)">      
      <v-list dense nav>
        <v-list-item
          two-line
          v-for="pago in pagos"
          :key="pago.idpago"
          link
          @click="openRecibo(pago)"
        >       

         
            <v-list-item-title class="d-flex justify-space-between">
              <span>Folio: {{ pago.folio }}</span>
              <span>Dia Hora Pago: {{ dayjs(pago.fecha_hora_cobro).format('dddd[,] DD [de] MMMM [de] YYYY')}}</span>
            </v-list-item-title>
            <v-list-item-subtitle
              >Monto Cobrado: {{ numeral(pago.total).format('$0,0.00')}}</v-list-item-subtitle
            >       

          <template v-slot:append>
            <v-btn icon="mdi-printer" variant="outlined" color="primary" class="ml-2" size="small">
            </v-btn></template>
        </v-list-item>
      </v-list>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref ,watch } from 'vue';
import isNull from "lodash/isNull";
import isUndefined from "lodash/isUndefined";
import dayjs from "dayjs";
import numeral from 'numeral'
import SeledtedMonth from './../../components/selectedMonth.vue'

    const periodo=ref<string[]>([])

    const cve_accion=ref<number|null>(null)
    const accion=ref<string>('')
    const titular=ref<string>('')
    const accionMask=ref({
      mask: "#FFFF",
      tokens: {
        F: {
          pattern: /[0-9a-cA-C]/,
          transform(v) {
            return v.toLocaleUpperCase();
          },
        },
        "#": {
          pattern: /\d/,
        },
      },
    })
    const readonly=ref<boolean>(true)
    const pagos=ref([])
    

    watch(accion,(val)=>{
      console.log('watch accion:',val)
       if(isNull(val) || isUndefined(val)) {
        cve_accion.value = 0;
        titular.value = "";
        pagos.value = [];
        readonly.value = true;
        periodo.value = [dayjs().format('YYYY-MM')];
      }
    })

    watch(periodo,(val)=>{
      if(val.length>0)getPagosPorPeriodo();
      else pagos.value=[]
      })

    function buscarAccion(){
      console.log("entra aqui");

      let numero_accion = accion.value;
      let clasificacion = 0;

      if (accion.value.indexOf("A") > -1) {
        numero_accion=accion.value.substr(0,accion.value.indexOf("A"))
        clasificacion = 1;
      } else if (accion.value.indexOf("B") > -1) {
        numero_accion=accion.value.substr(0,accion.value.indexOf("B"))
        clasificacion = 2;
      } else if (accion.value.indexOf("C") > -1) {
        numero_accion=accion.value.substr(0,accion.value.indexOf("C"))
        clasificacion = 3;
      }

      try {
  
        // let data = window.ipcRenderer.sendSync("buscarReimpresionAccion",numero_accion,clasificacion);
        let data = window.electron.findAccionReimprimir(numero_accion,clasificacion);
        console.log("🚀 ~ file: App.vue ~ line 143 ~ buscarAccion ~ data", data)

      
        
        if (!data) {
          //es falso no exste la accion
            titular.value = "";
            cve_accion.value = 0;
            readonly.value=true
        } else {
          titular.value = `${data.nombre} ${data.apellido_paterno} ${data.apellido_materno}`;
          cve_accion.value = data.cve_accion;
          readonly.value = false;
          // getPagosPorPeriodo();
        }
      } catch (e) {
        console.error(e);
      }
    }

    function getPagosPorPeriodo() {
      
      // let periodos = periodo.value.map(i => dayjs(i).format("MM-YYYY"));
      console.log("🚀 ~ file: App.vue ~ line 166 ~ cve_accion",cve_accion.value)
      console.log("🚀 ~ file: App.vue ~ line 166 ~ periodo", periodo.value)
      // pagos.value = window.ipcRenderer.sendSync("pagosAccion",cve_accion.value,periodos);
      // window.electron.getPagosByPeriodo(cve_accion.value,periodo.value)
      pagos.value=window.electron.getPagosByPeriodo(cve_accion.value,Object.values(periodo.value))
    }

    function openRecibo(item) {
      
      console.log("🚀 ~ file: App.vue ~ line 170 ~ openRecibo ~ item", item.idpago)
     window.electron.openReciboReimprimir(item.idpago)
  
    }

    function addPeriodo(e){   
    console.log("🚀 ~ file: App.vue ~ line 208 ~ e", e)
    periodo.value=e
    }

    function close()
    {
      window.electron.closeReimprimir()
    }

    function minimizar()
    {
      window.electron.miniReimprimir()
    }
    
</script>

<style>
html,body{
  overflow-y: hidden!important;
}

.v-navigation-drawer__content {  
     overflow-x: hidden!important; 
     overflow-y: hidden!important; 
}
</style>
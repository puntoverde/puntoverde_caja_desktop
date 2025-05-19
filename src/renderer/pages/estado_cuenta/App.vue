<template>
  <v-app style="border:1px solid #424242;max-height:100vh">
  <v-container fluid style="height:calc(100% - 2px)" class="overflow-y-auto">
  <div class="pt-7 contener">
    <div id="imprimir_recibo">

      <img src="@/renderer/assets/punto_verde.png" width="60" height="60"/>

      <div class="text-center headline mb-3">Estado Cuenta de la Accion: {{accion}}</div>
    <div class="d-flex justify-space-between mb-5">
      <span class="subtitle-1">Titular: {{titular}}</span>
      <span class="subtitle-1">{{fecha}}</span>
    </div>

    <table class="table">
      <thead>
        <tr bg-color="#f1f1f1" :class="{'n-10':cargos.length<=10,'n-12':cargos.length>=10}">
          <th class="th th-bg">Clave</th>  <!--Revisar-->
          <th class="th th-bg">Concepto</th>
          <th class="th th-bg">Usuario</th>
          <th class="th th-bg">Periodo</th>
          <th class="th th-bg">Costo</th>
          <th class="th th-bg">Cantidad</th>
          <th class="th th-bg">Descuento</th>
          <th class="th th-bg">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cargo in cargos" :key="cargo.cve_cargo">
          <td class="td text-center" :class="{'n-10':cargos.length<=10,'n-12':cargos.length>=10}">{{cargo.numero_cuota}}</td> <!--Revisar  -->
          <td class="td pl-2" :class="{'n-10':cargos.length<=10,'n-12':cargos.length>=10}">{{cargo.concepto}}<span v-show="cargo.cantidad>1">(x{{cargo.cantidad}})</span></td>
           <td class="td pl-2" :class="{'n-10':cargos.length<=10,'n-12':cargos.length>=10}">{{cargo.usuario}}</td>
          <td class="td text-center" :class="{'n-10':cargos.length<=10,'n-12':cargos.length>=10}">{{cargo.periodo}}</td>
          <td class="td text-center" :class="{'n-10':cargos.length<=10,'n-12':cargos.length>=10}">{{numeral(cargo.total).format('$0,0.00')}}</td>
          <td class="td text-center" :class="{'n-10':cargos.length<=10,'n-12':cargos.length>=10}">{{cargo.cantidad}}</td>
          <td class="td text-center" :class="{'n-10':cargos.length<=10,'n-12':cargos.length>=10}">{{numeral(cargo.descuento).format('$0,0.00')}}</td>
          <td class="td text-right pr-1" :class="{'n-10':cargos.length<=10,'n-12':cargos.length>=10}">{{numeral(cargo.total).multiply(cargo.cantidad).format('$0,0.00')}}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr :class="{'n-10':cargos.length<=10,'n-12':cargos.length>=10}">
           <th colspan="6">{{numLetter(cTotal)}}</th>
           <th>{{numeral(cDescuento).format('$0,0.00')}}</th>
           <th>{{numeral(cTotal).format('$0,0.00')}}</th>
        </tr>
      </tfoot>
    </table>

</div>

      <v-btn
        color="secondary"
        
        @click.prevent="cerrar"
        style="position:absolute;right:70px;bottom:3px"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>


      <v-btn
        color="secondary"        
        @click.prevent="imprimir"
        style="position:absolute;bottom:3px;right:2px"
      >
        <v-icon>mdi-printer</v-icon>
      </v-btn>
    <!-- </v-fab-transition> -->
  </div>
  
  </v-container>
  </v-app>
</template>

<script setup lang="ts">
import {ref,computed} from 'vue'
import numeral from 'numeral'
import dayjs from 'dayjs'
import 'dayjs/locale/es-mx'
import numLetter from './../../plugins/numLetter'

window.electron.onEstadoCuentaData(payload=>{

const {accion_titular,cargos:cargos_}=payload
titular.value=accion_titular.titular
accion.value=accion_titular.accion

if(cargos_.some(i=>i.cve_cuota==5))
{
  cargos.value=cargos_.filter(i=>i.cve_cuota==5)
}
else{
  cargos.value=cargos_
}

console.log('payload->',payload)


})
  
    const cargos=ref([])
    const titular=ref({})
    const accion=ref({})
    const fecha=dayjs().locale('es-mx').format('dddd DD [de] MMMM [del] YYYY [a las] HH:mm [horas]')
  
  const cTotal=computed(()=> {
      return cargos.value
        .map(item => numeral(item.total).multiply(item.cantidad).subtract(item.descuento).value())
        .reduce((prev, cur) => parseFloat(prev) + parseFloat(cur), 0);
    })
   
    const cDescuento=computed(()=> {
      return cargos.value
        .map(item => item.descuento)
        .reduce((prev, cur) => parseFloat(prev) + parseFloat(cur), 0);
    })

    function imprimir() {
      window.electron.imprimirEstadoCuenta()  
    }
    function cerrar(){
          window.electron.closeEstadoCuenta()
    }
 


</script>

<style>

html,body{
  overflow-y: hidden!important;
}

.contenedor {
  margin-left: 10px;
}

.table {
  width: 100%;
  border: 1px solid #d1d1d1;
  border-collapse: collapse;
}

.th-bg {
  background-color: #f1f1f1 !important;
}

.th,
.td {
  border: 1px solid #d1d1d1;
  
}

.n-10{font-size: 13.5px}
.n-12{font-size: 12.5px}

@media print{

.contener{
  padding-top: 350px;
}

.n-10{font-size: 11px}
.n-12{font-size: 10px}

}

img{
  position: fixed;top: 10px;left: 25px;
  -webkit-filter: grayscale(100%);
	
-moz-filter: grayscale(100%);
	
-ms-filter: grayscale(100%);
	
-o-filter: grayscale(100%);
	
filter: grayscale(100%);	}
</style>
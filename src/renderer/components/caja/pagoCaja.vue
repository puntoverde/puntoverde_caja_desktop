<template>
  <v-footer app id="pago" height="100" class="pt-0">
    <div id="subtotal" class="bg-secondary px-3 rounded">
      <span class="title-money">Subtotal</span>
      <span class="format-money">

        {{
          numeral(subtotal).format("$0,0.00")
        }}</span>
    </div>
    <div id="iva" class="bg-secondary px-3 rounded">
      <span class="title-money">Iva</span>
      <span class="format-money">{{ numeral(iva).format("$0,0.00") }}</span>
    </div>
    <div id="descuento" class="bg-secondary px-3 rounded">
      <span class="title-money">Descuento</span>
      <span class="format-money">{{
        numeral(descuento).format("$0,0.00")
      }}</span>
    </div>
    <div id="recargo" class="bg-secondary px-3 rounded">
      <span class="title-money">Recargo</span>
      <span class="format-money">{{ numeral(recargo).format("$0,0.00") }}</span>
    </div>
    <div id="total" class="bg-secondary px-3 rounded">

      <div class="title-money">Total</div>
      <div class=" d-flex justify-space-between">

      <div style="height:36px">
        <v-btn color="primary" @click="openSheet" v-if="total > 0" width="250" height="45" style="font-size: 35px;">Cobrar</v-btn>
        <v-btn color="pink" @click="realizarPagoCero" v-if="total == 0 && cargos_pagar.length > 0" block>Pago Cero</v-btn>
      </div>
  <span class="format-money">
    {{ numeral(total).format("$0,0.00") }}
  </span>
      </div>

      <!-- <div style="height:36px">
        <v-btn color="primary" @click="openSheet" v-if="total > 0" block>Cobrar</v-btn>
        <v-btn color="pink" @click="realizarPagoCero" v-if="total == 0 && cargos_pagar.length > 0" block>Pago Cero</v-btn>
      </div> -->
    </div>
  </v-footer>

  <v-dialog v-model="sheet" persistent transition="dialog-bottom-transition" class="xjustify-center"
    content-class="pv-dialog">
    <v-window v-model="tab">
      <v-window-item :value="1">
        <v-card width="500px">
          <v-toolbar color="white">
            <v-toolbar-title class="text-primary" style="font-size: 25px">Selecciona forma de Pago</v-toolbar-title>
            <v-btn @click="cerrarSheet" icon="mdi-close-circle" color="secondary"></v-btn>
          </v-toolbar>
          <v-card-text>
            <v-item-group v-model="formas_pago_selected" class="pv-grid" selected-class="bg-primary" multiple>
              <v-item v-slot="{ isSelected, selectedClass, toggle }" v-for="fpago in lst_formas_pago_sat"
                :key="fpago.clave" :value="fpago">
                <v-card elevation="0" @click="toggle" class="
                text-center
                d-flex
                flex-column
                align-center
                justify-space-between
              " :class="[selectedClass]">
                  <v-avatar size="50">
                    <v-icon size="x-large" :color="isSelected ? 'white' : fpago.color">{{ fpago.icono }}</v-icon>
                  </v-avatar>
                  {{ fpago.forma_pago }}
                </v-card>
              </v-item>
            </v-item-group>
            <v-text-field v-model="folio_m8" label="folio" hide-details class="mt-2"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <!-- if muestra cuando solo este seleccionado un pago y no sea cheque -->
            <v-btn @click="realizarPago" class="bg-primary" block v-if="cSelectedPago && cSelectedPagoCount == 1">Pagar
              {{ numeral(total).format('$0,0.00') }}</v-btn>
            <v-btn @click="tab = 2" class="bg-secondary" block v-else-if="cSelectedPagoCount != 0">Continuar</v-btn>
          </v-card-actions>
        </v-card>
      </v-window-item>
      <v-window-item :value="2">
        <v-card width="500px">
          <v-toolbar color="white">
            <v-btn @click="backFormasPago" icon="mdi-arrow-left-top"></v-btn>
            <v-toolbar-title class="text-primary" style="font-size: 25px">Montos de pagos</v-toolbar-title>
            <v-btn @click="cerrarSheet" icon="mdi-close-circle" color="secondary"></v-btn>
          </v-toolbar>
          <v-card-text>
            <template v-for="fpagos_selected in formas_pago_selected" :key="fpagos_selected.clave">

              <div v-if="fpagos_selected.clave == 2" class="border d-flex flex-wrap pa-1 mb-4">
                <PVCurrenciInput style="width:100%" v-model="fpagos_selected.monto"
                  :options="{ currency: 'USD', locale: 'en-US', symbol: true }" :label="fpagos_selected.forma_pago"
                  :prepend-inner-icon="fpagos_selected.icono" />
                <v-select v-model="fpagos_selected.banco" label="Banco" hide-details :items="lst_bancos"
                  :menu-props="{ 'menu-props': true, top: true, 'max-height': 350 }">
                </v-select>
                <v-text-field v-model="fpagos_selected.cuenta" v-maska="'####'" label="cuenta"
                  hide-details></v-text-field>
              </div>
              <PVCurrenciInput v-else v-model="fpagos_selected.monto"
                :options="{ currency: 'USD', locale: 'en-US', symbol: true }" :label="fpagos_selected.forma_pago"
                :prepend-inner-icon="fpagos_selected.icono" />


            </template>

          </v-card-text>
          <v-card-actions>

            <!-- if muestra cuando solo este seleccionado un pago y no sea cheque -->
            <v-btn @click="realizarPago" class="bg-primary" block
              v-if="calcMontoFormaPago == total && cMontoFomaPagoFull">Pagar
              varias formas {{ numeral(total).format('$0,0.00') }}</v-btn>

          </v-card-actions>
        </v-card>
      </v-window-item>
      <v-window-item :value="3">
        <v-card width="500px">
          <v-toolbar color="white">
            <v-toolbar-title class="text-primary" style="font-size: 25px">
              Agregar Mantenimiento
            </v-toolbar-title>
            <v-btn color="primaryc" icon="mdi-close-circle" @click="cancelarCargaMentenimiento"></v-btn>
          </v-toolbar>
          <v-card-text>
            <v-sheet color="secondary" class="px-3 rounded">
              <p class="text-h6">
                Para continuar con el pago de la activacion,
                indique que se desea realizar con la cuota de mantenimiento
              </p>
            </v-sheet>

            <v-item-group v-model.number="opcion" selected-class="bg-primary" class="d-flex justify-space-between"
              style="column-gap:5px;align-content:stretch">
              <v-item v-slot="{ isSelected, selectedClass, toggle }" :value="1">
                <v-card @click="toggle" color="#f1f1f1" class="py-2 text-center border border--red px-5 text-h6"
                  :class="[selectedClass]" width="30%">

                  <v-btn variant="text" icon size="small" style="position:absolute;top:0;right:0">
                    <v-icon>mdi-information</v-icon>
                    <v-tooltip activator="parent" location="start" height="100px" width="250px"
                      content-class="bg-primary">
                      No agrega la cuota de mantenimiento pero la accion queda en estatus bloqueado.
                    </v-tooltip>
                  </v-btn>
                  No Aplica
                </v-card>
              </v-item>
              <v-item v-slot="{ isSelected, selectedClass, toggle }" :value="2">
                <v-card @click="toggle" color="#f1f1f1" class="py-2 text-center border px-5 text-h6"
                  :class="[selectedClass]" width="30%">
                  <v-btn variant="text" icon size="small" style="position:absolute;top:0;right:0">
                    <v-icon>mdi-information</v-icon>
                    <v-tooltip activator="parent" location="start" height="100px" width="250px"
                      content-class="bg-primary">
                      Se agrega la cuota de mantenimiento del perido en curso con costo normal.
                    </v-tooltip>
                  </v-btn>
                  Aplicar Normal
                </v-card>
              </v-item>
              <v-item v-slot="{ isSelected, selectedClass, toggle }" :value="3">
                <v-card @click="toggle" color="#f1f1f1" class="py-2 text-center border px-5 text-h6"
                  :class="[selectedClass]">
                  <v-btn variant="text" icon size="small" style="position:absolute;top:0;right:0">
                    <v-icon>mdi-information</v-icon>
                    <v-tooltip activator="parent" location="start" height="100px" width="250px"
                      content-class="bg-primary">
                      se agrega la cuota con lo proporcional de los dias a terminar el periodo
                    </v-tooltip>
                  </v-btn>
                  Aplicar Proporcional
                </v-card>
              </v-item>
            </v-item-group>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="bg-secondary" block @click="cargarMantenimientoActivacion" v-if="opcion > 0">aceptar</v-btn>
          </v-card-actions>
        </v-card>
      </v-window-item>
    </v-window>
  </v-dialog>


</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import throttle from "lodash/throttle";
import numeral from "numeral";
import { useCajaStore } from './../../store/cajastore'
import PVCurrenciInput from './../PVCurrencyInput.vue'
import { IPago } from "../../../main/model/model-type";
import { round } from "mathjs";

const emit = defineEmits<{ (e: 'ok-pago'): void, (e: 'ok-addCargo', cve_cargo: number): void }>()

const props = defineProps<{
  subtotal: number, //subtotal
  iva: number, //iva
  total: number, //total
  descuento: number, //descuento
  recargo: number, //recargo
  cargos_pagar: number[], //recargo
}>();

const store = useCajaStore()

const lst_formas_pago_sat = ref([]); //fomras de pago efectivo tarjeta etc
const sheet = ref<boolean>(false); //para el poput bottom
const tab = ref<number>(1); //para la tab seleccionada
const lst_bancos = ref<{ id: number, name: string }[]>([]); //lista de bancos
const loading_save = ref<boolean>(false); //loading de btn guardar pago
const formas_pago_selected = ref([]); //los pagos seleccionados

const folio_m8=ref()

const opcion = ref<number>(0)//es para seleciconar la opcion de cargar mantenimiento
const cve_persona = ref<number>(0)//dueño de la accion
const periodo = ref<string>()

const cSelectedPago = computed<boolean>(() => !formas_pago_selected.value.map(i => i.clave).some(i => i == 2))
const cSelectedPagoCount = computed<number>(() => formas_pago_selected.value.length)

const calcMontoFormaPago = computed<number>(() => {
  return formas_pago_selected.value
    .map((i) => numeral(i.monto).value())
    .reduce((acumulador, value) => acumulador + value, 0);
});

const cMontoFomaPagoFull = computed<boolean>(() => !formas_pago_selected.value.map(i => i.monto).some(i => i == 0))

watchEffect(() => {
  if (cSelectedPago.value && cSelectedPagoCount.value == 1) {
    formas_pago_selected.value[0].monto = props.total
  }
  else {
    formas_pago_selected.value.forEach(i => { i.monto = 0; i.banco = ''; i.cuenta = '' })
  }
})

getFormasPago();
getBancos();

window.electron.onPagoOK(() => {
  cerrarSheet()
  emit('ok-pago')
})

function getFormasPago() {
  const data = window.electron.getFormasPago();
  lst_formas_pago_sat.value = data.map(i => ({ ...i, monto: 0, banco: '', cuenta: '' }))
}

function getBancos() {
  const bancos = window.electron.getBancos();
  console.log("🚀 ~ file: pagoCaja.vue ~ line 208 ~ getBancos ~ bancos", bancos)
  lst_bancos.value = bancos.map(i => i.name)

}

const realizarPago = throttle(() => {
  //SE MUTA LAS FORMAS DE PAGO
  let forma_pago = formas_pago_selected.value.map(i => ({
    clave: i.clave,
    monto: numeral(i.monto).value(),
    banco: i.banco,
    cheque: i.cheque,
  }));

  const dataSend: IPago = {
    subtotal: round(props.subtotal, 2),
    iva: round(props.iva, 2),
    total: round(props.total, 2),
    descuento: round(props.descuento, 2),
    recargo: round(props.recargo, 2),
    cargos_pagar: props.cargos_pagar,
    forma_pagos: forma_pago,
    cve_accion: store.cve_accion,
    folio_m8:folio_m8.value
  }

  // loading_save.value=true
  const data = window.electron.savePago(dataSend);
  // loading_save.value=false 

}, 3000);

const realizarPagoCero = throttle(() => {
  loading_save.value = true;
  let data = window.electron.savePagoCero(store.cve_accion, props.cargos_pagar);
  loading_save.value = false;

  if (data > 0) {
    emit('ok-pago')
  }
}, 3000);

function cerrarSheet() {
  sheet.value = false;
  loading_save.value = false
  formas_pago_selected.value = []
  setTimeout(() => tab.value = 1, 1000)
}

function openSheet() {
  const data = window.electron.verificPago(props.cargos_pagar)
  console.log("🚀 ~ file: pagoCaja.vue ~ line 252 ~ openSheet ~ data", data)
  tab.value = 1
  //el if es cuado data.mantenimiento es false y data.cve_accion existe 
  //nota siempre existe data.mantenimiento solo que es true o false
  if (!data.mantenimiento && data.cve_accion) {
    tab.value = 3
    cve_persona.value = data.cve_persona
    periodo.value = data.periodo
  }

  sheet.value = true;

}

function backFormasPago() {
  tab.value = 1
  formas_pago_selected.value = []
}

function cargarMantenimientoActivacion() {
  const cve_cargo = window.electron.createCargoMantenimiento(opcion.value, store.cve_accion, cve_persona.value, periodo.value)
  console.log("🚀 ~ file: VerificarPagoActivacion.vue ~ line 79 ~ continuar ~ cve_cargo", cve_cargo)
  emit('ok-addCargo', cve_cargo)
  tab.value = 1
}

function cancelarCargaMentenimiento() {
  opcion.value = 0;
  setTimeout(() => tab.value = 1, 50);
  sheet.value = false
}
</script>

<style scoped>
#pago {
  /* background-color: aqua!important; */
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 5px;
}

#subtotal {
  /* background-color: blue; */
  grid-column-start: 1;
  grid-row-start: 1;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 1px 1px;
}

#iva {
  /* background-color: blueviolet; */
  grid-column-start: 2;
  grid-row-start: 1;
  height: 100%;
  display: flex;
  justify-content: space-between;
}

#descuento {
  /* background-color: cornflowerblue; */
  grid-column-start: 1;
  grid-row-start: 2;
  height: 100%;
  display: flex;
  justify-content: space-between;
}

#recargo {
  /* background-color: crimson; */
  grid-column-start: 2;
  grid-row-start: 2;
  height: 100%;
  display: flex;
  justify-content: space-between;
}

#total {
  /* background-color: darkmagenta; */
  grid-column-start: 3;
  grid-row-start: span 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

/* #total>div{
  display: flex;
  justify-content: space-between;
 
  background-color: red;
} */

.title-money {
  font-size: 30px;
  /* background-color: aqua; */
  color: #fff;
}

.format-money {
  /* font-size: 50px; */
  font-size: 30px;
  /* background-color: blueviolet; */
  align-self: flex-end;
  color: #fff;
}

/* f pagos */
.pv-grid {
  display: grid;
  grid-template-columns: repeat(4, 100px);
  grid-template-rows: repeat(2, 100px);
  gap: 15px;
}

:deep(.pv-dialog) {
  width: 500px !important;
  position: absolute;
  bottom: 0px;
  margin-bottom: 0px !important;
}
</style>
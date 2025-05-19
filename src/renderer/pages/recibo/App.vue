<template>
  <v-app class="elevation-2" style="border:1px solid #424242;max-height:100vh">
    <v-container style="height:calc(100% - 2px)" class="overflow-y-auto">
      <div class="pt-7 contener">
        <div id="imprimir_recibo">
          <div class="d-flex justify-end">
            Folio: &nbsp;
            <b class="ml-2">{{ folio }}</b>
          </div>
          <div class="d-flex justify-space-between">
            <span
              >Accion:<b class="ml-1">{{ accion }}</b></span
            >

            <span>{{
              dayjs(fecha).locale('es-mx').format("dddd[,] DD [de] MMMM [de] YYYY HH:mm")
            }}</span>
          </div>
          <div class="d-flex justify-space-between">
            <span>{{ titular }}</span>
            <span>Cajero(a): {{ cajero }}</span>
          </div>

          <table class="table">
            <thead>
              <tr bg-color="#f1f1f1">
                <th class="th th-bg">Clave</th>
                <th class="th th-bg">Concepto</th>
                <th class="th th-bg">Periodo</th>
                <th class="th th-bg">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cargo in cargos" :key="cargo.cve_cargo">
                <td
                  class="td text-center"
                  :class="{
                    'n-10': cargos.length == 10,
                    'n-12': cargos.length == 12,
                  }"
                >
                  {{ cargo.producto_servicio }}
                </td>
                <td
                  class="td pl-2"
                  :class="{
                    'n-10': cargos.length == 10,
                    'n-12': cargos.length == 12,
                  }"
                >
                  {{ cargo.concepto }}
                  <span v-show="cargo.cantidad > 1"
                    >(x{{ cargo.cantidad }})</span
                  >
                </td>
                <td
                  class="td text-center"
                  :class="{
                    'n-10': cargos.length == 10,
                    'n-12': cargos.length == 12,
                  }"
                >
                  {{ cargo.periodo }}
                </td>
                <td
                  class="td text-right pr-1"
                  :class="{
                    'n-10': cargos.length == 10,
                    'n-12': cargos.length == 12,
                  }"
                >
                  {{
                    numeral(cargo.total)
                      .multiply(cargo.cantidad)
                      .format("$0,0.00")
                  }}
                </td>
              </tr>
            </tbody>
          </table>

          <div class="d-flex justify-space-between">
            <span>{{numLetter(cTotal) }}</span>
            <span>Subtotal: {{ numeral(cSubTotal).format("$0,0.00") }}</span>
          </div>
          <div class="d-flex justify-end">
            Recargos: {{ numeral(cRecargo).format("$0,0.00") }}
          </div>
          <div class="d-flex justify-end">
            Descuentos: {{ numeral(cDescuento).format("$0,0.00") }}
          </div>
          <div class="d-flex justify-end">
            Total &nbsp;
            <b>{{ numeral(cTotal).format("$0,0.00") }}</b>
          </div>

          <div class="d-flex justify-center">
            Forma de pago:
            <span v-for="fpa in forma_pago" :key="fpa.forma"
              >{{ fpa.forma }}({{ numeral(fpa.monto).format("$0,0.00") }})</span
            >
          </div>
        </div>
      </div>

      <v-btn
        color="secondary"
        position="absolute"
        class="v-btn--example"
        @click.prevent="openFacturar"
        style="right: 115px; bottom: 6px"
        icon="mdi-file"
      >
      </v-btn>

      <v-btn
        color="secondary"
        position="absolute"
        class="v-btn--example"
        @click.prevent="cerrar"
        style="right: 60px; bottom: 6px"
        icon="mdi-close"
      >
      </v-btn>

      <v-btn
        color="secondary"
        position="absolute"
        class="v-btn--example"
        @click.prevent="imprimir"
        style="bottom: 6px; right: 5px"
        icon="mdi-printer"
      >
        <v-icon></v-icon>
      </v-btn>
    </v-container>
  </v-app>
</template>

<script lang="ts">
type ICargosRecibo = {
  producto_servicio: number;
  concepto: string;
  total: number;
  descuento: number;
  cantidad: number;
  periodo: string;
  cve_cargo: number;
  recargo: number;
};
type IFormaPago = { forma: string; monto: number };
</script>

<script setup lang='ts'>
import { ref, computed } from "vue";
import numeral from "numeral";
import dayjs from "dayjs";
import 'dayjs/locale/es-mx'
import { IPagoRecibo } from "./../../../main/model/model-type";
import numLetter from './../../plugins/numLetter'

const accion = ref<string>("");
const cargos = ref<ICargosRecibo[]>([]);
const cajero = ref<string>("");
const titular = ref<string>("");
const folio = ref<string>("");
const forma_pago = ref<IFormaPago[]>([]);
const fecha = ref<string>("");
const cve_accion = ref<number>(0);
const id_pago = ref<number>(0);

const cTotal = computed(() =>
  cargos.value
    .map((i) =>
      numeral(i.total).multiply(i.cantidad).subtract(i.descuento).value()
    )
    .reduce((acu, val) => acu + val, 0)
);
const cSubTotal = computed(() =>
  cargos.value
    .map((item) => numeral(item.total).multiply(item.cantidad).value())
    .reduce((acu, val) => acu + val, 0)
);
const cDescuento = computed(() =>
  cargos.value.map((i) => i.descuento).reduce((acu, val) => acu + val, 0)
);
const cRecargo = computed(() =>
  cargos.value.map((i) => i.recargo).reduce((acu, val) => acu + val, 0)
);

window.electron.onRiciboData((payload: IPagoRecibo) => {

  folio.value = payload.folio;
  titular.value = payload.socio;
  fecha.value = payload.fecha_hora_cobro;
  cve_accion.value = payload.cve_accion;
  id_pago.value = payload.idpago;
  accion.value = payload.accion;
  cajero.value = payload.persona_cobra;

  const cargos_map = payload.cargos.split("|").map((i) => i.split(","));
  cargos.value = cargos_map.map(
    (i): ICargosRecibo => ({
      producto_servicio: numeral(i[0]).value(),
      concepto: i[1],
      total: numeral(i[2]).value(),
      descuento: numeral(i[3]).value(),
      cantidad: numeral(i[4]).value(),
      periodo: i[5],
      cve_cargo: numeral(i[6]).value(),
      recargo: 0,
    })
  );
  const forma_pago_map = payload.forma_pago.split("|").map((i) => i.split(","));
  forma_pago.value = forma_pago_map.map(
    (i): IFormaPago => ({ forma: i[0], monto: numeral(i[1]).value() })
  );
});

function imprimir() {
  window.electron.imprimirRecibo()
}
function cerrar() {
  window.electron.closeRecibo();
}
function openFacturar() {
  window.electron.openFacturaV4(cve_accion.value, id_pago.value);
}
</script>

<style >

html,body{
  overflow-y: hidden!important;
}
.contenedor {
  margin-left: 10px;
}

.table {
  /* width: 700px; */
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

.n-10 {
  font-size: 13.5px;
}
.n-12 {
  font-size: 11px;
}

@media print {
  .contener {
    padding-right: 150px;
    padding-top: 350px;
  }
}
</style>
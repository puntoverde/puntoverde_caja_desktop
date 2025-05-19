<template>
  <v-app>
    <v-system-bar app color="primary" class="pr-0">
      <v-icon color="white mr-3">mdi-cash-register</v-icon>
      <span>Sistema Caja v1.2</span>
      <v-spacer></v-spacer>
      <v-btn size="small" variant="text" @click="minimizar">
        <v-icon color="white">mdi-window-minimize</v-icon>
      </v-btn>
      <v-btn size="small" variant="text" @click="close">
        <v-icon color="white">mdi-window-close</v-icon>
      </v-btn>
    </v-system-bar>

    <Banner></Banner>

    <v-main id="content-full">
      <v-container fluid>
        <q-table
          flat
          bordered
          :columns="
            headers.map((i) => ({
              name: i.value,
              label: i.text,
              field: i.value,
              align:i.align,
              headerClasses:'text-subtitle-2',
              classes:'bg-blue-grey-lighten-5x text-subtitle-1'
              //classes:row => (row.rowIndex % 2 === 0 ? 'bg-green' : 'bg-yellow')
            }))
          "
          :rows="store.lst_cargos"
          selection="multiple"
          row-key="cve_cargo"
          v-model:selected="cargos_cobrar"
          class="my-sticky-header-table"
          hide-bottom
          :rows-per-page-options="[0]"
        >
          <template v-slot:header-selection="scope">
            <q-checkbox color="primary" keep-color v-model="scope.selected" />
          </template>

          <template v-slot:body-selection="scope">
            <q-checkbox
              color="primary"
              keep-color
              :model-value="scope.selected"
              @update:model-value="
                (val, evt) => {
                  Object.getOwnPropertyDescriptor(scope, 'selected').set(
                    val,
                    evt
                  );
                }
              "
            />
          </template>

          <template v-slot:top-row>
            <q-tr>
              <q-td colspan="100" style="height: 5px" class="bg-primary pa-0">
              </q-td>
            </q-tr>
          </template>

          <template v-slot:body-cell-total="props">
            <q-td :props="props" class="font-weight-boldx text-subtitle-2 font-console">
              {{
                numeral(props.value).format("$0,0.00")
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-periodo="props">
            <q-td :props="props">
              <v-chip color="primary" class="font-weight-bold text-subtitle-2">
              {{props.value}}
              </v-chip>
            </q-td>
          </template>

          

          <template v-slot:body-cell-total_final="props">
            <q-td :props="props" class="font-weight-boldx text-subtitle-2">
              {{
                numeral(props.row.cantidad)
                .multiply(props.row.total)
                .subtract(props.row.descuento)
                .format("$0,0.00")
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-recargo="props">
            <q-td :props="props" class="font-weight-boldx text-subtitle-2">
              {{
                numeral(props.value).format("$0,0.00")
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-descuento="props">
            <q-td :props="props" class="font-weight-boldx text-subtitle-2">
              {{
                numeral(props.value).format("$0,0.00")
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-persona="props">
            <q-td :props="props" class="font-weight-boldx text-subtitle-2">
              <v-tooltip color="primary" content-class="bg-primary rounded-xl">
                <template v-slot:activator="{props}">
                  <v-btn icon="mdi-account" size="small" color="secondary" v-bind="props" />
                </template>
                <span>{{props.value}}</span>
              </v-tooltip>
            </q-td>
          </template>
        </q-table>
      </v-container>
    </v-main>
    <PagoCaja
      :cargos_pagar="cargos_cobrar.map((i) => i.cve_cargo)"
      :total="cTotal"
      :subtotal="cSubTotal"
      :iva="cIva"
      :descuento="cDescuento"
      :recargo="cRecargo"
      @ok-pago="refreshTable"
      @ok-addCargo="addCargoMantenimiento"
    />
  </v-app>
</template>
<script setup lang="ts">
import Banner from "../../components/caja/BannerCaja.vue";
import PagoCaja from "../../components/caja/pagoCaja.vue";
import { QTable, QTr, QTd, QCheckbox } from "quasar";
import { useCajaStore } from "./../../store/cajastore";
import numeral from "numeral";
import { computed, ref, watch } from "vue";

const store = useCajaStore();

//las cabeceras de la tabla
const headers = [
  {
    text: "Clave",   //Revisar
    align: "center",
    sortable: false,
    // value: "producto_servicio",
    value: "numero_cuota",
    class: ["body-1"],
  },
  {
    text: "Concepto",
    value: "concepto",
    sortable: false,
    class: ["body-1"],
    align: "left",
  },
  {
    text: "Precio Unitario",
    value: "total",
    sortable: false,
    class: ["body-1"],
    align: "right",
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
    align: "right",
  },
  {
    text: "Descuento",
    value: "descuento",
    sortable: false,
    class: ["body-1"],
    align: "right",
  },
  {
    text: "Subtotal",
    value: "total_final",
    sortable: false,
    class: ["body-1"],
    align: "right",
  },
  {
    text: "usuario",
    value: "persona",
    sortable: false,
    class: ["body-1"],
    align: "center",
  },
];
//lista de cargos de la accion a buscar
const lst_cargos = ref([]);
//son los cargos que se seleccionaron para pagar
const cargos_cobrar = ref([]);
//loading que se muestra en lo que se buscan los cargos
const load_table = ref(false);

//computed que calcula el total de los cargos seleccionados a pagar
const cTotal = computed(() =>
  
    trunc(
    cargos_cobrar.value
      .map((i) =>
        numeral(i.total).multiply(i.cantidad).subtract(i.descuento).value()
      )
      .reduce((prev, cur) => numeral(prev).add(cur).value(), 0))
    
);

//computed que calcula el subtotal de los cargos seleccionados a pagar
const cSubTotal = computed(() =>
    trunc(numeral(cTotal.value).divide(116).multiply(100).value())
);

//computed que calcula el iva de los cargos seleccionados a pagar
const cIva = computed(() =>
    trunc(numeral(cSubTotal.value).multiply(0.16).value())
);

//computed que calcula el descuento aplicado de los cargos seleccionados a pagar
const cDescuento = computed(() =>
    trunc(
    cargos_cobrar.value
      .map((i) => numeral(i.descuento).value())
      .reduce((prev, cur) => numeral(prev).add(cur).value(), 0))
);

//computed que calcula el recargo a aplicar de los cargos seleccionados a pagar
const cRecargo = computed(() =>
    trunc(
    cargos_cobrar.value
      .map((i) => numeral(i.recargo).value())
      .reduce((prev, cur) => numeral(prev).add(cur).value(), 0))
);

watch(
  () => store.lst_cargos,
  (v) => {
    console.log("🚀 ~ file: App.vue ~ line 181 ~ watch ~ v", v);
    //borra solo los que ya no esten en los cargos
    cargos_cobrar.value = cargos_cobrar.value.filter(i=>v.map(j=>j.cve_cargo).includes(i.cve_cargo))
  }
);

window.electron.onRefreshTableCargos(() => refreshTable());

//function que se ejecuta cuando pagpo emite evento
function refreshTable() {
  store.lst_cargos = window.electron.getCargos(store.cve_accion);
}

function addCargoMantenimiento(cve_cargo_agregado)
{
  //vuelvo a llenar los cargos
  const cargos_full= window.electron.getCargos(store.cve_accion);
  //asigno los cargos al store
  store.lst_cargos =cargos_full;
  //busco el cargo en los que recupere 
  const cargo_agregado=cargos_full.find(i=>i.cve_cargo==cve_cargo_agregado)
  //agrego el cargo alos seleccionados
  if(Boolean(cargo_agregado)){
    cargos_cobrar.value.push(cargo_agregado)
  }
}

//function que muestra el detalle de un invitado
function showDetalleInvitado(cve_invitado) {
  //se consultan los datos del invitado
  let invitado = window.ipcRenderer.sendSync("detalleInvitado", cve_invitado);
  //se muestra un messagebox con los datos del invitado
  let ventana = window.remote.getCurrentWindow();
  window.remote.dialog.showMessageBox(ventana, {
    type: "info",
    title: "Detalle del invitado...",
    message: `${invitado.accion}, ${invitado.nombre} ${invitado.apellido_paterno} ${invitado.apellido_materno}`,
    detail: `Periodo: ${invitado.date1} al ${invitado.date2}`,
  });
}

function close() {
  window.electron.closeCaja();
}

function minimizar() {
  window.electron.miniCaja();
}

function openToolsVue() {
  // window.remote.getCurrentWindow().toggleDevTools()
}

//trunca un numero decimal a solo 3 ejemplo 777.784512 to 777.784 
function trunc (n) {
 let t=n.toString();
  let regex=/(\d*.\d{0,3})/;
  return t.match(regex)[0];
}


</script>

<style>
html,
body {
  overflow-y: hidden !important;
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
  height: 250px !important;
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

/* table  */

.my-sticky-header-table {
  /* height or max-height is important */
  /* height: calc(100vh - 380px); */
  height: calc(100vh - 260px);
  /* this is when the loading indicator appears */
}
.my-sticky-header-table .q-table__top,
.my-sticky-header-table .q-table__bottom,
.my-sticky-header-table thead tr:first-child th {
  /* bg color is important for th; just specify one */
  /* background-color: #c1f4cd;  */
  background-color: rgb(var(--v-theme-secondary));
  color: white;
}
.my-sticky-header-table thead tr th {
  position: sticky;
  z-index: 1;
}
.my-sticky-header-table thead tr:first-child th {
  top: 0;
}
.my-sticky-header-table.q-table--loading thead tr:last-child th {
  /* height of all previous header rows */
  top: 48px;
}

.font-console{
  font-family: RobotoMono;
}
</style>
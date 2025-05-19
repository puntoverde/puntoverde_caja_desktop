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
            <q-td :props="props" class="font-weight-boldx text-subtitle-2">
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
                  .format("$0,0.00")
              }}
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
    />
  </v-app>
</template>
<script setup lang="ts">
import Banner from "../../components/caja/BannerCaja.vue";
import PagoCaja from "../../components/caja/pagoCaja.vue";
import { QTable, QTr, QTd, QCheckbox } from "quasar";
import { useCajaStore } from "./../../store/cajastore";
// import Facturacion from "@/front/components/Caja/Facturacion";
import numeral from "numeral";
import { round } from "mathjs";
import { computed, onMounted, ref, watch } from "vue";

const store = useCajaStore();

//las cabeceras de la tabla
const headers = [
  {
    text: "Clave",
    align: "left",
    sortable: false,
    value: "producto_servicio",
    class: ["body-1"],
    align: "center",
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
];
//lista de cargos de la accion a buscar
const lst_cargos = ref([]);
//son los cargos que se seleccionaron para pagar
const cargos_cobrar = ref([]);
//loading que se muestra en lo que se buscan los cargos
const load_table = ref(false);
//es la altura de la tabla inicial mente en 48 pixeles
const table_height = ref(48);
//es el cajero quien esta cobrando se recupera del localstorage
const cajero = ref({});
//son los datos de facturacion como object o false en caso de que no se requiera factura
const factura = ref({});

//computed que calcula el total de los cargos seleccionados a pagar
const cTotal = computed(() =>
  round(
    cargos_cobrar.value
      .map((i) =>
        numeral(i.total).multiply(i.cantidad).subtract(i.descuento).value()
      )
      .reduce((prev, cur) => numeral(prev).add(cur).value(), 0),
    2
  )
);

//computed que calcula el subtotal de los cargos seleccionados a pagar
const cSubTotal = computed(() =>
  round(numeral(cTotal.value).divide(116).multiply(100).value(), 2)
);

//computed que calcula el iva de los cargos seleccionados a pagar
const cIva = computed(() =>
  round(numeral(cSubTotal.value).multiply(0.16).value(), 2)
);

//computed que calcula el descuento aplicado de los cargos seleccionados a pagar
const cDescuento = computed(() =>
  round(
    cargos_cobrar.value
      .map((i) => numeral(i.descuento).value())
      .reduce((prev, cur) => numeral(prev).add(cur).value(), 0),
    2
  )
);

//computed que calcula el recargo a aplicar de los cargos seleccionados a pagar
const cRecargo = computed(() =>
  round(
    cargos_cobrar.value
      .map((i) => numeral(i.recargo).value())
      .reduce((prev, cur) => numeral(prev).add(cur).value(), 0),
    2
  )
);

//computed que obtiene array de cve_cargos apagar
const cCargos = computed(() => cargos_cobrar.value.map((i) => i.cve_cargo));

watch(
  () => store.lst_cargos,
  (v) => {
    console.log("🚀 ~ file: App.vue ~ line 181 ~ watch ~ v", v);
    cargos_cobrar.value = [];
  }
);

window.electron.onRefreshTableCargos(() => refreshTable());

//function que se ejecuta cuando pagpo emite evento
function refreshTable() {
  store.lst_cargos = window.electron.getCargos(store.cve_accion);
}

//function que abre el estado de cuenta
function estadoCuenta(titularx, accionx) {
  let cargos_mostrar = lst_cargos.value; //asigna el total de los cargos a la variable que se envia
  if (lst_cargos.value.findIndex((i) => i.cve_cuota === 5) >= 0) {
    //verifica que se encuentre un cargo de activacion
    //si encuentra un cargo de activacion entra y solo carga la activacion
    cargos_mostrar = lst_cargos.value.filter((i) => i.cve_cuota === 5); //crea un nuevo array solo con un cargo de activacion
  }
  let data = {
    titular: store.titular, //se agrega el titular
    accion: accionx, //se agrega el numero de accion
    cargos: cargos_mostrar, //se agregan todos los cargos que tiene la accion consultada
    fecha: new Date(), //se envia la fecha de consulta de estado de cuenta
  };
  //se abre la ventana de estado cuenta y se le envian los datos
  window.ipcRenderer.send("openEstadoCuenta", data);
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
  // window.remote.getCurrentWindow().close();
  window.electron.closeCaja();
}

function minimizar() {
  // window.remote.getCurrentWindow().minimize()
  window.electron.miniCaja();
}

function openToolsVue() {
  // window.remote.getCurrentWindow().toggleDevTools()
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
  height: calc(100vh - 380px);
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
</style>
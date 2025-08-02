<template>
  <v-app style="border:2px solid #14bf98;height:100vh">
    <v-system-bar color="primary" style="/*width:calc(100% - 4px);left:2px;top:2px*/">
      <v-btn size="small" variant="text" @click="close"><v-icon>mdi-close</v-icon></v-btn>
    </v-system-bar>
    <v-main style="bootom:2px;max-height:calc(100vh - 2px)">
      <div class="d-flex flex-row bg-blue" style="height: calc(100vh - 28px)">
        <div style="width: 500px" class="bg-red">
          <v-toolbar elevation="0" color="secondary" class="px-3">
            <v-text-field placeholder="Buscar Cuota" v-model="find_cuota" clearable hide-details
              prepend-inner-icon="mdi-magnify" color="primary" variant="filled" />
          </v-toolbar>

          <v-card style="height: 508px; overflow-y: auto" rounded="0">
            <v-list v-model:selected="cuota" select-strategy="single-leaf">
              <template v-for="(item, index) in Ccuotas" :key="index">
                <v-list-item :value="item" active-color="primary">
                  <template v-slot:prepend>
                    <v-avatar color="secondary"> {{ item.numero_cuota }}</v-avatar>
                  </template>

                  <v-list-item-title>{{ item.concepto }}</v-list-item-title>

                  <template v-slot:append>{{
                    numeral(item.total).format("$0,0.00")
                    }}</template>
                </v-list-item>
                <v-divider inset />
              </template>
            </v-list>
          </v-card>

        </div>


        <div style="width: 496px" class="bg-pink">

          <v-toolbar elevation="0" color="secondary" extended extension-height="100" class="px-3">

            <PVCurrencyInput :options="{ currency: 'USD', locale: 'en-US', symbol: true }" density="compact"
              label="Monto Editable" variant="solo" prepend-inner-icon="mdi-pencil" v-model="precio"
              :readonly="!editable" hide-details color="secondary" />

            <template #extension>
              <v-text-field density="compact" label="veces aplicar" variant="solo" v-model="cantidad" readonly
                prepend-inner-icon="mdi-minus-circle" append-inner-icon="mdi-plus-circle" @click:prepend-inner="minus"
                @click:append-inner="plus" class="mr-1" color="white" bg-color="primary" hide-details />

              <q-input ref="inputx" v-model="periodo" dense outlinedx bg-color="primary" standout="text-primary" darkx>

                <q-popup-proxy ref="menux" cover transition-show="scale" transition-hide="scale">
                  <q-date ref="datex" @update:model-value="checkValue" v-model="periodo" emit-immediately
                    default-view="Months" mask="MM-YYYY" years-in-month-view minimal>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>

              </q-input>
              <!-- v-model="periodo" -->
              <!-- <v-text-field
                ref="inputx"
                :value="periodo"
                variant="solo"
                label="Perido Aplica"
                prepend-inner-icon="mdi-calendar-month"
                readonlyx
                class="ml-1"
                color="primary"
                density="compact"
              > -->
              <!-- <q-popup-proxy
                  ref="menux"
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                > -->
              <!-- <v-card> -->
              <!-- <q-date
                      ref="datex"
                      @update:model-value="checkValue"
                      v-model="periodo"
                      emit-immediately
                      default-view="Months"
                      mask="MM-YYYY"
                      years-in-month-view
                      minimal
                    ></q-date> -->
              <!-- </v-card>  -->
              <!-- </q-popup-proxy> -->
              <!-- </v-text-field> -->

            </template>

          </v-toolbar>

          <v-card style="height: 408px; overflow-y: auto" rounded="0">
            <v-list v-if="lst_socios.length > 0" rounded>
              <v-subheader>
                <v-icon c="mr-3"> mdi-account-group-outline</v-icon> Socios
              </v-subheader>
              <v-list-item class="bg-primary rounded-pill my-1" v-for="persona in lst_socios" :key="persona.cve_persona"
                @click="openConfirmCargo(persona)">
                <template v-slot:prepend>
                  <v-icon>mdi-account</v-icon>
                </template>

                <v-list-item-title>{{
                  `${persona.nombre} ${persona.apellido_paterno} ${persona.apellido_materno}`
                  }}</v-list-item-title>
              </v-list-item>
            </v-list>

            <v-list v-if="socio && lst_socios.length === 0" densexx rounded>
              <v-subheader>
                <v-icon class="mr-3"> mdi-account-tie</v-icon> Dueño
              </v-subheader>
              <v-list-item class="bg-secondary rounded-pill my-1" @click="openConfirmarPagoDueño">
                <template v-slot:prepend>
                  <v-icon> mdi-account-tie</v-icon></template>

                <v-list-item-title class="white--text">
                  {{
                    `${socio.nombre} ${socio.apellido_paterno} ${socio.apellido_materno}`
                  }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>

        </div>

      </div>

      <v-dialog v-model="dialog" max-width="350" elevation="0">
        <v-card shaped>
          <v-card-title class="headline"> Cargar Cuota? </v-card-title>
          <v-card-text class="text-center">
            Da click en la opcion
            <label class="font-weight-black"> Cargar</label>
            para continuar o en
            <label class="font-weight-black"> Cancelar</label> para finalizar
          </v-card-text>
          <v-card-actions class="d-flex justify-space-between">
            <v-btn color="white" class="bg-secondary" @click="dialog = false" width="48%">
              <v-icon> mdi-close</v-icon> Cancelar</v-btn>
            <v-btn color="white" class="bg-primary" @click="realizarCargo" width="48%">
              <v-icon> mdi-check</v-icon> Cargar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialog_parcialidades" max-width="350" elevation="0">
        <v-card shaped>          

          <v-card-title class="headline"> Pagar en parcialidades </v-card-title>
           <span class="pl-5 mb-2 ">seleccione numero de parcialidades</span>
           <v-card-text>
           <v-item-group v-model="num_parcialidad" class="d-flex flex-wrap justify-between bg-secondaryx px-5" style="column-gap: 15px;row-gap: 10px;" mandatory>
              <v-item v-slot="{ isSelected, selectedClass, toggle }" v-for="n in 9"  :value="n+1">
                <v-btn @click="toggle" :color="isSelected?'secondary':'primary'" icon size="large">
                  <v-icon size="54"> mdi-numeric-{{ n+1 }} </v-icon>
                </v-btn>
              </v-item>
            </v-item-group>
            </v-card-text>
          

          <!-- <v-card-text class="text-center">
            Da click en la opcion
            <label class="font-weight-black"> Cargar</label>
            para continuar o en
            <label class="font-weight-black"> Cancelar</label> para finalizar
          </v-card-text> -->
          <v-card-actions class="d-flex justify-space-between">
            <v-btn color="white" class="bg-secondary" @click="dialog_parcialidades = false" width="48%">
              <v-icon> mdi-close</v-icon> Cancelar</v-btn>
            <v-btn color="white" class="bg-primary" @click="realizarCargoParcialidades" width="48%">
              <v-icon> mdi-check</v-icon> Cargar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="snackbar" color="primary" timeout="2000" absolute style="left: 0px">
        <v-icon class="mr-3">mdi-check-circle</v-icon>
        <span class="text-body-1 font-weight-bold">Cargo Agregado con exito...</span>
      </v-snackbar>

    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import numeral from "numeral";
import isNull from "lodash/isNull";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import * as mathjs from "mathjs";
import { ref, computed, watch } from "vue";
import type { IAddCargo, IAddCargoParcialidad, ICuota } from "./../../../main/model/model-type";
import { QDate, QInput, QPopupProxy } from "quasar";
import PVCurrencyInput from "./../../components/PVCurrencyInput.vue";

dayjs.extend(customParseFormat);
//son para el ref de un componente de quasar 
const menux = ref(null);
const datex = ref(null);
const inputx = ref(null);

let cve_accion = 0;
const dialog = ref<boolean>(false); //abre dialog
const dialog_parcialidades = ref<boolean>(false); //abre dialog para parcialidades ---  03-07-2024
const find_cuota = ref<string>(""); //busca cuotas por concepto
const cuota = ref<ICuota[]>([]); //obtiene la cuota seleccionada
const lst_cuotas = ref<ICuota[]>([]); //lista de las cuotas
const lst_socios = ref([]); //lista de los socios aplicar cargo
const cantidad = ref<number>(1); //numero de veces que se cobrara una cuota
const periodo = ref<string>(dayjs().format("MM-YYYY")); //periodo de cargo
const socio = ref(null); //socio seleccionado de la lst_socios
const snackbar = ref<boolean>(false); //mostrar la snackbar

/**los datos de la cuota a cargar */
let concepto: string = ""; //concepto de la cuota agregada
let producto_servicio: number = 0; //se agrega nuevo es el codigo de producto de compaq
let cve_cuota: number = 0;
let opcion_iva: number = 1;
let veces_aplicar: number = 0;
const precio = ref<string>("");
const editable = ref<number>(0);
let is_inscripcion = 0

const flag_parcialidades = ref<boolean>(false)
const num_parcialidad=ref<number>(2)

const Ccuotas = computed(() => {
  if (isNull(find_cuota.value) || find_cuota.value === "")
    return lst_cuotas.value.slice(0, 99);
  else
    if(cve_accion==1830)
    return lst_cuotas.value.filter(
      (i) =>
        (i.concepto.toLowerCase().includes(find_cuota.value.toLowerCase()) ||
        i.cve_cuota.toString().includes(find_cuota.value) )
        &&  ![42,102].some(j=>j==i.cve_cuota)
    );
    else if(cve_accion==1914)
    return lst_cuotas.value.filter(
      (i) =>
        (i.concepto.toLowerCase().includes(find_cuota.value.toLowerCase()) ||
        i.cve_cuota.toString().includes(find_cuota.value) )
        &&  ![42,43].some(j=>j==i.cve_cuota)
    );
    else if(cve_accion>=1 && cve_accion<=1800)
    return lst_cuotas.value.filter(
      (i) =>
        (i.concepto.toLowerCase().includes(find_cuota.value.toLowerCase()) ||
        i.cve_cuota.toString().includes(find_cuota.value) )
        &&  ![43,102].some(j=>j==i.cve_cuota)
    );
    else
    return lst_cuotas.value.filter(
      (i) =>
        i.concepto.toLowerCase().includes(find_cuota.value.toLowerCase()) ||
        i.cve_cuota.toString().includes(find_cuota.value)         
    );
});

watch(cuota, (v) => {
  if (!!v.length) {
    cantidad.value = 1;
    lst_socios.value = [];
    socio.value = null;
    const [cuotaSelected] = v;
    const { edad_aplica, genero_aplica, parentesco, membresia } = cuotaSelected;

    cve_cuota = cuotaSelected.cve_cuota;
    concepto = cuotaSelected.concepto;
    veces_aplicar = cuotaSelected.veces_aplicar;
    editable.value = cuotaSelected.editable;
    precio.value = cuotaSelected.total.toString();
    is_inscripcion = cuotaSelected.is_inscripcion

    //03-07-2024
    //se agrega nueva es una bandera para la cuota 1031 que es activacion en parcialidades
    if (cuotaSelected.cve_cuota == 1031) flag_parcialidades.value = true
    else flag_parcialidades.value = false

    //tipo cuota 1 es socios 2 es dueno
    if (cuotaSelected.tipo_cuota == 1)
      findSocios(edad_aplica, genero_aplica, parentesco);
    else findDueno(membresia);
  } else clean();
});

window.electron.onConceptos((payload) => {
  console.log('cve_accion:->', payload)
  cve_accion = payload
  console.log("estasson las cuotas num",lst_cuotas.value.length)
  console.log("estasson las cuotas",lst_cuotas.value)
});

getCuotas();

function minus() {
  if (cantidad.value > 1) cantidad.value--;
}

function plus() {
  if (veces_aplicar === 0 || cantidad.value < veces_aplicar) cantidad.value++;
}

function getCuotas() {
  lst_cuotas.value = window.electron.getCuotas();
}

function findSocios(edad, genero, parentesco) {
  const genero_aplica = { A: [1, 2], H: [1], M: [2] };
  genero_aplica[genero];
  let parentescos_aplica = (parentesco ?? "")
    .split(",")
    .map((i) => numeral(i).value());
  lst_socios.value = window.electron.socioAplicaCuota(
    cve_accion,
    edad,
    genero_aplica[genero],
    parentescos_aplica
  );
}

function findDueno(membresias) {
  let membresias_aplica = (membresias ?? "")
    .split(",")
    .map((i) => numeral(i).value());
  socio.value = window.electron.duenoAplicaCuota(cve_accion, membresias_aplica);
}

function openConfirmCargo(p) {
  dialog.value = true;
  socio.value = p;
}

function openConfirmarPagoDueño() {
  if (flag_parcialidades.value){
    num_parcialidad.value=2
    dialog_parcialidades.value = true
  }
  else dialog.value = true
}

function realizarCargo() {
  // let numero_cuota = cuota.value.numero_cuota;
  let [{ numero_cuota }] = cuota.value;

  const day_periodo = dayjs(periodo.value, "MM-YYYY"); //es el periodo selecciondo
  const day_actual = dayjs(dayjs().format("MM-YYYY"), "MM-YYYY"); //es el periodo actual

  if (
    day_periodo.diff(day_actual, "month") > 0 &&
    [1, 2, 3, 4].includes(cve_cuota)
  ) {
    switch (cve_cuota) {
      case 1:
        cve_cuota = 1009; //que es la 416 mantenimiento para periodos adelantados
        producto_servicio = 416; //este es el producto o servicio otorgado
        numero_cuota = 416;
        break;
      case 2:
        cve_cuota = 1010; //que es la 417 para mayoria hombres peridos adelantados
        producto_servicio = 417; //este es el producto o servicio otorgado
        numero_cuota = 417;
        break;
      case 3:
        cve_cuota = 1011; //que es la 418 para dependencia econimica de periodos adelantados
        producto_servicio = 418; //este es el producto o servicio otorgado
        numero_cuota = 418;
        break;
      case 4:
        cve_cuota = 1012; //que es la 419 para mayorias mujeres de periodos a delantados
        producto_servicio = 419; //este es el producto o servicio otorgado
        numero_cuota = 419;
        break;
    }
  }

  let total, subtotal, iva;

  if (opcion_iva === 1) {
    total = numeral(precio.value).value();
    subtotal = (total / 116) * 100;
    iva = subtotal * 0.16;
  } else {
    subtotal = numeral(precio.value).value();
    iva = subtotal * 0.16;
    total = subtotal + iva;
  }

  const dataSend: IAddCargo = {
    cve_accion,
    cve_cuota,
    cve_persona: socio.value.cve_persona,
    concepto,
    total,
    subtotal: mathjs.round(subtotal, 2),
    iva: mathjs.round(iva, 2),
    cantidad: cantidad.value,
    periodo: periodo.value,
    veces_aplicar,
    is_inscripcion
  }

  let data = window.electron.createCargo(dataSend);

  dialog.value = false;

  if (data > 0) {
    // aqui el snackbar que indica wue se realizo la carga correctamente
    snackbar.value = true;
  }
}

function realizarCargoParcialidades() {
  // let numero_cuota = cuota.value.numero_cuota;
  let [{ numero_cuota }] = cuota.value;

  let total, subtotal, iva;

  if (opcion_iva === 1) {
    total = numeral(precio.value).value();
    subtotal = (total / 116) * 100;
    iva = subtotal * 0.16;
  } else {
    subtotal = numeral(precio.value).value();
    iva = subtotal * 0.16;
    total = subtotal + iva;
  }

  const dataSend: IAddCargoParcialidad = {
    cve_accion,
    cve_cuota,
    cve_persona: socio.value.cve_persona,
    concepto,
    total,
    subtotal: mathjs.round(subtotal, 2),
    iva: mathjs.round(iva, 2),
    cantidad: cantidad.value,
    periodo: periodo.value,
    veces_aplicar,
    is_inscripcion,
    parcialidad:num_parcialidad.value
  }

  let data = window.electron.createCargoParcialidades(dataSend);

  console.log("🚀 ~ file: App.vue:430 ~ realizarCargoParcialidades ~ data:", data);


  dialog_parcialidades.value = false;

  if (data.length > 0) {
    // aqui el snackbar que indica wue se realizo la carga correctamente
    snackbar.value = true;
  }
}

function clean() {
  find_cuota.value = "";
  cantidad.value = 1;
  periodo.value = dayjs().format("MM-YYYY");
  lst_socios.value = [];
  socio.value = null;
  snackbar.value = false;
  //tambien se limpia la bandera para parcialidades :  03-07-2024
  flag_parcialidades.value = false
  console.log('limpia')
}

function close() {
  cuota.value = [];//limpia y por ende el watch llamara clean
  console.log('invoca cerrar')
  window.electron.closeConceptos();
}

function checkValue(val, reason, details) {
  if (reason === "month") {
    menux.value.hide();
    inputx.value.focus();
  } else if (reason === "year") {
    datex.value.setView("Months");
  }
}
</script>

<style>
html {
  margin: 0;
  padding: 0;
  overflow-y: hidden !important;
}
</style>
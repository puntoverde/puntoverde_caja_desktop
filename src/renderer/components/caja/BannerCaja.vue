<template>
  <v-app-bar
    app
    color="secondary"
    tile
    dark
    extended
  >
    <!-- class="bg-secondary lighten-1" -->
    <v-btn icon large>
      <v-avatar size="32px" item>
        <v-img src="../../public/icon.png" alt="Sistema de Caja"></v-img>
      </v-avatar>
    </v-btn>

    <v-text-field :active="true"     
      hide-details
      prepend-inner-icon="mdi-magnify"
      placeholder="Buscar Accion"
      class="hidden-sm-and-down my-input-accion"
      style="max-width: 250px"
      v-model="numeroAccion"
      @keyup.enter="buscarAccion"
      v-maska="accionMask"
      clearable
      @click:clear="limpiar"      
    ></v-text-field>

    <v-toolbar-title class="ml-0 pl-4">
      <span class="hidden-sm-and-down">Titular:</span>
      {{ store.titular }}
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <v-btn
      icon
      @click="openEstadoCuenta"
      :disabled="store.cve_accion === 0"
      :loading="loadEstado"
    >
      <v-icon>mdi-printer</v-icon>
    </v-btn>
  

    <v-btn icon @click="openWindowConceptos" :disabled="store.cve_accion === 0">
      <v-icon>mdi-playlist-plus</v-icon>
    </v-btn>

    <template v-slot:extension>
      <div class="d-flex justify-space-between" style="width: 100%">
        <span>
          <v-btn icon :color="fEstatusColor">
            <v-icon>mdi-traffic-light</v-icon>
          </v-btn>
          Accion {{ tipo_accion }}:
          <label v-if="fEstatusColor == 'success'">(Activa)</label>
          <label v-else-if="fEstatusColor == 'warning'"
            >(Bloqueada Por Falta de Pago.)</label
          >
          <label v-else-if="fEstatusColor == 'error'">(Inactiva)</label>
        </span>
        <span v-if="cve_dueno > 0">
          <v-text-field
            variant="outlined"
            density="compact"
            class="v-input--densez"
            hide-details
            prefix="RFC:"
            append-outer-icon="mdi-content-save"
            @click:append-outer="saveRFC"
            v-model="rfc"
            v-maska="rfcMask"
            style="width:200px;"
            bg-color="white"
          ></v-text-field>
        </span>
        <span>
          <b>Cajero(a):</b>
          {{ `${cajero}` }}
        </span>
      </div>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
// import smalltalk from 'smalltalk'
import { computed, onMounted, watch, ref } from "vue";
import { useCajaStore } from "./../../store/cajastore";
import type { IAccion, ICargo } from "./../../../main/model/model-type";
import {useStorage} from 'vue3-storage'

const store = useCajaStore();
const ls=useStorage()

const props = defineProps({ cargos: { type: Array, default: () => [] } });

const numeroAccion = ref<string>("");
const tipo_accion = ref<string>("");
const cve_dueno = ref<number>(0);
const cajero = ref("");
const rfc = ref("");
const estatus_accion = ref("");

const accionMask = ref({
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
});
const rfcMask = ref({
  mask: "AAAA######FFF",
  tokens: {
    F: {
      pattern: /[0-9a-zA-Z]/,
      transform(v) {
        return v.toLocaleUpperCase();
      },
    },
    A: {
      pattern: /[a-zA-Z]/,
      transform(v) {
        return v.toLocaleUpperCase();
      },
    },
    "#": {
      pattern: /\d/,
    },
  },
});
const loadEstado = ref(false);

const fEstatusColor = computed(() => {
  const color = ["", "success", "warning", "error"];
  return color[estatus_accion.value];
});

onMounted(() => {
  cajero.value=ls.getStorageSync('user')    
});

// metodo buscara accion y los cargos de la misma
async function buscarAccion() {
  let numero_accion = numeroAccion.value;
  let clasificacion = 0;

  if (numeroAccion.value.indexOf("A") > -1) {
    numero_accion = numeroAccion.value.substr(
      0,
      numeroAccion.value.indexOf("A")
    );
    clasificacion = 1;
  } else if (numeroAccion.value.indexOf("B") > -1) {
    numero_accion = numeroAccion.value.substr(
      0,
      numeroAccion.value.indexOf("B")
    );
    clasificacion = 2;
  } else if (numeroAccion.value.indexOf("C") > -1) {
    numero_accion = numeroAccion.value.substr(
      0,
      numeroAccion.value.indexOf("C")
    );
    clasificacion = 3;
  }

  try {
    const { accion, cargos }: { accion: IAccion; cargos: ICargo[] } =
      window.electron.buscarAccion(numero_accion, clasificacion);
    console.log("accion->", accion, ", cargos->", cargos);

    if (!accion) {
      store.cve_accion = 0;
      store.titular = "";
      store.numero_accion=''
      numeroAccion.value = null;
      estatus_accion.value = '';
      tipo_accion.value = "";
      rfc.value = "";
      cve_dueno.value = 0;
      store.lst_cargos = [];
    } else {
      store.cve_accion = accion.cve_accion;
      store.titular = `${accion.nombre} ${accion.apellido_paterno} ${accion.apellido_materno}`;
      store.numero_accion = accion.accion;

      estatus_accion.value = accion.estatus;
      tipo_accion.value = accion.tipo_accion;
      rfc.value = accion.rfc;
      cve_dueno.value = accion.cve_dueno;

      store.lst_cargos = cargos;

    }
  } catch (e) {
    console.error(e);
  }
}

function saveRFC() {
  let actualizo = window.ipcRenderer.sendSync(
    "updateRFC",
    rfc.value,
    cve_dueno.value
  );
  if (actualizo.affectedRows > 0)
    window.remote.dialog.showMessageBox(window.remote.getCurrentWindow(), {
      type: "info",
      title: "Info",
      message: "RFC Actualizado",
    });
}

function openWindowConceptos() {
  // window.ipcRenderer.send("openWindowConceptos", store.cve_accion);
  window.electron.openWindowConceptos(store.cve_accion)
}

function openEstadoCuenta() {
  // loadEstado.value = true;
  window.electron.openEstadoCuenta(store.cve_accion)
}



function limpiar() {
  console.log("se limpia por el clearable");
  numeroAccion.value =''
  tipo_accion.value = ''
  cve_dueno.value = 0
  cajero.value =''
  rfc.value =''
  estatus_accion.value =''
  store.cve_accion=0
  store.numero_accion=''
  store.titular=''
  store.lst_cargos=[]
}
</script>

<style>
.my-input-accion input{
  /* background-color: red!important; */
  font-size: 25px;
  padding: 0 5px;
  font-weight: bold;
  letter-spacing: 3px;
}
</style>
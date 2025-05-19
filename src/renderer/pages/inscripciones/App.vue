<template>
  <v-app style="border:2px solid #14bf98;height:100vh">

      <v-system-bar color="primary">
      <v-icon icon="mdi-account-details-outline" start></v-icon>
      alta datos
      <v-spacer></v-spacer>
    </v-system-bar>

    <v-main style="overflow-y:auto;height:100vh">
      <span class="pl-3 text-h5 text-primary">Registro de datos</span>
      <!-- <v-toolbar color="white" app max-height="60px">
      <v-toolbar-title class="text-primary">Registro Inscripcion</v-toolbar-title>
    </v-toolbar> -->

    <v-container fluid class="grey lighten-5">
      <v-text-field
        v-model="nombre"
        label="Nombre"
        :hide-details="!error.nombre"
        :error-messages="error.nombre"
        class="my_mayus mb-5"
      ></v-text-field>
      <v-text-field
        v-model="paterno"
        label="Apellido Paterno"
        :hide-details="!error.paterno"
        :error-messages="error.paterno"
        class="my_mayus mb-5"
      ></v-text-field>
      <v-text-field
        v-model="materno"
        label="Apellido Materno"
        :hide-details="!error.materno"
        :error-messages="error.materno"
        class="my_mayus mb-5"
      ></v-text-field>
      <v-text-field
        v-model="telefono"
        label="Telefono"
        :hide-details="!error.telefono"
        :error-messages="error.telefono"
        class="my_mayus mb-5"
      ></v-text-field>
      <v-text-field
        v-model="correo"
        label="Correo"
        :hide-details="!error.correo"
        :error-messages="error.correo"
        class="my_mayus mb-5"
      ></v-text-field>

      <v-radio-group v-model="genero" inline>
        <v-radio label="HOMBRE" :value="1"></v-radio>
        <v-radio label="MUJER" :value="0"></v-radio>
      </v-radio-group>

      <v-text-field
        v-model="edad"
        label="Edad"
        :hide-details="!error.edad"
        :error-messages="error.edad"
        suffix="años"
        class="mb-3"
      ></v-text-field>
      <v-btn color="primary" block @click="registrarInscripcion">
        Guardar
      </v-btn>
    </v-container>

     <v-snackbar v-model="snackbar_error" color="error" bottom>
      <v-icon>md-error</v-icon>
      Revisar la informacion falta cargo o concepto
    </v-snackbar>

    </v-main>
  </v-app>
</template>


<script setup lang="ts">
import { ref,reactive,watch } from "vue";
import { object, number, string } from "yup";
import { IInscripcion } from "../../../main/model/model-type";

let schema = object().shape({
  idCargo: number().required('El ${path} es requerido').label('Cargo'),
  nombre: string().required('El ${path} es requerido').label('Nombre'),
  paterno: string().required('El ${path} es requerido').label('Apellido Paterno'),
  materno: string().required('El ${path} es requerido').label('Apellido Materno'),
  genero: string().required('El ${path} es requerido').label('Genero'),
  edad: number().required('El ${path} es requerido').label('Edad'),
  concepto: string().required('El ${path} es requerido').label('Concepto'),
  telefono: string().required('El ${path} es requerido').label('Telefono'),
  // correo: string().email('El ${path} no es valido').optional().label('Correo'),
  correo: string().optional().label('Correo'),
});

const error=reactive({
  idCargo:'',
  nombre:'',
  paterno:'',
  materno:'',
  genero:'',
  edad:'',
  concepto:'',
  telefono:'',
  correo:''
})

const idCargo = ref<number>();
const nombre = ref<string>();
const paterno = ref<string>();
const materno = ref<string>();
const genero = ref<number>();
const edad = ref<number>();
const concepto = ref<string>();
const telefono = ref<string>();
const correo = ref<string>();

const snackbar_error=ref<boolean>(false)

watch(error,(v)=>{
    if(v.idCargo!='' || v.concepto!='')snackbar_error.value=true
    
})

window.electron.onInscripcionData((payload: IInscripcion) => {
  idCargo.value = payload.idCargo;
  nombre.value = payload.nombre;
  paterno.value = payload.paterno;
  materno.value = payload.materno;
  genero.value = payload.genero;
  edad.value = payload.genero;
  concepto.value = payload.concepto;
  telefono.value = payload.telefono;
  correo.value = payload.correo;
});

async function registrarInscripcion() {
 
  error.nombre = error.paterno= error.materno= error.genero= error.edad= error.telefono= error.correo=''
  
  const dataSent: IInscripcion = {
    idCargo:idCargo.value,
    nombre: nombre.value,
    paterno: paterno.value,
    materno: materno.value,
    genero: genero.value,
    edad: edad.value,
    concepto: concepto.value,
    telefono: telefono.value,
    correo: correo.value,
  };
   
   try{
  const validData= await schema.validate(dataSent,{abortEarly:false})
  console.log("🚀 ~ file: App.vue:125 ~ registrarInscripcion ~ validData", validData)
  

  const cve_incripcion=window.electron.saveInscripcion(dataSent);
  window.electron.closeInscripcion()
   }
   catch(e)
   {
    if(e.name=='ValidationError')
    {      
      e.inner.forEach(i => error[i.path]=i.message)
    }
   }

}
</script>

<style >

html,body{
  overflow-y: hidden!important;;
}

.my_mayus input {
  text-transform: uppercase;
}
</style>
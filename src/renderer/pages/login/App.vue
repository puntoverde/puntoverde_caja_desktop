<template>
  <v-app style="background:transparent">
    <v-main id="main">
      
      <div class="wrapper"> 
        <div class="header-grid d-flex justify-end pr-4x">
           <v-btn color="primary" variant="text" icon class="align-self-end" @click="onClose">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="slide-grid primaryx px-3 d-flex justify-center align-center">
               <v-img src="./../../assets/punto_verde.png"></v-img>
          </div>
        <div class="d-flex justify-center align-center">
          
          
        <v-form @submit.prevent="initSession">
        <div class="d-flex flex-column pb-5 pt-3 justify-center align-center">                  
          
            <v-text-field
              darkx
              label="Usuario"
              v-model="usuario"
              style="width:300px"
              prepend-inner-icon="mdi-shield-account"
              filled
              color="secondary"
            ></v-text-field>
         
            <v-text-field
              darkx
              filled
              label="Contraseña"
              v-model="password"
              style="width:300px"
             
              :type="show1 ? 'text' : 'password'"
              prepend-inner-icon="mdi-shield-lock"
              :append-inner-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="show1 = !show1"
              color="secondary"
            ></v-text-field>
          <v-btn type="summit" style="width:300px" color="secondary" :loading="load">
            <v-icon class="mr-2">mdi-arrow-right-bold-circle</v-icon>Ingersar
          </v-btn>
        </div>
        </v-form>
      

        </div>
        <div class="footer-grid accentx text-center" style="font-size:12px">punto@verde</div>
      </div>
      
    </v-main>
  </v-app>

  
</template>

<script setup lang="ts">
import {ref} from 'vue'

const show1=ref(false)
const usuario=ref('')
const password=ref('')
const load=ref(false)

window.electron.clearLogin(payload=>{
  usuario.value=''
  password.value=''
  load.value=false
})

function onClose() {
  console.log(window.electron.closeLogin())
  }

function initSession(){      
      load.value=true;    
      window.electron.initSession(usuario.value,password.value)     
      }
</script>

<style>

html{
  overflow-y: hidden!important;
}

.wrapper {
  display: grid;
  height: 100%;
  grid-template-columns: 200px auto;
  grid-template-rows: 36px auto 20px;
}

.wrapper .header-grid
{  
  grid-column-start: 2;
}

.wrapper .slide-grid
{
  background: rgb(20,191,152);
  background: radial-gradient(circle, rgba(20,191,152,1) 0%, rgba(17,52,72,0.8967786943879115) 90%); 
  grid-row-start: 1;
  grid-row-end: 4;
}

.wrapper .footer-grid
{
  grid-column-start:  2;
}

#main{
  border:1px solid rgb(17,52,72);
  box-sizing: border-box;
  background:white;
  border-radius:0px
}

</style>
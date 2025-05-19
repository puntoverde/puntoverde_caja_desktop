import {defineStore} from 'pinia'
import {ref} from 'vue'
import type {ICargo} from './../../main/model/model-type'
export const useCajaStore = defineStore('caja', () => {
    const cve_accion = ref(0)
    const numero_accion = ref('')
    const titular=ref('')

    const lst_cargos=ref<ICargo[]>()
    
  
    return { cve_accion,numero_accion,titular,lst_cargos}
  })
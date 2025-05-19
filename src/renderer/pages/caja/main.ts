import { createApp } from 'vue'
import {createPinia} from 'pinia'
import { Quasar,BottomSheet } from 'quasar'
import quasarLang from 'quasar/lang/es'
import {maska} from 'maska'
import App from './App.vue'
import vuetify from '../../plugins/vuetify'
import { loadFonts } from '../../plugins/webfontloader'
import Vue3Storage,{StorageType} from 'vue3-storage'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

loadFonts()

const app = createApp(App);
app.use(vuetify)
app.use(createPinia())
app.use(Quasar, {
    plugins: {BottomSheet}, // import Quasar plugins and add here
    lang: quasarLang,
  })
app.use(Vue3Storage, { namespace: "ls_", storage: StorageType.Local })
app.directive('maska',maska)
app.mount('#app');

import { createApp } from 'vue'
import {maska} from 'maska'
import App from './App.vue'
import vuetify from '../../plugins/vuetify'
import { Quasar } from 'quasar'
import quasarLang from 'quasar/lang/es'
import { loadFonts } from '../../plugins/webfontloader'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

loadFonts()

const app = createApp(App);
app.use(vuetify)
app.use(Quasar, {
    plugins: {}, // import Quasar plugins and add here
    lang: quasarLang,
  })
app.directive('maska',maska)
app.mount('#app');

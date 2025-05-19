import { createApp } from 'vue'
import {maska} from 'maska'
import App from './App.vue'
import vuetify from '../../plugins/vuetify'
import { loadFonts } from '../../plugins/webfontloader'


loadFonts()

const app = createApp(App);
app.use(vuetify)
app.directive('maska',maska)
app.mount('#app');

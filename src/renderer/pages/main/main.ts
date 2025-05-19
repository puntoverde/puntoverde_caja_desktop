import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './../../plugins/vuetify'
import { loadFonts } from './../../plugins/webfontloader'
import Vue3Storage,{StorageType} from 'vue3-storage'

loadFonts()

const app = createApp(App);
app.use(vuetify)
.use(Vue3Storage, { namespace: "ls_", storage: StorageType.Local })
app.mount('#app');

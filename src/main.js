import { createApp, ref } from 'vue'
import App from './App.vue'
import router from './router'
// import Vuelidate from 'vuelidade'
// import { default as Vuelidate } from '@vuelidate/core';

import 'bootstrap/dist/css/bootstrap.css'

// Vue.use(Vuelidate)

createApp(App).use(router).mount('#app')

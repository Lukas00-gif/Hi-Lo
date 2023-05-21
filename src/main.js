// original sem alteraçoes
import { createApp } from 'vue'
import { initializeApp } from 'firebase/app'

import Toast from 'vue-toastification'
import App from './App.vue'
import router from './router'
import store from './store/user'
import firebaseConfig from './firebaseConfig'

import 'bootstrap/dist/css/bootstrap.css'
import 'vue-toastification/dist/index.css'


const firebaseApp  = initializeApp(firebaseConfig);

createApp(App).use(router).use(store).use(Toast, 
    {transition: "Vue-Toastification__slideBlurred",
    maxToasts: 15,
    newestOnTop: true}).mount('#app')


export { firebaseApp }



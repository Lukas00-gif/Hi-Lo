import { createApp } from 'vue'
import { initializeApp } from 'firebase/app'
import App from './App.vue'
import router from './router'

import store from './store/user'
import firebaseConfig from './firebaseConfig'

import 'bootstrap/dist/css/bootstrap.css'

const firebaseApp  = initializeApp(firebaseConfig);

createApp(App).use(router).use(store).mount('#app')

export { firebaseApp }

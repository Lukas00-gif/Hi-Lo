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

// funçao de limpar o currentUserEmail quando ele for fechado pelo X do navegador
// const clearCurrentUser = () => {
//     localStorage.removeItem('currentUserEmail');
// }

// o evento beforeunload limpa o currentUserEmail
// window.addEventListener('beforeunload', clearCurrentUser)


const firebaseApp  = initializeApp(firebaseConfig);

createApp(App).use(router).use(store).use(Toast, 
    {transition: "Vue-Toastification__slideBlurred",
    maxToasts: 15,
    newestOnTop: true}).mount('#app')


export { firebaseApp }



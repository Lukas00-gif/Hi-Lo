import { createApp } from 'vue'
import { initializeApp } from 'firebase/app'

import Toast from 'vue-toastification'
import App from './App.vue'
import router from './router'
import store from './state/store';
import firebaseConfig from './firebaseConfig'

import 'bootstrap/dist/css/bootstrap.css'
import 'vue-toastification/dist/index.css'

const currentUserEmail = localStorage.getItem('currentUserEmail');
if (currentUserEmail) {
    store.commit('setCurrentUserEmail', currentUserEmail);
}

const firebaseApp  = initializeApp(firebaseConfig);

// createApp(App).use(router).use(store).use(Toast).mount('#app')
const app = createApp(App)
app.use(router)
app.use(store)
app.use(Toast)
app.mount('#app')


export { firebaseApp }



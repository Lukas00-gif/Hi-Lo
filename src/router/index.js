import { createRouter, createWebHistory } from 'vue-router';
import { useToast } from 'vue-toastification';
import store from '../state/store';


import Login from '../views/LoginView.vue';
import Cadastro from '../views/CadastroView.vue';
import HomeAluno from '../views/HomeAluno.vue';
import HomeProfessor from '../views/HomeProfessor.vue';
import Perfil from '../views/Perfil.vue';
import EntrarSala from '../components/EntrarSala.vue';

const toast = useToast();

const authGuard = (to, from, next) => {
  const currentUserEmail = store.getters.currentUserEmail
  if (currentUserEmail) {
    // Usuário autenticado, permite o acesso à rota
    next();
  } else { 
    // Usuário não autenticado, redireciona para a página de login
    next('/');
    toast.info('FAÇA LOGIN PRIMEIRO...!!', {
      position: "top-right",
      timeout: 2000,
    })
  }
}

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: Cadastro
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: Perfil,
    beforeEnter: authGuard,
  },
  {
    path: '/home-aluno',
    name: 'homeAluno',
    component: HomeAluno,
    beforeEnter: authGuard,
  },
  {
    path: '/home-professor',
    name: 'homeProfessror',
    component: HomeProfessor,
    beforeEnter: authGuard,
  },
  {
    path: '/entrar-sala/:codigoSala',
    name: 'EntrarSala',
    component: EntrarSala,
    beforeEnter: authGuard,
  },
  {
    // caso nao seja uma url valida, ele volta para a do login
    path: '/:pathMatch(.*)*',
    redirect: { name: 'login' },
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
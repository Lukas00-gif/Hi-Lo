import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/LoginView.vue'
import Cadastro from '../views/CadastroView.vue'
import HomeAluno from '../views/HomeAluno.vue'
import HomeProfessor from '../views/HomeProfessor.vue'
import EsqueciSenha from '../components/EsquecerSenha.vue'

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
    path: '/esqueciSenha',
    name: 'EsqueciSenha',
    component: EsqueciSenha
  },
  {
    path: '/home-aluno',
    name: 'homeAluno',
    component: HomeAluno
  },
  {
    path: '/home-professor',
    name: 'homeProfessror',
    component: HomeProfessor
  },

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

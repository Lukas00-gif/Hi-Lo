import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUserEmail } from '../services/authServices'


import Login from '../views/LoginView.vue'
import Cadastro from '../views/CadastroView.vue'
import HomeAluno from '../views/HomeAluno.vue'
import HomeProfessor from '../views/HomeProfessor.vue'
import EsqueciSenha from '../components/EsquecerSenha.vue'


const authGuard = (to, from, next) => {
  const currentUserEmail = getCurrentUserEmail();
  if (currentUserEmail) {
    // usuário autenticado, permite o acesso à rota
    next();
  } else {
    // usuário não autenticado, redireciona para a página de login
    next('/');
    alert('nao deu certo boy faça o login')
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
    path: '/esqueciSenha',
    name: 'EsqueciSenha',
    component: EsqueciSenha
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
]


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})




export default router

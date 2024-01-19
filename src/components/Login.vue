<template>
  <div class="container login-container">
    <div class="row">
      <div class="col-md-6 login-form-1">
        <h3>Code Class</h3>
        <form @submit.prevent="enviar">
          <div class="form-group">

            <label class="labels" for="login">Email:</label>
            <input type="text" class="form-control mb-3" id="username" placeholder="Digite o Seu Email"
              v-model.trim="v$.mail.$model" :class="{ error0: v$.mail.$error }" name="email" />
          </div>

          <div class="form-group">
            <label class="labels" for="password">Senha:</label>
            <input type="password" class="form-control" id="password" placeholder="Digite a Sua Senha"
              v-model.trim="v$.password.$model" :class="{ error0: v$.password.$error }" name="password" />
          </div>

          <div v-if="LoginError" class="error-message">Login ou Senha Incorretos</div>

          <div class="form-group">
            <button class="btnSubmit">Login</button>

            <router-link to="/cadastro">
              <input type="submit" class="btnCadastro" value="Cadastro" />
            </router-link>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script>
import useValidate from '@vuelidate/core'
import router from '@/router';

import { required, email, minLength } from '@vuelidate/validators'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from 'vue-toastification';
import { getFirestore } from 'firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import store from '../state/store';


const toast = useToast();

export default {
  name: 'Home',

  
  data() {
    return {
      v$: useValidate(),
      mail: '',
      password: '',
      LoginError: false
    }
  },

  validations() {
    return {
      mail: {
        required,
        email
      },
      password: {
        required,
        min: minLength(6)
      },
    }
  },

  created() {
    const savedUserEmail = localStorage.getItem('currentUserEmail');
    if(savedUserEmail) {
      store.commit('setCurrentUserEmail', savedUserEmail);
    }
  },

  computed: {
    // e o tipo de usuario
    // pega e divido o email em duas partes separando com o @
    // e pegando o primeiro indice, e dps a funçao includes verifica se tem 
    // a palavra professor se tiver ele retorna professor se n retorna aluno
    userType() {
      const domain = this.mail.split('@')[1];
      return domain.includes('professor') ? 'professor' : 'aluno';
    }
  },

  methods: {
    async enviar() {
      // testegrande@gmail.com  123456
      // antonio@professor.com 123456
      // roberto12@gmail.com 123456

      if (!this.v$.$invalid) {

        const auth = getAuth();
        const { mail, password } = this;

        try {
          const userCredential = await signInWithEmailAndPassword(auth, mail, password);
          const user = userCredential.user;

          store.commit('setCurrentUserEmail', user.email);

          localStorage.setItem('currentUserEmail', user.email);

          // Consulta para encontrar o usuário no Firestore com base no email
          const db = getFirestore();
          const usersCollection = collection(db, 'users');
          const q = query(usersCollection, where('email', '==', mail));
          const querySnapshot = await getDocs(q);
          // store.dispatch('login', {email: user.email, password: user.password});

          // Verifica se o documento do usuário existe e tem a senha correspondente
          const userDoc = querySnapshot.docs[0];

          if (userDoc && userDoc.data().pass === password) {
            // Redireciona o usuário para a página de perfil
            if (this.userType === 'aluno') {
              toast.info('Bem-vindo Aluno!', {
                position: "bottom-right",
                timeout: 3000,
              });
              router.push('/home-aluno');
            } else {
              toast.info('Bem-vindo Professor!', {
                position: "bottom-right",
                timeout: 3000,
              });
              router.push('/home-professor');
            }
          } else {
            toast.error('Erro ao realizar o login');
            this.LoginError = true;
          }

        } catch (error) {
          console.log(error);
          toast.error('Email ou senha inválidos');
          this.LoginError = true;
        }
      } else {
        this.v$.$touch();
        toast.error('Campos inválidos!!!');
        this.LoginError = true;
      }
    },
  }


}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login-container {
  margin-top: 5%;
  margin-bottom: 5%;
  margin-left: 28%;
}

.error-message {
  color: red;
  font-size: 10px;
  /* margin-bottom: 10px; */
}

.login-form-1 {
  padding: 5%;
  margin-top: 5%;
  box-shadow: 0 5px 8px 0 rgba(0, 0, 0, 0.2), 0 9px 26px 0 rgba(0, 0, 0, 0.19);
  border-radius: 5px;
}

.login-form-1 h3 {
  text-align: center;
  color: #333;
}

.login-container form {
  padding: 9%;
}

.btnSubmit,
.btnCadastro {
  width: 45%;
  border-radius: 1rem;
  padding: 1.8%;
  margin-top: 25px;
  border: none;
  cursor: pointer;
  transition: .5s;
  font-weight: 600;
  color: #fff;
  background-color: #0062cc;
  display: inline-block;
}

.btnSubmit:hover,
.btnCadastro:hover {
  background-color: #0b3f77;
}

.btnCadastro {
  margin-left: 10%;
}

.login-form-1 {
  font-weight: 600;
  color: #fff;
  background-color: #fcfcfc;
  text-decoration: none;
}

.ForgetPwd {
  color: #0062cc;
  font-size: 12px;
  margin-left: 57%;
  text-decoration: none;
}

.error0 {
  border: 2px solid red;
}

.labels {
  color: rgb(51, 50, 50);
  font-size: 13px;
  margin-left: -85%;
}
</style>

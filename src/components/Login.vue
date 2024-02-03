<template>
  <div class="container login-container">
    <div class="row">
      <div class="col-md-6 login-form-1">

        <h3>CODE CLASS</h3>
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
            <button class="btnSubmit">
              <i class="fa-solid fa-arrow-right-to-bracket login-icon"></i>
              Login
            </button>

            <router-link to="/cadastro">
              <button class="btnCadastro">
                <i class="fa-solid fa-user-plus cadastro-icon"></i>
                Cadastro
              </button>
            </router-link>

          </div>
        </form>
      </div>

      <div class="col-md-6">
        <img src="../img/img1.png" alt="Descrição da imagem" class="login-image">
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
    if (savedUserEmail) {
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

<style scoped>
.login-image {
  width: 90%;
  height: auto;
  margin-top: 5%;
}

.error-message {
  color: red;
  font-size: 10px;
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

.login-icon {
  margin-right: 6px;
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

.cadastro-icon {
  margin-right: 4px;
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
  color: #ffffff;
  background-color: #fcfcfc;
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

/* largura de ate 768 px --  OK */
@media (max-width: 768px) {
  .login-image {
    width: 90%;
    margin-top: 5%;
  }

  .login-form-1 {
    padding: 5%;
    margin-top: 5%;
  }

  .labels {
    margin-left: 0;
  }
}

/* Largura entre 769px e 900px -- OK  */
@media (min-width: 769px) and (max-width: 900px) {
  .login-image {
    width: 100%;
    height: 97%;
  }

  .login-form-1 {
    margin-top: 2%;
  }

  .labels {
    margin-left: -80%;
  }

  .btnCadastro, .btnSubmit{
    /* margin-left: 10%; */
    font-size: 14px;
  }
}

/* Largura entre 901px e 1200  -- ok */
@media (min-width: 901px) and (max-width: 998px) {
.login-container{
  display: flex;
  justify-content: space-between;
}
  .login-form-1 {
    width: 50%;
    margin-left: 0;

}

  .login-image {
    width: 110%; 
    height: auto;
  }

  .login-form-1 {
    margin-top: 2%;
  }

  .labels {
    margin-left: -80%;
  }

  .btnCadastro, .btnSubmit{
    font-size: 14px;
    padding: 6px;
    margin-top: 13%;
  }
}

@media (min-width: 999px) and (max-width: 1200px) {
  .login-container{
  display: flex;
  justify-content: space-between;
}
  .login-form-1 {
    width: 50%;
    margin-left: 0;
}

  .login-image {
    width: 100%; 
    height: auto;
  }

  .login-form-1 {
    margin-top: 2%;
  }

  .labels {
    margin-left: -80%;
  }

  .btnCadastro, .btnSubmit{
    font-size: 14px;
    padding: 10px;
    margin-top: 20%;
  }
}

/* Largura acima de 1200px -- OK  */
@media (min-width: 1201px) {
  .login-container{
  display: flex;
  justify-content: space-between;
}
  .login-form-1 {
    width: 40%;
    height: 92%;
    margin-left: 10%;

}

  .login-image {
    width: 80%; 
    height: auto;
  }

  .login-form-1 {
    margin-top: 2%;
  }

  .labels {
    margin-left: -80%;
  }

  .btnCadastro, .btnSubmit{
    font-size: 14px;
    padding: 10px;
    margin-top: 20%;
  }
}

</style>

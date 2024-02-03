<template>
  <div class="container register-container">
    <div class="row">
      <div class="col-md-6 mx-auto register-form-1">
        <h3>Code Class - Cadastro</h3>
        <form @submit.prevent="cadastrar">
          <div class="form-group">


            <label class="labelNome" for="fist">Primeiro Nome:</label>
            <input type="text" class="form-control mb-3" placeholder="Digite seu Primeiro Nome" v-model.trim="fistName"
              :class="{ error0: v$.fistName.$error }" />
            <div v-if="v$.fistName.$error" class="error-message">O Primeiro Nome deve ser Preenchido e ter no Mínimo 4
              Letras</div>

            <label class="labelLast" for="last">Último Nome:</label>
            <input type="text" class="form-control mb-3" placeholder="Digite seu Último Nome" v-model="lastName"
              :class="{ error0: v$.lastName.$error }" />
            <div v-if="v$.lastName.$error" class="error-message">O Último Nome deve ser Preenchido e ter no Mínimo 4
              Letras</div>



            <label class="labelEmail" for="Email">E-mail:</label>
            <input type="text" class="form-control mb-3" placeholder="Digite o Seu E-mail" v-model="mail"
              :class="{ error0: v$.mail.$error }" />
            <div v-if="v$.mail.$error" class="error-message">O E-mail deve ser Preenchido e ser um E-mail válido</div>



            <label class="labelPassword" for="password">Senha:</label>
            <input type="password" class="form-control mb-3" placeholder="Digite a Sua Senha" v-model="pass"
              :class="{ error0: v$.pass.$error }" />
            <div v-if="v$.pass.$error" class="error-message">A Senha deve ser Preenchida e ter no Mínimo 6 Caracteres
            </div>

            <label class="labelConfirm" for="confirm">Confirme a sua Senha:</label>
            <input type="password" class="form-control" placeholder="Confirme a sua Senha" v-model="confirmPass"
              :class="{ error0: v$.confirmPass.$error }" />
            <div v-if="v$.confirmPass.$error" class="error-message">A Confirmação da Senha deve ser Preenchida e as Senhas
              devem Coincidir</div>

          </div>

          <div class="form-group">
            <router-link :to="{ name: 'login' }" class="LoginTag">Já tem Conta? Clique Aqui</router-link>
          </div>

          <div class="form-group">
            <button class="btnCadastro">
              <i class="fa-solid fa-user-plus cadastro-icon"></i> Cadastrar Usuário
            </button>
          </div>


        </form>
      </div>
    </div>
  </div>
</template>


<script>
import useVuelidate from '@vuelidate/core';
import router from '@/router';

import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { required, email, minLength, sameAs } from '@vuelidate/validators';
import { useToast } from 'vue-toastification';

const toast = useToast()

export default {
  name: 'Home',

  data() {
    return {
      v$: useVuelidate(),
      fistName: '',
      lastName: '',
      mail: '',
      pass: '',
      confirmPass: ''
    }
  },

  validations() {
    return {
      fistName: {
        required,
        min: minLength(4)
      },

      lastName: {
        required,
        min: minLength(4)
      },

      mail: {
        required,
        email,
      },

      pass: {
        required,
        min: minLength(6),
      },

      confirmPass: {
        required,
        sameAs: sameAs(this.pass)
      }
    }
  },

  methods: {
    async cadastrar() {
      if (!this.v$.$invalid) {
        try {
          const user = {
            fistName: this.fistName,
            lastName: this.lastName,
            mail: this.mail,
            pass: this.pass
          };

          const auth = getAuth();
          const { user: authUser } = await createUserWithEmailAndPassword(auth, user.mail, user.pass);
          const db = getFirestore();
          const usersCollection = collection(db, 'users');
          const userDocRef = doc(usersCollection, authUser.uid);
          await setDoc(userDocRef, {
            fistName: user.fistName,
            lastName: user.lastName,
            email: user.mail,
            pass: user.pass,
            uid: authUser.uid
          });

          toast.success('Cadastro Realizado com Sucesso!', {
            position: 'top-right',
            timeout: 3000,
          });

          router.push('/');


        } catch (error) {
          console.log(error);
          toast.error('erro ao realizar o cadastro')
        }
      } else {
        this.v$.$touch();
        toast.error('Campos Invalidos');
      }
    }
  },


}

</script>

<style scoped>
.error0 {
  border: 2px solid red;
}

.error-message {
  color: red;
  font-size: 10px;
  /* margin-bottom: 10px; */
}

.register-container {
  margin-bottom: 5%;
}

.register-form-1 {
  padding: 5%;
  margin-top: 5%;
  box-shadow: 0 5px 8px 0 rgba(0, 0, 0, 0.2), 0 9px 26px 0 rgba(0, 0, 0, 0.19);
  border-radius: 5px;
  margin: 5% auto;
}

.register-form-1 h3 {
  text-align: center;
  color: #333;
}

.register-container form {
  padding: 9%;
}


.btnCadastro {
  width: 55%;
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

.btnCadastro:hover {
  background-color: #0b3f77;
}


.register-form-1 {
  font-weight: 600;
  color: #fff;
  background-color: #fcfcfc;
  text-decoration: none;
}

.LoginTag {
  display: block;
  color: #0062cc;
  font-size: 12px;
  margin-left: 55%;
  text-decoration: none;
}

.labelNome {
  color: #333232;
  font-size: 13px;
  margin-left: -70%;
}

.labelLast {
  color: #333232;
  font-size: 13px;
  margin-left: -75%;
}

.labelEmail {
  color: #333232;
  font-size: 13px;
  margin-left: -88%;
}

.labelPassword {
  color: #333232;
  font-size: 13px;
  margin-left: -85%;
}

.labelConfirm {
  color: #333232;
  font-size: 13px;
  margin-left: -59%;
}
.cadastro-icon {
  margin-right: 4px;
}
</style>

<template>
  <div class="container register-container">
    <div class="row">
      <div class="col-md-6 register-form-1">
        <h3>Codinome Hi-lo - Cadastro</h3>
        <form @submit.prevent="cadastrar">

          <!-- primeiro nome e segundo nome -->

          <div class="form-group">
            <label class="labelNome" for="fist">Primeiro Nome:</label>
            <input type="text" class="form-control mb-3" placeholder="Digite seu Primeiro Nome" v-model.trim="fistName"
              :class="{ error0: v$.fistName.$error }" />
            <div v-if="v$.fistName.$error" class="error-message">O Primeiro Nome deve ser Preenchido</div>
            <div v-if="v$.fistName.$error" class="error-message">O Primeiro Nome deve ter no Mínimo 4 Letras</div>

            <label class="labelLast" for="last">Último Nome:</label>
            <input type="text" class="form-control mb-3" placeholder="Digite seu Último Nome" v-model="lastName"
              :class="{ error0: v$.lastName.$error }" />
            <div v-if="v$.lastName.$error" class="error-message">O Segundo Nome Ser Preenchido</div>
            <div v-if="v$.lastName.$error" class="error-message">O Segundo Nome deve ter no Mínimo 4 Letras</div>
          </div>

          <!-- email -->

          <div class="form-group">
            <label class="labelEmail" for="Email">E-mail:</label>
            <input type="text" class="form-control mb-3" placeholder="Digite o Seu E-mail" v-model="mail"
              :class="{ error0: v$.mail.$error }" />
            <div v-if="v$.mail.$error" class="error-message">O E-mail deve ser Preenchido</div>
            <div v-if="v$.mail.$error" class="error-message">E-mail Invalido</div>
          </div>

          <!-- senha e confirmar senha -->

          <div class="form-group">
            <label class="labelPassword" for="password">Senha:</label>

            <input type="password" class="form-control mb-3" placeholder="Digite a Sua Senha" v-model="pass"
              :class="{ error0: v$.pass.$error }" />
            <div v-if="v$.pass.$error" class="error-message">A Senha deve ser Preenchida</div>
            <div v-if="v$.pass.$error" class="error-message">A Senha deve ter no Mínimo 6 Caracteres</div>

            <label class="labelConfirm" for="confirm">Confirme a sua Senha:</label>
            <input type="password" class="form-control" placeholder="Confirme a sua Senha" v-model="confirmPass"
              :class="{ error0: v$.confirmPass.$error }" />
            <div v-if="v$.confirmPass.$error" class="error-message">A Confirmação da Senha deve ser Preenchida</div>
            <div v-if="v$.confirmPass.$error" class="error-message">As Senhas não Coincidem</div>
          </div>

          <div class="form-group">
            <router-link :to="{ name: 'login' }" class="LoginTag">Já tem Conta? Clique Aqui</router-link>
          </div>

          <div class="form-group">
            <input type="submit" class="btnCadastro" value="Cadastrar" />
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
import { required, email, minLength, sameAs } from '@vuelidate/validators';
import { useToast } from 'vue-toastification'

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

  // ver sobre o formulario nao esta dando certo
  // tem q verificar e dps enviar o formulario
  methods: {
    cadastrar() {
      // console.log(this.v$.$invalid) 
      if (!this.v$.$invalid) {
        createUserWithEmailAndPassword(getAuth(), this.mail, this.pass)
          .then((data) => {
            // alert('REGISTRADO COM SUCESSO')
            toast.success("Cadastro Realizado com Sucesso!", {
              position: "top-right",
              timeout: 5000,
              closeOnClick: true,
              pauseOnFocusLoss: true,
              pauseOnHover: true,
              draggable: true,
              draggablePercent: 0.85,
              showCloseButtonOnHover: false,
              hideProgressBar: true,
              closeButton: false,
              icon: true,
              rtl: false
            });
            //
            const user = {
              fistName: this.fistName,
              lastName: this.lastName,
              mail: this.mail,
              pass: this.pass
            }

            // Recupera os usuários já armazenados no localStorage
            let users = JSON.parse(localStorage.getItem('users')) || [];

            // Adiciona o novo usuário ao final do array
            users.push(user);

            // Armazena o array atualizado no localStorage
            localStorage.setItem('users', JSON.stringify(users));

            this.$store.commit('setUser', user);
            router.push('/');
          })
          .catch((error) => {
            console.log(error.code)
            alert(error.message)
          })
      } else {
        this.v$.$touch()
        // alert('NAO DEU CERTO BOY')
        toast.warning("Preencha Todos os Campos!!!", {
          position: "top-right",
          timeout: 5000,
          closeOnClick: true,
          pauseOnFocusLoss: true,
          pauseOnHover: true,
          draggable: true,
          draggablePercent: 0.85,
          showCloseButtonOnHover: false,
          hideProgressBar: true,
          closeButton: false,
          icon: true,
          rtl: false
        });
      }
    },
  },

  created() {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      this.$store.dispatch('setUser', user)
    }
  }

}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
  margin-top: 5%;
  margin-bottom: 5%;
  margin-left: 28%;
}

.register-form-1 {
  padding: 5%;
  margin-top: 5%;
  box-shadow: 0 5px 8px 0 rgba(0, 0, 0, 0.2), 0 9px 26px 0 rgba(0, 0, 0, 0.19);
  border-radius: 5px;
}

.register-form-1 h3 {
  text-align: center;
  color: #333;
}

.register-container form {
  padding: 9%;
}


.btnCadastro {
  width: 50%;
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
</style>

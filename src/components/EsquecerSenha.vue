<template>
    <div class="container login-container">
        <div class="row">
            <div class="col-md-6 login-form-1">
                <h3>Codinome Hi-lo - alterar a senha</h3>
                <form @submit.prevent="enviar">
                    <div class="form-group">
                        <label class="labels" for="login">Email:</label>
                        <input type="text" 
                            class="form-control" 
                            id="username" 
                            placeholder="Digite o Seu Email"
                            v-model.trim="v$.mail.$model" 
                            :class="{ error0: v$.mail.$error }" 
                        />
                    </div>

                    <div class="form-group">
                        <a href="/" class="ForgetPwd">Já tem Conta? Faça o Login</a>
                        <a href="/cadastro" class="ForgetPwd"
                            style="margin-left: 10%;"
                        >Não tem Conta? Faça o Cadastro</a>
                    </div>

                    <div class="form-group">
                        <button class="btnSubmit">Enviar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import useValidate from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'

export default {
    name: 'Home',


    data() {
        return {
            v$: useValidate(),
            mail: '',
        }
    },

    validations() {
        return {
            mail: {
                required,
                email
            }
        }
    },

    methods: {
        enviar() {
            // se o form n estiver invalido e as credenciais estiverem iguais ele 
            //envia e vai para a tela de home
            if (!this.v$.$invalid) {
                alert('ENVIOU - nao configurado')
                // this.$router.push('/Home')
            } else {
                this.v$.$touch()
                alert('NAO DEU CERTO')
            }
        }
    }


}
</script>
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
    font-size: 10px;
    /* margin-left: 57%; */
    text-decoration: none;
    display: inline-block;
    margin-top: -2px;
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
  
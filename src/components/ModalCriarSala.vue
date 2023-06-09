<template>
    <div class="modal">
        <div class="modal-content">
            <span class="close" @click="$emit('fechar')">&times;</span>
            <h2 class="title">Criar Sala de Aula</h2>
            <form>
                <div class="form-group">
                    <label for="materia">Nome da Matéria:</label>
                    <input type="text" id="materia" v-model.trim="v$.nomeMateria.$model"
                        :class="{ errorMessage: v$.nomeMateria.$error }" />
                </div>

                <div class="form-group">
                    <label for="curso">Nome do Curso:</label>
                    <input type="text" id="curso" v-model.trim="v$.nomeCurso.$model"
                        :class="{ errorMessage: v$.nomeCurso.$error }" />
                </div>

                <div class="form-group">
                    <label for="professor">Nome do Professor:</label>
                    <input type="text" id="professor" v-model.trim="v$.nomeProfessor.$model"
                        :class="{ errorMessage: v$.nomeProfessor.$error }" />
                </div>

                <div v-if="LoginErrorMessage" class="error-message">Por favor, preencha todos os campos</div>
                    
                <button class="btn-criar" type="submit" @click.prevent="criarSala">
                    Criar Sala
                </button>
                <button class="btn-cancel" type="submit" @click.prevent="cancelarSala">
                    Cancelar
                </button>
            </form>
        </div>
    </div>
</template>

<script>
import useValidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { useToast } from 'vue-toastification'

const toast = useToast()

//gera o codigo aleatorio da sala
function gerarCodigoAleatorio() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let codigo = '';
    for (let i = 0; i < 6; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
}


export default {
    name: 'CriarSala',

    data() {
        return {
            v$: useValidate(),
            nomeMateria: '',
            nomeCurso: '',
            nomeProfessor: '',
            codigo: '',
            LoginErrorMessage: false
        };
    },

    validations() {
        return {
            nomeMateria: {
                required
            },
            nomeCurso: {
                required
            },
            nomeProfessor: {
                required
            }
        }
    },

    methods: {
        async criarSala() {

            if (!this.v$.$invalid) {
                const codigo = gerarCodigoAleatorio();
                // console.log(this.nomeMateria, this.nomeCurso, this.nomeProfessor, codigo);

                try {
                    const db = getFirestore();
                    //aqui cria a sala e e feita atravez do nome 'salas' que e o nome da coleçao no firebase
                    // e e passado como codigo da sala a variavel que eu criei que e o codigo
                    const salaRef = doc(collection(db, 'salas'), codigo);

                    // depois os dados que eu forneci sao armazenados nesse obj sala
                    const sala = {
                        nomeMateria: this.nomeMateria,
                        nomeCurso: this.nomeCurso,
                        nomeProfessor: this.nomeProfessor,
                        codigo: codigo
                    };

                    // cria o documento no caso o nome da sala no firebase
                    // e salva a sala no firestore
                    await setDoc(salaRef, sala);

                    // evento fecha 
                    this.$emit('fechar');

                    // e a sala nova e add no array de salas onde vai ser renderizada
                    this.$parent.salas.push(sala);
                    this.$router.push('/home-professor');

                    toast.success("SALA CRIADA COM SUCESSO!", {
                        position: "bottom-right",
                        timeout: 5000,
                        closeOnClick: true,
                        pauseOnFocusLoss: true,
                        pauseOnHover: true,
                        draggable: true,
                        draggablePercent: 0.85,
                        showCloseButtonOnHover: true,
                        hideProgressBar: true,
                        closeButton: false,
                        icon: true,
                        rtl: false
                    });

                    // e se houver algum erro ele captura e amostra qual e o erro
                } catch (error) {
                    console.error('Erro ao criar sala:', error);
                }
            } else {
                this.v$.$touch();
                this.LoginErrorMessage = true;
                toast.error("Ocorreu um erro ao criar a sala", {
                    position: "bottom-right",
                    timeout: 5000,
                    closeOnClick: true,
                    pauseOnFocusLoss: true,
                    pauseOnHover: true,
                    draggable: true,
                    draggablePercent: 0.85,
                    showCloseButtonOnHover: true,
                    hideProgressBar: true,
                    closeButton: false,
                    icon: true,
                    rtl: false
                });
            }
        },
        cancelarSala() {
            this.$emit("fechar")
        }
    }
};
</script>

<style scoped>
.modal {
    display: block;
    /* Mostra o modal */
    position: fixed;
    /* Mantém o modal na tela */
    z-index: 1;
    /* Define a ordem de empilhamento */
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    /* Define um fundo semitransparente */
}

.modal-content {
    background-color: #f4f4f4;
    margin: 10% auto;
    padding: 20px;
    border-radius: 5px;
    position: relative;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    background: linear-gradient(to bottom, #ffffff, #f6f6f6);
}

.title {
    margin-bottom: 30px;
    color: #333;
}

.close {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 28px;
    font-weight: bold;
    color: #aaa;
    padding: 5px 10px;
    cursor: pointer;
}

.close:hover,
.close:focus {
    color: #333;
    text-decoration: none;
}

.form-group {
    margin-bottom: 20px;
    text-align: left;
}

label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
    margin-left: 7px;
}

input[type="text"] {
    padding: 6px;
    border: 1px solid #c7c7c7;
    border-radius: 5px;
    width: 100%;
}

.btn-criar {
    background-color: #039e37;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
    margin-right: 20px;
}

.btn-criar:hover {
    background-color: #035104;
}

.btn-cancel {
    background-color: #ff0000;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
    margin-right: 20px;
}

.btn-cancel:hover {
    background-color: #7e0f0f;
}

.errorMessage {
    border: 2px solid red;
}

.error-message {
    color: red;
    font-size: 12px;
}
</style>  
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

                <div class="form-group">
                    <label for="email">Email do Professor:</label>
                    <input type="text" id="email" v-model.trim="v$.emailProfessor.$model"
                        :class="{ errorMessage: v$.emailProfessor.$error }" />
                </div>


                <div v-if="LoginErrorMessage" class="error-message">Por favor, preencha todos os campos</div>

                <button class="btn-criar" type="submit" @click.prevent="criarSala">
                    <i class="fa-regular fa-circle-check"></i>
                    Criar Sala
                </button>
                <button class="btn-cancel" type="submit" @click.prevent="cancelarSala">
                    <i class="fa-regular fa-circle-xmark"></i>
                    Cancelar
                </button>
            </form>
        </div>
    </div>
</template>

<script>
import useValidate from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
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
            emailProfessor: '',
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
            },
            emailProfessor: {
                email,
                required
            }
        }
    },

    methods: {
        async criarSala() {

            if (!this.v$.$invalid) {
                const codigo = gerarCodigoAleatorio();
                
                const db = getFirestore();
                //aqui cria a sala e e feita atravez do nome 'salas' que e o nome da coleçao no firebase
                // e e passado como codigo da sala a variavel que eu criei que e o codigo
                const salaRef = doc(collection(db, 'salas'), codigo);

                // depois os dados que eu forneci sao armazenados nesse obj sala
                const sala = {
                    nomeMateria: this.nomeMateria,
                    nomeCurso: this.nomeCurso,
                    nomeProfessor: this.nomeProfessor,
                    emailProfessorSala: this.emailProfessor,
                    codigo: codigo,
                };

                if (this.isProfessorValido()) {
                    try {
                        await setDoc(salaRef, sala);

                        this.$emit('fechar');

                        // e a sala nova e add no array de salas onde vai ser renderizada
                        this.$parent.salas.push(sala);
                        this.$router.push('/home-professor');
                        toast.success("Sala Criada com Sucesso!", {
                            position: "bottom-right",
                            timeout: 3000,
                        });

                    } catch (error) {
                        console.error('Erro ao criar sala:', error);
                        toast.error("Ocorreu um Erro ao Criar uma Sala", {
                            position: "bottom-right",
                            timeout: 3000,
                        });
                    }
                    
                } else {
                    toast.error("Por favor, Coloque o Email do Professor Responsável", {
                        position: "bottom-right",
                        timeout: 4000,
                    });
                }
            } else {
                this.v$.$touch();
                this.LoginErrorMessage = true;
                toast.error("Ocorreu um Erro ao criar a sala", {
                    position: "bottom-right",
                    timeout: 3000,
                });
            }
        },
        cancelarSala() {
            this.$emit("fechar")
        },
        isProfessorValido() {
            return this.emailProfessor.toLowerCase().includes('professor');
        }
    }
};
</script>

<style scoped>
.modal {
    display: block;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
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
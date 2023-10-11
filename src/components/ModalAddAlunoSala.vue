<template>
    <div>
        <div class="modal">
            <div class="modal-content">
                <span class="close" @click="$emit('fechar')">&times;</span>
                <h2 class="title">Adicionar Codigo da Sala</h2>
                <div class="form-group">
                    <label for="codigo-sala">Código da Sala:</label>
                    <input type="text" id="codigo-sala" v-model.trim="v$.codigoSala.$model"
                        :class="{ errorMessage: v$.codigoSala.$error }" />
                </div>

                <div v-if="errorMessage" class="error-message">O Campo Codigo da Sala deve ser Preenchido</div>

                <div class="button-group">
                    <button class="btn-add" @click="adicionarCodigo">
                        Adicionar Codigo
                    </button>
                    <button class="btn-cancel" @click="cancelarCodigo">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useToast } from 'vue-toastification';
import {
    getDocs,
    getFirestore,
    collection,
    query,
    where,
    updateDoc,
    arrayUnion,
    doc,
    getDoc,
    setDoc
} from 'firebase/firestore';
import store from '@/state/store';

const toast = useToast()

export default {
    data() {
        return {
            v$: useVuelidate(),
            errorMessage: false,
            codigoSala: '',
        };
    },

    validations() {
        return {
            codigoSala: {
                required
            }
        }
    },

    methods: {
        async adicionarCodigo() {
            if (!this.v$.$invalid) {
                const db = getFirestore();
                const codigoSala = this.codigoSala;
                const alunoEmail = store.state.currentUserEmail; // ou de onde você obtém o email do aluno

                // Verifique se a sala existe
                const salaRef = doc(db, 'salas', codigoSala); // 'codigoSala' agora é o nome do documento
                const salaDoc = await getDoc(salaRef);

                if (salaDoc.exists()) {
                    // A sala existe, agora você pode adicionar o email do aluno ao array
                    const salaData = salaDoc.data(); // Obtenha os dados da sala

                    // Certifique-se de que 'alunos' seja um campo de array na sua estrutura de dados da sala
                    if (!salaData.alunos) {
                        salaData.alunos = [];
                    }

                    // ve se o email esta dentro do array salaData
                    if(!salaData.alunos.includes(alunoEmail)){
                        // Adicione o email do aluno ao array
                        salaData.alunos.push(alunoEmail);
    
                        // Atualize a sala com o novo array de alunos
                        await setDoc(salaRef, salaData);
    
                        toast.success('A Sala foi Adicionada!', {
                            position: "bottom-right",
                            timeout: 3000
                        });

                        this.$emit('sala-encontrada', salaData);

                    } else {
                        // aluno ja esta na sala de aula
                        toast.warning('Você já Esta na Sala de Aula!', {
                            position: 'bottom-right',
                            timeout: 4000
                        });
                    }
                } else {
                    toast.warning('Essa Sala não foi Encontrada, Verifique o Código!', {
                        position: "bottom-right",
                        timeout: 5000
                    });
                }

                this.$emit('fechar');
            } else {
                this.v$.$touch();
                this.errorMessage = true;
                toast.error("Erro ao Adicionar o Código de Sala", {
                    position: "bottom-right",
                    timeout: 5000,
                });
            }
        },

        cancelarCodigo() {
            this.$emit('fechar')
        }
    }
};
</script>

<style scoped>
/* Estilos para o modal */
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
    color: black;
    text-decoration: none;
    cursor: pointer;
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

.btn-add {
    background-color: #039e37;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
    margin-right: 20px;
}

.btn-add:hover {
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

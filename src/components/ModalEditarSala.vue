<template>
    <div class="modal">
        <div class="modal-content">
            <span class="close" @click="$emit('fechar')">&times;</span>
            <h2 class="title">Editar Sala de Aula</h2>
            <form @submit.prevent="salvarEdicao">
                <div class="form-group">
                    <label for="nomeMateria">Editar o Nome da Matéria:</label>
                    <input type="text" v-model="salaEditada.nomeMateria" id="nomeMateria" @input="updateChanges">
                </div>

                <div class="form-group">
                    <label for="nomeProfessor">Editar o Nome do Professor:</label>
                    <input type="text" v-model="salaEditada.nomeProfessor" id="nomeProfessor" @input="updateChanges">
                </div>

                <div class="form-group">
                    <label for="nomeCurso">Editar o Nome do Curso:</label>
                    <input type="text" v-model="salaEditada.nomeCurso" id="nomeCurso" @input="updateChanges">
                </div>

                <div class="form-group">
                    <label for="nomeCurso">Editar o Email do Professor</label>
                    <input type="text" v-model="salaEditada.emailProfessorSala" id="nomeCurso" @input="updateChanges">
                </div>

                <div v-if="ErrorMessage" class="errorMessage">Todos os Campos não podem ser Brancos</div>

                <button type="submit" class="btn-salvar"
                    :class="{ 'btn-disabled': !hasChanges, 'btn-salvar-hover': hasChanges }" :disabled="!hasChanges">
                    <i class="fa-regular fa-circle-check"></i>
                    Salvar Alterações
                </button>
                <button class="btn-cancelar" @click="fecharModal">
                    <i class="fa-regular fa-circle-xmark"></i>
                    Cancelar
                </button>
            </form>
        </div>
    </div>
</template>

<script>
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { useToast } from 'vue-toastification';
import { required, email } from '@vuelidate/validators';
import { isEqual } from 'lodash';

import useValidate from '@vuelidate/core';


export default {
    props: ['sala'],
    data() {
        return {
            v$: useValidate(),
            salaEditada: { ...this.sala }, // Faz uma cópia da sala para edição
            ErrorMessage: false,
            hasChanges: false,
        };
    },

    validations() {
        return {
            salaEditada: {
                nomeMateria: {
                    required
                },
                nomeProfessor: {
                    required
                },
                nomeCurso: {
                    required
                },
                emailProfessorSala: {
                    required,
                    email
                }
            }
        }
    },

    methods: {
        async salvarEdicao() {

            const db = getFirestore();
            const toast = useToast()

            if (!this.v$.$invalid) {
                try {
                    // cria uma referencia do codigo
                    // e literalmente isso la no documento busque por salas e pegue o codigo
                    const docRef = doc(db, 'salas', this.salaEditada.codigo);

                    //Salva os dados da sala no documento referenciado pelo docRef, 
                    //substituindo todos os dados existentes pelo objeto salaEditada
                    await setDoc(docRef, this.salaEditada);

                    toast.success("Alterações Feita com Sucesso!", {
                        position: "bottom-right",
                        timeout: 2000,
                    });

                    // emiti um evento chamado sala-editada para a view home-professor
                    this.$emit('sala-editada', this.salaEditada);
                    this.fecharModal();
                } catch (error) {
                    console.log('error ', error);
                    toast.error("Erro ao Aalvar as Alteraçoes, Tente Novamente", {
                        position: "bottom-right",
                        timeout: 3000,
                    });
                }
            } else {
                this.v$.$touch();
                this.ErrorMessage = true;
                toast.error("Ocorreu um erro na Tentativa de Alteração", {
                    position: "bottom-right",
                    timeout: 3000,
                });
            }
        },

        fecharModal() {
            this.$emit('fechar');
        },

        updateChanges() {
            this.hasChanges = !isEqual(this.sala, this.salaEditada);
        }
    },
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

.title {
    margin-bottom: 30px;
    color: #333;
}

.form-group {
    margin-bottom: 20px;
    text-align: left;
}

label {
    display: block;
    font-weight: bold;
    margin-bottom: 2px;
    margin-left: 5px;
}

input[type="text"] {
    padding: 6px;
    border: 1px solid #c7c7c7;
    border-radius: 5px;
    width: 100%;
}

.btn-salvar {
    background-color: #039e37;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
    margin-right: 20px;
}

.btn-disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.btn-salvar-hover:hover {
    background-color: #035104;
}

.btn-cancelar {
    background-color: #ff0000;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
    margin-right: 20px;
}

.btn-cancelar:hover {
    background-color: #7e0f0f;
}

.errorMessage {
    color: red;
    font-size: 10px;
    /* margin-bottom: 10px; */
}
</style>
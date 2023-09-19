<template>
    <div class="modal">
        <div class="modal-content">
            <h2 class="title">Excluir Sala de Aula</h2>
            <p>Tem certeza que deseja EXCLUIR a sala <strong>"{{ sala.nomeMateria }}"</strong>?</p>
            <div class="button-group">
                <button class="btn-sim" @click="excluirSala">Sim</button>
                <button class="btn-nao" @click="$emit('fechar')">Não</button>
            </div>
        </div>
    </div>
</template>

<script>
import { deleteDoc, doc, getFirestore } from 'firebase/firestore'
import { useToast } from 'vue-toastification';

export default {
    props: ['sala'],

    methods: {
        excluirSala() {
            const db = getFirestore();
            const toast = useToast();

            try {
                const docRef = doc(db, 'salas', this.sala.codigo);
                deleteDoc(docRef);

                toast.success("Exclusão da Sala foi feita com Sucesso", {
                    position: "bottom-right",
                    timeout: 5000,
                    closeButton: "button",
                });

                this.$emit('sala-excluida', this.sala);
                this.fecharModal();
            } catch (error) {
                console.error('Erro ao excluir a sala:', error);
                alert('Erro ao excluir a sala. Por favor, tente novamente.');
            }
        },

        fecharModal() {
            this.$emit('fechar');
        }
    },
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
    max-width: 600px;
    background: linear-gradient(to bottom, #ffffff, #f6f6f6);
}

.btn-nao {
    background-color: #039e37;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
    margin-right: 20px;
}

.btn-nao:hover {
    background-color: #035104;
}

.btn-sim {
    background-color: #ff0000;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
    margin-right: 20px;
}

.btn-sim:hover {
    background-color: #7e0f0f;
}
</style>
  
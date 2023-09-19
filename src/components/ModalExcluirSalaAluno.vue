<template>
    <div class="modal">
        <div class="modal-content">
            <h4>Tem certeza que quer sair da sala do professor {{ sala.nomeProfessor }} da matéria {{ sala.nomeMateria }}?
            </h4>
            <p>Se Voce Sair, Suas Atividades seram apagadas, mais voce pode voltar quando quiser, usando o codigo da sala. </p>
            <div class="modal-buttons">
                <button class="btn-confirm" @click="sairDaSala">Sim</button>
                <button class="btn-cancelar" @click="cancelarSaida">Cancelar</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: { sala: Object },
    
    methods: {
        sairDaSala() {
            this.$emit('sair-da-sala', this.sala);
        },
        cancelarSaida() {
            this.$emit('cancelar-saida');
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
    max-width: 600px;
    background: linear-gradient(to bottom, #ffffff, #f6f6f6);
}

.btn-cancelar {
    background-color: #039e37;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
    margin-right: 20px;
}

.btn-cancelar:hover {
    background-color: #035104;
}

.btn-confirm {
    background-color: #ff0000;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
    margin-right: 20px;
}

.btn-confirm:hover {
    background-color: #7e0f0f;
}
</style>

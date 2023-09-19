<template>
    <div class="container">
        <div class="jumbotron">
            <div class="header">
                <button class="back-button" @click="voltar">Voltar</button>
                <div class="buttons-group">
                    <button class="header-button">Mural</button>
                    <button class="header-button">Atividades</button>
                    <button class="header-button">Pessoas</button>
                </div>
                <p class="sala-code" v-if="sala">Código da Sala: {{ sala.codigo }}</p>
            </div>
            <div class="sala-details">
                <h1 v-if="sala" class="materia">{{ sala.nomeMateria }}</h1>
                <h2 v-if="sala" class="professor">Professor: {{ sala.nomeProfessor }}</h2>
                <h3 v-if="sala" class="curso">Curso: {{ sala.nomeCurso }}</h3>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { buscarSalaPeloCodigo } from '../utils/salas';
import { useRoute } from 'vue-router';

const route = useRoute();
const codigoSala = route.params.codigoSala;
const sala = ref(null)

onMounted(async () => {
    try {
        sala.value = await buscarSalaPeloCodigo(codigoSala);
        console.log('sala: ', sala.value);
    } catch (error) {
        console.error('Erro ao buscar a sala:', error);
        // Lide com o erro, por exemplo, redirecione o usuário para uma página de erro.
    }
});
</script>

<script>
export default {
    name: 'entrarSala',
    methods: {
        voltar() {
            this.$router.go(-1);
        }
    }
}
</script>

<style scoped>
.jumbotron {
    padding: 20px;
    margin: 10px;
    background-color: #828487;
    border-radius: 5px;
    color: #fff;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.back-button {
    background-color: #555;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 5px 15px;
    border-radius: 5px;
    margin-right: 10px;
}

.back-button:hover {
    background-color: #6e7073;
}

.buttons-group {
    display: flex;
    gap: 10px;
}

.header-button {
    background-color: #555;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 5px;
}

.header-button:hover{
    background-color: #6e7073;
}

.sala-code {
    font-size: 14px;
    margin-top: 0;
    color: #000;
}

.sala-details {
    text-align: left;
}

.materia {
    font-size: 38px;
    margin-top: 0;
    color: #000;
}

.professor {
    font-size: 26px;
    margin-top: 5px;
    color: #000;
}

.curso {
    font-size: 20px;
    margin-top: 5px;
    color: #000;
}
</style>

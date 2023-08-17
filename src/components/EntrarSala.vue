<template>
    <div>
        <h1>Detalhes da Sala</h1>
        <button @click="voltar">Voltar</button>
        <p v-if="sala">Codigo da Sala: {{ sala.codigo }}</p>
        <p v-if="sala">Matéria: {{ sala.nomeMateria }}</p>
        <p v-if="sala">Professor: {{ sala.nomeProfessor }}</p>
        <p v-if="sala">Curso: {{ sala.nomeCurso }}</p>
        <!-- Outras informações da sala... -->
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

// const voltar = () => {
//     router.push('/home-professor');
// }

</script>

<script>


export default {
    name: 'entrarSala',
    methods: {
        voltar() {
            this.$router.push('/home-professor');
        }
    }
}
</script>
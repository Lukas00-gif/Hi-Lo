<template>
    <div>
        <nav class="navbar">
            <h3>Codinome HI-LO</h3>
            <ul>
                <li><a href="#">Perfil</a></li>
                <li><a @click="abrirModalAddAlunoSala">Adicionar Codigo</a></li>
                <Logout />
            </ul>
            <span>Bem-vindo(a) {{ aluno.nome }} {{ aluno.sobrenome }} </span>
        </nav>

        <!-- <ModalAddAlunoSala v-if="mostrarModalAddAlunoSala" @fechar="fecharModalAddAlunoSala" /> -->
        <ModalAddAlunoSala v-if="mostrarModalAddAlunoSala" @fechar="fecharModalAddAlunoSala"
            @sala-encontrada="exibirSala" />

        <div class="container">
            <div class="card-deck" v-if="salasCarregadas ">
                <div v-for="sala in salasFiltradas" :key="sala.codigo">
                    <div class="card">
                        <div class="card-body">
                            <p class="cod">Codigo da sala: {{ sala.codigo }}</p>
                            <h5 class="card-title">{{ sala.nomeMateria }}</h5>
                            <p class="card-text">Professor: {{ sala.nomeProfessor }}</p>
                            <p class="card-text">Curso: {{ sala.nomeCurso }}</p>
                            <button class="btn-entrar" @click="exibirSala(sala)">
                                Entrar na sala
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <p v-if="salasFiltradas.length > 0">Ainda não há salas cadastradas.</p>
                <p v-else> Carregando Salas...</p>
            </div>
        </div>

        <footer>
            <p>&copy; 2023 | HI-LO</p>
        </footer>
    </div>
</template>

<script>
import ModalAddAlunoSala from '../components/ModalAddAlunoSala.vue';
import { onMounted, reactive } from 'vue';
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
doc
} from 'firebase/firestore';

import store from '@/state/store';
import Logout from '../components/Logout.vue'

export default {

    name: 'NavBar',

    components: { Logout, ModalAddAlunoSala },

    data() {
        return {
            salas: [],
            mostrarModalAddAlunoSala: false,
        }
    },
    
    setup() {
        const state = reactive({
            salasFiltradas: [],
            // salasCarregadas: [], original
            salasCarregadas: false,
            aluno: {
                nome: '',
                sobrenome: ''
            }
        })

        const db = getFirestore();
        const currentUserEmail = store.state.currentUserEmail;

        onMounted(async () => {

            const querySnapshot = await getDocs(query(collection(db, 'users'), where('email', '==', currentUserEmail)));

            if (!querySnapshot.empty) {
                const alunoDoc = querySnapshot.docs[0];
                state.aluno.nome = alunoDoc.data().fistName;
                state.aluno.sobrenome = alunoDoc.data().lastName;
            }

            // consultar as salas em que o email esta dentro do array "alunos"
            const salasQuery = query(collection(db, 'salas'), where('alunos', 'array-contains', currentUserEmail));
            const salasSnapshot = await getDocs(salasQuery);

            // limpar a lista de salas
            state.salasFiltradas = []

            //preencher a lista com as salas encontradas
            salasSnapshot.forEach((doc) => {
                state.salasFiltradas.push(doc.data());
            });

            state.salasCarregadas = true;

        })

        return state
    },

    methods: {
        // modal do add aluno na sala de aula
        abrirModalAddAlunoSala() {
            this.mostrarModalAddAlunoSala = true;
        },
        fecharModalAddAlunoSala() {
            this.mostrarModalAddAlunoSala = false;
        },
        // Função para adicionar a sala ao HomeAluno
        exibirSala(sala) {
            const codigoSala = sala.codigo;
            this.$router.push({ name: 'EntrarSala', params: { codigoSala } });
        },
    }

};
</script>

<style scoped>
.container {
    margin-top: 25px;
}

.card-deck {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 80px;
}

.card {
    width: 360px;
    background-color: #bfbbbb;
    border: 1px solid #3b3939;
}

.btn-entrar {
    background-color: #2b2b2d;
    color: #fff;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 10px;
}
.btn-entrar:hover {
    background-color: #0056b3;
}

.cod {
    font-size: 10px;
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #434141;
    color: #fff;
    padding: 1rem;
}

.navbar h3 {
    /* margin: 0; */
    font-size: 1.5rem;
}

h3 {
    margin-left: 1%;
}

.navbar ul {
    display: flex;
    list-style: none;
    margin: 0;
    margin-right: 50px;
    padding: 0;
}

.navbar li {
    margin-left: 1rem;
}

.navbar a {
    color: #fff;
    text-decoration: none;
    cursor: pointer;
}

span {
    margin-right: 2%;
    padding: 5px;
}

footer {
    background-color: #434141;
    color: #fff;
    display: flex;
    justify-content: center;
    padding: 1%;
    position: fixed;
    bottom: 0;
    width: 100%;
}
</style>



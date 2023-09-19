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

        <ModalExcluirSalaAluno v-if="mostrarModalExcluirSalaAluno" :sala="salaSelecionada" @sair-da-sala="sairDaSala"
            @cancelar-saida="cancelarSaida" />


        <div class="container">
            <div class="card-deck" v-if="salasCarregadas">
                <div v-for="sala in salasFiltradas" :key="sala.codigo" class="sala-card">
                    <div class="card">
                        <div class="card-body">
                            <p class="cod">Codigo da sala: {{ sala.codigo }}</p>
                            <h5 class="card-title">{{ sala.nomeMateria }}</h5>
                            <p class="card-text">Professor: {{ sala.nomeProfessor }}</p>
                            <p class="card-text">Curso: {{ sala.nomeCurso }}</p>
                            <div class="sala-header">
                                <button class="btn-entrar" @click="exibirSala(sala)">
                                    Entrar na sala
                                </button>
                                <button class="btn-sair" @click="prepararSaida(sala)">
                                    Sair
                                </button>
                            </div>
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
import ModalExcluirSalaAluno from '../components/ModalExcluirSalaAluno.vue';
import { onMounted, reactive } from 'vue';
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    updateDoc,
    arrayRemove,
    doc
} from 'firebase/firestore';

import store from '@/state/store';
import Logout from '../components/Logout.vue'

export default {

    name: 'NavBar',

    components: { Logout, ModalAddAlunoSala, ModalExcluirSalaAluno },

    data() {
        return {
            salas: [],
            mostrarModalAddAlunoSala: false,
            mostrarModalExcluirSalaAluno: false,
            salaSelecionada: null,
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

        
        // Função para preparar a saída da sala (abrir o modal de confirmação)
        prepararSaida(sala) {
            this.salaSelecionada = sala;
            this.mostrarModalExcluirSalaAluno = true;
        },
        cancelarSaida() {
            this.mostrarModalExcluirSalaAluno = false;
            this.salaSelecionada = null;
        },
        sairDaSala(sala) {
            const db = getFirestore();
            const salaRef = doc(db, 'salas', sala.codigo);

            updateDoc(salaRef, {
                alunos: arrayRemove(store.state.currentUserEmail)
            });

            // remover a sala da lista
            const index = this.salasFiltradas.findIndex(s => s.codigo === sala.codigo);
            if (index !== -1) {
                this.salasFiltradas.splice(index, 1);
            }

            // fechar o modal 
            this.mostrarModalExcluirSalaAluno = false;
        }

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

.sala-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.card {
    width: 360px;
    background-color: #bfbbbb;
    border: 1px solid #3b3939;
}

.btn-entrar,
.btn-sair {
    background-color: #2b2b2d;
    color: #fff;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 10px;
    margin-right: 10px;
}

.btn-entrar:hover,
.btn-sair:hover {
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



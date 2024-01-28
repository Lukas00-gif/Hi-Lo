<template>
    <div>
        <nav class="navbar">
            <div class="logo">
                <img src="../img/logo.png" alt="Code Class Logo" />
            </div>
            <!-- <h3>Code Class</h3> -->
            <ul>
                <li><a href="/perfil">Perfil</a></li>
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
                            <p class="cod">Codigo da sala: {{ sala.codigo }}
                                <span class="aviso-desativada" v-if="sala.ativada === true">
                                    ( Sala Esta Desativada )
                                </span>
                            </p>
                            <h5 class="card-title">{{ sala.nomeMateria }}</h5>
                            <p class="card-text">Professor: {{ sala.nomeProfessor }}</p>
                            <p class="card-text">Curso: {{ sala.nomeCurso }}</p>
                            <div class="sala-header">
                                <button class="btn-entrar" @click="exibirSala(sala)" :disabled="sala.ativada"
                                    :style="sala.ativada ? { background: '#cccccc', cursor: 'not-allowed', } : {}">
                                    Entrar Sala
                                    <i class="fa-solid fa-door-open entrar-icon"></i>
                                </button>

                                <button class="btn-sair" @click="prepararSaida(sala)" :disabled="sala.ativada"
                                    :style="sala.ativada ? { background: '#cccccc', cursor: 'not-allowed' } : {}">
                                    Sair
                                    <i class="fa-solid fa-arrow-right-from-bracket out-icon"></i>
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
            <p>&copy; 2024 | Code Class</p>
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
                const salaData = doc.data();
                salaData.ativada = salaData.ativada || false;
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

.aviso-desativada {
    color: red;
    margin-left: 10px;
    font-weight: bold;
}


.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* background-color: #434141; */
    background-color: #817f80;
    color: #070707;
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
    color: #000000;
    text-decoration: none;
    cursor: pointer;
}

span {
    margin-right: 2%;
    padding: 5px;
}

.logo {
    display: flex;
    align-items: center;
    margin-right: 10px;
}

.logo img {
    height: 30px;
}

.entrar-icon {
    margin-left: 5px;
}

.out-icon {
    margin-left: 5px;
}


footer {
    /* background-color: #434141; */
    background-color: #817f80;
    color: #000000;
    display: flex;
    justify-content: center;
    padding: 1%;
    position: fixed;
    bottom: 0;
    width: 100%;
}


/* Largura antes de 769px -- OK */
@media (max-width: 768px) {
    .card-deck {
        justify-content: center;
    }

    .container {
        margin-top: 15px;
        /* Ajuste conforme necessário */
    }

    .card {
        width: 131%;
    }

}

/* Largura entre 769px e 900px -- OK */
@media (min-width: 769px) and (max-width: 900px) {
    .card-deck {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(48%, 1fr));
        gap: 10px;
        justify-content: space-between;
    }

    .card {
        width: 100%;
    }

    .container {
        margin-top: 15px;
    }

    .btn-sair,
    .btn-entrar {
        font-size: 14px;
    }
}

/* Largura entre 901px e 998px -- OK */
@media (min-width: 901px) and (max-width: 998px) {
    .card-deck {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(45%, 1fr));
        gap: 7px;
        justify-content: space-between;
    }

    .container {
        margin-top: 15px;
    }

    .card {
        width: 100%;
    }

    .btn-sair,
    .btn-entrar {
        font-size: 14px;
    }

}

/* Largura entre 999px e 1200px  -- OK */
@media (min-width: 999px) and (max-width: 1200px) {
    .container {
        margin-top: 15px;
    }

    .card {
        width: 91%;
    }

    .card-deck {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(45%, 1fr));
        gap: 7px;
        justify-content: space-between;
    }

    .btn-sair,
    .btn-entrar {
        font-size: 16px;
    }

}

/* Acima de 1201px -- OK */
</style>



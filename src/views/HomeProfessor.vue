<template>
    <div>
        <nav class="navbar">
            <h3>Codinome HI-LO</h3>
            <div class="centered-items">
                <ul>
                    <li><a href="/home-professor">Home</a></li>
                    <li><a href="#">Perfil</a></li>
                    <li><a @click="abrirModal">Criar Sala</a></li>
                    <Logout />
                </ul>
            </div>
            <span>Bem-vindo(a) Professor {{ currentUser.fistName }} {{ currentUser.lastName }}</span>
        </nav>

        <modal-criar-sala v-if="mostrarModal" @fechar="fecharModal"></modal-criar-sala>

        <div class="container">
            <div class="card-deck" v-if="salasCarregadas">
                <div v-for="sala in salas" :key="sala.codigo">
                    <div class="card">
                        <div class="card-body">
                            <p class="cod">Codigo da sala: {{ sala.codigo }}</p>
                            <h5 class="card-title">{{ sala.nomeMateria }}</h5>
                            <p class="card-text">Professor: {{ sala.nomeProfessor }}</p>
                            <p class="card-text">Curso: {{ sala.nomeCurso }}</p>
                            <div class="button-group">
                                <button class="btn-editar">Editar Sala</button>
                                <button class="btn-entrar">Entrar na sala</button>
                                <button class="btn-deletar">Deletar </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <p>Ainda não há salas cadastradas.</p>
            </div>
        </div>

        <footer class="teste">
            <p>&copy; 2023 | HI-LO</p>
        </footer>
    </div>
</template>

<script>
import ModalCriarSala from '../components/ModalCriarSala.vue'
import Logout from '@/components/Logout.vue';

import { onMounted, reactive } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export default {
    name: 'HomeProfessor',
    components: { Logout, ModalCriarSala },

    data() {
        return {
            mostrarModal: false
        }
    },

    methods: {
        abrirModal() {
            this.mostrarModal = true
        },

        fecharModal() {
            this.mostrarModal = false
        }
    },

    //quando inicia o compomente
    setup() {
        const state = reactive({
            // sera preenchido com as salas que estao no firestore
            salas: [],
            // indica se as salas foram carregadas ou nao
            salasCarregadas: false
        });

        const db = getFirestore();

        // é  usada  para excultar uma consulta  no firestore assim que o  compomente for
        // contado
        onMounted(async () => {
            try {
                // consulta atravez do getDocs, com o nome da coleção de salas
                // e vai retornar um objeto querysnashot
                const querySnapshot = await getDocs(collection(db, 'salas'));
                // pega o objeto e itera dentro da sala no caso que e as salas do obj state
                querySnapshot.forEach((doc) => {
                    state.salas.push(doc.data());
                });
                state.salasCarregadas = true;
                // caso aconteça algum erro vai dar erro
            } catch (error) {
                console.error('Erro ao recuperar salas:', error);
                state.salasCarregadas = true;
            }
        });

        return state;
    },

    computed: {
        currentUser() {
            // criar o users de acordo com o parse do armazenado no localstorage chamado 'users'
            // se n tiver ele inicia vazio
            const users = JSON.parse(localStorage.getItem('users')) || [];
            // cria uma variavel que pega o parse do armazenamento no localstorage chamado 'currentUserEmail'
            // se n tiveer ele incia sozinho
            const currentUserEmail = JSON.parse(localStorage.getItem('currentUserEmail')) || '';
            // cria uma variavel que vai buscar no o array users(local storage) onde o user.mail do 
            // cadastro e igual ao email que foi fornecido
            const currentUser = users.find(user => user.mail === currentUserEmail);
            // caso nao enconte nada retorna o objeto vazio
            return currentUser || {};
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

.card {
    width: 360px;
    background-color: #bfbbbb;
    border: 1px solid #3b3939;
}

.button-group {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.btn-editar,
.btn-deletar,
.btn-entrar {
    background-color: #2b2b2d;
    color: #fff;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 10px;
}

.btn-editar:hover,
.btn-deletar:hover,
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
    margin-left: 1%;
}

h3 {
    margin-left: 1%;
}

.navbar .centered-items {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
}

.navbar ul {
    display: flex;
    list-style: none;
    margin: 0;
    /* margin-right: 50px; */
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
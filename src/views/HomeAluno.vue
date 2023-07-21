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

        <h1>Area do Aluno</h1>
        <!-- add o aluno na sala de aula -->
        <ModalAddAlunoSala v-if="mostrarModalAddAlunoSala" @fechar="fecharModalAddAlunoSala" />

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
    where
} from 'firebase/firestore';

import store from '@/state/store';
import Logout from '../components/Logout.vue'

export default {

    name: 'NavBar',

    components: { Logout, ModalAddAlunoSala },

    data() {
        return {
            mostrarModalAddAlunoSala: false,
        }
    },

    setup() {
        const state = reactive({
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
    }

};
</script>

<style scoped>
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


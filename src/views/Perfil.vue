<template>
    <div>
        <nav class="navbar">
            <div class="logo">
                <img src="../img/logo.png" alt="Code Class Logo" />
            </div>
            <ul>
                <li><a @click="voltar">Home</a></li>
                <Logout />
            </ul>
            <span>Bem-vindo(a) {{ aluno.nome }} {{ aluno.sobrenome }} </span>
        </nav>

        <div class="profile-container">
            <h2>Perfil do Usuário</h2>
            <form @submit.prevent="atualizarPerfil(userID)">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="text" v-model="perfil.email"/>
                </div>
                <div class="form-group">
                    <label for="fistName">Nome:</label>
                    <input type="text" v-model="perfil.fistName" />
                </div>
                <div class="form-group">
                    <label for="lastName">Sobrenome:</label>
                    <input type="text" v-model="perfil.lastName" />
                </div>
                <button type="submit">
                    <i class="fa-solid fa-pen-nib"></i>
                    Atualizar Perfil
                </button>
            </form>
        </div>

        <footer>
            <p>&copy; 2023 | Code Class</p>
        </footer>
    </div>
</template>

<script>
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
import { useToast } from 'vue-toastification';

import store from '@/state/store';
import Logout from '../components/Logout.vue'

const toast = useToast();

export default {


    name: 'NavBar',

    components: { Logout },

    setup() {
        const state = reactive({
            aluno: {
                nome: '',
                sobrenome: ''
            },
            perfil: {
                email: '',
                fistName: '',
                lastName: '',
            },
            userID: null,
        });

        const db = getFirestore();
        const currentUserEmail = store.state.currentUserEmail;

        onMounted(async () => {

            const querySnapshot = await getDocs(query(collection(db, 'users'), where('email', '==', currentUserEmail)));

            // mudar os nomes das variaveis para nao ser mais aluno
            if (!querySnapshot.empty) {
                const alunoDoc = querySnapshot.docs[0];
                state.aluno.nome = alunoDoc.data().fistName;
                state.aluno.sobrenome = alunoDoc.data().lastName;

                // pega os dados do usuario para deixar no perfil
                state.perfil.email = alunoDoc.data().email,
                    state.perfil.fistName = alunoDoc.data().fistName,
                    state.perfil.lastName = alunoDoc.data().lastName

                state.userID = alunoDoc.id;

                console.log('perfil apos busca', state.perfil)
            };

        });

        return state
    },

    methods: {
        async atualizarPerfil(userID) {
            const db = getFirestore();
            const currentUserEmail = store.state.currentUserEmail;

            // Verificar se todos os campos estão preenchidos
            if (
                this.perfil.fistName.trim() === '' ||
                this.perfil.lastName.trim() === '' ||
                this.perfil.email.trim() === ''
            ) {
                toast.error('OS CAMPOS NAO PODEM FICAR EM BRANCO', {
                    position: "bottom-right",
                    timeout: 3000,
                });
                return;
            }

            const querySnapshot = await getDocs(query(collection(db, 'users'), where('email', '==', currentUserEmail)));


            if (!querySnapshot.empty) {
                const alunoDoc = querySnapshot.docs[0];

                // Atualizar apenas se houver mudanças nos dados
                if (
                    alunoDoc.data().fistName !== this.perfil.fistName ||
                    alunoDoc.data().lastName !== this.perfil.lastName ||
                    currentUserEmail !== this.perfil.email
                ) {
                    const userRef = doc(db, 'users', userID);
                    await updateDoc(userRef, {
                        email: this.perfil.email,
                        fistName: this.perfil.fistName,
                        lastName: this.perfil.lastName,
                    });

                    toast.success('O Perfil foi Atualizado',{
                    position: "bottom-right",
                    timeout: 2000,
                });

                location.reload();

                } else {
                    toast.warning('Nenhum dado foi alterado. Não ha Necessidade de Atualizar o Perfil', {
                        position: "bottom-right",
                        timeout: 5000,
                    });
                }
            }

            console.log('perfil apos att', this.perfil);
        },

        voltar() {
            window.history.go(-1);
        }
    }

};
</script>

<style scoped>
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
    /* Ajuste conforme necessário */
}

.logo img {
    height: 30px;
}

.profile-container {
    max-width: 400px;
    margin: auto;
    padding: 20px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-top: 5px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
}

input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    margin-bottom: 10px;
    /* Adiciona um espaçamento inferior nos campos de entrada */
}

button {
    background-color: #0062cc;
    color: #fff;
    padding: 10px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
}

button:hover {
    background-color: #113963;
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
</style>



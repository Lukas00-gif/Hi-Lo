<template>
    <div>
        <nav class="navbar">
            <h3>Codinome HI-LO</h3>
            <div class="centered-items">
                <ul>
                    <li><a href="#">Perfil</a></li>
                    <li><a @click="abrirModal">Criar Sala</a></li>
                    <Logout />
                </ul>
            </div>
            <span>Bem-vindo(a) Professor {{ professor.nome }} {{ professor.sobrenome }}</span>
        </nav>

        <!-- chama o modal para criar a sala -->
        <modal-criar-sala v-if="mostrarModal" @fechar="fecharModal"></modal-criar-sala>

        <!-- chama o modal do editar as informaçoes da sala -->
        <modal-editar-sala v-if="mostrarModalEditarSala" :sala="salaSelecionada" @sala-editada="salaEditada"
            @fechar="fecharModalEditarSala"></modal-editar-sala>

        <!-- chama o modal do excluir a sala -->
        <ModalExcluirSala v-if="modalExcluirVisivel" :sala="salaExcluida" @sala-excluida="excluirSala"
            @fechar="fecharModalExcluir"></ModalExcluirSala>

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

                                <button class="btn-editar" @click="editarSala(sala)">
                                    Editar Sala
                                </button>

                                <button class="btn-entrar">Entrar na sala</button>

                                <button class="btn-deletar" @click="abrirModalExcluir(sala)">
                                    Deletar
                                </button>
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
import ModalEditarSala from '../components/ModalEditarSala.vue'
import ModalExcluirSala from '../components/ModalExcluirSala.vue'
import Logout from '@/components/Logout.vue';

import { onMounted, reactive } from 'vue';
import {
    getFirestore,
    collection,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    query,
    where
} from 'firebase/firestore';
import store from '@/state/store';

export default {
    name: 'HomeProfessor',
    components: {
        Logout,
        ModalCriarSala,
        ModalEditarSala,
        ModalExcluirSala
    },

    data() {
        return {
            mostrarModal: false,
            mostrarModalEditarSala: false,
            salaSelecionada: null,
            modalExcluirVisivel: false,
            salaExcluida: null,
        }
    },

    methods: {
        abrirModal() {
            this.mostrarModal = true
        },
        fecharModal() {
            this.mostrarModal = false
        },

        // os metodos do Modal excluir
        abrirModalExcluir(sala) {
            this.salaExcluida = sala;
            this.modalExcluirVisivel = true;
        },
        excluirSala(salaExcluida) {
            // Aqui você pode remover a sala excluída do Firebase
            // e também do array de salas localmente
            const db = getFirestore();

            try {
                const docRef = doc(db, 'salas', salaExcluida.codigo);
                deleteDoc(docRef);

                const index = this.salas.findIndex(sala => sala.codigo === salaExcluida.codigo);
                if (index !== -1) {
                    this.salas.splice(index, 1);
                }

                // Emitir evento para informar que a sala foi excluída
                this.$emit('sala-excluida', salaExcluida);
            } catch (error) {
                console.error('Erro ao excluir a sala:', error);
                alert('Erro ao excluir a sala. Por favor, tente novamente.');
            }

            this.fecharModalExcluir();
        },
        fecharModalExcluir() {
            this.modalExcluirVisivel = false;
            this.salaExcluida = null;
        },

        // os metodos do modal editar
        editarSala(sala) {
            this.salaSelecionada = sala;
            this.mostrarModalEditarSala = true;
        },
        async salaEditada(salaEditada) {
            // Aqui você pode implementar a lógica para salvar a sala editada no banco de dados (usando o Firebase)
            // Exemplo: this.state.salas[index] = salaEditada;
            const db = getFirestore()
            try {
                // cria uma referencia do codigo
                // e literalmente isso la no documento busque por salas e pegue o codigo
                const docRef = doc(db, 'salas', salaEditada.codigo);

                //Atualiza os dados do documento referenciado pelo docRef com os dados do 
                //objeto salaEditada. 
                await updateDoc(docRef, salaEditada);

                // obtem o indice da sala dentro do array salas e deve possuir o mesmo codigo
                const index = this.salas.findIndex(sala => sala.codigo === salaEditada.codigo);
                // verifica se o index encontrado e diferente de -1(sempre verdadeiro) se for a sala foi encontrada
                if (index !== -1) {
                    // se for verdadeiro o array de salas e substituido pelo salaEdita que e um objeto
                    this.salas[index] = salaEditada;
                }
            } catch (error) {
                console.error('Erro ao editar a sala:', error);
                alert('Erro ao editar a sala. Por favor, tente novamente.');
            }
        },
        fecharModalEditarSala() {
            this.mostrarModalEditarSala = false;
        },
    },

    //quando inicia o compomente
    setup() {
        const state = reactive({
            // sera preenchido com as salas que estao no firestore
            salas: [],
            // indica se as salas foram carregadas ou nao
            salasCarregadas: false,
            professor: {
                nome: '',
                sobrenome: ''
            }
        });

        const db = getFirestore();
        const currentUserEmail = store.state.currentUserEmail;

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

                const querySnapshot1 = await getDocs(query(collection(db, 'users'), where('email', '==', currentUserEmail)));
                if (!querySnapshot1.empty) {
                    const professorDoc = querySnapshot1.docs[0];
                    state.professor.nome = professorDoc.data().fistName;
                    state.professor.sobrenome = professorDoc.data().lastName;
                }


                // caso aconteça algum erro vai dar erro
            } catch (error) {
                console.error('Erro ao recuperar salas:', error);
                state.salasCarregadas = true;
            }
        });

        return state;
    },
    
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
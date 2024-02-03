<template>
    <div>
        <nav class="navbar">
            <div class="logo">
                <img src="../img/logo.png" alt="Code Class Logo" />
            </div>
            <div class="centered-items">
                <ul>
                    <li><a href="/perfil">Perfil</a></li>
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

                                <button class="btn-editar" @click="editarSala(sala)" :disabled="sala.ativada"
                                    :style="sala.ativada ? { background: '#cccccc', cursor: 'not-allowed' } : {}">
                                    Editar Sala
                                    <i class="fa-solid fa-pen-to-square edit-icon"></i>
                                </button>

                                <button class="btn-entrar" @click="entrarNaSala(sala)" :disabled="sala.ativada"
                                    :style="sala.ativada ? { background: '#cccccc', cursor: 'not-allowed' } : {}">
                                    Entrar na Sala
                                    <i class="fa-solid fa-door-open"></i>
                                </button>

                                <label class="toggle-switch">
                                    <input type="checkbox" class="toggle-input" v-model="sala.ativada"
                                        @change="alterarStatusSala(sala)">
                                    <span class="slider round"></span>
                                </label>

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
            <p>&copy; 2024 | Code Class</p>
        </footer>
    </div>
</template>

<script>
import ModalCriarSala from '../components/ModalCriarSala.vue';
import ModalEditarSala from '../components/ModalEditarSala.vue';
import ModalExcluirSala from '../components/ModalExcluirSala.vue';
import ModalAddAlunoSala from '../components/ModalAddAlunoSala.vue';
import Logout from '@/components/Logout.vue';

import { onMounted, reactive } from 'vue';
import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    updateDoc,
    doc,
    query,
    where
} from 'firebase/firestore';
import { useToast } from 'vue-toastification';
import store from '@/state/store';

export default {
    name: 'HomeProfessor',
    components: {
        Logout,
        ModalCriarSala,
        ModalEditarSala,
        ModalExcluirSala,
        ModalAddAlunoSala
    },

    data() {
        return {
            mostrarModal: false,
            mostrarModalEditarSala: false,
            modalExcluirVisivel: false,
            salaSelecionada: null,
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

        alterarStatusSala(sala) {
            const db = getFirestore();
            const salaRef = doc(db, 'salas', sala.codigo);

            updateDoc(salaRef, { ativada: sala.ativada })
                .then(() => {
                    if (sala.ativada) {
                        // Sala foi desativada quando o toggle esta ativado
                        this.notifySalaDesativada();
                    } else {
                        // Sala foi ativada quando o toggle esta desativado
                        this.notifySalaAtivada();
                    }
                })
                .catch((error) => {
                    console.error('erro ao atualizar o status da sala', error);
                    alert('nao deu')
                })

        },

        notifySalaAtivada() {
            const toast = useToast();
            toast.success('Sala ativada com sucesso.', {
                position: 'bottom-right',
                timeout: 3000,
            });
        },

        notifySalaDesativada() {
            const toast = useToast();
            toast.warning('Sala desativada com sucesso.', {
                position: 'bottom-right',
                timeout: 3000, 
            });
        },

        // os metodos do modal editar
        editarSala(sala) {
            this.salaSelecionada = sala;
            this.mostrarModalEditarSala = true;
        },
        async salaEditada(salaEditada) {
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

        entrarNaSala(sala) {
            const codigoSala = sala.codigo;
            this.$router.push({ name: 'EntrarSala', params: { codigoSala } });
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
        const variableDoc = doc;
        const currentUserEmail = store.state.currentUserEmail;

        // é  usada  para excultar uma consulta  no firestore assim que o  compomente for
        // contado
        onMounted(async () => {
            try {
                const professorSnapshot = await getDocs(query(collection(db, 'salas'), where('emailProfessorSala', '==', currentUserEmail)));
                professorSnapshot.forEach(async (doc) => {
                    state.salas.push(doc.data());

                    const salaData = doc.data();
                    const salaRef = variableDoc(db, 'salas', salaData.codigo);
                    const salaDoc = await getDoc(salaRef);

                    if (salaDoc.exists()) {
                        salaData.ativada = salaDoc.data().ativada;
                    }
                });
                state.salasCarregadas = true;


                const querySnapshot1 = await getDocs(query(collection(db, 'users'), where('email', '==', currentUserEmail)));
                if (!querySnapshot1.empty) {
                    const professorDoc = querySnapshot1.docs[0];
                    state.professor.nome = professorDoc.data().fistName;
                    state.professor.sobrenome = professorDoc.data().lastName;
                }
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
    background-color: #817f80;
    color: #000000;
    padding: 1rem;
}

.navbar h3 {
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
.toggle-switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
}

.toggle-input {
    display: none;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
}

/* Estilo do toggle switch quando ativado */
.toggle-input:checked+.slider {
    background-color: #4CAF50;
}

.toggle-input:checked+.slider:before {
    transform: translateX(26px);
}

.logo {
    display: flex;
    align-items: center;
    margin-right: 10px;
}

.logo img {
    height: 30px;
}

.edit-icon {
    margin-left: 2px;
}

footer {
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
        width: 100%;
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
        margin-top: 20px;
    }

    .btn-editar,
    .btn-deletar,
    .btn-entrar {
        font-size: 12px;
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
        margin-top: 25px;
    }

    .card {
        width: 100%;
    }

    .btn-editar,
    .btn-deletar,
    .btn-entrar {
        font-size: 12px;
    }

}

/* Largura entre 999px e 1200px  -- OK */
@media (min-width: 999px) and (max-width: 1200px) {
    .container {
        margin-top: 25px;
    }

    .card {
        width: 100%;
    }

    .card-deck {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(45%, 1fr));
        gap: 7px;
        justify-content: space-between;
    }

    .btn-editar,
    .btn-deletar,
    .btn-entrar {
        font-size: 16px;
    }

    .button-group{
        margin-left: 14%;
    }


}

/* Acima de 1201px -- OK */
@media (min-width: 1201px) {
    .container {
        margin-top: 15px;
    }

    .card {
        width: 100%;
    }

}
</style>
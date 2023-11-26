<template>
    <div class="container">
        <div class="jumbotron">
            <div class="header">
                <button class="back-button" @click="voltar">Voltar</button>
                <div class="buttons-group">
                    <!-- <button @click="monstrarMural" class="header-button">Mural</button> -->

                    <button @click="mostrarAtividades" v-if="isUserProfessor()" class="header-button"> Atividades </button>

                    <button @click="mostrarPessoas" class="header-button">Pessoas na Sala</button>
                </div>
                <p class="sala-code" v-if="sala">Código da Sala: {{ sala.codigo }}</p>
            </div>
            <div class="sala-details">
                <h1 v-if="sala" class="materia">{{ sala.nomeMateria }}</h1>
                <h2 v-if="sala" class="professor">Professor: {{ sala.nomeProfessor }}</h2>
                <h3 v-if="sala" class="curso">Curso: {{ sala.nomeCurso }}</h3>
            </div>
        </div>


        <!-- conteudo do mural -->
        <div v-if="mostrarMuralFlag" class="container1">
            <h1>Mural de Atividades</h1>
            <div v-for="(atividade, index) in atividades" :key="index" class="atividade-container">
                <div class="atividade-titulo">{{ atividade.tituloAtividade }}</div>
                <div class="atividade-descricao">{{ atividade.descricaoAtividade }}</div>

                <!-- Adiciona a classe 'atividade-aberta' se atividadeAberta for true -->
                <button class="responder-button" @click="abrirAtividade(atividade)" v-show="!atividade.atividadeAberta">
                    Abrir Atividade
                </button>

                <!-- Textarea e botões adicionais -->
                <div v-show="atividade.atividadeAberta">
                    <textarea v-model="tituloRespostaAluno" class="form-control fixed-textarea-titulo" rows="3"
                        placeholder="Digite o Titulo da resposta">
                    </textarea>

                    <textarea v-model="respostaAtividade" rows="5" class="form-control fixed-textarea-resposta"
                        placeholder="Digite sua resposta para a questao...">
                    </textarea>

                    <button class="enviar-atividade-button" @click="enviarResposta"
                        :disabled="tituloRespostaAluno.trim() === '' || respostaAtividade.trim() === ''"
                        :class="{ 'botao-desabilitado': tituloRespostaAluno.trim() === '' || respostaAtividade.trim() === '', 'enviar-atividade-button-hover': respostaAtividade.trim() !== '' }">
                        Enviar Resposta
                    </button>

                    <button class="cancelar-atividade-button" @click="fecharAtividade(atividade)">Fechar Atividade</button>

                </div>
            </div>
        </div>


        <!-- conteudo de atividades -->
        <div v-if="mostrarAtividadesFlag" class="container1">
            <h1>Atividades</h1>
            <button v-if="isUserProfessor()" @click="mostrarFormulario" class="create-activity-button">
                Criar Atividade
            </button>
            <button @click="fecharPessoas" class="close-button">X</button> <!-- Botão de fechar -->

            <form @submit.prevent="enviarFormulario" v-if="isUserProfessor() && mostrarFormularioFlag">
                <div class="form-group">
                    <textarea v-model="tituloAtividade" class="form-control fixed-textarea-titulo" rows="3"
                        placeholder="Digite o titulo da sua atividade">
                    </textarea>

                    <textarea v-model="descricaoAtividade" class="form-control fixed-textarea" rows="5"
                        placeholder="Digite a atividade">
                    </textarea>

                    <textarea v-model="codigoPython" class="form-control fixed-textarea-codigo" rows="5"
                        placeholder="Digite o codigo em Python">
                    </textarea>
                </div>
                <div class="form-group-button">
                    <button type="submit" class="postar-atividade-button">Postar</button>

                    <button @click="cancelarPostagem" type="submit" class="cancelar-atividade-button">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>

        <!-- conteudo do pessoas na sala -->
        <div v-if="mostrarPessoasFlag" class="container1">
            <h1>Pessoas na Sala</h1>
            <button @click="fecharPessoas" class="close-button">X</button> <!-- Botão de fechar -->
            <ul>
                <!-- Exibir professor se existir -->
                <li class="professor" v-if="professor">Professor: {{ professor }}</li>
                <!-- Exibir alunos se existirem -->
                <li>Alunos: </li>
                <li v-for="(aluno, index) in alunosNaSala" :key="index" class="aluno">
                    {{ aluno.nome }} {{ aluno.sobrenome }}
                </li>
            </ul>
        </div>


    </div>
</template>

<script setup>
import {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    collection,
    setDoc,
    query,
    where
} from 'firebase/firestore';
import { onMounted, ref } from 'vue';
import { buscarSalaPeloCodigo } from '../utils/salas';
import { useRoute } from 'vue-router';
import { buscarDetalhesDoUsuarioPorEmail } from '../utils/usuarioPorEmail';
import { useToast } from 'vue-toastification';



const toast = useToast();
const route = useRoute();
const codigoSala = route.params.codigoSala;


const sala = ref(null);
const mostrarPessoasFlag = ref(false);
const mostrarAtividadesFlag = ref(false);
const mostrarMuralFlag = ref(true);
const mostrarFormularioFlag = ref(false);

const tituloAtividade = ref('');
const descricaoAtividade = ref('');
const codigoPython = ref('');
const respostaAtividade = ref('');
const tituloRespostaAluno = ref('');

const professor = ref({});
const alunosNaSala = ref([]);
const atividades = ref([]);
const currentUserEmail = localStorage.getItem('currentUserEmail');

const carregarPessoasNaSala = async () => {
    try {
        const db = getFirestore();
        const salaDocRef = doc(db, 'salas', codigoSala);
        const salaDocSnapshot = await getDoc(salaDocRef);

        if (salaDocSnapshot.exists()) {
            const salaData = salaDocSnapshot.data();

            // vai atras do professor. e pega a variaveis
            if (salaData && salaData.nomeProfessor) {
                professor.value = salaData.nomeProfessor;
            }

            // console.log('AQUI TEM A SALADATA', salaData);

            // verifica se tem a sala, nessa condiçao todas tem que ser vedadeiras
            // para entrar dentro desse bloco
            if (salaData && salaData.nomeProfessor && salaData.alunos) {
                // Obtenha os detalhes do professor
                // const professorEmail = salaData.professor;
                // const professorDetails = await buscarDetalhesDoUsuarioPorEmail(professorEmail);

                // Use a propriedade alunos para armazenar os emails dos alunos
                const alunosEmails = salaData.alunos;

                // Obtenha os detalhes dos alunos com base nos emails
                alunosNaSala.value = await Promise.all(
                    alunosEmails.map(async (email) => {
                        const alunoDetails = await buscarDetalhesDoUsuarioPorEmail(email);
                        return alunoDetails
                            ? {
                                nome: alunoDetails.fistName,
                                sobrenome: alunoDetails.lastName,
                            }
                            : null;
                    })
                );
                console.log('Dados dos alunos na sala:', alunosNaSala.value);
            }
        }
    } catch (error) {
        console.error('Erro ao buscar pessoas na sala:', error);
    }
};

// para fazer a verificaçao e retorna false ou true
const validarFormulario = () => {
    // Lógica de validação aqui
    if (tituloAtividade.value.trim() === '' || descricaoAtividade.value.trim() === '' ||
        codigoPython.value.trim() === '') {

        // Exibir mensagem de erro (você pode usar um toast aqui)
        toast.error(' por favor preencha todos os campos', {
            position: "bottom-right",
            timeout: 3000,
        });
        return false;
    }

    if (tituloAtividade.value.length < 10 || descricaoAtividade.value.length < 10 ||
        codigoPython.value.length < 1) {
        // Exibir mensagem de erro (você pode usar um toast aqui)
        toast.error('Os campos devem ter no minimo 10 caracteres', {
            position: "bottom-right",
            timeout: 3000,
        });
        return false;
    }

    if (descricaoAtividade.value.length > 200) {
        toast.error('O Campo descriçao da atividade deve ter no Maximo 200 Caracteres', {
            position: "bottom-right",
            timeout: 5000,
        });
        return false;
    }

    // Se passar na validação
    return true;
};

//ve a verificaçao e se for true ele entrar dentro para fazer a postagem
const enviarFormulario = async () => {
    if (validarFormulario()) {

        // Lógica para criar a atividade
        // Você pode acessar o conteúdo da atividade em conteudoAtividade.value
        // Certifique-se de adicionar a lógica necessária para criar a atividade aqui
        const db = getFirestore();

        const atividade = {
            // variavel para o bd : variavel do v-model d template
            tituloAtividade: tituloAtividade.value,
            descricaoAtividade: descricaoAtividade.value,
            codigoPython: codigoPython.value,
            codigoSala: codigoSala,
            emailProfessor: currentUserEmail,
        }

        try {
            // add a coleçao atividadeees com o codigo sendo o documento e a variavel atitivade
            // com outras variaveis
            const atividadeColletionRef = collection(db, 'atividades');
            const atividadeDocRef = doc(atividadeColletionRef, tituloAtividade.value);
            await setDoc(atividadeDocRef, atividade);

            toast.success("Postagem Feita", {
                position: "bottom-right",
                timeout: 2000,
            });

            // colocar o toast depois
        } catch (error) {
            alert('NAO DEU CERTO, BOY')
            console.log('erro ao add a atividade', error)
        }

        // Limpar os campos após o envio
        tituloAtividade.value = '';
        descricaoAtividade.value = '';
        codigoPython.value = '';
    }
};

const carregarAtividades = async () => {
    const db = getFirestore();
    const atividadesColletionRef = collection(db, 'atividades');
    const querySnapshot = await getDocs(query(atividadesColletionRef, where("codigoSala", "==", codigoSala)));

    atividades.value = querySnapshot.docs.map((doc) => {
        return doc.data();
    });
};

const enviarResposta = async () => {
    if (currentUserEmail.includes('professor')) {
        toast.error('Professores nao podem enviar respostas de atividades', {
            position: 'bottom-right',
            timeout: 4000,
        });
        return;
    }

    const db = getFirestore();
    const respostaAlunoCollectionRef = collection(db, 'respostasAlunos');

    const respostaAluno = {
        tituloRespostaAluno: tituloRespostaAluno.value,
        codigoSala: codigoSala,
        codigoAluno: respostaAtividade.value,
        emailAluno: currentUserEmail,
        // add depois se precisar do nome e sobrenome do aluno
    };

    try {
        const respostaAlunoDocRef = doc(respostaAlunoCollectionRef, tituloRespostaAluno.value);
        await setDoc(respostaAlunoDocRef, respostaAluno);

        toast.success('Resposta Enviada com Sucesso!!!', {
            position: "bottom-right",
            timeout: 2000,
        });

        tituloRespostaAluno.value = '';
        respostaAtividade.value = '';

    } catch (error) {
        console.error('Erro ao enviar a reposta do aluno', error);

        toast.error("Erro ao enviar a resposta. Por favor, tente novamente.", {
            position: "bottom-right",
            timeout: 3000,
        });

    }

};

// const monstrarMural = () => {
//     mostrarMuralFlag.value = false;
// };

const mostrarPessoas = () => {
    carregarPessoasNaSala();
    mostrarPessoasFlag.value = true; // Defina a flag como verdadeira para exibir PessoasNaSala
};

const mostrarAtividades = () => {
    // mudar a funçao que vai aparecer
    carregarPessoasNaSala();
    mostrarAtividadesFlag.value = true;
}

const isUserProfessor = () => {
    // Verifica se o currentUserEmail contém a palavra "professor"
    return currentUserEmail.includes('professor');
};

const mostrarFormulario = () => {
    mostrarFormularioFlag.value = true;
};

const fecharPessoas = () => {
    mostrarPessoasFlag.value = false; // Defina a flag como falsa para ocultar PessoasNaSala
    mostrarAtividadesFlag.value = false;
    mostrarFormularioFlag.value = false;
};

const cancelarPostagem = () => {
    mostrarFormularioFlag.value = false;
}

const voltar = () => {
    // Implemente a lógica de voltar para a página anterior
    // router.go(-1);
    window.history.go(-1);
};

const abrirAtividade = (atividade) => {

    atividade.atividadeAberta = true;
}

const fecharAtividade = (atividade) => {
    atividade.atividadeAberta = false;
    respostaAtividade.value = '';
}


onMounted(async () => {
    try {
        sala.value = await buscarSalaPeloCodigo(codigoSala);
        console.log('sala: ', sala.value);

        // aki ele vai montar na hora que ele entrar no compomente, e carrega-lo
        carregarAtividades();

    } catch (error) {
        console.error('Erro ao buscar a sala:', error);
        // Lide com o erro, por exemplo, redirecione o usuário para uma página de erro.
    }
});


</script>


<style scoped>
.jumbotron {
    padding: 20px;
    margin: 10px;
    background-color: #828487;
    border-radius: 5px;
    color: #fff;
    position: relative;
    /* Adicionado */
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

.header-button:hover {
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
    font-size: 18px;
    margin-top: 15px;
    /* Aumenta a margem superior para separar do conteúdo anterior */
    color: #000;
}

.professor::after {
    /* Adicionado para separar */
    content: "";
    display: block;
    width: 100%;
    height: 2px;
    background-color: #ccc;
    margin: 5px 0;
}

.create-activity-button {
    background: #555;
    /* Cinza */
    color: #fff;
    /* Branco */
    border: none;
    padding: 2px 8px;
    border-radius: 4px;
    margin-left: 8px;
    /* Espaçamento à direita do texto "Professor" */
    margin-bottom: 8px;
    cursor: pointer;

}

.postar-atividade-button {
    background: #5fb013;
    /* Cinza */
    color: #fff;
    /* Branco */
    border: none;
    padding: 4px 14px;
    border-radius: 5px;
    margin-top: 8px;
    cursor: pointer;
}

.cancelar-atividade-button {
    background: #f02424;
    /* Cinza */
    color: #fff;
    /* Branco */
    border: none;
    padding: 4px 14px;
    border-radius: 5px;
    margin-top: 8px;
    margin-left: 10px;
    cursor: pointer;
}

.postar-atividade-button:hover {
    background: #428a07;
}

.cancelar-atividade-button:hover {
    background: #8f2424;
}

.enviar-atividade-button {
    background: #5fb013;
    /* Cinza */
    color: #fff;
    /* Branco */
    border: none;
    padding: 4px 14px;
    border-radius: 5px;
    margin-top: 8px;
    cursor: pointer;
}

.enviar-atividade-button-hover:hover {
    background: #428a07;
}

.postar-atividade-button:hover {
    background: #428a07;
}

.curso {
    font-size: 20px;
    margin-top: 5px;
    color: #000;
}

.fixed-textarea {
    height: 150px;
    /* Defina a altura desejada em pixels */
    resize: none;
    /* Impede o redimensionamento do usuário */
    margin-bottom: 10px;
}

.fixed-textarea-resposta {
    height: 150px;
    /* Defina a altura desejada em pixels */
    resize: none;
    /* Impede o redimensionamento do usuário */
    margin-bottom: 10px;
    margin-top: 10px;
}

.fixed-textarea-titulo {
    height: 40px;
    resize: none;
    /* Impede o redimensionamento do usuário */
    margin-bottom: 10px;
}

.fixed-textarea-codigo {
    height: 200px;
    /* Defina a altura desejada em pixels */
    resize: none;
    /* Impede o redimensionamento do usuário */
}

.container1 {
    margin: 20px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    position: relative;
    /* Adicionado */
}

.container1 h1 {
    font-size: 24px;
    margin-bottom: 10px;
}

.close-button {
    /* Adicionado para o botão fechar */
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-weight: bold;
    font-size: 18px;
}

.close-button:hover {
    background-color: #ccc;
}

ul {
    list-style: none;
    padding: 0;
}

li.professor,
li.aluno {
    /* background-color: #f4f4f4; */
    /* Fundo cinza claro para professor e alunos */
    padding: 5px;
    margin-bottom: 5px;
    border-radius: 5px;
}

li.aluno {
    background-color: #f4f4f4;
}

li.professor {
    font-weight: bold;
}

li.aluno {
    margin-left: 20px;
}


.atividade-container {
    background-color: #f0f0f0;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 20px;
    margin-left: 80px;
    margin-right: 80px;
}

.atividade-titulo {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
}

.atividade-descricao {
    font-size: 16px;
    margin-bottom: 10px;
}

.responder-button {
    background-color: #007BFF;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
}

.botao-desabilitado {
    background-color: #ccc;
    color: #666;
    cursor: not-allowed;
}
</style>


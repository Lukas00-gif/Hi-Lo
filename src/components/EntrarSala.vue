<template>
    <div class="container">
        <div class="jumbotron">
            <div class="header">
                <button class="back-button" @click="voltar">
                    <i class="fa-solid fa-circle-arrow-left"></i>
                    Voltar
                </button>
                <div class="buttons-group">
                    <!-- <button @click="monstrarMural" class="header-button">Mural</button> -->

                    <button @click="mostrarAtividades" v-if="isUserProfessor()" class="header-button"> 
                        <i class="fa-solid fa-book atividade-icon"></i>
                        Atividades
                    </button>

                    <button @click="mostrarPessoas" class="header-button">
                        <i class="fa-solid fa-people-group people-icon"></i>
                        Pessoas na Sala
                    </button>
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
                <div class="atividade-descricao" v-html="atividade.descricaoAtividade"></div>
                <p><strong>Saida: </strong></p>
                <div class="atividade-saida" v-html="atividade.saidaEsperadaProfessor"></div>

                <!-- Adiciona a classe 'atividade-aberta' se atividadeAberta for true -->
                <button class="responder-button" @click="abrirAtividade(atividade)" v-show="!atividade.atividadeAberta">
                    <i class="fa-solid fa-book-open book-icon"></i>
                    Abrir Atividade
                </button>

                <div v-if="mostrarMensagem" :class="{ 'acertou': respostaCorreta, 'errou': !respostaCorreta }">
                    {{ mensagemResultado }}
                </div>



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
                        <i class="fa-regular fa-paper-plane resposta-icon"></i>
                        Enviar Resposta
                    </button>

                    <button class="cancelar-atividade-button" @click="fecharAtividade(atividade)">
                        <i class="fa-solid fa-square-xmark"></i>
                        Fechar Atividade
                    </button>

                </div>
            </div>
        </div>


        <!-- conteudo de atividades -->
        <div v-if="mostrarAtividadesFlag" class="container1">
            <h1>Atividades</h1>
            <button v-if="isUserProfessor()" @click="mostrarFormulario" class="create-activity-button">
                <i class="fa-solid fa-plus"></i>
                Criar Atividade
            </button>
            <button @click="fecharPessoas" class="close-button">X</button> <!-- Botão de fechar -->

            <form @submit.prevent="enviarFormulario" v-if="isUserProfessor() && mostrarFormularioFlag">
                <div class="form-group">
                    <textarea v-model="tituloAtividade" class="form-control fixed-textarea-titulo" rows="3"
                        placeholder="Digite o titulo da sua atividade">
                    </textarea>

                    <textarea v-model="descricaoAtividade" class="form-control fixed-textarea" rows="5"
                        placeholder="Descreva o que e para fazer na Atividade">
                    </textarea>

                    <textarea v-model="saidaEsperada" class="form-control fixed-textarea-codigo" rows="5"
                        placeholder="Digite a Saida do codigo Esperada para a Questão...">
                    </textarea>
                </div>
                <div class="form-group-button">
                    <button type="submit" class="postar-atividade-button">
                        <i class="fa-regular fa-circle-check"></i>
                        Postar
                    </button>

                    <button @click=     "cancelarPostagem" type="submit" class="cancelar-atividade-button">
                        <i class="fa-regular fa-circle-xmark"></i>
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
    where,
} from 'firebase/firestore';
import { getDatabase, ref as refs, get, update, push, set } from 'firebase/database';
import { onMounted, ref } from 'vue';
import { buscarSalaPeloCodigo } from '../utils/salas';
import { useRoute } from 'vue-router';
import { buscarDetalhesDoUsuarioPorEmail } from '../utils/usuarioPorEmail';
import { useToast } from 'vue-toastification';
import store from '../state/store';

import axios from 'axios';



const toast = useToast();
const route = useRoute();
const codigoSala = route.params.codigoSala;


const sala = ref(null);
const mostrarPessoasFlag = ref(false);
const mostrarAtividadesFlag = ref(false);
const mostrarMuralFlag = ref(true);
const mostrarFormularioFlag = ref(false);
const respostaCorreta = ref(false);
const atividadeRespondida = ref(false);
const mostrarMensagem = ref(false);
const respostaSalva = ref(false);
const idAtividadeRealtimeGlobal = ref(null);

const mensagemResultado = ref('');
const tituloAtividade = ref('');
const descricaoAtividade = ref('');
const saidaEsperada = ref('');
const respostaAtividade = ref('');
const tituloRespostaAluno = ref('');

const professor = ref({});
const alunosNaSala = ref([]);
const atividades = ref([]);
const atividade = ref([]);
const respostasAtividades = ref([]);
const currentUserEmail = localStorage.getItem('currentUserEmail');
const { v4: uuidv4 } = require('uuid');


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
        saidaEsperada.value.trim() === '') {

        // Exibir mensagem de erro (você pode usar um toast aqui)
        toast.error(' por favor preencha todos os campos', {
            position: "bottom-right",
            timeout: 3000,
        });
        return false;
    }

    if (tituloAtividade.value.length < 10 || descricaoAtividade.value.length < 10 ||
        saidaEsperada.value.length < 1) {
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
        const dbFirestore = getFirestore();
        const dbRealTime = getDatabase();
        const codigoUnico = uuidv4();

        const saidaEsperadaComQuebradeLinha = saidaEsperada.value.replace(/\n/g, '<br>');
        const descricaoAtividadeComQuebradeLinha = descricaoAtividade.value.replace(/\n/g, '<br>');

        const atividadeColletionRef = collection(dbFirestore, 'atividades');
        const atividadeDocRef = doc(atividadeColletionRef, codigoUnico);

        const atividadeData = {
            tituloAtividade: tituloAtividade.value,
            descricaoAtividade: descricaoAtividadeComQuebradeLinha,
            saidaEsperadaProfessor: saidaEsperadaComQuebradeLinha,
            codigoSala: codigoSala,
            emailProfessor: currentUserEmail,
            codigoUnico: codigoUnico,
        };

        try {
            await setDoc(atividadeDocRef, atividadeData);

            const atividadesRef = refs(dbRealTime, 'dadosAtividades', tituloAtividade);
            const atividadeRealtimeData = {
                tituloAtividade: tituloAtividade.value,
                codigoSala: codigoSala,
                idAtividade: atividadeDocRef.id,
            };

            await push(atividadesRef, atividadeRealtimeData);

            // criar um novo nó no realtime database
            const variaveisAtividadesRef = refs(dbRealTime, `variaveisAtividades/${atividadeDocRef.id}`);
            const variaveisAtividadesData = {
                respondida: false,
                correta: false,
                mensagem: "",
            }

            await push(variaveisAtividadesRef, variaveisAtividadesData);

            // Obtém o array de atividades do localStorage
            // const atividadesLocalStorage = JSON.parse(localStorage.getItem('atividades')) || {};

            // Converte as chaves para strings (opcional)
            // const atividadesLocalStorageStringKeys = Object.fromEntries(
            //     Object.entries(atividadesLocalStorage).map(([key, value]) => [String(key), value])
            // );

            // atividadesLocalStorageStringKeys[atividadeDocRef.id] = {
            //     respondida: false,
            //     correta: false,
            //     mensagem: '',
            // };

            // localStorage.setItem('atividades', JSON.stringify(atividadesLocalStorageStringKeys));

            // Adiciona a nova atividade ao estado Vuex

            toast.success("Postagem Feita", {
                position: "bottom-right",
                timeout: 2000,
            });
        } catch (error) {
            console.error('Erro ao adicionar a atividade', error);
            toast.error("Erro ao adicionar a atividade. Por favor, tente novamente.", {
                position: "bottom-right",
                timeout: 3000,
            });
        }

        // Limpar os campos após o envio
        tituloAtividade.value = '';
        descricaoAtividade.value = '';
        saidaEsperada.value = '';
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
        toast.error('Professores não podem enviar respostas de atividades', {
            position: 'bottom-right',
            timeout: 4000,
        });
        return;
    }


    const db = getFirestore();
    const respostaAlunoCollectionRef = collection(db, 'respostasAlunos');

    // Obtenha o idAtividade a partir do Realtime Database
    const idAtividadeFirestore = await getCodigoUnicoAtividade();

    const idAtividadeRealtime = await getIDAtividade(idAtividadeFirestore);

    // do realtime para o localstorage
    idAtividadeRealtimeGlobal.value = await getIDAtividade(idAtividadeFirestore);

    // Verifica se o idAtividade é válido antes de prosseguir
    if (!idAtividadeRealtime) {
        console.error('ID da Atividade não é válido REALTIME.');
        return;
    }

    if (!idAtividadeFirestore) {
        console.error('ID da Atividade não é válido FIRESTORE.');
        return;
    }

    // Verifica se a atividade já foi respondida anteriormente
    if (atividadeRespondida.value) {
        toast.warning('Só é permitido responder à atividade apenas 1 vez!', {
            position: 'bottom-right',
            timeout: 4000,
        });
        return;
    }

    const respostaAluno = {
        tituloRespostaAluno: tituloRespostaAluno.value,
        codigoSala: codigoSala,
        codigoAluno: respostaAtividade.value,
        emailAluno: currentUserEmail,
        codigoUnicoAtividade: idAtividadeRealtime,
    };

    try {
        
        // Use idAtividade como o ID do Documento
        const respostaAlunoDocRef = doc(respostaAlunoCollectionRef, idAtividadeRealtime);
        await setDoc(respostaAlunoDocRef, respostaAluno);

        toast.success('Resposta Enviada com Sucesso!!!', {
            position: 'bottom-right',
            timeout: 2000,
        });

        // atividadeRespondida.value = true;
        // // manda para o vuex com as informaçoes, com o nome marcarAtividadesRespondidas
        // store.dispatch('marcarAtividadeRespondida', idAtividadeRealtime, respostaCorreta, mensagemResultado.value);

        // store.dispatch('marcarAtividadeRespondida', {
        //     idAtividade: idAtividadeRealtime,
        //     respondida: true,
        //     correta: true,
        //     mensagem: '',
        // });


        // await atualizarRespostaNoRealtime(idAtividadeRealtime, true, true, 'Sua mensagem de acerto ou erro aqui');

        await compararCodigos(idAtividadeRealtime);

        tituloRespostaAluno.value = '';
        respostaAtividade.value = '';

    } catch (error) {
        console.error('Erro ao enviar a resposta do aluno', error);

        toast.error('Erro ao enviar a resposta. Por favor, tente novamente.', {
            position: 'bottom-right',
            timeout: 3000,
        });
    }

};



// chamada do axios
// Modifique a assinatura da função compararCodigos para receber a atividadeKey
const compararCodigos = async (idAtividade) => {
    try {
        const dbFirestore = getFirestore();

        // Consulta no Firestore para a coleção 'atividades'
        const firestoreQuery = query(collection(dbFirestore, 'atividades'), where('codigoSala', '==', codigoSala));
        const querySnapshot = await getDocs(firestoreQuery);

        // Verifica se há documentos retornados pela consulta
        if (querySnapshot.docs.length > 0) {
            const atividadeSnapshot = querySnapshot.docs[0]; // Pegue o primeiro documento da consulta
            console.log('ID do Documento Firestore atividade:', atividadeSnapshot.id);

            // Consulta no Firestore para a coleção 'respostasAlunos'
            const respostaAlunoRef = doc(dbFirestore, 'respostasAlunos', idAtividade);
            const respostaAlunoSnapshot = await getDoc(respostaAlunoRef);

            if (respostaAlunoSnapshot.exists()) {
                console.log('Documento no Firestore respostasAlunos Encontrado');

                // Obtenha o códigoPython do documento respostasAlunos
                const respostaAlunoValue = respostaAlunoSnapshot.data().codigoAluno;

                // Compare os IDs dos documentos e, se forem iguais, envie para o servidor
                if (atividadeSnapshot.id === idAtividade) {
                    const saidaEsperadaFirebase = atividadeSnapshot.data().saidaEsperadaProfessor;

                    // tira a tag 
                    const parser = new DOMParser();
                    const htmlElement = parser.parseFromString(saidaEsperadaFirebase, 'text/html');
                    const saidaEsperadaFirebaseSemTag = htmlElement.body.textContent || "";

                    console.log('Saida esperada feita pelo professor:', saidaEsperadaFirebaseSemTag);

                    const response = await axios.post('http://127.0.0.1:5000/comparar-codigos', {
                        saidaEsperadaProfessor: saidaEsperadaFirebaseSemTag,
                        codigoAluno: respostaAlunoValue,
                    });

                    console.log(response.data.resultado)

                    // const respostaServidor = response.data.resultado;

                    // respostaCorreta.value = respostaServidor === 'Os Códigos São Iguais';
                    // mensagemServidor.value = respostaServidor;

                    // // Ajuste a lógica para verificar se a resposta é correta ou não
                    // mensagemResultado.value = respostaCorreta.value ? 'Você acertou!' : 'Você errou!';

                    const respostaServidor = response.data.resultado;

                    // Agora, você pode atualizar o Realtime Database com as novas informações
                    const dbRealtime = getDatabase();
                    const atividadesRef = refs(dbRealtime, `variaveisAtividades/${idAtividade}`);
                    await set(atividadesRef, {
                        respondida: true,
                        correta: respostaServidor === 'Os Códigos São Iguais',
                        mensagem: respostaServidor === 'Os Códigos São Iguais' ? 'Você acertou!' : 'Você errou!',
                    }, { merge: true });


                    // const respostaServidor = response.data.resultado;

                    const respostasAtividades = JSON.parse(localStorage.getItem('respostasAtividades')) || [];
                    const index = respostasAtividades.findIndex(resposta => resposta.idAtividade === idAtividade);

                    if (index !== -1) {
                        respostasAtividades[index] = {
                            idAtividade,
                            respondida: true,
                            correta: respostaServidor === 'Os Códigos São Iguais',
                            mensagem: respostaServidor === 'Os Códigos São Iguais' ? 'Você acertou!' : 'Você errou!',
                        };
                    } else {
                        respostasAtividades.push({
                            idAtividade,
                            respondida: true,
                            correta: respostaServidor === 'Os Códigos São Iguais',
                            mensagem: respostaServidor === 'Os Códigos São Iguais' ? 'Você acertou!' : 'Você errou!',
                        });
                    }

                    localStorage.setItem('respostasAtividades', JSON.stringify(respostasAtividades));

                    mensagemResultado.value = respostaServidor === 'Os Códigos São Iguais' ? 'Você acertou!' : 'Você errou!';
                    mostrarMensagem.value = true;



                    // const respostasAtividades = JSON.parse(localStorage.getItem('respostasAtividades')) || [];

                    // respostasAtividades.push({
                    //     idAtividade,
                    //     respondida: true,
                    //     correta: respostaServidor === 'Os Códigos São Iguais',
                    //     mensagem: respostaServidor === 'Os Códigos São Iguais' ? 'Você acertou!' : 'Você errou!',
                    // });

                    // localStorage.setItem('respostasAtividades', JSON.stringify(respostasAtividades));


                } else {
                    console.error('IDs dos documentos não correspondem');
                }
            } else {
                console.error('Nenhuma respostaAluno encontrada para o ID:', idAtividade);
            }
        } else {
            console.error('Nenhuma atividade encontrada para o ID:', idAtividade);
        }
    } catch (error) {
        console.error('Erro ao acessar o Firestore:', error);
    }
};


// pega o id do realtime database que esta armazenado la
// Função para obter o ID da atividade do Realtime Database percorrendo os nós
const getIDAtividade = async (idAtividade) => {
    const dbRealTime = getDatabase();

    try {
        const atividadesRef = refs(dbRealTime, 'dadosAtividades');
        const atividadesSnapshot = await get(atividadesRef);

        if (atividadesSnapshot.exists()) {
            console.log('atividade snapshot EXISTE', atividadesSnapshot);
            const atividadesData = atividadesSnapshot.val();

            for (const idAtividadeRealtime in atividadesData) {
                console.log('dentro do loop, idAtividadeRealtime', idAtividadeRealtime);
                const atividade = atividadesData[idAtividadeRealtime];
                console.log('atividade aqui', atividade);

                console.log('o que tem no idAtividade?', idAtividade);

                console.log('o que tem no atividade.idAtividade?', atividade.idAtividade);

                if (atividade.idAtividade === idAtividade) {
                    return atividade.idAtividade;
                }
            }

            console.error('Nenhuma correspondência encontrada para o ID da Atividade:', idAtividade);
            return null;

        } else {
            console.error('Nenhuma atividade encontrada no Realtime Database.');
            return null;
        }
    } catch (error) {
        console.error('Erro ao obter o ID da Atividade do Realtime Database:', error);
        throw error;
    }
};

// pega o id do documento atividades do firestore
const getCodigoUnicoAtividade = async () => {
    const dbFirestore = getFirestore();

    try {
        const atividadesRef = collection(dbFirestore, 'atividades');
        const atividadesSnapshot = await getDocs(atividadesRef);

        if (atividadesSnapshot.size > 0) {
            // vai pegar o primeiro da lista do firestore
            const ultimaAtividade = atividadesSnapshot.docs[0];
            console.log('ultima atividade', ultimaAtividade);
            const atividadeData = ultimaAtividade.data();
            console.log('atividade Data', atividadeData);
            return atividadeData.codigoUnico;
        } else {
            console.error('Nenhuma atividade encontrada no Firestore.');
            return null;
        }
    } catch (error) {
        console.error('Erro ao obter o Código Único da Atividade do Firestore:', error);
        throw error;
    }
};


const carregarEstadoAtividade = async (idAtividade) => {
    const respostasAtividadesString = localStorage.getItem('respostasAtividades');

    // Converta a string JSON para um array
    const respostasAtividades = JSON.parse(respostasAtividadesString) || [];

    // Encontre a resposta no array
    const resposta = respostasAtividades.find(resposta => resposta?.idAtividade === idAtividade);

    if (resposta) {
        // Retorna a mensagem associada à idAtividade
        console.log('resposta.mensagem', resposta.mensagem);
        return resposta.mensagem;
    } else {
        // Se não encontrar a resposta, retorna null ou uma mensagem padrão, conforme necessário
        return null;
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

        const idAtividadeFirestore = await getCodigoUnicoAtividade();
        idAtividadeRealtimeGlobal.value = await getIDAtividade(idAtividadeFirestore);
        console.log('idatividadeRealtimeGlobal onMouted', idAtividadeRealtimeGlobal);

        const respostasAtividades = JSON.parse(localStorage.getItem('respostasAtividades')) || [];
        console.log('respostasatividades', respostasAtividades);

        const resposta = respostasAtividades.find(resposta => resposta.idAtividade === idAtividadeRealtimeGlobal.value);
        console.log('resposta', resposta);

        if (resposta) {
            respostaCorreta.value = resposta.correta;
            mensagemResultado.value = resposta.mensagem;
            atividadeRespondida.value = resposta.respondida;
            mostrarMensagem.value = true;
        } else {
            mostrarMensagem.value = false;
        }



        // await carregarEstadoAtividade(idAtividadeRealtimeGlobal);

        // const respostasAtividades = JSON.parse(localStorage.getItem('respostasAtividades')) || [];
        // console.log('RESPOSTAS ATIVIDADES LOCALSTORAGE', respostasAtividades);

        // respostasAtividades.forEach(resposta => {
        //     if (resposta.idAtividade === idAtividadeRealtimeGlobal.value) {
        //         console.log('DENTRO DA RESPOSTA.IDATIVIDADE', resposta.idAtividade);

        //         atividade.respondida = resposta.respondida;
        //         atividade.correta = resposta.correta;
        //         atividade.mensagem = resposta.mensagem;
        //     }
        // });



        // const atividadeLocalStorage = localStorage.getItem('atividades');
        // console.log('atividadeLocalStorage', atividadeLocalStorage);
        // if (atividadeLocalStorage) {
        //     const atividades = JSON.parse(atividadeLocalStorage);
        //     console.log('atividades', atividades);

        //     const atividadeAtual = atividades[idAtividadeRealtimeGlobal.value];
        //     console.log('atividadeAtual', atividadeAtual);

        //     if (atividadeAtual) {
        //         respostaCorreta.value = atividadeAtual.correta;
        //         mensagemResultado.value = atividadeAtual.mensagem;
        //         atividadeRespondida.value = atividadeAtual.respondida;
        //     }
        // }

    } catch (error) {
        console.error('Erro ao buscar a sala:', error);
        // Lide com o erro, por exemplo, redirecione o usuário para uma página de erro.
    }


    return {
        idAtividadeRealtimeGlobal,
        respostaCorreta,
        mensagemResultado,
        atividadeRespondida,
        // ... outras variáveis e métodos que você precisar retornar ...
    };
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
    margin-top: 8px;
}

.fixed-textarea-codigo {
    height: 150px;
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
    margin-bottom: px;
}

.atividade-saida {
    margin-bottom: 10px;
}

.responder-button {
    background-color: #007BFF;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 5px;
}

.botao-desabilitado {
    background-color: #ccc;
    color: #666;
    cursor: not-allowed;
}

.acertou {
    color: green;
}

.errou {
    color: red;
}

.people-icon {
    margin-right: 4px;
}

.book-icon{
    margin-right: 3px;
}

.resposta-icon {
    margin-right: 3px;
}
.atividade-icon {
    margin-right: 3px;
}
</style>


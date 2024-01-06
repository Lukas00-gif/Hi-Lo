import { createStore } from 'vuex';
import { getAuth, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'firebase/auth';

export default createStore({
    state: {
        currentUserEmail: null,
        // atividades: {},
        mensagemResposta: '',
    },
    mutations: {
        // atualiza o status do currentUserEmail de acordo com o setCurrentUserEmail
        // e atuaaliza o estado com o email recebido
        setCurrentUserEmail(state, mail) {
            state.currentUserEmail = mail;
        },

        // pega e att o estado do currentUseEmail para null assim o limpando
        clearCurrentUserEmail(state) {
            state.currentUserEmail = null;
        },

        setMensagemResposta(state, mensagem) {
            state.mensagemResposta = mensagem
        }

        // adicionarAtividade(state, { idAtividade, respondida, correta, mensagem }) {
        //     state.atividades = {
        //         ...state.atividades,
        //         [idAtividade]: { respondida, correta, mensagem }
        //     };
        //     // atualiza os dados novos vindo anteriomente
        //     localStorage.setItem('atividades', JSON.stringify(state.atividades))
        //     console.log('Atividades adicionadas ao localStorage:', state.atividades);
        // },
        
        // setAtividade(state, { idAtividade, respondida, correta, mensagem }) {
        //     state.atividades = {
        //         ...state.atividades,
        //         [String(idAtividade)]: { respondida, correta, mensagem }
        //     };
        //     localStorage.setItem('atividades', JSON.stringify(state.atividades));
        //     console.log('LocalStorage atualizado:', state.atividades);
        // },

    },
    actions: {
        async login({ commit }, { mail, password }) {
            try {
                const auth = getAuth();
                await setPersistence(auth, browserSessionPersistence);
                const userCredential = await signInWithEmailAndPassword(auth, mail, password);
                const user = userCredential.user;
                commit('setCurrentUserEmail', user.email);

                // Armazena o estado do usuário logado no localStorage
                localStorage.setItem('currentUser   Email', user.email);


            } catch (error) {
                console.error('Erro durante o login:', error);
                throw error;
            }
        },
        async logout({ commit }) {
            try {
                const auth = getAuth();
                await signOut(auth);
                commit('clearCurrentUserEmail');

            } catch (error) {
                console.error('Erro durante o logout:', error);
                throw error;
            }
        },

        // async marcarAtividadeRespondida({ commit }, { idAtividade, respondida, correta, mensagem }) {
        //     // recebe os dados e manda para o setAtividade
        //     commit('setAtividade', { idAtividade, respondida, correta, mensagem });
        // },
    },
    getters: {
        currentUserEmail: state => state.currentUserEmail,
        // atividades: state => state.atividades,
    }
});


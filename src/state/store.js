import { createStore } from 'vuex';
import { getAuth, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'firebase/auth';

export default createStore({
    state: {
        currentUserEmail: null
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
        }
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
                localStorage.setItem('currentUserEmail', user.email);

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
        }
    },
    getters: {
        currentUserEmail: state => state.currentUserEmail
    }
});


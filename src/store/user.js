import { createStore } from "vuex";

export default createStore({
    // define o estado inicial do store no caso eu quero pegar o array users do localstorage
    state: {
        users: JSON.parse(localStorage.getItem('users')) || []
    },
    // vai ser quantas vai se as alteraçoes que podem ser execultadas
    mutations: {
        // definir o setUser que vai add um usuario ao users
        setUser(state, user) {
            // add o user recebido como paramentro no array
            state.users.push(user);
        }
    }
});




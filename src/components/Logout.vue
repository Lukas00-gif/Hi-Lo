<template>
    <!-- <button @click="logout">Logout</button> -->
    <ul>
        <li><a @click="logout">Sair</a></li>
    </ul>
</template>

<script>
import { getAuth, signOut } from 'firebase/auth';
import { mapActions } from 'vuex';

import store from '../state/store';


export default {
    name: 'LogoutButton',

    methods: {
        logout() {
            const auth = getAuth();

            signOut(auth)
                .then(() => {
                    store.commit('clearCurrentUserEmail');
                    this.$router.push('/');
                })
                .catch((error) => {
                    console.error('Erro durante o logout:', error);
                    //erro
                });
        },
    },
}

</script>

<style scoped>
ul {
    display: flex;
    list-style: none;
    margin: 0;
    margin-right: 50px;
    padding: 0;
}

li {
    margin-left: 1rem;
}

a {
    color: #fff;
    text-decoration: none;
    cursor: pointer;
}
</style>

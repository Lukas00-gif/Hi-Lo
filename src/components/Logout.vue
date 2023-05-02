<template>
    <!-- <button @click="logout">Logout</button> -->
    <ul>
        <li><a @click="logout">Sair</a></li>
    </ul>
</template>

<script>
    export default {
        name: 'LogoutButton',

        methods: {
            logout() {
                // Limpa o email do usuário atual do localStorage
                localStorage.removeItem('currentUserEmail');

                // Redireciona o usuário para a página de login
                this.$router.push('/');
            }
        }
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

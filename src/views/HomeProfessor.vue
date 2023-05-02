<template>
    <div>
        <nav class="navbar">
            <h3>Codinome HI-LO</h3>
            <ul>
                <li><a href="/home-professor">Home</a></li>
                <li><a href="#">Perfil</a></li>
                <li><a href="/">Sair</a></li>
            </ul>
            <span>Bem-vindo(a) Professor {{ currentUser.fistName }} {{ currentUser.lastName }}</span>
        </nav>

        <h1>Area do Professor</h1>

        <footer>
            <p>&copy; 2023 | HI-LO</p>
        </footer>
    </div>
</template>

<script>

export default {
    name: 'NavBar',

    computed: {
        currentUser() {
            // criar o users de acordo com o parse do armazenado no localstorage chamado 'users'
            // se n tiver ele inicia vazio
            const users = JSON.parse(localStorage.getItem('users')) || [];
            // cria uma variavel que pega o parse do armazenamento no localstorage chamado 'currentUserEmail'
            // se n tiveer ele incia sozinho
            const currentUserEmail = JSON.parse(localStorage.getItem('currentUserEmail')) || '';
            // cria uma variavel que vai buscar no o array users(local storage) onde o user.mail do 
            // cadastro e igual ao email que foi fornecido
            const currentUser = users.find(user => user.mail === currentUserEmail);
            // caso nao enconte nada retorna o objeto vazio
            return currentUser || {};
        }
    }
};
</script>

<style scoped>
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
    color: #fff;
    text-decoration: none;
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


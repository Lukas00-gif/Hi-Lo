import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

export async function buscarDetalhesDoUsuarioPorEmail(email) {
    try {
        const db = getFirestore();
        const usuariosCollectionRef = collection(db, 'users');
        const q = query(usuariosCollectionRef, where('email', '==', email));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const usuarioDoc = querySnapshot.docs[0];
            const userData = usuarioDoc.data();
            console.log('Detalhes do usuário encontrado:', userData);
            return userData;
        } else {
            console.error('Nenhum usuário com o email', email, 'foi encontrado.');
            return null; // Retornar null se nenhum usuário com o email for encontrado
        }
    } catch (error) {
        console.error('Erro ao buscar detalhes do usuário por email:', error);
        return null;
    }
}



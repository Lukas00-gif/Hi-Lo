import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Função para buscar a sala pelo código
export async function buscarSalaPeloCodigo(codigoSala) {
    const db = getFirestore();
    const docRef = doc(db, 'salas', codigoSala);

    try {
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
            // Se o documento da sala existe, retornamos os dados
            return docSnapshot.data();
        } else {
            throw new Error('Sala não encontrada');
        }
    } catch (error) {
        throw error;
    }
}

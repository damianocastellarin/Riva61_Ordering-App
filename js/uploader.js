import { prodottiDaCaricare } from "./dati-da-caricare.js";

export async function avviaCaricamento(uid) {
    if (!uid) return alert("UID non valido!");
    
    const db = window.fb.db;
    const collection = window.fb.collection;
    const addDoc = window.fb.addDoc;

    console.log(`Inizio caricamento per il bar: ${uid}...`);

    try {
        for (const p of prodottiDaCaricare) {
            await addDoc(collection(db, "bars", uid, "prodotti"), {
                nome: p.nome,
                categoria: p.categoria,
                fornitore: p.fornitore
            });
            console.log(`Caricato: ${p.nome}`);
        }
        alert("Caricamento completato con successo!");
    } catch (error) {
        console.error("Errore durante il caricamento:", error);
        alert("Errore! Controlla la console.");
    }
}
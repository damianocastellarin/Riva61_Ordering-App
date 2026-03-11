/**
 * Genera il testo formattato per l'ordine basandosi sulle risposte dell'utente
 * @param {Object} risposte - Lo stato delle quantità {nomeProdotto: qta}
 * @param {Array} prodottiScaricati - La lista completa dei prodotti dal DB
 */
export function generaMessaggio(risposte, prodottiScaricati) {
    if (!prodottiScaricati || prodottiScaricati.length === 0) return "Errore: Dati prodotti mancanti.";
    
    let messaggio = "*RIEPILOGO ORDINI BAR*\n\n";
    
    const tuttiFornitori = [...new Set(prodottiScaricati.map(p => p.fornitore || "Senza Fornitore"))];

    let ordinePresente = false;

    tuttiFornitori.forEach(fornitore => {
        const prodottiOrdinatiFornitore = prodottiScaricati.filter(p => {
            const qta = parseInt(risposte[p.nome], 10) || 0;
            return p.fornitore === fornitore && qta > 0;
        });

        if (prodottiOrdinatiFornitore.length > 0) {
            ordinePresente = true;
            messaggio += `*${fornitore.toUpperCase()}*\n`;
            
            prodottiOrdinatiFornitore.forEach(p => {
                const qta = risposte[p.nome];
                messaggio += `• ${qta} x ${p.nome}\n`;
            });
            
            messaggio += "\n";
        }
    });

    return ordinePresente ? messaggio.trim() : "Nessun prodotto selezionato.";
}
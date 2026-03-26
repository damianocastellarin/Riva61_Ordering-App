/**
 * Genera il testo formattato per l'ordine.
 * @param {Object} risposte        - { nomeProdotto: quantità }
 * @param {Array}  prodottiScaricati - lista completa dal DB (ogni item ha .nome, .unita, .fornitore)
 */
export function generaMessaggio(risposte, prodottiScaricati) {
    if (!prodottiScaricati || prodottiScaricati.length === 0) {
        return "Errore: Dati prodotti mancanti.";
    }

    let messaggio = "*RIEPILOGO ORDINI BAR*\n\n";

    const tuttiFornitori = [
        ...new Set(prodottiScaricati.map(p => p.fornitore || "Senza Fornitore"))
    ];

    let ordinePresente = false;

    tuttiFornitori.forEach(fornitore => {
        const prodottiOrdinati = prodottiScaricati.filter(p => {
            const qta = parseInt(risposte[p.nome], 10) || 0;
            return p.fornitore === fornitore && qta > 0;
        });

        if (prodottiOrdinati.length > 0) {
            ordinePresente = true;
            messaggio += `*${fornitore.toUpperCase()}*\n`;

            prodottiOrdinati.forEach(p => {
                const qta = risposte[p.nome];
                const unitaStr = p.unita ? ` ${p.unita}` : '';
                messaggio += `• ${qta}${unitaStr} x ${p.nome}\n`;
            });

            messaggio += "\n";
        }
    });

    return ordinePresente ? messaggio.trim() : "Nessun prodotto selezionato.";
}
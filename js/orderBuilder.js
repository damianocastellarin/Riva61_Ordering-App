/**
 * @param {Object} risposte - Oggetto { nomeProdotto: quantità }
 * @param {Array} prodottiScaricati - Lista prodotti dal DB (.nome, .unita, .fornitore)
 */
export function generaMessaggio(risposte, prodottiScaricati) {
    if (!prodottiScaricati || prodottiScaricati.length === 0) {
        return "Errore: Dati prodotti mancanti.";
    }

    let messaggio = "*RIEPILOGO ORDINI BAR*\n\n";

    const normalizza = (name) => (name || "Senza Fornitore").trim().toUpperCase();

    const fornitoriUnici = [
        ...new Set(prodottiScaricati.map(p => normalizza(p.fornitore)))
    ];

    let ordinePresente = false;

    fornitoriUnici.forEach(fornNorm => {
        const prodottiOrdinati = prodottiScaricati.filter(p => {
            const qta = parseInt(risposte[p.nome], 10) || 0;
            return normalizza(p.fornitore) === fornNorm && qta > 0;
        });

        if (prodottiOrdinati.length > 0) {
            ordinePresente = true;
            
            messaggio += `*${fornNorm}*\n`;

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
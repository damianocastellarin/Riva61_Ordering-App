import { PRODOTTI } from "../data/prodotti.js";
import { FORNITORI } from "../data/fornitori.js";

export function generaMessaggio(risposte) {
  let messaggio = "*RIEPILOGO ORDINI BAR*\n\n";
  let ordinePresente = false;

  FORNITORI.forEach(f => {
    const prodottiF = PRODOTTI.filter(p => p.fornitore === f.id);
    const prodottiTesto = prodottiF
      .map(p => {
        const qta = risposte[p.id] || 0;
        return qta > 0 ? `• ${qta} x ${p.nome}` : null;
      })
      .filter(x => x);

    if (prodottiTesto.length > 0) {
      ordinePresente = true;
      messaggio += `*${f.nome.toUpperCase()}*\n${prodottiTesto.join("\n")}\n\n`;
    }
  });

  return ordinePresente ? messaggio.trim() : "Nessun prodotto selezionato.";
}
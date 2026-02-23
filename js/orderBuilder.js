import { PRODOTTI } from "../data/prodotti.js";
import { FORNITORI } from "../data/fornitori.js";

export function generaMessaggio(risposte) {
  let messaggio = "";

  FORNITORI.forEach(f => {
    const prodottiF = PRODOTTI.filter(p => p.fornitore === f.id);
    const prodottiTesto = prodottiF
      .map(p => {
        const qta = risposte[p.id] || 0;
        return qta > 0 ? `${p.nome} ${qta}` : null;
      })
      .filter(x => x);

    if (prodottiTesto.length > 0) {
      messaggio += `${f.nome}:\n${prodottiTesto.join(", ")}\n\n`;
    }
  });

  return messaggio.trim();
}
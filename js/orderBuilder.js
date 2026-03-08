export function generaMessaggio(risposte) {
  let messaggio = "*RIEPILOGO ORDINI BAR*\n\n";
  const prodottiScaricati = window.mappaProdottiCompleta || [];
  
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
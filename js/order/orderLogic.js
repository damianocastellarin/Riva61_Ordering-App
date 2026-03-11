export const orderLogic = {
    prepareCategories(prodottiScaricati) {
        if (!prodottiScaricati || prodottiScaricati.length === 0) return [];
        
        const nomiCategorie = [...new Set(prodottiScaricati.map(p => p.categoria))];
        
        return nomiCategorie.map(nomeCat => ({
            nome: nomeCat,
            prodotti: prodottiScaricati
                .filter(p => p.categoria === nomeCat)
                .map(p => p.nome)
        }));
    }
};
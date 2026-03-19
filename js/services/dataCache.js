export const dataCache = {
    _barId:     null,
    _prodotti:  null,
    _categorie: null,

    set(barId, prodotti, categorie) {
        this._barId     = barId;
        this._prodotti  = prodotti;
        this._categorie = categorie;
    },

    get(barId) {
        if (this._barId === barId && this._prodotti !== null) {
            return { prodotti: this._prodotti, categorie: this._categorie };
        }
        return null;
    },

    clear() {
        this._barId     = null;
        this._prodotti  = null;
        this._categorie = null;
    }
};
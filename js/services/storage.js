const STORAGE_KEY = "ordine_bar_salvato";

export const storageService = {
    saveOrder(state) {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error("Errore nel salvataggio storage:", e);
        }
    },

    loadOrder() {
        const data = sessionStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    clearOrder() {
        sessionStorage.removeItem(STORAGE_KEY);
    }
};
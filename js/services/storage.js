const STORAGE_KEY = "ordine_bar_salvato";

export const storageService = {
    saveOrder(state) {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
        }
    },

    loadOrder() {
        try {
            const data = sessionStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            sessionStorage.removeItem(STORAGE_KEY);
            return null;
        }
    },

    clearOrder() {
        sessionStorage.removeItem(STORAGE_KEY);
    }
};
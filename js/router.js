export const router = {
    routes: {},

    add(hash, callback) {
        this.routes[hash] = callback;
    },

    navigate(hash) {
        window.location.hash = hash;
    },

    handleRoute() {
        const hash = window.location.hash || '#home';
        const callback = this.routes[hash];
        if (callback) {
            callback();
        } else {
            console.warn("Rotta non trovata, vado alla home");
            this.navigate('#home');
        }
    },

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }
};

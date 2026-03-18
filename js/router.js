export const router = {
    routes: {},
    isInitialized: false,

    add(hash, callback) {
        this.routes[hash] = callback;
    },

    navigate(hash) {
        if (window.location.hash === hash) {
            this.handleRoute();
        } else {
            window.location.hash = hash;
        }
    },

    replace(hash) {
        const url = new URL(window.location);
        url.hash = hash;
        window.location.replace(url.href);
        this.handleRoute();
    },

    handleRoute() {
        const hash = window.location.hash || '#home';        
        const callback = this.routes[hash];
        if (callback) {
            callback();
        } else {
            console.warn("[Router] Nessuna vista trovata per", hash);
        }
    },

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        window.addEventListener('hashchange', () => this.handleRoute());
        
        setTimeout(() => this.handleRoute(), 50);
    }
};
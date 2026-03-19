export const router = {
    routes: {},
    isInitialized: false,

    add(hash, callback) {
        this.routes[hash] = callback;
    },

    navigate(hash) {
        if (window.location.hash !== hash) {
            window.location.hash = hash;
        } else {
            this.handleRoute();
        }
    },

    replace(hash) {
        window.location.replace(window.location.origin + window.location.pathname + hash);
        this.handleRoute();
    },

    handleRoute() {
        const fullHash = window.location.hash || '#home';

        if (this.routes[fullHash]) {
            this.routes[fullHash]();
            return;
        }

        const parts = fullHash.split('/');
        const baseHash = parts[0];
        const param = parts.slice(1).join('/');
        
        const callback = this.routes[baseHash];
        if (callback) {
            callback(param); 
        } else {
            console.warn("[Router] Percorso non trovato:", fullHash);
            this.replace('#home');
        }
    },

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        window.addEventListener('hashchange', () => this.handleRoute());
        
        setTimeout(() => this.handleRoute(), 50);
    }
};
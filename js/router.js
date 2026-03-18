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
        const [baseHash, param] = fullHash.split('/');
        
        const callback = this.routes[baseHash];
        if (callback) {
            callback(param); 
        } else {
            console.warn("[Router] Percorso non trovato:", baseHash);
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
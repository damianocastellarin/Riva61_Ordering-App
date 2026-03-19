export const router = {
    routes: {},
    isInitialized: false,
    _routeId: 0,

    add(hash, callback) {
        this.routes[hash] = callback;
    },

    currentRouteId() {
        return this._routeId;
    },

    navigate(hash) {
        if (window.location.hash !== hash) {
            window.location.hash = hash;
        } else {
            this.handleRoute();
        }
    },

    replace(hash) {
        const newUrl = window.location.origin + window.location.pathname + hash;
        if (window.location.href !== newUrl) {
            window.location.replace(newUrl);
        } else {
            this.handleRoute();
        }
    },

    handleRoute() {
        this._routeId++;

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
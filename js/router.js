export const router = {
    routes: {},
    isInitialized: false,
    userRole: null,

    setUserRole(role) {
        this.userRole = role;
    },

    add(hash, callback, requiredRole = null) {
        this.routes[hash] = { callback, requiredRole };
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
        
        const parts = fullHash.split('/');
        const baseHash = parts[0];
        const param = parts.slice(1).join('/');

        const routeConfig = this.routes[baseHash];

        if (routeConfig) {
            if (routeConfig.requiredRole) {
                if (routeConfig.requiredRole === 'superadmin' && this.userRole !== 'superadmin') {
                    console.warn("Accesso negato: rotta riservata al Superadmin.");
                    return this.replace(this.userRole === 'admin' ? '#admin/choice' : '#home');
                }
                if (routeConfig.requiredRole === 'admin' && !['admin', 'superadmin'].includes(this.userRole)) {
                    console.warn("Accesso negato: rotta riservata agli Admin.");
                    return this.replace('#home');
                }
            }
            
            routeConfig.callback(param);
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
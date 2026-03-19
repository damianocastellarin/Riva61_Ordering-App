export const session = {
    role:     null,   // 'superadmin' | 'admin' | 'user' | null
    barId:    null,
    barName:  null,

    set(role, barId = null, barName = null) {
        this.role    = role;
        this.barId   = barId;
        this.barName = barName;
    },

    clear() {
        this.role    = null;
        this.barId   = null;
        this.barName = null;
    },

    isSuperAdmin() {
        return this.role === 'superadmin';
    },

    isAnyAdmin() {
        return this.role === 'superadmin' || this.role === 'admin';
    }
};
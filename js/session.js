export const session = {
    role:     null,
    barId:    null,
    barName:  null,
    email:    null,

    set(role, barId = null, barName = null, email = null) {
        this.role    = role;
        this.barId   = barId;
        this.barName = barName;
        this.email   = email;
    },

    clear() {
        this.role    = null;
        this.barId   = null;
        this.barName = null;
        this.email   = null;
    },

    isSuperAdmin() {
        return this.role === 'superadmin';
    },

    isAnyAdmin() {
        return this.role === 'superadmin' || this.role === 'admin';
    }
};
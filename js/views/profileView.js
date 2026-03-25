import { session } from '../session.js';
import { appNavigator } from '../appNavigator.js';
import { getIconHTML } from '../icons.js';

export const profileView = {
    render() {
        appNavigator.goTo('PROFILE');

        const container = document.getElementById('profile');
        if (!container) return;

        const roleLabel = _getRoleLabel(session.role);

        container.innerHTML = `
            <div class="profile-card">
                <div class="profile-avatar">
                    ${getIconHTML('profile')}
                </div>
                <h2 class="profile-bar-name">
                    ${session.barName || 'Bar'}
                </h2>
                <span class="profile-role-badge">${roleLabel}</span>
                ${session.email
                    ? `<p class="profile-email">${session.email}</p>`
                    : ''}
            </div>
            <div class="profile-actions">
                <button id="logoutBtn" class="btn-danger">
                    ${getIconHTML('logout')} Esci dall'account
                </button>
            </div>
        `;
    }
};

function _getRoleLabel(role) {
    switch (role) {
        case 'superadmin': return 'Super Amministratore';
        case 'admin':      return 'Amministratore';
        default:           return 'Utente';
    }
}
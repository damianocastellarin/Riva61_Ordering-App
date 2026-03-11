import { ui } from '../ui.js';
import { dbService } from '../services/db.js';

export const adminActions = {
    async deleteProduct(barId, productId, callback) {
        if (!confirm("Eliminare prodotto?")) return;
        ui.showLoader();
        await dbService.deleteProduct(barId, productId);
        if (callback) callback();
        ui.hideLoader();
    },

    async deleteBar(barId, callback) {
        if (!confirm("Eliminare bar e dati?")) return;
        ui.showLoader();
        await dbService.deleteBar(barId);
        if (callback) callback();
        ui.hideLoader();
    },

    goToOrders(barId) {
        document.getElementById('admin-content').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        window.dispatchEvent(new CustomEvent('auth-success', { detail: { barId } }));
    }
};
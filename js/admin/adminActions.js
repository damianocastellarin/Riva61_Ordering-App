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

    async deleteCategory(barId, categoryName, callback) {
        if (!confirm(`ATTENZIONE: Eliminando la categoria "${categoryName}" eliminerai anche TUTTI i prodotti al suo interno. Procedere?`)) return;
        ui.showLoader();
        try {
            await dbService.deleteCategory(barId, categoryName);
            ui.showToast("Categoria eliminata");
            if (callback) callback();
        } catch (e) {
            alert("Errore nell'eliminazione");
        } finally {
            ui.hideLoader();
        }
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
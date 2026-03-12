import { ui } from '../ui.js';
import { dbService } from '../services/db.js';

export const adminActions = {
    async deleteProduct(barId, productId, callback) {
        if (!confirm("Eliminare prodotto?")) return;
        ui.showLoader();
        try {
            await dbService.deleteProduct(barId, productId);
            ui.showToast("Prodotto eliminato");
            if (callback) callback();
        } catch (e) {
            alert("Errore nell'eliminazione");
        } finally {
            ui.hideLoader();
        }
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
        if (!confirm("Eliminare bar e tutti i dati associati?")) return;
        ui.showLoader();
        try {
            await dbService.deleteBar(barId);
            ui.showToast("Bar eliminato");
            if (callback) callback();
        } catch (e) {
            alert("Errore nell'eliminazione");
        } finally {
            ui.hideLoader();
        }
    },

    goToOrders(barId) {
        document.getElementById('admin-content').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        window.dispatchEvent(new CustomEvent('auth-success', { detail: { barId } }));
    }
};
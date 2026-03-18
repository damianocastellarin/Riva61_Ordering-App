import { ui } from '../ui.js';
import { dbService } from '../services/db.js';
import { router } from '../router.js';

export const adminActions = {
    async deleteProduct(barId, productId) {
        if (!confirm("Eliminare prodotto?")) return;
        ui.showLoader();
        try {
            await dbService.deleteProduct(barId, productId);
            ui.showToast("Prodotto eliminato");
            router.handleRoute(); 
        } catch (e) {
            alert("Errore nell'eliminazione");
        } finally {
            ui.hideLoader();
        }
    },

    async deleteCategory(barId, categoryName) {
        if (!confirm(`ATTENZIONE: Eliminando "${categoryName}" cancellerai tutti i prodotti contenuti. Procedere?`)) return;
        ui.showLoader();
        try {
            await dbService.deleteCategory(barId, categoryName);
            ui.showToast("Categoria eliminata");
            router.navigate('#admin/categories');
        } catch (e) {
            alert("Errore nell'eliminazione");
        } finally {
            ui.hideLoader();
        }
    },

    async deleteBar(barId) {
        if (!confirm("Eliminare definitivamente questo Bar (Admin)?")) return;
        ui.showLoader();
        try {
            await dbService.deleteBar(barId);
            ui.showToast("Bar eliminato");
            router.navigate('#admin/bars');
        } catch (e) {
            console.error(e);
            alert("Errore nell'eliminazione del Bar");
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
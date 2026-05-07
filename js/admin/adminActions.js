import { ui } from '../ui.js';
import { dbService } from '../services/db.js';
import { router } from '../router.js';
import { dataCache } from '../services/dataCache.js';
import { networkService } from '../services/networkService.js';

export const adminActions = {
    async deleteProduct(barId, productId) {
        if (!confirm("Eliminare prodotto?")) return;

        const isOnline = await networkService.isOnline();
        if (!isOnline) {
            alert("⚠️ Sei offline. Il prodotto verrà rimosso localmente e la modifica sarà sincronizzata appena tornerai online.");
        }

        ui.showLoader();
        try {
            await dbService.deleteProduct(barId, productId);
            dataCache.clear();
            if (isOnline) ui.showToast("Prodotto eliminato");
            router.handleRoute();
        } catch (e) {
            alert("Errore nell'eliminazione");
        } finally {
            ui.hideLoader();
        }
    },

    async deleteCategory(barId, categoryName) {
        if (!confirm(`ATTENZIONE: Eliminando "${categoryName}" cancellerai tutti i prodotti contenuti. Procedere?`)) return;

        const isOnline = await networkService.isOnline();

        if (!isOnline) {
            alert("⚠️ Sei offline. La categoria e i relativi prodotti verranno rimossi localmente. La sincronizzazione avverrà al ritorno della connessione.");
        }

        ui.showLoader();
        try {
            await dbService.deleteCategory(barId, categoryName);
            dataCache.clear();
            if (isOnline) ui.showToast("Categoria eliminata");
            router.navigate('#admin/categories');
        } catch (e) {
            alert("Errore nell'eliminazione");
        } finally {
            ui.hideLoader();
        }
    },

    async deleteBar(barId) {
        if (!confirm("Eliminare definitivamente questo Bar (Admin)?")) return;

        const isOnline = await networkService.isOnline();

        if (!isOnline) {
            alert("⚠️ Sei offline. L'azione è salvata localmente e il Bar verrà rimosso dal database appena tornerai online.");
        }

        ui.showLoader();
        try {
            await dbService.deleteBar(barId);
            dataCache.clear();
            if (isOnline) ui.showToast("Bar eliminato");
            router.navigate('#admin/bars');
        } catch (e) {
            alert("Errore nell'eliminazione del Bar");
        } finally {
            ui.hideLoader();
        }
    }
};
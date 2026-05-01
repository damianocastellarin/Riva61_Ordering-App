import { state } from "./state.js";
import { ui } from "./ui.js";
import { storageService } from "./services/storage.js";
import { dbService } from "./services/db.js";
import { router } from "./router.js";
import { dataCache } from "./services/dataCache.js";

import { orderView } from "./views/orderView.js";
import { orderCompleteView } from "./views/orderCompleteView.js";
import { orderSummaryView } from "./views/orderSummaryView.js";
import { profileView } from "./views/profileView.js";

let CATEGORIE_DINAMICHE = [];
let PRODOTTI_DATA       = [];
let isLoadingAuth       = false;
let isRouterInitialized = false;

ui.initAdminButtons();

router.add('#step',           (param) => orderView.render(CATEGORIE_DINAMICHE, param));
router.add('#order-complete', ()      => orderCompleteView.render(CATEGORIE_DINAMICHE));
router.add('#order-summary',  ()      => orderSummaryView.render(PRODOTTI_DATA, CATEGORIE_DINAMICHE));
router.add('#profile',        ()      => profileView.render());

window.addEventListener('auth-success', async (e) => {
    if (isLoadingAuth) return;
    isLoadingAuth = true;

    try {
        ui.showLoader();
        const barId = e.detail.barId;

        const cached = dataCache.get(barId);
        if (cached) {
            PRODOTTI_DATA       = cached.prodotti;
            CATEGORIE_DINAMICHE = cached.categorie;
        } else {
            PRODOTTI_DATA       = await dbService.getProducts(barId);
            CATEGORIE_DINAMICHE = _prepareCategories(PRODOTTI_DATA);
            dataCache.set(barId, PRODOTTI_DATA, CATEGORIE_DINAMICHE);
        }

        if (!isRouterInitialized) {
            router.init();
            isRouterInitialized = true;
        }

        const backup = storageService.loadOrder();
        
        if (backup && CATEGORIE_DINAMICHE.length > 0) {
            Object.assign(state, backup);
            
            if (state.stepIndex >= CATEGORIE_DINAMICHE.length) {
                router.replace('#order-complete');
            } else {
                router.replace(`#step/${state.stepIndex}`);
            }
        } else {
            router.replace('#order-summary');
        }

    } catch (error) {
        alert("Si è verificato un errore nel caricamento dei prodotti.");
    } finally {
        isLoadingAuth = false;
        ui.hideLoader();
    }
});

function _prepareCategories(prodottiScaricati) {
    if (!prodottiScaricati || prodottiScaricati.length === 0) return [];
    
    const nomiCategorie = [...new Set(prodottiScaricati.map(p => p.categoria))];
    
    return nomiCategorie.map(nomeCat => ({
        nome:     nomeCat,
        prodotti: prodottiScaricati
            .filter(p => p.categoria === nomeCat)
            .map(p => ({ 
                nome:      p.nome, 
                unita:     p.unita || '',
                fornitore: p.fornitore || '',
                categoria: p.categoria
            }))
    }));
}
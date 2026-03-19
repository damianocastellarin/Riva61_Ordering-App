import { state } from "./state.js";
import { ui } from "./ui.js";
import { storageService } from "./services/storage.js";
import { dbService } from "./services/db.js";
import { router } from "./router.js";
import { dataCache } from "./services/dataCache.js";

import { homeView } from "./views/homeView.js";
import { orderView } from "./views/orderView.js";
import { summaryView } from "./views/summaryView.js";

let CATEGORIE_DINAMICHE = [];
let PRODOTTI_DATA       = [];
let isLoadingAuth       = false;

ui.initAdminButtons();

router.add('#home',      ()      => homeView.render(CATEGORIE_DINAMICHE));
router.add('#step',      (param) => orderView.render(CATEGORIE_DINAMICHE, param));
router.add('#riepilogo', ()      => summaryView.render(PRODOTTI_DATA, CATEGORIE_DINAMICHE));

window.addEventListener('auth-success', async (e) => {
    if (isLoadingAuth) return;
    isLoadingAuth = true;

    try {
        ui.showLoader();
        const barId    = e.detail.barId;
        const skipHome = e.detail.skipHome === true;

        const cached = dataCache.get(barId);
        if (cached) {
            PRODOTTI_DATA       = cached.prodotti;
            CATEGORIE_DINAMICHE = cached.categorie;
        } else {
            PRODOTTI_DATA       = await dbService.getProducts(barId);
            CATEGORIE_DINAMICHE = _prepareCategories(PRODOTTI_DATA);
            dataCache.set(barId, PRODOTTI_DATA, CATEGORIE_DINAMICHE);
        }

        const backup = storageService.loadOrder();
        if (backup && CATEGORIE_DINAMICHE.length > 0) {
            Object.assign(state, backup);
            if (state.stepIndex >= CATEGORIE_DINAMICHE.length) {
                router.replace('#riepilogo');
            } else {
                router.replace(`#step/${state.stepIndex}`);
            }
        } else if (skipHome && CATEGORIE_DINAMICHE.length > 0) {
            state.stepIndex = 0;
            state.risposte  = {};
            router.replace('#step/0');
        } else {
            router.replace('#home');
        }
    } catch (error) {
        console.error("Errore inizializzazione utente:", error);
    } finally {
        isLoadingAuth = false;
        ui.hideLoader();
    }
});

router.init();

function _prepareCategories(prodottiScaricati) {
    if (!prodottiScaricati || prodottiScaricati.length === 0) return [];
    const nomiCategorie = [...new Set(prodottiScaricati.map(p => p.categoria))];
    return nomiCategorie.map(nomeCat => ({
        nome: nomeCat,
        prodotti: prodottiScaricati
            .filter(p => p.categoria === nomeCat)
            .map(p => p.nome)
    }));
}
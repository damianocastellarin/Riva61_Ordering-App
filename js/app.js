import { state } from "./state.js";
import { ui } from "./ui.js";
import { storageService } from "./services/storage.js";
import { dbService } from "./services/db.js";
import { orderLogic } from "./order/orderLogic.js";
import { router } from "./router.js";

import { homeView } from "./views/homeView.js";
import { orderView } from "./views/orderView.js";
import { summaryView } from "./views/summaryView.js";

let CATEGORIE_DINAMICHE = [];
let PRODOTTI_DATA = [];

ui.initAdminButtons();

router.add('#home', () => homeView.render(CATEGORIE_DINAMICHE));
router.add('#step', (param) => orderView.render(CATEGORIE_DINAMICHE, param));
router.add('#riepilogo', () => summaryView.render(PRODOTTI_DATA, CATEGORIE_DINAMICHE));

window.addEventListener('auth-success', async (e) => {
    try {
        ui.showLoader();
        
        document.getElementById('admin-content').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');

        PRODOTTI_DATA = await dbService.getProducts(e.detail.barId);
        CATEGORIE_DINAMICHE = orderLogic.prepareCategories(PRODOTTI_DATA);
        
        const backup = storageService.loadOrder();
        
        if (backup && CATEGORIE_DINAMICHE.length > 0) {
            Object.assign(state, backup);
            if (state.stepIndex >= CATEGORIE_DINAMICHE.length) {
                router.replace('#riepilogo');
            } else {
                router.replace(`#step/${state.stepIndex}`);
            }
        } else {
            router.replace('#home');
        }
    } catch (error) {
        console.error("Errore inizializzazione utente:", error);
    } finally {
        ui.hideLoader();
    }
});

router.init();
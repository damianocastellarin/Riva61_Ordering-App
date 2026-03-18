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
router.add('#step', () => orderView.render(CATEGORIE_DINAMICHE));
router.add('#riepilogo', () => summaryView.render(PRODOTTI_DATA, CATEGORIE_DINAMICHE));

window.addEventListener('auth-success', async (e) => {
    try {
        ui.showLoader();
        PRODOTTI_DATA = await dbService.getProducts(e.detail.barId);
        CATEGORIE_DINAMICHE = orderLogic.prepareCategories(PRODOTTI_DATA);
        
        const backup = storageService.loadOrder();
        if (backup && CATEGORIE_DINAMICHE.length > 0) {
            Object.assign(state, backup);
            const targetHash = state.stepIndex >= CATEGORIE_DINAMICHE.length ? '#riepilogo' : '#step';
            router.navigate(targetHash);
        } else {
            router.navigate('#home');
        }
        router.init();
    } catch (error) {
        console.error("Errore init:", error);
    } finally {
        ui.hideLoader();
    }
});
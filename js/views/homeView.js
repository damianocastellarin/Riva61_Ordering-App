import { router } from "../router.js";
import { resetState, hasActiveOrder } from "../state.js";
import { storageService } from "../services/storage.js";
import { appNavigator } from "../appNavigator.js";
import { dataCache } from "../services/dataCache.js";

export const homeView = {
    render(categorieDisponibili) {
        appNavigator.goTo('HOME');
        
        const startBtn = document.getElementById("startBtn");
        if (!startBtn) return;

        startBtn.onclick = () => {
            if (categorieDisponibili.length === 0) {
                alert("Caricamento prodotti in corso... Riprova tra un istante.");
                return;
            }

            if (hasActiveOrder()) {
                const conferma = confirm("Hai già un ordine in corso. Iniziandone uno nuovo, quello attuale verrà cancellato. Vuoi procedere?");
                if (!conferma) return;
            }

            dataCache.clear();

            resetState();
            storageService.clearOrder();

            const barId = localStorage.getItem("lastBarId");
            window.dispatchEvent(new CustomEvent('auth-success', { detail: { barId } }));
            
        };
    }
};
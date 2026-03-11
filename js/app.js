import { state, resetState } from "./state.js";
import { renderStep, ui } from "./ui.js";
import { storageService } from "./services/storage.js";
import { dbService } from "./services/db.js";
import { navigator } from "./order/navigator.js";
import { orderActions } from "./order/orderActions.js";
import { orderLogic } from "./order/orderLogic.js";
import { generaMessaggio } from "./orderBuilder.js";

let CATEGORIE_DINAMICHE = [];
const messaggioFinale = document.getElementById("messaggioFinale");

ui.initAdminButtons(); 

window.addEventListener('auth-success', async (e) => {
    try {
        const prodotti = await dbService.getProducts(e.detail.barId);
        CATEGORIE_DINAMICHE = orderLogic.prepareCategories(prodotti);
        
        if (CATEGORIE_DINAMICHE.length === 0) {
            console.warn("Nessun prodotto trovato per questo bar.");
        }

        const backup = storageService.loadOrder();
        if (backup && CATEGORIE_DINAMICHE.length > 0) {
            Object.assign(state, backup);
            if (state.stepIndex >= CATEGORIE_DINAMICHE.length) {
                mostraRiepilogo();
            } else {
                navigator.goTo('STEP');
                renderStep(state, CATEGORIE_DINAMICHE);
            }
        } else {
            navigator.goTo('HOME');
        }
    } catch (error) {
        console.error("Errore nel caricamento iniziale:", error);
    }
});

document.getElementById("startBtn").onclick = () => {
    if (CATEGORIE_DINAMICHE.length === 0) {
        alert("Attenzione: Lista prodotti vuota o ancora in caricamento.");
        return;
    }
    resetState();
    state.stepIndex = 0;
    navigator.goTo('STEP');
    renderStep(state, CATEGORIE_DINAMICHE);
};

document.getElementById("avantiBtn").onclick = () => {
    state.stepIndex++;
    storageService.saveOrder(state);
    if (state.stepIndex >= CATEGORIE_DINAMICHE.length) mostraRiepilogo();
    else renderStep(state, CATEGORIE_DINAMICHE);
};

document.getElementById("indietroBtn").onclick = () => {
    if (state.stepIndex <= 0) return;
    state.stepIndex--;
    storageService.saveOrder(state);
    renderStep(state, CATEGORIE_DINAMICHE);
};

const mostraRiepilogo = () => {
    messaggioFinale.value = generaMessaggio(state.risposte);
    navigator.goTo('SUMMARY');
};

document.getElementById("whatsappBtn").onclick = () => orderActions.shareToWhatsApp(messaggioFinale.value);
document.getElementById("copiaBtn").onclick = (e) => orderActions.copyToClipboard(messaggioFinale.value, e.currentTarget);

document.getElementById("nuovoOrdineBtn").onclick = () => {
    if (!confirm("Vuoi iniziare un nuovo ordine?")) return;
    resetState(); 
    storageService.clearOrder(); 
    navigator.goTo('HOME');
};

document.getElementById("riepilogoIndietroBtn").onclick = () => {
    state.stepIndex = CATEGORIE_DINAMICHE.length - 1;
    navigator.goTo('STEP'); 
    renderStep(state, CATEGORIE_DINAMICHE);
};
import { state, resetState } from "./state.js";
import { renderStep, ui } from "./ui.js"; // ui.js ora potrebbe contenere la funzione initButtons
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
    const prodotti = await dbService.getProducts(e.detail.barId);
    CATEGORIE_DINAMICHE = orderLogic.prepareCategories(prodotti);
    
    const backup = storageService.loadOrder();
    if (backup && CATEGORIE_DINAMICHE.length > 0) {
        Object.assign(state, backup);
        if (state.stepIndex >= CATEGORIE_DINAMICHE.length) mostraRiepilogo();
        else { navigator.goTo('STEP'); renderStep(state, CATEGORIE_DINAMICHE); }
    }
});

document.getElementById("startBtn").onclick = () => {
    if (CATEGORIE_DINAMICHE.length === 0) return;
    resetState();
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
    if (!confirm("Nuovo ordine?")) return;
    resetState(); storageService.clearOrder(); navigator.goTo('HOME');
};
document.getElementById("riepilogoIndietroBtn").onclick = () => {
    state.stepIndex = CATEGORIE_DINAMICHE.length - 1;
    navigator.goTo('STEP'); renderStep(state, CATEGORIE_DINAMICHE);
};
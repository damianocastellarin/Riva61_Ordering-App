import { state, resetState } from "../state.js";
import { storageService } from "../services/storage.js";
import { orderActions } from "../order/orderActions.js";
import { generaMessaggio } from "../orderBuilder.js";
import { navigator } from "../order/navigator.js";
import { router } from "../router.js";

export const summaryView = {
    render(prodottiData, categorie) {
        navigator.goTo('SUMMARY');
        const messaggioFinale = document.getElementById("messaggioFinale");
        messaggioFinale.value = generaMessaggio(state.risposte, prodottiData);

        document.getElementById("whatsappBtn").onclick = () => orderActions.shareToWhatsApp(messaggioFinale.value);
        document.getElementById("copiaBtn").onclick = (e) => orderActions.copyToClipboard(messaggioFinale.value, e.currentTarget);

        document.getElementById("nuovoOrdineBtn").onclick = () => {
            if (!confirm("Nuovo ordine?")) return;
            resetState();
            storageService.clearOrder();
            router.navigate('#home');
        };

        document.getElementById("riepilogoIndietroBtn").onclick = () => {
            state.stepIndex = categorie.length - 1;
            router.navigate('#step');
        };
    }
};
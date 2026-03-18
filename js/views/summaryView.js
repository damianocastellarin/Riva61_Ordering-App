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
            if (!confirm("Vuoi iniziare un nuovo ordine? I dati attuali verranno persi.")) return;
            resetState();
            storageService.clearOrder();
            router.navigate('#home');
        };

        document.getElementById("riepilogoIndietroBtn").onclick = () => {
            const lastIndex = categorie.length > 0 ? categorie.length - 1 : 0;
            state.stepIndex = lastIndex;
            router.navigate(`#step/${lastIndex}`);
        };
    }
};
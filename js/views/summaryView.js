import { state, resetState } from "../state.js";
import { storageService } from "../services/storage.js";
import { generaMessaggio } from "../orderBuilder.js";
import { appNavigator } from "../appNavigator.js";
import { router } from "../router.js";

export const summaryView = {
    render(prodottiData, categorie) {
        appNavigator.goTo('SUMMARY');
        const messaggioFinale = document.getElementById("messaggioFinale");
        messaggioFinale.value = generaMessaggio(state.risposte, prodottiData);

        document.getElementById("whatsappBtn").onclick = () =>
            _shareToWhatsApp(messaggioFinale.value);

        document.getElementById("copiaBtn").onclick = (e) =>
            _copyToClipboard(messaggioFinale.value, e.currentTarget);

        document.getElementById("nuovoOrdineBtn").onclick = () => {
            if (!confirm("Vuoi iniziare un nuovo ordine? I dati attuali verranno persi.")) return;
            resetState();
            storageService.clearOrder();
            router.replace('#home');
        };

        document.getElementById("riepilogoIndietroBtn").onclick = () => window.history.back();
    }
};

function _shareToWhatsApp(text) {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

async function _copyToClipboard(text, buttonElement) {
    try {
        await navigator.clipboard.writeText(text);
        const originalHTML = buttonElement.innerHTML;
        buttonElement.textContent = "Copiato!";
        setTimeout(() => { buttonElement.innerHTML = originalHTML; }, 2000);
    } catch (err) {
        console.error("Errore nel copia:", err);
        alert("Errore durante la copia negli appunti.");
    }
}
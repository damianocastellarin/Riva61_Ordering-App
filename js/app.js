import { state, resetState } from "./state.js";
import { renderStep } from "./ui.js";
import { generaMessaggio } from "./orderBuilder.js";
import { getIconHTML } from "./icons.js";
import { dbService } from "./services/db.js";
import { storageService } from "./services/storage.js";

let CATEGORIE_DINAMICHE = [];

const home = document.getElementById("home");
const stepDiv = document.getElementById("step");
const riepilogoDiv = document.getElementById("riepilogo");
const messaggioFinale = document.getElementById("messaggioFinale");
const progressContainer = document.getElementById("progressContainer");

document.getElementById("indietroBtn").innerHTML = `${getIconHTML('back')} Indietro`;
document.getElementById("avantiBtn").innerHTML = `Avanti ${getIconHTML('save')}`;
document.getElementById("riepilogoIndietroBtn").innerHTML = `${getIconHTML('back')} Modifica`;
document.getElementById("logoutBtn").innerHTML = `${getIconHTML('logout')} Esci dall'account`;
document.getElementById("startBtn").innerHTML = `${getIconHTML('add')} Inizia Nuovo Ordine`;

window.addEventListener('auth-success', (e) => {
    const barId = e.detail.barId;
    if (barId) caricaDatiDalDatabase(barId);
});

async function caricaDatiDalDatabase(barId) {
    try {
        const prodottiScaricati = await dbService.getProducts(barId);
        if (prodottiScaricati.length === 0) return;

        window.mappaProdottiCompleta = prodottiScaricati;
        const nomiCategorie = [...new Set(prodottiScaricati.map(p => p.categoria))];
        
        CATEGORIE_DINAMICHE = nomiCategorie.map(nomeCat => ({
            nome: nomeCat,
            prodotti: prodottiScaricati.filter(p => p.categoria === nomeCat).map(p => p.nome)
        }));

        ripristinaDaLocale();
    } catch (error) { 
        console.error("Errore nel caricamento dati app:", error); 
    }
}

function ripristinaDaLocale() {
    const backup = storageService.loadOrder();
    if (backup && CATEGORIE_DINAMICHE.length > 0) {
        state.stepIndex = backup.stepIndex;
        state.risposte = backup.risposte;
        home.classList.add("hidden");
        
        if (state.stepIndex >= CATEGORIE_DINAMICHE.length) {
            mostraRiepilogo();
        } else {
            stepDiv.classList.remove("hidden");
            renderStep(state, CATEGORIE_DINAMICHE);
        }
    }
}

document.getElementById("startBtn").addEventListener("click", () => {
    if (CATEGORIE_DINAMICHE.length === 0) return alert("Caricamento...");
    resetState();
    home.classList.add("hidden");
    stepDiv.classList.remove("hidden");
    state.stepIndex = 0;
    renderStep(state, CATEGORIE_DINAMICHE);
});

document.getElementById("avantiBtn").addEventListener("click", () => {
    state.stepIndex++;
    storageService.saveOrder(state);
    if (state.stepIndex >= CATEGORIE_DINAMICHE.length) mostraRiepilogo();
    else renderStep(state, CATEGORIE_DINAMICHE);
});

document.getElementById("indietroBtn").addEventListener("click", () => {
    if (state.stepIndex > 0) {
        state.stepIndex--;
        renderStep(state, CATEGORIE_DINAMICHE);
        storageService.saveOrder(state);
    }
});

function mostraRiepilogo() {
    messaggioFinale.value = generaMessaggio(state.risposte);
    stepDiv.classList.add("hidden");
    riepilogoDiv.classList.remove("hidden");
    if (progressContainer) progressContainer.classList.add("hidden");
}

document.getElementById("whatsappBtn").addEventListener("click", () => {
    const testo = encodeURIComponent(messaggioFinale.value);
    window.open(`https://wa.me/?text=${testo}`, "_blank");
});

document.getElementById("copiaBtn").addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(messaggioFinale.value);
        const btn = document.getElementById("copiaBtn");
        const originalHTML = btn.innerHTML;
        btn.textContent = "Copiato!";
        setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
    } catch (err) { console.error(err); }
});

document.getElementById("nuovoOrdineBtn").addEventListener("click", () => {
    if (confirm("Vuoi iniziare un nuovo ordine?")) {
        resetState();
        storageService.clearOrder();
        riepilogoDiv.classList.add("hidden");
        home.classList.remove("hidden");
    }
});

document.getElementById("riepilogoIndietroBtn").addEventListener("click", () => {
    riepilogoDiv.classList.add("hidden");
    stepDiv.classList.remove("hidden");
    state.stepIndex = CATEGORIE_DINAMICHE.length - 1;
    renderStep(state, CATEGORIE_DINAMICHE);
});
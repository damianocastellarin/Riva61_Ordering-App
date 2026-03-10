import { state, resetState } from "./state.js";
import { renderStep } from "./ui.js";
import { generaMessaggio } from "./orderBuilder.js";

let CATEGORIE_DINAMICHE = [];

const home = document.getElementById("home");
const stepDiv = document.getElementById("step");
const riepilogoDiv = document.getElementById("riepilogo");
const messaggioFinale = document.getElementById("messaggioFinale");
const progressContainer = document.getElementById("progressContainer");

window.addEventListener('auth-success', (e) => {
    caricaDatiDalDatabase(e.detail.uid);
});

async function caricaDatiDalDatabase(uid) {
    try {
        const prodRef = window.fb.collection(window.fb.db, "bars", uid, "prodotti");
        const q = window.fb.query(prodRef, window.fb.orderBy("createdAt", "asc"));
        const querySnapshot = await window.fb.getDocs(q);
        
        const prodottiScaricati = [];
        querySnapshot.forEach((doc) => {
            prodottiScaricati.push({ id: doc.id, ...doc.data() });
        });

        if (prodottiScaricati.length === 0) {
            console.warn("Nessun prodotto trovato nel database.");
            return;
        }

        window.mappaProdottiCompleta = prodottiScaricati;

        const nomiCategorie = [...new Set(prodottiScaricati.map(p => p.categoria))];
        
        CATEGORIE_DINAMICHE = nomiCategorie.map(nomeCat => ({
            nome: nomeCat,
            prodotti: prodottiScaricati
                .filter(p => p.categoria === nomeCat)
                .map(p => p.nome)
        }));

        console.log("App pronta con dati ordinati:", CATEGORIE_DINAMICHE);
        ripristinaDaLocale();
        
    } catch (error) {
        console.error("Errore nel recupero dati Firestore:", error);
    }
}

function ripristinaDaLocale() {
    const datiSalvati = sessionStorage.getItem("ordine_bar_salvato");
    if (datiSalvati && CATEGORIE_DINAMICHE.length > 0) {
        const backup = JSON.parse(datiSalvati);
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
    if (CATEGORIE_DINAMICHE.length === 0) {
        alert("Caricamento prodotti in corso...");
        return;
    }
    resetState();
    home.classList.add("hidden");
    stepDiv.classList.remove("hidden");
    state.stepIndex = 0;
    renderStep(state, CATEGORIE_DINAMICHE);
});

document.getElementById("avantiBtn").addEventListener("click", () => {
    state.stepIndex++;
    sessionStorage.setItem("ordine_bar_salvato", JSON.stringify(state));
    if (state.stepIndex >= CATEGORIE_DINAMICHE.length) {
        mostraRiepilogo();
    } else {
        renderStep(state, CATEGORIE_DINAMICHE);
    }
});

document.getElementById("indietroBtn").addEventListener("click", () => {
    if (state.stepIndex > 0) {
        state.stepIndex--;
        renderStep(state, CATEGORIE_DINAMICHE);
        sessionStorage.setItem("ordine_bar_salvato", JSON.stringify(state));
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
    const url = `https://wa.me/?text=${testo}`;
    window.open(url, "_blank");
});

document.getElementById("copiaBtn").addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(messaggioFinale.value);
        const btn = document.getElementById("copiaBtn");
        const originalText = btn.textContent;
        btn.textContent = "Copiato!";
        setTimeout(() => { btn.textContent = originalText; }, 2000);
    } catch (err) { console.error(err); }
});

document.getElementById("nuovoOrdineBtn").addEventListener("click", () => {
    if (confirm("Vuoi iniziare un nuovo ordine?")) {
        resetState();
        sessionStorage.removeItem("ordine_bar_salvato");
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
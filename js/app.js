import { state, resetState } from "./state.js";
import { CATEGORIE } from "../data/categorie.js";
import { renderStep } from "./ui.js";
import { generaMessaggio } from "./orderBuilder.js";

const home = document.getElementById("home");
const stepDiv = document.getElementById("step");
const riepilogoDiv = document.getElementById("riepilogo");
const messaggioFinale = document.getElementById("messaggioFinale");
const riepilogoIndietroBtn = document.getElementById("riepilogoIndietroBtn");
const nuovoOrdineBtn = document.getElementById("nuovoOrdineBtn");
const progressContainer = document.getElementById("progressContainer");

function salvaInLocale() {
  localStorage.setItem("ordine_bar_salvato", JSON.stringify(state));
}

function ripristinaDaLocale() {
  const datiSalvati = localStorage.getItem("ordine_bar_salvato");
  if (datiSalvati) {
    const backup = JSON.parse(datiSalvati);
    state.stepIndex = backup.stepIndex;
    state.risposte = backup.risposte;
    
    home.classList.add("hidden");
    stepDiv.classList.remove("hidden");
    if (progressContainer) progressContainer.classList.remove("hidden");
    renderStep(state);
  }
}

ripristinaDaLocale();

document.getElementById("startBtn").addEventListener("click", () => {
  resetState();
  home.classList.add("hidden");
  stepDiv.classList.remove("hidden");
  if (progressContainer) progressContainer.classList.remove("hidden"); 
  state.stepIndex = 0;
  renderStep(state);
});

document.getElementById("indietroBtn").addEventListener("click", () => {
  if (state.stepIndex > 0) {
    state.stepIndex--;
    renderStep(state);
    salvaInLocale();
  }
});

document.getElementById("avantiBtn").addEventListener("click", () => {
  const container = document.getElementById("prodottiContainer");
  const inputs = container.querySelectorAll("input");
  
  inputs.forEach(inp => {
    state.risposte[inp.dataset.id] = inp.value || 0;
  });

  state.stepIndex++;
  salvaInLocale();

  if (state.stepIndex >= CATEGORIE.length) {
    const mess = generaMessaggio(state.risposte);
    messaggioFinale.value = mess;
    stepDiv.classList.add("hidden");
    riepilogoDiv.classList.remove("hidden");
    if (progressContainer) progressContainer.classList.add("hidden"); 
  } else {
    renderStep(state);
  }
});

riepilogoIndietroBtn.addEventListener("click", () => {
  riepilogoDiv.classList.add("hidden");
  stepDiv.classList.remove("hidden");
  if (progressContainer) progressContainer.classList.remove("hidden"); 
  state.stepIndex = CATEGORIE.length - 1;
  renderStep(state);
});

document.getElementById("whatsappBtn").addEventListener("click", () => {
  const testo = encodeURIComponent(messaggioFinale.value);
  window.open(`https://wa.me/?text=${testo}`, "_blank");
});

document.getElementById("copiaBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(messaggioFinale.value);
    const btn = document.getElementById("copiaBtn");
    const originalText = btn.textContent;
    btn.textContent = "Copiato!";
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  } catch (err) {
    console.error("Errore nel copia:", err);
  }
});

nuovoOrdineBtn.addEventListener("click", () => {
  if (confirm("Vuoi cancellare questo ordine e iniziarne uno nuovo?")) {
    resetState();
    riepilogoDiv.classList.add("hidden");
    home.classList.remove("hidden");
    if (progressContainer) progressContainer.classList.add("hidden");
  }
});
import { state } from "./state.js";
import { CATEGORIE } from "../data/categorie.js";
import { renderStep } from "./ui.js";
import { generaMessaggio } from "./orderBuilder.js";

const home = document.getElementById("home");
const stepDiv = document.getElementById("step");
const riepilogoDiv = document.getElementById("riepilogo");
const messaggioFinale = document.getElementById("messaggioFinale");
const riepilogoIndietroBtn = document.getElementById("riepilogoIndietroBtn");

document.getElementById("startBtn").addEventListener("click", () => {
  home.classList.add("hidden");
  stepDiv.classList.remove("hidden");
  state.stepIndex = 0;
  renderStep(state);
});

document.getElementById("indietroBtn").addEventListener("click", () => {
  if (state.stepIndex > 0) {
    state.stepIndex--;
    renderStep(state);
  }
});

document.getElementById("avantiBtn").addEventListener("click", () => {
  const container = document.getElementById("prodottiContainer");
  const inputs = container.querySelectorAll("input");
  inputs.forEach(inp => {
    state.risposte[inp.dataset.id] = inp.value || 0;
  });

  state.stepIndex++;
  if (state.stepIndex >= CATEGORIE.length) {
    const mess = generaMessaggio(state.risposte);
    messaggioFinale.value = mess;
    stepDiv.classList.add("hidden");
    riepilogoDiv.classList.remove("hidden");
  } else {
    renderStep(state);
  }
});

riepilogoIndietroBtn.addEventListener("click", () => {
  riepilogoDiv.classList.add("hidden");
  stepDiv.classList.remove("hidden");
  state.stepIndex = CATEGORIE.length - 1;
  renderStep(state);
});

document.getElementById("copiaBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(messaggioFinale.value);
    const originalText = document.getElementById("copiaBtn").textContent;
    document.getElementById("copiaBtn").textContent = "Copiato!";
    setTimeout(() => {
      document.getElementById("copiaBtn").textContent = originalText;
    }, 2000);
  } catch (err) {
    console.error("Errore nel copia:", err);
  }
});

document.getElementById("whatsappBtn").addEventListener("click", () => {
  const testo = encodeURIComponent(messaggioFinale.value);
  window.open(`https://wa.me/?text=${testo}`, "_blank");
});
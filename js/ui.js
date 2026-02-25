import { PRODOTTI } from "../data/prodotti.js";
import { CATEGORIE } from "../data/categorie.js";

export function renderStep(state) {
  if (state.stepIndex < 0 || state.stepIndex >= CATEGORIE.length) {
    return;
  }

  const categoria = CATEGORIE[state.stepIndex];
  if (!categoria) return;

  const avantiBtn = document.getElementById("avantiBtn");
  const progressContainer = document.getElementById("progressContainer");
  const progressBar = document.getElementById("progressBar");

  if (progressContainer && progressBar) {
    progressContainer.classList.remove("hidden");
    const progress = ((state.stepIndex + 1) / CATEGORIE.length) * 100;
    progressBar.style.width = `${progress}%`;
  }

  document.getElementById("categoriaNome").textContent = categoria.nome;
  document.getElementById("indietroBtn").disabled = state.stepIndex === 0;
  avantiBtn.textContent = state.stepIndex === CATEGORIE.length - 1 ? "Crea Messaggio" : "Avanti";

  const container = document.getElementById("prodottiContainer");
  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  PRODOTTI.filter(p => p.categoria === categoria.id).forEach(p => {
    const div = document.createElement("div");
    div.classList.add("input-row");
    
    if (state.risposte[p.id] > 0) div.classList.add("filled");

    const inputId = `prodotto-${p.id}`;
    const label = document.createElement("label");
    label.textContent = p.nome;
    label.htmlFor = inputId;

    const input = document.createElement("input");
    input.type = "number";
    input.id = inputId;
    input.inputMode = "numeric";
    input.pattern = "[0-9]*";
    input.value = state.risposte[p.id] || "";
    input.dataset.id = p.id;

    input.addEventListener("input", (e) => {
      let v = e.target.value.replace(/[^0-9]/g, "");
      if (v.length > 2) v = v.slice(0, 2);
      e.target.value = v;

      if (parseInt(v, 10) > 0) {
        div.classList.add("filled");
      } else {
        div.classList.remove("filled");
      }
    });

    div.appendChild(label);
    div.appendChild(input);
    fragment.appendChild(div);
  });

  container.appendChild(fragment);
}
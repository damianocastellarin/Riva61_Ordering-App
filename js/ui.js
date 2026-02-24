import { PRODOTTI } from "../data/prodotti.js";
import { CATEGORIE } from "../data/categorie.js";

export function renderStep(state) {
  const categoria = CATEGORIE[state.stepIndex];
  const avantiBtn = document.getElementById("avantiBtn");
  
  if (state.stepIndex === CATEGORIE.length - 1) {
    avantiBtn.textContent = "Crea Messaggio";
  } else {
    avantiBtn.textContent = "Avanti";
  }
  
  document.getElementById("categoriaNome").textContent = categoria.nome;
  document.getElementById("indietroBtn").disabled = state.stepIndex === 0;

  const container = document.getElementById("prodottiContainer");
  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  PRODOTTI.filter(p => p.categoria === categoria.id).forEach(p => {
    const div = document.createElement("div");
    div.classList.add("input-row");

    const inputId = `prodotto-${p.id}`;

    const label = document.createElement("label");
    label.textContent = p.nome;
    label.htmlFor = inputId;

    const input = document.createElement("input");
    input.type = "number";
    input.id = inputId;
    input.inputMode = "numeric";
    input.pattern = "[0-9]*";
    input.min = 0;
    input.value = state.risposte[p.id] || "";
    input.dataset.id = p.id;

    div.appendChild(label);
    div.appendChild(input);
    fragment.appendChild(div);
  });

  container.appendChild(fragment);
}
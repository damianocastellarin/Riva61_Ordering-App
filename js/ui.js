import { PRODOTTI } from "../data/prodotti.js";
import { CATEGORIE } from "../data/categorie.js";

export function renderStep(state) {
  if (state.stepIndex < 0 || state.stepIndex >= CATEGORIE.length) return;

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
    
    const savedValue = parseInt(state.risposte[p.id], 10) || 0;
    if (savedValue > 0) div.classList.add("filled");

    const label = document.createElement("label");
    label.textContent = p.nome;

    const controls = document.createElement("div");
    controls.classList.add("qty-controls");

    const input = document.createElement("input");
    input.type = "number";
    input.inputMode = "numeric";
    input.value = savedValue > 0 ? savedValue : "";
    input.dataset.id = p.id;

    const updateValue = (newValue) => {
      let v = parseInt(newValue, 10);
      if (isNaN(v) || v <= 0) v = 0;
      if (v > 99) v = 99;

      state.risposte[p.id] = v;
      input.value = v > 0 ? v : "";
      
      if (v > 0) div.classList.add("filled");
      else div.classList.remove("filled");

      localStorage.setItem("ordine_bar_salvato", JSON.stringify(state));
    };

    const btnMinus = document.createElement("button");
    btnMinus.textContent = "-";
    btnMinus.classList.add("btn-qty");
    btnMinus.onclick = () => updateValue(parseInt(state.risposte[p.id] || 0, 10) - 1);

    const btnPlus = document.createElement("button");
    btnPlus.textContent = "+";
    btnPlus.classList.add("btn-qty");
    btnPlus.onclick = () => updateValue(parseInt(state.risposte[p.id] || 0, 10) + 1);

    input.addEventListener("input", (e) => {
      updateValue(e.target.value.replace(/[^0-9]/g, ""));
    });

    controls.appendChild(btnMinus);
    controls.appendChild(input);
    controls.appendChild(btnPlus);

    div.appendChild(label);
    div.appendChild(controls);
    fragment.appendChild(div);
  });

  container.appendChild(fragment);
}
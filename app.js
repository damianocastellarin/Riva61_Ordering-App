let stepIndex = 0;
let risposte = {};
const startBtn = document.getElementById("startBtn");
const home = document.getElementById("home");
const stepDiv = document.getElementById("step");
const riepilogoDiv = document.getElementById("riepilogo");
const categoriaNome = document.getElementById("categoriaNome");
const prodottiContainer = document.getElementById("prodottiContainer");
const indietroBtn = document.getElementById("indietroBtn");
const avantiBtn = document.getElementById("avantiBtn");
const messaggioFinale = document.getElementById("messaggioFinale");
const copiaBtn = document.getElementById("copiaBtn");
const whatsappBtn = document.getElementById("whatsappBtn");

startBtn.addEventListener("click", () => {
  home.classList.add("hidden");
  stepDiv.classList.remove("hidden");
  stepIndex = 0;
  mostraStep();
});

indietroBtn.addEventListener("click", () => {
  if(stepIndex > 0){
    stepIndex--;
    mostraStep();
  }
});

avantiBtn.addEventListener("click", () => {
  const inputs = prodottiContainer.querySelectorAll("input");
  inputs.forEach(inp => {
    risposte[inp.dataset.id] = inp.value || 0;
  });
  stepIndex++;
  if(stepIndex >= CATEGORIE.length){
    generaMessaggio();
    stepDiv.classList.add("hidden");
    riepilogoDiv.classList.remove("hidden");
  } else {
    mostraStep();
  }
});

function mostraStep(){
  const categoria = CATEGORIE[stepIndex];
  categoriaNome.textContent = categoria.nome;
  indietroBtn.disabled = stepIndex === 0;
  prodottiContainer.innerHTML = "";
  PRODOTTI.filter(p => p.categoria === categoria.id).forEach(p => {
    const div = document.createElement("div");
    div.classList.add("input-row");
    const label = document.createElement("label");
    label.textContent = p.nome;
    const input = document.createElement("input");
    input.type = "number";
    input.min = 0;
    input.value = risposte[p.id] || "";
    input.dataset.id = p.id;
    div.appendChild(label);
    div.appendChild(input);
    prodottiContainer.appendChild(div);
  });
}

function generaMessaggio(){
  let messaggio = "";
  FORNITORI.forEach(f => {
    const prodottiF = PRODOTTI.filter(p => p.fornitore === f.id);
    let prodottiTesto = prodottiF.map(p => {
      const qta = risposte[p.id] || 0;
      if(qta > 0) return `${p.nome} ${qta}`;
      return null;
    }).filter(x => x);
    if(prodottiTesto.length > 0){
      messaggio += `${f.nome}:\n${prodottiTesto.join(", ")}\n\n`;
    }
  });
  messaggioFinale.value = messaggio.trim();
}

copiaBtn.addEventListener("click", () => {
  messaggioFinale.select();
  document.execCommand("copy");
});

whatsappBtn.addEventListener("click", () => {
  const testo = encodeURIComponent(messaggioFinale.value);
  window.open(`https://wa.me/?text=${testo}`, "_blank");
});
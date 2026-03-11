import { getIconHTML } from './icons.js';

export const ui = {
    showLoader: () => {
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.innerHTML = `<div class="spinner"></div>`; 
            document.body.appendChild(loader);
        }
        loader.classList.remove('hidden');
    },

    hideLoader: () => {
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.add('hidden');
    },

    showToast: (text, duration = 2000) => {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.innerText = text;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, duration);
    },

    initAdminButtons: () => {
        const btns = {
            "indietroBtn": `${getIconHTML('back')} Indietro`,
            "avantiBtn": `Avanti ${getIconHTML('save')}`,
            "riepilogoIndietroBtn": `${getIconHTML('back')} Modifica`,
            "logoutBtn": `${getIconHTML('logout')} Esci dall'account`,
            "startBtn": `${getIconHTML('add')} Inizia Nuovo Ordine`
        };

        Object.entries(btns).forEach(([id, html]) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = html;
        });
    }
};

export function renderStep(state, categorie) {
    if (!categorie || categorie.length === 0) return;
    if (state.stepIndex < 0 || state.stepIndex >= categorie.length) return;

    const categoriaCorrente = categorie[state.stepIndex];
    const avantiBtn = document.getElementById("avantiBtn");
    const progressContainer = document.getElementById("progressContainer");
    const progressBar = document.getElementById("progressBar");

    if (progressContainer && progressBar) {
        progressContainer.classList.remove("hidden");
        const progress = ((state.stepIndex + 1) / categorie.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    document.getElementById("categoriaNome").textContent = categoriaCorrente.nome;
    const backBtn = document.getElementById("indietroBtn");
    if(backBtn) backBtn.disabled = state.stepIndex === 0;
    
    if(avantiBtn) avantiBtn.textContent = state.stepIndex === categorie.length - 1 ? "Crea Messaggio" : "Avanti";

    const container = document.getElementById("prodottiContainer");
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    categoriaCorrente.prodotti.forEach(nomeProdotto => {
        const div = document.createElement("div");
        div.classList.add("input-row");
        
        const savedValue = parseInt(state.risposte[nomeProdotto], 10) || 0;
        if (savedValue > 0) div.classList.add("filled");

        const label = document.createElement("label");
        label.textContent = nomeProdotto;

        const controls = document.createElement("div");
        controls.classList.add("qty-controls");

        const input = document.createElement("input");
        input.type = "number";
        input.inputMode = "numeric";
        input.value = savedValue > 0 ? savedValue : "";
        
        const updateValue = (newValue) => {
            let v = parseInt(newValue, 10);
            if (isNaN(v) || v <= 0) v = 0;
            if (v > 99) v = 99;
            state.risposte[nomeProdotto] = v;
            input.value = v > 0 ? v : "";
            if (v > 0) div.classList.add("filled");
            else div.classList.remove("filled");
            sessionStorage.setItem("ordine_bar_salvato", JSON.stringify(state));
        };

        const btnMinus = document.createElement("button");
        btnMinus.textContent = "-";
        btnMinus.classList.add("btn-qty");
        btnMinus.onpointerdown = (e) => {
            e.preventDefault();
            let currentV = parseInt(state.risposte[nomeProdotto] || 0, 10);
            if (currentV > 0) updateValue(currentV - 1);
        };

        const btnPlus = document.createElement("button");
        btnPlus.textContent = "+";
        btnPlus.classList.add("btn-qty");
        btnPlus.onpointerdown = (e) => {
            e.preventDefault();
            let currentV = parseInt(state.risposte[nomeProdotto] || 0, 10);
            updateValue(currentV + 1);
        };

        input.addEventListener("input", (e) => updateValue(e.target.value));
        controls.appendChild(btnMinus);
        controls.appendChild(input);
        controls.appendChild(btnPlus);
        div.appendChild(label);
        div.appendChild(controls);
        fragment.appendChild(div);
    });

    container.appendChild(fragment);
}
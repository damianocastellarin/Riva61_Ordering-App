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
            "logoutBtn": `${getIconHTML('logout')} Esci`,
            "startBtn": `Inizia Nuovo Ordine`
        };

        Object.entries(btns).forEach(([id, html]) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = html;
        });
    }
};

export function renderStep(state, categorie) {
    if (!categorie || categorie.length === 0) return;
    const categoriaCorrente = categorie[state.stepIndex];
    
    const container = document.getElementById("prodottiContainer");
    const catNome = document.getElementById("categoriaNome");
    const avantiBtn = document.getElementById("avantiBtn");
    const indietroBtn = document.getElementById("indietroBtn");
    const progressBar = document.getElementById("progressBar");

    if (catNome) catNome.textContent = categoriaCorrente.nome;
    if (indietroBtn) indietroBtn.disabled = state.stepIndex === 0;
    if (avantiBtn) {
        avantiBtn.innerHTML = state.stepIndex === categorie.length - 1 ? 
            `Crea Messaggio ${getIconHTML('save')}` : 
            `Avanti ${getIconHTML('next')}`;
    }

    if (progressBar) {
        const progress = ((state.stepIndex + 1) / categorie.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    container.innerHTML = "";
    categoriaCorrente.prodotti.forEach(nomeProdotto => {
        const div = document.createElement("div");
        div.className = `input-row ${state.risposte[nomeProdotto] > 0 ? 'filled' : ''}`;
        
        div.innerHTML = `
            <label>${nomeProdotto}</label>
            <div class="qty-controls">
                <button class="btn-qty minus">-</button>
                <input type="number" inputmode="numeric" value="${state.risposte[nomeProdotto] || ''}" placeholder="0">
                <button class="btn-qty plus">+</button>
            </div>
        `;

        const input = div.querySelector('input');
        const update = (val) => {
            let v = parseInt(val, 10) || 0;
            v = Math.max(0, Math.min(99, v));
            state.risposte[nomeProdotto] = v;
            input.value = v > 0 ? v : "";
            div.classList.toggle('filled', v > 0);
            sessionStorage.setItem("ordine_bar_salvato", JSON.stringify(state));
        };

        div.querySelector('.minus').onclick = () => update((state.risposte[nomeProdotto] || 0) - 1);
        div.querySelector('.plus').onclick = () => update((state.risposte[nomeProdotto] || 0) + 1);
        input.oninput = (e) => update(e.target.value);

        container.appendChild(div);
    });
}
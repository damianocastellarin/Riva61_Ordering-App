import { state } from "../state.js";
import { storageService } from "../services/storage.js";
import { getIconHTML } from "../icons.js";
import { appNavigator } from "../appNavigator.js";
import { router } from "../router.js";

export const orderView = {
    render(categorie, stepFromUrl) {
        if (!categorie || categorie.length === 0) return;

        if (stepFromUrl !== undefined) {
            state.stepIndex = parseInt(stepFromUrl, 10);
        }

        appNavigator.goTo('STEP');

        const categoriaCorrente = categorie[state.stepIndex];
        if (!categoriaCorrente) {
            router.replace('#home');
            return;
        }

        const container   = document.getElementById("prodottiContainer");
        const catNome     = document.getElementById("categoriaNome");
        const avantiBtn   = document.getElementById("avantiBtn");
        const indietroBtn = document.getElementById("indietroBtn");
        const progressBar = document.getElementById("progressBar");

        if (catNome) catNome.textContent = categoriaCorrente.nome;

        avantiBtn.innerHTML = state.stepIndex === categorie.length - 1
            ? `Riepilogo ${getIconHTML('save')}`
            : `Avanti`;

        avantiBtn.onclick = () => {
            const nextStep = state.stepIndex + 1;
            if (nextStep >= categorie.length) {
                router.navigate('#riepilogo');
            } else {
                router.navigate(`#step/${nextStep}`);
            }
        };

        indietroBtn.onclick = () => window.history.back();

        if (progressBar) {
            const progress = ((state.stepIndex + 1) / categorie.length) * 100;
            progressBar.style.width = `${progress}%`;
        }

        container.innerHTML = "";

        categoriaCorrente.prodotti.forEach(prodotto => {
            const { nome: nomeProdotto, unita } = prodotto;

            const div = document.createElement("div");
            div.className = `input-row ${state.risposte[nomeProdotto] > 0 ? 'filled' : ''}`;
            div.innerHTML = `
                <label>
                    ${nomeProdotto}
                    ${unita
                        ? `<span style="font-size:0.78rem; color:var(--text-muted); font-weight:400;"> · ${unita}</span>`
                        : ''}
                </label>
                <div class="qty-controls">
                    <button class="btn-qty minus">-</button>
                    <input type="number"
                           inputmode="numeric"
                           pattern="[0-9]*"
                           value="${state.risposte[nomeProdotto] || ''}"
                           placeholder="0">
                    <button class="btn-qty plus">+</button>
                </div>
            `;

            const input = div.querySelector('input');
            input.onfocus = () => setTimeout(() => input.select(), 50);

            const update = (val) => {
                const v = Math.max(0, Math.min(99, parseInt(val, 10) || 0));
                state.risposte[nomeProdotto] = v;
                input.value = v > 0 ? v : "";
                div.classList.toggle('filled', v > 0);
                storageService.saveOrder(state);
            };

            div.querySelector('.minus').onclick = () => update((state.risposte[nomeProdotto] || 0) - 1);
            div.querySelector('.plus').onclick  = () => update((state.risposte[nomeProdotto] || 0) + 1);

            input.oninput = (e) => {
                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                update(e.target.value);
            };

            container.appendChild(div);
        });
    }
};
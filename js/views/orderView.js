import { state } from "../state.js";
import { storageService } from "../services/storage.js";
import { getIconHTML } from "../icons.js";
import { navigator } from "../order/navigator.js";
import { router } from "../router.js";

export const orderView = {
    render(categorie) {
        if (!categorie || categorie.length === 0) return;
        navigator.goTo('STEP');

        const categoriaCorrente = categorie[state.stepIndex];
        const container = document.getElementById("prodottiContainer");
        const catNome = document.getElementById("categoriaNome");
        const avantiBtn = document.getElementById("avantiBtn");
        const indietroBtn = document.getElementById("indietroBtn");
        const progressBar = document.getElementById("progressBar");

        if (catNome) catNome.textContent = categoriaCorrente.nome;
        
        avantiBtn.innerHTML = state.stepIndex === categorie.length - 1 ? 
            `Salva Messaggio ${getIconHTML('save')}` : `Avanti`;

        avantiBtn.onclick = () => {
            state.stepIndex++;
            storageService.saveOrder(state);
            if (state.stepIndex >= categorie.length) {
                router.navigate('#riepilogo');
            } else {
                this.render(categorie);
            }
        };

        indietroBtn.onclick = () => {
            if (state.stepIndex <= 0) {
                router.navigate('#home');
            } else {
                state.stepIndex--;
                storageService.saveOrder(state);
                this.render(categorie);
            }
        };

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
                if (v < 0) v = 0;
                if (v > 99) v = 99;
                state.risposte[nomeProdotto] = v;
                input.value = v > 0 ? v : "";
                div.classList.toggle('filled', v > 0);
                storageService.saveOrder(state);
            };

            div.querySelector('.minus').onclick = () => update((state.risposte[nomeProdotto] || 0) - 1);
            div.querySelector('.plus').onclick = () => update((state.risposte[nomeProdotto] || 0) + 1);
            input.oninput = (e) => update(e.target.value);

            container.appendChild(div);
        });
    }
};
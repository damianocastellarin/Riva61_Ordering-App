import { state } from "../state.js";
import { storageService } from "../services/storage.js";
import { getIconHTML } from "../icons.js";
import { router } from "../router.js";
import { appNavigator } from "../appNavigator.js";

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

        const prodottiContainer = document.getElementById("prodottiContainer");
        document.getElementById("categoriaNome").textContent = categoriaCorrente.nome;

        const avantiBtn = document.getElementById("avantiBtn");
        avantiBtn.innerHTML = state.stepIndex === categorie.length - 1 ? `Completa ${getIconHTML('save')}` : `Avanti`;
        
        avantiBtn.onclick = () => {
            const next = state.stepIndex + 1;
            router.navigate(next >= categorie.length ? '#order-complete' : `#step/${next}`);
        };

        document.getElementById("indietroBtn").onclick = () => window.history.back();
        
        const progressBar = document.getElementById("progressBar");
        if (progressBar) {
            progressBar.style.width = `${((state.stepIndex + 1) / categorie.length) * 100}%`;
        }

        prodottiContainer.innerHTML = "";
        
        categoriaCorrente.prodotti.forEach(p => {
            const qta = state.risposte[p.nome] || 0;
            const div = document.createElement("div");
            div.className = `input-row ${qta > 0 ? 'filled' : ''}`;
            
            div.innerHTML = `
                <div class="product-info-label">
                    <span class="product-name">${p.nome}</span>
                    <div class="product-meta-row">
                        ${p.unita ? `<span class="product-meta">${p.unita}</span>` : ''}
                        ${p.fornitore ? `<span class="product-meta"> | ${p.fornitore}</span>` : ''}
                    </div>
                </div>
                <div class="qty-controls">
                    <button class="btn-qty minus">-</button>
                    <input type="number" inputmode="numeric" pattern="[0-9]*" value="${qta || ''}" placeholder="0">
                    <button class="btn-qty plus">+</button>
                </div>
            `;

            const input = div.querySelector('input');
            
            const update = (val) => {
                const v = Math.max(0, Math.min(99, parseInt(val, 10) || 0));
                state.risposte[p.nome] = v;
                input.value = v > 0 ? v : "";
                div.classList.toggle('filled', v > 0);
                storageService.saveOrder(state);
            };

            div.querySelector('.minus').onclick = () => update((state.risposte[p.nome] || 0) - 1);
            div.querySelector('.plus').onclick  = () => update((state.risposte[p.nome] || 0) + 1);
            
            input.oninput = (e) => {
                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                update(e.target.value);
            };
            input.onfocus = () => setTimeout(() => input.select(), 50);

            prodottiContainer.appendChild(div);
        });
    }
};
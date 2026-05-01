import { state, resetState, hasActiveOrder } from "../state.js";
import { storageService } from "../services/storage.js";
import { generaMessaggio } from "../orderBuilder.js";
import { router } from "../router.js";

export const orderSummaryView = {
    render(prodottiData, categorie) {
        const container = document.getElementById("order-summary");
        const content = document.getElementById("orderSummaryContent");
        const actions = document.getElementById("orderSummaryActions");

        if (container) container.classList.remove("hidden");

        ["step", "order-complete", "profile", "admin-content", "progressContainer"]
            .forEach(id => document.getElementById(id)?.classList.add("hidden"));

        const prodottiOrdinati = prodottiData.filter(p => (parseInt(state.risposte[p.nome], 10) || 0) > 0);

        if (prodottiOrdinati.length === 0) {
            content.innerHTML = `
                <div style="text-align:center; padding:60px 20px;">
                    <p style="font-size:1.1rem; color:var(--text-muted); margin-bottom:30px;">
                        Nessun prodotto nell'ordine
                    </p>
                    <button id="startNewOrderBtnSummary" class="btn-primary">Inizia Nuovo Ordine</button>
                </div>
            `;
            if (actions) actions.classList.add("hidden");

            const startBtn = document.getElementById("startNewOrderBtnSummary");
            if (startBtn) {
                startBtn.onclick = () => {
                    resetState();
                    storageService.clearOrder();
                    router.navigate('#step/0');
                };
            }
            return;
        }

        const prodottiPerCategoria = categorie.map(cat => ({
            nome: cat.nome,
            prodotti: prodottiOrdinati.filter(p => p.categoria === cat.nome)
        })).filter(cat => cat.prodotti.length > 0);

        content.innerHTML = "";
        prodottiPerCategoria.forEach(cat => {
            const catHeader = document.createElement("h3");
            catHeader.textContent = cat.nome;
            catHeader.style.cssText = "margin:25px 0 10px; font-size:1.15rem; color:var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 5px;";
            content.appendChild(catHeader);

            cat.prodotti.forEach(p => {
                const qta = parseInt(state.risposte[p.nome], 10) || 0;
                const div = document.createElement("div");
                div.className = "input-row filled";
                
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
                        <input type="number" inputmode="numeric" pattern="[0-9]*" value="${qta}">
                        <button class="btn-qty plus">+</button>
                    </div>
                `;

                const input = div.querySelector('input');
                
                const update = (val) => {
                    const v = Math.max(0, Math.min(99, parseInt(val, 10) || 0));
                    state.risposte[p.nome] = v;
                    storageService.saveOrder(state);
                    this.render(prodottiData, categorie);
                };

                div.querySelector('.minus').onclick = () => update(qta - 1);
                div.querySelector('.plus').onclick  = () => update(qta + 1);
                
                input.oninput = (e) => {
                    if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                    update(e.target.value);
                };
                input.onfocus = () => setTimeout(() => input.select(), 50);

                content.appendChild(div);
            });
        });

        if (actions) actions.classList.remove("hidden");

        const copyBtn = document.getElementById("copyOrderBtn");
        if (copyBtn) {
            copyBtn.onclick = async () => {
                const messaggio = generaMessaggio(state.risposte, prodottiData);
                try {
                    await navigator.clipboard.writeText(messaggio);
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = "Copiato!";
                    setTimeout(() => { copyBtn.textContent = originalText; }, 1500);
                } catch (err) {
                    alert("Errore durante la copia negli appunti.");
                }
            };
        }

        const whatsappBtn = document.getElementById("whatsappOrderBtn");
        if (whatsappBtn) {
            whatsappBtn.onclick = () => {
                const messaggio = generaMessaggio(state.risposte, prodottiData);
                window.open(`https://wa.me/?text=${encodeURIComponent(messaggio)}`, "_blank");
            };
        }

        const clearBtn = document.getElementById("clearOrderBtn");
        if (clearBtn) {
            clearBtn.onclick = () => {
                if (!confirm("Vuoi davvero svuotare l'ordine attuale? Tutti i prodotti verranno rimossi.")) return;
                resetState();
                storageService.clearOrder();
                this.render(prodottiData, categorie);
            };
        }
    }
};
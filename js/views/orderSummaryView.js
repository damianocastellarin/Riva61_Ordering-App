import { state, resetState } from "../state.js";
import { storageService } from "../services/storage.js";
import { generaMessaggio } from "../orderBuilder.js";
import { router } from "../router.js";

export const orderSummaryView = {
    render(prodottiData, categorie) {
        const container = document.getElementById("order-summary");
        const content = document.getElementById("orderSummaryContent");
        const actions = document.getElementById("orderSummaryActions");

        if (container) container.classList.remove("hidden");

        document.getElementById("home")?.classList.add("hidden");
        document.getElementById("step")?.classList.add("hidden");
        document.getElementById("order-complete")?.classList.add("hidden");
        document.getElementById("profile")?.classList.add("hidden");
        document.getElementById("admin-content")?.classList.add("hidden");
        document.getElementById("progressContainer")?.classList.add("hidden");

        const prodottiOrdinati = prodottiData.filter(p => {
            const qta = parseInt(state.risposte[p.nome], 10) || 0;
            return qta > 0;
        });

        if (prodottiOrdinati.length === 0) {
            content.innerHTML = `
                <div style="text-align:center; padding:60px 20px; color:var(--text-muted);">
                    <p style="font-size:1.1rem;">Nessun prodotto nell'ordine</p>
                    <p style="font-size:0.9rem; margin-top:10px;">Inizia un nuovo ordine per aggiungere prodotti</p>
                </div>
            `;
            if (actions) actions.classList.add("hidden");
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
            catHeader.style.cssText = "margin:20px 0 10px; font-size:1.1rem; color:var(--text-main);";
            content.appendChild(catHeader);

            cat.prodotti.forEach(p => {
                const qta = parseInt(state.risposte[p.nome], 10) || 0;
                const div = document.createElement("div");
                div.className = "input-row filled";
                div.innerHTML = `
                    <label>
                        ${p.nome}
                        ${p.unita
                            ? `<span style="font-size:0.78rem; color:var(--text-muted); font-weight:400;"> · ${p.unita}</span>`
                            : ''}
                    </label>
                    <div class="qty-controls">
                        <button class="btn-qty minus" data-product="${p.nome}">-</button>
                        <input type="number"
                               inputmode="numeric"
                               pattern="[0-9]*"
                               value="${qta}"
                               data-product="${p.nome}"
                               placeholder="0">
                        <button class="btn-qty plus" data-product="${p.nome}">+</button>
                    </div>
                `;

                const input = div.querySelector('input');
                input.onfocus = () => setTimeout(() => input.select(), 50);

                const update = (val) => {
                    const v = Math.max(0, Math.min(99, parseInt(val, 10) || 0));
                    state.risposte[p.nome] = v;
                    input.value = v > 0 ? v : "";
                    div.classList.toggle('filled', v > 0);
                    storageService.saveOrder(state);

                    this.render(prodottiData, categorie);
                };

                div.querySelector('.minus').onclick = () => update(qta - 1);
                div.querySelector('.plus').onclick  = () => update(qta + 1);

                input.oninput = (e) => {
                    if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                    update(e.target.value);
                };

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
                    const originalHTML = copyBtn.innerHTML;
                    copyBtn.textContent = "Copiato!";
                    setTimeout(() => { copyBtn.innerHTML = originalHTML; }, 2000);
                } catch (err) {
                    console.error("Errore copia:", err);
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
                if (!confirm("Vuoi davvero pulire l'ordine? Tutti i prodotti selezionati verranno rimossi.")) return;
                resetState();
                storageService.clearOrder();
                this.render(prodottiData, categorie);
            };
        }
    }
};
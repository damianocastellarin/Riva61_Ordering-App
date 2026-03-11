import { ui } from '../ui.js';
import { dbService } from '../services/db.js';

const productModal = document.getElementById('productModal');
const modalTitle = document.getElementById('modalTitle');
const modalProductId = document.getElementById('modalProductId');
const modalProdNome = document.getElementById('modalProdNome');
const modalProdCat = document.getElementById('modalProdCat');
const modalProdFornitore = document.getElementById('modalProdFornitore');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveProductBtn = document.getElementById('saveProductBtn');
const selectCatQuick = document.getElementById('selectCatQuick');
const selectFornQuick = document.getElementById('selectFornQuick');

let onSaveCallback = null;

export const productModalManager = {
    init(onSave) {
        onSaveCallback = onSave;
        
        closeModalBtn.onclick = () => productModal.classList.add('hidden');
        
        saveProductBtn.onclick = async () => {
            const barId = this.currentBarId;
            const id = modalProductId.value;
            const data = {
                nome: modalProdNome.value.trim(),
                categoria: modalProdCat.value.trim(),
                fornitore: modalProdFornitore.value.trim() || "N/A",
                updatedAt: Date.now()
            };

            if (!data.nome || !data.categoria) return alert("Dati obbligatori mancanti");

            ui.showLoader();
            try {
                await dbService.saveProduct(barId, id, data);
                productModal.classList.add('hidden');
                ui.showToast("Salvato!");
                if (onSaveCallback) onSaveCallback(data.categoria);
            } catch (e) {
                alert("Errore nel salvataggio");
            } finally {
                ui.hideLoader();
            }
        };

        if(selectCatQuick) selectCatQuick.onchange = (e) => { if(e.target.value) modalProdCat.value = e.target.value; };
        if(selectFornQuick) selectFornQuick.onchange = (e) => { if(e.target.value) modalProdFornitore.value = e.target.value; };
    },

    async open(barId, currentCategory = '', product = null) {
        this.currentBarId = barId;
        ui.showLoader();
        await this.updateSuggestions(barId);
        ui.hideLoader();

        if (product) {
            modalTitle.textContent = "Modifica Prodotto";
            modalProductId.value = product.id;
            modalProdNome.value = product.nome;
            modalProdCat.value = product.categoria;
            modalProdFornitore.value = product.fornitore;
        } else {
            modalTitle.textContent = "Nuovo Prodotto";
            modalProductId.value = "";
            modalProdNome.value = "";
            modalProdCat.value = currentCategory;
            modalProdFornitore.value = "";
        }
        productModal.classList.remove('hidden');
    },

    async updateSuggestions(barId) {
        try {
            const products = await dbService.getProducts(barId);
            const cats = [...new Set(products.map(p => p.categoria))].sort();
            const forns = [...new Set(products.map(p => p.fornitore))].sort();

            selectCatQuick.innerHTML = '<option value="">-- Esistenti --</option>';
            selectFornQuick.innerHTML = '<option value="">-- Esistenti --</option>';

            cats.forEach(c => selectCatQuick.add(new Option(c, c)));
            forns.forEach(f => selectFornQuick.add(new Option(f, f)));
        } catch (e) {
            console.error("Errore suggerimenti:", e);
        }
    }
};
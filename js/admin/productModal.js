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
let existingCategories = [];

export const productModalManager = {
    init(onSave) {
        onSaveCallback = onSave;
        closeModalBtn.onclick = () => productModal.classList.add('hidden');
        
        saveProductBtn.onclick = async () => {
            const barId = this.currentBarId;
            const id = modalProductId.value;
            const nome = modalProdNome.value.trim();
            const categoria = modalProdCat.value.trim();
            const fornitore = modalProdFornitore.value.trim() || "N/A";

            if (!categoria) return alert("La categoria è obbligatoria");

            const isNewCat = !existingCategories.find(c => c.nome.toLowerCase() === categoria.toLowerCase());
            
            ui.showLoader();
            try {
                if (!nome) {
                    if (!isNewCat) throw new Error("Questa categoria esiste già!");
                    const catRef = window.fb.doc(window.fb.db, "bars", barId, "categorie", categoria);
                    await window.fb.setDoc(catRef, { nome: categoria });
                } else {
                    await dbService.saveProduct(barId, id, { nome, categoria, fornitore, updatedAt: Date.now() });
                }

                productModal.classList.add('hidden');
                ui.showToast("Operazione completata!");
                
                if (onSaveCallback) onSaveCallback(categoria, !nome);
                
            } catch (e) {
                alert(e.message || "Errore nel salvataggio");
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
            modalTitle.textContent = currentCategory ? "Nuovo Prodotto" : "Nuova Categoria";
            modalProductId.value = "";
            modalProdNome.value = "";
            modalProdCat.value = currentCategory;
            modalProdFornitore.value = "";
            modalProdNome.placeholder = currentCategory ? "es. Croissant" : "(Vuoto per creare solo categoria)";
        }
        productModal.classList.remove('hidden');
    },

    async updateSuggestions(barId) {
        try {
            existingCategories = await dbService.getCategories(barId);
            const products = await dbService.getProducts(barId);
            const forns = [...new Set(products.map(p => p.fornitore))].sort();

            selectCatQuick.innerHTML = '<option value="">-- Esistenti --</option>';
            selectFornQuick.innerHTML = '<option value="">-- Esistenti --</option>';

            existingCategories.forEach(c => selectCatQuick.add(new Option(c.nome, c.nome)));
            forns.forEach(f => selectFornQuick.add(new Option(f, f)));
        } catch (e) {
            console.error("Errore suggerimenti:", e);
        }
    }
};
import { ui } from '../ui.js';
import { dbService } from '../services/db.js';
import { router } from '../router.js';

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

const groupNome = document.getElementById('group-nome');
const groupFornitore = document.getElementById('group-fornitore');

let existingCategories = [];
let oldCategoryName = null;
let currentBarId = null;

export const productModalManager = {
    init() {
        closeModalBtn.onclick = () => productModal.classList.add('hidden');
        
        saveProductBtn.onclick = async () => {
            const barId = currentBarId;
            const id = modalProductId.value;
            const nome = modalProdNome.value.trim();
            const categoria = modalProdCat.value.trim();
            const fornitore = modalProdFornitore.value.trim() || "N/A";

            if (!categoria) return alert("La categoria è obbligatoria");

            ui.showLoader();
            try {
                const isOnlyCategory = groupNome.classList.contains('hidden');

                if (isOnlyCategory) {
                    if (oldCategoryName) {
                        await dbService.renameCategory(barId, oldCategoryName, categoria);
                    } else {
                        const exists = existingCategories.find(c => c.nome.toLowerCase() === categoria.toLowerCase());
                        if (exists) throw new Error("Questa categoria esiste già!");
                        
                        const catRef = window.fb.doc(window.fb.db, "bars", barId, "categorie", categoria);
                        await window.fb.setDoc(catRef, { nome: categoria, createdAt: Date.now() });
                    }
                    productModal.classList.add('hidden');
                    router.navigate('#admin/categories');
                } else {
                    if (!nome) throw new Error("Il nome del prodotto è obbligatorio");
                    await dbService.saveProduct(barId, id, { 
                        nome, categoria, fornitore, updatedAt: Date.now() 
                    });
                    productModal.classList.add('hidden');
                    router.navigate('#admin/products');
                }
                ui.showToast("Salvato con successo!");
            } catch (e) {
                alert(e.message || "Errore nel salvataggio");
            } finally {
                ui.hideLoader();
            }
        };

        if(selectCatQuick) selectCatQuick.onchange = (e) => { if(e.target.value) modalProdCat.value = e.target.value; };
        if(selectFornQuick) selectFornQuick.onchange = (e) => { if(e.target.value) modalProdFornitore.value = e.target.value; };
    },

    async open(barId, currentCategory = '', product = null, isEditCategory = false) {
        currentBarId = barId;
        oldCategoryName = isEditCategory ? currentCategory : null;
        
        ui.showLoader();
        await this.updateSuggestions(barId);
        ui.hideLoader();

        groupNome.classList.remove('hidden');
        groupFornitore.classList.remove('hidden');

        if (product) {
            modalTitle.textContent = "Modifica Prodotto";
            modalProductId.value = product.id;
            modalProdNome.value = product.nome;
            modalProdCat.value = product.categoria;
            modalProdFornitore.value = product.fornitore;
        } else if (isEditCategory) {
            modalTitle.textContent = "Modifica Categoria";
            modalProductId.value = "";
            modalProdNome.value = "";
            modalProdCat.value = currentCategory;
            modalProdFornitore.value = "";
            groupNome.classList.add('hidden');
            groupFornitore.classList.add('hidden');
        } else if (currentCategory) {
            modalTitle.textContent = "Nuovo Prodotto";
            modalProductId.value = "";
            modalProdNome.value = "";
            modalProdCat.value = currentCategory;
            modalProdFornitore.value = "";
        } else {
            modalTitle.textContent = "Nuova Categoria";
            modalProductId.value = "";
            modalProdNome.value = "";
            modalProdCat.value = "";
            modalProdFornitore.value = "";
            groupNome.classList.add('hidden');
            groupFornitore.classList.add('hidden');
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
            
            [...existingCategories].sort((a,b) => a.nome.localeCompare(b.nome))
                .forEach(c => selectCatQuick.add(new Option(c.nome, c.nome)));
            forns.forEach(f => selectFornQuick.add(new Option(f, f)));
        } catch (e) { console.error(e); }
    }
};
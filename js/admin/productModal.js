import { ui } from '../ui.js';
import { dbService } from '../services/db.js';
import { router } from '../router.js';
import { networkService } from '../services/networkService.js';
import { dataCache } from '../services/dataCache.js';

const productModal       = document.getElementById('productModal');
const modalTitle         = document.getElementById('modalTitle');
const modalProductId     = document.getElementById('modalProductId');
const modalProdNome      = document.getElementById('modalProdNome');
const modalProdUnita     = document.getElementById('modalProdUnita');
const modalProdCat       = document.getElementById('modalProdCat');
const modalProdFornitore = document.getElementById('modalProdFornitore');
const closeModalBtn      = document.getElementById('closeModalBtn');
const saveProductBtn     = document.getElementById('saveProductBtn');
const selectUnitaQuick   = document.getElementById('selectUnitaQuick');
const selectCatQuick     = document.getElementById('selectCatQuick');
const selectFornQuick    = document.getElementById('selectFornQuick');
const groupNome          = document.getElementById('group-nome');
const groupUnita         = document.getElementById('group-unita');
const groupFornitore     = document.getElementById('group-fornitore');

const UNITA_FISSE = [
    'pz', 'kg', 'g', 'l', 'ml',
    'bottiglie', 'bancali', 'casse', 'sacchi',
    'confezioni', 'pacchi', 'scatole', 'vassoi'
];

let existingCategories       = [];
let oldCategoryName          = null;
let currentBarId               = null;
let _initialValues           = null;
let _closingProgrammatically = false;

function _saveInitialValues() {
    _initialValues = {
        nome:      modalProdNome.value,
        unita:     modalProdUnita.value,
        cat:       modalProdCat.value,
        fornitore: modalProdFornitore.value
    };
}

function _isDirty() {
    if (!_initialValues) return false;
    return (
        modalProdNome.value      !== _initialValues.nome     ||
        modalProdUnita.value     !== _initialValues.unita    ||
        modalProdCat.value       !== _initialValues.cat      ||
        modalProdFornitore.value !== _initialValues.fornitore
    );
}

function _closeModal() {
    productModal.classList.add('hidden');
    saveProductBtn.disabled = false;
    saveProductBtn.style.opacity = "1";
    _initialValues = null;
    _closingProgrammatically = false;
}

window.addEventListener('popstate', () => {
    if (productModal.classList.contains('hidden')) return;

    if (_closingProgrammatically) {
        _closeModal();
        return;
    }

    if (_isDirty()) {
        if (!confirm("Hai modifiche non salvate. Vuoi uscire senza salvare?")) {
            history.pushState({ modal: true }, '');
            return;
        }
    }

    _closeModal();
});

export const productModalManager = {
    init() {
        closeModalBtn.onclick = () => {
            if (_isDirty()) {
                if (!confirm("Hai modifiche non salvate. Vuoi uscire senza salvare?")) return;
            }
            _closingProgrammatically = true;
            history.back();
        };

        saveProductBtn.onclick = async () => {
            if (saveProductBtn.disabled) return;

            const barId     = currentBarId;
            const id        = modalProductId.value;
            const nome      = modalProdNome.value.trim();
            const unita     = modalProdUnita.value.trim();
            const categoria = modalProdCat.value.trim();
            const fornitore = modalProdFornitore.value.trim() || "N/A";

            if (!categoria) return alert("La categoria è obbligatoria");

            const performDbOperation = async () => {
                const isOnlyCategory = groupNome.classList.contains('hidden');
                if (isOnlyCategory) {
                    if (oldCategoryName) {
                        await dbService.renameCategory(barId, oldCategoryName, categoria);
                    } else {
                        const exists = existingCategories.find(c => c.nome.toLowerCase() === categoria.toLowerCase());
                        if (exists) throw new Error("Questa categoria esiste già!");
                        const catRef = window.fb.doc(window.fb.db, "bars", barId, "categorie", categoria.trim());
                        await window.fb.setDoc(catRef, { nome: categoria.trim(), createdAt: Date.now() });
                    }
                } else {
                    if (!nome) throw new Error("Il nome del prodotto è obbligatorio");
                    await dbService.saveProduct(barId, id, {
                        nome, unita, categoria, fornitore, updatedAt: Date.now()
                    });
                }
                
                dataCache.clear(); 
                
                return isOnlyCategory;
            };

            saveProductBtn.disabled = true;
            saveProductBtn.style.opacity = "0.5";

            const isOnline = await networkService.isOnline();
            
            if (!isOnline) {
                alert("⚠️ Sei offline. L'azione verrà salvata localmente e sincronizzata appena torni online.");
                try {
                    const wasCategory = groupNome.classList.contains('hidden');
                    performDbOperation();
                    dataCache.clear();
                    _closingProgrammatically = true;
                    _closeModal();
                    history.back(); 
                    router.navigate(wasCategory ? '#admin/categories' : '#admin/products');
                } catch (err) { console.error(err); }
                return; 
            }

            ui.showLoader();
            try {
                const wasCategory = await performDbOperation();
                _closingProgrammatically = true;
                _closeModal();
                history.back();
                ui.showToast("Salvato con successo!");
                router.navigate(wasCategory ? '#admin/categories' : '#admin/products');
            } catch (e) {
                alert(e.message || "Errore nel salvataggio");
                saveProductBtn.disabled = false;
                saveProductBtn.style.opacity = "1";
            } finally {
                ui.hideLoader();
            }
        };

        if (selectUnitaQuick) {
            selectUnitaQuick.onchange = (e) => {
                if (e.target.value) modalProdUnita.value = e.target.value;
            };
        }
        if (selectCatQuick) {
            selectCatQuick.onchange = (e) => {
                if (e.target.value) modalProdCat.value = e.target.value;
            };
        }
        if (selectFornQuick) {
            selectFornQuick.onchange = (e) => {
                if (e.target.value) modalProdFornitore.value = e.target.value;
            };
        }
    },

    open(barId, currentCategory = '', product = null, isEditCategory = false) {
        currentBarId    = barId;
        oldCategoryName = isEditCategory ? currentCategory : null;

        productModal.classList.remove('hidden');
        history.pushState({ modal: true }, '');

        groupNome.classList.remove('hidden');
        groupUnita.classList.remove('hidden');
        groupFornitore.classList.remove('hidden');

        if (product) {
            modalTitle.textContent   = "Modifica Prodotto";
            modalProductId.value     = product.id;
            modalProdNome.value      = product.nome;
            modalProdUnita.value     = product.unita    || '';
            modalProdCat.value       = product.categoria;
            modalProdFornitore.value = product.fornitore;
        } else if (isEditCategory) {
            modalTitle.textContent   = "Modifica Categoria";
            modalProductId.value     = "";
            modalProdNome.value      = "";
            modalProdUnita.value     = "";
            modalProdCat.value       = currentCategory;
            modalProdFornitore.value = "";
            groupNome.classList.add('hidden');
            groupUnita.classList.add('hidden');
            groupFornitore.classList.add('hidden');
        } else if (currentCategory) {
            modalTitle.textContent   = "Nuovo Prodotto";
            modalProductId.value     = "";
            modalProdNome.value      = "";
            modalProdUnita.value     = "";
            modalProdCat.value       = currentCategory;
            modalProdFornitore.value = "";
        } else {
            modalTitle.textContent   = "Nuova Categoria";
            modalProductId.value     = "";
            modalProdNome.value      = "";
            modalProdUnita.value     = "";
            modalProdCat.value       = "";
            modalProdFornitore.value = "";
            groupNome.classList.add('hidden');
            groupUnita.classList.add('hidden');
            groupFornitore.classList.add('hidden');
        }

        _saveInitialValues();
        this.updateSuggestions(barId);
    },

    async updateSuggestions(barId) {
        try {
            let cats, prods;
            const cached = dataCache.get(barId);

            if (cached) {
                cats = cached.categorie;
                prods = cached.prodotti;
            } else {
                cats = await dbService.getCategories(barId);
                prods = await dbService.getProducts(barId);
            }

            existingCategories = cats;
            const forns = [...new Set(prods.map(p => p.fornitore).filter(Boolean))].sort();
            const unitaDinamiche = [...new Set(prods.map(p => p.unita).filter(Boolean))].sort();
            const tutteUnita = [...new Set([...UNITA_FISSE, ...unitaDinamiche])].sort();

            selectUnitaQuick.innerHTML = '<option value="">-- Suggerimenti --</option>';
            selectCatQuick.innerHTML   = '<option value="">-- Esistenti --</option>';
            selectFornQuick.innerHTML  = '<option value="">-- Esistenti --</option>';

            tutteUnita.forEach(u => selectUnitaQuick.add(new Option(u, u)));
            [...existingCategories]
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .forEach(c => selectCatQuick.add(new Option(c.nome, c.nome)));
            forns.forEach(f => selectFornQuick.add(new Option(f, f)));
        } catch (e) {
            console.error("Errore suggerimenti:", e);
        }
    }
};
import { ui } from './ui.js';
import { getIconHTML } from './icons.js';
import { dbService } from './services/db.js';
import { productModalManager } from './admin/productModal.js';
import { uiComponents } from './admin/uiComponents.js';
import { breadcrumbsManager } from './admin/breadcrumbs.js';

const adminView = document.getElementById('admin-view');
const breadcrumbsContainer = document.getElementById('breadcrumbs');

let currentPath = { barId: null, barName: '', category: '' };
let isSuperAdmin = false;

productModalManager.init((newCat) => {
    currentPath.category = newCat;
    renderProductList();
});

const closeModalBtn = document.getElementById('closeModalBtn');
const saveProductBtn = document.getElementById('saveProductBtn');
if (closeModalBtn) closeModalBtn.innerHTML = `${getIconHTML('cancel')} Annulla`;
if (saveProductBtn) saveProductBtn.innerHTML = `${getIconHTML('save')} Salva`;

window.renderBarList = renderBarList;
window.renderAdminChoice = renderAdminChoice;

window.addEventListener('superadmin-success', () => { isSuperAdmin = true; renderBarList(); });
window.addEventListener('admin-bar-choice', (e) => {
    isSuperAdmin = false;
    currentPath.barId = e.detail.barId;
    currentPath.barName = e.detail.barName;
    renderAdminChoice();
});

function updateUI() {
    breadcrumbsManager.render(breadcrumbsContainer, {
        path: currentPath,
        isSuperAdmin: isSuperAdmin,
        actions: {
            onGoBars: renderBarList,
            onGoHome: renderAdminChoice,
            onGoCategories: renderCategoryList
        }
    });
}

function renderAdminChoice() {
    updateUI();
    adminView.innerHTML = "";
    adminView.appendChild(uiComponents.createAdminChoiceMenu(
        () => {
            document.getElementById('admin-content').classList.add('hidden');
            document.getElementById('app-content').classList.remove('hidden');
            window.dispatchEvent(new CustomEvent('auth-success', { detail: { barId: currentPath.barId } }));
        },
        () => renderCategoryList()
    ));
}

async function renderBarList() {
    isSuperAdmin = true;
    currentPath = { barId: null, barName: '', category: '' };
    updateUI();
    adminView.innerHTML = `<div class="list-container">Caricamento bar...</div>`;

    try {
        const bars = await dbService.getBars();
        const list = adminView.querySelector('.list-container');
        list.innerHTML = "";
        bars.forEach(bar => {
            list.appendChild(uiComponents.createListItem(
                `<span>${bar.barName || bar.id}</span>`,
                () => { currentPath.barId = bar.id; currentPath.barName = bar.barName || "Bar"; renderCategoryList(); },
                () => deleteBar(bar.id)
            ));
        });
    } catch (e) { adminView.innerHTML = "Errore caricamento."; }
}

async function renderCategoryList() {
    currentPath.category = '';
    updateUI();
    adminView.innerHTML = "";
    adminView.appendChild(uiComponents.createAddButton("Nuova Categoria", () => productModalManager.open(currentPath.barId)));
    
    const list = document.createElement('div');
    list.className = "list-container";
    adminView.appendChild(list);

    try {
        const products = await dbService.getProducts(currentPath.barId);
        const categorie = [...new Set(products.map(p => p.categoria))].sort();
        categorie.forEach(cat => {
            if(!cat) return;
            list.appendChild(uiComponents.createListItem(cat, () => { currentPath.category = cat; renderProductList(); }));
        });
    } catch (e) { console.error(e); }
}

async function renderProductList() {
    updateUI();
    adminView.innerHTML = "";
    adminView.appendChild(uiComponents.createAddButton("Nuovo Prodotto", () => productModalManager.open(currentPath.barId, currentPath.category)));

    const list = document.createElement('div');
    list.className = "list-container";
    adminView.appendChild(list);

    try {
        const prodotti = await dbService.getProducts(currentPath.barId, currentPath.category);
        prodotti.forEach(p => {
            list.appendChild(uiComponents.createListItem(
                `<div><b>${p.nome}</b><br><small>${p.fornitore}</small></div>`,
                null, 
                () => deleteProduct(p.id),
                () => productModalManager.open(currentPath.barId, currentPath.category, p)
            ));
        });
    } catch (e) { console.error(e); }
}

async function deleteProduct(id) {
    if(confirm("Eliminare prodotto?")) {
        ui.showLoader();
        await dbService.deleteProduct(currentPath.barId, id);
        renderProductList();
        ui.hideLoader();
    }
}

async function deleteBar(id) {
    if(confirm("Eliminare bar e dati?")) {
        ui.showLoader();
        await dbService.deleteBar(id);
        renderBarList();
        ui.hideLoader();
    }
}
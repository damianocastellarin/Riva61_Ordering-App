import { ui } from './ui.js';
import { getIconHTML } from './icons.js';
import { dbService } from './services/db.js';
import { productModalManager } from './admin/productModal.js';
import { uiComponents } from './admin/uiComponents.js';

const adminView = document.getElementById('admin-view');
const breadcrumbs = document.getElementById('breadcrumbs');
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

function renderAdminChoice() {
    updateBreadcrumbs();
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
    updateBreadcrumbs();
    adminView.innerHTML = `<div class="list-container">Caricamento bar...</div>`;

    try {
        const bars = await dbService.getBars();
        const listContainer = adminView.querySelector('.list-container');
        listContainer.innerHTML = "";
        
        bars.forEach(bar => {
            const item = uiComponents.createListItem(
                `<span>${bar.barName || bar.id}</span>`,
                () => {
                    currentPath.barId = bar.id;
                    currentPath.barName = bar.barName || "Bar";
                    renderCategoryList();
                },
                () => deleteBar(bar.id)
            );
            listContainer.appendChild(item);
        });
    } catch (e) { adminView.innerHTML = "Errore caricamento bar."; }
}

async function renderCategoryList() {
    currentPath.category = '';
    updateBreadcrumbs();
    adminView.innerHTML = "";

    adminView.appendChild(uiComponents.createAddButton("Nuova Categoria", () => productModalManager.open(currentPath.barId)));
    
    const listContainer = document.createElement('div');
    listContainer.className = "list-container";
    adminView.appendChild(listContainer);

    try {
        const products = await dbService.getProducts(currentPath.barId);
        const categorie = [...new Set(products.map(p => p.categoria))].sort();
        
        categorie.forEach(cat => {
            if(!cat) return;
            const item = uiComponents.createListItem(
                `<span>${cat}</span>`,
                () => { currentPath.category = cat; renderProductList(); }
            );
            listContainer.appendChild(item);
        });
    } catch (e) { console.error(e); }
}

async function renderProductList() {
    updateBreadcrumbs();
    adminView.innerHTML = "";
    
    adminView.appendChild(uiComponents.createAddButton("Nuovo Prodotto", () => productModalManager.open(currentPath.barId, currentPath.category)));

    const listContainer = document.createElement('div');
    listContainer.className = "list-container";
    adminView.appendChild(listContainer);

    try {
        const prodotti = await dbService.getProducts(currentPath.barId, currentPath.category);
        prodotti.forEach(p => {
            const item = uiComponents.createListItem(
                `<div><b>${p.nome}</b><br><small>${p.fornitore}</small></div>`,
                null,
                () => deleteProduct(p.id),
                () => productModalManager.open(currentPath.barId, currentPath.category, p)
            );
            listContainer.appendChild(item);
        });
    } catch (e) { console.error(e); }
}

function updateBreadcrumbs() {
    breadcrumbs.innerHTML = "";
    const addStep = (label, action, isBold = false) => {
        const span = document.createElement(isBold ? 'b' : 'span');
        span.textContent = label;
        if(action) { span.style.cursor = "pointer"; span.onclick = action; }
        breadcrumbs.appendChild(span);
    };

    addStep(isSuperAdmin ? "Superadmin" : "Home", isSuperAdmin ? renderBarList : renderAdminChoice);
    
    if(currentPath.barId) {
        breadcrumbs.append(" > ");
        addStep(currentPath.barName, renderCategoryList);
    }
    if(currentPath.category) {
        breadcrumbs.append(" > ");
        addStep(currentPath.category, null, true);
    }
}

async function deleteProduct(id) {
    if(confirm("Eliminare prodotto?")) {
        ui.showLoader();
        try {
            await dbService.deleteProduct(currentPath.barId, id);
            renderProductList();
        } finally { ui.hideLoader(); }
    }
}

async function deleteBar(id) {
    if(confirm("Eliminare bar e dati?")) {
        ui.showLoader();
        try {
            await dbService.deleteBar(id);
            renderBarList();
        } finally { ui.hideLoader(); }
    }
}
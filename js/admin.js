import { dbService } from './services/db.js';
import { productModalManager } from './admin/productModal.js';
import { uiComponents } from './admin/uiComponents.js';
import { breadcrumbsManager } from './admin/breadcrumbs.js';
import { adminActions } from './admin/adminActions.js';
import { router } from './router.js';
import { navigator } from './order/navigator.js';

const adminView = document.getElementById('admin-view');
const breadcrumbsContainer = document.getElementById('breadcrumbs');
let currentPath = { barId: null, barName: '', category: '' };
let isSuperAdmin = false;

router.add('#admin/bars', () => renderBarList());
router.add('#admin/choice', () => renderAdminChoice());
router.add('#admin/categories', () => renderCategoryList());
router.add('#admin/products', () => renderProductList());

productModalManager.init((newCat, isOnlyCategory) => { 
    if (isOnlyCategory) router.navigate('#admin/categories');
    else { currentPath.category = newCat; router.navigate('#admin/products'); }
});

window.addEventListener('superadmin-success', () => { isSuperAdmin = true; router.navigate('#admin/bars'); });
window.addEventListener('admin-bar-choice', (e) => {
    isSuperAdmin = false;
    currentPath.barId = e.detail.barId;
    currentPath.barName = e.detail.barName;
    router.navigate('#admin/choice');
});

const updateUI = () => {
    navigator.goTo('ADMIN');
    breadcrumbsManager.render(breadcrumbsContainer, {
        path: currentPath, 
        isSuperAdmin, 
        actions: { 
            onGoBars: () => router.navigate('#admin/bars'), 
            onGoHome: () => router.navigate('#admin/choice'), 
            onGoCategories: () => router.navigate('#admin/categories') 
        }
    });
};

async function renderAdminChoice() {
    updateUI();
    adminView.innerHTML = "";
    adminView.appendChild(uiComponents.createAdminChoiceMenu(
        () => adminActions.goToOrders(currentPath.barId),
        () => router.navigate('#admin/categories')
    ));
}

async function renderBarList() {
    isSuperAdmin = true;
    currentPath = { barId: null, barName: '', category: '' };
    updateUI();
    adminView.innerHTML = `<div class="list-container"></div>`;
    const bars = await dbService.getBars();
    const list = adminView.querySelector('.list-container');
    bars.forEach(bar => list.appendChild(uiComponents.createListItem(
        `<span>${bar.barName || bar.id}</span>`,
        () => { currentPath.barId = bar.id; currentPath.barName = bar.barName || "Bar"; router.navigate('#admin/categories'); },
        () => adminActions.deleteBar(bar.id, () => router.navigate('#admin/bars'))
    )));
}

async function renderCategoryList() {
    currentPath.category = '';
    updateUI();
    adminView.innerHTML = "";
    adminView.appendChild(uiComponents.createAddButton("Nuova Categoria", () => productModalManager.open(currentPath.barId)));
    const list = document.createElement('div');
    list.className = "list-container";
    adminView.appendChild(list);
    const categorie = await dbService.getCategories(currentPath.barId);
    categorie.forEach(cat => list.appendChild(uiComponents.createListItem(
        cat.nome, 
        () => { currentPath.category = cat.nome; router.navigate('#admin/products'); },
        () => adminActions.deleteCategory(currentPath.barId, cat.nome, () => router.navigate('#admin/categories')),
        () => productModalManager.open(currentPath.barId, cat.nome, null, true)
    )));
}

async function renderProductList() {
    updateUI();
    adminView.innerHTML = "";
    adminView.appendChild(uiComponents.createAddButton("Nuovo Prodotto", () => productModalManager.open(currentPath.barId, currentPath.category)));
    const list = document.createElement('div');
    list.className = "list-container";
    adminView.appendChild(list);
    const prodotti = await dbService.getProducts(currentPath.barId, currentPath.category);
    prodotti.forEach(p => list.appendChild(uiComponents.createListItem(
        `<div><b>${p.nome}</b><br><small>${p.fornitore}</small></div>`,
        null, 
        () => adminActions.deleteProduct(currentPath.barId, p.id, () => router.navigate('#admin/products')),
        () => productModalManager.open(currentPath.barId, currentPath.category, p)
    )));
}
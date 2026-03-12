import { dbService } from './services/db.js';
import { productModalManager } from './admin/productModal.js';
import { uiComponents } from './admin/uiComponents.js';
import { breadcrumbsManager } from './admin/breadcrumbs.js';
import { adminActions } from './admin/adminActions.js';

const adminView = document.getElementById('admin-view');
const breadcrumbsContainer = document.getElementById('breadcrumbs');
let currentPath = { barId: null, barName: '', category: '' };
let isSuperAdmin = false;

productModalManager.init((newCat, isOnlyCategory) => { 
    if (isOnlyCategory) {
        renderCategoryList();
    } else {
        currentPath.category = newCat; 
        renderProductList();
    }
});

window.renderBarList = renderBarList;
window.renderAdminChoice = renderAdminChoice;

window.addEventListener('superadmin-success', () => { 
    isSuperAdmin = true; 
    renderBarList(); 
});

window.addEventListener('admin-bar-choice', (e) => {
    isSuperAdmin = false;
    currentPath.barId = e.detail.barId;
    currentPath.barName = e.detail.barName;
    renderAdminChoice();
});

const updateUI = () => breadcrumbsManager.render(breadcrumbsContainer, {
    path: currentPath, 
    isSuperAdmin, 
    actions: { 
        onGoBars: renderBarList, 
        onGoHome: renderAdminChoice, 
        onGoCategories: renderCategoryList 
    }
});

function renderAdminChoice() {
    updateUI();
    adminView.innerHTML = "";
    adminView.appendChild(uiComponents.createAdminChoiceMenu(
        () => adminActions.goToOrders(currentPath.barId),
        () => renderCategoryList()
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
        () => { 
            currentPath.barId = bar.id; 
            currentPath.barName = bar.barName || "Bar"; 
            renderCategoryList(); 
        },
        () => adminActions.deleteBar(bar.id, renderBarList)
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
    
    categorie.forEach(cat => {
        list.appendChild(uiComponents.createListItem(
            cat.nome, 
            () => { 
                currentPath.category = cat.nome; 
                renderProductList(); 
            },
            () => adminActions.deleteCategory(currentPath.barId, cat.nome, renderCategoryList)
        ));
    });
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
        () => adminActions.deleteProduct(currentPath.barId, p.id, renderProductList),
        () => productModalManager.open(currentPath.barId, currentPath.category, p)
    )));
}
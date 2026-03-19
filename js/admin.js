import { dbService } from './services/db.js';
import { productModalManager } from './admin/productModal.js';
import { uiComponents } from './admin/uiComponents.js';
import { breadcrumbsManager } from './admin/breadcrumbs.js';
import { adminActions } from './admin/adminActions.js';
import { router } from './router.js';
import { session } from './session.js';
import { ui } from './ui.js';

const adminView            = document.getElementById('admin-view');
const adminContent         = document.getElementById('admin-content');
const breadcrumbsContainer = document.getElementById('breadcrumbs');

const PATH_KEY     = 'admin_current_path';
const DEFAULT_PATH = { barId: null, barName: '', category: '' };

function saveCurrentPath() {
    sessionStorage.setItem(PATH_KEY, JSON.stringify(currentPath));
}

function loadCurrentPath() {
    try {
        const saved = sessionStorage.getItem(PATH_KEY);
        return saved ? JSON.parse(saved) : { ...DEFAULT_PATH };
    } catch (e) {
        return { ...DEFAULT_PATH };
    }
}

let currentPath = loadCurrentPath();

function guard(requiredRole = 'any') {
    if (session.role === null) return false;

    if (!session.isAnyAdmin()) {
        window.location.replace('./index.html');
        return false;
    }

    if (requiredRole === 'superadmin' && !session.isSuperAdmin()) {
        router.replace('#admin/choice');
        return false;
    }

    if (requiredRole === 'admin' && session.isSuperAdmin()) {
        router.replace('#admin/bars');
        return false;
    }

    return true;
}

router.add('#admin/bars',       () => renderBarList());
router.add('#admin/choice',     () => renderAdminChoice());
router.add('#admin/categories', () => renderCategoryList());
router.add('#admin/products',   () => renderProductList());

productModalManager.init();

window.addEventListener('superadmin-success', () => {
    currentPath = { ...DEFAULT_PATH };
    saveCurrentPath();
    if (adminContent) adminContent.classList.remove('hidden');
    router.replace('#admin/bars');
});

window.addEventListener('admin-bar-choice', (e) => {
    currentPath.barId    = e.detail.barId;
    currentPath.barName  = e.detail.barName;
    currentPath.category = '';
    saveCurrentPath();
    if (adminContent) adminContent.classList.remove('hidden');
    router.replace('#admin/choice');
});

function updateUI() {
    breadcrumbsManager.render(breadcrumbsContainer, {
        path: currentPath,
        isSuperAdmin: session.isSuperAdmin(),
        actions: {
            onGoBars:       () => router.replace('#admin/bars'),
            onGoHome:       () => router.replace('#admin/choice'),
            onGoCategories: () => router.replace('#admin/categories')
        }
    });
}

function renderAdminChoice() {
    if (!guard('admin')) return;
    updateUI();
    adminView.innerHTML = "";
    adminView.appendChild(uiComponents.createAdminChoiceMenu(
        () => adminActions.goToOrders(currentPath.barId),
        () => router.navigate('#admin/categories')
    ));
    ui.hideLoader();
}

async function renderBarList() {
    if (!guard('superadmin')) return;
    const navId = router.currentRouteId();
    try {
        currentPath = { ...DEFAULT_PATH };
        saveCurrentPath();
        updateUI();
        adminView.innerHTML = `<div class="list-container"></div>`;

        const bars = await dbService.getBars();
        if (router.currentRouteId() !== navId) return;

        const list = adminView.querySelector('.list-container');
        bars.forEach(bar => list.appendChild(uiComponents.createListItem(
            `<span>${bar.barName || bar.id}</span>`,
            () => {
                currentPath.barId   = bar.id;
                currentPath.barName = bar.barName || "Bar";
                saveCurrentPath();
                router.navigate('#admin/categories');
            },
            () => adminActions.deleteBar(bar.id)
        )));
    } finally {
        if (router.currentRouteId() === navId) ui.hideLoader();
    }
}

async function renderCategoryList() {
    if (!guard('any')) return;
    if (!currentPath.barId) {
        router.replace(session.isSuperAdmin() ? '#admin/bars' : '#admin/choice');
        return;
    }
    const navId = router.currentRouteId();
    try {
        currentPath.category = '';
        saveCurrentPath();
        updateUI();
        adminView.innerHTML = "";
        adminView.appendChild(uiComponents.createAddButton(
            "Nuova Categoria",
            () => productModalManager.open(currentPath.barId)
        ));

        const list = document.createElement('div');
        list.className = "list-container";
        adminView.appendChild(list);

        const categorie = await dbService.getCategories(currentPath.barId);
        if (router.currentRouteId() !== navId) return;

        categorie.forEach(cat => list.appendChild(uiComponents.createListItem(
            cat.nome,
            () => {
                currentPath.category = cat.nome;
                saveCurrentPath();
                router.navigate('#admin/products');
            },
            () => adminActions.deleteCategory(currentPath.barId, cat.nome),
            () => productModalManager.open(currentPath.barId, cat.nome, null, true)
        )));
    } finally {
        if (router.currentRouteId() === navId) ui.hideLoader();
    }
}

async function renderProductList() {
    if (!guard('any')) return;
    if (!currentPath.barId || !currentPath.category) {
        router.replace(currentPath.barId ? '#admin/categories' : '#admin/bars');
        return;
    }
    const navId = router.currentRouteId();
    try {
        updateUI();
        adminView.innerHTML = "";
        adminView.appendChild(uiComponents.createAddButton(
            "Nuovo Prodotto",
            () => productModalManager.open(currentPath.barId, currentPath.category)
        ));

        const list = document.createElement('div');
        list.className = "list-container";
        adminView.appendChild(list);

        const prodotti = await dbService.getProducts(currentPath.barId, currentPath.category);
        if (router.currentRouteId() !== navId) return;

        prodotti.forEach(p => list.appendChild(uiComponents.createListItem(
            `<div><b>${p.nome}</b><br><small>${p.fornitore}</small></div>`,
            null,
            () => adminActions.deleteProduct(currentPath.barId, p.id),
            () => productModalManager.open(currentPath.barId, currentPath.category, p)
        )));
    } finally {
        if (router.currentRouteId() === navId) ui.hideLoader();
    }
}

router.init();
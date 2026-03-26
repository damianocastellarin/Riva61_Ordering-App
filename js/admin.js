import { dbService } from './services/db.js';
import { productModalManager } from './admin/productModal.js';
import { uiComponents } from './admin/uiComponents.js';
import { breadcrumbsManager } from './admin/breadcrumbs.js';
import { adminActions } from './admin/adminActions.js';
import { router } from './router.js';
import { session } from './session.js';
import { getIconHTML } from './icons.js';
import { ui } from './ui.js';
import { dataCache } from './services/dataCache.js';
import { homeView } from './views/homeView.js';
import { orderView } from './views/orderView.js';
import { summaryView } from './views/summaryView.js';

const adminView            = document.getElementById('admin-view');
const adminContent         = document.getElementById('admin-content');
const breadcrumbsContainer = document.getElementById('breadcrumbs');

let CATEGORIE_DINAMICHE = [];
let PRODOTTI_DATA       = [];

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
        router.replace('#admin/categories');
        return false;
    }
    if (requiredRole === 'admin' && session.isSuperAdmin()) {
        router.replace('#admin/bars');
        return false;
    }
    return true;
}

function showAdminContent() {
    document.getElementById('app-content')?.classList.add('hidden');
    document.getElementById('progressContainer')?.classList.add('hidden');
    if (adminContent) adminContent.classList.remove('hidden');
}

function showOrderContent() {
    if (adminContent) adminContent.classList.add('hidden');
    document.getElementById('app-content')?.classList.remove('hidden');
}

router.add('#admin/bars',       () => renderBarList());
router.add('#admin/categories', () => renderCategoryList());
router.add('#admin/products',   () => renderProductList());
router.add('#admin/profile',    () => renderAdminProfile());

router.add('#home',      ()      => { showOrderContent(); homeView.render(CATEGORIE_DINAMICHE); });
router.add('#step',      (param) => { showOrderContent(); orderView.render(CATEGORIE_DINAMICHE, param); });
router.add('#riepilogo', ()      => { showOrderContent(); summaryView.render(PRODOTTI_DATA, CATEGORIE_DINAMICHE); });

ui.initAdminButtons();
productModalManager.init();

async function _loadOrderData(barId) {
    const cached = dataCache.get(barId);
    if (cached) {
        PRODOTTI_DATA       = cached.prodotti;
        CATEGORIE_DINAMICHE = cached.categorie;
        return;
    }
    PRODOTTI_DATA       = await dbService.getProducts(barId);
    CATEGORIE_DINAMICHE = _prepareCategories(PRODOTTI_DATA);
    dataCache.set(barId, PRODOTTI_DATA, CATEGORIE_DINAMICHE);
}

window.addEventListener('superadmin-success', () => {
    currentPath = { ...DEFAULT_PATH };
    saveCurrentPath();
    showAdminContent();
    document.getElementById('logoutAdminBtn')?.classList.remove('hidden');
    router.replace('#admin/bars');
});

window.addEventListener('admin-bar-choice', async (e) => {
    currentPath.barId    = e.detail.barId;
    currentPath.barName  = e.detail.barName;
    currentPath.category = '';
    saveCurrentPath();
    showAdminContent();
    try {
        await _loadOrderData(currentPath.barId);
    } catch (err) {
        console.error("Errore precaricamento dati ordine:", err);
    }
    router.replace('#admin/categories');
});

window.addEventListener('bottomnav-user-order', () => {
    router.replace('#home');
});

function showBreadcrumbs() {
    breadcrumbsManager.render(breadcrumbsContainer, {
        path:         currentPath,
        isSuperAdmin: session.isSuperAdmin(),
        actions: {
            onGoBars:       () => router.replace('#admin/bars'),
            onGoHome:       () => router.replace('#admin/categories'),
            onGoCategories: () => router.replace('#admin/categories')
        }
    });
}

function clearBreadcrumbs() {
    if (breadcrumbsContainer) breadcrumbsContainer.innerHTML = '';
}

async function renderBarList() {
    if (!guard('superadmin')) return;
    showAdminContent();
    const navId = router.currentRouteId();
    try {
        currentPath = { ...DEFAULT_PATH };
        saveCurrentPath();
        showBreadcrumbs();
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
        router.replace(session.isSuperAdmin() ? '#admin/bars' : '#admin/categories');
        return;
    }
    showAdminContent();
    const navId = router.currentRouteId();
    try {
        currentPath.category = '';
        saveCurrentPath();
        showBreadcrumbs();
        adminView.innerHTML = '';
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
    showAdminContent();
    const navId = router.currentRouteId();
    try {
        showBreadcrumbs();
        adminView.innerHTML = '';
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
            `<div>
                <b>${p.nome}</b>
                ${p.unita ? `<span style="color:var(--text-muted);font-size:0.8rem"> · ${p.unita}</span>` : ''}
                <br><small>${p.fornitore}</small>
            </div>`,
            null,
            () => adminActions.deleteProduct(currentPath.barId, p.id),
            () => productModalManager.open(currentPath.barId, currentPath.category, p)
        )));
    } finally {
        if (router.currentRouteId() === navId) ui.hideLoader();
    }
}

function renderAdminProfile() {
    if (!guard('admin')) return;
    showAdminContent();
    clearBreadcrumbs();

    adminView.innerHTML = '';
    const card = document.createElement('div');
    card.innerHTML = `
        <div class="profile-card">
            <div class="profile-avatar">${getIconHTML('profile')}</div>
            <h2 class="profile-bar-name">${session.barName || 'Bar'}</h2>
            <span class="profile-role-badge">Amministratore</span>
            ${session.email
                ? `<p class="profile-email">${session.email}</p>`
                : ''}
        </div>
        <div class="profile-actions">
            <button id="logoutAdminBtn" class="btn-danger">
                ${getIconHTML('logout')} Esci dall'account
            </button>
        </div>
    `;
    adminView.appendChild(card);
    ui.hideLoader();
}

function _prepareCategories(prodottiScaricati) {
    if (!prodottiScaricati || prodottiScaricati.length === 0) return [];
    const nomiCategorie = [...new Set(prodottiScaricati.map(p => p.categoria))];
    return nomiCategorie.map(nomeCat => ({
        nome:     nomeCat,
        prodotti: prodottiScaricati
            .filter(p => p.categoria === nomeCat)
            .map(p => ({ nome: p.nome, unita: p.unita || '' }))
    }));
}

router.init();
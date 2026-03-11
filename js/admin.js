import { ui } from './ui.js';
import { getIconHTML } from './icons.js';
import { dbService } from './services/db.js';
import { productModalManager } from './admin/productModal.js';

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
window.renderCategoryList = renderCategoryList;

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
    const container = document.createElement('div');
    container.style.cssText = "display:flex; flex-direction:column; gap:20px; padding:20px;";

    const btnOrders = document.createElement('button');
    btnOrders.className = "btn-primary";
    btnOrders.style.cssText = "height:80px; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:10px;";
    btnOrders.innerHTML = `${getIconHTML('save')} FAI ORDINI`;
    btnOrders.onclick = () => {
        document.getElementById('admin-content').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        window.dispatchEvent(new CustomEvent('auth-success', { detail: { barId: currentPath.barId } }));
    };

    const btnEdit = document.createElement('button');
    btnEdit.className = "btn-secondary";
    btnEdit.style.cssText = "height:80px; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:10px;";
    btnEdit.innerHTML = `${getIconHTML('edit')} MODIFICA PRODOTTI`;
    btnEdit.onclick = () => renderCategoryList();

    container.append(btnOrders, btnEdit);
    adminView.appendChild(container);
}

async function renderBarList() {
    isSuperAdmin = true;
    currentPath = { barId: null, barName: '', category: '' };
    updateBreadcrumbs();
    adminView.innerHTML = `<div class="list-container">Caricamento bar...</div>`;

    try {
        const bars = await dbService.getBars();
        const list = adminView.querySelector('.list-container');
        list.textContent = "";
        
        bars.forEach(bar => {
            const item = document.createElement('div');
            item.className = 'admin-item';
            item.innerHTML = `<span>${bar.barName || bar.id}</span>`;
            
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.innerHTML = getIconHTML('delete');
            delBtn.onclick = (e) => { e.stopPropagation(); deleteBar(bar.id); };

            item.append(delBtn);
            item.onclick = (e) => {
                if(!e.target.closest('.delete-btn')) {
                    currentPath.barId = bar.id;
                    currentPath.barName = bar.barName || "Bar";
                    renderCategoryList();
                }
            };
            list.appendChild(item);
        });
    } catch (e) { console.error(e); adminView.innerHTML = "Errore."; }
}

async function renderCategoryList() {
    currentPath.category = '';
    updateBreadcrumbs();
    adminView.innerHTML = "";

    const addBtn = document.createElement('button');
    addBtn.className = "btn-secondary";
    addBtn.style.marginBottom = "10px";
    addBtn.innerHTML = `${getIconHTML('add')} Nuova Categoria`;
    addBtn.onclick = () => productModalManager.open(currentPath.barId);
    
    const list = document.createElement('div');
    list.className = "list-container";
    adminView.append(addBtn, list);

    try {
        const products = await dbService.getProducts(currentPath.barId);
        const categorie = [...new Set(products.map(p => p.categoria))].sort();
        categorie.forEach(cat => {
            if(!cat) return;
            const item = document.createElement('div');
            item.className = 'admin-item';
            item.textContent = cat;
            item.onclick = () => { currentPath.category = cat; renderProductList(); };
            list.appendChild(item);
        });
    } catch (e) { console.error(e); }
}

async function renderProductList() {
    updateBreadcrumbs();
    adminView.innerHTML = "";
    
    const addBtn = document.createElement('button');
    addBtn.className = "btn-secondary";
    addBtn.style.marginBottom = "10px";
    addBtn.innerHTML = `${getIconHTML('add')} Nuovo Prodotto`;
    addBtn.onclick = () => productModalManager.open(currentPath.barId, currentPath.category);

    const list = document.createElement('div');
    list.className = "list-container";
    adminView.append(addBtn, list);

    try {
        const prodotti = await dbService.getProducts(currentPath.barId, currentPath.category);
        prodotti.forEach(p => {
            const item = document.createElement('div');
            item.className = 'admin-item';
            item.innerHTML = `
                <div><b>${p.nome}</b><br><small>${p.fornitore}</small></div>
                <div class="actions">
                    <button class="edit-btn">${getIconHTML('edit')}</button>
                    <button class="delete-btn">${getIconHTML('delete')}</button>
                </div>`;
            
            item.querySelector('.edit-btn').onclick = () => productModalManager.open(currentPath.barId, currentPath.category, p);
            item.querySelector('.delete-btn').onclick = () => deleteProduct(p.id);
            list.appendChild(item);
        });
    } catch (e) { console.error(e); }
}

function updateBreadcrumbs() {
    breadcrumbs.innerHTML = "";
    const base = document.createElement('span');
    base.style.cursor = "pointer";
    base.innerHTML = isSuperAdmin ? `${getIconHTML('admin')} Superadmin` : `${getIconHTML('back')} Home`;
    base.onclick = isSuperAdmin ? renderBarList : renderAdminChoice;
    breadcrumbs.appendChild(base);
    
    if(currentPath.barId) {
        breadcrumbs.append(" > ");
        const barSpan = document.createElement('span');
        barSpan.textContent = currentPath.barName;
        barSpan.style.cursor = "pointer";
        barSpan.onclick = renderCategoryList;
        breadcrumbs.appendChild(barSpan);
    }
    if(currentPath.category) {
        breadcrumbs.append(" > ");
        const catB = document.createElement('b');
        catB.textContent = currentPath.category;
        breadcrumbs.appendChild(catB);
    }
}

async function deleteProduct(id) {
    if(confirm("Eliminare prodotto?")) {
        ui.showLoader();
        try {
            await dbService.deleteProduct(currentPath.barId, id);
            renderProductList();
        } catch(e) { console.error(e); } finally { ui.hideLoader(); }
    }
}

async function deleteBar(id) {
    if(confirm("Eliminare bar e dati?")) {
        ui.showLoader();
        try {
            await dbService.deleteBar(id);
            renderBarList();
        } catch(e) { console.error(e); } finally { ui.hideLoader(); }
    }
}
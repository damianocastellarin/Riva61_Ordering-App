import { ui } from './ui.js';

const adminView = document.getElementById('admin-view');
const breadcrumbs = document.getElementById('breadcrumbs');

const productModal = document.getElementById('productModal');
const modalTitle = document.getElementById('modalTitle');
const modalProductId = document.getElementById('modalProductId');
const modalProdNome = document.getElementById('modalProdNome');
const modalProdCat = document.getElementById('modalProdCat');
const modalProdFornitore = document.getElementById('modalProdFornitore');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveProductBtn = document.getElementById('saveProductBtn');

let currentPath = { barId: null, barName: '', category: '' };
let isSuperAdmin = false;

window.renderBarList = renderBarList;
window.renderAdminChoice = renderAdminChoice;
window.renderCategoryList = renderCategoryList;
window.openModal = openModal;
window.deleteProduct = deleteProduct;

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
    btnOrders.style.cssText = "height:100px; font-weight:bold;";
    btnOrders.textContent = "🚀 FAI ORDINI";
    btnOrders.onclick = () => {
        document.getElementById('admin-content').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        window.dispatchEvent(new CustomEvent('auth-success', { detail: { barId: currentPath.barId } }));
    };

    const btnEdit = document.createElement('button');
    btnEdit.className = "btn-secondary";
    btnEdit.style.cssText = "height:100px; font-weight:bold;";
    btnEdit.textContent = "⚙️ MODIFICA PRODOTTI";
    btnEdit.onclick = () => renderCategoryList();

    container.appendChild(btnOrders);
    container.appendChild(btnEdit);
    adminView.appendChild(container);
}

async function renderBarList() {
    isSuperAdmin = true;
    currentPath = { barId: null, barName: '', category: '' };
    updateBreadcrumbs();
    
    adminView.innerHTML = "";
    const list = document.createElement('div');
    list.className = "list-container";
    list.textContent = "Caricamento bar...";
    adminView.appendChild(list);

    try {
        const querySnapshot = await window.fb.getDocs(window.fb.collection(window.fb.db, "users"));
        list.textContent = "";
        
        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            if(data.role === 'admin') {
                const item = document.createElement('div');
                item.className = 'admin-item';
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = data.barName || docSnap.id;
                
                const delBtn = document.createElement('button');
                delBtn.className = 'delete-btn';
                delBtn.textContent = 'Elimina';
                delBtn.onclick = (e) => { 
                    e.stopPropagation(); 
                    deleteBar(docSnap.id); 
                };

                item.appendChild(nameSpan);
                item.appendChild(delBtn);
                
                item.onclick = (e) => {
                    if(e.target !== delBtn) {
                        currentPath.barId = data.barId || docSnap.id;
                        currentPath.barName = data.barName || "Bar";
                        renderCategoryList();
                    }
                };
                list.appendChild(item);
            }
        });
    } catch (e) { console.error(e); list.textContent = "Errore nel caricamento."; }
}

async function renderCategoryList() {
    currentPath.category = '';
    updateBreadcrumbs();
    adminView.innerHTML = "";

    const addBtn = document.createElement('button');
    addBtn.className = "btn-secondary";
    addBtn.textContent = "+ Nuova Categoria";
    addBtn.onclick = () => openModal();
    adminView.appendChild(addBtn);

    const list = document.createElement('div');
    list.className = "list-container";
    adminView.appendChild(list);

    try {
        const prodRef = window.fb.collection(window.fb.db, "bars", currentPath.barId, "prodotti");
        const snap = await window.fb.getDocs(prodRef);
        const categorie = [...new Set(snap.docs.map(d => d.data().categoria))].sort();
        
        categorie.forEach(cat => {
            if(!cat) return;
            const item = document.createElement('div');
            item.className = 'admin-item';
            
            const span = document.createElement('span');
            span.textContent = cat;
            item.appendChild(span);
            
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
    addBtn.textContent = "+ Nuovo Prodotto";
    addBtn.onclick = () => openModal();
    adminView.appendChild(addBtn);

    const list = document.createElement('div');
    list.className = "list-container";
    adminView.appendChild(list);

    try {
        const prodRef = window.fb.collection(window.fb.db, "bars", currentPath.barId, "prodotti");
        const q = window.fb.query(prodRef, window.fb.where("categoria", "==", currentPath.category));
        const snap = await window.fb.getDocs(q);
        
        snap.forEach(docSnap => {
            const p = docSnap.data();
            const item = document.createElement('div');
            item.className = 'admin-item';

            const info = document.createElement('div');
            const b = document.createElement('b');
            b.textContent = p.nome;
            const br = document.createElement('br');
            const small = document.createElement('small');
            small.textContent = p.fornitore;
            info.append(b, br, small);

            const actions = document.createElement('div');
            const editBtn = document.createElement('button');
            editBtn.className = "edit-btn";
            editBtn.textContent = "✏️";
            editBtn.onclick = () => openModal({id: docSnap.id, ...p});

            const delBtn = document.createElement('button');
            delBtn.className = "delete-btn";
            delBtn.textContent = "X";
            delBtn.onclick = () => deleteProduct(docSnap.id);

            actions.append(editBtn, delBtn);
            item.append(info, actions);
            list.appendChild(item);
        });
    } catch (e) { console.error(e); }
}

async function openModal(product = null) {
    ui.showLoader();
    await updateSuggestions();
    ui.hideLoader();

    if (product) {
        modalTitle.textContent = "Modifica Prodotto";
        modalProductId.value = product.id;
        modalProdNome.value = product.nome;
        modalProdCat.value = product.categoria;
        modalProdFornitore.value = product.fornitore;
    } else {
        modalTitle.textContent = "Nuovo Prodotto";
        modalProductId.value = "";
        modalProdNome.value = "";
        modalProdCat.value = currentPath.category || "";
        modalProdFornitore.value = "";
    }
    productModal.classList.remove('hidden');
}

async function updateSuggestions() {
    try {
        const prodRef = window.fb.collection(window.fb.db, "bars", currentPath.barId, "prodotti");
        const snap = await window.fb.getDocs(prodRef);
        const data = snap.docs.map(d => d.data());
        const cats = [...new Set(data.map(p => p.categoria))].sort();
        const forns = [...new Set(data.map(p => p.fornitore))].sort();
        
        const selectCat = document.getElementById('selectCatQuick');
        const selectForn = document.getElementById('selectFornQuick');
        
        selectCat.innerHTML = "";
        selectForn.innerHTML = "";
        
        const optDefaultCat = new Option("-- Esistenti --", "");
        selectCat.add(optDefaultCat);
        cats.forEach(c => selectCat.add(new Option(c, c)));

        const optDefaultForn = new Option("-- Esistenti --", "");
        selectForn.add(optDefaultForn);
        forns.forEach(f => selectForn.add(new Option(f, f)));

    } catch (e) { console.error("Errore suggerimenti:", e); }
}

saveProductBtn.onclick = async () => {
    const id = modalProductId.value;
    const data = {
        nome: modalProdNome.value.trim(),
        categoria: modalProdCat.value.trim(),
        fornitore: modalProdFornitore.value.trim() || "N/A",
        updatedAt: Date.now()
    };

    if (!data.nome || !data.categoria) return alert("Nome e Categoria sono obbligatori");

    ui.showLoader();
    try {
        const prodRef = window.fb.collection(window.fb.db, "bars", currentPath.barId, "prodotti");
        if (id) {
            await window.fb.setDoc(window.fb.doc(window.fb.db, "bars", currentPath.barId, "prodotti", id), data, { merge: true });
        } else {
            data.createdAt = Date.now();
            await window.fb.addDoc(prodRef, data);
        }
        productModal.classList.add('hidden');
        ui.showToast("Salvato con successo!");
        currentPath.category = data.categoria;
        renderProductList();
    } catch (e) { 
        console.error(e); 
        alert("Errore durante il salvataggio");
    } finally {
        ui.hideLoader();
    }
};

closeModalBtn.onclick = () => productModal.classList.add('hidden');

function updateBreadcrumbs() {
    breadcrumbs.innerHTML = "";
    
    const base = document.createElement('span');
    base.style.cssText = "cursor:pointer; color:blue; text-decoration:underline;";
    base.textContent = isSuperAdmin ? "Superadmin" : "Home";
    base.onclick = isSuperAdmin ? renderBarList : renderAdminChoice;
    breadcrumbs.appendChild(base);

    if(currentPath.barId) {
        breadcrumbs.append(" > ");
        const barSpan = document.createElement('span');
        barSpan.style.cssText = "cursor:pointer; color:blue; text-decoration:underline;";
        barSpan.textContent = currentPath.barName;
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
    if(confirm("Eliminare?")) {
        ui.showLoader();
        try {
            await window.fb.deleteDoc(window.fb.doc(window.fb.db, "bars", currentPath.barId, "prodotti", id));
            ui.showToast("Eliminato");
            renderProductList();
        } catch(e) { console.error(e); }
        finally { ui.hideLoader(); }
    }
}

async function deleteBar(id) {
    if(confirm("Eliminare bar? Tutti i prodotti associati non saranno più visibili (ma resteranno nel DB, andrebbero cancellati manualmente o con Cloud Function)")) {
        ui.showLoader();
        try {
            await window.fb.deleteDoc(window.fb.doc(window.fb.db, "users", id));
            ui.showToast("Bar eliminato");
            renderBarList();
        } catch(e) { console.error(e); }
        finally { ui.hideLoader(); }
    }
}
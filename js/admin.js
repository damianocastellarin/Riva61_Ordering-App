const adminView = document.getElementById('admin-view');
const breadcrumbs = document.getElementById('breadcrumbs');
let currentPath = { barId: null, barName: '', category: '' };
let isSuperAdmin = false;

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

function renderAdminChoice() {
    breadcrumbs.innerHTML = `<span>Gestione: ${currentPath.barName}</span>`;
    adminView.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:20px; padding:20px;">
            <button class="btn-primary" id="btnGoOrders" style="height:100px; font-weight:bold;">🚀 FAI ORDINI</button>
            <button class="btn-secondary" id="btnGoEdit" style="height:100px; font-weight:bold;">⚙️ MODIFICA PRODOTTI</button>
        </div>
    `;

    document.getElementById('btnGoOrders').onclick = () => {
        document.getElementById('admin-content').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        window.dispatchEvent(new CustomEvent('auth-success', { detail: { barId: currentPath.barId } }));
    };

    document.getElementById('btnGoEdit').onclick = () => renderCategoryList();
}

async function renderBarList() {
    isSuperAdmin = true;
    currentPath = { barId: null, barName: '', category: '' };
    updateBreadcrumbs();
    adminView.innerHTML = `<div class="list-container" id="barList">Caricamento bar...</div>`;
    
    try {
        const querySnapshot = await window.fb.getDocs(window.fb.collection(window.fb.db, "users"));
        const list = document.getElementById('barList');
        list.innerHTML = "";
        
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if(data.role === 'admin') {
                const item = document.createElement('div');
                item.className = 'admin-item';
                item.innerHTML = `<span>${data.barName || doc.id}</span> <button class="delete-btn">Elimina</button>`;
                item.onclick = (e) => {
                    if(e.target.tagName !== 'BUTTON') {
                        currentPath.barId = data.barId || doc.id;
                        currentPath.barName = data.barName;
                        renderCategoryList();
                    }
                };
                item.querySelector('.delete-btn').onclick = (e) => {
                    e.stopPropagation();
                    deleteBar(doc.id);
                };
                list.appendChild(item);
            }
        });
    } catch (e) { console.error(e); }
}

async function renderCategoryList() {
    currentPath.category = '';
    updateBreadcrumbs();
    adminView.innerHTML = `
        <button class="btn-secondary" id="addCatBtn">+ Nuova Categoria</button>
        <div class="list-container" id="catList"></div>
    `;
    document.getElementById('addCatBtn').onclick = addCategoryPrompt;

    const prodRef = window.fb.collection(window.fb.db, "bars", currentPath.barId, "prodotti");
    const snap = await window.fb.getDocs(prodRef);
    const categorie = [...new Set(snap.docs.map(d => d.data().categoria))];
    const list = document.getElementById('catList');
    
    categorie.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `<span>${cat}</span>`;
        item.onclick = () => { currentPath.category = cat; renderProductList(); };
        list.appendChild(item);
    });
}

async function renderProductList() {
    updateBreadcrumbs();
    adminView.innerHTML = `
        <button class="btn-secondary" id="addProdBtn">+ Nuovo Prodotto</button>
        <div class="list-container" id="prodList"></div>
    `;
    document.getElementById('addProdBtn').onclick = addProductPrompt;

    const prodRef = window.fb.collection(window.fb.db, "bars", currentPath.barId, "prodotti");
    const q = window.fb.query(prodRef, window.fb.where("categoria", "==", currentPath.category));
    const snap = await window.fb.getDocs(q);
    const list = document.getElementById('prodList');
    
    snap.forEach(doc => {
        const p = doc.data();
        const item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `<div><b>${p.nome}</b><br><small>${p.fornitore}</small></div><button class="delete-btn">X</button>`;
        item.querySelector('.delete-btn').onclick = () => deleteProduct(doc.id);
        list.appendChild(item);
    });
}

function updateBreadcrumbs() {
    let html = "";
    if (isSuperAdmin) {
        html += `<span onclick="renderBarList()" style="cursor:pointer; color:blue">Admin</span>`;
    } else {
        html += `<span onclick="renderAdminChoice()" style="cursor:pointer; color:blue">Home</span>`;
    }
    
    if(currentPath.barId) html += ` > <span onclick="renderCategoryList()" style="cursor:pointer">${currentPath.barName}</span>`;
    if(currentPath.category) html += ` > <b>${currentPath.category}</b>`;
    breadcrumbs.innerHTML = html;
}

async function addCategoryPrompt() {
    const cat = prompt("Categoria:");
    if(cat) { currentPath.category = cat; addProductPrompt(); }
}

async function addProductPrompt() {
    const nome = prompt("Nome prodotto:");
    const fornitore = prompt("Fornitore:");
    if(!nome) return;
    await window.fb.addDoc(window.fb.collection(window.fb.db, "bars", currentPath.barId, "prodotti"), {
        nome, fornitore: fornitore || "N/A", categoria: currentPath.category, createdAt: Date.now()
    });
    renderProductList();
}

async function deleteProduct(id) {
    if(confirm("Eliminare?")) {
        await window.fb.deleteDoc(window.fb.doc(window.fb.db, "bars", currentPath.barId, "prodotti", id));
        renderProductList();
    }
}

async function deleteBar(id) {
    if(confirm("Eliminare bar?")) {
        await window.fb.deleteDoc(window.fb.doc(window.fb.db, "users", id));
        renderBarList();
    }
}
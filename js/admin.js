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

window.addEventListener('superadmin-success', () => { isSuperAdmin = true; renderBarList(); });
window.addEventListener('admin-bar-choice', (e) => {
    isSuperAdmin = false;
    currentPath.barId = e.detail.barId;
    currentPath.barName = e.detail.barName;
    renderAdminChoice();
});

function renderAdminChoice() {
    updateBreadcrumbs();
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
                        currentPath.barName = data.barName || "Bar";
                        renderCategoryList();
                    }
                };
                item.querySelector('.delete-btn').onclick = (e) => { e.stopPropagation(); deleteBar(doc.id); };
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
    document.getElementById('addCatBtn').onclick = () => openModal();

    try {
        const prodRef = window.fb.collection(window.fb.db, "bars", currentPath.barId, "prodotti");
        const snap = await window.fb.getDocs(prodRef);
        const categorie = [...new Set(snap.docs.map(d => d.data().categoria))];
        const list = document.getElementById('catList');
        categorie.forEach(cat => {
            if(!cat) return;
            const item = document.createElement('div');
            item.className = 'admin-item';
            item.innerHTML = `<span>${cat}</span>`;
            item.onclick = () => { currentPath.category = cat; renderProductList(); };
            list.appendChild(item);
        });
    } catch (e) { console.error(e); }
}

async function renderProductList() {
    updateBreadcrumbs();
    adminView.innerHTML = `
        <button class="btn-secondary" id="addProdBtn">+ Nuovo Prodotto</button>
        <div class="list-container" id="prodList"></div>
    `;
    document.getElementById('addProdBtn').onclick = () => openModal();

    try {
        const prodRef = window.fb.collection(window.fb.db, "bars", currentPath.barId, "prodotti");
        const q = window.fb.query(prodRef, window.fb.where("categoria", "==", currentPath.category));
        const snap = await window.fb.getDocs(q);
        const list = document.getElementById('prodList');
        snap.forEach(doc => {
            const p = doc.data();
            const item = document.createElement('div');
            item.className = 'admin-item';
            item.innerHTML = `
                <div><b>${p.nome}</b><br><small>${p.fornitore}</small></div>
                <div>
                    <button class="edit-btn" onclick='openModal(${JSON.stringify({id: doc.id, ...p}).replace(/'/g, "&apos;")})'>✏️</button>
                    <button class="delete-btn" onclick="deleteProduct('${doc.id}')">X</button>
                </div>
            `;
            list.appendChild(item);
        });
    } catch (e) { console.error(e); }
}

async function openModal(product = null) {
    await updateSuggestions();

    if (product) {
        modalTitle.innerText = "Modifica Prodotto";
        modalProductId.value = product.id;
        modalProdNome.value = product.nome;
        modalProdCat.value = product.categoria;
        modalProdFornitore.value = product.fornitore;
    } else {
        modalTitle.innerText = "Nuovo Prodotto";
        modalProductId.value = "";
        modalProdNome.value = "";
        modalProdCat.value = currentPath.category || "";
        modalProdFornitore.value = "";
    }
    productModal.classList.remove('hidden');
}

async function updateSuggestions() {
    const prodRef = window.fb.collection(window.fb.db, "bars", currentPath.barId, "prodotti");
    const snap = await window.fb.getDocs(prodRef);
    const data = snap.docs.map(d => d.data());

    const cats = [...new Set(data.map(p => p.categoria))];
    const forns = [...new Set(data.map(p => p.fornitore))];

    document.getElementById('categorySuggestions').innerHTML = cats.map(c => `<option value="${c}">`).join('');
    document.getElementById('providerSuggestions').innerHTML = forns.map(f => `<option value="${f}">`).join('');
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

    try {
        const prodRef = window.fb.collection(window.fb.db, "bars", currentPath.barId, "prodotti");
        if (id) {
            await window.fb.setDoc(window.fb.doc(window.fb.db, "bars", currentPath.barId, "prodotti", id), data, { merge: true });
        } else {
            data.createdAt = Date.now();
            await window.fb.addDoc(prodRef, data);
        }
        productModal.classList.add('hidden');
        currentPath.category = data.categoria;
        renderProductList();
    } catch (e) { console.error(e); }
};

closeModalBtn.onclick = () => productModal.classList.add('hidden');

function updateBreadcrumbs() {
    let html = isSuperAdmin ? `<span onclick="renderBarList()" style="cursor:pointer; color:blue; text-decoration:underline;">Superadmin</span>` : `<span onclick="renderAdminChoice()" style="cursor:pointer; color:blue; text-decoration:underline;">Home</span>`;
    if(currentPath.barId) html += ` > <span onclick="renderCategoryList()" style="cursor:pointer; color:blue; text-decoration:underline;">${currentPath.barName}</span>`;
    if(currentPath.category) html += ` > <b>${currentPath.category}</b>`;
    breadcrumbs.innerHTML = html;
}

window.deleteProduct = async (id) => {
    if(confirm("Eliminare?")) {
        await window.fb.deleteDoc(window.fb.doc(window.fb.db, "bars", currentPath.barId, "prodotti", id));
        renderProductList();
    }
};

async function deleteBar(id) {
    if(confirm("Eliminare bar?")) {
        await window.fb.deleteDoc(window.fb.doc(window.fb.db, "users", id));
        renderBarList();
    }
}
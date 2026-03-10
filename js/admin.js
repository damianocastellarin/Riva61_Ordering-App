const adminView = document.getElementById('admin-view');
const breadcrumbs = document.getElementById('breadcrumbs');
let currentPath = { barId: null, barName: '', category: '' };

window.addEventListener('admin-success', () => {
    renderBarList();
});

async function renderBarList() {
    currentPath = { barId: null, barName: '', category: '' };
    updateBreadcrumbs();
    adminView.innerHTML = `<div class="list-container" id="barList">Caricamento bar...</div>`;
    
    try {
        const querySnapshot = await window.fb.getDocs(window.fb.collection(window.fb.db, "users"));
        const list = document.getElementById('barList');
        list.innerHTML = "";
        
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if(data.role !== 'admin') {
                const item = document.createElement('div');
                item.className = 'admin-item';
                item.innerHTML = `<span>${data.barName || doc.id}</span> <button class="delete-btn">Elimina</button>`;
                
                item.onclick = (e) => {
                    if(e.target.tagName !== 'BUTTON') {
                        currentPath.barId = doc.id;
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
    } catch (e) {
        console.error("Errore caricamento bar:", e);
    }
}

async function renderCategoryList() {
    currentPath.category = '';
    updateBreadcrumbs();
    
    adminView.innerHTML = `
        <button class="btn-secondary" id="addCatBtn">+ Nuova Categoria</button>
        <div class="list-container" id="catList">Caricamento categorie...</div>
    `;
    
    document.getElementById('addCatBtn').onclick = addCategoryPrompt;

    try {
        const prodRef = window.fb.collection(window.fb.db, "bars", currentPath.barId, "prodotti");
        const q = window.fb.query(prodRef, window.fb.orderBy("createdAt", "asc"));
        const snap = await window.fb.getDocs(q);
        
        const categorie = [...new Set(snap.docs.map(d => d.data().categoria))];
        
        const list = document.getElementById('catList');
        list.innerHTML = categorie.length ? "" : "Nessuna categoria presente.";
        
        categorie.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'admin-item';
            item.innerHTML = `<span>${cat}</span>`;
            item.onclick = () => {
                currentPath.category = cat;
                renderProductList();
            };
            list.appendChild(item);
        });
    } catch (e) {
        console.error("Errore categorie:", e);
    }
}

async function renderProductList() {
    updateBreadcrumbs();
    adminView.innerHTML = `
        <button class="btn-secondary" id="addProdBtn">+ Nuovo Prodotto</button>
        <div class="list-container" id="prodList">Caricamento prodotti...</div>
    `;
    
    document.getElementById('addProdBtn').onclick = addProductPrompt;

    try {
        const prodRef = window.fb.collection(window.fb.db, "bars", currentPath.barId, "prodotti");
        const q = window.fb.query(
            prodRef, 
            window.fb.where("categoria", "==", currentPath.category),
            window.fb.orderBy("createdAt", "asc")
        );
        const snap = await window.fb.getDocs(q);
        
        const list = document.getElementById('prodList');
        list.innerHTML = "";

        snap.forEach(doc => {
            const p = doc.data();
            const item = document.createElement('div');
            item.className = 'admin-item';
            item.innerHTML = `
                <div><b>${p.nome}</b> <br><small>${p.fornitore}</small></div>
                <button class="delete-btn">X</button>
            `;
            item.querySelector('.delete-btn').onclick = (e) => {
                e.stopPropagation();
                deleteProduct(doc.id);
            };
            list.appendChild(item);
        });
    } catch (e) {
        console.error("Errore prodotti:", e);
    }
}

function updateBreadcrumbs() {
    let html = `<span style="cursor:pointer; color:var(--primary-color)" onclick="renderBarList()">Admin</span>`;
    
    if(currentPath.barId) {
        html += ` > <span style="cursor:pointer; color:var(--primary-color)" onclick="renderCategoryList()">${currentPath.barName}</span>`;
    }
    if(currentPath.category) {
        html += ` > <span style="font-weight:bold">${currentPath.category}</span>`;
    }
    breadcrumbs.innerHTML = html;
}

async function addCategoryPrompt() {
    const cat = prompt("Nome nuova categoria:");
    if(cat) {
        currentPath.category = cat;
        addProductPrompt();
    }
}

async function addProductPrompt() {
    const nome = prompt("Nome prodotto:");
    const fornitore = prompt("Fornitore:");
    const cat = currentPath.category || prompt("Categoria:");
    
    if(!nome) return;

    try {
        const colRef = window.fb.collection(window.fb.db, "bars", currentPath.barId, "prodotti");
        await window.fb.addDoc(colRef, {
            nome: nome, 
            fornitore: fornitore || "N/A", 
            categoria: cat, 
            active: true,
            createdAt: Date.now()
        });
        renderProductList();
    } catch (e) {
        console.error("Errore salvataggio:", e);
    }
}

async function deleteProduct(id) {
    if(confirm("Eliminare prodotto?")) {
        await window.fb.deleteDoc(window.fb.doc(window.fb.db, "bars", currentPath.barId, "prodotti", id));
        renderProductList();
    }
}

async function deleteBar(uid) {
    if(confirm("Eliminare bar? Tutti i dati andranno persi.")) {
        await window.fb.deleteDoc(window.fb.doc(window.fb.db, "users", uid));
        await window.fb.deleteDoc(window.fb.doc(window.fb.db, "bars", uid));
        renderBarList();
    }
}

window.renderBarList = renderBarList;
window.renderCategoryList = renderCategoryList;
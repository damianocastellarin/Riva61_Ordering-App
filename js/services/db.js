import { dataCache } from "./dataCache.js";

const mapDocs = (snap) => snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

export const dbService = {
    async getBars() {
        try {
            const q = window.fb.query(window.fb.collection(window.fb.db, "users"), window.fb.where("role", "==", "admin"));
            const snap = await window.fb.getDocs(q);
            return mapDocs(snap);
        } catch (e) { return []; }
    },

    async getCategories(barId) {
        if (!barId) return [];
        try {
            const ref = window.fb.collection(window.fb.db, "bars", barId, "categorie");
            const q = window.fb.query(ref, window.fb.orderBy("createdAt", "desc"));
            const snap = await window.fb.getDocs(q);
            return mapDocs(snap);
        } catch (e) { return []; }
    },

    async getProducts(barId, category = null) {
        if (!barId) return [];
        try {
            const ref = window.fb.collection(window.fb.db, "bars", barId, "prodotti");
            let q = category 
                ? window.fb.query(ref, window.fb.where("categoria", "==", category), window.fb.orderBy("updatedAt", "desc"))
                : window.fb.query(ref, window.fb.orderBy("createdAt", "desc"));
            const snap = await window.fb.getDocs(q);
            return mapDocs(snap);
        } catch (e) { return []; }
    },

    async saveProduct(barId, productId, data) {
        const cleanCat = data.categoria.trim();
        const catRef = window.fb.doc(window.fb.db, "bars", barId, "categorie", cleanCat);
        
        const p1 = window.fb.setDoc(catRef, { nome: cleanCat, createdAt: Date.now() }, { merge: true });

        let p2;
        if (productId) {
            const ref = window.fb.doc(window.fb.db, "bars", barId, "prodotti", productId);
            p2 = window.fb.setDoc(ref, { ...data, categoria: cleanCat }, { merge: true });
        } else {
            const ref = window.fb.collection(window.fb.db, "bars", barId, "prodotti");
            p2 = window.fb.addDoc(ref, { 
                ...data, 
                categoria: cleanCat, 
                createdAt: Date.now(), 
                updatedAt: Date.now() 
            });
        }
        dataCache.clear();
        return Promise.all([p1, p2]);
    },

    async renameCategory(barId, oldName, newName) {
        const cleanNew = newName.trim();
        if (oldName === cleanNew) return;
        
        const newCatRef = window.fb.doc(window.fb.db, "bars", barId, "categorie", cleanNew);
        await window.fb.setDoc(newCatRef, { nome: cleanNew, createdAt: Date.now() });

        const prodRef = window.fb.collection(window.fb.db, "bars", barId, "prodotti");
        const q = window.fb.query(prodRef, window.fb.where("categoria", "==", oldName));
        const snap = await window.fb.getDocs(q);

        const updatePromises = snap.docs.map(d => window.fb.setDoc(d.ref, { categoria: cleanNew }, { merge: true }));
        await Promise.all(updatePromises);

        const oldCatRef = window.fb.doc(window.fb.db, "bars", barId, "categorie", oldName);
        await window.fb.deleteDoc(oldCatRef);
        dataCache.clear();
    },

    async deleteProduct(barId, productId) {
        const ref = window.fb.doc(window.fb.db, "bars", barId, "prodotti", productId);
        await window.fb.deleteDoc(ref);
        dataCache.clear();
    },

    async deleteCategory(barId, categoryName) {
        const catRef = window.fb.doc(window.fb.db, "bars", barId, "categorie", categoryName);
        await window.fb.deleteDoc(catRef);
        const prodRef = window.fb.collection(window.fb.db, "bars", barId, "prodotti");
        const q = window.fb.query(prodRef, window.fb.where("categoria", "==", categoryName));
        const snap = await window.fb.getDocs(q);
        await Promise.all(snap.docs.map(d => window.fb.deleteDoc(d.ref)));
        dataCache.clear();
    }
};
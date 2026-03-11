const mapDocs = (snap) => snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

export const dbService = {
    async getBars() {
        const q = window.fb.query(
            window.fb.collection(window.fb.db, "users"), 
            window.fb.where("role", "==", "admin")
        );
        const snap = await window.fb.getDocs(q);
        return mapDocs(snap);
    },

    async getProducts(barId, category = null) {
        if (!barId) return [];
        const ref = window.fb.collection(window.fb.db, "bars", barId, "prodotti");
        
        let q;
        if (category) {
            q = window.fb.query(ref, window.fb.where("categoria", "==", category));
        } else {
            q = window.fb.query(ref, window.fb.orderBy("createdAt", "asc"));
        }
        
        const snap = await window.fb.getDocs(q);
        return mapDocs(snap);
    },

    async saveProduct(barId, productId, data) {
        if (productId) {
            const ref = window.fb.doc(window.fb.db, "bars", barId, "prodotti", productId);
            await window.fb.setDoc(ref, data, { merge: true });
            return productId;
        } else {
            const ref = window.fb.collection(window.fb.db, "bars", barId, "prodotti");
            const res = await window.fb.addDoc(ref, { ...data, createdAt: Date.now() });
            return res.id;
        }
    },

    async deleteProduct(barId, productId) {
        const ref = window.fb.doc(window.fb.db, "bars", barId, "prodotti", productId);
        return await window.fb.deleteDoc(ref);
    },

    async deleteBar(barId) {
        const ref = window.fb.doc(window.fb.db, "users", barId);
        return await window.fb.deleteDoc(ref);
    }
};
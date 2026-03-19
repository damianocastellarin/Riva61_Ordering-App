const mapDocs = (snap) => snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

export const dbService = {
    async getBars() {
        try {
            const q = window.fb.query(
                window.fb.collection(window.fb.db, "users"), 
                window.fb.where("role", "==", "admin")
            );
            const snap = await window.fb.getDocs(q);
            return mapDocs(snap);
        } catch (e) {
            console.error("Errore getBars:", e);
            return [];
        }
    },

    async getCategories(barId) {
        if (!barId) return [];
        try {
            const ref = window.fb.collection(window.fb.db, "bars", barId, "categorie");
            const q = window.fb.query(ref, window.fb.orderBy("createdAt", "desc"));
            const snap = await window.fb.getDocs(q);
            return mapDocs(snap);
        } catch (e) {
            console.error("Errore getCategories:", e);
            return [];
        }
    },

    async getProducts(barId, category = null) {
        if (!barId) return [];
        try {
            const ref = window.fb.collection(window.fb.db, "bars", barId, "prodotti");
            let q;
            if (category) {
                q = window.fb.query(ref, 
                    window.fb.where("categoria", "==", category),
                    window.fb.orderBy("updatedAt", "desc")
                );
            } else {
                q = window.fb.query(ref, window.fb.orderBy("createdAt", "desc"));
            }
            const snap = await window.fb.getDocs(q);
            return mapDocs(snap);
        } catch (e) {
            console.error("Errore getProducts:", e);
            return [];
        }
    },

    async saveProduct(barId, productId, data) {
        try {
            const catRef = window.fb.doc(window.fb.db, "bars", barId, "categorie", data.categoria);
            await window.fb.setDoc(catRef, { 
                nome: data.categoria,
                createdAt: Date.now() 
            }, { merge: true });

            if (productId) {
                const ref = window.fb.doc(window.fb.db, "bars", barId, "prodotti", productId);
                await window.fb.setDoc(ref, data, { merge: true });
                return productId;
            } else {
                const ref = window.fb.collection(window.fb.db, "bars", barId, "prodotti");
                const res = await window.fb.addDoc(ref, { 
                    ...data, 
                    createdAt: Date.now(),
                    updatedAt: Date.now() 
                });
                return res.id;
            }
        } catch (e) {
            console.error("Errore saveProduct:", e);
            throw e;
        }
    },

    async renameCategory(barId, oldName, newName) {
        try {
            if (oldName === newName) return;
            const newCatRef = window.fb.doc(window.fb.db, "bars", barId, "categorie", newName);
            await window.fb.setDoc(newCatRef, { nome: newName, createdAt: Date.now() });

            const prodRef = window.fb.collection(window.fb.db, "bars", barId, "prodotti");
            const q = window.fb.query(prodRef, window.fb.where("categoria", "==", oldName));
            const snap = await window.fb.getDocs(q);

            const updatePromises = snap.docs.map(d => 
                window.fb.setDoc(d.ref, { categoria: newName }, { merge: true })
            );
            await Promise.all(updatePromises);

            const oldCatRef = window.fb.doc(window.fb.db, "bars", barId, "categorie", oldName);
            await window.fb.deleteDoc(oldCatRef);
        } catch (e) {
            console.error("Errore renameCategory:", e);
        }
    },

    async deleteProduct(barId, productId) {
        try {
            const ref = window.fb.doc(window.fb.db, "bars", barId, "prodotti", productId);
            return await window.fb.deleteDoc(ref);
        } catch (e) {
            console.error("Errore deleteProduct:", e);
        }
    },

    async deleteCategory(barId, categoryName) {
        try {
            const catRef = window.fb.doc(window.fb.db, "bars", barId, "categorie", categoryName);
            await window.fb.deleteDoc(catRef);

            const prodRef = window.fb.collection(window.fb.db, "bars", barId, "prodotti");
            const q = window.fb.query(prodRef, window.fb.where("categoria", "==", categoryName));
            const snap = await window.fb.getDocs(q);
            const deletePromises = snap.docs.map(doc => window.fb.deleteDoc(doc.ref));
            await Promise.all(deletePromises);
        } catch (e) {
            console.error("Errore deleteCategory:", e);
        }
    },

    async deleteBar(barId) {
        try {
            const ref = window.fb.doc(window.fb.db, "users", barId);
            return await window.fb.deleteDoc(ref);
        } catch (e) {
            console.error("Errore deleteBar:", e);
        }
    }
};
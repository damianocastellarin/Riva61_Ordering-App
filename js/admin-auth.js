import { ui } from './ui.js';
import { session } from './session.js';
import { dataCache } from './services/dataCache.js';

window.fb.onAuthStateChanged(window.fb.auth, async (user) => {
    if (user) {
        try {
            ui.showLoader();
            const userDoc = await window.fb.getDoc(
                window.fb.doc(window.fb.db, "users", user.uid)
            );

            if (userDoc.exists()) {
                const userData = userDoc.data();

                if (userData.role === 'superadmin') {
                    session.set('superadmin');
                    window.dispatchEvent(new CustomEvent('superadmin-success'));

                } else if (userData.role === 'admin') {
                    session.set(
                        'admin',
                        userData.barId   || user.uid,
                        userData.barName || "Il mio Bar"
                    );
                    window.dispatchEvent(new CustomEvent('admin-bar-choice', {
                        detail: { barId: session.barId, barName: session.barName }
                    }));

                } else {
                    window.location.replace('./index.html');
                }
            } else {
                window.location.replace('./index.html');
            }
        } catch (error) {
            console.error("Errore Auth Admin:", error);
            window.location.replace('./index.html');
        }
    } else {
        session.clear();
        dataCache.clear();
        window.location.replace('./index.html');
    }
});

document.addEventListener('click', async (e) => {
    const btn = e.target.closest('#logoutAdminBtn');
    if (btn) {
        if (confirm("Vuoi uscire dall'account?")) {
            ui.showLoader();
            try {
                await window.fb.signOut(window.fb.auth);
                sessionStorage.removeItem('admin_current_path');
            } catch (error) {
                console.error(error);
                ui.hideLoader();
            }
        }
    }
});
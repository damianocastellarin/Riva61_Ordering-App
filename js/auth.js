import { ui } from './ui.js';

const loginContainer = document.getElementById('login-container');
const appContent = document.getElementById('app-content');
const adminContent = document.getElementById('admin-content');
const loginBtn = document.getElementById('loginBtn');

window.fb.onAuthStateChanged(window.fb.auth, async (user) => {
    if (user) {
        try {
            const userDoc = await window.fb.getDoc(window.fb.doc(window.fb.db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                loginContainer.classList.add('hidden');
                
                if (userData.role === "superadmin") {
                    appContent.classList.add('hidden');
                    adminContent.classList.remove('hidden');
                    window.dispatchEvent(new CustomEvent('superadmin-success'));
                } 
                else if (userData.role === "admin") {
                    appContent.classList.add('hidden');
                    adminContent.classList.remove('hidden');
                    window.dispatchEvent(new CustomEvent('admin-bar-choice', { 
                        detail: { 
                            barId: userData.barId || user.uid, 
                            barName: userData.barName || "Il mio Bar" 
                        } 
                    }));
                } 
                else {
                    adminContent.classList.add('hidden');
                    appContent.classList.remove('hidden');
                    window.dispatchEvent(new CustomEvent('auth-success', { 
                        detail: { barId: userData.barId } 
                    }));
                }
            }
        } catch (error) {
            console.error("Errore durante il recupero del ruolo:", error);
        } finally {
            ui.hideLoader();
        }
    } else {
        loginContainer.classList.remove('hidden');
        appContent.classList.add('hidden');
        adminContent.classList.add('hidden');
        sessionStorage.removeItem("ordine_bar_salvato");
        ui.hideLoader();
    }
});

if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) return;

        ui.showLoader();
        try {
            await window.fb.signInWithEmailAndPassword(window.fb.auth, email, password);
        } catch (e) {
            console.error(e);
            ui.hideLoader();
            alert("Accesso fallito: credenziali errate.");
        }
    });
}

document.addEventListener('click', async (e) => {
    if (e.target.id === 'logoutBtn' || e.target.id === 'logoutAdminBtn') {
        if (confirm("Vuoi uscire dall'account?")) {
            ui.showLoader();
            try {
                await window.fb.signOut(window.fb.auth);
                window.location.reload();
            } catch (error) {
                console.error("Errore Logout:", error);
                ui.hideLoader();
            }
        }
    }
});
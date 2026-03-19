import { ui } from './ui.js';
import { getIconHTML } from './icons.js';
import { session } from './session.js';
import { dataCache } from './services/dataCache.js';

const loginBtn       = document.getElementById('loginBtn');
const togglePassword = document.getElementById('togglePassword');
const passwordInput  = document.getElementById('login-password');

window.fb.onAuthStateChanged(window.fb.auth, async (user) => {
    if (user) {
        try {
            ui.showLoader();
            const userDoc = await window.fb.getDoc(
                window.fb.doc(window.fb.db, "users", user.uid)
            );

            if (userDoc.exists()) {
                const userData = userDoc.data();
                document.getElementById('login-container').classList.add('hidden');

                if (userData.role === 'superadmin' || userData.role === 'admin') {
                    const adminOrderRaw = sessionStorage.getItem('admin_order_mode');
                    if (adminOrderRaw) {
                        sessionStorage.removeItem('admin_order_mode');
                        const { barId, skipHome } = JSON.parse(adminOrderRaw);
                        session.set(userData.role, barId, userData.barName || "Il mio Bar");
                        window.dispatchEvent(new CustomEvent('auth-success', {
                            detail: { barId, skipHome }
                        }));
                    } else {
                        window.location.replace('./admin.html');
                    }
                } else {
                    session.set('user', userData.barId);
                    window.dispatchEvent(new CustomEvent('auth-success', {
                        detail: { barId: userData.barId }
                    }));
                }
            }
        } catch (error) {
            console.error("Errore Auth:", error);
            ui.hideLoader();
        }
    } else {
        session.clear();
        dataCache.clear();
        sessionStorage.removeItem("ordine_bar_salvato");
        sessionStorage.removeItem("admin_current_path");
        document.getElementById('login-container').classList.remove('hidden');
        document.getElementById('app-content').classList.add('hidden');
        ui.hideLoader();
    }
});

if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const email    = document.getElementById('login-email').value;
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

if (togglePassword && passwordInput) {
    togglePassword.innerHTML = getIconHTML('show');
    togglePassword.addEventListener('click', function () {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        const type = isPassword ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = isPassword ? getIconHTML('hide') : getIconHTML('show');
        this.classList.toggle('hidden-pass');
    });
}

document.addEventListener('click', async (e) => {
    const btn = e.target.closest('#logoutBtn');
    if (btn) {
        if (confirm("Vuoi uscire dall'account?")) {
            ui.showLoader();
            try {
                await window.fb.signOut(window.fb.auth);
                window.location.replace(
                    window.location.origin + window.location.pathname
                );
            } catch (error) {
                console.error(error);
                ui.hideLoader();
            }
        }
    }
});
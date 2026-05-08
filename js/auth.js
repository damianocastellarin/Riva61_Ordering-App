import { ui } from './ui.js';
import { getIconHTML } from './icons.js';
import { session } from './session.js';
import { dataCache } from './services/dataCache.js';
import { bottomNav } from './bottomNav/bottomNav.js';
import { networkService } from './services/networkService.js';

const isAdminPage = window.location.pathname.endsWith('admin.html');

bottomNav.init();

window.fb.onAuthStateChanged(window.fb.auth, async (user) => {
    ui.showLoader();

    if (user) {
        try {
            const userDoc = await window.fb.getDoc(
                window.fb.doc(window.fb.db, "users", user.uid)
            );

            if (!userDoc.exists()) {
                console.warn("Profilo non trovato nel database");
                _redirectToLogin();
                return;
            }

            const userData = userDoc.data();
            const role = userData.role;
            const email = user.email || null;

            if (isAdminPage) {
                if (role === 'superadmin' || role === 'admin') {
                    const barId = role === 'superadmin' ? null : (userData.barId || user.uid);
                    const barName = userData.barName || "Il mio Bar";
                    
                    session.set(role, barId, barName, email);
                    bottomNav.setup();
                    
                    const eventName = role === 'superadmin' ? 'superadmin-success' : 'admin-bar-choice';
                    window.dispatchEvent(new CustomEvent(eventName, {
                        detail: { barId, barName }
                    }));
                } else {
                    _redirectToLogin();
                    return;
                }
            } else {
                if (role === 'superadmin' || role === 'admin') {
                    window.location.replace('./admin.html');
                    return;
                } else {
                    session.set('user', userData.barId, userData.barName || null, email);
                    bottomNav.setup();
                    
                    localStorage.setItem('lastBarId', userData.barId);
                    
                    document.getElementById('login-container')?.classList.add('hidden');
                    document.getElementById('app-content')?.classList.remove('hidden');
                    
                    window.dispatchEvent(new CustomEvent('auth-success', {
                        detail: { barId: userData.barId }
                    }));
                }
            }
        } catch (error) {
            console.error("Errore Auth:", error);
            _redirectToLogin();
        } finally {
            ui.hideLoader();
        }

    } else {
        session.clear();
        dataCache.clear();
        sessionStorage.removeItem("ordine_bar_salvato");
        sessionStorage.removeItem("admin_current_path");
        localStorage.removeItem("lastBarId");

        if (isAdminPage) {
            _redirectToLogin();
        } else {
            document.getElementById('app-content')?.classList.add('hidden');
            document.getElementById('login-container')?.classList.remove('hidden');
            ui.hideLoader();
        }
    }
});

const loginBtn = document.getElementById('loginBtn');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('login-password');

if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) return;
        
        const isOnline = await networkService.isOnline();
        if (!isOnline) {
            alert("⚠️ Attenzione\n\nNon puoi effettuare il login mentre sei offline. Controlla la tua connessione e riprova.");
            return;
        }

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
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        this.innerHTML = isPassword ? getIconHTML('hide') : getIconHTML('show');
        this.classList.toggle('hidden-pass');
    });
}

document.addEventListener('click', async (e) => {
    const btn = e.target.closest('#logoutBtn, #logoutAdminBtn');
    if (!btn) return;
    if (!confirm("Vuoi uscire dall'account?")) return;

    ui.showLoader();
    try {
        await window.fb.signOut(window.fb.auth);
        if (isAdminPage) {
            sessionStorage.removeItem('admin_current_path');
        }
        localStorage.removeItem('lastBarId');
        window.location.replace('./index.html');
    } catch (error) {
        console.error(error);
        alert("Errore durante il logout. Riprova.");
        ui.hideLoader();
    }
});

function _redirectToLogin() {
    if (!window.location.pathname.endsWith('index.html')) {
        window.location.replace('./index.html');
    } else {
        ui.hideLoader();
    }
}
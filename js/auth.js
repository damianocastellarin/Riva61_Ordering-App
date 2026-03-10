const loginContainer = document.getElementById('login-container');
const appContent = document.getElementById('app-content');
const adminContent = document.getElementById('admin-content');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const logoutAdminBtn = document.getElementById('logoutAdminBtn');

window.fb.onAuthStateChanged(window.fb.auth, async (user) => {
    if (user) {
        try {
            const userDoc = await window.fb.getDoc(window.fb.doc(window.fb.db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                loginContainer.classList.add('hidden');
                
                if (userData.role === "admin") {
                    appContent.classList.add('hidden');
                    adminContent.classList.remove('hidden');
                    window.dispatchEvent(new CustomEvent('admin-success'));
                } else {
                    adminContent.classList.add('hidden');
                    appContent.classList.remove('hidden');
                    window.dispatchEvent(new CustomEvent('auth-success', { detail: { uid: user.uid } }));
                }
            }
        } catch (error) {
            console.error("Errore recupero ruolo:", error);
        }
    } else {
        loginContainer.classList.remove('hidden');
        appContent.classList.add('hidden');
        adminContent.classList.add('hidden');
        sessionStorage.removeItem("ordine_bar_salvato");
    }
});

loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    if (!email || !password) return alert("Inserisci le credenziali.");
    try {
        await window.fb.signInWithEmailAndPassword(window.fb.auth, email, password);
    } catch (error) {
        alert("Credenziali non valide.");
    }
});

const handleLogout = () => {
    if (confirm("Vuoi uscire?")) window.fb.signOut(window.fb.auth);
};

logoutBtn.addEventListener('click', handleLogout);
logoutAdminBtn.addEventListener('click', handleLogout);
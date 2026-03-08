const loginContainer = document.getElementById('login-container');
const appContent = document.getElementById('app-content');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

window.fb.onAuthStateChanged(window.fb.auth, (user) => {
    if (user) {
        console.log("Accesso bar completato. ID:", user.uid);
        loginContainer.classList.add('hidden');
        appContent.classList.remove('hidden');
        
        window.dispatchEvent(new CustomEvent('auth-success', { detail: { uid: user.uid } }));
    } else {
        console.log("Nessun utente collegato.");
        loginContainer.classList.remove('hidden');
        appContent.classList.add('hidden');
        sessionStorage.removeItem("ordine_bar_salvato");
    }
});

loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) return alert("Inserisci le credenziali fornite.");

    try {
        await window.fb.signInWithEmailAndPassword(window.fb.auth, email, password);
    } catch (error) {
        console.error("Errore login:", error.code);
        alert("Credenziali non valide o bar non registrato.");
    }
});

logoutBtn.addEventListener('click', () => {
    if (confirm("Vuoi uscire dall'account del bar?")) {
        window.fb.signOut(window.fb.auth);
    }
});
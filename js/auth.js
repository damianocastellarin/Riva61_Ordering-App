const loginContainer = document.getElementById('login-container');
const appContent = document.getElementById('app-content');
const adminContent = document.getElementById('admin-content');
const loginBtn = document.getElementById('loginBtn');

window.fb.onAuthStateChanged(window.fb.auth, async (user) => {
    if (user) {
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
                    detail: { barId: userData.barId || user.uid, barName: userData.barName } 
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
    } else {
        loginContainer.classList.remove('hidden');
        appContent.classList.add('hidden');
        adminContent.classList.add('hidden');
    }
});

loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        await window.fb.signInWithEmailAndPassword(window.fb.auth, email, password);
    } catch (e) { alert("Accesso fallito"); }
});
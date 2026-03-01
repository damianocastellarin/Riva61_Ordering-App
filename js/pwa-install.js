let deferredPrompt;
const installBtn = document.getElementById('installBtn');

const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

if (!isStandalone) {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.classList.remove('hidden');
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                installBtn.classList.add('hidden');
            }
            deferredPrompt = null;
        } else {
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                alert("Per installare l'app su iPhone:\n1. Clicca sul tasto 'Condividi' (quadrato con freccia su)\n2. Scorri e clicca 'Aggiungi alla schermata Home'");
            }
        }
    });

    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        installBtn.classList.remove('hidden');
    }
}
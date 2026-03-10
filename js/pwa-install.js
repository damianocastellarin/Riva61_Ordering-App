let deferredPrompt;
const installButtons = document.querySelectorAll('.btn-install');

const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

const toggleInstallButtons = (show) => {
    installButtons.forEach(btn => {
        if (show) btn.classList.remove('hidden');
        else btn.classList.add('hidden');
    });
};

if (!isStandalone) {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        toggleInstallButtons(true);
    });

    installButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    toggleInstallButtons(false);
                }
                deferredPrompt = null;
            } else {
                if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    alert("Per installare l'app su iPhone:\n1. Apri con Safari\n2. Clicca sul tasto 'Condividi' (quadrato con freccia su)\n3. Scorri e clicca 'Aggiungi alla schermata Home'");
                }
            }
        });
    });

    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        toggleInstallButtons(true);
    }
}

window.addEventListener('appinstalled', () => {
    toggleInstallButtons(false);
    deferredPrompt = null;
});
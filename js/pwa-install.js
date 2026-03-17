let deferredPrompt;

const getInstallButtons = () => document.querySelectorAll('.btn-install');

const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

const toggleInstallButtons = (show) => {
    const btns = getInstallButtons();
    btns.forEach(btn => {
        if (show) btn.classList.remove('hidden');
        else btn.classList.add('hidden');
    });
};

if (!isStandalone) {
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('PWA: Evento installazione catturato');
        e.preventDefault();
        deferredPrompt = e;
        toggleInstallButtons(true);
    });

    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-install')) {
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
        }
    });

    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        setTimeout(() => toggleInstallButtons(true), 1000);
    }
}

window.addEventListener('appinstalled', () => {
    console.log('PWA: App installata con successo');
    toggleInstallButtons(false);
    deferredPrompt = null;
});
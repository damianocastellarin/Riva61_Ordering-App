let deferredPrompt;

const toggleInstallButtons = (show) => {
    const btns = document.querySelectorAll('.btn-install');
    btns.forEach(btn => {
        if (show) btn.classList.remove('hidden');
        else btn.classList.add('hidden');
    });
};

const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

if (isStandalone) {
    toggleInstallButtons(false);
} else {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        toggleInstallButtons(true);
    });

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSafari = /Safari/i.test(navigator.userAgent) && !/CriOS/i.test(navigator.userAgent);
    
    if (isIOS && isSafari) {
        toggleInstallButtons(true);
    }
}

document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-install')) {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') toggleInstallButtons(false);
            deferredPrompt = null;
        } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            alert("Per installare l'app su iPhone:\n1. Clicca sul tasto 'Condividi' (quadrato con freccia su)\n2. Seleziona 'Aggiungi alla schermata Home'");
        }
    }
});

window.addEventListener('appinstalled', () => {
    toggleInstallButtons(false);
    deferredPrompt = null;
});
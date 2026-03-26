let deferredPrompt;

const toggleInstallButtons = (show) => {
    document.querySelectorAll('.btn-install').forEach(btn => {
        btn.classList.toggle('hidden', !show);
    });
};

const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

if (isStandalone) {
    toggleInstallButtons(false);
} else {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        toggleInstallButtons(true);
    });

    const isIOS    = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSafari = /Safari/i.test(navigator.userAgent) && !/CriOS/i.test(navigator.userAgent);
    if (isIOS && isSafari) toggleInstallButtons(true);
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

let swWaitingWorker = null;

const toast     = document.getElementById('update-toast');
const refreshBtn = document.getElementById('refresh-btn');

function showUpdateToast() {
    if (toast) toast.classList.remove('hidden');
}

if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        if (!swWaitingWorker) {
            window.location.reload();
            return;
        }
        swWaitingWorker.postMessage({ type: 'SKIP_WAITING' });
    });
}

navigator.serviceWorker?.addEventListener('controllerchange', () => {
    window.location.reload();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('./service-worker.js');

            if (registration.waiting) {
                swWaitingWorker = registration.waiting;
                showUpdateToast();
            }

            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (!newWorker) return;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        swWaitingWorker = newWorker;
                        showUpdateToast();
                    }
                });
            });

        } catch (err) {
            console.error('Service Worker registration failed:', err);
        }
    });
}

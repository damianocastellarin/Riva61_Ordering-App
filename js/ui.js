import { getIconHTML } from './icons.js';

export const ui = {
    showLoader: () => {
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.innerHTML = `<div class="spinner"></div>`; 
            document.body.appendChild(loader);
        }
        loader.classList.remove('hidden');
    },

    hideLoader: () => {
        const loader = document.getElementById('global-loader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 150);
        }
    },

    showToast: (text, duration = 2000) => {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.innerText = text;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, duration);
    },

    initAdminButtons: () => {
        const btns = {
            "indietroBtn": `Indietro`,
            "avantiBtn": `Avanti ${getIconHTML('save')}`,
            "riepilogoIndietroBtn": `Modifica`,
            "logoutBtn": `${getIconHTML('logout')} Esci`,
            "logoutAdminBtn": `${getIconHTML('logout')} Esci`,
            "startBtn": `Inizia Nuovo Ordine`
        };

        Object.entries(btns).forEach(([id, html]) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = html;
        });
    }
};

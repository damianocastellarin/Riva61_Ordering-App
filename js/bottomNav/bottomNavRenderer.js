import { getIconHTML } from '../icons.js';
import { router } from '../router.js';

export const bottomNavRenderer = {
    render(containerEl, tabs, currentHash) {
        containerEl.innerHTML = '';

        tabs.forEach(tab => {
            const btn = document.createElement('button');
            btn.className  = 'bottom-nav-item';
            btn.dataset.tabId = tab.id;
            btn.innerHTML  = `
                <span class="bottom-nav-icon">${getIconHTML(tab.icon)}</span>
                <span class="bottom-nav-label">${tab.label}</span>
            `;

            if (_isActive(tab, currentHash)) btn.classList.add('active');

            btn.addEventListener('click', () => {
                if (tab.eventName) {
                    window.dispatchEvent(new CustomEvent(tab.eventName));
                } else if (tab.hash) {
                    router.replace(tab.hash);
                }
            });

            containerEl.appendChild(btn);
        });
    },

    updateActive(containerEl, tabs, currentHash) {
        tabs.forEach(tab => {
            const btn = containerEl.querySelector(`[data-tab-id="${tab.id}"]`);
            if (btn) btn.classList.toggle('active', _isActive(tab, currentHash));
        });
    }
};

function _isActive(tab, currentHash) {
    return tab.activeOn?.some(h =>
        currentHash === h || currentHash.startsWith(h + '/')
    ) ?? false;
}
import { session } from '../session.js';
import { router } from '../router.js';
import { getTabsForRole, HIDDEN_ON } from './bottomNavConfig.js';
import { bottomNavRenderer } from './bottomNavRenderer.js';

const containerEl = document.getElementById('bottom-nav');

export const bottomNav = {
    _tabs: [],

    init() {
        router.onRouteChange((hash) => this.update(hash));
    },

    setup() {
        if (!containerEl) return;

        this._tabs = getTabsForRole(session.role);

        if (this._tabs.length === 0) {
            containerEl.classList.add('hidden');
            return;
        }

        const currentHash = window.location.hash || '#home';
        bottomNavRenderer.render(containerEl, this._tabs, currentHash);
        this.update(currentHash);
    },

    update(hash) {
        if (!containerEl || this._tabs.length === 0) return;

        const shouldHide = HIDDEN_ON.some(prefix =>
            hash === prefix || hash.startsWith(prefix + '/')
        );

        containerEl.classList.toggle('hidden', shouldHide);

        if (!shouldHide) {
            bottomNavRenderer.updateActive(containerEl, this._tabs, hash);
        }
    }
};
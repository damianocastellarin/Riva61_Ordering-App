const ID_MAP = { HOME: 'home', STEP: 'step', SUMMARY: 'riepilogo' };

export const appNavigator = {
    goTo(viewName) {
        const appContent        = document.getElementById('app-content');
        const progressContainer = document.getElementById('progressContainer');

        if (appContent) appContent.classList.remove('hidden');

        Object.values(ID_MAP).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });

        const targetId = ID_MAP[viewName];
        const target   = targetId ? document.getElementById(targetId) : null;
        if (target) target.classList.remove('hidden');

        if (progressContainer) {
            progressContainer.classList.toggle('hidden', viewName !== 'STEP');
        }

        window.scrollTo({ top: 0, behavior: 'instant' });
    }
};
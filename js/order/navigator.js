const views = {
    HOME: document.getElementById("home"),
    STEP: document.getElementById("step"),
    SUMMARY: document.getElementById("riepilogo")
};

const progressContainer = document.getElementById("progressContainer");

export const navigator = {
    /**
     * show a specific view and hide others
     * @param {string} viewName - 'HOME', 'STEP' o 'SUMMARY'
     */
    goTo(viewName) {
        Object.values(views).forEach(el => el?.classList.add("hidden"));
        
        const target = views[viewName];
        if (target) {
            target.classList.remove("hidden");
        }

        if (progressContainer) {
            if (viewName === 'STEP') progressContainer.classList.remove("hidden");
            else progressContainer.classList.add("hidden");
        }
        
        window.scrollTo(0, 0);
    }
};
const views = {
    HOME: document.getElementById("home"),
    STEP: document.getElementById("step"),
    SUMMARY: document.getElementById("riepilogo")
};

const progressContainer = document.getElementById("progressContainer");

export const navigator = {
    /**
     * mostra una vista specifica e nasconde le altre
     * @param {string} viewName - 'HOME', 'STEP' o 'SUMMARY'
     */
    goTo(viewName) {
        Object.keys(views).forEach(key => {
            if (views[key]) views[key].classList.add("hidden");
        });
        
        const target = views[viewName];
        if (target) {
            target.classList.remove("hidden");
        } else {
            console.error(`Vista "${viewName}" non trovata nel DOM.`);
        }

        if (progressContainer) {
            if (viewName === 'STEP') progressContainer.classList.remove("hidden");
            else progressContainer.classList.add("hidden");
        }
        
        window.scrollTo(0, 0);
    }
};
const views = {
    HOME: document.getElementById("home"),
    STEP: document.getElementById("step"),
    SUMMARY: document.getElementById("riepilogo"),
    ADMIN: document.getElementById("admin-content")
};

const appContent = document.getElementById("app-content");
const loginContainer = document.getElementById("login-container");
const progressContainer = document.getElementById("progressContainer");

export const navigator = {
    goTo(viewName) {
        if (loginContainer) loginContainer.classList.add("hidden");
        
        if (viewName === 'ADMIN') {
            if (appContent) appContent.classList.add("hidden");
            if (views.ADMIN) views.ADMIN.classList.remove("hidden");
        } else {
            if (appContent) appContent.classList.remove("hidden");
            if (views.ADMIN) views.ADMIN.classList.add("hidden");
        }

        ['HOME', 'STEP', 'SUMMARY'].forEach(key => {
            if (views[key]) views[key].classList.add("hidden");
        });

        const target = views[viewName];
        if (target) target.classList.remove("hidden");

        if (progressContainer) {
            progressContainer.classList.toggle("hidden", viewName !== 'STEP');
        }
        
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
};
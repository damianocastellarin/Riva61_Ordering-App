const el = {
    home:              document.getElementById("home"),
    step:              document.getElementById("step"),
    summary:           document.getElementById("riepilogo"),
    adminContent:      document.getElementById("admin-content"),
    appContent:        document.getElementById("app-content"),
    loginContainer:    document.getElementById("login-container"),
    progressContainer: document.getElementById("progressContainer")
};

export const viewNavigator = {
    goTo(viewName) {

        if (viewName === 'LOGIN') {
            if (el.loginContainer) el.loginContainer.classList.remove("hidden");
            if (el.appContent)     el.appContent.classList.add("hidden");
            if (el.adminContent)   el.adminContent.classList.add("hidden");
            return;
        }

        if (el.loginContainer) el.loginContainer.classList.add("hidden");

        if (viewName === 'ADMIN') {
            if (el.appContent)   el.appContent.classList.add("hidden");
            if (el.adminContent) el.adminContent.classList.remove("hidden");
            window.scrollTo({ top: 0, behavior: 'instant' });
            return;
        }

        if (el.appContent)   el.appContent.classList.remove("hidden");
        if (el.adminContent) el.adminContent.classList.add("hidden");

        [el.home, el.step, el.summary].forEach(v => {
            if (v) v.classList.add("hidden");
        });

        const map = { HOME: el.home, STEP: el.step, SUMMARY: el.summary };
        const target = map[viewName];
        if (target) target.classList.remove("hidden");

        if (el.progressContainer) {
            el.progressContainer.classList.toggle("hidden", viewName !== 'STEP');
        }

        window.scrollTo({ top: 0, behavior: 'instant' });
    }
};
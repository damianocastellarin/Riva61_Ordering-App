export const breadcrumbsManager = {
    render(container, { path, isSuperAdmin, actions }) {
        container.innerHTML = "";
        
        const createStep = (label, action, isBold = false) => {
            const el = document.createElement(isBold ? 'b' : 'span');
            el.textContent = label;
            if (action) {
                el.style.cursor = "pointer";
                el.onclick = action;
            }
            return el;
        };

        const baseLabel = isSuperAdmin ? "Superadmin" : "Home";
        const baseAction = isSuperAdmin ? actions.onGoBars : actions.onGoHome;
        container.appendChild(createStep(baseLabel, baseAction));

        if (path.barId) {
            container.append(" > ");
            container.appendChild(createStep(path.barName, actions.onGoCategories));
        }

        if (path.category) {
            container.append(" > ");
            container.appendChild(createStep(path.category, null, true));
        }
    }
};
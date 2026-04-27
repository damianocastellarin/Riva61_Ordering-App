import { router } from "../router.js";

export const orderCompleteView = {
    render() {
        const container = document.getElementById("order-complete");
        if (container) container.classList.remove("hidden");

        document.getElementById("home")?.classList.add("hidden");
        document.getElementById("step")?.classList.add("hidden");
        document.getElementById("order-summary")?.classList.add("hidden");
        document.getElementById("profile")?.classList.add("hidden");
        document.getElementById("admin-content")?.classList.add("hidden");
        document.getElementById("progressContainer")?.classList.add("hidden");

        const backBtn    = document.getElementById("backToCategoriesBtn");
        const summaryBtn = document.getElementById("goToSummaryBtn");

        if (backBtn) {
            backBtn.onclick = () => window.history.back();
        }

        if (summaryBtn) {
            summaryBtn.onclick = () => router.navigate('#order-summary');
        }
    }
};
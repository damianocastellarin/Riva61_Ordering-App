import { router } from "../router.js";
import { resetState } from "../state.js";
import { viewNavigator } from "../order/navigator.js";

export const homeView = {
    render(categorieDisponibili) {
        viewNavigator.goTo('HOME');
        document.getElementById("startBtn").onclick = () => {
            if (categorieDisponibili.length === 0) {
                alert("Caricamento prodotti in corso...");
                return;
            }
            resetState();
            router.navigate('#step/0');
        };
    }
};
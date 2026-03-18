import { router } from "../router.js";
import { resetState } from "../state.js";
import { navigator } from "../order/navigator.js";

export const homeView = {
    render(categorieDisponibili) {
        navigator.goTo('HOME');
        
        document.getElementById("startBtn").onclick = () => {
            if (categorieDisponibili.length === 0) {
                alert("Caricamento prodotti in corso...");
                return;
            }
            resetState();
            router.navigate('#step');
        };
    }
};
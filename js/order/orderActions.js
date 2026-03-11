export const orderActions = {
    shareToWhatsApp(text) {
        const encryptedText = encodeURIComponent(text);
        window.open(`https://wa.me/?text=${encryptedText}`, "_blank");
    },

    async copyToClipboard(text, buttonElement) {
        try {
            await navigator.clipboard.writeText(text);
            const originalHTML = buttonElement.innerHTML;
            buttonElement.textContent = "Copiato!";
            setTimeout(() => { 
                buttonElement.innerHTML = originalHTML; 
            }, 2000);
        } catch (err) {
            console.error("Errore nel copia:", err);
            alert("Errore durante la copia negli appunti.");
        }
    }
};
export const networkService = {
    async isOnline() {
        if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        try {
            await fetch('https://www.google.com/generate_204', {
                mode: 'no-cors',
                cache: 'no-cache',
                method: 'HEAD',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return true;
        } catch (e) {
            clearTimeout(timeoutId);
            return false;
        }
    }
};
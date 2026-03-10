export const ICONS = {
    edit: "fas fa-pen",
    //delete: "fa-solid fa-trash-can",
    //add: "fa-solid fa-plus",
    //save: "fa-solid fa-floppy-disk",
    show: "fas fa-eye",
    hide: "fas fa-eye-slash",
    //logout: "fa-solid fa-right-from-bracket",
    //admin: "fa-solid fa-user-shield",
    //order: "fa-solid fa-cart-shopping",
    //whatsapp: "fa-brands fa-whatsapp",
    //back: "fa-solid fa-chevron-left",
    //forward: "fa-solid fa-chevron-right"
};

export function getIconHTML(iconKey) {
    const iconClass = ICONS[iconKey] || "fa-solid fa-question";
    return `<i class="${iconClass}"></i>`;
}
export const ICONS = {
    edit: "fas fa-pen",
    delete: "fas fa-trash",
    add: "fas fa-plus",
    save: "fas fa-save",
    show: "fas fa-eye",
    hide: "fas fa-eye-slash",
    logout: "fas fa-sign-out-alt",
    admin: "fas fa-user",
    back: "fas fa-chevron-left",
    cancel: "fas fa-times",
};

export function getIconHTML(iconKey) {
    const iconClass = ICONS[iconKey] || "fas fa-question";
    return `<i class="${iconClass}"></i>`;
}
import { getIconHTML } from '../icons.js';

export const uiComponents = {
    createListItem(contentHTML, onClick, onDelete = null, onEdit = null) {
        const item = document.createElement('div');
        item.className = 'admin-item';

        const info = document.createElement('div');
        info.className = 'item-info';
        info.innerHTML = contentHTML;
        item.appendChild(info);

        const actions = document.createElement('div');
        actions.className = 'actions';

        if (onEdit) {
            const btn = document.createElement('button');
            btn.className = 'edit-btn btn-info btn-sm';
            btn.innerHTML = getIconHTML('edit');
            btn.onclick = (e) => { e.stopPropagation(); onEdit(); };
            actions.appendChild(btn);
        }

        if (onDelete) {
            const btn = document.createElement('button');
            btn.className = 'delete-btn btn-danger btn-sm';
            btn.innerHTML = getIconHTML('delete');
            btn.onclick = (e) => { e.stopPropagation(); onDelete(); };
            actions.appendChild(btn);
        }

        item.appendChild(actions);
        if (onClick) {
            item.style.cursor = "pointer";
            item.onclick = onClick;
        }
        return item;
    },

    createAddButton(label, onClick) {
        const btn = document.createElement('button');
        btn.className = "btn-add-new btn-light";
        btn.style.marginBottom = "15px";
        btn.innerHTML = `${getIconHTML('add')} ${label}`;
        btn.onclick = onClick;
        return btn;
    }
};
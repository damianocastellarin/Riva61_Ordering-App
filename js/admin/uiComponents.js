import { getIconHTML } from '../icons.js';

export const uiComponents = {

    createAdminChoiceMenu(onOrders, onEdit) {
        const container = document.createElement('div');
        container.style.cssText = "display:flex; flex-direction:column; gap:20px; padding:20px;";

        const btnOrders = document.createElement('button');
        btnOrders.className = "btn-primary";
        btnOrders.style.cssText = "height:80px; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:10px;";
        btnOrders.innerHTML = `${getIconHTML('save')} FAI ORDINI`;
        btnOrders.onclick = onOrders;

        const btnEdit = document.createElement('button');
        btnEdit.className = "btn-secondary";
        btnEdit.style.cssText = "height:80px; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:10px;";
        btnEdit.innerHTML = `${getIconHTML('edit')} MODIFICA PRODOTTI`;
        btnEdit.onclick = onEdit;

        container.append(btnOrders, btnEdit);
        return container;
    },

    createListItem(contentHTML, onClick, onDelete = null, onEdit = null) {
        const item = document.createElement('div');
        item.className = 'admin-item';
        
        const info = document.createElement('div');
        info.innerHTML = contentHTML;
        item.appendChild(info);

        const actions = document.createElement('div');
        actions.className = 'actions';

        if (onEdit) {
            const btn = document.createElement('button');
            btn.className = 'edit-btn';
            btn.innerHTML = getIconHTML('edit');
            btn.onclick = (e) => { e.stopPropagation(); onEdit(); };
            actions.appendChild(btn);
        }

        if (onDelete) {
            const btn = document.createElement('button');
            btn.className = 'delete-btn';
            btn.innerHTML = getIconHTML('delete');
            btn.onclick = (e) => { e.stopPropagation(); onDelete(); };
            actions.appendChild(btn);
        }

        item.appendChild(actions);
        item.onclick = onClick;
        return item;
    },

    createAddButton(label, onClick) {
        const btn = document.createElement('button');
        btn.className = "btn-secondary";
        btn.style.marginBottom = "10px";
        btn.innerHTML = `${getIconHTML('add')} ${label}`;
        btn.onclick = onClick;
        return btn;
    }
};
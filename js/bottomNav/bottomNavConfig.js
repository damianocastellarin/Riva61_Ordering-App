export const HIDDEN_ON = ['#step', '#riepilogo'];

export function getTabsForRole(role) {
    switch (role) {
        case 'admin':    return ADMIN_TABS;
        case 'user':     return USER_TABS;
        default:         return [];
    }
}

const ADMIN_TABS = [
    {
        id:        'order',
        icon:      'order',
        label:     'Ordine',
        eventName: 'bottomnav-admin-order',
        activeOn:  []
    },
    {
        id:       'products',
        icon:     'products',
        label:    'Prodotti',
        hash:     '#admin/categories',
        activeOn: ['#admin/categories', '#admin/products']
    },
    {
        id:       'profile',
        icon:     'profile',
        label:    'Profilo',
        hash:     '#admin/profile',
        activeOn: ['#admin/profile']
    }
];

const USER_TABS = [
    {
        id:        'order',
        icon:      'order',
        label:     'Ordine',
        eventName: 'bottomnav-user-order',
        activeOn:  ['#home']
    },
    {
        id:       'profile',
        icon:     'profile',
        label:    'Profilo',
        hash:     '#profile',
        activeOn: ['#profile']
    }
];
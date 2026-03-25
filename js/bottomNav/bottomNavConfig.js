export const HIDDEN_ON = ['#step', '#riepilogo'];

export function getTabsForRole(role) {
    const isAdminPage = window.location.pathname.endsWith('admin.html');
    switch (role) {
        case 'admin': return isAdminPage ? ADMIN_TABS : ADMIN_ON_INDEX_TABS;
        case 'user':  return USER_TABS;
        default:      return [];
    }
}

const ADMIN_TABS = [
    {
        id:       'order',
        icon:     'order',
        label:    'Ordine',
        hash:     '#home',
        activeOn: ['#home', '#step', '#riepilogo']
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

const ADMIN_ON_INDEX_TABS = [
    {
        id:       'order',
        icon:     'order',
        label:    'Ordine',
        hash:     '#home',
        activeOn: ['#home']
    },
    {
        id:       'products',
        icon:     'products',
        label:    'Prodotti',
        url:      './admin.html#admin/categories',
        activeOn: []
    },
    {
        id:       'profile',
        icon:     'profile',
        label:    'Profilo',
        hash:     '#profile',
        activeOn: ['#profile']
    }
];

const USER_TABS = [
    {
        id:       'order',
        icon:     'order',
        label:    'Ordine',
        hash:     '#home',
        activeOn: ['#home']
    },
    {
        id:       'profile',
        icon:     'profile',
        label:    'Profilo',
        hash:     '#profile',
        activeOn: ['#profile']
    }
];
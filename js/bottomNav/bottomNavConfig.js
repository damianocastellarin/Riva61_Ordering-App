export const HIDDEN_ON = ['#step', '#order-complete'];

export function getTabsForRole(role) {
    const isAdminPage = window.location.pathname.endsWith('admin.html');
    switch (role) {
        case 'admin': return isAdminPage ? ADMIN_TABS : USER_TABS;
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
        activeOn: ['#home', '#step', '#order-complete']
    },
    {
        id:       'order-summary',
        icon:     'summary',
        label:    'Riepilogo Ordine',
        hash:     '#order-summary',
        activeOn: ['#order-summary']
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
        id:       'order',
        icon:     'order',
        label:    'Ordine',
        hash:     '#home',
        activeOn: ['#home', '#step', '#order-complete']
    },
    {
        id:       'order-summary',
        icon:     'summary',
        label:    'Riepilogo Ordine',
        hash:     '#order-summary',
        activeOn: ['#order-summary']
    },
    {
        id:       'profile',
        icon:     'profile',
        label:    'Profilo',
        hash:     '#profile',
        activeOn: ['#profile']
    }
];
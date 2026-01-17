/**
 * Client Sidebar Data
 * Each menu item has a moduleKey that maps to module settings
 * The Sidebar component will filter these based on ModulesContext
 */

import {
  IoHome,
  IoDocumentText,
  IoFolderOpen,
  IoStorefront,
  IoFileTray,
  IoWallet,
  IoReceipt,
  IoCash,
  IoCard,
  IoReader,
  IoTicket,
  IoChevronDown,
  IoCart,
  IoRefresh,
  IoCalendar,
  IoChatbubbles,
} from 'react-icons/io5'

const clientSidebarData = [
  {
    label: 'Dashboard',
    icon: IoHome,
    path: '/app/client/dashboard',
    moduleKey: 'dashboard', // Maps to clientMenus.dashboard
  },
  {
    label: 'Projects',
    icon: IoFolderOpen,
    path: '/app/client/projects',
    moduleKey: 'projects', // Maps to clientMenus.projects
  },
  {
    label: 'Proposals',
    icon: IoDocumentText,
    path: '/app/client/proposals',
    moduleKey: 'proposals', // Maps to clientMenus.proposals
  },
  {
    label: 'Store',
    icon: IoStorefront,
    path: '/app/client/store',
    moduleKey: 'store', // Maps to clientMenus.store
  },
  {
    label: 'Files',
    icon: IoFileTray,
    path: '/app/client/files',
    moduleKey: 'files', // Maps to clientMenus.files
  },
  {
    label: 'Billing',
    icon: IoWallet,
    path: '/app/client/billing',
    moduleKey: 'billing', // Maps to clientMenus.billing (parent)
    children: [
      {
        label: 'Invoices',
        path: '/app/client/invoices',
        moduleKey: 'invoices', // Maps to clientMenus.invoices
      },
      {
        label: 'Payments',
        path: '/app/client/payments',
        moduleKey: 'payments', // Maps to clientMenus.payments
      },
      {
        label: 'Subscriptions',
        path: '/app/client/subscriptions',
        moduleKey: 'subscriptions', // Maps to clientMenus.subscriptions
      },
      {
        label: 'Orders',
        path: '/app/client/orders',
        moduleKey: 'orders', // Maps to clientMenus.orders
      },
    ],
  },
  {
    label: 'Notes',
    icon: IoReader,
    path: '/app/client/notes',
    moduleKey: 'notes', // Maps to clientMenus.notes
  },
  {
    label: 'Contracts',
    icon: IoDocumentText,
    path: '/app/client/contracts',
    moduleKey: 'contracts', // Maps to clientMenus.contracts
  },
  {
    label: 'Tickets',
    icon: IoTicket,
    path: '/app/client/tickets',
    moduleKey: 'tickets', // Maps to clientMenus.tickets
  },
  {
    label: 'Messages',
    icon: IoChatbubbles,
    path: '/app/client/messages',
    moduleKey: 'messages', // Maps to clientMenus.messages
  },
]

export default clientSidebarData

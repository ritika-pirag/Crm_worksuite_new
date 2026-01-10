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
  },
  {
    label: 'Projects',
    icon: IoFolderOpen,
    path: '/app/client/projects',
  },
  {
    label: 'Proposals',
    icon: IoDocumentText,
    path: '/app/client/proposals',
  },
  {
    label: 'Store',
    icon: IoStorefront,
    path: '/app/client/store',
  },
  {
    label: 'Files',
    icon: IoFileTray,
    path: '/app/client/files',
  },
  {
    label: 'Billing',
    icon: IoWallet,
    path: '/app/client/billing', // Parent path for submenu
    children: [
      {
        label: 'Invoices',
        path: '/app/client/invoices',
      },
      {
        label: 'Payments',
        path: '/app/client/payments',
      },
      {
        label: 'Subscriptions',
        path: '/app/client/subscriptions',
      },
      {
        label: 'Orders',
        path: '/app/client/orders',
      },
    ],
  },
  {
    label: 'Notes',
    icon: IoReader,
    path: '/app/client/notes',
  },
  {
    label: 'Contracts',
    icon: IoDocumentText,
    path: '/app/client/contracts',
  },
  {
    label: 'Tickets',
    icon: IoTicket,
    path: '/app/client/tickets',
  },
  {
    label: 'Messages',
    icon: IoChatbubbles,
    path: '/app/client/messages',
  },
]

export default clientSidebarData

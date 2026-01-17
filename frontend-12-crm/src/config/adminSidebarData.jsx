import {
  IoHome,
  IoPeople,
  IoBusiness,
  IoPerson,
  IoShieldCheckmark,
  IoKey,
  IoList,
  IoSettings,
  IoExtensionPuzzle,
  IoCloudUpload,
  IoServer,
  IoHelpCircle,
  IoBook,
  IoCard,
  IoDocumentText,
  IoFolderOpen,
  IoCheckmarkCircle,
  IoCalendar,
  IoChatbubbles,
  IoTicket,
  IoStopwatch,
  IoReceipt,
  IoMail,
  IoConstruct,
  IoGlobe,
  IoBarChart,
  IoDocument,
  IoBuild,
  IoPieChart,
  IoTime,
  IoCash,
  IoStorefront,
  IoCart,
} from 'react-icons/io5'

const adminSidebarData = [
  {
    label: 'Dashboard',
    icon: IoHome,
    path: '/app/admin/dashboard',
    section: null,
  },
  {
    label: 'CRM & Sales',
    icon: IoPeople,
    path: '/app/admin/crm-sales',
    section: 'CRM & SALES',
    children: [
      {
        label: 'Leads',
        path: '/app/admin/leads',
      },
      {
        label: 'Clients',
        path: '/app/admin/clients',
      },
    ],
  },
  {
    label: 'Work',
    icon: IoFolderOpen,
    path: '/app/admin/work',
    section: 'WORK',
    children: [
      {
        label: 'Projects',
        path: '/app/admin/projects',
      },
      {
        label: 'Tasks',
        path: '/app/admin/tasks',
      },
    ],
  },
  {
    label: 'Finance',
    icon: IoCash,
    path: '/app/admin/finance',
    section: 'FINANCE',
    children: [
      {
        label: 'Proposal',
        icon: IoDocumentText,
        path: '/app/admin/proposals',
      },
      {
        label: 'Estimates',
        icon: IoDocumentText,
        path: '/app/admin/estimates',
      },
      {
        label: 'Invoices',
        icon: IoReceipt,
        path: '/app/admin/invoices',
      },
      {
        label: 'Payments',
        icon: IoCash,
        path: '/app/admin/payments',
      },
      {
        label: 'Credit Note',
        icon: IoCard,
        path: '/app/admin/credit-notes',
      },
      {
        label: 'Expenses',
        icon: IoCard,
        path: '/app/admin/expenses',
      },
      {
        label: 'Bank Account',
        icon: IoCard,
        path: '/app/admin/bank-accounts',
      },
      {
        label: 'Items',
        icon: IoList,
        path: '/app/admin/items',
      },
      {
        label: 'Store',
        icon: IoStorefront,
        path: '/app/admin/store',
      },
      {
        label: 'Contracts',
        icon: IoDocumentText,
        path: '/app/admin/contracts',
      },
      {
        label: 'Orders',
        icon: IoCart,
        path: '/app/admin/orders',
      },
      {
        label: 'Templates',
        icon: IoDocument,
        path: '/app/admin/finance-templates',
      },
      {
        label: 'Project Templates',
        icon: IoFolderOpen,
        path: '/app/admin/project-templates',
      },
    ],
  },
  {
    label: 'Team & Operations',
    icon: IoPerson,
    path: '/app/admin/team-operations',
    section: 'TEAM & OPERATIONS',
    children: [
      {
        label: 'Employees',
        path: '/app/admin/employees',
      },
      {
        label: 'Attendance',
        path: '/app/admin/attendance',
      },
      {
        label: 'Leave Requests',
        path: '/app/admin/leave-requests',
      },
      {
        label: 'Time Tracking',
        path: '/app/admin/time-tracking',
      },
      {
        label: 'Event',
        path: '/app/admin/calendar',
      },
      {
        label: 'Departments',
        path: '/app/admin/departments',
      },
      {
        label: 'Positions',
        path: '/app/admin/positions',
      },
    ],
  },
  {
    label: 'Communication',
    icon: IoChatbubbles,
    path: '/app/admin/communication',
    section: 'COMMUNICATION',
    children: [
      {
        label: 'Messages',
        path: '/app/admin/messages',
      },
      {
        label: 'Tickets',
        path: '/app/admin/tickets',
      },
    ],
  },
  {
    label: 'Tools & Utilities',
    icon: IoBarChart,
    path: '/app/admin/tools-utilities',
    section: 'TOOLS & UTILITIES',
    children: [
      {
        label: 'Reports',
        path: '/app/admin/reports',
      },
      {
        label: 'Documents',
        path: '/app/admin/documents',
      },
      {
        label: 'Custom Fields',
        path: '/app/admin/custom-fields',
      },
    ],
  },
  // Companies menu removed - Admin cannot create companies
  // Admin already has a company assigned from login
  // If needed, show "Company Profile" page instead (read-only or edit own company)
  // {
  //   label: 'Users & Roles',
  //   icon: IoPeople,
  //   path: '/app/admin/users-roles',
  //   section: 'USERS & ROLES',
  //   children: [
  //     {
  //       label: 'Staff Management',
  //       path: '/app/admin/users',
  //     },
  // Roles & Permissions - Temporarily commented out
  // {
  //   label: 'Roles & Permissions',
  //   path: '/app/admin/roles-permissions',
  // },
  //   ],
  // },
  {
    label: 'Integrations',
    icon: IoExtensionPuzzle,
    path: '/app/admin/integrations',
    section: 'INTEGRATIONS',
    children: [
      {
        label: 'Integrations',
        path: '/app/admin/integrations',
      },
      {
        label: 'Zoho Books',
        path: '/app/admin/integrations/zoho-books',
      },
      {
        label: 'QuickBooks',
        path: '/app/admin/integrations/quickbooks',
      },
      {
        label: 'Payment Gateways',
        path: '/app/admin/integrations/payment-gateways',
      },
    ],
  },
  {
    label: 'System & Settings',
    icon: IoSettings,
    path: '/app/admin/system-settings',
    section: 'SYSTEM & SETTINGS',
    children: [
      {
        label: 'System Settings',
        path: '/app/admin/settings',
      },
      {
        label: 'Module Settings',
        path: '/app/admin/settings/modules',
      },
      {
        label: 'Email Templates',
        path: '/app/admin/settings/email-templates',
      },
      // {
      //   label: 'System Health',
      //   path: '/app/admin/system-health',
      // },
      // {
      //   label: 'License Management',
      //   path: '/app/admin/license-management',
      // },
      {
        label: 'Audit Log',
        path: '/app/admin/audit-logs',
      },
    ],
  },
  // {
  //   label: 'Updates & Maintenance',
  //   icon: IoCloudUpload,
  //   path: '/app/admin/updates-maintenance',
  //   section: 'UPDATES & MAINTENANCE',
  //   children: [
  //     {
  //       label: 'System Updates',
  //       path: '/app/admin/system-updates',
  //     },
  //     {
  //       label: 'Database Backup',
  //       path: '/app/admin/database-backup',
  //     },
  //   ],
  // },
  // {
  //   label: 'Help & Support',
  //   icon: IoHelpCircle,
  //   path: '/app/admin/help-support',
  //   section: 'HELP & SUPPORT',
  //   children: [
  //     {
  //       label: 'Tour Guide',
  //       path: '/app/admin/tour-guide',
  //     },
  //     {
  //       label: 'Documentation',
  //       path: '/app/admin/documentation',
  //     },
  //   ],
  // },
]

export default adminSidebarData

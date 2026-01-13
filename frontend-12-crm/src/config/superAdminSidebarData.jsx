import {
  IoHome,
  IoBusiness,
  IoPeople,
  IoStatsChart,
  IoSettings,
  IoShieldCheckmark,
  IoServer,
  IoDocumentText,
  IoBarChart,
  IoCube,
  IoReceipt,
  IoHelpCircle,
  IoBriefcase,
  IoTicket,
  IoGlobe,
  IoPhonePortrait,
} from 'react-icons/io5'

const superAdminSidebarData = [
  {
    label: 'Dashboard',
    icon: IoHome,
    path: '/app/superadmin/dashboard',
    section: null,
  },
  {
    label: 'Packages',
    icon: IoCube,
    path: '/app/superadmin/packages',
    section: 'PACKAGES',
  },
  {
    label: 'Companies',
    icon: IoBusiness,
    path: '/app/superadmin/companies',
    section: 'COMPANIES',
  },
  {
    label: 'Billing',
    icon: IoReceipt,
    path: '/app/superadmin/billing',
    section: 'BILLING',
  },
  // {
  //   label: 'Admin FAQ',
  //   icon: IoHelpCircle,
  //   path: '/app/superadmin/admin-faq',
  //   section: 'HELP',
  // },
  {
    label: 'Users',
    icon: IoShieldCheckmark,
    path: '/app/superadmin/users',
    section: 'ADMINISTRATION',
  },
  {
    label: 'Website requests',
    icon: IoBriefcase,
    path: '/app/superadmin/offline-requests',
    section: 'REQUESTS',
  },
  // {
  //   label: 'Support Ticket',
  //   icon: IoTicket,
  //   path: '/app/superadmin/support-tickets',
  //   section: 'SUPPORT',
  // },
  // {
  //   label: 'Front Settings',
  //   icon: IoGlobe,
  //   path: '/app/superadmin/front-settings',
  //   section: 'SETTINGS',
  // },
  {
    label: 'Settings',
    icon: IoSettings,
    path: '/app/superadmin/settings',
    section: 'SETTINGS',
  },
  {
    label: 'PWA Settings',
    icon: IoPhonePortrait,
    path: '/app/superadmin/pwa-settings',
    section: 'SETTINGS',
  },
]

export default superAdminSidebarData


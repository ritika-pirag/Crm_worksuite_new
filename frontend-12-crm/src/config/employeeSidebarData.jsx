import {
  IoHome,
  IoCheckbox,
  IoFolderOpen,
  IoPerson,
  IoDocumentText,
  IoTime,
  IoCalendar,
  IoChatbubbles,
  IoNotifications,
  IoSettings,
  IoStopwatch,
  IoTicket,
} from 'react-icons/io5'

const employeeSidebarData = [
  {
    label: 'Dashboard',
    icon: IoHome,
    path: '/app/employee/dashboard',
    section: null,
  },
  {
    section: 'WORK',
  },
  {
    label: 'My Tasks',
    icon: IoCheckbox,
    path: '/app/employee/my-tasks',
    section: 'WORK',
  },
  {
    label: 'My Projects',
    icon: IoFolderOpen,
    path: '/app/employee/my-projects',
    section: 'WORK',
  },
  {
    label: 'Time Tracking',
    icon: IoStopwatch,
    path: '/app/employee/time-tracking',
    section: 'WORK',
  },
  {
    label: 'Event',
    icon: IoCalendar,
    path: '/app/employee/calendar',
    section: 'WORK',
  },
  {
    section: 'HR & PROFILE',
  },
  {
    label: 'My Profile',
    icon: IoPerson,
    path: '/app/employee/my-profile',
    section: 'HR & PROFILE',
  },
  {
    label: 'My Documents',
    icon: IoDocumentText,
    path: '/app/employee/my-documents',
    section: 'HR & PROFILE',
  },
  {
    label: 'Attendance',
    icon: IoTime,
    path: '/app/employee/attendance',
    section: 'HR & PROFILE',
  },
  {
    label: 'Leave Requests',
    icon: IoTime,
    path: '/app/employee/leave-requests',
    section: 'HR & PROFILE',
  },
  {
    section: 'COMMUNICATION',
  },
  {
    label: 'Messages',
    icon: IoChatbubbles,
    path: '/app/employee/messages',
    section: 'COMMUNICATION',
  },
  {
    label: 'Tickets',
    icon: IoTicket,
    path: '/app/employee/tickets',
    section: 'COMMUNICATION',
  },
  // {
  //   label: 'Notifications',
  //   icon: IoNotifications,
  //   path: '/app/employee/notifications',
  //   section: 'COMMUNICATION',
  // },
  // {
  //   section: 'SETTINGS',
  // },
  // {
  //   label: 'Settings',
  //   icon: IoSettings,
  //   path: '/app/employee/settings',
  //   section: 'SETTINGS',
  // },
]

export default employeeSidebarData


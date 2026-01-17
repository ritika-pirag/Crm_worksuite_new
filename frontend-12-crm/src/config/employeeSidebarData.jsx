/**
 * Employee Sidebar Data
 * Each menu item has a moduleKey that maps to module settings
 * The Sidebar component will filter these based on ModulesContext
 */

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
    moduleKey: 'dashboard', // Maps to employeeMenus.dashboard
  },
  {
    section: 'WORK',
  },
  {
    label: 'My Tasks',
    icon: IoCheckbox,
    path: '/app/employee/my-tasks',
    section: 'WORK',
    moduleKey: 'myTasks', // Maps to employeeMenus.myTasks
  },
  {
    label: 'My Projects',
    icon: IoFolderOpen,
    path: '/app/employee/my-projects',
    section: 'WORK',
    moduleKey: 'myProjects', // Maps to employeeMenus.myProjects
  },
  {
    label: 'Time Tracking',
    icon: IoStopwatch,
    path: '/app/employee/time-tracking',
    section: 'WORK',
    moduleKey: 'timeTracking', // Maps to employeeMenus.timeTracking
  },
  {
    label: 'Event',
    icon: IoCalendar,
    path: '/app/employee/calendar',
    section: 'WORK',
    moduleKey: 'events', // Maps to employeeMenus.events
  },
  {
    section: 'HR & PROFILE',
  },
  {
    label: 'My Profile',
    icon: IoPerson,
    path: '/app/employee/my-profile',
    section: 'HR & PROFILE',
    moduleKey: 'myProfile', // Maps to employeeMenus.myProfile
  },
  {
    label: 'My Documents',
    icon: IoDocumentText,
    path: '/app/employee/my-documents',
    section: 'HR & PROFILE',
    moduleKey: 'documents', // Maps to employeeMenus.documents
  },
  {
    label: 'Attendance',
    icon: IoTime,
    path: '/app/employee/attendance',
    section: 'HR & PROFILE',
    moduleKey: 'attendance', // Maps to employeeMenus.attendance
  },
  {
    label: 'Leave Requests',
    icon: IoTime,
    path: '/app/employee/leave-requests',
    section: 'HR & PROFILE',
    moduleKey: 'leaveRequests', // Maps to employeeMenus.leaveRequests
  },
  {
    section: 'COMMUNICATION',
  },
  {
    label: 'Messages',
    icon: IoChatbubbles,
    path: '/app/employee/messages',
    section: 'COMMUNICATION',
    moduleKey: 'messages', // Maps to employeeMenus.messages
  },
  {
    label: 'Tickets',
    icon: IoTicket,
    path: '/app/employee/tickets',
    section: 'COMMUNICATION',
    moduleKey: 'tickets', // Maps to employeeMenus.tickets
  },
]

export default employeeSidebarData

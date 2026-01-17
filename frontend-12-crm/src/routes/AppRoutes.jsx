import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Layouts
import WebsiteLayout from '../layouts/WebsiteLayout'
import AuthLayout from '../layouts/AuthLayout'
import AppLayout from '../layouts/AppLayout'

// Website Pages
import HomePage from '../website/pages/HomePage'
import PricingPage from '../website/pages/PricingPage'
import ContactPage from '../website/pages/ContactPage'
import AboutPage from '../website/pages/AboutPage'
import PrivacyPolicyPage from '../website/pages/PrivacyPolicyPage'
import TermsPage from '../website/pages/TermsPage'
import RefundPolicyPage from '../website/pages/RefundPolicyPage'

// Auth Pages
import LoginPage from '../auth/pages/LoginPage'
import ForgotPasswordPage from '../auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '../auth/pages/ResetPasswordPage'

// Admin Pages
import AdminDashboard from '../app/admin/pages/AdminDashboard'
import Leads from '../app/admin/pages/Leads'
import LeadDetail from '../app/admin/pages/LeadDetail'
import Clients from '../app/admin/pages/Clients'
import ClientDetail from '../app/admin/pages/ClientDetail'
import Companies from '../app/admin/pages/Companies'
import Projects from '../app/admin/pages/Projects'
import ProjectDetail from '../app/admin/pages/ProjectDetail'
import ProjectTemplates from '../app/admin/pages/ProjectTemplates'
import ProjectTemplateForm from '../app/admin/pages/ProjectTemplateForm'
import Tasks from '../app/admin/pages/Tasks'
import AdminCalendar from '../app/admin/pages/Calendar'
import Messages from '../app/admin/pages/Messages'
import Tickets from '../app/admin/pages/Tickets'
import TimeTracking from '../app/admin/pages/TimeTracking'
import Proposals from '../app/admin/pages/Proposals'
import ProposalDetail from '../app/admin/pages/ProposalDetail'
import Estimates from '../app/admin/pages/Estimates'
import EstimateDetail from '../app/admin/pages/EstimateDetail'
import Invoices from '../app/admin/pages/Invoices'
import InvoiceDetail from '../app/admin/pages/InvoiceDetail'
import Expenses from '../app/admin/pages/Expenses'
import AdminStore from '../app/admin/pages/Store'
import Items from '../app/admin/pages/Items'
import AdminPayments from '../app/admin/pages/Payments'
import AdminCreditNotes from '../app/admin/pages/CreditNotes'
import BankAccounts from '../app/admin/pages/BankAccounts'
import AdminContracts from '../app/admin/pages/Contracts'
import ContractDetail from '../app/admin/pages/ContractDetail'
import Orders from '../app/admin/pages/Orders'
import OrderDetail from '../app/admin/pages/OrderDetail'
import Subscriptions from '../app/admin/pages/Subscriptions'
import Integrations from '../app/admin/pages/Integrations'
import Employees from '../app/admin/pages/Employees'
import EmployeeDetail from '../app/admin/pages/EmployeeDetail'
import Attendance from '../app/admin/pages/Attendance'
import AdminLeaveRequests from '../app/admin/pages/LeaveRequests'
import Departments from '../app/admin/pages/Departments'
import Positions from '../app/admin/pages/Positions'
import Documents from '../app/admin/pages/Documents'
import Reports from '../app/admin/pages/Reports'
import RolesPermissions from '../app/admin/pages/RolesPermissions'
import AuditLogs from '../app/admin/pages/AuditLogs'
import EmailTemplates from '../app/admin/pages/EmailTemplates'
import FinanceTemplates from '../app/admin/pages/FinanceTemplates'
import CustomFields from '../app/admin/pages/CustomFields'
import SocialMediaLeads from '../app/admin/pages/SocialMediaLeads'
import SystemHealth from '../app/admin/pages/SystemHealth'
import Settings from '../app/admin/pages/Settings'
import ModuleSettings from '../app/admin/pages/ModuleSettings'
import CompanyPackages from '../app/admin/pages/CompanyPackages'
import LicenseManagement from '../app/admin/pages/LicenseManagement'
import ZohoBooks from '../app/admin/pages/ZohoBooks'
import QuickBooks from '../app/admin/pages/QuickBooks'
import PaymentGateways from '../app/admin/pages/PaymentGateways'
import SystemUpdates from '../app/admin/pages/SystemUpdates'
import DatabaseBackup from '../app/admin/pages/DatabaseBackup'
import TourGuide from '../app/admin/pages/TourGuide'
import Documentation from '../app/admin/pages/Documentation'

// Employee Pages
import EmployeeDashboard from '../app/employee/pages/EmployeeDashboard'
import MyTasks from '../app/employee/pages/MyTasks'
import MyProjects from '../app/employee/pages/MyProjects'
import MyProfile from '../app/employee/pages/MyProfile'
import MyDocuments from '../app/employee/pages/MyDocuments'
import EmployeeAttendance from '../app/employee/pages/Attendance'
import LeaveRequests from '../app/employee/pages/LeaveRequests'
import EmployeeCalendarPage from '../app/employee/pages/Calendar'
import EmployeeMessages from '../app/employee/pages/Messages'
import EmployeeTimeTracking from '../app/employee/pages/TimeTracking'
import Notifications from '../app/employee/pages/Notifications'
import EmployeeSettings from '../app/employee/pages/Settings'
import EmployeeTickets from '../app/employee/pages/Tickets'

// Super Admin Pages
import SuperAdminDashboard from '../app/superadmin/pages/SuperAdminDashboard'
import Packages from '../app/superadmin/pages/Packages'
import SuperAdminCompanies from '../app/superadmin/pages/Companies'
import Billing from '../app/superadmin/pages/Billing'
import AdminFAQ from '../app/superadmin/pages/AdminFAQ'
import Users from '../app/superadmin/pages/Users'
import OfflineRequests from '../app/superadmin/pages/OfflineRequests'
import SupportTickets from '../app/superadmin/pages/SupportTickets'
import FrontSettings from '../app/superadmin/pages/FrontSettings'
import SuperAdminSettings from '../app/superadmin/pages/Settings'
import PwaSettings from '../app/superadmin/pages/PwaSettings'

// Client Pages
import ClientDashboard from '../app/client/pages/ClientDashboard'
import Contracts from '../app/client/pages/Contracts'
import ClientProjects from '../app/client/pages/Projects'
import ClientProjectDetail from '../app/client/pages/ProjectDetail'
import ClientTasks from '../app/client/pages/Tasks'
import ClientEstimates from '../app/client/pages/Estimates'
import ClientInvoices from '../app/client/pages/Invoices'
import ClientInvoiceDetail from '../app/client/pages/InvoiceDetail'
import Payments from '../app/client/pages/Payments'
import CreditNotes from '../app/client/pages/CreditNotes'
import Profile from '../app/client/pages/Profile'
import ClientNotifications from '../app/client/pages/Notifications'
import ClientSettings from '../app/client/pages/Settings'
import ClientMessages from '../app/client/pages/Messages'
import ClientProposals from '../app/client/pages/Proposals'
import ClientProposalDetail from '../app/client/pages/ProposalDetail'
import ClientStore from '../app/client/pages/Store'
import ClientFiles from '../app/client/pages/Files'
import ClientNotes from '../app/client/pages/Notes'
import ClientTickets from '../app/client/pages/Tickets'
import ClientSubscriptions from '../app/client/pages/Subscriptions'
import ClientOrders from '../app/client/pages/Orders'
import ClientCalendar from '../app/client/pages/Calendar'
import ClientEvents from '../app/client/pages/Events'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  try {
    const { user, loading } = useAuth()

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-primary-text">Loading...</div>
        </div>
      )
    }

    if (!user) {
      return <Navigate to="/login" replace />
    }

    return children
  } catch (error) {
    console.error('ProtectedRoute error:', error)
    return <Navigate to="/login" replace />
  }
}

// Role-based redirect component
const RoleRedirect = () => {
  try {
    const { user } = useAuth()

    if (!user) return <Navigate to="/login" replace />

    switch (user.role) {
      case 'SUPERADMIN':
        return <Navigate to="/app/superadmin/dashboard" replace />
      case 'ADMIN':
        return <Navigate to="/app/admin/dashboard" replace />
      case 'EMPLOYEE':
        return <Navigate to="/app/employee/dashboard" replace />
      case 'CLIENT':
        return <Navigate to="/app/client/dashboard" replace />
      default:
        return <Navigate to="/login" replace />
    }
  } catch (error) {
    console.error('RoleRedirect error:', error)
    return <Navigate to="/login" replace />
  }
}

function AppRoutes() {
  return (
    <Routes>
      {/* Redirect Root to Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth Routes */}
      <Route path="/login" element={<AuthLayout />}>
        <Route index element={<LoginPage />} />
      </Route>
      <Route path="/forgot-password" element={<AuthLayout />}>
        <Route index element={<ForgotPasswordPage />} />
      </Route>
      <Route path="/reset-password" element={<AuthLayout />}>
        <Route index element={<ResetPasswordPage />} />
      </Route>

      {/* Public Legal Pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/refund-policy" element={<RefundPolicyPage />} />

      {/* Protected App Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleRedirect />} />

        {/* Super Admin Routes */}
        <Route path="superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="superadmin/packages" element={<Packages />} />
        <Route path="superadmin/companies" element={<SuperAdminCompanies />} />
        <Route path="superadmin/billing" element={<Billing />} />
        <Route path="superadmin/admin-faq" element={<AdminFAQ />} />
        <Route path="superadmin/users" element={<Users />} />
        <Route path="superadmin/offline-requests" element={<OfflineRequests />} />
        <Route path="superadmin/support-tickets" element={<SupportTickets />} />
        {/* Front Settings Removed */}
        <Route path="superadmin/settings" element={<SuperAdminSettings />} />
        <Route path="superadmin/pwa-settings" element={<PwaSettings />} />

        {/* Admin Routes */}
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/leads" element={<Leads />} />
        <Route path="admin/leads/:id" element={<LeadDetail />} />
        <Route path="admin/clients" element={<Clients />} />
        <Route path="admin/clients/:id" element={<ClientDetail />} />
        <Route path="admin/companies" element={<Companies />} />
        <Route path="admin/company-packages" element={<CompanyPackages />} />
        <Route path="admin/license-management" element={<LicenseManagement />} />
        <Route path="admin/projects" element={<Projects />} />
        <Route path="admin/projects/:id" element={<ProjectDetail />} />
        <Route path="admin/project-templates" element={<ProjectTemplates />} />
        <Route path="admin/project-templates/add" element={<ProjectTemplateForm />} />
        <Route path="admin/project-templates/:id" element={<ProjectTemplateForm />} />
        <Route path="admin/project-templates/:id/edit" element={<ProjectTemplateForm />} />
        <Route path="admin/tasks" element={<Tasks />} />
        <Route path="admin/calendar" element={<AdminCalendar />} />
        <Route path="admin/messages" element={<Messages />} />
        <Route path="admin/tickets" element={<Tickets />} />
        <Route path="admin/time-tracking" element={<TimeTracking />} />
        <Route path="admin/proposals" element={<Proposals />} />
        <Route path="admin/proposals/:id" element={<ProposalDetail />} />
        <Route path="admin/estimates" element={<Estimates />} />
        <Route path="admin/estimates/:id" element={<EstimateDetail />} />
        <Route path="admin/invoices" element={<Invoices />} />
        <Route path="admin/invoices/:id" element={<InvoiceDetail />} />
        <Route path="admin/expenses" element={<Expenses />} />
        <Route path="admin/items" element={<Items />} />
        <Route path="admin/store" element={<AdminStore />} />
        <Route path="admin/payments" element={<AdminPayments />} />
        <Route path="admin/credit-notes" element={<AdminCreditNotes />} />
        <Route path="admin/bank-accounts" element={<BankAccounts />} />
        <Route path="admin/contracts" element={<AdminContracts />} />
        <Route path="admin/contracts/:id" element={<ContractDetail />} />
        <Route path="admin/orders" element={<Orders />} />
        <Route path="admin/orders/:id" element={<OrderDetail />} />
        <Route path="admin/subscriptions" element={<Subscriptions />} />
        <Route path="admin/integrations" element={<Integrations />} />
        <Route path="admin/integrations/zoho-books" element={<ZohoBooks />} />
        <Route path="admin/integrations/quickbooks" element={<QuickBooks />} />
        <Route path="admin/integrations/payment-gateways" element={<PaymentGateways />} />
        <Route path="admin/system-updates" element={<SystemUpdates />} />
        <Route path="admin/database-backup" element={<DatabaseBackup />} />
        <Route path="admin/tour-guide" element={<TourGuide />} />
        <Route path="admin/documentation" element={<Documentation />} />
        <Route path="admin/employees" element={<Employees />} />
        <Route path="admin/employees/:id" element={<EmployeeDetail />} />
        <Route path="admin/attendance" element={<Attendance />} />
        <Route path="admin/leave-requests" element={<AdminLeaveRequests />} />
        <Route path="admin/departments" element={<Departments />} />
        <Route path="admin/positions" element={<Positions />} />
        <Route path="admin/documents" element={<Documents />} />
        <Route path="admin/reports" element={<Reports />} />
        <Route path="admin/roles-permissions" element={<RolesPermissions />} />
        <Route path="admin/audit-logs" element={<AuditLogs />} />
        <Route path="admin/email-templates" element={<EmailTemplates />} />
        <Route path="admin/finance-templates" element={<FinanceTemplates />} />
        <Route path="admin/custom-fields" element={<CustomFields />} />
        <Route path="admin/social-media-leads" element={<SocialMediaLeads />} />
        <Route path="admin/system-health" element={<SystemHealth />} />
        <Route path="admin/settings" element={<Settings />} />
        <Route path="admin/settings/modules" element={<ModuleSettings />} />

        {/* Employee Routes */}
        <Route path="employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="employee/my-tasks" element={<MyTasks />} />
        <Route path="employee/my-projects" element={<MyProjects />} />
        <Route path="employee/my-profile" element={<MyProfile />} />
        <Route path="employee/my-documents" element={<MyDocuments />} />
        <Route path="employee/attendance" element={<EmployeeAttendance />} />
        <Route path="employee/leave-requests" element={<LeaveRequests />} />
        <Route path="employee/calendar" element={<EmployeeCalendarPage />} />
        <Route path="employee/messages" element={<EmployeeMessages />} />
        <Route path="employee/time-tracking" element={<EmployeeTimeTracking />} />
        <Route path="employee/notifications" element={<Notifications />} />
        <Route path="employee/settings" element={<EmployeeSettings />} />
        <Route path="employee/tickets" element={<EmployeeTickets />} />

        {/* Client Routes */}
        <Route path="client/dashboard" element={<ClientDashboard />} />
        <Route path="client/projects" element={<ClientProjects />} />
        <Route path="client/projects/:id" element={<ClientProjectDetail />} />
        <Route path="client/proposals" element={<ClientProposals />} />
        <Route path="client/proposals/:id" element={<ClientProposalDetail />} />
        <Route path="client/store" element={<ClientStore />} />
        <Route path="client/files" element={<ClientFiles />} />
        <Route path="client/estimates" element={<ClientEstimates />} />
        <Route path="client/invoices" element={<ClientInvoices />} />
        <Route path="client/invoices/:id" element={<ClientInvoiceDetail />} />
        <Route path="client/payments" element={<Payments />} />
        <Route path="client/subscriptions" element={<ClientSubscriptions />} />
        <Route path="client/orders" element={<ClientOrders />} />
        <Route path="client/credit-notes" element={<CreditNotes />} />
        <Route path="client/notes" element={<ClientNotes />} />
        <Route path="client/contracts" element={<Contracts />} />
        <Route path="client/tickets" element={<ClientTickets />} />
        <Route path="client/messages" element={<ClientMessages />} />
        <Route path="client/profile" element={<Profile />} />
        <Route path="client/notifications" element={<ClientNotifications />} />
        <Route path="client/settings" element={<ClientSettings />} />
        <Route path="client/calendar" element={<ClientCalendar />} />
        <Route path="client/events" element={<ClientEvents />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes

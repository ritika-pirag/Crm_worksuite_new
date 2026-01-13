import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { dashboardAPI, invoicesAPI, paymentsAPI, projectsAPI, contractsAPI, estimatesAPI, clientsAPI } from '../../../api'
import { 
  IoDocumentText, 
  IoCash, 
  IoNotifications, 
  IoArrowForward,
  IoCheckmarkCircle,
  IoTime,
  IoAlertCircle,
  IoFolderOpen,
  IoReceipt,
  IoCard,
  IoPerson,
  IoSettings,
  IoAdd,
  IoEye
} from 'react-icons/io5'

const ClientDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState({
    my_projects: 0,
    my_tasks: 0,
    outstanding_invoices: 0,
    total_payments: 0
  })
  const [openInvoices, setOpenInvoices] = useState([])
  const [upcomingPayments, setUpcomingPayments] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [projects, setProjects] = useState([])
  const [workData, setWorkData] = useState({ projects: [], tasks: [] })
  const [financeData, setFinanceData] = useState({ invoices: [], payments: [], estimates: [], contracts: [], credit_notes: [] })
  const [contractsCount, setContractsCount] = useState(0)
  const [estimatesCount, setEstimatesCount] = useState(0)
  const [creditNotesCount, setCreditNotesCount] = useState(0)
  const [contactsCount, setContactsCount] = useState(0)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get user_id, company_id, and client_id
      const userId = user?.id || localStorage.getItem('userId')
      const companyId = parseInt(user?.company_id || localStorage.getItem('companyId') || 1, 10)
      const clientId = user?.client_id || localStorage.getItem('clientId')
      const params = { user_id: userId, company_id: companyId, client_id: clientId || userId }
      
      // Fetch dashboard stats
      const statsResponse = await dashboardAPI.getClientStats(params)
      if (statsResponse.data.success) {
        const stats = statsResponse.data.data
        setDashboardStats(stats)
        setContractsCount(stats.contracts_count || 0)
        setEstimatesCount(stats.estimates_count || 0)
        setCreditNotesCount(stats.credit_notes_count || 0)
        setContactsCount(stats.contacts_count || 0)
      }

      // Fetch work data
      try {
        const workResponse = await dashboardAPI.getClientWork(params)
        if (workResponse.data.success) {
          setWorkData(workResponse.data.data)
        }
      } catch (error) {
        console.error('Error fetching work data:', error)
      }

      // Fetch finance data
      try {
        const financeResponse = await dashboardAPI.getClientFinance(params)
        if (financeResponse.data.success) {
          const finance = financeResponse.data.data
          setFinanceData(finance)
          // Update counts from finance data
          if (finance.estimates) setEstimatesCount(finance.estimates.length)
          if (finance.contracts) setContractsCount(finance.contracts.length)
          if (finance.credit_notes) setCreditNotesCount(finance.credit_notes.length)
        }
      } catch (error) {
        console.error('Error fetching finance data:', error)
      }

      // Fetch client contacts count
      try {
        // Get current client ID from user
        const clientsResponse = await clientsAPI.getAll({ company_id: companyId })
        if (clientsResponse.data.success && clientsResponse.data.data.length > 0) {
          const client = clientsResponse.data.data.find(c => c.owner_id === user?.id) || clientsResponse.data.data[0]
          if (client && client.id) {
            const contactsResponse = await clientsAPI.getContacts(client.id, { company_id: companyId })
            if (contactsResponse.data.success) {
              setContactsCount(contactsResponse.data.data?.length || 0)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching contacts:', error)
      }

      // Fetch open invoices (unpaid) - filter by client
      const invoicesResponse = await invoicesAPI.getAll({ 
        page: 1, 
        pageSize: 5,
        status: 'Unpaid',
        company_id: companyId,
        client_id: clientId || userId
      })
      let transformedInvoices = []
      if (invoicesResponse.data.success) {
        const invoices = invoicesResponse.data.data || []
        transformedInvoices = invoices.map(inv => {
          const dueDate = new Date(inv.due_date || inv.dueDate)
          const today = new Date()
          const daysOverdue = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)))
          return {
            id: inv.id,
            invoiceNo: inv.invoice_number || inv.invoiceNumber || `INV-${inv.id}`,
            amount: parseFloat(inv.total || inv.amount || 0),
            dueDate: inv.due_date || inv.dueDate,
            status: inv.status || 'Unpaid',
            daysOverdue: daysOverdue
          }
        })
        setOpenInvoices(transformedInvoices)
      }

      // Fetch upcoming payments - filter by client
      const paymentsResponse = await paymentsAPI.getAll({ 
        page: 1, 
        pageSize: 5,
        company_id: companyId,
        client_id: clientId || userId
      })
      if (paymentsResponse.data.success) {
        const payments = paymentsResponse.data.data || []
        const transformedPayments = payments.map(pay => ({
          id: pay.id,
          description: pay.description || `Payment #${pay.id}`,
          amount: parseFloat(pay.amount || 0),
          dueDate: pay.payment_date || pay.paymentDate || pay.created_at
        }))
        setUpcomingPayments(transformedPayments)
      }

      // Fetch projects - filter by client
      const projectsResponse = await projectsAPI.getAll({ 
        page: 1, 
        pageSize: 10,
        company_id: companyId,
        client_id: clientId || userId
      })
      if (projectsResponse.data.success) {
        setProjects(projectsResponse.data.data || [])
      }

      // Fetch recent activity
      try {
        const activityResponse = await dashboardAPI.getClientActivity(params)
        if (activityResponse.data.success) {
          setRecentActivity(activityResponse.data.data || [])
        }
      } catch (error) {
        console.error('Error fetching activity:', error)
        // Fallback to invoices-based activity
        const activity = []
        if (transformedInvoices.length > 0) {
          transformedInvoices.slice(0, 3).forEach(inv => {
            activity.push({
              id: `inv-${inv.id}`,
              message: `Invoice ${inv.invoiceNo} ${inv.status === 'Overdue' ? 'is overdue' : 'sent'}`,
              date: inv.dueDate,
              type: 'invoice'
            })
          })
        }
        setRecentActivity(activity)
      }

      // Fetch announcements
      try {
        const announcementsResponse = await dashboardAPI.getClientAnnouncements(params)
        if (announcementsResponse.data.success) {
          const announceData = announcementsResponse.data.data || []
          setAnnouncements(announceData.map(a => ({
            id: a.id,
            title: a.title || 'Announcement',
            content: a.message || a.content || '',
            date: a.created_at
          })))
        }
      } catch (error) {
        console.error('Error fetching announcements:', error)
        setAnnouncements([])
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalOpenInvoices = openInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalUpcomingPayments = upcomingPayments.reduce((sum, pay) => sum + pay.amount, 0)

  const stats = [
    { 
      label: 'Open Invoices', 
      value: openInvoices.length.toString(), 
      subtitle: `$${totalOpenInvoices.toLocaleString()}`,
      icon: IoDocumentText, 
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      path: '/app/client/invoices'
    },
    { 
      label: 'Upcoming Payments', 
      value: upcomingPayments.length.toString(), 
      subtitle: `$${totalUpcomingPayments.toLocaleString()}`,
      icon: IoCash, 
      color: 'text-primary-accent',
      bgColor: 'bg-primary-accent/10',
      path: '/app/client/payments'
    },
    { 
      label: 'Outstanding Amount', 
      value: `$${dashboardStats.outstanding_invoices?.toLocaleString() || '0'}`, 
      subtitle: 'Total due',
      icon: IoNotifications, 
      color: 'text-secondary-accent',
      bgColor: 'bg-secondary-accent/10',
      path: '/app/client/invoices'
    },
    { 
      label: 'Active Projects', 
      value: dashboardStats.my_projects?.toString() || '0', 
      subtitle: 'In progress',
      icon: IoFolderOpen, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      path: '/app/client/projects'
    },
  ]

  // Quick Access Menu Items organized by category
  const quickAccessMenus = [
    {
      category: 'Work',
      items: [
        { label: 'Contracts', icon: IoDocumentText, path: '/app/client/contracts', color: 'text-blue-600', bgColor: 'bg-blue-100', count: contractsCount.toString() },
        { label: 'Projects', icon: IoFolderOpen, path: '/app/client/projects', color: 'text-purple-600', bgColor: 'bg-purple-100', count: workData.projects?.length?.toString() || dashboardStats.my_projects?.toString() || '0' },
        { label: 'Tasks', icon: IoCheckmarkCircle, path: '/app/client/tasks', color: 'text-orange-600', bgColor: 'bg-orange-100', count: workData.tasks?.length?.toString() || dashboardStats.my_tasks?.toString() || '0' },
      ]
    },
    {
      category: 'Finance',
      items: [
        { label: 'Invoices', icon: IoReceipt, path: '/app/client/invoices', color: 'text-indigo-600', bgColor: 'bg-indigo-100', count: financeData.invoices?.length?.toString() || openInvoices.length.toString() },
        { label: 'Estimates', icon: IoDocumentText, path: '/app/client/estimates', color: 'text-teal-600', bgColor: 'bg-teal-100', count: estimatesCount.toString() },
        { label: 'Payments', icon: IoCash, path: '/app/client/payments', color: 'text-green-600', bgColor: 'bg-green-100', count: financeData.payments?.length?.toString() || upcomingPayments.length.toString() },
        { label: 'Credit Notes', icon: IoCard, path: '/app/client/credit-notes', color: 'text-yellow-600', bgColor: 'bg-yellow-100', count: creditNotesCount.toString() },
      ]
    },
    {
      category: 'Account',
      items: [
        { label: 'Profile', icon: IoPerson, path: '/app/client/profile', color: 'text-pink-600', bgColor: 'bg-pink-100', count: 'View' },
        { label: 'Notifications', icon: IoNotifications, path: '/app/client/notifications', color: 'text-red-600', bgColor: 'bg-red-100', count: recentActivity.length.toString() },
        { label: 'Settings', icon: IoSettings, path: '/app/client/settings', color: 'text-gray-600', bgColor: 'bg-gray-100', count: 'Config' },
      ]
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Branded Welcome Banner */}
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-primary-accent to-secondary-accent rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 truncate">
              Welcome back, {user?.name || user?.email || 'Client'}
            </h1>
            <p className="text-white/90 text-xs sm:text-sm md:text-base">Here's a summary of your account</p>
          </div>
          <div className="hidden sm:flex w-14 h-14 md:w-20 md:h-20 bg-white/20 rounded-full items-center justify-center flex-shrink-0 ml-4">
            <span className="text-xl md:text-2xl font-bold text-white">
              {(user?.name || user?.email || 'C').charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </Card>

      {loading && (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading dashboard data...</p>
        </div>
      )}

      {/* Top Metrics Bar - 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card 
              key={index} 
              className="p-4 sm:p-5 md:p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(stat.path)}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-secondary-text mb-1 truncate">{stat.label}</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-text mb-1">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-secondary-text">{stat.subtitle}</p>
                </div>
                <div className={`${stat.color} ${stat.bgColor} p-3 rounded-lg flex-shrink-0 ml-2`}>
                  <Icon size={24} className="sm:w-6 sm:h-6" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-5 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-secondary-text mb-1">Open Invoices</p>
              <p className="text-xl sm:text-2xl font-bold text-primary-text">{openInvoices.length}</p>
              <p className="text-xs text-secondary-text mt-1">${totalOpenInvoices.toLocaleString()}</p>
            </div>
            <div className="text-warning bg-warning/10 p-3 rounded-lg flex-shrink-0 ml-2">
              <IoDocumentText className="text-warning" size={24} />
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-secondary-text mb-1">Upcoming Payments</p>
              <p className="text-xl sm:text-2xl font-bold text-primary-text">{upcomingPayments.length}</p>
              <p className="text-xs text-secondary-text mt-1">${totalUpcomingPayments.toLocaleString()}</p>
            </div>
            <div className="text-primary-accent bg-primary-accent/10 p-3 rounded-lg flex-shrink-0 ml-2">
              <IoCash className="text-primary-accent" size={24} />
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-secondary-text mb-1">Recent Activity</p>
              <p className="text-xl sm:text-2xl font-bold text-primary-text">{recentActivity.length}</p>
              <p className="text-xs text-secondary-text mt-1">Last 30 days</p>
            </div>
            <div className="text-secondary-accent bg-secondary-accent/10 p-3 rounded-lg flex-shrink-0 ml-2">
              <IoNotifications className="text-secondary-accent" size={24} />
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-secondary-text mb-1">Announcements</p>
              <p className="text-xl sm:text-2xl font-bold text-primary-text">{announcements.length}</p>
              <p className="text-xs text-secondary-text mt-1">Unread</p>
            </div>
            <div className="text-blue-500 bg-blue-100 p-3 rounded-lg flex-shrink-0 ml-2">
              <IoAlertCircle className="text-blue-500" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="primary" 
          onClick={() => navigate('/app/client/invoices')}
          className="flex items-center gap-2"
        >
          <IoCash size={18} />
          Pay Invoice
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/app/client/invoices')}
          className="flex items-center gap-2"
        >
          <IoEye size={18} />
          View All Invoices
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/app/client/contracts')}
          className="flex items-center gap-2"
        >
          View Contracts
        </Button>
      </div>

      {/* Quick Access Menu Items */}
      {quickAccessMenus.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="p-4 sm:p-5 md:p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-primary-text mb-4">{section.category}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon
              return (
                <button
                  key={itemIndex}
                  onClick={() => navigate(item.path)}
                  className="group p-4 rounded-lg border border-gray-200 hover:border-primary-accent hover:shadow-md transition-all text-left bg-white hover:bg-primary-accent/5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`${item.color} ${item.bgColor} p-2 rounded-lg`}>
                      <Icon size={20} />
                    </div>
                    {item.count && (
                      <Badge variant="default" className="text-xs">
                        {item.count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-primary-text group-hover:text-primary-accent transition-colors">
                    {item.label}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-secondary-text group-hover:text-primary-accent transition-colors">
                    <span>Open</span>
                    <IoArrowForward size={12} />
                  </div>
                </button>
              )
            })}
          </div>
        </Card>
      ))}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Open Invoices */}
        <Card className="p-4 sm:p-5 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-primary-text flex items-center gap-2">
              <IoDocumentText className="text-primary-accent" size={24} />
              Open Invoices
            </h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/app/client/invoices')}
              className="text-sm flex items-center gap-1"
            >
              View All
              <IoArrowForward size={16} />
            </Button>
          </div>
          <div className="space-y-3">
            {openInvoices.length === 0 ? (
              <div className="text-center py-8 text-secondary-text">
                <p>No open invoices</p>
              </div>
            ) : (
              openInvoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="p-4 rounded-lg border border-gray-200 hover:border-primary-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm sm:text-base text-primary-text">{invoice.invoiceNo}</h3>
                      <p className="text-lg font-bold text-primary-text mt-1">${invoice.amount.toLocaleString()}</p>
                    </div>
                    <Badge variant={invoice.status === 'Overdue' ? 'danger' : 'warning'}>
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-xs text-secondary-text">
                      <IoTime size={14} />
                      <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                      {invoice.daysOverdue > 0 && (
                        <span className="text-danger">({invoice.daysOverdue} days overdue)</span>
                      )}
                    </div>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => navigate(`/app/client/invoices?pay=${invoice.id}`)}
                    >
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Payments */}
        <Card className="p-4 sm:p-5 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-primary-text flex items-center gap-2">
              <IoCash className="text-primary-accent" size={24} />
              Upcoming Payments
            </h2>
          </div>
          <div className="space-y-3">
            {upcomingPayments.length === 0 ? (
              <div className="text-center py-8 text-secondary-text">
                <p>No upcoming payments</p>
              </div>
            ) : (
              upcomingPayments.map((payment) => (
              <div 
                key={payment.id} 
                className="p-4 rounded-lg border border-gray-200 bg-gray-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm sm:text-base text-primary-text">{payment.description}</h3>
                    <p className="text-lg font-bold text-primary-text mt-1">${payment.amount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-secondary-text">Due</p>
                    <p className="text-sm font-medium text-primary-text">
                      {new Date(payment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Announcements */}
      <Card className="p-4 sm:p-5 bg-white rounded-lg shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-primary-text mb-4 flex items-center gap-2">
          <IoNotifications className="text-primary-accent" size={24} />
          Announcements
        </h2>
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-secondary-text">
              <p>No announcements</p>
            </div>
          ) : (
            announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className="p-4 rounded-lg border border-gray-200 bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm sm:text-base text-primary-text mb-1">{announcement.title}</h3>
                  <p className="text-sm text-secondary-text">{announcement.content}</p>
                </div>
                <span className="text-xs text-secondary-text whitespace-nowrap">
                  {new Date(announcement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            ))
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4 sm:p-5 bg-white rounded-lg shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-primary-text mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-secondary-text">
              <p>No recent activity</p>
            </div>
          ) : (
            recentActivity.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-primary-accent mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-primary-text">{activity.message}</p>
                <p className="text-xs text-secondary-text mt-1">
                  {new Date(activity.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

export default ClientDashboard

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { useSettings } from '../../../context/SettingsContext'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { projectsAPI, invoicesAPI, tasksAPI, eventsAPI } from '../../../api'
import { 
  IoArrowBack,
  IoCalendar, 
  IoTime, 
  IoCheckmarkCircle,
  IoFolder,
  IoDocumentText,
  IoReceipt,
  IoList,
  IoStatsChart,
  IoPeople,
  IoClose,
  IoLocationSharp,
  IoEye,
  IoAdd,
  IoChevronBack,
  IoChevronForward
} from 'react-icons/io5'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useTheme()
  const { formatDate, formatCurrency } = useSettings()
  
  const userId = user?.id || localStorage.getItem('userId')
  const clientId = user?.client_id || localStorage.getItem('clientId')
  const companyId = parseInt(user?.company_id || localStorage.getItem('companyId') || 1, 10)
  const primaryColor = theme?.primaryAccent || '#0891b2'
  
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Related data
  const [projectInvoices, setProjectInvoices] = useState([])
  const [projectTasks, setProjectTasks] = useState([])
  const [projectEvents, setProjectEvents] = useState([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(false)
  
  // Events calendar state
  const [eventsMonth, setEventsMonth] = useState(new Date().getMonth() + 1)
  const [eventsYear, setEventsYear] = useState(new Date().getFullYear())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)

  useEffect(() => {
    if (id && companyId) {
      fetchProject()
    }
  }, [id, companyId])

  useEffect(() => {
    if (project && activeTab === 'tasks') {
      fetchTasks()
    } else if (project && activeTab === 'invoices') {
      fetchInvoices()
    } else if (project && activeTab === 'events') {
      fetchEvents()
    }
  }, [project, activeTab, eventsMonth, eventsYear])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await projectsAPI.getById(id, { company_id: companyId })
      if (response.data?.success) {
        const proj = response.data.data
        setProject({
          id: proj.id,
          project: proj.project_name || proj.name || `Project #${proj.id}`,
          project_name: proj.project_name || proj.name || '',
          description: proj.description || '',
          status: proj.status || 'Not Started',
          progress: proj.progress || 0,
          start_date: proj.start_date || '',
          deadline: proj.deadline || '',
          budget: parseFloat(proj.budget || 0),
          notes: proj.notes || '',
          created_by_name: proj.created_by_name || 'Admin',
          team_count: proj.team_count || 0,
          task_count: proj.task_count || 0,
          completed_tasks: proj.completed_tasks || 0,
          client_name: proj.client_name || '',
          ...proj
        })
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true)
      const response = await tasksAPI.getAll({
        company_id: companyId,
        project_id: id
      })
      if (response.data?.success) {
        setProjectTasks(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoadingTasks(false)
    }
  }

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true)
      const response = await invoicesAPI.getAll({
        company_id: companyId,
        project_id: id
      })
      if (response.data?.success) {
        setProjectInvoices(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoadingInvoices(false)
    }
  }

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true)
      const response = await eventsAPI.getAll({
        company_id: companyId,
        project_id: id,
        month: eventsMonth,
        year: eventsYear
      })
      if (response.data?.success) {
        setProjectEvents(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoadingEvents(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Not Started': { bg: 'bg-gray-100', text: 'text-gray-600' },
      'In Progress': { bg: 'bg-blue-100', text: 'text-blue-600' },
      'Active': { bg: 'bg-blue-100', text: 'text-blue-600' },
      'On Hold': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      'on hold': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      'Completed': { bg: 'bg-green-100', text: 'text-green-600' },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-600' },
      'Pending': { bg: 'bg-orange-100', text: 'text-orange-600' },
      'Confirmed': { bg: 'bg-green-100', text: 'text-green-600' },
      'To Do': { bg: 'bg-gray-100', text: 'text-gray-600' },
      'Unpaid': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      'Paid': { bg: 'bg-green-100', text: 'text-green-600' },
      'Fully Paid': { bg: 'bg-green-100', text: 'text-green-600' },
      'Overdue': { bg: 'bg-red-100', text: 'text-red-600' },
    }
    const style = statusStyles[status] || statusStyles['Not Started']
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {status}
      </span>
    )
  }

  const getTaskStatusBadge = (status) => {
    const statusColors = {
      'To Do': 'bg-gray-100 text-gray-600',
      'In Progress': 'bg-blue-100 text-blue-600',
      'Completed': 'bg-green-100 text-green-600',
      'On Hold': 'bg-yellow-100 text-yellow-600',
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[status] || statusColors['To Do']}`}>
        {status}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'Low': 'bg-gray-100 text-gray-600',
      'Medium': 'bg-blue-100 text-blue-600',
      'High': 'bg-orange-100 text-orange-600',
      'Urgent': 'bg-red-100 text-red-600',
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[priority] || priorityColors['Medium']}`}>
        {priority}
      </span>
    )
  }

  // Events calendar helpers
  const daysInMonth = new Date(eventsYear, eventsMonth, 0).getDate()
  const firstDayOfMonth = new Date(eventsYear, eventsMonth - 1, 1).getDay()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getEventsForDay = (day) => {
    const dateStr = `${eventsYear}-${String(eventsMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return projectEvents.filter(e => {
      const eventDate = e.start_date || e.event_date || e.date
      return eventDate && eventDate.includes(dateStr)
    })
  }

  const prevMonth = () => {
    if (eventsMonth === 1) {
      setEventsMonth(12)
      setEventsYear(eventsYear - 1)
    } else {
      setEventsMonth(eventsMonth - 1)
    }
  }

  const nextMonth = () => {
    if (eventsMonth === 12) {
      setEventsMonth(1)
      setEventsYear(eventsYear + 1)
    } else {
      setEventsMonth(eventsMonth + 1)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: IoFolder },
    { id: 'tasks', label: 'Tasks', icon: IoList },
    { id: 'invoices', label: 'Invoices', icon: IoReceipt },
    { id: 'events', label: 'Events', icon: IoCalendar },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent" style={{ borderColor: `${primaryColor} transparent ${primaryColor} ${primaryColor}` }}></div>
          <p className="text-secondary-text mt-4">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-text">Project not found</p>
        <button
          onClick={() => navigate('/app/client/projects')}
          className="mt-4 hover:underline"
          style={{ color: primaryColor }}
        >
          Back to Projects
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/app/client/projects')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <IoArrowBack size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {project.project.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-text">{project.project}</h1>
              <div className="flex items-center gap-3 mt-1">
                {getStatusBadge(project.status)}
                {project.created_by_name && (
                  <span className="text-sm text-gray-500">By: {project.created_by_name}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-current'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={activeTab === tab.id ? { color: primaryColor, borderColor: primaryColor } : {}}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-2">Progress</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold" style={{ color: primaryColor }}>
                      {project.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${project.progress || 0}%`, backgroundColor: primaryColor }}
                    />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-2">Budget</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${project.budget.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-2">Start Date</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {project.start_date 
                      ? new Date(project.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-2">Deadline</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {project.deadline 
                      ? new Date(project.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Description</h3>
                  <div className="text-gray-700 prose max-w-full overflow-hidden break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {project.description}
                  </div>
                </div>
              )}

              {/* Notes */}
              {project.notes && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Notes</h3>
                  <div className="text-gray-700">
                    {project.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Project Tasks
                  <span className="ml-2 text-sm font-normal text-gray-500">({projectTasks.length})</span>
                </h3>
              </div>

              {loadingTasks ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-t-transparent" style={{ borderColor: `${primaryColor} transparent ${primaryColor} ${primaryColor}` }}></div>
                </div>
              ) : projectTasks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <IoList size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No tasks found for this project</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div 
                        className={`w-4 h-4 mt-1 rounded-full flex-shrink-0 ${
                          task.status === 'Completed' ? 'bg-green-500' :
                          task.status === 'In Progress' ? 'bg-blue-500' :
                          task.status === 'On Hold' ? 'bg-yellow-500' :
                          'bg-gray-300'
                        }`} 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{task.title || task.task_name}</p>
                            {task.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {getTaskStatusBadge(task.status)}
                            {task.priority && getPriorityBadge(task.priority)}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {task.assigned_to_name && (
                            <span className="flex items-center gap-1">
                              <IoPeople size={14} />
                              {task.assigned_to_name}
                            </span>
                          )}
                          {task.deadline && (
                            <span className="flex items-center gap-1">
                              <IoCalendar size={14} />
                              {new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Project Invoices
                  <span className="ml-2 text-sm font-normal text-gray-500">({projectInvoices.length})</span>
                </h3>
              </div>

              {loadingInvoices ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-t-transparent" style={{ borderColor: `${primaryColor} transparent ${primaryColor} ${primaryColor}` }}></div>
                </div>
              ) : projectInvoices.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <IoReceipt size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No invoices found for this project</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600">Invoice #</th>
                        <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600">Amount</th>
                        <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600">Status</th>
                        <th className="text-left py-4 px-5 text-sm font-semibold text-gray-600">Due Date</th>
                        <th className="text-right py-4 px-5 text-sm font-semibold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {projectInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-5">
                            <span 
                              className="font-semibold cursor-pointer hover:underline"
                              style={{ color: primaryColor }}
                              onClick={() => navigate(`/app/client/invoices/${invoice.id}`)}
                            >
                              {invoice.invoice_number || `INV-${invoice.id}`}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-semibold text-gray-900">
                            ${parseFloat(invoice.total || 0).toLocaleString()}
                          </td>
                          <td className="py-4 px-5">
                            {getStatusBadge(invoice.status)}
                          </td>
                          <td className="py-4 px-5 text-sm text-gray-500">
                            {invoice.due_date 
                              ? new Date(invoice.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
                              : 'N/A'}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => navigate(`/app/client/invoices/${invoice.id}`)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              style={{ color: primaryColor }}
                            >
                              <IoEye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <IoCalendar size={20} />
                  Project Events
                  <span className="text-sm font-normal text-gray-500">({projectEvents.length})</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <IoChevronBack size={18} />
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                    {monthNames[eventsMonth - 1]} {eventsYear}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <IoChevronForward size={18} />
                  </button>
                </div>
              </div>

              {loadingEvents ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-t-transparent" style={{ borderColor: `${primaryColor} transparent ${primaryColor} ${primaryColor}` }}></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Events List */}
                  {projectEvents.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <IoCalendar size={48} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">No events found for this month</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projectEvents.map((event) => {
                        const eventDate = event.start_date || event.event_date || event.date
                        const eventTime = event.start_time || event.time || ''
                        const eventColor = event.label_color || event.color || primaryColor
                        
                        return (
                          <div 
                            key={event.id} 
                            className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all cursor-pointer"
                            onClick={() => {
                              setSelectedEvent(event)
                              setIsEventModalOpen(true)
                            }}
                          >
                            <div 
                              className="w-1.5 h-full min-h-[60px] rounded-full flex-shrink-0"
                              style={{ backgroundColor: eventColor }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{event.event_name || event.title || event.name}</h4>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <IoCalendar size={14} />
                                      {eventDate ? new Date(eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                    </span>
                                    {eventTime && (
                                      <span className="flex items-center gap-1">
                                        <IoTime size={14} />
                                        {eventTime}
                                      </span>
                                    )}
                                  </div>
                                  {event.location && (
                                    <p className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                                      <IoLocationSharp size={14} />
                                      {event.location}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  {getStatusBadge(event.status || 'Pending')}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false)
          setSelectedEvent(null)
        }}
        title="Event Details"
        size="md"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div 
                className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedEvent.label_color || selectedEvent.color || primaryColor }}
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedEvent.event_name || selectedEvent.title || selectedEvent.name}</h3>
                <div className="mt-1">{getStatusBadge(selectedEvent.status || 'Pending')}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">
                  {(selectedEvent.start_date || selectedEvent.event_date || selectedEvent.date)
                    ? new Date(selectedEvent.start_date || selectedEvent.event_date || selectedEvent.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-900">{selectedEvent.start_time || selectedEvent.time || 'N/A'}</p>
              </div>
            </div>

            {selectedEvent.location && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  <IoLocationSharp size={16} style={{ color: primaryColor }} />
                  {selectedEvent.location}
                </p>
              </div>
            )}

            {selectedEvent.description && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-700">{selectedEvent.description}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => {
                setIsEventModalOpen(false)
                setSelectedEvent(null)
              }}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProjectDetail


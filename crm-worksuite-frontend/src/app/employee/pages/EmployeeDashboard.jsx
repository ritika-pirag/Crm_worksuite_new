import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { employeesAPI, tasksAPI, eventsAPI, projectsAPI } from '../../../api'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { 
  IoCheckbox, 
  IoCalendar, 
  IoNotifications, 
  IoFlag,
  IoTime,
  IoArrowForward,
  IoFolderOpen,
  IoPerson,
  IoDocumentText,
  IoStopwatch,
  IoChatbubbles,
  IoSettings,
  IoAdd,
  IoEye
} from 'react-icons/io5'

const EmployeeDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState({
    my_tasks: 0,
    pending_tasks: 0,
    completed_tasks: 0,
    my_projects: 0,
    active_projects: 0,
    attendance_percentage: 0,
    time_logged_this_week: 0,
    leave_requests: 0,
    upcoming_events: 0,
    unread_messages: 0,
    my_documents: 0
  })
  const [todayTasks, setTodayTasks] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [recentNotifications, setRecentNotifications] = useState([])
  const [goalProgress, setGoalProgress] = useState({
    label: 'Task Completion',
    current: 0,
    target: 100,
    unit: '%'
  })

  useEffect(() => {
    if (userId && companyId) {
      fetchDashboardData()
    }
  }, [userId, companyId])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats using employeesAPI
      const statsResponse = await employeesAPI.getDashboardStats({
        user_id: userId,
        company_id: companyId
      })
      if (statsResponse.data.success) {
        setDashboardStats(statsResponse.data.data)
        // Calculate goal progress
        const totalTasks = statsResponse.data.data.my_tasks || 0
        const completedTasks = statsResponse.data.data.completed_tasks || 0
        const taskCompletion = totalTasks > 0 
          ? Math.round((completedTasks / totalTasks) * 100)
          : 0
        setGoalProgress(prev => ({
          ...prev,
          current: taskCompletion
        }))
      }

      // Fetch today's tasks
      const today = new Date().toISOString().split('T')[0]
      const tasksResponse = await tasksAPI.getAll({ 
        company_id: companyId,
        assigned_to: userId,
        due_date: today
      })
      if (tasksResponse.data.success) {
        const tasks = tasksResponse.data.data || []
        const transformedTasks = tasks.map(task => {
          const dueDate = task.due_date ? new Date(task.due_date) : null
          return {
            id: task.id,
            title: task.title || `Task #${task.id}`,
            project: task.project_name || task.projectName || 'N/A',
            priority: task.priority || 'Medium',
            status: task.status || 'Pending',
            dueTime: dueDate ? dueDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            completed: task.status === 'Completed' || task.status === 'Done'
          }
        })
        setTodayTasks(transformedTasks)
      }

      // Fetch upcoming events
      const eventsResponse = await eventsAPI.getAll({ 
        company_id: companyId,
        user_id: userId
      })
      if (eventsResponse.data.success) {
        const events = eventsResponse.data.data || []
        const transformedEvents = events.map(event => ({
          id: event.id,
          title: event.title || event.event_name || `Event #${event.id}`,
          time: event.starts_on_time || 'N/A',
          location: event.where || event.location || 'Office'
        }))
        setUpcomingEvents(transformedEvents)
      }

      // Set recent notifications from tasks
      const notifs = []
      if (todayTasks.length > 0) {
        todayTasks.slice(0, 3).forEach(task => {
          notifs.push({
            id: `task-${task.id}`,
            message: `Task "${task.title}" assigned to you`,
            time: 'Today',
            type: 'task'
          })
        })
      }
      setRecentNotifications(notifs)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { 
      label: 'My Tasks', 
      value: dashboardStats.my_tasks?.toString() || '0', 
      subtitle: `${dashboardStats.pending_tasks || 0} Pending • ${dashboardStats.completed_tasks || 0} Completed`,
      icon: IoCheckbox, 
      color: 'text-primary-accent',
      bgColor: 'bg-primary-accent/10',
      path: '/app/employee/my-tasks'
    },
    { 
      label: 'My Projects', 
      value: dashboardStats.my_projects?.toString() || '0', 
      subtitle: `${dashboardStats.active_projects || 0} Active`,
      icon: IoFolderOpen, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      path: '/app/employee/my-projects'
    },
    { 
      label: 'Attendance', 
      value: `${dashboardStats.attendance_percentage || 0}%`, 
      subtitle: 'This month',
      icon: IoTime, 
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      path: '/app/employee/attendance'
    },
    { 
      label: 'Time (Week)', 
      value: `${dashboardStats.time_logged_this_week || 0}h`, 
      subtitle: 'Logged this week',
      icon: IoStopwatch, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      path: '/app/employee/time-tracking'
    },
  ]

  // Quick Access Menu Items organized by category
  const quickAccessMenus = [
    {
      category: 'My Work',
      items: [
        { label: 'My Tasks', icon: IoCheckbox, path: '/app/employee/my-tasks', color: 'text-orange-600', bgColor: 'bg-orange-100', count: dashboardStats.my_tasks?.toString() || '0' },
        { label: 'My Projects', icon: IoFolderOpen, path: '/app/employee/my-projects', color: 'text-purple-600', bgColor: 'bg-purple-100', count: dashboardStats.my_projects?.toString() || '0' },
        { label: 'Time Tracking', icon: IoStopwatch, path: '/app/employee/time-tracking', color: 'text-blue-600', bgColor: 'bg-blue-100', count: `${dashboardStats.time_logged_this_week || 0}h` },
        { label: 'Calendar', icon: IoCalendar, path: '/app/employee/calendar', color: 'text-violet-600', bgColor: 'bg-violet-100', count: `${dashboardStats.upcoming_events || 0}` },
      ]
    },
    {
      category: 'HR & Profile',
      items: [
        { label: 'My Profile', icon: IoPerson, path: '/app/employee/my-profile', color: 'text-pink-600', bgColor: 'bg-pink-100', count: 'View' },
        { label: 'My Documents', icon: IoDocumentText, path: '/app/employee/my-documents', color: 'text-teal-600', bgColor: 'bg-teal-100', count: dashboardStats.my_documents?.toString() || '0' },
        { label: 'Attendance', icon: IoTime, path: '/app/employee/attendance', color: 'text-green-600', bgColor: 'bg-green-100', count: `${dashboardStats.attendance_percentage || 0}%` },
        { label: 'Leave Requests', icon: IoTime, path: '/app/employee/leave-requests', color: 'text-yellow-600', bgColor: 'bg-yellow-100', count: dashboardStats.leave_requests?.toString() || '0' },
      ]
    },
    {
      category: 'Communication',
      items: [
        { label: 'Messages', icon: IoChatbubbles, path: '/app/employee/messages', color: 'text-blue-600', bgColor: 'bg-blue-100', count: dashboardStats.unread_messages?.toString() || '0' },
        { label: 'Notifications', icon: IoNotifications, path: '/app/employee/notifications', color: 'text-red-600', bgColor: 'bg-red-100', count: recentNotifications.length.toString() },
      ]
    },
    {
      category: 'Settings',
      items: [
        { label: 'Settings', icon: IoSettings, path: '/app/employee/settings', color: 'text-gray-600', bgColor: 'bg-gray-100', count: 'Config' },
      ]
    },
  ]

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">
            Welcome, {user?.name || 'Employee'}
          </h1>
          <p className="text-sm sm:text-base text-secondary-text mt-1">Personal overview of your tasks, events, and goals</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="primary" 
            onClick={() => navigate('/app/employee/my-tasks')}
            className="flex items-center gap-2"
          >
            <IoAdd size={18} />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/app/employee/my-tasks')}
            className="flex items-center gap-2"
          >
            <IoEye size={18} />
            <span className="hidden sm:inline">View All Tasks</span>
            <span className="sm:hidden">Tasks</span>
          </Button>
        </div>
      </div>

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

      {/* Today's Tasks */}
      <Card className="p-4 sm:p-5 md:p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-primary-text flex items-center gap-2">
            <IoCheckbox className="text-primary-accent" size={24} />
            Today's Tasks
          </h2>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/app/employee/my-tasks')}
            className="text-sm flex items-center gap-1"
          >
            View All
            <IoArrowForward size={16} />
          </Button>
        </div>
        <div className="space-y-3">
          {todayTasks.slice(0, 5).map((task) => (
            <div 
              key={task.id} 
              className={`p-4 rounded-lg border transition-colors ${
                task.completed 
                  ? 'bg-gray-50 border-gray-200 opacity-75' 
                  : 'bg-white border-gray-200 hover:border-primary-accent/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 text-primary-accent rounded focus:ring-primary-accent"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-semibold text-sm sm:text-base ${
                      task.completed ? 'line-through text-secondary-text' : 'text-primary-text'
                    }`}>
                      {task.title}
                    </h3>
                    <Badge 
                      variant={
                        task.priority === 'High' ? 'danger' : 
                        task.priority === 'Medium' ? 'warning' : 
                        'default'
                      }
                      className="flex-shrink-0"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-secondary-text mb-2">{task.project}</p>
                  <div className="flex items-center gap-3 text-xs text-secondary-text">
                    <span className="flex items-center gap-1">
                      <IoTime size={14} />
                      {task.dueTime}
                    </span>
                    <Badge variant={task.status === 'In Progress' ? 'info' : task.status === 'Completed' ? 'success' : 'warning'}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Upcoming Events */}
        <Card className="p-4 sm:p-5 md:p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-primary-text flex items-center gap-2">
              <IoCalendar className="text-primary-accent" size={24} />
              Upcoming Events
            </h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/app/employee/calendar')}
              className="text-sm"
            >
              View Calendar
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-sm sm:text-base text-primary-text mb-1">{event.title}</h3>
                <div className="flex items-center gap-2 text-xs text-secondary-text">
                  <IoTime size={14} />
                  <span>{event.time}</span>
                  <span>•</span>
                  <span>{event.location}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Notifications */}
        <Card className="p-4 sm:p-5 md:p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-primary-text flex items-center gap-2">
              <IoNotifications className="text-primary-accent" size={24} />
              Recent Notifications
            </h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/app/employee/notifications')}
              className="text-sm"
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentNotifications.map((notification) => (
              <div key={notification.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-primary-text mb-1">{notification.message}</p>
                <p className="text-xs text-secondary-text">{notification.time}</p>
              </div>
            ))}
          </div>
        </Card>
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

      {/* Personal Goal Progress */}
      <Card className="p-4 sm:p-5 md:p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-primary-text flex items-center gap-2">
            <IoFlag className="text-primary-accent" size={24} />
            Personal Goal Progress
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40">
            <svg className="transform -rotate-90 w-full h-full">
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40 * (goalProgress.current / 100)} ${2 * Math.PI * 40}`}
                className="text-primary-accent"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary-text">{goalProgress.current}</p>
                <p className="text-xs text-secondary-text">{goalProgress.unit}</p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary-text mb-2">{goalProgress.label}</h3>
            <p className="text-sm text-secondary-text mb-4">
              {goalProgress.current}% of {goalProgress.target}% target achieved
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-accent h-2 rounded-full transition-all"
                style={{ width: `${goalProgress.current}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default EmployeeDashboard

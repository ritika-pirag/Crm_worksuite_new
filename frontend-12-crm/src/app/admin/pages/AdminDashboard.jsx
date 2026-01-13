import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardAPI, attendanceAPI } from '../../../api'
import { useAuth } from '../../../context/AuthContext'
import { useSettings } from '../../../context/SettingsContext'
import {
  IoTime,
  IoCalendar,
  IoCash,
  IoAdd,
  IoCheckmark,
  IoList,
  IoSearch,
  IoEllipsisHorizontal,
  IoLogOut,
  IoPlay,
  IoDocument,
  IoNotifications,
  IoGrid,
  IoStatsChart,
  IoTicket,
  IoPeople,
  IoFolder,
  IoChevronForward,
  IoChevronBack,
  IoLocationSharp,
  IoCompass,
  IoClose,
  IoPersonAdd,
  IoSettings,
  IoAlertCircle
} from 'react-icons/io5'
import RichTextEditor from '../../../components/ui/RichTextEditor'
import {
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaMagic,
  FaBold,
  FaItalic,
  FaUnderline,
  FaEraser,
  FaListUl,
  FaListOl,
  FaLink,
  FaImage,
  FaCode
} from 'react-icons/fa'
import Modal from '../../../components/ui/Modal'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { formatDate, formatCurrency, settings, getCompanyInfo } = useSettings()
  const companyId = parseInt(user?.company_id || localStorage.getItem('companyId') || 1, 10)
  const userId = parseInt(user?.id || localStorage.getItem('userId') || 1, 10)

  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [clockTime, setClockTime] = useState('00:00:00')
  const [todoInput, setTodoInput] = useState('')
  const [showDoneTodos, setShowDoneTodos] = useState(false)
  const [stickyNote, setStickyNote] = useState('My quick notes here...')
  const [todoPage, setTodoPage] = useState(1)
  const [showClockOutModal, setShowClockOutModal] = useState(false)
  const [clockOutNote, setClockOutNote] = useState('')
  const clockIntervalRef = useRef(null)

  // Fetch ALL dashboard data from SINGLE API
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await dashboardAPI.getAll({ company_id: companyId, user_id: userId })

      if (response.data.success) {
        const data = response.data.data
        setDashboardData(data)
        setIsClockedIn(data.summary?.isClockedIn || false)
        setClockTime(data.summary?.clockIn || '00:00:00')
        setStickyNote(data.stickyNote || 'My quick notes here...')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [companyId, userId])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Clock timer
  useEffect(() => {
    if (isClockedIn) {
      clockIntervalRef.current = setInterval(() => {
        setClockTime(prev => {
          const parts = prev.split(':').map(Number)
          let [h, m, s] = parts
          s++
          if (s >= 60) { s = 0; m++ }
          if (m >= 60) { m = 0; h++ }
          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        })
      }, 1000)
    }
    return () => clearInterval(clockIntervalRef.current)
  }, [isClockedIn])

  const handleClockIn = async () => {
    try {
      await attendanceAPI.checkIn({ company_id: companyId })
      setIsClockedIn(true)
      setClockTime('00:00:00')
    } catch (error) {
      console.error('Error clocking in:', error)
    }
  }

  const handleClockOut = () => {
    setShowClockOutModal(true)
  }

  const confirmClockOut = async () => {
    try {
      await attendanceAPI.checkOut({ company_id: companyId, note: clockOutNote })
      setIsClockedIn(false)
      clearInterval(clockIntervalRef.current)
      setShowClockOutModal(false)
      setClockOutNote('')
    } catch (error) {
      console.error('Error clocking out:', error)
    }
  }

  const handleAddTodo = async () => {
    if (todoInput.trim()) {
      try {
        await dashboardAPI.saveTodo({ user_id: userId, title: todoInput })
        setTodoInput('')
        fetchDashboardData()
      } catch (error) {
        console.error('Error saving todo:', error)
      }
    }
  }

  const handleToggleTodo = async (id, completed) => {
    try {
      await dashboardAPI.updateTodo(id, { is_completed: !completed })
      fetchDashboardData()
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const handleSaveStickyNote = async () => {
    try {
      await dashboardAPI.saveStickyNote({ user_id: userId, content: stickyNote })
    } catch (error) {
      console.error('Error saving sticky note:', error)
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  const {
    summary = {},
    projectsOverview = {},
    invoiceOverview = {},
    incomeVsExpenses = {},
    tasksOverview = {},
    teamOverview = {},
    ticketStatus = {},
    timeline = [],
    events = [],
    openProjects = [],
    todos = [],
    myTasks = []
  } = dashboardData || {}

  const filteredTodos = showDoneTodos ? todos.filter(t => t.completed) : todos.filter(t => !t.completed)
  const paginatedTodos = filteredTodos.slice((todoPage - 1) * 5, todoPage * 5)
  const totalTodoPages = Math.ceil(filteredTodos.length / 5) || 1

  // Donut Chart Component
  const DonutChartCustom = ({ data, size = 160 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = 0

    const createArcPath = (startAngle, endAngle, radius, innerRadius) => {
      const startX = 50 + radius * Math.cos((startAngle - 90) * Math.PI / 180)
      const startY = 50 + radius * Math.sin((startAngle - 90) * Math.PI / 180)
      const endX = 50 + radius * Math.cos((endAngle - 90) * Math.PI / 180)
      const endY = 50 + radius * Math.sin((endAngle - 90) * Math.PI / 180)
      const innerStartX = 50 + innerRadius * Math.cos((endAngle - 90) * Math.PI / 180)
      const innerStartY = 50 + innerRadius * Math.sin((endAngle - 90) * Math.PI / 180)
      const innerEndX = 50 + innerRadius * Math.cos((startAngle - 90) * Math.PI / 180)
      const innerEndY = 50 + innerRadius * Math.sin((startAngle - 90) * Math.PI / 180)
      const largeArc = endAngle - startAngle > 180 ? 1 : 0

      return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} L ${innerStartX} ${innerStartY} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEndX} ${innerEndY} Z`
    }

    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        {data.map((item, index) => {
          if (item.value === 0) return null
          const angle = (item.value / total) * 360
          const path = createArcPath(currentAngle, currentAngle + angle, 40, 25)
          currentAngle += angle
          return <path key={index} d={path} fill={item.color} />
        })}
        {data.map((item, index) => {
          if (item.value === 0) return null
          const midAngle = data.slice(0, index).reduce((sum, i) => sum + (i.value / total) * 360, 0) + (item.value / total) * 180
          const labelRadius = 32
          const x = 50 + labelRadius * Math.cos((midAngle - 90) * Math.PI / 180)
          const y = 50 + labelRadius * Math.sin((midAngle - 90) * Math.PI / 180)
          return (
            <text key={`label-${index}`} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="6" fill="#fff" fontWeight="500">
              {item.label}
            </text>
          )
        })}
      </svg>
    )
  }

  // Simple Bar Chart Component
  const SimpleBarChart = ({ data, height = 80 }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1)
    return (
      <div className="flex items-end gap-0.5 h-full" style={{ height }}>
        {data.map((item, idx) => (
          <div
            key={idx}
            className="flex-1 bg-green-500 rounded-t-sm min-w-[3px]"
            style={{ height: `${(item.value / maxValue) * 100}%` }}
            title={`Day ${item.day}: ${item.value}`}
          />
        ))}
      </div>
    )
  }

  // Tasks chart data
  const tasksChartData = [
    { label: 'To do', value: tasksOverview.todo ?? 0, color: '#F97316' },
    { label: 'In progress', value: tasksOverview.inProgress ?? 0, color: '#3B82F6' },
    { label: 'Review', value: tasksOverview.review ?? 0, color: '#8B5CF6' },
    { label: 'Done', value: tasksOverview.done ?? 0, color: '#22C55E' },
    { label: 'Expired', value: tasksOverview.expired ?? 0, color: '#6B7280' },
  ]

  // Income Expense chart data - use fallback values if API returns 0
  const incomeExpenseData = [
    { label: 'Income', value: incomeVsExpenses.thisYear?.income || 5207, color: '#10B981' },
    { label: 'Expenses', value: incomeVsExpenses.thisYear?.expenses || 215, color: '#EF4444' },
  ]

  // Generate ticket bar chart data
  const ticketBarData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: ticketStatus.last30Days?.[i]?.count ?? 0
  }))

  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-screen">
      {/* ===== ROW 1: TOP SUMMARY CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Clock In/Out Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <FaClock className="text-white text-2xl" />
            </div>
            <div>
              <button
                onClick={isClockedIn ? handleClockOut : handleClockIn}
                className="flex items-center gap-2 text-sm font-medium border border-gray-300 px-4 py-1.5 rounded-md bg-white hover:bg-gray-50 text-gray-700 transition-all"
              >
                {isClockedIn ? <IoLogOut size={16} /> : <IoPlay size={16} />}
                {isClockedIn ? 'Clock Out' : 'Clock In'}
              </button>
              <p className="text-xs text-gray-500 mt-2">Clock started at : {clockTime}</p>
            </div>
          </div>
        </div>

        {/* My Open Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/app/admin/tasks')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <IoList className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{summary.openTasks ?? 0}</p>
              <p className="text-sm text-gray-500">My open tasks</p>
            </div>
          </div>
        </div>

        {/* Events Today */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/app/admin/calendar')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <IoCalendar className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{summary.eventsToday ?? 0}</p>
              <p className="text-sm text-gray-500">Events today</p>
            </div>
          </div>
        </div>

        {/* Due Amount */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/app/admin/invoices')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
              <IoCompass className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.dueAmount ?? 0)}</p>
              <p className="text-sm text-gray-500">Due</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ROW 2: PROJECTS, INVOICE, INCOME ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Projects Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <IoGrid className="text-blue-600" />
            <h3 className="font-semibold text-gray-800">Projects Overview</h3>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{projectsOverview.open ?? 0}</p>
              <p className="text-xs text-gray-500">Open</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{projectsOverview.completed ?? 0}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500">{projectsOverview.hold ?? 0}</p>
              <p className="text-xs text-gray-500">Hold</p>
            </div>
          </div>
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full"
                style={{
                  width: `${projectsOverview.progress ?? 30}%`,
                  background: 'linear-gradient(90deg, #3B82F6 0%, #22C55E 100%)'
                }}
              />
            </div>
            <p className="text-center text-sm text-gray-600 mt-1">Progression {projectsOverview.progress ?? 30}%</p>
          </div>
          {/* Reminder Section */}
          <div className="pt-4 mt-4 border-t border-gray-100">
            <div className="flex items-start gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{summary.reminderToday ?? 0}</p>
                <p className="text-xs text-gray-500">Reminder Today</p>
              </div>
              <div className="flex items-start gap-2">
                <IoNotifications className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Next reminder</p>
                  <p className="text-sm text-gray-700">{summary.nextReminder ?? '16-01-2026 - Renew my...'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <IoDocument className="text-orange-500" />
            <h3 className="font-semibold text-gray-800">Invoice Overview</h3>
          </div>
          <div className="space-y-3">
            {/* Overdue */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-[100px]">
                <span className="text-red-500 font-bold">{invoiceOverview.overdue ?? 0}</span>
                <span className="text-sm text-gray-600">Overdue</span>
              </div>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <div className="w-24 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium min-w-[80px] text-right">{formatCurrency(parseFloat(invoiceOverview.overdueAmount) || 0)}</span>
              </div>
            </div>
            {/* Not paid */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-[100px]">
                <span className="text-orange-500 font-bold">{invoiceOverview.notPaid ?? 3}</span>
                <span className="text-sm text-gray-600">Not paid</span>
              </div>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <div className="w-20 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-sm font-medium min-w-[80px] text-right">{formatCurrency(parseFloat(invoiceOverview.notPaidAmount) || 5970)}</span>
              </div>
            </div>
            {/* Partially paid */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-[100px]">
                <span className="text-yellow-500 font-bold">{invoiceOverview.partiallyPaid ?? 0}</span>
                <span className="text-sm text-gray-600">Partially paid</span>
              </div>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <div className="w-28 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm font-medium min-w-[80px] text-right">{formatCurrency(parseFloat(invoiceOverview.partiallyPaidAmount) || 0)}</span>
              </div>
            </div>
            {/* Fully paid */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-[100px]">
                <span className="text-blue-600 font-bold">{invoiceOverview.fullyPaid ?? 1}</span>
                <span className="text-sm text-gray-600">Fully paid</span>
              </div>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <div className="w-32 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium min-w-[80px] text-right">{formatCurrency(parseFloat(invoiceOverview.fullyPaidAmount) || 20)}</span>
              </div>
            </div>
            {/* Draft */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-[100px]">
                <span className="text-gray-400 font-bold">{invoiceOverview.draft ?? 0}</span>
                <span className="text-sm text-gray-600">Draft</span>
              </div>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
                <span className="text-sm font-medium min-w-[80px] text-right">{formatCurrency(parseFloat(invoiceOverview.draftAmount) || 0)}</span>
              </div>
            </div>
          </div>
          {/* Bottom section with chart */}
          <div className="pt-4 mt-4 border-t border-gray-100">
            <div className="flex items-start gap-4">
              <div>
                <p className="text-sm text-gray-500">Total invoiced</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(parseFloat(invoiceOverview.totalInvoiced) || 5990)}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Last 12 months</p>
                <div className="h-12">
                  <svg className="w-full h-full" viewBox="0 0 150 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="invoiceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,30 Q15,28 30,25 T60,20 T90,22 T120,15 T150,18 L150,40 L0,40 Z" fill="url(#invoiceGradient)" />
                    <path d="M0,30 Q15,28 30,25 T60,20 T90,22 T120,15 T150,18" fill="none" stroke="#3B82F6" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">Due</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(parseFloat(invoiceOverview.totalDue) || 5980)}</p>
            </div>
          </div>
        </div>

        {/* Income vs Expenses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <IoTime className="text-gray-500" />
            <h3 className="font-semibold text-gray-800">Income vs Expenses</h3>
          </div>
          <div className="flex items-center gap-6">
            {/* Donut Chart */}
            <div className="flex-shrink-0">
              <svg width="120" height="120" viewBox="0 0 100 100">
                {/* Green arc (Income - larger portion) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="10"
                  strokeDasharray={`${(incomeExpenseData[0].value / (incomeExpenseData[0].value + incomeExpenseData[1].value)) * 238.76} 238.76`}
                  transform="rotate(-90 50 50)"
                />
                {/* Red arc (Expenses - smaller portion) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="10"
                  strokeDasharray={`${(incomeExpenseData[1].value / (incomeExpenseData[0].value + incomeExpenseData[1].value)) * 238.76} 238.76`}
                  strokeDashoffset={`${-(incomeExpenseData[0].value / (incomeExpenseData[0].value + incomeExpenseData[1].value)) * 238.76}`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Year</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-semibold text-gray-800">{formatCurrency(incomeVsExpenses.thisYear?.income ?? 5207)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-semibold text-gray-800">{formatCurrency(incomeVsExpenses.thisYear?.expenses ?? 215)}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Last Year</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-gray-600">{formatCurrency(incomeVsExpenses.lastYear?.income ?? 12623)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-gray-600">{formatCurrency(incomeVsExpenses.lastYear?.expenses ?? 8905)}</span>
                </div>
              </div>
            </div>
          </div>
          {/* This Year Area Chart */}
          <div className="pt-4 mt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2">This Year</p>
            <div className="h-16">
              <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,35 Q20,30 40,32 T80,25 T120,28 T160,15 T200,10 L200,40 L0,40 Z"
                  fill="url(#areaGradient)"
                />
                <path
                  d="M0,35 Q20,30 40,32 T80,25 T120,28 T160,15 T200,10"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ROW 3: TASKS, TEAM, TICKETS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* All Tasks Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <IoList className="text-orange-500" />
            <h3 className="font-semibold text-gray-800">All Tasks Overview</h3>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <DonutChartCustom data={tasksChartData} size={130} />
            </div>
            <div className="flex-1 space-y-2 pt-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-700">To do</span>
                </div>
                <span className="font-semibold text-orange-500">{tasksOverview.todo ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-700">In progress</span>
                </div>
                <span className="font-semibold text-blue-500">{tasksOverview.inProgress ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-gray-700">Review</span>
                </div>
                <span className="font-semibold text-purple-500">{tasksOverview.review ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-700">Done</span>
                </div>
                <span className="font-semibold text-green-500">{tasksOverview.done ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-700">Expired</span>
                </div>
                <span className="font-semibold text-red-500">{tasksOverview.expired ?? 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <IoPeople className="text-indigo-500" />
            <h3 className="font-semibold text-gray-800">Team Members Overview</h3>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{teamOverview.total || 4}</p>
              <p className="text-sm text-gray-500">Team members</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{teamOverview.onLeave || 0}</p>
              <p className="text-sm text-gray-500">On leave today</p>
            </div>
          </div>
          <div className="space-y-4 mb-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-green-600 font-semibold">{teamOverview.clockedIn || 0}</span>
                <span className="text-sm text-gray-500">Members Clocked In</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-400 h-2 rounded-full"
                  style={{ width: `${teamOverview.total ? (teamOverview.clockedIn / teamOverview.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-blue-600 font-semibold">{teamOverview.clockedOut || 0}</span>
                <span className="text-sm text-gray-500">Members Clocked Out</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full"
                  style={{ width: `${teamOverview.total ? (teamOverview.clockedOut / teamOverview.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <IoNotifications size={14} />
              <span>Last announcement</span>
            </div>
            <p className="text-sm font-medium text-cyan-500 mt-1">{teamOverview.lastAnnouncement || 'Tomorrow is holiday!'}</p>
          </div>
        </div>

        {/* Ticket Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <IoTicket className="text-teal-500" />
            <h3 className="font-semibold text-gray-800">Ticket Status</h3>
          </div>
          <div className="flex gap-8 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-700">New</span>
                <span className="font-semibold text-yellow-500">{ticketStatus.new || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-gray-700">Open</span>
                <span className="font-semibold">{ticketStatus.open || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-700">Closed</span>
                <span className="font-semibold">{ticketStatus.closed || 0}</span>
              </div>
            </div>
            <div className="space-y-2 text-right flex-1">
              {(ticketStatus.categories || []).slice(0, 3).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-end gap-2 text-sm">
                  <span className="text-gray-600">{cat.name}</span>
                  <span className="font-semibold text-red-500">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">New tickets in last 30 days</p>
            <div className="relative h-20">
              <SimpleBarChart data={ticketBarData} height={70} />
              <div className="absolute left-0 top-0 text-xs text-gray-400">12</div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                {[1, 3, 5, 7, 9, 12, 15, 18, 21, 24, 27, 30].map(d => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
              <div className="w-3 h-2 bg-green-500 rounded-sm"></div>
              <span>tickets</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ROW 4: TIMELINE, EVENTS, TODO ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Project Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <IoTime className="text-blue-500" />
            <h3 className="font-semibold text-gray-800">Project Timeline</h3>
          </div>
          <div className="space-y-4 max-h-72 overflow-y-auto">
            {timeline.length > 0 ? timeline.map((item, idx) => (
              <div key={idx} className="border-l-2 border-gray-200 pl-3 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-600">{item.user?.split(' ').map(n => n[0]).join('') || 'SA'}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{item.user}</span>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
                <div className="ml-9">
                  <span className="inline-block px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded mb-1">Updated</span>
                  <p className="text-sm text-gray-700">{item.action}</p>
                  {item.status && <p className="text-xs text-gray-500 mt-0.5">• Status: <span className="text-blue-500">{item.status}</span></p>}
                  {item.priority && <p className="text-xs text-gray-500">• Priority: {item.priority}</p>}
                  {item.project && <p className="text-xs text-gray-500">Project: {item.project}</p>}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500 text-sm">No timeline data available</div>
            )}
          </div>
        </div>

        {/* Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FaCalendarAlt className="text-purple-500" />
            <h3 className="font-semibold text-gray-800">Events</h3>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {events.length > 0 ? events.map((event, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <IoCalendar className="text-orange-400 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <p className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">{event.name}</p>
                  <p className="text-xs text-gray-500">{event.date || formatDate(event.date)}, {event.time}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500 text-sm">No events available</div>
            )}
          </div>
        </div>

        {/* To Do (Private) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <IoCheckmark className="text-green-500" />
              <h3 className="font-semibold text-gray-800">To do (Private)</h3>
            </div>
            <span className="text-xs text-gray-400">Sortable</span>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
              placeholder="Add a to do..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleAddTodo}
              className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600"
            >
              Save
            </button>
          </div>
          <div className="flex items-center gap-4 mb-3 border-b border-gray-200">
            <button
              onClick={() => setShowDoneTodos(false)}
              className={`pb-2 text-sm ${!showDoneTodos ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            >
              To do
            </button>
            <button
              onClick={() => setShowDoneTodos(true)}
              className={`pb-2 text-sm ${showDoneTodos ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            >
              Done
            </button>
            <div className="flex-1 flex justify-end">
              <div className="relative">
                <IoSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input type="text" placeholder="Search" className="pl-7 pr-2 py-1 text-xs border border-gray-200 rounded w-20 focus:outline-none" />
              </div>
            </div>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {paginatedTodos.length > 0 ? paginatedTodos.map((todo) => (
              <div key={todo.id} className="flex items-start gap-2 py-1 group">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id, todo.completed)}
                  className="mt-0.5 rounded border-gray-300"
                />
                <span className={`text-sm flex-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {todo.text}
                </span>
                <button className="opacity-0 group-hover:opacity-100 text-gray-400">
                  <IoEllipsisHorizontal size={14} />
                </button>
              </div>
            )) : (
              <div className="text-center py-4 text-gray-500 text-sm">No todos available</div>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-100 mt-2">
            <button onClick={() => setTodoPage(Math.max(1, todoPage - 1))} className="p-1 hover:bg-gray-100 rounded">
              <IoChevronBack size={14} />
            </button>
            <span className="text-xs text-gray-500">{todoPage}</span>
            <button onClick={() => setTodoPage(todoPage + 1)} className="p-1 hover:bg-gray-100 rounded">
              <IoChevronForward size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ===== ROW 5: OPEN PROJECTS ===== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <IoFolder className="text-orange-500" />
          <h3 className="font-semibold text-gray-800">Open Projects</h3>
        </div>
        <div className="space-y-3">
          {openProjects.length > 0 ? openProjects.map((project) => (
            <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{project.name}</p>
                <p className="text-xs text-gray-500">
                  Start date: {project.startDate || formatDate(project.startDate)} | Deadline: {project.deadline || formatDate(project.deadline)}
                </p>
              </div>
              <div className="flex items-center gap-2 w-32">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${project.progress}%` }} />
                </div>
                <span className="text-sm font-semibold text-blue-600 w-10 text-right">{project.progress ?? 0}%</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500 text-sm">No open projects available</div>
          )}
        </div>
      </div>

      {/* ===== ROW 6: MY TASKS & STICKY NOTE ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* My Tasks */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <IoList className="text-blue-500" />
              <h3 className="font-semibold text-gray-800">My Tasks</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                <IoGrid size={14} className="text-gray-500" />
              </div>
              <div className="relative">
                <IoSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input type="text" placeholder="Search" className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-32 focus:outline-none" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase w-8">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase">Start date</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase">Deadline</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {myTasks.length > 0 ? myTasks.map((task) => (
                  <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="py-2 px-2 text-gray-700">{task.id}</td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800">{task.title}</span>
                        {task.tags && (
                          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">{task.tags}</span>
                        )}
                        <IoDocument size={14} className="text-gray-400" />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-gray-500">{task.startDate || '-'}</td>
                    <td className="py-2 px-2 text-blue-600">{task.deadline}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 text-xs rounded ${task.status === 'To do' ? 'bg-orange-100 text-orange-700' :
                        task.status === 'Review' ? 'bg-purple-100 text-purple-700' :
                          task.status === 'Done' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 text-sm">No tasks available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sticky Note */}
        <div className="bg-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <IoDocument className="text-yellow-600" />
            <h3 className="font-semibold text-gray-800">Sticky Note (Private)</h3>
          </div>
          <textarea
            value={stickyNote}
            onChange={(e) => setStickyNote(e.target.value)}
            onBlur={handleSaveStickyNote}
            className="w-full h-52 p-3 bg-yellow-50 border border-yellow-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-400 resize-none text-sm text-gray-700"
            placeholder="My quick notes here..."
          />
        </div>
      </div>
      {/* Clock Out Modal */}
      <Modal
        isOpen={showClockOutModal}
        onClose={() => setShowClockOutModal(false)}
        title="Clock Out"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <RichTextEditor
              value={clockOutNote}
              onChange={(content) => setClockOutNote(content)}
              placeholder="Enter your note..."
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowClockOutModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <IoClose className="inline mr-1" /> Close
            </button>
            <button
              onClick={confirmClockOut}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <IoCheckmark size={16} /> Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminDashboard

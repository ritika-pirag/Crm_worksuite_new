import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import DataTable from '../../../components/ui/DataTable'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { eventsAPI } from '../../../api'
import {
  IoCalendar,
  IoTime,
  IoLocation,
  IoEye,
  IoFilter,
  IoSearch,
  IoChevronDown,
  IoChevronUp,
  IoChevronBack,
  IoChevronForward,
  IoGrid,
  IoList,
} from 'react-icons/io5'

const Events = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const companyId = user?.company_id || localStorage.getItem('companyId')
  const clientId = user?.client_id || localStorage.getItem('clientId')
  const userId = user?.id || localStorage.getItem('userId')

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })

  useEffect(() => {
    if (companyId) {
      fetchEvents()
    }
  }, [companyId, clientId, currentDate])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      
      const response = await eventsAPI.getAll({
        company_id: companyId,
        client_id: clientId || userId,
        year,
        month,
        for_client: true,
        page: 1,
        pageSize: 100,
      })

      if (response.data?.success) {
        const fetchedEvents = response.data.data || []
        const transformed = fetchedEvents.map((event) => ({
          ...event,
          id: event.id,
          title: event.event_name || event.title || `Event #${event.id}`,
          date: event.starts_on_date,
          time: event.starts_on_time || '',
          location: event.where || '',
          color: event.label_color || '#3B82F6',
        }))
        setEvents(transformed)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (event) => {
    setSelectedEvent(event)
    setIsViewModalOpen(true)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      Scheduled: { bg: 'bg-blue-100', text: 'text-blue-600' },
      Confirmed: { bg: 'bg-green-100', text: 'text-green-600' },
      Completed: { bg: 'bg-purple-100', text: 'text-purple-600' },
      Cancelled: { bg: 'bg-red-100', text: 'text-red-600' },
    }
    const style = statusStyles[status] || statusStyles.Scheduled
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {status || 'Scheduled'}
      </span>
    )
  }

  // Filter events
  const filteredEvents = events.filter((e) => {
    let matches = true

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      matches =
        matches &&
        (e.title?.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query) ||
          e.location?.toLowerCase().includes(query))
    }

    if (statusFilter) {
      matches = matches && e.status === statusFilter
    }

    if (dateFilter.start) {
      matches = matches && new Date(e.date) >= new Date(dateFilter.start)
    }

    if (dateFilter.end) {
      matches = matches && new Date(e.date) <= new Date(dateFilter.end)
    }

    return matches
  })

  // Calendar helpers
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    return days
  }

  const getMonthName = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getEventsForDay = (day) => {
    if (!day) return []
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    return filteredEvents.filter((e) => {
      const eventDate = e.date || e.starts_on_date
      if (!eventDate) return false
      const date = new Date(eventDate)
      if (isNaN(date.getTime())) return false
      const formattedDate = date.toISOString().split('T')[0]
      return formattedDate === dateStr
    })
  }

  const columns = [
    {
      key: 'title',
      label: 'Event',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-10 rounded-full flex-shrink-0"
            style={{ backgroundColor: row.color }}
          />
          <div>
            <span className="font-medium text-gray-900">{value}</span>
            {row.location && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <IoLocation size={12} />
                {row.location}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (value) => (
        <div className="flex items-center gap-2 text-gray-700">
          <IoCalendar size={16} className="text-gray-400" />
          <span>{formatDate(value)}</span>
        </div>
      ),
    },
    {
      key: 'time',
      label: 'Time',
      render: (value) => (
        <div className="flex items-center gap-2 text-gray-700">
          <IoTime size={16} className="text-gray-400" />
          <span>{value || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value),
    },
  ]

  const actions = (row) => (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleView(row)
        }}
        className="p-2 text-primary-accent hover:bg-primary-accent/10 rounded-lg transition-colors"
        title="View"
      >
        <IoEye size={18} />
      </button>
    </div>
  )

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const calendarDays = getCalendarDays()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Events</h1>
          <p className="text-secondary-text mt-1">View your scheduled events</p>
        </div>

        {/* View Toggle & Filters */}
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-accent text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <IoList size={18} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                viewMode === 'calendar'
                  ? 'bg-primary-accent text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <IoGrid size={18} />
            </button>
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              isFilterOpen
                ? 'bg-primary-accent text-white border-primary-accent'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <IoFilter size={18} />
            <span className="text-sm font-medium hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <IoSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
              >
                <option value="">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter((prev) => ({ ...prev, start: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter((prev) => ({ ...prev, end: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('')
                setDateFilter({ start: '', end: '' })
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-accent border-t-transparent"></div>
          <p className="text-secondary-text mt-4">Loading events...</p>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredEvents}
            searchPlaceholder="Search events..."
            filters={false}
            actions={actions}
            bulkActions={false}
            emptyMessage="No events found"
            onRowClick={handleView}
          />
        </div>
      ) : (
        /* Calendar View */
        <Card className="p-4 sm:p-5 bg-white rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <IoChevronBack size={20} />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <IoChevronForward size={20} />
              </button>
              <h2 className="text-lg sm:text-xl font-semibold text-primary-text ml-4">
                {getMonthName()}
              </h2>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-xs sm:text-sm font-semibold text-primary-text border-r border-gray-200 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDay(day)
                const isToday =
                  day &&
                  new Date().toDateString() ===
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

                return (
                  <div
                    key={index}
                    className={`min-h-[80px] sm:min-h-[100px] border-r border-b border-gray-200 p-1 sm:p-2 ${
                      !day ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                    } ${isToday ? 'bg-blue-50' : ''}`}
                  >
                    {day && (
                      <>
                        <div
                          className={`text-xs sm:text-sm font-medium mb-1 ${
                            isToday ? 'text-primary-accent' : 'text-primary-text'
                          }`}
                        >
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleView(event)
                              }}
                              className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: event.color }}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[10px] sm:text-xs text-secondary-text">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      {/* View Event Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Event Details">
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedEvent.color || '#3B82F6' }}
              />
              <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
              {getStatusBadge(selectedEvent.status)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase font-medium">Start</p>
                <p className="font-medium text-gray-900 mt-1">
                  {formatDate(selectedEvent.date || selectedEvent.starts_on_date)}
                </p>
                {selectedEvent.time && <p className="text-sm text-gray-600">{selectedEvent.time}</p>}
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase font-medium">End</p>
                <p className="font-medium text-gray-900 mt-1">
                  {formatDate(selectedEvent.ends_on_date)}
                </p>
                {selectedEvent.ends_on_time && (
                  <p className="text-sm text-gray-600">{selectedEvent.ends_on_time}</p>
                )}
              </div>
            </div>

            {selectedEvent.location && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                <div className="flex items-center gap-2 text-gray-700">
                  <IoLocation size={16} />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>
            )}

            {selectedEvent.description && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Description</p>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Events


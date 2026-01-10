import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import Modal from '../../../components/ui/Modal'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { eventsAPI } from '../../../api'
import { 
  IoChevronBack,
  IoChevronForward,
  IoGrid,
  IoList
} from 'react-icons/io5'

const CalendarPage = () => {
  const { user } = useAuth()
  const clientId = user?.client_id || localStorage.getItem('clientId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  const [viewMode, setViewMode] = useState('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  useEffect(() => {
    if (clientId && companyId) {
      fetchEvents()
    }
  }, [currentDate, clientId, companyId])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      
      // Fetch only events assigned to this client by admin
      const response = await eventsAPI.getAll({ 
        year, 
        month,
        company_id: companyId,
        client_id: clientId,
        for_client: true,
        page: 1, 
        pageSize: 100 
      })
      
      if (response.data.success) {
        const fetchedEvents = response.data.data || []
        const transformedEvents = fetchedEvents.map(event => {
          let eventDate = event.starts_on_date || event.start_date || event.date
          if (eventDate && typeof eventDate === 'string') {
            const date = new Date(eventDate)
            if (!isNaN(date.getTime())) {
              eventDate = date.toISOString().split('T')[0]
            }
          }
          
          return {
            id: event.id,
            title: event.title || event.event_name || `Event #${event.id}`,
            date: eventDate || new Date().toISOString().split('T')[0],
            time: event.starts_on_time || event.start_time || '10:00',
            color: event.label_color || '#3B82F6',
            ...event
          }
        })
        setEvents(transformedEvents)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setIsViewModalOpen(true)
  }

  const getEventsForDay = (day) => {
    if (!day) return []
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    return events.filter(e => {
      const eventDate = e.date || e.starts_on_date || e.start_date
      if (!eventDate) return false
      const date = new Date(eventDate)
      if (isNaN(date.getTime())) return false
      const formattedDate = date.toISOString().split('T')[0]
      return formattedDate === dateStr
    })
  }

  const calendarDays = getCalendarDays()
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Event</h1>
          <p className="text-sm sm:text-base text-secondary-text mt-1">View your scheduled events</p>
        </div>
      </div>

      <Card className="p-4 sm:p-5 bg-white rounded-lg shadow-sm">
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
          <div className="flex items-center gap-2">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'month' ? 'bg-primary-accent text-white' : 'bg-white text-primary-text hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${
                  viewMode === 'week' ? 'bg-primary-accent text-white' : 'bg-white text-primary-text hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${
                  viewMode === 'day' ? 'bg-primary-accent text-white' : 'bg-white text-primary-text hover:bg-gray-50'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${
                  viewMode === 'list' ? 'bg-primary-accent text-white' : 'bg-white text-primary-text hover:bg-gray-50'
                }`}
              >
                List
              </button>
            </div>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button className="p-2 bg-white hover:bg-gray-50 transition-colors">
                <IoGrid size={18} />
              </button>
              <button className="p-2 bg-white hover:bg-gray-50 transition-colors border-l border-gray-300">
                <IoList size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {weekDays.map((day) => (
              <div key={day} className="p-3 text-center text-xs sm:text-sm font-semibold text-primary-text border-r border-gray-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDay(day)
              const isToday = day && new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
              
              return (
                <div
                  key={index}
                  className={`min-h-[80px] sm:min-h-[100px] border-r border-b border-gray-200 p-1 sm:p-2 ${
                    !day ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                  } ${isToday ? 'bg-blue-50' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-xs sm:text-sm font-medium mb-1 ${isToday ? 'text-primary-accent' : 'text-primary-text'}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewEvent(event)
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

      {/* View Event Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Event Details"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: selectedEvent.label_color || selectedEvent.color || '#3B82F6' }}
              />
              <h3 className="text-lg font-semibold text-primary-text">
                {selectedEvent.event_name || selectedEvent.title}
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Start Date</label>
                <p className="text-primary-text">
                  {selectedEvent.starts_on_date ? new Date(selectedEvent.starts_on_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Start Time</label>
                <p className="text-primary-text">{selectedEvent.starts_on_time || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">End Date</label>
                <p className="text-primary-text">
                  {selectedEvent.ends_on_date ? new Date(selectedEvent.ends_on_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">End Time</label>
                <p className="text-primary-text">{selectedEvent.ends_on_time || 'N/A'}</p>
              </div>
            </div>
            
            {selectedEvent.where && (
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Location</label>
                <p className="text-primary-text">{selectedEvent.where}</p>
              </div>
            )}
            
            {selectedEvent.description && (
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Description</label>
                <p className="text-primary-text whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>
            )}
            
            {selectedEvent.status && (
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Status</label>
                <Badge variant={selectedEvent.status === 'Confirmed' ? 'success' : 'warning'}>
                  {selectedEvent.status}
                </Badge>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CalendarPage

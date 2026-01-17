import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { eventsAPI } from '../../api'
import {
  IoAdd,
  IoCalendar,
  IoTime,
  IoLocation,
  IoEye,
  IoCreate,
  IoTrash,
  IoChevronDown,
  IoChevronUp,
  IoPeople,
  IoCheckmarkCircle,
} from 'react-icons/io5'

/**
 * Shared Events Section Component
 * Can be used in Lead, Client, Project detail pages
 * 
 * @param {string} relatedToType - 'lead', 'client', 'project'
 * @param {number} relatedToId - The ID of the related entity
 * @param {boolean} canCreate - Whether the user can create new events
 * @param {boolean} canEdit - Whether the user can edit events
 * @param {boolean} canDelete - Whether the user can delete events
 * @param {string} title - Section title (default: 'Events')
 * @param {boolean} collapsible - Whether the section can be collapsed
 * @param {boolean} defaultExpanded - Whether the section is expanded by default
 */
const EventsSection = ({
  relatedToType,
  relatedToId,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  title = 'Events',
  collapsible = false,
  defaultExpanded = true,
}) => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const companyId = user?.company_id || localStorage.getItem('companyId')
  const userId = user?.id || localStorage.getItem('userId')

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [formData, setFormData] = useState({
    event_name: '',
    description: '',
    starts_on_date: new Date().toISOString().split('T')[0],
    starts_on_time: '09:00',
    ends_on_date: new Date().toISOString().split('T')[0],
    ends_on_time: '10:00',
    where: '',
    label_color: '#3B82F6',
    status: 'Scheduled',
    repeat: 'none',
  })

  useEffect(() => {
    if (companyId && relatedToId) {
      fetchEvents()
    }
  }, [companyId, relatedToId])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = {
        company_id: companyId,
      }
      
      // Add related entity filter
      if (relatedToType === 'lead') {
        params.lead_id = relatedToId
      } else if (relatedToType === 'client') {
        params.client_id = relatedToId
      } else if (relatedToType === 'project') {
        params.project_id = relatedToId
      }

      const response = await eventsAPI.getAll(params)
      if (response.data?.success) {
        setEvents(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedEvent(null)
    setFormData({
      event_name: '',
      description: '',
      starts_on_date: new Date().toISOString().split('T')[0],
      starts_on_time: '09:00',
      ends_on_date: new Date().toISOString().split('T')[0],
      ends_on_time: '10:00',
      where: '',
      label_color: '#3B82F6',
      status: 'Scheduled',
      repeat: 'none',
    })
    setIsModalOpen(true)
  }

  const handleEdit = (event) => {
    setSelectedEvent(event)
    setFormData({
      event_name: event.event_name || event.title || '',
      description: event.description || '',
      starts_on_date: event.starts_on_date ? event.starts_on_date.split('T')[0] : new Date().toISOString().split('T')[0],
      starts_on_time: event.starts_on_time || '09:00',
      ends_on_date: event.ends_on_date ? event.ends_on_date.split('T')[0] : new Date().toISOString().split('T')[0],
      ends_on_time: event.ends_on_time || '10:00',
      where: event.where || '',
      label_color: event.label_color || '#3B82F6',
      status: event.status || 'Scheduled',
      repeat: event.repeat || 'none',
    })
    setIsModalOpen(true)
  }

  const handleView = (event) => {
    setSelectedEvent(event)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsAPI.delete(id, { company_id: companyId })
        fetchEvents()
      } catch (error) {
        console.error('Error deleting event:', error)
        alert('Failed to delete event')
      }
    }
  }

  const handleSave = async () => {
    if (!formData.event_name.trim()) {
      alert('Event name is required')
      return
    }

    try {
      const eventData = {
        ...formData,
        company_id: companyId,
        created_by: userId,
      }

      // Add related entity
      if (relatedToType === 'lead') {
        eventData.lead_id = relatedToId
      } else if (relatedToType === 'client') {
        eventData.client_id = relatedToId
      } else if (relatedToType === 'project') {
        eventData.project_id = relatedToId
      }

      if (selectedEvent) {
        await eventsAPI.update(selectedEvent.id, eventData, { company_id: companyId })
      } else {
        await eventsAPI.create(eventData, { company_id: companyId })
      }

      setIsModalOpen(false)
      fetchEvents()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event')
    }
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
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {status}
      </span>
    )
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div 
        className={`flex items-center justify-between px-4 py-3 border-b border-gray-200 ${collapsible ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <IoCalendar className="text-primary-accent" size={20} />
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {events.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              onClick={(e) => { e.stopPropagation(); handleAdd() }}
              className="p-1.5 text-primary-accent hover:bg-primary-accent/10 rounded-lg transition-colors"
              title="Add Event"
            >
              <IoAdd size={20} />
            </button>
          )}
          {collapsible && (
            isExpanded ? <IoChevronUp size={20} className="text-gray-400" /> : <IoChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {(!collapsible || isExpanded) && (
        <div className="p-4">
          {loading ? (
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-accent border-t-transparent"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <IoCalendar size={40} className="mx-auto mb-2 opacity-30" />
              <p>No events found</p>
              {canCreate && (
                <button
                  onClick={handleAdd}
                  className="mt-2 text-sm font-medium text-primary-accent hover:underline"
                >
                  + Add your first event
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  {/* Color indicator */}
                  <div
                    className="w-1 h-full min-h-[60px] rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.label_color || '#3B82F6' }}
                  />
                  
                  {/* Event details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {event.event_name || event.title}
                      </h4>
                      {getStatusBadge(event.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <IoCalendar size={14} />
                        <span>{formatDate(event.starts_on_date)}</span>
                      </div>
                      {event.starts_on_time && (
                        <div className="flex items-center gap-1">
                          <IoTime size={14} />
                          <span>{event.starts_on_time}</span>
                        </div>
                      )}
                    </div>
                    
                    {event.where && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <IoLocation size={14} />
                        <span className="truncate">{event.where}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleView(event)}
                      className="p-1.5 text-primary-accent hover:bg-primary-accent/10 rounded transition-colors"
                      title="View"
                    >
                      <IoEye size={16} />
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <IoCreate size={16} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <IoTrash size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEvent ? 'Edit Event' : 'Add Event'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
            <input
              type="text"
              value={formData.event_name}
              onChange={(e) => setFormData(prev => ({ ...prev, event_name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
              placeholder="Enter event name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent resize-none"
              placeholder="Event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.starts_on_date}
                onChange={(e) => setFormData(prev => ({ ...prev, starts_on_date: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.starts_on_time}
                onChange={(e) => setFormData(prev => ({ ...prev, starts_on_time: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.ends_on_date}
                onChange={(e) => setFormData(prev => ({ ...prev, ends_on_date: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={formData.ends_on_time}
                onChange={(e) => setFormData(prev => ({ ...prev, ends_on_time: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.where}
              onChange={(e) => setFormData(prev => ({ ...prev, where: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
              placeholder="Event location"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
              <select
                value={formData.repeat}
                onChange={(e) => setFormData(prev => ({ ...prev, repeat: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, label_color: color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.label_color === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex-1">
              {selectedEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </div>
      </Modal>

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
                style={{ backgroundColor: selectedEvent.label_color || '#3B82F6' }}
              />
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedEvent.event_name || selectedEvent.title}
              </h3>
              {getStatusBadge(selectedEvent.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase font-medium">Start</p>
                <p className="font-medium text-gray-900 mt-1">
                  {formatDate(selectedEvent.starts_on_date)}
                </p>
                {selectedEvent.starts_on_time && (
                  <p className="text-sm text-gray-600">{selectedEvent.starts_on_time}</p>
                )}
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

            {selectedEvent.where && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                <div className="flex items-center gap-2 text-gray-700">
                  <IoLocation size={16} />
                  <span>{selectedEvent.where}</span>
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
              {canEdit && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleEdit(selectedEvent)
                  }}
                  className="flex-1"
                >
                  Edit Event
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default EventsSection


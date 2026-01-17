/**
 * Notification Settings Page
 * Route: /app/admin/settings/notifications
 */

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { notificationSettingsAPI } from '../../../api'
import { toast } from 'react-hot-toast'
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoMail,
  IoGlobe,
  IoLogoSlack,
  IoSearch,
  IoFilter,
  IoChevronDown,
  IoChevronUp,
} from 'react-icons/io5'

const NotificationSettings = () => {
  const { theme } = useTheme()
  const isDark = theme.mode === 'dark'

  // State
  const [notifications, setNotifications] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [selectedCategory, setSelectedCategory] = useState('') // Empty means show all
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState({})

  // Get company_id
  const getCompanyId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.company_id || localStorage.getItem('company_id') || 1
  }

  /**
   * Fetch notification settings
   */
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const companyId = getCompanyId()
      
      const params = {
        company_id: companyId,
      }

      if (selectedCategory && selectedCategory !== '') {
        params.category = selectedCategory
      }

      if (searchTerm) {
        params.search = searchTerm
      }

      const response = await notificationSettingsAPI.getAll(params)

      if (response.data?.success) {
        setNotifications(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notification settings')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, searchTerm])

  /**
   * Fetch categories
   */
  const fetchCategories = useCallback(async () => {
    try {
      const companyId = getCompanyId()
      const response = await notificationSettingsAPI.getCategories({ company_id: companyId })

      if (response.data?.success) {
        setCategories(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
    fetchNotifications()
  }, [fetchCategories, fetchNotifications])

  /**
   * Toggle notification channel (email, web, slack)
   */
  const handleToggle = async (notificationId, field, currentValue) => {
    try {
      setSaving(prev => ({ ...prev, [notificationId]: field }))
      const companyId = getCompanyId()

      const updateData = {
        [field]: !currentValue
      }

      const response = await notificationSettingsAPI.update(
        notificationId,
        updateData,
        { company_id: companyId }
      )

      if (response.data?.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId
              ? { ...n, [field]: !currentValue }
              : n
          )
        )
        toast.success('Notification setting updated')
      } else {
        toast.error(response.data?.error || 'Failed to update setting')
      }
    } catch (error) {
      console.error('Error updating notification:', error)
      toast.error('Failed to update notification setting')
    } finally {
      setSaving(prev => {
        const newState = { ...prev }
        delete newState[notificationId]
        return newState
      })
    }
  }

  /**
   * Toggle category expansion
   */
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  /**
   * Group notifications by category
   */
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const category = notification.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(notification)
    return acc
  }, {})

  // If category is selected, show only that category's notifications in a flat table
  const shouldShowFlatTable = selectedCategory && selectedCategory !== ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: isDark ? '#E5E7EB' : '#1F2937' }}>
          Notification Settings
        </h2>
        <p className="text-sm mt-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
          Configure email, web, and slack notifications for different events
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Dropdown */}
        <div className="relative w-full sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded border outline-none appearance-none"
            style={{
              backgroundColor: isDark ? '#1F2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#E5E7EB',
              color: isDark ? '#E5E7EB' : '#1F2937',
            }}
          >
            <option value="">All Categories</option>
            <option value="Announcement">Announcement</option>
            <option value="Client">Client</option>
            <option value="Contract">Contract</option>
            <option value="Estimate">Estimate</option>
            <option value="Event">Event</option>
            <option value="Invoice">Invoice</option>
            <option value="Message">Message</option>
            <option value="Order">Order</option>
            <option value="Project">Project</option>
            <option value="Proposal">Proposal</option>
            <option value="Reminder">Reminder</option>
            <option value="Task">Task</option>
            <option value="Ticket">Ticket</option>
          </select>
          <IoFilter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text pointer-events-none"
            size={18}
          />
          <IoChevronDown
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text pointer-events-none"
            size={18}
          />
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded border outline-none"
            style={{
              backgroundColor: isDark ? '#1F2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#E5E7EB',
              color: isDark ? '#E5E7EB' : '#1F2937',
            }}
          />
          <IoSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text"
            size={18}
          />
        </div>
      </div>

      {/* Notification Table/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div
          className="text-center py-12 rounded"
          style={{ backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }}
        >
          <p style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            No notifications found
          </p>
        </div>
      ) : shouldShowFlatTable ? (
        // Flat table view when category is selected
        <div
          className="rounded overflow-hidden"
          style={{
            backgroundColor: isDark ? '#1F2937' : '#ffffff',
            border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
          }}
        >
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold border-b"
            style={{
              backgroundColor: isDark ? '#111827' : '#F9FAFB',
              color: isDark ? '#E5E7EB' : '#374151',
              borderColor: isDark ? '#374151' : '#E5E7EB',
            }}
          >
            <div className="col-span-3">Event</div>
            <div className="col-span-2">Notify to</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1 text-center">Enable email</div>
            <div className="col-span-2 text-center">Enable web</div>
            <div className="col-span-2 text-center">Enable slack</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y" style={{ borderColor: isDark ? '#374151' : '#E5E7EB' }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-opacity-50 transition-colors"
                style={{
                  backgroundColor: isDark ? 'transparent' : 'transparent',
                }}
              >
                {/* Event Name */}
                <div className="col-span-1 md:col-span-3">
                  <div className="font-medium text-sm" style={{ color: isDark ? '#E5E7EB' : '#1F2937' }}>
                    {notification.event_name}
                  </div>
                </div>

                {/* Notify to */}
                <div className="col-span-1 md:col-span-2">
                  <div className="flex flex-wrap gap-1">
                    {notification.notify_to && notification.notify_to.length > 0 ? (
                      notification.notify_to.map((recipient, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: isDark ? '#3B82F6' : '#DBEAFE',
                            color: isDark ? '#ffffff' : '#1E40AF',
                          }}
                        >
                          Team members: {recipient}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                        -
                      </span>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-1 md:col-span-2">
                  <span className="text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    {notification.category}
                  </span>
                </div>

                {/* Enable Email */}
                <div className="col-span-1 md:col-span-1 flex justify-center">
                  <button
                    onClick={() => handleToggle(notification.id, 'enable_email', notification.enable_email)}
                    disabled={saving[notification.id] === 'enable_email'}
                    className="disabled:opacity-50"
                  >
                    {notification.enable_email ? (
                      <IoCheckmarkCircle size={24} className="text-green-500" />
                    ) : (
                      <IoCloseCircle size={24} className="text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Enable Web */}
                <div className="col-span-1 md:col-span-2 flex justify-center">
                  <button
                    onClick={() => handleToggle(notification.id, 'enable_web', notification.enable_web)}
                    disabled={saving[notification.id] === 'enable_web'}
                    className="disabled:opacity-50"
                  >
                    {notification.enable_web ? (
                      <IoCheckmarkCircle size={24} className="text-green-500" />
                    ) : (
                      <IoCloseCircle size={24} className="text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Enable Slack */}
                <div className="col-span-1 md:col-span-2 flex justify-center">
                  <button
                    onClick={() => handleToggle(notification.id, 'enable_slack', notification.enable_slack)}
                    disabled={saving[notification.id] === 'enable_slack'}
                    className="disabled:opacity-50"
                  >
                    {notification.enable_slack ? (
                      <IoCheckmarkCircle size={24} className="text-green-500" />
                    ) : (
                      <IoCloseCircle size={24} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Accordion view when showing all categories
        <div className="space-y-4">
          {Object.entries(groupedNotifications).map(([category, categoryNotifications]) => (
            <div
              key={category}
              className="rounded overflow-hidden"
              style={{
                backgroundColor: isDark ? '#1F2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
              }}
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex items-center justify-between hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: isDark ? '#111827' : '#F9FAFB',
                  borderBottom: expandedCategories[category] ? `1px solid ${isDark ? '#374151' : '#E5E7EB'}` : 'none',
                }}
              >
                <span className="font-semibold text-lg" style={{ color: isDark ? '#E5E7EB' : '#1F2937' }}>
                  {category}
                </span>
                {expandedCategories[category] ? (
                  <IoChevronUp size={20} style={{ color: isDark ? '#E5E7EB' : '#1F2937' }} />
                ) : (
                  <IoChevronDown size={20} style={{ color: isDark ? '#E5E7EB' : '#1F2937' }} />
                )}
              </button>

              {/* Category Notifications */}
              {expandedCategories[category] && (
                <div>
                  {/* Table Header - Hidden on mobile */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 text-sm font-medium"
                    style={{
                      backgroundColor: isDark ? '#1F2937' : '#ffffff',
                      color: isDark ? '#9CA3AF' : '#6B7280',
                    }}
                  >
                    <div className="col-span-3">Event</div>
                    <div className="col-span-2">Notify to</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-1 text-center">Enable email</div>
                    <div className="col-span-2 text-center">Enable web</div>
                    <div className="col-span-2 text-center">Enable slack</div>
                  </div>

                  {/* Notifications */}
                  <div className="divide-y" style={{ borderColor: isDark ? '#374151' : '#E5E7EB' }}>
                    {categoryNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center"
                      >
                        {/* Event Name */}
                        <div className="col-span-1 md:col-span-3">
                          <div className="font-medium text-sm" style={{ color: isDark ? '#E5E7EB' : '#1F2937' }}>
                            {notification.event_name}
                          </div>
                        </div>

                        {/* Notify to */}
                        <div className="col-span-1 md:col-span-2">
                          <div className="flex flex-wrap gap-1">
                            {notification.notify_to && notification.notify_to.length > 0 ? (
                              notification.notify_to.map((recipient, index) => (
                                <span
                                  key={index}
                                  className="text-xs px-2 py-1 rounded"
                                  style={{
                                    backgroundColor: isDark ? '#3B82F6' : '#DBEAFE',
                                    color: isDark ? '#ffffff' : '#1E40AF',
                                  }}
                                >
                                  Team members: {recipient}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                                -
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Category */}
                        <div className="col-span-1 md:col-span-2">
                          <span className="text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                            {notification.category}
                          </span>
                        </div>

                        {/* Enable Email */}
                        <div className="col-span-1 md:col-span-1 flex justify-center">
                          <button
                            onClick={() => handleToggle(notification.id, 'enable_email', notification.enable_email)}
                            disabled={saving[notification.id] === 'enable_email'}
                            className="disabled:opacity-50"
                          >
                            {notification.enable_email ? (
                              <IoCheckmarkCircle size={24} className="text-green-500" />
                            ) : (
                              <IoCloseCircle size={24} className="text-gray-400" />
                            )}
                          </button>
                        </div>

                        {/* Enable Web */}
                        <div className="col-span-1 md:col-span-2 flex justify-center">
                          <button
                            onClick={() => handleToggle(notification.id, 'enable_web', notification.enable_web)}
                            disabled={saving[notification.id] === 'enable_web'}
                            className="disabled:opacity-50"
                          >
                            {notification.enable_web ? (
                              <IoCheckmarkCircle size={24} className="text-green-500" />
                            ) : (
                              <IoCloseCircle size={24} className="text-gray-400" />
                            )}
                          </button>
                        </div>

                        {/* Enable Slack */}
                        <div className="col-span-1 md:col-span-2 flex justify-center">
                          <button
                            onClick={() => handleToggle(notification.id, 'enable_slack', notification.enable_slack)}
                            disabled={saving[notification.id] === 'enable_slack'}
                            className="disabled:opacity-50"
                          >
                            {notification.enable_slack ? (
                              <IoCheckmarkCircle size={24} className="text-green-500" />
                            ) : (
                              <IoCloseCircle size={24} className="text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div
        className="p-4 rounded text-sm"
        style={{
          backgroundColor: isDark ? '#1F2937' : '#EFF6FF',
          borderLeft: `4px solid #3B82F6`,
        }}
      >
        <p className="font-medium mb-1" style={{ color: isDark ? '#E5E7EB' : '#1F2937' }}>
          💡 Information
        </p>
        <ul className="list-disc list-inside space-y-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
          <li>Email notifications will be sent to the specified recipients' email addresses</li>
          <li>Web notifications appear in the notification bell in the top navigation bar</li>
          <li>Slack notifications require Slack integration to be configured</li>
          <li>Changes take effect immediately for all users in your company</li>
        </ul>
      </div>
    </div>
  )
}

export default NotificationSettings


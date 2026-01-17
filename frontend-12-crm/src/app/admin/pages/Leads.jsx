import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import FilterPanel from '../../../components/ui/FilterPanel'
import UniqueIdBadge, { ID_PREFIXES } from '../../../components/ui/UniqueIdBadge'
import BulkUpdateModal from '../../../components/ui/BulkUpdateModal'
import NotificationModal from '../../../components/ui/NotificationModal'
import { leadsAPI, employeesAPI, contactsAPI, eventsAPI } from '../../../api'
import RichTextEditor from '../../../components/ui/RichTextEditor'
import { useAuth } from '../../../context/AuthContext'
import {
  IoEye,
  IoCreate,
  IoPencil,
  IoTrashOutline,
  IoMail,
  IoCheckbox,
  IoPersonAdd,
  IoList,
  IoGrid,
  IoClose,
  IoLocation,
  IoCall,
  IoTime,
  IoFilter,
  IoRefresh,
  IoAdd,
  IoBriefcase,
  IoOpenOutline,
  IoSearch,
  IoTimeOutline,
  IoDownload,
  IoPricetag,
  IoPerson,
  IoCalendar,
  IoDocumentText,
  IoArrowForward,
  IoStatsChart,
  IoTrendingUp,
  IoTrendingDown,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoChevronBack,
  IoChevronForward,
  IoLayers,
  IoBusiness,
  IoPeopleOutline,
  IoCalendarOutline,
  IoEllipsisHorizontal,
  IoLogoGoogle,
  IoLocationOutline,
  IoCallOutline,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline
} from 'react-icons/io5'
import BarChart from '../../../components/charts/BarChart'
import DonutChart from '../../../components/charts/DonutChart'


const Leads = () => {
  const { user } = useAuth()
  const companyId = parseInt(user?.company_id || localStorage.getItem('companyId') || 0, 10)
  const companyName = user?.company_name || localStorage.getItem('companyName') || ''
  const userId = user?.id || localStorage.getItem('userId') || 1

  // Debug logging - verify companyId
  useEffect(() => {
    if (companyId && companyId > 0) {
      console.log('Leads Component - CompanyId:', companyId)
      console.log('Leads Component - User company_id:', user?.company_id)
    } else {
      console.warn('Leads Component - Invalid or missing companyId:', companyId)
    }
  }, [companyId, user])

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('leads') // 'overview', 'leads', 'contacts', 'kanban', 'events'
  const [viewMode, setViewMode] = useState('list') // 'list' or 'kanban'

  // Check URL params for tab
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'kanban') {
      setActiveTab('kanban')
      setViewMode('kanban')
    }
  }, [searchParams])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [isManageLabelsModalOpen, setIsManageLabelsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [labels, setLabels] = useState([])
  const [loadingLabels, setLoadingLabels] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#22c55e') // Default green
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [draggedLead, setDraggedLead] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'my', 'thisWeek', 'call'
  const [searchQuery, setSearchQuery] = useState('')
  const [probabilityFilter, setProbabilityFilter] = useState(null) // '50', '90', null
  const [loggedInUser] = useState('Sarah Wilson') // In real app, get from auth context

  // Detail View State
  const [activeDetailTab, setActiveDetailTab] = useState('overview') // 'overview', 'estimates', 'proposals', 'contracts', 'files', 'tasks', 'notes'
  const [estimates, setEstimates] = useState([]) // For the estimates tab


  // New Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterOwner, setFilterOwner] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false)

  // RiceCRM-style Bulk Update Modal & Notification Modal States
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false)
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' })

  // Show notification helper
  const showNotification = (type, title, message) => {
    setNotification({ isOpen: true, type, title, message })
  }

  // Strip HTML utility for Rich Text fields
  const stripHtml = (html) => {
    if (!html) return ''
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  }


  // Fixed Lead Stages with RiceCRM Colors and Icons
  const leadStages = [
    { id: 'New', label: 'New', color: 'bg-sky-100 text-sky-700 border-sky-200', icon: <IoTimeOutline size={14} /> },
    { id: 'Qualified', label: 'Qualified', color: 'bg-blue-600 text-white border-blue-700', icon: <IoCheckmarkCircle size={14} /> },
    { id: 'Discussion', label: 'Discussion', color: 'bg-teal-500 text-white border-teal-600', icon: <IoCall size={14} /> },
    { id: 'Negotiation', label: 'Negotiation', color: 'bg-purple-500 text-white border-purple-600', icon: <IoStatsChart size={14} /> },
    { id: 'Won', label: 'Won', color: 'bg-green-500 text-white border-green-600', icon: <IoTrendingUp size={14} /> },
    { id: 'Lost', label: 'Lost', color: 'bg-red-500 text-white border-red-600', icon: <IoTrendingDown size={14} /> },
  ]

  const [formData, setFormData] = useState({
    leadType: 'Organization',
    companyName: '',
    personName: '',
    phone: '',
    employee: '', // Changed from owner
    status: 'New',
    source: '',
    address: '',
    city: '',
    value: '',
    dueFollowup: '',
    notes: '',
    probability: '',
    callThisWeek: false,
    label: '', // Added label field
  })

  const [convertFormData, setConvertFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    phoneCountryCode: '+1',
    phoneNumber: '',
    website: '',
    vatNumber: '',
    gstNumber: '',
    currency: 'USD',
    currencySymbol: '',
    disableOnlinePayment: false,
  })

  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState([]) // For employee dropdown

  // Constants for conversion modal
  const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'India', 'Germany', 'France']
  const countryCodes = ['+1', '+44', '+91', '+61', '+49', '+33']
  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD']
  const [sources, setSources] = useState([]) // For source dropdown
  const [contacts, setContacts] = useState([]) // For contacts tab
  const [contactsLoading, setContactsLoading] = useState(false)
  const [overviewData, setOverviewData] = useState(null) // For overview tab
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [dateRange, setDateRange] = useState('all') // For overview date filter
  const [events, setEvents] = useState([]) // For events tab
  const [eventsLoading, setEventsLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarView, setCalendarView] = useState('month') // 'month', 'week', 'day', 'list'
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false)
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [contactFormData, setContactFormData] = useState({
    name: '',
    company: companyName || '',
    email: '',
    phone: '',
    contact_type: 'Client',
    assigned_user_id: '',
    status: 'Active',
    notes: '',
    lead_id: null,
  })
  const [eventFormData, setEventFormData] = useState({
    event_name: '',
    description: '',
    where: '',
    starts_on_date: new Date().toISOString().split('T')[0],
    starts_on_time: '09:00',
    ends_on_date: new Date().toISOString().split('T')[0],
    ends_on_time: '10:00',
    label_color: '#FF0000',
    status: 'Pending',
    employee_ids: [],
    client_ids: [],
    department_ids: [],
    host_id: userId || null,
  })

  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads()
    fetchLabels()
    fetchEmployees(companyId) // Auto-fetch employees for logged-in company
    if (activeTab === 'overview') {
      fetchOverview()
    }
    if (activeTab === 'contacts') {
      fetchContacts()
    }
    if (activeTab === 'events') {
      fetchEvents()
    }
  }, [activeFilter, searchQuery, probabilityFilter, activeTab, dateRange, companyId, currentMonth, filterOwner, filterStatus, filterSource, filterDate])

  // Fetch employees for employee dropdown (filtered by company)
  const fetchEmployees = async (companyId) => {
    try {
      const response = await employeesAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setEmployees(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    }
  }


  // Extract unique sources from leads
  const extractUniqueSources = (leadsData) => {
    const sourceSet = new Set()
    // Default sources
    const defaultSources = [
      'Website',
      'Call',
      'Email',
      'Google ads',
      'Facebook',
      'Twitter',
      'Youtube',
      'Google',
      'Elsewhere',
      'Social Media',
      'Referral',
      'Other'
    ]

    // Add default sources
    defaultSources.forEach(source => sourceSet.add(source))

    // Add sources from existing leads
    leadsData.forEach(lead => {
      if (lead.source && lead.source.trim()) {
        sourceSet.add(lead.source.trim())
      }
    })

    return Array.from(sourceSet).sort()
  }

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const params = {
        company_id: companyId // Always pass company_id from session
      }

      if (activeFilter === 'my') {
        const userId = localStorage.getItem('userId')
        if (userId) params.owner_id = userId
      }

      if (searchQuery) {
        // Search will be handled client-side for now
      }

      const response = await leadsAPI.getAll(params)
      if (response.data.success) {
        const fetchedLeads = response.data.data || []
        // Transform API data to match component format
        const transformedLeads = fetchedLeads.map(lead => ({
          id: lead.id,
          leadType: lead.lead_type || 'Organization',
          personName: lead.person_name || '',
          companyName: lead.company_name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          employee: lead.owner_name || 'Unknown',
          employee_id: lead.owner_id,
          employeeId: lead.owner_id,
          employeeAvatar: lead.owner_name ? lead.owner_name.split(' ').map(n => n[0]).join('') : 'U',
          status: lead.status || 'New',
          source: lead.source || '',
          address: lead.address || '',
          city: lead.city || '',
          notes: lead.notes || '',
          value: parseFloat(lead.value || 0),
          dueFollowup: lead.due_followup || '',
          labels: lead.labels || [],
          createdDate: lead.created_at ? lead.created_at.split('T')[0] : '',
          createdBy: lead.created_by_name || '',
          probability: lead.probability || null,
          callThisWeek: lead.call_this_week || false,
          contacts: 1,
        }))

        setLeads(transformedLeads)

        // Extract unique sources from fetched leads
        const uniqueSources = extractUniqueSources(fetchedLeads)
        setSources(uniqueSources)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    if (filteredLeads.length === 0) {
      alert('No data to export')
      return
    }

    // Define CSV header
    const headers = ['Lead ID', 'Type', 'Lead Name', 'Company Name', 'Email', 'Phone', 'Employee', 'Source', 'Status', 'Probability', 'Created Date']

    // Convert data to CSV rows
    const rows = filteredLeads.map(lead => [
      lead.id,
      lead.leadType,
      lead.personName,
      lead.companyName,
      lead.email,
      lead.phone,
      lead.employee,
      lead.source,
      lead.status,
      lead.probability ? `${lead.probability}%` : '-',
      lead.createdDate
    ])

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  // Filter leads based on active filter
  const getFilteredLeads = () => {
    let filtered = [...leads]

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(lead =>
        lead.personName?.toLowerCase().includes(q) ||
        lead.companyName?.toLowerCase().includes(q) ||
        lead.email?.toLowerCase().includes(q) ||
        lead.source?.toLowerCase().includes(q) ||
        lead.city?.toLowerCase().includes(q) ||
        lead.id.toString().includes(q)
      )
    }

    // Apply probability filter (RiceCRM style - strictly equals)
    if (probabilityFilter) {
      filtered = filtered.filter(lead => lead.probability === parseInt(probabilityFilter))
    }

    // Apply Advanced Filters
    if (filterOwner) {
      filtered = filtered.filter(lead => lead.employeeId == filterOwner)
    }
    if (filterStatus) {
      filtered = filtered.filter(lead => lead.status === filterStatus)
    }
    if (filterSource) {
      filtered = filtered.filter(lead => lead.source === filterSource)
    }
    if (filterDate) {
      filtered = filtered.filter(lead => lead.createdDate === filterDate)
    }

    // Apply Main Quick Filter Tabs
    if (activeFilter === 'my') {
      filtered = filtered.filter(lead => lead.employeeId == userId)
    } else if (activeFilter === 'thisWeek') {
      const today = new Date()
      const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
      filtered = filtered.filter(lead => {
        const leadDate = new Date(lead.createdDate)
        return leadDate >= weekStart
      })
    } else if (activeFilter === 'call') {
      filtered = filtered.filter(lead => lead.source?.toLowerCase().includes('call'))
    }

    return filtered
  }

  const filteredLeads = getFilteredLeads()

  const getLeadsByStatus = (status) => {
    return filteredLeads.filter(lead => lead.status === status)
  }

  // Drag and Drop Handlers for Kanban
  const handleDragStart = (e, lead) => {
    setDraggedLead(lead)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
    e.target.style.opacity = '0.5'
    // Prevent page scroll during drag
    document.body.style.overflow = 'hidden'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedLead(null)
    // Restore page scroll
    document.body.style.overflow = 'auto'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault()
    e.stopPropagation()
    // Restore page scroll
    document.body.style.overflow = 'auto'

    if (draggedLead && draggedLead.status !== targetStatus) {
      try {
        await leadsAPI.updateStatus(draggedLead.id, { status: targetStatus }, { company_id: companyId })
        await fetchLeads()
        if (activeTab === 'overview') {
          await fetchOverview()
        }
      } catch (error) {
        console.error('Error updating lead status:', error)
        alert('Failed to update lead status')
      }
    }
  }

  // Fetch overview data
  const fetchOverview = async () => {
    try {
      // Validate companyId before making API call
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchOverview:', companyId)
        setOverviewLoading(false)
        return
      }

      setOverviewLoading(true)
      const params = {
        date_range: dateRange,
        company_id: companyId  // Always pass company_id to filter data
      }

      console.log('Fetching leads overview with params:', params)
      const response = await leadsAPI.getOverview(params)
      if (response.data.success) {
        console.log('Overview data received:', response.data.data)
        setOverviewData(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching overview:', error)
      console.error('Error response:', error.response?.data)
    } finally {
      setOverviewLoading(false)
    }
  }

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setContactsLoading(true)
      const params = { company_id: companyId }
      // If a lead is selected, filter by lead_id
      if (selectedLead?.id) {
        params.lead_id = selectedLead.id
      }
      const response = await contactsAPI.getAll(params)
      if (response.data.success) {
        setContacts(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
      setContacts([])
    } finally {
      setContactsLoading(false)
    }
  }

  // Fetch events
  const fetchEvents = async () => {
    try {
      setEventsLoading(true)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchEvents:', companyId)
        setEvents([])
        setEventsLoading(false)
        return
      }
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth() + 1
      const response = await eventsAPI.getAll({
        company_id: companyId,
        year,
        month
      })
      if (response.data.success) {
        setEvents(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setEventsLoading(false)
    }
  }

  // Event handlers
  const handleAddEvent = async () => {
    if (!eventFormData.event_name) {
      alert('Event name is required')
      return
    }
    if (!eventFormData.where) {
      alert('Location is required')
      return
    }
    if (!eventFormData.starts_on_date) {
      alert('Start date is required')
      return
    }
    if (!eventFormData.starts_on_time) {
      alert('Start time is required')
      return
    }

    try {
      const eventData = {
        event_name: eventFormData.event_name,
        description: eventFormData.description || null,
        where: eventFormData.where,
        starts_on_date: eventFormData.starts_on_date,
        starts_on_time: eventFormData.starts_on_time,
        ends_on_date: eventFormData.ends_on_date || eventFormData.starts_on_date,
        ends_on_time: eventFormData.ends_on_time || eventFormData.starts_on_time,
        label_color: eventFormData.label_color,
        status: eventFormData.status || 'Pending',
        employee_ids: eventFormData.employee_ids || [],
        client_ids: eventFormData.client_ids || [],
        department_ids: eventFormData.department_ids || [],
        host_id: eventFormData.host_id || userId || null
      }

      const response = await eventsAPI.create(eventData, { company_id: companyId, user_id: userId })
      if (response.data.success) {
        alert('Event created successfully!')
        setIsAddEventModalOpen(false)
        setEventFormData({
          event_name: '',
          description: '',
          where: '',
          starts_on_date: new Date().toISOString().split('T')[0],
          starts_on_time: '09:00',
          ends_on_date: new Date().toISOString().split('T')[0],
          ends_on_time: '10:00',
          label_color: '#FF0000',
          status: 'Pending',
          employee_ids: [],
          client_ids: [],
          department_ids: [],
          host_id: userId || null,
        })
        await fetchEvents()
      } else {
        alert(response.data.error || 'Failed to create event')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      alert(error.response?.data?.error || 'Failed to create event')
    }
  }

  // Contact handlers
  const handleAddContact = () => {
    setContactFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      contact_type: 'Client',
      assigned_user_id: '',
      status: 'Active',
      notes: '',
      lead_id: selectedLead?.id || null,
    })
    setIsContactModalOpen(true)
  }

  const handleEditContact = (contact) => {
    setSelectedContact(contact)
    setContactFormData({
      name: contact.name || '',
      company: contact.company || companyName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      contact_type: contact.contact_type || 'Client',
      assigned_user_id: contact.assigned_user_id || '',
      status: contact.status || 'Active',
      notes: contact.notes || '',
      lead_id: contact.lead_id || null,
    })
    setIsEditContactModalOpen(true)
  }

  const handleSaveContact = async () => {
    if (!contactFormData.name) {
      alert('Name is required')
      return
    }

    try {
      const contactData = {
        name: contactFormData.name.trim(),
        company: contactFormData.company?.trim() || null,
        email: contactFormData.email?.trim() || null,
        phone: contactFormData.phone?.trim() || null,
        contact_type: contactFormData.contact_type || 'Client',
        assigned_user_id: contactFormData.assigned_user_id ? parseInt(contactFormData.assigned_user_id) : null,
        status: contactFormData.status || 'Active',
        notes: contactFormData.notes?.trim() || null,
        lead_id: contactFormData.lead_id ? parseInt(contactFormData.lead_id) : null,
        company_id: parseInt(companyId), // Auto-set from session
      }

      if (selectedContact) {
        await contactsAPI.update(selectedContact.id, contactData)
        alert('Contact updated successfully!')
      } else {
        await contactsAPI.create(contactData)
        alert('Contact created successfully!')
      }
      setIsContactModalOpen(false)
      setIsEditContactModalOpen(false)
      setSelectedContact(null)
      fetchContacts()
    } catch (error) {
      console.error('Error saving contact:', error)
      alert(error.response?.data?.error || 'Failed to save contact')
    }
  }

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return
    try {
      await contactsAPI.delete(id)
      fetchContacts()
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Failed to delete contact')
    }
  }

  // Bulk actions handler
  const handleBulkAction = async (action, data) => {
    if (selectedLeads.length === 0) {
      alert('Please select at least one lead')
      return
    }

    try {
      await leadsAPI.bulkAction({
        lead_ids: selectedLeads,
        action,
        data,
      })
      alert(`Bulk action '${action}' completed successfully!`)
      setSelectedLeads([])
      await fetchLeads()
      if (activeTab === 'overview') {
        await fetchOverview()
      }
    } catch (error) {
      console.error('Error performing bulk action:', error)
      alert(error.response?.data?.error || 'Failed to perform bulk action')
    }
  }

  // File upload handlers for Import Leads
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      const validExtensions = ['.csv', '.xls', '.xlsx']
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()

      if (validTypes.includes(file.type) || validExtensions.includes(fileExtension)) {
        setSelectedFile(file)
      } else {
        alert('Please select a valid file (CSV, XLS, or XLSX)')
      }
    }
  }

  const handleDragOverFile = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeaveFile = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDropFile = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      const validExtensions = ['.csv', '.xls', '.xlsx']
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()

      if (validTypes.includes(file.type) || validExtensions.includes(fileExtension)) {
        setSelectedFile(file)
      } else {
        alert('Please select a valid file (CSV, XLS, or XLSX)')
      }
    }
  }

  const handleImportLeads = async () => {
    if (!selectedFile) {
      alert('Please select a file to import')
      return
    }

    try {
      // Parse CSV file
      const text = await selectedFile.text()
      const lines = text.split('\n').filter(line => line.trim())

      if (lines.length < 2) {
        alert('CSV file must have a header row and at least one data row')
        return
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))

      // Parse data rows
      const leads = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''))
        const lead = {}

        headers.forEach((header, index) => {
          const value = values[index] || ''
          // Map common header names
          if (header.includes('company') && !header.includes('person')) lead.company_name = value
          else if (header.includes('name') || header.includes('person')) lead.person_name = value
          else if (header.includes('email')) lead.email = value
          else if (header.includes('phone')) lead.phone = value
          else if (header.includes('status')) lead.status = value
          else if (header.includes('source')) lead.source = value
          else if (header.includes('address')) lead.address = value
          else if (header.includes('city')) lead.city = value
          else if (header.includes('value')) lead.value = value
          else if (header.includes('probability')) lead.probability = value
          else if (header.includes('note')) lead.notes = value
        })

        // Only add if has at least company_name or person_name
        if (lead.company_name || lead.person_name) {
          leads.push(lead)
        }
      }

      if (leads.length === 0) {
        alert('No valid leads found in the file. Make sure CSV has columns like: company_name, person_name, email, phone, etc.')
        return
      }

      // Call API to import leads
      const response = await leadsAPI.importLeads({ leads, company_id: companyId })

      if (response.data.success) {
        alert(`Successfully imported ${response.data.data.imported} leads!${response.data.data.failed > 0 ? ` (${response.data.data.failed} failed)` : ''}`)
        setSelectedFile(null)
        setIsImportModalOpen(false)
        fetchLeads()
      } else {
        alert(response.data.error || 'Failed to import leads')
      }
    } catch (error) {
      console.error('Error importing leads:', error)
      alert(error.response?.data?.error || 'Failed to import leads. Please try again.')
    }
  }

  // Fetch labels from API
  const fetchLabels = async () => {
    try {
      setLoadingLabels(true)
      const response = await leadsAPI.getAllLabels({ company_id: companyId })
      if (response.data.success) {
        // Store labels with their colors as objects
        const labelData = (response.data.data || []).map(item => ({
          name: item.name || item.label,
          color: item.color || '#22c55e'
        }))
        setLabels(labelData)
      }
    } catch (error) {
      console.error('Error fetching labels:', error)
      // Keep default labels if API fails
      if (labels.length === 0) {
        setLabels([
          { name: 'Hot', color: '#ef4444' },
          { name: 'Warm', color: '#f97316' },
          { name: 'Cold', color: '#3b82f6' },
          { name: 'New', color: '#22c55e' },
          { name: 'Follow-up', color: '#a855f7' },
        ])
      }
    } finally {
      setLoadingLabels(false)
    }
  }

  // Label management handlers
  const handleAddLabel = async () => {
    if (!newLabel.trim()) return

    // Get existing label names for comparison
    const existingLabelNames = labels.map(label =>
      typeof label === 'object' ? label.name.toLowerCase() : label.toLowerCase()
    )

    // Check if label already exists
    if (existingLabelNames.includes(newLabel.trim().toLowerCase())) {
      // Update existing label color
      const updatedLabels = labels.map(label => {
        const labelName = typeof label === 'object' ? label.name : label
        if (labelName.toLowerCase() === newLabel.trim().toLowerCase()) {
          return { name: labelName, color: newLabelColor }
        }
        return typeof label === 'object' ? label : { name: label, color: '#22c55e' }
      })
      setLabels(updatedLabels)
      setNewLabel('')
      setNewLabelColor('#22c55e')
      alert('Label updated successfully!')
      return
    }

    try {
      const response = await leadsAPI.createLabel({
        label: newLabel.trim(),
        color: newLabelColor,
        company_id: companyId
      })

      if (response.data.success) {
        setLabels([...labels, { name: newLabel.trim(), color: newLabelColor }])
        setNewLabel('')
        setNewLabelColor('#22c55e')
        alert('Label created successfully!')
      }
    } catch (error) {
      console.error('Error creating label:', error)
      // Still add locally if API fails
      setLabels([...labels, { name: newLabel.trim(), color: newLabelColor }])
      setNewLabel('')
      setNewLabelColor('#22c55e')
    }
  }

  const handleDeleteLabel = async (labelToDelete) => {
    if (!window.confirm(`Are you sure you want to delete the label "${labelToDelete}"? This will remove it from all leads.`)) {
      return
    }

    try {
      const response = await leadsAPI.deleteLabel(labelToDelete, { company_id: companyId })

      if (response.data.success) {
        setLabels(labels.filter(label => {
          const labelName = typeof label === 'object' ? label.name : label
          return labelName !== labelToDelete
        }))
        alert('Label deleted successfully!')
        // Refresh leads to update their labels
        fetchLeads()
      }
    } catch (error) {
      console.error('Error deleting label:', error)
      alert(error.response?.data?.error || 'Failed to delete label')
    }
  }

  const handleSelectLead = (leadId) => {
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId))
    } else {
      setSelectedLeads([...selectedLeads, leadId])
    }
  }

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.id))
    }
  }

  const handleBulkEmail = () => {
    if (selectedLeads.length === 0) {
      alert('Please select at least one lead')
      return
    }
    setIsBulkEmailModalOpen(true)
  }

  const handleConvertToClient = async (lead) => {
    if (!lead) return
    setSelectedLead(lead)

    // Initialize with available data
    const initialData = {
      companyName: lead.companyName || lead.company_name || lead.personName || lead.person_name || '',
      email: lead.email || '',
      password: '',
      address: lead.address || '',
      city: lead.city || '',
      state: lead.state || '',
      zip: lead.zip || '',
      country: lead.country || 'United States',
      phoneCountryCode: '+1',
      phoneNumber: lead.phone || '',
      website: '',
      vatNumber: '',
      gstNumber: '',
      currency: 'USD',
      currencySymbol: '',
      disableOnlinePayment: false,
    }

    // Try to fetch full details
    try {
      if (lead.id) {
        const response = await leadsAPI.getById(lead.id, { company_id: companyId })
        if (response.data.success) {
          const fullLead = response.data.data
          initialData.companyName = fullLead.company_name || fullLead.companyName || fullLead.person_name || initialData.companyName
          initialData.email = fullLead.email || initialData.email
          initialData.address = fullLead.address || initialData.address
          initialData.city = fullLead.city || initialData.city
          initialData.state = fullLead.state || initialData.state
          initialData.zip = fullLead.zip || initialData.zip
          initialData.country = fullLead.country || initialData.country
          initialData.phoneNumber = fullLead.phone || initialData.phoneNumber
        }
      }
    } catch (error) {
      console.error('Error fetching full lead details for conversion:', error)
    }

    setConvertFormData(initialData)
    setIsConvertModalOpen(true)
  }

  const handleSaveConversion = async () => {
    // Trim values
    const companyName = convertFormData.companyName?.trim()
    const email = convertFormData.email?.trim()
    const password = convertFormData.password

    if (!companyName || !email || !password) {
      alert('Company Name, Email and Password are required')
      return
    }

    try {
      // Construct explicit payload matching backend expectation
      const data = {
        companyName: companyName,
        email: email,
        password: password,
        client_name: companyName,
        company_id: parseInt(companyId),
        address: convertFormData.address || null,
        city: convertFormData.city || null,
        state: convertFormData.state || null,
        zip: convertFormData.zip || null,
        country: convertFormData.country || 'United States',
        phoneCountryCode: convertFormData.phoneCountryCode || '+1',
        phoneNumber: convertFormData.phoneNumber || null,
        website: convertFormData.website || null,
        vatNumber: convertFormData.vatNumber || null,
        gstNumber: convertFormData.gstNumber || null,
        currency: convertFormData.currency || 'USD',
        currencySymbol: convertFormData.currencySymbol || '$',
        disableOnlinePayment: convertFormData.disableOnlinePayment ? 1 : 0
      }

      console.log('Converting lead with data:', { ...data, password: '***' })

      const response = await leadsAPI.convertToClient(selectedLead.id, data, { company_id: companyId })
      if (response.data.success) {
        alert('Lead converted to client successfully!')
        setIsConvertModalOpen(false)
        fetchLeads()
      }
    } catch (error) {
      console.error('Error converting lead:', error)
      const errorData = error.response?.data
      console.error('Error response:', errorData)

      if (errorData?.details && errorData.details.includes('Duplicate entry') && errorData.details.includes('email')) {
        alert('This email address is already registered. Please use a different email.')
      } else {
        alert(errorData?.error || 'Failed to convert lead to client')
      }
    }
  }

  const handleCreateTask = (lead) => {
    setSelectedLead(lead)
    setIsTaskModalOpen(true)
  }

  const handleSendEmail = (lead) => {
    setSelectedLead(lead)
    setIsEmailModalOpen(true)
  }

  const handleAdd = () => {
    setFormData({
      leadType: 'Organization',
      companyName: '',
      personName: '',
      email: '',
      phone: '',
      employee: '',
      status: 'New',
      source: '',
      address: '',
      city: '',
      value: '',
      dueFollowup: '',
      notes: '',
      probability: '',
      callThisWeek: false,
    })
    setIsAddModalOpen(true)
  }

  const columns = [
    {
      key: 'checkbox',
      label: '',
      render: (value, row) => (
        <input
          type="checkbox"
          checked={selectedLeads.includes(row.id)}
          onChange={() => handleSelectLead(row.id)}
          className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent"
        />
      ),
    },
    {
      key: 'id',
      label: 'Lead ID',
      render: (value, row) => (
        <UniqueIdBadge prefix={ID_PREFIXES.LEAD} id={row.id} size="sm" />
      ),
    },
    {
      key: 'personName',
      label: 'Lead Name',
      render: (value, row) => (
        <span className="font-medium text-primary-text">{value || row.companyName || '-'}</span>
      ),
    },
    {
      key: 'leadType',
      label: 'Type',
      render: (value) => {
        const isOrg = value?.toLowerCase() === 'organization'
        return (
          <Badge
            variant="default"
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border shadow-sm flex items-center gap-1.5 w-fit ${isOrg
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
          >
            {isOrg ? <IoBusiness size={12} /> : <IoPerson size={12} />}
            {value}
          </Badge>
        )
      },
    },
    {
      key: 'employee',
      label: 'Employee',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary-accent/20 flex items-center justify-center text-xs font-semibold text-primary-accent">
            {row.employeeAvatar || (value ? value.charAt(0) : 'U')}
          </div>
          <span className="text-sm">{value || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      render: (value) => (
        <Badge variant="default" className="text-xs">{value}</Badge>
      ),
    },
    {
      key: 'city',
      label: 'City',
      render: (value) => value || <span className="text-secondary-text">-</span>,
    },
    {
      key: 'labels',
      label: 'Label',
      render: (value, row) => {
        const labelNames = Array.isArray(value) ? [...value] : (value ? [value] : [])

        // Add Call this week badge
        if (row.callThisWeek) {
          labelNames.push('Call this week')
        }

        if (labelNames.length === 0) {
          return <span className="text-secondary-text">-</span>
        }

        return (
          <div className="flex flex-wrap gap-1">
            {labelNames.map((labelName, idx) => {
              // Special case for Call this week
              if (labelName === 'Call this week') {
                return (
                  <span
                    key={`call-${idx}`}
                    className="px-2 py-0.5 rounded text-white text-xs font-medium whitespace-nowrap bg-purple-500 shadow-sm"
                  >
                    {labelName}
                  </span>
                )
              }

              // Find the label color from the labels state
              const labelObj = labels.find(l => {
                const name = typeof l === 'object' ? l.name : l
                return name && name.toLowerCase() === (labelName || '').toLowerCase()
              })
              const labelColor = typeof labelObj === 'object' ? labelObj.color : '#22c55e'
              return (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-white text-xs font-medium whitespace-nowrap"
                  style={{ backgroundColor: labelColor }}
                >
                  {labelName}
                </span>
              )
            })}
          </div>
        )
      },
    },
    {
      key: 'probability',
      label: 'Probability',
      render: (value, row) => {
        if (!value) {
          return <span className="text-secondary-text">-</span>
        }
        const prob = parseInt(value)
        const probColor = prob >= 90 ? '#22c55e' : (prob >= 50 ? '#eab308' : '#3b82f6')
        return (
          <span
            className="px-2 py-0.5 rounded text-white text-xs font-medium whitespace-nowrap"
            style={{ backgroundColor: probColor }}
          >
            {prob}% Probability
          </span>
        )
      },
    },
    {
      key: 'createdDate',
      label: 'Created Date',
      render: (value) => {
        const date = new Date(value)
        return date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        // Case-insensitive find to be safe
        const stage = leadStages.find(s => s.id.toLowerCase() === (value || '').toLowerCase())
        return (
          <Badge
            variant="none"
            className={`text-xs font-bold px-3 py-1 rounded-md shadow-sm border flex items-center gap-1.5 w-fit ${stage?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}
          >
            {stage?.icon}
            {value}
          </Badge>
        )
      },
    },
  ]



  const handleEdit = async (lead) => {
    if (!lead) {
      console.error('handleEdit: lead is null or undefined')
      return
    }
    setSelectedLead(lead)
    // Fetch full lead data to get company_id
    try {
      const response = await leadsAPI.getById(lead.id, { company_id: companyId })
      if (response.data.success) {
        const fullLead = response.data.data
        setFormData({
          leadType: fullLead.lead_type || lead.leadType || 'Organization',
          companyName: fullLead.company_name || lead.companyName || '',
          personName: fullLead.person_name || lead.personName || '',
          email: fullLead.email || lead.email || '',
          phone: fullLead.phone || lead.phone || '',
          employee: fullLead.owner_id || lead.owner_id || lead.ownerId || '',
          status: fullLead.status || lead.status || 'New',
          source: fullLead.source || lead.source || '',
          address: fullLead.address || lead.address || '',
          city: fullLead.city || lead.city || '',
          value: fullLead.value?.toString() || lead.value?.toString() || '',
          dueFollowup: fullLead.due_followup || lead.dueFollowup || '',
          notes: fullLead.notes || '',
          probability: fullLead.probability?.toString() || lead.probability?.toString() || '',
          callThisWeek: fullLead.call_this_week || lead.callThisWeek || false,
          label: (fullLead.labels && fullLead.labels[0]) || (lead.labels && lead.labels[0]) || '',
        })
      }
    } catch (error) {
      console.error('Error fetching lead details:', error)
      // Fallback to existing lead data
      setFormData({
        leadType: lead.leadType || lead.lead_type || 'Organization',
        companyName: lead.companyName || lead.company_name || '',
        personName: lead.personName || lead.person_name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        employee: lead.owner_id || lead.ownerId || lead.owner || '',
        status: lead.status || 'New',
        source: lead.source || '',
        address: lead.address || '',
        city: lead.city || '',
        value: lead.value?.toString() || '',
        dueFollowup: lead.dueFollowup || '',
        notes: '',
        probability: lead.probability?.toString() || '',
        callThisWeek: lead.callThisWeek || false,
        label: (lead.labels && lead.labels[0]) || '',
      })
    }
    setIsEditModalOpen(true)
  }

  const handleView = (lead) => {
    if (!lead) {
      console.error('handleView: lead is null or undefined')
      return
    }
    navigate(`/app/admin/leads/${lead.id}`)
  }

  const handleDelete = async (lead) => {
    if (!lead) {
      console.error('handleDelete: lead is null or undefined')
      return
    }
    if (window.confirm(`Are you sure you want to delete ${lead.personName || lead.companyName || 'this lead'}?`)) {
      try {
        await leadsAPI.delete(lead.id, { company_id: companyId })
        setLeads(leads.filter((l) => l.id !== lead.id))
        alert('Lead deleted successfully!')
      } catch (error) {
        console.error('Error deleting lead:', error)
        alert(error.response?.data?.error || 'Failed to delete lead')
      }
    }
  }

  const handleSave = async () => {
    // Removed required validations - allow empty data

    try {
      const leadData = {
        lead_type: formData.leadType,
        company_name: formData.leadType === 'Organization' ? (formData.companyName || companyName || null) : null,
        person_name: formData.leadType === 'Person' ? formData.personName.trim() : (formData.personName || null),
        phone: formData.phone.trim(),
        owner_id: formData.employee, // Changed from owner to employee
        status: formData.status,
        source: formData.source || null,
        address: formData.address || null,
        city: formData.city || null,
        value: formData.value ? parseFloat(formData.value) : null,
        due_followup: formData.dueFollowup || null,
        notes: formData.notes || null,
        probability: formData.probability ? parseInt(formData.probability) : null,
        company_id: parseInt(companyId), // Auto-set from session
        user_id: parseInt(userId), // Auto-set from session for created_by
        created_by: parseInt(userId), // Auto-set from session
        call_this_week: formData.callThisWeek || false,
        labels: formData.label ? [formData.label] : [],
      }

      if (isEditModalOpen && selectedLead) {
        try {
          const response = await leadsAPI.update(selectedLead.id, leadData, { company_id: companyId })
          if (response.data && response.data.success) {
            alert('Lead updated successfully!')
            await fetchLeads()
            setIsEditModalOpen(false)
            setSelectedLead(null)
          } else {
            alert(response.data?.error || 'Failed to update lead')
          }
        } catch (error) {
          console.error('Error updating lead:', error)
          console.error('Error response:', error.response)
          alert(error.response?.data?.error || error.message || 'Failed to update lead. Please try again.')
        }
      } else {
        const response = await leadsAPI.create(leadData)
        if (response.data.success) {
          alert('Lead created successfully!')
          await fetchLeads()
          setIsAddModalOpen(false)
        } else {
          alert(response.data.error || 'Failed to create lead')
        }
      }

      // Reset form
      setFormData({
        leadType: 'Organization',
        companyName: '',
        personName: '',
        phone: '',
        employee: '',
        status: 'New',
        source: '',
        address: '',
        city: '',
        value: '',
        dueFollowup: '',
        notes: '',
        probability: '',
        callThisWeek: false,
        label: '',
      })
    } catch (error) {
      console.error('Error saving lead:', error)
      alert(error.response?.data?.error || 'Failed to save lead')
    }
  }

  const actions = (row) => {
    if (!row) return null

    return (
      <div className="action-btn-container">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleView(row)
          }}
          className="action-btn action-btn-view"
          title="View"
          type="button"
        >
          <IoEye size={18} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleEdit(row)
          }}
          className="action-btn action-btn-edit"
          title="Edit"
          type="button"
        >
          <IoPencil size={18} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleConvertToClient(row)
          }}
          className="action-btn action-btn-convert"
          title="Convert to Client"
          type="button"
        >
          <IoPersonAdd size={18} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleDelete(row)
          }}
          className="action-btn action-btn-delete"
          title="Delete"
          type="button"
        >
          <IoTrashOutline size={18} />
        </button>
      </div>
    )
  }

  return (
    isViewModalOpen && selectedLead ? (
      <div className="h-full flex flex-col font-sans text-primary-text bg-white rounded-lg shadow-sm p-6 w-full animate-in fade-in duration-200">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="mr-2 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              title="Back to Leads"
            >
              <IoChevronBack size={22} />
            </button>
            <div className="w-10 h-10 rounded bg-primary-accent text-white flex items-center justify-center text-lg font-bold shadow-sm">
              <IoBusiness />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{selectedLead.personName || selectedLead.companyName || 'Lead Details'}</h2>
              <p className="text-sm text-gray-500">{selectedLead.companyName || 'No Company'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleConvertToClient(selectedLead)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-accent text-white rounded hover:bg-primary-accent/90 transition-colors shadow-sm font-medium"
            >
              <IoPersonAdd size={16} /> Convert to client
            </button>
            <button
              onClick={() => { setIsViewModalOpen(false); handleEdit(selectedLead); }}
              className="p-2 border border-blue-100 text-blue-600 rounded hover:bg-blue-50 transition-colors" title="Edit"
            >
              <IoCreate size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 mb-8 text-sm font-medium text-gray-500">
          <button className="px-4 py-3 border-b-2 border-primary-accent text-primary-accent hover:text-primary-accent transition-colors">Overview</button>
          <button className="px-4 py-3 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 transition-colors">Estimates</button>
          <button className="px-4 py-3 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 transition-colors">Proposals</button>
          <button className="px-4 py-3 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 transition-colors">Contracts</button>
          <button className="px-4 py-3 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 transition-colors">Files</button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-8">

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-lg border border-gray-100 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-gray-700">0</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1 font-medium">Estimates</div>
              </div>
              <div className="bg-white p-5 rounded-lg border border-gray-100 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-gray-700">0</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1 font-medium">Estimate Requests</div>
              </div>
              <div className="bg-white p-5 rounded-lg border border-gray-100 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-gray-700">0</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1 font-medium">Proposals</div>
              </div>
            </div>

            {/* Contacts Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <IoPeopleOutline size={20} /> Contacts
                </h3>
                <button className="text-primary-accent text-sm hover:underline flex items-center gap-1 font-medium">
                  <IoAdd /> Add contact
                </button>
              </div>
              {/* Placeholder Contact */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                    {(selectedLead.personName?.[0] || 'U').toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-base">{selectedLead.personName || 'Unknown Name'}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                      {selectedLead.email || 'No Email'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    <IoCall size={14} /> {selectedLead.phone || 'No Phone'}
                  </div>
                </div>
              </div>
            </div>

            {/* Events Section (Calendar) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <IoCalendarOutline size={20} /> Events
                </h3>
                <button className="text-primary-accent text-sm hover:underline flex items-center gap-1 font-medium">
                  <IoAdd /> Add event
                </button>
              </div>
              {/* Simple Calendar View */}
              <div className="border border-gray-200 rounded-lg bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"><IoChevronBack size={18} /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"><IoChevronForward size={18} /></button>
                  </div>
                  <div className="font-bold text-gray-800 text-lg">January 2026</div>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button className="text-xs px-3 py-1.5 bg-white rounded shadow-sm text-gray-800 font-medium">Month</button>
                    <button className="text-xs px-3 py-1.5 text-gray-500 font-medium hover:text-gray-800">Week</button>
                    <button className="text-xs px-3 py-1.5 text-gray-500 font-medium hover:text-gray-800">Day</button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase py-3 text-center tracking-wide">{d}</div>
                  ))}
                  {/* Mock Calendar Grid */}
                  {Array.from({ length: 31 }).map((_, i) => (
                    <div key={i} className={`h-24 bg-white p-2 hover:bg-gray-50 transition-colors relative group border-t border-gray-100 ${i === 7 ? 'bg-yellow-50/50' : ''}`}>
                      <span className={`text-sm font-medium ${i === 7 ? 'text-primary-accent' : 'text-gray-700'}`}>{i + 1}</span>
                      {i === 7 && (
                        <div className="mt-1 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded truncate">
                          Follow up
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar Info */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                  <IoList size={20} /> Lead info
                </h3>
                <button className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><IoEllipsisHorizontal size={20} /></button>
              </div>

              <div className="space-y-6">
                {/* Organization */}
                {selectedLead.companyName && (
                  <div className="flex items-start gap-3">
                    <IoBusinessOutline className="mt-1 text-gray-400" size={18} />
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Organization</p>
                      <p className="text-base font-semibold text-gray-800">{selectedLead.companyName}</p>
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
                  <span className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-full border ${selectedLead.status === 'Won' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                    {selectedLead.status || 'New'}
                  </span>
                  <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-50 text-gray-600 border border-gray-200 flex items-center gap-1.5">
                    <IoLogoGoogle size={14} /> Google
                  </span>
                  {selectedLead.probability && (
                    <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                      {selectedLead.probability}% Probability
                    </span>
                  )}
                </div>

                {/* Owner */}
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Owner</p>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold ring-2 ring-white">
                      {(selectedLead.employee?.[0] || 'U')}
                    </div>
                    <p className="text-sm font-medium text-primary-accent hover:underline cursor-pointer">{selectedLead.employee || 'Unassigned'}</p>
                  </div>
                </div>

                {/* Add Managers */}
                <div>
                  <button className="text-sm text-gray-500 hover:text-primary-accent flex items-center gap-2 transition-colors">
                    <div className="w-6 h-6 rounded-full border border-dashed border-gray-400 flex items-center justify-center">
                      <IoAdd size={14} />
                    </div>
                    Add Managers
                  </button>
                </div>

                {/* Address */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <IoLocationOutline className="text-gray-400 mt-1 shrink-0" size={18} />
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedLead.address || '84697 Lurline Track'}<br />
                      {selectedLead.city || 'Lake Benton'}, Massachusetts,<br />
                      Iceland
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <IoCallOutline className="text-gray-400 shrink-0" size={18} />
                    <p className="text-sm text-gray-600 font-medium">{selectedLead.phone || '(205) 360-2071'}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Additional Sections Placeholder */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm transition-all hover:border-gray-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <IoCheckmarkCircleOutline className="text-gray-400" size={20} /> Tasks
                </h3>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">0</span>
              </div>
              <button className="text-sm text-primary-accent hover:underline flex items-center gap-1 font-medium">
                <IoAdd /> Add task
              </button>
            </div>

            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm transition-all hover:border-gray-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <IoDocumentTextOutline className="text-gray-400" size={20} /> Notes
                </h3>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">0</span>
              </div>
              <button className="text-sm text-primary-accent hover:underline flex items-center gap-1 font-medium">
                <IoAdd /> Add note
              </button>
            </div>

            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm transition-all hover:border-gray-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <IoTimeOutline className="text-gray-400" size={20} /> Reminders (Private)
                </h3>
              </div>
              <button className="text-sm text-primary-accent hover:underline flex items-center gap-1 font-medium">
                <IoAdd /> Add reminder
              </button>
            </div>

          </div>
        </div>
      </div>
    ) : (
      <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full">
        {/* Header with Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-5 w-full">
          <div className="flex flex-col gap-3 sm:gap-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-4 overflow-x-hidden">
                <div className="flex items-center gap-1 border-b-2 border-gray-200">
                  <button
                    onClick={() => {
                      setActiveTab('leads')
                      setViewMode('list')
                    }}
                    className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === 'leads' && viewMode !== 'kanban'
                      ? 'text-primary-accent border-b-2 border-primary-accent -mb-[2px]'
                      : 'text-secondary-text hover:text-primary-text'
                      }`}
                  >
                    Leads
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('kanban')
                      setViewMode('kanban')
                    }}
                    className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === 'kanban'
                      ? 'text-primary-accent border-b-2 border-primary-accent -mb-[2px]'
                      : 'text-secondary-text hover:text-primary-text'
                      }`}
                  >
                    Kanban
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                {/* Bulk Update Button - Shows when leads selected */}
                {selectedLeads.length > 0 && (
                  <Button
                    variant="primary"
                    onClick={() => setIsBulkUpdateModalOpen(true)}
                    className="flex items-center gap-2 text-xs sm:text-sm px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <IoLayers size={16} />
                    <span className="hidden sm:inline">Bulk Update</span>
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-white text-blue-600 rounded-full">
                      {selectedLeads.length}
                    </span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsManageLabelsModalOpen(true)}
                  className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap hover:bg-primary-blue hover:text-white"
                >
                  <IoPricetag size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:hidden">Labels</span>
                  <span className="hidden sm:inline">Manage labels</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap hover:bg-primary-blue hover:text-white"
                >
                  <IoDownload size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:hidden">Import</span>
                  <span className="hidden sm:inline">Import leads</span>
                </Button>
                <AddButton
                  onClick={handleAdd}
                  label="Add lead"
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
                />
              </div>
            </div>
          </div>

          {/* Expanded Toolbar & Filter Section */}
          <div className="flex flex-col gap-4 mb-6 bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative z-30 overflow-visible">
            {/* Top Row: Toolbar Buttons & Search */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Left Side */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* View Mode Toggle */}
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
                  className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
                  title={viewMode === 'list' ? "Switch to Kanban" : "Switch to List"}
                >
                  {viewMode === 'list' ? <IoList size={18} /> : <IoGrid size={18} />}
                </button>

                {/* Filter Switcher (RiceCRM Style) */}
                <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden shadow-sm h-9">
                  <button
                    className={`px-3 py-1 flex items-center gap-2 text-sm font-bold transition-colors ${probabilityFilter ? 'text-primary-accent bg-blue-50' : 'text-gray-700'}`}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <IoFilter size={16} /> {probabilityFilter ? `${probabilityFilter}%` : '50%'}
                  </button>
                  <div className="w-[1px] h-4 bg-gray-300"></div>
                  <button
                    className="px-2 py-2 hover:bg-gray-50 text-gray-500"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <IoChevronForward size={14} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-90' : 'rotate-0'}`} />
                  </button>
                </div>

                {/* Clear Button (X) */}
                <button
                  onClick={() => {
                    setProbabilityFilter(null)
                    setActiveFilter('all')
                    setFilterOwner('')
                    setFilterStatus('')
                    setSearchQuery('')
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                  title="Clear All"
                >
                  <IoClose size={20} />
                </button>

                {/* Probability Pills */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setProbabilityFilter(probabilityFilter === '50' ? null : '50')}
                    className={`px-4 py-1 text-xs font-bold rounded-full border-2 transition-all shadow-sm ${probabilityFilter === '50'
                      ? 'bg-yellow-100 text-yellow-700 border-yellow-400'
                      : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                  >
                    50%
                  </button>
                  <button
                    onClick={() => setProbabilityFilter(probabilityFilter === '90' ? null : '90')}
                    className={`px-4 py-1 text-xs font-bold rounded-full border-2 transition-all shadow-sm ${probabilityFilter === '90'
                      ? 'bg-green-100 text-green-700 border-green-400'
                      : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                  >
                    90%
                  </button>
                </div>

                {/* Quick Action Icons */}
                <div className="flex items-center gap-1.5 ml-1">
                  <button
                    onClick={() => setActiveFilter(activeFilter === 'call' ? 'all' : 'call')}
                    className={`w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all shadow-sm ${activeFilter === 'call'
                      ? 'bg-blue-100 text-blue-600 border-blue-400'
                      : 'bg-white border-gray-200 text-gray-400 hover:text-blue-500'
                      }`}
                    title="Calls Only"
                  >
                    <IoCall size={16} />
                  </button>
                  <button
                    onClick={() => setActiveFilter(activeFilter === 'my' ? 'all' : 'my')}
                    className={`w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all shadow-sm ${activeFilter === 'my'
                      ? 'bg-gray-100 text-gray-800 border-gray-500'
                      : 'bg-white border-gray-200 text-gray-400 hover:text-gray-800'
                      }`}
                    title="My Leads"
                  >
                    <IoPerson size={16} />
                  </button>
                </div>
              </div>

              {/* Right Side - Actions & Search */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* RiceCRM Style Target Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsTargetDropdownOpen(!isTargetDropdownOpen)}
                    className={`p-2 bg-white border rounded flex items-center justify-center transition-all shadow-sm hover:shadow-md ${isTargetDropdownOpen ? 'border-primary-accent text-primary-accent ring-2 ring-primary-accent/10' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}
                    title="Select Options"
                  >
                    <IoStatsChart size={18} />
                  </button>

                  {/* Dropdown Menu (Improved UI) */}
                  {isTargetDropdownOpen && (
                    <>
                      {/* Backdrop for closing */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsTargetDropdownOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-20 animate-in fade-in zoom-in-95 duration-200">
                        {/* Little Arrow */}
                        <div className="absolute -top-1 right-4 w-2 h-2 bg-white border-t border-l border-gray-200 rotate-45" />

                        <div className="py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                          <button
                            onClick={() => {
                              setSelectedLeads(leads.map(l => l.id))
                              setIsTargetDropdownOpen(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            Select all leads
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLeads([])
                              setIsTargetDropdownOpen(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100 transition-colors"
                          >
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                            Clear selection
                          </button>

                          <div className="px-4 py-2 bg-gray-50 border-y border-gray-100 mt-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selection Info</p>
                          </div>

                          <div className="px-4 py-3">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Selected:</span>
                              <span className="font-bold text-primary-accent">{selectedLeads.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleExportExcel}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors active:scale-95"
                >
                  <IoDocumentText size={16} className="text-green-600" /> Excel
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors active:scale-95"
                >
                  Print
                </button>

                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-3 pr-9 py-1.5 border border-gray-300 rounded text-sm w-48 transition-all focus:w-64 focus:ring-1 focus:ring-primary-accent focus:outline-none"
                  />
                  <IoSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-accent" size={16} />
                </div>
              </div>
            </div>

            {/* Expanded Filter Row (Conditional) */}
            {isFilterOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Owner Filter */}
                <div className="relative">
                  <select
                    value={filterOwner}
                    onChange={e => setFilterOwner(e.target.value)}
                    className={`w-full appearance-none px-3 py-2 bg-white border rounded text-sm focus:ring-1 focus:ring-primary-accent focus:outline-none ${filterOwner ? 'border-primary-accent text-primary-text font-medium' : 'border-gray-300 text-secondary-text'}`}
                  >
                    <option value="">Select User</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name || e.employee_name}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500">
                    <IoChevronForward size={12} className="rotate-90" />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className={`w-full appearance-none px-3 py-2 bg-white border rounded text-sm focus:ring-1 focus:ring-primary-accent focus:outline-none ${filterStatus ? 'border-primary-accent text-primary-text font-medium' : 'border-gray-300 text-secondary-text'}`}
                  >
                    <option value="">- Status -</option>
                    {leadStages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500">
                    <IoChevronForward size={12} className="rotate-90" />
                  </div>
                </div>

                {/* Source Filter */}
                <div className="relative">
                  <select
                    value={filterSource}
                    onChange={e => setFilterSource(e.target.value)}
                    className={`w-full appearance-none px-3 py-2 bg-white border rounded text-sm focus:ring-1 focus:ring-primary-accent focus:outline-none ${filterSource ? 'border-primary-accent text-primary-text font-medium' : 'border-gray-300 text-secondary-text'}`}
                  >
                    <option value="">- Source -</option>
                    {sources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500">
                    <IoChevronForward size={12} className="rotate-90" />
                  </div>
                </div>

                {/* Date Filter */}
                <div className="relative">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    className={`w-full px-3 py-2 border rounded text-sm pl-9 bg-white focus:ring-1 focus:ring-primary-accent focus:outline-none ${filterDate ? 'border-primary-accent text-primary-text' : 'border-gray-300 text-secondary-text'}`}
                    placeholder="Created date"
                  />
                  <IoCalendar className={`absolute left-3 top-1/2 -translate-y-1/2 ${filterDate ? 'text-primary-accent' : 'text-gray-400'}`} size={16} />
                </div>

                {/* Clear All Filters Button */}
                {(filterOwner || filterStatus || filterSource || filterDate || probabilityFilter || activeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setFilterOwner('')
                      setFilterStatus('')
                      setFilterSource('')
                      setFilterDate('')
                      setProbabilityFilter(null)
                      setActiveFilter('all')
                      setSearchQuery('')
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200"
                  >
                    <IoRefresh size={16} />
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>


        {/* Kanban View */}
        {
          (activeTab === 'kanban' || viewMode === 'kanban') && (
            <div
              className="w-full pb-4"
              onDragOver={(e) => {
                // Prevent page scroll during drag
                e.preventDefault()
              }}
            >
              {/* Horizontal scroll container for Kanban columns */}
              <div
                className="flex gap-3 md:gap-4 overflow-x-auto overflow-y-hidden pb-2 -mx-3 sm:mx-0 px-3 sm:px-0"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e0 transparent',
                  WebkitOverflowScrolling: 'touch'
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                }}
              >
                {leadStages.map((stage) => {
                  const columnLeads = getLeadsByStatus(stage.id)
                  // Get stage color for underline
                  const stageColors = {
                    'New': 'border-yellow-400',
                    'Qualified': 'border-blue-400',
                    'Discussion': 'border-green-400',
                    'Negotiation': 'border-purple-400',
                    'Won': 'border-green-500',
                    'Lost': 'border-red-400',
                  }
                  return (
                    <div
                      key={stage.id}
                      className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] lg:w-[340px]"
                    >
                      <div
                        className="bg-white rounded-lg shadow-sm h-full flex flex-col"
                        style={{ minHeight: 'calc(100vh - 350px)', maxHeight: 'calc(100vh - 200px)' }}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.id)}
                      >
                        {/* Column Header */}
                        <div className="p-3 border-b-2 border-gray-200 flex-shrink-0">
                          <div className={`border-b-2 ${stageColors[stage.id] || 'border-gray-300'} pb-2`}>
                            <h3 className="font-semibold text-sm sm:text-base text-primary-text">{stage.label}</h3>
                            <span className="text-xs text-secondary-text mt-1 block">{columnLeads.length} lead{columnLeads.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        {/* Cards Container */}
                        <div
                          className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-3 space-y-2"
                          style={{
                            maxHeight: 'calc(100vh - 450px)',
                            minHeight: '300px'
                          }}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                        >
                          {columnLeads.map((lead) => (
                            <div
                              key={lead.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, lead)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-move p-3 select-none"
                              onClick={() => handleView(lead)}
                            >
                              {/* Lead Name and Actions */}
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-sm text-primary-text flex-1 pr-2">{lead.personName}</h4>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <IoPersonAdd
                                    className="text-gray-400 hover:text-purple-600 cursor-pointer"
                                    size={16}
                                    title="Convert to Client"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      handleConvertToClient(lead)
                                    }}
                                  />
                                  <IoDocumentText className="text-gray-400 hover:text-primary-accent cursor-pointer" size={16} />
                                  <IoOpenOutline className="text-gray-400 hover:text-primary-accent cursor-pointer" size={16} />
                                </div>
                              </div>

                              {/* Source Badge */}
                              <div className="flex items-center gap-1.5 mb-2">
                                <IoLocation size={14} className="text-gray-400" />
                                <span className="text-xs text-secondary-text">{lead.source || 'Elsewhere'}</span>
                              </div>

                              {/* Contacts and Avatar */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1">
                                  <IoPerson size={14} className="text-gray-400" />
                                  <span className="text-xs text-secondary-text">{lead.contacts || 1}</span>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-primary-accent/20 flex items-center justify-center text-xs font-semibold text-primary-accent">
                                  {lead.employeeAvatar || 'U'}
                                </div>
                              </div>

                              {/* Probability Badges */}
                              {(lead.probability === 50 || lead.probability === 90 || lead.callThisWeek) && (
                                <div className="flex items-center gap-1.5 flex-wrap mt-2 pt-2 border-t border-gray-100">
                                  {lead.probability === 50 && (
                                    <Badge className="text-xs bg-yellow-100 text-yellow-800 border-0">50%</Badge>
                                  )}
                                  {lead.probability === 90 && (
                                    <Badge className="text-xs bg-green-100 text-green-800 border-0">90%</Badge>
                                  )}
                                  {lead.callThisWeek && (
                                    <Badge className="text-xs bg-purple-100 text-purple-800 border-0">Call this week</Badge>
                                  )}
                                </div>
                              )}

                              {/* Labels with Colors */}
                              {lead.labels && lead.labels.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap mt-2">
                                  {lead.labels.map((labelName, idx) => {
                                    const labelObj = labels.find(l =>
                                      (typeof l === 'object' ? l.name : l) === labelName
                                    )
                                    const labelColor = typeof labelObj === 'object' ? labelObj.color : '#22c55e'
                                    return (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded text-white text-xs font-medium"
                                        style={{ backgroundColor: labelColor }}
                                      >
                                        {labelName}
                                      </span>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                          {columnLeads.length === 0 && (
                            <div className="text-center py-8 text-secondary-text text-xs border-2 border-dashed border-gray-200 rounded-lg">
                              No leads in this stage
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }

        {/* Overview Tab */}
        {
          activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Date Range Filter */}
              <Card className="p-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-sm font-medium text-primary-text">Date Range:</span>
                  {['all', 'today', 'this_week', 'this_month', 'custom'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${dateRange === range
                        ? 'bg-primary-accent text-white'
                        : 'bg-white text-primary-text border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {range === 'all' ? 'All Time' : range === 'today' ? 'Today' : range === 'this_week' ? 'This Week' : range === 'this_month' ? 'This Month' : 'Custom'}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Stats Cards */}
              {overviewLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-4 sm:p-6">
                      <div className="h-16 bg-gray-200 rounded animate-pulse" />
                    </Card>
                  ))}
                </div>
              ) : overviewData ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <Card
                    className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      setActiveTab('leads')
                      setActiveFilter('all')
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-medium text-secondary-text">Total Leads</h3>
                      <IoStatsChart className="text-primary-accent" size={20} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-primary-text">{overviewData.totals.total_leads}</p>
                  </Card>
                  <Card
                    className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      setActiveTab('leads')
                      setActiveFilter('all')
                      // Filter by New status
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-medium text-secondary-text">New Leads</h3>
                      <IoTrendingUp className="text-blue-500" size={20} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{overviewData.totals.new_leads}</p>
                  </Card>
                  <Card
                    className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      setActiveTab('leads')
                      // Filter by Won status
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-medium text-secondary-text">Converted</h3>
                      <IoCheckmarkCircle className="text-green-500" size={20} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">{overviewData.totals.converted_leads}</p>
                  </Card>
                  <Card
                    className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      setActiveTab('leads')
                      // Filter by Lost status
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-medium text-secondary-text">Lost Leads</h3>
                      <IoCloseCircle className="text-red-500" size={20} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-red-600">{overviewData.totals.lost_leads}</p>
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-sm sm:text-base font-medium text-secondary-text mb-2">Total Leads</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-primary-text">{leads.length}</p>
                  </Card>
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-sm sm:text-base font-medium text-secondary-text mb-2">New Leads</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{leads.filter(l => l.status === 'New').length}</p>
                  </Card>
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-sm sm:text-base font-medium text-secondary-text mb-2">Converted</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">{leads.filter(l => l.status === 'Won').length}</p>
                  </Card>
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-sm sm:text-base font-medium text-secondary-text mb-2">Lost Leads</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-red-600">{leads.filter(l => l.status === 'Lost').length}</p>
                  </Card>
                </div>
              )}

              {/* Charts Row */}
              {overviewData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Lead Sources Chart */}
                  <Card className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-primary-text">Lead Sources</h3>
                      <Button
                        variant="ghost"
                        onClick={() => setActiveTab('leads')}
                        className="text-sm"
                      >
                        View All
                      </Button>
                    </div>
                    {overviewData.sources && overviewData.sources.length > 0 ? (
                      <div className="h-64">
                        <BarChart
                          data={overviewData.sources.map(s => ({ name: s.source, value: s.count }))}
                          dataKey="value"
                          name="Leads"
                          height={250}
                          color="#0073EA"
                        />
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-secondary-text">
                        No source data available
                      </div>
                    )}
                  </Card>

                  {/* Lead Status Chart */}
                  <Card className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-primary-text">Lead Status</h3>
                      <Button
                        variant="ghost"
                        onClick={() => setActiveTab('kanban')}
                        className="text-sm"
                      >
                        View Kanban
                      </Button>
                    </div>
                    {overviewData.statuses && overviewData.statuses.length > 0 ? (
                      <div className="h-64">
                        <DonutChart
                          data={overviewData.statuses.map(s => ({ name: s.status, value: s.count }))}
                          height={250}
                        />
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-secondary-text">
                        No status data available
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* Assigned Users & Follow-ups */}
              {overviewData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Assigned Users */}
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-primary-text mb-4">Assigned Users</h3>
                    {overviewData.assigned_users && overviewData.assigned_users.length > 0 ? (
                      <div className="space-y-3">
                        {overviewData.assigned_users.slice(0, 5).map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => {
                              setActiveTab('leads')
                              setActiveFilter('my')
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary-accent/20 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary-accent">
                                  {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-primary-text">{user.name}</p>
                                <p className="text-xs text-secondary-text">{user.email}</p>
                              </div>
                            </div>
                            <Badge variant="info">{user.leads_count} leads</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-secondary-text">No assigned users</p>
                    )}
                  </Card>

                  {/* Follow-ups */}
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-primary-text mb-4">Follow-ups</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <IoCalendar className="text-blue-600" size={20} />
                            <h4 className="font-semibold text-primary-text">Today</h4>
                          </div>
                          <Badge variant="info">{overviewData.follow_ups.today}</Badge>
                        </div>
                        <p className="text-sm text-secondary-text">Leads due for follow-up today</p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <IoTime className="text-orange-600" size={20} />
                            <h4 className="font-semibold text-primary-text">Upcoming</h4>
                          </div>
                          <Badge variant="warning">{overviewData.follow_ups.upcoming}</Badge>
                        </div>
                        <p className="text-sm text-secondary-text">Leads due in next 7 days</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Revenue Summary */}
              {overviewData && overviewData.revenue && (
                <Card className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-primary-text mb-4">Revenue Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-secondary-text mb-1">Total Value</p>
                      <p className="text-2xl font-bold text-primary-text">
                        ${overviewData.revenue.total_value.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-text mb-1">Converted Value</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${overviewData.revenue.converted_value.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-text mb-1">Average Value</p>
                      <p className="text-2xl font-bold text-primary-accent">
                        ${overviewData.revenue.avg_value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )
        }

        {/* Leads Tab - List View */}
        {
          activeTab === 'leads' && viewMode !== 'kanban' && (
            <div className="w-full overflow-x-hidden">
              <DataTable
                columns={columns}
                data={filteredLeads}
                searchPlaceholder="Search leads..."
                filters={true}
                filterConfig={[
                  {
                    key: 'status',
                    label: 'Status',
                    type: 'select',
                    options: leadStages.map(s => s.id)
                  },
                  {
                    key: 'source',
                    label: 'Source',
                    type: 'select',
                    options: sources.length > 0 ? sources : ['Website', 'Call', 'Email', 'Social Media', 'Referral', 'Other']
                  },
                  {
                    key: 'city',
                    label: 'City',
                    type: 'text'
                  },
                ]}
                actions={actions}
                bulkActions={true}
                selectedRows={selectedLeads}
                onSelectAll={handleSelectAll}
                onRowClick={(row) => handleView(row)}
                loading={loading}
              />
            </div>
          )
        }

        {/* Contacts Tab */}
        {
          activeTab === 'contacts' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-primary-text">Contacts</h2>
                  <p className="text-sm text-secondary-text mt-1">Manage all contacts</p>
                </div>
                <Button
                  variant="primary"
                  onClick={handleAddContact}
                  className="flex items-center gap-2"
                >
                  <IoPersonAdd size={18} />
                  Add Contact
                </Button>
              </div>

              {/* Contacts Table */}
              {contactsLoading ? (
                <Card className="p-6">
                  <div className="text-center py-8 text-secondary-text">Loading contacts...</div>
                </Card>
              ) : contacts.length === 0 ? (
                <Card className="p-6">
                  <div className="text-center py-8">
                    <IoPerson size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-secondary-text">No contacts found</p>
                    <Button
                      variant="primary"
                      onClick={handleAddContact}
                      className="mt-4 flex items-center gap-2 mx-auto"
                    >
                      <IoPersonAdd size={18} />
                      Add First Contact
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-0">
                  <DataTable
                    data={contacts}
                    columns={[
                      { key: 'name', label: 'Name' },
                      { key: 'company', label: 'Company', render: (value) => value || '-' },
                      { key: 'email', label: 'Email', render: (value) => value || '-' },
                      { key: 'phone', label: 'Phone', render: (value) => value || '-' },
                      {
                        key: 'contact_type',
                        label: 'Type',
                        render: (value) => (
                          <Badge variant="default">{value || 'Client'}</Badge>
                        ),
                      },
                      {
                        key: 'status',
                        label: 'Status',
                        render: (value) => (
                          <Badge variant={value === 'Active' ? 'success' : 'warning'}>
                            {value || 'Active'}
                          </Badge>
                        ),
                      },
                      {
                        key: 'assigned_user_name',
                        label: 'Assigned To',
                        render: (value) => value || '-',
                      },
                      {
                        key: 'actions',
                        label: 'Actions',
                        render: (_, row) => (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditContact(row)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <IoCreate size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteContact(row.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <IoTrash size={18} />
                            </button>
                          </div>
                        ),
                      },
                    ]}
                    loading={contactsLoading}
                    emptyMessage="No contacts found"
                  />
                </Card>
              )}
            </div>
          )
        }

        {/* Events Tab */}
        {
          activeTab === 'events' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-primary-text">Events</h2>
                  <p className="text-sm text-secondary-text mt-1">Manage all events</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {['month', 'week', 'day', 'list'].map((view) => (
                      <button
                        key={view}
                        onClick={() => setCalendarView(view)}
                        className={`px-2 sm:px-3 py-1 text-xs font-medium rounded transition-colors ${calendarView === view
                          ? 'bg-white text-primary-text shadow-sm'
                          : 'text-secondary-text hover:text-primary-text'
                          }`}
                      >
                        {view.charAt(0).toUpperCase() + view.slice(1)}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setIsAddEventModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add event
                  </Button>
                </div>
              </div>

              {/* Calendar Navigation */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <IoChevronBack size={18} />
                    </button>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <IoChevronForward size={18} />
                    </button>
                    <h3 className="text-lg font-semibold text-primary-text ml-4">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                  </div>
                </div>

                {/* Calendar Grid */}
                {calendarView === 'month' && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="px-4 py-3 text-xs font-medium text-secondary-text uppercase text-center">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 bg-white">
                      {(() => {
                        const year = currentMonth.getFullYear()
                        const month = currentMonth.getMonth()
                        const firstDay = new Date(year, month, 1)
                        const lastDay = new Date(year, month + 1, 0)
                        const daysInMonth = lastDay.getDate()
                        const startingDayOfWeek = firstDay.getDay()

                        const days = []
                        for (let i = 0; i < startingDayOfWeek; i++) {
                          days.push(null)
                        }
                        for (let day = 1; day <= daysInMonth; day++) {
                          days.push(day)
                        }

                        return days.map((day, index) => {
                          const dayEvents = day !== null ? events.filter(event => {
                            const eventDate = new Date(event.starts_on_date)
                            return eventDate.getDate() === day &&
                              eventDate.getMonth() === month &&
                              eventDate.getFullYear() === year
                          }) : []

                          return (
                            <div
                              key={index}
                              className="min-h-[100px] border-r border-b border-gray-200 p-2 hover:bg-gray-50 relative"
                            >
                              {day !== null && (
                                <>
                                  <div className="text-sm font-medium text-primary-text mb-1">{day}</div>
                                  <div className="space-y-1">
                                    {dayEvents.slice(0, 2).map((event, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs px-2 py-1 rounded truncate"
                                        style={{ backgroundColor: event.label_color || '#FF0000', color: 'white' }}
                                        title={event.event_name}
                                      >
                                        {event.event_name}
                                      </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                      <div className="text-xs text-secondary-text">+{dayEvents.length - 2} more</div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                )}

                {/* List View */}
                {calendarView === 'list' && (
                  <div className="space-y-2">
                    {eventsLoading ? (
                      <div className="text-center py-8 text-secondary-text">Loading events...</div>
                    ) : events.length === 0 ? (
                      <div className="text-center py-8">
                        <IoCalendar size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-secondary-text">No events found</p>
                      </div>
                    ) : (
                      events.map((event) => (
                        <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-primary-text">{event.event_name}</h4>
                              <p className="text-sm text-secondary-text mt-1">{event.description || 'No description'}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-secondary-text">
                                <span className="flex items-center gap-1">
                                  <IoCalendar size={14} />
                                  {new Date(event.starts_on_date).toLocaleDateString()} {event.starts_on_time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <IoLocation size={14} />
                                  {event.where || 'TBD'}
                                </span>
                              </div>
                            </div>
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: event.label_color || '#FF0000' }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>
            </div>
          )
        }

        {/* Add/Edit Modal - Same as before but with probability and callThisWeek fields */}
        <RightSideModal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false)
            setIsEditModalOpen(false)
          }}
          title={isAddModalOpen ? 'Add New Lead' : 'Edit Lead'}
        >
          <div className="space-y-4">
            {/* Basic Info Section */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-primary-text mb-3">Basic Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Lead Type <span className="text-danger">*</span>
                  </label>
                  <select
                    value={formData.leadType}
                    onChange={(e) => {
                      const newLeadType = e.target.value
                      setFormData({
                        ...formData,
                        leadType: newLeadType,
                        // Clear fields when switching types
                        personName: newLeadType === 'Organization' ? '' : formData.personName,
                        companyName: newLeadType === 'Person' ? '' : formData.companyName
                      })
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                  >
                    <option value="Organization">Organization</option>
                    <option value="Person">Person</option>
                  </select>
                </div>
                {formData.leadType === 'Person' ? (
                  <Input
                    label="Person Name"
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                    placeholder="Enter person name"
                  />
                ) : (
                  <Input
                    label="Organization Name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Enter organization name"
                  />
                )}
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Ownership Section */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-primary-text mb-3">Ownership</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Employee
                  </label>
                  <select
                    value={formData.employee}
                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee.user_id || employee.id} value={employee.user_id || employee.id}>
                        {employee.name || employee.email}
                      </option>
                    ))}
                  </select>
                  {employees.length === 0 && (
                    <p className="text-xs text-secondary-text mt-1">No employees found for this company</p>
                  )}
                </div>
              </div>
            </div>

            {/* Lead Details Section */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-primary-text mb-3">Lead Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                  >
                    {leadStages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                  >
                    <option value="">Select source</option>
                    {sources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Label
                  </label>
                  <select
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                  >
                    <option value="">Select label</option>
                    {labels.map(labelItem => {
                      const labelName = typeof labelItem === 'object' ? labelItem.name : labelItem
                      return (
                        <option key={labelName} value={labelName}>{labelName}</option>
                      )
                    })}
                  </select>
                  {labels.length === 0 && (
                    <p className="text-xs text-secondary-text mt-1">No labels available. Add labels from "Manage labels" button.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Address
                  </label>
                  <RichTextEditor
                    value={formData.address}
                    onChange={(content) => setFormData({ ...formData, address: content })}
                    placeholder="Enter address"
                  />
                </div>
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter city"
                />
                <Input
                  label="Lead Value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="Enter lead value"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-primary-text">
                    Probability (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={formData.probability || 0}
                      onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-accent"
                    />
                    <span className="w-12 text-center font-bold text-primary-accent">{formData.probability || 0}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <input
                    id="callThisWeek"
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-primary-accent focus:ring-primary-accent"
                    checked={formData.callThisWeek}
                    onChange={(e) => setFormData({ ...formData, callThisWeek: e.target.checked })}
                  />
                  <label htmlFor="callThisWeek" className="text-sm font-medium text-primary-text cursor-pointer">
                    Call this week
                  </label>
                </div>
                <Input
                  label="Due Follow-up Date"
                  type="date"
                  value={formData.dueFollowup}
                  onChange={(e) => setFormData({ ...formData, dueFollowup: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Notes
                  </label>
                  <RichTextEditor
                    value={formData.notes}
                    onChange={(content) => setFormData({ ...formData, notes: content })}
                    placeholder="Add notes..."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 pt-4 border-t border-gray-200 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false)
                  setIsEditModalOpen(false)
                }}
                className="px-4 text-gray-900 hover:text-white min-w-[100px]"
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} className="px-4 min-w-[120px]">
                {isAddModalOpen ? 'Save Lead' : 'Update Lead'}
              </Button>
            </div>
          </div>
        </RightSideModal>

        <RightSideModal
          isOpen={isConvertModalOpen}
          onClose={() => setIsConvertModalOpen(false)}
          title="Convert Lead to Client"
        >
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-primary-text mb-3">Login Details</h3>
              <div className="space-y-4">
                <Input
                  label="Client Name *"
                  value={convertFormData.companyName}
                  onChange={(e) => setConvertFormData({ ...convertFormData, companyName: e.target.value })}
                  placeholder="Enter client name"
                  required
                />
                <Input
                  label="Client Email *"
                  type="email"
                  value={convertFormData.email}
                  onChange={(e) => setConvertFormData({ ...convertFormData, email: e.target.value })}
                  placeholder="Enter client email"
                  required
                  helperText="Client will login using this email"
                />
                <div className="relative">
                  <Input
                    label="Password *"
                    type={showPassword ? "text" : "password"}
                    value={convertFormData.password}
                    onChange={(e) => setConvertFormData({ ...convertFormData, password: e.target.value })}
                    placeholder="Enter login password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-gray-500 hover:text-primary-accent"
                  >
                    {showPassword ? <IoEye size={20} /> : <IoEye size={20} className="opacity-50" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-primary-text mb-3">Company Details</h3>
              <div className="space-y-4">
                <Input
                  label="Address"
                  value={convertFormData.address}
                  onChange={(e) => setConvertFormData({ ...convertFormData, address: e.target.value })}
                  placeholder="Enter address"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={convertFormData.city}
                    onChange={(e) => setConvertFormData({ ...convertFormData, city: e.target.value })}
                    placeholder="Enter city"
                  />
                  <Input
                    label="State"
                    value={convertFormData.state}
                    onChange={(e) => setConvertFormData({ ...convertFormData, state: e.target.value })}
                    placeholder="Enter state"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Zip Code"
                    value={convertFormData.zip}
                    onChange={(e) => setConvertFormData({ ...convertFormData, zip: e.target.value })}
                    placeholder="Enter zip code"
                  />
                  <div>
                    <label className="block text-sm font-medium text-primary-text mb-2">Country</label>
                    <select
                      value={convertFormData.country}
                      onChange={(e) => setConvertFormData({ ...convertFormData, country: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                    >
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-text mb-2">Code</label>
                    <select
                      value={convertFormData.phoneCountryCode}
                      onChange={(e) => setConvertFormData({ ...convertFormData, phoneCountryCode: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                    >
                      {countryCodes.map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Phone Number"
                      value={convertFormData.phoneNumber}
                      onChange={(e) => setConvertFormData({ ...convertFormData, phoneNumber: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <Input
                  label="Website"
                  value={convertFormData.website}
                  onChange={(e) => setConvertFormData({ ...convertFormData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-primary-text mb-3">Billing Points</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="VAT Number"
                    value={convertFormData.vatNumber}
                    onChange={(e) => setConvertFormData({ ...convertFormData, vatNumber: e.target.value })}
                    placeholder="Enter VAT number"
                  />
                  <Input
                    label="GST Number"
                    value={convertFormData.gstNumber}
                    onChange={(e) => setConvertFormData({ ...convertFormData, gstNumber: e.target.value })}
                    placeholder="Enter GST number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">Currency</label>
                  <select
                    value={convertFormData.currency}
                    onChange={(e) => setConvertFormData({ ...convertFormData, currency: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsConvertModalOpen(false)}
                className="px-4 text-gray-900 hover:text-white min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveConversion}
                className="px-4 bg-primary-accent text-white hover:bg-primary-accent/90 min-w-[150px]"
              >
                Perform Conversion
              </Button>
            </div>
          </div>
        </RightSideModal>

        {/* View Modal - Lead Details (Developo Style) */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          size="xl" // Increased size for detailed view
          title="Lead Details"
        >
          {selectedLead && (
            <div className="h-full flex flex-col font-sans text-primary-text">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary-accent text-white flex items-center justify-center text-lg font-bold">
                    <IoBusiness />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedLead.personName || selectedLead.companyName || 'Lead Details'}</h2>
                    <p className="text-sm text-gray-500">{selectedLead.companyName || 'No Company'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleConvertToClient(selectedLead)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-accent text-white rounded hover:bg-primary-accent/90 transition-colors shadow-sm"
                  >
                    <IoPersonAdd size={16} /> Convert to client
                  </button>
                  <button
                    onClick={() => { setIsViewModalOpen(false); handleEdit(selectedLead); }}
                    className="p-2 border border-blue-100 text-blue-600 rounded hover:bg-blue-50" title="Edit"
                  >
                    <IoCreate size={18} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-6 border-b border-gray-200 mb-6 text-sm font-medium text-gray-600 overflow-x-auto">
                <button
                  onClick={() => setActiveDetailTab('overview')}
                  className={`pb-3 border-b-2 px-1 transition-colors ${activeDetailTab === 'overview' ? 'border-primary-accent text-primary-accent' : 'border-transparent hover:border-gray-300'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveDetailTab('estimates')}
                  className={`pb-3 border-b-2 px-1 transition-colors ${activeDetailTab === 'estimates' ? 'border-primary-accent text-primary-accent' : 'border-transparent hover:border-gray-300'}`}
                >
                  Estimates
                </button>
                <button
                  onClick={() => setActiveDetailTab('proposals')}
                  className={`pb-3 border-b-2 px-1 transition-colors ${activeDetailTab === 'proposals' ? 'border-primary-accent text-primary-accent' : 'border-transparent hover:border-gray-300'}`}
                >
                  Proposals
                </button>
                <button
                  onClick={() => setActiveDetailTab('contracts')}
                  className={`pb-3 border-b-2 px-1 transition-colors ${activeDetailTab === 'contracts' ? 'border-primary-accent text-primary-accent' : 'border-transparent hover:border-gray-300'}`}
                >
                  Contracts
                </button>
                <button
                  onClick={() => setActiveDetailTab('files')}
                  className={`pb-3 border-b-2 px-1 transition-colors ${activeDetailTab === 'files' ? 'border-primary-accent text-primary-accent' : 'border-transparent hover:border-gray-300'}`}
                >
                  Files
                </button>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Main Content based on Tab */}
                <div className="flex-1 space-y-8">

                  {activeDetailTab === 'overview' && (
                    <>
                      {/* Stats Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                          <div className="text-2xl font-bold text-gray-700">0</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Estimates</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                          <div className="text-2xl font-bold text-gray-700">0</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Estimate Requests</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                          <div className="text-2xl font-bold text-gray-700">0</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Proposals</div>
                        </div>
                      </div>

                      {/* Contacts Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <IoPeopleOutline size={20} /> Contacts
                          </h3>
                          <button className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                            <IoAdd /> Add contact
                          </button>
                        </div>
                        {/* Placeholder Contact */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                              {(selectedLead.personName?.[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{selectedLead.personName || 'Unknown Name'}</p>
                              <p className="text-xs text-secondary-text">{selectedLead.email || 'No Email'}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <IoCall size={12} /> {selectedLead.phone || 'No Phone'}
                            </div>
                            <button className="text-gray-400 hover:text-red-500" title="Remove"><IoClose size={16} /></button>
                          </div>
                        </div>
                      </div>

                      {/* Events Section (Calendar) */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <IoCalendarOutline size={20} /> Events
                          </h3>
                          <button className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                            <IoAdd /> Add event
                          </button>
                        </div>
                        {/* Simple Calendar View */}
                        <div className="border border-gray-200 rounded-lg bg-white p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-2">
                              <button className="p-1 hover:bg-gray-100 rounded"><IoChevronBack /></button>
                              <button className="p-1 hover:bg-gray-100 rounded"><IoChevronForward /></button>
                            </div>
                            <div className="font-semibold text-gray-700">January 2026</div>
                            <button className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">today</button>
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center text-sm">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-gray-400 text-xs font-medium py-2">{d}</div>)}
                            {/* Mock Calendar Grid */}
                            {Array.from({ length: 31 }).map((_, i) => (
                              <div key={i} className={`py-4 border border-transparent hover:bg-gray-50 rounded-lg ${i === 7 ? 'bg-yellow-50' : ''} text-gray-600 hover:text-gray-900 cursor-pointer`}>
                                {i + 1}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeDetailTab === 'estimates' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          Estimates
                        </h3>
                        <button
                          onClick={() => {
                            // Navigate to create estimate or open modal
                            // For now we can navigate
                            navigate('/app/admin/estimates/create')
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
                        >
                          <IoAdd size={16} /> Add Estimate
                        </button>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {/* Placeholder for Estimates Table */}
                        <div className="p-8 text-center text-gray-500">
                          <IoDocumentTextOutline size={48} className="mx-auto mb-3 text-gray-300" />
                          <p>No estimates found for this lead.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add other tabs placeholders as needed */}
                </div>

                {/* Right Column - Sidebar Info */}
                <div className="w-full lg:w-1/3 space-y-6">
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <IoList size={18} /> Lead info
                      </h3>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => handleEdit(selectedLead)}
                      >
                        <IoEllipsisHorizontal />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Organization */}
                      {selectedLead.companyName && (
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Organization</p>
                          <p className="text-sm font-semibold text-gray-800">{selectedLead.companyName}</p>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${selectedLead.status === 'Won' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                          {selectedLead.status || 'New'}
                        </span>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1">
                          <IoLogoGoogle size={12} /> Google
                        </span>
                        {selectedLead.probability && (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                            {selectedLead.probability}% Probability
                          </span>
                        )}
                      </div>

                      {/* Owner */}
                      <div className="pt-2">
                        <p className="text-xs text-gray-500 font-medium mb-2">Owner</p>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                            {(selectedLead.employee?.[0] || 'U')}
                          </div>
                          <p className="text-sm text-blue-600 hover:underline cursor-pointer">{selectedLead.employee || 'Unassigned'}</p>
                        </div>
                      </div>

                      {/* Add Managers */}
                      <div>
                        <button className="text-xs text-blue-500 flex items-center gap-1 hover:underline">
                          <IoAdd /> Add Managers
                        </button>
                      </div>

                      {/* Address */}
                      <div className="pt-2 border-t border-gray-200 mt-2">
                        <div className="flex items-start gap-2 mt-2">
                          <IoLocationOutline className="text-gray-400 mt-1" size={16} />
                          <p className="text-sm text-gray-600">
                            {stripHtml(selectedLead.address) || 'No Address'}<br />
                            {selectedLead.city || 'No City'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <IoCallOutline className="text-gray-400" size={16} />
                          <p className="text-sm text-gray-600">{selectedLead.phone || '(205) 360-2071'}</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Additional Sections Placeholder */}
                  {/* Tasks Section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800 text-lg">Tasks</h3>
                      <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:text-primary-accent hover:border-primary-accent transition-colors bg-white shadow-sm"
                      >
                        <IoAdd size={14} /> Add Task
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {/* Placeholder/Mock Task to match user request */}
                      <div className="group flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-blue-50/50 hover:border-blue-100 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                          <span className="text-sm font-semibold text-gray-700">SMTP Configuration</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">Incomplete</span>
                      </div>

                      {/* Empty state if needed */}
                      {/* <div className="text-center py-4 text-gray-400 text-sm italic">No tasks yet</div> */}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800 text-lg">Notes</h3>
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:text-primary-accent hover:border-primary-accent transition-colors bg-white shadow-sm"
                      >
                        <IoAdd size={14} /> Add Note
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {selectedLead.notes ? (
                        <div className="group p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-blue-50/50 hover:border-blue-100 transition-all">
                          <p className="text-sm text-gray-700 leading-relaxed font-medium">
                            {stripHtml(selectedLead.notes)}
                          </p>
                          <div className="mt-2.5 pt-2.5 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
                            <span>{new Date().toLocaleDateString()}</span>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-500">
                              <IoTrashOutline />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                          <p className="text-sm text-gray-400">No notes added yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reminders Section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800 text-lg">Reminders</h3>
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:text-primary-accent hover:border-primary-accent transition-colors bg-white shadow-sm"
                      >
                        <IoAdd size={14} /> Add Reminder
                      </button>
                    </div>
                    <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                      <p className="text-sm text-gray-400">No active reminders</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Manage Labels Modal */}
        <Modal
          isOpen={isManageLabelsModalOpen}
          onClose={() => {
            setIsManageLabelsModalOpen(false)
            setNewLabel('')
            setNewLabelColor('#22c55e')
          }}
          title="Manage Labels"
          size="md"
        >
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
              <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <IoAdd className="text-primary-accent" /> Create New Label
              </h4>

              <div className="space-y-4">
                {/* Color Selection - Professional Small Swatches */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    '#22c55e', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6',
                    '#ef4444', '#f97316', '#eab308', '#ec4899', '#64748b',
                    '#166534', '#065f46', '#1e40af', '#3730a3', '#5b21b6',
                    '#991b1b', '#9a3412', '#854d0e', '#9d174d', '#334155'
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewLabelColor(color)}
                      className={`group relative w-7 h-7 rounded-full transition-all duration-200 ${newLabelColor === color ? 'ring-2 ring-primary-accent ring-offset-2 scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                    >
                      {newLabelColor === color && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <IoCheckmarkCircle className="text-white drop-shadow-sm" size={12} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="Label name (e.g. High Priority, VIP)"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent outline-none transition-all shadow-sm group-hover:border-gray-300"
                    />
                    <div
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: newLabelColor }}
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleAddLabel}
                    disabled={!newLabel.trim()}
                    className="flex items-center gap-2 rounded-xl transition-all active:scale-95"
                  >
                    <IoAdd size={20} />
                    <span>Add</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* List of Labels */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <IoList className="text-gray-400" /> Existing Labels
                  {labels.length > 0 && <span className="text-xs font-normal text-gray-400">({labels.length})</span>}
                </h4>
              </div>

              {labels.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {labels.map((labelItem, idx) => {
                    const labelName = typeof labelItem === 'object' ? labelItem.name : labelItem
                    const labelColor = typeof labelItem === 'object' ? labelItem.color : '#22c55e'
                    return (
                      <div
                        key={`${labelName}-${idx}`}
                        className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all animate-in fade-in slide-in-from-left-2"
                        style={{ borderLeft: `4px solid ${labelColor}` }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="px-3 py-1 rounded-full text-white text-xs font-bold shadow-sm"
                            style={{ backgroundColor: labelColor }}
                          >
                            {labelName}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setNewLabel(labelName)
                              setNewLabelColor(labelColor)
                            }}
                            className="p-1.5 text-gray-400 hover:text-primary-accent hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <IoPencil size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteLabel(labelName)
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <IoTrashOutline size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                  <IoPricetag size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-sm text-gray-500 font-medium">No custom labels created yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start by adding labels from above</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsManageLabelsModalOpen(false)}
                className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-primary-accent transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>

        {/* Import Leads Modal */}
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false)
            setSelectedFile(null)
            setIsDragging(false)
          }}
          title="Import Leads"
          size="md"
        >
          <div className="space-y-4">
            <div
              onDragOver={handleDragOverFile}
              onDragLeave={handleDragLeaveFile}
              onDrop={handleDropFile}
              onClick={() => document.getElementById('file-input')?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragging
                ? 'border-primary-accent bg-primary-accent/10'
                : selectedFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-primary-accent hover:bg-gray-50'
                }`}
            >
              <input
                id="file-input"
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <IoDownload className={`mx-auto mb-2 ${selectedFile ? 'text-green-500' : 'text-gray-400'}`} size={32} />
              {selectedFile ? (
                <>
                  <p className="text-sm font-medium text-primary-text mb-1">File selected:</p>
                  <p className="text-sm text-primary-text mb-1">{selectedFile.name}</p>
                  <p className="text-xs text-secondary-text">Click to change file</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-secondary-text mb-1">Drag & drop CSV file here or click to browse</p>
                  <p className="text-xs text-secondary-text">Supports: CSV, XLS, XLSX</p>
                </>
              )}
            </div>

            {selectedFile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>File:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImportModalOpen(false)
                  setSelectedFile(null)
                  setIsDragging(false)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleImportLeads}
                disabled={!selectedFile}
                className="flex-1"
              >
                Import
              </Button>
            </div>
          </div>
        </Modal>

        {/* Bulk Email Modal */}
        <Modal
          isOpen={isBulkEmailModalOpen}
          onClose={() => setIsBulkEmailModalOpen(false)}
          title={`Bulk Email to ${selectedLeads.length} Leads`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Recipients ({selectedLeads.length} selected)
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
                {leads.filter(l => selectedLeads.includes(l.id)).map(lead => (
                  <div key={lead.id} className="text-sm text-secondary-text">
                    {lead.personName} &lt;{lead.email}&gt;
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Email Template
              </label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none">
                <option>Select template...</option>
                <option>Follow-up Email</option>
                <option>Proposal Email</option>
                <option>Welcome Email</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Subject
              </label>
              <Input
                placeholder="Enter email subject"
                defaultValue="Follow-up regarding your inquiry"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Message
              </label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                placeholder="Enter your message..."
                defaultValue="Dear {{lead.name}},&#10;&#10;Thank you for your interest..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsBulkEmailModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  alert(`Email sent to ${selectedLeads.length} leads successfully!`)
                  setIsBulkEmailModalOpen(false)
                  setSelectedLeads([])
                }}
                className="flex-1"
              >
                Send Email
              </Button>
            </div>
          </div>
        </Modal>

        {/* Create Task Modal */}
        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          title={`Create Task for ${selectedLead?.personName || selectedLead?.companyName}`}
        >
          <div className="space-y-4">
            <Input label="Task Title" placeholder="e.g., Follow up with lead" />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Priority
              </label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
            <Input label="Due Date" type="date" />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Description
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                placeholder="Task description..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsTaskModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  alert('Task created successfully!')
                  setIsTaskModalOpen(false)
                }}
                className="flex-1"
              >
                Create Task
              </Button>
            </div>
          </div>
        </Modal>

        {/* Send Email Modal */}
        <Modal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          title={`Send Email to ${selectedLead?.personName || selectedLead?.companyName}`}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                To
              </label>
              <Input
                value={selectedLead?.email || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Template
              </label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none">
                <option>Select template...</option>
                <option>Follow-up Email</option>
                <option>Proposal Email</option>
              </select>
            </div>
            <Input label="Subject" placeholder="Email subject" />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Message
              </label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                placeholder="Your message..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEmailModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  alert('Email sent successfully!')
                  setIsEmailModalOpen(false)
                }}
                className="flex-1"
              >
                Send Email
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add/Edit Contact Modal */}
        <RightSideModal
          isOpen={isContactModalOpen || isEditContactModalOpen}
          onClose={() => {
            setIsContactModalOpen(false)
            setIsEditContactModalOpen(false)
            setSelectedContact(null)
          }}
          title={selectedContact ? 'Edit Contact' : 'Add Contact'}
        >
          <div className="space-y-4">
            <Input
              label="Name"
              value={contactFormData.name}
              onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
              placeholder="Enter contact name"
              required
            />
            {/* Company ID - Hidden field (auto-set from session) */}
            <input type="hidden" name="company_id" value={companyId} />

            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Company Name
              </label>
              <Input
                value={contactFormData.company || companyName || ''}
                onChange={(e) => setContactFormData({ ...contactFormData, company: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={contactFormData.email}
              onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
              placeholder="Enter email"
            />
            <Input
              label="Phone"
              value={contactFormData.phone}
              onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
              placeholder="Enter phone number"
            />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Contact Type
              </label>
              <select
                value={contactFormData.contact_type}
                onChange={(e) => setContactFormData({ ...contactFormData, contact_type: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="Client">Client</option>
                <option value="Vendor">Vendor</option>
                <option value="Partner">Partner</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Assigned User
              </label>
              <select
                value={contactFormData.assigned_user_id}
                onChange={(e) => setContactFormData({ ...contactFormData, assigned_user_id: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="">Select User</option>
                {employees.map(emp => (
                  <option key={emp.user_id || emp.id} value={emp.user_id || emp.id}>
                    {emp.name || emp.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Status
              </label>
              <select
                value={contactFormData.status}
                onChange={(e) => setContactFormData({ ...contactFormData, status: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Notes
              </label>
              <textarea
                value={contactFormData.notes}
                onChange={(e) => setContactFormData({ ...contactFormData, notes: e.target.value })}
                placeholder="Add notes..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              />
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsContactModalOpen(false)
                  setIsEditContactModalOpen(false)
                  setSelectedContact(null)
                }}
                className="px-6 py-2.5"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveContact}
                className="px-6 py-2.5 bg-primary-accent text-white hover:bg-primary-accent/90"
              >
                {selectedContact ? 'Update' : 'Create'} Contact
              </Button>
            </div>
          </div>
        </RightSideModal>

        {/* Add Event Modal */}
        <Modal
          isOpen={isAddEventModalOpen}
          onClose={() => {
            setIsAddEventModalOpen(false)
            setEventFormData({
              event_name: '',
              description: '',
              where: '',
              starts_on_date: new Date().toISOString().split('T')[0],
              starts_on_time: '09:00',
              ends_on_date: new Date().toISOString().split('T')[0],
              ends_on_time: '10:00',
              label_color: '#FF0000',
              status: 'Pending',
              employee_ids: [],
              client_ids: [],
              department_ids: [],
              host_id: userId || null,
            })
          }}
          title="Add Event"
        >
          <div className="space-y-4">
            <Input
              label="Event Name *"
              value={eventFormData.event_name}
              onChange={(e) => setEventFormData({ ...eventFormData, event_name: e.target.value })}
              placeholder="Enter event name"
              required
            />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Label Color *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={eventFormData.label_color}
                  onChange={(e) => setEventFormData({ ...eventFormData, label_color: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={eventFormData.label_color}
                  onChange={(e) => setEventFormData({ ...eventFormData, label_color: e.target.value })}
                  placeholder="#FF0000"
                  className="flex-1"
                />
              </div>
            </div>
            <Input
              label="Where *"
              value={eventFormData.where}
              onChange={(e) => setEventFormData({ ...eventFormData, where: e.target.value })}
              placeholder="Enter location"
              required
            />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Description</label>
              <textarea
                value={eventFormData.description}
                onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                placeholder="Enter description"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Start Date *"
                type="date"
                value={eventFormData.starts_on_date}
                onChange={(e) => {
                  const newDate = e.target.value
                  setEventFormData({
                    ...eventFormData,
                    starts_on_date: newDate,
                    ends_on_date: newDate
                  })
                }}
                required
              />
              <Input
                label="Start Time *"
                type="time"
                value={eventFormData.starts_on_time}
                onChange={(e) => setEventFormData({ ...eventFormData, starts_on_time: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="End Date *"
                type="date"
                value={eventFormData.ends_on_date}
                onChange={(e) => setEventFormData({ ...eventFormData, ends_on_date: e.target.value })}
                required
              />
              <Input
                label="End Time *"
                type="time"
                value={eventFormData.ends_on_time}
                onChange={(e) => setEventFormData({ ...eventFormData, ends_on_time: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Status</label>
              <select
                value={eventFormData.status}
                onChange={(e) => setEventFormData({ ...eventFormData, status: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddEventModalOpen(false)
                  setEventFormData({
                    event_name: '',
                    description: '',
                    where: '',
                    starts_on_date: new Date().toISOString().split('T')[0],
                    starts_on_time: '09:00',
                    ends_on_date: new Date().toISOString().split('T')[0],
                    ends_on_time: '10:00',
                    label_color: '#FF0000',
                    status: 'Pending',
                    employee_ids: [],
                    client_ids: [],
                    department_ids: [],
                    host_id: userId || null,
                  })
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddEvent} className="flex-1">
                Add Event
              </Button>
            </div>
          </div>
        </Modal>

        {/* Bulk Update Modal - RiceCRM Style */}
        <BulkUpdateModal
          isOpen={isBulkUpdateModalOpen}
          onClose={() => setIsBulkUpdateModalOpen(false)}
          selectedCount={selectedLeads.length}
          entityType="leads"
          options={{
            employees: employees,
            sources: sources
          }}
          onUpdate={async (updateType, updateValue) => {
            try {
              if (updateType === 'delete') {
                // Bulk delete
                await handleBulkAction('delete', {})
              } else {
                // Bulk update
                await handleBulkAction('update', {
                  field: updateType,
                  value: updateValue
                })
              }
              showNotification('success', 'Success', `Successfully updated ${selectedLeads.length} leads`)
              setSelectedLeads([])
            } catch (error) {
              showNotification('error', 'Error', error.message || 'Failed to update leads')
              throw error
            }
          }}
        />

        {/* Notification Modal - RiceCRM Style Centered Popup */}
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={() => setNotification({ ...notification, isOpen: false })}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          autoClose={true}
          autoCloseDelay={3000}
        />
      </div>
    )
  )
}

export default Leads

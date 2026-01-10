import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { leadsAPI, estimatesAPI, proposalsAPI, contractsAPI, documentsAPI, eventsAPI, contactsAPI, tasksAPI, notesAPI, employeesAPI } from '../../../api'
import { useAuth } from '../../../context/AuthContext'
import { useSettings } from '../../../context/SettingsContext'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import RightSideModal from '../../../components/ui/RightSideModal'
import RichTextEditor from '../../../components/ui/RichTextEditor'
import {
  FormRow,
  FormSection,
  FormInput,
  FormSelect,
  FormActions
} from '../../../components/ui/FormRow'
import {
  IoArrowBack,
  IoPerson,
  IoCall,
  IoMail,
  IoLocation,
  IoCalendar,
  IoAdd,
  IoCreate,
  IoTrash,
  IoCheckmarkCircle,
  IoDocumentText,
  IoChatbubble,
  IoTime,
  IoChevronDown,
  IoSearch,
  IoFilter,
  IoGrid,
  IoPersonAdd,
  IoPrint,
  IoDownload,
  IoEye,
  IoClose,
  IoFileTray,
  IoFileTrayFull,
  IoBriefcase,
  IoPricetag,
  IoEllipsisHorizontal,
  IoLayers
} from 'react-icons/io5'

const LeadDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { settings } = useSettings()
  const companyId = user?.company_id || localStorage.getItem('companyId') || 1
  const [lead, setLead] = useState(null)
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [probabilityFilter, setProbabilityFilter] = useState(null)
  const [calendarView, setCalendarView] = useState('month')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)

  // Data states
  const [estimates, setEstimates] = useState([])
  const [proposals, setProposals] = useState([])
  const [contracts, setContracts] = useState([])
  const [files, setFiles] = useState([])
  const [contacts, setContacts] = useState([])
  const [tasks, setTasks] = useState([])
  const [notes, setNotes] = useState([])
  const [reminders, setReminders] = useState([])
  const [events, setEvents] = useState([])
  const [availableLabels, setAvailableLabels] = useState([])
  const [employees, setEmployees] = useState([])

  // Loading states
  const [loadingEstimates, setLoadingEstimates] = useState(false)
  const [loadingProposals, setLoadingProposals] = useState(false)
  const [loadingContracts, setLoadingContracts] = useState(false)
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [loadingContacts, setLoadingContacts] = useState(false)

  // Modals
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false)
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false)
  const [isAddReminderModalOpen, setIsAddReminderModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false)
  const [isAddFileModalOpen, setIsAddFileModalOpen] = useState(false)
  const [isAddEstimateModalOpen, setIsAddEstimateModalOpen] = useState(false)
  const [isAddProposalModalOpen, setIsAddProposalModalOpen] = useState(false)
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false)
  const [isViewContractModalOpen, setIsViewContractModalOpen] = useState(false)
  const [isViewProposalModalOpen, setIsViewProposalModalOpen] = useState(false)
  const [isEditProposalModalOpen, setIsEditProposalModalOpen] = useState(false)

  const [selectedContract, setSelectedContract] = useState(null)
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [proposalTemplate, setProposalTemplate] = useState('professional')

  // Convert to Client Modal State
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Constants for conversion modal
  const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'India', 'Germany', 'France']
  const countryCodes = ['+1', '+44', '+91', '+61', '+49', '+33']
  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD']

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
    currencySymbol: '$',
    disableOnlinePayment: false,
  })

  // Form data
  const [contactFormData, setContactFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    contact_type: 'Client',
    status: 'Active',
    notes: ''
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
    host_id: user?.id || null,
  })

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    points: '1',
    assign_to: '',
    collaborators: [],
    status: 'Incomplete',
    priority: 'Medium',
    labels: [],
    start_date: new Date().toISOString().split('T')[0],
    deadline: '',
    uploaded_file: null
  })

  const [noteFormData, setNoteFormData] = useState({
    title: '',
    description: '',
    category: '',
    labels: [],
    color: '#3b82f6',
    file: null
  })

  const [reminderFormData, setReminderFormData] = useState({
    title: '',
    date: '',
    time: '',
    description: ''
  })

  const [followUpFormData, setFollowUpFormData] = useState({
    date: '',
    time: '',
    notes: ''
  })

  const [fileFormData, setFileFormData] = useState({
    title: '',
    category: '',
    description: '',
    file: null
  })
  const [estimateFormData, setEstimateFormData] = useState({
    estimate_number: '',
    estimate_date: new Date().toISOString().split('T')[0],
    valid_till: '',
    currency: 'USD',
    calculate_tax: 'After Discount',
    description: '',
    note: '',
    terms: 'Thank you for your business.',
    discount: 0,
    discount_type: '%',
    amount: '',
    status: 'draft',
    client_id: null,
    project_id: null,
    items: []
  })

  const [proposalFormData, setProposalFormData] = useState({
    title: '',
    valid_till: '',
    currency: 'USD',
    description: '',
    note: '',
    terms: 'Thank you for your business.',
    discount: 0,
    discount_type: '%',
    amount: '',
    status: 'draft',
    client_id: null,
    project_id: null,
    items: []
  })

  const [contractFormData, setContractFormData] = useState({
    title: '',
    contract_date: new Date().toISOString().split('T')[0],
    valid_until: '',
    tax: '',
    second_tax: '',
    note: '',
    amount: '',
    status: 'draft',
    client_id: null,
    project_id: null
  })

  // Lead stages
  const leadStages = [
    { id: 'New', label: 'New', color: 'bg-blue-100 text-blue-800' },
    { id: 'Qualified', label: 'Qualified', color: 'bg-purple-100 text-purple-800' },
    { id: 'Discussion', label: 'Discussion', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'Negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
    { id: 'Won', label: 'Won', color: 'bg-green-100 text-green-800' },
    { id: 'Lost', label: 'Lost', color: 'bg-red-100 text-red-800' },
  ]

  useEffect(() => {
    fetchLead()
    fetchLeads()
    fetchLabels()
    // Fetch contacts when lead is loaded
    if (id) {
      fetchContacts()
    }
  }, [id])

  async function fetchEmployees() {
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

  async function fetchTasks() {
    try {
      const response = await tasksAPI.getAll({ company_id: companyId, lead_id: id })
      if (response.data.success) {
        setTasks(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setTasks([])
    }
  }

  async function fetchNotes() {
    try {
      const response = await notesAPI.getAll({ company_id: companyId, lead_id: id })
      if (response.data.success) {
        const raw = response.data.data || []
        const transformed = raw.map(n => {
          let parsed = null
          if (typeof n.content === 'string' && n.content.trim().startsWith('{')) {
            try {
              parsed = JSON.parse(n.content)
            } catch {
              parsed = null
            }
          }
          return {
            ...n,
            _description: parsed?.description ?? (n.content || ''),
            _meta: parsed ? parsed : null
          }
        })
        setNotes(transformed)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      setNotes([])
    }
  }

  useEffect(() => {
    if (companyId) {
      fetchLabels()
    }
  }, [companyId])

  const normalizeLeadLabels = (raw) => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw.map(String).map(s => s.trim()).filter(Boolean)
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed.map(String).map(s => s.trim()).filter(Boolean)
      } catch {
        // ignore
      }
      return raw.split(',').map(s => s.trim()).filter(Boolean)
    }
    return []
  }

  const getLabelByName = (labelName) => {
    const name = (labelName || '').toString().trim()
    if (!name) return null
    return availableLabels.find(l => (l?.name || '').toLowerCase() === name.toLowerCase()) || null
  }

  const getLabelChipStyle = (labelColor) => {
    const color = (labelColor || '').toString().trim()
    if (!color) return { backgroundColor: '#f3f4f6', color: '#374151' }
    if (color.startsWith('#') && color.length === 7) {
      return { backgroundColor: `${color}20`, color }
    }
    return { backgroundColor: color, color: '#111827' }
  }

  useEffect(() => {
    if (lead && activeTab === 'estimates') {
      fetchEstimates()
    } else if (lead && activeTab === 'proposals') {
      fetchProposals()
    } else if (lead && activeTab === 'contracts') {
      fetchContracts()
    } else if (lead && activeTab === 'files') {
      fetchFiles()
    } else if (lead && activeTab === 'contacts') {
      fetchContacts()
    } else if (lead && activeTab === 'overview') {
      // Fetch contacts when Overview tab is active
      fetchContacts()
      fetchEvents()
      fetchTasks()
      fetchNotes()
    }
  }, [lead, activeTab, id])

  // Fetch events when currentMonth changes or on initial load for overview
  useEffect(() => {
    if (activeTab === 'overview' && companyId) {
      fetchEvents()
    }
  }, [currentMonth, companyId, activeTab])

  const fetchLead = async () => {
    try {
      setLoading(true)
      const response = await leadsAPI.getById(id, { company_id: companyId })
      if (response.data.success) {
        const leadData = response.data.data
        setLead({
          id: leadData.id,
          personName: leadData.person_name || '',
          companyName: leadData.company_name || '',
          email: leadData.email || '',
          phone: leadData.phone || '',
          status: leadData.status || 'New',
          source: leadData.source || '',
          address: leadData.address || '',
          city: leadData.city || '',
          country: leadData.country || '',
          value: leadData.value || 0,
          probability: leadData.probability || null,
          labels: normalizeLeadLabels(leadData.labels),
          ownerName: leadData.owner_name || '',
          createdDate: leadData.created_at || '',
          notes: leadData.notes || '',
        })
      }
    } catch (error) {
      console.error('Error fetching lead:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLabels = async () => {
    try {
      const response = await leadsAPI.getAllLabels({ company_id: companyId })
      if (response.data.success) {
        const labelData = (response.data.data || []).map(item => ({
          name: item.name || item.label,
          color: item.color || '#22c55e'
        })).filter(l => l.name)
        setAvailableLabels(labelData)
      }
    } catch (error) {
      console.error('Error fetching labels:', error)
      setAvailableLabels([])
    }
  }

  const fetchLeads = async () => {
    try {
      const response = await leadsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        const fetchedLeads = response.data.data || []
        const transformedLeads = fetchedLeads.map(lead => ({
          id: lead.id,
          personName: lead.person_name || '',
          companyName: lead.company_name || '',
          status: lead.status || 'New',
          probability: lead.probability || null,
        }))
        setLeads(transformedLeads)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    }
  }

  const fetchEstimates = async () => {
    try {
      setLoadingEstimates(true)
      const response = await estimatesAPI.getAll({ lead_id: id, company_id: companyId })
      if (response.data.success) {
        setEstimates(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching estimates:', error)
      setEstimates([])
    } finally {
      setLoadingEstimates(false)
    }
  }

  const fetchProposals = async () => {
    try {
      setLoadingProposals(true)
      const response = await proposalsAPI.getAll({ lead_id: id, company_id: companyId })
      if (response.data.success) {
        setProposals(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
      setProposals([])
    } finally {
      setLoadingProposals(false)
    }
  }

  const fetchContracts = async () => {
    try {
      setLoadingContracts(true)
      const response = await contractsAPI.getAll({ lead_id: id, company_id: companyId })
      if (response.data.success) {
        setContracts(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching contracts:', error)
      setContracts([])
    } finally {
      setLoadingContracts(false)
    }
  }

  const fetchFiles = async () => {
    try {
      setLoadingFiles(true)
      const response = await documentsAPI.getAll({ lead_id: id, company_id: companyId })
      if (response.data.success) {
        setFiles(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching files:', error)
      setFiles([])
    } finally {
      setLoadingFiles(false)
    }
  }

  const fetchContacts = async () => {
    try {
      setLoadingContacts(true)
      const companyId = user?.company_id || localStorage.getItem('companyId') || 1
      const response = await contactsAPI.getAll({ lead_id: id, company_id: companyId })
      if (response.data.success) {
        setContacts(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
      setContacts([])
    } finally {
      setLoadingContacts(false)
    }
  }

  const fetchEvents = async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchEvents:', companyId)
        setEvents([])
        return
      }
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth() + 1
      console.log('LeadDetail fetchEvents - year:', year, 'month:', month, 'companyId:', companyId)
      // Fetch all company events for now - lead_id filter will work after DB migration
      const response = await eventsAPI.getAll({
        company_id: companyId,
        year,
        month
      })
      console.log('LeadDetail fetchEvents response:', response.data)
      if (response.data.success) {
        const fetchedEvents = response.data.data || []
        console.log('LeadDetail setting events:', fetchedEvents.length, 'events')
        setEvents(fetchedEvents)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    }
  }

  const filteredLeads = leads.filter(l => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'my') return true
    return true
  }).filter(l => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return l.personName?.toLowerCase().includes(query) ||
      l.companyName?.toLowerCase().includes(query)
  }).filter(l => {
    if (!probabilityFilter) return true
    return l.probability === parseInt(probabilityFilter)
  })

  const handleConvertToClient = () => {
    if (!lead) return

    setConvertFormData({
      companyName: lead.companyName || lead.personName || '',
      email: lead.email || '',
      password: '',
      address: lead.address || '',
      city: lead.city || '',
      state: lead.state || '',
      zip: lead.zip || '',
      country: lead.country || 'United States',
      phoneCountryCode: '+1',
      phoneNumber: lead.phone || '',
      website: lead.website || '',
      vatNumber: '',
      gstNumber: '',
      currency: 'USD',
      currencySymbol: '$',
      disableOnlinePayment: false,
    })
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

      const response = await leadsAPI.convertToClient(id, data, { company_id: companyId })
      if (response.data.success) {
        alert('Lead converted to client successfully!')
        setIsConvertModalOpen(false)
        navigate('/app/admin/clients')
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

  const handlePrint = () => {
    window.print()
  }

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() // Sunday = 0

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const calendarDays = getCalendarDays()

  const getEventsForDay = (day) => {
    if (!day) return []
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth() + 1
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayEvents = events.filter(event => {
      if (!event.starts_on_date) return false
      // Handle both ISO date format and simple date string
      const eventDate = event.starts_on_date.split('T')[0]
      // Filter by date and lead_id
      return eventDate === dateString && (event.lead_id === parseInt(id) || event.lead_id === id)
    })
    if (dayEvents.length > 0) {
      console.log('Events for day', day, ':', dayEvents.length, 'dateString:', dateString)
    }
    return dayEvents
  }

  const handleExportExcel = () => {
    // Export logic
    const data = {
      lead: lead,
      estimates: estimates,
      proposals: proposals,
      contracts: contracts
    }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lead-${lead?.personName}-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAddContact = async () => {
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
        status: contactFormData.status || 'Active',
        notes: contactFormData.notes?.trim() || null,
        lead_id: id ? parseInt(id) : null,
        company_id: parseInt(companyId),
      }

      await contactsAPI.create(contactData)
      alert('Contact created successfully!')
      setIsAddContactModalOpen(false)
      setContactFormData({ name: '', company: '', email: '', phone: '', contact_type: 'Client', status: 'Active', notes: '' })
      fetchContacts() // Refresh contacts list
    } catch (error) {
      console.error('Error creating contact:', error)
      alert(error.response?.data?.error || 'Failed to create contact')
    }
  }

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
        host_id: eventFormData.host_id || user?.id || null,
        lead_id: id // Associate event with this lead
      }

      const response = await eventsAPI.create(eventData, { company_id: companyId, user_id: user?.id || 1 })
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
          host_id: user?.id || null,
        })
        // Refresh events
        await fetchEvents()
      } else {
        alert(response.data.error || 'Failed to create event')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      alert(error.response?.data?.error || 'Failed to create event')
    }
  }

  const handleAddTask = () => {
    fetchEmployees()
    setTaskFormData({
      title: '',
      description: '',
      points: '1',
      assign_to: '',
      collaborators: [],
      status: 'Incomplete',
      priority: 'Medium',
      labels: [],
      start_date: new Date().toISOString().split('T')[0],
      deadline: '',
      uploaded_file: null
    })
    setIsAddTaskModalOpen(true)
  }

  const handleAddNote = () => {
    setNoteFormData({
      title: '',
      description: '',
      category: '',
      labels: [],
      color: '#3b82f6',
      file: null
    })
    setIsAddNoteModalOpen(true)
  }

  const handleSaveTask = async () => {
    const title = taskFormData.title?.trim()
    if (!title) {
      alert('Title is required')
      return
    }
    if (!taskFormData.assign_to) {
      alert('Please assign task to an employee')
      return
    }

    try {
      const payload = {
        company_id: parseInt(companyId),
        title,
        description: taskFormData.description || null,
        lead_id: parseInt(id),
        related_to_type: 'lead',
        related_to: parseInt(id),
        points: taskFormData.points ? parseInt(taskFormData.points) || 1 : 1,
        assign_to: parseInt(taskFormData.assign_to) || null,
        collaborators: Array.isArray(taskFormData.collaborators) ? taskFormData.collaborators.map(v => parseInt(v)).filter(v => !isNaN(v)) : [],
        status: taskFormData.status || 'Incomplete',
        priority: taskFormData.priority || 'Medium',
        labels: Array.isArray(taskFormData.labels) ? taskFormData.labels : [],
        start_date: taskFormData.start_date || null,
        deadline: taskFormData.deadline || null,
        due_date: taskFormData.deadline || null
      }

      if (taskFormData.uploaded_file) {
        const fd = new FormData()
        Object.entries(payload).forEach(([k, v]) => {
          if (Array.isArray(v)) fd.append(k, JSON.stringify(v))
          else if (v !== null && v !== undefined) fd.append(k, v)
        })
        fd.append('file', taskFormData.uploaded_file)
        const response = await tasksAPI.createWithFile(fd)
        if (!response.data.success) {
          alert(response.data.error || 'Failed to create task')
          return
        }
      } else {
        const response = await tasksAPI.create(payload)
        if (!response.data.success) {
          alert(response.data.error || 'Failed to create task')
          return
        }
      }

      setIsAddTaskModalOpen(false)
      await fetchTasks()
    } catch (error) {
      console.error('Error creating task:', error)
      alert(error.response?.data?.error || 'Failed to create task')
    }
  }

  const handleSaveNote = async () => {
    const description = noteFormData.description?.trim()
    if (!description) {
      alert('Description is required')
      return
    }

    try {
      const content = JSON.stringify({
        description: description,
        category: noteFormData.category || '',
        labels: Array.isArray(noteFormData.labels) ? noteFormData.labels : [],
        color: noteFormData.color || ''
      })

      const payload = {
        company_id: parseInt(companyId),
        user_id: user?.id || parseInt(localStorage.getItem('userId') || 1),
        lead_id: parseInt(id),
        title: noteFormData.title || null,
        content
      }

      const response = await notesAPI.create(payload)
      if (response.data.success) {
        if (noteFormData.file) {
          try {
            const uploadFormData = new FormData()
            uploadFormData.append('company_id', companyId)
            uploadFormData.append('lead_id', id)
            uploadFormData.append('title', noteFormData.title || 'Note Attachment')
            uploadFormData.append('category', noteFormData.category || 'Note')
            uploadFormData.append('description', description)
            uploadFormData.append('file', noteFormData.file)
            await documentsAPI.create(uploadFormData)
          } catch (e) {
            console.error('Error uploading note attachment:', e)
          }
        }
        setIsAddNoteModalOpen(false)
        await fetchNotes()
      } else {
        alert(response.data.error || 'Failed to create note')
      }
    } catch (error) {
      console.error('Error creating note:', error)
      alert(error.response?.data?.error || 'Failed to create note')
    }
  }

  const handleAddReminder = () => {
    // Add reminder logic
    setIsAddReminderModalOpen(false)
    setReminderFormData({ title: '', date: '', time: '', description: '' })
  }

  const handleFollowUp = async () => {
    if (!followUpFormData.date || !followUpFormData.time) {
      alert('Please select both date and time for follow-up')
      return
    }

    try {
      // Update lead with follow-up date
      const followUpDate = `${followUpFormData.date}T${followUpFormData.time}:00`
      await leadsAPI.update(id, {
        due_followup: followUpFormData.date,
        notes: lead?.notes ? `${lead.notes}\n\nFollow-up scheduled: ${followUpDate} - ${followUpFormData.notes || ''}` : `Follow-up scheduled: ${followUpDate} - ${followUpFormData.notes || ''}`
      }, { company_id: companyId })

      // Create calendar event for follow-up
      const eventData = {
        event_name: `Follow-up: ${lead?.personName || 'Lead'}`,
        description: followUpFormData.notes || `Follow-up with ${lead?.personName || 'lead'}`,
        where: lead?.companyName || 'TBD',
        starts_on_date: followUpFormData.date,
        starts_on_time: followUpFormData.time,
        ends_on_date: followUpFormData.date,
        ends_on_time: followUpFormData.time.split(':').map((v, i) => i === 0 ? String(parseInt(v) + 1).padStart(2, '0') : v).join(':'),
        label_color: '#FF6B6B',
        status: 'Pending',
        company_id: parseInt(companyId),
        user_id: user?.id || 1,
        lead_id: id // Associate follow-up with this lead
      }

      await eventsAPI.create(eventData, { company_id: companyId, user_id: user?.id || 1 })

      alert('Follow-up scheduled successfully! It has been added to your calendar.')
      setIsFollowUpModalOpen(false)
      setFollowUpFormData({ date: '', time: '', notes: '' })
      fetchLead() // Refresh lead data
    } catch (error) {
      console.error('Error scheduling follow-up:', error)
      alert(error.response?.data?.error || 'Failed to schedule follow-up')
    }
  }

  // Estimate handlers
  const handleViewEstimate = (estimate) => {
    navigate(`/app/admin/estimates/${estimate.id}`)
  }

  const handleEditEstimate = (estimate) => {
    navigate(`/app/admin/estimates/${estimate.id}?edit=true`)
  }

  const handleDeleteEstimate = async (estimate) => {
    if (window.confirm(`Are you sure you want to delete estimate ${estimate.estimate_number || estimate.id}?`)) {
      try {
        await estimatesAPI.delete(estimate.id, { company_id: companyId })
        alert('Estimate deleted successfully!')
        fetchEstimates()
      } catch (error) {
        console.error('Error deleting estimate:', error)
        alert(error.response?.data?.error || 'Failed to delete estimate')
      }
    }
  }

  // Proposal handlers
  const handleViewProposal = (proposal) => {
    navigate(`/app/admin/proposals/${proposal.id}`)
  }

  const handleEditProposal = (proposal) => {
    navigate(`/app/admin/proposals/${proposal.id}?edit=true`)
  }

  const handleDeleteProposal = async (proposal) => {
    if (window.confirm(`Are you sure you want to delete proposal ${proposal.title || proposal.id}?`)) {
      try {
        await proposalsAPI.delete(proposal.id, { company_id: companyId })
        alert('Proposal deleted successfully!')
        fetchProposals()
      } catch (error) {
        console.error('Error deleting proposal:', error)
        alert(error.response?.data?.error || 'Failed to delete proposal')
      }
    }
  }

  // Contract handlers
  const handleViewContract = (contract) => {
    setSelectedContract(contract)
    setIsViewContractModalOpen(true)
  }

  const handleEditContract = (contract) => {
    // Set form data and open edit modal
    setContractFormData({
      title: contract.title || '',
      contract_date: contract.contract_date ? contract.contract_date.split('T')[0] : new Date().toISOString().split('T')[0],
      valid_until: contract.valid_until ? contract.valid_until.split('T')[0] : '',
      tax: contract.tax || '',
      second_tax: contract.second_tax || '',
      note: contract.note || '',
      amount: contract.amount || '',
      status: contract.status || 'Draft',
      client_id: contract.client_id || null,
      project_id: contract.project_id || null
    })
    setSelectedContract(contract)
    setIsAddContractModalOpen(true)
  }

  const handleDeleteContract = async (contract) => {
    if (window.confirm(`Are you sure you want to delete contract ${contract.title || contract.id}?`)) {
      try {
        await contractsAPI.delete(contract.id, { company_id: companyId })
        alert('Contract deleted successfully!')
        fetchContracts()
      } catch (error) {
        console.error('Error deleting contract:', error)
        alert(error.response?.data?.error || 'Failed to delete contract')
      }
    }
  }

  // File handlers
  const handleDownloadFile = async (file) => {
    try {
      // If file has a direct URL, open it in new tab or download
      const fileUrl = file.file_path || file.file_url || file.url
      if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
        // For external URLs, open in new tab to trigger download
        window.open(fileUrl, '_blank')
        return
      }

      // For files stored on server, use the download API
      const response = await documentsAPI.download(file.id, { company_id: companyId })

      // Check if response is a redirect (URL)
      if (response.request?.responseURL && response.request.responseURL !== response.config.url) {
        window.open(response.request.responseURL, '_blank')
        return
      }

      // Create blob and download
      const contentType = response.headers['content-type'] || 'application/octet-stream'
      const blob = new Blob([response.data], { type: contentType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', file.name || file.file_name || file.title || `file-${file.id}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)

      // Try to open the file URL directly as fallback
      const fileUrl = file.file_path || file.file_url || file.url
      if (fileUrl) {
        try {
          window.open(fileUrl, '_blank')
          return
        } catch (e) {
          console.error('Fallback download also failed:', e)
        }
      }

      alert(error.response?.data?.error || 'Failed to download file. The file may have been moved or deleted.')
    }
  }

  const handleDeleteFile = async (file) => {
    if (window.confirm(`Are you sure you want to delete file ${file.name || file.file_name}?`)) {
      try {
        await documentsAPI.delete(file.id)
        alert('File deleted successfully!')
        fetchFiles()
      } catch (error) {
        console.error('Error deleting file:', error)
        alert(error.response?.data?.error || 'Failed to delete file')
      }
    }
  }

  const handleAddFile = async () => {
    if (!fileFormData.file) {
      alert('Please select a file')
      return
    }
    if (!fileFormData.title) {
      alert('File title is required')
      return
    }

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('company_id', companyId)
      uploadFormData.append('lead_id', id)
      uploadFormData.append('title', fileFormData.title)
      uploadFormData.append('category', fileFormData.category || '')
      uploadFormData.append('description', fileFormData.description || '')
      uploadFormData.append('file', fileFormData.file)

      const response = await documentsAPI.create(uploadFormData)
      if (response.data.success) {
        alert('File uploaded successfully!')
        setIsAddFileModalOpen(false)
        setFileFormData({ title: '', category: '', description: '', file: null })
        fetchFiles()
      } else {
        alert(response.data.error || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert(error.response?.data?.error || 'Failed to upload file')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFileFormData({ ...fileFormData, file })
    }
  }

  // Add Estimate handler
  const handleAddEstimate = async () => {
    try {
      // Extract currency code from format like "USD ($)" -> "USD"
      const currencyCode = estimateFormData.currency ? estimateFormData.currency.split(' ')[0] : 'USD'

      const estimateData = {
        estimate_number: estimateFormData.estimate_number || null,
        valid_till: estimateFormData.valid_till || null,
        currency: currencyCode,
        calculate_tax: estimateFormData.calculate_tax || 'After Discount',
        description: estimateFormData.description || '',
        note: estimateFormData.note || '',
        terms: estimateFormData.terms || 'Thank you for your business.',
        discount: parseFloat(estimateFormData.discount) || 0,
        discount_type: estimateFormData.discount_type || '%',
        sub_total: parseFloat(estimateFormData.amount) || 0,
        total: parseFloat(estimateFormData.amount) || 0,
        status: (estimateFormData.status || 'draft').toString().toLowerCase(),
        lead_id: parseInt(id),
        company_id: parseInt(companyId),
        items: []
      }

      const response = await estimatesAPI.create(estimateData)
      if (response.data.success) {
        alert('Estimate created successfully!')
        setIsAddEstimateModalOpen(false)
        setEstimateFormData({
          estimate_number: '', estimate_date: new Date().toISOString().split('T')[0], valid_till: '',
          currency: 'USD', calculate_tax: 'After Discount', description: '', note: '',
          terms: 'Thank you for your business.', discount: 0, discount_type: '%', amount: '', status: 'draft', client_id: null, project_id: null, items: []
        })
        fetchEstimates()
      } else {
        alert(response.data.error || 'Failed to create estimate')
      }
    } catch (error) {
      console.error('Error creating estimate:', error)
      alert(error.response?.data?.error || 'Failed to create estimate')
    }
  }

  // Add Proposal handler
  const handleAddProposal = async () => {
    try {
      // Extract currency code from format like "USD ($)" -> "USD"
      const currencyCode = proposalFormData.currency ? proposalFormData.currency.split(' ')[0] : 'USD'

      const proposalData = {
        title: proposalFormData.title || null,
        valid_till: proposalFormData.valid_till || null,
        currency: currencyCode,
        description: proposalFormData.description || '',
        note: proposalFormData.note || '',
        terms: proposalFormData.terms || 'Thank you for your business.',
        discount: parseFloat(proposalFormData.discount) || 0,
        discount_type: proposalFormData.discount_type || '%',
        sub_total: parseFloat(proposalFormData.amount) || 0,
        total: parseFloat(proposalFormData.amount) || 0,
        status: (proposalFormData.status || 'draft').toString().toLowerCase(),
        lead_id: parseInt(id),
        company_id: parseInt(companyId),
        items: proposalFormData.items || []
      }

      const response = await proposalsAPI.create(proposalData)
      if (response.data.success) {
        const createdProposal = response.data.data
        setIsAddProposalModalOpen(false)
        setProposalFormData({
          title: '', valid_till: '', currency: 'USD', description: '', note: '',
          terms: 'Thank you for your business.', discount: 0, discount_type: '%', amount: '', status: 'draft', client_id: null, project_id: null, items: []
        })
        fetchProposals()

        // Auto-open preview after creation
        setSelectedProposal(createdProposal)
        setIsViewProposalModalOpen(true)
      } else {
        alert(response.data.error || 'Failed to create proposal')
      }
    } catch (error) {
      console.error('Error creating proposal:', error)
      alert(error.response?.data?.error || 'Failed to create proposal')
    }
  }

  // Handle View Proposal with Preview
  const handleViewProposalPreview = (proposal) => {
    setSelectedProposal(proposal)
    setIsViewProposalModalOpen(true)
  }

  // Handle Edit Proposal
  const handleEditProposalModal = (proposal) => {
    setSelectedProposal(proposal)
    setProposalFormData({
      title: proposal.title || '',
      valid_till: proposal.valid_till ? proposal.valid_till.split('T')[0] : '',
      currency: proposal.currency || 'USD',
      description: proposal.description || '',
      note: proposal.note || '',
      terms: proposal.terms || 'Thank you for your business.',
      discount: proposal.discount || 0,
      discount_type: proposal.discount_type || '%',
      amount: proposal.total || proposal.sub_total || '',
      status: proposal.status || 'draft',
      client_id: proposal.client_id,
      project_id: proposal.project_id,
      items: proposal.items || []
    })
    setIsEditProposalModalOpen(true)
  }

  // Handle Update Proposal
  const handleUpdateProposal = async () => {
    if (!selectedProposal) return

    try {
      const currencyCode = proposalFormData.currency ? proposalFormData.currency.split(' ')[0] : 'USD'

      const proposalData = {
        valid_till: proposalFormData.valid_till || null,
        currency: currencyCode,
        description: proposalFormData.description || '',
        note: proposalFormData.note || '',
        terms: proposalFormData.terms || 'Thank you for your business.',
        discount: parseFloat(proposalFormData.discount) || 0,
        discount_type: proposalFormData.discount_type || '%',
        sub_total: parseFloat(proposalFormData.amount) || 0,
        total: parseFloat(proposalFormData.amount) || 0,
        status: (proposalFormData.status || 'draft').toString().toLowerCase(),
        items: proposalFormData.items || []
      }

      const response = await proposalsAPI.update(selectedProposal.id, proposalData, { company_id: companyId })
      if (response.data.success) {
        alert('Proposal updated successfully!')
        setIsEditProposalModalOpen(false)
        setSelectedProposal(null)
        fetchProposals()
      } else {
        alert(response.data.error || 'Failed to update proposal')
      }
    } catch (error) {
      console.error('Error updating proposal:', error)
      alert(error.response?.data?.error || 'Failed to update proposal')
    }
  }

  // Handle Print Proposal
  const handlePrintProposal = () => {
    const printContent = document.getElementById('proposal-preview-content')
    if (printContent) {
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head>
            <title>Proposal ${selectedProposal?.estimate_number || ''}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .header { border-bottom: 2px solid #0073EA; padding-bottom: 20px; margin-bottom: 20px; }
              .title { font-size: 28px; font-weight: bold; color: #333; }
              .company { font-size: 14px; color: #666; }
              .section { margin-bottom: 20px; }
              .section-title { font-weight: bold; margin-bottom: 10px; color: #333; }
              .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
              .info-item { padding: 8px; background: #f9f9f9; border-radius: 4px; }
              .info-label { font-size: 12px; color: #666; }
              .info-value { font-size: 14px; font-weight: 500; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background: #f5f5f5; font-weight: bold; }
              .total-row { background: #f0f7ff; font-weight: bold; }
              .terms { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Handle Download PDF
  const handleDownloadProposalPDF = async () => {
    if (!selectedProposal) return

    try {
      // Use browser print to PDF
      handlePrintProposal()
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please use Print option instead.')
    }
  }

  // Add Contract handler
  const handleAddContract = async () => {
    try {
      const contractData = {
        title: contractFormData.title || null,
        contract_date: contractFormData.contract_date || null,
        valid_until: contractFormData.valid_until || null,
        tax: contractFormData.tax || null,
        second_tax: contractFormData.second_tax || null,
        note: contractFormData.note || '',
        amount: parseFloat(contractFormData.amount) || 0,
        status: (contractFormData.status || 'draft').toString().toLowerCase(),
        lead_id: parseInt(id),
        company_id: parseInt(companyId)
      }

      const response = await contractsAPI.create(contractData)
      if (response.data.success) {
        alert('Contract created successfully!')
        setIsAddContractModalOpen(false)
        setContractFormData({
          title: '', contract_date: new Date().toISOString().split('T')[0], valid_until: '',
          tax: '', second_tax: '', note: '', amount: '', status: 'draft', client_id: null, project_id: null
        })
        fetchContracts()
      } else {
        alert(response.data.error || 'Failed to create contract')
      }
    } catch (error) {
      console.error('Error creating contract:', error)
      alert(error.response?.data?.error || 'Failed to create contract')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-primary-text">Loading...</div>
      </div>
    )
  }


  if (!lead) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-primary-text">Lead not found</div>
      </div>
    )
  }

  const stage = leadStages.find(s => s.id === lead.status)
  const estimateRequestsCount = (estimates || []).filter(e => {
    const st = (e?.status || '').toString().toLowerCase()
    return st.includes('request')
  }).length

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] overflow-hidden bg-gray-50">
      {/* Main Content - Full Page Layout (No Left Sidebar) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/app/admin/leads')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoArrowBack size={20} />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-primary-text">{lead.personName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="flex items-center gap-2"
              >
                <IoDownload size={16} />
                <span className="hidden sm:inline">Excel</span>
              </Button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all duration-200"
              >
                <IoPrint size={16} />
                <span className="hidden sm:inline">Print</span>
              </button>
              <Button
                variant="outline"
                onClick={() => setIsFollowUpModalOpen(true)}
                className="flex items-center gap-2"
              >
                <IoCalendar size={18} />
                <span className="hidden sm:inline">Follow</span>
              </Button>
              <Button
                variant="primary"
                onClick={handleConvertToClient}
                className="flex items-center gap-2"
              >
                <IoPersonAdd size={18} />
                <span className="hidden sm:inline">Convert to client</span>
                <span className="sm:hidden">Convert</span>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
            {['Overview', 'Estimates', 'Proposals', 'Contracts', 'Files'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.toLowerCase()
                  ? 'border-primary-accent text-primary-accent'
                  : 'border-transparent text-secondary-text hover:text-primary-text'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* First Column */}
              <div className="space-y-6 lg:col-span-8">
                {/* State Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium mb-1">Estimates</p>
                        <p className="text-3xl font-bold text-blue-900">{estimates.length}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <IoDocumentText className="text-blue-600" size={24} />
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-100 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium mb-1">Estimate Requests</p>
                        <p className="text-3xl font-bold text-purple-900">{estimateRequestsCount}</p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <IoFileTray className="text-purple-600" size={24} />
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-100 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium mb-1">Proposals</p>
                        <p className="text-3xl font-bold text-green-900">{proposals.length}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <IoFileTrayFull className="text-green-600" size={24} />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Contacts */}
                <Card className="p-6 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <IoPerson className="text-gray-600" size={24} />
                      Contacts
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddContactModalOpen(true)}
                      className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                      <IoAdd size={16} />
                      Add Contact
                    </Button>
                  </div>
                  {loadingContacts ? (
                    <div className="text-center py-8 text-secondary-text">
                      <p>Loading contacts...</p>
                    </div>
                  ) : contacts.length === 0 ? (
                    <div className="text-center py-8 text-secondary-text">
                      <IoPerson size={48} className="mx-auto mb-2 text-gray-300" />
                      <p>No contacts found</p>
                      <p className="text-xs mt-2">Click "Add contact" to add a new contact for this lead</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contacts.map((contact) => (
                        <div key={contact.id || `contact-${contact.name}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-primary-accent/20 flex items-center justify-center flex-shrink-0">
                            <IoPerson className="text-primary-accent" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-primary-text truncate">{contact.name}</p>
                                {contact.company && (
                                  <p className="text-sm text-secondary-text truncate">{contact.company}</p>
                                )}
                                {contact.assigned_user_name && (
                                  <p className="text-xs text-secondary-text mt-1">Assigned to: {contact.assigned_user_name}</p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                {contact.contact_type && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">{contact.contact_type}</span>
                                )}
                                {contact.status && (
                                  <span className={`text-xs px-2 py-0.5 rounded ${contact.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    contact.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                    {contact.status}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 space-y-1">
                              {contact.email && (
                                <p className="text-sm text-secondary-text truncate flex items-center gap-1">
                                  <span className="text-xs">📧</span>
                                  {contact.email}
                                </p>
                              )}
                              {contact.phone && (
                                <p className="text-sm text-secondary-text truncate flex items-center gap-1">
                                  <span className="text-xs">📞</span>
                                  {contact.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Events */}
                <Card className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h3 className="text-lg font-semibold text-primary-text">Follow-ups</h3>
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
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddEventModalOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <IoAdd size={16} />
                        Add Follow-up
                      </Button>
                    </div>
                  </div>

                  {calendarView === 'month' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          ‹
                        </button>
                        <h4 className="font-semibold text-primary-text text-sm sm:text-base">
                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h4>
                        <button
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          ›
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-center text-xs font-medium text-secondary-text py-2">
                            {day}
                          </div>
                        ))}
                        {calendarDays.map((day, index) => {
                          const dayEvents = getEventsForDay(day)
                          const today = new Date()
                          const isToday = day &&
                            currentMonth.getFullYear() === today.getFullYear() &&
                            currentMonth.getMonth() === today.getMonth() &&
                            day === today.getDate()
                          return (
                            <div
                              key={index}
                              className={`min-h-[60px] p-1 sm:p-2 text-xs sm:text-sm border border-gray-200 rounded ${isToday ? 'bg-yellow-100 border-yellow-300' : ''
                                } ${day ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'}`}
                            >
                              {day && (
                                <>
                                  <div className="font-medium mb-1">{day}</div>
                                  {dayEvents.length > 0 && (
                                    <div className="space-y-1">
                                      {dayEvents.slice(0, 2).map((event, idx) => (
                                        <div
                                          key={idx}
                                          className="text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                                          style={{ backgroundColor: event.label_color + '20', color: event.label_color }}
                                          title={`${event.event_name}${event.lead_id ? ' (Click to view lead)' : ''}`}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            if (event.lead_id) {
                                              navigate(`/app/admin/leads/${event.lead_id}`)
                                            }
                                          }}
                                        >
                                          {event.event_name}
                                        </div>
                                      ))}
                                      {dayEvents.length > 2 && (
                                        <div className="text-[10px] text-gray-500">+{dayEvents.length - 2} more</div>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Second Column */}
              <div className="space-y-6 lg:col-span-4">
                {/* Lead Info */}
                <Card className="p-0 overflow-hidden shadow-md rounded-xl">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-2">
                      <IoLayers className="text-gray-600" size={18} />
                      <h3 className="text-sm font-semibold text-gray-800">Lead info</h3>
                    </div>
                    <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" type="button">
                      <IoEllipsisHorizontal className="text-gray-500" size={18} />
                    </button>
                  </div>

                  <div className="bg-white">
                    <div className="flex items-center gap-3 px-5 py-3">
                      <IoBriefcase className="text-gray-500" size={18} />
                      <div className="text-sm text-gray-800">
                        {lead.leadType || lead.lead_type || (lead.companyName ? 'Organization' : 'Person')}
                      </div>
                    </div>
                    <div className="border-t border-gray-100" />

                    <div className="flex items-center gap-3 px-5 py-3">
                      <IoCheckmarkCircle className="text-gray-500" size={18} />
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${stage?.color || ''}`}>{lead.status || 'New'}</Badge>
                      </div>
                    </div>
                    <div className="border-t border-gray-100" />

                    <div className="flex items-center gap-3 px-5 py-3">
                      <IoSearch className="text-gray-500" size={18} />
                      <div className="text-sm text-gray-800">{lead.source || 'N/A'}</div>
                    </div>
                    <div className="border-t border-gray-100" />

                    <div className="flex items-center gap-3 px-5 py-3">
                      <IoTime className="text-gray-500" size={18} />
                      <div className="text-sm">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          {lead.probability !== null && lead.probability !== undefined ? `${lead.probability}% Probability` : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-gray-100" />

                    <div className="flex items-center gap-3 px-5 py-3">
                      <IoPricetag className="text-gray-500" size={18} />
                      <div className="flex flex-wrap gap-2">
                        {(lead.labels || []).length === 0 ? (
                          <span className="text-sm text-gray-400">No labels</span>
                        ) : (
                          (lead.labels || []).map((labelName, idx) => {
                            const labelObj = getLabelByName(labelName)
                            const style = getLabelChipStyle(labelObj?.color)
                            return (
                              <span
                                key={`${labelName}-${idx}`}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={style}
                              >
                                {labelName}
                              </span>
                            )
                          })
                        )}
                      </div>
                    </div>
                    <div className="border-t border-gray-100" />

                    <div className="flex items-center gap-3 px-5 py-3">
                      <IoPerson className="text-gray-500" size={18} />
                      <div className="text-sm text-gray-800">{lead.ownerName || '-'}</div>
                    </div>
                    <div className="border-t border-gray-100" />

                    <div className="flex items-start gap-3 px-5 py-3">
                      <IoLocation className="text-gray-500 mt-0.5" size={18} />
                      <div className="text-sm text-gray-800">
                        {[lead.address, lead.city, lead.country].filter(Boolean).join(', ') || 'N/A'}
                      </div>
                    </div>
                    <div className="border-t border-gray-100" />

                    <div className="flex items-center gap-3 px-5 py-3">
                      <IoCall className="text-gray-500" size={18} />
                      <div className="text-sm text-gray-800">{lead.phone || '-'}</div>
                    </div>
                  </div>
                </Card>

                {/* Tasks */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-primary-text">Tasks</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddTask}
                      className="flex items-center gap-2"
                    >
                      <IoAdd size={16} />
                      Add Task
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {tasks.length === 0 ? (
                      <p className="text-sm text-secondary-text py-4 text-center">No tasks</p>
                    ) : (
                      tasks.map((task, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-sm transition-all">
                          <span>{task.title}</span>
                          <span className="text-xs text-gray-400 group-hover:text-gray-600">{task.status || 'Pending'}</span>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Notes */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-primary-text">Notes</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddNote}
                      className="flex items-center gap-2"
                    >
                      <IoAdd size={16} />
                      Add Note
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {notes.length === 0 ? (
                      <p className="text-sm text-secondary-text py-4 text-center">No notes</p>
                    ) : (
                      notes.map((note, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm border border-gray-100">
                          <p className="whitespace-pre-wrap">{note._description || note.content || ''}</p>
                          <p className="text-xs text-secondary-text mt-2">{note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Just now'}</p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {
            activeTab === 'estimates' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={() => setIsAddEstimateModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add Estimate
                  </Button>
                </div>
                <Card className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimate Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loadingEstimates ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-secondary-text">Loading...</td>
                          </tr>
                        ) : estimates.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-secondary-text">No record found.</td>
                          </tr>
                        ) : (
                          estimates.map((estimate) => (
                            <tr key={estimate.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-text font-medium">
                                {estimate.estimate_number || `EST-${estimate.id}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">
                                {estimate.created_at ? new Date(estimate.created_at).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-text">
                                ${estimate.total || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={estimate.status === 'Accepted' || estimate.status === 'Sent' ? 'success' : 'default'}>
                                  {estimate.status || 'Draft'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleViewEstimate(estimate)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="View"
                                  >
                                    <IoEye size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleEditEstimate(estimate)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <IoCreate size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEstimate(estimate)}
                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                    title="Delete"
                                  >
                                    <IoTrash size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )
          }

          {
            activeTab === 'proposals' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={() => setIsAddProposalModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add Proposal
                  </Button>
                </div>
                <Card className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loadingProposals ? (
                          <tr>
                            <td colSpan="8" className="px-6 py-8 text-center text-secondary-text">Loading...</td>
                          </tr>
                        ) : proposals.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="px-6 py-8 text-center text-secondary-text">No record found.</td>
                          </tr>
                        ) : (
                          proposals.map((proposal) => (
                            <tr key={proposal.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-text font-medium">
                                {proposal.title || proposal.estimate_number || `PROP-${proposal.id}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">
                                {proposal.created_at ? new Date(proposal.created_at).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">
                                {proposal.valid_till ? new Date(proposal.valid_till).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">
                                {proposal.sent_at ? new Date(proposal.sent_at).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">
                                {proposal.updated_at ? new Date(proposal.updated_at).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-text">
                                ${proposal.total || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={proposal.status === 'Accepted' || proposal.status === 'Sent' ? 'success' : 'default'}>
                                  {proposal.status || 'Draft'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <div className="flex gap-1 justify-end">
                                  <button
                                    onClick={() => handleViewProposalPreview(proposal)}
                                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                                    title="Preview"
                                  >
                                    <IoEye size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleEditProposalModal(proposal)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <IoCreate size={18} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedProposal(proposal)
                                      handlePrintProposal()
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Print"
                                  >
                                    <IoPrint size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProposal(proposal)}
                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                    title="Delete"
                                  >
                                    <IoTrash size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )
          }

          {
            activeTab === 'contracts' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={() => setIsAddContractModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add Contract
                  </Button>
                </div>
                <Card className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loadingContracts ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-8 text-center text-secondary-text">Loading...</td>
                          </tr>
                        ) : contracts.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-8 text-center text-secondary-text">No record found.</td>
                          </tr>
                        ) : (
                          contracts.map((contract) => (
                            <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-text">
                                {contract.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-text font-medium">
                                {contract.title || `Contract ${contract.id}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">
                                {contract.contract_date ? new Date(contract.contract_date).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">
                                {contract.valid_until ? new Date(contract.valid_until).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-text">
                                ${contract.amount || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={contract.status === 'Active' ? 'success' : 'default'}>
                                  {contract.status || 'Pending'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleViewContract(contract)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="View"
                                  >
                                    <IoEye size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleEditContract(contract)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <IoCreate size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteContract(contract)}
                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                    title="Delete"
                                  >
                                    <IoTrash size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )
          }

          {
            activeTab === 'files' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={() => setIsAddFileModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add File
                  </Button>
                </div>
                <Card className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loadingFiles ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-secondary-text">Loading...</td>
                          </tr>
                        ) : files.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-secondary-text">No record found.</td>
                          </tr>
                        ) : (
                          files.map((file) => (
                            <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-text">
                                {file.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <IoDocumentText size={20} className="text-primary-accent" />
                                  <span className="text-sm text-primary-text font-medium">{file.title || file.name || file.file_name || `File ${file.id}`}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">
                                {file.size || (file.file_size ? `${(file.file_size / 1024).toFixed(2)} KB` : '-')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">
                                {file.created_at ? new Date(file.created_at).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleDownloadFile(file)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Download"
                                  >
                                    <IoDownload size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFile(file)}
                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                    title="Delete"
                                  >
                                    <IoTrash size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )
          }
        </div >
      </div >

      {/* Right Sidebar - HIDDEN (removed for full-width tables) */}
      < div className="hidden" >
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between lg:hidden">
            <h3 className="text-lg font-semibold text-primary-text">Lead Info</h3>
            <button
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Lead Info */}
          <div>
            <h3 className="text-sm font-semibold text-primary-text mb-3">Lead Info</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-secondary-text">Organization</label>
                <p className="text-sm text-primary-text mt-1">{lead.companyName || '-'}</p>
              </div>
              <div>
                <label className="text-xs text-secondary-text">Status</label>
                <div className="mt-1">
                  <Badge className={`text-xs ${stage?.color || ''}`}>
                    {lead.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-xs text-secondary-text">Source</label>
                <p className="text-sm text-primary-text mt-1">{lead.source || 'Elsewhere'}</p>
              </div>
              <div>
                <label className="text-xs text-secondary-text">Add Label</label>
                <button className="mt-1 text-xs text-primary-accent hover:underline">+ Add Label</button>
              </div>
              <div>
                <label className="text-xs text-secondary-text">Manager</label>
                <p className="text-sm text-primary-text mt-1">{lead.ownerName || 'Demo'}</p>
                <button className="mt-1 text-xs text-primary-accent hover:underline">+ Add Managers</button>
              </div>
              <div>
                <label className="text-xs text-secondary-text">Country</label>
                <p className="text-sm text-primary-text mt-1">{lead.country || 'Botswana'}</p>
              </div>
              <div>
                <label className="text-xs text-secondary-text">Phone</label>
                <p className="text-sm text-primary-text mt-1">{lead.phone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-primary-text">Tasks</h3>
              <button
                onClick={handleAddTask}
                className="text-xs text-primary-accent hover:underline flex items-center gap-1"
              >
                <IoAdd size={14} />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-xs text-secondary-text">No tasks</p>
              ) : (
                tasks.map((task, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                    {task.title}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-primary-text">Notes</h3>
              <button
                onClick={handleAddNote}
                className="text-xs text-primary-accent hover:underline flex items-center gap-1"
              >
                <IoAdd size={14} />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {notes.length === 0 ? (
                <p className="text-xs text-secondary-text">No notes</p>
              ) : (
                notes.map((note, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                    {note._description || note.content || ''}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reminders */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-primary-text">Reminders (Private)</h3>
              <button
                onClick={() => setIsAddReminderModalOpen(true)}
                className="text-xs text-primary-accent hover:underline flex items-center gap-1"
              >
                <IoAdd size={14} />
                Add reminder
              </button>
            </div>
            <div className="space-y-2">
              {reminders.length === 0 ? (
                <p className="text-xs text-secondary-text">No reminders</p>
              ) : (
                reminders.map((reminder, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                    {reminder.title}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div >

      {/* Toggle Right Sidebar Button - REMOVED (sidebar hidden) */}

      {/* Modals - Same as before */}
      {/* Add Contact Modal */}
      <Modal
        isOpen={isAddContactModalOpen}
        onClose={() => {
          setIsAddContactModalOpen(false)
          setContactFormData({ name: '', company: '', email: '', phone: '', contact_type: 'Client', status: 'Active', notes: '' })
        }}
        title="Add Contact"
      >
        <div className="space-y-4">
          <Input
            label="Name *"
            value={contactFormData.name}
            onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
            placeholder="Enter contact name"
            required
          />
          <Input
            label="Company"
            value={contactFormData.company}
            onChange={(e) => setContactFormData({ ...contactFormData, company: e.target.value })}
            placeholder="Enter company name"
          />
          <Input
            label="Email"
            type="email"
            value={contactFormData.email}
            onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
            placeholder="Enter email address"
          />
          <Input
            label="Phone"
            value={contactFormData.phone}
            onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
            placeholder="Enter phone number"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-1">Contact Type</label>
              <select
                value={contactFormData.contact_type}
                onChange={(e) => setContactFormData({ ...contactFormData, contact_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent"
              >
                <option value="Client">Client</option>
                <option value="Vendor">Vendor</option>
                <option value="Partner">Partner</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-1">Status</label>
              <select
                value={contactFormData.status}
                onChange={(e) => setContactFormData({ ...contactFormData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-1">Notes</label>
            <textarea
              value={contactFormData.notes}
              onChange={(e) => setContactFormData({ ...contactFormData, notes: e.target.value })}
              placeholder="Enter any additional notes"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddContactModalOpen(false)
                setContactFormData({ name: '', company: '', email: '', phone: '', contact_type: 'Client', status: 'Active', notes: '' })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddContact} className="flex-1">
              Add Contact
            </Button>
          </div>
        </div>
      </Modal>

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
            host_id: user?.id || null,
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
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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
                  host_id: user?.id || null,
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

      {/* Add Task Modal (Tasks menu style) */}
      <RightSideModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Add Task"
        width="800px"
      >
        <div className="space-y-0 pb-4">
          <FormSection title="Task Details">
            <FormRow label="Title" required>
              <FormInput
                value={taskFormData.title || ''}
                onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                placeholder="Enter task title"
                required
              />
            </FormRow>

            <FormRow label="Description">
              <RichTextEditor
                value={taskFormData.description || ''}
                onChange={(content) => setTaskFormData({ ...taskFormData, description: content })}
                placeholder="Enter task description"
              />
            </FormRow>

            <FormRow label="Points">
              <FormInput
                type="number"
                value={taskFormData.points || '1'}
                onChange={(e) => setTaskFormData({ ...taskFormData, points: e.target.value })}
                placeholder="Task points"
                min="1"
              />
            </FormRow>
          </FormSection>

          <FormSection title="Assignment & Status">
            <FormRow label="Assign To" required>
              <FormSelect
                value={taskFormData.assign_to || ''}
                onChange={(e) => setTaskFormData({ ...taskFormData, assign_to: e.target.value })}
                required
              >
                <option value="">-- Select Employee --</option>
                {employees.map(emp => (
                  <option key={emp.user_id || emp.id} value={emp.user_id || emp.id}>
                    {emp.name || emp.email}
                  </option>
                ))}
              </FormSelect>
            </FormRow>

            <FormRow label="Collaborators">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[50px]">
                  {(taskFormData.collaborators || []).length > 0 ? (
                    (taskFormData.collaborators || []).map((collabId) => {
                      const collab = employees.find(e => parseInt(e.user_id || e.id) === parseInt(collabId))
                      return collab ? (
                        <span key={collabId} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-accent/10 text-primary-accent rounded-full text-sm">
                          {collab.name || collab.email}
                          <button
                            type="button"
                            onClick={() => setTaskFormData({ ...taskFormData, collaborators: (taskFormData.collaborators || []).filter(v => parseInt(v) !== parseInt(collabId)) })}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ) : null
                    })
                  ) : (
                    <span className="text-gray-400 text-sm">No collaborators added</span>
                  )}
                </div>
                <FormSelect
                  onChange={(e) => {
                    const empId = parseInt(e.target.value)
                    if (empId && !(taskFormData.collaborators || []).map(c => parseInt(c)).includes(empId)) {
                      setTaskFormData({ ...taskFormData, collaborators: [...(taskFormData.collaborators || []), empId] })
                    }
                    e.target.value = ''
                  }}
                >
                  <option value="">+ Add Collaborator</option>
                  {employees
                    .filter(emp => {
                      const empId = parseInt(emp.user_id || emp.id)
                      return empId !== parseInt(taskFormData.assign_to) && !(taskFormData.collaborators || []).map(c => parseInt(c)).includes(empId)
                    })
                    .map(emp => (
                      <option key={emp.user_id || emp.id} value={emp.user_id || emp.id}>
                        {emp.name || emp.email}
                      </option>
                    ))}
                </FormSelect>
              </div>
            </FormRow>

            <FormRow label="Status">
              <FormSelect
                value={taskFormData.status || 'Incomplete'}
                onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value })}
              >
                <option value="Incomplete">To do</option>
                <option value="Doing">In progress</option>
                <option value="Done">Done</option>
              </FormSelect>
            </FormRow>

            <FormRow label="Priority">
              <FormSelect
                value={taskFormData.priority || 'Medium'}
                onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </FormSelect>
            </FormRow>
          </FormSection>

          <FormSection title="Additional Info" last>
            <FormRow label="Labels">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[50px]">
                  {(taskFormData.labels || []).length > 0 ? (
                    (taskFormData.labels || []).map((labelName, idx) => {
                      const labelObj = getLabelByName(labelName)
                      const style = getLabelChipStyle(labelObj?.color)
                      return (
                        <span key={`${labelName}-${idx}`} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={style}>
                          {labelName}
                          <button
                            type="button"
                            onClick={() => setTaskFormData({ ...taskFormData, labels: (taskFormData.labels || []).filter((_, i) => i !== idx) })}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      )
                    })
                  ) : (
                    <span className="text-gray-400 text-sm">No labels added</span>
                  )}
                </div>
                <FormSelect
                  onChange={(e) => {
                    if (e.target.value && !(taskFormData.labels || []).includes(e.target.value)) {
                      setTaskFormData({ ...taskFormData, labels: [...(taskFormData.labels || []), e.target.value] })
                    }
                    e.target.value = ''
                  }}
                >
                  <option value="">+ Add Label</option>
                  {availableLabels
                    .filter(l => !(taskFormData.labels || []).includes(l.name))
                    .map(l => (
                      <option key={l.name} value={l.name}>{l.name}</option>
                    ))}
                </FormSelect>
              </div>
            </FormRow>

            <FormRow label="Start Date">
              <FormInput
                type="date"
                value={taskFormData.start_date || ''}
                onChange={(e) => setTaskFormData({ ...taskFormData, start_date: e.target.value })}
              />
            </FormRow>

            <FormRow label="Deadline">
              <FormInput
                type="date"
                value={taskFormData.deadline || ''}
                onChange={(e) => setTaskFormData({ ...taskFormData, deadline: e.target.value })}
              />
            </FormRow>

            <FormRow label="Attachment" last>
              <input
                type="file"
                onChange={(e) => setTaskFormData({ ...taskFormData, uploaded_file: e.target.files?.[0] || null })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
              />
            </FormRow>
          </FormSection>

          <FormActions>
            <Button variant="outline" onClick={() => setIsAddTaskModalOpen(false)} className="px-6">
              Close
            </Button>
            <Button variant="primary" onClick={handleSaveTask} className="px-6">
              Save Task
            </Button>
          </FormActions>
        </div>
      </RightSideModal>

      {/* Add Note Modal (screenshot-like) */}
      <Modal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        title="Add note"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            value={noteFormData.title}
            onChange={(e) => setNoteFormData({ ...noteFormData, title: e.target.value })}
            placeholder="Title"
          />

          <textarea
            value={noteFormData.description}
            onChange={(e) => setNoteFormData({ ...noteFormData, description: e.target.value })}
            rows={10}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
            placeholder="Description..."
          />

          <select
            value={noteFormData.category}
            onChange={(e) => setNoteFormData({ ...noteFormData, category: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
          >
            <option value="">- Category -</option>
            <option value="General">General</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Meeting">Meeting</option>
            <option value="Call">Call</option>
            <option value="Other">Other</option>
          </select>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Labels</label>
            <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
              {(noteFormData.labels || []).length === 0 ? (
                <span className="text-sm text-gray-400">No labels</span>
              ) : (
                (noteFormData.labels || []).map((labelName, idx) => {
                  const labelObj = getLabelByName(labelName)
                  const style = getLabelChipStyle(labelObj?.color)
                  return (
                    <span key={`${labelName}-${idx}`} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={style}>
                      {labelName}
                      <button
                        type="button"
                        onClick={() => setNoteFormData({ ...noteFormData, labels: (noteFormData.labels || []).filter((_, i) => i !== idx) })}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  )
                })
              )}
            </div>
            <select
              value=""
              onChange={(e) => {
                const val = e.target.value
                if (val && !(noteFormData.labels || []).includes(val)) {
                  setNoteFormData({ ...noteFormData, labels: [...(noteFormData.labels || []), val] })
                }
                e.target.value = ''
              }}
              className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="">+ Add Label</option>
              {availableLabels
                .filter(l => !(noteFormData.labels || []).includes(l.name))
                .map(l => (
                  <option key={l.name} value={l.name}>{l.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={noteFormData.color}
                onChange={(e) => setNoteFormData({ ...noteFormData, color: e.target.value })}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <Input
                value={noteFormData.color}
                onChange={(e) => setNoteFormData({ ...noteFormData, color: e.target.value })}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <span className="text-sm text-gray-700">Upload File</span>
              <input
                type="file"
                onChange={(e) => setNoteFormData({ ...noteFormData, file: e.target.files?.[0] || null })}
                className="hidden"
              />
            </label>
            {noteFormData.file && (
              <span className="text-sm text-gray-600">{noteFormData.file.name}</span>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setIsAddNoteModalOpen(false)} className="flex-1">
              Close
            </Button>
            <Button variant="primary" onClick={handleSaveNote} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal
        isOpen={isAddReminderModalOpen}
        onClose={() => setIsAddReminderModalOpen(false)}
        title="Add Reminder"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={reminderFormData.title}
            onChange={(e) => setReminderFormData({ ...reminderFormData, title: e.target.value })}
            placeholder="Enter reminder title"
          />
          <Input
            label="Date"
            type="date"
            value={reminderFormData.date}
            onChange={(e) => setReminderFormData({ ...reminderFormData, date: e.target.value })}
          />
          <Input
            label="Time"
            type="time"
            value={reminderFormData.time}
            onChange={(e) => setReminderFormData({ ...reminderFormData, time: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Description</label>
            <textarea
              value={reminderFormData.description}
              onChange={(e) => setReminderFormData({ ...reminderFormData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter description"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddReminderModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddReminder} className="flex-1">
              Add Reminder
            </Button>
          </div>
        </div>
      </Modal>

      {/* Follow-up Modal */}
      <Modal
        isOpen={isFollowUpModalOpen}
        onClose={() => {
          setIsFollowUpModalOpen(false)
          setFollowUpFormData({ date: '', time: '', notes: '' })
        }}
        title="Schedule Follow-up"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This follow-up will be automatically added to your calendar.
            </p>
          </div>
          <Input
            label="Follow-up Date"
            type="date"
            value={followUpFormData.date}
            onChange={(e) => setFollowUpFormData({ ...followUpFormData, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          <Input
            label="Follow-up Time"
            type="time"
            value={followUpFormData.time}
            onChange={(e) => setFollowUpFormData({ ...followUpFormData, time: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Notes</label>
            <textarea
              value={followUpFormData.notes}
              onChange={(e) => setFollowUpFormData({ ...followUpFormData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Add any notes about this follow-up..."
            />
          </div>
          {lead?.due_followup && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Current Follow-up:</strong> {new Date(lead.due_followup).toLocaleDateString()}
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsFollowUpModalOpen(false)
                setFollowUpFormData({ date: '', time: '', notes: '' })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleFollowUp} className="flex-1">
              Schedule Follow-up
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add File Modal */}
      <Modal
        isOpen={isAddFileModalOpen}
        onClose={() => {
          setIsAddFileModalOpen(false)
          setFileFormData({ title: '', category: '', description: '', file: null })
        }}
        title="Add File"
      >
        <div className="space-y-4">
          <Input
            label="File Title *"
            value={fileFormData.title}
            onChange={(e) => setFileFormData({ ...fileFormData, title: e.target.value })}
            placeholder="Enter file title"
            required
          />
          <Input
            label="Category"
            value={fileFormData.category}
            onChange={(e) => setFileFormData({ ...fileFormData, category: e.target.value })}
            placeholder="Enter category (optional)"
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Description</label>
            <textarea
              value={fileFormData.description}
              onChange={(e) => setFileFormData({ ...fileFormData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter file description (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">File *</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              required
            />
            {fileFormData.file && (
              <p className="mt-2 text-sm text-secondary-text">Selected: {fileFormData.file.name}</p>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddFileModalOpen(false)
                setFileFormData({ title: '', category: '', description: '', file: null })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddFile} className="flex-1">
              Upload File
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Estimate Modal */}
      <Modal
        isOpen={isAddEstimateModalOpen}
        onClose={() => {
          setIsAddEstimateModalOpen(false)
          setEstimateFormData({
            estimate_number: '', estimate_date: new Date().toISOString().split('T')[0], valid_till: '',
            currency: 'USD', calculate_tax: 'After Discount', description: '', note: '',
            terms: 'Thank you for your business.', discount: 0, discount_type: '%', amount: '', status: 'Draft'
          })
        }}
        title="Add Estimate"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <Input
            label="Estimate Number"
            value={estimateFormData.estimate_number}
            onChange={(e) => setEstimateFormData({ ...estimateFormData, estimate_number: e.target.value })}
            placeholder="Auto-generated if empty"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Estimate Date"
              type="date"
              value={estimateFormData.estimate_date}
              onChange={(e) => setEstimateFormData({ ...estimateFormData, estimate_date: e.target.value })}
            />
            <Input
              label="Valid Till"
              type="date"
              value={estimateFormData.valid_till}
              onChange={(e) => setEstimateFormData({ ...estimateFormData, valid_till: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Currency</label>
              <select
                value={estimateFormData.currency}
                onChange={(e) => setEstimateFormData({ ...estimateFormData, currency: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="INR (₹)">INR (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Calculate Tax</label>
              <select
                value={estimateFormData.calculate_tax}
                onChange={(e) => setEstimateFormData({ ...estimateFormData, calculate_tax: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="Before Discount">Before Discount</option>
                <option value="After Discount">After Discount</option>
              </select>
            </div>
          </div>
          <Input
            label="Amount"
            type="number"
            value={estimateFormData.amount}
            onChange={(e) => setEstimateFormData({ ...estimateFormData, amount: e.target.value })}
            placeholder="Enter total amount"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Discount"
              type="number"
              value={estimateFormData.discount}
              onChange={(e) => setEstimateFormData({ ...estimateFormData, discount: e.target.value })}
              placeholder="0"
            />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Discount Type</label>
              <select
                value={estimateFormData.discount_type}
                onChange={(e) => setEstimateFormData({ ...estimateFormData, discount_type: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="%">Percentage (%)</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Status</label>
            <select
              value={estimateFormData.status}
              onChange={(e) => setEstimateFormData({ ...estimateFormData, status: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Description</label>
            <textarea
              value={estimateFormData.description}
              onChange={(e) => setEstimateFormData({ ...estimateFormData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Note</label>
            <textarea
              value={estimateFormData.note}
              onChange={(e) => setEstimateFormData({ ...estimateFormData, note: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Note for recipient"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Terms & Conditions</label>
            <textarea
              value={estimateFormData.terms}
              onChange={(e) => setEstimateFormData({ ...estimateFormData, terms: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Terms and conditions"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddEstimateModalOpen(false)
                setEstimateFormData({
                  estimate_number: '', estimate_date: new Date().toISOString().split('T')[0], valid_till: '',
                  currency: 'USD', calculate_tax: 'After Discount', description: '', note: '',
                  terms: 'Thank you for your business.', discount: 0, discount_type: '%', amount: '', status: 'Draft'
                })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddEstimate} className="flex-1">
              Create Estimate
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Proposal Modal */}
      <Modal
        isOpen={isAddProposalModalOpen}
        onClose={() => {
          setIsAddProposalModalOpen(false)
          setProposalFormData({
            title: '', valid_till: '', currency: 'USD', description: '', note: '',
            terms: 'Thank you for your business.', discount: 0, discount_type: '%', amount: '', status: 'Draft'
          })
        }}
        title="Add Proposal"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <Input
            label="Proposal Title"
            value={proposalFormData.title}
            onChange={(e) => setProposalFormData({ ...proposalFormData, title: e.target.value })}
            placeholder="Enter proposal title"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valid Till"
              type="date"
              value={proposalFormData.valid_till}
              onChange={(e) => setProposalFormData({ ...proposalFormData, valid_till: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Currency</label>
              <select
                value={proposalFormData.currency}
                onChange={(e) => setProposalFormData({ ...proposalFormData, currency: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="INR (₹)">INR (₹)</option>
              </select>
            </div>
          </div>
          <Input
            label="Amount"
            type="number"
            value={proposalFormData.amount}
            onChange={(e) => setProposalFormData({ ...proposalFormData, amount: e.target.value })}
            placeholder="Enter total amount"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Discount"
              type="number"
              value={proposalFormData.discount}
              onChange={(e) => setProposalFormData({ ...proposalFormData, discount: e.target.value })}
              placeholder="0"
            />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Discount Type</label>
              <select
                value={proposalFormData.discount_type}
                onChange={(e) => setProposalFormData({ ...proposalFormData, discount_type: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="%">Percentage (%)</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Status</label>
            <select
              value={proposalFormData.status}
              onChange={(e) => setProposalFormData({ ...proposalFormData, status: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Description</label>
            <textarea
              value={proposalFormData.description}
              onChange={(e) => setProposalFormData({ ...proposalFormData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Note</label>
            <textarea
              value={proposalFormData.note}
              onChange={(e) => setProposalFormData({ ...proposalFormData, note: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Note for recipient"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Terms & Conditions</label>
            <textarea
              value={proposalFormData.terms}
              onChange={(e) => setProposalFormData({ ...proposalFormData, terms: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Terms and conditions"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddProposalModalOpen(false)
                setProposalFormData({
                  title: '', valid_till: '', currency: 'USD', description: '', note: '',
                  terms: 'Thank you for your business.', discount: 0, discount_type: '%', amount: '', status: 'Draft'
                })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddProposal} className="flex-1">
              Create Proposal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Contract Modal */}
      <Modal
        isOpen={isAddContractModalOpen}
        onClose={() => {
          setIsAddContractModalOpen(false)
          setContractFormData({
            title: '', contract_date: new Date().toISOString().split('T')[0], valid_until: '',
            tax: '', second_tax: '', note: '', amount: '', status: 'Draft'
          })
        }}
        title="Add Contract"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <Input
            label="Contract Title"
            value={contractFormData.title}
            onChange={(e) => setContractFormData({ ...contractFormData, title: e.target.value })}
            placeholder="Enter contract title"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contract Date"
              type="date"
              value={contractFormData.contract_date}
              onChange={(e) => setContractFormData({ ...contractFormData, contract_date: e.target.value })}
            />
            <Input
              label="Valid Until"
              type="date"
              value={contractFormData.valid_until}
              onChange={(e) => setContractFormData({ ...contractFormData, valid_until: e.target.value })}
            />
          </div>
          <Input
            label="Amount"
            type="number"
            value={contractFormData.amount}
            onChange={(e) => setContractFormData({ ...contractFormData, amount: e.target.value })}
            placeholder="Enter contract amount"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">TAX</label>
              <select
                value={contractFormData.tax}
                onChange={(e) => setContractFormData({ ...contractFormData, tax: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="">-</option>
                <option value="GST 10%">GST 10%</option>
                <option value="CGST 18%">CGST 18%</option>
                <option value="VAT 10%">VAT 10%</option>
                <option value="IGST 10%">IGST 10%</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Second TAX</label>
              <select
                value={contractFormData.second_tax}
                onChange={(e) => setContractFormData({ ...contractFormData, second_tax: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="">-</option>
                <option value="GST 10%">GST 10%</option>
                <option value="CGST 18%">CGST 18%</option>
                <option value="VAT 10%">VAT 10%</option>
                <option value="IGST 10%">IGST 10%</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Status</label>
            <select
              value={contractFormData.status}
              onChange={(e) => setContractFormData({ ...contractFormData, status: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Note</label>
            <textarea
              value={contractFormData.note}
              onChange={(e) => setContractFormData({ ...contractFormData, note: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter note"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddContractModalOpen(false)
                setContractFormData({
                  title: '', contract_date: new Date().toISOString().split('T')[0], valid_until: '',
                  tax: '', second_tax: '', note: '', amount: '', status: 'Draft'
                })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddContract} className="flex-1">
              {selectedContract ? 'Update Contract' : 'Create Contract'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Contract Modal */}
      <Modal
        isOpen={isViewContractModalOpen}
        onClose={() => {
          setIsViewContractModalOpen(false)
          setSelectedContract(null)
        }}
        title="Contract Details"
        size="lg"
      >
        {selectedContract && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-text">Contract Number</p>
                <p className="text-primary-text font-medium">{selectedContract.contract_number || `#${selectedContract.id}`}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-text">Title</p>
                <p className="text-primary-text font-medium">{selectedContract.title || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-text">Contract Date</p>
                <p className="text-primary-text">{selectedContract.contract_date ? new Date(selectedContract.contract_date).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-text">Valid Until</p>
                <p className="text-primary-text">{selectedContract.valid_until ? new Date(selectedContract.valid_until).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-text">Amount</p>
                <p className="text-primary-text font-medium">${selectedContract.amount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-text">Status</p>
                <Badge variant={selectedContract.status === 'Accepted' ? 'success' : 'default'}>
                  {selectedContract.status || 'Draft'}
                </Badge>
              </div>
              {selectedContract.tax && (
                <div>
                  <p className="text-sm text-secondary-text">Tax</p>
                  <p className="text-primary-text">{selectedContract.tax}</p>
                </div>
              )}
              {selectedContract.second_tax && (
                <div>
                  <p className="text-sm text-secondary-text">Second Tax</p>
                  <p className="text-primary-text">{selectedContract.second_tax}</p>
                </div>
              )}
            </div>
            {selectedContract.note && (
              <div>
                <p className="text-sm text-secondary-text">Note</p>
                <p className="text-primary-text">{selectedContract.note}</p>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewContractModalOpen(false)
                  setSelectedContract(null)
                }}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsViewContractModalOpen(false)
                  handleEditContract(selectedContract)
                }}
                className="flex-1"
              >
                Edit Contract
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Convert to Client Modal */}
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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

      {/* Proposal Preview Modal - ICRM Style */}
      <Modal
        isOpen={isViewProposalModalOpen}
        onClose={() => {
          setIsViewProposalModalOpen(false)
          setSelectedProposal(null)
        }}
        title=""
        size="xl"
      >
        {selectedProposal && (
          <div className="space-y-4">
            {/* Header with Actions */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-primary-text">
                  {selectedProposal.title || selectedProposal.estimate_number || `Proposal #${selectedProposal.id}`}
                </h2>
                <p className="text-sm text-secondary-text mt-1">
                  Created: {selectedProposal.created_at ? new Date(selectedProposal.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Template Selector */}
                <select
                  value={proposalTemplate}
                  onChange={(e) => setProposalTemplate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
                >
                  <option value="professional">Professional Template</option>
                  <option value="modern">Modern Template</option>
                  <option value="minimal">Minimal Template</option>
                  <option value="corporate">Corporate Template</option>
                </select>
                <Button
                  variant="outline"
                  onClick={() => handleEditProposalModal(selectedProposal)}
                  className="flex items-center gap-2"
                >
                  <IoCreate size={16} />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrintProposal}
                  className="flex items-center gap-2"
                >
                  <IoPrint size={16} />
                  Print
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDownloadProposalPDF}
                  className="flex items-center gap-2"
                >
                  <IoDownload size={16} />
                  PDF
                </Button>
              </div>
            </div>

            {/* Proposal Preview Content */}
            <div id="proposal-preview-content" className={`bg-white rounded-lg border border-gray-200 p-8 ${proposalTemplate === 'modern' ? 'bg-gradient-to-br from-blue-50 to-white' :
              proposalTemplate === 'corporate' ? 'bg-gray-50' : ''
              }`}>
              {/* Template Header */}
              <div className={`header mb-6 pb-4 ${proposalTemplate === 'professional' ? 'border-b-2 border-primary-accent' :
                proposalTemplate === 'modern' ? 'border-b-4 border-gradient-to-r from-blue-500 to-purple-500' :
                  proposalTemplate === 'corporate' ? 'border-b-2 border-gray-800' :
                    'border-b border-gray-300'
                }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className={`title text-3xl font-bold ${proposalTemplate === 'corporate' ? 'text-gray-900' : 'text-primary-accent'
                      }`}>PROPOSAL</h1>
                    <p className="company text-lg text-gray-600 mt-1">{selectedProposal.company_name || 'Your Company'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">{selectedProposal.estimate_number || `#${selectedProposal.id}`}</p>
                    <Badge variant={selectedProposal.status === 'Accepted' || selectedProposal.status === 'Sent' ? 'success' : 'default'} className="mt-2">
                      {(selectedProposal.status || 'Draft').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Lead/Client Info */}
              <div className="section mb-6">
                <h3 className="section-title text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Proposal For</h3>
                <div className="info-grid grid grid-cols-2 gap-4">
                  <div className="info-item bg-gray-50 p-4 rounded-lg">
                    <p className="info-label text-xs text-gray-500">Lead Name</p>
                    <p className="info-value text-base font-semibold text-gray-800">{lead?.personName || 'N/A'}</p>
                  </div>
                  <div className="info-item bg-gray-50 p-4 rounded-lg">
                    <p className="info-label text-xs text-gray-500">Company</p>
                    <p className="info-value text-base font-semibold text-gray-800">{lead?.companyName || 'N/A'}</p>
                  </div>
                  <div className="info-item bg-gray-50 p-4 rounded-lg">
                    <p className="info-label text-xs text-gray-500">Email</p>
                    <p className="info-value text-base font-semibold text-gray-800">{lead?.email || 'N/A'}</p>
                  </div>
                  <div className="info-item bg-gray-50 p-4 rounded-lg">
                    <p className="info-label text-xs text-gray-500">Valid Until</p>
                    <p className="info-value text-base font-semibold text-gray-800">
                      {selectedProposal.valid_till ? new Date(selectedProposal.valid_till).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedProposal.description && (
                <div className="section mb-6">
                  <h3 className="section-title text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedProposal.description}</p>
                  </div>
                </div>
              )}

              {/* Items Table */}
              {selectedProposal.items && selectedProposal.items.length > 0 && (
                <div className="section mb-6">
                  <h3 className="section-title text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Items</h3>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-200">Item</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-200">Description</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border border-gray-200">Qty</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border border-gray-200">Unit Price</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border border-gray-200">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProposal.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-800 border border-gray-200">{item.item_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 border border-gray-200">{item.description || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 text-center border border-gray-200">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 text-right border border-gray-200">${item.unit_price || 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 text-right font-medium border border-gray-200">${item.amount || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totals */}
              <div className="section mb-6">
                <div className="flex justify-end">
                  <div className="w-80 space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-800">${selectedProposal.sub_total || 0}</span>
                    </div>
                    {selectedProposal.discount > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Discount ({selectedProposal.discount}{selectedProposal.discount_type})</span>
                        <span className="font-medium text-red-600">-${selectedProposal.discount_amount || 0}</span>
                      </div>
                    )}
                    {selectedProposal.tax_amount > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium text-gray-800">${selectedProposal.tax_amount || 0}</span>
                      </div>
                    )}
                    <div className={`total-row flex justify-between py-3 rounded-lg px-4 ${proposalTemplate === 'professional' ? 'bg-primary-accent/10' :
                      proposalTemplate === 'modern' ? 'bg-blue-100' :
                        proposalTemplate === 'corporate' ? 'bg-gray-200' :
                          'bg-gray-100'
                      }`}>
                      <span className="text-lg font-bold text-gray-800">Total</span>
                      <span className="text-xl font-bold text-primary-accent">${selectedProposal.total || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note */}
              {selectedProposal.note && (
                <div className="section mb-6">
                  <h3 className="section-title text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Note</h3>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-gray-700">{selectedProposal.note}</p>
                  </div>
                </div>
              )}

              {/* Terms */}
              {selectedProposal.terms && (
                <div className="terms bg-gray-50 p-4 rounded-lg mt-6">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Terms & Conditions</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedProposal.terms}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewProposalModalOpen(false)
                  setSelectedProposal(null)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Proposal Modal */}
      <Modal
        isOpen={isEditProposalModalOpen}
        onClose={() => {
          setIsEditProposalModalOpen(false)
          setSelectedProposal(null)
        }}
        title="Edit Proposal"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={proposalFormData.title}
            onChange={(e) => setProposalFormData({ ...proposalFormData, title: e.target.value })}
            placeholder="Enter proposal title"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valid Till"
              type="date"
              value={proposalFormData.valid_till}
              onChange={(e) => setProposalFormData({ ...proposalFormData, valid_till: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Currency</label>
              <select
                value={proposalFormData.currency}
                onChange={(e) => setProposalFormData({ ...proposalFormData, currency: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Description</label>
            <textarea
              value={proposalFormData.description}
              onChange={(e) => setProposalFormData({ ...proposalFormData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter proposal description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              value={proposalFormData.amount}
              onChange={(e) => setProposalFormData({ ...proposalFormData, amount: e.target.value })}
              placeholder="0.00"
            />
            <div className="flex gap-2">
              <Input
                label="Discount"
                type="number"
                value={proposalFormData.discount}
                onChange={(e) => setProposalFormData({ ...proposalFormData, discount: e.target.value })}
                className="flex-1"
              />
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">Type</label>
                <select
                  value={proposalFormData.discount_type}
                  onChange={(e) => setProposalFormData({ ...proposalFormData, discount_type: e.target.value })}
                  className="px-3 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="%">%</option>
                  <option value="$">$</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Status</label>
            <select
              value={proposalFormData.status}
              onChange={(e) => setProposalFormData({ ...proposalFormData, status: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Note</label>
            <textarea
              value={proposalFormData.note}
              onChange={(e) => setProposalFormData({ ...proposalFormData, note: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Additional notes..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Terms & Conditions</label>
            <textarea
              value={proposalFormData.terms}
              onChange={(e) => setProposalFormData({ ...proposalFormData, terms: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Terms and conditions..."
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditProposalModalOpen(false)
                setSelectedProposal(null)
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateProposal}
              className="flex-1"
            >
              Update Proposal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default LeadDetail

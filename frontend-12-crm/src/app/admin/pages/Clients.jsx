import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import UniqueIdBadge, { ID_PREFIXES } from '../../../components/ui/UniqueIdBadge'
import NotificationModal from '../../../components/ui/NotificationModal'
import { clientsAPI, invoicesAPI, paymentsAPI, projectsAPI, employeesAPI } from '../../../api'
import { useAuth } from '../../../context/AuthContext'
import {
  IoEye,
  IoPencil,
  IoTrashOutline,
  IoMail,
  IoPersonAdd,
  IoClose,
  IoCheckmarkCircle,
  IoGrid,
  IoSearch,
  IoPrint,
  IoDownload,
  IoPricetag,
  IoPerson,
  IoChevronUp,
  IoChevronDown,
  IoGlobe,
  IoCall,
  IoLocation,
  IoDocumentText,
  IoCash,
  IoCard,
  IoStatsChart,
  IoTrendingUp,
  IoTrendingDown,
  IoArrowForward,
  IoAdd,
  IoList,
  IoTime,
  IoCalendar,
  IoCloseCircle,
  IoBriefcaseOutline,
  IoPeople,
  IoPeopleOutline,
  IoCheckboxOutline,
  IoCalendarOutline,
  IoGridOutline,
  IoCheckmarkCircleOutline,
  IoPauseCircleOutline,
  IoCloseCircleOutline,
  IoCubeOutline,
  IoCheckmarkDoneCircleOutline,
  IoWater,
  IoSyncOutline,
  IoCafeOutline
} from 'react-icons/io5'
import BarChart from '../../../components/charts/BarChart'
import DonutChart from '../../../components/charts/DonutChart'
import LineChart from '../../../components/charts/LineChart'
import FormRow from '../../../components/ui/FormRow'

const Clients = () => {
  const { user } = useAuth()
  // Ensure companyId is always a number - recalculate when user changes
  const companyId = useMemo(() => {
    const id = user?.company_id || localStorage.getItem('companyId') || '1'
    const parsed = parseInt(id, 10)
    if (isNaN(parsed) || parsed <= 0) {
      console.warn('Invalid companyId, using default 1. User:', user, 'localStorage:', localStorage.getItem('companyId'))
      return 1
    }
    return parsed
  }, [user])

  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'clients', 'contacts'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false)
  const [isManageLabelsModalOpen, setIsManageLabelsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [createdClientData, setCreatedClientData] = useState(null)
  const [selectedClients, setSelectedClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  // FormRow import added below in separate chunk if not present, but usually we add imports at top.
  // I will check imports area first.
  const [formData, setFormData] = useState({
    // Type
    type: 'Organization',
    // Company Information
    companyName: '',
    email: '',
    password: '',
    // Owner & Managers
    ownerId: '',
    managers: [], // Array of user IDs
    // Address Details
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    // Contact Details
    phoneCountryCode: '+1',
    phoneNumber: '',
    website: '',
    // Tax & Registration
    vatNumber: '',
    gstNumber: '',
    // Classification
    clientGroups: [], // Array of strings
    labels: [], // Array of strings
    // Billing Preferences
    currency: 'USD',
    currencySymbol: '',
    disableOnlinePayment: false,
    label: '', // Legacy single label for backward compt
  })

  // Helper for multi-select (simple implementation)
  const handleMultiSelectChange = (e, field) => {
    const options = e.target.options;
    const value = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  const [contactFormData, setContactFormData] = useState({
    name: '',
    clientName: '',
    clientId: '',
    jobTitle: '',
    email: '',
    phone: '',
    isPrimary: false,
  })

  const [emailFormData, setEmailFormData] = useState({
    to: [],
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    attachments: [],
  })

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [clientContacts, setClientContacts] = useState({}) // Store contacts separately
  const [showPassword, setShowPassword] = useState(false)
  const [overviewData, setOverviewData] = useState(null) // For overview tab
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [dateRange, setDateRange] = useState('all') // For overview date filter
  const [statusFilter, setStatusFilter] = useState('') // For overview status filter
  const [ownerFilter, setOwnerFilter] = useState('') // For overview owner filter
  const [employees, setEmployees] = useState([]) // For owner dropdown
  const [allContactsList, setAllContactsList] = useState([])
  const [contactsLoading, setContactsLoading] = useState(false)
  const [labels, setLabels] = useState([])
  const [availableClientGroups, setAvailableClientGroups] = useState([])
  const [newLabel, setNewLabel] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#22c55e')

  // Advanced Filter Panel States
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'
  const [quickFilter, setQuickFilter] = useState('') // Quick filter dropdown
  const [selectedOwner, setSelectedOwner] = useState('') // Owner filter
  const [selectedGroup, setSelectedGroup] = useState('') // Client group filter
  const [selectedLabel, setSelectedLabel] = useState('') // Label filter
  const [hasDueFilter, setHasDueFilter] = useState(false) // Has due filter
  const [hasOpenProjectsFilter, setHasOpenProjectsFilter] = useState(false) // Has open projects filter
  const [myClientsFilter, setMyClientsFilter] = useState(false) // My clients filter
  const [filterSearchQuery, setFilterSearchQuery] = useState('') // Search in filter bar

  // Fetch clients on component mount
  useEffect(() => {
    console.log('useEffect triggered - companyId:', companyId, 'user:', user)
    // Only fetch if companyId is valid
    if (companyId && !isNaN(companyId) && companyId > 0) {
      console.log('Fetching clients with companyId:', companyId)
      fetchClients()
      fetchEmployees()
      fetchAllContacts()
      fetchLabels()
      fetchClientGroups()
      if (activeTab === 'overview') {
        fetchOverview()
      }
    } else {
      console.error('Invalid companyId in useEffect:', companyId)
      console.error('User:', user)
      console.error('User company_id:', user?.company_id)
      console.error('LocalStorage companyId:', localStorage.getItem('companyId'))
      console.error('Parsed companyId:', parseInt(user?.company_id || localStorage.getItem('companyId') || 1, 10))
    }
  }, [companyId, activeTab, dateRange, statusFilter, ownerFilter, user])

  // Fetch employees for owner dropdown
  const fetchEmployees = async () => {
    try {
      if (companyId && !isNaN(companyId) && companyId > 0) {
        const response = await employeesAPI.getAll({ company_id: companyId })
        if (response.data.success) {
          setEmployees(response.data.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  // Fetch labels
  const fetchLabels = async () => {
    try {
      if (companyId && !isNaN(companyId) && companyId > 0) {
        const response = await clientsAPI.getAllLabels({ company_id: companyId })
        if (response.data.success) {
          // Flatten/normalize labels if needed
          const fetchedLabels = response.data.data.map(l => ({
            name: l.label,
            color: l.color || '#22c55e',
            id: l.id
          }))
          setLabels(fetchedLabels)
        }
      }
    } catch (error) {
      console.error('Error fetching labels:', error)
    }
  }

  const fetchClientGroups = async () => {
    try {
      if (companyId && !isNaN(companyId) && companyId > 0) {
        const response = await clientsAPI.getAllGroups({ company_id: companyId })
        if (response.data.success) {
          setAvailableClientGroups(response.data.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching client groups:', error)
    }
  }

  const handleAddLabel = async () => {
    if (!newLabel.trim()) return

    try {
      const response = await clientsAPI.createLabel({
        label: newLabel.trim(),
        color: newLabelColor, // Pass color if backend supports it
        company_id: companyId
      })

      if (response.data.success) {
        setNewLabel('')
        setNewLabelColor('#22c55e')
        fetchLabels() // Refresh labels
      }
    } catch (error) {
      console.error('Error creating label:', error)
      alert(error.response?.data?.error || 'Failed to create label')
    }
  }

  const handleDeleteLabel = async (labelName) => {
    if (!confirm(`Are you sure you want to delete the label "${labelName}"?`)) return

    try {
      const response = await clientsAPI.deleteLabel(labelName, { company_id: companyId })
      if (response.data.success) {
        fetchLabels() // Refresh labels
      }
    } catch (error) {
      console.error('Error deleting label:', error)
      alert(error.response?.data?.error || 'Failed to delete label')
    }
  }

  // Fetch overview data
  const fetchOverview = async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchOverview:', companyId)
        setOverviewLoading(false)
        return
      }

      setOverviewLoading(true)
      const params = {
        company_id: companyId,
        date_range: dateRange,
        status: statusFilter || undefined,
        owner_id: ownerFilter || undefined,
      }
      const response = await clientsAPI.getOverview(params)
      if (response.data.success) {
        setOverviewData(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching overview:', error)
    } finally {
      setOverviewLoading(false)
    }
  }

  const fetchAllContacts = async () => {
    try {
      if (companyId && !isNaN(companyId) && companyId > 0) {
        setContactsLoading(true)
        const response = await clientsAPI.getAllContacts({ company_id: companyId })
        if (response.data.success) {
          setAllContactsList(response.data.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching all contacts:', error)
    } finally {
      setContactsLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      // Use companyId directly (already validated in useMemo)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchClients:', companyId)
        console.error('User:', user)
        console.error('LocalStorage:', localStorage.getItem('companyId'))
        setLoading(false)
        return
      }

      setLoading(true)
      console.log('Fetching clients with company_id:', companyId)
      const response = await clientsAPI.getAll({ company_id: companyId })
      console.log('Clients API response:', response.data)
      if (response.data.success) {
        const fetchedClients = response.data.data || []
        // Transform clients to map API snake_case fields to camelCase for display
        const transformedClients = await Promise.all(fetchedClients.map(async (client) => {
          // Fetch invoices for this client to calculate totals
          let totalInvoiced = 0
          let paymentReceived = 0
          let due = 0

          try {
            const invoicesRes = await invoicesAPI.getAll({ client_id: client.id, company_id: companyId })
            if (invoicesRes.data.success) {
              const invoices = invoicesRes.data.data || []
              totalInvoiced = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0)
              paymentReceived = invoices.reduce((sum, inv) => sum + parseFloat(inv.paid || 0), 0)
              due = invoices.reduce((sum, inv) => sum + parseFloat(inv.unpaid || 0), 0)
            }
          } catch (error) {
            console.error(`Error fetching invoices for client ${client.id}:`, error)
          }

          return {
            ...client,
            // Use backend response fields directly
            client_name: client.client_name || client.company_name || '',
            email: client.email || '',
            phone: client.phone || client.phone_number || '',
            // Map for legacy compatibility
            companyName: client.client_name || client.company_name || '',
            name: client.client_name || client.company_name || '',
            phoneNumber: client.phone_number || client.phoneNumber || '',
            phoneCountryCode: client.phone_country_code || client.phoneCountryCode || '+1',
            owner: client.owner_name || client.owner || 'Unknown',
            owner_id: client.owner_id,
            ownerId: client.owner_id,
            vatNumber: client.vat_number || client.vatNumber || '',
            gstNumber: client.gst_number || client.gstNumber || '',
            currencySymbol: client.currency_symbol || client.currencySymbol || '$',
            disableOnlinePayment: client.disable_online_payment !== undefined ? client.disable_online_payment : (client.disableOnlinePayment || false),
            // New fields
            type: client.type || 'Organization',
            managers: client.managers || [],
            clientGroups: client.groups || [],
            labels: client.labels || [],
            // Financial data from backend
            totalProjects: client.total_projects || 0,
            totalInvoiced: client.total_invoiced || 0,
            paymentReceived: client.payment_received || 0,
            due: client.due || 0,
            // Contacts for primary contact display
            contacts: client.contacts || [],
          }
        }))
        setClients(transformedClients)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const contactsToDisplay = allContactsList.map(contact => ({
    ...contact,
    clientId: contact.client_id,
    clientName: contact.client_name,
    jobTitle: contact.job_title,
    // Add other fields as needed for DataTable mapping
  }))

  // These can remain as static options for dropdowns (not data)
  const clientGroups = ['Enterprise', 'Small Business', 'Startup', 'Non-Profit']
  const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'India', 'Germany', 'France']
  const countryCodes = ['+1', '+44', '+91', '+61', '+49', '+33']
  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD']

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedContacts = [...contactsToDisplay].sort((a, b) => {
    const aValue = a[sortColumn] || ''
    const bValue = b[sortColumn] || ''
    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  const filteredContacts = sortedContacts.filter(contact => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.clientName.toLowerCase().includes(query) ||
      contact.jobTitle?.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.phone?.toLowerCase().includes(query)
    )
  })

  const columns = [
    {
      key: 'checkbox',
      label: '',
      render: (value, row) => (
        <input
          type="checkbox"
          checked={selectedClients.includes(row.id)}
          onChange={() => handleSelectClient(row.id)}
          className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent"
        />
      ),
    },
    {
      key: 'logo',
      label: '',
      render: (value, row) => (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <IoPerson className="text-gray-500" size={18} />
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (value, row) => (
        <a href="#" className="text-blue-600 hover:underline" onClick={(e) => { e.preventDefault(); handleViewClient(row.clientId || row.id) }}>
          {value}
        </a>
      ),
    },
    {
      key: 'company',
      label: 'Client name',
      render: (value, row) => (
        <a href="#" className="text-blue-600 hover:underline" onClick={(e) => { e.preventDefault(); handleViewClient(row.clientId || row.id) }}>
          {row.clientName || row.companyName || value}
        </a>
      ),
    },
    { key: 'jobTitle', label: 'Job Title', render: (value, row) => row.jobTitle || row.job_title || value || '-' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'actions',
      label: '',
      render: (value, row) => (
        <button
          onClick={() => handleDeleteContact(row)}
          className="p-1 text-gray-400 hover:text-danger transition-colors"
        >
          <IoClose size={18} />
        </button>
      ),
    },
  ]

  const clientColumns = [
    {
      key: 'id',
      label: 'ID',
      width: '70px',
      className: 'text-center',
      render: (value, row) => (
        <span className="text-gray-600 font-medium">#{row.id}</span>
      ),
    },
    {
      key: 'client_name',
      label: 'Name',
      width: '180px',
      render: (value, row) => (
        <a
          href="#"
          className="text-blue-600 hover:underline font-medium truncate block max-w-[160px]"
          onClick={(e) => {
            e.preventDefault()
            handleViewClient(row.id)
          }}
          title={value || row.client_name || row.companyName || row.company_name || '-'}
        >
          {value || row.client_name || row.companyName || row.company_name || '-'}
        </a>
      )
    },
    {
      key: 'primary_contact',
      label: 'Primary Contact',
      width: '160px',
      render: (value, row) => {
        const contacts = row.contacts || [];
        const primary = contacts.find(c => c.is_primary) || contacts[0];
        const contactName = primary?.name || '';

        if (!contactName) return <span className="text-gray-400">-</span>;

        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <IoPerson size={12} className="text-blue-600" />
            </div>
            <span className="text-sm text-gray-700 truncate" title={contactName}>{contactName}</span>
          </div>
        )
      }
    },
    {
      key: 'phone',
      label: 'Phone',
      width: '140px',
      render: (value, row) => {
        const phone = value || row.phone_number || row.phoneNumber || '';
        const code = row.phoneCountryCode || row.phone_country_code || '';
        return phone ? <span className="text-sm text-gray-600 whitespace-nowrap">{code} {phone}</span> : <span className="text-gray-400">-</span>;
      }
    },
    {
      key: 'clientGroups',
      label: 'Client Groups',
      width: '150px',
      render: (value, row) => {
        if (!value || value.length === 0) return <span className="text-gray-400">-</span>;

        const getGroupStyle = (group) => {
          const styles = {
            'Gold': 'bg-amber-50 text-amber-700 border-amber-200',
            'Silver': 'bg-slate-50 text-slate-600 border-slate-200',
            'VIP': 'bg-rose-50 text-rose-700 border-rose-200',
            'Premium': 'bg-purple-50 text-purple-700 border-purple-200',
            'Enterprise': 'bg-blue-50 text-blue-700 border-blue-200'
          };
          return styles[group] || 'bg-gray-50 text-gray-600 border-gray-200';
        };

        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 2).map((g, i) => (
              <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getGroupStyle(g)}`}>
                {g}
              </span>
            ))}
            {value.length > 2 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                +{value.length - 2}
              </span>
            )}
          </div>
        )
      }
    },
    {
      key: 'labels',
      label: 'Labels',
      width: '130px',
      render: (value, row) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return <span className="text-gray-400">-</span>
        return (
          <div className="flex flex-wrap gap-1">
            {Array.isArray(value) && value.slice(0, 2).map((labelName, idx) => {
              const labelObj = labels.find(l => l.name === labelName)
              const color = labelObj?.color || '#3b82f6'
              return (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-white text-[10px] uppercase font-semibold"
                  style={{ backgroundColor: color }}
                >
                  {labelName}
                </span>
              )
            })}
            {value.length > 2 && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                +{value.length - 2}
              </span>
            )}
          </div>
        )
      }
    },
    {
      key: 'totalProjects',
      label: 'Projects',
      width: '80px',
      className: 'text-center',
      render: (value, row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm">
          {value || 0}
        </span>
      )
    },
    {
      key: 'totalInvoiced',
      label: 'Total Invoiced',
      width: '120px',
      className: 'text-right',
      render: (value, row) => {
        const amount = row.totalInvoiced || 0
        return <span className="text-sm font-medium text-gray-700">${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      },
    },
    {
      key: 'paymentReceived',
      label: 'Received',
      width: '110px',
      className: 'text-right',
      render: (value, row) => {
        const amount = row.paymentReceived || 0
        return <span className="text-sm font-medium text-green-600">${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      },
    },
    {
      key: 'due',
      label: 'Due',
      width: '100px',
      className: 'text-right',
      render: (value, row) => {
        const amount = row.due || 0
        const colorClass = amount > 0 ? 'text-red-600' : 'text-gray-500'
        return <span className={`text-sm font-medium ${colorClass}`}>${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      },
    },
  ]

  const handleSelectClient = (clientId) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    )
  }

  const handleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(clients.map(c => c.id))
    }
  }

  const handleBulkEmail = () => {
    if (selectedClients.length === 0) {
      alert('Please select at least one client')
      return
    }
    setIsBulkEmailModalOpen(true)
  }

  const handleAdd = () => {
    setFormData({
      type: 'Organization',
      companyName: '',
      email: '',
      password: '',
      ownerId: user?.id || '',
      managers: [],
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
      clientGroups: [],
      labels: [],
      currency: 'USD',
      currencySymbol: '',
      disableOnlinePayment: false,
    })
    setIsAddModalOpen(true)
  }

  const handleEdit = async (client) => {
    // Fetch full client details with company_id to ensure all fields are available
    try {
      const validCompanyId = parseInt(companyId, 10)
      if (validCompanyId && !isNaN(validCompanyId) && validCompanyId > 0) {
        const response = await clientsAPI.getById(client.id, { company_id: validCompanyId })
        if (response.data.success) {
          const fullClient = response.data.data
          setSelectedClient(fullClient)
          setFormData({
            type: fullClient.type || 'Organization',
            companyName: fullClient.company_name || fullClient.companyName || '',
            email: fullClient.email || '',
            password: '',
            ownerId: fullClient.owner_id || '',
            managers: fullClient.managers ? fullClient.managers.map(m => m.user_id) : [],
            address: fullClient.address || '',
            city: fullClient.city || '',
            state: fullClient.state || '',
            zip: fullClient.zip || '',
            country: fullClient.country || 'United States',
            phoneCountryCode: fullClient.phone_country_code || '+1',
            phoneNumber: fullClient.phone_number || '',
            website: fullClient.website || '',
            vatNumber: fullClient.vat_number || '',
            gstNumber: fullClient.gst_number || '',
            clientGroups: fullClient.groups || [],
            labels: fullClient.labels || [],
            currency: fullClient.currency || 'USD',
            currencySymbol: fullClient.currency_symbol || '$',
            disableOnlinePayment: fullClient.disable_online_payment || false,
            label: fullClient.labels && fullClient.labels.length > 0 ? fullClient.labels[0] : '', // Legacy
          })

          // Fetch contacts for this client
          try {
            const contactsRes = await clientsAPI.getContacts(fullClient.id, { company_id: validCompanyId })
            if (contactsRes.data.success) {
              setClientContacts(prev => ({
                ...prev,
                [fullClient.id]: contactsRes.data.data || []
              }))
            }
          } catch (error) {
            console.error('Error fetching contacts:', error)
          }

          setIsEditModalOpen(true)
        } else {
          alert('Failed to fetch client details')
        }
      } else {
        alert('Company ID is required. Please login again.')
      }
    } catch (error) {
      console.error('Error fetching client:', error)
      alert('Failed to fetch client details')
    }
  }

  const handleViewClient = (clientId) => {
    navigate(`/app/admin/clients/${clientId}`)
  }

  // Apply all filters - close the filter panel (filtering is done client-side)
  const handleApplyFilters = () => {
    setIsAdvancedFilterOpen(false)
  }

  // Reset all filters
  const handleResetFilters = () => {
    setQuickFilter('')
    setSelectedOwner('')
    setSelectedGroup('')
    setSelectedLabel('')
    setHasDueFilter(false)
    setHasOpenProjectsFilter(false)
    setMyClientsFilter(false)
    setFilterSearchQuery('')
    setSearchQuery('')
    setIsAdvancedFilterOpen(false)
    fetchClients() // Reload all clients
  }

  // Export to Excel
  const handleExportExcel = () => {
    const csvContent = clients.map(c =>
      `${c.company_name || c.companyName},${c.email || ''},${c.phone || c.phoneNumber || ''},${c.city || ''},${c.status || ''}`
    ).join('\n')
    const header = 'Company Name,Email,Phone,City,Status\n'
    const blob = new Blob([header + csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clients.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Print clients
  const handlePrint = () => {
    window.print()
  }

  const handleDelete = async (client) => {
    if (window.confirm(`Are you sure you want to delete ${client.company_name || client.companyName}?`)) {
      try {
        await clientsAPI.delete(client.id, { company_id: companyId })
        await fetchClients()
        alert('Client deleted successfully!')
      } catch (error) {
        console.error('Error deleting client:', error)
        alert(error.response?.data?.error || 'Failed to delete client')
      }
    }
  }

  const handleSave = async () => {
    if (!formData.companyName || formData.companyName.trim() === '') {
      alert('Client Name is required')
      return
    }
    if (isAddModalOpen) {
      if (!formData.email || formData.email.trim() === '') {
        alert('Email is required for new client')
        return
      }
      if (!formData.password || formData.password.trim() === '') {
        alert('Password is required for new client')
        return
      }
    }

    try {
      // Validate companyId before creating/updating
      const validCompanyId = parseInt(companyId, 10)
      if (!validCompanyId || isNaN(validCompanyId) || validCompanyId <= 0) {
        alert('Company ID is required. Please login again.')
        return
      }

      const clientData = {
        type: formData.type,
        owner_id: formData.ownerId,
        managers: formData.managers,
        // .. existing fields ..
        client_name: formData.companyName.trim(), // Changed from company_name to client_name
        company_id: validCompanyId, // Auto-set from Admin session
        email: isAddModalOpen ? formData.email.trim() : undefined,
        password: isAddModalOpen ? formData.password : undefined, // Only send password for new clients
        address: formData.address?.trim() || null,
        city: formData.city?.trim() || null,
        state: formData.state?.trim() || null,
        zip: formData.zip?.trim() || null,
        country: formData.country || 'United States',
        phone_country_code: formData.phoneCountryCode || '+1',
        phone_number: formData.phoneNumber?.trim() || null,
        website: formData.website?.trim() || null,
        vat_number: formData.vatNumber?.trim() || null,
        gst_number: formData.gstNumber?.trim() || null,
        currency: formData.currency || 'USD',
        currency_symbol: formData.currencySymbol || '$',
        disable_online_payment: formData.disableOnlinePayment || false,
        status: 'Active',
        client_groups: formData.clientGroups,
        labels: formData.labels,
      }

      if (isEditModalOpen && selectedClient) {
        const response = await clientsAPI.update(selectedClient.id, clientData)
        if (response.data.success) {
          alert('Client updated successfully!')
          await fetchClients()
          setIsEditModalOpen(false)
          setSelectedClient(null)
        } else {
          alert(response.data.error || 'Failed to update client')
        }
      } else {
        console.log('Creating client with data:', { ...clientData, password: '***' })
        const response = await clientsAPI.create(clientData)
        if (response.data.success) {
          // Store created client data for success modal
          const createdClient = response.data.data
          setCreatedClientData({
            id: createdClient.id,
            name: createdClient.company_name || formData.companyName,
            email: formData.email,
            password: formData.password, // Store password before resetting form
            role: 'CLIENT'
          })

          await fetchClients()
          setIsAddModalOpen(false)

          // Reset form
          setFormData({
            type: 'Organization',
            companyName: '',
            email: '',
            password: '',
            ownerId: user?.id || '',
            managers: [],
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
            clientGroups: [],
            labels: [],
            currency: 'USD',
            currencySymbol: '',
            disableOnlinePayment: false,
          })
          setShowPassword(false)

          // Show success modal
          setIsSuccessModalOpen(true)
        } else {
          alert(response.data.error || 'Failed to create client')
        }
      }
    } catch (error) {
      console.error('Error saving client:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to save client. Please check your connection and try again.'
      alert(errorMessage)
    }
  }

  const handleAddContact = () => {
    // Determine context: strictly use selectedClient ONLY if we are in a modal that implies a specific client context
    const isClientContext = isEditModalOpen || isViewModalOpen;
    const clientForContact = isClientContext ? selectedClient : null;

    // If no client selected and we're not in a client context, allow user to select client
    if (!clientForContact) {
      // Check if there are any clients available
      if (clients.length === 0) {
        alert('Please add a client first before adding contacts.')
        return
      }
      // Allow user to select client from dropdown in modal
      setContactFormData({
        name: '',
        clientName: '',
        clientId: '',
        jobTitle: '',
        email: '',
        phone: '',
        isPrimary: false,
      })
      setIsContactModalOpen(true)
      return
    }

    setContactFormData({
      name: '',
      clientName: clientForContact?.companyName || clientForContact?.company_name || '',
      clientId: clientForContact?.id || '',
      jobTitle: '',
      email: '',
      phone: '',
      isPrimary: false,
    })
    setIsContactModalOpen(true)
  }

  const handleEditContact = (contact) => {
    setSelectedContact(contact)
    setContactFormData({
      name: contact.name || '',
      clientName: contact.clientName || contact.clientCompanyName || '',
      clientId: contact.clientId || contact.client_id || '',
      jobTitle: contact.jobTitle || contact.job_title || '',
      email: contact.email || '',
      phone: contact.phone || '',
      isPrimary: contact.isPrimary || contact.is_primary || false,
    })
    setIsEditContactModalOpen(true)
  }

  const handleSaveContact = async () => {
    if (!contactFormData.name || !contactFormData.email) {
      alert('Name and Email are required')
      return
    }

    // Get client ID - use selectedClient, clientId from form, or find from edit modal
    let clientId = null
    let clientForContact = selectedClient

    if (contactFormData.clientId) {
      clientId = contactFormData.clientId
      clientForContact = clients.find(c => c.id === clientId) || clientForContact
    } else if (clientForContact) {
      clientId = clientForContact.id
    } else if (isEditModalOpen && selectedClient) {
      clientId = selectedClient.id
      clientForContact = selectedClient
    }

    if (!clientId) {
      alert('Please select a client')
      return
    }

    try {
      const contactData = {
        name: contactFormData.name.trim(),
        job_title: contactFormData.jobTitle?.trim() || null,
        email: contactFormData.email.trim(),
        phone: contactFormData.phone?.trim() || null,
        is_primary: contactFormData.isPrimary || false,
      }

      if (selectedContact && isEditContactModalOpen) {
        // Update existing contact
        await clientsAPI.updateContact(clientId, selectedContact.id, contactData)
        alert('Contact updated successfully!')
        setIsEditContactModalOpen(false)
        setSelectedContact(null)
      } else {
        // Add new contact
        await clientsAPI.addContact(clientId, contactData, { company_id: companyId })
        alert('Contact added successfully!')
        setIsContactModalOpen(false)
      }

      await fetchClients() // Refresh to get updated contacts

      // Reset contact form
      setContactFormData({
        name: '',
        clientName: '',
        clientId: '',
        jobTitle: '',
        email: '',
        phone: '',
        isPrimary: false,
      })

      // Only clear selectedClient if we're not in edit/view mode
      if (!isEditModalOpen && !isViewModalOpen) {
        setSelectedClient(null)
      }
    } catch (error) {
      console.error('Error saving contact:', error)
      alert(error.response?.data?.error || 'Failed to save contact')
    }
  }

  const handleDeleteContact = async (contact) => {
    if (!contact || !contact.id) {
      console.error('Invalid contact data:', contact)
      return
    }

    if (window.confirm(`Delete contact ${contact.name}?`)) {
      try {
        // Find the client ID from the contact
        const clientId = contact.clientId || contact.client_id
        if (!clientId) {
          alert('Client ID not found for this contact')
          return
        }

        await clientsAPI.deleteContact(clientId, contact.id)
        await fetchClients() // Refresh to update contacts
        alert('Contact deleted successfully!')
      } catch (error) {
        console.error('Error deleting contact:', error)
        alert(error.response?.data?.error || 'Failed to delete contact')
      }
    }
  }

  const actions = (row) => (
    <div className="action-btn-container">
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (row && row.id) {
            handleViewClient(row.id)
          } else {
            console.error('Invalid row data:', row)
          }
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
          if (row && row.id) {
            handleEdit(row)
          } else {
            console.error('Invalid row data:', row)
          }
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
          if (row && row.id) {
            handleDelete(row)
          } else {
            console.error('Invalid row data:', row)
          }
        }}
        className="action-btn action-btn-delete"
        title="Delete"
        type="button"
      >
        <IoTrashOutline size={18} />
      </button>
    </div>
  )

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header with Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 border-b-2 border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === 'overview'
                  ? 'text-primary-accent border-b-2 border-primary-accent -mb-[2px]'
                  : 'text-secondary-text hover:text-primary-text'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === 'clients'
                  ? 'text-primary-accent border-b-2 border-primary-accent -mb-[2px]'
                  : 'text-secondary-text hover:text-primary-text'
                  }`}
              >
                Clients
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === 'contacts'
                  ? 'text-primary-accent border-b-2 border-primary-accent -mb-[2px]'
                  : 'text-secondary-text hover:text-primary-text'
                  }`}
              >
                Contacts
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsManageLabelsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <IoPricetag size={16} />
              <span className="hidden sm:inline">Manage labels</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 hover:bg-gray-800 hover:text-white hover:border-gray-800"
            >
              <IoDownload size={16} />
              <span className="hidden sm:inline">Import clients</span>
            </Button>
            <AddButton onClick={handleAdd} label="Add client" />
          </div>
        </div>

      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {overviewLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <div className="h-14 bg-gray-200 rounded animate-pulse" />
                </Card>
              ))}
            </div>
          ) : overviewData ? (
            <>
              {/* Top Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <IoBriefcaseOutline size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{overviewData.totals?.total_clients || 0}</h3>
                    <p className="text-xs text-gray-500">Total clients</p>
                  </div>
                </Card>

                <Card className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center text-white">
                    <IoPeopleOutline size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{overviewData.contacts?.total_contacts || 0}</h3>
                    <p className="text-xs text-gray-500">Total contacts</p>
                  </div>
                </Card>

                <Card className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                    <IoCheckboxOutline size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{overviewData.contacts?.today || 0}</h3>
                    <p className="text-xs text-gray-500">Contacts logged in today</p>
                  </div>
                </Card>

                <Card className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-400 flex items-center justify-center text-white">
                    <IoCalendarOutline size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{overviewData.contacts?.last_7_days || 0}</h3>
                    <p className="text-xs text-gray-500">Contacts logged in last 7 days</p>
                  </div>
                </Card>
              </div>

              {/* Invoice Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-gray-700 text-sm">Clients has unpaid invoices</h4>
                    <span className="text-xl font-bold text-gray-900">{overviewData.invoices?.clients_unpaid || 0}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {Math.round(((overviewData.invoices?.clients_unpaid || 0) / (overviewData.totals?.total_clients || 1)) * 100)}% of total clients
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-yellow-500 h-1 rounded-full"
                      style={{ width: `${Math.min(((overviewData.invoices?.clients_unpaid || 0) / (overviewData.totals?.total_clients || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </Card>

                <Card>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-gray-700 text-sm">Clients has partially paid invoices</h4>
                    <span className="text-xl font-bold text-gray-900">{overviewData.invoices?.clients_partially_paid || 0}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {Math.round(((overviewData.invoices?.clients_partially_paid || 0) / (overviewData.totals?.total_clients || 1)) * 100)}% of total clients
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full"
                      style={{ width: `${Math.min(((overviewData.invoices?.clients_partially_paid || 0) / (overviewData.totals?.total_clients || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </Card>

                <Card>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-gray-700 text-sm">Clients has overdue invoices</h4>
                    <span className="text-xl font-bold text-gray-900">{overviewData.invoices?.clients_overdue || 0}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {Math.round(((overviewData.invoices?.clients_overdue || 0) / (overviewData.totals?.total_clients || 1)) * 100)}% of total clients
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-red-600 h-1 rounded-full"
                      style={{ width: `${Math.min(((overviewData.invoices?.clients_overdue || 0) / (overviewData.totals?.total_clients || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </Card>
              </div>

              {/* Projects & Estimates Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Projects Section */}
                <Card>
                  <h4 className="text-gray-500 mb-4 uppercase text-xs font-bold tracking-wider">Projects</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group cursor-pointer">
                      <div className="flex items-center gap-3 text-gray-600">
                        <IoGridOutline size={20} />
                        <span className="group-hover:text-primary-accent transition-colors">Clients has open projects</span>
                      </div>
                      <span className="text-blue-600 font-semibold">{overviewData.projects?.clients_open || 0}</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-pointer border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <IoCheckmarkCircleOutline size={18} />
                        <span className="group-hover:text-primary-accent transition-colors">Clients has completed projects</span>
                      </div>
                      <span className="text-green-600 font-semibold text-sm">{overviewData.projects?.clients_completed || 0}</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-pointer border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <IoPauseCircleOutline size={18} />
                        <span className="group-hover:text-primary-accent transition-colors">Clients has hold projects</span>
                      </div>
                      <span className="text-orange-500 font-semibold text-sm">{overviewData.projects?.clients_hold || 0}</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-pointer border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <IoCloseCircleOutline size={18} />
                        <span className="group-hover:text-primary-accent transition-colors">Clients has canceled projects</span>
                      </div>
                      <span className="text-red-500 font-semibold text-sm">{overviewData.projects?.clients_canceled || 0}</span>
                    </div>
                  </div>
                </Card>

                {/* Estimates Section */}
                <Card>
                  <h4 className="text-gray-500 mb-4 uppercase text-xs font-bold tracking-wider">Estimates</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group cursor-pointer">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <IoCubeOutline size={18} />
                        <span className="group-hover:text-primary-accent transition-colors">Client has open estimates</span>
                      </div>
                      <span className="text-orange-500 font-semibold text-sm">{overviewData.estimates?.clients_open || 0}</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-pointer border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <IoCheckmarkDoneCircleOutline size={18} />
                        <span className="group-hover:text-primary-accent transition-colors">Clients has accepted estimates</span>
                      </div>
                      <span className="text-green-600 font-semibold text-sm">{overviewData.estimates?.clients_accepted || 0}</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-pointer border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
                          <IoWater size={10} className="text-gray-400" />
                        </div>
                        <span className="group-hover:text-primary-accent transition-colors">Clients has new estimate requests</span>
                      </div>
                      <span className="text-blue-500 font-semibold text-sm">{overviewData.estimates?.clients_new || 0}</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-pointer border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <IoSyncOutline size={18} className="animate-spin-slow" />
                        <span className="group-hover:text-primary-accent transition-colors">Clients has estimate requests in progress</span>
                      </div>
                      <span className="text-gray-500 font-semibold text-sm">{overviewData.estimates?.clients_in_progress || 0}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Tickets & Proposals Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="flex flex-col justify-end min-h-[120px] relative overflow-hidden group">
                  <h4 className="text-gray-500 mb-1.5 font-medium text-sm">Clients has open tickets</h4>
                  <p className="text-xs text-gray-400 mb-2">{Math.round(((overviewData.tickets?.clients_open || 0) / (overviewData.totals?.total_clients || 1)) * 100)}% of total clients</p>
                  <div className="flex items-end justify-between">
                    <div className="w-full bg-gray-200 rounded-full h-1 mr-10">
                      <div
                        className="bg-red-500 h-1 rounded-full"
                        style={{ width: `${Math.min(((overviewData.tickets?.clients_open || 0) / (overviewData.totals?.total_clients || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{overviewData.tickets?.clients_open || 0}</span>
                  </div>
                </Card>

                <Card className="min-h-[100px] flex flex-col justify-between">
                  <h4 className="text-gray-500 uppercase text-xs font-bold tracking-wider">Proposals</h4>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <IoCafeOutline size={18} />
                      <span>Clients has open proposals</span>
                    </div>
                    <span className="text-orange-500 font-bold">{overviewData.proposals?.clients_open || 0}</span>
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">No overview data available</p>
            </div>
          )}
        </div>
      )}

      {/* Clients Tab */}
      {
        activeTab === 'clients' && (
          <div className="space-y-3">
            {/* Filter Bar */}
            <Card className="!p-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Left Section */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* View Toggle */}
                  <button
                    onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title={viewMode === 'list' ? 'Grid View' : 'List View'}
                  >
                    {viewMode === 'list' ? <IoGrid size={18} className="text-gray-600" /> : <IoList size={18} className="text-gray-600" />}
                  </button>

                  {/* Filters Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                    >
                      Filters
                      <IoChevronDown size={14} className={`transition-transform ${isAdvancedFilterOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* + Icon Button */}
                  <button
                    onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Advanced Filters"
                  >
                    <IoAdd size={18} className="text-gray-600" />
                  </button>

                  {/* Divider */}
                  <div className="w-px h-6 bg-gray-300 hidden sm:block" />

                  {/* Quick Filter Buttons */}
                  <button
                    onClick={() => setHasDueFilter(!hasDueFilter)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      hasDueFilter
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Has due
                  </button>
                  <button
                    onClick={() => setHasOpenProjectsFilter(!hasOpenProjectsFilter)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      hasOpenProjectsFilter
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Has open projects
                  </button>
                  <button
                    onClick={() => setMyClientsFilter(!myClientsFilter)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      myClientsFilter
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    My Clients
                  </button>
                </div>

                {/* Right Section */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Last Activity */}
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50" title="Last Activity">
                    <IoTime size={18} className="text-gray-600" />
                  </button>

                  {/* Excel Export */}
                  <button
                    onClick={handleExportExcel}
                    className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Excel
                  </button>

                  {/* Print */}
                  <button
                    onClick={handlePrint}
                    className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Print
                  </button>
                </div>
              </div>

              {/* Advanced Filter Panel */}
              {isAdvancedFilterOpen && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Quick Filters Dropdown */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Quick filters</label>
                      <select
                        value={quickFilter}
                        onChange={(e) => setQuickFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">- Quick filters -</option>
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="vip">VIP</option>
                        <option value="corporate">Corporate</option>
                      </select>
                    </div>

                    {/* Owner Dropdown */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Owner</label>
                      <select
                        value={selectedOwner}
                        onChange={(e) => setSelectedOwner(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">- Owner -</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.first_name || emp.name} {emp.last_name || ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Client Groups Dropdown */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Client groups</label>
                      <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">- Client groups -</option>
                        {availableClientGroups.map(group => (
                          <option key={group.id || group.name} value={group.name || group}>
                            {group.name || group}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Label Dropdown */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                      <select
                        value={selectedLabel}
                        onChange={(e) => setSelectedLabel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">- Label -</option>
                        {labels.map(label => (
                          <option key={label.id || label.name} value={label.name}>
                            {label.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleApplyFilters}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <IoCheckmarkCircle size={16} />
                      Apply Filters
                    </button>
                    <button
                      onClick={handleResetFilters}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <IoClose size={16} />
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </Card>

            {/* Data Table */}
            <div className="w-full overflow-x-auto">
            <DataTable
              columns={clientColumns}
              data={clients.filter(c => {
                // Quick filter dropdown
                if (quickFilter === 'active' && c.status !== 'Active') return false
                if (quickFilter === 'inactive' && c.status !== 'Inactive') return false
                if (quickFilter === 'vip' && !c.clientGroups?.some(g => g.toLowerCase().includes('vip'))) return false
                if (quickFilter === 'corporate' && !c.clientGroups?.some(g => g.toLowerCase().includes('corporate') || g.toLowerCase().includes('enterprise'))) return false
                // Status filter from overview
                if (statusFilter && c.status !== statusFilter) return false
                // Owner filter
                if (selectedOwner && c.owner_id?.toString() !== selectedOwner) return false
                if (ownerFilter && c.owner_id?.toString() !== ownerFilter) return false
                // Group filter
                if (selectedGroup && !c.clientGroups?.includes(selectedGroup)) return false
                // Label filter
                if (selectedLabel && !c.labels?.includes(selectedLabel)) return false
                // Has Due filter - check if client has outstanding due amount
                if (hasDueFilter && (!c.due || parseFloat(c.due) <= 0)) return false
                // Has Open Projects filter - check if client has projects
                if (hasOpenProjectsFilter && (!c.totalProjects || parseInt(c.totalProjects) <= 0)) return false
                // My Clients filter - check if current user is the owner
                if (myClientsFilter && user?.id && c.owner_id?.toString() !== user.id.toString()) return false
                return true
              })}
              searchPlaceholder="Search clients..."
              filterConfig={[
                { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
                { key: 'city', label: 'City', type: 'text' },
                { key: 'phoneNumber', label: 'Phone', type: 'text' },
              ]}
              actions={actions}
              bulkActions={true}
              selectedRows={selectedClients}
              onSelectAll={handleSelectAll}
              loading={loading}
              onRowClick={(row) => handleViewClient(row.id)}
            />
            </div>
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
                <p className="text-sm text-secondary-text mt-1">Manage all client contacts</p>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  if (clients.length === 0) {
                    alert('Please add a client first before adding contacts.')
                    return
                  }
                  handleAddContact()
                }}
                className="flex items-center gap-2"
              >
                <IoPersonAdd size={18} />
                Add Contact
              </Button>
            </div>

            {/* Contacts Table */}
            {contactsToDisplay.length === 0 ? (
              <Card className="p-6">
                <div className="text-center py-8">
                  <IoPerson size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-secondary-text">No contacts found</p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (clients.length === 0) {
                        alert('Please add a client first before adding contacts.')
                        return
                      }
                      handleAddContact()
                    }}
                    className="mt-4 flex items-center gap-2 mx-auto"
                  >
                    <IoPersonAdd size={18} />
                    Add First Contact
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-0 overflow-hidden">
                {/* Mobile: Cards View */}
                <div className="block sm:hidden">
                  <div className="space-y-3 p-4">
                    {filteredContacts.map((contact) => (
                      <div key={contact.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <IoPerson className="text-gray-500" size={20} />
                            </div>
                            <div>
                              <p className="font-medium text-primary-text">{contact.name}</p>
                              <p className="text-xs text-secondary-text">{contact.jobTitle || contact.job_title || 'No title'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditContact(contact)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <IoPencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteContact(contact)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <IoTrashOutline size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-secondary-text">Client:</span>
                            <button
                              onClick={() => contact.clientId && handleViewClient(contact.clientId)}
                              className="text-blue-600 hover:underline"
                            >
                              {contact.clientName || contact.clientCompanyName}
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-secondary-text">Email:</span>
                            <a href={`mailto:${contact.email}`} className="text-primary-text">{contact.email}</a>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-2">
                              <span className="text-secondary-text">Phone:</span>
                              <a href={`tel:${contact.phone}`} className="text-primary-text">{contact.phone}</a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop: Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <DataTable
                    columns={[
                      {
                        key: 'name',
                        label: 'Name',
                        render: (value, row) => (
                          <button
                            onClick={() => row.clientId && handleViewClient(row.clientId)}
                            className="text-blue-600 hover:underline text-left"
                          >
                            {value}
                          </button>
                        ),
                      },
                      {
                        key: 'clientName',
                        label: 'Client',
                        render: (value, row) => (
                          <button
                            onClick={() => row.clientId && handleViewClient(row.clientId)}
                            className="text-blue-600 hover:underline text-left"
                          >
                            {value || row.clientCompanyName || '-'}
                          </button>
                        ),
                      },
                      { key: 'jobTitle', label: 'Job Title', render: (value, row) => row.jobTitle || row.job_title || value || '-' },
                      { key: 'email', label: 'Email' },
                      { key: 'phone', label: 'Phone', render: (value) => value || '-' },
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
                              <IoPencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteContact(row)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <IoTrashOutline size={18} />
                            </button>
                          </div>
                        ),
                      },
                    ]}
                    data={filteredContacts}
                    loading={loading}
                    emptyMessage="No contacts found"
                  />
                </div>
              </Card>
            )}
          </div>
        )
      }

      {/* Add/Edit Client Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
        }}
        title={isAddModalOpen ? 'Add new client' : 'Edit client'}
        size="2xl"
      >
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Type */}
          <FormRow label="Type">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="Organization"
                  checked={formData.type === 'Organization'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Organization</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="Person"
                  checked={formData.type === 'Person'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Person</span>
              </label>
            </div>
          </FormRow>

          {/* Company Name / Name */}
          <FormRow label={formData.type === 'Person' ? 'Name' : 'Company name'} required>
            <Input
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder={formData.type === 'Person' ? 'Name' : 'Company name'}
            />
          </FormRow>

          {/* Owner */}
          <FormRow label="Owner">
            <div className="relative">
              <select
                className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={formData.ownerId}
                onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
              >
                <option value="">Select Owner</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.user_id || emp.id}>{emp.name}</option>
                ))}
              </select>
              <IoChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
            </div>
          </FormRow>

          {/* Managers - MultiSelect */}
          <FormRow label="Managers">
            <div className="relative">
              <select
                multiple
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white h-24"
                value={formData.managers}
                onChange={(e) => handleMultiSelectChange(e, 'managers')}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.user_id || emp.id}>{emp.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</p>
            </div>
          </FormRow>

          {/* Login Details - Only for Add Modal mostly, but user said 'email or pas filed toh sma erhen dne' */}
          {isAddModalOpen && (
            <>
              <div className="border-t border-gray-100 my-2 pt-2">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Login Details</h4>
                <FormRow label="Email" required>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email"
                  />
                </FormRow>
                <FormRow label="Password" required>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <IoEyeOff /> : <IoEye />}
                    </button>
                  </div>
                </FormRow>
              </div>
              <div className="border-t border-gray-100 my-2"></div>
            </>
          )}


          {/* Address */}
          <FormRow label="Address">
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Address"
            />
          </FormRow>

          <FormRow label="City">
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="City"
            />
          </FormRow>

          <FormRow label="State">
            <Input
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="State"
            />
          </FormRow>

          <FormRow label="Zip">
            <Input
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              placeholder="Zip"
            />
          </FormRow>

          <FormRow label="Country">
            <div className="relative">
              <select
                className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              >
                {countries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <IoChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
            </div>
          </FormRow>

          <FormRow label="Phone">
            <div className="flex gap-2">
              <div className="relative w-24">
                <select
                  className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={formData.phoneCountryCode}
                  onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                >
                  {countryCodes.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
                <IoChevronDown className="absolute right-2 top-3 text-gray-500 pointer-events-none text-xs" />
              </div>
              <div className="flex-1">
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>
          </FormRow>

          <FormRow label="Website">
            <Input
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="Website"
            />
          </FormRow>

          <FormRow label="VAT Number">
            <Input
              value={formData.vatNumber}
              onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
              placeholder="VAT Number"
            />
          </FormRow>

          <FormRow label="GST Number">
            <Input
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              placeholder="GST Number"
            />
          </FormRow>

          {/* Client Groups */}
          <FormRow label="Client groups">
            {/* Only showing Gold, Silver, VIP as per request */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {['Gold', 'Silver', 'VIP'].map(group => (
                  <button
                    key={group}
                    onClick={(e) => {
                      e.preventDefault(); // Prevent form submission if inside a form
                      const newGroups = formData.clientGroups.includes(group)
                        ? formData.clientGroups.filter(g => g !== group)
                        : [...formData.clientGroups, group];
                      setFormData({ ...formData, clientGroups: newGroups });
                    }}
                    className={`px-3 py-1 rounded-full text-xs border ${formData.clientGroups.includes(group) ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                  >
                    {group}
                  </button>
                ))}
              </div>
              {/* Current selections display */}
              <div className="bg-gray-50 p-2 rounded border border-gray-200 min-h-[38px] flex flex-wrap gap-1">
                {formData.clientGroups.map((g, i) => (
                  <span key={i} className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">
                    {g} <IoClose className="cursor-pointer" onClick={() => setFormData({ ...formData, clientGroups: formData.clientGroups.filter(x => x !== g) })} />
                  </span>
                ))}
                {formData.clientGroups.length === 0 && <span className="text-gray-400 text-sm">Select groups above</span>}
              </div>
            </div>
          </FormRow>

          <FormRow label="Currency">
            <div className="relative">
              <select
                className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                {currencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="">Keep it blank to use default (USD)</option>
              </select>
              <IoChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
            </div>
          </FormRow>

          <FormRow label="Currency Symbol">
            <Input
              value={formData.currencySymbol}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              placeholder="Keep it blank to use the default ($)"
            />
          </FormRow>

          {/* Labels - MultiSelect */}
          <FormRow label="Labels">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {labels.map(lbl => (
                  <button
                    key={lbl.id}
                    onClick={() => {
                      const newLabels = formData.labels.includes(lbl.name)
                        ? formData.labels.filter(l => l !== lbl.name)
                        : [...formData.labels, lbl.name];
                      setFormData({ ...formData, labels: newLabels });
                    }}
                    className={`px-3 py-1 rounded-full text-xs border ${formData.labels.includes(lbl.name) ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                    style={formData.labels.includes(lbl.name) ? {} : { borderLeftColor: lbl.color, borderLeftWidth: '3px' }}
                  >
                    {lbl.name}
                  </button>
                ))}
              </div>
              <div className="bg-gray-50 p-2 rounded border border-gray-200 min-h-[38px] flex flex-wrap gap-1">
                {formData.labels.map((l, i) => (
                  <span key={i} className="text-xs text-white px-2 py-0.5 rounded flex items-center gap-1 font-bold" style={{ backgroundColor: labels.find(x => x.name === l)?.color || '#3b82f6' }}>
                    {l} <IoClose className="cursor-pointer" onClick={() => setFormData({ ...formData, labels: formData.labels.filter(x => x !== l) })} />
                  </span>
                ))}
                {formData.labels.length === 0 && <span className="text-gray-400 text-sm">Select labels above</span>}
              </div>
            </div>
          </FormRow>

          <FormRow label="Disable online payment">
            <div className="pt-2">
              <input
                type="checkbox"
                checked={formData.disableOnlinePayment}
                onChange={(e) => setFormData({ ...formData, disableOnlinePayment: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
              />
            </div>
          </FormRow>

        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
          <Button variant="outline" onClick={() => {
            setIsAddModalOpen(false)
            setIsEditModalOpen(false)
          }}>
            Close
          </Button>
          <Button onClick={handleSave}>
            {isAddModalOpen ? 'Save' : 'Save changes'}
          </Button>
        </div>
      </Modal>

      {/* View Client Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedClient(null)
        }}
        title={selectedClient?.companyName || 'Client Details'}
      >
        {selectedClient && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-primary-text">{selectedClient.companyName || selectedClient.company_name}</h3>
              <Badge variant={(selectedClient.status || 'Active') === 'Active' ? 'success' : 'default'}>
                {selectedClient.status || 'Active'}
              </Badge>
            </div>

            {/* Company Information */}
            <div>
              <h4 className="font-semibold text-primary-text mb-3">Company Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-secondary-text">Email</label>
                  <p className="text-primary-text font-medium">{selectedClient.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h4 className="font-semibold text-primary-text mb-3">Address</h4>
              <p className="text-sm text-primary-text">
                {selectedClient.address || ''}, {selectedClient.city || ''}, {selectedClient.state || ''} {selectedClient.zip || ''}
                <br />
                {selectedClient.country || ''}
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-primary-text mb-3">Contact</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-secondary-text">Phone:</span> {selectedClient.phoneCountryCode || selectedClient.phone_country_code || ''} {selectedClient.phoneNumber || selectedClient.phone_number || '-'}</p>
                {(selectedClient.website) && (
                  <p><span className="text-secondary-text">Website:</span> <a href={selectedClient.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedClient.website}</a></p>
                )}
              </div>
            </div>

            {/* Contacts List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-primary-text">Contacts</h4>
                <Button variant="outline" size="sm" onClick={handleAddContact}>
                  <IoPersonAdd size={16} />
                  Add Contact
                </Button>
              </div>
              <div className="space-y-2">
                {(clientContacts[selectedClient?.id] || []).length > 0 ? (
                  (clientContacts[selectedClient.id] || []).map(contact => (
                    <div key={contact.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-primary-text">{contact.name}</p>
                        <p className="text-sm text-secondary-text">
                          {contact.job_title || contact.jobTitle || 'No title'} • {contact.email}
                          {contact.phone && ` • ${contact.phone}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {contact.is_primary && (
                          <Badge variant="success" className="text-xs">Primary</Badge>
                        )}
                        <button
                          onClick={() => handleDeleteContact({ ...contact, clientId: selectedClient.id })}
                          className="p-1 text-gray-400 hover:text-danger transition-colors"
                          title="Delete contact"
                        >
                          <IoTrashOutline size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-secondary-text text-center py-4">
                    No contacts added yet. Click "Add Contact" to add one.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(selectedClient)
                }}
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsViewModalOpen(false)
                  setIsEmailModalOpen(true)
                }}
                className="flex-1"
              >
                Send Email
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>

      {/* Add/Edit Contact Modal */}
      <Modal
        isOpen={isContactModalOpen || isEditContactModalOpen}
        onClose={() => {
          setIsContactModalOpen(false)
          setIsEditContactModalOpen(false)
          setSelectedContact(null)
          setContactFormData({
            name: '',
            clientName: '',
            clientId: '',
            jobTitle: '',
            email: '',
            phone: '',
            isPrimary: false,
          })
        }}
        title={isEditContactModalOpen ? 'Edit Contact' : 'Add Contact'}
      >
        <div className="space-y-4">
          {/* Client Selection - Only show if no client is selected */}
          {!selectedClient && (
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Select Client <span className="text-danger">*</span>
              </label>
              <select
                value={contactFormData.clientId || ''}
                onChange={(e) => {
                  const clientId = parseInt(e.target.value)
                  const client = clients.find(c => c.id === clientId)
                  setContactFormData({
                    ...contactFormData,
                    clientId: clientId,
                    clientName: client?.companyName || client?.company_name || ''
                  })
                  setSelectedClient(client)
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                required
              >
                <option value="">-- Select Client --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.companyName || client.company_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedClient && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-secondary-text">Client:</p>
              <p className="font-medium text-primary-text">{selectedClient.companyName || selectedClient.company_name}</p>
            </div>
          )}

          <Input
            label="Name"
            value={contactFormData.name}
            onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
            placeholder="Enter contact name"
            required
          />
          <Input
            label="Job Title"
            value={contactFormData.jobTitle}
            onChange={(e) => setContactFormData({ ...contactFormData, jobTitle: e.target.value })}
            placeholder="e.g., CEO, Manager"
          />
          <Input
            label="Email"
            type="email"
            value={contactFormData.email}
            onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
            placeholder="contact@example.com"
            required
          />
          <Input
            label="Phone"
            value={contactFormData.phone}
            onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
            placeholder="+1 234-567-8900"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrimary"
              checked={contactFormData.isPrimary}
              onChange={(e) => setContactFormData({ ...contactFormData, isPrimary: e.target.checked })}
              className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent"
            />
            <label htmlFor="isPrimary" className="text-sm font-medium text-primary-text">
              Set as Primary Contact
            </label>
          </div>
          <div className="flex gap-3 pt-4 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsContactModalOpen(false)
                setIsEditContactModalOpen(false)
                setSelectedContact(null)
                setSelectedClient(null)
                setContactFormData({
                  name: '',
                  clientName: '',
                  clientId: '',
                  jobTitle: '',
                  email: '',
                  phone: '',
                  isPrimary: false,
                })
              }}
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveContact}
              className="px-4"
              disabled={!selectedClient && !contactFormData.clientId}
            >
              Save Contact
            </Button>
          </div>
        </div>
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
              {/* Color Selection - Premium Grid */}
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
                    className={`group relative w-8 h-8 rounded-md transition-all duration-200 ${newLabelColor === color ? 'ring-2 ring-primary-accent ring-offset-2 scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  >
                    {newLabelColor === color && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <IoCheckmarkCircle className="text-white drop-shadow-sm" size={14} />
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
                    placeholder="Label name (e.g. VIP, Corporate, Referral)"
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

      {/* Excel Export Modal */}
      <Modal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        title="Export to Excel"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary-text">Export client data to Excel format</p>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              <span className="text-sm text-primary-text">Include all columns</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              <span className="text-sm text-primary-text">Include contacts</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-sm text-primary-text">Include custom fields</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsExcelModalOpen(false)}
              className="flex-1"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                alert('Excel export started!')
                setIsExcelModalOpen(false)
              }}
              className="flex-1"
              size="sm"
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>

      {/* Print Modal */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Print Clients"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary-text">Print client list</p>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="printType" value="list" defaultChecked className="rounded border-gray-300" />
              <span className="text-sm text-primary-text">Print List View</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="printType" value="details" className="rounded border-gray-300" />
              <span className="text-sm text-primary-text">Print with Details</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsPrintModalOpen(false)}
              className="flex-1"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                window.print()
                setIsPrintModalOpen(false)
              }}
              className="flex-1"
              size="sm"
            >
              Print
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Contacts Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Contacts"
        size="sm"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <IoDownload className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm text-secondary-text mb-1">Drag & drop CSV file here or click to browse</p>
            <p className="text-xs text-secondary-text">Supports: CSV, XLS, XLSX</p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsImportModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                alert('Import started!')
                setIsImportModalOpen(false)
              }}
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
        title={`Bulk Email to ${selectedClients.length} Clients`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Recipients ({selectedClients.length} selected)
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
              {clients.filter(c => selectedClients.includes(c.id)).map(client => {
                const contacts = clientContacts[client.id] || []
                return (
                  <div key={client.id} className="text-sm text-secondary-text">
                    {client.company_name || client.companyName} &lt;{contacts[0]?.email || 'no-email'}&gt;
                  </div>
                )
              })}
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
          <Input label="Subject" placeholder="Enter email subject" />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Message
            </label>
            <textarea
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter your message..."
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
                alert(`Email sent to ${selectedClients.length} clients successfully!`)
                setIsBulkEmailModalOpen(false)
                setSelectedClients([])
              }}
              className="flex-1"
            >
              Send Email
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal - Show Client Credentials */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false)
          setCreatedClientData(null)
        }}
        title="Client Created Successfully!"
        size="md"
      >
        {createdClientData && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <IoCheckmarkCircle size={40} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-primary-text mb-2">
                Client has been created successfully!
              </h3>
              <p className="text-sm text-secondary-text">
                Please save these login credentials for the client.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 space-y-4 border border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-300 pb-3">
                <span className="text-sm font-semibold text-secondary-text">Client Name:</span>
                <span className="text-base font-bold text-primary-text">{createdClientData.name}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-300 pb-3">
                <span className="text-sm font-semibold text-secondary-text">Client ID:</span>
                <span className="text-base font-bold text-primary-accent">#{createdClientData.id}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-300 pb-3">
                <span className="text-sm font-semibold text-secondary-text">Email:</span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-primary-text break-all max-w-[200px]">{createdClientData.email}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdClientData.email)
                      alert('Email copied to clipboard!')
                    }}
                    className="p-1.5 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded transition-colors"
                    title="Copy Email"
                  >
                    <IoDocumentText size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-300 pb-3">
                <span className="text-sm font-semibold text-secondary-text">Password:</span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-primary-text font-mono bg-white px-3 py-1 rounded border border-gray-300">{createdClientData.password}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdClientData.password)
                      alert('Password copied to clipboard!')
                    }}
                    className="p-1.5 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded transition-colors"
                    title="Copy Password"
                  >
                    <IoDocumentText size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-secondary-text">Role:</span>
                <Badge variant="success" className="text-sm px-3 py-1">{createdClientData.role}</Badge>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <IoDocumentText size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Important:</p>
                  <p className="text-xs text-blue-800">
                    These credentials will be used by the client to log in to their dashboard.
                    Please save or share these details securely with the client. The password cannot be retrieved later.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Copy all credentials to clipboard
                  const credentials = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLIENT LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Client Name: ${createdClientData.name}
Client ID: #${createdClientData.id}
Email: ${createdClientData.email}
Password: ${createdClientData.password}
Role: ${createdClientData.role}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please share these credentials securely with the client.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
                  navigator.clipboard.writeText(credentials)
                  alert('✅ All credentials copied to clipboard!')
                }}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <IoDocumentText size={18} />
                Copy All Credentials
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsSuccessModalOpen(false)
                  setCreatedClientData(null)
                }}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div >
  )
}

export default Clients

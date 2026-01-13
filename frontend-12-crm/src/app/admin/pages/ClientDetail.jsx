import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clientsAPI, invoicesAPI, paymentsAPI, projectsAPI, subscriptionsAPI, estimatesAPI, proposalsAPI, contractsAPI, documentsAPI, expensesAPI, tasksAPI, notesAPI, ordersAPI, employeesAPI, departmentsAPI, contactsAPI } from '../../../api'
import { useSettings } from '../../../context/SettingsContext'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import { FormCheckbox } from '../../../components/ui/FormRow'
import RichTextEditor from '../../../components/ui/RichTextEditor'
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
  IoStar,
  IoHelpCircle,
  IoBriefcase,
  IoCash,
  IoCard,
  IoReceipt,
  IoList,
  IoEllipsisVertical,
  IoGlobe,
  IoBookmark
} from 'react-icons/io5'

const ClientDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { settings, formatDate, formatCurrency } = useSettings()
  const [client, setClient] = useState(null)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [activeSubTab, setActiveSubTab] = useState('expenses') // For Overview sub-tabs
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [projectFilterStatus, setProjectFilterStatus] = useState('all')
  const [projectSearch, setProjectSearch] = useState('')
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState('all')
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [paymentFilterStatus, setPaymentFilterStatus] = useState('all')
  const [paymentSearch, setPaymentSearch] = useState('')
  const [estimateFilterStatus, setEstimateFilterStatus] = useState('all')
  const [estimateSearch, setEstimateSearch] = useState('')
  const [proposalFilterStatus, setProposalFilterStatus] = useState('all')
  const [proposalSearch, setProposalSearch] = useState('')
  const [contractFilterStatus, setContractFilterStatus] = useState('all')
  const [contractSearch, setContractSearch] = useState('')
  const [expenseFilterStatus, setExpenseFilterStatus] = useState('all')
  const [expenseSearch, setExpenseSearch] = useState('')
  const [taskFilterStatus, setTaskFilterStatus] = useState('all')
  const [taskSearch, setTaskSearch] = useState('')
  const [fileSearch, setFileSearch] = useState('')
  const [subscriptionFilterStatus, setSubscriptionFilterStatus] = useState('all')
  const [subscriptionSearch, setSubscriptionSearch] = useState('')
  const [orderFilterStatus, setOrderFilterStatus] = useState('all')
  const [orderSearch, setOrderSearch] = useState('')
  const [noteSearch, setNoteSearch] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false)
  const [createContactLoading, setCreateContactLoading] = useState(false)
  // const [contactFormData, setContactFormData] = useState({
  //   name: '',
  //   email: '',
  //   phone: '',
  //   job_title: ''
  // })




  // Data states
  const [projects, setProjects] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [orders, setOrders] = useState([])
  const [estimates, setEstimates] = useState([])
  const [proposals, setProposals] = useState([])
  const [contracts, setContracts] = useState([])
  const [files, setFiles] = useState([])
  const [contacts, setContacts] = useState([])
  const [expenses, setExpenses] = useState([])
  const [notes, setNotes] = useState([])
  const [tasks, setTasks] = useState([])

  // Loading states
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false)
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingEstimates, setLoadingEstimates] = useState(false)
  const [loadingProposals, setLoadingProposals] = useState(false)
  const [loadingContracts, setLoadingContracts] = useState(false)
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [loadingExpenses, setLoadingExpenses] = useState(false)
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [loadingTasks, setLoadingTasks] = useState(false)

  // Modals
  // const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false)
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isAddEstimateModalOpen, setIsAddEstimateModalOpen] = useState(false)
  const [isAddProposalModalOpen, setIsAddProposalModalOpen] = useState(false)
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false)
  const [isAddFileModalOpen, setIsAddFileModalOpen] = useState(false)
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false)
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false)
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false)
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false)
  const [isAddSubscriptionModalOpen, setIsAddSubscriptionModalOpen] = useState(false)

  // View modal states
  const [isViewPaymentModalOpen, setIsViewPaymentModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [isViewOrderModalOpen, setIsViewOrderModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isViewSubscriptionModalOpen, setIsViewSubscriptionModalOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [isViewContractModalOpen, setIsViewContractModalOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState(null)
  const [isViewTaskModalOpen, setIsViewTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isViewExpenseModalOpen, setIsViewExpenseModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [isViewNoteModalOpen, setIsViewNoteModalOpen] = useState(false)
  const [viewingNote, setViewingNote] = useState(null)

  // Editing states
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [editingSubscriptionId, setEditingSubscriptionId] = useState(null)

  // Form data
  const [contactFormData, setContactFormData] = useState({
    name: '',
    jobTitle: '',
    email: '',
    phone: '',
    isPrimary: false
  })

  const [noteFormData, setNoteFormData] = useState({
    content: ''
  })

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    dueDate: '',
    priority: 'medium',
    description: ''
  })

  const [expenseFormData, setExpenseFormData] = useState({
    title: '',
    amount: '',
    date: '',
    category: '',
    description: ''
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

  const [fileFormData, setFileFormData] = useState({
    title: '',
    category: '',
    description: '',
    file: null
  })

  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [filteredDepartments, setFilteredDepartments] = useState([])
  const [availableLabels, setAvailableLabels] = useState([])
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('')

  const [projectFormData, setProjectFormData] = useState({
    project_name: '',
    short_code: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    deadline: '',
    no_deadline: false,
    price: '',
    status: 'in progress',
    project_category: '',
    project_sub_category: '',
    department_id: '',
    project_manager_id: '',
    project_summary: '',
    notes: '',
    public_gantt_chart: 'enable',
    public_task_board: 'enable',
    task_approval: 'disable',
    label: '',
    project_members: [],
    project_type: 'Client Project'
  })

  // Fetch departments by company
  const fetchDepartments = async (companyId) => {
    try {
      const response = await departmentsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setFilteredDepartments(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      setFilteredDepartments([])
    }
  }

  // Fetch employees by company (and optionally department)
  const fetchEmployeesByCompany = async (companyId, departmentId = null) => {
    try {
      const params = { company_id: companyId }
      if (departmentId) {
        params.department_id = departmentId
      }
      const response = await employeesAPI.getAll(params)
      if (response.data.success) {
        setFilteredEmployees(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setFilteredEmployees([])
    }
  }

  // Fetch labels
  const fetchLabels = async (companyId) => {
    try {
      const response = await projectsAPI.getAllLabels({ company_id: companyId })
      if (response.data.success) {
        setAvailableLabels(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching labels:', error)
    }
  }

  useEffect(() => {
    const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
    if (companyId) {
      fetchDepartments(companyId)
      fetchEmployeesByCompany(companyId)
      fetchLabels(companyId)
    }
  }, [])

  useEffect(() => {
    const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
    if (companyId && projectFormData.department_id) {
      fetchEmployeesByCompany(companyId, projectFormData.department_id)
    }
  }, [projectFormData.department_id])

  const [invoiceFormData, setInvoiceFormData] = useState({
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    currency: 'USD',
    discount: 0,
    discount_type: '%',
    amount: '',
    note: '',
    terms: 'Thank you for your business.'
  })

  const [paymentFormData, setPaymentFormData] = useState({
    invoice_id: '',
    payment_method: 'Cash',
    paid_on: new Date().toISOString().split('T')[0],
    amount: '',
    note: ''
  })

  const [orderFormData, setOrderFormData] = useState({
    title: '',
    description: '',
    amount: '',
    status: 'New'
  })

  const [subscriptionFormData, setSubscriptionFormData] = useState({
    plan: '',
    amount: '',
    billing_cycle: 'Monthly',
    next_billing_date: ''
  })

  useEffect(() => {
    fetchClient()
    fetchClients()
  }, [id])

  useEffect(() => {
    if (client) {
      if (activeTab === 'projects') {
        fetchProjects()
      } else if (activeTab === 'subscriptions') {
        fetchSubscriptions()
      } else if (activeTab === 'invoices') {
        fetchInvoices()
      } else if (activeTab === 'payments') {
        fetchPayments()
        fetchInvoices() // Fetch invoices when payments tab is active
      } else if (activeTab === 'orders') {
        fetchOrders()
      } else if (activeTab === 'estimates') {
        fetchEstimates()
      } else if (activeTab === 'proposals') {
        fetchProposals()
      } else if (activeTab === 'contracts') {
        fetchContracts()
      } else if (activeTab === 'files') {
        fetchFiles()
      } else if (activeTab === 'expenses') {
        fetchExpenses()
      } else if (activeTab === 'notes') {
        fetchNotes()
      } else if (activeTab === 'tasks') {
        fetchTasks()
      } else if (activeTab === 'overview') {
        fetchInvoices()
        fetchProjects()
        fetchEstimates()
        fetchProposals()
        fetchSubscriptions()
        fetchOrders()
        fetchPayments()
        fetchExpenses()
        fetchNotes()
        fetchTasks()
      }
    }
  }, [client, activeTab])

  // Fetch invoices when payment modal opens
  useEffect(() => {
    if (isAddPaymentModalOpen) {
      // Always refresh invoices when payment modal opens to get latest data
      fetchInvoices()
    }
  }, [isAddPaymentModalOpen])

  const fetchClient = async () => {
    try {
      setLoading(true)
      // Get company_id from localStorage or user context
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchClient:', companyId)
        setLoading(false)
        return
      }
      const response = await clientsAPI.getById(id, { company_id: companyId })
      if (response.data.success) {
        const clientData = response.data.data
        setClient({
          id: clientData.id,
          client_name: clientData.client_name || clientData.name || clientData.company_name || '',
          name: clientData.client_name || clientData.name || clientData.company_name || '',
          companyName: clientData.company_name || '',
          email: clientData.email || '',
          phone: clientData.phone_number || clientData.phone || '',
          phoneCountryCode: clientData.phone_country_code || '+1',
          address: clientData.address || '',
          city: clientData.city || '',
          state: clientData.state || '',
          zip: clientData.zip || '',
          country: clientData.country || '',
          website: clientData.website || '',
          status: clientData.status || 'Active',
          ownerName: clientData.owner_name || '',
          contacts: clientData.contacts || [],
        })

        // Set contacts
        setContacts(clientData.contacts || [])
      }
    } catch (error) {
      console.error('Error fetching client:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      // Get company_id from localStorage
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchClients:', companyId)
        setClients([])
        return
      }
      const response = await clientsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        const fetchedClients = response.data.data || []
        const transformedClients = fetchedClients.map(client => ({
          id: client.id,
          client_name: client.client_name || client.name || client.company_name || '',
          name: client.client_name || client.name || client.company_name || '',
          companyName: client.company_name || '',
          email: client.email || '',
        }))
        setClients(transformedClients)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true)
      // Get company_id from localStorage
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchProjects:', companyId)
        setProjects([])
        setLoadingProjects(false)
        return
      }
      const response = await projectsAPI.getAll({ client_id: id, company_id: companyId })
      if (response.data.success) {
        setProjects(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
    } finally {
      setLoadingProjects(false)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true)
      // Get company_id from localStorage
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchSubscriptions:', companyId)
        setSubscriptions([])
        setLoadingSubscriptions(false)
        return
      }
      const clientIdNum = parseInt(id, 10)
      console.log('Fetching subscriptions for client_id:', clientIdNum, 'company_id:', companyId, 'id type:', typeof id, 'id value:', id)
      const response = await subscriptionsAPI.getAll({ client_id: clientIdNum, company_id: companyId })
      console.log('Subscriptions API response:', response.data)
      if (response.data.success) {
        const fetchedSubscriptions = response.data.data || []
        console.log('Fetched subscriptions count:', fetchedSubscriptions.length, 'Data:', fetchedSubscriptions) // Debug log

        // Log each subscription's client_id for debugging
        fetchedSubscriptions.forEach((sub, idx) => {
          console.log(`Subscription ${idx + 1}: id=${sub.id}, client_id=${sub.client_id}, plan=${sub.plan}`)
        })

        // Filter to ensure we only show subscriptions for this client
        const filteredSubscriptions = fetchedSubscriptions.filter(sub => {
          const subClientId = sub.client_id ? parseInt(sub.client_id, 10) : null
          const matches = subClientId === clientIdNum
          if (!matches) {
            console.warn(`Filtering out subscription ${sub.id} - client_id mismatch: ${subClientId} !== ${clientIdNum}`)
          }
          return matches
        })

        console.log('Filtered subscriptions count:', filteredSubscriptions.length)
        setSubscriptions(filteredSubscriptions)
      } else {
        console.error('Failed to fetch subscriptions:', response.data.error)
        setSubscriptions([])
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      console.error('Error details:', error.response?.data)
      setSubscriptions([])
    } finally {
      setLoadingSubscriptions(false)
    }
  }

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true)
      // Get company_id from localStorage
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchInvoices:', companyId)
        setInvoices([])
        setLoadingInvoices(false)
        return
      }
      console.log('Fetching invoices for client_id:', id, 'company_id:', companyId)
      const response = await invoicesAPI.getAll({ client_id: id, company_id: companyId })
      console.log('Invoices API response:', response.data)
      if (response.data.success) {
        const fetchedInvoices = response.data.data || []
        console.log('Fetched invoices:', fetchedInvoices)
        setInvoices(fetchedInvoices)
      } else {
        console.error('Failed to fetch invoices:', response.data.error)
        setInvoices([])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      console.error('Error details:', error.response?.data)
      setInvoices([])
    } finally {
      setLoadingInvoices(false)
    }
  }

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true)
      // Get company_id from localStorage
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchPayments:', companyId)
        setPayments([])
        setLoadingPayments(false)
        return
      }
      const response = await paymentsAPI.getAll({ client_id: id, company_id: companyId })
      if (response.data.success) {
        setPayments(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      setPayments([])
    } finally {
      setLoadingPayments(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true)
      // Get company_id from localStorage
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchOrders:', companyId)
        setOrders([])
        setLoadingOrders(false)
        return
      }
      const response = await ordersAPI.getAll({ client_id: id, company_id: companyId })
      if (response && response.data && response.data.success) {
        const ordersData = (response.data.data || []).map(order => ({
          id: order.id,
          company_id: order.company_id,
          client_id: order.client_id,
          client_name: order.client_name || '--',
          invoice_id: order.invoice_id,
          invoice_number: order.invoice_number || null,
          title: order.title || `Order #${order.id}`,
          description: order.description || '',
          amount: parseFloat(order.amount) || 0,
          status: order.status || 'New',
          order_date: order.order_date || order.created_at || '',
          created_at: order.created_at || '',
          items: order.items || [],
        }))
        setOrders(ordersData)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  const fetchEstimates = async () => {
    try {
      setLoadingEstimates(true)
      // Get company_id from localStorage
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchEstimates:', companyId)
        setEstimates([])
        setLoadingEstimates(false)
        return
      }
      const response = await estimatesAPI.getAll({ client_id: id, company_id: companyId })
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
      // Get company_id from localStorage
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchProposals:', companyId)
        setProposals([])
        setLoadingProposals(false)
        return
      }
      const response = await proposalsAPI.getAll({ client_id: id, company_id: companyId })
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
      // Get company_id from localStorage
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchContracts:', companyId)
        setContracts([])
        setLoadingContracts(false)
        return
      }
      const response = await contractsAPI.getAll({ client_id: id, company_id: companyId })
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
      // Get company_id from localStorage
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchFiles:', companyId)
        setFiles([])
        setLoadingFiles(false)
        return
      }
      const response = await documentsAPI.getAll({ client_id: id, company_id: companyId })
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

  const fetchExpenses = async () => {
    try {
      setLoadingExpenses(true)
      // Get company_id from localStorage
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchExpenses:', companyId)
        setExpenses([])
        setLoadingExpenses(false)
        return
      }
      // Expenses API doesn't have client_id filter, so fetch all and filter by client's leads
      const response = await expensesAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        // Get client's leads to filter expenses
        const leadsResponse = await clientsAPI.getAll({ company_id: companyId })
        let clientLeads = []
        if (leadsResponse.data.success) {
          // Filter expenses that are related to this client through leads
          // For now, show all expenses - can be filtered later if needed
          setExpenses(response.data.data || [])
        } else {
          setExpenses([])
        }
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
      setExpenses([])
    } finally {
      setLoadingExpenses(false)
    }
  }

  const fetchNotes = async () => {
    try {
      setLoadingNotes(true)
      // Get company_id from localStorage
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchNotes:', companyId)
        setNotes([])
        setLoadingNotes(false)
        return
      }
      const response = await notesAPI.getAll({ client_id: id, company_id: companyId })
      if (response.data.success) {
        const fetchedNotes = response.data.data || []
        console.log('Fetched notes:', fetchedNotes) // Debug log
        setNotes(fetchedNotes)
      } else {
        console.error('Failed to fetch notes:', response.data.error)
        setNotes([])
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      setNotes([])
    } finally {
      setLoadingNotes(false)
    }
  }

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true)
      // Get company_id from localStorage
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchTasks:', companyId)
        setTasks([])
        setLoadingTasks(false)
        return
      }
      // Fetch tasks by client_id directly
      const response = await tasksAPI.getAll({ client_id: id, company_id: companyId })
      if (response.data.success) {
        const fetchedTasks = response.data.data || []
        console.log('Fetched tasks:', fetchedTasks) // Debug log
        setTasks(fetchedTasks)
      } else {
        console.error('Failed to fetch tasks:', response.data.error)
        setTasks([])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setTasks([])
    } finally {
      setLoadingTasks(false)
    }
  }

  const filteredClients = clients.filter(c => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'my') return true
    return true
  }).filter(c => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    // Search by client name, name, or company name
    return c.client_name?.toLowerCase().includes(query) ||
      c.name?.toLowerCase().includes(query) ||
      c.companyName?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query)
  })

  // Calculate invoice stats
  const invoiceStats = {
    overdue: invoices.filter(inv => inv.status === 'Overdue'),
    notPaid: invoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Partially Paid'),
    fullyPaid: invoices.filter(inv => inv.status === 'Paid'),
    totalInvoiced: invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0),
    payments: invoices.reduce((sum, inv) => sum + parseFloat(inv.paid || 0), 0),
    due: invoices.reduce((sum, inv) => sum + parseFloat(inv.unpaid || 0), 0),
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportExcel = () => {
    let data = []
    let filename = `client-${client?.companyName}-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`

    switch (activeTab) {
      case 'projects': data = projects; break;
      case 'invoices': data = invoices; break;
      case 'payments': data = payments; break;
      case 'estimates': data = estimates; break;
      case 'proposals': data = proposals; break;
      case 'contracts': data = contracts; break;
      case 'expenses': data = expenses; break;
      case 'tasks': data = tasks; break;
      case 'files': data = files; break;
      case 'orders': data = orders; break;
      case 'subscriptions': data = subscriptions; break;
      default:
        alert('Export not supported for this tab');
        return;
    }

    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    // convert to CSV
    const replacer = (key, value) => value === null ? '' : value
    const header = Object.keys(data[0])
    const csv = [
      header.join(','), // header row first
      ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAddContact = async () => {
    if (!contactFormData.name || !contactFormData.email) {
      alert('Name and Email are required')
      return
    }

    try {
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      const response = await clientsAPI.addContact(id, {
        name: contactFormData.name,
        job_title: contactFormData.jobTitle,
        email: contactFormData.email,
        phone: contactFormData.phone,
        is_primary: contactFormData.isPrimary,
        company_id: companyId
      }, { company_id: companyId })

      if (response.data.success) {
        alert('Contact added successfully!')
        setIsAddContactModalOpen(false)
        setContactFormData({ name: '', jobTitle: '', email: '', phone: '', isPrimary: false })
        fetchClient()
      } else {
        alert(response.data.error || 'Failed to add contact')
      }
    } catch (error) {
      console.error('Error adding contact:', error)
      alert(error.response?.data?.error || 'Failed to add contact')
    }
  }

  const handleAddNote = async () => {
    try {
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      const noteData = {
        company_id: companyId,
        client_id: parseInt(id),
        content: noteFormData.content || '',
        title: null
      }

      let response
      if (selectedNote) {
        // Update existing note
        response = await notesAPI.update(selectedNote.id, noteData)
        if (response.data.success) {
          alert('Note updated successfully!')
        }
      } else {
        // Create new note
        response = await notesAPI.create(noteData)
        if (response.data.success) {
          alert('Note created successfully!')
        }
      }

      if (response.data.success) {
        setIsAddNoteModalOpen(false)
        setNoteFormData({ content: '' })
        setSelectedNote(null)
        // Wait a bit then fetch to ensure data is saved
        setTimeout(() => {
          fetchNotes()
        }, 500)
      } else {
        alert(response.data.error || 'Failed to save note')
      }
    } catch (error) {
      console.error('Error saving note:', error)
      alert(error.response?.data?.error || 'Failed to save note')
    }
  }

  const handleAddTask = async () => {
    try {
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      const taskData = {
        company_id: companyId,
        client_id: parseInt(id),
        title: taskFormData.title || null,
        due_date: taskFormData.dueDate || null,
        priority: taskFormData.priority || 'Medium',
        description: taskFormData.description || null,
        status: 'To do'
      }

      const response = await tasksAPI.create(taskData)
      if (response.data.success) {
        alert('Task created successfully!')
        setIsAddTaskModalOpen(false)
        setTaskFormData({ title: '', dueDate: '', priority: 'medium', description: '' })
        // Wait a bit then fetch to ensure data is saved
        setTimeout(() => {
          fetchTasks()
        }, 500)
      } else {
        alert(response.data.error || 'Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert(error.response?.data?.error || 'Failed to create task')
    }
  }

  // Add Estimate handler
  const handleAddEstimate = async () => {
    try {
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
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
        client_id: parseInt(id),
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
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
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
        client_id: parseInt(id),
        company_id: parseInt(companyId),
        items: []
      }

      const response = await proposalsAPI.create(proposalData)
      if (response.data.success) {
        alert('Proposal created successfully!')
        setIsAddProposalModalOpen(false)
        setProposalFormData({
          title: '', valid_till: '', currency: 'USD', description: '', note: '',
          terms: 'Thank you for your business.', discount: 0, discount_type: '%', amount: '', status: 'draft', client_id: null, project_id: null, items: []
        })
        fetchProposals()
      } else {
        alert(response.data.error || 'Failed to create proposal')
      }
    } catch (error) {
      console.error('Error creating proposal:', error)
      alert(error.response?.data?.error || 'Failed to create proposal')
    }
  }

  // Add Contract handler
  const handleAddContract = async () => {
    try {
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      const contractData = {
        title: contractFormData.title || null,
        contract_date: contractFormData.contract_date || null,
        valid_until: contractFormData.valid_until || null,
        tax: contractFormData.tax || null,
        second_tax: contractFormData.second_tax || null,
        note: contractFormData.note || '',
        amount: parseFloat(contractFormData.amount) || 0,
        status: (contractFormData.status || 'draft').toString().toLowerCase(),
        client_id: parseInt(id),
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

  // Add File handler
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
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      const uploadFormData = new FormData()
      uploadFormData.append('company_id', companyId)
      uploadFormData.append('client_id', id)
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

  const handleAddExpense = async () => {
    try {
      if (!expenseFormData.title) {
        alert('Expense title is required')
        return
      }
      if (!expenseFormData.amount || parseFloat(expenseFormData.amount) <= 0) {
        alert('Valid amount is required')
        return
      }

      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      const userId = parseInt(localStorage.getItem('userId') || 1, 10)

      // Check if editing existing expense
      if (selectedExpense) {
        const updateData = {
          description: expenseFormData.title,
          note: expenseFormData.description || '',
          status: expenseFormData.status || 'Pending',
          valid_till: expenseFormData.expense_date || expenseFormData.date || null
        }

        const response = await expensesAPI.update(selectedExpense.id, updateData)
        if (response.data.success) {
          alert('Expense updated successfully!')
          setIsAddExpenseModalOpen(false)
          setSelectedExpense(null)
          setExpenseFormData({ title: '', amount: '', date: '', category: '', description: '', status: 'Pending' })
          await fetchExpenses()
        } else {
          alert(response.data.error || 'Failed to update expense')
        }
        return
      }

      // Create new expense
      const leadId = null

      const expenseItem = {
        item_name: expenseFormData.title,
        description: expenseFormData.description || expenseFormData.title,
        quantity: 1,
        unit: 'Pcs',
        unit_price: parseFloat(expenseFormData.amount),
        tax: null,
        tax_rate: 0,
        amount: parseFloat(expenseFormData.amount)
      }

      const expenseData = {
        company_id: companyId,
        lead_id: leadId,
        description: expenseFormData.title,
        note: expenseFormData.description || '',
        currency: 'USD',
        discount: 0,
        discount_type: '%',
        valid_till: expenseFormData.date || null,
        items: [expenseItem],
        require_approval: 1,
        created_by: userId
      }

      const response = await expensesAPI.create(expenseData)
      if (response.data.success) {
        alert('Expense created successfully!')
        setIsAddExpenseModalOpen(false)
        setExpenseFormData({ title: '', amount: '', date: '', category: '', description: '', status: 'Pending' })
        await fetchExpenses()
      } else {
        alert(response.data.error || 'Failed to create expense')
      }
    } catch (error) {
      console.error('Error with expense:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to process expense'
      alert(errorMessage)
    }
  }

  // Add/Update Project handler
  const handleAddProject = async (shouldClose = true) => {
    try {
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)

      if (!projectFormData.project_name) {
        alert('Project Name is required')
        return
      }
      if (!projectFormData.start_date) {
        alert('Start Date is required')
        return
      }
      if (!projectFormData.no_deadline && !projectFormData.deadline) {
        alert('Deadline is required')
        return
      }

      // Ensure selected employee is included in members
      const managerId = parseInt(projectFormData.project_manager_id)
      const projectMembers = Array.isArray(projectFormData.project_members)
        ? [...projectFormData.project_members]
        : []

      if (managerId && !isNaN(managerId) && !projectMembers.includes(managerId)) {
        projectMembers.push(managerId)
      }

      const projectData = {
        company_id: companyId,
        client_id: parseInt(id),
        short_code: projectFormData.short_code || projectFormData.project_name.substring(0, 3).toUpperCase(),
        project_name: projectFormData.project_name,
        description: projectFormData.description || null,
        start_date: projectFormData.start_date,
        deadline: projectFormData.no_deadline ? null : projectFormData.deadline,
        no_deadline: projectFormData.no_deadline ? 1 : 0,
        budget: projectFormData.price ? parseFloat(projectFormData.price) : null,
        project_category: projectFormData.project_category || null,
        project_sub_category: projectFormData.project_sub_category || null,
        department_id: projectFormData.department_id || null,
        project_manager_id: managerId || null,
        project_summary: projectFormData.project_summary || null,
        notes: projectFormData.notes || null,
        public_gantt_chart: projectFormData.public_gantt_chart,
        public_task_board: projectFormData.public_task_board,
        task_approval: projectFormData.task_approval,
        label: projectFormData.label || null,
        project_members: projectMembers,
        status: projectFormData.status || 'in progress',
        price: projectFormData.price ? parseFloat(projectFormData.price) : 0
      }

      let response
      if (editingProjectId) {
        // Update existing project
        response = await projectsAPI.update(editingProjectId, projectData, { company_id: companyId })
        if (response.data.success) {
          alert('Project updated successfully!')
          if (shouldClose) setEditingProjectId(null)
        }
      } else {
        // Create new project
        response = await projectsAPI.create(projectData, { company_id: companyId })
        if (response.data.success) {
          alert('Project created successfully!')
        }
      }

      if (response.data.success) {
        if (shouldClose) {
          setIsAddProjectModalOpen(false)
        }
        // Reset form
        setProjectFormData({
          project_name: '', short_code: '', description: '', start_date: new Date().toISOString().split('T')[0],
          deadline: '', no_deadline: false, price: '', status: 'in progress', project_category: '', project_sub_category: '',
          department_id: '', project_manager_id: '', project_summary: '', notes: '',
          public_gantt_chart: 'enable', public_task_board: 'enable', task_approval: 'disable',
          label: '', project_members: [], project_type: 'Client Project'
        })
        // Wait a bit then fetch to ensure data is saved
        setTimeout(() => {
          fetchProjects()
        }, 500)
      } else {
        alert(response.data.error || 'Failed to save project')
      }
    } catch (error) {
      console.error('Error saving project:', error)
      alert(error.response?.data?.error || 'Failed to save project')
    }
  }

  // Add Invoice handler
  const handleAddInvoice = async () => {
    try {
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      const invoiceData = {
        company_id: companyId,
        client_id: parseInt(id),
        invoice_date: invoiceFormData.invoice_date || null,
        due_date: invoiceFormData.due_date || null,
        currency: invoiceFormData.currency || 'USD',
        discount: parseFloat(invoiceFormData.discount) || 0,
        discount_type: invoiceFormData.discount_type || '%',
        note: invoiceFormData.note || null,
        terms: invoiceFormData.terms || 'Thank you for your business.',
        items: invoiceFormData.amount ? [{
          item_name: 'Invoice Item',
          description: 'Invoice item',
          quantity: 1,
          unit_price: parseFloat(invoiceFormData.amount),
          amount: parseFloat(invoiceFormData.amount)
        }] : []
      }

      console.log('Creating invoice with data:', invoiceData)
      const response = await invoicesAPI.create(invoiceData)
      console.log('Invoice create response:', response.data)
      if (response.data.success) {
        alert('Invoice created successfully!')
        setIsAddInvoiceModalOpen(false)
        setInvoiceFormData({
          invoice_date: new Date().toISOString().split('T')[0], due_date: '',
          currency: 'USD', discount: 0, discount_type: '%', amount: '', note: '',
          terms: 'Thank you for your business.'
        })
        // Wait a bit then fetch to ensure data is saved
        setTimeout(() => {
          fetchInvoices()
        }, 500)
      } else {
        alert(response.data.error || 'Failed to create invoice')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      console.error('Error response:', error.response?.data)
      alert(error.response?.data?.error || 'Failed to create invoice')
    }
  }

  // Add Payment handler
  const handleAddPayment = async () => {
    try {
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      const paymentData = {
        company_id: companyId,
        client_id: parseInt(id),
        invoice_id: paymentFormData.invoice_id ? parseInt(paymentFormData.invoice_id) : null,
        paid_on: paymentFormData.paid_on || null,
        amount: paymentFormData.amount ? parseFloat(paymentFormData.amount) : null,
        payment_method: paymentFormData.payment_method || 'Cash',
        remark: paymentFormData.note || null
      }

      const response = await paymentsAPI.create(paymentData)
      if (response.data.success) {
        alert('Payment created successfully!')
        setIsAddPaymentModalOpen(false)
        setPaymentFormData({
          invoice_id: '',
          payment_method: 'Cash',
          paid_on: new Date().toISOString().split('T')[0],
          amount: '',
          note: ''
        })
        fetchPayments()
      } else {
        alert(response.data.error || 'Failed to create payment')
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      alert(error.response?.data?.error || 'Failed to create payment')
    }
  }

  // Create Contact Handler
  const handleCreateContact = async () => {
    try {
      if (!contactFormData.name || !contactFormData.email) {
        alert('Name and Email are required');
        return;
      }
      setCreateContactLoading(true);
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10);

      await contactsAPI.create({
        company_id: companyId,
        client_id: id,
        name: contactFormData.name,
        email: contactFormData.email,
        phone: contactFormData.phone,
        job_title: contactFormData.job_title,
        is_primary: false
      });

      alert('Contact added successfully!');
      setIsAddContactModalOpen(false);
      setContactFormData({ name: '', email: '', phone: '', job_title: '' });
      fetchClient(); // Refresh client to get new contacts
    } catch (error) {
      console.error('Error creating contact:', error);
      alert(error.response?.data?.error || 'Failed to create contact');
    } finally {
      setCreateContactLoading(false);
    }
  }

  // Add Order handler
  const handleAddOrder = async () => {
    try {
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      const orderData = {
        company_id: companyId,
        client_id: parseInt(id),
        title: orderFormData.title || null,
        description: orderFormData.description || null,
        amount: orderFormData.amount ? parseFloat(orderFormData.amount) : null,
        status: orderFormData.status || 'New'
      }

      const response = await ordersAPI.create(orderData)
      if (response.data.success) {
        alert('Order created successfully!')
        setIsAddOrderModalOpen(false)
        setOrderFormData({ title: '', description: '', amount: '', status: 'New' })
        fetchOrders()
      } else {
        alert(response.data.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert(error.response?.data?.error || 'Failed to create order')
    }
  }

  // Add/Update Subscription handler
  const handleAddSubscription = async () => {
    try {
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      const clientIdNum = parseInt(id, 10)
      const subscriptionData = {
        company_id: companyId,
        client_id: clientIdNum,
        plan: subscriptionFormData.plan || null,
        amount: subscriptionFormData.amount ? parseFloat(subscriptionFormData.amount) : null,
        billing_cycle: subscriptionFormData.billing_cycle || 'Monthly',
        next_billing_date: subscriptionFormData.next_billing_date || null
      }

      console.log('Creating/updating subscription with data:', subscriptionData, 'client_id type:', typeof clientIdNum, 'id from params:', id)

      let response
      if (editingSubscriptionId) {
        // Update existing subscription
        response = await subscriptionsAPI.update(editingSubscriptionId, subscriptionData, { company_id: companyId })
        if (response.data.success) {
          alert('Subscription updated successfully!')
          setEditingSubscriptionId(null)
        }
      } else {
        // Create new subscription
        response = await subscriptionsAPI.create(subscriptionData)
        console.log('Subscription create response:', response.data)
        if (response.data.success) {
          alert('Subscription created successfully!')
        }
      }

      if (response.data.success) {
        setIsAddSubscriptionModalOpen(false)
        setEditingSubscriptionId(null)
        setSubscriptionFormData({
          plan: '', amount: '', billing_cycle: 'Monthly', next_billing_date: ''
        })

        // If creating, add the new subscription to the list immediately
        if (!editingSubscriptionId && response.data.data) {
          const newSubscription = response.data.data
          console.log('Adding new subscription to state immediately:', newSubscription)
          // Ensure the subscription has the correct client_id
          if (newSubscription.client_id === parseInt(id, 10) || newSubscription.client_id === id) {
            setSubscriptions(prev => {
              // Check if subscription already exists to avoid duplicates
              const exists = prev.find(s => s.id === newSubscription.id)
              if (exists) {
                console.log('Subscription already in list, updating...')
                return prev.map(s => s.id === newSubscription.id ? newSubscription : s)
              }
              console.log('Adding new subscription to list')
              return [newSubscription, ...prev]
            })
          } else {
            console.warn('Subscription client_id mismatch:', newSubscription.client_id, 'expected:', id)
          }
        }

        // Immediately refresh the subscriptions list
        console.log('Refreshing subscriptions list...')
        await fetchSubscriptions()

        // Also fetch again after a short delay to ensure data is persisted
        setTimeout(() => {
          console.log('Double-checking subscriptions after create/update...')
          fetchSubscriptions()
        }, 1000)
      } else {
        alert(response.data.error || 'Failed to save subscription')
      }
    } catch (error) {
      console.error('Error saving subscription:', error)
      console.error('Error details:', error.response?.data)
      alert(error.response?.data?.error || 'Failed to save subscription')
    }
  }

  // View, Edit, Delete Handlers
  const handleViewProject = (project) => {
    // Navigate to project detail page or show in modal
    navigate(`/app/admin/projects/${project.id}`)
  }

  const handleEditProject = (project) => {
    // Set form data and open modal
    setEditingProjectId(project.id)
    setProjectFormData({
      project_name: project.project_name || project.name || '',
      short_code: project.short_code || project.code || '',
      description: project.description || '',
      start_date: project.start_date ? project.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
      deadline: project.deadline || project.end_date ? (project.deadline || project.end_date).split('T')[0] : '',
      no_deadline: project.no_deadline ? true : false,
      price: project.budget || project.price || '',
      status: project.status || 'in progress',
      project_category: project.project_category || '',
      project_sub_category: project.project_sub_category || '',
      department_id: project.department_id || '',
      project_manager_id: project.project_manager_id || '',
      project_summary: project.project_summary || '',
      notes: project.notes || '',
      public_gantt_chart: project.public_gantt_chart || 'enable',
      public_task_board: project.public_task_board || 'enable',
      task_approval: project.task_approval || 'disable',
      label: project.label || '',
      project_members: project.members ? project.members.map(m => parseInt(m.id || m.user_id)) : [],
      project_type: 'Client Project'
    })
    setIsAddProjectModalOpen(true)
  }

  const handleDeleteProject = async (project) => {
    if (window.confirm(`Are you sure you want to delete project "${project.project_name || project.name || project.id}"?`)) {
      try {
        const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
        await projectsAPI.delete(project.id, { company_id: companyId })
        alert('Project deleted successfully!')
        fetchProjects()
      } catch (error) {
        console.error('Error deleting project:', error)
        alert(error.response?.data?.error || 'Failed to delete project')
      }
    }
  }

  const handleViewInvoice = (invoice) => {
    navigate(`/app/admin/invoices/${invoice.id}`)
  }

  const handleEditInvoice = (invoice) => {
    navigate(`/app/admin/invoices/${invoice.id}?edit=true`)
  }

  const handleDeleteInvoice = async (invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoice_number || invoice.id}?`)) {
      try {
        const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
        await invoicesAPI.delete(invoice.id, { company_id: companyId })
        alert('Invoice deleted successfully!')
        fetchInvoices()
      } catch (error) {
        console.error('Error deleting invoice:', error)
        alert(error.response?.data?.error || 'Failed to delete invoice')
      }
    }
  }

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment)
    setIsViewPaymentModalOpen(true)
  }

  const handleEditPayment = (payment) => {
    setPaymentFormData({
      invoice_id: payment.invoice_id || '',
      payment_method: payment.payment_method || 'Cash',
      paid_on: payment.paid_on || payment.payment_date || new Date().toISOString().split('T')[0],
      amount: payment.amount || '',
      note: payment.remark || payment.note || ''
    })
    setIsAddPaymentModalOpen(true)
  }

  const handleDeletePayment = async (payment) => {
    if (window.confirm(`Are you sure you want to delete payment #${payment.id}?`)) {
      try {
        const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
        await paymentsAPI.delete(payment.id, { company_id: companyId })
        alert('Payment deleted successfully!')
        fetchPayments()
      } catch (error) {
        console.error('Error deleting payment:', error)
        alert(error.response?.data?.error || 'Failed to delete payment')
      }
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setIsViewOrderModalOpen(true)
  }

  const handleEditOrder = (order) => {
    setOrderFormData({
      title: order.title || '',
      description: order.description || '',
      amount: order.amount || '',
      status: order.status || 'New'
    })
    setIsAddOrderModalOpen(true)
  }

  const handleDeleteOrder = async (order) => {
    if (window.confirm(`Are you sure you want to delete order #${order.id}?`)) {
      try {
        const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
        await ordersAPI.delete(order.id, { company_id: companyId })
        alert('Order deleted successfully!')
        fetchOrders()
      } catch (error) {
        console.error('Error deleting order:', error)
        alert(error.response?.data?.error || 'Failed to delete order')
      }
    }
  }

  const handleViewSubscription = (subscription) => {
    setSelectedSubscription(subscription)
    setIsViewSubscriptionModalOpen(true)
  }

  const handleEditSubscription = (subscription) => {
    setEditingSubscriptionId(subscription.id)
    setSubscriptionFormData({
      plan: subscription.plan || subscription.title || subscription.plan_name || '',
      amount: subscription.amount || '',
      billing_cycle: subscription.billing_cycle || 'Monthly',
      next_billing_date: subscription.next_billing_date ? subscription.next_billing_date.split('T')[0] : ''
    })
    setIsAddSubscriptionModalOpen(true)
  }

  const handleDeleteSubscription = async (subscription) => {
    if (window.confirm(`Are you sure you want to delete subscription "${subscription.plan || subscription.id}"?`)) {
      try {
        const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
        await subscriptionsAPI.delete(subscription.id, { company_id: companyId })
        alert('Subscription deleted successfully!')
        fetchSubscriptions()
      } catch (error) {
        console.error('Error deleting subscription:', error)
        alert(error.response?.data?.error || 'Failed to delete subscription')
      }
    }
  }

  const handleViewEstimate = (estimate) => {
    navigate(`/app/admin/estimates/${estimate.id}`)
  }

  const handleEditEstimate = (estimate) => {
    setEstimateFormData({
      estimate_number: estimate.estimate_number || '',
      estimate_date: estimate.created_at ? estimate.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      valid_till: estimate.valid_till || '',
      currency: estimate.currency || 'USD',
      calculate_tax: estimate.calculate_tax || 'After Discount',
      description: estimate.description || '',
      note: estimate.note || '',
      terms: estimate.terms || 'Thank you for your business.',
      discount: estimate.discount || 0,
      discount_type: estimate.discount_type || '%',
      amount: estimate.total || estimate.sub_total || '',
      status: estimate.status || 'draft',
      client_id: estimate.client_id,
      project_id: estimate.project_id,
      items: []
    })
    setIsAddEstimateModalOpen(true)
  }

  const handleDeleteEstimate = async (estimate) => {
    if (window.confirm(`Are you sure you want to delete estimate ${estimate.estimate_number || estimate.id}?`)) {
      try {
        const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
        await estimatesAPI.delete(estimate.id, { company_id: companyId })
        alert('Estimate deleted successfully!')
        fetchEstimates()
      } catch (error) {
        console.error('Error deleting estimate:', error)
        alert(error.response?.data?.error || 'Failed to delete estimate')
      }
    }
  }

  const handleViewProposal = (proposal) => {
    navigate(`/app/admin/proposals/${proposal.id}`)
  }

  const handleEditProposal = (proposal) => {
    setProposalFormData({
      title: proposal.title || proposal.estimate_number || '',
      valid_till: proposal.valid_till || '',
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
      items: []
    })
    setIsAddProposalModalOpen(true)
  }

  const handleDeleteProposal = async (proposal) => {
    if (window.confirm(`Are you sure you want to delete proposal "${proposal.title || proposal.estimate_number || proposal.id}"?`)) {
      try {
        const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
        await proposalsAPI.delete(proposal.id, { company_id: companyId })
        alert('Proposal deleted successfully!')
        fetchProposals()
      } catch (error) {
        console.error('Error deleting proposal:', error)
        alert(error.response?.data?.error || 'Failed to delete proposal')
      }
    }
  }

  const handleViewContract = (contract) => {
    setSelectedContract(contract)
    setIsViewContractModalOpen(true)
  }

  const handleEditContract = (contract) => {
    setContractFormData({
      title: contract.title || '',
      contract_date: contract.contract_date || new Date().toISOString().split('T')[0],
      valid_until: contract.valid_until || '',
      tax: contract.tax || '',
      second_tax: contract.second_tax || '',
      note: contract.note || '',
      amount: contract.amount || '',
      status: contract.status || 'draft',
      client_id: contract.client_id,
      project_id: contract.project_id
    })
    setIsAddContractModalOpen(true)
  }

  const handleDeleteContract = async (contract) => {
    if (window.confirm(`Are you sure you want to delete contract "${contract.title || contract.id}"?`)) {
      try {
        const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
        await contractsAPI.delete(contract.id, { company_id: companyId })
        alert('Contract deleted successfully!')
        fetchContracts()
      } catch (error) {
        console.error('Error deleting contract:', error)
        alert(error.response?.data?.error || 'Failed to delete contract')
      }
    }
  }

  const handleViewFile = (file) => {
    if (file.file_path || file.url) {
      window.open(file.file_path || file.url, '_blank')
    } else {
      alert(`File Details:\nTitle: ${file.title || file.name || file.file_name || '-'}\nSize: ${file.size || '-'}\nUploaded By: ${file.user_name || '-'}\nUploaded Date: ${file.created_at ? new Date(file.created_at).toLocaleDateString() : '-'}`)
    }
  }

  const handleDeleteFile = async (file) => {
    if (window.confirm(`Are you sure you want to delete file "${file.title || file.name || file.file_name || file.id}"?`)) {
      try {
        const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
        await documentsAPI.delete(file.id, { company_id: companyId })
        alert('File deleted successfully!')
        fetchFiles()
      } catch (error) {
        console.error('Error deleting file:', error)
        alert(error.response?.data?.error || 'Failed to delete file')
      }
    }
  }

  const handleViewNote = (note) => {
    setViewingNote(note)
    setIsViewNoteModalOpen(true)
  }

  const handleEditNote = (note) => {
    setSelectedNote(note)
    setNoteFormData({
      content: note.content || note.note || ''
    })
    setIsAddNoteModalOpen(true)
  }

  const handleDeleteNote = async (note) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
        await notesAPI.delete(note.id, { company_id: companyId })
        alert('Note deleted successfully!')
        fetchNotes()
      } catch (error) {
        console.error('Error deleting note:', error)
        alert(error.response?.data?.error || 'Failed to delete note')
      }
    }
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setIsViewTaskModalOpen(true)
  }

  const handleEditTask = (task) => {
    setTaskFormData({
      title: task.title || '',
      dueDate: task.due_date ? task.due_date.split('T')[0] : '',
      priority: task.priority ? task.priority.toLowerCase() : 'medium',
      description: task.description || ''
    })
    setIsAddTaskModalOpen(true)
  }

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Are you sure you want to delete task "${task.title || task.id}"?`)) {
      try {
        const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
        await tasksAPI.delete(task.id, { company_id: companyId })
        alert('Task deleted successfully!')
        fetchTasks()
      } catch (error) {
        console.error('Error deleting task:', error)
        alert(error.response?.data?.error || 'Failed to delete task')
      }
    }
  }

  const handleViewExpense = (expense) => {
    setSelectedExpense(expense)
    setIsViewExpenseModalOpen(true)
  }

  const handleEditExpense = (expense) => {
    setExpenseFormData({
      title: expense.title || expense.expense_name || '',
      amount: expense.total || expense.amount || '',
      description: expense.description || '',
      status: expense.status || 'Pending',
      expense_date: expense.expense_date ? expense.expense_date.split('T')[0] : new Date().toISOString().split('T')[0]
    })
    setSelectedExpense(expense)
    setIsAddExpenseModalOpen(true)
  }

  const handleDeleteExpense = async (expense) => {
    if (window.confirm(`Are you sure you want to delete expense "${expense.title || expense.expense_name || expense.id}"?`)) {
      try {
        const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
        await expensesAPI.delete(expense.id, { company_id: companyId })
        alert('Expense deleted successfully!')
        fetchExpenses()
      } catch (error) {
        console.error('Error deleting expense:', error)
        alert(error.response?.data?.error || 'Failed to delete expense')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-primary-text">Loading...</div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-primary-text">Client not found</div>
      </div>
    )
  }

  const primaryContact = contacts.find(c => c.is_primary) || contacts[0] || null

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] overflow-hidden bg-gray-50 relative w-full">
      {/* Main Content - Full Page Layout (No Sidebar) */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                onClick={() => navigate('/app/admin/clients')}
                className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0 transition-colors"
              >
                <IoArrowBack size={20} />
              </button>
              <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-text truncate">{client.client_name || client.name || client.companyName}</h1>
                <div className="flex flex-wrap gap-1 ml-2">
                  {client.labelDetails && client.labelDetails.map((label, idx) => (
                    <Badge
                      key={idx}
                      className="text-[10px] px-1.5 py-0.5 text-white"
                      style={{ backgroundColor: label.color || '#3b82f6' }}
                    >
                      {label.label}
                    </Badge>
                  ))}
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-lg flex-shrink-0">
                  <IoStar size={18} className="text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded-lg flex-shrink-0">
                  <IoHelpCircle size={18} className="text-gray-400" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all duration-200"
              >
                <IoFilter size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all duration-200"
              >
                <IoDownload size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Excel</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all duration-200"
              >
                <IoPrint size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 overflow-x-auto -mx-3 sm:-mx-4 px-3 sm:px-4 tabs-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
            {['Overview', 'Contacts', 'Projects', 'Tasks', 'Proposals', 'Estimates', 'Invoices', 'Payments', 'Statement', 'Contracts', 'Expenses', 'Files', 'Notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0 ${activeTab === tab.toLowerCase()
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
          {activeTab === 'overview' && (
            <div className="flex gap-6 max-w-7xl mx-auto">
              {/* LEFT COLUMN - Stats & Invoice Overview */}
              <div className="flex-1 min-w-0 space-y-6">
                {/* Stats Cards Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <Card className="p-4 bg-white border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                    <p className="text-sm text-gray-600">Projects</p>
                  </Card>
                  <Card className="p-4 bg-white border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
                    <p className="text-sm text-gray-600">Subscriptions</p>
                  </Card>
                  <Card className="p-4 bg-white border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                    <p className="text-sm text-gray-600">Orders</p>
                  </Card>
                  <Card className="p-4 bg-white border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-gray-900">{estimates.length}</p>
                    <p className="text-sm text-gray-600">Estimates</p>
                  </Card>
                  <Card className="p-4 bg-white border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-gray-900">{proposals.length}</p>
                    <p className="text-sm text-gray-600">Proposals</p>
                  </Card>
                </div>

                {/* Invoice Overview Section */}
                <Card className="p-6 bg-white border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Invoice Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Not paid</span>
                      <div className="flex items-center gap-4 flex-1 ml-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${invoices.filter(i => i.status === 'unpaid').length > 0 ? (invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + parseFloat(i.total || 0), 0) / invoices.reduce((sum, i) => sum + parseFloat(i.total || 0), 0) * 100) : 0}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-[80px] text-right">
                          {formatCurrency(invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + parseFloat(i.total || 0), 0))}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total invoiced</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(invoices.reduce((sum, i) => sum + parseFloat(i.total || 0), 0))}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Payments</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0))}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Due</span>
                      <span className="text-sm font-medium text-red-600">{formatCurrency(invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + parseFloat(i.unpaid || i.total || 0), 0))}</span>
                    </div>
                  </div>
                  {/* Chart Placeholder */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4">Last 12 months</p>
                    <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                      Chart placeholder
                    </div>
                  </div>
                </Card>

                {/* Contacts Section */}
                <Card className="p-6 bg-white border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <IoPerson className="text-primary-accent" size={20} />
                      <h3 className="text-lg font-semibold text-primary-text">Contacts</h3>
                    </div>
                    <button
                      onClick={() => setIsAddContactModalOpen(true)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <IoAdd size={16} />
                      Add Contact
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {contacts.map((contact, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <IoPerson className="text-blue-600" size={16} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{contact.name || contact.client_name || 'Contact Name'}</p>
                              <p className="text-sm text-gray-600 truncate">{contact.email || '-'}</p>
                              <p className="text-sm text-gray-600">{contact.phone || '-'}</p>
                              {contact.job_title && <p className="text-xs text-gray-500 mt-1">{contact.job_title}</p>}
                            </div>
                          </div>
                          {contact.is_primary && <Badge className="text-xs bg-blue-100 text-blue-800">Primary</Badge>}
                        </div>
                      </div>
                    ))}
                    {contacts.length === 0 && (
                      <div className="col-span-full text-center py-4 text-gray-500 text-sm">
                        No contacts found.
                      </div>
                    )}
                  </div>
                </Card>

                {/* Projects Section */}
                <Card className="p-6 bg-white border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <IoBriefcase className="text-primary-accent" size={20} />
                      <h3 className="text-lg font-semibold text-primary-text">Projects</h3>
                    </div>
                    <button onClick={() => setActiveTab('projects')} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                      View All <IoChevronDown size={14} className="-rotate-90" />
                    </button>
                  </div>
                  {projects.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-gray-500 border-b border-gray-100">
                          <tr>
                            <th className="text-left pb-3 font-medium">Project Name</th>
                            <th className="text-left pb-3 font-medium">Deadline</th>
                            <th className="text-left pb-3 font-medium">Status</th>
                            <th className="text-right pb-3 font-medium">Progress</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {projects.slice(0, 5).map(p => (
                            <tr key={p.id} className="group hover:bg-gray-50">
                              <td className="py-3 text-blue-600 font-medium cursor-pointer" onClick={() => navigate(`/app/admin/projects/${p.id}`)}>
                                {p.project_name || p.name}
                              </td>
                              <td className="py-3 text-gray-600">{p.deadline ? formatDate(p.deadline) : '-'}</td>
                              <td className="py-3">
                                <Badge className={`px-2 py-0.5 text-xs rounded-full ${p.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    p.status === 'in progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {p.status || 'Active'}
                                </Badge>
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${p.progress || 0}%` }}></div>
                                  </div>
                                  <span className="text-xs text-gray-600">{p.progress || 0}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No projects found.</p>
                  )}
                </Card>

                {/* 4. Tasks */}
                <Card className="p-6 bg-white border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <IoList className="text-primary-accent" size={20} />
                      <h3 className="text-lg font-semibold text-primary-text">Tasks</h3>
                    </div>
                    <button onClick={() => setActiveTab('tasks')} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                      View All <IoChevronDown size={14} className="-rotate-90" />
                    </button>
                  </div>
                  {tasks.length > 0 ? (
                    <div className="space-y-3">
                      {tasks.slice(0, 5).map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleViewTask(task)}>
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{task.title}</p>
                              <p className="text-xs text-gray-500">{task.project_name ? `Project: ${task.project_name}` : 'No Project'} • Due: {task.due_date ? formatDate(task.due_date) : '-'}</p>
                            </div>
                          </div>
                          <Badge className="text-xs bg-white border border-gray-200">
                            {task.status || 'To Do'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No tasks found.</p>
                  )}
                </Card>

                {/* 5. Notes */}
                <Card className="p-6 bg-white border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <IoDocumentText className="text-primary-accent" size={20} />
                      <h3 className="text-lg font-semibold text-primary-text">Notes</h3>
                    </div>
                    <button onClick={() => setActiveTab('notes')} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                      View All <IoChevronDown size={14} className="-rotate-90" />
                    </button>
                  </div>
                  {notes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {notes.slice(0, 3).map(note => (
                        <div key={note.id} className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg cursor-pointer hover:shadow-sm" onClick={() => handleViewNote(note)}>
                          <p className="text-sm text-gray-800 line-clamp-3">{note.content || note.note}</p>
                          <p className="text-xs text-gray-500 mt-2">{formatDate(note.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No notes found.</p>
                  )}
                </Card>

                {/* 6. Activity (Events) */}
                <Card className="p-6 bg-white border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <IoCalendar className="text-primary-accent" size={20} />
                      <h3 className="text-lg font-semibold text-primary-text">Recent Events</h3>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Placeholder for now as actual 'events' state usage wasn't explicit in snippet, but assuming static provided structure or if 'events' state exists */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <IoCheckmarkCircle className="text-green-600" size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Invoice paid</p>
                        <p className="text-xs text-gray-600 mt-1">Invoice #INV-001 was paid</p>
                        <p className="text-xs text-gray-500 mt-2">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                </Card>

              </div>

              {/* RIGHT SIDEBAR - Client Info & Tasks */}
              <div className="w-80 flex-shrink-0 space-y-6 hidden lg:block">
                {/* Client Info Section */}
                <Card className="p-6 bg-white border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <IoBriefcase className="text-gray-600" size={18} />
                      <h3 className="text-sm font-semibold text-gray-900">Client info</h3>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <IoEllipsisVertical className="text-gray-400" size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Person</p>
                      <p className="text-sm text-gray-900">{client?.type || 'Organization'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <Badge className={`text-xs px-2 py-0.5 ${client?.status === 'Inactive' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800'}`}>
                        {client?.status || 'Active'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Label</p>
                      <Badge className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800">
                        {client?.label || 'VIP'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Primary contact</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <IoPerson className="text-blue-600" size={14} />
                        </div>
                        <span className="text-sm text-gray-900">
                          {contacts.find(c => c.is_primary)?.name || contacts[0]?.name || client?.client_name || '-'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        + Add Managers
                      </button>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="text-sm text-gray-900">
                        {[client?.address, client?.city, client?.state, client?.country].filter(Boolean).join(', ') || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="text-sm text-gray-900">{client?.phone ? `${client?.phoneCountryCode || ''} ${client?.phone}` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Site</p>
                      {client?.website ? (
                        <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          {client.website}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-500">-</p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Tasks Section */}
                <Card className="p-6 bg-white border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <IoList className="text-gray-600" size={18} />
                      <h3 className="text-sm font-semibold text-gray-900">Tasks</h3>
                    </div>
                    <button
                      onClick={() => setIsAddTaskModalOpen(true)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <IoAdd size={16} />
                      Add task
                    </button>
                  </div>

                  <div className="space-y-2">
                    {tasks.slice(0, 5).map((task, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs px-1.5 py-0.5 ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority || 'Medium'}
                          </Badge>
                          {task.due_date && (
                            <span className="text-xs text-gray-500">{formatDate(task.due_date)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No tasks yet</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-primary-text">Contacts</h2>
                  <p className="text-sm text-secondary-text mt-1">Manage client contacts</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <IoMail size={16} />
                    Send invitation
                  </button>
                  <Button
                    variant="primary"
                    onClick={() => setIsAddContactModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoPersonAdd size={18} />
                    Add Contact
                  </Button>
                </div>
              </div>

              {/* Contacts Table */}
              {contacts.length === 0 ? (
                <Card className="p-6">
                  <div className="text-center py-8">
                    <IoPerson size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-secondary-text">No contacts found</p>
                    <Button
                      variant="primary"
                      onClick={() => setIsAddContactModalOpen(true)}
                      className="mt-4 flex items-center gap-2 mx-auto"
                    >
                      <IoPersonAdd size={18} />
                      Add First Contact
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                  {/* Mobile: Cards View */}
                  <div className="block sm:hidden">
                    <div className="space-y-3 p-4">
                      {contacts.map((contact, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <IoPerson className="text-blue-600" size={20} />
                              </div>
                              <div>
                                <p className="font-medium text-primary-text">{contact.name}</p>
                                <p className="text-xs text-secondary-text">{contact.job_title || 'No title'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit"
                              >
                                <IoCreate size={18} />
                              </button>
                              <button
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                <IoTrash size={18} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
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
                          {contact.is_primary && (
                            <Badge className="mt-2 text-xs bg-blue-100 text-blue-800">Primary</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop: Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead className="bg-white border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Job Title</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {contacts.map((contact, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <IoPerson className="text-blue-600" size={14} />
                                </div>
                                <span className="text-sm font-medium text-gray-900">{contact.name || '-'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{contact.job_title || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {contact.email ? (
                                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">{contact.email}</a>
                              ) : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {contact.phone ? (
                                <a href={`tel:${contact.phone}`} className="text-gray-900">{contact.phone}</a>
                              ) : '-'}
                            </td>
                            <td className="px-6 py-4">
                              {contact.is_primary ? (
                                <Badge className="text-xs bg-blue-100 text-blue-800">Primary</Badge>
                              ) : (
                                <Badge className="text-xs bg-gray-100 text-gray-600">Contact</Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  className="p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded-full hover:bg-blue-50 transition-colors"
                                  title="Edit"
                                >
                                  <IoCreate size={14} />
                                </button>
                                <button
                                  className="p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded-full hover:bg-red-50 transition-colors"
                                  title="Delete"
                                >
                                  <IoTrash size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2">
                      <select className="border border-gray-300 rounded p-1 text-xs text-gray-600 outline-none">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                      </select>
                      <span className="text-xs text-gray-500">1-{contacts.length}/{contacts.length}</span>
                    </div>
                    <div className="flex gap-1">
                      <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50 text-gray-500"><IoChevronDown className="rotate-90" size={14} /></button>
                      <button className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 text-gray-700 text-xs font-medium">1</button>
                      <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"><IoChevronDown className="-rotate-90" size={14} /></button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4">
              {/* Actions & Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50">
                    <IoList size={18} />
                  </button>
                  <div className="relative">
                    <select
                      className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
                      value={projectFilterStatus}
                      onChange={(e) => setProjectFilterStatus(e.target.value)}
                    >
                      <option value="all">Status</option>
                      <option value="in progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={handleExportExcel} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Excel</button>
                  <button onClick={handlePrint} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Print</button>
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full sm:w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                    />
                    <IoSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setIsAddProjectModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add project
                  </Button>
                </div>
              </div>

              {/* Project Table */}
              <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                {loadingProjects ? (
                  <div className="text-center py-8 text-secondary-text">Loading...</div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-12 text-secondary-text">
                    <IoBriefcase size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No projects found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-white border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-20">
                            <div className="flex items-center gap-1 cursor-pointer">ID <IoChevronDown size={12} /></div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Project Name</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Members</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Deadline</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-32">Progress</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {projects
                          .filter(p => {
                            const matchesStatus = projectFilterStatus === 'all' || (p.status && p.status.toLowerCase() === projectFilterStatus.toLowerCase());
                            const searchLower = projectSearch.toLowerCase();
                            const matchesSearch = !projectSearch ||
                              (p.project_name && p.project_name.toLowerCase().includes(searchLower)) ||
                              (p.id && p.id.toString().includes(searchLower));
                            return matchesStatus && matchesSearch;
                          })
                          .map((project) => (
                            <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-blue-600 group cursor-pointer hover:underline" onClick={() => handleViewProject(project)}>
                                {project.id}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col items-start">
                                  <div className="text-sm font-medium text-blue-600 hover:underline cursor-pointer" onClick={() => handleViewProject(project)}>
                                    {project.project_name || project.name}
                                  </div>
                                  {project.label && (
                                    <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-medium bg-orange-500 text-white">
                                      {project.label}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex -space-x-2 overflow-hidden">
                                  {(project.members || []).map((member, idx) => (
                                    <div key={idx} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600" title={member.name || member.user?.name}>
                                      {(member.name || member.user?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                  ))}
                                  {(!project.members || project.members.length === 0) && <span className="text-gray-400 text-xs">-</span>}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {project.deadline ? formatDate(project.deadline) : '-'}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 flex-1 overflow-hidden">
                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                                  </div>
                                  <span className="text-xs text-gray-600">{project.progress || 0}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                  ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    project.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                                      project.status === 'on hold' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'}`}>
                                  {project.status || 'Active'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEditProject(project)} className="p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded-full hover:bg-blue-50 transition-colors" title="Edit">
                                    <IoCreate size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteProject(project)} className="p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded-full hover:bg-red-50 transition-colors" title="Delete">
                                    <IoClose size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {/* Pagination - Visual Only */}
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-2">
                        <select className="border border-gray-300 rounded p-1 text-xs text-gray-600 outline-none">
                          <option>10</option>
                          <option>20</option>
                          <option>50</option>
                        </select>
                        <span className="text-xs text-gray-500">1-{projects.length}/{projects.length}</span>
                      </div>
                      <div className="flex gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50 text-gray-500"><IoChevronDown className="rotate-90" size={14} /></button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 text-gray-700 text-xs font-medium">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50 text-gray-500"><IoChevronDown className="rotate-270" size={14} /></button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                      value={subscriptionFilterStatus}
                      onChange={(e) => setSubscriptionFilterStatus(e.target.value)}
                    >
                      <option value="all">Status</option>
                      <option value="active">Active</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="paused">Paused</option>
                    </select>
                    <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={handleExportExcel} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Excel</button>
                  <button onClick={handlePrint} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Print</button>
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Search Subscription"
                      className="w-full sm:w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={subscriptionSearch}
                      onChange={(e) => setSubscriptionSearch(e.target.value)}
                    />
                    <IoSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setIsAddSubscriptionModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add Subscription
                  </Button>
                </div>
              </div>

              <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                {loadingSubscriptions ? (
                  <div className="text-center py-8 text-secondary-text">Loading...</div>
                ) : subscriptions.length === 0 ? (
                  <div className="text-center py-12 text-secondary-text">
                    <IoCard size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No subscriptions found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-white border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Plan Name</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Billing Cycle</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Next Billing Date</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {subscriptions
                          .filter(sub => {
                            const matchesStatus = subscriptionFilterStatus === 'all' || (sub.status && sub.status.toLowerCase() === subscriptionFilterStatus.toLowerCase());
                            const searchLower = subscriptionSearch.toLowerCase();
                            const matchesSearch = !subscriptionSearch || (sub.plan && sub.plan.toLowerCase().includes(searchLower)) || (sub.title && sub.title.toLowerCase().includes(searchLower));
                            return matchesStatus && matchesSearch;
                          })
                          .map((subscription) => (
                            <tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => handleViewSubscription(subscription)}>
                                {subscription.plan || subscription.title || subscription.plan_name || `Subscription ${subscription.id}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(subscription.amount || 0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {subscription.billing_cycle || 'Monthly'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${subscription.status === 'Active' ? 'bg-green-100 text-green-800' :
                                  subscription.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                    subscription.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {subscription.status || 'Active'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {subscription.next_billing_date ? formatDate(subscription.next_billing_date) : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEditSubscription(subscription)} className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                                    <IoCreate size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteSubscription(subscription)} className="p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded-full hover:bg-red-50 transition-colors">
                                    <IoClose size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                      value={invoiceFilterStatus}
                      onChange={(e) => setInvoiceFilterStatus(e.target.value)}
                    >
                      <option value="all">Status</option>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="partial">Partially Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="draft">Draft</option>
                    </select>
                    <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={handleExportExcel} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Excel</button>
                  <button onClick={handlePrint} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Print</button>
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Search Invoice"
                      className="w-full sm:w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                    />
                    <IoSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setIsAddInvoiceModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add Invoice
                  </Button>
                </div>
              </div>

              <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                {loadingInvoices ? (
                  <div className="text-center py-8 text-secondary-text">Loading...</div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-12 text-secondary-text">
                    <IoDocumentText size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No invoices found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-white border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Due</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoices
                          .filter(inv => {
                            const matchesStatus = invoiceFilterStatus === 'all' || (inv.status && inv.status.toLowerCase() === invoiceFilterStatus.toLowerCase());
                            const searchLower = invoiceSearch.toLowerCase();
                            const matchesSearch = !invoiceSearch || (inv.invoice_number && inv.invoice_number.toLowerCase().includes(searchLower)) || (inv.id && inv.id.toString().includes(searchLower));
                            return matchesStatus && matchesSearch;
                          })
                          .map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => handleViewInvoice(invoice)}>
                                {invoice.invoice_number || `INV-${invoice.id}`}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {formatCurrency(invoice.total || 0)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {formatCurrency(invoice.unpaid || 0)}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                  invoice.status === 'Unpaid' ? 'bg-red-100 text-red-800' :
                                    invoice.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                  }`}>
                                  {invoice.status || 'Unpaid'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {invoice.issue_date ? formatDate(invoice.issue_date) : '-'}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEditInvoice(invoice)} className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                                    <IoCreate size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteInvoice(invoice)} className="p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded-full hover:bg-red-50 transition-colors">
                                    <IoClose size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                      value={paymentFilterStatus}
                      onChange={(e) => setPaymentFilterStatus(e.target.value)}
                    >
                      <option value="all">Status</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                    </select>
                    <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={handleExportExcel} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Excel</button>
                  <button onClick={handlePrint} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Print</button>
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full sm:w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                    />
                    <IoSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <Button
                    variant="primary"
                    onClick={async () => {
                      // Fetch invoices before opening modal
                      await fetchInvoices()
                      console.log('Invoices after fetch:', invoices)
                      setIsAddPaymentModalOpen(true)
                    }}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add Payment
                  </Button>
                </div>
              </div>

              <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                {loadingPayments ? (
                  <div className="text-center py-8 text-secondary-text">Loading...</div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-12 text-secondary-text">
                    <IoCash size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No payments found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-white border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payments
                          .filter(p => {
                            const matchesStatus = paymentFilterStatus === 'all' || (p.status && p.status.toLowerCase() === paymentFilterStatus.toLowerCase());
                            const searchLower = paymentSearch.toLowerCase();
                            const matchesSearch = !paymentSearch || (p.id && p.id.toString().includes(searchLower));
                            return matchesStatus && matchesSearch;
                          })
                          .map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => handleViewPayment(payment)}>
                                #{payment.id}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {formatCurrency(payment.amount || 0)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {payment.paid_on || payment.payment_date ? formatDate(payment.paid_on || payment.payment_date) : '-'}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800`}>
                                  Completed
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleViewPayment(payment)} className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                                    <IoEye size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'statement' && (
            <Card className="p-3 sm:p-4 md:p-6">
              <div className="text-center py-6 sm:py-8 text-secondary-text">
                <IoDocumentText size={40} className="sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Statement view will be displayed here</p>
              </div>
            </Card>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                      value={orderFilterStatus}
                      onChange={(e) => setOrderFilterStatus(e.target.value)}
                    >
                      <option value="all">Status</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={handleExportExcel} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Excel</button>
                  <button onClick={handlePrint} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Print</button>
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Search Order"
                      className="w-full sm:w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                    />
                    <IoSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setIsAddOrderModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add Order
                  </Button>
                </div>
              </div>

              <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                {loadingOrders ? (
                  <div className="text-center py-8 text-secondary-text">Loading...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-secondary-text">
                    <IoReceipt size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No orders found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-white border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders
                          .filter(order => {
                            const matchesStatus = orderFilterStatus === 'all' || (order.status && order.status.toLowerCase() === orderFilterStatus.toLowerCase());
                            const searchLower = orderSearch.toLowerCase();
                            const matchesSearch = !orderSearch || (order.title && order.title.toLowerCase().includes(searchLower)) || (order.id && order.id.toString().includes(searchLower));
                            return matchesStatus && matchesSearch;
                          })
                          .map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => handleViewOrder(order)}>
                                {order.title || `Order #${order.id}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.order_date ? formatDate(order.order_date) : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(order.amount || order.total || 0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.status === 'Paid' || order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {order.status || 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.invoice_number || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleViewOrder(order)} className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                                    <IoEye size={14} />
                                  </button>
                                  <button onClick={() => handleEditOrder(order)} className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                                    <IoCreate size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteOrder(order)} className="p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded-full hover:bg-red-50 transition-colors">
                                    <IoClose size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'estimates' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                      value={estimateFilterStatus}
                      onChange={(e) => setEstimateFilterStatus(e.target.value)}
                    >
                      <option value="all">Status</option>
                      <option value="accepted">Accepted</option>
                      <option value="waiting">Waiting</option>
                      <option value="sent">Sent</option>
                      <option value="draft">Draft</option>
                      <option value="declined">Declined</option>
                    </select>
                    <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={handleExportExcel} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Excel</button>
                  <button onClick={handlePrint} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Print</button>
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Search Estimate"
                      className="w-full sm:w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={estimateSearch}
                      onChange={(e) => setEstimateSearch(e.target.value)}
                    />
                    <IoSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setIsAddEstimateModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add Estimate
                  </Button>
                </div>
              </div>

              <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                {loadingEstimates ? (
                  <div className="text-center py-8 text-secondary-text">Loading...</div>
                ) : estimates.length === 0 ? (
                  <div className="text-center py-12 text-secondary-text">
                    <IoDocumentText size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No estimates found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-white border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estimate</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {estimates
                          .filter(est => {
                            const matchesStatus = estimateFilterStatus === 'all' || (est.status && est.status.toLowerCase() === estimateFilterStatus.toLowerCase());
                            const searchLower = estimateSearch.toLowerCase();
                            const matchesSearch = !estimateSearch || (est.estimate_number && est.estimate_number.toLowerCase().includes(searchLower));
                            return matchesStatus && matchesSearch;
                          })
                          .map((estimate) => (
                            <tr key={estimate.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => handleViewEstimate(estimate)}>
                                {estimate.estimate_number || `EST-${estimate.id}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {estimate.valid_till ? formatDate(estimate.valid_till) : (estimate.created_at ? formatDate(estimate.created_at) : '-')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(estimate.total || 0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${estimate.status === 'Accepted' || estimate.status === 'Sent' ? 'bg-green-100 text-green-800' :
                                  estimate.status === 'Declined' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                  {estimate.status || 'Draft'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEditEstimate(estimate)} className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                                    <IoCreate size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteEstimate(estimate)} className="p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded-full hover:bg-red-50 transition-colors">
                                    <IoClose size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'proposals' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                      value={proposalFilterStatus}
                      onChange={(e) => setProposalFilterStatus(e.target.value)}
                    >
                      <option value="all">Status</option>
                      <option value="accepted">Accepted</option>
                      <option value="waiting">Waiting</option>
                      <option value="sent">Sent</option>
                      <option value="draft">Draft</option>
                      <option value="declined">Declined</option>
                    </select>
                    <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={handleExportExcel} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Excel</button>
                  <button onClick={handlePrint} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Print</button>
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Search Proposal"
                      className="w-full sm:w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={proposalSearch}
                      onChange={(e) => setProposalSearch(e.target.value)}
                    />
                    <IoSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setIsAddProposalModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add Proposal
                  </Button>
                </div>
              </div>

              <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                {loadingProposals ? (
                  <div className="text-center py-8 text-secondary-text">Loading...</div>
                ) : proposals.length === 0 ? (
                  <div className="text-center py-12 text-secondary-text">
                    <IoDocumentText size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No proposals found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-white border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Proposal</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Valid Until</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sent</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {proposals
                          .filter(prop => {
                            const matchesStatus = proposalFilterStatus === 'all' || (prop.status && prop.status.toLowerCase() === proposalFilterStatus.toLowerCase());
                            const searchLower = proposalSearch.toLowerCase();
                            const matchesSearch = !proposalSearch || (prop.title && prop.title.toLowerCase().includes(searchLower)) || (prop.id && prop.id.toString().includes(searchLower));
                            return matchesStatus && matchesSearch;
                          })
                          .map((proposal) => (
                            <tr key={proposal.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => handleViewProposal(proposal)}>
                                {proposal.estimate_number || proposal.title || `Proposal ${proposal.id}`}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {proposal.created_at ? formatDate(proposal.created_at) : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {proposal.valid_till ? formatDate(proposal.valid_till) : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {proposal.sent_at ? formatDate(proposal.sent_at) : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {formatCurrency(proposal.total || 0)}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${proposal.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                  proposal.status === 'Declined' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {proposal.status || 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEditProposal(proposal)} className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                                    <IoCreate size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteProposal(proposal)} className="p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded-full hover:bg-red-50 transition-colors">
                                    <IoClose size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                      value={contractFilterStatus}
                      onChange={(e) => setContractFilterStatus(e.target.value)}
                    >
                      <option value="all">Status</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="draft">Draft</option>
                    </select>
                    <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={handleExportExcel} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Excel</button>
                  <button onClick={handlePrint} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Print</button>
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Search Contract"
                      className="w-full sm:w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={contractSearch}
                      onChange={(e) => setContractSearch(e.target.value)}
                    />
                    <IoSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setIsAddContractModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add Contract
                  </Button>
                </div>
              </div>

              <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                {loadingContracts ? (
                  <div className="text-center py-8 text-secondary-text">Loading...</div>
                ) : contracts.length === 0 ? (
                  <div className="text-center py-12 text-secondary-text">
                    <IoDocumentText size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No contracts found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-white border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contract</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Valid Until</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {contracts
                          .filter(con => {
                            const matchesStatus = contractFilterStatus === 'all' || (con.status && con.status.toLowerCase() === contractFilterStatus.toLowerCase());
                            const searchLower = contractSearch.toLowerCase();
                            const matchesSearch = !contractSearch || (con.title && con.title.toLowerCase().includes(searchLower)) || (con.id && con.id.toString().includes(searchLower));
                            return matchesStatus && matchesSearch;
                          })
                          .map((contract) => (
                            <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => handleViewContract(contract)}>
                                {contract.title || `Contract ${contract.id}`}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {contract.contract_date ? formatDate(contract.contract_date) : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {contract.valid_until ? formatDate(contract.valid_until) : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {formatCurrency(contract.amount || 0)}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${contract.status === 'Active' ? 'bg-green-100 text-green-800' :
                                  contract.status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {contract.status || 'Draft'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEditContract(contract)} className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                                    <IoCreate size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteContract(contract)} className="p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded-full hover:bg-red-50 transition-colors">
                                    <IoClose size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-end gap-4 mb-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={handleExportExcel} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Excel</button>
                  <button onClick={handlePrint} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Print</button>
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Search File"
                      className="w-full sm:w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={fileSearch}
                      onChange={(e) => setFileSearch(e.target.value)}
                    />
                    <IoSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setIsAddFileModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add File
                  </Button>
                </div>
              </div>

              <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-white border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">File Name</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Uploaded Date</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loadingFiles ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-secondary-text">Loading...</td>
                        </tr>
                      ) : files.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-secondary-text">
                            <IoDocumentText size={48} className="mx-auto mb-3 text-gray-300" />
                            <p>No documents found</p>
                          </td>
                        </tr>
                      ) : (
                        files
                          .filter(file => {
                            const searchLower = fileSearch.toLowerCase();
                            const fileName = file.name || file.file_name || file.title || '';
                            const matchesSearch = !fileSearch || fileName.toLowerCase().includes(searchLower);
                            return matchesSearch;
                          })
                          .map((file) => (
                            <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-text font-medium">
                                {file.name || file.file_name || file.title || `File ${file.id}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">
                                {file.size || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-text">
                                {file.created_at ? new Date(file.created_at).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleViewFile(file)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Download"
                                  >
                                    <IoDownload size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFile(file)}
                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                    title="Delete"
                                  >
                                    <IoTrash size={16} />
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
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                      value={expenseFilterStatus}
                      onChange={(e) => setExpenseFilterStatus(e.target.value)}
                    >
                      <option value="all">Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={handleExportExcel} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Excel</button>
                  <button onClick={handlePrint} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Print</button>
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Search Expense"
                      className="w-full sm:w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={expenseSearch}
                      onChange={(e) => setExpenseSearch(e.target.value)}
                    />
                    <IoSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setIsAddExpenseModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add Expense
                  </Button>
                </div>
              </div>

              <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                {loadingExpenses ? (
                  <div className="text-center py-8 text-secondary-text">Loading...</div>
                ) : expenses.length === 0 ? (
                  <div className="text-center py-12 text-secondary-text">
                    <IoReceipt size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No expenses found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-white border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Expense ID</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {expenses
                          .filter(exp => {
                            const matchesStatus = expenseFilterStatus === 'all' || (exp.status && exp.status.toLowerCase() === expenseFilterStatus.toLowerCase());
                            const searchLower = expenseSearch.toLowerCase();
                            const matchesSearch = !expenseSearch || (exp.expense_number && exp.expense_number.toLowerCase().includes(searchLower));
                            return matchesStatus && matchesSearch;
                          })
                          .map((expense) => (
                            <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => handleViewExpense(expense)}>
                                {expense.expense_number || `EXP-${expense.id}`}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {formatCurrency(expense.total || 0)}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${expense.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                  expense.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {expense.status || 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {expense.updated_at ? formatDate(expense.updated_at) : (expense.created_at ? formatDate(expense.created_at) : '-')}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                                {expense.description || '-'}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEditExpense(expense)} className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                                    <IoCreate size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteExpense(expense)} className="p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded-full hover:bg-red-50 transition-colors">
                                    <IoClose size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-end gap-4 mb-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Search Note"
                      className="w-full sm:w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                    />
                    <IoSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setIsAddNoteModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add Note
                  </Button>
                </div>
              </div>

              <Card className="p-3 sm:p-4 md:p-6">
                {loadingNotes ? (
                  <div className="text-center py-6 sm:py-8 text-secondary-text text-sm">Loading...</div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-secondary-text">
                    <IoDocumentText size={40} className="sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No notes found</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {notes
                      .filter(note => {
                        const searchLower = noteSearch.toLowerCase();
                        return !noteSearch || (note.content && note.content.toLowerCase().includes(searchLower)) || (note.note && note.note.toLowerCase().includes(searchLower));
                      })
                      .map((note, index) => (
                        <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-primary-text whitespace-pre-wrap break-words">{note.content || note.note}</p>
                              {note.created_at && (
                                <p className="text-xs text-secondary-text mt-2">{new Date(note.created_at).toLocaleDateString()}</p>
                              )}
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleViewNote(note)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="View"
                              >
                                <IoEye size={16} className="sm:w-[18px] sm:h-[18px]" />
                              </button>
                              <button
                                onClick={() => handleEditNote(note)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <IoCreate size={16} className="sm:w-[18px] sm:h-[18px]" />
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note)}
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                title="Delete"
                              >
                                <IoTrash size={16} className="sm:w-[18px] sm:h-[18px]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                      value={taskFilterStatus}
                      onChange={(e) => setTaskFilterStatus(e.target.value)}
                    >
                      <option value="all">Status</option>
                      <option value="incomplete">Incomplete</option>
                      <option value="complete">Complete</option>
                      <option value="doing">Doing</option>
                    </select>
                    <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={handleExportExcel} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Excel</button>
                  <button onClick={handlePrint} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Print</button>
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Search Task"
                      className="w-full sm:w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                    />
                    <IoSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setIsAddTaskModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <IoAdd size={18} />
                    Add Task
                  </Button>
                </div>
              </div>

              <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
                {loadingTasks ? (
                  <div className="text-center py-8 text-secondary-text">Loading...</div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-12 text-secondary-text">
                    <IoCheckmarkCircle size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No tasks found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-white border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Task</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Priority</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Due Date</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tasks
                          .filter(task => {
                            const matchesStatus = taskFilterStatus === 'all' || (task.status && task.status.toLowerCase() === taskFilterStatus.toLowerCase());
                            const searchLower = taskSearch.toLowerCase();
                            const matchesSearch = !taskSearch || (task.title && task.title.toLowerCase().includes(searchLower));
                            return matchesStatus && matchesSearch;
                          })
                          .map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => handleViewTask(task)}>
                                {task.title}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                  task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {task.priority || 'Medium'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {task.due_date ? formatDate(task.due_date) : '-'}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${task.status === 'Complete' ? 'bg-green-100 text-green-800' :
                                  task.status === 'Doing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {task.status || 'Incomplete'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEditTask(task)} className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                                    <IoCreate size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteTask(task)} className="p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded-full hover:bg-red-50 transition-colors">
                                    <IoClose size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - HIDDEN (removed for full-width tables) */}
      <div className="hidden">
        <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between lg:hidden">
            <h3 className="text-lg font-semibold text-primary-text">Client info</h3>
            <button
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Client Info */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-primary-text flex items-center gap-2">
                <IoBriefcase size={16} />
                Client info
              </h3>
              <button className="p-1 hover:bg-gray-100 rounded-lg">
                <IoEllipsisVertical size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <IoGrid size={14} className="text-gray-400" />
                  <label className="text-xs text-secondary-text">Client Name</label>
                </div>
                <p className="text-sm text-primary-text ml-6">{client.client_name || client.name || client.companyName || '-'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <IoMail size={14} className="text-gray-400" />
                  <label className="text-xs text-secondary-text">Email</label>
                </div>
                <p className="text-sm text-primary-text ml-6">{client.email || '-'}</p>
              </div>

              {client.labels && client.labels.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <IoBookmark size={14} className="text-gray-400" />
                    <label className="text-xs text-secondary-text">Label</label>
                  </div>
                  <div className="ml-6">
                    {client.labels.map((label, idx) => (
                      <Badge key={idx} className="text-xs bg-purple-100 text-purple-800 mr-1">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {client.groups && client.groups.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <IoList size={14} className="text-gray-400" />
                    <label className="text-xs text-secondary-text">Group</label>
                  </div>
                  <div className="ml-6">
                    {client.groups.map((group, idx) => (
                      <Badge key={idx} className="text-xs bg-gray-100 text-gray-800 mr-1">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {primaryContact && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <IoPerson size={14} className="text-gray-400" />
                    <label className="text-xs text-secondary-text">Contact</label>
                  </div>
                  <div className="ml-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                      {primaryContact.name ? primaryContact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                    </div>
                    <p className="text-sm text-primary-text">{primaryContact.name || '-'}</p>
                  </div>
                </div>
              )}

              <div>
                <button className="ml-6 text-xs text-primary-accent hover:underline flex items-center gap-1">
                  <IoPersonAdd size={12} />
                  Add Managers
                </button>
              </div>

              {client.address && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <IoLocation size={14} className="text-gray-400" />
                    <label className="text-xs text-secondary-text">Address</label>
                  </div>
                  <p className="text-sm text-primary-text ml-6">{client.address}</p>
                  {(client.city || client.state || client.zip) && (
                    <p className="text-sm text-primary-text ml-6">
                      {[client.city, client.state, client.zip].filter(Boolean).join(', ')}
                      {client.country && `, ${client.country}`}
                    </p>
                  )}
                </div>
              )}

              {client.phone && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <IoCall size={14} className="text-gray-400" />
                    <label className="text-xs text-secondary-text">Phone</label>
                  </div>
                  <p className="text-sm text-primary-text ml-6">{client.phoneCountryCode} {client.phone}</p>
                </div>
              )}

              {client.website && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <IoGlobe size={14} className="text-gray-400" />
                    <label className="text-xs text-secondary-text">Site</label>
                  </div>
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-accent hover:underline ml-6">
                    {client.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Toggle Right Sidebar Button - Show only on Overview tab */}
      {activeTab === 'overview' && (
        <button
          onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          className={`fixed top-6 z-40 w-12 h-12 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center ${isRightSidebarOpen ? 'right-[25rem] lg:right-[25rem] xl:right-[26rem]' : 'right-6'
            }`}
          title={isRightSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          <IoGrid size={20} />
        </button>
      )}

      {/* Modals */}
      {/* Add Contact Modal */}
      <Modal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        title="Add Contact"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={contactFormData.name}
            onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
            placeholder="Enter name"
            required
          />
          <Input
            label="Job Title"
            value={contactFormData.jobTitle}
            onChange={(e) => setContactFormData({ ...contactFormData, jobTitle: e.target.value })}
            placeholder="Enter job title"
          />
          <Input
            label="Email"
            type="email"
            value={contactFormData.email}
            onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
            placeholder="Enter email"
            required
          />
          <Input
            label="Phone"
            value={contactFormData.phone}
            onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
            placeholder="Enter phone"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrimary"
              checked={contactFormData.isPrimary}
              onChange={(e) => setContactFormData({ ...contactFormData, isPrimary: e.target.checked })}
              className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent"
            />
            <label htmlFor="isPrimary" className="text-sm text-primary-text">
              Set as primary contact
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddContactModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddContact} className="flex-1">
              Add Contact
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Note Modal */}
      <Modal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        title="Add Note"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Note</label>
            <textarea
              value={noteFormData.content}
              onChange={(e) => setNoteFormData({ content: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter note"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddNoteModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddNote} className="flex-1">
              Add Note
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Add Task"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={taskFormData.title}
            onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
            placeholder="Enter task title"
          />
          <Input
            label="Due Date"
            type="date"
            value={taskFormData.dueDate}
            onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Priority</label>
            <select
              value={taskFormData.priority}
              onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Description</label>
            <textarea
              value={taskFormData.description}
              onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter description"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddTaskModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddTask} className="flex-1">
              Add Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Expense Modal */}
      <Modal
        isOpen={isAddExpenseModalOpen}
        onClose={() => {
          setIsAddExpenseModalOpen(false)
          setSelectedExpense(null)
          setExpenseFormData({ title: '', amount: '', description: '', category: '', date: '', status: 'Pending' })
        }}
        title={selectedExpense ? "Edit Expense" : "Add Expense"}
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={expenseFormData.title}
            onChange={(e) => setExpenseFormData({ ...expenseFormData, title: e.target.value })}
            placeholder="Enter expense title"
          />
          <Input
            label="Amount"
            type="number"
            value={expenseFormData.amount}
            onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
            placeholder="Enter amount"
          />
          <Input
            label="Date"
            type="date"
            value={expenseFormData.expense_date || expenseFormData.date}
            onChange={(e) => setExpenseFormData({ ...expenseFormData, expense_date: e.target.value, date: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Category</label>
            <select
              value={expenseFormData.category}
              onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="">Select category</option>
              <option value="Travel">Travel</option>
              <option value="Meals">Meals</option>
              <option value="Office">Office</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Status</label>
            <select
              value={expenseFormData.status}
              onChange={(e) => setExpenseFormData({ ...expenseFormData, status: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Description</label>
            <textarea
              value={expenseFormData.description}
              onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter description"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => {
              setIsAddExpenseModalOpen(false)
              setSelectedExpense(null)
              setExpenseFormData({ title: '', amount: '', description: '', category: '', date: '', status: 'Pending' })
            }} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddExpense} className="flex-1">
              {selectedExpense ? 'Update Expense' : 'Add Expense'}
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
            terms: 'Thank you for your business.', discount: 0, discount_type: '%', amount: '', status: 'draft', client_id: null, project_id: null, items: []
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
                onChange={(e) => setEstimateFormData({ ...estimateFormData, currency: e.target.value.split(' ')[0] })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
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
                  terms: 'Thank you for your business.', discount: 0, discount_type: '%', amount: '', status: 'draft', client_id: null, project_id: null, items: []
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
            terms: 'Thank you for your business.', discount: 0, discount_type: '%', amount: '', status: 'draft', client_id: null, project_id: null, items: []
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
                onChange={(e) => setProposalFormData({ ...proposalFormData, currency: e.target.value.split(' ')[0] })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
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
                  terms: 'Thank you for your business.', discount: 0, discount_type: '%', amount: '', status: 'draft', client_id: null, project_id: null, items: []
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
            tax: '', second_tax: '', note: '', amount: '', status: 'draft', client_id: null, project_id: null
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
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
                  tax: '', second_tax: '', note: '', amount: '', status: 'draft', client_id: null, project_id: null
                })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddContract} className="flex-1">
              Create Contract
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

      {/* Add/Edit Project Modal */}
      <Modal
        isOpen={isAddProjectModalOpen}
        onClose={() => {
          setIsAddProjectModalOpen(false)
          setEditingProjectId(null)
          setProjectFormData({
            project_name: '', short_code: '', description: '', start_date: new Date().toISOString().split('T')[0],
            deadline: '', no_deadline: false, price: '', status: 'in progress', project_category: '', project_sub_category: '',
            department_id: '', project_manager_id: '', project_summary: '', notes: '',
            public_gantt_chart: 'enable', public_task_board: 'enable', task_approval: 'disable',
            label: '', project_members: [], project_type: 'Client Project'
          })
        }}
        title={editingProjectId ? "Edit Project" : "Create New Project"}
        size="lg"
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
          {/* Section 1: Project Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <IoBriefcase className="text-primary-accent" />
              Project Information
            </h3>
            <div className="space-y-4">
              <Input
                label="Project Name *"
                value={projectFormData.project_name}
                onChange={(e) => setProjectFormData({ ...projectFormData, project_name: e.target.value })}
                placeholder="Enter project name"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Input
                    label="Short Code"
                    value={projectFormData.short_code}
                    onChange={(e) => setProjectFormData({ ...projectFormData, short_code: e.target.value })}
                    placeholder="Ex: PRJ-001"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                  <select
                    value={projectFormData.project_type}
                    onChange={(e) => setProjectFormData({ ...projectFormData, project_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent outline-none transition-all"
                    disabled
                  >
                    <option value="Client Project">Client Project</option>
                  </select>
                </div>
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
                <select
                  value={id}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600 focus:outline-none"
                >
                  <option value={id}>{client?.client_name || client?.name || '-- Select Client --'}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6"></div>

          {/* Section 2: Schedule & Budget */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <IoCalendar className="text-primary-accent" />
              Schedule & Budget
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                type="date"
                label="Start Date *"
                value={projectFormData.start_date}
                onChange={(e) => setProjectFormData({ ...projectFormData, start_date: e.target.value })}
                required
              />
              <div className="relative">
                <Input
                  type="date"
                  label="Deadline"
                  value={projectFormData.deadline}
                  onChange={(e) => setProjectFormData({ ...projectFormData, deadline: e.target.value })}
                  disabled={projectFormData.no_deadline}
                />
                <div className="absolute right-0 top-0">
                  <FormCheckbox
                    label="No Deadline"
                    checked={projectFormData.no_deadline}
                    onChange={(e) => setProjectFormData({ ...projectFormData, no_deadline: e.target.checked, deadline: e.target.checked ? '' : projectFormData.deadline })}
                  />
                </div>
              </div>
              <Input
                type="number"
                label="Budget ($)"
                value={projectFormData.price}
                onChange={(e) => setProjectFormData({ ...projectFormData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6"></div>

          {/* Section 3: Team Assignment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <IoPersonAdd className="text-primary-accent" />
              Team Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={projectFormData.department_id}
                  onChange={(e) => {
                    const deptId = e.target.value
                    setProjectFormData({
                      ...projectFormData,
                      department_id: deptId,
                      project_manager_id: '',
                      project_members: []
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent outline-none transition-all"
                >
                  <option value="">-- All Departments --</option>
                  {filteredDepartments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name || dept.department_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Manager *</label>
                <select
                  value={projectFormData.project_manager_id}
                  onChange={(e) => {
                    const managerId = e.target.value
                    setProjectFormData({
                      ...projectFormData,
                      project_manager_id: managerId,
                      project_members: managerId && !projectFormData.project_members.includes(parseInt(managerId))
                        ? [...projectFormData.project_members, parseInt(managerId)]
                        : projectFormData.project_members
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent outline-none transition-all"
                  required
                >
                  <option value="">-- Select Manager --</option>
                  {filteredEmployees.map(employee => (
                    <option key={employee.user_id || employee.id} value={employee.user_id || employee.id}>
                      {employee.name || employee.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Members</label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-[200px] overflow-y-auto">
                  <div className="mb-3 relative">
                    <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={employeeSearchQuery}
                      onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-accent"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {filteredEmployees
                      .filter(employee => {
                        if (!employeeSearchQuery) return true
                        const searchTerm = employeeSearchQuery.toLowerCase()
                        return (
                          (employee.name || '').toLowerCase().includes(searchTerm) ||
                          (employee.email || '').toLowerCase().includes(searchTerm)
                        )
                      })
                      .map(employee => {
                        const employeeId = parseInt(employee.user_id || employee.id)
                        const isManager = parseInt(projectFormData.project_manager_id) === employeeId
                        const isSelected = projectFormData.project_members.map(m => parseInt(m)).includes(employeeId)

                        return (
                          <label
                            key={employeeId}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isSelected || isManager ? 'bg-primary-accent/10 border border-primary-accent/30' : 'hover:bg-white border border-transparent'}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected || isManager}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (!projectFormData.project_members.map(m => parseInt(m)).includes(employeeId)) {
                                    setProjectFormData(prev => ({
                                      ...prev,
                                      project_members: [...prev.project_members, employeeId]
                                    }))
                                  }
                                } else {
                                  if (isManager) return
                                  setProjectFormData(prev => ({
                                    ...prev,
                                    project_members: prev.project_members.filter(id => parseInt(id) !== employeeId)
                                  }))
                                }
                              }}
                              className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{employee.name || employee.email}</p>
                              {isManager && <p className="text-xs text-primary-accent">Manager</p>}
                            </div>
                          </label>
                        )
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6"></div>

          {/* Section 4: Details & Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <IoDocumentText className="text-primary-accent" />
              Additional Details
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Summary</label>
                <div className="h-40">
                  <RichTextEditor
                    value={projectFormData.project_summary}
                    onChange={(content) => setProjectFormData({ ...projectFormData, project_summary: content })}
                    placeholder="Enter project summary..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority / Label</label>
                  <select
                    value={projectFormData.label}
                    onChange={(e) => setProjectFormData({ ...projectFormData, label: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent outline-none"
                  >
                    <option value="">-- None --</option>
                    {availableLabels.map(label => (
                      <option key={label.id} value={label.name}>{label.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Status</label>
                  <select
                    value={projectFormData.status}
                    onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent outline-none"
                  >
                    <option value="in progress">In Progress</option>
                    <option value="on hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddProjectModalOpen(false)
                setEditingProjectId(null)
                setProjectFormData({
                  project_name: '', short_code: '', description: '', start_date: new Date().toISOString().split('T')[0],
                  deadline: '', no_deadline: false, price: '', status: 'in progress', project_category: '', project_sub_category: '',
                  department_id: '', project_manager_id: '', project_summary: '', notes: '',
                  public_gantt_chart: 'enable', public_task_board: 'enable', task_approval: 'disable',
                  label: '', project_members: [], project_type: 'Client Project'
                })
              }}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleAddProject(true)}
              className="px-8 py-2 flex items-center gap-2 shadow-lg shadow-primary-accent/20"
            >
              <IoCheckmarkCircle size={20} />
              {editingProjectId ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Invoice Modal */}
      <Modal
        isOpen={isAddInvoiceModalOpen}
        onClose={() => {
          setIsAddInvoiceModalOpen(false)
          setInvoiceFormData({
            invoice_date: new Date().toISOString().split('T')[0], due_date: '',
            currency: 'USD', discount: 0, discount_type: '%', amount: '', note: '',
            terms: 'Thank you for your business.'
          })
        }}
        title="Add Invoice"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Invoice Date"
              type="date"
              value={invoiceFormData.invoice_date}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoice_date: e.target.value })}
            />
            <Input
              label="Due Date"
              type="date"
              value={invoiceFormData.due_date}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, due_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Currency</label>
            <select
              value={invoiceFormData.currency}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, currency: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          <Input
            label="Amount"
            type="number"
            value={invoiceFormData.amount}
            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, amount: e.target.value })}
            placeholder="Enter total amount"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Discount"
              type="number"
              value={invoiceFormData.discount}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, discount: e.target.value })}
              placeholder="0"
            />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Discount Type</label>
              <select
                value={invoiceFormData.discount_type}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, discount_type: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="%">Percentage (%)</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Note</label>
            <textarea
              value={invoiceFormData.note}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, note: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter note"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddInvoiceModalOpen(false)
                setInvoiceFormData({
                  invoice_date: new Date().toISOString().split('T')[0], due_date: '',
                  currency: 'USD', discount: 0, discount_type: '%', amount: '', note: '',
                  terms: 'Thank you for your business.'
                })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddInvoice} className="flex-1">
              Create Invoice
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Payment Modal */}
      <Modal
        isOpen={isAddPaymentModalOpen}
        onClose={() => {
          setIsAddPaymentModalOpen(false)
          setPaymentFormData({
            invoice_id: '',
            payment_method: 'Cash',
            paid_on: new Date().toISOString().split('T')[0],
            amount: '',
            note: ''
          })
        }}
        title="Add payment"
      >
        <div className="space-y-4">
          {/* Only show invoice field if invoices exist */}
          {invoices.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Invoice</label>
              <select
                value={paymentFormData.invoice_id}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, invoice_id: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="">-- Select Invoice --</option>
                {loadingInvoices ? (
                  <option value="" disabled>Loading invoices...</option>
                ) : (
                  invoices.map(invoice => {
                    const invoiceNumber = invoice.invoice_number || invoice.invoice_code || invoice.invoiceNumber || `INV-${invoice.id}` || invoice.id
                    const total = parseFloat(invoice.total || invoice.total_amount || 0)
                    const paid = parseFloat(invoice.paid || invoice.paid_amount || 0)
                    const dueAmount = parseFloat(invoice.unpaid || invoice.due_amount || (total - paid) || 0)
                    return (
                      <option key={invoice.id} value={invoice.id}>
                        INV #{invoiceNumber} (Due: ${dueAmount.toFixed(2)})
                      </option>
                    )
                  })
                )}
              </select>
              <p className="text-xs text-secondary-text mt-1">Found {invoices.length} invoice(s)</p>
            </div>
          )}
          {invoices.length === 0 && !loadingInvoices && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>No invoices found.</strong> Please create an invoice first from the Invoices tab.
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Payment method</label>
            <select
              value={paymentFormData.payment_method}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cheque">Cheque</option>
              <option value="Online Payment">Online Payment</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <Input
            label="Payment date"
            type="date"
            value={paymentFormData.paid_on}
            onChange={(e) => setPaymentFormData({ ...paymentFormData, paid_on: e.target.value })}
          />
          <Input
            label="Amount"
            type="number"
            value={paymentFormData.amount}
            onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
            placeholder="Enter payment amount"
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Note</label>
            <textarea
              value={paymentFormData.note}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, note: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter note"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddPaymentModalOpen(false)
                setPaymentFormData({
                  invoice_id: '',
                  payment_method: 'Cash',
                  paid_on: new Date().toISOString().split('T')[0],
                  amount: '',
                  note: ''
                })
              }}
              className="flex-1"
            >
              Close
            </Button>
            <Button variant="primary" onClick={handleAddPayment} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Order Modal */}
      <Modal
        isOpen={isAddOrderModalOpen}
        onClose={() => {
          setIsAddOrderModalOpen(false)
          setOrderFormData({ title: '', description: '', amount: '', status: 'New' })
        }}
        title="Add Order"
      >
        <div className="space-y-4">
          <Input
            label="Order Title"
            value={orderFormData.title}
            onChange={(e) => setOrderFormData({ ...orderFormData, title: e.target.value })}
            placeholder="Enter order title"
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Description</label>
            <textarea
              value={orderFormData.description}
              onChange={(e) => setOrderFormData({ ...orderFormData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter description"
            />
          </div>
          <Input
            label="Amount"
            type="number"
            value={orderFormData.amount}
            onChange={(e) => setOrderFormData({ ...orderFormData, amount: e.target.value })}
            placeholder="Enter order amount"
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Status</label>
            <select
              value={orderFormData.status}
              onChange={(e) => setOrderFormData({ ...orderFormData, status: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="New">New</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOrderModalOpen(false)
                setOrderFormData({ title: '', description: '', amount: '', status: 'New' })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddOrder} className="flex-1">
              Create Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Subscription Modal */}
      <Modal
        isOpen={isAddSubscriptionModalOpen}
        onClose={() => {
          setIsAddSubscriptionModalOpen(false)
          setEditingSubscriptionId(null)
          setSubscriptionFormData({
            plan: '', amount: '', billing_cycle: 'Monthly', next_billing_date: ''
          })
        }}
        title={editingSubscriptionId ? "Edit Subscription" : "Add Subscription"}
      >
        <div className="space-y-4">
          <Input
            label="Plan Name"
            value={subscriptionFormData.plan}
            onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, plan: e.target.value })}
            placeholder="Enter plan name"
          />
          <Input
            label="Amount"
            type="number"
            value={subscriptionFormData.amount}
            onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, amount: e.target.value })}
            placeholder="Enter subscription amount"
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Billing Cycle</label>
            <select
              value={subscriptionFormData.billing_cycle}
              onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, billing_cycle: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          <Input
            label="Next Billing Date"
            type="date"
            value={subscriptionFormData.next_billing_date}
            onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, next_billing_date: e.target.value })}
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddSubscriptionModalOpen(false)
                setSubscriptionFormData({
                  plan: '', amount: '', billing_cycle: 'Monthly', next_billing_date: ''
                })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddSubscription} className="flex-1">
              {editingSubscriptionId ? 'Update Subscription' : 'Create Subscription'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Payment Modal */}
      <Modal
        isOpen={isViewPaymentModalOpen}
        onClose={() => { setIsViewPaymentModalOpen(false); setSelectedPayment(null); }}
        title="Payment Details"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Amount</label>
                <p className="text-primary-text font-semibold text-lg">${parseFloat(selectedPayment.amount || 0).toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Payment Method</label>
                <p className="text-primary-text">{selectedPayment.payment_method || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Date</label>
                <p className="text-primary-text">{selectedPayment.paid_on || selectedPayment.payment_date ? new Date(selectedPayment.paid_on || selectedPayment.payment_date).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Transaction ID</label>
                <p className="text-primary-text">{selectedPayment.transaction_id || '-'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Note</label>
              <p className="text-primary-text">{selectedPayment.remark || selectedPayment.note || '-'}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => { setIsViewPaymentModalOpen(false); setSelectedPayment(null); }} className="flex-1">Close</Button>
              <Button variant="primary" onClick={() => { setIsViewPaymentModalOpen(false); handleEditPayment(selectedPayment); }} className="flex-1">Edit</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Order Modal */}
      <Modal
        isOpen={isViewOrderModalOpen}
        onClose={() => { setIsViewOrderModalOpen(false); setSelectedOrder(null); }}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Title</label>
                <p className="text-primary-text font-medium">{selectedOrder.title || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Amount</label>
                <p className="text-primary-text font-semibold">${parseFloat(selectedOrder.amount || 0).toFixed(2)}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Status</label>
              <Badge className={`text-xs ${selectedOrder.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{selectedOrder.status || 'New'}</Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Description</label>
              <p className="text-primary-text">{selectedOrder.description || '-'}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => { setIsViewOrderModalOpen(false); setSelectedOrder(null); }} className="flex-1">Close</Button>
              <Button variant="primary" onClick={() => { setIsViewOrderModalOpen(false); handleEditOrder(selectedOrder); }} className="flex-1">Edit</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Subscription Modal */}
      <Modal
        isOpen={isViewSubscriptionModalOpen}
        onClose={() => { setIsViewSubscriptionModalOpen(false); setSelectedSubscription(null); }}
        title="Subscription Details"
      >
        {selectedSubscription && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Plan</label>
                <p className="text-primary-text font-medium">{selectedSubscription.plan || selectedSubscription.title || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Amount</label>
                <p className="text-primary-text font-semibold">${parseFloat(selectedSubscription.amount || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Billing Cycle</label>
                <p className="text-primary-text">{selectedSubscription.billing_cycle || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Status</label>
                <Badge className={`text-xs ${selectedSubscription.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{selectedSubscription.status || 'Active'}</Badge>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Next Billing Date</label>
              <p className="text-primary-text">{selectedSubscription.next_billing_date ? new Date(selectedSubscription.next_billing_date).toLocaleDateString() : '-'}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => { setIsViewSubscriptionModalOpen(false); setSelectedSubscription(null); }} className="flex-1">Close</Button>
              <Button variant="primary" onClick={() => { setIsViewSubscriptionModalOpen(false); handleEditSubscription(selectedSubscription); }} className="flex-1">Edit</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Contract Modal */}
      <Modal
        isOpen={isViewContractModalOpen}
        onClose={() => { setIsViewContractModalOpen(false); setSelectedContract(null); }}
        title="Contract Details"
      >
        {selectedContract && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Title</label>
                <p className="text-primary-text font-medium">{selectedContract.title || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Amount</label>
                <p className="text-primary-text font-semibold">${parseFloat(selectedContract.amount || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Contract Date</label>
                <p className="text-primary-text">{selectedContract.contract_date ? new Date(selectedContract.contract_date).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Valid Until</label>
                <p className="text-primary-text">{selectedContract.valid_until ? new Date(selectedContract.valid_until).toLocaleDateString() : '-'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Status</label>
              <Badge className={`text-xs ${selectedContract.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{selectedContract.status || 'Draft'}</Badge>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => { setIsViewContractModalOpen(false); setSelectedContract(null); }} className="flex-1">Close</Button>
              <Button variant="primary" onClick={() => { setIsViewContractModalOpen(false); handleEditContract(selectedContract); }} className="flex-1">Edit</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Task Modal */}
      <Modal
        isOpen={isViewTaskModalOpen}
        onClose={() => { setIsViewTaskModalOpen(false); setSelectedTask(null); }}
        title="Task Details"
      >
        {selectedTask && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Title</label>
              <p className="text-primary-text font-medium">{selectedTask.title || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Status</label>
                <Badge className={`text-xs ${selectedTask.status === 'Done' ? 'bg-green-100 text-green-800' : selectedTask.status === 'Doing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{selectedTask.status || 'Incomplete'}</Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Priority</label>
                <Badge className={`text-xs ${selectedTask.priority === 'High' ? 'bg-red-100 text-red-800' : selectedTask.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{selectedTask.priority || 'Medium'}</Badge>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Due Date</label>
              <p className="text-primary-text">{selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Description</label>
              <p className="text-primary-text whitespace-pre-wrap">{selectedTask.description || '-'}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => { setIsViewTaskModalOpen(false); setSelectedTask(null); }} className="flex-1">Close</Button>
              <Button variant="primary" onClick={() => { setIsViewTaskModalOpen(false); handleEditTask(selectedTask); }} className="flex-1">Edit</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Expense Modal */}
      <Modal
        isOpen={isViewExpenseModalOpen}
        onClose={() => { setIsViewExpenseModalOpen(false); setSelectedExpense(null); }}
        title="Expense Details"
      >
        {selectedExpense && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Title</label>
                <p className="text-primary-text font-medium">{selectedExpense.title || selectedExpense.expense_name || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Amount</label>
                <p className="text-primary-text font-semibold text-lg">${parseFloat(selectedExpense.total || selectedExpense.amount || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Date</label>
                <p className="text-primary-text">{selectedExpense.expense_date ? new Date(selectedExpense.expense_date).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Status</label>
                <Badge className={`text-xs ${selectedExpense.status === 'Approved' ? 'bg-green-100 text-green-800' : selectedExpense.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{selectedExpense.status || 'Pending'}</Badge>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Description</label>
              <p className="text-primary-text whitespace-pre-wrap">{selectedExpense.description || '-'}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => { setIsViewExpenseModalOpen(false); setSelectedExpense(null); }} className="flex-1">Close</Button>
              <Button variant="primary" onClick={() => { setIsViewExpenseModalOpen(false); handleEditExpense(selectedExpense); }} className="flex-1">Edit</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Note Modal */}
      <Modal
        isOpen={isViewNoteModalOpen}
        onClose={() => { setIsViewNoteModalOpen(false); setViewingNote(null); }}
        title="Note Details"
      >
        {viewingNote && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Note Content</label>
              <p className="text-primary-text whitespace-pre-wrap">{viewingNote.content || viewingNote.note || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Created</label>
              <p className="text-primary-text">{viewingNote.created_at ? new Date(viewingNote.created_at).toLocaleDateString() : '-'}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => { setIsViewNoteModalOpen(false); setViewingNote(null); }} className="flex-1">Close</Button>
              <Button variant="primary" onClick={() => { setIsViewNoteModalOpen(false); handleEditNote(viewingNote); }} className="flex-1">Edit</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ClientDetail


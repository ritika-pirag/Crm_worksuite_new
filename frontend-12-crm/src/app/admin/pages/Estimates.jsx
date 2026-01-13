import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { estimatesAPI, clientsAPI, projectsAPI, companiesAPI, itemsAPI } from '../../../api'
import RichTextEditor from '../../../components/ui/RichTextEditor'
import {
  IoAdd,
  IoClose,
  IoSearch,
  IoFilter,
  IoDownload,
  IoChevronDown,
  IoChevronUp,
  IoEllipsisVertical,
  IoCheckmarkCircle,
  IoCloudUpload,
  IoTrash,
  IoCreate,
  IoEye,
  IoDocumentText,
  IoHelpCircle,
  IoInformationCircle,
  IoPrint,
  IoCopy,
  IoOpenOutline,
  IoCamera,
  IoCalendar,
  IoGrid,
  IoCheckmark,
  IoChevronBack,
  IoChevronForward
} from 'react-icons/io5'

const Estimates = () => {
  const navigate = useNavigate()

  // Get and validate company_id from localStorage
  const [companyId, setCompanyId] = useState(() => {
    const storedId = localStorage.getItem('companyId')
    const parsed = parseInt(storedId, 10)

    if (!storedId || isNaN(parsed) || parsed <= 0) {
      console.error('Invalid or missing companyId in localStorage')
      return null
    }

    return parsed
  })

  // Show error if companyId is invalid
  if (!companyId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Session</h2>
          <p className="text-gray-600 mb-4">Your session is invalid or expired. Please login again.</p>
          <button
            onClick={() => {
              localStorage.clear()
              navigate('/login')
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }
  const [activeTab, setActiveTab] = useState('estimates') // 'estimates', 'estimate-requests', 'estimate-request-forms'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [productItems, setProductItems] = useState([]) // Dynamic product items from API
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [newItemImagePreview, setNewItemImagePreview] = useState(null)
  const [newItemFormData, setNewItemFormData] = useState({
    title: '',
    description: '',
    category: '',
    unit_type: '',
    rate: '',
    show_in_client_portal: false,
    image: null,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [clientFilter, setClientFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })
  const [estimateItems, setEstimateItems] = useState([])
  const [discountType, setDiscountType] = useState('%')
  const [companies, setCompanies] = useState([])
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([]) // Clients filtered by company
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([]) // Projects filtered by client
  const [loading, setLoading] = useState(true)
  const [selectedEstimate, setSelectedEstimate] = useState(null)
  const [estimates, setEstimates] = useState([]) // Moved before useEffect

  // Filter states
  const [periodFilter, setPeriodFilter] = useState('yearly') // monthly, yearly, custom, dynamic
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [customDateStart, setCustomDateStart] = useState('')
  const [customDateEnd, setCustomDateEnd] = useState('')

  const [formData, setFormData] = useState({
    company: '',
    estimateNumber: '',
    estimateDate: new Date().toISOString().split('T')[0],
    validTill: '',
    currency: 'USD',
    client: '',
    project: '',
    calculateTax: 'After Discount',
    tax: '',
    taxRate: 0,
    secondTax: '',
    secondTaxRate: 0,
    description: '',
    note: '',
    terms: 'Thank you for your business.',
    discount: 0,
    discountType: '%',
    items: [],
  })

  const fetchEstimates = useCallback(async () => {
    try {
      setLoading(true)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchEstimates:', companyId)
        setEstimates([])
        setLoading(false)
        return
      }
      const params = { company_id: companyId }
      if (statusFilter !== 'All') {
        params.status = statusFilter
      }

      console.log('Fetching estimates with params:', params)
      const response = await estimatesAPI.getAll(params)
      console.log('Estimates API response:', response.data)

      if (response.data && response.data.success) {
        const fetchedEstimates = response.data.data || []
        console.log('Fetched estimates count:', fetchedEstimates.length)

        // Transform API data to match component format
        const transformedEstimates = fetchedEstimates.map(estimate => ({
          id: estimate.id,
          estimateNumber: estimate.estimate_number ? estimate.estimate_number.replace('EST#', 'ESTIMATE #') : `ESTIMATE #${estimate.id}`,
          company_id: estimate.company_id,
          company_name: estimate.company_name || '--',
          project: estimate.project_name || '--',
          client: {
            name: estimate.client_name || 'Unknown Client',
            company: estimate.company_name || 'Unknown Company',
            avatar: estimate.client_name ? estimate.client_name.substring(0, 2).toUpperCase() : 'UC',
          },
          total: parseFloat(estimate.total || estimate.total_amount || 0),
          validTill: estimate.valid_till ? estimate.valid_till.split('T')[0] : '',
          created: estimate.proposal_date || estimate.created_at || estimate.estimate_date || '',
          created_by_name: estimate.created_by_name || estimate.created_by || '-',
          estimateRequestNumber: estimate.estimate_request_number || '--',
          status: (estimate.status || 'Draft').charAt(0).toUpperCase() + (estimate.status || 'Draft').slice(1).toLowerCase(),
          items: estimate.items || [],
        }))
        console.log('Transformed estimates:', transformedEstimates)
        setEstimates(transformedEstimates)
      } else {
        console.error('Failed to fetch estimates:', response.data?.error)
        setEstimates([])
      }
    } catch (error) {
      console.error('Error fetching estimates:', error)
      console.error('Error details:', error.response?.data || error.message)
      setEstimates([])
      alert(error.response?.data?.error || 'Failed to fetch estimates. Please check console for details.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, companyId])

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await companiesAPI.getAll()
      if (response.data.success) {
        setCompanies(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }, [])

  const fetchClients = useCallback(async () => {
    try {
      // Fetch only clients belonging to the logged-in admin's company
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchClients:', companyId)
        setClients([])
        setFilteredClients([])
        return
      }
      const response = await clientsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setClients(response.data.data || [])
        setFilteredClients(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      setClients([])
      setFilteredClients([])
    }
  }, [companyId])

  const fetchProjects = useCallback(async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchProjects:', companyId)
        setProjects([])
        return
      }
      const response = await projectsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setProjects(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }, [companyId])

  const fetchProductItems = useCallback(async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        setProductItems([])
        return
      }
      const response = await itemsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setProductItems(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching product items:', error)
      setProductItems([])
    }
  }, [companyId])

  // Fetch estimates, companies, clients, and projects on component mount
  useEffect(() => {
    fetchEstimates()
    fetchCompanies()
    fetchClients()
    fetchProjects()
    fetchProductItems()
  }, [fetchEstimates, fetchCompanies, fetchClients, fetchProjects, fetchProductItems])

  // Clients are already filtered by company_id from localStorage - no need for Company dropdown
  useEffect(() => {
    // Clients are already fetched filtered by companyId in fetchClients()
    // Just set filteredClients to clients
    setFilteredClients(clients)
  }, [clients])

  // Filter projects by client (which is already filtered by company)
  useEffect(() => {
    if (formData.client && Array.isArray(projects) && projects.length > 0) {
      const clientId = parseInt(formData.client)
      if (isNaN(clientId)) {
        setFilteredProjects([])
        return
      }
      const filtered = projects.filter(project => {
        if (!project || typeof project.client_id === 'undefined') return false
        const projectClientId = parseInt(project.client_id)
        return !isNaN(projectClientId) && projectClientId === clientId
      })
      setFilteredProjects(filtered)
    } else {
      setFilteredProjects([])
    }
  }, [formData.client, projects])

  const taxOptions = [
    { value: '', label: 'Nothing selected' },
    { value: 'GST: 10%', label: 'GST: 10%', rate: 10 },
    { value: 'CGST: 18%', label: 'CGST: 18%', rate: 18 },
    { value: 'VAT: 10%', label: 'VAT: 10%', rate: 10 },
    { value: 'IGST: 10%', label: 'IGST: 10%', rate: 10 },
    { value: 'UTGST: 10%', label: 'UTGST: 10%', rate: 10 },
  ]

  const unitOptions = ['Pcs', 'Kg', 'Hours', 'Days']

  // Generate estimate number
  const generateEstimateNumber = () => {
    const nextNum = (estimates || []).length + 1
    return `EST#${String(nextNum).padStart(3, '0')}`
  }

  // Filter products based on search and exclude already selected items
  const filteredProducts = productItems.filter(product => {
    const productName = product.title || product.name || ''
    const matchesSearch = productName.toLowerCase().includes(productSearchQuery.toLowerCase())
    const isAlreadyAdded = estimateItems.some(item => item.itemName === productName)
    return matchesSearch && !isAlreadyAdded
  })

  // Open the Add Item Modal instead of adding a row directly
  const handleAddItem = () => {
    setNewItemFormData({
      title: '',
      description: '',
      category: '',
      unit_type: '',
      rate: '',
      show_in_client_portal: false,
      image: null,
    })
    setNewItemImagePreview(null)
    setIsAddItemModalOpen(true)
  }

  const handleNewItemImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewItemFormData({ ...newItemFormData, image: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewItemImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveNewItem = async (e) => {
    e.preventDefault()
    try {
      const submitData = new FormData()
      submitData.append('company_id', companyId)
      submitData.append('title', newItemFormData.title)
      submitData.append('description', newItemFormData.description)
      submitData.append('category', newItemFormData.category)
      submitData.append('unit_type', newItemFormData.unit_type)
      submitData.append('rate', newItemFormData.rate)
      submitData.append('show_in_client_portal', newItemFormData.show_in_client_portal ? 1 : 0)
      if (newItemFormData.image) {
        submitData.append('image', newItemFormData.image)
      }

      const response = await itemsAPI.create(submitData)

      if (response.data.success) {
        fetchProductItems()

        const createdItem = {
          id: response.data.data?.id || Date.now(),
          itemName: newItemFormData.title,
          description: newItemFormData.description,
          quantity: 1,
          unit: newItemFormData.unit_type,
          unitPrice: parseFloat(newItemFormData.rate || 0),
          tax: '',
          taxRate: 0,
          file: null,
          fileName: 'No file chosen',
          amount: parseFloat(newItemFormData.rate || 0),
        }

        setEstimateItems([...estimateItems, createdItem])

        setIsAddItemModalOpen(false)
        setNewItemFormData({
          title: '',
          description: '',
          category: '',
          unit_type: '',
          rate: '',
          show_in_client_portal: false,
          image: null,
        })
        setNewItemImagePreview(null)

      } else {
        alert(response.data.error || 'Failed to create item')
      }
    } catch (error) {
      console.error('Error creating item:', error)
      alert(error.response?.data?.error || 'Failed to create item')
    }
  }

  // Add product as estimate item
  const handleAddProduct = () => {
    if (!selectedProduct) {
      alert('Please select a product')
      return
    }

    const product = productItems.find(p => p.id === parseInt(selectedProduct))
    if (!product) return

    const newItem = {
      id: Date.now(),
      itemName: product.title || product.name,
      description: product.description || '',
      quantity: 1,
      unit: product.unit_type || product.unit || 'Pcs',
      unitPrice: parseFloat(product.rate || product.unitPrice || 0),
      tax: '',
      taxRate: 0,
      file: null,
      fileName: 'No file chosen',
      amount: parseFloat(product.rate || product.unitPrice || 0),
    }

    setEstimateItems([...estimateItems, newItem])
    setSelectedProduct('')
    setProductSearchQuery('')
    setShowProductDropdown(false)
  }

  // Update estimate item
  const handleItemChange = (id, field, value) => {
    setEstimateItems(estimateItems.map(item => {
      if (item.id === id) {
        let updatedItem = { ...item, [field]: value }

        if (field === 'tax') {
          const taxOption = taxOptions.find(t => t.value === value)
          updatedItem.taxRate = taxOption ? taxOption.rate : 0
        }

        const quantity = updatedItem.quantity || 0
        const unitPrice = updatedItem.unitPrice || 0
        const subtotal = quantity * unitPrice
        const taxAmount = updatedItem.taxRate ? (subtotal * updatedItem.taxRate / 100) : 0
        updatedItem.amount = subtotal + taxAmount

        return updatedItem
      }
      return item
    }))
  }

  // Remove estimate item
  const handleRemoveItem = (id) => {
    setEstimateItems(estimateItems.filter(item => item.id !== id))
  }

  // Handle file upload
  const handleFileUpload = (id, file) => {
    setEstimateItems(estimateItems.map(item =>
      item.id === id ? { ...item, file, fileName: file.name } : item
    ))
  }

  // Calculate totals
  const calculateSubTotal = () => {
    return (estimateItems || []).reduce((sum, item) => sum + ((item?.quantity || 0) * (item?.unitPrice || 0)), 0)
  }

  const calculateTaxTotal = () => {
    return (estimateItems || []).reduce((sum, item) => {
      const subtotal = (item?.quantity || 0) * (item?.unitPrice || 0)
      const taxAmount = item?.taxRate ? (subtotal * item.taxRate / 100) : 0
      return sum + taxAmount
    }, 0)
  }

  const calculateDiscount = () => {
    const subTotal = calculateSubTotal()
    if (discountType === '%') {
      return (subTotal * formData.discount) / 100
    }
    return formData.discount
  }

  const calculateGrandTotal = () => {
    const subTotal = calculateSubTotal()
    const taxTotal = calculateTaxTotal()
    const discount = calculateDiscount()
    return subTotal + taxTotal - discount
  }

  const formatDate = (dateString) => {
    if (!dateString) return '--'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '--'
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    } catch (e) {
      return '--'
    }
  }

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const resetForm = async () => {
    const today = new Date()
    const validTillDate = new Date(today)
    validTillDate.setDate(validTillDate.getDate() + 30)

    setFormData({
      company: companyId,
      estimateNumber: generateEstimateNumber(),
      estimateDate: today.toISOString().split('T')[0],
      validTill: validTillDate.toISOString().split('T')[0],
      currency: 'USD',
      client: '',
      project: '',
      calculateTax: 'After Discount',
      description: '',
      note: '',
      terms: 'Thank you for your business.',
      discount: 0,
      discountType: '%',
      tax: '',
      taxRate: 0,
      secondTax: '',
      secondTaxRate: 0,
    })
    setEstimateItems([])
    setSelectedProduct('')
    setProductSearchQuery('')

    try {
      const response = await clientsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setFilteredClients(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
    setFilteredProjects([])
  }

  const handleSave = async (asDraft = false) => {
    if (!formData.client) {
      alert('Client is required')
      return
    }
    if (!formData.validTill) {
      alert('Valid Till is required')
      return
    }

    try {
      const selectedClient = filteredClients.find(c => c.id === parseInt(formData.client)) || clients.find(c => c.id === parseInt(formData.client))
      const selectedProject = filteredProjects.find(p => p.id === parseInt(formData.project)) || projects.find(p => p.id === parseInt(formData.project))

      const adminCompanyId = companyId

      const estimateData = {
        company_id: parseInt(adminCompanyId),
        estimate_number: formData.estimateNumber || generateEstimateNumber(),
        estimate_date: formData.estimateDate || new Date().toISOString().split('T')[0],
        valid_till: formData.validTill,
        client_id: parseInt(formData.client),
        project_id: selectedProject?.id || null,
        status: asDraft ? 'Draft' : 'Sent',
        currency: formData.currency || 'USD',
        discount: formData.discount || 0,
        discount_type: formData.discountType || '%',
        description: formData.description || null,
        note: formData.note || null,
        terms: formData.terms || null,
        tax: formData.tax || null,
        second_tax: formData.secondTax || null,
        items: estimateItems.map(item => ({
          item_name: item.itemName,
          description: item.description || null,
          quantity: item.quantity || 1,
          unit: item.unit || 'Pcs',
          unit_price: item.unitPrice || 0,
          tax: item.tax || null,
          tax_rate: item.taxRate || 0,
          amount: item.amount || (item.unitPrice * item.quantity),
        })),
      }

      if (isEditModalOpen && selectedEstimate) {
        const response = await estimatesAPI.update(selectedEstimate.id, estimateData)
        if (response.data.success) {
          alert('Estimate updated successfully!')
          await fetchEstimates()
          setIsEditModalOpen(false)
          setSelectedEstimate(null)
          resetForm()
        } else {
          alert(response.data.error || 'Failed to update estimate')
        }
      } else {
        const response = await estimatesAPI.create(estimateData)
        if (response.data.success) {
          alert('Estimate created successfully!')
          await fetchEstimates()
          setIsAddModalOpen(false)
          resetForm()
        } else {
          alert(response.data.error || 'Failed to create estimate')
        }
      }
    } catch (error) {
      console.error('Error saving estimate:', error)
      alert(error.response?.data?.error || 'Failed to save estimate')
    }
  }

  const handleEdit = async (estimate) => {
    try {
      const adminCompanyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      try {
        const clientsResponse = await clientsAPI.getAll({ company_id: adminCompanyId })
        if (clientsResponse.data.success) {
          setClients(clientsResponse.data.data || [])
          console.log('Edit Estimate - Loaded clients:', clientsResponse.data.data?.length || 0)
        }
      } catch (err) {
        console.error('Error fetching clients:', err)
      }

      const response = await estimatesAPI.getById(estimate.id)
      if (response.data.success) {
        const data = response.data.data

        setSelectedEstimate(estimate)
        const clientId = data.client_id?.toString() || ''
        const projectId = data.project_id?.toString() || ''

        setFormData({
          company: adminCompanyId.toString(),
          estimateNumber: data.estimate_number || estimate.estimateNumber || '',
          estimateDate: data.proposal_date ? data.proposal_date.split('T')[0] : (data.created_at ? data.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
          validTill: data.valid_till ? data.valid_till.split('T')[0] : estimate.validTill || '',
          currency: data.currency || 'USD',
          client: clientId,
          project: projectId,
          calculateTax: 'After Discount',
          description: data.description || '',
          note: data.note || '',
          terms: data.terms || 'Thank you for your business.',
          discount: data.discount || 0,
          discountType: data.discount_type || '%',
          tax: data.tax || '',
          secondTax: data.second_tax || '',
        })
        setEstimateItems(data.items || estimate.items || [])
        setIsEditModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching estimate:', error)
      alert('Failed to load estimate details')
    }
  }

  const handleDelete = async (estimate) => {
    if (window.confirm(`Are you sure you want to delete ${estimate.estimateNumber}?`)) {
      try {
        const response = await estimatesAPI.delete(estimate.id)
        if (response.data.success) {
          alert('Estimate deleted successfully!')
          await fetchEstimates()
        } else {
          alert(response.data.error || 'Failed to delete estimate')
        }
      } catch (error) {
        console.error('Error deleting estimate:', error)
        alert(error.response?.data?.error || 'Failed to delete estimate')
      }
    }
  }

  const handleView = (estimate) => {
    navigate(`/app/admin/estimates/${estimate.id}`)
  }

  const handleCopy = async (estimate) => {
    try {
      const response = await estimatesAPI.getById(estimate.id)
      if (response.data.success) {
        const data = response.data.data
        // Create a copy with new estimate number
        const copyData = {
          ...data,
          estimate_number: generateEstimateNumber(),
          status: 'Draft',
        }
        delete copyData.id
        delete copyData.created_at
        delete copyData.updated_at

        const createResponse = await estimatesAPI.create(copyData)
        if (createResponse.data.success) {
          alert('Estimate copied successfully!')
          await fetchEstimates()
        }
      }
    } catch (error) {
      console.error('Error copying estimate:', error)
      alert('Failed to copy estimate')
    }
  }

  // Handle Excel Export
  const handleExportExcel = () => {
    const csvData = filteredEstimates.map(e => ({
      'Estimate #': e.estimateNumber || '',
      'Project': e.project || '',
      'Company': e.company_name || '',
      'Client': e.client?.name || '',
      'Total': e.total || 0,
      'Valid Till': e.validTill || '',
      'Estimate Date': e.created || '',
      'Created By': e.created_by_name || '',
      'Status': e.status || ''
    }))

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `estimates_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Handle Print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Estimates List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #fafafa; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>Estimates List</h1>
          <table>
            <thead>
              <tr>
                <th>Estimate #</th>
                <th>Project</th>
                <th>Company</th>
                <th>Client</th>
                <th>Total</th>
                <th>Valid Till</th>
                <th>Estimate Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEstimates.map(e => `
                <tr>
                  <td>${e.estimateNumber || ''}</td>
                  <td>${e.project || ''}</td>
                  <td>${e.company_name || ''}</td>
                  <td>${e.client?.name || ''}</td>
                  <td>$${parseFloat(e.total || 0).toFixed(2)}</td>
                  <td>${e.validTill || ''}</td>
                  <td>${e.created || ''}</td>
                  <td>${e.status || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `
    printWindow.document.write(tableHTML)
    printWindow.document.close()
  }

  // Apply filters
  const handleApplyFilters = () => {
    fetchEstimates()
  }

  // Reset filters
  const handleResetFilters = () => {
    setStatusFilter('All')
    setPeriodFilter('yearly')
    setSelectedYear(new Date().getFullYear())
    setCustomDateStart('')
    setCustomDateEnd('')
    fetchEstimates()
  }

  // Status colors with background
  const getStatusStyle = (status) => {
    const statusLower = status?.toLowerCase() || ''
    switch (statusLower) {
      case 'accepted':
        return 'bg-blue-600 text-white'
      case 'sent':
        return 'bg-blue-400 text-white'
      case 'draft':
        return 'bg-gray-500 text-white'
      case 'declined':
      case 'rejected':
        return 'bg-red-500 text-white'
      case 'waiting':
        return 'bg-yellow-500 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  const filteredEstimates = (estimates || []).filter(estimate => {
    if (!estimate) return false
    if (searchQuery && !estimate.estimateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) && !estimate.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (statusFilter !== 'All' && estimate.status !== statusFilter) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-4 sm:space-y-6 bg-gray-100 min-h-screen p-4">
      {/* Header with Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 border-b border-gray-200">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('estimates')}
              className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'estimates'
                ? 'border-primary-blue text-primary-blue'
                : 'border-transparent text-secondary-text hover:text-primary-text'
                }`}
            >
              Estimates
            </button>
            <button
              onClick={() => setActiveTab('estimate-requests')}
              className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'estimate-requests'
                ? 'border-primary-blue text-primary-blue'
                : 'border-transparent text-secondary-text hover:text-primary-text'
                }`}
            >
              Estimate Requests
            </button>
            <button
              onClick={() => setActiveTab('estimate-request-forms')}
              className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'estimate-request-forms'
                ? 'border-primary-blue text-primary-blue'
                : 'border-transparent text-secondary-text hover:text-primary-text'
                }`}
            >
              Estimate Request Forms
            </button>
          </div>
          <AddButton onClick={async () => {
            resetForm();
            try {
              const adminCompanyId = parseInt(localStorage.getItem('companyId') || 1, 10)
              const response = await clientsAPI.getAll({ company_id: adminCompanyId })
              if (response.data.success) {
                setClients(response.data.data || [])
                console.log('Add Estimate - Loaded clients:', response.data.data?.length || 0)
              }
            } catch (err) {
              console.error('Error fetching clients:', err)
            }
            setIsAddModalOpen(true);
          }} label="Add estimate" className="py-3 h-11 bg-green-500 hover:bg-green-600" />
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'estimates' && (
        <>
          {/* Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Left side - Add new filter */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  <IoGrid size={16} className="text-gray-500" />
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                  <IoAdd size={16} />
                  Add new filter
                </button>
              </div>

              {/* Right side - Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Dropdown */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none px-4 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none bg-white"
                  >
                    <option value="All">- Status -</option>
                    <option value="Waiting">Waiting</option>
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                {/* Period Buttons */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPeriodFilter('monthly')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${periodFilter === 'monthly' ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setPeriodFilter('yearly')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${periodFilter === 'yearly' ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Yearly
                  </button>
                  <button
                    onClick={() => setPeriodFilter('custom')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${periodFilter === 'custom' ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Custom
                  </button>
                  <button
                    onClick={() => setPeriodFilter('dynamic')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${periodFilter === 'dynamic' ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Dynamic
                  </button>
                </div>

                {/* Year Selector */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setSelectedYear(prev => prev - 1)}
                    className="px-2 py-2 hover:bg-gray-100 border-r border-gray-300"
                  >
                    <IoChevronBack size={16} />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium">{selectedYear}</span>
                  <button
                    onClick={() => setSelectedYear(prev => prev + 1)}
                    className="px-2 py-2 hover:bg-gray-100 border-l border-gray-300"
                  >
                    <IoChevronForward size={16} />
                  </button>
                </div>

                {/* Apply & Reset Buttons */}
                <button
                  onClick={handleApplyFilters}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  title="Apply filters"
                >
                  <IoCheckmark size={18} />
                </button>
                <button
                  onClick={handleResetFilters}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  title="Reset filters"
                >
                  <IoClose size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Estimates Table */}
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estimate
                    </th>
                    <th className="w-[20%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estimate date
                    </th>
                    <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created by
                    </th>
                    <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-[14%] px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-secondary-text">
                        Loading estimates...
                      </td>
                    </tr>
                  ) : filteredEstimates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-secondary-text">
                        No estimates found
                      </td>
                    </tr>
                  ) : (
                    filteredEstimates.map((estimate) => (
                      <tr key={estimate.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleView(estimate)}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {estimate.estimateNumber}
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleView(estimate)}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {estimate.client?.name || 'Unknown Client'}
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                          {formatDate(estimate.created)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {estimate.created_by_name && estimate.created_by_name !== '-' ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-semibold text-blue-600">
                                  {estimate.created_by_name.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-gray-700">{estimate.created_by_name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-800 font-medium">
                          {formatCurrency(estimate.total)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(estimate.status)}`}>
                            {estimate.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopy(estimate)
                              }}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                              title="Copy"
                            >
                              <IoCopy size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(estimate)
                              }}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                              title="Edit"
                            >
                              <IoCreate size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                              title="More"
                            >
                              <IoEllipsisVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filteredEstimates.length > 0 && (
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-right font-semibold text-gray-700">
                        Total:
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-800 font-bold">
                        {formatCurrency(filteredEstimates.reduce((sum, est) => sum + (parseFloat(est.total) || 0), 0))}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <select className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                1-{(filteredEstimates || []).length} / {(filteredEstimates || []).length}
              </div>
              <div className="flex items-center gap-1">
                <button disabled className="p-1.5 border border-gray-300 rounded text-gray-400 cursor-not-allowed">
                  <IoChevronBack size={16} />
                </button>
                <button disabled className="p-1.5 border border-gray-300 rounded text-gray-400 cursor-not-allowed">
                  <IoChevronForward size={16} />
                </button>
              </div>
            </div>
          </Card>
        </>
      )}

      {activeTab === 'estimate-requests' && (
        <Card className="p-6">
          <div className="text-center py-8 text-secondary-text">
            <p>Estimate Requests feature coming soon</p>
          </div>
        </Card>
      )}

      {activeTab === 'estimate-request-forms' && (
        <Card className="p-6">
          <div className="text-center py-8 text-secondary-text">
            <p>Estimate Request Forms feature coming soon</p>
          </div>
        </Card>
      )}

      {/* Create/Edit Estimate Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedEstimate(null)
          resetForm()
        }}
        title={isEditModalOpen ? "Edit Estimate" : "Add Estimate"}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Estimate date
            </label>
            <div className="relative">
              <Input
                type="date"
                value={formData.estimateDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, estimateDate: e.target.value })}
                placeholder="Estimate date"
                required
              />
              <IoCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text pointer-events-none" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Valid until
            </label>
            <div className="relative">
              <Input
                type="date"
                value={formData.validTill}
                onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                placeholder="Valid until"
                required
              />
              <IoCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text pointer-events-none" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Client
            </label>
            <div className="relative">
              <select
                value={formData.client}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    client: e.target.value,
                    project: ''
                  })
                }}
                className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none appearance-none"
                required
              >
                <option value="">Client</option>
                {clients.length === 0 ? (
                  <option value="" disabled>No clients found</option>
                ) : (
                  clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.client_name || client.name || client.company_name || `Client #${client.id}`}
                    </option>
                  ))
                )}
              </select>
              <IoChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text pointer-events-none" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              TAX
            </label>
            <div className="relative">
              <select
                value={formData.tax || ''}
                onChange={(e) => {
                  const selectedTax = taxOptions.find(t => t.value === e.target.value)
                  setFormData({
                    ...formData,
                    tax: e.target.value,
                    taxRate: selectedTax ? selectedTax.rate : 0
                  })
                }}
                className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none appearance-none"
              >
                <option value="">-</option>
                {taxOptions.filter(t => t.value).map(tax => (
                  <option key={tax.value} value={tax.value}>{tax.label}</option>
                ))}
              </select>
              <IoChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text pointer-events-none" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Second TAX
            </label>
            <div className="relative">
              <select
                value={formData.secondTax || ''}
                onChange={(e) => {
                  const selectedTax = taxOptions.find(t => t.value === e.target.value)
                  setFormData({
                    ...formData,
                    secondTax: e.target.value,
                    secondTaxRate: selectedTax ? selectedTax.rate : 0
                  })
                }}
                className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none appearance-none"
              >
                <option value="">-</option>
                {taxOptions.filter(t => t.value).map(tax => (
                  <option key={tax.value} value={tax.value}>{tax.label}</option>
                ))}
              </select>
              <IoChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text pointer-events-none" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Note
            </label>
            <textarea
              value={formData.note || ''}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Note"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                setSelectedEstimate(null)
                resetForm()
              }}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <IoClose size={18} />
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSave(false)}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <IoCheckmarkCircle size={18} />
              {isEditModalOpen ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Item Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add item"
        size="lg"
      >
        <form onSubmit={handleSaveNewItem} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newItemFormData.title}
                  onChange={(e) => setNewItemFormData({ ...newItemFormData, title: e.target.value })}
                  placeholder="Title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Description
                </label>
                <textarea
                  value={newItemFormData.description}
                  onChange={(e) => setNewItemFormData({ ...newItemFormData, description: e.target.value })}
                  placeholder="Description"
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={newItemFormData.category}
                  onChange={(e) => setNewItemFormData({ ...newItemFormData, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Design">Design</option>
                  <option value="Development">Development</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Services">Services</option>
                  <option value="Products">Products</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Unit type <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newItemFormData.unit_type}
                  onChange={(e) => setNewItemFormData({ ...newItemFormData, unit_type: e.target.value })}
                  placeholder="Unit type (Ex: hours, pc, etc.)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Rate <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={newItemFormData.rate}
                  onChange={(e) => setNewItemFormData({ ...newItemFormData, rate: e.target.value })}
                  placeholder="Rate"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show_in_client_portal"
                  checked={newItemFormData.show_in_client_portal}
                  onChange={(e) => setNewItemFormData({ ...newItemFormData, show_in_client_portal: e.target.checked })}
                  className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent"
                />
                <label htmlFor="show_in_client_portal" className="text-sm font-medium text-primary-text">
                  Show in client portal
                </label>
              </div>
            </div>

            {/* Right Column - Image Upload */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Item Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-accent transition-colors">
                  {newItemImagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={newItemImagePreview}
                        alt="Preview"
                        className="max-w-full h-48 object-contain mx-auto rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setNewItemImagePreview(null)
                          setNewItemFormData({ ...newItemFormData, image: null })
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <IoCamera className="mx-auto text-gray-400" size={48} />
                      <p className="text-sm text-secondary-text">No image uploaded</p>
                    </div>
                  )}
                  <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-accent text-white rounded-lg cursor-pointer hover:bg-primary-accent/90 transition-colors">
                    <IoCloudUpload size={18} />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewItemImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddItemModalOpen(false)}
              className="flex items-center gap-2"
            >
              <IoClose size={18} />
              Close
            </Button>
            <Button
              type="submit"
              className="flex items-center gap-2"
            >
              <IoCheckmarkCircle size={18} />
              Save
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  )
}

export default Estimates

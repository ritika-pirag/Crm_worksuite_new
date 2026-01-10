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
  IoCamera, // Added for new item image
  IoCalendar
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
  const [formData, setFormData] = useState({
    company: '',
    estimateNumber: '',
    estimateDate: new Date().toISOString().split('T')[0],
    validTill: '2026-01-20',
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
          estimateNumber: estimate.estimate_number || `ESTIMATE #${estimate.id}`,
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
          created: estimate.created_at || estimate.estimate_date || '',
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

  /* 
   * Dynamic products are now fetched from API (productItems state)
   * Replacing hardcoded productTemplates
   */

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
  // Using dynamic productItems from API (mapped to match UI expected fields locally if needed, or used directly)
  const filteredProducts = productItems.filter(product => {
    // Check match on title/name
    const productName = product.title || product.name || ''
    const matchesSearch = productName.toLowerCase().includes(productSearchQuery.toLowerCase())

    // Check if any existing item has the same name
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
        // alert('Item created successfully!') // Optional feedback

        // 1. Refresh product items list
        fetchProductItems()

        // 2. Add the new item to the estimate items list immediately
        const newItemProduct = response.data.data // Assuming backend returns the created item structure
        // If backend response structure differs, we might need to rely on the form data or fetchById
        // For now, let's construct it from the form data + id from response if available, or just fetchItems and find it?
        // Better: Use the response data.

        // Items API create usually returns the created item. Let's assume response.data.data is the item object or contains it. 
        // Based on typical API, it might be response.data.item. Let's start with basic assumption or re-fetch.
        // Safer approach: re-fetch products, then find the one we just added? No, that might be async race.
        // Let's use the local data to append to estimate immediately.

        const createdItem = {
          id: response.data.data?.id || Date.now(), // Fallback if ID not returned
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
      itemName: product.title || product.name, // API uses title, fallback to name
      description: product.description || '',
      quantity: 1,
      unit: product.unit_type || product.unit || 'Pcs', // API uses unit_type
      unitPrice: parseFloat(product.rate || product.unitPrice || 0), // API uses rate
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
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const resetForm = async () => {
    // Auto-set company_id from session and generate dates
    const today = new Date()
    const validTillDate = new Date(today)
    validTillDate.setDate(validTillDate.getDate() + 30) // Valid for 30 days

    setFormData({
      company: companyId, // Auto-set from localStorage
      estimateNumber: generateEstimateNumber(), // Auto-generate estimate number
      estimateDate: today.toISOString().split('T')[0], // Today's date
      validTill: validTillDate.toISOString().split('T')[0], // 30 days from today
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

    // Auto-fetch clients for admin's company
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
    // Company is auto-set, no validation needed
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

      // Use admin's company_id from localStorage
      const adminCompanyId = companyId // Auto-set from session

      const estimateData = {
        company_id: parseInt(adminCompanyId),
        estimate_number: formData.estimateNumber || generateEstimateNumber(),
        valid_till: formData.validTill,
        client_id: parseInt(formData.client),
        project_id: selectedProject?.id || null,
        status: asDraft ? 'Draft' : 'Waiting',
        currency: formData.currency || 'USD',
        discount: formData.discount || 0,
        discount_type: formData.discountType || '%',
        description: formData.description || null,
        note: formData.note || null,
        terms: formData.terms || null,
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
      // Fetch clients directly before opening modal
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

      // Fetch full estimate data
      const response = await estimatesAPI.getById(estimate.id)
      if (response.data.success) {
        const data = response.data.data

        setSelectedEstimate(estimate)
        const clientId = data.client_id?.toString() || ''
        const projectId = data.project_id?.toString() || ''

        setFormData({
          company: adminCompanyId.toString(),
          estimateNumber: data.estimate_number || estimate.estimateNumber || '',
          validTill: data.valid_till ? data.valid_till.split('T')[0] : estimate.validTill || '',
          currency: data.currency || 'USD ($)',
          client: clientId,
          project: projectId,
          calculateTax: 'After Discount',
          description: data.description || '',
          note: data.note || '',
          terms: data.terms || 'Thank you for your business.',
          discount: data.discount || 0,
          discountType: data.discount_type || '%',
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

  const columns = [
    {
      key: 'checkbox',
      label: '',
      render: () => (
        <input type="checkbox" className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent" />
      ),
    },
    {
      key: 'estimateNumber',
      label: 'Estimate',
      render: (value, row) => (
        <button
          onClick={() => handleView(row)}
          className="flex items-center gap-1 hover:text-primary-accent font-semibold text-primary-text"
        >
          {value}
          <div className="flex flex-col">
            <IoChevronUp size={10} className="-mb-1 opacity-30" />
            <IoChevronDown size={10} className="opacity-30" />
          </div>
        </button>
      ),
    },
    {
      key: 'project',
      label: 'Project',
      render: (value) => (
        <button
          onClick={() => { }}
          className="flex items-center gap-1 hover:text-primary-accent"
        >
          {value}
          <div className="flex flex-col">
            <IoChevronUp size={10} className="-mb-1 opacity-30" />
            <IoChevronDown size={10} className="opacity-30" />
          </div>
        </button>
      ),
    },
    {
      key: 'company_name',
      label: 'Company',
      render: (value) => (
        <span className="text-primary-text">{value || '--'}</span>
      ),
    },
    {
      key: 'client',
      label: 'Client',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-accent/20 flex items-center justify-center text-xs font-semibold text-primary-accent">
            {row.client?.avatar || 'UC'}
          </div>
          <div>
            <p className="text-sm font-medium text-primary-text">{row.client?.name || 'Unknown Client'}</p>
            <p className="text-xs text-secondary-text">{row.client?.company || 'Unknown Company'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      render: (value) => (
        <button
          onClick={() => { }}
          className="flex items-center gap-1 hover:text-primary-accent font-semibold text-primary-text"
        >
          {formatCurrency(value)}
          <div className="flex flex-col">
            <IoChevronUp size={10} className="-mb-1 opacity-30" />
            <IoChevronDown size={10} className="opacity-30" />
          </div>
        </button>
      ),
    },
    {
      key: 'validTill',
      label: 'Valid Till',
      render: (value) => (
        <button
          onClick={() => { }}
          className="flex items-center gap-1 hover:text-primary-accent"
        >
          {formatDate(value)}
          <div className="flex flex-col">
            <IoChevronUp size={10} className="-mb-1 opacity-30" />
            <IoChevronDown size={10} className="opacity-30" />
          </div>
        </button>
      ),
    },
    {
      key: 'created',
      label: 'Estimate Date',
      render: (value) => (
        <span className="text-primary-text">{formatDate(value)}</span>
      ),
    },
    {
      key: 'created_by',
      label: 'Created By',
      render: (value, row) => (
        <span className="text-primary-text">{row.created_by_name || '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          'Waiting': 'bg-yellow-100 text-yellow-800',
          'Draft': 'bg-gray-100 text-gray-800',
          'Sent': 'bg-blue-100 text-blue-800',
          'Accepted': 'bg-green-100 text-green-800',
          'Rejected': 'bg-red-100 text-red-800',
        }
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${value === 'Waiting' ? 'bg-yellow-500' : value === 'Accepted' ? 'bg-green-500' : 'bg-gray-500'}`} />
            <Badge variant="default" className={statusColors[value] || 'bg-gray-100 text-gray-800'}>
              {value}
            </Badge>
          </div>
        )
      },
    },
    {
      key: 'actions',
      label: '',
      render: (value, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleView(row)
            }}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="View"
          >
            <IoOpenOutline size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(row)
            }}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Edit"
          >
            <IoCreate size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(row)
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <IoTrash size={16} />
          </button>

        </div>
      ),
    },
  ]

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
    <div className="space-y-4 sm:space-y-6">
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
            // Fetch clients directly before opening modal
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
          }} label="Add estimate" className="py-3 h-11" />
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'estimates' && (
        <>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-secondary-text">
                <span>Duration</span>
                <span>Start Date To End Date</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="All">Status All</option>
                <option value="All">All</option>
                <option value="Waiting">Waiting</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="ml-auto flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Start typing to search"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                  />
                  <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text" size={18} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={handleExportExcel} className="flex items-center gap-2 hover:bg-gray-800 hover:text-white">
                <IoDownload size={18} />
                Excel
              </Button>
              <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2 hover:bg-gray-800 hover:text-white">
                <IoPrint size={18} />
                Print
              </Button>
            </div>
          </div>

          {/* Estimates Table */}
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {(columns || []).map((column, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider"
                      >
                        {column.label || ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(filteredEstimates || []).map((estimate) => (
                    <tr key={estimate.id} className="hover:bg-gray-50">
                      {(columns || []).map((column, idx) => (
                        <td key={idx} className="px-4 py-3">
                          {column.render ? column.render(estimate[column.key], estimate) : (estimate[column.key] || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-secondary-text">
                <span>Show</span>
                <select className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
                <span>entries</span>
              </div>
              <div className="text-sm text-secondary-text">
                Showing 1 to {(filteredEstimates || []).length} of {(filteredEstimates || []).length} entries
              </div>
              <div className="flex items-center gap-2">
                <button disabled className="px-2 py-0.5 text-xs border border-gray-300 rounded text-gray-400 cursor-not-allowed">
                  Previous
                </button>
                <button className="px-2 py-0.5 text-xs border border-gray-300 rounded bg-primary-accent text-white hover:bg-primary-accent/90">
                  1
                </button>
                <button disabled={(filteredEstimates || []).length <= 10} className="px-3 py-1 border border-gray-300 rounded text-gray-400 cursor-not-allowed">
                  Next
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
      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedEstimate(null)
          resetForm()
        }}
        title={isEditModalOpen ? "Edit Estimate" : "Add Estimate"}
        width="max-w-7xl"
      >
        <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Company is auto-set from admin's session */}

          {/* Estimate Details */}
          <div>
            <h3 className="text-lg font-semibold text-primary-text mb-4">Estimate Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Estimate Number
                </label>
                <Input
                  value={formData.estimateNumber || generateEstimateNumber()}
                  onChange={(e) => setFormData({ ...formData, estimateNumber: e.target.value })}
                  placeholder="Auto generated"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Estimate Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.estimateDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, estimateDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Valid Until <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.validTill}
                  onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Client <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.client}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        client: e.target.value,
                        project: '' // Reset project when client changes
                      })
                    }}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                    required
                  >
                    <option value="">-- Select Client --</option>
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
                  <Button variant="outline" onClick={() => alert('Add client')}>Add</Button>
                </div>
                {clients.length === 0 && (
                  <p className="text-xs text-secondary-text mt-1">No clients available. Add clients first.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Project
                </label>
                <select
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!formData.client}
                >
                  <option value="">-- Select Project (Optional) --</option>
                  {!formData.client ? (
                    <option value="" disabled>Select Client First</option>
                  ) : filteredProjects.length === 0 ? (
                    <option value="" disabled>No projects found for this client</option>
                  ) : (
                    filteredProjects.map(project => (
                      <option key={project.id} value={project.id}>{project.project_name || project.name}</option>
                    ))
                  )}
                </select>
                {formData.client && filteredProjects.length === 0 && (
                  <p className="text-xs text-secondary-text mt-1">No projects available for this client</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Calculate Tax
                </label>
                <select
                  value={formData.calculateTax}
                  onChange={(e) => setFormData({ ...formData, calculateTax: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="Before Discount">Before Discount</option>
                  <option value="After Discount">After Discount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  TAX
                </label>
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  {taxOptions.map(tax => (
                    <option key={tax.value} value={tax.value}>{tax.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Second TAX (Optional)
                </label>
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="">None</option>
                  {taxOptions.filter(t => t.value).map(tax => (
                    <option key={tax.value} value={tax.value}>{tax.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Description
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(content) => setFormData({ ...formData, description: content })}
              placeholder="Enter description..."
            />
          </div>

          {/* Product Selector */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-primary-text mb-4">Add Products</h3>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => {
                    setProductSearchQuery(e.target.value)
                    setShowProductDropdown(true)
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Select Product"
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                />
                <IoChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text pointer-events-none" size={18} />
                {showProductDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-secondary-text">No products found</div>
                    ) : (
                      filteredProducts.map(product => (
                        <div
                          key={product.id}
                          onClick={() => {
                            setSelectedProduct(product.id.toString())
                            setProductSearchQuery(product.title || product.name)
                            setShowProductDropdown(false)
                          }}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-primary-text">{product.title || product.name}</div>
                          <div className="text-xs text-secondary-text mt-1">{product.description}</div>
                          <div className="text-sm font-semibold text-primary-accent mt-1">
                            {formData.currency.split(' ')[1] || '$'}{(parseFloat(product.rate || product.unitPrice || 0)).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowProductDropdown(!showProductDropdown)}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <IoFilter size={18} />
              </button>
              <Button variant="primary" onClick={handleAddProduct} className="flex items-center gap-2">
                <IoAdd size={18} />
                Add
              </Button>
            </div>
          </div>

          {/* Estimate Items Table */}
          <div className="border-t border-gray-200 pt-4">
            <div className="overflow-x-auto">
              <table className="w-full">

                <tbody className="bg-white divide-y divide-gray-200">
                  {estimateItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                            placeholder="Item Name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                          />
                          <textarea
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            placeholder="Enter Description (optional)"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none text-sm"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                          >
                            {unitOptions.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <select
                            value={item.tax}
                            onChange={(e) => handleItemChange(item.id, 'tax', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                          >
                            {taxOptions.map(tax => (
                              <option key={tax.value} value={tax.value}>{tax.label}</option>
                            ))}
                          </select>
                          <label className="flex items-center justify-center w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-accent transition-colors">
                            <IoCloudUpload className="text-gray-400 mr-2" size={18} />
                            <span className="text-sm text-secondary-text">Choose a file</span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(item.id, e.target.files[0])}
                            />
                          </label>
                          <p className="text-xs text-secondary-text">{item.fileName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-primary-text">
                          {formData.currency?.split(' ')[1] || '$'}{(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-danger hover:bg-danger/10 rounded"
                        >
                          <IoClose size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Summary Panel */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex gap-6">
              <div className="flex-1">
                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Note for the recipient
                  </label>
                  <RichTextEditor
                    value={formData.note}
                    onChange={(content) => setFormData({ ...formData, note: content })}
                    placeholder="e.g. Thank you for your business"
                  />
                </div>
                {/* Terms */}
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Terms and Conditions
                  </label>
                  <RichTextEditor
                    value={formData.terms}
                    onChange={(content) => setFormData({ ...formData, terms: content })}
                    placeholder="Enter terms and conditions..."
                  />
                </div>
              </div>
              <div className="w-80">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-text">Sub Total</span>
                    <span className="text-sm font-semibold text-primary-text">
                      {formData.currency.split(' ')[1] || '$'}{calculateSubTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-text">Discount</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                      />
                      <select
                        value={discountType}
                        onChange={(e) => {
                          setDiscountType(e.target.value)
                          setFormData({ ...formData, discountType: e.target.value })
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                      >
                        <option value="%">%</option>
                        <option value="Flat">Flat</option>
                      </select>
                      <span className="text-sm font-semibold text-primary-text">
                        {formData.currency.split(' ')[1] || '$'}{calculateDiscount().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-text">Tax</span>
                    <span className="text-sm font-semibold text-primary-text">
                      {formData.currency.split(' ')[1] || '$'}{calculateTaxTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                    <span className="text-base font-semibold text-primary-text">Total</span>
                    <span className="text-lg font-bold text-primary-text">
                      {formData.currency.split(' ')[1] || '$'}{calculateGrandTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 pt-4 border-t border-gray-200 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                setSelectedEstimate(null)
                resetForm()
              }}
              className="px-4 text-gray-900 hover:text-white min-w-[100px]"
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSave(false)}
              className="px-4 flex items-center justify-center gap-2 hover:text-white min-w-[100px]"
            >
              <IoCheckmarkCircle size={18} />
              {isEditModalOpen ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </RightSideModal>

      {/* Estimate Template Modal */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title="Estimate Template"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Start typing to search"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              />
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text" size={18} />
            </div>
            <Button variant="primary" onClick={() => alert('Add template')} className="flex items-center gap-2">
              <IoAdd size={18} />
              Estimate Template
            </Button>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      <button className="flex items-center gap-1 hover:text-primary-accent">
                        Id
                        <div className="flex flex-col">
                          <IoChevronUp size={10} className="-mb-1 opacity-30" />
                          <IoChevronDown size={10} className="opacity-30" />
                        </div>
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      <button className="flex items-center gap-1 hover:text-primary-accent">
                        Name
                        <div className="flex flex-col">
                          <IoChevronUp size={10} className="-mb-1 opacity-30" />
                          <IoChevronDown size={10} className="opacity-30" />
                        </div>
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      <button className="flex items-center gap-1 hover:text-primary-accent">
                        Total
                        <div className="flex flex-col">
                          <IoChevronUp size={10} className="-mb-1 opacity-30" />
                          <IoChevronDown size={10} className="opacity-30" />
                        </div>
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      <button className="flex items-center gap-1 hover:text-primary-accent">
                        Date
                        <div className="flex flex-col">
                          <IoChevronUp size={10} className="-mb-1 opacity-30" />
                          <IoChevronDown size={10} className="opacity-30" />
                        </div>
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-secondary-text">
                      No data available in table
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-secondary-text">
                <span>Show</span>
                <select className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
                <span>entries</span>
              </div>
              <div className="text-sm text-secondary-text">
                Showing 0 to 0 of 0 entries
              </div>
              <div className="flex items-center gap-2">
                <button disabled className="px-2 py-0.5 text-xs border border-gray-300 rounded text-gray-400 cursor-not-allowed">
                  Previous
                </button>
                <button disabled className="px-2 py-0.5 text-xs border border-gray-300 rounded text-gray-400 cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          </Card>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsTemplateModalOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Item Modal (Added for replacement of inline Add Item) */}
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

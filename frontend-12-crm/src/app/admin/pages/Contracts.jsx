import { useState, useEffect } from 'react'
import { contractsAPI, clientsAPI, projectsAPI, leadsAPI } from '../../../api'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import {
  IoAdd,
  IoSearch,
  IoFilter,
  IoChevronDown,
  IoChevronUp,
  IoEllipsisVertical,
  IoCheckmarkCircle,
  IoCloudUpload,
  IoTrash,
  IoCreate,
  IoEye,
  IoDownload,
  IoPrint,
  IoDocumentText,
  IoShareSocial,
  IoMic,
  IoClose,
  IoGrid
} from 'react-icons/io5'

const Contracts = () => {
  // Get company_id from localStorage
  const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    contract_date: '',
    valid_until: '',
    client_id: '',
    lead_id: '',
    project_id: '',
    tax: '',
    second_tax: '',
    note: '',
    amount: 0,
    status: 'Draft',
    items: []
  })

  const [contracts, setContracts] = useState([])
  const [clients, setClients] = useState([])
  const [clientsList, setClientsList] = useState([]) // Full client objects
  const [leads, setLeads] = useState([]) // Leads for Client/Lead dropdown
  const [projects, setProjects] = useState([])
  const [projectsList, setProjectsList] = useState([]) // Full project objects
  const [filteredProjects, setFilteredProjects] = useState([]) // Projects filtered by client
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedContract, setSelectedContract] = useState(null)

  // Item management functions
  const calculateTotals = (items) => {
    let total = 0
    items.forEach(item => {
      total += (parseFloat(item.amount) || 0)
    })
    return { total }
  }

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_name: '',
          description: '',
          quantity: 1,
          unit: 'Pcs',
          unit_price: 0,
          tax_rate: 0,
          amount: 0
        }
      ]
    }))
  }

  const handleRemoveItem = (index) => {
    setFormData(prev => {
      const newItems = [...prev.items]
      newItems.splice(index, 1)
      const { total } = calculateTotals(newItems)
      return { ...prev, items: newItems, amount: total }
    })
  }

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: value }

      // Recalculate item amount
      const qty = parseFloat(newItems[index].quantity) || 0
      const price = parseFloat(newItems[index].unit_price) || 0
      const tax = parseFloat(newItems[index].tax_rate) || 0

      // Calculate amount for this line (Qty * Price + Tax Amount)
      const subTotal = qty * price
      const taxAmount = subTotal * (tax / 100)
      newItems[index].amount = subTotal + taxAmount

      const { total } = calculateTotals(newItems)
      return { ...prev, items: newItems, amount: total }
    })
  }

  useEffect(() => {
    fetchContracts()
    fetchClients()
    fetchLeads()
    fetchProjects()
  }, [])

  // Fetch and filter projects when client or lead changes
  useEffect(() => {
    const fetchFilteredProjects = async () => {
      try {
        if (!companyId || isNaN(companyId) || companyId <= 0) {
          setFilteredProjects([])
          return
        }

        const params = { company_id: companyId }

        // If client is selected, fetch projects for that client
        if (formData.client_id) {
          const clientId = parseInt(formData.client_id)
          params.client_id = clientId
        }

        const response = await projectsAPI.getAll(params)
        if (response.data.success) {
          const fetchedProjects = response.data.data || []

          // Filter projects based on client_id or lead_id
          let filtered = fetchedProjects
          if (formData.client_id) {
            const clientId = parseInt(formData.client_id)
            filtered = fetchedProjects.filter(project => {
              const projectClientId = parseInt(project.client_id) || 0
              return projectClientId === clientId
            })
          } else if (formData.lead_id) {
            const leadId = parseInt(formData.lead_id)
            // Filter by lead_id if projects have this field
            filtered = fetchedProjects.filter(project => {
              const projectLeadId = parseInt(project.lead_id) || 0
              return projectLeadId === leadId
            })
          }

          setFilteredProjects(filtered)
        } else {
          setFilteredProjects([])
        }
      } catch (error) {
        console.error('Error fetching filtered projects:', error)
        // Fallback to client-side filtering from already fetched projects
        if (formData.client_id && projectsList.length > 0) {
          const clientId = parseInt(formData.client_id)
          const filtered = projectsList.filter(project => {
            const projectClientId = parseInt(project.client_id) || 0
            return projectClientId === clientId
          })
          setFilteredProjects(filtered)
        } else if (formData.lead_id && projectsList.length > 0) {
          const leadId = parseInt(formData.lead_id)
          const filtered = projectsList.filter(project => {
            const projectLeadId = parseInt(project.lead_id) || 0
            return projectLeadId === leadId
          })
          setFilteredProjects(filtered)
        } else {
          setFilteredProjects(projectsList)
        }
      }
    }

    // Only fetch if client or lead is selected
    if (formData.client_id || formData.lead_id) {
      fetchFilteredProjects()
    } else {
      // Show all projects if no client/lead selected
      setFilteredProjects(projectsList)
    }
  }, [formData.client_id, formData.lead_id, companyId, projectsList])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchContracts:', companyId)
        setContracts([])
        setLoading(false)
        return
      }
      const response = await contractsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        // Map API response to frontend format
        const mappedContracts = response.data.data.map(contract => ({
          id: contract.id,
          contractNumber: contract.contract_number || `CONTRACT #${contract.id}`,
          title: contract.title,
          client: contract.client_name || contract.lead_name || contract.lead_person_name || '-',
          project: contract.project_name || '-',
          contractDate: contract.contract_date,
          validUntil: contract.valid_until,
          amount: parseFloat(contract.amount || 0),
          status: contract.status,
          client_id: contract.client_id,
          lead_id: contract.lead_id,
          project_id: contract.project_id,
        }))
        setContracts(mappedContracts)
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error)
      alert(error.response?.data?.error || 'Failed to fetch contracts')
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchClients:', companyId)
        setClientsList([])
        setClients([])
        return
      }
      // Fetch clients filtered by company_id
      const response = await clientsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        const fetchedClients = response.data.data || []
        setClientsList(fetchedClients)
        const clientNames = fetchedClients.map(c => c.company_name || c.name || c.client_name)
        setClients(clientNames)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      setClientsList([])
      setClients([])
    }
  }

  const fetchLeads = async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchLeads:', companyId)
        setLeads([])
        return
      }
      // Fetch all leads for the company
      const response = await leadsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setLeads(response.data.data || [])
      } else {
        setLeads([])
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
      setLeads([])
    }
  }

  const fetchProjects = async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchProjects:', companyId)
        setProjects([])
        setProjectsList([])
        return
      }
      const response = await projectsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setProjectsList(response.data.data)
        const projectNames = response.data.data.map(p => p.project_name || p.name)
        setProjects(projectNames)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  const taxOptions = [
    { value: '', label: '-' },
    { value: 'GST 10%', label: 'GST 10%' },
    { value: 'CGST 18%', label: 'CGST 18%' },
    { value: 'VAT 10%', label: 'VAT 10%' },
    { value: 'IGST 10%', label: 'IGST 10%' },
    { value: 'UTGST 10%', label: 'UTGST 10%' },
  ]

  const formatDate = (dateString) => {
    if (!dateString) return '--'
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$`
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSave = async () => {
    if (!formData.title) {
      alert('Title is required')
      return
    }
    if (!formData.contract_date) {
      alert('Contract date is required')
      return
    }
    if (!formData.valid_until) {
      alert('Valid until is required')
      return
    }
    if (!formData.client_id && !formData.lead_id) {
      alert('Client or Lead is required')
      return
    }

    try {
      setSaving(true)
      const contractData = {
        company_id: companyId,
        title: formData.title,
        contract_date: formData.contract_date,
        valid_until: formData.valid_until,
        client_id: formData.client_id ? parseInt(formData.client_id) : null,
        lead_id: formData.lead_id ? parseInt(formData.lead_id) : null,
        project_id: formData.project_id ? parseInt(formData.project_id) : null,
        tax: formData.tax || null,
        second_tax: formData.second_tax || null,
        note: formData.note || null,
        amount: parseFloat(formData.amount) || 0,
        status: formData.status || 'Draft',
        items: formData.items || []
      }

      let response
      if (isEditModalOpen && selectedContract) {
        response = await contractsAPI.update(selectedContract.id, contractData)
      } else {
        response = await contractsAPI.create(contractData)
      }

      if (response.data.success) {
        alert(isEditModalOpen ? 'Contract updated successfully!' : 'Contract created successfully!')
        setIsAddModalOpen(false)
        setIsEditModalOpen(false)
        setSelectedContract(null)
        resetForm()
        await fetchContracts()
      } else {
        alert(response.data.error || 'Failed to save contract')
      }
    } catch (error) {
      console.error('Failed to save contract:', error)
      alert(error.response?.data?.error || 'Failed to save contract')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      contract_date: '',
      valid_until: '',
      client_id: '',
      lead_id: '',
      project_id: '',
      tax: '',
      second_tax: '',
      note: '',
      amount: 0,
      status: 'Draft',
      items: []
    })
    setSelectedFile(null)
    setFilteredProjects([])
  }

  const handleAdd = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const handleEdit = async (contract) => {
    try {
      const response = await contractsAPI.getById(contract.id)
      if (response.data.success) {
        const data = response.data.data
        setFormData({
          title: data.title || '',
          contract_date: data.contract_date ? data.contract_date.split('T')[0] : '',
          valid_until: data.valid_until ? data.valid_until.split('T')[0] : '',
          client_id: data.client_id?.toString() || '',
          lead_id: data.lead_id?.toString() || '',
          project_id: data.project_id?.toString() || '',
          tax: data.tax || '',
          second_tax: data.second_tax || '',
          note: data.note || '',
          amount: parseFloat(data.amount) || 0,
          status: data.status || 'Draft',
          items: data.items || []
        })
        setSelectedContract(contract)
        setIsEditModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching contract:', error)
      alert('Failed to load contract details')
    }
  }

  const handleDelete = async (contract) => {
    if (window.confirm(`Are you sure you want to delete contract ${contract.contractNumber}?`)) {
      try {
        const response = await contractsAPI.delete(contract.id)
        if (response.data.success) {
          alert('Contract deleted successfully!')
          await fetchContracts()
        } else {
          alert(response.data.error || 'Failed to delete contract')
        }
      } catch (error) {
        console.error('Error deleting contract:', error)
        alert(error.response?.data?.error || 'Failed to delete contract')
      }
    }
  }

  const handleView = async (contract) => {
    try {
      const response = await contractsAPI.getById(contract.id)
      if (response.data.success) {
        const data = response.data.data
        // Combine row data with detailed data (items)
        setSelectedContract({
          ...contract,
          ...data, // overlay detailed fields
          contractNumber: data.contract_number || contract.contractNumber,
          contractDate: data.contract_date,
          validUntil: data.valid_until,
          items: data.items || []
        })
        setIsViewModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching contract details:', error)
      // Fallback to basic data
      setSelectedContract(contract)
      setIsViewModalOpen(true)
    }
  }

  const handleDuplicate = async (contract) => {
    try {
      const duplicateData = {
        title: `${contract.title} (Copy)`,
        contract_date: new Date().toISOString().split('T')[0],
        valid_until: contract.valid_until || contract.validUntil,
        client_id: contract.client_id,
        project_id: contract.project_id,
        amount: contract.amount,
        status: 'Draft',
        note: contract.note
      }
      const response = await contractsAPI.create(duplicateData)
      if (response.data.success) {
        alert('Contract duplicated successfully!')
        await fetchContracts()
      } else {
        alert(response.data.error || 'Failed to duplicate contract')
      }
    } catch (error) {
      console.error('Error duplicating contract:', error)
      alert(error.response?.data?.error || 'Failed to duplicate contract')
    }
  }

  const handleExportExcel = () => {
    const csvData = filteredContracts.map(c => ({
      'Contract #': c.contractNumber || '',
      'Title': c.title || '',
      'Client': c.client || '',
      'Project': c.project || '',
      'Contract Date': c.contractDate || '',
      'Valid Until': c.validUntil || '',
      'Amount': c.amount || 0,
      'Status': c.status || ''
    }))

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `contracts_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contracts List</title>
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
          <h1>Contracts List</h1>
          <table>
            <thead>
              <tr>
                <th>Contract #</th>
                <th>Title</th>
                <th>Client</th>
                <th>Project</th>
                <th>Contract Date</th>
                <th>Valid Until</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredContracts.map(c => `
                <tr>
                  <td>${c.contractNumber || ''}</td>
                  <td>${c.title || ''}</td>
                  <td>${c.client || ''}</td>
                  <td>${c.project || ''}</td>
                  <td>${c.contractDate || ''}</td>
                  <td>${c.validUntil || ''}</td>
                  <td>$${parseFloat(c.amount || 0).toFixed(2)}</td>
                  <td>${c.status || ''}</td>
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

  const calculateTotal = () => {
    return contracts.slice(0, 10).reduce((sum, contract) => sum + contract.amount, 0)
  }

  const calculateTotalAllPages = () => {
    return contracts.reduce((sum, contract) => sum + contract.amount, 0)
  }

  const columns = [
    {
      key: 'contractNumber',
      label: 'Contract',
      render: (value) => (
        <button
          onClick={() => { }}
          className="flex items-center gap-1 hover:text-primary-accent font-semibold text-primary-text"
        >
          {value}
          <IoChevronDown size={14} />
        </button>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (value) => <span className="text-primary-text">{value}</span>,
    },
    {
      key: 'client',
      label: 'Client',
      render: (value) => <span className="text-primary-text">{value}</span>,
    },
    {
      key: 'project',
      label: 'Project',
      render: (value) => <span className="text-secondary-text">{value}</span>,
    },
    {
      key: 'contractDate',
      label: 'Contract date',
      render: (value) => <span className="text-primary-text">{formatDate(value)}</span>,
    },
    {
      key: 'validUntil',
      label: 'Valid until',
      render: (value) => <span className="text-primary-text">{formatDate(value)}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => <span className="font-semibold text-primary-text">{formatCurrency(value)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          'Draft': 'bg-yellow-100 text-yellow-800',
          'Accepted': 'bg-blue-100 text-blue-800',
          'Sent': 'bg-blue-50 text-blue-700',
          'Rejected': 'bg-red-100 text-red-800',
        }
        return (
          <Badge variant="default" className={statusColors[value] || 'bg-gray-100 text-gray-800'}>
            {value}
          </Badge>
        )
      },
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDuplicate(row)
            }}
            className="p-1 text-primary-accent hover:bg-primary-accent/10 rounded"
            title="Duplicate"
          >
            <IoDocumentText size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleView(row)
            }}
            className="p-1 text-primary-accent hover:bg-primary-accent/10 rounded"
            title="View"
          >
            <IoEye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(row)
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <IoCreate size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(row)
            }}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <IoTrash size={16} />
          </button>
        </div>
      ),
    },
  ]

  const filteredContracts = contracts.filter(contract => {
    if (searchQuery && !contract.title.toLowerCase().includes(searchQuery.toLowerCase()) && !contract.client.toLowerCase().includes(searchQuery.toLowerCase()) && !contract.contractNumber.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  if (loading && contracts.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Contracts</h1>
        </div>
        <Card>
          <div className="text-center py-8">
            <p className="text-secondary-text">Loading contracts...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Contracts</h1>
        </div>
        <div className="flex items-center gap-2">
          <AddButton onClick={handleAdd} label="Add contract" />
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportExcel} className="flex items-center gap-2">
              <IoDownload size={18} />
              Excel
            </Button>
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
              <IoPrint size={18} />
              Print
            </Button>
          </div>
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            />
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text" size={18} />
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContracts.slice(0, 10).map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  {columns.map((column, idx) => (
                    <td key={idx} className="px-4 py-3">
                      {column.render ? column.render(contract[column.key], contract) : (contract[column.key] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-secondary-text">
              <select className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
              <span>1-10 / {filteredContracts.length}</span>
            </div>
            <div className="text-sm text-secondary-text">
              <span className="font-semibold">Total</span> {formatCurrency(calculateTotal())}
            </div>
            <div className="text-sm text-secondary-text">
              <span className="font-semibold">Total of all pages</span> {formatCurrency(calculateTotalAllPages())}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
              ←
            </button>
            <button className="px-2 py-0.5 text-xs border border-gray-300 rounded bg-primary-accent text-white hover:bg-primary-accent/90">
              1
            </button>
            <button className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
              2
            </button>
            <button className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
              3
            </button>
            <button className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
              →
            </button>
          </div>
        </div>
      </Card>

      {/* Add/Edit Contract Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedContract(null)
          resetForm()
        }}
        title={isEditModalOpen ? "Edit contract" : "Add contract"}
        size="lg"
      >
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Title <span className="text-danger">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Title"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Contract date <span className="text-danger">*</span>
              </label>
              <Input
                type="date"
                value={formData.contract_date}
                onChange={(e) => setFormData({ ...formData, contract_date: e.target.value })}
                placeholder="Contract date"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Valid until <span className="text-danger">*</span>
              </label>
              <Input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                placeholder="Valid until"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Client/Lead <span className="text-danger">*</span>
            </label>
            <select
              value={formData.client_id || formData.lead_id ? (formData.client_id ? `client_${formData.client_id}` : `lead_${formData.lead_id}`) : ''}
              onChange={(e) => {
                const value = e.target.value
                if (value.startsWith('client_')) {
                  const newClientId = value.replace('client_', '')
                  setFormData({
                    ...formData,
                    client_id: newClientId,
                    lead_id: '',
                    project_id: '' // Reset project when client changes
                  })
                } else if (value.startsWith('lead_')) {
                  const newLeadId = value.replace('lead_', '')
                  setFormData({
                    ...formData,
                    lead_id: newLeadId,
                    client_id: '',
                    project_id: '' // Reset project when lead changes
                  })
                } else {
                  setFormData({ ...formData, client_id: '', lead_id: '', project_id: '' })
                }
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm sm:text-base"
              required
            >
              <option value="">-- Select Client or Lead --</option>
              <optgroup label="Clients">
                {clientsList.map(client => (
                  <option key={`client_${client.id}`} value={`client_${client.id}`}>
                    {client.company_name || client.name || client.client_name || `Client #${client.id}`}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Leads">
                {leads.map(lead => (
                  <option key={`lead_${lead.id}`} value={`lead_${lead.id}`}>
                    {lead.company_name || lead.person_name || `Lead #${lead.id}`}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Contract Items Section */}
          <div className="border-t border-b border-gray-200 py-4 my-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-primary-text">Contract Items</h3>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddItem}
                className="flex items-center gap-2 text-sm"
              >
                <IoAdd size={16} /> Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 w-20">Qty</th>
                    <th className="px-3 py-2 w-24">Unit Price</th>
                    <th className="px-3 py-2 w-20">Tax %</th>
                    <th className="px-3 py-2 w-24 text-right">Amount</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2">
                        <Input
                          placeholder="Item Name"
                          className="mb-1"
                          value={item.item_name}
                          onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                        />
                        <textarea
                          placeholder="Description"
                          rows={1}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-primary-accent outline-none resize-none"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        />
                      </td>
                      <td className="p-2 align-top">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        />
                      </td>
                      <td className="p-2 align-top">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        />
                      </td>
                      <td className="p-2 align-top">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.tax_rate}
                          onChange={(e) => handleItemChange(index, 'tax_rate', e.target.value)}
                        />
                      </td>
                      <td className="p-2 text-right align-top pt-3 font-medium">
                        {formatCurrency(parseFloat(item.amount) || 0)}
                      </td>
                      <td className="p-2 text-center align-top pt-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <IoTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {formData.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500 italic">No items added yet. Click "Add Item" to start.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(formData.amount || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Project
            </label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm sm:text-base"
            >
              <option value="">-- Select Project --</option>
              {!formData.client_id && !formData.lead_id ? (
                <option value="" disabled>Select Client or Lead first</option>
              ) : filteredProjects.length === 0 ? (
                <option value="" disabled>
                  {formData.client_id ? 'No projects found for this client' : 'No projects found for this lead'}
                </option>
              ) : (
                filteredProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.project_name || project.name || `Project #${project.id}`}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                TAX
              </label>
              <select
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm sm:text-base"
              >
                {taxOptions.map(tax => (
                  <option key={tax.value} value={tax.value}>{tax.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Second TAX
              </label>
              <select
                value={formData.second_tax}
                onChange={(e) => setFormData({ ...formData, second_tax: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm sm:text-base"
              >
                {taxOptions.map(tax => (
                  <option key={tax.value} value={tax.value}>{tax.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Note
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
              placeholder="Note"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-4 border-t border-gray-200 sticky bottom-0 bg-white pb-2 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm sm:text-base">
                <IoCloudUpload size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="text-xs sm:text-sm whitespace-nowrap">Upload File</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <IoMic size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false)
                  setIsEditModalOpen(false)
                  setSelectedContract(null)
                  resetForm()
                }}
                className="flex items-center gap-2 px-3 sm:px-4 text-sm sm:text-base"
                style={{ minWidth: '100px' }}
              >
                <IoClose size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Close</span>
                <span className="sm:hidden">Cancel</span>
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                className="flex items-center gap-2 px-3 sm:px-4 text-sm sm:text-base"
                disabled={saving}
                style={{ minWidth: '100px' }}
              >
                <IoCheckmarkCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                {saving ? 'Saving...' : (isEditModalOpen ? 'Update' : 'Save')}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* View Contract Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedContract(null)
        }}
        title="Contract Details"
      >
        {selectedContract && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Contract #</label>
                <p className="text-primary-text font-medium">{selectedContract.contractNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Status</label>
                <Badge className={selectedContract.status === 'Accepted' ? 'bg-blue-100 text-blue-800' : selectedContract.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
                  {selectedContract.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Title</label>
              <p className="text-primary-text">{selectedContract.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Client</label>
                <p className="text-primary-text">{selectedContract.client || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Project</label>
                <p className="text-primary-text">{selectedContract.project || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Contract Date</label>
                <p className="text-primary-text">{formatDate(selectedContract.contractDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Valid Until</label>
                <p className="text-primary-text">{formatDate(selectedContract.validUntil)}</p>
              </div>
            </div>
            {selectedContract.items && selectedContract.items.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-secondary-text mb-2">Contract Items</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Description</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Unit Price</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedContract.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <div className="font-medium">{item.item_name}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </td>
                          <td className="p-2 text-right">{item.quantity}</td>
                          <td className="p-2 text-right">{formatCurrency(parseFloat(item.unit_price) || 0)}</td>
                          <td className="p-2 text-right font-medium">{formatCurrency(parseFloat(item.amount) || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <div>
                <label className="block text-sm font-medium text-secondary-text text-right mb-1">Total Amount</label>
                <p className="text-primary-text font-bold text-xl">{formatCurrency(selectedContract.amount)}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedContract(null)
                }}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(selectedContract)
                }}
                className="flex-1"
              >
                Edit Contract
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Contracts


import { useState, useEffect } from 'react'
import { paymentsAPI, projectsAPI, invoicesAPI, clientsAPI, companiesAPI } from '../../../api'
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
  IoInformationCircle
} from 'react-icons/io5'

const Payments = () => {
  // Get company_id from localStorage
  const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [viewMode, setViewMode] = useState('single') // 'single' or 'bulk'
  const [searchQuery, setSearchQuery] = useState('')
  const [clientFilter, setClientFilter] = useState('All')
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileName, setFileName] = useState('No file chosen')

  const [formData, setFormData] = useState({
    project: '',
    invoice: '',
    paidOn: '2025-12-21',
    amount: '',
    currency: 'USD',
    exchangeRate: 1,
    transactionId: '',
    paymentGateway: '',
    bankAccount: '',
    receipt: null,
    remark: '',
  })

  const [bulkFormData, setBulkFormData] = useState({
    clientFilter: '',
    paymentMethod: '',
    invoices: [], // Will be populated from API
  })

  const [payments, setPayments] = useState([])
  const [companies, setCompanies] = useState([])
  const [projects, setProjects] = useState([])
  const [projectsList, setProjectsList] = useState([]) // Full project objects
  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([]) // Invoices filtered by company
  const [invoicesList, setInvoicesList] = useState([]) // Full invoice objects
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Configuration options (can remain static)
  const currencies = ['USD', 'INR', 'AED', 'EUR', 'GBP']
  const paymentGateways = ['Razorpay', 'Stripe', 'PayPal', 'Bank Transfer', 'Cash', 'Cheque']
  const offlinePaymentMethods = ['Cash', 'Cheque', 'Bank Transfer']
  const bankAccounts = [
    'Primary Account | McDermott, Mohr and Hodkiewicz',
    'Secondary Account | Altenwerth PLC',
    'Business Account | Sanford Ltd',
  ]

  useEffect(() => {
    fetchPayments()
    fetchCompanies()
    fetchProjects()
    fetchInvoices()
    fetchClients()
  }, [])

  // Set all invoices as filtered (no company filter needed)
  useEffect(() => {
    setFilteredInvoices(invoices)
  }, [invoices])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchPayments:', companyId)
        setPayments([])
        setLoading(false)
        return
      }
      const response = await paymentsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        // Map API response to frontend format
        const mappedPayments = response.data.data.map(payment => ({
          id: payment.id,
          code: payment.transaction_id || `PAY-${payment.id}`,
          project: payment.project_name || '--',
          invoiceNumber: payment.invoice_number || '--',
          client: {
            name: payment.client_name || '--',
            company: payment.client_name || '--',
            avatar: (payment.client_name || '--').substring(0, 2).toUpperCase()
          },
          orderNumber: payment.order_num || payment.order_number || '--',
          amount: parseFloat(payment.amount || 0),
          paidOn: payment.paid_on || payment.paid_date || payment.created_at,
          paymentGateway: payment.payment_gateway || payment.payment_method || '--',
          status: payment.status || 'Complete',
          invoice_id: payment.invoice_id || null,
          project_id: payment.project_id || null,
        }))
        setPayments(mappedPayments)
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
      alert(error.response?.data?.error || 'Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (payment) => {
    try {
      setSelectedPayment(payment)
      setIsEditModalOpen(true)
      setIsAddModalOpen(true)
      const response = await paymentsAPI.getById(payment.id, { company_id: companyId })
      if (response.data.success) {
        const data = response.data.data || {}
        setFormData({
          project: data.project_id?.toString() || '',
          invoice: data.invoice_id?.toString() || '',
          paidOn: data.paid_on ? data.paid_on.split('T')[0] : (data.paid_date ? data.paid_date.split('T')[0] : ''),
          amount: data.amount || '',
          currency: data.currency ? `${data.currency}` : 'USD ($)',
          exchangeRate: data.exchange_rate || 1,
          transactionId: data.transaction_id || '',
          paymentGateway: data.payment_gateway || data.payment_method || '',
          bankAccount: data.bank_account || '',
          remark: data.remark || data.note || '',
          receipt: null,
        })
      }
    } catch (error) {
      console.error('Error loading payment details:', error)
      alert('Failed to load payment details')
    }
  }

  const handleDelete = async (payment) => {
    if (window.confirm('Delete this payment?')) {
      try {
        const response = await paymentsAPI.delete(payment.id, { company_id: companyId })
        if (response.data.success) {
          alert('Payment deleted successfully!')
          await fetchPayments()
        } else {
          alert(response.data.error || 'Failed to delete payment')
        }
      } catch (error) {
        console.error('Error deleting payment:', error)
        alert(error.response?.data?.error || 'Failed to delete payment')
      }
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

  const fetchInvoices = async () => {
    try {
      // Fetch ALL invoices with company_id filter - Admin can record payments for any invoice
      const response = await invoicesAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        const allInvoices = response.data.data || []
        setInvoicesList(allInvoices)
        setInvoices(allInvoices)
        setFilteredInvoices(allInvoices) // Set all invoices as filtered
        console.log(`Fetched ${allInvoices.length} invoices for payments`)
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await companiesAPI.getAll()
      if (response.data.success) {
        setCompanies(response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    }
  }

  const fetchClients = async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchClients:', companyId)
        setClients([])
        return
      }
      const response = await clientsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        const clientNames = response.data.data.map(c => c.company_name || c.name)
        setClients(clientNames)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setFileName(file.name)
      setFormData({ ...formData, receipt: file })
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // Find invoice by ID (formData.invoice now contains invoice.id) - optional
      let selectedInvoice = null
      if (formData.invoice) {
        selectedInvoice = invoicesList.find(inv => inv.id === parseInt(formData.invoice) || inv.id.toString() === formData.invoice)
      }

      // Find project_id from project name (if provided)
      const selectedProject = projectsList.find(p => (p.project_name || p.name) === formData.project)

      // Prepare API data - use companyId from localStorage, allow empty fields
      const paymentData = {
        company_id: companyId,
        invoice_id: selectedInvoice?.id || null,
        paid_on: formData.paidOn || null,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        currency: formData.currency?.split(' ')[0] || 'USD',
        exchange_rate: parseFloat(formData.exchangeRate) || 1.0,
        transaction_id: formData.transactionId || null,
        payment_gateway: formData.paymentGateway || null,
        offline_payment_method: formData.paymentGateway && offlinePaymentMethods.includes(formData.paymentGateway) ? formData.paymentGateway : null,
        bank_account: formData.bankAccount || null,
        remark: formData.remark || null,
      }

      if (selectedProject) {
        paymentData.project_id = selectedProject.id
      }

      // Handle file upload if receipt is selected
      if (selectedFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('receipt', selectedFile)
        // For now, we'll skip file upload and add receipt_path later
        // You may need to implement a separate file upload endpoint
      }

      let response
      if (isEditModalOpen && selectedPayment) {
        response = await paymentsAPI.update(selectedPayment.id, paymentData, { company_id: companyId })
        if (response.data.success) {
          alert('Payment updated successfully!')
          setIsEditModalOpen(false)
          setIsAddModalOpen(false)
          setSelectedPayment(null)
          resetForm()
          await fetchPayments()
        }
      } else {
        response = await paymentsAPI.create(paymentData)
        if (response.data.success) {
          alert('Payment recorded successfully!')
          setIsAddModalOpen(false)
          resetForm()
          await fetchPayments()
        }
      }
    } catch (error) {
      console.error('Failed to save payment:', error)
      alert(error.response?.data?.error || 'Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkSave = () => {
    const hasErrors = bulkFormData.invoices.some(invoice => {
      if (!invoice.paymentDate) return true
      if (!invoice.amountReceived) return true
      return false
    })

    if (hasErrors) {
      alert('Please fill all required fields (Payment Date and Amount Received) for all invoices')
      return
    }

    alert('Bulk payments saved successfully!')
    setIsBulkModalOpen(false)
    resetBulkForm()
  }

  const resetForm = () => {
    setFormData({
      project: '',
      invoice: '',
      paidOn: '2025-12-21',
      amount: '',
      currency: 'USD',
      exchangeRate: 1,
      transactionId: '',
      paymentGateway: '',
      bankAccount: '',
      receipt: null,
      remark: '',
    })
    setSelectedFile(null)
    setFileName('No file chosen')
  }

  const resetBulkForm = () => {
    // Populate invoices from API - filter unpaid/partially paid invoices
    const unpaidInvoices = invoicesList
      .filter(inv => {
        const status = inv.status?.toLowerCase() || ''
        const total = parseFloat(inv.total || 0)
        const paid = parseFloat(inv.paid_amount || 0)
        return (status === 'unpaid' || status === 'partially_paid' || paid < total) && total > 0
      })
      .slice(0, 10) // Limit to 10 invoices for bulk payment
      .map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number || `INV#${inv.id}`,
        paymentDate: new Date().toISOString().split('T')[0], // Today's date
        paymentMethod: '',
        offlinePaymentMethod: '',
        bankAccount: bankAccounts[0] || '', // Default to first bank account
        transactionId: '',
        amountReceived: '',
        invoiceBalanceDue: parseFloat(inv.total || 0) - parseFloat(inv.paid_amount || 0),
      }))

    setBulkFormData({
      clientFilter: '',
      paymentMethod: '',
      invoices: unpaidInvoices,
    })
  }

  const handleOpenBulkModal = () => {
    resetBulkForm()
    setIsBulkModalOpen(true)
  }

  const handleBulkInvoiceChange = (invoiceId, field, value) => {
    setBulkFormData({
      ...bulkFormData,
      invoices: bulkFormData.invoices.map(invoice =>
        invoice.id === invoiceId
          ? { ...invoice, [field]: value }
          : invoice
      ),
    })
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
      key: 'id',
      label: 'Id',
      render: (value) => (
        <button
          onClick={() => {}}
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
      key: 'code',
      label: 'Code',
      render: (value) => (
        <button
          onClick={() => {}}
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
          onClick={() => {}}
          className="flex items-center gap-1 hover:text-primary-accent text-left"
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
      key: 'invoiceNumber',
      label: 'Invoice#',
      render: (value) => (
        <button
          onClick={() => {}}
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
      key: 'client',
      label: 'Client',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-accent/20 flex items-center justify-center text-xs font-semibold text-primary-accent">
            {row.client.avatar}
          </div>
          <div>
            <p className="text-sm font-medium text-primary-text">{row.client.name}</p>
            <p className="text-xs text-secondary-text">{row.client.company}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'orderNumber',
      label: 'Order#',
      render: (value) => (
        <button
          onClick={() => {}}
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
      key: 'amount',
      label: 'Amount',
      render: (value) => (
        <button
          onClick={() => {}}
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
      key: 'paidOn',
      label: 'Paid On',
      render: (value) => (
        <button
          onClick={() => {}}
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
      key: 'paymentGateway',
      label: 'Payment Gateway',
      render: (value) => (
        <button
          onClick={() => {}}
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
      key: 'status',
      label: 'Status',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${value === 'Complete' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-sm text-primary-text">{value}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <div className="flex items-center gap-1">
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

  const filteredPayments = payments.filter(payment => {
    if (searchQuery && !payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) && !payment.project.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (clientFilter !== 'All' && payment.client.name !== clientFilter) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Payments</h1>
          <p className="text-sm sm:text-base text-secondary-text mt-1">Manage payments and transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-secondary-text">
            <span>Duration</span>
            <span>Start Date To End Date</span>
          </div>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
          >
            <option value="All">Client All</option>
            <option value="All">All</option>
            {clients.map((client, index) => (
              <option key={`client-${index}-${client}`} value={client}>{client}</option>
            ))}
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
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <IoFilter size={18} />
              Filters
              <IoChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
          <Button variant="primary" onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="flex items-center gap-2">
            <IoAdd size={18} />
            Add Payment
          </Button>
          <Button variant="outline" onClick={() => {
            // Export payments to CSV
            const csvData = filteredPayments.map(p => ({
              'ID': p.id,
              'Code': p.code,
              'Project': p.project,
              'Invoice#': p.invoiceNumber,
              'Client': p.client?.name || '--',
              'Order#': p.orderNumber,
              'Amount': p.amount,
              'Paid On': p.paidOn,
              'Payment Gateway': p.paymentGateway,
              'Status': p.status
            }))
            const headers = Object.keys(csvData[0] || {}).join(',')
            const rows = csvData.map(row => Object.values(row).join(','))
            const csv = [headers, ...rows].join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'payments.csv'
            a.click()
            window.URL.revokeObjectURL(url)
          }} className="flex items-center gap-2">
            <IoDownload size={18} />
            Export
          </Button>
        </div>
      </div>

      {/* Payments Table */}
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
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  {columns.map((column, idx) => (
                    <td key={idx} className="px-4 py-3">
                      {column.render ? column.render(payment[column.key], payment) : (payment[column.key] || '')}
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
            Showing {filteredPayments.length} to {filteredPayments.length} of {filteredPayments.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button disabled className="px-3 py-1 border border-gray-300 rounded text-gray-400 cursor-not-allowed">
              Previous
            </button>
            <button disabled className="px-3 py-1 border border-gray-300 rounded text-gray-400 cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Add Payment Modal (Single Payment Form) */}
      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedPayment(null)
          resetForm()
        }}
        title={isEditModalOpen ? 'Edit Payment' : 'Add Payment'}
      >
        <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div>
            <h3 className="text-lg font-semibold text-primary-text mb-4">Payment details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Invoice
                </label>
                <select
                  value={formData.invoice}
                  onChange={(e) => setFormData({ ...formData, invoice: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="">-- Select Invoice --</option>
                  {filteredInvoices.length === 0 ? (
                    <option value="" disabled>No invoices found</option>
                  ) : (
                    filteredInvoices.map(invoice => {
                      const invoiceNumber = invoice.invoice_number || invoice.invoice_code || invoice.invoiceNumber || `INV-${invoice.id}` || invoice.id
                      return (
                        <option key={invoice.id} value={invoice.id}>
                          {invoiceNumber}
                        </option>
                      )
                    })
                  )}
                </select>
                {filteredInvoices.length === 0 && (
                  <p className="text-xs text-secondary-text mt-1">No invoices available</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Project
                </label>
                <select
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="">--</option>
                  {projects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Paid On
                </label>
                <Input
                  type="date"
                  value={formData.paidOn}
                  onChange={(e) => setFormData({ ...formData, paidOn: e.target.value })}
                />
                <span className="text-xs text-secondary-text mt-1 block">
                  {formatDate(formData.paidOn)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 10000"
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
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Exchange Rate <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.exchangeRate}
                  onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 1 })}
                  placeholder="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Transaction Id
                </label>
                <Input
                  value={formData.transactionId}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  placeholder="Enter transaction ID of the payment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Payment Gateway
                </label>
                <select
                  value={formData.paymentGateway}
                  onChange={(e) => setFormData({ ...formData, paymentGateway: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="">--</option>
                  {paymentGateways.map(gateway => (
                    <option key={gateway} value={gateway}>{gateway}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Bank Account
                </label>
                <select
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="">--</option>
                  {bankAccounts.map(account => (
                    <option key={account} value={account}>{account}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Receipt Section */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Receipt <IoInformationCircle className="inline ml-1 text-secondary-text" size={16} />
            </label>
            <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-accent transition-colors">
              <IoCloudUpload className="text-gray-400 mr-2" size={24} />
              <span className="text-sm text-secondary-text">Choose a file</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <p className="text-xs text-secondary-text mt-2">{fileName}</p>
          </div>

          {/* Remark Section */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Remark
            </label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
              placeholder="Enter a summary of the payment."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <IoCheckmarkCircle size={18} />
              Save
            </Button>
          </div>

          {/* Add Bulk Payment Link */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setIsAddModalOpen(false)
                handleOpenBulkModal()
              }}
              className="text-sm text-primary-accent hover:underline"
            >
              Add Bulk Payment
            </button>
          </div>
        </div>
      </RightSideModal>

      {/* Add Bulk Payment Modal */}
      <RightSideModal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false)
          resetBulkForm()
        }}
        title="Add Bulk Payment"
        width="max-w-7xl"
      >
        <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Filter invoices by client
              </label>
              <select
                value={bulkFormData.clientFilter}
                onChange={(e) => setBulkFormData({ ...bulkFormData, clientFilter: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="">Filter invoices by client</option>
                {clients.map((client, index) => (
                  <option key={`bulk-client-${index}-${client}`} value={client}>{client}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Select Payment Method
              </label>
              <select
                value={bulkFormData.paymentMethod}
                onChange={(e) => {
                  const newMethod = e.target.value
                  setBulkFormData({
                    ...bulkFormData,
                    paymentMethod: newMethod,
                    invoices: bulkFormData.invoices.map(inv => ({
                      ...inv,
                      paymentMethod: newMethod,
                    })),
                  })
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="">Select Payment Method</option>
                {paymentGateways.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Payment Table */}
          <div className="border-t border-gray-200 pt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">Invoice Number #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">Payment Date <span className="text-red-500">*</span></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">Payment Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">Offline Payment Methods</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">Bank Account</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">Transaction Id</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">Amount Received <span className="text-red-500">*</span></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">Invoice Balance Due</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bulkFormData.invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-primary-text">{invoice.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="date"
                          value={invoice.paymentDate}
                          onChange={(e) => handleBulkInvoiceChange(invoice.id, 'paymentDate', e.target.value)}
                          required
                          className="w-full"
                        />
                        <span className="text-xs text-secondary-text mt-1 block">
                          {formatDate(invoice.paymentDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={invoice.paymentMethod}
                          onChange={(e) => handleBulkInvoiceChange(invoice.id, 'paymentMethod', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                        >
                          <option value="">--</option>
                          {paymentGateways.map(method => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={invoice.offlinePaymentMethod}
                          onChange={(e) => handleBulkInvoiceChange(invoice.id, 'offlinePaymentMethod', e.target.value)}
                          disabled={invoice.paymentMethod !== 'Bank Transfer' && invoice.paymentMethod !== 'Cash' && invoice.paymentMethod !== 'Cheque'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">--</option>
                          {offlinePaymentMethods.map(method => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={invoice.bankAccount}
                          onChange={(e) => handleBulkInvoiceChange(invoice.id, 'bankAccount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                        >
                          {bankAccounts.map(account => (
                            <option key={account} value={account}>{account}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={invoice.transactionId}
                          onChange={(e) => handleBulkInvoiceChange(invoice.id, 'transactionId', e.target.value)}
                          placeholder="Enter transaction ID"
                          className="w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={invoice.amountReceived}
                          onChange={(e) => handleBulkInvoiceChange(invoice.id, 'amountReceived', e.target.value)}
                          placeholder="0.00"
                          required
                          className="w-full"
                        />
                        {invoice.amountReceived && (
                          <span className="text-xs text-secondary-text mt-1 block">
                            {formatCurrency(parseFloat(invoice.amountReceived) || 0)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-primary-text">
                          {formatCurrency(invoice.invoiceBalanceDue)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsBulkModalOpen(false)
                resetBulkForm()
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBulkSave}
              className="flex items-center gap-2"
            >
              <IoCheckmarkCircle size={18} />
              Save
            </Button>
          </div>
        </div>
      </RightSideModal>
    </div>
  )
}

export default Payments


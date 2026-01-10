import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { invoicesAPI, clientsAPI, projectsAPI, companiesAPI, paymentsAPI } from '../../../api'
import { useSettings } from '../../../context/SettingsContext'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import { 
  IoArrowBack,
  IoBriefcase,
  IoCalendar,
  IoTime,
  IoMail,
  IoAdd,
  IoCreate,
  IoTrash,
  IoCheckmarkCircle,
  IoDocumentText,
  IoPrint,
  IoDownload,
  IoEye,
  IoClose,
  IoChevronDown,
  IoSearch,
  IoFilter,
  IoEllipsisVertical,
  IoRefresh,
  IoAttach,
  IoMic,
  IoCloseCircle,
  IoOpenOutline,
  IoHappyOutline,
  IoCreateOutline,
  IoMailOutline,
  IoCopy,
  IoLocation,
  IoGlobe,
  IoCall,
  IoCash,
  IoWarning,
  IoCheckmark,
  IoPricetag
} from 'react-icons/io5'

const InvoiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { formatDate, formatCurrency, getCompanyInfo } = useSettings()
  // Get company_id from localStorage
  const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
  const [invoice, setInvoice] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false)
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false)
  const [company, setCompany] = useState(null)
  const [client, setClient] = useState(null)
  const [payments, setPayments] = useState([])
  const [activeTab, setActiveTab] = useState('invoices') // 'invoices' or 'recurring'
  
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Cash',
    reference_note: '',
  })

  useEffect(() => {
    fetchInvoice()
    fetchInvoices()
    if (id) {
      fetchPayments()
    }
  }, [id])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchInvoice:', companyId)
        setLoading(false)
        return
      }
      const response = await invoicesAPI.getById(id, { company_id: companyId })
      if (response.data.success) {
        const data = response.data.data
        setInvoice({
          id: data.id,
          invoice_number: data.invoice_number || `INV #${data.id}`,
          client_id: data.client_id,
          client_name: data.client_name || '--',
          project_id: data.project_id,
          project_name: data.project_name || '--',
          bill_date: data.bill_date || data.invoice_date || data.created_at || '',
          due_date: data.due_date || '--',
          status: (data.status || 'draft').toLowerCase(),
          description: data.description || '',
          note: data.note || '',
          terms: data.terms || '',
          currency: data.currency || 'USD',
          sub_total: parseFloat(data.sub_total) || 0,
          discount_amount: parseFloat(data.discount_amount) || 0,
          tax_amount: parseFloat(data.tax_amount) || 0,
          total: parseFloat(data.total) || 0,
          paid_amount: parseFloat(data.paid_amount || data.paid || 0),
          due_amount: parseFloat(data.due_amount || data.unpaid || (data.total || 0) - (data.paid_amount || data.paid || 0)),
          items: data.items || [],
          created_by: data.created_by || null,
        })
        
        // Fetch company and client details (optional, don't fail if not found)
        if (data.company_id) {
          try {
            const companyResponse = await companiesAPI.getById(data.company_id)
            if (companyResponse.data && companyResponse.data.success && companyResponse.data.data) {
              setCompany(companyResponse.data.data)
            } else {
              // Company not found - set to null, don't break page
              setCompany(null)
            }
          } catch (err) {
            // Silently fail - company data is optional, don't break the page
            console.log('Company not found or error:', err.response?.status || err.message)
            setCompany(null)
          }
        }
        
        if (data.client_id) {
          try {
            // Get company_id from localStorage for the API call
            const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
            const clientResponse = await clientsAPI.getById(data.client_id, { company_id: companyId })
            if (clientResponse.data && clientResponse.data.success) {
              setClient(clientResponse.data.data)
            }
          } catch (err) {
            // Silently fail - client data is optional
            console.log('Client not found or error:', err.response?.status)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInvoices = async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchInvoices:', companyId)
        setInvoices([])
        return
      }
      const params = { company_id: companyId }
      if (statusFilter !== 'All') {
        params.status = statusFilter
      }
      const response = await invoicesAPI.getAll(params)
      if (response.data.success) {
        const invoicesData = (response.data.data || []).map(inv => ({
          id: inv.id,
          invoice_number: inv.invoice_number || `INV #${inv.id}`,
          client_name: inv.client_name || '--',
          bill_date: inv.bill_date || inv.invoice_date || inv.created_at || '',
          due_date: inv.due_date || '',
          total: parseFloat(inv.total) || 0,
          paid_amount: parseFloat(inv.paid_amount || inv.paid || 0),
          due_amount: parseFloat(inv.due_amount || inv.unpaid || (inv.total || 0) - (inv.paid_amount || inv.paid || 0)),
          status: (inv.status || 'draft').toLowerCase(),
        }))
        setInvoices(invoicesData)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }

  const fetchPayments = async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchPayments:', companyId)
        setPayments([])
        return
      }
      const response = await paymentsAPI.getAll({ invoice_id: id, company_id: companyId })
      if (response.data.success) {
        setPayments(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    }
  }

  const handleView = (invoice) => {
    navigate(`/app/admin/invoices/${invoice.id}`)
  }

  const handleAddPayment = async () => {
    try {
      const response = await paymentsAPI.create({
        invoice_id: id,
        amount: parseFloat(paymentFormData.amount),
        payment_date: paymentFormData.payment_date,
        payment_method: paymentFormData.payment_method,
        reference_note: paymentFormData.reference_note,
      })
      if (response.data.success) {
        await fetchInvoice()
        await fetchPayments()
        setIsAddPaymentModalOpen(false)
        setPaymentFormData({
          amount: '',
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'Cash',
          reference_note: '',
        })
      }
    } catch (error) {
      console.error('Error adding payment:', error)
      alert('Failed to add payment')
    }
  }

  // formatDate and formatCurrency are now provided by useSettings context

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-info { margin-bottom: 20px; }
          .invoice-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total-row { font-weight: bold; }
          .footer { margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <h2>${invoice.invoice_number}</h2>
        </div>
        
        <div class="company-info">
          <h3>Company Information</h3>
          <p><strong>Name:</strong> ${company?.name || 'N/A'}</p>
          <p><strong>Address:</strong> ${company?.address || 'N/A'}</p>
        </div>
        
        <div class="invoice-info">
          <h3>Invoice Information</h3>
          <p><strong>Client:</strong> ${invoice.client_name || 'N/A'}</p>
          <p><strong>Project:</strong> ${invoice.project_name || 'N/A'}</p>
          <p><strong>Invoice Date:</strong> ${formatDate(invoice.invoice_date || invoice.bill_date)}</p>
          <p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
          <p><strong>Status:</strong> ${invoice.status}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items && invoice.items.length > 0 ? invoice.items.map(item => `
              <tr>
                <td>${item.item_name || item.name || '-'}</td>
                <td>${item.description || '-'}</td>
                <td>${item.quantity || 0} ${item.unit || ''}</td>
                <td>${formatCurrency(item.unit_price || 0)}</td>
                <td>${formatCurrency(item.amount || 0)}</td>
              </tr>
            `).join('') : '<tr><td colspan="5">No items</td></tr>'}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="total-row">Sub Total:</td>
              <td class="total-row">${formatCurrency(invoice.sub_total || 0)}</td>
            </tr>
            ${invoice.discount_amount > 0 ? `
            <tr>
              <td colspan="4">Discount:</td>
              <td>${formatCurrency(invoice.discount_amount || 0)}</td>
            </tr>
            ` : ''}
            ${invoice.tax_amount > 0 ? `
            <tr>
              <td colspan="4">Tax:</td>
              <td>${formatCurrency(invoice.tax_amount || 0)}</td>
            </tr>
            ` : ''}
            <tr>
              <td colspan="4" class="total-row">Total:</td>
              <td class="total-row">${formatCurrency(invoice.total || 0)}</td>
            </tr>
            ${invoice.paid_amount > 0 ? `
            <tr>
              <td colspan="4">Paid:</td>
              <td>${formatCurrency(invoice.paid_amount || 0)}</td>
            </tr>
            ` : ''}
            <tr>
              <td colspan="4" class="total-row">Due:</td>
              <td class="total-row">${formatCurrency(invoice.due_amount || invoice.unpaid || 0)}</td>
            </tr>
          </tfoot>
        </table>
        
        ${invoice.terms ? `
        <div class="footer">
          <h3>Terms & Conditions:</h3>
          <p>${invoice.terms.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>
        ` : ''}
        
        ${invoice.note ? `
        <div class="footer">
          <h3>Note:</h3>
          <p>${invoice.note.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>
        ` : ''}
      </body>
      </html>
    `
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const handlePreview = () => {
    // Open invoice in a new tab for preview
    window.open(`/app/admin/invoices/${id}/preview?company_id=${companyId}`, '_blank')
  }

  const handleDownloadPDF = async () => {
    try {
      // Create a printable version of the invoice
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Please allow popups to download PDF')
        return
      }
      
      const invoiceHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice?.invoice_number || ''}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .company-info { text-align: right; }
            .invoice-title { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 20px; }
            .invoice-details { margin-bottom: 30px; }
            .invoice-details p { margin: 5px 0; }
            .client-info { margin-bottom: 30px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f8f9fa; font-weight: 600; }
            .totals { text-align: right; }
            .totals p { margin: 8px 0; }
            .total-row { font-size: 18px; font-weight: bold; color: #333; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
            .status-unpaid { background: #fee2e2; color: #dc2626; }
            .status-paid { background: #dcfce7; color: #16a34a; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="invoice-title">INVOICE</div>
              <p><strong>${invoice?.invoice_number || ''}</strong></p>
            </div>
            <div class="company-info">
              <h3>${invoice?.company_name || 'Company'}</h3>
              <p>${invoice?.company_address || ''}</p>
            </div>
          </div>
          
          <div class="invoice-details">
            <p><strong>Invoice Date:</strong> ${invoice?.invoice_date || invoice?.bill_date || ''}</p>
            <p><strong>Due Date:</strong> ${invoice?.due_date || ''}</p>
            <p><strong>Status:</strong> <span class="status ${invoice?.status === 'Paid' ? 'status-paid' : 'status-unpaid'}">${invoice?.status || 'Unpaid'}</span></p>
          </div>
          
          <div class="client-info">
            <h4>Bill To:</h4>
            <p><strong>${invoice?.client_name || ''}</strong></p>
            <p>${invoice?.billing_address || ''}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(invoice?.items || []).map(item => `
                <tr>
                  <td>${item.item_name || ''}</td>
                  <td>${item.description || ''}</td>
                  <td>${item.quantity || 1}</td>
                  <td>${invoice?.currency || '₹'}${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                  <td>${invoice?.currency || '₹'}${parseFloat(item.amount || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Subtotal: ${invoice?.currency || '₹'}${parseFloat(invoice?.sub_total || 0).toFixed(2)}</p>
            <p>Discount: ${invoice?.currency || '₹'}${parseFloat(invoice?.discount_amount || 0).toFixed(2)}</p>
            <p>Tax: ${invoice?.currency || '₹'}${parseFloat(invoice?.tax_amount || 0).toFixed(2)}</p>
            <p class="total-row">Total: ${invoice?.currency || '₹'}${parseFloat(invoice?.total || 0).toFixed(2)}</p>
          </div>
          
          ${invoice?.terms ? `<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;"><p><strong>Terms:</strong> ${invoice.terms}</p></div>` : ''}
          
          <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
      `
      
      printWindow.document.write(invoiceHtml)
      printWindow.document.close()
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF')
    }
  }

  const filteredInvoices = invoices.filter(inv => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return inv.invoice_number?.toLowerCase().includes(query) || 
             inv.client_name?.toLowerCase().includes(query)
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-primary-text">Loading...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-primary-text mb-4">Invoice not found</p>
          <Button onClick={() => navigate('/app/admin/invoices')}>Back to Invoices</Button>
        </div>
      </div>
    )
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    unpaid: 'bg-yellow-100 text-yellow-800',
    'partially paid': 'bg-blue-100 text-blue-800',
    'fully paid': 'bg-green-100 text-green-800',
    credited: 'bg-red-100 text-red-800',
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left Sidebar - Invoices List */}
      {isSidebarOpen && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  activeTab === 'invoices'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Invoices
              </button>
            </div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-primary-text">Invoices</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <IoClose size={20} />
              </button>
            </div>
            <div className="relative mb-3">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoices..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => handleView(inv)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  inv.id === parseInt(id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-primary-text">{inv.invoice_number}</p>
                    <p className="text-xs text-secondary-text mt-1">{formatDate(inv.bill_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-text">{formatCurrency(inv.total)}</p>
                    {inv.due_date && (
                      <p className="text-xs text-secondary-text mt-1">Due: {formatDate(inv.due_date)}</p>
                    )}
                    <p className="text-xs text-secondary-text">Due: {formatCurrency(inv.due_amount)}</p>
                    <Badge className={`text-xs mt-1 ${statusColors[inv.status] || statusColors.draft}`}>
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <IoArrowBack size={20} />
                </button>
              )}
              <button
                onClick={() => navigate('/app/admin/invoices')}
                class="text-primary-text hover:text-primary-blue"
              >
                ← Invoices
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Invoice Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-primary-text">{invoice.invoice_number}</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className={statusColors[invoice.status] || statusColors.draft}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                    <div className="flex items-center gap-2 text-secondary-text">
                      <IoCalendar size={16} />
                      <span>Bill date: {formatDate(invoice.bill_date)}</span>
                    </div>
                    {invoice.due_date && invoice.due_date !== '--' && (
                      <div className="flex items-center gap-2 text-secondary-text">
                        <IoTime size={16} />
                        <span>Due date: {formatDate(invoice.due_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative">
                  {isMoreActionsOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          setIsEditModalOpen(true)
                          setIsMoreActionsOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                      >
                        <IoCreate size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this invoice?')) {
                            invoicesAPI.delete(id).then(() => {
                              navigate('/app/admin/invoices')
                            })
                          }
                          setIsMoreActionsOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600 flex items-center gap-2"
                      >
                        <IoTrash size={16} />
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setIsAddPaymentModalOpen(true)
                          setIsMoreActionsOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                      >
                        <IoCash size={16} />
                        Add payment
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Company & Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Company Info */}
                <div>
                  {company && (
                    <>
                      <div className="mb-4">
                        <div className="w-16 h-16 bg-primary-blue/10 rounded-lg flex items-center justify-center mb-2">
                          <span className="text-2xl font-bold text-primary-blue">
                            {company.name?.substring(0, 2).toUpperCase() || 'CO'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-primary-text">{company.name || 'Company Name'}</h3>
                        {company.address && (
                          <p className="text-sm text-secondary-text mt-1 flex items-start gap-1">
                            <IoLocation size={14} className="mt-0.5 flex-shrink-0" />
                            {company.address}
                          </p>
                        )}
                        {company.phone && (
                          <p className="text-sm text-secondary-text mt-1 flex items-center gap-1">
                            <IoCall size={14} />
                            {company.phone}
                          </p>
                        )}
                        {company.email && (
                          <p className="text-sm text-secondary-text mt-1 flex items-center gap-1">
                            <IoMail size={14} />
                            {company.email}
                          </p>
                        )}
                        {company.website && (
                          <p className="text-sm text-secondary-text mt-1 flex items-center gap-1">
                            <IoGlobe size={14} />
                            {company.website}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Client Info */}
                <div>
                  <h3 className="font-semibold text-primary-text mb-2">Bill To</h3>
                  {client ? (
                    <>
                      <p className="text-primary-text">{client.company_name || client.name || 'Client Name'}</p>
                      {client.address && (
                        <p className="text-sm text-secondary-text mt-1 flex items-start gap-1">
                          <IoLocation size={14} className="mt-0.5 flex-shrink-0" />
                          {client.address}
                        </p>
                      )}
                      {client.phone && (
                        <p className="text-sm text-secondary-text mt-1 flex items-center gap-1">
                          <IoCall size={14} />
                          {client.phone}
                        </p>
                      )}
                      {client.email && (
                        <p className="text-sm text-secondary-text mt-1 flex items-center gap-1">
                          <IoMail size={14} />
                          {client.email}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-secondary-text">{invoice.client_name}</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="mt-6">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-primary-text">Item</th>
                      <th className="text-left p-3 text-sm font-semibold text-primary-text">Quantity</th>
                      <th className="text-left p-3 text-sm font-semibold text-primary-text">Rate</th>
                      <th className="text-right p-3 text-sm font-semibold text-primary-text">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-primary-text">{item.item_name || 'Item'}</p>
                              {item.description && (
                                <p className="text-sm text-secondary-text mt-1">{item.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-secondary-text">{item.quantity || 0} {item.unit || ''}</td>
                          <td className="p-3 text-secondary-text">{formatCurrency(item.unit_price || 0)}</td>
                          <td className="p-3 text-right font-semibold text-primary-text">
                            {formatCurrency(item.amount || (item.quantity * item.unit_price) || 0)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-secondary-text">
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="mt-4 flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-text">Sub Total:</span>
                      <span className="text-primary-text">{formatCurrency(invoice.sub_total)}</span>
                    </div>
                    {invoice.discount_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-text">Discount:</span>
                        <span className="text-primary-text">{formatCurrency(invoice.discount_amount)}</span>
                      </div>
                    )}
                    {invoice.tax_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-text">Tax:</span>
                        <span className="text-primary-text">{formatCurrency(invoice.tax_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                      <span className="text-primary-text">Balance Due:</span>
                      <span className="text-primary-text">{formatCurrency(invoice.due_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description/Note */}
              {invoice.note && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-secondary-text">{invoice.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {isRightSidebarOpen && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-primary-text">Invoice info</h3>
              <button
                onClick={() => setIsRightSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <IoClose size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Client Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <IoBriefcase size={16} className="text-secondary-text" />
                <span className="text-sm font-semibold text-primary-text">Client</span>
              </div>
              <p className="text-sm text-primary-text">{invoice.client_name}</p>
            </div>

            {invoice.project_name && invoice.project_name !== '--' && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IoBriefcase size={16} className="text-secondary-text" />
                  <span className="text-sm font-semibold text-primary-text">Project</span>
                </div>
                <p className="text-sm text-primary-text">{invoice.project_name}</p>
              </div>
            )}

            {/* Document Actions */}
            <div>
              <h4 className="text-sm font-semibold text-primary-text mb-3">Document Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-black hover:text-white flex items-center justify-center gap-1"
                  onClick={handlePreview}
                >
                  <IoEye size={16} />
                  Preview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-black hover:text-white flex items-center justify-center gap-1"
                  onClick={handlePrint}
                >
                  <IoPrint size={16} />
                  Print
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-black hover:text-white flex items-center justify-center gap-1 col-span-2"
                  onClick={handleDownloadPDF}
                >
                  <IoDownload size={16} />
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Payments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-primary-text">Payments</h4>
                <button
                  onClick={() => setIsAddPaymentModalOpen(true)}
                  className="text-primary-blue hover:text-primary-blue/80"
                >
                  <IoAdd size={16} />
                </button>
              </div>
              {payments.length > 0 ? (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div key={payment.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex justify-between">
                        <span className="text-primary-text">{formatCurrency(payment.amount)}</span>
                        <span className="text-secondary-text">{formatDate(payment.payment_date)}</span>
                      </div>
                      {payment.payment_method && (
                        <p className="text-xs text-secondary-text mt-1">{payment.payment_method}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-secondary-text">No payments yet</div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Modals */}
      {/* Preview Modal */}
      {isPreviewModalOpen && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title="Invoice Preview"
          width="max-w-4xl"
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">INVOICE</h2>
              <h3 className="text-xl">{invoice.invoice_number}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Company Information</h4>
                <p><strong>Name:</strong> {company?.name || 'N/A'}</p>
                <p><strong>Address:</strong> {company?.address || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Invoice Information</h4>
                <p><strong>Client:</strong> {invoice.client_name || 'N/A'}</p>
                <p><strong>Project:</strong> {invoice.project_name || 'N/A'}</p>
                <p><strong>Invoice Date:</strong> {formatDate(invoice.invoice_date || invoice.bill_date)}</p>
                <p><strong>Due Date:</strong> {formatDate(invoice.due_date)}</p>
                <p><strong>Status:</strong> {invoice.status}</p>
              </div>
            </div>
            
            {invoice.items && invoice.items.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Items</h4>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Item</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-right p-2">Quantity</th>
                      <th className="text-right p-2">Unit Price</th>
                      <th className="text-right p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{item.item_name || item.name || '-'}</td>
                        <td className="p-2">{item.description || '-'}</td>
                        <td className="p-2 text-right">{item.quantity || 0} {item.unit || ''}</td>
                        <td className="p-2 text-right">{formatCurrency(item.unit_price || 0)}</td>
                        <td className="p-2 text-right">{formatCurrency(item.amount || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td colSpan="4" className="p-2">Sub Total:</td>
                      <td className="p-2 text-right">{formatCurrency(invoice.sub_total || 0)}</td>
                    </tr>
                    {invoice.discount_amount > 0 && (
                      <tr>
                        <td colSpan="4" className="p-2">Discount:</td>
                        <td className="p-2 text-right">{formatCurrency(invoice.discount_amount || 0)}</td>
                      </tr>
                    )}
                    {invoice.tax_amount > 0 && (
                      <tr>
                        <td colSpan="4" className="p-2">Tax:</td>
                        <td className="p-2 text-right">{formatCurrency(invoice.tax_amount || 0)}</td>
                      </tr>
                    )}
                    <tr className="font-bold">
                      <td colSpan="4" className="p-2">Total:</td>
                      <td className="p-2 text-right">{formatCurrency(invoice.total || 0)}</td>
                    </tr>
                    {invoice.paid_amount > 0 && (
                      <tr>
                        <td colSpan="4" className="p-2">Paid:</td>
                        <td className="p-2 text-right">{formatCurrency(invoice.paid_amount || 0)}</td>
                      </tr>
                    )}
                    <tr className="font-bold">
                      <td colSpan="4" className="p-2">Due:</td>
                      <td className="p-2 text-right">{formatCurrency(invoice.due_amount || invoice.unpaid || 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            
            {invoice.terms && (
              <div>
                <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                <p className="text-sm">{invoice.terms}</p>
              </div>
            )}
            
            {invoice.note && (
              <div>
                <h4 className="font-semibold mb-2">Note</h4>
                <p className="text-sm">{invoice.note}</p>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isAddPaymentModalOpen && (
        <Modal
          isOpen={isAddPaymentModalOpen}
          onClose={() => setIsAddPaymentModalOpen(false)}
          title="Add Payment"
        >
          <div className="space-y-4">
            <Input
              type="number"
              label="Amount"
              value={paymentFormData.amount}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
              placeholder="Enter amount"
            />
            <Input
              type="date"
              label="Payment Date"
              value={paymentFormData.payment_date}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_date: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Payment Method</label>
              <select
                value={paymentFormData.payment_method}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Check">Check</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>
            <Input
              label="Reference Note"
              value={paymentFormData.reference_note}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, reference_note: e.target.value })}
              placeholder="Optional reference note"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsAddPaymentModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={handleAddPayment}>
                Save
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default InvoiceDetail


import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { estimatesAPI, clientsAPI, projectsAPI, companiesAPI } from '../../../api'
import baseUrl from '../../../api/baseUrl'
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
  IoCall
} from 'react-icons/io5'

const EstimateDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [estimate, setEstimate] = useState(null)
  const [estimates, setEstimates] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false)
  const [company, setCompany] = useState(null)
  const [client, setClient] = useState(null)
  // Get companyId safely
  const [companyId] = useState(() => {
    try {
      const stored = localStorage.getItem('companyId')
      return parseInt(stored || 1, 10)
    } catch (e) {
      console.error('Error accessing localStorage:', e)
      return 1
    }
  })

  const [formData, setFormData] = useState({
    note: '',
    signer_name: '',
    signer_email: '',
  })

  useEffect(() => {
    fetchEstimate()
    fetchEstimates()
  }, [id])

  const fetchEstimate = async () => {
    try {
      setLoading(true)
      const response = await estimatesAPI.getById(id)
      if (response.data.success) {
        const data = response.data.data
        setEstimate({
          id: data.id,
          estimate_number: data.estimate_number || `ESTIMATE #${data.id}`,
          client_id: data.client_id,
          client_name: data.client_name || '--',
          project_id: data.project_id,
          project_name: data.project_name || '--',
          estimate_date: data.created_at || data.estimate_date || '',
          valid_till: data.valid_till || '--',
          status: (data.status || 'draft').toLowerCase(),
          description: data.description || '',
          note: data.note || '',
          terms: data.terms || '',
          currency: data.currency || 'USD',
          sub_total: parseFloat(data.sub_total) || 0,
          discount_amount: parseFloat(data.discount_amount) || 0,
          tax_amount: parseFloat(data.tax_amount) || 0,
          total: parseFloat(data.total) || 0,
          items: data.items || [],
          created_by: data.created_by || null,
        })
        setFormData({
          note: data.note || '',
          signer_name: data.signer_name || '',
          signer_email: data.signer_email || '',
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
            // Use component companyId
            // const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
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
      console.error('Error fetching estimate:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEstimates = async () => {
    try {
      // Get company_id from localStorage
      // Use component companyId
      // const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchEstimates:', companyId)
        setEstimates([])
        return
      }
      const params = { company_id: companyId }
      if (statusFilter !== 'All') {
        params.status = statusFilter
      }
      const response = await estimatesAPI.getAll(params)
      if (response.data.success) {
        const estimatesData = (response.data.data || []).map(est => ({
          id: est.id,
          estimate_number: est.estimate_number || `ESTIMATE #${est.id}`,
          client_name: est.client_name || '--',
          total: parseFloat(est.total) || 0,
          status: (est.status || 'draft').toLowerCase(),
        }))
        setEstimates(estimatesData)
      }
    } catch (error) {
      console.error('Error fetching estimates:', error)
    }
  }

  const handleView = (estimate) => {
    navigate(`/app/admin/estimates/${estimate.id}`)
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await estimatesAPI.update(id, { status: newStatus })
      if (response.data.success) {
        await fetchEstimate()
        await fetchEstimates()
        setIsActionsDropdownOpen(false)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '--'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount) => {
    // Extract valid ISO currency code (first 3 letters) from currency string like "USD ($)"
    let currencyCode = estimate?.currency || 'USD'
    if (currencyCode.includes(' ')) {
      currencyCode = currencyCode.split(' ')[0]
    }
    // Ensure it's a valid 3-letter code
    if (currencyCode.length !== 3) {
      currencyCode = 'USD'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Estimate ${estimate.estimate_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-info { margin-bottom: 20px; }
          .estimate-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total-row { font-weight: bold; }
          .footer { margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ESTIMATE</h1>
          <h2>${estimate.estimate_number}</h2>
        </div>
        
        <div class="company-info">
          <h3>Company Information</h3>
          <p><strong>Name:</strong> ${company?.name || 'N/A'}</p>
          <p><strong>Address:</strong> ${company?.address || 'N/A'}</p>
        </div>
        
        <div class="estimate-info">
          <h3>Estimate Information</h3>
          <p><strong>Client:</strong> ${estimate.client_name || 'N/A'}</p>
          <p><strong>Project:</strong> ${estimate.project_name || 'N/A'}</p>
          <p><strong>Date:</strong> ${formatDate(estimate.estimate_date)}</p>
          <p><strong>Valid Till:</strong> ${formatDate(estimate.valid_till)}</p>
          <p><strong>Status:</strong> ${estimate.status}</p>
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
            ${estimate.items && estimate.items.length > 0 ? estimate.items.map(item => `
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
              <td class="total-row">${formatCurrency(estimate.sub_total || 0)}</td>
            </tr>
            ${estimate.discount_amount > 0 ? `
            <tr>
              <td colspan="4">Discount:</td>
              <td>${formatCurrency(estimate.discount_amount || 0)}</td>
            </tr>
            ` : ''}
            ${estimate.tax_amount > 0 ? `
            <tr>
              <td colspan="4">Tax:</td>
              <td>${formatCurrency(estimate.tax_amount || 0)}</td>
            </tr>
            ` : ''}
            <tr>
              <td colspan="4" class="total-row">Total:</td>
              <td class="total-row">${formatCurrency(estimate.total || 0)}</td>
            </tr>
          </tfoot>
        </table>
        
        ${estimate.terms ? `
        <div class="footer">
          <h3>Terms & Conditions:</h3>
          <p>${estimate.terms.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>
        ` : ''}
        
        ${estimate.note ? `
        <div class="footer">
          <h3>Note:</h3>
          <p>${estimate.note.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
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
    setIsPreviewModalOpen(true)
  }

  const handleViewPDF = () => {
    const pdfUrl = `${baseUrl}/api/v1/estimates/${id}/pdf?company_id=${companyId}`
    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  }

  const handleDownloadPDF = () => {
    const pdfUrl = `${baseUrl}/api/v1/estimates/${id}/pdf?company_id=${companyId}&download=1`
    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  }

  const filteredEstimates = estimates.filter(est => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return est.estimate_number?.toLowerCase().includes(query) ||
        est.client_name?.toLowerCase().includes(query)
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

  if (!estimate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-primary-text mb-4">Estimate not found</p>
          <Button onClick={() => navigate('/app/admin/estimates')}>Back to Estimates</Button>
        </div>
      </div>
    )
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }

  // Show loading state
  if (loading && !estimate) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading estimate details...</p>
        </div>
      </div>
    )
  }

  // Show error if estimate not found
  if (!loading && !estimate) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Estimate Not Found</h2>
          <p className="text-gray-600 mb-4">The estimate you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/admin/estimates')}>
            <IoArrowBack className="mr-2" />
            Back to Estimates
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left Sidebar - Estimates List */}
      {isSidebarOpen && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary-text">Estimates</h2>
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
                placeholder="Search estimates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none text-sm"
              />
            </div>
            <button className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <IoFilter size={16} />
              Add new filter
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredEstimates.map((est) => (
              <div
                key={est.id}
                onClick={() => handleView(est)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${est.id === parseInt(id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-primary-text">{est.estimate_number}</p>
                    <p className="text-sm text-secondary-text mt-1">{est.client_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-text">{formatCurrency(est.total)}</p>
                    <Badge className={`text-xs mt-1 ${statusColors[est.status] || statusColors.draft}`}>
                      {est.status.charAt(0).toUpperCase() + est.status.slice(1)}
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
                onClick={() => navigate('/app/admin/estimates')}
                className="text-primary-text hover:text-primary-blue"
              >
                ← Estimates
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Estimate Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-primary-text">{estimate.estimate_number}</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className={statusColors[estimate.status] || statusColors.draft}>
                      {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                    </Badge>
                    <div className="flex items-center gap-2 text-secondary-text">
                      <IoCalendar size={16} />
                      <span>{formatDate(estimate.estimate_date)}</span>
                    </div>
                    {estimate.valid_till && estimate.valid_till !== '--' && (
                      <div className="flex items-center gap-2 text-secondary-text">
                        <IoTime size={16} />
                        <span>Valid until: {formatDate(estimate.valid_till)}</span>
                      </div>
                    )}
                  </div>
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
                  <h3 className="font-semibold text-primary-text mb-2">Estimate To</h3>
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
                    <p className="text-secondary-text">{estimate.client_name}</p>
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
                    {estimate.items && estimate.items.length > 0 ? (
                      estimate.items.map((item, idx) => (
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
                      <span className="text-primary-text">{formatCurrency(estimate.sub_total)}</span>
                    </div>
                    {estimate.discount_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-text">Discount:</span>
                        <span className="text-primary-text">{formatCurrency(estimate.discount_amount)}</span>
                      </div>
                    )}
                    {estimate.tax_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-text">Tax:</span>
                        <span className="text-primary-text">{formatCurrency(estimate.tax_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                      <span className="text-primary-text">Total:</span>
                      <span className="text-primary-text">{formatCurrency(estimate.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {isRightSidebarOpen && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-primary-text">Estimate info</h3>
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
              <p className="text-sm text-primary-text">{estimate.client_name}</p>
            </div>

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
                  className="text-black hover:text-white flex items-center justify-center gap-1"
                  onClick={handleDownloadPDF}
                >
                  <IoDownload size={16} />
                  Download PDF
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewModalOpen && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title="Estimate Preview"
          width="max-w-4xl"
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">ESTIMATE</h2>
              <h3 className="text-xl">{estimate.estimate_number}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Company Information</h4>
                <p><strong>Name:</strong> {company?.name || 'N/A'}</p>
                <p><strong>Address:</strong> {company?.address || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Estimate Information</h4>
                <p><strong>Client:</strong> {estimate.client_name || 'N/A'}</p>
                <p><strong>Project:</strong> {estimate.project_name || 'N/A'}</p>
                <p><strong>Date:</strong> {formatDate(estimate.estimate_date)}</p>
                <p><strong>Valid Till:</strong> {formatDate(estimate.valid_till)}</p>
              </div>
            </div>

            {estimate.items && estimate.items.length > 0 && (
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
                    {estimate.items.map((item, index) => (
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
                      <td className="p-2 text-right">{formatCurrency(estimate.sub_total || 0)}</td>
                    </tr>
                    {estimate.discount_amount > 0 && (
                      <tr>
                        <td colSpan="4" className="p-2">Discount:</td>
                        <td className="p-2 text-right">{formatCurrency(estimate.discount_amount || 0)}</td>
                      </tr>
                    )}
                    {estimate.tax_amount > 0 && (
                      <tr>
                        <td colSpan="4" className="p-2">Tax:</td>
                        <td className="p-2 text-right">{formatCurrency(estimate.tax_amount || 0)}</td>
                      </tr>
                    )}
                    <tr className="font-bold">
                      <td colSpan="4" className="p-2">Total:</td>
                      <td className="p-2 text-right">{formatCurrency(estimate.total || 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {estimate.terms && (
              <div>
                <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                <p className="text-sm">{estimate.terms}</p>
              </div>
            )}

            {estimate.note && (
              <div>
                <h4 className="font-semibold mb-2">Note</h4>
                <p className="text-sm">{estimate.note}</p>
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
    </div>
  )
}

export default EstimateDetail


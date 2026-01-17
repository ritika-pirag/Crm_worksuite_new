import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { useSettings } from '../../../context/SettingsContext'
import DataTable from '../../../components/ui/DataTable'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { contractsAPI, companiesAPI } from '../../../api'
import { 
  IoEye, 
  IoDownload, 
  IoPrint,
  IoCheckmark,
  IoClose,
  IoCalendar,
  IoTime,
  IoDocumentText,
  IoFilter,
  IoSearch,
  IoChevronDown,
  IoChevronUp
} from 'react-icons/io5'
import { FaEye, FaPrint, FaRegFilePdf, FaDownload } from 'react-icons/fa'

const Contracts = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const { formatDate, formatCurrency, getCompanyInfo } = useSettings()
  
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  const clientId = user?.client_id || localStorage.getItem('clientId')
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState(null)
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [companyInfo, setCompanyInfo] = useState(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })

  useEffect(() => {
    if (userId && companyId) {
      fetchContracts()
      fetchCompanyInfo()
    }
  }, [userId, companyId])

  const fetchCompanyInfo = async () => {
    try {
      const response = await companiesAPI.getById(companyId)
      if (response.data && response.data.success) {
        setCompanyInfo(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching company info:', error)
    }
  }

  const fetchContracts = async () => {
    try {
      setLoading(true)
      const response = await contractsAPI.getAll({
        company_id: companyId,
        client_id: clientId || userId
      })
      if (response.data.success) {
        const fetchedContracts = response.data.data || []
        const transformedContracts = fetchedContracts.map(contract => ({
          id: contract.id,
          contractNo: contract.contract_number || contract.contractNumber || `CNT-${String(contract.id).padStart(4, '0')}`,
          title: contract.title || contract.subject || 'Contract',
          project: contract.project_name || contract.projectName || contract.subject || 'N/A',
          project_id: contract.project_id,
          client_name: contract.client_name || user?.name || 'Client',
          status: contract.status || 'Draft',
          startDate: contract.contract_date,
          endDate: contract.valid_until,
          amount: parseFloat(contract.amount || 0),
          description: contract.description || contract.content || '',
          note: contract.note || '',
          ...contract
        }))
        setContracts(transformedContracts)
      }
    } catch (error) {
      console.error('Error fetching contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = async (contract) => {
    try {
      const response = await contractsAPI.getById(contract.id, { company_id: companyId })
      if (response.data?.success) {
        setSelectedContract({ ...contract, ...response.data.data })
      } else {
        setSelectedContract(contract)
      }
    } catch (error) {
      console.error('Error fetching contract details:', error)
      setSelectedContract(contract)
    }
    setIsViewModalOpen(true)
  }

  const handleAccept = async (id) => {
    if (window.confirm('Are you sure you want to accept this contract?')) {
      try {
        await contractsAPI.updateStatus(id, { status: 'Accepted' }, { company_id: companyId })
        alert('Contract accepted successfully!')
        fetchContracts()
        setIsViewModalOpen(false)
      } catch (error) {
        console.error('Error accepting contract:', error)
        alert('Failed to accept contract')
      }
    }
  }

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this contract?')) {
      try {
        await contractsAPI.updateStatus(id, { status: 'Rejected' }, { company_id: companyId })
        alert('Contract rejected!')
        fetchContracts()
        setIsViewModalOpen(false)
      } catch (error) {
        console.error('Error rejecting contract:', error)
        alert('Failed to reject contract')
      }
    }
  }

  const handlePrint = (contract) => {
    const printContent = generatePrintContent(contract)
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 300)
  }

  const handleDownload = (contract) => {
    const printContent = generatePrintContent(contract)
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 300)
  }

  const generatePrintContent = (contract) => {
    const company = companyInfo || getCompanyInfo() || {}
    const statusColor = contract.status === 'Accepted' || contract.status === 'Active' ? '#10b981' : 
                        contract.status === 'Rejected' || contract.status === 'Cancelled' ? '#ef4444' : 
                        contract.status === 'Expired' ? '#6b7280' : '#f59e0b'
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Contract - ${contract.contractNo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: white; color: #333; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid ${theme.primaryAccent || '#0891b2'}; padding-bottom: 20px; }
          .logo { font-size: 32px; font-weight: bold; color: ${theme.primaryAccent || '#0891b2'}; }
          .contract-info { text-align: right; }
          .contract-number { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 5px; }
          .contract-status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; color: white; background: ${statusColor}; }
          .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .party { max-width: 45%; }
          .party-label { font-size: 12px; font-weight: bold; color: #666; margin-bottom: 8px; text-transform: uppercase; }
          .party-name { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 5px; }
          .party-details { font-size: 13px; color: #666; line-height: 1.6; }
          .details-section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .detail-item { }
          .detail-label { font-size: 12px; font-weight: bold; color: #666; text-transform: uppercase; margin-bottom: 5px; }
          .detail-value { font-size: 14px; color: #333; }
          .amount-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
          .amount-label { font-size: 14px; color: #666; margin-bottom: 5px; }
          .amount-value { font-size: 32px; font-weight: bold; color: ${theme.primaryAccent || '#0891b2'}; }
          .content-section { background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
          .content-title { font-size: 14px; font-weight: bold; color: #666; margin-bottom: 10px; }
          .content-text { font-size: 14px; color: #333; line-height: 1.6; }
          .signature-section { display: flex; justify-content: space-between; margin-top: 50px; }
          .signature-box { width: 45%; }
          .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 10px; }
          .signature-label { font-size: 12px; color: #666; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          @media print {
            body { padding: 20px; }
            .contract-status { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${company.name || company.company_name || 'Company'}</div>
            <div class="contract-info">
              <div class="contract-number">CONTRACT #${contract.contractNo}</div>
              <div class="contract-status">${contract.status}</div>
            </div>
          </div>
          
          <div class="parties">
            <div class="party">
              <div class="party-label">From</div>
              <div class="party-name">${company.name || company.company_name || 'Company'}</div>
              <div class="party-details">
                ${company.address ? company.address + '<br>' : ''}
                ${company.phone ? 'Phone: ' + company.phone + '<br>' : ''}
                ${company.email ? 'Email: ' + company.email : ''}
              </div>
            </div>
            <div class="party" style="text-align: right;">
              <div class="party-label">To</div>
              <div class="party-name">${contract.client_name || 'Client'}</div>
            </div>
          </div>
          
          <div class="details-section">
            <div class="section-title">${contract.title}</div>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Project</div>
                <div class="detail-value">${contract.project}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value">${contract.status}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Start Date</div>
                <div class="detail-value">${contract.startDate ? new Date(contract.startDate).toLocaleDateString('en-GB') : 'N/A'}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">End Date</div>
                <div class="detail-value">${contract.endDate ? new Date(contract.endDate).toLocaleDateString('en-GB') : 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <div class="amount-box">
            <div class="amount-label">Contract Amount</div>
            <div class="amount-value">$${contract.amount.toLocaleString()}</div>
          </div>
          
          ${contract.description ? `
          <div class="content-section">
            <div class="content-title">Contract Details</div>
            <div class="content-text">${contract.description}</div>
          </div>
          ` : ''}
          
          ${contract.note ? `
          <div class="content-section">
            <div class="content-title">Notes</div>
            <div class="content-text">${contract.note}</div>
          </div>
          ` : ''}
          
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-label">Company Representative</div>
              </div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-label">Client</div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString('en-GB')}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Filter contracts
  const filteredContracts = contracts.filter((c) => {
    let matches = true
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      matches = matches && (
        c.contractNo?.toLowerCase().includes(query) ||
        c.title?.toLowerCase().includes(query) ||
        c.project?.toLowerCase().includes(query)
      )
    }
    
    if (statusFilter) {
      matches = matches && c.status === statusFilter
    }
    
    if (dateFilter.start) {
      matches = matches && new Date(c.startDate) >= new Date(dateFilter.start)
    }
    
    if (dateFilter.end) {
      matches = matches && new Date(c.endDate) <= new Date(dateFilter.end)
    }
    
    return matches
  })

  const getStatusBadge = (status) => {
    const statusStyles = {
      Draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
      Sent: { bg: 'bg-blue-100', text: 'text-blue-600' },
      Active: { bg: 'bg-green-100', text: 'text-green-600' },
      Accepted: { bg: 'bg-green-100', text: 'text-green-600' },
      Rejected: { bg: 'bg-red-100', text: 'text-red-600' },
      Cancelled: { bg: 'bg-red-100', text: 'text-red-600' },
      Expired: { bg: 'bg-gray-100', text: 'text-gray-600' },
      Completed: { bg: 'bg-purple-100', text: 'text-purple-600' },
    }
    const style = statusStyles[status] || statusStyles.Draft
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {status}
      </span>
    )
  }

  const columns = [
    {
      key: 'contractNo',
      label: 'Contract #',
      render: (value, row) => (
        <span 
          className="font-semibold text-primary-accent cursor-pointer hover:underline"
          onClick={() => handleView(row)}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'project',
      label: 'Project',
      render: (value) => <span className="text-sm text-secondary-text">{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => (
        <span className="font-semibold">${parseFloat(value || 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (value) => (
        <span className="text-sm text-secondary-text">
          {value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (value) => (
        <span className="text-sm text-secondary-text">
          {value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
        </span>
      ),
    },
  ]

  const actions = (row) => (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={(e) => { e.stopPropagation(); handleView(row) }}
        className="p-2 text-primary-accent hover:bg-primary-accent/10 rounded-lg transition-colors"
        title="View"
      >
        <IoEye size={18} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handlePrint(row) }}
        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        title="Print"
      >
        <IoPrint size={18} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleDownload(row) }}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Download"
      >
        <IoDownload size={18} />
      </button>
      {(row.status === 'Sent' || row.status === 'Draft') && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handleAccept(row.id) }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Accept"
          >
            <IoCheckmark size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleReject(row.id) }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Reject"
          >
            <IoClose size={18} />
          </button>
        </>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Contracts</h1>
          <p className="text-secondary-text mt-1">View and manage your contracts</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              isFilterOpen ? 'bg-primary-accent text-white border-primary-accent' : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <IoFilter size={18} />
            <span className="text-sm font-medium">Filters</span>
            {isFilterOpen ? <IoChevronUp size={16} /> : <IoChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contracts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
              >
                <option value="">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Active">Active</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('')
                setDateFilter({ start: '', end: '' })
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Contracts Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-accent border-t-transparent"></div>
          <p className="text-secondary-text mt-4">Loading contracts...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredContracts}
            searchPlaceholder="Search contracts..."
            filters={false}
            actions={actions}
            bulkActions={false}
            emptyMessage="No contracts found"
            onRowClick={handleView}
          />
        </div>
      )}

      {/* View Contract Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title=""
        size="xl"
      >
        {selectedContract && (
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: theme.primaryAccent || '#0891b2' }}>
                    CONTRACT #{selectedContract.contractNo}
                  </span>
                  {getStatusBadge(selectedContract.status)}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{selectedContract.title}</h2>
              </div>
            </div>

            {/* Company & Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">From</h3>
                <p className="font-semibold text-gray-900">{companyInfo?.name || getCompanyInfo()?.name || 'Company'}</p>
                {(companyInfo?.address || getCompanyInfo()?.address) && (
                  <p className="text-sm text-gray-600 mt-1">{companyInfo?.address || getCompanyInfo()?.address}</p>
                )}
                {(companyInfo?.email || getCompanyInfo()?.email) && (
                  <p className="text-sm text-gray-600">{companyInfo?.email || getCompanyInfo()?.email}</p>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">To</h3>
                <p className="font-semibold text-gray-900">{selectedContract.client_name || user?.name || 'Client'}</p>
              </div>
            </div>

            {/* Contract Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase font-medium">Project</p>
                <p className="font-semibold text-gray-900 mt-1">{selectedContract.project}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase font-medium">Amount</p>
                <p className="font-bold text-lg mt-1" style={{ color: theme.primaryAccent || '#0891b2' }}>
                  ${selectedContract.amount.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase font-medium">Start Date</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {selectedContract.startDate ? new Date(selectedContract.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase font-medium">End Date</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {selectedContract.endDate ? new Date(selectedContract.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Description */}
            {selectedContract.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Contract Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700 prose max-w-full overflow-hidden break-words" 
                     style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                     dangerouslySetInnerHTML={{ __html: selectedContract.description }} />
              </div>
            )}

            {/* Notes */}
            {selectedContract.note && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notes</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700">{selectedContract.note}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsPreviewModalOpen(true)}
                className="flex flex-col items-center gap-2 p-3 hover:bg-primary-accent/5 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-accent/10 flex items-center justify-center group-hover:bg-primary-accent/20" style={{ color: theme.primaryAccent || '#0891b2' }}>
                  <FaEye size={14} />
                </div>
                <span className="text-xs font-semibold text-gray-600">Preview</span>
              </button>
              <button
                onClick={() => handlePrint(selectedContract)}
                className="flex flex-col items-center gap-2 p-3 hover:bg-green-50 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100">
                  <FaPrint size={14} />
                </div>
                <span className="text-xs font-semibold text-gray-600">Print</span>
              </button>
              <button
                onClick={() => handleDownload(selectedContract)}
                className="flex flex-col items-center gap-2 p-3 hover:bg-red-50 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-100">
                  <FaRegFilePdf size={14} />
                </div>
                <span className="text-xs font-semibold text-gray-600">View PDF</span>
              </button>
              <button
                onClick={() => handleDownload(selectedContract)}
                className="flex flex-col items-center gap-2 p-3 hover:bg-blue-50 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100">
                  <FaDownload size={14} />
                </div>
                <span className="text-xs font-semibold text-gray-600">Download</span>
              </button>
            </div>

            {/* Accept/Reject Buttons */}
            {(selectedContract.status === 'Sent' || selectedContract.status === 'Draft') && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="primary"
                  onClick={() => handleAccept(selectedContract.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <IoCheckmark size={18} />
                  Accept Contract
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(selectedContract.id)}
                  className="flex-1 flex items-center justify-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                >
                  <IoClose size={18} />
                  Reject Contract
                </Button>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Contract Preview"
        size="xl"
      >
        {selectedContract && (
          <div className="p-4">
            <div dangerouslySetInnerHTML={{ __html: generatePrintContent(selectedContract) }} />
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => handleDownload(selectedContract)}>
                <IoDownload size={18} className="mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Contracts

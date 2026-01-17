import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { useSettings } from '../../../context/SettingsContext'
import DataTable from '../../../components/ui/DataTable'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { creditNotesAPI, companiesAPI, invoicesAPI } from '../../../api'
import { 
  IoEye, 
  IoDownload, 
  IoPrint,
  IoFilter,
  IoSearch,
  IoChevronDown,
  IoChevronUp,
  IoCalendar,
  IoDocumentText,
  IoReceipt
} from 'react-icons/io5'
import { FaEye, FaPrint, FaRegFilePdf, FaDownload } from 'react-icons/fa'

const CreditNotes = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const { formatDate, formatCurrency, getCompanyInfo } = useSettings()
  
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  const clientId = user?.client_id || localStorage.getItem('clientId')
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedCreditNote, setSelectedCreditNote] = useState(null)
  const [creditNotes, setCreditNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [companyInfo, setCompanyInfo] = useState(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })

  useEffect(() => {
    if (userId && companyId) {
      fetchCreditNotes()
      fetchCompanyInfo()
    }
  }, [userId, companyId])

  const fetchCompanyInfo = async () => {
    try {
      const response = await companiesAPI.getById(companyId)
      if (response.data?.success) {
        setCompanyInfo(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching company info:', error)
    }
  }

  const fetchCreditNotes = async () => {
    try {
      setLoading(true)
      const response = await creditNotesAPI.getAll({
        company_id: companyId,
        client_id: clientId || userId
      })
      if (response.data.success) {
        const creditNotesData = response.data.data || []
        const transformedCreditNotes = creditNotesData.map(cn => ({
          id: cn.id,
          creditNoteNo: cn.credit_note_number || cn.creditNoteNumber || `CN-${String(cn.id).padStart(4, '0')}`,
          invoice_id: cn.invoice_id,
          invoice: cn.invoice_number || cn.related_invoice || 'N/A',
          amount: Math.abs(parseFloat(cn.total || cn.amount || 0)),
          date: cn.created_at || cn.date,
          status: cn.status || 'Applied',
          description: cn.description || '',
          note: cn.note || '',
          items: cn.items || [],
          client_name: cn.client_name || user?.name || 'Client',
          ...cn
        }))
        setCreditNotes(transformedCreditNotes)
      }
    } catch (error) {
      console.error('Error fetching credit notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = async (creditNote) => {
    try {
      const response = await creditNotesAPI.getById(creditNote.id, { company_id: companyId })
      if (response.data?.success) {
        setSelectedCreditNote({ ...creditNote, ...response.data.data })
      } else {
        setSelectedCreditNote(creditNote)
      }
    } catch (error) {
      console.error('Error fetching credit note details:', error)
      setSelectedCreditNote(creditNote)
    }
    setIsViewModalOpen(true)
  }

  const handlePrint = (creditNote) => {
    const printContent = generatePrintContent(creditNote)
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 300)
  }

  const handleDownload = (creditNote) => {
    const printContent = generatePrintContent(creditNote)
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 300)
  }

  const generatePrintContent = (creditNote) => {
    const company = companyInfo || getCompanyInfo() || {}
    const items = creditNote.items || []
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Credit Note - ${creditNote.creditNoteNo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: white; color: #333; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid ${theme.primaryAccent || '#0891b2'}; padding-bottom: 20px; }
          .logo { font-size: 32px; font-weight: bold; color: ${theme.primaryAccent || '#0891b2'}; }
          .cn-info { text-align: right; }
          .cn-number { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 5px; }
          .cn-status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; color: white; background: ${creditNote.status === 'Applied' ? '#10b981' : '#f59e0b'}; }
          .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .party { max-width: 45%; }
          .party-label { font-size: 12px; font-weight: bold; color: #666; margin-bottom: 8px; text-transform: uppercase; }
          .party-name { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 5px; }
          .party-details { font-size: 13px; color: #666; line-height: 1.6; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th { background: ${theme.primaryAccent || '#0891b2'}; color: white; padding: 12px 15px; text-align: left; font-size: 14px; }
          .items-table th:last-child { text-align: right; }
          .items-table td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 14px; }
          .items-table td:last-child { text-align: right; }
          .totals { display: flex; justify-content: flex-end; margin-bottom: 30px; }
          .totals-box { width: 280px; }
          .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #eee; }
          .total-row.final { background: #10b981; color: white; padding: 15px; margin-top: 10px; font-weight: bold; font-size: 16px; }
          .note-section { background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
          .note-title { font-size: 14px; font-weight: bold; color: #666; margin-bottom: 10px; }
          .note-text { font-size: 14px; color: #333; line-height: 1.6; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; }
          @media print {
            body { padding: 20px; }
            .items-table th, .total-row.final { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${company.name || company.company_name || 'Company'}</div>
            <div class="cn-info">
              <div class="cn-number">CREDIT NOTE #${creditNote.creditNoteNo}</div>
              <div class="cn-status">${creditNote.status}</div>
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
              <div class="party-label">Credit To</div>
              <div class="party-name">${creditNote.client_name || 'Client'}</div>
              ${creditNote.invoice ? `<div class="party-details">Invoice: ${creditNote.invoice}</div>` : ''}
            </div>
          </div>
          
          ${items.length > 0 ? `
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.item_name || item.description || 'Item'}</td>
                    <td>${item.quantity || 1}</td>
                    <td>$${parseFloat(item.unit_price || item.rate || 0).toFixed(2)}</td>
                    <td>$${parseFloat(item.amount || item.total || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
          
          <div class="totals">
            <div class="totals-box">
              <div class="total-row final">
                <span>Credit Amount</span>
                <span>$${creditNote.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          ${creditNote.note || creditNote.description ? `
          <div class="note-section">
            <div class="note-title">Notes</div>
            <div class="note-text">${creditNote.note || creditNote.description}</div>
          </div>
          ` : ''}
          
          <div class="footer">
            <p>Date: ${creditNote.date ? new Date(creditNote.date).toLocaleDateString('en-GB') : 'N/A'}</p>
            <p style="margin-top: 5px;">Generated on ${new Date().toLocaleDateString('en-GB')}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Filter credit notes
  const filteredCreditNotes = creditNotes.filter((cn) => {
    let matches = true
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      matches = matches && (
        cn.creditNoteNo?.toLowerCase().includes(query) ||
        cn.invoice?.toLowerCase().includes(query) ||
        cn.description?.toLowerCase().includes(query)
      )
    }
    
    if (statusFilter) {
      matches = matches && cn.status === statusFilter
    }
    
    if (dateFilter.start) {
      matches = matches && new Date(cn.date) >= new Date(dateFilter.start)
    }
    
    if (dateFilter.end) {
      matches = matches && new Date(cn.date) <= new Date(dateFilter.end)
    }
    
    return matches
  })

  const getStatusBadge = (status) => {
    const statusStyles = {
      Applied: { bg: 'bg-green-100', text: 'text-green-600' },
      Pending: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      Expired: { bg: 'bg-gray-100', text: 'text-gray-600' },
      Draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
    }
    const style = statusStyles[status] || statusStyles.Pending
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {status}
      </span>
    )
  }

  const columns = [
    {
      key: 'creditNoteNo',
      label: 'Credit Note #',
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
      key: 'invoice',
      label: 'Invoice',
      render: (value) => <span className="text-sm text-secondary-text">{value}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => (
        <span className="font-semibold text-green-600">-${parseFloat(value || 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'date',
      label: 'Date',
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
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Credit Notes</h1>
          <p className="text-secondary-text mt-1">View your credit notes</p>
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
                  placeholder="Search credit notes..."
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
                <option value="Applied">Applied</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
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

      {/* Credit Notes Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-accent border-t-transparent"></div>
          <p className="text-secondary-text mt-4">Loading credit notes...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredCreditNotes}
            searchPlaceholder="Search credit notes..."
            filters={false}
            actions={actions}
            bulkActions={false}
            emptyMessage="No credit notes found"
            onRowClick={handleView}
          />
        </div>
      )}

      {/* View Credit Note Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title=""
        size="xl"
      >
        {selectedCreditNote && (
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-lg text-white text-sm font-semibold bg-green-600">
                    CREDIT NOTE #{selectedCreditNote.creditNoteNo}
                  </span>
                  {getStatusBadge(selectedCreditNote.status)}
                </div>
                <h2 className="text-xl font-bold text-gray-900">Credit Note Details</h2>
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
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Credit To</h3>
                <p className="font-semibold text-gray-900">{selectedCreditNote.client_name || user?.name || 'Client'}</p>
                {selectedCreditNote.invoice && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="text-gray-500">Invoice:</span> {selectedCreditNote.invoice}
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase font-medium">Credit Amount</p>
                <p className="font-bold text-xl text-green-600 mt-1">
                  -${selectedCreditNote.amount.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase font-medium">Date</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {selectedCreditNote.date ? new Date(selectedCreditNote.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase font-medium">Invoice</p>
                <p className="font-semibold text-gray-900 mt-1">{selectedCreditNote.invoice}</p>
              </div>
            </div>

            {/* Items Table */}
            {selectedCreditNote.items && selectedCreditNote.items.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Items</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Description</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Qty</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Rate</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCreditNote.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-900">{item.item_name || item.description || 'Item'}</td>
                          <td className="py-3 px-4 text-center text-gray-700">{item.quantity || 1}</td>
                          <td className="py-3 px-4 text-right text-gray-700">${parseFloat(item.unit_price || item.rate || 0).toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900">${parseFloat(item.amount || item.total || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes */}
            {(selectedCreditNote.note || selectedCreditNote.description) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notes</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                  {selectedCreditNote.note || selectedCreditNote.description}
                </div>
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
                onClick={() => handlePrint(selectedCreditNote)}
                className="flex flex-col items-center gap-2 p-3 hover:bg-green-50 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100">
                  <FaPrint size={14} />
                </div>
                <span className="text-xs font-semibold text-gray-600">Print</span>
              </button>
              <button
                onClick={() => handleDownload(selectedCreditNote)}
                className="flex flex-col items-center gap-2 p-3 hover:bg-red-50 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-100">
                  <FaRegFilePdf size={14} />
                </div>
                <span className="text-xs font-semibold text-gray-600">View PDF</span>
              </button>
              <button
                onClick={() => handleDownload(selectedCreditNote)}
                className="flex flex-col items-center gap-2 p-3 hover:bg-blue-50 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100">
                  <FaDownload size={14} />
                </div>
                <span className="text-xs font-semibold text-gray-600">Download</span>
              </button>
            </div>

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
        title="Credit Note Preview"
        size="xl"
      >
        {selectedCreditNote && (
          <div className="p-4">
            <div dangerouslySetInnerHTML={{ __html: generatePrintContent(selectedCreditNote) }} />
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => handleDownload(selectedCreditNote)}>
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

export default CreditNotes

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import DataTable from '../../../components/ui/DataTable'
import { invoicesAPI } from '../../../api'
import { 
  IoDownload, 
  IoEye, 
  IoFilter, 
  IoSearch, 
  IoChevronDown, 
  IoChevronUp
} from 'react-icons/io5'

const Invoices = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useTheme()
  
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = parseInt(user?.company_id || localStorage.getItem('companyId') || 1, 10)
  const clientId = user?.client_id || localStorage.getItem('clientId')
  
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    if (companyId) {
      fetchInvoices()
    }
  }, [companyId, userId, clientId])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await invoicesAPI.getAll({
        company_id: companyId,
        client_id: clientId || userId
      })
      if (response.data && response.data.success) {
        const fetchedInvoices = response.data.data || []
        const transformedInvoices = fetchedInvoices.map(inv => {
          const dueDate = inv.due_date || inv.dueDate || inv.bill_date || inv.created_at
          const dueDateObj = dueDate ? new Date(dueDate) : new Date()
          const today = new Date()
          const daysOverdue = Math.max(0, Math.floor((today - dueDateObj) / (1000 * 60 * 60 * 24)))
          let status = inv.status || 'Unpaid'
          
          if (inv.status === 'Fully Paid' || inv.status === 'Paid') {
            status = 'Fully Paid'
          } else if (inv.status === 'Partially Paid') {
            status = 'Partially Paid'
          } else if (inv.status === 'Credited') {
            status = 'Credited'
          } else if (status === 'Unpaid' && daysOverdue > 0) {
            status = 'Overdue'
          }
          
          return {
            id: inv.id,
            invoiceNo: inv.invoice_number || inv.invoiceNumber || `INV#${String(inv.id).padStart(3, '0')}`,
            amount: parseFloat(inv.total || inv.amount || 0),
            dueDate: dueDateObj.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }),
            status: status,
            ...inv
          }
        })
        setInvoices(transformedInvoices)
      } else {
        setInvoices([])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (invoice) => {
    navigate(`/app/client/invoices/${invoice.id}`)
  }

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    let matches = true
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      matches = matches && (
        inv.invoiceNo?.toLowerCase().includes(query) ||
        inv.client_name?.toLowerCase().includes(query)
      )
    }
    
    if (statusFilter) {
      matches = matches && inv.status === statusFilter
    }
    
    return matches
  })

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Fully Paid': { bg: 'bg-green-100', text: 'text-green-700' },
      'Paid': { bg: 'bg-green-100', text: 'text-green-700' },
      'Unpaid': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      'Overdue': { bg: 'bg-red-100', text: 'text-red-700' },
      'Partially Paid': { bg: 'bg-blue-100', text: 'text-blue-700' },
      'Credited': { bg: 'bg-amber-100', text: 'text-amber-700' },
      'Draft': { bg: 'bg-gray-100', text: 'text-gray-700' },
    }
    const style = statusStyles[status] || statusStyles.Unpaid
    return (
      <span className={`px-2.5 py-1 rounded text-xs font-medium ${style.bg} ${style.text}`}>
        {status}
      </span>
    )
  }

  const columns = [
    {
      key: 'invoiceNo',
      label: 'Invoice No',
      render: (value, row) => (
        <span 
          className="font-semibold cursor-pointer hover:underline"
          style={{ color: theme.primaryAccent || '#0891b2' }}
          onClick={() => handleView(row)}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => <span className="font-semibold">${parseFloat(value || 0).toLocaleString()}</span>,
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (value) => <span className="text-sm text-secondary-text">{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value),
    },
  ]

  const actions = (row) => (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={(e) => { e.stopPropagation(); handleView(row); }}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        style={{ color: theme.primaryAccent || '#0891b2' }}
        title="View"
      >
        <IoEye size={18} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleView(row); }}
        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Invoices</h1>
          <p className="text-secondary-text mt-1">View and download your invoices</p>
        </div>
        
        {/* Filter Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              isFilterOpen ? 'text-white border-transparent' : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
            style={isFilterOpen ? { backgroundColor: theme.primaryAccent || '#0891b2' } : {}}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search invoices..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': theme.primaryAccent || '#0891b2' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Fully Paid">Fully Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Credited">Credited</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      {loading ? (
        <div className="text-center py-12">
          <div 
            className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent"
            style={{ borderColor: `${theme.primaryAccent || '#0891b2'} transparent ${theme.primaryAccent || '#0891b2'} ${theme.primaryAccent || '#0891b2'}` }}
          ></div>
          <p className="text-secondary-text mt-4">Loading invoices...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredInvoices}
            searchPlaceholder="Search invoices..."
            filters={false}
            actions={actions}
            bulkActions={false}
            emptyMessage="No invoices found"
            onRowClick={handleView}
          />
        </div>
      )}
    </div>
  )
}

export default Invoices

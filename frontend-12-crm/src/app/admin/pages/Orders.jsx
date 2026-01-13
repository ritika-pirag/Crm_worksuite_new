import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { ordersAPI, clientsAPI, invoicesAPI, itemsAPI } from '../../../api'
import Modal from '../../../components/ui/Modal'
import { 
  IoAdd,
  IoSearch,
  IoFilter,
  IoDownload,
  IoChevronDown,
  IoChevronUp,
  IoEllipsisVertical,
  IoCheckmarkCircle,
  IoTrash,
  IoCreate,
  IoEye,
  IoDocumentText,
  IoClose,
  IoCalendar,
  IoGrid,
  IoList,
  IoPrint,
  IoCopy,
  IoCart,
  IoStorefront,
  IoCheckmark,
  IoRefresh
} from 'react-icons/io5'

const Orders = () => {
  const navigate = useNavigate()
  const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
  
  const [viewMode, setViewMode] = useState('list')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [clientFilter, setClientFilter] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [amountMinFilter, setAmountMinFilter] = useState('')
  const [amountMaxFilter, setAmountMaxFilter] = useState('')
  const [quickFilter, setQuickFilter] = useState('All') // All, New
  const [sortColumn, setSortColumn] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('DESC')
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [items, setItems] = useState([])
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [itemSearchQuery, setItemSearchQuery] = useState('')
  const [itemCategoryFilter, setItemCategoryFilter] = useState('')

  const [formData, setFormData] = useState({
    company_id: companyId,
    client_id: '',
    invoice_id: '',
    title: '',
    description: '',
    amount: 0,
    status: 'New',
    items: [],
  })

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch functions
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = { company_id: companyId }
      
      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery
      }
      
      if (statusFilter && statusFilter !== 'All') {
        params.status = statusFilter
      }
      
      if (clientFilter) {
        params.client_id = clientFilter
      }

      const response = await ordersAPI.getAll(params)
      
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
      setLoading(false)
    }
  }, [companyId, debouncedSearchQuery, statusFilter, clientFilter])

  const fetchClients = useCallback(async () => {
    try {
      const response = await clientsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setClients(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }, [companyId])

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await invoicesAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setInvoices(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }, [companyId])

  const fetchItems = useCallback(async () => {
    try {
      const params = { company_id: companyId }
      if (itemCategoryFilter) {
        params.category = itemCategoryFilter
      }
      const response = await itemsAPI.getAll(params)
      if (response.data.success) {
        setItems(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }, [companyId, itemCategoryFilter])

  useEffect(() => {
    fetchOrders()
    fetchClients()
    fetchInvoices()
    fetchItems()
  }, [fetchOrders, fetchClients, fetchInvoices, fetchItems])

  // Filter orders based on quick filter
  useEffect(() => {
    if (quickFilter === 'New') {
      setStatusFilter('New')
    } else if (quickFilter === 'All') {
      setStatusFilter('All')
    }
  }, [quickFilter])

  const handleAdd = () => {
    setFormData({
      company_id: companyId,
      client_id: '',
      invoice_id: '',
      title: '',
      description: '',
      amount: 0,
      status: 'New',
      items: [],
    })
    setIsAddModalOpen(true)
  }

  const handleEdit = async (order) => {
    try {
      const response = await ordersAPI.getById(order.id, { company_id: companyId })
      if (response.data.success) {
        const data = response.data.data
        setFormData({
          company_id: data.company_id || companyId,
          client_id: data.client_id?.toString() || '',
          invoice_id: data.invoice_id?.toString() || '',
          title: data.title || '',
          description: data.description || '',
          amount: parseFloat(data.amount) || 0,
          status: data.status || 'New',
          items: data.items || [],
        })
        setIsEditModalOpen(true)
        setSelectedOrder(order)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      alert('Failed to load order details')
    }
  }

  const handleView = (order) => {
    navigate(`/app/admin/orders/${order.id}`)
  }

  const handleDelete = async (order) => {
    if (window.confirm(`Are you sure you want to delete order #${order.id}?`)) {
      try {
        const response = await ordersAPI.delete(order.id, { company_id: companyId })
        if (response.data.success) {
          alert('Order deleted successfully!')
          await fetchOrders()
        } else {
          alert(response.data.error || 'Failed to delete order')
        }
      } catch (error) {
        console.error('Error deleting order:', error)
        alert(error.response?.data?.error || 'Failed to delete order')
      }
    }
  }

  const handleDuplicate = async (order) => {
    try {
      const orderData = {
        company_id: companyId,
        client_id: order.client_id,
        invoice_id: order.invoice_id,
        title: `${order.title} (Copy)`,
        description: order.description,
        amount: order.amount,
        status: 'New',
        items: order.items || [],
      }
      const response = await ordersAPI.create(orderData)
      if (response.data.success) {
        alert('Order duplicated successfully!')
        await fetchOrders()
      } else {
        alert(response.data.error || 'Failed to duplicate order')
      }
    } catch (error) {
      console.error('Error duplicating order:', error)
      alert(error.response?.data?.error || 'Failed to duplicate order')
    }
  }

  const handleStatusChange = async (order, newStatus) => {
    try {
      const response = await ordersAPI.updateStatus(order.id, newStatus, { company_id: companyId })
      if (response.data.success) {
        alert(`Order status updated to ${newStatus}!`)
        await fetchOrders()
      } else {
        alert(response.data.error || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert(error.response?.data?.error || 'Failed to update order status')
    }
  }

  const handleSave = async () => {
    try {
      // Calculate total from items if amount not provided
      let finalAmount = parseFloat(formData.amount) || 0
      if (formData.items && formData.items.length > 0) {
        finalAmount = formData.items.reduce((sum, item) => {
          return sum + (parseFloat(item.amount || 0))
        }, 0)
      }

      const orderData = {
        company_id: companyId,
        client_id: formData.client_id || null,
        invoice_id: formData.invoice_id || null,
        title: formData.title || `Order - ${new Date().toLocaleDateString()}`,
        description: formData.description || '',
        amount: finalAmount,
        status: formData.status || 'New',
        items: formData.items || [],
      }

      let response
      if (isEditModalOpen && selectedOrder) {
        response = await ordersAPI.update(selectedOrder.id, orderData, { company_id: companyId })
      } else {
        response = await ordersAPI.create(orderData)
      }

      if (response.data.success) {
        alert(isEditModalOpen ? 'Order updated successfully!' : 'Order created successfully!')
        setIsAddModalOpen(false)
        setIsEditModalOpen(false)
        setFormData({
          company_id: companyId,
          client_id: '',
          invoice_id: '',
          title: '',
          description: '',
          amount: 0,
          status: 'New',
          items: [],
        })
        await fetchOrders()
      } else {
        alert(response.data.error || 'Failed to save order')
      }
    } catch (error) {
      console.error('Error saving order:', error)
      alert(error.response?.data?.error || 'Failed to save order')
    }
  }

  const handleAddItemFromModal = (selectedItems) => {
    const newItems = selectedItems.map(item => ({
      item_id: item.id,
      item_name: item.title,
      description: item.description || '',
      quantity: 1,
      unit: item.unit_type || 'PC',
      unit_price: parseFloat(item.rate || 0),
      amount: parseFloat(item.rate || 0),
    }))
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, ...newItems]
    }))
    setIsAddItemModalOpen(false)
  }

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items]
      newItems[index] = {
        ...newItems[index],
        [field]: value
      }
      // Recalculate amount
      if (field === 'quantity' || field === 'unit_price') {
        const quantity = parseFloat(field === 'quantity' ? value : newItems[index].quantity) || 1
        const unitPrice = parseFloat(field === 'unit_price' ? value : newItems[index].unit_price) || 0
        newItems[index].amount = quantity * unitPrice
      }
      return {
        ...prev,
        items: newItems
      }
    })
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (parseFloat(item.amount || 0)), 0)
  }

  const getStatusBadge = (status) => {
    const variants = {
      'New': 'warning',
      'Pending': 'warning',
      'Processing': 'info',
      'Completed': 'success',
      'Confirmed': 'success',
      'Cancelled': 'danger',
      'Shipped': 'info',
      'Delivered': 'success'
    }
    return <Badge variant={variants[status] || 'default'}>{status || 'New'}</Badge>
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortColumn(column)
      setSortDirection('ASC')
    }
  }

  const handleDownloadExcel = () => {
    try {
      // Create CSV content
      const headers = ['Order ID', 'Title', 'Client', 'Invoice', 'Order Date', 'Amount', 'Status']
      const rows = filteredOrders.map(order => [
        order.id,
        order.title || `Order #${order.id}`,
        order.client_name || '-',
        order.invoice_number || '-',
        formatDate(order.order_date),
        order.amount || 0,
        order.status || 'New'
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading Excel:', error)
      alert('Failed to download orders')
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow popups to print')
      return
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orders Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .text-right { text-align: right; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Orders Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Title</th>
              <th>Client</th>
              <th>Invoice</th>
              <th>Order Date</th>
              <th class="text-right">Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredOrders.map(order => `
              <tr>
                <td>ORDER #${order.id}</td>
                <td>${(order.title || `Order #${order.id}`).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                <td>${(order.client_name || '-').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                <td>${order.invoice_number ? `INV #${order.invoice_number}` : '-'}</td>
                <td>${formatDate(order.order_date)}</td>
                <td class="text-right">${formatCurrency(order.amount)}</td>
                <td>${(order.status || 'New').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" style="text-align: right; font-weight: bold;">Total:</td>
              <td class="text-right" style="font-weight: bold;">${formatCurrency(filteredOrders.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0))}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
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

  // Filter orders client-side for additional filters and search
  const filteredOrders = orders.filter(order => {
    // Search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      const matchesSearch = 
        order.id?.toString().includes(query) ||
        order.title?.toLowerCase().includes(query) ||
        order.client_name?.toLowerCase().includes(query) ||
        order.invoice_number?.toString().includes(query) ||
        order.description?.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }
    
    // Date filters
    if (startDateFilter && order.order_date) {
      const orderDate = new Date(order.order_date)
      const startDate = new Date(startDateFilter)
      if (orderDate < startDate) return false
    }
    if (endDateFilter && order.order_date) {
      const orderDate = new Date(order.order_date)
      const endDate = new Date(endDateFilter)
      endDate.setHours(23, 59, 59, 999)
      if (orderDate > endDate) return false
    }
    
    // Amount filters
    if (amountMinFilter) {
      const minAmount = parseFloat(amountMinFilter)
      if (order.amount < minAmount) return false
    }
    if (amountMaxFilter) {
      const maxAmount = parseFloat(amountMaxFilter)
      if (order.amount > maxAmount) return false
    }
    
    return true
  })

  const columns = [
    { 
      key: 'id', 
      label: 'Order',
      render: (value, row) => (
        <span className="text-primary-accent font-medium cursor-pointer hover:underline" onClick={() => handleView(row)}>
          ORDER #{row.id}
        </span>
      )
    },
    { 
      key: 'client_name', 
      label: 'Client',
      render: (value) => value || '-'
    },
    { 
      key: 'invoice_number', 
      label: 'Invoices',
      render: (value) => value ? (
        <span className="text-primary-accent">INV #{value}</span>
      ) : '-'
    },
    { 
      key: 'order_date', 
      label: 'Order date',
      render: (value) => formatDate(value)
    },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (value) => formatCurrency(value)
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => getStatusBadge(value)
    },
  ]

  const actions = (row) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDuplicate(row)
        }}
        className="p-2 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded transition-colors"
        title="Duplicate"
      >
        <IoCopy size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEdit(row)
        }}
        className="p-2 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded transition-colors"
        title="Edit"
      >
        <IoCreate size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDelete(row)
        }}
        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
        title="Delete"
      >
        <IoTrash size={18} />
      </button>
    </div>
  )

  // Get unique categories for items
  const categories = [...new Set(items.map(item => item.category).filter(Boolean))]

  // Filter items for modal
  const filteredItems = items.filter(item => {
    const matchesSearch = !itemSearchQuery || 
      item.title?.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(itemSearchQuery.toLowerCase())
    const matchesCategory = !itemCategoryFilter || item.category === itemCategoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Orders</h1>
          <p className="text-secondary-text mt-1">Manage all orders</p>
        </div>
        <Button 
          onClick={handleAdd}
          className="flex items-center gap-2"
        >
          <IoAdd size={20} />
          Add order
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title={viewMode === 'list' ? 'Grid View' : 'List View'}
          >
            {viewMode === 'list' ? <IoGrid size={20} /> : <IoList size={20} />}
          </button>
          
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <IoFilter size={18} />
            Filters
            {isFiltersOpen ? <IoChevronUp size={16} /> : <IoChevronDown size={16} />}
          </button>

          <div className="flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setQuickFilter('All')}
              className={`px-4 py-2 transition-colors ${
                quickFilter === 'All' ? 'bg-primary-accent text-white' : 'hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setQuickFilter('New')}
              className={`px-4 py-2 transition-colors ${
                quickFilter === 'New' ? 'bg-primary-accent text-white' : 'hover:bg-gray-50'
              }`}
            >
              New
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownloadExcel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Download Excel"
          >
            <IoDownload size={18} />
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Print"
          >
            <IoPrint size={18} />
          </button>
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {isFiltersOpen && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-1">Client</label>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent"
              >
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.company_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-1">Start Date</label>
              <Input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-1">End Date</label>
              <Input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-1">Amount Range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={amountMinFilter}
                  onChange={(e) => setAmountMinFilter(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={amountMaxFilter}
                  onChange={(e) => setAmountMaxFilter(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <IoCart size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-primary-text mb-2">No Orders Found</h3>
          <p className="text-secondary-text mb-4">Create your first order to get started.</p>
          <Button onClick={handleAdd} className="inline-flex items-center gap-2">
            <IoAdd size={20} />
            Create Order
          </Button>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={filteredOrders}
          searchPlaceholder="Search orders..."
          filters={false}
          actions={actions}
          bulkActions={false}
          emptyMessage="No orders found"
        />
      )}

      {/* Add/Edit Order Modal */}
      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedOrder(null)
        }}
        title={isEditModalOpen ? 'Edit Order' : 'Add Order'}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary-text mb-1">Client *</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent"
            >
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.company_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-1">Invoice (Optional)</label>
            <select
              value={formData.invoice_id}
              onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent"
            >
              <option value="">Select Invoice</option>
              {invoices.map(invoice => (
                <option key={invoice.id} value={invoice.id}>{invoice.invoice_number || `Invoice #${invoice.id}`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-1">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Order title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent"
              rows={3}
              placeholder="Order description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent"
            >
              <option value="New">New</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-primary-text">Items</label>
              <Button
                onClick={() => setIsAddItemModalOpen(true)}
                className="flex items-center gap-2"
                size="sm"
              >
                <IoAdd size={16} />
                Add Item
              </Button>
            </div>
            {formData.items.length === 0 ? (
              <p className="text-secondary-text text-sm">No items added</p>
            ) : (
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{item.item_name || `Item ${index + 1}`}</span>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <IoTrash size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-secondary-text">Quantity</label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-secondary-text">Unit Price</label>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-sm font-medium">Amount: {formatCurrency(item.amount || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-primary-text">Total Amount:</span>
              <span className="text-lg font-bold text-primary-text">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleSave}
              className="flex-1"
            >
              {isEditModalOpen ? 'Update Order' : 'Create Order'}
            </Button>
            <Button
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                setSelectedOrder(null)
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      </RightSideModal>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add Items"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search items..."
              value={itemSearchQuery}
              onChange={(e) => setItemSearchQuery(e.target.value)}
              className="flex-1"
            />
            <select
              value={itemCategoryFilter}
              onChange={(e) => setItemCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <p className="text-center text-secondary-text py-8">No items found</p>
            ) : (
              <div className="space-y-2">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAddItemFromModal([item])}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-secondary-text">{item.description}</p>
                        <p className="text-sm font-medium text-primary-accent mt-1">
                          {formatCurrency(item.rate)} / {item.unit_type}
                        </p>
                      </div>
                      <IoAdd size={20} className="text-primary-accent" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => setIsAddItemModalOpen(false)}
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Order Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedOrder(null)
        }}
        title={selectedOrder ? `Order #${selectedOrder.id}` : 'Order Details'}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-text">Client</label>
                <p className="text-primary-text">{selectedOrder.client_name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Status</label>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Order Date</label>
                <p className="text-primary-text">{formatDate(selectedOrder.order_date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Amount</label>
                <p className="text-primary-text font-bold">{formatCurrency(selectedOrder.amount)}</p>
              </div>
            </div>
            {selectedOrder.description && (
              <div>
                <label className="text-sm font-medium text-secondary-text">Description</label>
                <p className="text-primary-text">{selectedOrder.description}</p>
              </div>
            )}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div>
                <label className="text-sm font-medium text-secondary-text mb-2 block">Items</label>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.item_name}</span>
                        <span>{formatCurrency(item.amount)}</span>
                      </div>
                      <p className="text-sm text-secondary-text">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => {
                  handleEdit(selectedOrder)
                  setIsViewModalOpen(false)
                }}
                className="flex-1"
              >
                Edit Order
              </Button>
              <Button
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedOrder(null)
                }}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Orders


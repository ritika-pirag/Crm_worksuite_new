import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../../components/ui/DataTable'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import RightSideModal from '../../../components/ui/RightSideModal'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import { ordersAPI, invoicesAPI, itemsAPI, companiesAPI } from '../../../api'
import { IoCart, IoEye, IoAdd, IoReceipt, IoDocumentText, IoCheckmark, IoTrash, IoClose, IoSearch, IoStorefront, IoDownload } from 'react-icons/io5'

const Orders = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const companyId = parseInt(user?.company_id || localStorage.getItem('companyId') || 1, 10)
  const userId = user?.id || localStorage.getItem('userId')
  const clientId = user?.client_id || localStorage.getItem('clientId')
  
  const [orders, setOrders] = useState([])
  const [invoices, setInvoices] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [itemSearchQuery, setItemSearchQuery] = useState('')
  const [itemCategoryFilter, setItemCategoryFilter] = useState('')
  const [companyInfo, setCompanyInfo] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    invoice_id: '',
    items: [],
  })

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (companyId) {
      fetchOrders()
      fetchInvoices()
      fetchCompanyInfo()
      fetchItems()
    }
  }, [companyId, debouncedSearchQuery])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = { 
        company_id: companyId,
        client_id: clientId || userId
      }
      
      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery
      }
      
      const response = await ordersAPI.getAll(params)
      if (response.data && response.data.success) {
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
  }, [companyId, clientId, userId, debouncedSearchQuery])

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await invoicesAPI.getAll({
        company_id: companyId,
        client_id: clientId || userId
      })
      if (response.data && response.data.success) {
        setInvoices(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }, [companyId, clientId, userId])

  const fetchItems = useCallback(async () => {
    try {
      const params = { company_id: companyId }
      if (itemCategoryFilter) {
        params.category = itemCategoryFilter
      }
      const response = await itemsAPI.getAll(params)
      if (response.data && response.data.success) {
        setItems(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }, [companyId, itemCategoryFilter])

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

  const handleSave = async () => {
    if (!formData.title) {
      alert('Title is required')
      return
    }

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
        client_id: clientId || userId,
        invoice_id: formData.invoice_id || null,
        title: formData.title,
        description: formData.description || '',
        amount: finalAmount,
        status: 'New',
        items: formData.items || [],
      }
      
      const response = await ordersAPI.create(orderData)
      if (response.data && response.data.success) {
        alert('Order created successfully!')
        setIsAddModalOpen(false)
        setFormData({ title: '', description: '', amount: '', invoice_id: '', items: [] })
        await fetchOrders()
      } else {
        alert(response.data?.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert(error.response?.data?.error || error.response?.data?.details || 'Failed to create order')
    }
  }

  const handleView = (order) => {
    setSelectedOrder(order)
    setIsViewModalOpen(true)
  }

  const handleCreateInvoice = async () => {
    if (!selectedOrder) return
    
    try {
      const companyIdNum = parseInt(companyId || 1, 10)
      const validClientId = selectedOrder.client_id || clientId || userId
      
      // Ensure items array is not empty - if no items, create a default item from order amount
      const invoiceItems = (selectedOrder.items || []).length > 0
        ? (selectedOrder.items || []).map(item => ({
            item_name: item.item_name || item.name || 'Order Item',
            description: item.description || '',
            quantity: parseFloat(item.quantity || 1),
            unit_price: parseFloat(item.unit_price || 0),
            amount: parseFloat(item.amount || 0)
          }))
        : [{
            item_name: selectedOrder.title || 'Order Item',
            description: selectedOrder.description || '',
            quantity: 1,
            unit_price: parseFloat(selectedOrder.amount || 0),
            amount: parseFloat(selectedOrder.amount || 0)
          }]
      
      const invoiceData = {
        company_id: companyIdNum,
        client_id: validClientId ? parseInt(validClientId, 10) : null,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: 'USD',
        items: invoiceItems,
        status: 'Unpaid'
      }
      
      console.log('Creating invoice with data:', invoiceData)
      const response = await invoicesAPI.create(invoiceData)
      if (response.data && response.data.success) {
        // Link invoice to order
        await ordersAPI.update(selectedOrder.id, {
          invoice_id: response.data.data.id
        }, { company_id: companyId })
        
        alert('Invoice created successfully!')
        setIsCreateInvoiceModalOpen(false)
        await fetchOrders()
        if (isViewModalOpen) {
          // Refresh order data
          const updatedOrder = { ...selectedOrder, invoice_id: response.data.data.id }
          setSelectedOrder(updatedOrder)
        }
      } else {
        alert(response.data?.error || 'Failed to create invoice')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      console.error('Error response:', error.response?.data)
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.response?.data?.sqlMessage || 'Failed to create invoice'
      alert(`Error: ${errorMessage}`)
    }
  }

  const handleAddItemFromModal = (selectedItems) => {
    const newItems = selectedItems.map(item => ({
      item_id: item.id,
      item_name: item.item_name || item.title || item.name,
      description: item.description || '',
      quantity: 1,
      unit: item.unit || item.unit_type || 'PC',
      unit_price: parseFloat(item.unit_price || item.rate || item.price || 0),
      amount: parseFloat(item.unit_price || item.rate || item.price || 0),
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

  const getStatusBadge = (status) => {
    const variants = {
      'new': 'warning',
      'pending': 'warning',
      'processing': 'info',
      'completed': 'success',
      'cancelled': 'danger',
      'shipped': 'info',
      'delivered': 'success'
    }
    return <Badge variant={variants[status?.toLowerCase()] || 'default'}>{status || 'New'}</Badge>
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-GB', {
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

  // Download Order as PDF
  const handleDownloadOrder = async (order) => {
    const orderNumber = `ORDER #${order.id}`
    const title = order.title || 'Order'
    const orderDate = order.order_date ? new Date(order.order_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : formatDate(order.created_at)
    const amount = parseFloat(order.amount || 0).toFixed(2)
    const status = order.status || 'New'
    const description = order.description || ''
    const invoiceNumber = order.invoice_number || null
    
    // Get order items
    let orderItems = order.items || []
    if (orderItems.length === 0) {
      try {
        const response = await ordersAPI.getById(order.id, { company_id: companyId })
        if (response.data && response.data.success) {
          orderItems = response.data.data.items || []
        }
      } catch (error) {
        console.error('Error fetching order items:', error)
      }
    }
    
    // Company info
    const companyName = companyInfo?.name || companyInfo?.company_name || 'Company'
    const companyAddress = companyInfo?.address || ''
    const companyPhone = companyInfo?.phone || ''
    const companyEmail = companyInfo?.email || ''
    
    // Client info
    const clientName = order.client_name || user?.name || 'Client'
    
    // Status color
    const statusColor = status === 'Completed' || status === 'Delivered' ? '#10b981' : 
                        status === 'Cancelled' ? '#ef4444' : '#f59e0b'
    
    const orderHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${orderNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: white; color: #333; }
          .order-container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #0891b2; padding-bottom: 20px; }
          .logo { font-size: 36px; font-weight: bold; color: #0891b2; }
          .order-info { text-align: right; }
          .order-number { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 5px; }
          .order-status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; color: white; background: ${statusColor}; }
          .order-date { font-size: 14px; color: #666; margin-top: 10px; }
          .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .party { max-width: 45%; }
          .party-label { font-size: 12px; font-weight: bold; color: #666; margin-bottom: 8px; text-transform: uppercase; }
          .party-name { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 5px; }
          .party-details { font-size: 13px; color: #666; line-height: 1.6; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th { background: #0891b2; color: white; padding: 12px 15px; text-align: left; font-size: 14px; }
          .items-table th:nth-child(2) { text-align: center; }
          .items-table th:nth-child(3), .items-table th:nth-child(4) { text-align: right; }
          .items-table td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 14px; }
          .items-table td:nth-child(2) { text-align: center; }
          .items-table td:nth-child(3), .items-table td:nth-child(4) { text-align: right; }
          .totals { display: flex; justify-content: flex-end; margin-bottom: 30px; }
          .totals-box { width: 280px; }
          .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #eee; }
          .total-row.total { background: #1f2937; color: white; padding: 15px; margin-top: 10px; font-weight: bold; font-size: 16px; border: none; }
          .description-section { background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
          .description-title { font-size: 14px; font-weight: bold; color: #666; margin-bottom: 10px; }
          .description-content { font-size: 14px; color: #333; line-height: 1.6; }
          .invoice-link { margin-bottom: 30px; padding: 15px; background: #e0f2fe; border-radius: 8px; }
          .invoice-link-label { font-size: 12px; color: #0369a1; margin-bottom: 5px; }
          .invoice-link-value { font-size: 16px; font-weight: bold; color: #0891b2; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          @media print {
            body { padding: 20px; }
            .order-status { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .items-table th { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .total-row.total { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="order-container">
          <div class="header">
            <div class="logo">⬡ RISE</div>
            <div class="order-info">
              <div class="order-number">${orderNumber}</div>
              <div class="order-status">${status}</div>
              <div class="order-date">Order Date: ${orderDate}</div>
            </div>
          </div>
          
          <div class="parties">
            <div class="party">
              <div class="party-label">From</div>
              <div class="party-name">${companyName}</div>
              <div class="party-details">
                ${companyAddress ? companyAddress + '<br>' : ''}
                ${companyPhone ? 'Phone: ' + companyPhone + '<br>' : ''}
                ${companyEmail ? 'Email: ' + companyEmail : ''}
              </div>
            </div>
            <div class="party" style="text-align: right;">
              <div class="party-label">Client</div>
              <div class="party-name">${clientName}</div>
            </div>
          </div>
          
          ${invoiceNumber ? `
          <div class="invoice-link">
            <div class="invoice-link-label">Linked Invoice</div>
            <div class="invoice-link-value">INV #${invoiceNumber}</div>
          </div>
          ` : ''}
          
          <div class="section-title" style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">${title}</div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems.length > 0 ? orderItems.map(item => `
                <tr>
                  <td>${item.item_name || item.name || 'Item'}</td>
                  <td>${item.quantity || 1} ${item.unit || 'PC'}</td>
                  <td>$${parseFloat(item.unit_price || item.rate || 0).toFixed(2)}</td>
                  <td>$${parseFloat(item.amount || item.total || 0).toFixed(2)}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td>${title}</td>
                  <td>1</td>
                  <td>$${amount}</td>
                  <td>$${amount}</td>
                </tr>
              `}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-box">
              <div class="total-row total">
                <span>Total Amount</span>
                <span>$${amount}</span>
              </div>
            </div>
          </div>
          
          ${description ? `
          <div class="description-section">
            <div class="description-title">Description / Notes</div>
            <div class="description-content">${description}</div>
          </div>
          ` : ''}
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(orderHTML)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
    }, 300)
  }

  // Calculate total
  const totalAmount = orders.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0)

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      const matchesSearch = 
        order.id?.toString().includes(query) ||
        order.title?.toLowerCase().includes(query) ||
        order.invoice_number?.toString().includes(query) ||
        order.description?.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }
    return true
  })

  const columns = [
    { 
      key: 'id', 
      label: 'Order',
      render: (value, row) => (
        <span 
          className="text-primary-accent font-medium cursor-pointer hover:underline" 
          onClick={() => handleView(row)}
        >
          ORDER #{row.id}
        </span>
      )
    },
    { 
      key: 'title', 
      label: 'Title',
      render: (value) => value || '-'
    },
    { 
      key: 'invoice_number', 
      label: 'Invoice',
      render: (value, row) => value ? (
        <span 
          className="text-primary-accent cursor-pointer hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/app/client/invoices?invoice=${row.invoice_id}`)
          }}
        >
          INV #{value}
        </span>
      ) : (
        <span className="text-secondary-text">-</span>
      )
    },
    { 
      key: 'order_date', 
      label: 'Order Date',
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
          handleView(row)
        }}
        className="p-2 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded transition-colors"
        title="View Details"
      >
        <IoEye size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDownloadOrder(row)
        }}
        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
        title="Download PDF"
      >
        <IoDownload size={18} />
      </button>
      {!row.invoice_id && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setSelectedOrder(row)
            setIsCreateInvoiceModalOpen(true)
          }}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Generate Invoice"
        >
          <IoReceipt size={18} />
        </button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Orders</h1>
          <p className="text-secondary-text mt-1">View and manage your orders</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <IoAdd size={20} />
          Add order
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center">
          <IoCart size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-primary-text mb-2">No Orders Found</h3>
          <p className="text-secondary-text mb-4">You haven't placed any orders yet.</p>
          <Button onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center gap-2">
            <IoAdd size={20} />
            Create Your First Order
          </Button>
        </Card>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={filteredOrders}
            searchPlaceholder="Search orders..."
            filters={false}
            actions={actions}
            bulkActions={false}
            emptyMessage="No orders found"
          />
          
          {/* Total Row */}
          <div className="flex justify-end">
            <div className="bg-gray-50 px-6 py-3 rounded-lg">
              <span className="text-secondary-text mr-4">Total:</span>
              <span className="text-xl font-bold text-primary-text">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </>
      )}

      {/* Add Order Modal */}
      <RightSideModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setFormData({ title: '', description: '', amount: '', invoice_id: '', items: [] })
        }}
        title="Add Order"
        width="600px"
      >
        <div className="space-y-4">
          <Input
            label="Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Order title"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Order description"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-primary-text">Items</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddItemModalOpen(true)}
                className="flex items-center gap-1"
              >
                <IoAdd size={16} />
                Add Item
              </Button>
            </div>
            
            {formData.items && formData.items.length > 0 ? (
              <div className="space-y-2 border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.item_name}</p>
                      <p className="text-xs text-secondary-text">
                        {item.quantity} x {formatCurrency(item.unit_price)} = {formatCurrency(item.amount)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <IoTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 text-center text-secondary-text text-sm">
                No items added. Click "Add Item" to add items.
              </div>
            )}
            
            {formData.items && formData.items.length > 0 && (
              <div className="mt-2 text-right">
                <span className="text-sm text-secondary-text">Total: </span>
                <span className="font-bold text-primary-text">
                  {formatCurrency(formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0))}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Link to Invoice (Optional)</label>
            <select
              value={formData.invoice_id}
              onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="">-- Select Invoice --</option>
              {invoices.map(inv => (
                <option key={inv.id} value={inv.id}>
                  INV #{inv.id} - {formatCurrency(inv.total || inv.amount)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setFormData({ title: '', description: '', amount: '', invoice_id: '', items: [] })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
            >
              Create Order
            </Button>
          </div>
        </div>
      </RightSideModal>

      {/* View Order Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedOrder(null)
        }}
        title={`Order #${selectedOrder?.id}`}
        width="700px"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-text">Title</label>
                <p className="text-primary-text mt-1 font-semibold">{selectedOrder.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Status</label>
                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Order Date</label>
                <p className="text-primary-text mt-1">{formatDate(selectedOrder.order_date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Amount</label>
                <p className="text-primary-text mt-1 font-semibold text-lg">{formatCurrency(selectedOrder.amount)}</p>
              </div>
              {selectedOrder.invoice_number && (
                <div>
                  <label className="text-sm font-medium text-secondary-text">Invoice</label>
                  <p className="text-primary-text mt-1 text-primary-accent">INV #{selectedOrder.invoice_number}</p>
                </div>
              )}
            </div>

            {selectedOrder.description && (
              <div>
                <label className="text-sm font-medium text-secondary-text">Description</label>
                <p className="text-primary-text mt-1">{selectedOrder.description}</p>
              </div>
            )}

            {/* Order Items */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-primary-text mb-3">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-secondary-text">Item</th>
                        <th className="text-right py-2 text-sm font-medium text-secondary-text">Quantity</th>
                        <th className="text-right py-2 text-sm font-medium text-secondary-text">Unit Price</th>
                        <th className="text-right py-2 text-sm font-medium text-secondary-text">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 text-sm text-primary-text">
                            <div>
                              <p className="font-medium">{item.item_name || item.name}</p>
                              {item.description && (
                                <p className="text-xs text-secondary-text">{item.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-2 text-sm text-primary-text text-right">{item.quantity || 0}</td>
                          <td className="py-2 text-sm text-primary-text text-right">{formatCurrency(item.unit_price || 0)}</td>
                          <td className="py-2 text-sm text-primary-text text-right font-semibold">
                            {formatCurrency(item.amount || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="py-2 text-right font-semibold text-primary-text">Total:</td>
                        <td className="py-2 text-right font-bold text-primary-text">{formatCurrency(selectedOrder.amount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {!selectedOrder.invoice_id && (
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    setIsCreateInvoiceModalOpen(true)
                  }}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <IoReceipt size={18} />
                  Generate Invoice
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedOrder(null)
                }}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateInvoiceModalOpen}
        onClose={() => setIsCreateInvoiceModalOpen(false)}
        title="Generate Invoice from Order"
      >
        <div className="space-y-4">
          {selectedOrder && (
            <>
              <p className="text-secondary-text">
                Are you sure you want to generate an invoice for Order #{selectedOrder.id}?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-secondary-text mb-1">Order Amount:</p>
                <p className="text-lg font-bold text-primary-text">{formatCurrency(selectedOrder.amount)}</p>
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <p className="text-sm text-secondary-text mt-2">
                    {selectedOrder.items.length} item(s) will be included in the invoice.
                  </p>
                )}
              </div>
            </>
          )}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateInvoiceModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateInvoice}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <IoCheckmark size={18} />
              Generate Invoice
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add Items to Order"
        width="800px"
      >
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search items..."
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              />
              <IoSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <select
              value={itemCategoryFilter}
              onChange={(e) => setItemCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="">All Categories</option>
              {[...new Set(items.map(i => i.category).filter(Boolean))].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Items List */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {items.filter(item => {
              const matchesSearch = !itemSearchQuery || 
                (item.item_name || item.title || item.name || '').toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
                (item.description || '').toLowerCase().includes(itemSearchQuery.toLowerCase())
              const matchesCategory = !itemCategoryFilter || item.category === itemCategoryFilter
              return matchesSearch && matchesCategory
            }).length === 0 ? (
              <div className="p-8 text-center text-secondary-text">
                <IoStorefront size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No items found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {items.filter(item => {
                  const matchesSearch = !itemSearchQuery || 
                    (item.item_name || item.title || item.name || '').toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
                    (item.description || '').toLowerCase().includes(itemSearchQuery.toLowerCase())
                  const matchesCategory = !itemCategoryFilter || item.category === itemCategoryFilter
                  return matchesSearch && matchesCategory
                }).map(item => (
                  <div key={item.id} className="p-3 hover:bg-gray-50 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-primary-text">{item.item_name || item.title || item.name}</p>
                      <p className="text-sm text-secondary-text">{item.description || ''}</p>
                      <p className="text-sm font-semibold text-red-500 mt-1">
                        {formatCurrency(item.unit_price || item.rate || item.price || 0)} / {item.unit || item.unit_type || 'PC'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddItemFromModal([item])}
                      className="ml-4"
                    >
                      <IoAdd size={16} />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddItemModalOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Orders


import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import RightSideModal from '../../../components/ui/RightSideModal'
import Input from '../../../components/ui/Input'
import { ordersAPI, itemsAPI, invoicesAPI } from '../../../api'
import BaseUrl from '../../../api/baseUrl'
import { IoCart, IoCheckmark, IoStorefront, IoSearch, IoAdd, IoRemove, IoTrash, IoClose, IoAttach, IoMic, IoOpenOutline } from 'react-icons/io5'

const Store = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const companyId = user?.company_id || localStorage.getItem('companyId')
  const userId = user?.id || localStorage.getItem('userId')
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [orderNote, setOrderNote] = useState('')
  const [itemSearchQuery, setItemSearchQuery] = useState('')
  const [itemCategoryFilter, setItemCategoryFilter] = useState('')
  const [createdInvoice, setCreatedInvoice] = useState(null)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)

  useEffect(() => {
    if (companyId) {
      fetchItems()
    }
  }, [companyId, categoryFilter])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const companyIdNum = parseInt(companyId || 1, 10)
      const params = { company_id: companyIdNum }
      
      if (categoryFilter) {
        params.category = categoryFilter
      }
      
      const response = await itemsAPI.getAll(params)
      if (response.data && response.data.success) {
        const items = response.data.data || []
        // Transform items to products format
        const transformedProducts = items.map(item => {
          // Build full image URL from backend
          let imageUrl = null
          if (item.image_url && item.image_url !== '/uploads/null') {
            imageUrl = `${BaseUrl}${item.image_url}`
          } else if (item.image_path && item.image_path !== 'null') {
            imageUrl = `${BaseUrl}/uploads/${item.image_path}`
          } else if (item.image) {
            imageUrl = item.image.startsWith('http') ? item.image : `${BaseUrl}${item.image}`
          }
          
          return {
            id: item.id,
            name: item.title || item.item_name || item.name || `Item #${item.id}`,
            description: item.description || item.item_description || '',
            price: parseFloat(item.rate || item.unit_price || item.price || 0),
            unit: item.unit_type || item.unit || 'Pc',
            category: item.category || item.item_category || 'General',
            image: imageUrl
          }
        })
        setProducts(transformedProducts)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Add to cart
  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  // Update quantity
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId)
      return
    }
    setCart(cart.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ))
  }

  // Remove from cart
  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  // Calculate cart total
  const calculateCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (parseFloat(item.price || 0) * item.quantity)
    }, 0)
  }

  // Handle checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty')
      return
    }
    setIsCheckoutModalOpen(true)
  }

  // Place order from cart and generate invoice
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty')
      return
    }

    try {
      const companyIdNum = parseInt(companyId || 1, 10)
      const clientId = user?.client_id || localStorage.getItem('clientId')
      const effectiveClientId = clientId || userId
      
      // Create order with items
      const orderData = {
        company_id: companyIdNum,
        client_id: effectiveClientId,
        title: `Order - ${new Date().toLocaleDateString()}`,
        description: orderNote || `Order with ${cart.length} item(s)`,
        amount: calculateCartTotal(),
        status: 'New',
        order_date: new Date().toISOString().split('T')[0],
        items: cart.map(item => ({
          item_id: item.id,
          item_name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: parseFloat(item.price || 0),
          amount: parseFloat(item.price || 0) * item.quantity
        }))
      }
      
      const response = await ordersAPI.create(orderData)
      if (response.data && response.data.success) {
        // Create invoice for this order
        const today = new Date()
        const dueDate = new Date(today)
        dueDate.setDate(dueDate.getDate() + 30) // Due in 30 days
        
        const invoiceData = {
          company_id: companyIdNum,
          client_id: effectiveClientId,
          issue_date: today.toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          sub_total: calculateCartTotal(),
          discount: 0,
          discount_type: 'fixed',
          total: calculateCartTotal(),
          status: 'Unpaid',
          note: orderNote || `Invoice for Order #${response.data.data?.id || ''}`,
          items: cart.map(item => ({
            item_name: item.name,
            description: item.description || '',
            quantity: item.quantity,
            unit_price: parseFloat(item.price || 0),
            amount: parseFloat(item.price || 0) * item.quantity
          }))
        }
        
        try {
          const invoiceResponse = await invoicesAPI.create(invoiceData)
          if (invoiceResponse.data && invoiceResponse.data.success) {
            const createdInvoiceData = invoiceResponse.data.data
            
            // Link invoice to order
            const orderId = response.data.data?.id
            if (orderId && createdInvoiceData?.id) {
              try {
                await ordersAPI.update(orderId, {
                  invoice_id: createdInvoiceData.id
                }, { company_id: companyIdNum })
              } catch (linkError) {
                console.error('Error linking invoice to order:', linkError)
              }
            }
            
            setCreatedInvoice(createdInvoiceData)
            setCart([])
            setOrderNote('')
            setIsCheckoutModalOpen(false)
            setIsInvoiceModalOpen(true)
          } else {
            // Order created but invoice failed - still show success
            alert('Order placed successfully! Invoice will be generated shortly.')
            setCart([])
            setOrderNote('')
            setIsCheckoutModalOpen(false)
            navigate('/app/client/orders')
          }
        } catch (invoiceError) {
          console.error('Error creating invoice:', invoiceError)
          // Order created but invoice failed - still show success
          alert('Order placed successfully! Invoice will be generated shortly.')
          setCart([])
          setOrderNote('')
          setIsCheckoutModalOpen(false)
          navigate('/app/client/orders')
        }
      } else {
        alert(response.data?.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert(error.response?.data?.error || error.response?.data?.details || 'Failed to place order')
    }
  }

  // Quick order (single item)
  const handleOrderClick = (product) => {
    setSelectedProduct(product)
    setIsOrderModalOpen(true)
  }

  const handleQuickOrder = async () => {
    if (!selectedProduct) return
    
    try {
      const companyIdNum = parseInt(companyId || 1, 10)
      const clientId = user?.client_id || localStorage.getItem('clientId')
      const effectiveClientId = clientId || userId
      
      // Create order with item
      const orderData = {
        company_id: companyIdNum,
        client_id: effectiveClientId,
        title: selectedProduct.name,
        description: selectedProduct.description,
        amount: selectedProduct.price,
        status: 'New',
        order_date: new Date().toISOString().split('T')[0],
        items: [{
          item_id: selectedProduct.id,
          item_name: selectedProduct.name,
          description: selectedProduct.description,
          quantity: 1,
          unit: selectedProduct.unit,
          unit_price: selectedProduct.price,
          amount: selectedProduct.price
        }]
      }
      
      const response = await ordersAPI.create(orderData)
      if (response.data && response.data.success) {
        // Create invoice for this order
        const today = new Date()
        const dueDate = new Date(today)
        dueDate.setDate(dueDate.getDate() + 30)
        
        const invoiceData = {
          company_id: companyIdNum,
          client_id: effectiveClientId,
          issue_date: today.toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          sub_total: selectedProduct.price,
          discount: 0,
          discount_type: 'fixed',
          total: selectedProduct.price,
          status: 'Unpaid',
          note: `Invoice for ${selectedProduct.name}`,
          items: [{
            item_name: selectedProduct.name,
            description: selectedProduct.description || '',
            quantity: 1,
            unit_price: selectedProduct.price,
            amount: selectedProduct.price
          }]
        }
        
        try {
          const invoiceResponse = await invoicesAPI.create(invoiceData)
          if (invoiceResponse.data && invoiceResponse.data.success) {
            const createdInvoiceData = invoiceResponse.data.data
            
            // Link invoice to order
            const orderId = response.data.data?.id
            if (orderId && createdInvoiceData?.id) {
              try {
                await ordersAPI.update(orderId, {
                  invoice_id: createdInvoiceData.id
                }, { company_id: companyIdNum })
              } catch (linkError) {
                console.error('Error linking invoice to order:', linkError)
              }
            }
            
            setCreatedInvoice(createdInvoiceData)
            setIsOrderModalOpen(false)
            setSelectedProduct(null)
            setIsInvoiceModalOpen(true)
          } else {
            alert('Order placed successfully!')
            setIsOrderModalOpen(false)
            setSelectedProduct(null)
            navigate('/app/client/orders')
          }
        } catch (invoiceError) {
          console.error('Error creating invoice:', invoiceError)
          alert('Order placed successfully!')
          setIsOrderModalOpen(false)
          setSelectedProduct(null)
          navigate('/app/client/orders')
        }
      } else {
        alert(response.data?.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert(error.response?.data?.error || error.response?.data?.details || 'Failed to place order')
    }
  }

  // Download Invoice as PDF
  const handleDownloadInvoicePDF = (invoice) => {
    if (!invoice) return
    
    const invoiceNumber = invoice.invoice_number || invoice.id
    const billDate = new Date(invoice.issue_date || invoice.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const dueDate = new Date(invoice.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const items = invoice.items || []
    const subTotal = parseFloat(invoice.sub_total || invoice.total || 0).toFixed(2)
    const total = parseFloat(invoice.total || 0).toFixed(2)
    
    // Create invoice HTML content
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: white; color: #333; }
          .invoice-container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
          .logo { font-size: 32px; font-weight: bold; color: #0891b2; }
          .logo-icon { width: 50px; height: 50px; background: linear-gradient(135deg, #0891b2, #06b6d4); border-radius: 50%; display: inline-block; margin-right: 10px; }
          .invoice-info { text-align: right; }
          .invoice-number { font-size: 24px; font-weight: bold; color: #333; border-bottom: 3px solid #333; padding-bottom: 5px; margin-bottom: 10px; }
          .invoice-dates { font-size: 14px; color: #666; }
          .status-badge { position: absolute; top: 20px; left: 20px; background: #f59e0b; color: white; padding: 5px 20px; font-size: 12px; font-weight: bold; transform: rotate(-45deg); transform-origin: center; }
          .badge-container { position: relative; width: 100px; height: 100px; overflow: hidden; }
          .badge-ribbon { position: absolute; top: 15px; left: -30px; width: 120px; background: #f59e0b; color: white; text-align: center; padding: 5px 0; font-size: 11px; font-weight: bold; transform: rotate(-45deg); }
          .company-info { margin-bottom: 30px; }
          .company-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
          .company-details { font-size: 13px; color: #666; line-height: 1.6; }
          .bill-to { margin-bottom: 30px; }
          .bill-to-label { font-size: 14px; font-weight: bold; color: #666; margin-bottom: 5px; }
          .client-name { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
          .client-details { font-size: 13px; color: #666; line-height: 1.6; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th { background: #0891b2; color: white; padding: 12px 15px; text-align: left; font-size: 14px; }
          .items-table th:nth-child(2) { text-align: center; }
          .items-table th:nth-child(3), .items-table th:nth-child(4) { text-align: right; }
          .items-table td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 14px; }
          .items-table td:nth-child(2) { text-align: center; }
          .items-table td:nth-child(3), .items-table td:nth-child(4) { text-align: right; }
          .totals { display: flex; justify-content: flex-end; }
          .totals-box { width: 250px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .total-row.subtotal { border-bottom: 1px solid #eee; }
          .total-row.balance { background: #1f2937; color: white; padding: 12px 15px; margin-top: 10px; font-weight: bold; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="badge-container">
            <div class="badge-ribbon">Not paid</div>
          </div>
          
          <div class="header">
            <div>
              <div class="logo">
                <span style="color: #0891b2;">⬡</span> RISE
              </div>
            </div>
            <div class="invoice-info">
              <div class="invoice-number">INV #${invoiceNumber}</div>
              <div class="invoice-dates">
                <p>Bill date: ${billDate}</p>
                <p>Due date: ${dueDate}</p>
              </div>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div class="company-info">
              <div class="company-name">Your Company</div>
              <div class="company-details">
                Company Address<br>
                City, State ZIP<br>
                Phone: +1234567890<br>
                Email: info@company.com
              </div>
            </div>
            <div class="bill-to">
              <div class="bill-to-label">Bill To</div>
              <div class="client-name">${user?.name || 'Client'}</div>
              <div class="client-details">
                ${user?.email || ''}<br>
                ${user?.phone || ''}
              </div>
            </div>
          </div>
          
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
              ${items.map(item => `
                <tr>
                  <td>${item.item_name || ''}</td>
                  <td>${item.quantity || 1} ${item.unit || 'PC'}</td>
                  <td>$${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                  <td>$${parseFloat(item.amount || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-box">
              <div class="total-row subtotal">
                <span>Sub Total</span>
                <span>$${subTotal}</span>
              </div>
              <div class="total-row balance">
                <span>Balance Due</span>
                <span>$${total}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    // Create a new window and print/download as PDF
    const printWindow = window.open('', '_blank')
    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.print()
    }
    
    // Fallback for browsers that don't trigger onload
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category))]

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Filter items for add item modal
  const filteredItemsForModal = products.filter(item => {
    const matchesSearch = !itemSearchQuery || 
      item.name?.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(itemSearchQuery.toLowerCase())
    const matchesCategory = !itemCategoryFilter || item.category === itemCategoryFilter
    return matchesSearch && matchesCategory
  })

  // Handle add item from modal
  const handleAddItemFromModal = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
    setIsAddItemModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filter */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Store</h1>
          <p className="text-secondary-text mt-1">Browse available products and services</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
          >
            <option value="">- Category -</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm w-48"
            />
            <IoSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>

          {/* Cart Badge and Checkout Button */}
          {cart.length > 0 && (
            <Button
              onClick={handleCheckout}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <IoCart size={18} />
              Checkout ({cart.length})
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading store...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <IoStorefront size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-primary-text mb-2">No Products Found</h3>
          <p className="text-secondary-text">Try adjusting your search or filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full ${product.image ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300`}
                >
                  <IoStorefront size={48} className="text-gray-400" />
                </div>
              </div>
              
              {/* Product Details */}
              <div className="p-4">
                <h3 className="font-semibold text-primary-text text-lg mb-1">
                  {product.name}
                </h3>
                <p className="text-red-500 font-bold text-lg mb-2">
                  ${product.price.toFixed(2)}
                  <span className="text-gray-400 font-normal text-sm">/{product.unit}</span>
                </p>
                <p className="text-secondary-text text-sm line-clamp-2 mb-3">
                  {product.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleOrderClick(product)}
                    className="flex-1 text-sm"
                  >
                    Quick Order
                  </Button>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 text-sm flex items-center justify-center gap-1"
                  >
                    <IoAdd size={16} />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Order Modal */}
      <RightSideModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false)
          setSelectedProduct(null)
        }}
        title="Confirm Order"
        width="450px"
      >
        {selectedProduct && (
          <div className="space-y-6">
            {/* Product Preview */}
            <div className="rounded-lg overflow-hidden">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name}
                className="w-full h-48 object-cover"
              />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-primary-text">{selectedProduct.name}</h3>
              <p className="text-secondary-text mt-2">{selectedProduct.description}</p>
              <div className="text-3xl font-bold text-red-500 mt-4">
                ${selectedProduct.price.toFixed(2)}
                <span className="text-sm font-normal text-gray-400">/{selectedProduct.unit}</span>
              </div>
            </div>
            
            <div className="space-y-2 py-4 border-t border-b">
              <div className="flex items-center gap-2 text-sm text-secondary-text">
                <IoCheckmark className="text-green-500" size={18} />
                <span>Instant order confirmation</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-secondary-text">
                <IoCheckmark className="text-green-500" size={18} />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-secondary-text">
                <IoCheckmark className="text-green-500" size={18} />
                <span>24/7 support available</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOrderModalOpen(false)
                  setSelectedProduct(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleQuickOrder}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-accent hover:bg-primary-accent/90"
              >
                <IoCart size={18} />
                Place Order
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>

      {/* Process Order Modal - Like Admin Store */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => {
          setIsCheckoutModalOpen(false)
          setOrderNote('')
        }}
        title="Process Order"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-secondary-text text-sm">
            You are about to create the order. Please check details before submitting.
          </p>

          {/* Order Items Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-text">Item</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-text">Quantity</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-text">Rate</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-text">Total</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-primary-text">≡</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-secondary-text text-sm">
                      No items in cart
                    </td>
                  </tr>
                ) : (
                  cart.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-primary-text">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-secondary-text mt-0.5">
                              {item.description.length > 50 ? `${item.description.substring(0, 50)}...` : item.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-primary-text">
                        {item.quantity} {item.unit?.toLowerCase() || 'pc'}
                      </td>
                      <td className="py-3 px-4 text-sm text-primary-text">
                        ${parseFloat(item.price || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-primary-text">
                        ${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => window.open(`/app/client/store`, '_blank')}
                            className="p-1.5 text-primary-accent hover:bg-primary-accent/10 rounded transition-colors"
                            title="View item"
                          >
                            <IoOpenOutline size={18} />
                          </button>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove item"
                          >
                            <IoClose size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add Item Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setIsAddItemModalOpen(true)}
              className="flex items-center justify-center gap-2"
            >
              <IoAdd size={18} />
              Add item
            </Button>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-primary-text">Sub Total</span>
              <span className="text-sm font-semibold text-primary-text">${calculateCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-base font-semibold text-primary-text">Total</span>
              <span className="text-lg font-bold text-primary-text">${calculateCartTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Note
            </label>
            <textarea
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="Note"
              rows={4}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <IoAttach size={16} />
                Upload File
              </Button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                <IoMic size={20} />
              </button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="flex items-center gap-2"
              >
                <IoSearch size={16} />
                Find more items
              </Button>
            </div>
            <Button
              onClick={handlePlaceOrder}
              disabled={cart.length === 0}
              className="flex items-center gap-2 bg-primary-accent hover:bg-primary-accent/90 text-white"
            >
              <IoCheckmark size={18} />
              Save & continue
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => {
          setIsAddItemModalOpen(false)
          setItemSearchQuery('')
          setItemCategoryFilter('')
        }}
        title="Add Item"
        size="lg"
      >
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search items..."
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
              />
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <select
              value={itemCategoryFilter}
              onChange={(e) => setItemCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Items List */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredItemsForModal.length === 0 ? (
              <div className="py-8 text-center text-secondary-text">
                No items found
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary-text">Item</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary-text">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary-text">Price</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-primary-text">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItemsForModal.map(item => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-primary-text">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-secondary-text mt-0.5">
                            {item.description.length > 40 ? `${item.description.substring(0, 40)}...` : item.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-secondary-text">{item.category}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-primary-text">
                        ${parseFloat(item.price || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          onClick={() => handleAddItemFromModal(item)}
                          className="flex items-center gap-1"
                        >
                          <IoAdd size={16} />
                          Add
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Modal>

      {/* Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false)
          setCreatedInvoice(null)
          navigate('/app/client/invoices')
        }}
        title="Invoice Generated"
        size="lg"
      >
        {createdInvoice && (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="relative bg-white border border-gray-200 rounded-lg p-6">
              {/* Not Paid Badge */}
              <div className="absolute top-0 left-0 overflow-hidden w-24 h-24">
                <div className="absolute top-4 -left-8 w-32 bg-yellow-500 text-white text-xs font-semibold py-1 text-center transform -rotate-45">
                  Not paid
                </div>
              </div>

              {/* Invoice Number and Dates */}
              <div className="text-right mb-6">
                <h2 className="text-2xl font-bold text-primary-text">INV #{createdInvoice.invoice_number || createdInvoice.id}</h2>
                <p className="text-sm text-secondary-text">Bill date: {new Date(createdInvoice.issue_date || createdInvoice.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                <p className="text-sm text-secondary-text">Due date: {new Date(createdInvoice.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              </div>

              {/* Items Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                <table className="w-full">
                  <thead className="bg-primary-accent text-white">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Item</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold">Quantity</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold">Rate</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {(createdInvoice.items || []).map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-primary-text">{item.item_name}</td>
                        <td className="py-3 px-4 text-sm text-center text-primary-text">{item.quantity} {item.unit || 'PC'}</td>
                        <td className="py-3 px-4 text-sm text-right text-primary-text">${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-primary-text">${parseFloat(item.amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-text">Sub Total</span>
                    <span className="text-primary-text">${parseFloat(createdInvoice.sub_total || createdInvoice.total || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold bg-gray-900 text-white px-3 py-2 rounded">
                    <span>Balance Due</span>
                    <span>${parseFloat(createdInvoice.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsInvoiceModalOpen(false)
                  setCreatedInvoice(null)
                  navigate('/app/client/invoices')
                }}
              >
                View All Invoices
              </Button>
              <Button
                onClick={() => handleDownloadInvoicePDF(createdInvoice)}
                className="bg-primary-accent hover:bg-primary-accent/90"
              >
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Store

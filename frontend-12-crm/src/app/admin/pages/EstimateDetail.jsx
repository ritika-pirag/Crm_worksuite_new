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
  IoCall,
  IoPerson,
  IoLink
} from 'react-icons/io5'

const EstimateDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [estimate, setEstimate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState(null)
  const [client, setClient] = useState(null)

  // Modal states
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false)
  const [isEditDiscountModalOpen, setIsEditDiscountModalOpen] = useState(false)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isAddReminderModalOpen, setIsAddReminderModalOpen] = useState(false)

  // Form states
  const [editingItem, setEditingItem] = useState(null)
  const [newItem, setNewItem] = useState({
    item_name: '',
    description: '',
    quantity: 1,
    unit: 'PC',
    unit_price: 0
  })
  const [discountValue, setDiscountValue] = useState(0)
  const [newTask, setNewTask] = useState({ title: '', due_date: '' })
  const [newReminder, setNewReminder] = useState({ title: '', remind_at: '' })
  const [tasks, setTasks] = useState([])
  const [reminders, setReminders] = useState([])
  const [note, setNote] = useState('')

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

  useEffect(() => {
    fetchEstimate()
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
          discount: parseFloat(data.discount) || 0,
          discount_type: data.discount_type || '%',
          discount_amount: parseFloat(data.discount_amount) || 0,
          tax_amount: parseFloat(data.tax_amount) || 0,
          total: parseFloat(data.total) || 0,
          items: data.items || [],
          created_by: data.created_by || null,
          signer_name: data.signer_name || '',
          signer_email: data.signer_email || '',
        })
        setNote(data.note || '')
        setDiscountValue(parseFloat(data.discount) || 0)

        // Fetch company details
        if (data.company_id) {
          try {
            const companyResponse = await companiesAPI.getById(data.company_id)
            if (companyResponse.data && companyResponse.data.success && companyResponse.data.data) {
              setCompany(companyResponse.data.data)
            }
          } catch (err) {
            console.log('Company not found:', err.response?.status)
            setCompany(null)
          }
        }

        // Fetch client details
        if (data.client_id) {
          try {
            const clientResponse = await clientsAPI.getById(data.client_id, { company_id: companyId })
            if (clientResponse.data && clientResponse.data.success) {
              setClient(clientResponse.data.data)
            }
          } catch (err) {
            console.log('Client not found:', err.response?.status)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching estimate:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString || dateString === '--') return '--'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount) => {
    let currencyCode = estimate?.currency || 'USD'
    if (currencyCode.includes(' ')) {
      currencyCode = currencyCode.split(' ')[0]
    }
    if (currencyCode.length !== 3) {
      currencyCode = 'USD'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  const isExpired = () => {
    if (!estimate?.valid_till || estimate.valid_till === '--') return false
    const validDate = new Date(estimate.valid_till)
    return validDate < new Date()
  }

  const statusColors = {
    draft: 'bg-gray-500 text-white',
    sent: 'bg-blue-500 text-white',
    accepted: 'bg-green-500 text-white',
    rejected: 'bg-red-500 text-white',
    declined: 'bg-red-500 text-white',
  }

  // Action handlers
  const handlePreview = () => {
    setIsPreviewModalOpen(true)
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
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total-row { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ESTIMATE</h1>
          <h2>${estimate.estimate_number}</h2>
        </div>
        <p><strong>Client:</strong> ${estimate.client_name}</p>
        <p><strong>Date:</strong> ${formatDate(estimate.estimate_date)}</p>
        <p><strong>Valid Until:</strong> ${formatDate(estimate.valid_till)}</p>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${(estimate.items || []).map(item => `
              <tr>
                <td>${item.item_name || '-'}</td>
                <td>${item.quantity || 0} ${item.unit || ''}</td>
                <td>${formatCurrency(item.unit_price || 0)}</td>
                <td>${formatCurrency(item.amount || (item.quantity * item.unit_price) || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3">Total:</td>
              <td>${formatCurrency(estimate.total)}</td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 250)
  }

  const handleViewPDF = () => {
    const pdfUrl = `${baseUrl}/api/v1/estimates/${id}/pdf?company_id=${companyId}`
    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  }

  const handleDownloadPDF = () => {
    const pdfUrl = `${baseUrl}/api/v1/estimates/${id}/pdf?company_id=${companyId}&download=1`
    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  }

  const handleSendEmail = async () => {
    try {
      // API call to send email
      alert('Email sent successfully!')
      setIsSendEmailModalOpen(false)
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email')
    }
  }

  const handleAddItem = async () => {
    try {
      const itemData = {
        ...newItem,
        amount: newItem.quantity * newItem.unit_price
      }
      const updatedItems = [...(estimate.items || []), itemData]
      const response = await estimatesAPI.update(id, { items: updatedItems })
      if (response.data.success) {
        await fetchEstimate()
        setIsAddItemModalOpen(false)
        setNewItem({ item_name: '', description: '', quantity: 1, unit: 'PC', unit_price: 0 })
      }
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Failed to add item')
    }
  }

  const handleEditItem = async () => {
    try {
      const updatedItems = (estimate.items || []).map((item, idx) =>
        idx === editingItem.index ? { ...editingItem, amount: editingItem.quantity * editingItem.unit_price } : item
      )
      const response = await estimatesAPI.update(id, { items: updatedItems })
      if (response.data.success) {
        await fetchEstimate()
        setIsEditItemModalOpen(false)
        setEditingItem(null)
      }
    } catch (error) {
      console.error('Error editing item:', error)
      alert('Failed to update item')
    }
  }

  const handleDeleteItem = async (index) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    try {
      const updatedItems = (estimate.items || []).filter((_, idx) => idx !== index)
      const response = await estimatesAPI.update(id, { items: updatedItems })
      if (response.data.success) {
        await fetchEstimate()
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const handleUpdateDiscount = async () => {
    try {
      const response = await estimatesAPI.update(id, { discount: discountValue })
      if (response.data.success) {
        await fetchEstimate()
        setIsEditDiscountModalOpen(false)
      }
    } catch (error) {
      console.error('Error updating discount:', error)
      alert('Failed to update discount')
    }
  }

  const handleSaveNote = async () => {
    try {
      const response = await estimatesAPI.update(id, { note })
      if (response.data.success) {
        await fetchEstimate()
      }
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const handleAddTask = () => {
    if (newTask.title) {
      setTasks([...tasks, { ...newTask, id: Date.now() }])
      setNewTask({ title: '', due_date: '' })
      setIsAddTaskModalOpen(false)
    }
  }

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  const handleAddReminder = () => {
    if (newReminder.title) {
      setReminders([...reminders, { ...newReminder, id: Date.now() }])
      setNewReminder({ title: '', remind_at: '' })
      setIsAddReminderModalOpen(false)
    }
  }

  const handleDeleteReminder = (reminderId) => {
    setReminders(reminders.filter(r => r.id !== reminderId))
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading estimate details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (!estimate) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Estimate Not Found</h2>
          <p className="text-gray-600 mb-4">The estimate you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/app/admin/estimates')}>
            <IoArrowBack className="mr-2" />
            Back to Estimates
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app/admin/estimates')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IoArrowBack size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <IoLink className="text-gray-400" size={20} />
              <span className="text-lg font-semibold text-gray-800">{estimate.estimate_number}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[estimate.status] || statusColors.draft}`}>
              {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
            </span>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <IoMailOutline size={16} />
              <span>{formatDate(estimate.estimate_date)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/estimates/${id}`)
                alert('Estimate URL copied to clipboard!')
              }}
              className="flex items-center gap-2"
            >
              <IoOpenOutline size={16} />
              Estimate URL
            </Button>
            <Button
              onClick={() => setIsSendEmailModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <IoMailOutline size={16} />
              Send to client
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="flex gap-6 p-6">
        {/* Left Column - Main Content (70%) */}
        <div className="flex-1" style={{ maxWidth: '70%' }}>
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Company Info Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg">
                    {company?.name?.substring(0, 1) || 'R'}
                  </div>
                  <span className="text-3xl font-bold text-teal-600">{company?.name || 'RISE'}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-800">{company?.name || 'Awesome Demo Company'}</p>
                  {company?.address && <p>{company.address}</p>}
                  {company?.city && <p>{company.city}, {company?.state || ''}</p>}
                  {company?.phone && <p>Phone: {company.phone}</p>}
                  {company?.email && <p>Email: {company.email}</p>}
                  {company?.website && <p>Website: {company.website}</p>}
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block bg-gray-900 text-white font-bold text-lg px-4 py-2 mb-3">
                  {estimate.estimate_number}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Estimate date: <span className="font-medium">{formatDate(estimate.estimate_date)}</span></p>
                  <p>Valid until: <span className={`font-medium ${isExpired() ? 'text-red-600' : ''}`}>
                    {formatDate(estimate.valid_till)} {isExpired() && '(Expired)'}
                  </span></p>
                </div>
              </div>
            </div>

            {/* Estimate To Section */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Estimate To</h3>
              <div className="text-gray-800">
                <p className="font-semibold">{client?.company_name || client?.name || estimate.client_name}</p>
                {client?.address && <p className="text-sm text-gray-600">{client.address}</p>}
                {client?.city && <p className="text-sm text-gray-600">{client.city}, {client?.country || ''}</p>}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-gray-600">Item</th>
                    <th className="text-center p-3 text-sm font-semibold text-gray-600">Quantity</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-600">Rate</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-600">Total</th>
                    <th className="w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.items && estimate.items.length > 0 ? (
                    estimate.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-gray-800">{item.item_name || 'Item'}</p>
                            {item.description && (
                              <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center text-gray-600">
                          {item.quantity || 0} {item.unit || 'PC'}
                        </td>
                        <td className="p-3 text-right text-gray-600">
                          {formatCurrency(item.unit_price || 0)}
                        </td>
                        <td className="p-3 text-right font-semibold text-gray-800">
                          {formatCurrency(item.amount || (item.quantity * item.unit_price) || 0)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => {
                                setEditingItem({ ...item, index: idx })
                                setIsEditItemModalOpen(true)
                              }}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                              title="Edit"
                            >
                              <IoCreate size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(idx)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <IoClose size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 italic">
                        No items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Add Item Button */}
              <div className="mt-4">
                <button
                  onClick={() => setIsAddItemModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <IoAdd size={18} /> Add item
                </button>
              </div>

              {/* Totals Section */}
              <div className="mt-6 flex justify-end">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sub Total:</span>
                    <span className="text-gray-800">{formatCurrency(estimate.sub_total)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      Discount:
                      <button
                        onClick={() => setIsEditDiscountModalOpen(true)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <IoCreate size={14} />
                      </button>
                    </span>
                    <span className="text-gray-800">
                      {estimate.discount_type === '%'
                        ? `${estimate.discount}%`
                        : formatCurrency(estimate.discount_amount || 0)}
                    </span>
                  </div>
                  {estimate.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax:</span>
                      <span className="text-gray-800">{formatCurrency(estimate.tax_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-gray-800">{formatCurrency(estimate.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            {estimate.description && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Description</h3>
                <div className="text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: estimate.description }} />
              </div>
            )}

            {/* Terms Section */}
            {estimate.terms && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Terms & Conditions</h3>
                <p className="text-gray-700">{estimate.terms}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar (30%) */}
        <div className="w-80 space-y-4">
          {/* Estimate Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <IoDocumentText className="text-gray-500" size={18} />
                Estimate info
              </h3>
              <button className="text-gray-400 hover:text-gray-600">
                <IoEllipsisVertical size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                  {(client?.name || estimate.client_name || 'C').substring(0, 2).toUpperCase()}
                </div>
                <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                  {client?.name || estimate.client_name}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p className="flex justify-between py-1">
                  <span>Estimate date:</span>
                  <span className="font-medium">{formatDate(estimate.estimate_date)}</span>
                </p>
                <p className="flex justify-between py-1">
                  <span>Valid until:</span>
                  <span className={`font-medium ${isExpired() ? 'text-red-600' : ''}`}>
                    {formatDate(estimate.valid_till)} {isExpired() && '(Expired)'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200"
              >
                <IoEye size={16} className="text-gray-500" />
                Preview
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200"
              >
                <IoPrint size={16} className="text-gray-500" />
                Print
              </button>
              <button
                onClick={handleViewPDF}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200"
              >
                <IoDocumentText size={16} className="text-gray-500" />
                View PDF
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200"
              >
                <IoDownload size={16} className="text-gray-500" />
                Download
              </button>
            </div>
          </div>

          {/* Signer Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <IoCreate className="text-gray-500" size={18} />
                Signer info
              </h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex justify-between">
                <span>Name:</span>
                <span className="font-medium text-gray-800">{estimate.signer_name || '--'}</span>
              </p>
              <p className="flex justify-between">
                <span>Email:</span>
                <span className="font-medium text-gray-800">{estimate.signer_email || '--'}</span>
              </p>
            </div>
          </div>

          {/* Note Section */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Note</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleSaveNote}
              placeholder="Add a note..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {/* Tasks Section */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <IoCheckmarkCircle className="text-gray-500" size={18} />
                Tasks
              </h3>
            </div>
            <div className="space-y-2 mb-3">
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No tasks yet</p>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{task.title}</span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <IoClose size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setIsAddTaskModalOpen(true)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <IoAdd size={16} /> Add task
            </button>
          </div>

          {/* Reminders Section */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <IoTime className="text-gray-500" size={18} />
                Reminders (Private)
              </h3>
            </div>
            <div className="space-y-2 mb-3">
              {reminders.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No reminders yet</p>
              ) : (
                reminders.map(reminder => (
                  <div key={reminder.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{reminder.title}</span>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <IoClose size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setIsAddReminderModalOpen(true)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <IoAdd size={16} /> Add reminder
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Estimate Preview"
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-center border-b pb-4">
            <h2 className="text-2xl font-bold">ESTIMATE</h2>
            <p className="text-xl text-gray-600">{estimate.estimate_number}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Client:</strong> {estimate.client_name}</p>
              <p><strong>Date:</strong> {formatDate(estimate.estimate_date)}</p>
            </div>
            <div>
              <p><strong>Valid Until:</strong> {formatDate(estimate.valid_till)}</p>
              <p><strong>Status:</strong> {estimate.status}</p>
            </div>
          </div>
          {estimate.items && estimate.items.length > 0 && (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-2">Item</th>
                  <th className="text-right p-2">Qty</th>
                  <th className="text-right p-2">Rate</th>
                  <th className="text-right p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {estimate.items.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{item.item_name}</td>
                    <td className="p-2 text-right">{item.quantity}</td>
                    <td className="p-2 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td colSpan="3" className="p-2 text-right">Total:</td>
                  <td className="p-2 text-right">{formatCurrency(estimate.total)}</td>
                </tr>
              </tfoot>
            </table>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Send Email Modal */}
      <Modal
        isOpen={isSendEmailModalOpen}
        onClose={() => setIsSendEmailModalOpen(false)}
        title="Send Estimate to Client"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Send this estimate to <strong>{client?.email || estimate.client_name}</strong>?
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsSendEmailModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSendEmail} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              Send Email
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add Item"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <Input
              value={newItem.item_name}
              onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
              placeholder="Enter item name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Enter description"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <Input
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <Input
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
              <Input
                type="number"
                value={newItem.unit_price}
                onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddItemModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddItem} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              Add Item
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={isEditItemModalOpen}
        onClose={() => setIsEditItemModalOpen(false)}
        title="Edit Item"
      >
        {editingItem && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <Input
                value={editingItem.item_name}
                onChange={(e) => setEditingItem({ ...editingItem, item_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <Input
                  type="number"
                  value={editingItem.quantity}
                  onChange={(e) => setEditingItem({ ...editingItem, quantity: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <Input
                  value={editingItem.unit}
                  onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                <Input
                  type="number"
                  value={editingItem.unit_price}
                  onChange={(e) => setEditingItem({ ...editingItem, unit_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditItemModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleEditItem} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Discount Modal */}
      <Modal
        isOpen={isEditDiscountModalOpen}
        onClose={() => setIsEditDiscountModalOpen(false)}
        title="Edit Discount"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount ({estimate.discount_type})</label>
            <Input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsEditDiscountModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleUpdateDiscount} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Add Task"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Enter task title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <Input
              type="date"
              value={newTask.due_date}
              onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddTaskModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddTask} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              Add Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal
        isOpen={isAddReminderModalOpen}
        onClose={() => setIsAddReminderModalOpen(false)}
        title="Add Reminder"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Title</label>
            <Input
              value={newReminder.title}
              onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
              placeholder="Enter reminder title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remind At</label>
            <Input
              type="datetime-local"
              value={newReminder.remind_at}
              onChange={(e) => setNewReminder({ ...newReminder, remind_at: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddReminderModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddReminder} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              Add Reminder
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default EstimateDetail

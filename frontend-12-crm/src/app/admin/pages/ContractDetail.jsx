import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { contractsAPI, clientsAPI, companiesAPI } from '../../../api'
import baseUrl from '../../../api/baseUrl'
import { useSettings } from '../../../context/SettingsContext'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
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
  IoEllipsisVertical,
  IoAttach,
  IoMic,
  IoOpenOutline,
  IoMailOutline,
  IoCopy,
  IoCheckmark,
  IoPerson,
  IoLink
} from 'react-icons/io5'

const ContractDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { formatDate, formatCurrency } = useSettings()

  // Get company_id from localStorage
  const [companyId] = useState(() => {
    try {
      const stored = localStorage.getItem('companyId')
      return parseInt(stored || 1, 10)
    } catch (e) {
      console.error('Error accessing localStorage:', e)
      return 1
    }
  })

  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState(null)
  const [client, setClient] = useState(null)
  const [tasks, setTasks] = useState([])
  const [note, setNote] = useState('')
  const [editorContent, setEditorContent] = useState('')

  // Modal states
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

  // Form states
  const [editingItem, setEditingItem] = useState(null)
  const [newItem, setNewItem] = useState({
    item_name: '',
    description: '',
    quantity: 1,
    unit: 'PC',
    unit_price: 0
  })
  const [newTask, setNewTask] = useState({ title: '', due_date: '' })

  // Status options
  const statusOptions = ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired']

  useEffect(() => {
    fetchContract()
  }, [id])

  const fetchContract = async () => {
    try {
      setLoading(true)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchContract:', companyId)
        setLoading(false)
        return
      }
      const response = await contractsAPI.getById(id, { company_id: companyId })
      if (response.data.success) {
        const data = response.data.data
        setContract({
          id: data.id,
          contract_number: data.contract_number || `CONTRACT #${data.id}`,
          title: data.title || data.subject || '--',
          client_id: data.client_id,
          client_name: data.client_name || '--',
          project_id: data.project_id,
          project_name: data.project_name || '--',
          contract_date: data.contract_date || data.start_date || '',
          valid_until: data.valid_until || data.end_date || '--',
          status: (data.status || 'draft').toLowerCase(),
          description: data.description || '',
          note: data.note || '',
          content: data.content || data.contract_content || '',
          currency: data.currency || 'USD',
          sub_total: parseFloat(data.sub_total) || 0,
          discount: parseFloat(data.discount) || 0,
          discount_type: data.discount_type || '%',
          discount_amount: parseFloat(data.discount_amount) || 0,
          tax: data.tax || null,
          second_tax: data.second_tax || null,
          tax_amount: parseFloat(data.tax_amount) || 0,
          total: parseFloat(data.total) || parseFloat(data.amount) || 0,
          items: data.items || [],
          created_by: data.created_by || null,
          signer_name: data.signer_name || data.client_name || null,
          signer_email: data.signer_email || null,
          signed_at: data.signed_at || null,
          email_sent: data.email_sent || false,
        })
        setNote(data.note || '')
        setEditorContent(data.content || data.contract_content || '')

        // Fetch company details
        try {
          const companyResponse = await companiesAPI.getById(companyId)
          if (companyResponse.data && companyResponse.data.success && companyResponse.data.data) {
            setCompany(companyResponse.data.data)
          }
        } catch (err) {
          console.log('Company not found:', err.response?.status)
          setCompany(null)
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
      console.error('Error fetching contract:', error)
    } finally {
      setLoading(false)
    }
  }

  const localFormatDate = (dateString) => {
    if (!dateString || dateString === '--') return '--'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return dateString
    }
  }

  const localFormatCurrency = (amount) => {
    let currencyCode = contract?.currency || 'USD'
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
    if (!contract?.valid_until || contract.valid_until === '--') return false
    const validUntil = new Date(contract.valid_until)
    return validUntil < new Date() && contract.status !== 'accepted'
  }

  const statusColors = {
    draft: 'bg-gray-500 text-white',
    sent: 'bg-sky-400 text-white',
    accepted: 'bg-blue-500 text-white',
    declined: 'bg-red-500 text-white',
    expired: 'bg-orange-500 text-white',
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
        <title>Contract ${contract.contract_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total-row { font-weight: bold; }
          .content { margin-top: 30px; padding: 20px; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CONTRACT</h1>
          <h2>${contract.contract_number}</h2>
          <h3>${contract.title}</h3>
        </div>
        <p><strong>Client:</strong> ${contract.client_name}</p>
        <p><strong>Contract Date:</strong> ${localFormatDate(contract.contract_date)}</p>
        <p><strong>Valid Until:</strong> ${localFormatDate(contract.valid_until)}</p>
        ${contract.items && contract.items.length > 0 ? `
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
              ${contract.items.map(item => `
                <tr>
                  <td>${item.item_name || '-'}</td>
                  <td>${item.quantity || 0} ${item.unit || ''}</td>
                  <td>${localFormatCurrency(item.unit_price || 0)}</td>
                  <td>${localFormatCurrency(item.amount || (item.quantity * item.unit_price) || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3">Total:</td>
                <td>${localFormatCurrency(contract.total)}</td>
              </tr>
            </tfoot>
          </table>
        ` : ''}
        ${editorContent ? `
          <div class="content">
            <h3>Contract Content</h3>
            ${editorContent}
          </div>
        ` : ''}
      </body>
      </html>
    `
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 250)
  }

  const handleViewPDF = () => {
    const pdfUrl = `${baseUrl}/api/v1/contracts/${id}/pdf?company_id=${companyId}`
    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  }

  const handleDownloadPDF = () => {
    const pdfUrl = `${baseUrl}/api/v1/contracts/${id}/pdf?company_id=${companyId}&download=1`
    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  }

  const handleSendEmail = async () => {
    try {
      alert('Email sent successfully!')
      setIsSendEmailModalOpen(false)
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email')
    }
  }

  const handleUpdateStatus = async (newStatus) => {
    try {
      const response = await contractsAPI.updateStatus(id, { status: newStatus }, { company_id: companyId })
      if (response.data.success) {
        await fetchContract()
        setIsStatusModalOpen(false)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const handleAddItem = async () => {
    try {
      const itemData = {
        ...newItem,
        amount: newItem.quantity * newItem.unit_price
      }
      const updatedItems = [...(contract.items || []), itemData]
      const response = await contractsAPI.update(id, { items: updatedItems }, { company_id: companyId })
      if (response.data.success) {
        await fetchContract()
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
      const updatedItems = (contract.items || []).map((item, idx) =>
        idx === editingItem.index ? { ...editingItem, amount: editingItem.quantity * editingItem.unit_price } : item
      )
      const response = await contractsAPI.update(id, { items: updatedItems }, { company_id: companyId })
      if (response.data.success) {
        await fetchContract()
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
      const updatedItems = (contract.items || []).filter((_, idx) => idx !== index)
      const response = await contractsAPI.update(id, { items: updatedItems }, { company_id: companyId })
      if (response.data.success) {
        await fetchContract()
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const handleSaveNote = async () => {
    try {
      const response = await contractsAPI.update(id, { note }, { company_id: companyId })
      if (response.data.success) {
        await fetchContract()
      }
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const handleSaveContent = async () => {
    try {
      const response = await contractsAPI.update(id, { content: editorContent, contract_content: editorContent }, { company_id: companyId })
      if (response.data.success) {
        await fetchContract()
        alert('Content saved successfully!')
      }
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Failed to save content')
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

  const handleCopyPublicUrl = () => {
    const publicUrl = `${window.location.origin}/view/contract/${id}`
    navigator.clipboard.writeText(publicUrl)
    alert('Public contract URL copied to clipboard!')
  }

  // Calculate totals
  const calculateSubTotal = () => {
    return (contract?.items || []).reduce((sum, item) => sum + (item.amount || (item.quantity * item.unit_price) || 0), 0)
  }

  const calculateTotal = () => {
    const subTotal = calculateSubTotal()
    let taxAmount = 0

    if (contract?.tax) {
      const taxRate = parseFloat(contract.tax.match(/\d+/)?.[0] || 0)
      taxAmount += (subTotal * taxRate) / 100
    }
    if (contract?.second_tax) {
      const taxRate = parseFloat(contract.second_tax.match(/\d+/)?.[0] || 0)
      taxAmount += (subTotal * taxRate) / 100
    }

    return subTotal + taxAmount - (contract?.discount_amount || 0)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contract details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (!contract) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Contract Not Found</h2>
          <p className="text-gray-600 mb-4">The contract you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/app/admin/contracts')}>
            <IoArrowBack className="mr-2" />
            Back to Contracts
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
              onClick={() => navigate('/app/admin/contracts')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IoArrowBack size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <IoDocumentText className="text-gray-400" size={20} />
              <span className="text-lg font-semibold text-gray-800">
                {contract.contract_number}: {contract.title}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isExpired() ? statusColors.expired : (statusColors[contract.status] || statusColors.draft)}`}>
              {isExpired() ? 'Expired' : contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
            </span>
            {contract.email_sent && (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <IoMail size={16} /> Email sent
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleCopyPublicUrl}
              className="flex items-center gap-2"
            >
              <IoOpenOutline size={16} />
              Contract URL
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg">
                    {company?.name?.substring(0, 1) || 'C'}
                  </div>
                  <span className="text-3xl font-bold text-blue-600">{company?.name || 'Company'}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-800">{company?.name || 'Company Name'}</p>
                  {company?.address && <p>{company.address}</p>}
                  {company?.city && <p>{company.city}, {company?.state || ''}</p>}
                  {company?.phone && <p>Phone: {company.phone}</p>}
                  {company?.email && <p>Email: {company.email}</p>}
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block bg-gray-900 text-white font-bold text-lg px-4 py-2 mb-3">
                  {contract.contract_number}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Contract date: <span className="font-medium">{localFormatDate(contract.contract_date)}</span></p>
                  <p>Valid until: <span className={`font-medium ${isExpired() ? 'text-red-600' : ''}`}>
                    {localFormatDate(contract.valid_until)} {isExpired() && '(Expired)'}
                  </span></p>
                </div>
              </div>
            </div>

            {/* Client Section */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Client</h3>
              <div className="text-gray-800">
                <p className="font-semibold">{client?.company_name || client?.name || contract.client_name}</p>
                {client?.address && <p className="text-sm text-gray-600">{client.address}</p>}
                {client?.city && <p className="text-sm text-gray-600">{client.city}, {client?.country || ''}</p>}
                {client?.email && <p className="text-sm text-gray-600">{client.email}</p>}
                {client?.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
              </div>
            </div>

            {/* Contract Items Table */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Contract Items</h3>
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
                  {contract.items && contract.items.length > 0 ? (
                    contract.items.map((item, idx) => (
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
                          {localFormatCurrency(item.unit_price || 0)}
                        </td>
                        <td className="p-3 text-right font-semibold text-gray-800">
                          {localFormatCurrency(item.amount || (item.quantity * item.unit_price) || 0)}
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
                    <span className="text-gray-800">{localFormatCurrency(calculateSubTotal())}</span>
                  </div>
                  {contract.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Discount:</span>
                      <span className="text-gray-800">-{localFormatCurrency(contract.discount_amount)}</span>
                    </div>
                  )}
                  {contract.tax && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{contract.tax}:</span>
                      <span className="text-gray-800">
                        {localFormatCurrency((calculateSubTotal() * parseFloat(contract.tax.match(/\d+/)?.[0] || 0)) / 100)}
                      </span>
                    </div>
                  )}
                  {contract.second_tax && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{contract.second_tax}:</span>
                      <span className="text-gray-800">
                        {localFormatCurrency((calculateSubTotal() * parseFloat(contract.second_tax.match(/\d+/)?.[0] || 0)) / 100)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-gray-800">{localFormatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rich Text Editor Section */}
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Contract Content</h3>
                <button
                  onClick={handleSaveContent}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <IoCheckmark size={16} /> Save Content
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg">
                {/* Simple Toolbar */}
                <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50">
                  <button className="p-1.5 hover:bg-gray-200 rounded font-bold text-gray-600">B</button>
                  <button className="p-1.5 hover:bg-gray-200 rounded italic text-gray-600">I</button>
                  <button className="p-1.5 hover:bg-gray-200 rounded underline text-gray-600">U</button>
                  <div className="w-px h-5 bg-gray-300 mx-1"></div>
                  <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600 text-sm">H1</button>
                  <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600 text-sm">H2</button>
                  <div className="w-px h-5 bg-gray-300 mx-1"></div>
                  <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600">
                    <IoAttach size={16} />
                  </button>
                </div>
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  placeholder="Enter contract content here... You can include terms, conditions, scope of work, deliverables, etc."
                  rows={10}
                  className="w-full p-4 outline-none resize-none text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar (30%) */}
        <div className="w-80 space-y-4">
          {/* Contract Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <IoDocumentText className="text-gray-500" size={18} />
                Contract info
              </h3>
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Change status
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                  {(client?.name || contract.client_name || 'C').substring(0, 2).toUpperCase()}
                </div>
                <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                  {client?.name || contract.client_name}
                </span>
              </div>
              {contract.project_name && contract.project_name !== '--' && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <IoBriefcase size={14} />
                  </div>
                  <span className="text-sm text-gray-700">{contract.project_name}</span>
                </div>
              )}
              <div className="text-sm text-gray-600">
                <p className="flex justify-between py-1">
                  <span>Contract date:</span>
                  <span className="font-medium">{localFormatDate(contract.contract_date)}</span>
                </p>
                <p className="flex justify-between py-1">
                  <span>Valid until:</span>
                  <span className={`font-medium ${isExpired() ? 'text-red-600' : ''}`}>
                    {localFormatDate(contract.valid_until)} {isExpired() && '(Expired)'}
                  </span>
                </p>
                <p className="flex justify-between py-1">
                  <span>Total:</span>
                  <span className="font-medium">{localFormatCurrency(calculateTotal())}</span>
                </p>
                <p className="flex justify-between py-1">
                  <span>Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isExpired() ? statusColors.expired : (statusColors[contract.status] || statusColors.draft)}`}>
                    {isExpired() ? 'Expired' : contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
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

          {/* Signer Info Section */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <IoPerson className="text-gray-500" size={18} />
                Signer (Client)
              </h3>
            </div>
            <div className="space-y-2">
              {contract.signer_name ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold">
                      {contract.signer_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{contract.signer_name}</p>
                      {contract.signer_email && (
                        <p className="text-xs text-gray-500">{contract.signer_email}</p>
                      )}
                    </div>
                  </div>
                  {contract.signed_at ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                      <IoCheckmarkCircle size={16} />
                      <span>Signed on {localFormatDate(contract.signed_at)}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-yellow-600 mt-2">Awaiting signature</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 italic">No signer assigned yet</p>
              )}
            </div>
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
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Contract Preview"
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-center border-b pb-4">
            <h2 className="text-2xl font-bold">CONTRACT</h2>
            <p className="text-xl text-gray-600">{contract.contract_number}</p>
            <p className="text-lg text-gray-700">{contract.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Client:</strong> {contract.client_name}</p>
              <p><strong>Contract Date:</strong> {localFormatDate(contract.contract_date)}</p>
            </div>
            <div>
              <p><strong>Valid Until:</strong> {localFormatDate(contract.valid_until)}</p>
              <p><strong>Status:</strong> {contract.status}</p>
            </div>
          </div>
          {contract.items && contract.items.length > 0 && (
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
                {contract.items.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{item.item_name}</td>
                    <td className="p-2 text-right">{item.quantity}</td>
                    <td className="p-2 text-right">{localFormatCurrency(item.unit_price)}</td>
                    <td className="p-2 text-right">{localFormatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td colSpan="3" className="p-2 text-right">Total:</td>
                  <td className="p-2 text-right">{localFormatCurrency(calculateTotal())}</td>
                </tr>
              </tfoot>
            </table>
          )}
          {editorContent && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Contract Content:</h3>
              <div className="prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: editorContent.replace(/\n/g, '<br/>') }} />
            </div>
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
        title="Send Contract to Client"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Send this contract to <strong>{client?.email || contract.client_name}</strong>?
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

      {/* Status Change Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Change Contract Status"
      >
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">Select new status for this contract:</p>
          <div className="grid grid-cols-2 gap-3">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleUpdateStatus(status)}
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  contract.status.toLowerCase() === status.toLowerCase()
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
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
    </div>
  )
}

export default ContractDetail

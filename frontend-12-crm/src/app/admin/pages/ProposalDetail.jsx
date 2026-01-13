import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { proposalsAPI, clientsAPI, projectsAPI, itemsAPI, tasksAPI, notificationsAPI } from '../../../api'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import RichTextEditor from '../../../components/ui/RichTextEditor'
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
  IoLink,
  IoSend,
  IoEllipsisVertical,
  IoStorefront,
  IoCheckmark,
  IoAlertCircle,
  IoBookmark,
  IoList,
  IoNotifications,
  IoSettings,
  IoChevronDown
} from 'react-icons/io5'
import { FaAnchor } from 'react-icons/fa'

const ProposalDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [proposal, setProposal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false)
  const [isEditDiscountModalOpen, setIsEditDiscountModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isAddReminderModalOpen, setIsAddReminderModalOpen] = useState(false)
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false)
  const [selectedItemIndex, setSelectedItemIndex] = useState(null)
  const [items, setItems] = useState([])
  const [itemSearchQuery, setItemSearchQuery] = useState('')
  const [itemCategoryFilter, setItemCategoryFilter] = useState('')
  const [editItemData, setEditItemData] = useState({})
  const [discountData, setDiscountData] = useState({ discount: 0, discount_type: '%' })
  const [taskData, setTaskData] = useState({ title: '', description: '', due_date: '', priority: 'Medium' })
  const [reminderData, setReminderData] = useState({ title: '', description: '', reminder_date: '', reminder_time: '' })
  const [emailData, setEmailData] = useState({ to: '', subject: '', message: '' })
  const [tasks, setTasks] = useState([])
  const [reminders, setReminders] = useState([])
  const [noteContent, setNoteContent] = useState('')
  const [descriptionContent, setDescriptionContent] = useState('')
  const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
  const userId = parseInt(localStorage.getItem('userId') || 1, 10)

  useEffect(() => {
    fetchProposal()
    fetchItems()
  }, [id])

  useEffect(() => {
    if (proposal) {
      fetchTasks()
      fetchReminders()
      setNoteContent(proposal.note || '')
      setDescriptionContent(proposal.description || '')
    }
  }, [proposal?.id])

  const fetchTasks = async () => {
    try {
      const params = { company_id: companyId }
      if (proposal?.client_id) params.client_id = proposal.client_id
      if (proposal?.project_id) params.project_id = proposal.project_id
      const response = await tasksAPI.getAll(params)
      if (response.data.success) {
        setTasks((response.data.data || []).slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const fetchReminders = async () => {
    try {
      const response = await notificationsAPI.getAll({
        user_id: userId,
        company_id: companyId,
        type: 'reminder',
        related_entity_type: 'proposal',
        related_entity_id: id
      })
      if (response.data.success) {
        setReminders(response.data.data || [])
      }
    } catch (error) {
      setReminders([])
    }
  }

  const fetchItems = async () => {
    try {
      const params = { company_id: companyId }
      if (itemCategoryFilter) params.category = itemCategoryFilter
      const response = await itemsAPI.getAll(params)
      if (response.data.success) {
        setItems(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const fetchProposal = async () => {
    try {
      setLoading(true)
      const response = await proposalsAPI.getById(id, { company_id: companyId })
      if (response.data.success) {
        const data = response.data.data
        setProposal({
          id: data.id,
          estimate_number: data.estimate_number || `PROPOSAL #${data.id}`,
          client_id: data.client_id,
          client_name: data.client_name || 'No Client',
          project_id: data.project_id,
          project_name: data.project_name || '',
          proposal_date: data.created_at || data.proposal_date || '',
          valid_till: data.valid_till || '',
          status: data.status || 'draft',
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
          last_email_seen: data.last_email_seen || null,
          last_preview_seen: data.last_preview_seen || null,
          email_sent_at: data.email_sent_at || null,
          signer_name: data.signer_name || '',
          signer_email: data.signer_email || '',
        })
      }
    } catch (error) {
      console.error('Error fetching proposal:', error)
    } finally {
      setLoading(false)
    }
  }

  // Format helpers
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: proposal?.currency || 'USD'
    }).format(amount || 0)
  }

  const isExpired = () => {
    if (!proposal?.valid_till) return false
    return new Date(proposal.valid_till) < new Date()
  }

  const getEmailStatus = () => {
    if (proposal?.last_email_seen) return 'Viewed'
    if (proposal?.email_sent_at) return 'Sent'
    return 'Never'
  }

  // Status colors
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-600 text-white',
      sent: 'bg-green-500 text-white',
      accepted: 'bg-emerald-500 text-white',
      declined: 'bg-red-500 text-white',
      expired: 'bg-red-600 text-white',
    }
    return colors[status] || 'bg-gray-500 text-white'
  }

  // Handlers
  const handleSave = async () => {
    try {
      const response = await proposalsAPI.update(id, {
        note: noteContent,
        description: descriptionContent,
      })
      if (response.data.success) {
        alert('Proposal saved successfully!')
        await fetchProposal()
      } else {
        alert(response.data.error || 'Failed to save proposal')
      }
    } catch (error) {
      console.error('Error saving proposal:', error)
      alert(error.response?.data?.error || 'Failed to save proposal')
    }
  }

  const handleSaveAndShow = async () => {
    await handleSave()
    setIsPreviewModalOpen(true)
  }

  const handleCopyProposalURL = () => {
    const publicUrl = `${window.location.origin}/public/proposals/${id}`
    navigator.clipboard.writeText(publicUrl).then(() => {
      alert('Proposal URL copied to clipboard!')
    }).catch(() => {
      prompt('Copy this URL:', publicUrl)
    })
  }

  const handleSendToClient = () => {
    setEmailData({
      to: proposal?.signer_email || '',
      subject: `Proposal ${proposal?.estimate_number}`,
      message: 'Please review the attached proposal.'
    })
    setIsSendEmailModalOpen(true)
  }

  const handleSendEmail = async () => {
    try {
      if (!emailData.to) {
        alert('Please enter recipient email')
        return
      }
      const response = await proposalsAPI.sendEmail(id, emailData)
      if (response.data.success) {
        alert('Proposal sent successfully!')
        setIsSendEmailModalOpen(false)
        await fetchProposal()
      } else {
        alert(response.data.error || 'Failed to send proposal')
      }
    } catch (error) {
      console.error('Error sending proposal:', error)
      alert(error.response?.data?.error || 'Failed to send proposal')
    }
  }

  const handleAddItemFromModal = async (item) => {
    try {
      const currentItems = proposal.items || []
      const newItem = {
        item_name: item.title || '',
        description: item.description || '',
        quantity: 1,
        unit: item.unit_type || 'PC',
        unit_price: parseFloat(item.rate || 0),
        tax_rate: 0,
        amount: parseFloat(item.rate || 0)
      }
      const updatedItems = [...currentItems, newItem]

      const response = await proposalsAPI.update(id, {
        items: updatedItems.map(item => ({
          item_name: item.item_name || item.description || '',
          description: item.description || '',
          quantity: parseFloat(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          tax_rate: parseFloat(item.tax_rate) || 0,
          amount: parseFloat(item.amount) || 0,
        }))
      })

      if (response.data.success) {
        setIsAddItemModalOpen(false)
        await fetchProposal()
      } else {
        alert(response.data.error || 'Failed to add item')
      }
    } catch (error) {
      console.error('Error adding item:', error)
      alert(error.response?.data?.error || 'Failed to add item')
    }
  }

  const handleRemoveItem = async (itemIndex) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return

    try {
      const currentItems = proposal.items || []
      const updatedItems = currentItems.filter((_, index) => index !== itemIndex)

      const response = await proposalsAPI.update(id, {
        items: updatedItems.map(item => ({
          item_name: item.item_name || item.description || '',
          description: item.description || '',
          quantity: parseFloat(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          tax_rate: parseFloat(item.tax_rate) || 0,
          amount: parseFloat(item.amount) || 0,
        }))
      })

      if (response.data.success) {
        await fetchProposal()
      } else {
        alert(response.data.error || 'Failed to remove item')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      alert(error.response?.data?.error || 'Failed to remove item')
    }
  }

  const handleEditItem = (itemIndex) => {
    const item = proposal.items[itemIndex]
    setSelectedItemIndex(itemIndex)
    setEditItemData({
      item_name: item.item_name || '',
      description: item.description || '',
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      tax_rate: item.tax_rate || 0,
      amount: item.amount || 0
    })
    setIsEditItemModalOpen(true)
  }

  const handleUpdateItem = async () => {
    try {
      const currentItems = [...proposal.items]
      const quantity = parseFloat(editItemData.quantity || 0)
      const unitPrice = parseFloat(editItemData.unit_price || 0)
      const taxRate = parseFloat(editItemData.tax_rate || 0)
      let amount = quantity * unitPrice
      if (taxRate > 0) amount += (amount * taxRate / 100)

      currentItems[selectedItemIndex] = {
        ...currentItems[selectedItemIndex],
        item_name: editItemData.item_name,
        description: editItemData.description,
        quantity: quantity,
        unit_price: unitPrice,
        tax_rate: taxRate,
        amount: amount
      }

      const response = await proposalsAPI.update(id, {
        items: currentItems.map(item => ({
          item_name: item.item_name || item.description || '',
          description: item.description || '',
          quantity: parseFloat(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          tax_rate: parseFloat(item.tax_rate) || 0,
          amount: parseFloat(item.amount) || 0,
        }))
      })

      if (response.data.success) {
        setIsEditItemModalOpen(false)
        setSelectedItemIndex(null)
        await fetchProposal()
      } else {
        alert(response.data.error || 'Failed to update item')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      alert(error.response?.data?.error || 'Failed to update item')
    }
  }

  const handleEditDiscount = () => {
    setDiscountData({
      discount: proposal.discount || 0,
      discount_type: proposal.discount_type || '%'
    })
    setIsEditDiscountModalOpen(true)
  }

  const handleUpdateDiscount = async () => {
    try {
      const subTotal = proposal.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
      const discount = parseFloat(discountData.discount) || 0
      const discountAmount = discountData.discount_type === '%'
        ? (subTotal * discount / 100)
        : discount
      const totalAfterDiscount = subTotal - discountAmount
      const taxAmount = proposal.items.reduce((sum, item) => {
        const quantity = parseFloat(item.quantity || 0)
        const unitPrice = parseFloat(item.unit_price || 0)
        const taxRate = parseFloat(item.tax_rate || 0)
        return sum + (quantity * unitPrice * taxRate / 100)
      }, 0)
      const total = totalAfterDiscount + taxAmount

      const response = await proposalsAPI.update(id, {
        discount: discount,
        discount_type: discountData.discount_type,
        discount_amount: discountAmount,
        sub_total: subTotal,
        tax_amount: taxAmount,
        total: total
      })

      if (response.data.success) {
        setIsEditDiscountModalOpen(false)
        await fetchProposal()
      } else {
        alert(response.data.error || 'Failed to update discount')
      }
    } catch (error) {
      console.error('Error updating discount:', error)
      alert(error.response?.data?.error || 'Failed to update discount')
    }
  }

  const handlePrint = () => {
    if (!proposal) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow popups to print')
      return
    }

    const subtotal = proposal.items?.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) || 0
    const discountAmount = proposal.discount_type === '%'
      ? (subtotal * (parseFloat(proposal.discount) || 0) / 100)
      : (parseFloat(proposal.discount) || 0)
    const taxAmount = proposal.items?.reduce((sum, item) => {
      const itemAmount = parseFloat(item.amount) || 0
      const taxRate = parseFloat(item.tax_rate) || 0
      return sum + (itemAmount * taxRate / 100)
    }, 0) || 0
    const total = subtotal - discountAmount + taxAmount

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Proposal ${proposal.estimate_number || proposal.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .company-info, .client-info { width: 45%; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .text-right { text-align: right; }
          .totals { margin-top: 20px; }
          .totals table { width: 300px; margin-left: auto; }
          .totals td { border: none; padding: 5px 10px; }
          .totals .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PROPOSAL</h1>
          <p><strong>${proposal.estimate_number || `PROP#${proposal.id}`}</strong></p>
        </div>
        <div class="info-section">
          <div class="company-info">
            <h3>From:</h3>
            <p><strong>${proposal.company_name || 'Company Name'}</strong></p>
          </div>
          <div class="client-info">
            <h3>To:</h3>
            <p><strong>${proposal.client_name || '-'}</strong></p>
          </div>
        </div>
        <div style="margin-bottom: 20px;">
          <p><strong>Valid Until:</strong> ${formatDate(proposal.valid_till)}</p>
          <p><strong>Status:</strong> ${(proposal.status || 'draft').toUpperCase()}</p>
        </div>
        ${proposal.description ? `<div style="margin-bottom: 20px;"><p>${proposal.description}</p></div>` : ''}
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Rate</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(proposal.items || []).map(item => `
              <tr>
                <td>${item.item_name || '-'}</td>
                <td>${item.description || '-'}</td>
                <td class="text-right">${item.quantity || 1} ${item.unit || 'PC'}</td>
                <td class="text-right">${formatCurrency(item.unit_price || 0)}</td>
                <td class="text-right">${formatCurrency(item.amount || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="totals">
          <table>
            <tr><td>Sub Total:</td><td class="text-right">${formatCurrency(subtotal)}</td></tr>
            ${discountAmount > 0 ? `<tr><td>Discount:</td><td class="text-right">-${formatCurrency(discountAmount)}</td></tr>` : ''}
            ${taxAmount > 0 ? `<tr><td>Tax:</td><td class="text-right">${formatCurrency(taxAmount)}</td></tr>` : ''}
            <tr class="total-row"><td>Total:</td><td class="text-right">${formatCurrency(total)}</td></tr>
          </table>
        </div>
        ${proposal.terms ? `<div style="margin-top: 30px;"><h3>Terms & Conditions:</h3><p>${proposal.terms}</p></div>` : ''}
      </body>
      </html>
    `
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 250)
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await proposalsAPI.getPDF(id, { company_id: companyId, download: 1 })
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `proposal-${proposal?.estimate_number || id}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF')
    }
  }

  const handleViewPDF = () => {
    const pdfUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/proposals/${id}/pdf?company_id=${companyId}`
    window.open(pdfUrl, '_blank')
  }

  const handleAddTask = async () => {
    try {
      if (!taskData.title) {
        alert('Task title is required')
        return
      }

      const taskPayload = {
        company_id: companyId,
        title: taskData.title,
        description: taskData.description || '',
        due_date: taskData.due_date || null,
        priority: taskData.priority || 'Medium',
        status: 'To do',
        project_id: proposal?.project_id || null,
        client_id: proposal?.client_id || null,
        user_id: userId
      }

      const response = await tasksAPI.create(taskPayload, { company_id: companyId })
      if (response.data.success) {
        alert('Task created successfully!')
        setIsAddTaskModalOpen(false)
        setTaskData({ title: '', description: '', due_date: '', priority: 'Medium' })
        await fetchTasks()
      } else {
        alert(response.data.error || 'Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert(error.response?.data?.error || 'Failed to create task')
    }
  }

  const handleAddReminder = async () => {
    try {
      if (!reminderData.title) {
        alert('Reminder title is required')
        return
      }

      let reminderMessage = reminderData.description || `Reminder for proposal ${proposal?.estimate_number || id}`
      if (reminderData.reminder_date) {
        const reminderDate = formatDate(reminderData.reminder_date)
        const reminderTime = reminderData.reminder_time || ''
        const dateTimeStr = reminderTime ? `${reminderDate} at ${reminderTime}` : reminderDate
        reminderMessage = `${reminderMessage}\n\nDue: ${dateTimeStr}`
      }

      const reminderPayload = {
        company_id: companyId,
        user_id: userId,
        type: 'reminder',
        title: reminderData.title,
        message: reminderMessage,
        related_entity_type: 'proposal',
        related_entity_id: parseInt(id),
        created_by: userId
      }

      const response = await notificationsAPI.create(reminderPayload)
      if (response.data.success) {
        alert('Reminder created successfully!')
        setIsAddReminderModalOpen(false)
        setReminderData({ title: '', description: '', reminder_date: '', reminder_time: '' })
        await fetchReminders()
      } else {
        alert(response.data.error || 'Failed to create reminder')
      }
    } catch (error) {
      console.error('Error creating reminder:', error)
      alert(error.response?.data?.error || 'Failed to create reminder')
    }
  }

  const handleChangeTemplate = () => {
    navigate('/app/admin/finance-templates')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F9FA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-accent mx-auto mb-4"></div>
          <p className="text-secondary-text">Loading proposal...</p>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F9FA]">
        <div className="text-center">
          <IoAlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-secondary-text">Proposal not found</p>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/app/admin/proposals')}>
            Back to Proposals
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left Side */}
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/app/admin/proposals')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Proposals"
            >
              <IoArrowBack size={20} />
            </button>

            <div className="flex items-center gap-2">
              <FaAnchor className="text-gray-600" size={20} />
              <h1 className="text-xl sm:text-2xl font-bold text-primary-text">
                {proposal.estimate_number}
              </h1>
            </div>

            {/* Status Badge */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(isExpired() ? 'expired' : proposal.status)}`}>
              {isExpired() ? 'Expired' : proposal.status?.charAt(0).toUpperCase() + proposal.status?.slice(1) || 'Draft'}
            </span>

            {/* Email Status */}
            <div className="flex items-center gap-1 text-sm text-secondary-text">
              <IoMail size={16} />
              <span>{getEmailStatus()}</span>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyProposalURL}
              className="flex items-center gap-2 hover:bg-gray-100"
            >
              <IoLink size={16} />
              <span className="hidden sm:inline">Proposal URL</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSendToClient}
              className="flex items-center gap-2"
            >
              <IoSend size={16} />
              <span className="hidden sm:inline">Send to client</span>
            </Button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT SIDE - 70% */}
          <div className="flex-1 lg:w-[70%] space-y-6">

            {/* Proposal Items Section */}
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-primary-text flex items-center gap-2">
                  <IoList size={20} />
                  Proposal items
                </h3>
                <IoChevronDown size={20} className="text-gray-400" />
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-2/5">Item</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/6">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/6">Rate</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/6">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {proposal.items && proposal.items.length > 0 ? (
                      proposal.items.map((item, idx) => (
                        <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-primary-text">{item.item_name || '-'}</p>
                              {item.description && (
                                <p className="text-xs text-secondary-text mt-1">{item.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-primary-text whitespace-nowrap">
                            {item.quantity || 0} {item.unit || 'PC'}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-primary-text whitespace-nowrap">
                            {formatCurrency(item.unit_price || 0)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-primary-text whitespace-nowrap">
                            {formatCurrency(item.amount || 0)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                onClick={() => handleEditItem(idx)}
                                title="Edit"
                              >
                                <IoCreate size={16} />
                              </button>
                              <button
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                onClick={() => handleRemoveItem(idx)}
                                title="Remove"
                              >
                                <IoClose size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-secondary-text">
                          No items added yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Item Button */}
              <div className="p-4 border-t border-gray-200">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddItemModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <IoAdd size={16} />
                  Add item
                </Button>
              </div>
            </Card>

            {/* Totals Section */}
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-text">Sub Total:</span>
                  <span className="font-semibold text-primary-text">{formatCurrency(proposal.sub_total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-text flex items-center gap-2">
                    Discount:
                    <button
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      onClick={handleEditDiscount}
                      title="Edit Discount"
                    >
                      <IoCreate size={14} />
                    </button>
                  </span>
                  <span className="font-semibold text-red-500">
                    -{formatCurrency(proposal.discount_amount)}
                  </span>
                </div>
                {proposal.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-text">Tax:</span>
                    <span className="font-semibold text-primary-text">{formatCurrency(proposal.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-gray-300">
                  <span className="text-lg font-bold text-primary-text">Total:</span>
                  <span className="text-lg font-bold text-green-600">{formatCurrency(proposal.total)}</span>
                </div>
              </div>
            </Card>

            {/* Description / Notes Editor */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-primary-text mb-4">Description</h3>
              <RichTextEditor
                value={descriptionContent}
                onChange={setDescriptionContent}
                placeholder="Write your proposal description here..."
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleChangeTemplate}
                  className="flex items-center gap-2"
                >
                  <IoSettings size={16} />
                  Change template
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <IoCheckmarkCircle size={16} />
                  Save
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveAndShow}
                  className="flex items-center gap-2"
                >
                  <IoEye size={16} />
                  Save & show
                </Button>
              </div>
            </Card>
          </div>

          {/* RIGHT SIDEBAR - 30% */}
          <div className="lg:w-[30%] space-y-6">

            {/* Proposal Info */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-primary-text flex items-center gap-2">
                  <FaAnchor size={14} />
                  Proposal info
                </h3>
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <IoEllipsisVertical size={16} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <IoBriefcase size={16} className="text-secondary-text" />
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    {proposal.client_name}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-text">
                  <IoCalendar size={16} />
                  <span>Proposal date: {formatDate(proposal.proposal_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <IoTime size={16} className={isExpired() ? 'text-red-500' : 'text-secondary-text'} />
                  <span className={isExpired() ? 'text-red-500 font-medium' : 'text-secondary-text'}>
                    Valid until: {formatDate(proposal.valid_till)} {isExpired() && '(Expired)'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Action Buttons Grid */}
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="flex items-center justify-center gap-2 hover:bg-gray-100"
                >
                  <IoEye size={16} />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 hover:bg-gray-100"
                >
                  <IoPrint size={16} />
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewPDF}
                  className="flex items-center justify-center gap-2 hover:bg-gray-100"
                >
                  <IoDocumentText size={16} />
                  View PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center gap-2 hover:bg-gray-100"
                >
                  <IoDownload size={16} />
                  Download
                </Button>
              </div>
            </Card>

            {/* Note Section */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <IoBookmark size={16} className="text-secondary-text" />
                <h3 className="text-sm font-semibold text-primary-text">Note</h3>
              </div>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add internal notes here..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none text-sm"
              />
            </Card>

            {/* Tasks Section */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <IoCheckmarkCircle size={16} className="text-secondary-text" />
                  <h3 className="text-sm font-semibold text-primary-text">Tasks</h3>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="flex items-center gap-1 text-xs px-2 py-1"
                >
                  <IoAdd size={14} />
                  Add task
                </Button>
              </div>

              {tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                      <input type="checkbox" className="rounded" />
                      <span className="flex-1 truncate">{task.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-secondary-text italic">No tasks yet</p>
              )}
            </Card>

            {/* Reminders Section */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <IoNotifications size={16} className="text-secondary-text" />
                  <h3 className="text-sm font-semibold text-primary-text">Reminders (Private)</h3>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddReminderModalOpen(true)}
                  className="flex items-center gap-1 text-xs px-2 py-1"
                >
                  <IoAdd size={14} />
                  Add reminder
                </Button>
              </div>

              {reminders.length > 0 ? (
                <div className="space-y-2">
                  {reminders.map((reminder, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                      <IoNotifications size={14} className="text-yellow-500" />
                      <span className="flex-1 truncate">{reminder.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-secondary-text italic">No reminders yet</p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* MODALS */}

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add Items to Proposal"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search items..."
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
              />
            </div>
            <select
              value={itemCategoryFilter}
              onChange={(e) => setItemCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
            >
              <option value="">All Categories</option>
              {[...new Set(items.map(item => item.category).filter(Boolean))].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {(() => {
            const filteredItems = items.filter(item => {
              const matchesSearch = !itemSearchQuery ||
                item.title?.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(itemSearchQuery.toLowerCase())
              const matchesCategory = !itemCategoryFilter || item.category === itemCategoryFilter
              return matchesSearch && matchesCategory
            })

            return filteredItems.length === 0 ? (
              <div className="text-center py-8 text-secondary-text">
                <p>No items found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className="p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary-accent"
                    onClick={() => handleAddItemFromModal(item)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IoStorefront size={20} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-primary-text text-sm truncate">{item.title}</h3>
                        <p className="text-primary-accent font-bold text-sm">
                          ${parseFloat(item.rate || 0).toFixed(2)}
                          <span className="text-gray-400 font-normal text-xs">/{item.unit_type || 'PC'}</span>
                        </p>
                        <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                          <IoCheckmark size={12} />
                          <span>Click to add</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          })()}

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setIsAddItemModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={isEditItemModalOpen}
        onClose={() => { setIsEditItemModalOpen(false); setSelectedItemIndex(null) }}
        title="Edit Item"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Item Name"
            value={editItemData.item_name || ''}
            onChange={(e) => setEditItemData({ ...editItemData, item_name: e.target.value })}
            placeholder="Item name"
          />
          <Input
            label="Description"
            value={editItemData.description || ''}
            onChange={(e) => setEditItemData({ ...editItemData, description: e.target.value })}
            placeholder="Description"
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Quantity"
              type="number"
              value={editItemData.quantity || 1}
              onChange={(e) => {
                const qty = parseFloat(e.target.value) || 0
                const unitPrice = parseFloat(editItemData.unit_price || 0)
                const taxRate = parseFloat(editItemData.tax_rate || 0)
                let amount = qty * unitPrice
                if (taxRate > 0) amount += (amount * taxRate / 100)
                setEditItemData({ ...editItemData, quantity: qty, amount })
              }}
              min="0"
            />
            <Input
              label="Unit Price"
              type="number"
              value={editItemData.unit_price || 0}
              onChange={(e) => {
                const price = parseFloat(e.target.value) || 0
                const qty = parseFloat(editItemData.quantity || 0)
                const taxRate = parseFloat(editItemData.tax_rate || 0)
                let amount = qty * price
                if (taxRate > 0) amount += (amount * taxRate / 100)
                setEditItemData({ ...editItemData, unit_price: price, amount })
              }}
              min="0"
              step="0.01"
            />
            <Input
              label="Tax %"
              type="number"
              value={editItemData.tax_rate || 0}
              onChange={(e) => {
                const tax = parseFloat(e.target.value) || 0
                const qty = parseFloat(editItemData.quantity || 0)
                const unitPrice = parseFloat(editItemData.unit_price || 0)
                let amount = qty * unitPrice
                if (tax > 0) amount += (amount * tax / 100)
                setEditItemData({ ...editItemData, tax_rate: tax, amount })
              }}
              min="0"
            />
          </div>
          <div className="text-right">
            <span className="text-sm text-secondary-text">Amount: </span>
            <span className="font-semibold text-primary-text">{formatCurrency(editItemData.amount || 0)}</span>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => { setIsEditItemModalOpen(false); setSelectedItemIndex(null) }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateItem}>
              Update Item
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Discount Modal */}
      <Modal
        isOpen={isEditDiscountModalOpen}
        onClose={() => setIsEditDiscountModalOpen(false)}
        title="Edit Discount"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Discount"
              type="number"
              value={discountData.discount || 0}
              onChange={(e) => setDiscountData({ ...discountData, discount: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
            />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Type</label>
              <select
                value={discountData.discount_type}
                onChange={(e) => setDiscountData({ ...discountData, discount_type: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="%">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setIsEditDiscountModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleUpdateDiscount}>Update Discount</Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={`Preview: ${proposal?.estimate_number}`}
        size="xl"
      >
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-primary-text">{proposal.estimate_number}</h2>
                <p className="text-sm text-secondary-text mt-1">Client: {proposal.client_name}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                {proposal.status}
              </span>
            </div>
          </div>

          {proposal.description && (
            <div>
              <h3 className="font-semibold text-primary-text mb-2">Description</h3>
              <div className="text-secondary-text" dangerouslySetInnerHTML={{ __html: proposal.description }} />
            </div>
          )}

          {proposal.items && proposal.items.length > 0 && (
            <div>
              <h3 className="font-semibold text-primary-text mb-3">Items</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-secondary-text">Item</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-secondary-text">Qty</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-secondary-text">Rate</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-secondary-text">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {proposal.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-primary-text">{item.item_name || '-'}</td>
                        <td className="px-4 py-2 text-right text-primary-text">{item.quantity || 0}</td>
                        <td className="px-4 py-2 text-right text-primary-text">{formatCurrency(item.unit_price || 0)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-primary-text">{formatCurrency(item.amount || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-secondary-text">Sub Total:</span><span className="font-semibold">{formatCurrency(proposal.sub_total)}</span></div>
              {proposal.discount_amount > 0 && <div className="flex justify-between"><span className="text-secondary-text">Discount:</span><span className="font-semibold text-red-500">-{formatCurrency(proposal.discount_amount)}</span></div>}
              {proposal.tax_amount > 0 && <div className="flex justify-between"><span className="text-secondary-text">Tax:</span><span className="font-semibold">{formatCurrency(proposal.tax_amount)}</span></div>}
              <div className="flex justify-between pt-2 border-t border-gray-300"><span className="text-lg font-bold">Total:</span><span className="text-lg font-bold text-green-600">{formatCurrency(proposal.total)}</span></div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>Close</Button>
            <Button variant="primary" onClick={handlePrint}><IoPrint size={16} className="mr-2" />Print</Button>
            <Button variant="primary" onClick={handleDownloadPDF}><IoDownload size={16} className="mr-2" />Download</Button>
          </div>
        </div>
      </Modal>

      {/* Send Email Modal */}
      <Modal
        isOpen={isSendEmailModalOpen}
        onClose={() => setIsSendEmailModalOpen(false)}
        title="Send Proposal to Client"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="To Email"
            type="email"
            value={emailData.to}
            onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
            placeholder="client@example.com"
            required
          />
          <Input
            label="Subject"
            value={emailData.subject}
            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
            placeholder="Email subject"
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Message</label>
            <textarea
              value={emailData.message}
              onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
              placeholder="Email message..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setIsSendEmailModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSendEmail}><IoSend size={16} className="mr-2" />Send</Button>
          </div>
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => { setIsAddTaskModalOpen(false); setTaskData({ title: '', description: '', due_date: '', priority: 'Medium' }) }}
        title="Add Task"
        size="md"
      >
        <div className="space-y-4">
          <Input label="Task Title" value={taskData.title} onChange={(e) => setTaskData({ ...taskData, title: e.target.value })} placeholder="Enter task title" required />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Description</label>
            <textarea value={taskData.description} onChange={(e) => setTaskData({ ...taskData, description: e.target.value })} placeholder="Task description" rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Due Date" type="date" value={taskData.due_date} onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Priority</label>
              <select value={taskData.priority} onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => { setIsAddTaskModalOpen(false); setTaskData({ title: '', description: '', due_date: '', priority: 'Medium' }) }}>Cancel</Button>
            <Button variant="primary" onClick={handleAddTask}>Add Task</Button>
          </div>
        </div>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal
        isOpen={isAddReminderModalOpen}
        onClose={() => { setIsAddReminderModalOpen(false); setReminderData({ title: '', description: '', reminder_date: '', reminder_time: '' }) }}
        title="Add Reminder"
        size="md"
      >
        <div className="space-y-4">
          <Input label="Reminder Title" value={reminderData.title} onChange={(e) => setReminderData({ ...reminderData, title: e.target.value })} placeholder="Enter reminder title" required />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Description</label>
            <textarea value={reminderData.description} onChange={(e) => setReminderData({ ...reminderData, description: e.target.value })} placeholder="Reminder description" rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={reminderData.reminder_date} onChange={(e) => setReminderData({ ...reminderData, reminder_date: e.target.value })} />
            <Input label="Time" type="time" value={reminderData.reminder_time} onChange={(e) => setReminderData({ ...reminderData, reminder_time: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => { setIsAddReminderModalOpen(false); setReminderData({ title: '', description: '', reminder_date: '', reminder_time: '' }) }}>Cancel</Button>
            <Button variant="primary" onClick={handleAddReminder}>Add Reminder</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProposalDetail

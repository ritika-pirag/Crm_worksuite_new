import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { proposalsAPI, clientsAPI, projectsAPI, itemsAPI, tasksAPI, notificationsAPI } from '../../../api'
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
  IoStorefront,
  IoCheckmark,
  IoRemove
} from 'react-icons/io5'

const ProposalDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [proposal, setProposal] = useState(null)
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isAddReminderModalOpen, setIsAddReminderModalOpen] = useState(false)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false)
  const [isEditDiscountModalOpen, setIsEditDiscountModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedItemIndex, setSelectedItemIndex] = useState(null)
  const [items, setItems] = useState([])
  const [itemSearchQuery, setItemSearchQuery] = useState('')
  const [itemCategoryFilter, setItemCategoryFilter] = useState('')
  const [editItemData, setEditItemData] = useState({})
  const [discountData, setDiscountData] = useState({ discount: 0, discount_type: '%' })
  const [taskData, setTaskData] = useState({ title: '', description: '', due_date: '', priority: 'Medium' })
  const [reminderData, setReminderData] = useState({ title: '', description: '', reminder_date: '', reminder_time: '' })
  const [tasks, setTasks] = useState([])
  const [reminders, setReminders] = useState([])
  const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
  const userId = parseInt(localStorage.getItem('userId') || 1, 10)
  
  const [formData, setFormData] = useState({
    note: '',
    signer_name: '',
    signer_email: '',
  })

  useEffect(() => {
    fetchProposal()
    fetchProposals()
    fetchItems()
    fetchTasks()
    fetchReminders()
  }, [id])

  useEffect(() => {
    fetchItems()
  }, [itemCategoryFilter])

  const fetchTasks = async () => {
    try {
      // Fetch tasks related to this proposal's client or project
      const params = { company_id: companyId }
      if (proposal?.client_id) {
        params.client_id = proposal.client_id
      }
      if (proposal?.project_id) {
        params.project_id = proposal.project_id
      }
      const response = await tasksAPI.getAll(params)
      if (response.data.success) {
        // Filter tasks that might be related to this proposal
        const allTasks = response.data.data || []
        setTasks(allTasks.slice(0, 5)) // Show recent 5 tasks
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const fetchReminders = async () => {
    try {
      // Fetch reminders (notifications with type='reminder') for this proposal
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
      // Silently handle error - reminders feature may not be implemented yet
      console.log('Reminders feature not available')
      setReminders([])
    }
  }

  const fetchItems = async () => {
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
  }

  const fetchProposal = async () => {
    try {
      setLoading(true)
      const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
      const response = await proposalsAPI.getById(id, { company_id: companyId })
      if (response.data.success) {
        const data = response.data.data
        const proposalData = {
          id: data.id,
          estimate_number: data.estimate_number || `PROPOSAL #${data.id}`,
          client_id: data.client_id,
          client_name: data.client_name || '--',
          project_id: data.project_id,
          project_name: data.project_name || '--',
          proposal_date: data.created_at || data.proposal_date || '',
          valid_till: data.valid_till || '--',
          status: data.status || 'draft',
          description: data.description || '',
          note: data.note || '',
          terms: data.terms || '',
          currency: data.currency || 'USD',
          sub_total: parseFloat(data.sub_total) || 0,
          discount_amount: parseFloat(data.discount_amount) || 0,
          discount_type: data.discount_type || '%',
          tax_amount: parseFloat(data.tax_amount) || 0,
          total: parseFloat(data.total) || 0,
          items: data.items || [],
          last_email_seen: data.last_email_seen || null,
          last_preview_seen: data.last_preview_seen || null,
          signer_name: data.signer_name || '',
          signer_email: data.signer_email || '',
        }
        setProposal(proposalData)
        setFormData({
          note: data.note || '',
          signer_name: data.signer_name || '',
          signer_email: data.signer_email || '',
        })
        // Fetch tasks and reminders after proposal is loaded
        setTimeout(() => {
          fetchTasks()
          fetchReminders()
        }, 100)
      }
    } catch (error) {
      console.error('Error fetching proposal:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProposals = async () => {
    try {
      const response = await proposalsAPI.getAll()
      if (response.data.success) {
        const proposalsData = (response.data.data || []).map(est => ({
          id: est.id,
          estimate_number: est.estimate_number || `PROPOSAL #${est.id}`,
          client_name: est.client_name || '--',
          status: (est.status || 'draft').toLowerCase(),
          total: parseFloat(est.total) || 0,
          proposal_date: est.created_at || '',
        }))
        setProposals(proposalsData)
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
    }
  }

  const handleSave = async () => {
    try {
      const response = await proposalsAPI.update(id, {
        note: formData.note,
        signer_name: formData.signer_name,
        signer_email: formData.signer_email,
      })
      if (response.data.success) {
        alert('Proposal updated successfully!')
        await fetchProposal()
        setIsEditModalOpen(false)
      } else {
        alert(response.data.error || 'Failed to update proposal')
      }
    } catch (error) {
      console.error('Error updating proposal:', error)
      alert(error.response?.data?.error || 'Failed to update proposal')
    }
  }

  const handleAddItemFromModal = async (item) => {
    try {
      // Get current proposal items
      const currentItems = proposal.items || []
      
      // Add new item to the list
      const newItem = {
        item_name: item.title || '',
        description: item.description || '',
        quantity: 1,
        unit: item.unit_type || 'Pcs',
        unit_price: parseFloat(item.rate || 0),
        tax_rate: 0,
        amount: parseFloat(item.rate || 0)
      }
      
      const updatedItems = [...currentItems, newItem]
      
      // Calculate totals
      const subTotal = updatedItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
      const discount = proposal.discount_amount || 0
      const discountAmount = discount
      const totalAfterDiscount = subTotal - discountAmount
      const taxAmount = updatedItems.reduce((sum, item) => {
        const quantity = parseFloat(item.quantity || 0)
        const unitPrice = parseFloat(item.unit_price || 0)
        const taxRate = parseFloat(item.tax_rate || 0)
        const itemSubtotal = quantity * unitPrice
        return sum + (itemSubtotal * taxRate / 100)
      }, 0)
      const total = totalAfterDiscount + taxAmount
      
      // Update proposal with new items
      const response = await proposalsAPI.update(id, {
        items: updatedItems.map(item => ({
          item_name: item.item_name || item.description || '',
          description: item.description || item.item_name || '',
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
    if (!window.confirm('Are you sure you want to remove this item?')) {
      return
    }
    
    try {
      const currentItems = proposal.items || []
      const updatedItems = currentItems.filter((_, index) => index !== itemIndex)
      
      // Calculate totals
      const subTotal = updatedItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
      const discount = proposal.discount_amount || 0
      const discountAmount = discount
      const totalAfterDiscount = subTotal - discountAmount
      const taxAmount = updatedItems.reduce((sum, item) => {
        const quantity = parseFloat(item.quantity || 0)
        const unitPrice = parseFloat(item.unit_price || 0)
        const taxRate = parseFloat(item.tax_rate || 0)
        const itemSubtotal = quantity * unitPrice
        return sum + (itemSubtotal * taxRate / 100)
      }, 0)
      const total = totalAfterDiscount + taxAmount
      
      // Update proposal with updated items
      const response = await proposalsAPI.update(id, {
        items: updatedItems.map(item => ({
          item_name: item.item_name || item.description || '',
          description: item.description || item.item_name || '',
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
      if (taxRate > 0) {
        amount += (amount * taxRate / 100)
      }
      
      currentItems[selectedItemIndex] = {
        ...currentItems[selectedItemIndex],
        item_name: editItemData.item_name,
        description: editItemData.description,
        quantity: quantity,
        unit_price: unitPrice,
        tax_rate: taxRate,
        amount: amount
      }
      
      // Update proposal
      const response = await proposalsAPI.update(id, {
        items: currentItems.map(item => ({
          item_name: item.item_name || item.description || '',
          description: item.description || item.item_name || '',
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
      discount: proposal.discount_amount || 0,
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
        const itemSubtotal = quantity * unitPrice
        return sum + (itemSubtotal * taxRate / 100)
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

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: proposal.currency || 'USD'
      }).format(amount || 0)
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
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
          .info-section h3 { margin-top: 0; font-size: 14px; color: #666; }
          .info-section p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .text-right { text-align: right; }
          .totals { margin-top: 20px; }
          .totals table { width: 300px; margin-left: auto; }
          .totals td { border: none; padding: 5px 10px; }
          .totals .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
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
            <p>${proposal.company_address || ''}</p>
          </div>
          <div class="client-info">
            <h3>To:</h3>
            <p><strong>${proposal.client_name || '-'}</strong></p>
            <p>${proposal.project_name ? `Project: ${proposal.project_name}` : ''}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <p><strong>Valid Until:</strong> ${formatDate(proposal.valid_till)}</p>
          <p><strong>Status:</strong> ${(proposal.status || 'draft').toUpperCase()}</p>
        </div>

        ${proposal.description ? `<div style="margin-bottom: 20px;"><p>${proposal.description.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>` : ''}

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Tax %</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(proposal.items || []).map(item => `
              <tr>
                <td>${(item.item_name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                <td>${(item.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                <td class="text-right">${item.quantity || 1}</td>
                <td class="text-right">${formatCurrency(item.unit_price || 0)}</td>
                <td class="text-right">${item.tax_rate || 0}%</td>
                <td class="text-right">${formatCurrency(item.amount || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Sub Total:</td>
              <td class="text-right">${formatCurrency(subtotal)}</td>
            </tr>
            ${discountAmount > 0 ? `
            <tr>
              <td>Discount ${proposal.discount_type === '%' ? `(${proposal.discount}%)` : ''}:</td>
              <td class="text-right">-${formatCurrency(discountAmount)}</td>
            </tr>
            ` : ''}
            ${taxAmount > 0 ? `
            <tr>
              <td>Tax:</td>
              <td class="text-right">${formatCurrency(taxAmount)}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td>Total:</td>
              <td class="text-right">${formatCurrency(total)}</td>
            </tr>
          </table>
        </div>

        ${proposal.terms ? `
        <div class="footer">
          <h3>Terms & Conditions:</h3>
          <p>${proposal.terms.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>
        ` : ''}

        ${proposal.note ? `
        <div class="footer">
          <h3>Note:</h3>
          <p>${proposal.note.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
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
    const pdfUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/proposals/${id}/pdf?company_id=${companyId}`
    window.open(pdfUrl, '_blank')
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await proposalsAPI.getPDF(id, { company_id: companyId, download: 1 })
      // Backend returns JSON, so create a JSON file download
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

  const handleProposalURL = () => {
    const publicUrl = `${window.location.origin}/public/proposals/${id}`
    navigator.clipboard.writeText(publicUrl).then(() => {
      alert('Proposal URL copied to clipboard!')
    }).catch(() => {
      prompt('Copy this URL:', publicUrl)
    })
  }

  const handleChangeTemplate = () => {
    alert('Template change functionality coming soon')
  }

  const handleSaveAndShow = async () => {
    await handleSave()
    setTimeout(() => {
      handlePreview()
    }, 500)
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

      // Format reminder message with date/time if provided
      let reminderMessage = reminderData.description || `Reminder for proposal ${proposal?.estimate_number || id}`
      if (reminderData.reminder_date) {
        const reminderDate = new Date(reminderData.reminder_date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
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
      const errorDetails = error.response?.data?.details || error.response?.data?.sqlMessage || ''
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create reminder'
      const fullMessage = errorDetails ? `${errorMessage}\n\nDetails: ${errorDetails}` : errorMessage
      alert(fullMessage)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toLowerCase()
    return `${dateStr} ${timeStr}`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const filteredProposals = proposals.filter(p => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!p.estimate_number?.toLowerCase().includes(query) && 
          !p.client_name?.toLowerCase().includes(query)) {
        return false
      }
    }
    if (statusFilter !== 'All') {
      if (p.status !== statusFilter.toLowerCase()) return false
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-secondary-text">Loading...</p>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-secondary-text">Proposal not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-gray-50">
      {/* Left Sidebar - Proposals List */}
      <div className={`${isSidebarOpen ? 'w-full lg:w-80' : 'hidden lg:block lg:w-0'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => navigate('/app/admin/proposals')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IoArrowBack size={20} />
            </button>
            <h2 className="text-lg font-semibold text-primary-text">← Proposals</h2>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden ml-auto p-2 hover:bg-gray-100 rounded-lg"
            >
              <IoEllipsisVertical size={20} />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            />
          </div>
        </div>
        
        {/* Proposals List */}
        <div className="flex-1 overflow-y-auto">
          {filteredProposals.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/app/admin/proposals/${p.id}`)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                p.id === parseInt(id) ? 'bg-blue-50 border-l-4 border-l-primary-accent' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-primary-text truncate">{p.estimate_number}</p>
                  <p className="text-xs text-secondary-text truncate">{p.client_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs ${
                      p.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                      p.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {p.status === 'accepted' ? 'Accepted' : p.status === 'draft' ? 'Draft' : p.status}
                    </Badge>
                    <span className="text-xs text-primary-text font-semibold">{formatCurrency(p.total)}</span>
                    <span className="text-xs text-secondary-text">{formatDate(p.proposal_date)}</span>
                  </div>
                </div>
                {p.id === parseInt(id) && (
                  <span className="text-primary-accent ml-2">›</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-center gap-2">
          <button className="px-3 py-1 text-sm text-secondary-text hover:text-primary-text">‹</button>
          <button className="px-3 py-1 text-sm bg-primary-accent text-white rounded">1</button>
          <button className="px-3 py-1 text-sm text-secondary-text hover:text-primary-text">›</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚓</span>
              <h1 className="text-xl sm:text-2xl font-bold text-primary-text">{proposal.estimate_number}</h1>
            </div>
          </div>

          {/* Status and Date */}
          <div className="flex items-center gap-4 flex-wrap">
            <Badge className={`text-sm ${
              proposal.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
              proposal.status === 'draft' ? 'bg-gray-100 text-gray-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {proposal.status === 'accepted' ? 'Accepted' : proposal.status === 'draft' ? 'Draft' : proposal.status}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-secondary-text">
              <IoCalendar size={16} />
              <span>{formatDate(proposal.proposal_date)}</span>
            </div>
          </div>

          {/* Proposal Items */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-text flex items-center gap-2">
                <IoDocumentText size={20} />
                Proposal items
              </h3>
              <span className="text-primary-accent">›</span>
            </div>
            
            {proposal.items && proposal.items.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">Item</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-secondary-text uppercase">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-secondary-text uppercase">Rate</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-secondary-text uppercase">Total</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-secondary-text uppercase"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {proposal.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <IoDocumentText size={16} className="text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-primary-text">{item.item_name || item.description || '-'}</p>
                                {item.description && item.description !== item.item_name && (
                                  <p className="text-xs text-secondary-text">{item.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-primary-text">{item.quantity || 0} Hour</td>
                          <td className="px-4 py-3 text-right text-sm text-primary-text">{formatCurrency(item.unit_price || 0)}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-primary-text">{formatCurrency(item.amount || 0)}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                onClick={() => handleEditItem(idx)}
                              >
                                <IoCreate size={16} />
                              </button>
                              <button 
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                onClick={() => handleRemoveItem(idx)}
                              >
                                <IoClose size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4 flex items-center gap-2"
                  onClick={() => setIsAddItemModalOpen(true)}
                >
                  <IoAdd size={16} />
                  Add item
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-secondary-text">
                <p>No items added yet</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4 flex items-center gap-2"
                  onClick={() => setIsAddItemModalOpen(true)}
                >
                  <IoAdd size={16} />
                  Add item
                </Button>
              </div>
            )}

            {/* Financial Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-text">Sub Total:</span>
                <span className="font-semibold text-primary-text">{formatCurrency(proposal.sub_total || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-text flex items-center gap-1">
                  Discount:
                  <button className="text-primary-accent hover:underline" onClick={handleEditDiscount}>
                    <IoCreate size={14} />
                  </button>
                </span>
                <span className="font-semibold text-primary-text">{formatCurrency(proposal.discount_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-text">Tax (10%):</span>
                <span className="font-semibold text-primary-text">{formatCurrency(proposal.tax_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-text">Tax (10%):</span>
                <span className="font-semibold text-primary-text">{formatCurrency(proposal.tax_amount || 0)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="text-lg font-bold text-primary-text">Total:</span>
                <span className="text-lg font-bold text-primary-accent">{formatCurrency(proposal.total || 0)}</span>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
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
              <IoCheckmarkCircle size={16} />
              Save & show
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className={`${isRightSidebarOpen ? 'w-full lg:w-80' : 'hidden lg:block lg:w-0'} bg-white border-l border-gray-200 overflow-y-auto transition-all duration-300`}>
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between lg:hidden">
            <h3 className="text-lg font-semibold text-primary-text">⚓ Proposal info</h3>
            <button
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <IoClose size={20} />
            </button>
          </div>
          
          {/* Proposal Info */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-primary-text flex items-center gap-2">
                <span>⚓</span>
                Proposal info
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <IoBriefcase size={16} className="text-secondary-text" />
                <span className="text-sm text-primary-text">{proposal.client_name}</span>
              </div>
              <div>
                <p className="text-xs text-secondary-text">Proposal date: {formatDate(proposal.proposal_date)}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-text">Valid until: {formatDate(proposal.valid_till)}</p>
              </div>
            </div>
          </div>

          {/* Document Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-2 hover:bg-gray-800 hover:text-white hover:border-gray-800"
              onClick={handlePreview}
            >
              <IoEye size={16} />
              Q Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-2 hover:bg-gray-800 hover:text-white hover:border-gray-800"
              onClick={handlePrint}
            >
              <IoPrint size={16} />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-2 hover:bg-gray-800 hover:text-white hover:border-gray-800"
              onClick={handleDownloadPDF}
            >
              <IoDownload size={16} />
              Download PDF
            </Button>
          </div>

        </div>
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add Items to Proposal"
        size="xl"
      >
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search items..."
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
              />
              <IoSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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

          {/* Items Grid */}
          {(() => {
            const filteredItemsForModal = items.filter(item => {
              const matchesSearch = !itemSearchQuery || 
                item.title?.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
                item.category?.toLowerCase().includes(itemSearchQuery.toLowerCase())
              const matchesCategory = !itemCategoryFilter || item.category === itemCategoryFilter
              return matchesSearch && matchesCategory
            })

            return filteredItemsForModal.length === 0 ? (
              <div className="text-center py-8 text-secondary-text">
                <p>No items found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredItemsForModal.map((item) => (
                  <Card 
                    key={item.id} 
                    className="p-4 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleAddItemFromModal(item)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Item Image */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <IoStorefront size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-primary-text text-sm mb-1 truncate">
                          {item.title}
                        </h3>
                        <p className="text-red-500 font-bold text-sm mb-1">
                          ${parseFloat(item.rate || 0).toFixed(2)}
                          <span className="text-gray-400 font-normal text-xs">/{item.unit_type || 'PC'}</span>
                        </p>
                        {item.description && (
                          <p className="text-secondary-text text-xs line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-primary-accent">
                          <IoCheckmark size={14} />
                          <span>Click to add</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          })()}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsAddItemModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={isEditItemModalOpen}
        onClose={() => {
          setIsEditItemModalOpen(false)
          setSelectedItemIndex(null)
          setEditItemData({})
        }}
        title="Edit Item"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Item Name"
            value={editItemData.item_name || ''}
            onChange={(e) => setEditItemData({ ...editItemData, item_name: e.target.value })}
            placeholder="Item name/description"
            required
          />
          <Input
            label="Description (Optional)"
            value={editItemData.description || ''}
            onChange={(e) => setEditItemData({ ...editItemData, description: e.target.value })}
            placeholder="Additional description"
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
                if (taxRate > 0) {
                  amount += (amount * taxRate / 100)
                }
                setEditItemData({ ...editItemData, quantity: qty, amount })
              }}
              min="0"
              step="0.01"
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
                if (taxRate > 0) {
                  amount += (amount * taxRate / 100)
                }
                setEditItemData({ ...editItemData, unit_price: price, amount })
              }}
              min="0"
              step="0.01"
            />
            <Input
              label="Tax Rate (%)"
              type="number"
              value={editItemData.tax_rate || 0}
              onChange={(e) => {
                const tax = parseFloat(e.target.value) || 0
                const qty = parseFloat(editItemData.quantity || 0)
                const unitPrice = parseFloat(editItemData.unit_price || 0)
                let amount = qty * unitPrice
                if (tax > 0) {
                  amount += (amount * tax / 100)
                }
                setEditItemData({ ...editItemData, tax_rate: tax, amount })
              }}
              min="0"
              step="0.01"
            />
          </div>
          <div className="text-right">
            <span className="text-sm text-secondary-text">Amount: </span>
            <span className="font-semibold text-primary-text">{formatCurrency(editItemData.amount || 0)}</span>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditItemModalOpen(false)
                setSelectedItemIndex(null)
                setEditItemData({})
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateItem}
            >
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
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Discount
              </label>
              <Input
                type="number"
                value={discountData.discount || 0}
                onChange={(e) => setDiscountData({ ...discountData, discount: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Discount Type
              </label>
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
            <Button
              variant="outline"
              onClick={() => setIsEditDiscountModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateDiscount}
            >
              Update Discount
            </Button>
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
          {proposal && (
            <>
              <div className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-primary-text">{proposal.estimate_number}</h2>
                    <p className="text-sm text-secondary-text mt-1">Client: {proposal.client_name}</p>
                  </div>
                  <Badge className={`${
                    proposal.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                    proposal.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {proposal.status}
                  </Badge>
                </div>
              </div>

              {proposal.description && (
                <div>
                  <h3 className="font-semibold text-primary-text mb-2">Description</h3>
                  <p className="text-secondary-text">{proposal.description}</p>
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
                            <td className="px-4 py-2 text-primary-text">{item.item_name || item.description || '-'}</td>
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

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary-text">Sub Total:</span>
                    <span className="font-semibold text-primary-text">{formatCurrency(proposal.sub_total || 0)}</span>
                  </div>
                  {proposal.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary-text">Discount:</span>
                      <span className="font-semibold text-primary-text">-{formatCurrency(proposal.discount_amount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary-text">Tax:</span>
                    <span className="font-semibold text-primary-text">{formatCurrency(proposal.tax_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="text-lg font-bold text-primary-text">Total:</span>
                    <span className="text-lg font-bold text-primary-accent">{formatCurrency(proposal.total || 0)}</span>
                  </div>
                </div>
              </div>

              {proposal.terms && (
                <div>
                  <h3 className="font-semibold text-primary-text mb-2">Terms & Conditions</h3>
                  <p className="text-secondary-text whitespace-pre-wrap">{proposal.terms}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={handlePrint}
                >
                  <IoPrint size={16} className="mr-2" />
                  Print
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDownloadPDF}
                >
                  <IoDownload size={16} className="mr-2" />
                  Download PDF
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => {
          setIsAddTaskModalOpen(false)
          setTaskData({ title: '', description: '', due_date: '', priority: 'Medium' })
        }}
        title="Add Task"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Task Title"
            value={taskData.title}
            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            placeholder="Enter task title"
            required
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Description
            </label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              placeholder="Enter task description"
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={taskData.due_date}
              onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Priority
              </label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddTaskModalOpen(false)
                setTaskData({ title: '', description: '', due_date: '', priority: 'Medium' })
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddTask}
            >
              Add Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal
        isOpen={isAddReminderModalOpen}
        onClose={() => {
          setIsAddReminderModalOpen(false)
          setReminderData({ title: '', description: '', reminder_date: '', reminder_time: '' })
        }}
        title="Add Reminder"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Reminder Title"
            value={reminderData.title}
            onChange={(e) => setReminderData({ ...reminderData, title: e.target.value })}
            placeholder="Enter reminder title"
            required
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Description
            </label>
            <textarea
              value={reminderData.description}
              onChange={(e) => setReminderData({ ...reminderData, description: e.target.value })}
              placeholder="Enter reminder description"
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Reminder Date"
              type="date"
              value={reminderData.reminder_date}
              onChange={(e) => setReminderData({ ...reminderData, reminder_date: e.target.value })}
            />
            <Input
              label="Reminder Time"
              type="time"
              value={reminderData.reminder_time}
              onChange={(e) => setReminderData({ ...reminderData, reminder_time: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddReminderModalOpen(false)
                setReminderData({ title: '', description: '', reminder_date: '', reminder_time: '' })
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddReminder}
            >
              Add Reminder
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProposalDetail


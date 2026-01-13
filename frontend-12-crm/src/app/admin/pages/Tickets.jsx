import { useState, useEffect } from 'react'
import { ticketsAPI, clientsAPI, employeesAPI } from '../../../api'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { IoPencil, IoTrashOutline, IoEye } from 'react-icons/io5'

const Tickets = () => {
  // Get company_id from localStorage
  const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [formData, setFormData] = useState({
    subject: '',
    client_id: '',
    priority: 'Medium',
    description: '',
    status: 'Open',
    assigned_to: '',
  })

  const [tickets, setTickets] = useState([])
  const [clients, setClients] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTickets()
    fetchClients()
    fetchEmployees()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchTickets:', companyId)
        setTickets([])
        setLoading(false)
        return
      }
      const response = await ticketsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        // Transform API data to match column keys
        const transformedTickets = (response.data.data || []).map(ticket => ({
          ...ticket,
          ticketId: ticket.ticket_id || `TKT-${ticket.id}`,
          client: ticket.client_name || 'N/A',
          assignedTo: ticket.assigned_to_name || 'Unassigned',
          createdDate: ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A',
        }))
        setTickets(transformedTickets)
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
      alert(error.response?.data?.error || 'Failed to fetch tickets')
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchClients:', companyId)
        setClients([])
        return
      }
      const response = await clientsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        const clientsData = (response.data.data || []).map(client => ({
          id: client.id,
          name: client.client_name || client.name || client.company_name || `Client #${client.id}`,
          company_name: client.company_name || '',
          email: client.email || '',
        }))
        setClients(clientsData)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      setClients([])
    }
  }

  const fetchEmployees = async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchEmployees:', companyId)
        setEmployees([])
        return
      }
      const response = await employeesAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        const employeesData = (response.data.data || []).map(emp => ({
          id: emp.user_id || emp.id,
          name: emp.name || emp.email || `Employee #${emp.user_id || emp.id}`,
          email: emp.email || '',
        }))
        setEmployees(employeesData)
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error)
      setEmployees([])
    }
  }

  const columns = [
    { key: 'ticketId', label: 'Ticket ID' },
    { key: 'subject', label: 'Subject' },
    { key: 'client', label: 'Client' },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => {
        const priorityColors = {
          High: 'danger',
          Medium: 'warning',
          Low: 'info',
        }
        return <Badge variant={priorityColors[value] || 'default'}>{value}</Badge>
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          Open: 'info',
          Pending: 'warning',
          Closed: 'success',
        }
        return <Badge variant={statusColors[value] || 'default'}>{value}</Badge>
      },
    },
    { key: 'assignedTo', label: 'Assigned' },
    { key: 'createdDate', label: 'Created' },
  ]

  const handleAdd = () => {
    setFormData({
      subject: '',
      client_id: '',
      priority: 'Medium',
      description: '',
      status: 'Open',
      assigned_to: '',
    })
    setIsAddModalOpen(true)
  }

  const handleEdit = (ticket) => {
    setSelectedTicket(ticket)
    setFormData({
      subject: ticket.subject,
      client_id: ticket.client_id || '',
      priority: ticket.priority,
      description: ticket.description || '',
      status: ticket.status,
      assigned_to: ticket.assigned_to || ticket.assignedTo || '',
    })
    setIsEditModalOpen(true)
  }

  const handleView = (ticket) => {
    setSelectedTicket(ticket)
    setIsViewModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.subject) {
      alert('Subject is required')
      return
    }

    try {
      setSaving(true)
      const ticketData = {
        company_id: companyId,
        subject: formData.subject,
        description: formData.description || '',
        priority: formData.priority || 'Medium',
        status: formData.status || 'Open',
        client_id: formData.client_id ? parseInt(formData.client_id, 10) : null,
        assigned_to_id: formData.assigned_to ? parseInt(formData.assigned_to, 10) : null,
      }

      if (isEditModalOpen && selectedTicket) {
        const response = await ticketsAPI.update(selectedTicket.id, ticketData)
        if (response.data && response.data.success) {
          alert('Ticket updated successfully!')
          setIsEditModalOpen(false)
          setSelectedTicket(null)
          setFormData({
            subject: '',
            client_id: '',
            priority: 'Medium',
            description: '',
            status: 'Open',
            assigned_to: '',
          })
          await fetchTickets()
        } else {
          alert(response.data?.error || 'Failed to update ticket')
        }
      } else {
        const response = await ticketsAPI.create(ticketData)
        if (response.data && response.data.success) {
          alert('Ticket created successfully!')
          setIsAddModalOpen(false)
          setFormData({
            subject: '',
            client_id: '',
            priority: 'Medium',
            description: '',
            status: 'Open',
            assigned_to: '',
          })
          await fetchTickets()
        } else {
          alert(response.data?.error || 'Failed to create ticket')
        }
      }
    } catch (error) {
      console.error('Failed to save ticket:', error)
      alert(error.response?.data?.error || 'Failed to save ticket')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (ticket) => {
    if (!window.confirm(`Delete ticket ${ticket.ticketId}?`)) return

    try {
      const response = await ticketsAPI.delete(ticket.id, { company_id: companyId })
      if (response.data && response.data.success) {
        alert('Ticket deleted successfully!')
        await fetchTickets()
      } else {
        alert(response.data?.error || 'Failed to delete ticket')
      }
    } catch (error) {
      console.error('Failed to delete ticket:', error)
      alert(error.response?.data?.error || 'Failed to delete ticket')
    }
  }

  const actions = (row) => (
    <div className="action-btn-container">
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleView(row)
        }}
        className="action-btn action-btn-view"
        title="View"
      >
        <IoEye size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEdit(row)
        }}
        className="action-btn action-btn-edit"
        title="Edit"
      >
        <IoPencil size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDelete(row)
        }}
        className="action-btn action-btn-delete"
        title="Delete"
      >
        <IoTrashOutline size={18} />
      </button>
    </div>
  )

  if (loading && tickets.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Tickets</h1>
          <p className="text-sm sm:text-base text-secondary-text mt-1">Manage support tickets</p>
        </div>
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Tickets</h1>
          <p className="text-sm sm:text-base text-secondary-text mt-1">Manage support tickets</p>
        </div>
        <AddButton onClick={handleAdd} label="Add Ticket" />
      </div>

      <DataTable
        columns={columns}
        data={tickets}
        searchPlaceholder="Search tickets..."
        filters={true}
        filterConfig={[
          { key: 'status', label: 'Status', type: 'select', options: ['Open', 'Pending', 'Closed'] },
          { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
          { key: 'client', label: 'Client', type: 'text' },
        ]}
        actions={actions}
        bulkActions={true}
        mobileColumns={2}
      />

      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedTicket(null)
          // Reset form
          setFormData({
            subject: '',
            client_id: '',
            priority: 'Medium',
            description: '',
            status: 'Open',
            assigned_to: '',
          })
        }}
        title={isAddModalOpen ? 'Add New Ticket' : 'Edit Ticket'}
      >
        <div className="space-y-4">
          <Input
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-1.5 sm:mb-2">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              required
            >
              <option value="">-- Select Client --</option>
              {clients.length === 0 ? (
                <option value="" disabled>No clients found</option>
              ) : (
                clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))
              )}
            </select>
            {clients.length === 0 && (
              <p className="text-xs text-secondary-text mt-1">No clients available. Add clients first.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-1.5 sm:mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-1.5 sm:mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-1.5 sm:mb-2">
              Assigned To
            </label>
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="">-- Select Employee --</option>
              {employees.length === 0 ? (
                <option value="" disabled>No employees found</option>
              ) : (
                employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-1.5 sm:mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="Open">Open</option>
              <option value="Pending">Pending</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-1.5 sm:mb-2">
              Attachment
            </label>
            <input
              type="file"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            />
          </div>
          <div className="flex gap-3 pt-4 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
              }}
              className="px-4"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="px-4" disabled={saving}>
              {saving ? 'Saving...' : (isAddModalOpen ? 'Save Ticket' : 'Update Ticket')}
            </Button>
          </div>
        </div>
      </RightSideModal>

      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Ticket Details"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-medium text-secondary-text">Ticket ID</label>
              <p className="text-sm sm:text-base text-primary-text mt-1">{selectedTicket.ticketId}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-secondary-text">Subject</label>
              <p className="text-sm sm:text-base text-primary-text mt-1">{selectedTicket.subject}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-secondary-text">Client</label>
              <p className="text-sm sm:text-base text-primary-text mt-1">{selectedTicket.client}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-secondary-text">Priority</label>
              <div className="mt-1">
                <Badge
                  variant={
                    selectedTicket.priority === 'High'
                      ? 'danger'
                      : selectedTicket.priority === 'Medium'
                        ? 'warning'
                        : 'info'
                  }
                >
                  {selectedTicket.priority}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-secondary-text">Status</label>
              <div className="mt-1">
                <Badge
                  variant={
                    selectedTicket.status === 'Closed'
                      ? 'success'
                      : selectedTicket.status === 'Pending'
                        ? 'warning'
                        : 'info'
                  }
                >
                  {selectedTicket.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-secondary-text">Assigned To</label>
              <p className="text-sm sm:text-base text-primary-text mt-1">{selectedTicket.assignedTo}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-secondary-text">Created Date</label>
              <p className="text-sm sm:text-base text-primary-text mt-1">{selectedTicket.createdDate}</p>
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default Tickets

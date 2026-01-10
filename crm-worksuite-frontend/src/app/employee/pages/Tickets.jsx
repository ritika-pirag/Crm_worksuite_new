import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import { ticketsAPI } from '../../../api'
import { IoEye } from 'react-icons/io5'

const Tickets = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    if (userId && companyId) {
      fetchTickets()
    }
  }, [userId, companyId])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await ticketsAPI.getAll({
        company_id: companyId,
        assigned_to_id: userId
      })
      if (response.data.success) {
        const fetchedTickets = response.data.data || []
        const transformedTickets = fetchedTickets.map(ticket => ({
          id: ticket.id,
          ticketId: ticket.ticket_id || `TKT-${ticket.id}`,
          subject: ticket.subject || 'N/A',
          client: ticket.client_name || 'N/A',
          ticketType: ticket.ticket_type || 'General Support',
          priority: ticket.priority || 'Medium',
          status: ticket.status || 'Open',
          createdDate: ticket.created_at 
            ? new Date(ticket.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            : 'N/A',
          ...ticket
        }))
        setTickets(transformedTickets)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'ticketId', label: 'Ticket ID' },
    { key: 'subject', label: 'Subject' },
    { key: 'client', label: 'Client' },
    { key: 'ticketType', label: 'Ticket Type' },
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
          Open: 'danger',
          New: 'warning',
          Pending: 'warning',
          'In Progress': 'info',
          Closed: 'success',
          Resolved: 'success',
        }
        return <Badge variant={statusColors[value] || 'default'}>{value}</Badge>
      },
    },
    { key: 'createdDate', label: 'Created' },
  ]

  const handleView = (ticket) => {
    setSelectedTicket(ticket)
    setIsViewModalOpen(true)
  }

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
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Assigned Tickets</h1>
          <p className="text-secondary-text mt-1">View tickets assigned to you</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <p className="text-secondary-text">No tickets assigned to you</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tickets}
          searchPlaceholder="Search tickets..."
          filters={true}
          filterConfig={[
            { key: 'status', label: 'Status', type: 'select', options: ['Open', 'Pending', 'In Progress', 'Closed', 'Resolved'] },
            { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
          ]}
          actions={actions}
          bulkActions={false}
        />
      )}

      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Ticket Details"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-secondary-text">Ticket ID</label>
              <p className="text-primary-text mt-1">{selectedTicket.ticketId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Subject</label>
              <p className="text-primary-text mt-1">{selectedTicket.subject}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Client</label>
              <p className="text-primary-text mt-1">{selectedTicket.client}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Ticket Type</label>
              <p className="text-primary-text mt-1">{selectedTicket.ticketType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Priority</label>
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
              <label className="text-sm font-medium text-secondary-text">Status</label>
              <div className="mt-1">
                <Badge
                  variant={
                    selectedTicket.status === 'Closed' || selectedTicket.status === 'Resolved'
                      ? 'success'
                      : selectedTicket.status === 'Pending'
                        ? 'warning'
                        : selectedTicket.status === 'In Progress'
                          ? 'info'
                          : 'danger'
                  }
                >
                  {selectedTicket.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Description</label>
              <p className="text-primary-text mt-1">{selectedTicket.description || 'No description'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Created</label>
              <p className="text-primary-text mt-1">{selectedTicket.createdDate}</p>
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default Tickets

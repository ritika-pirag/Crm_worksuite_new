import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { proposalsAPI } from '../../../api'
import { IoEye, IoDownload, IoCheckmark, IoClose } from 'react-icons/io5'

const Proposals = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  // For clients, client_id is stored separately from user_id
  const clientId = user?.client_id || localStorage.getItem('clientId')
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (companyId) {
      fetchProposals()
    }
  }, [companyId, clientId])

  const fetchProposals = async () => {
    try {
      setLoading(true)
      // Use client_id if available (for client role), otherwise use user_id
      const response = await proposalsAPI.getAll({
        company_id: companyId,
        client_id: clientId || userId
      })
      if (response.data.success) {
        setProposals(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (proposal) => {
    setSelectedProposal(proposal)
    setIsViewModalOpen(true)
  }

  const handleAccept = async (id) => {
    if (window.confirm('Are you sure you want to accept this proposal?')) {
      try {
        await proposalsAPI.updateStatus(id, { status: 'Accepted' }, { company_id: companyId })
        alert('Proposal accepted successfully!')
        fetchProposals()
        setIsViewModalOpen(false)
      } catch (error) {
        console.error('Error accepting proposal:', error)
        alert('Failed to accept proposal')
      }
    }
  }

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this proposal?')) {
      try {
        await proposalsAPI.updateStatus(id, { status: 'Rejected' }, { company_id: companyId })
        alert('Proposal rejected!')
        fetchProposals()
        setIsViewModalOpen(false)
      } catch (error) {
        console.error('Error rejecting proposal:', error)
        alert('Failed to reject proposal')
      }
    }
  }

  const handleDownload = async (proposal) => {
    try {
      // Create printable PDF version
      const printWindow = window.open('', '_blank')
      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Proposal - ${proposal.title || proposal.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .header h1 { margin: 0; color: #333; }
              .details { margin-bottom: 30px; }
              .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .label { font-weight: bold; color: #666; }
              .value { color: #333; }
              .amount { font-size: 24px; font-weight: bold; color: #2563eb; text-align: center; margin: 30px 0; }
              .description { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
              @media print { button { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>PROPOSAL</h1>
              <p>${proposal.title || 'Proposal #' + proposal.id}</p>
            </div>
            <div class="details">
              <div class="details-row">
                <span class="label">Status:</span>
                <span class="value">${proposal.status || 'Pending'}</span>
              </div>
              <div class="details-row">
                <span class="label">Valid Till:</span>
                <span class="value">${proposal.valid_till ? new Date(proposal.valid_till).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="details-row">
                <span class="label">Created:</span>
                <span class="value">${proposal.created_at ? new Date(proposal.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            <div class="amount">
              Total: $${parseFloat(proposal.total || 0).toFixed(2)}
            </div>
            ${proposal.description ? `<div class="description"><strong>Description:</strong><br/>${proposal.description}</div>` : ''}
            <div class="footer">
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `
      printWindow.document.write(content)
      printWindow.document.close()
    } catch (error) {
      console.error('Error downloading proposal:', error)
      alert('Failed to download proposal')
    }
  }

  const columns = [
    { 
      key: 'title', 
      label: 'Title',
      render: (value, row) => value || `Proposal #${row.id}`
    },
    { 
      key: 'total', 
      label: 'Amount',
      render: (value) => `$${parseFloat(value || 0).toFixed(2)}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          Sent: 'info',
          Accepted: 'success',
          Rejected: 'danger',
          Draft: 'default',
          Pending: 'warning',
        }
        return <Badge variant={statusColors[value] || 'default'}>{value || 'Pending'}</Badge>
      },
    },
    { 
      key: 'valid_till', 
      label: 'Valid Till',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    { 
      key: 'created_at', 
      label: 'Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
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
        title="View"
      >
        <IoEye size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDownload(row)
        }}
        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
        title="Download"
      >
        <IoDownload size={18} />
      </button>
      {row.status === 'Sent' && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAccept(row.id)
            }}
            className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
            title="Accept"
          >
            <IoCheckmark size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleReject(row.id)
            }}
            className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
            title="Reject"
          >
            <IoClose size={18} />
          </button>
        </>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-text">Proposals</h1>
        <p className="text-secondary-text mt-1">View and respond to proposals</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading proposals...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={proposals}
          searchPlaceholder="Search proposals..."
          filters={true}
          filterConfig={[
            { key: 'status', label: 'Status', type: 'select', options: ['Sent', 'Accepted', 'Rejected', 'Draft', 'Pending'] },
          ]}
          actions={actions}
          bulkActions={false}
          emptyMessage="No proposals found"
        />
      )}

      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Proposal Details"
      >
        {selectedProposal && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-secondary-text">Title</label>
              <p className="text-primary-text mt-1">{selectedProposal.title || `Proposal #${selectedProposal.id}`}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Amount</label>
              <p className="text-primary-text mt-1 text-xl font-bold">${parseFloat(selectedProposal.total || 0).toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Status</label>
              <div className="mt-1">
                <Badge
                  variant={
                    selectedProposal.status === 'Accepted' ? 'success' :
                    selectedProposal.status === 'Rejected' ? 'danger' :
                    selectedProposal.status === 'Sent' ? 'info' : 'default'
                  }
                >
                  {selectedProposal.status || 'Pending'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Valid Till</label>
              <p className="text-primary-text mt-1">
                {selectedProposal.valid_till ? new Date(selectedProposal.valid_till).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            {selectedProposal.description && (
              <div>
                <label className="text-sm font-medium text-secondary-text">Description</label>
                <p className="text-primary-text mt-1 whitespace-pre-wrap">{selectedProposal.description}</p>
              </div>
            )}
            
            {selectedProposal.status === 'Sent' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="primary"
                  onClick={() => handleAccept(selectedProposal.id)}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <IoCheckmark size={18} />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(selectedProposal.id)}
                  className="flex-1 flex items-center justify-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                >
                  <IoClose size={18} />
                  Reject
                </Button>
              </div>
            )}
            
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => handleDownload(selectedProposal.id)}
                className="w-full flex items-center justify-center gap-2"
              >
                <IoDownload size={18} />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default Proposals


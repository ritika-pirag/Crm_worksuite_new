import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import { estimatesAPI } from '../../../api'
import { IoEye, IoDownload } from 'react-icons/io5'

const Estimates = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  // For clients, client_id is stored separately from user_id
  const clientId = user?.client_id || localStorage.getItem('clientId')
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedEstimate, setSelectedEstimate] = useState(null)
  const [estimates, setEstimates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (companyId) {
      fetchEstimates()
    }
  }, [companyId, clientId])

  const fetchEstimates = async () => {
    try {
      setLoading(true)
      console.log('Fetching estimates...')
      // Use client_id if available (for client role), otherwise use user_id
      const response = await estimatesAPI.getAll({
        company_id: companyId,
        client_id: clientId || userId
      })
      console.log('Estimates API response:', response.data)
      
      if (response.data && response.data.success) {
        const fetchedEstimates = response.data.data || []
        console.log('Fetched estimates count:', fetchedEstimates.length)
        
        const transformedEstimates = fetchedEstimates.map(est => ({
          id: est.id,
          estimateNo: est.estimate_number || est.estimateNumber || `EST-${est.id}`,
          amount: parseFloat(est.total || est.amount || 0),
          status: est.status || 'Draft',
          createdDate: est.created_at ? new Date(est.created_at).toLocaleDateString() : 'N/A',
          items: est.items || [],
          ...est
        }))
        console.log('Transformed estimates:', transformedEstimates)
        setEstimates(transformedEstimates)
      } else {
        console.error('Failed to fetch estimates:', response.data?.error)
        setEstimates([])
      }
    } catch (error) {
      console.error('Error fetching estimates:', error)
      console.error('Error details:', error.response?.data || error.message)
      setEstimates([])
      alert(error.response?.data?.error || 'Failed to fetch estimates. Please check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'estimateNo', label: 'Estimate No' },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          Draft: 'default',
          Sent: 'info',
          Accepted: 'success',
        }
        return <Badge variant={statusColors[value] || 'default'}>{value}</Badge>
      },
    },
    { key: 'createdDate', label: 'Created Date' },
  ]

  const handleView = (estimate) => {
    setSelectedEstimate(estimate)
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
      <button
        onClick={(e) => {
          e.stopPropagation()
          alert(`Downloading ${row.estimateNo}...`)
        }}
        className="p-2 text-secondary-accent hover:bg-secondary-accent hover:bg-opacity-10 rounded transition-colors"
        title="Download"
      >
        <IoDownload size={18} />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-text">Estimates</h1>
        <p className="text-secondary-text mt-1">View your estimates</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading estimates...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={estimates}
          searchPlaceholder="Search estimates..."
          filters={true}
          filterConfig={[
            { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Sent', 'Accepted', 'Rejected'] },
            { key: 'createdDate', label: 'Created Date', type: 'daterange' },
          ]}
          actions={actions}
          bulkActions={false}
        />
      )}

      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Estimate Details"
      >
        {selectedEstimate && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-secondary-text">Estimate No</label>
              <p className="text-primary-text mt-1">{selectedEstimate.estimateNo}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Amount</label>
              <p className="text-primary-text mt-1">
                ${selectedEstimate.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Status</label>
              <div className="mt-1">
                <Badge
                  variant={
                    selectedEstimate.status === 'Accepted'
                      ? 'success'
                      : selectedEstimate.status === 'Sent'
                      ? 'info'
                      : 'default'
                  }
                >
                  {selectedEstimate.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Created Date</label>
              <p className="text-primary-text mt-1">{selectedEstimate.createdDate}</p>
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default Estimates

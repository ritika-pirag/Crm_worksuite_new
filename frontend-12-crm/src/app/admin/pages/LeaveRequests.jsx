import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import Badge from '../../../components/ui/Badge'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import { leaveRequestsAPI } from '../../../api'
import { IoCheckmark, IoClose, IoEye } from 'react-icons/io5'

const LeaveRequests = () => {
  const { user } = useAuth()
  const companyId = parseInt(user?.company_id || localStorage.getItem('companyId') || 1, 10)
  
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoading(true)
      const params = { company_id: companyId }
      if (statusFilter) {
        params.status = statusFilter
      }
      // Don't pass user_id to get ALL employees' leave requests for this company
      const response = await leaveRequestsAPI.getAll(params)
      if (response.data.success) {
        const requests = response.data.data || []
        const transformedRequests = requests.map(req => ({
          id: req.id,
          employeeName: req.employee_name || 'Unknown Employee',
          employeeEmail: req.employee_email || '',
          leaveType: req.leave_type || 'N/A',
          startDate: req.start_date ? new Date(req.start_date).toLocaleDateString() : 'N/A',
          endDate: req.end_date ? new Date(req.end_date).toLocaleDateString() : 'N/A',
          days: req.days || 0,
          reason: req.reason || '',
          status: req.status || 'Pending',
          createdAt: req.created_at ? new Date(req.created_at).toLocaleDateString() : 'N/A',
          ...req
        }))
        setLeaveRequests(transformedRequests)
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error)
    } finally {
      setLoading(false)
    }
  }, [companyId, statusFilter])

  useEffect(() => {
    if (companyId) {
      fetchLeaveRequests()
    }
  }, [fetchLeaveRequests, companyId])

  const handleView = (request) => {
    setSelectedRequest(request)
    setIsViewModalOpen(true)
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await leaveRequestsAPI.update(id, { status: newStatus }, { company_id: companyId })
      alert(`Leave request ${newStatus.toLowerCase()} successfully!`)
      await fetchLeaveRequests()
      setIsViewModalOpen(false)
    } catch (error) {
      console.error('Error updating leave request:', error)
      alert(error.response?.data?.error || 'Failed to update leave request')
    }
  }

  const columns = [
    { 
      key: 'employeeName', 
      label: 'Employee',
      render: (value, row) => (
        <div>
          <p className="font-medium text-primary-text">{value}</p>
          <p className="text-xs text-secondary-text">{row.employeeEmail}</p>
        </div>
      )
    },
    { key: 'leaveType', label: 'Leave Type' },
    { key: 'startDate', label: 'From' },
    { key: 'endDate', label: 'To' },
    { 
      key: 'days', 
      label: 'Days',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          Pending: 'warning',
          Approved: 'success',
          Rejected: 'danger',
        }
        return <Badge variant={statusColors[value] || 'default'}>{value}</Badge>
      },
    },
  ]

  const actions = (row) => (
    <div className="flex items-center justify-end gap-1">
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
      {row.status === 'Pending' && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (window.confirm(`Approve leave request for ${row.employeeName}?`)) {
                handleUpdateStatus(row.id, 'Approved')
              }
            }}
            className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
            title="Approve"
          >
            <IoCheckmark size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (window.confirm(`Reject leave request for ${row.employeeName}?`)) {
                handleUpdateStatus(row.id, 'Rejected')
              }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Leave Requests</h1>
          <p className="text-secondary-text mt-1">Manage employee leave requests</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading leave requests...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={leaveRequests}
          searchPlaceholder="Search leave requests..."
          filters={true}
          filterConfig={[
            { 
              key: 'leaveType', 
              label: 'Leave Type', 
              type: 'select', 
              options: ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Maternity Leave', 'Paternity Leave', 'Other'] 
            },
          ]}
          actions={actions}
          emptyMessage="No leave requests found"
        />
      )}

      {/* View Leave Request Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Leave Request Details"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Employee</label>
                <p className="text-primary-text font-medium">{selectedRequest.employeeName}</p>
                <p className="text-xs text-secondary-text">{selectedRequest.employeeEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Leave Type</label>
                <p className="text-primary-text">{selectedRequest.leaveType}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">From</label>
                <p className="text-primary-text">{selectedRequest.startDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">To</label>
                <p className="text-primary-text">{selectedRequest.endDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Days</label>
                <p className="text-primary-text font-medium">{selectedRequest.days}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Reason</label>
              <p className="text-primary-text whitespace-pre-wrap">{selectedRequest.reason || 'No reason provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Status</label>
              <Badge variant={
                selectedRequest.status === 'Approved' ? 'success' : 
                selectedRequest.status === 'Rejected' ? 'danger' : 'warning'
              }>
                {selectedRequest.status}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Requested On</label>
              <p className="text-primary-text">{selectedRequest.createdAt}</p>
            </div>

            {selectedRequest.status === 'Pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'Rejected')}
                  className="flex-1"
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'Approved')}
                  className="flex-1"
                >
                  Approve
                </Button>
              </div>
            )}
            {selectedRequest.status !== 'Pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default LeaveRequests

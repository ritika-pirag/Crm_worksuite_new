import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { leaveRequestsAPI } from '../../../api'
import { IoCreate } from 'react-icons/io5'

const LeaveRequests = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
  })

  useEffect(() => {
    if (userId && companyId) {
      fetchLeaves()
    }
  }, [userId, companyId])

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      const response = await leaveRequestsAPI.getAll({
        company_id: companyId,
        user_id: userId
      })
      if (response.data.success) {
        setLeaves(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.leave_type || !formData.start_date || !formData.end_date) {
      alert('Please fill all required fields')
      return
    }

    try {
      const leaveData = {
        ...formData,
        company_id: companyId,
        user_id: userId
      }
      
      if (selectedLeave) {
        await leaveRequestsAPI.update(selectedLeave.id, leaveData, { company_id: companyId })
      } else {
        await leaveRequestsAPI.create(leaveData)
      }
      alert('Leave request saved successfully!')
      setIsAddModalOpen(false)
      setIsEditModalOpen(false)
      resetForm()
      await fetchLeaves()
    } catch (error) {
      console.error('Error saving leave request:', error)
      alert(error.response?.data?.error || 'Failed to save leave request')
    }
  }

  const handleEdit = (leave) => {
    setSelectedLeave(leave)
    setFormData({
      leave_type: leave.leave_type || '',
      start_date: leave.start_date || '',
      end_date: leave.end_date || '',
      reason: leave.reason || '',
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        await leaveRequestsAPI.delete(id, { company_id: companyId, user_id: userId })
        alert('Leave request deleted successfully!')
        await fetchLeaves()
      } catch (error) {
        console.error('Error deleting leave request:', error)
        alert(error.response?.data?.error || 'Failed to delete leave request')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      leave_type: '',
      start_date: '',
      end_date: '',
      reason: '',
    })
    setSelectedLeave(null)
  }

  const columns = [
    { 
      key: 'leave_type', 
      label: 'Leave Type',
      render: (value) => <span className="font-medium">{value || 'N/A'}</span>
    },
    { 
      key: 'start_date', 
      label: 'From',
      render: (value) => new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    },
    { 
      key: 'end_date', 
      label: 'To',
      render: (value) => new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    },
    {
      key: 'days',
      label: 'Days',
      render: (value) => <span>{value || 0}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          Approved: 'success',
          Pending: 'warning',
          Rejected: 'danger',
        }
        return <Badge variant={statusColors[value] || 'default'}>{value || 'Pending'}</Badge>
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Pending' && (
            <>
              <button
                onClick={() => handleEdit(row)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit"
              >
                <IoCreate size={18} />
              </button>
              <button
                onClick={() => handleDelete(row.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                Delete
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Leave Requests</h1>
          <p className="text-secondary-text mt-1">Manage your leave requests</p>
        </div>
        <AddButton onClick={() => { resetForm(); setIsAddModalOpen(true) }} label="Add Leave" />
      </div>

      <DataTable
        columns={columns}
        data={leaves}
        loading={loading}
        emptyMessage="No leave requests found"
      />

      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          resetForm()
        }}
        title={selectedLeave ? 'Edit Leave Request' : 'Add Leave Request'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.leave_type}
              onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="">Select leave type</option>
              <option value="Annual">Annual</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Vacation">Vacation</option>
              <option value="Personal">Personal</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          <Input
            label="From Date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
          <Input
            label="To Date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter reason for leave..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                resetForm()
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex-1">
              {selectedLeave ? 'Update' : 'Submit'} Leave Request
            </Button>
          </div>
        </div>
      </RightSideModal>
    </div>
  )
}

export default LeaveRequests

import { useState, useEffect } from 'react'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import axiosInstance from '../../../api/axiosInstance'
import { IoCreate, IoTrash, IoEye, IoSearch, IoBriefcase, IoAdd } from 'react-icons/io5'

const OfflineRequests = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [companies, setCompanies] = useState([])
  const [packages, setPackages] = useState([])
  const [formData, setFormData] = useState({
    company_id: '',
    company_name: '',
    package_id: '',
    request_type: 'Payment',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    amount: '',
    currency: 'USD',
    payment_method: '',
    description: '',
    status: 'Pending',
    notes: '',
  })

  useEffect(() => {
    fetchRequests()
    fetchCompanies()
    fetchPackages()
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchRequests()
    }, 500)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, statusFilter])

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get('/superadmin/companies')
      if (response.data.success) {
        setCompanies(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const fetchPackages = async () => {
    try {
      const response = await axiosInstance.get('/superadmin/packages')
      if (response.data.success) {
        setPackages(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    }
  }

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/superadmin/offline-requests', {
        params: {
          search: searchQuery || undefined,
          status: statusFilter || undefined
        }
      })
      if (response.data.success) {
        setRequests(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching offline requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        package_id: formData.package_id ? parseInt(formData.package_id) : null
      }

      if (selectedRequest) {
        await axiosInstance.put(`/superadmin/offline-requests/${selectedRequest.id}`, payload)
      } else {
        await axiosInstance.post('/superadmin/offline-requests', payload)
      }

      setIsAddModalOpen(false)
      setIsEditModalOpen(false)
      setSelectedRequest(null)
      resetForm()
      fetchRequests()
    } catch (error) {
      console.error('Error saving request:', error)
      alert(error.response?.data?.error || 'Failed to save request')
    }
  }

  const handleEdit = (request) => {
    setSelectedRequest(request)
    setFormData({
      company_id: request.company_id || '',
      company_name: request.company_name || request.company_name_from_db || '',
      package_id: request.package_id || '',
      request_type: request.request_type || 'Payment',
      contact_name: request.contact_name || '',
      contact_email: request.contact_email || '',
      contact_phone: request.contact_phone || '',
      amount: request.amount || '',
      currency: request.currency || 'USD',
      payment_method: request.payment_method || '',
      description: request.description || '',
      status: request.status || 'Pending',
      notes: request.notes || '',
    })
    setIsEditModalOpen(true)
  }

  const handleView = (request) => {
    setSelectedRequest(request)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return

    try {
      await axiosInstance.delete(`/superadmin/offline-requests/${id}`)
      fetchRequests()
    } catch (error) {
      console.error('Error deleting request:', error)
      alert(error.response?.data?.error || 'Failed to delete request')
    }
  }

  const resetForm = () => {
    setFormData({
      company_id: '',
      company_name: '',
      package_id: '',
      request_type: 'Payment',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      amount: '',
      currency: 'USD',
      payment_method: '',
      description: '',
      status: 'Pending',
      notes: '',
    })
    setSelectedRequest(null)
  }

  const getStatusBadge = (status) => {
    const variants = {
      'Pending': 'warning',
      'Approved': 'success',
      'Rejected': 'danger',
      'Completed': 'info'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const handleAccept = async (id) => {
    if (!window.confirm('Are you sure you want to accept this company request? A company will be created.')) return

    try {
      const response = await axiosInstance.post(`/superadmin/offline-requests/${id}/accept`)
      if (response.data.success) {
        alert('Company request accepted and company created successfully!')
        fetchRequests()
      }
    } catch (error) {
      console.error('Error accepting request:', error)
      alert(error.response?.data?.error || 'Failed to accept request')
    }
  }

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason (optional):')
    if (reason === null) return // User cancelled

    try {
      const response = await axiosInstance.post(`/superadmin/offline-requests/${id}/reject`, {
        rejection_reason: reason || undefined
      })
      if (response.data.success) {
        alert('Company request rejected successfully!')
        fetchRequests()
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert(error.response?.data?.error || 'Failed to reject request')
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'company_name',
      label: 'Company',
      render: (value, row) => row.company_name_from_db || value || 'N/A'
    },
    {
      key: 'request_type',
      label: 'Type',
      render: (value) => <Badge variant="info">{value}</Badge>
    },
    {
      key: 'package_name',
      label: 'Plan',
      render: (value) => value ? <span className="text-primary-accent font-medium">{value}</span> : 'N/A'
    },
    {
      key: 'contact_name',
      label: 'Contact'
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value, row) => value ? `${row.currency || 'USD'} ${parseFloat(value).toFixed(2)}` : 'N/A'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (value) => new Date(value).toLocaleDateString('en-GB')
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
            title="View"
          >
            <IoEye size={18} />
          </button>
          {row.request_type === 'Company Request' && row.status === 'Pending' && (
            <>
              <button
                onClick={() => handleAccept(row.id)}
                className="p-2 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-colors"
                title="Accept"
              >
                ✓
              </button>
              <button
                onClick={() => handleReject(row.id)}
                className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                title="Reject"
              >
                ✗
              </button>
            </>
          )}
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-primary-accent hover:bg-primary-accent hover:text-white rounded-lg transition-colors"
            title="Edit"
          >
            <IoCreate size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
            title="Delete"
          >
            <IoTrash size={18} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-text">Website requests</h1>
          <p className="text-secondary-text mt-1">Manage website payment and service requests</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary-accent hover:bg-primary-accent/90 text-white flex items-center gap-2"
        >
          <IoAdd size={20} />
          Add Request
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text" size={20} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search requests..."
              className="pl-10"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Requests Table */}
      <Card className="p-0">
        <DataTable
          data={requests}
          columns={columns}
          loading={loading}
          emptyMessage="No website requests found"
        />
      </Card>

      {/* Add/Edit Modal */}
      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          resetForm()
        }}
        title={selectedRequest ? 'Edit Website Request' : 'Add Website Request'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Company
            </label>
            <select
              value={formData.company_id}
              onChange={(e) => {
                const company = companies.find(c => c.id === parseInt(e.target.value))
                setFormData({
                  ...formData,
                  company_id: e.target.value,
                  company_name: company?.name || ''
                })
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
            >
              <option value="">Select Company</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Company Name"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            placeholder="Enter company name"
            required
          />

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Plan
            </label>
            <select
              value={formData.package_id}
              onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
            >
              <option value="">Select Plan</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>{pkg.package_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Request Type
            </label>
            <select
              value={formData.request_type}
              onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
            >
              <option value="Payment">Payment</option>
              <option value="Service">Service</option>
              <option value="Support">Support</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <Input
            label="Contact Name"
            value={formData.contact_name}
            onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
            placeholder="Enter contact name"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="email@example.com"
            />
            <Input
              label="Contact Phone"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="+1234567890"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
            />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>

          <Input
            label="Payment Method"
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            placeholder="Bank Transfer, Cash, etc."
          />

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter request description"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                resetForm()
              }}
              className="px-6 py-2.5"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="px-6 py-2.5 bg-primary-accent text-white hover:bg-primary-accent/90"
            >
              {selectedRequest ? 'Update' : 'Create'} Request
            </Button>
          </div>
        </div>
      </RightSideModal>

      {/* View Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedRequest(null)
        }}
        title="View Website Request"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-text">Company</p>
                <p className="font-medium">{selectedRequest.company_name_from_db || selectedRequest.company_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-text">Request Type</p>
                <p className="font-medium">{selectedRequest.request_type}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-text">Status</p>
                {getStatusBadge(selectedRequest.status)}
              </div>
              <div>
                <p className="text-sm text-secondary-text">Amount</p>
                <p className="font-medium">
                  {selectedRequest.amount ? `${selectedRequest.currency || 'USD'} ${parseFloat(selectedRequest.amount).toFixed(2)}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-text">Contact Name</p>
                <p className="font-medium">{selectedRequest.contact_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-text">Contact Email</p>
                <p className="font-medium">{selectedRequest.contact_email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-text">Contact Phone</p>
                <p className="font-medium">{selectedRequest.contact_phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-text">Payment Method</p>
                <p className="font-medium">{selectedRequest.payment_method || 'N/A'}</p>
              </div>
            </div>
            {selectedRequest.description && (
              <div>
                <p className="text-sm text-secondary-text mb-1">Description</p>
                <p className="text-primary-text">{selectedRequest.description}</p>
              </div>
            )}
            {selectedRequest.notes && (
              <div>
                <p className="text-sm text-secondary-text mb-1">Notes</p>
                <p className="text-primary-text">{selectedRequest.notes}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-secondary-text">Created</p>
              <p className="font-medium">{new Date(selectedRequest.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedRequest(null)
                }}
                className="px-6 py-2.5"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(selectedRequest)
                }}
                className="px-6 py-2.5 bg-primary-accent text-white hover:bg-primary-accent/90"
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default OfflineRequests

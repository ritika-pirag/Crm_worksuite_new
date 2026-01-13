import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import axiosInstance from '../../../api/axiosInstance'
import { IoCreate, IoTrash, IoEye, IoSearch } from 'react-icons/io5'

const Companies = () => {
  const navigate = useNavigate()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [companies, setCompanies] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    address: '',
    notes: '',
    currency: 'USD',
    timezone: 'UTC',
    package_id: '',
  })

  useEffect(() => {
    fetchCompanies()
    fetchPackages()
  }, [])

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

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/superadmin/companies', {
        params: { search: searchQuery }
      })
      if (response.data.success) {
        setCompanies(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCompanies()
    }, 500)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleSave = async () => {
    try {
      if (selectedCompany) {
        await axiosInstance.put(`/superadmin/companies/${selectedCompany.id}`, formData)
      } else {
        await axiosInstance.post('/superadmin/companies', formData)
      }

      setIsAddModalOpen(false)
      setIsEditModalOpen(false)
      setSelectedCompany(null)
      resetForm()
      fetchCompanies()
    } catch (error) {
      console.error('Error saving company:', error)
      alert(error.response?.data?.error || 'Failed to save company')
    }
  }

  const handleEdit = (company) => {
    setSelectedCompany(company)
    setFormData({
      name: company.name || '',
      industry: company.industry || '',
      website: company.website || '',
      address: company.address || '',
      notes: company.notes || '',
      currency: company.currency || 'USD',
      timezone: company.timezone || 'UTC',
      package_id: company.package_id || '',
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return

    try {
      await axiosInstance.delete(`/superadmin/companies/${id}`)
      fetchCompanies()
    } catch (error) {
      console.error('Error deleting company:', error)
      alert(error.response?.data?.error || 'Failed to delete company')
    }
  }

  const handleView = (company) => {
    setSelectedCompany(company)
    setIsViewModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      website: '',
      address: '',
      notes: '',
      currency: 'USD',
      timezone: 'UTC',
      package_id: '',
    })
    setSelectedCompany(null)
  }

  const columns = [
    { key: 'name', label: 'Company Name' },
    { key: 'industry', label: 'Industry' },
    {
      key: 'package_name',
      label: 'Plan',
      render: (value) => (
        <span className="text-primary-accent font-medium">
          {value || 'No Plan'}
        </span>
      ),
    },
    {
      key: 'total_users',
      label: 'Users',
      render: (value) => <span>{value || 0}</span>,
    },
    {
      key: 'total_clients',
      label: 'Clients',
      render: (value) => <span>{value || 0}</span>,
    },
    {
      key: 'total_projects',
      label: 'Projects',
      render: (value) => <span>{value || 0}</span>,
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => (
        <span>{new Date(value).toLocaleDateString('en-GB')}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
          >
            <IoEye size={18} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-primary-accent hover:bg-primary-accent hover:text-white rounded-lg transition-colors"
          >
            <IoCreate size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
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
          <h1 className="text-2xl md:text-3xl font-bold text-primary-text">Companies</h1>
          <p className="text-secondary-text mt-1">Manage all companies in the system</p>
        </div>
        <AddButton onClick={() => { resetForm(); setIsAddModalOpen(true) }} label="Add Company" />
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text" size={20} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies..."
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Companies Table */}
      <Card className="p-0">
        <DataTable
          data={companies}
          columns={columns}
          loading={loading}
          emptyMessage="No companies found"
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
        title={selectedCompany ? 'Edit Company' : 'Add Company'}
      >
        <div className="space-y-4">
          <Input
            label="Company Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter company name"
            required
          />

          <Input
            label="Industry"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            placeholder="e.g., Technology, Healthcare"
          />

          <Input
            label="Website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://example.com"
          />

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Plan / Package
            </label>
            <select
              value={formData.package_id}
              onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
            >
              <option value="">Select Plan</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.package_name} - ${pkg.price}/{pkg.billing_cycle}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <Input
              label="Timezone"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              placeholder="UTC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter company address"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
              rows={3}
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
              {selectedCompany ? 'Update' : 'Create'} Company
            </Button>
          </div>
        </div>
      </RightSideModal>

      {/* View Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedCompany(null)
        }}
        title="View Company"
      >
        {selectedCompany && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Company Name</label>
              <p className="text-primary-text font-semibold">{selectedCompany.name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Industry</label>
              <p className="text-primary-text">{selectedCompany.industry || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Website</label>
              <p className="text-primary-text">
                {selectedCompany.website ? (
                  <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-primary-accent hover:underline">
                    {selectedCompany.website}
                  </a>
                ) : 'N/A'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Currency</label>
                <p className="text-primary-text">{selectedCompany.currency || 'USD'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Timezone</label>
                <p className="text-primary-text">{selectedCompany.timezone || 'UTC'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Users</label>
              <p className="text-primary-text">{selectedCompany.total_users || 0}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Clients</label>
              <p className="text-primary-text">{selectedCompany.total_clients || 0}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Projects</label>
              <p className="text-primary-text">{selectedCompany.total_projects || 0}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Address</label>
              <p className="text-primary-text">{selectedCompany.address || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Notes</label>
              <p className="text-primary-text">{selectedCompany.notes || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Created</label>
              <p className="text-primary-text">
                {selectedCompany.created_at ? new Date(selectedCompany.created_at).toLocaleString('en-GB') : 'N/A'}
              </p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedCompany(null)
                }}
                className="px-6 py-2.5"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(selectedCompany)
                }}
                className="px-6 py-2.5 bg-primary-accent text-white hover:bg-primary-accent/90"
              >
                Edit Company
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default Companies


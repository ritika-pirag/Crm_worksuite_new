import { useState, useEffect } from 'react'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { companiesAPI } from '../../../api'
import { IoCreate, IoTrash, IoEye } from 'react-icons/io5'

const Companies = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    address: '',
    notes: '',
  })

  const [companies, setCompanies] = useState([])

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await companiesAPI.getAll()
      if (response.data.success) {
        const fetchedCompanies = response.data.data || []
        // Transform API data to match component format
        const transformedCompanies = fetchedCompanies.map(company => ({
          id: company.id,
          name: company.name || '',
          industry: company.industry ?? '',
          website: company.website ?? '',
          address: company.address ?? '',
          notes: company.notes ?? '',
          totalClients: company.total_clients || 0,
          createdDate: company.created_at ? new Date(company.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }) : '',
          status: company.status || 'Active',
          package: company.package_name || 'Free',
          packagePrice: company.package_price || '$0/mo',
        }))
        setCompanies(transformedCompanies)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
      // Fallback to empty array if API fails
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  const handleImpersonate = (company) => {
    if (window.confirm(`Login as ${company.name}? You will be redirected to their admin dashboard.`)) {
      // In a real app, this would set a session token and redirect
      alert(`Impersonating ${company.name}. Redirecting...`)
      // navigate(`/app/admin/dashboard?impersonate=${company.id}`)
    }
  }

  const columns = [
    { 
      key: 'logo', 
      label: 'Logo',
      render: (value, row) => (
        <div className="w-10 h-10 rounded-full bg-primary-accent/20 flex items-center justify-center text-primary-accent font-semibold">
          {row.name.substring(0, 2).toUpperCase()}
        </div>
      ),
    },
    { key: 'name', label: 'Company Name' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={value === 'Active' ? 'success' : 'danger'}>{value}</Badge>
      ),
    },
    {
      key: 'package',
      label: 'Package',
      render: (value, row) => (
        <div>
          <Badge variant={value === 'Pro' ? 'success' : value === 'Basic' ? 'info' : 'default'}>
            {value}
          </Badge>
          <p className="text-xs text-secondary-text mt-1">{row.packagePrice}</p>
        </div>
      ),
    },
    { key: 'createdDate', label: 'Created Date' },
  ]

  const handleAdd = () => {
    setFormData({ name: '', industry: '', website: '', address: '', notes: '' })
    setIsAddModalOpen(true)
  }

  const handleEdit = async (company) => {
    try {
      // Fetch full company data to ensure all fields are available
      const response = await companiesAPI.getById(company.id)
      if (response.data.success && response.data.data) {
        const fullCompanyData = response.data.data
        setSelectedCompany(fullCompanyData)
        // Populate form with API data - handle null/undefined values
        setFormData({
          name: fullCompanyData.name || '',
          industry: fullCompanyData.industry ?? '',
          website: fullCompanyData.website ?? '',
          address: fullCompanyData.address ?? '',
          notes: fullCompanyData.notes ?? '',
        })
        setIsEditModalOpen(true)
      } else {
        // Fallback to row data if API fails
        setSelectedCompany(company)
        setFormData({
          name: company.name || '',
          industry: company.industry || '',
          website: company.website || '',
          address: company.address || '',
          notes: company.notes || '',
        })
        setIsEditModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching company details:', error)
      // Fallback to row data if API fails
      setSelectedCompany(company)
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        website: company.website || '',
        address: company.address || '',
        notes: company.notes || '',
      })
      setIsEditModalOpen(true)
    }
  }

  const handleView = (company) => {
    setSelectedCompany(company)
    setIsViewModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name) {
      alert('Company Name is required')
      return
    }

    try {
      const companyData = {
        name: formData.name.trim(),
        industry: formData.industry || null,
        website: formData.website || null,
        address: formData.address || null,
        notes: formData.notes || null,
      }

      if (isEditModalOpen && selectedCompany) {
        const response = await companiesAPI.update(selectedCompany.id, companyData)
        if (response.data.success) {
          alert('Company updated successfully!')
          await fetchCompanies()
          setIsEditModalOpen(false)
        } else {
          alert(response.data.error || 'Failed to update company')
        }
      } else {
        const response = await companiesAPI.create(companyData)
        if (response.data.success) {
          alert('Company created successfully!')
          await fetchCompanies()
          setIsAddModalOpen(false)
        } else {
          alert(response.data.error || 'Failed to create company')
        }
      }
      
      // Reset form
      setFormData({
        name: '',
        industry: '',
        website: '',
        address: '',
        notes: '',
      })
    } catch (error) {
      console.error('Error saving company:', error)
      alert(error.response?.data?.error || 'Failed to save company')
    }
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
          handleEdit(row)
        }}
        className="p-2 text-warning hover:bg-warning hover:bg-opacity-10 rounded transition-colors"
        title="Edit"
      >
        <IoCreate size={18} />
      </button>
      <button
        onClick={async (e) => {
          e.stopPropagation()
          if (window.confirm(`Delete ${row.name}?`)) {
            try {
              const response = await companiesAPI.delete(row.id)
              if (response.data.success) {
                alert('Company deleted successfully!')
                await fetchCompanies()
              } else {
                alert(response.data.error || 'Failed to delete company')
              }
            } catch (error) {
              console.error('Error deleting company:', error)
              alert(error.response?.data?.error || 'Failed to delete company')
            }
          }
        }}
        className="p-2 text-danger hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
        title="Delete"
      >
        <IoTrash size={18} />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Companies</h1>
          <p className="text-secondary-text mt-1">Manage company information</p>
        </div>
        <AddButton onClick={handleAdd} label="Add Company" />
      </div>

      <DataTable
        columns={columns}
        data={companies}
        searchPlaceholder="Search companies..."
        filters={true}
        filterConfig={[
          { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
          { key: 'industry', label: 'Industry', type: 'text' },
        ]}
        actions={actions}
        bulkActions={true}
      />

      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setFormData({ name: '', industry: '', website: '', address: '', notes: '' })
        }}
        title={isAddModalOpen ? 'Add New Company' : 'Edit Company'}
      >
        <div className="space-y-4">
          <Input
            label="Company Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Industry"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          />
          <Input
            label="Website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            />
          </div>
          <div className="flex gap-3 pt-4 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                setFormData({ name: '', industry: '', website: '', address: '', notes: '' })
              }}
              className="px-4"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="px-4">
              {isAddModalOpen ? 'Save Company' : 'Update Company'}
            </Button>
          </div>
        </div>
      </RightSideModal>

      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Company Details"
      >
        {selectedCompany && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-secondary-text">Company Name</label>
              <p className="text-primary-text mt-1">{selectedCompany.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Industry</label>
              <p className="text-primary-text mt-1">{selectedCompany.industry}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Website</label>
              <p className="text-primary-text mt-1">{selectedCompany.website}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Total Clients</label>
              <p className="text-primary-text mt-1">{selectedCompany.totalClients}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Created Date</label>
              <p className="text-primary-text mt-1">{selectedCompany.createdDate}</p>
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default Companies

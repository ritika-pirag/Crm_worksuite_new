import { useState, useEffect } from 'react'
import AddButton from '../../../components/ui/AddButton'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Button from '../../../components/ui/Button'
import axiosInstance from '../../../api/axiosInstance'
import { IoCreate, IoTrash, IoEye, IoSearch, IoFilter, IoClose } from 'react-icons/io5'

const Users = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
    company_id: '',
    status: 'Active',
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchCompanies()
  }, [roleFilter, companyFilter, statusFilter])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers()
    }, 500)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/superadmin/users', {
        params: {
          search: searchQuery,
          role: roleFilter || undefined,
          company_id: companyFilter || undefined
        }
      })
      if (response.data.success) {
        let filteredUsers = response.data.data || []
        
        // Filter by status on frontend
        if (statusFilter) {
          filteredUsers = filteredUsers.filter(user => user.status === statusFilter)
        }
        
        setUsers(filteredUsers)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'ADMIN',
      company_id: '',
      status: 'Active',
    })
    setShowPassword(false)
    setIsAddModalOpen(true)
  }

  const handleEdit = async (user) => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/superadmin/users/${user.id}`)
      if (response.data.success) {
        const userData = response.data.data
        setSelectedUser(user)
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          password: '', // Don't show password
          role: userData.role || 'ADMIN',
          company_id: userData.company_id?.toString() || '',
          status: userData.status || 'Active',
        })
        setIsEditModalOpen(true)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      alert(error.response?.data?.error || 'Failed to fetch user details')
    } finally {
      setLoading(false)
    }
  }

  const handleView = async (user) => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/superadmin/users/${user.id}`)
      if (response.data.success) {
        setSelectedUser(response.data.data)
        setIsViewModalOpen(true)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setSelectedUser(user)
      setIsViewModalOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      await axiosInstance.delete(`/superadmin/users/${id}`)
      alert('User deleted successfully!')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(error.response?.data?.error || 'Failed to delete user')
    }
  }

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.name.trim()) {
      alert('Name is required')
      return
    }

    if (!formData.email || !formData.email.trim()) {
      alert('Email is required')
      return
    }

    if (isAddModalOpen && !formData.password) {
      alert('Password is required for new user')
      return
    }

    if (!formData.role) {
      alert('Role is required')
      return
    }

    try {
      setSaving(true)
      
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        company_id: formData.company_id ? parseInt(formData.company_id) : null,
        status: formData.status,
      }

      // Only include password if it's provided (for new user or password change)
      if (formData.password) {
        userData.password = formData.password
      }

      if (isEditModalOpen && selectedUser) {
        await axiosInstance.put(`/superadmin/users/${selectedUser.id}`, userData)
        alert('User updated successfully!')
      } else {
        await axiosInstance.post('/superadmin/users', userData)
        alert('User created successfully!')
      }

      setIsAddModalOpen(false)
      setIsEditModalOpen(false)
      setSelectedUser(null)
      resetForm()
      fetchUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      alert(error.response?.data?.error || 'Failed to save user')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'ADMIN',
      company_id: '',
      status: 'Active',
    })
    setShowPassword(false)
    setSelectedUser(null)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setRoleFilter('')
    setCompanyFilter('')
    setStatusFilter('')
  }

  const hasActiveFilters = searchQuery || roleFilter || companyFilter || statusFilter

  const columns = [
    { 
      key: 'name', 
      label: 'Name',
      className: 'font-medium text-primary-text'
    },
    { 
      key: 'email', 
      label: 'Email',
      className: 'text-secondary-text'
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <Badge variant={value === 'ADMIN' ? 'info' : value === 'SUPERADMIN' ? 'default' : 'default'}>
          {value}
        </Badge>
      ),
    },
    { 
      key: 'company_name', 
      label: 'Company',
      className: 'text-secondary-text'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={value === 'Active' ? 'success' : 'warning'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => (
        <span className="text-sm text-secondary-text">
          {new Date(value).toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="p-2 text-primary-accent hover:bg-primary-accent/10 rounded-lg transition-colors"
            title="View"
          >
            <IoEye size={18} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <IoCreate size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <IoTrash size={18} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Users</h1>
          <p className="text-sm sm:text-base text-secondary-text mt-1">Manage all users across all companies</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <IoFilter size={18} />
            Filters
            {hasActiveFilters && (
              <span className="bg-primary-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {[searchQuery, roleFilter, companyFilter, statusFilter].filter(Boolean).length}
              </span>
            )}
          </Button>
          <AddButton onClick={handleAdd} label="Add User" />
        </div>
      </div>

      {/* Filters */}
      {(showFilters || hasActiveFilters) && (
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary-text">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-accent hover:underline flex items-center gap-1"
              >
                <IoClose size={16} />
                Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text" size={20} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent outline-none text-sm"
              >
                <option value="">All Roles</option>
                <option value="SUPERADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Company</label>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent outline-none text-sm"
              >
                <option value="">All Companies</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent outline-none text-sm"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary-text">
              Users ({users.length})
            </h3>
          </div>
        </div>
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          emptyMessage="No users found"
        />
      </Card>

      {/* Add/Edit Modal */}
      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedUser(null)
          resetForm()
        }}
        title={isAddModalOpen ? 'Add New User' : 'Edit User'}
      >
        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter user name"
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              {isAddModalOpen ? 'Password' : 'New Password'} {isAddModalOpen && <span className="text-red-500">*</span>}
              {!isAddModalOpen && <span className="text-xs text-secondary-text ml-2">(Leave blank to keep current password)</span>}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={isAddModalOpen ? 'Enter password' : 'Enter new password'}
                required={isAddModalOpen}
                className="w-full pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text hover:text-primary-text text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
              required
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPERADMIN">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Company
            </label>
            <select
              value={formData.company_id}
              onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
            >
              <option value="">-- Select Company (Optional) --</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-secondary-text mt-1.5">
              Select a company to assign this user to. Leave blank for SuperAdmin users.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : isAddModalOpen ? 'Create User' : 'Update User'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                setSelectedUser(null)
                resetForm()
              }}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
          </div>
        </div>
      </RightSideModal>

      {/* View Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedUser(null)
        }}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="text-sm font-medium text-secondary-text">Name</label>
              <p className="text-primary-text mt-1.5 text-base font-medium">{selectedUser.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Email</label>
              <p className="text-primary-text mt-1.5 text-base">{selectedUser.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Role</label>
              <div className="mt-1.5">
                <Badge variant={selectedUser.role === 'ADMIN' ? 'info' : 'default'}>
                  {selectedUser.role || 'N/A'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Company</label>
              <p className="text-primary-text mt-1.5 text-base">{selectedUser.company_name || 'Not Assigned'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Status</label>
              <div className="mt-1.5">
                <Badge variant={selectedUser.status === 'Active' ? 'success' : 'warning'}>
                  {selectedUser.status || 'N/A'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Created At</label>
              <p className="text-primary-text mt-1.5 text-base">
                {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default Users

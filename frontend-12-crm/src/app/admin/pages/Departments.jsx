import { useState, useEffect } from 'react'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { departmentsAPI } from '../../../api'
import { IoCreate, IoTrash, IoEye } from 'react-icons/io5'
import { useAuth } from '../../../context/AuthContext'

const Departments = () => {
  const { user } = useAuth()
  const companyId = user?.company_id || localStorage.getItem('companyId') || 1

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedDept, setSelectedDept] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
  })

  const [departments, setDepartments] = useState([])

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments()
  }, [])

  // Fetch departments from API (filtered by company_id)
  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await departmentsAPI.getAll({ company_id: companyId })
      
      if (response.data.success) {
        const fetchedDepartments = response.data.data || []
        
        // Transform API data to match component format
        const transformedDepartments = fetchedDepartments.map(dept => ({
          id: dept.id,
          name: dept.name || '',
          company_id: dept.company_id || null,
          company_name: dept.company_name || 'Not Assigned',
          totalEmployees: dept.total_employees || 0,
        }))
        
        setDepartments(transformedDepartments)
      } else {
        setDepartments([])
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Department Name' },
    { key: 'totalEmployees', label: 'Total Employees' },
  ]

  const handleAdd = () => {
    setFormData({ name: '' })
    setIsAddModalOpen(true)
  }

  const handleView = async (dept) => {
    try {
      const response = await departmentsAPI.getById(dept.id, { company_id: companyId })
      if (response.data.success) {
        const deptData = response.data.data
        setSelectedDept({
          id: deptData.id,
          name: deptData.name || '',
          company_id: deptData.company_id || null,
          company_name: deptData.company_name || 'Not Assigned',
          totalEmployees: deptData.total_employees || 0,
        })
        setIsViewModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching department details:', error)
      setSelectedDept(dept)
      setIsViewModalOpen(true)
    }
  }

  const handleEdit = (dept) => {
    setSelectedDept(dept)
    setFormData({ 
      name: dept.name || '', 
    })
    setIsEditModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.name.trim()) {
      alert('Department Name is required')
      return
    }

    try {
      const departmentData = {
        name: formData.name.trim(),
        company_id: parseInt(companyId), // Auto-set from session
      }
      
      console.log('Saving department with data:', departmentData)

      if (isEditModalOpen && selectedDept) {
        const response = await departmentsAPI.update(selectedDept.id, departmentData, { company_id: companyId })
        if (response.data.success) {
          alert('Department updated successfully!')
          await fetchDepartments()
          setIsEditModalOpen(false)
          setSelectedDept(null)
        } else {
          alert(response.data.error || 'Failed to update department')
        }
      } else {
        const response = await departmentsAPI.create(departmentData)
        if (response.data.success) {
          alert('Department created successfully!')
          await fetchDepartments()
          setIsAddModalOpen(false)
        } else {
          alert(response.data.error || 'Failed to create department')
        }
      }
      
      // Reset form
      setFormData({ name: '' })
    } catch (error) {
      console.error('Error saving department:', error)
      alert(error.response?.data?.error || 'Failed to save department')
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
        title="View"
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
          if (window.confirm(`Delete ${row.name} department?`)) {
            try {
              const response = await departmentsAPI.delete(row.id, { company_id: companyId })
              if (response.data.success) {
                alert('Department deleted successfully!')
                await fetchDepartments()
              } else {
                alert(response.data.error || 'Failed to delete department')
              }
            } catch (error) {
              console.error('Error deleting department:', error)
              alert(error.response?.data?.error || 'Failed to delete department')
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
          <h1 className="text-3xl font-bold text-primary-text">Departments</h1>
          <p className="text-secondary-text mt-1">Manage departments</p>
        </div>
        <AddButton onClick={handleAdd} label="Add Department" />
      </div>

      <DataTable
        columns={columns}
        data={departments}
        loading={loading}
        searchPlaceholder="Search departments..."
        filters={true}
        filterConfig={[
          { key: 'name', label: 'Department Name', type: 'text' },
        ]}
        actions={actions}
        bulkActions={true}
      />

      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setFormData({ name: '' })
          setSelectedDept(null)
        }}
        title={isAddModalOpen ? 'Add Department' : 'Edit Department'}
      >
        <div className="space-y-4">
          {/* Company ID - Hidden field (auto-set from session) */}
          <input type="hidden" name="company_id" value={companyId} />
          
          <Input
            label="Department Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter department name"
            required
          />
          
          <div className="flex gap-3 pt-4 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                setFormData({ name: '' })
                setSelectedDept(null)
              }}
              className="px-4"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="px-4">
              {isAddModalOpen ? 'Save Department' : 'Update Department'}
            </Button>
          </div>
        </div>
      </RightSideModal>

      {/* View Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Department Details"
      >
        {selectedDept && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-secondary-text">Department Name</label>
              <p className="text-primary-text mt-1 text-base">{selectedDept.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Company Name</label>
              <p className="text-primary-text mt-1 text-base">
                {selectedDept.company_name || 'Not Assigned'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Total Employees</label>
              <p className="text-primary-text mt-1 text-base">{selectedDept.totalEmployees || 0}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(selectedDept)
                }}
                className="flex-1"
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

export default Departments

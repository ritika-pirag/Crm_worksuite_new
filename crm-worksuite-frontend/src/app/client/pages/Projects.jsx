import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import AddButton from '../../../components/ui/AddButton'
import { projectsAPI } from '../../../api'
import { IoEye, IoCreate, IoTrash, IoCheckmarkCircle, IoTime, IoCalendar } from 'react-icons/io5'

const Projects = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const clientId = user?.client_id || localStorage.getItem('clientId')
  const companyId = parseInt(user?.company_id || localStorage.getItem('companyId') || 1, 10)
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [validClientId, setValidClientId] = useState(null)
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    start_date: '',
    deadline: '',
    status: 'Not Started',
    budget: '',
    notes: '',
  })

  useEffect(() => {
    if (companyId) {
      // Set valid client ID - backend will handle finding client by client_id or owner_id
      setValidClientId(clientId || userId || null)
      fetchProjects()
    }
  }, [companyId, clientId, userId])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await projectsAPI.getAll({
        company_id: companyId,
        client_id: validClientId || clientId || userId || null
      })
      if (response.data && response.data.success) {
        const fetchedProjects = response.data.data || []
        const transformedProjects = fetchedProjects.map(proj => ({
          id: proj.id,
          project: proj.project_name || proj.name || `Project #${proj.id}`,
          project_name: proj.project_name || proj.name || '',
          description: proj.description || '',
          status: proj.status || 'Not Started',
          progress: proj.progress || 0,
          start_date: proj.start_date || '',
          deadline: proj.deadline || '',
          budget: proj.budget || 0,
          notes: proj.notes || '',
          created_by: proj.created_by,
          created_by_name: proj.created_by_name || 'Admin',
          created_at: proj.created_at,
          ...proj
        }))
        setProjects(transformedProjects)
      } else {
        console.error('Failed to fetch projects:', response.data)
        setProjects([])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({
      project_name: '',
      description: '',
      start_date: new Date().toISOString().split('T')[0],
      deadline: '',
      status: 'Not Started',
      budget: '',
      notes: '',
    })
    setSelectedProject(null)
    setIsAddModalOpen(true)
  }

  const handleEdit = (project) => {
    setSelectedProject(project)
    setFormData({
      project_name: project.project_name || project.project || '',
      description: project.description || '',
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
      status: project.status || 'Not Started',
      budget: project.budget || '',
      notes: project.notes || '',
    })
    setIsEditModalOpen(true)
  }

  const handleView = (project) => {
    setSelectedProject(project)
    setIsViewModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.project_name || !formData.project_name.trim()) {
      alert('Project name is required')
      return
    }

    try {
      const projectData = {
        project_name: formData.project_name.trim(),
        description: formData.description || null,
        start_date: formData.start_date || null,
        deadline: formData.deadline || null,
        status: formData.status || 'Not Started',
        budget: formData.budget ? parseFloat(formData.budget) : null,
        notes: formData.notes || null,
        company_id: companyId,
        client_id: validClientId || clientId || userId || null,
      }

      if (selectedProject && selectedProject.id) {
        // Update existing project
        const response = await projectsAPI.update(selectedProject.id, projectData, { company_id: companyId })
        if (response.data && response.data.success) {
          alert('Project updated successfully!')
          setIsEditModalOpen(false)
          setSelectedProject(null)
          resetForm()
          await fetchProjects()
        } else {
          alert(response.data?.error || 'Failed to update project')
        }
      } else {
        // Create new project
        const response = await projectsAPI.create(projectData, { company_id: companyId })
        if (response.data && response.data.success) {
          alert('Project created successfully!')
          setIsAddModalOpen(false)
          resetForm()
          await fetchProjects()
        } else {
          alert(response.data?.error || 'Failed to create project')
        }
      }
    } catch (error) {
      console.error('Error saving project:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Failed to save project'
      alert(errorMessage)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await projectsAPI.delete(id, { company_id: companyId })
        if (response.data && response.data.success) {
          alert('Project deleted successfully!')
          await fetchProjects()
        } else {
          alert(response.data?.error || 'Failed to delete project')
        }
      } catch (error) {
        console.error('Error deleting project:', error)
        const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Failed to delete project'
        alert(errorMessage)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      project_name: '',
      description: '',
      start_date: '',
      deadline: '',
      status: 'Not Started',
      budget: '',
      notes: '',
    })
    setSelectedProject(null)
  }

  const columns = [
    { 
      key: 'project', 
      label: 'Project',
      render: (value, row) => (
        <div>
          <p className="font-medium text-primary-text">{value}</p>
          {row.created_by_name && (
            <p className="text-xs text-secondary-text">By: {row.created_by_name}</p>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          'Not Started': 'default',
          'In Progress': 'info',
          'Active': 'info',
          'On Hold': 'warning',
          'Completed': 'success',
          'Cancelled': 'danger',
        }
        return <Badge variant={statusColors[value] || 'default'}>{value}</Badge>
      },
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-accent h-2 rounded-full transition-all"
              style={{ width: `${value || 0}%` }}
            />
          </div>
          <span className="text-sm text-secondary-text">{value || 0}%</span>
        </div>
      ),
    },
    { 
      key: 'start_date', 
      label: 'Start Date',
      render: (value) => value ? new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) : 'N/A'
    },
    { 
      key: 'deadline', 
      label: 'Deadline',
      render: (value) => value ? new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) : 'N/A'
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
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEdit(row)
        }}
        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
        title="Edit"
      >
        <IoCreate size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDelete(row.id)
        }}
        className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
        title="Delete"
      >
        <IoTrash size={18} />
      </button>
    </div>
  )

  const projectFormJSX = (
    <div className="space-y-4">
      <Input
        label="Project Name"
        value={formData.project_name || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
        placeholder="Enter project name"
        required
      />
      <div>
        <label className="block text-sm font-medium text-primary-text mb-2">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
          placeholder="Describe your project..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          value={formData.start_date || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
        />
        <Input
          label="Deadline"
          type="date"
          value={formData.deadline || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary-text mb-2">Status</label>
        <select
          value={formData.status || 'Not Started'}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
        >
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <Input
        label="Budget"
        type="number"
        value={formData.budget || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
        placeholder="Enter budget amount"
        min="0"
        step="0.01"
      />
      <div>
        <label className="block text-sm font-medium text-primary-text mb-2">Notes</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
          placeholder="Additional notes..."
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
          {selectedProject ? 'Update' : 'Create'} Project
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Projects</h1>
          <p className="text-secondary-text mt-1">Manage your projects</p>
        </div>
        <AddButton onClick={handleAdd} label="Add Project" />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading projects...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          searchPlaceholder="Search projects..."
          filters={true}
          filterConfig={[
            { key: 'status', label: 'Status', type: 'select', options: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'] },
            { key: 'deadline', label: 'Deadline', type: 'daterange' },
          ]}
          actions={actions}
          bulkActions={false}
          emptyMessage="No projects found. Click 'Add Project' to create one."
        />
      )}

      {/* Add Project Modal */}
      <RightSideModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          resetForm()
        }}
        title="Add New Project"
      >
        {projectFormJSX}
      </RightSideModal>

      {/* Edit Project Modal */}
      <RightSideModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          resetForm()
        }}
        title="Edit Project"
      >
        {projectFormJSX}
      </RightSideModal>

      {/* View Project Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Project Details"
      >
        {selectedProject && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-primary-text">{selectedProject.project}</h3>
              {selectedProject.created_by_name && (
                <p className="text-sm text-secondary-text mt-1">Created by: {selectedProject.created_by_name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <IoCheckmarkCircle className="text-primary-accent" size={16} />
                  <label className="text-xs text-secondary-text">Status</label>
                </div>
                <Badge
                  variant={
                    selectedProject.status === 'Completed' ? 'success' :
                    selectedProject.status === 'In Progress' ? 'info' :
                    selectedProject.status === 'On Hold' ? 'warning' :
                    selectedProject.status === 'Cancelled' ? 'danger' : 'default'
                  }
                >
                  {selectedProject.status}
                </Badge>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <IoTime className="text-primary-accent" size={16} />
                  <label className="text-xs text-secondary-text">Progress</label>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-accent h-2 rounded-full"
                      style={{ width: `${selectedProject.progress || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{selectedProject.progress || 0}%</span>
                </div>
              </div>
            </div>

            {selectedProject.description && (
              <div>
                <label className="text-sm font-medium text-secondary-text">Description</label>
                <p className="text-primary-text mt-1 whitespace-pre-wrap">{selectedProject.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <IoCalendar className="text-primary-accent" size={16} />
                  <label className="text-sm font-medium text-secondary-text">Start Date</label>
                </div>
                <p className="text-primary-text">
                  {selectedProject.start_date 
                    ? new Date(selectedProject.start_date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) 
                    : 'Not set'}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <IoCalendar className="text-red-500" size={16} />
                  <label className="text-sm font-medium text-secondary-text">Deadline</label>
                </div>
                <p className="text-primary-text">
                  {selectedProject.deadline 
                    ? new Date(selectedProject.deadline).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) 
                    : 'Not set'}
                </p>
              </div>
            </div>

            {selectedProject.budget > 0 && (
              <div>
                <label className="text-sm font-medium text-secondary-text">Budget</label>
                <p className="text-primary-text text-xl font-bold mt-1">
                  ${parseFloat(selectedProject.budget).toLocaleString()}
                </p>
              </div>
            )}

            {selectedProject.notes && (
              <div>
                <label className="text-sm font-medium text-secondary-text">Notes</label>
                <p className="text-primary-text mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                  {selectedProject.notes}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(selectedProject)
                }}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <IoCreate size={18} />
                Edit Project
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default Projects

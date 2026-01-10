import { useState, useEffect, useCallback } from 'react'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { IoCreate, IoTrash } from 'react-icons/io5'
import { timeTrackingAPI, projectsAPI, tasksAPI, employeesAPI } from '../../../api'
import { useAuth } from '../../../context/AuthContext'

const TimeTracking = () => {
  const { user } = useAuth()
  const companyId = user?.company_id || localStorage.getItem('companyId') || 1
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [timeEntries, setTimeEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    user_id: '',
    project_id: '',
    task_id: '',
    hours: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  })

  const fetchTimeEntries = useCallback(async () => {
    try {
      setLoading(true)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchTimeEntries:', companyId)
        setTimeEntries([])
        setLoading(false)
        return
      }
      const response = await timeTrackingAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        const entries = response.data.data || []
        const transformedEntries = entries.map(entry => {
          const dateObj = new Date(entry.date)
          const formattedDate = dateObj.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
          return {
            id: entry.id,
            employee: entry.employee_name || 'Unknown',
            project: entry.project_name || 'N/A',
            task: entry.task_title || 'N/A',
            hours: parseFloat(entry.hours || 0),
            date: formattedDate,
            user_id: entry.user_id,
            project_id: entry.project_id,
            task_id: entry.task_id,
            description: entry.description,
            rawDate: entry.date
          }
        })
        setTimeEntries(transformedEntries)
      }
    } catch (error) {
      console.error('Error fetching time entries:', error)
      alert(error.response?.data?.error || 'Failed to fetch time entries')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  const fetchProjects = useCallback(async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchProjects:', companyId)
        setProjects([])
        return
      }
      console.log('Fetching projects with company_id:', companyId)
      const response = await projectsAPI.getAll({ company_id: companyId })
      console.log('Projects API response:', response.data)
      if (response.data.success) {
        const projectsData = response.data.data || []
        console.log('Fetched projects count:', projectsData.length)
        console.log('Fetched projects data:', projectsData)
        if (projectsData.length > 0) {
          console.log('First project sample:', projectsData[0])
        }
        setProjects(projectsData)
      } else {
        console.error('Projects API returned success: false', response.data)
        setProjects([])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      console.error('Error details:', error.response?.data)
      setProjects([])
    }
  }, [companyId])

  const fetchTasks = useCallback(async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchTasks:', companyId)
        setTasks([])
        return
      }
      const response = await tasksAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        const tasksData = response.data.data || []
        console.log('Fetched tasks:', tasksData)
        setTasks(tasksData)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      console.error('Error details:', error.response?.data)
    }
  }, [companyId])

  // Fetch tasks when project is selected
  useEffect(() => {
    if (formData.project_id) {
      const projectTasks = tasks.filter(task => task.project_id == formData.project_id)
      // Tasks are already fetched, just filter them
    }
  }, [formData.project_id, tasks])

  const fetchEmployees = useCallback(async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchEmployees:', companyId)
        setEmployees([])
        return
      }
      const response = await employeesAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        const employeesData = response.data.data || []
        console.log('Fetched employees:', employeesData)
        setEmployees(employeesData)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      console.error('Error details:', error.response?.data)
    }
  }, [companyId])

  useEffect(() => {
    if (companyId) {
      fetchTimeEntries()
      fetchProjects()
      fetchTasks()
      fetchEmployees()
    }
  }, [companyId]) // Only re-fetch when companyId changes

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'project', label: 'Project' },
    { key: 'task', label: 'Task' },
    {
      key: 'hours',
      label: 'Time Logged',
      render: (value) => `${value} hrs`,
    },
    { key: 'date', label: 'Date' },
  ]

  const handleAdd = async () => {
    setSelectedEntry(null)
    setFormData({
      user_id: '',
      project_id: '',
      task_id: '',
      hours: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    })
    // Ensure data is loaded before opening modal
    if (projects.length === 0) {
      await fetchProjects()
    }
    if (employees.length === 0) {
      await fetchEmployees()
    }
    if (tasks.length === 0) {
      await fetchTasks()
    }
    setIsAddModalOpen(true)
  }

  const handleEdit = (entry) => {
    setSelectedEntry(entry)
    setFormData({
      user_id: entry.user_id || '',
      project_id: entry.project_id || '',
      task_id: entry.task_id || '',
      hours: entry.hours?.toString() || '',
      date: entry.rawDate || new Date().toISOString().split('T')[0],
      description: entry.description || '',
    })
    setIsEditModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.user_id || !formData.project_id || !formData.hours || !formData.date) {
      alert('Please fill all required fields (Employee, Project, Hours, Date)')
      return
    }

    try {
      setSaving(true)
      const timeLogData = {
        user_id: parseInt(formData.user_id),
        project_id: parseInt(formData.project_id),
        task_id: formData.task_id ? parseInt(formData.task_id) : null,
        hours: parseFloat(formData.hours),
        date: formData.date,
        description: formData.description || '',
        company_id: parseInt(companyId)
      }

      if (isEditModalOpen && selectedEntry) {
        // Update existing entry
        const response = await timeTrackingAPI.update(selectedEntry.id, timeLogData, { company_id: companyId })
        if (response.data.success) {
          alert('Time entry updated successfully!')
          setIsEditModalOpen(false)
          setSelectedEntry(null)
          await fetchTimeEntries()
          setTimeout(() => fetchTimeEntries(), 500)
        } else {
          alert(response.data.error || 'Failed to update time entry')
        }
      } else {
        // Create new entry
        const response = await timeTrackingAPI.create(timeLogData, { company_id: companyId })
        if (response.data.success) {
          alert('Time entry created successfully!')
          setIsAddModalOpen(false)
          await fetchTimeEntries()
          setTimeout(() => fetchTimeEntries(), 500)
        } else {
          alert(response.data.error || 'Failed to create time entry')
        }
      }
    } catch (error) {
      console.error('Error saving time entry:', error)
      alert(error.response?.data?.error || 'Failed to save time entry')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (entry) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      try {
        const response = await timeTrackingAPI.delete(entry.id, { company_id: companyId })
        if (response.data.success) {
          alert('Time entry deleted successfully!')
          await fetchTimeEntries()
          setTimeout(() => fetchTimeEntries(), 500)
        } else {
          alert(response.data.error || 'Failed to delete time entry')
        }
      } catch (error) {
        console.error('Error deleting time entry:', error)
        alert(error.response?.data?.error || 'Failed to delete time entry')
      }
    }
  }

  const actions = (row) => (
    <div className="flex items-center justify-end gap-2">
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
        onClick={(e) => {
          e.stopPropagation()
          handleDelete(row)
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
          <h1 className="text-3xl font-bold text-primary-text">Time Tracking</h1>
          <p className="text-secondary-text mt-1">Track employee time entries</p>
        </div>
        <AddButton onClick={handleAdd} label="Add Time Entry" />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading time entries...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={timeEntries}
          searchPlaceholder="Search time entries..."
          filters={true}
          actions={actions}
        />
      )}

      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedEntry(null)
          setFormData({
            user_id: '',
            project_id: '',
            task_id: '',
            hours: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
          })
        }}
        title={isAddModalOpen ? 'Add Time Entry' : 'Edit Time Entry'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Employee <span className="text-danger">*</span>
            </label>
            <select
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              required
            >
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp.user_id || emp.id} value={emp.user_id || emp.id}>
                  {emp.name || emp.user_name || emp.employee_name || `Employee #${emp.user_id || emp.id}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Project <span className="text-danger">*</span>
            </label>
            <select
              value={formData.project_id}
              onChange={(e) => {
                console.log('Project selected:', e.target.value)
                setFormData({ ...formData, project_id: e.target.value, task_id: '' })
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              required
            >
              <option value="">-- Select Project --</option>
              {projects && projects.length > 0 ? (
                projects.map((project) => {
                  // Backend returns project_name field
                  const projectName = project.project_name || project.name || `Project #${project.id}`
                  return (
                    <option key={project.id} value={project.id}>
                      {projectName}
                    </option>
                  )
                })
              ) : (
                <option value="" disabled>Loading projects...</option>
              )}
            </select>
            {projects && projects.length === 0 && (
              <p className="text-sm text-warning mt-1">No projects found. Please create a project first.</p>
            )}
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-gray-400 mt-1">Debug: {projects?.length || 0} projects loaded</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Task (Optional)
            </label>
            <select
              value={formData.task_id}
              onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              disabled={!formData.project_id}
            >
              <option value="">
                {!formData.project_id ? 'Select Project First' : tasks.filter((task) => task.project_id == formData.project_id).length === 0 ? 'No Tasks Available' : '-- Select Task --'}
              </option>
              {tasks
                .filter((task) => !formData.project_id || task.project_id == formData.project_id)
                .map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title || task.task_title || `Task #${task.id}`}
                  </option>
                ))}
            </select>
          </div>
          <Input
            label="Hours"
            type="number"
            step="0.5"
            min="0"
            value={formData.hours}
            onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
            required
          />
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <Input
            label="Description (Optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add notes about this time entry"
          />
          <div className="flex gap-3 pt-4 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                setSelectedEntry(null)
              }}
              className="px-4"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave}
              className="px-4"
              disabled={saving || !formData.user_id || !formData.project_id || !formData.hours || !formData.date}
            >
              {saving ? 'Saving...' : (isAddModalOpen ? 'Save Entry' : 'Update Entry')}
            </Button>
          </div>
        </div>
      </RightSideModal>
    </div>
  )
}

export default TimeTracking

import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { timeTrackingAPI, projectsAPI, tasksAPI } from '../../../api'
import { IoCreate, IoTrash, IoEye } from 'react-icons/io5'

const TimeTracking = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [timeEntries, setTimeEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({
    today_hours: 0,
    week_hours: 0,
    month_hours: 0,
    total_entries: 0
  })
  const [formData, setFormData] = useState({
    project_id: '',
    task_id: '',
    hours: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  })

  useEffect(() => {
    if (userId && companyId) {
      fetchTimeEntries()
      fetchProjects()
      fetchStats()
    }
  }, [userId, companyId])

  // Fetch tasks when project is selected
  useEffect(() => {
    if (formData.project_id && userId && companyId) {
      fetchTasksForProject(formData.project_id)
    } else {
      setTasks([])
    }
  }, [formData.project_id, userId, companyId])

  const fetchTimeEntries = async () => {
    try {
      setLoading(true)
      const response = await timeTrackingAPI.getAll({ 
        company_id: companyId,
        user_id: userId 
      })
      if (response.data.success) {
        const entries = response.data.data || []
        const transformedEntries = entries.map(entry => ({
          id: entry.id,
          project: entry.project_name || entry.projectName || 'N/A',
          task: entry.task_title || entry.taskTitle || 'N/A',
          hours: parseFloat(entry.hours || 0),
          date: entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A',
          ...entry
        }))
        setTimeEntries(transformedEntries)
      }
    } catch (error) {
      console.error('Error fetching time entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      // Fetch projects based on assigned tasks (same logic as My Projects)
      const tasksResponse = await tasksAPI.getAll({ 
        assigned_to: userId,
        company_id: companyId 
      })
      
      if (!tasksResponse.data.success) {
        setProjects([])
        return
      }
      
      const tasks = tasksResponse.data.data || []
      
      // Extract unique project IDs from tasks
      const projectIds = [...new Set(tasks
        .map(task => task.project_id)
        .filter(pid => pid !== null && pid !== undefined)
      )]
      
      if (projectIds.length === 0) {
        setProjects([])
        return
      }
      
      // Fetch all projects for the company, then filter by project IDs
      const projectsResponse = await projectsAPI.getAll({ 
        company_id: companyId 
      })
      
      if (projectsResponse.data.success) {
        const allProjects = projectsResponse.data.data || []
        const userProjects = allProjects.filter(proj => projectIds.includes(proj.id))
        setProjects(userProjects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
    }
  }

  const fetchTasksForProject = async (projectId) => {
    try {
      const response = await tasksAPI.getAll({ 
        company_id: companyId,
        assigned_to: userId,
        project_id: projectId
      })
      if (response.data.success) {
        setTasks(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setTasks([])
    }
  }

  const fetchStats = async () => {
    try {
      const response = await timeTrackingAPI.getStats({ 
        company_id: companyId,
        user_id: userId 
      })
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const columns = [
    { key: 'project', label: 'Project' },
    { key: 'task', label: 'Task' },
    {
      key: 'hours',
      label: 'Time Logged',
      render: (value) => `${value} hrs`,
    },
    { key: 'date', label: 'Date' },
  ]

  const handleAdd = () => {
    setFormData({ 
      project_id: '', 
      task_id: '', 
      hours: '', 
      date: new Date().toISOString().split('T')[0],
      description: ''
    })
    setIsAddModalOpen(true)
  }

  const handleView = (entry) => {
    setSelectedEntry(entry)
    setIsViewModalOpen(true)
  }

  const handleEdit = (entry) => {
    setSelectedEntry(entry)
    setFormData({
      project_id: entry.project_id || '',
      task_id: entry.task_id || '',
      hours: entry.hours?.toString() || '',
      date: entry.date || new Date().toISOString().split('T')[0],
      description: entry.description || ''
    })
    setIsEditModalOpen(true)
  }

  const handleSave = async () => {
    try {
      if (!formData.project_id || !formData.hours || !formData.date) {
        alert('Please fill all required fields')
        return
      }

      const timeLogData = {
        company_id: companyId,
        user_id: userId,
        project_id: parseInt(formData.project_id),
        task_id: formData.task_id ? parseInt(formData.task_id) : null,
        hours: parseFloat(formData.hours),
        date: formData.date,
        description: formData.description || ''
      }

      if (isEditModalOpen && selectedEntry) {
        const response = await timeTrackingAPI.update(selectedEntry.id, timeLogData, { company_id: companyId })
        if (response.data.success) {
          alert('Time entry updated successfully!')
          await fetchTimeEntries()
          await fetchStats()
          setIsEditModalOpen(false)
          setSelectedEntry(null)
          setFormData({ project_id: '', task_id: '', hours: '', date: new Date().toISOString().split('T')[0], description: '' })
        } else {
          alert(response.data.error || 'Failed to update time entry')
        }
      } else {
        const response = await timeTrackingAPI.create(timeLogData, { company_id: companyId })
        if (response.data.success) {
          alert('Time entry added successfully!')
          await fetchTimeEntries()
          await fetchStats()
          setIsAddModalOpen(false)
          setFormData({ project_id: '', task_id: '', hours: '', date: new Date().toISOString().split('T')[0], description: '' })
        } else {
          alert(response.data.error || 'Failed to add time entry')
        }
      }
    } catch (error) {
      console.error('Error saving time entry:', error)
      alert(error.response?.data?.error || 'Failed to save time entry')
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
          if (window.confirm('Delete this time entry?')) {
            try {
              const response = await timeTrackingAPI.delete(row.id, { company_id: companyId })
              if (response.data.success) {
                alert('Time entry deleted successfully!')
                await fetchTimeEntries()
                await fetchStats()
              } else {
                alert(response.data.error || 'Failed to delete time entry')
              }
            } catch (error) {
              console.error('Error deleting time entry:', error)
              alert(error.response?.data?.error || 'Failed to delete time entry')
            }
          }
        }}
        className="p-2 text-danger hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
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
          <p className="text-secondary-text mt-1">Track your work hours</p>
        </div>
        <AddButton onClick={handleAdd} label="Add Time Entry" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-secondary-text">Today</p>
          <p className="text-2xl font-bold text-primary-text">{stats.today_hours.toFixed(1)} hrs</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-secondary-text">This Week</p>
          <p className="text-2xl font-bold text-primary-accent">{stats.week_hours.toFixed(1)} hrs</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-secondary-text">This Month</p>
          <p className="text-2xl font-bold text-green-600">{stats.month_hours.toFixed(1)} hrs</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-secondary-text">Total Entries</p>
          <p className="text-2xl font-bold text-purple-600">{stats.total_entries}</p>
        </div>
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
          filterConfig={[
            { key: 'project', label: 'Project', type: 'text' },
            { key: 'date', label: 'Date', type: 'daterange' },
          ]}
          actions={actions}
          bulkActions={false}
        />
      )}

      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
        }}
        title={isAddModalOpen ? 'Add Time Entry' : 'Edit Time Entry'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-text mb-2">Project *</label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value, task_id: '' })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="">Select Project</option>
              {projects.map(proj => (
                <option key={proj.id} value={proj.id}>
                  {proj.project_name || proj.name || `Project #${proj.id}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-text mb-2">Task (Optional)</label>
            <select
              value={formData.task_id}
              onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              disabled={!formData.project_id}
            >
              <option value="">
                {!formData.project_id ? 'Select Project First' : tasks.length === 0 ? 'No Tasks Available' : 'Select Task'}
              </option>
              {tasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title || task.task_title || `Task #${task.id}`}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Hours *"
            type="number"
            step="0.5"
            min="0"
            value={formData.hours}
            onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
          />
          <Input
            label="Date *"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-secondary-text mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Add description (optional)"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex-1">
              {isAddModalOpen ? 'Save Entry' : 'Update Entry'}
            </Button>
          </div>
        </div>
      </RightSideModal>

      {/* View Time Entry Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedEntry(null)
        }}
        title="Time Entry Details"
      >
        {selectedEntry && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-accent">{selectedEntry.hours} hrs</p>
                <p className="text-sm text-secondary-text mt-1">Time Logged</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Project</label>
                <p className="text-primary-text font-medium">{selectedEntry.project || selectedEntry.project_name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Task</label>
                <p className="text-primary-text">{selectedEntry.task || selectedEntry.task_title || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Date</label>
                <p className="text-primary-text">{selectedEntry.date || 'N/A'}</p>
              </div>
              {selectedEntry.description && (
                <div>
                  <label className="block text-sm font-medium text-secondary-text mb-1">Description</label>
                  <p className="text-primary-text whitespace-pre-wrap">{selectedEntry.description}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
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
                  handleEdit(selectedEntry)
                }}
                className="flex-1"
              >
                Edit Entry
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default TimeTracking

import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import { projectsAPI, tasksAPI } from '../../../api'
import { IoEye } from 'react-icons/io5'

const MyProjects = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [projectTasks, setProjectTasks] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId && companyId) {
      fetchProjects()
    }
  }, [userId, companyId])

  useEffect(() => {
    if (selectedProject) {
      fetchProjectDetails()
    }
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      
      // First, fetch all tasks assigned to this user
      const tasksResponse = await tasksAPI.getAll({ 
        assigned_to: userId,
        company_id: companyId 
      })
      
      if (!tasksResponse.data.success) {
        setProjects([])
        return
      }
      
      const tasks = tasksResponse.data.data || []
      
      // Extract unique project IDs from tasks (filter out null/undefined project_ids)
      const projectIds = [...new Set(tasks
        .map(task => task.project_id)
        .filter(pid => pid !== null && pid !== undefined)
      )]
      
      // If no project IDs found, set empty array
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
        
        // Filter projects that match the project IDs from tasks
        const userProjects = allProjects.filter(proj => projectIds.includes(proj.id))
        
        const transformedProjects = userProjects.map(proj => ({
          id: proj.id,
          project: proj.project_name || proj.projectName || `Project #${proj.id}`,
          status: proj.status || 'Active',
          progress: proj.progress || 0,
          deadline: proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'N/A',
          ...proj
        }))
        setProjects(transformedProjects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      alert(error.response?.data?.error || 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjectDetails = async () => {
    if (!selectedProject) return

    try {
      // Fetch project details with members
      const projectResponse = await projectsAPI.getById(selectedProject.id, { company_id: companyId })
      if (projectResponse.data.success) {
        const project = projectResponse.data.data
        setTeamMembers(project.members || [])
      }

      // Fetch project tasks
      const tasksResponse = await tasksAPI.getAll({ 
        project_id: selectedProject.id,
        company_id: companyId 
      })
      if (tasksResponse.data.success) {
        setProjectTasks(tasksResponse.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching project details:', error)
    }
  }

  const handleView = (project) => {
    setSelectedProject(project)
    setIsViewModalOpen(true)
  }

  const columns = [
    { key: 'project', label: 'Project' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          'in progress': 'info',
          'In Progress': 'info',
          'completed': 'success',
          'Completed': 'success',
          'on hold': 'warning',
          'On Hold': 'warning',
          'cancelled': 'danger',
          'Cancelled': 'danger',
          Active: 'success',
        }
        return <Badge variant={statusColors[value?.toLowerCase()] || 'default'}>{value}</Badge>
      },
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-accent h-2 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm text-secondary-text">{value}%</span>
        </div>
      ),
    },
    { 
      key: 'deadline', 
      label: 'Deadline',
      render: (value) => {
        if (!value || value === 'N/A') return 'N/A'
        try {
          return new Date(value).toLocaleDateString()
        } catch {
          return value
        }
      }
    },
  ]

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
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-text">My Projects</h1>
        <p className="text-secondary-text mt-1">View your assigned projects</p>
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
            { key: 'status', label: 'Status', type: 'select', options: ['in progress', 'completed', 'on hold', 'cancelled'] },
        ]}
        actions={actions}
        bulkActions={false}
      />
      )}

      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedProject(null)
          setTeamMembers([])
          setProjectTasks([])
        }}
        title="Project Details"
        width="max-w-5xl"
      >
        {selectedProject && (
          <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-secondary-text">Project</label>
                <p className="text-primary-text mt-1 font-semibold">{selectedProject.project}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Status</label>
              <div className="mt-1">
                  <Badge variant={
                    selectedProject.status?.toLowerCase() === 'in progress' ? 'info' :
                    selectedProject.status?.toLowerCase() === 'completed' ? 'success' :
                    selectedProject.status?.toLowerCase() === 'on hold' ? 'warning' :
                    selectedProject.status?.toLowerCase() === 'cancelled' ? 'danger' : 'default'
                  }>
                  {selectedProject.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Progress</label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-accent h-2 rounded-full"
                      style={{ width: `${selectedProject.progress || 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-secondary-text">{selectedProject.progress || 0}%</span>
                </div>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Deadline</label>
                <p className="text-primary-text mt-1">
                  {selectedProject.deadline && selectedProject.deadline !== 'N/A' 
                    ? (selectedProject.deadline.includes('T') 
                        ? new Date(selectedProject.deadline).toLocaleDateString()
                        : selectedProject.deadline)
                    : 'N/A'}
                </p>
              </div>
            </div>

            {selectedProject.description && (
              <div>
                <label className="text-sm font-medium text-secondary-text">Description</label>
                <p className="text-primary-text mt-1">{selectedProject.description}</p>
              </div>
            )}

            {/* Team Members Section */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-primary-text mb-4">Team Members</h3>
              {teamMembers.length === 0 ? (
                <p className="text-secondary-text text-sm">No team members assigned</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-primary-text">{member.name || 'Unknown'}</p>
                      <p className="text-xs text-secondary-text mt-1">{member.email || '--'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Tasks Section */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-primary-text mb-4">Project Tasks</h3>
              {projectTasks.length === 0 ? (
                <p className="text-secondary-text text-sm">No tasks assigned to this project</p>
              ) : (
                <div className="space-y-2">
                  {projectTasks.map((task) => (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-primary-text">{task.title || `Task #${task.id}`}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant={
                              task.status === 'Done' ? 'success' :
                              task.status === 'Doing' ? 'info' : 'warning'
                            }>
                              {task.status || 'Incomplete'}
                            </Badge>
                            {task.priority && (
                              <Badge variant={
                                task.priority === 'High' ? 'danger' :
                                task.priority === 'Medium' ? 'warning' : 'info'
                              }>
                                {task.priority}
                              </Badge>
                            )}
                            {task.due_date && (
                              <span className="text-xs text-secondary-text">
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default MyProjects

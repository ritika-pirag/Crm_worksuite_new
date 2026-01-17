import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { useSettings } from '../../../context/SettingsContext'
import DataTable from '../../../components/ui/DataTable'
import { projectsAPI } from '../../../api'
import { 
  IoEye, 
  IoFilter,
  IoSearch,
  IoChevronDown,
  IoChevronUp
} from 'react-icons/io5'

const Projects = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useTheme()
  const { formatDate, formatCurrency } = useSettings()
  
  const userId = user?.id || localStorage.getItem('userId')
  const clientId = user?.client_id || localStorage.getItem('clientId')
  const companyId = parseInt(user?.company_id || localStorage.getItem('companyId') || 1, 10)
  const primaryColor = theme?.primaryAccent || '#0891b2'
  
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    if (companyId) {
      fetchProjects()
    }
  }, [companyId, clientId, userId])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await projectsAPI.getAll({
        company_id: companyId,
        client_id: clientId || userId
      })
      if (response.data?.success) {
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
          budget: parseFloat(proj.budget || 0),
          notes: proj.notes || '',
          created_by_name: proj.created_by_name || 'Admin',
          team_count: proj.team_count || 0,
          task_count: proj.task_count || 0,
          completed_tasks: proj.completed_tasks || 0,
          ...proj
        }))
        setProjects(transformedProjects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (project) => {
    navigate(`/app/client/projects/${project.id}`)
  }

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    let matches = true
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      matches = matches && (
        p.project?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }
    
    if (statusFilter) {
      matches = matches && p.status === statusFilter
    }
    
    return matches
  })

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Not Started': { bg: 'bg-gray-100', text: 'text-gray-600' },
      'In Progress': { bg: 'bg-blue-100', text: 'text-blue-600' },
      'Active': { bg: 'bg-blue-100', text: 'text-blue-600' },
      'On Hold': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      'on hold': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      'Completed': { bg: 'bg-green-100', text: 'text-green-600' },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-600' },
    }
    const style = statusStyles[status] || statusStyles['Not Started']
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {status}
      </span>
    )
  }

  const columns = [
    {
      key: 'project',
      label: 'Project',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: primaryColor }}
          >
            {value.charAt(0).toUpperCase()}
          </div>
          <div>
            <p 
              className="font-semibold text-gray-900 cursor-pointer hover:underline"
              style={{ color: primaryColor }}
              onClick={() => handleView(row)}
            >
              {value}
            </p>
            {row.created_by_name && (
              <p className="text-xs text-gray-500">By: {row.created_by_name}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${value || 0}%`, backgroundColor: primaryColor }}
            />
          </div>
          <span className="text-sm text-gray-600 font-medium">{value || 0}%</span>
        </div>
      ),
    },
    {
      key: 'start_date',
      label: 'Start Date',
      render: (value) => (
        <span className="text-sm text-secondary-text">
          {value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (value) => (
        <span className="text-sm text-secondary-text">
          {value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
        </span>
      ),
    },
  ]

  const actions = (row) => (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={(e) => { e.stopPropagation(); handleView(row) }}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        style={{ color: primaryColor }}
        title="View"
      >
        <IoEye size={18} />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Projects</h1>
          <p className="text-secondary-text mt-1">View your assigned projects</p>
        </div>
        
        {/* Filter Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              isFilterOpen ? 'text-white border-transparent' : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
            style={isFilterOpen ? { backgroundColor: primaryColor } : {}}
          >
            <IoFilter size={18} />
            <span className="text-sm font-medium">Filters</span>
            {isFilterOpen ? <IoChevronUp size={16} /> : <IoChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': primaryColor }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Table */}
      {loading ? (
        <div className="text-center py-12">
          <div 
            className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent"
            style={{ borderColor: `${primaryColor} transparent ${primaryColor} ${primaryColor}` }}
          ></div>
          <p className="text-secondary-text mt-4">Loading projects...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredProjects}
            searchPlaceholder="Search projects..."
            filters={false}
            actions={actions}
            bulkActions={false}
            emptyMessage="No projects found"
            onRowClick={handleView}
          />
        </div>
      )}
    </div>
  )
}

export default Projects

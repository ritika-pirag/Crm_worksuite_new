import { useState, useEffect, useCallback } from 'react'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import UniqueIdBadge, { ID_PREFIXES } from '../../../components/ui/UniqueIdBadge'
import { tasksAPI, projectsAPI, usersAPI, companiesAPI, employeesAPI } from '../../../api'
import {
  IoEye,
  IoPencil,
  IoTrashOutline,
  IoList,
  IoGrid,
  IoAdd,
  IoClose,
  IoDownload,
  IoSearch,
  IoFilter,
  IoCalendar,
  IoPin,
  IoRefresh,
  IoPerson,
  IoChevronDown,
  IoChevronUp,
  IoEllipsisVertical,
  IoCheckmarkCircle,
  IoChevronForward,
  IoChevronBack,
  IoLockClosed,
  IoWarning,
  IoPricetag,
  IoCloudUpload,
  IoPrint,
  IoBug,
  IoArrowUp,
  IoArrowDown,
  IoMic,
  IoAttach,
  IoCloseCircle,
  IoOpenOutline,
  IoAlertCircle
} from 'react-icons/io5'
import {
  FormRow,
  FormSection,
  FormInput,
  FormSelect,
  FormActions
} from '../../../components/ui/FormRow'
import RichTextEditor from '../../../components/ui/RichTextEditor'

const Tasks = () => {
  // Get company_id from localStorage
  const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
  const [viewMode, setViewMode] = useState('list') // 'list', 'kanban', 'gantt'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAddMultipleModalOpen, setIsAddMultipleModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isManageLabelsModalOpen, setIsManageLabelsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importPreview, setImportPreview] = useState([])
  const [importLoading, setImportLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState('title')
  const [sortDirection, setSortDirection] = useState('asc')

  // Quick Filters
  const [activeFilter, setActiveFilter] = useState('All tasks')
  const [showRecentlyUpdated, setShowRecentlyUpdated] = useState(false)

  // Advanced Filters
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    project: [],
    assignee: [],
    label: [],
    dateRange: { start: '', end: '' },
  })

  const [formData, setFormData] = useState({
    company_id: '',
    title: '',
    description: '',
    related_to: '',
    related_to_type: 'project', // project, client, lead
    points: '1',
    assign_to: '',
    collaborators: [],
    status: 'Incomplete',
    priority: 'Medium',
    labels: [],
    start_date: '',
    deadline: '',
    is_recurring: false,
    recurring_frequency: 'daily', // daily, weekly, monthly
    uploaded_file: null,
  })

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [labels, setLabels] = useState([
    { name: 'Bug', color: '#ef4444' },
    { name: 'Design', color: '#3b82f6' },
    { name: 'Enhancement', color: '#22c55e' },
    { name: 'Feedback', color: '#f97316' }
  ])
  const [newLabel, setNewLabel] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#22c55e')


  // Kanban Status Columns (matching backend ENUM values)
  const kanbanColumns = [
    { id: 'Incomplete', label: 'To do', color: 'bg-orange-500', count: 0 },
    { id: 'Doing', label: 'In progress', color: 'bg-blue-500', count: 0 },
    { id: 'Done', label: 'Done', color: 'bg-green-500', count: 0 },
  ]

  const fetchProjects = useCallback(async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchProjects:', companyId)
        setProjects([])
        return
      }
      const response = await projectsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setProjects(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }, [companyId])

  const fetchUsers = useCallback(async () => {
    try {
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchUsers:', companyId)
        setUsers([])
        return
      }
      const response = await usersAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setUsers(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }, [companyId])

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await companiesAPI.getAll()
      if (response.data.success) {
        setCompanies(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }, [])

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchTasks:', companyId)
        setTasks([])
        setLoading(false)
        return
      }
      const response = await tasksAPI.getAll({ company_id: companyId })
      console.log('Tasks API Response:', response.data) // Debug log
      if (response.data.success) {
        const fetchedTasks = response.data.data || []
        console.log('Fetched Tasks with collaborators:', fetchedTasks.map(t => ({ id: t.id, collaborators: t.collaborators, task_collaborators: t.task_collaborators }))) // Debug log
        const transformedTasks = fetchedTasks.map(task => {
          // Transform collaborators - handle both array of IDs and array of objects
          let transformedCollaborators = []
          if (task.collaborators && Array.isArray(task.collaborators)) {
            transformedCollaborators = task.collaborators.map(collab => {
              // If collab is already an object with user details
              if (typeof collab === 'object' && collab !== null) {
                return {
                  id: collab.id || collab.user_id,
                  name: collab.name || collab.user_name || collab.email || 'Unknown',
                  email: collab.email || ''
                }
              }
              // If collab is just an ID (number or string)
              return {
                id: collab,
                name: `User ${collab}`,
                email: ''
              }
            })
          }
          // Also check task_collaborators field (some APIs use this)
          if (task.task_collaborators && Array.isArray(task.task_collaborators)) {
            transformedCollaborators = task.task_collaborators.map(collab => ({
              id: collab.id || collab.user_id,
              name: collab.name || collab.user?.name || collab.user_name || collab.email || 'Unknown',
              email: collab.email || collab.user?.email || ''
            }))
          }

          return {
            id: task.id,
            code: task.code || task.task_code || `TASK-${task.id}`,
            title: task.title || '',
            description: task.description || '',
            start_date: task.start_date ? task.start_date.split('T')[0] : '',
            deadline: task.due_date ? task.due_date.split('T')[0] : '',
            milestone: task.milestone || '-',
            related_to: task.project_name || '-',
            assigned_to: task.assigned_to && task.assigned_to.length > 0 ? task.assigned_to.map(assignee => ({
              id: assignee.id,
              name: assignee.name || assignee.email,
              avatar: assignee.name ? assignee.name.split(' ').map(n => n[0]).join('') : assignee.email?.substring(0, 2).toUpperCase() || 'U',
            })) : [],
            collaborators: transformedCollaborators,
            status: task.status === 'Doing' || task.status === 'doing' || task.status === 'In progress' ? 'Doing' :
              task.status === 'Done' || task.status === 'Completed' || task.status === 'completed' ? 'Done' :
                task.status === 'Incomplete' || task.status === 'incomplete' || task.status === 'To do' || task.status === 'To Do' || task.status === 'to do' ? 'Incomplete' :
                  'Incomplete',
            priority: task.priority || 'Medium',
            labels: normalizeLabelArray(task.tags || task.labels),
            project_id: task.project_id,
            project_name: task.project_name,
            borderColor: task.priority === 'High' ? 'border-l-4 border-l-orange-500' :
              task.priority === 'Low' ? 'border-l-4 border-l-purple-500' :
                'border-l-4 border-l-blue-500',
          }
        })
        setTasks(transformedTasks)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    Promise.all([
      fetchTasks(),
      fetchProjects(),
      fetchCompanies(),
      fetchUsers()
    ])
    // Fetch employees for the company on initial load
    if (companyId && !isNaN(companyId) && companyId > 0) {
      fetchEmployeesByCompany(companyId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Populate formData when editing a task
  useEffect(() => {
    if (isEditModalOpen && selectedTask) {
      setFormData({
        company_id: selectedTask.company_id || companyId || '',
        title: selectedTask.title || '',
        description: selectedTask.description || '',
        related_to: selectedTask.project_id || selectedTask.related_to || '',
        related_to_type: selectedTask.related_to_type || 'project',
        points: selectedTask.points || '1',
        assign_to: selectedTask.assign_to || '',
        collaborators: selectedTask.collaborators || [],
        status: selectedTask.status || 'Incomplete',
        priority: selectedTask.priority || 'Medium',
        labels: normalizeLabelArray(selectedTask.labels || selectedTask.tags),
        start_date: selectedTask.start_date ? selectedTask.start_date.split('T')[0] : '',
        deadline: selectedTask.deadline ? selectedTask.deadline.split('T')[0] : (selectedTask.due_date ? selectedTask.due_date.split('T')[0] : ''),
        is_recurring: selectedTask.is_recurring || false,
        recurring_frequency: selectedTask.recurring_frequency || 'daily',
        uploaded_file: null,
      })
    }
  }, [isEditModalOpen, selectedTask, companyId])

  const fetchEmployeesByCompany = async (companyId) => {
    try {
      const response = await employeesAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setFilteredEmployees(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      const allUsers = users.filter(u => u.company_id === companyId || u.company_id === parseInt(companyId))
      setFilteredEmployees(allUsers)
    }
  }

  useEffect(() => {
    if (formData.company_id && projects.length > 0) {
      const filtered = projects.filter(project =>
        project.company_id === parseInt(formData.company_id) ||
        project.company_id?.toString() === formData.company_id
      )
      setFilteredProjects(filtered)
    } else {
      setFilteredProjects([])
    }
  }, [formData.company_id, projects])

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
  }

  const isDeadlineOverdue = (deadline) => {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Incomplete': return 'bg-orange-100 text-orange-800'
      case 'Doing': return 'bg-blue-100 text-blue-800'
      case 'Done': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper to display user-friendly status labels
  const getStatusLabel = (status) => {
    switch (status) {
      case 'Incomplete': return 'To do'
      case 'Doing': return 'In progress'
      case 'Done': return 'Done'
      default: return status
    }
  }

  const getLabelColor = (label) => {
    const labelName = typeof label === 'string' ? label : (label?.name || '')
    switch (labelName) {
      case 'Bug': return 'bg-pink-100 text-pink-800'
      case 'Design': return 'bg-green-100 text-green-800'
      case 'Enhancement': return 'bg-blue-100 text-blue-800'
      case 'Feedback': return 'bg-teal-100 text-teal-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddLabel = () => {
    if (!newLabel.trim()) return
    // Check if label already exists
    if (labels.some(l => (l.name || l).toLowerCase() === newLabel.trim().toLowerCase())) {
      alert('Label already exists')
      return
    }
    const labelToAdd = { name: newLabel.trim(), color: newLabelColor }
    setLabels([...labels, labelToAdd])
    setNewLabel('')
    setNewLabelColor('#22c55e')
  }

  const handleDeleteLabel = (labelName) => {
    if (!window.confirm(`Are you sure you want to delete the label "${labelName}"?`)) return
    setLabels(labels.filter(l => (l.name || l) !== labelName))
  }

  const getLabelName = (label) => (typeof label === 'string' ? label : (label?.name || ''))

  const normalizeLabelArray = (raw) => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw.map(getLabelName).filter(Boolean)
    if (typeof raw === 'string') return raw.split(',').map(s => s.trim()).filter(Boolean)
    return []
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Filter tasks based on all filters
  const getFilteredTasks = () => {
    let filtered = [...tasks]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.related_to?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Quick filter
    if (activeFilter === 'My Tasks') {
      // Filter by current user - you'll need to get current user ID
      // filtered = filtered.filter(task => task.assigned_to.some(a => a.id === currentUserId))
    } else if (activeFilter === 'Bug') {
      filtered = filtered.filter(task => normalizeLabelArray(task.labels).includes('Bug'))
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status))
    }

    // Priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority))
    }

    // Project filter
    if (filters.project.length > 0) {
      filtered = filtered.filter(task => filters.project.includes(task.project_id?.toString()))
    }

    // Label filter
    if (filters.label.length > 0) {
      filtered = filtered.filter(task =>
        normalizeLabelArray(task.labels).some(label => filters.label.includes(label))
      )
    }

    // Recently Updated
    if (showRecentlyUpdated) {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      filtered = filtered.filter(task => {
        const updatedAt = new Date(task.updated_at || task.created_at)
        return updatedAt >= sevenDaysAgo
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortColumn] || ''
      let bVal = b[sortColumn] || ''

      if (sortColumn === 'title') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
      }
    })

    return filtered
  }

  const filteredTasks = getFilteredTasks()

  const getTasksByStatus = (status) => {
    return filteredTasks.filter(task => task.status === status)
  }

  // Update kanban column counts
  useEffect(() => {
    kanbanColumns.forEach(column => {
      column.count = getTasksByStatus(column.id).length
    })
  }, [filteredTasks])

  // Drag and Drop Handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.target.style.opacity = '0.5'
    // Prevent page scroll during drag
    document.body.style.overflow = 'hidden'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedTask(null)
    document.body.style.overflow = ''
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault()
    e.stopPropagation()
    document.body.style.overflow = ''

    if (!draggedTask) {
      setDraggedTask(null)
      return
    }

    if (draggedTask.status === targetStatus) {
      setDraggedTask(null)
      return
    }

    try {
      // Status is already in backend format (Incomplete, Doing, Done)
      const backendStatus = targetStatus

      const response = await tasksAPI.update(draggedTask.id, { status: backendStatus })
      if (response.data.success) {
        // Update local state immediately
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === draggedTask.id ? { ...task, status: targetStatus } : task
          )
        )
        // Refresh from server to get latest data
        await fetchTasks()
      } else {
        alert(response.data.error || 'Failed to update task status')
        await fetchTasks()
      }
    } catch (error) {
      console.error('Error updating task status:', error)
      console.error('Error details:', error.response?.data)
      alert(error.response?.data?.error || error.message || 'Failed to update task status')
      await fetchTasks()
    }

    setDraggedTask(null)
  }

  const handleAdd = () => {
    setFormData({
      company_id: companyId, // Auto-set from Admin session
      title: '',
      description: '',
      related_to: '',
      related_to_type: 'project',
      points: '1',
      assign_to: '',
      collaborators: [],
      status: 'Incomplete',
      priority: 'Medium',
      labels: [],
      start_date: new Date().toISOString().split('T')[0],
      deadline: '',
      is_recurring: false,
      recurring_frequency: 'daily',
      uploaded_file: null,
    })
    // Fetch employees for the company
    if (companyId) {
      fetchEmployeesByCompany(companyId)
    }
    setIsAddModalOpen(true)
  }

  const handleView = (task) => {
    setSelectedTask(task)
    setIsViewModalOpen(true)
  }

  const handleEdit = (task) => {
    setSelectedTask(task)
    setFormData({
      company_id: task.company_id || companyId,
      title: task.title || '',
      description: task.description || '',
      related_to: task.project_id || task.related_to || '',
      related_to_type: task.related_to_type || 'project',
      points: task.points || '1',
      assign_to: task.assign_to || '',
      collaborators: task.collaborators ? task.collaborators.map(c => c.id || c.user_id || c) : [],
      status: task.status || 'Incomplete',
      priority: task.priority || 'Medium',
      labels: normalizeLabelArray(task.labels || task.tags),
      start_date: task.start_date ? task.start_date.split('T')[0] : '',
      deadline: task.deadline ? task.deadline.split('T')[0] : (task.due_date ? task.due_date.split('T')[0] : ''),
      is_recurring: task.is_recurring || false,
      recurring_frequency: task.recurring_frequency || 'daily',
      uploaded_file: null,
    })
    // Fetch employees for editing
    if (companyId) {
      fetchEmployeesByCompany(companyId)
    }
    setIsEditModalOpen(true)
  }

  const handleDelete = async (task) => {
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      return
    }
    try {
      const response = await tasksAPI.delete(task.id)
      if (response.data.success) {
        alert('Task deleted successfully!')
        await fetchTasks()
      } else {
        alert(response.data.error || 'Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      alert(error.response?.data?.error || 'Failed to delete task')
    }
  }

  const handleAddMultiple = () => {
    setFormData({
      company_id: companyId,
      title: '',
      description: '',
      related_to: '',
      related_to_type: 'project',
      points: '1',
      assign_to: '',
      collaborators: [],
      status: 'Incomplete',
      priority: 'Medium',
      labels: [],
      start_date: '',
      deadline: '',
      is_recurring: false,
      recurring_frequency: 'daily',
      uploaded_file: null,
    })
    // Fetch employees for the company
    if (companyId) {
      employeesAPI.getAll({ company_id: companyId })
        .then(response => {
          const empData = response.data?.data || response.data || []
          setFilteredEmployees(empData)
        })
        .catch(err => console.error('Error fetching employees:', err))
    }
    setIsAddMultipleModalOpen(true)
  }

  const handleSave = async (addMore = false) => {
    const trimmedTitle = formData.title?.trim()

    if (!trimmedTitle) {
      alert('Title is required')
      return
    }

    if (!formData.related_to) {
      alert('Please select a project')
      return
    }

    if (!formData.assign_to) {
      alert('Please assign task to an employee')
      return
    }

    try {
      // Prepare task data with all 13 fields
      const collaboratorsArray = Array.isArray(formData.collaborators)
        ? formData.collaborators.map(c => parseInt(c))
        : []
      console.log('Collaborators being sent:', collaboratorsArray) // Debug log

      const taskData = {
        company_id: companyId,
        title: trimmedTitle,
        description: formData.description || null,
        related_to: formData.related_to || null,
        related_to_type: formData.related_to_type || 'project',
        points: formData.points ? parseInt(formData.points) || 1 : 1,
        assign_to: formData.assign_to ? parseInt(formData.assign_to) || null : null,
        collaborators: collaboratorsArray,
        status: formData.status || 'Incomplete',
        priority: formData.priority || 'Medium',
        labels: Array.isArray(formData.labels) ? formData.labels : [],
        start_date: formData.start_date || null,
        deadline: formData.deadline || null,
        due_date: formData.deadline || null,
        is_recurring: formData.is_recurring || false,
        recurring_frequency: formData.is_recurring ? formData.recurring_frequency : null,

        // Map to backend fields - ensure NaN doesn't get sent
        project_id: formData.related_to_type === 'project' && formData.related_to ? parseInt(formData.related_to) || null : null,
        client_id: formData.related_to_type === 'client' && formData.related_to ? parseInt(formData.related_to) || null : null,
        lead_id: formData.related_to_type === 'lead' && formData.related_to ? parseInt(formData.related_to) || null : null,
        assigned_to: formData.assign_to ? [parseInt(formData.assign_to)] : [],
        tags: Array.isArray(formData.labels) ? formData.labels : [],
      }

      let response;

      // Check if we are editing or creating
      const isEditing = isEditModalOpen && selectedTask

      // If file is uploaded, use FormData
      if (formData.uploaded_file) {
        const formDataWithFile = new FormData()
        Object.keys(taskData).forEach(key => {
          if (Array.isArray(taskData[key])) {
            formDataWithFile.append(key, JSON.stringify(taskData[key]))
          } else if (taskData[key] !== null && taskData[key] !== undefined) {
            formDataWithFile.append(key, taskData[key])
          }
        })
        formDataWithFile.append('file', formData.uploaded_file)

        if (isEditing) {
          response = await tasksAPI.updateWithFile(selectedTask.id, formDataWithFile)
        } else {
          response = await tasksAPI.createWithFile(formDataWithFile)
        }
      } else {
        if (isEditing) {
          response = await tasksAPI.update(selectedTask.id, taskData)
        } else {
          response = await tasksAPI.create(taskData)
        }
      }

      if (response.data.success) {
        alert(isEditing ? 'Task updated successfully!' : 'Task created successfully!')
        await fetchTasks()

        if (addMore && !isEditing) {
          setFormData({
            ...formData,
            title: '',
            description: '',
            uploaded_file: null,
          })
        } else {
          setIsAddModalOpen(false)
          setIsAddMultipleModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedTask(null)
          setFormData({
            company_id: '',
            title: '',
            description: '',
            related_to: '',
            related_to_type: 'project',
            points: '1',
            assign_to: '',
            collaborators: [],
            status: 'Incomplete',
            priority: 'Medium',
            labels: [],
            start_date: '',
            deadline: '',
            is_recurring: false,
            recurring_frequency: 'daily',
            uploaded_file: null,
          })
          setFilteredEmployees([])
        }
      } else {
        alert(response.data.error || (isEditing ? 'Failed to update task' : 'Failed to create task'))
      }
    } catch (error) {
      console.error('Error saving task:', error)
      console.error('Error response:', error.response)
      alert(error.response?.data?.error || error.message || 'Failed to save task')
    }
  }


  // Export to Excel/CSV
  const handleExportExcel = () => {
    if (filteredTasks.length === 0) {
      alert('No tasks to export')
      return
    }

    // Create CSV content
    const headers = ['ID', 'Title', 'Project Name', 'Status', 'Priority', 'Labels', 'Assigned To', 'Start Date', 'Deadline']
    const csvContent = [
      headers.join(','),
      ...filteredTasks.map(task => [
        task.id,
        `"${(task.title || '').replace(/"/g, '""')}"`,
        `"${(task.project_name || '').replace(/"/g, '""')}"`,
        getStatusLabel(task.status),
        task.priority || 'Medium',
        `"${(task.labels || []).join(', ')}"`,
        `"${task.assigned_to && task.assigned_to.length > 0 ? task.assigned_to[0].name : ''}"`,
        task.start_date || '',
        task.deadline || ''
      ].join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `tasks_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Download Sample CSV Template
  const handleDownloadSampleCSV = () => {
    const sampleHeaders = ['title', 'description', 'project_id', 'status', 'priority', 'start_date', 'deadline', 'labels']
    const sampleData = [
      ['Sample Task 1', 'Task description here', '1', 'Incomplete', 'High', '2025-01-01', '2025-01-15', 'bug,urgent'],
      ['Sample Task 2', 'Another task description', '1', 'Doing', 'Medium', '2025-01-05', '2025-01-20', 'feature'],
      ['Sample Task 3', 'Third task description', '2', 'Done', 'Low', '2025-01-10', '2025-01-25', '']
    ]

    const csvContent = [
      sampleHeaders.join(','),
      ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'tasks_import_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle Import File Change
  const handleImportFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImportFile(file)

    // Parse CSV file
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target.result
        const lines = text.split('\n').filter(line => line.trim())

        if (lines.length < 2) {
          alert('File is empty or has no data rows')
          setImportFile(null)
          setImportPreview([])
          return
        }

        // Parse headers
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase())

        // Parse data rows
        const parsedTasks = []
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i])
          const task = {}

          headers.forEach((header, idx) => {
            const value = values[idx] ? values[idx].trim().replace(/"/g, '') : ''

            // Map common header variations
            if (['title', 'name', 'task_title', 'task name'].includes(header)) {
              task.title = value
            } else if (['description', 'desc', 'details'].includes(header)) {
              task.description = value
            } else if (['project_id', 'project', 'project id'].includes(header)) {
              task.project_id = value
            } else if (['status'].includes(header)) {
              // Normalize status
              const statusLower = value.toLowerCase()
              if (['to do', 'todo', 'incomplete'].includes(statusLower)) {
                task.status = 'Incomplete'
              } else if (['in progress', 'inprogress', 'doing'].includes(statusLower)) {
                task.status = 'Doing'
              } else if (['done', 'completed', 'complete'].includes(statusLower)) {
                task.status = 'Done'
              } else {
                task.status = 'Incomplete'
              }
            } else if (['priority'].includes(header)) {
              task.priority = value || 'Medium'
            } else if (['start_date', 'start date', 'startdate'].includes(header)) {
              task.start_date = value
            } else if (['deadline', 'due_date', 'due date', 'end_date', 'end date'].includes(header)) {
              task.deadline = value
            } else if (['labels', 'tags', 'label'].includes(header)) {
              task.labels = value ? value.split(',').map(l => l.trim()) : []
            }
          })

          // Only add tasks with title
          if (task.title) {
            parsedTasks.push(task)
          }
        }

        setImportPreview(parsedTasks)
      } catch (error) {
        console.error('Error parsing CSV:', error)
        alert('Error parsing file. Please check the format.')
        setImportFile(null)
        setImportPreview([])
      }
    }
    reader.readAsText(file)
  }

  // Helper function to parse CSV line (handles quoted values with commas)
  const parseCSVLine = (line) => {
    const result = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    result.push(current)

    return result
  }

  // Handle Import Tasks
  const handleImportTasks = async () => {
    if (importPreview.length === 0) {
      alert('No tasks to import')
      return
    }

    setImportLoading(true)

    try {
      let successCount = 0
      let failCount = 0

      for (const task of importPreview) {
        try {
          const taskData = {
            company_id: companyId,
            title: task.title,
            description: task.description || '',
            related_to: task.project_id || '',
            related_to_type: 'project',
            status: task.status || 'Incomplete',
            priority: task.priority || 'Medium',
            start_date: task.start_date || null,
            deadline: task.deadline || null,
            labels: task.labels || [],
            assign_to: '',
            collaborators: [],
          }

          await tasksAPI.create(taskData)
          successCount++
        } catch (error) {
          console.error('Error importing task:', task.title, error)
          failCount++
        }
      }

      if (failCount === 0) {
        alert(`Successfully imported ${successCount} tasks!`)
      } else {
        alert(`Imported ${successCount} tasks. ${failCount} tasks failed to import.`)
      }

      // Refresh tasks list
      fetchTasks()

      // Close modal and reset
      setIsImportModalOpen(false)
      setImportFile(null)
      setImportPreview([])
    } catch (error) {
      console.error('Error importing tasks:', error)
      alert('Error importing tasks. Please try again.')
    } finally {
      setImportLoading(false)
    }
  }

  const handleSaveMultiple = async () => {
    // This function is a placeholder for now, as the instruction only provided the UI structure.
    // In a real application, you'd likely have a way to add multiple tasks at once,
    // or this modal would be for a single task with a "save & add more" option.
    // For now, we'll just call the single task save logic with addMore = true.
    await handleSave(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-1 border-b border-gray-200">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${viewMode === 'list'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${viewMode === 'kanban'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsManageLabelsModalOpen(true)}
              className="flex items-center gap-1.5 px-2 sm:px-3 hover:bg-gray-800 hover:text-white hover:border-gray-800"
            >
              <IoPricetag size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">Manage labels</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-2 sm:px-3 hover:bg-gray-800 hover:text-white hover:border-gray-800"
            >
              <IoCloudUpload size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">Import tasks</span>
            </Button>
            <AddButton onClick={handleAdd} label="Add task" />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`px-3 py-2 text-sm border border-gray-300 rounded-lg flex items-center gap-2 transition-colors hover:bg-gray-800 hover:text-white hover:border-gray-800 ${isFiltersOpen ? 'bg-gray-800 text-white border-gray-800' : ''
                }`}
            >
              <IoFilter size={16} />
              Filters
              <IoChevronDown size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-2 sm:px-3 hover:bg-gray-800 hover:text-white hover:border-gray-800"
            >
              <IoDownload size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">Excel</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-2 sm:px-3 hover:bg-gray-800 hover:text-white hover:border-gray-800"
            >
              <IoPrint size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">Print</span>
            </Button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {isFiltersOpen && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">Status</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {kanbanColumns.map(column => (
                    <label key={column.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(column.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, status: [...filters.status, column.id] })
                          } else {
                            setFilters({ ...filters, status: filters.status.filter(s => s !== column.id) })
                          }
                        }}
                        className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent"
                      />
                      <span className="text-sm text-primary-text">{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">Priority</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {['High', 'Medium', 'Low'].map(priority => (
                    <label key={priority} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, priority: [...filters.priority, priority] })
                          } else {
                            setFilters({ ...filters, priority: filters.priority.filter(p => p !== priority) })
                          }
                        }}
                        className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent"
                      />
                      <span className="text-sm text-primary-text">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">Project</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {projects.slice(0, 10).map(project => (
                    <label key={project.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.project.includes(project.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, project: [...filters.project, project.id.toString()] })
                          } else {
                            setFilters({ ...filters, project: filters.project.filter(p => p !== project.id.toString()) })
                          }
                        }}
                        className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent"
                      />
                      <span className="text-sm text-primary-text truncate">{project.name || project.project_name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">Labels</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {labels.map((label) => (
                    <label key={label?.name || String(label)} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.label.includes(label?.name || String(label))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, label: [...filters.label, (label?.name || String(label))] })
                          } else {
                            setFilters({ ...filters, label: filters.label.filter(l => l !== (label?.name || String(label))) })
                          }
                        }}
                        className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent"
                      />
                      <span className="text-sm text-primary-text">{label?.name || String(label)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    status: [],
                    priority: [],
                    project: [],
                    assignee: [],
                    label: [],
                    dateRange: { start: '', end: '' },
                  })
                  setActiveFilter('All tasks')
                  setShowRecentlyUpdated(false)
                }}
                size="sm"
              >
                Clear All Filters
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsFiltersOpen(false)}
                  size="sm"
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setIsFiltersOpen(false)}
                  size="sm"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider w-12">
                    <input type="checkbox" className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                    Task ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-1 hover:text-primary-accent"
                    >
                      Title
                      {sortColumn === 'title' ? (
                        sortDirection === 'asc' ? <IoChevronUp size={14} /> : <IoChevronDown size={14} />
                      ) : (
                        <IoChevronDown size={14} className="opacity-30" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                    Start date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                    Assigned to
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                    Labels
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-secondary-text">
                      Loading...
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-secondary-text">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className={`hover:bg-gray-50 ${task.borderColor || ''}`}>
                      <td className="px-2 sm:px-4 py-3">
                        <input type="checkbox" className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent" />
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <UniqueIdBadge prefix={ID_PREFIXES.TASK} id={task.id} size="sm" />
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-medium text-primary-text truncate">{task.title}</span>
                          {task.labels && task.labels.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {task.priority === 'High' && <IoArrowUp size={12} className="text-orange-500 flex-shrink-0" />}
                              {task.priority === 'Low' && <IoArrowDown size={12} className="text-gray-500 flex-shrink-0" />}
                              {task.labels.slice(0, 2).map((label, idx) => (
                                <Badge key={`${getLabelName(label)}-${idx}`} className={`text-xs ${getLabelColor(label)} flex-shrink-0`}>
                                  {getLabelName(label)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-secondary-text whitespace-nowrap">
                        {formatDate(task.start_date)}
                      </td>
                      <td className={`px-2 sm:px-4 py-3 text-xs sm:text-sm whitespace-nowrap ${isDeadlineOverdue(task.deadline) ? 'text-red-600 font-medium' : 'text-secondary-text'}`}>
                        {formatDate(task.deadline)}
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <span className="text-xs sm:text-sm text-blue-600 hover:underline cursor-pointer truncate block max-w-[120px]">
                          {task.project_name || '-'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        {task.assigned_to && task.assigned_to.length > 0 ? (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary-accent/20 flex items-center justify-center text-xs font-semibold text-primary-accent flex-shrink-0">
                              {task.assigned_to[0].avatar || 'U'}
                            </div>
                            <span className="text-xs sm:text-sm text-primary-text truncate hidden sm:inline">{task.assigned_to[0].name}</span>
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm text-secondary-text">-</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        {task.labels && task.labels.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {task.labels.slice(0, 2).map((label, idx) => (
                              <Badge key={`${getLabelName(label)}-${idx}`} className={`text-xs ${getLabelColor(label)}`}>
                                {getLabelName(label)}
                              </Badge>
                            ))}
                            {task.labels.length > 2 && (
                              <Badge className="text-xs bg-gray-100 text-gray-600">
                                +{task.labels.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm text-secondary-text">-</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </Badge>
                      </td>
                      <td className="px-2 sm:px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleView(task)
                            }}
                            className="p-1 sm:p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                            title="View"
                          >
                            <IoEye size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(task)
                            }}
                            className="p-1 sm:p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Edit"
                          >
                            <IoPencil size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(task)
                            }}
                            className="p-1 sm:p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <IoTrashOutline size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          {task.file_path && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(task.file_path, '_blank')
                              }}
                              className="p-1 sm:p-1.5 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                              title="View File"
                            >
                              <IoAttach size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin' }}>
          <div className="flex gap-3 sm:gap-4 min-w-max">
            {kanbanColumns.map((column) => {
              const columnTasks = getTasksByStatus(column.id)
              return (
                <div key={column.id} className="flex-shrink-0 w-72 sm:w-80">
                  <Card
                    className="p-4 bg-white rounded-lg shadow-sm min-h-[200px]"
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDragOver(e)
                    }}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <div className="flex items-center justify-between mb-4 pb-2 border-b-2" style={{ borderBottomColor: column.color.replace('bg-', '') }}>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-primary-text">{column.label}</h3>
                        <Badge variant="default" className="bg-gray-100 text-gray-700">
                          {columnTasks.length}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
                      {columnTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDragEnd={handleDragEnd}
                          className="p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-accent/50 transition-all cursor-move hover:shadow-md"
                          onClick={() => handleView(task)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-primary-text text-xs sm:text-sm truncate">{task.title}</h4>
                              <p className="text-xs text-secondary-text mt-1">#{task.id}</p>
                            </div>
                          </div>
                          {task.labels && task.labels.length > 0 && (
                            <div className="flex items-center gap-1 mb-2 flex-wrap">
                              {task.priority === 'High' && <IoArrowUp size={12} className="text-orange-500" />}
                              {task.labels.slice(0, 2).map((label, idx) => (
                                <Badge key={`${getLabelName(label)}-${idx}`} className={`text-xs ${getLabelColor(label)}`}>
                                  {getLabelName(label)}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              {task.assigned_to && task.assigned_to.length > 0 ? (
                                <div className="w-6 h-6 rounded-full bg-primary-accent/20 flex items-center justify-center text-xs font-semibold text-primary-accent">
                                  {task.assigned_to[0].avatar || 'U'}
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                                  U
                                </div>
                              )}
                            </div>
                            {task.deadline && (
                              <span className={`text-xs ${isDeadlineOverdue(task.deadline) ? 'text-red-600' : 'text-secondary-text'}`}>
                                {formatDate(task.deadline)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {columnTasks.length === 0 && (
                        <div className="text-center py-8 text-secondary-text text-sm border-2 border-dashed border-gray-300 rounded-lg">
                          No tasks
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      )}


      {/* Add Multiple Tasks Modal */}
      {/* Add Multiple Tasks Modal */}
      <Modal
        isOpen={isAddMultipleModalOpen}
        onClose={() => {
          setIsAddMultipleModalOpen(false)
          setFormData({
            company_id: '',
            title: '',
            description: '',
            related_to: '',
            related_to_type: 'project',
            points: '1',
            assign_to: '',
            collaborators: [],
            status: 'Incomplete',
            priority: 'Medium',
            labels: [],
            start_date: '',
            deadline: '',
            is_recurring: false,
            recurring_frequency: 'daily',
            uploaded_file: null,
          })
          setFilteredEmployees([])
        }}
        title="Add multiple tasks"
        size="xl"
      >
        <div className="space-y-0 max-h-[calc(100vh-150px)] overflow-y-auto pb-4">
          <FormSection title="Task Details">
            <FormRow label="Title" required>
              <FormInput
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                required
              />
            </FormRow>

            <FormRow label="Description">
              <RichTextEditor
                value={formData.description}
                onChange={(content) => setFormData({ ...formData, description: content })}
                placeholder="Enter task description"
              />
            </FormRow>

            <FormRow label="Related To" required>
              <FormSelect
                value={formData.related_to}
                onChange={(e) => setFormData({ ...formData, related_to: e.target.value, related_to_type: 'project' })}
                required
              >
                <option value="">-- Select Project --</option>
                {projects
                  .filter(p => parseInt(p.company_id) === parseInt(companyId))
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.project_name || p.name || p.title || `Project #${p.id}`}
                    </option>
                  ))}
              </FormSelect>
            </FormRow>

            <FormRow label="Points">
              <FormInput
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                placeholder="Task points"
                min="1"
              />
            </FormRow>
          </FormSection>

          <FormSection title="Assignment & Status">
            <FormRow label="Assign To" required>
              <FormSelect
                value={formData.assign_to}
                onChange={(e) => setFormData({ ...formData, assign_to: e.target.value })}
                required
              >
                <option value="">-- Select Employee --</option>
                {filteredEmployees.map(emp => (
                  <option key={emp.user_id || emp.id} value={emp.user_id || emp.id}>
                    {emp.name || emp.email}
                  </option>
                ))}
              </FormSelect>
            </FormRow>

            <FormRow label="Collaborators">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[50px]">
                  {formData.collaborators && formData.collaborators.length > 0 ? (
                    formData.collaborators.map((collabId) => {
                      const collab = filteredEmployees.find(e => parseInt(e.user_id || e.id) === parseInt(collabId))
                      return collab ? (
                        <span key={collabId} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-accent/10 text-primary-accent rounded-full text-sm">
                          {collab.name || collab.email}
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, collaborators: formData.collaborators.filter(id => parseInt(id) !== parseInt(collabId)) })}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ) : null
                    })
                  ) : (
                    <span className="text-gray-400 text-sm">No collaborators added</span>
                  )}
                </div>
                <FormSelect
                  onChange={(e) => {
                    const empId = parseInt(e.target.value)
                    if (empId && !formData.collaborators.map(c => parseInt(c)).includes(empId)) {
                      setFormData({ ...formData, collaborators: [...formData.collaborators, empId] })
                    }
                    e.target.value = ''
                  }}
                >
                  <option value="">+ Add Collaborator</option>
                  {filteredEmployees
                    .filter(emp => {
                      const empId = parseInt(emp.user_id || emp.id)
                      return empId !== parseInt(formData.assign_to) && !(formData.collaborators || []).map(c => parseInt(c)).includes(empId)
                    })
                    .map(emp => (
                      <option key={emp.user_id || emp.id} value={emp.user_id || emp.id}>
                        {emp.name || emp.email}
                      </option>
                    ))}
                </FormSelect>
              </div>
            </FormRow>

            <FormRow label="Status">
              <FormSelect
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Incomplete">To do</option>
                <option value="Doing">In progress</option>
                <option value="Done">Done</option>
              </FormSelect>
            </FormRow>

            <FormRow label="Priority">
              <FormSelect
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </FormSelect>
            </FormRow>
          </FormSection>

          <FormSection title="Additional Info" last>
            <FormRow label="Labels">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[50px]">
                  {formData.labels && formData.labels.length > 0 ? (
                    formData.labels.map((label, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {label}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, labels: formData.labels.filter((_, i) => i !== idx) })}
                          className="hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No labels added</span>
                  )}
                </div>
                <FormSelect
                  onChange={(e) => {
                    if (e.target.value && !(formData.labels || []).includes(e.target.value)) {
                      setFormData({ ...formData, labels: [...(formData.labels || []), e.target.value] })
                    }
                    e.target.value = ''
                  }}
                >
                  <option value="">+ Add Label</option>
                  {labels.filter(l => !(formData.labels || []).includes(l.name)).map(l => (
                    <option key={l.name} value={l.name}>{l.name}</option>
                  ))}
                </FormSelect>
              </div>
            </FormRow>

            <FormRow label="Start Date">
              <FormInput
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </FormRow>

            <FormRow label="Deadline" last>
              <FormInput
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </FormRow>
          </FormSection>

          <FormActions>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddMultipleModalOpen(false)
              }}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSave(true)}
              className="px-6 flex items-center gap-2"
            >
              <IoCheckmarkCircle size={18} />
              Save Tasks
            </Button>
          </FormActions>
        </div>
      </Modal>

      {/* Add/Edit Task Modal */}
      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedTask(null)
          setFormData({
            company_id: '',
            title: '',
            description: '',
            related_to: '',
            related_to_type: 'project',
            points: '1',
            assign_to: '',
            collaborators: [],
            status: 'Incomplete',
            priority: 'Medium',
            labels: [],
            start_date: '',
            deadline: '',
            is_recurring: false,
            recurring_frequency: 'daily',
            uploaded_file: null,
          })
          setFilteredEmployees([])
        }}
        title={isEditModalOpen ? "Edit Task" : "Add Task"}
        width="800px"
      >
        <div className="space-y-0 pb-4">
          <FormSection title="Task Details">
            <FormRow label="Title" required>
              <FormInput
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                required
              />
            </FormRow>

            <FormRow label="Description">
              <RichTextEditor
                value={formData.description || ''}
                onChange={(content) => setFormData({ ...formData, description: content })}
                placeholder="Enter task description"
              />
            </FormRow>

            <FormRow label="Related To" required>
              <FormSelect
                value={formData.related_to || ''}
                onChange={(e) => setFormData({ ...formData, related_to: e.target.value, related_to_type: 'project' })}
                required
              >
                <option value="">-- Select Project --</option>
                {projects
                  .filter(p => parseInt(p.company_id) === parseInt(companyId))
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.project_name || p.name || p.title || `Project #${p.id}`}
                    </option>
                  ))}
              </FormSelect>
            </FormRow>

            <FormRow label="Points">
              <FormInput
                type="number"
                value={formData.points || '1'}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                placeholder="Task points"
                min="1"
              />
            </FormRow>
          </FormSection>

          <FormSection title="Assignment & Status">
            <FormRow label="Assign To" required>
              <FormSelect
                value={formData.assign_to || ''}
                onChange={(e) => setFormData({ ...formData, assign_to: e.target.value })}
                required
              >
                <option value="">-- Select Employee --</option>
                {filteredEmployees.map(emp => (
                  <option key={emp.user_id || emp.id} value={emp.user_id || emp.id}>
                    {emp.name || emp.email}
                  </option>
                ))}
              </FormSelect>
            </FormRow>

            <FormRow label="Collaborators">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[50px]">
                  {formData.collaborators && formData.collaborators.length > 0 ? (
                    formData.collaborators.map((collabId) => {
                      const collab = filteredEmployees.find(e => parseInt(e.user_id || e.id) === parseInt(collabId))
                      return collab ? (
                        <span key={collabId} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-accent/10 text-primary-accent rounded-full text-sm">
                          {collab.name || collab.email}
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, collaborators: formData.collaborators.filter(id => parseInt(id) !== parseInt(collabId)) })}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ) : null
                    })
                  ) : (
                    <span className="text-gray-400 text-sm">No collaborators added</span>
                  )}
                </div>
                <FormSelect
                  onChange={(e) => {
                    const empId = parseInt(e.target.value)
                    if (empId && !formData.collaborators.map(c => parseInt(c)).includes(empId)) {
                      setFormData({ ...formData, collaborators: [...formData.collaborators, empId] })
                    }
                    e.target.value = ''
                  }}
                >
                  <option value="">+ Add Collaborator</option>
                  {filteredEmployees
                    .filter(emp => {
                      const empId = parseInt(emp.user_id || emp.id)
                      return empId !== parseInt(formData.assign_to) && !(formData.collaborators || []).map(c => parseInt(c)).includes(empId)
                    })
                    .map(emp => (
                      <option key={emp.user_id || emp.id} value={emp.user_id || emp.id}>
                        {emp.name || emp.email}
                      </option>
                    ))}
                </FormSelect>
              </div>
            </FormRow>

            <FormRow label="Status">
              <FormSelect
                value={formData.status || 'Incomplete'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Incomplete">To do</option>
                <option value="Doing">In progress</option>
                <option value="Done">Done</option>
              </FormSelect>
            </FormRow>

            <FormRow label="Priority">
              <FormSelect
                value={formData.priority || 'Medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </FormSelect>
            </FormRow>
          </FormSection>

          <FormSection title="Additional Info" last>
            <FormRow label="Labels">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[50px]">
                  {formData.labels && formData.labels.length > 0 ? (
                    formData.labels.map((label, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {label}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, labels: formData.labels.filter((_, i) => i !== idx) })}
                          className="hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No labels added</span>
                  )}
                </div>
                <FormSelect
                  onChange={(e) => {
                    if (e.target.value && !(formData.labels || []).includes(e.target.value)) {
                      setFormData({ ...formData, labels: [...(formData.labels || []), e.target.value] })
                    }
                    e.target.value = ''
                  }}
                >
                  <option value="">+ Add Label</option>
                  {labels.filter(l => !(formData.labels || []).includes(l?.name)).map(l => (
                    <option key={l?.name} value={l?.name}>{l?.name}</option>
                  ))}
                </FormSelect>
              </div>
            </FormRow>

            <FormRow label="Start Date">
              <FormInput
                type="date"
                value={formData.start_date || ''}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </FormRow>

            <FormRow label="Deadline" last>
              <FormInput
                type="date"
                value={formData.deadline || ''}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </FormRow>
          </FormSection>

          <FormActions>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                setSelectedTask(null)
                setFormData({
                  company_id: '',
                  title: '',
                  description: '',
                  related_to: '',
                  related_to_type: 'project',
                  points: '1',
                  assign_to: '',
                  collaborators: [],
                  status: 'Incomplete',
                  priority: 'Medium',
                  labels: [],
                  start_date: '',
                  deadline: '',
                  is_recurring: false,
                  recurring_frequency: 'daily',
                  uploaded_file: null,
                })
                setFilteredEmployees([])
              }}
              className="px-6"
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSave(false)}
              className="px-6 flex items-center gap-2"
            >
              <IoCheckmarkCircle size={18} />
              {isEditModalOpen ? 'Update Task' : 'Save Task'}
            </Button>
          </FormActions>
        </div>
      </RightSideModal>

      {/* View Task Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedTask(null)
        }}
        title="Task Details"
        width="700px"
      >
        {selectedTask && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-secondary-text">Title</label>
              <p className="text-primary-text mt-1 text-base font-semibold">{selectedTask.title}</p>
            </div>
            {selectedTask.description && (
              <div>
                <label className="text-sm font-medium text-secondary-text">Description</label>
                <p className="text-primary-text mt-1 text-base whitespace-pre-wrap">{selectedTask.description}</p>
              </div>
            )}

            {/* Project Name */}
            <div>
              <label className="text-sm font-medium text-secondary-text">Project Name</label>
              <p className="text-primary-text mt-1 text-blue-600">{selectedTask.project_name || '-'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-text">Status</label>
                <div className="mt-1">
                  <Badge className={`text-xs ${getStatusColor(selectedTask.status)}`}>
                    {getStatusLabel(selectedTask.status)}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Priority</label>
                <div className="mt-1">
                  <Badge variant="default">{selectedTask.priority || 'Medium'}</Badge>
                </div>
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="text-sm font-medium text-secondary-text">Labels</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {selectedTask.labels && selectedTask.labels.length > 0 ? (
                  selectedTask.labels.map((label, idx) => (
                    <Badge key={`${getLabelName(label)}-${idx}`} className={`text-xs ${getLabelColor(label)}`}>
                      {getLabelName(label)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-secondary-text">No labels</span>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-text">Start Date</label>
                <p className="text-primary-text mt-1">{selectedTask.start_date ? formatDate(selectedTask.start_date) : '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Deadline</label>
                <p className={`mt-1 ${isDeadlineOverdue(selectedTask.deadline) ? 'text-red-600 font-medium' : 'text-primary-text'}`}>
                  {selectedTask.deadline ? formatDate(selectedTask.deadline) : '-'}
                </p>
              </div>
            </div>

            {/* Assigned To */}
            <div>
              <label className="text-sm font-medium text-secondary-text">Assigned To</label>
              <div className="mt-1">
                {selectedTask.assigned_to && selectedTask.assigned_to.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-accent/20 flex items-center justify-center text-xs font-semibold text-primary-accent">
                      {selectedTask.assigned_to[0].avatar || 'U'}
                    </div>
                    <span className="text-primary-text">{selectedTask.assigned_to[0].name}</span>
                  </div>
                ) : (
                  <span className="text-secondary-text">Not assigned</span>
                )}
              </div>
            </div>

            {/* Collaborators */}
            <div>
              <label className="text-sm font-medium text-secondary-text">Collaborators</label>
              <div className="mt-1">
                {selectedTask.collaborators && selectedTask.collaborators.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.collaborators.map((collab, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-semibold text-purple-600">
                          {collab.name ? collab.name.charAt(0).toUpperCase() : collab.email?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <span className="text-sm text-primary-text">{collab.name || collab.email || 'Unknown'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-secondary-text">No collaborators</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 pt-4 border-t border-gray-200 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(selectedTask)
                }}
                className="px-4 text-gray-900 hover:text-white min-w-[100px]"
              >
                Edit Task
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedTask(null)
                }}
                className="px-4 min-w-[100px]"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </RightSideModal >

      {/* Manage Labels Modal */}
      <Modal
        isOpen={isManageLabelsModalOpen}
        onClose={() => {
          setIsManageLabelsModalOpen(false)
          setNewLabel('')
          setNewLabelColor('#22c55e')
        }}
        title="Manage Labels"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
            <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <IoAdd className="text-primary-accent" /> Create New Label
            </h4>

            <div className="space-y-4">
              {/* Color Selection - Premium Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
                {[
                  '#22c55e', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6',
                  '#ef4444', '#f97316', '#eab308', '#ec4899', '#64748b',
                  '#166534', '#065f46', '#1e40af', '#3730a3', '#5b21b6',
                  '#991b1b', '#9a3412', '#854d0e', '#9d174d', '#334155'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewLabelColor(color)}
                    className={`group relative w-full aspect-square rounded-lg transition-all duration-200 ${newLabelColor === color ? 'ring-2 ring-primary-accent ring-offset-2 scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  >
                    {newLabelColor === color && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <IoCheckmarkCircle className="text-white drop-shadow-sm" size={14} />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Label name (e.g. Bug, Design, Urgent)"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent outline-none transition-all shadow-sm group-hover:border-gray-300"
                  />
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: newLabelColor }}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleAddLabel}
                  disabled={!newLabel.trim()}
                  className="flex items-center gap-2 rounded-xl transition-all active:scale-95"
                >
                  <IoAdd size={20} />
                  <span>Add</span>
                </Button>
              </div>
            </div>
          </div>

          {/* List of Labels */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <IoList className="text-gray-400" /> Existing Labels
                {labels.length > 0 && <span className="text-xs font-normal text-gray-400">({labels.length})</span>}
              </h4>
            </div>

            {labels.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {labels.map((labelItem, idx) => {
                  const labelName = typeof labelItem === 'object' ? labelItem.name : labelItem
                  const labelColor = typeof labelItem === 'object' ? labelItem.color : '#22c55e'
                  return (
                    <div
                      key={`${labelName}-${idx}`}
                      className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all animate-in fade-in slide-in-from-left-2"
                      style={{ borderLeft: `4px solid ${labelColor}` }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="px-3 py-1 rounded-full text-white text-xs font-bold shadow-sm"
                          style={{ backgroundColor: labelColor }}
                        >
                          {labelName}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setNewLabel(labelName)
                            setNewLabelColor(labelColor)
                          }}
                          className="p-1.5 text-gray-400 hover:text-primary-accent hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <IoPencil size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteLabel(labelName)
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <IoTrashOutline size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                <IoPricetag size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm text-gray-500 font-medium">No custom labels created yet</p>
                <p className="text-xs text-gray-400 mt-1">Start by adding labels from above</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => setIsManageLabelsModalOpen(false)}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-primary-accent transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal >

      {/* Import Tasks Modal */}
      < Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false)
          setImportFile(null)
          setImportPreview([])
        }}
        title="Import Tasks"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary-text">Import tasks from CSV or Excel file</p>

          {/* Download Sample CSV */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 mb-2">Download sample CSV template:</p>
            <button
              onClick={handleDownloadSampleCSV}
              className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            >
              <IoDownload size={14} />
              Download Sample CSV
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Select File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-accent transition-colors">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleImportFileChange}
                className="hidden"
                id="import-file-input"
              />
              <label htmlFor="import-file-input" className="cursor-pointer">
                <IoCloudUpload size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {importFile ? importFile.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-400 mt-1">CSV or Excel files only</p>
              </label>
            </div>
          </div>

          {/* Preview */}
          {importPreview.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Preview ({importPreview.length} tasks to import)
              </label>
              <div className="max-h-48 overflow-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-1 text-left">Title</th>
                      <th className="px-2 py-1 text-left">Project</th>
                      <th className="px-2 py-1 text-left">Status</th>
                      <th className="px-2 py-1 text-left">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.slice(0, 10).map((task, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="px-2 py-1">{task.title}</td>
                        <td className="px-2 py-1">{task.project_id || '-'}</td>
                        <td className="px-2 py-1">{task.status || 'Incomplete'}</td>
                        <td className="px-2 py-1">{task.priority || 'Medium'}</td>
                      </tr>
                    ))}
                    {importPreview.length > 10 && (
                      <tr className="border-t border-gray-100">
                        <td colSpan={4} className="px-2 py-1 text-center text-gray-500">
                          ... and {importPreview.length - 10} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsImportModalOpen(false)
                setImportFile(null)
                setImportPreview([])
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImportTasks}
              disabled={!importFile || importPreview.length === 0 || importLoading}
              className="flex-1"
            >
              {importLoading ? 'Importing...' : `Import ${importPreview.length} Tasks`}
            </Button>
          </div>
        </div>
      </Modal >
    </div >
  )
}

export default Tasks

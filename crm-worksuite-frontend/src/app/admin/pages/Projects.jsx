import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import UniqueIdBadge, { ID_PREFIXES } from '../../../components/ui/UniqueIdBadge'
import { projectsAPI, clientsAPI, usersAPI, employeesAPI, departmentsAPI } from '../../../api'
import { useAuth } from '../../../context/AuthContext'
import {
  IoEye,
  IoPencil,
  IoTrashOutline,
  IoList,
  IoGrid,
  IoDocumentText,
  IoTime,
  IoPeople,
  IoFolder,
  IoAdd,
  IoClose,
  IoDownload,
  IoSearch,
  IoFilter,
  IoCalendar,
  IoPin,
  IoPrint,
  IoChevronDown,
  IoChevronUp,
  IoEllipsisVertical,
  IoGlobe,
  IoCheckmarkCircle,
  IoRadioButtonOn,
  IoRadioButtonOff,
  IoPricetag,
  IoBriefcase
} from 'react-icons/io5'
import {
  FormRow,
  FormSection,
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  FormActions
} from '../../../components/ui/FormRow'
import RichTextEditor from '../../../components/ui/RichTextEditor'


const Projects = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  // Ensure companyId is always a number
  const companyId = parseInt(user?.company_id || localStorage.getItem('companyId') || 1, 10)
  const [viewMode, setViewMode] = useState('list') // 'list', 'card', 'calendar', 'pin'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const handleView = (project) => {
    navigate(`/app/admin/projects/${project.id}`)
  }
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [isManageLabelsModalOpen, setIsManageLabelsModalOpen] = useState(false)
  const [availableLabels, setAvailableLabels] = useState([])
  const [newLabelColor, setNewLabelColor] = useState('#78be20')
  const [newLabel, setNewLabel] = useState('')

  const PREDEFINED_COLORS = [
    '#78be20', '#00bfc4', '#3b82f6', '#94a3b8', '#eab308',
    '#f59e0b', '#ef4444', '#ec4899', '#a855f7', '#22d3ee',
    '#334155', '#d8b4fe'
  ]
  const [showOtherDetails, setShowOtherDetails] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Projects')
  const [progressFilter, setProgressFilter] = useState('')
  const [labelFilter, setLabelFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [assignedUserFilter, setAssignedUserFilter] = useState('')
  const [projectTypeFilter, setProjectTypeFilter] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [sortColumn, setSortColumn] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('DESC')
  const [filterOptions, setFilterOptions] = useState({
    statuses: [],
    priorities: [],
    categories: [],
    clients: [],
    assigned_users: []
  })

  const [formData, setFormData] = useState({
    company_id: (companyId && !isNaN(companyId) && companyId > 0) ? companyId : '', // Auto-set from Admin session
    department_id: '', // Cascading from company
    client_id: '', // Cascading from company
    projectManager: '', // Employee cascading from company/department
    shortCode: '',
    projectName: '',
    description: '', // Project description
    startDate: '',
    deadline: '',
    noDeadline: false,
    budget: '', // Budget field
    projectCategory: '',
    projectSubCategory: '',
    projectSummary: '',
    notes: '',
    publicGanttChart: 'enable',
    publicTaskBoard: 'enable',
    taskApproval: 'disable',
    label: '',
    projectMembers: [],
    createPublicProject: false,
    createPublicProject: false,
    status: 'in progress',
    projectType: 'Client Project',
  })

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [filteredDepartments, setFilteredDepartments] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [departments, setDepartments] = useState([])
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('')

  // Memoize fetch functions to prevent recreation
  const fetchClients = useCallback(async (companyId) => {
    try {
      // Ensure companyId is a valid number
      const validCompanyId = parseInt(companyId, 10)
      if (!validCompanyId || isNaN(validCompanyId) || validCompanyId <= 0) {
        console.error('Invalid companyId for fetchClients:', companyId, 'parsed:', validCompanyId)
        setFilteredClients([])
        return
      }
      const response = await clientsAPI.getAll({ company_id: validCompanyId })
      if (response.data.success) {
        setFilteredClients(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      console.error('Error response:', error.response?.data)
      setFilteredClients([])
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      const response = await usersAPI.getAll()
      if (response.data.success) {
        setUsers(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }, [])


  const fetchDepartments = useCallback(async (companyId) => {
    try {
      // Ensure companyId is a valid number
      const validCompanyId = parseInt(companyId, 10)
      if (!validCompanyId || isNaN(validCompanyId) || validCompanyId <= 0) {
        console.error('Invalid companyId for fetchDepartments:', companyId, 'parsed:', validCompanyId)
        setDepartments([])
        setFilteredDepartments([])
        return
      }
      const response = await departmentsAPI.getAll({ company_id: validCompanyId })
      if (response.data.success) {
        const depts = response.data.data || []
        setDepartments(depts)
        setFilteredDepartments(depts)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      console.error('Error response:', error.response?.data)
      setDepartments([])
      setFilteredDepartments([])
    }
  }, [])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch filter options
  const fetchLabels = useCallback(async () => {
    try {
      const response = await projectsAPI.getAllLabels({ company_id: companyId })
      if (response.data.success) {
        setAvailableLabels(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching labels:', error)
    }
  }, [companyId])

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  const handleAddLabel = async () => {
    if (!newLabel.trim()) return
    try {
      const response = await projectsAPI.createLabel({
        name: newLabel.trim(),
        color: newLabelColor,
        company_id: companyId
      })
      if (response.data.success) {
        setNewLabel('')
        setNewLabelColor('#3b82f6')
        fetchLabels()
      }
    } catch (error) {
      console.error('Error creating label:', error)
      alert(error.response?.data?.error || 'Failed to create label')
    }
  }

  const handleDeleteLabel = async (labelId) => {
    if (!window.confirm('Are you sure you want to delete this label?')) return
    try {
      const response = await projectsAPI.deleteLabel(labelId, { company_id: companyId })
      if (response.data.success) {
        fetchLabels()
      }
    } catch (error) {
      console.error('Error deleting label:', error)
    }
  }

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await projectsAPI.getFilters()
      if (response.data.success) {
        setFilterOptions(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }, [])

  const fetchProjects = useCallback(async () => {
    try {
      // Ensure companyId is a valid number
      const validCompanyId = parseInt(companyId, 10)
      if (!validCompanyId || isNaN(validCompanyId) || validCompanyId <= 0) {
        console.error('Invalid companyId for fetchProjects:', companyId, 'parsed:', validCompanyId)
        setLoading(false)
        return
      }

      setLoading(true)
      const params = {
        company_id: validCompanyId // Always include company_id from Admin session
      }

      // Search
      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery
      }

      // Status filter
      if (statusFilter && statusFilter !== 'All Projects') {
        params.status = statusFilter
      }

      // Priority/Label filter
      if (labelFilter) {
        params.priority = labelFilter
      }

      // Client filter
      if (clientFilter) {
        params.client_id = clientFilter
      }

      // Assigned user filter
      if (assignedUserFilter) {
        params.assigned_user_id = assignedUserFilter
      }

      // Project type filter
      if (projectTypeFilter) {
        params.project_type = projectTypeFilter
      }

      // Date range filters
      if (startDateFilter) {
        params.start_date = startDateFilter
      }
      if (endDateFilter) {
        params.end_date = endDateFilter
      }

      // Progress filter
      if (progressFilter) {
        const [min, max] = progressFilter.split(' - ').map(s => parseInt(s.replace('%', '')))
        if (min !== undefined) params.progress_min = min
        if (max !== undefined) params.progress_max = max
      }

      // Sorting
      if (sortColumn) {
        params.sort_by = sortColumn
        params.sort_order = sortDirection
      }

      const response = await projectsAPI.getAll(params)
      if (response.data.success) {
        const fetchedProjects = response.data.data || []
        // Transform API data to match component format
        const transformedProjects = fetchedProjects.map(project => ({
          id: project.id,
          code: project.short_code || '',
          name: project.project_name || '',
          company_name: project.company_name || '',
          department_name: project.department_name || '',
          client_name: project.client_name || '',
          project_manager_name: project.project_manager_name || '',
          budget: project.budget || null,
          members: (project.members || []).map(member => ({
            id: member.id || member.user_id,
            name: member.name || member.email,
            avatar: member.name ? member.name.split(' ').map(n => n[0]).join('') : member.email.substring(0, 2).toUpperCase(),
          })),
          startDate: project.start_date ? project.start_date.split('T')[0] : '',
          deadline: project.deadline ? project.deadline.split('T')[0] : null,
          client: {
            name: project.client_name || 'Unknown Client',
            company: project.client_name || 'Unknown Company',
            avatar: project.client_name ? project.client_name.substring(0, 2).toUpperCase() : 'UC',
          },
          status: project.status || 'in progress',
          progress: project.progress || 0,
          label: project.label || '',
          price: project.budget || project.price || null,
          // Keep original fields for edit
          company_id: project.company_id,
          department_id: project.department_id,
          client_id: project.client_id,
          project_manager_id: project.project_manager_id,
          description: project.description,
        }))
        setProjects(transformedProjects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      console.error('Error response:', error.response?.data)
      console.error('Request params:', params)
    } finally {
      setLoading(false)
    }
  }, [companyId, debouncedSearchQuery, statusFilter, labelFilter, clientFilter, assignedUserFilter, projectTypeFilter, startDateFilter, endDateFilter, progressFilter, sortColumn, sortDirection])

  // Fetch departments by company
  const fetchDepartmentsByCompany = useCallback(async (companyId) => {
    try {
      const response = await departmentsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setFilteredDepartments(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      setFilteredDepartments([])
    }
  }, [])

  // Fetch clients by company
  const fetchClientsByCompany = useCallback(async (companyId) => {
    try {
      const response = await clientsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setFilteredClients(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      setFilteredClients([])
    }
  }, [])

  // Fetch employees by company (and optionally department)
  const fetchEmployeesByCompany = useCallback(async (companyId, departmentId = null) => {
    try {
      // Ensure companyId is a valid number
      const validCompanyId = parseInt(companyId, 10)
      if (!validCompanyId || isNaN(validCompanyId) || validCompanyId <= 0) {
        console.error('Invalid companyId for fetchEmployeesByCompany:', companyId, 'parsed:', validCompanyId)
        setFilteredEmployees([])
        return
      }
      const params = { company_id: validCompanyId }
      if (departmentId) {
        params.department_id = departmentId
      }
      const response = await employeesAPI.getAll(params)
      if (response.data.success) {
        setFilteredEmployees(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      // Fallback to users if employees API fails
      const allUsers = users.filter(u => u.company_id === companyId || u.company_id === parseInt(companyId))
      setFilteredEmployees(allUsers)
    }
  }, [users])

  const availableMembers = [
    'Alanna Jones',
    'Anthony Cummerata Jr.',
    'Axel Homenick',
    'Clyde Schimmel II',
    'Dr. Cassidy McGlynn MD',
    'Fred Upton',
    'Miss Halie Gleichner',
    'Mr. Hermann Hegmann',
    'River Abbott',
    'Sheldon Lemke II',
    'Sonny Steuber',
    'Sterling Buckridge',
  ]

  // Fetch initial data filtered by Admin's company - ONLY ONCE on mount
  useEffect(() => {
    if (companyId && !isNaN(companyId) && companyId > 0) {
      // Parallelize initial data fetch for better performance
      Promise.all([
        fetchClients(companyId),
        fetchDepartments(companyId),
        fetchEmployeesByCompany(companyId),
        fetchUsers()
      ]).catch(error => {
        console.error('Error fetching initial data:', error)
      })
    } else {
      console.warn('Invalid companyId:', companyId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]) // Only re-fetch when companyId changes

  // When department changes, filter employees
  useEffect(() => {
    if (formData.department_id) {
      fetchEmployeesByCompany(companyId, formData.department_id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.department_id])

  // Fetch filter options on mount - ONLY ONCE
  useEffect(() => {
    fetchFilterOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch projects on mount and when filters change
  useEffect(() => {
    if (companyId && !isNaN(companyId) && companyId > 0) {
      fetchProjects()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, debouncedSearchQuery, statusFilter, labelFilter, clientFilter, assignedUserFilter, projectTypeFilter, startDateFilter, endDateFilter, progressFilter, sortColumn, sortDirection])

  const projectCategories = ['Web Development', 'Mobile App', 'Design', 'Marketing', 'Consulting', 'Other']

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
  }

  const isDeadlineOverdue = (deadline) => {
    return new Date(deadline) < new Date()
  }


  const handleAdd = () => {
    // Auto-set company_id from Admin session and fetch filtered data
    const adminCompanyId = companyId
    setFormData({
      company_id: adminCompanyId, // Auto-set from Admin session
      department_id: '',
      client_id: '',
      projectManager: '',
      shortCode: '',
      projectName: '',
      description: '',
      startDate: '',
      deadline: '',
      noDeadline: false,
      budget: '',
      projectCategory: '',
      projectSubCategory: '',
      projectSummary: '',
      notes: '',
      publicGanttChart: 'enable',
      publicTaskBoard: 'enable',
      taskApproval: 'disable',
      label: '',
      projectMembers: [],
      createPublicProject: false,
      createPublicProject: false,
      status: 'in progress',
      projectType: 'Client Project',
    })
    // Fetch filtered data for Admin's company
    if (adminCompanyId) {
      fetchClients(adminCompanyId)
      fetchDepartments(adminCompanyId)
      fetchEmployeesByCompany(adminCompanyId)
    }
    setEmployeeSearchQuery('')
    setIsAddModalOpen(true)
  }

  const handleSave = async () => {
    // Auto-set company_id from Admin session
    const adminCompanyId = companyId
    if (!adminCompanyId) {
      alert('Company ID is required. Please login again.')
      return
    }
    if (!formData.projectName) {
      alert('Project Name is required')
      return
    }
    // Only require date/deadline for new projects or if fields are touched/cleared
    if (!formData.startDate) {
      alert('Start Date is required')
      return
    }
    if (!formData.noDeadline && !formData.deadline) {
      alert('Deadline is required')
      return
    }
    if (formData.projectType === 'Client Project' && !formData.client_id) {
      alert('Client is required for Client Projects')
      return
    }

    // Warn if project manager is missing but don't block strictly if editing legacy data
    if (!formData.projectManager) {
      if (!isEditModalOpen) {
        alert('Project Manager is required')
        return
      }
    }

    try {
      // Ensure selected employee is included in members (if not already selected and valid)
      const employeeId = parseInt(formData.projectManager)
      const validEmployeeId = !isNaN(employeeId) ? employeeId : null

      const baseMembers = Array.isArray(formData.projectMembers)
        ? formData.projectMembers.map(m => parseInt(m)).filter(m => !isNaN(m))
        : []

      const projectMembers = validEmployeeId
        ? [...new Set([validEmployeeId, ...baseMembers])]
        : [...new Set(baseMembers)]

      const projectData = {
        company_id: parseInt(adminCompanyId), // Auto-set from Admin session
        short_code: formData.shortCode || formData.projectName.substring(0, 3).toUpperCase(),
        project_name: formData.projectName,
        description: formData.description || null,
        start_date: formData.startDate,
        deadline: formData.noDeadline ? null : formData.deadline,
        no_deadline: formData.noDeadline ? 1 : 0,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        project_category: formData.projectCategory || null,
        project_sub_category: formData.projectSubCategory || null,
        department_id: formData.department_id || null,
        client_id: parseInt(formData.client_id),
        project_manager_id: validEmployeeId || null,
        project_summary: formData.projectSummary || null,
        notes: formData.notes || null,
        public_gantt_chart: formData.publicGanttChart || 'enable',
        public_task_board: formData.publicTaskBoard || 'enable',
        task_approval: formData.taskApproval || 'disable',
        label: formData.label || null,
        project_members: projectMembers, // Array of user IDs (includes selected employee)
        status: formData.status || 'in progress',
        progress: 0,
      }

      if (isEditModalOpen && selectedProject) {
        const response = await projectsAPI.update(selectedProject.id, projectData)
        if (response.data.success) {
          alert('Project updated successfully!')
          await fetchProjects()
          setIsEditModalOpen(false)
          setSelectedProject(null)
        } else {
          alert(response.data.error || 'Failed to update project')
        }
      } else {
        const response = await projectsAPI.create(projectData)
        if (response.data.success) {
          alert('Project created successfully!')
          await fetchProjects()
          setIsAddModalOpen(false)
        } else {
          alert(response.data.error || 'Failed to create project')
        }
      }

      // Reset form (keep company_id from Admin session)
      setFormData({
        company_id: companyId, // Keep Admin's company_id
        department_id: '',
        client_id: '',
        projectManager: '',
        shortCode: '',
        projectName: '',
        description: '',
        startDate: '',
        deadline: '',
        noDeadline: false,
        budget: '',
        projectCategory: '',
        projectSubCategory: '',
        projectSummary: '',
        notes: '',
        publicGanttChart: 'enable',
        publicTaskBoard: 'enable',
        taskApproval: 'disable',
        label: '',
        projectMembers: [],
        createPublicProject: false,
        status: 'in progress',
      })
      setFilteredEmployees([])
      setFilteredDepartments([])
      setFilteredClients([])
      setEmployeeSearchQuery('')
    } catch (error) {
      console.error('Error saving project:', error)
      alert(error.response?.data?.error || 'Failed to save project')
    }
  }

  // Placeholder for hidden file input ref
  const fileInputRef = useRef(null)

  const handleImportProjects = () => {
    setIsImportModalOpen(true)
  }

  const handleFileImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Simple CSV parser
    const reader = new FileReader()
    reader.onload = async (evt) => {
      const text = evt.target.result
      const lines = text.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        alert('CSV file must have at least a header row and one data row')
        e.target.value = ''
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('title') || h.toLowerCase().includes('project'))

      if (nameIndex === -1) {
        alert('CSV must contain a column with "name", "title", or "project" in the header')
        e.target.value = ''
        return
      }

      let successCount = 0
      let failCount = 0

      // Skip header, process rows
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const projectData = {
          company_id: companyId,
          project_name: values[nameIndex] || `Imported Project ${i}`,
          status: 'in progress',
          start_date: new Date().toISOString().slice(0, 10),
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        }

        try {
          await projectsAPI.create(projectData, { company_id: companyId })
          successCount++
        } catch (err) {
          console.error('Error importing project:', err)
          failCount++
        }
      }

      alert(`Import complete. Successfully imported ${successCount} projects. ${failCount} failed.`)
      e.target.value = '' // Reset
      await fetchProjects() // Refresh the list
    }
    reader.onloaderror = () => {
      alert('Error reading file')
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  const handleManageLabels = () => {
    setIsManageLabelsModalOpen(true)
  }

  const handleEdit = async (project) => {
    setSelectedProject(project)

    // Fetch full project data with company_id
    try {
      const response = await projectsAPI.getById(project.id, { company_id: companyId })
      if (response.data.success) {
        const fullProject = response.data.data

        setFormData({
          company_id: fullProject.company_id || '',
          department_id: fullProject.department_id ? fullProject.department_id.toString() : '',
          client_id: fullProject.client_id ? fullProject.client_id.toString() : '',
          projectManager: fullProject.project_manager_id ? fullProject.project_manager_id.toString() : '',
          shortCode: fullProject.short_code || project.code || '',
          projectName: fullProject.project_name || project.name || '',
          description: fullProject.description || '',
          startDate: fullProject.start_date ? fullProject.start_date.split('T')[0] : project.startDate || '',
          deadline: fullProject.deadline ? fullProject.deadline.split('T')[0] : project.deadline || '',
          noDeadline: fullProject.no_deadline || !fullProject.deadline,
          budget: fullProject.budget?.toString() || '',
          projectCategory: fullProject.project_category || '',
          projectSubCategory: fullProject.project_sub_category || '',
          projectSummary: fullProject.project_summary || '',
          notes: fullProject.notes || '',
          publicGanttChart: fullProject.public_gantt_chart || 'enable',
          publicTaskBoard: fullProject.public_task_board || 'enable',
          taskApproval: fullProject.task_approval || 'disable',
          label: fullProject.label || '',
          projectMembers: fullProject.members?.map(m => (m.id || m.user_id).toString()) || project.members?.map(m => m.id.toString()) || [],
          createPublicProject: fullProject.create_public_project ? true : false,
          status: fullProject.status || 'in progress',
        })

        // Fetch cascading data filtered by Admin's company
        if (companyId) {
          await fetchDepartments(companyId)
          await fetchClients(companyId)
          await fetchEmployeesByCompany(companyId, fullProject.department_id || null)
        }
      }
    } catch (error) {
      console.error('Error fetching project details:', error)
      // Fallback to existing project data
      const clientName = project.client?.name || project.client?.company || ''
      const clientId = clients.find(c => c.company_name === clientName)?.id || ''

      setFormData({
        company_id: '',
        department_id: '',
        client_id: clientId ? clientId.toString() : '',
        projectManager: '', // Can't guess this easily from list view if not present
        shortCode: project.code || '',
        projectName: project.name || '',
        description: '',
        startDate: project.startDate || '',
        deadline: project.deadline || '',
        noDeadline: !project.deadline,
        budget: '',
        projectCategory: '',
        projectSubCategory: '',
        projectSummary: '',
        notes: '',
        publicGanttChart: 'enable',
        publicTaskBoard: 'enable',
        taskApproval: 'disable',
        label: '',
        projectMembers: project.members?.map(m => m.id) || [],
        createPublicProject: false,
        status: 'in progress',
      })
    }

    setIsEditModalOpen(true)
  }

  const handleDelete = async (project) => {
    if (window.confirm(`Are you sure you want to delete ${project.name}?`)) {
      try {
        const response = await projectsAPI.delete(project.id, { company_id: companyId })
        if (response.data.success) {
          alert('Project deleted successfully!')
          await fetchProjects()
        } else {
          alert(response.data.error || 'Failed to delete project')
        }
      } catch (error) {
        console.error('Error deleting project:', error)
        alert(error.response?.data?.error || 'Failed to delete project')
      }
    }
  }

  // Handle Excel Export
  const handleExportExcel = () => {
    // Flatten data for export
    const csvData = filteredProjects.map(p => ({
      ID: p.id,
      Code: p.code,
      Name: p.name,
      Client: p.client?.name || p.client_name,
      Status: p.status,
      Progress: p.progress + '%',
      Budget: p.budget,
      StartDate: p.startDate,
      Deadline: p.deadline
    }))

    // Convert to CSV
    const headers = Object.keys(csvData[0] || {}).join(',')
    const rows = csvData.map(obj => Object.values(obj).map(val => `"${val || ''}"`).join(','))
    const csvString = [headers, ...rows].join('\n')

    // Download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `projects_export_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    setIsExcelModalOpen(false)
  }

  // Handle Print
  const handlePrint = () => {
    // Create a print-friendly table
    const printWindow = window.open('', '_blank')
    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Projects Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .badge { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Projects Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Project Name</th>
                <th>Code</th>
                <th>Client</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Start Date</th>
                <th>Deadline</th>
                <th>Label</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProjects.map(project => `
                <tr>
                  <td>${project.id}</td>
                  <td>${project.name || project.project_name || '-'}</td>
                  <td>${project.code || project.short_code || '-'}</td>
                  <td>${project.client?.name || project.client_name || '-'}</td>
                  <td>${project.status || '-'}</td>
                  <td>${project.progress || 0}%</td>
                  <td>${project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</td>
                  <td>${project.deadline ? new Date(project.deadline).toLocaleDateString() : '-'}</td>
                  <td>${project.label || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    printWindow.document.write(tableHTML)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const columns = [
    {
      key: 'checkbox',
      label: '',
      render: (value, row) => (
        <input type="checkbox" className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent" />
      ),
    },
    {
      key: 'id',
      label: 'Project ID',
      render: (value, row) => <UniqueIdBadge prefix={ID_PREFIXES.PROJECT} id={row.id} size="sm" />,
    },
    {
      key: 'name',
      label: 'Title',
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <a
            href="#"
            className="text-gray-900 hover:text-blue-600 hover:underline font-medium text-sm"
            onClick={(e) => {
              e.preventDefault()
              handleView(row)
            }}
          >
            {value || row.project_name || '-'}
          </a>
          {row.label && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold text-white w-fit shadow-sm uppercase tracking-wide whitespace-nowrap"
              style={{ backgroundColor: availableLabels.find(l => l.name === row.label)?.color || '#3b82f6' }}
            >
              {row.label}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'client',
      label: 'Client',
      render: (value, row) => {
        if (row.project_type === 'Internal Project' || (!row.client_name && !row.client?.name)) {
          return <span className="text-secondary-text italic text-xs">Internal Project</span>
        }
        return <span className="text-primary-text">{row.client?.name || row.client_name || '-'}</span>
      },
    },
    {
      key: 'budget',
      label: 'Price',
      render: (value, row) => {
        const budget = value || row.budget || row.price
        return budget ? `$${parseFloat(budget).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'
      },
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (value, row) => {
        const date = value || row.start_date
        return date ? formatDate(date) : '-'
      },
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (value, row) => {
        const deadline = value || row.deadline
        return (
          <span className={deadline && isDeadlineOverdue(deadline) ? 'text-red-600 font-medium' : 'text-primary-text'}>
            {deadline ? formatDate(deadline) : '-'}
          </span>
        )
      },
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (value, row) => {
        const progress = row.progress || 0
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${progress >= 90 ? 'bg-green-600' :
                  progress >= 50 ? 'bg-blue-600' :
                    progress >= 30 ? 'bg-yellow-600' :
                      'bg-gray-400'
                  }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-secondary-text">{progress}%</span>
          </div>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => {
        const status = value || row.status || 'in progress'
        // Display text like in the reference design
        const displayStatus = status.toLowerCase() === 'in progress' ? 'Open' :
          status.toLowerCase() === 'completed' ? 'Completed' :
            status.toLowerCase() === 'on hold' ? 'On Hold' :
              status.toLowerCase() === 'cancelled' ? 'Cancelled' :
                status.charAt(0).toUpperCase() + status.slice(1)
        return (
          <span className="text-sm text-gray-700">
            {displayStatus}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'Action',
      render: (value, row) => (
        <div className="action-btn-container">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (row && row.id) {
                handleView(row)
              }
            }}
            className="action-btn action-btn-view"
            title="View"
            type="button"
          >
            <IoEye size={18} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (row && row.id) {
                handleEdit(row)
              }
            }}
            className="action-btn action-btn-edit"
            title="Edit"
            type="button"
          >
            <IoPencil size={18} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (row && row.id) {
                handleDelete(row)
              }
            }}
            className="action-btn action-btn-delete"
            title="Delete"
            type="button"
          >
            <IoTrashOutline size={18} />
          </button>
        </div>
      ),
    },
  ]

  // Projects are already filtered server-side, so use them directly
  const filteredProjects = projects

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
          <div className="flex items-center gap-2 flex-wrap print:hidden">
            <button
              onClick={handleManageLabels}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
            >
              <IoPricetag size={16} />
              <span className="hidden sm:inline">Manage labels</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
            >
              <IoDownload size={16} />
              <span className="hidden sm:inline">Import projects</span>
            </button>
            {/* Hidden Input for Import */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".csv,.xlsx,.xls"
              onChange={handleFileImport}
            />
            <AddButton onClick={handleAdd} label="Add project" />
          </div>
        </div>

        {/* View Mode and Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-gray-300 bg-white p-0.5">
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setViewMode('list')}
              >
                <IoList size={16} />
              </button>
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${viewMode === 'card' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setViewMode('card')}
              >
                <IoGrid size={16} />
              </button>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="All Projects">- Filters -</option>
              <option value="All Projects">All Projects</option>
              <option value="Completed">Completed</option>
              <option value="High Priority">High Priority</option>
              <option value="Open Projects">Open Projects</option>
              <option value="Upcoming">Upcoming</option>
            </select>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="p-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
              title="Advanced Filters"
            >
              <IoFilter size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <IoDownload size={14} />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <IoPrint size={14} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm w-48"
              />
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
        </div>

        {/* Status Quick Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {['All Projects', 'Completed', 'High Priority', 'Open Projects', 'Upcoming'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${statusFilter === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      {viewMode === 'list' && (
        <Card className="p-0 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredProjects}
            searchPlaceholder="Search projects..."
            filterConfig={[
              { key: 'status', label: 'Status', type: 'select', options: ['in progress', 'completed', 'on hold', 'cancelled'] },
              { key: 'company_name', label: 'Company', type: 'text' },
              { key: 'client_name', label: 'Client', type: 'text' },
              { key: 'project_manager_name', label: 'Employee', type: 'text' },
            ]}
            bulkActions={true}
            selectedRows={[]}
            onSelectAll={() => { }}
          />
        </Card>
      )}

      {/* Projects Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-secondary-text">Loading...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-8 text-secondary-text">
              <IoBriefcase size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No projects found</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Card key={project.id} className="p-3 sm:p-4 lg:p-5 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleView(project)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-primary-text truncate mb-1">{project.name}</h3>
                    <div className="flex flex-wrap gap-1 mb-1">
                      <p className="text-xs sm:text-sm text-secondary-text mr-2">ID: {project.id}</p>
                      {project.label && (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm uppercase tracking-tight"
                          style={{ backgroundColor: availableLabels.find(l => l.name === project.label)?.color || '#3b82f6' }}
                        >
                          {project.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className={`text-xs flex-shrink-0 ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'in progress' || project.status === 'open' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'on hold' ? 'bg-yellow-100 text-yellow-800' :
                        project.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                    }`}>
                    {project.status === 'in progress' ? 'Open' : project.status}
                  </Badge>
                </div>

                {project.label && (
                  <div className="mb-3">
                    <Badge className={`text-xs ${project.label === 'Urgent' ? 'bg-purple-100 text-purple-800' :
                      project.label === 'On track' ? 'bg-green-100 text-green-800' :
                        project.label === 'High Priority' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {project.label}
                    </Badge>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-secondary-text">Client:</span>
                    <span className="text-primary-text font-medium truncate ml-2">{project.client_name || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-secondary-text">Price:</span>
                    <span className="text-primary-text font-medium">
                      {project.budget || project.price ? `$${parseFloat(project.budget || project.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-secondary-text">Start Date:</span>
                    <span className="text-primary-text font-medium">
                      {project.startDate ? formatDate(project.startDate) : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-secondary-text">Deadline:</span>
                    <span className={`font-medium ${project.deadline && isDeadlineOverdue(project.deadline) ? 'text-red-600' : 'text-primary-text'
                      }`}>
                      {project.deadline ? formatDate(project.deadline) : '-'}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-secondary-text">Progress</span>
                    <span className="text-xs font-semibold text-primary-text">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${project.progress >= 90 ? 'bg-green-600' :
                        project.progress >= 50 ? 'bg-blue-600' :
                          project.progress >= 30 ? 'bg-yellow-600' :
                            'bg-gray-400'
                        }`}
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleView(project)
                    }}
                    className="flex-1 px-3 py-1.5 text-xs sm:text-sm font-medium bg-primary-accent text-white rounded-lg hover:bg-primary-accent/90 transition-colors"
                  >
                    View
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(project)
                      }}
                      className="px-2 sm:px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-colors flex-1 sm:flex-none"
                      title="Edit"
                    >
                      <IoPencil size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(project)
                      }}
                      className="px-2 sm:px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-colors flex-1 sm:flex-none"
                      title="Delete"
                    >
                      <IoTrashOutline size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Project Modal - Modern Spacious Design */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedProject(null)
          setFormData({
            company_id: companyId,
            department_id: '',
            client_id: '',
            projectManager: '',
            shortCode: '',
            projectName: '',
            description: '',
            startDate: '',
            deadline: '',
            noDeadline: false,
            budget: '',
            projectCategory: '',
            projectSubCategory: '',
            projectSummary: '',
            notes: '',
            publicGanttChart: 'enable',
            publicTaskBoard: 'enable',
            taskApproval: 'disable',
            label: '',
            projectMembers: [],
            createPublicProject: false,
            status: 'in progress',
          })
          setFilteredEmployees([])
          setFilteredDepartments([])
          setFilteredClients([])
          setEmployeeSearchQuery('')
        }}
        title={isAddModalOpen ? "Create New Project" : "Edit Project Details"}
        size="full"
      >
        <div className="space-y-8 p-2">
          {/* Section 1: Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <IoBriefcase className="text-primary-accent" />
              Project Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-2">
                <Input
                  label="Project Name *"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <Input
                label="Short Code"
                value={formData.shortCode}
                onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                placeholder="Ex: PRJ-001"
                helperText="Leave empty to auto-generate"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => {
                    const type = e.target.value
                    setFormData({
                      ...formData,
                      projectType: type,
                      client_id: type === 'Internal Project' ? '' : formData.client_id
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent outline-none transition-all"
                >
                  <option value="Client Project">Client Project</option>
                  <option value="Internal Project">Internal Project</option>
                </select>
              </div>

              {formData.projectType === 'Client Project' && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent outline-none transition-all"
                      required
                    >
                      <option value="">-- Select Client --</option>
                      {filteredClients
                        .filter((client, index, self) =>
                          index === self.findIndex(c => c.id === client.id)
                        )
                        .map(client => (
                          <option key={client.id} value={client.id}>
                            {client.client_name || client.name || client.company_name || `Client #${client.id}`}
                          </option>
                        ))}
                    </select>
                    <Button variant="outline" onClick={() => navigate('/app/admin/clients')} title="Add New Client">
                      <IoAdd size={20} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6"></div>

          {/* Section 2: Schedule & Budget */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <IoCalendar className="text-primary-accent" />
              Schedule & Budget
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                type="date"
                label="Start Date *"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <div className="relative">
                <Input
                  type="date"
                  label="Deadline"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  disabled={formData.noDeadline}
                />
                <div className="absolute right-0 top-0">
                  <FormCheckbox
                    label="No Deadline"
                    checked={formData.noDeadline}
                    onChange={(e) => setFormData({ ...formData, noDeadline: e.target.checked, deadline: e.target.checked ? '' : formData.deadline })}
                  />
                </div>
              </div>
              <Input
                type="number"
                label="Budget ($)"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6"></div>

          {/* Section 3: Team */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <IoPeople className="text-primary-accent" />
              Team Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={formData.department_id}
                  onChange={(e) => {
                    const deptId = e.target.value
                    setFormData({
                      ...formData,
                      department_id: deptId,
                      projectManager: '',
                      projectMembers: []
                    })
                    if (deptId && companyId) {
                      fetchEmployeesByCompany(companyId, deptId)
                    } else if (companyId) {
                      fetchEmployeesByCompany(companyId)
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent outline-none transition-all"
                >
                  <option value="">-- All Departments --</option>
                  {filteredDepartments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name || dept.department_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Manager *</label>
                <select
                  value={formData.projectManager}
                  onChange={(e) => {
                    const managerId = e.target.value
                    setFormData({
                      ...formData,
                      projectManager: managerId,
                      projectMembers: managerId && !formData.projectMembers.includes(parseInt(managerId))
                        ? [...formData.projectMembers, parseInt(managerId)]
                        : formData.projectMembers
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent outline-none transition-all"
                  required
                >
                  <option value="">-- Select Manager --</option>
                  {filteredEmployees.map(employee => (
                    <option key={employee.user_id || employee.id} value={employee.user_id || employee.id}>
                      {employee.name || employee.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Members</label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-[200px] overflow-y-auto">
                  <div className="mb-3 relative">
                    <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={employeeSearchQuery}
                      onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-accent"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {filteredEmployees
                      .filter(employee => {
                        if (!employeeSearchQuery) return true
                        const searchTerm = employeeSearchQuery.toLowerCase()
                        return (
                          (employee.name || '').toLowerCase().includes(searchTerm) ||
                          (employee.email || '').toLowerCase().includes(searchTerm)
                        )
                      })
                      .map(employee => {
                        const employeeId = parseInt(employee.user_id || employee.id)
                        const isManager = parseInt(formData.projectManager) === employeeId
                        const isSelected = formData.projectMembers.map(m => parseInt(m)).includes(employeeId)

                        return (
                          <label
                            key={employeeId}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isSelected || isManager ? 'bg-primary-accent/10 border border-primary-accent/30' : 'hover:bg-white border border-transparent'}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected || isManager}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (!formData.projectMembers.map(m => parseInt(m)).includes(employeeId)) {
                                    setFormData(prev => ({
                                      ...prev,
                                      projectMembers: [...prev.projectMembers, employeeId]
                                    }))
                                  }
                                } else {
                                  if (isManager) return
                                  setFormData(prev => ({
                                    ...prev,
                                    projectMembers: prev.projectMembers.filter(id => parseInt(id) !== employeeId)
                                  }))
                                }
                              }}
                              className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{employee.name || employee.email}</p>
                              {isManager && <p className="text-xs text-primary-accent">Manager</p>}
                            </div>
                          </label>
                        )
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6"></div>

          {/* Section 4: Details & Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <IoDocumentText className="text-primary-accent" />
              Additional Details
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Summary</label>
                <div className="h-40">
                  <RichTextEditor
                    value={formData.projectSummary}
                    onChange={(content) => setFormData({ ...formData, projectSummary: content })}
                    placeholder="Enter project summary..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority / Label</label>
                  <select
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent outline-none"
                  >
                    <option value="">-- None --</option>
                    {availableLabels.map(label => (
                      <option key={label.id} value={label.name}>{label.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent outline-none"
                  >
                    <option value="in progress">In Progress</option>
                    <option value="on hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
              }}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="px-8 py-2 flex items-center gap-2 shadow-lg shadow-primary-accent/20"
            >
              <IoCheckmarkCircle size={20} />
              {isEditModalOpen ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Excel Export Modal */}
      <Modal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        title="Export to Excel"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary-text">Export project data to Excel format</p>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent" defaultChecked />
              <span className="text-sm text-primary-text">Export List View</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent" />
              <span className="text-sm text-primary-text">Export with Details</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsExcelModalOpen(false)}
              className="flex-1"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                alert('Excel export started!')
                setIsExcelModalOpen(false)
              }}
              className="flex-1"
              size="sm"
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>

      {/* Print Modal */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Print Projects"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary-text">Print project list</p>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent" defaultChecked />
              <span className="text-sm text-primary-text">Print List View</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent" />
              <span className="text-sm text-primary-text">Print with Details</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsPrintModalOpen(false)}
              className="flex-1"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                window.print()
                setIsPrintModalOpen(false)
              }}
              className="flex-1"
              size="sm"
            >
              Print
            </Button>
          </div>
        </div>
      </Modal>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Advanced Filters"
        size="md"
      >
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="All Projects">All Projects</option>
              {filterOptions.statuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Priority/Label</label>
            <select
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="">All Priorities</option>
              {filterOptions.priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Client</label>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="">All Clients</option>
              {filterOptions.clients.map(client => (
                <option key={client.id} value={client.id}>{client.company_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Assigned User</label>
            <select
              value={assignedUserFilter}
              onChange={(e) => setAssignedUserFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="">All Users</option>
              {filterOptions.assigned_users.map(user => (
                <option key={user.id} value={user.id}>{user.name || user.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Project Type</label>
            <select
              value={projectTypeFilter}
              onChange={(e) => setProjectTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="">All Types</option>
              {filterOptions.categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Progress Range</label>
            <select
              value={progressFilter}
              onChange={(e) => setProgressFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="">All Progress</option>
              <option value="0% - 20%">0% - 20%</option>
              <option value="21% - 50%">21% - 50%</option>
              <option value="51% - 80%">51% - 80%</option>
              <option value="81% - 100%">81% - 100%</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Start Date From</label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">End Date To</label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter('All Projects')
                setProgressFilter('')
                setLabelFilter('')
                setClientFilter('')
                setAssignedUserFilter('')
                setProjectTypeFilter('')
                setStartDateFilter('')
                setEndDateFilter('')
                setIsFilterModalOpen(false)
              }}
              className="flex-1"
              size="sm"
            >
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsFilterModalOpen(false)}
              className="flex-1"
              size="sm"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Project Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedProject(null)
        }}
        title="Project Details"
        width="700px"
      >
        {selectedProject && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-text">Project Code</label>
                <p className="text-primary-text mt-1 text-base font-semibold">{selectedProject.code || selectedProject.short_code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Status</label>
                <div className="mt-1">
                  <Badge variant={selectedProject.status === 'completed' ? 'success' : selectedProject.status === 'on hold' ? 'warning' : selectedProject.status === 'cancelled' ? 'danger' : 'info'}>
                    {selectedProject.status || 'in progress'}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-secondary-text">Project Name</label>
              <p className="text-primary-text mt-1 text-base">{selectedProject.name || selectedProject.project_name}</p>
            </div>

            {selectedProject.description && (
              <div>
                <label className="text-sm font-medium text-secondary-text">Description</label>
                <p className="text-primary-text mt-1 text-base">{selectedProject.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-text">Company</label>
                <p className="text-primary-text mt-1 text-base">{selectedProject.company_name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Department</label>
                <p className="text-primary-text mt-1 text-base">{selectedProject.department_name || '-'}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-secondary-text">Client</label>
              <p className="text-primary-text mt-1 text-base">{selectedProject.client?.name || selectedProject.client_name || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-secondary-text">Employee</label>
              <p className="text-primary-text mt-1 text-base">{selectedProject.project_manager_name || '-'}</p>
            </div>

            {selectedProject.budget && (
              <div>
                <label className="text-sm font-medium text-secondary-text">Budget</label>
                <p className="text-primary-text mt-1 text-base font-semibold">${parseFloat(selectedProject.budget).toLocaleString()}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-secondary-text">Progress</label>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-accent h-2 rounded-full"
                    style={{ width: `${selectedProject.progress || 0}%` }}
                  />
                </div>
                <p className="text-sm text-secondary-text mt-1">{selectedProject.progress || 0}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-text">Start Date</label>
                <p className="text-primary-text mt-1 text-base">{formatDate(selectedProject.startDate || selectedProject.start_date)}</p>
              </div>
              {selectedProject.deadline && (
                <div>
                  <label className="text-sm font-medium text-secondary-text">Deadline</label>
                  <p className={`mt-1 text-base ${isDeadlineOverdue(selectedProject.deadline) ? 'text-red-600' : 'text-primary-text'}`}>
                    {formatDate(selectedProject.deadline)}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-secondary-text">Team Members</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedProject.members && selectedProject.members.length > 0 ? (
                  selectedProject.members.map((member) => (
                    <Badge key={member.id || member.user_id} variant="default" className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-primary-accent/20 flex items-center justify-center text-xs font-semibold text-primary-accent">
                        {member.avatar || (member.name ? member.name.substring(0, 2).toUpperCase() : 'U')}
                      </div>
                      {member.name || member.email}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-secondary-text">No team members assigned</p>
                )}
              </div>
            </div>

            {selectedProject.project_summary && (
              <div>
                <label className="text-sm font-medium text-secondary-text">Project Summary</label>
                <p className="text-primary-text mt-1 text-base whitespace-pre-wrap">{selectedProject.project_summary}</p>
              </div>
            )}

            {selectedProject.notes && (
              <div>
                <label className="text-sm font-medium text-secondary-text">Notes</label>
                <p className="text-primary-text mt-1 text-base whitespace-pre-wrap">{selectedProject.notes}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(selectedProject)
                }}
                className="flex-1"
              >
                Edit Project
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedProject(null)
                }}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Projects"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <IoDownload className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm text-secondary-text mb-1">Drag & drop CSV file here or click to browse</p>
            <p className="text-xs text-secondary-text">Supports: CSV, XLS, XLSX</p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsImportModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                alert('Import started!')
                setIsImportModalOpen(false)
              }}
              className="flex-1"
            >
              Import
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manage Labels Modal */}
      <Modal
        isOpen={isManageLabelsModalOpen}
        onClose={() => {
          setIsManageLabelsModalOpen(false)
          setNewLabel('')
        }}
        title="Manage labels"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Color selection row */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {PREDEFINED_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setNewLabelColor(color)}
                  className={`w-5 h-5 rounded transition-all transform hover:scale-110 ${newLabelColor === color ? 'ring-2 ring-offset-2 ring-primary-accent scale-110 shadow-sm' : ''}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <div className="relative">
                <input
                  type="color"
                  value={newLabelColor}
                  onChange={(e) => setNewLabelColor(e.target.value)}
                  className="w-8 h-5 rounded cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                  title="Custom color"
                />
              </div>
            </div>

            {/* Input and Save row */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Label"
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddLabel()
                }}
              />
              <Button
                onClick={handleAddLabel}
                className="flex items-center gap-2 px-4 shadow-sm"
              >
                <IoCheckmarkCircle size={18} />
                Save
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {availableLabels.length === 0 ? (
                <p className="text-sm text-secondary-text italic py-2">No labels available</p>
              ) : (
                availableLabels.map((label) => (
                  <div
                    key={label.id}
                    className="group relative flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-semibold shadow-sm transition-all hover:pr-8"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                    <button
                      onClick={() => handleDeleteLabel(label.id)}
                      className="absolute right-1 p-1 text-white/80 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Label"
                    >
                      <IoClose size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsManageLabelsModalOpen(false)
                setNewLabel('')
              }}
              className="flex items-center gap-2 text-gray-600 border-gray-200 hover:bg-gray-50"
            >
              <IoClose size={18} />
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Projects


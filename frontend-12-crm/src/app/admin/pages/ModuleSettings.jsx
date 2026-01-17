/**
 * Module Settings Page
 * Controls sidebar menu visibility for Client and Employee dashboards
 * Route: /app/admin/settings/modules
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useModules } from '../../../context/ModulesContext'
import { usePermissions } from '../../../context/PermissionsContext'
import { useTheme } from '../../../context/ThemeContext'
import Modal from '../../../components/ui/Modal'
import { 
  IoCheckmarkCircle, 
  IoCloseCircle, 
  IoRefresh,
  IoSave,
  IoPeople,
  IoPerson,
  IoHome,
  IoFolderOpen,
  IoDocumentText,
  IoStorefront,
  IoFileTray,
  IoWallet,
  IoReceipt,
  IoCash,
  IoCard,
  IoReader,
  IoTicket,
  IoChatbubbles,
  IoCheckbox,
  IoStopwatch,
  IoCalendar,
  IoTime,
  IoSettings,
  IoLockClosed,
  IoEye,
  IoCreate,
  IoTrash,
  IoAdd,
  IoChevronDown,
  IoChevronUp,
} from 'react-icons/io5'
import { toast } from 'react-hot-toast'

// Menu configuration with labels and icons
const CLIENT_MENU_CONFIG = [
  { key: 'dashboard', label: 'Dashboard', icon: IoHome, description: 'Main dashboard overview' },
  { key: 'projects', label: 'Projects', icon: IoFolderOpen, description: 'View assigned projects' },
  { key: 'proposals', label: 'Proposals', icon: IoDocumentText, description: 'View proposals' },
  { key: 'store', label: 'Store', icon: IoStorefront, description: 'Browse store items' },
  { key: 'files', label: 'Files', icon: IoFileTray, description: 'Access shared files' },
  { key: 'billing', label: 'Billing', icon: IoWallet, description: 'Billing parent menu' },
  { key: 'invoices', label: 'Invoices', icon: IoReceipt, description: 'View invoices' },
  { key: 'payments', label: 'Payments', icon: IoCash, description: 'Payment history' },
  { key: 'subscriptions', label: 'Subscriptions', icon: IoCard, description: 'Manage subscriptions' },
  { key: 'orders', label: 'Orders', icon: IoCard, description: 'View orders' },
  { key: 'notes', label: 'Notes', icon: IoReader, description: 'Personal notes' },
  { key: 'contracts', label: 'Contracts', icon: IoDocumentText, description: 'View contracts' },
  { key: 'tickets', label: 'Tickets', icon: IoTicket, description: 'Support tickets' },
  { key: 'messages', label: 'Messages', icon: IoChatbubbles, description: 'Chat messages' },
]

const EMPLOYEE_MENU_CONFIG = [
  { key: 'dashboard', label: 'Dashboard', icon: IoHome, description: 'Main dashboard overview' },
  { key: 'myTasks', label: 'My Tasks', icon: IoCheckbox, description: 'Assigned tasks' },
  { key: 'myProjects', label: 'My Projects', icon: IoFolderOpen, description: 'Assigned projects' },
  { key: 'timeTracking', label: 'Time Tracking', icon: IoStopwatch, description: 'Log work hours' },
  { key: 'events', label: 'Events', icon: IoCalendar, description: 'Calendar events' },
  { key: 'myProfile', label: 'My Profile', icon: IoPerson, description: 'Personal profile' },
  { key: 'documents', label: 'My Documents', icon: IoDocumentText, description: 'Personal documents' },
  { key: 'attendance', label: 'Attendance', icon: IoTime, description: 'Attendance records' },
  { key: 'leaveRequests', label: 'Leave Requests', icon: IoTime, description: 'Request time off' },
  { key: 'messages', label: 'Messages', icon: IoChatbubbles, description: 'Chat messages' },
  { key: 'tickets', label: 'Tickets', icon: IoTicket, description: 'Support tickets' },
]

const ModuleSettings = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme.mode === 'dark'
  
  const {
    clientMenus,
    employeeMenus,
    loading,
    updateModuleSettings,
    resetToDefaults,
  } = useModules()
  
  // Get refreshPermissions from permissions context
  const { refreshPermissions } = usePermissions()

  // Local state for form
  const [localClientMenus, setLocalClientMenus] = useState(clientMenus)
  const [localEmployeeMenus, setLocalEmployeeMenus] = useState(employeeMenus)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Expanded sections state
  const [expandedSection, setExpandedSection] = useState(null) // 'employee' or 'client'
  
  // Module permissions state - structure: { [moduleKey]: { can_view, can_add, can_edit, can_delete } }
  const [modulePermissions, setModulePermissions] = useState({})

  // Sync local state with context when context updates
  useEffect(() => {
    setLocalClientMenus(clientMenus)
    setLocalEmployeeMenus(employeeMenus)
  }, [clientMenus, employeeMenus])
  
  // Load module permissions from backend on mount
  useEffect(() => {
    const loadModulePermissions = async () => {
      try {
        const companyId = localStorage.getItem('companyId') || 1
        const token = localStorage.getItem('token')
        const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const response = await fetch(
          `${baseUrl}/api/v1/module-settings?company_id=${companyId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data?.module_permissions) {
            setModulePermissions(data.data.module_permissions || {})
          }
        }
      } catch (error) {
        console.error('Error loading module permissions:', error)
      }
    }
    
    if (!loading) {
      loadModulePermissions()
    }
  }, [loading])

  // Check for changes
  useEffect(() => {
    const clientChanged = JSON.stringify(localClientMenus) !== JSON.stringify(clientMenus)
    const employeeChanged = JSON.stringify(localEmployeeMenus) !== JSON.stringify(employeeMenus)
    // Check if any permissions have been set
    const permissionsChanged = Object.keys(modulePermissions).length > 0
    setHasChanges(clientChanged || employeeChanged || permissionsChanged)
  }, [localClientMenus, localEmployeeMenus, clientMenus, employeeMenus, modulePermissions])

  /**
   * Map module keys to role permission module names
   */
  const getModulePermissionName = (moduleKey, type) => {
    const moduleMap = {
      'dashboard': 'dashboard',
      'projects': 'projects',
      'proposals': 'proposals',
      'store': 'products',
      'files': 'documents',
      'billing': 'invoices',
      'invoices': 'invoices',
      'payments': 'payments',
      'subscriptions': 'subscriptions',
      'orders': 'orders',
      'notes': 'notes',
      'contracts': 'contracts',
      'tickets': 'tickets',
      'messages': 'messages',
      'myTasks': 'tasks',
      'myProjects': 'projects',
      'timeTracking': 'time_tracking',
      'events': 'events',
      'myProfile': 'employees',
      'documents': 'documents',
      'attendance': 'attendance',
      'leaveRequests': 'leaves',
    }
    return moduleMap[moduleKey] || moduleKey
  }

  /**
   * Module-specific action descriptions
   */
  const getModuleActions = (moduleKey, type) => {
    const actions = {
      // Employee Modules
      'myTasks': {
        can_view: ['View assigned tasks', 'See task details', 'View task comments', 'View attachments'],
        can_add: ['Create new tasks', 'Add subtasks', 'Add comments', 'Upload files'],
        can_edit: ['Update task status', 'Change priority', 'Edit task details', 'Update due date'],
        can_delete: ['Delete tasks', 'Remove comments', 'Delete attachments']
      },
      'myProjects': {
        can_view: ['View assigned projects', 'See project details', 'View project timeline', 'View project files'],
        can_add: ['Create new projects', 'Add project notes', 'Upload project files', 'Add milestones'],
        can_edit: ['Update project status', 'Edit project details', 'Modify milestones', 'Update progress'],
        can_delete: ['Delete projects', 'Remove project files', 'Delete milestones']
      },
      'timeTracking': {
        can_view: ['View time logs', 'See time reports', 'View time entries', 'Check time summary'],
        can_add: ['Log work hours', 'Create time entries', 'Start timer', 'Add time notes'],
        can_edit: ['Edit time entries', 'Update time logs', 'Modify time notes', 'Adjust time duration'],
        can_delete: ['Delete time entries', 'Remove time logs']
      },
      'events': {
        can_view: ['View calendar events', 'See event details', 'View event attendees', 'Check event schedule'],
        can_add: ['Create events', 'Add event attendees', 'Schedule meetings', 'Create reminders'],
        can_edit: ['Update event details', 'Modify event time', 'Change attendees', 'Edit event description'],
        can_delete: ['Delete events', 'Cancel meetings', 'Remove reminders']
      },
      'attendance': {
        can_view: ['View attendance records', 'See attendance history', 'Check attendance status', 'View reports'],
        can_add: ['Mark attendance', 'Check in', 'Check out', 'Add attendance notes'],
        can_edit: ['Update attendance', 'Modify check-in time', 'Adjust attendance records'],
        can_delete: ['Delete attendance records', 'Remove attendance entries']
      },
      'leaveRequests': {
        can_view: ['View leave requests', 'See leave balance', 'Check leave history', 'View leave calendar'],
        can_add: ['Create leave request', 'Apply for leave', 'Submit leave application'],
        can_edit: ['Update leave request', 'Modify leave dates', 'Edit leave reason'],
        can_delete: ['Cancel leave request', 'Delete leave application']
      },
      'messages': {
        can_view: ['View messages', 'Read conversations', 'See message history', 'View attachments'],
        can_add: ['Send messages', 'Start conversations', 'Reply to messages', 'Share files'],
        can_edit: ['Edit messages', 'Update message content'],
        can_delete: ['Delete messages', 'Remove conversations', 'Delete attachments']
      },
      'tickets': {
        can_view: ['View support tickets', 'See ticket details', 'Check ticket status', 'View ticket history'],
        can_add: ['Create tickets', 'Submit support requests', 'Add ticket comments', 'Attach files'],
        can_edit: ['Update ticket status', 'Edit ticket details', 'Modify ticket priority', 'Add updates'],
        can_delete: ['Close tickets', 'Delete tickets', 'Remove ticket comments']
      },
      'documents': {
        can_view: ['View documents', 'See document list', 'Preview documents', 'Download documents'],
        can_add: ['Upload documents', 'Create folders', 'Add new files', 'Share documents'],
        can_edit: ['Rename documents', 'Move documents', 'Update document details', 'Edit folder structure'],
        can_delete: ['Delete documents', 'Remove files', 'Delete folders']
      },
      // Client Modules
      'projects': {
        can_view: ['View assigned projects', 'See project details', 'View project files', 'Check project status'],
        can_add: ['Add project comments', 'Upload files to projects', 'Create project notes'],
        can_edit: ['Update project comments', 'Edit project notes'],
        can_delete: ['Delete own comments', 'Remove own files']
      },
      'proposals': {
        can_view: ['View proposals', 'See proposal details', 'Download proposal PDF', 'View proposal status'],
        can_add: ['Request proposals', 'Add comments to proposals'],
        can_edit: ['Update proposal comments'],
        can_delete: ['Delete own comments']
      },
      'invoices': {
        can_view: ['View invoices', 'See invoice details', 'Download invoice PDF', 'Check payment status'],
        can_add: ['Add invoice comments', 'Request invoice'],
        can_edit: ['Update invoice comments'],
        can_delete: ['Delete own comments']
      },
      'payments': {
        can_view: ['View payment history', 'See payment details', 'Check payment status', 'View receipts'],
        can_add: ['Make payments', 'Record payment', 'Add payment notes'],
        can_edit: ['Update payment notes'],
        can_delete: ['Delete payment notes']
      },
      'contracts': {
        can_view: ['View contracts', 'See contract details', 'Download contract PDF', 'Check contract status'],
        can_add: ['Add contract comments', 'Request contract'],
        can_edit: ['Update contract comments'],
        can_delete: ['Delete own comments']
      },
      'store': {
        can_view: ['Browse store items', 'View product details', 'See product prices', 'Check availability'],
        can_add: ['Add items to cart', 'Create orders', 'Add to wishlist'],
        can_edit: ['Update cart items', 'Modify order'],
        can_delete: ['Remove cart items', 'Cancel orders']
      },
      'files': {
        can_view: ['View shared files', 'See file list', 'Download files', 'Preview files'],
        can_add: ['Upload files', 'Share files', 'Create folders'],
        can_edit: ['Rename files', 'Move files', 'Update file details'],
        can_delete: ['Delete files', 'Remove folders']
      },
      'dashboard': {
        can_view: ['View dashboard', 'See statistics', 'View charts', 'Check overview'],
        can_add: [],
        can_edit: [],
        can_delete: []
      }
    }
    
    return actions[moduleKey] || {
      can_view: ['View module data'],
      can_add: ['Add new records'],
      can_edit: ['Edit existing records'],
      can_delete: ['Delete records']
    }
  }

  /**
   * Toggle section expansion
   */
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }
  
  /**
   * Initialize permissions for a module if not exists
   * By default, gives full access (all permissions true)
   * But only if user is actively setting permissions
   */
  const initializeModulePermissions = (moduleKey) => {
    if (!modulePermissions[moduleKey]) {
      setModulePermissions(prev => ({
        ...prev,
        [moduleKey]: {
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: true
        }
      }))
    }
  }
  
  /**
   * Handle permission change
   */
  const handlePermissionChange = (moduleKey, permissionType, value) => {
    initializeModulePermissions(moduleKey)
    setModulePermissions(prev => {
      const updated = {
        ...prev,
        [moduleKey]: {
          ...prev[moduleKey],
          [permissionType]: value
        }
      }
      console.log(`Permission changed: ${moduleKey}.${permissionType} = ${value}`, updated[moduleKey])
      return updated
    })
  }
  
  /**
   * Handle full access toggle
   */
  const handleFullAccessToggle = (moduleKey, value) => {
    initializeModulePermissions(moduleKey)
    setModulePermissions(prev => ({
      ...prev,
      [moduleKey]: {
        can_view: value,
        can_add: value,
        can_edit: value,
        can_delete: value
      }
    }))
  }

  // Removed toggle functions - modules are always enabled, controlled by permissions only

  /**
   * Save all changes including module permissions
   * By default, gives full permissions to all enabled modules
   */
  const handleSave = async () => {
    setSaving(true)
    try {
      // Filter permissions - only include enabled modules
      // If no permissions set, give full access by default
      const filteredPermissions = {}
      
      // Combine all menu configs
      const allMenus = [...EMPLOYEE_MENU_CONFIG, ...CLIENT_MENU_CONFIG]
      
      // Save permissions for all modules
      // Only save permissions that have been explicitly set (including false values)
      Object.keys(modulePermissions).forEach(moduleKey => {
        // Save all permissions as-is, including false values
        filteredPermissions[moduleKey] = modulePermissions[moduleKey]
      })
      
      // For modules that don't have permissions set yet, give full access by default
      // This ensures all modules are accessible unless explicitly restricted
      allMenus.forEach(menu => {
        if (!filteredPermissions[menu.key]) {
          filteredPermissions[menu.key] = {
            can_view: true,
            can_add: true,
            can_edit: true,
            can_delete: true
          }
        }
      })
      
      // Ensure all menus are enabled
      const allEnabledClientMenus = {}
      CLIENT_MENU_CONFIG.forEach(menu => {
        allEnabledClientMenus[menu.key] = true
      })
      
      const allEnabledEmployeeMenus = {}
      EMPLOYEE_MENU_CONFIG.forEach(menu => {
        allEnabledEmployeeMenus[menu.key] = true
      })
      
      const success = await updateModuleSettings({
        client_menus: allEnabledClientMenus,
        employee_menus: allEnabledEmployeeMenus,
        module_permissions: filteredPermissions,
      })

      if (success) {
        toast.success('Module settings and permissions saved successfully!')
        setHasChanges(false)
        // Update local permissions state
        setModulePermissions(filteredPermissions)
        // Debug log
        console.log('Saved permissions:', filteredPermissions)
        // Refresh permissions context to update sidebar and components
        refreshPermissions()
      } else {
        toast.error('Failed to save module settings')
      }
    } catch (error) {
      toast.error('Error saving module settings')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  /**
   * Reset to defaults
   */
  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all module settings to defaults?')) {
      return
    }

    setSaving(true)
    try {
      const success = await resetToDefaults()
      if (success) {
        // Clear all permissions on reset
        setModulePermissions({})
        toast.success('Module settings reset to defaults!')
      } else {
        toast.error('Failed to reset module settings')
      }
    } catch (error) {
      toast.error('Error resetting module settings')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  // Removed enable/disable functions - modules are always enabled, controlled by permissions only

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-text flex items-center gap-2">
            <IoSettings className="text-primary-accent" />
            Module Settings
          </h1>
          <p className="text-secondary-text mt-1">
            Control which menus are visible in Client and Employee dashboards
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
            style={{
              backgroundColor: isDark ? '#374151' : '#ffffff',
              borderColor: isDark ? '#4B5563' : '#D1D5DB',
              color: isDark ? '#E5E7EB' : '#374151',
            }}
          >
            <IoRefresh size={18} />
            <span className="hidden sm:inline">Reset to Defaults</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
            style={{
              backgroundColor: hasChanges ? 'var(--color-primary-accent, #217E45)' : '#9CA3AF',
            }}
          >
            <IoSave size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Change indicator */}
      {hasChanges && (
        <div 
          className="p-3 rounded-lg flex items-center gap-2 text-sm"
          style={{
            backgroundColor: isDark ? 'rgba(251, 191, 36, 0.1)' : '#FEF3C7',
            color: isDark ? '#FCD34D' : '#92400E',
          }}
        >
          <IoCheckmarkCircle size={18} />
          You have unsaved changes. Click "Save Changes" to apply.
        </div>
      )}

      {/* Single Column Layout - Expandable Sections */}
      <div className="space-y-6">
        
        {/* EMPLOYEE MODULES SECTION - SHOWN FIRST */}
        <div 
          className="rounded-xl border overflow-hidden cursor-pointer"
          style={{
            backgroundColor: isDark ? '#1F2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#E5E7EB',
          }}
        >
          {/* Section Header - Clickable */}
          <div 
            className="p-4 border-b flex items-center justify-between hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('employee')}
            style={{
              backgroundColor: isDark ? '#111827' : expandedSection === 'employee' ? '#F3F4F6' : '#F9FAFB',
              borderColor: isDark ? '#374151' : '#E5E7EB',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#3B82F6' }}
              >
                <IoPerson className="text-white" size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-primary-text">Employee Modules</h2>
                <p className="text-xs text-secondary-text">
                  {Object.values(localEmployeeMenus).filter(Boolean).length} of {EMPLOYEE_MENU_CONFIG.length} enabled
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {expandedSection === 'employee' ? (
                <IoChevronUp size={20} className="text-gray-500" />
              ) : (
                <IoChevronDown size={20} className="text-gray-500" />
              )}
            </div>
          </div>
          
          {/* Expanded Content */}
          {expandedSection === 'employee' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-700">Manage Employee Module Permissions</h3>
              </div>
              
              {/* Employee Menu Items with Permissions */}
              <div className="space-y-3">
                {EMPLOYEE_MENU_CONFIG.map((menu) => {
                  const Icon = menu.icon
                  // Default: Full access if not set
                  const permissions = modulePermissions[menu.key] || {
                    can_view: true,
                    can_add: true,
                    can_edit: true,
                    can_delete: true
                  }
                  const hasFullAccess = permissions.can_view && permissions.can_add && permissions.can_edit && permissions.can_delete
                  
                  return (
                    <div
                      key={menu.key}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor: isDark ? '#374151' : '#E5E7EB',
                        backgroundColor: isDark ? '#1F2937' : '#ffffff',
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#DCFCE7',
                            }}
                          >
                            <Icon 
                              size={16} 
                              style={{
                                color: '#22C55E',
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-primary-text text-sm">{menu.label}</p>
                            <p className="text-xs text-secondary-text">{menu.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Permissions Row */}
                      <div className="ml-11 mt-3 pt-3 border-t" style={{ borderColor: isDark ? '#374151' : '#E5E7EB' }}>
                        <div className="grid grid-cols-5 gap-3">
                          {/* Full Access */}
                          <label className="flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: hasFullAccess ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB') }}>
                            <input
                              type="checkbox"
                              checked={hasFullAccess}
                              onChange={(e) => handleFullAccessToggle(menu.key, e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-xs font-medium text-center">Full Access</span>
                          </label>
                          
                          {/* View */}
                          <label className="flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: permissions.can_view ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB') }}>
                            <input
                              type="checkbox"
                              checked={permissions.can_view}
                              onChange={(e) => handlePermissionChange(menu.key, 'can_view', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-xs font-medium text-center">View</span>
                          </label>
                          
                          {/* Add */}
                          <label className="flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-green-50 transition-colors" style={{ borderColor: permissions.can_add ? '#22C55E' : (isDark ? '#374151' : '#E5E7EB') }}>
                            <input
                              type="checkbox"
                              checked={permissions.can_add}
                              onChange={(e) => handlePermissionChange(menu.key, 'can_add', e.target.checked)}
                              className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                            />
                            <span className="text-xs font-medium text-center">Add</span>
                          </label>
                          
                          {/* Edit */}
                          <label className="flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-yellow-50 transition-colors" style={{ borderColor: permissions.can_edit ? '#EAB308' : (isDark ? '#374151' : '#E5E7EB') }}>
                            <input
                              type="checkbox"
                              checked={permissions.can_edit}
                              onChange={(e) => handlePermissionChange(menu.key, 'can_edit', e.target.checked)}
                              className="w-4 h-4 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
                            />
                            <span className="text-xs font-medium text-center">Edit</span>
                          </label>
                          
                          {/* Delete */}
                          <label className="flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-red-50 transition-colors" style={{ borderColor: permissions.can_delete ? '#EF4444' : (isDark ? '#374151' : '#E5E7EB') }}>
                            <input
                              type="checkbox"
                              checked={permissions.can_delete}
                              onChange={(e) => handlePermissionChange(menu.key, 'can_delete', e.target.checked)}
                              className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-xs font-medium text-center">Delete</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* CLIENT MODULES SECTION */}
        <div 
          className="rounded-xl border overflow-hidden cursor-pointer"
          style={{
            backgroundColor: isDark ? '#1F2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#E5E7EB',
          }}
        >
          {/* Section Header - Clickable */}
          <div 
            className="p-4 border-b flex items-center justify-between hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('client')}
            style={{
              backgroundColor: isDark ? '#111827' : expandedSection === 'client' ? '#F3F4F6' : '#F9FAFB',
              borderColor: isDark ? '#374151' : '#E5E7EB',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary-accent, #217E45)' }}
              >
                <IoPeople className="text-white" size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-primary-text">Client Modules</h2>
                <p className="text-xs text-secondary-text">
                  {Object.values(localClientMenus).filter(Boolean).length} of {CLIENT_MENU_CONFIG.length} enabled
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {expandedSection === 'client' ? (
                <IoChevronUp size={20} className="text-gray-500" />
              ) : (
                <IoChevronDown size={20} className="text-gray-500" />
              )}
            </div>
          </div>
          
          {/* Expanded Content */}
          {expandedSection === 'client' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-700">Manage Client Module Permissions</h3>
              </div>
              
              {/* Client Menu Items with Permissions */}
              <div className="space-y-3">
                {CLIENT_MENU_CONFIG.map((menu) => {
                  const Icon = menu.icon
                  // Default: Full access if not set
                  const permissions = modulePermissions[menu.key] || {
                    can_view: true,
                    can_add: true,
                    can_edit: true,
                    can_delete: true
                  }
                  const hasFullAccess = permissions.can_view && permissions.can_add && permissions.can_edit && permissions.can_delete
                  
                  return (
                    <div
                      key={menu.key}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor: isDark ? '#374151' : '#E5E7EB',
                        backgroundColor: isDark ? '#1F2937' : '#ffffff',
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: permissions.can_view 
                                ? (isDark ? 'rgba(34, 197, 94, 0.1)' : '#DCFCE7')
                                : (isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2'),
                            }}
                          >
                            <Icon 
                              size={16} 
                              style={{
                                color: permissions.can_view ? '#22C55E' : '#EF4444',
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-primary-text text-sm">{menu.label}</p>
                            <p className="text-xs text-secondary-text">{menu.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Permissions Row */}
                      <div className="ml-11 mt-3 pt-3 border-t" style={{ borderColor: isDark ? '#374151' : '#E5E7EB' }}>
                        <div className="grid grid-cols-5 gap-3">
                          {/* Full Access */}
                          <label className="flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: hasFullAccess ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB') }}>
                            <input
                              type="checkbox"
                              checked={hasFullAccess}
                              onChange={(e) => handleFullAccessToggle(menu.key, e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-xs font-medium text-center">Full Access</span>
                          </label>
                          
                          {/* View */}
                          <label className="flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: permissions.can_view ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB') }}>
                            <input
                              type="checkbox"
                              checked={permissions.can_view}
                              onChange={(e) => handlePermissionChange(menu.key, 'can_view', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-xs font-medium text-center">View</span>
                          </label>
                          
                          {/* Add */}
                          <label className="flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-green-50 transition-colors" style={{ borderColor: permissions.can_add ? '#22C55E' : (isDark ? '#374151' : '#E5E7EB') }}>
                            <input
                              type="checkbox"
                              checked={permissions.can_add}
                              onChange={(e) => handlePermissionChange(menu.key, 'can_add', e.target.checked)}
                              className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                            />
                            <span className="text-xs font-medium text-center">Add</span>
                          </label>
                          
                          {/* Edit */}
                          <label className="flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-yellow-50 transition-colors" style={{ borderColor: permissions.can_edit ? '#EAB308' : (isDark ? '#374151' : '#E5E7EB') }}>
                            <input
                              type="checkbox"
                              checked={permissions.can_edit}
                              onChange={(e) => handlePermissionChange(menu.key, 'can_edit', e.target.checked)}
                              className="w-4 h-4 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
                            />
                            <span className="text-xs font-medium text-center">Edit</span>
                          </label>
                          
                          {/* Delete */}
                          <label className="flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-red-50 transition-colors" style={{ borderColor: permissions.can_delete ? '#EF4444' : (isDark ? '#374151' : '#E5E7EB') }}>
                            <input
                              type="checkbox"
                              checked={permissions.can_delete}
                              onChange={(e) => handlePermissionChange(menu.key, 'can_delete', e.target.checked)}
                              className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                            />
                            <span className="text-xs font-medium text-center">Delete</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div 
        className="p-4 rounded-lg text-sm"
        style={{
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
          color: isDark ? '#93C5FD' : '#1E40AF',
        }}
      >
        <p className="font-medium mb-1">💡 How it works:</p>
        <ul className="list-disc list-inside space-y-1 text-xs opacity-80">
          <li>Toggle menus ON/OFF to control visibility in respective dashboards</li>
          <li>Click on module name to manage detailed permissions (View, Add, Edit, Delete)</li>
          <li>Changes apply instantly after saving - no page refresh needed</li>
          <li>Client sees only their enabled menus in the Client Dashboard</li>
          <li>Employees see only their enabled menus in the Employee Dashboard</li>
          <li>Dashboard menu is recommended to always be enabled</li>
        </ul>
      </div>

    </div>
  )
}

export default ModuleSettings


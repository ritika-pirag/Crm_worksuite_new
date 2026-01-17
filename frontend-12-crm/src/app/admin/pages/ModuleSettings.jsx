/**
 * Module Settings Page
 * Controls sidebar menu visibility for Client and Employee dashboards
 * Route: /app/admin/settings/modules
 */

import { useState, useEffect } from 'react'
import { useModules } from '../../../context/ModulesContext'
import { useTheme } from '../../../context/ThemeContext'
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
  const { theme } = useTheme()
  const isDark = theme.mode === 'dark'
  
  const {
    clientMenus,
    employeeMenus,
    loading,
    updateModuleSettings,
    resetToDefaults,
  } = useModules()

  // Local state for form
  const [localClientMenus, setLocalClientMenus] = useState(clientMenus)
  const [localEmployeeMenus, setLocalEmployeeMenus] = useState(employeeMenus)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Sync local state with context when context updates
  useEffect(() => {
    setLocalClientMenus(clientMenus)
    setLocalEmployeeMenus(employeeMenus)
  }, [clientMenus, employeeMenus])

  // Check for changes
  useEffect(() => {
    const clientChanged = JSON.stringify(localClientMenus) !== JSON.stringify(clientMenus)
    const employeeChanged = JSON.stringify(localEmployeeMenus) !== JSON.stringify(employeeMenus)
    setHasChanges(clientChanged || employeeChanged)
  }, [localClientMenus, localEmployeeMenus, clientMenus, employeeMenus])

  /**
   * Toggle a client menu
   */
  const handleClientMenuToggle = (key) => {
    setLocalClientMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  /**
   * Toggle an employee menu
   */
  const handleEmployeeMenuToggle = (key) => {
    setLocalEmployeeMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  /**
   * Save all changes
   */
  const handleSave = async () => {
    setSaving(true)
    try {
      const success = await updateModuleSettings({
        client_menus: localClientMenus,
        employee_menus: localEmployeeMenus,
      })

      if (success) {
        toast.success('Module settings saved successfully!')
        setHasChanges(false)
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

  /**
   * Enable all menus in a section
   */
  const enableAllClient = () => {
    const allEnabled = {}
    CLIENT_MENU_CONFIG.forEach(item => {
      allEnabled[item.key] = true
    })
    setLocalClientMenus(allEnabled)
  }

  const enableAllEmployee = () => {
    const allEnabled = {}
    EMPLOYEE_MENU_CONFIG.forEach(item => {
      allEnabled[item.key] = true
    })
    setLocalEmployeeMenus(allEnabled)
  }

  /**
   * Disable all menus in a section (except dashboard)
   */
  const disableAllClient = () => {
    const allDisabled = {}
    CLIENT_MENU_CONFIG.forEach(item => {
      allDisabled[item.key] = item.key === 'dashboard' // Keep dashboard enabled
    })
    setLocalClientMenus(allDisabled)
  }

  const disableAllEmployee = () => {
    const allDisabled = {}
    EMPLOYEE_MENU_CONFIG.forEach(item => {
      allDisabled[item.key] = item.key === 'dashboard' // Keep dashboard enabled
    })
    setLocalEmployeeMenus(allDisabled)
  }

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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CLIENT MODULES SECTION */}
        <div 
          className="rounded-xl border overflow-hidden"
          style={{
            backgroundColor: isDark ? '#1F2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#E5E7EB',
          }}
        >
          {/* Section Header */}
          <div 
            className="p-4 border-b flex items-center justify-between"
            style={{
              backgroundColor: isDark ? '#111827' : '#F9FAFB',
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
              <button
                onClick={enableAllClient}
                className="text-xs px-2 py-1 rounded hover:bg-green-100 text-green-600 transition-colors"
              >
                Enable All
              </button>
              <button
                onClick={disableAllClient}
                className="text-xs px-2 py-1 rounded hover:bg-red-100 text-red-600 transition-colors"
              >
                Disable All
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="divide-y" style={{ borderColor: isDark ? '#374151' : '#E5E7EB' }}>
            {CLIENT_MENU_CONFIG.map((menu) => {
              const Icon = menu.icon
              const isEnabled = localClientMenus[menu.key] !== false
              
              return (
                <div 
                  key={menu.key}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleClientMenuToggle(menu.key)}
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#F9FAFB'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: isEnabled 
                          ? (isDark ? 'rgba(34, 197, 94, 0.1)' : '#DCFCE7')
                          : (isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2'),
                      }}
                    >
                      <Icon 
                        size={16} 
                        style={{
                          color: isEnabled ? '#22C55E' : '#EF4444',
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-primary-text text-sm">{menu.label}</p>
                      <p className="text-xs text-secondary-text">{menu.description}</p>
                    </div>
                  </div>
                  
                  {/* Toggle Switch */}
                  <div 
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer`}
                    style={{
                      backgroundColor: isEnabled ? 'var(--color-primary-accent, #217E45)' : '#D1D5DB',
                    }}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* EMPLOYEE MODULES SECTION */}
        <div 
          className="rounded-xl border overflow-hidden"
          style={{
            backgroundColor: isDark ? '#1F2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#E5E7EB',
          }}
        >
          {/* Section Header */}
          <div 
            className="p-4 border-b flex items-center justify-between"
            style={{
              backgroundColor: isDark ? '#111827' : '#F9FAFB',
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
              <button
                onClick={enableAllEmployee}
                className="text-xs px-2 py-1 rounded hover:bg-green-100 text-green-600 transition-colors"
              >
                Enable All
              </button>
              <button
                onClick={disableAllEmployee}
                className="text-xs px-2 py-1 rounded hover:bg-red-100 text-red-600 transition-colors"
              >
                Disable All
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="divide-y" style={{ borderColor: isDark ? '#374151' : '#E5E7EB' }}>
            {EMPLOYEE_MENU_CONFIG.map((menu) => {
              const Icon = menu.icon
              const isEnabled = localEmployeeMenus[menu.key] !== false
              
              return (
                <div 
                  key={menu.key}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleEmployeeMenuToggle(menu.key)}
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#F9FAFB'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: isEnabled 
                          ? (isDark ? 'rgba(34, 197, 94, 0.1)' : '#DCFCE7')
                          : (isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2'),
                      }}
                    >
                      <Icon 
                        size={16} 
                        style={{
                          color: isEnabled ? '#22C55E' : '#EF4444',
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-primary-text text-sm">{menu.label}</p>
                      <p className="text-xs text-secondary-text">{menu.description}</p>
                    </div>
                  </div>
                  
                  {/* Toggle Switch */}
                  <div 
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer`}
                    style={{
                      backgroundColor: isEnabled ? '#3B82F6' : '#D1D5DB',
                    }}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
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


/**
 * ModulesContext - Global State for Module Settings
 * Controls sidebar menu visibility for Client and Employee dashboards
 * Single source of truth - fetched from DB, applied instantly
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import BaseUrl from '../api/baseUrl'

// Default module settings - all menus enabled
const DEFAULT_CLIENT_MENUS = {
  dashboard: true,
  projects: true,
  proposals: true,
  store: true,
  files: true,
  billing: true,
  invoices: true,
  payments: true,
  subscriptions: true,
  orders: true,
  notes: true,
  contracts: true,
  tickets: true,
  messages: true,
}

const DEFAULT_EMPLOYEE_MENUS = {
  dashboard: true,
  myTasks: true,
  myProjects: true,
  timeTracking: true,
  events: true,
  myProfile: true,
  documents: true,
  attendance: true,
  leaveRequests: true,
  messages: true,
  tickets: true,
}

// Create context
const ModulesContext = createContext(null)

/**
 * ModulesProvider component
 * Wraps the app and provides module settings globally
 */
export const ModulesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [clientMenus, setClientMenus] = useState(DEFAULT_CLIENT_MENUS)
  const [employeeMenus, setEmployeeMenus] = useState(DEFAULT_EMPLOYEE_MENUS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Fetch module settings from backend
   */
  const fetchModuleSettings = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const companyId = user.company_id || localStorage.getItem('company_id')
      if (!companyId) {
        setLoading(false)
        return
      }

      const token = localStorage.getItem('token')
      const response = await fetch(
        `${BaseUrl}/api/v1/module-settings?company_id=${companyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch module settings')
      }

      const data = await response.json()

      if (data.success && data.data) {
        setClientMenus({ ...DEFAULT_CLIENT_MENUS, ...data.data.client_menus })
        setEmployeeMenus({ ...DEFAULT_EMPLOYEE_MENUS, ...data.data.employee_menus })
      }
    } catch (err) {
      console.error('Error fetching module settings:', err)
      setError(err.message)
      // Keep defaults on error
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  /**
   * Update module settings
   * @param {object} updates - { client_menus, employee_menus }
   * @returns {Promise<boolean>} Success status
   */
  const updateModuleSettings = useCallback(async (updates) => {
    try {
      const companyId = user?.company_id || localStorage.getItem('company_id')
      if (!companyId) {
        throw new Error('Company ID not found')
      }

      const token = localStorage.getItem('token')
      const response = await fetch(
        `${BaseUrl}/api/v1/module-settings?company_id=${companyId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            company_id: companyId,
            ...updates,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update module settings')
      }

      const data = await response.json()

      if (data.success && data.data) {
        // Update local state immediately for instant UI effect
        if (data.data.client_menus) {
          setClientMenus({ ...DEFAULT_CLIENT_MENUS, ...data.data.client_menus })
        }
        if (data.data.employee_menus) {
          setEmployeeMenus({ ...DEFAULT_EMPLOYEE_MENUS, ...data.data.employee_menus })
        }
        return true
      }

      return false
    } catch (err) {
      console.error('Error updating module settings:', err)
      setError(err.message)
      return false
    }
  }, [user])

  /**
   * Update a single client menu visibility
   * @param {string} menuKey - Menu key (e.g., 'projects', 'invoices')
   * @param {boolean} enabled - Whether menu should be visible
   */
  const updateClientMenu = useCallback(async (menuKey, enabled) => {
    const newClientMenus = { ...clientMenus, [menuKey]: enabled }
    setClientMenus(newClientMenus) // Optimistic update
    
    const success = await updateModuleSettings({ client_menus: newClientMenus })
    if (!success) {
      // Revert on failure
      setClientMenus(clientMenus)
    }
    return success
  }, [clientMenus, updateModuleSettings])

  /**
   * Update a single employee menu visibility
   * @param {string} menuKey - Menu key (e.g., 'myTasks', 'attendance')
   * @param {boolean} enabled - Whether menu should be visible
   */
  const updateEmployeeMenu = useCallback(async (menuKey, enabled) => {
    const newEmployeeMenus = { ...employeeMenus, [menuKey]: enabled }
    setEmployeeMenus(newEmployeeMenus) // Optimistic update
    
    const success = await updateModuleSettings({ employee_menus: newEmployeeMenus })
    if (!success) {
      // Revert on failure
      setEmployeeMenus(employeeMenus)
    }
    return success
  }, [employeeMenus, updateModuleSettings])

  /**
   * Reset all module settings to defaults
   */
  const resetToDefaults = useCallback(async () => {
    try {
      const companyId = user?.company_id || localStorage.getItem('company_id')
      if (!companyId) {
        throw new Error('Company ID not found')
      }

      const token = localStorage.getItem('token')
      const response = await fetch(
        `${BaseUrl}/api/v1/module-settings/reset?company_id=${companyId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company_id: companyId }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to reset module settings')
      }

      setClientMenus(DEFAULT_CLIENT_MENUS)
      setEmployeeMenus(DEFAULT_EMPLOYEE_MENUS)
      return true
    } catch (err) {
      console.error('Error resetting module settings:', err)
      setError(err.message)
      return false
    }
  }, [user])

  /**
   * Check if a specific client menu is enabled
   * @param {string} menuKey - Menu key
   * @returns {boolean}
   */
  const isClientMenuEnabled = useCallback((menuKey) => {
    return clientMenus[menuKey] !== false
  }, [clientMenus])

  /**
   * Check if a specific employee menu is enabled
   * @param {string} menuKey - Menu key
   * @returns {boolean}
   */
  const isEmployeeMenuEnabled = useCallback((menuKey) => {
    return employeeMenus[menuKey] !== false
  }, [employeeMenus])

  // Fetch settings on mount and when user changes
  useEffect(() => {
    fetchModuleSettings()
  }, [fetchModuleSettings])

  // Context value
  const value = {
    // State
    clientMenus,
    employeeMenus,
    loading,
    error,

    // Actions
    fetchModuleSettings,
    updateModuleSettings,
    updateClientMenu,
    updateEmployeeMenu,
    resetToDefaults,

    // Helpers
    isClientMenuEnabled,
    isEmployeeMenuEnabled,

    // Defaults for reference
    DEFAULT_CLIENT_MENUS,
    DEFAULT_EMPLOYEE_MENUS,
  }

  return (
    <ModulesContext.Provider value={value}>
      {children}
    </ModulesContext.Provider>
  )
}

/**
 * Custom hook to use modules context
 * @returns {object} Modules context value
 */
export const useModules = () => {
  const context = useContext(ModulesContext)
  if (!context) {
    throw new Error('useModules must be used within a ModulesProvider')
  }
  return context
}

export default ModulesContext


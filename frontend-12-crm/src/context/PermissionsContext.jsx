/**
 * PermissionsContext - Global State for User Permissions
 * Checks user permissions for modules based on module_settings
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import BaseUrl from '../api/baseUrl'

// Create context
const PermissionsContext = createContext(null)

/**
 * PermissionsProvider component
 * Provides permission checking functionality
 */
export const PermissionsProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [modulePermissions, setModulePermissions] = useState({})
  const [loading, setLoading] = useState(true)

  /**
   * Fetch user permissions from backend
   */
  const fetchPermissions = useCallback(async () => {
    console.log('🔄 fetchPermissions called - isAuthenticated:', isAuthenticated, 'user:', user?.role, user?.email)
    
    // Check if user exists (isAuthenticated might be undefined initially)
    if (!user) {
      console.log('⏳ Waiting for user...')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const companyId = user?.company_id || localStorage.getItem('companyId') || localStorage.getItem('company_id')
      console.log('🏢 Company ID:', companyId)
      
      if (!companyId) {
        console.log('❌ No company ID found')
        setLoading(false)
        return
      }

      const token = localStorage.getItem('token')
      const apiUrl = `${BaseUrl}/api/v1/module-settings?company_id=${companyId}`
      console.log('🌐 Fetching from:', apiUrl)
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 API Response:', data)
        
        if (data.success && data.data) {
          // Get module permissions
          const perms = data.data.module_permissions || {}
          
          // Get enabled menus based on user role
          const enabledMenus = user.role === 'CLIENT' 
            ? data.data.client_menus || {}
            : data.data.employee_menus || {}
          
          // Store permissions - if module is enabled but no permissions set, it means full access
          // Only store explicit permissions (including false values)
          setModulePermissions(perms)
          
          // Debug log
          console.log('✅ Loaded module permissions for', user.role, ':', perms)
          console.log('✅ Enabled menus:', enabledMenus)
        }
      } else {
        console.log('❌ Response not OK:', response.status)
      }
    } catch (err) {
      console.error('❌ Error fetching permissions:', err)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  /**
   * Check if user has permission for a module
   * @param {string} moduleKey - Module key (e.g., 'myTasks', 'proposals')
   * @param {string} permission - 'can_view', 'can_add', 'can_edit', 'can_delete'
   * @returns {boolean}
   */
  const hasPermission = useCallback((moduleKey, permission = 'can_view') => {
    // SUPERADMIN and ADMIN have all permissions
    if (user?.role === 'SUPERADMIN' || user?.role === 'ADMIN') {
      return true
    }

    // If permissions not loaded yet, return true (don't block while loading)
    if (loading) {
      return true
    }

    // Check module permissions
    if (modulePermissions[moduleKey]) {
      // Check if permission is explicitly set
      const perm = modulePermissions[moduleKey][permission]
      
      console.log(`🔐 Checking ${moduleKey}.${permission} = ${perm}`)
      
      // If explicitly false or 0, deny access
      if (perm === false || perm === 0) {
        console.log(`❌ DENIED: ${moduleKey}.${permission}`)
        return false
      }
      // If explicitly true or 1, allow access
      if (perm === true || perm === 1) {
        return true
      }
      // If undefined in permission object, default to true (full access)
      // This means if module has permissions object but this specific permission is not set, allow it
      return true
    }

    // If module permissions not set at all for this module, default to true (full access)
    // This ensures backward compatibility - if no permissions set, allow access
    console.log(`⚠️ No permissions found for ${moduleKey}, defaulting to true`)
    return true
  }, [modulePermissions, user, loading])

  /**
   * Check if user can view a module
   */
  const canView = useCallback((moduleKey) => {
    return hasPermission(moduleKey, 'can_view')
  }, [hasPermission])

  /**
   * Check if user can add to a module
   */
  const canAdd = useCallback((moduleKey) => {
    return hasPermission(moduleKey, 'can_add')
  }, [hasPermission])

  /**
   * Check if user can edit a module
   */
  const canEdit = useCallback((moduleKey) => {
    return hasPermission(moduleKey, 'can_edit')
  }, [hasPermission])

  /**
   * Check if user can delete from a module
   */
  const canDelete = useCallback((moduleKey) => {
    return hasPermission(moduleKey, 'can_delete')
  }, [hasPermission])

  // Fetch permissions on mount and when user changes
  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  // Context value
  const value = {
    modulePermissions,
    loading,
    hasPermission,
    canView,
    canAdd,
    canEdit,
    canDelete,
    refreshPermissions: fetchPermissions,
  }

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

/**
 * Custom hook to use permissions context
 */
export const usePermissions = () => {
  const context = useContext(PermissionsContext)
  // Return default values if context is not available (prevents errors)
  if (!context) {
    return {
      modulePermissions: {},
      loading: false,
      hasPermission: () => true,
      canView: () => true,
      canAdd: () => true,
      canEdit: () => true,
      canDelete: () => true,
      refreshPermissions: () => {},
    }
  }
  return context
}

export default PermissionsContext

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useModules } from '../../context/ModulesContext'
import { IoClose, IoChevronDown, IoLogOut, IoChevronForward } from 'react-icons/io5'
import adminSidebarData from '../../config/adminSidebarData'
import employeeSidebarData from '../../config/employeeSidebarData'
import clientSidebarData from '../../config/clientSidebarData'
import superAdminSidebarData from '../../config/superAdminSidebarData'

import { useLanguage } from '../../context/LanguageContext.jsx'

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const { clientMenus, employeeMenus } = useModules()
  const isDark = theme.mode === 'dark'
  const location = useLocation()
  const navigate = useNavigate()
  
  /**
   * ACCORDION STATE - Single source of truth
   * Only ONE dropdown can be open at a time
   * Value: string (menu path) or null (all closed)
   */
  const [activeMenu, setActiveMenu] = useState(null)
  
  /**
   * Track previous pathname to detect actual route changes
   * This prevents auto-expand from overriding user clicks
   */
  const prevPathnameRef = useRef(null) // Start with null to trigger initial expand
  
  /**
   * Track if this is the first mount - for initial auto-expand
   */
  const isFirstMountRef = useRef(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Check if a path matches the current location
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // Close mobile sidebar when menu item is clicked
  const handleMenuItemClick = () => {
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  /**
   * ACCORDION TOGGLE LOGIC
   * - If clicking the currently active menu → close it (set to null)
   * - If clicking a different menu → open it (close previous automatically)
   * This ensures only ONE dropdown is open at any time
   */
  const toggleSubmenu = useCallback((menuPath) => {
    setActiveMenu((currentActive) => {
      // If this menu is already open, close it
      if (currentActive === menuPath) {
        return null
      }
      // Otherwise, open this menu (automatically closes any other)
      return menuPath
    })
  }, [])

  /**
   * Filter menu items based on module settings
   * @param {Array} menuItems - Raw menu items from sidebar data
   * @param {Object} moduleSettings - Module settings (clientMenus or employeeMenus)
   * @returns {Array} Filtered menu items
   */
  const filterMenusByModuleSettings = useCallback((menuItems, moduleSettings) => {
    if (!moduleSettings) return menuItems

    return menuItems.filter(item => {
      // Keep section dividers (items with only 'section' property)
      if (item.section && !item.label) {
        return true
      }

      // Check if this menu has a moduleKey and if it's enabled
      if (item.moduleKey) {
        const isEnabled = moduleSettings[item.moduleKey] !== false
        if (!isEnabled) return false
      }

      // For parent menus with children, filter children as well
      if (item.children && item.children.length > 0) {
        const filteredChildren = item.children.filter(child => {
          if (child.moduleKey) {
            return moduleSettings[child.moduleKey] !== false
          }
          return true
        })

        // If no children remain, hide the parent too
        if (filteredChildren.length === 0) return false

        // Return item with filtered children
        item.children = filteredChildren
      }

      return true
    }).filter((item, index, arr) => {
      // Remove orphaned section dividers (sections with no following items)
      if (item.section && !item.label) {
        const nextItem = arr[index + 1]
        // Keep section only if next item exists and has the same section
        return nextItem && nextItem.section === item.section
      }
      return true
    })
  }, [])

  // Get sidebar data based on user role with module filtering
  const getSidebarData = useCallback(() => {
    if (!user) return []
    if (user.role === 'SUPERADMIN') return superAdminSidebarData
    if (user.role === 'ADMIN') return adminSidebarData
    if (user.role === 'EMPLOYEE') return employeeSidebarData
    if (user.role === 'CLIENT') return clientSidebarData
    return []
  }, [user])

  /**
   * Filtered menu data based on role and module settings
   * - SUPERADMIN and ADMIN see all menus (no filtering)
   * - CLIENT menus filtered by clientMenus settings
   * - EMPLOYEE menus filtered by employeeMenus settings
   */
  const menuData = useMemo(() => {
    const rawData = getSidebarData()
    
    if (!user) return rawData
    
    // Apply module filtering for CLIENT and EMPLOYEE only
    if (user.role === 'CLIENT') {
      return filterMenusByModuleSettings([...rawData.map(item => ({...item, children: item.children ? [...item.children] : undefined}))], clientMenus)
    }
    
    if (user.role === 'EMPLOYEE') {
      return filterMenusByModuleSettings([...rawData.map(item => ({...item, children: item.children ? [...item.children] : undefined}))], employeeMenus)
    }
    
    // SUPERADMIN and ADMIN see everything
    return rawData
  }, [getSidebarData, user, clientMenus, employeeMenus, filterMenusByModuleSettings])

  /**
   * AUTO-EXPAND: When navigating to a child page, auto-expand its parent
   * - On first mount: Always expand parent of active child
   * - On route change: Only expand if route actually changed
   * - Does NOT run on user clicks (prevents override of manual toggles)
   */
  useEffect(() => {
    // Check if this is first mount OR if pathname actually changed
    const isFirstMount = isFirstMountRef.current
    const pathnameChanged = prevPathnameRef.current !== location.pathname
    
    if (isFirstMount || pathnameChanged) {
      // Find which parent menu contains the active child route
      const activeParent = menuData.find((item) => {
        if (item.children && item.children.length > 0) {
          return item.children.some((child) => {
            return location.pathname === child.path || 
                   location.pathname.startsWith(child.path + '/')
          })
        }
        return false
      })

      // If we found a parent with active child, expand it
      if (activeParent) {
        setActiveMenu(activeParent.path)
      }
      
      // Update refs
      prevPathnameRef.current = location.pathname
      isFirstMountRef.current = false
    }
  }, [location.pathname, menuData])

  /**
   * COLLAPSE EFFECT: Close all dropdowns when sidebar is collapsed
   */
  useEffect(() => {
    if (isCollapsed) {
      setActiveMenu(null)
    }
  }, [isCollapsed])

  /**
   * RENDER MENU ITEM
   * Handles both parent menus (with children) and standalone items
   */
  const renderMenuItem = (item, level = 0) => {
    // Skip section-only items without labels
    if (item.section && !item.label) {
      return null
    }

    // PARENT MENU: Menu item with children (dropdown submenu)
    if (item.label && item.icon && item.children && item.children.length > 0) {
      const Icon = item.icon
      const hasActiveChild = item.children.some((child) => isActive(child.path))
      
      /**
       * Check if THIS menu is the currently expanded one
       * Uses the single activeMenu state for accordion behavior
       */
      const isExpanded = activeMenu === item.path

      return (
        <li key={item.path} className="mb-0.5">
          {/* Parent Menu Button */}
          <button
            onClick={(e) => {
              // Prevent event bubbling
              e.stopPropagation()
              // Only toggle if sidebar is not collapsed
              if (!isCollapsed) {
                toggleSubmenu(item.path)
              }
            }}
            className={`w-full flex items-center transition-all duration-200 ${isCollapsed
              ? 'justify-center px-2 py-2 rounded-lg cursor-default'
              : 'gap-2 px-3 py-2 justify-between rounded-lg cursor-pointer'
              } ${hasActiveChild
                ? 'bg-primary-accent text-white shadow-soft'
                : ''
              }`}
            style={{
              color: hasActiveChild ? '#ffffff' : (isDark ? '#e0e0e0' : '#4B5563'),
              backgroundColor: hasActiveChild ? undefined : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!hasActiveChild && !isCollapsed) {
                e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f3f4f6'
                e.currentTarget.style.color = isDark ? '#ffffff' : '#1f2937'
              }
            }}
            onMouseLeave={(e) => {
              if (!hasActiveChild && !isCollapsed) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = isDark ? '#e0e0e0' : '#4B5563'
              }
            }}
            title={isCollapsed ? t(item.label) : ''}
            aria-expanded={isExpanded}
            aria-haspopup="true"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Icon size={18} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="truncate text-sm font-medium">{t(item.label)}</span>
              )}
            </div>
            {/* Chevron indicator - rotates when expanded */}
            {!isCollapsed && (
              <IoChevronDown
                size={14}
                className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                  }`}
              />
            )}
          </button>
          
          {/* Submenu Children - Only show when expanded and not collapsed */}
          {!isCollapsed && isExpanded && (
            <div 
              className="overflow-hidden"
              style={{
                marginTop: '4px',
                marginLeft: '12px',
                paddingLeft: '8px',
                borderLeft: isDark ? '2px solid #4B5563' : '2px solid #D1D5DB',
              }}
            >
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {item.children.map((child) => {
                  const childActive = isActive(child.path)
                  const ChildIcon = child.icon
                  return (
                    <li key={child.path} style={{ marginBottom: '2px' }}>
                      <Link
                        to={child.path}
                        onClick={handleMenuItemClick}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          textDecoration: 'none',
                          fontWeight: childActive ? '600' : '400',
                          color: childActive 
                            ? '#ffffff'
                            : (isDark ? '#D1D5DB' : '#1F2937'),
                          backgroundColor: childActive 
                            ? 'var(--color-primary-accent, #217E45)' 
                            : 'transparent',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!childActive) {
                            e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#F3F4F6'
                            e.currentTarget.style.color = isDark ? '#ffffff' : '#111827'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!childActive) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = isDark ? '#D1D5DB' : '#1F2937'
                          }
                        }}
                      >
                        {ChildIcon && <ChildIcon size={16} style={{ flexShrink: 0 }} />}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t(child.label)}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </li>
      )
    }

    // STANDALONE MENU ITEM: No children, direct link
    if (item.label && item.icon) {
      const Icon = item.icon
      const active = isActive(item.path)

      return (
        <li key={item.path} className="mb-0.5">
          <Link
            to={item.path}
            onClick={handleMenuItemClick}
            className={`flex items-center transition-all duration-200 ${isCollapsed
              ? 'justify-center px-2 py-2 rounded-lg'
              : 'gap-2 px-3 py-2 rounded-lg'
              } ${active
                ? 'bg-primary-accent text-white shadow-soft'
                : ''
              }`}
            style={{
              color: active ? '#ffffff' : (isDark ? '#e0e0e0' : '#4B5563'),
              backgroundColor: active ? undefined : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f3f4f6'
                e.currentTarget.style.color = isDark ? '#ffffff' : '#1f2937'
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = isDark ? '#e0e0e0' : '#4B5563'
              }
            }}
            title={isCollapsed ? t(item.label) : ''}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!isCollapsed && (
              <span className="flex-1 truncate text-sm font-medium">{t(item.label)}</span>
            )}
          </Link>
        </li>
      )
    }

    return null
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 border-r z-40 transform transition-all duration-300 ease-smooth shadow-elevated ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 ${isCollapsed
            ? 'w-16'
            : 'w-56'
          } top-14`}
        style={{
          height: 'calc(100vh - 3.5rem)',
          maxHeight: 'calc(100vh - 3.5rem)',
          backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
          borderColor: isDark ? '#404040' : '#e5e7eb',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile only */}
          <div className="p-2 flex items-center justify-end flex-shrink-0 lg:hidden border-b border-border-light">
            <button
              onClick={onClose}
              className="text-secondary-text hover:text-primary-text p-1.5 rounded-lg hover:bg-sidebar-hover transition-all duration-200"
              aria-label="Close sidebar"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Menu Items - Scrollable */}
          <nav
            className="flex-1 overflow-y-auto overflow-x-hidden p-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#D1D5DB #F7F8FA',
            }}
          >
            <ul className="space-y-0.5">
              {menuData.map((item) => renderMenuItem(item))}
            </ul>
          </nav>

          {/* Logout - Fixed at bottom */}
          <div
            className="p-2 border-t flex-shrink-0"
            style={{ borderColor: isDark ? '#404040' : '#e5e7eb' }}
          >
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${isCollapsed ? 'justify-center' : ''
                } hover:bg-red-50 hover:text-red-600`}
              style={{ color: isDark ? '#e0e0e0' : '#6B7280' }}
              title={isCollapsed ? t('Logout') : ''}
            >
              <IoLogOut size={18} className="flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{t('Logout')}</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

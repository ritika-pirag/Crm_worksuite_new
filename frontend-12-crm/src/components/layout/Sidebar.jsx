import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
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
  const isDark = theme.mode === 'dark'
  const location = useLocation()
  const navigate = useNavigate()
  const [expandedItems, setExpandedItems] = useState({})

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const handleMenuItemClick = () => {
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  const toggleSubmenu = (path) => {
    setExpandedItems((prev) => ({
      ...prev,
      [path]: !prev[path],
    }))
  }

  const getSidebarData = () => {
    if (!user) return []
    if (user.role === 'SUPERADMIN') return superAdminSidebarData
    if (user.role === 'ADMIN') return adminSidebarData
    if (user.role === 'EMPLOYEE') return employeeSidebarData
    if (user.role === 'CLIENT') return clientSidebarData
    return []
  }

  const menuData = getSidebarData()

  // Auto-expand parent menu if any child is active
  useEffect(() => {
    setExpandedItems((prev) => {
      const newExpandedItems = { ...prev }
      let hasChanges = false

      menuData.forEach((item) => {
        if (item.children && item.children.length > 0) {
          const hasActiveChild = item.children.some((child) => {
            return location.pathname === child.path || location.pathname.startsWith(child.path + '/')
          })
          if (hasActiveChild && !newExpandedItems[item.path]) {
            newExpandedItems[item.path] = true
            hasChanges = true
          }
        }
      })

      return hasChanges ? newExpandedItems : prev
    })
  }, [location.pathname, menuData])

  // Close all submenus when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed) {
      setExpandedItems({})
    }
  }, [isCollapsed])

  const renderMenuItem = (item, level = 0) => {
    if (item.section && !item.label) {
      return null
    }

    // Menu Item with children (submenu)
    if (item.label && item.icon && item.children && item.children.length > 0) {
      const Icon = item.icon
      const hasActiveChild = item.children.some((child) => isActive(child.path))
      const isExpanded = expandedItems[item.path] || false

      return (
        <li key={item.path} className="mb-0.5">
          <button
            onClick={() => {
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
              color: hasActiveChild ? '#ffffff' : (isDark ? '#e0e0e0' : '#6B7280'),
            }}
            title={isCollapsed ? t(item.label) : ''}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Icon size={18} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="truncate text-sm font-medium">{t(item.label)}</span>
              )}
            </div>
            {!isCollapsed && (
              <IoChevronDown
                size={14}
                className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                  }`}
              />
            )}
          </button>
          {!isCollapsed && isExpanded && (
            <div className="overflow-hidden animate-slideDown">
              <ul className="space-y-0.5 pl-3 mt-0.5">
                {item.children.map((child) => {
                  const childActive = isActive(child.path)
                  const ChildIcon = child.icon
                  return (
                    <li key={child.path}>
                      <Link
                        to={child.path}
                        onClick={handleMenuItemClick}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm ${childActive
                          ? 'text-primary-accent font-semibold bg-primary-accent/10'
                          : ''
                          }`}
                        style={{
                          color: childActive ? undefined : (isDark ? '#b0b0b0' : '#6B7280'),
                        }}
                      >
                        {ChildIcon && <ChildIcon size={16} className="flex-shrink-0" />}
                        <span className="truncate">{t(child.label)}</span>
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

    // Regular Menu Item (no children)
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
              color: active ? '#ffffff' : (isDark ? '#e0e0e0' : '#6B7280'),
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

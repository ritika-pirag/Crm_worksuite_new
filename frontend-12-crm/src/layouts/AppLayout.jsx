import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import PwaInstallPrompt from '../components/ui/PwaInstallPrompt'

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  // Detect any detail page (project, lead, client, task, employee)
  const isDetailPage = /\/app\/admin\/(projects|leads|clients|tasks|employees)\/\d+/.test(location.pathname)

  // Removed auto-close logic to keep sidebar persistent

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-main-bg">
      {/* PWA Install Prompt - shows when available */}
      <PwaInstallPrompt />

      {/* TopBar – show menu button always */}
      <TopBar
        onMenuClick={() => setSidebarOpen(true)}
        isSidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        hideMenuButton={false}
      />
      <div className="flex relative w-full">
        {/* Main navigation sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-smooth min-h-screen w-full relative z-10 pt-16 lg:pt-20 ${sidebarCollapsed
            ? 'ml-0 lg:ml-20'
            : 'ml-0 lg:ml-64'
            }`}
        >
          <main className={`flex-1 w-full max-w-full overflow-x-hidden relative z-10 ${isDetailPage ? 'p-0' : 'p-6 lg:p-8 xl:p-10'
            }`}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppLayout

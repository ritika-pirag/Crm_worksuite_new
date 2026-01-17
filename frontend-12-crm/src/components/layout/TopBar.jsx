import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useSettings } from "../../context/SettingsContext";
import { useNavigate } from "react-router-dom";
import {
  IoMenu,
  IoSearch,
  IoDesktopOutline,
  IoAddCircleOutline,
  IoTime,
  IoNotifications,
  IoChevronDown,
  IoLogOut,
  IoPerson,
  IoGlobeOutline,
  IoAdd,
} from "react-icons/io5";
import NotificationDropdown from "./NotificationDropdown";
import MessagesPanel from "./MessagesPanel";
import GlobalSearch from "./GlobalSearch";
import { notificationsAPI } from "../../api";

const TopBar = ({ onMenuClick, isSidebarCollapsed, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { getCompanyInfo, getCompanyLogoUrl, settings } = useSettings();
  const isDark = theme.mode === "dark";
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileMenuRef = useRef(null);
  const dashboardMenuRef = useRef(null);
  
  // Get company info from settings context
  const companyInfo = getCompanyInfo();
  const companyLogoUrl = getCompanyLogoUrl();
  const systemName = settings?.system_name || companyInfo?.name || 'Develo';

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every min
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const companyId = parseInt(localStorage.getItem("companyId") || 1);
      const response = await notificationsAPI.getAll({
        company_id: companyId,
        limit: 10,
      });
      if (response.data.success) {
        setNotifications(response.data.data);
        const unread = response.data.data.filter((n) => !n.read_at).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
      if (
        dashboardMenuRef.current &&
        !dashboardMenuRef.current.contains(event.target)
      ) {
        setShowDashboardMenu(false);
      }
    };

    if (showProfileMenu || showDashboardMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu, showDashboardMenu]);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate("/login");
  };

  const getProfilePath = () => {
    if (!user) return "/app/superadmin/settings";
    switch (user.role) {
      case "SUPERADMIN":
        return "/app/superadmin/settings";
      case "ADMIN":
        return "/app/admin/settings";
      case "EMPLOYEE":
        return "/app/employee/my-profile";
      case "CLIENT":
        return "/app/client/profile";
      default:
        return "/app/superadmin/settings";
    }
  };

  const getRoleDisplayName = () => {
    if (!user) return "USER";
    switch (user.role) {
      case "SUPERADMIN":
        return "Super Admin";
      case "ADMIN":
        return "ADMIN";
      case "EMPLOYEE":
        return "EMPLOYEE";
      case "CLIENT":
        return "CLIENT";
      default:
        return user.role || "USER";
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 border-b z-50 w-full h-14 flex items-center shadow-sm"
        style={{
          zIndex: 1000,
          backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
          borderColor: isDark ? "#404040" : "#e5e7eb",
        }}
      >
        <div className="px-3 lg:px-4 py-2 flex items-center justify-between w-full h-full gap-3">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            {/* Logo - Dynamic from Settings */}
            <div
              className="flex items-center gap-3 cursor-pointer flex-shrink-0 group"
              onClick={() => navigate("/app/admin/dashboard")}
            >
              {companyLogoUrl ? (
                <img 
                  src={companyLogoUrl} 
                  alt={systemName}
                  className="w-7 h-7 lg:w-8 lg:h-8 object-contain rounded-lg flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-primary-accent to-info rounded-lg items-center justify-center flex-shrink-0 shadow-card group-hover:shadow-elevated transition-all duration-200 ${companyLogoUrl ? 'hidden' : 'flex'}`}
              >
                <span className="text-white font-bold text-xs lg:text-sm">
                  {systemName?.charAt(0)?.toUpperCase() || 'D'}
                </span>
              </div>
              <span className="text-base lg:text-lg font-bold text-primary-text whitespace-nowrap hidden sm:block">
                {systemName}
              </span>
            </div>

            {/* Sidebar Toggle */}
            <button
              onClick={(e) => {
                if (window.innerWidth < 1024) {
                  onMenuClick();
                } else {
                  onToggleSidebar();
                }
              }}
              className="flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 text-secondary-text hover:text-primary-text hover:bg-sidebar-hover rounded-lg transition-all duration-200 flex-shrink-0"
            >
              <IoMenu
                size={18}
                className={`transition-transform duration-200 ${
                  isSidebarCollapsed ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dashboard Selector */}
            <div className="relative ml-1 lg:ml-2" ref={dashboardMenuRef}>
              <button
                onClick={() => setShowDashboardMenu(!showDashboardMenu)}
                className="flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 text-secondary-text hover:text-primary-text hover:bg-sidebar-hover rounded-lg transition-all duration-200"
                title="Dashboards"
              >
                <IoDesktopOutline size={18} />
              </button>
              {showDashboardMenu && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-elevated border border-gray-100 py-2 z-50 animate-fadeIn">
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    onClick={() => {
                      navigate("/app/admin/dashboard");
                      setShowDashboardMenu(false);
                    }}
                  >
                    <IoDesktopOutline size={18} className="text-gray-500" />
                    <span>Default dashboard</span>
                  </button>
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    onClick={() => {
                      setShowDashboardMenu(false);
                      alert("Custom Dashboard coming soon!");
                    }}
                  >
                    <IoDesktopOutline size={18} className="text-blue-500" />
                    <span>Custom Dashboard</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-primary-accent hover:bg-blue-50 flex items-center gap-3 font-medium transition-colors"
                    onClick={() => {
                      setShowDashboardMenu(false);
                      alert("Feature coming soon!");
                    }}
                  >
                    <IoAddCircleOutline size={18} />
                    <span>Add new dashboard</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CENTER - Empty spacer */}
          <div className="flex-1"></div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
            {/* Search - Right side with dropdown */}
            <div className="relative">
              {!showSearch ? (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-1.5 lg:p-2 rounded-lg transition-all duration-200 flex-shrink-0 text-secondary-text hover:text-primary-text hover:bg-sidebar-hover"
                  title="Search"
                >
                  <IoSearch size={18} />
                </button>
              ) : (
                <GlobalSearch
                  mode="inline"
                  isOpen={true}
                  onClose={() => setShowSearch(false)}
                />
              )}
            </div>

            {/* Add Button */}
            <button className="hidden sm:flex items-center justify-center p-1.5 lg:p-2 text-secondary-text hover:text-primary-text hover:bg-sidebar-hover rounded-lg transition-all duration-200 flex-shrink-0">
              <IoAdd size={20} />
            </button>

            {/* Globe Icon */}
            <button className="hidden sm:flex items-center justify-center p-1.5 lg:p-2 text-secondary-text hover:text-primary-text hover:bg-sidebar-hover rounded-lg transition-all duration-200 flex-shrink-0">
              <IoGlobeOutline size={18} />
            </button>

            {/* Clock Icon */}
            <button className="hidden sm:flex items-center justify-center p-1.5 lg:p-2 text-secondary-text hover:text-primary-text hover:bg-sidebar-hover rounded-lg transition-all duration-200 flex-shrink-0">
              <IoTime size={18} />
            </button>

            {/* Notification Bell */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 lg:p-2 text-secondary-text hover:text-primary-text hover:bg-sidebar-hover rounded-lg transition-all duration-200 relative"
              >
                <IoNotifications size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-soft animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
              />
            </div>

            {/* User Profile */}
            <div className="relative flex-shrink-0" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 px-1 lg:px-1.5 py-1 text-primary-text hover:bg-sidebar-hover rounded-lg transition-all duration-200"
              >
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-primary-accent to-info flex items-center justify-center flex-shrink-0 shadow-card">
                  <span className="text-white text-[10px] lg:text-xs font-semibold">
                    {user?.role === "SUPERADMIN"
                      ? "SA"
                      : user?.role === "ADMIN"
                      ? "AD"
                      : user?.role === "EMPLOYEE"
                      ? "EM"
                      : user?.role === "CLIENT"
                      ? "CL"
                      : user?.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "U"}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-primary-text max-w-[100px] lg:max-w-[140px] truncate">
                  {getRoleDisplayName()}
                </span>
                <IoChevronDown
                  size={16}
                  className="hidden md:block text-secondary-text"
                />
              </button>

              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-elevated border border-gray-200 overflow-hidden animate-fadeIn"
                  style={{
                    position: "fixed",
                    top: "3.75rem",
                    right: "0.75rem",
                    zIndex: 10000,
                  }}
                >
                  <div className="p-3 border-b border-border-light bg-gradient-to-r from-primary-accent/5 to-info/5">
                    <p className="text-sm font-semibold text-primary-text truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-secondary-text truncate mt-0.5">
                      {user?.email || ""}
                    </p>
                    <p className="text-xs font-semibold text-primary-accent mt-0.5">
                      {getRoleDisplayName()}
                    </p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => {
                        navigate(getProfilePath());
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary-text hover:bg-sidebar-hover rounded-lg transition-all duration-200"
                    >
                      <IoPerson size={16} />
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <IoLogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Search Overlay (Mobile Only) */}
        <div className="md:hidden">
          <GlobalSearch
            isOpen={showSearch}
            onClose={() => setShowSearch(false)}
            mode="modal"
          />
        </div>
      </header>
    </>
  );
};

export default TopBar;

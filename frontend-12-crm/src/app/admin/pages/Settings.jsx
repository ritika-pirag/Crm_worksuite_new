import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { useTheme } from '../../../context/ThemeContext.jsx'
import { useLanguage } from '../../../context/LanguageContext.jsx'
import { useSettings } from '../../../context/SettingsContext.jsx'
import { settingsAPI, companiesAPI } from '../../../api'
import BaseUrl from '../../../api/baseUrl'
import {
  IoSettings,
  IoChevronDown,
  IoChevronForward,
  IoGlobe,
  IoMail,
  IoDocumentText,
  IoGrid,
  IoMenu,
  IoNotifications,
  IoExtensionPuzzle,
  IoRefresh,
  IoColorPalette,
  IoText,
  IoMoon,
  IoSunny,
  IoCheckmarkCircle,
  IoClose,
  IoImage,
  IoColorFill,
  IoDesktop,
  IoPhonePortrait,
  IoLockClosed,
  IoPeople,
  IoCart,
  IoBuild,
  IoCube,
  IoHome,
  IoShieldCheckmark,
  IoCloudUpload,
  IoServer,
  IoTime,
  IoLanguage,
  IoCodeWorking,
  IoCalendar,
  IoPrint,
  IoDownload,
  IoTrash,
  IoAdd,
  IoCreate,
  IoEye,
  IoEyeOff,
  IoBusiness,
  IoCall,
  IoGlobeOutline,
  IoLocation,
  IoImageOutline,
  IoSave
} from 'react-icons/io5'
import AttendanceSettings from './hrm/AttendanceSettings'
import LeaveSettings from './hrm/LeaveSettings'

const Settings = () => {
  const navigate = useNavigate()
  const { theme, updateTheme, resetTheme } = useTheme()
  const { changeLanguage, t } = useLanguage()
  const { 
    refreshSettings, 
    updateCompany, 
    updateSettings: updateContextSettings,
    timezoneOptions,
    dateFormatOptions,
    timeFormatOptions,
    currencySymbols
  } = useSettings()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  // Sidebar menu state
  const [activeSection, setActiveSection] = useState('app-settings')
  const [activeSubMenu, setActiveSubMenu] = useState('general')
  const [expandedSections, setExpandedSections] = useState({
    'app-settings': true,
    'access-permission': false,
    'client-portal': false,
    'sales-prospects': false,
    'setup': false,
    'plugins': false
  })

  // Company Information State
  const [companyInfo, setCompanyInfo] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    logo: ''
  })

  // Settings data state (system settings only)
  const [settings, setSettings] = useState({
    // System Settings
    system_name: 'Developo',
    default_currency: 'USD',
    default_timezone: 'UTC',
    date_format: 'Y-m-d',
    time_format: 'H:i',
    currency_symbol_position: 'before',

    // Localization
    default_language: 'en',

    // Email Settings
    email_from: 'noreply@developo.com',
    email_from_name: 'Developo',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    email_driver: 'smtp',

    // UI Options
    theme_mode: 'light',
    font_family: 'Inter, sans-serif',
    primary_color: '#217E45',
    secondary_color: '#76AF88',
    sidebar_style: 'default',
    top_menu_style: 'default',

    // Top Menu
    top_menu_items: [],
    top_menu_logo: '',
    top_menu_color: '#ffffff',

    // Footer
    footer_text: '© 2024 Developo. All rights reserved.',
    footer_links: [],
    footer_color: '#102D2C',

    // PWA
    pwa_app_name: 'Developo',
    pwa_app_short_name: 'Developo',
    pwa_app_description: 'Developo Application',
    pwa_app_icon: '',
    pwa_app_color: '#217E45',
    pwa_enabled: false,

    // Modules
    module_leads: true,
    module_clients: true,
    module_projects: true,
    module_tasks: true,
    module_invoices: true,
    module_estimates: true,
    module_proposals: true,
    module_payments: true,
    module_expenses: true,
    module_contracts: true,
    module_subscriptions: true,
    module_employees: true,
    module_attendance: true,
    module_time_tracking: true,
    module_events: true,
    module_departments: true,
    module_positions: true,
    module_messages: true,
    module_tickets: true,
    module_documents: true,
    module_reports: true,

    // Left Menu
    left_menu_items: [],
    left_menu_style: 'default',

    // Notifications
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    notification_sound: true,

    // Integration
    google_calendar_enabled: false,
    google_calendar_client_id: '',
    google_calendar_client_secret: '',
    slack_enabled: false,
    slack_webhook_url: '',
    zapier_enabled: false,
    zapier_api_key: '',

    // Cron Job
    cron_job_enabled: true,
    cron_job_frequency: 'daily',
    cron_job_last_run: null,

    // Updates
    auto_update_enabled: false,
    update_channel: 'stable',
    last_update_check: null,
  })

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  // Fetch settings and company info on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const companyId = localStorage.getItem('companyId') || 1

      // Fetch company info
      try {
        const companyResponse = await companiesAPI.getById(companyId)
        if (companyResponse.data.success && companyResponse.data.data) {
          const company = companyResponse.data.data
          setCompanyInfo({
            id: company.id,
            name: company.name || '',
            email: company.email || '',
            phone: company.phone || '',
            website: company.website || '',
            address: company.address || '',
            logo: company.logo || ''
          })
        }
      } catch (err) {
        console.error('Error fetching company:', err)
      }

      // Fetch settings
      const response = await settingsAPI.get({ company_id: companyId })
      if (response.data.success) {
        const settingsData = response.data.data || []
        const settingsObj = {}

        // Transform settings array to object
        settingsData.forEach(setting => {
          try {
            if (setting.setting_value && (setting.setting_value.startsWith('{') || setting.setting_value.startsWith('['))) {
              settingsObj[setting.setting_key] = JSON.parse(setting.setting_value)
            } else {
              settingsObj[setting.setting_key] = setting.setting_value
            }
          } catch (e) {
            settingsObj[setting.setting_key] = setting.setting_value
          }
        })

        // Update company info from settings if not already set
        if (!companyInfo.name && settingsObj.company_name) {
          setCompanyInfo(prev => ({
            ...prev,
            name: settingsObj.company_name || prev.name,
            email: settingsObj.company_email || prev.email,
            phone: settingsObj.company_phone || prev.phone,
            website: settingsObj.company_website || prev.website,
            address: settingsObj.company_address || prev.address,
            logo: settingsObj.company_logo || prev.logo
          }))
        }

        // Merge with defaults
        setSettings(prev => ({
          ...prev,
          ...settingsObj,
          // Ensure boolean values
          email_notifications: settingsObj.email_notifications === 'true' || settingsObj.email_notifications === true,
          sms_notifications: settingsObj.sms_notifications === 'true' || settingsObj.sms_notifications === true,
          push_notifications: settingsObj.push_notifications === 'true' || settingsObj.push_notifications === true,
          notification_sound: settingsObj.notification_sound === 'true' || settingsObj.notification_sound === true,
          pwa_enabled: settingsObj.pwa_enabled === 'true' || settingsObj.pwa_enabled === true,
          auto_update_enabled: settingsObj.auto_update_enabled === 'true' || settingsObj.auto_update_enabled === true,
          google_calendar_enabled: settingsObj.google_calendar_enabled === 'true' || settingsObj.google_calendar_enabled === true,
          slack_enabled: settingsObj.slack_enabled === 'true' || settingsObj.slack_enabled === true,
          zapier_enabled: settingsObj.zapier_enabled === 'true' || settingsObj.zapier_enabled === true,
          cron_job_enabled: settingsObj.cron_job_enabled === 'true' || settingsObj.cron_job_enabled === true,
          // Module settings
          module_leads: settingsObj.module_leads !== 'false' && settingsObj.module_leads !== false,
          module_clients: settingsObj.module_clients !== 'false' && settingsObj.module_clients !== false,
          module_projects: settingsObj.module_projects !== 'false' && settingsObj.module_projects !== false,
          module_tasks: settingsObj.module_tasks !== 'false' && settingsObj.module_tasks !== false,
          module_invoices: settingsObj.module_invoices !== 'false' && settingsObj.module_invoices !== false,
          module_estimates: settingsObj.module_estimates !== 'false' && settingsObj.module_estimates !== false,
          module_proposals: settingsObj.module_proposals !== 'false' && settingsObj.module_proposals !== false,
          module_payments: settingsObj.module_payments !== 'false' && settingsObj.module_payments !== false,
          module_expenses: settingsObj.module_expenses !== 'false' && settingsObj.module_expenses !== false,
          module_contracts: settingsObj.module_contracts !== 'false' && settingsObj.module_contracts !== false,
          module_subscriptions: settingsObj.module_subscriptions !== 'false' && settingsObj.module_subscriptions !== false,
          module_employees: settingsObj.module_employees !== 'false' && settingsObj.module_employees !== false,
          module_attendance: settingsObj.module_attendance !== 'false' && settingsObj.module_attendance !== false,
          module_time_tracking: settingsObj.module_time_tracking !== 'false' && settingsObj.module_time_tracking !== false,
          module_events: settingsObj.module_events !== 'false' && settingsObj.module_events !== false,
          module_departments: settingsObj.module_departments !== 'false' && settingsObj.module_departments !== false,
          module_positions: settingsObj.module_positions !== 'false' && settingsObj.module_positions !== false,
          module_messages: settingsObj.module_messages !== 'false' && settingsObj.module_messages !== false,
          module_tickets: settingsObj.module_tickets !== 'false' && settingsObj.module_tickets !== false,
          module_documents: settingsObj.module_documents !== 'false' && settingsObj.module_documents !== false,
          module_reports: settingsObj.module_reports !== 'false' && settingsObj.module_reports !== false,
        }))

        // Load theme settings
        if (settingsObj.theme_mode) {
          updateTheme({ mode: settingsObj.theme_mode })
        }
        if (settingsObj.font_family) {
          updateTheme({ fontFamily: settingsObj.font_family })
        }
        if (settingsObj.primary_color) {
          updateTheme({ primaryAccent: settingsObj.primary_color })
        }
        if (settingsObj.secondary_color) {
          updateTheme({ secondaryAccent: settingsObj.secondary_color })
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      showToast('Failed to load settings', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCompanyChange = (field, value) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async (category = null) => {
    try {
      setSaving(true)
      const companyId = localStorage.getItem('companyId') || 1

      // Save company info to companies table
      if (category === 'general' || !category) {
        try {
          await companiesAPI.update(companyId, {
            name: companyInfo.name,
            email: companyInfo.email,
            phone: companyInfo.phone,
            website: companyInfo.website,
            address: companyInfo.address,
            logo: companyInfo.logo
          })
          // Update context
          updateCompany(companyInfo)
        } catch (err) {
          console.error('Error saving company info:', err)
        }
      }

      // Prepare settings to save
      let settingsToSave = []

      // Also save company info to settings table for backwards compatibility
      if (category === 'general' || !category) {
        settingsToSave.push(
          { setting_key: 'company_name', setting_value: String(companyInfo.name || '') },
          { setting_key: 'company_email', setting_value: String(companyInfo.email || '') },
          { setting_key: 'company_phone', setting_value: String(companyInfo.phone || '') },
          { setting_key: 'company_website', setting_value: String(companyInfo.website || '') },
          { setting_key: 'company_address', setting_value: String(companyInfo.address || '') },
          { setting_key: 'company_logo', setting_value: String(companyInfo.logo || '') }
        )
      }

      if (category) {
        const categoryPrefixes = {
          'general': ['system_', 'default_currency', 'default_timezone', 'date_format', 'time_format', 'currency_symbol_position'],
          'localization': ['default_language', 'currency_symbol_position'],
          'email': ['email_', 'smtp_'],
          'ui-options': ['theme_mode', 'font_family', 'primary_color', 'secondary_color', 'sidebar_style', 'top_menu_style'],
          'top-menu': ['top_menu_'],
          'footer': ['footer_'],
          'pwa': ['pwa_'],
          'modules': ['module_'],
          'left-menu': ['left_menu_'],
          'notifications': ['notification_', 'email_notifications', 'sms_notifications', 'push_notifications'],
          'integration': ['google_calendar_', 'slack_', 'zapier_'],
          'cron-job': ['cron_job_'],
          'updates': ['auto_update_', 'update_', 'last_update_']
        }

        const prefixes = categoryPrefixes[category] || []
        Object.keys(settings).forEach(key => {
          if (prefixes.some(prefix => key.startsWith(prefix) || key === prefix)) {
            settingsToSave.push({
              setting_key: key,
              setting_value: typeof settings[key] === 'object' ? JSON.stringify(settings[key]) : String(settings[key])
            })
          }
        })
      } else {
        // Save all settings
        Object.keys(settings).forEach(key => {
          settingsToSave.push({
            setting_key: key,
            setting_value: typeof settings[key] === 'object' ? JSON.stringify(settings[key]) : String(settings[key])
          })
        })
      }

      if (settingsToSave.length === 0) {
        showToast('No settings to save', 'warning')
        return
      }

      // Use bulk update API
      const response = await settingsAPI.bulkUpdate(settingsToSave, { company_id: companyId })

      if (response.data.success) {
        // Apply theme changes immediately
        if (settings.theme_mode) {
          updateTheme({ mode: settings.theme_mode })
        }
        if (settings.primary_color) {
          updateTheme({ primaryAccent: settings.primary_color })
        }
        if (settings.secondary_color) {
          updateTheme({ secondaryAccent: settings.secondary_color })
        }
        if (settings.font_family) {
          updateTheme({ fontFamily: settings.font_family })
        }

        // Refresh global settings context
        await refreshSettings()

        showToast('Settings saved successfully!', 'success')
      } else {
        showToast(response.data.error || 'Failed to save settings', 'error')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      showToast(error.response?.data?.error || error.message || 'Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error')
      return
    }

    try {
      setSaving(true)
      const companyId = localStorage.getItem('companyId') || 1

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('logo', file)
      formData.append('setting_key', 'company_logo')

      const response = await settingsAPI.update(formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        // Get the uploaded file URL
        const logoUrl = response.data.data?.setting_value || `/uploads/${file.name}`
        
        // Update local state
        setCompanyInfo(prev => ({ ...prev, logo: logoUrl }))
        
        // Update company in database
        await companiesAPI.update(companyId, { logo: logoUrl })
        
        // Update global context
        updateCompany({ logo: logoUrl })
        
        // Refresh settings
        await refreshSettings()
        
        showToast('Logo uploaded successfully!', 'success')
      } else {
        showToast(response.data.error || 'Failed to upload logo', 'error')
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      showToast(error.response?.data?.error || 'Failed to upload logo', 'error')
    } finally {
      setSaving(false)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const menuItems = [
    {
      id: 'app-settings',
      label: t('settings.app_settings'),
      icon: IoSettings,
      children: [
        { id: 'general', label: t('settings.general'), icon: IoSettings },
        { id: 'localization', label: t('settings.localization'), icon: IoLanguage },
        { id: 'email', label: t('settings.email'), icon: IoMail },
        { id: 'email-templates', label: t('settings.email_templates'), icon: IoDocumentText },
        { id: 'modules', label: t('settings.modules'), icon: IoGrid },
        { id: 'left-menu', label: t('settings.left_menu'), icon: IoMenu },
        { id: 'notifications', label: t('settings.notifications'), icon: IoNotifications },
        { id: 'integration', label: t('settings.integration'), icon: IoExtensionPuzzle },
        { id: 'cron-job', label: t('settings.cron_job'), icon: IoTime },
        { id: 'updates', label: t('settings.updates'), icon: IoCloudUpload },
      ]
    },
    {
      id: 'hrm',
      label: 'HR Settings',
      icon: IoPeople,
      children: [
        { id: 'hrm-attendance', label: 'Attendance Settings', icon: IoTime },
        { id: 'hrm-leaves', label: 'Leave Settings', icon: IoCalendar },
      ]
    },
    {
      id: 'access-permission',
      label: t('settings.access_permission'),
      icon: IoLockClosed,
      children: [
        { id: 'access-permission', label: t('settings.roles_permissions'), icon: IoShieldCheckmark },
      ]
    },
    {
      id: 'client-portal',
      label: t('settings.client_portal'),
      icon: IoPeople,
      children: [
        { id: 'client-portal', label: t('settings.portal_settings'), icon: IoPeople },
      ]
    },
    {
      id: 'sales-prospects',
      label: t('settings.sales_prospects'),
      icon: IoCart,
      children: [
        { id: 'sales-prospects', label: t('settings.pipeline_settings'), icon: IoCart },
      ]
    },
    {
      id: 'setup',
      label: t('settings.setup'),
      icon: IoBuild,
      children: [
        { id: 'setup', label: t('settings.system_setup'), icon: IoBuild },
      ]
    },
    {
      id: 'plugins',
      label: t('settings.plugins'),
      icon: IoCube,
      children: [
        { id: 'plugins', label: t('settings.manage_plugins'), icon: IoCube },
      ]
    }
  ]

  const renderContent = () => {
    switch (activeSubMenu) {
      case 'general':
        return (
          <GeneralSettings 
            companyInfo={companyInfo}
            settings={settings} 
            handleCompanyChange={handleCompanyChange}
            handleChange={handleChange} 
            handleLogoUpload={handleLogoUpload}
            timezoneOptions={timezoneOptions}
            dateFormatOptions={dateFormatOptions}
            timeFormatOptions={timeFormatOptions}
            currencySymbols={currencySymbols}
          />
        )
      case 'localization':
        return <LocalizationSettings settings={settings} handleChange={handleChange} onLanguageChange={changeLanguage} />
      case 'email':
        return <EmailSettings settings={settings} handleChange={handleChange} />
      case 'email-templates':
        return <EmailTemplatesSettings settings={settings} handleChange={handleChange} />
      case 'modules':
        return <ModulesSettings settings={settings} handleChange={handleChange} />
      case 'left-menu':
        return <LeftMenuSettings settings={settings} handleChange={handleChange} />
      case 'notifications':
        return <NotificationsSettings settings={settings} handleChange={handleChange} />
      case 'integration':
        return <IntegrationSettings settings={settings} handleChange={handleChange} />
      case 'cron-job':
        return <CronJobSettings settings={settings} handleChange={handleChange} />
      case 'updates':
        return <UpdatesSettings settings={settings} handleChange={handleChange} />
      case 'access-permission':
        return <AccessPermissionSettings settings={settings} handleChange={handleChange} />
      case 'client-portal':
        return <ClientPortalSettings settings={settings} handleChange={handleChange} />
      case 'sales-prospects':
        return <SalesProspectsSettings settings={settings} handleChange={handleChange} />
      case 'setup':
        return <SetupSettings settings={settings} handleChange={handleChange} />
      case 'plugins':
        return <PluginsSettings settings={settings} handleChange={handleChange} />
      case 'hrm-attendance':
        return <AttendanceSettings />
      case 'hrm-leaves':
        return <LeaveSettings />
      default:
        return (
          <GeneralSettings 
            companyInfo={companyInfo}
            settings={settings} 
            handleCompanyChange={handleCompanyChange}
            handleChange={handleChange} 
            handleLogoUpload={handleLogoUpload}
            timezoneOptions={timezoneOptions}
            dateFormatOptions={dateFormatOptions}
            timeFormatOptions={timeFormatOptions}
            currencySymbols={currencySymbols}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-accent mx-auto"></div>
          <p className="mt-4 text-secondary-text">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-120px)]">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-500 text-white' :
          toast.type === 'error' ? 'bg-red-500 text-white' :
          'bg-yellow-500 text-white'
        }`}>
          {toast.type === 'success' && <IoCheckmarkCircle size={20} />}
          {toast.type === 'error' && <IoClose size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Left Sidebar Menu */}
      <div className="w-full lg:w-64 bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-primary-text">{t('settings.title')}</h2>
        </div>
        <nav className="p-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.children.length > 0) {
                    toggleSection(item.id)
                  } else {
                    setActiveSection(item.id)
                    setActiveSubMenu(item.id)
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors mb-1 ${activeSection === item.id
                  ? 'bg-primary-accent/10 text-primary-accent'
                  : 'text-primary-text hover:bg-gray-100'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.children.length > 0 && (
                  expandedSections[item.id] ? <IoChevronDown size={16} /> : <IoChevronForward size={16} />
                )}
              </button>

              {item.children.length > 0 && expandedSections[item.id] && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => {
                        setActiveSection(item.id)
                        setActiveSubMenu(child.id)
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${activeSubMenu === child.id
                        ? 'bg-primary-accent text-white'
                        : 'text-secondary-text hover:bg-gray-50'
                        }`}
                    >
                      <child.icon size={16} />
                      <span>{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <Card className="p-4 sm:p-6">
          {renderContent()}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => fetchAllData()}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              <IoRefresh size={18} className="mr-2" />
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSave(activeSubMenu)}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <IoSave size={18} className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

// General Settings Component - Updated with proper company info
const GeneralSettings = ({ 
  companyInfo, 
  settings, 
  handleCompanyChange, 
  handleChange, 
  handleLogoUpload,
  timezoneOptions,
  dateFormatOptions,
  timeFormatOptions,
  currencySymbols
}) => {
  const [activeTab, setActiveTab] = useState('general')
  const { t } = useLanguage()

  const tabs = [
    { id: 'general', label: 'General Settings' },
    { id: 'ui-options', label: 'UI Options' },
    { id: 'pwa', label: 'PWA Settings' }
  ]

  // Get logo URL
  const getLogoUrl = () => {
    if (!companyInfo.logo) return null
    if (companyInfo.logo.startsWith('http') || companyInfo.logo.startsWith('blob:') || companyInfo.logo.startsWith('data:')) {
      return companyInfo.logo
    }
    return `${BaseUrl}${companyInfo.logo.startsWith('/') ? '' : '/'}${companyInfo.logo}`
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-primary-text mb-2">General Settings</h1>
        <p className="text-secondary-text text-sm sm:text-base">Configure company information and system settings</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
              ? 'border-primary-accent text-primary-accent'
              : 'border-transparent text-secondary-text hover:text-primary-text'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Company Information Section */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <IoBusiness size={24} className="text-primary-accent" />
              <h3 className="text-lg font-semibold text-primary-text">Company Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                value={companyInfo.name || ''}
                onChange={(e) => handleCompanyChange('name', e.target.value)}
                placeholder="Enter company name"
                icon={IoBusiness}
              />
              <Input
                label="Company Email"
                type="email"
                value={companyInfo.email || ''}
                onChange={(e) => handleCompanyChange('email', e.target.value)}
                placeholder="company@example.com"
                icon={IoMail}
              />
              <Input
                label="Company Phone"
                value={companyInfo.phone || ''}
                onChange={(e) => handleCompanyChange('phone', e.target.value)}
                placeholder="+1 234 567 8900"
                icon={IoCall}
              />
              <Input
                label="Company Website"
                value={companyInfo.website || ''}
                onChange={(e) => handleCompanyChange('website', e.target.value)}
                placeholder="https://example.com"
                icon={IoGlobeOutline}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-text mb-2">
                  <div className="flex items-center gap-2">
                    <IoLocation size={18} />
                    Company Address
                  </div>
                </label>
                <textarea
                  value={companyInfo.address || ''}
                  onChange={(e) => handleCompanyChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
                  placeholder="Enter company address"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-text mb-2">
                  <div className="flex items-center gap-2">
                    <IoImageOutline size={18} />
                    Company Logo
                  </div>
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                    />
                    <p className="text-xs text-secondary-text mt-1">Recommended: PNG or SVG, max 5MB</p>
                  </div>
                  {getLogoUrl() && (
                    <div className="flex-shrink-0">
                      <img
                        src={getLogoUrl()}
                        alt="Company Logo"
                        className="h-16 w-auto max-w-[200px] object-contain rounded-lg border border-gray-200 p-2 bg-white"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* System Settings Section */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <IoSettings size={24} className="text-primary-accent" />
              <h3 className="text-lg font-semibold text-primary-text">System Settings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="System Name"
                value={settings.system_name || ''}
                onChange={(e) => handleChange('system_name', e.target.value)}
                placeholder="Developo"
              />
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">Default Currency</label>
                <select
                  value={settings.default_currency || 'USD'}
                  onChange={(e) => handleChange('default_currency', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  {Object.entries(currencySymbols || {}).map(([code, symbol]) => (
                    <option key={code} value={code}>{code} ({symbol})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">Default Timezone</label>
                <select
                  value={settings.default_timezone || 'UTC'}
                  onChange={(e) => handleChange('default_timezone', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  {(timezoneOptions || []).map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">Date Format</label>
                <select
                  value={settings.date_format || 'Y-m-d'}
                  onChange={(e) => handleChange('date_format', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  {(dateFormatOptions || []).map(df => (
                    <option key={df.value} value={df.value}>{df.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">Time Format</label>
                <select
                  value={settings.time_format || 'H:i'}
                  onChange={(e) => handleChange('time_format', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  {(timeFormatOptions || []).map(tf => (
                    <option key={tf.value} value={tf.value}>{tf.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">Currency Symbol Position</label>
                <select
                  value={settings.currency_symbol_position || 'before'}
                  onChange={(e) => handleChange('currency_symbol_position', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="before">Before Amount ($100)</option>
                  <option value="after">After Amount (100$)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ui-options' && (
        <UIOptionsTab settings={settings} handleChange={handleChange} />
      )}

      {activeTab === 'pwa' && (
        <PWATab settings={settings} handleChange={handleChange} handleLogoUpload={handleLogoUpload} />
      )}
    </div>
  )
}

// UI Options Tab Component
const UIOptionsTab = ({ settings, handleChange }) => {
  const { theme, updateTheme } = useTheme()

  const fontOptions = [
    { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif', label: 'System Default' },
    { value: 'Inter, sans-serif', label: 'Inter' },
    { value: 'Poppins, sans-serif', label: 'Poppins' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: 'Open Sans, sans-serif', label: 'Open Sans' },
    { value: 'Lato, sans-serif', label: 'Lato' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-primary-text mb-4">Theme Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Theme Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleChange('theme_mode', 'light')
                  updateTheme({ mode: 'light' })
                }}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${(settings.theme_mode || 'light') === 'light'
                  ? 'border-primary-accent bg-primary-accent/10 text-primary-accent'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                <IoSunny size={18} className="mx-auto mb-1" />
                Light
              </button>
              <button
                onClick={() => {
                  handleChange('theme_mode', 'dark')
                  updateTheme({ mode: 'dark' })
                }}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${settings.theme_mode === 'dark'
                  ? 'border-primary-accent bg-primary-accent/10 text-primary-accent'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                <IoMoon size={18} className="mx-auto mb-1" />
                Dark
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Font Family</label>
            <select
              value={settings.font_family || fontOptions[0].value}
              onChange={(e) => {
                handleChange('font_family', e.target.value)
                updateTheme({ fontFamily: e.target.value })
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              style={{ fontFamily: settings.font_family || fontOptions[0].value }}
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.primary_color || '#217E45'}
                onChange={(e) => {
                  handleChange('primary_color', e.target.value)
                  updateTheme({ primaryAccent: e.target.value })
                }}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <Input
                value={settings.primary_color || '#217E45'}
                onChange={(e) => {
                  handleChange('primary_color', e.target.value)
                  updateTheme({ primaryAccent: e.target.value })
                }}
                placeholder="#217E45"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.secondary_color || '#76AF88'}
                onChange={(e) => {
                  handleChange('secondary_color', e.target.value)
                  updateTheme({ secondaryAccent: e.target.value })
                }}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <Input
                value={settings.secondary_color || '#76AF88'}
                onChange={(e) => {
                  handleChange('secondary_color', e.target.value)
                  updateTheme({ secondaryAccent: e.target.value })
                }}
                placeholder="#76AF88"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Sidebar Style</label>
            <select
              value={settings.sidebar_style || 'default'}
              onChange={(e) => handleChange('sidebar_style', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="default">Default</option>
              <option value="compact">Compact</option>
              <option value="icon-only">Icon Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Top Menu Style</label>
            <select
              value={settings.top_menu_style || 'default'}
              onChange={(e) => handleChange('top_menu_style', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="default">Default</option>
              <option value="centered">Centered</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

// PWA Tab Component
const PWATab = ({ settings, handleChange, handleLogoUpload }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-primary-text mb-4">Progressive Web App (PWA) Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={settings.pwa_enabled || false}
                onChange={(e) => handleChange('pwa_enabled', e.target.checked)}
                className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent"
              />
              <span className="text-sm font-medium text-primary-text">Enable PWA</span>
            </label>
          </div>
          <Input
            label="App Name"
            value={settings.pwa_app_name || ''}
            onChange={(e) => handleChange('pwa_app_name', e.target.value)}
            placeholder="Developo"
          />
          <Input
            label="App Short Name"
            value={settings.pwa_app_short_name || ''}
            onChange={(e) => handleChange('pwa_app_short_name', e.target.value)}
            placeholder="Developo"
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary-text mb-2">App Description</label>
            <textarea
              value={settings.pwa_app_description || ''}
              onChange={(e) => handleChange('pwa_app_description', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Developo Application"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary-text mb-2">App Icon (192×192)</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, 'pwa_app_icon')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                />
                <p className="text-xs text-secondary-text mt-1">Recommended size: 192×192 pixels</p>
              </div>
              {settings.pwa_app_icon && (
                <div className="relative">
                  <img
                    src={settings.pwa_app_icon.startsWith('http') || settings.pwa_app_icon.startsWith('blob:')
                      ? settings.pwa_app_icon
                      : `${BaseUrl}${settings.pwa_app_icon.startsWith('/') ? '' : '/'}${settings.pwa_app_icon}`
                    }
                    alt="PWA Icon"
                    className="w-24 h-24 object-contain rounded-lg border border-gray-200 p-2 bg-gray-50"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">App Theme Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.pwa_app_color || '#217E45'}
                onChange={(e) => handleChange('pwa_app_color', e.target.value)}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <Input
                value={settings.pwa_app_color || '#217E45'}
                onChange={(e) => handleChange('pwa_app_color', e.target.value)}
                placeholder="#217E45"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Localization Settings Component
const LocalizationSettings = ({ settings, handleChange, onLanguageChange }) => {
  const handleLanguageSelect = (e) => {
    const newLang = e.target.value
    handleChange('default_language', newLang)
    if (onLanguageChange) {
      onLanguageChange(newLang)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary-text mb-2">Localization Settings</h1>
        <p className="text-secondary-text text-sm sm:text-base">Configure language and regional settings</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">Default Language</label>
          <select
            value={settings.default_language || 'en'}
            onChange={handleLanguageSelect}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
          >
            <option value="en">English</option>
            <option value="es">Spanish (Español)</option>
            <option value="fr">French (Français)</option>
            <option value="de">German (Deutsch)</option>
            <option value="ar">Arabic (العربية)</option>
            <option value="hi">Hindi (हिंदी)</option>
          </select>
          <p className="text-xs text-secondary-text mt-1">Language will be applied immediately</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">Currency Symbol Position</label>
          <select
            value={settings.currency_symbol_position || 'before'}
            onChange={(e) => handleChange('currency_symbol_position', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
          >
            <option value="before">Before Amount ($100)</option>
            <option value="after">After Amount (100$)</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// Email Settings Component
const EmailSettings = ({ settings, handleChange }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary-text mb-2">Email Settings</h1>
        <p className="text-secondary-text text-sm sm:text-base">Configure email server settings</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">Email Driver</label>
          <select
            value={settings.email_driver || 'smtp'}
            onChange={(e) => handleChange('email_driver', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
          >
            <option value="smtp">SMTP</option>
            <option value="sendmail">Sendmail</option>
            <option value="mailgun">Mailgun</option>
            <option value="ses">Amazon SES</option>
          </select>
        </div>
        <Input
          label="From Email"
          type="email"
          value={settings.email_from || ''}
          onChange={(e) => handleChange('email_from', e.target.value)}
          placeholder="noreply@developo.com"
        />
        <Input
          label="From Name"
          value={settings.email_from_name || ''}
          onChange={(e) => handleChange('email_from_name', e.target.value)}
          placeholder="Developo"
        />
        <Input
          label="SMTP Host"
          value={settings.smtp_host || ''}
          onChange={(e) => handleChange('smtp_host', e.target.value)}
          placeholder="smtp.gmail.com"
        />
        <Input
          label="SMTP Port"
          type="number"
          value={settings.smtp_port || 587}
          onChange={(e) => handleChange('smtp_port', parseInt(e.target.value))}
          placeholder="587"
        />
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">SMTP Encryption</label>
          <select
            value={settings.smtp_encryption || 'tls'}
            onChange={(e) => handleChange('smtp_encryption', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
          >
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
            <option value="none">None</option>
          </select>
        </div>
        <Input
          label="SMTP Username"
          value={settings.smtp_username || ''}
          onChange={(e) => handleChange('smtp_username', e.target.value)}
          placeholder="your-email@gmail.com"
        />
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">SMTP Password</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={settings.smtp_password || ''}
              onChange={(e) => handleChange('smtp_password', e.target.value)}
              placeholder="Enter SMTP password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text hover:text-primary-text"
            >
              {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Email Templates Settings Component
const EmailTemplatesSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary-text mb-2">Email Templates</h1>
        <p className="text-secondary-text text-sm sm:text-base">Manage email templates</p>
      </div>
      <div className="text-center py-8 text-secondary-text">
        <IoDocumentText size={48} className="mx-auto mb-2 text-gray-300" />
        <p>Email templates are managed in the Email Templates section</p>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/app/admin/email-templates'}
          className="mt-4"
        >
          Go to Email Templates
        </Button>
      </div>
    </div>
  )
}

// Modules Settings Component
const ModulesSettings = ({ settings, handleChange }) => {
  const modules = [
    { key: 'module_leads', label: 'Leads' },
    { key: 'module_clients', label: 'Clients' },
    { key: 'module_projects', label: 'Projects' },
    { key: 'module_tasks', label: 'Tasks' },
    { key: 'module_invoices', label: 'Invoices' },
    { key: 'module_estimates', label: 'Estimates' },
    { key: 'module_proposals', label: 'Proposals' },
    { key: 'module_payments', label: 'Payments' },
    { key: 'module_expenses', label: 'Expenses' },
    { key: 'module_contracts', label: 'Contracts' },
    { key: 'module_subscriptions', label: 'Subscriptions' },
    { key: 'module_employees', label: 'Employees' },
    { key: 'module_attendance', label: 'Attendance' },
    { key: 'module_time_tracking', label: 'Time Tracking' },
    { key: 'module_events', label: 'Events' },
    { key: 'module_departments', label: 'Departments' },
    { key: 'module_positions', label: 'Positions' },
    { key: 'module_messages', label: 'Messages' },
    { key: 'module_tickets', label: 'Tickets' },
    { key: 'module_documents', label: 'Documents' },
    { key: 'module_reports', label: 'Reports' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary-text mb-2">Modules Settings</h1>
        <p className="text-secondary-text text-sm sm:text-base">Enable or disable application modules</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <label
            key={module.key}
            className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={settings[module.key] !== false}
              onChange={(e) => handleChange(module.key, e.target.checked)}
              className="w-5 h-5 text-primary-accent rounded focus:ring-primary-accent"
            />
            <span className="text-sm font-medium text-primary-text">{module.label}</span>
            <Badge variant={settings[module.key] !== false ? 'success' : 'danger'} className="ml-auto">
              {settings[module.key] !== false ? 'Enabled' : 'Disabled'}
            </Badge>
          </label>
        ))}
      </div>
    </div>
  )
}

// Left Menu Settings Component
const LeftMenuSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary-text mb-2">Left Menu Settings</h1>
        <p className="text-secondary-text text-sm sm:text-base">Configure left sidebar menu</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">Menu Style</label>
          <select
            value={settings.left_menu_style || 'default'}
            onChange={(e) => handleChange('left_menu_style', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
          >
            <option value="default">Default</option>
            <option value="compact">Compact</option>
            <option value="icon-only">Icon Only</option>
            <option value="collapsed">Collapsed</option>
          </select>
        </div>
        <div className="text-center py-8 text-secondary-text">
          <IoMenu size={48} className="mx-auto mb-2 text-gray-300" />
          <p>Menu items are managed in the sidebar configuration</p>
        </div>
      </div>
    </div>
  )
}

// Notifications Settings Component
const NotificationsSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary-text mb-2">Notifications Settings</h1>
        <p className="text-secondary-text text-sm sm:text-base">Configure notification preferences</p>
      </div>
      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={settings.email_notifications !== false}
            onChange={(e) => handleChange('email_notifications', e.target.checked)}
            className="w-5 h-5 text-primary-accent rounded focus:ring-primary-accent"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-primary-text block">Email Notifications</span>
            <span className="text-xs text-secondary-text">Receive notifications via email</span>
          </div>
        </label>
        <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={settings.sms_notifications === true}
            onChange={(e) => handleChange('sms_notifications', e.target.checked)}
            className="w-5 h-5 text-primary-accent rounded focus:ring-primary-accent"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-primary-text block">SMS Notifications</span>
            <span className="text-xs text-secondary-text">Receive notifications via SMS</span>
          </div>
        </label>
        <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={settings.push_notifications !== false}
            onChange={(e) => handleChange('push_notifications', e.target.checked)}
            className="w-5 h-5 text-primary-accent rounded focus:ring-primary-accent"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-primary-text block">Push Notifications</span>
            <span className="text-xs text-secondary-text">Receive browser push notifications</span>
          </div>
        </label>
        <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={settings.notification_sound !== false}
            onChange={(e) => handleChange('notification_sound', e.target.checked)}
            className="w-5 h-5 text-primary-accent rounded focus:ring-primary-accent"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-primary-text block">Notification Sound</span>
            <span className="text-xs text-secondary-text">Play sound when notification arrives</span>
          </div>
        </label>
      </div>
    </div>
  )
}

// Integration Settings Component
const IntegrationSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary-text mb-2">Integration Settings</h1>
        <p className="text-secondary-text text-sm sm:text-base">Configure third-party integrations</p>
      </div>

      {/* Google Calendar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <IoCalendar size={24} className="text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-primary-text">Google Calendar</h3>
              <p className="text-sm text-secondary-text">Sync events with Google Calendar</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.google_calendar_enabled === true}
              onChange={(e) => handleChange('google_calendar_enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-accent"></div>
          </label>
        </div>
        {settings.google_calendar_enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
            <Input
              label="Client ID"
              value={settings.google_calendar_client_id || ''}
              onChange={(e) => handleChange('google_calendar_client_id', e.target.value)}
              placeholder="Enter Google Client ID"
            />
            <Input
              label="Client Secret"
              type="password"
              value={settings.google_calendar_client_secret || ''}
              onChange={(e) => handleChange('google_calendar_client_secret', e.target.value)}
              placeholder="Enter Google Client Secret"
            />
          </div>
        )}
      </Card>

      {/* Slack */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <IoNotifications size={24} className="text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-primary-text">Slack</h3>
              <p className="text-sm text-secondary-text">Send notifications to Slack</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.slack_enabled === true}
              onChange={(e) => handleChange('slack_enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-accent"></div>
          </label>
        </div>
        {settings.slack_enabled && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Input
              label="Webhook URL"
              value={settings.slack_webhook_url || ''}
              onChange={(e) => handleChange('slack_webhook_url', e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>
        )}
      </Card>

      {/* Zapier */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <IoExtensionPuzzle size={24} className="text-orange-600" />
            <div>
              <h3 className="text-lg font-semibold text-primary-text">Zapier</h3>
              <p className="text-sm text-secondary-text">Connect with Zapier automation</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.zapier_enabled === true}
              onChange={(e) => handleChange('zapier_enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-accent"></div>
          </label>
        </div>
        {settings.zapier_enabled && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Input
              label="API Key"
              value={settings.zapier_api_key || ''}
              onChange={(e) => handleChange('zapier_api_key', e.target.value)}
              placeholder="Enter Zapier API Key"
            />
          </div>
        )}
      </Card>
    </div>
  )
}

// Cron Job Settings Component
const CronJobSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary-text mb-2">Cron Job Settings</h1>
        <p className="text-secondary-text text-sm sm:text-base">Configure automated tasks</p>
      </div>
      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={settings.cron_job_enabled !== false}
            onChange={(e) => handleChange('cron_job_enabled', e.target.checked)}
            className="w-5 h-5 text-primary-accent rounded focus:ring-primary-accent"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-primary-text block">Enable Cron Jobs</span>
            <span className="text-xs text-secondary-text">Run automated tasks in the background</span>
          </div>
        </label>
        {settings.cron_job_enabled && (
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Frequency</label>
            <select
              value={settings.cron_job_frequency || 'daily'}
              onChange={(e) => handleChange('cron_job_frequency', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}
        {settings.cron_job_last_run && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-secondary-text">
              Last Run: {new Date(settings.cron_job_last_run).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Updates Settings Component
const UpdatesSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary-text mb-2">Updates Settings</h1>
        <p className="text-secondary-text text-sm sm:text-base">Manage system updates</p>
      </div>
      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={settings.auto_update_enabled === true}
            onChange={(e) => handleChange('auto_update_enabled', e.target.checked)}
            className="w-5 h-5 text-primary-accent rounded focus:ring-primary-accent"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-primary-text block">Auto Update</span>
            <span className="text-xs text-secondary-text">Automatically install updates when available</span>
          </div>
        </label>
        {settings.auto_update_enabled && (
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Update Channel</label>
            <select
              value={settings.update_channel || 'stable'}
              onChange={(e) => handleChange('update_channel', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="stable">Stable</option>
              <option value="beta">Beta</option>
              <option value="alpha">Alpha</option>
            </select>
          </div>
        )}
        {settings.last_update_check && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-secondary-text">
              Last Update Check: {new Date(settings.last_update_check).toLocaleString()}
            </p>
          </div>
        )}
        <Button
          variant="outline"
          onClick={() => handleChange('last_update_check', new Date().toISOString())}
          className="flex items-center gap-2"
        >
          <IoRefresh size={18} />
          Check for Updates
        </Button>
      </div>
    </div>
  )
}

// Access Permission Settings Component
const AccessPermissionSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary-text mb-2">Access Permission Settings</h1>
        <p className="text-secondary-text text-sm sm:text-base">Configure access permissions and role-based access control</p>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Access permissions are managed through the Roles & Permissions system.
            Configure user roles and their permissions to control access to different features.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">Default Role</label>
          <select
            value={settings.default_role || 'employee'}
            onChange={(e) => handleChange('default_role', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
          >
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={settings.enable_two_factor === true}
              onChange={(e) => handleChange('enable_two_factor', e.target.checked)}
              className="w-5 h-5 text-primary-accent rounded focus:ring-primary-accent"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-primary-text block">Enable Two-Factor Authentication</span>
              <span className="text-xs text-secondary-text">Require 2FA for admin users</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}

// Client Portal Settings Component
const ClientPortalSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary-text mb-2">Client Portal Settings</h1>
        <p className="text-secondary-text text-sm sm:text-base">Configure client portal access and features</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={settings.client_portal_enabled === true}
              onChange={(e) => handleChange('client_portal_enabled', e.target.checked)}
              className="w-5 h-5 text-primary-accent rounded focus:ring-primary-accent"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-primary-text block">Enable Client Portal</span>
              <span className="text-xs text-secondary-text">Allow clients to access their portal</span>
            </div>
          </label>
        </div>
        {settings.client_portal_enabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Portal URL</label>
              <Input
                type="text"
                value={settings.client_portal_url || ''}
                onChange={(e) => handleChange('client_portal_url', e.target.value)}
                placeholder="https://portal.example.com"
              />
            </div>
            <div>
              <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={settings.client_can_view_invoices === true}
                  onChange={(e) => handleChange('client_can_view_invoices', e.target.checked)}
                  className="w-5 h-5 text-primary-accent rounded focus:ring-primary-accent"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-primary-text block">Allow Clients to View Invoices</span>
                </div>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={settings.client_can_view_projects === true}
                  onChange={(e) => handleChange('client_can_view_projects', e.target.checked)}
                  className="w-5 h-5 text-primary-accent rounded focus:ring-primary-accent"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-primary-text block">Allow Clients to View Projects</span>
                </div>
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Sales & Prospects Settings Component
const SalesProspectsSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary-text mb-2">Sales & Prospects Settings</h1>
        <p className="text-secondary-text text-sm sm:text-base">Configure sales pipeline and prospect management</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">Default Sales Pipeline Stages</label>
          <div className="space-y-2">
            {['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'].map((stage, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-sm text-primary-text">{stage}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={settings.auto_convert_lead === true}
              onChange={(e) => handleChange('auto_convert_lead', e.target.checked)}
              className="w-5 h-5 text-primary-accent rounded focus:ring-primary-accent"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-primary-text block">Auto Convert Leads to Clients</span>
              <span className="text-xs text-secondary-text">Automatically convert leads when they make a purchase</span>
            </div>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">Default Lead Source</label>
          <Input
            type="text"
            value={settings.default_lead_source || ''}
            onChange={(e) => handleChange('default_lead_source', e.target.value)}
            placeholder="Website, Referral, etc."
          />
        </div>
      </div>
    </div>
  )
}

// Setup Settings Component
const SetupSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary-text mb-2">Setup Settings</h1>
        <p className="text-secondary-text text-sm sm:text-base">Initial setup and configuration</p>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Setup wizard has been completed. You can modify these settings from their respective sections.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">System Status</label>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <IoCheckmarkCircle className="text-green-600" size={20} />
              <span className="text-sm text-green-800">System is fully configured and operational</span>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">Database Status</label>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-800">Database connection is active</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Plugins Settings Component
const PluginsSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary-text mb-2">Plugins Settings</h1>
        <p className="text-secondary-text text-sm sm:text-base">Manage installed plugins and extensions</p>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-secondary-text mb-4">No plugins installed</p>
          <Button variant="outline" className="flex items-center gap-2">
            <IoAdd size={18} />
            Install Plugin
          </Button>
        </div>
        <div>
          <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={settings.auto_update_plugins === true}
              onChange={(e) => handleChange('auto_update_plugins', e.target.checked)}
              className="w-5 h-5 text-primary-accent rounded focus:ring-primary-accent"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-primary-text block">Auto Update Plugins</span>
              <span className="text-xs text-secondary-text">Automatically update plugins when new versions are available</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}

export default Settings

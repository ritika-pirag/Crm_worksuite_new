import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { settingsAPI } from '../api'

const SettingsContext = createContext()

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    // Company Information
    company_name: 'Developo',
    company_email: 'company@example.com',
    company_phone: '+1 234 567 8900',
    company_address: '',
    company_website: 'https://example.com',
    company_logo: '',

    // System Settings
    system_name: 'Developo',
    default_currency: 'USD',
    default_timezone: 'UTC',
    date_format: 'Y-m-d',
    time_format: 'H:i',
    session_timeout: 30,
    max_file_size: 10,
    allowed_file_types: 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png',

    // Localization
    default_language: 'en',
    date_format_localization: 'Y-m-d',
    time_format_localization: 'H:i',
    timezone_localization: 'UTC',
    currency_symbol_position: 'before',

    // UI Options
    theme_mode: 'light',
    font_family: 'Inter',
    primary_color: '#3b82f6',
    secondary_color: '#64748b',
    sidebar_style: 'default',
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Currency symbols map
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    AED: 'د.إ',
    SAR: '﷼',
    JPY: '¥',
    CNY: '¥',
    AUD: 'A$',
    CAD: 'C$',
  }

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const companyId = user.companyId || user.company_id || null

      const response = await settingsAPI.get({ company_id: companyId })
      if (response.data.success && response.data.data) {
        const fetchedSettings = {}
        response.data.data.forEach(setting => {
          fetchedSettings[setting.setting_key] = setting.setting_value
        })
        setSettings(prev => ({ ...prev, ...fetchedSettings }))
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load settings on mount
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Format date according to settings
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '--'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString

      const format = settings.date_format_localization || settings.date_format || 'Y-m-d'

      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()

      switch (format) {
        case 'Y-m-d':
          return `${year}-${month}-${day}`
        case 'm/d/Y':
          return `${month}/${day}/${year}`
        case 'd/m/Y':
          return `${day}/${month}/${year}`
        case 'd-m-Y':
          return `${day}-${month}-${year}`
        default:
          return `${year}-${month}-${day}`
      }
    } catch {
      return dateString
    }
  }, [settings.date_format_localization, settings.date_format])

  // Format time according to settings
  const formatTime = useCallback((dateString) => {
    if (!dateString) return '--'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString

      const format = settings.time_format_localization || settings.time_format || 'H:i'

      if (format === 'h:i A') {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      } else {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      }
    } catch {
      return dateString
    }
  }, [settings.time_format_localization, settings.time_format])

  // Format datetime according to settings
  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return '--'
    return `${formatDate(dateString)} ${formatTime(dateString)}`
  }, [formatDate, formatTime])

  // Format currency according to settings
  const formatCurrency = useCallback((amount, currencyCode = null) => {
    const currency = currencyCode || settings.default_currency || 'USD'
    const symbol = currencySymbols[currency] || currency
    const position = settings.currency_symbol_position || 'before'
    const formattedAmount = parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })

    if (position === 'after') {
      return `${formattedAmount}${symbol}`
    }
    return `${symbol}${formattedAmount}`
  }, [settings.default_currency, settings.currency_symbol_position])

  // Get currency symbol
  const getCurrencySymbol = useCallback((currencyCode = null) => {
    const currency = currencyCode || settings.default_currency || 'USD'
    return currencySymbols[currency] || currency
  }, [settings.default_currency])

  // Update a single setting
  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  // Update multiple settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  // Refresh settings from server
  const refreshSettings = useCallback(() => {
    return fetchSettings()
  }, [fetchSettings])

  // Get company info
  const getCompanyInfo = useCallback(() => {
    return {
      name: settings.company_name || 'Developo',
      email: settings.company_email || '',
      phone: settings.company_phone || '',
      address: settings.company_address || '',
      website: settings.company_website || '',
      logo: settings.company_logo || '',
    }
  }, [settings])

  // Check if file type is allowed
  const isFileTypeAllowed = useCallback((filename) => {
    const allowedTypes = (settings.allowed_file_types || 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png').split(',')
    const ext = filename.split('.').pop()?.toLowerCase()
    return allowedTypes.includes(ext)
  }, [settings.allowed_file_types])

  // Check if file size is within limit
  const isFileSizeAllowed = useCallback((sizeInBytes) => {
    const maxSize = (settings.max_file_size || 10) * 1024 * 1024 // Convert MB to bytes
    return sizeInBytes <= maxSize
  }, [settings.max_file_size])

  const value = {
    settings,
    loading,
    error,
    formatDate,
    formatTime,
    formatDateTime,
    formatCurrency,
    getCurrencySymbol,
    updateSetting,
    updateSettings,
    refreshSettings,
    getCompanyInfo,
    isFileTypeAllowed,
    isFileSizeAllowed,
    currencySymbols,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export default SettingsContext

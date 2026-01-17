/**
 * Settings Context
 * Provides global settings management with formatters for currency, date, and time
 * All settings are company-specific (based on logged-in admin's companyId)
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { settingsAPI, companiesAPI } from '../api'
import BaseUrl from '../api/baseUrl'

const SettingsContext = createContext()

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export const SettingsProvider = ({ children }) => {
  // Company Information
  const [company, setCompany] = useState({
    id: null,
    name: 'Developo',
    email: '',
    phone: '',
    website: '',
    address: '',
    logo: '',
  })

  // System Settings
  const [settings, setSettings] = useState({
    system_name: 'Developo',
    default_currency: 'USD',
    default_timezone: 'UTC',
    date_format: 'Y-m-d',
    time_format: 'H:i',
    currency_symbol_position: 'before',
    theme_mode: 'light',
    primary_color: '#217E45',
    secondary_color: '#76AF88',
    font_family: 'Inter, sans-serif',
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
    PKR: '₨',
    BDT: '৳',
    MYR: 'RM',
    SGD: 'S$',
    THB: '฿',
    PHP: '₱',
    IDR: 'Rp',
    VND: '₫',
  }

  // Timezone options
  const timezoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New York (EST)' },
    { value: 'America/Chicago', label: 'America/Chicago (CST)' },
    { value: 'America/Denver', label: 'America/Denver (MST)' },
    { value: 'America/Los_Angeles', label: 'America/Los Angeles (PST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
    { value: 'Europe/Berlin', label: 'Europe/Berlin (CET)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)' },
  ]

  // Date format options
  const dateFormatOptions = [
    { value: 'Y-m-d', label: 'YYYY-MM-DD (2024-01-15)', example: '2024-01-15' },
    { value: 'm/d/Y', label: 'MM/DD/YYYY (01/15/2024)', example: '01/15/2024' },
    { value: 'd/m/Y', label: 'DD/MM/YYYY (15/01/2024)', example: '15/01/2024' },
    { value: 'd-m-Y', label: 'DD-MM-YYYY (15-01-2024)', example: '15-01-2024' },
    { value: 'd.m.Y', label: 'DD.MM.YYYY (15.01.2024)', example: '15.01.2024' },
    { value: 'M d, Y', label: 'Jan 15, 2024', example: 'Jan 15, 2024' },
    { value: 'd M Y', label: '15 Jan 2024', example: '15 Jan 2024' },
  ]

  // Time format options
  const timeFormatOptions = [
    { value: 'H:i', label: '24 Hour (14:30)', example: '14:30' },
    { value: 'h:i A', label: '12 Hour (02:30 PM)', example: '02:30 PM' },
  ]

  // Fetch company info and settings
  const fetchCompanyAndSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const companyId = localStorage.getItem('companyId') || 1

      // Fetch company info
      try {
        const companyResponse = await companiesAPI.getById(companyId)
        if (companyResponse.data.success && companyResponse.data.data) {
          const companyData = companyResponse.data.data
          setCompany({
            id: companyData.id,
            name: companyData.name || 'Developo',
            email: companyData.email || '',
            phone: companyData.phone || '',
            website: companyData.website || '',
            address: companyData.address || '',
            logo: companyData.logo || '',
          })
        }
      } catch (err) {
        console.error('Error fetching company:', err)
      }

      // Fetch settings
      try {
        const settingsResponse = await settingsAPI.get({ company_id: companyId })
        if (settingsResponse.data.success && settingsResponse.data.data) {
          const fetchedSettings = {}
          settingsResponse.data.data.forEach(setting => {
            try {
              // Try to parse JSON values
              if (setting.setting_value && (setting.setting_value.startsWith('{') || setting.setting_value.startsWith('['))) {
                fetchedSettings[setting.setting_key] = JSON.parse(setting.setting_value)
              } else {
                fetchedSettings[setting.setting_key] = setting.setting_value
              }
            } catch (e) {
              fetchedSettings[setting.setting_key] = setting.setting_value
            }
          })

          // Merge company info from settings if available
          if (fetchedSettings.company_name) {
            setCompany(prev => ({
              ...prev,
              name: fetchedSettings.company_name || prev.name,
              email: fetchedSettings.company_email || prev.email,
              phone: fetchedSettings.company_phone || prev.phone,
              website: fetchedSettings.company_website || prev.website,
              address: fetchedSettings.company_address || prev.address,
              logo: fetchedSettings.company_logo || prev.logo,
            }))
          }

          setSettings(prev => ({
            ...prev,
            ...fetchedSettings
          }))
        }
      } catch (err) {
        console.error('Error fetching settings:', err)
      }

    } catch (err) {
      console.error('Error in fetchCompanyAndSettings:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load on mount
  useEffect(() => {
    fetchCompanyAndSettings()
  }, [fetchCompanyAndSettings])

  /**
   * Format date according to settings
   * @param {string|Date} dateString - Date to format
   * @param {boolean} includeTimezone - Whether to adjust for timezone
   * @returns {string} Formatted date string
   */
  const formatDate = useCallback((dateString, includeTimezone = true) => {
    if (!dateString) return '--'
    
    try {
      let date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString

      // Apply timezone if needed
      if (includeTimezone && settings.default_timezone && settings.default_timezone !== 'UTC') {
        try {
          const options = { timeZone: settings.default_timezone }
          const localeDateString = date.toLocaleDateString('en-US', options)
          date = new Date(localeDateString)
        } catch (e) {
          // Fallback to original date if timezone conversion fails
        }
      }

      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthName = monthNames[date.getMonth()]

      const format = settings.date_format || 'Y-m-d'

      switch (format) {
        case 'Y-m-d':
          return `${year}-${month}-${day}`
        case 'm/d/Y':
          return `${month}/${day}/${year}`
        case 'd/m/Y':
          return `${day}/${month}/${year}`
        case 'd-m-Y':
          return `${day}-${month}-${year}`
        case 'd.m.Y':
          return `${day}.${month}.${year}`
        case 'M d, Y':
          return `${monthName} ${day}, ${year}`
        case 'd M Y':
          return `${day} ${monthName} ${year}`
        default:
          return `${year}-${month}-${day}`
      }
    } catch (e) {
      console.error('Error formatting date:', e)
      return dateString
    }
  }, [settings.date_format, settings.default_timezone])

  /**
   * Format time according to settings
   * @param {string|Date} dateString - Date/time to format
   * @param {boolean} includeTimezone - Whether to adjust for timezone
   * @returns {string} Formatted time string
   */
  const formatTime = useCallback((dateString, includeTimezone = true) => {
    if (!dateString) return '--'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString

      const format = settings.time_format || 'H:i'

      if (includeTimezone && settings.default_timezone) {
        try {
          const options = { 
            timeZone: settings.default_timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: format === 'h:i A'
          }
          return date.toLocaleTimeString('en-US', options)
        } catch (e) {
          // Fallback
        }
      }

      if (format === 'h:i A') {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      } else {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      }
    } catch (e) {
      console.error('Error formatting time:', e)
      return dateString
    }
  }, [settings.time_format, settings.default_timezone])

  /**
   * Format datetime according to settings
   * @param {string|Date} dateString - Date/time to format
   * @returns {string} Formatted datetime string
   */
  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return '--'
    return `${formatDate(dateString)} ${formatTime(dateString)}`
  }, [formatDate, formatTime])

  /**
   * Format currency according to settings
   * @param {number} amount - Amount to format
   * @param {string} currencyCode - Optional currency code override
   * @returns {string} Formatted currency string
   */
  const formatCurrency = useCallback((amount, currencyCode = null) => {
    const currency = currencyCode || settings.default_currency || 'USD'
    const symbol = currencySymbols[currency] || currency
    const position = settings.currency_symbol_position || 'before'
    
    const numAmount = parseFloat(amount || 0)
    const formattedAmount = numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })

    if (position === 'after') {
      return `${formattedAmount} ${symbol}`
    }
    return `${symbol}${formattedAmount}`
  }, [settings.default_currency, settings.currency_symbol_position])

  /**
   * Get currency symbol
   * @param {string} currencyCode - Optional currency code override
   * @returns {string} Currency symbol
   */
  const getCurrencySymbol = useCallback((currencyCode = null) => {
    const currency = currencyCode || settings.default_currency || 'USD'
    return currencySymbols[currency] || currency
  }, [settings.default_currency])

  /**
   * Get company logo URL
   * @returns {string} Full URL to company logo
   */
  const getCompanyLogoUrl = useCallback(() => {
    if (!company.logo) return null
    if (company.logo.startsWith('http') || company.logo.startsWith('blob:') || company.logo.startsWith('data:')) {
      return company.logo
    }
    return `${BaseUrl}${company.logo.startsWith('/') ? '' : '/'}${company.logo}`
  }, [company.logo])

  /**
   * Update company info
   * @param {object} newCompanyInfo - New company data
   */
  const updateCompany = useCallback((newCompanyInfo) => {
    setCompany(prev => ({ ...prev, ...newCompanyInfo }))
  }, [])

  /**
   * Update a single setting
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   */
  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  /**
   * Update multiple settings
   * @param {object} newSettings - New settings object
   */
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  /**
   * Refresh all settings from server
   */
  const refreshSettings = useCallback(() => {
    return fetchCompanyAndSettings()
  }, [fetchCompanyAndSettings])

  /**
   * Get company info
   * @returns {object} Company information
   */
  const getCompanyInfo = useCallback(() => {
    return {
      id: company.id,
      name: company.name || settings.company_name || 'Developo',
      email: company.email || settings.company_email || '',
      phone: company.phone || settings.company_phone || '',
      website: company.website || settings.company_website || '',
      address: company.address || settings.company_address || '',
      logo: company.logo || settings.company_logo || '',
      logoUrl: getCompanyLogoUrl(),
    }
  }, [company, settings, getCompanyLogoUrl])

  /**
   * Convert date to timezone
   * @param {string|Date} dateString - Date to convert
   * @returns {Date} Date in target timezone
   */
  const toTimezone = useCallback((dateString) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null
      
      if (settings.default_timezone) {
        const options = { timeZone: settings.default_timezone }
        return new Date(date.toLocaleString('en-US', options))
      }
      return date
    } catch (e) {
      return new Date(dateString)
    }
  }, [settings.default_timezone])

  const value = {
    // Company info
    company,
    updateCompany,
    getCompanyInfo,
    getCompanyLogoUrl,

    // Settings
    settings,
    loading,
    error,
    updateSetting,
    updateSettings,
    refreshSettings,

    // Formatters
    formatDate,
    formatTime,
    formatDateTime,
    formatCurrency,
    getCurrencySymbol,
    toTimezone,

    // Options for selects
    currencySymbols,
    timezoneOptions,
    dateFormatOptions,
    timeFormatOptions,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export default SettingsContext

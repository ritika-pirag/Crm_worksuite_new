import { createContext, useContext, useState, useEffect } from 'react'
import { translations, languages } from '../locales'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to 'en'
    return localStorage.getItem('app_language') || 'en'
  })

  const [direction, setDirection] = useState('ltr')

  // Get translation function
  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        // Fallback to English if key not found
        value = translations['en']
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object') {
            value = value[fallbackKey]
          } else {
            return key // Return key if not found in any language
          }
        }
        break
      }
    }
    
    return value || key
  }

  // Change language
  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setLanguage(langCode)
      localStorage.setItem('app_language', langCode)
      
      // Set direction for RTL languages (Arabic)
      const langInfo = languages.find(l => l.code === langCode)
      const newDirection = langInfo?.dir || 'ltr'
      setDirection(newDirection)
      
      // Apply direction to document
      document.documentElement.dir = newDirection
      document.documentElement.lang = langCode
    }
  }

  // Initialize direction on mount
  useEffect(() => {
    const langInfo = languages.find(l => l.code === language)
    const dir = langInfo?.dir || 'ltr'
    setDirection(dir)
    document.documentElement.dir = dir
    document.documentElement.lang = language
  }, [language])

  // Listen for settings changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'app_language' && e.newValue) {
        setLanguage(e.newValue)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const value = {
    language,
    direction,
    languages,
    t,
    changeLanguage,
    isRTL: direction === 'rtl'
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export default LanguageContext

import { useState, useRef, useEffect } from 'react'
import { IoChevronDown, IoCheckmark } from 'react-icons/io5'

const LanguageDropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useRef(null)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [position, setPosition] = useState({ top: 0, right: 0 })

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'cs', name: 'Czech', flag: '🇨🇿' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Calculate position based on navbar height (80px) + small margin
      setPosition({ top: 88, right: 16 })
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="fixed w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      style={{ zIndex: 10000, maxHeight: 'calc(100vh - 6rem)', overflowY: 'auto', top: `${position.top}px`, right: `${position.right}px` }}
    >
      <div className="p-2">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => {
              setSelectedLanguage(language.code)
              onClose()
            }}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-primary-text hover:bg-sidebar-hover rounded-xl transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{language.flag}</span>
              <span className="font-medium">{language.name}</span>
            </div>
            {selectedLanguage === language.code && (
              <IoCheckmark size={18} className="text-primary-accent" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default LanguageDropdown


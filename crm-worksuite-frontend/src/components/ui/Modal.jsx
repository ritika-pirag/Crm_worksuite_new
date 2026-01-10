import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IoClose } from 'react-icons/io5'

/**
 * Clean Center Modal Component - RISE CRM Style
 * Fixed compact width, centered
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose()
      }
      document.addEventListener('keydown', handleEscape)

      return () => {
        document.body.style.overflow = originalOverflow || ''
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Fixed pixel widths for consistency
  const getMaxWidth = () => {
    switch (size) {
      case 'sm': return '500px'
      case 'md': return '700px'
      case 'lg': return '900px'
      case 'xl': return '1100px'
      case 'full': return '1300px'
      default: return '700px'
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Centered Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal Box */}
        <div
          className="relative bg-white rounded-lg shadow-2xl w-full"
          style={{ maxWidth: getMaxWidth() }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Content */}
          <div
            className="px-5 py-4 overflow-y-auto"
            style={{ maxHeight: 'calc(95vh - 100px)' }}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-200 bg-gray-50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default Modal

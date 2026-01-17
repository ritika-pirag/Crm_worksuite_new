import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IoClose } from 'react-icons/io5'

/**
 * Clean Center Modal Component - Developo Style
 * Fixed compact width, centered, fully responsive
 */
const RightSideModal = ({ isOpen, onClose, title, children, width, size }) => {
  const contentRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      // Scroll content to top when modal opens
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = 0
        }
      }, 10)

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

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain"
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
      <div className="flex min-h-full items-start justify-center p-2 sm:p-4 pt-4 sm:pt-10 md:pt-20">
        {/* Modal Box - Responsive width */}
        <div
          className="relative bg-white rounded-lg shadow-2xl w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] my-2 sm:my-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-5 py-2.5 sm:py-3.5 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg z-10">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 truncate pr-2">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 sm:p-1 rounded hover:bg-gray-100 flex-shrink-0"
            >
              <IoClose className="w-5 h-5 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 overflow-y-auto overflow-x-hidden"
            style={{ maxHeight: 'calc(85vh - 80px)' }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default RightSideModal


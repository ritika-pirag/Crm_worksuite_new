import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IoClose } from 'react-icons/io5'

/**
 * Clean Center Modal Component - Developo Style
 * Fixed compact width, centered - ignores large width props
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
      <div className="flex min-h-full items-start justify-center p-4 pt-20">
        {/* Modal Box - Fixed 800px width max */}
        <div
          className="relative bg-white rounded-lg shadow-2xl w-full"
          style={{ maxWidth: '800px' }}
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
            ref={contentRef}
            className="px-5 py-4 overflow-y-auto"
            style={{ maxHeight: 'calc(90vh - 120px)' }}
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


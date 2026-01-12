import React, { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Modal overlay backdrop
 */
export function ModalOverlay({ className, onClick }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
        'animate-in fade-in-0',
        className
      )}
      onClick={onClick}
      aria-hidden="true"
    />
  )
}

/**
 * Modal content container
 */
export function ModalContent({
  children,
  className,
  size = 'default',
  ...props
}) {
  const sizeClasses = {
    sm: 'max-w-sm',
    default: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-[90vw] max-h-[85vh]',
  }

  return (
    <div
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2',
        'bg-white rounded-xl shadow-xl',
        'animate-in fade-in-0 zoom-in-95',
        sizeClasses[size] || sizeClasses.default,
        className
      )}
      role="dialog"
      aria-modal="true"
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Modal header with optional close button
 */
export function ModalHeader({
  children,
  className,
  onClose,
  showClose = true
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-4 border-b border-gray-200',
        className
      )}
    >
      <div className="text-lg font-semibold text-gray-900">{children}</div>
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Fermer</span>
        </button>
      )}
    </div>
  )
}

/**
 * Modal body content
 */
export function ModalBody({ children, className }) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  )
}

/**
 * Modal footer for actions
 */
export function ModalFooter({ children, className }) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl',
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Main Modal component
 *
 * @example
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} size="lg">
 *   <ModalHeader onClose={() => setIsOpen(false)}>Titre</ModalHeader>
 *   <ModalBody>Contenu</ModalBody>
 *   <ModalFooter>
 *     <Button onClick={() => setIsOpen(false)}>Fermer</Button>
 *   </ModalFooter>
 * </Modal>
 */
export function Modal({
  open,
  onClose,
  children,
  size = 'default',
  className,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) {
  // Handle escape key
  const handleEscape = useCallback((event) => {
    if (event.key === 'Escape' && closeOnEscape) {
      onClose?.()
    }
  }, [closeOnEscape, onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, handleEscape])

  if (!open) return null

  return (
    <>
      <ModalOverlay onClick={closeOnOverlayClick ? onClose : undefined} />
      <ModalContent size={size} className={className}>
        {children}
      </ModalContent>
    </>
  )
}

/**
 * Confirmation modal helper component
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirmation',
  message = 'Êtes-vous sûr ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'default', // 'default' | 'danger'
}) {
  const confirmButtonClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-blue-600 hover:bg-blue-700 text-white'

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalHeader onClose={onClose}>{title}</ModalHeader>
      <ModalBody>
        <p className="text-gray-600">{message}</p>
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm?.()
            onClose?.()
          }}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            confirmButtonClass
          )}
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  )
}

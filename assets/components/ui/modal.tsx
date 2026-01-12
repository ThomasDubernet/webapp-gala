import React, { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

type ModalSize = 'sm' | 'default' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'

interface ModalOverlayProps {
  className?: string
  onClick?: () => void
}

export function ModalOverlay({ className, onClick }: ModalOverlayProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm',
        'animate-in fade-in-0',
        className
      )}
      onClick={onClick}
      aria-hidden="true"
    />
  )
}

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ModalSize
}

export function ModalContent({
  children,
  className,
  size = 'default',
  ...props
}: ModalContentProps) {
  const sizeClasses: Record<ModalSize, string> = {
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
        'fixed left-1/2 top-1/2 z-[100] w-full -translate-x-1/2 -translate-y-1/2',
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

interface ModalHeaderProps {
  children: React.ReactNode
  className?: string
  onClose?: () => void
  showClose?: boolean
}

export function ModalHeader({
  children,
  className,
  onClose,
  showClose = true
}: ModalHeaderProps) {
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

interface ModalBodyProps {
  children: React.ReactNode
  className?: string
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  )
}

interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
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

interface ModalProps {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
  size?: ModalSize
  className?: string
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  title?: string
}

export function Modal({
  open,
  onClose,
  children,
  size = 'default',
  className,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  title,
}: ModalProps) {
  const handleEscape = useCallback((event: KeyboardEvent) => {
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
        {title && <ModalHeader onClose={onClose}>{title}</ModalHeader>}
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </>
  )
}

interface ConfirmModalProps {
  open: boolean
  onClose?: () => void
  onConfirm?: () => void
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirmation',
  message = 'Êtes-vous sûr ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'default',
}: ConfirmModalProps) {
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

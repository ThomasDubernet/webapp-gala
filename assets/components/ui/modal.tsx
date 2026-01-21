import React, { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

type ModalSize = 'sm' | 'default' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'

interface ModalOverlayProps {
  className?: string
  onClick?: () => void
}

export function ModalOverlay({
  className,
  onClick,
  priority = false,
}: ModalOverlayProps & { priority?: boolean }) {
  return (
    <div
      className={cn(
        'fixed inset-0 bg-black/50 backdrop-blur-sm',
        'animate-in fade-in-0',
        priority ? 'z-[9999]' : 'z-[100]',
        className,
      )}
      onClick={onClick}
      aria-hidden="true"
    />
  )
}

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ModalSize
  priority?: boolean
}

export function ModalContent({
  children,
  className,
  size = 'default',
  priority = false,
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
        'fixed left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2',
        'bg-card text-card-foreground rounded-xl shadow-xl',
        'animate-in fade-in-0 zoom-in-95',
        priority ? 'z-[9999]' : 'z-[100]',
        sizeClasses[size] || sizeClasses.default,
        className,
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
  showClose = true,
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-4 border-b border-border',
        className,
      )}
    >
      <div className="text-lg font-semibold text-foreground">{children}</div>
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors"
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
  return <div className={cn('p-6', className)}>{children}</div>
}

interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted rounded-b-xl',
        className,
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
  priority?: boolean
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
  priority = false,
}: ModalProps) {
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose?.()
      }
    },
    [closeOnEscape, onClose],
  )

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

  return createPortal(
    <>
      <ModalOverlay
        onClick={closeOnOverlayClick ? onClose : undefined}
        priority={priority}
      />
      <ModalContent size={size} className={className} priority={priority}>
        {title && <ModalHeader onClose={onClose}>{title}</ModalHeader>}
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </>,
    document.body,
  )
}

interface ConfirmModalProps {
  open: boolean
  onClose?: () => void
  onConfirm?: () => void
  onCancel?: () => void
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
  onCancel,
  title = 'Confirmation',
  message = 'Êtes-vous sûr ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'default',
}: ConfirmModalProps) {
  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
      : 'bg-primary hover:bg-primary/90 text-primary-foreground'

  const handleCancel = () => {
    onCancel?.()
    onClose?.()
  }

  return (
    <Modal open={open} onClose={onClose} size="sm" priority={true}>
      <ModalHeader onClose={onClose}>{title}</ModalHeader>
      <ModalBody>
        <p className="text-muted-foreground">{message}</p>
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleCancel()
          }}
          className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-lg hover:bg-accent transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation()
            await onConfirm?.()
            onClose?.()
          }}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            confirmButtonClass,
          )}
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  )
}

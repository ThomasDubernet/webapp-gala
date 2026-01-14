import React, { createContext, useContext, useState, useCallback } from 'react'

interface PersonneDialogState {
  open: boolean
  id?: number
  tableId?: number
  conjointOf?: number
}

interface TableDialogState {
  open: boolean
  id?: number
}

interface DialogContextType {
  // Personne dialog
  personneDialogState: PersonneDialogState
  openPersonneDialog: (id?: number, options?: { tableId?: number; conjointOf?: number }) => void
  closePersonneDialog: () => void

  // Table dialog
  tableDialogState: TableDialogState
  openTableDialog: (id?: number) => void
  closeTableDialog: () => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [personneDialogState, setPersonneDialogState] = useState<PersonneDialogState>({
    open: false,
  })
  const [tableDialogState, setTableDialogState] = useState<TableDialogState>({
    open: false,
  })

  const openPersonneDialog = useCallback(
    (id?: number, options?: { tableId?: number; conjointOf?: number }) => {
      setPersonneDialogState({
        open: true,
        id,
        tableId: options?.tableId,
        conjointOf: options?.conjointOf,
      })
    },
    []
  )

  const closePersonneDialog = useCallback(() => {
    setPersonneDialogState({ open: false })
  }, [])

  const openTableDialog = useCallback((id?: number) => {
    setTableDialogState({ open: true, id })
  }, [])

  const closeTableDialog = useCallback(() => {
    setTableDialogState({ open: false })
  }, [])

  return (
    <DialogContext.Provider
      value={{
        personneDialogState,
        openPersonneDialog,
        closePersonneDialog,
        tableDialogState,
        openTableDialog,
        closeTableDialog,
      }}
    >
      {children}
    </DialogContext.Provider>
  )
}

export function useDialogs() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useDialogs must be used within a DialogProvider')
  }
  return context
}

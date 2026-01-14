import React, { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Loader2, Search, X } from 'lucide-react'
import { AppSidebar } from '../app-sidebar'
import { useSearchPersonnes } from '../../hooks'
import { PersonCard } from '../PersonCard'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../ui/sidebar'

// Search Modal Component
function SearchModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [stringToSearch, setStringToSearch] = useState('')

  const {
    results: filteredStudents,
    loading,
    total,
    hasSearched,
    refresh,
  } = useSearchPersonnes({
    searchQuery: stringToSearch,
    minChars: 2,
  })

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStringToSearch(event.target.value)
  }

  const handleClose = () => {
    refresh()
    onClose()
    setStringToSearch('')
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed top-20 left-6 right-6 bottom-6 bg-card z-[100] rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col border border-border">
        <button
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground bg-background border border-input hover:bg-accent rounded-full transition-colors shadow-sm"
          onClick={handleClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Search input */}
        <div className="mb-6">
          <Input
            type="search"
            placeholder="Rechercher une personne..."
            aria-label="Rechercher"
            value={stringToSearch}
            onChange={handleSearch}
            autoFocus
            className="text-lg"
          />
        </div>

        <h3 className="text-xl font-bold text-foreground text-center mb-6">
          Personnes
          {total > 0 && (
            <Badge variant="secondary" className="ml-2">
              {total} résultat{total > 1 ? 's' : ''}
            </Badge>
          )}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start overflow-y-auto flex-1">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map((personne) => (
              <PersonCard
                key={personne.id}
                personne={personne}
                onRefresh={refresh}
                variant="default"
              />
            ))
          ) : hasSearched ? (
            <div className="col-span-full text-center text-muted-foreground py-8">
              Aucune personne ne correspond à votre recherche
            </div>
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-8">
              Tapez au moins 2 caractères pour rechercher
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export function AppLayout() {
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const isPlanPage = location.pathname === '/plan' || location.pathname === '/'

  // Keyboard shortcut ⌘+K to open search
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault()
      setSearchOpen(true)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          {/* Search input */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-1 items-center gap-2 h-9 max-w-md rounded-md border border-input bg-background px-3 text-sm text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Rechercher...</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </header>

        <div className={'flex flex-1 flex-col gap-4 p-4'}>
          <Outlet />
        </div>
      </SidebarInset>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </SidebarProvider>
  )
}

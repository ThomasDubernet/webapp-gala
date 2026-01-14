import React, { useMemo, useState, useEffect, useCallback, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { X, Loader2, MoreHorizontal, Pencil, Trash2, Search } from 'lucide-react'
import { useSearchPersonnes } from '../hooks'
import { PersonCard } from './PersonCard'
import { ConfirmModal } from './ui/modal'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { apiPut, apiRequest } from '../lib/api'
import { Kbd } from './ui/kbd'
import type { Personne as PersonneType } from '../types/api'

interface PersonneProps {
  isHotesse?: boolean
  personne: PersonneType
  children?: ReactNode
}

export function Personne({ isHotesse = false, personne, children }: PersonneProps) {
  const [person, setPerson] = useState<PersonneType>(personne)
  const [awaitingCheckedValue, setAwaitingCheckedValue] = useState<boolean | null>(null)
  const {
    id,
    prenom,
    nom,
    adresse,
    codePostal,
    ville,
    email,
    table,
    montantBillet,
    montantPaye,
    present: isPresent,
    smsSended,
  } = useMemo(() => person, [person])

  const [openModal, setOpenModal] = useState(false)

  const isPayed = useMemo(
    () => montantBillet !== null && montantBillet !== undefined && montantBillet === montantPaye,
    [montantBillet, montantPaye],
  )

  const updatePresence = async (presence: boolean | null, withSms: boolean) => {
    try {
      const data = await apiPut<PersonneType>(`/api/personnes/${id}/update-presence`, {
        present: presence ?? !isPresent,
        withSms,
      })
      setPerson(data)
    } catch (error) {
      console.warn('ERROR_PRESENT_CHANGE_01', error)
    }
  }

  const handleCheckboxChange = async (event: { target: { checked: boolean } }) => {
    const newCheckValue = event.target.checked

    if (smsSended) {
      setAwaitingCheckedValue(newCheckValue)
      setOpenModal(true)
    } else {
      await updatePresence(newCheckValue, false)
    }
  }

  return (
    <>
      <ConfirmModal
        open={openModal}
        onClose={() => {
          setAwaitingCheckedValue(null)
          setOpenModal(false)
        }}
        onConfirm={() => {
          updatePresence(awaitingCheckedValue, true)
        }}
        title="Confirmation"
        message="Confirmer cette action ?"
        confirmText="Oui"
        cancelText="Non"
      />
      {isHotesse ? (
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h5 className="font-semibold text-foreground">{prenom} {nom}</h5>
            </div>
            {isPayed ? (
              <Badge variant="success">Payé</Badge>
            ) : (
              <Badge variant="destructive">Non payé</Badge>
            )}
            <a
              href={`/personne/${id}/edit`}
              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </a>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Table</dt>
              <dd className="text-foreground">{table ? `Table n°${table.numero}` : 'Non assignée'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd><a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Adresse</dt>
              <dd className="text-right text-foreground">{adresse}, {codePostal} {ville}</dd>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <dt className="text-muted-foreground">Présent ?</dt>
              <dd>
                <Checkbox
                  checked={isPresent || false}
                  onChange={handleCheckboxChange}
                />
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm relative">
          <div className={`absolute top-2 left-2 w-3 h-3 rounded-full ${isPayed ? 'bg-green-500' : 'bg-destructive'}`} />
          <div className="flex items-start justify-between mb-2 pl-4">
            <div>
              <h5 className="font-semibold text-foreground">{prenom}</h5>
              <h5 className="font-semibold text-foreground">{nom}</h5>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-1.5 text-muted-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href={`/personne/${id}/edit`} className="flex items-center gap-2">
                    <Pencil className="h-4 w-4" />
                    Editer la fiche
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground pl-4">
            <p>{table ? `Table n°${table.numero}` : 'Pas de table'}</p>
            <a href={`mailto:${email}`} className="text-primary hover:underline block">{email}</a>
            <p>{adresse}<br />{codePostal} {ville}</p>
          </div>
          {children}
        </div>
      )}
    </>
  )
}

interface PersonneProviderProps {
  personne: PersonneType
  load: () => void
  isHotesse?: boolean
}

export function PersonneProvider({ personne, load, isHotesse = false }: PersonneProviderProps) {
  const handleChange = async () => {
    const checked = !!personne.present
    try {
      await apiPut(`/api/personnes/${personne.id}`, { present: !checked })
      load()
      if (!checked === true) {
        await apiRequest(`/api/personnes/${personne.id}/sms`)
      }
    } catch (error) {
      console.warn('ERROR_PRESENCE_CHANGE', error)
    }
  }

  return (
    <Personne personne={personne} isHotesse={isHotesse}>
      {!isHotesse && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
          <Checkbox
            checked={!!personne.present}
            onChange={handleChange}
          />
          <span className="text-sm text-muted-foreground">Présent ?</span>
        </div>
      )}
    </Personne>
  )
}

export function SearchBar() {
  const [activeModal, setActiveModal] = useState(false)
  const [stringToSearch, setStringToSearch] = useState('')

  // Detect if user is on Mac
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

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

  const handleClose = useCallback(() => {
    refresh()
    setActiveModal(false)
    setStringToSearch('')
  }, [refresh])

  const handleOpen = useCallback(() => {
    setActiveModal(true)
  }, [])

  // Keyboard shortcut ⌘+K to open search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setActiveModal((prev) => !prev)
      }
      // Close on Escape
      if (event.key === 'Escape' && activeModal) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeModal, handleClose])

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full items-center gap-2 h-9 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Rechercher...</span>
        <Kbd>{isMac ? '⌘K' : 'Ctrl+K'}</Kbd>
      </button>
      {activeModal && (
          <div className="fixed top-20 left-6 right-6 bottom-6 bg-card z-[100] rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col border border-border">
            <button
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground bg-background border border-input hover:bg-accent rounded-full transition-colors shadow-sm"
              onClick={handleClose}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>

          {/* Search input in modal */}
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
      )}
    </>
  )
}

class SearchElement extends HTMLElement {
  connectedCallback() {
    const root = createRoot(this)
    root.render(<SearchBar />)
  }
}

customElements.define('custom-searchbar', SearchElement)

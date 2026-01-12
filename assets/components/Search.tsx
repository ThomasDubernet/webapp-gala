import React, { useMemo, useState, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { X, Loader2 } from 'lucide-react'
import { useSearchPersonnes } from '../hooks'
import { PersonCard } from './PersonCard'
import { ConfirmModal } from './ui/modal'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'
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
      const response = await fetch(`/api/personnes/${id}/update-presence`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          present: presence ?? !isPresent,
          withSms,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPerson(data)
      }
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
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h5 className="font-semibold text-gray-900">{prenom} {nom}</h5>
            </div>
            {isPayed ? (
              <Badge variant="success">Payé</Badge>
            ) : (
              <Badge variant="destructive">Non payé</Badge>
            )}
            <a
              href={`/personne/${id}/edit`}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </a>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Table</dt>
              <dd className="text-gray-900">{table ? `Table n°${table.numero}` : 'Non assignée'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd><a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Adresse</dt>
              <dd className="text-right text-gray-900">{adresse}, {codePostal} {ville}</dd>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <dt className="text-gray-500">Présent ?</dt>
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
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative">
          <div className={`absolute top-2 left-2 w-3 h-3 rounded-full ${isPayed ? 'bg-green-500' : 'bg-red-500'}`} />
          <div className="flex items-start justify-between mb-2 pl-4">
            <div>
              <h5 className="font-semibold text-gray-900">{prenom}</h5>
              <h5 className="font-semibold text-gray-900">{nom}</h5>
            </div>
            <div className="relative">
              <button
                type="button"
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={(e) => {
                  const menu = e.currentTarget.nextElementSibling as HTMLElement
                  menu?.classList.toggle('hidden')
                }}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3 9.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
                </svg>
              </button>
              <div className="hidden absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <a
                  href={`/personne/${id}/edit`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Editer la fiche
                </a>
                <hr className="my-1 border-gray-200" />
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-sm text-gray-600 pl-4">
            <p>{table ? `Table n°${table.numero}` : 'Pas de table'}</p>
            <a href={`mailto:${email}`} className="text-blue-600 hover:underline block">{email}</a>
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
  const handleChange = () => {
    const checked = !!personne.present
    fetch(`/api/personnes/${personne.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        present: !checked,
      }),
    }).then((response) => {
      if (response.ok) {
        load()
        if (!checked === true) {
          fetch(`/api/personnes/${personne.id}/sms`)
        }
      }
    })
  }

  return (
    <Personne personne={personne} isHotesse={isHotesse}>
      {!isHotesse && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
          <Checkbox
            checked={!!personne.present}
            onChange={handleChange}
          />
          <span className="text-sm text-gray-600">Présent ?</span>
        </div>
      )}
    </Personne>
  )
}

export function SearchBar() {
  const [activeModal, setActiveModal] = useState(false)
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
    setActiveModal(false)
    setStringToSearch('')
  }

  return (
    <>
      <input
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        type="search"
        placeholder="Rechercher"
        aria-label="Rechercher"
        value={stringToSearch}
        onFocus={() => setActiveModal(true)}
        onChange={handleSearch}
      />
      {activeModal && (
          <div className="fixed top-20 left-6 right-6 bottom-6 bg-white z-[100] rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col border border-gray-200">
            <button
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-full transition-colors shadow-sm"
              onClick={handleClose}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
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
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
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
              <div className="col-span-full text-center text-gray-500 py-8">
                Aucune personne ne correspond à votre recherche
              </div>
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
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

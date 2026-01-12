import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Loader2 } from 'lucide-react'
import { useSearchPersonnes } from '../hooks'
import { PersonCard } from './PersonCard'
import { Badge } from './ui/badge'

function HotessePage() {
  const [stringToSearch, setStringToSearch] = useState('')

  const {
    results: filteredPersonnes,
    loading,
    total,
    hasSearched,
    refresh,
  } = useSearchPersonnes({
    searchQuery: stringToSearch,
    minChars: 2,
    loadOnEmpty: true,
    limit: 500, // Charger toutes les personnes par défaut
  })

  const handleSearch = (event) => {
    setStringToSearch(event.target.value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="h-20 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center gap-4">
          <img className="h-14 flex-shrink-0" src="/logo-2.jpeg" alt="logo" />
          <input
            className="flex-1 max-w-md px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            type="search"
            placeholder="Rechercher une personne..."
            aria-label="Rechercher"
            value={stringToSearch}
            onChange={handleSearch}
          />
        </div>
      </nav>

      {/* Stats bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Badge variant="secondary">
            {total} résultat{total > 1 ? 's' : ''}
          </Badge>
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          )}
        </div>
      </div>

      {/* Results grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
          {filteredPersonnes.length > 0
            ? filteredPersonnes.map((personne) => (
                <PersonCard
                  key={personne.id}
                  personne={personne}
                  onRefresh={refresh}
                  variant="fullpage"
                />
              ))
            : null}
        </div>
        {filteredPersonnes.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            {hasSearched
              ? 'Aucune personne ne correspond à votre recherche'
              : stringToSearch.length > 0 && stringToSearch.length < 2
                ? 'Tapez au moins 2 caractères pour rechercher'
                : 'Aucune personne enregistrée'}
          </div>
        )}
      </div>
    </div>
  )
}

class HotesseElement extends HTMLElement {
  connectedCallback() {
    const root = createRoot(this)
    root.render(<HotessePage />)
  }
}

customElements.define('hotesse-search', HotesseElement)

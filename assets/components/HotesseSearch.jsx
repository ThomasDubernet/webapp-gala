import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useSearchPersonnes } from '../hooks'
import { PersonCard } from './PersonCard'

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
    loadOnEmpty: true, // Charge tous les résultats quand la recherche est vide
  })

  const handleSearch = (event) => {
    setStringToSearch(event.target.value)
  }

  return (
    <div id="hotesse-search">
      <nav className="navbar-custom">
        <div className="container-custom">
          <img className="logo" src="/logo-2.jpeg" alt="logo" />
          <input
            className="form-control"
            type="search"
            placeholder="Rechercher"
            aria-label="Rechercher"
            value={stringToSearch}
            onChange={handleSearch}
          />
        </div>
      </nav>
      <div className="px-4 py-2">
        <span className="badge bg-secondary">
          {total} résultat{total > 1 ? 's' : ''}
        </span>
        {loading && (
          <span className="spinner-border spinner-border-sm ms-2" role="status">
            <span className="visually-hidden">Chargement...</span>
          </span>
        )}
      </div>
      <div className="grid-personnes px-4">
        {filteredPersonnes.length > 0
          ? filteredPersonnes.map((personne) => (
              <PersonCard
                key={personne.id}
                personne={personne}
                onRefresh={refresh}
                variant="fullpage"
              />
            ))
          : hasSearched
            ? 'Aucune personne ne correspond à votre recherche'
            : stringToSearch.length > 0 && stringToSearch.length < 2
              ? 'Tapez au moins 2 caractères pour rechercher'
              : 'Aucune personne enregistrée'}
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

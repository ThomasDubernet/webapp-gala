import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useDebounce, useGetMany } from '../hooks'
import { PersonneProvider } from './Search'

function HotessePage() {
  const { items, load } = useGetMany('personnes')
  const [filteredPersonnes, setFilteredPersonnes] = useState([])
  const [stringToSearch, setStringToSearch] = useState('')
  const debouncedSearch = useDebounce(stringToSearch, 300)

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    items.forEach((item) => {
      item.fullname = `${item.prenom} ${item.nom}`
    })

    if (debouncedSearch !== '' && debouncedSearch.length >= 2) {
      const searchLower = debouncedSearch.toLowerCase()
      const result = items.filter((personne) => {
        const email = personne.email || ''
        const telephone = personne.telephone || ''
        const ville = personne.ville || ''
        return (
          personne.fullname.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower) ||
          telephone.toLowerCase().includes(searchLower) ||
          ville.toLowerCase().includes(searchLower)
        )
      })
      setFilteredPersonnes(result)
    } else if (debouncedSearch === '') {
      setFilteredPersonnes(items)
    } else {
      setFilteredPersonnes([])
    }
  }, [items, debouncedSearch])

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
      {debouncedSearch.length >= 2 && (
        <div className="px-4 py-2">
          <span className="badge bg-secondary">
            {filteredPersonnes.length} résultat
            {filteredPersonnes.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
      <div className="grid-personnes px-4">
        {filteredPersonnes.length > 0
          ? filteredPersonnes.map((personne) => (
              <PersonneProvider
                key={personne.id}
                personne={personne}
                load={load}
                isHotesse
              />
            ))
          : debouncedSearch.length >= 2
            ? 'Aucune personne ne correspond à votre recherche'
            : debouncedSearch.length > 0
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

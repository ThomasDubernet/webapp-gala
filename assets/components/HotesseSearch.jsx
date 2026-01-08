import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useGetMany } from '../hooks'
import { PersonneProvider } from './Search'

function HotessePage() {
  const { items, load } = useGetMany('personnes')
  const [filteredPersonnes, setFilteredPersonnes] = useState([])
  const [stringToSearch, setStringToSearch] = useState('')

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    items.forEach((item) => {
      item.fullname = `${item.prenom} ${item.nom}`
    })

    if (stringToSearch !== '' && stringToSearch.length > 2) {
      const searchLower = stringToSearch.toLowerCase()
      const result = items.filter((personne) => {
        const email = personne.email || ''
        return (
          personne.fullname.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower)
        )
      })
      setFilteredPersonnes(result)
    } else {
      // setFilteredPersonnes([])
      setFilteredPersonnes(items)
    }
  }, [items])

  const handleSearch = (event) => {
    const { value } = event.target
    setStringToSearch(value)
    if (value.length > 2) {
      const searchLower = value.toLowerCase()
      const result = items.filter((personne) => {
        const email = personne.email || ''
        return (
          personne.fullname.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower)
        )
      })
      setFilteredPersonnes(result)
    } else {
      setFilteredPersonnes([])
    }
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
          : `Aucune personne ne correspond à votre recherches ${
              window.innerWidth ?? '0000'
            }px`}
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

import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'
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
      // eslint-disable-next-line no-param-reassign
      item.fullname = `${item.prenom} ${item.nom}`
    })

    if (stringToSearch !== '' && stringToSearch.length > 2) {
      const result = items.filter((personne) =>
        personne.fullname.toLowerCase().includes(stringToSearch.toLowerCase())
      )
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
      const result = items.filter((personne) =>
        personne.fullname.toLowerCase().includes(value.toLowerCase())
      )
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
    render(<HotessePage />, this)
  }
}

customElements.define('hotesse-search', HotesseElement)

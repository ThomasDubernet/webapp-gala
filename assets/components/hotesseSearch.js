import React from 'react'
import { useEffect, useState } from 'react'
import { render } from 'react-dom'
import { useGetMany } from '../hooks'
import { PersonneProvider } from './search'

const HotessePage = () => {
    const { items, load } = useGetMany('personnes')
    const [ filteredPersonnes, setFilteredPersonnes ] = useState([])
    const [ stringToSearch, setStringToSearch ] = useState('')

    useEffect(() => {
        load()
    }, [])

    useEffect(() => {
        items.forEach(item => {
            item.fullname = item.prenom + " " + item.nom
        })
        console.log(items)

        if (stringToSearch !== '') {
          const result = items.filter(personne => personne.fullname.toLowerCase().includes(stringToSearch.toLowerCase()))
          setFilteredPersonnes(result)
        } else {
          setFilteredPersonnes(items)
        }
    }, [items])

    const handleSearch = (event) => {
      const { value } = event.target
      setStringToSearch(value)
      const result = items.filter(personne => personne.fullname.toLowerCase().includes(value.toLowerCase()))
      setFilteredPersonnes(result)
    }

    return (
        <React.Fragment>
            <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom position-fixed w-100" style={{top: 0}}>
                <div className="container h-100 d-flex">
                    <img className="h-100" src="/logo-2.jpeg" alt="logo" />
                    <input className="form-control me-2 w-50 ml-auto" type="search" placeholder="Rechercher" aria-label="Rechercher" value={stringToSearch} onChange={handleSearch} />
                </div>
            </nav>
            <div className="grid-personnes">
                {filteredPersonnes.length > 0 ?
                    filteredPersonnes.map((personne, index) => (
                        <PersonneProvider key={index} personne={personne} load={load} />
                    ))
                    : "Aucune personne ne correspond à votre recherche"
                }
            </div>
        </React.Fragment>
    )
}

class HotesseElement extends HTMLElement {
    connectedCallback() {
      render(<HotessePage />, this)
    }
  }
  
customElements.define('hotesse-search', HotesseElement)
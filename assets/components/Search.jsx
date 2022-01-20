import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'
import { useGetMany } from '../hooks'

export function Personne({ personne, children }) {
  const [payed, setPayed] = useState(false)
  const {
    id,
    prenom,
    nom,
    adresse,
    codePostal,
    ville,
    email,
    ticket: { fichier: filename },
    table,
    montantBillet,
    montantPaye,
  } = personne

  useEffect(() => {
    if (montantBillet !== null && montantBillet == montantPaye) {
      setPayed(true)
    }
  }, [personne])

  return (
    <div className="card-personne">
      <div className={`bubble bg-${payed ? 'success' : 'danger'}`} />
      <div className="header">
        <div className="fullname">
          <h5>{prenom}</h5>
          <h5>{nom}</h5>
        </div>
        <div className="ml-auto btn-group dropstart">
          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-secondary"
              type="button"
              id="dropdownPersonneButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-three-dots" />
            </button>
            <div
              className="dropdown-menu"
              aria-labelledby="dropdownPersonneButton"
            >
              <div className="d-flex align-items-center flex-column">
                <a className="m-2 dropdown-item" href={`/personne/${id}/edit`}>
                  Editer la fiche
                </a>
                <a className="m-2 dropdown-item" href={`/email/${id}`}>
                  Renvoyer le billet
                </a>
                <a
                  className="m-2 dropdown-item"
                  target="_blank"
                  href={`/uploads/${filename}`}
                  rel="noreferrer"
                >
                  Imprimer le billet
                </a>
                <hr className="w-100" />
                <button type="button" className="m-2 btn btn-danger">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {table !== null ? <p>Table n°{table.numero}</p> : <p>Pas de table</p>}
      <a href={`mailto:${email}`}>{email}</a>
      <p>
        {adresse}
        <br />
        {codePostal} {ville}
      </p>

      {children}
    </div>
  )
}

export function PersonneProvider({ personne, load }) {
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
      }
    })
  }

  return (
    <Personne personne={personne}>
      <div style={{ marginTop: '0' }} className="d-flex align-items-center">
        <p className="m-0">Présent ?</p>
        <input
          style={{ marginLeft: '10px' }}
          type="checkbox"
          name="presence"
          checked={!!personne.present}
          onChange={handleChange}
        />
      </div>
    </Personne>
  )
}

function Search() {
  const { items: personnes, load } = useGetMany('personnes')
  const [filteredStudents, setFilteredStudents] = useState([])
  const [activeModal, setActiveModal] = useState(false)
  const [stringToSearch, setStringToSearch] = useState('')

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    personnes.forEach((item) => {
      item.fullname = `${item.prenom} ${item.nom}`
    })

    if (stringToSearch !== '') {
      const result = personnes.filter((personne) =>
        personne.fullname.toLowerCase().includes(stringToSearch.toLowerCase())
      )
      setFilteredStudents(result)
    } else {
      setFilteredStudents(personnes)
    }
  }, [personnes])

  const handleSearch = (event) => {
    const { value } = event.target
    setStringToSearch(value)
    const result = personnes.filter((personne) =>
      personne.fullname.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredStudents(result)
  }

  const handleClose = () => {
    load()
    setActiveModal(false)
    setStringToSearch('')
  }

  return (
    <>
      <input
        className="form-control me-2"
        type="search"
        placeholder="Rechercher"
        aria-label="Rechercher"
        value={stringToSearch}
        onFocus={() => setActiveModal(true)}
        onChange={handleSearch}
      />
      {activeModal && (
        <div className="modal-results-personnes">
          <button
            className="btn btn-outline-secondary close btn-modal-close"
            onClick={handleClose}
            type="button"
          >
            <i className="bi bi-x-lg" />
          </button>
          <h3 className="title">Personnes</h3>
          <div className="content">
            {filteredStudents.length > 0
              ? filteredStudents.map((personne) => (
                  <PersonneProvider
                    key={personne.id}
                    personne={personne}
                    load={load}
                  />
                ))
              : 'Aucune personne ne correspond à votre recherche'}
          </div>
        </div>
      )}
    </>
  )
}

class SearchElement extends HTMLElement {
  connectedCallback() {
    render(<Search />, this)
  }
}

customElements.define('custom-searchbar', SearchElement)

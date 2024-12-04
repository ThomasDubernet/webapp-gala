import React, { useEffect, useMemo, useState } from 'react'
import { render } from 'react-dom'
import { useGetMany } from '../hooks'

export function Personne({ isHotesse = false, personne, children }) {
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
  } = personne

  const isPayed = useMemo(
    () => montantBillet !== null && montantBillet === montantPaye,
    [montantBillet, montantPaye]
  )

  const handleCheckboxChange = async (event) => {
    try {
      await fetch(`/api/personnes/${id}/update-presence`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          present: event.target.checked,
        }),
      })
    } catch (error) {
      console.warn('ERROR_PRESENT_CHANGE_01', error)
    }

    // const checked = !!personne.present
    // fetch(`/api/personnes/${personne.id}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     present: !checked,
    //   }),
    // }).then((response) => {
    //   if (response.ok) {
    //     load()
    //     if (!checked === true) {
    //       fetch(`/api/personnes/${personne.id}/sms`)
    //     }
    //   }
    // })
  }

  return isHotesse ? (
    <div className="grid-item-personne">
      <div className="grid-item-header">
        <div>
          <h5>{prenom}</h5>
          <h5>{nom}</h5>
        </div>
        {isPayed ? (
          <div className="success-badge">Payé</div>
        ) : (
          <div className="error-badge">Non payé</div>
        )}
        <div className="grid-item-edit-btn-wrapper">
          <a href={`/personne/${id}/edit`} className="grid-item-edit-link">
            <i className="bi bi-pencil" />
          </a>
        </div>
      </div>
      <div className="grid-item-content">
        <dl>
          <div>
            <dt>Table</dt>
            <dd>
              {table !== null ? `Table n°${table.numero}` : 'Non assignée'}
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${email}`}>{email}</a>
            </dd>
          </div>
          <div>
            <dt>Adresse</dt>
            <dd>
              {adresse},<br /> {codePostal} {ville}
            </dd>
          </div>
          <div>
            <dt>Présent ?</dt>
            <dd>
              <input
                type="checkbox"
                defaultChecked={isPresent}
                onChange={handleCheckboxChange}
              />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  ) : (
    <div className="card-personne">
      <div className={`bubble bg-${isPayed ? 'success' : 'danger'}`} />
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
                {/* <a className="m-2 dropdown-item" href={`/email/${id}`}>
                  Renvoyer le billet
                </a>
                <a
                  className="m-2 dropdown-item"
                  target="_blank"
                  href={`/uploads/${filename}`}
                  rel="noreferrer"
                >
                  Imprimer le billet
                </a> */}
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

export function PersonneProvider({ personne, load, isHotesse = false }) {
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
      )}
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

    if (stringToSearch !== '' && stringToSearch.length > 2) {
      const result = personnes.filter((personne) =>
        personne.fullname.toLowerCase().includes(stringToSearch.toLowerCase())
      )
      setFilteredStudents(result)
    } else {
      setFilteredStudents([])
    }
  }, [personnes])

  const handleSearch = (event) => {
    const { value } = event.target
    setStringToSearch(value)
    if (value.length > 2) {
      const result = personnes.filter((personne) =>
        personne.fullname.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredStudents(result)
    } else {
      setFilteredStudents([])
    }
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

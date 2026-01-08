import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Box, Button, Checkbox, Modal, Typography } from '@mui/material'
import { useDebounce, useGetMany } from '../hooks'

export function Personne({ isHotesse = false, personne, children }) {
  const [person, setPerson] = useState(personne)
  const [awaitingCheckedValue, setAwaitingCheckedValue] = useState(null)
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
    () => montantBillet !== null && montantBillet === montantPaye,
    [montantBillet, montantPaye],
  )

  const updatePresence = async (presence, withSms) => {
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

  const handleCheckboxChange = async (event) => {
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
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Confirmer cette action ?
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 3,
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setAwaitingCheckedValue(null)
                setOpenModal(false)
              }}
            >
              Non
            </Button>
            <Button
              variant="outlined"
              color="success"
              onClick={() => {
                updatePresence(awaitingCheckedValue, true)
                setOpenModal(false)
              }}
            >
              Oui
            </Button>
          </Box>
        </Box>
      </Modal>
      {isHotesse ? (
        <div
          className="grid-item-personne"
          style={{ marginTop: '0 !important' }}
        >
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
                  <Checkbox
                    type="checkbox"
                    checked={isPresent || false}
                    onChange={handleCheckboxChange}
                    sx={{
                      padding: '5px',
                      transform: 'scale(1.3)',
                    }}
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
                    <a
                      className="m-2 dropdown-item"
                      href={`/personne/${id}/edit`}
                    >
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
          {table ? <p>Table n°{table.numero}</p> : <p>Pas de table</p>}
          <a href={`mailto:${email}`}>{email}</a>
          <p>
            {adresse}
            <br />
            {codePostal} {ville}
          </p>

          {children}
        </div>
      )}
    </>
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
  const debouncedSearch = useDebounce(stringToSearch, 300)

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (debouncedSearch !== '' && debouncedSearch.length >= 2) {
      const searchLower = debouncedSearch.toLowerCase()
      const result = personnes.filter((personne) => {
        const fullname = `${personne.prenom} ${personne.nom}`
        const email = personne.email || ''
        const telephone = personne.telephone || ''
        const ville = personne.ville || ''
        return (
          fullname.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower) ||
          telephone.toLowerCase().includes(searchLower) ||
          ville.toLowerCase().includes(searchLower)
        )
      })
      setFilteredStudents(result)
    } else {
      setFilteredStudents([])
    }
  }, [personnes, debouncedSearch])

  const handleSearch = (event) => {
    setStringToSearch(event.target.value)
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
          <h3 className="title">
            Personnes
            {filteredStudents.length > 0 && (
              <span className="badge bg-secondary ms-2">
                {filteredStudents.length} résultat
                {filteredStudents.length > 1 ? 's' : ''}
              </span>
            )}
          </h3>
          <div className="content">
            {filteredStudents.length > 0
              ? filteredStudents.map((personne) => (
                  <PersonneProvider
                    key={personne.id}
                    personne={personne}
                    load={load}
                  />
                ))
              : debouncedSearch.length >= 2
                ? 'Aucune personne ne correspond à votre recherche'
                : 'Tapez au moins 2 caractères pour rechercher'}
          </div>
        </div>
      )}
    </>
  )
}

class SearchElement extends HTMLElement {
  connectedCallback() {
    const root = createRoot(this)
    root.render(<Search />)
  }
}

customElements.define('custom-searchbar', SearchElement)

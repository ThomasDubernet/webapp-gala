import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'
import { useGetMany } from '../hooks'

export const Personne = ({personne, children}) => {
  const [payed, setPayed] = useState(false)
  console.log(personne)
  const {
    id,
    prenom,
    nom,
    adresse,
    codePostal,
    ville,
    email,
    ticket: {
      id: ticketId,
      fichier: filename
    },
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
      <div className={"bubble bg-" + (payed ? 'success' : "danger")}></div>
      <div className="header">
        <div className="fullname">
          <h5>{prenom}</h5>
          <h5>{nom}</h5>
        </div>
        <div className="ml-auto btn-group dropstart">
            <div className="dropdown">
                <button className="btn btn-sm btn-outline-secondary" type="button" id="dropdownPersonneButton" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="bi bi-three-dots"></i>
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownPersonneButton">
                  <div className="d-flex align-items-center flex-column">
                      <a className="m-2 dropdown-item" href={"/personne/" + id + "/edit"}>Editer la fiche</a>
                      <a className="m-2 dropdown-item" href={"/ticket/" + ticketId +"/send"}>Renvoyer le billet</a>
                      <a className="m-2 dropdown-item" target="_blank" href={"/uploads/" + filename}>Imprimer le billet</a>
                      <hr className="w-100" />
                      <button type="button" className="m-2 btn btn-danger">Supprimer</button>
                  </div>
              </div>
            </div>
        </div>
      </div>
      {table !== null ? <p>Table n°{table.numero}</p> : <p>Pas de table</p>}
      <a href={"mailto:" + email}>{email}</a>
      <p>{adresse}<br/>{codePostal} {ville}</p>

      {children}
    </div>
  )
}

const PersonneProvider = ({personne}) => {
  const [checked, setChecked] = useState(personne.present ? true : false)

  const handleChange = () => {
    fetch('/api/personnes/' + personne.id, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        present: !checked
      })
    })
    setChecked(!checked)
  }

  return (
    <Personne personne={personne}>
      <div style={{marginTop: "15px"}} className="d-flex align-items-center">
        <p>Présent ?</p>
        <input style={{marginLeft: "10px"}} type="checkbox" name="presence" checked={checked} onChange={handleChange} />
      </div>
    </Personne>
  )
}

const  Search = () => {
  const { items: personnes, load, loading } = useGetMany('personnes')
  const [ filteredStudents, setFilteredStudents ] = useState([])
  const [ activeModal, setActiveModal] = useState(false)

  useEffect(() => {
    load()
  }, [])
  
  useEffect(() => {
    personnes.forEach(item => {
      item.fullname = item.prenom + " " + item.nom
    })
    setFilteredStudents(personnes)
  }, [personnes])

  const handleSearch = (event) => {
    const { value } = event.target
    const result = personnes.filter(personne => personne.fullname.toLowerCase().includes(value.toLowerCase()))
    setFilteredStudents(result)
  }

  return (
    <React.Fragment>
      <input className="form-control me-2" type="search" placeholder="Rechercher" aria-label="Rechercher" onFocus={() => setActiveModal(true)} onChange={handleSearch} />
      {activeModal &&
        <div className="modal-results-personnes">
          <button className="btn btn-outline-secondary close" onClick={() => setActiveModal(false)}><i className="bi bi-x-lg"></i></button>
          <h3 className="title">Personnes</h3>
          <div className="content">
            {filteredStudents.length > 0 ?
              filteredStudents.map((personne, index) => (
                <PersonneProvider key={index} personne={personne} />
              ))
              : "Aucune personne ne correspond à votre recherche"
            }
          </div>
        </div>
      }
    </React.Fragment>
  )
}

class SearchElement extends HTMLElement {
  connectedCallback() {
    render(<Search />, this)
  }
}

customElements.define('custom-searchbar', SearchElement)
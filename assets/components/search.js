import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'
import { useGetMany } from '../hooks'

export const Personne = ({personne, children}) => {
  const {
    id,
    prenom,
    nom,
    adresse,
    email,
  } = personne

return (
  <div className="card-personne">
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
                    <a className="m-2 dropdown-item" href="#">Renvoyer le billet</a>
                    <a className="m-2 dropdown-item" href="#">Imprimer le billet</a>
                    <hr className="w-100" />
                    <button type="button" className="m-2 btn btn-danger">Supprimer</button>
                </div>
            </div>
          </div>
      </div>
    </div>
    <a href={"mailto:" + email}>{email}</a>
    <p>{adresse}</p>
    {children}
  </div>
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
                <Personne key={index} personne={personne} />
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
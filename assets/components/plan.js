import React, { useEffect, useRef, useState} from 'react'
import { ContextMenu, ContextMenuTrigger, MenuItem, SubMenu } from 'react-contextmenu'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { render } from 'react-dom'
import { useGetMany } from '../hooks'
import { Personne as SearchPersonne } from './search'

const Personne = ({personne}) => {
    const {
        id,
        prenom,
        nom
    } = personne

    return (
        <React.Fragment>
            <div className="d-flex align-items-center justify-content-between w-100 my-3 mx-0">
                <p className="m-0">{prenom + " " + nom}</p>
                <a className="link-three-dots" href={`/personne/${id}/edit`}><i className="bi bi-three-dots"></i></a>
            </div>
        </React.Fragment>
    )
}

const Table = ({table, load, ...props}) => {
    const submenuObject = useRef(null)
    const [open, setOpen] = useState(false)
    const [ filteredStudents, setFilteredStudents ] = useState([])
    const {
        id,
        nom,
        nombrePlacesMax: nbMax,
        numero,
        categorie: {
            id: idCat,
            couleur,
            nom: nomCat
        },
        personnes
    } = table
    const { items: allPersonnes, load: loadPersonnes, loading } = useGetMany(`personnes?exists[table]=false`)

    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)
    const handleSearch = (event) => {
        const { value } = event.target
        const result = allPersonnes.filter(personne => personne.fullname.toLowerCase().includes(value.toLowerCase()))
        setFilteredStudents(result)
    }
    function handleDelete() {
        fetch('/api/tables/' + id, {
            method: 'DELETE'
        })
        load()
    }

    useEffect(() => {
        loadPersonnes()

        const submenu = submenuObject.current.menu
        const chevron = document.createElement('i')
        chevron.className = 'bi bi-chevron-right'
        submenu.append(chevron)
    }, [])

    useEffect(() => {
        allPersonnes.forEach(item => {
        item.fullname = item.prenom + " " + item.nom
        })
        setFilteredStudents(allPersonnes)
    }, [allPersonnes])
    
    return (
        <React.Fragment>
            <ContextMenuTrigger id={"contextmenu-" + id}>
                <div
                    className="custom-table"
                    style={{background: couleur}}
                    onClick={() => console.log('left click')}
                >
                    <p className="number">N°{numero}</p>
                    <p className="number-max">
                    {personnes.length} / {nbMax}
                    </p>
                </div>
            </ContextMenuTrigger>

            <ContextMenu id={"contextmenu-" + id}>
                <SubMenu title="Personnes" hoverDelay={0} className="mr-auto custom-contextmenu" attributes={{className: 'custom-submenu'}} ref={submenuObject}>
                    <MenuItem disabled={personnes.length >= nbMax ? true : false} onClick={handleOpen}>
                        Ajouter une personne
                    </MenuItem>
                    <MenuItem disabled={personnes.length >= nbMax ? true : false}>
                        {personnes.length >= nbMax ? (
                            "Créer une personne"
                        ) : (
                            <a href={"/personne/new?table=" + id} className="no-style-link">Créer une personne</a>
                        )}
                    </MenuItem>
                    <hr />
                    <MenuItem className="no-hover scrollable">
                        <div className="list-personne-scrollable">
                            {personnes.length > 0
                                ? personnes.map((personne, index) => (
                                    <Personne key={index} personne={personne} />
                                ))
                                : <p style={{padding: '5px 10px'}}>Aucune personne</p>
                            }
                        </div>
                    </MenuItem>
                </SubMenu>
                <MenuItem>
                    Imprimer la liste des personnes
                </MenuItem>
                <hr />
                <div className="d-flex">
                    <button  onClick={() => window.confirm('Êtes vous sûr de vouloir supprimer cette table ?') && handleDelete()} className="btn btn-danger mx-auto" disabled={personnes.length > 0 ? true : false}>Supprimer la table</button>
                </div>
            </ContextMenu>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className="modal-add-personne">
                    <div className="d-flex align-items-center justify-content-between">
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            Personnes non affectées
                        </Typography>
                        <input className="form-control me-2 w-50" type="search" placeholder="Rechercher une personne" aria-label="Rechercher" onChange={handleSearch} />

                    </div>
                    <div className="mt-4 grid-search">
                        {filteredStudents.length > 0
                            ? filteredStudents.map((personne, index) => (
                                <SearchPersonne key={index} personne={personne} >
                                    <a className="btn btn-sm btn-outline-primary" href={`/personne/${personne.id}/add-table/${id}`}>Ajouter</a>
                                </SearchPersonne>
                            ))
                            : "Aucune personne ne correspond à votre recherche"
                        }
                    </div>
                </Box>
            </Modal>
        </React.Fragment>
    )
}

const Plan = () => {
    const { items: tables, load, loading } = useGetMany('tables')

    useEffect(() => {
        load()
    }, [])

    return !loading && (
        <React.Fragment>
            <div className="d-flex">
                {tables.length > 0
                    ? tables.map((table, index) => (
                        <Table key={index} table={table} load={load}/>
                    ))
                    : <p>Aucune table n'a été crée.</p>
                }
            </div>
        </React.Fragment>
    )
}

class PlanElement extends HTMLElement {
    connectedCallback() {
      render(<Plan />, this)
    }
  }
  
  customElements.define('custom-plan', PlanElement)
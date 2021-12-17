import React, { useEffect, useRef, useState} from 'react'
import { Personne as SearchPersonne } from './search'
import {
    Box,
    Menu,
    MenuItem,
    Modal,
    Typography
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useGetMany } from '../hooks'
import Draggable from 'react-draggable'

const CustomMenuItem = styled(MenuItem)`
    font-size: 14px;
    margin-bottom: .5rem;
`

const Table = ({table, load, ...props}) => {
    const submenu = useRef(null)
    
    const [ contextMenu, setContextMenu] = useState(null)

    const [open, setOpen] = useState(false)
    const [openSubMenu, setOpenSubMenu] = useState(false)
    const [posSubMenu, setPosSubMenu] = useState(null)

    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)
    const handleSubMenuOpen = () => setOpenSubMenu(true)
    
    const handleMenuClose = () => {
        setOpenSubMenu(false)
        setContextMenu(null)
    }
    
    const [ filteredStudents, setFilteredStudents ] = useState([])
    
    const { items: allPersonnes, load: loadPersonnes, loading } = useGetMany(`personnes?exists[table]=false`)
    const {
        id,
        nom,
        nombrePlacesMax: nbMax,
        numero,
        posX,
        posY,
        categorie: {
            id: idCat,
            couleur,
            nom: nomCat
        },
        personnes
    } = table

    const handleContextMenu = (event) => {
        event.preventDefault()
        setContextMenu(
            contextMenu === null
            ? {
                mouseX: event.clientX - 2,
                mouseY: event.clientY - 4,
                }
            : null
        )
    }

    const handleSearch = (event) => {
        const { value } = event.target
        const result = allPersonnes.filter(personne => personne.fullname.toLowerCase().includes(value.toLowerCase()))
        setFilteredStudents(result)
    }
    function handleDelete() {
        fetch('/api/tables/' + id, {
            method: 'DELETE'
        })
        setTimeout(() => {
            load()
        }, 1000)
    }

    const handleStop = (event, data) => {
        fetch(`/api/tables/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                posX: data.x,
                posY: data.y,
            })
        })
        setTimeout(() => {
            load()
        }, 300)
    }

    useEffect(() => {
        loadPersonnes()
    }, [])

    useEffect(() => {
        allPersonnes.forEach(item => {
        item.fullname = item.prenom + " " + item.nom
        })
        setFilteredStudents(allPersonnes)
    }, [allPersonnes])
    
    return (
        <React.Fragment>
            <Draggable
                defaultPosition={{
                    x: posX !== null ? posX : 750,
                    y: posY !== null ? posY : 350
                }}
                onStop={handleStop}
            >
                <div
                    className={`custom-table table-window-${id}`}
                    style={{background: couleur}}
                    onClick={() => removeDefaultClasse(this)}
                    onContextMenu={handleContextMenu}
                    
                >
                    <p className="number">T{numero}</p>
                    <p className="number-max">
                        {personnes.length} / {nbMax}
                    </p>
                    <p className='nom-table'>{nom}</p>
                </div>
            </Draggable>

            <Menu
                open={contextMenu !== null}
                onClose={handleMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <CustomMenuItem ref={submenu} onClick={handleSubMenuOpen}>
                    <div className="d-flex align-items-center justify-content-between w-100">
                        <span>Personnes</span>
                        <i className="bi bi-chevron-right"></i>
                    </div>
                </CustomMenuItem>
                {/* <CustomMenuItem><a className="no-style" href={"/table/" + id + "/pdf"} target="_blank">Imprimer la liste des personnes</a></CustomMenuItem> */}
                <hr />
                {/* <div className="d-flex"> */}
                <CustomMenuItem>
                    <a className="no-style" href={"/table/" + id + "/edit"}>Editer la table</a>
                </CustomMenuItem>
                {/* </div> */}
                <div className="d-flex">
                    <button style={{fontSize: "14px"}} onClick={() => window.confirm('Êtes vous sûr de vouloir supprimer cette table ?') && handleDelete()} className="btn btn-danger mx-auto" disabled={personnes.length > 0 ? true : false}>Supprimer la table</button>
                </div>
            </Menu>

            {/* SubMenu */}
            <Menu
                open={openSubMenu}
                onClose={handleMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    submenu.current !== null 
                    ?   {
                            top: submenu.current.getBoundingClientRect().top - 8,
                            left: submenu.current.getBoundingClientRect().right
                        }
                    : null
                }
            >
                <CustomMenuItem disabled={personnes.length >= nbMax ? true : false} onClick={handleOpen}>
                    Ajouter une personne
                </CustomMenuItem>
                <CustomMenuItem disabled={personnes.length >= nbMax ? true : false}>
                    {personnes.length >= nbMax ? (
                        "Créer une personne"
                    ) : (
                        <a href={"/personne/new?table=" + id} className="no-style-link">Créer une personne</a>
                    )}
                </CustomMenuItem>
                <hr />
                <CustomMenuItem className="no-hover scrollable">
                    <div className="list-personne-scrollable">
                        {personnes.length > 0
                            ? personnes.map((personne, index) => (
                                <Personne key={index} personne={personne} />
                            ))
                            : <p style={{padding: '5px 10px'}}>Aucune personne</p>
                        }
                    </div>
                </CustomMenuItem>
            </Menu>

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
                                    <a className="btn btn-sm btn-outline-primary" href={`/personne/${personne.id}/add_table/${id}`}>Ajouter</a>
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

const Personne = ({ personne: { prenom, nom, id } }) => (
    <div className="d-flex align-items-center justify-content-between w-100 my-3 mx-0">
        <p className="m-0">{prenom + " " + nom}</p>
        <a className="link-three-dots" href={`/personne/${id}/edit`}><i className="bi bi-three-dots"></i></a>
    </div>
)

export default Table

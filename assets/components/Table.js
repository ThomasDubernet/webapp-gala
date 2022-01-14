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

import { CircularProgressbarWithChildren } from 'react-circular-progressbar'

const CustomMenuItem = styled(MenuItem)`
    font-size: 14px;
    margin-bottom: .5rem;
`

const Table = ({table, load, plan}) => {
    const submenu = useRef(null)
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
    
    const [ contextMenu, setContextMenu] = useState(null)
    const [ loading, setLoading] = useState(true)
    const [ planRef, setPlanRef] = useState(null)
    const [ percentPresent, setPercentPresent] = useState(null)

    const [height, setHeight] = useState(null)

    const [ positionPx, setPositionPx ] = useState({
        x: null,
        y: null
    })
    const [ positionPercent, setPositionPercent ] = useState({
        x: posX,
        y: posY
    })

    const [open, setOpen] = useState(false)
    const [openSubMenu, setOpenSubMenu] = useState(false)

    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)
    const handleSubMenuOpen = () => setOpenSubMenu(true)
    
    const handleMenuClose = () => {
        setOpenSubMenu(false)
        setContextMenu(null)
    }
    
    const [ filteredStudents, setFilteredStudents ] = useState([])
    
    const { items: allPersonnes, load: loadPersonnes } = useGetMany(`personnes?exists[table]=false`)

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
    const handleStop = async (event, data) => {
        event.preventDefault()
        const { percentX, percentY } = PxToPercent({
            x: data.x,
            y: data.y
        })

        const response = await fetch(`/api/tables/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                posX: percentX,
                posY: percentY,
            })
        })
        const responseData =  await response.json()
        if (response.ok) {
            setPositionPercent({
                x: responseData.posX,
                y: responseData.posY
            })
        }
    }
    const PxToPercent = ({ x, y }) => {
        const planX = planRef.clientWidth
        const planY = planRef.clientHeight

        const percentX = parseFloat(x * 100 / planX).toPrecision(6)
        const percentY = parseFloat(y * 100 / planY).toPrecision(6)

        return { percentX, percentY }

    }
    const percentToPx = (percent, type) => {
        const planX = planRef.clientWidth
        const planY = planRef.clientHeight

        switch (type) {
            case 'width':
                return percent * planX / 100
            case 'height':
                return percent * planY / 100
            default:
                return
        }
    }
    const onWindowResize = () => {
        setLoading(true)
        setHeight(planRef.clientHeight * 0.0776)
        setPositionPx({
            x: percentToPx(positionPercent.x, 'width'),
            y: percentToPx(positionPercent.y, 'height')
        })
        setLoading(false)
    }

    useEffect(() => {
        setPercentPresent(table.personnes.length * 100 / table.nombrePlacesMax)

        loadPersonnes()
        if ( plan.current !== null ) {
            setPlanRef(plan.current)
            setHeight(plan.current.clientHeight * 0.0776)
        } else {
            const planElement = document.getElementById('img-box')
            setPlanRef(planElement)
            setHeight(planElement.clientHeight * 0.0776)
        }
    }, [])

    useEffect(() => {
        if ( planRef !== null ) {
            setPositionPx({
                x: percentToPx(positionPercent.x, 'width'),
                y: percentToPx(positionPercent.y, 'height')
            })
            window.addEventListener('resize', onWindowResize)
            setLoading(false)
        }

    }, [positionPercent, planRef])

    useEffect(() => {
        allPersonnes.forEach(item => {
        item.fullname = item.prenom + " " + item.nom
        })
        setFilteredStudents(allPersonnes)
    }, [allPersonnes])
    
    return !loading && (
        <React.Fragment>
            <Draggable
                defaultPosition={{
                    x: positionPx.x,
                    y: positionPx.y
                }}
                bounds="parent"
                offsetParent={planRef}
                onStop={handleStop}
            >
                    <div
                        className={`custom-table table-window-${id}`}
                        style={{
                            background: couleur,
                            width: height + 'px',
                            height: height + 'px'
                        }}
                        onContextMenu={handleContextMenu}
                        
                    >

                        <CircularProgressbarWithChildren
                            strokeWidth={4}
                            value={percentPresent}
                            styles={{
                                path: {
                                    stroke: "#000000"
                                }
                            }}
                        >
                            <p className="number">T{numero}</p>
                            <p className="number-max">
                                {personnes.length} / {nbMax}
                            </p>
                            <p className='nom-table'>{nom}</p>
                        </CircularProgressbarWithChildren>
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
                <CustomMenuItem>
                    <a className="no-style" href={"/table/" + id + "/edit"}>Editer la table</a>
                </CustomMenuItem>
                <div className="d-flex">
                    <button style={{fontSize: "14px"}} onClick={() => window.confirm('Êtes vous sûr de vouloir supprimer cette table ?') && handleDelete()} className="btn btn-danger mx-auto" disabled={personnes.length > 0 ? true : false}>Supprimer la table</button>
                </div>
            </Menu>

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
                                    <a className="btn btn-sm btn-outline-primary btn-add" href={`/personne/${personne.id}/add_table/${id}`}>Ajouter</a>
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

const Personne = ({ personne: { prenom, nom, id, present } }) => (
    <div className="d-flex align-items-center justify-content-between w-100 my-3 mx-0">
        <p className="m-0" style={{color: (present ? "#008000" : "#000000")}}>{prenom !== null ? prenom : null} {nom}</p>
        <a className="link-three-dots" href={`/personne/${id}/edit`}><i className="bi bi-three-dots"></i></a>
    </div>
)

export default Table

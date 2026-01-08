import React, { useEffect, useRef, useState } from 'react'
import { Box, Menu, Modal, Typography } from '@mui/material'
import Draggable from 'react-draggable'

import { CircularProgressbarWithChildren } from 'react-circular-progressbar'
import { Personne as SearchPersonne } from '../Search'
import { CustomMenuItem } from './tablesStyles'
import { useDebounce } from '../../hooks'

function Table({
  table,
  load,
  planSize: baseSize,
  planRef,
  allPersonnes,
  onPersonneAdded,
}) {
  const submenu = useRef(null)
  const {
    id,
    nom,
    nombrePlacesMax: nbMax,
    numero,
    posX,
    posY,
    personnes,
    categorie: { couleur },
  } = table

  const [loading, setLoading] = useState(true)

  /**
   * Menus
   */
  const [contextMenu, setContextMenu] = useState(null)
  const [open, setOpen] = useState(false)
  const [openSubMenu, setOpenSubMenu] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleSubMenuOpen = () => setOpenSubMenu(true)
  const handleClose = () => {
    setOpen(false)
    setStringToSearch('')
    setFilteredPersonnes([])
    if (hasAddedPersonne) {
      setHasAddedPersonne(false)
      load()
    }
  }
  const handleMenuClose = () => {
    setOpenSubMenu(false)
    setContextMenu(null)
  }
  const handleContextMenu = (event) => {
    event.preventDefault()
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
          }
        : null,
    )
  }

  /**
   * Tailles & positions
   */
  const [height, setHeight] = useState(null)
  const [positionPx, setPositionPx] = useState({ x: null, y: null })
  const [positionPercent, setPositionPercent] = useState({ x: posX, y: posY })
  const [planSize, setPlanSize] = useState(baseSize)

  /**
   * Personnes
   */
  // const { items: allPersonnes, load: loadPersonnes } = useGetMany(
  //   `personnes?exists[table]=false`
  // )
  const [filteredPersonnes, setFilteredPersonnes] = useState([])
  const [percentPresent, setPercentPresent] = useState(null)
  const [addingPersonneId, setAddingPersonneId] = useState(null)
  const [addedPersonneId, setAddedPersonneId] = useState(null)
  const [hasAddedPersonne, setHasAddedPersonne] = useState(false)
  const [stringToSearch, setStringToSearch] = useState('')
  const debouncedSearch = useDebounce(stringToSearch, 300)

  useEffect(() => {
    if (debouncedSearch !== '' && debouncedSearch.length >= 2) {
      const searchLower = debouncedSearch.toLowerCase()
      const result = allPersonnes.filter((personne) => {
        const email = personne.email || ''
        const telephone = personne.telephone || ''
        const ville = personne.ville || ''
        return (
          personne.fullname.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower) ||
          telephone.toLowerCase().includes(searchLower) ||
          ville.toLowerCase().includes(searchLower)
        )
      })
      setFilteredPersonnes(result)
    } else {
      setFilteredPersonnes([])
    }
  }, [allPersonnes, debouncedSearch])

  const handleSearch = (event) => {
    setStringToSearch(event.target.value)
  }

  const handleAddPersonne = async (personneId) => {
    setAddingPersonneId(personneId)

    try {
      const response = await fetch(`/personne/${personneId}/add_table/${id}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const text = await response.text()
        console.error('Erreur serveur:', response.status, text)

        alert(`Erreur serveur: ${response.status}`)
        return
      }

      const data = await response.json()

      if (data.success) {
        // Retirer de la liste filtrée immédiatement
        setFilteredPersonnes((prev) => prev.filter((p) => p.id !== personneId))
        // Notifier le parent
        onPersonneAdded(personneId)
        // Feedback visuel bref
        setAddedPersonneId(personneId)
        setTimeout(() => setAddedPersonneId(null), 1500)
        // Marquer qu'une personne a été ajoutée (load sera appelé à la fermeture)
        setHasAddedPersonne(true)
      } else {
        alert(data.error || "Erreur lors de l'ajout")
      }
    } catch (error) {
      console.error('Erreur réseau:', error)

      alert(`Erreur: ${error.message}`)
    } finally {
      setAddingPersonneId(null)
    }
  }
  const pxToPercent = ({ x, y }) => {
    const percentX = parseFloat((x * 100) / planSize.width).toPrecision(6)
    const percentY = parseFloat((y * 100) / planSize.height).toPrecision(6)

    return { percentX, percentY }
  }
  const percentToPx = (percent, type, size = null) => {
    let number = 0
    if (size == null) {
      switch (type) {
        case 'width':
          number = (percent * planSize.width) / 100
          break
        case 'height':
          number = (percent * planSize.height) / 100
          break
        default:
      }
    } else {
      switch (type) {
        case 'width':
          number = (percent * size.width) / 100
          break
        case 'height':
          number = (percent * size.height) / 100
          break
        default:
      }
    }
    return number
  }
  const onWindowResize = () => {
    setLoading(true)
    setHeight(planRef.current.clientHeight * 0.0776)
    const size = {
      width: planRef.current.clientWidth,
      height: planRef.current.clientHeight,
    }
    setPositionPx({
      x: percentToPx(positionPercent.x, 'width', size),
      y: percentToPx(positionPercent.y, 'height', size),
    })
    setLoading(false)
  }

  /**
   * API events
   */
  async function handleDelete() {
    await fetch(`/api/tables/${id}`, {
      method: 'DELETE',
    })
    load()
  }
  const handleStop = async (event, data) => {
    event.preventDefault()
    const { percentX, percentY } = pxToPercent({
      x: data.x,
      y: data.y,
    })

    const response = await fetch(`/api/tables/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        posX: percentX,
        posY: percentY,
      }),
    })
    const responseData = await response.json()
    if (response.ok) {
      setPositionPercent({
        x: responseData.posX,
        y: responseData.posY,
      })
    }
  }

  useEffect(() => {
    // loadPersonnes()
    setHeight(planSize.height * 0.0776)

    let personnesPresentes = 0
    table.personnes.forEach((personne) => {
      if (personne.present) {
        personnesPresentes += 1
      }
    })
    setPercentPresent((personnesPresentes * 100) / table.nombrePlacesMax)
  }, [])

  useEffect(() => {
    setPositionPx({
      x: percentToPx(positionPercent.x, 'width'),
      y: percentToPx(positionPercent.y, 'height'),
    })
    window.addEventListener('resize', onWindowResize)
    setLoading(false)

    return () => {
      window.removeEventListener('resize', onWindowResize)
    }
  }, [positionPercent])

  // useEffect(() => {
  //   allPersonnes.forEach((item) => {
  //     // eslint-disable-next-line no-param-reassign
  //     item.fullname = `${item.prenom} ${item.nom}`
  //   })
  // }, [allPersonnes])

  return (
    !loading && (
      <>
        <Draggable
          defaultPosition={{
            x: positionPx.x,
            y: positionPx.y,
          }}
          bounds="parent"
          offsetParent={planRef.current}
          onStop={handleStop}
        >
          <div
            className={`custom-table table-window-${id}`}
            style={{
              background: couleur,
              width: `${height}px`,
              height: `${height}px`,
            }}
            onContextMenu={handleContextMenu}
          >
            <CircularProgressbarWithChildren
              strokeWidth={4}
              value={percentPresent}
              styles={{
                path: {
                  stroke: '#000000',
                },
              }}
            >
              <p className="number">T{numero}</p>
              <p className="number-max">
                {personnes.length} / {nbMax}
              </p>
              <p className="nom-table">{nom}</p>
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
              <i className="bi bi-chevron-right" />
            </div>
          </CustomMenuItem>
          {/* <CustomMenuItem><a className="no-style" href={"/table/" + id + "/pdf"} target="_blank">Imprimer la liste des personnes</a></CustomMenuItem> */}
          <hr />
          <CustomMenuItem>
            <a className="no-style" href={`/table/${id}/edit`}>
              Editer la table
            </a>
          </CustomMenuItem>
          <div className="d-flex">
            <button
              style={{ fontSize: '14px' }}
              onClick={() =>
                window.confirm(
                  'Êtes vous sûr de vouloir supprimer cette table ?',
                ) && handleDelete()
              }
              className="btn btn-danger mx-auto"
              disabled={personnes.length > 0}
              type="button"
            >
              Supprimer la table
            </button>
          </div>
        </Menu>

        <Menu
          open={openSubMenu}
          onClose={handleMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={
            submenu.current !== null
              ? {
                  top: submenu.current.getBoundingClientRect().top - 8,
                  left: submenu.current.getBoundingClientRect().right,
                }
              : null
          }
          PaperProps={{
            style: {
              minWidth: '200px',
            },
          }}
        >
          <CustomMenuItem
            disabled={personnes.length >= nbMax}
            onClick={handleOpen}
          >
            Ajouter une personne
          </CustomMenuItem>
          <CustomMenuItem disabled={personnes.length >= nbMax}>
            {personnes.length >= nbMax ? (
              'Créer une personne'
            ) : (
              <a href={`/personne/new?table=${id}`} className="no-style-link">
                Créer une personne
              </a>
            )}
          </CustomMenuItem>
          <hr />
          <CustomMenuItem
            className="no-hover scrollable"
            style={{
              height:
                personnes.length > 0 ? `${personnes.length * 25.5}px` : '50px',
            }}
          >
            <div className="list-personne-scrollable">
              {personnes.length > 0 ? (
                personnes.map((personne, index) => (
                  <Personne key={index} personne={personne} />
                ))
              ) : (
                <p style={{ padding: '.25rem .5rem' }}>Aucune personne</p>
              )}
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
                {filteredPersonnes.length > 0 && (
                  <span className="badge bg-secondary ms-2">
                    {filteredPersonnes.length}
                  </span>
                )}
              </Typography>
              <input
                className="form-control me-2 w-50"
                type="search"
                placeholder="Rechercher une personne"
                aria-label="Rechercher"
                value={stringToSearch}
                onChange={handleSearch}
              />
            </div>
            <div className="mt-4 grid-search">
              {filteredPersonnes.length > 0
                ? filteredPersonnes.map((personne, index) => (
                    <SearchPersonne key={index} personne={personne}>
                      <button
                        type="button"
                        className={`btn btn-sm btn-add ${
                          addedPersonneId === personne.id
                            ? 'btn-success'
                            : 'btn-outline-primary'
                        }`}
                        onClick={() => handleAddPersonne(personne.id)}
                        disabled={addingPersonneId === personne.id}
                      >
                        {addingPersonneId === personne.id
                          ? 'Ajout...'
                          : addedPersonneId === personne.id
                            ? 'Ajouté'
                            : 'Ajouter'}
                      </button>
                    </SearchPersonne>
                  ))
                : debouncedSearch.length >= 2
                  ? 'Aucune personne ne correspond à votre recherche'
                  : 'Tapez au moins 2 caractères pour rechercher'}
            </div>
          </Box>
        </Modal>
      </>
    )
  )
}

function Personne({ personne: { prenom, nom, id, present } }) {
  return (
    <div className="d-flex align-items-center justify-content-between w-100 my-1 mx-0">
      <p className="m-0" style={{ color: present ? '#008000' : '#000000' }}>
        {prenom !== null ? prenom : null} {nom}
      </p>
      <a className="link-three-dots" href={`/personne/${id}/edit`}>
        <i className="bi bi-three-dots" />
      </a>
    </div>
  )
}

export default Table

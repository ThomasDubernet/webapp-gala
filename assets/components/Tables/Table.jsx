/* eslint-disable react/no-array-index-key */
import React, { useEffect, useRef, useState } from 'react'
import { Box, Menu, Modal, Typography } from '@mui/material'
import Draggable from 'react-draggable'

import { CircularProgressbarWithChildren } from 'react-circular-progressbar'
import { useGetMany } from '../../hooks'
import { Personne as SearchPersonne } from '../Search'
import { CustomMenuItem } from './tablesStyles'

function Table({ table, load, planSize, planRef }) {
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
  const handleClose = () => setOpen(false)
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
        : null
    )
  }

  /**
   * Tailles & positions
   */
  const [height, setHeight] = useState(null)
  const [positionPx, setPositionPx] = useState({ x: null, y: null })
  const [positionPercent, setPositionPercent] = useState({ x: posX, y: posY })

  /**
   * Personnes
   */
  const { items: allPersonnes, load: loadPersonnes } = useGetMany(
    `personnes?exists[table]=false`
  )
  const [filteredPersonnes, setFilteredPersonnes] = useState([])
  const [percentPresent, setPercentPresent] = useState(null)

  const handleSearch = (event) => {
    const { value } = event.target
    const result = allPersonnes.filter((personne) =>
      personne.fullname.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredPersonnes(result)
  }
  const pxToPercent = ({ x, y }) => {
    const percentX = parseFloat((x * 100) / planSize.width).toPrecision(6)
    const percentY = parseFloat((y * 100) / planSize.height).toPrecision(6)

    return { percentX, percentY }
  }
  const percentToPx = (percent, type) => {
    let number = 0
    switch (type) {
      case 'width':
        number = (percent * planSize.width) / 100
        break
      case 'height':
        number = (percent * planSize.height) / 100
        break
      default:
    }
    return number
  }
  const onWindowResize = () => {
    setLoading(true)
    setHeight(planSize.height * 0.0776)
    setPositionPx({
      x: percentToPx(positionPercent.x, 'width'),
      y: percentToPx(positionPercent.y, 'height'),
    })
    setLoading(false)
  }

  /**
   * API events
   */
  function handleDelete() {
    fetch(`/api/tables/${id}`, {
      method: 'DELETE',
    })
    setTimeout(() => {
      load()
    }, 1000)
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
    loadPersonnes()
    setHeight(planSize.height * 0.0776)
    setPercentPresent((table.personnes.length * 100) / table.nombrePlacesMax)
  }, [])

  useEffect(() => {
    setPositionPx({
      x: percentToPx(positionPercent.x, 'width'),
      y: percentToPx(positionPercent.y, 'height'),
    })
    window.addEventListener('resize', onWindowResize)
    setLoading(false)
  }, [positionPercent])

  useEffect(() => {
    allPersonnes.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.fullname = `${item.prenom} ${item.nom}`
    })
    setFilteredPersonnes(allPersonnes)
  }, [allPersonnes])

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
                // eslint-disable-next-line no-alert
                window.confirm(
                  'Êtes vous sûr de vouloir supprimer cette table ?'
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
          <CustomMenuItem className="no-hover scrollable">
            <div className="list-personne-scrollable">
              {personnes.length > 0 ? (
                personnes.map((personne, index) => (
                  <Personne key={index} personne={personne} />
                ))
              ) : (
                <p style={{ padding: '5px 10px' }}>Aucune personne</p>
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
              </Typography>
              <input
                className="form-control me-2 w-50"
                type="search"
                placeholder="Rechercher une personne"
                aria-label="Rechercher"
                onChange={handleSearch}
              />
            </div>
            <div className="mt-4 grid-search">
              {filteredPersonnes.length > 0
                ? filteredPersonnes.map((personne, index) => (
                    <SearchPersonne key={index} personne={personne}>
                      <a
                        className="btn btn-sm btn-outline-primary btn-add"
                        href={`/personne/${personne.id}/add_table/${id}`}
                      >
                        Ajouter
                      </a>
                    </SearchPersonne>
                  ))
                : 'Aucune personne ne correspond à votre recherche'}
            </div>
          </Box>
        </Modal>
      </>
    )
  )
}

function Personne({ personne: { prenom, nom, id, present } }) {
  return (
    <div className="d-flex align-items-center justify-content-between w-100 my-3 mx-0">
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

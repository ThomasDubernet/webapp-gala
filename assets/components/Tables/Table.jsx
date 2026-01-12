import React, { useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { CircularProgressbarWithChildren } from 'react-circular-progressbar'
import { X, ChevronRight, MoreHorizontal, Pencil, Loader2 } from 'lucide-react'
import { Personne as SearchPersonne } from '../Search'
import { useSearchPersonnes } from '../../hooks'
import { Modal, ModalHeader, ModalBody } from '../ui/modal'
import { Badge } from '../ui/badge'

function Table({ table, load, planSize: baseSize, planRef }) {
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
  const [percentPresent, setPercentPresent] = useState(null)
  const [addingPersonneId, setAddingPersonneId] = useState(null)
  const [addedPersonneId, setAddedPersonneId] = useState(null)
  const [hasAddedPersonne, setHasAddedPersonne] = useState(false)
  const [stringToSearch, setStringToSearch] = useState('')

  // Recherche côté serveur des personnes non assignées
  const {
    results: filteredPersonnes,
    loading: searchLoading,
    total: searchTotal,
    hasSearched,
    refresh: refreshSearch,
  } = useSearchPersonnes({
    searchQuery: stringToSearch,
    minChars: 2,
    unassignedOnly: true,
  })

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
        // Rafraîchir la liste des personnes non assignées
        refreshSearch()
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
            className="absolute rounded-full text-white z-[1] mb-6 cursor-move"
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
              <p className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold w-full text-center">
                T{numero}
              </p>
              <p className="absolute top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold w-full text-center">
                {personnes.length} / {nbMax}
              </p>
              <p className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-sm font-medium text-black text-center whitespace-nowrap">
                {nom}
              </p>
            </CircularProgressbarWithChildren>
          </div>
        </Draggable>

        {/* Context Menu */}
        {contextMenu !== null && (
          <div
            className="fixed inset-0 z-40"
            onClick={handleMenuClose}
          />
        )}
        {contextMenu !== null && (
          <div
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-48"
            style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
          >
            <button
              ref={submenu}
              type="button"
              onClick={handleSubMenuOpen}
              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center justify-between"
            >
              <span>Personnes</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <hr className="my-1 border-gray-200" />
            <a
              href={`/table/${id}/edit`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Editer la table
            </a>
            <div className="px-2 py-2">
              <button
                type="button"
                onClick={() =>
                  window.confirm(
                    'Êtes vous sûr de vouloir supprimer cette table ?',
                  ) && handleDelete()
                }
                className="w-full px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={personnes.length > 0}
              >
                Supprimer la table
              </button>
            </div>
          </div>
        )}

        {/* Submenu Personnes */}
        {openSubMenu && submenu.current && (
          <div
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-52"
            style={{
              top: submenu.current.getBoundingClientRect().top - 8,
              left: submenu.current.getBoundingClientRect().right + 4,
            }}
          >
            <button
              type="button"
              onClick={handleOpen}
              disabled={personnes.length >= nbMax}
              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter une personne
            </button>
            {personnes.length >= nbMax ? (
              <span className="block px-4 py-2 text-sm text-gray-400">
                Créer une personne
              </span>
            ) : (
              <a
                href={`/personne/new?table=${id}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Créer une personne
              </a>
            )}
            <hr className="my-1 border-gray-200" />
            <div className="px-2 py-1 max-h-40 overflow-y-auto">
              {personnes.length > 0 ? (
                personnes.map((personne, index) => (
                  <Personne key={index} personne={personne} />
                ))
              ) : (
                <p className="px-2 py-1 text-sm text-gray-500">Aucune personne</p>
              )}
            </div>
          </div>
        )}

        {/* Modal Ajouter Personne */}
        <Modal open={open} onClose={handleClose} size="4xl">
          <ModalHeader onClose={handleClose}>
            <div className="flex items-center gap-3">
              <span>Personnes non affectées</span>
              {searchTotal > 0 && (
                <Badge variant="secondary">{searchTotal}</Badge>
              )}
            </div>
          </ModalHeader>
          <ModalBody className="h-[60vh] overflow-hidden flex flex-col">
            <div className="mb-4">
              <input
                type="search"
                placeholder="Rechercher une personne"
                aria-label="Rechercher"
                value={stringToSearch}
                onChange={handleSearch}
                className="w-full md:w-1/2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1">
              {searchLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : filteredPersonnes.length > 0 ? (
                filteredPersonnes.map((personne, index) => (
                  <SearchPersonne key={index} personne={personne}>
                    <button
                      type="button"
                      className={`absolute bottom-3 right-3 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        addedPersonneId === personne.id
                          ? 'bg-green-600 text-white'
                          : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                      } disabled:opacity-50`}
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
              ) : hasSearched ? (
                <div className="col-span-full text-center text-gray-500 py-8">
                  Aucune personne ne correspond à votre recherche
                </div>
              ) : (
                <div className="col-span-full text-center text-gray-500 py-8">
                  Tapez au moins 2 caractères pour rechercher
                </div>
              )}
            </div>
          </ModalBody>
        </Modal>
      </>
    )
  )
}

function Personne({ personne: { prenom, nom, id, present } }) {
  return (
    <div className="flex items-center justify-between w-full py-1">
      <p className={`text-sm ${present ? 'text-green-600' : 'text-gray-900'}`}>
        {prenom !== null ? prenom : null} {nom}
      </p>
      <a
        href={`/personne/${id}/edit`}
        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </a>
    </div>
  )
}

export default Table

import React, { useEffect, useRef, useState, RefObject } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import { CircularProgressbarWithChildren } from 'react-circular-progressbar'
import { ChevronRight, MoreHorizontal, Loader2, Check } from 'lucide-react'
import { Personne as SearchPersonne } from '../Search'
import { useSearchPersonnes } from '../../hooks'
import { Modal, ModalHeader, ModalBody } from '../ui/modal'
import { Badge } from '../ui/badge'
import { apiPost, apiPatch, apiDelete } from '../../lib/api'
import type { Table as TableType, Personne as PersonneType } from '../../types/api'

interface PlanSize {
  width: number
  height: number
}

interface Position {
  x: number
  y: number
}

interface ContextMenuPosition {
  mouseX: number
  mouseY: number
}

type DragState = 'idle' | 'dragging' | 'saving' | 'saved'

interface TableProps {
  table: TableType
  load: () => void
  planSize: PlanSize
  planRef: RefObject<HTMLDivElement | null>
}

function Table({ table, load, planSize: baseSize, planRef }: TableProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const submenu = useRef<HTMLButtonElement>(null)
  const {
    id,
    nom,
    nombrePlacesMax: nbMax,
    numero,
    posX,
    posY,
    personnes = [],
    categorie,
  } = table

  const couleur = categorie?.couleur || '#6366f1'

  const [loading, setLoading] = useState(true)

  /**
   * Drag & Save state: 'idle' | 'dragging' | 'saving' | 'saved'
   */
  const [dragState, setDragState] = useState<DragState>('idle')
  const [previousPosition, setPreviousPosition] = useState<Position | null>(null)

  /**
   * Menus
   */
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null)
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
  const handleContextMenu = (event: React.MouseEvent) => {
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
  const [height, setHeight] = useState<number | null>(null)
  const [positionPx, setPositionPx] = useState<Position>({ x: 0, y: 0 })
  const [positionPercent, setPositionPercent] = useState<Position>({ x: parseFloat(posX), y: parseFloat(posY) })
  const [planSize, setPlanSize] = useState<PlanSize>(baseSize)

  /**
   * Personnes
   */
  const [percentPresent, setPercentPresent] = useState<number | null>(null)
  const [addingPersonneId, setAddingPersonneId] = useState<number | null>(null)
  const [addedPersonneId, setAddedPersonneId] = useState<number | null>(null)
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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStringToSearch(event.target.value)
  }

  const handleAddPersonne = async (personneId: number) => {
    setAddingPersonneId(personneId)

    try {
      const data = await apiPost<{ success: boolean; error?: string }>(`/personne/${personneId}/add_table/${id}`)

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
      alert(`Erreur: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setAddingPersonneId(null)
    }
  }

  const pxToPercent = ({ x, y }: Position) => {
    const percentX = parseFloat(((x * 100) / planSize.width).toPrecision(6))
    const percentY = parseFloat(((y * 100) / planSize.height).toPrecision(6))
    return { percentX, percentY }
  }

  const percentToPx = (percent: number, type: 'width' | 'height', size: PlanSize | null = null): number => {
    const useSize = size || planSize
    if (type === 'width') {
      return (percent * useSize.width) / 100
    }
    return (percent * useSize.height) / 100
  }

  const onWindowResize = () => {
    if (!planRef.current) return
    setLoading(true)
    setHeight(planRef.current.clientHeight * 0.0776)
    const size: PlanSize = {
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
    await apiDelete(`/api/tables/${id}`)
    load()
  }

  const handleStart = () => {
    setPreviousPosition({ ...positionPercent })
    setDragState('dragging')
  }

  const handleStopAsync = async (event: DraggableEvent, data: DraggableData) => {
    event.preventDefault()
    setDragState('saving')

    const { percentX, percentY } = pxToPercent({
      x: data.x,
      y: data.y,
    })

    try {
      const responseData = await apiPatch<TableType>(`/api/tables/${id}`, {
        posX: String(percentX.toFixed(2)),
        posY: String(percentY.toFixed(2)),
      })

      setPositionPercent({
        x: parseFloat(responseData.posX),
        y: parseFloat(responseData.posY),
      })
      setDragState('saved')
      setTimeout(() => setDragState('idle'), 1200)
    } catch (error) {
      // Rollback on error
      if (previousPosition) {
        setPositionPercent(previousPosition)
        setPositionPx({
          x: percentToPx(previousPosition.x, 'width'),
          y: percentToPx(previousPosition.y, 'height'),
        })
      }
      setDragState('idle')
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  // Wrapper to satisfy Draggable's type requirement (sync handler)
  const handleStop = (event: DraggableEvent, data: DraggableData) => {
    handleStopAsync(event, data)
  }

  useEffect(() => {
    setHeight(planSize.height * 0.0776)

    let personnesPresentes = 0
    personnes.forEach((personne) => {
      if (personne.present) {
        personnesPresentes += 1
      }
    })
    setPercentPresent((personnesPresentes * 100) / nbMax)
  }, [])

  useEffect(() => {
    setPositionPx({
      x: percentToPx(positionPercent.x, 'width'),
      y: percentToPx(positionPercent.y, 'height'),
    })

    let rafId: number | null = null
    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(onWindowResize)
    }

    window.addEventListener('resize', handleResize)
    setLoading(false)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
    }
  }, [positionPercent])

  return (
    !loading && (
      <>
        <Draggable
          nodeRef={nodeRef}
          defaultPosition={{
            x: positionPx.x,
            y: positionPx.y,
          }}
          bounds="parent"
          offsetParent={planRef.current || undefined}
          onStart={handleStart}
          onStop={handleStop}
        >
          <div
            ref={nodeRef}
            className={`absolute rounded-full text-white z-[1] mb-6 cursor-move transition-opacity duration-200 ${
              dragState !== 'idle' ? 'opacity-50' : 'opacity-100'
            }`}
            style={{
              background: couleur,
              width: `${height}px`,
              height: `${height}px`,
            }}
            onContextMenu={handleContextMenu}
          >
            <CircularProgressbarWithChildren
              strokeWidth={4}
              value={percentPresent || 0}
              styles={{
                path: {
                  stroke: 'oklch(var(--foreground))',
                },
              }}
            >
              <p className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold w-full text-center">
                T{numero}
              </p>
              <p className="absolute top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold w-full text-center">
                {personnes.length} / {nbMax}
              </p>
              <p className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-sm font-medium text-foreground text-center whitespace-nowrap">
                {nom}
              </p>
            </CircularProgressbarWithChildren>

            {/* Overlay loader/check */}
            {(dragState === 'saving' || dragState === 'saved') && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                {dragState === 'saving' && (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                )}
                {dragState === 'saved' && (
                  <div className="bg-green-500 rounded-full p-1 animate-bounce">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            )}
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
            className="fixed z-50 bg-popover rounded-lg shadow-lg border border-border py-1 min-w-48"
            style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
          >
            <button
              ref={submenu}
              type="button"
              onClick={handleSubMenuOpen}
              className="w-full px-4 py-2 text-sm text-left text-popover-foreground hover:bg-accent flex items-center justify-between"
            >
              <span>Personnes</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <hr className="my-1 border-border" />
            <a
              href={`/table/${id}/edit`}
              className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
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
                className="w-full px-3 py-1.5 text-sm font-medium text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="fixed z-50 bg-popover rounded-lg shadow-lg border border-border py-1 min-w-52"
            style={{
              top: submenu.current.getBoundingClientRect().top - 8,
              left: submenu.current.getBoundingClientRect().right + 4,
            }}
          >
            <button
              type="button"
              onClick={handleOpen}
              disabled={personnes.length >= nbMax}
              className="w-full px-4 py-2 text-sm text-left text-popover-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter une personne
            </button>
            {personnes.length >= nbMax ? (
              <span className="block px-4 py-2 text-sm text-muted-foreground">
                Créer une personne
              </span>
            ) : (
              <a
                href={`/personne/new?table=${id}`}
                className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
              >
                Créer une personne
              </a>
            )}
            <hr className="my-1 border-border" />
            <div className="px-2 py-1 max-h-40 overflow-y-auto">
              {personnes.length > 0 ? (
                personnes.map((personne, index) => (
                  <PersonneItem key={index} personne={personne} />
                ))
              ) : (
                <p className="px-2 py-1 text-sm text-muted-foreground">Aucune personne</p>
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
                className="w-full md:w-1/2 px-3 py-2 text-sm border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start overflow-y-auto flex-1">
              {searchLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredPersonnes.length > 0 ? (
                filteredPersonnes.map((personne, index) => (
                  <SearchPersonne key={index} personne={personne}>
                    <button
                      type="button"
                      className={`absolute bottom-3 right-3 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        addedPersonneId === personne.id
                          ? 'bg-green-600 text-white'
                          : 'border border-primary text-primary hover:bg-primary/10'
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
                <div className="col-span-full text-center text-muted-foreground py-8">
                  Aucune personne ne correspond à votre recherche
                </div>
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-8">
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

interface PersonneItemProps {
  personne: PersonneType
}

function PersonneItem({ personne: { prenom, nom, id, present } }: PersonneItemProps) {
  return (
    <div className="flex items-center justify-between w-full py-1">
      <p className={`text-sm ${present ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
        {prenom !== null ? prenom : null} {nom}
      </p>
      <a
        href={`/personne/${id}/edit`}
        className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </a>
    </div>
  )
}

export default Table

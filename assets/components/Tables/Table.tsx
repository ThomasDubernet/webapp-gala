import React, { useEffect, useRef, useState, RefObject } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import { CircularProgressbarWithChildren } from 'react-circular-progressbar'
import { MoreHorizontal, Loader2, Check, Users, UserPlus, Pencil, Trash2 } from 'lucide-react'
import { Personne as SearchPersonne } from '../Search'
import { useSearchPersonnes } from '../../hooks'
import { useDialogs } from '../../contexts/DialogContext'
import { Modal, ModalHeader, ModalBody } from '../ui/modal'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '../ui/context-menu'
import { apiPost, apiPatch, apiDelete } from '../../lib/api'
import { queryClient } from '../../lib/query-client'
import type { Table as TableType, Personne as PersonneType } from '../../types/api'

interface PlanSize {
  width: number
  height: number
}

interface Position {
  x: number
  y: number
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
  const { openPersonneDialog, openTableDialog } = useDialogs()
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
   * Modal for adding people
   */
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setStringToSearch('')
    if (hasAddedPersonne) {
      setHasAddedPersonne(false)
      load()
    }
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
        // Invalidate personnes cache
        queryClient.invalidateQueries({ queryKey: ['personnes'] })
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
    // Invalidate tables cache
    queryClient.invalidateQueries({ queryKey: ['tables'] })
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

  // React to planSize prop changes (e.g., when sidebar collapses/expands)
  useEffect(() => {
    if (baseSize.width !== planSize.width || baseSize.height !== planSize.height) {
      setPlanSize(baseSize)
      setHeight(baseSize.height * 0.0776)
      setPositionPx({
        x: (positionPercent.x * baseSize.width) / 100,
        y: (positionPercent.y * baseSize.height) / 100,
      })
    }
  }, [baseSize.width, baseSize.height])

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
        <ContextMenu>
          <Draggable
            nodeRef={nodeRef}
            position={{
              x: positionPx.x,
              y: positionPx.y,
            }}
            bounds="parent"
            offsetParent={planRef.current || undefined}
            onStart={handleStart}
            onDrag={(e, data) => {
              setPositionPx({ x: data.x, y: data.y })
            }}
            onStop={handleStop}
          >
            <div
              ref={nodeRef}
              className={`absolute rounded-full text-white z-10 mb-6 cursor-move transition-opacity duration-200 ${
                dragState !== 'idle' ? 'opacity-50' : 'opacity-100'
              }`}
              style={{
                background: couleur,
                width: `${height}px`,
                height: `${height}px`,
                top: 0,
                left: 0,
              }}
            >
              <ContextMenuTrigger className="block w-full h-full">
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
              </ContextMenuTrigger>
            </div>
          </Draggable>
          <ContextMenuContent className="w-56">
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Users className="h-4 w-4 mr-2" />
                Personnes
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-56">
                <ContextMenuItem
                  onClick={handleOpen}
                  disabled={personnes.length >= nbMax}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter une personne
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => openPersonneDialog(undefined, { tableId: id })}
                  disabled={personnes.length >= nbMax}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Créer une personne
                </ContextMenuItem>
                <ContextMenuSeparator />
                <div className="px-2 py-1 max-h-40 overflow-y-auto">
                  {personnes.length > 0 ? (
                    personnes.map((personne, index) => (
                      <PersonneItem key={index} personne={personne} onEdit={openPersonneDialog} />
                    ))
                  ) : (
                    <p className="px-2 py-1 text-sm text-muted-foreground">Aucune personne</p>
                  )}
                </div>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => openTableDialog(id)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editer la table
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() =>
                window.confirm('Êtes vous sûr de vouloir supprimer cette table ?') && handleDelete()
              }
              disabled={personnes.length > 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer la table
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

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
              <Input
                type="search"
                placeholder="Rechercher une personne"
                aria-label="Rechercher"
                value={stringToSearch}
                onChange={handleSearch}
                className="w-full md:w-1/2"
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
  onEdit: (id: number) => void
}

function PersonneItem({ personne: { prenom, nom, id, present }, onEdit }: PersonneItemProps) {
  return (
    <div className="flex items-center justify-between w-full py-1">
      <p className={`text-sm ${present ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
        {prenom !== null ? prenom : null} {nom}
      </p>
      <button
        type="button"
        onClick={() => onEdit(id)}
        className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  )
}

export default Table

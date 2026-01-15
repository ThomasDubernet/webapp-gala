import React, { useEffect, useRef, useState, RefObject, useReducer, useCallback } from 'react'
import Moveable from 'react-moveable'
import { MoreHorizontal, Loader2, Check, Users, UserPlus, Pencil, Trash2, Undo2, Redo2 } from 'lucide-react'
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
import { apiPatch, apiDelete, apiPost } from '../../lib/api'
import { queryClient } from '../../lib/query-client'
import type { Table as TableType, Personne as PersonneType, TableShape } from '../../types/api'

interface PlanSize {
  width: number
  height: number
}

type SaveState = 'idle' | 'saving' | 'saved'

interface TableProps {
  table: TableType
  load: () => void
  planSize: PlanSize
  planRef: RefObject<HTMLDivElement | null>
  isSelected: boolean
  onSelect: (id: number) => void
  editable: boolean
}

// Undo/Redo state management
interface TableState {
  posX: number
  posY: number
  width: number
  height: number
  rotation: number
}

interface UndoState {
  past: TableState[]
  present: TableState
  future: TableState[]
}

type UndoAction =
  | { type: 'SET'; state: TableState }
  | { type: 'PUSH'; state: TableState }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR' }

const MAX_HISTORY = 20

function undoReducer(state: UndoState, action: UndoAction): UndoState {
  switch (action.type) {
    case 'SET':
      return { past: [], present: action.state, future: [] }
    case 'PUSH':
      return {
        past: [...state.past.slice(-MAX_HISTORY + 1), state.present],
        present: action.state,
        future: [],
      }
    case 'UNDO':
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      }
    case 'REDO':
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      }
    case 'CLEAR':
      return { past: [], present: state.present, future: [] }
    default:
      return state
  }
}

// Helper to get CSS classes for table shapes
function getShapeStyles(shape: TableShape): { borderRadius: string } {
  switch (shape) {
    case 'circle':
    case 'oval':
      return { borderRadius: '9999px' }
    case 'rectangle':
      return { borderRadius: '0' }
    case 'rounded-rectangle':
      return { borderRadius: '0.5rem' }
    default:
      return { borderRadius: '9999px' }
  }
}

// Calculate opacity based on occupation rate
function getOccupationOpacity(current: number, max: number): number {
  if (max === 0) return 0.3
  const rate = current / max
  return 0.3 + (0.7 * rate)
}

function Table({ table, load, planSize: baseSize, planRef, isSelected, onSelect, editable }: TableProps) {
  const targetRef = useRef<HTMLDivElement>(null)
  const { openPersonneDialog, openTableDialog } = useDialogs()
  const {
    id,
    nom,
    nombrePlacesMax: nbMax,
    numero,
    posX,
    posY,
    shape = 'circle',
    width: initialWidth = '7.76',
    height: initialHeight = '7.76',
    rotation: initialRotation = '0',
    personnes = [],
    categorie,
  } = table

  const couleur = categorie?.couleur || '#6366f1'

  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [planSize, setPlanSize] = useState<PlanSize>(baseSize)

  // Parse initial values
  const initialPosX = parseFloat(posX)
  const initialPosY = parseFloat(posY)
  const initialW = parseFloat(initialWidth)
  const initialH = parseFloat(initialHeight)
  const initialRot = parseFloat(initialRotation)

  // Undo/Redo
  const [undoState, dispatchUndo] = useReducer(undoReducer, {
    past: [],
    present: {
      posX: initialPosX,
      posY: initialPosY,
      width: initialW,
      height: initialH,
      rotation: initialRot,
    },
    future: [],
  })

  // Pixel state for rendering - initialized with calculated values
  const [pxState, setPxState] = useState(() => ({
    x: (initialPosX * baseSize.width) / 100,
    y: (initialPosY * baseSize.height) / 100,
    width: (initialW * baseSize.width) / 100,
    height: (initialH * baseSize.height) / 100,
  }))

  // Modal for adding people
  const [open, setOpen] = useState(false)
  const [stringToSearch, setStringToSearch] = useState('')
  const [addingPersonneId, setAddingPersonneId] = useState<number | null>(null)
  const [addedPersonneId, setAddedPersonneId] = useState<number | null>(null)
  const [hasAddedPersonne, setHasAddedPersonne] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setStringToSearch('')
    if (hasAddedPersonne) {
      setHasAddedPersonne(false)
      load()
    }
  }

  // Search for unassigned people
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
        queryClient.invalidateQueries({ queryKey: ['personnes'] })
        refreshSearch()
        setAddedPersonneId(personneId)
        setTimeout(() => setAddedPersonneId(null), 1500)
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

  // Conversion helpers
  const pxToPercent = (px: number, dimension: 'width' | 'height') => {
    return (px / planSize[dimension]) * 100
  }

  const percentToPx = (percent: number, dimension: 'width' | 'height', size: PlanSize = planSize) => {
    return (percent * size[dimension]) / 100
  }

  // Minimum size: 3% of plan
  const minSizePx = Math.min(planSize.width, planSize.height) * 0.03

  // Update pixel state when percent state or plan size changes
  useEffect(() => {
    setPxState({
      x: percentToPx(undoState.present.posX, 'width'),
      y: percentToPx(undoState.present.posY, 'height'),
      width: percentToPx(undoState.present.width, 'width'),
      height: percentToPx(undoState.present.height, 'height'),
    })
  }, [undoState.present, planSize])

  // React to planSize prop changes
  useEffect(() => {
    if (baseSize.width !== planSize.width || baseSize.height !== planSize.height) {
      setPlanSize(baseSize)
    }
  }, [baseSize.width, baseSize.height])


  // Handle delete
  async function handleDelete() {
    await apiDelete(`/api/tables/${id}`)
    queryClient.invalidateQueries({ queryKey: ['tables'] })
    load()
  }

  // Save state to API with rollback on error
  const saveToApi = useCallback(async (state: TableState, previousState?: TableState) => {
    setSaveState('saving')
    try {
      await apiPatch<TableType>(`/api/tables/${id}`, {
        posX: String(state.posX.toFixed(2)),
        posY: String(state.posY.toFixed(2)),
        width: String(state.width.toFixed(2)),
        height: String(state.height.toFixed(2)),
        rotation: String(state.rotation.toFixed(2)),
      })
      setSaveState('saved')
      // Clear undo history after successful save (no unsaved changes)
      dispatchUndo({ type: 'CLEAR' })
      setTimeout(() => setSaveState('idle'), 1200)
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      // Rollback to previous state on error
      if (previousState) {
        dispatchUndo({ type: 'SET', state: previousState })
      }
      setSaveState('idle')
    }
  }, [id])

  // Undo handler
  const handleUndo = useCallback(() => {
    if (undoState.past.length === 0) return
    dispatchUndo({ type: 'UNDO' })
    const prevState = undoState.past[undoState.past.length - 1]
    saveToApi(prevState)
  }, [undoState.past, saveToApi])

  // Redo handler
  const handleRedo = useCallback(() => {
    if (undoState.future.length === 0) return
    dispatchUndo({ type: 'REDO' })
    const nextState = undoState.future[0]
    saveToApi(nextState)
  }, [undoState.future, saveToApi])

  // Calculate occupation
  const occupationCount = personnes.length
  const occupationOpacity = getOccupationOpacity(occupationCount, nbMax)
  const shapeStyles = getShapeStyles(shape)

  // Beforeunload warning
  useEffect(() => {
    if (undoState.past.length > 0) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault()
        e.returnValue = ''
      }
      window.addEventListener('beforeunload', handler)
      return () => window.removeEventListener('beforeunload', handler)
    }
  }, [undoState.past.length])

  return (
    <>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              ref={targetRef}
              onClick={() => editable && onSelect(id)}
              className={`absolute z-10 cursor-move transition-opacity duration-200 ${
                saveState !== 'idle' ? 'opacity-70' : 'opacity-100'
              }`}
              style={{
                left: pxState.x,
                top: pxState.y,
                width: pxState.width,
                height: pxState.height,
                transform: `rotate(${undoState.present.rotation}deg)`,
                backgroundColor: couleur,
                opacity: occupationOpacity,
                ...shapeStyles,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                userSelect: 'none',
                boxSizing: 'border-box',
              }}
            >
              {/* Table number centered */}
              <span className="text-xs font-bold">T{numero}</span>

              {/* Occupation badge */}
              <span className="text-[10px] font-medium mt-0.5 bg-black/30 px-1 rounded">
                {occupationCount}/{nbMax}
              </span>

              {/* Table name below */}
              {nom && (
                <span
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium text-foreground whitespace-nowrap"
                  style={{ transform: `translateX(-50%) rotate(-${undoState.present.rotation}deg)` }}
                >
                  {nom}
                </span>
              )}

              {/* Save overlay */}
              {(saveState === 'saving' || saveState === 'saved') && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/30"
                  style={shapeStyles}
                >
                  {saveState === 'saving' && (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  )}
                  {saveState === 'saved' && (
                    <div className="bg-green-500 rounded-full p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent className="w-56">
            {/* Undo/Redo only when selected and editable */}
            {isSelected && editable && (undoState.past.length > 0 || undoState.future.length > 0) && (
              <>
                <ContextMenuItem onClick={handleUndo} disabled={undoState.past.length === 0}>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Annuler
                </ContextMenuItem>
                <ContextMenuItem onClick={handleRedo} disabled={undoState.future.length === 0}>
                  <Redo2 className="h-4 w-4 mr-2" />
                  Rétablir
                </ContextMenuItem>
                <ContextMenuSeparator />
              </>
            )}

            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Users className="h-4 w-4 mr-2" />
                Personnes
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-56">
                <ContextMenuItem onClick={handleOpen} disabled={personnes.length >= nbMax}>
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

        {/* Moveable controls - only when selected and editable */}
        {isSelected && editable && (
          <Moveable
            target={targetRef}
            container={planRef.current}
            draggable={true}
            resizable={true}
            rotatable={true}
            bounds={{
              left: 0,
              top: 0,
              right: planSize.width - pxState.width,
              bottom: planSize.height - pxState.height,
              position: 'css',
            }}
            keepRatio={shape === 'circle'}
            rotationPosition="top"
            onDragStart={() => {
              // Store current state for undo
            }}
            onDrag={({ target, left, top }) => {
              target.style.left = `${left}px`
              target.style.top = `${top}px`
            }}
            onDragEnd={({ target }) => {
              const left = parseFloat(target.style.left)
              const top = parseFloat(target.style.top)
              const previousState = undoState.present
              const newState: TableState = {
                ...previousState,
                posX: pxToPercent(left, 'width'),
                posY: pxToPercent(top, 'height'),
              }
              dispatchUndo({ type: 'PUSH', state: newState })
              saveToApi(newState, previousState)
            }}
            onResize={({ target, width, height, drag }) => {
              const newWidth = Math.max(width, minSizePx)
              const newHeight = shape === 'circle' ? newWidth : Math.max(height, minSizePx)
              target.style.width = `${newWidth}px`
              target.style.height = `${newHeight}px`
              target.style.left = `${drag.left}px`
              target.style.top = `${drag.top}px`
            }}
            onResizeEnd={({ target }) => {
              const width = parseFloat(target.style.width)
              const height = parseFloat(target.style.height)
              const left = parseFloat(target.style.left)
              const top = parseFloat(target.style.top)
              const previousState = undoState.present
              const newState: TableState = {
                ...previousState,
                width: pxToPercent(width, 'width'),
                height: pxToPercent(height, 'height'),
                posX: pxToPercent(left, 'width'),
                posY: pxToPercent(top, 'height'),
              }
              dispatchUndo({ type: 'PUSH', state: newState })
              saveToApi(newState, previousState)
            }}
            onRotate={({ target, transform }) => {
              target.style.transform = transform
            }}
            onRotateEnd={({ target }) => {
              const transform = target.style.transform
              const match = transform.match(/rotate\(([-\d.]+)deg\)/)
              if (match) {
                const rotation = parseFloat(match[1])
                const previousState = undoState.present
                const newState: TableState = {
                  ...previousState,
                  rotation,
                }
                dispatchUndo({ type: 'PUSH', state: newState })
                saveToApi(newState, previousState)
              }
            }}
          />
        )}

        {/* Modal Ajouter Personne */}
        <Modal open={open} onClose={handleClose} size="4xl">
          <ModalHeader onClose={handleClose}>
            <div className="flex items-center gap-3">
              <span>Personnes non affectées</span>
              {searchTotal > 0 && <Badge variant="secondary">{searchTotal}</Badge>}
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
